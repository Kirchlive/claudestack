---
schema_version: 3
titel: "Finaler Abgleich aller Datensätze (Meta-Konsolidierung)"
datum: 2026-08-13
eingaenge:
  - K3SWARM: vergleich-4wege.md (v2 korrigiert), zweitvalidierung-update.md (v2 korrigiert), claude-token-stack-paket/
  - GPT56SOL: 01-crosswalk (Erstrunde A), 03-file-token-metrics, 04-second-validation, 05-final-consolidated
  - OPUS5: UPDATE-PHASE3, scores100.json, issues2.json, repo-catalog-v4.json
  - META-VALIDIERUNG-3WEGE.md v1.2 (Erstrunden-Meta)
  - META-VALIDIERUNG-RUNDE2.md v2.0 (Zweitrunden-Meta inkl. Angleichung A0–A4)
status: "Runde 1+2 abgeglichen; 3 eigene Fehler korrigiert; Endentscheidungen v3"
---

# Finaler Abgleich — Meta-Konsolidierung

## 1. Erstrunden-Meta (3WEGE) — übernommene Befunde

1. **Aggregatkorrekturen:** Mein Dokument B hatte 4 falsche Summen → korrigiert zu **144/130/107/111** (KIMI-Nenner 155). Dokument C (OPUS) hatte Versionsdrift im Aggregat; nur A (GPT56) rechnete sauber — und ist nach RUNDE2-Auflösung eine **Selbstbewertung** (4,88/5).
2. **Belastbare Rangfolge:** nur `{GPT56, OPUS_V4} vor {KIMI, K3SWARM}`. Alles Feinere ist Gitterkomposition (A fragt Entscheidungsdisziplin, B native Fakten, C Evidenz/Konflikte). Korrigierte Normwerte: GPT 90,4 % · OPUS 88,9 % · KIMI 79,0 % · K3 75,8 %.
3. **OPUS5 hat die Datensatz-Rangfolge in Runde 2 selbst eingestellt** (beide Erstrunden-Urteile autornah/unzuverlässig) — schärfste und korrekteste Konsequenz.
4. **Externe Prüfungen:** CVE-2026-33068 = Claude-Code-Workspace-Trust (nicht rtk); `.claude/rules`-Reinjektion real (#32057 „closed as not planned", #27814/#35051/#56867), aber Root-`CLAUDE.md` mit **1.975 Tokens** (reproduziert, beide Modelle exakt) ist der dominante Term → **Byte-Deckel statt Zeilenlimit**.

## 2. K3SWARM-Errata (3 transportierte Fehler, jetzt korrigiert)

| # | Fehler | Korrektur | Stellen |
|---|---|---|---|
| E1 | CVE-2026-33068 fälschlich rtk zugeordnet („Absage bestätigt") | CVE betrifft anthropics/claude-code (gefixt 2.1.53); rtk-Absage ruht auf #1155/#3152 (OPEN, Permission-Rewrite), #3175 (OPEN, Kosten), Negativ-Messungen +7,6 %/+18 %, Lizenz `null` | zweitvalidierung §3 U9a, §4.2; VALIDIERUNG.md |
| E2 | T1 nutzte das lineare Stückkostenmodell („20 × ~100"), das dieser Datensatz selbst falsifiziert hat | T1 = 3.500+286+1.800 = **~5.586** messnah; Skill-Listing als Budgetanteil (0,01 × 1M ≈ 10.000), nicht als Stückkosten | zweitvalidierung T1; VALIDIERUNG.md T1 |
| E3 | Erstrunden-Summen falsch (142/127/109/103) | 144/130/111/107, KIMI-Nenner 155 | vergleich-4wege.md; VALIDIERUNG.md §1 |

Zusätzlich klargestellt: Die `toonify-mcp`-Rehabilitierung (Fix 0.8.1, 12.08.) ist ein **K3SWARM-Befund** — GPT56 hat das Werkzeug in Runde 2 fallengelassen, die Zuschreibung in meiner Matrix war korrekt gemeint (Defekt historisch), wird aber jetzt als alleinige K3SWARM-Entscheidung mit Versionspin ≥ 0.8.2 geführt.

## 3. Zweitrunden-Angleichung (RUNDE2, A0–A4) — Ergebnis

- **Rund die Hälfte des Modellabstands (16,8 → 8,7) ist Gewichtungsartefakt** und wurde angeglichen; die andere Hälfte ist echter Dissens: **GA2 Evidenzmaßstab (18,3 pp)** und **GA3 Korrektheit/Sicherheit (22,9 pp, OPUS5 hat keine Achse)**.
- **Zirkelterm entfernt:** OPUS5 (D20) und K3SWARM (Kon10) bepunkteten „andere Datensätze empfehlen es auch" — GPT56 ist die einzige zirkelfreie Rubrik. Folge für künftige Scores: keine Konvergenz-Achse.
- **Die OPUS5↔K3SWARM-Korrelation (0,77) war teils gemeinsame Datenbasis**, nicht Konsens (sinkt auf 0,70 nach Entzirkelung).
- **Rangtreue je Modell bleibt bei A3 ≥ 0,91** — die Angleichung übersetzt, ohne zu ersetzen.

## 4. Finale konsolidierte Score- und Entscheidungstabelle (v3)

Basis: Konsensscore A4 (RUNDE2 §17) + GA3-Sicherheitsvorbehalt + Erst- und Zweitrunden-Sachbefunde. `n` = Anzahl bewertender Modelle; `Abd.` = real belegter Gewichtsanteil.

> **Entscheidungsregel v3.1 (nach META-3RUNDE §2.2/§2.3):** Der Konsensscore A4 ist **deskriptiv, nicht normativ** — ein Mittelwert über Rubriken ohne Korrektheitsachse beschreibt den Korpus, entscheidet aber nicht. Maßgeblich ist die **Kreuztabelle gemessene Lieferfähigkeit × geprüfte Korrektheit** (OPUS5) mit **Sicherheitsveto vor Mittelwert** (GPT56: `security_veto_over_mean_score: true`). Konsequenz: Genau ein Werkzeug ist unstrittig (`ccusage`). Vier Werkzeuge stehen bei Lieferfähigkeit >75 und gleichzeitig auf reject/replace — für sie ist A/B-Pflicht (nicht Option): **squeez 87/59, omni 83/57, magic-compact 83/34, cache-fix 75/39**.

| Repo | Konsens (A4) | n | Abd. | Entscheidung v3 | Begründung (kurz) |
|---|---:|---:|---:|---|---|
| native-claude-code | 93,3 | 1 | 100 % | **KERN** | Stufen 0/1 zuerst; einzige belastbare Großhebel |
| ccusage/ccusage | 92,5 | 3 | 100 % | **KERN (Messung)** | Top bei allen drei Modellen |
| DietrichGebert/ponytail | 87,1 | 3 | 100 % | **KERN, on demand** | Tier-1-Beleg; Always-on-Dopplung in CLAUDE.md auflösen (§6, W2) |
| OthmanAdi/planning-with-files | 84,7 | 3 | 100 % | **KERN** | Muster, null Tool-Defs |
| bash-dump-guard (Eigenbau, GPT-Basis v3.1) | 84,1 | 1 | 94 % | **KERN Bash-Owner (shadow→canary→replace)** | Einziger Kandidat, der GA3 besteht: nie `allow`, fail-open, getestet |
| colbymchenry/codegraph | 81,9 | 3 | 100 % | **konditional (≥~300 Dateien)** | ehrliche Benchmarks; genau ein Retriever |
| getagentseal/codeburn | 80,5 | 3 | 100 % | **KERN (Governance)** | realized-vs-estimated-Loop |
| PCIRCLE-AI/toonify-mcp | 78,8 | 2 | 94 % | **Pilot, Pin ≥ 0.8.2** | K3SWARM-Rehabilitierung; vorheriger Defekt echt gewesen |
| fkiene/llmtrim | 77,1 | 2 | 94 % | **Proxy-Option B (API-Billing)** | cache-sicher, 112 A/B |
| claudioemmanuel/squeez | 77,0 | 3 | 100 % | **A/B-Kandidat mit GA3-Auflage** | GPT56-Befund: `permissionDecision: allow` bei Rewrites → nur mit gepatchter Permission-Semantik oder im Shadow-Arm; sonst nicht Default |
| edouard-claude/snip | 76,0 | 2 | 94 % | Filter-Alternative (YAML-testbar) | — |
| oraios/serena | 75,8 | 3 | 100 % | Spezial: Edit-Workflows | — |
| manojmallick/sigmap | 75,7 | 3 | 100 % | CLI-Alternative (null Prefix); Zenodo-Rohdaten (GPT56: 85) | einzige archivierte Retrieval-Evidenz |
| DeusData/codebase-memory-mcp | 75,7 | 3 | 100 % | Spezial: große Monorepos (nie parallel zu codegraph) | — |
| fajarhide/omni | 74,8 | 3 | 100 % | Dedup-Pilot (GA3-Auflage wie squeez) | 6.656-Trace-Replay |
| atlassian-labs/mcp-compressor | 71,8 | 2 | 94 % | konditional (≥2 schwere MCPs) | — |
| agiwhitelist/tokdiet | 71,1 | 2 | 94 % | konditional API-Billing + npm-audit-Gate | 56d still |
| mksglu/context-mode | 69,9 | 3 | 100 % | **konditional (External), ELv2-Fence beachten** | Im Ist-Setup bereits aktiv → Lizenzfrage klären |
| mpecan/tokf | 69,7 | 3 | 100 % | Filter-Alternative | — |
| yoeld-wix/quiet-bash | 68,3 | 2 | 94 % | abgestuft (5★/38d) | Feldstudie wertvoll, Repo dünn |
| aerovato/magic-compact | 67,5 | 3 | 100 % | **abgestuft: Pilot mit Qualitäts-Gate** | GPT56-Reject-Befund („lossless" widerspricht Pruning; Bun/Transcript-JSONL undokumentiert) — Qualität vorab messen |
| claude-code-cache-fix | 65,9 | 3 | 100 % | **streng konditional** | schlechteste Fehlerbilanz des Feldes (87 Issues/1k★); nur bei gemessenem Cache-Defekt |
| u-ichi/compact-plus | 61,6 | 3 | 100 % | Pilot Ladder-Stufe 2 | füllt State-Preservation-Lücke |
| rtk-ai/rtk | 66,2 | 1 | 65 % | **kein Default; nur alleiniger A/B-Arm** | E1: keine CVE, aber offene Permission-Issues + Negativ-Messungen + Lizenz null |
| headroomlabs-ai/headroom | 76,2* | 1 | 65 % | **abgesagt (behalten)** | *nur OPUS5-Lieferfähigkeitsrubrik, keine GA3-Achse; #2438 (2–7×) steht |
| JuliusBrussee/caveman | 76,2* | 1 | 65 % | **abgesagt (behalten)** | *gleiche Einschränkung; 8,5 %/12,5 %-Befund steht; im Ist-Setup aktiv → entfernen (§6, W1) |
| claude-mem | 79,0* | 1 | 65 % | optional mit Privacy-Gate | *65 %-Abdeckung; PostHog/Worker-Stack + #1719/#3480; im Ist-Setup aktiv |

## 5. Nicht angeglichen (stehende Dissense)

1. **GA2 Evidenz (18,3 pp):** GPT56 verlangt archivierte Rohläufe/Kontrollarme; OPUS5/K3 kodieren Evidenztier. Keine Angleichung möglich — als dauerhafte Dokumentationspflicht übernommen (Herstellerclaim ≠ Beleg).
2. **GA3 Korrektheit/Permission-Semantik:** verbindliche Achse in allen künftigen Scores (Gewicht ≥ GPT56s 30/100). Auf der Bash-Fläche entscheidet Sicherheit, nicht Aktivität.
3. **Abdeckung:** 15/39 Einheiten von allen dreien bewertet; n=1-Werte sind Einzelurteile.
4. **K3SWARM↔GPT56 Rangfolgen praktisch unabhängig (ρ≈0,27)** — bleibt als ehrlicher Restkonflikt dokumentiert.

## 6. Ist-Zustand-Korrekturen am realen Setup (aus META §8, umzusetzen im Paket/Rollout)

| # | Befund (real verifiziert) | Maßnahme |
|---|---|---|
| W1 | `caveman` aktiv + eigener CLAUDE.md-Abschnitt — widerspricht 4/4-Absagekonsens | entfernen |
| W2 | `ponytail` aktiv + ~40 Zeilen Ladder-Text in Root-CLAUDE.md (doppelt geladen) | Plugin behalten, Text aus Root entfernen |
| W3 | Root-CLAUDE.md instruiert codegraph + context-mode + rtk parallel | genau ein Retriever-Pfad |
| W4 | Root-CLAUDE.md = 1.975 Tokens / 8,4 KB | Byte-Deckel ≤4 KB (nicht Zeilenlimit) |
| W5 | Drei mutierende PreToolUse:Bash-Hooks (tokless/rtk, bash-dump-guard, squeez pre) | ein Owner pro Fläche (Gesetz I) |
| W6 | `bash-dump-guard.mjs` im Ist-Setup auf **PreToolUse** registriert (Spec: PostToolUse) | Rollout-Punkt: Registrierung je Rolle klären (Gate vs. Kompressor — Paket trennt: bash-dump-gate.mjs vs. bash-dump-guard.mjs) |
| W7 | `ENABLE_TOOL_SEARCH` unset | **`true` setzen** (OPUS-Korrektur: tokenminimal; unset=auto=10-%-Schwelle); Randbedingungen: HTTP-MCPs nicht deferiert (#40314), Built-ins seit 2.1.69 deferiert (#31002) |
| W8 | `claude-mem` aktiv (Privacy-Befund) + `context-mode` aktiv (ELv2-Fence) + `skipDangerousModePermissionPrompt: true` + Heimatpfade öffentlich | Privacy-/Lizenz-/Härtungs-Review |
| W9 | Agent-Teams (`EXPERIMENTAL_AGENT_TEAMS=1`, fan-out) aktiv | ×7-Volumenrisiko beachten (KIMI K6) |

## 7. Maschinenlesbarer Endblock

```tsv
entscheidung_v3	repo	konsens_a4	n	abdeckung	ga3_status
KERN	native-claude-code	93.3	1	100%	n/a
KERN	ccusage	92.5	3	100%	ok
KERN	ponytail-on-demand	87.1	3	100%	ok
KERN	planning-with-files	84.7	3	100%	ok
KERN	bash-dump-guard-eigenbau	84.1	1	94%	besteht (nie allow)
KERN	codeburn	80.5	3	100%	ok
KONDITIONAL	codegraph	81.9	3	100%	ok
PILOT	toonify-mcp>=0.8.2	78.8	2	94%	ok (Fix verifiziert)
AB_MIT_AUFLAGE	squeez	77.0	3	100%	FAIL allow-semantik → patch/shadow
AB_MIT_AUFLAGE	omni	74.8	3	100%	FAIL allow-semantik → patch/shadow
KONDITIONAL	llmtrim	77.1	2	94%	ok api-billing
PILOT_MIT_GATE	magic-compact	67.5	3	100%	qualitaetsgate (lossless-behauptung)
STRENG_KONDITIONAL	cache-fix	65.9	3	100%	fehlerbilanz 87/1k★
PILOT	compact-plus	61.6	3	100%	ok
NUR_AB_ARM	rtk	66.2	1	65%	permission-issues offen
ABGESAGT	headroom	-	-	-	#2438
ABGESAGT	caveman	-	-	-	8.5%/12.5% gemessen
ABGESAGT	pxpipe-omniglyph-llmlingua2-500x-semtrim-tokenoptimizer-sqz	-	-	-	verschiedene (Lizenz/Recall/Substanz)
```

```tsv
meta_befund	status
erstrundensummen_k3_korrigiert	done (144/130/111/107)
cve_fehlzuordnung_korrigiert	done (E1)
t1_modell_korrigiert	done (E2)
zirkelterm_entfernt	teilweise — in Rubriktabelle zweitvalidierung-update.md als DEPRECATED markiert; Altscores noch mit Term (3RUNDE R2, offen deklariert)
toonify_pin	>=0.8.2 global gesetzt + Burst-Warnung (3RUNDE R1, done)
guard_identitaetskollision	aufgeklärt: 3 Artefakte — hooks/bash-dump-guard.mjs = Deny-Gate (PreToolUse, korrekt registriert); GPT55SOL_PRO = Outputreducer v3; Paket v3.1 = Outputreducer+Canary. Paket trennt: bash-dump-gate.mjs vs. bash-dump-guard.mjs
v3.1_auslieferung	im Paket /mnt/agents/output/claude-token-stack-paket/hooks/ enthalten; im Git-Repo (noch) nicht — Push = Nutzeraktion (3RUNDE R4)
messwerte_reported_only	bestätigt offen (R5): 318 Tok/1k Z., 86,3 ms, 806 Calls ohne Rohläufe; Funktionstests dagegen real ausgeführt (73/73, 37/38, Exit-Codes in VALIDIERUNG.md §6)
konsensscore_normativ	NEIN — A4 deskriptiv; Entscheidung via Kreuztabelle + security_veto (3RUNDE §2.2/§2.3, übernommen)
katalogstand	v4.2: 371 Einträge / 368 kanonisch distinct (alle drei Modelle konvergieren auf 368 kanonisch)
ga3_pflichtachse	festgelegt (>=30/100)
e2e_baseline	OFFEN — Wave 0 im Paket (einzige verbleibende Wahrheitsquelle, alle drei Modelle gleichlautend)
```
