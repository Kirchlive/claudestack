# dim07: Code-Intelligence & Explorationsvermeidung

**Dimension:** Graphs/Indizes/LSP, damit der Agent nur relevante Symbole liest statt ganzer Dateien/Repos.
**Stand:** 2026-08-13 · **Analyst:** Deep-Dive-Agent dim07

**Kernbefund in einem Absatz:** Der Mechanismus funktioniert — vorberechnete Code-Indizes senken Tool-Calls und Navigations-Tokens nachweisbar und reproduzierbar (unabhängig bestätigt: −55 % Tool-Calls für codegraph auf fremdem Repo[^11^]). Der Dollar-Effekt ist dagegen klein bis nicht messbar, sobald man End-to-End misst: Im offenen THOL-Benchmark (12 Tools, ganze Sessions) landet codegraph auf Platz 9 ohne messbare Ersparnis[^9^], und der unabhängige Hono-Test zeigt Kosten-Wash (+6,8 %) bzw. 20–43 % **Mehrkosten** bei engen Fragen[^11^]. Grund: Navigation ist nur eine Teilmenge des Bills; File-Reads, Command-Output und Transcript-Replay dominieren, und Graph-Antworten hinterlassen bis zu +80 % residenten Retrieval-Kontext am Sessionende[^2^]. Fazit: Index ja — aber gezielt (große/unbekannte Repos, breite Architektur-Fragen), mit minimalem Tool-Manifest, und immer kombiniert mit Output-Filtern (dim01) und Compact-Disziplin (dim02). Anthropic selbst hat bewusst keinen Index eingebaut: „agentic search generally works better"[^12^].

## Vergleichsmatrix

| Tool | Mechanismus | Sprachen | Editing | Index-Frische | Setup-Aufwand | MCP-Manifest (Def-Kosten) | E2E-Evidenz (ehrlich) | Reife |
|---|---|---|---|---|---|---|---|---|
| **codegraph** | AST-Graph (tree-sitter + Rust-Kernel), SQLite+FTS5, **keine Vektoren** | 20 nativ (30+ gelistet) | Nein (nur `affected` für Testauswahl) | **Best-in-class:** Watcher 2 s Debounce, ⚠️-Staleness-Banner, Connect-Catch-up[^2^] | Gering: 1 Installer + `codegraph init` pro Projekt | **1 Tool default** (`codegraph_explore`); Rest versteckt, via `CODEGRAPH_MCP_TOOLS` aktivierbar — minimal möglich[^2^] | Vendor: −62 % Tokens, −44 % Kosten (sauberes Harness, CLI in beiden Armen geblockt)[^2^]. Unabhängig: Tool-Calls reproduzieren, Kosten nicht[^11^]. THOL: keine E2E-Ersparnis (9/12)[^9^] | 66,1k★, 411 offene Issues, aktiv (Push 08-08) |
| **serena** | **LSP (compiler-grade)** default; JetBrains-Plugin optional | 40+ (LSP), alle JetBrains-Sprachen | **Ja — einziger:** replace_symbol_body, insert before/after, rename, safe delete[^4^] | LSP live, aber bekannte Staleness-Bugs (Clojure #1593, zls rename #1744)[^16^] | Mittel: `uv tool install serena-agent` + `serena init` + Client-Config | ~25–30 Tools; Basis-Tools (read_file, shell) in Claude Code default deaktiviert[^4^]; YAML-Scoping | Kein Token-Benchmark; Agenten-Jury (~20 Routine-Tasks) positiv[^4^]; unabhängig „stärkste Navigation"[^9^]; agent-bench: SITUATIONAL[^13^] | 27,9k★, 92 Issues, sehr aktiv |
| **codebase-memory-mcp** | AST-Graph, 158 Sprachen vendored tree-sitter, single static binary, RAM-first → SQLite-Dump | 158 | Nein | Watcher + `auto_index`, **aber:** offene Staleness-Bugs #1296/#1191 (MCP serviert stale Graph nach Reindex, silent)[^16^] | Gering: Install-Skript, kein Runtime/API-Key | **15 Tools** (search, trace, cypher, ADR …) ≈ mittleres Manifest[^6^] | arXiv-Preprint (31 Repos): 10× weniger Tokens, 2,1× weniger Tool-Calls, 83 % Answer-Quality[^6^]. Marketing-99,2 % ist Whole-Corpus-Baseline (412k→3,4k)[^6^] | 38,7k★, 453 Issues, sehr aktiv |
| **code-review-graph** | AST-Graph + **optionale Vektor-Embeddings** (hybrid FTS5), Leiden-Communities | ~40 + Jupyter | Teilweise (refactor/apply_refactor) | Hooks/Watch-Daemon, SHA-256-Inkrement (2,5 s auf 3k-Dateien)[^3^]; GitHub Action | Mittel: pip + `install` + `build`; optionale Extras | **30 Tools default — größtes Manifest**; Allowlist via `--tools`/`CRG_TOOLS`[^3^] | 65× median vs. Whole-Corpus (= Obergrenze, ehrlich deklariert); Impact-F1 0,69 mit zirkulärem Recall-1,0-Caveat[^3^]. Unabhängig (computingforgeeks): nur −5 % Gesamttokens auf Standard-Task[^14^] | 29,9k★, 88 Issues |
| **claude-context** | **Vektor (BM25 + dense)**, AST-Chunking, Merkle-Incremental | 14 | Nein | Merkle-Tree-Reindex geänderter Dateien | **Höchster:** externe Vector-DB (Milvus/Zilliz) + Embedding-API-Key[^5^] | **4 Tools** — kleinstes Manifest[^5^] | ~40 % eigene Eval bei gleicher Retrieval-Qualität[^5^]; Review-Notiz 6,8/10 (Setup-Nachteil); Issue #165 „Using a lot of embedding tokens!"[^16^] | 12,4k★, 136 Issues, letzter Push 07-14 (mäßig aktiv) |
| **graphify** | **Skill** (kein MCP-first), tree-sitter AST für Code + LLM-Extraktion für Docs/PDF/Bilder; kein Vector-Store | ~33–40 Code + multimodal | Nein | Post-Commit-Hook + `--watch` (Code sofort, Docs manuell `--update`)[^1^] | Gering: `pip install graphifyy && graphify install`, `/graphify .` | Skill = Progressive Disclosure (~100 Tokens Frontmatter); MCP-Modus optional; PreToolUse-Hook injiziert Hinweis[^1^][^15^] | 71,5× Vendor **kein E2E** (Subgraph vs. Whole-Corpus, Zeichen-Schätzung)[^15^]; unabhängig ~60 % (203 Dateien)[^17^], −80 % Tokens / −60 % Zeit (juejin)[^25^], 22,7 % Session-Gesamt (Tencent-Praxis)[^26^]; Accuracy +11 pp auf ERPNext[^15^] | 105,7k★ (Markt-Leader), 915 Issues (!), sehr aktiv |
| **token-savior** | Symbol-Index + Memory-Engine + Bash-Rewriter/Compactor (Hybrid: dim01+dim07) | Index symbol-basiert | Ja (strukturelles Editing hält Index synchron)[^7^] | File-Watcher (`auto/on/off`) | Gering: pip + env; `ts init` merged Hooks | **Profile mit gemessenen Manifest-Kosten:** tiny 6 Tools ≈ 0,6 KT · optimized 15 ≈ 1,5 KT · full 68 ≈ 6 KT; thin schemas −44 %[^7^] | tsbench 97,9 % / −80 % Tokens: **explizit unverifiziert**, Harness-Repo 404, Re-Messung zurückgezogen (Tools wurden nie aufgerufen — Deferred-Tool-Loading)[^7^]. Unabhängig (computingforgeeks): −43 % Gesamttokens, bester Wert im Test[^14^] | 1,1k★, 0 offene Issues |
| **jcodemunch-mcp** | tree-sitter Symbol-Index, byte-präzise Retrieval, MUNCH-Encoding (−45 % Bytes), SCIP-Verifikation | 70+ | Retrieval-Fokus (edit-ready Blöcke) | Watch-Modi, Agent-Hooks, VS-Code-Ext[^8^] | Gering: pip + `jcodemunch-mcp init` | **90+ Tools — Manifest-Risiko**, Tool-Tiering in CONFIGURATION.md[^8^] | 27,9× vs. **grep-top-3-Baseline** (fairestes Design)[^8^]; A/B Produktions-Repo: 80 vs. 72 % Erfolg, 15–25 % Tool-Layer-Savings[^8^]. **Lizenz: Dual-Use — kommerzielle Nutzung kostenpflichtig ($79–2 499)**[^8^] | 2,5k★, 11 Issues |

**Manifest-Kosten (MCP-Tool-Definitionen):** Einziger gemessener Datenpunkt ist token-saviors Profil-Tabelle: ~90–160 Tokens/Tool (thin) bzw. ~2× mit vollen Schemas[^7^]; die Community-Schätzung „~1k/Tool" gilt nur für sehr verbose Schemas. Praxisgrößen: codegraph ≈ minimal (1 Tool), claude-context klein (4), CBM mittel (15), serena mittel-groß (teil-auto-deaktiviert), CRG groß (30), jcodemunch am größten (90+). Bei 200k-Fenster sind 30 Tools à ~200 Tokens ≈ 6k Tokens ≈ 3 % — relevant, aber zweitrangig gegenüber residenten Retrieval-Payloads.

## Detailprofile

### 1. codegraph (colbymchenry) — der sauberste Benchmark, der ehrlichste Disclaimer
- **Installation:** `install.sh`/npm → `codegraph install` (wired MCP in 9 Agents, schreibt CLAUDE.md-Sektion + Auto-Allow) → `codegraph init` pro Projekt (baut `.codegraph/codegraph.db` sofort)[^2^].
- **Token-Mechanik:** Ein `codegraph_explore`-Call liefert verbatim Source der relevanten Symbole + Call-Pfade + Blast-Radius; Agent liest null Dateien (in allen 7 Benchmark-Repos: 0 File-Reads)[^2^]. Instruktionen steuern den Agenten zu direkten Calls statt Explore-Subagents — sonst liest der Subagent trotzdem Dateien und der Graph wird Overhead[^2^].
- **Frische:** Drei Schichten — nativer Watcher (2 s Debounce, `CODEGRAPH_WATCH_DEBOUNCE_MS`, 100 ms–60 s), ⚠️-Banner pro pending File mit Anweisung „Read direkt", Connect-Time-Reconciliation via (size, mtime) + Content-Hash[^2^]. Referenz-Implementierung für Staleness-Behandlung.
- **Benchmark-Design:** Best-in-class unter den Vendoren: Opus 4.8 headless, 4 Runs/Arm, Median, **`codegraph`-CLI per PATH-Sanitizing + PreToolUse-Hook in beiden Armen geblockt** — ohne Block fand der Kontroll-Arm den CLI in 26/28 Runs (Kontamination)[^2^]. Ehrliches Caveat: +80 % residenter Retrieval-Kontext (67k vs. 18k Tokens auf VS Code) — „fewer tokens processed AND larger persistent footprint are both real at once"[^2^].
- **Schwächen:** Offene Korrektheits-Issues (#1545 PHP-Alias, #1355 globaler Callback-Resolver, #1373 C-Makros)[^16^]; nur 4 Runs/Repo; Repo-Auswahl durch Vendor.

### 2. serena (oraios) — compiler-grade, einziger mit Editing
- **Mechanik:** Kein eigener Index — der LSP-Server *ist* der Index (live, symbol-genau). Tools: find_symbol, get_symbols_overview, find_referencing_symbols + **symbolisches Editing** (replace_symbol_body, insert_before/after_symbol, rename) + Memory-System[^4^]. Symbol-Level-Edits sind token-effizienter und weniger fehleranfällig als search&replace.
- **Installation:** `uv tool install -p 3.13 serena-agent`, `serena init`, Launch-Command im Client. Basis-Tools (read_file, search_for_pattern, shell) sind in Claude-Code-/Codex-Kontext **default deaktiviert**, weil redundant — gutes Scoping-Vorbild[^4^]. Konfigurierbar per YAML (Contexts, Modes, per-Projekt).
- **Evaluierung:** Bewusst kein Token-Claim — stattdessen „Agent-as-Judge" (~20 Routine-Tasks, Opus 4.6/GPT 5.4 urteilen übereinstimmend positiv)[^4^]. Unabhängig: von tokenade als „stärkste Navigation" bewertet[^9^]; agent-bench auf lokalen Modellen: SITUATIONAL — Verschiebung von „confidently wrong" zu „incompletely right"[^13^].
- **Schwächen:** LSP-Staleness/Silent-Failures in offenen Issues (#1593 stale find_symbol, #1744 rename lässt Referenzen stale zurück, #1712 Vue/Svelte)[^16^]; Sprachserver-Qualität variiert je Sprache; Start-Latenz des LS.

### 3. codebase-memory-mcp (DeusData) — Speed-Dämon mit Staleness-Baustelle
- **Mechanik:** Single static binary (C), 158 vendored tree-sitter-Grammatiken, RAM-first (LZ4, in-memory SQLite, ein Dump am Ende); Linux-Kernel (75k Dateien) in 3 min, Cypher-Queries <1 ms[^6^]. 15 MCP-Tools inkl. openCypher-Read-Subset, ADR-Management, Runtime-Trace-Ingestion. Explizit **kein eingebautes LLM** („the agent you're already talking to IS the query translator")[^6^].
- **Evidenz:** arXiv:2603.27277 — 31 Repos: **10× weniger Tokens, 2,1× weniger Tool-Calls, 83 % Answer-Quality**[^6^]. Die beworbene 99,2 % (5 Queries: 3,4k vs. 412k) misst gegen file-by-file-Whole-Corpus — Obergrenze, kein E2E.
- **Kritisch:** Offene Staleness-Issues #1296 (MCP serviert stale Graph „indefinitely" nach Watcher-Reindex), #1191 (stale cached store, silent, POSIX), #1213 (stale head_sha)[^16^] — der schwerste Fall im Feld, weil *silent wrong answers* drohen. 453 offene Issues signalisieren Wachstumsschmerzen.

### 4. code-review-graph (tirth8205) — Review-Spezialist, ehrlichster Limitations-Abschnitt
- **Mechanik:** tree-sitter-Graph + optionale Embeddings (lokal all-MiniLM-L6-v2 oder Cloud: Voyage/OpenAI/Gemini — **Egress-Warnung eingebaut**[^3^]). Blast-Radius auf Caller/Dependents/Tests; `get_minimal_context_tool` (~100 Tokens, „call this first"); `detect_changes` für PR-Risk-Scoring; GitHub Action als Merge-Gate[^3^].
- **Manifest:** **30 Tools default** — bei Token-Knappheit `--tools query_graph_tool,semantic_search_nodes_tool,detect_changes_tool` oder `CRG_TOOLS`[^3^]. Plus 5 MCP-Prompts.
- **Evidenz & Ehrlichkeit:** 65× median per-question, aber explizit als Whole-Corpus-Obergrenze deklariert; realistischere `agent_baseline`-Eval (grep top-3) vorhanden; Impact-Recall 1,0 als **zirkulär** gekennzeichnet (Ground Truth aus demselben Graph); Co-Change-Modus liefert aktuell 0 Predictions („harness needs fixing")[^3^]. Unabhängig gemessen (computingforgeeks): nur **−5 % Gesamttokens** auf Standard-Task — schwächster Wert der getesteten Index-Tools[^14^].
- **Sweet Spot:** PR-Review/CI (risk-scored sticky comments), weniger der tägliche Navigationsersatz.

### 5. claude-context (zilliztech) — bester Retrieval-Ansatz, schwerstes Setup
- **Mechanik:** Hybrid BM25 + dense Vectors, AST-basiertes Chunking (keine Funktion wird zerschnitten), Merkle-Tree-Inkremental-Index; 14 Sprachen; Embedding-Provider OpenAI/Voyage/Ollama/Gemini[^5^].
- **Setup-Nachteil:** Braucht Milvus/Zilliz-Cloud + Embedding-API-Key — externe Infrastruktur + zweite Rechnung; Issue #165 „Using a lot of embedding tokens!" zeigt laufende Index-Kosten[^16^]. Nur 4 MCP-Tools (index_codebase, search_code, clear_index, get_indexing_status) — Manifest-seitig das sauberste[^5^].
- **Evidenz:** ~40 % Token-Reduktion „bei äquivalenter Retrieval-Qualität" (eigene Eval)[^5^]. tokenade: „beste Retrieval-Qualität, wenn man Infrastruktur bezahlt"[^9^]. Gegenläufig: genau dieser Vektor-Ansatz ist der, den Anthropic verworfen hat[^12^].

### 6. graphify (Graphify-Labs) — Markt-Leader nach Stars, multimodal, Skill statt MCP
- **Mechanik:** `/graphify`-Skill: tree-sitter AST + Call-Graph für Code, LLM/Vision-Extraktion für Markdown/PDF/Bilder/SQL; Leiden-Communities, God-Nodes, Kanten getaggt EXTRACTED/INFERRED/AMBIGUOUS; Ausgabe: GRAPH_REPORT.md + graph.json + HTML/Wiki/Obsidian[^1^]. Token-Benchmark wird nach jedem Lauf gedruckt.
- **Frische:** SHA-256-Cache (nur geänderte Dateien), `--watch` (Code sofort, LLM-frei; Docs → Hinweis auf `--update`), `graphify hook install` (post-commit)[^1^].
- **Evidenz — differenziert:** 71,5× ist Subgraph-Query vs. Whole-Corpus-Hypothese mit Zeichen-Schätzung — **kein E2E** (8cast-Kritik)[^15^]; vendor-eigener Code-Agent-Test: Faktenabdeckung 70,8 → 82,0 % bei ~140k Tokens/Frage (echter Accuracy-Gewinn, kein Token-Gewinn)[^15^]. Unabhängig: ~60 % auf 203-Dateien-Repo (Video-Demo)[^17^], −80 % Tokens/−60 % Zeit (juejin, Sonnet 4.6)[^25^], 22,7 % Session-Gesamtersparnis (Tencent-Praxisbericht)[^26^]. Ehrlich im README: 6-Dateien-Korpus → ~1× („Graph value is structural clarity, not compression")[^1^].
- **Risiken:** 915 offene Issues, davon Dokumentations-Fehler (#2640: ARCHITECTURE.md beschreibt nichtexistierende Funktionen) — Qualitäts-/Wartungsfrage bei 105k★[^16^].

### 7. token-savior (Mibayy) — der Lehre-reichste Kandidat
- **Mechanik:** Drei Schichten: Symbol-Index (Navigation per Pointer statt `cat`), Memory-Engine (SQLite WAL + FTS5 + Vektoren, Session-Delta), Bash-Layer (PreToolUse-**Rewriter** = echte Turn-Reduktion; PostToolUse-**Compactors** = können nur Kontext *hinzufügen*, sichern Output über Compaction — ehrlich unterschieden)[^7^].
- **Manifest-Transparenz (einziger mit Zahlen):** Profile: tiny 6 Tools/0,6 KT, optimized 15/1,5 KT (Pareto-Empfehlung), lean 51/4 KT, full 68/6 KT, compact-only 1 Tool/0,3 KT[^7^].
- **Evidenz-Status:** tsbench 97,9 % @ −80 % Tokens ist **unverifiziert** (Harness privat/404); publizierte Re-Messung 2026-08-09 wurde nach einem Tag zurückgezogen: In 143 Sessions wurde genau 1× ein TS-Tool aufgerufen — MCP Deferred-Tool-Loading versteckte alle 18 Tools hinter ToolSearch; Lehre: „a benchmark of an MCP server must assert that its tools were actually called"[^7^]. Unabhängig (computingforgeeks): **−43 % Gesamttokens — Bester im 12-Tool-Feld** auf der Standard-Task[^14^].
- **Kompositions-Matrix im README:** gegen serena → `compact-only`-Profil; gegen codebase-memory → `TS_MEMORY_DISABLE=1`; gegen RTK → `TS_BASH_COMPACT=0`[^7^] — Referenz für dim01/dim02-Integration.

### 8. jcodemunch-mcp (jgravelle) — fairstes Baseline-Design, aber Lizenz-Falle
- **Mechanik:** tree-sitter Index (70+ Sprachen), byte-präziser Symbol-Fetch, MUNCH-Wire-Format (−45,5 % Bytes median), SCIP-verifizierte Referenzen, Secret-Redaktion vor LLM, `stop_rule.terminal` gegen Endlos-Nachfragen[^8^].
- **Benchmark:** Bester Baseline unter allen: **grep-top-3** („what a competent agent actually does") → 27,9× / 96,4 %; read-all 237× explizit als „ceiling nobody pays" markiert; per-query 7,3×–84,3×[^8^]. A/B auf Produktions-Repo (50 Iterationen, Sonnet 4.6): Erfolg 80 vs. 72 %, Tool-Layer-Savings 15–25 %[^8^]. Ehrliche Anti-Use-Cases: Whole-File-Edits → ~0 %[^8^].
- **Lizenz — Blocker für Firmen:** Dual-Use, **kommerzielle Nutzung erfordert Paid License ($79/$349/$1 999)**, kein OSI; kein Rename/Rebrand/Registry-Upload[^8^]. Zudem default-Telemetry (Savings-Counter, opt-out) und 90+ Tools im Manifest (Tiering nötig)[^8^].

## Sekundär-Repos Kurzliste

| Repo | ★ | Was | Kurzurteil |
|---|---|---|---|
| cmillstead/codesight-mcp | 1 | jcodemunch-Fork, security-gehärtet, 34 Ops, 66 Sprachen, optionaler Single-`query`-Dispatcher[^21^] | Technisch solide (2 594 Tests), aber 1★/14 Issues — zu jung für Produktion; Dispatcher-Pattern reduziert Manifest-Kosten interessant |
| sdsrss/code-graph-mcp | 61 | Rust, tree-sitter AST-Graph, Auto-Index 10 Sprachen, Route-Tracing[^22^] | Leichtgewicht, 0 Issues (wenig Nutzung), keine Benchmarks |
| Aider-AI/aider (repo-map) | 48,2k | Kein MCP — **Konzept-Spender**: tree-sitter Tags + PageRank + token-budgeted Rendering der Repo-Map (`--map-tokens`)[^18^] | Das einzige Design, das ein Agent *immer* im Kontext hält statt on-demand abzufragen; Komplementär-Idee zu allen Indizes (statische Orientierung ~1–2k Tokens) |
| dereira/goldfish | 2 | Go-Port des aider-Repomap-Algorithmus (PageRank über Symbol-Graph, `⋮` für Bodies)[^19^] | Minimal-Implementierung; nützlich als standalone Repo-Map-Generator für CLAUDE.md-Artige Kontexte |
| Barnett-Studios/cxpak | 25 | Rust, 43 Sprachen, token-budgeted „briefing packets" statt Repo-Dump, Risiko-Profile, Dashboard[^20^] | „Under development; the surface still moves" — beobachten, nicht einsetzen |
| manojmallick/sigmap | 614 | ~97 % Claim, zero deps, 33 Sprachen, MCP[^23^] | Hauptabdeckung in dim04; hier nur als Mechanik-Vergleich (Skeleton/Signature-Map statt Graph) |

## E2E-Evidenz-Prüfung (Claim vs. unabhängig)

| Tool | Vendor-Claim | Unabhängig gemessen | Urteil |
|---|---|---|---|
| codegraph | −62 % Tokens, −44 % Kosten (7 Repos, CLI geblockt)[^2^] | Hono (~280 Dateien): Tool-Calls −55 % ✓, Tokens −23 % ~, **Kosten +6,8 % ✗**; enge Fragen 20–43 % **teurer**; breite Frage −29 % Kosten ✓[^11^]. THOL (Sessions E2E): **keine messbare Ersparnis, 9/12**[^9^] | Tool-Call-Winn robust, Dollar-Winn situationsabhängig (Repo-Größe × Fragenbreite); begrenzt Varianz (max 16 statt 47–52 Calls)[^11^] |
| graphify | 71,5× pro Query[^1^] | ~60 % (203 Dateien)[^17^]; −80 % Tokens/−60 % Zeit[^25^]; 22,7 % Session-Gesamt[^26^]; Accuracy +11 pp (vendor E2E)[^15^] | Real, aber Größenordnung 2–5× nicht 70×; Corpus-abhängig |
| codebase-memory-mcp | 99,2 % (412k→3,4k)[^6^] | arXiv (eigen, aber akademisch): 10× Tokens, 2,1× Tool-Calls[^6^]; keine Drittstudie | 99,2 % = Baseline-Artefakt; 10× plausibel; Staleness-Bugs mindern Vertrauen[^16^] |
| code-review-graph | 65× median[^3^] | computingforgeeks: **−5 % Gesamttokens**[^14^]; vendor deklariert Recall-Caveat selbst[^3^] | Für Review-Workflows brauchbar; als Token-Sparer überbewertet |
| claude-context | ~40 % (eigene Eval)[^5^] | Keine Drittstudie; Review 6,8/10 (Setup); THOL nicht im aktuellen Campaign[^9^] | Plausibel für große Repos; Setup+Embedding-Kosten gegenrechnen |
| token-savior | 97,9 % @ −80 % (tsbench)[^7^] | Vendor sagt selbst: unverifiziert[^7^]; computingforgeeks: **−43 % Gesamttokens, Feld-Bester**[^14^] | Unabhängiger Wert glaubwürdiger als Headline; Hybrid sticht reine Indizes |
| jcodemunch | 27,9× vs. grep-top-3, 96,4 %[^8^] | A/B produktiv: 15–25 % Tool-Layer[^8^]; Dritt-Zitate (VirtusLab: ~80 %/5×)[^8^] | Glaubwürdigstes Retrieval-Design; Lizenz limitiert Einsatz |
| serena | kein Token-Claim (Agenten-Jury)[^4^] | agent-bench: SITUATIONAL[^13^]; tokenade: stärkste Navigation[^9^] | Wert liegt in Edit-Qualität/Zuverlässigkeit, nicht in Token-Bilanz |

**Übergreifendes Muster:** Alle „×-fach"-Zahlen messen Query-Isolation gegen Whole-Corpus- oder Read-all-Baselines. Sobald die Baseline ein kompetenter grep+read-Agent ist, schrumpft das auf 5–27×; sobald **E2E-Sessions mit Kosten** gemessen werden, auf 0–43 %; und bei kurzen/engen Fragen kann der Index **teurer** sein als native Suche[^11^][^14^].

## Konflikte & Fallstricke

1. **Anthropic-Position vs. Index-Layer:** Boris Cherny (Creator Claude Code): „Early versions of Claude Code used RAG + a local vector db, but we found pretty quickly that agentic search generally works better" — simpler, ohne Security-/Privacy-/Staleness-/Reliability-Probleme[^12^]. **Wichtige Differenzierung:** Das Urteil trifft Vektor-RAG (claude-context). Struktur-Graphen mit Watcher (codegraph) adressieren Staleness konstruktiv, und LSP (serena) kennt sie prinzipiell nicht. Trotzdem deckt sich die unabhängige Messung mit Anthropic: Für den *Gesamtbill* ändert ein Index wenig[^9^][^11^].
2. **Residente-Kontext-Falle:** Graph-Antworten sind dichte Payloads, die im Fenster bleiben (+80 % bei codegraph)[^2^]. In langen Sessions mit kleinem Fenster kann der „Sparer" die Compact-Schwelle *schneller* erreichen lassen → mit dim02-Strategie verrechnen.
3. **Silent Staleness = schlimmster Fehlermodus:** CBM #1296/#1191 (stale Graph indefinite, silent)[^16^], serena #1593/#1744[^16^]. Nur codegraph signalisiert Staleness aktiv (⚠️-Banner)[^2^]. Regel: Ohne Staleness-Signal kein Vertrauen in Absence-Claims („X wird nirgends aufgerufen").
4. **False Positives by design:** CRG Impact ist bewusst konservativ (Precision ~0,55)[^3^]; codegraph-Korrektheits-Issues bei Aliasen/Makros/Callbacks[^16^]. Blast-Radius ≠ Wahrheit — als Lese-Empfehlung, nicht als Beweis nutzen.
5. **Benchmark-Kontamination (beide Richtungen):** CLI auf PATH im Kontroll-Arm (codegraph: 26/28 Runs kontaminiert ohne Block)[^2^]; PreToolUse-Hooks des getesteten Tools wirken im Kontroll-Arm mit (token-savior: `TS_GUARD_OFF` nötig)[^7^]; Deferred-Tool-Loading macht Tools unsichtbar → „Benchmark" misst zwei identische Agenten[^7^]. Zirkuläre Ground Truth (CRG Impact-Recall 1,0)[^3^].
6. **Manifest-Überhang:** 30 Tools (CRG default) oder 90+ (jcodemunch) kosten Def-Tokens *und* verschlechtern Tool-Auswahl; codegraph zeigt mit 1-Tool-Surface die Gegenrichtung[^2^][^3^][^8^].
7. **Egress & Kosten der Indizierung selbst:** Cloud-Embeddings (claude-context Pflicht, CRG optional) senden Identifier/Docstrings an APIs; Issue #165 (hohe Embedding-Token-Kosten)[^16^]; graphify LLM-Pass für Docs sendet semantische Inhalte[^1^]. Lokale Alternativen: Ollama/all-MiniLM.
8. **Lizenz:** jcodemunch Dual-Use (kommerziell kostenpflichtig)[^8^]; token-optimizer PolyForm NC (Randnotiz)[^10^]. Für Firmen-Stacks nur MIT/Apache: codegraph, serena, CBM, CRG, claude-context, graphify, token-savior.
9. **Doppel-Navigator:** Zwei Index-MCPs parallel = doppeltes Manifest + widersprüchliche Hinweise. token-saviors eigene Matrix: serena als Navigator → TS auf `compact-only`; CBM parallel → `TS_MEMORY_DISABLE=1`[^7^].
10. **Qualität hinter den Stars:** graphify 105,7k★ bei 915 offenen Issues und Doku-Bugs (#2640)[^16^]; Stars ≠ Reife. Umgekehrt serena 27,9k★ mit sauberstem Engineering.

## Stack-Empfehlung für diese Schicht

**(i) Welcher Index für welchen Workflow — und wann nativ?**

- **Große unbekannte Codebase / Onboarding (mehrtägig):** codegraph (1 Tool, null Setup-Reibung, Frische-Signale) oder graphify, wenn Docs/PDFs/SQL zum Corpus gehören. Erwartung realistisch: weniger Tool-Calls & gebremste Worst-Cases, nicht halbe Rechnung[^2^][^11^].
- **Mono-Repo / Multi-Repo:** CBM (Index-Speed, cross-repo Cypher) — **aber** erst nach Fix von #1296/#1191 oder mit manuellem Reindex-Ritual[^16^]; alternativ codegraph mit `projectPath` je Sub-Repo[^2^].
- **PR-Review / CI:** code-review-graph (detect_changes, Risk-Scores, GitHub Action, Merge-Gate) — hier ist der Blast-Radius der eigentliche Mehrwert, nicht Token-Sparen[^3^].
- **Tägliches Editieren (Refactor-lastig):** serena — der einzige, der *schreibt* (symbolische Edits statt search&replace); Token-Gewinn zweitrangig, Fehlervermeidung primär[^4^].
- **Konzept-Fragen auf sehr großen Repos („wo wird Auth gehandhabt?"):** claude-context — der einzige semantische (nicht nur strukturelle) Retrieval; nur wenn Setup/Infra tragbar[^5^].
- **Nativ (agentische Suche) besser bei:** Repos < ~100–300 Dateien; einmalige/enge Fragen (Hono: 20–43 % teurer mit Index)[^11^]; Greenfield mit stündlichem Umbau (Index hinkt); kurzen Sessions in kleinem Fenster (residente Payloads schaden)[^2^]; und immer dann, wenn kein Staleness-Signal existiert. Anthropic baut bewusst ohne Index[^12^].

**(ii) Konfiguration gegen den Kontext-Fresser:**

1. Manifest minimieren: codegraph bei 1 Tool belassen (kein `CODEGRAPH_MCP_TOOLS` ohne Grund)[^2^]; CRG per `--tools`-Allowlist auf 3–5 Tools[^3^]; token-savior `TOKEN_SAVIOR_PROFILE=optimized` oder `tiny`[^7^]; jcodemunch Tool-Tiering[^8^]; serena Basis-Tools deaktiviert lassen + YAML-Scoping[^4^].
2. **Projekt-lokal aktivieren** (`.mcp.json` im Repo), nicht global — der Server läuft nur, wo auch indexiert ist; Index-Befehl (`init`/`build`/`index_codebase`) erst bei Repo-Größe > Schwelle.
3. Embeddings lokal halten (all-MiniLM/Ollama) oder Cloud-Egress bewusst freischalten[^3^][^5^].
4. Deferred-Tool-Loading-Falle prüfen: Tools, die hinter ToolSearch verschwinden, werden nie aufgerufen — Nutzen kollabiert, Manifest-Rest bleibt[^7^]. Lieber gar nicht laden als deferred.
5. Ein Navigator pro Session; Kombinationen über die dokumentierten Off-Schalter (TS compact-only/memory-disable)[^7^].

**(iii) Kombinierbarkeit mit dim01 (Output-Filter) und dim02 (Compact):**

- **Komplementär, nicht redundant:** Indizes adressieren *Input/Navigation*; dim01-Filter (rtk etc.) adressieren *Command-Output* — THOL zeigt, dass der Bill ohne Output-Filter stehen bleibt[^9^]. Empfohlener Stack: **ein Navigator + ein Output-Filter + Compact-Disziplin**. token-savior bündelt beides in einem Server (Rewriter = echte Reduktion; PostToolUse-Compactors = Persistenz über Compaction, keine Turn-Reduktion — sauber trennen)[^7^]. Niemals zwei PostToolUse-Kompaktoren stapeln (RTK vs. TS: einen wählen)[^7^].
- **Mit dim02 verrechnen:** Die +80 % residente Graph-Payload[^2^] macht aggressive `/clear`-/Compact-Disziplin *wichtiger*, nicht überflüssig. Capture-/Sandbox-Mechanismen (TS) sichern Tool-Outputs über Compaction — kompatibel und sinnvoll[^7^]. serena-Memories dienen als compact-resistente Struktur-Ablage[^4^].
- **Repo-Map (aider-Konzept) als statische Basis:** Eine ~1–2k-Token-PageRank-Repo-Map in CLAUDE.md/Skill ergänzt jeden On-Demand-Index um kostenlose Grundorientierung[^18^][^19^] — günstigster „Index" überhaupt, wenn er per Hook frisch gehalten wird.

**Ein-Zeilen-Empfehlung:** *Nimm serena, wenn du viel editierst; codegraph, wenn du viel erkundest; code-review-graph für PR-Gates; sonst bleib nativ — und kombiniere jeden Index mit dim01-Filterung und dim02-Compact-Disziplin, weil der Index allein den Bill nicht bewegt.*

## Quellen

[^1^]: Graphify-Labs/graphify — README (Installation, Token-Benchmark 71,5×, Watch/Hook, worked examples, ~1× auf 6 Dateien): https://github.com/Graphify-Labs/graphify
[^2^]: colbymchenry/codegraph — README (Install, Auto-Sync 3 Schichten, 1-Tool-MCP-Surface, Benchmark-Methodik inkl. CLI-Block, +80 % Residual-Context-Caveat, 2026-08-05 Re-Messung): https://github.com/colbymchenry/codegraph
[^3^]: tirth8205/code-review-graph — README (30 MCP Tools + CRG_TOOLS, Benchmarks 65× median, Limitations: zirkulärer Recall, agent_baseline, Embeddings-Egress): https://github.com/tirth8205/code-review-graph
[^4^]: oraios/serena — README (LSP vs. JetBrains, Retrieval/Editing/Refactoring-Tabellen, Basis-Tools default deaktiviert, Agenten-Evaluation, YAML-Config): https://github.com/oraios/serena
[^5^]: zilliztech/claude-context — README (4 MCP Tools, Hybrid BM25+dense, Merkle-Inkremental, ~40 % Eval, Setup: Milvus/Zilliz + OpenAI-Key): https://github.com/zilliztech/claude-context
[^6^]: DeusData/codebase-memory-mcp — README inkl. arXiv:2603.27277 (31 Repos: 10× Tokens, 2,1× Tool-Calls, 83 % Quality; Linux-Kernel 3 min; 99,2 % Claim; 15 Tools; auto_index/auto_watch): https://github.com/DeusData/codebase-memory-mcp · https://arxiv.org/abs/2603.27277
[^7^]: Mibayy/token-savior — README (Profil-Tabelle mit Manifest-Kosten, zurückgezogene Re-Messung + Deferred-Tool-Loading-Lektion, PreToolUse vs. PostToolUse, Kompositions-Matrix, tsbench-Status): https://github.com/Mibayy/token-savior
[^8^]: jgravelle/jcodemunch-mcp — README + LICENSE (grep-top-3-Benchmark 27,9×, A/B-Test, Anti-Use-Cases, 90+ Tools, Dual-Use-Lizenz $79–2 499): https://github.com/jgravelle/jcodemunch-mcp
[^9^]: Tokenade — „CodeGraph Alternatives: 6 Tools Compared" (THOL-Benchmark: codegraph 9/12, keine messbare E2E-Ersparnis; serena stärkste Navigation; Disclosure: THOL vom Autor gepflegt, nicht unabhängig): https://tokenade.net/en/articles/codegraph-alternatives
[^10^]: Tokenade — „Best Claude Code Token Optimizers (2026)" (THOL: nur 1/12 Tools senkt Session-Kosten messbar; claude-context Setup-Nachteil; Methodik-Notiz): https://tokenade.net/en/articles/best-claude-code-token-optimizers
[^11^]: Harrison — „I Tested CodeGraph on Hono" (unabhängig, 40 Runs Opus 4.8: Tool-Calls −55 % ✓, Kosten +6,8 % ✗, enge Fragen 20–43 % teurer, Varianz-Begrenzung, Raw-CSV): https://harrisonsec.com/blog/i-tested-codegraph-on-hono-benchmark/
[^12^]: Boris Cherny Primärquellen-Lage: X-Post 2026-02-01 („agentic search generally works better… security, privacy, staleness, reliability"), Latent Space 2025-05, HN 2025-03 — zusammengestellt: https://smartscope.blog/en/ai-development/practices/rag-debate-agentic-search-code-exploration/ und https://www.mecrankyoldguy.com/p/if-you-want-to-understand-claude
[^13^]: cipherfoxie/agent-bench — Serena-Verdict SITUATIONAL (lokale Modelle, harte Gates; Failure-Mode-Verschiebung): https://github.com/cipherfoxie/agent-bench
[^14^]: ComputingForGeeks — „Reduce Claude Code Tokens: 10 Tested Tools" (Leaderboard: token-savior −43 %, code-review-graph −5 %, claude-context 30–60 % auf Monorepos; Standard-Task 284k-Token-Baseline): https://computingforgeeks.com/reduce-claude-code-token-usage-tools/
[^15^]: Vibe Driven Coding (8cast) — Graphify-Kritik (71,5× ist kein E2E: Subgraph vs. Whole-Corpus, Zeichen-Schätzung; ERPNext-Test: Faktenabdeckung 70,8→82,0 % @ ~140k Tokens/Frage): https://vibecoding.8cast.io/2026-07-14
[^16^]: GitHub Issues (API, 2026-08-13): CBM #1296/#1191/#1213 (stale graph/store/head_sha), serena #1593/#1744/#1712 (stale/silent rename), claude-context #165 (embedding token costs), graphify #2640/#2092 (Doku-/Location-Bugs), codegraph #1545/#1373/#1355 (falsche Auflösungen): https://github.com/DeusData/codebase-memory-mcp/issues/1296 u.a.
[^17^]: meta-quantum.today — Graphify-Review (Video-Demo 203 Dateien: ~60 % Token-Reduktion, 80k vs. 200k; Good-fit/Bad-fit-Matrix): https://meta-quantum.today/?p=8475
[^18^]: aider — „Building a better repository map with tree sitter" (PageRank-Repomap, --map-tokens): https://aider.chat/2023/10/22/repomap.html
[^19^]: dereira/goldfish — README (Go-Port der aider-Repomap): https://github.com/dereira/goldfish
[^20^]: Barnett-Studios/cxpak — README (token-budgeted briefing packets; „surface still moves"): https://github.com/Barnett-Studios/cxpak
[^21^]: cmillstead/codesight-mcp — README (34 Ops, 66 Sprachen, query-Dispatcher, jcodemunch-Basis): https://github.com/cmillstead/codesight-mcp
[^22^]: sdsrss/code-graph-mcp — Repo-Metadaten (Rust, AST-Graph, 10 Sprachen): https://github.com/sdsrss/code-graph-mcp
[^23^]: manojmallick/sigmap — Repo-Metadaten (~97 % Claim, 33 Sprachen; Hauptabdeckung dim04): https://github.com/manojmallick/sigmap
[^24^]: LevelUp (gitconnected) — Praxisbericht codegraph (4 Repos, 1 Woche: −70 % Tool-Calls, −59 % Tokens; Skeptiker-Review): https://levelup.gitconnected.com/i-gave-claude-code-a-map-of-my-repo-codegraph-killed-70-of-its-tool-calls-9a7f8400a97d
[^25^]: juejin.cn — Graphify-Feldtest (Sonnet 4.6: −80 % Tokens, −60 % Zeit vs. pure Source): https://juejin.cn/post/7649956328409055267
[^26^]: Tencent Cloud Developer — Harness-Kostenpraxis mit graphify (Session-Gesamt: −22,7 % Tokens, Input als Hauptquelle; post-commit/post-checkout-Hooks): https://developer.cloud.tencent.cn/article/2714955
