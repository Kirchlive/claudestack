# Benchmark-Harness — Verweis-Konzept (nach Squeez v5)

Dieses Paket enthält **bewusst keinen** eigenen Messharness als Code. Der
Referenz-Harness ist das eingefrorene, fünfmal iterierte Squeez-v5-Setup;
diese Datei fixiert sein Konzept als verbindliche Bauanleitung für eigene
A/B-Messungen (Rollout Waves 1, 4, 6, 7). Die Regeln in `planung/MESSPLAN.md`
§ 3 sind die Kurzfassung — hier steht die Maschinerie dahinter.

## Referenz-Quellen (außerhalb des Pakets)

`/mnt/agents/claudestack/Squeez-RTK-Ladder/v5-auswertung/`:

| Artefakt | Rolle |
|---|---|
| `precompute-v5.py` | Vorab-Rechnung aller Stufen ohne Modell (tiktoken o200k_base) — erzeugt den Erwartungsrahmen, nicht das Ergebnis |
| `gen-tasks-v5.py` | Erzeugt byteweise symmetrische Aufgabendateien je Arm und prüft die Arm-Symmetrie |
| `corpus-v5.sh` + `corpus-v5.sha` | **Eingefrorenes Korpus** mit SHA vor/nach jedem Lauf |
| `dispatch-v5.sh` | 3 Replikate parallel (cmux), Zeitstempel im Laufnamen, Abbruch bei `SQUEEZ_WRAP_TIMEOUT_SECS < 600`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0` |
| `ANSWERS-v5.md` | **Deterministischer Antwortschlüssel**, vorab berechnet, außerhalb der Messfläche |
| `eval-v5.py` | Je-Lauf-Auswertung + Qualitätsprüfung gegen den Schlüssel + 1-Transkript-Gültigkeitscheck |
| `ladder-tokens-v5.py` | Misst, was **tatsächlich zugestellt** wurde — nicht, was Werkzeuge könnten |
| `ladder-ab.mjs` (Repo-Wurzel) | Gepaarter A/B: Arm-Schalter, `--project`-Filter, Median, <3-Läufe-Warnung |

Dokumentierte Rohdaten/Verdikte: `RESULTS-v4.md`, `v5-auswertung/RESULTS-v5.md`,
`PLAN-v5.md`, `ANSWERS-v5.md` und der `ABSCHLUSSBERICHT.md` (inkl. der
verworfenen Serien v1/v2 — Fehler werden abgelegt, nicht versteckt).

## Die vier tragenden Invarianten

1. **Eingefrorenes Korpus + SHA.** `chmod a-w` auf das Korpus, SHA-Datei vor
   und nach jedem Lauf prüfen. Korpus-Kopie je Lauf, niemals in-place.
   (v1 scheiterte u. a. an Korpus-Drift um ~10 % zwischen den Armen.)
2. **≥ 3 Replikate, gepaart.** Gleiche Aufgabe in beiden Armen, wechselnde
   Reihenfolge, Median der Paar-Differenzen. < 3 gültige Läufe = Warnung,
   keine Entscheidung. Ein unterbrochener Lauf ist **kein** Datenpunkt.
3. **Anomaliedatei Pflicht je Lauf.** Jede Unterbrechung, jeder Dialog,
   jeder Timeout wird in eine `AB-ANOMALIES.md` pro Lauf geschrieben —
   fehlt sie, ist der Lauf ungültig (nicht „vermutlich ok").
4. **Antwortschlüssel außerhalb der Messfläche.** Der Schlüssel wird
   deterministisch vorab erzeugt und liegt nicht im Korpus-Verzeichnis —
   sonst liest der Arm die Antwort mit (und der Arm-Schalter verändert den
   Lesestoff, zweiter v1-Fehler).

## Zusätzlich bewährt

- Zeitstempel-Laufnamen + ein Verzeichnis je Lauf → Transkript-Auswertung
  strikt per `--project <lauf-dir>`, keine Wiederverwendung.
- Endpunkt **vor** dem ersten Lauf schriftlich: „Median gepaarte Differenz
  fresh input (uncached + cache_creation); sekundär output, turns."
- Grundlast senken statt Replikate erhöhen, wenn die Streuung > ~25 % liegt
  (v4: ±33 % bei 200k Grundlast → v5 mit kleinerem, gebündeltem Setup: 3 %/7 %).
- 32-KB-Auslagerungsgrenze beachten: Claude Code lagert große Ausgaben selbst
  als `persisted-output` aus — Fälle darüber messen nicht das Werkzeug,
  sondern den nativen Mechanismus (v4-Lektion).
- Maschinengebundenheit dokumentieren: die v5-Skripte tragen maschinenspezifische
  Pfade und tiktoken-Abhängigkeit — bei Übernahme Pfade parametrisieren
  (homedir/CLAUDE_CONFIG_DIR) und Abhängigkeiten in den Lauf-Header schreiben.

## Was der Harness nicht ersetzt

Die ccusage/codeburn-Langzeitmessung (MESSPLAN § 5). Der Harness beantwortet
EINE Arm-Frage sauber; die Governance-Frage „was kostet der Stack im Alltag"
beantworten nur die dauerhaft laufenden Zähler.
