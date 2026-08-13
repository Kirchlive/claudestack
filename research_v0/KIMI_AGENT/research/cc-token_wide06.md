## Facet: Best Practices & Regelwerke

Recherche-Stand: 2026-08-13. Fokus: erprobte Kombinationen, Hook-Regelwerke, Benchmarks und native Claude-Code-Features zur Token-Minimierung.

### Key Findings

1. **Native Hebel schlagen Kompressions-Tools um Größenordnungen.** Der bisher härteste unabhängige Beleg ist das codepointer-Replay (Yongkyun Lee, Substack, Juni 2026): 614 Mio. Token reale Claude-Code-Sessions (≈ $926 Baseline) wurden mit rtk + headroom + caveman gleichzeitig nachgespielt — kombinierte Ersparnis nur **3,7 % der Kosten** (headroom 2,8 %, rtk 0,5 %, caveman 0,4 %). Die beworbenen 60–95 % sind pro Payload korrekt, aber gegen den falschen Nenner gemessen.[^1^][^2^][^3^]
2. **rtk erreicht strukturell nur ~22 % des Token-Stroms**: Der Rest (≈78 %) läuft über native Tools (Read, Grep, Glob), die an keiner CLI-Kompressions-Pipeline vorbeikommen.[^3^]
3. **Prompt-Cache-Hygiene ist der größte Input-Kostenhebel.** Cache-Reads kosten ~10 % des Input-Preises, Writes 1,25× (5-min-TTL) bzw. 2× (1-h-TTL). Invalidatoren: `/model`- und `/effort`-Wechsel, MCP-Server an/abmelden, `/compact`, Claude-Code-Upgrade. Ein Rechenbeispiel (40k-Prefix, 30 Turns, Opus): $6,30 ohne vs. $1,13 mit Cache ≈ 82 % Ersparnis.[^4^][^5^][^6^]
4. **CLAUDE.md: Anthropic-Zielvorgabe <200 Zeilen pro Datei** (weiche Empfehlung, kein Hard-Cap — der 200-Zeilen/25-KB-Hard-Cap gilt für MEMORY.md). Achtung bei `.claude/rules/`: Rule-Files werden als `<system-reminder>` bei *jedem Tool-Call* neu injiziert — in einer gemessenen Session mit 11 Rule-Files und 30 Tool-Calls fraßen Re-Injektionen 93K Tokens = 46 % des Kontextfensters (GitHub-Issue #32057).[^7^][^8^][^9^]
5. **Compaction ist steuerbar** — und das ist der meistunterschätzte native Hebel: `/compact [instructions]` fokussiert die Zusammenfassung; ein „Compact Instructions“-Block in CLAUDE.md gilt als stehender Default; der `PreCompact`-Hook (Matcher `manual`/`auto`) erlaubt deterministische State-Snapshots vor der Kompression.[^10^][^11^][^12^]
6. **Hook-Vertrag ist dreikanalig**: Exit 0 = OK (stdout kann Kontext injizieren), Exit 2 = harter Block (stderr geht als Begründung ans Modell), sonstige Codes = Fehler ohne Block. Strukturierte Steuerung über `hookSpecificOutput` (`permissionDecision`, `updatedInput`/`modifyInput`, `additionalContext`). Sicherheitsfalle: Rewrite-Hooks mit `permissionDecision: "allow"` umgehen konfigurierte Deny-Rules komplett (rtk-Issue #260).[^13^][^14^][^15^]
7. **Subagents isolieren Kontext, multiplizieren aber Token-Volumen** (~7× gegenüber Single-Thread), weil jeder Subagent ein eigenes Fenster + Systemprompt pflegt. Nur mit hart begrenzten Prompts („nur src/auth, max 15 Bullets, kein Repo-Scan“) netto sparend.[^16^][^17^]
8. **Skills statt CLAUDE.md-Bloat**: Progressive Disclosure — zur Session sehen Skills nur Name+Description (~30–100 Tokens), Body lädt on-demand; nach Compaction gelten Caps (max ~5.000 Tokens/Skill, ~25.000 gesamt). Duplikation CLAUDE.md↔SKILL.md ist ein dokumentierter Verschwendungs-Anti-Pattern.[^17^][^18^][^19^]
9. **MCP-Bloat ist messbar**: ~1k Tokens pro Tool-Schema; 7 Server ≈ 67k Tokens vor der ersten Nachricht. Tool Search (mittlerweile Default) senkte Gesamt-Tokens um ~47 % in MCP-lastigen Setups; `MAX_MCP_OUTPUT_TOKENS` (Default 25.000) deckelt Tool-Outputs.[^20^]
10. **Effort-Level ist 2026 ein First-Class-Kostenhebel**: low/medium „liberally“ als Primärkontrolle nutzen (Anthropic-Empfehlung, sofern Evals Qualität bestätigen); Effort beeinflusst *alle* Tokens inkl. Tool-Calls; Wechsel mid-session invalidiert den Prompt-Cache. `opusplan` = Opus plant, Sonnet führt aus.[^21^][^22^]

### Native Claude-Code-Hebel

| Hebel | Wirkung | Beleg/Quelle |
|---|---|---|
| `/clear` (+ HANDOFF.md-Pattern) | Voller Reset; mit vorher geschriebener Handoff-Datei („goal, changed files, decisions, failing tests, next step“) verlustfreier Neustart; „context garbage collection“ zwischen unverbundenen Tasks | Anthropic-Docs empfehlen `/clear` zwischen Tasks[^10^]; Handoff-Workflow[^12^][^23^] |
| `/compact` + Custom-Instructions | `/compact Focus on code samples and API usage` steuert die Summary; offiziell dokumentiert | Anthropic „Manage costs effectively“[^10^] |
| „Compact Instructions“ in CLAUDE.md | Stehender Retention-Policy-Default für jede Compaction (Keep/Summarize/Drop-Listen) | Anthropic-Docs (CLAUDE.md „Summary instructions“)[^10^]; Template[^11^] |
| Auto-Compact | Default aktiv bei >95 % Kontext; per `/config` toggelbar; Timing-Kritik: feuert ohne saubere Task-Grenze | Anthropic-Docs[^10^]; Kritik[^11^] |
| `/rewind` | Entfernt fehlgeschlagene Versuche statt sie einzukomprimieren; cache-schonender als `/compact` (schneidet auf bereits gecachten Prefix zurück) | Cache-Analyse[^5^][^6^] |
| CLAUDE.md-Budget | Ziel <200 Zeilen/Datei (Anthropic); Community-Praxis: Root-CLAUDE.md <60 Zeilen, 3–5 Rule-Files à <30 Zeilen, aggressive Path-Scoping | Anthropic via Sekundärquellen[^8^][^9^]; Evidenz-Review[^7^] |
| `.claude/rules/` (path-scoped) | Lädt Regeln nur bei Arbeit am betroffenen Verzeichnis — aber Kosten multiplizieren sich pro Tool-Call (93K Tokens/46 % Window in Messung) | Issue #32057 via[^9^] |
| Subagents (Kontext-Isolation) | Eigene Fenster, geben nur Summary zurück; Explore-Subagent läuft auf Haiku, read-only; Kosten ~7× Token-Volumen bei exzessiver Nutzung | Guide[^16^]; Best Practices[^17^] |
| Plan Mode (Shift+Tab ×2) | Trennt Denken von Schreiben; verhindert spekulative File-Reads + Backtracking; bei großen Features, nicht bei kleinen Bugfixes | Community-Playbooks[^17^][^24^] |
| `/model opusplan` | Opus im Plan Mode, Sonnet für Execution — „eine der kosteneffektivsten Arten, schweres Reasoning zu nutzen“ | Pricing-Guide[^25^]; Docs via[^21^] |
| Effort-Level (low/medium/high/xhigh/max) | Steuert Files-reads, Verifikation, Tool-Calls; low/medium als Primärhebel für Kosten+Latenz; Wechsel invalidiert Cache | Anthropic-Blog/Docs via[^21^][^22^] |
| Extended Thinking deckeln | `MAX_THINKING_TOKENS=0` für Triviales, ~10k für Architektur; Thinking verbrennt Output-Tokens | Workflow-Guide[^17^] |
| `.claudeignore` / Ignore-Patterns | Exkludiert node_modules, dist, Lockfiles etc. aus Search/Read; Community-Schätzung: 40–70 % weniger Per-Request-Kontext. Achtung: offiziell noch Feature-Request-Status bzw. dokumentierter Bypass-Bug (#34833) — zuverlässige Alternative: `permissions.deny` in settings.json | Feature-Issues #29455/#35926[^26^]; Praxis-Guide[^27^] |
| Prompt Caching (`cache_control`) | Automatisch aktiv (Systemprompt, Tools, CLAUDE.md); Reads ~0,1×, Writes 1,25× (5 min) / 2× (1 h); 1-h-TTL: Subscription automatisch, API/Bedrock/Vertex via `ENABLE_PROMPT_CACHING_1H=1`; Mindestgrößen modellabhängig (1.024–4.096 Tokens) | Anthropic-Docs via[^4^][^5^][^6^] |
| `/usage` (`/cost`, `/stats`) | Session-Kosten, Plan-Limits, Token-Verbrauch; `/cost` nicht für Max/Pro gedacht | Anthropic-Docs[^10^]; Tracking-Guide[^28^] |
| `/context` | Live-Breakdown des Fensters nach Kategorien + Optimierungsvorschläge + Autocompact-Buffer | Docs via[^28^][^29^] |
| Skills vs. CLAUDE.md | Skills: ~30–100 Tokens Startup-Steuer, Body on-demand; CLAUDE.md: voller Load jede Session. Faustregel: „Braucht Claude es in 80 % der Sessions? Sonst Skill.“ | Progressive-Disclosure-Analysen[^17^][^18^] |
| MCP-Bloat vermeiden | Tool Search (Default, ~47 % weniger Tokens in MCP-Setups), `MAX_MCP_OUTPUT_TOKENS` (Default 25k), ungenutzte Server per `/mcp` trennen, CLI statt MCP (`gh`, `aws`), Nischen-Server in Subagent-`mcpServers`-Frontmatter scopen | Messungen/Guide[^20^]; Best Practice[^17^] |
| Subagent-Modell pinnt | `CLAUDE_CODE_SUBAGENT_MODEL=haiku` für Exploration/Log-Inspection; Hauptthread bleibt Sonnet | Workflow-Guide[^17^] |
| Hintergrund-Verbrauch kennen | Haiku-Fülltexte (~1 ct/Tag), Resume-Summarization, `/cost`-Requests — zusammen typ. <$0,04/Session | Anthropic-Docs[^10^] |

### Erprobte Stack-Kombinationen & Benchmarks

**rtk + headroom + caveman — der Referenz-Stack und seine Demontage**

- Advertised: rtk 60–90 % (CLI-Output), headroom 60–95 % (Tool-Output-Proxy), caveman 65–75 % (Prosa).[^1^][^2^]
- **codepointer-Replay (614M Tokens, $926, 500 Sessions): kombiniert 3,7 %** — headroom 2,8 %, rtk 0,5 % ($4,96 von $926), caveman 0,4 %. headroom aktivierte nur auf 45 % der Payloads; wenn aktiv, median 25 % statt 60–95 %; die Headline-Strategien feuerten in 46 von 2.781 Aktivierungen.[^1^][^2^]
- **Strukturkritik rtk**: deckt nur ~22 % des Tool-Output-Token-Stroms ab; 78 % (Read/Grep/Glob nativ) laufen an der Pipeline vorbei.[^3^]
- JetBrains-Benchmark zu caveman (86 gepaarte Tasks, SkillsBench, erzwungene Aktivierung): **8,5 % reale Output-Ersparnis**, Deckel ~10 % Kosten, mit Varianz bis ins Negative. SkillBenchmark (blind): kein statistisch bestätigter Qualitätsgewinn.[^2^][^30^]
- Cache-Falle: Kompressoren können den Prompt-Cache invalidieren — dokumentierter Fall $8,29 vs. $0,33 für dieselbe Aufgabe (JetBrains).[^2^]

**RTK + Headroom in Produktion (andrewpatterson.dev, April 2026 — Gegenbeleg mit echten Zahlen)**

- 1 Monat Production-TypeScript/Next.js: **1.516.714.601 Tokens gespart** (RTK 1,33 Mrd. via Command-Filtering; Headroom 189 Mio. via Session-Compression), 26.779 gefilterte Commands, 2.246 API-Requests, **$3.808 Headroom-getrackte Ersparnis**, 96 % Prefix-Cache-Hit.[^31^]
- RTK per Command: read 66,9 % (1,14 Mrd.), grep 33,6 %, lint 100 %, vitest 98,6 %, tsc 100 %, find 75,8 %, ls 66,8 %. Größte Einzelquelle: File-Reads.[^31^]
- Headroom per Modell: opus-4-6 53,1 %, sonnet-4 59,1 %, haiku-4-5 31,7 %.[^31^]
- Einordnung: Token-Mengen ≠ Kostenproportion; die $3.808 sind der belastbarere Wert, und selbst der hängt an einem extrem CLI-lastigen Workflow.

**deployhq.com: „6 free GitHub repos“ (Mai 2026)** — rtk (Rust-Binary, `brew install rtk`, Hook rewrite Bash transparent, `npm install` 4.000→~15 Zeilen), caveman, code-review-graph (6,8–49× Reduktion bei Review-Tasks), agent-browser (Auth-State wiederverwenden), plus zwei Monitoring-Repos. Ehrliches Caveat: Die „$100+/Monat“-Zahl gilt nur für Max-Plan-Poweruser mit mehrstündigen Sessions; Pro-User gewinnen vor allem längere Sessions.[^32^]

**Governor (0xhimanshu) vs. Caveman — Qualitäts-gegen-Kompression-Benchmark**

- V2-Sonnet-Fixture: Caveman 69,1 % Token-Ersparnis, aber VCLR (Valid-Context-Loss-Ratio) 0,14 und **12,5 % falsche Entscheidungen**; Governor 45,5 % Ersparnis, VCLR 0,00, 100 % Entscheidungen erhalten.[^33^]
- Multi-Turn-Pilot (gleiche Task, frische Sonnet-Sessions): Governor −8,0 % Output-Tokens, −4,6 % Kosten, Intent erhalten, keine Regression.[^33^]
- Tool-Filter-Signal-Checks: pytest-Noise 64 % geblockt mit Signal erhalten; Burp-MCP-Payload 90,9 %; großer Source-Read bewusst 0 % (unique data pass-through).[^33^]

**Sekundär-Erwartungswerte (ArceApps-Synthese, Juli 2026)**: rtk real 35–80 % weniger Tool-Output-Tokens je nach Test/Git-Intensität, Sessions 1,5–3× länger bis ans Limit; API-Kosten 30–70 % niedriger *in der Session*, sofern keine Long-Context-Tier-/Cache-Invaldierungs-Effekte.[^2^]

### Hook-Patterns & Guard-Konzepte

**Der Vertrag (alle Patterns bauen darauf auf)**

- Exit 0: Erfolg; stdout wird (event-abhängig) dem Kontext angehängt. Exit 2: harter Block, stderr = Begründung ans Modell — „the magic code for guard rails“. Andere Codes: Fehler ohne Block.[^13^]
- JSON-Steuerung: `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}`; PreToolUse kann via `updatedInput`/`modifyInput` Tool-Inputs umschreiben statt zu blocken; Stop/SubagentStop lesen `additionalContext`.[^13^][^14^]
- Debug-Praxis: Hook mit realistischem Event per stdin füttern, `/hooks` zur Registrierungsprüfung, `claude --debug`; zwei stille Fehlerfälle: malformiertes JSON auf stdout (ignoriert) und Nicht-2-Exit bei Gates (lässt durch).[^14^]

**Pattern 1: PreToolUse-Guard für destruktive Kommandos** (Totalum Production Playbook)[^13^]

```bash
#!/usr/bin/env bash
set -euo pipefail
input=$(cat)
cmd=$(echo "$input" | jq -r '.tool_input.command // ""')
deny='(^|[^A-Za-z])(rm[[:space:]]+-rf?|drop[[:space:]]+database|git[[:space:]]+push[[:space:]]+.*--force|...)'
if echo "$cmd" | grep -qiE "$deny"; then
  echo "Blocked by guard rail: ... Reword the request, or ask a human." >&2
  exit 2
fi
exit 0
```

Praxisnote: stderr-Text muss dem Modell eine Alternative nennen — sonst retryt Claude dasselbe Kommando in Schleife.[^13^] Varianten: claudedirectory safe-command-approval (Deny-Liste + Auto-Approve für `ls`/`git status` etc.)[^34^]; juejin-Sandbox-Check mit High-Risk-Blacklist + Prod-Warnung + Sensitive-Files (exit 2 bei `.env`, `id_rsa`, `*.pem`).[^35^]

**Pattern 2: Output-Truncation/„Bash-Dump-Guard“** — der gesuchte Begriff „bash-dump-guard“ ist keine kanonische Eigenkreation mit zentralem Repo; die Mechanik existiert als *truncate guard* (konzeptionell am klarsten in `overloop`, PyPI):

- Loop-Guard (PreToolUse): Fingerprint `sha1(tool_name + canonical(args))`; identischer Call wiederholt sich N-mal hintereinander → Block.
- Dedup-Guard (PreToolUse): wiederholte read-only Calls auf unveränderte Dateien blocken (Mutation invalidiert Fingerprints).
- **Truncate-Guard (PostToolUse)**: volles Tool-Output in eine Spill-Datei schreiben, Modell bekommt nur Preview + Dateipfad. State pro Session in `~/.overloop` (Hook läuft als frischer Prozess je Call).[^36^]
- Governor implementiert denselben Gedanken content-aware: Output wird nur kompaktiert, wenn >40 % doppelte Zeilen (Test-Failures, Log-Spam); unique Daten (JSON, API-Responses) passieren ungefiltert; `GOVERNOR_FULL=1` als Inline-Bypass.[^33^]
- compact-middleware (Claude-Codes Compaction als DeepAgents-Middleware) zeigt die produktiven Default-Schwellen: Trigger 85 % Fenster, Microcompact alter Tool-Results (Keep-last-5), Argument-Truncation ab 80 % auf 2.000 Zeichen.[^37^]

**Warnsignale aus echten Bugs**

- claude-mem `PreToolUse:Read`-Truncation: kollidiert mit Subagent-Änderungen und CC-interner Dedup — Datei wird für Rest der Session unlesbar; Fix: mtime gegen Observations-Timestamp prüfen.[^38^]
- rtk-Rewrite-Hook sendete `permissionDecision: "allow"` → umging sämtliche User-Deny-Rules (`git push --force`, `gh pr merge` etc.). Lehre: Rewrite-Hooks nie mit pauschalem `allow` koppeln.[^15^]

**Relevante Hook-Repos (Stand 2026)**

- **karanb192/claude-code-hooks** (~450★): 10-Hook-Sammlung (cost-tracker, rate-limiter, branch-guard, protect-tests, context-snapshot, rules-injector, session-summary u. a.), copy-paste-fertig, Security-Level critical/high/strict.[^39^][^40^]
- **disler/claude-code-hooks-mastery** (~5k★) & **disler/claude-code-hooks-multi-agent-observability** (~3k★): Lernressource zu allen Lifecycle-Events bzw. Echtzeit-Observability-Dashboard über Multi-Agent-Sessions (Events per Hook → zentrale App).[^40^][^41^]
- **severity1/claude-code-prompt-improver**: UserPromptSubmit/PreToolUse/SubagentStart-Nudge-Engine (deklaratives JSON-Registry). Hook-level Evaluation kostet ~189 Tokens/Prompt (v0.4.0, −31 % ggü. v0.3.x); klare Prompts → null Skill-Overhead, vage Prompts → Skill lädt Research/Question-Guidance, max. 1–6 geerdete Rückfragen via AskUserQuestion. Designprinzip: „fire wide, self-cancel cheap“.[^42^]
- **yifanzz/claude-code-boost** (~162★): Auto-Approval-Hook — Fast-Path für sichere Tools (Read/LS/Glob), LLM-Analyse für komplexe Fälle, Cache gegen Doppel-API-Calls, harte Blocks für Destruktives.[^43^]
- **aleks-apostle/claude-code-patches** (~65★): cli.js-Patches (Thinking-Traces expanded, Subagent-Modell-Konfiguration); pinnt CC auf 2.0.62.[^44^]
- **Piebald-AI/tweakcc**: patcht native/npm-Installationen; System-Prompts als Markdown individualisierbar (515 Prompts mit Token-Counts, Tracking pro CC-Release), Custom Toolsets (`/toolset`), Subagent-Modell-Config, nicht-blockierender MCP-Startup (~15 s → ~7 s). Relevanz fürs Token-Thema: System-Prompt-Teile (z. B. „output-efficiency“) lassen sich schlanker patchen; Community berichtet Verhaltensverbesserung nach Ersatz des 2.1.88er Effizienz-Prompts.[^45^][^46^]
- Meta-Befund (YoraiLevi/claude-command-policy PRIOR-ART): Bei Command-Control-Hooks korreliert Popularität *invers* mit technischer Qualität — die Star-Leader nutzen naive Ganz-String-Regex (Compound-Command-Bug), AST-/shfmt-basierte Tools (banyudu/claude-warden, oryband, gwatts) sind korrekter, aber unbekannt.[^47^]

**„Ladder“-Konzept (gestufte Eskalation)** — kein kanonisches Produkt gefunden; die Community-Analogie ist konsistent über Quellen: **(1) Filtern** vor dem Modell (grep-Wrapper, rtk, Governor-Filter, Truncate-Guard) → **(2) Komprimieren/straffen** im laufenden Kontext (`/rewind` für Fehlversuche, Microcompact, `/compact` mit Fokus-Instruktion) → **(3) Compact** an natürlichen Task-Grenzen mit HANDOFF.md-Snapshot (PreCompact-Hook) → **(4) Clear** + Handoff-Rehydration bei Taskwechsel. Belege: Filter-first-Prinzip („the cheapest token is the one you never send“)[^48^], Compaction-Stufen + State-Externalisierung[^11^][^12^], /rewind-als-Zwischenstufe[^5^][^11^], Governor-Audit-Empfehlungsreihenfolge (compress memory → split to skills → filter output → /clear → /compact nur bei gleichem Task).[^49^]

### Token-Budget-Disziplin

- **valorisa/Claude-Skills** (TDD-getestete Skill-Sammlung): `spec-driven` erzwingt Pipeline SPEC→PLAN→IMPL→VERIF→SYNTHESE mit 3-Wege-Triage (FULL/LIGHT/SHIP) und **expliziten Token-Budgets**; `rescue-tokens` aktiviert bei Kontext ≥40 %/Rate-Limits/≥5 MCPs — 9 Token-Trap-Patterns, gemessene Antwort-Verkürzung 950→97 Wörter (**90 %**); `token-optimization` adressiert 4 Achsen (Cache-Hygiene, Context-Forking, Modell/Effort, Input-Filtering) mit CLAUDE.md-Templates — selbstberichtet $750/Monat → $100/Monat (**85 %**, nicht unabhängig verifiziert); `skills-smart-manager` entlädt stale Skills (>15 Turns ungenutzt).[^50^]
- **0xhimanshu/governor**: Usage-Governor mit `/governor:audit` (findet aufgeblähte Memory/Rule-Files + Top-3-Empfehlungen), `/governor:compress CLAUDE.md` (3 Stufen light/medium/aggressive, Protected-Spans für Code/Pfade/URLs, Quality-Guard lehnt Low-Savings-Ergebnisse ab und restored Backup), Plan-/Drift-Contracts (`/governor:plan` → `/governor:guard`), Telemetry-Ledger (geblockte Tokens, Compactions, Waste-Heat).[^33^][^49^]
- **CLAUDE.md-Templates für Sparsamkeit** (Evidenz-Stand 2026): Nur was Claude nicht aus dem Code ableiten kann; zwei Tests pro Zeile („würde ich das in jeden Prompt pasten?“ / „könnte Claude es selbst herausfinden?“); Root <60 Zeilen, Regel-Files 3–5 à <30 Zeilen mit Path-Scoping; keine `@path`-Imports als Spartrick (importierte Dateien laden trotzdem voll beim Launch); Apple-Support-App-Leak (Mai 2026) als Praxis-Referenz: ~8 Bullets, nur unobvious Architektur-Entscheidungen.[^7^][^9^]
- **Institutionalisierte Budgets**: Anthropic selbst nennt nur indirekte Budget-Instrumente (Workspace-Spend-Limits, TPM/RPM-Empfehlungen nach Teamgröße, z. B. 200k–300k TPM/User bei 1–5 Usern bis 10k–15k bei 500+).[^10^] Not-Diamond-30-Tage-Sequenz als Rollout-Rahmen: Woche 1 instrumentieren (ccusage, Cache-Hit-Rate), Woche 2 Cache/Kontext (CLAUDE.md-Audit, Output-Kompressor, Skills), Woche 3 Modell-Routing, Woche 4 Budgets pro User/Team — Gesamteffekt 30–90 % Kostensenkung je nach Workload.[^51^]

### Controversies & Conflicting Claims

1. **Advertised vs. real savings**: Die 60–95 %-Claims der Kompressions-Tools sind pro Payload wahr und pro Rechnung falsch-niedrig interpretiert (3,7 % kombiniert im 614M-Token-Replay). Gegenposition: Patterson misst 1,5 Mrd. gesparte Tokens/Monat und $3.808 — der Dissens ist der Nenner (Tool-Output-Tokens vs. Gesamtkosten) und die Workflow-Form.[^1^][^2^][^31^]
2. **Cache-Invalidierung durch Kompressoren**: Modifizierte Tool-Outputs/Prefixe können den Prompt-Cache brechen (1,25× Rewrite) und die Ersparnis auffressen oder umkehren ($8,29 vs. $0,33-Fall).[^2^][^5^]
3. **Qualitäts-Trade-offs**: Caveman 12,5 % falsche Entscheidungen bei VCLR 0,14 (Governor-Benchmark); JetBrains nur 8,5 % reale Ersparnis; SkillBenchmark kein Qualitätsgewinn. Gegenbefund: arXiv 2604.00025 berichtet +26 Accuracy-Punkte unter Brevity-Constraints (anderes Setting, einzelnes Paper).[^2^][^30^][^33^]
4. **CLAUDE.md-Mythen**: „Claude liest nur die ersten 200 Zeilen“ ist falsch (Hard-Cap gilt für MEMORY.md); eine Studie (25–500 Zeilen) fand *keinen* messbaren Adherence-Unterschied — kurz halten also primär aus Kostengründen, nicht weil lange Files ignoriert würden. Kontrast: HumanLayer-Faustregel ~150–200 befolgbare Instruktionen.[^7^][^9^]
5. **Rule-Files als versteckte Kostenfalle**: Re-Injektion pro Tool-Call (93K Tokens/46 % Window gemessen) widerspricht der verbreiteten „split your rules“-Empfehlung.[^9^]
6. **`.claudeignore` unzuverlässig**: dokumentierter Bypass-Bug (#34833); robuste Alternative ist `permissions.deny` — aber als Kontext-Filter nicht gleichwertig.[^26^]
7. **1M-Kontextfenster ≠ mehr nutzbarer Kontext**: Opus 4.6 liest 76 % (MRCR), Sonnet 4.5 nur 18,5 %; sauberes 200k-Fenster oft besser.[^29^]
8. **Subagent-Sparsamkeit**: Isolation spart Hauptkontext, aber ~7× Token-Volumen — ob Subagents „sparen“, hängt vollständig an Prompt-Disziplin.[^16^]

### Recommended Deep-Dive Areas

- **Primärdocs vertiefen**: code.claude.com/docs/en (costs, prompt-caching, model-config, hooks, best-practices) — die kanonische Domain seit 2026; alte docs.claude.com-URLs sind Redirects (Frische-Proxy für Zitate).[^7^][^10^]
- **codepointer-Original lesen** (Substack, 18.06.2026; direktes Öffnen hier technisch blockiert — über capitalandcompute/arceapps verifiziert): Methodik des Replays, Qualitätsfrage offen.[^1^][^2^]
- **Eigenmessung statt README-Zahlen**: `rtk gain --daily`, `/governor:benchmark`, ccusage-Baseline; Not-Diamond-4-Wochen-Plan als Messrahmen.[^2^][^33^][^51^]
- **Truncate-Guard selbst bauen**: overloop-Design (Spill-File + Preview) als Blaupause; Integration mit PreCompact-Snapshot.[^36^][^11^]
- **Compound-Bash-sichere Guards**: AST-/shfmt-basierte Ansätze (banyudu/claude-warden, gwatts/claude-compound-bash) statt Regex-Leader evaluieren.[^47^]
- **Skill-Ökonomie**: 5k/25k-Token-Caps nach Compaction, `name-only`-Modus (codeprakhar25/optimize), Duplikations-Audit CLAUDE.md↔SKILL.md.[^18^][^19^]

### Quellen

[^1^]: capitalandcompute.net — „Do Claude Code Token-Saving Tools Actually Cut Your Bill?“ (2026-08-06), inkl. Tabelle Advertised vs. measured on $926 bill. https://capitalandcompute.net/blog/claude-code-token-saving-tools-rtk-headroom-caveman/
[^2^]: ArceApps Blog — „RTK vs Caveman: real token savings in AI agents“ (2026-07-15), inkl. 614M-Token-Replay-Tabelle, JetBrains-8,5 %-Benchmark, Erwartungswerte. https://arceapps.com/blog/rtk-vs-caveman-token-savings/
[^3^]: juejin.cn — „Token压缩工具实测：614M数据告诉你90%节省承诺有几分真“ (2026-06-22), rtk-22 %-/78 %-Analyse. https://juejin.cn/post/7653703276806012947
[^4^]: buildthisnow.com — „Claude Code Prompt Caching“ (2026-06-15), 82 %-Rechenbeispiel, TTLs, Mindestgrößen. https://www.buildthisnow.com/blog/guide/development/claude-code-prompt-caching
[^5^]: sup3x/claude-code-eco — docs/token-optimization-guide.md (2026-07-02), Cache-Invalidatoren/-sichere Aktionen, MCP-Debloat. https://github.com/sup3x/claude-code-eco/blob/main/docs/token-optimization-guide.md
[^6^]: Dosu — „Prompt Caching“ (2026-05-29), 3-Layer-Cache-Modell, Invalidationsliste. https://app.dosu.dev/79e9998d-d0c8-42ea-ad76-efe5e408402c/documents/570723cf-f6cf-477d-80d1-05acf2d1e4d9
[^7^]: alexdunlop.com — „CLAUDE.md Best Practices: What the Evidence Supports (2026)“ (2026-08-12), 200-Zeilen-Mythos, Subdirectory-Loading, Apple-Leak, 922-File-Studie. https://www.alexdunlop.com/writing/claude-md-best-practices
[^8^]: avilevi.co.il — „Managing the Claude Code Context Window Without Wasting Tokens“ (2026-04-21), max 200 Zeilen, Opus-plant/Sonnet-führt. https://www.avilevi.co.il/en/blog/manage-claude-code-context-window/
[^9^]: abhishekray07/claude-md-templates — principles.md, Rule-File-Re-Injection 93K/46 % (Issue #32057), HumanLayer-150–200-Regel. https://github.com/abhishekray07/claude-md-templates/blob/main/principles.md
[^10^]: Anthropic Docs — „Manage costs effectively“ (direkt geöffnet, 2026-08-13): $6/User/Tag, 95 %-Auto-Compact, `/compact`-Custom-Instructions, CLAUDE.md-Summary-Instructions, TPM/RPM-Tabelle, Background-Usage. https://docs.anthropic.com/s/claude-code-cost
[^11^]: hidekazu-konishi.com — „Claude Code Compaction and Long-Session Operations Guide“ (2026-06-14), `/compact [instructions]`, PreCompact-Hook, State-Externalisierung. https://hidekazu-konishi.com/entry/claude_code_compaction_and_long_session_guide.html
[^12^]: nathanonn.com — „Never Let Claude Code Auto-Compact Again“ (2026-05-01), Compact-Instructions-Template, HANDOFF.md-Pattern, compact/clear/rewind-Abgrenzung. https://www.nathanonn.com/claude-code-never-auto-compact/
[^13^]: totalum.app — „Claude Code Hooks in 2026: A Production Playbook“ (2026-06-26), Exit-Code-Vertrag, hookSpecificOutput, block_destructive.sh. https://www.totalum.app/blog/claude-code-hooks-totalum
[^14^]: hidekazu-konishi.com — „Claude Code Hooks Complete Guide“ (2026-06-07), Test/Debug-Praxis, PreToolUse vs. PostToolUse. https://hidekazu-konishi.com/entry/claude_code_hooks_complete_guide.html
[^15^]: rtk-ai/rtk Issue #260 — PreToolUse-Rewrite-Hook umgeht Deny-Rules via permissionDecision allow (2026-02-23). https://github.com/rtk-ai/rtk/issues/260
[^16^]: nimbalyst.com — „Claude Code Subagents: A Practical 2026 Guide“ (2026-05-05), ~7× Token-Volumen, Isolation. https://nimbalyst.com/blog/claude-code-subagents-guide/
[^17^]: composio.dev — „9 Ways to Cut Token Consumption in Claude Code“ (2026-05-29), Filter-Wrapper, Modell-Matching, Handoff, Skills 30–100 Tokens, MCP-Steuer. https://composio.dev/content/ways-to-cut-token-consumption-in-claude-code
[^18^]: segmentfault.com — „Anthropic 官方的 7 种 Claude Code 自定义方式“ (2026-07-17), Skill-Caps 5k/25k, Anti-Patterns. https://segmentfault.com/a/1190000048039552
[^19^]: supabase/agent-skills Issue #49 — CLAUDE.md↔SKILL.md-Duplikation verschwendet Kontext (2026-03-10). https://github.com/supabase/agent-skills/issues/49
[^20^]: lobehub — @cocaxcode/token-optimizer-mcp, Referenztabelle (Tool Search 77k→8,7k, ~47 %; MCP-Pruning 5–12 %/Turn). https://lobehub.com/mcp/cocaxcode-token-optimizer-mcp
[^21^]: agiflow.io — „Claude Code on Opus 5“ (2026-07-25), Effort-Semantik, Cache-Invalidierung, opusplan vs. ultracode. https://agiflow.io/blog/claude-code-opus-5-subscription-guide
[^22^]: mcp.directory — „Claude Code Effort Levels Explained (2026)“ (2026-07-09), Primärquellen-Liste (claude.com/blog, platform/code.claude.com Docs). https://mcp.directory/blog/claude-code-effort-levels-explained-2026
[^23^]: mydataschool.com — „Stop wasting Claude tokens: 5 tricks I actually use every day“ (2026-04-20), RTK 76,1 %-Effizienz-Beispiel, 60–70 %-Gesamtclaim. https://mydataschool.com/blog/how-to-save-tokens/
[^24^]: codewithmukesh.com — „30 Advanced Claude Code Tips“ (2026-08-07), Kontext-als-Budget, Explore=Haiku, /sandbox. https://codewithmukesh.com/blog/claude-code-tips-advanced/
[^25^]: buildthisnow.com — „Claude Code Pricing“ (2026-05-03), opusplan-Empfehlung, API-Break-even ~70M Tokens/Monat. https://www.buildthisnow.com/blog/guide/development/claude-code-pricing
[^26^]: anthropics/claude-code Issues #29455 (.claudeignore-Feature) & #35926 (claude:ignore, Verweis auf Bypass-Bug #34833). https://github.com/anthropics/claude-code/issues/29455 ; https://github.com/anthropics/claude-code/issues/35926
[^27^]: spacecake.ai — „Master Claude Code's Context Window“ (2026-03-26), .claudeignore 40–70 %, CLAUDE.md 300–500 Zeilen, /mcp-Disconnect. https://www.spacecake.ai/blog/claude-code-context-management/
[^28^]: shipyard.build — „How to track Claude Code usage + analytics“ (2026-04-21), /usage-/context-Aliase, Plan-Token-Fenster. https://shipyard.build/blog/claude-code-track-usage/
[^29^]: getunblocked.com — „Claude Code Context Window: How It Works (2026)“ (2026-06-25), 200k/1M, MRCR 76 % vs. 18,5 %, 4 Kommandos. https://getunblocked.com/blog/claude-code-context-window/
[^30^]: arceapps.com — „Caveman: The Skill That Teaches AI Agents to Shut Up“ (2026-06-20), Bibliographie inkl. SkillBenchmark, arXiv:2604.00025. https://arceapps.com/blog/caveman-skill-token-compression/
[^31^]: andrewpatterson.dev — „Token Compression for Claude Code with RTK + Headroom“ (2026-04-18), 1,5 Mrd. Tokens, $3.808, Per-Command-/Per-Modell-Tabellen. https://andrewpatterson.dev/posts/token-savings-rtk-headroom/
[^32^]: deployhq.com — „6 free GitHub repos that cut your Claude Code token bill“ (2026-05-04), rtk/caveman/code-review-graph/agent-browser + $100-Caveat. https://www.deployhq.com/blog/free-github-repos-for-claude-code
[^33^]: 0xhimanshu/governor — GitHub-README (2026-05-01), V2-Sonnet-Benchmark (Caveman 69,1 %/VCLR 0,14/12,5 % wrong vs. Governor 45,5 %/0,00/0 %), Multi-Turn-Pilot, Filter-Mechanik >40 % Duplikate. https://github.com/0xhimanshu/governor
[^34^]: claudedirectory.org — „Safe Command Auto-Approval Hook“ (Juli 2026), Deny-/Safe-Pattern-Listen. https://claudedirectory.org/hooks/safe-command-approval
[^35^]: juejin.cn — „Claude Code Hooks 安全栅栏“ (2026-05-30), High-Risk-Blacklist + Sensitive-Files-Guard. https://juejin.cn/post/7645262722303737892
[^36^]: libraries.io/pypi/overloop — overloop 0.3.0 (2026-07-04), Loop-/Dedup-/Truncate-Guard-Design, Spill-File-Mechanik. https://libraries.io/pypi/overloop
[^37^]: emanueleielo/compact-middleware — README (2026-04-02), Trigger 0,85, Microcompact, TruncateArgs. https://github.com/emanueleielo/compact-middleware
[^38^]: thedotmack/claude-mem Issue #1719 — PreToolUse:Read-Truncation macht Datei unlesbar (2026-04-11). https://github.com/thedotmack/claude-mem/issues/1719
[^39^]: agentskillshub.top — karanb192/claude-code-hooks Profil (2026-07-19), 451★, MIT. https://agentskillshub.top/skill/karanb192/claude-code-hooks/
[^40^]: ithiria894/awesome-claude-code-hooks — Hook-Collections (karanb192 10 Hooks, Aedelon 11 Hooks, JalelTounsi 30). https://github.com/ithiria894/awesome-claude-code-hooks
[^41^]: itgoyo/awesome-claude-code — Hooks-Tabelle (disler mastery ~5k★, multi-agent-observability ~3k★, diet103 showcase 9,4k★). https://github.com/itgoyo/awesome-claude-code
[^42^]: severity1/claude-code-prompt-improver — README (v0.4.0: 31 % Overhead-Reduktion, ~189 Tokens/Prompt, Nudge-Engine). https://github.com/severity1/claude-code-prompt-improver
[^43^]: yifanzz/claude-code-boost — README, Auto-Approval-Logik (Fast-Path/LLM/Cache/Block). https://github.com/yifanzz/claude-code-boost ; Sternezahl via claudefa.st (2026-08-10): 162★. https://claudefa.st/blog/tools/customization/customize-claude-code
[^44^]: aleks-apostle/claude-code-patches (claude-code-thinking-patch) — README, 65★, CC 2.0.62. https://github.com/aleks-apostle/claude-code-thinking-patch
[^45^]: Piebald-AI/tweakcc — README (System-Prompt-Patching, Toolsets, MCP-Startup 15 s→7 s). https://github.com/Piebald-AI/tweakcc
[^46^]: Piebald-AI/claude-code-system-prompts — README (515 Prompts, Token-Counts, v2.1.227, 10.08.2026). https://github.com/Piebald-AI/claude-code-system-prompts
[^47^]: YoraiLevi/claude-command-policy — docs/PRIOR-ART.md (2026-06-26), Popularität-vs.-Qualität-Befund, Compound-aware-Tools. https://github.com/YoraiLevi/claude-command-policy/blob/main/docs/PRIOR-ART.md
[^48^]: tokens4breakfast.app — „Claude Code Best Practices“ (2026-08-02), Filter-first-Prinzip. https://www.tokens4breakfast.app/support/claude-code-best-practices
[^49^]: claudepluginhub.com — governor /audit-Command (Empfehlungsleiter: compress → split → filter → /clear → /compact). https://www.claudepluginhub.com/commands/0xhimanshu-governor/commands/audit
[^50^]: valorisa/Claude-Skills — README (2026-08-08), spec-driven Token-Budgets, rescue-tokens 90 %, token-optimization 4 Achsen/$750→$100. https://github.com/valorisa/Claude-Skills
[^51^]: notdiamond.ai — „How to reduce Claude Code costs without sacrificing output quality“ (2026-05-06), 30-Tage-Sequenz, 30–90 %. https://www.notdiamond.ai/blog/how-to-reduce-claude-code-costs-without-sacrificing-output-quality

Nicht verifiziert / nicht gefunden: codepointer-Substack-Original (direkter Zugriff blockiert; Zahlen über drei unabhängige Sekundärquellen konsistent); „bash-dump-guard“ und „Ladder“ als kanonische Repos (nur Konzept-Analoga: overloop, Governor, compact-middleware); stefanosalvucci/promptzone-Artikel zu Governor enthalten unseriöse Details (erfundener pip-Install) und wurden nicht als Beleg verwendet.
