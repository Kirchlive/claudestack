## 14. Der empfohlene Stack — Kern-Stack und drei Profil-Varianten

Es gibt keinen einen besten Stack — es gibt einen Kern-Stack für alle und drei Profil-Varianten, die sich an der Workflow-Form entscheiden, nicht an der Tool-Neigung. Das ist die Synthese der Kapitel 2 bis 13: Die Token-Anatomie setzt die Prioritäten (Cache und Read-Disziplin vor Output-Filtern), die vier Spar-Mechanismen setzen die Reihenfolge (Vermeiden → Verlagern → Verdichten nur reversibel → Verbilligen), und die unabhängigen Messungen setzen die Besetzung (Ehrlichkeit schlägt Star-Zahl). Der Kern-Stack senkt vor allem Verschwendung und schützt den Prompt-Cache — der mit Abstand größte Dollar-Hebel; die Schichten mit Prozent-Claims (Filter 0–3 % bzw. 10–15 %, Session-Proxys 15–30 % Input bei langen Sessions) kommen mit ehrlichen Erwartungswerten und Messpflicht. Was nicht im Stack ist, ist ebenso entschieden — Abschnitt 14.4 nennt jede Absage mit ihrem Re-Evaluierungs-Trigger.

### 14.1 Architektur des Gesamt-Stacks: Verkettung und Konflikt-Matrix

Die Verkettung ist kausal, nicht dekorativ: Jede Schicht reduziert das, was die nächste noch behandeln muss. Was die Sandbox hält, muss kein Proxy komprimieren; was der Cache verbilligt, muss kein Filter retten.

```
0 Messung        ccusage + CodeBurn            → Baseline & Governance, spart nicht direkt
1 Env/Native     Stufe-0-Env, CLAUDE.md, /clear+HANDOFF   → Cache-Schutz, Vermeidung
2 Verhalten      ponytail                       → Output-Vermeidung (einziger Tier-1-Gewinn)
3 Filter         squeez ODER tokf (genau einer) → Bash-/Read-Output, Katastrophenschutz
4 MCP-Sandbox    context-mode; mcp-compressor ab ≥2 schweren MCPs → Output/Schema-Diät
5 Session        magic-compact; max. EIN cache-sicherer Proxy (llmtrim ODER tokdiet)
6 Formate        toonify-mcp (nur input-seitig) → strukturierte Tool-Results
7 Indizes        serena / codegraph / CRG       → situativ, projekt-lokal, ein Navigator
8 Memory         dateibasiert first; claude-mem optional; MemPalace nur subagent-scoped
9 Cache          cache-fix (Resume-/Lang-Session-Nutzer)  → größter $-Hebel bei Quota-Druck
10 Routing       CCR (main+think stark, background billig) → optional, Kosten-Hebel
```

Drei harte Regeln halten die Kette zusammen: genau **ein** Rewrite-Hook auf Schicht 3; genau **eine** Schema-Indirektion pro MCP-Server; genau **ein** BASE_URL-Proxy in der gesamten Kette — dieser eine Slot wird von llmtrim/tokdiet (Session-Kompression) *oder* cache-fix (Resume-Bugs) belegt, nie von zweien, und wer beides braucht, entscheidet anhand der eigenen Messung aus Schicht 0, welcher Verlust dominiert[^89^][^90^][^41^]. Zwei Proxys in Reihe brechen sich gegenseitig — Paritoks `[REF:id]`-Marker überleben keinen zweiten Kompressions-Durchgang, und jeder Prefix-verändernde Proxy multipliziert das Cache-Risiko[^19^][^27^].

| Konfliktpaar | Mechanismus des Konflikts | Auflösung |
|---|---|---|
| context-mode × token-optimizer-mcp | Doppelte Hook-/Sandbox-Pfade für denselben Output | Genau eines; context-mode hat FTS5 + Plattformbreite[^73^][^86^] |
| mcp-compressor × Paritok-Schemafilter / Edgee-TSR | Doppelte Schema-Indirektion auf demselben Server | Eine Schema-Schicht pro Server; nativ Tool Search ist die Gratis-Baseline[^15^][^27^] |
| Zwei BASE_URL-Proxys (llmtrim + tokdiet, Paritok + Edgee u. a.) | REF-Marker-Bruch, Prefix-Mutation kaskadiert | Maximal ein Proxy; Auswahl über Cache-Hit-Messung[^19^][^27^] |
| cache-fix × llmtrim/tokdiet | Beide belegen denselben BASE_URL-Slot | Ein Slot, Priorität nach dominierendem Verlust (Resume-Bugs vs. Session-Länge)[^41^] |
| headroom × Prompt-Cache | Issue #2438: gemessene 2–7× Kostensteigerung, falsche cache_hit-Telemetrie | Nicht im Stack bis Fix-Verifikation[^8^] |
| OmniRoute-Kompression × Prefix-Cache | Gateway-Kompression antagonistisch zum Prefix-Cache | Routing über CCR-Rollen statt Kompressions-Gateway[^124^][^134^] |
| Memory-MCPs global × Kontextbudget | 44–54 Tool-Definitionen ≈ 4,4–8,6k Tokens/Session vor der ersten Nachricht | Nie global; Subagent-Frontmatter oder projekt-lokale `.mcp.json`[^118^][^119^] |
| LLMLingua-2-Hooks × Code + Cache | Retrieval <50 % auf Code, nichtdeterministische Umformulierung bricht den Prefix | Kontraindiziert für Coding-Agenten[^135^] |

Die Matrix folgt einem einzigen Muster: Jeder Konflikt ist ein Streit zweier Komponenten um dieselbe Invariante — Byte-Stabilität des Prefix, Eindeutigkeit des Hook-Punkts, Einmaligkeit der Schema-Oberfläche. Wer das Muster erkennt, braucht die Tabelle nicht auswendig: Für jede neue Tool-Kombination genügt die Frage „Verletzen beide dieselbe Invariante?", und die Antwort fällt die Entscheidung. Zwei Regeln verdienen Hervorhebung. Erstens ist der BASE_URL-Slot die knappste Ressource des Stacks; er wird in der Praxis von vier Kandidaten (llmtrim, tokdiet, cache-fix, Paritok) umworben, und die Vergabe ist eine Messfrage, keine Glaubensfrage. Zweitens sind die Konflikte asymmetrisch: Eine doppelte Schema-Schicht kostet nur Effizienz, ein gebrochener Cache dreht das Vorzeichen der gesamten Ersparnis — deshalb steht die Cache-Hit-Rate über 90 % als Kennzahl Nummer eins über jeder Einzelkomponente[^19^][^8^].

### 14.2 Der Kern-Stack: Installation, Begründung, ehrlicher Erwartungswert

Der Kern-Stack gilt für jeden Nutzer, unabhängig von Session-Länge und Tarif. Er ist bewusst klein: sieben Pflichtkomponenten plus drei konditionale, jede mit eigenem Mechanismus und eigenem Erfolgskriterium.

| # | Komponente | Installation / Konfiguration | Mechanismus | Ehrlicher Erwartungswert | Confidence |
|---|---|---|---|---|---|
| 0 | ccusage + CodeBurn | `npx ccusage` Baseline; `codeburn optimize --apply`, `act report` nach ≥3 Tagen | Governance: realisiert schlägt geschätzt | Spart nicht direkt — Voraussetzung aller weiteren Entscheidungen | High[^34^][^35^] |
| 1 | Stufe-0-Env + Kontext-Disziplin | `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1`, Modell-Pinning + `DISABLE_LEGACY_MODEL_REMAP=1`, `MAX_MCP_OUTPUT_TOKENS`, CLAUDE.md <60 Zeilen + Compact-Instructions, `/clear`+HANDOFF | Vermeiden + Cache-Schutz | Größter $-Hebel des Stacks: ~1.800 Tokens/Call, Cache-Read 0,1× bleibt intakt; verhindert quadratische Replay-Kosten | High[^41^] |
| 2 | ponytail | Plugin/Skill installieren, dauerhaft aktiv | Vermeiden von Output (YAGNI) | −10,3 % Kosten, p=0,004 — einziger Tier-1-bestätigte Tool-Gewinn | High[^18^] |
| 3 | squeez (Alternative: tokf) | `npm i -g squeez && squeez setup`; `claude mcp add squeez -- squeez mcp` | Verlagern mit Retrieve, Net-Win-Gate | 0–3 % der Rechnung typisch, 10–15 % in test-/log-lastigen Sessions; Kernwert ist Katastrophenschutz | High (Schicht)[^69^][^24^] |
| 4 | context-mode | `/plugin marketplace add mksglu/context-mode`, `/plugin install context-mode@context-mode` | Vermeiden: Sandbox, nur stdout im Kontext; FTS5-Index überlebt /compact | Bis ~98 % auf Tool-Outputs (Hersteller-Benchmark); größter Preis/Leistungs-Eingriff, nur mit Hooks wirksam | Medium-High[^73^] |
| 5 | toonify-mcp | Plugin installieren, Auto-Trimmung via `updatedToolOutput` | Input-seitige Format-Kompression, Passthrough-Garantie | Klein und payload-abhängig: ~25–42 % nur gegen hübsches JSON; nie output-seitig einsetzen | Medium[^99^] |
| 6 | Dateibasiertes Memory | planning-with-files-Muster (task_plan/findings/progress.md) + HANDOFF-Disziplin | Vermeiden von Re-Orientierung | Resume nach /clear in 5,0 statt 13,3 Turns; null Tool-Definitionen, null API-Kosten | Medium-High[^123^] |
| K1 | mcp-compressor (konditional: ≥2 schwere MCPs) | `uvx mcp-compressor <server> --server-name <name>` | Schema-Kollaps auf 2–3 Wrapper-Tools | 70–97 % Schema-Reduktion; unter Schwelle überflüssig, weil natives Tool Search ~47 % liefert | Medium[^15^] |
| K2 | cache-fix (konditional: Resume-/Lang-Session, Quota-Druck) | Lokaler Proxy :9801; Forward-Modus bei CC ≥2.1.196-Feature-Bedarf | Fixt 3 CC-Cache-Bugs | Hit-Rate 94,66 vs. 92,44 %; verhindert $0,50/h → $5–10/h bei Resume | Medium-High[^41^] |
| K3 | Ein cache-sicherer Proxy: llmtrim ODER tokdiet (konditional: lange API-Sessions) | `ANTHROPIC_BASE_URL` auf den Proxy; Provider-Usage gegen Direktbetrieb prüfen | Verdichten, reversibel, cache-invariant | Teil des Session-Pakets: 15–30 % Input bei langen Sessions; tokdiet mit einzigem Qualitäts-A/B (66 Tasks, Parität) | Medium[^89^][^90^] |

Drei Lesarten sind für die Entscheidung wichtig. Erstens ist die Tabelle bewusst nicht additiv: Die Erwartungswerte überlappen sich, weil jede Schicht den Nenner der nächsten verkleinert — wer die Prozente summiert, belügt sich selbst. Die realistische Summenrechnung lautet: Der Kern-Stack beseitigt den Großteil der strukturellen Verschwendung (ungeschützter Cache, Rule-Re-Injektion, Tool-Output-Dumps, Re-Orientierung) und hält die Rechnung nahe am produktiven Minimum; die Prozent-Claims der Einzelschichten sind Hygiene, kein Rabattprogramm. Zweitens folgt die Installationsreihenfolge der Tabelle: Schicht 0 vor allem anderen, weil jede spätere Komponente nur gegen die Baseline verifizierbar ist — und weil CodeBurns realized-vs-estimated-Loop der einzige belastbare Nachweis ist, dass der Stack überhaupt spart[^35^]. Drittens tragen die konditionalen Zeilen ihre Aktivierungsregel gleich mit: mcp-compressor ohne zwei schwere MCP-Server, cache-fix ohne Resume-Nutzung und ein Proxy ohne lange Sessions sind nicht „halbe Empfehlungen", sondern Fehlallokationen — sie kosten Komplexität und belegen im Fall der Proxys den einzigen BASE_URL-Slot, ohne ihren Anwendungsfall zu haben[^89^][^41^].

### 14.3 Drei Profil-Varianten: Workflow-Form entscheidet

Die Befundlage trennt drei Profile sauber. Die Aktivierungsregel steht jeweils vor dem Werkzeug — wer das Profil falsch wählt, kauft Overhead statt Ersparnis.

| Profil | Wer | Aktivierungsregel | Zusatz zum Kern-Stack | Ehrlicher Erwartungswert |
|---|---|---|---|---|
| **A — Kurze Sessions / Klein-Projekte** | <~300 Dateien, Sessions <1–2 h, klar umrissene Tasks | Default, bis Messung Gegenteil zeigt | Nichts. Kein Proxy, kein Index, kein Memory-MCP | Verschwendungsvermeidung + Katastrophenschutz; einstellige Prozentwerte — mehr ist hier nicht drin[^14^] |
| **B — Lange Sessions / Power-User** | Max-Plan oder API, Mehr-Stunden-Sessions, CLI-/test-lastig | Regelmäßig >100k akkumulierter Kontext; Auto-Compact feuert | magic-compact; ein cache-sicherer Proxy (llmtrim/tokdiet; auf Abos rolling-context); cache-fix; Filter-Schicht voll | **15–30 % Input** bei langen Sessions; linearisierte statt quadratischer Kostenkurve[^29^][^89^][^90^][^14^] |
| **C — Multi-Provider / Budget-getrieben** | Anthropic-Quota regelmäßig erschöpft, echte Zweit-Provider-Strategie | Budget-Druck nach Ausschöpfung von Kern + B | CCR: `default`+`think` stark, `background`/Subagenten billig; Minimalvariante ohne Proxy: `CLAUDE_CODE_SUBAGENT_MODEL=haiku` | Token-Hebel wird Kosten-Hebel: Community-Angaben 50–99 % je Strategie — nur mit Tool-Calling-Smoke-Test und nativem Anthropic-Protokoll-Pfad[^124^] |

Die Matrix entschärft die beiden häufigsten Fehlentscheidungen des Feldes. Profil-A-Nutzer installieren typischerweise zu viel: rolling-context sagt selbst „short sessions are a wash", Indizes kosten bei kleinen Repos mehr als sie sparen, und jeder Proxy in einer 20-Minuten-Session ist reiner Overhead — Profil A ist die Disziplin des Weglassens[^14^]. Profil B ist das einzige Profil mit einem zweistelligen ehrlichen Erwartungswert, und der Wert entsteht aus dem Zusammenspiel: magic-compact erhält die Qualität des Verlaufs, der cache-sichere Proxy senkt den Prefix, cache-fix hält die Hit-Rate — einzeln installiert bleibt jede Komponente unter ihrem Potenzial[^29^][^41^]. Profil C schließlich verlagert die Optimierung von der Fenster- auf die Preisachse; das ist legitim, aber qualitätsbedingt — 193 offene Tool-Calling-Issues im CCR-Repo und der DeepSeek-#1378-Bruch zeigen, dass Billig-Routing im Hauptdialog die falsche Stelle zum Sparen ist[^124^]. Situative Komponenten (Indizes ab ~300 Dateien/breiten Fragen, Memory-MCPs ab ~4 Wochen Historie) gelten in allen drei Profilen gleich: projekt-lokal, minimales Manifest, ein Kandidat pro Funktion, Nachmessung nach zwei Wochen[^118^][^105^].

### 14.4 Was bewusst NICHT im Stack ist — und wann sich das ändert

Absagen sind hier keine Vernachlässigung, sondern Entscheidungen mit Prüfdatum. Jede trägt ihren Re-Evaluierungs-Trigger.

**rtk — nicht im Stack.** Drei offene Security-Befunde (#1155 Permission-Bypass, #3152 Allow-Pattern-Bruch, CVE-2026-33068 Credential-Exfiltration via `rtk proxy`) plus zwei unabhängige Negativ-Messungen (+7,6 % JetBrains, +18 % Issue-#582-Repro)[^68^][^2^]. *Trigger:* Schließen aller drei Issues plus unabhängige Neu-Messung mit Net-Win-Gate.

**caveman und die Terse-Welle — nicht im Stack.** 8,5 % gemessen statt 65 % beworben, dazu 12,5 % falsche Entscheidungen im Governor-Benchmark[^7^][^17^]. *Trigger:* unabhängiger Benchmark mit Qualitäts-Scorecard auf aktuellen Modellen.

**headroom — nicht im Stack.** Issue #2438 misst 2–7× Kostensteigerung in beiden Modi bei falscher `cache_hit`-Telemetrie[^8^]. *Trigger:* Schließen von #2438 plus eigener Verifikation der Provider-Felder (`cache_read` vs. `cache_creation`) gegen Direktbetrieb — nie der Proxy-Telemetrie allein.

**PNG-Encoding (pxpipe, OmniGlyph) — nicht im Stack.** Exaktheitsrisiko: 0–2/15 Hex-Recall auf Nicht-Fable-Modellen (Opus 5: 2/15, Sol/Grok: 0/15), stille Konfabulationen statt Lesefehler; offene Cache-Issues #210/#216[^92^]. *Trigger:* belegter exakter Identifier-Recall auf dem Produktivmodell und geschlossene #210/#216.

**LLMLingua-2-Hooks — nicht im Stack.** Bricht Code (Retrieval <50 %) und den Prefix-Cache[^135^]. *Trigger:* deterministischer, cache-stabiler Modus mit Coding-Benchmark.

**Globale Memory-MCPs — nicht im Stack.** 44–54 Tool-Definitionen (4,4–8,6k Tokens/Session) kaufen statischen Overhead vor jeder Ersparnis[^118^][^119^]. *Trigger:* Manifest-Reduktion auf ≤~15 Tools oder natives Scoping-Feature; bis dahin gilt Subagent-Frontmatter.

**token-reducer — nicht im Stack.** 90–98 %-Claim ohne jeden Beleg[^136^]. *Trigger:* unabhängige Messung.

**flightlesstux/prompt-caching — nicht im Stack.** Injiziert `cache_control` in Sessions, die Claude Code bereits selbst cached — explizit nicht für CC gedacht[^137^]. *Trigger:* dokumentierter CC-Support.

**tweakcc — nicht als Primärhebel.** Toolset-Patches sparen Prefix-Tokens, der dokumentierte Bruchzyklus bei jedem CC-Update (#861/#942/#872) macht sie zur Wartungsverpflichtung[^128^]. *Trigger:* stabile Patch-API oder native Toolset-Konfiguration; als kontrollierte Option mit Git-verwalteten Diffs bleibt es zulässig.

Damit ist der Stack vollständig entschieden — und unvollständig ohne seinen Betrieb. Kapitel 15 operationalisiert ihn: Der bash-dump-guard.mjs (Loop-Guard, Spill >2k, Dedup, niemals allow) und die Ladder-Eskalation (filtern → straffen → compact+Snapshot → clear+Handoff) machen aus der Installation ein Regelwerk. Kapitel 16 legt die Roadmap fest, inklusive der Watchlist (Paritok als ernstester Kandidat der Kleinmodell-Generation) und der Re-Evaluierungs-Termine für die Trigger aus 14.4.
