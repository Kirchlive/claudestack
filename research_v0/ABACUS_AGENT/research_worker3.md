# Recherche: Token-Monitoring-, Cost-Tracking- und Routing-Repos für Claude Code

Recherche durchgeführt am 13.08.2026. Für jedes Repo wurde die GitHub-README-Seite per scrape_url_content geöffnet und ausgewertet. Fokus: Wie das Tool Tokenverbrauch in Claude Code reduziert.

---

## 1. ccusage/ccusage
- **URL:** https://github.com/ccusage/ccusage
- **Kategorie:** Cost-/Token-Tracking (CLI-Analyse)
- **Was es tut:** Analysiert lokale Nutzungsdaten von Coding-Agent-CLIs (Claude Code, Codex, OpenCode, Amp, Droid, Codebuff, Hermes, Goose, Copilot, Gemini CLI, Grok u.v.m.) und erstellt Tages-, Wochen-, Monats- und Session-Reports. Zeigt Tokenverbrauch und Kosten in USD, inkl. Cache-Token (Cache Creation/Read getrennt), 5-Stunden-Billing-Windows, Modell-Breakdown, Projekt-/Instanz-Gruppierung.
- **Wie es Tokens spart:** Indirekt — es spart keine Tokens selbst, sondern macht Tokenverbrauch und Kosten sichtbar (Transparenz). Ermöglicht das Erkennen von teuren Sessions/Modellen. Kein aktives Komprimieren.
- **Integrationstyp:** CLI (npx/bunx/pnpm dlx), liest lokale Session-Dateien; Statusline-Hook-Integration (Beta).
- **Stars:** nicht direkt sichtbar im Scrape (keine Zahl angegeben).
- **Relevanzscore (Claude Code Token Saving):** 2/5 (nur Monitoring/Transparenz, keine aktive Reduktion)

---

## 2. philipp-spiess/claude-code-costs
- **URL:** https://github.com/philipp-spiess/claude-code-costs
- **Kategorie:** Cost-Tracking (Analyse)
- **Was es tut:** Analysiert alle Claude-Code-Konversationen in `~/.claude/projects/`, berechnet Gesamtkosten, Tages-Breakdown der letzten 30 Tage, Top-20 teuerste Konversationen, Projekt-Filterung. Generiert interaktiven HTML-Report mit Charts.
- **Wie es Tokens spart:** Indirekt — reine Kostenanalyse/Visualisierung, keine Token-Reduktion.
- **Integrationstyp:** CLI (npx claude-code-costs), liest lokale Session-Dateien.
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 1/5 (reine Kostenanalyse, keine Token-Ersparnis)

---

## 3. getagentseal/codeburn
- **URL:** https://github.com/getagentseal/codeburn
- **Kategorie:** Cost-/Token-Tracking + Optimierung
- **Was es tut:** Lokales Tool, das AI-Coding-Tokenverbrauch und Kosten über 40+ Tools/Agenten (Claude Code, Cursor, Codex, Gemini, Grok) trackt, aufgeschlüsselt nach Modell, Projekt und Task. Vier Oberflächen: Desktop, Web, Terminal, macOS-Menubar. Features: `optimize` (scannt Sessions auf Waste-Patterns wie ständig neu gelesene Dateien, ungenutzte MCP-Server, aufgeblähter Kontext), `compare` (Modellvergleich inkl. Cache-Hit-Rate), `yield` (korreliert Sessions mit Git-Commits), `guard` (opt-in Hooks mit Soft-Cap $5 / Hard-Cap $15 / Checkpoints).
- **Wie es Tokens spart:** Aktiver — `codeburn optimize` identifiziert Waste-Patterns und schlägt Fixes vor (anwendbar via `--apply`); `guard` setzt Budget-Caps. Cache-Hit-Rate-Analyse hilft, KV-Cache besser zu nutzen.
- **Integrationstyp:** CLI (npx codeburn) + opt-in Claude-Code-Hooks (guard) + Web-Dashboard + Menubar.
- **Stars:** 9.3k | Forks: 732
- **Relevanzscore:** 4/5 (aktive Waste-Erkennung + Budget-Guards, aber primär Monitoring)

---

## 4. f/agentlytics
- **URL:** https://github.com/f/agentlytics
- **Kategorie:** Unified Analytics (Multi-Editor)
- **Was es tut:** Analysiert und vereinheitlicht AI-Konversationen aus 17 Editoren (Cursor, Devin, Claude Code, VS Code Copilot, Codex, Gemini CLI, Zed, OpenCode u.a.) in ein lokales Analytics-Dashboard. Sessions, Kosten, Modelle, Tools, Projekte, Subscriptions/Quotas, Vergleich zwischen Editoren. Relay-Funktion für Team-Context-Sharing via MCP.
- **Wie es Tokens spart:** Indirekt — Kosten-/Token-Analyse und Editor-Vergleich (Effizienz-Ratios), keine aktive Kompression. Kein Claude-Code-spezifisches Token-Saving.
- **Integrationstyp:** CLI (npx agentlytics) + lokales Web-Dashboard + MCP-Server (Relay).
- **Stars:** 560 | Forks: 84
- **Relevanzscore:** 2/5 (Analytics/Transparenz, keine aktive Reduktion)

---

## 5. chopratejas/headroom (→ headroomlabs-ai/headroom)
- **URL:** https://github.com/chopratejas/headroom (zeigt headroomlabs-ai/headroom)
- **Kategorie:** Context-Kompressionsschicht (Token-Reduktion)
- **Was es tut:** Komprimiert alles, was der AI-Agent liest (Tool-Outputs, Logs, RAG-Chunks, Dateien, Konversationsverlauf), bevor es zum LLM geht. 60–95% weniger Tokens (JSON-Daten), 15–20% weniger (Coding-Agents). ContentRouter wählt passenden Kompressor (SmartCrusher für JSON, CodeCompressor via AST, Kompress-v2-base für Text). Reversible (CCR) — Originale werden lokal gecacht und bei Bedarf per `headroom_retrieve` abgerufen. Auch Output-Token-Reduktion (Verbosity-Steering, Effort-Routing). Cross-Agent-Memory, `headroom learn` (miniert fehlgeschlagene Sessions).
- **Wie es Tokens spart:** Sehr aktiv — komprimiert Input-Kontext (JSON, Code, Text) und reduziert Output-Tokens. CacheAligner warnt vor volatilem Content, der KV-Cache-Prefixe zerstört.
- **Integrationstyp:** Library (Python/TS `compress()`), Proxy (`headroom proxy`), Agent-Wrap (`headroom wrap claude`), MCP-Server, SDK-Wrapper (Anthropic/OpenAI, Vercel AI SDK, LiteLLM, LangChain).
- **Stars:** 66.1k | Forks: 5.1k
- **Relevanzscore:** 5/5 (direkte, messbare Token-Reduktion für Claude Code)

---

## 6. headroomlabs-ai/headroom
- **URL:** https://github.com/headroomlabs-ai/headroom
- **Kategorie:** Context-Kompressionsschicht (Token-Reduktion)
- **Was es tut:** Identisch zu chopratejas/headroom (gleiches Projekt, offizielles Org-Repo). Komprimiert alles, was der Agent liest, vor dem LLM. 60–95% weniger Tokens (JSON), 15–20% (Coding-Agents). ContentRouter → SmartCrusher/CodeCompressor/Kompress-v2-base. Reversible (CCR), Output-Token-Reduktion, Cross-Agent-Memory, `headroom learn` schreibt Korrekturen in CLAUDE.local.md/CLAUDE.md/AGENTS.md.
- **Wie es Tokens spart:** Sehr aktiv — Input-Kompression (JSON/AST/Text) + Output-Reduktion + CacheAligner für KV-Cache-Effizienz.
- **Integrationstyp:** Library, Proxy, Agent-Wrap (`headroom wrap claude`), MCP-Server, SDK-Wrapper (Anthropic/OpenAI, Vercel AI SDK, LiteLLM, LangChain, Agno, ASGI-Middleware).
- **Stars:** nicht separat sichtbar (Org-Repo, gleiche 66.1k wie oben).
- **Relevanzscore:** 5/5 (direkte, messbare Token-Reduktion für Claude Code)

---

## 7. RonnieTheTester/headroom-meter
- **URL:** https://github.com/RonnieTheTester/headroom-meter
- **Kategorie:** Monitoring/Visualisierung (Headroom-Addon)
- **Was es tut:** Live-Terminal-Dashboard, das Headroom-Kompressionslogs sichtbar macht. Parst `~/.headroom/logs/proxy.log` (Felder wie `tok_before`, `tok_after`, `tok_saved`, `cache_hit_pct`) und zeigt Token-Ersparnis, Kompressions-Spikes, Cache-Hits, Frame-Reduktion, aktive Transforms. Read-only, keine Modifikation.
- **Wie es Tokens spart:** Indirekt — macht die Ersparnis von Headroom messbar/sichtbar (ROI-Nachweis), komprimiert selbst nicht.
- **Integrationstyp:** CLI-Skript (ein Python-Skript, keine Pakete), liest Headroom-Proxy-Log.
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 2/5 (nur Visualisierung der Headroom-Ersparnis, kein eigenes Saving)

---

## 8. onikan27/claude-code-monitor
- **URL:** https://github.com/onikan27/claude-code-monitor
- **Kategorie:** Session-Monitoring (TUI + Mobile)
- **Was es tut:** Überwacht mehrere Claude-Code-Sessions in Echtzeit vom Terminal (TUI) oder Smartphone (Mobile Web). Serverless (dateibasiertes State-Management), Vim-Navigation, Remote-Fokus, Permission-Prompt-Navigation, Screen-Capture. macOS-only (AppleScript).
- **Wie es Tokens spart:** Kein Token-Saving — reines Session-/Prozess-Monitoring. Kein Bezug zu Tokenverbrauch.
- **Integrationstyp:** CLI (npx claude-code-monitor / ccm) + Claude-Code-Hooks (Setup) + Mobile Web.
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 1/5 (kein Token-Bezug)

---

## 9. nikitadoudikov/claude-pulse
- **URL:** https://github.com/nikitadoudikov/claude-pulse
- **Kategorie:** Cost-/Token-Monitoring + Session-Management
- **Was es tut:** Lokales Dashboard, das jede Claude-Code- (und Codex-)Session beobachtet. Live-Spend nach Stunde/Tag/Woche, Context-Fill pro Session, Volltextsuche, Budgets mit Phone-Alert, Tool-Approval von Phone/Notch (Allow/Allow all/Deny), geplante Messages (Resume bei Limit-Reset), Session-Recovery, "Week Wrapped". Liest `~/.claude` read-only.
- **Wie es Tokens spart:** Indirekt — Budgets und Spend-Transparenz helfen, Verbrauch zu kontrollieren; Session-Recovery verhindert Context-Verlust. Keine aktive Kompression.
- **Integrationstyp:** CLI (npx pulse-for-claude-code / claude-pulse) + Claude-Code-Hooks (Notification, Stop, PreToolUse) + Web-Dashboard + Phone-Push (ntfy).
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 3/5 (Budget-Kontrolle + Spend-Transparenz, keine aktive Reduktion)

---

## 10. ColeMurray/claude-code-otel
- **URL:** https://github.com/ColeMurray/claude-code-otel
- **Kategorie:** Observability-Stack (OpenTelemetry)
- **Was es tut:** Vollständiger Observability-Stack für Claude Code: OpenTelemetry Collector → Prometheus (Metriken) + Loki (Logs) → Grafana (Dashboards). Trackt Kosten nach Modell, Token-Usage (input/output/cache/creation), Session-Analytics, Tool-Usage, API-Latenz, Fehlerraten, Produktivität (LOC, Commits, PRs). Implementiert die offizielle Claude-Code-Observability-Doku.
- **Wie es Tokens spart:** Indirekt — Token-Effizienz (Cost-per-Token) und Kostenanalyse, keine aktive Reduktion.
- **Integrationstyp:** Docker-Compose-Stack + Claude-Code-Telemetry-Env-Vars (OTEL-Exporter).
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 2/5 (Observability/Transparenz, keine aktive Reduktion)

---

## 11. BlockRunAI/ClawRouter
- **URL:** https://github.com/BlockRunAI/ClawRouter
- **Kategorie:** LLM-Router (Kostenreduktion via Modell-Routing)
- **Was es tut:** Open-Source-Smart-LLM-Router für autonome Agenten. Analysiert jeden Request über 15 Dimensionen und routet zum günstigsten fähigen Modell in <1ms, komplett lokal. 70 Modelle (OpenAI, Anthropic, Google, xAI, DeepSeek). Wallet-Signatur-Auth (keine API-Keys), USDC-Mikrozahlungen via x402. Routing-Profile: free (100% Ersparnis), auto (88%), eco (98%), premium (0%).
- **Wie es Tokens spart:** Aktive Kostenreduktion durch Modell-Routing (günstigstes fähiges Modell pro Request). Spart primär Kosten, nicht Token-Anzahl — aber reduziert effektiv den Token-Bill. Kein Context-Komprimieren.
- **Integrationstyp:** Lokaler Proxy (Port 8402, OpenAI-kompatibel) + OpenClaw-Plugin.
- **Stars:** 6.6k | Forks: 635
- **Relevanzscore:** 3/5 (Kostenreduktion via Routing, kein Context-Saving; für Claude Code relevant als Proxy)

---

## 12. tkaufmann/claude-gemini-bridge
- **URL:** https://github.com/tkaufmann/claude-gemini-bridge
- **Kategorie:** Modell-Delegation (Hook)
- **Was es tut:** Delegiert große Code-Analyse-Aufgaben von Claude Code automatisch an Google Gemini. Über PreToolUse-Hook: zählt Dateien, schätzt Tokens, und wenn >50k Tokens (oder ≥3 Dateien bei Task), delegiert an Gemini (bis 800k Tokens, ≤10MB). Kombiniert Claude's Reasoning mit Gemini's großem Kontext. Cache-Layer.
- **Wie es Tokens spart:** Aktive Kosten-/Token-Reduktion — große Analysen laufen über Gemini statt Claude, wodurch teure Claude-Tokens gespart werden. Nutzt Gemini's günstigeren/großen Kontext.
- **Integrationstyp:** Claude-Code-Hook (PreToolUse, matcher Read|Grep|Glob|Task) + Gemini CLI/API.
- **Stars:** 406 | Forks: 76
- **Relevanzscore:** 4/5 (aktive Delegation großer Analysen an günstigeres Modell spart Claude-Tokens)

---

## 13. rtk-ai/rtk
- **URL:** https://github.com/rtk-ai/rtk
- **Kategorie:** Bash-Output-Kompression (Token-Reduktion)
- **Was es tut:** Hochperformanter CLI-Proxy, der bis zu 90% des Bash-Outputs filtert/komprimiert, bevor es der Agent (LLM) liest. 100+ unterstützte Kommandos (ls, cat, grep, git status/diff/log, cargo/npm/pytest/go test, ruff, docker, kubectl). Strategien: Smart Filtering, Grouping, Truncation, Deduplication. Auto-Rewrite-Hook, der Bash-Kommandos transparent in rtk-Äquivalente umschreibt. `rtk gain` zeigt Token-Savings-Analytics.
- **Wie es Tokens spart:** Sehr aktiv — reduziert Input-Tokens drastisch, indem Bash-Output komprimiert wird (bis 90% weniger Output, das der Agent liest). Direkt relevant für Claude Code.
- **Integrationstyp:** CLI (Rust-Binary) + Auto-Rewrite-Hook (`rtk init -g` für Claude Code/Copilot) + RTK.md.
- **Stars:** nicht sichtbar im Scrape (Version 0.28.2 erwähnt).
- **Relevanzscore:** 5/5 (direkte, messbare Input-Token-Reduktion für Claude Code)

---

## 14. Piebald-AI/tweakcc
- **URL:** https://github.com/Piebald-AI/tweakcc
- **Kategorie:** Claude-Code-Customization (System-Prompt/Toolsets)
- **Was es tut:** CLI-Tool, das Claude Code patcht (minified cli.js). Customisiert System-Prompts, erstellt Toolsets (nur erlaubte Tools werden an das Modell gesendet), Themes, Thinking-Verbs, Session-Titel, Modell-Zuordnung pro Subagent, MCP-Startup-Optimierung, Token-Count-Rounding, Statusline-Throttling, AGENTS.md-Support, Opus-Plan-1M-Mode.
- **Wie es Tokens spart:** Aktiv, aber indirekt — Toolsets reduzieren Context-Bloat (nicht erlaubte Tools werden nicht an das Modell gesendet); System-Prompt-Customization kann Tokenverbrauch senken; MCP-Startup-Optimierung; Opus-Plan-1M-Mode reduziert Context-Anxiety. Kein direkter Kompressor.
- **Integrationstyp:** CLI (npx tweakcc) + Patches auf Claude-Code-Binary + API (npm).
- **Stars:** nicht sichtbar im Scrape.
- **Relevanzscore:** 3/5 (Toolsets/System-Prompt-Optimierung reduzieren Context, aber kein direkter Kompressor)

---

## 15. Aider-AI/aider
- **URL:** https://github.com/Aider-AI/aider
- **Kategorie:** AI-Pair-Programming-Tool (eigener Agent)
- **Was es tut:** Terminal-basiertes AI-Pair-Programming mit LLMs (Claude 3.7 Sonnet, DeepSeek, OpenAI o1/GPT-4o, lokale Modelle). Erstellt Codebase-Map für große Projekte, Git-Integration (automatische Commits), 100+ Sprachen, IDE-Integration, Voice-to-Code, Linting/Testing, Web-Chat-Copy/Paste.
- **Wie es Tokens spart:** Indirekt — Codebase-Map hilft, effizient in großen Projekten zu arbeiten (weniger Kontext nötig). Kein Claude-Code-spezifisches Token-Saving; ist ein eigenständiger Agent, kein Claude-Code-Addon. Kein aktiver Kompressor.
- **Integrationstyp:** Eigenständige CLI (Python), kein Claude-Code-Hook/Proxy.
- **Stars:** nicht sichtbar im Scrape (sehr bekanntes Projekt, ~30k+).
- **Relevanzscore:** 2/5 (eigenständiger Agent, kein Claude-Code-Token-Saving; Codebase-Map spart indirekt Kontext)

---

## Zusammenfassung / Ranking nach Relevanzscore (Claude Code Token Saving)

| Score | Repos |
| :--- | :--- |
| **5/5** | headroom (chopratejas + headroomlabs-ai), rtk-ai/rtk |
| **4/5** | getagentseal/codeburn, tkaufmann/claude-gemini-bridge |
| **3/5** | nikitadoudikov/claude-pulse, BlockRunAI/ClawRouter, Piebald-AI/tweakcc |
| **2/5** | ccusage/ccusage, f/agentlytics, RonnieTheTester/headroom-meter, ColeMurray/claude-code-otel, Aider-AI/aider |
| **1/5** | philipp-spiess/claude-code-costs, onikan27/claude-code-monitor |

**Kernaussage:** Die höchste Relevanz für aktive Token-Ersparnis in Claude Code haben **headroom** (Context-Kompression, 60–95% bei JSON) und **rtk** (Bash-Output-Kompression, bis 90%). **codeburn** und **claude-gemini-bridge** bieten aktive Optimierung/Delegation. Die meisten übrigen Repos sind reine Monitoring-/Cost-Tracking-Tools (Transparenz, keine aktive Reduktion).
