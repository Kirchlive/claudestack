# PHASE-1-PROTOKOLL — Native env-Deckel

**Ausgeführt:** 2026-08-13 · **Datei:** `~/.claude/settings.json` · **Backup:** `~/.claude/settings.json.bak-phase1-20260813-2130`
**Bezug:** `repos_v2/UMSETZUNGSPLAN-claude-code-integration.md` §PHASE 1 (AP-1.1 … AP-1.6)
**Gate P1:** je Variable eine Notiz „gesetzt / Wirkung beobachtet / behalten oder revertiert"

---

## 1. Grundsatz und Grenze dieser Phase

Der Plan verlangt die Deckel **einzeln**, damit jeder Effekt isoliert messbar bleibt, mit den unveränderten Defaults als Kontrollarm. Diese Bedingung ist auf dieser Maschine **derzeit nicht erfüllbar**: die `/context`-Baseline (AP-0.1/AP-0.3) fehlt, es gibt also keine Referenz, gegen die ein einzelner Deckel gemessen werden könnte.

**Entscheidung vom 13.08.2026 (Nutzer):** Die Baseline wird **mit gesetzten Deckeln** erhoben. Sie sind damit Bestandteil der Referenzumgebung und bleiben **bis zum Abschluss von Phase 7 unverändert** — ein Wechsel mitten in einer Serie macht sie ungültig (MESSPLAN §3.8). Der Effekt der einzelnen Deckel bleibt dadurch dauerhaft ungemessen; sie wirken aber in beiden Armen der A/B-Messung gleich und verfälschen den Dispatcher-Vergleich nicht. Einzelheiten und Aufgabentext: `BASELINE-REFERENZAUFGABE.md`.

Konsequenz, offen ausgewiesen statt überspielt: die vier Werte sind **gesetzt, aber nicht gemessen**. Gate P1 ist damit zur Hälfte erfüllt — die Setzung ist dokumentiert und einzeln revertierbar, die Wirkungsbeobachtung steht aus. Das ist kein Formfehler: L-3 („Messung vor Installation") gilt für *Werkzeuge*, die etwas mutieren. Die env-Deckel sind native Mechanismen und stehen nach L-2 („nativ zuerst") ausdrücklich **vor** jeder Drittkompression. Sie zu setzen ist deshalb zulässig; sie unbeobachtet zu lassen wäre es nicht.

---

## 2. Gesetzte Werte

| AP | Variable | Wert | nativer Default | Wirkung | Risiko |
|---|---|---|---:|---|---|
| AP-1.1 | `MAX_MCP_OUTPUT_TOKENS` | `"8000"` | 25000 | deckelt externe Tool-Payloads, bevor Drittkompression überhaupt in Betracht kommt | gering — betrifft nur MCP-Antworten |
| AP-1.2 | `BASH_MAX_OUTPUT_LENGTH` | `"24000"` | — | bewusst **unter** der gemessenen ~32-KB-Auslagerungsgrenze; der optionale Guard leitet seine Budgets daraus ab | mittel — lange Bash-Ausgaben werden gekürzt |
| AP-1.3 | `TASK_MAX_OUTPUT_LENGTH` | `"12000"` | — | begrenzt Subagent-Rückgaben | mittel — betrifft die Fork-Berichte dieser Umsetzung |
| AP-1.4 | `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | `"16000"` | — | Antwort-Decke | **hoch** — kann Vollständigkeit kosten, der Plan nennt es ausdrücklich als zu pilotieren |

Alle vier wirken **ab dem nächsten Start** von Claude Code.

## 3. Nicht gesetzt — mit Begründung

| AP | Variable | Entscheidung | Begründung |
|---|---|---|---|
| AP-1.5 | `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | **nicht gesetzt** | `autoCompactEnabled` steht auf `false`. Ein Schwellenwert für eine abgeschaltete Kompaktierung ist per Konstruktion wirkungslos — er würde als „gesetzt" im Protokoll stehen und nichts tun. Der Plan führt unter Fehlerregister F5 ohnehin den Verdacht, dass die Variable im `settings`-env unwirksam ist und als Shell-Export gesetzt werden muss. **Vorbedingung für einen späteren Versuch:** zuerst `autoCompactEnabled` auf `true`, dann Wirkung über das Kompaktierungsverhalten verifizieren — nicht über die bloße Anwesenheit der Variable. |
| AP-1.6 | `ENABLE_TOOL_SEARCH` | **nicht angefasst** | Bereits gesetzt, aber nicht hier: `~/.bashrc:163` exportiert `true`, Claude Code erbt den Wert als Kindprozess (Defekt D14, Korrektur P0-4 im Phase-0-Protokoll). Der Plan sagt „nicht setzen", die Meta-Validierung §9 empfiehlt `true` als tokenminimal — beide warnen vor `false`. Der vorgefundene Zustand folgt der Meta-Validierung. Er bleibt unverändert, ist aber **kein neutraler Kontrollarm** für eine spätere Messung der Tool-Search-Fläche. |

---

## 4. Revert-Weg

Vollständig: `cp ~/.claude/settings.json.bak-phase1-20260813-2130 ~/.claude/settings.json`

Einzeln, wenn ein Deckel Vollständigkeit kostet — die betreffende Zeile aus dem `env`-Block entfernen. Reihenfolge nach Risiko absteigend, also zuerst:

1. `CLAUDE_CODE_MAX_OUTPUT_TOKENS` — Symptom: Antworten brechen ab oder wirken unvollständig
2. `TASK_MAX_OUTPUT_LENGTH` — Symptom: Subagent-Berichte enden abrupt
3. `BASH_MAX_OUTPUT_LENGTH` — Symptom: Kommandoausgaben sind sichtbar gekürzt
4. `MAX_MCP_OUTPUT_TOKENS` — Symptom: MCP-Antworten unvollständig

Nach jeder Änderung ist ein Neustart nötig. Der Verifier des Zielpakets prüft diese fünf Werte als Semantik-Check ①–⑤ — nach einem Revert meldet er die Abweichung, das ist beabsichtigt und kein Defekt.

---

## 5. Gate-Bewertung P1

| Kriterium | Status |
|---|---|
| Je Variable Notiz „gesetzt" | ✅ vier gesetzt, zwei begründet nicht gesetzt |
| Je Variable „Wirkung beobachtet" | ❌ **offen** — braucht Nutzung über mehrere Sitzungen |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` mit Wirkungsnachweis oder dokumentiertem Fallback | ✅ Fallback und Vorbedingung dokumentiert |
| Revert-Weg | ✅ vollständig und einzeln |

**Gesamt: teilweise erfüllt.** Die Setzung ist vollständig und reversibel; die Beobachtung entsteht erst im Betrieb.

### Was zu beobachten ist

Achte in den nächsten Sitzungen auf drei Dinge — sie sind die Symptome der jeweiligen Decke:

1. **Brechen Antworten ab?** → `CLAUDE_CODE_MAX_OUTPUT_TOKENS` ist zu niedrig.
2. **Fehlen am Ende langer Kommandoausgaben Zeilen?** → `BASH_MAX_OUTPUT_LENGTH` greift. Erwünscht, solange nichts Wesentliches verlorengeht.
3. **Enden Subagent-Berichte mitten im Satz?** → `TASK_MAX_OUTPUT_LENGTH`. Bei dieser Umsetzung relevant: die Fork-Berichte waren teils umfangreich.

Fällt eines davon auf, ist das ein **Messergebnis**, kein Defekt — notiere es, dann ist Gate P1 für diese Variable erfüllt (behalten oder revertiert).
