# Defektregister

_Stand 2026-08-13 · alle Befunde in einer Sandbox reproduziert_

| ID | Artefakt | Befund | Nachweis | Status |
|---|---|---|---|---|
| **D1** | `prefix-budget.mjs` (OPUS5) | Gesetz-I-Kollisionen wurden auf dem **rohen Matcher-String** gruppiert. `"Bash"` und `"Bash\|Read\|Grep\|Glob\|Agent\|Task"` galten als zwei verschiedene Flächen. Auf der realen Konfiguration meldete das Werkzeug **3 Befunde statt 8** und **2 statt 5** Handler auf `PreToolUse:Bash` — genau die Kollision, die es finden soll. | `HOME=<real> node prefix-budget.mjs --report` vorher/nachher | **behoben** — Matcher wird in die Menge der Tools aufgelöst, auf die er feuert; Wildcards zählen auf jede konkrete Fläche mit. 7/7 Selbsttests. |
| **D2** | `test-guard-all.mjs` | Hartkodierte Pfade nach `/Users/rob/.claude/hooks/`. Fehlt der Pfad, liefert `spawnSync` kein stdout, `decision()` fällt auf `""` und die Suite wertet das als „durch". **Zehn Testfälle bestehen dadurch aus dem falschen Grund.** Derselbe Musterfehler wie in `ladder-ab.mjs`, wo `CONFIG` auf einen nicht existenten Pfad zeigte und Arm A still gar nichts umschaltete. | Rohlauf 33 FEHLGESCHLAGEN → Pfade korrigiert 16 → plus gültige `settings.json` ALLE BESTANDEN | **im Paket behoben** — `scripts/verify-stack.mjs` führt einen Fail-loud-Block: fehlende Prüfgegenstände werden am Ende gesondert ausgewiesen und zählen nie als bestanden. Die Originaldatei bleibt unverändert. |
| **D3** | `GPT55SOL_PRO/` | Shellskripte als Git-Modus `100644` statt `100755`; `SHA256SUMS.txt` und `package-manifest.json` erwarten `README.md`, ausgeliefert ist `README_gpt.md`. | `sha256sum -c` 33/34; `verify-package.sh` bricht an Zeile 77 ab | **offen** — betrifft das Vorgängerpaket. Im neuen Paket durch die Prüfungen „Dateimodi" und „Manifest" in `verify-stack.mjs` abgefangen. |
| **D4** | `ladder-config.json` | Drift: `hooks/` steht auf `enabled: false`, die Repo-Kopie auf `true`. Sonst byteidentisch. | `diff` über normalisiertes JSON, genau ein Feld | **offen, bewusst** — der Live-Zustand ist die Entscheidung aus Wave 02-1. Zu dokumentieren, nicht anzugleichen. |
| **D5** | KIMI-Guard-Referenzdesign | Gibt bei Built-in-Bash einen **String** als `updatedToolOutput` zurück. Die Objektform ist Pflicht; eine String-Ersetzung wird ignoriert. | Selbsttests des funktionsgeprüften Guards prüfen auf `updatedToolOutput.stdout`; Fixtures haben die Gestalt `{stdout, stderr, interrupted, isImage, exitCode}` | **erledigt durch Ausschluss** — Code nicht übernommen. Das Muster (Loop-Guard, Spill, Dedup) ist in den Dispatcher eingegangen; `bash-owner-dispatch.mjs` normalisiert eine String-Rückgabe einer Stufe zusätzlich zurück in die Objektform. |

## Was aus diesen fünf Defekten als Regel folgt

**Zwei der fünf sind derselbe Fehler.** `ladder-ab.mjs` und `test-guard-all.mjs` liefen beide still weiter, als ihr Prüfgegenstand fehlte, und lieferten Zahlen, die wie Ergebnisse aussahen. Im ersten Fall wären beide A/B-Arme mit aktiver Leiter gelaufen — der Vergleich wäre wertlos gewesen, ohne dass es jemand gemerkt hätte.

> **Regel für jedes Skript in diesem Paket:** Ein Harness, dessen Prüfgegenstand fehlt, **muss scheitern**. Nie „ok", nie „übersprungen". `verify-stack.mjs` und `ab-harness.sh` setzen das durch; `bash-owner-dispatch.mjs` meldet eine fehlende Stufe auf stderr und in den Metriken, bleibt aber für den Tool-Aufruf fail-open — Blockieren wäre hier die schlechtere Wahl.

Die zweite übertragbare Lehre steckt in D1: **ein Prüfwerkzeug, das die eigene Regel nur auf dem einfachsten Fall durchsetzt, erzeugt falsche Sicherheit.** Der Alternations-Matcher ist kein Sonderfall, sondern die übliche Schreibweise für Hooks, die mehrere Tools abdecken.
