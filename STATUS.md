# STATUS — Umsetzung des Claude-Code-Token-Stacks

**Stand:** 2026-08-13 · **Plan:** `repos_v2/UMSETZUNGSPLAN-claude-code-integration.md` · **Spezifikation:** `repos_v2/CLAUDESTACK-FINALIZE.md`
**Dateien:** siehe `TREE.md`

| Kennzahl | Wert |
|---|---|
| Zielpaket (Entwicklung / Betrieb) | 94 / 97 Dateien |
| Tests | **43 / 43** |
| Verifier | **Exit 0** (70 Semantik-Checks) |
| Dispatcher-Modus | **`enforce`** — Net-Win belegt, Phase 7 entschieden |
| Canary | **`pass`**, gültig bis 2026-09-12 |
| Registrierte Mutatoren auf `PostToolUse:Bash` | **1** (Gesetz I) · auf `PreToolUse:Bash`: **0** |
| Defektregister | D1–D26 + Baumdefekte + GPT-Evidenzlücken |

Legende: ✅ erledigt · ⏳ offen · ⛔ bewusst nicht ausgeführt · 🟢 laufend

---

## Phase 0 — Baseline und Subtraktion · *teilweise*

| AP | Beschreibung | Status |
|---|---|---|
| 0.1 | Baseline-Messung `/context` mit fester Aufgabe | ⏳ nur interaktiv erhebbar, braucht den Nutzer |
| 0.2 | Plugin-Diät gegen 25 aktive Plugins | ✅ gegenstandslos — null aktivierte Plugins vorgefunden |
| 0.3 | Zweitmessung nach der Diät | ✅ gegenstandslos — nichts zu subtrahieren |
| 0.4 | Root-`CLAUDE.md` auf ≤ 4 KB | ✅ erfüllt — existiert nicht (0 B statt 8,4 KB) |
| 0.5 | Drei mutierende `PreToolUse:Bash`-Hooks auf einen reduzieren | ✅ erfüllt — null vorgefunden, Fläche frei |
| 0.6 | Deaktivierte Plugins auf laufende Shell-Hooks prüfen | ✅ gegenstandslos |
| — | Ist-Aufnahme, Token-Messung, Hook-Verifikation, Protokoll | ✅ `PHASE-0-PROTOKOLL.md` |

**Kernbefund:** 280 gemessene Token gegen 4.959 der Referenzmaschine. Risiko R-2 empirisch bestätigt — sämtliche Akzeptanzwerte des Korpus sind fremdmaschinenspezifisch.

---

## Phase 1 — Native env-Deckel · *gesetzt, nicht gemessen*

| AP | Variable | Wert | Status |
|---|---|---|---|
| 1.1 | `MAX_MCP_OUTPUT_TOKENS` | 8000 | ✅ gesetzt |
| 1.2 | `BASH_MAX_OUTPUT_LENGTH` | 24000 | ✅ gesetzt |
| 1.3 | `TASK_MAX_OUTPUT_LENGTH` | 12000 | ✅ gesetzt |
| 1.4 | `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | 16000 | ✅ gesetzt |
| 1.5 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | — | ⛔ `autoCompactEnabled: false` → wäre wirkungslos |
| 1.6 | `ENABLE_TOOL_SEARCH` | `true` | ⛔ nicht angefasst — steht in `~/.bashrc:163` (D14) |
| — | Wirkungsbeobachtung je Variable | | ⏳ entsteht erst im Betrieb |

**Entscheidung:** Die Deckel sind Teil der Baseline und bleiben bis Phase 7 unverändert. Backup und Revert-Weg je Variable in `PHASE-1-PROTOKOLL.md`.

---

## Phase 2 — Kollisionsinventur · *abgeschlossen*

| AP | Beschreibung | Status |
|---|---|---|
| 2.1 | Inventur über 112 Dateien: SHA-256, Dubletten, Kollisionen, Hook-Events, Mutationsart | ✅ `inventory/collision-inventory.tsv` |
| 2.2 | `MERGE-MANIFEST.tsv` — eine Zeile je übernommener Datei | ✅ 99 Zeilen |
| 2.3 | Konfliktliste bestätigen | ✅ 3 Dubletten · 7 Basename-Kollisionen · 3 Bash-Mutatoren |

**Bilanz exakt wie geplant:** 11 unverändert · 54 angepasst · 34 archiviert · 12 verworfen — **plus eine fünfte Kategorie**, weil `SHA256SUMS.txt` neu erzeugt wird und in keine der vier Plan-Kategorien passt.

---

## Phase 3 — Träger und Datenzusammenführung · *abgeschlossen*

| AP | Beschreibung | Status |
|---|---|---|
| 3.1 | Träger kopieren, Version 2.0.0, `files`-Feld erweitern | ✅ fiel beim Nachrechnen durch, nachgezogen |
| 3.2 | OPUS5-Baumdefekte bereinigen, Dubletten auflösen | ✅ |
| 3.3 | `evidence/` mit 34 Archivdateien + README befüllen | ✅ |
| 3.4 | Owner-Registry: drei Registries → eine JSON | ✅ 16 Flächen, je genau ein Owner |
| 3.5 | Regelwerk: drei → eines, unter 3 KB | ✅ 3.042 B (30 B Reserve zu 3.072) |
| 3.6 | `CLAUDE.md`-Template, harte Grenze 4 KB | ✅ 2.559 B |
| 3.7 | Waves übernehmen, `WAVE-STATE.md` leeren | ✅ |
| 3.8 | 12 verworfene Dateien nicht übernehmen | ✅ dreifach geprüft (Pfad, Hash, Inhaltssignatur) |

---

## Phase 4 — Code-Eingriffe · *abgeschlossen*

| AP | Beschreibung | Status |
|---|---|---|
| 4.1 | Dispatcher: Canary-Gate, Deny-Gate-Grenze, String-Normalisierung, Fail-open | ✅ fail-closed, bewusst **ohne** Abschalt-Flag |
| 4.2 | Canary-Probe: Ausgabepfad, `expiresAt`, Exit-Semantik | ✅ |
| 4.3 | `prefix-budget`-Duell: K3-Träger + D1-Fix aus OPUS portiert | ✅ Nachweis 0 vs. 6 Kollisionen auf identischem Input |
| 4.4 | Drei Verifier werden einer (zehn Punkte) | ✅ 70 Semantik-Checks |
| 4.5 | Optionale Hooks, gemeinsames Nudge-Budget, Kontrakttests | ✅ Fail-loud in drei Szenarien belegt |

**Schwerster Fund:** Die Kontrakttests prüften den Spawn-Status nie — **31 von 40 PASS-Zeilen galten einem Hook, den es im Paket gar nicht gibt.**

---

## Phase 5 — Doku, Evidenz, Prüfsummen · *abgeschlossen*

| AP | Beschreibung | Status |
|---|---|---|
| 5.1 | REPO-MATRIX um Dissens-Spalten und `stand`-Feld erweitern | ✅ |
| 5.2 | ADR-015, ADR-016, ADR-017 ergänzen | ✅ |
| 5.3 | Ein Defektregister statt zwei | ✅ D1–D26 + B1/B2 + G01–G10 |
| 5.4 | `judgments.json` / `scores100-v51.json`: `source_model`, Abdeckung | ✅ toonify 72 → 90,0 bei Abdeckung 0,8 |
| 5.5 | README, ARCHITECTURE, SECURITY, MIGRATION, BENCHMARK, WAVES, LADDER, MESSPLAN, ROLLOUT | ✅ |
| 5.6 | `settings.patch.json` gegen den echten Ist-Stand neu erzeugen | ✅ |
| 5.7 | `SHA256SUMS.txt` neu berechnen | ✅ bidirektional gegengeprüft |

---

## Zusatzarbeit — nicht im Plan vorgesehen

| # | Beschreibung | Status |
|---|---|---|
| Z1 | Unabhängige Abnahmeprüfung gegen C.3.1–C.3.11 und Zielbaum | ✅ 19 Befunde, 6 mit Substanz |
| Z2 | Behebung aller 19 Befunde | ✅ inkl. Gesetz-I-Verletzung im Wave-Index |
| Z3 | Lizenz-Ist-Aufnahme gegen L-8 | ✅ Elastic-2.0-Fence an der Datei bestätigt |
| Z4 | Referenzaufgabe für die Baseline erarbeiten | ✅ `BASELINE-REFERENZAUFGABE.md` |
| Z5 | Betriebsort `~/.claude/token-stack/` + `deploy.mjs` | ✅ idempotent, schützt Laufzeitzustand |
| Z6 | Schreibpfade bündeln — vier lagen außerhalb | ✅ |
| Z7 | Config-Suchpfad ins gebündelte Verzeichnis ziehen | ✅ D21 |
| Z8 | `ccusage` installieren (Konsens 92,5, fehlte) | ✅ v20.0.19, MIT |
| Z9 | Rauchtest definieren — der Plan ließ ihn offen | ✅ `scripts/smoke.mjs`, fünf Prüfpunkte |
| Z10 | Toolchain: Node 24.19.0 (nvm), Python 3.14.0 (uv) | ✅ |
| Z11 | **Zweite unabhängige Abnahme** — erstmals auch Betriebsort, Registrierung und Statusdokumente | ✅ 14 Befunde, 3 schwer |
| Z12 | Behebung aller 14 Befunde | ✅ inkl. neuer Verifier-Prüfung *Registry ↔ Fragment* |
| Z13 | **Zweite Aufgabenklasse** für Phase 6 (bash-lastig) vorbereitet | ✅ `messung/AUFGABENKLASSE-B.md`, Korpus eingefroren |
| Z14 | Messreihe: Leerlast, Baseline, Streuung beider Klassen | ✅ vier Läufe, `messung/` |
| Z15 | **Prefix-Fläche vermessen** — Ergebnis: existiert hier nicht | ✅ `messung/PREFIX-FLAECHE-BEFUND.md` |

---

## Phase 6 — Shadow-Messung · *läuft an*

| AP | Beschreibung | Status |
|---|---|---|
| 6.1 | Fragment erzeugen, prüfen, in `settings.json` übernehmen | ✅ übernommen, bestehende Hooks erhalten |
| 6.2 | Canary-Probe aus laufender Sitzung | ✅ beide Fähigkeiten `pass` |
| 6.3 | `ab-harness.sh` härten (Fail-loud, `quality_ok`) | ✅ sechs Szenarien gegengeprüft |
| 6.4 | Shadow-Periode im Alltag | 🟢 aktiv |
| 6.5 | Messprotokoll-Vorlage | ✅ `docs/MESSPROTOKOLL.template.md` |
| — | `/context`-Baseline | ⏳ **Blocker** — braucht den Nutzer |
| — | ≥ 3 gepaarte Replikate | ⏳ braucht mehrere Tage Betrieb |

---

## Phase 7 — Enforce-Entscheidung · *entschieden 14.08.2026*

**Ergebnis: Net-Win belegt, Dispatcher auf `enforce`.** Protokoll: `PHASE-7-ENTSCHEIDUNG.md`

| Nachweis | Wert |
|---|---|
| Kürzung auf qualifiziertem Aufruf | 9.650 B → 1.697 B = **82,4 %** |
| über die gesamte Bash-Last der Aufgabe | 15.318 B → 7.365 B = **51,9 %** |
| je Sitzung | ~1.988 Token = 5 % des Sitzungskontexts |
| Methode | **direkter Nachweis**, nicht Session-Vergleich — dieselbe Ausgabe einmal durch den Dispatcher, einmal nicht |
| Qualitätsgate | erfüllt: nur Tool-Ausgabe gekürzt, Recovery-Pfad geprüft, saliente Zeilen erhalten |
| Rückweg | Modus auf `shadow`, oder `rm -rf ~/.claude/token-stack/` + Fragment aus `settings.json` |

Der geplante gepaarte Session-Vergleich wurde **verworfen, nachdem er gemessen war**: Zwei identische Läufe streuen um 7,1 % (2.800 Token), ein zusätzlicher Suchlauf des Modells kostet mehr als die Kürzung einspart. Der direkte Nachweis hat Streuung null.

---

## Offene Punkte

| # | Punkt | Wer |
|---|---|---|
| 1 | `/context`-Baseline erheben — alles Nötige liegt in `BASELINE-REFERENZAUFGABE.md` | Nutzer |
| 2 | Wirkungsbeobachtung der env-Deckel (drei Symptome im Protokoll) | Nutzer, nebenbei |
| 3 | Beobachtung im Alltag: wie oft greift der Dispatcher wirklich (`~/.claude/token-stack/state/`) | Nutzer + Zeit |
| 3a | **Retrieval-Fläche** — `codegraph` liegt installiert und ungenutzt; direkter Nachweis wie beim Dispatcher möglich | offen, realistisch |
| 4 | **Canary läuft am 12.09.2026 ab** — danach automatische Herabstufung auf `shadow` | Kalendereintrag |
| 4 | *(erledigt)* Umbenennung zu `config/bash-pilot-reference.json` — nicht gelöscht, weil die Datei als Herkunftsanker in einem Semantik-Check hängt (D22) | ✅ |

---

## Das Muster über alle Phasen

Sechsmal fand sich eine Prüfung, die formal existierte und faktisch nichts prüfte:

| Fundstelle | Was nicht geprüft wurde |
|---|---|
| `tests/contract/test-guard-all.mjs` | Spawn-Status — 31 von 40 PASS galten einem fehlenden Hook |
| TAP-Parser in `verify-package.mjs` | Testzahl — `observed_count` war unter Node 24 immer `null` |
| `tests/cli.test.mjs` | neue Config-Sektionen — Vergleich gegen ein handgepflegtes Literal |
| `ab-harness.sh` | `quality_ok` — das Qualitätsgate existierte nur als Prosa |
| `loadConfig` | überhaupt nichts — die Funktion war ungetestet |
| `scripts/smoke.mjs` | das Fragment — am Betriebsort zeigte der Suchpfad ins Leere, der Punkt wurde übersprungen, der Lauf meldete weiter „BESTANDEN" (D23) |

Dazu drei Befunde, die keine Codeprüfung gefunden hätte: **Gesetz I war in der Dokumentation verletzt** (der Wave-Index wies den verworfenen dritten Dispatcher zur Registrierung an), **ADR-017 behauptete eine Verifier-Sperre, die nirgends implementiert war**, und **ein scharfes Fragment mit Entwicklungspfad lag unmarkiert im Repository** — wer es übernommen hätte, hätte einen zweiten Bash-Owner gehabt (D24). Die dritte Ausprägung derselben Sache: eine Gesetz-I-Verletzung, die nicht im Code steckt, sondern in dem, was jemand befolgen könnte.

Und die maßgebliche Owner-Registry beschrieb den laufenden Zustand falsch (D25) — beim Beheben kamen drei weitere Flächen zutage, die der Dispatcher belegt und die dort gar nicht standen. Der Verifier prüft das jetzt beidseitig gegen das Fragment.

Konsequenz, die jetzt für jede Härtung gilt: **Gegenprobe verlangen.** Eine Prüfung muss nachweislich rot werden, wenn man ihr den Prüfgegenstand entzieht. Grün allein ist keine Aussage.
