# dim03: MCP-Sandbox, Tool-Schema & Engines

**Datum der Recherche: 2026-08-13.** Diese Dimension deckt drei Kostenblöcke ab, die in der Token-Debatte oft hinter Prompt-Hygiene zurückstehen: (1) **Tool-Outputs**, die ungefiltert ins Kontextfenster müllen (Sandbox-/Index-Ansatz), (2) **Tool-Definitionen/MCP-Schemas**, die vor der ersten Nachricht 30–143k Tokens fressen (Progressive-Disclosure-Ansatz), (3) **modellbasierte Kompressoren** (kleine lokal gehostete Modelle, die Tool-Output/History semantisch verdichten). Größenordnung des Problems: Der offizielle GitHub-MCP-Server allein exponiert 94 Tools ≈ 17,6k Tokens; Atlassian-MCP ≈ 10k; mehrere große Server summieren sich auf 30k+ Tokens pro Request — und Community-Messungen fanden 81 Tools ≈ 143k Tokens ≈ 72 % eines 200k-Fensters, bevor die erste User-Nachricht gelesen wurde.[^4^][^18^]

---

## Vergleichsmatrix

| Projekt | ★ (Stand 13.08.2026) | Adressierter Kostenblock | Integrationstyp / Schicht | Reife & Aktivität | Evidenzqualität | Kombinierbarkeit (Reihenfolge) |
|---|---|---|---|---|---|---|
| **mksglu/context-mode** | 19.825 | Tool-Output (Hauptblock) + Session-State nach /compact | MCP-Server + Hook-Plugin (PreToolUse-Routing erzwingt Sandbox) — **Client-seitig, vor Request-Bau** | Sehr hoch (tägliche Commits, 17 Plattformen, HN #1); 148 offene Issues, aktiv bearbeitet | Eigene 21-Szenarien-Benchmarks (98 % Output-Reduktion); keine unabhängige Eval, aber deterministischer Mechanismus (kein Modell im Loop) | **Schicht 1 (Hook/MCP).** Kombinierbar mit allem Proxy-seitigen; beißt sich nicht mit Schema-Reduktion, da anderer Block |
| **atlassian-labs/mcp-compressor** | 106 | Tool-Schema (70–97 % Schema-Reduktion) | MCP-Proxy (stdio/HTTP) oder SDK (Py/TS/Rust) — **MCP-Schicht, vor dem Client** | Mittel; Atlassian-Labs-Projekt, aus Rovo Dev abgeleitet; 1 offenes Issue | Eigene Tier-Messung am GitHub-MCP (17,6k → 0,5–3,9k Tokens); Qualitätsaussage „fast kein Impact" aus interner Eval, nicht publiziert im Detail | **Schicht 0 (MCP-Wrapper).** NICHT mit Paritok-Toolfilter/Edgee-TSR/Bifrost Code Mode auf denselben Servern stapeln (doppelte Indirektion) |
| **maximhq/bifrost (Code Mode)** | 7.267 | Tool-Schema + Tool-Output (Orchestrierung in Sandbox) | AI-Gateway + MCP-Gateway; Code Mode = 4 Meta-Tools + Starlark-Sandbox — **Gateway-Schicht** | Hoch (Enterprise-Gateway, 821 offene Issues, sehr aktiv); Code Mode ab v1.4.0-prerelease | Eigene 3-Runden-Benchmarks: −58 % bis −92,8 % Input-Tokens bei 96→508 Tools, Pass-Rate 100 %; Overhead 11–59 µs | **Gateway-Schicht.** Ersetzt direkte MCP-Anbindung; overlappt mit mcp-compressor/Tool Search; primär für eigene Agent-Apps, weniger für Claude-Code-CLI-Workflows |
| **ooples/token-optimizer-mcp** | 479 | Tool-Output (Read/Grep/Glob-Ersatz) + Re-Reads (Diffs) + Wissensgraph | Claude-Code-**Plugin** (Hooks + MCP), 16 CLI-Clients | Mittel-hoch (sehr aktiv, Dashboard, 100k+ Download-Behauptung für entroly-ähnliche Kanäle nicht hier) | Ungewöhnlich ehrliche Selbst-Messung (verified vs. quarantined getrennt; 43.491 netto verifizierte Tokens im Live-Beleg); kein unabhängiger Benchmark | **Schicht 1 (Hook/MCP).** Funktionaler Overlap mit context-mode (beide wollen Bash/Read/Grep routen) — nicht beide gleichzeitig |
| **edgee-ai/edgee (Compressor V2)** | 124 (CLI-Repo) | Drei Blöcke: Tool-Output (~10 %), Tool-Schema/TSR (~33 % Volumen), Output-Brevity (~30 %) | Gehostetes Gateway (SaaS), CLI wrappt Agent (`edgee launch claude`) — **Proxy-Schicht, hosted** | Hoch als Firma; Engine von RTK abgeleitet; CLI Rust-nativ; 2 offene Issues | SWE-bench-Lite: Brevity 6/6 (p=0,031), TSR 8/8 (p=0,008) ohne Qualitätsverlust — **aber kleine Stichprobe**; Kunden-Aggregat ~20 % Rechnungsreduktion, 30 Tage rollierend | **Proxy-Schicht.** Eine BASE_URL = ein Proxy: beißt sich mit Paritok/entroly-proxy/bifrost als zweiter Proxy; TSR overlappt mit nativem Tool Search |
| **Paritok-official/paritok-4b-v1** | 1.091 | Alle drei Input-Blöcke: Tool-Schema-Filter (~29k→8k), Content-Kompression (26 %), History-Summary | Self-host Proxy (`ANTHROPIC_BASE_URL`) mit lokalem 4B-Modell (Ollama/vLLM) oder hosted GPU — **Proxy-Schicht** | Jung (seit 07/2026), sehr aktiv; 33 offene Issues, davon echte Funktionsbugs (#40 OpenAI-Pfad verwirft komprimierte History) | SWE-bench Lite End-to-End: 86,5 % Qualitätsretention bei 25,7 % Kompressionsrate (rohes Modell, ohne Recall); eigenes A/B über 5 Turns; **ehrliche Deckelung der Projektionen** | **Proxy-Schicht.** Nicht hinter Edgee/bifrost ketten; Tool-Filter nicht mit mcp-compressor auf denselben Servern |
| **scaledown-team/DietCode** | 2 | Tool-Output + History (Proxy-Kompaktion) | Plugin + MCP + lokaler Proxy (geplant) — **pre-launch** | Kein Code released („final testing", Launch in ~2 Wochen, npm „coming soon") | Keine — nur Marketing-README | Aktuell nicht einsetzbar; beobachten |
| **juyterman1000/entroly** | 435 | Selektion+Kompression von Files/Kontext; Tool-Schema-Deferral; Receipts/Recovery | CLI + SDK + MCP + HTTP-Proxy (Port 9377) — **multi-Schicht, lokal** | Mittel (100k+ Downloads behauptet, PyPI+npm+Rust+Docker); 3 offene Issues | Eigene Benchmarks mit CI-Angaben (LongBench 103 % Retention bei 85 % Ersparnis; **SQuAD 80 %→72 % ehrlich als Verlust ausgewiesen**); WITNESS-Halluzinationscheck lokal | **Schicht 1–2 (MCP oder Proxy).** Proxy-Pfad kollidiert mit Paritok/Edgee; MCP-Pfad mit context-mode teilweise kompatibel |
| **KRLabsOrg/squeez** | 23 | Tool-Output (Shell-Pipes: pytest, grep, git log, kubectl) | CLI-Pipe + Python-Lib + vLLM-Server; Integration über CLAUDE.md-Anweisung — **Tool-/Prompt-Schicht** | Nische, aber sauber: 2B-Generativmodell + 150M-ModernBERT-Alternative, arXiv-Paper 2604.04979 | Solide kleine Eval: 618 kuratierte Beispiele, 27 Tool-Typen; F1 0,80 bei 92 % Kompression, schlägt Qwen-35B zero-shot um 11 Recall-Punkte | **Punktuell.** Läuft *innerhalb* von Bash-Aufrufen — kombinierbar mit context-mode (Pipe im Sandbox-Skript) und jedem Proxy; einzige Konfliktquelle: Modell muss squeez konsequent nutzen |

**Native Gegenhebel (Referenz, kein Repo):** Claude Code **Tool Search** (Default, deferred loading) senkt MCP-Schema-Token ~47 % in MCP-schweren Setups; API-Beta-Werte: bis 85 % Token-Reduktion, Opus-4.5-Tool-Accuracy 79,5 %→88,1 %; `MAX_MCP_OUTPUT_TOKENS` (Default 25.000) kappt Tool-Outputs.[^18^][^19^]

---

## Detailprofile

### 1. mksglu/context-mode — Sandbox-Execution + FTS5-Index (19,8k★)

**Mechanismus.** MCP-Server mit 11 Tools, davon sechs Sandbox-Tools (`ctx_execute`, `ctx_execute_file`, `ctx_batch_execute`, `ctx_index`, `ctx_search`, `ctx_fetch_and_index`). Jeder `ctx_execute`-Call startet einen isolierten Subprozess (12 Sprachen: JS/TS/Python/Shell/Ruby/Go/Rust/PHP/Perl/R/Elixir/C#; Bun-Auto-Detect für 3–5× schnelleres JS). **Nur stdout gelangt in den Kontext** — Rohdaten (Logs, API-Responses, Snapshots) verlassen die Sandbox nie.[^1^]

Zweiter Pfeiler: **Session-Kontinuität.** Hooks (PreToolUse/PostToolUse/UserPromptSubmit/PreCompact/SessionStart/Stop) schreiben strukturierte Events (Dateien, Tasks, Git, Fehler, Entscheidungen) in eine projektbezogene SQLite-DB. Bei /compact oder `--continue` wird kein Dump in den Kontext gespült, sondern ein ≤2-KB-Snapshot gebaut und der Rest über **SQLite FTS5 mit BM25 + Porter-Stemming + Trigram-RRF + Proximity-Reranking + Levenshtein-Fuzzy** abrufbar gemacht. Der Index überlebt /compact; ohne `--continue` werden alte Session-Daten sofort gelöscht.[^1^]

**Installation für Claude Code.** Plugin-Marketplace (vollautomatisch, registriert alle Hooks + MCP-Tools):
```
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
```
Alternativ MCP-only: `claude mcp add context-mode -- npx -y context-mode` (dann ohne Routing-Enforcement). Verifikation via `/context-mode:ctx-doctor`.[^1^]

**Eigene Benchmarks.** 21 Szenarien; Kernzahlen: Playwright-Snapshot 56,2 KB→299 B (99 %), 20 GitHub-Issues 58,9 KB→1,1 KB, 500-Zeilen-Access-Log 45,1 KB→155 B, Subagent-Repo-Recherche 986 KB→62 KB. Volle Session: 315 KB→5,4 KB (98 %); Session-Länge ~30 min→~3 h. **Mit Hooks ~98 %, ohne Hooks nur ~60 %** Ersparnis — ein unrouteter `curl` kann die Session-Ersparnis zunichtemachen.[^1^]

**Nebenkosten/Sicherheit.** Kein Modell, keine GPU, keine Latenz nennenswert; alles lokal, keine Telemetrie. Sicherheit bemerkenswert durchdacht: Deny-Regeln aus `.claude/settings.json` (z. B. `Bash(sudo *)`) gelten auch *innerhalb* der Sandbox; `ctx_execute_file` ist auf den Projektroot begrenzt (Path-Traversal/Symlink-Escape geblockt, Issue #852 — der Escape-Vektor war, dass der Host-MCP-Approval-Prompt die Tool-Parameter nicht inspizieren kann); `ctx_fetch_and_index` blockt gefährliche URL-Ziele. **Aber:** `ctx_execute`/`ctx_batch_execute` führen beliebigen Code mit den FS-Rechten des Prozesses aus — die Sandbox ist Defense-in-Depth, kein OS-Sandbox.[^1^]

**Bekannte Probleme (offene Issues, Auswahl).** #911: injizierte Session-Continuity-Framings triggern Claude Codes Auto-Mode-Classifier (Subagent-Dispatches werden geblockt); #1022: Resume-Snapshot ignoriert Byte-Budget (beworben <2 KB, injiziert ~196 KB); #947: `ctx_batch_execute`-Timeout begrenzt Indexing/Search nicht → Agent kann hängen; #1048: Plan-Mode blockt `ctx_batch_execute`; #901: Windows-Doppel-Installation verwirrt `ctx_upgrade`/`ctx_doctor`.[^2^]

**Bemerkenswerte Design-Entscheidung:** bewusst **kein** Brevity-/Prosa-Forcing — das README zitiert die Beobachtung, dass aggressive Kürzungs-Prompts Coding-Benchmarks degradieren (kimi-k2.5/opencode-Issue). Routing beschränkt sich darauf, *wo Daten hingehen*, nicht *wie das Modell schreibt*.[^1^]

### 2. atlassian-labs/mcp-compressor — Schema-Kollaps via Wrapper-Tools (106★)

**Mechanismus.** MCP-Proxy, der zwischen Client und einen bestehenden MCP-Server geschaltet wird. Statt aller Schemas exponiert das Frontend nur zwei (maximal drei) Wrapper-Tools: `get_tool_schema(tool_name)` (volles Schema on demand), `invoke_tool(tool_name, input)` (Ausführung), optional `list_tools()` auf Stufe `max`. Das Muster stammt aus Atlassians Rovo Dev und wurde als OSS generalisiert. Vier Kompressionsstufen (`low`/`medium`/`high`/`max` = Sichtbarkeit `full`/`brief`/`minimal`/`none`).[^3^][^4^]

**Messung (Atlassian-Blog, GitHub-MCP mit 94 Tools).** Baseline 17.600 Tokens → low 3.900 → moderate 3.300 → strong 2.200 → max 500. **70–97 % Schema-Reduktion.** Qualitätsaussage: „almost no impact on end-to-end quality" in interner Eval, solange Schema-on-demand erhalten bleibt. Cache-Freundlichkeit explizit als Designziel: die kleine stabile Wrapper-Oberfläche hält den Prompt-Prefix byte-stabil.[^4^]

**Installation für Claude Code.** Den Server in der MCP-Config durch den Wrapper ersetzen:
```json
{ "mcpServers": { "github": { "command": "uvx",
  "args": ["mcp-compressor", "https://api.githubcopilot.com/mcp/", "--server-name", "github"] } } }
```
Läuft als CLI (`mcp-compressor -c medium -- python server.py`) oder eingebettet via SDK (Python/TypeScript/Rust, identische `CompressorClient`-API). Zusatz-Modi: CLI-Mode (generierte Shell-Kommandos), Code Mode (generierte Python/TS-Funktionen), Just-Bash-Integration, OAuth, Tool-Filter, TOON-Output.[^3^]

**Nebenkosten.** Eine Extra-Indirektion pro neuem Tool (Schema-Fetch = ein zusätzlicher Model-Turn bei unbekannten Tools); bei selbsterklärenden Toolnamen entfällt der Fetch oft. Kein Modell, keine GPU. **Fail-Verhalten:** Schema-Retrieve explizit vorhanden = fail-open Richtung voller Funktionalität; kein destruktiver Eingriff. 1 offenes Issue (#22 „Post processing").[^3^]

### 3. maximhq/bifrost — Code Mode im Gateway (7,3k★)

**Mechanismus.** Bifrost ist ein Go-basiertes Enterprise-AI-Gateway (23+ Provider, Failover, Load-Balancing, semantisches Caching, Governance; 11–59 µs Overhead bei 5k RPS). **Code Mode** (ab v1.4.0-prerelease, pro MCP-Client aktivierbar) kollabiert beliebig viele MCP-Server auf **vier Meta-Tools**: `listToolFiles` (Server entdecken), `readToolFile` (Python-Stubs laden), `getToolDocs` (Doku zu einem Tool), `executeToolCode` (Python/Starlark im Sandbox ausführen, mit vollen Tool-Bindings). Zwischenergebnisse bleiben im Sandbox; nur das kompakte Endergebnis geht ans Modell.[^5^][^6^]

**Eigene Benchmarks (3 Runden, gleiche Query-Sets, Code Mode an/aus).** Runde 1 (96 Tools/6 Server): −58,2 % Input-Tokens, Pass 64/64=64/64. Runde 2 (251 Tools/11 Server): −84,5 %, Pass 98,5 %→100 %. Runde 3 (508 Tools/16 Server): **−92,8 % Input, −92,2 % Kosten, ~40 % schneller**, Pass 65/65. Bei ~500 Tools: 1,15M→83k Tokens pro Query (14×).[^6^]

**Installation.** `npx -y @maximhq/bifrost` oder Docker; MCP-Server im Web-UI registrieren, pro Client „Code Mode" togglen; Mischbetrieb möglich (schwere Server per Code Mode, kleine Utilities direkt).[^6^]

**Einordnung für Claude Code.** Code Mode ist primär für **eigene Agent-Anwendungen** gedacht, die Bifrost als Gateway nutzen. Für Claude-Code-User ist es nur relevant, wenn Claude Code seine MCP-Server über den Bifrost-MCP-Gateway-Endpoint anbindet und Requests durch Bifrost laufen — dann konkurriert es funktional mit nativem Tool Search und mcp-compressor. Atlassian ordnet Code-Mode-Ansätze als komplementär, aber riskanter ein: „nothing works unless valid code is produced and executed successfully" — Code-Generierung wird zum Failure-Mode.[^4^]

### 4. ooples/token-optimizer-mcp — Enforcement-Plugin + Wissensgraph (479★)

**Mechanismus.** Vier Fronten: (1) **Deny-by-default-Hooks:** ein `Read` einer 200-KB-Datei wird *verweigert*, die Verweigerung enthält gleich die gecachte/gediffte Alternative (Zero-Turn-Refusal); Re-Reads liefern nur Diffs. (2) **Projekt-Wissensgraph:** Findings/Entscheidungen/Sackgassen akkumulieren als Nebeneffekt und feuern, sobald der Agent die relevante Datei anfasst (~150 Tokens pro Finding statt 5–50k Re-Derivation); bewusst *kein* klassisches RAG (Traversal statt Similarity, Staleness per Content-Hash). (3) **Selbstvermessung:** materialisierte Vorher/Nachher-Messung am MCP-Transport, spätere Expansionen werden vom Netto abgezogen; historische/tool-gemeldete Zahlen (486 M Tokens) werden **quarantäniert** statt in die Headline gemischt. (4) **Attribution** per MCP-Handshake-Identity über 16 CLI-Clients.[^14^]

**Installation.** Plugin (nicht nackter MCP-Server — „The plugin is what enforces"):
```
/plugin marketplace add ooples/token-optimizer-mcp
/plugin install token-optimizer@token-optimizer
```
**Belege aus dem eigenen Dashboard:** 43.491 netto verifizierte MCP-Transport-Tokens vermieden (54.037 brutto minus 10.546 Expansion); >1.000 Hook-Runs mit 0 Failures/0 Timeouts über 6 Clients; Hook-Latenz p50 22 ms / p95 87 ms.[^14^]

**Einordnung.** Die ehrlichste Metrik-Disziplin aller untersuchten Repos (verified/excluded/collecting sauber getrennt). Funktionaler Overlap mit context-mode (beide routen Bash/Read/Grep weg) — **nicht parallel installieren.** Offene Issues harmlos (#204 Feature-Wunsch, #201 Vergleichsanfrage).

### 5. edgee-ai/edgee — gehostetes Agent-Gateway mit Compressor V2 (124★)

**Mechanismus.** Rust-CLI (`edgee launch claude` / `edgee alias`) routet den Agenten durch Edgees **gehostetes** Gateway (Routing/Fallbacks/Reroutes, Metering, Budgets, Kompression). Selbst-Hosting nicht vorgesehen. Compressor V2 (launcht 02.07.2026) = drei unabhängig toggelbare Techniken auf zwei Schichten: **Layer 1 Input** — `tool_result_trimming` (Boilerplate, ANSI, Pagination, ~10 % Kosten; von RTK abgeleitet/erweitert) und `tool_surface_reduction` (kleiner Klassifikator scored Tools gegen die Task und strippt/down-scoped den Rest, ~33 % Volumen / ~10 % Kosten); **Layer 2 Output** — `output_brevity` (~30 % Output-Reduktion, „semantically lossless on code tasks"). P50-Gateway-Overhead <12 ms.[^9^][^10^]

**Evidenz.** SWE-bench-Lite: Brevity 6/6 Tasks ohne Qualitätsverlust (p=0,031), TSR 8/8 (p=0,008) — statistisch sauber, **aber winzige Stichprobe**. Praxis-Belege: Claude-Code-Endurance +26,2 % Instruktionen auf demselben Pro-Plan; Codex-Re-Read −49,5 % Fresh-Input, Cache-Hit 76 %→85 %; Kunden-Aggregat (30 Tage rollierend) ~20 % Rechnungsreduktion „with zero measurable drift on SWE-Bench Verified samples". Jede Response enthält einen `compression`-Block mit `saved_tokens`/`cost_savings`/`time_ms`.[^11^][^12^]

**Nebenkosten/Konflikte.** Hosted = Datenschutz-Frage (Prompts laufen durch Edgees Infrastruktur); Preis: Free-Tier (1 Dev, Kompression inkl.), Team 29 $/Monat. Statusline-Integration schreibt in `~/.claude/settings.json` (mit Doctor/Fix für Shadowing-Konflikte). **TSR overlappt funktional mit nativem Tool Search und mit Paritoks Tool-Filter; Tool-Result-Trimming overlappt mit RTK/context-mode.** Edgee selbst positioniert TSR als Alpha.[^10^][^13^]

### 6. Paritok-official/paritok-4b-v1 — nicht-destruktive Kompressions-Gateway mit 4B-Modell (1.091★)

**Mechanismus.** Drop-in-Proxy (`export ANTHROPIC_BASE_URL=http://127.0.0.1:8080`), der jede Request umformt, bevor sie zu Anthropic/OpenAI geht. Drei stapelbare Hebel: (1) **Tool-Schema-Filter** — Embedding-basiert (lokales bge-small-en-v1.5, CPU, ~130 MB), hält nur task-relevante Tools in Vollschema, stubbt den Rest; **~29k→~8k Tokens pro typischem Claude-Code-Turn**; Selektion wird pro Konversation eingefroren → tools[]-Block bleibt byte-stabil = **prompt-cache-freundlich**; Kern-Exec-Tools werden nie gestubbt; Rückholung via `gateway_search_tools`. (2) **Content-Kompression** — das trainierte 4B-Modell (LoRA auf Qwen3-4B-Instruct-2507, 45k echte Coding-Trajektorien) komprimiert tool_results/File-Reads/History auf **25,7 %**, tagged `[REF:id]`; exakte Originale jederzeit lokal via `read_original` rückholbar (non-destruktiv). (3) **History-Summarization** bei vollem Fenster.[^7^]

**Evidenz.** SWE-bench Lite end-to-end: **86,5 % Qualitätsretention bei 25,7 % Kompressionsrate** — doppelt so hart komprimiert wie gpt-4.1-mini (50,2 %) bei gleicher Retention (85,6 %); gpt-5 als Kompressor: 93,6 % Retention aber nur 61,9 % Rate. Wichtig: die 86,5 % sind das rohe Modell *ohne* Recall — die Gateway-Recall-Funktion liegt obendrauf. Session-Ökonomie ehrlich modelliert: Turn 1 ~25 % Ersparnis, Turn 5 ~39 %, Plateau ~72 % (Default) bis 85 %+ (kontext-saturiert); ~3× mehr Turns pro Fenster (128k: ~10→~30; 200k: ~15→~44). Kostenrechnung ist cache-aware (gefrorener Tool-Block als Cache-Hit bepreist).[^7^]

**Nebenkosten.** Self-host: Ollama q4 (~2,5 GB) oder vLLM auf 24-GB-GPU (f16 ~8 GB); Embedding-Warmup 10–15 s einmalig, danach ~15 ms/Request. Hosted GPU: 0,30 $/1M verarbeitete Tokens (bis Ende August 2026 gratis). Proxy muss als Foreground-Prozess laufen. Apache 2.0, keine Telemetrie.[^7^]

**Bekannte Probleme (offene Issues).** #40: **OpenAI-Proxy-Pfad verwirft komprimierte History** (`process_request`-Ergebnis wird gedroppt; `_compress_history` greift nicht) — funktionaler Bug auf dem OpenAI-Pfad; #41: Kosten-Schätzung **überzeichnet** Ersparnis, weil der Cache-Write des vollen Prefix bei Recovery nicht eingepreist wird; #31/#38: stille No-op-Kompression ist von „nichts zu komprimieren" nicht unterscheidbar (Vertrauensproblem beim Hosted-Pfad); #30: `/api/test` meldet GPU ok, während `/api/compress` passthrough macht. Fazit: Kernmechanismus (Anthropic-Pfad) solide, OpenAI-Pfad und Telemetrie-Ehrlichkeit in Arbeit.[^8^]

### 7. scaledown-team/DietCode — Pre-Launch-Platzhalter (2★)

README ist Marketing-Ankündigung: „status: final testing", npm „coming soon", Launch in ~2 Wochen (Stand 13.08.2026). Geplant: Intent-Routing, 50–70 % Prompt-Kompression vor dem Modell, strukturelles Tool-Output-Compacting (ls/grep/git diff) mit Zero-Latenz, **progressive Proxy-Kompaktion** (lokaler Proxy, der alte Turns als laufende Summary umschreibt und native Auto-Compaction ersetzen soll), Statusline, reversibel. **Kein Code, keine Benchmarks, keine Installation möglich.** Für diese Recherche: nur als Watchlist-Eintrag.[^17^]

### 8. juyterman1000/entroly — selektionsbasierte Kompression mit Receipts (435★)

**Mechanismus.** „Picks first, shrinks second": Entroly selektiert evidenztragende Fragmente per Ranking, komprimiert danach, und lagert Ausgelassenes **content-addressed** aus — byte-exakte Recovery per `entroly recover sha256:...` (66/66 Payloads nach Prozess-Restart byte-exakt im eigenen Test). Jede Entscheidung bekommt einen **Context Receipt** (was behalten/ausgelassen/warum, Rest-Risiko). Dazu WITNESS: lokaler Halluzinations-Check (84,9 % Accuracy auf HaluEval-QA). Läuft als CLI, Py/TS-SDK, MCP-Server, Rust-Binary oder **HTTP-Proxy auf Port 9377** (`ANTHROPIC_BASE_URL` etc. darauf zeigen). Claude-Code-Integration: `entroly attach create --client claude --project . --ttl 4h --install`.[^15^]

**Evidenz (eigene Benchmarks, gpt-4o-mini, Wilson-95 %-CIs, n=20–50).** NeedleInAHaystack 100 % Retention bei 99,5 % Ersparnis; LongBench-HotpotQA 103 % bei 85,3 %; BFCL 100 % bei 79,3 %; **SQuAD 2.0: 80 %→72 % — ehrlich als Qualitätsverlust ausgewiesen** („Compression is a trade, not magic"). Cache-Hygiene explizit: hält unveränderte Prompt-Teile stabil, damit Provider-Caching greift. Model-Routing optional und **fail-closed** bei Unsicherheit.[^15^]

**Nebenkosten.** Rein lokal, keine Outbound-Calls, kein separates Modell nötig; `entroly simulate` + `verify-claims` erlauben kostenlose Eigenmessung vor Commitment. 435★ bei 100k+ behaupteten Downloads; Dokumentation ungewöhnlich umfangreich (inkl. Limitations- und Public-Evidence-Policy-Docs).

### 9. KRLabsOrg/squeez — trainierter Tool-Output-Pruner (23★)

**Mechanismus.** CLI-Pipe: `pytest -v 2>&1 | squeez "find the auth test failure"` → nur die relevanten Zeilen. Zwei Modelle, gleiche CLI: generatives **Qwen-3.5-2B** (LoRA; F1 0,80, 92 % Kompression) oder extraktives **ModernBERT 150M** (span-basiert). Trainiert auf 27 Tool-Output-Typen aus echten SWE-bench-Workflows + synthetischen Multi-Ökosystem-Daten — explizit gegen die Lücke positioniert, dass SWE-Pruner/Provence/Semantic-Highlight für Code/Dokumente gebaut sind, nicht für gemischte Tool-Outputs (Stack-Traces + PASS-Zeilen + Timestamps).[^16^]

**Evidenz.** 618 manuell kuratierte Held-out-Beispiele: Squeez-2B P 0,80/R 0,86/F1 0,80 @ 92 % Kompression; schlägt Qwen-3.5-35B-A3B zero-shot (F1 0,73) und Kimi K2 (0,68) deutlich; untrainiertes 2B-Modell nur F1 0,55 → Training trägt. arXiv:2604.04979.[^16^]

**Integration & Nebenkosten.** Für Claude Code über CLAUDE.md-Instruktion („pipe shell commands through squeez"), kein Hook, kein MCP — die Nutzung hängt an der Modell-Disziplin (offenes Issue #1: „how to get Claude Code to use it more?"). Betrieb: vLLM-Server (empfohlen, warm) oder lokale Inferenz (lädt Modell pro Call — für Agent-Loops ungeeignet) oder beliebiger OpenAI-kompatibler Endpoint (Groq etc.). **Fail-open-Risiko umgekehrt:** Wenn squeez die *falschen* Zeilen filtert, fehlt dem Agenten Evidenz; README rät selbst: nicht nutzen, wenn exakter Output gebraucht wird (Patches schreiben, interaktive Kommandos).[^16^]

---

## Sekundär-Repos Kurzliste

| Repo | ★ | Kurzurteil |
|---|---|---|
| **mibayy/token-savior** | 1.113 | MCP-Kombi (strukturelle Code-Navigation + Memory + Bash-Rewriting). Behauptet 97,9 % (188/192) auf eigenem tsbench bei −80 % Tokens/−83 % Walltime vs. 78,3 % plain — **Benchmark-Harness nicht öffentlich**, Zahlen „as reported". Lehrreiche Selbstkorrektur (09./10.08.2026): ein nachgeschobenes Re-Masurement wurde zurückgezogen, weil **Tool Search (deferred loading) alle 18 MCP-Tools des Servers hinter ToolSearch versteckt hatte — das Modell rief sie nie auf** (1 MCP-Call in 143 Sessions). Wichtigster Interoperabilitäts-Befund dieser Recherche.[^20^] |
| **jia-gao/leanctx** | 316 | Drop-in-Prompt-Kompression für Produktions-LLM-Apps (Python-SDK, LLMLingua-2-basiert), 40–60 % Ersparnis behauptet. Erbt die LLMLingua-2-Probleme (bricht strukturierte Daten/Code; Prompt-Cache-Bruch) — für Coding-Agent-Kontext kritisch.[^21^] |
| **microsoft/acon** | 100 | Offizielle Implementierung des ACON-Papers (Context Compression für Long-horizon Agents). Forschungs-Referenz, seit 10/2025 nicht mehr gepusht; kein Claude-Code-Integrationspfad.[^21^] |
| **Madhan230205/token-reducer** | 42 | „90 %+" Claude-Code-Kompression, lokal, Hybrid-RAG (BM25 + ONNX-Vektoren). Klein, seit 05/2026 ruhend; Behauptungen unbelegt.[^21^] |
| **Open330/context-compress** | 1 | MCP-Server + Hook-Toolkit zur Tool-Output-Kompression; aktiv gepflegt (08/2026), aber 1★ / 0 Issues = keine Adoption.[^21^] |
| **SenseiIssei/Sensei** | 2 | Self-hosted Gateway, „79 % fewer tokens, measured"; sehr jung, keine Substanz prüfbar.[^21^] |
| **techdeveloper-org/mcp-token-optimizer** | 0 | „Cuts Claude Code token usage by 60–85 %"; 0★, keine Belege.[^21^] |
| **llmlingua-cursor** (npm) | — | One-Command-LLMLingua-2 für Cursor; v1.0.4, einmalig am 20.04.2026 publiziert und nie aktualisiert. Cursor-spezifisch, kein Claude-Code-Pfad.[^21^] |

---

## Verkettungs-/Kompatibilitätsanalyse

### Die korrekte Verkettung

```
Claude Code (Agent)
  │  ── Schicht 1: HOOKS (PreToolUse/PostToolUse/SessionStart/PreCompact)
  │     context-mode-Plugin | token-optimizer-Plugin
  │     → routen Bash/Read/Grep/WebFetch in die MCP-Sandbox, BEVOR
  │       Rohoutput je in die Konversation gelangt
  │
  ├── Schicht 0/1b: MCP-ANBINDUNG
  │     MCP-Server direkt ── ODER ── hinter mcp-compressor-Wrapper
  │     (get_tool_schema/invoke_tool) ── ODER ── Bifrost-MCP-Gateway
  │     (Code Mode). Native Claude-Code-Tool-Search wirkt zusätzlich
  │     auf Client-Seite (deferred loading).
  │
  └── Schicht 2: HTTP-PROXY/GATEWAY (ANTHROPIC_BASE_URL)
        Paritok (self-host) ── ODER ── Edgee (hosted) ── ODER ──
        entroly-Proxy ── ODER ── Bifrost-Gateway
        → rewrite des kompletten Requests (Tool-Filter, Content-
          Kompression, History-Summary) vor dem Provider-Call
  │
Anthropic / Provider-API
```

**Reihenfolge ist kausal, nicht optional:**
1. **Hooks/MCP-Sandbox zuerst** (client-seitig, vor Request-Bau): Was context-mode in der Sandbox hält, kommt gar nicht erst in die History, die der Proxy später komprimieren müsste. Das ist die billigste Einsparung, weil sie Output *nie entstehen lässt* statt ihn nachträglich zu verdichten.
2. **MCP-Schema-Wrapper** (mcp-compressor) sitzt *vor* dem Client — der Client sieht von Anfang an nur 2–3 Tools. Wirkung ist identisch zur Proxy-seitigen Schema-Filterung, aber früher und ohne BASE_URL-Umbiegen.
3. **Proxy/Gateway zuletzt** (vor dem Provider): sieht den fertig gebauten Request und kann als einzige Schicht *History und Output-Prosa* anfassen. Es gibt **genau einen** BASE_URL-Slot — Proxys sind untereinander austauschbar, nicht stapelbar.

### Welche Kombinationen sich beißen

| Kombination | Urteil | Grund |
|---|---|---|
| context-mode **+** ooples/token-optimizer | ❌ | Beide wollen per Hook dieselben Built-in-Tools (Read/Bash/Grep/Glob) wegrouten; doppelte Hook-Ketten = unklare Zuständigkeit, doppelte Latenz, konkurrierende Deny-Logik |
| mcp-compressor **+** Paritok-Toolfilter (auf denselben Servern) | ❌ | Doppelte Indirektion: Modell müsste `gateway_search_tools` aufrufen, um `invoke_tool` zu finden, um `get_tool_schema` aufzurufen. Außerdem stubbt Paritok evtl. genau die Wrapper-Tools |
| mcp-compressor **+** Edgee TSR | ⚠️ redundant | Beide kollabieren die Tool-Oberfläche; TSRs Klassifikator kann Wrapper-Tools falsch scopen. Eine Schema-Schicht reicht |
| Beliebige Schema-Reduktion **+** natives Tool Search | ⚠️ messen! | Tool-Search-Anekdote aus token-savior: deferred loading versteckte alle 18 MCP-Tools → Modell rief sie nie auf (1 Call/143 Sessions). Wer MCP-Tools *will*, muss prüfen, dass Tool Search sie nicht wegdeferred; bei Wrapper-Servern (mcp-compressor) kann Tool Search die 2 Wrapper deferred laden und die ganze Pipeline kaltlegen. Umgekehrt macht Tool Search (~47 % Ersparnis, nativ, kostenlos) mcp-compressor bei mittleren Setups oft überflüssig.[^18^][^20^] |
| Paritok **+** Edgee (Proxy-Kette) | ❌ | Ein BASE_URL-Slot; technisch verkettbar, aber: Paritoks `[REF:id]`/`read_original`-Protokoll und Edgees TSR/Brevity würden sich gegenseitig die Marker wegkomprimieren. Nicht supported |
| Bifrost Code Mode **+** mcp-compressor | ❌ | Beide ersetzen die Tool-Liste durch Meta-Tools; Code Mode will die Server direkt kontrollieren |
| squeez **+** context-mode | ✅ kompatibel | squeez läuft *in* der Pipe innerhalb von `ctx_execute`/Bash; squeeze zuerst, stdout bleibt sowieso klein. Einzige Schwachstelle: Modell-Disziplin (kein Hook-Enforcement) |
| squeez/RTK-ähnliche Trimmer **+** Edgee/Paritok-Proxy | ✅ kompatibel, aber abnehmender Grenznutzen | Proxy trimmt denselben Output nochmal; lokales Pre-Trimmen spart zusätzlich History-Volumen, kostet aber lokale Modell-Latenz |
| context-mode **+** Paritok | ✅ sinnvollste Paarung | Orthogonal: context-mode hält Tool-Output aus der History (Input-Block 3), Paritok filtert Schema-Block und komprimiert Rest-History. Paritok profitiert davon, dass weniger Müll ankommt |
| LLMLingua-2-basierte Tools (leanctx, llmlingua-cursor) **+** Coding-Agent-Kontext | ❌ | Bricht strukturierte Daten/Code (Retrieval <50 %) und Prompt-Cache; für diese Schicht ungeeignet (bestätigt durch Paritok-Vergleichstabelle und unabhängige Berichte)[^7^] |

### Cache-Bruch als Querschnittsthema

Prompt-Caching ist der stille Multiplikator: jede Schicht, die den **Prefix nicht-deterministisch** verändert, zerstört Cache-Reads (10 % des Input-Preises) und erzeugt Cache-Writes (1,25–2×).[^18^] Positiv: mcp-compressor (stabile Wrapper-Oberfläche), Paritok (eingefrorene Tool-Selektion pro Konversation), entroly (explizite Cache-Hygiene) sind darauf ausgelegt. Negativ: Paritok-Issue #41 zeigt, dass *Recovery* (read_original) einen vollen Prefix-Cache-Write auslöst, der in der eigenen Ersparnisrechnung fehlte; token-savior-Re-Measurement zeigt, dass schon die *Größe des gecachten Prefix* Benchmarks verfälschen kann.[^8^][^20^]

---

## Konflikte & Fallstricke

1. **Doppelte Output-Verdauung ohne Gesamtnutzen.** Wenn context-mode Outputs auf 2 % kürzt, bleibt für Proxy-seitige Trimmer (Edgee TRT, RTK) kaum Masse — der Grenznutzen der zweiten Schicht sinkt gegen null, ihre Fixkosten (Latenz, Komplexität) nicht. Umgekehrt gilt: Wer einen Proxy mit Output-Trimming fährt, braucht RTK-Style-Hooks nicht zusätzlich.
2. **Schema-Reduktion kann Discovery killen.** token-savior-Case: 18 Tools hinter ToolSearch = praktisch 0 Nutzung. Jede Progressive-Disclosure-Lösung (mcp-compressor `max`, Tool Search, Edgee TSR) muss verifizieren, dass der Agent die Lookup-Tools *tatsächlich aufruft* — sonst misst man Token-Ersparnis und unbemerkt Qualitätsverfall (Agent fällt auf Grep/Read zurück).[^20^]
3. **Silent pass-through.** Paritok #30/#31/#38: Hosted-Backend kann unkomprimiert durchreichen, während Health-Checks „ok" melden. Bei *jedem* Proxy gehört ein Vergleich `/stats` vs. Provider-Billing zur Erstvalidierung.[^8^]
4. **Kleine-Stichproben-Euphorie.** Edgees 6/6 & 8/8 SWE-bench sind statistisch sauber gerechnet, aber n=6/8 sagt fast nichts über Long-Tail-Degradation. Das Kunden-Aggregat (~20 % Rechnungsreduktion, kein messbarer Drift) ist die belastbarere Zahl.[^11^]
5. **Sandbox ≠ Sandbox.** context-mode führt beliebigen Code mit Host-FS-Rechten aus; der Approval-Prompt des Hosts sieht die Parameter nicht (#852-Historie). Bifrost-Starlark ist dagegen ein echter Interpreter-Sandbox. Wer ctx_execute auto-approvt, hat faktisch Bash auto-approvt.[^1^]
6. **Hosted-Gateway = Datenfluss an Dritte.** Edgee routed alle Prompts über Edgees Infrastruktur (Free-Tier inklusive) — für Code unter NDA/Compliance relevant; Paritok/entroly/context-mode/mcp-compressor/squeez sind vollständig lokal betreibbar.
7. **Brevity-Eingriffe in Output-Prosa sind die fragilste Schicht.** context-mode verzichtet bewusst darauf (Benchmark-Degradation durch aggressive Kürzungs-Prompts); Edgees Brevity ist genau das, nur serverseitig — die 6/6-Evidenz ist dünn.[^1^][^12^]
8. **Fork-/Ökosystem-Risiko.** Edgees Engine ist von RTK abgeleitet; token-optimizer und context-mode überlappen funktional stark. In 6–12 Monaten wird sich dieser Stack konsolidieren — auf Standard-Schnittstellen (MCP-Config, BASE_URL, settings.json-Hooks) setzen, nicht auf proprietäre Datenformate.

---

## Stack-Empfehlung für diese Schicht

### Solo-Dev (Subscription oder moderates API-Billing)

1. **Basis (nativ, kostenlos):** Tool Search an lassen (Default), `MAX_MCP_OUTPUT_TOKENS` prüfen (Default 25k; bei MCP-light-Setups ggf. senken), ungenutzte MCP-Server deaktivieren, CLIs (`gh`, `aws`) statt MCP-Äquivalenten nutzen. Das allein sind die ~47 % Schema-Ersparnis ohne jede neue Abhängigkeit.[^18^]
2. **Tool-Output-Block:** **context-mode** als Plugin installieren (Hooks vollständig → ~98 % Output-Reduktion, Session-Kontinuität über /compact hinweg, null Telemetrie, null Modellkosten). Das ist der mit Abstand beste Preis/Leistungs-Eingriff der Dimension.[^1^]
3. **Optional bei ≥2 schweren MCP-Servern (GitHub/Atlassian-Klasse):** **mcp-compressor** als Wrapper auf Stufe `medium`–`high` davor — 17,6k→2–4k Tokens, deterministisch, cache-stabil. Vorher mit Tool Search vergleichen; beides auf demselben Server ist redundant.[^4^]
4. **Optional, falls GPU/Ollama vorhanden und lange Sessions:** **Paritok** self-host (Anthropic-Pfad; OpenAI-Pfad wegen #40 meiden). Erst `/stats` gegen Billing verifizieren.
5. **Nicht empfohlen für Solo:** Edgee (hosted, Datenschutz, Subscription-Overlap), bifrost Code Mode (Enterprise-Fokus), LLMLingua-2-Ableger (Code-Bruch), DietCode (noch nicht released).

### Team (API-Billing, MCP-schwer, Governance-Bedarf)

1. **Proxy-Schicht als Kontrollpunkt:** Entweder **Paritok self-host** (non-destruktiv, rückholbar, Apache-2.0, kein Datenabfluss; Recovery-Cache-Kosten im Blick behalten, Issue #41) **oder** **Edgee** (null Ops, Metering pro Dev/Repo/PR, Budgets/Rerouting, aber hosted + ~20 % realistische statt 50 % Marketing-Ersparnis). Nicht beides.
2. **Schema-Schicht standardisieren:** mcp-compressor (`high`) vor die großen Server ODER Tool Search diszipliniert nutzen — eine Schicht, teamweit gleich konfiguriert (sonst misst niemand mehr etwas Vergleichbares).
3. **Output-Schicht:** context-mode teamweit per Plugin (gleiche Version pinnen; #901-Windows-Problematik beachten) — plus optional squeez für CI-/Log-schwere Workflows.
4. **Enterprise-Gateway-Konsolidierung (nur wenn ohnehin geplant):** bifrost liefert Code Mode + Governance + Fallbacks in einem; dann MCP-Server an den Bifrost-MCP-Gateway hängen und mcp-compressor *nicht* zusätzlich einsetzen.
5. **Messung vor Skalierung:** Paritok-`/stats` bzw. Edgee-`compression`-Block und ooples-Style-Attribution nutzen, aber gegen die Provider-Rechnung validieren — zwei der untersuchten Projekte (Paritok #41, token-savior Retraction) zeigen, dass Eigenmessungen systematisch zu optimistisch ausfallen können.

---

## Quellen

[^1^]: mksglu/context-mode — README (Install, Sandbox, Tools, Benchmarks, Security, Routing-Enforcement). https://github.com/mksglu/context-mode (abgerufen 13.08.2026; 19.825★)
[^2^]: mksglu/context-mode — offene Issues #911, #1022, #947, #1048, #901 u. a. https://github.com/mksglu/context-mode/issues (GitHub-API, 13.08.2026)
[^3^]: atlassian-labs/mcp-compressor — README & Docs (Pattern 1/2, Kompressionslevel, CLI/SDK, generierte Clients). https://github.com/atlassian-labs/mcp-compressor · https://atlassian-labs.github.io/mcp-compressor/
[^4^]: Atlassian Engineering Blog — „MCP Compression: Preventing tool bloat in AI agents" (GitHub-MCP 94 Tools/17,6k Tokens; Tier-Tabelle 17.600→3.900/3.300/2.200/500; Qualitäts- und Cache-Aussagen; Code-Mode-Einordnung). https://www.atlassian.com/blog/developer/mcp-compression-preventing-tool-bloat-in-ai-agents/
[^5^]: maximhq/bifrost — README (Gateway, 23+ Provider, 11 µs Overhead @5k RPS, Plugin-System). https://github.com/maximhq/bifrost (7.267★, 821 offene Issues)
[^6^]: Bifrost Docs — „Code Mode" (4 Meta-Tools, Starlark-Sandbox, 3-Runden-Benchmark 96/251/508 Tools: −58,2 %/−84,5 %/−92,8 % Input, Pass-Rates 100 %). https://docs.getbifrost.ai/mcp/code-mode
[^7^]: Paritok-official/paritok-4b-v1 — README (3 Hebel, 29k→8k Toolfilter, 25,7 % CR, SWE-bench-Lite 86,5 % Retention, Session-Kompoundierung, Quick Start, Preise). https://github.com/Paritok-official/paritok-4b-v1 · HF: https://huggingface.co/paritok/paritok-4b-v1
[^8^]: Paritok-official/paritok-4b-v1 — offene Issues #40 (OpenAI-Pfad verwirft komprimierte History), #41 (Cache-Write nicht eingepreist), #31/#38 (silent no-op), #30 (Health-Check-Diskrepanz). https://github.com/Paritok-official/paritok-4b-v1/issues (GitHub-API, 13.08.2026)
[^9^]: edgee-ai/edgee — README (CLI, Launch-Targets, Statusline-Integration, RTK-Ableitung, kein Self-Hosting). https://github.com/edgee-ai/edgee (124★)
[^10^]: Edgee — Token Compression V2 Produktseite (2 Layer/3 Techniken, <12 ms P50, TSR-Klassifikator, „illustrative figures"). https://www.edgee.ai/token-compression
[^11^]: Edgee Docs — FAQ (Claude-Code-Endurance +26,2 %, Codex −49,5 % Fresh-Input, Kunden-Aggregat ~20 %, compression-Block pro Response). https://www.edgee.ai/docs/introduction/faq
[^12^]: dailyaiworld.com — „Cut Your Claude Code Costs by 50%: Edgee Compressor V2 Complete Guide" (Brevity 6/6 p=0,031; TSR 8/8 p=0,008; Launch 02.07.2026). https://dailyaiworld.com/blogs/edgee-compressor-v2-claude-code-guide-2026
[^13^]: FlorianBruniaux/claude-code-ultimate-guide — context-engineering-tools.md (Edgee-Layer-Tabelle; RTK-Relation; Overlap TSR↔Tool Search). https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ecosystem/context-engineering-tools.md
[^14^]: ooples/token-optimizer-mcp — README (Deny-Hooks, Zero-Turn-Refusal, Wissensgraph, verified-vs-quarantined Messung, Dashboard-Belege 43.491 netto Tokens, Hook p95 87 ms). https://github.com/ooples/token-optimizer-mcp (479★)
[^15^]: juyterman1000/entroly — README (Selektion+Kompression, Receipts, Recovery 66/66, Benchmarks inkl. SQuAD-Verlust 80→72 %, Proxy Port 9377, fail-closed Routing). https://github.com/juyterman1000/entroly (435★)
[^16^]: KRLabsOrg/squeez — README (2B/150M-Modelle, 618 Beispiele/27 Tool-Typen, F1 0,80 @ 92 %, CLAUDE.md-Integration, vLLM) + arXiv:2604.04979 „Squeez: Task-Conditioned Tool-Output Pruning for Coding Agents". https://github.com/KRLabsOrg/squeez · https://arxiv.org/abs/2604.04979
[^17^]: scaledown-team/DietCode — README (Pre-Launch, „final testing", geplante Features). https://github.com/scaledown-team/DietCode (2★)
[^18^]: sup3x/claude-code-eco — token-optimization-guide.md (Tool Search default-on, ~47 % MCP-Token-Reduktion; MAX_MCP_OUTPUT_TOKENS Default 25.000; Prompt-Cache-Ökonomie 10 %/1,25×/2×). https://github.com/sup3x/claude-code-eco/blob/main/docs/token-optimization-guide.md
[^19^]: anthropics/claude-code — Issue #12836 (Tool Search & Programmatic Tool Calling Betas: 85 % Token-Reduktion, Opus-4.5-Accuracy 79,5 %→88,1 %; Anthropic-Engineering-Referenz). https://github.com/anthropics/claude-code/issues/12836
[^20^]: Mibayy/token-savior — README (97,9 % tsbench-Claim, Harness nicht öffentlich; Retraction 09./10.08.2026: Tool Search hatte 18 MCP-Tools wegdeferred, 1 MCP-Call in 143 Sessions). https://github.com/Mibayy/token-savior (1.113★)
[^21^]: GitHub-API-Metadaten (13.08.2026) für Open330/context-compress (1★), SenseiIssei/Sensei (2★), techdeveloper-org/mcp-token-optimizer (0★), Madhan230205/token-reducer (42★), jia-gao/leanctx (316★), microsoft/acon (100★); npm-Registry: llmlingua-cursor v1.0.4. Ergänzend: aberemia24/code-executor-MCP (Progressive Disclosure, 47 Tools/141k→2 Tools/1,6k) https://github.com/aberemia24/code-executor-MCP
