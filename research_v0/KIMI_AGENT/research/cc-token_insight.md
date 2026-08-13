# Insights: Claude-Code-Token-Minimierung (Phase 6, Cross-Dimension-Synthese)
Stand: 2026-08-13 · Abgeleitet aus wide01–06, dim01–08, cross_verification (+Nachtrag). Keine Wiederholung von Einzelbefunden — nur Muster, die über Dimensionen hinweg sichtbar werden.

## Insight 1: Der Token-Verbrauch folgt einer festen „Anatomie", und die meisten Tools zielen auf den kleinsten Teil.
Über alle Dimensionen konsistent: Der Kontext besteht aus (a) Systemprompt+Tool-Schemas (15–35k+, teils 72 % des Fensters vor Nachricht 1), (b) File-Reads (größter nativer Strom, ~78 % mit Grep/Glob), (c) Tool-/Bash-Output (nur ~20–22 %), (d) Transcript-Replay pro Turn (quadratischer Multiplikator, durch Cache auf 0,1× gemildert), (e) eigener Output. Die populärsten Tools (Output-Filter) adressieren (c) — den kleinsten Hebel. Die wirksamsten Maßnahmen adressieren (d) Cache-Hygiene, (b) Read-Disziplin/Indizes/Clamps, (a) MCP-/Schema-Diät und (e) Verhalten.
Derived from: dim01, dim03, dim05, dim06, dim07, wide06 · Confidence: high
Implication: Stack-Architektur muss nach Anteil am Token-Strom priorisieren, nicht nach Tool-Popularität. Die Star-Zahlen des Feldes sind anti-korreliert mit der Hebelgröße.

## Insight 2: „Kompression" ist das falsche Frame — das Feld besteht aus vier verschiedenen Mechanismen mit eigenen Erfolgskriterien.
(1) **Vermeidung** (Token entsteht gar nicht: Sandbox, Read-Clamps, deny-Guards, Plan-Mode, ponytail-Verhalten) — höchster Ceiling, kein Qualitätsrisiko. (2) **Verlagerung** (Token verlässt das Fenster, bleibt abrufbar: Spill-Files, FTS5-Index, retrieve-Marker, magic-compact, context-mode) — hoher Ceiling, braucht Retrieve-Disziplin. (3) **Verdichtung** (Information geht verloren: LLMLingua, Summaries, caveman) — niedriger Ceiling, dokumentierte Qualitätsrisiken (12,5 % Fehlentscheidungen, Code-Unbrauchbarkeit). (4) **Verbilligung** (gleiche Tokens, billiger: Cache-Hygiene, Routing, Effort-Level, opusplan) — wirkt auf die Rechnung, nicht das Fenster. Tools, die (1)+(2) kombinieren (context-mode, squeez mit Retrieve, magic-compact mit read_omitted_content), schlagen jeden Verdichter; Verdichter ohne Retrieve-Rückversicherung sind prinzipiell verdächtig.
Derived from: dim01, dim02, dim03, dim04, dim06, wide01, wide06 · Confidence: high
Implication: Stack-Empfehlung strukturieren als „Vermeiden → Verlagern → Verdichten (nur reversibel) → Verbilligen", nicht als Tool-Liste.

## Insight 3: Cache-Kohärenz ist die unsichtbare Trennlinie — sie erklärt die widersprüchlichsten Messergebnisse des ganzen Feldes.
Derselbe Tool-Stack spart beim einen Nutzer 1,5 Mrd. Tokens/Monat (Patterson, 96 % Cache-Hit) und kostet beim anderen 7,6 % extra (JetBrains) — der Unterschied liegt nicht am Tool, sondern daran, ob der Prefix-Cache intakt bleibt. Drei Brecher-Muster (nicht-deterministische Kompression, variable Parameter, gleitende Fenster) trennen die sicheren von den gefährlichen Proxys; headroom (#2438) und OmniRoute sind gemessene Brecher, squeezr/llmtrim/tokdiet/rolling-context dokumentierte Nicht-Brecher. Sogar Claude Code selbst hat 3 Cache-Bugs (cache-fix). Konsequenz: **Jede Token-Optimierung, die den Prefix verändert, muss mit Cache-Hit-Rate als Pflichtmetrik evaluiert werden** — Kompressionsrate allein ist bedeutungslos.
Derived from: dim02, dim03, dim05, wide06 (CZ-1/CZ-4) · Confidence: high
Implication: Cache-Hit-Rate >90 % wird zur Governance-Kennzahl Nr. 1 im Regelwerk (Ladder-Stufe 3 nutzt explizit Cold-Cache-Erkennung).

## Insight 4: MCP ist zugleich Lösung und Krankheit — die Tool-Definition-Ökonomie entscheidet über den Nutzen jedes MCP-Tools.
Fast jede innovative Lösung kommt als MCP-Server — und erzeugt ~1k Tokens pro Tool-Schema: MemPalace 44 Tools (4,4–8,6k/Session), agentmemory 54, CRG 30. Gleichzeitig zeigt die token-savior-Retraction, dass natives Tool Search versteckte Tools unsichtbar wegdeferriert (1 Call/143 Sessions). Das Feld konvergiert auf drei Gegenmittel: (a) Manifest-Minimierung (codegraph: 1 Tool; CRG_TOOLS-Allowlist 30→3–5), (b) Schema-Kollaps (mcp-compressor: 17,6k→0,5–4k; bifrost Code Mode), (c) Scoping (Subagent-Frontmatter statt global). Wer MCP-Tools ungeprüft stapelt, kann netto mehr Tokens kaufen als sparen.
Derived from: dim03, dim06, dim07, wide04, wide06 · Confidence: high
Implication: Der Stack braucht ein „MCP-Budget" mit Messpflicht (Tool-Def-Tokens/Session) und der Regel: ein MCP-Tool pro Funktion, scoped statt global, Discovery-Nutzung verifizieren.

## Insight 5: Unabhängige Messung invertiert die Rangliste — kleine ehrliche Tools schlagen große virale.
JetBrains/codepointer/THOL/TRON/Governor-Benchmarks zusammen invertieren die Star-Rangliste: rtk (76k★) = Sicherheitsprobleme + Negativ-Messung; caveman (98k★) = 8,5 % statt 65 %; headroom (66k★) = Cache-Bruch; codegraph (66k★) = kein E2E-Effekt. Umgekehrt: ponytail (−10,3 %, p=0,004), sqz (ehrliche 24,7 % Ø), PAKT (nennt +25 %-Gegenbeispiele), rolling-context („kurze Sessions sind Wash"), tokdiet (gepaarter Qualitätsbenchmark bei 33★) liefern die belastbarsten Zahlen. **Ehrlichkeit ist im Feld ein besserer Prädiktor für Wirksamkeit als Adoption.**
Derived from: dim01, dim02, dim04, dim05, dim07, wide01, wide06 · Confidence: high
Implication: Die Stack-Empfehlung muss jeden Claim mit Evidenz-Tier versehen und virale Defaults explizit neu bewerten (rtk → squeez/tokf; headroom → magic-compact+sicherer Proxy; caveman → ponytail).

## Insight 6: Das eigentliche Produkt ist das Regelwerk, nicht das Tool — Guards und Stufenlogik schlagen jede Einzelinstallation.
Über dim01–dim08 wiederholt sich: dieselben Tools wirken oder schaden je nach Verdrahtung (rtk-Issue #260 allow-Bypass; PreCompact-block-Bugs; warden-Compound-Lücke; Otel-Smuggling). Die robusten Muster sind output-seitig, fail-open, ohne allow-Umgehung, mit Spill-File+Retrieve (overloop-Modell) und gestufter Eskalation (filtern→straffen→compact+Snapshot→clear+Handoff). Ein kleiner, korrekter Guard (bash-dump-guard.mjs: Loop-Guard + Spill>2k + Dedup, niemals allow) plus Ladder-Trigger-Disziplin erzeugt mehr realen Effekt als drei weitere Kompressions-Tools.
Derived from: dim08, dim01, dim02, dim06, wide06 · Confidence: high
Implication: Der Report liefert das Regelwerk als eigenes Kapitel mit Referenz-Design (bash-dump-guard.mjs, Ladder-Stufen, settings.json-Vorlage) — das ist die vom Nutzer explizit gewünschte „Anpassung und Regelung".

## Insight 7: Workflow-Form entscheidet über Stack-Variante — es gibt keinen einen besten Stack, sondern drei.
Die Befunde zeigen drei sauber trennbare Profile: **(A) Kurze Sessions/Klein-Projekte (<~300 Dateien):** fast alle Tools Wash oder negativ; native Disziplin + Env-Hygiene genügt. **(B) Lange Sessions/Power-User (Max-Plan, CLI-/test-lastig):** Filter (squeez) + Sandbox (context-mode) + magic-compact + cache-sicherer Proxy + rolling-context; ehrlicher Erwartungswert 15–30 % Input. **(C) Multi-Provider/Budget-getrieben:** CCR-Routing (stark main+think, billig background) + Cache-Hygiene; Token-Hebel wird zum Kosten-Hebel. Code-Intelligence und Memory sind in allen drei situativ (Explorer/Review bzw. episodisch >4 Wochen), nie Default.
Derived from: dim02, dim05, dim06, dim07, wide06 · Confidence: medium-high
Implication: Stack-Empfehlung als Kern-Stack (alle) + drei Profil-Varianten (A/B/C) mit klaren Aktivierungsregeln — direkt anschlussfähig an das Ladder-Modell.

## Insight 8: 2026 verschiebt sich die Front von Regel-Filtern zu spezialisierten Kleinmodellen — mit ungelöster Vertrauensfrage.
Paritok-4B (45K Trajektorien), thlibo (Gemma 4), squeezr (Zest/Haiku), DietCode (Scaledown), KRLabsOrg-squeez (Qwen-2B, arXiv) markieren die zweite Generation: semantisch robustere Kompression, aber neue Kosten (Latenz, GPU/Hosting), neue Bugs (Paritok #40/#41) und dieselbe Cache-/Qualitäts-Prüfpflicht. Forschungs-Großmodelle (LLMLingua-2, 500x) sind dagegen für CC kontraindiziert bzw. nicht deploybar.
Derived from: dim03, dim01, wide03, wide04 · Confidence: medium
Implication: Watchlist im Report — modellbasierte Kompression beobachten (Paritok als ernstester Kandidat), aber erst nach unabhängigen E2E-Messungen in den Kern-Stack aufnehmen.
