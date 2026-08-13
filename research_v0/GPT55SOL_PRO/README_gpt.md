# Claude Code Token Stack — Research Package Revision 3

**Stand:** 10. August 2026

Dieses Paket synthetisiert:

- den erweiterten 228-Repository-Research,
- die bisherigen Revision-2-Audits,
- den Gegenentwurf `token-stack-konzept-2026-08.md`,
- aktuelle Claude-Code-Verträge zu Skills, Prompt Caching, Hooks, Tool Search und Output-Limits,
- gezielte Nachprüfung von OMNI, clauditor, SigMap und Token Optimizer.

## Kernergebnis

Der Zielstack arbeitet **prefix-first**, aber nicht auf Basis einer ungeprüften Skill-Hochrechnung. Er misst lokale Prefix-Kandidaten und reale Context-/Cache-Daten, setzt native Budgets, und aktiviert anschließend höchstens einen mutierenden Owner je Oberfläche.

```text
Prefix        native hygiene + prefix-budget observer
Native Read   read-context-guard (reread + slice, one dispatcher)
Bash          bash-dump-guard v3, capability-gated
Session       session-economy + authoritative TASK-STATE
Retrieval     exactly one of SigMap CLI / CodeGraph / codebase-memory
External      optional Context Mode with strict surface separation
Measurement   native context/usage + ccusage + component metrics
```

OMNI, Squeez, RTK, Snip, lowfat, semtrim, quiet-bash, nestor-lean und kmizu/token-saver sind **separate Vergleichsprofile**, keine additive Kompressionskette.

## Dateien

### Research und Entscheidungen

- `token-stack-konzept-2026-08.optimized.md` — optimierte, strukturgleiche Fassung des hochgeladenen Gegenentwurfs
- `claude-code-token-stack-research-2026-08-10.md` — vollständige Revision-3-Synthese
- `repo-catalog.md` — menschenlesbarer Katalog mit 228 Repositories
- `repo-catalog.json` — maschinenlesbarer Katalog
- `repo-shortlist-matrix.md` — Kandidaten- und Profilempfehlung
- `target-stack-profiles.yaml` — maschinenlesbare Ziel-/A/B-Profile
- `context-surface-owners.template.yaml` — eindeutige Surface-Ownership
- `token-efficiency.rules.md` — Prefix-, Read-, Bash-, Session- und Build-Regeln
- `token-stack-benchmark-plan.md` — End-to-End-Versuchsplan
- `TASK-STATE.template.md` — autoritativer kurzer Handoff
- `native-token-limits.example.jsonc` — nativer Pilotarm, keine Universalwerte

### Hooks und Guards

- `prefix-budget.mjs` — SessionStart-Inventur und advisory
- `prefix-budget.config.json`
- `read-context-guard.mjs` — alleiniger Read-Dispatcher
- `read-slice-guard.mjs` — internes Whole-file-Budgetmodul
- `reread-guard.mjs` — internes digest-verifiziertes Dedupmodul
- `read-context-guard.config.json`
- `session-economy.mjs` — mechanischer privater Checkpoint + user-only pressure advisory
- `session-economy.config.json`
- `bash-dump-guard.mjs` — capability-gated Bash-Output-Guard v3
- `bash-dump-guard.config.json`
- `claude-hook-capability-canary.mjs` — Live-Prüfung der installierten Runtime
- `lib/token-stack-shared.mjs` — gemeinsame lokale Hilfsfunktionen

### Installation und Verifikation

- `install-token-stack-hooks.sh`
- `install-token-stack-hooks.ps1`
- `install-bash-dump-guard.sh`
- `install-bash-dump-guard.ps1`
- `claude-code-hooks.example.json`
- `tests/hook-contract-smoke.mjs` — End-to-End-Hook-Envelope-/State-Smoke-Test
- `verify-package.sh`
- `package-manifest.json`
- `SHA256SUMS.txt`
- `CHANGELOG.md`

Die Quelldatei des Gegenentwurfs liegt unverändert unter `sources/`.

## Sichere Installation

### Kompletter modularer Stack

macOS/Linux/WSL:

```bash
./install-token-stack-hooks.sh
```

Windows PowerShell:

```powershell
.\install-token-stack-hooks.ps1
```

Die Installer:

1. sichern vorhandene Zieldateien,
2. kopieren Hooks und konservative Configs,
3. führen alle lokalen Self-Tests aus,
4. melden mögliche überlappende Owner,
5. **ändern `settings.json` nicht automatisch**,
6. geben den zu prüfenden Hook-Block aus.

Mit isolierter Live-Capability-Prüfung:

```bash
./install-token-stack-hooks.sh --probe
```

```powershell
.\install-token-stack-hooks.ps1 -Probe
```

### Nur Bash-Guard

```bash
./install-bash-dump-guard.sh --probe
```

Ohne Probe bleibt `hookActivation=auto` sicher im Shadow-Modus, bis ein frischer Canary-Pass zum Fingerprint des aktuellen Claude-Executables vorliegt.

## Lokale Checks

```bash
node prefix-budget.mjs --self-test
node read-context-guard.mjs --self-test
node session-economy.mjs --self-test
node bash-dump-guard.mjs --self-test
node claude-hook-capability-canary.mjs --self-test
node tests/hook-contract-smoke.mjs
./verify-package.sh
```

Status nach Installation:

```bash
node ~/.claude/hooks/prefix-budget.mjs --report
node ~/.claude/hooks/read-context-guard.mjs --status
node ~/.claude/hooks/session-economy.mjs --status
node ~/.claude/hooks/bash-dump-guard.mjs --status
```

## Wichtige Sicherheitsgrenzen

- `prefix-budget` ist eine lokale Inventur, kein exakter Provider-Bill-Rekonstruktor.
- Der Read-Guard hat für jede Denial eine bewusste Einmal-Wiederholung als Escape-Valve.
- Rereads werden nur bei bestätigtem Digest oder explizit erlaubter Stat-Vertrauensregel unterdrückt.
- Session-Economy blockiert standardmäßig nie und injiziert den Checkpoint nicht in den Modellkontext.
- Bash-Fehler, stderr, Interruptionen, Patches, Security, Migration, IaC und Kryptografie bleiben exact-by-default.
- Lossy Bash-Replacement benötigt standardmäßig ein erfolgreiches privates Raw-Archiv.
- Die Hook-Canary-Prüfung bleibt nötig, weil dokumentierte Mutationseigenschaften in konkreten Claude-Versionen regressieren können.
- Kein mitgelieferter Benchmark belegt bereits einen universellen Gewinner. Der Versuchsplan ist Teil der Empfehlung, nicht optionales Beiwerk.
