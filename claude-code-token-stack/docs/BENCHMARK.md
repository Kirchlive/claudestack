---
id: CTS-DOC-BENCH-001
schema: claudestack.document/v1
document_type: benchmark_protocol
title: Benchmark- und Gate-Protokoll
version: 1
status: release_candidate
language: de
last_reviewed: 2026-08-13
applies_to: claude-code-token-stack/v1
---

# Benchmark- und Gate-Protokoll

## CTS-BENCH-001 — Zielgröße

Primäre Zielgröße ist Kosten pro akzeptierter Aufgabe bei nicht schlechterer
Qualität. Falls Providerkosten nicht verfügbar sind, Provider-Usage getrennt
berichten und keine Kostenaussage ableiten.

Nicht austauschbar:

- lokale Eingabe-/Ausgabebytes;
- modellsichtbare Input-/Output-Tokens;
- Cache-Creation-/Cache-Read-Tokens;
- API-/Abonnementkosten;
- Laufzeit und Toolcalls;
- Review-Rework und Taskqualität.

## CTS-BENCH-002 — Versuchsdesign

1. 10–20 repräsentative Aufgaben auswählen; genaue Anzahl vor Lauf fixieren.
2. Akzeptanzkriterien und Reviewer vorab definieren.
3. Baseline ohne Mutator erfassen (`off` oder bestehender sauberer Native-Stand).
4. Shadow messen, um Hook-Overhead zu erkennen.
5. Canary A/B mit gleicher Claude-Code-/Modellversion, Repo-Revision,
   Tooltopologie und Instruktionen.
6. Reihenfolge randomisieren oder paarweise alternieren, um Lern-/Zeitbias zu
   begrenzen.
7. Abgebrochene Tasks behalten und Grund klassifizieren; nicht still entfernen.
8. Rohdaten privat speichern, veröffentlichte Daten redigieren.

Nur eine Variable pro Arm ändern. Retrieval-Vergleich: native Suche gegen genau
einen Index. Output-Vergleich: Dispatcher gegen Baseline, keine Reducer-Kette.

## CTS-BENCH-003 — Maschinenlesbarer Task-Record

`scripts/evaluate-benchmark.mjs` liest JSONL: genau eine JSON-Zeile je Arm und
`pair_id`. Jedes vollständige Paar enthält exakt einen `baseline`- und einen
`candidate`-Record. Verbindliche Felder:

```json
{"pair_id":"CTS-PAIR-001","arm":"baseline","task_success":true,"accepted_change":true,"input_tokens":1000,"cache_read_tokens":100,"cache_write_tokens":10,"output_tokens":200,"cost_usd":1.25,"latency_ms":1000,"retries":0,"recovery_requests":0,"permission_regressions":0,"unrecoverable_outputs":0}
{"pair_id":"CTS-PAIR-001","arm":"candidate","task_success":true,"accepted_change":true,"input_tokens":900,"cache_read_tokens":100,"cache_write_tokens":10,"output_tokens":180,"cost_usd":1.10,"latency_ms":1050,"retries":0,"recovery_requests":0,"permission_regressions":0,"unrecoverable_outputs":0}
```

Boolean-Felder sind echte JSON-Booleans. Alle Zahlen müssen endlich und nicht
negativ sein. Unbekannte Werte dürfen nicht als `0` erfunden werden; ohne
vollständige Provider-/Kostendaten ist dieser automatische Promotion-Evaluator
nicht das passende Gate. Zusätzliche Provenienz wie Repo-Revision, Modell,
Config-Hash, Reviewer und Task-Rubrik in separatem Manifest zur `pair_id`
speichern.

Auswertung:

```bash
node scripts/evaluate-benchmark.mjs /privater/pfad/runs.jsonl
```

stdout ist `claudestack.benchmark-result/v1`. Exit `0` = `promote`, Exit `1` =
`reject`, Exit `2` = `insufficient`, ungültige Nutzung oder ungültige Daten.
Mindestens zehn vollständige Paare sind nötig.

## CTS-BENCH-004 — Observer

- `/context`: Kontextzusammensetzung punktuell prüfen.
- `/usage`: native Nutzungsanzeige erfassen, soweit verfügbar.
- `ccusage`: optional vorhandene lokale Usage-Daten aggregieren.

ccusage bleibt Observer. Es darf keine Hooksettings verändern, keinen Prompt
ergänzen und wird nicht als Quelle eines Spareffekts bezeichnet. Version,
Zeitzone, Datenquelle und Filter mit Report speichern.

## CTS-BENCH-005 — Qualitätsvertrag

Vor Messung je Task definieren:

- erwartetes Ergebnis;
- zwingende Tests/Checks;
- verbotene Regressionen;
- Review-Rubrik;
- maximale Wiederholungen;
- Umgang mit Tool-/Netzwerkfehlern.

„Akzeptiert“ heißt: alle Muss-Kriterien erfüllt und Reviewer akzeptiert Ergebnis.
Nicht akzeptierte Runs zählen in Aufwand/Kosten; sonst entsteht Survivor Bias.

## CTS-BENCH-GATE-001 — Shadow → Canary

Alle Bedingungen:

- keine Taskblockade durch Hook;
- kein unerwartetes Hook-JSON;
- `doctor` ohne Error-Finding;
- keine Raw-Artefakte in Shadow;
- Hook-Overhead innerhalb vorab definierter lokaler Toleranz;
- Fail-open-Smokes bestanden.

## CTS-BENCH-GATE-002 — Canary → Enforce

Alle Bedingungen:

- Qualität nicht schlechter nach vorab gewählter Nichtunterlegenheitsregel;
- jedes erwartete Raw-Artefakt recoverbar und gegenüber der redigierten
  Tool-Response inhaltlich exakt;
- keine versteckte Fehler-/stderr-/Patch-/Security-Ausgabe;
- keine Secret-Leaks in sichtbarer Ausgabe oder publizierten Messdaten;
- Read-Escape-Valve funktioniert;
- Kosten pro akzeptierter Aufgabe verbessert sich nach vorab definierter
  praktischer Schwelle. Fehlen Kostendaten, Gate bleibt für Kosten offen.

Keine feste Prozentzahl wird hier vorgegeben. Team setzt Schwelle anhand
Messrauschen und wirtschaftlicher Relevanz vor dem Lauf.

Automatischer Evaluator ist konservativer Mindestvertrag: kein Permission-
Regressionsfall, kein unrecoverbarer Output, Task-Success- und Accepted-Change-
Rate nicht schlechter sowie geringere Gesamtkosten pro akzeptierter Änderung.
Er prüft keine statistische Signifikanz und ersetzt kein fachliches Review.

## CTS-BENCH-GATE-003 — Sofortiger Rollback

Ein Ereignis reicht:

- falsche Tool-Response-Form oder Claude-Hookfehler;
- Verlust nicht recoverbarer Ausgabe;
- Qualitäts-/Sicherheitsregression;
- mehrere mutierende Owner;
- unprivate oder unbeschränkte Artefakte;
- unerklärte Kostensteigerung über vorab gesetzte Toleranz;
- Recovery-/Prune-Verhalten weicht vom Vertrag ab.

Rollback auf `shadow`, bei Hookstörung `off` oder Settingsbackup.

## CTS-BENCH-006 — Report

Evaluator-Report enthält Arm-Summen/-Raten, Kosten pro akzeptierter Änderung,
Median akzeptierter Run-Kosten, Token-Summen, Latenz-p50/p95, Retry-/Recovery-/
Regression-Zähler und Entscheidungsgründe. Begleitreport ergänzt Taskset,
Ausschlüsse, Versionen, Config-Hash, Streuung, Qualitätsurteil, Incidents und
bekannte Biases. Prozentwerte immer mit Nenner und absolutem Wert. Fremde
Repository-Claims getrennt als „upstream berichtet“ kennzeichnen; nicht auf
diesen Stack übertragen.

## CTS-BENCH-007 — Endpunktdefinition: „fresh input"

**Der Endpunkt wird schriftlich festgelegt, bevor der erste Lauf startet.**
Nachträglich gewählte Endpunkte sind keine Messung, sondern eine Auswahl.

> **Primär:** Median der **gepaarten Differenz** von *fresh input* —
> uncached input plus `cache_creation`.
> **Sekundär:** output tokens, turns.

Warum nicht „Tokens gesamt": Cache-Reads sind billig und dominieren die
Gesamtzahl. Ein Werkzeug, das den Cache bricht und dadurch teurer wird, sieht in
der Gesamtzahl gut aus. *Fresh input* misst genau das, was neu bezahlt wird.

## CTS-BENCH-008 — Gepaarter Aufbau: vier Invarianten

Übernommen aus dem fünfmal iterierten Referenz-Harness der Squeez-v5-Serie. Die
Serien v1 und v2 wurden verworfen — an ihren Fehlern hängen genau diese vier
Regeln:

1. **Eingefrorenes Korpus mit SHA.** `chmod a-w`, SHA-Datei vor *und* nach jedem
   Lauf prüfen, Korpus-Kopie je Lauf, niemals in-place arbeiten.
   *(v1 scheiterte unter anderem an ~10 % Korpus-Drift zwischen den Armen.)*
2. **Mindestens drei gepaarte Replikate.** Gleiche Aufgabe in beiden Armen,
   wechselnde Reihenfolge, Median der Paar-Differenzen. Weniger als drei gültige
   Läufe ergeben eine Warnung, keine Entscheidung. **Ein unterbrochener Lauf ist
   kein Datenpunkt.**
3. **Anomaliedatei ist Pflicht je Lauf.** Jede Unterbrechung, jeder Dialog, jeder
   Timeout wird protokolliert. Fehlt die Datei, ist der Lauf **ungültig** — nicht
   „vermutlich in Ordnung". Das ist dieselbe Fail-loud-Regel wie im Verifier.
4. **Antwortschlüssel außerhalb der Messfläche.** Deterministisch vorab erzeugt,
   nicht im Korpus-Verzeichnis. Sonst liest der Arm die Antwort mit — und der
   Arm-Schalter verändert den Lesestoff. *(Zweiter v1-Fehler.)*

### Bewährte Zusätze

- **Streuung senken, nicht Replikate erhöhen.** Liegt die Streuung über ~25 %,
  ist die Grundlast das Problem. Die v4-Serie streute bei 200k Grundlast um
  ±33 %; dasselbe Setup kleiner und gebündelt kam auf 3 % bzw. 7 %.
- **Die 32-KB-Auslagerungsgrenze beachten.** Claude Code lagert große Ausgaben
  selbst als `persisted-output` aus. Fälle darüber messen nicht das Werkzeug,
  sondern den nativen Mechanismus.
- **Ein Verzeichnis je Lauf**, Zeitstempel im Laufnamen, Transkript-Auswertung
  strikt darauf gefiltert. Keine Wiederverwendung.
- **Maschinengebundenheit dokumentieren.** Pfade parametrisieren
  (`homedir`/`CLAUDE_CONFIG_DIR`), Abhängigkeiten in den Lauf-Header schreiben.
  Die Referenzskripte trugen maschinenspezifische Pfade — genau der Grund,
  weshalb ihre Zahlen nicht übertragbar sind.

### Was ein Arm-Harness nicht beantwortet

Er beantwortet **eine** Arm-Frage sauber. Die Governance-Frage „was kostet der
Stack im Alltag" beantworten nur dauerhaft laufende Zähler (`ccusage`,
`codeburn`) über eine längere Periode. Beide Messarten ersetzen einander nicht.

### Eine Nullmessung ist ein Ergebnis

Die Ladder-Serie ist der Präzedenzfall: **−0,3 % bei 27–33 % Streuung** ist kein
kleiner Gewinn, sondern nichts. Das zugehörige Hook-Gate kostete **+9,6 %**.
Beide Komponenten wurden daraufhin nicht übernommen — und die Messung, die sie
ausschließt, ist im Paket dokumentiert. Ein Effekt kleiner als die Streuung wird
nicht ausgerollt, egal wie plausibel der Mechanismus klingt.
