---
schema: claudestack.validation-crosswalk/v1
document_stage: initial_no_new_measurements
language: de
as_of: 2026-08-13
repository: https://github.com/Kirchlive/claudestack
snapshot_commit: b0b300c43188f237c9e0317b9a95370db767db5d
datasets:
  GPT:
    files:
      - GPT56SOL_ULTRA_Validation/CLAUDE_CODE_TOKEN_STACK_SYNTHESIS_2026-08-13.md
      - GPT56SOL_ULTRA_Validation/claude-token-stack-decision.yaml
      - GPT56SOL_ULTRA_Validation/claude-token-repo-union.json
  OPUS:
    files:
      - OPUS5_MAX_Validation/VALIDATION.md
      - OPUS5_MAX_Validation/KONZEPT-v4.md
      - OPUS5_MAX_Validation/repo-catalog-v4.json
  K3:
    files:
      - K3SWARM_MAX_Validation/claude-token-stack-evaluierung-und-merge.md
      - K3SWARM_MAX_Validation/changes.md
  KIMI:
    files:
      - KIMI_AGENT/Claude-Code-Token-Stack-Konzept.md
rating_scale:
  5: explicit_validated_actionable
  4: explicit_well_supported_with_gaps
  3: usable_but_partial_or_secondary
  2: weak_or_materially_conflicted
  1: not_present_or_not_usable
presence_values:
  - present
  - partial
  - not_present
score_semantics: score rates the dataset's treatment of this decision, not the named repository itself
measurement_policy: only claims and measurements already contained in the four datasets were used
historical_source_claims: true
corrected_by: 06-incoming-reconciliation.md
---

# Vierfach-Abgleich der Claude-Code-Token-Stack-Validierungen

> Historischer Erstabgleich ohne neue Messung. Katalog-/Erreichbarkeitsclaims
> geben damalige Quellenbehauptungen wieder. Kanonische Counts und Errata stehen
> in `06-incoming-reconciliation.md`.

## 0. Quellenidentität und Grenzen

| dataset_id | Rolle | Umfang im Snapshot | interne Messbasis | zentrale Grenze |
|---|---|---|---|---|
| `GPT` | validierte Synthese und Zielentscheidung | 448 Zeilen Hauptbericht plus YAML/CSV/JSON | normalisierte GitHub-Union, Paket-Smokes in Wegwerfkopie, offizielle Doku | Union zählt Referenzen anders als OPUS; keine eigene End-to-End-Aufgabenserie |
| `OPUS` | Vollprüfung plus Konzept v4 | 276 + 423 Zeilen plus v4-Katalog | Quelle meldete 376 Repo-Metadaten, 13 Funktionsläufe, 100-KB-Hook-Payload, SHA/Score-Prüfung | Aktivitäts-/Lizenzsignale sind Lieferfähigkeits-Proxys, keine Funktionsbeweise; keine E2E-Tokenmessung |
| `K3` | Multi-Agent-Evaluierung und Best-of-Merge | 250 Zeilen | circa 95 GitHub-REST-Prüfungen, README-/Doku-Gegenproben, lokale Artefaktchecks | Stichprobe statt Vollunion; ein Teil der Bewertung übernimmt Hersteller-/Fremdmessungen |
| `KIMI` | umfassendes Konzept und Repo-Landschaft | 1.351 Zeilen, 153 Zitate, Anhangsmatrix | Sekundär- und Drittbenchmarks, Issue-Level-Analyse, circa 15 vendorte Voll-READMEs | keine eigene E2E-Messung; Referenz-Guard ist kein produktionsreifes Paket |

Historische Zähldifferenz: `OPUS` meldete 376 extrahierte Repo-Namen und 374
erreichbare; `GPT` normalisierte 368 unterschiedliche Referenzen und verifizierte
367. Der nachgelieferte OPUS-v4.1-Snapshot enthält stattdessen 375 Zeilen, 374
`exists:true` und 368 casefold-normalisierte Namen; Erreichbarkeit wurde nicht
neu geprüft. Siehe `06-incoming-reconciliation.md`.

## 1. Titel-Crosswalk

| source_title_id | GPT | OPUS | K3 | KIMI | normalisierte Entscheidungen |
|---|---|---|---|---|---|
| `scope_method` | §§1–3 | VALIDATION §§1–2; KONZEPT §§1–2 | §§1–2 | §§1–3 | `D01`–`D04` |
| `agent_output_audit` | §3.1–3.5 | VALIDATION §§3–5,10–11 | §3.1–3.5 | nur indirekt über Quellen-/Repoanalyse | `D03`–`D06` |
| `official_claude_facts` | §4 | VALIDATION §6; KONZEPT §§3,6 | §4.2 | §§5,8,9,15 | `D07`–`D10` |
| `token_anatomy_mechanisms` | §§5,9 | KONZEPT §§3–5 | §§5.1–5.2 | §§2,4 | `D07`, `D11` |
| `native_prefix_cache` | §§4,6.1 | KONZEPT §§3,5–6 | §§4.2,5.1 | §§5,13 | `D08`–`D10` |
| `behavior_skills` | §9.4; §10 | KONZEPT §6 | §§4.2,5.1 | §6 | `D12` |
| `shell_output` | §§6.3,8 | KONZEPT §§6.3,9 | §§3.3,5.1–5.2 | §§7,15.1–15.2 | `D13`, `D23` |
| `sandbox_schema_compression` | §§6.4,7 | KONZEPT §§5,7 | §§5.1–5.2 | §8 | `D14`, `D15` |
| `code_retrieval` | §§6.2,7,9.1 | KONZEPT §§5,6.4 | §5.1 | §§10.2,11 | `D16` |
| `session_compaction` | §§6.5,9.3 | KONZEPT §§6.5,9 | §§5.1–5.2 | §9 | `D17` |
| `memory_persistence` | §§6.6–7 | KONZEPT §§5,7 | §5.1 | §12 | `D18` |
| `routing_proxy_cache_fix` | §§6.5,7,10 | KONZEPT §§7,12 | §5.1 | §§9,13 | `D19` |
| `formats_packaging` | §§4,10 | KONZEPT §§4,12 | §§4.4,5.1 | §10 | `D20` |
| `ownership_conflicts` | §§5,7 | KONZEPT §§3,7,9 | §§5.1–5.2 | §14.1 | `D21` |
| `security_recovery` | §§8,10 | KONZEPT §§3,7,9,12 | §§3.3,4.4,5.2 | §§7–9,15 | `D22`, `D23` |
| `ladder` | §9 | KONZEPT §§4,6.5,9.4 | §§5.1–5.2 | §15.3 | `D24` |
| `measurement_rollout` | §11 | KONZEPT §§6.7,10–11 | §§5.3,6 | §§4,16 | `D25`–`D27` |
| `artifacts_machine_readability` | §§2–3,13 | VALIDATION §§5,10–11; v4-Katalog | §§3,6 | Anhänge A–B, Zitationsapparat | `D28`, `D29` |
| `reject_watchlist_final` | §§10,12 | KONZEPT §§8,12–13 | §§5–7 | §§14.2–14.4,16.3 | `D30`–`D32` |

## 2. Entscheidungsrecords

### D01 — Auftrag, Abgrenzung und Zielgröße

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Optimiert Kosten und Kontext pro akzeptierter Aufgabe; kein maximaler Tool-Stack. | §§1–2 | 5 |
| `OPUS` | present | Deploybarer Stack, Lieferfähigkeit und Ownership stehen vor Toolzahl. | VALIDATION §1; KONZEPT §§1–3 | 5 |
| `K3` | present | Best-of-Merge mit Vollständigkeit, Validität, Konsistenz und Umsetzbarkeit. | §§1–2 | 4 |
| `KIMI` | present | Vollständige Repo-Landschaft plus bestmöglicher kombinierter Stack; Tokenvolumen und Kosten werden getrennt. | §§1.1–1.2 | 4 |

### D02 — Evidenzstandard und Nennerdisziplin

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Primärquellen/Reproduzierbarkeit gewichtet; Payload-, Token- und E2E-Prozente nicht addieren. | §§1,3,11 | 5 |
| `OPUS` | present | Marker `[DOKU]`, `[MESSUNG]`, `[GEMESSEN]`, `[PROJEKT]`, `[SEKUNDÄR]`; Extraktorfehler offengelegt. | VALIDATION §1; KONZEPT §2 | 5 |
| `K3` | present | Drei Prüfstränge und Fehlerregister; trennt externe Verifikation von Agentenclaims. | §§2,4.4 | 4 |
| `KIMI` | present | Tier 1–3, Nennerregel und unabhängige Gegenmessung sind Kernmethode. | §§1.2,2.3 | 5 |

### D03 — Repo-Inventar und behauptete Vollständigkeit

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | 368 normalisierte IDs, 367 öffentlich verifiziert, 250 Multi-Family; CSV/JSON vorhanden. | §2.1 plus Union-Artefakte | 5 |
| `OPUS` | present | Quelle meldete 376 extrahiert/374 erreichbar; nachgelieferter v4.1-Snapshot korrigiert in `06`. | VALIDATION §§3–4,9 | 5 |
| `K3` | partial | Circa 95 Kernrepos geprüft und 11 Nachträge gefunden; keine vollständige normalisierte Union. | §§4.1,4.3 | 3 |
| `KIMI` | present | Rund 180 Repos in 15 Schichten mit Master-Matrix; globale Vollständigkeit bleibt unbeweisbar. | §§3.1, Anhang A | 4 |

### D04 — Aktualität, Lizenz und Lieferfähigkeit

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | GitHub-Metadaten in Union; Lizenz-/Betriebsrisiken bei Shortlist berücksichtigt. | §§2.1,6,10 | 4 |
| `OPUS` | present | Quelle meldete Metadaten für 376 und 249 vorläufig freigabefähig; nicht als neu geprüfter Ist-Status lesen. | VALIDATION §§8–9; KONZEPT Gesetz III | 5 |
| `K3` | partial | Existenz, Stars, `pushed_at`, Archivstatus für Stichprobe; Lizenzprüfung nicht flächendeckend. | §4.1 | 3 |
| `KIMI` | present | Aktivität und Issues vieler Kernrepos detailliert; Lizenzabdeckung nicht als vollständige Korpusmessung. | §§3,7–14, Anhang A | 4 |

### D05 — Gleichwertige Agentenbewertung

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Einheitliches 100-Punkte-Raster; GPT 88, OPUS 80, KIMI 73, MANUS 68, ABACUS 40. | §3 | 5 |
| `OPUS` | present | Messbasierte Funktions-/Entdeckungsbewertung; keine reine Stilnote. | VALIDATION §§4–5,10 | 5 |
| `K3` | present | Gleiche Kategorien, aber Hauptnoten 6–9/10 sind weniger granular und teils qualitativ. | §3 | 4 |
| `KIMI` | not_present | Kein gleichwertiges Scoring der fünf später zusammengetragenen Agentenoutputs. | nicht vorhanden | 1 |

### D06 — Funktionsprüfung vorhandener Artefakte

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Self-Tests/Contract-Smoke; vollständige Wegwerfprüfung nach Mode-/README-Fix; Defekte explizit. | §§3.1,8.1,8.4 | 5 |
| `OPUS` | present | 10 Syntaxchecks, 13 Funktionsläufe, 100-KB-Payload, SHA-Prüfung; stiller Shadow-Fallback reproduziert. | VALIDATION §§1,5 | 5 |
| `K3` | present | Syntax, Smoke und Semantikchecks berichtet; Packagingblocker im Fehlerregister erfasst. | §§3.3,4.4 | 4 |
| `KIMI` | not_present | Referenzcode, aber kein Paket-, Hook-Contract- oder Installationsnachweis. | §15.2 | 1 |

### D07 — Claude-Code-Faktencheck

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Tool Search, Hookoutput, Memory/Rules, Limits, Context und Sessions gegen offizielle Doku korrigiert. | §4, §13 | 5 |
| `OPUS` | present | Parallele Hooks, `updatedToolOutput`, Outputlimits bestätigt; einzelne Modellannahme nur plausibel. | VALIDATION §6 | 5 |
| `K3` | present | Kernaussagen gegen Docs bestätigt; ABACUS-PreToolUse-Outputfehler erkannt. | §4.2 | 4 |
| `KIMI` | present | Viele Doku-/Issue-Bezüge; einige Versions-/Sekundärdetails bleiben nicht erstquellenbelegt. | §§5,8,9,15 | 4 |

### D08 — Prefix-, CLAUDE.md- und Rules-Disziplin

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Root stabil und klein; path-scoped Rules; volatile Sessiondaten aus Prefix entfernen. | §§4,6.1,7 | 5 |
| `OPUS` | present | Prefix-Diät ist Stufe 0; lizenzsauber durch Handarbeit plus read-only Budget. | KONZEPT §§5,6.0,8.2 | 5 |
| `K3` | present | Native Limits und CLAUDE.md-Disziplin im Pflichtkern; genaue Kostenclaims teilweise übernommen. | §5.1 | 4 |
| `KIMI` | present | Root unter circa 60 Zeilen als Praxisziel, Compact-Instructions, Rules sparsam. | §5.1, §15.4 | 5 |

### D09 — Prompt-Cache und Prefix-Stabilität

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Cache-stabil und rückholbar vor aggressiver Kompression; Provider-Usage statt Proxyanzeige. | Gesetz 2; §§6.5,11 | 5 |
| `OPUS` | present | Append-only schlägt Prefix-Rewrite; Proxy muss Cache-Write-Aufschlag verdienen. | Gesetz II; §§6.7,7 | 5 |
| `K3` | present | Cache-Kohärenz als größter Hebel übernommen; weniger klare eigene Messbasis. | §§5,7 | 4 |
| `KIMI` | present | Cache-Hit-Rate >90 % als Primärkennzahl; Proxy-/Resume-Konflikte detailliert. | §§4.2,5.2,9,13 | 5 |

### D10 — Native Tool Search und MCP-Schemafläche

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Direktpfad: `ENABLE_TOOL_SEARCH` unset; Gateway nur nach Bedarf; ein Schema-Owner. | §§4,7 | 5 |
| `OPUS` | present | Native Deckel vor Fremdcode; Schemafläche als hoher Hebel, ein Owner. | KONZEPT §§5–7 | 4 |
| `K3` | present | Native Tool Search bestätigt und im Kernstack; keine tiefe Wrapper-Gegenprüfung. | §§4.2,5.1 | 4 |
| `KIMI` | present | Native Baseline, mcp-compressor, Bifrost/Edgee und Tool-Search-Unsichtbarkeit differenziert. | §8.2–8.3 | 5 |

### D11 — Reihenfolge der Sparmechanismen

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Vermeiden → selektieren → deterministisch reduzieren → rückholbar auslagern → semantisch komprimieren. | Gesetz 2; §9.2 | 5 |
| `OPUS` | present | Vermeiden → Verlagern → Verdichten → Verbilligen, mit eigenem Erfolgskriterium. | KONZEPT §4 | 5 |
| `K3` | present | Gleiche Reihenfolge als Merge-Invariante; Profile anschließend. | §5 | 4 |
| `KIMI` | present | Vier Mechanismen bilden das Grundraster der gesamten Empfehlung. | §2.2 | 5 |

### D12 — Verhaltens-/Output-Skills

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Ponytail-Logik on demand/kurz; keine Kaskade von Always-on-Stilskills. | §9.4, §10 | 4 |
| `OPUS` | partial | Implementation Ladder empfohlen; unabhängige Skill-Evidenz nicht ausführlich neu geprüft. | KONZEPT §6.6 | 3 |
| `K3` | present | Ponytail als einziger Tier-1-Gewinn; Caveman nicht Default. | §§4.2,5.1 | 5 |
| `KIMI` | present | Ponytail −10,3 % Kosten bei p=0,004; Caveman/Governor/Terse mit Qualitätsrisiko verglichen. | §6 | 5 |

### D13 — Bash- und Tool-Output-Owner

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Ein `PostToolUse:Bash`-Owner; GPT-Guard default, OMNI/Squeez nur als Ersatzarm. | §§6.3,7,8 | 5 |
| `OPUS` | present | Capability zuerst; dann ein Bash-Owner/Dispatcher, workload-basiert. | KONZEPT §§6.2–6.3,7,9.2 | 5 |
| `K3` | present | GPT-Guard als Primärlösung; Alternativen genannt, aber Kernstack bleibt stellenweise additiv. | §§5.1–5.2 | 4 |
| `KIMI` | present | Genau ein Rewrite-Hook; typische E2E-Erwartung 0–3 %, 10–15 % bei Loglast. | §7 | 4 |

### D14 — External-Data-Sandbox / Context Mode

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Nur externe Massendaten; lokale Read/Bash-Flächen nicht zusätzlich übernehmen. | §6.4, §7 | 5 |
| `OPUS` | present | Mechanismus Verlagerung, aber Lizenz-Fence und Ownership berücksichtigen. | VALIDATION §8.2; KONZEPT §§4,7 | 4 |
| `K3` | present | Kernstack-Komponente, Konfliktgrenzen weniger strikt operationalisiert. | §5.1 | 3 |
| `KIMI` | present | Sandbox/FTS5 tief erklärt; 98-%-Payloadclaim und offene Continuity-Issues eingeordnet. | §8.1 | 5 |

### D15 — Tool-Schema-Kompression/Gateways

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Nativ zuerst; genau ein geprüfter Gateway als Alternative. | §§4,7 | 5 |
| `OPUS` | partial | Schemafläche und Single-Owner klar; konkrete Gateway-Gegenprüfung begrenzt. | KONZEPT §§5,7 | 3 |
| `K3` | partial | Tool Search bestätigt; dedizierte Gatewayentscheidung nicht vertieft. | §§4.2,5.1 | 3 |
| `KIMI` | present | mcp-compressor/Bifrost/Edgee mit Wirkung, Risiko, Datenschutz und Aktivierungsregeln. | §8.2 | 5 |

### D16 — Code-Retrieval und genau ein Index

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | CodeGraph nur für Relationsfragen; codebase-memory ersetzt ihn bei großem Polyglot; Residual Context berücksichtigt. | §6.2, §7 | 5 |
| `OPUS` | present | Native Suche klein; CodeGraph/Serena/SigMap/codebase-memory fallbezogen und exklusiv. | KONZEPT §6.4 | 5 |
| `K3` | present | CodeGraph Pflichtkern mit A/B gegen Alternative; Default-Aussage ist breiter als Evidenz. | §§5.1,5.3 | 4 |
| `KIMI` | present | Sechs Kandidaten; enge Fragen können 20–43 % teurer sein; Aktivierung ab großer/relationaler Arbeit. | §11 | 5 |

### D17 — Sessiongrenze und Compact-Strategie

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | TASK-STATE bei 70–80 %, compact 80–85 %, clear/Handoff danach; Startwerte, keine Blocker. | §§6.5,9.3 | 5 |
| `OPUS` | present | Sessiongrenze als hoher Hebel; Checkpoint vor Schnitt; keine ungemessene Frühschwelle. | KONZEPT §§5,6.5,9.5 | 5 |
| `K3` | present | Magic-compact plus Ladder 60/80/90; übernimmt mehrere Schwellen ohne eigene Sensitivitätsanalyse. | §§5.1–5.2 | 4 |
| `KIMI` | present | Cache-Sicherheitslinie, magic-compact, Clear/Handoff und Profile detailliert. | §9, §15.3 | 5 |

### D18 — Memory und Persistenz

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Code/Tests/ADRs/TASK-STATE sind Wahrheit; genau ein Memory erst bei gemessener Cross-Session-Reorientierung. | §6.6, §7 | 5 |
| `OPUS` | partial | Sessiondateien/Owner-Governance klar; Memory-Kandidaten weniger tief verglichen. | KONZEPT §§5,7,12 | 3 |
| `K3` | present | planning-with-files Pflichtmuster; globale Memory-MCPs nicht Default. | §§5.1,6 | 4 |
| `KIMI` | present | Statischer MCP-/Injection-Overhead und dateibasierte Alternative systematisch verglichen. | §12 | 5 |

### D19 — Proxy, Routing und Cache-Fix

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Kein Default-Proxy; genau ein `BASE_URL`-Owner; separate Provider-A/B-Arme. | §§6.5,7,10–11 | 5 |
| `OPUS` | present | Proxy muss Cache-Mehrkosten verdienen; ein Owner, Aktivität/Lizenz prüfen. | Gesetz II; KONZEPT §§7,12 | 5 |
| `K3` | present | Routing nur optional, Headroom/RTK nicht Default; Konflikte anerkannt. | §§5.1,6–7 | 4 |
| `KIMI` | present | Headroom, llmtrim/tokdiet, cache-fix und CCR nach Cache-/Qualitätsbedingungen getrennt. | §§9,13 | 5 |

### D20 — Formate und Repo-Packaging

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | partial | TOON/lossy Formate nicht Default; Karte statt Dump implizit über Retrieval. | §§6.2,10 | 3 |
| `OPUS` | partial | Shape-Gate für TOON/PAKT und verlustfreie Priorität; wenig Detail zu Packagern. | KONZEPT §§4,12 | 3 |
| `K3` | partial | Repo-Packaging nur in Schicht-/Absagenlogik. | §5.1 | 3 |
| `KIMI` | present | TOON gegen kompaktes JSON, PAKT, SigMap und Dumper-Falle detailliert. | §10 | 5 |

### D21 — Surface-Ownership und Konfliktmatrix

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Vollständige Owner-Tabelle für Prefix, Schema, Bash, Read, Retrieval, Memory, API und Observer. | §§5,7 | 5 |
| `OPUS` | present | Gesetz I, Dispatcher und Registry; Parallelität technisch begründet. | KONZEPT §§3,7,9.2,9.6 | 5 |
| `K3` | present | Single-Owner als Invariante, aber Pflichtkern nennt mehrere Komponenten mit möglicher Read/Bash-Überlappung. | §§5.1–5.2 | 4 |
| `KIMI` | present | Konfliktmatrix und ein Rewrite-/Schema-/Proxy-Slot; Kernstack bleibt an einzelnen Flächen überbesetzt. | §§14.1–14.2 | 4 |

### D22 — Security, Datenintegrität und Recovery

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Fehler/Patches/Security/IaC/Krypto exakt; Secret-Redaction; private bounded Raw-Artefakte. | §8.2 | 5 |
| `OPUS` | present | Keine lossige Ersetzung ohne Original; Lizenz-/Permission-/Auto-Allow-Fences. | KONZEPT §§3,7,9,12 | 5 |
| `K3` | present | Security-Issues und Packagingfehler im Register; GPT-Sicherheitsmerkmale übernommen. | §§3.3,4.4,5.2 | 5 |
| `KIMI` | present | Issue-/CVE-Level stark; Referenzguard setzt 0700/0600 und strukturtreue Bash-Ausgabe nicht vollständig um. | §§7–9,15 | 4 |

### D23 — `bash-dump-guard.mjs` (GPT/K3-PostToolUse-Variante, nicht aktueller Root-Deny-Gate)

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | GPT55-Code übernehmen, Packaging reparieren, Canary→Shadow→Replace, exakte Bash-Objektform. | §8 | 5 |
| `OPUS` | present | Ein Dispatcher als R2; GPT R1–R5 als ausführbare Basis; Shadow-No-op sichtbar machen. | VALIDATION §5; KONZEPT §9 | 5 |
| `K3` | present | GPT-Guard als funktionsgeprüfte Werkzeugschicht; konkrete Robustheitsfixes F1–F5. | §§3.3,4.4,5.2 | 5 |
| `KIMI` | partial | Gute Prinzipien und Loop/Spill/Dedup-Skizze; falsche/ungenügende Built-in-Bash-Outputform und Dateirechte. | §§15.1–15.2 | 3 |

### D24 — Ladder-Modell

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Retrieval-, Compression-, Session- und Implementation-Ladder getrennt; reversible Schritte zuerst. | §9 | 5 |
| `OPUS` | present | Vier Mechanismen plus Stufen; konkrete Ladder auf belegte unveränderte Rereads verengt. | KONZEPT §§4,6,9.4 | 5 |
| `K3` | present | KIMI-Ladder übernommen und mit GPT/MANUS-Gates kombiniert; keine eigene Ladder-Messung. | §§5.1–5.3 | 4 |
| `KIMI` | present | Trigger 60–70/80–85/>90, Guard/Compact/Handoff; konzeptionell umfassend, nicht selbst A/B-validiert. | §15.3 | 4 |

### D25 — Token- und Kostenmessung

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Provider Usage, Cache Read/Creation, Qualität, Retries und Kosten pro akzeptierter Änderung; keine Bytequote als E2E-Ersatz. | §§8.2,11 | 5 |
| `OPUS` | present | Slice/modellsichtbar/E2E strikt getrennt; mindestens drei gepaarte Läufe und Qualitätsgate. | KONZEPT §6.7 | 5 |
| `K3` | present | 36-Task-Plan, MANUS-Gates, billed-saving-Stopregel; noch nicht gefahren. | §5.3 | 4 |
| `KIMI` | present | ccusage/CodeBurn, Providerfelder, drei Tage je Änderung; zahlreiche Werte bleiben Fremdmessung. | §§4,16.2 | 4 |

### D26 — Zielprofile und Aktivierungsregeln

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Core Safe plus Retrieval, Build/Log, External, Long-Session und Memory; Alternativen ersetzen Owner. | §6 | 5 |
| `OPUS` | present | Stufen 0–7 und workload-basierte Auswahl; Profile weniger explizit benannt. | KONZEPT §6 | 4 |
| `K3` | present | Neun Schichten und Pflichtkern; Aktivierungsregeln vorhanden, aber Kern zu breit. | §5.1 | 4 |
| `KIMI` | present | Default kurz/klein, lang/power und Multi-Provider mit klaren Triggern. | §14.3 | 5 |

### D27 — Rollout, Gates und Rückbau

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Phasen 0–5, jede Variable einzeln, Shadowwoche, sofortiger Rollback. | §11 | 5 |
| `OPUS` | present | Migration phasenweise; Lieferfähigkeit und Messung vor Aufnahme. | KONZEPT §§10–11 | 5 |
| `K3` | present | GPT-Benchmark in MANUS-10-Wochen-Plan; Verlierer fliegt. | §5.3 | 5 |
| `KIMI` | present | 30-Tage-Plan mit täglichen Metriken und Abnahmekriterien. | §16 | 5 |

### D28 — Packaging, Installer und Portabilität

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Mode- und README-Namensfehler gefunden; in Wegwerfkopie korrigiert und verifiziert. | §§3.1,8.4 | 5 |
| `OPUS` | partial | SHA-/Mode-Probleme und stiller Shadow dokumentiert; v4 selbst ist primär Konzept/Katalog. | VALIDATION §5 | 4 |
| `K3` | present | F1–F5 als Blocker/Robustheitsfehler mit Merge-Maßnahme. | §4.4 | 4 |
| `KIMI` | not_present | Kein distributionsfähiges Paket, Installer oder Portabilitätstest. | nicht vorhanden | 1 |

### D29 — Maschinenlesbarkeit und Single Sources of Truth

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | YAML-Entscheidung, CSV/JSON-Union, klare finale Rangfolge. | Artefakte plus §§2,12 | 5 |
| `OPUS` | present | Synchroner MD/JSON-Katalog, Schema und Owner-Registry; v4-Migrationsregeln. | VALIDATION §§5,11; v4-Katalog | 5 |
| `K3` | partial | Empfiehlt SSOT-Artefakte, liefert selbst hauptsächlich ein Fließdokument. | §6 | 3 |
| `KIMI` | present | Master-Matrix und Zitations-JSONL, aber 224-KB-Konzept mit Wiederholungen erschwert Maschinenkonsum. | Anhänge A–B | 4 |

### D30 — Explizite Nicht-Empfehlungen und Re-Entry-Trigger

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Headroom, RTK-Rewrite, Caveman-Proxy, TOON/lossy Images und Kaskaden nicht Default; Trigger genannt. | §§10,12 | 5 |
| `OPUS` | present | Repos ohne Substanz entfernt; Prefix-Tool wegen Lizenz gesperrt; klare Nicht-Standards. | KONZEPT §§8,12 | 5 |
| `K3` | present | Drei harte Absagen RTK/Caveman/Headroom; Fehlerregister. | §§4.4,6–7 | 4 |
| `KIMI` | present | Jede Absage mit Issue-/Messbegründung und Re-Evaluierungs-Trigger. | §§14.4,16.3 | 5 |

### D31 — Finale Stackentscheidung

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Native-first, klein, messbar, recoverable; Dritttools konditional und exklusiv. | §§1,6,12 | 5 |
| `OPUS` | present | Prefix-Diät, native Limits, Capability, ein Bash-Owner, ein Index, Sessiongrenze, Verhalten, Messung. | KONZEPT §6 | 5 |
| `K3` | present | Neunschichtiger Best-of-Merge; nützlich, aber Pflichtkern aus neun Komponenten widerspricht Minimal-/Single-Owner-Ziel teilweise. | §5.1 | 4 |
| `KIMI` | present | Sieben Pflicht- plus drei konditionale Komponenten; sehr begründet, aber an Bash/Read/Proxy stellenweise überbesetzt. | §§14.1–14.3 | 4 |

### D32 — Grenzen und offene Punkte

| dataset_id | presence | Entscheidung/Befund | Beleg im Datensatz | score_1_5 |
|---|---|---|---|---:|
| `GPT` | present | Keine globale Vollständigkeit, keine seriöse Gesamtquote, mittlere Konfidenz bis eigenem A/B. | §§1–2, Schluss | 5 |
| `OPUS` | present | 59 Einträge unbewertet, 60 ohne Lizenz, Skillkosten sekundär, keine E2E-Messung. | KONZEPT §13; VALIDATION §12 | 5 |
| `K3` | partial | Agentenfehler detailliert, eigene Stichproben-/Messgrenzen weniger explizit. | §§2,4.4 | 3 |
| `KIMI` | present | Tier-/Issue-Lücken und Watchlist vorhanden; Umfangs-/Eigenmessungsgrenze nicht immer prominent. | §§1.2,16.3, Anhang B | 4 |

## 3. Aggregat der Erstbewertung

Die folgenden Mittelwerte sind reine Orientierung. Sie mitteln die 32 Entscheidungsrecords gleichgewichtet; sie ersetzen keine spätere 1–100-Zweitvalidierung.

| dataset_id | score_sum | score_max | mean_1_5 | stärkste Rolle | größte Schwäche |
|---|---:|---:|---:|---|---|
| `GPT` | 156 | 160 | 4.88 | deploybare Synthese, sichere Owner-/Guard-Entscheidung | keine eigene produktive E2E-Aufgabenserie |
| `OPUS` | 148 | 160 | 4.63 | Vollprüfung, Architektur, Lizenz-/Lieferfähigkeitsgovernance | konkrete Drittkomponenten teils nur konzeptionell |
| `K3` | 125 | 160 | 3.91 | verständlicher Best-of-Merge und Fehlerregister | Stichprobe statt Vollunion; Kernstack zu additiv; Validierungsprovenienz überwiegend nur behauptet |
| `KIMI` | 134 | 160 | 4.19 | tiefste Themen-/Issue-/Benchmarkbreite | keine produktionsreife Implementierung; einzelne Stack-Überlappungen |

`K3` erreicht diesen Wert als Synthese. Als unabhängig reproduzierbarer Prüfbericht läge die Bewertung niedriger, weil Sample-Manifest, Befehle, API-Snapshots und Testlogs nicht mitgeliefert werden.

## 4. Vorläufiger Konsens

1. Native Prefix-/Cache-/Tool-Search-Hebel zuerst.
2. Genau ein mutierender Owner je Kontextfläche; mehrere Regeln hinter einem Dispatcher.
3. Vermeiden und rückholbar verlagern vor lossigem Verdichten.
4. Ein Codeindex nur bei gemessenem Relationsbedarf; native Suche bleibt Baseline.
5. Bash-/Tool-Filter sind Katastrophenschutz und workload-abhängiger Nebenhebel, kein 60–90-%-Gesamtrabatt.
6. TASK-STATE/Handoff vor Compact/Clear; Memory und Proxys erst bei belegtem Bedarf.
7. Provider-Usage, Taskqualität, Retries und Kosten pro akzeptierter Änderung entscheiden; README-Prozente nicht.

## 5. Offene Konflikte für die Zweitvalidierung

| conflict_id | Konflikt | zu prüfender Entscheid |
|---|---|---|
| `C01` | historisch 376/374 versus 368/367; durch `06` auf Snapshotsemantik präzisiert | gemeinsamer kanonischer Extraktor, Rohabrufe und Einschlussregeln |
| `C02` | CodeGraph Pflichtkern bei K3 versus bedingter Owner bei GPT/KIMI | aktuelle Benchmarks, Issuezustand, Repoform-Trigger |
| `C03` | Context Mode Kernkomponente versus external-only Profil | Hookflächen, Lizenz, Resume-/Snapshot-Issues, realer Overhead |
| `C04` | Squeez Kern/Primärfilter versus eigener GPT-Guard/OMNI | aktueller Hookvertrag, Security, Net-Win, Retrievequalität |
| `C05` | Ponytail dauerhaft versus on-demand/minimale Regel | Prefix-/Skillkosten und Qualitätswirkung trennen |
| `C06` | Magic-compact als Kern versus native Grenze zuerst | aktueller Installationspfad, Recovery, Cache-Churn |
| `C07` | Cache-fix/Sessionproxy | genau ein `BASE_URL`-Owner und Providerfelder |
| `C08` | KIMI-Referenzguard versus GPT55-Guard | strukturierte Bash-Ausgabe, Rechte, Recovery, Canary und Packaging |
