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
- **Betriebsgewinn des Dispatchers** — bis belegt ist, *wie oft* im Alltag
  Bash-Ausgaben über der Eingriffsschwelle anfallen. Der Kürzungsgrad ist
  gemessen (82,4 %), die Häufigkeit nicht: die Shadow-Periode endete nach vier
  Stunden statt der geplanten Tage.

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

- **02-3 · Enforce** — 14.08.2026, 02:51. Phase 7 entschieden, Dispatcher auf
  `enforce`. Belegt ist der **Kürzungsgrad**: 9.650 B → 1.697 B = 82,4 % auf
  qualifizierten Aufrufen, direkt gemessen (dieselbe Ausgabe einmal durch den
  Dispatcher, einmal nicht). Recovery-Pfad live geprüft, Betriebsnachweis mit
  echtem Eingriff vorhanden (`state/artifacts/`).
  **Nicht nach Plan erfüllt:** Das Net-Win-Gate verlangte ≥ 3 gepaarte
  Replikate je Aufgabenklasse. Vorhanden sind zwei Läufe Klasse A (Kontrollarm,
  strukturell effektblind — keine Ausgabe erreichte die Eingriffsschwelle) und
  **ein** Lauf Klasse B; im `enforce`-Arm wurde nie eine Sitzung gemessen.
  Das Verfahren wurde **ersetzt**, nicht durchlaufen: der Session-Vergleich
  streute mit 7,1–11,4 % stärker als der Effekt, der direkte Nachweis hat
  Streuung null. Begründung in `PHASE-7-ENTSCHEIDUNG.md` §2.

_Belegt ist ein Kürzungsgrad, kein Betriebsgewinn. Was fehlt, ist die
Häufigkeit qualifizierter Aufrufe im Alltag — sie steht unter „Blocked"._

---

**Regel für diese Datei:** Nur Einträge mit eigenem Nachweis. Übernommene
Fremdbefunde gehören nach `evidence/`, nicht hierher.

**Wo die Nachweise liegen:** `PHASE-*-PROTOKOLL.md` und `inventory/*` gehören zum
Ausrollvorhaben (`/home/rob/.claude-tweak/`), **nicht zum Paket** — sie beschreiben
diese Maschine. Ein Empfänger legt seine eigenen an derselben Stelle an und erhebt
jede Statusangabe hier neu (Befund B-3/M-16).
