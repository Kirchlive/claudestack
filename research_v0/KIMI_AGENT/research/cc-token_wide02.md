# Deep Research – Claude Code Token-Minimierung

## Facet: Lesezeichen-Screening

**Datum:** 2026-08-13 · **Scope:** 108 Lesezeichen (102 GitHub-Repos + 2 Listenquellen + 4 Web-/Gist-Links), dedupliziert. Verifikation per GitHub-API (`api.github.com/repos/…`) und Repo-HTML/Atom-Feeds; README-Lektüre bei 28 token-relevanten Repos. Stars = Stargazers zum Abrufzeitpunkt; „Letzter Push“ = Datum des letzten Commits auf dem Default-Branch.

**Kategorien:** (a) Token-/Kontext-Minimierung **direkt** (Kompression, Filter, Cache, Routing) · (b) **indirekt** relevant (Memory/Session, Code-Intelligence, Prompt-Hygiene, Skills-Management, Monitoring/Messung) · (c) Workflow/UI/Peripherie · (d) irrelevant/Off-Topic · (L) Listenquelle.

### Kategorie-Matrix

| Repo | Kat. | Ein-Satz-Zweck | Token-Relevanz | Stars | Letzter Push | Existiert? |
|---|---|---|---|---|---|---|
| `JuliusBrussee/caveman` | (a) | Skill: Agenten sagen & lesen weniger („why use many token“) – 33,2 % weniger Input-Tokens im Benchmark | direkt | 97776 | 2026-08-12 | ja |
| `colbymchenry/codegraph` | (a) | Pre-indexierter Code-Knowledge-Graph: „surgical context“ statt Datei-Crawling | direkt | 66100 | 2026-08-08 | ja |
| `headroomlabs-ai/headroom` | (a) | Context-Compression-Layer (Library/Proxy/MCP): 15–20 % weniger Tokens für Coding-Agents, 60–95 % für JSON | direkt | 66088 | 2026-08-12 | ja |
| `deusdata/codebase-memory-mcp` | (a) | Code-Intelligence-MCP (Tree-Sitter-Wissensgraph): ~120× weniger Tokens als File-by-File-Suche | direkt | 38699 | 2026-08-12 | ja |
| `tirth8205/code-review-graph` | (a) | Lokaler Code-Intelligence-Graph (MCP/CLI): Antwort-Slices statt Corpus (bis 71× weniger Tokens) | direkt | 29914 | 2026-08-02 | ja |
| `zilliztech/claude-context` | (a) | Code-Search-MCP (semantisch, Milvus): gesamte Codebasis als gezielt abrufbarer Kontext | direkt | 12389 | 2026-07-14 | ja |
| `Piebald-AI/tweakcc` | (a) | Patcht Claude-Code-Systemprompts/Toolsets; konfigurierbares Kontext-Limit, Token-Count-Rounding | direkt | 2421 | 2026-08-10 | ja |
| `mibayy/token-savior` | (a) | MCP-Server: strukturelle Code-Navigation + Memory + Bash-Rewriting – 97,9 % tsbench bei −80 % Tokens | direkt | 1113 | 2026-08-10 | ja |
| `Compresr-ai/Context-Gateway` | (a) | Agentic-Proxy zwischen Agent und LLM-API: Hintergrund-Komprimierung der History ab 75 % Schwellwert | direkt | 631 | 2026-08-02 | ja |
| `cnighswonger/claude-code-cache-fix` | (a) | Cache-Optimierungs-Proxy: fixt Prompt-Cache-Regression (bis 20× Kosten), stabilisiert Request-Präfix | direkt | 414 | 2026-08-07 | ja |
| `tkaufmann/claude-gemini-bridge` | (a) | Delegiert Großkontext-Analysen von Claude Code an Gemini (Routing auf Fremdkontext) | direkt | 406 | 2025-08-17 | ja |
| `edouard-claude/snip` | (a) | CLI-Proxy: filtert Shell-Output via YAML-Pipelines vor dem LLM – 60–90 % Token-Reduktion | direkt | 406 | 2026-08-04 | ja |
| `claudioemmanuel/squeez` | (a) | Hook-basierter Token-Kompressor (PreToolUse): Bash-Output bis 95 %, reversibel, 7 CLI-Hosts | direkt | 182 | 2026-08-12 | ja |
| `aleks-apostle/claude-code-patches` | (a) | Patch, der Claude-Code-Thinking umschaltet (spart Thinking-Tokens) | direkt | 67 | 2025-12-09 | ja |
| `garrytan/gstack` | (b) | Garry Tans Claude-Code-Setup (23 Tools), inkl. Cross-Modell-Benchmark für Tokens/Kosten | indirekt | 127705 | 2026-08-12 | ja |
| `github/spec-kit` | (b) | Spec-Driven-Development-Toolkit (Spezifikation vor Code → weniger Iterationen) | indirekt | 126433 | 2026-08-12 | ja |
| `thedotmack/claude-mem` | (b) | Persistentes Memory über Sessions; Progressive Disclosure mit Token-Kosten-Sichtbarkeit | indirekt | 90548 | 2026-08-10 | ja |
| `ruvnet/ruflo` | (b) | Meta-Harness: 100+ Agents, Swarms, Memory; intelligentes Modell-Routing + Cost-Tracker-Plugin | indirekt | 67735 | 2026-08-12 | ja |
| `mempalace/mempalace` | (b) | Local-first AI-Memory (verbatim, semantische Suche); 96,6 % R@5 LongMemEval, null API-Calls | indirekt | 58329 | 2026-08-12 | ja |
| `luongnv89/claude-howto` | (b) | Visueller, beispielgetriebener Claude-Code-Guide (Best Practices) | indirekt | 40997 | 2026-08-06 | ja |
| `OthmanAdi/planning-with-files` | (b) | Dateibasiertes Persistent-Planning (task_plan.md u.a.) – überlebt Kontext-Reset | indirekt | 26128 | 2026-08-09 | ja |
| `alirezarezvani/claude-skills` | (b) | Große Sammlung: 345 Skills/Agents/Commands für Claude Code u.a. | indirekt | 24353 | 2026-08-09 | ja |
| `coleam00/Archon` | (b) | Open-Source-Harness-Builder für AI-Coding; aggregiert Token-Counts/Kosten pro Run | indirekt | 23159 | 2026-08-12 | ja |
| `steipete/CodexBar` | (b) | Menübar-App: Usage-Stats für Codex & Claude Code (Kontingent-Verbrauch) | indirekt | 20003 | 2026-08-12 | ja |
| `ayghri/i-have-adhd` | (b) | Skill: „Answer first“-Regelwerk → kürzere, strukturierte Agent-Outputs | indirekt | 19985 | 2026-08-10 | ja |
| `KKKKhazix/khazix-skills` | (b) | Große chinesische AI-Skills-Sammlung (Agent-Skills) | indirekt | 19585 | 2026-08-11 | ja |
| `ccusage/ccusage` | (b) | CLI zur Analyse von Claude-Code-Usage/Kosten aus lokalen JSONL-Logs | indirekt | 17884 | 2026-08-12 | ja |
| `Piebald-AI/claude-code-system-prompts` | (b) | Referenz: alle Claude-Code-Systemprompts + Tool-Beschreibungen mit Token-Counts | indirekt | 12267 | 2026-08-12 | ja |
| `nidhinjs/prompt-master` | (b) | Skill, der präzise Prompts für AI-Agents formuliert (Prompt-Hygiene) | indirekt | 11121 | 2026-06-10 | ja |
| `AgriciDaniel/claude-obsidian` | (b) | Selbst-organisierendes „Second Brain“: Obsidian + Claude Code (Wissensspeicher) | indirekt | 10803 | 2026-08-01 | ja |
| `getagentseal/codeburn` | (b) | Lokales Tracking von Token-Usage & Kosten über 37 AI-Coding-Tools | indirekt | 9264 | 2026-08-12 | ja |
| `revfactory/harness` | (b) | Meta-Skill: designt domänenspezifische Agent-Teams/Harnesses | indirekt | 8742 | 2026-07-24 | ja |
| `xingkongliang/skills-manager` | (b) | Desktop-App zum Verwalten/Synchronisieren von Agent-Skills | indirekt | 3698 | 2026-08-12 | ja |
| `UditAkhourii/adhd` | (b) | Skill: Tree-of-Thought mit Pruning für Coding-Agents | indirekt | 3523 | 2026-08-05 | ja |
| `chachamaru127/claude-code-harness` | (b) | Dediziertes Development-Harness für Claude Code | indirekt | 3054 | 2026-08-12 | ja |
| `runkids/skillshare` | (b) | Synchronisiert Skills über alle AI-CLI-Tools (ein Kommando) | indirekt | 2538 | k.A. | ja |
| `zilliztech/memsearch` | (b) | Persistente semantische Memory-Schicht (Markdown-Dateien + Milvus) für AI-Agents | indirekt | 2457 | 2026-08-12 | ja |
| `Observal/Observal` | (b) | Lokale Registry & Analytics für AI-Komponenten (Skills/MCPs/Agents), Session-Replay mit Token-Counts | indirekt | 2358 | 2026-08-09 | ja |
| `severity1/claude-code-prompt-improver` | (b) | Hook: optimiert Prompts vor Submit; v0.4 wirbt mit 31 % Token-Reduktion | indirekt | 1849 | k.A. | ja |
| `disler/claude-code-hooks-multi-agent-observability` | (b) | Echtzeit-Monitoring von Claude-Code-Hooks/Multi-Agent-Systemen | indirekt | 1513 | 2026-02-08 | ja |
| `chiphuyen/sniffly` | (b) | Dashboard: Usage-Stats, Fehleranalyse für Claude Code | indirekt | 1261 | 2025-08-08 | ja |
| `iannuttall/claude-sessions` | (b) | Slash-Commands für Session-Tracking (Fortsetzung ohne Kontextverlust) | indirekt | 1211 | 2025-06-16 | ja |
| `opentabs-dev/opentabs` | (b) | MCP: ruft Web-App-APIs direkt statt DOM zu scrapen (strukturierte, kleinere Payloads) | indirekt | 894 | 2026-07-27 | ja |
| `coleam00/second-brain-skills` | (b) | Skills, die Claude Code in ein Second Brain verwandeln | indirekt | 813 | k.A. | ja |
| `0xranx/OpenContext` | (b) | Persönlicher Context-Store für AI-Agents (Wiederverwendung statt Neuaufbau) | indirekt | 729 | 2026-06-16 | ja |
| `chujianyun/skills` | (b) | Skills-Sammlung, enthält „skill-optimizer“ (Progressive Disclosure, SKILL.md-Audit) | indirekt | 718 | 2026-08-11 | ja |
| `djyde/ccmate` | (b) | Konfigurations-Manager für Claude Code | indirekt | 628 | 2026-05-12 | ja |
| `Matt-Dionis/claude-code-configs` | (b) | Geteilte Claude-Code-Konfigurationen (kuratiertes Setup) | indirekt | 625 | 2025-08-24 | ja |
| `f/agentlytics` | (b) | Analytics-Dashboard für AI-Coding-Agents (Cursor, Claude Code u.a.), Token-/Kosten-Metriken | indirekt | 560 | 2026-08-03 | ja |
| `ColeMurray/claude-code-otel` | (b) | OpenTelemetry-Observability für Claude Code (Token-Metriken) | indirekt | 485 | 2025-06-17 | ja |
| `karanb192/claude-code-hooks` | (b) | Hook-Sammlung + Plugin-Marktplatz für Claude Code | indirekt | 470 | 2026-08-04 | ja |
| `onikan27/claude-code-monitor` | (b) | Echtzeit-Dashboard zum Monitoring mehrerer Claude-Code-Sessions | indirekt | 298 | 2026-01-29 | ja |
| `rixinhahaha/snip` | (b) | „Visual Mode“: Screenshots/Bilder als Kommunikationsschicht statt langer Textbeschreibungen | indirekt | 277 | 2026-05-07 | ja |
| `gagarinyury/claude-config-editor` | (b) | Web-Tool zum Bereinigen/Optimieren der Claude-Code-Konfiguration | indirekt | 258 | 2025-10-29 | ja |
| `nikitadoudikov/claude-pulse` | (b) | Lokales Zero-Dependency-Dashboard für Claude Code | indirekt | 244 | 2026-07-19 | ja |
| `ramakay/claude-self-reflect` | (b) | Gesprächs-Memory via MCP; injiziert komprimierte Vergangenheits-Kontexte (82 % Token-Reduktion) | indirekt | 221 | 2026-08-09 | ja |
| `philipp-spiess/claude-code-costs` | (b) | Frühes Kosten-Tracking-Skript für Claude Code (veraltet, von ccusage abgelöst) | indirekt | 203 | 2025-06-16 | ja |
| `zippoxer/recall` | (b) | Volltextsuche & Resume für Claude-/Codex-Konversationen (vermeidet Neu-Erkundung) | indirekt | 194 | 2026-01-14 | ja |
| `Vvkmnn/claude-historian-mcp` | (b) | MCP-Server: Volltextsuche in Claude-Code-Konversationshistorie (token-begrenzte Antworten) | indirekt | 177 | 2026-03-22 | ja |
| `severity1/claude-code-auto-memory` | (b) | Plugin: hält CLAUDE.md automatisch synchron („minimal token overhead“) | indirekt | 155 | 2026-04-18 | ja |
| `happycapy-ai/Happycapy-skills` | (b) | Kuratierte Claude-Code-Skills-Sammlung | indirekt | 137 | 2026-07-21 | ja |
| `earendil-works/pi` | (c) | Eigenes Agent-Toolkit (unified LLM-API, Agent-Loop, TUI, Coding-CLI) – alternatives Harness | keine | 88538 | 2026-08-12 | ja |
| `nexu-io/open-design` | (c) | Open-Source-Alternative zu Claude Design (lokal) | keine | 85326 | 2026-08-12 | ja |
| `lobehub/lobehub` | (c) | „Chief Agent Operator“-Plattform (Agent-Orchestrierung, LobeHub) | keine | 81610 | 2026-08-12 | ja |
| `slopus/happy` | (c) | Mobiler/Web-Client für Codex & Claude Code mit Voice | keine | 23306 | 2026-08-10 | ja |
| `winfunc/opcode` | (c) | GUI-App & Toolkit für Claude Code (Custom Agents, Hintergrund-Agents) | keine | 22365 | 2025-10-16 | ja |
| `pingdotgg/t3code` | (c) | T3-Chat-ähnliche Code-Agent-UI | keine | 18420 | 2026-08-12 | ja |
| `AndyMik90/Aperant` | (c) | Autonomes Multi-Session-AI-Coding | keine | 14505 | 2026-06-14 | ja |
| `Orchestra-Research/AI-research-SKILLs` | (c) | Bibliothek von AI-Research-Skills | keine | 11646 | 2026-06-16 | ja |
| `Kuberwastaken/claurst` | (c) | Rust-Reimplementierung von Claude Code (Multi-Provider-TUI-Agent) | keine | 10231 | 2026-07-31 | ja |
| `anthropics/claude-code-action` | (c) | Offizielle GitHub-Action für Claude Code (CI) | keine | 8610 | 2026-08-12 | ja |
| `uditgoenka/autoresearch` | (c) | Autonomer Research-Skill (goal-directed iterations) | keine | 5821 | 2026-08-12 | ja |
| `saladday/cc-switch-cli` | (c) | CLI zum Umschalten zwischen Claude-Code-Accounts/Endpunkten (Kontingent-Nutzung) | keine | 4644 | 2026-08-12 | ja |
| `oomol-lab/open-connector` | (c) | Auth-Gateway: 1000+ SaaS-Provider an AI-Agents anbinden | keine | 4620 | 2026-08-12 | ja |
| `The-Vibe-Company/companion` | (c) | Web- & Mobile-UI für Claude Code & Codex | keine | 2397 | k.A. | ja |
| `numman-ali/cc-mirror` | (c) | Mehrere isolierte Claude-Code-Varianten mit eigenen Configs | keine | 2257 | 2026-05-31 | ja |
| `superagent-ai/vibekit` | (c) | Sandboxed Runs für Coding-Agents (Claude Code, Gemini, Codex) | keine | 1844 | 2025-11-10 | ja |
| `simonw/claude-code-transcripts` | (c) | Tools zum Publizieren von Claude-Code-Transkripten | keine | 1663 | 2026-02-12 | ja |
| `Nimbalyst/nimbalyst` | (c) | Visueller Open-Source-Workspace für Claude Code/Codex (Kanban, Diff-Review, Mobile) | keine | 1469 | 2026-08-11 | ja |
| `RonitSachdev/ccundo` | (c) | Undo für Claude-Code-Aktionen – obsolet, Feature inzwischen nativ | keine | 1402 | 2025-07-27 | ja |
| `mbailey/voicemode` | (c) | Sprach-Dialoge mit Claude Code | keine | 1320 | 2026-07-21 | ja |
| `specstoryai/getspecstory` | (c) | Extensions: AI-Coding-Sessions als Spezifikationen sichern/teilen | keine | 1297 | 2026-08-12 | ja |
| `lcoutodemos/clui-cc` | (c) | Command-Line-UI (TUI) für Claude Code | keine | 1222 | 2026-03-26 | ja |
| `kbwo/ccmanager` | (c) | Session-Manager (TUI) für Claude Code / Gemini CLI / Codex | keine | 1218 | 2026-08-10 | ja |
| `daaain/claude-code-log` | (c) | CLI: Claude-Code-Transkript-JSONL in HTML/Markdown umwandeln | keine | 1193 | 2026-07-31 | ja |
| `milisp/codexia` | (c) | Agent-Workstation-GUI für Codex CLI + Claude Code | keine | 881 | 2026-08-12 | ja |
| `es617/claude-replay` | (c) | Konvertiert Agent-Sessions (Claude Code, Cursor, Codex) in Replay-Format | keine | 800 | k.A. | ja |
| `L1AD/claude-task-viewer` | (c) | Web-Kanban-Board zur Ansicht von Claude-Code-Tasks | keine | 700 | 2026-02-14 | ja |
| `inference-sh/skills` | (c) | Skills für inference.sh-API (Bild/Video/Audio-Modelle) | keine | 694 | 2026-08-03 | ja |
| `ObservedObserver/async-code` | (c) | Parallele Tasks mit Claude Code / Codex CLI | keine | 537 | k.A. | ja |
| `KyleAMathews/claude-code-ui` | (c) | Session-Tracker-UI mit Echtzeit-Updates (Durable Streams) | keine | 412 | 2026-01-09 | ja |
| `benbasha/Claude-Autopilot` | (c) | VS-Code/Cursor-Extension zur Automatisierung von Claude-Code-Tasks | keine | 246 | 2025-08-21 | ja |
| `yifanzz/claude-code-boost` | (c) | Hook-Utilities für Claude Code mit Auto-Approval | keine | 164 | 2026-03-21 | ja |
| `alexanderop/walkthrough` | (c) | Skill: generiert interaktive HTML-Walkthroughs | keine | 128 | 2026-03-23 | ja |
| `walidboulanouar/Ay-Skills` | (c) | Open-Source-Skills von AY Automate | keine | 85 | 2026-03-10 | ja |
| `hookdeck/webhook-skills` | (c) | Webhook-Integrations-Skills für AI-Coding-Agents | keine | 80 | 2026-08-12 | ja |
| `nextlevelbuilder/ui-ux-pro-max-skill` | (d) | Design-Intelligence-Skill (UI/UX) | keine | 116098 | 2026-08-12 | ja |
| `koala73/worldmonitor` | (d) | Globales News-/Intelligence-Dashboard – kein Claude-Code-Bezug | keine | 81239 | 2026-08-12 | ja |
| `tradesdontlie/tradingview-mcp` | (d) | TradingView-Chart-Analyse via MCP | keine | 5650 | 2026-07-28 | ja |
| `songguoxs/seedance-prompt-skill` | (d) | Skill zur Generierung von Seedance-2.0-Video-Prompts | keine | 2645 | 2026-02-12 | ja |
| `ran-isenberg/propel` | (d) | Natives macOS-Kanban (SwiftUI), kein AI-/Claude-Bezug | keine | 11 | 2026-05-31 | ja |
| `alexanderop/good-docs-writer` | (d) | Skill: Blog-Post-Entwürfe aus Topics (Docs-Writing) | keine | 2 | 2026-04-25 | ja |
| github.com/search?q=skills (Listenquelle) | (L) | GitHub-Suche „skills“ – Discovery-Quelle für weitere Skill-Repos | Listenquelle | – | – | ja |
| github.com/topics/claude-usage (Listenquelle) | (L) | Topic-Seite: ~10 Usage-Monitor-Repos (Menübar, Widgets, ESP32-Displays, Charts) | Listenquelle | – | – | ja |
| popularaitools.ai/skills/listenhub-multimedia-studio | (d) | Verzeichnis-Eintrag: Multimedia-Studio-Skill (Audio/Video) | keine | – | – | ja |
| happycapy.ai/skill-arena | (b) | Blind-bewertetes Skill-Benchmark; misst u.a. Kontext-Token-Kosten von SKILL.md | indirekt | – | – | ja |
| happycapy.ai/skills/skill-optimizer | (b) | Skill zur Optimierung von Skills (Trigger, Progressive Disclosure, Kontext-Minimierung); Quelle: chujianyun/skills | indirekt | – | – | ja |
| gist.github.com/roman01la/483d1db1…8881 | (b) | Gist „patch-claude-code.sh“: patcht Systemprompts, entfernt Kürze-Anweisungen (Gegenentwurf zur Output-Minimierung) | indirekt | – | – | ja |

### Profile der token-relevanten Repos

#### Kategorie (a) – direkte Token-/Kontext-Minimierung

**headroomlabs-ai/headroom** (66.088 ★, Push 2026-08-12)
Mechanismus: Lokale Kompressionsschicht, die Tool-Outputs, Logs, Dateien, RAG-Chunks und Konversationshistorie vor dem LLM-Aufruf komprimiert; content-aware Kompressoren, reversibel (Original abrufbar). Gemessen: 15–20 % weniger Tokens bei Coding-Agents, 60–95 % bei JSON-Daten; ehrliche Benchmarks im Schwester-Repo (10–30 % als realistische Erwartung) [^1^][^2^].
Integrationstyp: Library, Proxy oder MCP-Server – host-agnostisch, funktioniert mit Claude Code via Proxy/MCP. Reife: sehr aktiv, hohe Adoption, Rust+ONNX Engine out-of-process. **Deep-Dive: ja (Kern-Kandidat Kontext-Ebene).**

**edouard-claude/snip** (406 ★, Push 2026-08-04)
Mechanismus: CLI-Proxy (Go), der zwischen AI-Tool und Shell sitzt und Kommando-Outputs durch deklarative YAML-Filter-Pipelines drückt (z. B. `go test`, `git log`); 60–90 % Token-Reduktion, mit Savings-Report [^3^].
Integrationstyp: Shell-Wrapper/Proxy, host-agnostisch. Reife: klein, aber aktiv; klar fokussiert. **Deep-Dive: ja (Output-Filter-Ebene, komplementär zu squeez).**
Achtung Namenskonflikt: `rixinhahaha/snip` ist ein anderes Projekt (Visual Mode, siehe Kategorie b).

**claudioemmanuel/squeez** (182 ★, Push 2026-08-12)
Mechanismus: `PreToolUse`-Hook, der jede Bash-Ausgabe abfängt: Smart-Filter → Dedup → Log-Templates → Relevanz-Truncation, bis 95 % bei Bash-Output; reversible Kompression mit content-addressed Blob-Store + `squeez_retrieve`-Marker [^4^].
Integrationstyp: Claude-Code-Hook (plus 6 weitere CLI-Hosts). Reife: jung, aber sehr aktiv (npm + crates). **Deep-Dive: ja (hook-native, direkt in Claude Code integrierbar).**

**mibayy/token-savior** (1.113 ★, Push 2026-08-10)
Mechanismus: MCP-Server, der Claude strukturelle Code-Navigation (statt Datei-Lektüre), persistentes Memory und Bash-Command-Rewriting bietet; Eigenbenchmark „tsbench“: 97,9 % (188/192) bei −80 % Tokens [^5^].
Integrationstyp: MCP-Server (PyPI `token-savior-recall`). Reife: aktiv, benchmark-getrieben; Benchmark ist selbst erstellt (Validität prüfen). **Deep-Dive: ja.**

**cnighswonger/claude-code-cache-fix** (414 ★, Push 2026-08-12)
Mechanismus: Cache-Optimierungs-Proxy für Claude Code: fixt Prompt-Cache-Regressionen (laut README bis 20× Kosten/Quota-Burn), stabilisiert das Request-Präfix für Cache-Hits, überwacht stille Regressionen; optional OAuth-Refresh [^6^].
Integrationstyp: lokaler HTTP-Proxy zwischen Claude Code und Anthropic-API. Reife: aktiv, Nischentool mit einzigartigem Fokus auf die **Cache-Ebene**. **Deep-Dive: ja (einziger Cache-Treffer im Ordner).**

**Compresr-ai/Context-Gateway** (631 ★, Push 2026-08-02)
Mechanismus: Agentic-Proxy zwischen Agent (Claude Code, Cursor …) und LLM-API; komprimiert Konversationshistorie im Hintergrund, sobald ein Schwellwert (Default 75 %) erreicht ist – keine Wartezeit auf Compact [^7^]. YC-backed (Compresr).
Integrationstyp: API-Proxy. Reife: kommerziell unterlegt, aktiv. **Deep-Dive: ja (History-Compaction als Alternative zur nativen Verdichtung).**

**JuliusBrussee/caveman** (97.776 ★, Push 2026-08-12)
Mechanismus: Skill, der Agenten-Output verknappt („why use many token when few do trick“); Caveman 2 reduziert auch Input: Skill→PNG-Kompression, „Compressed Browsing“ via lokalem Chrome-MCP; Benchmark: 33,2 % weniger Provider-reported Input-Tokens [^8^]. Wird bereits von Dritt-Gateways (OmniRoute: „RTK+Caveman stacked compression 15–95 %“) gestackt [^9^].
Integrationstyp: Claude-Code-Skill/Plugin + optionale MCP-Tools. Reife: sehr hohe Adoption, aktiv. **Deep-Dive: ja (Output- + Input-Ebene per Prompt/Skill).**

**Piebald-AI/tweakcc** (2.421 ★, Push 2026-08-12)
Mechanismus: Patch-Tool für die Claude-Code-Installation: Systemprompts anpassen, Custom-Toolsets, Kontext-Limit (`CLAUDE_CODE_CONTEXT_LIMIT`), Token-Count-Rounding, Read-Größenlimits [^10^]. Ermöglicht u. a. das Entfernen/Kürzen von Systemprompt-Ballast (Input-Ebene).
Integrationstyp: Binary-Patcher für die installierte CLI. Reife: aktiv, etabliert; bricht bei CLI-Updates (Re-Patch nötig). **Deep-Dive: ja (Systemprompt-/Input-Ebene).**

**deusdata/codebase-memory-mcp** (38.700 ★, Push 2026-08-12)
Mechanismus: Tree-Sitter-basierter Code-Wissensgraph als MCP; 5 strukturelle Queries ≈ 3.400 Tokens statt ≈ 412.000 Tokens bei File-by-File-Suche (~120×); extrem schnelle Indizierung (Linux-Kernel in 3 min); arXiv-Preprint hinterlegt [^11^].
Integrationstyp: MCP-Server. Reife: sehr aktiv, hohe Adoption, wissenschaftlich dokumentiert. **Deep-Dive: ja (Code-Intelligence/Kontext-Ersatz).**

**tirth8205/code-review-graph** (29.915 ★, Push 2026-08-02)
Mechanismus: Lokaler Code-Intelligence-Graph (MCP + CLI): liefert „antwortförmige“ Code-Slices statt ganzer Dateien; Beispiel: 143.594 Tokens Corpus → 2.196 Tokens Graph-Antwort (71×); Benchmarks auf Reviews/Large-Repo-Workflows [^12^].
Integrationstyp: MCP-Server + CLI. Reife: aktiv, trending. **Deep-Dive: ja.**

**colbymchenry/codegraph** (66.100 ★, Push 2026-08-08)
Mechanismus: Pre-indexierter Code-Knowledge-Graph, auto-sync bei Code-Änderungen; „surgical context“ – Agent beantwortet aus dem Graphen statt Dateien zu crawlen; README quantifiziert Token-/Kosten-Einsparung und weist auf Context-Window-Entlastung hin [^13^].
Integrationstyp: CLI + Integrationen für Claude Code, Cursor, Codex u. a.; 100 % lokal. Reife: sehr hohe Adoption, aktiv. **Deep-Dive: ja.**

**zilliztech/claude-context** (12.389 ★, Push 2026-07-14)
Mechanismus: Semantischer Code-Search-MCP (Milvus-Vektorsuche): gesamte Codebasis als gezielt abrufbarer Kontext statt Grep/Read-Schleifen [^14^].
Integrationstyp: MCP-Server (npm `@zilliz/claude-context-mcp`). Reife: etabliert, vendor-backed (Zilliz); Schwesterprojekt memsearch für Memory. **Deep-Dive: ja (semantische Variante der Code-Intelligence).**

**tkaufmann/claude-gemini-bridge** (406 ★, Push 2025-08-17)
Mechanismus: Delegiert große Code-Analysen (>50k Token-Schätzung) von Claude Code an Google Gemini (großes, billiges Fremdkontext-Fenster) inkl. Cache-Layer [^15^].
Integrationstyp: Bridge/CLI. Reife: **stagniert (letzter Push vor ~1 Jahr)**. **Deep-Dive: nein – Konzept (Routing-Ebene) referenzieren, Code veraltet.**

**aleks-apostle/claude-code-patches** (67 ★, Push 2025-12-09)
Mechanismus: Minimaler Patch, der Claude-Code-Thinking toggelt – spart Thinking-/Output-Tokens, wenn Extended Thinking nicht gebraucht wird.
Integrationstyp: Patch-Skript. Reife: klein, mäßig aktiv. **Deep-Dive: nein (als Trick im Stack-Report erwähnen).**

#### Kategorie (b) – indirekt relevant (Auswahl)

**ccusage/ccusage** (17.884 ★, Push 2026-08-12)
Mechanismus: Liest lokale Claude-Code-JSONL-Logs und rechnet Token-Verbrauch/Kosten auf (Sessions, Tage, Modelle; Cache-Tokens sichtbar).
Integrationstyp: CLI (`npx ccusage`), read-only. Reife: De-facto-Standard, sehr aktiv. **Deep-Dive: ja – als Mess-Baseline jeder Token-Optimierung.**

**getagentseal/codeburn** (9.265 ★, Push 2026-08-12)
Mechanismus: Lokales Token-/Kosten-Tracking über 37 AI-Coding-Tools hinweg (Multi-Tool-Sicht).
Integrationstyp: CLI/Tool, lokal. Reife: aktiv. **Deep-Dive: nein (ccusage reicht für Claude Code; codeburn für Multi-Tool-Haushalte).**

**thedotmack/claude-mem** (90.548 ★, Push 2026-08-12)
Mechanismus: Persistentes Memory über Sessions: erfasst alles, komprimiert zu Memory; „Progressive Disclosure“ – gestaffelter Memory-Abruf mit sichtbaren Token-Kosten je Ebene [^16^].
Integrationstyp: Claude-Code-Plugin/Hooks. Reife: höchste Adoption im Memory-Feld, sehr aktiv. **Deep-Dive: ja (Memory-Ebene mit explizitem Token-Budget-Gedanken).**

**mempalace/mempalace** (58.329 ★, Push 2026-08-12)
Mechanismus: Local-first AI-Memory: verbatim Speicherung, semantische Suche (ChromaDB-Backend, pluggbar), 96,6 % R@5 auf LongMemEval ohne einen einzigen LLM-Call; „Palace“-Struktur (Wings/Rooms/Drawers) für scoping [^17^].
Integrationstyp: Library/MCP; host-agnostisch. Reife: stark benchmark-getrieben, aktiv; warnt selbst vor Impostor-Seiten (Seriositäts-Signal). **Deep-Dive: ja (Kandidat Memory-Ebene).**

**zilliztech/memsearch** (2.457 ★, Push 2026-08-12)
Mechanismus: Persistente semantische Memory-Schicht: Markdown-Dateien als Source of Truth + Milvus-Vektorindex; Claude-Code-Plugin vorhanden [^18^].
Integrationstyp: MCP/Plugin. Reife: vendor-backed, aktiv. **Deep-Dive: nein (Alternative zu claude-mem/mempalace, Vorteil: plain Markdown).**

**ramakay/claude-self-reflect** (221 ★, Push 2026-08-10)
Mechanismus: MCP-Server, der vergangene Claude-Code-Konversationen als Kontext injiziert – mit Token-Kompression (Eigenangabe: 82 % Reduktion) statt Volltext [^19^].
Integrationstyp: MCP (npm). Reife: klein, aktiv. **Deep-Dive: nein (Mechanismus in Memory-Kapitel aufnehmen).**

**severity1/claude-code-prompt-improver** (1.849 ★, Push k.A.)
Mechanismus: Hook bei Prompt-Submit/Tool-Use/Subagent-Start; skill-basierte Architektur mit Hook-Level-Evaluation – wirbt mit 31 % Token-Reduktion und „zero overhead“ bei klaren Prompts [^20^].
Integrationstyp: Claude-Code-Hook. Reife: aktiv, versioniert. **Deep-Dive: ja (Prompt-Hygiene mit quantifiziertem Token-Claim).**

**OthmanAdi/planning-with-files** (26.128 ★, Push 2026-08-09)
Mechanismus: Persistentes dateibasiertes Planning (`task_plan.md`, `findings.md`, `progress.md`): Plan überlebt Kontext-Fenster-Reset/Compaction → vermeidet Re-Exploration und Token-Wiederholung nach Reset [^21^].
Integrationstyp: Skill/Methodik (host-agnostisch). Reife: sehr hohe Adoption, aktiv. **Deep-Dive: ja (Kontext-Überlebens-Muster).**

**Piebald-AI/claude-code-system-prompts** (12.267 ★, Push 2026-08-12)
Mechanismus: Vollständige, gepflegte Referenz aller Claude-Code-Systemprompts, 27 Builtin-Tool-Beschreibungen und Subagent-Prompts **mit Token-Counts** (Stand v2.1.229) – Grundlage, um Input-Overhead überhaupt zu beziffern [^22^].
Integrationstyp: Doku/Daten-Repo. Reife: sehr aktuell. **Deep-Dive: ja (Datenbasis Input-Ebene, Synergie mit tweakcc).**

**ruvnet/ruflo** (67.735 ★, Push 2026-08-12)
Mechanismus: Meta-Harness um Claude Code: 100+ Agents, Swarms, Memory (AgentDB/HNSW), Self-Learning; token-relevant: intelligentes Modell-Routing (deklarierte 89 % Trefferquote) und `ruflo-cost-tracker`-Plugin (Token-Budgets, Alerts) [^23^][^24^].
Integrationstyp: Claude-Code-Plugins (lite) oder `npx ruflo init` (voller Loop mit Daemon). Reife: sehr groß, sehr aktiv, aber „Everything-Tool“-Risiko. **Deep-Dive: eingeschränkt (nur Routing-/Cost-Tracker-Bausteine).**

**garrytan/gstack** (127.705 ★, Push 2026-08-12)
Mechanismus: Garry Tans produktives Claude-Code-Setup (23 Tools/Skills); token-relevant: `gstack-model-benchmark` lässt denselben Prompt durch Claude/GPT/Gemini laufen und vergleicht Latenz, **Tokens und Kosten** [^25^].
Integrationstyp: Setup-/Skill-Bundle. Reife: höchste Stars der Liste, sehr aktiv. **Deep-Dive: nein (als Referenz-Setup + Benchmark-Tool erwähnen).**

**rixinhahaha/snip** (277 ★, Push k.A.)
Mechanismus: „Visual Mode“ für Claude Code & Co.: Mensch↔Agent-Kommunikation über Screenshots/Bilder statt langer Textbeschreibungen (visuelle Kommunikationsschicht) [^26^].
Integrationstyp: macOS-App + CLI-Setup. Reife: klein, Product-Hunt-gelauncht. **Deep-Dive: nein (indirekter Input-Effizienz-Ansatz; Namensdopplung zu edouard-claude/snip beachten).**

**ColeMurray/claude-code-otel** (485 ★, Push 2025-06-17)
Mechanismus: OpenTelemetry-Instrumentierung für Claude Code: Token-Metriken als OTel-Signals in bestehende Observability-Stacks.
Integrationstyp: OTel-Exporter/Config. Reife: **stagniert (>1 Jahr)**. **Deep-Dive: nein (Konzept referenzieren).**

**gist roman01la – patch-claude-code.sh** (356 Gist-Stars)
Mechanismus: Gegenentwurf: patcht die Claude-Code-Systemprompts, um die 15–20 Kürze-/Minimalanweisungen zugunsten von Gründlichkeit zu entschärfen (5:1-Verhältnis-Kritik), mit A/B-Test [^27^].
Relevanz: **wichtiges Signal** – Systemprompt-Kürze ist Anthropic-seitige Token-Ökonomie; wer Output-Qualität will, zahlt Tokens. Für den Stack-Report als Trade-off-Beleg zitieren. **Deep-Dive: nein.**

### Key Findings

1. **Alle 102 GitHub-Repos existieren** (API/HTML-verifiziert); kein einziger toter Link. Inaktiv/stagniert sind nur wenige (s. unten).
2. **14 Repos sind direkt token-relevant (Kategorie a)** und decken alle Ziel-Ebenen ab: Kontext-Kompression (headroom, Context-Gateway), Output-Filterung von Tool-/Shell-Output (squeez, edouard-claude/snip), Cache-Ebene (claude-code-cache-fix), Code-Intelligence als Kontext-Ersatz (codebase-memory-mcp, code-review-graph, codegraph, claude-context), Routing (claude-gemini-bridge), Systemprompt-/Input-Ebene (tweakcc), Skill-basierte Kürze (caveman), MCP-Kombilösung (token-savior), Thinking-Toggle (claude-code-patches).
3. **~45 Repos sind indirekt relevant (Kategorie b)**: Messung/Monitoring (ccusage als Standard, codeburn, CodexBar, sniffly, claude-code-otel u. a.), Memory/Session (claude-mem, mempalace, memsearch, recall, planning-with-files u. a.), Prompt-Hygiene (prompt-improver mit 31 %-Claim, i-have-adhd, prompt-master), Skills-Management (skillshare, skills-manager, Observal, happycapy skill-arena/-optimizer) sowie Config/Harness (Archon, ruflo, gstack, chachamaru127/claude-code-harness).
4. **Namens-Dopplung „snip“ aufgeklärt:** `edouard-claude/snip` = Token-Filter-Proxy (Kategorie a, relevant); `rixinhahaha/snip` = macOS-Visual-Mode-App (Kategorie b, nur indirekt). Keine Verwandtschaft.
5. **Listenquellen-Inhalt:** `github.com/topics/claude-usage` listet ~10 Usage-/Kontingent-Monitor-Repos (Menübar-Widgets, ESP32-Displays, E-Ink, Charts) – alles Mess-Ebene, keine Minimierung [^28^]. `github.com/search?q=skills` ist reine Discovery-Quelle.
6. **Erwähnenswerte Neuentdeckungen außerhalb der Liste:** `diegosouzapw/OmniRoute` (AI-Gateway, stapelt „RTK+Caveman“-Kompression, 15–95 % Token-Ersparnis, 231+ Provider) [^9^]; `ruvnet/metaharness` mit `@metaharness/router` (Modell-Routing „cheapest model that's good enough“) [^29^]; `lidge-jun/opencodex` (Universal-Provider-Proxy) [^9^] – Kandidaten für die Routing-Ebene.
7. **Gegenthese dokumentiert:** Der roman01la-Gist belegt, dass Anthropic die Systemprompts bewusst auf Kürze trimmt (Token-Ökonomie vs. Gründlichkeit) – wichtiger Trade-off-Hinweis für eine Stack-Empfehlung [^27^].
8. **Reife-Bild:** Das Token-Minimierungs-Feld ist 2026 stark professionalisiert: headroom (66k★), caveman (98k★), codegraph (66k★), codebase-memory-mcp (39k★) haben teils eigene Benchmarks, Preprints und Vendor-Backing; kleinere Tools (squeez, snip, cache-fix) sind jung, aber aktiv gepflegt.
9. **Mess-Pflicht vor Optimierung:** Der Ordner enthält mit ccusage/codeburn/sniffly/claude-pulse eine komplette Mess-Kette; jede Stack-Empfehlung sollte mit ccusage-Baseline + Vorher/Nachher-Vergleich arbeiten.

### Empfohlene Deep-Dive-Kandidaten

Priorisiert nach Stack-Ebene (Input / Output / Kontext / Cache / Routing / Messung):

1. **headroomlabs-ai/headroom** – Kontext-Kompression (Proxy/MCP/Library), ehrlichste Benchmarks. 
2. **claudioemmanuel/squeez** – Hook-native Bash-Output-Kompression, reversibel.
3. **edouard-claude/snip** – YAML-Filter-Pipelines für Shell-Output (komplementär/Alternative zu squeez).
4. **cnighswonger/claude-code-cache-fix** – einziger Cache-Ebenen-Fix (Prompt-Cache-Regression, Präfix-Stabilität).
5. **deusdata/codebase-memory-mcp** – Code-Graph-MCP, 120× Token-Ersparnis, Preprint.
6. **tirth8205/code-review-graph** – Antwort-Slices statt Corpus (71×), Review-Fokus.
7. **colbymchenry/codegraph** – surgical context, auto-sync, sehr hohe Adoption.
8. **zilliztech/claude-context** – semantische Code-Suche (Milvus) als Graph-Alternative.
9. **mibayy/token-savior** – MCP-Kombi (Navigation + Memory + Bash-Rewrite), −80 % Token-Claim (Benchmark validieren).
10. **Compresr-ai/Context-Gateway** – Hintergrund-History-Kompression per Proxy (YC-backed).
11. **JuliusBrussee/caveman** – Skill-basierte Output-/Input-Kürze, 33,2 % Benchmark, breite Ökosystem-Adoption.
12. **Piebald-AI/tweakcc + Piebald-AI/claude-code-system-prompts** – Systemprompt-Ebene (Patch + Token-Count-Datenbasis).
13. **severity1/claude-code-prompt-improver** – Prompt-Hygiene-Hook mit quantifizierter Reduktion.
14. **ccusage/ccusage** – Mess-Baseline (Pflicht für Evaluation).
15. **thedotmack/claude-mem** / **mempalace/mempalace** – Memory-Ebene mit Progressive Disclosure bzw. stärksten Benchmarks (eines von beiden vertiefen).

### Tote/irrelevante Links

**Keine toten Links** (alle Repos erreichbar). **Stagniert** (letzter Push > 6 Monate): `philipp-spiess/claude-code-costs` (2025-06, durch ccusage abgelöst), `ColeMurray/claude-code-otel` (2025-06), `iannuttall/claude-sessions` (2025-06), `tkaufmann/claude-gemini-bridge` (2025-08), `chiphuyen/sniffly` (2025-08), `benbasha/Claude-Autopilot` (2025-08), `winfunc/opcode` (2025-10), `gagarinyury/claude-config-editor` (2025-10), `aleks-apostle/claude-code-patches` (2025-12), `zippoxer/recall` (2026-01), `KyleAMathews/claude-code-ui` (2026-01), `disler/claude-code-hooks-multi-agent-observability` (2026-02), `simonw/claude-code-transcripts` (2026-02), `L1AD/claude-task-viewer` (2026-02).
**Obsolet:** `RonitSachdev/ccundo` (Feature inzwischen nativ in Claude Code, sagt das Repo selbst).
**Off-Topic für Token-Minimierung (Kategorie d):** `ran-isenberg/propel` (macOS-Kanban, kein AI-Bezug), `koala73/worldmonitor` (News-Dashboard), `tradesdontlie/tradingview-mcp` (Trading), `songguoxs/seedance-prompt-skill` (Video-Prompts), `nextlevelbuilder/ui-ux-pro-max-skill` (Design), `alexanderop/good-docs-writer` (Blog-Writing), `popularaitools.ai/skills/listenhub-multimedia-studio` (Multimedia-Skill-Listing).

### Quellen

[^1^]: github.com/headroomlabs-ai/headroom – README (Repo-HTML/README, abgerufen 2026-08-13)
[^2^]: github.com/headroomlabs-ai/strands-headroom – realistische Spar-Benchmarks (10–30 %); tosea.ai/blog/how-to-use-headroom-context-compression-guide
[^3^]: github.com/edouard-claude/snip – README (raw.githubusercontent.com)
[^4^]: github.com/claudioemmanuel/squeez – README
[^5^]: github.com/mibayy/token-savior – README + tsbench-Badge
[^6^]: github.com/cnighswonger/claude-code-cache-fix – README
[^7^]: github.com/Compresr-ai/Context-Gateway – README
[^8^]: github.com/JuliusBrussee/caveman – README + docs/WRAP-BENCHMARK.md
[^9^]: juejin.cn Trendshift-Wochenberichte 2026-07-23/24/25 (OmniRoute, i-have-adhd, code-review-graph, pi)
[^10^]: github.com/Piebald-AI/tweakcc – README
[^11^]: github.com/deusdata/codebase-memory-mcp – README + arXiv-Preprint-Verweis
[^12^]: github.com/tirth8205/code-review-graph – README
[^13^]: github.com/colbymchenry/codegraph – README
[^14^]: github.com/zilliztech/claude-context – README (Branch master)
[^15^]: github.com/tkaufmann/claude-gemini-bridge – README
[^16^]: github.com/thedotmack/claude-mem – README
[^17^]: github.com/mempalace/mempalace – README + benchmarks/BENCHMARKS.md
[^18^]: github.com/zilliztech/memsearch – README
[^19^]: github.com/ramakay/claude-self-reflect – README
[^20^]: github.com/severity1/claude-code-prompt-improver – README (v0.4.0-Update)
[^21^]: github.com/OthmanAdi/planning-with-files – README
[^22^]: github.com/Piebald-AI/claude-code-system-prompts – README (Stand Claude Code v2.1.229)
[^23^]: github.com/ruvnet/ruflo – README (Routing, ruflo-cost-tracker)
[^24^]: augmentcode.com/learn/ruflo-v3-32-22-meta-harness-claude-code (2026-07-27)
[^25^]: github.com/garrytan/gstack – README (gstack-model-benchmark)
[^26^]: github.com/rixinhahaha/snip – README (Visual Mode, Product-Hunt-Launch)
[^27^]: gist.github.com/roman01la/483d1db15043018096ac3babf5688881 – „Claude Code Prompt Patcher“ (356 Stars, A/B-Test)
[^28^]: github.com/topics/claude-usage – Topic-Listing (10 Repos, Stand 2026-08)
[^29^]: github.com/ruvnet/metaharness – README (@metaharness/router)
[^30^]: github.com/nimbalyst/nimbalyst – README; nimbalyst.com (Einordnung Kategorie c)
[^31^]: github.com/earendil-works/pi – README/Org-Seite (Agent-Toolkit, Kategorie c)
[^32^]: github.com/Kuberwastaken/claurst – README (Clean-Room-Rust-Reimplementierung, Kategorie c)
[^33^]: github.com/Observal/Observal – README (Registry + Session-Replay mit Token-Counts)
[^34^]: github.com/opentabs-dev/opentabs + opentabs.dev/docs (API-Calls statt Browser-Klicks)
[^35^]: happycapy.ai/skill-arena (Skill-Benchmark inkl. Kontext-Token-Metrik), happycapy.ai/skills/skill-optimizer (Progressive Disclosure; Quell-Repo chujianyun/skills)
[^36^]: GitHub-API `api.github.com/repos/<owner>/<repo>` für alle 102 Repos (Stars, pushed_at, Beschreibung), Abruf 2026-08-13; ergänzend Repo-HTML + `/commits/HEAD.atom`
