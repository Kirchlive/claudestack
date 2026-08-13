# Claude Code Token-Stack — v3

Stand: 2026-08-10 · Zusammenführung zweier unabhängiger Rechercheduchgänge.

## Start hier

1. `token-stack-konzept-v3.md` lesen — Abschnitte 3 (die zwei Gesetze) und 6 (Zielstack) sind das Wesentliche.
2. `node prefix-budget.mjs --report` ausführen. Das ist die erste Messung und entscheidet, ob der Rest lohnt.
3. `context-surface-owners.yaml` befüllen und alle `verify: true`-Punkte klären.
4. Doppelte Mutatoren auf derselben Fläche auflösen, **bevor** irgendein neues Werkzeug installiert wird.
5. Erst danach Stufe 1 (native Deckel) und Stufe 2 (Capability-Canary).

## Dateien

| Datei | Inhalt |
|---|---|
| `token-stack-konzept-v3.md` | Referenzfassung: zwei Gesetze, neun Flächen, Zielstack, Regelwerk, Migration |
| `repo-catalog-v3.json` | 251 Repositories, Schema 3, mit `cache_risk` und `prefix_cost` |
| `repo-catalog-v3.md` | Dieselbe Menge nach Flächen gruppiert, lesbar |
| `token-efficiency.rules.v3.md` | Kompakte Laufzeitregeln zum Ablegen als Referenzdatei |
| `context-surface-owners.yaml` | Owner-Registry, vorbefüllt, mit markierten Konflikten |
| `prefix-budget.mjs` | Regel R1: read-only SessionStart-Messung des Prefix-Budgets |
| `CHANGELOG.md` | Was gegenüber Durchgang 1 und Revision 2 geändert wurde |

## prefix-budget.mjs

```bash
node prefix-budget.mjs --self-test    # 7 Prüfungen gegen ein temporäres Verzeichnis
node prefix-budget.mjs --report       # menschenlesbarer Bericht
node prefix-budget.mjs --json         # Rohdaten
```

Als Hook (append-only, cache-neutral, blockiert nie):

```jsonc
{
  "hooks": {
    "SessionStart": [
      { "hooks": [ { "type": "command", "command": "node \"$HOME/.claude/hooks/prefix-budget.mjs\"", "timeout": 10 } ] }
    ]
  }
}
```

Budgets lassen sich über `~/.claude/prefix-budget.config.json` überschreiben
(`tokensPerSkillListing`, `tokensPerMcpServerGuess`, `budgets`).

Das Skript liest nur. Es schreibt nichts, ändert nichts und beendet sich auf
jedem Pfad mit 0. Die Tokenzahlen sind Schätzungen zum Vergleichen — der
belastbare Wert kommt aus `/context`.

## Was dieses Paket bewusst nicht enthält

Keinen Guard, keinen Canary, keinen Installer. Diese Artefakte liegen in
Revision 2 in guter Qualität vor (Checksummen geprüft, Syntax valide, alle
tragenden Repositories verifiziert) und werden hier nicht dupliziert, sondern
eingeordnet: Revision 2 liefert die Betriebsdisziplin für **eine** Fläche,
dieses Paket die Reihenfolge über **alle** Flächen.

Ein Hinweis zur Installation aus Revision 2: der dortige Installer schreibt nach
`~/.claude/hooks/bash-dump-guard.mjs`. Liegt dort bereits ein eigener
produktiver Guard, wird er ersetzt — mit Backup, aber `settings.json` zeigt
danach auf fremden Code, der ohne bestandenen Live-Probe in Shadow läuft.
Fremde Reducer unter eigenem Namen installieren und aus einem Dispatcher
aufrufen (Regel R2).
