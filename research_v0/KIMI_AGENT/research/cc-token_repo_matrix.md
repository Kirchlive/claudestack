# Master-Repo-Matrix: Token-Minimierung für Claude Code
Stand: 2026-08-13 · Konsolidiert aus cc-token_wide01–06 · Alle Stars/Push-Daten per GitHub-API verifiziert (2026-08-13), so nicht anders markiert.

**Gesamtüberblick:** ~180 unique Repos erfasst, davon ~40 direkt stack-relevant, ~60 indirekt/Nische, Rest Workflow/UI/irrelevant/obsolet.
**Evidenz-Legende:** ★★★ = unabhängig verifiziert (Benchmark/Peer-Review/mehrere Sekundärquellen) · ★★ = dokumentierte, reproduzierbare Eigenbenchmarks · ★ = Hersteller-Claim ohne Fremdbeleg.
**Status-Legende:** ✅ Kernempfehlung · 🟡 Alternative/situativ · 🔵 Nische/Beobachten · ⚠️ Einschränkung/Risiko · ❌ Nicht empfohlen/Obsolet.

---

## Schicht 0 — Messung & Observability (Governance-Basis; spart nicht direkt, aber Voraussetzung)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| ccusage/ccusage | Referenz-CLI: Token/Kosten aus lokalen JSONL-Logs, 16 Agent-Quellen, Billing-Windows, Statusline | CLI/TUI | 17.9k | 2026-08-12 | ★★★ (De-facto-Standard) | ✅ |
| getagentseal/codeburn | Messung + Waste-Analyse + `--apply`-Fixes + Budget-Guards + realized-vs-estimated-Loop (37 Tools) | CLI+MCP+Menubar | 9.3k | 2026-08-12 | ★★ | ✅ |
| steipete/CodexBar | macOS-Menübar: Usage-Limits Codex+Claude ohne Login | App | 20.0k | 2026-08-12 | ★★ | 🟡 (macOS) |
| Maciek-roboblog/Claude-Code-Usage-Monitor | Echtzeit-Burn-Rate + 5h-Fenster-Prognose | TUI | 8.5k | 2026 aktiv | ★★ | 🟡 |
| stormzhang/token-tracker | Statusline + Dashboard (Claude/Codex/Kimi) | pip+Hook | ~478 | 2026-05+ | ★ | 🔵 |
| mag123c/toktrack | Rust-Tracker, persistenter Cache überlebt 30-Tage-Löschung der Session-Files | CLI | klein | 2026-06 | ★ | 🔵 |
| egorfedorov/claude-context-optimizer | Evidenzbasiert: trackt Kontext-Wiederverwendung, ROI-Reports, Budget-Alerts | Plugin | 92 | 2026-08-11 | ★★ | 🔵 (explorativ, in awesome-claude-code gelistet) |
| f/agentlytics | Multi-Tool-Analytics-Dashboard (8 Agenten) | App | 560 | 2026-08-03 | ★ | 🔵 |
| nikitadoudikov/claude-pulse | Zero-Dep-Dashboard, Phone-Approval | App | 244 | 2026-07-19 | ★ | 🔵 |
| onikan27/claude-code-monitor | Live-Multi-Session-Dashboard | CLI+Web | 298 | 2026-01-29 | ★ | 🔵 |
| RonnieTheTester/headroom-meter | TUI-Dashboard für Headroom-Kompression | TUI | 6 | 2026-06-24 | ★ | 🔵 (Nische) |
| Growth4U-systems/claude-token-hygiene | Audit: System-Overhead (CLAUDE.md/MEMORY.md/Skills/MCP ~15–35k Tokens) | Skill | 10 | 2026-03-05 | ★ | 🔵 |
| ncoevoet/claude-markdown-health-check | .claude/-Setup-Audit (Token-Bloat, tote Refs) | Skill | 38 | 2026-08-12 | ★ | 🔵 |
| philipp-spiess/claude-code-costs | Früher Tracker — von ccusage abgelöst | CLI | 203 | 2025-06 | — | ❌ obsolet |
| ColeMurray/claude-code-otel | OTEL-Exporter — durch native OTEL ersetzt (CLAUDE_CODE_ENABLE_TELEMETRY=1; Achtung „Otel Smuggling" via .claude/settings.json) | OTEL | 485 | 2025-06 | — | ❌ → native OTEL |
| chiphuyen/sniffly | Usage-Dashboard, stagniert | App | 1.3k | 2025-08 | — | ❌ stale |
| disler/claude-code-hooks-multi-agent-observability | Hook-Event-Echtzeit-Monitoring | App | ~3k | 2026-02 | ★ | 🔵 |

## Schicht 1 — Systemprompt-/Installations-Ebene & Prompt-Hygiene

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| Piebald-AI/tweakcc | Patcht CC-Systemprompts/Toolsets/Context-Limit; Re-Patch nach jedem Update nötig | Patcher | 2.4k | 2026-08-10 | ★★ | 🟡 (mächtig, brüchig) |
| Piebald-AI/claude-code-system-prompts | Referenz aller Systemprompts + Tool-Beschreibungen mit Token-Counts (515 Prompts, v2.1.229) | Doku | 12.3k | 2026-08-12 | ★★★ | ✅ (Datenbasis) |
| aleks-apostle/claude-code-patches | Thinking-Toggle-Patch (spart Thinking-Tokens) | Patch | 67 | 2025-12 | ★ | 🔵 stale |
| gist roman01la patch-claude-code.sh | Gegenentwurf: entfernt Kürze-Anweisungen (Trade-off-Beleg: Kürze = Anthropic-Token-Ökonomie) | Gist | 356★ | — | ★★ | 🔵 (als Signal) |
| severity1/claude-code-prompt-improver | Prompt-Hygiene-Hook, ~189 Tokens/Prompt, v0.4 −31 % Overhead | Hook/Plugin | 1.8k | 2026-06 | ★★ | 🟡 |
| nidhinjs/prompt-master | Prompt-Formulierungs-Skill | Skill | 11.1k | 2026-06 | ★ | 🔵 |
| Siddartha1997-creator/prune | Prompt-Refiner (Intent-Extraktion) | Tool | 0 | 2026-08-08 | ★ | 🔵 |

## Schicht 2 — Verhaltens-/Output-Stil-Skills (Output-Token-Reduktion)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| DietrichGebert/ponytail | YAGNI-Skill: weniger Code = weniger Tokens; **einziger unabhängig bestätigter Gewinn** (JetBrains: −10,3 % Kosten, p=0,004) | Plugin/Skill | 101.5k | 2026-08-07 | ★★★ | ✅ |
| JuliusBrussee/caveman | Terse-Output-Skill; beworben 65 %, JetBrains gemessen 8,5 % (Decke); Governor-Benchmark: 12,5 % falsche Entscheidungen | Skill+Hooks+CLI | 97.8k | 2026-08-12 | ★★★ (widerlegt) | ⚠️ (effekt klein, Qualitätsrisiko) |
| multica-ai/andrej-karpathy-skills | Verhaltens-CLAUDE.md gegen Fehlmodi (kein Token-Claim) | Plugin | 201.9k | 2026-04 | ★ | 🔵 |
| ayghri/i-have-adhd | „Answer first"-Regelwerk → kürzere Outputs | Skill | 20.0k | 2026-08-10 | ★ | 🟡 |
| UditAkhourii/adhd | Tree-of-Thought mit Pruning | Skill | 3.5k | 2026-08-05 | ★ | 🔵 |
| iceHub82/beeline | Benchmarked Merge caveman+i-have-adhd (Quality-gescort) | Output-Style | 6 | 2026-08-04 | ★ | 🔵 |
| carlosduplar/caveman-output-style-claude-code | Native Output-Styles (caveman/ultra), ~40 % Claim | Output-Style | 17 | 2026-05-06 | ★ | 🔵 |
| johnsnow1011/taxman | Filler-/Preamble-Cutter-Skill | Skill | 3 | 2026-07-03 | ★ | 🔵 |
| vliggio/claude-faa-speak | FAA-Funkstil ~53 %, Re-Expansion via Apple Intelligence | Plugin | 0 | 2026-07-24 | ★ | 🔵 (Kuriosität) |
| glitchwerks/mini-caveman | Dependency-freier Terse-Mode | Skill | 0 | 2026-07-26 | ★ | 🔵 |

## Schicht 3 — Shell-/Tool-Output-Filter (erste Verteidigungslinie)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| rtk-ai/rtk | Rust CLI-Proxy: filtert 100+ Kommandos; beworben 60–90 %, JetBrains +7,6 % teurer (nur ~22 % des Token-Stroms erreichbar); Issue #260 (allow-Bug) | PreToolUse-Hook+CLI | 75.9k | 2026-08-12 | ★★★ (widerlegt als Bill-Hebel) | ⚠️ (nur mit ehrlicher Erwartung: einstellige Gesamtersparnis) |
| claudioemmanuel/squeez | Hook-Kompressor 7 CLI-Hosts, reversibel (Blob+Retrieve), Net-win-Gate, bis 95 % auf Bash | Hook+MCP | 182 | 2026-08-12 | ★★ | 🟡 |
| mpecan/tokf | Config-driven TOML-Filter (Rust), RTK-Rivale | CLI+Shell | 192 | 2026-08-12 | ★★ | 🟡 |
| ojuschugh1/sqz | Rust-Binary, ehrlichster Mittelwert: 24,7 % Ø (3.003 Messungen) | CLI/Hook | 593 | 2026-06-21 | ★★ | 🟡 |
| edouard-claude/snip | YAML-Filter-Pipelines (Go-Proxy), 60–90 % Claim | Proxy | 406 | 2026-08-04 | ★★ | 🟡 |
| ppgranger/token-saver | 36 Prozessoren (git/pytest/npm/terraform…), 60–99 %, offizielle Community-Marketplace | Plugin | 136 | 2026-08-10 | ★★ | 🟡 |
| 3rg0n/thlibo | Sauberstes Pattern: PreToolUse+updatedInput, deterministisch + Gemma-4-Fallback, ehrliche Token-Messung | Hook (Go) | 9 | 2026-08-12 | ★★ | 🔵 (Architektur-Referenz) |
| hansipie/ecotokens | Hook-Kompression + USD-Tracking | Hook (Rust) | 18 | 2026-07-29 | ★ | 🔵 |
| kurovu146/kuro-lean | Output-Kompression + Blocking token-hungriger Calls + Cache-Rescue | CLI+Hooks | 15 | 2026-08-10 | ★ | 🔵 |
| AbhayShalghar/ctk | „Context Token Killer", breiterer Scope als rtk (MCP+native+Bash) | Hook/Go | 1 | 2026-06-26 | ★ | 🔵 |
| cardimvitor/tk („Token Killer") | VS-Code-Ext. + CC-Hook; Quell-Repo „Compression" nicht verifizierbar (Supply-Chain-Frage) | VSIX+Hook | n/a | 2026-07-28 | ★ | ⚠️ |
| suhaanthayyil/lean-mode | Bundle: RTK-Filter + caveman-ultra + Graph-First | Skill | 3 | 2026-07-25 | ★ | 🔵 |
| sphragis-oss/isthmos | Go-Binary PostToolUse/Generik-Filter | Hook | 0 | 2026-08-03 | ★ | 🔵 |
| ryanportfolio/STK | Read-Results → zeilennummerierte Outlines | Hook (JS) | 1 | 2026-08-12 | ★ | 🔵 |
| illuwa/ctx-diet | Tool-Output-Hook, 65,6 % Eigenmessung | Hook | 3 | 2026-07-25 | ★ | 🔵 |
| phuetz/lm-resizer | Rust-Filter (Tests/Diffs/Logs/JSON) | CLI/MCP | 2 | 2026-07-02 | ★ | 🔵 |
| Guazzihub/Sieve | Bash-Filter-Plugin „verifiable loss policy" | Plugin | 0 | 2026-07-14 | ★ | 🔵 |
| wasdevv/lean-output | RSpec/RuboCop-Kompressor „zero lost failures" | Plugin | 0 | 2026-08-12 | ★ | 🔵 (Ruby) |
| AndVl1/gw | Gradle-Output-Filter | CLI+Hook | 4 | 2026-06-25 | ★ | 🔵 (JVM) |
| helmif/wafi | Shell-Filter-Wrapper | Wrapper | 0 | 2026-04-21 | ★ | 🔵 |
| JoonasAaltonen/claude-optimizer | Einfacher Output-Filter (RTK-inspiriert) | Hook | 0 | 2026-05-18 | ★ | 🔵 |
| fantastic-interpolation620/ctx-wire | Output-Filter + Secret-Scrubber | Filter | 0 | 2026-08-12 | ★ | 🔵 |
| dbuzatto/token-diet, aetox-skills/token-saver, artificemachine/token-diet, shubhransh-gupta/toknt, ChevvyOkK/contextguard-plugin | RTK-Klone/Bundles | div. | 0–2 | 2026 | ★ | 🔵 |

## Schicht 4 — MCP-Sandbox, Tool-Schema-Kompression & Kompressions-Engines

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| mksglu/context-mode | MCP-Sandbox: nur stdout in Kontext, SQLite-FTS5-Index (überlebt /compact), Session-Persistenz, 17 Plattformen; 98 % auf Tool-Outputs | MCP+Plugin+Hooks | 19.8k | 2026-08-12 | ★★ | ✅ |
| atlassian-labs/mcp-compressor | MCP-Proxy: kollabiert Tool-Schemas auf 2 Wrapper-Tools (70–97 % Schema-Reduktion) | MCP-Proxy | 106 | 2026-07-28 | ★★ | 🟡 |
| maximhq/bifrost | Gateway: Code Mode (Python statt Tool-Defs, bis 92,8 % Input↓), semantisches Caching, Virtual Keys | Proxy | 7.3k | 2026-08-12 | ★★ | 🟡 (Enterprise) |
| edgee-ai/edgee (Compressor V2) | Gateway: 3 Schichten (Brevity ~30 %, Tool Surface Reduction ~33 %, Tool-Result-Trimming ~10 %), ~50 % Kosten↓, SWE-bench 6/6+8/8 | Proxy | 124 | 2026-08-12 | ★★ (kleine n) | 🟡 |
| ooples/token-optimizer-mcp | Kompression + Savings-Audit über 16 Clients, lokaler KG | MCP | 479 | 2026-08-12 | ★ | 🔵 |
| Paritok-official/paritok-4b-v1 | OSS-4B-Kompressionsmodell für Coding-Trajektorien (45K), non-destruktive Gateway, 25→85 % | Proxy+HF-Modell | 1.1k | 2026-08-12 | ★★ | 🟡 (spannend, jung) |
| scaledown-team/DietCode | ScaleDown-Modell: sd_compress/summarize-Tools + Hooks + Proxy | Plugin+MCP | 2 | 2026-08-05 | ★ | 🔵 |
| juyterman1000/entroly | AST-Multi-Resolution-Kompression (Rust/WASM), ~90 % Claim | MCP | 435 | 2026-08-12 | ★ | 🔵 |
| KRLabsOrg/squeez | Qwen-3.5-2B Tool-Output-Pruner, 87–92 % @0,80 F1, arXiv-Paper; braucht GPU/vLLM | CLI/Lib | 23 | 2026-04-27 | ★★★ (Paper) | 🔵 (Self-Host) |
| mibayy/token-savior | MCP-Kombi: strukturelle Navigation + Memory + Bash-Rewrite; tsbench 97,9 % @−80 % Tokens (Eigenbenchmark) | MCP | 1.1k | 2026-08-10 | ★★ | 🟡 |
| Open330/context-compress | TS-Rewrite von context-mode (8 MCP-Tools + Hook) | MCP+Hook | 1 | 2026-08-10 | ★ | 🔵 |
| Madhan230205/token-reducer | Hybrid-RAG-Plugin, 90–98 % ohne Beleg | Plugin | 42 | 2026-05-02 | ★ | ❌ (Claim unbelegt) |
| techdeveloper-org/mcp-token-optimizer | 60–85 % Claim | MCP | 0 | 2026-08-07 | ★ | 🔵 |
| SenseiIssei/Sensei | Self-hosted Prompt-Kompressions-Gateway, 79 % | Gateway | 2 | 2026-08-12 | ★ | 🔵 |
| microsoft/LLMLingua (+LongLLMLingua, LLMLingua-2) | Referenz-Forschung: bis 20×, ~1,5 pp Verlust; **bricht strukturierte Daten/Code + Prompt-Cache** | Python-Lib | 6.5k | 2026-04-08 | ★★★ (peer-reviewed) | ⚠️ (nicht CC-nativ; nur via Dritt-Hooks) |
| llmlingua-cursor | LLMLingua-2 als FastMCP-Server (30–55 % je Prompt-Typ) | MCP (npm) | n/a | 2026 aktiv | ★ | 🔵 |
| jia-gao/leanctx | SDK-Wrapper-Kompression (10–40 %, LongBench +18,7 pp auf laufenden Kompressor) | Python-Lib | 316 | 2026-08-12 | ★★ | 🔵 (kein CC-Plugin) |
| microsoft/acon | Kompressions-Guidelines für Long-Horizon-Agenten (Prompt-Templates) | Templates | 100 | 2025-10 | ★★ | 🔵 (Referenz) |
| ZongqianLi/500xCompressor | ACL'25: 500 Tokens→1 KV-Spezial-Token; **für Claude nicht deploybar** (braucht Modellgewichte) | Research | 64 | 2026-03-09 | ★★★ | ❌ (für CC irrelevant) |
| getao/icae, liyucheng09/Selective_Context, carriex/recomp, jayelm/gisting, princeton-nlp/AutoCompressors | Forschungs-Kompressoren, stagniert 2024/25, kein CC-Pfad | Research | 149–424 | 2024–2025 | ★★ | ❌ (kein Integrationspfad) |
| micoverde/taac-llm-compression | Task-Aware Adaptive Compression, 22 % Kosten↓ @96 % Qualität (n=1800) | Research | 0 | 2026-02 | ★ | 🔵 |

## Schicht 5 — Konversations-/Session-Kompression & Compact-Alternativen

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| headroomlabs-ai/headroom (ex chopratejas) | Kompressions-Layer (Library/Proxy/MCP/`wrap`): 15–20 % Coding-Agents, 60–95 % JSON; reversibel; ehrliche Benchmarks (10–30 % realistisch); codepointer-Replay: 2,8 % der Rechnung | Lib+Proxy+MCP | 66.1k | 2026-08-12 | ★★★ | ✅ (mit realistischer Erwartung) |
| aerovato/magic-compact | Beste /compact-Alternative: Per-Turn-Summaries + read_omitted_content-Rückhol-Tool statt Session-Blob | Plugin | 134 | 2026-08-12 | ★★ | ✅ |
| NodeNestor/claude-rolling-context | Proxy: rollierende Kompression alter Turns, ~40k verbatim; Prefix-Cap ⇒ linear statt quadratisch; ehrlich („kurze Sessions Wash") | Plugin+Proxy :5588 | 27 | 2026-08-12 | ★★ | 🟡 (lange Sessions) |
| Compresr-ai/Context-Gateway | Hintergrund-History-Kompression ab 75 %-Schwelle (YC-backed) | Proxy | 631 | 2026-08-02 | ★★ | 🟡 |
| agiwhitelist/tokdiet | Reverse-Proxy + Context-Governor + Qualitäts-A/B (66 Tasks: −71 % Input @ Parität) | Proxy | 33 | 2026-06-18 | ★★ | 🟡 |
| fkiene/llmtrim | Proxy mit Net-win-Gate pro Stufe (−31 % Input, −74 % Output, −66 % Kosten, Eigenmessung) | Proxy | 208 | 2026-08-12 | ★ | 🟡 |
| sergioramosv/squeezr | Kompressions-Proxy (Haiku/Zest), wirbt explizit mit Prompt-Cache-Sicherheit, Dashboard | Proxy (npm) | 34 | 2026-07-21 | ★★ | 🔵 |
| alibaizhanov/densely | Lossless 2–8×, sha256-verifizierte Rekonstruktion | MCP | 6 | 2026-08-12 | ★ | 🔵 |
| teamchong/pxpipe | Rendert Kontext als PNG (Vision billiger); 59–70 % Rechnung; **aber 0/15 Hex-Recall Opus** | Proxy :47821 | 7.1k | 2026-08-12 | ★★ | ⚠️ (Exaktheitsrisiko) |
| diegosouzapw/OmniGlyph | PNG-Kontext-Rendering, 59–70 %, „100 % read accuracy"-Claim | Proxy | 78 | 2026-08-03 | ★ | ⚠️ (gleiche Risikoklasse) |
| xuweizhengo/claude-code-token-compressor | PNG-Rendering-Proxy (chinesische Doku) | Proxy | 0 | 2026-07-04 | ★ | 🔵 |
| Capnjbrown/c0ntextKeeper | 7 Hooks (Pre/PostCompact), 187 Patterns, „never lose work to compaction" | Hook-Bundle+MCP | 62 | 2026-07-31 | ★★ | 🟡 |
| rupaut98/unforget | Zero-Dep SessionStart-Hook: State-Re-Injection nach Compaction | Hook | 3 | 2026-07-30 | ★ | 🔵 |
| smdysk/cc-parachute | 4 auditierbare Shell-Hooks, „soft landings", null Extra-Tokens | Hooks | 0 | 2026-07-09 | ★ | 🔵 |
| TheMizeGuy/claude-code-smart-compact | Watermark-Nudges + Session-Ledgers + Rehydration | Hooks | 0 | 2026-07-19 | ★ | 🔵 |
| codeprakhar25/smartcompact | Human-in-the-loop-Compaction (Turn-Auswahl) | Hooks | 5 | 2026-07-14 | ★ | 🔵 |
| LxveAce/claude-compact-controller | Auto-Compact-Controller + Vault-Backups | Hooks | 1 | 2026-08-03 | ★ | 🔵 |
| skymanbp/cc-memory | SQLite + Lifecycle-Hooks über Compactions | Plugin | 5 | 2026-08-10 | ★ | 🔵 |
| ahmadkassem511/TokenSnap | HTTP-Proxy, 40–70 % Claim | Proxy | 0 | 2026-07-14 | ★ | 🔵 |
| jee599/contextzip / andresgarciaf/contextzip | Rust-Proxys, Live-stdout-Kompression (2 gleichnamige Projekte) | Proxy | 22 / 0 | 2026-06/08 | ★ | 🔵 |
| omar-y-abdi/furl-ctx | Retrievable Compression (Rust+Python) | Lib | 3 | 2026-08-12 | ★ | 🔵 |
| g4itpl/clear-nudge | Sagt, wann /clear sinnvoll ist | Hook/Skill | 0 | 2026-08-11 | ★ | 🔵 |

## Schicht 6 — Formate & lossless-Kompression

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| toon-format/toon | TOON-Serialisierung: ~42,6 % unter JSON @ gleicher Accuracy; Halodoc-Produktion 5–15 % Kosten↓; ehrliche Grenzen | Lib+CLI | 25.1k | 2026-08-07 | ★★★ | ✅ (als Format-Baustein) |
| PCIRCLE-AI/toonify-mcp | CC-Plugin: TOON-Trimmung großer Tool-Outputs, Passthrough-Garantie | Plugin+MCP+CLI | 64 | 2026-08-12 | ★★ | 🟡 |
| manojmallick/sigmap | Deterministische Signatur-Maps (TF-IDF, 33 Sprachen); 97 % Eigenbenchmark, ehrliche 2,0×-Grep-Baseline | MCP+CLI | 614 | 2026-07-28 | ★★ | 🟡 |
| sriinnu/clipforge-PAKT | Lossless-first L1–L3 (byte-identisch), 27–33 % JSON; nennt +25 %-Gegenbeispiele | Lib+CLI+MCP | 20 | 2026-07-31 | ★★ | 🔵 |
| open-compress/claw-compactor | 14-Stufen-Pipeline, Ø 36 %, 1600+ Tests; stale seit 2026-04, OpenClaw-Fokus | Lib+Skill | 2.1k | 2026-04-01 | ★★ | 🔵 (stale) |
| xaviviro/python-toon | Python TOON-Encoder | Lib | klein | 2026 | ★ | 🔵 |
| sheikhsajid69/toon-skill | TOON-Encoding-Skill für Specs | Skill | 2 | 2026-07-03 | ★ | 🔵 |
| Barnett-Studios/cxpak | Token-budgetierte Kontext-Bundles (Rust-Graph, 43 Sprachen) | Plugin+MCP | 25 | 2026-08-07 | ★ | 🔵 |

## Schicht 7 — Code-Intelligence & Explorationsvermeidung (größter nativer Token-Block: File-Reads)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| Graphify-Labs/graphify | Code+Docs+SQL → Knowledge-Graph; Hersteller 71,5×, unabhängige Review ~60 %; /graphify-Skill + MCP (10 Tools) | Skill+MCP | 105.7k | 2026-08-12 | ★★ | 🟡 |
| colbymchenry/codegraph | Pre-indexierter KG, Auto-Sync; Eigenbenchmark 62 % Tokens↓ (sauber, CLI geblockt), **aber THOL: keine E2E-Ersparnis**; +80 % residenter Kontext-Caveat | MCP+CLI | 66.1k | 2026-08-08 | ★★★ (gemischt) | 🟡 |
| deusdata/codebase-memory-mcp | Tree-sitter-KG (158 Sprachen, single C binary); 99,2 %-Claim (5 Queries 3,4k vs. 412k Tokens); arXiv-Preprint | MCP | 38.7k | 2026-08-12 | ★★ | 🟡 |
| tirth8205/code-review-graph | Git-aware Graph (Commit/Branch-Edges), PR-Review-Fokus; 40–60 % Eigenbenchmark; 6,8–49× Review-Claims | MCP+CLI | 29.9k | 2026-08-02 | ★★ | 🟡 (Review-Workflows) |
| oraios/serena | LSP compiler-grade Symbol-Semantik, einziger mit Editing/Refactoring; unabhängig stärkste Navigation | MCP | 27.9k | 2026-08-12 | ★★ | ✅ (für Edit-Workflows) |
| zilliztech/claude-context | Semantische Code-Suche (Vektor+AST-Chunking, Merkle-Inkremental); ~40 % Eigen-Eval; braucht Vector-DB | MCP | 12.4k | 2026-07-14 | ★★ | 🟡 (Infra-Last) |
| jgravelle/jcodemunch-mcp | Symbol-Retrieval, 86–99 % Claim; kommerzielle Lizenz | MCP | „95k Installs" | 2026-08 | ★ | ⚠️ (Lizenz) |
| cmillstead/codesight-mcp | Security-hardened tree-sitter-Exploration | MCP | klein | 2026 aktiv | ★ | 🔵 |
| sdsrss/code-graph-mcp | AST-Graph (FTS5, 10 Sprachen) mit benchmark-Command | MCP+CLI | klein | 2026 aktiv | ★ | 🔵 |
| Aider-AI/aider | Repo-Map mit map-tokens-Budget (Tree-sitter+PageRank) — Referenz-Implementierung | Standalone | 48.2k | 2026 aktiv | ★★★ | 🔵 (Konzept) |
| dereira/goldfish | Go-Port des aider-Repo-Map-Algorithmus | Lib | klein | 2026 | ★ | 🔵 |
| Anthropic-Position | Boris Cherny: „agentic search generally works better" als RAG — Indizes = Community-Ansatz | — | — | — | ★★★ | (Einordnung) |

## Schicht 8 — Memory & Session-Persistenz

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| thedotmack/claude-mem | Standard: Hooks erfassen Observations, LLM-Kompression, Progressive Disclosure; ~800–3k Footprint + $5–15/Monat Kompressions-API; Issue #1719 (Read-Truncation) | Plugin+Hooks+Worker | 90.5k | 2026-08-10 | ★★★ | ✅ |
| MemPalace/mempalace | Verbatim + semantische Suche (LongMemEval R@5 96,6 % ohne LLM); **44 MCP-Tools = real 4,4–8,6k Tokens/Session** (widerlegt 170-Token-Claim); kein SessionStart-Hook; Issues #856/#524 | MCP+CLI | 58.3k | 2026-08-12 | ★★ | 🟡 |
| severity1/claude-code-auto-memory | CLAUDE.md-Sync in isoliertem Subagent-Kontext (0 Main-Session-Kosten) | Plugin | 155 | 2026-04-18 | ★★ | 🟡 (Komplement) |
| zilliztech/memsearch | Markdown + Milvus Memory-Layer, CC-Plugin | MCP/Plugin | 2.5k | 2026-08-12 | ★★ | 🟡 |
| 0xranx/OpenContext | GUI-zentrierter Context-Store | App+CLI | 729 | 2026-06-16 | ★ | 🔵 |
| OthmanAdi/planning-with-files | task_plan.md/findings.md/progress.md überleben Reset — methodisches Muster | Skill | 26.1k | 2026-08-09 | ★★ | ✅ (als Methode) |
| ramakay/claude-self-reflect | Memory-MCP, 82 % Kompression Claim | MCP | 221 | 2026-08-10 | ★ | 🔵 |
| agentmemory (Neu-Fund) | BM25+Vector+Graph RRF, LongMemEval-S R@5 95,2 %, lokal | Lib/MCP | ~26k | 2026 aktiv | ★★ | 🟡 (Repo-Verifikation in dim06) |
| doobidoo (memory MCP) | SQLite-vec Memory; Concurrency-Probleme bekannt | MCP | mittel | aktiv | ★ | 🔵 |
| Context Cloud (abhinavala/cntxtv2) | Team-Workspaces, RBAC, Attribution — einziger Team-Ansatz | MCP hosted | klein | aktiv | ★ | 🔵 (Team) |
| zippoxer/recall | Full-Text-Search + Resume über Konversationen; stagniert | CLI | 194 | 2026-01 | ★ | 🔵 |
| iannuttall/claude-sessions | Session-Tracking; **archiviert** | Slash | 1.2k | 2025-06 | — | ❌ |
| Vvkmnn/claude-historian-mcp | Volltextsuche in Historie (token-begrenzt) | MCP | 177 | 2026-03 | ★ | 🔵 |
| daaain/claude-code-log | Transkript-JSONL → HTML/MD | CLI | 1.2k | 2026-07-31 | ★ | 🔵 |

## Schicht 9 — Routing & Gateways (Kosten-Hebel, nicht Token-Hebel)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| musistudio/claude-code-router | De-facto-Standard: Task-Rollen→Provider (default/background/think/longContext/webSearch/image); 50–99 % Kosten↓ je Strategie | Proxy :3456 | 36.6k | 2026-08-11 | ★★ | ✅ (wo Routing gewünscht) |
| diegosouzapw/OmniRoute | AI-Gateway, stapelt „RTK+Caveman"-Kompression, 15–95 % Claim, 231+ Provider | Gateway | 46.6k | 2026 aktiv | ★ | 🟡 |
| BerriAI/litellm | Generelles AI-Gateway (100+ APIs), Cost-Tracking | Proxy | 56.2k | 2026-08-12 | ★★★ | 🟡 (Enterprise) |
| BlockRunAI/ClawRouter | Agent-nativer Router (70 Modelle, x402/USDC) — Kosten-, kein Token-Routing | Plugin | 6.6k | 2026-08-12 | ★ | 🔵 |
| ypollak2/llm-router | Router + 3-Layer-Kompression unter CC | Router | 67 | 2026-08-05 | ★ | 🔵 |
| ruvnet/metaharness (@metaharness/router) | „cheapest model that's good enough"-Routing | Meta-Harness | (ruflo 67.7k) | 2026-08 | ★ | 🔵 |
| tkaufmann/claude-gemini-bridge | Delegiert Großkontext an Gemini; **stale seit 2025-08** (Konzept referenzierbar) | Bridge | 406 | 2025-08 | ★ | ❌ (stale) |
| frsorrentino/fable-director | Token-Governance via Routing (Top dirigiert, billig führt aus) | Hooks | 4 | 2026-08-11 | ★ | 🔵 |
| guyoron1/costwise | Auto-Routing + Input-Filter + Output-Reduktion | Hooks | 2 | 2026-08-12 | ★ | 🔵 |
| lidge-jun/opencodex | Universal-Provider-Proxy | Proxy | klein | 2026 | ★ | 🔵 |
| OpenRouter (Setup) | ANTHROPIC_BASE_URL→OpenRouter; GLM 5.2 $1,40/M vs. Claude $10/M; Tool-Calling-Caveats | Env | SaaS | — | ★★ | 🟡 |
| lm-sys/RouteLLM, stanford-futuredata/FrugalGPT | Forschungs-Router, stagniert | Research | 5.3k/280 | 2024/25 | ★★ | ❌ (kein Pfad) |

## Schicht 10 — Cache-Ebene (größter Input-Kostenhebel)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| cnighswonger/claude-code-cache-fix | Fixt 3 CC-Cache-Bugs (Block-Scatter bei --resume, Fingerprint-Instabilität, Tool-Sort) — bis 20× Kostenexplosion; Hit-Rate 94,66 vs. 92,44 % | Proxy :9801 | 414 | 2026-08-12 | ★★★ (dokumentierte Bugs, Issue-Refs) | ✅ (v. a. --resume-Nutzer) |
| CoderDayton/semantic-cache-mcp | Datei-Diff-Caching: unveränderte Dateien ~0 Tokens (Konzept stark, 2★) | MCP+Deny-Rules | 2 | 2026-07-28 | ★ | 🔵 (früh) |
| zilliztech/GPTCache | Generischer semantischer LLM-Cache (25–35 % Hit-Rate Chatbot-Traffic) | Lib/Proxy | 8.1k | 2025-07 | ★★ | 🔵 (generisch) |
| flightlesstux/prompt-caching | cache_control-Injection — **explizit NICHT für CC-Sessions** (CC cached selbst) | Plugin/MCP | klein | 2026-03 | ★★ | ❌ (für CC) |
| Native: CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1 | ~1.800 Tokens/Call gespart, verhindert Cache-Bust durch git-status | Env | — | — | ★★★ | ✅ |

## Schicht 11 — Repo→Kontext-Packaging (hilfreich, aber bei Dauernutzung selbst Token-fressend)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| yamadashy/repomix | Repo→eine Datei, `--compress` (Tree-sitter), Token-Budget-CI, MCP | CLI+MCP | 27.8k | 2026-08-11 | ★★ | 🟡 (Einmal-Sessions) |
| coderamp-labs/gitingest | GitHub-URL→Extrakt (hub→ingest) | CLI/Web | 15.3k | 2026-08-05 | ★★ | 🟡 |
| mufeedvh/code2prompt | Rust, Handlebars-Templates, Token-Count | CLI+MCP | 7.6k | 2026-06-29 | ★★ | 🔵 |
| mohsen1/yek (ex bodo-run) | Rust-Serialisierer, Git-Priorisierung, 230× schneller als repomix | CLI | 2.5k | 2026-06-29 | ★★ | 🔵 |
| simonw/files-to-prompt | Verzeichnis→Prompt-Konkatenation; **stale 2025-02** | CLI | 2.8k | 2025-02 | ★★ | 🔵 (stale) |
| glincker/stacklit | ~250-Token-Modulkarte statt Dump (Diskussion #13: Vergleich) | CLI | klein | 2026 | ★ | 🔵 |

## Schicht 12 — Hook-Sammlungen & Guards (Regelwerk-Rohmaterial)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| karanb192/claude-code-hooks | 10 Hooks (cost-tracker, rate-limiter, branch-guard, context-snapshot, session-summary…) | Hooks | 470 | 2026-08-04 | ★★ | ✅ (Referenz) |
| disler/claude-code-hooks-mastery | Lernressource alle Lifecycle-Events | Doku | ~5k | 2026 | ★★ | ✅ (Doku) |
| overloop (PyPI) | Loop-/Dedup-/Truncate-Guard: Spill-File+Preview — Blaupause für bash-dump-guard | Hooks | n/a | 2026-07-04 | ★★ | ✅ (Design-Vorlage) |
| 0xhimanshu/governor | Usage-Governor: content-aware Filter, /governor:audit + compress + Telemetry; VCLR-Benchmark (0 falsche Entscheidungen vs. caveman 12,5 %) | Plugin+Hooks | (klein) | 2026-05+ | ★★ | 🟡 |
| valorisa/Claude-Skills | rescue-tokens (9 Patterns, 90 % Antwort-Verkürzung), token-optimization (4 Achsen), spec-driven (Token-Budgets) | Skills | mittel | 2026-08-08 | ★★ | 🟡 |
| yifanzz/claude-code-boost | Auto-Approval-Hook (Fast-Path/LLM/Cache/Block) | Hook | 164 | 2026-03-21 | ★ | 🔵 |
| YoraiLevi/claude-command-policy | PRIOR-ART: AST-/shfmt-Guards (banyudu/claude-warden, gwatts, oryband) korrekter als Regex-Leader | Doku/Hooks | klein | 2026-06-26 | ★★ | ✅ (Guard-Design) |
| ithiria894/awesome-claude-code-hooks | Kuratierte Hook-Collections (karanb192, Aedelon, JalelTounsi) | Liste | 20 | 2026 | ★ | 🔵 |
| JanBancerewicz/context-cost-guard | Warnt vor Kontext-Überausgaben | Hook | 2 | 2026-08-11 | ★ | 🔵 |
| emanueleielo/compact-middleware | Compaction-Defaults: Trigger 0,85, Microcompact Keep-last-5, TruncateArgs 2000 | Middleware | klein | 2026-04-02 | ★★ | 🔵 (Defaults-Referenz) |
| hesreallyhim/awesome-claude-code | Zentrale Kuratierung (52,2k★) | Liste | 52.2k | 2026 aktiv | ★★★ | ✅ (Discovery) |
| anthropics/claude-plugins-official + -community | Offizielle Plugin-Marketplaces (token-saver community-gelistet) | Marketplace | 33.5k | 2026 | ★★★ | ✅ |

## Schicht 13 — Peripherie (im Lesezeichen-Ordner, nur indirekt token-relevant)

gstack (127,7k★, Setup+Modell-Benchmark), spec-kit (126,4k★, Spec-Driven → weniger Iterationen), ruflo (67,7k★, Meta-Harness mit Routing+Cost-Tracker), alirezarezvani/claude-skills (24,4k★), KKKKhazix/khazix-skills (19,6k★), Archon (23,2k★, Token-Counts pro Run), chujianyun/skills (skill-optimizer), runkids/skillshare, xingkongliang/skills-manager, Observal/Observal (Session-Replay mit Token-Counts), happycapy skill-arena (Skill-Benchmark inkl. Kontext-Token-Metrik), AgriciDaniel/claude-obsidian, coleam00/second-brain-skills, rixinhahaha/snip (Visual Mode, 277★), superagent-ai/vibekit, opentabs-dev/opentabs (API statt DOM), mbailey/voicemode, cc-switch-cli.

## Schicht 14 — Obsolet / Stale / Irrelevant / Nicht-deploybar (Referenz)

- **Obsolet durch native Features:** RonitSachdev/ccundo (nativ), philipp-spiess/claude-code-costs (→ ccusage), ColeMurray/claude-code-otel (→ native OTEL)
- **Stale (>6 Monate):** files-to-prompt, claw-compactor, karpathy-skills, KRLabsOrg/squeez, LLMLingua, 500xCompressor, gemini-bridge, claude-code-patches, sniffly, claude-sessions (archiviert), recall, benbasha/Claude-Autopilot, winfunc/opcode, gagarinyury/claude-config-editor, KyleAMathews/claude-code-ui, simonw/claude-code-transcripts, L1AD/claude-task-viewer, disler multi-agent-observability
- **Für CC nicht deploybar/irrelevant:** 500xCompressor (KV-Zugriff nötig), ICAE/Selective Context/Gisting/AutoCompressors/RECOMP (Forschung), RouteLLM/FrugalGPT (Frameworks), flightlesstux/prompt-caching (nur SDK-Apps)
- **Kein Token-Bezug (Kategorie d):** worldmonitor, tradingview-mcp, seedance-prompt-skill, ui-ux-pro-max-skill, propel, good-docs-writer, listenhub-multimedia
- **Umbenennungen:** chopratejas/headroom→headroomlabs-ai/headroom · bodo-run/yek→mohsen1/yek · forrestchang/andrej-karpathy-skills→multica-ai/andrej-karpathy-skills
- **Namens-Doppelgänger:** claudioemmanuel/squeez (Hook) ≠ KRLabsOrg/squeez (Modell) · headroomlabs-ai/headroom ≠ RonnieTheTester/headroom-meter · edouard-claude/snip (Filter) ≠ rixinhahaha/snip (Visual Mode) · jee599/contextzip ≠ andresgarciaf/contextzip
