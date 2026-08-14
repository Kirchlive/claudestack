# Klasse B, Lauf 01 — bash-lastige Aufgabe

**Erhoben:** 2026-08-14 · **Messversion: 2.1.231** (fester Pfad, nicht der Symlink) · **Arm:** `shadow`
**Dauer:** 2 min 17 s · **Kosten:** 0,94 $ · **Durchsatz:** 188,7 t/s

---

## 1. Messwerte

| Kategorie | Klasse A (Mittel) | **Klasse B** | Verhältnis |
|---|---:|---:|---|
| **Messages** | 18.350 | **41.100** | **2,24×** |
| System tools | 19.400 | 19.400 | identisch |
| System prompt | 4.200 | 4.200 | identisch |
| Memory files | 279 | 279 | identisch |
| Skills · Buffer | 2.100 · 3.000 | 2.100 · 3.000 | identisch |
| MCP-Werkzeuge | 73 → **0 Token** | 79 → **0 Token** | *(sechs mehr, weiter kostenlos)* |
| **Gesamt** | ~42.100 | **65.400** | +55 % |

### Der Anteil der messbaren Fläche wächst deutlich

| Lauf | Messages | Gesamt | Anteil |
|---|---:|---:|---:|
| Leerlast | 5.100 | 30.500 | 16,7 % |
| Klasse A | 18.350 | 42.100 | 43,6 % |
| **Klasse B** | **41.100** | **65.400** | **62,8 %** |

Das ist der Zweck dieser Klasse: Bei Klasse A lagen zwei Drittel des Kontexts in Kategorien, die kein Hook erreicht. Hier sind es **fast zwei Drittel in der einzigen Kategorie, die der Dispatcher überhaupt anfassen kann.** Erst damit hat ein A/B-Vergleich eine Fläche, auf der er etwas zeigen könnte.

**Nebenbefund:** Die MCP-Werkzeuge sind von 73 auf 79 gestiegen — und kosten weiterhin **null Token**. Die Zahl gehört in den Protokollkopf, weil sie schwankt; für die Messung ist sie folgenlos, solange Tool Search sie deferiert.

---

## 2. Qualitätsurteil: `quality_ok = ja` — bester Lauf der Serie

| Prüfpunkt | Erwartet | Geliefert | |
|---|---|---|---|
| Testzahl | 43/43 | 43/43, **plus Aufschlüsselung je Datei** (28+9+4+1+1) | ✅ über der Anforderung |
| Dateien mit Mutationsschlüsseln | 7 | 7, mit Zeilenangaben und Rollenzuordnung | ✅ |
| Rollen begründet aus dem Code | ja | durchgehend, mit Belegstellen | ✅ |
| Betriebsmodi + Entscheidungsstelle | `effectiveMode()` | Z. 162–168, plus Schleuse `handleHook()` Z. 481 | ✅ |
| Emissionsstellen `updatedToolOutput` | **eine** | **eine** im Hook-Pfad, sauber hergeleitet | ✅ |

### Drei Stellen, an denen die Antwort über den Schlüssel hinausging

**Erstens** die Testzahl: Sie erklärt, *warum* 43 herauskommt — die beiden `tests/contract/`-Dateien sind keine `node:test`-Suiten, sondern eigenständige Prüfskripte, die der Runner über sein Default-Muster `**/test-*.mjs` mitzieht und je als *einen* Test wertet. Genau der Zufallstreffer des Dateinamens, der in dieser Umsetzung schon zweimal aufgefallen ist.

**Zweitens** die Emissionsstelle: Mein Schlüssel nannte `src/stack.mjs:369`. Die Antwort ist präziser — die Fabrik `outputResult()` liegt bei Z. 365–372, konstruiert wird der Schlüssel an Z. 369, und sie zählt die sechs Aufrufer auf, von denen nur einer die gekürzte Ausgabe mit Recovery-Footer emittiert.

**Drittens** ein Fall, den der Schlüssel gar nicht kannte: Der Canary *schreibt* an Z. 150 ein Probe-Hookskript, das den Schlüssel zur Laufzeit tatsächlich ausgibt. Die Antwort führt ihn getrennt und begründet, warum er nicht mitzählt — generierter Code in einem temporären Probe-HOME, in keiner realen `settings.json` registriert. Das ist die Unterscheidung, an der mein Klasse-A-Schlüssel gescheitert war.

**Zusatzbefund im geprüften Code:** Die Modusprüfungen in `handleBash()` (Z. 441, 447) sind defensiv-redundant — die Schleuse in `handleHook()` Z. 481 lässt nur `enforce` durch, `handleBash` wird also nie mit einem anderen Modus erreicht. Kein Defekt, aber toter Prüfcode.

---

## 3. Protokollkopf

| Feld | Wert |
|---|---|
| **Messversion** | **2.1.231** — bewusst der alte Binary über festen Pfad |
| System-Symlink | 2.1.232 (für den Alltag, **nicht** für Messläufe) |
| `literouter` | inactive ✓ |
| `ANTHROPIC_*` | keine ✓ |
| `ccstatusline` | 2.2.27 (unverändert) ✓ |
| Dispatcher | `shadow`, Canary `pass` |
| MCP-Werkzeuge | 79 (war 73), 0 Token |
| Korpus | 59 Dateien, Hashes geprüft, Testlauf lässt sie unverändert ✓ |

---

## 4. Was noch fehlt

**Die Streuung von Klasse B ist unbekannt.** Ein einzelner Lauf sagt nichts darüber, wie stark identische Läufe schwanken — und ohne Streuungsmaß ist kein Effekt belegbar. Klasse A brauchte dafür zwei Läufe und ergab 11,4 %.

Bei Klasse B ist der Werkzeugpfad stärker vorgegeben (der Testlauf ist ein fester Befehl), die Streuung könnte also geringer ausfallen. Das ist eine Vermutung, keine Messung — genau die Sorte Annahme, die in dieser Serie schon zweimal gefallen ist.

**Nächster Schritt:** Klasse B ein zweites Mal im Arm `shadow`, identische Bedingungen, fester Versionspfad. Erst danach steht die Nachweisschwelle für die Fläche, auf der der Dispatcher wirkt — und erst dann lohnt der Wechsel auf `enforce`.
