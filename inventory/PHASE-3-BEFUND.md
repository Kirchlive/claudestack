# PHASE-3-BEFUND

**Ausgeführt:** 2026-08-13 · **Umfang:** AP-3.1 bis AP-3.8
**Zielpaket:** `claude-code-token-stack/` · **Grundlage:** `MERGE-MANIFEST.tsv` (99 Zeilen)

---

## Gate P3 — Kriterien einzeln

| Kriterium | Soll | Ist | Status |
|---|---|---|---|
| `config/context-surface-owners.json` schemavalide, je Fläche genau ein Owner | 1 Owner/Fläche | 16 Flächen, JSON valide, kein Feld `owner` als Liste, Pflichtfelder (`owner`, `alternatives`, `activation_gate`, `conflict_note`) überall vorhanden | ✅ |
| `rules/token-stack.md` < 3 KB | < 3072 B | **3035 B** (37 B Reserve) | ✅ |
| `templates/CLAUDE.md` ≤ 4 KB | ≤ 4096 B | **2414 B** (1682 B Reserve) | ✅ |
| `evidence/` enthält 34 Dateien + README | 34 + 1 | **34 + 1 = 35** | ✅ |
| `MERGE-MANIFEST.tsv` deckt jede bewegte Datei ab | lückenlos | 88 Dateien im Zielpaket, **null** außerhalb des Manifests, **null** unmaterialisiert | ✅ |
| *(nachgetragen)* `package.json` | Version 2.0.0, `files` vorhanden | **2.0.0**, 13 `files`-Einträge, `evidence/` ausgeschlossen | ✅ |

**Gate P3: erfüllt** — die letzte Zeile allerdings erst nach einer Nachprüfung von außen (P3-1). Das Gate des Plans führt für `package.json` kein Kriterium; es ist hier ergänzt, damit die Lücke nicht in Phase 4 wiederkehrt.

---

## Was gebaut wurde

| AP | Ergebnis |
|---|---|
| 3.1 | Träger kopiert; `package.json` auf **2.0.0**, `files`-Feld angelegt (13 Einträge inkl. `waves/` und `hooks/optional/`, ohne `evidence/`) — erst im zweiten Anlauf wirksam, siehe P3-1 |
| 3.2 | Die drei byteidentischen OPUS5-Paare aufgelöst — Wurzelkopien maßgeblich, `validate/`-Kopien entfallen. **Null Dubletten im gesamten Zielpaket** (Hash-Prüfung über alle 88 Dateien) |
| 3.3 | 34 Archivdateien nach `evidence/{gpt56,k3,k3/issues,opus5}/`; `evidence/README.md` neu geschrieben |
| 3.4 | Drei Owner-Registries → eine JSON mit 16 Flächen (Schlüsselmengen-Diff nach §1.4d) |
| 3.5 | Drei Regelwerke (1,4 K + 7,6 K + 5,4 K) → ein `rules/token-stack.md` mit 3,0 K |
| 3.6 | `templates/CLAUDE.md` aus GPT-Fassung + Compact-Block + Ladder-Verweis aus K3 |
| 3.7 | `WAVE-STATE.md` geleert und auf eigenen Fortschritt umgestellt; `WAVE-INDEX.md` um Wave 00-0 und eine Warnung zu den Fremdwerten ergänzt |
| 3.8 | 12 verworfene Dateien nicht übernommen (Hash-verifiziert) |

Der Manifest-Lauf ist reproduzierbar: `inventory/apply-manifest.py` prüft jede Quelle gegen ihren SHA-256 aus dem Manifest und bricht bei Abweichung ab. 63 Dateien kopiert, 19 als Zusammenführung zurückgestellt, 17 lagen durch den Trägerkopie bereits identisch vor.

---

## Fail-loud-Befunde

**P3-1 — `files`-Feld existierte nicht, und die erste Bearbeitung ging verloren.** Zwei Befunde in einem:

*Zur Anweisung:* Der Plan (AP-3.1) sagt „`files`-Feld um `waves/` und `hooks/optional/` erweitern". Im Träger gibt es überhaupt kein `files`-Feld; es musste neu angelegt werden. Ohne diesen Schritt packt `npm pack` weiterhin alles ein — die Anweisung setzt einen Zustand voraus, der nicht vorlag. Angelegt mit elf Pfaden plus `MERGE-MANIFEST.tsv` und `SHA256SUMS.txt`; **`evidence/` ist bewusst ausgeschlossen**, es ist Archiv und wird im Betrieb nicht gelesen.

*Zum Ablauf:* Die Bearbeitung wurde zunächst **wirkungslos**, weil sie vor dem Manifest-Lauf erfolgte. `apply-manifest.py` prüfte lediglich, ob Ziel und Quelle byteidentisch sind, und wertete die bereits geänderte Datei als „noch zu kopieren" — die Quellfassung überschrieb sie. Der erste Bericht meldete das Feld deshalb als angelegt, während im Zielpaket weiter `0.1.0` ohne `files` stand. Aufgefallen ist es erst bei der Nachprüfung des Gates, nicht bei der eigenen Kontrolle: **Gate P3 hatte für `package.json` kein Kriterium**, und die Manifest-Abdeckungsprüfung vergleicht nur Pfadmengen, nicht Inhalte. Ein Kriterium, das niemand prüft, wird auch nicht erfüllt.

*Behoben:* `version` steht auf `2.0.0`, `files` ist vorhanden (13 Einträge, `jq -e '.version, .files'` liefert beide). `apply-manifest.py` überschreibt abweichende Zieldateien nicht mehr, sondern meldet sie als geschützt — sonst zerstört jeder Wiederholungslauf die redaktionelle Arbeit der Phasen 3–5. Der Kontrolllauf bestätigt es: drei geschützte Dateien (`package.json`, beide Waves), null Kopien, 88 Dateien unverändert.

*Übertragbar:* Reihenfolge ist bei diesem Vorgehen sicherheitsrelevant — erst materialisieren, dann redigieren. Und jede Prüfung, die nur Pfade vergleicht, übersieht inhaltliche Anpassungen vollständig.

**P3-2 — Byte-Deckel wurde beim ersten Entwurf verletzt.** `rules/token-stack.md` lag zunächst bei 3136 B, also 64 B über dem Deckel. Drei Kürzungsrunden bis 3035 B. Festgehalten, weil die verbleibende Reserve mit **37 Byte** knapp ist: jede weitere Regel erfordert eine Streichung an anderer Stelle. Der Deckel ist damit real bindend, nicht symbolisch.

**P3-3 — Basename-Prüfung erzeugt drei Falsch-Positive.** Eine Suche nach verworfenen Dateien über den Dateinamen meldet `DEFEKTE.md`, `KONZEPT-v5.md` und `judgments.json` als vermeintliche Verstöße. Ursache: die verworfene `validate/`-Kopie ist byteidentisch zur übernommenen Wurzelkopie, Name **und** Hash stimmen zwangsläufig überein. Auflösung nur über den Quellpfad. Für Phase 4/5 gilt: Prüfungen auf verworfene Artefakte müssen den Quellpfad führen, sonst schlagen sie bei jedem aufgelösten Dublettenpaar falsch an.

**P3-4 — Offene Pfadanpassung für AP-4.4.** `scripts/verify-package.mjs:36` führt `validate/06-incoming-reconciliation.md` als Pflichtdatei. Die Datei liegt jetzt unter `evidence/gpt56/06-incoming-reconciliation.md`; das Verzeichnis `validate/` existiert im Zielpaket nicht mehr. **Der Verifier schlägt in diesem Zustand fehl** — bewusst nicht in Phase 3 repariert, weil Code-Eingriffe zu Phase 4 gehören. Ebenfalls dort fällig: `expectedTestCount = 32` (Zeile 11) wächst mit den neuen Testfällen.

**P3-5 — 19 Zusammenführungen sind noch offen.** Acht Zielpfade beziehen Inhalt aus mehreren Quellen. Drei davon sind mit dieser Phase erledigt (Owner-Registry, Regelwerk, CLAUDE.md-Template). Die übrigen fünf sind terminiert, aber unerledigt:

| Zielpfad | offene Quellen | fällig in |
|---|---|---|
| `scripts/verify-package.mjs` | `k3swarm/verify-package.sh` (9 Semantik-Checks), `opus5/verify-stack.mjs` (Fail-loud-Block) | AP-4.4 |
| `hooks/optional/prefix-budget.mjs` | K3-Fassung liegt als Träger; OPUS-D1-Block zu portieren | AP-4.3 |
| `docs/REPO-MATRIX.md` | `kern-katalog.md`, `HINWEIS.md` | AP-5.1 |
| `scripts/repo-audit.py` | `scrape_issues2.py`, `scrape_issues3.py` | AP-5.5 |
| `docs/BENCHMARK.md` | `benchmark-harness.md` | AP-5.5 |

Bis dahin liegen diese Dateien als **unveränderte Trägerfassung** im Paket — sie sind nicht fertig, nur vorhanden.

---

## Was diese Phase bewusst nicht getan hat

Keine Eingriffe in `src/`, `bin/`, `tests/` oder die Hook-Implementierungen. Der Dispatcher ist unverändert die GPT56SOL-Fassung ohne Canary-Anbindung, ohne Deny-Gate-Grenze, ohne String-Normalisierung. `config/token-stack.default.json` steht weiterhin auf dem ausgelieferten Modus — die Umstellung auf `mode: "off"` gehört zur Code-Phase.

Die optionalen Hooks liegen in `hooks/optional/`, sind aber **nicht** registriert und tragen die Pfad- und Nudge-Budget-Defekte noch unverändert (AP-4.5).
