# LADDER — Stufenmodell für Session- und Kompressionsdruck

_Zweck: feste, vorab definierte Reaktionen auf Kontextdruck — statt
improvisierter Einzelentscheidungen. Urheber des Stufenmodells: KIMI;
Trigger hier präzisiert und mit den Squeez-Messwerten (v1–v5) verriegelt.
Beobachter im Paket: `session-economy.mjs` (Druckbänder 70/80 %, advisory)._

> ## Geltungsbereich — eng, und das ist der ganze Punkt
>
> **Der einzige gemessene Gewinn dieser Ladder gilt für Quelltext unter 32 KB.**
> Die −27,2 % der v5-Serie wurden auf gebündelten Quelltext-Stashes erhoben, und
> nur dort. Über alle Ausgabetypen hinweg gemessen bleibt **−0,3 % bei 27–33 %
> Streuung** — also nichts. Das Hook-Gate auf derselben Fläche kostete **+9,6 %**.
>
> Daraus folgt für dieses Paket:
>
> - **Kein Ladder-Hook ist registriert.** `ladder-retrieve-gate` und
>   `ladder-retrieve-filter` liegen unter `evidence/k3/` als Referenz und werden
>   nicht übernommen.
> - Wer die Rung-2-Komponente dennoch aktiviert, beschränkt sie **hart** auf
>   Quelltext > 4.000 Zeichen und < 32 KB. Außerhalb dieser Klasse ist der Effekt
>   gemessen null oder negativ.
> - Ein Effekt kleiner als die Streuung ist kein Effekt. −0,3 % bei 27–33 %
>   Streuung ist eine Nullmessung, kein kleiner Gewinn.
>
> **Negative Evidenz ist Evidenz.** Diese Ladder bleibt im Paket dokumentiert,
> weil die Messung, die sie ausschließt, mehr wert ist als die Vermutung, die sie
> eingebracht hätte.

## Die Stufen

| Stufe | Trigger | Aktion | Ökonomie |
|---|---|---|---|
| **0 — Filter/Disziplin** | immer | Stufe-0/1-Maßnahmen: Prefix-Diät, native Deckel, enge Kommandos, Deny-Regeln, `# token-raw` wo Exaktheit nötig | kostet nichts, größter Hebel (T1/T6/T7) |
| **1 — Straffen** | **60–70 %** Kontextdruck | TASK-STATE aktualisieren; laufende Exploration schließen; keine neuen Themen öffnen; Subagenten für weitere Bulk-Reads | Tail wächst linear → Kosten quadratisch; Straffen macht linear daraus |
| **2 — Compact + Snapshot** | **80–85 %** | PreCompact-Snapshot des Zustands (compact-plus-Pilot oder Eigenbau-Snapshot, fail-open), dann native Kompaktierung | Kompaktierung 180K → ~40K [SEKUNDÄR]; Skill-Reinjektion ~4.000 Tokens einplanen; Rules-Re-Injektion vermeiden (Issue #32057: 93k = 46 %) |
| **3 — Clear + HANDOFF** | **> 90 %** oder Cold-Cache-Fall | `.claude/TASK-STATE.md` als vollständigen Handoff schreiben (Template), dann `/clear`, frische Session | Cold-Cache-Ökonomie: ab ~60k Tokens UND ~55 min Lücke ist Neuaufbau billiger als Weiterführen |

## Fallbacks (fortschrittsbasiert, nicht prozentbasiert)

- **> 25 Tool-Calls** in einem Zweig ohne bestätigten Zwischenbefund → Stufe 2.
- **> 40 Tool-Calls** → Stufe 3 (der Zweig ist per Messung entgleist).
- Unterbrochene Messung/Session → **kein** Fortsetzen „irgendwo mittendrin":
  ein Wiederaufsatz baut den Prompt-Cache neu auf (Faktor 2 beobachtet) —
  Zustand sichern, sauber neu starten.

## Kompressions-Teilnehmer (nur wo gemessen)

| Mechanismus | Status | Geltungsbereich |
|---|---|---|
| `ladder-ledger.mjs` Rung-2-Nudge (`ladder <key>` auf Quelltext-Stashes) | **nicht übernommen** — die einzige Komponente mit gemessenem Gewinn, aber kein Ladder-Hook ist in diesem Paket registriert (siehe oben). Code liegt als Referenz unter `evidence/k3/` | Quelltext-Strukturfragen, > 4.000 Zeichen, max. 5 Hinweise/Session; v5 maß **−27,2 %** fresh input — Fremdmessung, auf dieser Installation nicht reproduziert |
| squeez R1 als Standardsicht | **abgelehnt** | stille Kürzung vor der Antwort, `[×n]`-Marker zerstören Codestruktur |
| Hook-Gate auf `squeez_retrieve` (ladder-retrieve-gate) | **aus** (`rung2Mode: "off"`) | gemessen **+9,6 %** (v2) — Referenz im Paket, nie registrieren |
| ladder-retrieve-filter | **aus** | besseres Design, keine eigene Rechnungs-Messung — Referenz |
| Cross-Call-Dedup | **aus** | sessionübergreifender Cache unterschlägt fremden Inhalt |
| compact-plus | **Pilot (Stufe 2)** | dokumentierte Hook-Oberfläche, fehlende State-Schicht; eigenes Pilot-Gate |
| magic-compact | **Profil B** | cache-schonende /compact-Alternative mit Retrieve-Pfad |

## Nicht verwechseln

Die **Implementation Ladder** (ponytail, Stufe 6 des Konzepts: „existieren?
im Repo? stdlib? nativ? dependency? deklarativ? → kleinste korrekte Fassung")
ist namensgleich, aber inhaltlich unabhängig — sie begrenzt Modell-**Ausgabe**
(−10,3 %, p = 0,004), diese Ladder hier begrenzt **Session-Wachstum**.

## Messpflicht

Jede Stufenänderung ist ein Arm: Endpunkt vorab (Median gepaarte Differenz
fresh input), ≥ 3 Replikate, Anomaliedatei, Qualitätsgate vor Tokengate.
Gepaarte Serienwerte zur Erinnerung: Gate +9,6 % · Kommando-Leiter über alle
Typen −0,3 % · Quelltext gebündelt −27,2 %. **Nur die enge Klasse trägt.**
