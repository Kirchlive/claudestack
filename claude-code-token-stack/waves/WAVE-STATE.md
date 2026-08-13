# Wave State

_Zurückgesetzt: 2026-08-13 — die Vorgängerfassung trug den Fortschritt einer
fremden Maschine (AP-3.7). Ab hier wird ausschließlich eigener Fortschritt
eingetragen._

## Active (normalerweise 1, höchstens 2)

- **00-0 · Baseline und Subtraktion (= Phase 0)** — teilweise erledigt.
  Ist-Aufnahme steht (`PHASE-0-PROTOKOLL.md`): keine Root-`CLAUDE.md`, null
  aktivierte Plugins, null mutierende Hooks, 280 Token auf den dateibasierten
  Flächen. Offen bleibt die `/context`-Messung — sie kann nur der Nutzer
  ausführen und ist die Referenzzahl für Phase 6.

## Next

- **00-1 · Inventur** — erledigt als Phase 2 (`inventory/collision-inventory.tsv`,
  `MERGE-MANIFEST.tsv`, `inventory/PHASE-2-BEFUND.md`).
- **02-x · Träger und Daten** — laufend als Phase 3.

## Blocked

- **05-1 · Proxy** — bis ein Restproblem nach der Shadow-Messung belegt ist.
- **Enforce** — bis das Net-Win-Gate der Phase 6 eine gepaarte Differenz über
  der Streuung zeigt.

## Shipped

- **02-1 · Ein Owner auf der Bash-Fläche** — 13.08.2026. Fragment von Hand und
  atomar in `~/.claude/settings.json` übernommen (Sicherung
  `settings.json.bak-fragment-20260813-2242`); die bestehenden ccstatusline-Hooks
  blieben unberührt. `node bin/claudestack.mjs doctor`: ein Owner auf
  `PostToolUse:Bash`, **null** auf `PreToolUse:Bash`.
- **02-2 · Capability-Canary** — 13.08.2026. Probe aus einer laufenden Sitzung,
  beide Fähigkeiten `pass` (`PreToolUse.updatedInput`, `PostToolUse.updatedToolOutput`),
  Record gültig bis 2026-09-12. Dispatcher seither auf `shadow`; No-op belegt
  (30 KB Bash-Ausgabe → 0 B stdout, 0 B stderr) gegen den `enforce`-Kontrast.

_Gemessen ist damit noch nichts — `shadow` beobachtet, die Referenzzahl der
Phase 6 fehlt weiterhin._

---

**Regel für diese Datei:** Nur Einträge mit eigenem Nachweis. Übernommene
Fremdbefunde gehören nach `evidence/`, nicht hierher.

**Wo die Nachweise liegen:** `PHASE-*-PROTOKOLL.md` und `inventory/*` gehören zum
Ausrollvorhaben (`/home/rob/.claude-tweak/`), **nicht zum Paket** — sie beschreiben
diese Maschine. Ein Empfänger legt seine eigenen an derselben Stelle an und erhebt
jede Statusangabe hier neu (Befund B-3/M-16).
