---
id: CTS-README-001
schema: claudestack.document/v1
document_type: package_readme
title: Claude Code Token Stack
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Claude Code Token Stack

Kleine, native-first Schutzschicht für Claude Code. Sie hält Hook-Ownership
eindeutig, reduziert nur geeignete große Bash-Ausgaben, bewahrt die vollständige
redigierte Tool-Response zur Wiederherstellung und verhindert teure Ganzdatei-/Wiederholungs-Reads
mit einmalig übergehbaren Hinweisen.

Der Stack verspricht keine feste Token- oder Kostenersparnis. Ob er für ein Repo
nützt, entscheidet ein lokaler A/B-Lauf pro akzeptierter Aufgabe.

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
| `bin/claudestack.mjs` | CLI: `doctor`, `fragment`, `recover`, `prune`, `hook` |
| `hooks/claudestack.mjs` | lokaler Hook-Dispatcher |
| `config/token-stack.default.json` | versionierte Startwerte |
| `config/token-stack.schema.json` | JSON-Schema für Konfiguration v1 |
| `config/context-surface-owners.json` | maschinenlesbare Owner-/Exklusivitätsregeln |
| `scripts/evaluate-benchmark.mjs` | gepaarte JSONL-Auswertung und Promotion-Gate |
| `SHA256SUMS.txt` | Prüfsummen aller ausgelieferten regulären Dateien außer Manifest selbst; `.DS_Store` ist verboten |
| `templates/CLAUDE.md` | kurze, stabile Repo-Regel |
| `templates/TASK-STATE.md` | optionaler Crash-/`/clear`-Checkpoint |
| `rules/token-stack.md` | ausführbare Arbeitsregeln für Claude Code |
| `validate/06-incoming-reconciliation.md` | kanonischer Abgleich der korrigierten Meta-/Agent-Daten, normatives Errata-Overlay und Kreuzachsenentscheidung |
| `docs/` | Architektur, Entscheidungen, Migration, Gates und Betrieb |

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
Testmutation an Pfad, Typ, Inhalt oder POSIX-Modebits. Drei Testdateien und deren
aktuell 32 vollständig bestandene Tests sind Teil des Freigabevertrags.

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
