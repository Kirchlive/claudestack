---
id: CTS-README-001
schema: claudestack.document/v1
document_type: package_readme
title: Claude Code Token Stack
version: 2
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v2
---

# Claude Code Token Stack

Kleine, native-first Schutzschicht für Claude Code. Sie hält Hook-Ownership
eindeutig, reduziert nur geeignete große Bash-Ausgaben, bewahrt die vollständige
redigierte Tool-Response zur Wiederherstellung und verhindert teure Ganzdatei-/Wiederholungs-Reads
mit einmalig übergehbaren Hinweisen.

Der Stack verspricht keine feste Token- oder Kostenersparnis. Ob er für ein Repo
nützt, entscheidet ein lokaler A/B-Lauf pro akzeptierter Aufgabe.

## Herkunft

Version 2 führt drei unabhängig entstandene Pakete zusammen — **nicht durch
Merge, sondern durch Träger und Pfropfung** (ADR-015):

| Quelle | Rolle | Was daraus stammt |
|---|---|---|
| `gpt56sol_claude-code-token-stack` | **Träger** | Runtime: Dispatcher, Schema, Testsuite, CLI, Verifier, Prüfsummen |
| `k3swarm_claude-token-stack-paket` | Pfropfung | die acht optionalen Flächenhooks, Kontrakttests, native Deckelwerte, Regelwerk-Inhalte |
| `opus5_claude-token-stack` | Pfropfung | Governance: `waves/`, Defektregister, A/B-Messharness, Evidenzbücher |

Ein Merge war auf den Mutator-Flächen ausgeschlossen: die drei Pakete brachten
**drei konkurrierende Bash-Output-Owner** mit, und Gesetz I erlaubt genau einen.
Die beiden nicht gewählten liegen unter `evidence/` — lesbar, aber nicht lauffähig.

Jede übernommene Datei ist in [`MERGE-MANIFEST.tsv`](MERGE-MANIFEST.tsv) mit
Quelle, Zielpfad, SHA-256, Fläche und Begründung verzeichnet. Wer wissen will,
woher eine Datei kommt und warum sie hier liegt, findet es dort — und nur dort.

## Betriebsvertrag

- Native Claude-Code-Funktionen zuerst: enge Suche, Read-Slices, `/context`,
  `/usage`, `/compact` und `/clear`.
- Kein `PreToolUse:Bash`-Mutator im Default. Falls später aktiviert: höchstens ein
  Command-Rewriter.
- Im ausgelieferten, nicht installierten Paket ist kein Bash-Output-/Read-Owner
  aktiv. Nach bestandenem Shadow-/Canary-Gate wird `hooks/claudestack.mjs`
  jeweils alleiniger Owner für `PostToolUse:Bash` und Read-Advisory.
- Read-Guard und Bash-Output-Guard laufen nach dieser Promotion über denselben
  lokalen Dispatcher.
- Pro Aufgabe entweder native Suche oder genau ein zusätzlicher Retrieval-Owner.
- `ccusage` ist optionaler read-only Observer, kein Reducer.
- Größenbedingte Bash-Elision nur mit privatem, begrenztem Raw-Artefakt. Dieses
  enthält die vollständige Response nach best-effort Secret-Redaction, nicht
  zwingend die ursprünglichen Secretbytes.
- Rollout: `shadow` → begrenzter Canary mit `enforce` → breiteres `enforce` →
  bei Gate-Verletzung sofort `shadow` oder `off`.
- Squeez-RTK-Ladder dient als Referenz für Mess- und Recovery-Muster, nicht als
  zu kopierende Produktionskonfiguration.

## Dateien

| Pfad | Vertrag |
|---|---|
| `bin/claudestack.mjs` | CLI: `doctor`, `fragment`, `canary`, `evidence`, `recover`, `prune`, `hook` |
| `hooks/claudestack.mjs` | lokaler Hook-Dispatcher |
| `config/token-stack.default.json` | versionierte Startwerte |
| `config/token-stack.schema.json` | JSON-Schema für Konfiguration v1 |
| `config/context-surface-owners.json` | maschinenlesbare Owner-/Exklusivitätsregeln |
| `scripts/evaluate-benchmark.mjs` | gepaarte JSONL-Auswertung und Promotion-Gate |
| `SHA256SUMS.txt` | Prüfsummen aller ausgelieferten regulären Dateien außer Manifest selbst; `.DS_Store` ist verboten |
| `templates/CLAUDE.md` | kurze, stabile Repo-Regel |
| `templates/TASK-STATE.md` | optionaler Crash-/`/clear`-Checkpoint |
| `rules/token-stack.md` | ausführbare Arbeitsregeln für Claude Code |
| `hooks/optional/` | acht Flächenhooks — **im Paket, aber nicht registriert** (ADR-016) |
| `waves/` | Rolloutplan und Zustandsdatei des eigenen Fortschritts |
| `MERGE-MANIFEST.tsv` | Provenienz: eine Zeile je übernommener Datei |
| `evidence/` | Archiv der drei Quellpakete — **im Betrieb nicht gelesen** |
| `evidence/gpt56/06-incoming-reconciliation.md` | kanonischer Abgleich der korrigierten Meta-/Agent-Daten, normatives Errata-Overlay und Kreuzachsenentscheidung |
| `docs/` | Architektur, Entscheidungen, Migration, Gates und Betrieb |

## Vor dem Schnellstart: Phase 0

> **Dieses Paket ist nicht der erste Schritt.** Der gemessen größte Posten ist
> der Always-on-Prefix, nicht die Bash-Ausgabe: eine Root-`CLAUDE.md` von 8,4 KB
> kostet **1.975 Token** und wird bei jedem dateiberührenden Tool-Call neu
> injiziert. Diese Zahl ist der einzige Wert des Korpus, den zwei Modelle
> unabhängig voneinander aufs Token identisch gemessen haben.
>
> Bevor irgendetwas installiert wird, gehört deshalb erledigt:
>
> 1. **Baseline messen** — `/context` mit einer festen, wiederholbaren Aufgabe.
>    Diese Zahl ist die Referenz für alles Weitere.
> 2. **Plugins kürzen** — auf das tatsächlich Genutzte. Toggles nur *zwischen*
>    Sessions; ein Toggle in laufender Session schreibt gecachten User-Content
>    vollständig neu und verfälscht die Messung.
> 3. **Root-`CLAUDE.md` entschlacken** — harter Deckel 4 KB, Verhaltensregeln
>    genau einmal statt als Plugin-Dauerfeuer.
> 4. **Mutierende `PreToolUse:Bash`-Hooks auf höchstens einen reduzieren.**
> 5. **Erneut messen.** Die Differenz ist das Ergebnis von Phase 0 — erreicht
>    ohne eine Zeile Code aus diesem Paket.
>
> Wer diese Schritte überspringt, misst später den Dispatcher gegen eine
> Baseline, die selbst das Problem ist. Details: [`docs/MIGRATION.md`](docs/MIGRATION.md).

## Schnellstart

Voraussetzung: Node.js `>=18` gemäß `package.json`. Das Paket hat keinen
automatischen Installer.

1. Bestehende Settings prüfen:

   ```bash
   node bin/claudestack.mjs doctor
   ```

2. Hook-Fragment erzeugen:

   ```bash
   node bin/claudestack.mjs fragment > /tmp/claudestack-fragment.json
   ```

3. Fragment prüfen. Bestehende mutierende Bash-Output-Hooks entfernen. Danach
   Fragment manuell und atomar in Claude-Code-Settings übernehmen. `fragment`
   verändert keine Settings.

4. Erneut prüfen:

   ```bash
   node bin/claudestack.mjs doctor
   ```

5. Mit `mode: "shadow"` starten. Erst nach bestandenen Gates einen kleinen
   Canary auf `mode: "enforce"` umstellen.

`doctor [settings]` verwendet ohne Argument
`$CLAUDE_CONFIG_DIR/settings.json`, sonst `~/.claude/settings.json`.

## Konfiguration

Priorität, hoch nach niedrig:

1. `$CLAUDE_TOKEN_STACK_CONFIG`
2. `./.claude/token-stack.json`
3. `$CLAUDE_CONFIG_DIR/token-stack.json`
4. eingebaute Defaults aus `config/token-stack.default.json`

`mode` kennt nur `off`, `shadow` und `enforce`. Canary ist kein vierter Modus,
sondern ein begrenzter Rollout von `enforce` auf ausgewählte Repos/Sessions.
Schema vor Übernahme validieren; unbekannte oder falsch typisierte Werte nicht
produktiv ausrollen.

## CLI-Vertrag

```text
node bin/claudestack.mjs doctor [settings]
node bin/claudestack.mjs fragment
node bin/claudestack.mjs recover <24-hex-id>
node bin/claudestack.mjs prune
node bin/claudestack.mjs hook
```

- `doctor`: JSON-Report; Exit `0` bei `ok: true`, Exit `1` bei Fehler-Findings
  oder I/O-Fehlern.
- `fragment`: Settings-Fragment auf stdout; keine Dateiänderung.
- `recover`: gespeichertes Artefakt auf stdout; ID ist exakt 24 Hex-Zeichen.
- `prune`: JSON mit Anzahl entfernter, abgelaufener Artefakte.
- `hook`: liest ein Claude-Hook-Ereignis von stdin; Ergebnis-JSON oder bewusst
  leere stdout. Parser-/Hookfehler sind fail-open.
- Ungültige Nutzung: JSON-Fehler auf stderr, Exit `2`; Laufzeit-/Dateifehler:
  JSON-Fehler, Exit `1`.

## Recovery

Bei ersetzter Bash-Ausgabe enthält der Footer eine Artefakt-ID:

```bash
node bin/claudestack.mjs recover 0123456789abcdef01234567
```

Artefakte liegen unter dem Claude-Konfigurationsverzeichnis in
`token-stack/state/artifacts/`. Verzeichnisrechte sind `0700`, Dateirechte
`0600`. `prune` wendet die konfigurierte Retention an. Artefakte können trotz
Redaction sensible Projektinhalte enthalten; nicht committen oder hochladen.

## Verifikation

```bash
npm test
npm run verify
node bin/claudestack.mjs doctor
node scripts/evaluate-benchmark.mjs /privater/pfad/runs.jsonl
```

`npm run verify` fordert eine exakte 1:1-Abdeckung aller ausgelieferten regulären
Dateien durch `SHA256SUMS.txt` und verwirft fehlende, zusätzliche, doppelte oder
ungültige Manifestpfade, `.DS_Store`, Symlinks und Spezialdateien. Tests starten
erst nach bestandenem Vorabcheck; ein zweiter Baum- und Hashcheck erkennt jede
Testmutation an Pfad, Typ, Inhalt oder POSIX-Modebits. Die Testdateien und ihre
vollständig bestandenen Tests sind Teil des Freigabevertrags; die verbindliche
Sollzahl steht in `scripts/verify-package.mjs` (`expectedTestCount`) und wird
dort bei jeder Testergänzung mitgeführt — eine Zahl in dieser Datei wäre die
zweite Wahrheit und würde driften.

Produktionsfreigabe braucht zusätzlich repräsentative A/B-Aufgaben gemäß
[`docs/BENCHMARK.md`](docs/BENCHMARK.md). Evaluator fordert mindestens zehn
vollständige Baseline-/Candidate-Paare, schreibt JSON und liefert Exit `0` nur
für `promote`, `1` für `reject` sowie `2` für `insufficient` oder ungültige
Nutzung/Daten. Lokale Byte-Reduktion, sichtbare Tokens und End-to-End-Kosten
sind getrennte Größen.

## Weiterführende Dokumente

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DECISIONS.md`](docs/DECISIONS.md)
- [`docs/MIGRATION.md`](docs/MIGRATION.md)
- [`docs/BENCHMARK.md`](docs/BENCHMARK.md)
- [`docs/WAVES.md`](docs/WAVES.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/REPO-MATRIX.md`](docs/REPO-MATRIX.md)
