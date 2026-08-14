# Native Mechanismen schlagen das Werkzeug — Messungen vom 14.08.2026

## 1. Tool Search: die größte gemessene Einsparung des Projekts

`/context` weist deferierte Werkzeugschemata getrennt aus:

| Posten | Token | Zustand |
|---|---:|---|
| MCP-Werkzeuge (73), deferiert | **39.600** | nicht geladen |
| System-Werkzeuge, deferiert | **15.300** | nicht geladen |
| **Summe** | **54.900** | durch `ENABLE_TOOL_SEARCH=true` |

Zum Vergleich: Der Dispatcher spart nach acht Phasen Umsetzungsarbeit **~1.988 Token je Sitzung**.
Die native Funktion spart **54.900 permanent** — Faktor 27.

Das ist die empirische Bestätigung von Leitplanke L-2 ("nativ zuerst") in einer Deutlichkeit,
die der Korpus nie erreicht hat. Sechs Bewertungsrunden über Fremdwerkzeuge, während die größte
Einsparung aus einer Umgebungsvariable in `~/.bashrc` kommt, die als Maßnahme nirgends geführt wird.
Der Plan riet in AP-1.6 sogar davon ab, sie zu setzen; die Meta-Validierung §9 empfahl sie.
**Die Meta-Validierung hatte recht, und der Effekt ist größer als beide annahmen.**

## 2. Der Preis eines Plugins — erstmals gemessen

Nach Aktivierung von `plugin-dev` und `skill-creator`:

| Posten | vorher | nachher | Delta |
|---|---:|---:|---:|
| Skills | 2.100 | 3.200 | +1.100 |
| Custom agents | 0 | 1.200 | +1.200 |
| Memory files | 279 | 340 | +61 |
| **Summe für 2 Plugins** | | | **~2.360** |

Hochgerechnet auf die 25 Plugins der Korpus-Referenzmaschine: rund **30.000 Token** permanent.
Das erklärt, warum die Plugin-Diät dort als größter Hebel geführt wurde — und bestätigt sie
nachträglich als richtige Priorität, obwohl sie auf dieser Maschine gegenstandslos war.

**Zwei Plugins kosten so viel, wie der Dispatcher in einer Sitzung einspart.**

## 3. Genauigkeit von prefix-budget

| | geschätzt | gemessen | Abweichung |
|---|---:|---:|---|
| 8 Plugin-Skills | 849 | ~1.100 | **−23 %** |

Der Korpus gibt für dieses Werkzeug 6,5 % Abweichung an (plugin-diet.md). Real sind es hier 23 %
Unterschätzung. Die Größenordnung stimmt, die Genauigkeit nicht — brauchbar zur Orientierung,
untauglich als Messgrundlage.

Weiterhin unsichtbar bleiben ihm die 15 eingebauten Skills und die Werkzeugschemata; er sieht
ausschließlich Dateisystemquellen. Der Befund aus `PREFIX-FLAECHE-BEFUND.md` gilt insoweit fort.

## 4. Was daraus folgt

Die Rangfolge der Hebel auf dieser Installation, alle selbst gemessen:

| Rang | Hebel | Wirkung | Art |
|---|---|---:|---|
| 1 | Tool Search (`ENABLE_TOOL_SEARCH=true`) | 54.900 Token permanent | nativ |
| 2 | Keine Plugins aktivieren | ~1.180 Token je Plugin | Verzicht |
| 3 | Keine Root-`CLAUDE.md` | 1.975 Token (Referenzwert) | Verzicht |
| 4 | Dispatcher `enforce` | ~1.988 Token je Sitzung | Werkzeug |

Drei der vier größten Hebel kosten nichts und brauchen kein Werkzeug. Der Dispatcher steht an
vierter Stelle — er ist die einzige Position, die überhaupt Software erfordert, und er greift nur
bei Bash-Ausgaben über 4.096 B.

Das ist kein Argument gegen ihn: Er wirkt dort, wo die nativen Mittel nichts ausrichten. Aber es
ordnet die Verhältnisse. Wer Kontext sparen will, setzt zuerst eine Umgebungsvariable und
installiert dann sechs Monate lang nichts.
