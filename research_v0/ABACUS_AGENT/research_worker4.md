# Recherche: Session-/Memory-Management & Hooks-/Guards-Repos für Claude Code Tokenminimierung

Recherchiert am 13.08.2026. 16 Repos abgedeckt (COVERAGE BOUND erreicht). Fokus: Wie reduziert das Tool Tokenverbrauch in Claude Code.

---

## 1. NodeNestor/claude-rolling-context
- **URL:** https://github.com/NodeNestor/claude-rolling-context
- **Kategorie:** Session-/Context-Management (Rolling Context Compression)
- **Was es tut:** Transparenter Proxy zwischen Claude Code und Anthropic API, der alte Nachrichten automatisch zusammenfasst (Rolling Context), während neuere Nachrichten wörtlich (verbatim) erhalten bleiben. Im Gegensatz zum eingebauten `/compact` (das die GESAMTE Konversation verlustbehaftet ersetzt) komprimiert es nur alte Nachrichten. Baut eine fortlaufende "Rolling Timeline" aus Zusammenfassungen. Stateless, hashing-basiert, funktioniert mit Subagents/Branches.
- **Wie es Tokens spart:** Kappt das Context-Prefix zwischen TRIGGER (100K) und TARGET (40K). Da Claude Code die gesamte Konversation bei jedem Turn erneut sendet (Cache-Read 0.1×), wächst die Input-Kosten unverwaltet quadratisch mit der Sessionlänge; mit Rolling Context linear. Kappt auch den "Cache-Miss-Blast-Radius" (kalter Turn bei 900K-Prefix ~9× teurer als bei 100K). Kompression selbst läuft async im Hintergrund, null Latenz.
- **Integrationstyp:** Proxy (ANTHROPIC_BASE_URL) + Claude Code Plugin (Marketplace)
- **Stars:** nicht sichtbar (keine Zahl im Scrape)
- **Relevanzscore:** 5 (direkt auf Token-/Kostenreduktion in langen Sessions ausgelegt, mit klarer Ökonomie-Begründung)

---

## 2. JuliusBrussee/caveman
- **URL:** https://github.com/JuliusBrussee/caveman
- **Kategorie:** Output-/Prompt-Kompression (Skill + Proxy)
- **Was es tut:** "why use many token when few do trick" — Skill, der Agenten kürzer antworten lässt (Caveman-Sprache), plus Caveman 2.0 mit Proxy-Engine, die Input-Payloads komprimiert (JSON/Log/Code/Diff/Search-Result/Text), Caveman Browse (komprimiertes Browsing via Chrome), und Pixel-Mode (dichte Textwände als PNG für Vision-Modelle). 33.2% weniger Provider-gemeldete Input-Tokens im Claude-Code-Benchmark.
- **Wie es Tokens spart:** Skill reduziert Antwort-Tokens (~65% Durchschnitt, bis 87%). Proxy-Engine komprimiert Input-Payloads je nach Typ (JSON 70-90%, Log 85-95%, Code 40-70%, Diff 60-80%, Search-Result 80-95%). Pixel-Mode wandelt Text in Bild-Tokens um. `/caveman-compress` komprimiert Markdown-Memory-Dateien.
- **Integrationstyp:** Skill + Slash-Commands + Proxy (CLI) + MCP Tools + Agent SDK
- **Stars:** 97.8k (sehr hoch)
- **Relevanzscore:** 5 (mehrschichtige Token-Reduktion: Output + Input + Browsing)

---

## 3. zippoxer/recall
- **URL:** https://github.com/zippoxer/recall
- **Kategorie:** Session-/Conversation-Suche & Resume
- **Was es tut:** Full-Text-Suche und Resume von Claude/Codex-Konversationen. TUI (recall) zum Durchsuchen und Wiederaufnehmen alter Sessions. Unterstützt Claude Code, Codex, OpenCode, Factory. `recall search` CLI, das der Agent selbst nutzen kann.
- **Wie es Tokens spart:** Indirekt — statt eine neue Session von Null zu starten (und Kontext neu aufzubauen), kann man eine alte Session per `--resume` fortsetzen und spart so Re-Exploration. Keine direkte Kompression, aber Kontext-Wiederverwendung über Sessions.
- **Integrationstyp:** CLI (TUI + `recall search`), kein MCP nötig
- **Stars:** 194
- **Relevanzscore:** 2 (Kontext-Wiederverwendung, aber keine direkte Token-Kompression; primär Komfort)

---

## 4. thedotmack/claude-mem
- **URL:** https://github.com/thedotmack/claude-mem
- **Kategorie:** Persistent Memory / Memory-Kompression
- **Was es tut:** Persistente Memory-Kompression für Claude Code. Erfasst automatisch Tool-Usage-Observations via 5 Lifecycle-Hooks (SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd), erzeugt semantische Zusammenfassungen, speichert in SQLite + Chroma Vector DB. Worker-Service (Bun). `mem-search` Skill für natürliche Sprachabfragen.
- **Wie es Tokens spart:** 3-Layer-Progressive-Disclosure-Retrieval: `search` (kompakter Index, ~50-100 Tokens/Result) → `timeline` (chronologischer Kontext) → `get_observations` (nur gefilterte IDs, ~500-1000 Tokens/Result). Verhindert, dass Kontext über Sessions verloren geht und neu aufgebaut werden muss. Token-Kosten sichtbar.
- **Integrationstyp:** Claude Code Plugin (Hooks) + MCP Search Tools + Skill + Worker-Service
- **Stars:** 90.6k
- **Relevanzscore:** 5 (progressive Disclosure = token-effiziente Memory-Retrieval-Architektur)

---

## 5. mempalace/mempalace
- **URL:** https://github.com/mempalace/mempalace
- **Kategorie:** Local-First AI Memory (Semantic Search)
- **Was es tut:** Lokale, verbatim Speicherung von Konversationshistorie mit semantischer Suche. Kein Summarizing/Extrahieren/Paraphrasieren — Originaltext bleibt erhalten. Strukturierter Index (Wings/Rooms/Drawers). Pluggable Backends (ChromaDB default, Milvus, Qdrant, pgvector, sqlite_exact). 44 MCP Tools inkl. Knowledge Graph. 96.6% R@5 auf LongMemEval, null API-Calls.
- **Wie es Tokens spart:** `mempalace wake-up` lädt nur relevanten Kontext für neue Sessions statt alles. Auto-Save-Hooks für Claude Code/Codex/Cursor speichern vor Context-Compression. Verhindert Kontextverlust und Re-Exploration. Keine API-Calls für Retrieval (lokal).
- **Integrationstyp:** CLI + MCP Server + Hooks (Auto-Save)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 4 (token-effiziente Memory-Retrieval, aber primär auf Memory-Qualität statt direkter Token-Kompression fokussiert)

---

## 6. deusdata/codebase-memory-mcp
- **URL:** https://github.com/deusdata/codebase-memory-mcp
- **Kategorie:** Code-Intelligence / Codebase-Knowledge-Graph (MCP)
- **Was es tut:** Schnellste Code-Intelligence-Engine für AI-Coding-Agents. Indexiert Repos in Millisekunden (Linux-Kernel 28M LOC in 3 Min) via tree-sitter AST (158 Sprachen) + Hybrid LSP. Baut persistenten Knowledge-Graph (Funktionen, Klassen, Call-Chains, HTTP-Routen). 15 MCP Tools. Native Executable, keine Runtime/API-Key.
- **Wie es Tokens spart:** 120× weniger Tokens — 5 strukturelle Queries ~3.400 Tokens vs ~412.000 via file-by-file Suche. Ein Graph-Query ersetzt Dutzende grep/read-Zyklen. Benchmark: 10× weniger Tokens, 2.1× weniger Tool-Calls vs. file-by-file Exploration. 83% Antwortqualität.
- **Integrationstyp:** MCP Server (native Executable) + CLI
- **Stars:** nicht sichtbar
- **Relevanzscore:** 5 (drastische Token-Reduktion durch Graph-basierte Code-Exploration statt Datei-Lesen)

---

## 7. zilliztech/memsearch
- **URL:** https://github.com/zilliztech/memsearch
- **Kategorie:** Cross-Platform Semantic Memory
- **Was es tut:** Semantische Memory für AI-Coding-Agents über alle Plattformen (Claude Code, OpenClaw, OpenCode, Codex CLI). Markdown als Source of Truth, Milvus als "Shadow Index". Progressive Retrieval (3-Layer: search → expand → transcript), Hybrid-Search (dense vector + BM25 sparse + RRF reranking), SHA-256 Dedup, File-Watcher Live-Sync. Skills-from-Memory (prozedurale Memory-Schicht).
- **Wie es Tokens spart:** Progressive Retrieval lädt nur relevante Chunks statt alles. Hybrid-Search + Dedup verhindern redundante Kontext-Injektion. `/memory-recall` liefert gezielt frühere Diskussionen. PROJECT.md/USER.md Wartung hält dauerhaften Kontext aktuell.
- **Integrationstyp:** Claude Code Plugin + MCP + CLI + Python API (Multi-Platform)
- **Stars:** 2.5k
- **Relevanzscore:** 4 (token-effiziente Memory-Retrieval, cross-platform)

---

## 8. severity1/claude-code-auto-memory
- **URL:** https://github.com/severity1/claude-code-auto-memory
- **Kategorie:** CLAUDE.md Auto-Sync (Memory-Wartung)
- **Was es tut:** Plugin, das beobachtet, was Claude Code editiert/löscht/verschiebt, und dann CLAUDE.md im Hintergrund aktualisiert. PostToolUse-Hook (Edit/Write/Bash) trackt Änderungen (null Output), Stop-Hook startet isolierten Agent, der Memory aktualisiert. Marker-basierte Updates (nur AUTO-MANAGED-Sektionen). Subtree-Support für Monorepos.
- **Wie es Tokens spart:** Hält CLAUDE.md frisch, damit Claude nicht veralteten Kontext nutzt (weniger Fehlversuche). Verarbeitung läuft in isoliertem Agent (eigener Context-Window) — verbraucht NICHT die Haupt-Session-Tokens. PostToolUse-Hook hat null Token-Kosten. Progressive Disclosure (Skills nur bei Aufruf geladen).
- **Integrationstyp:** Claude Code Plugin (Hooks + Agent + Skills)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 4 (hält Kontext aktuell, isolierte Verarbeitung spart Haupt-Session-Tokens)

---

## 9. DietrichGebert/ponytail
- **URL:** https://github.com/DietrichGebert/ponytail
- **Kategorie:** Code-Minimalismus / Over-Engineering-Guard (Skill)
- **Was es tut:** Skill, der den Agenten zwingt, minimalen Code zu schreiben ("He says nothing. He writes one line."). Ladder: YAGNI → Reuse → Stdlib → Native → Dependency → One line → Minimum. Misst: ~54% weniger Code (bis 94%), ~22% weniger Tokens, ~20% billiger, ~27% schneller, 100% safe. Multi-Platform (Claude Code, Codex, Copilot, OpenCode, Gemini, etc.).
- **Wie es Tokens spart:** Weniger generierter Code = weniger Output-Tokens. Weniger Over-Engineering = weniger Korrektur-Runden. Benchmarks zeigen -22% Tokens vs. Baseline. Komplementär zu caveman (caveman kürzt Sprache, ponytail kürzt Code).
- **Integrationstyp:** Skill/Plugin (Multi-Platform: Claude Code Plugin, Codex, Copilot, etc.)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 4 (reduziert Output-Tokens durch Code-Minimalismus, gemessen -22%)

---

## 10. cnighswonger/claude-code-cache-fix
- **URL:** https://github.com/cnighswonger/claude-code-cache-fix
- **Kategorie:** Prompt-Cache-Optimierung (Proxy)
- **Was es tut:** Cache-Optimierungs-Proxy zwischen Claude Code und Anthropic. Fixes Prompt-Cache-Bugs, die exzessiven Quota-Verbrauch verursachen (v.a. bei `--resume`/`/resume`). Stabilisiert Request-Prefix (Fingerprint-Strip, Sort-Stabilization, TTL-Management, Identity-Normalization, Cache-Control-Normalize). Überwacht auf stille Regressionen. Idempotent.
- **Wie es Tokens spart:** Erhöht Cache-Read-Ratio (0.1× statt 1×). Fixes TTL-5m-Downgrades, Cache-Breaking-Header-Churn, non-deterministische Tool-Ordering. Empfiehlt `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` (~1.800 Tokens/Request gespart). Image-Stripping (hält nur letzte N Bilder), Image-Retry-Breaker, Session-Budget-Circuit-Breaker.
- **Integrationstyp:** Proxy (ANTHROPIC_BASE_URL / Forward-Proxy) + Client-Hooks
- **Stars:** nicht sichtbar
- **Relevanzscore:** 5 (direkt auf Cache-Effizienz = Token-/Kostenreduktion ausgelegt)

---

## 11. karanb192/claude-code-hooks
- **URL:** https://github.com/karanb192/claude-code-hooks
- **Kategorie:** Hooks-Sammlung / Guards (Safety + Automation)
- **Was es tut:** Sammlung fertiger, getesteter Hooks für Claude Code + 7-Plugin-Marketplace. Session-Lifecycle (session-logger), User-Prompt-Submit, Pre-Tool-Use (block-dangerous-commands, protect-secrets, git-safety, protect-tests, case-insensitive-guard), Post-Tool-Use (auto-stage, format-code), Notification (Slack), Utils. Plugins: context-hogs (Per-File-Context-Cost-Leaderboard), nerf-receipts, dead-rules-audit, pr-provenance-stamp, standup-autopilot, dead-end-registry, bounty-board.
- **Wie es Tokens spart:** Primär Safety/Guards, nicht direkt Token-Kompression. Aber: `context-hogs` (Per-File-Token-Usage-Leaderboard) hilft, Token-Hogs zu identifizieren; `dead-rules-audit` (CLAUDE.md-Compliance-Scorecard) reduziert veraltete Regeln; `dead-end-registry` vermeidet Wiederholung verworfenen Ansätze. PostToolUse-Recorder laufen async (~null Latenz).
- **Integrationstyp:** Hooks (Claude Code) + Plugin-Marketplace
- **Stars:** nicht sichtbar
- **Relevanzscore:** 2 (primär Guards; Token-Sparen nur indirekt via context-hogs/dead-rules-audit)

---

## 12. disler/claude-code-hooks-multi-agent-observability
- **URL:** https://github.com/disler/claude-code-hooks-multi-agent-observability
- **Kategorie:** Multi-Agent Observability (Hooks + Dashboard)
- **Was es tut:** Echtzeit-Monitoring und Visualisierung von Claude-Code-Agenten via Hook-Event-Tracking. Erfasst alle Hook-Events (PreToolUse, PostToolUse, SubagentStart/Stop, PreCompact, SessionStart/End, etc.), speichert in SQLite, streamt via WebSocket an Vue-Client. Multi-Agent-Orchestrierung (Agent Teams, Tmux-Panes). Sicherheits-Features (blockiert rm -rf, schützt .env).
- **Wie es Tokens spart:** Keine direkte Token-Kompression. Observability hilft, ineffiziente Agenten/Workflows zu erkennen (z.B. PreCompact-Events, Tool-Call-Tracing). `--summarize`-Flag komprimiert Event-Payloads vor dem Senden. Primär Monitoring, nicht Token-Sparen.
- **Integrationstyp:** Hooks (Python) + Bun-Server + Vue-Client
- **Stars:** 1.5k
- **Relevanzscore:** 1 (Observability/Monitoring, keine Token-Reduktion)

---

## 13. severity1/claude-code-prompt-improver
- **URL:** https://github.com/severity1/claude-code-prompt-improver
- **Kategorie:** Prompt-Optimierung (Hooks + Skills)
- **Was es tut:** Intelligente Prompt-Optimierung. Injiziert den richtigen Kontext zum richtigen Zeitpunkt (Prompt-Submit, Tool-Use, Subagent-Start). Nudges: `improve` (Klarheits-Check, 1-6 Fragen nur bei vagen Prompts), `approach-assessment`, `workflow`, `output-readability`, `ask-user-question`, `plan-mode`, `plan`, `background-exec`, `subagent-routing`. Ziel: besseres erstes Output, weniger Korrektur-Runden.
- **Wie es Tokens spart:** v0.4.0: 31% Token-Reduktion durch Hook-Level-Evaluation. Evaluations-Prompt nur ~189 Tokens. Klare Prompts: null Skill-Overhead (proceed immediately). Vage Prompts: Skill nur bei Bedarf (progressive disclosure). Besseres erstes Output = weniger Round-Trips.
- **Integrationstyp:** Claude Code Plugin (Hooks: UserPromptSubmit, PreToolUse, SubagentStart) + Skills
- **Stars:** 1.8k
- **Relevanzscore:** 4 (31% Token-Reduktion durch bessere Prompts/erste Outputs)

---

## 14. ramakay/claude-self-reflect
- **URL:** https://github.com/ramakay/claude-self-reflect
- **Kategorie:** Persistent Memory (Rust-Binary, MCP + Hooks)
- **Was es tut:** "Claude forgets everything. This fixes that." Einzelnes 44MB-Rust-Binary, das Claude perfektes Memory gibt. SQLite + HNSW (sub-ms Vector-Search) + FastEmbed (384-dim lokal) + AST (code-aware search, 6 Sprachen). 15 MCP Tools, 6 Session-Lifecycle-Hooks. Multi-Source-Memory (Transcripts, Task-Outcomes, Plan-Dokumente, Session-Registry). AI-Narratives (9.3× Qualitäts-Boost, optional).
- **Wie es Tokens spart:** SessionStart-Hook injiziert relevanten vergangenen Kontext; UserPromptSubmit-Hook sagt voraus und injiziert Kontext vor Antwort. AI-Narratives: Token-Kompression von 100% auf 18% (82% Reduktion), ~$0.012/Konversation (Batch API). Verhindert Kontextverlust über Sessions (Context-Retention <20% nach 10 Sessions ohne CSR).
- **Integrationstyp:** MCP Server + Hooks + CLI (Rust-Binary)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 4 (82% Token-Kompression via AI-Narratives, persistente Memory)

---

## 15. yifanzz/claude-code-boost
- **URL:** https://github.com/yifanzz/claude-code-boost
- **Kategorie:** Hooks (Auto-Approval + Test-Enforcement + Notifications)
- **Was es tut:** Smart Hooks für Claude Code: Auto-approve sichere Dev-Operationen (weniger Klicks), Test-Enforcement (nudgt/blockt Session-Ende bis Tests laufen), Desktop-Notifications. Transcript-Parser (JSONL → XML). Auto-Approval-Logik: Fast-Approval für sichere Ops, LLM-Analyse für komplexe, Caching gegen redundante API-Calls.
- **Wie es Tokens spart:** Keine direkte Token-Kompression. Auto-Approval reduziert Friction (weniger Permission-Prompts). Test-Enforcement verhindert, dass Sessions mit ungetestetem Code enden (weniger spätere Bugfix-Runden). Caching von Approval-Entscheidungen spart API-Calls. Primär Produktivität, nicht Token-Sparen.
- **Integrationstyp:** Hooks (Claude Code) + CLI (npm)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 1 (Produktivitäts-Hooks, keine Token-Reduktion)

---

## 16. Vvkmnn/claude-historian-mcp
- **URL:** https://github.com/Vvkmnn/claude-historian-mcp
- **Kategorie:** Conversation-History-Suche (MCP)
- **Was es tut:** MCP-Server zum Durchsuchen der Claude-Code-Konversationshistorie. Zwei Tools, 11 Scopes, null Dependencies. `search` (Konversationen, Dateien, Fehler, Pläne, Config, Tasks, Sessions, Tools, ähnliche Queries, Memories) und `inspect` (intelligente Session-Zusammenfassung). Skill + Plugin (Hooks) optional. Kein npm-Install, keine DB, nur Suchalgorithmen.
- **Wie es Tokens spart:** SessionStart: 0 Tokens (kein Kontext-Injektion). Hooks feuern gezielt (vor WebSearch, EnterPlanMode, Task-Agents, nach Bash-Fehlern) und suchen in History statt neu zu explorieren. Verhindert, dass Claude Lösungen/Fehler-Fixes neu herausfindet. Kein Schreiben auf Disk, keine Worker-Daemons.
- **Integrationstyp:** MCP Server + Skill + Plugin (Hooks)
- **Stars:** nicht sichtbar
- **Relevanzscore:** 3 (verhindert Re-Exploration via History-Suche, 0-Token-Startup)

---

## Zusammenfassung / Ranking (Relevanz für Claude Code Token Saving)

| Rang | Repo | Score | Kern-Token-Mechanismus |
|---|---|---|---|
| 1 | NodeNestor/claude-rolling-context | 5 | Rolling Context Compression (quadratisch → linear) |
| 1 | JuliusBrussee/caveman | 5 | Output-Kompression + Input-Payload-Engine + Pixel-Mode |
| 1 | thedotmack/claude-mem | 5 | Progressive-Disclosure Memory-Retrieval |
| 1 | deusdata/codebase-memory-mcp | 5 | Graph-basierte Code-Exploration (120× weniger) |
| 1 | cnighswonger/claude-code-cache-fix | 5 | Prompt-Cache-Optimierung (Cache-Read-Ratio) |
| 6 | mempalace/mempalace | 4 | Lokale verbatim Memory + wake-up |
| 6 | zilliztech/memsearch | 4 | Progressive Retrieval, cross-platform |
| 6 | severity1/claude-code-auto-memory | 4 | CLAUDE.md Auto-Sync, isolierte Verarbeitung |
| 6 | DietrichGebert/ponytail | 4 | Code-Minimalismus (-22% Tokens) |
| 6 | severity1/claude-code-prompt-improver | 4 | Prompt-Optimierung (31% Token-Reduktion) |
| 6 | ramakay/claude-self-reflect | 4 | AI-Narratives (82% Token-Kompression) |
| 12 | Vvkmnn/claude-historian-mcp | 3 | History-Suche, 0-Token-Startup |
| 13 | zippoxer/recall | 2 | Session-Resume (Kontext-Wiederverwendung) |
| 13 | karanb192/claude-code-hooks | 2 | context-hogs/dead-rules-audit (indirekt) |
| 15 | disler/claude-code-hooks-multi-agent-observability | 1 | Observability, keine Token-Reduktion |
| 15 | yifanzz/claude-code-boost | 1 | Produktivität, keine Token-Reduktion |

**Hinweise:** Bei einigen Repos (rolling-context, mempalace, codebase-memory-mcp, auto-memory, ponytail, cache-fix, claude-code-hooks, self-reflect, boost) war die Star-Zahl im Scrape nicht sichtbar. Alle 16 Repos existieren und sind öffentlich zugänglich.
