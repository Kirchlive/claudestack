# Architekturentscheidungen für den kontextbewussten KI-Entwicklungsstack

## Leitentscheidung

Der Zielstack ist **kein maximaler Plugin-Bund**, sondern ein schlankes, schichtenbasiertes System. Jede Schicht besitzt genau eine primäre Quelle der Wahrheit; optionale Beschleuniger dürfen Daten verkürzen oder erschließen, aber keine Regeln, Nachweise oder Entscheidungen verdecken. Die Reihenfolge lautet: **versioniertes Wissen → progressive Erschließung → kontrollierte Werkzeuge → deterministische Prüfung → datensparsame Messung**.

## Empfohlene Kernkombination

| Schicht | Primäre Wahl | Auslöser / Zweck | Nicht ersetzen durch |
|---|---|---|---|
| Agentenhost | Ein lokal nutzbarer, nativer Coding-Agent; Claude Code oder Codex CLI | Ein Host pro Arbeitskontext; Modellwechsel aufgabenbezogen | Mehrere gleichzeitig schreibende Agenten in einem Worktree |
| Steuerung | `AGENTS.md` plus schlanke `CLAUDE.md`-Brücke | Portierbare Regeln, Befehle, Architekturkarte und Qualitätsgates | Lange Systemprompts, verstreute unversionierte Notizen |
| Prozeduren | Kleine, geprüfte Agent Skills | Wiederkehrende Verfahren mit klarem Auslöser | Pauschale Skill-Sammlungen aus fremden Repositories |
| Aktiver Plan | Native Host-Planung; bei Langläufern dateibasiertes Planprotokoll nach planning-with-files | Mehrphasige oder delegierte Arbeit, Sitzungswechsel, hoher Unterbrechungswert | Vektor-Memory oder Chat-Verlauf als Statusquelle |
| Dauerwissen | `docs/adr/`, Runbooks, Tests und gepflegte Projektanweisungen | Architekturentscheidungen und verifizierte Betriebswissen | Automatisch generierte Memory-Zusammenfassungen als alleinige Wahrheit |
| Codekontext | Datei-/Textsuche als Default; CodeGraph bei großen, langlebigen Repositories | Abhängigkeiten, Aufrufer, Symbolbeziehungen gezielt erschließen | Vollständige Codebase-Dumps in jeder Session |
| Übergabe / Forensik | Repomix, commitgebunden und gefiltert | Einmalige Codebasisaufnahme, Review, externer Agent oder Incident | Laufender Kontextindex |
| Laufzeitverdichtung | Squeez als erster Pilot; Claw Compactor nur als Alternative | Lange Logs, repetitive Toolausgaben, Suche und Diffs | Verlustbehaftete Zusammenfassung ohne Rückholpfad |
| Toolzugriff | Kuratierter MCP-Katalog, Schema- und Policy-gesteuert; Sandbox-Code-Modus bei Datenflüssen | Externe Systeme, Datenfilter, Mehrschrittorchestrierung | Immer alle MCP-Schemas und Ergebnisse im Kontext |
| Qualitätsgates | Projekt-native Tests, Linting, Typprüfung, SAST, Review-Checkliste | Vor Merge, Release und privilegierten Aktionen | Selbstbericht des Agenten |
| Messung | CCUsage lokal; OTEL nur bei Team-/Auditbedarf | Kosten, Latenz, Fehlerrate und Erfolgsmetriken | Zentrale Protokollierung von Prompts, Code oder Geheimnissen |

## Eindeutige Zuständigkeiten

| Artefakt | Eigentümer | Speicherort | Lebensdauer | Integritätsregel |
|---|---|---|---|---|
| Projektregeln und Befehle | Team | `AGENTS.md`, verschachtelt nach Teilbereich | langlebig | Pull-Request-Review und Tests bei Befehlsänderungen |
| Host-spezifische Ergänzungen | Team | `CLAUDE.md` als Import-Brücke | langlebig | Keine Duplikate der portablen Regeln |
| Entscheidung und Begründung | Team | `docs/adr/` | langlebig | Nummeriert, datiert, verlinkt zu Issue/PR |
| Aktiver Aufgabenstand | verantwortlicher Agent / Mensch | `.planning/` oder native Planung | vorübergehend | Ziel, Akzeptanzkriterien, Status und Nachweise |
| Codebeziehungen | lokaler Indexer | ignorierter lokaler Cache | regenerierbar | Bindung an Commit/Working-Tree-Hash |
| Komprimierte Tooldaten | Kontextadapter | temporär, referenziert | kurz | Original abrufbar, semantische Tests im Pilot |
| Externe Toolausgaben | MCP-Gateway / Sandbox | flüchtig oder minimal auditierbar | kurz | JSON-Schema, Größenlimit, Sensitivitätsklasse |
| Telemetrie | Entwickler:in / Plattformteam | lokal oder zentral pseudonymisiert | begrenzt | Kein Prompt-/Quellcodeexport im Standard |

## Schwellwerte und Stop-Regeln

| Situation | Aktivierung | Pflichtkontrolle | Stop- / Rückfallregel |
|---|---|---|---|
| Kleine, klar abgegrenzte Änderung | Native Planung, Datei-/Textsuche | Tests der geänderten Einheit | Keine Indexer, kein Langzeit-Memory, keine Kompression |
| Mehrphasige Änderung oder Übergabe | Dateibasierter Plan und Skill für Review/Tests | Akzeptanzkriterien, Fortschrittsnachweis | Plan nach Abschluss archivieren oder löschen |
| Großes / polyglottes Repository | CodeGraph-Pilot | P95-Abfragezeit, Trefferqualität, Indexfrische | Bei schwacher Trefferqualität auf Suche + Originaldateien zurückfallen |
| Wiederholte große Toolausgaben | Squeez-Pilot | Original-Retrieval, Erhalt von Exit-Code, Pfad und Fehlertext | Kompression deaktivieren, sobald Tests/Diagnose messbar schlechter werden |
| >10 Tools oder >10K Tokens Toolschemas | Toolsuche / Capability-Katalog | Schema-Validierung und Toolinventar | Keine automatische Freigabe mutierender Werkzeuge |
| Große Datenmengen / 3+ Toolschritte | Sandbox-Code-Modus | Zeit-/Ressourcenlimits, Egress-Policy, Ausgabebegrenzung | Direkter Call oder menschliche Prüfung bei sichtbarer Zwischenbegründung |
| Nichtregulierte Einzelnutzung | optionaler Claude-Mem-Pilot | Speicherort, Retention, Löschung, Recall-Evaluation | Kein Einsatz bei unklarer Datenhaltung |
| Team, Kundendaten oder Compliance | ADRs, kurze Regeln, OTEL-Policy, kein Auto-Memory zuerst | Sicherheitsreview, Freigaben, Datenklassifizierung | Nur explizit zugelassene Tools und zentrale Logminimierung |

## Anti-Patterns

| Anti-Pattern | Warum es scheitert | Entsprechende Regel |
|---|---|---|
| Jede gefundene Erweiterung installieren | Mehr Hooks, Überschneidungen, unklare Kontrolle und hoher Startkontext | Pro Problem genau ein primärer Baustein; Alternativen bleiben deaktiviert |
| Gesamtcodebasis in jeden Prompt legen | Schlechtere Aufmerksamkeit und höhere Kosten | Progressive Suche, Indexierung erst ab Schwellenwert, Repomix punktuell |
| Auto-Memory als Projektdokumentation | Zusammenfassungen können veralten, halluzinieren oder Daten weitergeben | ADRs/Runbooks/Tests sind die dauerhafte Quelle der Wahrheit |
| „Token sparen“ ohne Qualitätsmessung | Kürzung kann Fehlersignale und Randbedingungen verlieren | Erfolgsrate, Diagnosezeit und Teststatus gegen Tokenkosten messen |
| Ungeprüfte MCP-/Skill-Installation | Prompt-Injection-, Egress- und Supply-Chain-Risiko | Pinning, Inhaltsreview, Least Privilege, Sandbox und human-in-the-loop |
| Prompt-/Diff-Logging als Standard | Unnötige Datenexposition und hohe Speicherungskosten | Metriken zuerst, Inhalte nur begründet und explizit freigegeben |

## Pilotpriorität

1. Portable Projektsteuerung: `AGENTS.md`, `CLAUDE.md`-Brücke, Qualitätsbefehle und ADR-Template.
2. Zwei bis fünf eigene Skills für Onboarding, Implementierung, Review/Test und Release.
3. CCUsage mit Erfolgsmetriken und ein kleines Benchmark-Korpus echter Aufgaben.
4. CodeGraph für passende große Repositories und Squeez für ausgabenlastige Aufgaben als getrennte A/B-Piloten.
5. MCP-Gateway mit Toolsuche, Schema-Validation und Sandbox-Code-Modus.
6. Erst nach einem belastbaren Datenschutz- und Recall-Pilot: automatisiertes Langzeitgedächtnis und zentrale OTEL-Ansicht.
