# Research Worker 2 — Smart Context Selection & Code Analysis Repos

Recherche für Claude-Code-Tokenminimierung. 15 Repos abgedeckt (COVERAGE BOUND erreicht). Alle Daten aus den GitHub-README-Seiten extrahiert.

---

## 1. yamadashy/repomix
- **URL:** https://github.com/yamadashy/repomix
- **Kategorie:** Repo-Packing / Context-Bundling (CLI)
- **Was es tut:** Packt das gesamte Repository in eine einzelne AI-freundliche Datei (XML/Markdown/JSON/plain) für LLMs wie Claude, ChatGPT, Gemini etc. Git-aware (.gitignore), Secretlint-Sicherheitscheck, Token-Counting pro Datei und fürs ganze Repo.
- **Wie es Tokens spart:** `--compress`-Option nutzt Tree-sitter, um nur die wesentlichen Code-Elemente zu extrahieren (Struktur bleibt erhalten, Tokenzahl sinkt). Token-Counting hilft, Context-Limits einzuhalten. Nur relevante Dateien via include/ignore auswählbar.
- **Integrationstyp:** CLI (npx/npm/yarn/bun/brew), Library (Node.js), GitHub Action, Browser-Extension, VSCode-Extension, MCP (Codebase MCP Community-Projekt)
- **Stars:** sehr hoch (bekanntes Projekt, ~30k+)
- **Relevanzscore:** 5 — Kernwerkzeug für Claude-Code-Context-Packing mit echter Token-Kompression.

---

## 2. mufeedvh/code2prompt
- **URL:** https://github.com/mufeedvh/code2prompt
- **Kategorie:** Context-Engineering / Prompt-Generator (CLI)
- **Was es tut:** Konvertiert eine Codebase in einen einzelnen LLM-Prompt mit Source-Tree, Prompt-Templating (Handlebars) und Token-Counting. Rust-basiert, sehr schnell. Inkl. TUI, Git-Integration (diffs, logs, branch comparisons), Smart File Reading (CSV, Notebooks, JSONL).
- **Wie es Tokens spart:** Token-Tracking hält innerhalb der Context-Limits. Smart Filtering (glob, .gitignore) schließt irrelevante Dateien aus. MCP-Server verhindert, dass der Context-Window mit rohen Codebase-Daten aufgebläht wird.
- **Integrationstyp:** CLI (cargo/brew), Python SDK (pip), MCP Server, Core Library (Rust)
- **Stars:** moderat (bekanntes Tool)
- **Relevanzscore:** 4 — solide Context-Prep, aber weniger aggressive Token-Kompression als repomix.

---

## 3. simonw/files-to-prompt
- **URL:** https://github.com/simonw/files-to-prompt
- **Kategorie:** Datei-Konkatenation / Prompt-Builder (CLI)
- **Was es tut:** Konkateniert alle Dateien eines Verzeichnisses in einen einzigen Prompt für LLMs. Jede Datei mit relativem Pfad, getrennt durch `---`. Optionen: Extension-Filter, hidden files, ignore patterns, Claude-XML-Format (`--cxml`), Markdown mit fenced code blocks, line numbers.
- **Wie es Tokens spart:** Selektive Dateiauswahl (nur relevante Extensions/Dateien) reduziert die Menge an in den Context gelangendem Code. `--cxml` nutzt Anthropics optimierte Prompt-Struktur für den erweiterten Context-Window. Keine echte Kompression, nur Selektion.
- **Integrationstyp:** CLI (pip)
- **Stars:** 2.8k
- **Relevanzscore:** 3 — nützlich und simpel, aber ohne echte Token-Kompression; reine Selektion/Konkatenation.

---

## 4. bodo-run/yek
- **URL:** https://github.com/bodo-run/yek
- **Kategorie:** Repo-Serialisierung / Context-Bundling (CLI, Rust)
- **Was es tut:** Serialisiert textbasierte Dateien eines Repos/Verzeichnisses für LLM-Konsum. Nutzt .gitignore, Git-History zur Wichtigkeits-Inferenz, ignoriert binäre/große Dateien. Sehr schnell (230x schneller als repomix laut Benchmark).
- **Wie es Tokens spart:** `--tokens 128k`-Option kappt die Ausgabe auf ein Token-Budget und entfernt unwichtigere Dateien, um wichtige zu priorisieren. Wichtige Dateien kommen ans Ende (LLMs achten mehr auf spätere Inhalte). Git-basierte Priorisierung + priority_rules.
- **Integrationstyp:** CLI (curl/irm/cargo), konfigurierbar via yek.yaml
- **Stars:** 2.5k
- **Relevanzscore:** 4 — Token-Budget-Capping und Priorisierung sind stark für Claude-Code-Context.

---

## 5. coderamp-labs/gitingest
- **URL:** https://github.com/coderamp-labs/gitingest
- **Kategorie:** Repo-Ingestion / Context-Bundling (CLI + Web)
- **Was es tut:** Verwandelt jedes Git-Repo in einen prompt-freundlichen Text-Ingest für LLMs. `hub`→`ingest` in jeder GitHub-URL ersetzen. Liefert Summary, Tree und Content. CLI + Python-Package + Web (gitingest.com).
- **Wie es Tokens spart:** Smart Formatting optimiert Ausgabe für LLM-Prompts. Token-Count-Statistiken. .gitignore-basiertes Skipping. Nur relevante Struktur/Inhalte werden extrahiert.
- **Integrationstyp:** CLI (pip/pipx), Python-Package, Web-Service, Browser-Extension, Docker (self-host)
- **Stars:** 15.3k
- **Relevanzscore:** 4 — gut für Python/Data-Science-Workflows, solide Token-Statistiken.

---

## 6. mksglu/context-mode
- **URL:** https://github.com/mksglu/context-mode
- **Kategorie:** Context-Saving / MCP-Server (Context-Management)
- **Was es tut:** MCP-Server, der alle vier Seiten des Context-Problems löst: Sandbox-Tools halten rohe Daten aus dem Context-Window, Session-Continuity via SQLite/FTS5/BM25, "Think in Code" (LLM schreibt Skripte statt Dateien zu lesen), keine Prose-Enforcement.
- **Wie es Tokens spart:** `ctx_execute` führt Code in 12 Sprachen in Sandbox aus, nur stdout kommt in den Context (56 KB → 299 B). `ctx_batch_execute` bündelt Befehle (986 KB → 62 KB). `ctx_index`/`ctx_search` chunken Markdown in FTS5 mit BM25-Ranking (60 KB → 40 B). Bis zu 98-100% Reduktion. Session-Continuity nach Kompaktion.
- **Integrationstyp:** MCP Server + Hooks (PreToolUse/PostToolUse/SessionStart), Plugin-Marketplace für Claude Code, Gemini CLI, Copilot, Cursor, Codex etc.
- **Stars:** n/a (kleines/neues Projekt)
- **Relevanzscore:** 5 — extrem direkt auf Claude-Code-Tokenminimierung ausgerichtet, mit messbaren Reduktionen.

---

## 7. colbymchenry/codegraph
- **URL:** https://github.com/colbymchenry/codegraph
- **Kategorie:** Code-Graph / Semantische Code-Intelligenz (CLI + MCP)
- **Was es tut:** Baut einen vollständigen Code-Graph (jedes Symbol, Call-Edge, Dependency) in einer lokalen SQLite-DB. Agent fragt eine Frage und bekommt relevante Source, Call-Paths und Blast-Radius in einem Call. 20+ Sprachen, Rust-Kernel, 100% lokal.
- **Wie es Tokens spart:** "Surgical Context" — ein Tool-Call liefert nur die relevanten Symbole/Snippets statt Datei-Crawling. Benchmarks: 0 File-Reads vs 12-19, 41-84% weniger Tokens, 13-78% günstiger. Framework-aware Routes, Impact Analysis.
- **Integrationstyp:** CLI (curl/npm), MCP Server (`codegraph_explore`), auto-config für Claude Code, Cursor, Codex, Copilot etc.
- **Stars:** 66.1k
- **Relevanzscore:** 5 — chirurgische Context-Auswahl mit messbarer Token-Reduktion, sehr relevant.

---

## 8. jia-gao/leanctx
- **URL:** https://github.com/jia-gao/leanctx
- **Kategorie:** Prompt-Kompression / Drop-in-Wrapper (Library)
- **Was es tut:** Drop-in-Prompt-Kompression für Produktions-LLM-Apps. Wrapper um OpenAI/Anthropic/Gemini-Clients. Loss-tolerance routing: klassifiziert jedes Prompt-Segment nach Verzerrungstoleranz und komprimiert unterschiedlich (verbatim / LLMLingua-2 / SelfLLM).
- **Wie es Tokens spart:** 10-40% Input-Token-Reduktion ohne Genauigkeitsverlust. Code/Stack-Traces/tool_use_id bleiben byte-identisch (0% verändert), Doku/Logs/Retrieval ~50% entfernt. Auf LongBench v2: −23% vs raw, −18.7% zusätzlich. Prose-heavy: bis 36.7%.
- **Integrationstyp:** Library (Python SDK, drop-in Clients), HTTP-Sidecar (für non-Python), OpenTelemetry
- **Stars:** n/a (neues Projekt)
- **Relevanzscore:** 4 — starke Kompression, aber eher für API-Apps als direkt für Claude-Code-CLI; dennoch relevant.

---

## 9. manojmallick/sigmap
- **URL:** https://github.com/manojmallick/sigmap
- **Kategorie:** Code-Grounding / Signatur-Map (CLI + MCP)
- **Was es tut:** Baut eine deterministische, verifizierbare Signatur-und-Evidence-Map der Codebase (keine LLM-Calls, keine Embeddings, byte-stabile Ausgabe). `sigmap verify` prüft, ob AI-Antworten an echte Signaturen/Zeilen verankert sind. 33 Sprachen.
- **Wie es Tokens spart:** Kompakte Signaturen statt voller Dateien in den Context. 96.8% Token-Reduktion (21 Repos), 82.2% hit@5 (vs 44.8% grep), 46.1% weniger Prompts pro Task. Evidence-Pack ersetzt "paste this into your prompt".
- **Integrationstyp:** CLI (npx/npm/binary), MCP Server (21 Tools), Adapter (CLAUDE.md, .cursorrules, AGENTS.md etc.), IDE-Extensions (VS Code, JetBrains, Neovim)
- **Stars:** n/a (neues Projekt)
- **Relevanzscore:** 5 — deterministische Token-Reduktion + Grounding, sehr relevant für Claude Code.

---

## 10. sriinnu/clipforge-PAKT
- **URL:** https://github.com/sriinnu/clipforge-PAKT
- **Kategorie:** Token-Kompression / Format-Transformation (Library + CLI + MCP)
- **Was es tut:** PAKT (Pipe-Aligned Kompact Text) konvertiert JSON/YAML/CSV/Markdown/Text in kompakte pipe-delimited Form, die zu weniger BPE-Tokens tokenisiert. Deterministisch, kein Modell. L1-L3 lossless, L4 opt-in lossy.
- **Wie es Tokens spart:** JSON 27-33% Reduktion, Logs mit Duplikaten 57%, repetitive Text 38-69%. Tokenizer-aware (echter BPE-Tokenizer). MCP-Server komprimiert Tool-Results, deduped über Turns, teilt @shared Dictionary. Prompt-Cache-Kooperation.
- **Integrationstyp:** Library (npm), CLI, MCP Server, Context Engine, Chrome-Extension, Desktop-App
- **Stars:** n/a (neues Projekt)
- **Relevanzscore:** 4 — effektive Token-Kompression für strukturierte Daten, relevant für Tool-Results in Claude Code.

---

## 11. rixinhahaha/snip
- **URL:** https://github.com/rixinhahaha/snip
- **Kategorie:** Visual Mode / Diagramm-Rendering (CLI + MCP + Desktop-App)
- **Was es tut:** Visual Mode für Claude Code (auch Cursor, Windsurf, Cline). Agent rendert Diagramme (Mermaid) und Previews (HTML) statt sie in Text zu beschreiben. Screenshot + Annotation-App mit lokaler AI-Organisation.
- **Wie es Tokens spart:** Indirekt — ersetzt lange Textbeschreibungen von Architektur/Diagrammen durch visuelle Darstellung, spart Output-Tokens. Keine direkte Input-Token-Kompression.
- **Integrationstyp:** CLI (`snip setup`), MCP Server, Desktop-App (macOS/Linux), Skill (`/diagram`)
- **Stars:** n/a
- **Relevanzscore:** 2 — nützlich für Visualisierung, aber keine direkte Tokenminimierung.

---

## 12. edouard-claude/snip
- **URL:** https://github.com/edouard-claude/snip
- **Kategorie:** Shell-Output-Filter / Token-Optimizer (CLI + Hook)
- **Was es tut:** CLI-Proxy, der Shell-Output filtert, bevor er in den Context-Window des AI-Coding-Assistenten gelangt. Deklarative YAML-Pipelines. 132 eingebaute Filter (git, go, rust, python, js/ts, build/deploy, system).
- **Wie es Tokens spart:** Filtert verbose Shell-Output. `go test` 689→16 Tokens (97.7%), `cargo test` 591→5 (99.2%), `git log` 371→53 (85.7%). Token-Savings-Report in SQLite. 60-90% Gesamtreduktion.
- **Integrationstyp:** CLI + PreToolUse-Hook (Claude Code, Cursor, Codex, Pi, Grok), Prompt-Injection (Copilot, Gemini, Windsurf, Cline, Kilo, Antigravity), Plugin (OpenCode, OpenClaw), Shell-Aliases (Aider)
- **Stars:** n/a
- **Relevanzscore:** 5 — extrem direkt auf Claude-Code-Tokenminimierung ausgerichtet, mit messbaren Reduktionen.

---

## 13. zilliztech/claude-context
- **URL:** https://github.com/zilliztech/claude-context
- **Kategorie:** Semantische Code-Suche / Vector-DB-Context (MCP)
- **Was es tut:** MCP-Plugin, das semantische Code-Suche zu Claude Code und anderen AI-Coding-Agents hinzufügt. Speichert Codebase in Vector-DB (Zilliz Cloud/Milvus) mit Hybrid-Search (BM25 + dense vector), AST-basiertes Chunking, inkrementelles Indexing (Merkle-Trees).
- **Wie es Tokens spart:** Statt ganze Verzeichnisse zu laden, nur relevante Code-Stücke in den Context. ~40% Token-Reduktion bei äquivalenter Retrieval-Qualität. Kein Multi-Round-Discovery nötig.
- **Integrationstyp:** MCP Server (Claude Code, Codex, Gemini, Cursor, Claude Desktop, Windsurf, VS Code, Cline, Roo, Zencoder), VSCode-Extension
- **Stars:** n/a (Zilliz-Projekt)
- **Relevanzscore:** 4 — semantische Selektion spart Tokens, aber erfordert Cloud-Vector-DB (Zilliz) + OpenAI-Key.

---

## 14. 0xranx/OpenContext
- **URL:** https://github.com/0xranx/OpenContext
- **Kategorie:** Persistenter Context / Knowledge-Store (CLI + MCP + Desktop)
- **Was es tut:** Persistenter Context-/Knowledge-Store für AI-Assistenten. Globale `contexts/`-Library, MCP-Server, Skills + Slash-Commands für Cursor/Claude Code/Codex, Desktop-App, Web-UI. Agent lädt History zuerst, handelt dann, persistiert danach.
- **Wie es Tokens spart:** Indirekt — verhindert, dass Context über Sessions/Repos verloren geht und neu erklärt werden muss (weniger Wiederholung = weniger Tokens). Manifest generiert Dateiliste für AI. Keine direkte Kompression.
- **Integrationstyp:** CLI (`oc`), MCP Server, Skills + Slash-Commands, Desktop-App (Tauri), Web-UI
- **Stars:** n/a
- **Relevanzscore:** 3 — nützlich für Context-Persistenz, aber keine direkte Tokenminimierung.

---

## 15. teamchong/pxpipe
- **URL:** https://github.com/teamchong/pxpipe
- **Kategorie:** Context-als-Bild / Token-Kompression (Proxy)
- **Was es tut:** Lokaler Proxy, der sperrige Context-Teile (System-Prompt, Tool-Docs, ältere History) in kompakte PNGs rendert, bevor sie Claude Code verlassen. Bild-Token-Kosten sind fix nach Pixeldimension, nicht nach Textmenge. Dichte Inhalte packen ~3.1 chars/image-token vs ~1 char/text-token.
- **Wie es Tokens spart:** ~59-70% niedrigere End-to-End-Rechnung. 80.6% Token-Savings (Claude-Profil). 4.7-5.0x Dichte-Multiplikator. Profitability-Gate imaget nur wo es sich lohnt. Lossy (Hex-Strings 13/15), Escape-Hatch für byte-exakte Arbeit.
- **Integrationstyp:** Proxy (ANTHROPIC_BASE_URL), CLI (`pxpipe warp`), Library (TypeScript), Offline-Export
- **Stars:** n/a
- **Relevanzscore:** 4 — innovative Token-Kompression via Bild-Kanal, aber lossy und workload-abhängig.

---

## Zusammenfassung / Ranking (Relevanz für Claude-Code-Tokenminimierung)

| Score | Repos |
| :--- | :--- |
| **5** | repomix, context-mode, codegraph, sigmap, edouard-claude/snip |
| **4** | code2prompt, yek, gitingest, leanctx, PAKT, claude-context, pxpipe |
| **3** | files-to-prompt, OpenContext |
| **2** | rixinhahaha/snip |

**Top-Empfehlungen für Claude Code Token Saving:**
1. **edouard-claude/snip** — filtert Shell-Output direkt im Claude-Code-Hook (60-90% Reduktion)
2. **mksglu/context-mode** — MCP-Sandbox + Session-Continuity (98% Reduktion)
3. **colbymchenry/codegraph** — chirurgische Context-Auswahl via Code-Graph (41-84% weniger Tokens)
4. **yamadashy/repomix** — Repo-Packing mit Tree-sitter-Kompression
5. **manojmallick/sigmap** — deterministische Signatur-Map (96.8% Token-Reduktion)
