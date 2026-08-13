# MESSPLAN — Baseline-Metriken, Replikate, E2E als einzige Wahrheit

_Bindet die Messdisziplin aus dem Squeez-Projekt (v1-invalid → v5) an den
Rollout. Kern: **End-to-End ist die einzige Wahrheit** — Slice- und
modellsichtbare Ersparnis sind Diagnosegrößen, keine Ergebnisse._

> ## Alle Schwellenwerte hier sind provisorisch
>
> Die Zahlen in diesem Dokument — Cache-Hit > 90 %, Streuung < 25 %, 86,3 ms
> Hook-Overhead, 10–20 Aufgaben — stammen aus fremden Messreihen auf fremden
> Maschinen. **Sie sind Startwerte für die eigene Erhebung, keine Gates.**
>
> Ein Beispiel für die Größenordnung des Unterschieds: der Korpus geht von 25
> aktiven Plugins und einem Prefix von 1.975 Token aus. Auf der Maschine, auf
> der dieses Paket zusammengeführt wurde, waren es **null Plugins und keine
> Root-`CLAUDE.md`** — die dateibasierten Kontextflächen kosteten 280 Token
> statt 4.959. Wer die Korpus-Schwellen als Abnahmekriterien übernimmt, prüft
> gegen eine Maschine, die es nicht gibt.
>
> **Verfahren:** Jede Schwelle wird in der eigenen Baseline-Erhebung neu
> bestimmt und dann eingefroren. Erst ab diesem Zeitpunkt ist sie ein Gate.
> Bis dahin ist sie eine Erwartung — und Erwartungen entscheiden nichts.

## 1. Die drei Ersparnisbegriffe (nie vermischen)

1. **Slice-Ersparnis:** lokal entfernte Bytes an einer Stelle (z. B. Guard-Footer).
2. **Modellsichtbare Ersparnis:** weniger Tokens im einzelnen Request.
3. **End-to-End-Ersparnis (E2E):** abgerechnete Tokens über die ganze Aufgabe —
   inklusive Cache-Creation, Zusatzrunden, Retries, Recovery, Rohabrufe.
   **Nur diese entscheidet über Gates.** Nenner-Warnung (T3): auf falscher
   Basis (Fixture statt Abrechnung) überschätzt ein Filter Faktor ~32×.

## 2. Baseline-Metriken (Wave 1, vor jeder Änderung)

Pro Lauf aufzeichnen (ccusage + codeburn als Quelle, Transkript-basiert):

| Metrik | Definition | Bemerkung |
|---|---|---|
| fresh input | uncached input + cache_creation | **primärer Endpunkt** |
| cache reads + Hit-Rate | cache_read / Gesamt-Input | Invariante: > 90 % |
| output tokens | gesamte Modellausgabe | sekundär |
| turns / tool calls | Anzahl, davon Recovery/Retries | Recovery-Anstieg = Stop-Signal |
| latency / hook overhead | Wanduhr je Call | squeez-Präzedenz: 86,3 ms/Call |
| task success | Tests/Build/Abnahmekriterium | **Qualitätsgate vor Tokengate** |
| raw retrievals / user interventions | manuelle Zählpunkte | versteckte Kosten der Kompression |
| cost per accepted change | codeburn-Kennzahl | Governance-Loop |

Baseline-Umfang: 10–20 reale Aufgaben aus dem Alltagsmix, unveränderte
Installation, **≥ 3 Replikate je Aufgabenklasse**, Median + Streuung
(< 25 %, sonst Grundlast senken statt Replikate erhöhen).

## 3. Versuchshygiene (unverhandelbar, aus v1-invalid gelernt)

1. **Endpunkt vor der Messung fixieren** (Median gepaarte Differenz fresh
   input; sekundär output, turns). Nachträglich gewählt = keine Messung.
2. **Gepaart:** gleiche Aufgabe, beide Arme, wechselnde Reihenfolge;
   Median der Paar-Differenzen, nie Summen über Arme.
3. **Eingefrorenes Korpus:** `chmod a-w`, SHA vor/nach jedem Lauf
   (`corpus-v5.sh`-Muster); Korpus-Kopie je Lauf; Zeitstempel im Laufnamen
   (keine Transkript-Wiederverwendung, `--project`-Filter).
4. **Anomaliedatei Pflicht** je Lauf (`AB-ANOMALIES.md`-Muster):
   Unterbrechungen, Dialoge, Timeouts — sonst ist der Lauf ungültig.
5. **Antwortschlüssel deterministisch vorab** berechnen und außerhalb der
   Messfläche ablegen (`ANSWERS-v5.md`-Muster); Qualität wird gegen ihn
   geprüft, nicht „gelesen und für gut befunden".
6. **Ein unterbrochener Lauf ist kein Datenpunkt** (Cache-Neuaufbau,
   Faktor 2 gemessen).
7. `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=0` und
   `SQUEEZ_WRAP_TIMEOUT_SECS >= 600` in Messläufen; Messartefakte nie ins
   Korpus-Verzeichnis schreiben (Arm-Schalter verändert sonst den Lesestoff).
8. Keine Profil-/Plugin-/MCP-Änderungen mitten in einem Arm
   (Prefix-Invalidierung, Gesetz II).

## 4. Gepaartes A/B (Standardverfahren)

- Arm-Größe: ≥ 3 gültige Läufe je Arm; < 3 → Warnung, keine Entscheidung.
- Auswertung: Median gepaarte Differenz fresh input + Streuung je Arm;
  Qualitätsvergleich gegen Antwortschlüssel zuerst.
- Entscheidung: Net-Win = E2E fällt signifikant über der Streuung UND
  Qualität non-inferior. Gleichstand → einfacherer Arm gewinnt.
- Referenz-Implementierungen: `Squeez-RTK-Ladder/ladder-ab.mjs` (Arm-Schalter,
  --project-Filter, <3-Warnung) und der v5-Harness (siehe
  `scripts/benchmark-harness.md`).

## 5. E2E-Wahrheit und Governance

- **ccusage** (Kosten/Cache) + **codeburn** (Kosten je akzeptierter Änderung)
  laufen ab Tag 1 mit; realisierte Werte ersetzen jede Schätzung.
- **Cache-Hit > 90 %** ist Invariante: jeder Arm, der sie bricht, verliert
  unabhängig vom Input-Median.
- **Nicht-Additivität (T5):** Ersparnisse einzelner Stufen werden nie
  summiert; der Gesamtgewinn wird nur als E2E-Differenz zur Baseline gemessen.
- Telemetrie nur nutzerseitig (lokal, privat, 0600); keine Hook-Daten in
  Fremd-Dashboards (Otel-Smuggling-Warnung).
- Jeder Messbericht endet mit: Arm-Definition, Endpunkt-Vorab-Fixierung,
  Replikatzahl, Streuung, Anomalien, Qualitätsvergleich, Entscheid —
  oder er gilt nicht als Messung.

## 6. Erwartete Messpunkte je Wave

| Wave | Primärer Endpunkt | Sekundär |
|---|---|---|
| 1 Baseline | fresh input Median je Klasse | Cache-Hit, output, turns |
| 2 Prefix | Prefix-Tokens/Session (/context, vorher/nachher) | fresh input Folgeeffekt |
| 3 Deckel/Canary | BASH_MAX_OUTPUT_LENGTH-Kopplung, Canary-Record | Truncation-Rate, Recovery |
| 4 Retrieval | fresh input + tool calls auf Relationsfragen | Antwortqualität (Schlüssel) |
| 5 Shadow | hypothetische Einsparung aus Guard-Metriken | fail-open-Log: 0 versteckte Fehler |
| 6 Enforce/A-B | Median gepaart fresh input, log/test/build-Taskset | Raw-Retrievals, Footer-Overhead |
| 7 Pilots | je Pilot eigener Arm + Endpunkt | Cache-Write-Aufschlag (Gesetz II) |

## 7. Protokollvorlage

Jeder Lauf wird nach [`MESSPROTOKOLL.template.md`](MESSPROTOKOLL.template.md)
festgehalten — Serienformat mit Arm, Aufgabe, fresh-input-Tokens, Qualitätsurteil
und Streuung. Die Vorlage trägt ausdrücklich auch **verworfene** Serien: die
Ladder-Historie ist nur deshalb auswertbar, weil dort v1 mit +39,3 % als verworfen
dokumentiert ist und nicht stillschweigend verschwand.
