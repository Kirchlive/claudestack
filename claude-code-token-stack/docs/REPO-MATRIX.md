---
id: CTS-DOC-MATRIX-001
schema: claudestack.document/v1
document_type: repository_decision_matrix
title: Repository-Matrix
version: 2
status: reviewed_snapshot
language: de
last_reviewed: 2026-08-13
as_of: 2026-08-13
applies_to: claude-code-token-stack/v2
foreign_scores_versioned: true
---

# Repository-Matrix

Kurze Produktionsentscheidung, kein vollständiger Markt-/Lizenzaudit. Upstream-
Status kann sich ändern; vor Pilot Revision, Lizenz, Security und Telemetrie neu
prüfen. Kein Eintrag belegt eine feste Einsparung für diesen Stack.

Entscheidungen und Scores folgen der Zweitvalidierung
`claudestack.second-validation/v1` vom 2026-08-13. Die Score-Spalte ist der
sicherheits- und korrektheitsorientierte Runtime-Score, kein OPUS-
Lieferfähigkeits- oder Meta-Konsensscore. Score `—` bedeutet: dort nicht als
eigener 100-Punkte-Kandidat bewertet. `replace` heißt: nur als vollständiger
Ersatz des bestehenden Surface-Owners testen, nie zusätzlich. **`blocked`** heißt:
durch Lizenz oder Recht gesperrt — anders als `conditional` gibt es **kein**
Aktivierungsgate, das die Sperre aufheben könnte; erst eine geänderte Rechtslage
macht die Zeile wieder verhandelbar.
Spalte `Entscheidung` ist konservative lokale Runtimepolitik, kein
Modellkonsens.

**Neu in v2 (ADR-017):** Die Fremdbewertungen von OPUS5 und K3SWARM stehen nicht
mehr nur als Prosa in einem Reconciliation-Artefakt, sondern **je Zeile und mit
Stand** in Tabelle 2. Ohne Standangabe ist ein Dissens nicht von einem
Zitierfehler zu unterscheiden — der dokumentierte Toonify-Dissens wurde gegen
OPUS **v4 (85)** geführt, gültig war zu diesem Zeitpunkt bereits **v5.1 (72)**.

> **Abweichung von C.3.6, offengelegt:** Die Spezifikation verlangt drei
> zusätzliche Spalten *in derselben Tabelle*. Bei elf Spalten wird die
> Entscheidungstabelle unlesbar und damit im Betrieb unbrauchbar. Die
> Fremdwerte stehen deshalb in einer zweiten, über die `CTS-REPO`-ID
> verknüpften Tabelle. Inhaltlich fehlt nichts; je Zeile sind `opus_score`,
> `k3_score` und `dissens` belegt.

---

## Tabelle 1 — Entscheidungsmatrix (operativ)

| ID | Repository/Muster | Score | Surface | Entscheidung | Aktivierungsgate | Konflikt/Grenze |
|---|---|---:|---|---|---|---|
| `CTS-REPO-001` | Claude Code native | 96 | Suche, Read, Session, Usage | `use` | immer | keine unnötige Middleware ergänzen |
| `CTS-REPO-002` | `ccusage/ccusage` | 86 | Beobachtung | `use` | Baseline/Usage-Auswertung | ausschließlich Observer; kein Hook-Mutationsrecht, spart selbst keine Tokens |
| `CTS-REPO-005` | `manojmallick/sigmap` | 85 | Code-Retrieval | `conditional` | exakte Signatur-/Evidence-Map | eigener Retrieval-Owner je Aufgabe; Kontextgröße ist kein Kostenbeleg |
| `CTS-REPO-024` | lokaler Dispatcher dieses Pakets | 84 | Bash-Output/Read | `conditional` | Shadow- und Canary-Gates bestanden | genau ein Bash-Output-Owner; keine parallelen Rewriter |
| `CTS-REPO-003` | `colbymchenry/codegraph` | 80 | Code-Retrieval | `conditional` | Caller-/Impact-/Architekturfragen | ersetzt anderen Index; residenten Kontext messen |
| `CTS-REPO-004` | `DeusData/codebase-memory-mcp` | 76 | Code-Retrieval | `conditional` | riesiges/polyglottes Cross-Service-Repo | ersetzt SigMap/CodeGraph, nicht parallel |
| `CTS-REPO-007` | `OthmanAdi/planning-with-files` | 75 | Task-State | `conditional` | lange Task braucht durable Fortsetzung | Referenzrolle: Task-State-Muster; lokales Template genügt meist; keine Pflichtinstallation |
| `CTS-REPO-027` | `DietrichGebert/ponytail` | 74 | Verhalten/Output | `conditional` | gemessener Qualitäts- oder Kürzungsbedarf | kurze Rule vor dauerhaftem Plugin; Prefix-/Hookkosten messen |
| `CTS-REPO-028` | `getagentseal/codeburn` | 70 | Waste-Diagnose | `conditional` | zunächst read-only, Befunde manuell prüfen | kein `optimize --apply` im Default; Subagent-/Kostenfehler beachten |
| `CTS-REPO-026` | `oraios/serena` | 69 | Code-Retrieval/Refactor | `conditional` | LSP-Edit-/Refactor-Aufgabe | genau ein Retrieval-Owner je Aufgabe |
| `CTS-REPO-006` | `mksglu/context-mode`, nur MCP-Werkzeuge | 66 | externe Massendaten | **`blocked`** | **kein Aktivierungsgate** — die Sperre ist nicht durch einen Anwendungsfall aufhebbar | **ELv2-Lizenzfence: für dienstliche Nutzung gesperrt (L-8)**. Die Fläche bleibt unbesetzt; erst eine geklärte Lizenzlage macht das Werkzeug wieder zum Kandidaten (`conditional`), dann gälte: nur explizite MCP-Nutzung, Hostzugriff bleibt Trust Boundary |
| `CTS-REPO-025` | `mksglu/context-mode`, vollständige Hook-Installation | — | Read/Bash/Hooks | `reject` | — | kollidiert mit lokalem Owner; keine Full-Hook-Installation |
| `CTS-REPO-029` | `ppgranger/token-saver` | 61 | Bash Input/Output | `replace` | isolierter Sole-Owner-Arm nach Permission-Review | kein vollständiges Raw-Archiv; synthetische Zeichenbenchmarks |
| `CTS-REPO-010` | `claudioemmanuel/squeez` | 59 | Bash/Read/Memory | `replace` | nur isolierter, reproduzierbarer Sole-Owner-Arm | Referenzrolle: Planungs-/Recovery-Muster; kein Alternativ-Default; Permission-/Redaction-Grenzen zuerst beheben |
| `CTS-REPO-030` | `mpecan/tokf` | 58 | Bash Input/Output | `replace` | externe Permission-Engine und unmaskierte Exitcodes | Raw-Retention/Größenlimit härten; nie parallel |
| `CTS-REPO-009` | `fajarhide/omni` | 57 | Bash Input/Output | `replace` | Wiederholungsbaseline belegt Ledger-/Dedup-Nutzen | ersetzt Dispatcher auf übernommener Surface; nicht parallel |
| `CTS-REPO-031` | `u-ichi/compact-plus` | 50 | Session/Handoff | `replace` | nur nach Härtung und messbarem Native-Gap | externen Fallback aus, Temp privat, Verlustfälle schließen |
| `CTS-REPO-016` | `cnighswonger/claude-code-cache-fix` | 39 | Cache-Proxy | `reject` | kein Default-Pilot | nur nach separat gemessenem Defekt neu bewerten; exklusives `ANTHROPIC_BASE_URL` |
| `CTS-REPO-008` | `aerovato/magic-compact` | 34 | Session | `reject` | — | kein Claude-Compact-Rewriter; native Grenze + TASK-STATE nutzen |
| `CTS-REPO-011` | `rtk-ai/rtk` | — | Bash-Input | `conditional` | nur neue, isolierte Permission-/Qualitätsprüfung | Referenzrolle: möglicher sole input owner; kein Default |
| `CTS-REPO-012` | Squeez-RTK-Ladder | — | Rollout-/Messmuster | `conditional` | Muster einzeln neu implementiert/getestet | ausschließlich Referenzrolle; Binaries, Pfade, Hooks, Schwellen nicht kopieren |
| `CTS-REPO-013` | `jfrog/boost` | — | Command-Output | `conditional` | Preview-/Telemetriepolitik akzeptiert | nur als Ersatz des Bash-Output-Owners |
| `CTS-REPO-014` | `agiwhitelist/tokdiet` | — | API-History-Proxy | `reject` | nur bei neuer, separater Proxy-Entscheidung neu bewerten | lokales Policy-Veto; K3 hält auditpflichtigen Fallback, OPUS suspendiert; kontrolliert kritischen Traffic |
| `CTS-REPO-015` | `fkiene/llmtrim` | — | API-History-/Output-Proxy | `reject` | nur bei neuer, separater Proxy-Entscheidung neu bewerten | lokales Policy-Veto trotz konditionaler OPUS-/K3-Kandidatur; CA-/Proxy-Risiko; keine Proxy-Chain |
| `CTS-REPO-017` | `zilliztech/memsearch` | — | Langzeit-Memory | `conditional` | Wiederentdeckung messbar teurer | genau ein Memory-System |
| `CTS-REPO-018` | `thedotmack/claude-mem` | — | Auto-Memory | `conditional` | Privacy/Telemetrie/Cloud/Worker geprüft | nicht zweite Wahrheit neben anderem Memory; **Issue #3480 offen** (file-context-Hook reinjiziert bei jedem Tool-Call) |
| `CTS-REPO-019` | `headroomlabs-ai/headroom` | — | Proxy/MCP/Output | `reject` | — | kein Default; Cache-/Toolblock-Risiko |
| `CTS-REPO-020` | TOON-/Formatkonverter | — | strukturierte Daten | `reject` | — | lokale Zeichenquote belegt keine semantische/E2E-Gleichheit |
| `CTS-REPO-032` | `PCIRCLE-AI/toonify-mcp` | — | strukturierte Read-/Tool-Ausgabe | `reject` | Watchlist-Re-Entry nur als isolierter Pilot, exakt `v0.8.2` oder Commit `6df804a`; bestehende Owner vollständig ersetzen | Release/Tag bestätigt; Code-, Issue-, Benchmarkrohwert- und lokaler E2E-Audit offen; kein Default |
| `CTS-REPO-021` | mehrere Retrieval-Indizes | — | Retrieval | `reject` | — | doppelte Discovery/Toolschemas/residenter Kontext |
| `CTS-REPO-022` | mehrere Bash-Mutatoren | — | Bash | `reject` | — | keine deterministische Reducer-Pipeline |
| `CTS-REPO-023` | Proxy-Chain | — | API | `reject` | — | Cache-, Security- und Fehlerattribution kumulieren |

---

## Tabelle 2 — Fremdbewertungen und Dissens (Evidenz)

`gpt56` ist der Runtime-Score aus Tabelle 1. `opus v4` und `opus v5.1` sind
getrennt geführt, weil die Drift zwischen beiden Ständen der eigentliche
Zitierfehler ist. `k3` trägt Stand `2026-08-13`. `n` ist die Zahl der Modelle
mit eigener Punktzahl. Flags aus dem K3-Kern-Katalog: ★ Stars · d Tage seit
letztem Commit · ⚠ Lieferfähigkeits-Flag.

| ID | Repository | gpt56 | opus v4 | opus v5.1 | k3 (2026-08-13) | n | Flags/Lizenz | dissens |
|---|---|---:|---:|---:|---:|---:|---|---|
| `CTS-REPO-001` | Claude Code native | 96 `use` | — | — | — | 1 | — | keiner — nicht fremdbewertet |
| `CTS-REPO-002` | `ccusage/ccusage` | 86 `use` | 100 | 96 | 93 | 3 | 17.890★ · 0d · MIT | **Skala** — alle `use`; Rangplatz 1 bei allen dreien |
| `CTS-REPO-024` | lokaler Dispatcher | 84 `conditional` | — | — | — | 1 | Eigenbau | keiner — K3 bewertet den *eigenen* Guard mit 83, nicht diesen |
| `CTS-REPO-005` | `manojmallick/sigmap` | 85 `conditional` | 75 | 75 | 70 | 3 | 615★ · 16d · MIT | **SUBSTANZ, invers** — einziger Fall, in dem GPT höher liegt: honoriert archivierte Zenodo-Rohdaten als Evidenz |
| `CTS-REPO-003` | `colbymchenry/codegraph` | 80 `conditional` | 90 | 83 | 83 | 3 | 66.154★ · 5d · MIT | **Stand** — v4→v5.1 −7; nach Angleichung Δ 4, geringste Spanne des Felds |
| `CTS-REPO-004` | `DeusData/codebase-memory-mcp` | 76 `conditional` | 79 | 74 | 74 | 3 | 38.730★ · 1d · MIT | keiner — Δ 5 roh, alle konditional |
| `CTS-REPO-007` | `OthmanAdi/planning-with-files` | 75 `conditional` | 93 | 93 | 87 | 3 | 26.135★ · 4d · MIT | **SUBSTANZ** — GPT: „Template genügt meist"; OPUS Rang 2, K3 Kern. Referenzmuster oder Pflichtinstallation |
| `CTS-REPO-027` | `DietrichGebert/ponytail` | 74 `conditional` | 97 | **90** | 92 | 3 | 101.665★ · 6d · MIT | **Stand** — v4-Wert 97 wird in `plugin-diet.md` noch zitiert (R-9); gültig ist 90. Einziger Tier-1-Beleg (−10,3 %, p=0,004) |
| `CTS-REPO-028` | `getagentseal/codeburn` | 70 `conditional` | 86 | 85 | 81 | 3 | 9.283★ · 1d · MIT | **Skala** — alle konditional, read-only unstrittig |
| `CTS-REPO-026` | `oraios/serena` | 69 `conditional` | 82 | 81 | 74 | 3 | 27.939★ · 1d · MIT | **Skala** |
| `CTS-REPO-006` | `mksglu/context-mode` | 66 `conditional` | 75 | 68 | 77 | 3 | 19.834★ · 1d · **ELv2 Fence** | **Lizenz schlägt Score** — alle drei bewerten ≥ 66, die Fläche bleibt trotzdem unbesetzt (L-8) |
| `CTS-REPO-029` | `ppgranger/token-saver` | 61 `replace` | — | — | — | 1 | — | keiner — nur GPT bewertet |
| `CTS-REPO-010` | `claudioemmanuel/squeez` | 59 `replace` | 87 | 79 | 80 | 3 | 182★ · 1d · Apache-2.0 | **SUBSTANZ, schwerster Fall** — gibt bei Rewrites `permissionDecision: allow` zurück. GPT zieht 12/15 SEC + 8/10 CMP ab; OPUS hat für diesen Sachverhalt **keine Achse** |
| `CTS-REPO-030` | `mpecan/tokf` | 58 `replace` | 71 | 67 | 72 | 3 | 192★ · 5d · MIT | **SUBSTANZ** — externe Permission-Engine, unmaskierte Exitcodes |
| `CTS-REPO-009` | `fajarhide/omni` | 57 `replace` | 83 | 79 | 77 | 3 | 320★ · 0d · Apache-2.0 | **SUBSTANZ** — Prehook auto-allowed Rewrites; 97,3 % der Calls sparen nichts |
| `CTS-REPO-031` | `u-ichi/compact-plus` | 50 `replace` | 54 | **69** | 68 | 3 | ~189★ · ~35d · MIT (nur README) | **Stand, invers** — einziger Aufwärtsdrift v4→v5.1 (+15). Erster Compact kann Manual-State verlieren |
| `CTS-REPO-016` | `cnighswonger/claude-code-cache-fix` | 39 `reject` | 75 | 67 | 82 | 3 | 414★ · 6d · MIT | **SUBSTANZ** — 87 offene Issues je 1.000 Sterne, schlechteste Fehlerbilanz des Felds. OPUS vergibt dafür B=2/20 und landet trotzdem bei 75 |
| `CTS-REPO-008` | `aerovato/magic-compact` | 34 `reject` | 83 | 73 | 82 | 3 | 134★ · 1d · BSD-3 | **SUBSTANZ, größte Rohspanne (49)** — „lossless" widerspricht dem Pruning; kein Claude-Benchmark; Bun und undokumentiertes Transcript-JSONL |
| `CTS-REPO-032` | `PCIRCLE-AI/toonify-mcp` | — `reject` | **85** | **72** | 78 | 2 | 64★ · 1d · MIT | **Stand — der Belegfall für ADR-017.** Der dokumentierte Dissens zitierte v4 (85); gültig war v5.1 (72). K3 liefert als einziges die datierte Rehabilitierung (0.8.0/0.8.1 am 12.08.2026, `updatedToolOutput` statt `additionalContext`, 63,8 % Read-Reduktion) |
| `CTS-REPO-015` | `fkiene/llmtrim` | — `reject` | 83 | 66 | 75 | 2 | 208★ · 1d · MPL-2.0 | **SUBSTANZ** — Proxy-Fläche generell: CA-/Cache-Risiko. K3 Hauptoption, OPUS konditional, lokal Veto |
| `CTS-REPO-014` | `agiwhitelist/tokdiet` | — `reject` | 78 | 61 | 72 | 2 | 53★ · **56d ⚠** · MIT | **SUBSTANZ** — Release auf zwei Monate altem Stand; K3 auditpflichtiger Fallback, OPUS suspendiert |
| `CTS-REPO-013` | `jfrog/boost` | — `conditional` | 70 | 67 | — | 1 | — | **Abdeckung 65 %** — nur OPUS bewertet; nicht mit vollbelegten Zeilen vergleichbar |
| `CTS-REPO-018` | `thedotmack/claude-mem` | — `conditional` | 82 | **69** | — | 1 | — | **Abdeckung 65 %** + Issue #3480 offen |
| `CTS-REPO-019` | `headroomlabs-ai/headroom` | — `reject` | 68 | 66 | — | 1 | Rename aus `chopratejas/headroom` | **Abdeckung 65 %** |
| `CTS-REPO-011` | `rtk-ai/rtk` | — `conditional` | 57 | 55 | — | 1 | Apache-2.0 | **Faktenfehler im Korpus** — K3 führt die Absage mit `CVE-2026-33068`; die CVE gehört zu `anthropics/claude-code` (GHSA-mmgp-wc2j-qcv7, behoben in 2.1.53). Die Absage trägt weiter über #1155/#3152 (offen) und #3175, **nicht** über die CVE. Auch das Lizenzargument („Lizenz: null") ist überholt |
| `CTS-REPO-017` | `zilliztech/memsearch` | — `conditional` | — | — | — | 0 | — | keiner — ohne Punktzahl geführt |
| `CTS-REPO-012` | Squeez-RTK-Ladder | — `conditional` | — | — | — | 0 | Referenz | gemessen: Gate **+9,6 %**, Filter **−0,3 %** bei 27–36 % Streuung → beide verworfen (L-9) |
| `CTS-REPO-020` … `-023`, `-025` | Musterabsagen (Formatkonverter, Mehrfachindizes, Mehrfach-Mutatoren, Proxy-Chain, Full-Hook-Installation) | — `reject` | — | — | — | 0 | kein Repo | keiner — Konstruktionen, nicht Werkzeuge; gelten unabhängig vom Kandidaten |

### Nicht in dieser Matrix geführt

Von OPUS5 und/oder K3SWARM bewertet, hier ohne eigene `CTS-REPO`-ID, weil sie
keine Fläche dieses Stacks besetzen: `edouard-claude/snip` (86 v4 / 69 v5.1 /
71 K3), `zdk/lowfat` (78/61/64), `yoeld-wix/quiet-bash` (69/61/65, 5★ ⚠, 38d ⚠),
`atlassian-labs/mcp-compressor` (71/58/67), `musistudio/claude-code-router`
(71/58), `alexgreensh/token-optimizer` (65/57, **PolyForm-Fence**),
`junhoyeo/tokscale` (54/58), `aovestdipaperino/tokensave` (54/54),
`kenn-io/agentsview` (54/58), `open-compress/claw-compactor` (nur v5.1: 42,
`STALE>60d`), `JuliusBrussee/caveman` (68/66), `NodeNestor/claude-rolling-context`
(K3 73), `NodeNestor/claude-lean-context` (K3 56, 1★ ⚠, Watchlist),
`yurukusa/cc-safe-setup` (K3 68, 4★ ⚠, Teile-Spender).

**Ohne jede Punktzahl, nur mit Begründung abgesagt:** `teamchong/pxpipe` und
`diegosouzapw/OmniGlyph` (Hex-Recall 0–2/15, stille Konfabulationen),
`ZongqianLi/500xCompressor` (27–38 % Fähigkeitsverlust), `LLMLingua-2-Hooks`
(Retrieval unter 50 % auf Code, Cache-Bruch), globale Memory-MCPs als Default
(44–54 Tool-Defs ≈ 4,4–8,6k Token je Session), `jaredboynton/semtrim`
(0 Sterne), `ojuschugh1/sqz` (ELv2 plus 53 Tage still).

> **Eine Nichtaufnahme ist keine schlechte Bewertung, sondern gar keine.**
> Rechnerisch lässt sich das nicht heilen. Von 40 bewerteten Werkzeugen sehen
> alle drei Modelle nur 15.

---

## CTS-MATRIX-DISSENS-001 — Wie `dissens` zu lesen ist

| Wert | Bedeutung | Konsequenz |
|---|---|---|
| `keiner` | Urteile decken sich, oder nur ein Modell hat bewertet | keine |
| **Skala** | Punktabstand ohne Entscheidungsunterschied — Gewichtungsartefakt | keine; nach Konsensgewichtung schrumpft der Abstand |
| **Stand** | Der Abstand entsteht durch verschiedene Versionsstände desselben Modells | Wert mit Stand zitieren, nie ohne (ADR-017) |
| **SUBSTANZ** | GPT hat einen Korrektheits- oder Permission-Befund, für den die anderen Rubriken **keine Achse führen** | Sicherheitsveto schlägt Mittelwert (ADR-013). `replace`/`reject` bleibt |
| **Abdeckung** | Weniger als drei Modelle haben bewertet | nicht mit vollbelegten Zeilen vergleichen |

Der Befund dahinter, aus der Meta-Validierung: GPT56 bewertet Korrektheit und
Sicherheit mit **30 von 100 Punkten**, K3SWARM mit 10, OPUS5 mit **null**. Wo
GPT einen Korrektheitsmangel findet, existiert in OPUS' Formel kein Ort, an dem
er ankommen könnte. Rund die Hälfte des mittleren Abstands von 16,8 Punkten ist
Gewichtungsartefakt und lässt sich angleichen; die andere Hälfte ist echter
Dissens und bleibt stehen. **Beide Seiten rechnen in ihrer Rubrik richtig — nur
eine der Rubriken stellt die Frage, die auf der Bash-Fläche zählt.**

## CTS-MATRIX-SELECT-001 — Auswahlregel

1. Problem aus Baseline benennen.
2. Surface und bestehenden Owner bestimmen.
3. Native Lösung prüfen.
4. Lieferfähigkeit und Runtime-Korrektheit getrennt prüfen. GitHub-Metadaten
   dürfen Korrektheit nicht imputieren; PR-Rückstau ist kein Korrektheitsproxy.
5. Einen Kandidaten mit Revision/Lizenz/Security auditieren. `replace`/`reject`
   wird nie durch hohen Lieferfähigkeits- oder Konsensscore aufgehoben.
6. Konfliktkandidat erst nach Defektbehebung als isoliertes gepaartes A/B testen.
7. Bestehenden Owner im isolierten Arm ersetzen, nicht ergänzen.
8. Shadow/Canary/Enforce-Gates anwenden.
9. Gewinner dokumentieren; Verlierer samt Hooks, State und Env entfernen.

## CTS-MATRIX-KATALOG-001 — Konsolidierungsregeln des Vollinventars

Übernommen aus `katalog/HINWEIS.md` (K3SWARM, Unstimmigkeit U6, verbindlich).
Sie gelten für jede Weiterverarbeitung des v4-Katalogs — das Vollinventar liegt
außerhalb dieses Pakets und ist Single Source of Truth für den Suchraum.

1. **376 Einträge → 373 eindeutige Repos.** Drei Redirect-Dubletten entfernen;
   Renames über 301-Redirects auflösen, nie beide Namen zählen. Verifizierte
   Renames: `NodeNestor/nestor-lean` → `claude-lean-context`, `bodo-run/yek` →
   `mohsen1/yek`, `chopratejas/headroom` → `headroomlabs-ai/headroom`.
2. **Lizenz-Gate wörtlich anwenden.** Die v4-Zählung „249 freigabefähig"
   enthält 33 lizenzlose Repos — wörtlich angewendet sind es **216**.
   PolyForm/AGPL/ELv2/lizenzlos ist Fence bzw. Sperre, nicht „freigabefähig mit
   Hinweis".
3. **Off-by-one-Cluster:** die v4-Zählungen 135/136, 196/197, 60/61, 22/23,
   255/256 sind bestätigt inkonsistent. Zählungen immer programmatisch aus dem
   JSON neu aggregieren, **nie Tabellenwerte erben**.
4. **U7:** `NodeNestor/claude-lean-context` trägt im v4-MD-Katalog noch das
   v3-Urteil „sehr starke Alternative"; es gilt das Watchlist-Urteil.
5. **Neufunde ohne Bewertung** (`tokscale`, `agentsview`, `SocratiCode`) sind
   real, aber ohne 1–100-Score — nicht still in den Kern übernehmen.

Regel 3 ist dieselbe Lehre wie D8 im Defektregister: **eine Bilanzzeile, die
nicht aus den Daten neu gerechnet wird, driftet von ihnen weg.**

## CTS-MATRIX-EVIDENCE-001 — Evidenzgrenze

Matrix basiert auf `evidence/gpt56/04-second-validation-100point.md`, ergänzt
durch `evidence/gpt56/06-incoming-reconciliation.md`, und dem konsolidierten
Review-Snapshot vom 2026-08-13. Genannte Upstream-Benchmarks besitzen
unterschiedliche Nenner und gelten nicht als lokale Produktionsmessung.
Aktuelle GitHub-Metadaten sind bewusst nicht Teil des stabilen Betriebsvertrags.
Die Toonify-Version wurde separat über die offizielle GitHub-Release-/Tagquelle
geprüft; diese Versionsbestätigung ist kein Funktions- oder Einsparungsnachweis.

**Die K3-Spalte ist teilweise derivativ.** K3SWARM erklärt selbst, dass die
Issue-Tiefenprüfung am GitHub-Rate-Limit gescheitert ist und sich die übrigen
Befunde auf fremde Issue-Recherche und OPUS-v4-Messfelder desselben Tages
stützen. Die hohe Rangkorrelation zwischen OPUS und K3 (ρ = 0,77) ist daher zum
Teil gemeinsame Datenbasis, nicht gemeinsames Urteil — nach Angleichung sinkt
sie auf 0,70. **Zwei Datensätze, die dieselben Messfelder verwenden, bestätigen
einander nicht.**
