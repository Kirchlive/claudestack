# Konzept für einen kontextbewussten KI-Entwicklungsstack

**Stand:** 13. August 2026  
**Autor:** Manus AI  
**Zweck:** Ein schlanker, überprüfbarer und herstellerneutral anschlussfähiger Stack für KI-gestützte Softwareentwicklung mit dauerhaft gutem Kontextmanagement.

> **Kernempfehlung:** Der beste Stack ist nicht die Summe aller Erweiterungen, sondern eine klar geschichtete Kombination aus **versioniertem Projektwissen**, **progressiver Kontexterschließung**, **kontrolliertem Werkzeugzugriff**, **deterministischer Qualitätsprüfung** und **datensparsamer Messung**. Die Standardinstallation bleibt klein; kosten- oder kontextoptimierende Erweiterungen werden nur nach einem eigenen Pilot mit Qualitäts- und Rückfallkriterien aktiviert.

## Management Summary

Die bereitgestellte Sammlung wurde als Markt- und Ideenkorpus behandelt. Nach Normalisierung enthält sie **104 eindeutige Repository-Verweise** und bündelt sich vor allem in Arbeitsablauf/Skills, Bedienoberflächen, Beobachtbarkeit, Kontextoptimierung, Langzeitgedächtnis, Integrationen sowie Codebasiserschließung. Der richtige Schluss daraus ist nicht, möglichst viele dieser Projekte zu kombinieren. Vielmehr zeigen die Repositories wiederkehrende, aber unterschiedliche Probleme: dauerhafte Regeln, aktive Aufgabenplanung, Code-Retrieval, Tool-Ausgaben, externe Aktionen, Kostenkontrolle und Sitzungsübergaben benötigen jeweils **eine klar begrenzte Zuständigkeit**.

Aktuelle Primärquellen stützen diese Architektur. Dauerhafte Regeln sollen kurz, spezifisch und hierarchisch sein; ausführliche Verfahren gehören in bedarfsgeladene Skills oder pfadbezogene Regeln. Länger laufende Agenten benötigen strukturierte Notizen außerhalb des Kontextfensters, während Werkzeuge und deren Ergebnisse progressiv offengelegt werden sollen.[1] [2] [3] Der so entstehende Stack bleibt nicht an einen einzelnen Modellanbieter gebunden: `AGENTS.md` ist die portable Hauptoberfläche; eine schlanke `CLAUDE.md` importiert sie bei Claude Code.[1] [3]

| Ebene | Jetzt standardisieren | Nur nach Bedarf/Pilot | Bewusst nicht als Standard |
|---|---|---|---|
| Agentenhost | **Ein** nativer Coding-Agent pro Worktree, z. B. Claude Code oder Codex CLI | Modell-/Hostwechsel nach Aufgabenprofil | Mehrere parallel schreibende Agents im selben Arbeitsbaum |
| Projektsteuerung | `AGENTS.md`, `CLAUDE.md`-Importbrücke, ADRs, Runbooks | Spezifikationsprotokoll mit Spec Kit | Ein großer, globaler Systemprompt |
| Prozedurwissen | Kleine, versionierte Agent Skills | Zusätzliche Domänenskills nach Evaluation | Unkuratierte Skill-Sammlungen |
| Aktive Arbeit | Native Planung; bei Langläufern Dateiplan | planning-with-files | Chatverlauf oder Vektor-Memory als alleiniger Aufgabenstatus |
| Codekontext | Datei- und Textsuche | CodeGraph, Repomix | Vollständiger Codebasisdump bei jeder Aufgabe |
| Kontextökonomie | Originaldaten, Referenzen und native Kompaktierung | Squeez; TOON im Gateway; Claw Compactor als Alternative | Verlustbehaftete globale Kompression ohne Rückholpfad |
| Externe Werkzeuge | Kuratiertes MCP mit Schema- und Freigabepolitik | Sandbox-Code-Modus bei Datenflüssen | Alle Tools und Schemas dauerhaft im Startkontext |
| Beobachtbarkeit | CCUsage lokal | OTEL/Prometheus/Grafana für Teams | Zentrale Speicherung vollständiger Prompts oder Diffs |

## 1. Methode und Bewertungskriterien

Die Konzeption trennt absichtlich zwischen **Ecosystem-Scan**, **vertiefter Prüfung** und **Produktentscheidung**. Das Repository-Inventar kategorisiert den gesamten bereitgestellten Korpus. Die vertiefte Prüfung konzentriert sich auf repräsentative, technisch komplementäre Kandidaten sowie auf Primärquellen für Regeln, Skills, MCP und Kontextmanagement. Deshalb ist dieses Dokument keine Behauptung, jede genannte Erweiterung sei einzeln produktionsreif; es ist ein transparentes Auswahlkonzept mit einem kontrollierten Pilotpfad.

| Bewertungsdimension | Leitfrage | Konsequenz für die Auswahl |
|---|---|---|
| Kontextnutzen | Erhöht der Baustein die Relevanz des verfügbaren Kontexts? | Progressive Suche und pfadbezogene Regeln vor Gesamt-Dumps |
| Korrektheit | Bleiben Originale, Fehlerzeichen und Nachweise abrufbar? | Reversible oder zitierbare Artefakte vor Black-Box-Zusammenfassungen |
| Portabilität | Funktioniert das Muster mit mehreren Coding-Agents? | `AGENTS.md`, Agent Skills und Standardprotokolle vor proprietären Duplikaten |
| Betriebslast | Wie viele Hooks, Dienste, Caches und Updates entstehen? | Ein primärer Baustein je Problemklasse |
| Sicherheit | Welche Daten, Rechte und Egress-Wege eröffnet der Baustein? | Least Privilege, Sandbox, Pinning, Audit und Bestätigungspflichten |
| Messbarkeit | Lässt sich die Wirkung auf Qualität, Zeit und Kosten zeigen? | Pilot nur mit Baseline, Zielmetrik und Rückfallregel |

Diese Kriterien führen zu einer wichtigen Abgrenzung: **Tokenreduktion ist kein eigenständiges Ziel.** Sie ist nur dann wertvoll, wenn die Erfolgsrate, Diagnosefähigkeit und Testqualität mindestens erhalten bleiben. Anthropic empfiehlt ebenfalls, Kontext als begrenzte Ressource zu behandeln und Informationen schrittweise nachzuladen, statt möglichst viel Material in ein Fenster zu schieben.[4] Für Toollandschaften gilt dies besonders: Definitionen und Zwischenergebnisse können den Kontext schon vor Beginn der eigentlichen Aufgabe dominieren.[5] [6]

## 2. Zielarchitektur

Die Architektur beginnt nicht bei Memory oder Kompression, sondern beim Repository. Regeln, Entscheidungen und Qualitätsnachweise sind dort nachvollziehbar, reviewbar und unabhängig vom Verlauf eines einzelnen Agenten. Darauf aufbauend wird Codekontext nur so weit erschlossen, wie eine Aufgabe ihn benötigt. Erst danach folgen externe Werkzeuge und Messung.

![Zielarchitektur des kontextbewussten KI-Entwicklungsstacks](https://private-us-east-1.manuscdn.com/sessionFile/5uZeZXpBOmifCVx74EKw8r/sandbox/egpaOc4Vd9FSsCWy9PVRzT-images_1786578035625_na1fn_L2hvbWUvdWJ1bnR1L3N0YWNrX3JlY2hlcmNoZS9hc3NldHMvemllbGFyY2hpdGVrdHVy.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNXVaZVpYcEJPbWlmQ1Z4NzRFS3c4ci9zYW5kYm94L2VncGFPYzRWZDlGU3NDV3k5UFZSelQtaW1hZ2VzXzE3ODY1NzgwMzU2MjVfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzTjBZV05yWDNKbFkyaGxjbU5vWlM5aGMzTmxkSE12ZW1sbGJHRnlZMmhwZEdWcmRIVnkucG5nIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzg4MjIwODAwfX19XX0_&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEUCIQDivjtdTc3M3sRipeH4Yn3vsPtjxNljBzV3sz1Xa2QaWQIgB1I9e1NGNCKuxumV8XN2EeoR~U7yge4IiXlYFZdAvsM_)

*Abbildung 1: Die Pfeile zeigen die bevorzugte Reihenfolge der Schichten. Gelbe Bausteine sind bewusst optionale, evaluierungspflichtige Beschleuniger; rosafarbene Bausteine erfordern eine besondere Vertrauens- und Freigabepolitik.*

| Schicht | Primäre Quelle der Wahrheit | Unterstützende Werkzeuge | Grundsatz |
|---|---|---|---|
| Repositorysteuerung | `AGENTS.md`, ADRs, Runbooks, Testkonfiguration | `CLAUDE.md`, Agent Skills, Spec Kit | Regeln und Entscheidungen sind versioniert und reviewbar |
| Aktiver Arbeitszustand | Native Planung oder `.planning/` | planning-with-files | Ein Plan beschreibt nur die laufende Arbeit, kein gesamtes Wissen |
| Codekontext | Originaldateien und Git-Stand | Suche, CodeGraph, Repomix | Indizes verweisen auf Originale; sie ersetzen diese nicht |
| Kurzfristige Kontextoptimierung | Originale Toolausgaben mit Referenz | Squeez, optional TOON/Claw Compactor | Jede Kürzung ist messbar, nachvollziehbar und rückholbar |
| Werkzeug- und Datenzugriff | MCP-Schema, Policy und Bestätigungsprotokoll | Toolsuche, Sandbox-Code-Modus | Externe Nebenwirkungen sind sichtbar, begrenzt und auditiert |
| Qualitäts- und Sicherheitsbeweis | Test-, Lint-, SAST- und Review-Ergebnis | CI, projektlokale Befehle | Selbstberichte des Agenten gelten nicht als Nachweis |
| Messung | Aggregierte Metriken | CCUsage, optional OTEL | Keine Inhaltstelemetrie im Standard |

## 3. Konkrete Toolauswahl und Rolle der geprüften Projekte

Die Auswahl folgt dem Prinzip **„eine Hauptantwort je Problemklasse“**. Sie nimmt die stärkste Erkenntnis aus der Repository-Sammlung auf: Viele Projekte sind eher Spezialwerkzeuge, alternative Bedienoberflächen oder Experimentierflächen als zentrale Kontrollschicht. Wer mehrere ähnliche Hooks, Memory-Systeme und UI-Manager gleichzeitig einführt, verliert zuerst den Überblick über den Stack und anschließend über den Kontext.

| Kandidat | Entscheidung | Rolle im Zielstack | Begründung und Grenze |
|---|---|---|---|
| [`ccusage/ccusage`](https://github.com/ccusage/ccusage) | **Basis** | Lokale Kosten- und Tokenmessung | Lokaler, niederschwelliger Sensor. Kostenzahlen sind Steuerungsindikatoren, nicht buchhalterische Werte; sie werden mit Teststatus und Durchlaufzeit verbunden.[7] |
| [`OthmanAdi/planning-with-files`](https://github.com/OthmanAdi/planning-with-files) | **Bedingt** | Dateibasierter Plan für Langläufer | Sinnvoll bei mehrphasigen oder unterbrechbaren Aufgaben. Es trennt aktiven Status von Langzeitwissen; für kleine Änderungen unnötiger Hook- und Kontextaufwand.[8] |
| [`github/spec-kit`](https://github.com/github/spec-kit) | **Bedingt** | Spezifikationsprotokoll für größere Vorhaben | Gut für neue Features, architekturwirksame oder regulierte Arbeit. Nicht als Zwangsschicht für Bugfixes oder Routineänderungen.[9] |
| [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph) | **Bedingter Kern** | Lokaler Abhängigkeits- und Symbolindex | Bei großen/langlebigen Repositories verbessert ein lokaler Graph die gezielte Erschließung von Aufrufern, Beziehungen und Symbolen. Für kleine Projekte bleibt Suche günstiger.[10] |
| [`yamadashy/repomix`](https://github.com/yamadashy/repomix) | **Situativ** | Commitgebundener Snapshot | Hilfreich für externe Analyse, Übergabe und Forensik. Nicht als dauerhafter Prompt-Dump; Export erhält Commit-ID, Filtermanifest und Sensitivitätsprüfung.[11] |
| [`claudioemmanuel/squeez`](https://github.com/claudioemmanuel/squeez) | **Erster Pilot** | Hook-nahe Verdichtung von Logs, Diffs und Toolausgaben | Deutlich passender als eine globale Textkürzung, weil Ausgaben typ- und hostbezogen behandelt werden. Dennoch ein Interceptor auf kritischem Pfad: Originale und Wiederherstellung müssen verfügbar bleiben.[12] |
| [`open-compress/claw-compactor`](https://github.com/open-compress/claw-compactor) | **Alternative im Pilot** | Allgemeiner Kompressionsadapter | Interessant durch struktur- und AST-bewusste Verarbeitung. Herstellereigene Benchmarks sind nicht ausreichend; nur gegen Squeez und ohne Qualitätsverlust testen.[13] |
| [`toon-format/toon`](https://github.com/toon-format/toon) | **Optional im Gateway** | Kompakte Darstellung homogener Tabellen | Nur bei homogenen Objektlisten, etwa Testresultaten oder Suchtreffern. JSON-Schema bleibt kanonisch; TOON ist keine globale Ersatzserialisierung.[14] |
| [`thedotmack/claude-mem`](https://github.com/thedotmack/claude-mem) | **Später, optional** | Persistentes persönliches Memory | Nur nach Datenschutz- und Recall-Pilot. Automatische Zusammenfassungen und lokale Dienste erweitern den Vertrauensbereich; ADRs und Runbooks bleiben die belastbare Wissensquelle.[15] |
| [`ColeMurray/claude-code-otel`](https://github.com/ColeMurray/claude-code-otel) | **Teamoption** | OTEL-Referenz für Telemetrie | Architekturimpuls für Metriken, Latenz und Fehler. Nicht ungeprüft übernehmen; Prompts, Diffs, Secrets und direkte Personenbezüge bleiben standardmäßig außerhalb der zentralen Telemetrie.[16] |

Die übrigen Gruppen aus dem Korpus — insbesondere Sitzungs-UIs, Config-Editoren, Modellwechsler, Prompt-Sammlungen, individuelle Hooks und spezialisierte MCP-Server — bleiben **sekundäre Auswahlflächen**. Sie können einen lokalen Schmerzpunkt lösen, dürfen aber nicht die oben definierte Kontrollkette durchbrechen. Eine UI darf beispielsweise Sitzungen sichtbar machen, aber nicht unbemerkt Regeln verändern; ein Hook darf Diagnosedaten verdichten, aber nicht ohne Audit ein externes System aufrufen.

## 4. Projektwissen, Skills und aktiver Plan

`AGENTS.md` bildet die portable, versionierte Hauptanweisung. Es enthält lediglich die Informationen, die ein neuer Teamkollege oder Agent in jeder Session benötigt: Repositorykarte, Setup- und Prüfkommandos, Grenzen, relevante Sicherheitsvorgaben und Verweise auf tiefere Dokumentation. Der offene Standard versteht diese Datei ausdrücklich als „README für Agents“ und unterstützt verschachtelte Dateien in Monorepos.[3] Claude Code kann dieselben Regeln über eine schlanke `CLAUDE.md` laden, die `AGENTS.md` importiert, statt Inhalte zu duplizieren.[1]

| Artefakt | Inhalt | Ladezeitpunkt | Qualitätsregel |
|---|---|---|---|
| `AGENTS.md` | Architekturkarte, Befehle, globale Engineering-Regeln | Immer | Kurz halten; idealerweise unter etwa 200 Zeilen pro Kontextdatei.[1] |
| `AGENTS.md` im Teilbereich | Subsystem-spezifische Regeln | Bei Arbeit im Teilbereich | Nur Abweichungen vom Wurzelkontext |
| `.claude/CLAUDE.md` | Import plus sehr wenige Claude-Code-spezifische Ergänzungen | Immer bei Claude Code | Kein Duplikat portabler Regeln |
| `.agents/skills/<name>/SKILL.md` | Wiederkehrende Verfahren und eindeutiger Auslöser | Nur bei Relevanz | Kleine Kernanleitung; Details in Referenzen/Skripten |
| `docs/adr/` und Runbooks | Getroffene Entscheidungen, Betriebserfahrung | Bei konkreter Frage | Datiert, überprüfbar, durch Issue/PR verlinkt |
| `.planning/` | Ziel, Akzeptanzkriterien, Status, Erkenntnisse, Nachweise | Nur aktive Langläufer | Nach Abschluss archivieren oder löschen |

Skills ergänzen Regeln, statt sie zu wiederholen. Die Agent-Skills-Spezifikation definiert dafür eine portable Ordnerform mit `SKILL.md`, optionalen Skripten, Referenzen und Assets. Das zentrale Skalierungsprinzip ist progressive Offenlegung: Metadaten beim Start, die Kernanleitung bei Aktivierung und Detailmaterial erst bei Bedarf.[17] [18] Externe Skills werden daher wie Third-Party-Code behandelt: auf einen Commit pinnen, alle Dateien prüfen, Egress minimieren und vor Rollout mit repräsentativen Aufgaben evaluieren.

Der aktive Plan löst ein anderes Problem als Memory. planning-with-files zeigt das nützliche Muster, Plan, Erkenntnisse und Fortschritt außerhalb des Kontextfensters zu sichern und nach einer Kompaktierung oder Session wieder aufzunehmen.[8] Dieses Muster wird erst aktiviert, wenn eine Aufgabe mehrere Phasen, Übergaben, Abhängigkeiten oder Unterbrechungsrisiko besitzt. Für eine punktuelle Änderung sind eine präzise Anfrage, die Repositoryregeln und die normalen Prüfkommandos stabiler und billiger.

## 5. Kontextlebenszyklus: suchen, lesen, komprimieren, isolieren

Kontextqualität entsteht aus Auswahl, nicht aus Masse. Der Standardweg für eine Änderung beginnt mit Git-Status und Repositoryregeln, gefolgt von Datei- und Textsuche. Erst wenn Abhängigkeitsfragen oder eine große, polyglotte Struktur die Suche überfordern, wird ein lokaler Graphindex eingeschaltet. Repomix ergänzt diesen Ablauf ausschließlich als reproduzierbares Aufnahme- oder Übergabeartefakt. Diese Staffelung folgt dem Ansatz, leichte Referenzen vorzuhalten und Details erst schrittweise über Werkzeuge zu laden.[4]

| Situation | Empfohlener Weg | Kontext, der im Modell landen darf | Was außerhalb bleibt |
|---|---|---|---|
| Kleine Änderung in bekanntem Modul | Regeln → Suche → Originaldateien → Tests | Betroffene Dateien, direkte Tests, relevante Diffstellen | Gesamtrepository und alte Logs |
| Unklare Abhängigkeit / Regression | Suche → CodeGraph → Originaldateien → gezielte Tests | Symbolpfade, Aufrufer/Abhängige, kleine Exzerpte | Vollständiger Graph und Indexcache |
| Externes Review oder Incident-Übergabe | Gefilterter Repomix-Snapshot | Commitgebundene, geprüfte Auswahl | Secrets, lokale Konfiguration, irrelevante Artefakte |
| Langer Testlauf / große Logs | Original in Datei/Artefakt; Squeez-Pilot für Auszug | Fehlerzusammenfassung, Exit-Code, Pfad, relevante Zeilen | Vollständige Wiederholungen und Rauschen |
| Homogene Ergebnistabelle | JSON kanonisch, ggf. TOON-Ansicht | Filterte Spalten und begrenzte Zeilen | Große Rohdatenmenge |

Squeez und Claw Compactor dürfen in dieser Architektur nur den letzten Teil unterstützen: wiederholte, strukturierte und überprüfbare Toolausgaben. Beide werden ausdrücklich **nicht** als Gedächtnis, Workflowengine oder Auditquelle eingesetzt. Jeder komprimierte Auszug führt daher eine Referenz auf Originalartefakt, Commit/Session, Uhrzeit, Quelle und Kürzungsmodus. Für Debugging kritische Signale — Exit-Code, Dateipfade, Exceptions, Fehlschlagzahl und Testbezeichner — sind von jeder Kürzung ausgenommen.

## 6. MCP, Datenflüsse und sicherer Code Mode

MCP ist die bevorzugte Adaptionsgrenze zu externen Daten und Diensten, jedoch nicht ein Freifahrtschein für einen großen Toolkatalog. Die Spezifikation fordert validierte Eingaben, Zugriffskontrollen, Rate Limits, Ausgabe-Sanitisierung, Timeouts, Logging und eine Möglichkeit für Menschen, kritische Aufrufe abzulehnen.[19] Tool-Anmerkungen nichtvertrauenswürdiger Server gelten selbst laut Spezifikation nicht als vertrauenswürdig.[19]

| Zugriffsklasse | Beispiele | Policy | Rückgabe an den Agenten |
|---|---|---|---|
| Lese-, risikoarm | Repository-Metadaten, Buildstatus, dokumentierte Suche | Vorab zugelassen, Rate Limit | Strukturiertes, größenlimitiertes JSON |
| Lese-, sensibel | Kundendaten, Produktionslogs, interne Dokumente | Zweckbindung, Datenklassifizierung, Redaction | Aggregat, minimaler Ausschnitt oder tokenisierte Werte |
| Schreibend, reversibel | Issue-Entwurf, Branch, Draft-PR | Explizite Bestätigung oder Policy-Freigabe | Nachweis mit Objekt-ID und Diff/Link |
| Schreibend, kritisch | Deployment, Berechtigung, Zahlung, irreversible Löschung | Menschliche Bestätigung im Moment der Aktion | Nachweis plus Auditereignis; keine stillen Batchaktionen |

Ab zehn Werkzeugen oder etwa 10.000 Tokens Werkzeugschema wird die direkte Einblendung aller Definitionen durch **Toolsuche beziehungsweise einen Capability-Katalog** ersetzt. Anthropic berichtet, dass progressive Toolentdeckung Kontext spart und die Auswahlgenauigkeit bei großen Toolbibliotheken verbessert.[6] Für größere Datenmengen oder drei und mehr abhängige Toolschritte nutzt der Agent einen eingeschränkten Code-Modus: Der Worker ruft Tools auf, filtert oder aggregiert lokal und gibt nur das fachlich nötige Ergebnis zurück. Dadurch gelangen Zwischendaten nicht zwangsläufig in den Modellkontext; außerdem lassen sich Schleifen, Bedingungen und Parallelität deterministischer ausdrücken.[5] [6]

Dieser Code-Modus braucht eine separate Sicherheitsgrenze: kurzlebige Sandbox, CPU-/Zeit-/Speicherlimits, minimaler Dateizugriff, allowlist-basierter Netzwerk-Egress, keine langlebigen Secrets und ein definierter Löschpfad. Bei kleinen, interaktiven oder erklärungsbedürftigen Abfragen bleibt der direkte Toolcall besser, weil er die menschliche Nachvollziehbarkeit erhöht.

## 7. Qualität, Governance und Telemetrie

Der Stack behandelt Agenten als leistungsfähige, aber fehlbare Mitwirkende. Der Nachweis einer Änderung kommt aus Tests, Linting, Typprüfung, Security-Scans, Review und reproduzierbaren Befehlen — nicht aus dem Abschlussbericht eines Agenten. Diese Gates gehören in das Repository und die CI, damit sie für Menschen und verschiedene Agenten gleichermaßen gelten.

| Kontrolle | Minimalstandard | Team-/regulierte Ausprägung |
|---|---|---|
| Änderungen | Git-Diff, projektlokale Tests, Lint/Typprüfung | Pflicht-PR, Codeowner, branch protection, nachvollziehbare Freigabe |
| Skills und Hooks | Inhaltsreview, Versionspin, lokaler Test | Freigegebener Katalog, Signatur/Hash, regelmäßige Neubewertung |
| MCP | Schema, Least Privilege, Timeout, Bestätigung für Schreiben | Zentraler Toolkatalog, Datenklassifizierung, Audit und Egress-Policy |
| Memory | ADRs/Runbooks als Wahrheit; Auto-Memory nur assistiv | Keine automatische Langzeitpersistenz ohne DPIA/Review und Löschkonzept |
| Telemetrie | CCUsage lokal, keine Prompts/Diffs exportieren | Pseudonymisierte OTEL-Metriken, Retention, Zugriffskontrolle, DLP |

CCUsage bildet den richtigen Startpunkt, da es eine lokale Sicht auf Token- und Kostenverläufe ermöglicht.[7] Bei Teams kann OTEL eine gemeinsame Sicht auf Latenz, Fehler, Toolnutzung und Kosten geben; die ausgewertete Referenz zeigt dafür Collector-, Prometheus-, Loki- und Grafana-Bausteine.[16] Die Standardtelemetrie exportiert jedoch keine vollständigen Prompts, Quelltexte, Patches, geheimen Werte oder direkten Personenbezüge. Ein Nutzwertbericht beantwortet nicht nur „Wie viele Tokens?“, sondern mindestens „Mit welcher Test- und Reviewqualität je erfolgreich abgeschlossener Änderung?“

## 8. Umsetzung in vier Wellen

Die Reihenfolge reduziert das Risiko, vorschnell eine unsichtbare, schwer wartbare Agentenplattform aufzubauen. Jede Welle beendet sich mit überprüfbaren Ergebnissen; die nächste Welle wird nur gestartet, wenn der tatsächliche Engpass fortbesteht.

| Welle | Zeitraum | Ergebnis | Abnahmekriterium |
|---|---|---|---|
| 1. Fundament | Woche 1–2 | `AGENTS.md`, `CLAUDE.md`-Brücke, Architekturkarte, Qualitätsbefehle, ADR-Template | Ein neuer Agent kann Setup, relevante Tests und Sicherheitsgrenzen ohne Nachfragen finden |
| 2. Wiederholbare Arbeit | Woche 3–4 | Drei bis fünf eigene Skills: Onboarding, Implementierung, Test/Review, Release, optional Incident | Jeder Skill löst ein reales wiederkehrendes Problem und besteht repräsentative Aufgaben |
| 3. Messung und Kontextpilot | Woche 5–6 | CCUsage-Dashboard; Benchmark-Korpus; getrennte Piloten für CodeGraph und Squeez | Keine statistisch bzw. praktisch relevante Qualitätsverschlechterung gegenüber Baseline |
| 4. Kontrollierte Integration | Woche 7–10 | MCP-Katalog, Toolsuche, Schreibfreigaben, Sandbox-Code-Modus; bei Bedarf OTEL | Alle Schreibpfade sind sichtbar, bestätigbar und auditierbar; kein unkontrollierter Datenegress |

Ein angemessenes Benchmark-Korpus besteht aus zehn bis zwanzig anonymisierten, aber realistischen Aufgaben: Bugfix, gezielte Refaktorierung, neue API-Funktion, fehlgeschlagener Testlauf, Code-Review und Releasevorbereitung. Für jede Aufgabe werden Ausgangszustand, akzeptierte Lösung, relevante Tests, benötigte Zeit, Modell-/Toolkosten und erforderliche menschliche Nacharbeit festgehalten. Erst dann wird ein Beschleuniger wie Squeez übernommen oder abgelehnt.

| Metrik | Vergleich | Übernahmeregel |
|---|---|---|
| Erfolgsrate | Anteil akzeptierter, vollständig geprüfter Aufgaben | Darf gegenüber der Baseline nicht praktisch relevant fallen |
| Test- und Reviewnacharbeit | Fehler, Rückfragen und Folgepatches | Muss gleich bleiben oder sinken |
| Diagnosezeit | Zeit bis zur identifizierten Ursache bei Fehlerfällen | Soll bei CodeGraph/Squeez mindestens nicht steigen |
| Kontext- und Toolkosten | Tokens/Kosten pro akzeptierter Änderung | Einsparung zählt nur bei erhaltener Qualität |
| Tool-/Sicherheitsvorfälle | Fehlaufrufe, Policyverletzungen, Datenexposure | Null tolerierte kritische Vorfälle; jeder Vorfall führt zu Policy-Review |
| Betriebsaufwand | Update-, Hook- und Supportzeit | Darf den produktiven Nutzen nicht aufzehren |

## 9. Klare Entscheidung

Für eine heutige Einführung empfehle ich folgenden **Minimal-Stack**: ein nativer Agentenhost, `AGENTS.md` als portable Steuerung, eine kleine `CLAUDE.md`-Importbrücke, wenige geprüfte Skills, versionierte ADRs/Runbooks, projektnahe Qualitätsgates und CCUsage. Für große oder langfristige Repositories kommt CodeGraph hinzu; für komplexe Vorhaben ein dateibasierter Plan beziehungsweise Spec Kit. Repomix ist ein punktuelles Übergabe- und Analysewerkzeug.

Squeez ist der bevorzugte Kandidat für einen getrennten Kontextoptimierungspilot, weil es Toolausgaben hostnah und mit Wiederherstellungsansatz behandelt. Claw Compactor ist eine ernstzunehmende Alternative, aber kein zusätzlicher Parallelbetrieb. TOON bleibt ein per Schema abgesichertes Darstellungsexperiment im Toolgateway. Claude-Mem, zentrale OTEL-Stacks, umfangreiche UI-/Session-Manager und zusätzliche Hook-Sammlungen werden bewusst **später** und nur gegen einen nachgewiesenen Bedarf geprüft.

> **Ergebnis:** Der Stack wird „kontextbewusst“, weil er Wissen nach Dauer und Risiko trennt, Kontext nur bedarfsgerecht lädt, Tooldaten außerhalb des Modellfensters verarbeitet, Handlungen kontrolliert und jede Optimierung gegen echte Engineering-Ergebnisse misst. Er wird nicht dadurch besser, dass möglichst viele Repositories installiert werden.

## Quellen und Referenzen

[1]: https://code.claude.com/docs/en/memory "Anthropic: How Claude remembers your project"
[2]: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide "OpenAI: Codex Prompting Guide"
[3]: https://agents.md/ "AGENTS.md"
[4]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents "Anthropic: Effective context engineering for AI agents"
[5]: https://www.anthropic.com/engineering/code-execution-with-mcp "Anthropic: Code execution with MCP"
[6]: https://www.anthropic.com/engineering/advanced-tool-use "Anthropic: Introducing advanced tool use"
[7]: https://github.com/ccusage/ccusage "ccusage/ccusage"
[8]: https://github.com/OthmanAdi/planning-with-files "OthmanAdi/planning-with-files"
[9]: https://github.com/github/spec-kit "github/spec-kit"
[10]: https://github.com/colbymchenry/codegraph "colbymchenry/codegraph"
[11]: https://github.com/yamadashy/repomix "yamadashy/repomix"
[12]: https://github.com/claudioemmanuel/squeez "claudioemmanuel/squeez"
[13]: https://github.com/open-compress/claw-compactor "open-compress/claw-compactor"
[14]: https://github.com/toon-format/toon "toon-format/toon"
[15]: https://github.com/thedotmack/claude-mem "thedotmack/claude-mem"
[16]: https://github.com/ColeMurray/claude-code-otel "ColeMurray/claude-code-otel"
[17]: https://agentskills.io/specification "Agent Skills Specification"
[18]: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview "Anthropic: Agent Skills"
[19]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "Model Context Protocol: Tools"

---

### Begleitdateien

Die normalisierte Kategorisierung des gesamten Repository-Korpus befindet sich in `repo_inventar.md`. Die knappen Forschungsnotizen und die detaillierten Architekturentscheidungen sind getrennt abgelegt, damit Annahmen, Quellen und Produktentscheidungen nachvollziehbar bleiben.
