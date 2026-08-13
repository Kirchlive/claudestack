# Repo-Shortlist und Einsatzmatrix — Revision 3

**Stichtag:** 10. August 2026  
**Grundregel:** Diese Matrix wählt Kandidaten **innerhalb** einer Oberfläche. Sie ist keine Empfehlung, alle Zeilen gemeinsam zu installieren.

## 1. Prioritäten

| Rang | Oberfläche | Standardkandidat | Alternative / Experiment | Entscheidung |
|---:|---|---|---|---|
| 0 | Prefix-Inventur | `prefix-budget.mjs` + native `/context`/usage | `alexgreensh/token-optimizer` audit-only | Erst messen; keine 100-Token-pro-Skill-Hochrechnung als Fakt verwenden. |
| 1 | Native Limits | Claude-Code-Env-Pilot | unveränderte Native-Defaults als Kontrollarm | Qualität, Cache und Recovery gepaart messen. |
| 2 | Native Read | `read-context-guard.mjs` | nestor-lean / kmizu token-saver / quiet-bash als integrierte Profile | Genau ein mutierender Read-Owner. |
| 3 | Bash Output | `bash-dump-guard.mjs` v3 | OMNI, Squeez, Snip, lowfat, RTK, semtrim, quiet-bash | Genau ein Bash-Owner; jeder Kandidat eigener Arm. |
| 4 | Session Boundary | `session-economy.mjs` + `TASK-STATE.md` | clauditor audit-only; Magic Compact; Blocking/Proxy später | Default advisory, nicht blockierend. |
| 5 | Code Retrieval | SigMap CLI **oder** CodeGraph | codebase-memory-mcp für große/polyglotte Repos | Genau ein Broad-Owner; SigMap verify/evidence kann eng ergänzen. |
| 6 | External bulk | Context Mode mit reduzierten Matchern | Headroom als eigener Proxy-Stack | Bash/Read nicht doppelt besitzen. |
| 7 | Measurement | native context/usage + ccusage | OTel, Sniffly, clauditor audit | Ein kanonischer Datensatz. |

## 2. Bash-/Output-Kandidaten

| Kandidat | Hauptvorteil | Hauptgrenze | Einsatzurteil |
|---|---|---|---|
| **`bash-dump-guard.mjs` v3** | Post-execution, Originalbefehl/Permission unverändert, capability-gated, exact-sensitive, recoverable | eigener neuer Stack; Feldbenchmark ausstehend | Modularer Core-Safe-Kandidat |
| **OMNI** | Cross-call Ledger/Dedup, RewindStore, veröffentlicht auch Null-Savings | besitzt Filter + Memory; SQLite-/Retrieval-/Latency-Kosten | Hochinteressanter alleiniger Dedup-Arm |
| **Squeez** | breiteste Hook-Pipeline, Native-Tools, Blob-Retrieval, Session-State | sehr große Ownership, Persona/Memory/Read/Bash-Überlappung | Turnkey-Monolith |
| **Snip** | deklarative YAML-Filter, breite Command-Abdeckung | PreToolUse-Owner | starker alleiniger A/B-Arm / Filterquelle |
| **lowfat** | klein, mehrere Intensitätsstufen, reproduzierbare Samples | besitzt Bash und Read; aggressive Modi können Bodies verlieren | Lean-A/B-Arm |
| **RTK** | sehr breite command-spezifische Filter, Rust, Analytics | Command-Rewrite/Wrapper; nicht additiv | alleiniger Wrapper-Arm / Filterquelle |
| **semtrim** | konservativer Pipe-Wrapper, golden corpus, never-grow | nur bekannte pipe-safe Befehle; PreTool capability nötig | konservativer Wrapper-Arm |
| **quiet-bash** | lossless Spill, reale Session-A/B, Read/Prompt/Output-Tools | breite monolithische Oberfläche | recoverable Turnkey-Arm |
| **nestor-lean** | Read-Diff/Dedup, codemap, RTK-pipe, MCP/Web, Compaction-Invalidation | besitzt nahezu alle Input-Flächen | monolithischer Input-Arm |
| **kmizu/token-saver-plugin** | Rust, Guard/Dedup/Delta/Codemap/Warnings | besitzt Bash, Read, Grep, Write, Edit, Glob | monolithischer High-Coverage-Arm |

**Nicht zulässig:** `RTK + Snip/lowfat + OMNI` als gleichzeitige Hooks. OMNI-Dedup ist kein nachgelagerter „kostenloser Zusatz“, sondern Teil eines eigenen Runtime-/Memory-Owners.

## 3. Retrieval-Kandidaten

| Kandidat | Stärke | Kosten/Risiko | Routing |
|---|---|---|---|
| **SigMap CLI** | deterministische Signaturen, Evidence/Verify, kein residenter MCP-Server | README-Benchmarks teils modelliert; Map-Qualität repoabhängig | kleine/mittlere Repos oder Verification-only |
| **CodeGraph** | kleiner Explore-Pfad, Auto-Sync, Architektur/Impact | dichte Resultate; Sprach-/Repo-Fit prüfen | Lean-Standard für Architekturfragen |
| **codebase-memory-mcp** | Tree-sitter + LSP, Routes, ADR, Cross-Service, Impact | Daemon, Watcher, größere Tooloberfläche | große/polyglotte Monorepos |
| jCodeMunch | genaue Symbolspans | sehr große Tooloberfläche / Lizenz prüfen | Spezialprofil |
| claude-context | semantische Vektorsuche | Recall-Misses und MCP-Overhead | Text-/Semantikprofil |

Zulässige Kombination:

```text
CodeGraph oder codebase-memory = Broad-Owner
SigMap = ausschließlich evidence/verify für einen expliziten Artefaktpfad
```

Unzulässige Kombination:

```text
CodeGraph + SigMap + codebase-memory alle für dieselbe Frage abfragen
```

## 4. Prefix und Session

| Kandidat | Rolle | Empfehlung |
|---|---|---|
| `prefix-budget.mjs` | lokale verursachergerechte Inventur | Core observer; Schätzungen klar kennzeichnen |
| Token Optimizer | Prefix-/Memory-/Compaction-/Output-Audit | einmalig audit-only; Residency isoliert messen |
| `session-economy.mjs` | mechanischer Checkpoint + Druckband | Core advisory; kein Default-Blocking |
| clauditor | Waste-Factor, Handoff, Rotation | audit-only zuerst; Blocking eigener Arm |
| Magic Compact | manueller Session-Schnitt | vor History-Proxys testen |
| Rolling Context | Proxy-Summary | nur bei nachgewiesenem Restproblem |

## 5. Strukturformate

| Kandidat | Urteil |
|---|---|
| TOON | nur homogene Objektarrays und nur bei gemessenem Net-Gain |
| PAKT | innere Transformation im gewählten Owner, nicht eigener Hook |
| LLMLingua / KRLabs Squeez | L5 semantic-only für große nicht-exakte Dumps |
| pxpipe | spezialisierter Modell-/Workload-Arm; nicht Coding-Default |

## 6. Endgültige Profile

### Core Safe

```text
native hygiene + native limit pilot
prefix-budget
read-context-guard
session-economy + TASK-STATE
bash-dump-guard v3
exactly one retrieval owner
optional Context Mode external-only
native usage/context + ccusage
```

### Dedup Pilot

```text
native hygiene + prefix measurement
OMNI as sole Bash/dedup/memory owner
no second Bash filter and no second memory system
exactly one retrieval owner
```

### Turnkey Pilot

Jeweils **eines** von:

```text
Squeez | nestor-lean | kmizu/token-saver | quiet-bash
```

### Proxy Pilot

Jeweils **eines** von:

```text
Tokdiet | Headroom | TAMP | Rolling Context | pxpipe
```

Der Gewinner wird pro Repo-/Workloadklasse bestimmt; ein universeller Sieger ist aus den vorhandenen README- und Mikrobenchmarkdaten nicht ableitbar.
