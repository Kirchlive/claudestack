# Claude-Code-Token-Stack: Validierung, Vergleich und Best-of-Merge der Multi-Agent-Ausarbeitungen

**Datum:** 2026-08-13
**Gegenstand:** Gleichwertige Prüfung, Validierung und Destillation der fünf Agent-Ausarbeitungen im Repository `Kirchlive/claudestack` (bzw. der flachen Vorauswahl in `Kirchlive/claude_stack`)
**Methode:** 6 parallele Tiefenanalysen (je Agent-Output), 1 funktionale Code-Prüfung mit Node-Lauftests, 1 externe Verifikation per GitHub-API und Claude-Code-Dokumentation (insgesamt ~95 Repos live geprüft)

---

## 1. Executive Summary

Alle fünf Agents haben dieselbe Forschungsaufgabe bearbeitet – mit erstaunlich unterschiedlichen Stärken und **keiner einzigen halluzinierten Repo-Empfehlung** (externe Verifikation per GitHub-REST-API, ~95 Repos geprüft). Die Outputs ergänzen sich fast ideal, weil jeder Agent eine andere Teildisziplin am besten abdeckt:

| Agent | Gesamtnote | Kernstärke | Kernschwäche |
|---|---|---|---|
| **KIMI** | **9/10** | Tiefste Evidenzarbeit (~180 Repos, 15 README-Volllektüren, Issue-Level-Analyse, unabhängige Benchmark-Einordnung), entscheidungsreifes Gesamtkonzept inkl. Guard-Referenzcode + Ladder | ~224K Zeichen Überlänge, 4–5× wiederholte Narrative, keine eigenen Messungen |
| **OPUS5** | **9/10** | Maschinenlesbarer Katalog v3 (251 Repos, MD+JSON synchron), Owner-Registry als YAML, lauffähiges `prefix-budget.mjs`, ehrliche Selbstkorrektur gegenüber v2 | 76 % der Katalogeinträge unbewertet, keine Reife-Metriken, R2–R5 nur spezifiziert |
| **GPT-5.5** | **8,5/10** (Docs) / **8/10** (Code) | Methodisch sauberstes Paket (Evidenzmarker, Benchmark-Plan mit Stop-Gates), **produktionsnahe Guard-Suite** – funktional getestet mit 96 % Dump-Einsparung | Kein einziges selbst gemessenes Ergebnis (alles Plan), 3 Packaging-Bugs, ~80 % Redundanz zwischen Kerndokumenten |
| **ABACUS** | **7/10** | Echte zweistufige Discovery-Pipeline (12+23 Neufunde), vollständigster Antwortrahmen (6-Schichten-Stack + Guard + Ladder + Configs) | Technisch falsche Hook-Semantik im eigenen Guard-Konzept, widersprüchliche Proxy-Chain, Synthese-Lücke (19 Discovery-Funde versandet), unbelegte Spar-Kaskade (−85–92 %) |
| **MANUS** | **6/10** | Beste *Architekturberatung*: rechnerisch verifizierbares Scoring (26 Kandidaten, CSV+Skript fehlerfrei), Mermaid-Zielarchitektur, 10-Wochen-Pilotplan mit Gates | **Aufgabenkern verfehlt:** 28 von 31 Kern-Repos des Users nie erfasst (Regex-Fehler), null neu recherchierte Repos, bash-dump-guard/Ladder komplett ignoriert |

**Kernbefund der Validierung:** Die drei führenden Outputs (KIMI, OPUS, GPT) konvergieren unabhängig voneinander auf dieselbe zentrale Erkenntnis – **der größte Token-Hebel ist nicht ein weiteres Kompressions-Tool, sondern Prefix-Hygiene, native Limits, Cache-Kohärenz und die Regel „genau ein mutierender Owner pro Kontextfläche"**. Unabhängige Messungen (JetBrains-Benchmark-Serie, in allen ernsthaften Outputs zitiert und extern bestätigt) invertieren die GitHub-Star-Rangliste: rtk (+7,6 % Kosten statt −60–90 %, dazu CVE-2026-33068), caveman (8,5 % statt 65 %) und headroom (Issue #2438: 2–7× Kostensteigerung möglich) fallen durch; ponytail (−10,3 %, p=0,004), quiet-bash (~14 % über 136 Sessions) und native Mechanismen sind die belastbaren Gewinner.

**Das Best-of-Merge** destilliert daraus einen 9-Schichten-Zielstack: KIMI liefert die Mechanismus-Logik, Evidenz-Tiers und das Ladder-Eskalationsmodell; OPUS liefert den maschinenlesbaren Inventar-Katalog und die Owner-Registry; GPT liefert die funktional geprüfte Guard-Suite und den Benchmark-Plan; MANUS liefert Scoring-Methodik und Pilot-Gates; ABACUS liefert zusätzliche Discovery-Funde.

---

## 2. Evaluations-Methodik

Die Prüfung erfolgte in drei parallelen Strängen:

1. **Tiefenanalyse je Agent** (6 Analysten): Vollständiges Lesen aller Dateien pro Agent-Ordner, Bewertung nach Vollständigkeit, Validität, Konsistenz, Umsetzbarkeit; programmatische Konsistenzchecks (MD↔JSON-Abgleich, Zitations-Mapping, Score-Nachrechnung).
2. **Funktionale Code-Prüfung**: Syntax-Checks aller `.mjs`-Dateien, Ausführung der mitgelieferten Smoke-Tests und Verifikations-Skripte, 20+ simulierte Hook-Szenarien (stdin-JSON nach Claude-Code-Hook-Contract), Versionsvergleich der zwei `prefix-budget`-Varianten.
3. **Externe Verifikation**: GitHub-REST-API-Prüfung von ~95 Repos (Existenz, Stars, `pushed_at`, archived), README-Gegenprobe bei Kern-Repos, Fakten-Check der Claude-Code-Behauptungen gegen die offiziellen Docs (Hook-Events, `updatedToolOutput`, Tool Search, 1M-Kontext, Prompt Caching) sowie Suche nach übersehenen Repos.

**Auflösung eines Prüfkonflikts:** Ein Analyst hielt KIMIs/ABACUS' Star-Zahlen (z. B. headroom 66,1k) für falsch, weil Sekundärquellen ~29,5k nannten. Die API-basierte Verifikation widerspricht dem: headroom steht bei **66.112 Stars** (Stand 2026-08-13). Bei Widerspruch zwischen Sekundärquelle und Live-API gilt die API – KIMIs Metadaten sind fast exakt, ABACUS' Zahlen größtenteils korrekt.

---

## 3. Die fünf Outputs im Detail

### 3.1 KIMI_AGENT — Das Referenz-Konzeptdokument (9/10 Hauptdokument, 9/10 Research-Basis)

**Lieferumfang:** 9-Sektionen-Konzept (~224K Zeichen) + vollständige Research-Kette (6 Wide-Scans, 8 Tiefen-Dimensionen, Repo-Matrix mit ~180 Repos, 15 README-Volllektüren mit 4.929 Zeilen, Cross-Verifikation mit Nachtrag, 153-Fußnoten-Zitationssystem).

**Bewertete Stärken:**
- **Evidenz-Disziplin:** Tier-System mit Nenner-Regel („pro Payload ≠ pro Rechnung"). Die Star-Rangliste wird mit unabhängigen Messungen invertiert statt nachgebetet. Stichprobe von 10 Kernzitaten: 8/10 direkt verifiziert (teils wörtlich exakt, z. B. cache-fix 95,5/82,3 % A/B), 2/10 indirekt plausibel, 0 Falschzuordnungen. Zitations-Mapping programmatisch geprüft: 153/153 IDs konsistent.
- **Issue-Level-Analyse:** rtk (#582, #1155, #2345, CVE-2026-33068 .env-Exfiltration, #3175), headroom #2438, claude-mem #1719/#3480, CCR 193 Tool-Calling-Issues, .claude/rules-Re-Injektion (93k Tokens, Issue #32057). Kein anderer Output geht auf diese Schadensfall-Ebene.
- **Selbstkorrektur:** rtk ⚠️→❌, headroom ✅→⚠️ nach Tiefenprüfung; explizite „Nicht verifiziert"-Sektionen; 11 Conflict-Zones analysiert statt geglättet.
- **Umsetzbarkeit:** Ladder-Stufenmodell mit konkreten Schwellen, bash-dump-guard-Referenzimplementierung, settings.json-Vorlage, 30-Tage-Rollout mit binären Abnahmekriterien, drei Workflow-Profile (A kurz / B lang / C Multi-Provider).
- **Verifikations-Hygiene:** Renames per HTTP 301 dokumentiert (chopratejas/headroom→headroomlabs-ai, bodo-run/yek→mohsen1/yek), 4 Namens-Doppelgänger disambiguiert (2× squeez, headroom≠headroom-meter, 2× snip).

**Schwächen:** Überlänge mit 4–5-facher Wiederholung der rtk/caveman/headroom-Demontage; Kurzfassung physisch in Sektion 9 statt am Anfang; citation.jsonl mit technischen Defekten (106/153 URLs mit trailing comma, id 20 leer); Tool-Call-XML-Rest in `readmes/llmtrim.md`; kleine Zahlen-Inkonsistenzen (80 vs. 86 gepaarte Tasks); keine eigenen Laufzeitmessungen (transparent deklariert in Anhang B).

**Rolle im Merge:** **Inhaltliches Rückgrat** – Mechanismus-Taxonomie (Vermeiden → Verlagern → Verdichten → Verbilligen), Evidenz-Urteile, Absage-Liste mit Re-Evaluierungs-Triggern, Ladder-Modell.

### 3.2 OPUS5_MAX — Das maschinenlesbare Inventar (9/10)

**Lieferumfang:** repo-catalog-v3 (251 Repos, MD+JSON mit Schema 3), token-stack-konzept-v3, token-efficiency.rules.v3, context-surface-owners.yaml, lauffähiges prefix-budget.mjs (Self-Test 7/7 PASS).

**Bewertete Stärken:**
- **Katalog-Disziplin:** 14-Felder-Schema bei 251/251 Einträgen identisch, MD↔JSON 100 % synchron (117/117 Layer, 0 Duplikate), 5-stufiges Evidenzmarker-System, ehrliche Quantifizierung eigener Lücken (75 discovery-only, 191 not-assessed, 89 % Lizenzen ungeprüft).
- **Zwei Gesetze mit Begründung:** (I) *Genau ein mutierender Eigentümer pro Fläche* (Hooks laufen parallel, Kompressionsstapel ist technisch unmöglich → Dispatcher-Muster); (II) *Append-only schlägt Prefix-Rewrite* (Cache-Ökonomie). Die v3-Korrektur „Prefix vor Bash" wird mit eigenen v2-Messzahlen begründet (~2 % billed saving, median 0 % über 136 Sessions) – intellektuell ehrlichste Selbstkorrektur im gesamten Paket.
- **Externe Stichprobe:** 6/6 Top-Repos existieren und passen zur Beschreibung (quiet-bash „136 Sessions, pooled ~14 %" exakt mit README übereinstimmend).

**Schwächen:** Keine Reife-Metriken (Stars/Maintenance) für 251 Fremdcode-Kandidaten; 117-Kategorien-Taxonomie fragmentiert (~90 Einser-Kategorien); R2–R5 ohne Code (an v2 ausgelagert); Klein-Inkonsistenzen (SHA256SUMS listet `README.md` statt `README_opus.md`, toter §13-Verweis, Zähler 61 vs. 60); ein veralteter Name (`bodo-run/yek` statt `mohsen1/yek`).

**Rolle im Merge:** **Inventar- und Governance-Schicht** – Katalog v3 als Single Source of Truth für den Repo-Suchraum, owners.yaml als Owner-Registry, rules.v3 als Laufzeitregeln, Gesetz I+II als Architektur-Constraints.

### 3.3 GPT55SOL_PRO — Die ausführbare Werkzeugschicht (Docs 8,5/10, Code 8/10)

**Lieferumfang:** 228-Repo-Katalog (MD+JSON synchron), Research-Hauptdokument mit Evidenzmarkern, Shortlist-Matrix, target-stack-profiles.yaml, **vollständige Guard-Suite** (bash-dump-guard 1.064 Zeilen, prefix-budget, read-context-guard, read-slice-guard, reread-guard, session-economy, Capability-Canary, Installer, Smoke-Tests, verify-package.sh), Benchmark-Plan.

**Funktionale Prüfung (Code-Review mit Lauftests):**
- `node --check`: alle 10 Module OK; `hook-contract-smoke.mjs`: **Exit 0**; `verify-package.sh`: alle 9 Semantik-Checks grün.
- **bash-dump-guard:** 165-KB-Dump → 6 KB (**96 % Einsparung**, ~39.700 Tokens), Raw-Archiv vollständig recoverbar; Failure-Outputs (git diff, terraform plan) exakt durchgereicht; Secrets redacted; **Capability-Canary-Logik vorbildlich**: ohne Live-Beweis gegen die installierte Claude-Executable bleibt der Guard korrekt im Shadow-Modus (`updatedToolOutput` ist kein dokumentiertes PostToolUse-Feld – GPT ist der einzige Agent, der dieses Vertragsrisiko einpreist und technisch absichert); fail-open bei kaputtem JSON.
- **read-context-guard:** deny-once-Semantik exakt wie spezifiziert, Digest-verifizierte Reread-Sperre, `permissionDecision`-Contract korrekt. **session-economy:** minTurns-Gate, 70-%-Band-Warnung, Checkpoints auf Disk – alles funktional.
- **hooks.example.json:** voll konform (Events, matcher, One-Owner-Prinzip).

**Gefundene Bugs (vor Produktion fixen):**
- **B1:** `SHA256SUMS.txt` referenziert `README.md`, ausgeliefert wird `README_gpt.md` → Paket-Verifikation schlägt fehl (OPUS hat denselben Bug).
- **B2:** `install-token-stack-hooks.sh` ohne Execute-Bit committed → Exit 126 auf frischem Checkout.
- **B3 (kosmetisch):** überlappende Secret-Regeln erzeugen verstümmelte Redactions (`api_key=[REDACTED] ANTHROPIC KEY]`).
- **B4:** kein stdin-Größenlimit in den stdin-Readern.

**Dokumenten-Stärken:** Einziger Benchmark-Plan mit Stop-Gates und E2E-Kennzahlen (Cache Efficiency, Dedup Yield) statt Slice-Kompressionsraten; `target-stack-profiles.yaml` mit Capability-Negotiation-Matrix (einzige Stelle im Gesamtpaket, die Runtime-Regressionen des Hook-Vertrags einpreist); aktive Falsifikation der „290 Skills × 100 Token"-Rechnung des User-Vorgabedokuments.

**Schwächen:** Kein einziges selbst gemessenes Ergebnis – der gesamte Stack ist Plan, nicht Beleg; ~80 % Redundanz zwischen Research/Optimized/Shortlist; Sektion G des Katalogs aufgebläht (115 adjacent-Repos); AUTOCOMPACT-Caveat fehlt (bekannte Upstream-Issues, dass `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` im settings-env wirkungslos bleiben kann); ein veralteter Repo-Name (`NodeNestor/nestor-lean` → `NodeNestor/claude-lean-context`).

**Rolle im Merge:** **Ausführungsschicht** – die Guard-Suite ist das einzige funktional geprüfte Code-Artefakt des Gesamtpakets und wird nach Fix von B1–B4 vollständig übernommen; Benchmark-Plan wird zur Messpflicht im Rollout.

### 3.4 ABACUS_AGENT — Die Discovery-Maschine (7/10)

**Lieferumfang:** 5 Research-Worker (~77 unique Repos + 12 Neufunde), mini_tasks-Discovery-Shards (23 weitere Funde), finales HTML-Dokument (6-Schichten-Stack, Configs, Guard-Pattern, Ladder, 7-Tage-Plan).

**Stärken:** Einziger Output mit echter zweistufiger Discovery (neue Repos jenseits der User-Vorgabe, davon verifiziert relevant: **yurukusa/cc-safe-setup** – large-read-guard/read-budget-guard/token-budget-guard, passt exakt zum geforderten Guard-Konzept; nooscraft/tokuin, nadimtuhin/claude-token-optimizer, alexgreensh/token-optimizer, ooples/token-optimizer-mcp). Sauberes 1–5-Scoring, 10-Kategorien-Systematik, begründete Nicht-Empfehlungsliste (500xCompressor korrekt als praxisfremd erkannt), Minimal-Variante für <8 GB RAM. Der 6-Schichten-Stack ist strukturell die vollständigste Antwortform auf die Originalaufgabe (alle drei Teilaufträge inkl. bash-dump-guard und Ladder explizit adressiert).

**Schwächen (belastbar):**
- **Technisch falsche Hook-Semantik** im eigenen Guard-Konzept (PreToolUse kann Tool-Output nicht per stdout-Rewrite transformieren – der Output existiert zum PreToolUse-Zeitpunkt noch nicht). Der externe Fakten-Check bestätigt: Output-Mutation ist nur als **PostToolUse**-Hook mit `updatedToolOutput` kontrakt-konform – genau so implementiert es GPT.
- **Widersprüchliche Proxy-Chain** (Kap. 4 vs. Kap. 6 drehen die Reihenfolge rolling-context↔headroom um).
- **Synthese-Lücke:** 19 sauber recherchierte inv_0-Discovery-Funde (u. a. obra/superpowers, jee599/contextzip) tauchen nirgends im Finaldokument auf; inv_0/agent_2 lieferte gar keinen Output.
- **Erfundene CLI-Kommandos** („planning-files inject", „claude-mem record --async") – als Konzepte deklariert, aber ohne reale Pendants.
- **Spar-Kaskade „−85–92 %"** ist Marketing-Arithmetik aus multiplizierten README-Claims, kein Messwert. (Hinweis: Die vom Analysten zunächst beanstandeten Star-Zahlen erwiesen sich per API größtenteils als korrekt; einzig `earendil-works/pi` bleibt nicht verifizierbar.)

**Rolle im Merge:** **Discovery-Ergänzung** – die Neufunde fließen in den Katalog ein; das CLAUDE.md-Token-Effizienz-Template und die Ladder-Formulierung werden (nach Korrektur der Hook-Semantik) in das Regelwerk übernommen; der Guard-Code selbst wird durch die GPT-Suite ersetzt.

### 3.5 MANUS_AGENT — Der Architekturberater (6/10)

**Lieferumfang:** Hauptkonzept + Kontextengineering-Analyse + ADR-Sammlung, gewichtete Vergleichsmatrix (26 Kandidaten, 6 Kriterien), normalisiertes Inventar (104 Verweise), 10-Wochen-Implementierungsfahrplan, Python-Scoring-Pipeline, 3 Visualisierungen.

**Stärken:** Einziges **rechnerisch verifizierbares** Scoring-Modell (Nachrechnung: 26/26 Werte exakt, 0 Abweichungen; Matrix/CSVs/PNGs konsistent); Mermaid-Zielarchitektur als maschinenlesbare .mmd + gerendertes PNG; operativ stärkster Teil aller Outputs: gate-basierter 10-Wochen-Pilotplan mit Abbruchkriterien, Rollenmodell, A/B-Pilot-Logik („CodeGraph *oder* Claude Context, Verlierer wird entfernt"), Rückbauplan; intellektuell redliche These „Tokenreduktion ist kein eigenständiges Ziel" mit harten Ausschlussregeln.

**Schwächen (aufgabenkritisch):**
- **Kernauftrag (a) verfehlt:** Das Inventar entsteht per Regex nur aus der Bookmark-URL-Liste; 28 von 31 explizit genannten Token-Minimierungs-Repos des Users werden nie erfasst (LLMLingua, rtk, context-mode, headroom, tokdiet u. a. fehlen komplett); **null neu recherchierte Repos** – die geforderte „erweiterte Suche, um wirklich alle Repos zu finden" fand nicht statt.
- **Kernauftrag (b) ignoriert:** bash-dump-guard.mjs und Ladder werden in keinem MANUS-Dokument erwähnt; kein einziges Hook-/Guard-Artefakt, kein Code.
- Lieferungsfehler: defekter CDN-Bildlink, falsche Begleitdatei-Namen, fehlender assets/-Ordner, geleakte interne Skill-Dateien; Haupt-Kompressionskandidat squeez unverifiziert übernommen; 41 % des Inventars als „weitere Bewertung erforderlich" abgeschrieben.

**Rolle im Merge:** **Prozess- und Entscheidungsmethodik** – Scoring-Raster, A/B-Pilot-Gates und der 10-Wochen-Fahrplan strukturieren den Rollout; das Inventar selbst wird durch OPUS v3 ersetzt.

---

## 4. Externe Validierung (Stand 2026-08-13)

### 4.1 Repo-Verifikation

~95 Repos per GitHub-REST-API direkt geprüft (Existenz, Stars, `pushed_at`, archived), dazu README-Gegenproben bei den Kern-Empfehlungen:

- **Halluzinationen: 0.** Auch scheinbar absurde Einträge (karpathy-skills 201k★, graphify 105k★, ponytail 101k★) sind real.
- **KIMIs Metadaten sind die präzisesten** (ccusage 17.888, ponytail 101.658, caveman 97.834, rtk 75.936, headroom 66.112 – nahezu exakt).
- **Umbenennungen:** `NodeNestor/nestor-lean` → `NodeNestor/claude-lean-context` (GPT-Katalog veraltet); `bodo-run/yek` → `mohsen1/yek` (KIMI korrekt, OPUS veraltet); `chopratejas/headroom` → `headroomlabs-ai/headroom` (KIMI korrekt).
- **Veraltet (stale):** `open-compress/claw-compactor` (letzter Push 2026-04) und `ColeMurray/claude-code-otel` (Push 2025-06) – KIMI markiert beide korrekt als stale; MANUS empfiehlt sie dennoch.
- **Validitäts-Rangfolge der Kataloge:** KIMI > OPUS > GPT > MANUS > ABACUS.

### 4.2 Claude-Code-Fakten-Check

Alle geprüften technischen Agent-Aussagen gegen die offiziellen Docs verifiziert – **keine falschen Kernbehauptungen** in KIMI/OPUS/GPT:

| Behauptung | Status |
|---|---|
| Hook-System: 30 Events (2026), stdin-JSON, Exit-2-Semantik, `permissionDecision` (allow/deny/ask/defer) | ✅ bestätigt |
| Output-Mutation via `updatedToolOutput` (PostToolUse) möglich | ✅ bestätigt (ABACUS' PreToolUse-stdout-Rewrite dagegen inkorrekt) |
| 1M-Kontext GA (Opus 4.6/4.7, Sonnet 4.6) | ✅ bestätigt |
| Tool Search ~85 % Einsparung bei MCP-Tool-Definitionen | ✅ bestätigt |
| Subagent-Kontextisolation, Prompt Caching, Auto-Compact | ✅ bestätigt |
| JetBrains-Triplet (rtk +7,6 %; caveman 8,5 %; ponytail −10,3 %, p=0,004) | ✅ wörtlich durch JetBrains-Blog-Serie belegt |

### 4.3 Von allen Agents übersehene Repos (Nachtrag, 11 Neufunde)

| Repo | Stars | Einordnung |
|---|---|---|
| junhoyeo/tokscale | ~4,9k | Token-Observability |
| kenn-io/agentsview | ~4,8k | Session-/Agent-Sichtbarkeit |
| matt1398/claude-devtools | ~3,8k | DevTools/Observability |
| graykode/abtop | ~3,4k | Monitoring |
| giancarloerra/SocratiCode | ~3,2k | Kontext-/Code-Interaktion |
| russelleNVy/three-man-team | ~931 | Multi-Agent-Workflow |
| tzachbon/smart-ralph | ~510 | Loop-/Session-Steuerung |
| u-ichi/compact-plus | ~189 | Compact-State-Preservation |
| kevin-hs-sohn/hipocampus | ~159 | Memory |
| vishal2612200/agentpack | – | Packaging |
| jianzhichun/permafrost | – | Persistenz |

Lücken der Agents liegen v. a. bei **Observability zweiter Reihe** und **Compact-State-Preservation** (compact-plus ist direkt relevant für Ladder-Stufe 2).

### 4.4 Fehlerregister je Agent (konsolidiert)

| # | Agent | Fehler | Schwere | Merge-Maßnahme |
|---|---|---|---|---|
| F1 | GPT+OPUS | README-Dateiname in SHA256SUMS/verify-package | Blocker für Paket-Verifikation | Fix vor Übernahme |
| F2 | GPT | Installer ohne Execute-Bit | Blocker für Installation | `chmod +x` |
| F3 | GPT | Überlappende Secret-Redactions | kosmetisch | Regeln deduplizieren |
| F4 | GPT | Kein stdin-Größenlimit | Robustheit | Limit ergänzen |
| F5 | GPT | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` ohne Upstream-Caveat | mittel | Hinweis + Fallback auf env-Shell-Export |
| F6 | GPT | `NodeNestor/nestor-lean` veraltet | gering | Umbenennung nachziehen |
| F7 | OPUS | `bodo-run/yek` veraltet; toter §13-Verweis; Zähler 61≠60 | gering | Editorial-Fix |
| F8 | OPUS | 76 % cache_risk/prefix_cost unbewertet | strukturell | Als offene Bewertungsaufgabe führen |
| F9 | KIMI | citation.jsonl URL-Defekte (106 trailing commas, id 20 leer) | gering | Editorial-Fix |
| F10 | KIMI | Kurzfassung in Sektion 9; Wiederholungen | gering | Bei Übernahme restrukturieren |
| F11 | ABACUS | PreToolUse-stdout-Rewrite-Semantik technisch falsch | **schwer** (Guard würde nicht funktionieren) | Guard durch GPT-Suite ersetzen |
| F12 | ABACUS | Widersprüchliche Proxy-Chain; erfundene CLIs; −85–92 %-Kaskade | mittel–schwer | Nicht übernehmen |
| F13 | ABACUS | Synthese-Lücke: 19 Discovery-Funde versandet | mittel | Funde in Katalog v3 mergen |
| F14 | MANUS | 28/31 Kern-Repos nicht erfasst; 0 Neufunde | **schwer** (Aufgabenkern) | Inventar durch OPUS v3 ersetzt |
| F15 | MANUS | bash-dump-guard/Ladder komplett ignoriert | schwer | Durch KIMI/GPT-Artefakte ersetzt |

---

## 5. Best-of-Merge: Der destillierte Ziel-Stack

Der finale Stack folgt der bei KIMI/OPUS/GPT konvergenten Logik **Vermeiden → Verlagern → Verdichten (nur reversibel) → Verbilligen**, sortiert nach Token-Strom-Anteil (nicht nach Popularität), unter den zwei OPUS-Gesetzen: *genau ein mutierender Owner pro Kontextfläche* und *Append-only schlägt Prefix-Rewrite*.

### 5.1 Die neun Schichten

| Schicht | Fläche | Primär-Lösung (Quelle) | Konditional / Alternative | Explizite Absagen |
|---|---|---|---|---|
| **0 Messung** | Baseline & Governance | **ccusage** (Alle) + **getagentseal/codeburn** (KIMI) | Nachtrag: tokscale, agentsview | philipp-spiess/claude-code-costs (obsolet), ColeMurray OTEL (stale) |
| **1 Native Hebel** | Prefix, Limits, Hygiene | Env-Limits aus GPT `native-token-limits.example.jsonc` (`MAX_MCP_OUTPUT_TOKENS=15000`, `cleanupPeriodDays`, Tool Search), CLAUDE.md-Disziplin, `/clear` + TASK-STATE.md (GPT/KIMI/OPUS) | AUTOCOMPACT-Override nur mit Upstream-Caveat (F5) | „290 Skills × 100 Token"-Rechnung falsifiziert – dynamisches Metadatenbudget beachten |
| **2 Verhalten** | Modell-Output-Stil | **DietrichGebert/ponytail** – einziger Tier-1-Beleg (−10,3 %, p=0,004; KIMI/ABACUS) | Implementation Ladder als CLAUDE.md-Regel (KIMI/ABACUS) | caveman (8,5 % statt 65 %), tweakcc als Primärhebel (Supply-Chain) |
| **3 Output-Filter** | Bash/Tool-Output | **bash-dump-guard.mjs (GPT-Version, funktionsgeprüft)** als PostToolUse-Hook mit Canary | Turnkey: **yoeld-wix/quiet-bash** (~14 % pooled, 136 Sessions; OPUS-Favorit), claudioemmanuel/squeez (KIMI-Favorit mit Net-Win-Gate), Alt: mpecan/tokf, edouard-claude/snip (YAML-Tests), zdk/lowfat | **rtk** (CVE-2026-33068, #1155/#2345/#3175, +7,6 %/+18 % gemessen) |
| **4 Retrieval** | Code-Kontext | **colbymchenry/codegraph** (lean default; GPT/OPUS/MANUS/ABACUS) | manojmallick/sigmap als CLI (null Prefix), DeusData/codebase-memory-mcp (große Monorepos), oraios/serena (Edit-Workflows) | Genau **ein** Broad-Retriever; THOL-Befund: keine E2E-Ersparnis ohne Workflow-Fit |
| **5 MCP/Sandbox** | Tool-Defs, Massendaten | **mksglu/context-mode** (FTS5-Index überlebt /compact; alle Top-Agents) | atlassian-labs/mcp-compressor (ab ≥2 schweren MCPs), PCIRCLE-AI/toonify-mcp (Input-Format), Tool Search nativ | Deferred-Loading-Falle (token-savior: 1 Call in 143 Sessions) |
| **6 Session** | Wachstum, Compaction | **aerovato/magic-compact** (beste /compact-Alternative; KIMI/OPUS) | **cnighswonger/claude-code-cache-fix** (Resume/Lang-Sessions, 3 CC-Cache-Bugs), NodeNestor/claude-rolling-context (Abo-Poweruser), **u-ichi/compact-plus** (Neufund: State-Preservation) | headroom nur mit eigener Cache-Messung (Issue #2438: 2–7× Kostensteigerung) |
| **7 Proxy/Cache** | E2E-Input (nur Profil B) | – (kein Default) | **fkiene/llmtrim** ODER **agiwhitelist/tokdiet** (cache-sicher, Net-Win-Gate, ehrliche A/B-Zahlen), sergioramosv/squeezr | pxpipe/OmniGlyph (Hex-Recall 0–2/15), PNG-Kontext-Encoding allgemein |
| **8 Persistenz** | Dateibasiertes Gedächtnis | **OthmanAdi/planning-with-files** (KIMI/MANUS/ABACUS) | thedotmack/claude-mem (optional; Issues #1719/#3480 beachten), MemPalace nur mit Tool-Def-Budget (44 Tools = 4,4–8,6k/Session) | globale Memory-MCPs als Default |
| **9 Routing** | Kosten (nur Profil C) | – (kein Default) | musistudio/claude-code-router (193 Tool-Calling-Issues beachten) | RouteLLM/FrugalGPT (Forschung, nicht deploybar) |

**Kern-Stack (Pflicht, Profil A):** ccusage + native Limits + CLAUDE.md-Disziplin + ponytail + bash-dump-guard (GPT) + codegraph + context-mode + magic-compact + planning-with-files.
**Profil B (lange Sessions):** + cache-fix + llmtrim/tokdiet + compact-plus.
**Profil C (Budget/Multi-Provider):** + claude-code-router.

### 5.2 Regelwerk & Governance (die geforderten „Regelungen")

1. **Guard-Suite (übernommen von GPT, nach Fix F1–F4):**
   - `bash-dump-guard.mjs` – PostToolUse, Loop-Guard, Spill >2.000 Tokens mit Preview+Retrieve, Dedup via Fingerprints, fail-open, **Capability-Canary** (Replacement nur nach Live-Beweis `updatedToolOutput`, sonst Shadow).
   - `read-context-guard.mjs` (deny-once + Digest-Reread-Sperre), `read-slice-guard.mjs`, `reread-guard.mjs`, `session-economy.mjs` (70-%-Band-Warnung, Checkpoints).
   - `prefix-budget.mjs`: **GPT-Version als Basis** (Persistenz, korrektes SessionStart-Gating, Plugin-Cache-Scan) + zwei OPUS-Features portieren (Hook-Flächen-Kollisionserkennung, Skill-Namenskollisionen).
   - `claude-code-hooks.example.json` als Registrierungs-Vorlage; `tests/hook-contract-smoke.mjs` + `verify-package.sh` in CI.
2. **Owner-Registry:** OPUS `context-surface-owners.yaml` (9 Flächen, 8 Invarianten) als Governance-Artefakt; Invariante: genau ein mutierender Owner je Fläche, eine Schema-Indirektion pro MCP-Server, ein BASE_URL-Proxy.
3. **Ladder-Eskalationsmodell (von KIMI, übernimmt die ABACUS-Anforderung):**
   - Stufe 0 (always-on): Output-Filter + native Limits.
   - Stufe 1 (60–70 % Kontext): straffen/rewind, TASK-STATE aktualisieren.
   - Stufe 2 (80–85 %): /compact oder magic-compact + PreCompact-Snapshot (+ compact-plus evaluieren).
   - Stufe 3 (>90 % oder Cold-Cache ≥60k+55 min): `/clear` + HANDOFF.md; Tool-Call-Fallbacks >25/>40.
4. **Laufzeitregeln:** OPUS `token-efficiency.rules.v3.md` + ABACUS' CLAUDE.md-Token-Effizienz-Template (Verbotene Aktionen: kein `cat` >500 Zeilen, kein `git log` ohne Limit) – zusammengeführt.
5. **Profile:** GPT `target-stack-profiles.yaml` (A/B-Pilotarme, forbidden_concurrent_owners, Capability-Negotiation) alsmaschinenlesbare Profil-Steuerung.

### 5.3 Messpflicht vor Rollout (aus GPT Benchmark-Plan + MANUS Gates)

Kein Agent hat eigene Messungen geliefert – der Merge macht Messung deshalb zur **Gate-Bedingung**: GPT `token-stack-benchmark-plan.md` (36-Task-Mix, Stop-Gates, E2E-Kennzahlen: Cache Efficiency, Dedup Yield, billed saving) in den MANUS-10-Wochen-Fahrplan eingesetzt: W0 Baseline → W1–2 Kern (native+ponytail+ccusage) → W3–4 Retrieval-A/B (codegraph vs. Alternative, Verlierer fliegt) → W5–6 Output-Filter-A/B (bash-dump-guard vs. quiet-bash, Pflichtmerkmale: Exit-Code, Pfad, Exception, Originalreferenz) → W7–8 Session-Schicht → W9–10 Konsolidierung mit Rückbauplan. **Stop-Regel:** Jede Schicht ohne messbaren Net-Win (billed saving > Overhead) wird entfernt.

---

## 6. Empfohlene „Single Sources of Truth" im Repo

| Zweck | Artefakt (Quelle) |
|---|---|
| Lesefassung Gesamtkonzept | KIMI `Claude-Code-Token-Stack-Konzept.md` (Kurzfassung an den Anfang ziehen) |
| Repo-Inventar (maschinenlesbar) | OPUS `repo-catalog-v3.json/.md` + ABACUS-/Verifikations-Neufunde mergen |
| Ausführbarer Guard-Stack | GPT-Suite (`bash-dump-guard`, `read-context-guard`, `session-economy`, `prefix-budget` + Installer/Tests) |
| Governance | OPUS `context-surface-owners.yaml` + `token-efficiency.rules.v3.md` |
| Profilsteuerung | GPT `target-stack-profiles.yaml` |
| Messplan | GPT `token-stack-benchmark-plan.md` |
| Rollout | MANUS `Implementierungsfahrplan` + KIMI 30-Tage-Rollout konsolidieren |
| Ladder/CLAUDE.md-Regeln | KIMI Ladder-Modell + ABACUS Template (nach Hook-Semantik-Korrektur) |

**Nicht übernehmen:** ABACUS Guard-Code & Proxy-Chain & Spar-Kaskade (F11/F12); MANUS Repository-Inventar (F14); KIMI citation.jsonl ohne Editorial-Fix (F9); rtk, caveman (Default), headroom (Default), pxpipe/OmniGlyph, 500xCompressor, LLMLingua-2-Pfad, globale Memory-MCPs als Default.

---

## 7. Fazit

Die fünf Ausarbeitungen sind von ungleicher Qualität, aber komplementär: **KIMI ist das valideste und tiefste Konzept, OPUS das beste Inventar, GPT die einzige funktionsfähige Werkzeugschicht, MANUS die beste Rollout-Methodik, ABACUS die ergiebigste Discovery-Erweiterung.** Der gemergte Stack bricht mit der Star-Logik der Tool-Landschaft: Der belegte Großteil der Einsparung kommt aus nativen Mechanismen, Prefix-Hygiene, Cache-Kohärenz und Disziplin („ein Owner pro Fläche"); die Tool-Schichten liefern – ehrlich gemessen – einstellige bis mittlere zweistellige Prozente der Rechnung, aber nur mit Messpflicht und Net-Win-Gate. Die drei harten Absagen (rtk, caveman, headroom-Default) sind der wertvollste einzelne Erkenntnisgewinn der Gesamtrecherche, weil sie gegen die virale Popularitäts-Rangliste stehen und durch unabhängige Messungen gedeckt sind.
