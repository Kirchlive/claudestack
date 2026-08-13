# Agent 2 — Output: Token-Monitoring-, Cost-Tracking- und Routing-Repos

## Aufgabe
Recherche von 15 GitHub-Repos zu Token-Monitoring, Cost-Tracking und Routing für Claude Code. Für jedes Repo: Was es tut, wie es Tokens spart, Integrationstyp, Relevanzscore 1-5. Vollständige strukturierte Ausgabe in `/home/ubuntu/research_worker3.md` geschrieben.

## Ergebnis
Alle 15 Repos wurden per scrape_url_content auf ihrer GitHub-README-Seite ausgewertet. Kein Repo war privat oder nicht auffindbar. COVERAGE BOUND (15) erreicht.

## Kernbefunde (Ranking nach Relevanzscore für Claude Code Token Saving)

**5/5 — aktive Token-Reduktion:**
- **headroom** (chopratejas/headroom = headroomlabs-ai/headroom, 66.1k Stars): Context-Kompressionsschicht. Komprimiert Tool-Outputs, Logs, RAG, Dateien, Konversationsverlauf vor dem LLM. 60–95% weniger Tokens (JSON), 15–20% (Coding-Agents). Reversible (CCR), Output-Token-Reduktion, CacheAligner. Integration: Library/Proxy/Agent-Wrap/MCP.
- **rtk-ai/rtk**: Bash-Output-Kompression, bis 90% weniger Output, das der Agent liest. 100+ Kommandos, Auto-Rewrite-Hook. Integration: CLI + Hook.

**4/5 — aktive Optimierung/Delegation:**
- **getagentseal/codeburn** (9.3k Stars): Cost-Tracking über 40+ Tools + `optimize` (Waste-Erkennung) + `guard` (Budget-Caps $5/$15). Integration: CLI + Hooks.
- **tkaufmann/claude-gemini-bridge** (406 Stars): Delegiert große Analysen (>50k Tokens) an Gemini via PreToolUse-Hook, spart teure Claude-Tokens.

**3/5:**
- **nikitadoudikov/claude-pulse**: Dashboard mit Budgets, Spend-Transparenz, Tool-Approval, Session-Recovery. Hooks + Web.
- **BlockRunAI/ClawRouter** (6.6k Stars): LLM-Router, routet zum günstigsten fähigen Modell (bis 88–98% Kostenersparnis). Proxy.
- **Piebald-AI/tweakcc**: Toolsets (reduzieren Context-Bloat), System-Prompt-Customization, MCP-Optimierung. Patches auf cli.js.

**2/5 — Monitoring/Transparenz:**
- ccusage/ccusage, f/agentlytics (560 Stars), RonnieTheTester/headroom-meter, ColeMurray/claude-code-otel, Aider-AI/aider.

**1/5 — kein Token-Bezug:**
- philipp-spiess/claude-code-costs (reine Kostenanalyse), onikan27/claude-code-monitor (reines Session-Monitoring).

## Kernaussage
Höchste Relevanz für aktive Token-Ersparnis: **headroom** (Context-Kompression) und **rtk** (Bash-Output-Kompression). **codeburn** und **claude-gemini-bridge** bieten aktive Optimierung/Delegation. Die meisten übrigen Repos sind reine Monitoring-/Cost-Tracking-Tools (Transparenz, keine aktive Reduktion).

## Dateien
- **Primärer Deliverable:** `/home/ubuntu/mini_tasks/inv_1/agent_2/output.md` (diese Datei)
- **Vollständige strukturierte Recherche:** `/home/ubuntu/research_worker3.md` (15 Repos, je mit Repo-Name, URL, Kategorie, Funktion, Token-Spar-Mechanismus, Integrationstyp, Stars, Relevanzscore)
