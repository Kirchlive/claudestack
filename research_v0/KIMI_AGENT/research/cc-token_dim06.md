# dim06: Memory & Persistenz

**Dimension:** Cross-Session-Memory & Kontext-Persistenz — verhindert Neu-Erkunden und Wiederholungs-Lesen; ABER: Memory-Systeme kosten selbst Kontext (MCP-Tool-Definitionen, Session-Injection) und Kompressions-Memory kann Recall senken.
**Stand:** 2026-08-13 | **Autor:** Deep-Dive-Agent dim06

**Kernthese vorab:** Der Memory-Markt hat sich 2026 in drei Philosophien gespalten: **lossy-komprimiert** (claude-mem, agentmemory — LLM fasst zusammen, injiziert automatisch), **verbatim** (MemPalace — nichts geht verloren, aber Pull-only) und **dateibasiert** (planning-with-files, auto-memory, memsearch-Markdown — der Agent schreibt lesbare Dateien, Hooks injizieren sie). Die ehrliche Token-Bilanz zeigt: Die beiden größten Systeme nach Stars sind zugleich die mit dem höchsten versteckten Kontext-Overhead (MemPalace: 44 MCP-Tool-Defs; agentmemory: 54 MCP-Tool-Defs). Wer Token-Minimierung ernst nimmt, fährt mit Hook-/Skill-basierten Systemen oder dateibasierter Disziplin besser als mit MCP-lastigen Memory-Servern — oder scoped die MCP-Tools konsequent in Subagenten.

---

## Vergleichsmatrix

| System | ★ (13.08.26) | Philosophie | Recall-Mechanik | MCP-Tool-Defs | Session-Injection | Laufende API-Kosten | Recall-Qualität (Benchmark) | Datenschutz | Reife |
|---|---|---|---|---|---|---|---|---|---|
| **claude-mem** (thedotmack) | 90.548 | lossy (LLM-Kompression) | **Push** (SessionStart) + Pull (3-Layer-MCP) | 3–4 Tools (klein) | ~800–3.000 T (konfigurierbar; Worst Case ~12.500 T bei 50 Obs.) | $5–15/Mon. (Kompression via Agent SDK; läuft auf Subscription oder API) | kein unabhängiger Benchmark; ~10× Ersparnis via Progressive Disclosure behauptet | lokal default; `<private>`-Tags; opt-in Cloud-Sync (cmem.ai) | hoch (v13.4.0, 269 Releases, Server-Beta für Teams) [^1^][^9^][^10^][^11^] |
| **MemPalace** | 58.329 | **verbatim** (keine LLM-Verfälschung) | **Pull-only** (CLI/MCP `search`, `wake-up`); Auto-Save-Hooks nur Schreibseite | **44 Tools ⇒ 4.370–8.570 T/Session Overhead** | 0 (kein SessionStart-Hook für CC; nur Cursor hat Session-Recall) | **$0** (kein LLM nötig; Embeddings lokal, ~300 MB Modell) | LongMemEval R@5 96,6 % raw / 98,4 % hybrid (held-out) / ≥99 % + LLM-Rerank; LoCoMo R@10 60,3→88,9 %; ConvoMem 92,9 %; MemBench 80,3 % | vollständig lokal; Impostor-Domain-Warnung | hoch (v3.7.0), aber PreCompact-Bugs offen [^2^] |
| **agentmemory** (rohitg00) | 26.922 | lossy + 4-Tier-Konsolidierung + Decay | Push (opt-in!) + Pull; 12 Hooks, 15 Skills | **54 Tools** (größte Tool-Fläche im Feld) | AUS per Default (`AGENTMEMORY_INJECT_CONTEXT=false`); an: ~1–2K Zeichen, Budget 2.000 T | Modellabhängig: 35h-Workload = $0,40 (DeepSeek) bis $5,02 (Sonnet); lokal via Ollama/LM Studio = $0 | LongMemEval-S R@5 95,2 % / R@10 98,6 % (eigener Harness, nicht unabhängig auditiert); ~1.900 T/Session vs. 22K T CLAUDE.md-Dump (−92 %) | lokal default (SQLite + iii-Engine); Cloud-Provider optional | mittel-hoch (v0.9.x, schnelle Iteration; Stabilitäts-Issues bei Großkorpora) [^3^][^4^][^5^] |
| **planning-with-files** (OthmanAdi) | 26.128 | **dateibasiert** (task_plan/findings/progress.md) | Push via Hooks: Re-Injection **jeden Turn** | 0 (reine Hooks + Skill) | Plan-Block pro Turn (~200–600 T × Turns = kumulativ signifikant; `PWF_INJECT=smart` + Autonomous-Mode reduzieren) | **$0** (Markdown + Shell-Hooks) | interner Recovery-Benchmark: Resume nach /clear in 5,0 vs. 13,3 Turns; 96,7 % Assertion-Pass (30 Asserts, Autor-run) | vollständig lokal, gitignorebar | hoch (v3.x, 417 Tests, 60+ Agents) [^6^] |
| **memsearch** (zilliztech) | 2.457 | Markdown = Source of Truth, Milvus = Shadow-Index | Pull (Skill `/memory-recall`, Auto-Invoke) + Turn-Capture via Stop-Hook | 0 MCP-Tools (Skill + CLI) | 0 Push; Recall on demand | Embeddings **lokal** (ONNX bge-m3, 558 MB, $0); Turn-Summaries via Haiku default (API-Kosten) — auf lokales LLM routingbar | kein öffentlicher Retrieval-Benchmark; hybrid BM25+dense+RRF, SHA-256-Dedup | lokal möglich (Milvus Lite); Zilliz Cloud optional | mittel (vendor-backed, aktiv) [^7^][^8^] |
| **OpenContext** (0xranx) | 729 | dateibasierter persönlicher Kontext-Store (global, repo-übergreifend) | **Pull-only, manuell** (`/opencontext-context`, `-search`, `-create`, `-iterate`) | MCP-Server (kleine Tool-Fläche) | 0 automatisch | $0 | kein Benchmark | lokal (CLI + Tauri-Desktop + Web-UI) | früh-mittel [^12^] |
| **claude-self-reflect** (ramakay) | 221 | verbatim-Rohchunks + progressive Anreicherung (3 Layer) | Push (SessionStart/UserPromptSubmit) + Pull (15 MCP-Tools) | 15 Tools | automatisch bei Prompt-Submit (prädiktiv) | $0 Basis; optionale AI-Narratives ~$0,012/Konversation (Batch, auf Subscription; `CSR_NO_AI_NARRATIVES=1`) | eigene Evals: 9,3× Qualitätsgewinn mit Narratives; Preprint mit Multi-Hop-Retrieval (+47–53 % Coverage vs. kNN) | vollständig lokal (44-MB-Rust-Binary, SQLite+HNSW+FastEmbed) | mittel (v9.4, 720+ Tests, 1-Maintainer) [^13^] |
| **auto-memory** (severity1) | 155 | CLAUDE.md-Sync (Marker-basiert) | indirekt: CLAUDE.md wird vom Host geladen | 0 | 0 (CLAUDE.md-Standardladung zählt nicht zum Plugin) | Subagent-Token pro Turn-Ende (isoliert; 0 Main-Session-Kosten, aber reale API-Tokens) | kein Benchmark; bekämpft Staleness strukturell | lokal, keine Deps | früh, aber sauber designt [^14^] |

---

## Detailprofile

### 1. claude-mem (thedotmack) — 90,5k★ — der Push-Marktführer
- **Installation:** `npx claude-mem install` oder `/plugin install claude-mem` (Marketplace). Warnung: `npm install -g claude-mem` installiert nur das SDK **ohne** Hooks/Worker — ein bekannter Installations-Fallstrick. [^1^][^10^]
- **Architektur:** 5 Lifecycle-Hooks (SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd; 6 Hook-Skripte) + Bun-Worker (HTTP-API, Web-Viewer) + SQLite/FTS5 + Chroma-Vektor-DB (hybrid). v13.1 brachte Server-Beta (Postgres + BullMQ, Tenant-Isolation) für Teams; Lizenz AGPL→Apache-2.0. [^1^][^9^]
- **Token-Footprint:** MCP-Seite klein (3–4 Tools: `search`, `timeline`, `get_observations` + mem-search-Skill). Injection bei SessionStart: typisch ~800–3.000 T (konfigurierbar, default top-50-Observationen; Worst-Case-Rechnung 50 Obs. × ~250 T ≈ 12.500 T ≈ $0,0375/Session-Start auf Sonnet). Progressive Disclosure spart ~10× gegenüber Vollabruf; Drittquellen beziffern ~2.250 T Ersparnis/Session und 11–18× bei Code-Navigation. [^10^][^11^][^15^]
- **Laufende Kosten:** Jede Tool-Observation (1.000–10.000 T roh) wird per Agent SDK auf ~500 T komprimiert — ~50.000 T pro 100 Observationen (~$0,15 auf Sonnet); real ~$5–15/Monat je nach Aktivität. [^10^][^11^]
- **/compact & lange Sessions:** Kein PreCompact-Hook; Kompression läuft asynchron im Worker, blockiert nicht. SessionEnd finalisiert.
- **Issues (Token-relevant):** #1719 (PreToolUse:Read Cache-Bug) inzwischen **geschlossen**. Offen: **#3480** — `file-context`-Hook re-injiziert denselben „prior observations"-Block bei **jedem Read** derselben Datei (direkter Token-Verschwender); **#3511** — EXCLUDED_PROJECTS ignoriert, eingefrorener Digest wird weiter injiziert; **#3274** — Subagent-Observationen landen ungefiltert in der Injection; **#3205/#3216** — Chroma-Prozess-Leak bis zum OOM (759 Prozesse/71 GB RSS); #3544 — legt Stub-CLAUDE.md in fremden Dirs an. [^16^]
- **Datenschutz:** lokal default, `<private>`-Tags, optionaler Cloud-Sync (cmem.ai). [^1^]

### 2. MemPalace — 58,3k★ — der Verbatim-Champion mit Tool-Def-Problem
- **Philosophie:** Speichert Konversationen **wortgetreu** („does not summarize, extract, or paraphrase"); Struktur: Wings/Rooms/Drawers; Backend steckbar (ChromaDB default, sqlite_exact, Milvus, Qdrant, pgvector). [^2^]
- **Installation:** `uv tool install mempalace` / pipx / Docker; MCP als stdio-Server. Auto-Save-Hooks (periodisch + vor Kompaktierung) für Claude Code, Codex, Cursor — aber nur **Schreibseite**: Claude Code bekommt **keinen** SessionStart-Recall-Hook; Recall ist Pull (`mempalace wake-up`, `search`, `sweep`). [^2^]
- **Token-Footprint (ehrlich):** **44 MCP-Tools** ⇒ real 4.370–8.570 Tokens Tool-Definitions-Overhead **pro Session** — widerlegt jeden „~170 Token Startup"-Claim. Dafür 0 Injektions- und 0 API-Kosten (LongMemEval-Pfad komplett ohne LLM/API-Key; Embedding-Modell ~80–300 MB lokal). [^2^]
- **Recall-Qualität:** Beste dokumentierte des Feldes: LongMemEval R@5 96,6 % raw (ohne LLM), 98,4 % hybrid held-out, ≥99 % mit LLM-Rerank; LoCoMo R@10 60,3→88,9 % (hybrid v5); ConvoMem 92,9 %; MemBench 80,3 %. Ergebnisdateien committed, reproduzierbar. [^2^]
- **/compact & lange Sessions:** **Schwachpunkt.** PreCompact-Hook blockiert bekannt fehlerhaft: #856 (Compaction abgebrochen statt deferred) geschlossen, aber Nachfolger offen: **#1601** „PreCompact hook always blocks regardless of save state" und **#906** „preCompact prevents compacting when context limit is reached" — genau der Moment, in dem Memory am wichtigsten wäre. Außerdem: #961 (keine Staleness-Detection für KG-Fakten), #1845/#1908 (MCP-Tools hängen nach unterbrochenem `mine`, ChromaDB-1.x-Compactor), #1564 (stale HNSW-Quarantine). [^17^]
- **Wichtig:** README-Warnung „Claude Code sessions expire in 30 days without auto-save hooks" + Impostor-Domain-Warnung (nur GitHub/PyPI/mempalaceofficial.com). [^2^]

### 3. agentmemory (rohitg00) — 26,9k★ — verifizierter Neu-Fund, Feature-Maximalist
- **Verifikation:** Exaktes Repo = `github.com/rohitg00/agentmemory` (Apache-2.0, TypeScript; 26.922★ am 13.08.2026; npm `@agentmemory/agentmemory`; Server :3111, Viewer :3113; SQLite + hauseigene „iii engine" v0.11.2 gepinnt). [^3^][^4^]
- **Installation:** `npm i -g @agentmemory/agentmemory` → `agentmemory` → `agentmemory connect claude-code` (verdrahtet **12 Hooks** automatisch in settings.json) oder Plugin-Route (registriert Hooks + 15 Skills + MCP stdio). [^3^]
- **Token-Footprint (ehrlich):** **54 MCP-Tools** — die größte Tool-Def-Fläche im Vergleich (Größenordnung 5.000–10.000 T/Session, wenn global registriert). ABER: Injection ist **per Default aus** (`AGENTMEMORY_INJECT_CONTEXT=false`; wenn an: ~1–2K Zeichen, `TOKEN_BUDGET=2000`); Auto-Kompression per Default aus (`AGENTMEMORY_AUTO_COMPRESS=false` — „expect significant token spend" wenn an). Eigenangabe: ~1.900 T/Session vs. 22K+ T CLAUDE.md-Dump bei 240 Observationen (−92 %); ~170K T/Jahr (~$10) vs. ~650K T (~$500) für LLM-summarisierte Alternativen. [^3^][^5^]
- **Laufende Kosten (gemessen, nicht geschätzt):** Eigener Captured-Workload 635 Requests / 888K Tokens / 35h: DeepSeek-V4-Pro ~$0,46, Qwen3-Coder ~$0,55, Sonnet-4.6 ~$5,02, Opus „vermeiden" (~$25+). Lokale Embeddings (all-MiniLM-L6-v2) default; lokales LLM via Ollama/LM Studio ⇒ $0. Runtime-Warnung bei Premium-Modellen eingebaut. [^5^]
- **Recall:** BM25+Vektor+Graph via RRF; 4-Tier-Konsolidierung (working/episodic/semantic/procedural) mit Ebbinghaus-Decay, Auto-Evict, Widerspruchsauflösung. LongMemEval-S R@5 95,2 % / R@10 98,6 % — eigener Harness, Korpus publiziert, **nicht unabhängig auditiert** (mem0/Letta-Vergleiche vom Autor selbst gerechnet). [^3^][^4^]
- **Issues:** Stresstest-Bericht (674 Sessions / 370K Observationen): #502 (Graph-Auto-Trigger feuert nie), #544 (500er bei großem Korpus), #587 (Buffer-Pool-Crash-Loops), #474 (stale Engine-Reste), #455 (Embedding-Dim-Override fehlt). Staleness: #1157 (Eviction lässt Zähler/Graph stale), #938 (Import-Replace lässt Indizes stale). [^18^][^19^]
- **Datenschutz:** lokal default; Privacy-Filter strippt Secrets vor Speicherung; Multi-Agent-Scopes (AGENT_ID, Leases, Signals). [^3^]

### 4. planning-with-files (OthmanAdi) — 26,1k★ — dateibasiertes Arbeitsgedächtnis (Manus-Muster)
- **Philosophie:** „Context Window = RAM, Filesystem = Disk." Drei Dateien (`task_plan.md`, `findings.md`, `progress.md`) überleben `/clear`, Crash, Compaction; parallele Pläne in `.planning/YYYY-MM-DD-slug/`. [^6^]
- **Token-Footprint (ehrlich):** 0 Tool-Defs, 0 API — aber die Hooks **re-injizieren den Plan jeden Turn** (5 Hooks auf CC: UserPromptSubmit, PreToolUse, PostToolUse, Stop, PreCompact). Das ist kumulativ der größte Kontext-Posten des Systems (grober Plan-Block à ~200–600 T × Dutzende Turns). Gegenmittel eingebaut: `PWF_INJECT=smart` (nur Goal/nächster Schritt/aktuelle Phase/letzte 3 Entscheidungen statt fixem head-50-Fenster) und Autonomous-Mode (`/pwf --autonomous`) streicht die Per-Tool-Call-Rezitation. [^6^]
- **/compact-Interaktion:** PreCompact-Hook erinnert an Progress-Flush (mit Plan-SHA256 bei Attestation); Session-Catchup rekonstruiert nach /clear aus dem Session-Store. Interner Benchmark: Resume in 5,0 Turns vs. 13,3 ohne Methode (Autor-run, deterministisch benotet). SHA-256-Attestation verweigert manipulierte Pläne. [^6^]
- **Befund fürs Thema:** Der Token-Gewinn entsteht nicht durch das System selbst, sondern weil der Agent **nicht neu erkundet** — 8,3 gesparte Re-Orientierungs-Turns à mehrere Datei-Reads übersteigen die Injektionskosten deutlich.

### 5. memsearch (zilliztech) — 2,5k★ — Markdown-Wahrheit + Vektor-Schattenindex
- **Philosophie:** Tägliche `.md`-Dateien (`.memsearch/memory/`) sind die Wahrheit; Milvus (Lite default, Zilliz Cloud, Self-Host) ist rebuildbarer Shadow-Index. Git-fähig, menschenlesbar, cross-agent (Claude Code, OpenClaw, OpenCode, Codex). [^7^][^8^]
- **Installation:** `/plugin install memsearch` (Marketplace); Stop-Hook summarized jeden Turn (Haiku default — API-Kosten; routingbar auf OpenAI/Ollama/lokal); Embeddings ONNX bge-m3 lokal ($0, 558 MB Download). [^7^]
- **Token-Footprint:** Kein MCP — Recall läuft über `/memory-recall`-Skill (progressive Disclosure, 3 Layer: search→expand→transcript). Kein Push, keine Tool-Defs. Kosten = Haiku-Summary pro Turn + Recall-Abrufe on demand. SHA-256-Dedup verhindert Re-Embedding unveränderter Chunks. [^7^]
- **Extras (default AUS):** PROJECT.md/USER.md-Hintergrundpflege; „Skills from Memory" (destilliert wiederholte Workflows zu installierbaren Skills — prozedurales Gedächtnis). `memsearch compact` für LLM-gestützte Chunk-Verdichtung. [^7^]
- **Kontext:** Vendor (Zilliz/Milvus) nutzt den Leak der CC-2.1.88-Sourcen als Pitch: Built-in-Memory = 200-Zeilen-MEMORY.md-Cap + Grep-only ⇒ memsearch als agent-übergreifende Schicht. [^8^]

### 6. OpenContext (0xranx) — 729★ — manueller Kontext-Store mit GUI
- Persönliche, **globale** (repo-übergreifende) `contexts/`-Bibliothek; `oc`-CLI + MCP-Server + Skills/Slash-Commands (generiert via `oc init`) + Tauri-Desktop + Web-UI. [^12^]
- **Token-Profil:** Pull-only und explizit (`/opencontext-context` laden, `-search`, `-create`, `-iterate`). Kein Auto-Capture, keine Hooks ⇒ **minimalster Kontext-Footprint** des Feldes, aber kein automatischer Nutzen; Wert hängt an Nutzerdisziplin. „Bring your own agent" (nutzt Codex/Claude/OpenCode-CLI, kein Extra-Abo). $0, lokal. [^12^]

### 7. claude-self-reflect (ramakay) — 221★ — Rust-Binary mit wissenschaftlichem Anspruch
- Ein 44-MB-Rust-Binary: SQLite + HNSW (<1 ms p95) + FastEmbed (384-dim lokal) + AST-Code-Graph. **6 Hooks** (inkl. **PreCompact**-State-Backup!) + **15 MCP-Tools** (u. a. `csr_why` Provenance, `csr_code_graph`). Konsent-basierte Aktivierung. [^13^]
- **Token-Profil:** Push (SessionStart + prädiktives UserPromptSubmit) + Pull; 15 Tool-Defs (~1.500–3.000 T). Optionale AI-Narratives: 82 % Token-Kompression, ~$0,012/Konversation via Batch auf der **bestehenden Subscription**, transparent gezählt (`csr-engine status`), abschaltbar (`CSR_NO_AI_NARRATIVES=1`). [^13^]
- **Beachtenswert:** Preprint „Similarity Drowns Intent" — misst, dass reine Cosine-Suche Echos der Frage statt der Entscheidung findet (Multi-Hop +47–53 % Coverage), und dokumentiert den Meta-Fehler, dass ein sich selbst aufzeichnendes Memory seine eigenen Eval-Dialoge verschluckt. Seltene Ehrlichkeit inkl. negativer Ergebnisse. [^13^]

### 8. severity1/claude-code-auto-memory — 155★ — Null-Main-Session-Footprint
- Plugin: PostToolUse-Hook (Edit|Write|Bash) appended Pfade zu `.claude/auto-memory/dirty-files` — **0 Tokens Output**; Stop-Hook spawnt bei Bedarf einen **isolierten Subagenten** (memory-updater → memory-processor-Skill), der markerbasiert (`<!-- AUTO-MANAGED -->`) CLAUDE.md aktualisiert. Manueller Inhalt bleibt unangetastet; Subtree-CLAUDE.md für Monorepos; `gitmode` (nur bei Commit). [^14^]
- **Token-Wahrheit:** 0 Kosten im Main-Kontext — aber nicht 0 Kosten absolut: Jede Turn-Ende-Sync kostet Subagent-Tokens (API/Subscription), nur außerhalb des Haupt-Kontextfensters. Bekämpft genau das Staleness-Problem (CLAUDE.md driftet), das alle Push-Memory-Systeme haben. [^14^]

---

## Sekundär-Repos Kurzliste

| Repo | Stand | Kurzbefund |
|---|---|---|
| **doobidoo/mcp-memory-service** | ~1,9k★ (05/26); GitHub-Account **404 seit ~07/26** (Ultimate-Guide-Check), letzter bestätigter Stand v10.0.2 | Semantische Memory, SQLite-vec default (v8 Breaking Change von ChromaDB), Cloudflare-Backend für Teams, OAuth/Dashboard. Bekannte Bugs: SQLite busy_timeout bei Multi-Client (`MCP_MEMORY_SQLITE_PRAGMAS=busy_timeout=15000`), Backend-Mismatch MCP↔Dashboard. **Nicht mehr verlässlich erreichbar — vor Zitierung verifizieren.** [^20^] |
| **Context Cloud (abhinavala/cntxtv2)** | aktiv (contextcloud.pro, npm `@contextcloud/mcp-client`) | Einziger Memory-MCP mit **Team-Workspaces, RBAC, Attribution**; Cloud-gehostet (MCP-Endpoint api.contextcloud.pro) ⇒ Datenschutz-Trade-off; für Solo-Token-Minimierung irrelevant, für Team-Lücke relevant. [^21^] |
| **zippoxer/recall** | 194★, letzter Push 2026-01 (**stale**) | Full-Text-Search + Resume für Claude/Codex-Konversationen; klein, pull-only, kein Overhead. [^22^] |
| **iannuttall/claude-sessions** | 1.211★, **archiviert** (06/2025) | Slash-Commands für Session-Tracking/Doku; ersetzt durch native Features + neuere Tools. [^22^] |
| **Vvkmnn/claude-historian-mcp** | 177★, aktiv (06/26) | MCP für Konversationshistorie-Suche; Nische, kleine Tool-Fläche. [^22^] |
| **skymanbp/cc-memory** | 5★, aktiv (08/26) | Winzling: Auto-Save/Restore über Compaction hinweg; unreif. [^22^] |
| **daaain/claude-code-log** | 1.193★, aktiv (07/26) | Kein Memory, sondern JSONL→HTML/Markdown-Renderer — nützlich als **Grundlage** für dateibasierte Memory-Pipelines (z. B. MemPalace-Mining). [^22^] |
| **memnode.dev** | kommerziell/gehostet + Rust-Binary | Fakt-Layer mit Lineage/Namespaces, local-first Data-Plane; Positionierung gegen Mem0-Plugin (9 MCP-Tools, Cloud). Relevanz: „Lineage-by-default" als Korrektur-Mechanismus — fehlt beiden Marktführern. [^23^] |
| **MagnaCapax-Gist (Kontext-Befund)** | — | Bestätigt im Verlauf: Weder claude-mem noch MemPalace haben Knowledge-Integrity-Mechanismen (Widerspruchsauflösung/Verifikation) — MemPalace Issue #961 (Staleness-Detection) ist bis heute offen; agentmemory wirbt mit Widerspruchsauflösung, CC-nativer „Auto Dream" (Leak 2.1.88) macht sie nativ. [^8^][^17^] |

---

## Token-Kosten-Wahrheit je System (Tool-Defs + Injection + API)

| System | Tool-Def-Overhead/Session | Session-Injection | Laufende API-Kosten | Wahrheit in einem Satz |
|---|---|---|---|---|
| claude-mem | klein (~500–800 T, 3–4 Tools) | 800–3.000 T typisch (bis ~12.500 T konfigurierbar); **Bug #3480 injiziert bei jedem Read erneut** | $5–15/Mon. (Kompression) | Faire Push-Kosten, aber laufende LLM-Rechnung + Inject-Bugs. [^10^][^16^] |
| MemPalace | **4.370–8.570 T (44 Tools)** | 0 (pull-only) | **$0** | Der „kostenlose" Champion zahlt seinen Preis im Tool-Def-Overhead jeder Session. [^2^] |
| agentmemory | **~5.000–10.000 T (54 Tools)** wenn MCP global registriert | 0 per Default; an: ≤2.000 T Budget | $0 (lokal) bis ~$5/35h (Sonnet) | Spart 92 % Injection-Token, verschenkt es an Tool-Defs — außer man scoped. [^3^][^5^] |
| planning-with-files | 0 | ~200–600 T **pro Turn** (kumulativ größter Posten; smart/autonomous reduzieren) | $0 | Per-Turn-Injection ist ehrlich teuer, spart aber 8+ Re-Orientierungs-Turns. [^6^] |
| memsearch | 0 (Skill-basiert) | 0 Push; Recall on demand | Haiku-Summary/Turn (routingbar auf $0 lokal); Embeddings $0 | Sauberstes Kostenmodell unter den Auto-Capture-Systemen. [^7^] |
| OpenContext | klein (wenige MCP-Tools) | 0 (manuell) | $0 | Billigstes System — weil es nichts automatisch tut. [^12^] |
| claude-self-reflect | ~1.500–3.000 T (15 Tools) | Push bei SessionStart + PromptSubmit (Größe nicht öffentlich beziffert) | $0 Basis; ~$0,012/Conv mit Narratives | Günstig + PreCompact-Backup; einziger Push-Anbieter mit ehrlicher Kosten-Telemetry. [^13^] |
| auto-memory | 0 | 0 (Main-Session) | Subagent-Tokens pro Turn-Ende (versteckt, aber real) | Null Kontext-Kosten, nicht null Token-Kosten. [^14^] |

**Referenzrahmen:** CC-natives MEMORY.md (Leak v2.1.88): 200-Zeilen-Cap (~25 KB ≈ 6–8K T volle Ladung), Grep-only — agentmemorys „22K+ T bei 240 Observationen"-Vergleich bezieht sich genau auf diesen Dump. [^8^][^3^]

---

## Konflikte & Fallstricke

1. **Tool-Def-Paradox (dim06 ↔ dim MCP-Management):** Die recall-stärksten Systeme (MemPalace 44, agentmemory 54 Tools) erzeugen den größten statischen Kontext-Overhead. MCP-Tool-Definitionen werden **jede Session, jeden Turn** mitgeschleppt — ein Memory-System, das 8K T Tool-Defs lädt, muss erst ~30+ Datei-Neu-Reads einsparen, um break-even zu sein. Werbehinweise („~170 Token Startup", „92 % weniger Token") ignorieren Tool-Defs systematisch. [^2^][^3^]
2. **Push vs. Pull ist der eigentliche Token-Hebel:** Push (claude-mem, CSR) zahlt Injection-Kosten **auch in Sessions, die kein Memory brauchen**; Pull (MemPalace, memsearch, OpenContext) zahlt nur bei Abruf — verlässt sich aber darauf, dass das Modell weiß, *dass* es etwas nicht weiß. Hybrid (Push von 3–5 Zeilen „was zuletzt war" + Pull für Tiefe) ist das Optimum; claude-mem und agentmemory (Budget-Cap) kommen dem am nächsten.
3. **PreCompact ist der kritische Moment — und dort versagen zwei Leader:** MemPalace #856/#1601/#906 (Hook blockiert Compaction) und claude-mem (gar kein PreCompact-Hook) vs. CSR (PreCompact-State-Backup) und planning-with-files (PreCompact-Flush-Reminder). Genau beim Übergang, an dem Kontext verloren geht, muss Memory zuverlässig schreiben. [^17^][^13^][^6^]
4. **Lossy-Kompression senkt Recall messbar:** claude-mem/agentmemory komprimieren 1.000–10.000 T auf ~500 T — die Entscheidungs-*Begründung* („warum jose statt jsonwebtoken") ist die typische Verluststelle. CSR-Preprint zeigt zusätzlich: Semantische Suche findet Echos der Frage statt der Entscheidung. Verbatim (MemPalace) ist recall-sicher, aber retrieval-abhängig. [^11^][^13^]
5. **Staleness/Widersprüche sind das ungelöste Kernproblem:** MemPalace #961 offen; agentmemory #1157/#938 offen; CC-nativ braucht „Auto Dream". Ein stale Memory ist schlimmer als kein Memory — der Agent folgt veralteten Fakten selbstbewusst. Nur CC-nativ (Auto Dream) und agentmemory (Decay + Widerspruchsauflösung, teilweise) adressieren das strukturell. [^17^][^19^][^8^]
6. **Re-Injection-Bugs machen Push teurer als behauptet:** claude-mem #3480 (Read-Wiederholungs-Injection), #3511 (EXCLUDED_PROJECTS ignoriert), #3274 (Subagent-Obs in Injection) — alle offen, alle token-relevant. [^16^]
7. **Selbst-Aufzeichnungs-Meta-Falle:** Memory-Systeme ingestieren ihre eigenen Eval-/Nutzungsdialoge und „ertränken" die gesuchten Fakten (CSR-Preprint, empirisch). [^13^]
8. **Installations-Fallstricke:** claude-mem via `npm i -g` = keine Hooks; planning-with-files via `npx skills add` = evtl. **silent hook-less** (Plugin-Route + `/plan-doctor` verifizieren); MemPalace: Impostor-Domains. [^1^][^6^][^2^]

---

## Stack-Empfehlung für diese Schicht

**(i) Welches Memory-Setup für Solo-Dev?**
- **Klein (1 Projekt, <10 Sessions/Woche, Token-geizig):** Kein Memory-Server. CLAUDE.md (kuratiert) + planning-with-files für laufende Tasks + HANDOFF.md-Disziplin. Optional auto-memory, damit CLAUDE.md nicht veraltet (0 Main-Session-Kosten). Gesamt-Overhead: ~0–500 T.
- **Mittel (mehrere Projekte, tägliche Nutzung):** **claude-mem** (bestes Automatik/Kosten-Verhältnis, kleine MCP-Fläche, Injection konfigurierbar) — mit Workarounds: Injection-Budget niedrig setzen, #3480 im Auge behalten. Alternative für API-Kosten-Sensitive: **memsearch** (Skill-basiert, lokale Embeddings, Markdown-Kontrolle) oder **claude-self-reflect** (PreCompact-Backup, Narratives abschaltbar).
- **Power (Monate lange Historie, Multi-Agent, Archäologie-Bedarf):** **MemPalace für verbatim Langzeit-Recall** — aber **nicht global als MCP registriert**, sondern via Subagent-Frontmatter oder Tool-Scoping (sonst 4–9K T/Session Tool-Defs); plus planning-with-files als Arbeitsgedächtnis. Wer Multi-Agent-Koordination (Leases/Signals) braucht: agentmemory mit **lokalem LLM** (Ollama qwen2.5-coder:7b ⇒ $0) und INJECT_CONTEXT nur für dedizierte Resume-Sessions.

**(ii) Lohnt Memory überhaupt bei CLAUDE.md + HANDOFF.md-Disziplin?**
Für **statische Fakten** (Konventionen, Build-Commands, aktuelle Task-Lage): Nein — Datei-Disziplin ist strikt überlegen (0 Tool-Defs, 0 API, git-versioniert, kein Staleness-Mechanismus nötig außer auto-memory). Der Grenznutzen echter Memory-Systeme liegt in **episodischem Wissen**: „Welche 3 Ansätze haben wir im März verworfen und warum?", „Wie haben wir den Redis-Port-Konflikt gelöst?" — Dinge, die niemand diszipliniert in HANDOFF.md schreibt. Faustregel: Unter ~4 Wochen Projekthistorie oder Einzel-Projekt ⇒ Dateien reichen. Darüber, Multi-Projekt oder Team-Onboarding ⇒ Pull-Memory (MemPalace/memsearch) amortisiert sich; der teure Push-Komfort (claude-mem) lohnt vor allem für Wechsel-reiche Workflows.

**(iii) Memory-MCPs nicht zum Token-Fresser machen:**
1. **Nie global registrieren:** Memory-MCP nur projektweise (`.mcp.json`) oder — besser — in **Subagent-Frontmatter `mcpServers:`** packen (z. B. ein `memory-archaeologist`-Subagent mit MemPalace/agentmemory-Tools). Die 44/54 Tool-Defs landen dann nur im Subagent-Kontext, nie im Main-Window; Ergebnisse kommen als kurze Zusammenfassung zurück.
2. **Skill/CLI statt MCP bevorzugen:** memsearch-Skill, claude-mem-Skill, MemPalace-CLI via Bash — Progressive Disclosure lädt Definitionen nur bei Bedarf.
3. **Push minimieren, Pull budgetieren:** Injection-Budgets hart setzen (agentmemory `TOKEN_BUDGET=2000`, claude-mem Obs-Anzahl reduzieren), `AGENTMEMORY_INJECT_CONTEXT`/`AUTO_COMPRESS` nur gezielt an.
4. **Hook-Ausgaben auditieren:** Nach jedem Update claude-mem #3480-artige Duplikat-Injection prüfen (`/context`-Befehl, plan-doctor-Analogie); PreCompact-Verhalten testen (MemPalace erst nach Fix von #1601/#906 mit Auto-Save-Hooks betreiben).
5. **Ein Memory-System, nicht zwei:** Zwei Memory-MCPs parallel = doppelte Tool-Fläche + Schreib-Konfusion (memnode dokumentiert das explizit). Scope-Trennung (user-level vs. repo-level) wenn schon kombiniert. [^23^]

---

## Quellen

[^1^]: github.com/thedotmack/claude-mem — README v13.4.0 (Hooks, MCP-Tools, Progressive Disclosure, Privacy, Install-Warnung) — https://github.com/thedotmack/claude-mem
[^2^]: github.com/MemPalace/mempalace — README v3.7.0 (verbatim, 44 MCP-Tools, Benchmarks, Hooks, Backends, Impostor-Warnung) — https://github.com/MemPalace/mempalace
[^3^]: github.com/rohitg00/agentmemory — README (12 Hooks, 54 MCP-Tools, 15 Skills, 4-Tier, INJECT_CONTEXT/AUTO_COMPRESS Defaults, 1.900-T-Vergleich) — https://github.com/rohitg00/agentmemory
[^4^]: FlorianBruniaux/claude-code-ultimate-guide — guide/core/memory-systems.md, Abschnitt 3.2 agentmemory (25.872★ am 27.07.26, Benchmarks, Auditing-Einschränkung) — https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/core/memory-systems.md
[^5^]: agentmemory README — „Cost-aware model selection" (635 req/888K T/35h: DeepSeek $0,46 / Sonnet $5,02) + Token-Savings-Tabelle (~170K T/Jahr ~$10) — https://github.com/rohitg00/agentmemory
[^6^]: github.com/OthmanAdi/planning-with-files — README v3.x (3-File-Pattern, 5 CC-Hooks, PWF_INJECT=smart, Recovery-Benchmark 5,0 vs. 13,3 Turns, PreCompact-Flush, hook-less-Warnung) — https://github.com/OthmanAdi/planning-with-files
[^7^]: github.com/zilliztech/memsearch — README (Markdown-SoT, Milvus-Shadow, ONNX bge-m3, Stop-Hook-Haiku, 3-Layer-Recall, PROJECT/USER.md, Skills-from-Memory) — https://github.com/zilliztech/memsearch
[^8^]: Milvus Blog — „Claude Code Memory System Explained" (Leak 2.1.88: 4 Layer, 200-Zeilen-Cap, Grep-only, Auto Dream, KAIROS) — https://milvus.io/blog/claude-code-memory-memsearch.md
[^9^]: Augment Code — „claude-mem hits 74.8K stars" (v13.1 Server-Beta Postgres/BullMQ, Apache-2.0-Wechsel) — https://www.augmentcode.com/learn/claude-mem-74k-stars-agent-memory
[^10^]: corti.com — Claude-Mem Architektur & Token-Ökonomie (50 Obs. × 250 T ≈ 12.500 T Injection; $0,15/100 Obs. Kompression; 1.000–10.000 T → ~500 T) — https://corti.com/claude-mem-persistent-memory-for-ai-coding-assistants/
[^11^]: apidog Blog — „How to Use Claude-mem" (5 Hooks, ~2.250 T Ersparnis/Session) — https://apidog.com/blog/how-to-use-claude-mem/
[^12^]: github.com/0xranx/OpenContext — README (oc CLI, MCP, Skills/Slash-Commands, Desktop/Web-UI, BYO-Agent) — https://github.com/0xranx/OpenContext
[^13^]: github.com/ramakay/claude-self-reflect — README v9.4 (44 MB Binary, 6 Hooks inkl. PreCompact, 15 MCP-Tools, Narratives $0,012/Conv + Telemetry, Preprint „Similarity Drowns Intent") — https://github.com/ramakay/claude-self-reflect
[^14^]: github.com/severity1/claude-code-auto-memory — README (PostToolUse 0-Token-Tracking, isolierter Subagent, AUTO-MANAGED-Marker, gitmode) — https://github.com/severity1/claude-code-auto-memory
[^15^]: aiforautomation.io — claude-mem 11–18× Token-Ersparnis (Progressive Disclosure) — https://aiforautomation.io/news/2026-03-16-claude-mem-persistent-memory-plugin
[^16^]: GitHub Issues thedotmack/claude-mem (via API, 13.08.26): #1719 closed; offen #3480 (Re-Injection bei jedem Read), #3511 (EXCLUDED_PROJECTS), #3274 (Subagent-Obs), #3205/#3216 (Chroma-Leak/OOM), #3544 — https://github.com/thedotmack/claude-mem/issues
[^17^]: GitHub Issues MemPalace/mempalace (via API, 13.08.26): #856/#524 closed; offen #1601, #906 (PreCompact blockiert), #961 (KG-Staleness), #1845/#1908 (MCP-Hang nach mine), #1564 — https://github.com/MemPalace/mempalace/issues
[^18^]: Product Hunt agentmemory — Launch + Stresstest-Kommentar (674 Sessions/370K Obs; #502, #544, #587, #474, #455) — https://www.producthunt.com/products/agent-memory-dev
[^19^]: GitHub Issues rohitg00/agentmemory (via API, 13.08.26): #1157, #938 (Stale-Indizes) u. a. — https://github.com/rohitg00/agentmemory/issues
[^20^]: doobidoo/mcp-memory-service — Account 404 seit ~07/26 (Ultimate-Guide-Check), ~1,9k★ 05/26, v10.0.2, SQLite-vec-Migration v8 — https://github.com/FlorianBruniaux/claude-code-ultimate-guide (Abschnitt 3.5)
[^21^]: Context Cloud — contextcloud.pro Blog „Best MCP Memory Servers for Teams in 2026" (Team-Gap, RBAC) — https://contextcloud.pro/blog/best-mcp-memory-servers-for-teams/
[^22^]: GitHub API Repo-Metadaten (13.08.26): zippoxer/recall 194★ (stale 01/26); iannuttall/claude-sessions 1.211★ archiviert; Vvkmnn/claude-historian-mcp 177★; skymanbp/cc-memory 5★; daaain/claude-code-log 1.193★
[^23^]: memnode.dev — „Mem0 Plugin vs Memnode" (Mem0: 9 MCP-Tools, Cloud; Zwei-Systeme-Problem: doppelte Tool-Fläche + Scope-Trennung) — https://www.memnode.dev/articles/mem0-plugin-for-ai-editors-vs-memnode
