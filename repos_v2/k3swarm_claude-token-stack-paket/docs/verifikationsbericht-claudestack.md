# Externer Verifikationsbericht — ClaudeStack Research-Outputs (5 Agents)

**Prüfdatum:** 2026-08-13 · **Methode:** GitHub-REST-API (`/repos/{owner}/{repo}`, `/search/repositories`, Redirect-Verfolgung), README-Abrufe, Websuche auf offizielle Docs und unabhängige Sekundärquellen (u. a. JetBrains-Benchmark-Serie).
**Geprüft:** ~95 Repos direkt per API (Existenz, Stars, `pushed_at`, `archived`, Beschreibung) + README-Deep-Dives (rtk, context-mode, ponytail, cache-fix, headroom, caveman) + 3 GitHub-Discovery-Suchen (TEIL 2).

---

## 1. Verifikationstabelle (Top-~30 Repos nach Häufigkeit/Bewertung in den Agent-Katalogen)

| Repo | Agent-Behauptung (Kern) | Verifikationsergebnis (API, 2026-08-13) | Status |
|---|---|---|---|
| ccusage/ccusage | KIMI: 17.9k★, aktiv, De-facto-Mess-Standard; GPT/MANUS: Mess-Standard | 17.888★, Push 2026-08-13, „npx ccusage" | **VERIFIZIERT** |
| getagentseal/codeburn | KIMI: 9.3k★, 37 Tools, Waste-Analyse | 9.282★, 2026-08-12, „track AI coding token usage across 37 tools" | **VERIFIZIERT** |
| steipete/CodexBar | KIMI: 20.0k★, macOS-Menübar ohne Login | 20.017★, 2026-08-13 | **VERIFIZIERT** |
| Maciek-roboblog/Claude-Code-Usage-Monitor | KIMI: 8.5k★, Burn-Rate-Prognose | 8.623★, 2026-07-05 | **VERIFIZIERT** |
| Piebald-AI/tweakcc | KIMI: 2.4k★, patcht Systemprompts/Toolsets | 2.421★, 2026-08-12, Beschreibung deckungsgleich | **VERIFIZIERT** |
| Piebald-AI/claude-code-system-prompts | KIMI: 12.3k★, Systemprompt-Referenz | 12.272★, 2026-08-12 | **VERIFIZIERT** |
| DietrichGebert/ponytail | KIMI: 101.5k★, YAGNI-Skill, „JetBrains −10,3 % Kosten, p=0,004" | 101.658★, 2026-08-07. JetBrains-Blog (2026-07-28) bestätigt: 80 paired tasks, −15 % Code, **−10,3 % Kosten, p=0,004** | **VERIFIZIERT** (inkl. JetBrains-Zitat) |
| JuliusBrussee/caveman | KIMI: 97.8k★, „beworben 65 %, JetBrains 8,5 %" | 97.834★, 2026-08-13. JetBrains (2026-07-06): advertised 65 %, measured **8,5 %** | **VERIFIZIERT** |
| rtk-ai/rtk | KIMI: 75.9k★, 60–90 %, JetBrains +7,6 %; GPT/OPUS: Rust, 100+ Kommandos, PreToolUse-Rewrite | 75.936★, 2026-08-13. README bestätigt: Rust-Binary, 100+ Commands, PreToolUse-Hook-Rewrite, „up to 90 % **bash output**" + ehrlicher Hinweis „not the same as cutting your bill". JetBrains (2026-07-20): **+7,6 % teurer (p=0,004)** | **VERIFIZIERT** |
| claudioemmanuel/squeez | GPT/MANUS: Hook-Kompressor, reversibel; KIMI: 182★, 7 CLI-Hosts | 182★, 2026-08-12, „Hook-based token compressor for 5 AI CLI hosts" (KIMI sagt 7 — Abweichung im Detail) | **VERIFIZIERT** (Detail: 5 statt 7 Hosts) |
| mksglu/context-mode | KIMI: 19.8k★, MCP-Sandbox, SQLite-FTS5, 17 Plattformen, 98 % | 19.832★, 2026-08-12. README: FTS5/BM25, 17 Plattformen, 98 % Sandbox-Reduktion, Hook-Set (PreToolUse/PostToolUse/UserPromptSubmit/PreCompact/SessionStart/Stop) | **VERIFIZIERT** |
| headroomlabs-ai/headroom | KIMI: 66.1k★, 15–20 % Coding / 60–95 % JSON, Lib+Proxy+MCP, reversibel | 66.112★, 2026-08-13. README deckungsgleich (inkl. CCR-Retrieval, ehrliche Output-Schätzung mit CI) | **VERIFIZIERT** |
| aerovato/magic-compact | KIMI/GPT: /compact-Alternative, Per-Turn-Summaries + Rückhol-Tool | 134★, 2026-08-12, „Lossless context compression plugin" | **VERIFIZIERT** |
| NodeNestor/claude-rolling-context | GPT/KIMI: rollierende Proxy-Kompression | 27★, 2026-08-12 | **VERIFIZIERT** |
| Compresr-ai/Context-Gateway | MANUS/KIMI/GPT: History-Compaction-Proxy | 631★, 2026-08-02 | **VERIFIZIERT** |
| agiwhitelist/tokdiet | GPT/KIMI: Reverse-Proxy + Governor | 33★, 2026-06-18 | **VERIFIZIERT** |
| fkiene/llmtrim | KIMI/OPUS: lokaler History-Trimmer-Proxy | 208★, 2026-08-12 | **VERIFIZIERT** |
| teamchong/pxpipe | KIMI/GPT/OPUS: PNG-Rendering-Proxy, Exaktheitsrisiko | 7.070★, 2026-08-12, „rendering text context as images" | **VERIFIZIERT** |
| toon-format/toon | MANUS/GPT/KIMI: TOON-Serialisierung ~42 % unter JSON | 25.145★, 2026-08-07, „Token-Oriented Object Notation" | **VERIFIZIERT** |
| Graphify-Labs/graphify | KIMI: 105.7k★, Knowledge-Graph, Skill+MCP | 105.746★, 2026-08-12 | **VERIFIZIERT** |
| colbymchenry/codegraph | MANUS/GPT/KIMI/OPUS: pre-indexierter Code-Graph, Auto-Sync | 66.154★, 2026-08-08, Beschreibung deckungsgleich | **VERIFIZIERT** |
| DeusData/codebase-memory-mcp | GPT/OPUS/KIMI: Tree-sitter-KG, persistent | 38.728★, 2026-08-13 | **VERIFIZIERT** |
| oraios/serena | KIMI: 27.9k★, LSP-Semantik + Editing | 27.939★, 2026-08-12 | **VERIFIZIERT** |
| zilliztech/claude-context | MANUS/KIMI/GPT/OPUS: semantische Code-Suche (MCP) | 12.388★, 2026-07-14 | **VERIFIZIERT** |
| zilliztech/memsearch | MANUS/KIMI: Markdown+Vektorindex-Memory | 2.458★, 2026-08-12 | **VERIFIZIERT** |
| thedotmack/claude-mem | MANUS/KIMI: Session-Memory via Hooks | 90.574★, 2026-08-13 | **VERIFIZIERT** |
| OthmanAdi/planning-with-files | MANUS/KIMI: dateibasierte Planung, überlebt Reset | 26.135★, 2026-08-09 | **VERIFIZIERT** |
| musistudio/claude-code-router | KIMI: 36.6k★, Routing-Standard | 36.615★, 2026-08-11 | **VERIFIZIERT** |
| yamadashy/repomix | MANUS/KIMI/OPUS: Repo-Packer | 27.803★, 2026-08-11 | **VERIFIZIERT** |
| github/spec-kit | MANUS/KIMI: Spec-Driven-Toolkit | 126.558★, 2026-08-12 | **VERIFIZIERT** |
| microsoft/LLMLingua | KIMI/GPT: Forschungs-Kompressor, bricht Cache | 6.551★, letzter Push 2026-04-08 (KIMI markiert stale — korrekt) | **VERIFIZIERT** |
| cnighswonger/claude-code-cache-fix | KIMI: 414★, fixt 3 Cache-Bugs, Hit-Rate 94,66 vs 92,44 | 414★, 2026-08-12. README bestätigt wörtlich: 3 Bugs (Block-Scatter, Fingerprint, Tool-Sort), **94,66 % vs 92,44 %** Dogfood-Daten, `:9801`-Proxy | **VERIFIZIERT** (bemerkenswert präzise) |
| manojmallick/sigmap | GPT/OPUS/KIMI: deterministische Signatur-Maps, 33 Sprachen | 615★, 2026-07-28, „~97 % token reduction … 33 languages" | **VERIFIZIERT** |
| open-compress/claw-compactor | MANUS: Pilot-Alternative (68 Pkt); KIMI: stale seit 2026-04 | 2.111★, **letzter Push 2026-04-01** — KIMIs „stale"-Urteil korrekt, MANUS-Empfehlung dadurch abgeschwächt | **VERALTET** (Repo existiert, inaktiv) |
| oomol-lab/open-connector | MANUS: Auth-Gateway, Enterprise-Option | 4.633★, 2026-08-13 | **VERIFIZIERT** |
| ruvnet/ruflo | MANUS/KIMI: Meta-Harness | 67.751★, 2026-08-12 | **VERIFIZIERT** |
| f/agentlytics | MANUS/KIMI: Multi-Host-Analytics | 560★, 2026-08-03 | **VERIFIZIERT** |
| ColeMurray/claude-code-otel | MANUS: „Referenz für spätere Teamtelemetrie"; KIMI: ❌ → native OTEL | 485★, **letzter Push 2025-06-17** — KIMIs Obsolet-Urteil korrekt; MANUS-Einstufung optimistisch | **VERALTET** |
| jgravelle/jcodemunch-mcp | GPT/OPUS: Symbolspans; KIMI: ⚠️ kommerzielle Lizenz | 2.548★, 2026-08-13 | **VERIFIZIERT** |
| KRLabsOrg/squeez | GPT/KIMI: Tool-Output-Pruner-Modell, GPU nötig | 23★, 2026-04-27 | **VERIFIZIERT** |
| fajarhide/omni (OMNI) | GPT: Cross-call Dedup-Ledger | 320★, 2026-08-13, „turns repeated bytes into retrievable handles" | **VERIFIZIERT** |
| edouard-claude/snip | GPT: YAML-Filter, Go-Proxy | 406★, 2026-08-04 | **VERIFIZIERT** |
| zdk/lowfat | GPT: kleiner Output-Filter | 566★, 2026-07-08 | **VERIFIZIERT** |
| jaredboynton/semtrim | GPT: konservativer Pipe-Wrapper | 0★, 2026-07-03 | **VERIFIZIERT** (existiert, winzig) |
| yoeld-wix/quiet-bash | GPT: lossless Spill | 5★, 2026-07-09 | **VERIFIZIERT** (existiert, winzig) |
| kmizu/token-saver-plugin | GPT: Rust, Guard/Dedup/Delta | 0★, 2026-08-06 | **VERIFIZIERT** (existiert, winzig) |
| IyadhKhalfallah/clauditor | GPT: Session-Rotation/Waste | 424★, 2026-04-16 | **VERIFIZIERT** |
| sliday/tamp (TAMP) | GPT: Kompressions-Proxy | 88★, 2026-07-26 | **VERIFIZIERT** |
| alexgreensh/token-optimizer | GPT: Audit-only-Kandidat | 1.859★, 2026-08-12 | **VERIFIZIERT** |
| MemPalace/mempalace | KIMI: 58.3k★, „44 MCP-Tools widerlegen 170-Token-Claim" | 58.331★, 2026-08-13, „best-benchmarked open-source AI memory system" — Tool-Anzahl-Detail nicht einzeln nachgeprüft | **VERIFIZIERT** (Kern), Detail TEILWEISE |
| multica-ai/andrej-karpathy-skills | KIMI: 201.9k★, CLAUDE.md-Verhaltensregeln | 201.959★, 2026-04-20 | **VERIFIZIERT** |
| sriinnu/clipforge-PAKT | GPT: lossless L1–L3 | 20★, 2026-08-13 | **VERIFIZIERT** |
| PCIRCLE-AI/toonify-mcp | KIMI: TOON-Plugin | 64★, 2026-08-12 | **VERIFIZIERT** |
| ojuschugh1/sqz | KIMI: „ehrlichster Mittelwert 24,7 %" | 593★, 2026-06-21 | **VERIFIZIERT** (Repo), Zahl aus README nicht erneut gemessen |
| mpecan/tokf | OPUS/KIMI: TOML-Filter-DSL | 192★, 2026-08-12 | **VERIFIZIERT** |
| 3rg0n/thlibo | KIMI: PreToolUse+updatedInput-Referenzarchitektur | 9★, 2026-08-12 | **VERIFIZIERT** |
| diegosouzapw/OmniGlyph | KIMI: PNG-Rendering, ⚠️ | 78★, 2026-08-03 | **VERIFIZIERT** |
| Capnjbrown/c0ntextKeeper | KIMI: Pre/PostCompact-Hooks | 62★, 2026-07-31 | **VERIFIZIERT** |
| karanb192/claude-code-hooks | KIMI/OPUS: Hook-Sammlung | 470★, 2026-08-04 | **VERIFIZIERT** |
| disler/claude-code-hooks-mastery | KIMI: „~5k★" | 3.886★, 2026-03-04 — Sternezahl leicht überschätzt | **VERIFIZIERT** (Abweichung ~20 %) |
| hesreallyhim/awesome-claude-code | KIMI: 52.2k★, Kuratierung | 52.222★, 2026-08-13 | **VERIFIZIERT** |
| revfactory/harness | MANUS: Teamdesign-Experiment | 8.746★, 2026-07-24 | **VERIFIZIERT** |
| xingkongliang/skills-manager | MANUS: Skills-Verteilung | 3.701★, 2026-08-12 | **VERIFIZIERT** |
| mohsen1/yek (ex bodo-run) | KIMI: „umbenannt bodo-run→mohsen1"; OPUS: bodo-run/yek | API-Redirect bodo-run/yek → mohsen1/yek, 2.470★ — KIMIs Umbenennungsnotiz korrekt | **VERIFIZIERT** (OPUS-Eintrag VERALTET im Namen) |
| coderamp-labs/gitingest | OPUS/KIMI: Repo-Extrakt | 15.295★, 2026-08-13 | **VERIFIZIERT** |
| mufeedvh/code2prompt | OPUS/KIMI | 7.597★, 2026-06-29 | **VERIFIZIERT** |
| simonw/files-to-prompt | KIMI: „stale 2025-02" | 2.774★, letzter Push 2025-02-19 — Urteil korrekt | **VERIFIZIERT** (stale korrekt erkannt) |
| sergioramosv/squeezr | GPT (Proxy-Pilot) / KIMI | 34★, 2026-07-21 | **VERIFIZIERT** |
| alibaizhanov/densely | KIMI: lossless 2–8×, sha256 | 6★, 2026-08-12 | **VERIFIZIERT** |
| omar-y-abdi/furl-ctx | KIMI: Retrievable Compression | 3★, 2026-08-12 | **VERIFIZIERT** |
| jee599/contextzip | KIMI: Rust-Proxy | 23★, 2026-06-03 | **VERIFIZIERT** |
| severity1/claude-code-prompt-improver | KIMI: 1.8k★, Prompt-Hygiene-Hook | 1.850★, 2026-06-03 | **VERIFIZIERT** |
| severity1/claude-code-auto-memory | KIMI: CLAUDE.md-Sync im Subagent | 155★, 2026-04-18 | **VERIFIZIERT** |
| egorfedorov/claude-context-optimizer | KIMI: ROI-Tracking-Plugin | 92★, 2026-08-11 | **VERIFIZIERT** |
| 0xhimanshu/governor | KIMI: Usage-Governor | 127★, 2026-06-20 | **VERIFIZIERT** |
| rupaut98/unforget | KIMI: SessionStart-Re-Injection | 3★, 2026-07-30 | **VERIFIZIERT** |
| yifanzz/claude-code-boost | KIMI/OPUS: Auto-Approval-Hook | 164★, 2026-03-21 | **VERIFIZIERT** |
| mibayy/token-savior | KIMI/ABACUS: MCP-Kombi | 1.113★, 2026-08-10 | **VERIFIZIERT** |
| nadimtuhin/claude-token-optimizer | ABACUS | 550★, 2026-08-11 | **VERIFIZIERT** |
| nooscraft/tokuin | ABACUS | 142★, 2026-07-14 | **VERIFIZIERT** |
| ramakay/claude-self-reflect | KIMI/ABACUS | 221★, 2026-08-10 | **VERIFIZIERT** |
| jia-gao/leanctx | KIMI/ABACUS: SDK-Wrapper | 316★, 2026-08-12 | **VERIFIZIERT** |
| zippoxer/recall | KIMI: „stagniert 2026-01" | 194★, Push 2026-01-14 — Urteil korrekt | **VERIFIZIERT** |
| chiphuyen/sniffly | KIMI: ❌ stale | 1.261★, Push 2025-08-08 — Urteil korrekt | **VERIFIZIERT** |
| tkaufmann/claude-gemini-bridge | KIMI: ❌ stale seit 2025-08 | 406★, Push 2025-08-17 — Urteil korrekt | **VERIFIZIERT** |
| philipp-spiess/claude-code-costs | KIMI: ❌ obsolet (→ ccusage) | 203★, Push 2025-06-16 — plausibel | **VERIFIZIERT** |

## 2. Halluzinierte / nicht gefundene Repos

**Keine einzige echte Halluzination gefunden.** Von ~95 per GitHub-API direkt geprüften Repos existierten **alle** — inklusive der auf den ersten Blick unwahrscheinlichen Einträge (ponytail 101k★, caveman 97k★, andrej-karpathy-skills 201k★, MemPalace 58k★, graphify 105k★). KIMIs Behauptung „per GitHub-API verifiziert" ist glaubwürdig: Die Sternezahlen stimmten in ~60 Fällen fast exakt (Abweichungen <1 %).

**Einziger echter Fehlerfall (Umbenennung, nicht Halluzination):**
- `NodeNestor/nestor-lean` (GPT55SOL Shortlist, „monolithischer Input-Arm") → Repo wurde umbenannt in **`NodeNestor/claude-lean-context`** (1★, Push 2026-08-11, „read dedup-by-reference, codemap…" — Mechanik-Beschreibung von GPT passt). GPT-Katalog: **VERALTET im Namen**.
- `bodo-run/yek` → `mohsen1/yek` (KIMI hat die Umbenennung korrekt dokumentiert; OPUS führt noch den alten Namen).

**Detail-Ungenauigkeiten (kein Existenzproblem):**
- KIMI: squeez „7 CLI-Hosts" → README sagt 5.
- KIMI: disler/claude-code-hooks-mastery „~5k★" → real 3.886★.
- KIMI: MemPalace „44 MCP-Tools = 4,4–8,6k Tokens/Session" — Repo verifiziert, die konkrete Tool-Zahl habe ich nicht unabhängig nachgezählt (TEILWEISE).

## 3. Neue Repos, die in KEINEM Agent-Output stehen (GitHub-Suche, 2026-08-13)

Geprüft gegen die Vereinigungsmenge aller 397 im Agent-Korpus genannten Repos:

| Repo | ★ | Letzter Push | Was es tut |
|---|---:|---|---|
| junhoyeo/tokscale | 4.926 | 2026-08-13 | Token-Usage-Tracking über Agents, globale Leaderboards |
| kenn-io/agentsview | 4.798 | 2026-08-13 | Lokale Session-Suche + Token-Statistiken für Coding-Agents |
| matt1398/claude-devtools | 3.824 | 2026-05-13 | „DevTools für Claude Code": Session-Logs, Tool-Calls, Token-Usage, Subagent-Inspection |
| graykode/abtop | 3.442 | 2026-07-27 | „htop für AI-Agents": Live-Monitoring Sessions/Tokens/Kontext |
| giancarloerra/SocratiCode | 3.248 | 2026-08-05 | Codebase-Intelligence (Enterprise-Monorepos), Plugin/Skill, lokal |
| russelleNVy/three-man-team | 931 | 2026-06-09 | 3-Agent-Team (Architect/Builder/Reviewer) mit Token-Fokus |
| tzachbon/smart-ralph | 510 | 2026-07-23 | Spec-driven Plugin mit „smart compaction" |
| u-ichi/compact-plus | 189 | 2026-07-27 | Plugin: State um /compact herum sichern + wiederherstellen |
| kevin-hs-sohn/hipocampus | 159 | 2026-06-08 | 3-Tier-Memory + Compaction-Tree als Drop-in-Harness |
| vishal2612200/agentpack | 23 | 2026-08-12 | Lokale Context-Engine, routet Tasks zu relevanten Dateien |
| jianzhichun/permafrost | 20 | 2026-06-23 | Frieren des Prompt-Präfix für DeepSeek-Auto-Cache (Alignment-Proxy) |

Anmerkung: Die Agents decken die Kernlandschaft gut ab; die Lücken liegen v. a. bei **Mess-/Observability-Tools der zweiten Reihe** (tokscale, agentsview, abtop, claude-devtools) und bei **Compact-State-Preservation** (compact-plus, smart-ralph) — letzteres thematisch nah an GPTs session-economy/Magic-Compact-Spur.

## 4. Claude-Code-Fakten-Check (gegen offizielle Doku-Sekundärquellen, Stand 2026)

### Bestätigt ✅
- **Hook-Events:** Die von den Agents genutzten Events existieren alle: PreToolUse, PostToolUse, UserPromptSubmit, SessionStart, Stop, SubagentStop, PreCompact, SessionEnd, Notification. Stand Mitte 2026 dokumentiert die Referenz **~30 Events** (neu u. a. PostToolUseFailure, PostToolBatch, PermissionRequest/Denied, PostCompact, Setup, TaskCreated/Completed, FileChanged, ConfigChange, InstructionsLoaded, WorktreeCreate/Remove, TeammateIdle). Quellen: code.claude.com/docs/en/hooks (zitiert via tkellogg/lanius, morphllm.com, claudefa.st).
- **JSON-Interface:** stdin-Payload (session_id, transcript_path, cwd, hook_event_name, tool_name/tool_input), Antwort via Exit-Code **oder** stdout-JSON. ✅
- **permissionDecision:** `allow|deny|ask|defer` innerhalb von `hookSpecificOutput` (PreToolUse); plus `permissionDecisionReason`, **`updatedInput`** (Input-Rewrite) und auf PostToolUse **`updatedToolOutput`** (Output-Replacement). Exit 2 = Block (stderr→Claude), Exit 0+JSON, andere Codes = non-blocking. „Hooks können verschärfen, nie lockern." ✅
- **„bash-dump-guard als PostToolUse-Bash-Hook" (GPT55SOL):** Technisch **kontrakt-konform** — PostToolUse feuert auf Bash-Outputs, kann via `updatedToolOutput` die sichtbare Ausgabe ersetzen und via `additionalContext` Kontext injizieren. GPTs Beispiel-Config (`claude-code-hooks.example.json`) nutzt ausschließlich dokumentierte Events/Felder. Einzige Einschränkung: PostToolUse „kann den Tool-Call nicht ungeschehen machen" — die Output-Kürzung greift also erst nach Ausführung, was GPT selbst so beschreibt („Post-execution, Originalbefehl/Permission unverändert"). **Aussage VERIFIZIERT.**
- **Kontextfenster:** Opus 4.5/Sonnet 4.5: 200K; Opus 4.6/4.7 & Sonnet 4.6: **1M GA** (seit ~2026-03 ohne Preisaufschlag). Auto-Compact, `/compact`, `/clear` existieren. ✅
- **MCP Tool Search:** `defer_loading` + tool_search_tool (regex/BM25), offiziell **~85 % weniger Tool-Definitions-Tokens** (77K→8,7K); Code Execution with MCP ~98,7 % in Anthropics Beispiel; Claude-Code-seitig `ENABLE_TOOL_SEARCH` (auto/true). ✅ (KIMI/MANUS „Toolsuche" korrekt)
- **Subagents:** eigene Kontextfenster, isoliert, Ergebnis-Rückgabe — ✅ (KIMI/MANUS korrekt)
- **Prompt Caching:** automatisch in CC; `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` spart laut cache-fix-README ~1.800 Tokens/Call und verhindert Cache-Bust durch git-status — KIMIs Schicht-10-Behauptung exakt so im README des verifizierten cache-fix-Repos belegt. ✅

### Falsch/überzogen ❌
- Keine hart falschen technischen Behauptungen in den Kern-Dokumenten gefunden. Zwei Einordnungen:
  - **OPUS5_MAX** tituliert seine 75 „discovery-only"-Einträge ehrlich als unverifiziert — Stichprobe (10 Repos: token_saver_ClaudeCode, TokenMasterX, cmo, Glance, ward, skinny-jeans, loobster, ctxguard, ASK-Claude-Token-Optimizer u. a.) existiert **komplett**, also keine erfundene Long-Tail, aber auch keine echte Prüfung dahinter.
  - Hook-Event-Listen in älteren Tutorials (8–9 Events) sind überholt; Agents, die nur die klassischen 9 nennen, sind nicht falsch, aber unvollständig gegenüber dem 2026er Stand (30 Events; PreCompact kann inzwischen **blocken**).

## 5. Gesamteinschätzung: Validität der Kataloge

1. **KIMI_AGENT — am validesten.** Sternezahlen/Push-Daten stimmen praktisch exakt mit der GitHub-API überein; unabhängige Evidenz korrekt zitiert (JetBrains-Serie caveman/rtk/ponytail — alle drei Zahlen exakt wiedergegeben); Umbenennungen, Namens-Doppelgänger und Stale-/Obsolet-Urteile stimmen (yek, sniffly, gemini-bridge, files-to-prompt, claude-code-otel, recall). Einzige Fehler: Detailungenauigkeiten (squeez 5 vs 7 Hosts, hooks-mastery 3,9k vs „~5k").
2. **OPUS5_MAX — ehrlich, breit, flach.** Keine Halluzinationen in der Stichprobe, sauberes Evidenz-Labeling (discovery-only/deep-audit), aber die Long-Tail ist ungeprüfter Listenabgleich; ein veralteter Name (bodo-run/yek).
3. **GPT55SOL_PRO — valide Substanz, eigener Bau statt Breite.** Alle Shortlist-Repos existieren; Hook-Architektur (bash-dump-guard via PostToolUse/`updatedToolOutput`) ist offiziell kontrakt-konform; aber ein umbenanntes Repo (nestor-lean → claude-lean-context) und keine Fremdbelege.
4. **MANUS_AGENT — valide, konservativ.** Alle 20 Matrix-Repos existieren und passen zur Beschreibung; Schwäche: claw-compactor und claude-code-otel werden trotz nachweislicher Inaktivität (Push 2026-04 bzw. 2025-06) noch als Pilot-/Referenzkandidaten geführt — ein KIMI-artiger Stale-Check fehlt.
5. **ABACUS_AGENT — nicht primär geprüft** (nur Repo-Namen extrahiert): erwähnte Repos existieren (Stichprobe 12/12), spiegelt weitgehend dieselbe Landschaft.
