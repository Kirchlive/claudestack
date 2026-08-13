# evidence/ — Archiv

**Diese Dateien werden im Betrieb nicht gelesen.** Kein Laufzeitpfad, kein Hook, keine
CLI und kein Test greift auf `evidence/` zu. Der Ordner trägt den Nachweis, wie das
Paket entstanden ist — Messreihen, Bewertungen, Konzepte, verworfene
Implementierungen. Er ist Beleg, nicht Programm.

## Warum das getrennt ist

Das Paket führt genau einen mutierenden Owner je Kontextfläche (Gesetz I). Drei der
hier archivierten Dateien sind konkurrierende Implementierungen derselben Fläche.
Sie sind aufbewahrt, weil ihre Messwerte und Defektbefunde weitergelten — nicht,
weil sie eingesetzt werden könnten. Wer eine davon aktiviert, verletzt die Invariante,
auf der der Dispatcher aufbaut.

## Inhalt

| Verzeichnis | Dateien | Herkunft und Inhalt |
|---|---:|---|
| `gpt56/` | 7 | Validierungsserie des Trägerpakets: Crosswalk, Ladder-Referenzaudit, Token-Metriken (CSV + JSON), Zweitvalidierung, Konsolidierung, Eingangsabgleich |
| `k3/` | 18 | Konzept, Validierung, Messreihen, Review- und Vergleichsberichte; die drei Ladder-Hooks samt Konfiguration |
| `k3/issues/` | 3 | Rohdaten der Issue-Recherche (`issues_out*.txt`) |
| `opus5/` | 6 | Konzept v5, Masterplan, README und das Trio des dritten Bash-Dispatchers |

## Drei Stücke, die man kennen sollte

**Die Ladder-Hooks** (`k3/ladder-retrieve-gate.mjs`, `ladder-retrieve-filter.mjs`,
`ladder-ledger.mjs` mit `ladder-config.json`) sind gemessen und verworfen: das Gate
kostete **+9,6 %**, der Filterpfad brachte **−0,3 %** bei 27–33 % Streuung — also
nichts. Sie liegen hier als Referenz für die Messmethode, nicht als Option.

**Der dritte Dispatcher** (`opus5/bash-owner-dispatch.mjs` samt Konfigurations- und
Registrierungsbeispiel) besetzt dieselbe Fläche wie `src/stack.mjs`. Sein
Matcher-Auflösungsverfahren ist die Vorlage für den D1-Fix im Prefix-Wächter.

**Die Messevidenz** (`k3/VALIDIERUNG.md` §5/§6) ist die einzige real ausgeführte
Paketprüfung des Korpus. Ihre Token- und Latenzwerte sind allerdings Fremdmessungen
ohne Rohlogs und nicht unabhängig reproduziert.

## Wie damit umzugehen ist

Zitate aus diesem Ordner tragen **Modell und Stand** (ADR-017). Mehrere Werte sind
zwischen den Fassungen gewandert — der Toonify-Wert etwa steht in v4 bei 85 und in
v5.1 bei 72. Ein Zitat ohne Stand dokumentiert womöglich einen überholten Befund.

Alle Zahlen hier stammen von **fremden Maschinen**. Für Entscheidungen auf dieser
Installation gilt ausschließlich die eigene Baseline-Messung; die archivierten Werte
liefern Größenordnung und Methode, keine Gates.

**Provenienz je Datei:** `../MERGE-MANIFEST.tsv` (Quelle, Ziel, SHA-256, Fläche, Begründung).
