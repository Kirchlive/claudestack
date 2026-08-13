---
id: CTS-DOC-MATRIX-001
schema: claudestack.document/v1
document_type: repository_decision_matrix
title: Repository-Matrix
version: 1
status: reviewed_snapshot
language: de
last_reviewed: 2026-08-13
as_of: 2026-08-13
applies_to: claude-code-token-stack/v1
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
Ersatz des bestehenden Surface-Owners testen, nie zusätzlich.
Spalte `Entscheidung` ist konservative lokale Runtimepolitik, kein
Modellkonsens. Abweichende OPUS-/K3-Piloturteile für Toonify und Proxy-Tools
bleiben als Risikodissens in `validate/06-incoming-reconciliation.md` erhalten.

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
| `CTS-REPO-006` | `mksglu/context-mode`, nur MCP-Werkzeuge | 66 | externe Massendaten | `conditional` | große externe Web/API/MCP-/Dokument-/Logdaten ableiten | nur explizite MCP-Nutzung; Hostzugriff bleibt Trust Boundary |
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
| `CTS-REPO-018` | `thedotmack/claude-mem` | — | Auto-Memory | `conditional` | Privacy/Telemetrie/Cloud/Worker geprüft | nicht zweite Wahrheit neben anderem Memory |
| `CTS-REPO-019` | `headroomlabs-ai/headroom` | — | Proxy/MCP/Output | `reject` | — | kein Default; Cache-/Toolblock-Risiko |
| `CTS-REPO-020` | TOON-/Formatkonverter | — | strukturierte Daten | `reject` | — | lokale Zeichenquote belegt keine semantische/E2E-Gleichheit |
| `CTS-REPO-032` | `PCIRCLE-AI/toonify-mcp` | — | strukturierte Read-/Tool-Ausgabe | `reject` | Watchlist-Re-Entry nur als isolierter Pilot, exakt `v0.8.2` oder Commit `6df804a`; bestehende Owner vollständig ersetzen | Release/Tag bestätigt; Code-, Issue-, Benchmarkrohwert- und lokaler E2E-Audit offen; kein Default |
| `CTS-REPO-021` | mehrere Retrieval-Indizes | — | Retrieval | `reject` | — | doppelte Discovery/Toolschemas/residenter Kontext |
| `CTS-REPO-022` | mehrere Bash-Mutatoren | — | Bash | `reject` | — | keine deterministische Reducer-Pipeline |
| `CTS-REPO-023` | Proxy-Chain | — | API | `reject` | — | Cache-, Security- und Fehlerattribution kumulieren |

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

## CTS-MATRIX-EVIDENCE-001 — Evidenzgrenze

Matrix basiert auf `validate/04-second-validation-100point.md`, ergänzt durch
`validate/06-incoming-reconciliation.md`, und dem konsolidierten Review-Snapshot
vom 2026-08-13. Genannte Upstream-Benchmarks
besitzen unterschiedliche Nenner und gelten nicht als lokale Produktionsmessung.
Aktuelle GitHub-Metadaten sind bewusst nicht Teil des stabilen Betriebsvertrags.
Die Toonify-Version wurde separat über die offizielle GitHub-Release-/Tagquelle
geprüft; diese Versionsbestätigung ist kein Funktions- oder Einsparungsnachweis.
