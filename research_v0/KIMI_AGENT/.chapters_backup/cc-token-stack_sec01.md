## 1. Auftrag, Methode und Evidenz-Standard

### 1.1 Auftrag und Abgrenzung

Dieser Report beantwortet eine Frage: Wie sieht der bestmögliche kombinierte Stack zur Token-Minimierung für Claude Code aus, wenn man alles zur Verfügung hat, was das Open-Source-Feld 2026 hervorgebracht hat? Das Ergebnis ist ein Konzept — ein Set aus kompatiblen Komponenten, Aktivierungsregeln und einem Regelwerk —, keine Bestandsaufnahme. Was ein konkreter Nutzer heute installiert hat, ist für die Empfehlung nicht maßgebend; maßgebend ist, was unter unabhängiger Messung wirkt.

Der Untersuchungsgegenstand ist vollständig: alle Repository-Klassen, die Tokens minimieren — PreToolUse-/PostToolUse-Hooks, Proxys, MCP-Server, Skills und Plugins, Datenformate, Session-Kompressoren sowie die nativen Hebel von Claude Code selbst (Cache-Steuerung, Compaction, Effort-Level, CLAUDE.md-Disziplin). Ausgeschlossen sind Werkzeuge, die Tokens nur verpacken statt reduzieren (Repo-Dumper) oder Kosten über Modell-Routing senken, ohne das Token-Volumen anzufassen; beide Klassen werden dort markiert, wo sie im Feld mit Token-Tools verwechselt werden.

Die Methode folgt diesem Anspruch an Vollständigkeit und Prüfbarkeit. Sechs parallel laufende Wide-Research-Facetten haben zunächst die 31 bekannten Ausgangs-Repos einzeln verifiziert, einen Lesezeichen-Ordner mit 108 Links vollständig kategorisiert und vier unabhängige Breitensuchen über das Claude-Code-Ökosystem, die allgemeine LLM-Kompressionslandschaft, angrenzende Kategorien (Memory, Code-Intelligence, Messung) sowie Community-Best-Practices durchgeführt. Darauf aufbauend haben acht Deep-Dive-Dimensionen — je eine pro Stack-Schicht — die READMEs von rund 70 Repositories vollständig gelesen, Metadaten über die GitHub-API vermessen und die offenen Issue-Tracker auf sicherheits- und qualitätsrelevante Befunde durchsucht. Eine anschließende Cross-Verification hat alle Aussagen in Vertrauensstufen einsortiert und widersprüchliche Messungen als Konfliktzonen analysiert statt geglättet[^3^][^4^].

Drei Gründe machen diesen Auftrag nicht trivial. Erstens ist das Feld laut: Die sichtbarsten Projekte erreichen 66.000 bis 101.000 GitHub-Sterne[^1^], und ihre READMEs versprechen 60–95 % Ersparnis. Zweitens ist das Feld widersprüchlich: Derselbe Tool-Stack spart in der einen Produktionsmessung 1,5 Milliarden Tokens pro Monat und verteuert in der anderen die Rechnung um 7,6 %[^2^][^3^]. Drittens ist das Feld jung: Die meisten Benchmarks sind Eigenmessungen der Hersteller, und erst seit Mitte 2026 existiert mit der JetBrains-Serie und dem codepointer-Replay unabhängige Gegenrechnung[^3^][^4^]. Wer hier nach Sternezahlen priorisiert, baut den schlechtesten Stack.

### 1.2 Evidenz-Standard

Der Report arbeitet deshalb mit einem dreistufigen Evidenz-Standard, den jede nachfolgende Bewertung durchläuft:

- **Tier 1 — Unabhängig gemessen.** Mindestens zwei voneinander unabhängige, konsistente Belege oder ein fremder Benchmark mit offengelegter Methodik (gepaarte A/B-Runs, Kontaminationskontrolle, Signifikanzangabe). Beispiel: die JetBrains-Serie auf SkillsBench mit 86 gepaarten Tasks[^4^]. Tier-1-Befunde werden in diesem Report als Fakten behandelt.
- **Tier 2 — Dokumentiert und reproduzierbar.** Eigenmessung des Herstellers mit nachvollziehbarer Methodik, committeten Daten oder wiederholbarem Skript. Tier-2-Befunde werden als plausible Arbeitshypothesen geführt und mit dem Hersteller-Vorbehalt gekennzeichnet.
- **Tier 3 — Behauptet.** Marketing-Claim ohne Prüfpfad. Tier-3-Zahlen erscheinen nur als Kontrastfolie, niemals als Entscheidungsgrundlage.

Zwei Prüfregeln ergänzen die Stufen. Die erste betrifft den Nenner: Ersparnis pro Payload ist nicht Ersparnis pro Rechnung. Ein Filter, der einen `npm install`-Output um 90 % kürzt, kann an der Monatsrechnung unsichtbar bleiben, weil die komprimierbaren Payloads einen kleinen Anteil des Gesamtstroms ausmachen. Das codepointer-Replay — 614 Millionen Tokens realer Claude-Code-Sessions, nachgespielt gegen den beworbenen Referenz-Stack — quantifiziert die Lücke: rtk, headroom und caveman zusammen erreichten 3,7 % der Rechnung, nicht 60–95 %[^3^][^5^]. Deshalb gilt im ganzen Report: Kompressionsraten werden nur mit dem jeweiligen Nenner angegeben, und Stack-Erwartungswerte werden auf der Rechnungsebene formuliert.

Die zweite Regel betrifft die viralen Defaults. Die drei meistinstallierten Spar-Tools des Feldes — rtk, caveman, headroom — sind zugleich die drei mit den schärfsten Claim-Realitäts-Lücken: rtk (76k★) wurde in der JetBrains-Messung um 7,6 % teurer statt 60–90 % billiger und räumt im eigenen README ein, Output-Kürzung sei „not the same as cutting your bill"[^4^][^6^]; caveman (98k★) erreichte 8,5 % statt 65 %[^7^]; headroom (66k★) steht mit einem offenen Issue in der Kritik, in gemessenen A/B-Läufen den Prompt-Cache zu brechen und die Kosten um das Zwei- bis Siebenfache zu erhöhen[^8^]. Kapitel 2.3 legt diese Messungen vollständig dar. Die Konsequenz für die Methode: Kein Tool erhält aufgrund von Verbreitung einen Vertrauensvorschuss; jeder virale Default wird gegen Tier-1-Evidenz neu bewertet, bevor er in den Stack aufgenommen, ersetzt oder verworfen wird.

Die Bedeutung für die Lektüre: Die Fußnoten in diesem Report sind keine Dekoration, sondern das Prüfprotokoll. Aussagen ohne Tier-1- oder Tier-2-Beleg werden ausdrücklich als offen markiert — und genau diese Markierung entscheidet später, welche Stack-Komponenten als Kern gelten und welche auf der Watchlist bleiben.

### Quellen dieses Kapitels

[^1^]: GitHub REST API — Repository-Metadaten (Sternezahlen rtk 75.916, caveman 97.774, headroom 66.087, ponytail 101.498), abgerufen 2026-08-13 — https://api.github.com/repos/
[^2^]: andrewpatterson.dev — „Token Compression for Claude Code with RTK + Headroom" (1,5 Mrd. Tokens, $3.808, 96 % Cache-Hit), 2026-04-18 — https://andrewpatterson.dev/posts/token-savings-rtk-headroom/
[^3^]: capitalandcompute.net — „Do Claude Code Token-Saving Tools Actually Cut Your Bill?" (codepointer-Replay: 3,7 % kombiniert auf $926), 2026-08-06 — https://capitalandcompute.net/blog/claude-code-token-saving-tools-rtk-headroom-caveman/
[^4^]: JetBrains AI Blog — „Does 'rtk' skill really cut agent tokens by 60–90%? We tested it" (86 gepaarte Tasks, +7,6 % bei low effort), 2026-07-20 — https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
[^5^]: ArceApps Blog — „RTK vs Caveman: real token savings in AI agents" (614M-Token-Replay: headroom 2,8 %, rtk 0,5 %, caveman 0,4 %), 2026-07-15 — https://arceapps.com/blog/rtk-vs-caveman-token-savings/
[^6^]: rtk README — „not the same as cutting your bill"; Soba-Labs-Gegenmessung — https://github.com/rtk-ai/rtk
[^7^]: JetBrains AI Blog — „Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test" (8,5 % gemessen), 2026-07-16 — https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/
[^8^]: headroom Issue #2438 — „Proxy defeats Anthropic prompt caching (measured 2–7× cost increase)" — https://github.com/headroomlabs-ai/headroom/issues/2438

## 2. Die Anatomie des Token-Verbrauchs

Der Token-Verbrauch einer Claude-Code-Session folgt einer festen Anatomie — und genau diese Anatomie erklärt, warum die populärsten Spar-Tools an der Rechnung fast nichts verändern: Sie zielen auf den kleinsten Kostenblock. Wer die Blöcke und ihre Größenordnungen kennt, kann jedes Werkzeug in diesem Report in Sekunden einordnen, ohne ein einziges README zu lesen. Dieses Kapitel liefert dafür das Begriffsgerüst, auf dem alle folgenden Kapitel aufbauen: fünf Kostenblöcke, vier Spar-Mechanismen und eine Trennlinie — die Cache-Kohärenz.

### 2.1 Die fünf Kostenblöcke

Fünf Blöcke machen praktisch den gesamten Token-Strom aus. **Erstens Systemprompt und Tool-Schemas:** Bevor die erste Nutzernachricht gelesen wird, belegt Claude Code typischerweise 15.000–35.000 Tokens mit Systemprompt, Builtin-Tool-Beschreibungen, CLAUDE.md und Skill-Metadaten[^9^]; ein vielgeteilter Vergleich maß 33.000 Tokens vor dem ersten Prompt[^10^]. Jeder MCP-Server addiert rund 1.000 Tokens pro Tool-Schema — sieben Server summieren sich auf etwa 67.000 Tokens, eine dokumentierte Community-Messung fand 81 exponierte Tools mit 143.000 Tokens, das sind 72 % eines 200k-Fensters[^11^][^12^]. **Zweitens File-Reads und Discovery:** Der größte native Strom. Rund 78 % des Tool-Traffics laufen über die eingebauten Werkzeuge Read, Grep und Glob — sie passieren keinen CLI-Filter[^13^]. **Drittens Bash-/CLI-Output:** nur etwa 22 % des Stroms[^13^] — ausgerechnet der Block, den die viralsten Tools adressieren. **Viertens Transcript-Replay:** Claude Code sendet pro Turn die gesamte Konversation erneut; ohne Begrenzung wachsen die Session-Kosten damit quadratisch in der Sessionlänge[^14^]. **Fünftens der eigene Output** des Modells, der zum rund Fünffachen des Input-Preises abgerechnet wird[^15^].

Über alle Blöcke spannt sich die Cache-Ökonomie: Der Prompt-Cache macht Wiederhol-Lesungen des Prefix billig — Cache-Reads kosten das 0,1-Fache des Input-Preises, Cache-Writes das 1,25-Fache (5-Minuten-TTL) bis 2-Fache (1-Stunde-TTL)[^11^][^16^]. Ein durchgerechnetes Beispiel (40k-Prefix, 30 Turns, Opus) zeigt die Größenordnung: $6,30 ohne gegenüber $1,13 mit Cache — rund 82 % der Input-Kosten hängen an dieser einen Mechanik[^16^].

| Kostenblock | Typischer Anteil | Haupttreiber | Direkter Zugriff |
|---|---|---|---|
| Systemprompt + Tool-Schemas | 15–35k Basis, bis 72 % des Fensters | MCP-Server (~1k Tokens/Schema), Rule-Files, CLAUDE.md | Schema-Diät, Tool Search, Budget-Regeln |
| File-Reads / Discovery | ~78 % des Tool-Stroms | Read/Grep/Glob auf große Dateien | Read-Clamps, Indizes, deny-Guards |
| Bash-/CLI-Output | ~22 % des Tool-Stroms | Test-Logs, Builds, Package-Manager | Output-Filter, Sandbox, Truncate-Guards |
| Transcript-Replay | Multiplikator über alle Turns | Prefix wächst pro Turn; Kosten quadratisch | Prefix-Cap, Compaction, Cache-Hygiene |
| Eigener Output | ~5× Input-Preis je Token | Geschwätzigkeit, Over-Engineering | Verhaltens-Skills, Effort-Level |

Die Tabelle ordnet die Blöcke nach Hebelgröße — und invertiert damit die Popularity-Rangliste des Feldes. Die beiden kleinsten Blöcke (Bash-Output, eigener Output) sind diejenigen, für die die meisten Werkzeuge existieren; die beiden größten (Discovery-Strom, Replay-Multiplikator) werden von kaum einem viralen Tool angefasst. Für die Stack-Architektur folgt daraus eine harte Priorisierungsregel: Maßnahmen werden nach ihrem Anteil am Token-Strom gewichtet, nicht nach Sichtbarkeit. Ein Werkzeug, das den 22-%-Block um die Hälfte kürzt, leistet weniger als eine Cache-Hygiene, die den Replay-Multiplikator um den Faktor zehn verbilligt — und beides ist weniger wert als eine Read-Disziplin, die den 78-%-Block erst gar nicht entstehen lässt. Diese Reihenfolge trägt die Kapitel 3 bis 15.

### 2.2 Die vier Spar-Mechanismen

„Kompression" ist das falsche Frame für dieses Feld. Tatsächlich existieren vier mechanistisch verschiedene Wege, Tokens zu reduzieren — mit unterschiedlichen Obergrenzen, Risiken und Erfolgskriterien:

| Mechanismus | Prinzip | Ceiling | Hauptrisiko | Erfolgskriterium |
|---|---|---|---|---|
| **Vermeiden** | Token entsteht gar nicht (Sandbox, Read-Clamps, Plan Mode, deny-Guards) | Höchster | Kein Qualitätsrisiko | Geblockte Tokens, null Regression |
| **Verlagern** | Token verlässt das Fenster, bleibt abrufbar (Spill-Files, FTS5-Index, Retrieve-Marker) | Hoch | Retrieve-Disziplin fehlt | Retrieve-Rate bei erhaltener Qualität |
| **Verdichten** | Information geht verloren (Summaries, LLMLingua, Terse-Personas) | Niedrig | Stille Fehlentscheidungen | Qualitäts-A/B mit Signifikanz |
| **Verbilligen** | Gleiche Tokens, billiger (Cache-Hygiene, Routing, Effort-Level) | Rechnung, nicht Fenster | Cache-Bruch dreht das Vorzeichen | Cache-Hit-Rate > 90 % |

Die Interpretation dieser Matrix ist die strategische Kernsache des Reports. Vermeiden und Verlagern sind qualitätsneutral, weil keine Information zerstört wird — was nicht im Fenster steht, kann nicht falsch erinnert werden, und was abrufbar ausgelagert ist, bleibt exakt rekonstruierbar. Verdichten ist der einzige Mechanismus mit dokumentiertem Qualitätsschaden: Im Governor-Benchmark produzierte das aggressive Verdichtungs-Setup 12,5 % falsche Entscheidungen bei einer Valid-Context-Loss-Ratio von 0,14[^17^]. Verbilligen schließlich wirkt auf einer anderen Achse — es verkleinert nicht das Fenster, sondern die Rechnung — und ist zugleich der Mechanismus mit dem größten belegten Einzeleffekt (82 % im Cache-Rechenbeispiel)[^16^]. Daraus ergibt sich die Bewertungslogik für jedes Kandidaten-Tool: Erst den Mechanismus bestimmen, dann gegen das Erfolgskriterium des Mechanismus prüfen. Ein Verdichter ohne Qualitätsbenchmark ist kein Sparmodell, sondern eine Wette; ein Verlagerer ohne funktionierenden Retrieve-Pfad ist kein Verlagerer, sondern ein Verdichter in Verkleidung. Die Stack-Empfehlung folgt konsequent der Reihenfolge Vermeiden → Verlagern → Verdichten (nur reversibel) → Verbilligen.

### 2.3 Advertised vs. Real: Was unabhängige Messung zeigt

Die wichtigste empirische Tatsache des Feldes: Unabhängige Messung invertiert die Rangliste. Vier Zahlenpaare tragen diese Erkenntnis — und keines stammt vom Hersteller.

![Beworben vs. gemessen: rtk, caveman, ponytail, headroom](chart_advertised_vs_real.png)

*Abbildung: Hersteller-Claims gegen unabhängige Messungen. Quellen: JetBrains-Serie (rtk, caveman, ponytail)[^20^][^21^][^22^], codepointer-Replay (headroom)[^18^][^19^].*

Das **codepointer-Replay** spielte 614 Millionen Tokens realer Sessions (Baseline ≈ $926) gegen den beworbenen Referenz-Stack nach: rtk, headroom und caveman kombiniert sparten **3,7 % der Rechnung** — headroom 2,8 %, rtk 0,5 %, caveman 0,4 %[^18^][^19^]. Die **JetBrains-Serie** (SkillsBench, gepaarte A/B-Runs) ergänzt das Bild: rtk wurde bei niedrigem Reasoning-Effort **7,6 % teurer** statt 60–90 % billiger (bei hohem Effort ±0)[^20^]; caveman erreichte **8,5 %** statt 65 %[^21^]; ponytail lieferte mit **−10,3 % Kosten bei p=0,004** den einzigen statistisch soliden Gewinn der Serie[^22^]. Die beworbenen Zahlen sind dabei nicht gelogen — sie sind pro Payload korrekt und nur gegen den falschen Nenner gelesen.

Der Patterson-Gegenbeleg verhindert eine vorschnelle Verallgemeinerung: In einem extrem CLI-lastigen Produktionsworkflow sparten RTK und Headroom in einem Monat 1,5 Milliarden Tokens und $3.808 — bei 96 % Prefix-Cache-Hit[^23^]. Beide Wahrheiten koexistieren, und die Konfliktzone löst sich über eine einzige Variable: **Cache-Kohärenz**. Der Anthropic-Prompt-Cache greift nur, wenn der Prefix Byte für Byte identisch ankommt; ein einziges mutiertes Byte invalidiert ihn ab dieser Stelle[^24^]. Wo der Cache intakt bleibt (Patterson: 96 % Hit-Rate), schlagen Spar-Tools voll durch; wo ein Tool den Prefix pro Turn umschreibt, frisst die Invalidierung die Ersparnis — im dokumentierten Extremfall headroom Issue #2438 kostete der Proxy das Zwei- bis Siebenfache des Direktbetriebs, während die eigene Telemetrie fälschlich Ersparnis anzeigte[^25^].

Drei Brecher-Muster trennen die sicheren von den gefährlichen Werkzeugen; sie stammen aus der einzigen öffentlichen Postmortem-Doku eines Cache-Desasters (squeezr: 50 % des 5-Stunden-Kontingents in 10 Minuten verbrannt)[^24^]:

1. **Nicht-deterministische Kompression** — AI-Summaries variieren pro Durchlauf, der Prefix mutiert permanent.
2. **Variable Parameter** — ein Pressure-/Threshold-Wert, der an der wachsenden Konversation hängt, komprimiert denselben Block pro Turn anders.
3. **Gleitende Fenster** — „behalte die letzten N Turns" rutscht pro Turn weiter und kollabiert jedes Mal einen anderen Block.

Die Entscheidungsbedeutung ist unmittelbar: Cache-Hit-Rate ist die Pflichtmetrik jeder Token-Optimierung, Kompressionsrate ohne sie ist bedeutungslos. Konkret heißt das für die Folgekapitel: Jeder Proxy-Kandidat wird gegen die drei Brecher-Muster geprüft, jede Installation verlangt einen einmaligen Abgleich der Provider-Abrechnung (`cache_read` vs. `cache_creation`) gegen den Direktbetrieb, und eine Hit-Rate unter 90 % disqualifiziert — unabhängig davon, was die Tool-eigene Savings-Anzeige behauptet. Damit ist das Begriffsgerüst vollständig: fünf Kostenblöcke setzen die Prioritäten, vier Mechanismen strukturieren die Auswahl, Cache-Kohärenz entscheidet über die Zulassung. Kapitel 3 wendet dieses Gerüst auf die Repo-Landschaft an.

### Quellen dieses Kapitels

[^9^]: Growth4U-systems/claude-token-hygiene — README (System-Kontext-Overhead 15–35k Tokens/Konversation) — https://github.com/Growth4U-systems/claude-token-hygiene
[^10^]: HN-Daily via duanyytop/agents-radar Issue #2106 — „Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k", 2026-07-13 — https://github.com/duanyytop/agents-radar/issues/2106
[^11^]: sup3x/claude-code-eco — docs/token-optimization-guide.md (81 Tools ≈ 143k Tokens ≈ 72 % des 200k-Fensters; Cache-Preise 0,1×/1,25×/2×), 2026-07-02 — https://github.com/sup3x/claude-code-eco/blob/main/docs/token-optimization-guide.md
[^12^]: lobehub — @cocaxcode/token-optimizer-mcp Referenztabelle (~1k Tokens/Tool-Schema; 7 Server ≈ 67k; Tool Search −47 %) — https://lobehub.com/mcp/cocaxcode-token-optimizer-mcp
[^13^]: juejin.cn — „Token压缩工具实测：614M数据告诉你90%节省承诺有几分真" (rtk erreicht ~22 %; Read/Grep/Glob ~78 %), 2026-06-22 — https://juejin.cn/post/7653703276806012947
[^14^]: NodeNestor/claude-rolling-context — README (quadratische vs. lineare Kostenkurve, Prefix-Cap 100k/40k) — https://github.com/NodeNestor/claude-rolling-context
[^15^]: Atlassian Engineering Blog — „MCP Compression: Preventing tool bloat in AI agents" (Output-≈5×-Input-Preis-Relation im MCP-Ökonomie-Teil) — https://www.atlassian.com/blog/developer/mcp-compression-preventing-tool-bloat-in-ai-agents/
[^16^]: buildthisnow.com — „Claude Code Prompt Caching" (Rechenbeispiel $6,30 vs. $1,13 ≈ 82 %; TTLs), 2026-06-15 — https://www.buildthisnow.com/blog/guide/development/claude-code-prompt-caching
[^17^]: 0xhimanshu/governor — README/Benchmark (Caveman 69,1 % Ersparnis, VCLR 0,14, 12,5 % falsche Entscheidungen), 2026-05-01 — https://github.com/0xhimanshu/governor
[^18^]: capitalandcompute.net — „Do Claude Code Token-Saving Tools Actually Cut Your Bill?" (kombiniert 3,7 % von $926), 2026-08-06 — https://capitalandcompute.net/blog/claude-code-token-saving-tools-rtk-headroom-caveman/
[^19^]: ArceApps Blog — „RTK vs Caveman: real token savings in AI agents" (headroom 2,8 %, rtk 0,5 %, caveman 0,4 %), 2026-07-15 — https://arceapps.com/blog/rtk-vs-caveman-token-savings/
[^20^]: JetBrains AI Blog — „Does 'rtk' skill really cut agent tokens by 60–90%? We tested it" (+7,6 % bei low effort, p=0,004; ±0 bei high), 2026-07-20 — https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
[^21^]: JetBrains AI Blog — „Does Speaking to Agents Like Cavemen Really Save 65% of Tokens? We Test" (8,5 % reale Output-Ersparnis), 2026-07-16 — https://blog.jetbrains.com/ai/2026/07/speak-to-ai-agents-like-cavemen-tosave-tokens/
[^22^]: JetBrains AI Blog — „Ponytail Skill for Claude Code: Does It Really Cut Tokens" (−10,3 % Kosten, p=0,004, keine Qualitätsdifferenz), 2026-07-28 — https://blog.jetbrains.com/ai/2026/07/ponytail-skill-claude-tested/
[^23^]: andrewpatterson.dev — „Token Compression for Claude Code with RTK + Headroom" (1.516.714.601 Tokens, $3.808, 96 % Cache-Hit), 2026-04-18 — https://andrewpatterson.dev/posts/token-savings-rtk-headroom/
[^24^]: squeezr docs/PROMPT_CACHE.md — Incident 2026-06-04 und die drei Cache-Brecher-Muster (nicht-deterministische Kompression, variable Parameter, gleitende Fenster) — https://github.com/sergioramosv/squeezr/blob/master/docs/PROMPT_CACHE.md
[^25^]: headroom Issue #2438 — „Proxy defeats Anthropic prompt caching (2–7× cost increase); Telemetrie zeigte cache_hit: true bei bezahlten Cache-Writes" — https://github.com/headroomlabs-ai/headroom/issues/2438
