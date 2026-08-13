# dim01: Shell-/Tool-Output-Filter

**Deep-Dive-Dimension:** Die „erste Verteidigungslinie" gegen Token-Müll aus bash/git/test/build — Hook-basierte Kompressoren, die Tool-Output filtern, bevor er in den Kontext (und die Rechnung) gelangt.
**Stand:** 2026-08-13 · **Methode:** READMEs aller 9 Primär-Repos vollständig gelesen, Metadaten + offene Issues per GitHub-API, Sekundär-Repos per README/API-Kurz-Check.

**Kernbefund vorab:** Die Schicht ist real, aber klein. Bash-Hooks sehen nur den Bash-Tool-Anteil des Kontexts (externe Befunde: ~20 %; 78 % laufen über Read/Grep/Glob nativ vorbei). Der ehrliche End-to-End-Erwartungswert liegt bei **0–3 % der Gesamtrechnung** auf typischen Workloads, bis **~10–15 %** in test-/build-lastigen Sessions mit großen Outputs — unter der Bedingung, dass das Tool eine Net-Win-Logik hat (sonst messbar *negativ*: rtk +7,6 % bei JetBrains, +18 % in rtk#582, +14 % bei kuro-lean vor Fix). Der eigentliche Wert dieser Schicht ist **Katastrophenverhütung** (500-Zeilen-Test-Dumps, `find /`, Lock-Files), nicht ein laufender Rabatt.

---

## Vergleichsmatrix

Legende: **Rewrite** = PreToolUse schreibt den Befehl VOR Ausführung um (`updatedInput`); **Wrap** = Befehl wird zu `<tool> run <cmd>` umgeschrieben; **Post** = PostToolUse ersetzt Output via `updatedToolOutput`; **Plugin** = natives Claude-Code-Plugin.

| Tool | ★ | Hook-Pattern | Abdeckung | Cache-Sicherheit | Reversibilität | Config-Aufwand | Reife / Risiko |
|---|---|---|---|---|---|---|---|
| **rtk-ai/rtk** | 75,9k | PreToolUse-Rewrite (native Binary-Hook seit v0.37.2, `rtk hook claude`)[^1^] | Nur Bash (Read/Grep/Glob explizit ausgenommen)[^1^] | Schwach: keine Determinismus-Garantie; `bytes/4`-Schätzung | Tee-Datei bei Failure (`~/.local/share/rtk/tee/`, Modi failures/always/never)[^1^] | Sehr niedrig (`rtk init -g`, `config.toml`: exclude_commands) | Hoch (Releases, Homebrew, 16 Agents), aber **1.955 offene Issues**, mehrere Security-Befunde[^7^][^8^][^9^][^10^] |
| **mpecan/tokf** | 192 | PreToolUse-Rewrite → `tokf run`; make/just-Shell-Injection[^2^] | Nur Bash | **Best-in-Class:** `tokf verify` erzwingt Byte-Stabilität (Double-Run-Check) als Prompt-Cache-Invariante; kalibrierter `bytes/3.5`-Schätzer (cl100k-vermessen)[^2^] | **SQLite-History + `tokf raw <id>`**; Recovery-Marker `🗜️#87` kostet ~3 Tokens[^2^] | Mittel (TOML-Filter, `tokf eject`, rewrites.toml) | Hochwertigste Doku/Disziplin im Feld; kleines Projekt, 9 offene Issues (Windows-Cache-Bug #455)[^11^] |
| **claudioemmanuel/squeez** | 182 | PreToolUse-Wrap (`squeez wrap`) **+ PostToolUse `updatedToolOutput`** + SessionStart/SubagentStop/PreCompact/PostCompact[^3^] | **Bash + Read/Grep/Glob/Monitor** (CC v2.1.119+), Agent-Prompts, Read/Grep-Limits per updatedInput[^3^] | Gut: cache-aware `--efficiency-proof` (list-price-Modell, negative Savings darstellbar); Net-Win-Gate (default 24 tk) verhindert Netto-Verluste[^3^] | **Content-addressed Blob + `squeez_retrieve` MCP-Tool**; Identifier-Factsheet (SHAs/UUIDs/Tickets überleben jede Summary)[^3^] | Niedrig (`config.ini`, `/squeez`-Slash-Command, `calibrate`) | Breiteste Abdeckung im Feld; jung, 1 offenes Issue (Windows-Hermes-Bruch #208)[^12^] |
| **ojuschugh1/sqz** | 593 | PreToolUse-Rewrite (`sqz init --global`, merged settings.json)[^4^] | Bash; Session-Dedup-Cache für File-Reads; API-Proxy optional | Mittel: SHA-256-Content-Hash-Refs sind deterministisch; `§ref:HASH§`-Format bricht aber manche Modelle (GLM-Loops)[^4^] | `sqz expand <ref>`; MCP-Passthrough-Tool (byte-exakt)[^4^] | Niedrig (presets/default.toml) | **Warnung:** seit 2026-06-21 stale; offene Datenverlust-Bugs (#32 entropy_truncate droppt ~50 %, #30 Locale-Korruption, #34 UTF-8-Panic); Lizenz **ELv2** (kein reines OSS)[^13^] |
| **edouard-claude/snip** | 406 | PreToolUse-Rewrite via `updatedInput` (transparent)[^5^] | Nur Bash; 132 deklarative YAML-Filter, 19 Pipeline-Actions | Mittel: deterministische YAML-Pipelines, aber keine Cache-spezifische Prüfung | Tee (`failures/always/never`, max 20 Files/1 MB)[^5^] | Niedrig (`config.toml`, Filter = YAML-Daten, kein Rebuild) | Solide rtk-Alternative in Go; fail-closed Runner-Prefix-Erkennung schützt Confirmation-Garantie[^5^]; 1 offenes Issue |
| **ppgranger/token-saver** | 136 | **Claude-Code-Plugin** (offizieller Community-Marketplace); PreToolUse-Rewrite → `python3 wrap.py`[^6^] | Nur Bash; 36 Prozessoren (Python stdlib) | Mittel: deterministisch, 1300+ Tests, Compression-Ratchet in CI | Teilweise: Critical-Line-Recovery (fehlende Error-Zeilen werden diff-basiert re-attached), markierte Truncation; kein genereller Full-Log-Retrieve[^6^] | **Niedrigst** (`/plugin install token-saver@claude-community`) | Gut gehärteter Hook (shlex.quote, `sh -n` Syntax-Check, fail-open); Python-Runtime nötig; 1 offenes Issue[^6^] |
| **3rg0n/thlibo** | 9 | PreToolUse + `updatedInput` (sauberstes Pattern); Matcher: **Bash + PowerShell + Read + Write/Edit**[^14^] | Bash, Read (komprimierte File-Reads/PDFs), Write/Edit (Shorthand); **kein** Grep/Glob/MCP | Mittel: native Go-Filter deterministisch; Gemma-4-Prompt-Prozessoren modellabhängig | Schwach: Original-stderr + Exit-Code pass-through, Fehler → Original zurück; kein Retrieve-Tool (Logs in `~/.thlibo/logs/`) | **Hoch:** inferd-Sidecar-Daemon (Gemma 4, GGUF-Download, Autostart via LaunchAgent/systemd/Startup)[^14^] | Technisch anspruchsvollstes Sicherheitsmodell (THREAT_MODEL.md, cosign-signierte Releases), aber schwerster Footprint; Hook auto-allowt eigene Rewrites (dokumentiert, Finding #15)[^14^][^15^] |
| **hansipie/ecotokens** | 18 | PreToolUse (Bash) **+ PostToolUse** (Read/Grep/Glob: Outline-Kompression, Grep-Trimming, Glob-Denoising)[^16^] | **Bash + native Read/Grep/Glob**; MCP-Server für Code-Intelligence (BM25+Vektor) | Mittel: char-Heuristik `chars×0.25`, optional exakter tiktoken-cl100k (`--features exact-tokens`)[^16^] | **Fehlt** — Recovery-UX ist offenes Enhancement (#85)[^17^] | Niedrig (`config.json`, Exclusions, optionale Ollama-AI-Summaries) | Einziges Primär-Tool mit PostToolUse-Read-Kompression neben squeez; Secrets-Redaktion vor Filterung; kleine Community[^16^] |
| **kurovu146/kuro-lean** | 15 | PreToolUse: `hook-compress` (Rewrite → `kt run`) **+ `hook-guard` (Deny token-hungriger Calls)** auf Bash **und Read**; UserPromptSubmit-Cache-Guard[^18^] | Bash-Kompression; Read/Bash-**Blockierung** (Lock-Files, `find /`, >500 KB Reads); keine Read-Kompression | **Bestes Kosten-Modell im Feld:** `kt cost` aus echten Transkripten (cache read 45 % / cache write 44 % / output 10 %); 1-h-Cache-TTL-Cliff gemessen; `kt bench` A/B gegen echte Headless-Sessions[^18^] | Gut: volle Logs unter `.kt/runs/`, `kt show <id>`; voller Fehlerblock bei Test-Fails nie komprimiert | Niedrig (`kt init`, `kt.json` 3-Layer-Merge), aber **Bun ≥ 1.3** nötig | Ehrlichstes Benchmarking aller Repos (misst und publiziert eigene Negativ-Ergebnisse); TS/Bun statt Binary; 0 offene Issues[^18^] |

---

## Detailprofile

### 1. rtk-ai/rtk — „Rust Token Killer" (75.918 ★, Rust, Apache-2.0)

**Install/Setup (Claude Code):** `brew install rtk` oder `curl …/install.sh | sh`, dann `rtk init -g` — installiert PreToolUse-Hook (seit v0.37.2 als native Binary `rtk hook claude`, kein Shell-Skript/jq mehr nötig, Windows-nativ) + RTK.md. Restart nötig. `rtk init --show` verifiziert; `rtk init -g --uninstall` entfernt sauber.[^1^]

**Mechanik:** Hook matched Bash-Calls und rewrite't transparent (`git status` → `rtk git status`); 100+ kompilierte Filter (git, cargo, npm, pytest, docker, kubectl, aws, gh, pulumi…). Vier Strategien: Smart Filtering, Grouping, Truncation, Dedup. **Explizites Scope-Statement im README: Read/Grep/Glob laufen am Hook vorbei** — dafür gibt es `rtk read`/`rtk grep`/`rtk find` als manuelle Befehle.[^1^]

**Config:** `~/.config/rtk/config.toml`: `[hooks] exclude_commands`, `[tee] enabled/mode` (failures/always/never — bei Failure wird Roh-Output in `~/.local/share/rtk/tee/` gesichert und der Pfad dem LLM mitgegeben).[^1^]

**Spar-Messung:** `rtk gain` (Dashboard, Graph, JSON-Export), `rtk discover` (verpasste Savings), Token-Schätzung `bytes/4` — README betont selbst: Prozente reliable, Absolutwerte approximativ, und „up to 90 % **der Bash-Ausgabe**" ≠ 90 % der Rechnung.[^1^] Telemetrie opt-in (GDPR-Consent), via `RTK_TELEMETRY_DISABLED=1` blockierbar.

**Sicherheit/Issues (kritischste Sektion bei rtk):**
- **#260 (closed):** Der alte Shell-Hook emittierte `permissionDecision: "allow"` zusammen mit `updatedInput` → **kompletter Bypass von deny- UND ask-Rules**. Fix-Ansatz: Binary-Hook-Engine, die deny-Patterns aus den settings-Dateien liest, bevor sie rewrite't.[^7^]
- **#1155 (OPEN):** „hook auto-allow bypasses agent permission model for rewritten commands" — das Grundproblem ist offenbar **nicht vollständig gelöst**.[^8^]
- **#3152 (OPEN):** Umgekehrte Richtung: User-`allow`-Patterns (`Bash(ls *)`) greifen nicht auf `rtk ls`-Rewrites → Claude re-prompted.[^9^]
- **#2345 (OPEN, kritisch):** `rtk proxy` umgeht `.env`-Read-Deny-Rules → Credential-Exfiltration; referenziert **CVE-2026-33068**.[^10^]
- **#582 (closed):** Reproduktionspaket zeigte **+18 % Kosten** durch den Hook (Claude kompensiert gestrippten Kontext mit mehr Output-Tokens/Tool-Calls); Gegenmaßnahme: „never-worse guard" (#2551, closed).[^19^]
- **#3175 (OPEN):** User berichtet schnelleres Erreichen der Usage-Limits nach Hook-Aktivierung — deckt sich mit dem JetBrains-Befund (+7,6 % bei low effort).[^20^]
- Weitere offene Qualitätsbugs: #2727 (`rtk pytest`/`rtk err` zu aggressiv, Failure-Kontext droppt → teurer Raw-Re-Run), #3492 (Exit-Codes von One-Liners verschluckt → Phantom-Failures), #3543 (`npm run lint` → `rtk lint` lintet falsche Pfade), #3549 (aws eks: falsches „success" bei nichtexistierendem Cluster).[^21^]

**Bewertung:** Größte Filter-Bibliothek und beste Distribution, aber das Permission-Modell ist der wunde Punkt (3 offene Security-Issues) und die unabhängigen Messungen widersprechen der Marketing-Zahl.

### 2. mpecan/tokf (192 ★, Rust, MIT)

**Install/Setup:** `brew install mpecan/tokf/tokf` / `cargo install tokf`, dann `tokf hook install --global` (Claude Code PreToolUse) bzw. `tokf setup` für Auto-Detection. `--path` bindet den Binary-Pfad ein (Linuxbrew/cargo-PATH-Falle). Optional: `tokf skill install --global` (Filter-Authoring-Skill `.claude/skills/tokf-filter/`).[^2^]

**Mechanik:** Befehle werden zu `tokf run <cmd>` rewrite't; Filter sind **TOML-Daten, kein Code** (skip/keep/dedup/replace/sections/aggregates/chunks/JSON-Extraction/Tree-Restructuring, Lua-Escape-Hatch). Exit-Code-Masking standardmäßig (exit 0 + `Error: Exit code N`-Prefix, abschaltbar). Compound-Befehle werden segmentweise behandelt; Heredocs, Redirects, komplexe Pipes werden prinzipiell **nicht** rewrite't (implizite Skip-Rules). make/just: tokf injiziert sich als `$SHELL` des Task-Runners → jede Recipe-Zeile einzeln gefiltert.[^2^]

**Cache-Sicherheit (Alleinstellung):** `tokf verify` führt jede Filter-Pipeline **zweimal** auf identischem Input aus und verlangt Byte-Identität — Begründung explizit: nondeterministischer Filter-Output bricht den Provider-Prompt-Cache (Präfix-Matching) und eine 200-Token-Ersparnis kann 40k Tokens Suffix aus dem Cache werfen („a large net loss, invisible in any single local test run"). Gleicher Check läuft serverseitig beim `tokf publish`.[^2^]

**Retrieve/Reversibilität:** SQLite-Output-History pro Projekt; jeder komprimierte Output trägt `🗜️#<id>`; `tokf raw <id>` holt das Original — bewusst als Shell-Befehl (pipbar, vor dem Modell filterbar) statt als Tool-Call, weil ein Tool-Result den Riesen-Output ungefiltert in den Kontext zöge. Hint-Line bei Wiederholungs-Erkennung.[^2^]

**Spar-Messung:** `tokf gain` (lokal + optional remote mit Auth/Sync). Token-Schätzer `bytes/3.5`, gegen cl100k-Korpus kalibriert (raw 3.67, gefiltert 2.98 → kombiniert 3.53); **ehrliche Caveat-Tabelle**: Rewrite-Filter (statt Delete-Filter) schmeicheln sich selbst — `docker/ps`-Worst-Case est. 0 % vs. real −300 %. „Treat reduction percentages on rewriting filters as indicative, not as a claim."[^2^]

**Sicherheit:** `tokf verify --safety` scannt Filter auf Prompt-Injection, Shell-Injection, versteckte Unicode. Pluggable Permission-Engines (Dippy-Integration) für allow/deny/prompt-Semantik. Offene Issues: #455 (Windows: concurrent Cache-Writes brechen tmp→final-Rename), #437 (git/status-Filter-Verwirrung).[^2^][^11^]

**Bewertung:** Das ingenieursmäßig sauberste Tool der Schicht — einziges mit systematischer Prompt-Cache-Determinismus-Garantie und kalibriertem Schätzer. Limitation: nur Bash.

### 3. claudioemmanuel/squeez (182 ★, Rust, Apache-2.0)

**Install/Setup:** `curl …/install.sh | sh` / `npm i -g squeez` / `cargo install squeez`, dann `squeez setup` (auto-detectet 7 Hosts, Claude Code: 6 Hooks). Binary unter `~/.claude/squeez/bin/`. MCP: `claude mcp add squeez -- squeez mcp` (17 Tools).[^3^]

**Mechanik:** PreToolUse wrapt Bash (`squeez wrap <cmd>`) mit Pipeline smart_filter → dedup → log-template → relevance-truncation; >500 Zeilen → ≤40-Zeilen-Dense-Summary mit **Identifier-Factsheet** (`ids_preserved:` SHAs/UUIDs/Tickets, budget-gecappt). Cross-Call-Dedup: exakt (FNV-1a) + fuzzy (MinHash-Trigram, Jaccard ≥ 0.85) über 16 Calls → `[squeez: ~92% similar to …]`. **PostToolUse rewrite't Read/Grep/Glob/Monitor-Output via `updatedToolOutput`** (CC v2.1.119+) — damit eines von zwei Primär-Tools, die über Bash hinaus komprimieren. Adaptive Intensity (Full <80 % Budget / Ultra ≥80 %). **Net-Win-Gate:** spart die Kompression < 24 Tokens, wird verbatim durchgereicht und nichts verbucht — direkte Antwort auf das rtk#582-Regime.[^3^]

**Sicherheit (permissions.deny!):** **Bash-Wrap-Safety**: riskante Befehle (`rm -rf`, `git push --force`, `npm publish`, …, konfigurierbar via `bash_risk_patterns`) und bypass-Liste laufen **unwrapped**, sodass die nativen Permission-Rules das Original sehen; `wrap_bash = false` deaktiviert Wrapping komplett. Escape-Hatch pro Befehl: `--no-squeez <cmd>`.[^3^]

**Retrieve:** Komprimierte Groß-Outputs werden als content-addressed Blob gestasht; Marker `[squeez: … call squeez_retrieve with key="<id>"]`; MCP-Tool expandiert. TTL-geprunt.[^3^]

**Spar-Messung:** `squeez benchmark` (40 Szenarien × 5 Iterationen): Aggregat 91,4 % auf dem Benchmark-Korpus, Bash −88,9 % — **aber**: README selbst weist auf Coverage-Limits hin („Savings are reported per compressed slice; end-to-end depends on workload"). Unabhängige Verifikation mit echtem cl100k-Tokenizer: 83,5 % vs. 83,0 % chars/4 → Divergenz 0,5 pt. `--efficiency-proof` rechnet cache-aware (write ×1.25, read ×0.1, output ×5) und erlaubt negative Savings. Ehrliche „What squeez CANNOT compress"-Liste (Agent-Return-Values, Skills, User-Prompt).[^3^]

**Issues:** nur #208 offen (Hermes-Adapter auf Windows: cmd.exe vs. git-bash → wrapped commands brechen still).[^12^]

**Bewertung:** Breiteste Abdeckung + beste Permission-Hygiene (risky-unwrapped) + Net-Win-Gate + reversibel. Gegenprobe nötig: sehr jung, Benchmark ist Hersteller-messen auf eigenem Korpus.

### 4. ojuschugh1/sqz (593 ★, Rust, **Elastic License 2.0**)

**Install/Setup:** Prebuilt (`install.sh` / npm `sqz-cli` / Homebrew-Tap), dann `sqz init --global` (schreibt in `~/.claude/settings.json`, **merged** statt überschreibt — permissions/env/statusLine bleiben) oder projekt-lokal in `.claude/settings.local.json`; `--only`/`--skip` für 8 Agents.[^4^]

**Mechanik:** PreToolUse-Hook komprimiert Bash-Output transparent; 40+ Formatters in 9 Ökosystemen; Fallback „generic". **Kern-Feature ist Session-Dedup:** SHA-256-Content-Cache, persistent über Sessions — zweiter Read desselben Inhalts → 13-Token-Referenz `§ref:HASH§`. Safe-Mode (Entropy-Analyse) routet Stack-Traces/Secrets/Migrations mit 0 % Kompression durch. Optional: `sqz proxy --port 8080` (API-Proxy für volle Request-Payloads), `sqz-mcp` Server.[^4^]

**Retrieve:** `sqz expand <ref>` (Prefix-Match), `sqz compress --no-cache`, `SQZ_NO_DEDUP=1`, MCP-Passthrough (byte-exakt).[^4^]

**Spar-Messung (ehrlichster Mittelwert im Feld):** 3.003 echte Kompressionen → **24,7 % Ø**, 178.442 Tokens gespart; Dedup-Szenarien bis 92 %. Per-Command-Benchmarks offen: Git-Diff nur 12 %, Prose 2 %, Stack-Trace 0 %. Stats lokal in SQLite `~/.sqz/sessions.db`, zero telemetry.[^4^]

**Issues (gravierend):** **#32 — `entropy_truncate` droppt silently ~die Hälfte nicht-JSON-Content inkl. Source-Code; MCP-File-Tools nutzen es ohne Warnung** (Datenverlust!); #30 — git-status-Parser produziert korrupten Output bei nicht-englischer Locale; #34 — Panic bei Multi-Byte-UTF-8; #26 — erkennt Claude-Code-PowerShell-Tool nicht (kein Windows-CC-Support ≥ einer Version); #35 — „Is this project Dead?" (letzter Push 2026-06-21).[^13^]

**Bewertung:** Ehrliche Zahlen und gute Dedup-Idee, aber offene Datenverlust-Bugs + 2 Monate stale + ELv2-Lizenz (kein Hosted-Service erlaubt) → **aktuell nicht für Produktiv-Stack empfohlen.**

### 5. edouard-claude/snip (406 ★, Go, MIT)

**Install/Setup:** `brew install edouard-claude/tap/snip` / `go install`, dann `snip init` (PreToolUse-Hook für Claude Code; `--agent` für 13 weitere; `--uninstall`).[^5^]

**Mechanik:** Transparente Rewrites via `updatedInput`; **Filter sind deklaratives YAML** (match/inject/pipeline/on_error), 132 Built-ins + 19 Pipeline-Actions (keep/remove/truncate/group_by/dedup/json_extract/state_machine/aggregate/format_template…). User-Filter in `~/.config/snip/filters/` überlagern Built-ins; Multi-Dir-Support mit `${env.PWD}/.snip` für Projekt-Regeln. Kein Match → Passthrough, „zero overhead". Exit-Codes propagiert; Filter-Fehler → Raw-Fallback.[^5^]

**Permission-Verhalten (positiv):** Runner-Prefix-Erkennung (`uv run`, `poetry run`, …) ist **fail-closed**: unbekanntes Programm hinter dem Prefix wird nie rewrite't und nie auto-allowed — „preserving snip's confirmation-prompt guarantee".[^5^]

**Retrieve:** Tee-System wie rtk (`[tee] mode = "failures"|"always"|"never"`, max 20 Files à 1 MB; optional projekt-lokal unter `.snip/tee/` mit auto-.gitignore).[^5^]

**Spar-Messung:** `snip gain` (daily/weekly/monthly, JSON/CSV), `snip discover` (scannt Claude-Code-History nach verpassten Savings). Beispiele im README: go test 689→16 tk (97,7 %), git log 85,7 %.

**Issues:** nur #157 (Enhancement: snip als Claude-Plugin konfigurierbar). Kein offener Bug.[^5^]

**Bewertung:** Die pragmatische rtk-Alternative: gleiches Pattern, aber Filter als YAML-Daten statt kompiliertem Rust, sauberes fail-closed-Permission-Verhalten, null offene Bugs. Nur Bash.

### 6. ppgranger/token-saver (136 ★, Python stdlib, Apache-2.0)

**Install/Setup:** **Einziges Primär-Tool als natives Claude-Code-Plugin**: `/plugin marketplace add anthropics/claude-plugins-community` + `/plugin install token-saver@claude-community` (oder Self-hosted Marketplace / `python3 install.py --target claude`). Kopiert alles nach `~/.token-saver/`.[^6^]

**Mechanik:** PreToolUse rewrite't zu `python3 wrap.py '<cmd>'`; 36 spezialisierte Prozessoren (priority-chain, `can_handle()`); Generic-Fallback; bei Exit ≠ 0 Routing zum Generic-Prozessor, wenn der Spezialist nicht `handles_failure` opt-in hat; **Critical-Line-Recovery** (Schritt 7): Engine difft komprimiert vs. original und hängt bis zu N verschwundene Error-förmige Zeilen mit Marker wieder an — Backstop für alle gegenwärtigen und zukünftigen Prozessoren. Ratio-Gate: nicht-kleineres Ergebnis wird verworfen (Ausnahme: Secret-Redaktion gewinnt immer). Chained Commands (`&&`/`;`) werden segmentweise validiert und einzeln komprimiert.[^6^]

**Sicherheit (stärkste Härtungs-Doku):** Quote-aware Tokenizer für Exclusions (Redirects, sudo, Editoren, ssh, Hintergrund-`&`, Shell-Konstrukte werden nie abgefangen); `shlex.quote` gegen Injection; Rewrite wird vor Ausführung per `sh -n -c` syntax-geprüft (ungültig → Original läuft); **fail-open** bei jedem Hook-Fehler; Secret-Redaktion im env-Prozessor (`*KEY*`*SECRET*`…); `.env.production`/`.env.local` redacted, `.env` selbst bewusst unberührt (dokumentierte Entscheidung); untrusted Projekt-Config kann `user_processors_dir`/`disabled_processors`/`redaction_allowlist` nicht setzen (Repo-Klon ≠ Code-Ausführung); Self-Protection gegen Rekursion.[^6^]

**Spar-Messung:** SQLite `~/.token-saver/savings.db` (nur Größen, nie Inhalte); SessionStart-Hook zeigt Lifetime-/Session-Summary (Beispiel: 67,3 % lifetime). Token-Schätzung chars/4, selbst als „for comparison and trend-watching, not for reconciling an invoice" deklariert. 1300+ Tests inkl. Precision-Tests und Compression-Ratchet (CI schlägt fehl bei Ratio-Regression).[^6^]

**Issues:** nur #68 (Enhancement: Codex-Support).

**Bewertung:** Beste Installations-UX (Plugin) + sehr durchdachte Failure-Sicherheit. Nachteile: Python-Runtime (60 ms Latenz vs. <10 ms bei Rust/Go), kein genereller Full-Output-Retrieve, nur Bash.

### 7. 3rg0n/thlibo (9 ★, Go, MIT)

**Install/Setup:** One-liner (Unix/PowerShell), dann `thlibo install` — merged **nur** den `hooks`-Block in `~/.claude/settings.json` (Matcher: Bash, PowerShell, Read, Write, Edit; alle anderen Keys/Hooks bleiben verbatim), spiegelt Prozessoren nach `~/.thlibo/processors/`, installiert bei Bedarf den **inferd-Sidecar** (lokale Gemma 4, GGUF-Download mit SHA-256-Verifikation, Autostart per LaunchAgent/systemd-user/Startup-Folder — alles User-Scope, nie root).[^14^]

**Mechanik:** Das als sauberste geltende Pattern: Hook fragt `thlibo rewrite "<cmd>"`, Registry-Lookup auf argv[0], Hook emittiert `updatedInput = "thlibo exec -- <cmd>"` → komprimierter stdout, original stderr + Exit-Code. Deterministische native Go-Filter (git, npm, cargo, pytest, go-test, ndjson, stacktrace, lint, trivy, har, mhtml, pdf); unbekannter Output → inferd/Gemma-4-Prompt-Prozessor (200–800 ms); `cordon-filter` (k-NN-Density-Anomalie-Surfacing) fängt Over-Collapse von NDJSON-Logs ab. Compound-Befehle (`|`, `&&`) werden bewusst **nicht** rewrite't (kein Shell-AST).[^14^]

**Permission-Verhalten:** Die Hooks **auto-allowen ihre eigenen Rewrites** (`permissionDecision: "allow"` für genau die rewrite'te Form) — im Gegensatz zu rtk ist das hier **dokumentiert** (README + THREAT_MODEL.md Findings MA-2/MA-6/#15) und auf die eigene Rewrite-Form beschränkt, bleibt aber faktisch ein Prompt-Bypass für alle matched Bash-Calls. Installer rührt `skipDangerousModePermissionPrompt` etc. explizit nicht an.[^14^][^15^]

**Retrieve:** Kein echtes Retrieve-Tool; Fehler-Pfad gibt immer das Original zurück (inferd down, Timeout, malformed → passthrough). Aktivitätslogs (byte-only, secret-redacted) in `~/.thlibo/logs/`.[^14^]

**Spar-Messung:** Token-basiert dokumentiert (÷4, PDFs 2.250 tk/Seite), reproduzierbar via `go test -run TokenSavings`; optional OpenTelemetry (opt-in, content-frei, eigener Collector). Kein Gain-Dashboard im engeren Sinn.

**Issues:** #100/#96 (macOS e2e-Validierung der RCs) — kein offener Funktions-Bug.

**Bewertung:** Technisch am durchdachtesten (einzige Abdeckung von Read+Write/Edit neben Bash/PowerShell, signierte Releases mit cosign/SBOM, echtes Threat-Model), aber schwerster Installations-Footprint (Daemon!) und LLM-in-the-loop ist nicht-deterministisch. Für Minimal-Stacks zu fett; für Log-/PDF-schwere Workflows einzigartig.

### 8. hansipie/ecotokens (18 ★, Rust, MIT)

**Install/Setup:** `cargo install --git …` (optional `--features exact-tokens` für tiktoken-cl100k statt `chars×0.25`-Heuristik), dann `ecotokens install` — schreibt Pre+Post-Hooks **und** MCP-Server-Eintrag in `~/.claude/settings.json`. Targets: gemini, qwen, pi, hermes, codex.[^16^]

**Mechanik:** Zwei Interception-Punkte: **PreToolUse** für Bash (Family-Filter: git/cargo/python/javascript/cpp/fs/markdown/config/generic, Erkennung per Basename → venv/version-manager-sicher) und **PostToolUse** für native Read/Grep/Glob (Outline-Kompression für Source-Files, Grep-Trimming, Glob-Denoising) — neben squeez das einzige Primär-Tool, das den 78 %-Read/Grep-Strom anfasst. Optional: Ollama-AI-Summary großer Outputs, Word-Abbreviations (function→fn) inkl. SessionStart-Instruktion ans Modell. Code-Intelligence (BM25 + Candle/Ollama-Embeddings, Symbol-Lookup, Call-Graph, Duplikat-Erkennung) über MCP.[^16^]

**Precision/Sicherheit:** Errors/Stack-Traces werden nie entfernt; **Secrets werden vor dem Filtern redacted**; Debug-Log `0600` mit gleichem Secret-Masking.[^16^]

**Retrieve:** **Nicht implementiert** — „recovery UX for unfiltered raw output" ist offenes Enhancement #85. Weitere offene Punkte: Streaming für Long-Runner (#89), Chained-Command-Segmentierung (#90), OpenCode-Support (#86).[^17^]

**Spar-Messung:** TUI-Dashboard `ecotokens gain` (Familien/Projekte, Sparkline, USD mit konfigurierbarer Pricing-Table `pricing.json`); `ecotokens watch` (Auto-Watch-Modus).

**Bewertung:** Konzeptionell die richtige Architektur (Bash + native Tools + MCP), aber jung (18 ★), fehlende Reversibilität ist ein harter Nachteil gegen squeez/tokf — aggressives Filtern ohne Retrieve-Pfad erzeugt genau die Re-Run-Schleifen, die rtk#582 teuer gemacht haben.

### 9. kurovu146/kuro-lean (15 ★, TypeScript/Bun, MIT)

**Install/Setup:** `bun add -g kuro-lean` → `kt init` (idempotent, `.bak` vor jeder Änderung; hängt PreToolUse `hook-guard`+`hook-compress` auf Bash, `hook-guard` auf Read, UserPromptSubmit `hook-prompt`, Statusline, **`permissions.allow: Bash(kt run:*)`** + zwei Skills). `kt doctor` verifiziert alles.[^18^]

**Mechanik (dreischichtig):**
1. **Compress:** `kt run -- <cmd>` — Profile (test/build/lint/install/git/generic); **Test-Failures werden nie komprimiert** (voller Fehlerblock + Exit-Code); Small-Output-Passthrough unter 4.000 Zeichen (gemessen: Komprimieren kleiner Outputs erzeugt Verifikations-Turns, die mehr kosten als die Ersparnis); Char-Cap 16k mit 65/35-Head/Tail-Marker; volle Logs unter `.kt/runs/`, `kt show <id>`.[^18^]
2. **Guard:** PreToolUse **deny** für token-hungrige Calls *bevor sie laufen*: `find /`, `npm ls` ohne `--depth`, `tree` ohne `-L`, `git log -p`, `cat` >100 KB; auf Read: Lock-Files, minified/generated, node_modules/dist/build, >500 KB. Escape: offset/limit-Reads immer erlaubt.[^18^]
3. **Price/Rescue:** `kt cost` liest echte Transkripte (cache read 45 % / cache write 44 % / output 10 % der Rechnung); `kt handoff --recover` rettet Sessions nach 1-h-Cache-TTL-Ablauf aus dem On-Disk-Transkript (~2,5k Tokens statt 1,83M).[^18^]

**Spar-Messung (Referenz-Ehrlichkeit):** `kt bench` führt A/B gegen reale headless Claude-Sessions mit Korrektheits-Gate. 2026-07-05: **kt-Arm +14 % Kosten, +38 % Turns** (publiziert!); nach Small-Output-Passthrough-Fix (2026-07-09): +6 % Kosten ≈ Rauschen. Über 12.220 echte Bash-Calls: 72 % der Zeichen kommen aus <4k-Outputs → Default-Config spart auf diesem Workload **~0–1 %**; aggressiver Head/Tail-Cut simuliert ~7 %, kostet aber Extra-Turns. Fazit des Autors: Wert = „disasters averted", kein laufender Rabatt.[^18^]

**Permission-Hinweis:** `Bash(kt run:*)` ist Wildcard — alles durch `kt run` ist auto-approved (dokumentierter Trade-off, entfernbar). Guard-Denies respektieren das native System (deny mit actionable Reason).[^18^]

**Bewertung:** Methodisch das beste Repo des gesamten Feldes (misst die Schicht-These selbst und falsifiziert sie teilweise). Als Tool: Bun-Dependency, Claude-Code-only, Kompressions-Engine schwächer als rtk/tokf — aber Guard + Cost + Handoff sind **komplementär, nicht konkurrierend** zu einem Kompressor.

---

## Sekundär-Repos Kurzliste

| Repo | ★ | Pattern | Kurzbefund |
|---|---|---|---|
| **AbhayShalghar/ctk** | 1 | **PostToolUse `updatedToolOutput`** für Bash, Grep, Read **und alle `mcp__*`-Calls** | Einziges Tool im Sample mit MCP-Output-Kompression (OpenSearch/Jira-Dumps); Tee nach `.ctk/cache/` mit Pfad-Marker; fail-open; Go-Binary. Früh, aber strategisch interessanteste Abdeckung.[^22^] |
| **cardimvitor/tk** | — | — | **NICHT AUFFINDBAR — verifiziert:** Account `cardimvitor` hat 0 öffentliche Repos (GitHub-Search API, total_count=0). Repo gelöscht oder privat; Quellangabe „Compression" nicht verifizierbar.[^23^] |
| **sphragis-oss/isthmos** | 0 | PostToolUse `updatedToolOutput` + generischer Filter-Modus | JSON-Field-Pruning per Tool-Regeln; **Measurement-first**: Shadow-Mode + Byte-Log zeigen Ersparnis bevor irgendwas rewrite't wird; explizit „claims neither" bzgl. End-to-End. OpenSSF-Scorecard. Sehr früh, sauberes Konzept.[^24^] |
| **ryanportfolio/STK** | 1 | PreToolUse **auf dem Read-Tool** (deny-with-outline) | Füllt genau die 78 %-Lücke: Mining von 250 echten Sessions → **85 % aller oversized (>8 KB) Kontext-Blöcke kamen vom nativen Read-Tool**. Clamp't große Reads auf ~2 KB line-nummerierte Outlines + offset/limit-Anleitung; Dedup-„unchanged"-Note bei Re-Reads; fail-open. Komplementär zu jedem Bash-Filter.[^25^] |
| **illuwa/ctx-diet** | 3 | PostToolUse-Hook | Eigenmessung über **91.287 Commands: 65,6 % Input-Tokens gespart** (auf dem gefilterten Strom); gute Didaktik des Re-Send-Multiplikators (Output × verbleibende Turns). Shell-Skript.[^26^] |
| **phuetz/lm-resizer** | 2 | Filter/Compress/Offload für Claude Code, Codex, MCP | Rust; breiter Ansatz inkl. Provider-Traffic; frühe Phase.[^27^] |
| **Guazzihub/Sieve** | 0 | Claude-Plugin, PostToolUse | Verifiable-Loss-Policy: Sanitizer (ANSI/Progress/Blank) irreversibel nur >1.500 Zeichen wenn Raw-File auf Disk; Repeat-Collapse exakt gezählt; Distiller nur auf erkannten Formaten. Durchdachte Loss-Hierarchie, Python stdlib.[^28^] |
| **wasdevv/lean-output** | 0 | Claude-Plugin, PostToolUse | Ruby-Nische (RSpec/RuboCop/Brakeman + git diff/cargo/grep); behält jede Failure + file:line; Live-Capture 3,2kB→346B.[^29^] |
| **AndVl1/gw** | 4 | PreToolUse-Hook, Gradle-Wrapper | Nischen-Tool für JVM/Gradle: Errors/Failures/Stacktraces durch, Daemon-/Task-Noise weg; Heartbeat auf stderr; Full-Log unter `./build-logs/`.[^30^] |
| **helmif/wafi** | 0 | Wrapper zwischen CC und Shell | Go, deterministisch/lokal; minimal dokumentiert; seit 2026-04 stale.[^31^] |
| **JoonasAaltonen/claude-optimizer** | 0 | PowerShell-Hooks + CLAUDE.md-Snippet | **Windows-only**, manuelles Copy-Setup; Autor verweist selbst auf rtk für ernsthaften Einsatz.[^32^] |
| **fantastic-interpolation620/ctx-wire** | 0 | unklar | ⚠️ **Supply-Chain-Warnung:** SEO-artiges README, Distribution als ZIP *im Repo* (`internal/hook/wire-ctx-2.6-alpha.1.zip`), „Run anyway"-Anleitung für Windows-SmartScreen, 0 ★, Throwaway-Account-Name. **Nicht installieren; als unseriös einstufen.**[^33^] |

---

## Konflikte & Fallstricke

1. **`permissionDecision: "allow"` vs. `permissions.deny`/`ask`.** Rewrite-Hooks, die ihre eigene Rewrite-Form auto-allowen, umgehen das native Permission-Modell. Bei rtk als #260 gefixt adressiert (Binary-Hook liest deny-Patterns), aber #1155 (auto-allow bypass) und #3152 (user-allow-Patterns greifen nicht auf Rewrites → Re-Prompts) sind **offen**.[^7^][^8^][^9^] thlibo macht dasselbe **by design** (dokumentiert, nur eigene Rewrite-Form).[^15^] kuro-lean installiert `Bash(kt run:*)` als allow-Wildcard.[^18^] **Gegenmittel:** Tools wählen, die riskante Befehle unwrapped lassen (squeez `bash_risk_patterns`[^3^]) oder fail-closed matchen (snip[^5^], token-saver[^6^]).
2. **`rtk proxy` Credential-Exfiltration (CVE-2026-33068, #2345 offen):** `rtk proxy grep … .env` umgeht Read/Bash-deny-Rules für `.env` komplett. Wer rtk nutzt: `proxy`-Befehl in deny-Liste aufnehmen bzw. Hook-excluden.[^10^]
3. **End-to-End kann negativ sein.** Drei unabhängige Datenpunkte: rtk#582 (+18 % Kosten, Repro-Paket)[^19^], JetBrains-Benchmark (+7,6 % bei low effort), kuro-lean `kt bench` (+14 % vor Fix)[^18^]. Mechanismus: (a) komprimierter Output triggert Verifikations-/Re-Read-Turns, jeder Extra-Turn re-billt den ganzen Kontext; (b) Modell kompensiert entzogenen Kontext mit mehr Output-Tokens (+50 % bei rtk#582). **Gegenmittel:** Net-Win-Gates (squeez, ≥24 tk), Small-Output-Passthrough (kt 4.000 ch), Retrieve-Pfad statt Re-Run (tokf `raw <id>`, squeez `squeez_retrieve`).
4. **Savings-Cap der Schicht.** Nur ~20 % des Kontexts fließt durch Bash-Hooks (78 % Read/Grep/Glob nativ) → Deckel ≈3 % des Inputs für reine Bash-Filter; codepointer-Replay: rtk = 0,5 % der Gesamtrechnung. **Implikation:** Wer mehr will, braucht PostToolUse/`updatedToolOutput`-Abdeckung (squeez, ecotokens, ctk, Sieve, isthmos) oder Read-Clamps (STK, thlibo) — aber siehe Punkt 6.
5. **Prompt-Cache-Determinismus.** Filter-Output wird jeden folgenden Turn erneut gesendet; variiert er bei gleichem Input (HashMap-Ordering, Zeitstempel), bricht das Cache-Präfix und der gesamte Suffix re-billt zum vollen Input-Preis — eine 200-Token-Ersparnis kann 40k Tokens entcachen (tokf-Doku, einziges Tool mit erzwungenem Byte-Stability-Check).[^2^]
6. **Over-Aggression erzeugt teurere Re-Runs.** rtk#2727: `rtk pytest` droppt Failure-Kontext → Modell re-runnt raw.[^21^] Gegenmittel: Failure-Routing (token-saver: Exit≠0 → Generic-Prozessor + Critical-Line-Recovery[^6^]; kt: Fail-Blöcke nie komprimiert[^18^]; squeez: benign-aware Threshold + Identifier-Factsheet[^3^]).
7. **Datenverlust-Bugs in realem Betrieb.** sqz #32 (entropy_truncate droppt ~50 % nicht-JSON-Content inkl. Source — still), #30 (Locale-Korruption); rtk #3549 (falsches „success" für nichtexistierenden EKS-Cluster), #3492 (verschluckte Exit-Codes → Phantom-Failures).[^13^][^21^] **Fail-open ist nicht genug** — falsche Kompression, die *korrekt aussieht*, ist der gefährlichste Fehler dieser Schicht.
8. **Hook-Stacking-Konflikte.** Mehrere PreToolUse-Rewrite-Hooks (z. B. rtk + squeez + snip gleichzeitig) konkurrieren um denselben Bash-Call; Reihenfolge/Doppel-Wrapping ist implementierungsabhängig. token-saver warnt explizit vor Dual-Installation.[^6^] **Pro Schicht genau einen Rewrite-Hook** installieren; kombiniert wird über orthogonalen Ebenen (Compress-Hook + Guard-Deny + Read-Clamp).
9. **Windows-Lücken.** squeez #208 (Hermes: cmd vs. git-bash → wrapped commands brechen still), sqz #26 (PowerShell-Tool nicht erkannt), tokf #455 (concurrent Cache-Rename). rtk (native Binary-Hook seit v0.37.2) und thlibo (PowerShell-Matcher) sind die einzigen mit explizitem Windows-Story.[^12^][^13^][^11^]
10. **Lizenz-/Supply-Chain-Fallen.** sqz = ELv2 (kein Competing-Hosted-Service)[^4^]; ctx-wire = verdächtige ZIP-Distribution (siehe Kurzliste)[^33^]; rtk-Namens-Kollision mit „Rust Type Kit" auf crates.io (falsches Paket → `rtk gain` schlägt fehl).[^1^]

---

## Stack-Empfehlung für diese Schicht

**Primär-Empfehlung (ein Rewrite-Hook, Bash-Schwerpunkt): `squeez`** — Begründung:
- **Einziges Primär-Tool, das Permission-Hygiene und Breite verbindet:** riskante Befehle laufen unwrapped unter nativen deny/ask-Rules (`bash_risk_patterns`, `wrap_bash=false` als Notaus)[^3^] — kein offener Permission-Bug, anders als rtk (#1155/#3152/#2345 offen).[^8^][^9^][^10^]
- **Net-Win-Gate + adaptive Intensity** adressiert direkt das empirisch belegte Negative-ROI-Regime (rtk#582/JetBrains)[^19^][^20^]; **Retrieve via `squeez_retrieve`** verhindert die Re-Run-Schleife; Identifier-Factsheet verhindert den schlimmsten Silent-Failure (verlorene SHAs/Tickets).[^3^]
- **PostToolUse-`updatedToolOutput` für Read/Grep/Glob** (CC ≥ v2.1.119) greift als einziges ausgewachsenes Primär-Tool über die 20-%-Bash-Decke hinaus in den 78-%-Strom.[^3^]

**Alternative für maximale Ingenieurs-Disziplin: `tokf`** — wenn reine Bash-Filterung reicht und Prompt-Cache-Sicherheit oberste Priorität hat (erzwungene Byte-Stabilität, kalibrierter Schätzer, ehrlichste Fehlerbalken, `tokf raw <id>` als pipbarer Retrieve-Pfad).[^2^] Für Plugin-Minimalisten (kein Binary-Management): **token-saver** aus dem offiziellen Marketplace — härtester Hook (fail-open, `sh -n`-geprüfte Rewrites, untrusted-Projekt-Config), akzeptiert: Python-Latenz ~60 ms, kein Full-Retrieve.[^6^]

**Orthogonal dazu (kein Rewrite-Hook, daher stackbar):**
- **Guard-Schicht à la kuro-lean** (Deny token-hungriger Calls *vor* Ausführung: `find /`, Lock-Files, >500-KB-Reads) — „the cheapest token is the one that never enters the context"[^18^]; plus `kt cost` als ehrliches Mess-Instrument für die eigene Rechnungs-Verteilung.
- **Read-Clamp à la STK** (85 % der oversized Kontext-Blöcke stammen aus dem nativen Read-Tool → deny-with-outline statt Voll-Dump)[^25^] — adressiert den größten Einzelstrom, den Bash-Hooks nie sehen.

**Explizit NICHT für die Produktiv-Schicht:** rtk (trotz 76k★: 3 offene Security-Issues inkl. CVE, unabhängige Negativ-Messungen, 1.955 offene Issues)[^8^][^9^][^10^][^20^]; sqz (Datenverlust-Bugs offen, stale, ELv2)[^13^]; ecotokens (richtige Architektur, aber kein Retrieve-Pfad → Re-Run-Risiko)[^17^]; thlibo (nur bei Log/PDF-schweren Workflows — Daemon-Footprint)[^14^]; ctx-wire (Supply-Chain-Warnung).[^33^]

**Ehrlicher Erwartungswert (End-to-End, Gesamtrechnung):**
- Bash-Filter allein: **0–3 %** typisch (Savings-Cap ~3 % des Inputs; kuro-lean misst ~0–1 % auf Small-Output-Workloads, ~7 % aggressiv simuliert)[^18^]; **bis 10–15 %** in test-/build-/log-lastigen Sessions mit häufigen >10k-Outputs.
- + Read/Grep-Abdeckung (squeez/ecotokens/STK-Clamp): **zusätzlich ~2–5 %**, da Read der voluminöseste Strom ist.[^25^]
- **Negativ-Szenario absichern:** ohne Net-Win-Gate/Small-Passthrough ist −5 bis −18 % dokumentiert[^19^][^20^] — Tool-Auswahl nach Gates, nicht nach Marketing-Prozent.
- Die echten Hebel bleiben außerhalb dieser Schicht (Session-Splitting, `/clear`, Subagents: cache-read/write = ~89 % der Rechnung)[^18^] — die Filter-Schicht ist Hygiene und Katastrophenschutz, kein Kostentreiber-Fix.

---

## Quellen

[^1^]: rtk-ai/rtk README (master), https://github.com/rtk-ai/rtk — Install (`rtk init -g`, native Binary-Hook v0.37.2), Scope-Note (Read/Grep/Glob bypass), `[tee]`-Config, `bytes/4`-Schätzung, Telemetrie-Opt-in; API-Metadaten 2026-08-13: 75.918★, 1.955 offene Issues, Apache-2.0.
[^2^]: mpecan/tokf README (main), https://github.com/mpecan/tokf — `tokf hook install --global`, TOML-Filter, Determinism-Sektion (Double-Run Byte-Stability, Prompt-Cache-Begründung), `bytes/3.5`-Kalibrierung + Rewriting-Filter-Bias-Tabelle, Output-History/`tokf raw <id>`, Safety-Checks, Permission-Engines.
[^3^]: claudioemmanuel/squeez README (main), https://github.com/claudioemmanuel/squeez — 6-Hook-Architektur, Coverage-Table (PostToolUse `updatedToolOutput` ab CC v2.1.119), Bash-wrap safety (`bash_risk_patterns`, risky→unwrapped), Net-Win-Gate (24 tk), Benchmarks (91,4 % aggregat; cl100k-Verifikation 83,5 % vs 83,0 %), `--efficiency-proof`, „CANNOT compress"-Liste.
[^4^]: ojuschugh1/sqz README (master), https://github.com/ojuschugh1/sqz — `sqz init --global` (merge-Semantik), Dedup-Cache `§ref:HASH§` + `sqz expand`, Safe-Mode, 24,7 % Ø über 3.003 Kompressionen, ELv2-Lizenz, GLM-5.1-Ref-Loop-Warnung.
[^5^]: edouard-claude/snip README (master), https://github.com/edouard-claude/snip — `snip init` PreToolUse/`updatedInput`, 132 YAML-Filter/19 Actions, fail-closed Runner-Prefixes („confirmation-prompt guarantee"), `[tee]`-Config, `compact_path`-Caveat.
[^6^]: ppgranger/token-saver README (main), https://github.com/ppgranger/token-saver — Plugin-Install (`/plugin install token-saver@claude-community`), 9-Schritt-Pipeline inkl. Critical-Line-Recovery + Ratio-Gate, Hook-Härtung (shlex.quote, `sh -n -c`, fail-open, untrusted Projekt-Config), 1300+ Tests/Ratchet, Savings-DB (nur Größen), Dual-Install-Warnung.
[^7^]: rtk Issue #260 (closed), https://github.com/rtk-ai/rtk/issues/260 — PreToolUse-Hook bypassed deny- **und** ask-Rules via `permissionDecision:"allow"`; Fix-Richtung: Binary-Hook liest deny-Patterns.
[^8^]: rtk Issue #1155 (open), https://github.com/rtk-ai/rtk/issues/1155 — „security: hook auto-allow bypasses agent permission model for rewritten commands".
[^9^]: rtk Issue #3152 (open), https://github.com/rtk-ai/rtk/issues/3152 — User-`allow`-Patterns greifen nicht auf rewrite'te Befehle (rtk 0.43.0).
[^10^]: rtk Issue #2345 (open), https://github.com/rtk-ai/rtk/issues/2345 — `rtk proxy` umgeht `.env`-Deny-Rules, Credential-Exfiltration; CVE-2026-33068.
[^11^]: mpecan/tokf offene Issues, https://github.com/mpecan/tokf/issues — #455 (Windows Cache-Rename), #437 (git/status-Filter).
[^12^]: squeez Issue #208 (open), https://github.com/claudioemmanuel/squeez/issues/208 — Hermes-Adapter Windows: cmd.exe vs. git-bash, wrapped commands brechen still.
[^13^]: ojuschugh1/sqz offene Issues, https://github.com/ojuschugh1/sqz/issues — #32 (entropy_truncate-Datenverlust), #30 (Locale-Korruption git status), #34 (UTF-8-Panic), #26 (PowerShell-Tool), #35 („project dead?"); letzter Push 2026-06-21 (API).
[^14^]: 3rg0n/thlibo README (main), https://github.com/3rg0n/thlibo — PreToolUse+updatedInput-Pattern, Matcher Bash/PowerShell/Read/Write/Edit, inferd-Sidecar (Gemma 4), Install-Footprint-Tabelle, Security-Model (kein root, cosign/SBOM, OTel opt-in), Known-Limitations (kein Grep/Glob/MCP, keine Compound-Befehle).
[^15^]: thlibo README „Two behaviors worth knowing" + Security model, https://github.com/3rg0n/thlibo — Hooks auto-allowen eigene Rewrites (THREAT_MODEL.md Findings MA-2/MA-6/#15).
[^16^]: hansipie/ecotokens README (master), https://github.com/hansipie/ecotokens — PreToolUse (Bash) + PostToolUse (Read/Grep/Glob outline/grep-trim/glob-denoise), `exact-tokens`-Feature, Secrets-Redaktion vor Filterung, Family-Tabelle, MCP-Code-Intelligence.
[^17^]: hansipie/ecotokens offene Issues, https://github.com/hansipie/ecotokens/issues — #85 (Recovery-UX fehlt), #89 (Streaming), #90 (Chained Commands).
[^18^]: kurovu146/kuro-lean README (main), https://github.com/kurovu146/kuro-lean — `kt init`-Touch-Liste inkl. `permissions.allow Bash(kt run:*)`, Guard-Deny-Tabellen, `kt cost` (45/44/10-Verteilung, 1-h-TTL-Cliff), `kt bench` A/B-Ergebnisse (+14 % → +6 % nach Fix), 12.220-Call-Messung (~0–1 % Default, ~7 % aggressiv simuliert).
[^19^]: rtk Issue #582 (closed), https://github.com/rtk-ai/rtk/issues/582 — Repro-Paket: Hook erhöht Kosten um 18 %, Claude emittiert +50 % Output-Tokens; zit. in squeez README.
[^20^]: rtk Issue #3175 (open), https://github.com/rtk-ai/rtk/issues/3175 — Usage-Limits schneller erreicht nach Hook-Installation.
[^21^]: rtk offene Issues, https://github.com/rtk-ai/rtk/issues — #2727 (pytest/err zu aggressiv), #3492 (Exit-Codes verschluckt), #3543 (npm run lint falsch), #3549 (aws eks falsches success); API-Abruf 2026-08-13.
[^22^]: AbhayShalghar/ctk README, https://github.com/AbhayShalghar/ctk — PostToolUse `updatedToolOutput` für Bash/Grep/Read/`mcp__*`, `.ctk/cache/` Tee, fail-open.
[^23^]: GitHub Search API `user:cardimvitor`, Abruf 2026-08-13 — total_count=0; Repo „tk" nicht auffindbar.
[^24^]: sphragis-oss/isthmos README, https://github.com/sphragis-oss/isthmos — PostToolUse `updatedToolOutput`, JSON-Field-Pruning, Shadow-Mode-Measurement.
[^25^]: ryanportfolio/STK README, https://github.com/ryanportfolio/STK — 250-Session-Mining: 85 % oversized Kontext aus Read-Tool; PreToolUse deny-with-outline, offset/limit-Anleitung, fail-open.
[^26^]: illuwa/ctx-diet README, https://github.com/illuwa/ctx-diet — 65,6 % über 91.287 Commands; Re-Send-Multiplikator-Erklärung.
[^27^]: phuetz/lm-resizer README, https://github.com/phuetz/lm-resizer.
[^28^]: Guazzihub/Sieve README, https://github.com/Guazzihub/Sieve — PostToolUse-Plugin, Verifiable-Loss-Policy (1.500-char-Gate, Raw-on-Disk).
[^29^]: wasdevv/lean-output README, https://github.com/wasdevv/lean-output — RSpec/RuboCop-PostToolUse, 3,2kB→346B Live-Capture.
[^30^]: AndVl1/gw README, https://github.com/AndVl1/gw — Gradle-Filter, `gw init` PreToolUse-Hook, Full-Log unter build-logs/.
[^31^]: helmif/wafi README, https://github.com/helmif/wafi.
[^32^]: JoonasAaltonen/claude-optimizer README, https://github.com/JoonasAaltonen/claude-optimizer — Windows-only, Selbstverweis auf rtk.
[^33^]: fantastic-interpolation620/ctx-wire README, https://github.com/fantastic-interpolation620/ctx-wire — ZIP-im-Repo-Distribution, SmartScreen-Umgehungs-Anleitung; Supply-Chain-Warnung (Einschätzung des Agenten, 2026-08-13).

*Externe Kontext-Befunde (aus Swarm-Briefing, nicht neu verifiziert): JetBrains-Benchmark Juli 2026 (rtk +7,6 % low effort; Savings-Cap ≈3 %; ~20/78-%-Split); codepointer-Replay (rtk = 0,5 % der Rechnung).*
