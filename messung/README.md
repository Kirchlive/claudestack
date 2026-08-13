# Baseline-Messung — alles vorbereitet, ein Schritt fehlt

**Vorbereitet:** 2026-08-13 · **Grundlage:** `../BASELINE-REFERENZAUFGABE.md`

Der Korpus ist eingefroren, der Antwortschlüssel liegt außerhalb der Messfläche, der Protokollkopf ist erhoben. Was fehlt, ist der Lauf selbst — er braucht eine interaktive Sitzung, weil `/context` in `claude -p` nicht existiert.

## Was hier liegt

| Datei | Inhalt |
|---|---|
| `lauf-baseline/corpus/` | 10 Python-Dateien, 1.825 LOC, aus `~/serena/src/serena/tools/` @ `5cb3bf9` — **schreibgeschützt** |
| `corpus.sha256` | Referenz-Hashes; vor und nach jedem Lauf prüfen |
| `antwortschluessel.txt` | 37 Tool-Klassen, 6 Marker-Definitionen, 13 schreibende Tools — maschinell erzeugt |
| `protokollkopf-baseline.txt` | Umgebungswerte zum Zeitpunkt der Vorbereitung |
| `lauf-bash/corpus/` | **Klasse B** — eingefrorene Kopie des Zielpakets, 59 Dateien, schreibgeschützt |
| `corpus-bash.sha256` | Referenz-Hashes für Klasse B |
| `antwortschluessel-bash.txt` | Schlüssel für Klasse B |
| `AUFGABENKLASSE-B.md` | Aufgabentext und Begründung der zweiten Klasse |

`__pycache__`, `.git` und eine etwaige `CLAUDE.md` wurden beim Einfrieren ausgeschlossen — die erste würde bei jeder Python-Ausführung die Korpus-Hashes brechen, die letzte den gemessenen Prefix verändern.

## Der Lauf

1. **Frische Sitzung** in `~/.claude-tweak/messung/lauf-baseline/` starten.
2. Protokollkopf gegenprüfen:
   ```bash
   systemctl --user is-active literouter    # Soll: inactive
   env | grep '^ANTHROPIC_'                 # Soll: leer
   sha256sum -c ../corpus.sha256 --quiet && echo "Korpus unverändert"
   ```
3. Diesen Text **wörtlich** einfügen:

```
Analysiere den Python-Werkzeug-Layer im Verzeichnis corpus/. Ändere nichts, greife nicht auf das Netz zu.

1. Gib per Bash alle .py-Dateien unter corpus/ mit ihrer Zeilenzahl aus, absteigend sortiert.
2. Ermittle jede Klasse, die von `Tool` erbt. Gib je Klasse in einer Tabelle an:
   Klassenname | Datei | Zeilennummer | vollständige Liste der Marker-Basisklassen (alle `ToolMarker*`).
3. Beantworte ausschliesslich anhand von corpus/tools_base.py:
   (a) welche Methode jede Tool-Unterklasse bereitstellen muss und wie sie geprüft wird,
   (b) woran die Registry erkennt, dass ein Tool optional ist,
   (c) was `EditedFileContext` beim Verlassen des Kontextmanagers tut.
4. Nenne alle Tools mit schreibender Wirkung auf das Dateisystem. Begründe jede Zuordnung
   ausschliesslich über die Marker-Basisklassen, nicht über den Klassennamen.

Antworte als eine Tabelle plus vier kurze Absätze.
```

4. Nach der Antwort **`/context`** ausführen und die Ausgabe vollständig sichern.
5. Antwort gegen `antwortschluessel.txt` prüfen und `quality_ok` vergeben — **das Qualitätsurteil kommt vor dem Tokenurteil.**
6. Werte nach `~/.claude/token-stack/docs/MESSPROTOKOLL.template.md` übertragen.

## Warnung: eine Störquelle hat bereits zugeschlagen

`ccstatusline` stand bei der Lizenz-Aufnahme auf **2.2.22**, beim Erheben des Protokollkopfs auf **2.2.27**. Das Werkzeug aktualisiert sich also im laufenden Betrieb selbst — und es hängt als `PreToolUse:Skill`- und `UserPromptSubmit`-Hook sowie als Statuszeile mit `refreshInterval: 10` in jeder Sitzung.

Für die Messreihe heißt das: Version im Protokollkopf jedes Laufs festhalten. Ändert sie sich mitten in einer Serie, ist die Serie zu Ende — nicht weil ccstatusline viel kostet, sondern weil ein unbemerkt wechselnder Faktor jede Differenz erklärbar macht und damit keine mehr belegt.

## Zwei Aufgabenklassen

MESSPLAN §2 verlangt ≥ 3 gepaarte Replikate **je Klasse**. Klasse A (diese Datei) prüft Analysefähigkeit bei mittlerer Bash-Last; Klasse B (`AUFGABENKLASSE-B.md`) belastet gezielt die Fläche, auf der der Dispatcher überhaupt eingreift — zwei ihrer drei Schritte liegen über dessen Eingriffsschwelle von 4.096 B.

Die Baseline (`/context`) wird mit Klasse A erhoben. Klasse B kommt in den A/B-Replikaten dazu.

## Danach

Die Baseline ist die Referenz für alles Weitere. Erst mit ihr lassen sich die drei gepaarten Replikate der Phase 6 gegen etwas messen — und erst deren Ergebnis entscheidet Phase 7: `enforce` nur bei Netto-Gewinn größer als die Streuung bei unveränderter Qualität, sonst vollständiger Rückbau.
