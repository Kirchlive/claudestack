---
schema_version: 1
titel: "4-Wege-Datensatz-Abgleich: Claude-Code-Token-Stack"
datum: 2026-08-13
datensaetze:
  OPUS_V4: "OPUS5_MAX_Validation (KONZEPT-v4.md, VALIDATION.md, repo-catalog-v4.{json,md})"
  GPT56: "GPT56SOL_ULTRA_Validation (SYNTHESIS_2026-08-13.md, repo-union.{csv,json}, decision.yaml)"
  K3: "K3SWARM_MAX_Validation / unsere Validierung (claude-token-stack-evaluierung-und-merge.md, changes.md + Subagent-Prüfberichte)"
  KIMI: "KIMI_AGENT/Claude-Code-Token-Stack-Konzept.md (+ Research-Basis wides/dims/readmes)"
bewertungsskala:
  5: "vollständig, evidenzgedeckt, direkt übernehmbar"
  4: "gut, kleinere Lücken/Ungenauigkeiten"
  3: "vorhanden, aber oberflächlich oder indirekt"
  2: "rudimentär / teilweise fehlerhaft"
  1: "faktisch nicht brauchbar"
  n.v.: "nicht vorhanden"
bewertungsbasis: "ausschließlich vorhandene Daten, keine zusätzlichen Messungen"
---

# 4-Wege-Abgleich: Themen-Gegenüberstellung mit 5-Punkte-Bewertung

## 0. Zusammenfassung (Score-Matrix)

| # | Thema | OPUS_V4 | GPT56 | K3 | KIMI | Beste Quelle |
|---|---|---|---|---|---|---|
| 1 | Repo-Korpus & Verifikationsmethodik | 5 | 4 | 3 | 4 | OPUS_V4 |
| 2 | Aktualitäts-/Lieferfähigkeitsdaten (Stars, Commits, Lizenzen) | 5 | 2 | 2 | 3 | OPUS_V4 |
| 3 | Agenten-Ranking/Bewertungsraster | 4 | 5 | 5 | n.v. | GPT56 ≈ K3 |
| 4 | Native Fakten: MCP Tool Search | 4 | 5 | 3 | 3 | GPT56 |
| 5 | Native Fakten: Bash-Limits/Spill | 5 | 4 | 2 | 2 | OPUS_V4 |
| 6 | Native Fakten: Hook-Vertrag (updatedToolOutput, Precedence) | 5 | 5 | 4 | 3 | OPUS_V4 ≈ GPT56 |
| 7 | Native Fakten: CLAUDE.md/Rules/Compaction-Reinjektion | 4 | 5 | 3 | 4 | GPT56 |
| 8 | Architekturgesetze (Owner, Cache, Lieferfähigkeit) | 5 | 4 | 4 | 3 | OPUS_V4 |
| 9 | Mechanismus-Taxonomie (Vermeiden→Verbilligen) | 4 | 3 | 4 | 5 | KIMI |
| 10 | Flächen-/Schichtenmodell | 5 | 4 | 4 | 4 | OPUS_V4 |
| 11 | Messung & Governance | 5 | 4 | 4 | 4 | OPUS_V4 |
| 12 | Prefix-Diät / Stufe 0 | 5 | 4 | 3 | 3 | OPUS_V4 |
| 13 | Native Deckel (Env-Variablen) | 5 | 4 | 3 | 3 | OPUS_V4 |
| 14 | Capability/Canary (Shadow-Fallback) | 5 | 4 | 4 | 2 | OPUS_V4 |
| 15 | Bash-Output-Owner & Guard-Spezifikation | 5 | 5 | 4 | 3 | OPUS_V4 ≈ GPT56 |
| 16 | Read-Kontext-Guards (R3/R4) | 5 | 4 | 3 | 2 | OPUS_V4 |
| 17 | Codeindex/Retrieval | 5 | 5 | 3 | 3 | OPUS_V4 ≈ GPT56 |
| 18 | Sitzungsgrenze & Kompaktierung | 5 | 4 | 4 | 4 | OPUS_V4 |
| 19 | Verhalten/Implementation-Ladder (ponytail) | 5 | 3 | 3 | 5 | OPUS_V4 ≈ KIMI |
| 20 | Cache-Ebene & Proxys (BASE_URL) | 4 | 4 | 3 | 5 | KIMI |
| 21 | MCP-Sandbox & Schema-Kompression | 4 | 4 | 3 | 5 | KIMI |
| 22 | Token-effiziente Formate (TOON u.a.) | 3 | 3 | 2 | 4 | KIMI |
| 23 | Memory/Persistenz | 4 | 4 | 3 | 5 | KIMI |
| 24 | Routing (Profil C) | 3 | 3 | 3 | 4 | KIMI |
| 25 | Ladder-Modelle (Session/Compression) | 3 | 4 | 4 | 5 | KIMI |
| 26 | Absagen/Watchlist (mit Triggern) | 5 | 5 | 4 | 5 | OPUS_V4 ≈ GPT56 ≈ KIMI |
| 27 | Konfliktmatrix/Owner-Registry | 5 | 4 | 4 | 4 | OPUS_V4 |
| 28 | Regelwerk & lauffähiger Code (R1–R8, Guards) | 4 | 5 | 4 | 2 | GPT56 |
| 29 | Rollout/Migration/Gates | 4 | 5 | 4 | 3 | GPT56 |
| 30 | Offene Punkte/Selbstdeklaration | 5 | 4 | 3 | 4 | OPUS_V4 |
| 31 | Konkrete Token-Zahlen/Budgets | 5 | 4 | 2 | 3 | OPUS_V4 |
| 32 | Eigenmessung/Empirie | 4 | 3 | 3 | 2 | OPUS_V4 |
| | **Summe** | **144** (max 160) | **130** (max 160) | **107** (max 160) | **111** (max 155, 1× n.v.) | |

> **Erratum v2 (13.08.2026, nach META-VALIDIERUNG-3WEGE §1.2):** Die ursprünglich publizierten Summen (142/127/103/109) waren falsch; programmatisch nachgerechnet: **144/130/107/111**. Rangfolge unverändert. KIMIs Nenner ist 155 (1× n.v.), nicht 160.

**Erste grobe Gesamtbewertung (Datenlage 13.08.2026, korrigiert):** OPUS_V4 führt als vollständigster, selbstkritischster und mit Eigenmessungen unterlegter Datensatz; GPT56 ist die stärkste native/technische Korrekturinstanz mit dem besten Rollout; KIMI bleibt Referenz für Mechanismus-Logik, Cache/Proxy/Memory-Tiefe und Ladder; K3 (unsere Validierung) ist stark bei Agenten-Ranking und externer Verifikation, aber ohne eigenen Katalog/Eigenmessungen auf Platz 4 der Datenbasis. **Meta-Befund (3-WEGE §3):** Über alle drei Vergleichsdokumente ist nur `{GPT56, OPUS_V4} vor {KIMI, K3}` robust; die Reihenfolge innerhalb der Paare ist Gewichtungsartefakt.

---

## 1. Repo-Korpus & Verifikationsmethodik

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 376 Einträge (373 eindeutig; 3 Redirect-Dubletten), 26-Felder-Schema v4, eigene Vermessung aller Repos (HTTP-Scrape + commits/HEAD.atom), dokumentierter Eigenfehler (rstrip-Trunkierung, 58 Namen), 0 erfundene Repos (2/376 nicht erreichbar), Entdeckungsmatrix je Agent | **5** |
| GPT56 | 368 Repos Union (367 verifiziert, 1 fehlend, 2 archiviert, 250 multi-family), CSV↔JSON↔MD programmatisch konsistent, 6 Evidenzstufen; kleine Inkonsistenzen (KIMI 156 vs. 157) | **4** |
| K3 | kein eigener Katalog; nutzt OPUS v3 (251) + externe API-Verifikation ~95 Repos, 0 Halluzinationen, 11 Neufunde | **3** |
| KIMI | ~180 Repos Master-Matrix, API-verifizierte Metadaten (Stars 10/10-Stichprobe exakt), 15 README-Volllektüren, Renames/Doppelgänger aufgelöst | **4** |

## 2. Aktualitäts-/Lieferfähigkeitsdaten

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | stars/last_commit/days_since_commit/license/archived/redirect/flags bei 374 Repos; Gesetz III (60-Tage-Regel, Lizenz-Gate); Flags: 101 <5★, 77 stale>60d, 12 Lizenz-Fences, 61 lizenzlos | **5** |
| GPT56 | Lizenz teilweise (Union-JSON `NOASSERTION` vs. MD ELv2 bei context-mode); keine Commit-/Aktivitätsdaten; Sterne teils implausibel übernommen | **2** |
| K3 | Stichproben-Stale-Checks (claw-compactor, claude-code-otel), Rename-Korrekturen; nicht systematisch | **2** |
| KIMI | Rename-Erkennung (301), Obsolet-Schicht, Issue-Level-Aktualität bei Kern-Repos; keine systematischen Lizenz-/Commit-Felder | **3** |

## 3. Agenten-Ranking/Bewertungsraster

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | OPUS5 ≈ KIMI > GPT55SOL > ABACUS > MANUS; Entdeckungsleistung quantifiziert (OPUS 141 neu, KIMI 105/95 exklusiv, MANUS 0) | **4** |
| GPT56 | Scored-Raster (Abdeckung 20/Evidenz 25/Aktualität 20/Ausführbar 20/Betrieb 15): GPT55 88, OPUS 80, KIMI 73, MANUS 68, ABACUS 40 | **5** |
| K3 | Noten mit Detailrubrik: KIMI 9, OPUS 9, GPT 8.5+Code 8, ABACUS 7, MANUS 6; plus Fehlerregister F1–F15 | **5** |
| KIMI | n.v. (ist selbst Untersuchungsobjekt) | **n.v.** |

## 4. Native Fakten: MCP Tool Search

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | ENABLE_TOOL_SEARCH „an" als Stufe-1-Deckel, [DOKU]-markiert | **4** |
| GPT56 | Präziseste Korrektur: Schemas nativ default-deferiert; `auto` = 10-%-Vorab-Schwelle; Empfehlung unset auf direktem Anthropic-Pfad, nie pauschal false | **5** |
| K3 | ~85 %-Einsparung referenziert, undifferenziert | **3** |
| KIMI | Deferred-Loading-Falle (token-savior: 1 Call/143 Sessions); nativ erwähnt | **3** |

## 5. Native Fakten: Bash-Limits/Spill

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | `BASH_MAX_OUTPUT_LENGTH=24000` bewusst unter ~32KB-Auslagerungsgrenze [GEMESSEN]; `MAX_MCP_OUTPUT_TOKENS=8000` (Default 25000); `TASK_MAX_OUTPUT_LENGTH=12000`; `CLAUDE_CODE_MAX_OUTPUT_TOKENS=16000`; `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=78` | **5** |
| GPT56 | Nativer Spill ~30.000 Zeichen (Datei+Vorschau); Env-Vars „einzeln zu testen" | **4** |
| K3 | nur MAX_MCP_OUTPUT_TOKENS=15000 aus GPT-Vorlage | **2** |
| KIMI | MAX_MCP_OUTPUT_TOKENS=15000 in settings-Vorlage | **2** |

## 6. Native Fakten: Hook-Vertrag

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | updatedToolOutput seit 2.1.121 für alle Tools [DOKU]; Shadow-Fallback **reproduziert** (100-KB-Payload → exit 0, `effective: shadow`, `capability-record-missing`); 4-Zustände-Matrix; Re-Probe ≤30 Tage | **5** |
| GPT56 | Strukturierte Bash-Objektform (stdout/stderr/interrupted/isImage) als Muss; PreToolUse-Präzedenz deny > defer > ask > allow; **KIMI-Guard-Defekt entdeckt** (String- statt Objektform → wird ignoriert) | **5** |
| K3 | Canary-Logik funktional getestet (Shadow ohne Record, Replace mit Record); Hooks-Example konform | **4** |
| KIMI | PostToolUse-Grundsatz korrekt, aber eigene Guard-Skizze nutzt defekte String-Form (von GPT56 widerlegt) | **3** |

## 7. Native Fakten: CLAUDE.md/Rules/Compaction

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | CLAUDE.md klein+stabil (Stufe 0); Topologie-Änderung = Prefix-Invalidierung (Gesetz II) | **4** |
| GPT56 | Differenzierteste Behandlung: Root <200 Zeilen, `@`-Importe sparen keine Tokens, `.claude/rules` mit `paths:`-Frontmatter bedarfsgesteuert, Compaction reinjiziert Root+unscoped Rules | **5** |
| K3 | CLAUDE.md-Disziplin übernommen, Compact-Instructions referenziert | **3** |
| KIMI | .claude/rules-Re-Injektion 93k Tokens/46 % (Issue #32057), Compact-Instructions-Block, 200-Zeilen-Mythos falsifiziert | **4** |

## 8. Architekturgesetze

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | **Drei Gesetze**: I Single-Owner (Hooks parallel, Dedup [DOKU]), II Append-only>Prefix-Rewrite (BASE_URL 1 Slot/4 Bewerber), III Lieferfähigkeit (60-Tage/Lizenz/Archiv) — neu und vermessen | **5** |
| GPT56 | Gesetze I+II übernommen und präzisiert (Nenner-Kritik) | **4** |
| K3 | Gesetze I+II als Merge-Constraints übernommen | **4** |
| KIMI | 3 harte Regeln + 8-zeilige Konflikt-Matrix (Vorläufer, weniger formal) | **3** |

## 9. Mechanismus-Taxonomie

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Übernommen + Ceiling-Bewertung (Vermeiden hoch, Verdichten niedrig/höchstes Risiko) | **4** |
| GPT56 | implizit (Profile nach Flächen) | **3** |
| K3 | als Merge-Gliederung übernommen | **4** |
| KIMI | **Urheber**: Vermeiden→Verlagern→Verdichten→Verbilligen, mit Kostenblöcken/Cache-Kohärenz | **5** |

## 10. Flächen-/Schichtenmodell

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 9 Flächen nach Hebel sortiert; **Fläche-5-Abwertung dreifach belegt** (~63 % Fixture vs. ~2 % billed; median 0 %/136 Sessions; Ladder −27,2 % vs. −0,3 %); Bash/Tool-Output nur 20–22 % des Kontextstroms | **5** |
| GPT56 | 11-Oberflächen-Ownership-Matrix; Flächenlogik konsistent | **4** |
| K3 | 9-Schichten-Merge-Tabelle | **4** |
| KIMI | 15 Schichten, nach Token-Strom-Anteil priorisiert | **4** |

## 11. Messung & Governance

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Stufe 7: drei Ersparnisbegriffe (Slice/modellsichtbar/E2E), gepaart ≥3 Replikate, ccusage (17.888★) + codeburn (9.283★), 7 Nenner-Gründe | **5** |
| GPT56 | Baseline 10–20 Tasks, umfangreicher Metrik-Katalog (Kosten/akzeptierte Änderung, p95, Retries, Security-Ereignisse) | **4** |
| K3 | Messpflicht als Gate (Benchmark-Plan + MANUS-Gates, Net-Win-Stop-Regel) | **4** |
| KIMI | 4 Governance-Regeln (Messpflicht, Cache-Hit >90 %, realisiert>geschätzt, Telemetrie nur user-seitig + Otel-Smuggling-Warnung) | **4** |

## 12. Prefix-Diät / Stufe 0

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Ausführlichst: Skill-/Plugin-Inventar, Guidance-Prüfung (3,5k Tokens → 0/92 Aufrufe [GEMESSEN]), MCP projektlokal (286 Tokens/Session [GEMESSEN]), Deny-Regeln, `/context`-Akzeptanzgate; tragende ~100-Token/Skill-Zahl ehrlich als [SEKUNDÄR] markiert | **5** |
| GPT56 | Root-CLAUDE.md <200 Zeilen, Pfadregeln auslagern | **4** |
| K3 | prefix-budget.mjs als Werkzeug übernommen (GPT-Basis + OPUS-Features) | **3** |
| KIMI | Native Disziplin, Cache-Schutz; kein eigenes Prefix-Werkzeug | **3** |

## 13. Native Deckel (Env-Variablen)

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 5 konkrete Werte mit Defaults und Evidenzmarkern (s. Thema 5) | **5** |
| GPT56 | Vars benannt, „einzeln zu testen"; Tool-Search-Korrektur | **4** |
| K3 | AUTOCOMPACT-Caveat ergänzt (einzige Datensatz-eigene Korrektur hier) | **3** |
| KIMI | settings.json-Vorlage mit MAX_MCP_OUTPUT_TOKENS=15000, cleanupPeriodDays | **3** |

## 14. Capability/Canary

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Shadow-Fallback reproduziert + hartes Gate in Phase 3; 30-Tage-Re-Probe; „Canary ist billig, kein Blocker" | **5** |
| GPT56 | Shadow-Pilot ≥1 Woche vor Aktivierung; Packaging-Reparaturen | **4** |
| K3 | Canary funktional verifiziert (Fingerprint + Max-Age) | **4** |
| KIMI | Canary-Konzept nicht behandelt | **2** |

## 15. Bash-Output-Owner & Guard

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 8 Kandidaten mit Messdaten: eigener Guard (1. Wahl), squeez (182★, Apache-2.0), omni (320★), snip (406★), lowfat (566★, 36 d still); semtrim gestrichen (0★); sqz gesperrt (Elastic 2.0); 6 harte Regeln; Net-Win-Gegenbeleg (2.001 vs. 1.719 Tokens) | **5** |
| GPT56 | Muss-Spezifikation (Objektform, Exakt-Klassen, Raw-Artefakt 0700/0600, 7 Tage/20 MB), Pilotwerte (minInputBytes 4096, 512 B, 15 %), 6-Punkte-Reparaturliste, OMNI-Replay-Zahlen (6.656 Traces: 2,7 %/14,9 %/0 %) | **5** |
| K3 | GPT-Suite funktional getestet übernommen + Fixliste B1–B4 | **4** |
| KIMI | Referenz-Design (~120 Zeilen) – korrektes Konzept, defekte String-Form | **3** |

## 16. Read-Kontext-Guards

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | R3 Read-Clamps (offset/limit-Pflicht), R4 Reread-Guard umwidmet (mtime+Hash, toter Code entfernt, Escape-Valve) | **5** |
| GPT56 | deny-once mit Escape-Valve, State-Löschung bei Compact/SessionEnd | **4** |
| K3 | read-context-guard funktional getestet (deny-once, Digest-Sperre) | **3** |
| KIMI | nur Dedup-Fingerprint im Guard-Design erwähnt | **2** |

## 17. Codeindex/Retrieval

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 5 Kandidaten: codegraph (66.154★, CLI), serena (27.939★, neu), sigmap (null Prefix), codebase-memory-mcp (38.730★, Monorepo), tokensave (Pilot, lizenzlos); Anti-Pattern „Index + Volllesen" | **5** |
| GPT56 | CodeGraph-Eigenbenchmarks ehrlich eingeordnet (62 %/44 %, 56 %/24 %, +82 % residenter Kontext, 37-Zellen-Flows teurer); „nie parallel" mit codebase-memory-mcp | **5** |
| K3 | codegraph lean-Default, „genau ein Retriever" | **3** |
| KIMI | THOL-Skepsis (keine E2E-Ersparnis), situativ | **3** |

## 18. Sitzungsgrenze & Kompaktierung

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Dreistufige native Kompaktierung (serverseitig ab ~180K→Ziel ~40K, Microcompact, Voll-Compact, kein Aus-Schalter [SEKUNDÄR]); Skill-Reinjektion ~4.000 Tokens nach Compact; TASK-STATE → /clear → Subagenten → magic-compact (134★) → max. 1 Proxy | **5** |
| GPT56 | Session-Ladder-Bänder (<70/70–80/80–85/>85 %); Durable-State-Muster; keine frühe Auto-Compact-Env | **4** |
| K3 | Ladder übernommen + compact-plus als State-Preservation-Kandidat ergänzt | **4** |
| KIMI | Cache-Sicherheits-Tabelle, magic-compact-Tiefe, Ladder-Stufen mit Cold-Cache-Ökonomie | **4** |

## 19. Verhalten/Implementation-Ladder (ponytail)

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 7-Sprossen-Ladder; ponytail-Statistik vollständig (−10,3 %, p=0,004, ~54 % weniger LOC, 12 Tasks, n=4-Caveat, Selbstkorrektur 80–94 %) | **5** |
| GPT56 | Implementation-Ladder erwähnt, ponytail-Logik referenziert | **3** |
| K3 | ponytail im Kern-Stack (Schicht 2) | **3** |
| KIMI | Ursprungsanalyse (Kap. 6), Qualitäts-Gegenbefund Kürze-Prompts | **5** |

## 20. Cache-Ebene & Proxys

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | BASE_URL = 1 Slot/4 Bewerber; Proxy muss Cache-Write „verdienen"; tokdiet implizit entwertet (33★/56 d) | **4** |
| GPT56 | Proxy-Chains verboten; tokdiet/llmtrim Tier C experiment_only; cache-fix nur bei gemessenem Fehler | **4** |
| K3 | Profil-B-Konditional übernommen | **3** |
| KIMI | **Tiefste Analyse**: Cache-Sicherheits-Trennlinie (9 Proxys), headroom #2438, llmtrim/tokdiet/squeezr/rolling-context/densely README-geprüft | **5** |

## 21. MCP-Sandbox & Schema-Kompression

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | context-mode in Stufe-5/Fläche-Logik eingebettet; ELv2-Fence beachtet | **4** |
| GPT56 | context-mode Tier A mit ELv2-Hinweis; **toonify-Defekt entdeckt** (additionalContext statt Ersetzung → doppelte Tokens) | **4** |
| K3 | Standardübernahme | **3** |
| KIMI | Tiefste Analyse: context-mode FTS5 überlebt /compact (315 KB→5,4 KB), mcp-compressor-Schwelle (≥2 schwere MCPs vs. Tool Search ~47 %), toonify Passthrough-Garantie | **5** |

## 22. Token-effiziente Formate

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | TOON/PAKT nur mit Shape-Gate (Absage-Regel) | **3** |
| GPT56 | strukturierte Kodierung im Default-Profil = none | **3** |
| K3 | toonify-mcp konditional übernommen | **2** |
| KIMI | TOON/TRON-Studie, PAKT, Format-Nudge-Ehrlichkeit | **4** |

## 23. Memory/Persistenz

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Memory-MCP-Konflikt (44–54 Tool-Defs ≈ 4,4–8,6k/Session) in Konfliktmatrix | **4** |
| GPT56 | claude-mem-Privacy-Befund (PostHog/Worker-Stack); normative Wahrheit in Code/ADRs | **4** |
| K3 | planning-with-files + claude-mem optional | **3** |
| KIMI | Tiefste Analyse: MemPalace-Ökonomie, Deferred-Loading, planning-with-files als Fundament, claude-mem Issues #1719/#3480 | **5** |

## 24. Routing

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Routing als Fläche 9, konditional | **3** |
| GPT56 | nicht Default; SUBAGENT_MODEL=haiku als Minimalvariante | **3** |
| K3 | Profil-C-Konditional | **3** |
| KIMI | CCR 193 Tool-Calling-Issues, DeepSeek-#1378-Bruch, qualitätsbedingte Empfehlung | **4** |

## 25. Ladder-Modelle

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Compression-Ladder übernommen; R4-Ladder-Umwidmung auf „belegte Wiederholung" (Daten: −27,2 % eng vs. −0,3 % gepaart) | **3** |
| GPT56 | Vier Ladders (Retrieval/Compression C0–C6/Session/Implementation) | **4** |
| K3 | KIMI-Ladder übernommen, Trigger präzisiert | **4** |
| KIMI | **Urheber** des Stufenmodells mit konkreten Triggern (60–70/80–85/>90 %, Cold-Cache 60k+55 min, Fallbacks >25/>40 Calls) | **5** |

## 26. Absagen/Watchlist

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 12 Verbotsregeln + Lizenz-Fences (Elastic/PolyForm/AGPL/lizenzlos) + 60-Tage-Regel als harte Gates | **5** |
| GPT56 | Headroom (2–7×, #2438), RTK (#1155/#3152), toonify-Hook, Caveman, pxpipe/OmniGlyph, Multi-Owner-Muster — je mit Beleg | **5** |
| K3 | KIMI-Absagen übernommen + ABACUS-Artefakte verworfen (F11/F12) | **4** |
| KIMI | Absagen mit Re-Evaluierungs-Triggern (Urheber der meisten Befunde) | **5** |

## 27. Konfliktmatrix/Owner-Registry

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | 11 Konfliktpaare mit Invarianten-Leitfrage + Asymmetrie-Regel („gebrochener Cache dreht Vorzeichen") | **5** |
| GPT56 | 11-Flächen-Ownership-Matrix + YAML surface_owners (10 Flächen, Default+Alternativen) | **4** |
| K3 | OPUS owners.yaml als Governance-Artefakt übernommen | **4** |
| KIMI | 8-zeilige Konflikt-Matrix (Urheber) | **4** |

## 28. Regelwerk & lauffähiger Code

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | R1–R8 spezifiziert; R1 prefix-budget lauffähig (7/7); R2–R5 an GPT-Paket ausgelagert | **4** |
| GPT56 | Vollständige Suite getestet (9/9 Syntax, 5/5 Self-Tests, Smoke OK) + Reparaturliste; einziger Datensatz mit produktionsnahem Code-Nachweis | **5** |
| K3 | Code-Review mit 20+ Szenarien (96 % Dump-Einsparung, fail-open), Fixliste B1–B4 | **4** |
| KIMI | Guard-Skizze defekt (String-Form); kein weiterer Code | **2** |

## 29. Rollout/Migration/Gates

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Phasen 0–7 mit Aufwänden (Phase 0+1+2 < 3 h ohne Installation), 2-Wochen-Shadow-Gate | **4** |
| GPT56 | Ausführlichste Gates: baseline → prefix_hygiene → retrieval (Verlierer entfernt) → guards_shadow (0 versteckte Fehler) → guards_enforce (non-inferior + materiell besser) → session_and_external → proxies_or_memory (Privacy-Review, Rollback) | **5** |
| K3 | MANUS-10-Wochen-Gates + GPT-Benchmark-Plan + Stop-Regel | **4** |
| KIMI | 30-Tage-Rollout mit binären Abnahmekriterien | **3** |

## 30. Offene Punkte/Selbstdeklaration

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Explizites §13: 100-Token-Primat [SEKUNDÄR], Fläche-1-Lücke, 59 unbewertete Repos, keine E2E-Messung, keine Fremd-Installation | **5** |
| GPT56 | Limitationen + „kein seriöser Gesamtprozentsatz ableitbar" | **4** |
| K3 | Unverified-Scope-Liste | **3** |
| KIMI | Anhang B Methodik-Limitationen | **4** |

## 31. Konkrete Token-Zahlen/Budgets

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Eigenmessungen: 286 Tokens MCP, 3,5k→0/92 Guidance, 2.001 vs. 1.719 Net-Win-Gegenbeleg, −27,2 %/−0,3 % Ladder, 180K→40K Kompaktierung, 4.000 Tokens Skill-Reinjektion | **5** |
| GPT56 | Viele Fremdzahlen sauber eingeordnet (OMNI 2,7/14,9/0 %, Boost 25/81/11,9 %, CodeGraph 62/56/+82 %) + Guard-Pilotwerte | **4** |
| K3 | wenige eigene Zahlen (96 % Guard-Test); übernimmt Fremdzahlen | **2** |
| KIMI | Rechenbeispiele ($6,30 vs. $1,13), 3,7 %-Replay, 614M-Tokens-Codepointer | **3** |

## 32. Eigenmessung/Empirie

| Datensatz | Befund | Bewertung |
|---|---|---|
| OPUS_V4 | Katalog-Vermessung (374 Repos) + Shadow-Fallback-Reproduktion; E2E weiterhin offen | **4** |
| GPT56 | Keine eigene E2E-Messung (deklariert); Verpackungs-/Konsistenzprüfungen | **3** |
| K3 | Funktionale Guard-Tests + ~95-Repo-API-Verifikation; keine Token-Messungen | **3** |
| KIMI | Keine (Anhang B deklariert) | **2** |

---

## Anhang: Legende der Kürzel
- **[DOKU]** offizielle Dokumentation · **[MESSUNG]/[GEMESSEN]** eigene Messung · **[PROJEKT]** Projekt-/Herstellerangabe · **[SEKUNDÄR]** Sekundärquelle · **[SCHLUSS]** Schlussfolgerung
- **n.v.** = nicht vorhanden
