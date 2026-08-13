# Token-Optimierung für Claude Code: Die vollständige Repo-Landschaft und der empfohlene Stack (Konzept-Report)

# Kurzfassung
### Kernbotschaften
#### Native Hebel und Cache-Hygiene schlagen jedes Dritt-Tool; der 614-Mio.-Token-Replay misst für rtk+headroom+caveman kombiniert nur 3,7 % der Rechnung[^1^]
#### Das Feld umfasst ~180 Repos; stack-relevant sind davon ~40 — die Star-Rangliste ist durch unabhängige Messungen (JetBrains, THOL, TRON) zu invertieren
#### Der empfohlene Stack folgt der Logik Vermeiden → Verlagern → Verdichten (nur reversibel) → Verbilligen, operationalisiert über ein Regelwerk (bash-dump-guard.mjs + Ladder-Stufen)

## 1. Auftrag, Methode und Evidenz-Standard (~700 Wörter)
### 1.1 Auftrag und Abgrenzung
#### 1.1.1 Ziel: Alle Repos finden, die Token in Claude Code minimieren; daraus den bestmöglichen kombinierten Stack als Konzept (Ist-Stack nicht maßgebend)
#### 1.1.2 Methode: 6 Wide-Research-Facetten (Verifikation der 31 bekannten Repos, Screening von 108 Lesezeichen, 4 Wide-Searches), 8 Deep-Dive-Dimensionen mit README-Volllektüre von ~70 Repos, Cross-Verification mit Konfliktzonen
### 1.2 Evidenz-Standard und Claim-Disziplin
#### 1.2.1 Drei Evidenz-Tiers (unabhängig verifiziert / dokumentierte Eigenbenchmarks / Hersteller-Claim) und die Grundregel: pro Payload ≠ pro Rechnung
#### 1.2.2 Warum virale Defaults kritisch geprüft werden: rtk, caveman, headroom als Fallstudien der Claim-Realitäts-Lücke

## 2. Die Anatomie des Token-Verbrauchs (~1.200 Wörter, 2 Tabellen, 1 Diagramm)
### 2.1 Die fünf Kostenblöcke des Kontextfensters
#### 2.1.1 Systemprompt + Tool-Schemas: 15–35k Tokens Basis-Overhead, bei MCP-lastigen Setups bis 72 % des Fensters vor der ersten Nachricht
#### 2.1.2 File-Reads als größter nativer Strom (~78 % mit Grep/Glob) vs. Bash-Output (~20–22 %) — die 22/78-Strukturanalyse
#### 2.1.3 Transcript-Replay und quadratische Kosten; Prompt-Cache (0,1× Read / 1,25–2× Write) als ökonomischer Dreh- und Angelpunkt
### 2.2 Die vier Spar-Mechanismen und ihre Erfolgskriterien
#### 2.2.1 Vermeiden (Sandbox, Clamps, Guards, Verhalten) — höchster Ceiling, kein Qualitätsrisiko
#### 2.2.2 Verlagern (Spill-Files, FTS5-Index, Retrieve-Marker) — hoher Ceiling, Retrieve-Disziplin nötig
#### 2.2.3 Verdichten (Summaries, LLMLingua, Terse-Styles) — Qualitätsrisiken; nur reversibel vertretbar
#### 2.2.4 Verbilligen (Cache, Routing, Effort) — wirkt auf Rechnung, nicht auf Fenster
### 2.3 Advertised vs. Real: Die Benchmark-Lage
#### 2.3.1 codepointer-Replay (614M Tokens, $926): 3,7 % kombiniert; JetBrains-Serie (rtk +7,6 %, caveman −8,5 %, ponytail −10,3 %); Patterson-Gegenbeleg (1,5 Mrd. Tokens, $3.808) und die Nenner-Frage
#### 2.3.2 Cache-Kohärenz als Erklärung der widersprüchlichen Messwelt; drei Cache-Brecher-Muster

## 3. Die Repo-Landschaft im Überblick (~1.000 Wörter, 2 Tabellen)
### 3.1 Gesamtbild: ~180 Repos, 15 Schichten
#### 3.1.1 Herkunft der Liste: 31 verifizierte Ausgangs-Repos, 108 Lesezeichen, ~70 Neufunde CC-Ökosystem, ~35 allgemeine LLM-Tools; Reife- und Aktivitätsbild
#### 3.1.2 Bereinigung: Umbenennungen (headroomlabs-ai, mohsen1/yek), Doppelgänger (2× squeez, 2× snip, headroom vs. headroom-meter), Obsolete (ccundo, claude-code-costs, claude-code-otel), Nicht-deploybare (500xCompressor, RouteLLM)
### 3.2 Architektur-Generationen und Integrationsmuster
#### 3.2.1 Drei Generationen: deterministische CLI-Filter → transparente Proxys → lokale Kleinmodelle; MCP+Hooks als Standard-Integration, Plugin-Marketplace als neue Distribution
#### 3.2.2 Trends 2026: Reversibilität (CCR-Pattern), Cache-Ehrlichkeit, Facet-Explosionen (Terse-Styles, CLAUDE.md-Audits), Multi-Agent-Pflicht

## 4. Messung und Governance-Basis (~700 Wörter, 1 Tabelle)
### 4.1 Die Messkette
#### 4.1.1 ccusage als historischer Standard; CodeBurn als einziger geschlossener Kreis (optimize→apply→guard→realized-vs-estimated); Live-Sicht (claude-monitor, CodexBar); toktrack gegen die 30-Tage-Löschung
#### 4.1.2 Audit-Werkzeuge für System-Overhead: token-hygiene, markdown-health-check, claude-context-optimizer
### 4.2 Governance-Regeln
#### 4.2.1 Messpflicht vor Optimierung: Baseline, Cache-Hit-Rate >90 % als Kennzahl Nr. 1, realized-vs-estimated-Abgleich; native OTEL nur user-seitig (Otel-Smuggling-Risiko)

## 5. Native Hebel und Konfiguration (~1.200 Wörter, 2 Tabellen)
### 5.1 Kontext-Disziplin
#### 5.1.1 CLAUDE.md-Budget (<200 Zeilen), Compact-Instructions-Block, Mythos vs. Messung; .claude/rules-Re-Injektions-Falle (93k Tokens = 46 % Fenster, Issue #32057)
#### 5.1.2 /clear + HANDOFF.md-Pattern, /compact mit Fokus-Instruktion, /rewind als cache-schonende Zwischenstufe, PreCompact-Snapshot-Hook
### 5.2 Kosten- und Cache-Konfiguration
#### 5.2.1 Env-Hygiene: CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1 (~1.800 Tokens/Call), Modell-Pinning, DISABLE_LEGACY_MODEL_REMAP, MAX_MCP_OUTPUT_TOKENS, cleanupPeriodDays, SUBAGENT_MODEL=haiku
#### 5.2.2 MCP-Diät: Tool Search (−47 %), Schema-Kosten ~1k/Tool, Server-Scoping; Subagenten-Ökonomie (Isolation vs. ~7× Volumen); Effort-Level und opusplan

## 6. Verhaltens- und Output-Stil-Skills (~800 Wörter, 1 Tabelle)
### 6.1 Was wirkt: Verhaltensänderung statt Kompression
#### 6.1.1 ponytail als einziger unabhängig bestätigter Gewinn (−10,3 % Kosten, p=0,004); karpathy-skills als ungemessene Variante
### 6.2 Warnstudien
#### 6.2.1 caveman: 65 % beworben, 8,5 % gemessen, 12,5 % Fehlentscheidungen im Governor-Benchmark; die Terse-Output-Welle (beeline, faa-speak, taxman) als Nische
#### 6.2.2 Governor und valorisa-Skills (rescue-tokens, spec-driven Token-Budgets) als disziplinierte Alternative

## 7. Shell- und Tool-Output-Filter (~1.200 Wörter, 2 Tabellen)
### 7.1 Die rtk-Demontage und ihre Nachfolger
#### 7.1.1 rtk: Werbeclaim 60–90 % vs. JetBrains +7,6 %; strukturelle Deckelung (~3 % des Inputs); offene Security-Issues (#1155, #3152, CVE-2026-33068) → nicht mehr empfohlen
#### 7.1.2 squeez als Primär-Empfehlung (Net-win-Gate, Retrieve, PostToolUse updatedToolOutput auch für Read/Grep/Glob); tokf als cache-deterministische Alternative; sqz (24,7 % ehrlichster Mittelwert, aber Datenverlust-Bug #32)
### 7.2 Ergänzende Guards und Nischen
#### 7.2.1 kuro-lean (Blocking token-hungriger Calls), STK-Read-Clamp (85 % der Oversize-Blöcke aus Read), ppgranger/token-saver (36 Prozessoren, offizielle Marketplace), thlibo-Pattern (PreToolUse+updatedInput) als Architektur-Referenz
#### 7.2.2 Ehrlicher Erwartungswert der Schicht: 0–3 % der Rechnung typisch, 10–15 % in test-/log-lastigen Sessions; Negativ-ROI ohne Gates

## 8. MCP-Sandbox, Tool-Schema-Kompression und Kompressions-Engines (~1.200 Wörter, 2 Tabellen)
### 8.1 Output-Sandboxing
#### 8.1.1 context-mode als Kern-Empfehlung: Sandbox-Execution, FTS5-Index überlebt /compact, 98 % auf Tool-Outputs; Verkettungsregeln
### 8.2 Schema- und Definitionskosten
#### 8.2.1 mcp-compressor (70–97 % Schema-Reduktion), bifrost Code Mode (bis 92,8 % Input↓), Edgee V2 (drei Schichten, ~20–50 %), natives Tool Search als Baseline
### 8.3 Modellbasierte Kompression
#### 8.3.1 Paritok-4B als ernstester Neuling (25→85 %, non-destruktiv; Issues #40/#41 beachten); KRLabsOrg/squeez (arXiv, Self-Host); DietCode (Pre-Launch)
#### 8.3.2 Warum LLMLingua-2 & Co. für Code kontraindiziert sind (strukturierte Daten, Cache-Bruch); entroly, token-savior, ooples/token-optimizer-mcp eingeordnet

## 9. Session-Kompression und Compact-Alternativen (~1.300 Wörter, 2 Tabellen)
### 9.1 Die Cache-Sicherheits-Trennlinie
#### 9.1.1 headroom-Auseinandersetzung: README vs. Issue #2438 (2–7× Kostensteigerung, falsche Telemetrie) — Empfehlung nur nach Fix-Verifikation
#### 9.1.2 Cache-sichere Proxys im Vergleich: llmtrim (Net-win-Gate), tokdiet (−71 % mit Qualitäts-A/B), squeezr (gehärtet nach Incident), densely (sha256-lossless)
### 9.2 Compact-Strategien
#### 9.2.1 magic-compact als beste /compact-Alternative (Per-Turn-Summaries + read_omitted_content); claude-rolling-context (Prefix-Cap, lineare Kosten) für lange Sessions/Max-Plan
#### 9.2.2 Kontext-Überlebens-Bundles (c0ntextKeeper, unforget, cc-parachute) und PreCompact-Snapshot-Pflicht
### 9.3 Nische: optische Kompression
#### 9.3.1 pxpipe und OmniGlyph: 59–70 % Rechnung vs. Exaktheitsrisiko (0/15 Hex-Recall auf Opus) — nur für Verbatim-unkritische Blöcke

## 10. Token-effiziente Formate und Repo-Packaging (~800 Wörter, 1 Tabelle)
### 10.1 Formate
#### 10.1.1 TOON: 42,6 % nur vs. pretty JSON; TRON-Studie (Parse-Kaskaden in Agent-Loops) → Formate nur input-seitig; toonify-mcp als Auto-Filter; PAKT (lossless-first, ehrliche Grenzen)
### 10.2 Signatur-Karten und Packer-Policy
#### 10.2.1 sigmap always-on vs. repomix --compress für Cold-Start; die Dumper-Falle (50–500k Tokens pro Dump); Policy-Tabelle: nie pro Turn neu packen

## 11. Code-Intelligence und Indizes (~1.000 Wörter, 1 Tabelle)
### 11.1 Evidenz-Lage
#### 11.1.1 Mechanismus reproduzierbar (−55 % Tool-Calls), Dollar-Effekt nicht (THOL 9/12, +6,8 % Kosten, enge Fragen 20–43 % teurer); Anthropic-Position (agentic search > RAG)
### 11.2 Einsatzmatrix
#### 11.2.1 serena (Edit/Refactor), codegraph (Exploration großer Repos), code-review-graph (PR-Gates), graphify (Docs+SQL-KG), claude-context (nur mit Infra-Budget), codebase-memory-mcp (Staleness-Warnung #1296/#1191)
#### 11.2.2 Anti-Kontext-Fresser-Regeln: Manifest-Minimierung, projekt-lokal statt global, Deferred-Loading-Falle, ein Navigator pro Session

## 12. Memory und Persistenz (~900 Wörter, 1 Tabelle)
### 12.1 Die Token-Kosten-Wahrheit der Memory-Systeme
#### 12.1.1 claude-mem (Standard; Issue #3480), MemPalace (44 MCP-Tools = 4,4–8,6k/Session; nur Subagent-scoped), agentmemory (54 Tools), auto-memory (0 Main-Session-Kosten)
### 12.2 Dateibasierte Persistenz als Fundament
#### 12.2.1 planning-with-files/HANDOFF.md schlägt Memory-Server für statische Fakten; Memory lohnt erst ab ~4 Wochen Historie für episodisches Wissen

## 13. Routing, Cache-Ebene und Systemprompt (~1.000 Wörter, 1 Tabelle)
### 13.1 Cache-Hygiene operationalisiert
#### 13.1.1 cache-fix für --resume-/Lang-Session-Nutzer (95,5 vs. 82,3 % Hit-Rate A/B); Env-Hygiene für alle; Forward-Proxy-Modus ab CC ≥2.1.196
### 13.2 Routing
#### 13.2.1 claude-code-router: qualitätssichere Konfiguration (main+think stark, background billig, native Anthropic-Endpoints); Risiken (193 offene Tool-Issues, LiteLLM-Thinking-Signaturen); Minimalvariante SUBAGENT_MODEL
### 13.3 Systemprompt-Ebene
#### 13.3.1 tweakcc-Urteil (gedämpfter Nutzen, Bruchzyklus, Supply-Chain-Fläche); claude-code-system-prompts als Datenbasis; semantisches Antwort-Caching für CC unrealistisch

## 14. Der empfohlene Stack: Kern-Stack und drei Profil-Varianten (~1.500 Wörter, 3 Tabellen)
### 14.1 Architektur des Gesamt-Stacks
#### 14.1.1 Verkettung: Messung → Env/Native → Verhalten → Filter → Sandbox/Schema → Session → Formate → situativ Indizes/Memory → Cache → optional Routing; Konflikt-Matrix (was sich beißt)
### 14.2 Kern-Stack (für alle)
#### 14.2.1 Konkrete Installations- und Konfigurationsliste mit Begründung je Komponente und Erwartungswert
### 14.3 Profil-Varianten
#### 14.3.1 Profil A (kurze Sessions/Klein-Projekte): native Disziplin genügt; was wegzulassen ist
#### 14.3.2 Profil B (lange Sessions/Power-User): Filter+Sandbox+magic-compact+cache-sicherer Proxy+rolling-context; 15–30 % ehrlicher Erwartungswert
#### 14.3.3 Profil C (Multi-Provider/Budget): Routing-Schicht; Token-Hebel wird Kosten-Hebel
### 14.4 Was bewusst NICHT im Stack ist
#### 14.4.1 rtk, caveman, headroom (bis Fix), PNG-Encoding, LLMLingua-2-Hooks, globale Memory-MCPs — jeweils mit Begründung und Re-Evaluierungs-Triggern

## 15. Das Regelwerk: bash-dump-guard.mjs, Ladder und Konfigurations-Vorlagen (~1.800 Wörter, 2 Tabellen, Code-Blöcke)
### 15.1 Design-Prinzipien für Guards
#### 15.1.1 Output-seitig statt command-seitig (Compound-Lücke), fail-open, niemals permissionDecision:"allow" (rtk #260), State pro Session, Deny-Respekt
### 15.2 bash-dump-guard.mjs — Referenz-Design
#### 15.2.1 PreToolUse-Loop-Guard (Fingerprint sha1(tool+args), N-mal-Block) und PostToolUse-Spill (>2k Tokens → Spill-Datei + Preview + Retrieve-Pfad), Dedup-Guard; Kernlogik als JS-Fragmente; Registrierungs-JSON
### 15.3 Das Ladder-Stufenmodell
#### 15.3.1 Stufe 0 Always-on-Filter; Stufe 1 (60–70 %) Straffen//rewind; Stufe 2 (80–85 %) Compact+PreCompact-Snapshot; Stufe 3 (>90 % oder Cold-Cache ≥60k+55 min) Clear+HANDOFF.md — Trigger, Aktionen, Tool-Zuordnung je Stufe
### 15.4 Konfigurations-Vorlagen
#### 15.4.1 settings.json-/permissions-Vorlage (deny-Liste, MAX_MCP_OUTPUT_TOKENS, Hook-Registrierung, OTEL nur user-seitig); CLAUDE.md-Template mit Compact-Instructions-Block; Messkette in 5 Schritten

## 16. Umsetzungs-Roadmap, Messprotokoll und Fazit (~800 Wörter, 1 Tabelle)
### 16.1 30-Tage-Rollout
#### 16.1.1 Woche 1 instrumentieren, Woche 2 Cache/Kontext, Woche 3 Filter/Sandbox, Woche 4 Budgets/Routing — mit Abnahmekriterien je Woche
### 16.2 Messprotokoll und Erwartungswerte
#### 16.2.1 Baseline-Metriken (Kosten/Tag, Cache-Hit-Rate, Kontext-%-Verteilung), Vorher/Nachher-Disziplin, realistische Zielkorridore je Profil
### 16.3 Fazit und Watchlist
#### 16.3.1 Kernaussagen; Watchlist (Paritok-4B, DietCode, modellbasierte Kompression, offizielle Marketplace-Entwicklung)

## Anhang A: Master-Repo-Matrix (kondensierte Volltabelle der ~180 Repos mit Schicht, Zweck, Stars, Reife, Evidenz, Status)
## Anhang B: Bewertungsmethodik und Limitationen (Replay-/Benchmark-Abhängigkeiten, keine eigenen Laufzeitmessungen)

# References
## cc-token_repo_matrix.md
- **Type**: Konsolidierte Repo-Matrix
- **Description**: Master-Matrix aller ~180 Repos über 15 Schichten
- **Path**: /mnt/agents/output/research/cc-token_repo_matrix.md
## cc-token_wide01–06.md, cc-token_dim01–08.md
- **Type**: Research-Reports
- **Description**: 6 Wide-Exploration- und 8 Deep-Dive-Dimensionsberichte mit Quellenlisten
- **Path**: /mnt/agents/output/research/
## cc-token_cross_verification.md (+_nachtrag.md), cc-token_insight.md
- **Type**: Verifikation & Insights
- **Description**: Confidence-Tiers, Konfliktzonen-Analysen, 8 Cross-Dimension-Insights
- **Path**: /mnt/agents/output/research/
