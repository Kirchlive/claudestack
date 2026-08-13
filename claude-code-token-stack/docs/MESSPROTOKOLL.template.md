# MESSPROTOKOLL — Serie &lt;Nr&gt;

**Gegenstand:** &lt;was gemessen wird, z. B. Dispatcher `shadow` vs. aus&gt;
**Datum:** &lt;YYYY-MM-DD&gt; · **Maschine:** &lt;Kennung&gt; · **Claude Code:** &lt;Version&gt;
**Baseline-Referenz:** &lt;`/context`-Zahl aus Phase 0, gegen die gemessen wird&gt;

> Format nach K3-`VALIDIERUNG.md` §5. **Verworfene Serien bleiben im Dokument.** Die
> Ladder-Historie ist genau deshalb auswertbar: v1 (+39,3 %) steht neben v5 (−27,2 %),
> und erst der Vergleich zeigt, dass v1 an der Grundlast lag und nicht am Werkzeug.
> Eine gelöschte Fehlserie ist eine verlorene Erkenntnis.

---

## 1. Aufbau

| | |
|---|---|
| Arm A (Kontrolle) | &lt;Zustand, z. B. Dispatcher nicht registriert&gt; |
| Arm B (Behandlung) | &lt;Zustand, z. B. `mode: "shadow"`&gt; |
| Aufgabe | &lt;Datei, unverändert über alle Läufe&gt; |
| Korpus-SHA | &lt;aus `ab-harness.sh`, vorher = nachher&gt; |
| Replikate je Arm | &lt;n ≥ 3&gt; |
| Zielmetrik | **fresh input** = uncached + cache creation. Nicht Bytes, nicht Kompressionsrate. |

**Umgebung konstant?** &lt;env-Deckel, Plugins, `ENABLE_TOOL_SEARCH` — jede Abweichung
zwischen den Armen macht die Serie ungültig&gt;

---

## 2. Läufe

| Lauf | Arm | fresh input | cache read | output | Turns | quality_ok | Anomalien |
|---|---|---:|---:|---:|---:|---|---|
| A1 | A | | | | | | |
| A2 | A | | | | | | |
| A3 | A | | | | | | |
| B1 | B | | | | | | |
| B2 | B | | | | | | |
| B3 | B | | | | | | |

`quality_ok` ist **kein** Formfeld: es bedeutet, dass die Antworten fachlich
gleichwertig sind. Ein Tokengewinn bei gesunkener Qualität ist kein Gewinn.

---

## 3. Auswertung

| | Arm A | Arm B |
|---|---:|---:|
| Median fresh input | | |
| Streuung (max−min)/median | | % | %

**Gepaarte Differenz:** &lt;±x,x %&gt;
**Streuung des schlechteren Arms:** &lt;x %&gt;

| Gate-Bedingung | erfüllt? |
|---|---|
| ≥ 3 gepaarte Replikate je Arm | |
| Qualität unverändert (alle `quality_ok`) | |
| **Effekt größer als die Streuung** | |
| Korpus-SHA vorher = nachher | |
| `AB-ANOMALIES.md` je Lauf vorhanden (R8) | |

> Die dritte Zeile ist die, an der die Ladder-Serie gescheitert ist: **−0,3 % bei
> 27–33 % Streuung ist kein Effekt**, sondern Rauschen mit Vorzeichen. Der Report
> von `ab-harness.sh` prüft das maschinell und beendet sich mit Exit 3.

---

## 4. Urteil

- [ ] **Net-Win belegt** → Phase 7: `mode: "enforce"`, Wave-State fortschreiben
- [ ] **Nullergebnis** → Phase 7: Verlierer samt Hooks, State und env vollständig entfernen
- [ ] **Serie verworfen** → Grund: &lt;z. B. Grundlast zu hoch (R4), Arm nicht umgeschaltet, Korpus-Drift&gt;

**Begründung:** &lt;zwei bis drei Sätze&gt;

**Ein Nullergebnis ist ein Ergebnis.** Negative Evidenz wird dokumentiert, nicht
wiederholt, bis das gewünschte Vorzeichen erscheint.

---

## 5. Frühere Serien dieser Messreihe

| Serie | Datum | Ergebnis | Status | Grund |
|---|---|---:|---|---|
| | | | verworfen / gültig | |
