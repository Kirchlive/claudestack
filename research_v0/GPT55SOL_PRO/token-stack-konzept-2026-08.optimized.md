# Token-Stack für Claude Code — optimierte Landschaft und Zielkonzept

**Revision:** 3  
**Stand:** 10. August 2026  
**Umfang:** 228 deduplizierte öffentliche Repositories; 22 Deep Audits, 4 weitere technische Audits, 61 README-Prüfungen, 86 katalogisierte und 55 Discovery-only-Kandidaten  
**Auftrag:** alle relevanten Mechanismen finden, die bei Claude Code direkt oder indirekt Tokens, Context Pressure, Cache Creation, Wiederholungsarbeit oder Modell-Output reduzieren können — und daraus den bestmöglichen konfliktfreien Stack ableiten.

---

## 0. Umgang mit Zahlen und Evidenz

Jede Prozentangabe eines Projekts bleibt zunächst eine Herstellerangabe. Sie zeigt, was das Tool beansprucht, aber nicht, wie viel es auf dem eigenen Repo, Modell, Cache-Zustand und Aufgabenmix bringt.

| Marker | Bedeutung |
|---|---|
| `[OFFIZIELL]` | aktuelle Claude-Code-Dokumentation oder Hook-/Settings-Vertrag |
| `[QUELLCODE]` | relevante Implementierung/Adapter geprüft |
| `[README]` | Herstellerbeschreibung gelesen |
| `[NUTZER-MESSUNG]` | lokale Messung aus dem Ausgangskonzept |
| `[PAKET-TEST]` | deterministischer Test der mitgelieferten Revision-3-Dateien |
| `[SCHLUSS]` | begründete Ableitung, noch keine unabhängige Messung |
| `[HYPOTHESE]` | explizit zu prüfende Annahme |

### Zwei tragende Befunde

1. Die Repo-Landschaft ist auf Tool-Ausgaben konzentriert. Prefix-Hygiene, Tooldefinitionen, Read-Wiederholungen und Session-Grenzen sind deutlich weniger besetzt.
2. Die richtige Auswahlmetrik ist nicht „größte Kompressionsrate“, sondern **E2E-Taskkosten bei gleicher Qualität, stabiler Cache-Ökonomie und deterministischer Recovery**.

---

## 1. Revidierte Kernthese

> Der teuerste Token ist häufig der, der lange im aktiven Kontext bleibt und in vielen Folgerunden erneut verarbeitet oder aus dem Cache gelesen wird. Deshalb werden Prefix, native Limits, Dedup und Session-Grenzen **vor** einer weiteren Kompressionsschicht geprüft.

Diese These ist strukturell plausibel und passt zu der im Ausgangsdokument beschriebenen lokalen Beobachtung, dass sich frühe Prefix-Änderungen über Folgerunden vervielfachen können `[NUTZER-MESSUNG]`. Sie beweist aber noch nicht, dass Skill-Metadaten auf dem konkreten System der größte Posten sind.

### Wichtige Korrektur

Die Rechnung `~290 Skills × ~100 Token = ~29.000 Token je Runde` wird nicht als Fakt übernommen:

- Claude Code budgetiert Skill-Metadaten dynamisch `[OFFIZIELL]`.
- Niedrig priorisierte Beschreibungen können aus der angebotenen Liste entfallen `[OFFIZIELL]`.
- Der vollständige Skill-Body wird erst bei Verwendung geladen `[OFFIZIELL]`.
- Gefundene Dateien sind nicht identisch mit tatsächlich aktiven Metadaten.

Daher lautet die produktive Regel:

> **Prefix-first messen, dann kürzen — nicht Dateianzahl mit Provider-Tokens gleichsetzen.**

---

## 2. Wo Tokens entstehen — acht Ebenen

| Ebene | Inhalt | Typische Kosten | Eigentümerregel |
|---|---|---|---|
| **L0 Prefix** | Systemprompt, `CLAUDE.md`, Rules, Skill-/Plugin-Metadaten | stabiler Cache-Read; bei Änderung neue Cache-Creation | native Hygiene; observer-only Messung |
| **L1 Tooldefinitionen** | Built-ins, MCP-Schemata | stehen vor der eigentlichen Arbeit | Tool Search; unnötige Tools/Server aus |
| **L2 Toolausgaben** | Bash, Read, Grep, MCP/Web | einmal erzeugt, dann Teil der History | genau ein mutierender Owner je Surface |
| **L3 Modell-/Codeausgabe** | Prosa, Codeumfang, Scope-Creep | Output plus spätere History | kurze Policy + Build Ladder |
| **L4 Sitzungswachstum** | früher Tail wird in Folgerunden mitgeführt | zunehmende Inputmenge | Task-State + geplante Grenze |
| **L5 Kompaktierung/Resume** | verlorene Entscheidungen und Re-Exploration | zusätzlicher Modell-/Toolaufwand | mechanischer Checkpoint + human-reviewed State |
| **L6 Retrieval** | breite Grep-/Read-Schleifen | viele Toolcalls und große Reads | genau ein Broad-Retrieval-Owner |
| **L7 Messung** | unvollständige Slice-Metriken | falsche Siegerwahl | kanonischer E2E-Datensatz |
| **L8 Traffic/History-Proxy** | Request-Umschreibung, History-Kompression | Cache- und Latenzrisiko | genau ein Proxy oder keiner |

### Blinder Fleck, präzisiert

L0 ist unterbesetzt, aber nicht leer: Token Optimizer auditiert Configs/Skills/Memory, Claude selbst hat dynamische Skillbudgets, Tool Search und Deny-Regeln. Der neue Eigenanteil besteht in einer leichten, transparenten, nicht mutierenden Inventur (`prefix-budget.mjs`) statt einem weiteren Vollstack.

---

## 3. Auswahlkriterium: Cache- und Context-Sicherheit

### 3.1 Append-only ist meist günstiger als frühes Rewrite — aber nicht kostenlos

Hooks, Skills und Commands können Inhalte hinter einen stabilen Prefix anhängen und dadurch frühere Cacheblöcke erhalten `[OFFIZIELL]`. Der neue Inhalt bleibt dennoch Kontext und kann später erneut anfallen. Deshalb:

- observer-only Hooks bevorzugen,
- Warnungen ratenlimitieren,
- Checkpoints nicht automatisch vollständig reinjizieren,
- SessionStart-Payload klein halten.

### 3.2 Cache-Invalidatoren

Zu den dokumentierten Ursachen gehören unter anderem Modellwechsel, Compact sowie Veränderungen der verfügbaren MCP-Tools/Server oder anderer prefixrelevanter Bestandteile `[OFFIZIELL]`. Daraus folgt:

- Profile zwischen Sessions wechseln,
- MCP-Server stabil und möglichst projektbezogen betreiben,
- während eines A/B-Laufs keine Plugin-/Tooloberfläche umkonfigurieren,
- Cache Creation und Cache Read getrennt erfassen.

### 3.3 Proxys nicht pauschal verwerfen

Ein Proxy kann cachekompatibel arbeiten, wenn Transformation und Cachemarker stabil sind. Er kann aber auch den Prefix volatil verändern oder Telemetrie falsch weitergeben. Bei Custom Gateways hängt das Ergebnis vom Gateway ab `[OFFIZIELL]`.

Daher gilt:

> **Proxy = eigener Traffic-Owner mit unbekannter Cache-Ökonomie, bis ein gepaarter Lauf das Gegenteil belegt.**

Betroffen: Headroom, Tokdiet, TAMP, Rolling Context, pxpipe, llmtrim, Context Gateway und vergleichbare Systeme.

---

## 4. Landschaft nach Ebene

### L0 — Prefix / struktureller Ballast

| Kandidat | Einordnung |
|---|---|
| **`prefix-budget.mjs`** | lokale aktive Metadaten-/Config-Inventur, keine Settings-Mutation |
| **alexgreensh/token-optimizer** | breiter Prefix-/Memory-/Compaction-/Output-Audit; zunächst audit-only |
| native Skillbudgets/Overrides | erste Verteidigung, Bodies on demand `[OFFIZIELL]` |
| kleine `CLAUDE.md`, scoped Rules | Pflichtgrundlage |
| Plugin-/MCP-Profile | zwischen Sessions umschalten |

Token Optimizer bleibt als Messinstrument wertvoll, ist aber kein neutraler Dauerbewohner: es besitzt viele Hooks, Output-, Read-, Memory- und Compaction-Flächen und steht unter PolyForm Noncommercial `[README]`.

### L1 — Tooldefinitionen

| Kandidat | Einordnung |
|---|---|
| native MCP Tool Search | Standard aktiv lassen |
| Deny ungenutzter Built-ins | nur nach Task-/Profilprüfung |
| projektbezogene MCP-Konfiguration | globale Oberfläche verkleinern und stabilisieren |
| code-execution-mode/LAP | Spezialprofile, wenn Tool Search und Scoping nicht reichen |

### L2a — Bash-/Runtime-Output

| Kandidat | Differenzierungsmerkmal | Urteil |
|---|---|---|
| **bash-dump-guard v3** | PostToolUse, Capability-Gate, native-limit-aligned, exact/recoverable | modularer Core-Safe-Kandidat |
| **OMNI** | Cross-Call-Ledger, RewindStore, Session-Dedup | eigener Dedup-/Memory-A/B-Arm |
| Squeez | breiteste Hook-/State-/Blob-Pipeline | Turnkey-Monolith |
| Snip | deklarative YAML-Filter | starker alleiniger Filterarm |
| lowfat | klein, mehrere Levels, reproduzierbare Samples | Lean-Arm |
| RTK | sehr breite command-spezifische Rust-Filter | Wrapper-/Filterarm |
| semtrim | konservativer Pipe-Wrapper, golden corpus | PreTool-Fallbackarm |
| quiet-bash | recoverable Spill und reale Sessionmessung | recoverable Turnkey-Arm |
| nestor-lean | Read-Diff/Dedup + Bash/Web/MCP | integrierter Input-Monolith |
| kmizu/token-saver | Rust Guards, Delta, Codemap, Nudges | integrierter High-Coverage-Monolith |

### Zentrale Korrektur zur ursprünglichen Kombination

`snip oder lowfat + omni + rtk` wird **nicht** als Produktionsstack übernommen. Alle drei können Bash-Ausgaben oder Commands besitzen. Matching Hooks bilden keine garantierte sequentielle Pipeline `[OFFIZIELL]`.

Optimiert:

```text
B1 RTK allein
B2 Snip allein
B3 lowfat allein
B4 OMNI allein
B5 Squeez allein
B6 bash-dump-guard v3 allein
```

OMNIs Dedup wird als eigener Mechanismus bewertet: Ledger-Savings, Rewind-Retrieval, SQLite-Wachstum und Memory-Injektion werden getrennt gemessen.

### L2b — Native Read/Grep/Glob

Der bisherige blinde Read-Pfad wird mit einem einzigen Dispatcher adressiert:

- `reread-guard.mjs`: exakt gleiche Range + unveränderte Datei + Digest,
- `read-slice-guard.mjs`: Whole-file-Read über Zeilen-/Bytebudget,
- `read-context-guard.mjs`: alleiniger Hook-Owner und State-Invalidation.

Squeez, lowfat, nestor-lean, token-saver, quiet-bash und Context Mode können ebenfalls Read-Flächen besitzen. Sie ersetzen den Dispatcher in einem integrierten Profil.

### L3 — Modell-/Codeausgabe

| Kandidat | Urteil |
|---|---|
| Ponytail | Build-/Scope-Ladder als Regelquelle |
| Caveman/Scrooge | höchstens kurze lokale Stilregel extrahieren |
| Output-Limit | separater A/B-Arm; kann Vollständigkeit reduzieren |

Kürze ist kein Selbstzweck. Security, Architektur, Unsicherheit und Verification dürfen nicht telegraphisch beschädigt werden.

### L4/L5 — Session und Kompaktierung

| Kandidat | Rolle | Urteil |
|---|---|---|
| **session-economy.mjs** | Druckschätzung, privater mechanischer Checkpoint | Core advisory |
| `.claude/TASK-STATE.md` | human-reviewed SSOT | Core |
| clauditor | Waste-Factor, Handoff, Blocking-Rotation | audit-only zuerst |
| Magic Compact | expliziter manueller Schnitt | vor Proxy testen |
| Rolling Context/Tokdiet | History-/Traffic-Owner | nur nach Restproblem |
| Cozempic/Transcript-Pruner | Sessiondatei-Mutation | isoliert, gepinnt, rollbackfähig |

### L6 — Retrieval statt Lesen

| Kandidat | Form | Routing |
|---|---|---|
| **SigMap** | CLI oder MCP | Broad-Owner **oder** enges Evidence-/Verify-Werkzeug |
| CodeGraph | Index/Explore | Lean Architektur-/Impact-Owner |
| codebase-memory-mcp | Daemon/MCP/LSP | große/polyglotte Repos |
| jCodeMunch | symbolgenau | Spezialprofil |
| claude-context | semantisch | Embedding-/Recall-Profil |

Korrektur:

- SigMap nicht automatisch „zusätzlich zu CodeGraph“ als zweiter Explorer.
- Zulässig: CodeGraph als Broad-Owner + SigMap nur `evidence`/`verify`.
- Unzulässig: zwei oder drei Indizes für dieselbe Frage abfragen.

SigMaps Projektbenchmarks sind reproduzierbar beschrieben, enthalten aber auch modellierte Task-Success-/Promptwerte `[README]`; eigener Repo-Fit bleibt Pflicht.

### L7 — Messung

Kanonisch:

- native `/context`/usage,
- ccusage für Cache Read/Creation und Kosten,
- Prefix-Snapshots,
- Guard-/Dedup-/Recovery-Metriken,
- Task-Erfolg und Tests.

Monitore und Dashboards bleiben lesende Ergänzung.

### L8 — Proxy

Genau einer pro Arm:

- Tokdiet,
- Headroom,
- TAMP,
- Rolling Context,
- pxpipe,
- llmtrim.

Pflicht: providerseitige Usage, Cache Creation/Read, Qualität, Recovery, Latenz und Datenschutzpfad.

---

## 5. Empfohlener Zielstack

### Ebene 0 — Prefix-Diät

1. `prefix-budget --report` ausführen.
2. `/context` und ccusage Baseline sichern.
3. ungenutzte Skill-/Plugin-Gruppen in einem **neuen Profil** deaktivieren.
4. Claude neu starten und dieselben Aufgaben messen.
5. `CLAUDE.md` und Rules nur aufgrund realer Contextwirkung kürzen.
6. MCPs projektbezogen und stabil halten.

Zielwerte wie „unter 40 Skills“ sind Review-Trigger, keine universelle Grenze.

### Ebene 1 — Native Limits

`native-token-limits.example.jsonc` ist ein Pilotarm:

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

Jeder Wert muss auch einzeln gegen Native Defaults geprüft werden. Das verhindert, dass eine kombinierte Konfiguration gewinnt, obwohl ein einzelner Wert Rework erzeugt.

### Ebene 2 — Read und Bash

**Modularer Kandidat:**

```text
Read  = read-context-guard
Bash  = bash-dump-guard v3
```

**Alternative integrierte Arme:**

```text
OMNI | Squeez | nestor-lean | kmizu/token-saver | quiet-bash
```

**Alternative schmale Bash-Arme:**

```text
RTK | Snip | lowfat | semtrim | tokf
```

Nie mehrere mutierende Owner derselben Surface.

### Ebene 3 — Retrieval

Genau eine Auswahl pro Repo-Profil:

```text
SigMap CLI
oder CodeGraph
oder codebase-memory-mcp
```

Native Tools bleiben für bekannte kleine Änderungen zuständig.

### Ebene 4 — Session Economy

- `session-economy` user-only advisory,
- autoritativer kurzer Task-State,
- mechanischer Checkpoint privat,
- `/clear`/Compact nach kohärenter Exploration,
- clauditor zunächst audit-only.

### Ebene 5 — External Bulk

Context Mode nur für Web, externe MCPs, API-Batches und externe Logs, sofern Bash/Read-Matcher entfernt oder deaktiviert sind.

### Ebene 6 — Proxy

Nur nach nachgewiesenem Restproblem und als eigener Traffic-Owner.

---

## 6. Regelwerk — optimierte Guards

### R1 — `prefix-budget.mjs` / SessionStart

Misst lokal:

- aktive/discovered Skill-/Command-Metadaten,
- dynamisches/fallback Budget,
- `name-only`/disabled,
- Kandidaten-`CLAUDE.md`, Rules,
- enabled Plugins/Marketplaces,
- deklarierte MCP-Server.

Es meldet höchstens eine kurze Zeile und ändert keine Settings. Tokenzahlen sind gekennzeichnete Schätzungen.

### R2/R3 — ein `read-context-guard` statt paralleler Hooks

#### Reread

- gleiche Datei,
- gleiche Range,
- within window,
- gleiche mtime/size,
- SHA-256 gleich,
- State nicht durch Compaction invalidiert.

Dann einmalige Denial; identische Wiederholung innerhalb des Escape-Fensters erlaubt den bewussten Read.

#### Slice

Whole-file über Zeilen-/Bytebudget wird einmal abgelehnt und auf Slice, Search oder genau einen Retrieval-Owner geroutet. Bild/PDF/Media-Extensions sind standardmäßig ausgenommen.

### R4 — `session-economy.mjs`

- Stop/PreCompact/SessionEnd,
- direkter oder transcriptbasierter Context-Druck,
- privater mechanischer Checkpoint,
- standardmäßig `systemMessage` nur an Nutzer,
- kein Blocking,
- keine Vollinjektion in den Modellkontext.

### R5 — `bash-dump-guard.mjs` v3

- kein RTK-Binary und keine RTK-Pfadheuristik,
- Budgets direkt aus `BASH_MAX_OUTPUT_LENGTH`,
- Native-Truncation exact pass,
- Capability-Canary,
- exact-sensitive by default,
- lossy nur mit recoverable Raw-Archive,
- bounded private metrics.

### R6 — MCP-Konvention

- projektbezogen bevorzugen,
- keine unnötigen globalen Server,
- während eines Messlaufs Oberfläche stabil halten,
- Tool Search aktiv,
- Proxy-/Gatewaypfad separat messen.

### R7 — Ladder einfrieren und differenzieren

Die Ladder wird nicht als Kette mehrerer verlustbehafteter Sichten ausgebaut. Stattdessen existieren getrennte Ladders:

- Prefix-Audit,
- Read-/Retrieval-Routing,
- Bash-Compression,
- Build-/Implementation,
- Session Boundary.

So bekommt jede Regel einen klaren Geltungsbereich und eine messbare Abnahme.

---

## 7. Was nicht empfohlen wird

| Kombination/Kandidat | Grund |
|---|---|
| mehrere Bash-Kompressoren gleichzeitig | konkurrierende Input-/Output-Owner; keine garantierte Reihenfolge |
| OMNI zusätzlich hinter RTK/Snip/lowfat | OMNI besitzt selbst Filter, Ledger, Rewind und Memory |
| SigMap + CodeGraph + codebase-memory für dieselbe Frage | doppelte Indizes, Tools und Payloads |
| Token Optimizer dauerhaft ohne Auditprofil | überschneidet Prefix, Bash, Read, Memory, Nudge und Compaction |
| clauditor Blocking als Default | Governance- und Frustrationsrisiko in dichtem Hook-Stack |
| Proxy allein wegen kleinerem Request | Cache Creation, Output, Recovery und Qualität fehlen |
| pxpipe als Coding-Default | exact-string/vision-/Accessibility-Risiko; spezialisierter Modellarm |
| Repo-Packer als SessionStart | vergrößert L2; nur expliziter Handoff |
| LLMLingua/500x als Default | semantisches/ML-Risiko und Zusatzlatenz |

---

## 8. Konsequenz für das eigene Tool

Das eigene Werkzeug sollte nicht „Kompressor Nummer 46“ sein. Die differenzierenden Funktionen sind:

1. **verursachergerechte Prefix-Inventur**, ohne Systemprompt-/Providerdaten zu erfinden,
2. **ein deterministischer Surface-Dispatcher** statt paralleler Hooks,
3. **digest-verifizierter Dedup** mit Compaction-Invalidation,
4. **native-limit-aware Output Guard**,
5. **mechanische Session-Grenze** ohne Default-Modellsummary,
6. **Ownership- und Benchmark-Governance** als First-class Feature.

Der Kernwert ist damit nicht maximale Slice-Kompression, sondern:

> **Context Economy Control Plane: messen, zuordnen, begrenzen, deduplizieren, recovern und Owner-Konflikte verhindern.**

---

## 9. Grenzen

- 228 Repositories sind eine umfangreiche, aber nicht vollständige Momentaufnahme.
- Herstellerclaims wurden nicht vollständig unabhängig reproduziert.
- Skill-Metadatenmessung ist lokal und tokenisiert nicht exakt wie der Provider.
- Der tatsächliche Systemprompt ist nicht vollständig aus lokalen Dateien rekonstruierbar.
- Runtime-Hook-Fähigkeiten können regressieren; Canary bleibt erforderlich.
- Transcriptbasierter Context-Prozentsatz ist eine Schätzung, wenn kein direkter Wert vorliegt.
- OMNI-/SigMap-/clauditor-/Token-Optimizer-Ergebnisse müssen auf den eigenen Repos gemessen werden.
- PowerShell-Installer wurde in diesem Paket erstellt, konnte in der Erzeugungsumgebung mangels `pwsh` nicht ausgeführt werden.

---

## 10. Umsetzungsreihenfolge

| # | Schritt | Ziel |
|---:|---|---|
| 1 | Baseline `/context`, usage, ccusage und Prefix-Report | tatsächliche Kostenverteilung |
| 2 | Skill-/Plugin-/CLAUDE.md-Profil zwischen Sessions bereinigen | L0-Hypothese prüfen |
| 3 | Native-Limits einzeln und kombiniert A/B testen | L1 heben, ohne Qualität zu verlieren |
| 4 | Read-Dispatcher im Testprofil | Whole-file und Rereads adressieren |
| 5 | Bash-Guard v3 Shadow + Live-Canary | Runtimefähigkeit und Kandidaten messen |
| 6 | Guard, OMNI, Snip, lowfat, RTK, Squeez getrennt vergleichen | einen L2a-Owner wählen |
| 7 | SigMap, CodeGraph, codebase-memory nach Repo-Klasse vergleichen | einen L6-Owner wählen |
| 8 | Session-Economy + Task-State + `/clear` | L4/L5 ohne Proxy prüfen |
| 9 | Token Optimizer/clauditor audit-only | externe Diagnose vergleichen |
| 10 | erst bei Restproblem genau einen Proxy pilotieren | L8 kontrolliert öffnen |

Die ersten drei Schritte benötigen keinen neuen produktiven Runtime-Owner. Sie schaffen die Baseline, ohne die Messung bereits durch zusätzliche Kompressoren zu verändern.
