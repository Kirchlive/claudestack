# Claude Code Token-Minimierung 2026 — Revision 3

## Prefix-first, capability-gated und mit eindeutiger Surface-Ownership

**Stichtag:** 10. August 2026  
**Repository-Suchraum:** 228 deduplizierte öffentliche Repositories  
**Ausgangsbasis:** Revision 2, der ergänzende Gegenentwurf `token-stack-konzept-2026-08.md`, aktuelle Claude-Code-Dokumentation sowie gezielte Nachprüfung von OMNI, clauditor, SigMap und Token Optimizer.

---

## 1. Ergebnis in einem Satz

Der bestbegründete Zielstack beginnt **nicht** mit einem weiteren Kompressor, sondern mit gemessener Prefix-Hygiene, nativen Budgets und genau einem mutierenden Eigentümer pro Kontextoberfläche; erst danach werden Bash-Dedup, Code-Retrieval, Session-Rotation oder ein API-Proxy in getrennten A/B-Armen zugeschaltet.

```text
L0  Prefix messen und bereinigen
L1  native Tool-/Output-Budgets setzen
L2  genau ein Bash-/Read-Output-System
L3  Ausgabe- und Implementierungsdisziplin
L4  Session-Grenzen + mechanischer Checkpoint
L5  Compaction-/Resume-Vertrag
L6  genau ein breiter Code-Retrieval-Owner
L7  End-to-End-Messung
L8  optional genau ein Traffic-/History-Proxy
```

Die wichtigste Änderung gegenüber Revision 2 lautet:

> **Prefix-first ist eine Prüf- und Rollout-Priorität, noch keine bewiesene Rangfolge für den konkreten Rechner.**

Der ergänzende Entwurf identifiziert Prefix, Tooldefinitionen und Sitzungswachstum zu Recht als unterbeachtete Kostenquellen. Seine Hochrechnung `~290 Skills × ~100 Token` ist aber nicht belastbar genug für eine Produktionsentscheidung: Claude Code budgetiert die Skill-Metadaten dynamisch und lädt den vollständigen Skill-Inhalt erst bei Verwendung. Deshalb ersetzt Revision 3 diese Hochrechnung durch `prefix-budget.mjs`, reale `/context`-Vergleiche und Cache-Read/Cache-Creation-Messungen.

---

## 2. Evidenzmodell

| Marker | Bedeutung |
|---|---|
| **[OFFIZIELL]** | aktuelle Claude-Code-Dokumentation oder offizieller Vertrag |
| **[QUELLCODE]** | relevante Hook-/Adapter-/Implementierungsdatei geprüft |
| **[README]** | Projektbeschreibung gelesen; Claims bleiben Herstellerangaben |
| **[NUTZER-MESSUNG]** | im ergänzenden Konzept dokumentierte eigene Messung des Nutzers |
| **[PAKET-TEST]** | lokaler deterministischer Self-/Contract-/Installer-Test dieses Pakets |
| **[SCHLUSS]** | Architekturableitung aus mehreren Quellen; keine unabhängige Messung |
| **[HYPOTHESE]** | gezielt zu prüfende Annahme |

Selbstberichtete Prozentwerte werden nicht zu einer gemeinsamen Rangliste addiert. Ein Tool, das `90 %` einer einzelnen Ausgabe kürzt, kann end-to-end neutral oder teurer sein, wenn anschließend Recovery-Calls, zusätzliche Modellantworten, Cache-Creation oder Rework steigen.

**Verbindliche Zielgröße:**

> End-to-End-Tokens und Kosten pro erfolgreich abgeschlossener, qualitativ gleichwertiger Aufgabe.

---

## 3. Was das neue Konzept richtig erkennt

### 3.1 Wiederkehrender Prefix ist strukturell teuer

Claude Code sendet bei jeder Anfrage den bisherigen Kontext erneut. Prompt Caching reduziert den Preis stabiler Prefix-Abschnitte, beseitigt aber weder deren Cache-Read-Kosten noch die Kosten einer erneuten Cache-Erzeugung nach einer Invalidierung. Deshalb sind kleine, stabile `CLAUDE.md`-Dateien, bedarfsgeladene Skills, wenige aktive Plugins und projektbezogene MCP-Server eine sinnvolle Priorität. **[OFFIZIELL + SCHLUSS]**

### 3.2 Tool-Output ist ein überfülltes Feld

Ein großer Teil der gefundenen Repositories konkurriert um Bash-, Read-, Grep-, Log- oder JSON-Ausgaben. Die beste Kombination ist daher nicht „alle hintereinander“, sondern:

1. native Ausgabe begrenzen,
2. genau einen Runtime-Owner wählen,
3. dessen Recovery- und Qualitätskosten messen.

### 3.3 Dedup ist qualitativ etwas anderes als Kompression

OMNI, nestor-lean, kmizu/token-saver und mehrere neuere Projekte adressieren Wiederholungen: unveränderte Reads oder bereits gezeigte Zeilen werden nicht erneut vollständig gesendet. Das kann den quadratischen Effekt langer Sitzungen besser treffen als eine zweite semantische Sicht auf dieselbe frische Ausgabe. **[README]**

### 3.4 Session-Grenzen sind ein eigener Layer

`/clear`, ein kurzer Task-State und ein mechanischer Handoff können lange Sitzungen günstiger machen, ohne den API-Verkehr umzuschreiben. clauditor illustriert den Nutzen, ist mit seinem Blocking-Modus aber ein eigener Governance-Owner. Revision 3 übernimmt das Muster, nicht den Default-Blocker. **[README + SCHLUSS]**

### 3.5 CLI-Retrieval kann ohne dauerhafte MCP-Schemata arbeiten

SigMap kann als explizite CLI deterministische Signatur-/Evidence-Pakete erzeugen. Das macht es als Retrieval- oder Verifikationskandidat interessant. Es rechtfertigt aber nicht automatisch einen zweiten breiten Index neben CodeGraph oder codebase-memory-mcp.

---

## 4. Was korrigiert oder präzisiert werden musste

### 4.1 „290 Skills = 29.000 Tokens je Runde“ ist keine belastbare Rechnung

Aktuelles Claude Code führt Skill-Metadaten innerhalb eines dynamischen Budgets; niedrig priorisierte Beschreibungen können entfallen. Der Skill-Body wird erst geladen, wenn der Skill benutzt wird. Die Anzahl gefundener `SKILL.md`-Dateien ist deshalb weder die tatsächliche aktive Liste noch deren exakte Tokenmenge. **[OFFIZIELL]**

Revision 3 misst stattdessen:

- lokal entdeckte und nach Settings aktive Skill-/Command-Metadaten,
- `name-only`-/disabled-Overrides,
- das konfigurierte bzw. abgeleitete Metadatenbudget,
- Kandidaten für `CLAUDE.md` und Rules,
- enabled Plugins, bekannte Marketplaces und deklarierte MCP-Server,
- vor/nach-Messung mit `/context` und ccusage.

`prefix-budget.mjs` bezeichnet seine Tokenzahlen ausdrücklich als Schätzung und behauptet nicht, jede gefundene Datei werde geladen.

### 4.2 „Hooks sind kostenlos/cache-neutral“ ist zu grob

Hooks verändern nicht notwendigerweise den bereits gecachten Prefix; ihre hinzugefügten Inhalte werden aber in die Konversation aufgenommen und können in Folgerunden erneut anfallen. Ein Hook ist damit nicht automatisch kostenlos. Ein observer-only Hook ohne Ausgabe hat nahezu keinen Kontext-Overhead, ein `SessionStart.additionalContext` oder wiederholter Nudge dagegen schon. **[OFFIZIELL + SCHLUSS]**

Konsequenz:

- Prefix-Warnung höchstens einmal am SessionStart,
- Session-Economy standardmäßig als `systemMessage` nur für den Nutzer,
- keine permanente Vollinjektion von Dashboards, Repo-Maps oder Checkpoints,
- Hook-Metadaten und Prozesslatenz dennoch messen.

### 4.3 „Jeder Proxy zerstört den Cache“ ist ebenfalls zu grob

Ein Proxy kann cache-kompatibel sein, wenn er Requests deterministisch und prefix-stabil transformiert und die Provider-Cache-Semantik korrekt weitergibt. Er kann den Cache aber auch verschlechtern, wenn er frühere Prefix-Blöcke, Tooldefinitionen, History oder Marker volatil verändert. Bei Custom Gateways hängt die reale Cachewirkung vom Gateway ab. **[OFFIZIELL]**

Revision 3 klassifiziert Proxys daher als **Traffic-Owner mit unbekannter Cache-Ökonomie**, nicht pauschal als verboten. Zulassung nur nach gepaarter Messung von:

- uncached input,
- cache creation,
- cache reads und Hit-Quote,
- Output,
- Qualität,
- Recovery,
- Latenz.

### 4.4 `rtk + snip/lowfat + omni` ist kein sicherer Produktionsstack

Diese Komponenten besitzen überlappende Bash-Flächen. Je nach Host arbeiten sie über PreToolUse-Rewrite, Wrapper, Output-Replacement oder Plugin-Adapter. Claude Code kann mehrere passende Hooks ausführen; konkurrierende `updatedInput`-/`updatedToolOutput`-Entscheidungen bilden keine geordnete Kompressionsleiter. **[OFFIZIELL + QUELLCODE]**

Optimierte Form:

```text
A/B-Arm B1: RTK allein
A/B-Arm B2: Snip allein
A/B-Arm B3: lowfat allein
A/B-Arm B4: OMNI allein
A/B-Arm B5: Squeez allein
A/B-Arm B6: bash-dump-guard v3 allein
```

OMNIs Cross-Call-Ledger ist der interessante Differenzierungsfaktor. Es wird deshalb als eigener Dedup-/Memory-Arm getestet, nicht nach einen anderen Filter gehängt.

### 4.5 SigMap „zusätzlich zu CodeGraph“ braucht eine Scope-Grenze

Zwei breite Retrieval-Systeme können doppelt indexieren, zusätzliche Tools anbieten und unterschiedliche Antworten liefern. Zulässig sind zwei klar getrennte Varianten:

- **Variante A:** SigMap ist der breite Retrieval-Owner.
- **Variante B:** CodeGraph oder codebase-memory-mcp ist der breite Owner; SigMap wird nur explizit für `evidence`, `verify-plan`, `verify` oder einen reproduzierbaren Offline-Handoff verwendet.

Nicht zulässig: beide Systeme für dieselbe Architekturfrage „zur Sicherheit“ abfragen.

---

## 5. Das revidierte Kontextoberflächen-Modell

| ID | Oberfläche | Typische Kostenquelle | Eigentümerregel |
|---|---|---|---|
| **L0** | Prefix / Instruktionen | Systemprompt, `CLAUDE.md`, Rules, Skill-/Plugin-Metadaten | native Hygiene; `prefix-budget` beobachtet nur |
| **L1** | Tooldefinitionen | Built-ins, MCP-Schemata | Tool Search, ungenutzte Tools/MCPs aus; höchstens ein Tool-Gateway |
| **L2a** | Bash-Ergebnis | Tests, Builds, Logs, Git, Package Manager | genau ein Bash-Owner |
| **L2b** | Native Read/Grep/Glob | große Dateien, Wiederholungen, Trefferlisten | genau ein Native-Tool-Owner |
| **L2c** | externe Daten | Web, API, externe MCP-Batches | Context Mode oder anderer External-Data-Owner |
| **L3** | Modell-/Code-Ausgabe | Prosa, Scope-Creep, unnötige Dateien | kurze Stilregel + Build Ladder |
| **L4** | Session-Wachstum | früh erzeugte Payload wird in Folgeturns mitgeführt | Session-Economy + Task-State |
| **L5** | Compaction/Resume | verlorene Entscheidungen und Re-Exploration | mechanischer Checkpoint + autoritativer Task-State |
| **L6** | Code-Retrieval | breite Grep-/Read-Schleifen | genau ein breiter Index/Graph |
| **L7** | Messung | falsche Slice-Metrik | ein End-to-End-Messpfad |
| **L8** | API-/History-Traffic | Request-History, Provider-Cache, Proxy-Kompression | genau ein Proxy oder keiner |

**Architekturregel:** Eine Komponente darf mehrere Oberflächen besitzen, aber dann ist sie ein bewusst gewähltes integriertes Profil. Ihre überschneidenden Module werden deaktiviert oder die modularen Owner werden entfernt.

---

## 6. Empfohlener Produktionskandidat: „Prefix-first Safe“

### 6.1 L0 — native Hygiene + `prefix-budget`

1. Root-`CLAUDE.md` nur für dauerhaft gültige repo-weite Invarianten.
2. Fach- und Pfadregeln in scoped Rules.
3. Skills nicht nach Dateianzahl, sondern nach Metadatenbudget, Nutzung und Wirkung reduzieren.
4. Plugins in Funktionsprofile aufteilen; nicht benötigte Profile deaktivieren **zwischen**, nicht mitten in produktiven Messsessions.
5. MCP-Server möglichst projektbezogen und stabil betreiben.
6. `prefix-budget.mjs` als observer/advisory, nicht als automatischer Deinstaller.

`prefix-budget` ersetzt keine `/context`-Messung. Es liefert eine verursachergerechte lokale Inventur und markiert Unsicherheit.

### 6.2 L1 — native Limits als Pilot

Die mitgelieferte Datei `native-token-limits.example.jsonc` enthält einen konservativen Startarm:

```jsonc
{
  "env": {
    "ENABLE_TOOL_SEARCH": "auto",
    "MAX_MCP_OUTPUT_TOKENS": "8000",
    "BASH_MAX_OUTPUT_LENGTH": "24000",
    "TASK_MAX_OUTPUT_LENGTH": "16000",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "16000",
    "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "78"
  }
}
```

Diese Werte sind **keine universellen Optima**. Sie müssen gegen unveränderte Native-Defaults verglichen werden. Besonders `CLAUDE_CODE_MAX_OUTPUT_TOKENS` und frühere Compaction können Vollständigkeit, Reasoning und Rework beeinflussen.

### 6.3 L2a — Bash: `bash-dump-guard.mjs` v3 als modularer Kandidat

Eigenschaften:

- `PostToolUse` statt Command-Rewrite,
- Capability-Canary für die tatsächliche installierte Claude-Runtime,
- `auto` fällt ohne frischen passenden Canary-Pass auf Shadow zurück,
- failure-, interrupted-, stderr-, patch-, security-, migration-, IaC- und crypto-sensitive Ausgaben exact-by-default,
- Secret-Redaction unabhängig von der Kompressionsentscheidung,
- keine verlustbehaftete Ersetzung ohne privaten recoverable Raw-Archive-Pfad,
- Native-Truncation-Marker werden erkannt und nicht ein zweites Mal komprimiert,
- Ziel- und Hard-Budget werden aus demselben `BASH_MAX_OUTPUT_LENGTH` abgeleitet,
- End-to-End-Metriken bleiben von den Guard-eigenen Byte-Savings getrennt.

Die frühere Forderung, ein `RTK_BIN`-Problem im Guard zu lösen, trifft auf diesen Guard nicht zu: v3 ruft RTK nicht auf und heuristisiert keinen RTK-Pfad. RTK bleibt Filterquelle oder eigener A/B-Owner.

### 6.4 L2b — Read: ein Dispatcher für zwei Regeln

`read-context-guard.mjs` ist der einzige Pre-/PostToolUse-Owner für `Read` und sequenziert:

1. **Reread Guard:** identische Range, unveränderte mtime/size und bestätigter SHA-256-Digest → einmalige Denial mit Escape-Valve.
2. **Read Slice Guard:** Whole-File-Read über Zeilen-/Bytebudget → einmalige Denial mit Slice-/Search-/Retrieval-Hinweis.
3. **PostToolUse Recorder:** erfolgreicher Read wird pro Session und Range erfasst.
4. **PreCompact/SessionEnd:** State wird gelöscht, damit kein „bereits im Kontext“-Wissen Compaction überlebt.

Große Dateien oberhalb des Hash-Budgets werden standardmäßig **nicht** allein aufgrund von mtime/size dedupliziert. Das ist konservativer als eine scheinbar sichere, aber nicht verifizierte Wiederholungsunterdrückung.

### 6.5 L4/L5 — Session-Economy ohne Default-Blocker

`session-economy.mjs`:

- liest direkte Context-Werte, wenn vorhanden,
- sonst den letzten Transcript-Usage-Block,
- kennzeichnet das Verhältnis zum konfigurierten Fenster als Schätzung,
- schreibt einen privaten mechanischen Checkpoint,
- meldet Druckbänder standardmäßig nur per `systemMessage` an den Nutzer,
- blockiert nie,
- injiziert standardmäßig keinen Checkpoint in Claudes Kontext.

Der Checkpoint enthält nur mechanisch extrahierbare Daten: letzte Nutzeranfrage mit Secret-Redaction, aktuelle Dateien und Command-Familien. Entscheidungen, verworfene Ansätze und Verifikationsabsicht bleiben Aufgabe der kurzen `.claude/TASK-STATE.md`.

### 6.6 L6 — Retrieval-Auswahl

| Repo-Profil | Default |
|---|---|
| bekannte Änderung in höchstens drei Dateien | native Grep/Read-Slices |
| kleines/mittleres Repo, deterministische Map/Evidence erwünscht | SigMap CLI **oder** CodeGraph, messen |
| Architektur-/Call-Path-Fragen, kleine Tooloberfläche | CodeGraph |
| großes/polyglottes Monorepo, LSP/Routes/Impact/ADR erforderlich | codebase-memory-mcp |
| SigMap neben einem Graphen | nur `evidence`/`verify`, nicht breite Parallel-Exploration |

Nach breiter Exploration werden bestätigte Findings in `TASK-STATE.md` geschrieben; der Exploration-Payload bleibt nicht unnötig in der Implementierungsphase.

### 6.7 L2c — Context Mode nur mit Surface-Trennung

Context Mode ist für Web, externe MCPs, API-Batches und sehr große Logs stark, weil Rohdaten außerhalb des Hauptkontexts verarbeitet werden können. Im modularen Profil darf es Bash und lokale Read/Grep/Glob-Flächen nicht zusätzlich besitzen. Ist diese Konfiguration nicht sauber möglich, wird Context Mode als eigener integrierter A/B-Arm getestet.

---

## 7. Alternative integrierte Profile

### 7.1 OMNI-Dedup-Pilot

```text
Prefix observer + native limits
OMNI = alleiniger Bash-/Dedup-/RewindStore-Owner
kein RTK/Snip/Squeez/lowfat/bash-dump-guard Hook
kein zweiter Cross-session-Memory-Owner
Retrieval separat genau einmal
```

Zu messen:

- Anteil der Calls mit null Ersparnis,
- Ledger-Savings bei Wiederholungen,
- Retrieval-Calls auf RewindStore,
- SQLite-Wachstum und p95-Latenz,
- Wechselwirkung von Goal-/Memory-Injektion mit bestehender Governance.

### 7.2 Squeez-Turnkey

Squeez besitzt Bash, Native Tools, Dedup, Blob-Retrieval, Session-Memory und Persona. Deshalb entweder als integriertes Profil verwenden oder überlappende Funktionen deaktivieren. Nicht zusammen mit Guard, Read-Dispatcher oder einem zweiten Memory-System aktivieren.

### 7.3 Nestor-Lean

Stark für Read-Diff/Dedup, Code-/Markup-Maps, Bash, Web und MCP. Ebenfalls ein breiter Monolith. Seine explizite Compaction-Invalidation und recoverable Tee-Pfade sind wertvolle Referenzen; es ersetzt den modularen Read-/Bash-Stack.

### 7.4 kmizu/token-saver-plugin

Rust-basierter Guard-/Output-/Codemap-Monolith mit Read-/Write-/Grep-Regeln und Context-Nudges. Interessant für maximale integrierte Abdeckung, aber nicht zusätzlich zu den modularen Guards.

### 7.5 quiet-bash / semtrim / Snip / lowfat / RTK

Diese werden als **alternative alleinige Runtime-Owner** verglichen:

- quiet-bash: recoverable Spill, Prompt-/Read-/Output-Flächen,
- semtrim: konservativer deklarativer PreTool-Pipe-Wrapper,
- Snip: große YAML-Filterbibliothek,
- lowfat: schlanker Mehrlevel-Owner,
- RTK: sehr breite command-spezifische Filter.

### 7.6 Token Optimizer und clauditor zunächst audit-only

- Token Optimizer: einmaliger Struktur-/Prefix-/Compaction-Audit; keine Residency, solange Bash, Read, Memory, Nudge und Checkpoint kollidieren.
- clauditor: Report/Doctor/Session-Auswertung ohne Hooks; Blocking-Rotation nur als separater Arm.

### 7.7 Proxy-Arm

Genau einer von:

- Tokdiet,
- Headroom,
- TAMP,
- Rolling Context,
- Context Gateway,
- llmtrim,
- pxpipe für einen spezialisierten Modell-/Workload-Test.

Kein Proxy wird auf Basis seiner internen Kompressionsrate zugelassen. Er muss Cache-Read/Creation, Qualität und Recovery end-to-end gewinnen.

---

## 8. Konfliktmatrix

| Oberfläche | Kandidaten | Regel |
|---|---|---|
| Prefix-Audit | prefix-budget, Token Optimizer Audit, manuelle `/context`-Analyse | Observer kombinierbar; nur einer darf Settings automatisch ändern |
| Bash Command/Output | Guard, OMNI, Squeez, RTK, Snip, lowfat, semtrim, quiet-bash, tokf, token-saver, nestor-lean | **genau einer aktiv** |
| Native Read | read-context-guard, Squeez, lowfat, nestor-lean, token-saver, quiet-bash, Context Mode | **genau einer mutierend** |
| Cross-call Dedup | OMNI, Squeez, nestor-lean, token-crunch, token-saver | Bestandteil des gewählten Owners; kein zusätzlicher Nachfilter |
| Retrieval | SigMap, CodeGraph, codebase-memory, jCodeMunch, Entroly, claude-context | genau ein Broad-Owner; Verification-CLI eng erlaubt |
| External data | Context Mode, Headroom, Web-Cleaner | genau ein Owner pro Datenweg |
| Session boundary | session-economy, clauditor, Rolling Context, Magic Compact | advisory/mechanical Default; genau ein mutierender History-/Rotation-Owner |
| Cross-session memory | Claude-Mem, OMNI Memory, Squeez Memory, OpenContext, Mempalace | genau einer oder kurze Datei-State-Lösung |
| API traffic/history | Tokdiet, Headroom, TAMP, Rolling Context, pxpipe, llmtrim | genau einer oder keiner |
| Output style | kurze lokale Regel, Ponytail, Caveman, Scrooge | eine kurze Policy; Qualität vor Kürze |
| Measurement | native usage/context + ccusage; optional OTel/Sniffly | ein kanonischer Datensatz, weitere UIs nur lesend |

---

## 9. Compression Ladder v3

### C0 — Native pass

Unverändert lassen, wenn:

- bereits klein und dicht,
- Native-Limit bereits einen recoverable Truncation-Hinweis erzeugt hat,
- Fehler, Interruption oder nonempty stderr,
- Security, Migration, Patch, IaC, Kryptografie oder null-delimited Daten,
- Net-Gain unter Schwelle.

### C1 — Lossless clean

- ANSI/Control-Sequenzen entfernen,
- überschriebenen Progress auf letzten Stand reduzieren,
- Secrets redigieren,
- exakte konsekutive Wiederholungen kollabieren,
- JSON nur verlustfrei minifizieren.

### C2 — Command-specific deterministic

- Tests: Failures, Assertions, Summary und relevante Frames,
- Builds/Lint: Errors, Warnings, Datei:Zeile und Endstatus,
- Git Status/Log: Anweisungstext entfernen, Semantik erhalten,
- Search: nach Datei gruppieren und Budgets setzen,
- Install/Container: Progress und Wiederholungen entfernen.

### C3 — Recoverable elision

- Head/Tail + Salience,
- klare Elision-Marker,
- privater Raw-Archive-Key und Hash,
- keine lossy Ausgabe, wenn Archivierung scheitert.

### C4 — Structured encoding

PAKT/TOON/tabellarische Darstellung nur, wenn:

- Struktur homogen ist,
- exakte Werte erhalten bleiben,
- gemessener Net-Gain nach Header/Glossar positiv ist,
- der Decoder-/Retrieval-Vertrag im selben Owner liegt.

### C5 — Semantic/task-conditioned

Nur für sehr große, unstrukturierte, nicht exact-sensitive Daten und nur als eigener A/B-Arm, beispielsweise KRLabs Squeez oder ein lokaler Headroom-/LLMLingua-Pfad.

### C6 — Session boundary

Nach breiter Exploration:

1. `TASK-STATE.md` aktualisieren,
2. mechanischen Checkpoint sichern,
3. offene Verifikation notieren,
4. `/clear` oder Compact,
5. Implementierung mit kleinem aktivem Kontext fortsetzen.

---

## 10. Read-, Retrieval- und Build-Ladder

### Read-Ladder

1. Ist die Datei und relevante Range bereits im Kontext?
2. Reicht Grep/Glob für die Positionssuche?
3. Reicht ein Read-Slice?
4. Ist es eine breite Architektur-/Impact-Frage? Dann genau einen Retrieval-Owner nutzen.
5. Whole-file nur bei explizitem Bedarf; deny-once kann einmal bewusst wiederholt werden.

### Retrieval-Ladder

1. bekannte Datei/Symbol → native Tools,
2. unbekannte Zuständigkeit → ausgewählter Broad-Index,
3. benötigte Implementierung → nur exakte Symbol-/Zeilenspans lesen,
4. Plan/Antwort bei Bedarf mit SigMap `verify`/Evidence prüfen,
5. Findings persistieren und Exploration beenden.

### Build Ladder

Vor Code oder Dependency:

1. Muss es überhaupt existieren?
2. Existiert die Fähigkeit schon im Repository?
3. Reicht die Standardbibliothek sicher aus?
4. Reicht die native Plattform oder das Framework?
5. Reicht eine bereits installierte Dependency?
6. Reicht eine deklarative oder Ein-Zeilen-Lösung?
7. Implementiere die kleinste korrekte Fassung, die den Verifikationsvertrag erfüllt.

Die Ladder überstimmt nie Security, Datenintegrität, Accessibility, Backward Compatibility, Migrationen, Tests oder explizite Akzeptanzkriterien.

---

## 11. Neue und geänderte Dateien

### `prefix-budget.mjs`

- SessionStart observer/advisory,
- dynamisches Skill-Metadatenbudget,
- aktive/name-only/disabled Berücksichtigung,
- Kandidateninventur für `CLAUDE.md`, Rules, Plugins, Marketplaces und MCP-Deklarationen,
- private Snapshots,
- keine Settings-Mutation,
- Unsicherheiten im Report.

### `read-slice-guard.mjs`

- internes Modul,
- Byte-/Zeilenbudget,
- Multimedia-/Binär-Exemptions,
- deny-once mit bewusster Wiederholung.

### `reread-guard.mjs`

- internes Modul,
- exact-range State,
- mtime/size + SHA-256 bis zum Hashbudget,
- große ungehashte Dateien standardmäßig nicht dedupliziert,
- State-Invalidation bei Compaction/SessionEnd.

### `read-context-guard.mjs`

- alleiniger Read-Dispatcher,
- deterministische Reihenfolge Reread → Slice → Record,
- private per-session States,
- Fail-open und Self-Test.

### `session-economy.mjs`

- Transcript-/Hook-basierte Druckschätzung,
- private mechanische Checkpoints,
- Secret-Redaction,
- `systemMessage` statt Default-Kontextinjektion,
- kein Blocking.

### `bash-dump-guard.mjs` v3

- Budgets an `BASH_MAX_OUTPUT_LENGTH` gekoppelt,
- Native-Truncation-Erkennung,
- Capability-gated Replacement,
- exact-by-default und recoverable lossy transforms.

### Installer und Profile

- vollständige Shell-/PowerShell-Installer,
- Konflikthinweise,
- keine automatische `settings.json`-Fusion,
- native Limit-Beispieldatei,
- eindeutige Owner-Profile.

---

## 12. Rollout

### Phase 0 — Baseline

- aktive Settings, Hooks, Plugins, Skills, MCPs und Proxys exportieren,
- `/context`, usage und ccusage erfassen,
- mindestens zwölf repräsentative Aufgaben ohne neue Komponente laufen lassen.

### Phase 1 — Prefix-Audit

- `prefix-budget --report`,
- 20–40 offensichtlich ungenutzte Skills/Plugins in einem Profil deaktivieren,
- Claude neu starten,
- dieselben Tasks messen,
- Wirkung anhand realer Context-/Cache-Daten statt Dateizahl beurteilen.

### Phase 2 — Native Limits

Native-Default gegen `native-token-limits.example.jsonc` vergleichen. Stop-Gate bei Qualitätsverlust, mehr Recovery oder häufiger Re-Exploration.

### Phase 3 — Read-Guard

Shadow-/Testkorpus für Whole-file, Slices, unveränderte Rereads, geänderte Dateien, Compaction und Escape-Valve. Erst danach produktiv.

### Phase 4 — Bash-Owner

Guard v3, OMNI, Snip, lowfat, RTK und Squeez in getrennten Profilen. Nie zwei gleichzeitig.

### Phase 5 — Retrieval

SigMap CLI, CodeGraph und codebase-memory in getrennten Repo-Klassen. Erfolgsmetrik ist Task-Erfolg bei weniger Tool-Calls und Kontext, nicht Map-Kompressionsrate.

### Phase 6 — Session Boundary

session-economy advisory gegen Native-only; danach clauditor audit-only. Blocking oder History-Proxy nur bei nachgewiesenem Restproblem.

### Phase 7 — Quartalsaudit

- Claude-Version und Hook-Canary,
- offizielle Env-Variablen,
- Skill-/Tool-Search-Verhalten,
- Cache-Read/Creation,
- Repo-Maintenance und Lizenzen,
- Raw-Retention und Security,
- Benchmarkkorpus.

---

## 13. Abnahmekriterien

Ein Profil gewinnt nur, wenn:

- fachliche Erfolgsquote und Testresultat mindestens Baseline erreichen,
- keine Error-/Security-/Migration-/Patch-Information verloren geht,
- End-to-End-Input und/oder Kosten sinken,
- Cache-Hit-Quote nicht nachhaltig fällt,
- Recovery-/Wiederholungs-Calls nicht steigen,
- Modell-Output und Rework nicht den Input-Gewinn aufzehren,
- p95-Latenz vertretbar bleibt,
- Raw-/State-Recovery deterministisch funktioniert,
- genau ein mutierender Owner pro Oberfläche aktiv ist.

Der mitgelieferte Benchmarkplan definiert Vergleichsarme, Aufgabenmix, Messwerte und Stop-Gates.

---

## 14. Grenzen

- Die 228 Repositories sind eine umfangreiche Momentaufnahme, keine mathematisch vollständige Menge.
- Viele Prozentwerte sind Herstellerangaben.
- Die Nutzer-Messungen aus dem Gegenentwurf sind wertvolle lokale Evidenz, aber nicht automatisch auf andere Repos, Modelle oder Claude-Versionen übertragbar.
- `prefix-budget` kann lokale Dateien und Deklarationen zählen, aber nicht die exakte providerseitige Tokenisierung oder den tatsächlich gesendeten Systemprompt rekonstruieren.
- Hook-Verträge können dokumentiert sein und in einer konkreten Runtime dennoch regressieren; deshalb bleibt der Live-Canary Pflicht.
- Session-Usage aus Transkripten ist eine Schätzung, wenn kein direkter Context-Prozentsatz vorliegt.
- OMNI-, SigMap-, clauditor- und Token-Optimizer-Benchmarks wurden nicht in diesem Paket unabhängig reproduziert.

---

## 15. Primärquellen

### Offizielle Claude-Code-Dokumentation

- Prompt Caching: `https://code.claude.com/docs/en/costs`
- Hooks: `https://code.claude.com/docs/en/hooks`
- Skills: `https://code.claude.com/docs/en/skills`
- Environment Variables: `https://code.claude.com/docs/en/env-vars`
- MCP / Tool Search: `https://code.claude.com/docs/en/mcp`
- Settings: `https://code.claude.com/docs/en/settings`

### Relevante Nachprüfung Revision 3

- `https://github.com/fajarhide/omni`
- `https://github.com/IyadhKhalfallah/clauditor`
- `https://github.com/manojmallick/sigmap`
- `https://github.com/alexgreensh/token-optimizer`

Der vollständige Repo-Bestand mit Evidenzstatus, Ownership und Risiko steht in `repo-catalog.md` und `repo-catalog.json`.

---

## 16. Endgültige Empfehlung

```text
PRODUKTIONSKANDIDAT

Native Claude Code
  ├─ kleine stabile CLAUDE.md + scoped Rules
  ├─ Skill-/Plugin-Profile, Tool Search, projektbezogene MCPs
  └─ A/B-geprüfte native Output-/Compaction-Limits

Observer / Governance
  ├─ prefix-budget.mjs
  ├─ session-economy.mjs (user-only advisory)
  └─ .claude/TASK-STATE.md

Native Read
  └─ read-context-guard.mjs
       ├─ digest-verifizierter reread guard
       └─ whole-file slice guard

Bash
  └─ bash-dump-guard.mjs v3
       ├─ live capability gate
       ├─ native-limit alignment
       ├─ exact-sensitive pass
       ├─ deterministic compression
       └─ recoverable archive

Code Retrieval
  └─ genau eines:
       SigMap CLI | CodeGraph | codebase-memory-mcp
     optional SigMap verify/evidence-only neben einem anderen Owner

External bulk
  └─ Context Mode nur mit klarer Surface-Trennung

Measurement
  └─ native context/usage + ccusage + Paketmetriken
```

```text
SEPARATE BENCHMARKARME, NICHT ADDITIVE PLUGINS

OMNI | Squeez | nestor-lean | kmizu/token-saver
quiet-bash | semtrim | Snip | lowfat | RTK
Token Optimizer resident | clauditor blocking
Tokdiet | Headroom | TAMP | Rolling Context | pxpipe
```

Das ist die optimierte Synthese aus beiden Konzeptlinien: **Prefix und Session-Wachstum werden endlich als Primärflächen behandelt, ohne dafür unbewiesene Zahlen oder konkurrierende Runtime-Owner in den Produktionsstack zu übernehmen.**
