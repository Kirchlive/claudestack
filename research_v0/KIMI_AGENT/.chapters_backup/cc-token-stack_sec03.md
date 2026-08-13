## 5. Native Hebel und Konfiguration

Die größte Einzelersparnis im gesamten Token-Stack kostet keinen Cent und erfordert kein Dritt-Tool: Sie liegt in der Disziplin der eingebauten Mechanismen von Claude Code. Die Befundlage ist eindeutig — während die populärsten Kompressions-Tools im größten unabhängigen Replay (614 Mio. Tokens, 500 Sessions) kombiniert nur 3,7 % der Rechnung senkten, adressieren native Hebel die strukturellen Kostentreiber direkt: den 0,1×-Prompt-Cache, die Read-Ströme (≈78 % des Token-Verkehrs) und die Session-Länge.[^1^][^2^] Wer dieses Kapitel konsequent umsetzt, hat den Kern des Optimierungsproblems bereits gelöst; alles in den Folgekapiteln ist Ergänzung.

### 5.1 Kontext-Disziplin: Fenster als Budget behandeln

**CLAUDE.md: kurz aus Kostengründen, nicht aus Gehorsamsgründen.** Die Anthropic-Zielvorgabe lautet unter 200 Zeilen pro Datei — eine weiche Empfehlung, denn der oft zitierte Hard-Cap (200 Zeilen/25 KB) gilt für MEMORY.md, nicht für CLAUDE.md.[^3^] Der verbreitete Mythos „Claude liest nur die ersten 200 Zeilen" ist empirisch widerlegt: Eine Studie über 25–500 Zeilen fand keinen messbaren Unterschied in der Befolgung.[^3^] Die Konsequenz für die Entscheidung: CLAUDE.md gehört gekürzt, weil jede Zeile in jeder Session als gecachter Prefix mitläuft — nicht, weil lange Dateien ignoriert würden. Community-Praxis hat sich auf Root-CLAUDE.md unter 60 Zeilen mit nur dem eingependelt, was das Modell nicht selbst aus dem Code ableiten kann.[^3^][^4^] In dieselbe Datei gehört ein „Compact Instructions"-Block: eine stehende Keep/Summarize/Drop-Retention-Policy, die bei jeder Compaction als Default greift und verhindert, dass die Auto-Zusammenfassung Entscheidungen und offene Fehlerbilder verwässert.[^5^]

**Die .claude/rules-Falle.** Die verbreitete Empfehlung, Regeln in path-scoped Dateien unter `.claude/rules/` aufzuteilen, hat eine messbare Schattenseite: Rule-Files werden als `<system-reminder>` bei *jedem Tool-Call* neu injiziert. In einer dokumentierten Session mit elf Rule-Files und 30 Tool-Calls fraßen allein die Re-Injektionen 93.000 Tokens — 46 % des Kontextfensters (Issue #32057).[^4^] Das Urteil ist klar: Rule-Splitting nur mit aggressivem Path-Scoping und harter Zeilenobergrenze (3–5 Files à <30 Zeilen); wer Regeln global lädt, zahlt sie pro Tool-Call, nicht pro Session.

**Reset schlägt Kompression — und gesteuerte Kompression schlägt Auto-Compact.** Die Eskalationslogik lautet: `/clear` zwischen unverbundenen Tasks (Anthropic-Doku), kombiniert mit dem HANDOFF.md-Pattern — vor dem Reset schreibt das Modell Ziel, geänderte Dateien, Entscheidungen, failende Tests und den nächsten Schritt in eine Datei, aus der die Folgesession verlustfrei rehydratiert.[^5^][^6^] Innerhalb einer Aufgabe ist `/compact` mit expliziter Fokus-Instruktion (`/compact Focus on code samples and API usage`) die offiziell dokumentierte Steuerung der Summary; Auto-Compact (Default ab >95 % Fensterfüllung) feuert dagegen ohne saubere Task-Grenze und gehört per `/config` abgeschaltet bzw. kontrolliert.[^5^][^7^] Für fehlgeschlagene Versuche ist `/rewind` die cache-schonendste Option: Es schneidet auf einen bereits gecachten Prefix zurück statt den Verlauf umzuschreiben — `/compact` invalidiert den Cache, `/rewind` nicht.[^8^] Ergänzend erlaubt der `PreCompact`-Hook (Matcher `manual`/`auto`) einen deterministischen State-Snapshot unmittelbar vor der Kompression; Vorsicht bei der Konfiguration — ein blockierender PreCompact-Hook kann Compaction unmöglich machen und damit Datenverlust garantieren.[^6^][^9^]

| Kontext-Hebel | Mechanismus | Befund / Beleg |
|---|---|---|
| CLAUDE.md <200 Zeilen | Prefix-Größe pro Session | Anthropic-Zielvorgabe; Adherence-Mythos empirisch widerlegt — Kürzung ist Kostentreiber-Logik, nicht Aufmerksamkeits-Logik[^3^] |
| Compact-Instructions-Block | Stehende Retention-Policy für jede Compaction | Dokumentierter CLAUDE.md-Mechanismus; verhindert generische Template-Summaries[^5^] |
| `.claude/rules/` mit Path-Scoping | Regeln nur beim Arbeiten im Verzeichnis laden | Re-Injektion pro Tool-Call: 93k Tokens = 46 % Fenster gemessen (Issue #32057)[^4^] |
| `/clear` + HANDOFF.md | Voller Reset mit externem State | Anthropic empfiehlt `/clear` zwischen Tasks; Handoff-Datei macht Neustart verlustfrei[^5^][^6^] |
| `/compact [Fokus]` | Gelenkte Zusammenfassung | Offiziell dokumentierte Custom-Instructions[^5^] |
| `/rewind` | Rückschnitt auf gecachten Prefix | Cache-schonender als `/compact` (keine Prefix-Umschreibung)[^8^] |
| `PreCompact`-Hook | Deterministischer Snapshot vor Kompression | Matcher `manual`/`auto`; Block-Konfiguration als dokumentierte Falle[^6^][^9^] |

Die Tabelle ordnet die Hebel nicht zufällig von Datei- über Session- zu Lifecycle-Ebene: Die Kostenlogik verläuft in dieselbe Richtung. CLAUDE.md und Rule-Files wirken auf den statischen Prefix, der dank Cache zwar nur 0,1× kostet, aber bei jedem Cache-Bust und jedem ersten Turn voll zuschlägt — hier entscheiden Kilobytes über wiederkehrende Fixkosten. Die Session-Hebel (`/compact`, `/rewind`) wirken auf den wachsenden Verlauf, der den quadratischen Transcript-Replay treibt; `/rewind` ist die einzige Option, die den Verlauf verkürzt, ohne den Cache-Key zu verändern, und verdient deshalb den ersten Zugriff bei Fehlversuchen. Der Lifecycle-Block (`/clear`, Handoff, PreCompact) schließlich verhindert, dass Kontext überhaupt in die teuren Regionen jenseits der 95-%-Auto-Compact-Schwelle wächst. Für die Entscheidung heißt das: Wer nur einen Hebel einführt, beginnt mit dem HANDOFF-Pattern — es ersetzt die riskanteste Operation (Auto-Compact ohne Task-Grenze) durch eine deterministische und kostet pro Taskwechsel nur wenige hundert Output-Tokens.

### 5.2 Kosten- und Cache-Konfiguration: Der stille Hebel

**Cache-Ökonomie zuerst.** Cache-Reads kosten 10 % des Input-Preises, Writes 1,25× (5-min-TTL) bzw. 2× (1-h-TTL); das Referenz-Rechenbeispiel (40k-Prefix, 30 Turns, Opus) zeigt $6,30 ohne versus $1,13 mit intaktem Cache — 82 % Ersparnis.[^8^][^10^] Jede Prefix-Änderung zahlt die Write-Kosten erneut. Damit wird Env-Hygiene zur wichtigsten Konfigurationsmaßnahme des Reports:

**Stufe 0 — kostenlos, sofort, für jedermann:**[^11^]

- `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` — Claude Code injiziert live `git status` in den Systemprompt; jede Dateiänderung ändert damit den Prefix und bustet den Cache. Abschalten spart ~1.800 Tokens pro Call und stabilisiert den Prefix.[^11^]
- Modell-Pinning: `ANTHROPIC_MODEL` und `ANTHROPIC_SMALL_FAST_MODEL` explizit setzen, dazu `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` — verhindert stilles Modell-Remapping nach Updates; vom cache-fix-Projekt als „single most impactful flag" bezeichnet.[^11^]
- `MAX_MCP_OUTPUT_TOKENS` (Default 25.000) deckelt einzelne Tool-Outputs, bevor sie das Fenster fluten.[^12^]
- `CLAUDE_CODE_SUBAGENT_MODEL=haiku` pinnt Subagenten für Exploration und Log-Inspection auf das billige Modell, während der Hauptthread auf Sonnet bleibt — kostenloses Rollen-Splitting ohne Router.[^12^][^13^]

**Keine Mid-Session-Wechsel.** `/model`- und `/effort`-Wechsel, MCP-Server an-/abmelden und Claude-Code-Upgrades invalidieren den Cache jeweils vollständig; Modell- und Effort-Wahl gehören an den Sessionstart.[^8^][^14^]

**MCP-Diät.** MCP ist Lösung und Krankheit zugleich: Jedes Tool-Schema kostet ~1.000 Tokens, sieben Server summieren sich auf ~67.000 Tokens — vor der ersten Nachricht.[^12^] Drei Gegenmittel: Tool Search (inzwischen Default) senkte Gesamt-Tokens in MCP-lastigen Setups um ~47 %; ungenutzte Server per `/mcp` trennen (An/Aus wechselt die Tool-Liste und damit den Prefix — also sessionstabil halten); Nischen-Server in das `mcpServers`-Frontmatter eines Subagenten scopen statt global zu laden.[^12^]

**Subagenten-Ökonomie.** Subagenten isolieren Kontext — jeder pflegt ein eigenes Fenster und gibt nur eine Summary zurück —, multiplizieren aber das Token-Volumen um den Faktor ~7 gegenüber Single-Thread-Arbeit.[^15^] Sie sparen netto nur mit hart begrenzten Prompts („nur src/auth, max 15 Bullets, kein Repo-Scan"); pauschales Fan-out ist ein Kostenvervielfacher, kein Sparmechanismus.[^12^][^15^]

**Effort-Level und opusplan.** Der Effort-Level (low/medium/high) ist 2026 ein First-Class-Kostenhebel: Anthropic empfiehlt, low/medium großzügig als Primärkontrolle zu nutzen, sofern eigene Evals die Qualität bestätigen; Effort beeinflusst sämtliche Tokens inklusive Tool-Calls.[^14^] `/model opusplan` kombiniert Opus im Plan Mode mit Sonnet für die Ausführung und gilt als eine der kosteneffizientesten Arten, schweres Reasoning zu nutzen.[^16^] Beide Hebel teilen dieselbe Falle: Der Wechsel mitten in der Session invalidiert den Prompt-Cache und kann Thinking-Signaturen brechen — Effort- und Modellstrategie werden deshalb pro Session *einmal* festgelegt.[^8^][^14^]

| Konfiguration | Effekt | Befund / Beleg |
|---|---|---|
| `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` | ~1.800 Tokens/Call gespart; Prefix stabil | cache-fix-Projekt; git-status-Injektion als Cache-Brecher[^11^] |
| `ANTHROPIC_MODEL` / `ANTHROPIC_SMALL_FAST_MODEL` + `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` | Prefix-Stabilität über Updates | „single most impactful flag"[^11^] |
| `MAX_MCP_OUTPUT_TOKENS` (Default 25k) | Deckel für Tool-Outputs | MCP-Bloat-Messungen[^12^] |
| `CLAUDE_CODE_SUBAGENT_MODEL=haiku` | Exploration auf Billigmodell | Workflow-Guides; Minimalvariante des Rollen-Splittings[^12^][^13^] |
| Tool Search + Server-Scoping | −47 % Tokens in MCP-Setups; ~1k Tokens/Schema vermieden | Tool-Search-Messung; 7 Server ≈ 67k vor Nachricht 1[^12^] |
| Effort low/medium, `opusplan` | Kosten- und Latenzhebel | Anthropic-Empfehlung; opusplan als effiziente Opus-Nutzung[^14^][^16^] |
| Keine Mid-Session-Wechsel | Cache-Erhalt | Invalidatoren-Liste; Thinking-Signature-Bruch[^8^][^14^] |

Die Konfigurationstabelle unterscheidet bewusst zwei Wirkungsklassen. Die Env-Variablen der ersten vier Zeilen sind Set-and-forget-Maßnahmen: Sie kosten nichts, bergen kein Qualitätsrisiko und wirken ab dem nächsten Sessionstart — ihre kumulierte Wirkung (Git-Instructions, Remap-Schutz, Output-Deckel, Haiku-Subagenten) liegt erfahrungsgemäß über der jeder einzelnen Kompressions-Software, weil sie den 0,1×-Cache schützt, auf dem die gesamte Kostenstruktur langer Sessions ruht. Die unteren drei Zeilen sind dagegen Verhaltensregeln mit Messpflicht: MCP-Diät und Effort-Level verändern, was das Modell sieht und wie es arbeitet, und gehören deshalb in den Messrahmen aus Kapitel 4, bevor sie zum Default werden. Entscheidungsrelevant ist die Asymmetrie des Risikos: Stufe-0-Hygiene kann man blind übernehmen, alles darüber hinaus nur mit Cache-Hit-Rate als Pflichtmetrik — denn eine Konfiguration, die Tokens spart, aber den Cache bricht, optimiert am falschen Ende.

## 6. Verhaltens- und Output-Stil-Skills

Verhaltens-Skills sind die am meisten überbewertete und zugleich die am schlechtesten vermessene Schicht des Feldes. Die unabhängige JetBrains-Benchmark-Serie (SkillsBench, gepaarte A/B-Runs, Claude Sonnet 5) hat als bislang einzige Drittinstanz die populärsten Vertreter gegeneinander getestet — mit einem Ergebnis, das die Star-Rangliste als Wegweiser entwertet: Der am lautesten beworbene Skill (caveman, 98k★) liefert fast nichts, der meistgestartete (ponytail, 101k★) liefert den einzigen statistisch soliden Gewinn der gesamten Tool-Landschaft.[^17^][^18^][^19^]

### 6.1 Was wirkt: ponytail — und warum der Mechanismus zählt

**ponytail ist der einzige unabhängig bestätigte Gewinn unter allen getesteten Token-Tools.** Der Skill lässt den Agenten „wie den faulsten Senior-Dev" arbeiten — YAGNI-Prinzip, minimaler Code — und erreichte im JetBrains-Benchmark über 80 gepaarte Tasks: −15 % geschriebener Code, **−10,3 % Kosten (p=0,004)**, −11 % Zeit, ohne messbare Qualitätsdifferenz.[^18^] Die Eigenmessung des Projekts (−54 % Code, −22 % Tokens auf zwölf Feature-Tasks) liegt über dem unabhängigen Wert, ist aber ungewöhnlich ehrlich kalibriert — das README hat eine frühere 80–94-%-Single-Shot-Zahl selbst als Baseline-Artefakt korrigiert.[^20^] Entscheidend ist der Mechanismus: ponytail *vermeidet* Tokens, statt sie nachträglich zu komprimieren. Ungeschriebener Code erzeugt keine Output-Tokens, keine Folge-Edits, keine Debug-Schleifen — der Hebel greift am Anfang der Kostenkette, nicht am Ende, und ist deshalb zu jedem Filter- und Cache-Stack komplementär stapelbar.[^18^][^20^]

**karpathy-skills dagegen ist trotz 202.000 Sternen ungemessen.** Das Plugin kodiert vier Prinzipien gegen LLM-Fehlmodi (stille Annahmen, Over-Engineering, unbeabsichtigte Änderungen, fehlende Erfolgskriterien) und macht keinen expliziten Token-Claim; der indirekte Spareffekt über weniger Over-Engineering ist plausibel, wurde aber nie quantifiziert, und die Wartungsmetriken (Agentiquette 61/100, 125 offene Issues, seit April 2026 ohne Push) raten zur Vorsicht.[^21^] Konsequenz: Als Qualitäts-CLAUDE.md einsetzbar, als Token-Maßnahme nicht einplanbar.

### 6.2 Warnstudien und die disziplinierte Alternative

**caveman ist die Lehrstudie des Feldes.** Beworben mit 65 % Output-Ersparnis, maß JetBrains auf agentischen Tasks 8,5 % — die Decke bei erzwungener Aktivierung, nicht der Alltag; die Gesamtrechnung stieg in einem Lauf sogar um 11,6 % (Long-Context-Tier-Ausreißer).[^17^] Der Governor-Benchmark dokumentiert zusätzlich das Qualitätsrisiko: 69,1 % Token-Ersparnis erkauft mit einer Valid-Context-Loss-Ratio von 0,14 und **12,5 % falschen Entscheidungen**.[^22^] Das inzwischen gewachsene caveman-Ökosystem (Caveman 2 mit Proxy-basierter Input-Kompression, ~46 % auf CLAUDE.md-Inputs) verschiebt das Problem nur: Der Skill kostet selbst 1–1,5k Input-Tokens pro Turn, und jede Prefix-verändernde Kompression gefährdet den Cache — das Projekt führt die 8,5-%-JetBrains-Zahl mittlerweile selbst im README.[^23^][^24^]

**Die Terse-Welle ist eine Nische, kein Programm.** Nach caveman entstand 2026 ein Subgenre knapper Output-Styles: beeline (benchmarked Merge aus caveman und i-have-adhd), taxman (Filler-/Preamble-Schnitt), carlosduplars native Output-Styles (~40 % weniger Output-Tokens behauptet) und faa-speak (FAA-Funkstil, ~53 % gemessen, mit on-device Re-Expansion via Apple Intelligence).[^25^][^26^] Gemeinsam ist allen: einstellige bis keine Adoption (0–17 Sterne), keine unabhängige Messung, und sie adressieren nur die Output-Seite — die bei Coding-Agenten den kleinsten Anteil der Rechnung ausmacht. Sie sind als stilistische Präferenz legitim, als Kostenstrategie irrelevant.

**Governor und die valorisa-Skills zeigen die disziplinierte Alternative.** Governor komprimiert content-aware statt pauschal: Tool-Output wird nur kondensiert, wenn mehr als 40 % der Zeilen Duplikate sind (Test-Failures, Log-Spam); einzigartige Daten passieren ungefiltert. Ergebnis im direkten Vergleich: 45,5 % Ersparnis bei VCLR 0,00 und 100 % erhaltenen Entscheidungen — gegen cavemans 12,5 % Fehlrate.[^22^] Im Multi-Turn-Pilot: −8,0 % Output-Tokens, −4,6 % Kosten, ohne Regression.[^22^] Die valorisa-Skill-Sammlung ergänzt die Verhaltensseite: `rescue-tokens` erkennt neun Token-Trap-Patterns und verkürzte Antworten in der Eigenmessung von 950 auf 97 Wörter (−90 %); `spec-driven` erzwingt eine Pipeline mit expliziten Token-Budgets; `token-optimization` berichtet selbst $750→$100 pro Monat (−85 %, nicht unabhängig verifiziert).[^27^]

| Skill | Behauptet | Unabhängig gemessen | Qualitätsrisiko | Urteil |
|---|---|---|---|---|
| ponytail (101k★) | −22 % Tokens, −20 % Kosten | −10,3 % Kosten (p=0,004), −15 % Code, keine Qualitätsdifferenz[^18^] | Nicht nachgewiesen | **Einziger bestätigter Gewinn — Standard** |
| karpathy-skills (202k★) | Kein Token-Claim | Ungemessen[^21^] | Unbekannt | Qualitäts-Skill, kein Spar-Hebel |
| caveman (98k★) | 65 % Output | 8,5 % (JetBrains); 12,5 % Fehlentscheidungen (Governor)[^17^][^22^] | VCLR 0,14; Cache-Gefährdung bei Input-Kompression | Warnstudie — nicht einsetzen |
| beeline / taxman / faa-speak / Output-Styles | 40–53 % Output | Keine unabhängige Messung[^25^][^26^] | Unbekannt | Nische, stilistische Option |
| Governor | 45,5 % bei VCLR 0,00 | Eigenbenchmark mit sauberem Design; Pilot −4,6 % Kosten[^22^] | Nicht messbar (unique data pass-through) | Referenzdesign für Filter |
| valorisa-Skills | −90 % Antwortlänge; −85 % Kosten | Nur Eigenmessung[^27^] | Gering (Pattern-basiert) | Pilotierbar, verifizieren |

Die Tabelle macht das strukturelle Muster sichtbar, das über alle Verhaltens-Skills hinweg gilt: Wirksamkeit korreliert mit dem Mechanismus, nicht mit der Verbreitung. Vermeidungs-Skills (ponytail) schlagen Stil-Skills (caveman, Terse-Welle), weil sie den Token gar nicht erst erzeugen lassen; content-aware Filter (Governor) schlagen pauschale Verdichter, weil sie Information nur dort opfern, wo sie redundant ist. Zugleich bleibt die Evidenzlage dünn — außer ponytail hat kein einziger Verhaltens-Skill eine unabhängige Messung vorzuweisen, und selbst der bestätigte Effekt (−10,3 %) ist kleiner als eine einzige Woche konsequenter Cache-Hygiene. Die Entscheidung folgt daraus direkt: ponytail als Default-Skill übernehmen, Governor-Mechanik als Designreferenz für die Output-Filter in Kapitel 7 nutzen, caveman und die Terse-Welle nicht einsetzen — und jeden weiteren Verhaltens-Skill erst nach einer eigenen gepaarten Messung im Rahmen von Kapitel 4 aktivieren.

### Quellen dieses Kapitels

**Kapitel 5:**

[^1^]: capitalandcompute.net — „Do Claude Code Token-Saving Tools Actually Cut Your Bill?" (2026-08-06), 614M-Token-Replay, 3,7 % kombinierte Ersparnis. https://capitalandcompute.net/blog/claude-code-token-saving-tools-rtk-headroom-caveman/
[^2^]: juejin.cn — „Token压缩工具实测：614M数据告诉你90%节省承诺有几分真" (2026-06-22), 22 %/78 %-Analyse des Token-Stroms. https://juejin.cn/post/7653703276806012947
[^3^]: alexdunlop.com — „CLAUDE.md Best Practices: What the Evidence Supports (2026)" (2026-08-12), 200-Zeilen-Mythos, 25–500-Zeilen-Studie, Root-<60-Zeilen-Praxis. https://www.alexdunlop.com/writing/claude-md-best-practices
[^4^]: abhishekray07/claude-md-templates — principles.md, Rule-File-Re-Injektion 93K Tokens/46 % Fenster (Issue #32057), 3–5 Rule-Files à <30 Zeilen. https://github.com/abhishekray07/claude-md-templates/blob/main/principles.md
[^5^]: Anthropic Docs — „Manage costs effectively" (abgerufen 2026-08-13): `/clear` zwischen Tasks, `/compact`-Custom-Instructions, CLAUDE.md-Summary-Instructions, Auto-Compact >95 %. https://docs.anthropic.com/s/claude-code-cost
[^6^]: nathanonn.com — „Never Let Claude Code Auto-Compact Again" (2026-05-01), HANDOFF.md-Pattern, compact/clear/rewind-Abgrenzung. https://www.nathanonn.com/claude-code-never-auto-compact/
[^7^]: hidekazu-konishi.com — „Claude Code Compaction and Long-Session Operations Guide" (2026-06-14), `/compact [instructions]`, PreCompact-Hook, Auto-Compact-Timing-Kritik. https://hidekazu-konishi.com/entry/claude_code_compaction_and_long_session_guide.html
[^8^]: sup3x/claude-code-eco — docs/token-optimization-guide.md (2026-07-02), Cache-Invalidatoren, `/rewind` als cache-schonende Zwischenstufe. https://github.com/sup3x/claude-code-eco/blob/main/docs/token-optimization-guide.md
[^9^]: MemPalace/mempalace Issue #856 — blockierender PreCompact-Hook macht Compaction unmöglich. https://github.com/MemPalace/mempalace/issues/856
[^10^]: buildthisnow.com — „Claude Code Prompt Caching" (2026-06-15), 82 %-Rechenbeispiel, TTLs. https://www.buildthisnow.com/blog/guide/development/claude-code-prompt-caching
[^11^]: cnighswonger/claude-code-cache-fix — README v4.0.0, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1` ~1.800 Tokens/Call, Modell-Pinning, `CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP=1` („single most impactful flag"). https://github.com/cnighswonger/claude-code-cache-fix
[^12^]: composio.dev — „9 Ways to Cut Token Consumption in Claude Code" (2026-05-29), MCP-Steuer (~1k Tokens/Schema, 7 Server ≈ 67k, Tool Search −47 %, `MAX_MCP_OUTPUT_TOKENS`), Subagent-Modell-Pinning, hart begrenzte Subagent-Prompts. https://composio.dev/content/ways-to-cut-token-consumption-in-claude-code
[^13^]: andrewbaker.ninja — „How to run Claude Code on OpenRouter and DeepSeek: the ANTHROPIC_BASE_URL guide" (2026-08-10), `CLAUDE_CODE_SUBAGENT_MODEL` als Minimalvariante des Rollen-Splittings. https://andrewbaker.ninja/2026/08/10/how-to-run-claude-code-on-openrouter-and-deepseek-the-anthropic_base_url-guide/
[^14^]: agiflow.io — „Claude Code on Opus 5" (2026-07-25), Effort-Semantik, low/medium-Empfehlung, Cache-Invalidierung bei Wechsel. https://agiflow.io/blog/claude-code-opus-5-subscription-guide
[^15^]: nimbalyst.com — „Claude Code Subagents: A Practical 2026 Guide" (2026-05-05), ~7× Token-Volumen, Kontext-Isolation. https://nimbalyst.com/blog/claude-code-subagents-guide/
[^16^]: buildthisnow.com — „Claude Code Pricing" (2026-05-03), opusplan-Empfehlung. https://www.buildthisnow.com/blog/guide/development/claude-code-pricing

**Kapitel 6:**

[^17^]: JetBrains AI Blog — „Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test" (2026-07-16), 8,5 % gemessen, +11,6 %-Ausreißer. https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/
[^18^]: JetBrains AI Blog — „Ponytail Skill for Claude Code: Does It Really Cut Tokens" (2026-07-28), −10,3 % Kosten (p=0,004), −15 % Code, −11 % Zeit, keine Qualitätsdifferenz. https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/
[^19^]: JetBrains AI Blog — „Does 'rtk' skill really cut agent tokens by 60–90%? We tested it" (2026-07-20), SkillsBench-Methodik der Serie. https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
[^20^]: DietrichGebert/ponytail — README/Benchmarks, −54 % Code/−22 % Tokens Eigenmessung, Selbstkorrektur der 80–94-%-Zahl (Issue #126). https://github.com/DietrichGebert/ponytail
[^21^]: multica-ai/andrej-karpathy-skills — README; Agentiquette-Score 61/100; Nic's notes, „Karpathy Claude Code Skills" (2026-08-10). https://github.com/multica-ai/andrej-karpathy-skills ; https://notes.nicolasdeville.com/github/karpathy-skills ; https://www.agentiquette.com/index/repos/karpathy-skills
[^22^]: 0xhimanshu/governor — GitHub-README (2026-05-01), V2-Sonnet-Benchmark (Caveman 69,1 %/VCLR 0,14/12,5 % vs. Governor 45,5 %/0,00/0 %), Multi-Turn-Pilot (−8,0 % Output, −4,6 % Kosten), >40 %-Duplikat-Filtermechanik. https://github.com/0xhimanshu/governor
[^23^]: JuliusBrussee/caveman — README + Release v1.10, 65-%-Claim, 1–1,5k Input-Tokens/Turn Selbstkosten, JetBrains-8,5-%-Aufnahme. https://github.com/JuliusBrussee/caveman
[^24^]: ArceApps Blog — „Caveman: The Skill That Teaches AI Agents to Shut Up" (2026-06-20), Caveman-2-Input-Kompression (~46 % auf CLAUDE.md-Inputs). https://arceapps.com/blog/caveman-skill-token-compression/
[^25^]: GitHub-Repos: iceHub82/beeline; johnsnow1011/taxman; vliggio/claude-faa-speak (~53 % gemessen, Apple-Intelligence-Re-Expansion). https://github.com/iceHub82/beeline ; https://github.com/johnsnow1011/taxman ; https://github.com/vliggio/claude-faa-speak
[^26^]: carlosduplar/caveman-output-style-claude-code — native Output-Styles, ~40 % weniger Output-Tokens (behauptet). https://github.com/carlosduplar/caveman-output-style-claude-code
[^27^]: valorisa/Claude-Skills — README (2026-08-08), rescue-tokens 9 Patterns (950→97 Wörter), spec-driven Token-Budgets, token-optimization $750→$100 (selbstberichtet). https://github.com/valorisa/Claude-Skills
