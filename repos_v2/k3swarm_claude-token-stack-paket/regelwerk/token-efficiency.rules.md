# Token-effiziente Ausführung — Laufzeitregeln v3 (Paket-Fassung)

Kompaktfassung des Konzepts. Gedacht zum Ablegen als Referenzdatei, nicht in den Prefix.
Paket-Fassung: v3-Regeln + AUTOCOMPACT-Caveat + toonify-Pin + drittes Gesetz.

## Die drei Gesetze

1. **Genau ein mutierender Eigentümer pro Fläche.** Passende Hooks laufen parallel; zwei Bash-Rewriter oder zwei Output-Replacer sind nicht komponierbar. Müssen mehrere interne Regeln sequenziell laufen, registriere **einen** Dispatcher, der intern deterministisch sequenziert und genau ein Hook-Resultat erzeugt.
2. **Append-only schlägt Prefix-Rewrite.** Hooks, Skills, Commands, Agents, LSP-Server, Monitors und Themes invalidieren den Cache nie. MCP-Verbindungswechsel, Modellwechsel, CLAUDE.md-Änderungen und Built-in-Deny-Änderungen tun es. Ein API-Proxy muss den Cache-Write-Aufschlag erst verdienen, bevor er netto spart — ohne gepaarte Messung mit Cache-Read-/Creation-Werten ist seine Ersparnis eine Behauptung.
3. **Kein Werkzeug ohne gemessene Lieferfähigkeit.** 60-Tage-Aktivitätsregel, Lizenz-Gate wörtlich (kein PolyForm/AGPL/ELv2/lizenzlos im dienstlichen Default), nicht archiviert.

## Reihenfolge (nicht verhandelbar)

Prefix → native Deckel → Capability → ein Bash-Owner → ein Codeindex → Sitzungsgrenze → Verhalten → Messung.
Keine Stufe beginnt, bevor die vorherige gemessen ist.

## Prefix

- Skills, Plugins, Marketplaces und MCP-Server auf das tatsächlich Genutzte kürzen. Was im Prefix liegt, wird jede Runde abgerechnet.
- MCP-Server projektweise in `.mcp.json`, nie global. Ein Reconnect invalidiert den Prefix.
- Tool Search aktiv lassen: `ENABLE_TOOL_SEARCH` auf dem direkten Anthropic-Pfad **unset** (nativ Default); nie pauschal `false`.
- `deny`-Regeln für ungenutzte Built-in-Tools entfernen deren Definition vollständig aus dem Kontext.
- CLAUDE.md klein und **stabil** (< 200 Zeilen). Volatiles gehört in Skills und pfad-scoped Regeln. Compact reinjiziert Root + unscoped Rules — der 93k-Re-Injektionsfall (Issue #32057) ist der teuerste bekannte Prefix-Unfall.
- Injizierte Guidance gegen ihre tatsächliche Nutzung prüfen. Ungenutzte Guidance ist reiner Verlust (gemessen: 3,5k Tokens → 0/92 Aufrufe).

## Native Deckel

`MAX_MCP_OUTPUT_TOKENS=8000`, `BASH_MAX_OUTPUT_LENGTH=24000`,
`TASK_MAX_OUTPUT_LENGTH=12000`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=16000`,
`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=78` als Strings unter `env` setzen. Der
Bash-Deckel erreicht direkt, was eine Kompressionsleiter indirekt versucht.

**AUTOCOMPACT-Caveat:** `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` ist im settings-env
ggf. **wirkungslos** (bekannte Upstream-Issues). Fallback: als Shell-Export
setzen (`export CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=78` in ~/.zshrc/~/.bashrc) und
die Wirkung am Kompaktierungsverhalten verifizieren, bevor man sich auf den
Wert verlässt.

## Capability

- Hook-Unterstützung ist eine Laufzeiteigenschaft, keine Versionsannahme. Live prüfen nach jedem Update, bei Wechsel des Executables, spätestens alle 30 Tage.
- Besteht `PostToolUse.updatedToolOutput`: ein PostTool-Owner, Originalbefehl und native Permission-Prüfung bleiben unangetastet.
- Besteht nur `PreToolUse.updatedInput`: genau ein geprüfter Wrapper; schmal und deterministisch vor breitem Monolith.
- Besteht keiner: keine Behauptung transparenter Ersparnis. Expliziter Pipe- oder MCP-Reducer.
- **Achtung Shadow-Falle:** ein `auto`-Modus ohne bestandenen Live-Probe läuft still wirkungslos weiter. Ergebnis ablegen oder Modus explizit setzen.

## Retrieval-Leiter

1. Bekannte Datei, bekanntes Symbol, höchstens drei Dateien → native `Read`/`Grep`/`Glob` mit engen Pfaden, `offset`, `limit`, Patterns.
2. Unbekannte Zuständigkeit, Architektur, Call-Pfade, Impact → **genau ein** konfigurierter Codeindex.
3. Nur den ausgewählten Ausschnitt laden. Index abfragen und danach doch alle Dateien lesen vernichtet den Gewinn.
4. Externe Massendaten (große Webseiten, externe MCP-Ausgaben, API-Batches, große Logs) in eine Sandbox; native Bash/Read/Grep/Glob-Ownership dort ausschließen.
5. Dauerhafte Erkenntnisse plus **einen** ausführbaren nächsten Schritt in `.claude/TASK-STATE.md` sichern, dann den Explorationskontext löschen oder kompaktieren.

## Ausgabe-Leiter

1. **Exakt:** Fehler, nicht-leeres stderr, Patches, Migrationen, Security-Scans, IaC-Pläne, Krypto-Ausgabe, null-delimited Daten, `# token-raw` — unverändert außer Secret-Redaction.
2. **Verlustfrei säubern:** ANSI und Fortschrittsrauschen entfernen, byte-identische Wiederholungen zählen. IDs, Pfade, Reihenfolge, Counts und Exitstatus bleiben.
3. **Kommandobewusst reduzieren:** Fehler, Assertions, Summary, geänderte Dateien, Zeilennummern, Commit-Hashes und Sektionssemantik erhalten.
4. **Budgetierte Auslassung:** nur wenn die exakte strukturierte Originalantwort lokal archiviert und deterministisch abrufbar ist. Footer nennt Referenz, Reduktion und Transformation.
5. **Kein Archiv, kein Verlust:** ohne Archivierbarkeit nur Redaction oder Durchreichen.
6. **Net-Win-Gate:** keine komprimierte Ausgabe, wenn die Ersparnis nach Footer-Overhead unter Byte- **und** Ratio-Schwelle liegt. Ein Kompressor darf eine Ausgabe nie vergrößern.
7. **Permission-Semantik:** PreTool-Wrapper ändern den ausgeführten Befehl. Statische `deny`/`ask`-Regeln für destruktive Operationen bleiben, `pipefail` erhalten, gefährliche Befehle nie automatisch wrappen.
8. **Ein Owner:** RTK, Snip, lowfat, OMNI, squeez, semtrim, quiet-bash und `bash-dump-guard` nie als simultane Bash-Hooks. Vergleich in getrennten Profilen, gepaart gemessen.

## Format-Regel (Fläche 8)

- **toonify-mcp nur mit Pin ≥ 0.8.2.** Frühere Versionen injizierten per
  `additionalContext` statt zu ersetzen → doppelte Tokens (Defekt U1, gefixt
  12.08.2026, 63,8 % reale Reduktion auf Read-JSON gemessen). Format-Pilot mit
  Shape-Gate: TOON/PAKT nur für Daten, deren Shape stabil bekannt ist.
- Strukturierte Kodierung im Default-Profil = `none`. Format-Nudges sind
  kumulativ klein und stehen nie über Lesbarkeit.

## Sitzungsgrenze

- Kosten wachsen quadratisch mit der Sessionlänge, weil jeder Token jede Runde neu abgerechnet wird. Ein Deckel macht daraus lineares Wachstum.
- Standard: TASK-STATE → `/clear` oder native Kompaktierung. Subagenten für Bulk-Reads (isoliertes Fenster).
- Eine frische, begrenzte Session mit gutem Zustandsdokument schlägt das wiederholte Komprimieren einer langen.
- Genau **ein** History-Owner, versionsgepinnt, mit Backup, mit Cache-Messung.
- Ladder-Stufen und Trigger: siehe `regelwerk/LADDER.md`.

## Antwort- und Arbeitsdisziplin

- Ein unverändertes teures Kommando nicht erneut ausführen, wenn ein gespeichertes Ergebnis, ein Diff oder eine gezielte Abfrage die Frage beantwortet.
- Aufgabe nicht wiederholen, unveränderte Ergebnisse nicht erneut ausgeben, Routine-Toolaufrufe nicht kommentieren, keine Fortschrittsberichte ohne Entscheidungsrelevanz.
- Implementation Ladder vor neuem Code: existieren? im Repo? Standardbibliothek? native Plattform? vorhandene Dependency? deklarativ? — dann die kleinste korrekte Fassung.
- Security, Datenintegrität, Accessibility, Kompatibilität, Migrationen, Tests und der Verification Contract stehen über jeder Kürzung.

## Messung

Drei Begriffe, nie vermischt: **Slice-Ersparnis** (lokal entfernte Bytes) → **modellsichtbare Ersparnis** (weniger im Request) → **End-to-End-Ersparnis** (abgerechnete Tokens über die ganze Aufgabe, inklusive Cache-Creation, Zusatzrunden, Retries, Recovery). Nur die dritte entscheidet.
Gepaarte Läufe, mindestens drei je Arm, Streuung ausweisen, Qualitätsgate vor Tokengate, Cache-Hit-Rate > 90 % als Invariante. Savings-Prozente aus verschiedenen READMEs werden nie addiert.
