# Benchmark- und Abnahmeplan für den Claude-Code-Token-Stack — Revision 3

**Stand:** 10. August 2026

## 1. Ziel

Nicht die stärkste Einzelkompression gewinnen lassen, sondern das Profil mit dem niedrigsten **End-to-End-Verbrauch pro qualitativ gleichwertig abgeschlossener Aufgabe** auswählen.

Die Revision-3-Messung trennt fünf Fragen:

1. Wie groß ist der reale Prefix-/Tooldefinitions-Anteil?
2. Helfen native Limits, bevor ein Drittanbieter eingreift?
3. Welcher einzelne Bash-/Read-Owner gewinnt?
4. Welches Retrieval-System reduziert Exploration ohne Recall-Verlust?
5. Wann ist eine Session-Grenze oder ein Proxy wirklich günstiger?

## 2. Unverhandelbare Versuchshygiene

- Ein Arm hat genau einen mutierenden Owner pro Oberfläche.
- Modell, Effort, Claude-Version, Commit, Worktree, Settings-Quelle und Berechtigungsmodus bleiben innerhalb eines Vergleichs identisch.
- Profile werden zwischen Sessions gewechselt; kein Plugin-Toggling innerhalb eines gemessenen Laufs.
- Jeder Lauf startet aus demselben Git-Stand. Änderungen werden danach verworfen.
- Cache-Zustand wird als `cold`, `warm-stable` oder `resume` vorgegeben und protokolliert.
- Reihenfolge randomisieren; möglichst drei Wiederholungen je Arm/Aufgabe.
- README-Prozentwerte werden nicht als erwarteter Zielwert verwendet.

## 3. Baseline- und Prefix-Arme

| ID | Profil | Zweck |
|---|---|---|
| P0 | Native Defaults | unveränderte Referenz |
| P1 | P0 + `prefix-budget` observer | Observer-Overhead und Inventurqualität |
| P2 | P1 + bereinigtes Skill-/Plugin-Profil | reale Wirkung von Prefix-Hygiene |
| P3 | P2 + verkürzte/stabile `CLAUDE.md`/Rules | Instruction-Hygiene |
| P4 | P3 + projektbezogene MCP-Konfiguration | MCP-/Tooldefinition-Wirkung |
| P5 | Token Optimizer audit-only | Vergleich der Auditdiagnose, keine Residency |

### Prefix-Abnahme

Vor und nach jeder Änderung erfassen:

- `/context`-Aufteilung,
- initiale und Folgeturn-Inputmenge,
- Cache Creation und Cache Read,
- Skill-Metadatenchars aus `prefix-budget`,
- enabled Plugins/MCPs,
- tatsächliche Skill-Nutzung,
- Task-Erfolg.

Die Hypothese „Prefix ist größter Einzelposten“ gilt erst als bestätigt, wenn P2–P4 gegen P0 reproduzierbar gewinnen.

## 4. Native-Limit-Arme

| ID | Profil |
|---|---|
| N0 | Gewinner aus Prefix-Armen, Native Defaults |
| N1 | N0 + `native-token-limits.example.jsonc` |
| N2 | N0 + nur `BASH_MAX_OUTPUT_LENGTH` |
| N3 | N0 + nur MCP/Task-Limits |
| N4 | N0 + nur frühere Compaction |
| N5 | N0 + nur Modell-Output-Limit |

So wird sichtbar, welcher Wert wirkt und welcher nur Quality-/Recovery-Kosten erzeugt.

## 5. Read-Arme

| ID | Profil |
|---|---|
| R0 | N-Gewinner, native Read |
| R1 | R0 + `read-context-guard` Slice-Regel |
| R2 | R0 + `read-context-guard` Reread-Regel |
| R3 | R0 + beide Regeln im Dispatcher |
| R4 | nestor-lean als integrierter Read-/Input-Owner |
| R5 | kmizu/token-saver als integrierter Owner |
| R6 | quiet-bash als integrierter Owner |

### Read-Testkorpus

- kleine bekannte Datei,
- 1.500-Zeilen-Datei, gesuchtes Symbol oben/mittig/unten,
- 4-MB-Datei oberhalb Hashbudget,
- identischer Whole-file-Reread,
- identischer Slice-Reread,
- Datei nach Edit erneut lesen,
- Datei mit unveränderter Größe, aber verändertem Inhalt,
- Read nach PreCompact-State-Invalidation,
- Binär-/Bild-/PDF-Read,
- bewusstes Escape-Valve.

Abnahme: keine falsche Reread-Unterdrückung; benötigte Informationen mit höchstens einem Escape-Call erreichbar.

## 6. Bash-/Output-Arme

Jeder Kandidat ist ein eigener Arm:

| ID | Owner |
|---|---|
| B0 | Native only |
| B1 | `bash-dump-guard.mjs` v3 |
| B2 | OMNI |
| B3 | Squeez |
| B4 | Snip |
| B5 | lowfat |
| B6 | RTK |
| B7 | semtrim |
| B8 | quiet-bash |
| B9 | nestor-lean |
| B10 | kmizu/token-saver |

**Verboten:** B2+B6, B4+B2 oder irgendeine andere gleichzeitige Kombination mutierender Bash-Owner.

### Bash-Testkorpus

- erfolgreicher sehr ausführlicher Testlauf,
- fehlgeschlagener Test mit langer Assertion/Stacktrace,
- Build mit Warnungen,
- Lint mit vielen Fundstellen,
- große `rg`-Suche,
- `git status`, `git log`, `git diff`,
- große homogene JSON-Ausgabe,
- heterogene JSON-/NDJSON-Ausgabe,
- Container-/Kubernetes-Enumeration,
- wiederholte unveränderte Befehlsausgabe,
- fast gleiche Ausgabe mit einer relevanten Änderung,
- Security-Scan,
- Migration/IaC-Plan,
- Native-Truncation-Marker,
- Secret in stdout,
- interrupted und nonempty stderr.

Abnahme: Failure-, Security-, Migration-, Patch- und stderr-Daten bleiben vollständig; OMNI-Ledger wird separat von Filter-Savings gemessen.

## 7. Retrieval-Arme

| ID | Profil |
|---|---|
| Q0 | native Grep/Glob/Read |
| Q1 | SigMap CLI als Broad-Owner |
| Q2 | CodeGraph als Broad-Owner |
| Q3 | codebase-memory-mcp als Broad-Owner |
| Q4 | Gewinner Q2/Q3 + SigMap nur `evidence`/`verify` |

### Repo-Klassen

- kleines TypeScript-Repo,
- mittleres Python-/Go-Repo,
- großes polyglottes Monorepo,
- Repo mit generiertem Code,
- Repo mit schwachen Symbolnamen,
- Architektur-/Route-/Impact-lastiges Repo.

### Retrieval-Aufgaben

- „Wo wird Authentifizierung entschieden?“
- „Welche Call-Chain führt vom Endpoint zur Persistenz?“
- „Welche Dateien müssen für Feature X geändert werden?“
- „Welche Tests decken die Änderung ab?“
- „Welche Symbole/Imports im Plan existieren wirklich?“
- „Welche Services sind vom Schemawechsel betroffen?“

Messwerte: Hit@k gegen menschlich verifizierte Golddateien, Tool-Calls, gelesene Bytes/Tokens, falsche Negatives, Task-Erfolg und Verify-Fundstellen.

## 8. Session-Boundary-Arme

| ID | Profil |
|---|---|
| S0 | Native long session |
| S1 | `session-economy` advisory + Task-State |
| S2 | S1 + geplanter `/clear` |
| S3 | S1 + native compact |
| S4 | Magic Compact |
| S5 | clauditor audit-only |
| S6 | clauditor blocking/rotation |
| S7 | genau ein History-Proxy |

S6 und S7 sind erst zulässig, wenn S2/S3 das Problem nicht ausreichend lösen.

### Handoff-Qualität

Nach dem Schnitt muss ein unabhängiger Lauf beantworten können:

- aktuelles Ziel,
- bestätigte Fakten/Pfade/Symbole,
- Entscheidungen und Gründe,
- fehlgeschlagene Ansätze,
- Restarbeit,
- Verifikationsvertrag,
- nächste Aktion.

Der mechanische Auto-Checkpoint darf nicht allein als vollständiger Handoff gewertet werden.

## 9. Proxy-/Traffic-Arme

Genau einer pro Arm:

- Tokdiet,
- Headroom,
- TAMP,
- Rolling Context,
- pxpipe,
- llmtrim.

### Pflichtmessung

- providerseitige uncached input,
- cache creation,
- cache read,
- Cache-Hit-Quote,
- Requestgröße vor/nach Proxy,
- Response-/Reasoning-Output,
- task success,
- Recovery/Retrieval,
- p50/p95-Latenz,
- Proxyfehler und Bypass,
- Datenschutz-/Loggingpfad.

Ein Proxy gewinnt nicht allein durch kleinere Requests; er muss die tatsächliche Cache-/Kostenbilanz gewinnen.

## 10. Gemeinsamer Aufgabenmix

Mindestens 36 reproduzierbare Aufgaben:

- 5 kleine Ein-Datei-Änderungen,
- 5 unbekannte Bug-Lokalisierungen,
- 4 Architektur-/Call-Path-Fragen,
- 4 Testfehler mit langen Traces,
- 3 erfolgreiche verbose Testläufe,
- 3 Build-/Lint-Läufe,
- 3 große Search-/JSON-Aufgaben,
- 2 Patch-Reviews,
- 2 Security/Migration/IaC-exakte Aufgaben,
- 2 Cross-session-Handoffs,
- 1 sehr lange Session mit Compact,
- 2 Wiederholungs-/Dedup-Aufgaben.

## 11. Messwerte pro Lauf

- uncached input tokens,
- cache creation tokens,
- cache read tokens und Quote,
- output/reasoning tokens,
- aktive Kontextgröße,
- Tool-Calls je Tool,
- wiederholte Calls,
- Raw-/Rewind-/Recovery-Calls,
- Modell-/Proxy-/lokale Kosten,
- Wall-Clock, p50/p95,
- Hook-Laufzeit,
- Datenbank-/State-Wachstum,
- Test-/Build-Ergebnis,
- fachliche Korrektheit und Vollständigkeit,
- verlorene Zeilen/Fakten,
- Halluzinationen,
- Benutzerinterventionen.

## 12. Normalisierte Kennzahlen

```text
Task Cost        = tatsächliche Kosten bis verifizierter Abschluss
Token E2E        = alle Input- + Cache-Creation- + Output-Tokens
Recovery Rate    = Recovery-/Wiederholungs-Calls / Tool-Calls
Quality Score    = Goldantwort/Test/Review-Rubrik
Prefix Delta     = stabiler Start-/Folgeturn-Input vs Baseline
Dedup Yield      = vermiedene Wiederholungsbytes / dedup-fähige Bytes
Cache Efficiency = cache_read / (cache_read + cache_creation + uncached_input)
```

Komponenten dürfen zusätzlich eigene Byte-Savings berichten; diese sind Diagnostik, nicht Siegerkennzahl.

## 13. Stop-Gates

Arm sofort stoppen, wenn:

- Security-, Migration-, Patch- oder Failure-Information fehlt,
- Tests falsch als grün erscheinen,
- ein unveränderter benötigter Read ohne funktionierende Escape-Valve blockiert wird,
- Raw-/Rewind-Retrieval nicht deterministisch funktioniert,
- Cache Creation deutlich steigt, ohne E2E-Gewinn,
- Recovery-/Wiederholungsrate um mehr als 10 Prozentpunkte steigt,
- Task-Erfolg unter Baseline fällt,
- p95-Latenz das vorher festgelegte Budget überschreitet,
- zwei mutierende Owner dieselbe Oberfläche besitzen.

## 14. Auswahlregel

Ein Kandidat wird Produktionsprofil, wenn er über den repräsentativen Aufgabenmix:

1. mindestens Baseline-Qualität erreicht,
2. keine Exact-Safety-Verletzung hat,
3. einen reproduzierbaren E2E-Gewinn zeigt,
4. keine nachhaltige Cache-Verschlechterung erzeugt,
5. akzeptable Recovery und Latenz besitzt,
6. eine klar dokumentierte Ownership-/Rollback-Grenze hat.

Ergebnisse werden nach Repo-/Workloadklasse ausgewiesen. Ein universeller Sieger ist nicht vorausgesetzt.
