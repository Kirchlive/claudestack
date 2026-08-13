# Cross-Verification: Claude-Code-Token-Minimierung
Stand: 2026-08-13 · Vergleicht alle Wide-Reports (01–06) · Zitate verweisen auf die Quellenlisten der Wide-Dateien.

## Confidence-Tiers (Kernaussagen)

### High Confidence (≥2 unabhängige Quellen, konsistent)
1. **Native Hebel + Cache-Hygiene dominieren alle Dritt-Tools.** codepointer-Replay (614M Tokens/$926): rtk+headroom+caveman kombiniert nur **3,7 %** der Rechnung (2,8/0,5/0,4 %). Deckt sich mit JetBrains-Serie und der 22/78-Strukturanalyse (rtk erreicht nur ~22 % des Token-Stroms, 78 % laufen über native Read/Grep/Glob). [wide01][wide06]
2. **rtk-Werbeclaim widerlegt:** beworben 60–90 %, JetBrains (86 gepaarte Tasks): **+7,6 % teurer** bei low effort, ±0 bei high effort; theoretischer Deckel ≈3 % des Inputs. rtk-README räumt selbst ein „not the same as cutting your bill". [wide01][wide06]
3. **caveman-Werbeclaim widerlegt:** beworben 65 %, JetBrains: **8,5 %** reale Output-Ersparnis; Governor-Benchmark: 12,5 % falsche Entscheidungen (VCLR 0,14). [wide01][wide06]
4. **ponytail bestätigt:** JetBrains −10,3 % Kosten (p=0,004), −15 % Code, keine Qualitätsdifferenz — einziger statistisch solider Skill-Gewinn. [wide01]
5. **Prompt-Cache ist der größte Input-Kostenhebel:** Cache-Read 0,1×, Write 1,25×/2×; Rechenbeispiel 82 % Ersparnis; Invalidatoren dokumentiert (/model, /effort, MCP-Toggle, /compact, Upgrades). [wide04][wide06]
6. **MCP-Tool-Definitionen sind selbst Kontext-Kosten:** ~1k Tokens/Schema; 7 Server ≈67k Tokens; MemPalace real 4,4–8,6k statt behaupteter ~170; Tool Search (nativ) −47 % in MCP-Setups. [wide05][wide06][wide04]
7. **Umbenennungen/Doppelgänger verifiziert:** chopratejas/headroom→headroomlabs-ai, bodo-run/yek→mohsen1/yek; 2× squeez, 2× snip, headroom ≠ headroom-meter. Alle 31+102 Listeneinträge existieren (keine toten Links). [wide01][wide02]

### Medium Confidence (1 Quelle, dokumentiert/reproduzierbar)
8. context-mode 98 % auf Tool-Outputs (Sandbox+FTS5; Eigenmessung, plausibles Design). [wide01][wide04]
9. Edgee V2 ~50 % Kosten↓ (SWE-bench 6/6, 8/8 — signifikant, aber kleine n). [wide04]
10. cache-fix: 3 dokumentierte CC-Cache-Bugs, bis 20× Kostenexplosion auf --resume; Dogfood 94,66 vs. 92,44 % Hit-Rate. [wide04][wide02]
11. TOON: 42,6 % unter JSON; Halodoc-Produktionsfall 5–15 % Kosten↓. [wide01][wide04]
12. codegraph: 62 % Tokens↓ im sauberen Eigenbenchmark (CLI-Block beide Arme), aber +80 % residenter Kontext. [wide01]
13. claude-mem Footprint ~800–3k Tokens + $5–15/Monat Kompressions-API. [wide05]
14. mcp-compressor: 70–97 % Schema-Reduktion; bifrost Code Mode bis 92,8 % Input↓. [wide04]
15. Patterson-Produktion: RTK+Headroom 1,5 Mrd. Tokens/$3.808 in extrem CLI-lastigem Workflow — Gegenbeleg zu codepointer, aber Workflow-abhängig. [wide06]

### Low Confidence (schwache Belege)
- Entroly ~90 %, jcodemunch 86–99 %, token-reducer 90–98 %, Madhan230205, costwise 50–90 %, diverse 0-Sterne-Claims. [wide03][wide04][wide05]
- Paritok 25→85 % (jung, keine Fremdmessung). [wide03]
- Graphify 71,5× (Hersteller; unabhängige Review ~60 %). [wide03][wide05]
- valorisa $750→$100/Monat (self-reported). [wide06]

## Conflict Zones (analysiert, nicht geglättet)

**CZ-1: „60–95 % Ersparnis" vs. „3,7 % der Rechnung" (Advertised vs. Bill).**
Parteien: Hersteller-READMEs vs. codepointer-Replay vs. Patterson-Produktion vs. JetBrains.
Analyse: **Der Dissens ist der Nenner.** Pro Payload stimmen die hohen Zahlen; auf die Gesamtrechnung bezogen dominieren (a) nicht-komprimierbare Anteile (File-Reads ohne Redundanz, Transcript-Replay, eigene Prompts), (b) Prompt-Cache macht Wiederholversendung bereits billig (0,1×), (c) Sessions werden kompaktiert, bevor Payloads sich „lebenslang" amortisieren. Pattersons Gegenbeleg ($3.808) stammt aus einem extrem CLI-lastigen Workflow mit 96 % Cache-Hit — beide Wahrheiten koexistieren: Spar-Tools wirken dort, wo der Workflow noisy-CLI-lastig ist.
Status: **Aufgelöst** → Stack-Empfehlung muss Erwartungswerte als „pro Payload ≠ pro Rechnung" kommunizieren und Messung (ccusage-Baseline) zur Pflicht machen. [wide01][wide06]

**CZ-2: Code-Indizes — 62–99 % Ersparnis vs. keine E2E-Wirkung vs. Anthropic-Ablehnung.**
Parteien: codegraph/graphify/codebase-memory-mcp-READMEs vs. THOL-Benchmark (codegraph 9./12, keine E2E-Ersparnis) vs. Boris Cherny („agentic search generally works better").
Analyse: Indizes sparen messbar Discovery-Tool-Calls, aber (a) die Antwort-Payloads bleiben resident (codegraph: +80 %), (b) File-Reads sind nur Teil des Bills, (c) Staleness-/Setup-Kosten. Starke Workflow-Abhängigkeit: große fremde Codebase/Mono-Repo/PR-Review → klarer Gewinn; tägliches Editieren bekannter Dateien → nativ ausreichend.
Status: **Aufgelöst als workflow-abhängig** → Empfehlung differenziert nach Workflow-Typ (serena für Edit+Refactor, Graph/Review-Tools für Exploration/Review, kein Always-on). [wide05][wide01]

**CZ-3: Memory — Kompression (claude-mem) vs. Verbatim (MemPalace).**
Parteien: MemPalace AA(K)-Benchmark (Kompression −12,4 Recall-Punkte) vs. claude-mem Progressive-Disclosure-Design.
Analyse: Beide kosten selbst Kontext (claude-mem: laufende API-Kosten + Footprint; MemPalace: 44 MCP-Tool-Defs 4,4–8,6k). Beiden fehlen Integrity-Mechanismen (MagnaCapax-Gist). Pull-vs-Push-Trade-off (MemPalace ohne SessionStart-Hook).
Status: **Aufgelöst als Philosophie-Trade-off** → Empfehlung: claude-mem Default (push, geringer manueller Aufwand), dateibasierte Methode (planning-with-files/HANDOFF.md) als verlustfreie Basis, MemPalace nur mit Tool-Scoping. [wide05][wide02]

**CZ-4: Proxys brechen den Prompt-Cache (können mehr kosten als sparen).**
Parteien: MindStudio-Analyse/Cache-Mechanik vs. squeezr/Paritok/TokenSnap-Claims.
Belege: Cache-Invalidierung frisst Ersparnis (dokumentierter Fall $8,29 vs. $0,33); cache-fix existiert gerade wegen CC-interner Cache-Bugs; squeezr wirbt explizit mit Cache-Sicherheit (ungeprüft).
Status: **Teil-aufgelöst** → Regel: Jeder Proxy-Einsatz muss mit Cache-Hit-Rate-Messung (ccusage/cache-fix-Telemetrie) verifiziert werden; Proxys, die Prefixe pro Turn umschreiben, sind Default-verdächtig. [wide03][wide04][wide06]

**CZ-5: PNG/Pixel-Kontext-Encoding — 59–70 % vs. Exaktheitsrisiko.**
Parteien: pxpipe/OmniGlyph-Claims vs. pxpipe-eigene (!) Limitations-Doku (Hex-Recall 13/15 Fable, **0/15 Opus**, „silent confabulations").
Status: **Aufgelöst** → Nur für Verbatim-unkritische Kontexte (Logs, Doku), nie für IDs/Hashes/Code-Fidelity-kritische Blöcke; Allowlist-Modelle beachten. Als Nische, nicht als Kern. [wide01][wide03]

**CZ-6: LLMLingua-Familie — 20× Kompression vs. Code-Unbrauchbarkeit.**
Parteien: Papers (EMNLP/ACL) vs. unabhängige 2026-Studien (Retrieval <50 % auf strukturierte Daten, −52 pp Klassifikation, Cache-Bruch).
Status: **Aufgelöst** → Für NL-Prosa legitime Technologie, für Code/Tool-Outputs kontraindiziert; kein nativer CC-Pfad → nicht im Kern-Stack. [wide01][wide04]

**CZ-7: „bash-dump-guard" & „Ladder" — kanonische Repos existieren nicht.**
Befund: Keine Repos mit diesen Namen gefunden (nutzerseitige Eigenkreationen aus früherem Kontext). Konzept-Analoga verifiziert: overloop (Truncate-Guard, Spill-File+Preview), Governor (content-aware Filter), compact-middleware (Defaults), Community-Konsens zur gestuften Eskalation (filtern→straffen→compact→clear+Handoff).
Status: **Aufgelöst** → dim08 baut daraus das Referenz-Regelwerk (bash-dump-guard.mjs + Ladder-Stufenmodell). [wide06]

**CZ-8: CLAUDE.md-Mythen vs. Messungen.**
„Claude liest nur erste 200 Zeilen" = falsch (Cap gilt für MEMORY.md); keine Adherence-Differenz 25–500 Zeilen gefunden — Kostenargument bleibt. `.claude/rules/` Re-Injektion pro Tool-Call (93k Tokens = 46 % Fenster, Issue #32057) widerspricht „split your rules"-Rat. `.claudeignore` Bypass-Bug #34833 → permissions.deny als robuste Alternative.
Status: **Aufgelöst** → Konkrete Budget-Regeln im Report. [wide06]

## Nicht verifizierbar / offene Punkte
- codepointer-Substack-Original technisch blockiert (Zahlen über 3 unabhängige Sekundärquellen konsistent → Medium-High).
- cardimvitor/tk: Quell-Repo „Compression" nicht auffindbar (Supply-Chain offen → dim01 prüft).
- squeezr Cache-Sicherheit: Claim, keine Fremdmessung.
- agentmemory-Repo-Identität (dim06 verifiziert).
