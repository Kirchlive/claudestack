# Quellenverzeichnis

[^1^]: capitalandcompute.net — „Do Claude Code Token-Saving Tools Actually Cut Your Bill?" (codepointer-Replay: 614M Tokens, rtk+headroom+caveman kombiniert 3,7 % der Rechnung) — https://capitalandcompute.net/blog/claude-code-token-saving-tools-rtk-headroom-caveman/, 2026-08-06
[^2^]: JetBrains AI Blog — „Does 'rtk' skill really cut agent tokens by 60–90%? We tested it" (+7,6 % bei low effort, p=0,004; ±0 bei high), 2026-07-20 — https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
[^3^]: GitHub REST API — Repository-Metadaten (Sternezahlen rtk 75.916, caveman 97.774, headroom 66.087, ponytail 101.498), abgerufen 2026-08-13 — https://api.github.com/repos/
[^4^]: andrewpatterson.dev — „Token Compression for Claude Code with RTK + Headroom" (1.516.714.601 Tokens, $3.808, 96 % Cache-Hit), 2026-04-18 — https://andrewpatterson.dev/posts/token-savings-rtk-headroom/
[^5^]: ArceApps Blog — „RTK vs Caveman: real token savings in AI agents" (614M-Token-Replay: headroom 2,8 %, rtk 0,5 %, caveman 0,4 %), 2026-07-15 — https://arceapps.com/blog/rtk-vs-caveman-token-savings/
[^6^]: rtk-ai/rtk README — https://github.com/rtk-ai/rtk, 2026-08-13 (75.918 ★, 1.955 offene Issues; Scope-Note Read/Grep/Glob-Bypass; „up to 90 % der Bash-Ausgabe").
[^7^]: JetBrains AI Blog — „Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test" (2026-07-16), 8,5 % gemessen, +11,6 %-Ausreißer. https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/
[^8^]: headroom Issue #2438 — „Proxy defeats Anthropic prompt caching (2–7× cost increase); Telemetrie zeigte cache_hit: true bei bezahlten Cache-Writes" — https://github.com/headroomlabs-ai/headroom/issues/2438
[^9^]: Growth4U-systems/claude-token-hygiene ; ncoevoet/claude-markdown-health-check — https://github.com/Growth4U-systems/claude-token-hygiene ; https://github.com/ncoevoet/claude-markdown-health-check, abgerufen 2026-08-13.
[^10^]: HN-Daily via duanyytop/agents-radar Issue #2106 — „Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k", 2026-07-13 — https://github.com/duanyytop/agents-radar/issues/2106
[^11^]: sup3x/claude-code-eco — docs/token-optimization-guide.md (81 Tools ≈ 143k Tokens ≈ 72 % des 200k-Fensters; Cache-Preise 0,1×/1,25×/2×), 2026-07-02 — https://github.com/sup3x/claude-code-eco/blob/main/docs/token-optimization-guide.md
[^12^]: lobehub — @cocaxcode/token-optimizer-mcp Referenztabelle (~1k Tokens/Tool-Schema; 7 Server ≈ 67k; Tool Search −47 %) — https://lobehub.com/mcp/cocaxcode-token-optimizer-mcp
[^13^]: juejin.cn — „Token压缩工具实测：614M数据告诉你90%节省承诺有几分真" (rtk erreicht ~22 %; Read/Grep/Glob ~78 %), 2026-06-22 — https://juejin.cn/post/7653703276806012947
[^14^]: NodeNestor/claude-rolling-context — README („short sessions are a wash"; Prefix-Cap, lineare statt quadratische Kosten) — https://github.com/NodeNestor/claude-rolling-context, 2026-08-13
[^15^]: Atlassian Engineering Blog „MCP Compression: Preventing tool bloat in AI agents" — https://www.atlassian.com/blog/developer/mcp-compression-preventing-tool-bloat-in-ai-agents/, 2026-08-13 (GitHub-MCP 94 Tools/17,6k Tokens; Tier-Tabelle 17.600→3.900/3.300/2.200/500; Code-Mode-Einordnung).
[^16^]: buildthisnow.com — „Claude Code Prompt Caching" (Rechenbeispiel $6,30 vs. $1,13 ≈ 82 %; TTLs), 2026-06-15 — https://www.buildthisnow.com/blog/guide/development/claude-code-prompt-caching
[^17^]: 0xhimanshu/governor — GitHub-README (2026-05-01), V2-Sonnet-Benchmark (Caveman 69,1 %/VCLR 0,14/12,5 % vs. Governor 45,5 %/0,00/0 %), Multi-Turn-Pilot (−8,0 % Output, −4,6 % Kosten), >40 %-Duplikat-Filtermechanik. https://github.com/0xhimanshu/governor
[^18^]: JetBrains AI Blog — „Ponytail Skill for Claude Code: Does It Really Cut Tokens" (2026-07-28), −10,3 % Kosten (p=0,004), −15 % Code, −11 % Zeit, keine Qualitätsdifferenz. https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/
[^19^]: squeezr docs/PROMPT_CACHE.md — Incident 2026-06-04 und die drei Cache-Brecher-Muster (nicht-deterministische Kompression, variable Parameter, gleitende Fenster) — https://github.com/sergioramosv/squeezr/blob/master/docs/PROMPT_CACHE.md
[^20^]: GitHub REST API, api.github.com/repos/{owner}/{repo} — Stars/pushed_at aller Matrix-Repos, abgerufen 2026-08-13 (konsolidiert in cc-token_wide02/wide05).
[^21^]: GitHub Search API „claude code token compress" u. a. Queries — https://github.com/search, 2026-08-13.
[^22^]: GitHub Topic „token-saver" — https://github.com/topics/token-saver, 2026-08-13.
[^23^]: ZongqianLi/500xCompressor (ACL'25, KV-Spezial-Token, nicht deploybar) — https://github.com/ZongqianLi/500xCompressor, 2026-08-13.
[^24^]: mpecan/tokf README — https://github.com/mpecan/tokf, 2026-08-13 (`tokf verify` Double-Run-Byte-Stabilität, `bytes/3.5`-Kalibrierung, `tokf raw <id>`).
[^25^]: 3rg0n/thlibo README — https://github.com/3rg0n/thlibo, 2026-08-13 (PreToolUse+`updatedInput`-Pattern, inferd/Gemma-4-Sidecar, THREAT_MODEL.md, dokumentiertes Auto-Allow).
[^26^]: sergioramosv/squeezr (cache-sicherer Kompressions-Proxy) — https://github.com/sergioramosv/squeezr, 2026-08-13.
[^27^]: Paritok-official/paritok-4b-v1 README — https://github.com/Paritok-official/paritok-4b-v1, 2026-08-13 (29k→8k Toolfilter, 25,7 % CR, SWE-bench-Lite 86,5 % Retention, Session-Kompoundierung 25→85 %, LLMLingua-2-Vergleich).
[^28^]: anthropics/claude-plugins-official und -community (token-saver v2) — https://github.com/anthropics/claude-plugins-official ; https://github.com/ppgranger/token-saver, 2026-08-13.
[^29^]: aerovato/magic-compact — README (Per-Turn-Summaries, read_omitted_content, kein Cache-Churn) — https://github.com/aerovato/magic-compact, 2026-08-13
[^30^]: alibaizhanov/densely (sha256-Rekonstruktion) — https://github.com/alibaizhanov/densely, 2026-08-13.
[^31^]: MindStudio: Anthropic Prompt Caching & Subscription Limits — https://www.mindstudio.ai/blog/anthropic-prompt-caching-claude-subscription-limits, 2026.
[^32^]: GitHub-Repos: iceHub82/beeline; johnsnow1011/taxman; vliggio/claude-faa-speak (~53 % gemessen, Apple-Intelligence-Re-Expansion). https://github.com/iceHub82/beeline ; https://github.com/johnsnow1011/taxman ; https://github.com/vliggio/claude-faa-speak
[^33^]: carlosduplar/caveman-output-style-claude-code — native Output-Styles, ~40 % weniger Output-Tokens (behauptet). https://github.com/carlosduplar/caveman-output-style-claude-code
[^34^]: ccusage/ccusage — README (Daily/Weekly/Monthly-Reports, 5h-Blocks, JSON-Export) — https://github.com/ccusage/ccusage, 2026-08-13
[^35^]: getagentseal/codeburn — README (optimize/--apply/act report/guard; realized-vs-estimated-Loop; Hooks fail-open) — https://github.com/getagentseal/codeburn, 2026-08-13
[^36^]: Maciek-roboblog/Claude-Code-Usage-Monitor — README (5h-Fenster-Prognose, Provenance-Labels official/local_estimate) — https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor, 2026-08-13
[^37^]: steipete/CodexBar (69 Provider, Menüleiste) — https://github.com/steipete/CodexBar, abgerufen 2026-08-13.
[^38^]: mag123c/toktrack — README (`cleanupPeriodDays`-Default 30 löscht die Messbasis) — https://github.com/mag123c/toktrack, 2026-08-13
[^39^]: egorfedorov/claude-context-optimizer (Tool-Pricing aus eigener Messung) — https://github.com/egorfedorov/claude-context-optimizer, abgerufen 2026-08-13.
[^40^]: RonnieTheTester/headroom-meter (Field-Reading 334.462/14,18M Tokens, Cache-Hit 95,2 %) — https://github.com/RonnieTheTester/headroom-meter, abgerufen 2026-08-13.
[^41^]: cnighswonger/claude-code-cache-fix — README v4.0.0 (3 Resume-Bugs, 95,5 %/82,3 % A/B, 94,66 %/92,44 % Dogfood, $0,50/h→$5–10/h, Forward-/Reverse-Modus, CC≥2.1.196-Einschränkung, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` ~1.800 Tokens, Env-Empfehlungen) — https://github.com/cnighswonger/claude-code-cache-fix, 2026-08
[^42^]: CodeBurn-Issues #987/#988 (Doppelzählung, History-Löschung) — https://github.com/getagentseal/codeburn/issues, abgerufen 2026-08-13.
[^43^]: Claude Code OTEL-Monitoring mit OpenTelemetry & Elastic — https://www.elastic.co/security-labs, 2026-04-25.
[^44^]: bloom.security — „Welcome to Otel Claudeifornia" (Otel Smuggling: Projekt-Settings aktivieren Telemetry auf Angreifer-Endpoint, otelHeadersHelper-RCE), 2026-07-29 — https://bloom.security/blog/welcome-to-otel-claudeifornia
[^45^]: General Analysis: Claude Code — Control Observability (sichere OTEL-Defaults) — https://generalanalysis.com/guides/claude-code-control-observability-opentelemetry, 2026-05-22.
[^46^]: alexdunlop.com — „CLAUDE.md Best Practices: What the Evidence Supports (2026)" (2026-08-12), 200-Zeilen-Mythos, 25–500-Zeilen-Studie, Root-<60-Zeilen-Praxis. https://www.alexdunlop.com/writing/claude-md-best-practices
[^47^]: abhishekray07/claude-md-templates — principles.md, Rule-File-Re-Injektion 93K Tokens/46 % Fenster (Issue #32057), 3–5 Rule-Files à <30 Zeilen. https://github.com/abhishekray07/claude-md-templates/blob/main/principles.md
[^48^]: Anthropic Docs — „Manage costs effectively" (abgerufen 2026-08-13): `/clear` zwischen Tasks, `/compact`-Custom-Instructions, CLAUDE.md-Summary-Instructions, Auto-Compact >95 %. https://docs.anthropic.com/s/claude-code-cost
[^49^]: nathanonn.com — „Never Let Claude Code Auto-Compact Again" (2026-05-01), HANDOFF.md-Pattern, compact/clear/rewind-Abgrenzung. https://www.nathanonn.com/claude-code-never-auto-compact/
[^50^]: hidekazu-konishi.com — „Claude Code Compaction and Long-Session Operations Guide" (2026-06-14), `/compact [instructions]`, PreCompact-Hook, Auto-Compact-Timing-Kritik. https://hidekazu-konishi.com/entry/claude_code_compaction_and_long_session_guide.html
[^51^]: MemPalace/mempalace Issue #856 — „preCompact hook cancels compaction instead of deferring" (block = Abbruch, kein Retry), 2026-04-14 — https://github.com/MemPalace/mempalace/issues/856
[^52^]: composio.dev — „9 Ways to Cut Token Consumption in Claude Code" (2026-05-29), MCP-Steuer (~1k Tokens/Schema, 7 Server ≈ 67k, Tool Search −47 %, `MAX_MCP_OUTPUT_TOKENS`), Subagent-Modell-Pinning, hart begrenzte Subagent-Prompts. https://composio.dev/content/ways-to-cut-token-consumption-in-claude-code
[^53^]: andrewbaker.ninja — „How to run Claude Code on OpenRouter and DeepSeek: the ANTHROPIC_BASE_URL guide" (2026-08-10), `CLAUDE_CODE_SUBAGENT_MODEL` als Minimalvariante des Rollen-Splittings. https://andrewbaker.ninja/2026/08/10/how-to-run-claude-code-on-openrouter-and-deepseek-the-anthropic_base_url-guide/
[^54^]: agiflow.io — „Claude Code on Opus 5" (2026-07-25), Effort-Semantik, low/medium-Empfehlung, Cache-Invalidierung bei Wechsel. https://agiflow.io/blog/claude-code-opus-5-subscription-guide
[^55^]: nimbalyst.com — „Claude Code Subagents: A Practical 2026 Guide" (2026-05-05), ~7× Token-Volumen, Kontext-Isolation. https://nimbalyst.com/blog/claude-code-subagents-guide/
[^56^]: buildthisnow.com — „Claude Code Pricing" (2026-05-03), opusplan-Empfehlung. https://www.buildthisnow.com/blog/guide/development/claude-code-pricing
[^57^]: DietrichGebert/ponytail — README/Benchmarks, −54 % Code/−22 % Tokens Eigenmessung, Selbstkorrektur der 80–94-%-Zahl (Issue #126). https://github.com/DietrichGebert/ponytail
[^58^]: multica-ai/andrej-karpathy-skills — README; Agentiquette-Score 61/100; Nic's notes, „Karpathy Claude Code Skills" (2026-08-10). https://github.com/multica-ai/andrej-karpathy-skills ; https://notes.nicolasdeville.com/github/karpathy-skills ; https://www.agentiquette.com/index/repos/karpathy-skills
[^59^]: JuliusBrussee/caveman — README + Release v1.10, 65-%-Claim, 1–1,5k Input-Tokens/Turn Selbstkosten, JetBrains-8,5-%-Aufnahme. https://github.com/JuliusBrussee/caveman
[^60^]: ArceApps Blog — „Caveman: The Skill That Teaches AI Agents to Shut Up" (2026-06-20), Caveman-2-Input-Kompression (~46 % auf CLAUDE.md-Inputs). https://arceapps.com/blog/caveman-skill-token-compression/
[^61^]: valorisa/Claude-Skills — README (2026-08-08), rescue-tokens 9 Patterns (950→97 Wörter), spec-driven Token-Budgets, token-optimization $750→$100 (selbstberichtet). https://github.com/valorisa/Claude-Skills
[^62^]: rtk Issue #582 (closed) — https://github.com/rtk-ai/rtk/issues/582, 2026-08-13 (Repro-Paket: +18 % Kosten, +50 % Output-Tokens).
[^63^]: kurovu146/kuro-lean README — https://github.com/kurovu146/kuro-lean, 2026-08-13 (Guard-Deny-Tabellen, `kt bench` +14 % → +6 %, 12.220-Call-Messung ~0–1 %).
[^64^]: Externe Kontext-Befunde via cc-token_dim01.md (Swarm-Briefing, nicht neu verifiziert), 2026-08-13 (JetBrains-Benchmark Juli 2026: rtk +7,6 % low effort, Savings-Cap ≈3 %, ~20/78-%-Split; codepointer-Replay: rtk = 0,5 % der Rechnung) — mit Caveat verwendet.
[^65^]: rtk Issue #1155 (open) — https://github.com/rtk-ai/rtk/issues/1155, 2026-08-13 (Hook-Auto-Allow bypassed Permission-Modell).
[^66^]: rtk Issue #3152 (open) — https://github.com/rtk-ai/rtk/issues/3152, 2026-08-13 (User-allow-Patterns greifen nicht auf Rewrites).
[^67^]: rtk Issue #2345 (open) — https://github.com/rtk-ai/rtk/issues/2345, 2026-08-13 (`rtk proxy` umgeht .env-Deny; CVE-2026-33068).
[^68^]: rtk-ai/rtk — Issues #1155/#3152/#2345 (Permission-Bypass, Allow-Pattern-Bruch, CVE-2026-33068) — https://github.com/rtk-ai/rtk/issues, 2026-08-13
[^69^]: claudioemmanuel/squeez README — https://github.com/claudioemmanuel/squeez, 2026-08-13 (Net-Win-Gate 24 tk, PostToolUse `updatedToolOutput` ab CC v2.1.119, `bash_risk_patterns`, Benchmark 91,4 % / cl100k-Verifikation 83,5 %).
[^70^]: ojuschugh1/sqz README & Issues — https://github.com/ojuschugh1/sqz, 2026-08-13 (24,7 % Ø über 3.003 Kompressionen; Issues #32/#30/#34; letzter Push 2026-06-21; ELv2).
[^71^]: ryanportfolio/STK README — https://github.com/ryanportfolio/STK, 2026-08-13 (250-Session-Mining: 85 % oversized Kontext aus Read-Tool; deny-with-outline).
[^72^]: ppgranger/token-saver README — https://github.com/ppgranger/token-saver, 2026-08-13 (36 Prozessoren, Critical-Line-Recovery, Hook-Härtung, Dual-Install-Warnung, offizieller Community-Marketplace).
[^73^]: mksglu/context-mode README — https://github.com/mksglu/context-mode, 2026-08-13 (Sandbox-Execution, FTS5/BM25-Index überlebt /compact, 21-Szenarien-Benchmarks 98 %, 17 Plattformen, 19.825 ★).
[^74^]: mksglu/context-mode offene Issues — https://github.com/mksglu/context-mode/issues, 2026-08-13 (#911, #1022, #947, #1048, #901, #852-Historie).
[^75^]: Cross-Verification-Nachtrag, CZ-1/CZ-4 — /mnt/agents/output/research/cc-token_cross_verification_nachtrag.md, 2026-08-13 (rtk → nicht empfohlen; maximal EIN BASE_URL-Proxy; Negativ-ROI +7,6/+18/+14 %; Erwartungswert 0–3 % / 10–15 %).
[^76^]: anthropics/claude-code Issue #12836 — https://github.com/anthropics/claude-code/issues/12836, 2026-08-13 (Tool Search & Programmatic Tool Calling Betas: bis 85 % Token-Reduktion, Opus-4.5-Accuracy 79,5 %→88,1 %).
[^77^]: atlassian-labs/mcp-compressor README — https://github.com/atlassian-labs/mcp-compressor, 2026-08-13 (Wrapper-Tools, Kompressionslevel, CLI/SDK).
[^78^]: maximhq/bifrost README — https://github.com/maximhq/bifrost, 2026-08-13 (7.267 ★, Enterprise-Gateway).
[^79^]: Bifrost Docs „Code Mode" — https://docs.getbifrost.ai/mcp/code-mode, 2026-08-13 (4 Meta-Tools, Starlark-Sandbox, 96/251/508 Tools: −58,2/−84,5/−92,8 % Input, Pass 100 %).
[^80^]: Edgee Token Compression V2 & FAQ — https://www.edgee.ai/token-compression, https://www.edgee.ai/docs/introduction/faq, 2026-08-13 (3 Techniken, Kunden-Aggregat ~20 % Rechnungsreduktion, compression-Block).
[^81^]: dailyaiworld.com „Edgee Compressor V2 Complete Guide" — https://dailyaiworld.com/blogs/edgee-compressor-v2-claude-code-guide-2026, 2026-08-13 (SWE-bench-Lite Brevity 6/6 p=0,031; TSR 8/8 p=0,008 — kleine Stichprobe, mit Caveat).
[^82^]: Paritok-official/paritok-4b-v1 offene Issues — https://github.com/Paritok-official/paritok-4b-v1/issues, 2026-08-13 (#40, #41, #31/#38, #30).
[^83^]: KRLabsOrg/squeez README + arXiv:2604.04979 „Squeez: Task-Conditioned Tool-Output Pruning for Coding Agents" — https://github.com/KRLabsOrg/squeez, https://arxiv.org/abs/2604.04979, 2026-08-13 (F1 0,80 @ 92 %, 618 Beispiele/27 Tool-Typen, vLLM-Betrieb).
[^84^]: scaledown-team/DietCode — README (ScaleDown-Kompression: sd_compress/summarize-Tools + Hooks + Proxy) — https://github.com/scaledown-team/DietCode, 2026-08-05
[^85^]: jia-gao/leanctx & LLMLingua-2-Ableger, via cc-token_dim03.md Sekundär-Recherche — https://github.com/jia-gao/leanctx, 2026-08-13 (bricht strukturierte Daten/Code, Prompt-Cache-Bruch).
[^86^]: ooples/token-optimizer-mcp README — https://github.com/ooples/token-optimizer-mcp, 2026-08-13 (verified-vs-quarantined Messung, 43.491 netto Tokens, Overlap-Warnung context-mode).
[^87^]: Mibayy/token-savior — README (Profil-Tabelle: tiny 6 Tools ≈ 0,6 KT vs. full 68 ≈ 6 KT; zurückgezogene Re-Messung mit Deferred-Tool-Loading-Lektion) — https://github.com/Mibayy/token-savior, 2026-08
[^88^]: headroom README — https://github.com/headroomlabs-ai/headroom, abgerufen 2026-08-13
[^89^]: fkiene/llmtrim — README (cache_control-Invariante, −31 % Input/−66 % Kosten Eigenmessung) — https://github.com/fkiene/llmtrim, 2026-08-13
[^90^]: agiwhitelist/tokdiet — README + Benchmark (−71 % Input, 66 Tasks gepaart, Qualitätsparität) — https://github.com/agiwhitelist/tokdiet, 2026-08-13
[^91^]: c0ntextKeeper / unforget / cc-parachute READMEs (GitHub-API + Sichtung) — https://github.com/Capnjbrown/c0ntextKeeper, https://github.com/rupaut98/unforget, https://github.com/smdysk/cc-parachute, abgerufen 2026-08-13
[^92^]: teamchong/pxpipe — README + Issues #210/#216 (0/15 Hex-Recall Opus 5, stille Konfabulationen) — https://github.com/teamchong/pxpipe, 2026-08-13
[^93^]: pxpipe offene Issues (#210, #216) — https://github.com/teamchong/pxpipe/issues, abgerufen 2026-08-13
[^94^]: OmniGlyph README — https://github.com/diegosouzapw/OmniGlyph, abgerufen 2026-08-13
[^95^]: toon-format/toon README (Spec v4.1, Benchmarks) — https://github.com/toon-format/toon, abgerufen 2026-08-13
[^96^]: InfoQ „New Token-Oriented Object Notation (TOON)…" (−55 % vs. pretty, −25 % vs. kompakt) & The Orange Force TOON-Test (15–26 %) — https://www.infoq.com/news/2025/11/toon-reduce-llm-cost-tokens/, https://theorangeforce.com/the-orange-force-news/toon-token-efficiency-useful-cases/, 2025-11-23
[^97^]: TRON-Studie (arXiv:2605.29676), Format-Substitution in agentischen Tool-Calling-Pipelines — https://arxiv.org/pdf/2605.29676, abgerufen 2026-08-13
[^98^]: OpenReview-Übersicht zu token-optimierten Formaten (Matveev: Lehr-Overhead; Alshaer/S-TOON: Delimiter-Injection; McMillan: Format-Effekt n. s.) — https://openreview.net/pdf/0fb8dc4068f4b0a963baf49b7e0fa1fbe193d31e.pdf, abgerufen 2026-08-13
[^99^]: PCIRCLE-AI/toonify-mcp — README (input-seitige TOON-Trimmung, Passthrough-Garantie) — https://github.com/PCIRCLE-AI/toonify-mcp, 2026-08-13
[^100^]: sriinnu/clipforge-PAKT README (L1–L3, Gegenbeispiele, Comprehension-Eval) — https://github.com/sriinnu/clipforge-PAKT, abgerufen 2026-08-13
[^101^]: manojmallick/sigmap README (Benchmark v8.24, 21 Repos, MCP-Tools) — https://github.com/manojmallick/sigmap, abgerufen 2026-08-13
[^102^]: glincker/stacklit Discussion #13 (Dumper-Taxonomie: 50k–500k Tokens/Dump) — https://github.com/glincker/stacklit/discussions/13, 2026-04-10
[^103^]: yamadashy/repomix README (--compress, --token-budget, Plugins) — https://github.com/yamadashy/repomix, abgerufen 2026-08-13
[^104^]: GitHub Issues: repomix #1503 (gleichnamige Dateien still übersprungen), #1765 (.gitignore-Backslash) — https://github.com/yamadashy/repomix/issues, abgerufen 2026-08-13
[^105^]: Harrison — „I Tested CodeGraph on Hono" (unabhängig, 40 Runs Opus 4.8: Tool-Calls −55 %, Kosten +6,8 %, enge Fragen 20–43 % teurer, breite Frage −29 %) — https://harrisonsec.com/blog/i-tested-codegraph-on-hono-benchmark/, 2026
[^106^]: Tokenade — „CodeGraph Alternatives: 6 Tools Compared" (THOL-Benchmark: codegraph 9/12, keine messbare E2E-Ersparnis; Disclosure: THOL vom Autor gepflegt) — https://tokenade.net/en/articles/codegraph-alternatives, 2026
[^107^]: colbymchenry/codegraph — README (1-Tool-MCP-Surface, +80 % Residual-Context-Caveat, 3-Schichten-Staleness-Signale) — https://github.com/colbymchenry/codegraph, 2026-08
[^108^]: Boris Cherny Primärquellen-Lage: X-Post 2026-02-01 („agentic search generally works better"), zusammengestellt — https://smartscope.blog/en/ai-development/practices/rag-debate-agentic-search-code-exploration/, 2026
[^109^]: oraios/serena — README (LSP-basiert, symbolisches Editing, Basis-Tools in CC default deaktiviert, Agent-as-Judge-Evaluierung statt Token-Claim) — https://github.com/oraios/serena, 2026-08
[^110^]: tirth8205/code-review-graph — README (30 MCP Tools default, `CRG_TOOLS`-Allowlist, detect_changes, GitHub Action, Limitations-Abschnitt) — https://github.com/tirth8205/code-review-graph, 2026-08
[^111^]: ComputingForGeeks — „Reduce Claude Code Tokens: 10 Tested Tools" (unabhängiges Leaderboard: code-review-graph −5 % Gesamttokens) — https://computingforgeeks.com/reduce-claude-code-token-usage-tools/, 2026
[^112^]: Graphify-Labs/graphify — README (Skill-Architektur, Docs/SQL-Extraktion, 71,5×-Claim ohne E2E, ~1× auf kleinem Korpus) — https://github.com/Graphify-Labs/graphify, 2026-08
[^113^]: zilliztech/claude-context — README (4 MCP Tools, Hybrid BM25+dense, Setup: Milvus/Zilliz + Embedding-Key, ~40 % eigene Eval) — https://github.com/zilliztech/claude-context, 2026-08
[^114^]: GitHub Issues DeusData/codebase-memory-mcp (API, 2026-08-13): #1296/#1191/#1213 — stale Graph/Store nach Reindex, silent — https://github.com/DeusData/codebase-memory-mcp/issues/1296, 2026-08-13
[^115^]: jgravelle/jcodemunch-mcp — README + LICENSE (grep-top-3-Baseline 27,9×, Dual-Use-Lizenz $79–2.499 kommerziell) — https://github.com/jgravelle/jcodemunch-mcp, 2026-08
[^116^]: corti.com — claude-mem Architektur & Token-Ökonomie (Injection ~800–3.000 T typisch, Worst Case 50 Obs. × 250 T ≈ 12.500 T; ~$0,15/100 Observationen Kompression; $5–15/Monat) — https://corti.com/claude-mem-persistent-memory-for-ai-coding-assistants/, 2026
[^117^]: GitHub Issues thedotmack/claude-mem (API, 2026-08-13): offen #3480 (Re-Injection bei jedem Read), #3511 (EXCLUDED_PROJECTS), #3274 — https://github.com/thedotmack/claude-mem/issues, 2026-08-13
[^118^]: MemPalace/mempalace — README v3.7.0 (verbatim, 44 MCP-Tools ⇒ 4.370–8.570 T/Session Overhead, LongMemEval R@5 96,6 % raw, $0 API) — https://github.com/MemPalace/mempalace, 2026-08
[^119^]: rohitg00/agentmemory — README (54 MCP-Tools, INJECT_CONTEXT/AUTO_COMPRESS per Default aus, gemessener Workload 35h: DeepSeek $0,46 / Sonnet $5,02, ~1.900 T vs. 22K T CLAUDE.md-Dump) — https://github.com/rohitg00/agentmemory, 2026-08
[^120^]: severity1/claude-code-auto-memory — README (PostToolUse 0-Token-Tracking, isolierter Subagent, AUTO-MANAGED-Marker, 0 Main-Session-Kosten) — https://github.com/severity1/claude-code-auto-memory, 2026-08
[^121^]: zilliztech/memsearch — README (Markdown Source of Truth, Milvus Shadow-Index, ONNX bge-m3 lokal $0, Stop-Hook-Summary via Haiku) — https://github.com/zilliztech/memsearch, 2026-08
[^122^]: GitHub Issues MemPalace/mempalace (API, 2026-08-13): offen #1601 „PreCompact hook always blocks", #906 „preCompact prevents compacting", #961 (Staleness) — https://github.com/MemPalace/mempalace/issues, 2026-08-13
[^123^]: OthmanAdi/planning-with-files — README v3.x (3-File-Pattern, Recovery-Benchmark 5,0 vs. 13,3 Turns, PreCompact-Flush, PWF_INJECT=smart) — https://github.com/OthmanAdi/planning-with-files, 2026-08
[^124^]: musistudio/claude-code-router — README + Issue-Suche (Rollen default/think/background; 193 offene Tool-Issues; #1378 DeepSeek reasoning_content-400) — https://github.com/musistudio/claude-code-router, 2026-08
[^125^]: claude-code-router Issue-Suche „tool" (193 offene Issues mit Tool-Bezug, API 2026-08-13) — https://github.com/musistudio/claude-code-router/issues, 2026-08-13
[^126^]: OpenRouter Docs + Blog — Claude Code Integration (3 Env-Vars, AUTH_TOKEN explizit leer, Modell-Slot-Env-Vars inkl. `CLAUDE_CODE_SUBAGENT_MODEL`, Anthropic Skin, Empfehlung Anthropic-1P) — https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration, 2026
[^127^]: Piebald-AI/tweakcc — README v4.0.0 (cli.js-/Bun-Patching, Toolsets „several thousand tokens", `adhoc-patch`/Remote-Config-Fläche, verifiziert bis CC 2.1.162) — https://github.com/Piebald-AI/tweakcc, 2026-08
[^128^]: tweakcc offene Issues (GitHub API, 2026-08-13): #872 (CC unbenutzbar nach Prompt-Edit), #861 (Patches schlagen auf 2.1.202 fehl), #942 (Patterns auf 2.1.227 nicht gefunden) — https://github.com/Piebald-AI/tweakcc/issues, 2026-08-13
[^129^]: CoderDayton/semantic-cache-mcp — README (smart_read/batch_read; mtime/BLAKE3/Diff-Mechanik; 98,9 % Bench auf 41 Dateien; `permissions.deny: Read,Edit,Write`) — https://github.com/CoderDayton/semantic-cache-mcp, 2026-08
[^130^]: claude-code-router Issue #1378 — DeepSeek V4 Thinking + Tool-Calls: `reasoning_content`-400; Transformer-Hooks feuern nicht auf /v1/messages-Pfad — https://github.com/musistudio/claude-code-router/issues/1378, 2026
[^131^]: LiteLLM Issue #26005 — complexity_router: Thinking-Signature-400 nach Mid-Session-Wechsel GLM→Anthropic — https://github.com/BerriAI/litellm/issues/26005, 2026
[^132^]: Piebald-AI/claude-code-system-prompts — Referenz aller Systemprompts + Tool-Beschreibungen mit Token-Counts (515 Prompts) — https://github.com/Piebald-AI/claude-code-system-prompts, 2026-08-12
[^133^]: LiteLLM Caching-Doku + GPTCache-Metadaten (redis-/valkey-semantic Cache für stateless Q&A; GPTCache stale seit 2025-07) — https://docs.litellm.ai/docs/caching/all_caches, 2026
[^134^]: diegosouzapw/OmniRoute — README (Gateway-Kompression antagonistisch zum Prefix-Cache; Einordnung via cc-token_dim05) — https://github.com/diegosouzapw/OmniRoute, 2026
[^135^]: microsoft/LLMLingua — Forschungs-Kompression bricht strukturierte Daten/Code (<50 % Retrieval) und Prompt-Cache — https://github.com/microsoft/LLMLingua, 2026-04-08
[^136^]: Madhan230205/token-reducer — README (90–98 % ohne Beleg) — https://github.com/Madhan230205/token-reducer, 2026-05-02
[^137^]: flightlesstux/prompt-caching — README (explizit nicht für Claude-Code-Sessions; CC cached selbst) — https://github.com/flightlesstux/prompt-caching, 2026-03
[^138^]: rtk-ai/rtk Issue #260 — „Security: PreToolUse hook bypasses Claude Code deny rules via permissionDecision: allow", 2026-02-23 — https://github.com/rtk-ai/rtk/issues/260
[^139^]: YoraiLevi/claude-command-policy — docs/PRIOR-ART.md (Compound-Command-Befund, Popularität-vs.-Qualität), 2026-06-26 — https://github.com/YoraiLevi/claude-command-policy/blob/main/docs/PRIOR-ART.md
[^140^]: banyudu/claude-warden Issue #123 — „for/while/if-Konstrukte liefern allow und umgehen alle Regeln inkl. alwaysDeny" — https://github.com/banyudu/claude-warden/issues/123
[^141^]: libraries.io/pypi/overloop — overloop 0.3.0 (Fingerprint-/Loop-/Dedup-/Truncate-Design, Spill-File, `~/.overloop`-State), 2026-07-04 — https://libraries.io/pypi/overloop
[^142^]: morphllm.com — Claude-Code-Hooks Event-I/O-Referenz (Exit 0/2, hookSpecificOutput, updatedToolOutput, „hook decision never bypasses deny/ask rule"), 2026-06-18 — https://morphllm.com/claude-code-hooks
[^143^]: totalum.app — „Claude Code Hooks in 2026: A Production Playbook" (stderr muss Alternative nennen, sonst Retry-Schleife), 2026-06-26 — https://www.totalum.app/blog/claude-code-hooks-totalum
[^144^]: karanb192/claude-code-hooks — README (Event-Logger-Muster, Safety-Levels, async-Recorder) — https://github.com/karanb192/claude-code-hooks
[^145^]: thomas-wiegold.com — „Claude Code Hooks" (Hot-Path-Latenz, async-Audit, Hook-Gotchas), 2026-05-10 — https://thomas-wiegold.com/blog/claude-code-hooks
[^146^]: g4itpl/clear-nudge — README (Einmal-pro-Schwelle-Semantik; 49-%-Wochenkontingent-Fall; Neustart ≈ 41k Tokens ≈ 5 Tool-Calls) — https://github.com/g4itpl/clear-nudge
[^147^]: emanueleielo/compact-middleware — README (Trigger 0,85 Fensterfüllung, Microcompact Keep-last-5, Restoration-Muster), 2026-04-02 — https://github.com/emanueleielo/compact-middleware
[^148^]: JanBancerewicz/context-cost-guard — README (Cold-Cache-Trigger ≥60k UND ≥55 min idle → ~20× Kosten; fail-open, Snooze) — https://github.com/JanBancerewicz/context-cost-guard
[^149^]: stormzhang/token-tracker — README (Statusline mit Ctx-%-Balken) — https://github.com/stormzhang/token-tracker, 2026-08-13
[^150^]: disler/claude-code-hooks-mastery — README (`pre_compact.py` Transkript-Snapshot, Hook-Best-Practices) — https://github.com/disler/claude-code-hooks-mastery
[^151^]: MemPalace/mempalace Issue #906 — „preCompact hook prevents compacting when context limit is reached" (unrettbar verklemmte Session), 2026-04-15 — https://github.com/MemPalace/mempalace/issues/906
[^152^]: anthropics/claude-code Issue #32057 — „Rules re-injected as system-reminders on every tool call" (93k Tokens / 46 % des Fensters) — https://github.com/anthropics/claude-code/issues/32057
[^153^]: TRON-Studie — arXiv 2605.29676 (Parse-Kaskaden in Multi-Turn-Agent-Loops; Format-Kompression „not safe as default") — https://arxiv.org/abs/2605.29676, 2026
