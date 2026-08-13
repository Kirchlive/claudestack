# dim04: Formate & Packaging

**Token-effiziente Datenformate & Repo→Kontext-Packaging** — Serialisierungsformate (TOON & Co.), deterministische Struktur-Kompression (lossless-first), Signatur-Karten statt Volltext, Repo-Packer (Nutzen vs. Verschwendung). Stand: 2026-08-13.

**Kernaussage vorab:** Diese Schicht liefert die am leichtesten messbaren, aber am häufigsten überverkauften Einsparungen. Formate (TOON/PAKT) sparen 15–60 % auf *strukturierten* Payloads — gemessen fast immer gegen hübsch formatiertes JSON, gegen kompaktes JSON schrumpft der Vorteil auf ~Parität bei verschachtelten Daten. Signatur-Karten (sigmap, stacklit, goldfish) sind der größte Hebel für Repo-Kontext (Größenordnung 95–99 % statt 40–70 %), verlangen aber Disziplin bei der Aktualität. Volltext-Packer (repomix, yek) sind One-Shot-Werkzeuge; als Session-Dauerbrenner verschwenden sie Token.

## Vergleichsmatrix

| Tool | Ansatz | Typische Ersparnis (Eigenangabe) | Ehrliche Kehrseite | Integration in Claude Code | Reife (Stand 2026-08) |
|---|---|---|---|---|---|
| **toon-format/toon** (25,1k★) | Serialisierungsformat (JSON-Datenmodell, YAML-Einrückung + CSV-Tabellen) | −42,6 % vs. pretty JSON bei gleicher Accuracy (72,2 vs. 71,4 %) [^1^] | vs. *kompaktem* JSON nur −1,6 % auf Mixed-Track (teils teurer); multi-turn Parse-Brüchigkeit [^1^][^12^] | CLI (`npx @toon-format/cli --stats`), SDK; indirekt via toonify-mcp / Tooner-MCP-Proxy | Hoch (Spec v4.1, CI, Multi-Language-Ökosystem), aktiv gepflegt (Push 2026-08-07) [^2^] |
| **PCIRCLE-AI/toonify-mcp** (64★) | Auto-Filter für Tool-Output (JSON/YAML→TOON, Log-Faltung) | „trims large tool output", projekteigene Benchmarks-Seite | überspringt kurze Texte/kleine Dateien; auf Codex nur on-demand (sonst wächst Kontext!) | **Claude-Code-Plugin** (zero-config, nutzt `updatedToolOutput`-Hook), MCP-Modus, Pipe-Filter `toonify-mcp compress` [^3^] | Früh, aber aktiv (Push 2026-08-12); 0 offene Issues [^2^] |
| **manojmallick/sigmap** (614★) | Signatur-/Evidence-Karte (deterministisch, TF-IDF-Ranking, 33 Sprachen) | −96,8 % Token über 21 Repos; hit@5 82,2 % vs. 44,8 % grep-Baseline (1,59× Lift) | Token-Zahl gemessen gegen Volltext-Baseline, nicht gegen grep-Agent; Task-Success 64,8 % nur *modelliert*, nicht gemessen | `sigmap mcp install claude` → 21 MCP-Tools (`search_signatures`, `get_lines`, `get_diff_context`, `squeeze_output`, `verify_suggestion` …); `--adapter claude` schreibt CLAUDE.md [^4^] | Mittel-hoch (v8.24, Binär-Releases, VS-Code/JetBrains/Neovim-Plugins); offene Issues nur Marketing/Growth [^11^] |
| **sriinnu/clipforge-PAKT** (20★) | Lossless-first Kompression (L1 strukturell/TOON-inspiriert, L2 Dictionary, L3 tokenizer-aware; L4 opt-in lossy) | JSON typisch 27–33 %, Logs 57 %, dekomprimiert byte-identisch | kleines verschachteltes Config: **+25 % (expandiert)**; Comprehension-Eval nur 36 Fragen, eine Suite, Ceiling-Effekt (p=1,00) | `pakt serve --stdio` MCP (`pakt_compress`, `pakt_auto`, `pakt_inspect` …); Context-Engine mit Turn-übergreifender Dedup + Prompt-Cache-Hinweis [^5^] | Früh (20★), Kern (Lib/CLI/MCP) stabil deklariert; Desktop/Extension/Python-Wrapper unreif [^5^] |
| **open-compress/claw-compactor** (2,1k★) | 14-Stufen-Fusion-Pipeline (AST/tree-sitter, JSON-Sampling, SimHash-Dedup, reversibel via RewindStore) | gewichteter Ø 36,3 %; JSON-Peak 81,9 %; „15–82 %" | SWE-bench-Realaufgaben nur **11,8–19,1 %**; Banner-„98 %" Marketing; **stale seit 2026-04-01** | CLI `claw-compactor benchmark/compress`; Python-API; primär OpenClaw-Skill, keine native Claude-Code-Integration [^6^] | Mittel, aber eingeschlafen; 1 offenes Issue („How KISS is this?") [^11^] |
| **yamadashy/repomix** (27,8k★) | Volltext-Packer + Tree-sitter-`--compress` (Signatur-Extraktion) + Token-Budget | Plugin-Doku: ~70 % durch Kompression; Dumps sonst 50k–500k Token | Neu-Packen pro Turn = Kostenfaktor; `--compress` „experimental", nur datei-lokal (kein Cross-File-Graph); offene Korrektheits-Bugs (#1503 überspringt gleichnamige Dateien, #1765 .gitignore-Backslash) [^7^][^11^] | MCP (`claude mcp add repomix -- npx -y repomix --mcp`, optional `--sandbox`), offizielle Plugins (`repomix-mcp/-commands/-explorer`), `--skill-generate`, `--token-budget` als CI-Guard [^7^] | Hoch, sehr aktiv; Secretlint-Schutz eingebaut |
| **mohsen1/yek** (2,5k★) | Volltext-Packer (Rust), Git-History-Priorisierung, wichtige Dateien ans Ende (Recency-Attention) | keine Kompression — Budgetierung via `--tokens 128k` | Ranking-Fehler: Issue #255 „recency boost misranks core files"; Ignore-Bug #241 bei Submodul-Pfaden; „230× schneller als repomix" ist Äpfel/Birnen (Token-Counting) | reiner CLI, Ausgabe landet per Pipe/Datei im Prompt; kein MCP (Issue #232 offen) [^8^][^11^] | Mittel; letzter Push 2026-06-29 |
| **glincker/stacklit** (101★) | Struktur-Index (tree-sitter, 11 Sprachen) → committbares `stacklit.json` + ~250-Token-Navigationskarte | 108k LOC → ~4k Token Index; ~250 Token kompakte Karte statt „3.000–8.000 Token Exploration" | Vergleichszahlen stammen vom Autor selbst (Discussion #13, interessengebunden); Index muss frisch gehalten werden (Hook/Action) | `stacklit setup claude` (CLAUDE.md + `.mcp.json` + Git-Hook); MCP mit 7 Tools; `derive --inject claude` [^9^][^10^] | Früh-mittel; offene Issues = Feature-Requests (mehr Sprachen), keine Korrektheitsmeldungen [^11^] |

## Detailprofile

### 1. toon-format/toon — das Referenzformat (25,1k★, MIT, Spec v4.1)

**Was:** Token-Oriented Object Notation — verlustfreie Umkodierung des JSON-Datenmodells. YAML-artige Einrückung für Objekte, CSV-artige Tabellenform für uniforme Arrays (`name[N]{feld1,feld2}:` + Zeilen), keyed-tabellarische Form für Maps uniformer Objekte (`[2:]`), Listenform als Fallback. Explizite Längen `[N]` und Feldlisten `{fields}` wirken als „Guardrails" für das Modell. [^1^]

**Benchmarks (eigen, aber ungewöhnlich transparent):** 244 Retrieval-Fragen × 4 Modelle (claude-haiku-4-5, gemini-3.6-flash, gpt-5.4-nano, grok-4.5) × 6 Formate. TOON: 72,2 % Accuracy bei 2.474 Tokens vs. pretty JSON 71,4 % bei 4.308 → **−42,6 %**. Entscheidend für die Einordnung: gegen **kompaktes** JSON ist der Mixed-Structure-Track fast ausgeglichen (264.734 vs. 260.451 Tokens, +1,6 % zugunsten kompaktem JSON); die großen Gewinne (−32,7 % bis −66,5 %) entstehen gegen pretty-printed JSON/YAML/XML. Auf dem Flat-Track ist CSV nochmal ~6 % kleiner als TOON — TOON kauft mit dem Overhead deklarierte Längen/Feldlisten (Zuverlässigkeit, nicht Größe). Structural-Validation-Fragen: TOON 100 % vs. JSON 45–50 %. [^1^]

**„When NOT to use" (eigene Doku, ungewöhnlich ehrlich):** tief verschachtelt/non-uniform (tabellarische Eligibility ≈ 0 % → kompaktes JSON gewinnt), semi-uniform (~40–60 % → Ersparnis schrumpft), rein tabellar (CSV kleiner), Latenz-dominierte Setups (lokale/quantisierte Modelle verarbeiten kompaktes JSON trotz höherer Tokenzahl schneller — TTFT selbst messen). [^1^]

**Install/Nutzung:** `npm install @toon-format/toon` (SDK: `encode`, `encodeLines`-Streaming, `replacer`), CLI `npx @toon-format/cli data.json --stats` (zeigt Token-Delta), JSON↔TOON bidirektional. LLM-Hinweis der Doku: Format *zeigen* statt beschreiben, ``` ```toon ```-Blöcke, Tab-Delimiter spart weitere Token; `#`-Kommentarzeilen werden beim Dekodieren entfernt. Ökosystem: VS-Code-Extension, tree-sitter-toon, **Tooner (MCP-Proxy, der Tool-Responses JSON→TOON wandelt)**. [^1^]

**Issues:** nur 1 offenes (#19: Benchmark gegen Structured-Output-Endpoints) — kein Parsing-Bug-Backlog im Kern-Repo. Beim Python-Port (xaviviro/python-toon, 340★) dagegen Issue #2 „Kompression macht es langsamer" (Latenz) und #5 „Efficiency". [^11^]

**Externe Kritik (wichtig für die Matrix-Einordnung):** Die TRON-Studie (arXiv 2605.29676) misst TOON **in agentischen Tool-Calling-Loops**: −18 % Token, aber Accuracy-Verluste von 1–9 Prozentpunkten; bei *Tool Calls* (Modell generiert TOON) Parse-Fehler, die in Multi-Turn-Settings kaskadieren und den Gewinn auffressen — Fazit der Autoren: „not safe as a default". [^12^] Ferner: Matveev — der fixe Prompt-Overhead, um dem Modell die TOON-Syntax beizubringen, kann die Ersparnis bei kurzen Outputs aufheben (Break-even erst bei großen Payloads); Alshaer/S-TOON — fehlende explizite Delimiter erlauben, dass angreiferkontrollierte Strings als Schema-Felder reparst werden (Injection-Risiko bei untrusted Content); McMillan (9.649 Trials, 11 Modelle) — Format-Effekt insgesamt nicht signifikant, Modellfähigkeit dominiert (21 pp Gap). [^13^] Dritte Messungen: InfoQ-Beispiel −55 % vs. pretty, **−25 % vs. kompakt**; Orange-Force-Messung 15–26 % (sinkend mit Datensatzgröße). [^14^]

### 2. PCIRCLE-AI/toonify-mcp — Auto-Filter direkt im Claude-Code-Loop (64★, MIT)

**Was:** Kontext-Kompressions-Plugin für Claude Code, das großen Tool-Output (JSON, YAML, API-Responses, Stacktraces, Logs) trimmt, *bevor* er ins Kontextfenster gelangt. Nutzt TOON für JSON/YAML, faltet repetitive Logs; Source-Code, Prosa und präzisions-sensible Zahlen bleiben unangetastet. [^3^]

**Drei Integrationsmodi:** (a) **Claude-Code-Plugin, automatisch, zero-config** — `toonify-mcp setup` installiert Marketplace + Plugin; ersetzt Tool-Output über den `updatedToolOutput`-Hook (Auto-Trigger bei großem Output). (b) MCP-Server on-demand (`toonify-mcp setup mcp`, Tool `optimize_content`). (c) **Pipe-Filter** `toonify-mcp compress` für beliebige Agent-CLIs: liest stdin, komprimiert nur was lossless komprimierbar ist, sonst byte-für-byte Passthrough („never breaks a pipe"); Adoption via Regel in AGENTS.md/CLAUDE.md („pipe large JSON through toonify-mcp compress"). [^3^]

**Aufgefalle Grenze (eigene Doku):** Auf OpenAI Codex nur on-demand, *nicht* automatisch — Codex-Hooks können Tool-Output nicht ersetzen; eine *anghängte* komprimierte Kopie würde den Kontext **vergrößern** statt verkleinern. Generell übersprungen: kurze Texte, sehr kleine Dateien, Inhalte mit exakt zu erhaltender Formatierung. [^3^]

**Reife:** 64★, 0 offene Issues, aktiv (Push 2026-08-12); mehrsprachige Doku, eigene Benchmarks-Seite. [^2^][^11^]

### 3. manojmallick/sigmap — Signatur-Karte mit Verifikations-Fokus (614★, MIT)

**Was:** „Deterministic, auditable signature-and-evidence map" — kein LLM, keine Embeddings, byte-stabiler Output. TF-IDF-Ranking über Dateien, kompakte Signaturen mit Zeilen-Ankern, 33 Sprachen, zero dependencies. Positionierung: nicht Konkurrent zu agentic grep, sondern Grounding-Schicht, die der Live-Loop aufruft. [^4^]

**Zahlen mit ehrlichen Labels:** 96,8 % Token-Reduktion (Ø über 21 Repos, Baseline = Volltext), hit@5 82,2 % vs. 44,8 % Single-Shot-grep (**1,59× Lift** — die im Swarm kursierenden „2,0×" finden sich im aktuellen README nicht mehr), 64,8 % Task-Success explizit als *modellierter Proxy* gekennzeichnet („not measured LLM sessions"), 46,1 % Prompt-Reduktion ebenfalls modelliert. Benchmark reproduzierbar: eigene Suite + Zenodo-Archiv. [^4^]

**Claude-Code-Integration:** `sigmap mcp install claude` registriert **21 MCP-Tools**: `read_context`, `search_signatures`, `get_map`, `query_context`, `get_callee_signatures`, `get_lines`, `get_diff_context` (geänderte Dateien + Signaturen + Blast-Radius), `get_method_impact`, `get_architecture_overview`, `verify_suggestion` (prüft AI-Code gegen Repo- + installierte Library-Symbole), **`squeeze_output`** (komprimiert noisy Tool-/Log-/JSON-Output mid-session — Überschneidung mit toonify!) u. a. Alternativ ohne MCP: `sigmap --adapter claude` schreibt Signaturen nach CLAUDE.md; `sigmap evidence "<task>"` erzeugt deterministisches Evidence-Pack (JSON/Markdown) mit Token-Budget, gedroppten Dateien + Begründung. `sigmap verify answer.md` flaggt halluzinierte Dateien/Symbole/Imports (CI-Gate, Exit 1). [^4^]

**Issues:** nur 3 offene, alles Growth/Marketing — **keine offenen Korrektheits-/Signatur-Fehler** (positiv, aber auch wenig Fremd-Nutzung sichtbar). [^11^]

**Selbstempfehlung (aus Swarm-Kontext bestätigt plausibel):** sigmap always-on als Grounding + repomix für tiefe One-Shot-Sessions — deckt sich mit der eigenen „consumers, not competitors"-Positionierung. [^4^]

### 4. sriinnu/clipforge-PAKT — lossless-first Kompression (20★, MIT)

**Was:** Pipe-Aligned Kompact Text. Schichten: **L1** strukturelle pipe-delimited Umschreibung (Syntax explizit von TOON inspiriert/credited), **L2** Dictionary-Aliase (`@dict`), **L3** tokenizer-aware Formwahl mit echtem BPE-Tokenizer (`gpt-tokenizer`), automatisches Delta-Encoding für Tabellen. **L1–L3 verlustfrei: `decompress()` gibt byte-identisch zurück.** L4 (semantisch, lossy) ist opt-in und budgetiert. [^5^]

**Ehrlichkeit als Feature:** Tabelle mit Gegenbeispielen — JSON 27–33 %, Logs mit Duplikaten 57 %, repetitiver Text 38–69 %, **kleines tief verschachteltes Config: −25 % (expandiert!)**, Prosa ohne Wiederholung: 0 % Passthrough. `pakt_inspect`/`pakt auto` sagen vorher, ob sich ein Payload lohnt. [^5^]

**Comprehension-Eval:** 36 Fragen, gematchte Paare, ein Live-Run durch die **Claude Code CLI**: JSON 97,2 % vs. PAKT 100 %, Sign-Test p = 1,00 → Parität, kein Vorteil; Autor benennt selbst Ceiling-Effekt und „weak discriminator". Reproduzierbar via `node scripts/eval/run.mjs --provider cli --cli claude`. [^5^]

**Integration:** `pakt serve --stdio` MCP mit `pakt_compress`, `pakt_auto`, `pakt_inspect`, `pakt_stats`, `pakt_explain`, `pakt_savings`, `pakt_dashboard`. Context-Engine für Agent-Loops: komprimiert Tool-Results, dedupliziert über Turns, altert Output zu Tails, **Byte-stabiles `@shared`-Dictionary + Cache-Breakpoint-Hint für Provider-Prompt-Caching** (Ersparnis kommt vom Provider-Cache; PAKT hält das Präfix stabil). Optionale neurale Stufe mit Garantie-Fallback. [^5^]

**Reife:** 20★, Kern (npm `@sriinnu/pakt`, Lib/CLI/MCP) „stable"; Desktop-App nur macOS-validiert, Extension nicht store-getestet, Python-Wrapper unveröffentlicht. 0 echte offene Issues. [^2^][^11^]

### 5. open-compress/claw-compactor — 14-Stufen-Pipeline (2,1k★, MIT, ⚠ stale)

**Was:** Token-Kompressions-Engine, 14 gestaffelte, content-aware Stufen: QuantumLock (KV-Cache-Isolierung in System-Prompts), Cortex (Typ-/Sprach-Autodetect, 16 Sprachen), Photon (Base64-Bilder), RLE (Pfad-Kürzel `$WS`), SemanticDedup (SimHash), Ionizer (JSON-Array-Sampling mit Schema-Discovery + Fehler-Erhaltung), LogCrunch/SearchCrunch/DiffCrunch, StructuralCollapse, Neurosyntax (tree-sitter AST, kürzt nie Identifier), Nexus (ML), TokenOpt, Abbrev. Immutable Dataflow, Gate-before-compress, **reversibel**: Ionizer legt Originale in hash-adressiertem RewindStore ab, das Modell kann per Marker-Tool (`[rewind:abc123]`) Originale zurückholen. [^6^]

**Zahlen einordnen:** README-Banner „98 % CRUSHER" vs. eigene Tabelle „gewichteter Ø 36,3 %"; JSON-Peak 81,9 %; **SWE-bench-Realaufgaben nur 11,8–19,1 %** (django 14,5 %, scikit-learn 11,8–15,9 %). ROUGE-L 0,653 @0,3 vs. LLMLingua-2 0,346 — bei null Inferenzkosten und <50 ms. [^6^]

**Integration:** `pip install claw-compactor`; CLI `benchmark`/`compress`; Python-API `FusionEngine` (auch `compress_messages` für Chat-Verläufe mit Cross-Message-Dedup). Primärer Konsument ist **OpenClaw** (built-in Skill), keine dokumentierte Claude-Code-Anbindung — für Claude Code nur als CLI-Pre-Processor/Pipe denkbar. [^6^]

**Reife-Risiko:** letzter Push **2026-04-01** (4+ Monate stale), 1 offenes Issue („How KISS is this?" — hinterfragt die Komplexität). 1.600+ Tests, 12k LOC Python. [^2^][^11^]

### 6. yamadashy/repomix — der Standard-Packer (27,8k★, MIT)

**Was:** Packt Repos in eine AI-freundliche Datei (XML/Markdown/JSON/Plain). Token-relevante Features: **`--compress`** (Tree-sitter extrahiert Klassen-/Funktions-/Interface-Signaturen, Bodies werden durch `⋮----` ersetzt; Plugin-Doku nennt ~70 % Reduktion, README markiert es als *experimental*), **`output.patterns`** (per-Glob Detailstufen: full / compress / directoryStructureOnly — deutlich sinnvoller als globaler Schalter), **`--token-budget N`** (Exit-Code ≠ 0 bei Überschreitung — CI-Guard für Agent-Workflows), `--token-count-tree` (Hotspot-Analyse), Secretlint (Credentials werden ausgelassen). [^7^]

**Claude-Code-Integration (drei Wege):** MCP-Server `claude mcp add repomix -- npx -y repomix --mcp` (optional `--sandbox` — beschränkt File-Tools auf ein Workspace-Root, verweigert absolute/`..`-Pfade); offizielle **Plugins** (`/plugin marketplace add yamadashy/repomix` → `repomix-mcp`, `repomix-commands` mit `/pack-local` `/pack-remote`, `repomix-explorer` als Analyse-Agent, der packt und dann gezielt grep't/liest statt alles zu laden); **`--skill-generate`** (erzeugt Claude-Agent-Skills-Verzeichnis als wiederverwendbare Repo-Referenz). [^7^]

**Offene Issues (Korrektheit relevant):** **#1503 — Dateien mit identischen Namen in verschiedenen Unterverzeichnissen werden still übersprungen** (still fehlender Kontext in Dumps!); #1765 — schlägt fehl bei Repos mit Backslash in .gitignore-Patterns; #1642/#1682 — Feature-Wünsche Richtung Entity-Level-Packing und Dependency-Cone-Auswahl (zeigt: Community will weg vom reinen Volltext-Dump). [^11^]

### 7. mohsen1/yek — schneller Rust-Packer mit Git-Priorisierung (2,5k★, MIT)

**Was:** Serialisiert Repo-Dateien für LLM-Konsum, eine Datei, `>>>> pfad`-Header. Defaults: .gitignore-Respekt, **Git-History-basierte Wichtigkeit**, Binär-/Größen-Heuristiken, Auto-Streaming bei Pipe. Besonderheit: **wichtige Dateien kommen ans Ende** der Ausgabe — LLMs gewichten späteren Kontext stärker (Recency). **`--tokens 128k`** kappt das Budget und lässt unwichtige Dateien weg; `yek.yaml` mit `priority_rules` (Score pro Pfad-Glob), `git_boost_max`. [^8^]

**Performance-Claim einordnen:** „230× schneller als repomix" (5,2 s vs. 22 min auf Next.js) — misst repomix mit vollem Token-Counting; als Geschwindigkeitsargument ok, als Token-Argument irrelevant (yek *spart* keine Token, es *budgetiert* nur). [^8^]

**Issues (Korrektheit des Rankings):** **#255 — Recency-Boost sortiert Kern-Dateien falsch** (Vorschlag: Dependency-Zentralität als Signal) — direkt relevant, weil yeks einziger „Intelligenz"-Vorteil die Reihenfolge ist; #241 — Ignore-Patterns versagen bei `node_modules` in Submodul-Pfaden; #232 — MCP-Wunsch offen. [^11^]

### 8. glincker/stacklit — committbarer Struktur-Index (101★, MIT)

**Was:** `npx stacklit init` → `stacklit.json` (Module, Exports mit Signaturen, Dependencies, Git-Aktivität, Hints), `DEPENDENCIES.md` (Mermaid), `stacklit.html` (Visualisierung). Tree-sitter, 11 Sprachen voll, Rest Basic-Fallback. **Kernzahlen: 108k LOC (FastAPI) → 4.142 Index-Token; `stacklit derive` erzeugt ~250-Token-Navigationskarte** (ersetzt laut README 3.000–8.000 Token Agent-Exploration). [^9^]

**Claude-Code-Integration:** `stacklit setup claude` injiziert die ~250-Token-Karte in CLAUDE.md, konfiguriert `.mcp.json` (MCP mit 7 Tools: `get_overview`, `get_module`, `find_module`, `get_dependencies`, `get_hot_files` …) und installiert Git-Hook zur Index-Aktualisierung (Merkle-Hashing überspringt Doku-/Config-Commits). Alternativ: `stacklit.json` committen — jeder Agent liest die Datei statt zu scannen; GitHub Action (auto-commit oder `mode: check` als Staleness-Gate). [^9^]

**Discussion #13 (Vergleichsthread):** nützliche Taxonomie — **Dumper** (repomix/gitingest/code2prompt/files-to-prompt: 50k–500k Token, kein Strukturverständnis), **Knowledge-Graphs via MCP** (Codebase-Memory, Axon: 2k–10k/Session, Server-Pflicht, Tool-Call-Overhead), **Struktur-Index** (stacklit: ~250 Token, committbar), IDE-integriert (embeddings, nicht portabel). Wichtige Beobachtung: „repomix --compress bleibt per-file, keine Cross-File-Dependency-Analyse". **Aber:** Thread wird vom Stacklit-Autor gepflegt — Eigenwerbung, Zahlen (z. B. „Repomix ~180k Token auf Express.js") sind Schätzungen. [^10^]

**Issues:** 6 offene, alles Feature-Requests (Elixir/Zig/Kotlin/Dart-Support, Symlinks, Scan-Roots) — keine Korrektheitsmeldungen. [^11^]

## Sekundär-Repos Kurzliste

| Repo | ★ | Einordnung (Kurz-Check) |
|---|---|---|
| coderamp-labs/gitingest | 15,3k | Dumper-Kategorie; „hub→ingest"-URL-Hack + CLI; aktiv (2026-08); gut für fremde Repos/One-Shot, kein Kompressionsansatz [^21^] |
| mufeedvh/code2prompt | 7,6k | Dumper (Rust) mit Templates + Token-Counting; keine Budget-CI wie repomix [^21^] |
| simonw/files-to-prompt | 2,8k | Minimalster Dumper (XML-Concat); funktional stabil, feature-still — als Referenz-Implementierung ok [^21^] |
| xaviviro/python-toon | 340 | TOON-Python-Port (30–60 %-Claim); Issue #2: Encode-Latenz kann höher sein als Ersparnis wert ist; Issue #5 Effizienz [^11^] |
| sheikhsajid69/toon-skill | 2 | **Claude Skill** `/toon`: strafft Prosa-Prompts + rekodiert eingebettete strukturierte Daten als TOON; nutzt `@toon-format/cli` via npx mit Pure-Python-Fallback; kennt TOONs Nicht-geeignet-Fälle explizit; Install nach `~/.claude/skills/` [^20^] |
| Barnett-Studios/cxpak | 25 | Rust, tree-sitter über **43 Sprachen**, typisierter Dependency-Graph, **token-budgetierte Context-Bundles** („briefing packet statt Taschenlampe"); MCP/HTTP/Docker; README warnt selbst: „under development; the surface still moves" [^17^] |
| zzet/gortex (Blog zzet.org) | — | Go-Daemon, **48 MCP-Tools**, `smart_context` ersetzt 5–10 Datei-Reads pro Call; misst `tokens_saved` pro Tool-Call (Selbstauskunft 20–25× Effizienz); Disk-Persistenz + Watch-Mode lösen das Re-Pack-Problem der Dumper; `gortex init` schreibt `.mcp.json`/CLAUDE.md/Hooks [^16^] |
| microsoft/acon | 100 | **Research-Framework** (Paper arXiv:2510.00615) zur Kontext-Kompression in Long-Horizon-Agenten (AppWorld, OfficeBench, 8-objective QA); relevant als Methodik-Referenz (Compressor-Distillation), nicht als Claude-Code-Plugin [^19^] |
| dereira/goldfish | 2 | **Go-Port von aiders Repo-Map**: tree-sitter-Tags + PageRank über Symbol-Graph, Token-Budget (default 4096), `--chat`-Bias auf Fokus-Dateien, `⋮`-Body-Elision; erwachsener Algorithmus, winziges Projekt [^18^] |

## Format-Beispiele (TOON vs. JSON vs. PAKT)

**Gleiche Daten, drei Kodierungen** (vereinfacht nach den README-Beispielen [^1^][^5^]):

```json
// JSON pretty (~117 Tokens im README-Wetterbeispiel; hier verkürzt)
{ "users": [ { "name": "Alice", "role": "dev" }, { "name": "Bob", "role": "dev" } ] }
```

```toon
# TOON — tabellarische Form: Felder einmal im Header deklariert
users[2]{name,role}:
  Alice,dev
  Bob,dev
```

```
# PAKT — L1 pipes + L2 dictionary (wiederholte Werte als Aliase)
@from json
@dict
  $a: dev
@end
users [2]{name|role}:
  Alice|$a
  Bob|$a
```

**Gemessene Token-Effekte aus den READMEs:** TOON-Wetterbeispiel 117 → 66 Tokens (−43,6 %, CLI `--stats`); TOON Time-Series (5 Records) 22.245 → 9.115 (−59 % vs. pretty JSON); PAKT Mini-Beispiel oben 28 → 15 Tokens (best case, „illustrativ"); PAKT typisch JSON 27–33 %. **Gegenprobe:** PAKT auf ~160-zeiligem verschachteltem Config: **+25 %**. TOON Mixed-Track vs. *kompaktem* JSON: +1,6 % (also leicht teurer). [^1^][^5^]

**repomix `--compress` (Tree-sitter-Elision):** Funktionsbodies werden durch `⋮----` ersetzt, Signatur/Docs/Interface bleiben — aus ~30 Zeilen TypeScript werden ~15, Implementierungsdetails gehen verloren (für „wo ist was"-Fragen ok, für Bugfixing unzureichend). [^7^]

**stacklit-Kompaktkarte (~250 Tokens):**
```
myapp | go | 14 modules | 8,420 lines
entry: cmd/api/main.go | test: go test ./...
modules:
  cmd/api/          entrypoint, routes, middleware
  internal/auth/    jwt, session | depends: store, config
  internal/store/   postgres | depended-by: auth, handler
```
[^9^]

## Konflikte & Fallstricke

1. **Baseline-Inflation ist der Industriestandard.** TOONs „−42,6 %" gelten vs. pretty-printed JSON; vs. kompaktes JSON schrumpft es auf ~0 (Mixed-Track) bis −35 % (Flat-Track). Claude-Code-Tool-Output ist oft bereits kompakt/minifiziert → reale Ersparnis liegt näher am unteren Ende. Vor Adoption auf eigenem Output messen (`--stats`, `pakt_inspect`). [^1^][^14^]
2. **Multi-turn-Fragilität (TRON-Studie):** TOON als *Output*-Format (Modell generiert Tool-Calls in TOON) erzeugt Parse-Fehler, die über Turns kaskadieren; Netto-Ersparnis bei Tool-Calls ≈ 0. Empfehlung der Studie: nicht als Default. Praktische Konsequenz: Formate **input-seitig** einsetzen (Tool-Results, RAG-Payloads), nicht output-seitig. [^12^]
3. **Lehr-Overhead:** Modelle kennen TOON schwach aus dem Pretraining; Syntax-Erklärung kostet fixe Token — bei kurzen Payloads negativ (Matveev). Gegenmittel laut TOON-Doku: Format zeigen statt beschreiben, ``` ```toon ```-Fences. [^13^][^1^]
4. **Tokenizer-Mismatch:** Fast alle Zahlen nutzen `o200k_base` (GPT). Claude tokenisiert anders — Richtung der Effekte hält, Magnitude variiert (TOON-Doku sagt das selbst). [^1^]
5. **Injection-Oberfläche:** TOON ohne explizite Delimiter erlaubt, dass untrusted Strings als Schema-Felder reparst werden (S-TOON-Paper) — Vorsicht bei fremdkontrolliertem Content in Tool-Results. [^13^]
6. **Lossless ≠ lesbar:** PAKT dekomprimiert byte-identisch, aber die Comprehension-Evidenz ist n=36, eine Suite, Ceiling-Effekt. „Verlustfrei auf Bytes" sagt nichts über Modell-Verständnis. [^5^]
7. **Dumper-Ökonomie:** 50k–500k Token pro Dump; bei großem Repo + langer Session wird Neu-Packen pro Turn selbst zum Kostenfaktor, und der Agent parst trotzdem alles selbst. Packer sind One-Shot-/Cold-Start-Werkzeuge (fremdes Repo, ChatGPT-Web, kleines Repo <5k LOC), kein Session-Grundgerüst. [^10^]
8. **Stille Korrektheits-Lücken bei Packers:** repomix #1503 (gleichnamige Dateien fehlen still im Dump), #1765 (.gitignore-Backslash); yek #255 (Ranking sortiert Kern-Dateien falsch), #241 (Ignore-Bug). Wer einen Dump als „vollständig" annimmt, baut auf fehlendem Kontext auf. [^11^]
9. **Marketing vs. gemessene Realität:** claw-compactor „98 %" (Banner) vs. 36 % Ø vs. 12–19 % auf SWE-bench; sigmap „96,8 %" vs. 1,59× Lift gegen ehrliche grep-Baseline und *modelliertem* (nicht gemessenem) Task-Success; stacklits Vergleichstabelle stammt vom Autor selbst. [^6^][^4^][^10^]
10. **Staleness-Risiko:** claw-compactor seit 2026-04 ohne Push; Signatur-Indizes (sigmap/stacklit) entwerten bei Repo-Drift — ohne Hook/CI-Regeneration wird die Karte zur Falschinformation (schlimmer als keine Karte). [^2^][^9^]
11. **Format-Adressbereich:** TOON/PAKT helfen nur bei *strukturierten* Daten. Code, Diffs, Logs brauchen andere Stufen (Signatur-Elision, Log-Faltung) — ein Format-Tool allein deckt den Claude-Code-Kontext nicht ab; dafür sind Pipelines (claw-compactor) oder Kombi-Filter (toonify) gedacht. [^1^][^3^][^6^]

## Stack-Empfehlung für diese Schicht

**Rolle der Formate im Gesamt-Stack — drei konkrete Einsatzpunkte:**

1. **MCP-Output-Encoding (höchster Hebel in Claude Code):** Tool-Results sind der größte strukturierte Token-Verbraucher. Empfehlung: **toonify-mcp als Claude-Code-Plugin** (automatisch, zero-config, `updatedToolOutput`-Hook, Passthrough-Garantie) als Default; alternativ **PAKT-MCP** (`pakt_auto`/`pakt_inspect` als Gate) wo Lossless-Garantie + Turn-übergreifende Dedup/Cache-Kooperation zählen. Für eigene MCP-Server: Responses serverseitig als TOON ausgeben (oder Tooner-Proxy davor), **aber nur input-seitig** — Tool-*Call*-Argumente im JSON-Schema belassen (TRON-Befund). [^3^][^5^][^12^]
2. **CLAUDE.md / dauerhafter Repo-Kontext:** Keine Volltext-Dumps in CLAUDE.md. Stattdessen Signatur-Ebene: **`sigmap --adapter claude`** (Signaturen + Verify-Tooling, 21 MCP-Tools inkl. `get_diff_context` und `squeeze_output`) oder **`stacklit derive --inject claude`** (~250-Token-Navigationskarte + Git-Hook-Frische). Tabellarische Daten in CLAUDE.md dürfen TOON-ähnliche Kompakttabellen nutzen — Modelle lesen sie zuverlässig, Ersparnis bei wenigen Zeilen aber marginal. [^4^][^9^]
3. **Tool-Result-Filter / Pipes:** AGENTS.md-Regel „großes JSON/lange Logs durch `toonify-mcp compress` pipen" — funktioniert agenten-übergreifend und byte-sicher. [^3^]

**Packer-Policy (wann was, wann nichts):**

| Situation | Empfehlung |
|---|---|
| Fremdes/kleines Repo (<5k LOC), One-Shot-Frage, Web-Chat | **repomix** (`--compress`, ggf. `--remote`) oder gitingest; yek wenn Geschwindigkeit zählt [^7^][^10^] |
| Externe Referenz-Codebase wiederholt konsultieren | `repomix --skill-generate` → wiederverwendbarer Agent-Skill statt Re-Pack pro Session [^7^] |
| Eigenes Arbeits-Repo, tägliche Sessions | **Kein Dumper.** Signatur-Karte always-on (sigmap MCP oder stacklit.json + Hook) + Live-grep/read des Agenten; gortex/cxpak wenn Graph-Tiefe (Blast-Radius) gebraucht wird [^4^][^9^][^16^][^17^] |
| Budget-Enforcement | `repomix --token-budget` in CI; `yek --tokens N` ad hoc; goldfish-Repo-Map (`--tokens`, default 4k) als aider-artige Middle-Ground-Karte [^7^][^8^][^18^] |
| Lange Session, großes Repo | Nie pro Turn neu packen. Index einmal bauen (Hook/Daemon), dann on-demand-Tools; Dumps nur bei Cold-Start, danach gezielte Reads [^10^][^16^] |
| Gar nichts tun ist richtig, wenn… | Repo klein genug für natives Explore; Daten tief verschachtelt/non-uniform (kompaktes JSON bleiben lassen); Payloads kurz (Lehr-Overhead > Ersparnis); Latenz-kritisch auf lokalen Modellen [^1^][^13^] |

**Kombi-Empfehlung (Best-of-Stack für Claude Code, Stand 2026-08):** `toonify-mcp`-Plugin (auto Tool-Output-Filter) + `sigmap` MCP (Grounding + `verify_suggestion` gegen Halluzination) + `repomix --compress --token-budget` nur für Cold-Start/Fremd-Repos. Diese drei überlappen minimal (Output-Encoding / Repo-Index / One-Shot-Dump) und decken die Schicht ohne Format-Dogma ab. claw-compactor erst nach Reaktivierung des Projekts prüfen; PAKT beobachten (technisch seriös, aber 20★ und dünne Comprehension-Evidenz). [^3^][^4^][^7^]

## Quellen

[^1^]: toon-format/toon — README (packages/toon/README.md), Spec v4.1, Benchmarks: https://github.com/toon-format/toon (abgerufen 2026-08-13)
[^2^]: GitHub API — Repo-Metadaten (Stars, Pushes, Issues) für alle 8 Primär-Repos, api.github.com, 2026-08-13
[^3^]: PCIRCLE-AI/toonify-mcp — README: https://github.com/PCIRCLE-AI/toonify-mcp
[^4^]: manojmallick/sigmap — README (Benchmark-Block v8.24, 21 Repos, MCP-Tool-Liste): https://github.com/manojmallick/sigmap
[^5^]: sriinnu/clipforge-PAKT — README (Schichten L1–L4, BENCHMARK-SNAPSHOT, Comprehension-Eval): https://github.com/sriinnu/clipforge-PAKT
[^6^]: open-compress/claw-compactor — README (14-Stufen-Pipeline, Benchmarks, SWE-bench-Tabelle): https://github.com/open-compress/claw-compactor
[^7^]: yamadashy/repomix — README (--compress, output.patterns, --token-budget, MCP/--sandbox, Claude-Code-Plugins, --skill-generate): https://github.com/yamadashy/repomix
[^8^]: mohsen1/yek — README (Git-Priorisierung, --tokens, yek.yaml, repomix-Vergleich): https://github.com/mohsen1/yek
[^9^]: glincker/stacklit — README (stacklit.json, derive, setup claude, Token-Messungen): https://github.com/glincker/stacklit
[^10^]: glincker/stacklit Discussion #13 — „Stacklit vs Repomix vs code2prompt vs Aider repo-map" (autorengepflegter Vergleichsthread, 2026-04-10): https://github.com/glincker/stacklit/discussions/13
[^11^]: GitHub Issues API — offene Issues: toon-format/toon#19; sigmap#244–246; claw-compactor#111; repomix#1503/#1765/#1642/#1682 u. a.; yek#255/#241/#232; stacklit#25–31; xaviviro/python-toon#2/#5 (abgerufen 2026-08-13)
[^12^]: TRON-Studie (arXiv:2605.29676) — Format-Substitution in agentischen Tool-Calling-Pipelines; TOON −18 % Token, Accuracy −1 bis −9 pp, Multi-turn-Parse-Kaskaden: https://arxiv.org/pdf/2605.29676
[^13^]: OpenReview-Übersicht zu token-optimierten Formaten (Matveev: Lehr-Overhead; McMillan: Format-Effekt n. s.; Alshaer: S-TOON-Delimiter-Injection; Masciari et al.): https://openreview.net/pdf/0fb8dc4068f4b0a963baf49b7e0fa1fbe193d31e.pdf
[^14^]: InfoQ (2025-11-23) „New Token-Oriented Object Notation (TOON)…" (−55 % vs. pretty, −25 % vs. kompakt) & The Orange Force TOON-Test (15–26 %): https://www.infoq.com/news/2025/11/toon-reduce-llm-cost-tokens/ ; https://theorangeforce.com/the-orange-force-news/toon-token-efficiency-useful-cases/
[^16^]: zzet — „From GitNexus to Gortex" (Blog, 2026-04-08) + gortex-Docs (48 MCP-Tools, smart_context, tokens_saved-Messung, Daemon): https://zzet.org/gortex/from-gitnexus-to-gortex/ ; https://github.com/zzet/gortex
[^17^]: Barnett-Studios/cxpak — README (43 Sprachen, Dependency-Graph, Token-Budget-Bundles): https://github.com/Barnett-Studios/cxpak
[^18^]: dereira/goldfish — README (aider-Repo-Map-Port: tree-sitter + PageRank, --tokens-Budget): https://github.com/dereira/goldfish
[^19^]: microsoft/acon — README (ACON, arXiv:2510.00615, AppWorld/OfficeBench): https://github.com/microsoft/acon
[^20^]: sheikhsajid69/toon-skill — README (Claude Skill, /toon-Trigger, npx-CLI + Python-Fallback): https://github.com/sheikhsajid69/toon-skill
[^21^]: GitHub API — Sekundär-Repo-Metadaten (gitingest 15,3k; code2prompt 7,6k; files-to-prompt 2,8k; python-toon 340; toon-skill 2; cxpak 25; acon 100; goldfish 2), 2026-08-13

_Hinweis zu bekanntem Swarm-Kontext: Der „Halodoc-Produktionsfall (5–15 % Kosten↓)" ließ sich in dieser Session nicht primär verifizieren; unabhängige Drittmessungen [^14^] (15–26 % bei Mendix-Studio-Test, InfoQ-Beispiel) stützen die Größenordnung für uniforme Daten._
