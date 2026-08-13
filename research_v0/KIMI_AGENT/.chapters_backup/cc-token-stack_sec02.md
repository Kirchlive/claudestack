## 3. Die Repo-Landschaft im Überblick

Das Token-Optimierungs-Ökosystem für Claude Code ist 2026 von einer Handvoll Einzelprojekten zu einem industriellen Feld geworden. Die entscheidende Konsequenz: Das Problem ist nicht mehr die Versorgung mit Werkzeugen, sondern die Auswahl — und die Verfallsrate des Materials. Wer heute einen Stack entscheidet, braucht eine verifizierte Landkarte, keine Star-sortierte Bestenliste.

### 3.1 Gesamtbild: ~180 Repos in 15 Schichten

Die Master-Repo-Matrix (Vollversion in Anhang A, Datei `cc-token_repo_matrix.md`) konsolidiert rund 180 einzigartige Repos aus vier Herkunftsströmen: 31 in der Mission vorab verifizierte Ausgangs-Repos, 108 gesichtete Lesezeichen (davon 102 GitHub-Repos, allesamt per GitHub-API auf Existenz, Stars und letzten Push geprüft), rund 70 Neufunde aus der Breitenrecherche und etwa 35 allgemeine Referenz-Repos. Davon sind nur rund 40 direkt stack-relevant, rund 60 indirekt relevant (Memory, Code-Intelligence, Messung) — der Rest ist Workflow-, UI- oder Off-Topic-Material. Das Aktivitätsbild ist bemerkenswert: Die meisten Marktführer wurden erst zwischen Februar und April 2026 erstellt und erreichten in unter sechs Monaten 30.000 bis über 100.000 Stars[^1^] — Memory und Code-Intelligence sind das Hype-Thema des Jahres, gefolgt von einer Explosion der Kompressions- und Filter-Tools: Allein die GitHub-Suche nach „claude code token compress" liefert über 30 Repos, fast alle zwischen Juni und August 2026 aktiv[^2^][^3^].

Vor jeder Nutzung der Landkarte steht die Bereinigung, und sie ist größer als üblich. **Umbenennungen:** headroom wanderte von chopratejas zu headroomlabs-ai, yek von bodo-run zu mohsen1 — ältere Artikel verweisen auf tote Pfade. **Namens-Doppelgänger:** Es existieren zwei unabhängige Projekte namens *squeez* (claudioemmanuel/squeez als Hook-Kompressor vs. KRLabsOrg/squeez als Qwen-basiertes Pruning-Modell), zwei namens *snip* (edouard-claude/snip als Filter-Proxy vs. rixinhahaha/snip als Visual-Mode-App), und headroom (Kompressions-Layer) ist nicht headroom-meter (dessen TUI-Dashboard). **Obsolet durch native Features:** ccundo (Undo inzwischen nativ), claude-code-costs (von ccusage abgelöst), claude-code-otel (von nativer OpenTelemetry-Unterstützung überholt). **Nicht deploybar:** 500xCompressor benötigt Zugriff auf Modellgewichte und scheidet für eine gehostete API per Definition aus[^4^]; RouteLLM und FrugalGPT sind Forschungs-Frameworks ohne Integrationspfad für Claude Code. Bedeutung für die Entscheidung: Jede Tool-Liste, die älter als drei Monate ist, muss vor Stack-Entscheidungen re-verifiziert werden — die in Kapitel 1 eingeführte Evidenz-Tier-Einstufung gilt nur für den verifizierten Ist-Stand vom 13.08.2026.

| Herkunftsstrom | Umfang | Charakter | Beitrag zum Stack |
|---|---|---|---|
| Verifizierte Ausgangs-Repos | 31 | Kuratiert, teils tief recherchiert | Kern der Empfehlungen |
| Lesezeichen-Screening | 108 (102 GitHub-Repos) | Gemischt: 14 direkt relevant, ~45 indirekt, Rest Peripherie | Breite + Bereinigungsarbeit |
| Breitenrecherche-Neufunde | ~70 | Überwiegend Juni–August 2026, klein, jung | Zeigt Trends, wenig Reife |
| Allgemeine Referenz | ~35 | Forschung, Frameworks, Doku | Konzepte, kaum Deployables |

Die Tabelle macht das Auswahlproblem sichtbar: Über die Hälfte des Korpus ist jünger als drei Monate und entsprechend dünn belegt — die handlungsrelevante Substanz konzentriert sich auf rund 40 Repos. Für die Stack-Entscheidung heißt das: Strenge bei der Aufnahme, Großzügigkeit beim Beobachten. Konkret verteilt sich die handlungsrelevante Substanz ungleich: Die 31 verifizierten Ausgangs-Repos liefern fast alle Kern-Empfehlungen der Folgekapitel; aus dem Lesezeichen-Korpus kamen mit 14 direkt relevanten Treffern vor allem Ergänzungen für Messung und Hook-Design; die rund 70 Neufunde sind überwiegend Watchlist-Material — sie belegen Trendrichtungen wie Reversibilität, Cache-Ehrlichkeit und Multi-Agent-Support, ohne bereits Stack-Reife zu haben. Die allgemeine Referenzschicht schließlich liefert die Konzepte (Cache-Ökonomie, Kompressionsforschung), an denen die Claims der deploybaren Tools überhaupt erst gemessen werden können.

| Schicht | Zweck | Schlüssel-Repos | Status |
|---|---|---|---|
| 0 — Messung & Observability | Governance-Basis, spart nicht direkt | ccusage, CodeBurn, CodexBar, toktrack | ✅ Pflichtfundament |
| 1 — Systemprompt/Prompt-Hygiene | Input-Overhead kürzen | tweakcc, claude-code-system-prompts | 🟡 mächtig, brüchig |
| 2 — Output-Stil-Skills | Output-Tokens reduzieren | ponytail, caveman, i-have-adhd | ⚠️ kleine Effekte, Qualitätsrisiko |
| 3 — Shell-/Tool-Output-Filter | Erste Verteidigungslinie | rtk, squeez, tokf, token-saver | 🟡 einstellige Gesamtersparnis |
| 4 — MCP-Sandbox & Kompressions-Engines | Tool-Outputs/Schemas vor dem Kontext | context-mode, Paritok-4B, bifrost | 🟡–✅ situativ stark |
| 5 — Session-Kompression | /compact-Alternativen, History | headroom, magic-compact, rolling-context | ✅ mit realistischer Erwartung |
| 6 — Formate & lossless | Datenformat-Kompression | toon, toonify-mcp, sigmap | 🟡 Baustein |
| 7 — Code-Intelligence | File-Reads vermeiden (größter nativer Block) | serena, graphify, codegraph, claude-context | 🟡 E2E-Effekt umstritten |
| 8 — Memory & Persistenz | Wiederholungs-Lesen verhindern | claude-mem, MemPalace, planning-with-files | ✅ Footprint beachten |
| 9 — Routing & Gateways | Kosten- (nicht Token-)Hebel | claude-code-router, litellm, OmniRoute | 🟡 Tarif-Frage |
| 10 — Cache-Ebene | Größter Input-Kostenhebel | claude-code-cache-fix, native Env-Flags | ✅ hoher ROI |
| 11 — Repo→Kontext-Packaging | Einmal-Onboarding | repomix, gitingest, yek | 🟡 nicht für Dauerbetrieb |
| 12 — Hook-Sammlungen & Guards | Regelwerk-Rohmaterial | claude-code-hooks, governor, overloop | ✅ Design-Vorlagen |
| 13 — Peripherie | Indirekt relevant | gstack, spec-kit, ruflo | 🔵 Kontext |
| 14 — Obsolet/Nicht-deploybar | Referenz | ccundo, claude-code-otel, 500xCompressor | ❌ aussortieren |

Die kondensierte Matrix zeigt drei strukturelle Befunde. Erstens: Die ✅-Schichten (0, 5, 8, 10, 12) sind genau die, in denen Messbarkeit und Reversibilität gegeben sind — sie bilden das Rückgrat jeder Empfehlung in den Folgekapiteln. Zweitens: Die lautesten Schichten nach Star-Zahlen (2, 3, 7) sind nicht die wirksamsten; caveman (97,8k★) und rtk (75,9k★) überstehen die unabhängige Nachmessung nur mit drastisch reduzierten Effekten, wie Kapitel 2 gezeigt hat. Drittens: Keine einzelne Schicht löst das Problem — die Wirkung entsteht erst aus der Kombination, was das Stack-Design in den Kapiteln 5 ff. trägt. Für die Umsetzungsreihenfolge in Kapitel 16 folgt daraus eine klare Regel: Zuerst die ✅-Schichten instrumentieren und stabilisieren, dann situativ aus den 🟡-Schichten ergänzen — niemals umgekehrt, denn jede 🟡-Komponente ohne ✅-Messbasis darunter ist eine ungeprüfte Wette.

### 3.2 Architektur-Generationen und die Trends 2026

Das Feld hat in kurzer Zeit drei klar unterscheidbare Architektur-Generationen durchlaufen. Die erste Generation arbeitet **deterministisch vor dem Modell**: CLI-Filter und PreToolUse-Hooks, die Kommando-Outputs regelbasiert kürzen (rtk, tokf, thlibo, token-saver)[^5^][^6^]. Die zweite Generation setzt auf **transparente HTTP-Proxys** zwischen Agent und API, die Requests und Responses semantisch komprimieren (squeezr, headroom, TokenSnap)[^7^]. Die dritte, 2026 entstandene Welle nutzt **lokale Kleinmodelle als semantische Kompressoren** — Paritok-4B ist das erste Open-Source-Modell, das speziell auf Kompression von Coding-Agent-Trajektorien trainiert wurde (45.000 Trajektorien, 25 % Ersparnis ab Turn 1 bis >85 % in gesättigten Sessions)[^8^]; thlibo kombiniert deterministische Filter mit einem lokalen Gemma-4-Fallback[^6^]. Parallel haben sich MCP und Hooks als Standard-Integrationsmuster durchgesetzt, und der Vertrieb wandert von settings.json-Hooks in native Plugins über die offiziellen Marketplaces — sichtbar an der Migration von token-saver v2 in anthropics/claude-plugins-community[^9^].

Vier Trends bestimmen die Entscheidungslage 2026. **Erstens: Reversibilität wird Pflicht.** Nach der Kritik an /compact („summary of a summary") werben magic-compact (rückholbare Einzel-Turn-Summaries via read_omitted_content), densely (sha256-verifizierte Rekonstruktion) und headroom (retrieve) mit abrufbaren Originalen[^10^][^11^] — verlustbehaftete Kompression ohne Rückhol-Pfad ist nicht mehr vertretbar. **Zweitens: Cache-Ehrlichkeit.** Proxys, die den Request-Prefix verändern, zerstören Anthropic Prompt Caching und können Mehrkosten statt Ersparnis erzeugen; squeezr wirbt explizit mit Cache-Sicherheit, kuro-lean mit Cache-Rescue[^7^][^12^] — das bestätigt die Cache-Kohärenz-These aus Kapitel 2 als Markt-Konsens. **Drittens: Terse-Style- und CLAUDE.md-Audit-Explosion.** Output-Styles werden inzwischen benchmarked statt nur behauptet (beeline, native Output-Styles, taxman)[^13^][^14^], und eine neue Audit-Kategorie quantifiziert den System-Overhead: token-hygiene misst 15.000–35.000 Tokens Basiskosten pro Konversation (CLAUDE.md, MEMORY.md, Skill-Beschreibungen, MCP-Schemas), ein vielbeachteter HN-Thread bezifferte Claude Codes Systemprompt-Vorschuss auf 33.000 Tokens vor dem ersten Prompt[^15^][^16^]. **Viertens: Multi-Agent-Support ist Tabellenpflicht** — nahezu jeder Neufund unterstützt Codex CLI, Cursor und Gemini CLI neben Claude Code; CC-only-Tools wirken zunehmend wie Nischenprodukte. Bedeutung für die Entscheidung: Investieren Sie in Architekturen der dritten Generation mit Reversibilitäts- und Cache-Garantie, nicht in Regelwerke der ersten — und verlangen Sie von jedem Kandidaten einen gemessenen statt behaupteten Effekt.

## 4. Messung und Governance-Basis

Keine Optimierung ohne Messung — und keine Messung ohne Datenhaltung. Dieses Kapitel legt die Messkette fest, auf der alle nachfolgenden Stack-Empfehlungen verifiziert werden, und die vier Governance-Regeln, die vor jeder Optimierungsentscheidung gelten.

### 4.1 Die Messkette: Von der Baseline zum geschlossenen Kreis

Der Markt hat sich auf eine klare Rollenverteilung geeinigt. **ccusage** (17,9k★) ist der De-facto-Standard für die historische Baseline: Das CLI liest die lokalen JSONL-Session-Dateien von 16 Coding-Agenten und liefert Tages-, Wochen-, Monats- und Session-Reports inklusive 5-Stunden-Billing-Windows und Cache-Token-Aufschlüsselung[^17^]. **CodeBurn** (9,3k★) geht als einziges Tool über die Messung hinaus und schließt den Kreis: `optimize` findet Waste-Muster (wiederholte File-Reads, ungenutzte MCP-Server, aufgeblähte CLAUDE.md) mit Dollar-Schätzung, `--apply` wendet Fixes mit Journal und Undo an, `guard` installiert Budget-Hooks (Soft-Cap 5 $, Hard-Cap 15 $, fail-open), und `act report` vergleicht nach mindestens drei Tagen realisierte gegen geschätzte Ersparnis[^18^]. Für den Live-Betrieb ergänzen **claude-monitor** (plattformübergreifend, Burn-Rate-Prognose für das 5-Stunden-Fenster mit ehrlich gelabelten Schätzwerten: `official` vs. `local_estimate`) und **CodexBar** (macOS-Menüleiste, Kontingent-Fenster über 69 Provider) die operative Sicht[^19^][^20^].

Zwei Detailbefunde verdienen Aufmerksamkeit, weil sie die Messbasis selbst betreffen. **Claude Code löscht Session-Dateien nach 30 Tagen** (`cleanupPeriodDays`, Default 30) — die Rust-CLI toktrack cached Tages-Summaries immutabel und übersteht die Löschung; die ebenso wirksame Gegenmaßnahme ist `"cleanupPeriodDays": 9999999999` in der eigenen settings.json[^21^]. Wer das versäumt, verliert rückwirkend die Beweislage für jede Optimierungsentscheidung. Und eine neue Kategorie von **Audit-Tools** misst den versteckten System-Overhead: claude-token-hygiene quantifiziert 15.000–35.000 Tokens Basisbelastung pro Konversation, claude-markdown-health-check scannt das .claude/-Setup auf Token-Bloat und tote Referenzen, claude-context-optimizer trackt, welche Kontextbestandteile tatsächlich wiederverwendet werden, und ersetzt angenommene Konstanten durch eigene Messung (ein MCP-Tool kostete real 38.000 statt angenommener 200 Tokens)[^22^][^23^].

| Tool | Rolle | Live/historisch | Aktion? | Besonderheit |
|---|---|---|---|---|
| ccusage | Historische Baseline | historisch (+Statusline-Beta) | nein | Standard, 16 Agent-Quellen, Cache-Tokens sichtbar |
| CodeBurn | Geschlossener Kreis | beides | ja (optimize→apply→guard→report) | realized-vs-estimated nach ≥3 Tagen |
| claude-monitor | Live-Prognose 5h-Fenster | live | Warnungen | Provenance-Labels für Schätzwerte |
| CodexBar | Kontingent-Ampel | live (macOS) | nein | 69 Provider, kein Login nötig |
| toktrack | Langzeit-Archiv | historisch | nein | Überlebt 30-Tage-Löschung |
| Audit-Tools (token-hygiene, markdown-health-check, context-optimizer) | System-Overhead | historisch/live | teilweise | Machen versteckte Basiskosten sichtbar |

Die Messkette ist komplementär, nicht konkurrierend: ccusage und toktrack sichern die historische Beweislage, claude-monitor und CodexBar verhindern Quota-Überraschungen im Tagesgeschäft, CodeBurn liefert den einzigen belastbaren Nachweis, ob eine Optimierung real gespart hat, und die Audit-Tools verhindern, dass die Optimierung am Rauschen vorbei an der falschen Kostenstelle ansetzt. Für den Stack folgt daraus eine Installationspflicht in dieser Reihenfolge: Erst Baseline (ccusage), dann Langzeit-Retention (cleanupPeriodDays hochsetzen oder toktrack), dann Live-Sicht, dann CodeBurn als Governance-Schleife. Erst danach ist die Voraussetzung geschaffen, die nativen Hebel aus Kapitel 5 überhaupt bewerten zu können. Wer diese Kette überspringt und direkt optimiert, misst später gegen Erinnerung statt gegen Daten — genau der Mechanismus, mit dem im Feld Spar-Projekte als Erfolg verkauft werden, die nie einen Effekt hatten (Kapitel 2.3). Die Tabelle zeigt auch, warum kein Einzel-Tool genügt: Keine Zeile deckt alle vier Funktionen ab, und das einzige Tool mit Aktions-Schleife (CodeBurn) ersetzt weder die Langzeit-Retention noch die Live-Sicht.

### 4.2 Governance: Vier Regeln vor jeder Optimierung

**Regel 1: Messpflicht vor Optimierung.** Jede Stack-Komponente wird nur mit Vorher/Nachher-Vergleich gegen die ccusage-Baseline aufgenommen. Der headroom-meter-Befund zeigt, warum: In einer echten Feldsession sparte der Headroom-Proxy 334.462 von 14,18 Millionen Input-Tokens — 2,4 % statt der beworbenen 15–20 %, bei einer Cache-Hit-Rate von 95,2 %[^24^]. Ohne Messung wäre das als Erfolg verkauft worden.

**Regel 2: Cache-Hit-Rate >90 % ist Kennzahl Nummer eins.** Sie ist der schnellste Indikator dafür, ob der Stack für oder gegen den Prompt-Cache arbeitet. Der dokumentierte Referenzpunkt: claude-code-cache-fix hebt die Hit-Rate von 92,44 auf 94,66 Prozent, indem er drei Cache-Bugs in Claude Code (Block-Scatter bei --resume, Fingerprint-Instabilität, Tool-Sortierung) fixiert — unfixiert kosten diese Regressionen laut Maintainer bis zum 20-fachen[^25^]. Jede Dritt-Komponente, die den Request-Prefix anfasst, muss an dieser Kennzahl gemessen werden, bevor sie in den Stack darf — die direkte Anwendung des Cache-Kohärenz-Prinzips aus Kapitel 2.

**Regel 3: Realisiert schlägt geschätzt.** Spar-Claims und selbst CodeBurns eigene Waste-Schätzungen sind Hypothesen, bis `act report` sie gegen die realisierte Rechnung prüft. Doppelzählungs- und Cache-Bugs in den Messtools selbst (CodeBurn-Issues #987/#988) zeigen, dass auch die Messkette Kalibrierung braucht[^26^]. Governance-Konsequenz: Optimierungsentscheidungen nur gegen gemessene, nie gegen angenommene Kosten.

**Regel 4: Native Telemetrie nur user-seitig, niemals projekt-seitig.** Claude Code bringt mit `CLAUDE_CODE_ENABLE_TELEMETRY=1` native OpenTelemetry-Unterstützung mit (Kosten-, Token- und Tool-Events; das Dritt-Repo claude-code-otel ist damit obsolet)[^27^]. Aber dieselbe Konfiguration ist eine Angriffsfläche: „Otel Smuggling" nutzt eine bösartige `.claude/settings.json` in geklonten Repos, um Telemetrie auf Angreifer-Endpoints umzuleiten und über `otelHeadersHelper` Shell-Kommandos auszuführen — Exfiltration von Secrets noch vor der ersten Nutzereingabe; tausende Skills sind betroffen[^28^]. Die Konfiguration wird nur beim Session-Start gelesen und gehört ausschließlich in die User-Config; Projekt-Settings sind auf riskante Keys zu auditieren[^29^]. Bedeutung für die Entscheidung: Enterprise-Observability ist nativ lösbar, aber nur mit gepinnter Telemetrie-Config — andernfalls wird das Governance-Feature selbst zum Leck.

### Quellen zu Kapitel 3

[^1^]: GitHub REST API, api.github.com/repos/{owner}/{repo} — Stars/pushed_at aller Matrix-Repos, abgerufen 2026-08-13 (konsolidiert in cc-token_wide02/wide05).
[^2^]: GitHub Search API „claude code token compress" u. a. Queries — https://github.com/search, 2026-08-13.
[^3^]: GitHub Topic „token-saver" — https://github.com/topics/token-saver, 2026-08-13.
[^4^]: ZongqianLi/500xCompressor (ACL'25, KV-Spezial-Token, nicht deploybar) — https://github.com/ZongqianLi/500xCompressor, 2026-08-13.
[^5^]: mpecan/tokf (TOML-Filter, RTK-Rivale) — https://github.com/mpecan/tokf, 2026-08-13.
[^6^]: 3rg0n/thlibo (PreToolUse+updatedInput, Gemma-4-Fallback) — https://github.com/3rg0n/thlibo, 2026-08-13.
[^7^]: sergioramosv/squeezr (cache-sicherer Kompressions-Proxy) — https://github.com/sergioramosv/squeezr, 2026-08-13.
[^8^]: Paritok-official/paritok-4b-v1 (4B-Kompressionsmodell, 45K Trajektorien) — https://github.com/Paritok-official/paritok-4b-v1, 2026-08-13.
[^9^]: anthropics/claude-plugins-official und -community (token-saver v2) — https://github.com/anthropics/claude-plugins-official ; https://github.com/ppgranger/token-saver, 2026-08-13.
[^10^]: aerovato/magic-compact (Per-Turn-Summaries, read_omitted_content) — https://github.com/aerovato/magic-compact, 2026-08-13.
[^11^]: alibaizhanov/densely (sha256-Rekonstruktion) — https://github.com/alibaizhanov/densely, 2026-08-13.
[^12^]: MindStudio: Anthropic Prompt Caching & Subscription Limits — https://www.mindstudio.ai/blog/anthropic-prompt-caching-claude-subscription-limits, 2026.
[^13^]: iceHub82/beeline ; johnsnow1011/taxman — https://github.com/iceHub82/beeline ; https://github.com/johnsnow1011/taxman, 2026-08-13.
[^14^]: carlosduplar/caveman-output-style-claude-code — https://github.com/carlosduplar/caveman-output-style-claude-code, 2026-08-13.
[^15^]: Growth4U-systems/claude-token-hygiene (15–35k System-Overhead) — https://github.com/Growth4U-systems/claude-token-hygiene, 2026-08-13.
[^16^]: HN-Daily 2026-07-13: „Claude Code sends 33k tokens before reading the prompt" (463 Pkt./262 Komm.) — https://github.com/duanyytop/agents-radar/issues/2106, 2026-07-13.

### Quellen zu Kapitel 4

[^17^]: ccusage/ccusage — https://github.com/ccusage/ccusage, abgerufen 2026-08-13.
[^18^]: getagentseal/codeburn (optimize/apply/act/guard-Loop) — https://github.com/getagentseal/codeburn, abgerufen 2026-08-13.
[^19^]: Maciek-roboblog/Claude-Code-Usage-Monitor v4.0 (Provenance-Labels, Warehouse) — https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor, abgerufen 2026-08-13.
[^20^]: steipete/CodexBar (69 Provider, Menüleiste) — https://github.com/steipete/CodexBar, abgerufen 2026-08-13.
[^21^]: mag123c/toktrack (cleanupPeriodDays-Fix, audit) — https://github.com/mag123c/toktrack, abgerufen 2026-08-13.
[^22^]: Growth4U-systems/claude-token-hygiene ; ncoevoet/claude-markdown-health-check — https://github.com/Growth4U-systems/claude-token-hygiene ; https://github.com/ncoevoet/claude-markdown-health-check, abgerufen 2026-08-13.
[^23^]: egorfedorov/claude-context-optimizer (Tool-Pricing aus eigener Messung) — https://github.com/egorfedorov/claude-context-optimizer, abgerufen 2026-08-13.
[^24^]: RonnieTheTester/headroom-meter (Field-Reading 334.462/14,18M Tokens, Cache-Hit 95,2 %) — https://github.com/RonnieTheTester/headroom-meter, abgerufen 2026-08-13.
[^25^]: cnighswonger/claude-code-cache-fix (Hit-Rate 94,66 vs. 92,44 %) — https://github.com/cnighswonger/claude-code-cache-fix, abgerufen 2026-08-13.
[^26^]: CodeBurn-Issues #987/#988 (Doppelzählung, History-Löschung) — https://github.com/getagentseal/codeburn/issues, abgerufen 2026-08-13.
[^27^]: Claude Code OTEL-Monitoring mit OpenTelemetry & Elastic — https://www.elastic.co/security-labs, 2026-04-25.
[^28^]: bloom.security: „Welcome to Otel Claudeifornia" (Otel Smuggling, otelHeadersHelper-RCE) — https://bloom.security/blog/welcome-to-otel-claudeifornia, 2026-07-29.
[^29^]: General Analysis: Claude Code — Control Observability (sichere OTEL-Defaults) — https://generalanalysis.com/guides/claude-code-control-observability-opentelemetry, 2026-05-22.
