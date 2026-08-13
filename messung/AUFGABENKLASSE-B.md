# Aufgabenklasse B — bash-lastig

**Angelegt:** 2026-08-13 · **Zweck:** zweite Aufgabenklasse für Phase 6
**Grund:** MESSPLAN §2 verlangt ≥ 3 gepaarte Replikate **je Aufgabenklasse**. Die Baseline-Aufgabe (Klasse A, Tool-Layer-Audit) belastet die Bash-Fläche nur mittel — der Dispatcher mutiert aber ausschließlich dort. Ohne eine bash-lastige Klasse misst die Serie den Effekt kaum.

---

## Warum diese Aufgabe die Fläche wirklich trifft

Der Dispatcher greift erst ab `minInputBytes = 4096` je Tool-Ausgabe. Gemessen:

| Schritt | Bash-Ausgabe | über der Schwelle? |
|---|---:|---|
| 1 — Testlauf im TAP-Format | 9.649 B | **ja** |
| 2 — Grep über Mutationsschlüssel | 4.812 B | **ja** (knapp) |
| 3 — Modus-Analyse | 856 B | nein |

Zwei von drei Schritten liegen über der Schwelle, die Summe (≈ 15,3 KB) deutlich unter dem Deckel `BASH_MAX_OUTPUT_LENGTH = 24000`.

**Korrektur einer Annahme:** Die Vorbereitungsrecherche warnte, die TAP-Ausgabe liege „nahe an `BASH_MAX_OUTPUT_LENGTH`" und ein Lauf könne knapp darunter, der nächste knapp darüber liegen. Gemessen sind es **9.649 B — 40 % des Deckels**. Die Warnung war eine Schätzung, keine Messung. Der relevante Schwellenwert ist nicht der Deckel, sondern die Eingriffsschwelle des Dispatchers.

## Korpus

`~/.claude-tweak/messung/lauf-bash/corpus/` — eingefrorene Kopie des Zielpakets, **59 Dateien, 720 KB**, schreibgeschützt. Ausgeschlossen: `evidence/` (Archiv, im Betrieb ungelesen, würde die Grundlast fast verdoppeln) sowie die Laufzeitdateien `fragment.json`, `token-stack.json`, `capabilities.json`, `state/`, `markers/`.

Referenz-Hashes: `~/.claude-tweak/messung/corpus-bash.sha256` (59 Einträge).

**Belegt:** Ein vollständiger Testlauf im Korpus lässt die Hashes unverändert — die Tests schreiben ausschließlich nach `os.tmpdir()`. Damit ist die Aufgabe wiederholbar, ohne den Korpus zu verbrauchen.

**Nicht Teil der Aufgabe:** `npm run verify`. Er meldet im Korpus Exit 1, weil `SHA256SUMS.txt` den vollen Baum inklusive `evidence/` abdeckt. Ein erwarteter Fehlschlag in einer Messaufgabe ist eine Fehlerquelle — die Bash-Last trägt auch ohne ihn.

---

## Die Aufgabe — wörtlich zu verwenden

```
Prüfe das Node-Paket im Verzeichnis corpus/. Ändere nichts, greife nicht auf das Netz zu.

1. Führe die Testsuite aus corpus/ heraus im TAP-Format aus
   (node --test --test-reporter=tap). Berichte: Tests gesamt, bestanden,
   fehlgeschlagen, sowie die Namen aller Testdateien.
2. Suche per Bash alle .mjs-Dateien unter corpus/, die einen der drei
   Mutationsschlüssel enthalten: permissionDecision, updatedToolOutput,
   updatedInput. Gib je Treffer Datei und Zeilennummer aus.
   Ordne danach jede gefundene Datei einer dieser Rollen zu:
   registrierter Hook | nicht registrierter Hook | kein Hook (Test, Prüfskript).
   Begründe jede Zuordnung aus dem Code, nicht aus dem Dateinamen.
3. Beantworte anhand von corpus/src/stack.mjs: welche Betriebsmodi gibt es,
   welcher mutiert die Tool-Ausgabe, und an welcher Stelle im Code fällt die
   Entscheidung? Nenne Funktionsname und Zeilennummer.
4. An wie vielen Stellen im Betriebscode (also ohne tests/) wird
   updatedToolOutput tatsächlich emittiert? Nenne jede Stelle.

Antworte als Tabelle für Schritt 2 plus drei kurze Absätze.
```

Schritt 4 ist der Prüfstein: Die Antwort muss **eine** Stelle nennen (`src/stack.mjs:369`). Wer mehrere nennt, hat Tests oder Prüfskripte mitgezählt — genau die Unterscheidung, die Gesetz I ausmacht.

## Antwortschlüssel

`~/.claude-tweak/messung/antwortschluessel-bash.txt`, außerhalb der Messfläche. Enthält Testzahl, die sieben Dateien mit Mutationsschlüsseln samt Rollenzuordnung, die drei Betriebsmodi und die eine Emissionsstelle.

---

## Ablauf

Wie Klasse A (`../BASELINE-REFERENZAUFGABE.md` §3/§4): Protokollkopf erheben, Korpus-Hashes prüfen, Aufgabe wörtlich einfügen, `/context`, Antwort gegen den Schlüssel, `quality_ok` **vor** dem Tokenurteil.

Beide Klassen brauchen je ≥ 3 gepaarte Replikate. Die Arme unterscheiden sich allein durch den Dispatcher-Modus (`off` gegen `shadow`, später `enforce`); alles andere bleibt konstant — insbesondere die `ccstatusline`-Version, die sich in dieser Sitzung bereits einmal selbst aktualisiert hat.
