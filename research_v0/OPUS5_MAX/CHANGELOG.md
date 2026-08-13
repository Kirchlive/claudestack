# Changelog

## v3 — 2026-08-10

Zusammenführung von Durchgang 1 (Prefix- und Cache-Analyse, ~70 Repos) und
Revision 2 (Ownership- und Capability-Analyse, 226 Repos).

### Neu
- **Gesetz II** als Aufnahmekriterium: append-only gegen Prefix-Rewrite, belegt aus der
  offiziellen Prompt-Caching-Dokumentation. Katalog um `cache_risk` und `prefix_cost` erweitert.
- **Stufe 0 (Prefix-Diät)** als erste Stufe des Zielstacks, vor jeder Werkzeugentscheidung.
- **Regel R1** mit lauffähiger Implementierung (`prefix-budget.mjs`), inklusive Erkennung
  doppelter Mutatoren auf derselben Hook-Fläche.
- **Regel R2** (Dispatcher) als Auflösung für gewachsene Stacks mit mehreren Bash-Hooks.
- **Regel R8** (Beobachter-Regel): kontextinjizierende Hooks sind zulässig, aber budgetiert.
- Native Deckel als eigene Stufe mit konkreten `env`-Werten.
- Migrationskapitel mit den typischen Kollisionen eines gewachsenen Stacks.

### Übernommen aus Revision 2
- Gesetz I: parallele Hook-Ausführung, genau ein mutierender Eigentümer pro Fläche.
- Capability-Zustandsmaschine und Live-Canary vor jeder Mutationsbehauptung.
- Recovery-Pflicht, Net-Win-Gate, exakte Pfade für Fehler/Patches/Security/IaC/Krypto.
- Permission-Semantik von PreTool-Wrappern; Lizenz-Fences.
- Dreiteilung Slice- / modellsichtbare / End-to-End-Ersparnis.
- Retrieval- und Implementation Ladder.

### Korrigiert gegenüber Revision 2
- Reihenfolge umgedreht: Prefix vor Bash-Ausgabe — begründet mit den eigenen Zahlen
  aus deren Messkapitel (~2 % billed saving auf kleinen Tasks; median 0 % collapsible
  share über 136 Sessions).
- Capability-Skepsis präzisiert: `updatedToolOutput` gilt seit 2.1.121 für alle Tools;
  die zitierten Gegenbeobachtungen stammen aus der Zeit davor. Neue Warnung vor dem
  stillen Shadow-Fallback bei `hookActivation=auto` ohne gefahrenen Probe.
- Installationsrisiko benannt: Guard-Dateiname kollidiert mit einem bestehenden Guard.
- Katalog von 226 auf 251 erweitert; 25 Ergänzungen, darunter zwei der meistgesternten
  Repositories des Feldes, die in Revision 2 fehlten. Zwei bestehende Einträge mit
  gelesener README-Evidenz aufgewertet.

### Korrigiert gegenüber Durchgang 1
- Hook-Komposition war unbehandelt. Folge: eigene Messreihen, die auf Konfigurationen
  mit mehreren gleichzeitig aktiven Bash-Mutatoren entstanden sind, messen eine
  Komposition, deren Zusammensetzung nicht garantiert ist.
- Guard-Einzelempfehlungen ersetzt durch Owner-/Dispatcher-Architektur.
- Recovery-Pflicht, Permission-Semantik und Lizenz-Fences ergänzt.

### Verifikation des Vorgängerpakets
20/20 Checksummen OK · Guard und Canary syntaktisch valide · alle 18 tragenden
Repositories existieren auf GitHub · kein Code ausgeführt.
