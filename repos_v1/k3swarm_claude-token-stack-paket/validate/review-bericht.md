# Code-Review: Claude Code Token-Stack (GPT55SOL_PRO + OPUS5_MAX)

Reviewer-Fazit vorab: **Die GPT-Guards sind funktional und weitgehend produktionsreif.** Alle 10 .mjs-Dateien bestehen Syntax-Check, alle Self-Tests und der Hook-Contract-Smoke-Test laufen grün, und 20+ manuelle Funktionstests mit simulierten Hook-Payloads bestätigen das beabsichtigte Verhalten inkl. korrekter Exit-Codes und plausibler Token-Einsparung (96 % bei einem 165-KB-Dump). Zwei Packaging-Fehler verhindern jedoch, dass `verify-package.sh` out-of-the-box grün wird.

---

## 1. Funktionsmatrix

| Datei | Syntax (`node --check`) | Self-Test / Verifikation | Funktioniert wie beabsichtigt? |
|---|---|---|---|
| GPT `bash-dump-guard.mjs` (1064 Z.) | ja | Self-Test OK (via verify) | **ja** – 9 Szenarien getestet, s.u. |
| GPT `lib/token-stack-shared.mjs` | ja | indirekt (wird von 4 Hooks genutzt) | **ja** – bounded `walkFiles` (maxFiles/maxDepth) |
| GPT `prefix-budget.mjs` | ja | Self-Test OK | **ja** – Advisory nur bei Budgetüberschreitung, nur bei `SessionStart` |
| GPT `session-economy.mjs` | ja | Self-Test OK | **ja** – minTurns-Gate, Band-Warnung, Dedup, Checkpoints |
| GPT `read-context-guard.mjs` | ja | Self-Test OK | **ja** – deny-once + Digest-Reread exakt wie spezifiziert |
| GPT `read-slice-guard.mjs` | ja | via read-context-guard | **ja** (reines Regelmodul, kein eigener CLI – by design) |
| GPT `reread-guard.mjs` | ja | via read-context-guard | **ja** (reines Regelmodul) |
| GPT `claude-hook-capability-canary.mjs` | ja | Self-Test OK (Mock-Claude) | **teilweise** – Dry-Run/Self-Test OK; Live-Probe benötigt echtes `claude`-CLI (hier nicht testbar) |
| GPT `tests/hook-contract-smoke.mjs` | ja | – | **ja**: `hook contract smoke: OK`, Exit 0 |
| GPT `verify-package.sh` | `bash -n` OK | – | **teilweise**: schlägt auf frischem Checkout fehl (2 Packaging-Bugs, s.u.) |
| GPT `install-token-stack-hooks.sh` / `.ps1` | `bash -n` OK | Isolated-Home-Smoke OK | **ja** (sh) / **ungetestet** (ps1, kein pwsh verfügbar) |
| GPT `install-bash-dump-guard.sh` / `.ps1` | `bash -n` OK | – | **ja** (sh) / **ungetestet** (ps1) |
| GPT `SHA256SUMS.txt` | – | `sha256sum -c` | **nein** – referenziert nicht existierendes `./README.md` |
| GPT `claude-code-hooks.example.json` | JSON valide | Invarianten via verify OK | **ja** – Format konform (s. Abschnitt 6) |
| OPUS `prefix-budget.mjs` (305 Z.) | ja | Self-Test OK (7/7 PASS) | **ja** – Hook-Modus, `--report`, `--json` getestet |
| OPUS `context-surface-owners.yaml` | YAML valide | – | **ja** (Struktur: version/surfaces/invariants) |
| OPUS `SHA256SUMS.txt` | – | – | **nein** – derselbe README.md-Bug wie GPT |

## 2. Funktionstests im Detail (Auszug der Belege)

### bash-dump-guard (PostToolUse Bash)
| # | Szenario | Ergebnis |
|---|---|---|
| S1 | kleiner `ls`-Output | kein Output, Exit 0 (Pass-Through) ✅ |
| S2 | 2000-Zeilen-Dump (164 889 B), `hookActivation=replace` | `updatedToolOutput` mit 6 099 B (**96 % Reduktion**, ~39 700 Tokens gespart laut Metrik), Raw-Archiv `s2/4bac…` angelegt ✅ |
| S2b | Archiv-Recovery via `--show-json` | vollständige Original-stdout (164 889 B) wiederherstellbar ✅ |
| S3 | `git diff` (3000 Patch-Zeilen) | Pass-Through (exact-Sensitive-Pattern) ✅ |
| S4 | `npm test` mit exitCode=1 | Pass-Through (failure-like → exact) ✅ |
| S5 | AWS-Key + `sk-ant-…` im Output | beide redacted (`[REDACTED AWS KEY]`) ✅, aber kosmetischer Mangle (Bug B3) |
| S6 | Default `hookActivation=auto` ohne Canary-Record | Shadow-Modus: kein Output, Metrik `reason: capability-record-missing` ✅ (fail-closed für Replacement, by design) |
| S7 | auto + gültigem Capability-Record | kippt korrekt auf `replace`, Emission erfolgt ✅ |
| S8 | kaputtes JSON / leeres stdin / falsches Tool | jeweils Exit 0, kein Output (fail-open) ✅ |
| S9 | `--filter`-Modus, npm-install-Progress, `git log`, `terraform plan` | Filter 60 390→2 926 B; npm→3 681 B; git log→1 638 B; terraform plan unverändert ✅ |

Native-Budget-Kopplung: `BASH_MAX_OUTPUT_LENGTH=24000 … --status` → target 17 280 / hard 24 000 (verifiziert durch verify-package.sh). Native-Truncation-Marker (`... [12000 characters truncated] ...`) → Pass-Through ✅.

### read-context-guard (PreToolUse/PostToolUse Read)
- kleine Datei: still erlaubt; 5 001-Zeilen-Datei: **deny** mit `permissionDecision` + `permissionDecisionReason` (korrekter PreToolUse-Contract) → identischer Repeat innerhalb 180 s: erlaubt (Escape-Valve) → dritter Versuch: erneut deny ✅
- Reread: nach PostToolUse-Recording wird identischer Re-Read mit `[reread-guard] Unchanged repeat Read denied once` geblockt; `offset/limit`-Read erlaubt; Read nach Dateiänderung (Digest-Mismatch) erlaubt ✅

### session-economy (Stop/PreCompact/SessionEnd)
- 150 500/200 000 Tokens (75 %): Stop #1 still (minTurns-Gate), Stop #2 `systemMessage` "Context pressure crossed 70% (75.0%…)" + mechanischer Checkpoint auf Disk, Stop #3 still (Band-Dedup) ✅

### prefix-budget GPT (SessionStart)
- kleine CLAUDE.md: still; 40 000-Zeichen-CLAUDE.md: `hookSpecificOutput.additionalContext` "~10000 estimated tokens … Full report: …prefix-latest.json" + Report-Datei geschrieben; falsches Event (`UserPromptSubmit`): still; kaputtes stdin: Exit 0 ✅

### prefix-budget OPUS
- Self-Test 7/7 PASS; Hook-Modus mit 3 Skills/5 MCP-Servern/20 KB CLAUDE.md: eine `additionalContext`-Zeile mit konkreten Befunden; `--report` und `--json` plausibel; liest stdin **nicht** (kein Hängen), exitiert auf jedem Pfad mit 0 ✅

## 3. Gefundene Bugs

| # | Schwere | Ort | Beschreibung |
|---|---|---|---|
| B1 | mittel | `SHA256SUMS.txt:2` (GPT **und** OPUS) | Listet `./README.md`; ausgeliefert wird `README_gpt.md`/`README_opus.md` → `sha256sum -c` schlägt fehl, `verify-package.sh` endet mit Exit 1. (Hash passt inhaltlich zu README_gpt.md – vermutlich nachträgliche Umbenennung durch die Sammlung, trotzdem ist das Paket so nicht verifizierbar.) |
| B2 | mittel | Git-Mode 100644 für `install-*.sh` | `verify-package.sh:77` ruft `install-token-stack-hooks.sh` **direkt** auf → "Permission denied", Exit 126 auf frischem Checkout. Fix: `git update-index --chmod=+x` bzw. Aufruf via `bash`. |
| B3 | kosmetisch | `bash-dump-guard.mjs:113-121` (SECRET_RULES-Reihenfolge) + `redactSecrets` (Z. 220-234) | anthropic-key-Regel ersetzt `sk-ant-…` zuerst durch `[REDACTED ANTHROPIC KEY]`; die named-secret-Regel matcht danach den Wert `[REDACTED` (≥8 Zeichen) erneut → Output `api_key=[REDACTED] ANTHROPIC KEY]`. Secrets bleiben entfernt (Sicherheit OK), aber das Ergebnis ist verstümmelt. Fix: named-secret-Regex darf nicht auf `[`-beginnende Werte matchen. |
| B4 | niedrig | `readStdinText` (`lib/token-stack-shared.mjs:78-82`) und `readStdin` (`bash-dump-guard.mjs:977-981`) | **Kein stdin-Größenlimit** – unbegrenzte Akkumulation. Bei Claude Code praktisch harmlos (Host begrenzt Payloads), widerspricht aber dem eigenen Anspruch robuster Guards; ein `maxStdinBytes`-Cap mit fail-open wäre konsistent zum Rest. |
| B5 | niedrig | GPT `prefix-budget.mjs:394` | Hook-Modus wartet auf stdin; manueller Aufruf ohne `--report/--json` hängt bis EOF. OPUS liest stdin gar nicht (besseres UX). |
| B6 | niedrig | OPUS `prefix-budget.mjs` `emitHook` | prüft das Hook-Event nicht (GPT gated auf `SessionStart`); bei Fehlregistrierung würde es SessionStart-Output auf fremden Events emittieren. |
| B7 | info | Native-Truncation-Patterns | Heuristiken (`output (was )?truncated`, `full output saved to`) decken vermutlich gängige Claude-Code-Marker ab, konnten ohne echten Host nicht gegen das tatsächliche Format verifiziert werden. |

**Nicht gefunden:** Shell-Injection (kein `execSync`; der Canary nutzt `spawnSync` mit Argument-Arrays ohne Shell), keine TODO/FIXME-Reste, keine Third-Party-Dependencies, fail-open überall greifbar.

## 4. Bewertung (0–10)

| Artefakt | Funktionalität | Robustheit | Hook-Konformität |
|---|---|---|---|
| bash-dump-guard.mjs | 10 | 8 (B3, B4) | 8* |
| read-context-guard.mjs (+slice/reread) | 10 | 9 (B4) | 10 |
| session-economy.mjs | 9 | 9 (B4) | 10 |
| prefix-budget.mjs (GPT) | 9 | 8 (B4, B5) | 10 |
| claude-hook-capability-canary.mjs | 8 (Live-Probe ungetestet) | 9 | 9 |
| lib/token-stack-shared.mjs | 9 | 8 (B4) | – |
| tests/hook-contract-smoke.mjs | 9 | 9 | 10 |
| verify-package.sh | 8 | 7 (B1+B2 brechen den Lauf) | – |
| Installer sh/ps1 | 9 | 9 (Backups, chmod 700/600, keine settings.json-Mutation) | – |
| claude-code-hooks.example.json | 10 | – | 10 |
| OPUS prefix-budget.mjs | 8 | 8 (B6) | 9 |
| OPUS context-surface-owners.yaml | 9 | – | – |

\* Der Guard emittiert `hookSpecificOutput.updatedToolOutput` – ein Feld, das **nicht zum dokumentierten PostToolUse-Contract** gehört (dokumentiert sind `additionalContext`/`permissionDecision`). GPT adressiert das ehrlich und sauber: Replacement wird nur aktiviert, wenn der Capability-Canary live gegen die installierte Claude-Executable beweist, dass der Host das Feld honoriert (`hookActivation=auto` + Fingerprint + Max-Age); bis dahin Shadow-Modus mit Metriken. Das ist die bestmögliche Strategie unter Unsicherheit, aber die Konformität des Mutationspfads hängt von einer undokumentierten Host-Fähigkeit ab.

## 5. Vergleich prefix-budget: GPT (v1) vs. OPUS (v2)

| Kriterium | GPT (423 Z.) | OPUS (305 Z.) |
|---|---|---|
| Hook-Gating auf `SessionStart` | ja | nein (B6) |
| stdin-Verarbeitung | ja (hängt manuell, B5) | nein (nutzt `CLAUDE_CONFIG_DIR`/`CLAUDE_PROJECT_DIR`) |
| Persistenz | Report-JSON + JSONL-Metrik-Historie | strikt read-only (kein State) |
| Skill-Erkennung | Plugin-Cache-Scan, Metadaten-Byte-Budget, Description-Längen | Frontmatter-Namen, **Duplikat-/Namenskollisions-Erkennung** |
| MCP/Plugins/Marketplaces | ja | ja |
| **Hook-Flächen-Kollisionserkennung** ("Gesetz I": >1 mutierender Hook pro Event:Matcher) | nein | **ja** – einzigartig und thematisch zentral |
| Rules-Dateien (potenzielle Prefix-Last) | ja | nein |
| Modi / Konfigurierbarkeit | off/report/advisory, eigene Config-Datei + Env | Budget-Config in `~/.claude/prefix-budget.config.json` |
| Selbsttest | OK | OK (7 Checks, expliziter) |
| Sprache/Doku | Englisch | Deutsch, knapper, `--report` menschenlesbar |

**Empfehlung:** **GPT-Version als Basis übernehmen** (reifere Persistenz, korrektes Event-Gating, tiefere Inventur) und aus der OPUS-Version zwei Features portieren: (1) die Hook-Flächen-Kollisionserkennung, (2) die Skill-Namenskollisions-Erkennung. OPUS ist die elegantere, schlankere Implementierung, misst aber weniger und hat mit B6 eine kleine Konformitätslücke.

## 6. Prüfung `claude-code-hooks.example.json`

Konform: Top-Level `hooks`, gültige Event-Namen (`SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `PreCompact`, `SessionEnd`), Gruppen mit `matcher` ("Read"/"Bash") und `hooks: [{type:"command", command, timeout, statusMessage}]`. `read-context-guard.mjs` ist korrekt **doppelt** registriert (Pre- und PostToolUse Read) – passt zur Dual-Rolle (deny-once + recording). Pro Event:Matcher maximal ein mutierender Hook (One-Owner-Prinzip eingehalten). `verify-package.sh` erzwingt diese Invarianten zusätzlich programmatisch.

## 7. Code-Qualität

- **Robustheit:** fail-open überall verifiziert (kaputtes JSON → Exit 0, kein Output); Config-Merges defensiv; Datei-Permissions 0600/0700 für State/Metriken/Archive; Archive gzippt + SHA256 + Retention/Pruning; Metrik-Rotation. Abzug: B4 (kein stdin-Limit), B5.
- **Sicherheit:** keine Shell-Ausführung in den Guards; Secret-Redaktion (10 Regeln) greift **auch dann, wenn sonst keine Kompression stattfindet** (safetyReplacement-Pfad) und sensitive Outputs werden nicht roh archiviert (`storeSensitiveRaw:false`). Abzug: B3 (kosmetisch).
- **Wartbarkeit:** klare Single-Owner-Architektur (read-slice/reread als reine Module hinter read-context-guard), SCHEMA_VERSION, deterministische Self-Tests, Contract-Smoke-Test, Installer-Isolationstest. 1064 Zeilen für bash-dump-guard sind viel, aber ohne Dead Code und gut gegliedert.
- **Konfigurierbarkeit:** JSON-Configs + Env-Overrides (`*_CONFIG`, `BASH_DUMP_GUARD_HOOK_ACTIVATION`, `BASH_MAX_OUTPUT_LENGTH`-Alignment) – sehr gut.

## 8. Gesamturteil

**Note: 8/10 – produktionsreif mit Auflagen.** Die Guards tun nachweislich, was sie versprechen: messbare, große Token-Einsparungen (96 % beim Dump), verlustfrei recoverbar, fail-open, hook-konform, ohne Dependencies. Auflagen vor produktiver Übernahme: B1/B2 (Paketverifikation muss grün werden), B3 (Redaktions-Mangle), optional B4 (stdin-Cap). Der `updatedToolOutput`-Mutationspfad ist ehrlich capability-gegatet – im Zweifel läuft der Guard im Shadow-Modus und spart "nur" Erkenntnisse statt Tokens.

**Übernahme-Empfehlung für den finalen Stack:**
1. `bash-dump-guard.mjs` + Canary (Kernstück; `hookActivation=auto` belassen)
2. `read-context-guard.mjs` inkl. `read-slice-guard.mjs` + `reread-guard.mjs` (sauberster Guard, voller dokumentierter Contract)
3. `session-economy.mjs` (advisory, nie blockierend)
4. `prefix-budget.mjs` GPT als Basis **+ OPUS-Features** (Flächenkollisionen, Skill-Duplikate) portieren
5. OPUS `context-surface-owners.yaml` als Governance-Artefakt dazu (besetzt genau das One-Owner-Problem, das B-artige Fehler verhindert)
