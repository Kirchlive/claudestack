# Claude-Code-Token-Stack — Konzept (final, kondensiert)

_Stand: 2026-08-13 · Verdichtung aus OPUS5_MAX_Validation KONZEPT-v4,
Squeez-RTK-Ladder (Messprojekt v1–v5), GPT55SOL_PRO Guard-Suite und der
Zweitvalidierung (zweitvalidierung-update.md). Alle Zahlen sind dort belegt;
Evidenzmarker: [GEMESSEN] eigene Messung · [PROJEKT] Projekt-/Herstellerangabe
· [DOKU] offizielle Doku · [SEKUNDÄR] Sekundärquelle._

---

## 1. Geltung

Dieses Konzept ist die verbindliche Architektur- und Entscheidungsgrundlage des
Pakets. Es ersetzt die vier Eingangsdatensätze nicht, sondern fixiert deren
validierten Konsens. Abweichungen davon sind nur über das Re-Evaluierungs-Gate
(§ 10) möglich.

**Ehrliche Erwartung vorab:** Der Stack ist Hygiene plus Katastrophenschutz,
kein Rabattprogramm. Profil A (kurze Sessions): einstellige Prozentpunkte.
Profil B (lange Sessions): 15–30 % Input-Tokens. Einzige unabhängig belegte
Werkzeug-Einzelgewinne: ponytail −10,3 % (p = 0,004) [PROJEKT] und die
Ladder-Zwischenstufe −27,2 % auf einer engen Klasse [GEMESSEN].

---

## 2. Die drei Gesetze

### Gesetz I — Genau ein mutierender Eigentümer pro Fläche
Passende Hooks laufen parallel; zwei Bash-Rewriter oder zwei Read-Replacer sind
nicht komponierbar. Müssen mehrere interne Regeln sequenziell laufen, registriert
**ein** Dispatcher, der intern deterministisch sequenziert und genau ein
Hook-Resultat erzeugt. Beobachter sind erlaubt, aber budgetiert, nie „kostenlos".

### Gesetz II — Append-only schlägt Prefix-Rewrite
Hooks, Skills, Commands, Agents und Monitore invalidieren den Cache nie.
MCP-Verbindungswechsel, Modellwechsel, CLAUDE.md-Änderungen und
Built-in-Deny-Änderungen tun es. Ein API-Proxy oder Kompressor muss den
Cache-Write-Aufschlag erst **verdienen**, bevor er netto spart — ohne gepaarte
Messung mit Cache-Read-/Creation-Werten ist seine Ersparnis eine Behauptung.
Rechenbeleg (T7): Cache-Hit 92,44 % → 94,66 % senkt die Input-Kosten um
13,7 %; umgekehrt dreht ein gebrochener Cache das Vorzeichen jeder „Ersparnis".

### Gesetz III — Kein Werkzeug ohne gemessene Lieferfähigkeit
Harte Gates: Commit ≤ 60 Tage (oder begründete Ausnahme), dienstlich nutzbare
Lizenz (MIT/Apache/BSD/MPL; **kein** PolyForm, AGPL, ELv2 ohne Prüfung,
lizenzlos), nicht archiviert. Das Lizenz-Gate wird wörtlich angewendet —
die v4-Zählung „249 freigabefähig" enthielt 33 lizenzlose Repos; korrekt
konsolidiert: 373 eindeutige Repos, 216 freigabefähig (U6).

---

## 3. Die vier Mechanismen — Reihenfolge vor jeder Werkzeugwahl

| Rang | Mechanismus | Ceiling | Risiko |
|---|---|---|---|
| 1 | **Vermeiden** (Prefix-Diät, Deny-Regeln, Session-Grenze, /clear) | hoch | minimal |
| 2 | **Verlagern** (Sandbox/External, Subagenten, TASK-STATE-Handoff) | mittel-hoch | niedrig |
| 3 | **Verdichten** (Filter, Kompression, Ladder) | niedrig, workload-abhängig | höchstes (lossy) |
| 4 | **Verbilligen** (Routing, Proxys) | variabel | qualitätskritisch |

**Nicht-Additivität (T5):** Ein Stapel aus 60/30/10 % Einzelersparnis ergibt
korrekt 74,8 %, nicht 100 %. Prozente aus READMEs werden nie summiert — jede
Schicht verkleinert die Basis der nächsten.

---

## 4. Die neun Flächen, nach Hebel sortiert

| # | Fläche | Wie oft abgerechnet | Hebel | Eigentümer im Paket |
|---|---|---|---|---|
| 1 | **Prefix** (CLAUDE.md, Skill-Listing, Plugin-Metadaten, MCP-Schemata) | jede Runde | hoch | Nutzer/Projekt + `prefix-budget.mjs` (Wächter) |
| 2 | Tool-Definitionen | jede Runde | hoch | natives Tool Search (unset auf Direktpfad) |
| 3 | **Sitzungswachstum** (Tail wächst linear → Kosten quadratisch) | jede Runde | hoch | TASK-STATE + Ladder (Stufen 2–3), `session-economy.mjs` |
| 4 | Code-Retrieval | vervielfacht Fläche 5 | mittel-hoch | genau ein Codeindex (codegraph, bedingt) |
| 5 | Bash-/Tool-Ausgaben | einmal geschrieben, dann im Tail | **workload-abhängig, oft null** | genau ein Bash-Owner (`bash-dump-guard`, A/B) |
| 6 | Modell-Ausgabe (Prosa, Scope Creep) | jede Runde im Tail | mittel | Implementation Ladder (ponytail) |
| 7 | Kompaktierungsverlust | — | mittel | native Compaction + compact-plus (Pilot Stufe 2) |
| 8 | Strukturdaten (JSON/YAML-Syntaxkosten) | punktuell | niedrig | toonify-mcp (Pin ≥ 0.8.1, Format-Pilot) |
| 9 | Modellwahl/Routing | jede Runde | hoch, qualitätskritisch | bewusste Entscheidung (Profil C, konditional) |

**Fläche 5 steht in der Mitte, nicht oben** — dreifach belegt: ~63 % Fixture-
Reduktion vs. ~2 % billed vs. Median 0 % über 136 Sessions [PROJEKT]; Ladder
−27,2 % eng vs. −0,3 % gepaart [GEMESSEN]; Tool-Output nur ~20–22 % des
Kontextstroms [PROJEKT]. **Nenner-Warnung (T3):** Auf falscher Basis
überschätzt ein Output-Filter seinen Nutzen um Faktor ~32.

---

## 5. Die Stufen 0–7 des Zielstacks

Reihenfolge nicht verhandelbar: **Prefix → native Deckel → Capability → ein
Bash-Owner → ein Codeindex → Sitzungsgrenze → Verhalten → Messung.** Keine
Stufe beginnt, bevor die vorherige gemessen ist (Rollout-Gates, `planung/ROLLOUT.md`).

### Stufe 0 — Prefix-Diät
- Vermeidbarer Prefix/Session (T1): ~7.586 Tokens (20 Skills × ~100 [SEKUNDÄR]
  + Guidance 3.500 [GEMESSEN: 0/92 Nutzung] + MCP 286 [GEMESSEN] + Git-Instr.
  1.800 [PROJEKT]); mit Memory-MCP-Verzicht (~6.500) → **~14.086 Tokens/Session**.
- Skills/Plugins/Marketplaces auf das Genutzte kürzen; MCP projektlokal in
  `.mcp.json`; ungenutzte Built-ins per `deny` vollständig entfernen;
  injizierte Guidance gegen tatsächliche Nutzung prüfen.
- Wächter: `prefix-budget.mjs` (SessionStart, read-only, inkl. Gesetz-I- und
  Skill-Namenskollisions-Befund). Belastbarer Wert kommt aus `/context`.
- **Katastrophenfall (T2):** Rules-Re-Injektion nach Compact — 93.000 Tokens
  = 46 % eines 200k-Fensters je Compact-Zyklus (Issue #32057). Vermeidung
  schlägt jede Kompression: Root-CLAUDE.md < 200 Zeilen, volatiles in
  pfad-scoped Regeln.

### Stufe 1 — Native Deckel (vor jeder Drittkompression)
| Variable | Wert | Bemerkung |
|---|---|---|
| `MAX_MCP_OUTPUT_TOKENS` | `8000` | nativer Default 25000 |
| `BASH_MAX_OUTPUT_LENGTH` | `24000` | bewusst unter der ~32-KB-Auslagerungsgrenze [GEMESSEN]; Guard koppelt sich daran |
| `TASK_MAX_OUTPUT_LENGTH` | `12000` | Qualität vor Absenkung messen |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `16000` | kann Vollständigkeit kosten — pilotieren |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | `78` | **Caveat:** im settings-env ggf. wirkungslos → Shell-Export-Fallback, Wirkung verifizieren |
| `ENABLE_TOOL_SEARCH` | **unset** | Direktpfad: nativ Default; nie pauschal `false` |

### Stufe 2 — Capability klären, bevor irgendetwas mutiert
- `claude-hook-capability-canary.mjs` prüft live `PreToolUse.updatedInput` und
  `PostToolUse.updatedToolOutput` (honoriert seit 2.1.121 für alle Tools [DOKU]).
- `bash-dump-guard` im Modus `auto` ist **fail-closed für Ersetzung**: ohne
  frischen Canary-Record läuft er im Shadow-Modus weiter (misst, ersetzt
  nichts). Shadow-Falle beachten: ein `auto` ohne Probe sieht aus wie aktiv,
  ist aber wirkungslos. Re-Probe ≤ 30 Tage.

### Stufe 3 — Genau ein Bash-Owner
- Default: **`bash-dump-guard.mjs` v3.1** (Eigenbau, PostToolUse):
  Katastrophenschutz-Ökonomie (T8) — greift ≥ 4.096 B, ersetzt nur bei
  ≥ 512 B **und** ≥ 15 % Ersparnis; Raw-Archiv (0700/0600, 7 Tage/20 MB);
  Exakt-Default für Fehler/Patches/Security/Migrationen/IaC/Krypto;
  Secret-Redaktion dedupliziert (B3); stdin-Limit 8 MiB (B4).
- Ergänzend davor: **`bash-dump-gate.mjs`** (PreToolUse, Vermeidung): blockt
  unbegrenzte Dumps vor der Ausführung, deny mit Ausweg (Issue #24327).
- **Pflicht-A/B** gegen squeez (Turnkey, Apache-2.0) nach v5-Methodik;
  Alternativen tokf/snip; quiet-bash abgestuft (5★/38d). Net-Win-Gegenbeleg
  beachten: 2.001 vs. 1.719 Tokens — Kompression kann teurer sein als das
  Original [GEMESSEN].

### Stufe 4 — Genau ein Codeindex
- **codegraph** (lean, CLI, null Prefix) als bedingter Default ab ~300 Dateien
  / Relationsfragen; serena (Edit-Workflows), codebase-memory-mcp (Polyglot-
  Monorepos), sigmap (CLI-Alternative) nur als gemessene Alternative.
- Regel: Index abfragen **und danach nicht alles lesen** — sonst vernichtet
  die Doppelarbeit den Gewinn. Anti-Pattern „Index + Volllesen".

### Stufe 5 — Sitzungsgrenze (Ladder)
Stufenmodell mit Triggern, Details in `regelwerk/LADDER.md`:
- **Stufe 0:** Filter/Disziplin (Stufe-0/1-Maßnahmen oben).
- **Stufe 1 (60–70 %):** Straffen — TASK-STATE aktualisieren, Exploration
  schließen, keine neuen Themen.
- **Stufe 2 (80–85 %):** Compact + Snapshot — compact-plus (Pilot) oder
  PreCompact-Snapshot (Eigenbau, fail-open).
- **Stufe 3 (> 90 %):** Clear + HANDOFF — TASK-STATE.md ist der Vertrag;
  Cold-Cache-Ökonomie beachten (60k Tokens + 55 min).
- **Fallbacks:** > 25 Tool-Calls ohne Fortschritt → Stufe 2; > 40 → Stufe 3.
- Session-Ökonomie (T6): 100 Turns à 2k Zuwachs — ungebremst 10,1 M
  Prefix-Tokens vs. Cap-40k 3,62 M → **−64 %** durch Sitzungsgrenze/Prefix-Cap.

### Stufe 6 — Verhalten
- **ponytail / Implementation Ladder** in CLAUDE.md: −10,3 % Tokens (p = 0,004),
  ~54 % weniger LOC, 12 Tasks (n = 4-Caveat), Selbstkorrektur 80–94 % [PROJEKT].
- Antwortdisziplin: keine Wiederholung unveränderter Ergebnisse, keine
  Fortschrittsprosa ohne Entscheidungsrelevanz, Edits statt Vollneuschreibung.
- Kürze steht nie über Security, Datenintegrität, Tests, Verification Contract.

### Stufe 7 — Messung (Governance)
- **ccusage** (Kosten/Cache) + **codeburn** (Governance-Loop) als Pflichtbasis.
- Drei Ersparnisbegriffe, nie vermischt: Slice → modellsichtbar → **End-to-End**
  (abgerechnete Tokens über die ganze Aufgabe inkl. Cache-Creation, Zusatzrunden,
  Retries, Recovery). Nur die dritte entscheidet.
- Gepaart, ≥ 3 Replikate je Arm, Streuung ausweisen, Qualitätsgate vor Tokengate,
  Cache-Hit > 90 % als Invariante. Ein Profil gewinnt nur, wenn E2E-Verbrauch
  bei gleicher Qualität fällt (Net-Win-Gate).

---

## 6. Kern-Stack (validierte Scores, Rubrik 1–100)

Rubric: Evidenz 25 · Aktualität 20 · Lizenz 15 · Mechanismus-Fit 20 ·
Konvergenz 10 · Risiko 10. Flags: ★ = GitHub-Stars, d = Tage seit Commit.

| Komponente | Score | Rolle im Stack | Entscheidung |
|---|---|---|---|
| ccusage/ccusage | **93** | Messung (Kosten/Cache) | KERN |
| DietrichGebert/ponytail | **92** | Verhalten (Implementation Ladder) | KERN |
| OthmanAdi/planning-with-files | **87** | Persistenz (TASK-STATE-Fundament) | KERN |
| **bash-dump-guard v3.1 (Eigenbau)** | **83** | Bash-Owner (Stufe 3) | KERN, Pflicht-A/B vs. squeez |
| colbymchenry/codegraph | **83** | Retrieval (Stufe 4) | KERN bedingt (ab ~300 Dateien) |
| aerovato/magic-compact | **82** | Compact-Alternative | KERN bedingt (Profil B) |
| cnighswonger/claude-code-cache-fix | **82** | Cache-Reparatur | konditional (nur bei gemessenem Fehler) |
| getagentseal/codeburn | **81** | Governance-Loop | KERN |
| claudioemmanuel/squeez | **80** | Turnkey-Filter | A/B-Gegenpart Stufe 3 |
| PCIRCLE-AI/toonify-mcp | **78** | Format (Fläche 8) | Format-Pilot, **Pin ≥ 0.8.1** (U1) |
| mksglu/context-mode | **77** | External/Massendaten-Sandbox | KERN bedingt, **ELv2 prüfen** |
| fajarhide/omni | **77** | Cross-Call-Dedup | Dedup-Pilot (einziger Mechanismus) |
| fkiene/llmtrim | **75** | Proxy | nur API-Billing, lange Sessions |
| oraios/serena | **74** | Retrieval Spezial | Edit-Workflows |
| DeusData/codebase-memory-mcp | **74** | Retrieval Spezial | große Polyglot-Monorepos |
| NodeNestor/claude-rolling-context | **73** | Session | Abo-Poweruser; „wash" bei kurzen |
| agiwhitelist/tokdiet | **72** | Proxy | API-Billing only, Security-Audit vorher (U3) |
| mpecan/tokf | **72** | Filter-Alternative | A/B-Reserve |
| edouard-claude/snip | **71** | Filter | testbar (YAML-Regeln) |
| manojmallick/sigmap | **70** | Retrieval CLI | null Prefix, Alternative |
| u-ichi/compact-plus | **68** | **Pilot Ladder-Stufe 2** (State-Preservation) | fehlende Schicht, dokumentierte Hooks |
| yurukusa/cc-safe-setup | **68** | Referenz | Teile-Spender (Guard-Muster) |
| atlassian-labs/mcp-compressor | **67** | MCP-Schemas | konditional (≥ 2 schwere MCPs) |
| yoeld-wix/quiet-bash | **65** | Filter | A/B-Kandidat, kein Favorit (U2: 5★/38d) |
| zdk/lowfat | **64** | Filter | enges Pilot-Gate (36d, 60-Tage-Regel) (U4) |
| NodeNestor/claude-lean-context | **56** | — | Watchlist (1★, Substanz offen) (U7) |

**Paket-Pflichtliste (Profil A):** ccusage + native Limits (Stufe 1) + ponytail
(CLAUDE.md) + bash-dump-guard + read-context-guard + prefix-budget +
session-economy + ladder-ledger + planning-with-files-Konvention.
**Profil B zusätzlich:** magic-compact, cache-fix (bei Fehler), context-mode
(ELv2 geprüft), compact-plus-Pilot, llmtrim/tokdiet nur bei API-Billing.

---

## 7. Ladder-Stufenmodell (Kurzfassung)

Vollständig in `regelwerk/LADDER.md`. Geltungsbereich der einzigen gemessenen
Kompressionsgewinne: **Strukturfragen an Quelltext < 32 KB, gebündelt**
(−27,2 % fresh input, 3 %/7 % Streuung, Qualität unverändert [GEMESSEN v5]).
Außerhalb dieser Klasse: −0,3 % (v4, Rauschen). Aktive Komponente im Paket:
`ladder-ledger.mjs` (Stash-Buch + enger Rung-2-Nudge: nur Quelltext > 4.000
Zeichen, max. 5/Session). Gemessen widerlegt und **nicht** im Stack:
Hook-Gate (+9,6 %, v2), squeez R1 als Standardsicht (stille Kürzung vor der
Antwort), Cross-Call-Dedup (sessionübergreifend, unterschlägt Inhalt).

---

## 8. Absagen (bestätigt, mit Re-Evaluierungs-Triggern)

| Werkzeug | Begründung (Kurz) | Re-Evaluierungs-Trigger |
|---|---|---|
| rtk-ai/rtk | CVE-2026-33068, Issues #1155/#2345/#3152, +7,6 %/+18 % gemessen | Issues geschlossen + unabhängige Neu-Messung |
| JuliusBrussee/caveman | 8,5 % statt 65 %, 12,5 % Fehlentscheidungen | unabhängiger Qualitäts-Benchmark |
| headroomlabs-ai/headroom | Issue #2438: 2–7× Kostensteigerung, Cache-Defeat | #2438 geschlossen + Verifikation Provider-Felder |
| teamchong/pxpipe, diegosouzapw/OmniGlyph | Hex-Recall 0–2/15, stille Konfabulationen | exakter Identifier-Recall auf Produktivmodell |
| ZongqianLi/500xCompressor | 27–38 % Fähigkeitsverlust | — |
| LLMLingua-2-Hooks | Retrieval < 50 % auf Code, Cache-Bruch | deterministischer Coding-Modus |
| Globale Memory-MCPs (Default) | 44–54 Tool-Defs ≈ 4,4–8,6k Tokens/Session | Manifest ≤ ~15 Tools / natives Scoping |
| semtrim | 0★, substanzlos (v4 gestrichen) | — |
| token-optimizer (alexgreensh) | PolyForm-Noncommercial → dienstlich gesperrt (Gesetz III) | Lizenzwechsel |
| ojuschugh1/sqz | Elastic 2.0 + 53d still | Lizenzwechsel + Aktivität |

---

## 9. Teilbereichs-Entscheidungen (validiert)

| Teilbereich | Entscheidung | Nächstsinnvollere Alternative (geprüft) |
|---|---|---|
| Messung | ccusage (93) + codeburn (81) | tokscale/agentsview (Neufunde, unbewertet) |
| Verhalten | ponytail (92) | mini-caveman (nur A/B) |
| Persistenz | planning-with-files (87) | compact-plus (68) für Compact-State |
| Bash-Owner | bash-dump-guard v3.1 (83), A/B vs. squeez (80) | tokf (72), snip (71), omni als Dedup |
| Retrieval | codegraph (83) bedingt | serena (74), codebase-memory-mcp (74), sigmap (70) |
| Session/Compact | magic-compact (82) + native Ladder | compact-plus (68), rolling-context (73) |
| Cache | cache-fix (82) bei Bedarf | — (nativ zuerst) |
| Proxy (nur API-Billing) | llmtrim (75) | tokdiet (72, nach Security-Audit) |
| Format | toonify-mcp (78, Pin ≥ 0.8.1) | nativ; mcp-compressor (67) ab 2 MCPs |
| External/Massendaten | context-mode (77, ELv2 beachten) | — |
| Ladder-Stufe 2 (State) | compact-plus (68) Pilot | PreCompact-Snapshot (Eigenbau, fail-open) |

---

## 10. Konfliktmatrix (Leitfrage und wichtigste Paare)

**Leitfrage jeder Konfliktprüfung:** „Welche Invariante bricht, wenn beide
Komponenten gleichzeitig laufen — und dreht ein gebrochener Cache das
Vorzeichen der Ersparnis?" (Asymmetrie-Regel: ein Cache-Verlust kostet mehr,
als dieselbe Tokenzahl Einsparung bringt.)

| Konfliktpaar | Invariante | Auflösung im Paket |
|---|---|---|
| bash-dump-guard × squeez/snip/tokf/omni/quiet-bash | ein mutierender Bash-Owner | getrennte Profile, gepaarter A/B (Wave 6), nie parallel |
| read-context-guard × context-mode auf Read/Grep | ein Read-Owner | context-mode auf externe Massendaten beschränkt |
| codegraph × serena/codebase-memory-mcp/sigmap | kein zweiter Broad-Retriever | genau ein Owner, Rest = gemessene Alternative |
| llmtrim/tokdiet × Prompt-Cache | Proxy verdient Cache-Write | gepaarte Cache-Messung vor Aktivierung |
| Memory-MCP × Prefix | 44–54 Tool-Defs ≈ 4,4–8,6k/Session | kein globaler Default; TASK-STATE-Datei stattdessen |
| magic-compact/compact-plus × native Compaction | ein History-Owner | compact-plus = Pilot Stufe 2, magic-compact = Profil B, nie beide |
| Beobachter × Prefix | Beobachter sind budgetiert | prefix-budget zählt Injektionen mit |
| toonify-mcp < 0.8.1 × alles | Ersetzung statt Doppelung | Pin ≥ 0.8.1 (U1) |
| Settings-Änderung × Messlauf | Prefix-Stabilität | Profile nur zwischen Sessions wechseln |

## 11. Regelwerk-Zuordnung (R1–R8 → Paket-Artefakte)

| Regel | Artefakt im Paket | Typ |
|---|---|---|
| R1 Prefix-Budget | `hooks/prefix-budget.mjs` (SessionStart, advisory, Kollisionsbefunde) | Wächter |
| R2 Bash-Output-Owner | `hooks/bash-dump-guard.mjs` v3.1 (+ `bash-dump-gate.mjs` davor) | Mutierer (Shadow-gegatet) |
| R3 Read-Slice | `hooks/read-slice-guard.mjs` (intern in read-context-guard) | Regelmodul |
| R4 Reread | `hooks/reread-guard.mjs` (intern; mtime+Hash, Escape-Valve) | Regelmodul |
| R5 Session-Ökonomie | `hooks/session-economy.mjs` (advisory, Checkpoints, Bänder 70/80 %) | Beobachter |
| R6 Owner-Registry | `regelwerk/context-surface-owners.yaml` | Governance |
| R7 MCP-Quarantäne | Konvention: MCP projektlokal, Manifest prüfen, ELv2-Fence | Konvention |
| R8 Beobachter-Regel | Beobachter budgetiert (prefix-budget zählt Injektionen) | Invariante |

## 12. Delta der Zweitvalidierung (was zuletzt kippte)

| Thema | Vorher | Jetzt | Grund |
|---|---|---|---|
| toonify-mcp | konditional/defekt | rehabilitiert, Pin ≥ 0.8.1 | Fix 12.08., 63,8 % gemessen (U1) |
| quiet-bash | Turnkey-Favorit | A/B-Kandidat | 5★/38d, 0 Treffer (U2) |
| tokdiet | Profil-B-Option | API-Billing + Audit-Gate | npm-audit, 56d, Abo-Nutzen 0 (U3) |
| Bash-Owner | Guard Default | Default **+ Pflicht-A/B vs. squeez** | Konvergenz über 4 Datensätze |
| compact-plus | „evaluieren" | Pilot Ladder-Stufe 2 | fehlende State-Schicht |
| Native Deckel | MAX_MCP=15000 | 8000/24000/12000/16000/78 + TOOL_SEARCH unset | v4 [GEMESSEN]/[DOKU] + Korrektur |
| Katalog-Basis | v3 (251) | v4 (376 → 373 konsolidiert, Lizenz wörtlich) | Messfelder + U6 |
| Ladder | Hook-Gate-Ansatz | Ledger-Nudge auf Kommando-Pfad | v2 +9,6 %, v5 −27,2 % |

## 13. Governance und Re-Evaluierung

1. **Messpflicht als Gate:** Keine Stufe ohne Baseline, kein Gewinn ohne
   gepaarte E2E-Messung (≥ 3 Replikate), keine dauerhafte Übernahme ohne
   Net-Win. Stop-Regeln in `planung/ROLLOUT.md`.
2. **Cache-Hit > 90 %** ist Invariante, kein Zielwert.
3. **Realisiert schlägt geschätzt:** ccusage-/codeburn-Werte ersetzen jede
   Modellrechnung, sobald sie existieren.
4. **Re-Evaluierung:** Absagen werden nur über ihre Trigger (§ 8) geöffnet;
   Katalog-Befunde (U1–U9) nur über denselben Messweg, der sie erzeugt hat.
5. **Offen und deklariert:** Keine E2E-Nachmessung des Gesamtstacks existiert
   bislang — sie ist das erste Gate des Rollouts, nicht eine Annahme dieses
   Dokuments. Der ~100-Token/Skill-Wert ist [SEKUNDÄR] und der erste
   Kalibrierungskandidat gegen `/context`.
