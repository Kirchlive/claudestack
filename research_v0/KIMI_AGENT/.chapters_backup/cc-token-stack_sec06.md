## 11. Code-Intelligence und Indizes

Code-Indizes sind die am häufigsten überkaufte Schicht im gesamten Stack. Die Aktivierungsregel vorweg: Ein Index ist ein Werkzeug für große, fremde Repos und breite Architektur-Fragen — kein Default. Für Repos unter ~300 Dateien, enge Einzelfragen und kurze Sessions ist die native agentische Suche messbar die bessere Wahl.

### 11.1 Evidenz: Der Mechanismus funktioniert, die Rechnung nicht zwingend

Der Kernmechanismus ist unstrittig belegt: Vorberechnete Code-Indizes senken Navigationsaufwand reproduzierbar. Im unabhängigen Hono-Test (40 Runs, Opus 4.8) reduzierte codegraph die Tool-Calls um 55 % — der stärkste robuste Einzelbefund dieser Schicht[^1^]. Doch sobald End-to-End gemessen wird, kollabiert der Dollar-Effekt: Im offenen THOL-Benchmark über zwölf Tools und ganze Sessions landet codegraph auf Platz 9 ohne messbare Ersparnis[^2^], und im selben Hono-Test stiegen die Kosten um 6,8 %; enge Fragen wurden 20–43 % **teurer**, nur die breite Architektur-Frage sparte 29 %[^1^].

Die Erklärung ist strukturell, nicht tool-spezifisch: Navigation ist nur eine Teilmenge der Token-Rechnung. File-Reads, Command-Output und Transcript-Replay dominieren den Bill — und Graph-Antworten sind dichte Payloads, die im Kontextfenster liegen bleiben. codegraph selbst dokumentiert ehrlich +80 % residenten Retrieval-Kontext am Sessionende (67k vs. 18k Tokens auf VS Code)[^3^]. Wer einen Index ohne Compact-Disziplin und Output-Filter betreibt, spart an der Navigation und zahlt an der Session-Länge zurück.

Anthropic hat diese Rechnung intern längst gemacht. Boris Cherny, Creator von Claude Code: „Early versions of Claude Code used RAG + a local vector db, but we found pretty quickly that agentic search generally works better"[^4^]. Wichtige Differenzierung: Dieses Urteil trifft primär Vektor-RAG. Struktur-Graphen mit aktivem Watcher (codegraph) adressieren das Staleness-Problem konstruktiv, und LSP-basierte Ansätze (serena) kennen es prinzipiell nicht. Trotzdem deckt sich die unabhängige Messung mit Anthropics Position: Für den Gesamtbill ändert ein Index wenig[^1^][^2^].

**Bedeutung für die Entscheidung:** Budgetieren Sie Code-Intelligence als Präzisionswerkzeug, nicht als Infrastruktur. Aktivierung erst ab einer klaren Schwellenbedingung — großes unbekanntes Repo, mehrtägiges Onboarding, PR-Review-Pflicht oder Refactor-lastige Arbeit — und immer im Verbund mit Output-Filtern (Kapitel 7) und Compact-Disziplin (Kapitel 9), weil der Index allein den Bill nicht bewegt.

### 11.2 Einsatzmatrix: Welcher Index für welchen Workflow

Die sechs relevanten Kandidaten unterscheiden sich weniger in der Retrieval-Qualität als in ihrem Einsatzzweck und ihrem Kontext-Preis. Die Matrix ordnet nach Aktivierungsregel, nicht nach Popularität.

| Tool | Einsatzzweck | Aktivierungsregel | Kontext-Preis | Hauptrisiko |
|---|---|---|---|---|
| **serena** | Edit-/Refactor-lastige Arbeit; einziger Kandidat mit symbolischem Editing (replace_symbol_body, rename)[^5^] | Tägliches Editieren in typisierten Sprachen; Fehlervermeidung wichtiger als Token-Bilanz | Mittel (~25–30 Tools, Basis-Tools in CC default deaktiviert)[^5^] | LSP-Staleness-Bugs (#1593, #1744); kein Token-Benchmark |
| **codegraph** | Exploration großer, unbekannter Repos | Onboarding ab ~300+ Dateien; breite Architektur-Fragen | Minimal: 1-Tool-Manifest (`codegraph_explore`), Rest opt-in[^3^] | +80 % residenter Kontext[^3^]; enge Fragen 20–43 % teurer[^1^] |
| **code-review-graph** | PR-Gates und CI-Review (detect_changes, Risk-Scoring, GitHub Action) | Merge-Gates mit Blast-Radius-Pflicht | Hoch: 30 Tools default; Allowlist via `CRG_TOOLS` auf 3–5 senkbar[^6^] | Unabhängig nur −5 % Gesamttokens[^7^]; zirkulärer Recall-Caveat |
| **graphify** | Gemischte Corpora: Code **plus** Docs, PDFs, SQL im Knowledge-Graph | Wenn Dokumente Teil der Codebase-Wahrheit sind | Gering (Skill mit Progressive Disclosure statt MCP-first)[^8^] | 915 offene Issues, Doku-Bugs; 71,5×-Claim ist kein E2E[^8^] |
| **claude-context** | Semantische Konzept-Fragen auf sehr großen Repos („wo wird Auth gehandhabt?") | Nur mit vorhandenem Infra-Budget (Milvus/Zilliz + Embedding-Key) | Klein (4 Tools), aber laufende Embedding-Kosten[^9^] | Genau der Vektor-Ansatz, den Anthropic verworfen hat[^4^] |
| **codebase-memory-mcp** | Mono-/Multi-Repo-Speed, Cross-Repo-Cypher | Erst nach Fix der Staleness-Issues #1296/#1191 oder mit Reindex-Ritual[^10^] | Mittel (15 Tools) | Silent Staleness: serviert veralteten Graph unbegrenzt ohne Warnung[^10^] |

Diese Matrix ersetzt die Star-Rangliste, weil die beliebtesten Tools nicht die passendsten sind. graphify führt den Markt mit 105,7k★ bei gleichzeitig 915 offenen Issues und dokumentierten Doku-Fehlern — Adoption ist hier kein Reife-Indikator. Entscheidend ist die Passung zum Workflow: serena gewinnt seinen Wert aus Edit-Qualität, nicht aus der Token-Bilanz, und verzichtet bewusst auf jeden Spar-Claim[^5^]. codegraph ist der einzige Kandidat, der das Manifest-Problem konsequent löst (ein sichtbares Tool) und Staleness aktiv signalisiert (⚠️-Banner statt silent failure) — beides Eigenschaften, die in der Praxis mehr wiegen als Prozentpunkte im Vendor-Benchmark[^3^]. code-review-graph ist als Token-Sparer überbewertet (−5 % unabhängig gemessen[^7^]), als PR-Gate aber fachlich der richtige Einsatz, weil dort der Blast-Radius den Mehrwert trägt. codebase-memory-mcp ist technisch der schnellste Index, aber mit offenen Silent-Staleness-Bugs aktuell nicht vertrauenswürdig für Absence-Claims („X wird nirgends aufgerufen")[^10^].

**Anti-Kontext-Fresser-Regeln für jeden Index-Einsatz:**

1. **Manifest minimieren.** Die einzige gemessene Kostenreihe stammt von token-savior: Profil „tiny" mit 6 Tools ≈ 0,6k Tokens pro Session versus „full" mit 68 Tools ≈ 6k Tokens[^11^]. Konsequenz: codegraph bei einem Tool belassen, CRG per `CRG_TOOLS`-Allowlist von 30 auf 3–5 Tools drücken, serenas Basis-Tools deaktiviert lassen[^3^][^6^][^5^].
2. **Projekt-lokal aktivieren, nie global.** Der Server gehört in die `.mcp.json` des Repos, nicht in die User-Config — er läuft nur dort, wo auch indexiert ist.
3. **Die Deferred-Loading-Falle kennen.** Tools, die hinter nativem Tool-Search verschwinden, werden praktisch nie aufgerufen: In token-saviors zurückgezogener Re-Messung feuerte in 143 Sessions genau ein Tool-Call — der „Benchmark" maß zwei identische Agenten[^11^]. Regel: Lieber gar nicht laden als deferred.
4. **Ein Navigator pro Session.** Zwei Index-MCPs parallel bedeuten doppeltes Manifest plus widersprüchliche Navigationshinweise. Kombinationen nur über dokumentierte Off-Schalter.
5. **Lizenz prüfen vor Rollout.** jcodemunch — mit der fairsten Baseline im Feld (grep-top-3) — steht unter Dual-Use-Lizenz: Kommerzielle Nutzung erfordert eine Paid License ($79–2.499) und ist für Firmen-Stacks ohne Klärung ein Blocker[^12^]. Alle sechs Kandidaten der Matrix stehen unter MIT/Apache.

**Bedeutung für die Entscheidung:** Wählen Sie maximal einen Kandidaten aus der Matrix, binden Sie ihn projekt-lokal mit minimalem Manifest ein und messen Sie nach zwei Wochen Tool-Calls und Session-Kosten gegen die Vorwoche. Ohne diese Gegenprobe bleibt der Index ein Glaubenssatz — die unabhängige Evidenzlage zeigt, dass er im ungünstigsten Fall mehr kostet als er spart[^1^][^2^].

### Quellen dieses Kapitels

[^1^]: Harrison — „I Tested CodeGraph on Hono" (unabhängig, 40 Runs Opus 4.8: Tool-Calls −55 %, Kosten +6,8 %, enge Fragen 20–43 % teurer, breite Frage −29 %) — https://harrisonsec.com/blog/i-tested-codegraph-on-hono-benchmark/, 2026
[^2^]: Tokenade — „CodeGraph Alternatives: 6 Tools Compared" (THOL-Benchmark: codegraph 9/12, keine messbare E2E-Ersparnis; Disclosure: THOL vom Autor gepflegt) — https://tokenade.net/en/articles/codegraph-alternatives, 2026
[^3^]: colbymchenry/codegraph — README (1-Tool-MCP-Surface, +80 % Residual-Context-Caveat, 3-Schichten-Staleness-Signale) — https://github.com/colbymchenry/codegraph, 2026-08
[^4^]: Boris Cherny Primärquellen-Lage: X-Post 2026-02-01 („agentic search generally works better"), zusammengestellt — https://smartscope.blog/en/ai-development/practices/rag-debate-agentic-search-code-exploration/, 2026
[^5^]: oraios/serena — README (LSP-basiert, symbolisches Editing, Basis-Tools in CC default deaktiviert, Agent-as-Judge-Evaluierung statt Token-Claim) — https://github.com/oraios/serena, 2026-08
[^6^]: tirth8205/code-review-graph — README (30 MCP Tools default, `CRG_TOOLS`-Allowlist, detect_changes, GitHub Action, Limitations-Abschnitt) — https://github.com/tirth8205/code-review-graph, 2026-08
[^7^]: ComputingForGeeks — „Reduce Claude Code Tokens: 10 Tested Tools" (unabhängiges Leaderboard: code-review-graph −5 % Gesamttokens) — https://computingforgeeks.com/reduce-claude-code-token-usage-tools/, 2026
[^8^]: Graphify-Labs/graphify — README (Skill-Architektur, Docs/SQL-Extraktion, 71,5×-Claim ohne E2E, ~1× auf kleinem Korpus) — https://github.com/Graphify-Labs/graphify, 2026-08
[^9^]: zilliztech/claude-context — README (4 MCP Tools, Hybrid BM25+dense, Setup: Milvus/Zilliz + Embedding-Key, ~40 % eigene Eval) — https://github.com/zilliztech/claude-context, 2026-08
[^10^]: GitHub Issues DeusData/codebase-memory-mcp (API, 2026-08-13): #1296/#1191/#1213 — stale Graph/Store nach Reindex, silent — https://github.com/DeusData/codebase-memory-mcp/issues/1296, 2026-08-13
[^11^]: Mibayy/token-savior — README (Profil-Tabelle: tiny 6 Tools ≈ 0,6 KT vs. full 68 ≈ 6 KT; zurückgezogene Re-Messung mit Deferred-Tool-Loading-Lektion) — https://github.com/Mibayy/token-savior, 2026-08
[^12^]: jgravelle/jcodemunch-mcp — README + LICENSE (grep-top-3-Baseline 27,9×, Dual-Use-Lizenz $79–2.499 kommerziell) — https://github.com/jgravelle/jcodemunch-mcp, 2026-08

## 12. Memory und Persistenz

Memory-Systeme versprechen, das Neu-Erkunden abgeschlossener Wissensbestände zu verhindern — und erzeugen dabei selbst Kontextkosten über MCP-Tool-Definitionen, Session-Injection und laufende Kompressions-APIs. Die Aktivierungsregel vorweg: Dateibasierte Persistenz ist das Fundament für jeden; ein echtes Memory-System lohnt sich erst ab etwa vier Wochen Projekthistorie oder Multi-Projekt-Nutzung, und dann genau eines — niemals global als MCP registriert.

### 12.1 Die Token-Kosten-Wahrheit der Memory-Systeme

Die Marktführer nach Stars sind zugleich die Systeme mit dem höchsten versteckten Overhead. Werbehinweise wie „~170 Token Startup" oder „92 % weniger Token" ignorieren systematisch, dass MCP-Tool-Definitionen jede Session mitgeschleppt werden. Die ehrliche Bilanz:

| System | Philosophie | Statischer Overhead/Session | Laufende Kosten | Ehrliches Urteil |
|---|---|---|---|---|
| **claude-mem** | Lossy: LLM komprimiert Observationen, Push-Injection zum Sessionstart | Klein (3–4 MCP-Tools); Injection ~800–3.000 T, Worst Case ~12.500 T[^1^] | $5–15/Monat Kompression[^1^] | Der Pragmatik-Standard — mit offenem Re-Injection-Bug #3480[^2^] |
| **MemPalace** | Verbatim: nichts wird zusammengefasst, Pull-only | **44 MCP-Tools = 4.370–8.570 T/Session** — widerlegt jeden 170-Token-Claim[^3^] | $0 (lokale Embeddings) | Bester dokumentierter Recall des Feldes; nur Subagent-Frontmatter-scoped einsetzbar |
| **agentmemory (rohitg00)** | Lossy + 4-Tier-Konsolidierung | **54 MCP-Tools** — größte Tool-Fläche im Feld; Injection per Default aus[^4^] | $0 lokal bis ~$5/35h (Sonnet)[^4^] | Spart 92 % Injection und verschenkt es an Tool-Defs — außer man scoped |
| **auto-memory** | CLAUDE.md-Sync per isoliertem Subagent | 0 Main-Session-Kosten[^5^] | Subagent-Tokens pro Sync (versteckt, aber real) | Sauberstes Design gegen CLAUDE.md-Staleness |
| **memsearch** | Markdown = Wahrheit, Vektor-Shadow-Index | 0 MCP-Tools (Skill + CLI)[^6^] | Haiku-Summary/Turn, auf $0 lokal routingbar[^6^] | Sauberstes Kostenmodell unter den Auto-Capture-Systemen |

Die Tabelle zeigt das Tool-Def-Paradox dieser Schicht: Die recall-stärksten Systeme erzeugen den größten statischen Kontext-Overhead. Ein Memory-Server, der 8k Tokens an Tool-Definitionen lädt, muss erst dreißig bis vierzig Datei-Neu-Reads einsparen, um die Nulllinie zu erreichen — in Sessions ohne Recall-Bedarf zahlt er drauf. claude-mem bleibt trotzdem der sinnvolle Default für den Einstieg: kleine MCP-Fläche, konfigurierbare Injection, nachvollziehbare laufende Kosten. Zwei offene Bugs sind dabei token-relevant und gehören auf die Watchlist: #3480 re-injiziert denselben Observations-Block bei jedem Read derselben Datei, #3511 ignoriert EXCLUDED_PROJECTS[^2^]. MemPalace liefert die beste dokumentierte Recall-Qualität des Feldes (LongMemEval R@5 96,6 % ohne LLM[^3^]), versagt aber ausgerechnet im kritischen Moment: Die PreCompact-Hooks #1601 und #906 blockieren die Compaction genau dann, wenn Memory am wichtigsten wäre[^7^]. Wer es einsetzt, registriert die 44 Tools ausschließlich im Frontmatter eines dedizierten Subagenten — nie im Hauptfenster.

**Bedeutung für die Entscheidung:** Rechnen Sie jedes Memory-System mit drei Posten — Tool-Defs, Injection, API — und nicht mit dem Marketing-Footprint. Unter dieser Rechnung bleibt claude-mem der vertretbare Standard, MemPalace der Spezialfall für Langzeit-Archäologie unter Scoping-Zwang, und alles mit mehr als ~15 globalen Tool-Definitionen ist strukturell im Defizit.

### 12.2 Dateibasierte Persistenz als Fundament — und wann Memory sich lohnt

Für statische Fakten — Konventionen, Build-Commands, aktuelle Task-Lage — schlägt Datei-Disziplin jeden Memory-Server: null Tool-Definitionen, null API-Kosten, git-versioniert, kein Staleness-Mechanismus nötig. Das planning-with-files-Muster (task_plan.md, findings.md, progress.md) quantifiziert den Gewinn: Resume nach `/clear` gelingt in 5,0 statt 13,3 Turns, weil der Agent nicht neu erkundet — die gesparten Re-Orientierungs-Turns übersteigen die Injektionskosten der Hooks deutlich[^8^]. Dieselbe Logik trägt die HANDOFF.md-Disziplin aus Kapitel 5: Was diszipliniert in Dateien steht, muss kein Vektor-Index je wiederfinden.

Der Grenznutzen echter Memory-Systeme liegt ausschließlich in **episodischem Wissen**: „Welche drei Ansätze haben wir im März verworfen und warum?", „Wie haben wir den Redis-Port-Konflikt gelöst?" — Dinge, die niemand diszipliniert in eine Handoff-Datei schreibt. Daraus folgt die Schwellenregel: Unter ~4 Wochen Projekthistorie oder bei Einzel-Projekt reichen Dateien; darüber, bei Multi-Projekt oder Team-Onboarding, amortisiert sich Pull-Memory (MemPalace, memsearch); der teure Push-Komfort von claude-mem lohnt vor allem für wechselreiche Workflows. Ergänzend schließt auto-memory die gefährlichste Lücke des Fundaments: Es hält CLAUDE.md per isoliertem Subagent aktuell, ohne einen einzigen Token im Main-Kontext zu kosten — und bekämpft damit das Staleness-Problem, das alle Push-Systeme haben[^5^].

Drei Betriebsregeln verhindern, dass Memory zum Token-Fresser wird. Erstens: **ein Memory-System, nie zwei** — doppelte Tool-Fläche plus Schreib-Konfusion ist der dokumentierte Failure-Mode paralleler Systeme. Zweitens: **nie global als MCP registrieren** — Memory-Tools gehören ins Subagent-Frontmatter oder in die projekt-lokale `.mcp.json`, damit die Definitionen nur im Subagent-Kontext landen und Ergebnisse als kurze Zusammenfassung zurückkommen. Drittens: **Push minimieren, Pull budgetieren** — Injection-Budgets hart setzen und nach jedem Update auf Re-Injection-Bugs der #3480-Klasse prüfen[^2^].

**Bedeutung für die Entscheidung:** Beginnen Sie mit Datei-Disziplin plus auto-memory als Staleness-Wache — Overhead nahe null. Aktivieren Sie ein Memory-System erst, wenn episodische Fragen in Ihrer Praxis tatsächlich wiederkehren, und wählen Sie dann genau eines: claude-mem für Push-Komfort mit kalkulierbarer Rechnung, memsearch für Kostenkontrolle, MemPalace für Langzeit-Recall unter Scoping-Zwang.

### Quellen dieses Kapitels

[^1^]: corti.com — claude-mem Architektur & Token-Ökonomie (Injection ~800–3.000 T typisch, Worst Case 50 Obs. × 250 T ≈ 12.500 T; ~$0,15/100 Observationen Kompression; $5–15/Monat) — https://corti.com/claude-mem-persistent-memory-for-ai-coding-assistants/, 2026
[^2^]: GitHub Issues thedotmack/claude-mem (API, 2026-08-13): offen #3480 (Re-Injection bei jedem Read), #3511 (EXCLUDED_PROJECTS), #3274 — https://github.com/thedotmack/claude-mem/issues, 2026-08-13
[^3^]: MemPalace/mempalace — README v3.7.0 (verbatim, 44 MCP-Tools ⇒ 4.370–8.570 T/Session Overhead, LongMemEval R@5 96,6 % raw, $0 API) — https://github.com/MemPalace/mempalace, 2026-08
[^4^]: rohitg00/agentmemory — README (54 MCP-Tools, INJECT_CONTEXT/AUTO_COMPRESS per Default aus, gemessener Workload 35h: DeepSeek $0,46 / Sonnet $5,02, ~1.900 T vs. 22K T CLAUDE.md-Dump) — https://github.com/rohitg00/agentmemory, 2026-08
[^5^]: severity1/claude-code-auto-memory — README (PostToolUse 0-Token-Tracking, isolierter Subagent, AUTO-MANAGED-Marker, 0 Main-Session-Kosten) — https://github.com/severity1/claude-code-auto-memory, 2026-08
[^6^]: zilliztech/memsearch — README (Markdown Source of Truth, Milvus Shadow-Index, ONNX bge-m3 lokal $0, Stop-Hook-Summary via Haiku) — https://github.com/zilliztech/memsearch, 2026-08
[^7^]: GitHub Issues MemPalace/mempalace (API, 2026-08-13): offen #1601 „PreCompact hook always blocks", #906 „preCompact prevents compacting", #961 (Staleness) — https://github.com/MemPalace/mempalace/issues, 2026-08-13
[^8^]: OthmanAdi/planning-with-files — README v3.x (3-File-Pattern, Recovery-Benchmark 5,0 vs. 13,3 Turns, PreCompact-Flush, PWF_INJECT=smart) — https://github.com/OthmanAdi/planning-with-files, 2026-08

## 13. Routing, Cache-Ebene und Systemprompt

Diese Schicht birgt den größten *Kosten*-Hebel des gesamten Reports — und er liegt nicht im Routing. Anthropic-Cache-Reads kosten 0,1× des Input-Preises; Claude Code cached serverseitig automatisch, bustet den Cache aber durch eigene Bugs und Nutzerverhalten. Die Aktivierungsregel vorweg: Env-Hygiene für alle, cache-fix für Resume- und Lang-Session-Nutzer, Routing nur bei echtem Multi-Provider-Bedarf, Systemprompt-Patches nur mit Augenmaß, semantisches Antwort-Caching gar nicht.

### 13.1 Cache-Hygiene zuerst: cache-fix für Resume-Nutzer, Env-Hygiene für alle

Die Ökonomie ist eindeutig: Eine resumed Session kann ohne Fix ~$5–10 pro Stunde statt ~$0,50 brennen, ohne sichtbare Warnung[^1^]. Das cache-fix-Projekt dokumentiert drei konkrete Bugs in Claude Code, die den Prefix-Cache invalidieren: **Partial Block Scatter** (Attachment-Blöcke driften bei Resume aus `messages[0]` in spätere Messages), **Fingerprint-Instabilität** (Block-Verschiebung erzeugt einen neuen Systemprompt-Fingerprint) und **nicht-deterministische Tool-Reihenfolge** in den Definitionen[^1^]. Der lokale Proxy normalisiert die Request-Struktur und misst im A/B-Vergleich 95,5 % Cache-Hit-Rate gegenüber 82,3 % direkt am ersten Warm-Turn; das 7-Tage-Dogfooding über 37 Sessions bestätigt 94,66 % vs. 92,44 %[^1^]. Ein Detail entscheidet über die Installationsvariante: Ab Claude Code ≥ 2.1.196 deaktiviert jede nicht-Anthropic Base-URL Remote Control, `/schedule` und claude.ai-MCP-Connectors — wer diese Features nutzt, wählt den Forward-Proxy-Modus mit lokaler MITM-CA statt des Reverse-Modus[^1^].

Für jeden Nutzer, ohne Proxy und ohne Kosten, gilt die Stufe-0-Env-Hygiene: `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` verhindert, dass live injizierter `git status` den Systemprompt bei jeder Dateiänderung verändert — ~1.800 Tokens pro Call und ein permanenter Prefix-Bust[^1^]. Dazu Modelle pinnen (`ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL`), `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` gegen stilles Remapping nach Updates, und keine Modell- oder Effort-Wechsel mitten in der Session[^1^].

**Bedeutung für die Entscheidung:** Messen Sie zuerst mit den mitgelieferten Transkript-Tools Ihre Cache-Read-/Create-Verhältnisse, dann entscheiden Sie. Für `--resume`-/Lang-Session-Nutzer und alle mit Quota-Druck ist cache-fix klar empfohlen; für Nutzer frischer Kurz-Sessions genügt die Env-Hygiene, die nichts kostet und nichts bricht.

### 13.2 Routing: Kostenhebel mit Qualitätsbedingungen

Routing spart Geld, nicht Tokens — und ist nur ohne Qualitätsverlust möglich, wenn Haupt- und Think-Pfade auf starken Modellen bleiben. Der Vergleich der Optionen:

| Option | Hebel | Größenordnung | Aktivierungsregel | Hauptrisiko |
|---|---|---|---|---|
| **claude-code-cache-fix** | Cache-Hit-Rate (Kosten) | 95,5 % vs. 82,3 % Hit-Rate; verhindert $0,50/h→$5–10/h bei Resume[^1^] | Resume-/Lang-Sessions, Quota-Druck | Proxy im API-Pfad; MITM-CA im Forward-Modus |
| **claude-code-router (CCR)** | Provider-Arbitrage (Geld) | Community: 50–99 % Kosten je nach Strategie[^2^] | Anthropic-Quota erschöpft, echte Multi-Provider-Strategie | 193 offene Tool-Issues; Tool-Calling-Brüche bei Non-Anthropic-Modellen[^3^] |
| **OpenRouter nativ („Anthropic Skin")** | Failover/Budgets (Geld) | 3 Env-Vars, kein lokaler Stack[^4^] | Wer keinen lokalen Proxy will | Gehosteter Dritt-Anbieter sieht Prompts; Kompatibilität nur mit Anthropic-1P garantiert[^4^] |
| **tweakcc** | Prefix-Schrumpfung (Tokens) | „several thousand tokens" durch Toolset-Entfernung, durch 0,1×-Cache gedämpft[^5^] | Nur mit Wartungsloop-Akzeptanz | Bruchzyklus bei jedem CC-Update (#861/#942); CC unbenutzbar nach Prompt-Edit (#872)[^6^] |
| **semantic-cache-mcp** | Datei-IO-Cache (Tool-Output-Tokens) | 98,9 % auf eigenem 41-Datei-Korpus (Hersteller)[^7^] | Pilot für Lese-lastige Workflows | 2★/Einzelautor; Blocken nativer Read/Edit/Write ist tiefer Eingriff |

Die qualitätssichere CCR-Konfiguration folgt drei Regeln. Erstens: `default` (Hauptdialog) und `think` auf Frontier-Niveau belassen — Anthropic oder vergleichbar —, Billigmodelle ausschließlich auf `background` und Subagenten (Titel-Generierung, Kompaktierung, Fan-out)[^2^]. Zweitens: Provider mit **nativem Anthropic-Protokoll** bevorzugen (Anthropic-1P via OpenRouter Skin, DeepSeek-`/anthropic`-Endpoint, Kimi/Z.ai-Pass-Through) statt OpenAI-Format-Transformern, weil Transformer-Pfade still versagen können[^8^]. Drittens: nach dem Setup einen Tool-Calling-Smoke-Test fahren (Multi-Turn mit mindestens einem Tool-Call). Die Risikolage ist dokumentiert: 193 offene Issues mit Tool-Bezug im CCR-Repo[^3^]; herausragend #1378, wo DeepSeek V4 im Thinking-Modus mit Tool-Calls „effectively always" mit einem `reasoning_content`-400 bricht und die Transformer-Hooks auf diesem Pfad nicht feuern[^8^]; das LiteLLM-Pendant #26005 zeigt, dass ein Mid-Session-Modellwechsel Thinking-Signaturen bricht — Modellwahl gehört an den Sessionstart, nie in die Mitte[^9^]. Wer den Nutzen ohne Router will: `CLAUDE_CODE_SUBAGENT_MODEL=haiku` ist die kostenlose Minimalvariante des Rollen-Splittings[^4^]. OpenRouter ist der sauberste Routing-Pfad ohne lokalen Proxy — drei Env-Vars, Provider-Failover unter CC —, aber die offizielle Doku empfiehlt aus Kompatibilitätsgründen, bei Anthropic-Modellen zu bleiben[^4^].

**Bedeutung für die Entscheidung:** Die Tabelle ordnet die Schicht nach Hebeltyp, und genau das ist der Entscheidungskern: Cache-Hygiene wirkt auf die Rechnung ohne jedes Qualitätsrisiko, Routing wirkt auf den Preis pro Token mit erheblichem Qualitätsrisiko außerhalb der Anthropic-1P-Linie, und Prefix-Patches wirken auf die Fenstergröße mit Wartungsfolgekosten. Wer nur eine Maßnahme aus dieser Schicht umsetzt, wählt die Cache-Ebene.

### 13.3 Systemprompt-Patches und Caching-Illusionen: Das tweakcc-Urteil

tweakcc kann den gecachten Prefix real um mehrere tausend Tokens schrumpfen — Toolsets entfernen ungenutzte Builtin-Tools komplett aus dem Systemprompt[^5^]. Doch der Nutzen ist durch den 0,1×-Cache-Preis gedämpft: Die volle Wirkung entsteht nur beim ersten Turn und bei jedem Cache-Bust. Dem steht ein dokumentierter Bruchzyklus gegenüber: Patches schlagen nach CC-Updates fehl (#861 auf 2.1.202, #942 auf 2.1.227), im schlimmsten Fall ist Claude nach einem Prompt-Edit unbenutzbar (#872), und `adhoc-patch` kann Skripte von HTTP-URLs mit Nutzerrechten ausführen — eine Supply-Chain-Fläche[^5^][^6^]. tweakcc ist damit **kein Primärhebel** der Token-Optimierung; wer patcht, versioniert Prompt-Diffs in Git und testet nach jedem Re-Patch. Bleibende Werte hat dagegen das Schwesterprojekt claude-code-system-prompts: 515 Systemprompt-Teile mit Token-Counts über 255 CC-Versionen — die Datenbasis für Prefix-Budgeting, Cache-Audits und jede Patch-Entscheidung[^10^].

Zwei weitere Kandidaten sind klar einzuordnen. **Semantisches Antwort-Caching ist für Claude Code unrealistisch:** Sessions sind stateful mit strikt wachsendem Prefix — identische oder ähnliche Gesamt-Requests wiederholen sich praktisch nie; Embedding-Caches wie LiteLLM redis-/valkey-semantic oder GPTCache sind für stateless Q&A gebaut und liefern hier ~0 Treffer bei realem Staleness-Risiko (Code-Antworten von gestern sind falsch)[^11^]. **Realistisch ist dagegen Datei-IO-Caching:** semantic-cache-mcp ersetzt Re-Reads unveränderter Dateien per mtime-/BLAKE3-Match durch ~5-Token-Stubs und liefert Diffs statt Volltext — konzeptuell der stärkste direkte Token-Hebel dieser Repo-Gruppe, weil Tool-Outputs der größte wachsende Kontextteil sind[^7^]. Wegen Einzelautor-Status, eigenem Benchmark und dem tiefen Eingriff (native Read/Edit/Write müssen geblockt werden) gilt: als Pilot projekt-lokal testen, nicht blind in den Standard-Stack[^7^].

**Bedeutung für die Entscheidung:** Priorisieren Sie diese Schicht als Bottom-up-Stack: Env-Hygiene (alle) → cache-fix (Resume-/Quota-Nutzer) → Routing mit konservativem Rollen-Mapping (Budget-Getriebene) → tweakcc-Toolsets und Datei-IO-Cache als kontrollierte Optionen. Explizit ausgeschlossen: semantische Antwort-Caches, Mid-Session-Kompression auf bezahlten Anthropic-Calls und Free-Model-Rotation im Hauptdialog.

### Quellen dieses Kapitels

[^1^]: cnighswonger/claude-code-cache-fix — README v4.0.0 (3 Resume-Bugs, 95,5 %/82,3 % A/B, 94,66 %/92,44 % Dogfood, $0,50/h→$5–10/h, Forward-/Reverse-Modus, CC≥2.1.196-Einschränkung, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` ~1.800 Tokens, Env-Empfehlungen) — https://github.com/cnighswonger/claude-code-cache-fix, 2026-08
[^2^]: musistudio/claude-code-router — README (v3, Gateway :3456/:3458, Router-Rollen default/background/think/longContext, Provider-Liste) — https://github.com/musistudio/claude-code-router, 2026-08
[^3^]: claude-code-router Issue-Suche „tool" (193 offene Issues mit Tool-Bezug, API 2026-08-13) — https://github.com/musistudio/claude-code-router/issues, 2026-08-13
[^4^]: OpenRouter Docs + Blog — Claude Code Integration (3 Env-Vars, AUTH_TOKEN explizit leer, Modell-Slot-Env-Vars inkl. `CLAUDE_CODE_SUBAGENT_MODEL`, Anthropic Skin, Empfehlung Anthropic-1P) — https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration, 2026
[^5^]: Piebald-AI/tweakcc — README v4.0.0 (cli.js-/Bun-Patching, Toolsets „several thousand tokens", `adhoc-patch`/Remote-Config-Fläche, verifiziert bis CC 2.1.162) — https://github.com/Piebald-AI/tweakcc, 2026-08
[^6^]: tweakcc offene Issues (GitHub API, 2026-08-13): #872 (CC unbenutzbar nach Prompt-Edit), #861 (Patches schlagen auf 2.1.202 fehl), #942 (Patterns auf 2.1.227 nicht gefunden) — https://github.com/Piebald-AI/tweakcc/issues, 2026-08-13
[^7^]: CoderDayton/semantic-cache-mcp — README (smart_read/batch_read; mtime/BLAKE3/Diff-Mechanik; 98,9 % Bench auf 41 Dateien; `permissions.deny: Read,Edit,Write`) — https://github.com/CoderDayton/semantic-cache-mcp, 2026-08
[^8^]: claude-code-router Issue #1378 — DeepSeek V4 Thinking + Tool-Calls: `reasoning_content`-400; Transformer-Hooks feuern nicht auf /v1/messages-Pfad — https://github.com/musistudio/claude-code-router/issues/1378, 2026
[^9^]: LiteLLM Issue #26005 — complexity_router: Thinking-Signature-400 nach Mid-Session-Wechsel GLM→Anthropic — https://github.com/BerriAI/litellm/issues/26005, 2026
[^10^]: Piebald-AI/claude-code-system-prompts — 515 Prompts mit Token-Counts, Changelog 255 Versionen seit 2.0.14 — https://github.com/Piebald-AI/claude-code-system-prompts, 2026-08
[^11^]: LiteLLM Caching-Doku + GPTCache-Metadaten (redis-/valkey-semantic Cache für stateless Q&A; GPTCache stale seit 2025-07) — https://docs.litellm.ai/docs/caching/all_caches, 2026
