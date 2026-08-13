# Wide Research — Indirekte Token-Minimierung (Memory/Session, Code-Intelligence, Messung/Observability)

Stand: 2026-08-13. Metadaten (Stars, letzter Push) via GitHub-API am selben Tag abgerufen [^1^].

## Facet: Memory/Code-Intelligence/Monitoring

### Key Findings

**Gesamt:** Das Feld hat sich 2026 in drei klar getrennte Mechanismen differenziert: (A) **Cross-Session-Memory** (verhindert Wiederholungs-Lesen und Neu-Erklären), (B) **Code-Intelligence-Indizes** (Agent liest nur relevante Symbole/Subgraphen statt ganzer Dateien) und (C) **Messung/Observability** (spart selbst keine Token, ist aber Governance-Voraussetzung). Alle drei Teilbereiche haben jeweils einen klaren Marktführer mit 5-stelligen Stars: claude-mem (A), graphify/codegraph/serena (B), ccusage/CodexBar (C) [^1^].

**(A) Memory & Session:**
- **claude-mem** (thedotmack, ~90,5k Stars) ist De-facto-Standard: Lifecycle-Hooks (SessionStart, PreToolUse:Read, Stop) erfassen Tool-Beobachtungen automatisch, komprimieren sie per LLM und injizieren in neue Sessions eine Timeline (50 Observations + 10 Session-Summaries, ~800–3.000 Tokens Footprint); „Progressive Disclosure" hält den Context schlank; Web-Viewer auf localhost:37777 [^2^][^11^].
- **MemPalace** (~58,3k Stars) verfolgt den Gegenansatz: **verbatime** Speicherung statt Kompression, semantische Suche (ChromaDB default, Backends: Milvus/Qdrant/pgvector), LongMemEval R@5 = 96,6 % ohne LLM, 98,4 % hybrid; Auto-Save-Hooks für Claude Code/Codex/Cursor; 44 MCP-Tools [^3^].
- **codebase-memory-mcp** (DeusData, ~38,7k) ist eigentlich ein Hybrid A/B: persistente Code-Knowledge-Graph-Engine (tree-sitter, 158 Sprachen, single static C binary, Sub-ms-Queries); behauptete 99,2 % Token-Reduktion vs. File-by-File-Exploration; Linux-Kernel (28 Mio. Zeilen) in 3 Min. indexiert [^14^].
- **Neu 2026 & relevant:** **claude-rolling-context** (NodeNestor, 27 Stars, aktiv) — transparenter Proxy für „rolling context compression": nur alte Nachrichten werden asynchron zusammengefasst, recent context bleibt verbatim; explizites Kostenargument (ungekappter Prefix ⇒ quadratische Input-Kosten über Session-Länge) [^7^]. **claude-code-auto-memory** (severity1, 155 Stars) pflegt CLAUDE.md automatisch nach — Verarbeitung in **isoliertem Subagent-Kontext**, verbraucht keine Main-Session-Tokens [^6^]. **zilliztech/memsearch** (2,5k) als unified Memory-Layer (Markdown + Milvus) [^1^]. **OpenContext** (0xranx, 729) als Desktop-GUI+CLI-Kombi mit persistentem Context-Store [^9^].
- **Sekundäre Neu-Funde:** doobidoo (MCP, SQLite-vec; bekanntes Concurrency-Problem), agentmemory (~26k, BM25+Vector+Graph RRF, LongMemEval-S R@5 95,2 %, lokal), ICM, Kairn (Decay-Modelle), Context Cloud (einziger mit Team-Workspaces/RBAC), memnode (Rust) [^12^][^27^].

**(B) Code-Intelligence/Navigation:**
- **graphify** (Graphify-Labs, ~105,7k Stars!) ist das Star-Wachstums-Phänomen 2026: tree-sitter-Graph (36 Sprachen) + LLM-Ingest für Docs/PDFs/SQL; Integration als /graphify Skill **plus** MCP-Server (10 Tools), 17 Agent-Clients [^24^][^1^].
- **codegraph** (colbymchenry, ~66,1k): pre-indexierter Code-Knowledge-Graph mit Auto-Sync, npm-Package `@colbymchenry/codegraph`, 100 % lokal, 14 Frameworks [^16^][^1^]. **Aber:** im offenen THOL-Benchmark **keine messbare End-to-End-Ersparnis** (Platz 9/12) — Navigation spart Tool-Calls, aber nicht den durch File-Reads/Command-Output dominierten Gesamt-Bill [^19^].
- **serena** (oraios, ~27,9k): LSP-basierte symbol-level Semantik (Retrieval **und Editing/Refactoring**); gilt in unabhängigen Vergleichen als stärkste „compiler-grade" Navigation [^10^][^19^].
- **code-review-graph** (tirth8205, ~29,9k): local-first, Git-aware (Commit/Branch-Tracking), Fokus PR-Review; benchmarkte 40–60 % Kontext-Reduktion [^15^].
- **claude-context** (zilliztech, ~12,4k): semantische Code-Suche (AST-aware Chunking, 14 Sprachen, Merkle-Tree-Inkremental-Index), ~40 % Token-Ersparnis in eigener kontrollierter Eval; braucht externe Vector-DB (Zilliz Cloud/Milvus) — Setup- und Infra-Nachteil [^17^][^18^][^21^].
- **Neu-Funde B:** **jcodemunch-mcp** (jgravelle) behauptet 86–99 % (Ø 96 %) Token-Kürzung, 27,9× weniger Tokens als grep-and-read, aber kommerzielle Lizenz [^21a^]; **codesight-mcp** (security-hardened) und **sdsrss/code-graph-mcp** (AST-Graph, FTS5, 10 Sprachen, mit `benchmark`-Command) als weitere tree-sitter-MCPs [^22^][^23^].
- Wichtiges Gegen-Signal: Anthropic selbst setzt auf **agentische Suche statt Index** — Boris Cherny: „Early versions of Claude Code used RAG + a local vector db, but we found pretty quickly that agentic search generally works better" [^33^]. Code-Indizes sind also ein Community-Ansatz, kein Vendor-Design.

**(C) Messung & Observability:**
- **ccusage** (~17,9k) ist der Referenz-CLI-Standard: liest lokale JSONL-Session-Files, tägliche/wöchentliche/monatliche/Session-Reports, 5h-Billing-Windows (`blocks`), Statusline; inzwischen 16 Agent-Quellen (Codex, OpenCode, Gemini, Copilot …) [^4^][^28^].
- **CodeBurn** (getagentseal, ~9,3k) geht über Messung hinaus: 40 Tools, `optimize` findet Waste-Muster (wiederholte File-Reads, ungenutzte MCP-Server, aufgeblähte CLAUDE.md), `--apply` fixt mit Journal/Undo, `guard` installiert Budget-Hooks (Soft/Hard-Cap), `yield` korreliert Sessions mit Git-Commits, MCP-Server + Menubar-App [^5^].
- **CodexBar** (steipete, ~20k): macOS-Menubar für Usage-Limits von Codex + Claude Code ohne Login [^1^]. **Claude-Code-Usage-Monitor** (Maciek-roboblog, ~8,5k) für Echtzeit-Burn-Rate-Prognose [^35^].
- **OTEL-Pfad:** Claude Code hat native OpenTelemetry-Unterstützung (`CLAUDE_CODE_ENABLE_TELEMETRY=1` + OTLP-Env-Vars) — Microsoft dokumentiert Grafana-Dashboards dafür [^26^]. **Achtung Security:** „Otel Smuggling" — bösartiges `.claude/settings.json` in geklonten Repos kann Telemetrie zu Angreifer-Endpoints umleiten und via `otelHeadersHelper` RCE/Secret-Exfiltration ermöglichen; tausende Skills betroffen [^25^]. Das Repo **ColeMurray/claude-code-otel** (485 Stars) ist seit 2025-06 ungepflegt; native OTEL hat es weitgehend überholt.
- **Stagnant/abgeleitet:** philipp-spiess/claude-code-costs (203 Stars, letzter Push 2025-06 — von ccusage überholt), sniffly (1,3k, Push 2025-08), iannuttall/claude-sessions (1,2k, **archiviert**), zippoxer/recall (194, Push 2026-01) [^1^].
- **Neu-Funde C:** stormzhang/token-tracker (~478, Statusline + Dashboard), mag123c/toktrack (Rust, persistent cache gegen 30-Tage-Löschung der Session-Daten durch Claude Code!), antoineswg/claude-token-insight, claude-pulse (244, inkl. Phone-Approval), agentlytics (560, Multi-Tool-Dashboard), claude-code-monitor (298, Multi-Session-Live), headroom-meter (6 Stars, Nischen-Dashboard für Headroom-Proxy-Kompression) [^31^][^30^][^8^][^1^].

**Kritische Einordnung der Zahlen:** Hersteller-Ersparnis-Claims (99,2 %, 96 %, 52 %) stammen fast alle aus eigenen Benchmarks; der unabhängigste verfügbare Datenpunkt (THOL-Benchmark, selbst von einem Tool-Anbieter gepflegt) zeigt, dass reine Navigations-Indizes den Gesamt-Bill oft **nicht** messbar senken, weil File-Reads, Command-Output und Transcript-Replay dominieren [^19^]. Ebenso wurde MemPalaces „~170 Token Startup"-Claim widerlegt: 28 (jetzt 44) MCP-Tool-Definitionen kosten real 4.370–8.570 Tokens pro Session [^11^].

### Tool-Matrix

| Tool | Teilbereich | Zweck | Token-Bezug | Integrationstyp | Stars | Letzter Push | Deep-Dive? |
|---|---|---|---|---|---|---|---|
| thedotmack/claude-mem | A | Persistentes Cross-Session-Memory, LLM-Kompression, Progressive Disclosure | **Spart** (verhindert Neu-Erklären; ~800–3k Token Footprint; kostet selbst API-Calls für Kompression) | Hooks + Worker (Bun, :37777) + Plugin + Skill | 90.548 | 2026-08-12 | **Ja** |
| MemPalace/mempalace | A | Verbatim-Speicher + semantische Suche, temporaler KG, Auto-Save-Hooks | Spart (Recall statt Re-Read); hoher MCP-Tool-Overhead | CLI + MCP-Server (44 Tools) + Hooks + Docker | 58.329 | 2026-08-12 | **Ja** |
| DeusData/codebase-memory-mcp | A/B | Persistenter Code-Knowledge-Graph (tree-sitter, 158 Sprachen) | Spart stark laut Eigen-Benchmark (99,2 %); Sub-ms-Queries | MCP-Server (single C binary) + File-Watcher | 38.699 | 2026-08-12 | **Ja** |
| zilliztech/memsearch | A | Unified Memory-Layer für Agenten (Markdown + Milvus) | Spart (deduplizierter Recall) | Library/MCP, Vector-DB-Backed | 2.457 | 2026-08-12 | Nein (beobachten) |
| 0xranx/OpenContext | A | Persistenter Context-Store, GUI, nutzt vorhandene CLIs | Spart (Wiederverwendung von Kontext) | Desktop-App + CLI + Skills/Tools | 729 | 2026-06-16 | Nein |
| severity1/claude-code-auto-memory | A | Auto-Pflege von CLAUDE.md | Spart (frische, minimale Memory; Verarbeitung in Subagent-Kontext) | Plugin (PostToolUse/Stop-Hooks) | 155 | 2026-04-18 | Nein |
| NodeNestor/claude-rolling-context | A | Rolling-Context-Kompression (alt=Summary, neu=verbatim) | **Spart direkt** (Prefix-Cap ⇒ lineare statt quadratischer Input-Kosten) | Transparenter Proxy (Plugin) | 27 | 2026-08-12 | **Ja** (Mechanismus einzigartig) |
| ramakay/claude-self-reflect | A | Memory via npm-Package, Reflection | Spart (Cross-Session-Kontinuität) | npm/MCP | 221 | 2026-08-10 | Nein |
| zippoxer/recall | A | Full-Text-Search + Resume über Claude/Codex-Konversationen | Spart indirekt (Resume statt Neustart) | CLI | 194 | 2026-01-14 | Nein (stagnant) |
| iannuttall/claude-sessions | A | Session-Tracking-Slash-Commands | Doku, kein direkter Spar-Effekt | Slash-Commands | 1.211 | 2025-06-16 (**archiviert**) | Nein |
| severity1/claude-code-prompt-improver | A | Prompt-Verbesserung vor Absendung | Spart indirekt (weniger Retry-/Klärungs-Turns) | Hook (Plugin) | 1.849 | 2026-06-03 | Nein |
| — Neu: agentmemory | A | Lokale Memory (BM25+Vector+Graph RRF), LongMemEval-S R@5 95,2 % | Spart, kostenlos lokal | pip-Library/MCP | ~26k | 2026 (aktiv) | **Ja** (Neu-Fund) |
| — Neu: doobidoo (memory MCP) | A | MCP-Memory-Server (SQLite-vec) | Spart; Concurrency-Probleme bekannt | MCP | (mittel) | aktiv | Nein |
| — Neu: Context Cloud (abhinavala/cntxtv2) | A | Team-Workspaces, RBAC, Attribution, typisierte Chunks | Spart + Governance (einziger Team-Ansatz) | MCP (hosted + Supabase) | klein | aktiv | Nein (Deep-Dive für Team-Facet) |
| colbymchenry/codegraph | B | Pre-indexierter Code-Knowledge-Graph, Auto-Sync | Spart Tool-Calls; **THOL: keine E2E-Ersparnis** | npm CLI + MCP (multi-client) | 66.100 | 2026-08-08 | **Ja** |
| tirth8205/code-review-graph | B | Local-first Code-Graph, Git-aware, PR-Fokus | Spart 40–60 % Kontext (Eigen-Benchmark) | MCP + CLI (SQLite/RocksDB) | 29.913 | 2026-08-02 | **Ja** |
| oraios/serena | B | LSP-basierte Symbol-Semantik: Retrieval + Editing | Spart (Symbol- statt File-Reads; weniger Fehl-Edits) | MCP-Server | 27.931 | 2026-08-12 | **Ja** |
| Graphify-Labs/graphify | B | Codebase+Docs+SQL → queryable KG | Spart (strukturierte Queries statt Exploration) | CLI (`uv tool install graphifyy`) + /skill + MCP (10 Tools) | 105.664 | 2026-08-12 | **Ja** |
| zilliztech/claude-context | B | Semantische Code-Suche (Vektor + AST-Chunking) | Spart ~40 % (eigene Eval); braucht Vector-DB | MCP (npm `@zilliz/claude-context-mcp`) | 12.389 | 2026-07-14 | **Ja** |
| — Neu: jgravelle/jcodemunch-mcp | B | Symbol-Level-Retrieval via tree-sitter | Spart 86–99 % (Eigen-Claim, Ø 96 %); kommerzielle Lizenz | MCP | (hoch, „95k Installs" Claim) | 2026-08 (aktiv) | Nein (Lizenz prüfen) |
| — Neu: sdsrss/code-graph-mcp | B | AST-KG: Suche, Callgraph, Impact, Dead-Code | Spart; eingebauter `benchmark`-Command | MCP + CLI | klein | aktiv | Nein |
| — Neu: cmillstead/codesight-mcp | B | Security-hardened tree-sitter-Exploration | Spart (Symbol-Retrieval) | MCP | klein | aktiv | Nein |
| ccusage/ccusage | C | Kosten-/Token-Reports aus lokalen Session-Files, 16 Agent-Quellen | **Misst nur** (Governance-Basis) | CLI/TUI (`npx ccusage`), Statusline | 17.884 | 2026-08-12 | **Ja** |
| getagentseal/codeburn | C | Multi-Tool-Usage + Waste-Analyse + Budget-Guards + Fix-Apply | Misst **und reduziert** (optimize/guard/yield) | CLI + MCP + Menubar + Web | 9.264 | 2026-08-12 | **Ja** |
| steipete/CodexBar | C | macOS-Menubar: Usage-Limits Codex+Claude ohne Login | Misst nur | Native App | 20.003 | 2026-08-12 | Nein |
| Maciek-roboblog/Claude-Code-Usage-Monitor (Neu) | C | Echtzeit-Burn-Rate + 5h-Fenster-Prognose | Misst nur | CLI/TUI + Web | ~8.540 | 2026 (aktiv) | Nein |
| f/agentlytics | C | Multi-Tool-Analytics-Dashboard (8 Agenten) | Misst nur | Dashboard-App | 560 | 2026-08-03 | Nein |
| onikan27/claude-code-monitor | C | Live-Dashboard mehrerer Claude-Sessions, Mobile-UI | Misst nur | CLI + Web-UI | 298 | 2026-01-29 | Nein |
| nikitadoudikov/claude-pulse | C | Zero-Dep-Dashboard: Tokens, Context, Recovery, Phone-Approval | Misst nur | Lokale App | 244 | 2026-07-19 | Nein |
| philipp-spiess/claude-code-costs | C | Früher Kosten-Tracker | Misst nur; **überholt von ccusage** | CLI | 203 | 2025-06-16 | Nein |
| RonnieTheTester/headroom-meter | C | Live-TUI-Dashboard für Headroom-Proxy-Kompression | Misst Kompressions-Einsparungen | TUI (Python, zero-dep) | 6 | 2026-06-24 | Nein (Nische) |
| ColeMurray/claude-code-otel | C | OTEL-Spans → Prometheus/Grafana | Misst nur; **stagnant**, native OTEL nutzen | OTEL-Exporter | 485 | 2025-06-17 | Nein (→ native OTEL) |
| chiphuyen/sniffly | C | Usage-Stats + Error-Analyse + Sharing | Misst nur | Dashboard | 1.261 | 2025-08-08 | Nein (stagnant) |
| — Neu: stormzhang/token-tracker | C | Statusline + CLI-Dashboard (Claude/Codex/Kimi) | Misst nur | pip + Statusline-Hook | ~478 | 2026-05+ | Nein |
| — Neu: mag123c/toktrack | C | Rust-Tracker mit persistent cache (überlebt 30-Tage-Löschung) | Misst nur, aber einzigartige Daten-Retention | CLI (Rust) | klein | 2026-06 | Nein |

### Vergleiche

**1) Memory: claude-mem vs. auto-memory vs. OpenContext vs. MemPalace**
- *Philosophie:* claude-mem = **komprimierte** Observations + proaktive Injektion (SessionStart-Hook, PreToolUse:Read-Hook — „memory follows the agent's attention"); MemPalace = **verbatime** Speicherung + Retrieval on demand (kein Informationsverlust, aber rein pull-basiert — kein SessionStart-Hook, Agent muss Tools aktiv aufrufen); auto-memory = **nur CLAUDE.md-Sync** (statische Projekt-Memory, kein Session-Recall); OpenContext = GUI-zentrierter Context-Store für Mensch+Agent [^2^][^3^][^6^][^9^][^11^].
- *Token-Bilanz:* claude-mem ~800–3.000 Tokens Session-Footprint + laufende API-Kosten (~$5–15/Monat) für LLM-Kompression; MemPalace behauptet „~170 Token Startup", real aber 4.370–8.570 Tokens durch 28–44 MCP-Tool-Definitionen; auto-memory verlagert die Pflege-Arbeit in isolierte Subagent-Kontexte (0 Main-Session-Kosten); OpenContext verursacht Setup-/GUI-Overhead ohne klare Footprint-Zahlen [^11^][^27^][^6^].
- *Reife/Community:* claude-mem (90k, tägliche Commits, Vercel-OSS, v13.4) ≫ MemPalace (58k, v3.7, sehr aktiv, Benchmark-reproduzierbar) ≫ OpenContext (729) ≫ auto-memory (155) [^1^].
- *Fazit:* Für „einfach funktionieren" claude-mem; für maximale Recall-Qualität + Auditierbarkeit (Markdown, kein Verlust) MemPalace; auto-memory als **Komplement** (CLAUDE.md-Hygiene), nicht als Ersatz; OpenContext für GUI-affine Solo-User.
- Belegter Schwachpunkt beider Leader laut Source-Code-Analyse: **keine** Knowledge-Integrity-Mechanismen (kein Contradiction/Staleness/Trust-Scoring), kein Append-only-Schutz; MemPalaces dokumentierte `fact_checker.py` existiert nicht im Repo (Issue #524) [^11^].

**2) Code-Intelligence: codegraph vs. code-review-graph vs. claude-context vs. serena vs. graphify — Pflegezustand & Positionierung**
- *Alle fünf aktiv gepflegt* (Pushes Juli/Aug 2026) [^1^]. Rangfolge nach Stars: graphify (105,7k) > codegraph (66,1k) > code-review-graph (29,9k) ≈ serena (27,9k) > claude-context (12,4k) [^1^].
- *Mechanismus-Split:* **LSP/compiler-grade** (serena — echte Symbol-Referenzen + Editing) vs. **AST-Graph** (codegraph, code-review-graph, graphify — tree-sitter, deterministisch) vs. **Vektor-Suche** (claude-context — Embeddings, externe DB nötig) [^10^][^16^][^15^][^24^][^17^].
- *Fokus:* code-review-graph ist der einzige **Git-aware** (Commit-/Branch-Edges, PR-Impact-Analyse) [^15^]; graphify ist der einzige, der **Nicht-Code-Artefakte** (Docs, PDFs, SQL-Schemas) in denselben Graphen einbezieht [^24^]; serena ist der einzige mit **Editier-Fähigkeit** (Refactoring, Rename) — die anderen sind read-only [^10^][^19^].
- *Messbare Wirkung:* claude-context ~40 % (kontrollierte Eigen-Eval) [^17^]; code-review-graph 40–60 % (Eigen-Benchmark) [^15^]; codebase-memory-mcp 99,2 % (Eigen-Benchmark, Worst-Case-Vergleich) [^14^]; codegraph dagegen **keine messbare E2E-Ersparnis** im unabhängigeren THOL-Benchmark (9./12) — Warnung vor Star-gestützter Auswahl [^19^]. Unabhängige Review gibt claude-context nur 6,8/10 (Setup-/Infra-Last) [^18^].
- *Empfehlung:* serena für Editing+Navigation, graphify/codegraph für reine Exploration, code-review-graph für Review-Workflows, claude-context nur wenn Vector-DB-Infra akzeptabel.

**3) Messung: ccusage vs. CodeBurn vs. claude-code-costs vs. headroom-meter**
- *ccusage* = Referenz-Standard für historische Reports (JSONL-basiert, billing-windows, 16 Quellen, JSON-Export, Statusline); liest die gleichen lokalen Session-Files wie fast alle anderen [^4^][^28^].
- *CodeBurn* = ccusage + Forensik + Aktion: Waste-Findings mit geschätzten $-Savings, `--apply` mit Undo-Journal und **realized-vs-estimated** Abgleich nach 3 Tagen (ehrlicher Savings-Loop), Budget-Hooks (guard), Modellvergleich (one-shot-rate, cost-per-edit), Git-Korrelation (yield) [^5^]. ccusage und CodeBurn sind komplementär nutzbar [^357^].
- *claude-code-costs* = faktisch **tot** (203 Stars, seit 2025-06 ohne Push, keine Beschreibung) — durch ccusage ersetzt [^1^].
- *headroom-meter* = Nischen-Spezialfall: misst nicht Claude Code direkt, sondern die **Kompressions-Leistung des Headroom-Proxys** (recovered tokens, compression spikes, frame reduction) — Observability für einen Kompressions-Layer, kaum verbreitet (6 Stars) [^8^].
- *Fazit:* ccusage als Basis, CodeBurn für Optimierungs-Governance; headroom-meter nur im Headroom-Einsatz; claude-code-costs ignorieren.

### Major Players & Sources

- **Individuen/Communities:** thedotmack (claude-mem, auch awesome-claude-code), MemPalace-Org, Colby McHenry (codegraph), Graphify-Labs, steipete (CodexBar), ryoppippi/ccusage-Team, severity1 (Plugin-Marketplace), chiphuyen (sniffly).
- **Firmen:** Zilliz (claude-context + memsearch — Vector-DB-Upsell-Strategie), DeusData (codebase-memory-mcp), oraios (serena, akademisch geprägt), getagentseal (CodeBurn).
- **Vendor-Positionen:** Anthropic selbst lehnt Index-Ansätze ab (agentic search > RAG laut Boris Cherny) [^33^]; native Claude-Code-Features decken Basis-Bedarf ab: `/context`, `/compact`, `/clear`, path-scoped rules, Subagent-Isolation, Statusline, OTEL-Env-Vars [^32^][^26^].
- **Zentrale Referenz-Quellen:** cc.bruniaux.com (Memory-Systems-Reference mit verifizierten Star-Counts [^27^]; Observability-Guide [^28^]; 40+-Tools-Übersicht [^357^]), tokenade.net (THOL-Benchmark, Optimizer-Ranking) [^19^][^20^], MagnaCapax-Gist (Source-Level-Memory-Vergleich) [^11^], GitHub-Topics claude-memory/usage-tracker/token-usage [^29^][^30^].

### Trends & Signals

1. **Explosives Star-Wachstum 2026:** Die meisten Leader-Repos wurden erst Feb–Apr 2026 erstellt (codebase-memory-mcp 2026-02, MemPalace 2026-04, graphify 2026-04, codegraph 2026-01) und haben in <6 Monaten 30k–105k Stars erreicht [^1^] — Memory/Code-Intelligence ist *das* Hype-Thema des Jahres.
2. **Konvergenz auf MCP + Hooks als Integrationsmuster**; Multi-Client-Support (Claude Code, Codex, Cursor, Gemini, OpenCode …) ist Standard-Erwartung [^2^][^5^][^24^].
3. **Von Messung zu Aktion:** CodeBurn (optimize→apply→guard→realized-report) und jcodemunch zeigen den Shift von Dashboards zu geschlossenen Spar-Regelkreisen [^5^][^21a^].
4. **Kosten-Transparenz als Feature:** „30-Tage-Löschung" der Session-Daten durch Claude Code treibt Retention-Tools (toktrack, MemPalace-Retention-Guide) [^31^][^3^]; Anthropic-Tarifänderungen (Juni 2026: separater Credit-Pool für programmatische Nutzung) erhöhen Governance-Druck [^352^].
5. **Quadratische-Kosten-Argument wird Mainstream:** rolling-context und Headroom adressieren direkt, dass jeder Kontext-Token pro Turn neu verrechnet wird — Prefix-Capping/Compression als eigene Tool-Kategorie [^7^][^8^].
6. **Team-Gap:** Memory ist Solo-gelöst, Team-Memory (geteilte Workspaces, RBAC, Attribution) ist weitgehend offen — nur Context Cloud adressiert es explizit [^12^].

### Controversies & Conflicting Claims

1. **Kompression vs. Verbatim:** claude-mem (lossy LLM-Summaries) vs. MemPalace (verbatime) — MemPalace-Seite argumentiert, Kompression koste -12,4 Punkte Retrieval-Recall (eigener AAAK-Benchmark); claude-mem-Seite argumentiert mit Token-Effizienz und Progressive Disclosure [^11^][^3^][^2^].
2. **„~170 Token Startup" (MemPalace) vs. 4.370–8.570 real** durch MCP-Tool-Definitionen — Source-Level-Kritik nennt das „misleading marketing" [^11^]. Gilt generell: große MCP-Tool-Suites sind selbst ein Kontext-Kostenfaktor.
3. **Index vs. agentische Suche:** Community baut Indizes (graphify, codegraph, claude-context), Anthropic sagt explizit, agentic search sei besser (einfacher, keine Staleness/Security-Probleme) [^33^] — und der THOL-Benchmark stützt die Skepsis teilweise (codegraph ohne E2E-Effekt) [^19^].
4. **Hersteller-Benchmarks:** 99,2 % (codebase-memory-mcp), 96 % (jcodemunch), 52 % (code-review-graph Deployment), 40 % (claude-context) — inkonsistente Methodik, teils Worst-Case-Baselines (file-by-file grep), kaum unabhängige Replikation [^14^][^21a^][^15^][^17^]. MemPalace lehnt Side-by-Side-Vergleiche mit Mem0/Zep explizit als „nicht ehrlich" ab [^3^].
5. **OTEL-Security:** Native Telemetrie (Governance-Feature) ist gleichzeitig Angriffsfläche — „Otel Smuggling" via projekt-level `.claude/settings.json`, keine Fix-Zusage; Enterprise-Deployments müssen Telemetrie-Config pinnen [^25^][^26^].
6. **Proaktive vs. pull-basierte Memory:** MemPalace hat keinerlei SessionStart-Hook — wenn der Agent die Tools nicht aufruft, ist die Memory unsichtbar [^11^]; claude-mem injiziert automatisch, zahlt dafür laufende Kompressions-API-Kosten [^27^].

### Recommended Deep-Dive Areas

1. **claude-mem-Architektur** (Hooks→Worker→Progressive Disclosure; Token-Footprint vs. Kompressionskosten; Cloud-Sync cmem.ai) — Marktstandard, größte Community. [^2^]
2. **THOL-Benchmark & tokenade-Methodik** — einzige halbwegs unabhängige E2E-Messung; prüfen, welche Mechanismen (Output-Filter, Kompression, Index) den Bill wirklich senken. [^19^][^20^]
3. **claude-rolling-context / Headroom-Proxy-Klasse** — Prefix-Capping mit quadratischem Kostenmodell; quantifizierbarer als Memory-Claims. [^7^][^8^]
4. **codebase-memory-mcp + code-review-graph** — Graph-Ansatz mit härtesten Zahlen (99,2 % / 40–60 %); false-positive-Verhalten bei dynamischen Imports dokumentiert [^14^]; Replikation lohnt.
5. **serena vs. graphify/codegraph (LSP vs. tree-sitter-Graph)** — Qualitäts-/Kosten-Trade-off bei Navigation+Editing. [^10^][^19^]
6. **CodeBurn optimize/guard/yield** — der einzige geschlossene Kreis Messung→Fix→Verifikation (realized vs. estimated); Vorlage für Governance. [^5^]
7. **Native OTEL-Telemetrie + Otel-Smuggling-Härtung** — Enterprise-Observability aufsetzen *und* gegen Config-Smuggling absichern. [^25^][^26^]
8. **Team-Memory-Gap** (Context Cloud, Zep/Graphiti) — offener Markt für Shared-Memory mit RBAC/Attribution. [^12^]

### Quellen

- [^1^]: GitHub REST API, `api.github.com/repos/{owner}/{repo}` — Stars/pushed_at/description aller Matrix-Repos, abgerufen 2026-08-13.
- [^2^]: https://github.com/thedotmack/claude-mem (README, v13.4.0)
- [^3^]: https://github.com/MemPalace/mempalace (README, v3.7.0, Benchmarks)
- [^4^]: https://github.com/ccusage/ccusage (README)
- [^5^]: https://github.com/getagentseal/codeburn (README)
- [^6^]: https://github.com/severity1/claude-code-auto-memory (README)
- [^7^]: https://github.com/NodeNestor/claude-rolling-context (README)
- [^8^]: https://github.com/RonnieTheTester/headroom-meter (README)
- [^9^]: https://github.com/0xranx/OpenContext (README)
- [^10^]: https://github.com/oraios/serena (README)
- [^11^]: https://gist.github.com/MagnaCapax/748b0be92dc31d4f5b6ba13286203766 — Source-Level-Vergleich MemPalace vs. claude-mem (2026-07-08)
- [^12^]: https://contextcloud.pro/blog/best-mcp-memory-servers-for-teams/ (2026-05-22)
- [^13^]: https://www.mindstudio.ai/blog/claudemem-vs-context-mode-claude-code-memory-plugins (2026-05-04)
- [^14^]: https://dailyaiworld.com/workflow/codebase-memory-mcp-knowledge-graph-workflow-2026 (2026-07-20)
- [^15^]: https://dailyaiworld.com/workflow/code-review-graph-mcp-guide-2026 (2026-07-19)
- [^16^]: https://tosea.ai/blog/codegraph-claude-code-cursor-guide-2026 (2026-05-21)
- [^17^]: https://particula.tech/blog/semantic-code-search-vs-grep-coding-agents (2026-07-06)
- [^18^]: https://toolbrain.net/blog/zilliztech-claude-context-review/ (2026-05-14)
- [^19^]: https://tokenade.net/en/articles/codegraph-alternatives (THOL-Benchmark, 2026-07-19)
- [^20^]: https://tokenade.net/en/articles/best-claude-code-token-optimizers (2026-07-20)
- [^21a^]: https://github.com/jgravelle/jcodemunch-mcp
- [^22^]: https://github.com/cmillstead/codesight-mcp
- [^23^]: https://github.com/sdsrss/code-graph-mcp
- [^24^]: https://graphify.com/blog/how-to-give-claude-code-a-code-knowledge-graph (2026-07-13)
- [^25^]: https://bloom.security/blog/welcome-to-otel-claudeifornia (Otel Smuggling, 2026-07-29)
- [^26^]: https://learn.microsoft.com/en-us/azure/managed-grafana/grafana-opentelemetry-app-insights (Claude Code OTEL-Config, 2026-06)
- [^27^]: https://cc.bruniaux.com/memory-systems/ — Claude Code Memory Systems: Complete Reference 2026 (2026-05-23)
- [^28^]: https://cc.bruniaux.com/guide/observability/ (2026-08-06)
- [^29^]: https://github.com/topics/claude-memory und https://github.com/topics/claude-code-memory (2026-08)
- [^30^]: https://github.com/topics/token-usage und https://github.com/topics/usage-tracker (2026-08)
- [^31^]: https://github.com/mag123c/toktrack
- [^32^]: https://primeline.cc/blog/context-management (Native Context-Features, 2026-02-13)
- [^33^]: https://atlan.com/know/ai-agent/ai-agent-harness/cursor-vs-windsurf-vs-claude-code-data-context/ (Cherny-Zitat, 2026-08-03)
- [^35^]: https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ecosystem/third-party-tools.md (2026-07-27)
- [^352^]: https://www.usecarly.com/blog/claude-code-alternatives/ (Tarif-Split Juni 2026)
- [^357^]: https://cc.bruniaux.com/guide/third-party-tools/ (ccburn, straude, ccusage-vs-CodeBurn-Empfehlung, 2026-08-06)
- Weitere: https://github.com/stormzhang/token-tracker; https://memnode.dev/articles/add-persistent-memory-to-claude-code-mcp; https://github.com/YoniYon00/claude-feedback-rings
