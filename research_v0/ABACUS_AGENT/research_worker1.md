# Research Worker 1 — Claude Code Token Optimization Repos

Datum: 2026-08-13
Coverage Bound: 14 zugewiesene Repos + Discovery neuer Repos.

---

## TEIL 1: GitHub-Suche nach NEUEN Repos

Suchanfragen ausgeführt:
1. "claude code token optimization github"
2. "claude code context compression tool"
3. "LLM token minimization CLI tool"
4. "claude code hooks token saving"

### NEUE Repos (nicht in der Master-Liste / Batch A)

| Repo | URL | Kurzbeschreibung | Integrationstyp |
|---|---|---|---|
| **nadimtuhin/claude-token-optimizer** | https://github.com/nadimtuhin/claude-token-optimizer | Automatisierte Initialisierung einer schlanken CLAUDE.md-Struktur; reduziert Startup-Token von Tausenden auf <1000 | CLI/Setup-Tool |
| **ooples/token-optimizer-mcp** | https://github.com/ooples/token-optimizer-mcp | MCP-Server, der redundante Read/Grep-Requests abfängt und gecachte/diff-basierte Ersetzungen liefert; baut Wissensgraphen über Sessions | MCP |
| **KINGSTAR-OMEGA/claude-token-optimizer** | https://github.com/KINGSTAR-OMEGA/claude-token-optimizer | Token-Optimierung für Claude Code | CLI |
| **drona23/claude-token-efficient** | https://github.com/drona23/claude-token-efficient | Regeln/System-Prompts zur Reduktion von Output-Verbosität (keine Schmeichelei, code-first) | Config/Rules |
| **NodeNestor/claude-rolling-context** | https://github.com/NodeNestor/claude-rolling-context | Transparenter Proxy, der ältere Nachrichten asynchron komprimiert, jüngste Kontext verbatim behält (Rolling Timeline) | Proxy |
| **rtk-ai/rtk** | https://github.com/rtk-ai/rtk | High-Performance Rust-CLI-Proxy, komprimiert Shell-Output (Filter/Group/Truncate/Dedup), 60-90% Reduktion; Auto-Rewrite-Hook für Claude Code, Cursor, Copilot, Windsurf | CLI/Proxy/Hook |
| **nooscraft/tokuin** | https://github.com/nooscraft/tokuin | Rust-CLI für Token-Schätzung, Kostenkontrolle und Prompt-Kompression (Hieratic-Format, 70-90% Reduktion), LLM-as-Judge Qualität | CLI |
| **ai-skynet-labs/reduce-tokens** | https://github.com/ai-skynet-labs/reduce-tokens | Token-Reduktion für AI-Coding-Agents | CLI/Proxy |
| **0xAnto/llm-token-reducer** | https://github.com/0xAnto/llm-token-reducer | LLM-Token-Reduktion | CLI |
| **pleasedodisturb/awesome-llm-token-optimization** | https://github.com/pleasedodisturb/awesome-llm-token-optimization | Kuratierte Liste von LLM-Token-Optimierungs-Tools (llmtrim, lean-ctx u.a.) | Liste/Index |
| **yurukusa/cc-safe-setup** | https://github.com/yurukusa/cc-safe-setup | Hooks (large-read-guard, read-budget-guard, token-budget-guard) + Token-Optimierungs-Guide für Claude Code | Hooks/Config |
| **harrisonsec/claude-code-context-engineering-compression-pipeline** | https://github.com/harrisonsec/... | Progressive Compression Pipeline (Tool-Result-Budgeting, History-Snip, Microcompact, Context Collapse, Autocompact) | Konzept/Pipeline |

---

## TEIL 2: Batch A — Strukturierte Repo-Einträge

### 1. open-compress/claw-compactor
- **Repo Name:** Claw Compactor
- **URL:** https://github.com/open-compress/claw-compactor
- **Kategorie:** LLM Token Compression Engine (14-Stage Fusion Pipeline)
- **Was es tut:** Komprimiert LLM-Kontext über eine 14-stufige Fusion-Pipeline (AST-aware Code-Analyse, JSON-Statistik-Sampling, SimHash-Dedup, Log/Diff/Search-Crunch, etc.). 15–82% Kompression, reversibel, 0 LLM-Inferenzkosten, 1600+ Tests.
- **Wie es Token spart:** Content-aware Routing (Cortex erkennt Code/JSON/Logs/Diffs), AST-Kompression via tree-sitter, JSON-Schema-Sampling, SimHash-Dedup, Log-Folding, Diff-Folding, Abbreviation. Reversible Kompression über RewindStore (LLM kann per Tool Originale abrufen).
- **Integrationstyp:** CLI (`claw-compactor`), Python-Library (FusionEngine API)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 4 — sehr umfassende Pipeline, aber primär generisch (nicht Claude-Code-spezifisch), 0 Dependencies, reversibel.

### 2. claudioemmanuel/squeez
- **Repo Name:** squeez
- **URL:** https://github.com/claudioemmanuel/squeez
- **Kategorie:** End-to-end Token-Optimizer für 7 AI-CLI-Hosts (Claude Code, Copilot CLI, OpenCode, Gemini CLI, Codex CLI, Pi, Hermes)
- **Was es tut:** Komprimiert Bash-Output bis zu 95%, kollabiert redundante Calls, erhält exakte Identifier, verweigert Net-Verlust-Kompressionen, injiziert terse Prompt-Persona. Automatisch, 0 neue Runtime-Dependencies.
- **Wie es Token spart:** PreToolUse-Hook (Bash-Kompression: Filter→Dedup→Log-Template→Relevanz-Truncation), reversible Kompression (squeez_retrieve MCP-Tool), Log-Template-Compaction, Relevanz-aware Truncation, Cross-Call-Dedup (Hash + Fuzzy Jaccard), Summarize-Fallback (>500 Zeilen → ≤40-Zeilen-Summary), Net-Win-Gate, Adaptive Intensity, MCP-Server (17 Tools), Post-Compact-Re-Injection.
- **Integrationstyp:** Hook (PreToolUse/PostToolUse) + MCP-Server + CLI (Rust)
- **Stars:** 182 (sichtbar), Forks: 20
- **Relevanzscore (1-5):** 5 — Claude-Code-nativ, bis 95% Bash-Reduktion, reversibel, MCP, 0 Dependencies.

### 3. KRLabsOrg/squeez
- **Repo Name:** squeez (KRLabsOrg)
- **URL:** https://github.com/KRLabsOrg/squeez
- **Kategorie:** Task-conditioned Tool-Output-Pruning für Coding-Agents (ML-basiert)
- **Was es tut:** Pipe beliebigen Tool-Output (pytest, grep, git log, npm build, kubectl) durch squeez mit Task-Beschreibung → nur relevante Zeilen zurück. Zwei Modelle: generativ (Qwen 3.5 2B, 0.80 F1, 92% Kompression) oder extraktiv (ModernBERT). CLI-Pipe, Python-Library, vLLM-Server.
- **Wie es Token spart:** ML-Modell filtert Tool-Output auf relevante Zeilen (z.B. nur fehlgeschlagener Test + Traceback statt 45 Zeilen). 87% Kompression im Beispiel. Trainiert auf 27 Tool-Output-Typen aus SWE-bench.
- **Integrationstyp:** CLI-Pipe (`| squeez "task"`), Python-Library, vLLM-Server; Claude-Code-Integration via CLAUDE.md-Regel
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 4 — sehr effektiv für Tool-Output-Reduktion, aber erfordert ML-Modell (2B) bzw. Server; nicht rein lokal/leichtgewichtig.

### 4. ojuschugh1/sqz
- **Repo Name:** sqz
- **URL:** https://github.com/ojuschugh1/sqz
- **Kategorie:** LLM-Context-Kompression (Pre-Injection Context Compression)
- **Was es tut:** Komprimiert Command-Output bevor er zum LLM gelangt. Einzelnes Rust-Binary, 0 Config. Dedup: gleiche Datei 5× gelesen → 1× gesendet + 13-Token-Referenz. Real: 3.003 Kompressionen, 178.442 Token gespart, 24.7% avg, bis 92% mit Dedup.
- **Wie es Token spart:** PreToolUse-Hook; 40+ per-command Formatter (git, cargo, npm, pytest, docker, kubectl), strukturelle Summaries (Code → Imports/Signaturen/Call-Graph ~70%), SHA-256 Dedup-Cache, JSON-Pipeline (nulls/debug-Felder strippen), Safe-Mode (Stack-Traces/Secrets via Entropie-Analyse bypassen).
- **Integrationstyp:** Hook (PreToolUse) + CLI (Rust) + MCP; unterstützt Claude Code, Cursor, Windsurf, Cline, Gemini CLI, Kiro, OpenCode, VS Code, JetBrains, Browser-Extensions
- **Stars:** 593 (sichtbar), Forks: 41
- **Relevanzscore (1-5):** 5 — Claude-Code-nativ, sehr hohe Dedup-Einsparung, 0 Config, offline, White Paper vorhanden.

### 5. microsoft/LLMLingua
- **Repo Name:** LLMLingua Series
- **URL:** https://github.com/microsoft/LLMLingua
- **Kategorie:** Prompt-Compression (Forschung/ML) — LLMLingua, LongLLMLingua, LLMLingua-2, SecurityLingua
- **Was es tut:** Komprimiert Prompts bis zu 20x mit minimalem Performance-Verlust. Nutzt kompaktes trainiertes LM (GPT2-small, LLaMA-7B) um nicht-essentielle Tokens zu identifizieren/entfernen. LongLLMLingua verbessert Long-Context (RAG +21.4% mit 1/4 Tokens). LLMLingua-2: BERT-Encoder, 3-6x schneller.
- **Wie es Token spart:** ML-basierte Token-Selektion (Perplexity-basiert), strukturierte Prompt-Kompression mit `<llmlingua>`-Tags, KV-Cache-Kompression, RAG-Integration (LangChain, LlamaIndex, Prompt flow).
- **Integrationstyp:** Python-Library (`pip install llmlingua`, PromptCompressor API)
- **Stars:** nicht sichtbar im Scrape (Microsoft-Repo, sehr bekannt, mehrere tausend)
- **Relevanzscore (1-5):** 3 — akademisch/ML-schwergewichtig, nicht Claude-Code-spezifisch, erfordert Modell-Loading; eher für RAG/Prompt-Pipelines als für Claude-Code-Hooks.

### 6. toon-format/toon
- **Repo Name:** TOON (Token-Oriented Object Notation)
- **URL:** https://github.com/toon-format/toon
- **Kategorie:** Datenformat / Serialisierung (Token-effiziente JSON-Alternative)
- **Was es tut:** Kompakte, menschenlesbare Kodierung des JSON-Datenmodells, die Tokens minimiert. Kombiniert YAML-Indentation mit CSV-artigen Tabellenformen. 42.6% weniger Tokens bei gleicher Retrieval-Genauigkeit. Verlustfreie Round-Trips mit JSON.
- **Wie es Token spart:** Tabular-Form (Feldliste einmal im Header, dann Zeilen), Inline-Form, Keyed-Tabular, minimale Syntax (Indentation statt Braces), weniger Quoting. Effizienz: TOON 29.2 acc%/1K tok vs JSON 16.6.
- **Integrationstyp:** Library (npm `@toon-format/toon`), CLI (`@toon-format/cli`), MCP-Proxy (Tooner), VS-Code/tree-sitter-Support
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 3 — indirekt relevant (Format-Ebene, nicht Claude-Code-spezifisch), aber nützlich als Serialisierungsschicht für Tool-Output.

### 7. fkiene/llmtrim
- **Repo Name:** llmtrim
- **URL:** https://github.com/fkiene/llmtrim
- **Kategorie:** Lokaler Proxy zur LLM-API-Traffic-Kompression
- **Was es tut:** Lokaler Proxy, der LLM-API-Traffic komprimiert. −31% Input, −74% Output, −66% Round-Trip-Kosten. 112 A/B-Cases, ~5ms/Call, kein Modell-Loading. Claude-Code-Integration: Statuszeile, Cold-Cache-Guard, günstigeres /compact, /sub.
- **Wie es Token spart:** 10 Stufen: tool-output (Lossless Template-Fold, Log/Diff/Grep-Fenster), cache discipline, lexical retrieval (BM25+RM3, TextTiling), skeletonization (tree-sitter: nur relevante Funktionskörper), serialize+hygiene (JSON-Minify, TOON/CSV), json sample, dedup, output control (terse instruction, Chain-of-Draft), tool layer (statische Tool-Selektion), multimodal (Bild-Downscale).
- **Integrationstyp:** Proxy + CLI + MCP + Library (Python, Ruby, Swift, Kotlin, JS/WASM)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 5 — Claude-Code-nativ, sehr umfassende Kompressionsstufen, Qualitäts-gated, MCP, Library-Support.

### 8. agiwhitelist/tokdiet
- **Repo Name:** tokdiet
- **URL:** https://github.com/agiwhitelist/tokdiet
- **Kategorie:** Lokaler Proxy (Context-Diet) mit Qualitäts-Nachweis
- **Was es tut:** Lokaler Proxy zwischen Agent und Modell-API; metert jeden Token, komprimiert Kontext, beweist dass Qualität nicht schlechter wurde. 66-Task-A/B-Benchmark: −71% Input-Tokens bei Qualitätsparität (95-97%). Cache-aware, thinking-safe.
- **Wie es Token spart:** Behandelt Kontext wie virtuellen Speicher: Hot-Content bleibt resident, Cold-Content wird als recoverable Stub in SQLite ausgelagert. Strategien: Dedup (loss-free), Elision (recoverable, paged out), Mid-Summarize (opt-in). Qualitätsmechanismen: Shadow-Eval, Quality-Budget (max 2% Degradation), Safe-Mode.
- **Integrationstyp:** Proxy (npx tokdiet start) + Claude-Code-Plugin (Metering)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 4 — Claude-Code-kompatibel, starke Qualitätsgarantie, aber Proxy-Setup erforderlich.

### 9. Madhan230205/token-reducer
- **Repo Name:** Token Reducer
- **URL:** https://github.com/Madhan230205/token-reducer
- **Kategorie:** Lokale, intelligente Context-Compression-Pipeline (Hybrid RAG)
- **Was es tut:** Reduziert Tokens um 90-98% bei Erhalt semantischer Relevanz. Läuft komplett lokal, keine API-Calls, Millisekunden. AST-Parsing statt Text-Matching. Claude-Code-Plugin.
- **Wie es Token spart:** Hybrid Retrieval (BM25 + semantische Vektor-Suche), AST-basiertes Chunking (tree-sitter), TextRank-Kompression, Import-Graph, 2-Hop-Symbol-Expansion, SQLite FTS5 + HNSW. Pipeline: PREPROCESS→INDEX→RETRIEVE→RE-RANK→COMPRESS→CONTEXT PACKET.
- **Integrationstyp:** Claude-Code-Plugin (`/plugin install`), CLI (Python), MCP
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 4 — Claude-Code-nativ, sehr hohe Reduktion, lokal, aber erfordert Indexing-Setup.

### 10. ZongqianLi/500xCompressor
- **Repo Name:** 500xCompressor
- **URL:** https://github.com/ZongqianLi/500xCompressor
- **Kategorie:** Prompt-Compression (Forschung, ACL 2025 Main)
- **Was es tut:** Komprimiert bis zu 500 natürliche Sprach-Tokens in 1 Special-Token. Komprimierte Tokens können Originaltext regenerieren oder für QA genutzt werden. 0.3% zusätzliche Parameter, Zero-Shot-Nutzung, 6x-480x Kompressionsrate.
- **Wie es Token spart:** ML-basierte Kompression (pretrained auf Arxiv-Corpus, finetuned auf ArxivQA). Nicht-selektiv (komprimiert alle Tokens). KV-Werte haben Vorteile gegenüber Embeddings bei hohen Raten.
- **Integrationstyp:** Python-Demo/Research-Code (LoRA für LLaMa-3-8b-Instruct)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 2 — akademisch, nicht Claude-Code-integriert, Modelle/Datasets nicht öffentlich, hohe Kompressionsrate aber Verlust von 27-38% LLM-Fähigkeiten.

### 11. PCIRCLE-AI/toonify-mcp
- **Repo Name:** Toonify MCP
- **URL:** https://github.com/PCIRCLE-AI/toonify-mcp
- **Kategorie:** Context-Compression-Plugin für Claude Code (TOON-Format)
- **Was es tut:** Trimmt automatisch große Tool-Outputs (JSON, YAML, Stack-Traces, Logs) bevor sie in den Context-Window gelangen. Claude-Code-Plugin (automatisch, 0-Config) oder MCP-Server (on-demand). Pipe-Filter für beliebige Agent-CLIs.
- **Wie es Token spart:** JSON/YAML → TOON-Format (token-effizient), repetitive Logs kollabieren; Source-Code, Prosa, präzisionssensitive Zahlen passieren unverändert. Lossless-Kompression. Pipe-Filter komprimiert vor Context-Eintritt.
- **Integrationstyp:** Claude-Code-Plugin + MCP-Server + Pipe-Filter (`toonify-mcp compress`)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 4 — Claude-Code-nativ, automatisch, lossless, nutzt TOON-Format.

### 12. Compresr-ai/Context-Gateway
- **Repo Name:** Context Gateway
- **URL:** https://github.com/Compresr-ai/Context-Gateway
- **Kategorie:** Instant History Compaction / Context-Optimierung (YC-backed)
- **Was es tut:** Sitzt zwischen AI-Agent (Claude Code, Cursor) und LLM-API. Komprimiert History im Hintergrund, sodass man nie auf Compaction wartet. TUI-Wizard für Agent-Auswahl und Konfiguration.
- **Wie es Token spart:** Hintergrund-Kompression der Konversations-History (Summary vorberechnet), Trigger-Threshold (default 75%), sofortige Kompaktion ohne Wartezeit.
- **Integrationstyp:** Proxy/Binary (`context-gateway`), TUI-Wizard; unterstützt claude_code, cursor, openclaw, custom
- **Stars:** 631 (sichtbar), Forks: 50
- **Relevanzscore (1-5):** 4 — Claude-Code-nativ, eliminiert Wartezeit bei Compaction, YC-backed.

### 13. mibayy/token-savior
- **Repo Name:** Token Savior
- **URL:** https://github.com/mibayy/token-savior
- **Kategorie:** MCP-Server für strukturelle Code-Navigation, persistentes Memory, Bash-Command-Rewriting
- **Was es tut:** 97.9% auf tsbench bei −80% Tokens. Indexiert Codebase nach Symbolen (Funktionen, Klassen, Imports, Call-Graph), Modell navigiert per Pointer statt per `cat`. 34 Bash-Compactor, PreToolUse-Rewriter (10 Regeln).
- **Wie es Token spart:** Symbol-basierte Navigation (find_symbol: 41M chars → 67 chars, −99.9%), dünnes Tool-Manifest (optimized: 15 Tools, ~1.5KT), Bash-Compaction (34 Compactor für git/gh/test/cloud/docker), PreToolUse-Command-Rewriting, Capture-Sandbox für Persistenz über Compaction.
- **Integrationstyp:** MCP-Server (pip `token-savior-recall[mcp]`) + Hooks (ts init) + CLI (`ts`)
- **Stars:** nicht sichtbar im Scrape (1.147 Stargazer laut Repo-Text)
- **Relevanzscore (1-5):** 5 — Claude-Code-nativ, sehr hohe Reduktion (−80%), strukturelle Navigation, 34 Compactor, MCP + Hooks.

### 14. chiphuyen/sniffly
- **Repo Name:** Sniffly
- **URL:** https://github.com/chiphuyen/sniffly
- **Kategorie:** Claude Code Analytics Dashboard (Nutzungsanalyse)
- **Was es tut:** Analysiert Claude-Code-Logs, um Nutzungsmuster zu verstehen: Fehler-Breakdown, Message-History-Analyse, teilbare Dashboards. Läuft komplett lokal, keine Telemetrie.
- **Wie es Token spart:** Indirekt — hilft Nutzern, ineffiziente Nutzungsmuster zu erkennen (wo Claude Fehler macht, welche Anweisungen wiederholt werden), um Tokenverbrauch zu optimieren. Kein aktives Komprimieren.
- **Integrationstyp:** CLI (Python, `sniffly init`), lokales Web-Dashboard (Port 8081)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore (1-5):** 2 — Analytics/Monitoring, kein aktives Token-Saving; nützlich zur Diagnose, nicht zur Reduktion.

---

## Zusammenfassung Relevanzscores (Claude Code Token Saving)

| Repo | Score | Integrationstyp |
|---|---|---|
| claudioemmanuel/squeez | 5 | Hook + MCP + CLI |
| ojuschugh1/sqz | 5 | Hook + CLI + MCP |
| fkiene/llmtrim | 5 | Proxy + CLI + MCP + Library |
| mibayy/token-savior | 5 | MCP + Hooks + CLI |
| open-compress/claw-compactor | 4 | CLI + Library |
| KRLabsOrg/squeez | 4 | CLI-Pipe + Library + vLLM |
| agiwhitelist/tokdiet | 4 | Proxy + Plugin |
| Madhan230205/token-reducer | 4 | Plugin + CLI + MCP |
| PCIRCLE-AI/toonify-mcp | 4 | Plugin + MCP + Pipe |
| Compresr-ai/Context-Gateway | 4 | Proxy + TUI |
| microsoft/LLMLingua | 3 | Python-Library |
| toon-format/toon | 3 | Library + CLI + MCP |
| ZongqianLi/500xCompressor | 2 | Research-Code |
| chiphuyen/sniffly | 2 | CLI + Dashboard |
