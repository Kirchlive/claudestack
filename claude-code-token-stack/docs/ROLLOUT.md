# ROLLOUT — Gate-Kette und Stop-Regeln

_Oberstes Gesetz: **keine Schicht ohne messbaren Net-Win** — der Verlierer jedes
Gates wird entfernt, nicht „behalten falls"._

> ## Verhältnis zu `waves/` — es gibt genau einen Fahrplan
>
> **Maßgeblich für Reihenfolge und Fortschritt ist
> [`waves/WAVE-INDEX.md`](../waves/WAVE-INDEX.md).** Dieses Dokument liefert die
> **Gate-Kriterien** — woran man erkennt, dass eine Stufe bestanden ist. Es
> liefert keinen konkurrierenden Terminplan.
>
> Der unten stehende 10-Wochen-Plan stammt aus einem Vorgängerpaket und ist als
> **Größenordnung** zu lesen, nicht als Zeitplan. Er enthält zwei Arten von
> Altlast, die beim Lesen zu übersetzen sind:
>
> | Nennung im Plan | Stand in diesem Paket |
> |---|---|
> | `bash-dump-guard` als Shadow-/Enforce-Kandidat | **nicht übernommen** — zweiter Bash-Output-Owner, verletzt Gesetz I. Der Kandidat ist `src/stack.mjs`. |
> | `ladder-ledger` im Shadow-Lauf | **nicht übernommen** — gemessen +9,6 % bzw. −0,3 %, Referenz unter `evidence/k3/` |
> | `context-mode`-Pilot in `session_and_external` (Woche 9) | **entfällt** — Elastic 2.0, für dienstliche Nutzung gesperrt (L-8). Die Fläche „externe Massendaten" bleibt unbesetzt; es gibt keinen freigabefähigen Bewerber. Das Gate ist ohne diesen Piloten zu passieren. |
> | `MASTERPLAN.md`, `KONZEPT.md` als Bezugsdokumente | **nicht im Paket** — Zustand steht in `waves/WAVE-STATE.md`, Messregeln in `docs/MESSPLAN.md`, Alternativen in `docs/REPO-MATRIX.md`. Die Originale liegen als Archiv unter `evidence/`. |
> | Wochenzählung W1–W7 | Wellenkennungen des Wave-Index verwenden |
> | „Paket installiert" als Eintritt in `baseline` | **falsch herum.** Die Baseline entsteht *vor* jeder Installation — siehe `CTS-MIG-000`. |
>
> Zwei Fahrpläne nebeneinander driften, und niemand merkt, welcher gilt. Wenn
> dieses Dokument und der Wave-Index sich widersprechen, gilt der Wave-Index.

## Gate-Kette (nicht verhandelbar, Reihenfolge)

```
baseline → prefix_hygiene → retrieval → guards_shadow (≥ 1 Woche)
        → guards_enforce → session_and_external → proxies_or_memory
```

| Gate | Eintritt | Austritt (Abnahme) |
|---|---|---|
| baseline | Paket installiert, verify OK | Baseline-Tabelle gefüllt (≥ 3 Replikate/Klasse, Streuung < 25 %) |
| prefix_hygiene | baseline | Prefix-Tokens pro Session messbar gesunken (eigener Wert ersetzt T1-Schätzung); 100-Tok/Skill gegen /context kalibriert; Cache-Hit ≥ Baseline |
| retrieval | prefix_hygiene | Index gewinnt gepaart auf Relationsfragen ODER wird entfernt; kein zweiter Retriever |
| guards_shadow | retrieval | ≥ 1 Woche Schattenlauf, **0 versteckte Fehler** (fail-open-Logs ausgewertet), Shadow-Einsparung quantifiziert |
| guards_enforce | guards_shadow | A/B: non-inferior + materiell besser als Kontrollarm bei gleicher Qualität; sonst bleibt nativer Arm Endzustand |
| session_and_external | guards_enforce | Ladder-Stufen 1–3 (Druckstufen aus `docs/LADDER.md`) mit eigenem Net-Win je Arm. **Kein `context-mode`-Pilot** — ELv2-Sperre, Fläche bleibt unbesetzt (L-8) |
| proxies_or_memory | session_and_external | Privacy-Review bestanden; gepaarte Cache-Messung (Gesetz II) zeigt Net-Win; Rollback-Pfad geübt |

## 10-Wochen-Plan

> Die Spalte **Wave (Altkennung)** traegt die W-Nummern des Vorgaenger-`MASTERPLAN.md`.
> Dieses Dokument liegt **nicht im Paket** (nur als Archiv unter `evidence/opus5/`);
> massgeblich ist [`waves/WAVE-INDEX.md`](../waves/WAVE-INDEX.md). Die Spalte bleibt,
> damit aeltere Notizen zuordenbar sind (Befund D19/B-3).

| Woche | Wave (Altkennung) | Inhalt | Gate am Ende |
|---|---|---|---|
| 1 | W1 | Baseline-Messung (10–20 reale Aufgaben, unveränderte Installation) | baseline |
| 2 | W2 | Prefix-Hygiene: prefix-budget-Befund abarbeiten, CLAUDE.md aus Template, MCP projektlokal, Deny-Regeln | prefix_hygiene (Teil 1) |
| 3 | W3 | Native Deckel setzen + Wirkung verifizieren; AUTOCOMPACT-Caveat auflösen; Canary-Probe | prefix_hygiene (Teil 2) |
| 4 | W4 | Retrieval-A/B (codegraph vs. nativ, Relationsfragen-Taskset) | retrieval |
| 5–6 | W5 | Guards im Shadow (~~bash-dump-guard auto~~ **→ `src/stack.mjs`**, read-context-guard, session-economy, ~~ladder-ledger~~ **entfällt, nicht übernommen**) — volle 5 Werktage × 2 | guards_shadow |
| 7 | W6 | Guards scharf; gepaarter A/B ~~bash-dump-guard~~ **`src/stack.mjs`** vs. squeez vs. Kontrolle (v5-Methodik) | guards_enforce |
| 8 | W7a | Ladder-Stufen 1–3 scharf (TASK-STATE-Vertrag, compact-plus-Pilot, Clear+HANDOFF) | session (Teil 1) |
| 9 | W7b | ~~context-mode-Pilot~~ **entfällt (ELv2, L-8)**; optional cache-fix bei gemessenem Cachedefekt, toonify-Pilot erst nach Audit (Pin ≥ 0.8.2) | session_and_external |
| 10 | W7c | Optional: Proxy-Pilot (llmtrim/tokdiet, nur API-Billing, nach Privacy-Review + Security-Audit); Gesamt-E2E gegen Woche-1-Baseline; Abschlussbericht | proxies_or_memory |

## Stop-Regeln (Net-Win, sofortig)

1. **Qualität:** Task-Erfolg, Tests oder Vollständigkeit fallen in irgendeinem
   Arm → Stufe stoppen, letzter bekannter guter Zustand.
2. **Cache:** Cache-Hit-Rate < 90 % oder Cache-Creation-Anstieg ohne
   Gegenwert → betroffene Änderung zurückbauen (Gesetz II).
3. **Recovery:** Anstieg von Retries, Rohabrufen aus dem Raw-Archiv,
   Nutzer-Eingriffen oder „nochmal lesen"-Calls → Kompressionsstufe lockern
   oder stoppen.
4. **Lieferfähigkeit:** Lizenzwechsel, Archivierung oder > 60 Tage Stillstand
   einer aktiven Komponente → Gesetz-III-Review, Ersatz aus der
   Alternativenspalte in [`REPO-MATRIX.md`](REPO-MATRIX.md) bzw. dem Feld
   `alternatives` in [`config/context-surface-owners.json`](../config/context-surface-owners.json).
5. **Security:** jedes Audit- oder CVE-Teilsignal (Vorbild tokdiet/rtk) →
   Komponente friert ein, bis die Prüfung abgeschlossen ist.

## Erwartungsmanagement (verbindlich kommunizieren)

- Profil A (kurz): **einstellige Prozentpunkte**. Wer mehr verspricht,
  misst auf dem falschen Nenner (T3).
- Profil B (lang): **15–30 % Input-Tokens** — aus Prefix, Session-Grenze und
  Cache, nicht aus Filtern.
- Der Bash-Guard ist **Katastrophenschutz** (T8): Er verhindert den
  200-KB-Unfall, er ist kein prozentualer Sparplan.
- Kein seriöser Gesamtprozentsatz ist vor der eigenen E2E-Messung ableitbar
  (Konsens aller vier Datensätze, T9).
