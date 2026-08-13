# Changelog

## Revision 3 — 2026-08-10

### Architektur

- Prefix-Hygiene als Priorität 0 aufgenommen, aber von einer unbewiesenen „größter Hebel“-Behauptung zu einer messbaren Hypothese korrigiert.
- Skill-Kostenmodell an dynamisches Metadatenbudget und bedarfsgeladene Skill-Bodies angepasst.
- Proxy-Regel präzisiert: nicht pauschal cache-zerstörend, sondern Traffic-Owner mit zu messender Cache-Ökonomie.
- `one mutating owner per surface` auf Prefix, Bash, Read, Dedup, Retrieval, Memory, Session und Proxy erweitert.
- `rtk + snip/lowfat + omni` in getrennte A/B-Arme aufgelöst.
- SigMap entweder als Broad-Owner oder eng als Evidence-/Verify-CLI definiert.

### Neue Hooks

- `prefix-budget.mjs` + Config
- `read-context-guard.mjs` + Config
- `read-slice-guard.mjs`
- `reread-guard.mjs`
- `session-economy.mjs` + Config
- `lib/token-stack-shared.mjs`

### Bash Guard v3

- interne Budgets an `BASH_MAX_OUTPUT_LENGTH` gekoppelt,
- Native-Truncation-Marker exact durchgereicht,
- Status/Metriken um effektive Native-Budgets erweitert,
- bestehende Capability-, Exact-, Redaction-, Archive- und Shadow-Gates erhalten.

### Research und Governance

- Katalog von 226 auf 228 deduplizierte Repositories erweitert.
- OMNI und clauditor aufgenommen.
- SigMap, Token Optimizer, Snip, lowfat, CodeGraph, codebase-memory und Context Mode neu eingeordnet.
- Optimierte strukturgleiche Fassung des hochgeladenen Konzeptdokuments ergänzt.
- Research, Shortlist, Profile, Ownership, Regeln, Benchmarkplan und Task-State vollständig überarbeitet.
- nativen Limit-Pilot als `native-token-limits.example.jsonc` ergänzt.
- vollständige Shell-/PowerShell-Installer ergänzt.

### Verifikation

- Self-Tests für Prefix, Read Dispatcher, Session Economy und Bash Guard.
- direkter Hook-Contract-Smoke-Test für SessionStart, Pre/PostToolUse Read, Stop und PostToolUse Bash.
- Read-Tests decken Slice-Denial, Escape-Valve, Digest-Reread und Änderung ab.
- Session-Test deckt Transcript-Usage, Secret-Redaction, Checkpoint und Druckband ab.
- Paketverifikation prüft Syntax, JSON/YAML, Katalogkonsistenz, Installer und Prüfsummen.

## Revision 2 — 2026-08-10

- Capability-gated `bash-dump-guard` eingeführt.
- vollständiger 226-Repo-Suchraum und Surface-Ownership-Modell aufgebaut.
- PostToolUse-Guard, Raw-Archive, Canary und End-to-End-Benchmarkplan bereitgestellt.
