## Facet: CC-Ökosystem Output-Filter/Hooks/Kompression

Recherche-Stand: 2026-08-13. Alle Stars/Push-Daten per GitHub-API verifiziert (Repos, die in der Mission als „bereits bekannt" gelistet waren, wurden nicht erneut aufgenommen).

### Key Findings

1. **Das Feld explodiert 2026 geradezu**: Allein die GitHub-Suche nach „claude code token compress" liefert >30 Repos, die fast alle zwischen Juni und August 2026 erstellt oder zuletzt aktiv gepusht wurden. RTK (bekannt) ist zum De-facto-Standard geworden und hat ein ganzes Ökosystem von Klons, Wrappers und Ergänzungen hervorgebracht (aetox-skills/token-saver, suhaanthayyil/lean-mode, artificemachine/token-diet, JoonasAaltonen/claude-optimizer u. a.).[^1^][^2^]

2. **Drei Architektur-Generationen sind klar unterscheidbar**: (a) deterministiche CLI-Filter vor dem Modell (tokf, thlibo, ecotokens, ppgranger/token-saver), (b) transparente HTTP-Proxys, die Requests/Responses komprimieren (squeezr, Paritok, TokenSnap, OmniRoute), (c) lokale Kleinmodelle als semantische Kompressoren (Paritok-4B, thlibo mit Gemma 4, squeezr „Zest"/Haiku, DietCode mit Scaledown-Modell).[^3^][^4^][^5^][^6^]

3. **„Lossless/Reversible" ist das neue Verkaufsargument**: Nach der Kritik an /compact (Summary-of-Summary-Datenverlust) werben magic-compact, densely (sha256-verifizierte Rekonstruktion), furl-ctx, Paritok und headroom explizit mit abrufbaren Originalen (CCR-Pattern). magic-compact ersetzt alte Assistant-Turns durch Einzel-Summaries statt die ganze Session zu einer Blob-Summary zu kollabieren.[^7^][^8^][^9^]

4. **Prompt-Cache-Kompatibilität wird zum Differenzierungsmerkmal**: Proxys, die Prefixe verändern, zerstören Anthropic Prompt Caching und können Mehrkosten statt Ersparnis erzeugen; squeezr wirbt explizit mit „compresses context on the fly — without ever breaking Anthropic's prompt cache", kuro-lean „rescues sessions whose prompt cache has expired".[^10^][^11^]

5. **Neue Modalität: Kontext als Bild**. Mehrere 2026er-Projekte rendern sperrigen Kontext in PNG-Seiten, die das multimodale Modell liest statt Text-Tokens: diegosouzapw/OmniGlyph (59–70 % Ersparnis, 78★), xuweizhengo/claude-code-token-compressor, caveman „Pixel mode" (portiert pxpipe).[^12^][^13^]

6. **TOON-Encoding etabliert sich als Datenformat-Kompression**: PCIRCLE-AI/toonify-mcp (64★) trimmt JSON/YAML/Stack-Traces automatisch als Claude-Code-Plugin; TOON-Skills und caveman toon encode/decode flankieren.[^14^][^13^]

7. **Terse-Output ist ein eigenes Subgenre geworden**: Nach caveman (bekannt) entstanden 2026 beeline (benchmarked Merge von caveman + i-have-adhd), carlosduplar/caveman-output-style-claude-code (native Output-Styles, 40 % weniger Output-Tokens), taxman, vliggio/claude-faa-speak (FAA-Funkstil, ~53 %, Re-Expansion via Apple Intelligence) und mini-caveman.[^15^][^16^]

8. **CLAUDE.md-/Systemkontext-Audits entstehen als Facet-5-Kategorie**: Growth4U-systems/claude-token-hygiene quantifiziert 15k–35k Tokens System-Overhead pro Konversation (CLAUDE.md, MEMORY.md, Skill-Beschreibungen, MCP-Schemas, Hooks); ncoevoet/claude-markdown-health-check scannt .claude/-Setups u. a. auf „token bloat"; ein HN-Thread „Claude Code sends 33k tokens before reading the prompt" (463 Punkte, 262 Kommentare) hat das Thema sichtbar gemacht.[^17^][^18^][^19^]

9. **Offizielle/ kuratierte Kanäle übernehmen die Kategorie**: anthropics/claude-plugins-official (33,5k★) führt offizielle Plugins; ppgranger/token-saver wird über die offizielle Community-Marketplace anthropics/claude-plugins-community vertrieben; hesreallyhim/awesome-claude-code (52,2k★) listet claude-context-optimizer und llm-router; ithiria894/awesome-claude-code-hooks kuratiert Hook-Sammlungen (karanb192/claude-code-hooks mit context-snapshot/session-summary).[^20^][^3^][^21^]

10. **Graph-basierte Kontext-Reduktion ist die größte angrenzende Kategorie**: tirth8205/code-review-graph (~29,9k★, 6,8–49× weniger Tokens auf Reviews) und Graphify-Labs/graphify (~105,7k★, 71,5×-Claim) verhindern Kontextverbrauch strukturell statt ihn nachträglich zu komprimieren — häufig in denselben Roundups wie die Kompressoren empfohlen.[^22^][^23^]

### Neu entdeckte Repos

| Repo | Zweck | Token-Mechanismus | Integrationstyp | Stars | Letzter Push | Install | Deep-Dive-Kandidat? |
|---|---|---|---|---|---|---|---|
| Paritok-official/paritok-4b-v1 | Non-destruktive Kompressions-Gateway für Coding-Agents | Eigenes 4B-Kompressionsmodell (45K Trajektorien); Tool-Schema-Bloat-Stripping, Tool-Result-/History-Kompression, 25→85 % | HTTP-Proxy (BASE_URL), Claude Code/Cursor/Codex/OpenHands | 1.090 | 2026-08-12 | Proxy + HF-Modell paritok/paritok-4b-v1 | **Ja** |
| ooples/token-optimizer-mcp | Token-Messung + Kontext-Optimierung über 16 CLI-Clients | Kontext-Kompression, lokaler Knowledge-Graph, Savings-Audit pro Agent | MCP-Server (npm @ooples/token-optimizer-mcp) | 479 | 2026-08-12 | npx @ooples/token-optimizer-mcp | **Ja** |
| mpecan/tokf | Config-driven CLI-Output-Kompressor (Rust) | TOML-Filterregeln pro Kommando; 60–90 % auf git/cargo/docker | CLI-Wrapper + Shell-Integration; crates.io | 192 | 2026-08-12 | cargo install tokf | **Ja** |
| ppgranger/token-saver | Content-aware Output-Kompression | 36 spezialisierte Prozessoren (git, pytest, npm, terraform, kubectl …), 60–99 % | Natives Claude-Code-Plugin (offizielle Community-Marketplace) + Hooks | 136 | 2026-08-10 | /plugin install token-saver@claude-community | **Ja** |
| aerovato/magic-compact | „Lossless" /compact-Alternative | Pro-Turn-Summaries statt Session-Blob; Tool-I/O-Pruning mit read_omitted_content-Rückhol-Tool | Plugin für Claude Code & OpenCode | 134 | 2026-08-12 | Plugin-Install (Repo) | **Ja** |
| egorfedorov/claude-context-optimizer | Findet verschwendeten Kontext | Trackt, welche Infos später tatsächlich wiederverwendet werden; Heatmaps, ROI-Reports, Budget-Alerts; 30–50 % | Claude-Code-Plugin (Node 18+, zero config) | 92 | 2026-08-11 | Plugin-Install | **Ja** |
| diegosouzapw/OmniGlyph | Kontext als PNG rendern | Bulky Context → dichte PNG-Seiten, multimodales Lesen; 59–70 % | Proxy/Renderer vor Claude | 78 | 2026-08-03 | Repo (TS) | **Ja** (neuartig) |
| ypollak2/llm-router | Router + Kompression unter Claude Code | Drei-Layer-Token-Kompression + billigstes-fähiges-Modell-Routing, Provider-Fallback | Lokaler Router (unter CC, Codex, Gemini CLI) | 67 | 2026-08-05 | Repo | Ja |
| PCIRCLE-AI/toonify-mcp | Auto-Trimmung großer Tool-Outputs | TOON-artige Kompression von JSON/YAML/Stack-Traces/Logs vor Kontexteintritt | Claude-Code-Plugin (auto) + MCP-Server (on-demand) | 64 | 2026-08-12 | npm i -g .; toonify-mcp setup | Ja |
| Capnjbrown/c0ntextKeeper | Kontext-Erhalt über Compaction hinweg | 7 Hooks (Pre/PostCompact u. a.), 187 semantische Patterns, 3 MCP-Tools | Hook-Bundle + MCP | 62 | 2026-07-31 | Repo-Installer | Ja |
| ncoevoet/claude-markdown-health-check | .claude/-Setup-Audit | Findet Token-Bloat in Skills, Commands, Hooks, Agents, Settings; tote Refs | Shell-Audit-Skill | 38 | 2026-08-12 | Repo | Ja (Facet 5) |
| sergioramosv/squeezr | Kompressions-Proxy mit Dashboard | Haiku/„Zest"-Modell semantische Kompression, explizit prompt-cache-sicher | HTTP-Proxy (ANTHROPIC_BASE_URL) für CC, Aider, OpenCode, Gemini CLI | 34 | 2026-07-21 | npm: squeezr-ai; squeezr setup | **Ja** |
| Barnett-Studios/cxpak | Token-budgetierte Kontext-Bundles | Rust-Codegraph (43 Sprachen) packt annotierte Briefing-Pakete im Token-Budget | Claude-Code-Plugin + MCP-Server | 25 | 2026-08-07 | Plugin-Install | Ja |
| csabakecskemeti/cc_token_saver_mcp | Routineaufgaben an lokales LLM delegieren | Offload einfacher Tasks nach Ollama statt Claude-Tokens | MCP-Server (stdio) | 19 | 2025-06-19 | claude mcp add | Nein (älter) |
| hansipie/ecotokens | Output-Kompression + Kosten-Tracking | PreToolUse-Hook komprimiert Shell-Outputs, USD-Savings-Tracking | Hook (Rust binary) für CC, Gemini CLI, Qwen Code | 18 | 2026-07-29 | cargo/Repo | Ja |
| carlosduplar/caveman-output-style-claude-code | Terse Output Styles | System-Prompt-Level Output-Styles (caveman/ultra), ~40 % weniger Output-Tokens | Native CC-Output-Styles (~/.claude/output-styles) | 17 | 2026-05-06 | Datei kopieren + /config | Nein |
| kurovu146/kuro-lean | Token-Rechnung senken (CLI „kt") | Shell-Output-Kompression + Blockieren token-hungriger Calls + Session-Pricing + Cache-Rescue | CLI + Hooks (Bun/TS) | 15 | 2026-08-10 | bun install | Ja |
| djolex999/vir | Sessions → Obsidian-Vault | Filtert Agent-Output heraus, behält Entscheidungen | CLI (TS) | 15 | 2026-07-31 | Repo | Nein |
| Growth4U-systems/claude-token-hygiene | Audit versteckter System-Token-Overhead | Misst CLAUDE.md/MEMORY.md/Skill-/MCP-/Hook-Overhead (15–35k), monatlicher Report | Skill (read-only) | 10 | 2026-03-05 | Skill-Ordner kopieren | Ja (Facet 5) |
| 3rg0n/thlibo | Tool-Output-Kompressor | PreToolUse+updatedInput-Rewrite; deterministische Filter + lokales Gemma 4 für unbekannte Outputs; 60–99 % | Hook (Go) für CC + Codex CLI | 9 | 2026-08-12 | Repo | **Ja** (Architektur) |
| janmaaarc/basecamp | Production-Setup inkl. Token-Optimierung | Schlankes globales CLAUDE.md, Regeln, per-Projekt-Memory | Config-Template | 7 | 2026-08-11 | Repo | Nein |
| iceHub82/beeline | Komprimierter Output-Style | Benchmarked Merge caveman + i-have-adhd, Quality-gescort | Output-Style/Skill | 6 | 2026-08-04 | Repo | Ja (Facet 4) |
| tatarco/claude-code-starter | Cache-freundliche CC-Konfiguration | Env-Caps, Read-Deny-Rules, Token-Optimizer-Hook-Wiring | Settings-Template | 6 | 2026-08-09 | Repo | Nein |
| alibaizhanov/densely | Lossless-Kontextkompression | 2–8× weniger Tokens, byte-exakt rekonstruierbar (sha256-verifiziert) | MCP-Server (CC & Cursor) | 6 | 2026-08-12 | pip/Repo | Ja |
| skymanbp/cc-memory | Persistenter Speicher über Compactions | SQLite + Lifecycle-Hooks speichern/laden Konversationskontext | Plugin (Hooks) | 5 | 2026-08-10 | Plugin-Install | Nein |
| codeprakhar25/smartcompact | Human-in-the-loop-Compaction | Nutzer wählt überlebende Turns; SessionStart-Hook re-injiziert | Hooks | 5 | 2026-07-14 | Repo | Nein |
| AndVl1/gw | Gradle-Output-Filter | Strippt Gradle-Noise, behält Fehler/Warnungen/Status | CLI + CC-Hook | 4 | 2026-06-25 | Repo | Nein |
| BlackFoil/claude-token-saver-mcp | Tasks an lokales LLM (Ollama) offloaded | Delegation statt Claude-Tokens | MCP-Server (stdio) | 4 | 2026-03-31 | npx io.github.BlackFoil/… | Nein |
| frsorrentino/fable-director | Token-Governance via Routing | Top-Modell dirigiert, Ausführung ans billigste adäquate Mittel; Hook-enforced | Routing-Kernel + Hooks | 4 | 2026-08-11 | Repo | Nein |
| illuwa/ctx-diet | Tool-Output-Kompressions-Hook | Komprimiert Tool-Output vor Kontextfenster; 65,6 % gemessen | Shell-Hook | 3 | 2026-07-25 | Repo | Nein |
| suhaanthayyil/lean-mode | Token-Effizienz-Skill | RTK-Shell-Filtering + caveman-ultra-Output + Graph-First-Navigation | Skill (Shell) | 3 | 2026-07-25 | Repo | Nein |
| johnsnow1011/taxman | Token-Effizienz-Skill | Schneidet Filler/Preamble/Narration; Pläne/Status als Bullets | Skill | 3 | 2026-07-03 | Skill-Ordner | Nein |
| omar-y-abdi/furl-ctx | Kontextkompression mit CCR | Retrievable Compression (Rust-Kern + Python-API) | Library/Integration für CC | 3 | 2026-08-12 | pip/Repo | Nein |
| rupaut98/unforget | State-Re-Injection nach Compaction | Zero-Dep SessionStart-Hook injiziert verlorenen Arbeitszustand | Hook | 3 | 2026-07-30 | Repo | Nein |
| SenseiIssei/Sensei | Self-hosted Prompt-Kompressions-Gateway | Komprimiert Prompts vor Absenden; 79 % gemessen | Drop-in-Gateway | 2 | 2026-08-12 | Self-host | Nein |
| guyoron1/costwise | Kosten senken 50–90 % | Auto-Model-Routing + Input-Filtering + Output-Reduktion via Hooks | Hook-Bundle (Python) | 2 | 2026-08-12 | Repo | Nein |
| chethanbhatbs/compactor-skill | Token-Reduktion 60–80 % | Targeted reads (offset/limit), Grep-before-Read, Model-Switching, /compact-Disziplin | Skill + CLAUDE.md-Regeln | 2 | 2026-06-15 | gh repo clone … ~/.claude/skills/compactor | Nein |
| JanBancerewicz/context-cost-guard | Warnt vor Kontext-Überausgaben | Hook-Script alertiert bei irrelevantem Kontext | Skill/Hook | 2 | 2026-08-11 | Repo | Nein |
| aetox-skills/token-saver | RTK-Protokoll-CLI-Proxy | Filtert Bash-Output, 55–90 % | CLI-Proxy (plattform-agnostisch) | 2 | 2026-06-30 | Repo | Nein |
| phuetz/lm-resizer | Rust-Kontextkompression | Filtert/komprimiert Tests, Diffs, Logs, JSON | CLI/MCP für CC, Codex | 2 | 2026-07-02 | cargo/Repo | Nein |
| sheikhsajid69/toon-skill | TOON-Enkodierung für Prompts | Prompts → TOON-kodierte, token-effiziente Specs | Skill | 2 | 2026-07-03 | Repo | Nein |
| ryanportfolio/STK | „Session Token Killer" | PreToolUse-Hook klemmt überlange Read-Results zu zeilen-nummerierten Outlines | Hook (JS) | 1 | 2026-08-12 | Repo | Nein |
| Supersynergy/agent-token-saver-skill-router | Skill-Katalog-Minimierung | Router-Skill lädt nur den einen passenden Skill statt 40 Frontmatter-Kataloge | Skill (~/.claude/skills) | 1 | 2026-07-31 | Skill-Ordner | Nein |
| AbhayShalghar/ctk | „Context Token Killer" | Komprimiert MCP-, Native-Tool- und Bash-Output (breiterer Scope als rtk) | Go-CLI/Hook | 1 | 2026-06-26 | Repo | Nein |
| artificemachine/token-diet | Optimierungs-Layer | Verdrahtet RTK, tilth, Serena, ICM automatisch | Installer/Plugin | 1 | 2026-08-10 | Repo | Nein |
| shubhransh-gupta/toknt | Lokale Token-Optimierung | Schneidet redundanten Kontext, behält Signal | CLI (CC, Cursor, Codex) | 1 | 2026-08-12 | Repo | Nein |
| LxveAce/claude-compact-controller | Smarter Auto-Compact-Controller | Vault-Backups + Kontext-Injection-Hooks gegen Kontextverlust | Hooks | 1 | 2026-08-03 | Repo | Nein |
| Open330/context-compress | MCP + Hook-Toolkit (TS-Rewrite von context-mode) | Sandbox-Ausführung, FTS5-suchbarer Volltext + 0,3KB-Summary im Kontext | MCP-Server (8 Tools) + PreToolUse-Hook | 1 | 2026-08-10 | npm/Repo | Ja |
| andresgarciaf/contextzip | Kontext kürzen 60–90 % | Live-Stdout-Kompression; Session-History-Kompression geplant | CLI (v0.1) | 0 | 2026-08-12 | Repo | Nein |
| sphragis-oss/isthmos | Lokale Kompressionsschicht für Tool-Outputs | Single-Go-Binary als PostToolUse-Hook oder Generik-Filter | Hook/Filter | 0 | 2026-08-03 | Repo | Nein |
| thecoderhead/shard | Rust-PTY-Proxy | Führt Kommandos in echtem PTY aus, komprimiert Output | CLI-Proxy | 0 | 2026-07-31 | cargo/Repo | Nein |
| ahmadkassem511/TokenSnap | Intelligenter HTTP-Proxy | Strippt Noise, komprimiert Kontext; 40–70 % | HTTP-Proxy | 0 | 2026-07-14 | Repo | Nein |
| xuweizhengo/claude-code-token-compressor | PNG-Rendering-Proxy | Rendert sperrigen Kontext in PNG-Bilder (chinesische Doku) | Proxy (TS) | 0 | 2026-07-04 | Repo | Nein |
| Guazzihub/Sieve | Bash-Output-Filter-Plugin | Filtert noisy Bash-Output mit „verifiable loss policy" | CC-Plugin | 0 | 2026-07-14 | Plugin | Nein |
| vliggio/claude-faa-speak | FAA-Funkstil-Output | ~53 % weniger Output-Tokens (gemessen); Re-Expansion on-device via Apple Intelligence | CC-Plugin | 0 | 2026-07-24 | Plugin | Ja (Kuriosität/Facet 4) |
| glitchwerks/mini-caveman | Minimale caveman-Variante | Dependency-freier, CC-only Terse-Mode | Skill | 0 | 2026-07-26 | Repo | Nein |
| wasdevv/lean-output | RSpec/RuboCop-Kompressor | Komprimiert Test-/Lint-Output, „zero lost failures" | CC-Plugin (Ruby) | 0 | 2026-08-12 | Plugin | Nein |
| JoonasAaltonen/claude-optimizer | Einfacher Output-Filter | Filtert Kommando-Outputs, vermeidet Doppel-Reads (RTK-inspiriert) | Hook/Config | 0 | 2026-05-18 | Repo | Nein |
| helmif/wafi | Shell-Filter zwischen CC und Shell | Filtert Noise aus Kommando-Output | Wrapper | 0 | 2026-04-21 | Repo | Nein |
| fantastic-interpolation620/ctx-wire | Output-Filter + Secret-Scrubber | Filtert Shell-Output, scrubbt Secrets | Filter | 0 | 2026-08-12 | Repo | Nein |
| dbuzatto/token-diet | Kommando-Output-Kompression | Komprimiert Command-Output vor Kontext | Hook/CLI | 0 | 2026-08-06 | Repo | Nein |
| romangalaxys10-spec/context-compressor-skill | Kontext-Kompressions-Skill | Zero-Dependency Python, 60–95 %-Claim | Skill (Hermes, CC u. a.) | 0 | 2026-08-05 | Repo | Nein |
| techdeveloper-org/mcp-token-optimizer | MCP-Token-Optimizer | Behauptet 60–85 % Reduktion | MCP-Server | 0 | 2026-08-07 | Repo | Nein |
| Siddartha1997-creator/prune | Prompt-Refiner | Interceptiert verbose Prompts, extrahiert Intent | Pre-Submit-Tool | 0 | 2026-08-08 | Repo | Nein |
| g4itpl/clear-nudge | /clear-Empfehlung | Sagt, wann man die Session clearen soll, bevor Compaction zuschlägt | Hook/Skill | 0 | 2026-08-11 | Repo | Nein |
| ChevvyOkK/contextguard-plugin | Token-Spar-Hooks | Aktive Token-Spar-Hooks | CC-Plugin | 0 | 2026-08-11 | Plugin | Nein |
| smdysk/cc-parachute | „Soft landings" für Compaction | Vier auditierbare Shell-Hooks, null Extra-Tokens | Hooks | 0 | 2026-07-09 | Repo | Nein |
| TheMizeGuy/claude-code-smart-compact | Schadlose Compaction | Watermark-Nudges, Session-Ledgers, Post-Compact-Rehydration | Hooks | 0 | 2026-07-19 | Repo | Nein |
| scaledown-team/DietCode | ScaleDown-Kompressions-Plugin | sd_compress/summarize/classify/extract-Tools; Auto-Hooks + Progressiv-Kompaktion via Proxy (Scaledown-Modell) | Hooks + MCP-Tools + optionaler Proxy | 2 | 2026-08-05 | Plugin/pip | Ja |
| cardimvitor/tk (VS Code: „TK — Token Killer") | Kommando-Output-Kompression in VS Code | PreToolUse-Hook tk-rewrite.sh filtert git/npm/pytest u. a.; 60–90 % | VS-Code-Extension + CC-Hook (Binary: github.com/cardimvitor/Compression) | n/a (Marketplace) | 2026-07-28 | VS Marketplace + cargo install --git …/Compression --bin tk | Ja |

Angrenzend (große Player, Kontext-Vermeidung statt -Kompression, aber im selben Diskurs): **tirth8205/code-review-graph** (29.913★, 2026-08-02, pip install code-review-graph; Tree-sitter-Graph, 6,8–49× weniger Review-Tokens)[^22^], **Graphify-Labs/graphify** (105.663★, 2026-08-12, uv tool install graphifyy; /graphify-Skill, Knowledge-Graph statt grep)[^23^], **diegosouzapw/OmniRoute** (46.581★, Gateway mit 15–95 %-Token-Kompressions-Pipeline)[^24^], **MemPalace/mempalace** (58.329★, Memory-System mit preCompact/stop-Hooks)[^25^], **karanb192/claude-code-hooks** (470★, Hook-Sammlung inkl. context-snapshot, session-summary)[^21^].

### Detailnotizen zu den wichtigsten Neufunden

**Paritok-official/paritok-4b-v1 (1.090★, Apache-2.0)** — Der ambitionierteste Neufund: erstes Open-Source-4B-Modell, das speziell auf Kompression von Coding-Agent-Trajektorien trainiert wurde (45K reale Trajektorien, HuggingFace paritok/paritok-4b-v1). Sitzt als Drop-in-Proxy zwischen Agent und LLM, strippt Tool-Schema-Bloat, komprimiert Tool-Results/File-Reads, summarisiert stale History — nichts wird endgültig verworfen (Original on demand abrufbar). Versprechen: ~25 % Ersparnis ab Turn 1 bis >85 % in langen, gesättigten Sessions, ~3× mehr Turns pro Kontextfenster. Funktioniert mit allem, was BASE_URL respektiert.[^4^]

**aerovato/magic-compact (134★, BSD-3)** — Beste /compact-Alternative im Feld. Statt die ganze Session in eine generische Template-Summary (Goal/Progress/Key Decisions) zu kollabieren, wird der Konversations-Skeleton erhalten: User-Messages und Tool-Calls bleiben, jeder alte Assistant-Turn bekommt eine eigene hochauflösende Summary, sperriges Tool-I/O wird aggressiv geprunt, aber über ein custom `read_omitted_content`-Tool rückholbar. Für Claude Code & OpenCode.[^7^]

**ppgranger/token-saver (136★, Apache-2.0)** — Der am saubersten paketierte Output-Kompressor: 36 spezialisierte Prozessoren (git, pytest, npm, terraform, kubectl, docker …), 60–99 % Token-Reduktion, reine Python-Stdlib. Distribution über Anthropics offizielle Community-Marketplace (`/plugin install token-saver@claude-community`) oder Self-hosted-Marketplace; v2.0 ist natives Plugin statt settings.json-Hooks, mit Update-Mechanismus und Stats-DB.[^3^]

**mpecan/tokf (192★, MIT, Rust)** — Der ernstzunehmendste RTK-Rivale: TOML-konfigurierbare Filter („pluggable rules"), vorzeigbare Before/After-Demos (cargo test 61→1 Zeile, git push 8→1), crates.io-Distribution mit CI. Positioniert sich als config-driven im Gegensatz zu RTKs hartkodierten Regeln.[^5^]

**3rg0n/thlibo (9★, MIT, Go)** — Architektonisch interessant: Nutzt exakt das dokumentierte PreToolUse+updatedInput-Pattern — der Bash-Befehl wird VOR Ausführung umgeschrieben, sodass stdout bereits komprimiert im Tool-Result landet (kein Proxy, kein „API-wire tampering"). Hybrid: deterministische Python-Filter für bekannte Kommandos, lokales Gemma 4 für unbekannte Outputs. Misst Ersparnisse ehrlich in Tokens statt Bytes.[^26^]

**sergioramosv/squeezr (34★, npm squeezr-ai)** — Einziger Proxy, der Prompt-Cache-Sicherheit explizit als Kernfeature vermarktet („compresses context on the fly — without ever breaking Anthropic's prompt cache"). Semantische Kompression per Haiku bzw. eigenem „Zest"-Modell, Realtime-Dashboard, unterstützt Claude Code/Desktop, Aider, OpenCode, Gemini CLI, Ollama.[^10^]

**ooples/token-optimizer-mcp (479★, MIT)** — Meistgesternter MCP-Neufund: Kombiniert Kontext-Kompression mit Savings-Messung pro Agent über 16 CLI-Clients und einem geteilten lokalen Knowledge-Graphen. „Enforced by default", Node 22+, npm @ooples/token-optimizer-mcp.[^27^]

**egorfedorov/claude-context-optimizer (92★, MIT)** — Einziger Kandidat mit evidenzbasiertem statt regelbasiertem Ansatz: trackt, welche Kontextbestandteile später tatsächlich wiederverwendet werden, und leitet daraus Sparvorschläge ab (Heatmaps, ROI-Reports, Budget-Alerts, git-aware). In hesreallyhim/awesome-claude-code gelistet (mit dem Vermerk „still somewhat exploratory").[^28^]

**diegosouzapw/OmniGlyph (78★, MIT)** — Neuartige Modalität: rendert sperrigen LLM-Kontext in dichte PNG-Seiten (multimodale Modelle lesen Bilder billiger als äquivalente Text-Tokens), behauptet 59–70 % Ersparnis mit „100 % read accuracy" und exakter Per-Provider-Billing-Math. Gleicher Autor wie OmniRoute.[^12^]

**Growth4U-systems/claude-token-hygiene (10★) & ncoevoet/claude-markdown-health-check (38★)** — Die Facet-5-Vertreter: token-hygiene quantifiziert den System-Overhead pro Konversation (CLAUDE.md ~8k, MEMORY.md ~5k, Skill-Beschreibungen ~6k, MCP-Schemas ~3,3k Tokens) als monatlichen Read-only-Audit; markdown-health-check scannt das gesamte .claude/-Setup (Skills, Commands, Hooks, Agents, Settings) auf tote Referenzen, schwache Trigger und Token-Bloat.[^17^][^18^]

**Capnjbrown/c0ntextKeeper (62★, MIT)** — Reifstes Hook-Bundle gegen Compaction-Datenverlust: 7 Hooks (inkl. Pre/PostCompact), 187 semantische Patterns, 3 MCP-Tools, „Never lose work to compaction again".[^8^]

**cardimvitor/tk — „TK Token Killer" (VS Marketplace)** — Bemerkenswert weil Multi-Tool: Eine Extension konfiguriert Claude Code (PreToolUse-Hook ~/.claude/hooks/tk-rewrite.sh), GitHub Copilot UND OpenAI Codex gleichzeitig; unterstützt git/cargo/dotnet/npm/jest/vitest/tsc/eslint/pytest/pip/ls/tree/grep/rg/find mit 60–90 % Ersparnis. Binary per `cargo install --git https://github.com/cardimvitor/Compression --bin tk` (das Compression-Repo war per API nicht mehr auffindbar — ggf. umbenannt/privat; Verifikation empfohlen).[^29^]

### Major Players & Sources

- **Kuratierung/Discovery**: hesreallyhim/awesome-claude-code (52,2k★, listet claude-context-optimizer & llm-router)[^28^]; ithiria894/awesome-claude-code-hooks (20★)[^21^]; itgoyo/awesome-claude-code; quemsah/awesome-claude-plugins (auto-indexiert, 15k Repos); awesomeclaude.ai (visuelles Directory, 203 Ressourcen); GitHub-Topic „token-saver" (38 Repos).[^30^]
- **Offizielle Kanäle**: anthropics/claude-plugins-official (33,5k★) und anthropics/claude-plugins-community (führt ppgranger/token-saver); Anthropic-Doku „Effective Context Engineering for AI Agents" (Compaction, JIT-Retrieval).[^20^][^3^]
- **Roundups, die die Kategorie definieren**: deployhq.com „6 free GitHub repos that cut your Claude Code token bill" (rtk, caveman, code-review-graph, agent-browser + 2 Monitore)[^31^]; aimoneylabjuliangoldie.com „Four Leaks"-Stack (RTK/Caveman/Ponytail/Omniroot mit eigenen Messungen: 82,9 % Tool-Output, 69 % Output-Tokens)[^32^]; firecrawl.dev „Best Claude Code Skills 2026"[^33^]; FlorianBruniaux/claude-code-ultimate-guide (kritisch annotierte Tool-Datenbank mit Stars-Ständen und URL-Korrekturen).[^34^]
- **Hersteller-Nebenakteure**: scaledown-team/DietCode (ScaleDown-Modell, Hooks + Proxy, sd_compress/sd_summarize-Tools)[^6^]; headroomlabs-ai/headroom (bekannt; 62,8k★ laut Guide, $700K-Sparclaim self-reported).[^34^]

### Trends & Signals

1. **RTK-Effekt**: RTK ist Referenzimplementierung geworden — Klone (aetox-skills/token-saver „RTK Protocol"), Stack-Bundles (lean-mode = RTK + caveman-ultra + Graph-First), Auto-Installer (artificemachine/token-diet verdrahtet RTK+tilth+Serena+ICM) und sogar Feature-Requests in Fremdprojekten (Kilo-Org/kilocode #5848: „Built-in CLI output filtering inspired by RTK", mit 10M-Token/89 %-Community-Messung).[^1^][^35^]
2. **Von Regeln zu Modellen**: 2026 zweite Welle nutzt lokale Kleinmodelle als Kompressoren (Paritok-4B, Gemma 4 in thlibo, Haiku/Zest in squeezr, Scaledown in DietCode) — Trade-off: semantisch robuster, aber Latenz + Vertrauensfrage.
3. **Reversibilität als Vertrauensfeature**: CCR („Compress, Cache, Retrieve") bzw. byte-exakte Rekonstruktion (densely sha256, magic-compact read_omitted_content, headroom retrieve) wird zur Antwort auf die /compact-Kritik „summary of a summary of a summary".[^7^][^9^]
4. **Cache-Ehrlichkeit**: Nach Analysen, dass Dritt-Tools Prompt Caching unabsichtlich brechen (MindStudio), werben squeezr und kuro-lean explizit mit Cache-Sicherheit/Cache-Rescue; tatarco/claude-code-starter verkauft sich als „cache-friendly configuration".[^11^][^10^]
5. **Plugin-Marketplace als Standard-Distribution**: Der Weg „settings.json-Hook" → „natives Plugin via /plugin install" (sichtbar an ppgranger/token-saver v2-Migration) professionalisiert die Kategorie; offizielle Marketplaces kuratieren erstmals Token-Tools.
6. **Facet-4-Explosion nach caveman**: Output-Styles werden benchmarked statt nur behauptet (beeline: „scored on quality as well as tokens"); Nischen-Varianten entstehen (FAA-Funkstil mit on-device Re-Expansion via Apple Intelligence, wenyan-Modi in caveman).[^15^][^16^]
7. **Facet-5 erwacht**: CLAUDE.md-/Systemprompt-Bloat wird quantifiziert (token-hygiene: 15–35k Tokens Overhead; HN-Thread: „Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k" — 463 Punkte/262 Kommentare). Erste Audit-Tools erscheinen.[^17^][^19^]
8. **Multi-Agent-Support als Tabellenpflicht**: Nahezu jeder Neufund listet Codex CLI, Cursor, Gemini CLI, Copilot, OpenCode/Hermes neben Claude Code — CC-only-Tools wirken zunehmend wie Nischenprodukte.

### Controversies & Conflicting Claims

- **Spar-Prozentzahlen sind kaum vergleichbar**: Bytes vs. Tokens vs. Dollars, Tool-Output-Anteil vs. Gesamt-Session. cavemans eigener „HONEST-NUMBERS"-Hinweis (nur Output-Tokens, Skill kostet selbst 1–1,5k Input-Tokens/Turn, kann netto negativ sein) ist die Ausnahme; thlibo betont explizit Token-Messung statt Bytes. deployhq nennt die $100/Monat-Rechnung selbst „clickbait math" mit ehrlicher Einordnung.[^13^][^26^][^31^]
- **Headroom-$700K-Claim**: Vom Maintainer selbst berichtet, ohne Dritt-Audit — der ultimate-guide markiert das explizit als „marketing signal, not a verified figure".[^34^]
- **Graphify 71,5× vs. ~60 %**: Hersteller-Benchmark (52-Dateien-Korpus) vs. unabhängige Review, die auf großen Codebases realistisch ~60 % sieht.[^23^]
- **Proxys können mehr kosten als sparen**: Wer den Request-Prefix verändert, zerstört Prompt-Caching (Cache-Read = 0,1× Preis); History-Umstrukturierung pro Turn = kein Cache-Hit. Kritik an „aggressive context trimming" von Dritt-Tools.[^11^]
- **PreCompact-Hook-Dauerbaustelle**: Anthropic wurde seit 12/2025 in mindestens sechs Issues (#15923, #17237, #23007, #34299, #39099, #43946, #61275) um PreCompact/Threshold-Hooks gebeten; inzwischen existiert der Hook, aber MemPalace issue #856 dokumentiert: `block` = Abbruch statt Aufschub — ein schlecht konfigurierter PreCompact-Hook macht Compaction unmöglich und *garantiert* damit Datenverlust.[^36^][^25^]
- **Claude-Codes eigener Overhead im Kreuzfeuer**: Der HN-Thread (33k System-Tokens vor dem ersten Prompt vs. OpenCode 7k) legt nahe, dass Anthropic selbst der größte Token-Verbraucher im System ist — Community-Tools optimieren an den Rändern, während der Systemprompt unangetastet bleibt.[^19^]
- **tk/Compression-Repo unauffindbar**: Die VS-Code-Extension verweist auf github.com/cardimvitor/Compression, per API nicht gefunden — Supply-Chain-Frage bei cargo-install-from-git bleibt offen.[^29^]

### Recommended Deep-Dive Areas

1. **Paritok-4B** — Einziges spezialtrainiertes Open-Source-Kompressionsmodell für Coding-Agents; Benchmark-Methodik (45K Trajektorien, 25→85 %-Kurve) und HF-Modellkarte prüfen. Reproduktions-Test gegen rtk/headroom lohnt.
2. **magic-compact vs. claude-rolling-context (bekannt) vs. native /compact** — Drei philosophisch verschiedene Compaction-Strategien (Per-Turn-Summaries vs. Rolling Proxy vs. Blob); ein kontrollierter Langzeit-Sessions-Vergleich fehlt öffentlich.
3. **Cache-Sicherheits-Matrix** — Welche Proxys/Hooks brechen Prompt Caching tatsächlich? squeezr (cache-safe behauptet), kuro-lean (cache-rescue), headroom, Paritok, TokenSnap systematisch auf cache_read-Raten testen.
4. **thlibo-Pattern** — PreToolUse+updatedInput-Rewrite mit lokalem Fallback-Modell (Gemma 4): sauberste Hook-Architektur ohne Proxy; prüfen, ob das Pattern generalisierbar ist (Codex-CLI-PostToolUse-Einschränkungen beachten).
5. **Facet 5: CLAUDE.md-Audit-Tooling** — token-hygiene + markdown-health-check + vantaige „9 token-waste patterns" als Basis für eine quantifizierte Best-Practice (Token-Budgets pro Systemkomponente); bisher kein etabliertes Tool, Lücke.
6. **PNG/Pixel-Kontext-Encoding** — OmniGlyph, caveman Pixel mode, xuweizhengo: echte Ersparnis nur bei bestimmten Modell-/Provider-Pricing? Grenzen (exact-answer tasks, Diff-Fidelity) unklar.
7. **ooples/token-optimizer-mcp** — Mit 479★ der größte MCP-Neufund; prüfen, ob die Savings-Messung über 16 Clients methodisch belastbar ist (potenziell Standard-Benchmark-Harness).
8. **Offizielle Plugin-Marketplaces als Qualitätssignal** — Beobachten, welche Token-Tools in anthropics/claude-plugins-official aufgenommen werden (derzeit Community-Marketplace: token-saver).

### Quellen

[^1^]: GitHub Search API „claude code token compress" u. a. Queries, 2026-08-13 (Repo-Metadaten via api.github.com).
[^2^]: https://github.com/topics/token-saver
[^3^]: https://github.com/ppgranger/token-saver
[^4^]: https://github.com/Paritok-official/paritok-4b-v1
[^5^]: https://github.com/mpecan/tokf
[^6^]: https://github.com/scaledown-team/DietCode
[^7^]: https://github.com/aerovato/magic-compact
[^8^]: https://github.com/Capnjbrown/c0ntextKeeper
[^9^]: https://github.com/alibaizhanov/densely ; https://github.com/omar-y-abdi/furl-ctx
[^10^]: https://github.com/sergioramosv/squeezr
[^11^]: https://www.mindstudio.ai/blog/anthropic-prompt-caching-claude-subscription-limits
[^12^]: https://github.com/diegosouzapw/OmniGlyph
[^13^]: https://github.com/JuliusBrussee/caveman (bekannt; Referenz für Pixel/TOON/HONEST-NUMBERS)
[^14^]: https://github.com/PCIRCLE-AI/toonify-mcp
[^15^]: https://github.com/iceHub82/beeline ; https://github.com/johnsnow1011/taxman ; https://github.com/vliggio/claude-faa-speak
[^16^]: https://github.com/carlosduplar/caveman-output-style-claude-code
[^17^]: https://github.com/Growth4U-systems/claude-token-hygiene
[^18^]: https://github.com/ncoevoet/claude-markdown-health-check
[^19^]: https://github.com/duanyytop/agents-radar/issues/2106 (HN-Daily 2026-07-13: „Claude Code sends 33k tokens before reading the prompt; OpenCode sends 7k", 463 Pkt./262 Komm.)
[^20^]: https://github.com/anthropics/claude-plugins-official
[^21^]: https://github.com/ithiria894/awesome-claude-code-hooks ; https://github.com/karanb192/claude-code-hooks
[^22^]: https://github.com/tirth8205/code-review-graph ; https://www.coddykit.com/pages/blog-detail?id=512945 ; https://topaiproduct.com/2026/03/18/from-739k-to-15k-tokens-how-code-review-graph-slashes-claude-code-costs-with-a-local-knowledge-graph/
[^23^]: https://github.com/Graphify-Labs/graphify ; https://meta-quantum.today/?p=8475 (unabhängige Review: ~60 % realistisch)
[^24^]: https://github.com/diegosouzapw/OmniRoute ; https://news.reichenberg.ruhr/archive/17e04a2b-f892-41cc-a3b4-02358abf8ece
[^25^]: https://github.com/MemPalace/mempalace/issues/856
[^26^]: https://github.com/3rg0n/thlibo
[^27^]: https://github.com/ooples/token-optimizer-mcp
[^28^]: https://github.com/hesreallyhim/awesome-claude-code ; https://github.com/egorfedorov/claude-context-optimizer
[^29^]: https://marketplace.visualstudio.com/items?itemName=cardimvitor.tk-token-killer
[^30^]: https://awesomeclaude.ai/awesome-claude-code ; https://claudefa.st/blog/tools/resources/awesome-claude-code
[^31^]: https://www.deployhq.com/blog/free-github-repos-for-claude-code
[^32^]: https://aimoneylabjuliangoldie.com/blog/how-to-reduce-claude-code-token-usage/
[^33^]: https://www.firecrawl.dev/blog/best-claude-code-skills
[^34^]: https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ecosystem/context-engineering-tools.md
[^35^]: https://github.com/Kilo-Org/kilocode/discussions/5848
[^36^]: anthropics/claude-code Issues #15923, #17237, #23007, #34299, #39099, #43946, #61275 (PreCompact-Feature-Requests)
[^37^]: https://github.com/Open330/context-compress
[^38^]: https://github.com/hansipie/ecotokens ; https://github.com/kurovu146/kuro-lean ; https://github.com/illuwa/ctx-diet
[^39^]: https://github.com/chethanbhatbs/compactor-skill ; https://github.com/Supersynergy/agent-token-saver-skill-router
[^40^]: https://vantaige.io/blog/claude-code-token-waste-9-patterns-fixes-2026
