# Wave State

_Updated: 2026-08-13_

## Active (normally 1, max 2)

- **00-2 · Defekte D1–D5 schließen** — teilweise erledigt.
  - D1 `prefix-budget.mjs` unterzählt Gesetz-I-Kollisionen bei Alternations-Matchern → **behoben.** Die Kollisionserkennung löst den Matcher jetzt in die Menge der Tools auf, auf die er feuert. Gegenprobe an der realen Konfiguration: **8 Befunde statt vorher 3**, darunter 5 Handler auf `PreToolUse:Bash`.
  - D2 `test-guard-all.mjs` mit hartkodierten Pfaden → **im Paket behoben** durch `scripts/verify-stack.mjs` mit Fail-loud-Block. Die Originaldatei bleibt unverändert; wer sie weiter nutzt, muss die Pfade relativieren.
  - D3 Executable-Bit und Manifest-Konsistenz des Vorgängerpakets → **offen**, betrifft `GPT55SOL_PRO/`.
  - D4 `ladder-config.json`-Drift (`enabled` live `false`, Repo `true`) → **offen**, bewusst.
  - D5 KIMI-Guard-Referenz mit String-Form → **erledigt durch Ausschluss.** Code nicht übernommen, Muster übernommen.

## Next

- **00-1 · Inventur** — nicht begonnen. Voraussetzung für alles Weitere.

## Blocked

- **05-1 · Proxy** — bis ein Restproblem nach Phase 4 belegt ist.

## Shipped

- Konzept v5 mit acht aufgelösten Konflikten — 2026-08-13
- Katalog v4.1, 375 Einträge, gegen die GPT56-Union gegengerechnet (365 kanonisch, vollständig überdeckt) — 2026-08-13
- `bash-owner-dispatch.mjs`, 9/9 Selbsttests — 2026-08-13
- `prefix-budget.mjs` mit D1-Fix, 7/7 Selbsttests — 2026-08-13
- `repo-audit.py`, reproduziert A/B/C der 1-bis-100-Bewertung — 2026-08-13
- `ab-harness.sh` mit den acht Messregeln aus der Ladder-Serie — 2026-08-13

## Offene Fragen

- **K10:** Wie groß ist der Prefix-Posten der 25 aktiven Plugins tatsächlich? Nur per `/context` auf der Zielmaschine messbar. Blockiert die Erfolgsbewertung von 01-1.
- `codegraph`: `CLAUDE.md` setzt `.codegraph/` und einen aktiven rtk-Hook voraus, `enabledPlugins` führt codegraph nicht, `permissions.allow` erlaubt `mcp__codegraph__.*`. Zu klären, bevor 03-2 läuft.
