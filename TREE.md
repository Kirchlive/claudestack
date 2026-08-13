# TREE — hinzugefügte und generierte Dateien

**Stand:** 2026-08-13, nach der zweiten Abnahme · **Quelle:** Umsetzung von `repos_v2/UMSETZUNGSPLAN-claude-code-integration.md`

Unverändert aus dem Klon von `github.com/Kirchlive/claudestack` und hier **nicht** aufgeführt:
`repos_v1/`, `repos_v2/` (118 Quelldateien), `research_v0/`. Die `.gitignore` ist geändert und deshalb gelistet.

Nicht im Baum, weil bewusst nicht versioniert: `messung/lauf-baseline/` (eingefrorener Fremdkorpus,
serena@5cb3bf9, MIT — aus `corpus.sha256` und der rsync-Prozedur reproduzierbar) und `fragment.json`
im Arbeitsrepository (maschinen- **und** ortsgebunden; die falsche Kopie zu übernehmen erzeugt einen
zweiten Bash-Owner, Defekt D24). Am Betriebsort ist `fragment.json` dagegen Laufzeitzustand und bleibt.

```
### A — Arbeitsrepository  /home/rob/.claude-tweak/
(ohne repos_v1/, repos_v2/, research_v0/ — unverändert aus dem Klon)
.
├── claude-code-token-stack/  (16)
│   ├── bin/  (1)
│   │   └── claudestack.mjs  [7K]
│   ├── config/  (7)
│   │   ├── bash-pilot-reference.json  [2K]
│   │   ├── context-surface-owners.json  [17K]
│   │   ├── native-token-limits.example.jsonc  [3K]
│   │   ├── plugin-diet.md  [4K]
│   │   ├── settings.patch.json  [6K]
│   │   ├── token-stack.default.json  [537]
│   │   └── token-stack.schema.json  [2K]
│   ├── docs/  (12)
│   │   ├── ARCHITECTURE.md  [11K]
│   │   ├── BENCHMARK.md  [9K]
│   │   ├── DECISIONS.md  [12K]
│   │   ├── DEFEKTE.md  [25K]
│   │   ├── LADDER.md  [5K]
│   │   ├── MESSPLAN.md  [6K]
│   │   ├── MESSPROTOKOLL.template.md  [3K]
│   │   ├── MIGRATION.md  [13K]
│   │   ├── REPO-MATRIX.md  [20K]
│   │   ├── ROLLOUT.md  [6K]
│   │   ├── SECURITY.md  [9K]
│   │   └── WAVES.md  [3K]
│   ├── evidence/  (4)
│   │   ├── gpt56/  (7)
│   │   │   ├── 01-validation-crosswalk-5point.md  [29K]
│   │   │   ├── 02-squeez-rtk-ladder-reference-audit.md  [13K]
│   │   │   ├── 03-file-token-metrics.csv  [11K]
│   │   │   ├── 03-file-token-metrics.json  [31K]
│   │   │   ├── 04-second-validation-100point.md  [25K]
│   │   │   ├── 05-final-consolidated-token-stack.md  [23K]
│   │   │   └── 06-incoming-reconciliation.md  [41K]
│   │   ├── k3/  (19)
│   │   │   ├── issues/  (3)
│   │   │   │   ├── issues_out.txt  [21K]
│   │   │   │   ├── issues_out2.txt  [5K]
│   │   │   │   └── issues_out3.txt  [10K]
│   │   │   ├── changes.md  [13K]
│   │   │   ├── claude-token-stack-evaluierung-und-merge.md  [29K]
│   │   │   ├── finaler-abgleich.md  [12K]
│   │   │   ├── K3SWARM-REVISION-3RUNDE.md  [5K]
│   │   │   ├── KONZEPT.md  [19K]
│   │   │   ├── ladder-config.json  [7K]
│   │   │   ├── ladder-ledger.mjs  [10K]
│   │   │   ├── ladder-retrieve-filter.mjs  [8K]
│   │   │   ├── ladder-retrieve-gate.mjs  [10K]
│   │   │   ├── MASTERPLAN.md  [7K]
│   │   │   ├── plan.md  [2K]
│   │   │   ├── README.md  [7K]
│   │   │   ├── review-bericht.md  [13K]
│   │   │   ├── SQUEEZ-RTK-LADDER-ANALYSE.md  [26K]
│   │   │   ├── VALIDIERUNG.md  [11K]
│   │   │   ├── vergleich-4wege.md  [22K]
│   │   │   ├── verifikationsbericht-claudestack.md  [19K]
│   │   │   └── zweitvalidierung-update.md  [17K]
│   │   ├── opus5/  (6)
│   │   │   ├── bash-owner-dispatch.config.example.json  [3K]
│   │   │   ├── bash-owner-dispatch.mjs  [14K]
│   │   │   ├── hooks.settings.example.json  [1K]
│   │   │   ├── KONZEPT-v5.md  [43K]
│   │   │   ├── MASTERPLAN.md  [4K]
│   │   │   └── README.md  [5K]
│   │   └── README.md  [3K]
│   ├── examples/  (1)
│   │   └── benchmark-runs.example.jsonl  [582]
│   ├── hooks/  (2)
│   │   ├── optional/  (9)
│   │   │   ├── lib/  (2)
│   │   │   │   ├── nudge-budget.mjs  [9K]
│   │   │   │   └── token-stack-shared.mjs  [8K]
│   │   │   ├── bash-size-feedback.mjs  [5K]
│   │   │   ├── claude-hook-capability-canary.mjs  [14K]
│   │   │   ├── ctx-used-marker.mjs  [2K]
│   │   │   ├── prefix-budget.mjs  [29K]
│   │   │   ├── read-context-guard.mjs  [9K]
│   │   │   ├── read-slice-guard.mjs  [4K]
│   │   │   ├── reread-guard.mjs  [4K]
│   │   │   └── session-economy.mjs  [21K]
│   │   └── claudestack.mjs  [308]
│   ├── rules/  (1)
│   │   └── token-stack.md  [3K]
│   ├── scripts/  (12)
│   │   ├── 03-measure-token-surfaces.py  [8K]
│   │   ├── ab-harness.sh  [9K]
│   │   ├── checksums.mjs  [5K]
│   │   ├── deploy.mjs  [8K]
│   │   ├── evaluate-benchmark.mjs  [7K]
│   │   ├── judgments.json  [10K]
│   │   ├── repo-audit.py  [12K]
│   │   ├── repos.txt  [710]
│   │   ├── scores100-v51.json  [30K]
│   │   ├── scrape_issues.py  [5K]
│   │   ├── smoke.mjs  [7K]
│   │   └── verify-package.mjs  [34K]
│   ├── src/  (1)
│   │   └── stack.mjs  [24K]
│   ├── templates/  (2)
│   │   ├── CLAUDE.md  [2K]
│   │   └── TASK-STATE.md  [1K]
│   ├── tests/  (4)
│   │   ├── contract/  (2)
│   │   │   ├── test-guard-all.mjs  [9K]
│   │   │   └── test-hook-contract-smoke.mjs  [7K]
│   │   ├── benchmark.test.mjs  [2K]
│   │   ├── cli.test.mjs  [10K]
│   │   └── stack.test.mjs  [20K]
│   ├── waves/  (2)
│   │   ├── WAVE-INDEX.md  [14K]
│   │   └── WAVE-STATE.md  [2K]
│   ├── MERGE-MANIFEST.tsv  [17K]
│   ├── package.json  [856]
│   ├── README.md  [10K]
│   └── SHA256SUMS.txt  [10K]
├── inventory/  (5)
│   ├── apply-manifest.py  [3K]
│   ├── collision-inventory.py  [20K]
│   ├── collision-inventory.tsv  [22K]
│   ├── PHASE-2-BEFUND.md  [8K]
│   └── PHASE-3-BEFUND.md  [7K]
├── messung/  (5)
│   ├── lauf-baseline/  (1)
│   │   └── corpus/  (10)
│   │       ├── __init__.py  [235]
│   │       ├── cmd_tools.py  [2K]
│   │       ├── config_tools.py  [2K]
│   │       ├── file_tools.py  [19K]
│   │       ├── jetbrains_plugin_client.py  [7K]
│   │       ├── jetbrains_tools.py  [7K]
│   │       ├── memory_tools.py  [2K]
│   │       ├── symbol_tools.py  [16K]
│   │       ├── tools_base.py  [16K]
│   │       └── workflow_tools.py  [5K]
│   ├── antwortschluessel.txt  [4K]
│   ├── corpus.sha256  [895]
│   ├── protokollkopf-baseline.txt  [780]
│   └── README.md  [3K]
├── .gitignore  [292]
├── BASELINE-REFERENZAUFGABE.md  [9K]
├── PHASE-0-PROTOKOLL.md  [11K]
├── PHASE-1-PROTOKOLL.md  [6K]
├── STATUS.md  [10K]
└── TREE.md  [12K]


### B — Betriebsort  ~/.claude/token-stack/
.
├── bin/  (1)
│   └── claudestack.mjs  [7K]
├── config/  (7)
│   ├── bash-pilot-reference.json  [2K]
│   ├── context-surface-owners.json  [17K]
│   ├── native-token-limits.example.jsonc  [3K]
│   ├── plugin-diet.md  [4K]
│   ├── settings.patch.json  [6K]
│   ├── token-stack.default.json  [537]
│   └── token-stack.schema.json  [2K]
├── docs/  (12)
│   ├── ARCHITECTURE.md  [11K]
│   ├── BENCHMARK.md  [9K]
│   ├── DECISIONS.md  [12K]
│   ├── DEFEKTE.md  [25K]
│   ├── LADDER.md  [5K]
│   ├── MESSPLAN.md  [6K]
│   ├── MESSPROTOKOLL.template.md  [3K]
│   ├── MIGRATION.md  [13K]
│   ├── REPO-MATRIX.md  [20K]
│   ├── ROLLOUT.md  [6K]
│   ├── SECURITY.md  [9K]
│   └── WAVES.md  [3K]
├── evidence/  (4)
│   ├── gpt56/  (7)
│   │   ├── 01-validation-crosswalk-5point.md  [29K]
│   │   ├── 02-squeez-rtk-ladder-reference-audit.md  [13K]
│   │   ├── 03-file-token-metrics.csv  [11K]
│   │   ├── 03-file-token-metrics.json  [31K]
│   │   ├── 04-second-validation-100point.md  [25K]
│   │   ├── 05-final-consolidated-token-stack.md  [23K]
│   │   └── 06-incoming-reconciliation.md  [41K]
│   ├── k3/  (19)
│   │   ├── issues/  (3)
│   │   │   ├── issues_out.txt  [21K]
│   │   │   ├── issues_out2.txt  [5K]
│   │   │   └── issues_out3.txt  [10K]
│   │   ├── changes.md  [13K]
│   │   ├── claude-token-stack-evaluierung-und-merge.md  [29K]
│   │   ├── finaler-abgleich.md  [12K]
│   │   ├── K3SWARM-REVISION-3RUNDE.md  [5K]
│   │   ├── KONZEPT.md  [19K]
│   │   ├── ladder-config.json  [7K]
│   │   ├── ladder-ledger.mjs  [10K]
│   │   ├── ladder-retrieve-filter.mjs  [8K]
│   │   ├── ladder-retrieve-gate.mjs  [10K]
│   │   ├── MASTERPLAN.md  [7K]
│   │   ├── plan.md  [2K]
│   │   ├── README.md  [7K]
│   │   ├── review-bericht.md  [13K]
│   │   ├── SQUEEZ-RTK-LADDER-ANALYSE.md  [26K]
│   │   ├── VALIDIERUNG.md  [11K]
│   │   ├── vergleich-4wege.md  [22K]
│   │   ├── verifikationsbericht-claudestack.md  [19K]
│   │   └── zweitvalidierung-update.md  [17K]
│   ├── opus5/  (6)
│   │   ├── bash-owner-dispatch.config.example.json  [3K]
│   │   ├── bash-owner-dispatch.mjs  [14K]
│   │   ├── hooks.settings.example.json  [1K]
│   │   ├── KONZEPT-v5.md  [43K]
│   │   ├── MASTERPLAN.md  [4K]
│   │   └── README.md  [5K]
│   └── README.md  [3K]
├── examples/  (1)
│   └── benchmark-runs.example.jsonl  [582]
├── hooks/  (2)
│   ├── optional/  (9)
│   │   ├── lib/  (2)
│   │   │   ├── nudge-budget.mjs  [9K]
│   │   │   └── token-stack-shared.mjs  [8K]
│   │   ├── bash-size-feedback.mjs  [5K]
│   │   ├── claude-hook-capability-canary.mjs  [14K]
│   │   ├── ctx-used-marker.mjs  [2K]
│   │   ├── prefix-budget.mjs  [29K]
│   │   ├── read-context-guard.mjs  [9K]
│   │   ├── read-slice-guard.mjs  [4K]
│   │   ├── reread-guard.mjs  [4K]
│   │   └── session-economy.mjs  [21K]
│   └── claudestack.mjs  [308]
├── rules/  (1)
│   └── token-stack.md  [3K]
├── scripts/  (12)
│   ├── 03-measure-token-surfaces.py  [8K]
│   ├── ab-harness.sh  [9K]
│   ├── checksums.mjs  [5K]
│   ├── deploy.mjs  [8K]
│   ├── evaluate-benchmark.mjs  [7K]
│   ├── judgments.json  [10K]
│   ├── repo-audit.py  [12K]
│   ├── repos.txt  [710]
│   ├── scores100-v51.json  [30K]
│   ├── scrape_issues.py  [5K]
│   ├── smoke.mjs  [7K]
│   └── verify-package.mjs  [34K]
├── src/  (1)
│   └── stack.mjs  [24K]
├── templates/  (2)
│   ├── CLAUDE.md  [2K]
│   └── TASK-STATE.md  [1K]
├── tests/  (4)
│   ├── contract/  (2)
│   │   ├── test-guard-all.mjs  [9K]
│   │   └── test-hook-contract-smoke.mjs  [7K]
│   ├── benchmark.test.mjs  [2K]
│   ├── cli.test.mjs  [10K]
│   └── stack.test.mjs  [20K]
├── waves/  (2)
│   ├── WAVE-INDEX.md  [14K]
│   └── WAVE-STATE.md  [2K]
├── capabilities.json  [3K]
├── fragment.json  [580]
├── MERGE-MANIFEST.tsv  [17K]
├── package.json  [856]
├── README.md  [10K]
├── SHA256SUMS.txt  [10K]
└── token-stack.json  [45]
```

### C — Geänderte Systemdateien in ~/.claude/

```
~/.claude/
├── settings.json                              GEÄNDERT — env-Deckel (Phase 1) + Hook-Fragment (Phase 6)
├── settings.json.bak-phase1-20260813-2130     Backup vor den env-Deckeln
├── settings.json.bak-fragment-20260813-2242   Backup vor der Fragment-Übernahme
└── token-stack/                               NEU — Betriebsort (Abschnitt B)

~/.npmrc                                       GEÄNDERT — prefix entfernt (nvm-Konflikt)
~/.npmrc.bak-20260813                          Backup
```

### Herkunft der Artefakte

| Ort | Was | Entstanden in |
|---|---|---|
| `PHASE-0-PROTOKOLL.md` | Ist-Aufnahme, Token-Messung, Hook-Inventur, Gate-Bewertung | Phase 0 |
| `PHASE-1-PROTOKOLL.md` | env-Deckel, Begründungen, Revert-Weg | Phase 1 |
| `inventory/collision-inventory.{py,tsv}` | 112 Dateien mit Hash, Kollisionen, Mutatoren, Aktion | Phase 2 |
| `inventory/PHASE-2-BEFUND.md` | Bilanz, Dubletten, Fail-loud-Liste | Phase 2 |
| `inventory/apply-manifest.py` | reproduzierbarer Materialisierer, schützt Zieldateien | Phase 3 |
| `inventory/PHASE-3-BEFUND.md` | Gate-Prüfung, Befunde P3-1 bis P3-5 | Phase 3 |
| `claude-code-token-stack/` | das Zielpaket | Phasen 3–5, zwei Abnahmen |
| `BASELINE-REFERENZAUFGABE.md` | Messaufgabe, Korpus-Prozedur, Protokollkopf | Phase 6 (Vorbereitung) |
| `messung/` | Antwortschlüssel, Korpus-Hashes, Protokollkopf, Anleitung | Phase 6 (Vorbereitung) |
| `STATUS.md`, `TREE.md` | Übersicht und Baum | laufend |
| `~/.claude/token-stack/` | Betriebsstand inkl. Laufzeitzustand | Transfer (Z5) |
