# Claude-Code-Token-Stack — Masterplan (Wave-Planung)

_Methodik nach Squeez-RTK-Ladder-Vorbild: WAVE-INDEX = Karte, Wave-Datei =
Arbeitsauftrag, MASTERPLAN = Zustand. Planungsdisziplin: **Endpunkt vor der
Messung festlegen**, Sperrkriterium Qualität, niemals k = 1, ≥ 3 Läufe je Arm,
Median gepaart statt Summen, Anomaliedatei Pflicht je Lauf, eingefrorenes
Korpus mit SHA vor/nach jedem Lauf, Antwortschlüssel deterministisch vorab._

## Current State

- **Paket gebaut und eigenverifiziert** (2026-08-13): alle Hooks `node --check`
  grün, 5/5 Self-Tests, hook-contract-smoke OK, test-guard-all 73/73,
  test-ladder 37/38 (einziger Fail = fehlendes rtk-Binary, dokumentierter
  Fail-open-Fall), `verify-package.sh` → „package verification: OK".
  Belege: `VALIDIERUNG.md` § Paket-Eigenprüfung.
- **Entscheidungsgrundlage validiert** (2026-08-13): 4-Wege-Abgleich
  (OPUS_V4 142/160 > GPT56 127 > KIMI 109 > K3 103), Zweitvalidierung mit
  1–100-Scores, T1–T9-Tokenrechnungen, Unstimmigkeiten U1–U9 aufgelöst.
- **Keine E2E-Nachmessung existiert.** Sie ist Wave 1 und hartes Gate —
  keine Annahme dieses Plans.

## Rollout-Gates (verbindlich, aus GPT56 + MANUS übernommen)

```
baseline → prefix_hygiene → retrieval → guards_shadow (≥ 1 Woche)
        → guards_enforce → session_and_external → proxies_or_memory
```

Jedes Gate: **Verlierer wird entfernt** (Rückbauplan vor Aktivierung),
kein Fortschritt ohne messbaren Net-Win bei gleicher Qualität.

## WAVE-INDEX

### Wave 0 — Paket-Annahme (keine Messung nötig)
- **Ziel:** verify-package.sh OK; install.sh in isoliertem HOME grün;
  settings-Merge idempotent; Execute-Bits; keine Nutzerpfade hartcodiert.
- **Abnahme:** „package verification: OK"; Installer-Smoke-Test bestanden.
- **Status:** SHIPPED 2026-08-13.

### Wave 1 — Baseline (Gate: baseline)
- **Ziel:** E2E-Baseline auf der eigenen Abrechnung. 10–20 reale Aufgaben
  aus dem Alltagsmix, unveraenderte Installation.
- **Endpunkt (vorab fixiert):** Median fresh input (uncached + cache_creation),
  output-Tokens, Turn-Zahl, Cache-Hit-Rate, Kosten/akzeptierte Aenderung.
- **Abnahme:** ≥ 3 Replikate je Aufgabenklasse, Streuung < 25 %, Anomaliedatei
  pro Lauf, Baseline-Tabelle in MESSPLAN.md ausgefuellt.
- **Stop-Regel:** ohne Baseline beginnt keine weitere Wave.

### Wave 2 — Prefix-Hygiene (Gate: prefix_hygiene)
- **Ziel:** Stufe 0 umsetzen: prefix-budget-Befund abarbeiten, CLAUDE.md aus
  Template, MCP projektlokal, Deny-Regeln, Guidance-Nutzung pruefen.
- **Endpunkt:** `/context`-Vorher/Nachher (gleiche Aufgabe), Prefix-Tokens
  pro Session, Skill-Listing-Budget. Erwartung: T1-Richtwert ~7.586 Tokens
  (mit Memory-Verzicht ~14.086) — eigener Wert ersetzt die Schaetzung.
- **Abnahme:** Prefix sinkt messbar; 100-Token/Skill-Wert gegen `/context`
  kalibriert (erster PROVISIONAL → MEASURED); keine Qualitaetsveraenderung.
- **Stop-Regel:** sinkt der Prefix nicht oder bricht die Cache-Hit-Rate
  unter 90 %, werden die Aenderungen einzeln zurueckgebaut, nicht „optimiert".

### Wave 3 — Native Deckel + Capability (Teil von prefix_hygiene)
- **Ziel:** Stufe-1-Env gesetzt und Wirkung verifiziert; Canary-Probe gelaufen;
  AUTOCOMPACT-Caveat aufgeloest (settings-env vs. Shell-Export).
- **Endpunkt:** BASH_MAX_OUTPUT_LENGTH-Kopplung (Guard --status), Canary-Record
  vorhanden und frisch, AUTOCOMPACT-Wirkung am Kompaktierungsverhalten belegt.
- **Abnahme:** beide Pfade dokumentiert; bei Wirkungslosigkeit steht der
  Shell-Export-Fallback und ist verifiziert.

### Wave 4 — Retrieval (Gate: retrieval)
- **Ziel:** genau ein Codeindex (codegraph, bedingt ab ~300 Dateien) gegen
  nativen Grep/Glob-Baseline-Arm. Anti-Pattern „Index + Volllesen" ausgeschlossen.
- **Endpunkt:** fresh input + Tool-Calls auf Relationsfragen-Taskset,
  gepaart ≥ 3 Replikate; Qualitaetsgate (Antwortschluessel) vor Tokengate.
- **Abnahme:** Index gewinnt auf Relationsfragen oder fliegt raus
  („Verlierer wird entfernt"). Kein zweiter Retriever parallel.

### Wave 5 — Guards im Shadow (Gate: guards_shadow, ≥ 1 Woche)
- **Ziel:** bash-dump-guard (auto/Shadow), read-context-guard,
  session-economy, ladder-ledger produktiv verdrahtet, aber nichts ersetzt.
- **Endpunkt (vorab):** 0 versteckte Fehler (fail-open-Eintraege im Log
  ausgewertet), Shadow-Messung der hypothetischen Einsparung, deny-once-
  Ausloesungen, Nudge-Trefferquote.
- **Abnahme:** eine volle Woche Schattenlauf ohne Blockade und ohne
  Qualitaetsbeschwerde; Metrik-Dateien ausgewertet und abgelegt.
- **Stop-Regel:** jeder versteckte Fehler setzt die Woche zurueck.

### Wave 6 — Guards scharf + A/B Bash-Owner (Gate: guards_enforce)
- **Ziel:** Ersetzungspfad aktiv (nach bestandenem Canary); gepaarter A/B
  bash-dump-guard vs. squeez vs. nativer Kontrollarm nach v5-Methodik.
- **Endpunkt:** Median gepaarte Differenz fresh input auf log-/test-/build-
  lastigem Taskset; non-inferior + materiell besser als Kontrolle;
  Qualitaetsgate (Tests gruen, keine Recovery-Calls).
- **Abnahme:** Net-Win > 0 bei gleicher Qualitaet, sonst bleibt der native
  Kontrollarm (Deckel + Gate) der Endzustand — das ist ein legitimes Ergebnis.
- **Erinnerung (T8):** Der Guard ist Katastrophenschutz, kein %-Hebel;
  der Net-Win-Gegenbeleg (2.001 vs. 1.719 Tokens) ist Teil der Abnahme.

### Wave 7 — Session, External, Pilots (Gates: session_and_external → proxies_or_memory)
- **Ziel:** Ladder-Stufen 1–3 aktiv (TASK-STATE-Vertrag, compact-plus-Pilot
  Stufe 2, Clear+HANDOFF), context-mode fuer externe Massendaten (ELv2
  geprueft), optional cache-fix bei gemessenem Fehler, toonify-mcp Format-
  Pilot (Pin ≥ 0.8.1). Proxys (llmtrim/tokdiet) und Memory nur nach
  Privacy-Review und nur bei API-Billing.
- **Endpunkt je Pilot:** eigener Arm, eigener Endpunkt vor Messung,
  Rollback-Pfad vor Aktivierung. Cache-Write-Aufschlag muss verdient sein
  (Gesetz II): gepaarte Cache-Read-/Creation-Werte Pflicht.
- **Abnahme:** Gesamt-E2E gegen Wave-1-Baseline: Profil A einstellig,
  Profil B 15–30 % Input — Abweichungen nach unten = Wave-Review.
- **Stop-Regeln (Net-Win):** Qualitaetsverlust, Cache-Hit < 90 %,
  Recovery-/Retry-Anstieg oder Lizenz-/Lieferfaehigkeitsbruch (Gesetz III)
  stoppen die betroffene Stufe sofort.

## Planungsdisziplin (aus dem v1-invalid-Unfall gelernt)

1. **Endpunkt vor der Messung** — nachtraeglich gewaehlte Endpunkte sind
   keine Messung (v1: +39,3 % auf Lauf-varianz gemessen).
2. **Eingefrorenes Korpus + SHA** vor/nach jedem Lauf; `chmod a-w`.
3. **Ein unterbrochener Lauf ist kein Datenpunkt** (Cache-Neuaufbau,
   Faktor 2 beobachtet). Zeitstempel-Laufnamen, keine Transkript-Wiederverwendung.
4. **Anomaliedatei Pflicht** je Lauf (AB-ANOMALIES.md-Muster).
5. **Antwortschluessel deterministisch vorab** berechnet und ausserhalb
   der Messflaeche abgelegt (ANSWERS-v5-Muster).
6. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0` in Messlaeufen.
7. **Messprotokoll fuehren:** Arm-Schalter veraendert selbst den Lesestoff —
   Messartefakte nie ins Korpus-Verzeichnis schreiben.

## Shipped (index)

- Wave 0 Paket-Annahme — 2026-08-13 (verify-package: OK)

## Nicht Ziele

- Keine Wiederbelebung abgesagter Werkzeuge (rtk, caveman, headroom, pxpipe/
  OmniGlyph, semtrim, token-optimizer, sqz, LLMLingua-2) ausser ueber die
  dokumentierten Re-Evaluierungs-Trigger (KONZEPT.md § 8).
- Kein globaler Memory-MCP als Default; keine Proxy-Ketten; hoechstens ein
  API-Proxy, nur API-Billing, nur nach Privacy-Review.
