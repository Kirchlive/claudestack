# dim08: Monitoring & Regelwerk

**Dimension:** Messung, Governance & das operative Hook-Regelwerk (bash-dump-guard / Ladder)
**Datum:** 2026-08-13 · **Autor:** Deep-Dive-Agent dim08
**Leitfrage:** Ohne Messung keine Optimierung — welche Messtools liefern welche Daten, und wie sieht ein konkretes, sicheres Hook-Regelwerk aus, das Bash-Dumps bändigt und Eskalation stuft?

---

## Mess-Tool-Matrix

Legende: **Live** = in-session/nahe Echtzeit (Statusline, TUI, Menüleiste); **Historisch** = Auswertung lokaler Session-Dateien (JSONL) im Nachhinein; **Aktion** = Tool löst selbst Änderungen/Guards aus (nicht nur anzeigen).

| Tool | ★ (13.08.2026) | Sprache / Install | Misst was | Live vs. historisch | Aktion? | Datenquelle |
|---|---:|---|---|---|---|---|
| **ccusage** [^1^] | 17.884 | Rust/TS, `npx ccusage` | Tokens + Kosten nach Tag/Woche/Monat/Session, 5h-Billing-Blocks, Cache-Tokens, 16 Agent-CLIs | historisch (+ `blocks --live`, Statusline-Beta) | nein (nur Report) | `~/.claude/projects` u. a. |
| **CodeBurn** [^2^] | 9.265 | TypeScript, `npx codeburn`, Node ≥22.13 | Tokens/Kosten über 40 Tools, nach Task/Modell/Projekt; Waste-Findings (Re-Reads, MCP-Overhead, aufgeblähte CLAUDE.md) | beides (TUI/Web/Menubar + Reports) | **ja** — `optimize --apply` (Journal+Undo), `guard` (Budget-Hooks) | Session-Dateien auf Disk |
| **CodexBar** [^3^] | 20.004 | Swift, macOS 14+ (`brew install --cask codexbar`) | **Kontingente**: Session-/Wochen-/Monatsfenster + Reset-Countdowns, 69 Provider, Credits/Spend | live (Menüleiste, 30s-Refresh) | nein (Anzeige) | Provider-APIs/OAuth/Cookies/CLIs |
| **Claude Code Usage Monitor** (Maciek-roboblog) [^4^] | 8.621 | Python, `uv tool install claude-monitor` | 5h-Fenster: Tokens, Nachrichten, Kosten; Burn-Rate-Prognose, Pace, offizielle `rate_limits` vs. lokale Schätzung (Provenance-Labels), Warehouse über 30-Tage-Löschung | live (Rich-TUI, `--once --output json`) | Warnungen, keine Aktion | JSONL + Statusline-`rate_limits` |
| **token-tracker** (stormzhang) [^5^] | 485 | Python 3.11+ | Tokens/Kosten/Quota (5h/7d) für Claude Code + Codex + Kimi; 4-zeilige Statusline inkl. **Ctx-%-Anzeige**, Sidebar | live (Statusline/Sidebar) + historisch (Reports) | nein | lokale Logs + Statusline-Interface |
| **toktrack** (mag123c) [^6^] | 184 | Rust, `npx toktrack` | Tokens/Kosten für 8 CLIs; **persistenter Cache überlebt Claude Codes 30-Tage-Löschung** (`cleanupPeriodDays`), `audit` zeigt live vs. nur-noch-gecachte Tage | historisch (TUI, ~0,04s warm) | nein | Session-Dateien + eigener Cache |
| **headroom-meter** [^7^] | 6 | Python, ein Skript, keine Deps | **Kompressions-ROI** des Headroom-Proxys: gesparte Tokens/Request, Cache-Hit, Frame-Reduktion | live (Terminal-Dashboard) | nein | Headroom `proxy.log` |
| **claude-context-optimizer** (CCO) [^8^] | 92 | JavaScript, Claude-Code-Plugin | Verschwendeter Kontext: Re-Reads, nie genutzte Dateien, **reale Tool-Kosten** (MCP-Tool-Preise aus eigener Messung statt Konstanten), Read-Cache-Staleness; Heatmaps, Budget-Alerts | live (Plugin-Hooks) + historisch (Reports) | teilweise (`.contextignore`, `/cco-*`-Kommandos) | Session-Transkripte, eigene Ledger |

**Einordnung:**
- **Historische Basis:** ccusage (De-facto-Standard, breiteste CLI-Abdeckung) oder CodeBurn (wenn man die Waste-Findings + Apply-Loop will). toktrack als Ergänzung wegen 30-Tage-Überleben.
- **Live im Arbeitsfluss:** CodexBar (macOS, Quota) bzw. claude-monitor (plattformübergreifend, 5h-Fenster-Prognose) bzw. token-tracker (einzige mit Kontext-%-Statusline für Claude Code **und** Pseudo-Statusline in Codex).
- **Einziger geschlossener Kreis:** CodeBurn — `optimize` (findet Waste mit $-Schätzung) → `--apply` (journald, `act undo`) → `guard` (Soft/Hard-Cap-Hooks) → `act report` (realisierte vs. geschätzte Ersparnis nach ≥3 Tagen) [^2^].
- **Nativ als Referenz:** `/context`, `/usage`, Statusline, OTEL (`CLAUDE_CODE_ENABLE_TELEMETRY=1`) — siehe Konflikte (Otel Smuggling).

---

## Detailprofile Messung (8) + Hooks (7)

### Messung

**1. ccusage/ccusage (17,9k★)** — `npx ccusage`; liest lokale Nutzungsdaten von 16 Coding-CLIs (Claude Code, Codex, OpenCode, Gemini, Copilot …) und erzeugt Daily/Weekly/Monthly/Session-Reports, 5-Stunden-Blocks (Billing-Fenster), Statusline-Integration (Beta), JSON-Export, Cache-Token-Aufschlüsselung, Offline-Modus, Custom-Pricing via `ccusage.json` [^1^]. Aktiv gepflegt (letzter Push 12.08.2026); offene Issues sind überwiegend Provider-Mapping/Perf, keine Sicherheitsprobleme [^9^]. **Rolle:** historische Basismessung, Skript-fähig (`--json`).

**2. getagentseal/codeburn (9,3k★)** — „See where your AI spend goes." Local-first, 40 Tools, Breakdown nach Task/Modell/Tool/Projekt; LiteLLM-Pricing täglich aktualisiert [^2^]. Kernstücke:
- `codeburn optimize` findet u. a.: über Sessions wiederholt gelesene Dateien, niedriges Read:Edit-Verhältnis, ungedeckelte `BASH_MAX_OUTPUT_LENGTH`, ungenutzte MCP-Server, „Ghost"-Agents/Skills, aufgeblähte CLAUDE.md (inkl. `@-import`-Expansion), Cache-Creation-Overhead — jeder Befund mit geschätzter $-Ersparnis + paste-fertigem Fix, gerankt A–F [^2^].
- `--apply` wendet Config-Fixes an, alles gejournalt, `codeburn act undo --last` rollbackt; `act report` vergleicht nach ≥3 Tagen realisierte vs. geschätzte Ersparnis [^2^].
- `codeburn guard install` schreibt opt-in Hooks in `.claude/settings.json`: Soft-Cap $5 (Warnung), Hard-Cap $15 (Session-Stop, `guard allow` hebt auf), Checkpoint $3 (Nudge bei Session-Ende ohne Edits/Commits). Config `~/.config/codeburn/guard.json`; **Hooks fail-open** [^2^].
- Issues: aktiv (46 offen), darunter Doppelzählungs-/Cache-Bugs (#988, #987) — Kosten-Daten mit Vorsicht bei Multi-Provider [^10^].

**3. steipete/CodexBar (20k★)** — macOS-Menüleiste (14+), 69 Provider; zeigt Session-/Weekly-/Monthly-Limits + Reset-Countdowns, Credits, Admin-API-Spend; nutzt vorhandene Sessions (OAuth, Cookies, CLIs), keine Passwort-Speicherung [^3^]. 142 offene Issues = aktive, aber komplexe Codebasis. **Rolle:** Quota-Ampel für Planung langer Tasks; kein Token-Detail.

**4. Maciek-roboblog/Claude-Code-Usage-Monitor (8,6k★)** — `uv tool install claude-monitor`. Live-Rich-TUI für 5h-Fenster mit Prognose; v4.0 „Usage Ops": `--statusline` erfasst offizielle `rate_limits`, fällt bei stale auf **gelabelte** lokale Schätzungen zurück (Provenance: `official`/`local_estimate`/`experimental`); `--once`, `--compact`, `--write-state` als maschinenlesbares Protokoll für externe GUIs; opt-in Warehouse überlebt 30-Tage-Cleanup [^4^]. Issues: Modell-Erkennung neuer Modelle (Claude 5/Fable 5) hinkt hinterher (#239, #236), Windows-Tests brechen (#238) [^11^].

**5. stormzhang/token-tracker (485★)** — Python; unified Tracking Claude Code + Codex + Kimi. Einzige gefundene Lösung mit **echter 4-zeiliger Claude-Code-Statusline** (Session-Total, Cost, Ctx-%-Balken, Token-Mix des aktuellen Fensters, Out-TPS) plus „Pseudo-Statusline" für Codex via Hook-Injection (laut Autor ohne Kontext-Kosten, da nicht ins Modell gerendert) [^5^]. Sprache primär Chinesisch, README_EN vorhanden.

**6. mag123c/toktrack (184★)** — Rust (simd-json + rayon, ~3 GiB/s); Kernargument: **Claude Code löscht Session-Dateien nach 30 Tagen** (`cleanupPeriodDays`, Default 30) — toktrack cached Tages-Summaries immutabel, `toktrack audit` zeigt pro Tag live/preserved/missing; empfiehlt `"cleanupPeriodDays": 9999999999` in settings.json [^6^]. **Rolle:** Langzeit-Kostenarchiv.

**7. RonnieTheTester/headroom-meter (6★)** — Ein-Skript-Live-Dashboard für den Headroom-Kompressions-Proxy: Tokens vorher/nachher, Peak-Save/Request, Cache-Hit-Rate, Frame-Reduktion. Feld-Messung aus einer echten Session: 334.462 von 14,18M Input-Tokens gespart (~2,4 %), Cache-Hit 95,2 % [^7^]. Nur relevant, wenn Headroom im Stack (dim: Kompression).

**8. egorfedorov/claude-context-optimizer (92★)** — Plugin; trackt jedes Read/Edit/Search, lernt „nützlich vs. Waste". Bemerkenswert ehrliche Metriken: Token-Schätzung pro Sprache aus 6.344 echten Dateien kalibriert (.svg 100,5 chars/Zeile, .ts 44); **Tool-Kosten werden nach 3 Aufrufen aus eigener Messung budgetiert** statt aus Konstanten (MCP-Tool real 38K statt angenommener 200 Tokens); Pattern-Export/Import ins Repo mit strikter Auditierung (nur relative Pfade, Import als separater Prior) [^8^]. Windows-Bugs in v4.7 gefixt (Pfad-Encoding, CRLF in `.contextignore`) [^8^].

### Hooks

**1. karanb192/claude-code-hooks (470★, 1.238 Tests in CI)** — Copy-paste-Hook-Sammlung + Plugin-Marketplace (7 Plugins). Relevant für Token-Minimierung: `context-hogs` (per-file Kontext-Kosten-Leaderboard, ordnet Tool-Result-Tokens den geladenen Dateien zu), `dead-rules-audit` (CLAUDE.md-Compliance-Scorecard — findet chronisch ignorierte Regeln, die man in deterministische Hooks statt Kontext gießen sollte), `session-logger`. Sicherheits-Hooks (`block-dangerous-commands`, `protect-secrets`) mit Safety-Levels `critical|high|strict` und **opt-in Ask-Mode** via `HOOK_ASK_*` (Default = deny). PostToolUse-Recorder laufen mit `"async": true` (~null Latenz) [^12^]. **Wichtig:** Regex-Ganzzahl-Matching auf Command-String — Compound-Command-Lücke (s. Prior-Art).

**2. disler/claude-code-hooks-mastery (3,9k★)** — Lehr-Repo: alle 13+ Hook-Events als Python-uv-Single-File-Skripte mit Payloads, JSONL-Logging pro Event, `pre_compact.py` (Transkript-Backup vor Compaction), Best Practices (`stop_hook_active` prüfen, `$CLAUDE_PROJECT_DIR`-Anker) [^13^]. Kein Produkt, aber Referenz-Implementierung des Hook-Vertrags.

**3. disler/claude-code-hooks-multi-agent-observability (1,5k★)** — Echtzeit-Monitoring: Hooks senden HTTP-POST → Bun-Server → SQLite → WebSocket → Vue-Dashboard; alle 12+ Events inkl. Subagent-Lifecycle; `.claude`-Ordner wird pro Projekt kopiert, `send_event.py --source-app NAME` taggt Events [^14^]. **Rolle:** Schwarm-Observability (für Multi-Agent-Token-Attribution); braucht eigenen Server = höchster Setup-Aufwand der Liste.

**4. overloop (PyPI; Adam Danielsson)** — Minimalistischer 3-Guard-Hook, deterministisch, keine Embeddings: (a) **Loop-Guard** (PreToolUse): Fingerprint `sha1(tool_name + canonical(args))`, Zähler bei Wiederholung in Folge, Block an Schwelle; (b) **Dedup-Guard** (PreToolUse): blockt redundante Read-only-Calls; mutierende Calls invalidieren betroffene Fingerprints (nur aktuelle Reads werden geblockt); (c) **Truncate-Guard** (PostToolUse): schreibt volles Output in **Spill-Datei**, Modell bekommt Preview + Dateipfad. State: eine kleine JSON pro Session unter `~/.overloop`, keyed by `session_id` (Hook-Prozess ist zustandslos) [^15^]. Explizites Scope-Versprechen: „does not route models, cache semantically, or touch the model's reasoning" [^15^]. **Vorlage für das bash-dump-guard-Design unten.** Hinweis: PyPI-Seite zum Stichtag nicht mehr abrufbar (404 über API); libraries.io-Spiegel vom 04.07.2026 dokumentiert Design [^15^].

**5. 0xhimanshu/governor (127★, v0.2.3)** — Plugin + Multi-Agent-Rules. **Content-aware Filter:** Output wird nur kompaktiert, wenn >40 % Duplikat-Zeilen (Test-Failures, Log-Spam); eindeutige Daten (JSON, API-Responses, Code) passieren ungefiltert. Benchmark: 45,5 % Token-Ersparnis bei VCLR 0,00 und 100 % Decision-Preservation (vs. Caveman 69,1 % aber 12,5 % Fehlentscheidungen); Signal-Checks: pytest-Failure in langem Log → 64 % geblockt, Signal erhalten; Burp-MCP-Payload → 90,9 % geblockt, Finding erhalten [^16^]. `GOVERNOR_FULL=1` als Inline-Bypass im selben Bash-Call; `/governor:audit` findet aufgeblähte Memory/Rule-Files; `/governor:compress` mit Protected-Span-Validierung + Quality-Guard (Backup-Restore bei geringer Ersparnis); Telemetry-Ledger (geblockte Tokens, Compactions) via `/governor:status` [^16^]. Empfehlungsleiter: compress→split→filter→/clear→/compact. 0 offene Issues.

**6. severity1/claude-code-prompt-improver (1,8k★)** — UserPromptSubmit-/Subagent-Hooks mit 9 gezielten Nudges (clarity-check, approach-assessment, workflow plan-first, output-readability, background-exec, subagent-routing); keyword-gegatete Nudges tragen Bedingung im Text („If this is X… if not, ignore") → Fehlzündung billig abwimmelbar; v0.4.0 Skill-Architektur: klare Prompts = null Skill-Overhead, vage Prompts → Research + 1–6 Rückfragen; **31 % Token-Reduktion** durch weniger Korrektur-Roundtrips [^17^]. Issues zeigen Reife: Skip harness-generierter Events (#45), Tracking von `updatedPrompt` (#32) [^18^].

**7. yifanzz/claude-code-boost (164★)** — Auto-Approval-Hook (Fast-Path für Read/LS/Glob, **LLM-Analyse** für komplexe Fälle, Cache gegen Doppel-API-Calls), Test-Enforcement-Hook (blockt Session-Ende bis Tests liefen), Notifications [^19^]. **Kritik für Token-Budget:** LLM-in-the-loop pro Approval kostet selbst Tokens — für reine Token-Minimierung ist deterministisches Regelwerk (warden/command-policy) vorzuziehen.

### Prior-Art-Block (Command-Policy / Compound-Parsing)

- **YoraiLevi/claude-command-policy** — Daten-getriebener jq+bash PreToolUse-Steering-Hook (allow/ask/deny + Teaching-Message), **fail-open**, Segment-Split auf `; & |` mit deny>ask>allow-Präzedenz; Status „parked". Sein `docs/PRIOR-ART.md` (6 Researcher, ~888k Tokens) ist die beste gefundene Marktanalyse: **Star-Führer (damage-control 474★, karanb192 428★) sind Regex-Whole-String mit Quoted-Separator-Bug; alle compound-aware Tools (warden, oryband, liberzon, gwatts) sind niedrig-star** [^20^].
- **banyudu/claude-warden (29★)** — AST-basiert (bash-parser): Pipe/Chain-Dekomposition, Argument-aware Regeln, rekursive Auswertung von `ssh host 'cmd'`/`docker exec`/`$()`, Env-Prefix-Handling, YAML-Layering project>user>default, `askOnSubshell`, `targetPolicies` (z. B. Prod-DB deny), Skill-Filtering; Exit 0/1/2 = allow/ask/deny; läuft auch für Codex CLI & Copilot CLI [^21^]. **Offenes Sicherheits-Issue #123: `for/while/if`-Konstrukte liefern allow und umgehen alle Regeln inkl. alwaysDeny** [^22^] — belegt, dass auch AST-Ansätze Lücken haben.
- **oryband/claude-code-auto-approve (19★)** & **gwatts/claude-compound-bash (9★)** — shfmt- bzw. Go-AST-basierte Compound-Dekomposition; native-Windows-Nachteile [^20^].
- **Lehre für eigene Guards:** Compound-Dekomposition ist „the one genuinely hard part" [^20^]; wer keinen Parser vendorn will, sollte auf Rewrite/`allow` ganz verzichten und nur deny/ask + Truncate nutzen (s. bash-dump-guard-Design).

---

## Sekundär-Repos Kurzliste

| Repo | ★ | Kurzprofil |
|---|---:|---|
| f/agentlytics | 560 | Unified Analytics-Dashboard über 17 Editoren, lokal, `npx agentlytics` → localhost:4637 [^23^] |
| nikitadoudikov/claude-pulse | 244 | Zero-Dep-Live-Dashboard: ECG-„Puls", Context-Fill je Session, Limit-Learning aus eigenem Deckel, **Remote-Approval per Phone**, Session-Recovery [^24^] |
| onikan27/claude-code-monitor | 298 | TUI + Mobile-Web Multi-Session-Monitor, macOS-only (AppleScript-Terminal-Fokus), file-based, serverless [^25^] |
| Growth4U-systems/claude-token-hygiene | n/a | Skill + Cron-Audit: misst System-Kontext-Overhead (CLAUDE.md/MEMORY.md/Skills/MCP ~15–35k Tokens/Conversation); eigener Selbstversuch 30k→15k (−50 %); `ENABLE_CLAUDEAI_MCP_SERVERS=false` [^26^] |
| ncoevoet/claude-markdown-health-check | 38 | `.claude/`-Auditor: Skill-Listing-Budget (1 %-Kontext-Budget), tote Refs, Hook-Safety (block-Decision mit Exit 1 statt 2!), Permission-Hygiene; Schwellen live aus offiziellen Docs, Evidence-Gate gegen False-Positives [^27^] |
| valorisa/Claude-Skills | 4 | 20 TDD-getestete Skills: `rescue-tokens` (9 Muster, ~90 % Verbositäts-Reduktion), `token-optimization` (Cache-Mgmt, Context-Forking, Modellwahl; Selbstauskunft 70–80 %) [^28^] |
| ithiria894/awesome-claude-code-hooks | 20 | Kuratierte Hook-Liste; relevante Fundstücke: liberzon/claude-hooks (Compound-Split in Python-stdlib), Lasso Injection-Scanner [^29^] |
| g4itpl/clear-nudge | n/a | ~200 Zeilen UserPromptSubmit-Hook: misst Live-Kontext aus Transkript, injiziert **einmalig pro Schwelle** „guter Moment für /clear + Handoff-Note schreiben"; Prämisse: früh clearen ist billiger als spät compactet zu werden; Fall: 1 Fenster fraß 49 % Wochenkontingent (500k Tokens/Tool-Call) [^30^] |
| JanBancerewicz/context-cost-guard | 2 | UserPromptSubmit-Guard: blockt **einmal** vor teurem Cold-Cache-Turn (Kontext ≥60k UND Idle ≥55 min → Cache-TTL abgelaufen → Kosten ~20×); Block-Karte mit /clear, /compact, resend-Option; Snooze 300s; fail-open [^31^] |
| emanueleielo/compact-middleware | n/a | Claude-Codes Compaction-Pipeline als DeepAgents-Middleware: Trigger Default 0,85 Fenster-Anteil, Microcompact (Keep-last-5, Zeitlücke >60 min), TruncateArgs 2000 Zeichen, Circuit-Breaker nach 3 Fehlschlägen, 9-Sektionen-Summary, hybrides Token-Counting [^32^] |
| Native OTEL | — | `CLAUDE_CODE_ENABLE_TELEMETRY=1` + OTLP-Exporter: Events `api_request` (Kosten/Tokens), `tool_result`, `tool_decision`, `user_prompt`; Traces nur mit `CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`; Konfig wird nur beim Start gelesen [^33^][^34^] |

---

## Regelwerk-Konzept: bash-dump-guard.mjs (Referenz-Design)

**Ziel:** Ein einziger Node-.mjs-Hook (keine Dependencies, Node ≥18 — Claude Code bringt Node ohnehin mit), der das bewährte overloop-Muster [^15^] als ausbaubare Referenz implementiert: (1) **Spill** großer Bash-Dumps, (2) **Dedup** identischer Outputs, (3) **Loop-Guard** gegen Wiederhol-Calls — unter strikter Einhaltung des Hook-Vertrags und der Sicherheitslehren aus rtk #260 [^35^] und dem Compound-Command-Befund [^20^].

### Design-Entscheidungen (die „Warums")

1. **Kein `permissionDecision: "allow"` — niemals.** rtk #260 zeigte: ein Rewrite-Hook, der `allow` + `updatedInput` zurückgibt, umgeht die komplette Permission-Kette inkl. aller `deny`-Regeln in settings.json [^35^]. Dieser Guard entscheidet nur `deny` (Loop-Guard) oder nichts (fail-open/pass-through). Das Truncating passiert in **PostToolUse** via `hookSpecificOutput.updatedToolOutput` — das verändert nur, was das Modell sieht, nie was ausgeführt wird [^36^].
2. **PreToolUse (Loop-Guard) und PostToolUse (Spill/Dedup) in einer Datei**, Dispatch über `hook_event_name` aus dem stdin-JSON. Loop/Dedup *müssen* vor dem Call greifen, Truncate *kann* nur danach greifen (nur da existiert das Result) [^15^].
3. **State pro Session:** `~/.bash-dump-guard/<session_id>.json` — Hook-Prozesse sind zustandslos, State muss auf Disk [^15^]. Spill-Dateien unter `~/.bash-dump-guard/spill/<session_id>/`.
4. **Fail-open bei jedem Fehler** (korruptes stdin, I/O-Fehler) — ein Guard, der Arbeit blockiert, wird deinstalliert (overloop-Philosophie; auch codeburn-Guard fail-open [^2^]).
5. **Kein Compound-Parsing, keine Regex-Command-Analyse.** Der Guard schaut auf *Output-Größe und Wiederholung*, nicht auf Command-Semantik → die komplette Compound-Command-Falle [^20^] entfällt konstruktiv.
6. **Token-Schätzung:** `ceil(chars / 4)` als konservative Heuristik (wie CCO kalibriert: sprachabhängig 25–100 chars/Zeile [^8^] — für einen Guard reicht die Größenordnung).
7. **Timeout-Disziplin:** Hook muss <1s laufen (Hook-Latenz liegt im Hot-Path [^37^]). Spill-Schreiben ist O(Output), kein Netz, kein LLM.

### Datei-Struktur

```
~/.claude/hooks/bash-dump-guard.mjs        # der Hook (s.u.)
~/.bash-dump-guard/
  <session_id>.json                        # State: fingerprints, counters
  spill/<session_id>/<ts>-<hash8>.log      # volle Outputs
```

### Kernlogik (austüftelte JS-Fragmente auf Basis der offiziellen Hook-API)

```javascript
#!/usr/bin/env node
// bash-dump-guard.mjs — PreToolUse(Loop) + PostToolUse(Spill/Dedup) für Bash.
// Vertrag: stdin=JSON; exit 0 + optionales JSON auf stdout; KEIN allow, fail-open.
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// ---- Tunables (Env-overridable) -------------------------------------------
const SPILL_TOKENS   = +(process.env.BDG_SPILL_TOKENS   ?? 2000); // >N Tokens → spill
const PREVIEW_LINES  = +(process.env.BDG_PREVIEW_LINES  ?? 40);   // Head+Tail je
const LOOP_LIMIT     = +(process.env.BDG_LOOP_LIMIT     ?? 3);    // n-te identische Wiederholung → deny
const STATE_DIR = join(homedir(), '.bash-dump-guard');

// ---- stdin lesen (fail-open bei jedem Fehler) ------------------------------
const raw = await new Promise(res => {
  let d = ''; process.stdin.on('data', c => d += c).on('end', () => res(d));
});
let ev; try { ev = JSON.parse(raw); } catch { process.exit(0); }
if (ev.tool_name !== 'Bash') process.exit(0);

const estTokens = s => Math.ceil((s?.length ?? 0) / 4);
const fp = obj => createHash('sha1').update(JSON.stringify(obj, Object.keys(obj).sort())).digest('hex');

// ---- State laden/speichern (pro Session) -----------------------------------
const stateFile = join(STATE_DIR, `${ev.session_id}.json`);
let st = {}; try { st = JSON.parse(readFileSync(stateFile, 'utf8')); } catch {}
st.calls ??= {}; st.lastFp ??= null; st.lastN ??= 0; st.outputs ??= {};
const save = () => { try { mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(stateFile, JSON.stringify(st)); } catch {} };

const out = o => { process.stdout.write(JSON.stringify(o)); process.exit(0); };

// ============================ PreToolUse: LOOP-GUARD ========================
if (ev.hook_event_name === 'PreToolUse') {
  const cmd = ev.tool_input?.command ?? '';
  const f = fp({ tool: 'Bash', cmd });
  const n = (f === st.lastFp) ? st.lastN + 1 : 1;
  st.lastFp = f; st.lastN = n; save();
  if (n > LOOP_LIMIT) {
    out({ hookSpecificOutput: {                 // NUR deny — niemals allow (rtk #260)
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `Loop-Guard: identischer Bash-Call zum ${n}. Mal in Folge. ` +
        `Ändere die Strategie statt denselben Befund erneut abzufragen ` +
        `(Ergebnis liegt ggf. in ~/.bash-dump-guard/spill/${ev.session_id}/).`
    }});
  }
  process.exit(0); // alles andere: pass-through, Permission-System entscheidet
}

// ===================== PostToolUse: SPILL + DEDUP ===========================
if (ev.hook_event_name === 'PostToolUse') {
  const text = typeof ev.tool_response === 'string'
    ? ev.tool_response
    : (ev.tool_response?.content ?? ev.tool_response?.stdout ?? JSON.stringify(ev.tool_response ?? ''));
  const h = fp(text);

  // (a) DEDUP: identisches Output schon gesehen → fast nichts zurückgeben
  if (st.outputs[h]) {
    save();
    out({ hookSpecificOutput: { hookEventName: 'PostToolUse',
      updatedToolOutput:
        `[dedup] Identisches Output wie zuvor (${estTokens(text)} Tokens eingespart). ` +
        `Volltext: ${st.outputs[h]}` }});
  }

  // (b) SPILL: großes Output auslagern, Preview + Retrieve-Pfad zurückgeben
  if (estTokens(text) > SPILL_TOKENS) {
    const dir = join(STATE_DIR, 'spill', ev.session_id);
    const file = join(dir, `${Date.now()}-${h.slice(0, 8)}.log`);
    try { mkdirSync(dir, { recursive: true }); writeFileSync(file, text); } catch { process.exit(0); }
    st.outputs[h] = file; save();
    const lines = text.split('\n');
    const preview = lines.length <= PREVIEW_LINES * 2 ? text
      : lines.slice(0, PREVIEW_LINES).join('\n')
        + `\n… [${lines.length - 2 * PREVIEW_LINES} Zeilen / ~${estTokens(text)} Tokens gekürzt] …\n`
        + lines.slice(-PREVIEW_LINES).join('\n');
    out({ hookSpecificOutput: { hookEventName: 'PostToolUse',
      updatedToolOutput:
        `${preview}\n\n[bash-dump-guard] Vollständiges Output (${lines.length} Zeilen, ` +
        `~${estTokens(text)} Tokens): ${file}\nBei Bedarf gezielt nachlesen: ` +
        `grep/sed/awk auf diesen Pfad, NICHT den Befehl wiederholen.` },
      suppressOutput: false });
  }
  st.outputs[h] ??= '(inline)'; save();
  process.exit(0);
}
process.exit(0);
```

### Registrierung

```json
{
  "hooks": {
    "PreToolUse":  [{ "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }],
    "PostToolUse": [{ "matcher": "Bash",
      "hooks": [{ "type": "command", "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }]
  }
}
```

### Bekannte Grenzen dieses Referenz-Designs

- `tool_response`-Form variiert je Claude-Code-Version (String vs. Objekt); vor Produktiv-Einsatz mit dem `event-logger.py`-Muster aus karanb192 [^12^] das reale Payload der eigenen Version inspizieren.
- `updatedToolOutput` ersetzt das Result nur fürs Modell; der Volltext bleibt im Transkript-JSONL (Messtools sehen weiterhin alles — gewollt).
- Sehr häufige kleine Outputs: Dedup-Map wächst pro Session; ältere Einträge ggf. nach N rotieren.
- Loop-Guard zählt nur *unmittelbare* Wiederholungen (overloop-Reset-Semantik [^15^]) — absichtlich, um False-Positives bei legitimen `git status`-Serien klein zu halten; wer will, ergänzt ein Zeitfenster.

---

## Regelwerk-Konzept: Ladder-Stufenmodell

Community-Konsens (Governor-Leiter compress→split→filter→/clear→/compact [^16^], clear-nudge-Prämisse „früh clearen < spät compacten" [^30^], compact-middleware-Trigger 0,85 [^32^], context-cost-guard Cold-Cache-Ökonomie [^31^]) operationalisiert. **Messbasis für Kontext-%:** Statusline (token-tracker liefert Ctx-%-Balken [^5^]) oder Hook-seitige Transkript-Messung wie clear-nudge/context-cost-guard (letzter Usage-Record: `input + cache_read + cache_creation` [^31^]).

| Stufe | Name | Trigger (konkret) | Aktionen / Tools | Kosten der Aktion |
|---|---|---|---|---|
| **0** | Filtern vorm Modell (always-on) | kontinuierlich, kein Schwellwert | bash-dump-guard (Spill >2k Tokens, Dedup, Loop-Guard); Governor-artiger Duplikat-Filter (>40 % Dup-Zeilen); `MAX_MCP_OUTPUT_TOKENS`; `.contextignore` für Lockfiles/Build-Dirs; MCP-Server-Hygiene (`optimize`/token-hygiene) [^2^][^16^][^26^] | ~0 (deterministisch) |
| **1** | Straffen | Kontext 60–70 % (≈120–140k von 200k) **oder** >25 Tool-Calls ohne Taskwechsel | clear-nudge gelb (einmaliger Hinweis) [^30^]; `/rewind` bei Irrläufern (entfernt teure Sackgassen-Turns statt sie mitzuschleppen); Microcompact-Manual: alte Tool-Results nicht erneut quoten; Keep-last-5-Regel [^32^] | ~0–41k (Neustart-Kosten entstehen erst auf Stufe 3) |
| **2** | Compact + Snapshot | Kontext 80–85 % **oder** Taskgrenze erreicht (Tests grün, Commit steht) | PreCompact-Hook: Transkript-Snapshot sichern (mastery `pre_compact.py` [^13^]); `/compact` mit fokussierter Anweisung; danach Top-Dateien + Plan re-injizieren (Restoration-Muster [^32^]) | 1 LLM-Summary-Call; irreversibel → nur mit Snapshot |
| **3** | Clear + HANDOFF.md | Kontext >90 %, **oder** Idle ≥55 min bei Kontext ≥60k (Cold-Cache-Falle: Turn kostet ~20× [^31^]), **oder** harter Themawechsel | context-cost-guard-Block einmal wirken lassen [^31^]; HANDOFF.md schreiben (Ziel, Stand, offene Tasks, Pfade — einzige Erbschaft des nächsten Fensters [^30^]); `/clear`; Neustart ~41k + 2 Sätze Kontext ≈ 5 Tool-Calls [^30^] | niedrig, wenn HANDOFF gut; hoch, wenn ohne |

**Design-Regeln:**
- **Jede Stufe spricht einmal pro Schwelle, nicht jeden Turn** (clear-nudge-Muster [^30^]) — Dauer-Nudges werden selbst zum Kontext-Problem.
- Eskalation ist **monoton in einem Task**, Reset bei Taskwechsel; Stufe 3 schlägt Stufe 2 bei Cold-Cache-Kombination (groß + idle), weil dann jeder weitere Turn im alten Fenster ~20× Input kostet [^31^].
- **Zähler-Trigger als Fallback**, wenn keine Kontext-% verfügbar (z. B. Headless): >25 Tool-Calls → Stufe-1-Hinweis; >40 → Stufe 2 vorschlagen (clear-nudge-Fall: 14.268 Calls à 500k Tokens = 49 % Wochenkontingent [^30^]).
- Ladder funktioniert nur mit Messkette: Stufe-0-Wirkung via CodeBurn `act report` (realisiert vs. geschätzt nach 3 Tagen [^2^]) oder Governor-Ledger (`/governor:status` [^16^]) verifizieren; Quota-Verlauf via claude-monitor/CodexBar [^3^][^4^].

---

## settings.json-/permissions-Vorlage

```jsonc
// ~/.claude/settings.json — Referenz-Vorlage (Kommentare vor Einsatz entfernen)
{
  // --- Historie behalten (toktrack-Befund: Default löscht nach 30 Tagen) [^6^]
  "cleanupPeriodDays": 9999999999,

  "env": {
    // --- Native Drosseln -------------------------------------------------
    "MAX_MCP_OUTPUT_TOKENS": "25000",          // MCP-Tool-Outputs deckeln
    "ENABLE_CLAUDEAI_MCP_SERVERS": "false",    // Cloud-MCP-Injection aus (~600+ Tokens/Session) [^26^]
    "BASH_MAX_OUTPUT_LENGTH": "30000",         // Bash-Output-Deckel (Zeichen)
    // --- Guard-Tunables ---------------------------------------------------
    "BDG_SPILL_TOKENS": "2000",
    "BDG_LOOP_LIMIT": "3",
    "GOVERNOR_FULL": ""                        // auf "1" setzen = Governor-Bypass inline
    // --- OTEL nur bewusst und nur USER-seitig, NIEMALS in committed Projekt-
    //     settings: Otel-Smuggling-Risiko (Exfiltration via Projekt-Config) [^38^]
    // "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    // "OTEL_METRICS_EXPORTER": "otlp",
    // "OTEL_LOGS_EXPORTER": "otlp",
    // "OTEL_EXPORTER_OTLP_ENDPOINT": "http://localhost:4317"
    // Traces zusätzlich: CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1 [^34^]
  },

  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force*)",
      "Bash(git push -f*)",
      "Bash(git reset --hard*)",
      "Bash(gh pr merge*)",
      "Bash(sudo*)",
      "Bash(curl *| sh*)", "Bash(curl *| bash*)",
      "Read(./.env)", "Read(**/.env)",
      "Edit(./.env)", "Write(./.env)"
    ],
    "allow": [
      "Bash(git status)", "Bash(git diff*)", "Bash(git log*)",
      "Bash(ls*)", "Bash(cat*)", "Bash(rg*)", "Bash(npm test*)"
    ]
    // Faustregel: deny-Liste klein & katastrophal; Alltagsfreigaben lieber
    // über compound-sicheren Guard (warden) statt Regex-Ganzzahl-allow [^20^]
  },

  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command",
          "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] }
      // optional: AST-Command-Policy dahinter — warden-hook (allow/ask/deny) [^21^]
    ],
    "PostToolUse": [
      { "matcher": "Bash",
        "hooks": [{ "type": "command",
          "command": "node ~/.claude/hooks/bash-dump-guard.mjs", "timeout": 5 }] },
      // Audit-Trail async (null Latenz) [^12^][^37^]:
      { "hooks": [{ "type": "command",
          "command": "jq -c '{ts: now, s: .session_id, tool: .tool_name, in: .tool_input}' >> ~/.claude/audit.jsonl",
          "async": true }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command",
          "command": "node ~/.claude/hooks/clear-nudge.mjs" }] }
      // alternativ/ergänzend: context-cost-guard (Cold-Cache-Block) [^31^]
    ],
    "PreCompact": [
      { "hooks": [{ "type": "command",
          "command": "cp \"$CLAUDE_TRANSCRIPT_PATH\" ~/.claude/snapshots/$(date +%s).jsonl || true" }] }
    ]
  }
}
```

**Zugehörige Messkette (Installations-Reihenfolge, ~15 min):**
1. `npx ccusage daily` / `npx codeburn` → historische Baseline (wo gehen Tokens hin?) [^1^][^2^]
2. `uv tool install claude-monitor` (Live-5h-Fenster) oder CodexBar (macOS) [^3^][^4^]
3. bash-dump-guard.mjs registrieren (Stufe 0)
4. `codeburn guard install` für Budget-Caps (Soft $5 / Hard $15, fail-open) [^2^]
5. Monatlich: `codeburn optimize` + token-hygiene-Audit; `codeburn act report` für realized-vs-estimated [^2^][^26^]

---

## Konflikte & Fallstricke

1. **`permissionDecision: "allow"` umgeht deny-Regeln (rtk #260).** Rewrite-Hooks (RTK 0.22.2) ließen `git push --force` trotz deny-Rule durch, weil der Hook pauschal `allow` zurückgab [^35^]. Fix-Optionen: deny-Rules zur Laufzeit aus allen 4 settings-Dateien prüfen (vorgeschlagener `_matches_deny`-Patch) oder gar kein `allow` emittieren [^35^]. **Unser Design wählt Letzteres.** Beachte Gegenstimme im selben Issue: ohne `allow` muss der User `Bash(rtk:*)` allowen und alle deny-Rules spiegeln — UX-Trade-off [^35^]. Aktuelle Doku behauptet zwar „a hook decision never bypasses a deny or ask permission rule" [^36^], der dokumentierte Bug rät zu defensivem Verzicht.
2. **Compound-Command-Lücke bei Regex-Guards.** Star-Führer (damage-control, karanb192) matchen Regex auf den ganzen Command-String; quoted Separatoren und `&&`-Ketten erzeugen False-Negatives/Positives [^20^]. Selbst AST-basiertes warden hat offenes Issue #123: `for/while/if` → allow trotz alwaysDeny [^22^]. Konsequenz: Sicherheitskritisches als **deny-Liste** formulieren (deny-gewinnt-Präzedenz [^20^]), Token-Guards output- statt command-basiert bauen.
3. **OTEL „Otel Smuggling" (bloom.security, 07/2026).** Projekt-`.claude/settings.json` in einem geklonten Repo kann Telemetry aktivieren, auf Angreifer-Endpoint zeigen und via `otelHeadersHelper` beliebige Shell-Kommandos ausführen — Exfiltration von E-Mail, Account-UUID, Prompts, Env-Secrets vor der ersten Eingabe; >5.000 Skills referenzieren OTEL [^38^]. Gegenmaßnahmen: OTEL-Env nur in User-Config, Projekt-Settings reviewen (`ncoevoet`-Auditor findet riskante Keys [^27^]), `OTEL_LOG_TOOL_CONTENT`/Prompts default aus [^39^]. Telemetry-Config wird nur beim Session-Start gelesen [^34^].
4. **Rules-Re-Injektion (Issue #32057).** `.claude/rules`-Dateien werden als system-reminder bei *jedem* Tool-Call erneut injiziert: 11 Dateien à ~6.200 Tokens × 30 Calls ≈ **93k Tokens = 46 % des Fensters** [^40^]. Konsequenz: 3–5 Rule-Files à <30 Zeilen, aggressives `paths:`-Scoping, Regeln lieber in deterministische Hooks gießen (dead-rules-audit [^12^]) — das ist Stufe-0-Denken für Instructions.
5. **30-Tage-Löschung der Session-Daten** (`cleanupPeriodDays` Default 30) zerstört die Messbasis rückwirkend; toktrack-Cache oder claude-monitor-Warehouse oder `cleanupPeriodDays` hochsetzen [^6^][^4^].
6. **Hook-Vertrag-Feinheiten:** `additionalContext` Cap 10.000 Zeichen, staled auf Resume; mehrere Rewrite-Hooks auf demselben Feld = last-write-wins in nicht-deterministischer Reihenfolge; Stop-Hooks ohne `stop_hook_active`-Check loopen endlos; Shell-Profile-Echos brechen Hook-JSON-Parsing; PreToolUse kann blocken, PostToolUse kann nichts ungeschehen machen [^37^]. Exit 2 + stderr ans Modell vs. Exit 0 + JSON — Entscheidungs-JSON bevorzugen (block/deny-Grund landet sauber beim Modell) [^41^]. Block-Decisions mit falschem Exit-Code (1 statt 2) sind wirkungslos — der ncoevoet-Auditor prüft genau das [^27^].
7. **Mess-Wahrheit:** CodeBurn-Issues zeigen Doppelzählungs-/Cache-Lösch-Bugs bei Multi-Provider-Sync (#987/#988) [^10^]; claude-monitor labelt Schätzwerte ehrlich (`local_estimate` vs. `official`) [^4^]; CCO musste eigene Konstanten durch Messung ersetzen (.svg 100,5 statt 35 chars/Zeile) [^8^]. **Regel: Optimierungsentscheidungen nur gegen gemessene, nicht angenommene Kosten.**
8. **LLM-in-the-loop-Guards (claude-code-boost) kosten selbst Tokens** [^19^] — für Token-Minimierung widersprüchlich; deterministisch > probabilistisch (vgl. warden-vs-Auto-Mode-Matrix [^21^]).
9. **Compaction ist irreversibel und verlustbehaftet** (konkrete Regel → „folge Coding-Standards" [^42^]) — daher Ladder-Stufe 2 nur mit PreCompact-Snapshot und Restoration-Muster (Top-5-Dateien + Plan [^32^]).

---

## Quellen

[^1^]: github.com/ccusage/ccusage — README (abgerufen 13.08.2026); API: 17.884★, 32 Issues, Push 12.08.2026
[^2^]: github.com/getagentseal/codeburn — README v0.9.20 (optimize/apply/act/guard/compare/yield); API: 9.265★
[^3^]: github.com/steipete/CodexBar — README (69 Provider, Menüleiste); API: 20.004★
[^4^]: github.com/Maciek-roboblog/Claude-Code-Usage-Monitor — README v4.0.0 (Usage Ops, Provenance, Warehouse); API: 8.621★
[^5^]: github.com/stormzhang/token-tracker — README (Statusline-Feldtabelle, Codex-Pseudo-Statusline); API: 485★
[^6^]: github.com/mag123c/toktrack — README (Retention-Tabelle, audit, cleanupPeriodDays-Fix); API: 184★
[^7^]: github.com/RonnieTheTester/headroom-meter — README (Field-Reading-Tabelle); API: 6★
[^8^]: github.com/egorfedorov/claude-context-optimizer — README v4.5–4.9 (Tool-Pricing #38, Chars/Zeile-Messung #35, Windows #46/#33); API: 92★
[^9^]: api.github.com/repos/ccusage/ccusage/issues (13.08.2026): #1594, #1590, #1565 u. a. — kein Security-Befund
[^10^]: api.github.com/repos/getagentseal/codeburn/issues: #988 (Doppelzählung Sync), #987 (History-Löschung), #975 (MCP-Fix-Vorschlag falsch)
[^11^]: api.github.com/repos/Maciek-roboblog/Claude-Code-Usage-Monitor/issues: #239, #236, #238, #234
[^12^]: github.com/karanb192/claude-code-hooks — README (Plugin-Katalog, Safety-Levels, Ask-Mode, async-Recorder); API: 470★
[^13^]: github.com/disler/claude-code-hooks-mastery — README (13 Events, pre_compact.py, Best Practices); API: 3.885★
[^14^]: github.com/disler/claude-code-hooks-multi-agent-observability — README (Architektur Hook→Bun→SQLite→WS→Vue); API: 1.513★
[^15^]: libraries.io/pypi/overloop (04.07.2026, gespiegelt) — Fingerprint/Loop/Dedup/Truncate-Design, ~/.overloop-State; PyPI-API zum Stichtag 404
[^16^]: github.com/0xhimanshu/governor — README v0.2.3 (>40 %-Dup-Filter, V2-Benchmark, GOVERNOR_FULL, Telemetry-Ledger); API: 127★, 0 Issues
[^17^]: github.com/severity1/claude-code-prompt-improver — README v0.4.0 (9 Nudges, 31 % Reduktion); API: 1.849★
[^18^]: api.github.com/repos/severity1/claude-code-prompt-improver/issues: #45, #32, #27
[^19^]: github.com/yifanzz/claude-code-boost — README (Auto-Approval mit LLM-Analyse + Cache); API: 164★
[^20^]: github.com/YoraiLevi/claude-command-policy — README + docs/PRIOR-ART.md (Constraint-Matrix, Popularity-vs-Fitness-Befund, Steal-List)
[^21^]: github.com/banyudu/claude-warden — README (AST-Dekomposition, Layering, Warden-vs-Auto-Mode, Codex/Copilot-Support); API: 29★
[^22^]: api.github.com/repos/banyudu/claude-warden/issues: #123 (for/while/if umgeht alwaysDeny), #122
[^23^]: github.com/f/agentlytics — README; API: 560★
[^24^]: github.com/nikitadoudikov/claude-pulse — README; API: 244★
[^25^]: github.com/onikan27/claude-code-monitor — README; API: 298★
[^26^]: github.com/Growth4U-systems/claude-token-hygiene — README (Overhead-Tabelle 24.320 Tokens, 30k→15k-Case, ENABLE_CLAUDEAI_MCP_SERVERS)
[^27^]: github.com/ncoevoet/claude-markdown-health-check — README (Check-Tabelle, Hook-Safety „Exit 1 statt 2", Evidence-Gate); API: 38★
[^28^]: github.com/valorisa/Claude-Skills — README (rescue-tokens, token-optimization 4 Achsen); API: 4★
[^29^]: github.com/ithiria894/awesome-claude-code-hooks — README (Kategorien, liberzon-Eintrag); API: 20★
[^30^]: github.com/g4itpl/clear-nudge — README (49-%-Case, Einmal-pro-Schwelle-Semantik, ~200 Zeilen)
[^31^]: github.com/JanBancerewicz/context-cost-guard — README (Trigger 60k/55min, Block-Karte, Snooze, fail-open); API: 2★
[^32^]: github.com/emanueleielo/compact-middleware — README (Trigger 0,85, Microcompact keep-5, TruncateArgs 2000, Circuit-Breaker, 9-Sektionen-Prompt)
[^33^]: elastic.co/security-labs — „Claude Code/Cowork monitoring at scale with Otel & Elastic" (25.04.2026, Event-Typen)
[^34^]: sudopower.com/posts/claude-code-otel-capture (04.07.2026 — Start-only-Config, ENHANCED_TELEMETRY_BETA für Traces)
[^35^]: github.com/rtk-ai/rtk/issues/260 — „Security: PreToolUse hook bypasses Claude Code deny rules via permissionDecision: allow" (Repro, betroffene Kommandos, `_matches_deny`-Fix)
[^36^]: morphllm.com/claude-code-hooks (18.06.2026 — Event-I/O-Referenz, „hook decision never bypasses deny/ask rule", updatedToolOutput)
[^37^]: thomas-wiegold.com/blog/claude-code-hooks (10.05.2026 — Hot-Path-Latenz, async-Audit, Gotchas-Liste, Safe-YOLO)
[^38^]: bloom.security/blog/welcome-to-otel-claudeifornia (29.07.2026 — Otel Smuggling, otelHeadersHelper-RCE)
[^39^]: generalanalysis.com/guides/claude-code-control-observability-opentelemetry (22.05.2026 — sichere OTEL-Defaults)
[^40^]: github.com/anthropics/claude-code/issues/32057 — „Rules re-injected as system-reminders on every tool call" (93k Tokens / 46 %)
[^41^]: claudefa.st/blog/tools/hooks/hooks-guide (08.08.2026 — 30 Hook-Events, Block-Fähigkeiten, HTTP-Hooks)
[^42^]: devpress.csdn.net/v1/article/detail/159244577 (19.03.2026 — Compaction-Verlust-Beispiel, Regel-Degradation)
