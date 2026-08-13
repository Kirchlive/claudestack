# Streuungsmessung Klasse A — und warum diese Aufgabe keinen Effekt zeigen kann

**Erhoben:** 2026-08-14 · **Zwei Läufe, identischer Input, identische Bedingungen, Arm `shadow`**

---

## 1. Die Streuung

| | Lauf 01 | Lauf 02 | Delta |
|---|---:|---:|---:|
| **Messages** | 17.300 | 19.400 | **+2.100 = +12,1 %** |
| Gesamt | 40.900 | 43.300 | +2.400 = +5,9 % |
| System tools | 19.400 | 19.400 | 0 |
| System prompt | 4.200 | 4.200 | 0 |
| Memory files | 279 | 279 | 0 |
| Skills · MCP · Buffer | 2.100 · 0 · 3.000 | identisch | 0 |
| Dauer | 56 s | 58 s | +2 s |
| Kosten | 0,36 $ | 0,48 $ | +0,12 $ |

**Streuung auf der einzigen variablen Kategorie: 11,4 % vom Mittel (18.350).**

Alle konstanten Posten sind auf das Token identisch — die Messung ist also sauber, die Streuung ist echt und nicht Messrauschen.

### Ursache: der Werkzeugpfad, nicht die Antwort

Lauf 01 brauchte **drei** Werkzeugaufrufe (find+wc, grep, Read), Lauf 02 **vier** — ein zusätzlicher `grep "^class \|^@"` zur Gegenkontrolle. Dieser eine Aufruf erklärt die 2.100 Token praktisch vollständig.

Die Aufgabe schreibt das Ergebnis vor, nicht den Weg dorthin. Dieselbe Frage lässt sich mit drei oder vier Suchläufen beantworten — beide Male korrekt. **Genau das ist die Streuungsquelle, und sie ist nicht wegzukonstruieren, ohne die Aufgabe in ein Skript zu verwandeln.**

---

## 2. Der Befund, der die Messplanung ändert

Der Dispatcher greift laut Konfiguration erst ab `minInputBytes = 4096` je Bash-Ausgabe. Gemessen an den tatsächlichen Ausgaben dieser Aufgabe:

| Schritt | Ausgabe | über 4.096 B? |
|---|---:|---|
| find + wc (Dateiliste) | 307 B | **nein** |
| grep `^class .*Tool` (größter Aufruf) | 3.444 B | **nein** |
| grep `^class` (nur Lauf 02) | 3.299 B | **nein** |
| Read `tools_base.py` | 16.852 B | nein — unter dem Read-Deckel von 80.000 B |

**Keine einzige Ausgabe dieser Aufgabe erreicht die Eingriffsschwelle.** Der Dispatcher würde auch im Modus `enforce` nichts tun — er sähe die Daten, ließe sie aber unverändert durch.

### Konsequenz

**Klasse A kann den Effekt des Dispatchers strukturell nicht messen.** Ein A/B-Vergleich `shadow` gegen `enforce` müsste hier zwangsläufig ein Nullergebnis liefern, und zwar nicht, weil der Dispatcher nichts taugt, sondern weil die Aufgabe ihn nie auslöst.

Was Klasse A stattdessen leistet, ist wertvoll und bleibt:
- **Sie liefert die Nachweisschwelle.** Ein Effekt muss > 11,4 % auf `Messages` sein, um über der Streuung zu liegen — das sind mindestens 2.100 Token je Lauf.
- **Sie ist der Qualitätsmaßstab.** Die Antworten sind gegen einen festen Schlüssel prüfbar.
- **Sie ist der Kontrollarm** für die Frage, ob der Hook-Overhead als solcher etwas kostet.

**Die Effektmessung gehört zu Klasse B.** Dort liegen zwei von drei Schritten über der Schwelle (TAP-Testlauf 9.649 B, Mutations-Grep 4.812 B) — das ist der einzige Ort in dieser Messanlage, an dem der Dispatcher überhaupt eingreifen darf.

Das rechtfertigt nachträglich, dass Klasse B gebaut wurde. Ohne sie hätte die Serie ein Nullergebnis produziert und es fälschlich dem Werkzeug zugeschrieben — genau der Fehler, den die Ladder-Nullmessung des Korpus vorgemacht hat.

---

## 3. Qualitätsurteil beider Läufe: `quality_ok = ja`

| Prüfpunkt | Lauf 01 | Lauf 02 | Schlüssel |
|---|---|---|---|
| Dateiliste | 10 Dateien, 1.825 LOC | identisch | ✅ |
| Tabelle Tool-Unterklassen | **37 Einträge** | **37 Einträge** | 37 ✅ |
| Zahl im Fließtext | „36" | „39" | ❌ **beide falsch, unterschiedlich falsch** |
| Analyse `tools_base.py` | vollständig | vollständig | ✅ |
| Schreibende Tools | **10** | **10** | 10 ✅ |
| `WriteMemoryTool` ausgeschlossen | ja, begründet | ja, begründet | ✅ |
| `getattr`-Defekt gefunden | ja | ja | Zusatzbefund |

**Beide Läufe bestehen.** Die Substanz ist zweimal identisch und korrekt — inklusive des Zusatzbefunds im Fremdcode, den beide unabhängig fanden.

Der einzige Fehler ist beide Male **die Zusammenfassungszahl**, während die Tabelle darüber jeweils vollständig ist. Dass sie unterschiedlich falsch ausfällt (36 gegen 39), ist der interessantere Teil: **eine gezählte Zahl im Fließtext ist kein reproduzierbarer Messgegenstand.** Für `quality_ok` taugt sie nicht — der Prüfschlüssel muss auf die Tabelle und die Herleitung schauen, nicht auf die Zusammenfassung.

---

## 4. Störquelle eingetreten: Claude Code hat sich selbst aktualisiert

Die Statuszeile meldete nach Lauf 02 `current: 2.1.231 · latest: 2.1.232`. **Um 01:06 wurde 2.1.232 installiert und der Aufrufpfad umgehängt** — mitten in der Serie, ohne Zutun.

| | |
|---|---|
| Lauf 01 und 02 | liefen beide unter **2.1.231** — die Streuung von 11,4 % bleibt gültig |
| Ein neuer Start | nutzt **2.1.232** |
| `~/.local/share/claude/versions/2.1.231` | **existiert weiterhin und ist startbar** |

Warum das zählt: `System tools` mit 19.400 Token und der Systemprompt mit 4.200 sind Teil der gemessenen Grundlast. Beide stammen aus der Anwendung selbst und können sich mit jeder Version ändern. Ein Vergleich über einen Versionswechsel hinweg macht jede Differenz erklärbar — und belegt damit keine.

**Ausweg:** Die Serie auf 2.1.231 fortsetzen, indem der alte Binary direkt aufgerufen wird:

```bash
cd ~/.claude-tweak/messung/lauf-bash
~/.local/share/claude/versions/2.1.231
```

Das ist kein Downgrade des Systems — der Symlink bleibt auf 2.1.232, nur die Messläufe nutzen die alte Fassung. Alternativ die Serie neu beginnen und alle Klassen unter 2.1.232 messen; dann sind die beiden A-Läufe zu verwerfen.

Für den Alltag gilt weiterhin die neue Version. Nur innerhalb einer Vergleichsgruppe muss sie konstant sein.

---

## 5. Empfehlung für das weitere Vorgehen

1. **Klasse A ist ausmessbar abgeschlossen** für den Kontrollarm — zwei Replikate, Streuung bekannt. Ein drittes brächte eine genauere Streuungsschätzung, aber keinen Effektnachweis.
2. **Klasse B messen**, ebenfalls zweimal im Arm `shadow`, um deren Streuung zu bestimmen. Erst dann steht die Nachweisschwelle für die Fläche, auf der der Dispatcher wirkt.
3. **Danach `enforce`** für beide Klassen, je ≥ 3 Replikate.
4. Das Net-Win-Gate entscheidet auf `Messages`, gegen die dann bekannte Streuung — und mit `quality_ok` **vor** dem Tokenurteil.

Realistische Erwartung, offen ausgesprochen: Bei einer Streuung um 11 % und Bash-Ausgaben, die selbst in Klasse B nur zweimal knapp über der Eingriffsschwelle liegen, ist ein belegbarer Netto-Gewinn unwahrscheinlich. Ein Nullergebnis wäre kein Scheitern der Umsetzung, sondern ihr planmäßiges Ergebnis — Phase 7 sieht dafür den vollständigen Rückbau vor, und negative Evidenz ist Evidenz.
