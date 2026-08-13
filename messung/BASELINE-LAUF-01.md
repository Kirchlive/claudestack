# Baseline-Lauf 01 — Klasse A (Tool-Layer-Audit)

**Erhoben:** 2026-08-14 · **Arbeitsverzeichnis:** `~/.claude-tweak/messung/lauf-baseline/`
**Arm:** Kontrolle — Dispatcher registriert, `mode: shadow` (No-op, kein Eingriff)
**Dauer:** 56 s · **Kosten:** 0,36 $ · **Durchsatz:** 178,5 t/s

---

## 1. Messwerte

| Kategorie | Leerlast (13.08.) | **Baseline (14.08.)** | Delta |
|---|---:|---:|---:|
| System tools | 19.400 | 19.400 | **0** |
| Messages | 5.100 | **17.300** | **+12.200** |
| System prompt | 3.800 | 4.200 | +400 |
| Compact buffer | 3.000 | 3.000 | 0 |
| Skills (15) | 2.100 | 2.100 | 0 |
| Memory files (1) | — | **279** | +279 |
| MCP-Werkzeuge (73) | 0 | 0 | 0 |
| **Gesamt** | **30.500** | **40.900** | **+10.400** |

Anteil am 1M-Fenster: 4 %. Die Statuszeile wies parallel 45.324 Token aus — die `/context`-Kategorien sind ausdrücklich Schätzungen (*„Estimated usage by category"*) und addieren sich nicht exakt zur Gesamtsumme. **Für die Messreihe ist die Kategorie `Messages` maßgeblich**, nicht die Gesamtzahl.

### Was das bedeutet

Die Aufgabe hat **12.200 Token in `Messages`** erzeugt — Bash-Ausgaben, Dateiinhalte, Antworttext. Das ist die einzige Kategorie, die sich zwischen den Armen unterscheiden kann.

Alles andere ist konstant: `System tools` bleiben exakt bei 19.400, `Skills` bei 2.100, MCP bei 0. Die Leerlast-Prognose bestätigt sich damit — **der Dispatcher kann höchstens auf ein Viertel des Gesamtkontexts wirken**, und real nur auf den Teil davon, der aus Tool-Ausgaben über 4.096 B stammt.

**Neu gegenüber der Leerlast:** 279 Token `Memory files`. Die Auto-Memory wird in diesem Verzeichnis geladen, in der Leerlast-Sitzung nicht. Ein konstanter Posten, der in beiden Armen gleich wirkt — aber er gehört in den Protokollkopf, weil er wachsen kann.

---

## 2. Qualitätsurteil: `quality_ok = ja`

| Schritt | Erwartet | Geliefert | Urteil |
|---|---|---|---|
| 1 Dateiliste | 10 Dateien, 1.825 LOC | 10 Dateien, 1.825 LOC | ✅ |
| 2 Tool-Unterklassen | 37 | Tabelle mit **37** Einträgen, Fließtext sagt „36" | ⚠️ Zählfehler in der Zusammenfassung, Tabelle vollständig |
| 3 Analyse `tools_base.py` | `apply`, Optionalität, `EditedFileContext` | vollständig, mit Zeilenbelegen | ✅ |
| 4 Schreibende Tools | **10** | **10**, korrekt über `can_edit()` und die Vererbungskette | ✅ |

**Gesamturteil: bestanden.** Der einzige Fehler ist eine Zahl im Fließtext (36 statt 37), während die Tabelle darüber alle 37 Klassen korrekt auflistet. Substanz und Herleitung stimmen durchgehend.

Bemerkenswert: Die Antwort ging bei Schritt 3 über die Frage hinaus und fand einen echten Defekt im geprüften Fremdcode — `getattr(self, "apply")` ohne Default wirft bereits selbst `AttributeError`, weshalb der nachfolgende None-Check und der dokumentierte `RuntimeError` nie greifen. Und bei Schritt 4 hielt sie sauber am Kriterium fest: `WriteMemoryTool` und `DeleteMemoryTool` zählen **nicht** dazu, trotz ihrer Namen — sie tragen keinen Edit-Marker.

### Der Antwortschlüssel war falsch

Er nannte **13** schreibende Tools. Richtig sind **10**. Die Differenz waren die Marker-*Definitionen* aus `tools_base.py` (`ToolMarkerCanEdit:72` und `ToolMarkerSymbolicEdit:94`, letztere doppelt erfasst), die das Suchmuster mitzählte.

Das ist der sechste Fall der Klasse, die diese Umsetzung durchzieht: **eine Prüfung, die etwas anderes misst als sie vorgibt.** Diesmal traf es den Maßstab selbst — hätte ich der Schlüsseldatei geglaubt statt nachzurechnen, wäre eine korrekte Antwort als fehlerhaft bewertet worden. Der Schlüssel ist korrigiert und trägt den Vorgang als Kommentar.

---

## 3. Protokollkopf

| Feld | Wert |
|---|---|
| Datum | 2026-08-14 |
| Claude Code | 2.1.231 · Opus 5 (1M), effort high |
| `literouter` | inactive ✓ |
| `ANTHROPIC_*` | keine gesetzt ✓ |
| `ccstatusline` | 2.2.27 (unverändert seit Vorbereitung) ✓ |
| `ENABLE_TOOL_SEARCH` | `true` |
| `autoCompactEnabled` | `false` |
| env-Deckel | die vier aus Phase 1 |
| Dispatcher | registriert, `mode: shadow`, Canary `pass` |
| Korpus | 10 Dateien, `serena@5cb3bf9`, Hashes geprüft ✓ |

---

## 4. Was als Nächstes zählt

Dieser Lauf ist **ein** Datenpunkt im Kontrollarm. Für das Net-Win-Gate braucht es je Aufgabenklasse ≥ 3 gepaarte Replikate, und der Vergleichsarm ist `enforce` — nicht `off`, denn `shadow` und `off` unterscheiden sich nur im Hook-Overhead, nicht im Kontext.

Die entscheidende Zahl ist **`Messages` = 17.300**. Gegen sie misst sich, ob der Dispatcher im `enforce`-Modus netto etwas einspart. Zur Einordnung des Erwartbaren: von den 12.200 Token, die die Aufgabe erzeugt hat, stammt nur der Teil aus Bash-Ausgaben über 4.096 B, den der Dispatcher überhaupt anfassen darf — der Rest sind Dateiinhalte aus `Read` und der Antworttext selbst.
