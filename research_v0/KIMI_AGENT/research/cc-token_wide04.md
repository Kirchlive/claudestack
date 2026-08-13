## Facet: Allgemeine LLM-Kontext-Minimierung

Recherche-Stand: 2026-08-13. Suchanfragen: 16 eigenständige Queries über alle 5 Teilbereiche; Verifikation von ~30 Repos per GitHub-API; README-/Docs-Lektüre der wichtigsten Kandidaten.

### Key Findings

1. **Die aktivste Front 2026 ist nicht klassische Prompt-Kompression, sondern Proxy-/Hook-basierte Kontext-Optimierung speziell für Coding-Agenten.** Tools wie `mksglu/context-mode` (19,8k Stars, Sandbox-Ausführung mit 98 % Token-Reduktion bei Tool-Outputs) und Edgee Compressor V2 (drei orthogonale Schichten, ~50 % Kostenreduktion auf Claude-Code-Sessions, SWE-bench-verifiziert) überholen die Forschungs-Engines in Relevanz für Claude Code.[^4^][^8^]
2. **LLMLingua bleibt der Forschungs-Referenzpunkt (6,5k Stars), ist aber nicht nativ mit Claude Code integrierbar** — Integration nur indirekt über Wrapper wie `llmlingua-cursor` (FastMCP-Server, primär für Cursor gebaut) oder eigene MCP-Adapter. Evidenz: bis 20× Kompression mit ~1,5 Prozentpunkten Qualitätsverlust (GSM8K); LongLLMLingua erreicht 94 % Kostenreduktion auf LooGLE bei bis zu +21,4 % Performance.[^1^][^2^]
3. **`musistudio/claude-code-router` (36,6k Stars) ist der De-facto-Standard fürs Routing in Claude Code** — task-bewusstes Routing (default/background/think/longContext/webSearch/image) zu beliebigen Providern, inkl. GitHub-Actions-Integration. Berichtete Ersparnisse 50–99 % je nach Strategie.[^9^][^10^]
4. **Caching hat zwei verschiedene Welten:** (a) Anthropic-Prefix-Caching läuft in Claude Code bereits automatisch — dafür gibt es keinen sinnvollen Plugin-Aufsatz (`flightlesstux/prompt-caching` adressiert explizit nur eigene SDK-Apps); (b) `cnighswonger/claude-code-cache-fix` (414 Stars) fixt konkrete Cache-Bugs in Claude Code selbst (Block-Scatter bei `--resume`, instabiler `cc_version`-Fingerprint, nicht-deterministische Tool-Reihenfolge) — bis zu 20× Kostenexplosion auf resumed Sessions ohne Fix.[^11^][^12^][^13^]
5. **TOON (25,1k Stars) ist das einzige token-sparende Datenformat mit echter Traktion** — produktive Fallstudie (Halodoc): 5–15 % Gesamtkostensenkung, POC für Output-Tokens 8–43 %. Alternativen (YAML, MessagePack, Protobuf) verlieren im direkten Vergleich auf Token-Effizienz oder LLM-Kompatibilität.[^5^][^6^]
6. **Repo-Packaging ist gesättigt und reif:** repomix (27,8k) mit `--compress` (tree-sitter), MCP-Server und Token-Budget-CI-Guard ist die vollständigste Option; yek wurde umbenannt/zu `mohsen1/yek` migriert (bodo-run/yek liefert 404). Alle Packer teilen dieselbe Grenze: Bei großem Repo + langer Session wird das Neu-Packen pro Turn selbst zum Kostenfaktor — dort gewinnen graph-/indexbasierte Ansätze (SigMap, Stacklit, gortex).[^14^][^15^][^16^]

### Repo-/Tool-Matrix

| Tool | Teilbereich | Mechanismus | Claude-Code-Integration | Stars | Letzter Push | Sparraten-Beleg | Deep-Dive-Kandidat? |
|---|---|---|---|---|---|---|---|
| microsoft/LLMLingua (inkl. LongLLMLingua, LLMLingua-2) | Kompression | Perplexity-/Klassifikator-basiertes Token-Dropping | Keine nativ; via Wrapper/MCP-Adapter | 6.548 | 2026-04-08 | EMNLP'23/ACL'24: bis 20×, ~1,5 Pkt. Verlust; LongLLMLingua 94 % Kosten↓ auf LooGLE[^1^][^2^] | Ja (Referenz) |
| llmlingua-cursor (npm, Mustafa Waqar) | Kompression | LLMLingua-2 als FastMCP-Server | MCP (für Cursor gebaut, auf CC übertragbar) | n/a (npm) | 2026 (aktiv) | Herstellerangabe: 30–55 % je Prompt-Typ[^3^] | Nein |
| Edgee (edgee-ai/edgee, Compressor V2) | Kompression/Gateway | Proxy: Brevity-Output-Kompression + Tool Surface Reduction + Tool-Result-Trimming | Proxy (ANTHROPIC_BASE_URL) | 124 (CLI-Repo; Engine separat) | 2026-08-12 | Eigenbenchmark SWE-bench: ~50 % Kosten↓; Brevity ~30 %, TSR ~33 % Token↓[^8^] | **Ja** |
| mksglu/context-mode | Kompression | MCP-Server: Sandbox-Execution, nur stdout in Kontext; SQLite-FTS5-Index + Suche | MCP (`npx -y context-mode`) | 19.825 | 2026-08-12 | 315 KB → 5,4 KB = 98 % Reduktion (Hersteller-Messung)[^4^] | **Ja** |
| atlassian-labs/mcp-compressor | Kompression (Tool-Schemas) | MCP-Proxy: kollabiert alle Tool-Schemas auf `get_tool_schema` + `invoke_tool` | MCP (wraps andere Server, stdio/HTTP/SSE) | 106 | 2026-07-28 | 70–97 % Token↓ bei Tool-Beschreibungen (GitHub-MCP 17,6k → 2 Wrapper-Tools)[^7^] | Ja |
| juyterman1000/entroly | Kompression | AST-basierte Multi-Resolution-Kompression (Full/Skeleton/Reference), Rust/WASM, selbstlernend | MCP (Claude Code, Cursor, Cline) | 435 | 2026-08-12 | Behauptung: ~186k → 9–55k Tokens (~90 %); unabhängig unbestätigt[^17^] | Mittel |
| claudioemmanuel/squeez | Kompression | Hook-basierter Token-Kompressor (95 % Bash-Output, Signature-Mode, Cross-Call-Dedup) | Hook + MCP (5 CLI-Hosts inkl. CC) | 182 | 2026-08-12 | Herstellerangabe, keine Fremdmessung | Mittel |
| jee599/contextzip | Kompression | Rust-Proxy, Live-stdout-Kompression | Proxy für Claude Code | 22 | 2026-06-03 | Behauptung 60–90 %, frühes Stadium | Nein |
| ZongqianLi/500xCompressor | Kompression (Forschung) | Learned Soft-Prompt (non-text tokens) | Keine (Forschungscode) | 64 | 2026-03-09 | ACL'25: bis 480× mit ~30 % Acc-Drop[^18^] | Nein |
| getao/icae | Kompression (Forschung) | In-context Autoencoder, Memory Slots | Keine | 178 | 2024-05 (stagnant) | 4× Kontextkompression (Paper)[^19^] | Nein |
| liyucheng09/Selective_Context | Kompression (Forschung) | Self-Information-basiertes Token-Pruning | Keine | 424 | 2024-02 (stagnant) | ~2× Kapazität, 40 % GPU-Zeit↓[^20^] | Nein |
| carriex/recomp | Kompression (Forschung) | Extraktive+abstraktive RAG-Kompression | Keine | 149 | 2026-01 | Bis 6× bei retrieved docs (Paper)[^18^] | Nein |
| jayelm/gisting / princeton-nlp/AutoCompressors | Kompression (Forschung) | Gist-Tokens / Summary-Vectors (Soft-Prompts) | Keine (Retraining nötig) | 322 / 337 | 2025-02 / 2024-09 (stagnant) | Gisting bis 26× (Paper)[^19^] | Nein |
| microsoft/acon | Kompression (Agenten-Historie) | Kompressions-Guidelines für Long-Horizon-Agenten | Prompt-Templates (indirekt) | 100 | 2025-10 | Baseline in 2026er Studien; kein Produktions-Tool[^21^] | Mittel |
| micoverde/taac-llm-compression | Kompression (Forschung) | Task-Aware Adaptive Compression, Quality-Gate | Keine | 0 | 2026-02 | 22 % Kosten↓ bei 96 % Qualität (eigene Studie, n=1800)[^22^] | Nein |
| toon-format/toon | Datenformat | Token-Oriented Object Notation: Spalten einmal deklariert, tabellarische Arrays | Format; via CLI/SDK/MCP (toonify) | 25.144 | 2026-08-07 | Halodoc-Produktion: 5–15 % Kosten↓; 35–45 % theoretisch; ~95 % LLM-Compat[^5^][^6^] | **Ja** |
| PCIRCLE-AI/toonify-mcp | Datenformat | MCP-Plugin: trimmt große Tool-Outputs (JSON/YAML/Logs) Richtung TOON | MCP (explizit für Claude Code) | 64 | 2026-08-12 | Abgeleitet von TOON-Benchmarks | Mittel |
| manojmallick/sigmap | Datenformat/Code-Karte | Signatur-Karte statt Volltext; 21 MCP-Tools (`search_signatures`, `squeeze_output`…) | MCP (`sigmap mcp install claude`) | 614 | 2026-07-28 | Eigenbenchmark (21 Repos): 97,0 % Token↓, Hit@5 87,8 % vs. 13,6 % Baseline[^23^] | **Ja** |
| xaviviro/python-toon | Datenformat | Python-Encoder/Decoder für TOON | Library (indirekt) | klein | 2026 | Fallstudien: 50 %+ Token↓ auf tabellarischen Payloads[^24^] | Nein |
| musistudio/claude-code-router | Routing | Lokaler Proxy/Gateway, task-bewusstes Routing, Browser-UI | Proxy (`ANTHROPIC_BASE_URL=localhost:3456`) | 36.609 | 2026-08-11 | Community-Berichte 50–99 % Kosten↓ je Strategie[^9^][^10^] | **Ja** |
| BlockRunAI/ClawRouter | Routing | Agent-nativer Router, 66 Modelle, <1 ms lokales Routing, x402-Payments | Proxy/Router | 6.612 | 2026-08-12 | Herstellerangaben; unabhängige Belege dünn | Mittel |
| BerriAI/litellm | Routing/Gateway | Generelles AI-Gateway (100+ APIs, OpenAI-Format, Cost-Tracking, Rust-Core) | Proxy (generisch, CC via Base-URL) | 56.199 | 2026-08-12 | Etabliert; CC-spezifische Ersparnis nicht quantifiziert[^10^] | Ja (Vergleich) |
| maximhq/bifrost | Routing/Gateway + Caching | Gateway mit Code Mode (Python-Orchestrierung statt Tool-Defs) + semantischem Caching | Proxy/MCP-Gateway | 7.266 | 2026-08-12 | Code Mode: bis 92,8 % Input-Token↓, 92,2 % Kosten↓ (508 Tools, eigene Messung)[^25^] | **Ja** |
| lm-sys/RouteLLM | Routing (Forschung) | Trainierte Router, Qualitäts-Kosten-Tradeoff | Keine (Framework) | 5.332 | 2024-08 (stagnant) | Paper: bis 85 % Kosten↓ ohne Qualitätsverlust | Nein |
| stanford-futuredata/FrugalGPT | Routing (Forschung) | LLM-Kaskade mit trainiertem Scorer | Keine | 280 | 2025-02 (stagnant) | Bis 98 % Kosten↓ — task-spezifisch, „weithin überzitiert"[^26^] | Nein |
| OpenRouter (Setup) | Routing | ANTHROPIC_BASE_URL → OpenRouter; Failover, Free-Tier-Modelle | Env-Var (nativ unterstützt) | – (SaaS) | 2026 | GLM 5.2 $1,40/M vs. Claude $10/M = 86 % ↓ Input; Tool-Calling-Caveats[^27^] | Mittel |
| zilliztech/GPTCache | Caching (semantisch) | Embedding-Similarity-Cache für LLM-Responses | Library/Proxy (indirekt via Gateway) | 8.130 | 2025-07 (langsam) | Praxis: 25–35 % Hit-Rate Chatbot-Traffic; 2–10× schneller bei Hit[^28^][^29^] | Mittel |
| CoderDayton/semantic-cache-mcp | Caching (Datei-Ebene) | MCP: unveränderte Dateien ~0 Tokens, Diff-only bei Änderung, lokale Embeddings | MCP + Permission-Deny auf native Read/Write | 2 | 2026-07-28 | Herstellerangabe 80 %+ Token↓; sehr früh | Mittel (Konzept stark) |
| cnighswonger/claude-code-cache-fix | Caching (Bugfix-Proxy) | Lokaler Proxy: fixt Block-Scatter, Fingerprint-Instabilität, Tool-Sort, TTL-Marker; Telemetrie | Proxy (`localhost:9801`) / Preload / VSIX / Docker | 414 | 2026-08-12 | Fixt bis 20× Kostenexplosion auf resumed Sessions; Dogfood: Hit-Rate 94,66 % vs. 92,44 %[^11^] | **Ja** |
| flightlesstux/prompt-caching | Caching (SDK-Apps) | MCP-Plugin: injiziert `cache_control`-Breakpoints, Cache-Statistiken | Plugin/MCP — **nicht für CC-Sessions** (CC cached bereits selbst) | klein | 2026-03 | Eigene Messungen: 80–92 % Token↓ in SDK-Sessions[^12^] | Nein (Scope klären) |
| yamadashy/repomix | Packaging | Repo→eine Datei (XML/MD), `--compress` via tree-sitter, Secretlint, Token-Budget | CLI + MCP-Server | 27.797 | 2026-08-11 | Kompressionsgrad repo-abhängig; De-facto-Standard[^14^] | Ja (Referenz) |
| coderamp-labs/gitingest | Packaging | GitHub-URL→Text (hub→ingest), Hosted App + CLI | CLI/Web (kein MCP nötig) | 15.296 | 2026-08-05 | Keine Kompression — alles Nicht-Ignorierte landet im Prompt[^15^] | Nein |
| mufeedvh/code2prompt | Packaging | Rust-CLI, Handlebars-Templates, Git-Diff-Scoping | CLI + MCP-Server | 7.598 | 2026-06-29 | Schnellster Packer; Reduktion nur via Glob-Filter[^15^] | Nein |
| simonw/files-to-prompt | Packaging | Dateien→XML-Konkatenation | CLI | 2.775 | 2025-02 (stagnant) | Keine Kompression | Nein |
| mohsen1/yek (ex bodo-run/yek) | Packaging | Rust, Git-History-Priorisierung (wichtige Dateien zuletzt), Token-Cap | CLI | 2.471 | 2026-06-29 | 230× schneller als repomix (Hersteller-Messung Next.js-Repo)[^30^] | Nein |

### Detailnotizen zu Top-Kandidaten

**mksglu/context-mode (19,8k Stars)** — Aktuell wohl das relevanteste Einzel-Tool für Claude Code. Kernidee: MCP-Tool-Calls laufen in isolierten Subprozessen (10 Laufzeiten, Bun-auto-detect); nur stdout betritt den Kontext, Rohdaten bleiben in der Sandbox. Bei Output >5 KB + Intent: Indexierung in SQLite FTS5, Rückgabe nur relevanter Snippets. `batch_execute` + `search` gegen den Index. Beleg: 315 KB Playwright-/Log-Output → 5,4 KB (98 %). Referenziert Cloudflares Code Mode (99,9 % Kompression der Tool-Definitionen) als Inspiration für die Gegenrichtung.[^4^]

**Edgee Compressor V2** — Rust-AI-Gateway mit drei stapelbaren Schichten: Brevity (~30 % Output-Token↓, streicht narrierte Planungstexte), Tool Surface Reduction (MCP-Katalog kollabiert zu einem virtuellen `search`-Tool, ~33 % Token-Volumen↓), Tool-Result-Trimming (~10 % Kosten↓). Aggregat ~50 % Kosten↓ auf Claude-Code-Sessions; SWE-bench: 6/6 Tasks Brevity (p=0,031), 8/8 TSR (p=0,008) ohne signifikanten Qualitätsverlust. Gotcha: Proxy-Reihenfolge — Edgee muss zwischen Agent und Provider sitzen (Claude Code → Edgee → Provider).[^8^]

**cnighswonger/claude-code-cache-fix — was genau es fixt:** Drei konkrete Cache-Bugs in Claude Code: (1) *Partial Block Scatter* — Attachment-Blöcke (Skills, MCP-Server, deferred Tools) wandern bei `--resume` aus `messages[0]` in spätere Messages und ändern den Cache-Präfix; (2) *Fingerprint-Instabilität* — der `cc_version`-Fingerprint wird aus verschobenen Blöcken neu berechnet, System-Prompt ändert sich, Cache bricht; (3) *nicht-deterministische Tool-Reihenfolge* zwischen Turns. Effekt ohne Fix: Session für ~$0,50/h brennt $5–10/h (bis 20×). Zusätzlich: TTL-Tier-Erkennung mit korrekten `cache_control`-Markern, Thinking-Block-Sanitize (gegen 400er bei thinking-desync, default-on seit v4.0.0), Session-Budget-Circuit-Breaker (opt-in), Microcompact-Sentinel-Normalisierung, lokale Quota-Telemetrie unter `~/.claude/quota-status/`. Komplementäre native Stellschraube: `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` (~1.800 Tokens/Call gespart, verhindert Cache-Bust durch git-status im System-Prompt).[^11^][^13^]

**SigMap** — Deterministische Signatur-Karte statt Volltext-Dump; 33 Sprachen, zero deps, MCP mit ~21 Tools. Reproduzierbarer Eigenbenchmark (21 Repos, 90 Tasks, ohne LLM-API): 97,0 % Token-Reduktion, Hit@5 87,8 % vs. 13,6 % Random, Task-Erfolg 67,8 % vs. 10 %, Prompts/Task 2,84→1,44. Ehrliches Baseline-Kapitel: gegen einen „honest grep-agent" nur 2,0× Lift. Selbstempfehlung der Doku: „SigMap für täglichen Always-on-Kontext, Repomix für tiefe Einmal-Sessions — beides nutzen."[^23^]

**musistudio/claude-code-router** — 36,6k Stars, MIT, nicht mit Anthropic affiliiert. Task-Rollen (default/background/think/longContext/webSearch/image) auf Provider/Modelle mappen; Provider u. a. OpenRouter, DeepSeek, Ollama, Gemini; GitHub-Actions-Setup dokumentiert (`NON_INTERACTIVE_MODE`). Gesponsort von Z.ai (GLM Coding Plan). Einordnung: solide für Solo/kleine Teams, Doku teils dünn, „expect rough edges" bei komplexem Routing.[^9^][^10^]

**Bifrost (maximhq)** — Enterprise-Gateway (Rust, „50× schneller als LiteLLM", <100 µs Overhead), für CC relevant wegen: Code Mode (Agent schreibt Python statt Tool-Defs zu laden: bis 92,8 % Input-Token↓, 92,2 % Kosten↓ bei 508 Tools/16 Servern), integriertes semantisches Caching, Virtual Keys mit Tool-Level-Scoping (weniger Tools im Kontext = weniger Tokens).[^25^]

### Major Players & Sources

- **Microsoft Research**: LLMLingua-Familie + ACON — dominieren die Forschungsseite, aber ohne Claude-Code-Integrationspfad.[^1^][^21^]
- **musistudio/claude-code-router** und **OpenRouter** dominieren die Routing-Praxis; **LiteLLM/BerriAI** (56k Stars) das generelle Gateway-Segment; **Bifrost** der aufstrebende Performance-Herausforderer.
- **Atlassian Labs** (mcp-compressor) und **Cloudflare** (Code Mode-Blog) legitimieren Tool-Schema-Kompression als Mainstream-Technik.[^7^][^4^]
- **toon-format**-Org baut ein Format-Ökosystem (TS-SDK, CLI, toon-python, toon-dotnet); Microsoft-Agent-Framework-Diskussion zeigt institutionelles Interesse.[^5^]
- Community-Kuratierung: hesreallyhim/awesome-claude-code, glincker/stacklit-Vergleichsthread, zzet.org-Packer-Vergleich.[^15^][^16^][^17^]

### Trends & Signals

1. **Von Prompt-Kompression zu Output-/Tool-Kompression:** Agentic Sessions werden von Tool-Outputs und Tool-Definitionen dominiert, nicht vom User-Prompt — 81+ aktive Tools fressen 143k Tokens (72 %) vor der ersten Nachricht.[^4^]
2. **Konvergenz auf drei Integrationsmuster:** MCP-Server (SigMap, context-mode, toonify), lokaler Proxy via `ANTHROPIC_BASE_URL` (claude-code-router, cache-fix, Edgee), CLI-Packer (repomix, yek). Hook-basierte Kompressoren (squeez) sind neu und CC-nativ.
3. **Code Mode / programmatischer Tool-Zugriff** (Cloudflare, Bifrost, mcp-compressor) löst das Tool-Schema-Token-Problem genereller als Format-Tricks: bis 92–99 % Reduktion der Definitionskosten.[^25^][^7^]
4. **Packer-Markt reift in Richtung Index/Graph:** stacklit (~250 Token Modulkarte), gortex (Abfrage statt Konkatenation), SigMap — die reine „alles-in-eine-Datei"-Ära gilt bei großen Repos als beendet.[^15^][^16^]
5. **Forschungs-Engines stagnieren** (Selective Context, ICAE, Gisting, AutoCompressors, RouteLLM, FrugalGPT: letzte Pushes 2024–Anfang 2025), während produktionsnahe Rust-Tools wöchentlich pushen.
6. **Cache-Hygiene wird als eigenes Thema professionalisiert:** cache-fix dokumentiert CC-interne Cache-Bugs mit Issue-Referenzen auf anthropics/claude-code (#63147, #66761, #68285); Anthropic schließt Bootstrap-Report als „Informative".[^11^]

### Controversies & Conflicting Claims

- **98 %- und 90 %-Behauptungen** (context-mode, entroly) sind Hersteller-Messungen auf idealen Payloads (Playwright-Snapshots, Logs); Entrolys „zero-token Dreaming Loop" und „provably token-negative" sind Marketing-Claims ohne unabhängige Replikation.[^4^][^17^]
- **Kompression zerstört Code-Exaktheit:** Mehrere unabhängige Quellen warnen — LLMLingua-Art-Verfahren „murder code accuracy", mangeln exakte JSON-Keys/Identifier/Zahlen; TAAC-Studie zeigt aber: Code toleriert r≥0,6 besser als Reasoning — widersprüchliche Evidenz je nach Metrik.[^1^][^22^]
- **FrugalGPTs „98 % Kostenreduktion"** gilt nur für schmale Klassifikations-Tasks und wird laut LLMRouting-Karte „weithin überzitiert, als wäre sie generell".[^26^]
- **Prompt-Caching-Plugin-Verwirrung:** `flightlesstux/prompt-caching` wird teils als CC-Plugin vermarktet, hilft aber nach eigener FAQ ausdrücklich *nicht* für Claude-Codes eigene Sessions — CC cached bereits automatisch.[^12^]
- **Edgee vs. unabhängige Verifikation:** 50 %-Claim stützt sich auf 6–8 SWE-bench-Tasks — statistisch signifikant, aber kleine Stichprobe; Cache-Hit-Rate-Verbesserung 76,1→85,4 % stammt aus Vendor-Review.[^8^]
- **Routing-Qualitäts-Caveats:** OpenRouter/GLM-Setups versprechen 50–86 % Ersparnis, aber Tool-Calling-Verhalten nicht-Anthropischer Modelle in Claude Code ist die häufigste Fehlerquelle; native Integration ist nur für Anthropic-Modelle garantiert.[^27^]

### Recommended Deep-Dive Areas

1. **mksglu/context-mode + atlassian-labs/mcp-compressor + Bifrost Code Mode** — Tool-Output- und Tool-Schema-Kompression ist die größte, am besten belegte Hebelgruppe für Claude Code; Kombinierbarkeit (Reihenfolge MCP-Proxy ↔ Gateway) prüfen.
2. **cnighswonger/claude-code-cache-fix** — einziger Kandidat, der *bestehende* CC-Sessions billiger macht statt neue Infrastruktur zu verlangen; Extension-Architektur (`proxy/extensions/`) und Telemetrie-Dateien im Detail würdigen.
3. **SigMap vs. repomix `--compress` vs. stacklit** — kontrollierter Vergleich „Karte statt Dump" auf 2–3 realen Repos mit Token-Messung pro Turn über eine lange Session (Packer-Kosten kumulieren, Karten nicht).
4. **Edgee Compressor V2** — Proxy-Positionierung mit claude-code-router/OpenRouter verketten (Claude Code → Edgee → Router → Provider) und Stackbarkeit der drei Schichten auf echten Sessions messen.
5. **TOON-Integration in Claude-Code-Workflows** — toonify-mcp auf großen strukturierten Tool-Outputs (gh, kubectl, Test-Runner-JSON); Grenze: nicht-tabellarische, tief verschachtelte Daten.
6. **CoderDayton/semantic-cache-mcp (Konzept)** — Diff-statt-Volltext-Dateicaching mit Permission-Deny auf native Read/Write-Tools ist ein starker, fast unerforschter Ansatz (2 Stars); frühe Evaluation lohnt.

### Quellen

[^1^]: thread-transfer.com — LLM Context Compression Techniques (2026-06): https://thread-transfer.com/blog/2026-06-17-llm-context-compression-techniques/
[^2^]: tokenmix.ai — LLMLingua 2026: Benchmarks & Savings: https://tokenmix.ai/blog/llmlingua-prompt-compression-2026
[^3^]: npmx — llmlingua-cursor Paketdoku: https://npmx.dev/package/llmlingua-cursor
[^4^]: mksg.lu — „Stop Burning Your Context Window — We Built Context Mode" + GitHub mksglu/context-mode: https://mksg.lu/blog/context-mode ; https://github.com/mksglu/context-mode
[^5^]: GitHub toon-format/toon (API-verifiziert: 25.144 Stars, Push 2026-08-07): https://github.com/toon-format/toon ; Microsoft Agent-Framework-Diskussion: https://github.com/microsoft/agent-framework/discussions/4005
[^6^]: Halodoc Tech Blog — Reducing LLM Token Costs by Switching from JSON to TOON (2026-06-12): https://blogs.halodoc.io/reducing-llm-token-costs-by-5-15-by-switching-from-json-to-toon-format/
[^7^]: LobeHub/GitHub — atlassian-labs/mcp-compressor (106 Stars): https://github.com/atlassian-labs/mcp-compressor
[^8^]: dailyaiworld.com — Edgee Compressor V2 Guide (2026-07-11); cc.bruniaux.com Context Engineering Tools (2026-08-06): https://dailyaiworld.com/blogs/edgee-compressor-v2-claude-code-guide-2026 ; https://cc.bruniaux.com/guide/context-engineering-tools/ ; https://github.com/edgee-ai/edgee
[^9^]: npm @musistudio/claude-code-router + GitHub (36.609 Stars, Push 2026-08-11): https://www.npmjs.com/package/@musistudio/claude-code-router
[^10^]: getaiperks.com — Claude Code Router Guide 2026; claudelog.com CCR-Profil: https://www.getaiperks.com/en/ai/claude-code-router-guide ; https://www.claudelog.com/claude-code-mcps/claude-code-router/
[^11^]: GitHub cnighswonger/claude-code-cache-fix — README (414 Stars, Push 2026-08-12): https://github.com/cnighswonger/claude-code-cache-fix
[^12^]: GitHub flightlesstux/prompt-caching — README/FAQ: https://github.com/flightlesstux/prompt-caching
[^13^]: claudecodecamp.com — How Prompt Caching Actually Works in Claude Code (2026-02-25): https://www.claudecodecamp.com/p/how-prompt-caching-actually-works-in-claude-code
[^14^]: GitHub yamadashy/repomix (27.797 Stars, Push 2026-08-11): https://github.com/yamadashy/repomix
[^15^]: zzet.org — Repomix Alternative for AI Agents: Packer-Vergleich (2026-06-06): https://zzet.org/gortex/repomix-gitingest-alternative-graph/
[^16^]: GitHub glincker/stacklit Discussion #13 — Vergleich AI-Codebase-Context-Tools (2026-04-13): https://github.com/glincker/stacklit/discussions/13
[^17^]: awesome-claude-code Issue #1582 — Entroly Submission: https://github.com/hesreallyhim/awesome-claude-code/issues/1582
[^18^]: arXiv 2404.01077v2 — Efficient Prompting Methods Survey, Tabelle 5 (Open Resources Prompt Compression)
[^19^]: arXiv 2312.03863v2 — Efficient LLMs Survey (Gisting 26×, ICAE 4×)
[^20^]: GitHub liyucheng09/Selective_Context (424 Stars, Push 2024-02): https://github.com/liyucheng09/Selective_Context
[^21^]: arXiv 2608.06503 — Toward Reliable Context Compression for Long-Horizon Agents (ACON-Baselines); GitHub microsoft/acon (100 Stars): https://github.com/microsoft/acon
[^22^]: arXiv 2602.15843 — The Perplexity Paradox / TAAC; GitHub micoverde/taac-llm-compression: https://github.com/micoverde/taac-llm-compression
[^23^]: GitHub manojmallick/sigmap (614 Stars) + Benchmark-Doku: https://github.com/manojmallick/sigmap ; https://manojmallick.github.io/sigmap/
[^24^]: cc.bruniaux.com — TOON/python-toon Fallstudien (Scalevise): https://cc.bruniaux.com/guide/context-engineering-tools/
[^25^]: getmaxim.ai — Top 5 MCP Gateways for Claude Code 2026 (Bifrost Code-Mode-Messungen); GitHub maximhq/bifrost (7.266 Stars): https://www.getmaxim.ai/articles/top-5-mcp-gateways-for-claude-code-in-2026/
[^26^]: GitHub pastorsj/LLMRouting — FrugalGPT-Kaskaden-Karte; stanford-futuredata/FrugalGPT (280 Stars): https://github.com/pastorsj/LLMRouting/blob/main/cards/inter-model/frugalgpt-cascade.md
[^27^]: openrouter.ai — Claude Code with OpenRouter (2026-06-16); mindstudio.ai GLM-5.2-Setup: https://openrouter.ai/blog/tutorials/claude-code-openrouter/ ; https://www.mindstudio.ai/blog/openrouter-glm-5-2-claude-code-setup
[^28^]: nomadx.ae — Semantic Caching: GPTCache vs Portkey vs Redis (2026-08-06): https://nomadx.ae/blog/semantic-caching-llm-chatbots-gptcache-portkey-redis-2026/
[^29^]: ACL Anthology 2023.nlposs-1.24 — GPTCache Paper; GitHub zilliztech/GPTCache (8.130 Stars): https://github.com/zilliztech/GPTCache
[^30^]: blog.brightcoding.dev — yek (230× schneller als Repomix); GitHub mohsen1/yek (2.471 Stars, ex bodo-run/yek): https://github.com/mohsen1/yek
[^31^]: LobeHub — CoderDayton/semantic-cache-mcp: https://lobehub.com/mcp/coderdayton-semantic-cache-mcp
[^32^]: GitHub Topic token-compression (Rust): squeez, contextzip, tokenslim, Janus, h5i-ctx2img, glyphdown: https://github.com/topics/token-compression?l=rust
