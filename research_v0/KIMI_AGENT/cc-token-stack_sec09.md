# Kurzfassung

Wer Claude Code billiger machen will, braucht nicht mehr Tools, sondern mehr Hygiene. Das ist die erste Botschaft dieses Reports: Die nativen Hebel — Prompt-Cache-Schutz, Env-Aufräumen, CLAUDE.md-Disziplin, Compact-Instructions, `/clear` statt Auto-Compact — schlagen jedes Dritt-Tool am Markt. Im 614-Millionen-Token-Replay eines realen Nutzungsmonats entfielen auf die drei viralsten Spar-Tools (rtk, headroom, caveman) kombiniert gerade einmal 3,7 % der Rechnung[^1^] — während der ungeschützte Prompt-Cache, den dieselben Tools teilweise beschädigen, als größter Dollar-Hebel der gesamten Kette im Hintergrund lag[^2^][^7^][^8^]. Der Cache-Read-Faktor 0,1× macht Prefix-Stabilität zur Kennzahl Nummer eins: Eine Optimierung, die den Prefix verändert, ohne die Cache-Hit-Rate zu messen, ist keine Optimierung, sondern ein Blindflug.

Die zweite Botschaft betrifft die Marktstruktur: Dieser Report hat rund 180 Repositories erfasst, davon etwa 40 direkt stack-relevant. Die Star-Rangliste des Feldes wird durch unabhängige Messung nicht bestätigt, sondern invertiert. rtk (≈76k Stars) fällt mit drei offenen Security-Befunden und zwei unabhängigen Negativ-Messungen aus dem Stack; caveman (≈98k Stars) liefert gemessene 8,5 % statt beworbener 65 % bei dokumentierten 12,5 % Fehlentscheidungen; headroom (≈66k Stars) ist wegen eines gemessenen Cache-Bruchs (2–7× Kostensteigerung) nur nach Verifikation des Fixes zulässig[^2^][^7^][^8^][^17^][^68^]. In den Stack kommen stattdessen die leisen Kandidaten: ponytail als einziger unabhängig bestätigter Gewinn (−10,3 % Kosten, p=0,004), squeez auf der Filter-Schicht, context-mode als Output-Sandbox und magic-compact als Session-Verdichtung mit Rückhol-Garantie[^18^][^69^][^73^][^29^]. Ehrlichkeit ist in diesem Feld ein besserer Prädiktor für Wirksamkeit als Adoption.

Die dritte Botschaft ist architektonisch: Der empfohlene Stack ist keine Tool-Liste, sondern eine Mechanismus-Reihenfolge — Vermeiden → Verlagern → Verdichten (nur reversibel) → Verbilligen. Operationalisiert wird sie über ein Regelwerk, nicht über Installationen: der Hook `bash-dump-guard.mjs` (Loop-Guard, Spill über 2.000 Tokens, Dedup, niemals `allow`) deckt die Always-on-Stufe ab, das Ladder-Modell (Stufe 0 Filtern → Stufe 1 Straffen → Stufe 2 Compact+Snapshot → Stufe 3 Clear+Handoff) regelt die Eskalation an gemessenen Triggern[^146^][^148^]. Drei Profile teilen die Zielkorridore: A (kurze Sessions) braucht null zusätzliche Tools, B (lange Sessions) erreicht ehrliche 15–30 % Input-Ersparnis, C (Budget-getrieben) 30–70 % Kosten über Routing[^124^][^14^].

Zum Vorgehen: Der Report konsolidiert sechs Wide-Recherche-Facetten und acht Deep-Dive-Dimensionen mit rund 70 README-Volllektüren, ergänzt um Issue-Tracker, unabhängige Benchmarks und eine Cross-Verification aller Konfliktfälle. Alle Star-Zahlen und Push-Daten wurden per GitHub-API am 2026-08-13 verifiziert. Jede Empfehlung trägt ein Evidenz-Tier, jede Absage einen Re-Evaluierungs-Trigger.

## 16. Umsetzungs-Roadmap, Messprotokoll und Fazit

Der Stack aus Kapitel 14 und das Regelwerk aus Kapitel 15 sind nur so gut wie ihre Inbetriebnahme. Die häufigste Fehlsequenz in der Praxis ist „erst komprimieren, dann messen": Ohne Baseline ist jede Ersparnis Behauptung, und genau daran scheitern die beworbenen Prozentzahlen des Marktes. Dieses Kapitel legt deshalb einen 30-Tage-Rollout fest, bei dem die Messung Woche 1 ist und nicht Woche 4, definiert das Messprotokoll mit realistischen Zielkorridoren und schließt mit dem Fazit samt Watchlist für die nächste Tool-Generation.

### 16.1 30-Tage-Rollout

**Tabelle 16.1 — Vier-Wochen-Rollout mit Abnahmekriterien**

| Woche | Fokus | Maßnahmen (aus Kap. 14/15) | Abnahmekriterium |
|---|---|---|---|
| 1 | Instrumentieren | ccusage-Baseline (`npx ccusage daily`), CodeBurn (`optimize --apply`, `act report` ab Tag 3), `cleanupPeriodDays` hochziehen, Cache-Hit-Rate aus Provider-Usage erfassen, Kontext-%-Statusline (token-tracker) oder 5h-Monitor einrichten[^34^][^35^][^149^][^36^][^38^] | 7 Tage lückenlose Baseline: Kosten/Tag, Cache-Hit-Rate, Kontext-Verteilung, MCP-Tool-Def-Tokens bekannt und dokumentiert |
| 2 | Cache & Kontext | Stufe-0-Env (`CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1`, Modell-Pinning, `MAX_MCP_OUTPUT_TOKENS`), CLAUDE.md-Audit (<60 Zeilen), Compact-Instructions, Rule-File-Re-Injection prüfen, `/clear`+HANDOFF-Routine etablieren[^41^][^132^] | Cache-Hit-Rate >90 %; Systemprompt-/Rule-Overhead quantifiziert und auf Plan-Ist reduziert; kein Auto-Compact ohne vorherigen Handoff mehr |
| 3 | Filter & Sandbox | bash-dump-guard.mjs registrieren (eine Woche nur beobachten, dann Schwellen schärfen), squeez **oder** tokf (genau ein Rewrite-Hook), context-mode, magic-compact; Ladder-Trigger 60/80/90 % aktivieren[^69^][^73^][^29^] | Guard blockt nachweisbar ohne False-Positive-Beschwerden; Filter zeigen Net-Win-Gate-Ersparnis im Audit; FTS5-Retrieve funktioniert nach `/compact` |
| 4 | Budgets & Routing (optional, nur Profil C) | CodeBurn-Budget-Guards (Soft-/Hard-Cap); CCR mit starkem `default`+`think`, billigem `background`; Tool-Calling-Smoke-Test je Provider-Rolle; alternativ minimal via `CLAUDE_CODE_SUBAGENT_MODEL=haiku`[^35^][^124^] | Routing nur nach bestandenem Smoke-Test produktiv; realized-vs-estimated-Report zeigt Ersparnis innerhalb des Profil-Korridors |

Die Sequenz der Tabelle ist selbst Teil der Empfehlung, und ihre Logik verdient eine ausführliche Begründung. Woche 1 installiert bewusst nichts, das spart: Sie baut die Messinfrastruktur, ohne die alle späteren Wochen nicht verifizierbar wären — und sie schützt diese Infrastruktur gleich mit, weil der 30-Tage-Lösch-Default von Claude Code die Session-Dateien und damit die Messbasis rückwirkend zerstört[^38^]. Woche 2 widmet sich dem größten Hebel, der keinen Cent kostet: Env-Hygiene und Cache-Schutz sind der Punkt, an dem der Report seine Kernbotschaft operationalisiert, bevor irgendein Dritt-Tool ins Spiel kommt[^41^]. Erst Woche 3 führt kauf- bzw. installpflichtige Komponenten ein — und zwar in der Reihenfolge der Schichten, mit der expliziten Beobachtungswoche für den Guard, weil ein Guard, der einmal zu viel blockt, deinstalliert wird, einer, der zweimal zu wenig blockt, behalten wird. Woche 4 schließlich ist bewusst optional: Routing ist ein Kosten-Hebel, kein Token-Hebel, und mit 193 offenen Tool-Calling-Issues im CCR-Repo die Komponente mit dem höchsten Qualitätsrisiko des gesamten Stacks[^124^]. Wer Woche 4 auslässt, hat nichts verpasst — wer Woche 1 auslässt, hat nichts bewiesen. Die Abnahmekriterien sind bewusst binär formuliert: Eine Woche gilt als abgeschlossen, wenn ihr Kriterium messbar erfüllt ist, nicht wenn ihre Tools installiert sind.

### 16.2 Messprotokoll

Das Messprotokoll kennt vier Baseline-Metriken, die ab Woche 1 täglich erhoben werden: **Kosten/Tag** (ccusage daily, getrennt nach Input/Output/Cache-Read), **Cache-Hit-Rate** (Zielkorridor >90 %; gemessen aus den Provider-Usage-Feldern `cache_read` vs. `cache_creation`, nie aus Proxy-Telemetrie — headroom #2438 zeigt, dass Proxys hier falsch labeln können)[^8^], **Kontext-%-Verteilung** (Statusline oder Transkript-Messung: Anteil Systemprompt/Tool-Schemas vs. File-Reads vs. Tool-Output vs. Transkript) und **MCP-Tool-Def-Tokens** pro Session (das statische Manifest vor der ersten Nachricht; globale Memory-MCPs allein kosten 4,4–8,6k Tokens)[^118^].

Vorher/Nachher-Disziplin heißt: Jede Komponente wird einzeln eingeführt, mindestens drei Tage gegen die Baseline verglichen und über den CodeBurn-`act report` als realisierte statt geschätzte Ersparnis quittiert[^35^]. Zwei Änderungen gleichzeitig sind verboten, weil die Schichten sich gegenseitig den Nenner verkleinern und Effekte sonst nicht zurechenbar sind. Wer einen Proxy evaluiert, prüft zuerst die Cache-Hit-Rate, dann die Kompressionsrate — ein Prefix-verändernder Eingriff, der die Hit-Rate unter 90 % drückt, ist per Definition ein Verlust, egal was die Token-Zählung zeigt.

Die Zielkorridore sind bewusst asymmetrisch und folgen den Profilen aus Kapitel 14.3: **Profil A** (kurze Sessions) braucht 0 % zusätzliche Tools — Verschwendungsvermeidung und Katastrophenschutz sind der gesamte ehrliche Erwartungswert, jeder Proxy ist hier Overhead[^14^]. **Profil B** (lange Sessions) kann 15–30 % Input-Ersparnis erwarten, aber nur als Zusammenspiel von magic-compact, genau einem cache-sicheren Proxy (llmtrim oder tokdiet) und cache-fix — einzeln bleibt jede Komponente unter ihrem Potenzial[^29^][^89^][^90^]. **Profil C** (Budget-getrieben) verschiebt die Optimierung auf die Preisachse: 30–70 % Kostenreduktion über Routing sind realistisch, die Community-Angaben von 50–99 % gelten nur mit diszipliniertem Rollen-Setup und bestandenem Smoke-Test[^124^]. Wer nach vier Wochen außerhalb seines Korridors liegt, hat nicht zu wenig optimiert, sondern falsch gemessen.

### 16.3 Fazit und Watchlist

Das Fazit dieses Reports lässt sich auf einen Satz bringen: Token-Optimierung für Claude Code ist ein Hygiene-Problem mit einem Tool-Anhang, nicht umgekehrt. Der größte Hebel (Cache-Kohärenz) ist nativ und kostenlos, der zweitgrößte (Read-/Output-Disziplin) ist Verhalten und Regelwerk, und erst der dritte ist Software — und selbst dort gewinnen die kleinen, ehrlichen Kandidaten gegen die viralen. Das Regelwerk (Guard plus Ladder) ist das eigentliche Produkt: Es macht aus Installationen Betrieb und aus Prozentversprechen Messpflicht.

Die **Watchlist** für die Re-Evaluierung in den nächsten Quartalen umfasst fünf Positionen: **Paritok-4B** — der ernsteste Kandidat der Kleinmodell-Generation (45K Coding-Trajektorien), aufnehmbar nach Fix der Issues #40/#41 und unabhängiger End-to-End-Messung[^27^]. **DietCode** (Scaledown) — modellbasierte Kompression als Plugin, derzeit minimal verbreitet, Launch abwarten[^84^]. **Modellbasierte Kompression allgemein** — thlibo, squeezr, KRLabsOrg-squeez markieren die dritte Generation (lokale Kleinmodelle als Kompressoren, vgl. Kapitel 3.2); sie bleibt Watchlist, bis Cache-Sicherheit und Qualitätsparität unabhängig belegt sind[^135^]. **Der offizielle Plugin-Marketplace** — seine Entwicklung entscheidet, welche Community-Tools kuratiert und damit quasi-normiert werden[^28^]. **headroom nach dem #2438-Fix** — Re-Entry nur nach eigener Verifikation der Provider-Cache-Felder gegen Direktbetrieb, niemals gegen die Proxy-Telemetrie[^8^]. Jede Position trägt denselben Trigger wie die Absagen in Kapitel 14.4: Schließen des Issues, unabhängige Messung, Cache-Hit-Nachweis — in dieser Reihenfolge.

## Anhang A: Master-Repo-Matrix

Die Matrix konsolidiert alle erfassten Repositories in fünfzehn Schichten (0–14), von der Mess-Basis bis zur Obsoleszenz-Referenz; sie ist die Volltabelle hinter den Stack-Entscheidungen der Kapitel 2 bis 14. Alle Star-Zahlen und Push-Daten wurden per GitHub-API am 2026-08-13 verifiziert, so nicht anders markiert. **Evidenz-Legende:** ★★★ = unabhängig verifiziert (Benchmark/Peer-Review/mehrere Sekundärquellen) · ★★ = dokumentierte, reproduzierbare Eigenbenchmarks · ★ = Hersteller-Claim ohne Fremdbeleg. **Status-Legende:** ✅ Kernempfehlung · 🟡 Alternative/situativ · 🔵 Nische/Beobachten · ⚠️ Einschränkung/Risiko · ❌ Nicht empfohlen/Obsolet.

### Schicht 0 — Messung & Observability

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| ccusage/ccusage | Referenz-CLI: Token/Kosten aus lokalen JSONL-Logs, 16 Agent-Quellen | CLI/TUI | 17.9k | 2026-08-12 | ★★★ | ✅ |
| getagentseal/codeburn | Messung + Waste-Analyse + Fixes + Budget-Guards + realized-vs-estimated | CLI+MCP+Menubar | 9.3k | 2026-08-12 | ★★ | ✅ |
| steipete/CodexBar | macOS-Menübar: Usage-Limits Codex+Claude | App | 20.0k | 2026-08-12 | ★★ | 🟡 (macOS) |
| Maciek-roboblog/Claude-Code-Usage-Monitor | Echtzeit-Burn-Rate + 5h-Fenster-Prognose | TUI | 8.5k | 2026 aktiv | ★★ | 🟡 |
| stormzhang/token-tracker | Statusline + Dashboard (Claude/Codex/Kimi) | pip+Hook | ~478 | 2026-05+ | ★ | 🔵 |
| mag123c/toktrack | Rust-Tracker; persistenter Cache überlebt Session-Löschung | CLI | klein | 2026-06 | ★ | 🔵 |
| egorfedorov/claude-context-optimizer | Kontext-Wiederverwendung tracken, ROI-Reports | Plugin | 92 | 2026-08-11 | ★★ | 🔵 |
| f/agentlytics | Multi-Tool-Analytics-Dashboard (8 Agenten) | App | 560 | 2026-08-03 | ★ | 🔵 |
| nikitadoudikov/claude-pulse | Zero-Dep-Dashboard, Phone-Approval | App | 244 | 2026-07-19 | ★ | 🔵 |
| onikan27/claude-code-monitor | Live-Multi-Session-Dashboard | CLI+Web | 298 | 2026-01-29 | ★ | 🔵 |
| RonnieTheTester/headroom-meter | TUI-Dashboard für Headroom | TUI | 6 | 2026-06-24 | ★ | 🔵 |
| Growth4U-systems/claude-token-hygiene | Audit: System-Overhead ~15–35k Tokens | Skill | 10 | 2026-03-05 | ★ | 🔵 |
| ncoevoet/claude-markdown-health-check | .claude/-Setup-Audit | Skill | 38 | 2026-08-12 | ★ | 🔵 |
| philipp-spiess/claude-code-costs | Früher Tracker — von ccusage abgelöst | CLI | 203 | 2025-06 | — | ❌ obsolet |
| ColeMurray/claude-code-otel | OTEL-Exporter — durch native OTEL ersetzt | OTEL | 485 | 2025-06 | — | ❌ |
| chiphuyen/sniffly | Usage-Dashboard, stagniert | App | 1.3k | 2025-08 | — | ❌ stale |
| disler/claude-code-hooks-multi-agent-observability | Hook-Event-Echtzeit-Monitoring | App | ~3k | 2026-02 | ★ | 🔵 |

### Schicht 1 — Systemprompt-/Installations-Ebene & Prompt-Hygiene

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| Piebald-AI/tweakcc | Patcht Systemprompts/Toolsets; Re-Patch nach jedem Update | Patcher | 2.4k | 2026-08-10 | ★★ | 🟡 (brüchig) |
| Piebald-AI/claude-code-system-prompts | Referenz aller Systemprompts mit Token-Counts (515 Prompts) | Doku | 12.3k | 2026-08-12 | ★★★ | ✅ (Datenbasis) |
| aleks-apostle/claude-code-patches | Thinking-Toggle-Patch | Patch | 67 | 2025-12 | ★ | 🔵 stale |
| gist roman01la patch-claude-code.sh | Gegenentwurf: entfernt Kürze-Anweisungen | Gist | 356★ | — | ★★ | 🔵 (Signal) |
| severity1/claude-code-prompt-improver | Prompt-Hygiene-Hook, ~189 Tokens/Prompt | Hook/Plugin | 1.8k | 2026-06 | ★★ | 🟡 |
| nidhinjs/prompt-master | Prompt-Formulierungs-Skill | Skill | 11.1k | 2026-06 | ★ | 🔵 |
| Siddartha1997-creator/prune | Prompt-Refiner (Intent-Extraktion) | Tool | 0 | 2026-08-08 | ★ | 🔵 |

### Schicht 2 — Verhaltens-/Output-Stil-Skills

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| DietrichGebert/ponytail | YAGNI-Skill; einziger unabhängig bestätigter Gewinn (−10,3 %, p=0,004) | Plugin/Skill | 101.5k | 2026-08-07 | ★★★ | ✅ |
| JuliusBrussee/caveman | Terse-Output; beworben 65 %, gemessen 8,5 %; 12,5 % Fehlentscheidungen | Skill+Hooks+CLI | 97.8k | 2026-08-12 | ★★★ (widerlegt) | ⚠️ |
| multica-ai/andrej-karpathy-skills | Verhaltens-CLAUDE.md (kein Token-Claim) | Plugin | 201.9k | 2026-04 | ★ | 🔵 |
| ayghri/i-have-adhd | „Answer first" → kürzere Outputs | Skill | 20.0k | 2026-08-10 | ★ | 🟡 |
| UditAkhourii/adhd | Tree-of-Thought mit Pruning | Skill | 3.5k | 2026-08-05 | ★ | 🔵 |
| iceHub82/beeline | Merge caveman+i-have-adhd (quality-gescort) | Output-Style | 6 | 2026-08-04 | ★ | 🔵 |
| carlosduplar/caveman-output-style-claude-code | Native Output-Styles, ~40 % Claim | Output-Style | 17 | 2026-05-06 | ★ | 🔵 |
| johnsnow1011/taxman | Filler-/Preamble-Cutter | Skill | 3 | 2026-07-03 | ★ | 🔵 |
| vliggio/claude-faa-speak | FAA-Funkstil ~53 % | Plugin | 0 | 2026-07-24 | ★ | 🔵 (Kuriosität) |
| glitchwerks/mini-caveman | Dependency-freier Terse-Mode | Skill | 0 | 2026-07-26 | ★ | 🔵 |

### Schicht 3 — Shell-/Tool-Output-Filter

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| rtk-ai/rtk | Rust CLI-Proxy, 100+ Kommandos; JetBrains +7,6 %; Issue #260 (allow-Bug) | PreToolUse-Hook+CLI | 75.9k | 2026-08-12 | ★★★ (widerlegt) | ⚠️ |
| claudioemmanuel/squeez | Hook-Kompressor, reversibel (Blob+Retrieve), Net-Win-Gate | Hook+MCP | 182 | 2026-08-12 | ★★ | 🟡 |
| mpecan/tokf | Config-driven TOML-Filter (Rust) | CLI+Shell | 192 | 2026-08-12 | ★★ | 🟡 |
| ojuschugh1/sqz | Ehrlichster Mittelwert: 24,7 % Ø (3.003 Messungen) | CLI/Hook | 593 | 2026-06-21 | ★★ | 🟡 |
| edouard-claude/snip | YAML-Filter-Pipelines (Go-Proxy), 60–90 % Claim | Proxy | 406 | 2026-08-04 | ★★ | 🟡 |
| ppgranger/token-saver | 36 Prozessoren; offizielle Community-Marketplace | Plugin | 136 | 2026-08-10 | ★★ | 🟡 |
| 3rg0n/thlibo | Sauberstes Pattern: PreToolUse+updatedInput, Gemma-4-Fallback | Hook (Go) | 9 | 2026-08-12 | ★★ | 🔵 (Architektur-Referenz) |
| hansipie/ecotokens | Hook-Kompression + USD-Tracking | Hook (Rust) | 18 | 2026-07-29 | ★ | 🔵 |
| kurovu146/kuro-lean | Output-Kompression + Blocking + Cache-Rescue | CLI+Hooks | 15 | 2026-08-10 | ★ | 🔵 |
| AbhayShalghar/ctk | „Context Token Killer", breiter Scope (MCP+native+Bash) | Hook/Go | 1 | 2026-06-26 | ★ | 🔵 |
| cardimvitor/tk („Token Killer") | VS-Code-Ext. + CC-Hook; Supply-Chain-Frage | VSIX+Hook | n/a | 2026-07-28 | ★ | ⚠️ |
| suhaanthayyil/lean-mode | Bundle: RTK-Filter + caveman-ultra + Graph-First | Skill | 3 | 2026-07-25 | ★ | 🔵 |
| sphragis-oss/isthmos | Go-Binary PostToolUse/Generik-Filter | Hook | 0 | 2026-08-03 | ★ | 🔵 |
| ryanportfolio/STK | Read-Results → zeilennummerierte Outlines | Hook (JS) | 1 | 2026-08-12 | ★ | 🔵 |
| illuwa/ctx-diet | Tool-Output-Hook, 65,6 % Eigenmessung | Hook | 3 | 2026-07-25 | ★ | 🔵 |
| phuetz/lm-resizer | Rust-Filter (Tests/Diffs/Logs/JSON) | CLI/MCP | 2 | 2026-07-02 | ★ | 🔵 |
| Guazzihub/Sieve | Bash-Filter-Plugin „verifiable loss policy" | Plugin | 0 | 2026-07-14 | ★ | 🔵 |
| wasdevv/lean-output | RSpec/RuboCop-Kompressor | Plugin | 0 | 2026-08-12 | ★ | 🔵 (Ruby) |
| AndVl1/gw | Gradle-Output-Filter | CLI+Hook | 4 | 2026-06-25 | ★ | 🔵 (JVM) |
| helmif/wafi | Shell-Filter-Wrapper | Wrapper | 0 | 2026-04-21 | ★ | 🔵 |
| JoonasAaltonen/claude-optimizer | Einfacher Output-Filter (RTK-inspiriert) | Hook | 0 | 2026-05-18 | ★ | 🔵 |
| fantastic-interpolation620/ctx-wire | Output-Filter + Secret-Scrubber | Filter | 0 | 2026-08-12 | ★ | 🔵 |
| dbuzatto/token-diet, aetox-skills/token-saver, artificemachine/token-diet, shubhransh-gupta/toknt, ChevvyOkK/contextguard-plugin | RTK-Klone/Bundles | div. | 0–2 | 2026 | ★ | 🔵 |

### Schicht 4 — MCP-Sandbox, Tool-Schema-Kompression & Kompressions-Engines

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| mksglu/context-mode | MCP-Sandbox: nur stdout im Kontext, FTS5-Index überlebt /compact | MCP+Plugin+Hooks | 19.8k | 2026-08-12 | ★★ | ✅ |
| atlassian-labs/mcp-compressor | Kollabiert Tool-Schemas auf 2 Wrapper (70–97 %) | MCP-Proxy | 106 | 2026-07-28 | ★★ | 🟡 |
| maximhq/bifrost | Gateway: Code Mode (bis 92,8 % Input↓), semantisches Caching | Proxy | 7.3k | 2026-08-12 | ★★ | 🟡 (Enterprise) |
| edgee-ai/edgee (Compressor V2) | 3 Schichten (~50 % Kosten↓, SWE-bench 6/6+8/8) | Proxy | 124 | 2026-08-12 | ★★ (kleine n) | 🟡 |
| ooples/token-optimizer-mcp | Kompression + Savings-Audit, lokaler KG | MCP | 479 | 2026-08-12 | ★ | 🔵 |
| Paritok-official/paritok-4b-v1 | OSS-4B-Kompressionsmodell (45K Trajektorien), 25→85 % | Proxy+HF-Modell | 1.1k | 2026-08-12 | ★★ | 🟡 (jung) |
| scaledown-team/DietCode | ScaleDown-Modell: sd_compress/summarize + Hooks + Proxy | Plugin+MCP | 2 | 2026-08-05 | ★ | 🔵 |
| juyterman1000/entroly | AST-Multi-Resolution-Kompression, ~90 % Claim | MCP | 435 | 2026-08-12 | ★ | 🔵 |
| KRLabsOrg/squeez | Qwen-3.5-2B Tool-Output-Pruner, arXiv-Paper; braucht GPU | CLI/Lib | 23 | 2026-04-27 | ★★★ (Paper) | 🔵 (Self-Host) |
| mibayy/token-savior | MCP-Kombi: Navigation + Memory + Bash-Rewrite | MCP | 1.1k | 2026-08-10 | ★★ | 🟡 |
| Open330/context-compress | TS-Rewrite von context-mode | MCP+Hook | 1 | 2026-08-10 | ★ | 🔵 |
| Madhan230205/token-reducer | Hybrid-RAG, 90–98 % ohne Beleg | Plugin | 42 | 2026-05-02 | ★ | ❌ |
| techdeveloper-org/mcp-token-optimizer | 60–85 % Claim | MCP | 0 | 2026-08-07 | ★ | 🔵 |
| SenseiIssei/Sensei | Self-hosted Kompressions-Gateway, 79 % | Gateway | 2 | 2026-08-12 | ★ | 🔵 |
| microsoft/LLMLingua (+LongLLMLingua, LLMLingua-2) | Forschung: bis 20×; bricht Code + Prompt-Cache | Python-Lib | 6.5k | 2026-04-08 | ★★★ | ⚠️ |
| llmlingua-cursor | LLMLingua-2 als FastMCP-Server | MCP (npm) | n/a | 2026 aktiv | ★ | 🔵 |
| jia-gao/leanctx | SDK-Wrapper-Kompression (10–40 %) | Python-Lib | 316 | 2026-08-12 | ★★ | 🔵 |
| microsoft/acon | Kompressions-Guidelines für Long-Horizon-Agenten | Templates | 100 | 2025-10 | ★★ | 🔵 (Referenz) |
| ZongqianLi/500xCompressor | ACL'25: 500→1 KV-Spezial-Token; für Claude nicht deploybar | Research | 64 | 2026-03-09 | ★★★ | ❌ |
| getao/icae, liyucheng09/Selective_Context, carriex/recomp, jayelm/gisting, princeton-nlp/AutoCompressors | Forschungs-Kompressoren, kein CC-Pfad | Research | 149–424 | 2024–2025 | ★★ | ❌ |
| micoverde/taac-llm-compression | Task-Aware Compression, 22 % Kosten↓ @96 % Qualität | Research | 0 | 2026-02 | ★ | 🔵 |

### Schicht 5 — Konversations-/Session-Kompression & Compact-Alternativen

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| headroomlabs-ai/headroom (ex chopratejas) | Kompressions-Layer; ehrliche Benchmarks (10–30 %); Issue #2438: Cache-Bruch (2–7×) | Lib+Proxy+MCP | 66.1k | 2026-08-12 | ★★★ | ⚠️ (nur nach Fix-Verifikation) |
| aerovato/magic-compact | Beste /compact-Alternative: Per-Turn-Summaries + Rückhol-Tool | Plugin | 134 | 2026-08-12 | ★★ | ✅ |
| NodeNestor/claude-rolling-context | Rollierende Kompression; Prefix-Cap ⇒ linear; „kurze Sessions Wash" | Plugin+Proxy :5588 | 27 | 2026-08-12 | ★★ | 🟡 (lange Sessions) |
| Compresr-ai/Context-Gateway | Hintergrund-History-Kompression ab 75 % (YC-backed) | Proxy | 631 | 2026-08-02 | ★★ | 🟡 |
| agiwhitelist/tokdiet | Reverse-Proxy + Governor; Qualitäts-A/B (−71 % Input @ Parität) | Proxy | 33 | 2026-06-18 | ★★ | 🟡 |
| fkiene/llmtrim | Proxy mit Net-Win-Gate (−31 % Input, −66 % Kosten, Eigenmessung) | Proxy | 208 | 2026-08-12 | ★ | 🟡 |
| sergioramosv/squeezr | Kompressions-Proxy, wirbt mit Prompt-Cache-Sicherheit | Proxy (npm) | 34 | 2026-07-21 | ★★ | 🔵 |
| alibaizhanov/densely | Lossless 2–8×, sha256-verifiziert | MCP | 6 | 2026-08-12 | ★ | 🔵 |
| teamchong/pxpipe | Kontext als PNG; 59–70 % Rechnung; 2/15 Hex-Recall Opus (Sol/Grok 0/15) | Proxy :47821 | 7.1k | 2026-08-12 | ★★ | ⚠️ (Exaktheitsrisiko) |
| diegosouzapw/OmniGlyph | PNG-Kontext-Rendering, 59–70 % | Proxy | 78 | 2026-08-03 | ★ | ⚠️ |
| xuweizhengo/claude-code-token-compressor | PNG-Rendering-Proxy | Proxy | 0 | 2026-07-04 | ★ | 🔵 |
| Capnjbrown/c0ntextKeeper | 7 Hooks (Pre/PostCompact), 187 Patterns | Hook-Bundle+MCP | 62 | 2026-07-31 | ★★ | 🟡 |
| rupaut98/unforget | Zero-Dep SessionStart-Hook: State-Re-Injection | Hook | 3 | 2026-07-30 | ★ | 🔵 |
| smdysk/cc-parachute | 4 auditierbare Shell-Hooks, „soft landings" | Hooks | 0 | 2026-07-09 | ★ | 🔵 |
| TheMizeGuy/claude-code-smart-compact | Watermark-Nudges + Session-Ledgers | Hooks | 0 | 2026-07-19 | ★ | 🔵 |
| codeprakhar25/smartcompact | Human-in-the-loop-Compaction | Hooks | 5 | 2026-07-14 | ★ | 🔵 |
| LxveAce/claude-compact-controller | Auto-Compact-Controller + Vault-Backups | Hooks | 1 | 2026-08-03 | ★ | 🔵 |
| skymanbp/cc-memory | SQLite + Lifecycle-Hooks über Compactions | Plugin | 5 | 2026-08-10 | ★ | 🔵 |
| ahmadkassem511/TokenSnap | HTTP-Proxy, 40–70 % Claim | Proxy | 0 | 2026-07-14 | ★ | 🔵 |
| jee599/contextzip / andresgarciaf/contextzip | Rust-Proxys, Live-stdout-Kompression (2 gleichnamige Projekte) | Proxy | 22 / 0 | 2026-06/08 | ★ | 🔵 |
| omar-y-abdi/furl-ctx | Retrievable Compression (Rust+Python) | Lib | 3 | 2026-08-12 | ★ | 🔵 |
| g4itpl/clear-nudge | Sagt, wann /clear sinnvoll ist | Hook/Skill | 0 | 2026-08-11 | ★ | 🔵 |

### Schicht 6 — Formate & lossless-Kompression

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| toon-format/toon | TOON-Serialisierung: ~42,6 % nur vs. pretty JSON (vs. kompakt nahezu Parität) @ gleicher Accuracy; ehrliche Grenzen | Lib+CLI | 25.1k | 2026-08-07 | ★★★ | ✅ (Format-Baustein) |
| PCIRCLE-AI/toonify-mcp | CC-Plugin: TOON-Trimmung, Passthrough-Garantie | Plugin+MCP+CLI | 64 | 2026-08-12 | ★★ | 🟡 |
| manojmallick/sigmap | Deterministische Signatur-Maps (TF-IDF, 33 Sprachen) | MCP+CLI | 614 | 2026-07-28 | ★★ | 🟡 |
| sriinnu/clipforge-PAKT | Lossless-first L1–L3; nennt +25 %-Gegenbeispiele | Lib+CLI+MCP | 20 | 2026-07-31 | ★★ | 🔵 |
| open-compress/claw-compactor | 14-Stufen-Pipeline, Ø 36 %; stale seit 2026-04 | Lib+Skill | 2.1k | 2026-04-01 | ★★ | 🔵 (stale) |
| xaviviro/python-toon | Python TOON-Encoder | Lib | klein | 2026 | ★ | 🔵 |
| sheikhsajid69/toon-skill | TOON-Encoding-Skill für Specs | Skill | 2 | 2026-07-03 | ★ | 🔵 |
| Barnett-Studios/cxpak | Token-budgetierte Kontext-Bundles (Rust-Graph) | Plugin+MCP | 25 | 2026-08-07 | ★ | 🔵 |

### Schicht 7 — Code-Intelligence & Explorationsvermeidung

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| Graphify-Labs/graphify | Code+Docs+SQL → Knowledge-Graph; unabhängige Review ~60 % | Skill+MCP | 105.7k | 2026-08-12 | ★★ | 🟡 |
| colbymchenry/codegraph | Pre-indexierter KG; Eigenbenchmark 62 %, THOL: keine E2E-Ersparnis | MCP+CLI | 66.1k | 2026-08-08 | ★★★ (gemischt) | 🟡 |
| deusdata/codebase-memory-mcp | Tree-sitter-KG (158 Sprachen); 99,2 %-Claim; arXiv-Preprint | MCP | 38.7k | 2026-08-12 | ★★ | 🟡 |
| tirth8205/code-review-graph | Git-aware Graph, PR-Review-Fokus | MCP+CLI | 29.9k | 2026-08-02 | ★★ | 🟡 (Review) |
| oraios/serena | LSP-Symbol-Semantik, einziger mit Editing/Refactoring | MCP | 27.9k | 2026-08-12 | ★★ | ✅ (Edit-Workflows) |
| zilliztech/claude-context | Semantische Code-Suche; braucht Vector-DB | MCP | 12.4k | 2026-07-14 | ★★ | 🟡 (Infra-Last) |
| jgravelle/jcodemunch-mcp | Symbol-Retrieval, 86–99 % Claim; kommerzielle Lizenz | MCP | „95k Installs" | 2026-08 | ★ | ⚠️ (Lizenz) |
| cmillstead/codesight-mcp | Security-hardened tree-sitter-Exploration | MCP | klein | 2026 aktiv | ★ | 🔵 |
| sdsrss/code-graph-mcp | AST-Graph (FTS5, 10 Sprachen) | MCP+CLI | klein | 2026 aktiv | ★ | 🔵 |
| Aider-AI/aider | Repo-Map mit map-tokens-Budget — Referenz-Implementierung | Standalone | 48.2k | 2026 aktiv | ★★★ | 🔵 (Konzept) |
| dereira/goldfish | Go-Port des aider-Repo-Map-Algorithmus | Lib | klein | 2026 | ★ | 🔵 |
| Anthropic-Position | Boris Cherny: „agentic search generally works better" als RAG | — | — | — | ★★★ | (Einordnung) |

### Schicht 8 — Memory & Session-Persistenz

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| thedotmack/claude-mem | Standard: Hooks + LLM-Kompression + Progressive Disclosure; Issue #1719 (Read-Cache, geschlossen); offen: #3480 (Re-Injection bei jedem Read) | Plugin+Hooks+Worker | 90.5k | 2026-08-10 | ★★★ | ✅ |
| MemPalace/mempalace | Verbatim + semantische Suche; 44 MCP-Tools = 4,4–8,6k Tokens/Session | MCP+CLI | 58.3k | 2026-08-12 | ★★ | 🟡 |
| severity1/claude-code-auto-memory | CLAUDE.md-Sync in isoliertem Subagent-Kontext | Plugin | 155 | 2026-04-18 | ★★ | 🟡 (Komplement) |
| zilliztech/memsearch | Markdown + Milvus Memory-Layer | MCP/Plugin | 2.5k | 2026-08-12 | ★★ | 🟡 |
| 0xranx/OpenContext | GUI-zentrierter Context-Store | App+CLI | 729 | 2026-06-16 | ★ | 🔵 |
| OthmanAdi/planning-with-files | task_plan/findings/progress.md überleben Reset — Methode | Skill | 26.1k | 2026-08-09 | ★★ | ✅ (Methode) |
| ramakay/claude-self-reflect | Memory-MCP, 82 % Kompression Claim | MCP | 221 | 2026-08-10 | ★ | 🔵 |
| rohitg00/agentmemory | BM25+Vector+Graph RRF, lokal; 54 MCP-Tools | Lib/MCP | ~26k | 2026 aktiv | ★★ | 🟡 |
| doobidoo (memory MCP) | SQLite-vec Memory; Concurrency-Probleme | MCP | mittel | aktiv | ★ | 🔵 |
| Context Cloud (abhinavala/cntxtv2) | Team-Workspaces, RBAC — einziger Team-Ansatz | MCP hosted | klein | aktiv | ★ | 🔵 (Team) |
| zippoxer/recall | Full-Text-Search + Resume; stagniert | CLI | 194 | 2026-01 | ★ | 🔵 |
| iannuttall/claude-sessions | Session-Tracking; archiviert | Slash | 1.2k | 2025-06 | — | ❌ |
| Vvkmnn/claude-historian-mcp | Volltextsuche in Historie | MCP | 177 | 2026-03 | ★ | 🔵 |
| daaain/claude-code-log | Transkript-JSONL → HTML/MD | CLI | 1.2k | 2026-07-31 | ★ | 🔵 |

### Schicht 9 — Routing & Gateways (Kosten-Hebel, nicht Token-Hebel)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| musistudio/claude-code-router | De-facto-Standard: Task-Rollen→Provider; 50–99 % Kosten↓ je Strategie | Proxy :3456 | 36.6k | 2026-08-11 | ★★ | ✅ (wo Routing gewünscht) |
| diegosouzapw/OmniRoute | AI-Gateway, stapelt „RTK+Caveman"-Kompression, 231+ Provider | Gateway | 46.6k | 2026 aktiv | ★ | 🟡 |
| BerriAI/litellm | Generelles AI-Gateway (100+ APIs), Cost-Tracking | Proxy | 56.2k | 2026-08-12 | ★★★ | 🟡 (Enterprise) |
| BlockRunAI/ClawRouter | Agent-nativer Router (70 Modelle, x402/USDC) | Plugin | 6.6k | 2026-08-12 | ★ | 🔵 |
| ypollak2/llm-router | Router + 3-Layer-Kompression | Router | 67 | 2026-08-05 | ★ | 🔵 |
| ruvnet/metaharness (@metaharness/router) | „cheapest model that's good enough"-Routing | Meta-Harness | (ruflo 67.7k) | 2026-08 | ★ | 🔵 |
| tkaufmann/claude-gemini-bridge | Delegiert Großkontext an Gemini; stale seit 2025-08 | Bridge | 406 | 2025-08 | ★ | ❌ (stale) |
| frsorrentino/fable-director | Token-Governance via Routing | Hooks | 4 | 2026-08-11 | ★ | 🔵 |
| guyoron1/costwise | Auto-Routing + Input-Filter + Output-Reduktion | Hooks | 2 | 2026-08-12 | ★ | 🔵 |
| lidge-jun/opencodex | Universal-Provider-Proxy | Proxy | klein | 2026 | ★ | 🔵 |
| OpenRouter (Setup) | ANTHROPIC_BASE_URL→OpenRouter; GLM 5.2 $1,40/M vs. Claude $10/M | Env | SaaS | — | ★★ | 🟡 |
| lm-sys/RouteLLM, stanford-futuredata/FrugalGPT | Forschungs-Router, stagniert | Research | 5.3k/280 | 2024/25 | ★★ | ❌ |

### Schicht 10 — Cache-Ebene (größter Input-Kostenhebel)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| cnighswonger/claude-code-cache-fix | Fixt 3 CC-Cache-Bugs; Hit-Rate 94,66 vs. 92,44 %; bis 20× Kostenexplosion verhindert | Proxy :9801 | 414 | 2026-08-12 | ★★★ | ✅ (v. a. --resume-Nutzer) |
| CoderDayton/semantic-cache-mcp | Datei-Diff-Caching: unveränderte Dateien ~0 Tokens | MCP+Deny-Rules | 2 | 2026-07-28 | ★ | 🔵 (früh) |
| zilliztech/GPTCache | Generischer semantischer LLM-Cache | Lib/Proxy | 8.1k | 2025-07 | ★★ | 🔵 (generisch) |
| flightlesstux/prompt-caching | cache_control-Injection — explizit NICHT für CC-Sessions | Plugin/MCP | klein | 2026-03 | ★★ | ❌ (für CC) |
| Native: CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1 | ~1.800 Tokens/Call, verhindert Cache-Bust durch git-status | Env | — | — | ★★★ | ✅ |

### Schicht 11 — Repo→Kontext-Packaging

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| yamadashy/repomix | Repo→eine Datei, `--compress`, Token-Budget-CI | CLI+MCP | 27.8k | 2026-08-11 | ★★ | 🟡 (Einmal-Sessions) |
| coderamp-labs/gitingest | GitHub-URL→Extrakt (hub→ingest) | CLI/Web | 15.3k | 2026-08-05 | ★★ | 🟡 |
| mufeedvh/code2prompt | Rust, Handlebars-Templates, Token-Count | CLI+MCP | 7.6k | 2026-06-29 | ★★ | 🔵 |
| mohsen1/yek (ex bodo-run) | Rust-Serialisierer, 230× schneller als repomix | CLI | 2.5k | 2026-06-29 | ★★ | 🔵 |
| simonw/files-to-prompt | Verzeichnis→Prompt-Konkatenation; stale 2025-02 | CLI | 2.8k | 2025-02 | ★★ | 🔵 (stale) |
| glincker/stacklit | ~250-Token-Modulkarte statt Dump | CLI | klein | 2026 | ★ | 🔵 |

### Schicht 12 — Hook-Sammlungen & Guards (Regelwerk-Rohmaterial)

| Repo | Zweck | Integration | Stars | Letzter Push | Evidenz | Status |
|---|---|---|---|---|---|---|
| karanb192/claude-code-hooks | 10 Hooks (cost-tracker, rate-limiter, context-snapshot …) | Hooks | 470 | 2026-08-04 | ★★ | ✅ (Referenz) |
| disler/claude-code-hooks-mastery | Lernressource alle Lifecycle-Events | Doku | ~5k | 2026 | ★★ | ✅ (Doku) |
| overloop (PyPI) | Loop-/Dedup-/Truncate-Guard — Blaupause für bash-dump-guard | Hooks | n/a | 2026-07-04 | ★★ | ✅ (Design-Vorlage) |
| 0xhimanshu/governor | Usage-Governor; VCLR-Benchmark (0 vs. caveman 12,5 % Fehlentscheidungen) | Plugin+Hooks | (klein) | 2026-05+ | ★★ | 🟡 |
| valorisa/Claude-Skills | rescue-tokens, token-optimization, spec-driven | Skills | mittel | 2026-08-08 | ★★ | 🟡 |
| yifanzz/claude-code-boost | Auto-Approval-Hook (Fast-Path/LLM/Cache/Block) | Hook | 164 | 2026-03-21 | ★ | 🔵 |
| YoraiLevi/claude-command-policy | PRIOR-ART: AST-Guards korrekter als Regex-Leader | Doku/Hooks | klein | 2026-06-26 | ★★ | ✅ (Guard-Design) |
| ithiria894/awesome-claude-code-hooks | Kuratierte Hook-Collections | Liste | 20 | 2026 | ★ | 🔵 |
| JanBancerewicz/context-cost-guard | Warnt vor Kontext-Überausgaben (Cold-Cache-Trigger) | Hook | 2 | 2026-08-11 | ★ | 🔵 |
| emanueleielo/compact-middleware | Compaction-Defaults: Trigger 0,85, Keep-last-5 | Middleware | klein | 2026-04-02 | ★★ | 🔵 (Defaults-Referenz) |
| hesreallyhim/awesome-claude-code | Zentrale Kuratierung | Liste | 52.2k | 2026 aktiv | ★★★ | ✅ (Discovery) |
| anthropics/claude-plugins-official + -community | Offizielle Plugin-Marketplaces | Marketplace | 33.5k | 2026 | ★★★ | ✅ |

### Schicht 13 — Peripherie (nur indirekt token-relevant)

gstack (127,7k★, Setup+Modell-Benchmark), spec-kit (126,4k★, Spec-Driven → weniger Iterationen), ruflo (67,7k★, Meta-Harness mit Routing+Cost-Tracker), alirezarezvani/claude-skills (24,4k★), KKKKhazix/khazix-skills (19,6k★), Archon (23,2k★, Token-Counts pro Run), chujianyun/skills (skill-optimizer), runkids/skillshare, xingkongliang/skills-manager, Observal/Observal (Session-Replay mit Token-Counts), happycapy skill-arena (Skill-Benchmark inkl. Kontext-Token-Metrik), AgriciDaniel/claude-obsidian, coleam00/second-brain-skills, rixinhahaha/snip (Visual Mode, 277★), superagent-ai/vibekit, opentabs-dev/opentabs (API statt DOM), mbailey/voicemode, cc-switch-cli.

### Schicht 14 — Obsolet / Stale / Irrelevant / Nicht-deploybar (Referenz)

- **Obsolet durch native Features:** RonitSachdev/ccundo (nativ), philipp-spiess/claude-code-costs (→ ccusage), ColeMurray/claude-code-otel (→ native OTEL)
- **Stale (>6 Monate):** files-to-prompt, claw-compactor, karpathy-skills, KRLabsOrg/squeez, LLMLingua, 500xCompressor, gemini-bridge, claude-code-patches, sniffly, claude-sessions (archiviert), recall, benbasha/Claude-Autopilot, winfunc/opcode, gagarinyury/claude-config-editor, KyleAMathews/claude-code-ui, simonw/claude-code-transcripts, L1AD/claude-task-viewer, disler multi-agent-observability
- **Für CC nicht deploybar/irrelevant:** 500xCompressor (KV-Zugriff nötig), ICAE/Selective Context/Gisting/AutoCompressors/RECOMP (Forschung), RouteLLM/FrugalGPT (Frameworks), flightlesstux/prompt-caching (nur SDK-Apps)
- **Kein Token-Bezug:** worldmonitor, tradingview-mcp, seedance-prompt-skill, ui-ux-pro-max-skill, propel, good-docs-writer, listenhub-multimedia
- **Umbenennungen:** chopratejas/headroom→headroomlabs-ai/headroom · bodo-run/yek→mohsen1/yek · forrestchang/andrej-karpathy-skills→multica-ai/andrej-karpathy-skills
- **Namens-Doppelgänger:** claudioemmanuel/squeez (Hook) ≠ KRLabsOrg/squeez (Modell) · headroomlabs-ai/headroom ≠ RonnieTheTester/headroom-meter · edouard-claude/snip (Filter) ≠ rixinhahaha/snip (Visual Mode) · jee599/contextzip ≠ andresgarciaf/contextzip

## Anhang B: Bewertungsmethodik und Limitationen

Die Evidenz dieses Reports beruht auf vier Quellentypen: unabhängigen Dritt-Benchmarks (JetBrains-Blogserie, codepointer-Replay, THOL/tokenade, TRON-Studie), dokumentierten Hersteller-Eigenbenchmarks, Issue-Trackern als Schadensfall-Datenbank und der GitHub-API für alle Popularitäts- und Aktivitätsdaten[^18^][^2^][^7^][^153^][^105^]. **Es wurden keine eigenen Laufzeitmessungen durchgeführt.** Alle Spar-Zahlen in diesem Report sind daher replay- und benchmark-abhängig: Sie gelten unter den Bedingungen der jeweiligen Messung (Session-Länge, Modell, Effort-Level, Cache-Zustand) und übertragen sich nicht automatisch auf andere Workflows. Wo Dritt- und Hersteller-Messung auseinanderfielen (rtk: beworben 60–90 %, gemessen +7,6 %; caveman: 65 % vs. 8,5 %; headroom: README vs. Issue #2438), hat dieses Report grundsätzlich der unabhängigen Messung den Vorrang gegeben[^2^][^7^][^8^].

Drei weitere Limitationen sind zu kennen. Erstens der **Stichtag 2026-08-13**: Das Feld ist schnelllebig — Star-Zahlen, Push-Daten und Issue-Stände gelten für dieses Datum und können Wochen später überholt sein; Tools mit Status 🔵 können ebenso aufsteigen wie ✅-Empfehlungen durch einen einzigen Cache-Bug fallen (der Präzedenzfall headroom ist dokumentiert)[^8^]. Zweitens **Issue-Nummern und Issue-Stände** (#2438, #260, #1155, #40/#41, #1719 u. a.) können sich zwischenzeitlich geändert haben; die Re-Evaluierungs-Trigger der Kapitel 14.4 und 16.3 sind deshalb als Prüfaufträge zu lesen, nicht als Dauer-Urteile. Drittens die **Konfidenz-Staffelung**: Nur ein Teil der Empfehlungen (Mess-Baseline, native Hebel, ponytail, Filter-Schicht) trägt Confidence High; Session-Kompression, Routing und PNG-Encoding liegen bei Medium und erfordern eigene Verifikation im Messprotokoll (Kapitel 16.2). Die Cross-Verification hat alle identifizierten Conflict Zones dokumentiert; wo sie keine Entscheidung erzwang, trägt der Report die Unsicherheit explizit statt sie zu glätten.
