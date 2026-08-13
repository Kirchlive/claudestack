---
schema_version: 2
titel: "Zweitvalidierung: Tokenberechnungen, Dateienabgleich, 1–100-Bewertung"
datum: 2026-08-13
basis:
  - vergleich-4wege.md (4-Wege-Abgleich, 5-Punkte)
  - OPUS5_MAX_Validation/repo-catalog-v4.json (tagesaktuelle Messfelder)
  - GPT56SOL_ULTRA_Validation (Synthese + decision.yaml)
  - K3SWARM_MAX_Validation (unsere Validierung)
  - KIMI_AGENT/Claude-Code-Token-Stack-Konzept.md
  - Squeez-RTK-Ladder (Messprojekt v1–v5) + hooks/ + CLAUDE.md + settings.json
einschraenkung: "GitHub-API-Rate-Limit: Issue-Tiefenprüfung je Repo nur stichprobenartig via Web-Suche (toonify-mcp, quiet-bash, tokdiet, compact-plus); übrige Issue-Befunde stützen sich auf KIMIs Issue-Level-Research und OPUS-v4-Messfelder (selber Tag). Betroffene Felder = 'nicht tiefer geprüft (Rate-Limit)'."
bewertungsmodell:
  Evidenz_25: "unabhängige Messung 20–25 · Hersteller-A/B 12–17 · README 8–12 · discovery ≤8"
  Aktualitaet_20: "Commit ≤7d 17–20 · ≤30d 14–16 · ≤60d 10–13 · ≤180d 6–9 · >180d ≤5"
  Lizenz_15: "MIT/Apache/BSD 15 · MPL 12 · ELv2/unbekannt 5–8 · PolyForm/AGPL/lizenzlos 0–3"
  MechanismusFit_20: "Vermeiden/Verlagern+cache-sicher 16–20 · Verdichten reversibel 11–15 · lossy/riskant ≤8"
  Konvergenz_10: "Datensatzübergreifende Empfehlungen (4=10 … 1≈3) — DEPRECATED v3 (META-RUNDE2 §6/3RUNDE R2): Zirkelterm (Korpus zitiert sich selbst als Evidenz); die Scores in §4 sind noch MIT diesem Term gerechnet — bei Neuvergabe entfällt die Achse, Reskalierung auf 90 Punkte-Basis"
  Risiko_10: "Security/Issues/Cache-Risiko/Telemetrie: je Befund −1 bis −4 von 10"
---

# Zweitvalidierung — Update-Markdown (maschinenlesbar)

## 1. Tokenberechnungen (aus vorhandenen Daten, keine Neumessung)

| # | Berechnung | Werte | Ergebnis | Evidenz |
|---|---|---|---|---|
| T1 | Vermeidbarer Prefix/Session (Stufe 0) — **korrigiert v2** | Guidance 3.500 [GEM] + MCP 286 [GEM] + Git-Instr. 1.800 [PRJ] = **~5.586 Tokens/Session**; + Skill-Listing-Deckel: `skillListingBudgetFraction 0.01` × 1M-Fenster = ~10.000 Tokens Budget (**Anteil, keine Stückkosten** — das ursprüngliche Modell „20 Skills × ~100" war die lineare Multiplikation, die dieser Datensatz selbst falsifiziert hat; Erratum nach META-VALIDIERUNG-RUNDE2 §7.3); + Memory-MCP-Verzicht ~6.500 (kond.) | **~5.586 Tokens/Session** messnah (+ bis ~16.000 kond.) | mittel |
| T2 | Rules-Re-Injektion (Katastrophenfall) | Issue #32057: 93.000 Tokens = 46 % eines 200k-Fensters je Compact-Zyklus | Vermeidung > jede Kompression | [PRJ] |
| T3 | Nenner-Überschätzung Output-Filter | Fixture 63 % vs. billed 2 % vs. Median 0 % (136 Sessions) | Faktor **~32×** Überschätzung bei falscher Basis | [PRJ]+[GEM] |
| T4 | Ladder-Geltungsbereich | v5: −27,2 % (Quelltext <32 KB, gebündelt) vs. −0,3 % (gepaart, Serie) | Gewinn existiert, aber nur in enger Klasse | [GEMESSEN] (Squeez-RTK) |
| T5 | Nicht-Additivität | Stapel 60/30/10 %: naiv 100 %, korrekt 74,8 % | Prozente nie summieren | Rechenregel |
| T6 | Session-Kurve (Modell: 100 Turns à 2k Zuwachs) | ungebremst 10,1 M Prefix-Tokens vs. Cap-40k 3,62 M | **−64 %** durch Sitzungsgrenze/Prefix-Cap | Modell auf [PRJ]-Basis |
| T7 | Cache-Hit-Ökonomie (100k Tokens) | Hit 92,44 %→94,66 % (cache-fix): 18.694→16.141 Einheiten | **−13,7 %** Input-Kosten | [PRJ]+Preislogik |
| T8 | Guard-Break-even | greift ≥4.096 B; ersetzt nur bei ≥512 B UND ≥15 % | Katastrophenschutz-Ökonomie, kein %-Hebel | GPT56-Pilotwerte |
| T9 | Ehrliche E2E-Erwartung | Profil A: einstellige %; Profil B: 15–30 % Input; ponytail −10,3 % (p=0,004); Routing C: 30–70 % (Community) | Stack = Hygiene + Katastrophenschutz, nicht Rabattprogramm | Konsens aller 4 Datensätze |

**Kernschluss der Berechnungen:** Die größten belegbaren Hebel liegen in T1/T2/T6/T7 (Vermeiden + Session-Grenze + Cache), nicht in T3/T4 (Filter-Kompression). Das bestätigt die OPUS-v4-Flächenordnung (Prefix > Sitzungswachstum > Bash-Output) rechnerisch.

## 2. Dateienabgleich: Empfehlungs-Matrix (25 Schlüssel-Repos × 4 Datensätze)

Legende: ✅ Kern-Empfehlung · 🔶 konditional/situativ · ⬜ nicht behandelt · ❌ abgelehnt/defekt · Stand Messfelder: v4, 13.08.

| Repo | OPUS_V4 | GPT56 | K3 | KIMI | v4: ★ | v4: Tage seit Commit | Lizenz |
|---|---|---|---|---|---|---|---|
| ccusage/ccusage | ✅ | ✅ | ✅ | ✅ | 17.888 | 0 | MIT |
| getagentseal/codeburn | ✅ | ⬜ | ✅ | ✅ | 9.283 | 1 | MIT |
| DietrichGebert/ponytail | ✅ | 🔶 | ✅ | ✅ | 101.665 | 6 | MIT |
| OthmanAdi/planning-with-files | ✅ | ✅ | ✅ | ✅ | 26.135 | 4 | MIT |
| mksglu/context-mode | ✅ | ✅ | ✅ | ✅ | 19.834 | 1 | ELv2 (Fence) |
| aerovato/magic-compact | ✅ | 🔶 | ✅ | ✅ | 134 | 1 | BSD-3 |
| cnighswonger/claude-code-cache-fix | 🔶 | 🔶 | ✅ | ✅ | 414 | 6 | MIT |
| claudioemmanuel/squeez | ✅ | 🔶 | 🔶 | ✅ | 182 | 1 | Apache-2.0 |
| fajarhide/omni | ✅ | ✅ | ⬜ | ⬜ | 320 | 0 | Apache-2.0 |
| edouard-claude/snip | ✅ | 🔶 | 🔶 | ⬜ | 406 | 9 | MIT |
| zdk/lowfat | 🔶 | 🔶 | ⬜ | ⬜ | 566 | 36 ⚠ | Apache-2.0 |
| mpecan/tokf | ⬜ | 🔶 | 🔶 | 🔶 | 192 | 5 | MIT |
| yoeld-wix/quiet-bash | 🔶 (v3-Favorit) | ⬜ | 🔶 | ⬜ | 5 ⚠ | 38 ⚠ | MIT |
| colbymchenry/codegraph | ✅ | ✅ | ✅ | 🔶 | 66.154 | 5 | MIT |
| oraios/serena | ✅ (neu v4) | 🔶 | 🔶 | 🔶 | 27.939 | 1 | MIT |
| manojmallick/sigmap | 🔶 | 🔶 | 🔶 | ⬜ | 615 | 16 | MIT |
| DeusData/codebase-memory-mcp | ✅ | 🔶 | 🔶 | ⬜ | 38.730 | 1 | MIT |
| atlassian-labs/mcp-compressor | 🔶 | ⬜ | 🔶 | ✅ | 106 | 16 | Apache-2.0 |
| PCIRCLE-AI/toonify-mcp | ✅ | ❌→✅ (Fix 0.8.2) | 🔶 | ✅ | 64 | 1 | MIT |
| fkiene/llmtrim | 🔶 | 🔶 | ✅ | ✅ | 208 | 1 | MPL-2.0 |
| agiwhitelist/tokdiet | 🔶 (entwertet) | 🔶 | ✅ | ✅ | 33→53 ↑ | 56 ⚠ | MIT |
| NodeNestor/claude-rolling-context | ⬜ | ⬜ | 🔶 | ✅ | 27 | 1 | MIT |
| u-ichi/compact-plus | ⬜ | ⬜ | ✅ (Neufund) | ⬜ | ~189 | ~35 | MIT (README) |
| yurukusa/cc-safe-setup | ⬜ | ⬜ | ✅ (Neufund) | ⬜ | 4 ⚠ | 0 | MIT |
| NodeNestor/claude-lean-context | 🔶 Watchlist | ⬜ | ⬜ | ⬜ | 1 ⚠ | n.g. | MIT |

**Konvergenz-Befund:** Volle 4/4-Kernempfehlung nur für **ccusage, ponytail, planning-with-files, context-mode** (+ magic-compact 3,5/4). Die Bash-Owner-Frage ist der größte Streitpunkt (squeez vs. eigener Guard vs. quiet-bash vs. omni — je Datensatz anders).

## 3. Festgestellte Unstimmigkeiten (inkl. Live-Stichproben 13.08.)

| # | Unstimmigkeit | Auflösung |
|---|---|---|
| U1 | **toonify-mcp „defekt" (GPT56) vs. „Kern #5" (KIMI)** | **Beides zeitabhängig richtig.** Der additionalContext-Defekt war real, wurde aber in **0.8.0/0.8.1 (12.08.2026)** gefixt: Hook nutzt jetzt `updatedToolOutput` (ersetzend), Read/Grep/WebFetch-Adapter quellen-/laufzeitverifiziert, **63,8 % reale Token-Reduktion (Read, 500-Zeilen-JSON, cl100k)** gemessen, ReDoS-Fix. → **Rehabilitiert** als Format-Kandidat, mit Versionspin ≥ 0.8.2 (0.8.2 noch am selben Tag erschienen, OPUS5-Fund; **Burst-Warnung**: vier Releases an einem Tag nach drei Monaten Stille — Pin- und Changelog-Pflicht bei Updates). |
| U2 | quiet-bash als „Turnkey-Favorit" (OPUS v3/K3) | Daten widersprechen: **5★, 38 Tage still** (v4), Websuche 0 Treffer. Feldmessung (136 Sessions, ~14 %) bleibt wertvoll, aber Repo-Substanz dünn. → **Abstufung: A/B-Kandidat, kein Favorit.** |
| U3 | tokdiet „entwertet 33★/56d" (OPUS) vs. „K3-Profil-B" | Beides: Repo lebt (mittlerweile ~53★, Launch 06/2026), A/B-Doku stark (66 Tasks, Parität, 2 Modelle, cache-aware, thinking-safe), **aber**: npm-audit-Befunde (vitest critical u. a.), 56 Tage ohne Commit, Abo-Nutzer profitieren nicht (nur API-Billing). → **konditional (API-Billing, Profil B), Security-Audit vor Einsatz.** |
| U4 | lowfat „Pilot" | 36 Tage still → überschreitet fast die 60-Tage-Regel; als Pilot ok, nicht als Kern. |
| U5 | KIMI-Referenzen 156 (JSON) vs. 157 (MD) in GPT56 | Zählerfehler im GPT56-Datensatz (gering). |
| U6 | OPUS v4: 249 „freigabefähig" enthält 33 lizenzlose Repos (Gesetz III wörtlich = 216); Off-by-one-Cluster (135/136, 196/197, 60/61, 22/23, 255/256); 6 Renames behauptet, 4 tabelliert; Dubletten headroom/yek/claude-code-patches | **Bestätigte Inkonsistenzen** in v4 — bei Paket-Generierung konsolidieren (373 eindeutige Repos, Lizenz-Gate wörtlich anwenden). |
| U7 | claude-lean-context trägt im v4-MD-Katalog noch „sehr starke Alternative" (v3), Konzept §8.1 degradiert zur Watchlist (1★) | Watchlist-Urteil gilt; Katalog-Zeile korrigieren. |
| U8 | KIMI-Guard-Skizze nutzt String- statt Objektform → würde von Claude Code ignoriert (GPT56-Befund) | KIMI-Skizze nicht als Code übernehmen (Konzept bleibt Referenz); GPT-Suite ist die einzige valide Implementierung. |
| U9 | Issue-Tiefe je Repo | **nicht tiefer geprüft (Rate-Limit)** außer: headroom (#2438 — Absage bestätigt), claude-mem (#1719/#3480 — optional), CCR (193 Tool-Calling-Issues — konditional), toonify (ReDoS gefixt 0.8.1). **rtk-Korrektur (U9a, nach OPUS5/META):** CVE-2026-33068 gehört zu **anthropics/claude-code** (Workspace-Trust-Bypass, GHSA-mmgp-wc2j-qcv7, gefixt in 2.1.53), **nicht zu rtk** — die ursprüngliche Zuordnung (aus KIMI übernommen) war falsch. rtk-Issuelage (OPUS5, 13.08.): #1155 OPEN, #3152 OPEN (Permission-Rewrite), #3175 OPEN (Kosten); #260/#582/#2345 CLOSED. → Absage bleibt, aber auf dieser Basis, nicht via CVE. |

## 4. 1–100-Bewertung (Rubric: Evidenz 25 / Aktualität 20 / Lizenz 15 / Mechanismus-Fit 20 / Konvergenz 10 / Risiko 10)

### 4.1 Kern-Kandidaten

| Repo | Ev/25 | Akt/20 | Liz/15 | Fit/20 | Kon/10 | Ris/10 | **Score** | Entscheidung |
|---|---|---|---|---|---|---|---|---|
| ccusage/ccusage | 20 | 20 | 15 | 18 | 10 | 10 | **93** | KERN (Messung) |
| DietrichGebert/ponytail | 25 | 17 | 15 | 19 | 8 | 8 | **92** | KERN (Verhalten) |
| OthmanAdi/planning-with-files | 15 | 18 | 15 | 19 | 10 | 10 | **87** | KERN (Persistenz) |
| colbymchenry/codegraph | 18 | 18 | 15 | 15 | 10 | 7 | **83** | KERN bedingt (Retrieval, ab ~300 Dateien/Relationsfragen) |
| aerovato/magic-compact | 15 | 19 | 15 | 16 | 8 | 9 | **82** | KERN bedingt (Profil B) |
| cnighswonger/claude-code-cache-fix | 18 | 17 | 15 | 14 | 10 | 8 | **82** | konditional (Resume/Cache-Fehler) |
| getagentseal/codeburn | 15 | 18 | 15 | 16 | 8 | 9 | **81** | KERN (Governance-Loop) |
| claudioemmanuel/squeez | 15 | 19 | 15 | 14 | 9 | 8 | **80** | Turnkey-Filter, A/B vs. eigenem Guard |
| PCIRCLE-AI/toonify-mcp | 15 | 20 | 15 | 13 | 8 | 7 | **78** | ⬆ rehabilitiert (Fix 0.8.1), Format-Pilot mit Pin ≥ 0.8.2 |
| mksglu/context-mode | 20 | 19 | 5 | 17 | 8 | 8 | **77** | KERN bedingt (External/Massendaten; ELv2 prüfen) |
| fajarhide/omni | 15 | 20 | 15 | 14 | 5 | 8 | **77** | Dedup-Pilot (einziger Cross-Call-Mechanismus) |
| fkiene/llmtrim | 16 | 19 | 12 | 13 | 8 | 7 | **75** | Proxy-Option B (API-Billing, lange Sessions) |
| oraios/serena | 12 | 19 | 15 | 14 | 6 | 8 | **74** | Spezial (Edit-Workflows) |
| DeusData/codebase-memory-mcp | 12 | 19 | 15 | 14 | 7 | 7 | **74** | Spezial (große Polyglot-Monorepos) |
| agiwhitelist/tokdiet | 17 | 12 | 15 | 14 | 8 | 6 | **72** | ⬇ konditional (API-Billing only; npm-audit-Befunde; 56d still) |
| mpecan/tokf | 12 | 18 | 15 | 13 | 6 | 8 | **72** | Filter-Alternative |
| NodeNestor/claude-rolling-context | 14 | 19 | 15 | 12 | 5 | 8 | **73** | Spezial (Abo-Poweruser; ehrlich „wash" bei kurzen) |
| edouard-claude/snip | 12 | 16 | 15 | 12 | 8 | 8 | **71** | testbarer Filter (YAML-Regeln) |
| manojmallick/sigmap | 12 | 14 | 15 | 14 | 7 | 8 | **70** | CLI-Alternative Retrieval (null Prefix) |
| u-ichi/compact-plus | 13 | 13 | 15 | 16 | 3 | 8 | **68** | ⬆ Pilot Ladder-Stufe 2 (State-Preservation; fehlende Schicht) |
| yurukusa/cc-safe-setup | 10 | 20 | 15 | 13 | 3 | 7 | **68** | Referenz/Teile-Spender (Guard-Muster) |
| atlassian-labs/mcp-compressor | 12 | 14 | 15 | 13 | 5 | 8 | **67** | konditional (≥2 schwere MCPs) |
| yoeld-wix/quiet-bash | 16 | 10 | 15 | 13 | 5 | 6 | **65** | ⬇ A/B-Kandidat statt Favorit (5★/38d still) |
| zdk/lowfat | 13 | 11 | 15 | 12 | 5 | 8 | **64** | ⬇ Pilot nur (36d still, nahe 60-Tage-Regel) |
| NodeNestor/claude-lean-context | 8 | 12 | 15 | 12 | 4 | 5 | **56** | Watchlist (1★, Substanz offen) |
| **bash-dump-guard (GPT-Suite, Eigenbau)** | 20 | 18 | 13 | 16 | 8 | 8 | **83** | KERN (eigener Bash-Owner, nach Fix B1–B4) |

### 4.2 Abgesagt (bestätigt, unverändert)

| Repo | Begründung (Kurz) | Re-Evaluierungs-Trigger |
|---|---|---|
| rtk-ai/rtk | **korrigiert v2:** Offene Permission-Rewrite-Issues #1155/#3152, Kostenissue #3175, unabhängige Negativ-Messungen (+7,6 % JetBrains / +18 % Repro) — **nicht** CVE-basiert (CVE-2026-33068 betrifft Claude Code selbst, gefixt in 2.1.53); Lizenz: `null` (issues2). Kein Default; nur alleiniger A/B-Arm | #1155/#3152/#3175 geschlossen + unabhängige Neu-Messung mit Net-Win-Gate |
| JuliusBrussee/caveman | 8,5 % statt 65 %, 12,5 % Fehlentscheidungen | unabhängiger Qualitäts-Benchmark |
| headroomlabs-ai/headroom | Issue #2438: 2–7× Kostensteigerung, Cache-Defeat | #2438 geschlossen + eigene Verifikation Provider-Felder |
| teamchong/pxpipe, diegosouzapw/OmniGlyph | Hex-Recall 0–2/15, stille Konfabulationen | exakter Identifier-Recall auf Produktivmodell |
| ZongqianLi/500xCompressor | 27–38 % Fähigkeitsverlust | — |
| LLMLingua-2-Hooks | Retrieval <50 % auf Code, Cache-Bruch | deterministischer Coding-Modus |
| Globale Memory-MCPs (Default) | 44–54 Tool-Defs = 4,4–8,6k/Session | Manifest ≤~15 Tools/natives Scoping |
| semtrim | 0★, substanzlos (v4 gestrichen) | — |
| token-optimizer (alexgreensh) | PolyForm-Noncommercial → dienstlich gesperrt | Lizenzwechsel |
| ojuschugh1/sqz | Elastic 2.0 + 53d still | Lizenzwechsel + Aktivität |

### 4.3 Teilbereichs-Entscheidungen nach Zweitvalidierung

| Teilbereich | Entscheidung (validiert) | Nächstsinnvollere Alternative (geprüft) |
|---|---|---|
| Messung | ccusage (93) + codeburn (81) | tokscale/agentsview (Neufunde, unbewertet) |
| Verhalten | ponytail (92) | i-have-adhd/mini-caveman (nur A/B) |
| Persistenz | planning-with-files (87) | compact-plus (68) für Compact-State |
| Bash-Owner | eigener Guard (83) A/B gegen squeez (80) | tokf (72), snip (71), omni als Dedup-Erweiterung |
| Retrieval | codegraph (83) bedingt | serena (74) Edit-Fälle, codebase-memory-mcp (74) Monorepo, sigmap (70) CLI |
| Session/Compact | magic-compact (82) + native Ladder | compact-plus (68, State), rolling-context (73, Abo) |
| Cache | cache-fix (82) bei Bedarf | — (nativ zuerst) |
| Proxy (nur API-Billing) | llmtrim (75) | tokdiet (72, nach Security-Audit) |
| Format | toonify-mcp (78, Pin ≥ 0.8.2) | nativ; mcp-compressor (67) ab 2 MCPs |
| External/Massendaten | context-mode (77, ELv2 beachten) | — |
| Ladder-Stufe 2 (State) | **compact-plus (68) neu als Pilot** | PreCompact-Snapshot (Eigenbau, fail-open) |

## 5. Delta zur Erstvalidierung (K3-Merge)

| Änderung | Vorher (K3) | Nachher (Zweitvalidierung) | Grund |
|---|---|---|---|
| toonify-mcp | konditional | rehabilitiert + Pin ≥ 0.8.2 | Fix 0.8.0/0.8.1 (12.08.), 63,8 % gemessen |
| quiet-bash | gleichberechtigter A/B-Kandidat | abgestuft (5★/38d) | v4-Messfelder + 0 Websuche-Treffer |
| tokdiet | Profil-B-Option | API-Billing-only + Security-Audit-Gate | npm-audit-Befunde, 56d still, Abo-Nutzen 0 |
| lowfat | Pilot | enges Pilot-Gate (60-Tage-Regel) | 36d still |
| Bash-Owner | bash-dump-guard (GPT) Default | bleibt Default, aber Pflicht-A/B gegen squeez (Konvergenz 5 Agents) | OPUS v4 + GPT56 konvergent |
| compact-plus | „evaluieren" | Pilot Ladder-Stufe 2 | README-Analyse: dokumentierte Hook-Oberfläche, exakt die fehlende Schicht |
| Katalog-Basis | OPUS v3 (251) | **OPUS v4 (376, konsolidieren: 373 eindeutig, Lizenz-Gate wörtlich)** | v4 Messfelder + U6-Befunde |
| Native Deckel | MAX_MCP=15000 | **OPUS-Werte: 8000/24000/12000/16000/AUTOCOMPACT 78** (+ GPT56: TOOL_SEARCH unset auf Direktpfad) | v4 [DOKU]/[GEMESSEN] + GPT56-Korrektur |
| Scoring | 5-Punkte je Thema | 1–100 je Repo (Rubric §Kopf) | Auftrag |

## 6. Validierungsstatus

| Prüfschritt | Status |
|---|---|
| 4-Wege-Abgleich (32 Themen) | ✅ abgeschlossen (vergleich-4wege.md) |
| Tokenberechnungen T1–T9 | ✅ abgeschlossen (aus Bestandsdaten) |
| Dateienabgleich 25 Repos × 4 Datensätze | ✅ abgeschlossen (v4-Messfelder, programmatisch) |
| 1–100-Bewertung | ✅ abgeschlossen (25 Kern + 10 Absagen + 1 Eigenbau) |
| Issue-/Aktualitäts-Tiefenprüfung | ⚠ teilweise (Rate-Limit): Live-Stichproben toonify/quiet-bash/tokdiet/compact-plus ✅; Rest über v4-Messfelder + KIMI-Issue-Research |
| Nachmessung eigener E2E-Werte | ❌ weiterhin offen (kein Datensatz hat E2E-Messungen; bleibt Gate im Rollout) |
