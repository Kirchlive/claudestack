# Referenzaufgabe für die `/context`-Baseline

**Festgelegt:** 2026-08-13 · **Zweck:** AP-0.1/AP-0.3 (Baseline) und Phase 6 (gepaarte A/B-Replikate)
**Grundregel:** Diese Aufgabe wird für **alle** Vorher/Nachher-Vergleiche wörtlich identisch wiederholt. Wird sie geändert, beginnt die Messreihe von vorn.

---

## 0. Entscheidung zur Ausgangslage

Die vier env-Deckel der Phase 1 (`MAX_MCP_OUTPUT_TOKENS=8000`, `BASH_MAX_OUTPUT_LENGTH=24000`, `TASK_MAX_OUTPUT_LENGTH=12000`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=16000`) waren **vor** der Baseline gesetzt worden — plangemäß hätte die Messung davor liegen müssen.

**Getroffene Entscheidung:** Die Baseline wird **mit gesetzten Deckeln** erhoben. Sie sind damit Bestandteil der Referenz und dürfen **bis zum Abschluss von Phase 7 nicht verändert werden**. Ein Wechsel mitten in einer Serie macht sie ungültig (MESSPLAN §3.8).

Preis dieser Entscheidung, offen ausgewiesen: Der Effekt der einzelnen Deckel bleibt ungemessen. Gate P1 bleibt dauerhaft bei „gesetzt, Wirkung nicht isoliert gemessen". Die Deckel wirken in beiden Armen der A/B-Messung gleich und verfälschen den Dispatcher-Vergleich deshalb nicht — sie sind Teil der Umgebung, nicht der Messgröße.

---

## 1. Korpus vorbereiten (einmalig, dann eingefroren)

> **Bereits ausgeführt am 13.08.2026.** Der eingefrorene Korpus liegt unter
> `~/.claude-tweak/messung/lauf-baseline/corpus/`, die Referenz-Hashes unter
> `~/.claude-tweak/messung/corpus.sha256`, der Antwortschlüssel unter
> `~/.claude-tweak/messung/antwortschluessel.txt`. Die Sequenz unten ist die
> Wiederholanleitung — sie **überschreibt** `corpus.sha256`, wenn man sie ohne
> Not erneut ausführt (Befund C-5: die Vorgängerfassung nannte einen anderen
> Pfad und hätte einen zweiten Korpus angelegt).

Quelle: `~/serena/src/serena/tools/` — 10 Python-Dateien, 1.825 LOC. Gewählt, weil das Repo auf `main` steht, sauber ist und seit über sieben Monaten keine `.py`-Datei geändert wurde.

```bash
# Korpus einfrieren — __pycache__ und .git zwingend ausschliessen
mkdir -p ~/.claude-tweak/messung/lauf-baseline/corpus
rsync -a --exclude='__pycache__' --exclude='.git' \
  ~/serena/src/serena/tools/ ~/.claude-tweak/messung/lauf-baseline/corpus/

# KEINE CLAUDE.md mitkopieren — sie veraendert den Prefix, also genau die Messgroesse
find ~/.claude-tweak/messung/lauf-baseline/corpus -name 'CLAUDE.md' -delete

# Schreibschutz und Referenz-Hash
chmod -R a-w ~/.claude-tweak/messung/lauf-baseline/corpus
find ~/.claude-tweak/messung/lauf-baseline/corpus -type f -exec sha256sum {} \; | sort -k2 \
  > ~/.claude-tweak/messung/corpus.sha256
```

Vor und nach **jedem** Lauf gegen `corpus.sha256` prüfen. Weicht etwas ab, ist der Lauf verworfen („corpus drift", `ab-harness.sh:185`) — der häufigste Grund dafür ist ein erzeugtes `__pycache__`.

### Antwortschlüssel vorab erzeugen

Der Schlüssel muss **außerhalb der Messfläche** liegen (CTS-BENCH-008 Regel 4) — nicht im Korpus, nicht im Arbeitsverzeichnis des Laufs:

```bash
grep -rn "^class .*Tool" ~/serena/src/serena/tools/ > ~/.claude-tweak/messung/antwortschluessel.txt
```

Der erzeugte Schlüssel weist **37** Klassen aus, die von `Tool` erben, dazu 6 Marker-Definitionen und 13 Tools mit schreibender Wirkung (jeweils mit fester Marker-Liste, z. B. `DeleteLinesTool(Tool, ToolMarkerCanEdit, ToolMarkerOptional)`).

> **Abweichung, offen ausgewiesen:** Die Vorbereitungsrecherche nannte 30 Unterklassen. Maßgeblich ist die maschinell erzeugte Datei, nicht die Schätzung — die Differenz ist beim Auswerten zu klären, nicht vorab wegzurunden. Ein erster, breiterer Suchlauf lieferte 46 Treffer, weil er die Marker-Basisklassen mitzählte; deshalb trennt der Schlüssel die drei Gruppen.

---

## 2. Die Aufgabe — wörtlich zu verwenden

Die Pfadangabe lautet `corpus/`, **nicht** absolut: der Harness kopiert je Lauf nach `$dir/corpus`, ein absoluter Pfad würde das Original lesen und die Einfrier-Garantie aushebeln.

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

**Berührte Kontextflächen:** Bash-Ausgabe (Schritt 1), Suche über 10 Dateien (Schritt 2), vollständiger Read von `tools_base.py` plus Ausschnitte (Schritt 3), Relationsschluss über Dateigrenzen (Schritt 4). Geschätzt 4–7 Minuten, 10–16 Werkzeugaufrufe.

**Zweite Aufgabenklasse für Phase 6:** MESSPLAN §2 verlangt ≥ 3 Replikate **je Aufgabenklasse**. Die Aufgabe oben belastet die Bash-Fläche nur mittel — der Dispatcher mutiert aber genau dort. Für Phase 6 ist deshalb eine zweite, bash-lastige Klasse mitzuführen (Vorschlag: Testlauf und Verifier über eine eingefrorene Kopie des Zielpakets). **Achtung:** deren TAP-Ausgabe liegt nahe an `BASH_MAX_OUTPUT_LENGTH=24000` — liegt ein Lauf knapp darunter und der nächste knapp darüber, misst man die Kürzungsgrenze statt der Aufgabe.

---

## 3. Protokollkopf — vor jedem Lauf auszufüllen

Diese Angaben sind über die gesamte Serie konstant zu halten. Ändert sich eine, ist die Serie zu Ende.

```bash
# Vor jedem Lauf ausfuehren und die Ausgabe in den Protokollkopf uebernehmen
systemctl --user is-active literouter 2>/dev/null || echo "literouter: inactive"
env | grep -E '^ANTHROPIC_' || echo "ANTHROPIC_*: keine gesetzt"
claude --version
node --version
env | grep -E '^(ENABLE_TOOL_SEARCH|CLAUDE_EFFORT)='
sha256sum -c ~/.claude-tweak/messung/corpus.sha256 --quiet && echo "Korpus unveraendert"
```

| Feld | Sollwert dieser Serie |
|---|---|
| `literouter` | **inactive** — der Dienst biegt `ANTHROPIC_BASE_URL`/`ANTHROPIC_MODEL` um und würde die Token-Abrechnung stillschweigend verfälschen. Die auskommentierten Exports in `~/.bashrc` und die `.bak`-Dateien machen ihn reaktivierbar; deshalb **vor jedem Lauf prüfen** |
| `ANTHROPIC_*` | keine gesetzt |
| Claude Code | 2.1.231 |
| `ENABLE_TOOL_SEARCH` | `true` (aus `~/.bashrc:163` vererbt — ein Lauf aus einer anderen Shell erbt ihn **nicht** und misst eine andere Werkzeugfläche) |
| `effortLevel` / `CLAUDE_EFFORT` | `high` |
| `autoCompactEnabled` | `false` |
| env-Deckel | die vier aus Phase 1, unverändert |
| `ccstatusline` | Version festhalten — ein Autoupdate (`npx -y ccstatusline@latest`) invalidiert die Serie |

---

## 4. Ablauf der Baseline-Messung

1. **Frische Session** in einem Arbeitsverzeichnis, das `corpus/` im selben Layout enthält wie ein Harness-Lauf.
2. Protokollkopf aus §3 erheben und notieren.
3. Aufgabentext aus §2 **wörtlich** einfügen und durchlaufen lassen.
4. `/context` ausführen, Ausgabe vollständig protokollieren.
5. Antwort gegen `antwortschluessel.txt` prüfen und `quality_ok` vergeben — **das Qualitätsurteil kommt vor dem Tokenurteil** (CTS-BENCH-005). Eine Serie mit gutem Token-Ergebnis und schlechterer Antwort ist kein Gewinn.
6. Werte in `docs/MESSPROTOKOLL.template.md` des Zielpakets eintragen.

`/context` steht nur interaktiv zur Verfügung, nicht in `claude -p` — die Baseline ist deshalb ein Handlauf, die späteren A/B-Replikate laufen über `ab-harness.sh`.

Laufende Beobachtung während der Shadow-Periode über `ccusage` (installiert 2026-08-13, v20.0.19, MIT) plus `/context`-Stichproben.

---

## 5. Warum diese Aufgabe

| Anforderung | Erfüllung |
|---|---|
| Antwortschlüssel deterministisch vorab erzeugbar | 37 Klassen mit fester Marker-Liste, per `grep` ableitbar — daran war die verworfene v1-Serie des Korpus gescheitert |
| Niedrige Grundlast | 1.825 LOC in 10 Dateien; die Ladder-Historie zeigt ±33 % Streuung bei 200k Grundlast gegen ~3 % bei kleinem Setup |
| Stabiler Korpus | `serena` auf `main`, clean, keine `.py` seit über sieben Monaten geändert |
| Keine Seiteneffekte | kein Codeausführen, kein Schreiben, keine Netzabhängigkeit, keine Zeitstempel |
| Unter den Kürzungsgrenzen | alle Ausgaben deutlich unter `BASH_MAX_OUTPUT_LENGTH` und der ~32-KB-Auslagerungsgrenze |
