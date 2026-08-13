---
schema: claudestack.second-validation/v1
language: de
as_of: 2026-08-13
source_commit: b0b300c43188f237c9e0317b9a95370db767db5d
supersedes_scores: false
initial_crosswalk: 01-validation-crosswalk-5point.md
file_metrics_csv: 03-file-token-metrics.csv
file_metrics_json: 03-file-token-metrics.json
incoming_reconciliation: 06-incoming-reconciliation.md
measurement_scope: file_surfaces_plus_primary_source_and_issue_review
claude_exact_token_count: unavailable
token_proxy: tiktoken/o200k_base
decision_values: [use, conditional, replace, reject]
---

# Zweitvalidierung: Dateien, Tokens, Repos und Stackentscheidungen

## 1. Ergebnis

Empfohlener Kern ist kleiner als alle vier Ausgangskonzepte:

1. native Claude-Code-Funktionen zuerst;
2. `ccusage` nur als Observer;
3. lokaler Dispatcher als einziger Bash-Output-Owner, zunächst `shadow`;
4. Context Mode nur MCP-seitig für große externe Daten;
5. genau ein Retrieval-Backend pro Projekt und Aufgabe, nicht mehrere parallel;
6. TASK-STATE nur bei langen oder sitzungsübergreifenden Aufgaben;
7. kein Proxy und kein eigener Compact-Rewriter ohne gemessenen Defekt.

Keine pauschale Gesamtersparnis ist durch vorhandene Daten belegbar. Squeez-Ladder-v5 misst −27,2 % nur auf einer engen Source-Structure-Teilfläche bei sechs Runs und gleichzeitig +31 % Output. Externe Repo-Benchmarks messen häufig Zeichen, Fixture-Größe oder Retrieval-Kontext, nicht Kosten pro akzeptierter Änderung.

## 2. Bewertungsmodell

### 2.1 Repo-Score

| component_id | Komponente | max_points | Prüffrage |
|---|---|---:|---|
| `FIT` | funktionaler Nutzenfit | 20 | Trifft Tool einen realen, heute offenen Kostenblock? |
| `EVD` | Evidenz und Reproduzierbarkeit | 20 | Rohdaten, Harness, Nenner, Kontrollarm, Taskqualität? |
| `COR` | technische Korrektheit | 15 | Claims und Transformationen stimmen; Fehler sind erkennbar? |
| `SEC` | Security, Integrität, Recovery | 15 | Permission-Flow, Secrets, Exitcodes, Verlustfreiheit, Abruf? |
| `CMP` | Claude-/Owner-Kompatibilität | 10 | Dokumentierter Hookvertrag; keine konkurrierenden Owner? |
| `MNT` | Aktualität und Issuezustand | 10 | Aktive Pflege; offene kritische Fehler; Releasequalität? |
| `LGL` | Lizenz und Privacy | 5 | Nutzbare Lizenz; klare lokale/externe Datenwege? |
| `OPS` | Betrieb und Rückbau | 5 | Pinning, Doctor, Shadow/Canary, Bypass, Uninstall? |

`score_1_100 = FIT + EVD + COR + SEC + CMP + MNT + LGL + OPS`.

Entscheidungsgrenzen:

| score | Standardurteil |
|---:|---|
| 85–100 | `use`, falls Rollenüberschneidung ausgeschlossen |
| 70–84 | `conditional` mit Aktivierungsgate |
| 50–69 | `conditional` nur eng begrenzt oder `replace` |
| 0–49 | `reject` als Default |

Score ist kein Popularitätsranking. Stille Auto-Freigabe eines transformierten Befehls kann trotz hoher Wartungsaktivität zum Reject führen. Laut aktuellem Hookvertrag werden explizite `deny`-/`ask`-Regeln auch bei `permissionDecision:"allow"` weiterhin ausgewertet; das Risiko ist deshalb präzise als Überspringen der normalen Permission-Rückfrage zu verstehen, nicht als Override expliziter Regeln.

### 2.2 Validierungsdokument-Score

| component_id | Komponente | max_points |
|---|---|---:|
| `COV` | Abdeckung | 20 |
| `TRC` | Quellen-/Claim-Rückverfolgbarkeit | 20 |
| `CUR` | technische Richtigkeit zum Stichtag | 20 |
| `REP` | Mess- und Reproduzierbarkeit | 15 |
| `SEC` | Security-/Datenintegritätsbehandlung | 10 |
| `ACT` | Umsetzbarkeit | 10 |
| `MAC` | Maschinenlesbarkeit | 5 |

## 3. Datei- und Tokenberechnung

### 3.1 Methode

- Byte-, Zeichen-, Zeilen- und SHA-256-Werte sind exakt für Commit `b0b300c...`.
- Tokenwerte sind reproduzierbare Vergleichswerte mit `tiktoken/o200k_base`.
- Sie sind **keine** exakten Claude-Tokenwerte. Anthropic `count_tokens` war mangels konfiguriertem API-Key nicht verfügbar.
- Hook-Code und `settings.json` werden nicht automatisch wortgetreu in Modellkontext geladen. Ihre Tokenzahl ist Dateigröße, keine laufende Promptrechnung.
- `CLAUDE.md` ist dagegen ein direkt modellrelevanter Instruktionskandidat; verschachtelte Rules können zusätzlich oder lazy geladen werden.

### 3.2 Datensatzsummen

| dataset_id | files | bytes | lines | o200k_proxy_tokens | share_of_four_validations |
|---|---:|---:|---:|---:|---:|
| `GPT` | 4 | 359510 | 8554 | 109575 | 33.57 % |
| `OPUS` | 4 | 445070 | 13608 | 140205 | 42.96 % |
| `K3` | 2 | 42399 | 329 | 12375 | 3.79 % |
| `KIMI` | 1 | 224270 | 1351 | 64242 | 19.68 % |
| `FOUR_VALIDATIONS_TOTAL` | 11 | 1071249 | 23842 | 326397 | 100.00 % |
| `SQUEEZ_RTK_REFERENCE` | 32 | 220750 | 4692 | 66793 | n/a |
| `CURRENT_CLAUDE_FILES` | 15 | 107364 | 2586 | 29131 | n/a |

### 3.3 Modellrelevante und operative Oberflächen

| surface_id | path_or_group | bytes | lines | o200k_proxy_tokens | runtime_interpretation |
|---|---|---:|---:|---:|---|
| `S01` | `CLAUDE.md` | 8416 | 173 | 1975 | potenziell immer geladene Instruktion; zuerst kürzen |
| `S02` | `settings.json` | 10707 | 431 | 2984 | Konfiguration, nicht wortgetreuer Prompt |
| `S03` | `hooks/*` gesamt | 88241 | 1982 | 24172 | Code; nur Hook-Ausgaben können Kontext hinzufügen |
| `S04` | drei duplizierte Ladder-Dateipaare | 2 × 7419 Proxy-Token | n/a | 14838 | identischer Code an zwei Orten; 7419 vermeidbare Repo-Duplikat-Token |

`CLAUDE.md` enthält Prinzipien, Caveman, Ponytail, Codegraph und Context-Mode in voller Länge. Ziel: kurze, stabile Basisregel plus lazy/path-scoped Rules. Der absolute Proxy-Unterschied ist erst nach erzeugtem Template messbar; Einsparung darf nicht mit Hook-Dateitoken addiert werden.

### 3.4 Dateiabgleich Squeez-Referenz gegen Runtime

| file_id | Referenz | Runtime | Ergebnis |
|---|---|---|---|
| `F01` | `Squeez-RTK-Ladder/ladder-ledger.mjs` | `hooks/ladder-ledger.mjs` | SHA-256 identisch |
| `F02` | `ladder-retrieve-gate.mjs` | `hooks/ladder-retrieve-gate.mjs` | SHA-256 identisch |
| `F03` | `ladder-retrieve-filter.mjs` | `hooks/ladder-retrieve-filter.mjs` | SHA-256 identisch |
| `F04` | `ladder-config.json` | `hooks/ladder-config.json` | verschieden: Referenz `enabled:true`, Runtime `enabled:false` |
| `F05` | umfassender Ladder-Test | Runtime-Test | Runtime entfernt 60 Nudge-Testzeilen und überspringt deaktivierte Rungs |
| `F06` | geplantes R2-Binary | `/Users/rob/.local/bin/ladder` | Runtime-Binary vorhanden, aber nicht im Repo versioniert |
| `F07` | Scriptannahme | Git-Modus | relevante Scripts `100644`; direkte SessionStart-Ausführung kann Exit 126 erzeugen |

## 4. Vier Ausgangsdatensätze: aktualisierte 1–100-Bewertung

Diese Scores ersetzen nicht den titelweisen 1–5-Abgleich. Sie berücksichtigen zusätzlich Datei-/Provenienzprüfung, aktuellen Claude-Code-Faktencheck und externe Zweitvalidierung.

| dataset_id | COV/20 | TRC/20 | CUR/20 | REP/15 | SEC/10 | ACT/10 | MAC/5 | score_1_100 | rank | Urteil |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `GPT` | 18 | 18 | 19 | 11 | 10 | 10 | 5 | 91 | 1 | stärkste deploybare Synthese; eigene E2E-Aufgabenserie fehlt |
| `OPUS` | 20 | 17 | 17 | 8 | 9 | 9 | 5 | 85 | 2 | stärkste Vollprüfung/Governance; Katalog- und Lieferfähigkeitsclaims teils widersprüchlich |
| `KIMI` | 20 | 16 | 14 | 9 | 8 | 9 | 3 | 79 | 3 | größte Themenbreite; mehrere heutige native Fähigkeiten und Stacküberschneidungen überholt |
| `K3` | 17 | 8 | 14 | 4 | 8 | 8 | 4 | 63 | 4 | brauchbarer Merge; als unabhängige Validierung ohne Samplemanifest, Befehle, Snapshots und Logs zu schwach |

Wesentliche Korrekturen:

| correction_id | Behauptung/Problem | Zweitbefund |
|---|---|---|
| `V01` | OPUS-Katalog „376“ | v4.1 liefert 375 Einträge, davon 374 im OPUS-Snapshot als `exists:true` markiert, sowie 368 case-insensitiv normalisierte kanonische Namen; Erreichbarkeit wurde nicht neu geprüft; Definitionen und sieben kanonische Dublettengruppen offenlegen, nicht als Vollständigkeitsbeleg verwenden |
| `V02` | OPUS R1–R5 geliefert | R2 `bash-output-owner.mjs` fehlt |
| `V03` | K3 „neun Schichten“ | Tabelle nummeriert zehn; Profil A fügt entgegen Exklusivitätslogik CodeGraph und Magic-Compact additiv hinzu |
| `V04` | KIMI/K3 eigener Compact-Rewriter als Kern | native automatische/fokussierte Kompaktierung und Re-Injection dokumentiert; Custom-Rewriter nur bei nachgewiesenem Gap |
| `V05` | Cache-Proxy als allgemeiner Kern | native Prompt-Caching-Metriken vorhanden; Proxy nur nach gemessenem persistentem Cachedefekt |
| `V06` | mehrere Bash-/Retrieval-Helfer addieren | Hooks aus Settings-Ebenen werden additiv gemergt; pro mutierender Oberfläche höchstens ein Owner |

## 5. Repo-Shortlist: 1–100-Ergebnis

| repo_id | FIT | EVD | COR | SEC | CMP | MNT | LGL | OPS | score | decision | target_role |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `native-claude-code` | 20 | 19 | 15 | 15 | 10 | 10 | 3 | 4 | 96 | use | Basisfunktionen |
| `ccusage` | 18 | 15 | 12 | 14 | 10 | 9 | 5 | 3 | 86 | use | Observer/Baseline |
| `sigmap` | 16 | 18 | 13 | 14 | 9 | 7 | 5 | 3 | 85 | conditional | exakte Signatur-/Evidence-Map |
| `local-dispatcher` | 18 | 12 | 13 | 14 | 9 | 8 | 5 | 5 | 84 | conditional | einziger Bash-Output-Owner |
| `codegraph` | 18 | 14 | 10 | 13 | 8 | 8 | 5 | 4 | 80 | conditional | Caller/Impact/Architektur |
| `codebase-memory-mcp` | 17 | 15 | 9 | 12 | 7 | 7 | 5 | 4 | 76 | conditional | riesige/polyglotte Repos |
| `planning-with-files` | 16 | 9 | 13 | 10 | 9 | 9 | 5 | 4 | 75 | conditional | lange/multi-session Aufgaben |
| `ponytail` | 13 | 15 | 10 | 10 | 7 | 9 | 5 | 5 | 74 | conditional | kurze Verhaltensregel/on-demand Skill |
| `codeburn` | 14 | 9 | 9 | 13 | 8 | 9 | 5 | 3 | 70 | conditional | read-only Waste-Diagnose |
| `serena` | 15 | 8 | 9 | 12 | 7 | 8 | 5 | 5 | 69 | conditional | LSP-Edit/Refactor |
| `context-mode-mcp-only` | 18 | 9 | 10 | 9 | 8 | 6 | 2 | 4 | 66 | conditional | externe Bulk-Daten im Sandbox-Prozess ableiten |
| `token-saver` | 14 | 9 | 8 | 7 | 5 | 9 | 5 | 4 | 61 | replace | einfacher Bash-Rewriter, nicht Default |
| `squeez` | 17 | 10 | 7 | 3 | 3 | 10 | 5 | 4 | 59 | replace | experimenteller Vollstack, Hooks nicht Default |
| `tokf` | 16 | 7 | 7 | 6 | 4 | 8 | 5 | 5 | 58 | replace | Filter nur mit externer Permission-Engine |
| `omni` | 12 | 10 | 7 | 7 | 4 | 9 | 5 | 3 | 57 | replace | Ledger/Dedup nur bei gemessener Wiederholung |
| `compact-plus` | 10 | 5 | 8 | 5 | 6 | 7 | 5 | 4 | 50 | replace | nur gehärteter Spezial-Handoff |
| `claude-code-cache-fix` | 8 | 3 | 7 | 3 | 2 | 8 | 5 | 3 | 39 | reject | kein Default-Proxy |
| `magic-compact` | 8 | 2 | 5 | 2 | 3 | 8 | 5 | 1 | 34 | reject | kein Claude-Compact-Rewriter |

## 6. Detailrecords der stärksten und konfliktträchtigen Kandidaten

### R01 — Native Claude Code

```yaml
repo_id: native-claude-code
decision: use
score_1_100: 96
role: [hooks, memory, rules, compact, prompt_cache_metrics, mcp_tool_search]
evidence:
  - https://code.claude.com/docs/en/hooks
  - https://code.claude.com/docs/en/memory
  - https://code.claude.com/docs/en/context-window
  - https://code.claude.com/docs/en/prompt-caching
  - https://code.claude.com/docs/en/mcp
rule: exhaust_native_controls_before_proxy_or_transcript_rewriter
```

Hooks dokumentieren, dass stille Exit-0-Hooks keine Freigabe erteilen und normaler Permission-Flow weiterläuft. `permissionDecision:"allow"` überspringt dagegen die normale Rückfrage; explizite `deny`-/`ask`-Regeln werden weiterhin geprüft. Dritt-Rewriter sind daher nicht gleichwertig mit einem stillen Hook. Settings-Hooks werden über Ebenen addiert; „nur im anderen File“ verhindert keinen Owner-Konflikt.

### R02 — ccusage

```yaml
repo_id: ccusage
head_date: 2026-08-13
release: v20.0.19
release_date: 2026-07-27
open_issue_only_count: 16
license: MIT
decision: use
score_1_100: 86
role: observer_only
fallback: native_usage_plus_raw_claude_jsonl
```

Lokaler Log-Aggregator, kein Token-Sparer und kein Einsparungsbenchmark. Baseline brauchbar; Kosten und Datumsfilter gegen Provider-/Rohdaten prüfen. Relevante offene Befunde: [mögliche Preisüberschätzung #1436](https://github.com/ccusage/ccusage/issues/1436), [stiller Datumsfilterfehler #1483](https://github.com/ccusage/ccusage/issues/1483). Kein Hook-Mutationsrecht.

### R03 — SigMap

```yaml
repo_id: sigmap
head_date: 2026-07-28
release: v8.24.0
release_date: 2026-07-28
open_issue_only_count: 3
license: MIT
decision: conditional
score_1_100: 85
activate_when: exact_signatures_or_ci_evidence_map_needed
fallback: codegraph_or_native_read_slices
```

Stärkste reproduzierbare Retrieval-Evidenz durch [Benchmark-Suite](https://github.com/manojmallick/sigmap-benchmark-suite) und [archivierte Daten](https://zenodo.org/records/19898842). „96,8 %“ misst deterministische Kontextgröße, nicht abgerechnete Agentkosten. Dynamische Flows und Task-Speedup bleiben separat zu validieren.

### R04 — lokaler Dispatcher

```yaml
repo_id: local-dispatcher
implementation: claude-code-token-stack/src/stack.mjs
decision: conditional
score_1_100: 84
default_mode: shadow
mutating_mode: enforce
permissions: never_emit_allow
raw_recovery: sha256_addressed_private_artifact
verification_state: unit_and_contract_tests_passed_no_end_to_end_canary_yet
```

Kombiniert Squeez-Ladder-Learnings mit engerem Vertrag: nur große erfolgreiche Bash-Stdout-Werte; Fehler, Stderr, native Spill-Marker und Exact-Output-Kommandos bleiben unverändert; jede Verdichtung hat Net-Win-Gate und privaten Rohartefaktpfad. `off` und `shadow` mutieren nichts. Score bleibt unter `use`, bis Shadow-/Canary-Daten mit echten Aufgaben vorliegen.

### R05 — CodeGraph

```yaml
repo_id: codegraph
head_date: 2026-08-08
release: v1.5.0
release_date: 2026-07-21
open_issue_only_count: 150
license: MIT
decision: conditional
score_1_100: 80
activate_when: caller_impact_or_architecture_question
fallback: rg_plus_bounded_read
```

Hersteller-A/B: sieben Repos, Median aus vier Runs pro Arm, behauptet −62 % Tokens/−44 % Kosten; Rohläufe nicht unabhängig archiviert. Eigene Doku misst zugleich etwa 80 % mehr residenten Retrieval-Kontext. Relevante Gegenbelege: [Mehrverbrauch #975](https://github.com/colbymchenry/codegraph/issues/975), [falsche Fuzzy-Symbolantworten #1473](https://github.com/colbymchenry/codegraph/issues/1473). Exakte Symbolauflösung und Source-Check erzwingen; kein zweiter Index parallel.

### R06 — codebase-memory-mcp

```yaml
repo_id: codebase-memory-mcp
head_date: 2026-08-12
release: v0.10.3
release_date: 2026-08-13
open_issue_only_count: 357
license: MIT
decision: conditional
score_1_100: 76
activate_when: huge_or_polyglot_repo_and_codegraph_fails_gate
relationship: replacement_not_addition
```

Preprint: 31 Repos, etwa 10× weniger Tokens, aber 83 % statt 92 % Qualität; ein Modell, Erstautor-Grading, evaluierte Version v0.5.5. README-„120×“ vergleicht fünf Graphqueries mit File-by-file-Dump. Kritisch: [Claude-Bash umgeht Hook-Augmentation #1082](https://github.com/DeusData/codebase-memory-mcp/issues/1082), [Windows-Langleck #581](https://github.com/DeusData/codebase-memory-mcp/issues/581). Indexzahlen/Snippets gegen Source verifizieren.

### R07 — planning-with-files

```yaml
repo_id: planning-with-files
head_date: 2026-08-09
release: v3.10.0
open_issue_only_count: 7
license: MIT
decision: conditional
score_1_100: 75
activate_when: long_or_cross_session_task
fallback: native_plan_goal_memory
```

29/30 misst überwiegend Einhaltung eigener Dateistruktur; Rohläufe und kompetitive Harness fehlen. Agent-schreibbare, wiederinjizierte Pläne sind ein dokumentiertes Prompt-Injection-Risiko. Native Plan-/Goal-/Memory-/Compact-Funktionen reichen für normale Aufgaben; ein minimales TASK-STATE bleibt für `/clear`, Crash und Handoff nützlich.

### R08 — Ponytail

```yaml
repo_id: ponytail
head_date: 2026-08-07
release: v4.9.0
open_issue_only_count: 55
open_pr_count: 76
license: MIT
decision: conditional
score_1_100: 74
activate_when: measured_behavior_or_output_quality_gap
preferred_form: concise_rule_before_plugin
```

Beste Verhaltens-Skill-Evidenz: gepinnte Fixture, ausführbarer Harness, Selbsttests, n=4, Raw-Workspace-Aufbewahrung; weiterhin autorengeführt. Offene Claude-Probleme: [fehlende Node-Hook-Fehler #708](https://github.com/DietrichGebert/ponytail/issues/708), [globaler Cross-Session-Modus #662](https://github.com/DietrichGebert/ponytail/issues/662), [~2,8k Token pro Turn #685](https://github.com/DietrichGebert/ponytail/issues/685). Kurze CLAUDE.md-/Rule-Fassung vor dauerhaftem Plugin.

### R09 — CodeBurn

```yaml
repo_id: codeburn
head_date: 2026-08-12
release: v0.9.20
release_date: 2026-08-10
open_issue_only_count: 24
license: MIT
decision: conditional
score_1_100: 70
mode: read_only_first
fallback: ccusage_plus_manual_change
```

Keine kontrollierte A/B-Benchmarkbasis für realisierte Gesamtersparnis. Claude-spezifische Fehler: [Subagent-Sessions 3,3× aufgebläht #974](https://github.com/getagentseal/codeburn/issues/974), [falsche Subscription-Kostenwarnung #968](https://github.com/getagentseal/codeburn/issues/968), [falsche MCP-Remediation #975](https://github.com/getagentseal/codeburn/issues/975). `optimize --apply` und Guard nicht standardmäßig aktivieren.

### R10 — Serena

```yaml
repo_id: serena
head_date: 2026-08-12
release: v1.7.0
release_date: 2026-08-09
open_issue_only_count: 63
license: MIT
decision: conditional
score_1_100: 69
activate_when: lsp_edit_or_refactor_task
fallback: native_lsp_or_codegraph
```

Kein kontrollierter Tokenbenchmark. Community-Messung [#1491](https://github.com/oraios/serena/issues/1491): 35,4 % Session-Adoption; 18,4 % Symbolqueries gefolgt von Read. Stille Fehlerpfade: [unvollständiger Zig-Rename #1744](https://github.com/oraios/serena/issues/1744), [leeres Resultat nach TS-OOM #1814](https://github.com/oraios/serena/issues/1814), [Bash-Suche blind #1845](https://github.com/oraios/serena/issues/1845). Compile/Test bleibt Pflicht.

### R11 — Context Mode, MCP-only

```yaml
repo_id: context-mode
head_date: 2026-08-13
last_substantive_commit_date: 2026-06-29
release: v1.0.169
release_date: 2026-06-29
license: Elastic-License-2.0
decision: conditional
score_1_100: 66
allowed_surface: mcp_only
rejected_surface: full_plugin_hooks
fallback: native_tools_and_bounded_derivation
```

„96 %“ ist 376-KB-Fixture gegen 16,5-KB-programmatische Zusammenfassung, kein Agent-/Qualitätsbenchmark. Execution erbt Host-Dateizugriff und Credentials; „Sandbox“ ist keine OS-Sicherheitsgrenze. Offene Risiken: [CPU/Crash #999](https://github.com/mksglu/context-mode/issues/999), [196-KB-Resume #1022](https://github.com/mksglu/context-mode/issues/1022), [Subagent-Block #1037](https://github.com/mksglu/context-mode/issues/1037), [Doppelhook #1049](https://github.com/mksglu/context-mode/issues/1049), [Benchmarkfehler #1023](https://github.com/mksglu/context-mode/issues/1023). Nur MCP-Werkzeuge für große Web-/Log-/Datenmengen; Full-Hooks nicht installieren.

### R12 — Squeez

```yaml
repo_id: squeez
head_date: 2026-08-12
release: v1.45.2
release_date: 2026-08-12
open_issue_only_count: 1
license: Apache-2.0
decision: replace
score_1_100: 59
safe_trial_constraint: wrap_bash_false_and_no_mutating_hooks
fallback: squeez_retrieve_then_uninstall_hooks
```

Hohe Aktivität und breite Funktion, aber zentraler Sicherheitskonflikt: normale Rewrites und selbst `--no-squeez` geben `permissionDecision:"allow"` zurück und können die normale Permission-Rückfrage überspringen. Explizite `deny`-/`ask`-Regeln bleiben laut Claude-Code-Dokumentation wirksam. Secret-Scan prüft nur erste 64 KiB. 91,4 % basiert auf 40 Fixtures × 5 und Zeichen/4; „40/40 quality“ prüft Signalbegriffe, keinen Task-Erfolg. Als Forschungsreferenz stark, als Vollstack-Owner nicht Default.

### R13 — tokf

```yaml
repo_id: tokf
head_date: 2026-08-08
release: tokf-v0.2.52
release_date: 2026-07-23
license: MIT
decision: replace
score_1_100: 58
required_flags: [external_permission_engine, no_mask_exit_code]
fallback: no_filter_plus_tokf_raw_plus_remove_hook
```

Rewrites werden auto-allowed; Builtin-Permission-Matcher wird im Hook nicht befragt. `tokf run` maskiert Exitcodes standardmäßig. Raw-SQLite hält nur zehn Einträge pro Projekt ohne Größenlimit. `gain` nutzt Bytes/3,5 und ist ausdrücklich nicht Claude-kalibriert. Gute Konfigurierbarkeit reicht ohne Permission-Härtung nicht für Default.

### R14 — OMNI

```yaml
repo_id: omni
head_date: 2026-08-13
release: v0.7.3
release_date: 2026-08-12
open_issue_only_count: 3
license: Apache-2.0
decision: replace
score_1_100: 57
activate_when: repetition_baseline_proves_dedup_value
fallback: OMNI_PASSTHROUGH_1_then_remove_hooks
```

Prehook auto-allows Rewrites. Output über 64 KiB kann gekürzt und ausdrücklich nicht archiviert werden. 14,9 % basiert auf 6.656 privaten Ein-Entwickler-Traces; Corpus nicht reproduzierbar. Filter allein spart etwa 2,7 % Bytes und 2,8 % cl100k; 97,3 % Calls sparen nichts. Nur Ledger/Dedup testen, nicht neben anderem Owner.

### R15 — token-saver

```yaml
repo_id: token-saver
head_date: 2026-08-10
release: v2.7.2
release_date: 2026-08-09
open_issue_only_count: 1
license: Apache-2.0
decision: replace
score_1_100: 61
fallback: TOKEN_SAVER_ENABLED_false_then_uninstall
```

Einfachster konservativer Dritt-Bash-Owner, aber auch hier werden sonstige Rewrites auto-allowed. Kein vollständiges Raw-Archiv; nur maximal 20 erkannte kritische Zeilen. 22 CI-Fixtures sind reproduzierbar, jedoch synthetisch und Zeichen/4. Lokaler Dispatcher gewinnt wegen Permission-Semantik und vollständiger Recovery.

### R16 — Compact-/Cache-Kandidaten

| repo_id | score | decision | Kernbefund | Re-entry-Trigger |
|---|---:|---|---|---|
| `compact-plus` | 50 | replace | Claude-Squash kann ausbleiben; erster Compact kann Manual-State verlieren; OpenAI-Fallback versendet Transcript-State | nur gehärtet, Fallback aus, Temp privat, messbarer Handoff-Gap |
| `claude-code-cache-fix` | 39 | reject | 95,5/82,3 ohne Workload/Runzahl/TTL; v4 ungemessen; Proxy kann Tool Search deaktivieren bzw. TLS-MITM nutzen | gemessener persistenter Cachedefekt in isoliertem Profil |
| `magic-compact` | 34 | reject | kein Claude-Benchmark; „lossless“ widerspricht Pruning/Discard; Bun und undokumentiertes Transcript-JSONL | nur nach dokumentiertem Format und unabhängiger Qualitätsmessung |

## 7. Konfliktauflösung und Ersatzpfade

| conflict_id | Entscheidung | Primärwahl | Fallback |
|---|---|---|---|
| `C01` Katalogzählung | keine globale Vollständigkeitszahl als Qualitätsbeleg | normalisierte, deduplizierte Union mit Prüfstatus | neue Kandidaten separat aufnehmen |
| `C02` Codeindex | exakt ein Backend, taskabhängig | SigMap Signaturen; CodeGraph Relationen | native `rg` + Read-Slices |
| `C03` External Data | Context Mode nur MCP | `ctx_execute[_file]`, Index/Search | native Befehle mit lokalem Ableitungsscript |
| `C04` Bash-Owner | keine Pre-Bash-Rewrite-Pflicht; genau ein Post-Output-Owner | lokaler Dispatcher nach Canary | token-saver nur nach Permission-Fix |
| `C05` Verhalten | kurze Regel vor Plugin | minimales CLAUDE.md/Rule | Ponytail gepinnt/on-demand |
| `C06` Compact | native fokussierte Kompaktierung | `/compact <focus>` + TASK-STATE bei Langlauf | compact-plus erst nach Härtung |
| `C07` Cache | native Metriken zuerst | Prompt-cache status/OTel | cache-fix nur isoliert nach Defektmessung |
| `C08` Guard/Ladder | Squeez-Planungslogik übernehmen, Runtime neu und enger | lokaler Dispatcher | alter Guard nur bis Migration, nicht parallel |

## 8. Aktivierungs- und Messgates

```yaml
benchmark_contract:
  unit: accepted_task_change
  paired_runs_per_arm_min: 10
  fixed:
    - model_and_version
    - repo_commit
    - prompt
    - permission_mode
    - enabled_mcp_servers
    - compaction_policy
  primary_metrics:
    - provider_input_tokens
    - provider_cache_read_tokens
    - provider_cache_write_tokens
    - provider_output_tokens
    - cost_per_accepted_change
    - task_success
  guard_metrics:
    - retries
    - recovery_requests
    - permission_regressions
    - lost_error_or_exit_status
    - p50_latency
    - p95_latency
  promote_only_if:
    task_success_not_worse: true
    security_regressions: 0
    unrecoverable_outputs: 0
    median_cost_per_accepted_change_improves: true
  rollback_if:
    - any_unintended_permission_auto_approval
    - any_unrecoverable_required_output
    - task_success_degrades
    - p95_latency_budget_exceeded
```

Keine Fixture-Kompressionsquote wird in Gesamtersparnis umgerechnet. Prozentwerte verschiedener Nenner werden nicht addiert.

## 9. Quellenregister

- Offizielle Claude-Code-Dokumentation: [Hooks](https://code.claude.com/docs/en/hooks), [Memory/CLAUDE.md](https://code.claude.com/docs/en/memory), [Context Window/Compact](https://code.claude.com/docs/en/context-window), [Prompt Caching](https://code.claude.com/docs/en/prompt-caching), [MCP/Tool Search](https://code.claude.com/docs/en/mcp).
- Repo-/Issue-Primärquellen sind direkt in den Detailrecords verlinkt.
- Lokale Messrohdaten: `03-file-token-metrics.csv` und `03-file-token-metrics.json`.
- Squeez-/Runtime-Befunde: `02-squeez-rtk-ladder-reference-audit.md`.
