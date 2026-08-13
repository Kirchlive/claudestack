# Verifikation bekannter Repo-Liste: Claude-Code-Token-Minimierung (Wide-Scan)

Stand: 2026-08-13 · Methode: GitHub-REST-API (`api.github.com/repos/...`) für Metadaten aller 31 Repos, README-Analyse (raw.githubusercontent.com) für jedes existierende Repo, 20 eigenständige Web-Suchen (Vergleiche, Forks/Umbenennungen, unabhängige Benchmarks).

## Facet: Verifikation bekannte Repo-Liste

**Ergebnis in Kürze:** Alle 31 Listeneinträge existieren (kein einziger 404). Zwei Repos wurden **umbenannt** und liefern HTTP 301: `chopratejas/headroom` → `headroomlabs-ai/headroom` und `bodo-run/yek` → `mohsen1/yek`. Namens-Dubletten sind echte Doppelgänger mit unterschiedlichen Projekten: `claudioemmanuel/squeez` ≠ `KRLabsOrg/squeez`, und `chopratejas/headroom` (= headroomlabs-ai) ≠ `RonnieTheTester/headroom-meter` (ein Dashboard *für* Headroom). Wichtigster Befund: Die unabhängige JetBrains-Benchmark-Serie (Juli 2026, SkillsBench, gepaarte A/B-Runs) widerlegt die Werbeclaims der zwei populärsten Tools — **rtk** (beworben −60–90 %, gemessen **+7,6 % teurer** bei niedrigem Reasoning-Effort) und **caveman** (beworben −65 %, gemessen **−8,5 %**); nur **ponytail** zeigte dort einen statistisch soliden Kostenvorteil (−10,3 %). [^2^][^3^][^4^]

### Repo-Matrix

| # | Repo (kanonisch) | Status | Zweck (1 Satz) | Integration | Behauptete Ersparnis | Evidenz | Relevanz | Deep-Dive? |
|---|---|---|---|---|---|---|---|---|
| 1 | headroomlabs-ai/headroom (ex chopratejas) | aktiv, umbenannt | Komprimiert Tool-Outputs/Logs/Dateien/RAG vor dem LLM | Library + Proxy + MCP + `headroom wrap claude` | 15–20 % (Coding-Agenten), 60–95 % (JSON) | mittel-hoch (eigene Benchmarks + Genauigkeitstabellen) | **Kern** | **Ja** |
| 2 | rtk-ai/rtk | aktiv, sehr populär (76k★) | CLI-Proxy filtert Bash-Output vor dem Agenten | Claude-Code-Hook (PreToolUse) + CLI | 60–90 % Bash-Output | **niedrig** (JetBrains: +7,6 % Kosten; eigene Zählung irreführend) | **Kern** | **Ja** (Claim-Widerlegung) |
| 3 | mksglu/context-mode | aktiv (19,8k★) | MCP-Server: sandboxt Tool-Output, persistiert Session-Memory | MCP + Hooks + Plugin (17 Plattformen) | 98 % auf Tool-Output, ~60–98 % sessionabhängig | mittel (eigene Benchmarks, plausibles Design) | **Kern** | **Ja** |
| 4 | teamchong/pxpipe | aktiv (7,1k★) | Rendert sperrigen Kontext als PNG-Bilder (Vision-Kanal billiger) | Lokaler Proxy (`ANTHROPIC_BASE_URL`) | ~59–70 % End-to-End-Rechnung | mittel (unabhängige Presse, ehrliche Limitationen; Autoren-Benchmarks) | **Kern** | **Ja** |
| 5 | claudioemmanuel/squeez | aktiv (182★) | Hook-basierter Token-Kompressor für 7 AI-CLI-Hosts inkl. Claude Code | Hooks + MCP (squeez_retrieve) | bis 95 % Bash-Output | mittel (detailliertes README, keine Extrem-Claims) | **Kern** | Ja |
| 6 | KRLabsOrg/squeez | aktiv (23★) | Feingetuntes Qwen-3.5-2B-Modell schneidet Tool-Output auf relevante Zeilen | CLI-Pipe / Python-Lib / vLLM | 87–92 % Kompression, 0,80 F1 | **hoch** (arXiv-Paper, HF-Modell+Dataset) | **Kern** | Ja (akademisch) |
| 7 | ojuschugh1/sqz | aktiv (593★) | Rust-Binary komprimiert Kommando-Output vorm LLM | CLI/Hooks | 24,7 % Ø, bis 92 % (Dedup) | niedrig-mittel (nur Eigenmessung, aber bescheidene Zahl) | **Kern** | Nein |
| 8 | colbymchenry/codegraph | aktiv (66k★) | Vorindizierter Code-Knowledge-Graph ersetzt Datei-Exploration | MCP-Server (Auto-Setup für 9 Agenten) | 62 % weniger Tokens, 88 % weniger Tool-Calls | mittel-hoch (saubere Methodik inkl. Kontaminations-Block + ehrliches Residual-Caveat) | **Kern** | **Ja** |
| 9 | manojmallick/sigmap | aktiv (614★) | Deterministische Signatur-Maps (TF-IDF, 33 Sprachen) statt Agentic-Grep | MCP-Server + CLI | 96,8 % Token-Reduktion (21 Repos) | mittel (reproduzierbarer Benchmark, aber „modeled" Task-Metriken) | **Kern** | Ja |
| 10 | agiwhitelist/tokdiet | aktiv (33★) | Lokaler Reverse-Proxy mit Context-Governor + Qualitätsnachweis | Proxy (Claude Code, Cursor, Codex) | −71 % Input-Tokens bei Qualitätsparität | mittel (66-Task-A/B-Benchmark, reproduzierbar, klein) | **Kern** | **Ja** |
| 11 | fkiene/llmtrim | aktiv (208★) | Lokaler Proxy komprimiert API-Requests, Net-win-Gate pro Stufe | Proxy (npm/brew) | −31 % Input, −74 % Output, −66 % Kosten | niedrig-mittel (Eigenmessung; Safety-Gates plausibel) | **Kern** | Nein |
| 12 | jia-gao/leanctx | aktiv (316★) | Drop-in-Prompt-Kompression für produktive LLM-Apps (SDK-Wrapper) | Python-Library (OpenAI/Anthropic/Gemini) | 10–40 % (LongBench v2: +18,7 pp auf bestehendem Kompressor) | mittel-hoch (per-item Daten im Repo committet) | **Kern** (Lib, nicht CC-spezifisch) | Ja |
| 13 | Madhan230205/token-reducer | aktiv (42★) | Lokale Hybrid-RAG-Pipeline (BM25+ONNX, AST-Chunking) als CC-Plugin | Claude-Code-Plugin (Marketplace) | 90–98 % | **niedrig** (keine unabhängige Evidenz, wenig Adoption) | **Kern** | Nein |
| 14 | PCIRCLE-AI/toonify-mcp | aktiv (64★) | CC-Plugin: trimmt JSON/YAML/Stacktraces via TOON-Encoding | Claude-Code-Plugin + MCP + CLI | „compresses what's safe", pass-through sonst | niedrig-mittel (kein %-Claim im README-Kopf, konservatives Design) | **Kern** | Nein |
| 15 | sriinnu/clipforge-PAKT | aktiv (20★) | Lossless-first-Kompression für JSON/YAML/CSV/MD (L1–L3 verlustfrei, L4 opt-in) | Library + CLI + MCP + Desktop | 27–33 % typisch (JSON), 57–69 % Logs/Text | mittel (ungewöhnlich ehrliche Gegenbeispiele: +25 % bei Config) | **Kern** | Nein |
| 16 | NodeNestor/claude-rolling-context | aktiv (27★) | Transparenter Proxy: rollende Kompression alter Nachrichten, recente bleiben verbatim | CC-Plugin + Proxy (:5588) | Kostenwachstum quadratisch→linear; ~9× günstigere Cold-Turns | mittel (durchdachte Cache-Ökonomie, keine Extrem-Claims) | **Kern** | **Ja** |
| 17 | JuliusBrussee/caveman | aktiv (98k★) | Skill zwingt Agenten zu Terse-„Caveman"-Prosa (Output-Seite) | Skill + Hooks + CLI (30+ Agenten) | 65 % Output-Tokens (Chat-Prosa) | **hoch (widerlegt)**: JetBrains maß 8,5 % auf agentischen Tasks | **Kern** (aber überschätzt) | Ja (als Warnstudie) |
| 18 | DietrichGebert/ponytail | aktiv (101k★) | Skill: Agent schreibt minimalen Code (YAGNI), „best code is no code" | Claude-Code-Plugin/Skill | −54 % Code, −22 % Tokens, −20 % Kosten | **hoch (teils bestätigt)**: JetBrains maß −15 % Code, −10,3 % Kosten (p=0,004) | **Kern** | **Ja** (einziger positiver JetBrains-Befund) |
| 19 | open-compress/claw-compactor | aktiv (2,1k★, letzter Push 2026-04) | 14-stufige deterministische Kompressions-Pipeline (AST, JSON-Sampling, Dedup) | Python-Lib + OpenClaw-Skill | 15–82 % je nach Content; Ø 36 % | mittel (1600+ Tests, Audit 84/100; etwas stale) | **Kern** (OpenClaw-Fokus) | Nein |
| 20 | toon-format/toon | aktiv (25k★) | TOON: token-effizientes JSON-Serialisierungsformat | Library + CLI (`@toon-format/cli`) | ~42,6 % weniger Tokens als JSON bei gleicher Retrieval-Accuracy | mittel-hoch (Benchmarks im Repo, ehrliche „when not to use") | Peripherie→Kern (Baustein) | Ja |
| 21 | microsoft/LLMLingua | aktiv (6,5k★, Push 2026-04) | Referenz-Bibliothek für Prompt-Kompression (LLMLingua/2/LongLLMLingua) | Python-Library (EMNLP'23/ACL'24) | bis 20× Kompression, minimaler Qualitätsverlust | **hoch** (peer-reviewed; unabhängige Studien zeigen aber Risiken bei strukturierten Daten/Code) | Peripherie (Technologie, kein CC-Tool) | Ja |
| 22 | BlockRunAI/ClawRouter | aktiv (6,6k★) | Agent-nativer LLM-Router (70 Modelle, USDC/x402), routet zum billigsten fähigen Modell | OpenClaw-Plugin/Router | bis 88 % **Kosten** (Routing, nicht Kompression) | niedrig-mittel (Kosten-Claim ≠ Token-Claim) | Peripherie | Nein |
| 23 | multica-ai/andrej-karpathy-skills | aktiv (202k★, Push 2026-04) | CLAUDE.md/Plugin mit Karpathy-Prinzipien gegen LLM-Coding-Fehlmodi | Claude-Code-Plugin / CLAUDE.md | kein Token-Claim (indirekt: weniger Over-Engineering/Drift) | mittel (Qualitätsfokus, Agentiquette 61/100) | Peripherie | Nein |
| 24 | Aider-AI/aider | aktiv (48k★) | Vollwertiges AI-Pair-Programming-Tool (kein Token-Minimierer) | Standalone-CLI | repo-map mit `map-tokens`-Budget, `.aiderignore`, Prompt-Caching | hoch (etabliert, dokumentiert) | Peripherie | Nein |
| 25 | yamadashy/repomix | aktiv (28k★) | Packt Repo in eine AI-freundliche Datei; `--compress` via Tree-sitter | CLI (+ MCP) | Reduktion durch Struktur-Extraktion (kein %-Claim) | mittel | Peripherie | Nein |
| 26 | coderamp-labs/gitingest | aktiv (15k★) | GitHub-URL → prompt-freundlicher Codebase-Extrakt | CLI/Web (`pip install gitingest`) | kein Spar-Claim (Packaging) | mittel | Peripherie | Nein |
| 27 | mufeedvh/code2prompt | aktiv (7,6k★) | Codebase → einzelner LLM-Prompt mit Templating + Token-Count | CLI (Rust) | kein Spar-Claim (Packaging) | mittel | Peripherie | Nein |
| 28 | simonw/files-to-prompt | aktiv (2,8k★, **Push 2025-02**) | Konkateniert Verzeichnisse in einen Prompt | CLI | kein Spar-Claim (Packaging) | hoch (Simon Willison, aber unbewegt) | Peripherie | Nein |
| 29 | mohsen1/yek (ex bodo-run) | aktiv, umbenannt (2,5k★) | Schneller Rust-Serialisierer Repo→Prompt (230× schneller als repomix) | CLI | kein Spar-Claim (Speed-Claim) | mittel | Peripherie | Nein |
| 30 | ZongqianLi/500xCompressor | aktiv (64★, ACL 2025) | Forschung: 500 NL-Tokens → 1 Spezial-Token (KV-basiert) | Research-Code (nicht deploybar für Claude) | 6×–480×, 62–73 % QA-Erhalt | hoch (ACL-Main-Paper) — aber **für CC irrelevant** (braucht Modellgewichte) | Irrelevant (für Claude Code) | Nein |
| 31 | RonnieTheTester/headroom-meter | aktiv (6★) | Live-Terminal-Dashboard, das Headroom-Kompression sichtbar macht | TUI/Observability über Headroom | spart selbst nichts (Messung) | niedrig (klein, neu) | Peripherie | Nein |

Legende Evidenz: hoch = peer-reviewed oder unabhängiger Benchmark; mittel = dokumentierte, reproduzierbare Eigenbenchmarks; niedrig = Marketing-Claim ohne belastbare Prüfung. Stars/Push/Lizenz: GitHub-API, 2026-08-13. [^1^]

### Detailprofile

#### 1. headroomlabs-ai/headroom (umbenannt von chopratejas/headroom)
- **URL:** https://github.com/headroomlabs-ai/headroom · **Status:** aktiv (alter Name liefert HTTP 301 → neuer Org-Name; Issue-History blieb unter altem Pfad erreichbar) [^1^][^5^]
- **Zweck:** Komprimiert alles, was ein AI-Agent liest (Tool-Outputs, Logs, RAG-Chunks, Dateien, Konversationshistorie), bevor es das LLM erreicht.
- **Token-Spar-Mechanismus:** Content-aware Kompressoren (AST für Code, statistisches Sampling für JSON), reversibel via Retrieve-Tool; zusätzlich Output-Token-Reduktion (trimmt, was das Modell zurückschreibt) und Cross-Agent-Memory mit Dedup.
- **Integration:** Python/TS-Library (`compress(messages)`), CLI-Wrapper `headroom wrap claude|codex|cursor|aider|...`, MCP-Server (`headroom_compress/retrieve/stats`).
- **Installation:** `pip install headroom` dann `headroom wrap claude` · **Stars:** 66.087 · **Push:** 2026-08-12 · **Lizenz:** Apache-2.0 [^1^]
- **Behauptete Ersparnis:** „60–95 % fewer tokens (JSON), 15–20 % fewer tokens (coding agents)"; eigene Workload-Tabelle: 92 % bei Code-Search/Incident-Debugging, 47 % bei Codebase-Exploration; Genauigkeit auf GSM8K/TruthfulQA unverändert. [^5^]
- **Evidenzqualität:** mittel-hoch (eigene, reproduzierbare Evals `python -m headroom.evals`; unabhängige Bestätigung fehlt, aber Claims sind moderat und gegliedert).
- **Relevanz:** Kern. **Deep-Dive: Ja** — größtes und aktivstes Kompressions-Projekt der Liste, mehrere Integrationsflächen, Dach-Ökosystem (headroom-meter, headroom-desktop).

#### 2. rtk-ai/rtk
- **URL:** https://github.com/rtk-ai/rtk · **Status:** aktiv, 75.916★ [^1^]
- **Zweck:** Hochperformanter CLI-Proxy (Rust, Single-Binary), der Bash-Output filtert/gruppiert/dedupliziert/kürzt, bevor der Agent ihn liest (100+ Kommandos).
- **Token-Spar-Mechanismus:** PreToolUse-Hook rewrite `git status` → `rtk git status`; Smart-Filter/Grouping/Truncation/Dedup; `rtk gain` Analytics. **Relevanz für Claude Code:** Kern — aber strukturell begrenzt: Hook sieht nur Bash-Calls; Read/Grep/Glob umgehen ihn (steht so im README). [^14^]
- **Integration:** Claude-Code-Hook + CLI (15 Agenten). **Installation:** `brew install rtk && rtk init -g` · **Push:** 2026-08-12 · **Lizenz:** Apache-2.0
- **Behauptete Ersparnis:** 60–90 % des Bash-Outputs (README betont selbst: „not the same as cutting your bill"); 30-Min-Demo-Session 118k→24k Tokens. [^14^]
- **Evidenzqualität:** **niedrig bzw. unabhängig widerlegt** — JetBrains (86 gepaarte SkillsBench-Tasks, Claude Sonnet 5): **+7,6 % teurer** bei niedrigem Effort (p=0,004), ±0 % bei hohem Effort, Qualität unverändert; theoretisches Savings-Cap ≈3 % des Inputs, weil nur ~20 % des Kontexts überhaupt durch den Hook laufen; `rtk gain` meldete 96,2 M „gesparte" Tokens, während die Rechnung stieg (falsches Counterfactual: Claude Code kürzt Riesen-Outputs ohnehin). [^2^] Gegenstimme: Soba Labs maß 49,6 % auf den *gerouteten Kommandos* (nicht der Gesamtrechnung). [^14^]
- **Deep-Dive: Ja** — populärstes Tool der Liste mit der schärfsten Claim-Realitäts-Lücke; ideale Fallstudie „self-reported savings ≠ bill".

#### 3. mksglu/context-mode
- **URL:** https://github.com/mksglu/context-mode · **Status:** aktiv, 19.825★, Push 2026-08-12, Lizenz NOASSERTION [^1^]
- **Zweck:** MCP-Server für Context-Window-Optimierung: sandboxt große Tool-Outputs, persistiert Session-Memory in SQLite/FTS5 (überlebt /compact), erzwingt „Think in Code"-Routing.
- **Token-Spar-Mechanismus:** Raw-Daten bleiben aus dem Fenster (315 KB → 5,4 KB), BM25-Abruf nur bei Bedarf; Routing-Regeln + PreToolUse-Blocks für High-Flood-Tools; Statuszeile mit $-Ersparnis.
- **Integration:** Claude-Code-Plugin (Marketplace, Slash-Commands `/ctx-*`) + MCP + Hooks; 17 Plattformen (Gemini CLI, Cursor, Codex, Kiro, Zed, ...). **Installation:** `npm install -g context-mode` + Plugin-Install bzw. `claude mcp add context-mode -- npx -y context-mode`. [^8^]
- **Behauptete Ersparnis:** 95–100 % auf einzelnen Tool-Outputs (Playwright-Snapshot 99 %, Access-Log 100 %), session-weit „~98 % mit Hooks, ~60 % ohne" (Routing-Compliance-Tabelle). [^8^]
- **Evidenzqualität:** mittel (21 dokumentierte Szenarien, aber Eigenmessung; 98 %-Zahl bezieht sich auf Output-Sandboxing, nicht End-to-End-Rechnung).
- **Relevanz:** Kern. **Deep-Dive: Ja** — einziges Tool, das Kompression + Session-Persistenz + Routing-Enforcement kombiniert; hohe Adoption.

#### 4. teamchong/pxpipe
- **URL:** https://github.com/teamchong/pxpipe · **Status:** aktiv, 7.063★, Push 2026-08-12, MIT [^1^]
- **Zweck:** Lokaler Proxy, der sperrige Kontextblöcke (Systemprompt, Tool-Docs, alte Historie) als PNG-Bilder rendert — Bildtokens kosten fix nach Pixeln, nicht nach Textmenge (~3,1 Zeichen/Bildtoken vs. ~1 Zeichen/Texttoken).
- **Token-Spar-Mechanismus:** Profitability-Gate imaget nur, wenn die Mathematik aufgeht; exakte Strings (Hashes, IDs) bleiben Text; Modelle mit nachgewiesener Lesegüte per Allowlist (Fable 5, GPT-5.6 default; Opus 4.7/4.8 opt-in wegen ~7 % Misreads).
- **Integration:** Proxy via `ANTHROPIC_BASE_URL=http://127.0.0.1:47821` oder `pxpipe warp -- claude`. **Installation:** `npx pxpipe-proxy`. [^6^]
- **Behauptete Ersparnis:** ~59–70 % niedrigere End-to-End-Rechnung auf Fable-5-Workflows; Demo $42,21 → $6,06; SWE-bench Lite 10/10 beide Arme bei −65 % Request-Größe, Pro 14/19 vs. 15/19. [^6^][^7^]
- **Evidenzqualität:** mittel — unabhängige Presse (The Decoder, wavect, Zylos), ungewöhnlich ehrliche Limitationen (Hex-Recall 13/15 Fable, **0/15 Opus**, „silent confabulations"), aber Benchmarks autorengesteuert, kleine n. [^7^]
- **Relevanz:** Kern. **Deep-Dive: Ja** — methodisch einzigartiger Ansatz (optische Kontextkompression, DeepSeek-OCR-Linie), höchstes Sparpotenzial bei klar dokumentiertem Korrektheitsrisiko.

#### 5. claudioemmanuel/squeez
- **URL:** https://github.com/claudioemmanuel/squeez · **Status:** aktiv, 182★, Push 2026-08-12, Apache-2.0, Rust [^1^]
- **Zweck:** End-to-End-Hook-Kompressor für sieben AI-CLI-Hosts (Claude Code, Copilot CLI, OpenCode, Gemini CLI, Codex CLI, Pi, Hermes).
- **Token-Spar-Mechanismus:** PreToolUse-Hook-Pipeline (Smart-Filter → Dedup → Log-Templates → Relevanz-Truncation) bis 95 % auf Bash; reversible Kompression mit content-addressed Blob + `squeez_retrieve` MCP-Tool; **Net-win-Gate** (Kompression <24 Tokens Ersparnis → Passthrough); adaptive Intensität je nach Budgetdruck; Terse-Prompt-Persona. [^13^]
- **Integration:** Hooks + MCP + CLI. **Installation:** `npm install -g squeez` (auch `cargo install squeez`).
- **Behauptete Ersparnis:** „up to 95 %" auf Bash-Output; keine Session-Gesamtzahl — bewusst konservativ.
- **Evidenzqualität:** mittel (detaillierte Mechanik-Doku, defensive Design-Entscheide; keine unabhängige Messung).
- **Relevanz:** Kern. **Deep-Dive: Ja ( zweite Reihe)** — technisch ausgereiftester Hook-Kompressor nach rtk, mit Retrieve-Rückversicherung; guter Vergleichskandidat zu rtk/sqz.

#### 6. KRLabsOrg/squeez (Namens-Doppelgänger!)
- **URL:** https://github.com/KRLabsOrg/squeez · **Status:** aktiv, 23★, Push 2026-04-27, Apache-2.0 [^1^]
- **Zweck:** Task-konditioniertes Tool-Output-Pruning: ein feingetuntes **Qwen-3.5-2B** (LoRA, vLLM) extrahiert nur die aufgabenrelevanten Zeilen; alternative extraktive ModernBERT-Variante.
- **Token-Spar-Mechanismus:** Generatives Modell emittiert verbatim `<relevant_lines>`; schlägt den 18× größeren Qwen-3.5-35B-A3B um 11 Recall-Punkte bei gleicher Kompression. [^12^]
- **Integration:** CLI-Pipe, Python-Lib, vLLM-Server; README-Sektion „Use with Claude Code". **Installation:** `pip install squeez` (+ `pip install vllm`).
- **Behauptete Ersparnis:** 87–92 % Kompression bei 0,80 F1 (Beispiel: nur failing test + Traceback überleben). [^12^]
- **Evidenzqualität:** **hoch** — arXiv-Paper (2604.04979), HF-Modell + Dataset, Baselines (BM25/First-N/Last-N/Random). Aber: braucht GPU/Modell-Hosting → Betriebskosten.
- **Relevanz:** Kern (Modell-Ansatz). **Deep-Dive: Ja** — einziger modellbasierter Output-Pruner mit Paper; Kontrast zu den regelbasierten Hook-Tools.

#### 7. ojuschugh1/sqz
- **URL:** https://github.com/ojuschugh1/sqz · **Status:** aktiv, 593★, Push 2026-06-21, Lizenz NOASSERTION, Rust [^1^]
- **Zweck:** Single-Rust-Binary, das Kommando-Output komprimiert, bevor er das LLM erreicht (zero config).
- **Token-Spar-Mechanismus:** Dedup (92 % bei wiederholten File-Reads), Shell/Git-Filter (86 %), wöchentliche Spar-Statistik. [^29^]
- **Installation:** `curl -fsSL .../install.sh | sh` oder `npm install -g sqz-cli` / `brew install sqz`.
- **Behauptete Ersparnis:** **24,7 % durchschnittliche Reduktion über 3.003 reale Kompressionen** — die ehrlichste Durchschnittszahl der Liste.
- **Evidenzqualität:** niedrig-mittel (nur Eigenmessung, aber realistische Größenordnung deckt sich mit JetBrains-Deckel-Analyse für Hook-Tools).
- **Relevanz:** Kern. **Deep-Dive: Nein** (Feature-Subset von squeez/rtk; als Realitätsanker für Durchschnittswerte nützlich).

#### 8. colbymchenry/codegraph
- **URL:** https://github.com/colbymchenry/codegraph · **Status:** aktiv, 66.100★, Push 2026-08-08, MIT, C [^1^]
- **Zweck:** Vorindizierter Code-Knowledge-Graph (Tree-sitter → SQLite/FTS5, File-Watcher-Sync): Der Agent fragt den Graphen statt Dateien zu crawlen.
- **Token-Spar-Mechanismus:** Ersetzt Discovery-Traffic (bis 43 Tool-Calls/19 File-Reads) durch 1–4 `codegraph_explore`-Aufrufe; File-Reads auf null auf allen 7 Benchmark-Repos. [^11^]
- **Integration:** MCP-Server, Auto-Setup für Claude Code, Cursor, Codex CLI, OpenCode, Gemini, Copilot u.a. **Installation:** `npx @colbymchenry/codegraph` (Setup) + `codegraph init` pro Projekt.
- **Behauptete Ersparnis:** 62 % weniger Tokens, 88 % weniger Tool-Calls, 53 % schneller, 44 % günstiger (7 Repos, Claude Opus 4.8, Median aus 4 Runs, CLI in **beiden** Armen geblockt — 0/28 Kontamination). [^11^]
- **Evidenzqualität:** mittel-hoch — sauberste Eigenmethodik der Liste inkl. Kontaminationskontrolle **und** ehrlichem Gegenbefund: ~80 % *mehr* residenter Retrieval-Kontext am Sessionende (dense Payloads bleiben im Fenster).
- **Relevanz:** Kern (anderer Mechanismus: Exploration vermeiden statt Output komprimieren). **Deep-Dive: Ja.**

#### 9. manojmallick/sigmap
- **URL:** https://github.com/manojmallick/sigmap · **Status:** aktiv, 614★, Push 2026-07-28, MIT [^1^]
- **Zweck:** Deterministische, zero-dep Signatur-Maps (TF-IDF-Ranking, 33 Sprachen) als auditable Alternative zu Agentic-Grep.
- **Token-Spar-Mechanismus:** Kompakte Symbol-Signaturen mit Line-Ankern statt voller Dateidumps; `sigmap verify/judge` für Grounding.
- **Integration:** MCP-Server + CLI. **Installation:** `npx sigmap`. [^9^]
- **Behauptete Ersparnis:** 96,8 % Token-Reduktion Ø über 21 Repos; 82,2 % hit@5 (vs. 44,8 % Grep-Baseline); Task-Success 64,8 % **„modeled, not measured"**. [^9^]
- **Evidenzqualität:** mittel (Benchmark reproduzierbar, Zenodo-archiviert; aber Token-Zahl ist Retrieval-Vergleich, nicht Session-Rechnung; zentrale Metriken modelliert).
- **Relevanz:** Kern. **Deep-Dive: Ja (zweite Reihe)** — mit codegraph/stacklit die „struktureller Index statt Kompression"-Familie.

#### 10. agiwhitelist/tokdiet
- **URL:** https://github.com/agiwhitelist/tokdiet · **Status:** aktiv, 33★, Push 2026-06-18, MIT, TypeScript [^1^]
- **Zweck:** Lokaler Streaming-Reverse-Proxy zwischen Coding-Agenten (Claude Code, Cursor, Codex) und Modell-APIs mit Context-Governor: „ccusage, das die Rechnung senkt — und beweist, dass das Modell nicht dümmer wurde".
- **Token-Spar-Mechanismus:** Dedup wiederholter File-Dumps, recoverable Auslagerung kalten Kontexts, On-Topic-Schutz; fail-open (Fehler → transparenter Passthrough); API-Keys nie persistiert. [^10^]
- **Integration:** Proxy. **Installation:** `npx tokdiet start`.
- **Behauptete Ersparnis:** −71 % Input-Tokens (5,07M → 1,46M) bei Qualitätsparität 63/66 vs. 64/66; 198 gepaarte Runs, LLM-Judge 92 %, bestätigt auf zweitem Modell (−72 %). Reproduzierbar: `node bench/run.mjs`. [^10^]
- **Evidenzqualität:** mittel (methodisch überraschend sauber für 33★, aber klein, ein Modell-Paar, autorengesteuert).
- **Relevanz:** Kern. **Deep-Dive: Ja** — einziger Proxy mit mitgeliefertem Qualitäts-A/B-Benchmark; lohnt trotz kleiner Community.

#### 11. fkiene/llmtrim
- **URL:** https://github.com/fkiene/llmtrim · **Status:** aktiv, 208★, Push 2026-08-12, MPL-2.0, Rust [^1^]
- **Zweck:** Lokaler Proxy, der LLM-API-Traffic komprimiert („same answers, smaller bill").
- **Token-Spar-Mechanismus:** Stufenweise Kompression; jede Stufe wird mit dem Provider-Tokenizer nachgemessen und rückgängig gemacht, wenn sie nicht spart; bei Provider-Ablehnung wird das Original erneut gesendet — „worst case is zero savings". Log-Templating: 4.662→978 Zeichen (−79 %), Fehler bleiben verbatim. [^25^]
- **Integration:** Proxy (Provider-agnostisch, OpenAI/Anthropic). **Installation:** `npm install -g @llmtrim/cli@latest && llmtrim setup` oder `brew install fkiene/tap/llmtrim`.
- **Behauptete Ersparnis:** −31 % Input · −74 % Output · −66 % Round-Trip-Kosten (Eigenmessung).
- **Evidenzqualität:** niedrig-mittel (Safety-Architektur stark, Zahlen nicht unabhängig).
- **Relevanz:** Kern. **Deep-Dive: Nein** (als Referenz für Net-win-Gate-Design in squeez/llmtrim vergleichbar).

#### 12. jia-gao/leanctx
- **URL:** https://github.com/jia-gao/leanctx · **Status:** aktiv, 316★, Push 2026-08-12, MIT [^1^]
- **Zweck:** Drop-in-Prompt-Kompression für produktive LLM-Apps: `from leanctx import OpenAI` — gleiches Interface, komprimierte Requests.
- **Token-Spar-Mechanismus:** Klassifiziert Prompt-Segmente nach Kompressionstoleranz und komprimiert klassenspezifisch (u.a. LLMLingua-2 lokal, ~50 % auf toleranten Klassen); läuft on-prem. [^26^]
- **Integration:** Python-Library (Wrappers für OpenAI/Anthropic/Gemini). **Installation:** `pip install 'leanctx[anthropic,lingua]'`.
- **Behauptete Ersparnis:** 10–40 % der Input-Rechnung; auf LongBench v2 (N=503) zusätzliche 18,7 % **auf einen bereits laufenden Kompressor obendrauf** (36,7 % bei Prosa), Kosten: 1,8 pp Accuracy; alle Zahlen aus committeten Per-Item-Daten regenerierbar. [^26^]
- **Evidenzqualität:** mittel-hoch (unusually transparente Reproduzierbarkeit; Externalität: Library, kein CC-Plugin — Integration in Claude Code nur indirekt über Proxy/Wrapper möglich).
- **Relevanz:** Kern (als Technologie), Peripherie (als CC-Integration). **Deep-Dive: Ja (zweite Reihe).**

#### 13. Madhan230205/token-reducer
- **URL:** https://github.com/Madhan230205/token-reducer · **Status:** aktiv, 42★, Push 2026-05-02, MIT [^1^]
- **Zweck:** Local-first Kontext-Kompressions-Pipeline für Claude Code: Hybrid-RAG (BM25 + ONNX-Vektoren), AST-Chunking, Reranking, Import-Graph.
- **Token-Spar-Mechanismus:** Semantische Auswahl relevanter Chunks statt ganzer Codebase (50.000 → 500 Tokens im Diagramm).
- **Integration:** Claude-Code-Plugin. **Installation:** `/plugin marketplace add Madhan230205/token-reducer` + `/plugin install token-reducer@Madhan230205-token-reducer`. [^21^]
- **Behauptete Ersparnis:** „90–98 %" — ohne Benchmark-Daten, Methodik oder unabhängige Belege.
- **Evidenzqualität:** **niedrig** (reiner Marketing-Claim, geringe Adoption). **Relevanz:** Kern (adressiert direkt CC). **Deep-Dive: Nein.**

#### 14. PCIRCLE-AI/toonify-mcp
- **URL:** https://github.com/PCIRCLE-AI/toonify-mcp · **Status:** aktiv, 64★, Push 2026-08-12, MIT, TypeScript [^1^]
- **Zweck:** Context-Compression-Plugin für Claude Code: trimmt große Tool-Outputs (JSON, YAML, Stacktraces, Logs), bevor sie ins Fenster gelangen.
- **Token-Spar-Mechanismus:** JSON/YAML → TOON-Encoding, repetitive Logs kollabiert; Source-Code/Prosa/präzisionskritische Zahlen unangetastet; „never breaks a pipe" (Passthrough, wenn nichts anwendbar). [^28^]
- **Integration:** Claude-Code-Plugin + MCP + CLI (`toonify-mcp compress` stdin→stdout). **Installation:** `npm install -g .` aus dem Repo (npm-Paket).
- **Behauptete Ersparnis:** kein Headline-Prozent im README (TOON-Baseline ~40 % auf JSON).
- **Evidenzqualität:** niedrig-mittel. **Relevanz:** Kern. **Deep-Dive: Nein** (interessant als TOON-Anwendung; TOON selbst ist der Deep-Dive).

#### 15. sriinnu/clipforge-PAKT
- **URL:** https://github.com/sriinnu/clipforge-PAKT · **Status:** aktiv, 20★, Push 2026-07-31, MIT [^1^]
- **Zweck:** Lossless-first, modellfreie Token-Kompression für strukturierte Daten (JSON, YAML, CSV, Markdown).
- **Token-Spar-Mechanismus:** L1–L3 **verlustfrei** (`decompress()` byte-identisch), opt-in L4 lossy mit Budget; `pakt_inspect` sagt vorher, ob sich Kompression lohnt. Ehrliche Gegenbeispiele: +25 % auf kleinem Config-Objekt, Prosa ohne Wiederholung unverändert. [^27^]
- **Integration:** Library + CLI + MCP + Desktop-App. **Installation:** `npm install @sriinnu/pakt`.
- **Behauptete Ersparnis:** typisch 27–33 % (JSON, lossless), 57 % Logs, 38–69 % repetitive Texte.
- **Evidenzqualität:** mittel (konservative, plausibel kalibrierte Zahlen). **Relevanz:** Kern (als Komponente). **Deep-Dive: Nein.**

#### 16. NodeNestor/claude-rolling-context
- **URL:** https://github.com/NodeNestor/claude-rolling-context · **Status:** aktiv, 27★, Push 2026-08-12, MIT [^1^]
- **Zweck:** Transparenter Proxy für **rollende Kontextkompression** in Claude Code: alte Nachrichten werden automatisch zusammengefasst, die letzten ~40k Tokens bleiben verbatim; löst das „summary of a summary"-Problem von `/compact`.
- **Token-Spar-Mechanismus:** Trigger bei 100k Tokens; native Summarization als Cache-Read (~400 frische Tokens für ~72k-Kompression gemessen); Prefix-Cap macht Kostenwachstum linear statt quadratisch; Cold-Turn nach Cache-TTL ~9× günstiger. Stateless via Content-Hashes; `/rolling-context:off` pro Session. [^19^]
- **Integration:** Claude-Code-Plugin + Proxy :5588 (chainable mit anderen Proxys; Summarizer auch lokal via Ollama möglich). **Installation:** `/plugin marketplace add NodeNestor/nestor-plugins` + `/plugin install rolling-context`.
- **Behauptete Ersparnis:** keine %-Headline; ökonomisches Modell + ehrliche Einordnung („kurze Sessions sind ein Wash; `CLAUDE_CODE_AUTO_COMPACT_WINDOW` senken ist gratis ähnlich gut für Kosten, aber nicht für Qualität"). [^19^]
- **Evidenzqualität:** mittel (durchdachte Dokumentation, reale Bug-Historie; keine Unabhängigkeit). **Relevanz:** Kern. **Deep-Dive: Ja** — adressiert als einziges Tool die Qualitätsseite der Kontextwand, nicht nur den Preis.

#### 17. JuliusBrussee/caveman
- **URL:** https://github.com/JuliusBrussee/caveman · **Status:** aktiv, 97.774★, Push 2026-08-12, Lizenz NOASSERTION, Go/JS [^1^]
- **Zweck:** Skill/Plugin, das Agenten-Antworten in „Caveman-Speak" zwingt (Filler weg, Code/Kommandos byte-exakt) — Output-seitige Token-Reduktion; Ökosystem inzwischen größer (Caveman Proxy/Engine, Browse, cavecrew-Subagents, `/caveman-compress` für Memory-Dateien, ~46 % auf CLAUDE.md-Inputs). [^31^]
- **Token-Spar-Mechanismus:** Prompt-Skill (Terse-Persona) + Proxy für Input-Kompression; kostet selbst ~1–1,5k Input-Tokens/Turn (net-win-Buchhaltung seit v1.10).
- **Integration:** Skill + Hooks + CLI für 30+ Agenten. **Installation:** `npm install -g @caveman-ai/cli && caveman setup --install` oder Plugin-Marketplace.
- **Behauptete Ersparnis:** 65 % Output-Tokens (Chat-Prosa, 10 Prompts). **Gemessen unabhängig (JetBrains, 86 SkillsBench-Tasks, Skill forciert): 8,5 % Output-Tokens — die Decke, nicht der Alltag; Qualität unverändert; Gesamtrechnung einmal sogar +11,6 % (Long-Context-Tier-Ausreißer).** [^3^]
- **Evidenzqualität:** hoch (unabhängig getestet und als „safe, honest about style, oversold on savings" eingestuft); README führt die 8,5 % inzwischen selbst auf. [^3^][^31^]
- **Relevanz:** Kern (aber Effekt klein). **Deep-Dive: Ja** als Warnstudie Chat-Prosa- vs. Agenten-Workload.

#### 18. DietrichGebert/ponytail
- **URL:** https://github.com/DietrichGebert/ponytail · **Status:** aktiv, 101.498★, Push 2026-08-07, MIT [^1^]
- **Zweck:** Skill, der den Agenten „wie den faulsten Senior-Dev" denken lässt: weniger Code schreiben (YAGNI), weil ungeschriebener Code keine Tokens, Bugs oder Wartung erzeugt.
- **Token-Spar-Mechanismus:** Verhaltens-Skill → weniger generierter Code → weniger Output-Tokens, weniger Folge-Edits.
- **Integration:** Claude-Code-Plugin/Skill. **Installation:** `/plugin marketplace add DietrichGebert/ponytail` + `/plugin install ponytail@ponytail`. [^30^]
- **Behauptete Ersparnis:** ~54 % weniger Code (bis 94 %), −22 % Tokens, −20 % Kosten, −27 % Zeit (12 Feature-Tasks, Haiku 4.5, n=4); README korrigiert frühere 80–94 %-Single-Shot-Zahl selbst als Baseline-Artefakt (Issue #126). [^30^]
- **Evidenzqualität:** **hoch (unabhängig teilbestätigt)** — JetBrains (80 gepaarte Tasks): −15 % Code, **−10,3 % Kosten (p=0,004)**, −11 % Zeit, keine Qualitätsdifferenz; „erster statistisch solider Sparbeleg der Serie". [^4^]
- **Relevanz:** Kern. **Deep-Dive: Ja** — einziger Skill mit positivem unabhängigem Kostensignal; Mechanismus (Verhaltensänderung statt Kompression) strategisch wichtig.

#### 19. open-compress/claw-compactor
- **URL:** https://github.com/open-compress/claw-compactor · **Status:** aktiv aber zuletzt gepusht 2026-04-01 (4 Monate stale), 2.111★, MIT [^1^]
- **Zweck:** 14-stufige deterministische „Fusion Pipeline" für Token-Kompression (AST-aware, JSON-Sampling, SimHash-Dedup, Log/Diff/Search-Cruncher), reversibel via Rewind-Store, null LLM-Inferenzkosten.
- **Token-Spar-Mechanismus:** Content-Routing (Cortex) → typ-spezifische Stufen; Ionizer sampelt JSON-Arrays mit Schema-Erhalt; Original abrufbar per Marker-Tool. [^20^]
- **Integration:** Python-Library + OpenClaw-Skill (`npx skills add open-compress/claw-compactor`). **Installation:** `pip install claw-compactor` (v7.1.0).
- **Behauptete Ersparnis:** 15–82 % je nach Content (Ø 36 %, JSON-Peak 81,9 %, Code nur 15–25 %); SWE-bench-Instanzen 11,8–19,1 %; ROUGE-L-Fidelity über LLMLingua-2. [^20^]
- **Evidenzqualität:** mittel (1.600+ Tests, Dritt-Audit 84/100 „Safe to try", aber eigene Benchmarks + zuletzt inaktiv). **Relevanz:** Kern (OpenClaw-Ökosystem), für Claude Code nur via Skill/MCP adaptierbar. **Deep-Dive: Nein.**

#### 20. toon-format/toon
- **URL:** https://github.com/toon-format/toon · **Status:** aktiv, 25.144★, Push 2026-08-07, MIT [^1^]
- **Zweck:** TOON (Token-Oriented Object Notation): kompaktes, menschenlesbares Serialisierungsformat des JSON-Datenmodells für LLM-Prompts.
- **Token-Spar-Mechanismus:** Tabellarische Arrays ohne wiederholte Keys; ~42,6 % weniger Tokens als JSON bei gleicher Retrieval-Accuracy; ehrliche „when NOT to use": tief verschachtelte/non-uniforme Daten (kompaktes JSON gewinnt), rein tabellarisch (CSV kleiner). [^22^]
- **Integration:** Library (TS) + CLI. **Installation:** `npx @toon-format/cli --stats`.
- **Evidenzqualität:** mittel-hoch (Benchmarks + Spec im Repo; Format wird bereits von toonify-mcp konsumiert).
- **Relevanz:** Peripherie→Kern (Baustein, kein CC-Tool). **Deep-Dive: Ja (kurz)** — Format-Layer, der mehrere Tools speist.

#### 21. microsoft/LLMLingua
- **URL:** https://github.com/microsoft/LLMLingua · **Status:** aktiv (Push 2026-04-08), 6.548★, MIT [^1^]
- **Zweck:** Referenz-Implementierung der LLMLingua-Familie (LLMLingua, LLMLingua-2, LongLLMLingua): kleines Modell bewertet Token-Wichtigkeit und löscht informationsarme Tokens.
- **Token-Spar-Mechanismus:** Perplexity-Scoring (LLMLingua, bis 20×), BERT-Token-Klassifikation (LLMLingua-2, 3–6× schneller), query-aware Long-Context (LongLLMLingua). [^17^]
- **Integration:** Python-Library (`pip install llmlingua`); in Claude Code einbindbar über Dritt-Hooks (z. B. gladehq/claude-shorthand, ~55 % Claim) — nicht nativ.
- **Behauptete Ersparnis:** bis 20× bei ~1,5 % Verlust (Paper); Praxis-Deckel eher 4–10×. Unabhängige 2026-Studien: **ungeeignet für strukturierte Daten/Code** (Retrieval <50 %, Klassifikation −52 pp), bricht Prompt-Cache. [^17^][^35^]
- **Evidenzqualität:** **hoch** (EMNLP'23/ACL'24 peer-reviewed + unabhängige Folgestudien).
- **Relevanz:** Peripherie (Technologie-Fundament, kein CC-Tool). **Deep-Dive: Ja** als akademischer Anker für die Kompressions-Familie.

#### 22. BlockRunAI/ClawRouter
- **URL:** https://github.com/BlockRunAI/ClawRouter · **Status:** aktiv, 6.612★, Push 2026-08-12, MIT [^1^]
- **Zweck:** Agent-nativer LLM-Router: analysiert jede Anfrage über 15 Dimensionen und routet lokal (<1 ms) zum billigsten fähigen Modell (70 Modelle, 8 gratis, USDC/x402-Micropayments, Wallet-Signaturen statt API-Keys).
- **Token-Spar-Mechanismus:** **Keiner** — spart *Kosten* (bis 88 %) durch Modell-Routing, nicht Tokens. [^32^]
- **Integration:** OpenClaw-Plugin/Router. **Installation:** `npm install -g @blockrun/clawrouter && clawrouter setup`.
- **Evidenzqualität:** niedrig-mittel. **Relevanz:** Peripherie (Kostenoptimierung auf anderer Achse; erwähnenswert, weil oft mit Token-Tools verwechselt). **Deep-Dive: Nein.**

#### 23. multica-ai/andrej-karpathy-skills
- **URL:** https://github.com/multica-ai/andrej-karpathy-skills · **Status:** aktiv (Push 2026-04-20), 201.881★, keine Lizenz [^1^]
- **Zweck:** Eine CLAUDE.md bzw. ein Claude-Code-Plugin mit vier Prinzipien aus Andrej Karpathys Beobachtungen zu LLM-Coding-Fehlmodi (stille Annahmen, Over-Engineering, unbeabsichtigte Änderungen, fehlende Erfolgskriterien). Ursprünglich `forrestchang/andrej-karpathy-skills` (301 → multica-ai). [^15^]
- **Token-Spar-Mechanismus:** **Kein expliziter** — indirekt über weniger Over-Engineering, weniger Drift, klarere Ziele (analog ponytail, aber ohne Token-Claim/Messung).
- **Integration:** Plugin (`/plugin marketplace add multica-ai/andrej-karpathy-skills`) oder rohe CLAUDE.md; Cursor-Rule inklusive.
- **Evidenzqualität:** mittel (Agentiquette 61/100 „Experimental", 125 offene Issues, Wartung 50/100). **Relevanz:** Peripherie (Qualitäts-/Verhaltens-Datei, kein Token-Tool). **Deep-Dive: Nein.**

#### 24. Aider-AI/aider
- **URL:** https://github.com/Aider-AI/aider · **Status:** aktiv, 48.152★, Apache-2.0 [^1^]
- **Zweck:** Vollwertiges AI-Pair-Programming im Terminal — **kein Token-Minimierer**, aber mit mehreren token-relevanten Features (explizit vom Auftrag zu prüfen):
  - **Repo-Map** (Kernfeature): Tree-sitter-AST → Signatur-Karte des gesamten Repos mit Token-Budget (`map-tokens`, Default 2048; 0 = aus), PageRank-Ranking — ersetzt Volllast-Kontext; [^16^]
  - **`.aiderignore`** gegen Repo-Map-Noise bei generiertem Code/vendored Deps; [^16^]
  - nur `/add`-ed Dateien landen voll im Kontext; Prompt-Caching-Support; `/tokens`-Befehl; schwächeres Commit-Modell konfigurierbar.
- **Integration:** Standalone-CLI (`python -m pip install aider-install`).
- **Evidenzqualität:** hoch (etabliertes Projekt; Repo-Map-Algorithmus wird von Dritttools wie dereira/goldfish portiert). [^16^]
- **Relevanz:** Peripherie — relevant als Referenz-Implementierung der Repo-Map-Idee und als Alternative zu Claude Code, nicht als Add-on. **Deep-Dive: Nein.**

#### 25. yamadashy/repomix
- **URL:** https://github.com/yamadashy/repomix · **Status:** aktiv, 27.797★, MIT [^1^]
- **Zweck:** Packt ein gesamtes Repository in eine einzige AI-freundliche Datei (für Reviews, Audits, One-Shot-Prompts).
- **Token-Spar-Mechanismus:** `--compress` extrahiert via Tree-sitter Klassen/Funktionen/Interfaces (Struktur statt Volltext); Token-Counting integriert. Kein %-Spar-Claim. [^23^]
- **Integration:** CLI (`npx repomix@latest`, auch `brew install repomix`), Remote-Repos, MCP.
- **Evidenzqualität:** mittel. **Relevanz:** Peripherie (Kontext-**Packaging**, nicht Minimierung; Drittvergleich: Dumper-Kategorie, bei mittleren Repos 50k–500k Tokens — Vorsicht). [^24^] **Deep-Dive: Nein.**

#### 26. coderamp-labs/gitingest
- **URL:** https://github.com/coderamp-labs/gitingest · **Status:** aktiv, 15.296★, MIT [^1^]
- **Zweck:** „Replace 'hub' with 'ingest' in any GitHub URL" → prompt-freundlicher Codebase-Extrakt (CLI + Web + Server).
- **Token-Spar-Mechanismus:** keiner explizit (Selektion/Filter beim Export). **Installation:** `pip install gitingest` (pipx empfohlen).
- **Evidenzqualität:** mittel. **Relevanz:** Peripherie. **Deep-Dive: Nein.**

#### 27. mufeedvh/code2prompt
- **URL:** https://github.com/mufeedvh/code2prompt · **Status:** aktiv, 7.598★, MIT, Rust [^1^]
- **Zweck:** Codebase → einzelner LLM-Prompt mit Source-Tree, Handlebars-Templating und Token-Count.
- **Token-Spar-Mechanismus:** keiner explizit (Filter/Templates; Token-Zählung als Transparenz). **Installation:** `cargo install code2prompt` / `brew install code2prompt`.
- **Evidenzqualität:** mittel. **Relevanz:** Peripherie. **Deep-Dive: Nein.**

#### 28. simonw/files-to-prompt
- **URL:** https://github.com/simonw/files-to-prompt · **Status:** **verwaist/stale** (letzter Push 2025-02-19), 2.775★, Apache-2.0 [^1^]
- **Zweck:** Konkateniert ein Verzeichnis voller Dateien in einen einzelnen Prompt (Simon Willison).
- **Token-Spar-Mechanismus:** keiner (reines Packaging). **Installation:** `pip install files-to-prompt`.
- **Evidenzqualität:** hoch (funktional trivial, tut was es sagt). **Relevanz:** Peripherie. **Deep-Dive: Nein.**

#### 29. mohsen1/yek (umbenannt von bodo-run/yek)
- **URL:** https://github.com/mohsen1/yek · **Status:** aktiv, **umbenannt** (bodo-run/yek → 301 → mohsen1/yek), 2.471★, MIT, Rust [^1^]
- **Zweck:** Schneller Rust-Serialisierer: Repo/Verzeichnis → LLM-tauglicher Text (Claim: 230× schneller als repomix).
- **Token-Spar-Mechanismus:** keiner explizit (Speed- statt Spar-Tool; Chunking/Token-Limits konfigurierbar). **Installation:** `curl -fsSL https://azimi.me/yek.sh | bash` oder `cargo install --path .`
- **Evidenzqualität:** mittel. **Relevanz:** Peripherie. **Deep-Dive: Nein.**

#### 30. ZongqianLi/500xCompressor
- **URL:** https://github.com/ZongqianLi/500xCompressor · **Status:** aktiv (Push 2026-03-09), 64★, keine Lizenz [^1^]
- **Zweck:** ACL-2025-Main-Paper-Code: komprimiert bis zu 500 natürlichsprachliche Tokens in **1 Spezial-Token** (gespeicherte KV-Werte, +0,3 % Parameter, Zero-shot nutzbar, 6×–480×). [^18^]
- **Token-Spar-Mechanismus:** Soft-Prompt/KV-Kompression auf Modellebene.
- **Integration:** Research-Code (Arxiv-Corpus-Pretraining, ArxivQA-Finetuning). **Installation:** `git clone` + Trainingsskripte.
- **Evidenzqualität:** hoch (peer-reviewed) — **aber für Claude Code irrelevant**: benötigt Zugriff auf Modellgewichte/KV-Cache; bei geschlossenen APIs (Claude) nicht deploybar. Watch-Item für Self-Hosting. [^18^]
- **Relevanz:** Irrelevant (für die Mission), wissenschaftlich spannend. **Deep-Dive: Nein.**

#### 31. RonnieTheTester/headroom-meter
- **URL:** https://github.com/RonnieTheTester/headroom-meter · **Status:** aktiv, 6★, Push 2026-06-24, MIT [^1^]
- **Zweck:** Live-Terminal-Dashboard, das die Kompressions-Arbeit von **Headroom** sichtbar macht (Token-Savings, Kompressions-Spikes, Cache-Hits) — Observability, kein Spar-Tool. [^34^]
- **Token-Spar-Mechanismus:** keiner (Messung/Bericht).
- **Integration:** TUI über Headroom-Events. **Installation:** `curl -fsSL .../bin/headroom-meter -o ~/.local/bin/headroom-meter`.
- **Evidenzqualität:** niedrig (winzig, neu). **Relevanz:** Peripherie (nützlich zur Verifikation der Headroom-Claims — „trust but verify"). **Deep-Dive: Nein.**

### Key Findings

1. **Keine toten Links, aber zwei Umbenennungen.** Alle 31 Repos existieren. `chopratejas/headroom` → 301 → `headroomlabs-ai/headroom` (Org-Umzug; die Liste sollte den neuen Namen führen). `bodo-run/yek` → 301 → `mohsen1/yek`. [^1^]
2. **Namens-Kollisionen auflösen:** Es gibt **zwei „squeez"**: `claudioemmanuel/squeez` (Rust, Hook-Kompressor für 7 CLI-Hosts, 182★) und `KRLabsOrg/squeez` (Python, Qwen-2B-Modell mit arXiv-Paper, 23★) — komplett verschiedene Projekte, beide legitim. Ebenso **zwei „headroom"**: das Kompressions-Tool (headroomlabs-ai) vs. `RonnieTheTester/headroom-meter` (Dashboard *für* Headroom). [^12^][^13^][^34^]
3. **Die JetBrains-Serie ist der Evidenz-Anker des ganzen Feldes** (SkillsBench, gepaarte A/B, Claude Sonnet 5): caveman −65 % beworben → **−8,5 % gemessen** (Decke bei forcierter Aktivierung); rtk −60–90 % beworben → **+7,6 % teurer** bei niedrigem Effort, ±0 bei hohem (Savings-Cap rechnerisch ≈3 % des Inputs, weil nur ~20 % des Kontexts durch Bash-Hooks läuft); ponytail −20 % Kosten beworben → **−10,3 % gemessen (p=0,004)** — der einzige statistisch solide Gewinn. Generalregel der Serie: Selbstberichtete Savings sind eine Aussage über das Counterfactual des Tools, nicht über die Rechnung. [^2^][^3^][^4^]
4. **Mechanismus-Cluster:** (a) **Output-Kompression per Hook** (rtk, squeez, sqz) — realistisch einstellige Gesamtersparnis; (b) **Proxy-Kompression ganzer Requests** (headroom, tokdiet, llmtrim, pxpipe, rolling-context) — größerer Hebel, höhere Komplexität/Risiken; (c) **Explorationsvermeidung durch Index/Graph** (codegraph, sigmap, aider-repo-map) — spart Discovery-Tokens, kann residenten Kontext *erhöhen* (codegraph selbst gemessen: +80 % Residual); (d) **Verhaltens-Skills** (ponytail, caveman, karpathy-skills) — ponytail wirkt, caveman kaum, karpathy ungemessen; (e) **Datenformate** (TOON, PAKT) — Bausteine; (f) **Modell-/Forschungsebene** (LLMLingua, KRLabsOrg-squeez, 500xCompressor) — LLMLingua-2 bricht strukturierte Daten & Prompt-Cache, 500xCompressor für Claude nicht deploybar. [^11^][^17^][^18^][^22^]
5. **Cache-Ökonomie entscheidet:** Da Claude Code bei jedem Turn den gesamten Prefix erneut sendet (Cache-Read 0,1×), dominieren Wiederhol-Lesungen die Rechnung — genau das, was Hook-Kompressoren *nicht* anfassen; Rolling-Context (Prefix-Cap) und pxpipe (Imaging des statischen Blocks) adressieren diese Schicht direkt. [^2^][^6^][^19^]
6. **Aider-AI/aider ist korrekt einsortiert als Peripherie:** komplettes Coding-Tool, kein Token-Minimierer; sein Repo-Map (Tree-sitter + PageRank + `map-tokens`-Budget, `.aiderignore`) ist aber eine referenzielle Token-Effizienz-Technik, die Dritttools portieren. [^16^]
7. **Ehrlichkeit korreliert umgekehrt mit Star-Zahl:** Die kleinsten Repos liefern teils die sauberste Buchführung (sqz: 24,7 % Ø über 3.003 Messungen; clipforge-PAKT nennt +25 %-Gegenbeispiele; rolling-context sagt „kurze Sessions sind ein Wash"), während die viralsten (rtk, caveman) die größten Claim-Lücken haben. Ausreißer: ponytail (viral **und** bestätigt), codegraph (viral mit Kontaminations-kontrolliertem Eigenbenchmark inkl. offengelegtem Nachteil). [^4^][^11^][^19^][^27^][^29^]
8. **Nicht alles auf der Liste ist ein Token-Tool:** ClawRouter (Modell-Routing → Kosten), headroom-meter (Dashboard), repomix/gitingest/code2prompt/files-to-prompt/yek (Repo-Packaging, bei mittleren Repos eher token-*teuer*: 50k–500k pro Dump), karpathy-skills (Verhaltens-CLAUDE.md). [^24^][^32^][^34^]

### Empfohlene Deep-Dive-Kandidaten (priorisiert)

1. **headroomlabs-ai/headroom** — größtes aktives Kompressions-Projekt (66k★, tägliche Pushes), Library+Proxy+MCP+Wrap, moderate gegliederte Claims mit reproduzierbaren Evals; Ökosystem-Anker (meter, desktop). [^5^]
2. **teamchong/pxpipe** — einzigartiger optischer Ansatz mit dem höchsten behaupteten Hebel (59–70 % Rechnung), unabhängige Presse, ungewöhnlich ehrliche Risikodoku (0/15 Hex-Recall auf Opus); Kernfrage: Verbatim-Risiko vs. Ersparnis. [^6^][^7^]
3. **rtk-ai/rtk** — populärstes Tool (76k★) mit schärfster Widerlegung (JetBrains +7,6 %); Deep-Dive sollte Self-Scoreboard vs. Rechnung, Hook-Abdeckung und die Soba-Labs-Gegenmessung (49,6 % auf gerouteten Kommandos) aufdröseln. [^2^][^14^]
4. **mksglu/context-mode** — einzige Kombination aus Output-Sandboxing, Session-Persistenz (überlebt /compact) und Routing-Enforcement über 17 Plattformen; 98 %-Claim verifizieren. [^8^]
5. **colbymchenry/codegraph** — sauberste Eigenmethodik (CLI-Block in beiden Armen) und strategisch anderer Mechanismus (Explorationsvermeidung); inkl. ehrlichem Residual-Kontext-Caveat. [^11^]
6. **agiwhitelist/tokdiet** — kleinster Deep-Dive mit bestem Preis-Leistungs-Verhältnis der Evidenz: gepaarter Qualitätsbenchmark inklusive; Proxy-Schicht direkt CC-kompatibel. [^10^]
7. **NodeNestor/claude-rolling-context** — adressiert als einziges Tool die Qualitätsdegradation von /compact plus Cache-TTL-Ökonomie; ideal für die „lange Sessions"-Facette. [^19^]
8. **DietrichGebert/ponytail** — einziger unabhängig bestätigter Kostengewinn (−10,3 %, p=0,004); Mechanismus „weniger Code schreiben" ist komplementär zu allen Kompressoren stapelbar. [^4^][^30^]
Zweite Reihe (kurz): **claudioemmanuel/squeez** (Retrieve-Rückversicherung + Net-win-Gate), **KRLabsOrg/squeez** (Paper-Modellansatz), **microsoft/LLMLingua** (akademischer Anker + Cache-Bruch-Risiko), **toon-format/toon** (Format-Baustein), **jia-gao/leanctx** (SDK-Wrapper mit committeten Benchmark-Daten), **JuliusBrussee/caveman** (Warnstudie Chat- vs. Agenten-Workload). [^3^][^12^][^13^][^17^][^22^][^26^]

### Nicht gefundene / verwaiste Repos

- **Nicht gefunden (404): keine.** Alle 31 Einträge existieren.
- **Umbenannt (301):** `chopratejas/headroom` → `headroomlabs-ai/headroom`; `bodo-run/yek` → `mohsen1/yek`. (Ebenfalls relevant: `forrestchang/andrej-karpathy-skills` → `multica-ai/andrej-karpathy-skills` — die Liste nennt bereits das Ziel.) [^1^][^15^]
- **Verwaist/stale (kein Push seit >4 Monaten):** `simonw/files-to-prompt` (2025-02-19), `open-compress/claw-compactor` (2026-04-01), `multica-ai/andrej-karpathy-skills` (2026-04-20, 125 offene Issues), `KRLabsOrg/squeez` (2026-04-27), `microsoft/LLMLingua` (2026-04-08), `ZongqianLi/500xCompressor` (2026-03-09). [^1^]
- **Archived-Flag:** keines der 31 Repos. [^1^]

### Quellen

[^1^]: GitHub REST API, `https://api.github.com/repos/<owner>/<repo>` für alle 31 Repos, abgerufen 2026-08-13 (Stars, Forks, pushed_at, Sprache, Lizenz, archived, Redirects).
[^2^]: JetBrains AI Blog, „Does 'rtk' skill really cut agent tokens by 60–90%? We tested it", 2026-07-20 — https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
[^3^]: JetBrains AI Blog, „Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test", 2026-07-16 — https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/ ; The New Stack, 2026-07-06 — https://thenewstack.io/caveman-mode-token-savings/
[^4^]: JetBrains AI Blog, „Ponytail Skill for Claude Code: Does It Really Cut Tokens", 2026-07-28 — https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/
[^5^]: headroom README — https://github.com/headroomlabs-ai/headroom
[^6^]: pxpipe README — https://github.com/teamchong/pxpipe ; claude-code-ultimate-guide, context-engineering-tools.md — https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ecosystem/context-engineering-tools.md
[^7^]: The Decoder, „Open-source tool pxpipe hides text in PNGs…", 2026-07-04 — https://the-decoder.com/open-source-tool-pxpipe-hides-text-in-pngs-to-cut-claude-code-and-fable-5-token-costs-up-to-70/ ; wavect.io pxpipe Review, 2026-08-07 — https://wavect.io/blog/text-as-image-token-savings/ ; Zylos Research, 2026-07-05 — https://zylos.ai/zh/research/2026-07-05-text-as-image-prompt-compression-token-arbitrage/
[^8^]: context-mode README — https://github.com/mksglu/context-mode
[^9^]: sigmap README/Benchmark — https://github.com/manojmallick/sigmap
[^10^]: tokdiet README + Benchmark — https://github.com/agiwhitelist/tokdiet ; SkillsLLM-Listing — https://skillsllm.com/skill/tokdiet
[^11^]: codegraph README/Benchmarks — https://github.com/colbymchenry/codegraph ; agentconn.com-Analyse, 2026-05-23 — https://agentconn.com/blog/codegraph-pre-indexed-knowledge-graph-multi-agent-claude-code-codex-2026/
[^12^]: KRLabsOrg/squeez README — https://github.com/KRLabsOrg/squeez ; arXiv 2604.04979 „Squeez: Task-Conditioned Tool-Output Pruning for Coding Agents" — https://arxiv.org/html/2604.04979v1
[^13^]: claudioemmanuel/squeez README — https://github.com/claudioemmanuel/squeez
[^14^]: rtk README — https://github.com/rtk-ai/rtk ; Soba Labs, „How we halved Claude Code token usage with RTK AI", 2026-07-13 — https://sobalabs.ai/blog/halving-claude-code-token-usage-with-rtk/
[^15^]: Nic's notes, „Karpathy Claude Code Skills" (Umzug forrestchang → multica-ai), 2026-08-10 — https://notes.nicolasdeville.com/github/karpathy-skills ; Agentiquette-Score — https://www.agentiquette.com/index/repos/karpathy-skills
[^16^]: jiangren.com.au Aider-Guide (Repo-Map/`map-tokens`), 2026-08-09 — https://jiangren.com.au/blog/aider-guide-03-core-features ; iamraghuveer.com, „Aider .aiderignore", 2026-04-25 — https://www.iamraghuveer.com/posts/aider-aiderignore/ ; dereira/goldfish (Go-Port des aider-Repomap-Algorithmus) — https://github.com/dereira/goldfish
[^17^]: microsoft/LLMLingua README — https://github.com/microsoft/LLMLingua ; ketelsen.ai Deep-Research-Report (Failure Modes, „Prompt Compression in the Wild"), 2026-06-09 ; mickeyyaya/evolve-loop Knowledge Base, 2026-03-12 — https://github.com/mickeyyaya/evolve-loop/blob/main/knowledge-base/research/token-optimization-2026/part1-context-compression.md ; edenai.co LLMLingua-Vergleich, 2026-08-07 — https://www.edenai.co/post/llmlingua-vs-longllmlingua-vs-recomp-choosing-the-right-prompt-compression
[^18^]: ZongqianLi/500xCompressor README (ACL 2025 Main) — https://github.com/ZongqianLi/500xCompressor ; Einordnung „NOT deployable for closed CLIs" in evolve-loop KB — https://github.com/mickeyyaya/evolve-loop/blob/main/knowledge-base/research/token-optimization-2026/part1-context-compression.md
[^19^]: NodeNestor/claude-rolling-context README — https://github.com/NodeNestor/claude-rolling-context
[^20^]: claw-compactor README/ARCHITECTURE — https://github.com/open-compress/claw-compactor ; OpenAgentSkill-Audit (Trust 84/100), 2026-07-30 — https://www.openagentskill.com/skills/open-compress-claw-compactor/audit
[^21^]: Madhan230205/token-reducer README — https://github.com/Madhan230205/token-reducer
[^22^]: toon-format/toon, packages/toon/README.md — https://github.com/toon-format/toon
[^23^]: repomix README (--compress) — https://github.com/yamadashy/repomix
[^24^]: glincker/stacklit Discussion #13, „Stacklit vs Repomix vs code2prompt vs Aider repo-map", 2026-04-13 — https://github.com/glincker/stacklit/discussions/13
[^25^]: fkiene/llmtrim README — https://github.com/fkiene/llmtrim
[^26^]: jia-gao/leanctx README (LongBench-v2-Zahlen) — https://github.com/jia-gao/leanctx
[^27^]: sriinnu/clipforge-PAKT README — https://github.com/sriinnu/clipforge-PAKT
[^28^]: PCIRCLE-AI/toonify-mcp README — https://github.com/PCIRCLE-AI/toonify-mcp
[^29^]: ojuschugh1/sqz README — https://github.com/ojuschugh1/sqz
[^30^]: DietrichGebert/ponytail README/Benchmarks — https://github.com/DietrichGebert/ponytail
[^31^]: JuliusBrussee/caveman README + Release v1.10 (JetBrains-8,5 %-Aufnahme) — https://github.com/JuliusBrussee/caveman ; lyrastellai.com SIGNAL — https://lyrastellai.com/repos
[^32^]: BlockRunAI/ClawRouter README — https://github.com/BlockRunAI/ClawRouter
[^33^]: READMEs: gitingest (https://github.com/coderamp-labs/gitingest), code2prompt (https://github.com/mufeedvh/code2prompt), files-to-prompt (https://github.com/simonw/files-to-prompt), yek (https://github.com/mohsen1/yek)
[^34^]: RonnieTheTester/headroom-meter README — https://github.com/RonnieTheTester/headroom-meter
[^35^]: viblo.asia, „Optimizing AI Agents: Token Economics" (LLMLingua bricht Prompt-Cache; Headroom/RTK komplementär), 2026-08-03 — https://viblo.asia/p/optimizing-ai-agents-token-economics-the-harness-context-engineering-kNLr3r17VgA
[^36^]: awesome-agentic-stack NPM-Listing (Kategorie-Einordnung, Spar-Claims im Überblick), 2026-05-30 — https://libraries.io/npm/awesome-agentic-stack
