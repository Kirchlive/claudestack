# Implementierungsfahrplan für die Pilotphase

**Ziel:** Die Kernarchitektur kontrolliert einführen und spezialisierte Komponenten anhand echter Entwicklungsaufgaben vergleichen, ohne die laufende Entwicklungsumgebung unnötig zu destabilisieren.

**Empfohlene Dauer:** zehn Wochen für den vollständigen Pilot; eine belastbare erste Entscheidung ist bereits nach den ersten zwei Wochen möglich.  
**Geltungsbereich:** Ein repräsentatives Repository oder ein klar abgegrenzter Service. Keine produktive Multi-Agenten-Orchestrierung, keine zentrale Memory-Plattform und keine unkontrollierte Toolintegration im Piloten.

> **Pilotprinzip:** Zuerst die reversible, repositorylokale Grundlage schaffen. Erst danach wird pro Problemklasse genau **eine** Alternative gegen eine unveränderte Baseline getestet. Jeder Test endet mit einer expliziten Entscheidung: übernehmen, verwerfen oder unter klaren Bedingungen erneut evaluieren.

## 1. Sofort entscheiden: Pilotauftrag, Rollen und Grenzen

Bevor Software installiert oder Konfiguration geändert wird, sollte ein kurzer Pilotauftrag im Repository angelegt werden, zum Beispiel unter `docs/agent-pilot/charter.md`. Er benennt den Zielservice, den Zeitraum, die Testaufgaben, die nicht verhandelbaren Sicherheitsregeln und die Personen oder Rollen mit Entscheidungsrecht.

| Rolle | Verantwortung | Mindestentscheidung |
|---|---|---|
| **Pilot Owner** (z. B. Tech Lead) | Zielbild, Priorisierung, Entscheidung an den Gates | Freigabe/Abbruch je Welle |
| **DevEx-/Plattformverantwortung** | Projektstruktur, Host-Konfiguration, Messdatenerhebung | Änderungen sind reproduzierbar und rückbaubar |
| **Security-/Datenschutz-Review** | Datenklassifizierung, Egress, Secrets, Toolberechtigungen | Kein Pilot mit unkalkulierter Datenweitergabe |
| **Pilotentwickler** | Bearbeitung des Aufgabenpools, kurze Erfahrungsprotokolle | Keine Umgehung der Kontrollregeln |
| **Reviewer** | Akzeptanzkriterien, Tests, Nacharbeit und Fehlerbilder | Unabhängige Beurteilung der Ergebnisqualität |

Der Pilot beginnt **nicht** mit Ruflo, Harness, Context Gateway, Open Connector oder einer zentralen Telemetrieplattform. Diese Komponenten schaffen einen zusätzlichen Dienst- beziehungsweise Vertrauensbereich und gehören erst nach einem nachgewiesenen Bedarf in eine spätere Plattformentscheidung.

## 2. Woche 0: Baseline und messbarer Aufgabenpool

Der wichtigste nächste Schritt ist die Vorbereitung eines kleinen, realistischen Aufgabenpools. Er darf keine synthetischen Beispielaufgaben enthalten. Empfehlenswert sind zehn bis zwanzig bereits erledigte, anonymisierte oder aktiv anstehende Arbeiten aus dem eigenen Repository. Jede Aufgabe muss eine überprüfbare Definition of Done haben.

| Aufgabentyp | Beispiel für ein geeignetes Ticket | Nachweis der Erledigung |
|---|---|---|
| Fehlerbehebung | Reproduzierbarer Defekt mit Test oder Logreferenz | Regressionstest, reproduzierbarer Fix, Review |
| Refactoring | Änderung eines klar abgegrenzten Moduls | Bestehende Tests grün, Architekturgrenzen eingehalten |
| Erweiterung | Kleine API-/UI-/Integrationsfunktion | Akzeptanztest, Dokumentation, Review |
| Fehlersuche | Ursache einer fehlgeschlagenen Pipeline oder Laufzeitexception | Root Cause, Patch oder begründete Abhilfe |
| Code Review | PR mit realistischen Risiken | Konkrete, nachvollziehbare Findings |
| Releasevorbereitung | Version, Changelog, Qualitätsprüfung | Vollständige Checkliste und grüne Gates |

Für jede Aufgabe werden vor dem Pilot einheitlich festgehalten: Start-Commit, Ziel/Abnahmekriterien, relevante Tests, erwartete Dateien oder Module, Bearbeitungsdauer, akzeptierte Änderung, menschliche Nacharbeit, Toolkosten und besondere Sicherheitsereignisse. Dies ist die **Baseline**. Ohne sie lässt sich weder Nutzen noch Schaden einer Kontextkomponente seriös beurteilen.

### Baseline-Checkliste

| Aufgabe | Verantwortlich | Ergebnisartefakt |
|---|---|---|
| Testaufgaben auswählen und sensiblen Inhalt entfernen | Pilot Owner + Security | `tasks.csv` oder Issue-Liste mit Kennzeichnung |
| Start-Commit und Testkommando dokumentieren | DevEx | Reproduzierbare Aufgabenbeschreibung |
| Baseline ohne neue Erweiterung bearbeiten | Pilotentwickler | Diff, Tests, Zeit- und Kostenprotokoll |
| Reviewer-Ergebnis erfassen | Reviewer | Akzeptiert / Nacharbeit / abgelehnt mit Begründung |
| Metriken zusammenführen | DevEx | `baseline_summary.md` |

## 3. Woche 1–2: Reversible Kernschicht einführen

In dieser Welle wird keine externe Retrieval-, Memory- oder Orchestrierungsplattform aktiviert. Das Ergebnis soll in einem normalen Pull Request reviewbar und durch Revert zurücknehmbar sein.

### 3.1 Repositorystruktur anlegen

| Pfad | Inhalt | Qualitätsregel |
|---|---|---|
| `AGENTS.md` | Zielarchitektur, wichtigste Befehle, Test-/Reviewregeln, Sicherheitsgrenzen | Maximal die Regeln, die auf fast jede Aufgabe zutreffen |
| `CLAUDE.md` oder andere Host-Brücke | Nur hostbezogene Ergänzungen und Verweis auf `AGENTS.md` | Keine Kopie desselben Regelwerks |
| `.agents/skills/<name>/SKILL.md` | Kleine, auslösbare Arbeitsverfahren | Beschreibung kurz; Detailmaterial separat laden |
| `docs/adr/` | Architekturentscheidungen | Jede Entscheidung enthält Kontext, Wahl, Folgen und Rückrollpunkt |
| `docs/agent-pilot/` | Charter, Aufgabenpool, Metriken, Gate-Entscheidungen | Kein produktiver Quellcode oder Secret in Messdaten |
| `scripts/quality/` | Einheitliche Test-, Lint-, Typ- und Sicherheitsbefehle | Befehle müssen lokal und in CI gleich funktionieren |

Die ersten drei bis fünf Skills sollten ausschließlich wiederkehrende, gut abgrenzbare Aufgaben enthalten: `repo-onboarding`, `implementation`, `testing-and-review`, `release` und bei Bedarf `incident-triage`. Ein Skill wird nur aufgenommen, wenn mindestens zwei konkrete Aufgaben im Pool davon profitieren. Große universelle Skillsammlungen sind im Pilot ausdrücklich ausgeschlossen.

### 3.2 Tool- und Sicherheitsregel vor jeder Erweiterung

Es wird eine kleine, versionierte Policy angelegt, zum Beispiel `docs/agent-pilot/tool-policy.md`.

| Risikoklasse | Beispiele | PilotregeI |
|---|---|---|
| Lesen, lokal | Dateisuche, Git-Status, Tests, Linter | Zulässig; Ausgaben begrenzen und Originalreferenz erhalten |
| Schreiben, lokal | Quellcode ändern, Dateien anlegen, Branch erstellen | Nur im zugewiesenen Worktree; Tests und Review erforderlich |
| Lesen, extern | Issues, Artefakte, Paketmetadaten | Nur nach Allowlist und Datenklassifizierung |
| Schreiben, extern | Ticket kommentieren, Release erzeugen, Deployment starten | Im Pilot immer explizite menschliche Bestätigung |
| Geheimnisse/Personendaten | Tokens, Kundendaten, Produktionslogs | Nicht in Prompts, Skills, Telemetrie oder Aufgabenpool aufnehmen |

Die Model Context Protocol-Spezifikation empfiehlt für Toolserver unter anderem Zugriffskontrolle, Eingabevalidierung, Rate Limits, Ausgabesanitisierung, Timeouts, Logging und explizite Nutzerkontrolle bei kritischen Aufrufen.[1] Diese Kriterien werden nicht nachträglich ergänzt, sondern vor dem ersten MCP-Pilot als Abnahmekriterien dokumentiert.

### 3.3 Lokale Messung etablieren

CCUsage oder ein funktional vergleichbares lokales Werkzeug wird ausschließlich zur Kosten- und Nutzungsbeobachtung eingerichtet. Der Messumfang bleibt minimal: Zeitstempel, Modell-/Hostklasse, Anzahl Sitzungen, Token-/Kostenkennzahl, Aufgaben-ID und Ergebnisstatus. Promptinhalte, Diffs, personenbezogene Daten und Secrets werden nicht standardmäßig zentral gesammelt.[2]

**Gate 1 – Ende Woche 2:** Die Kernschicht wird übernommen, wenn die Projektregeln von mindestens zwei Pilotentwicklern ohne wiederholte Rückfragen angewendet werden können, alle Qualitätsbefehle dokumentiert sind und keine Sicherheits- oder Governance-Probleme entstanden sind. Ansonsten wird `AGENTS.md` verschlankt oder präzisiert, nicht durch neue Tools überdeckt.

## 4. Woche 3–4: Codekontext als kontrolliertes A/B-Experiment

Nun wird ein Retrievalkandidat getestet. Die Standard-Datei- und Textsuche bleibt während des gesamten Piloten unverändert als Fallback aktiv.

### 4.1 Kandidaten isoliert aufsetzen

| Variante | Einsatzgebiet | Isolationsregel |
|---|---|---|
| **A: CodeGraph** | Symbol-, Aufrufer-, Abhängigkeits- und Refactoringfragen | Eigene Konfiguration und eigener Index; keine produktiven Secrets |
| **B: Claude Context** | Semantische Fragen, Dokumentation, Cross-Language-Suche | Eigener MCP-/Indexprozess; Embedding- und Egressweg vorab prüfen |
| **Baseline** | Suche und Originaldateien | Bleibt immer verfügbar und unverändert |

Es wird niemals eine „A plus B“-Defaultkonfiguration erzeugt. Die Kandidaten lösen unterschiedliche Retrievalprobleme: CodeGraph priorisiert strukturelle Beziehungen; Claude Context priorisiert semantische Suche und Embeddings.[3] [4]

### 4.2 Aufgaben und Entscheidungsschema

Jeder Kandidat bearbeitet dieselbe, vorher festgelegte Teilmenge des Aufgabenpools. Wenn möglich, wird die Reihenfolge zwischen den Pilotentwicklern rotiert, damit Lerneffekte nicht als Toolvorteil missverstanden werden.

| Kennzahl | Erhebung | Übernahmekriterium |
|---|---|---|
| Erfolgsrate | Akzeptierte, getestete Aufgabe / gestartete Aufgabe | Mindestens Baseline-Niveau |
| Zeit bis zur richtigen Datei/Ursache | Beginn bis erster relevanter Fund | Gegen Baseline verbessern oder plausibel verkürzen |
| Retrievalpräzision | Anteil nützlicher Ergebnisse in den ersten Treffern | Keine systematische Informationsüberladung |
| Indexfrische | Zeit bis neue Änderungen auffindbar sind | Für Teamworkflow ausreichend und dokumentiert |
| Datenegress | Übertragene Code-/Metadatenkategorien | Mit Klassifizierung und Policy vereinbar |
| Betriebslast | Installation, Updates, Fehler, Supportzeit | Nutzen übersteigt die Mehrlast |

**Gate 2 – Ende Woche 4:** Nur der Kandidat mit nachvollziehbarem Mehrwert und akzeptabler Datenschutz-/Betriebsbilanz bleibt. Bei Gleichstand oder unklarer Wirkung wird **keiner** übernommen; Standard-Suche plus Originaldateien bleiben ausreichend.

## 5. Woche 5–6: Toolausgaben und Kompression testen

Die Kompressionsphase prüft nicht, ob möglichst wenige Tokens verbraucht werden, sondern ob die **Qualität der Problemlösung bei geringerer Kontextlast erhalten bleibt**. Zunächst wird die native Kompaktierung des gewählten Hosts dokumentiert und gegen die Baseline verwendet.

Danach testet das Team **Squeez gegen Baseline**. Nur wenn Squeez weder fachlich noch betrieblich überzeugt, folgt ein separater Test von **Claw Compactor**. Beide werden nicht gleichzeitig in denselben Hostpfad eingebunden.[5] [6]

| Pflichtmerkmal jeder Kompressionsausgabe | Grund |
|---|---|
| Exit-Code und Teststatus | Fehler dürfen nicht als Textdetail verschwinden |
| Pfad, Zeit und Quelle | Rückverfolgung und Reproduktion |
| Testname, Exception und relevante Zeilen | Diagnosefähigkeit |
| Commit-/Sessionreferenz | Verknüpfung mit der konkreten Änderung |
| Link oder Pfad zum Originalartefakt | Abrufbarkeit bei Informationsverlust |
| Kennzeichnung der Verdichtung | Reviewende müssen Zusammenfassung von Original unterscheiden können |

**Gate 3 – Ende Woche 6:** Kompression wird nur übernommen, wenn Erfolgsrate und Testqualität mindestens stabil bleiben, Diagnosezeit und Reviewnacharbeit nicht steigen und die Ersparnis oder Übersichtlichkeit konkret nachweisbar ist. Bei einem kritisch fehlenden Fehlersignal ist die Integration sofort zu deaktivieren.

## 6. Woche 7–8: Arbeitszustand und sichere Toolketten

Diese Welle wird nur gestartet, wenn Aufgaben im Pilot tatsächlich unterbrochen, mehrphasig oder übergeben werden. Bei kurzen, abgeschlossenen Änderungen genügt die native Planung.

| Bedarfssignal | Erweiterung | Bedingung |
|---|---|---|
| Mehrphasige Arbeit mit Übergaben | planning-with-files | Plan, Fortschritt, Erkenntnisse und Nachweise müssen im Repository liegen |
| Größere Features oder Compliancebedarf | Spec Kit | Der Zusatzprozess darf die Bearbeitungszeit nicht unverhältnismäßig erhöhen |
| Große Toolresultate oder mehrstufige Datentransformation | Sandbox-Code-Modus | Ressourcenlimits, begrenzter Netzwerkegress, kurzlebige Secrets und maximale Rückgabegröße |
| Homogene Tabellen-/Listenobjekte | TOON | Nur auf klar passende Datenformen; JSON-Schema bleibt die Referenz |

**Gate 4 – Ende Woche 8:** Das Team übernimmt nur die Erweiterung, die eine erkennbare Verbesserung bei Übergaben oder Toolketten liefert. Die Planung bleibt weiterhin von Langzeitmemory getrennt; die Sandbox wird nicht zu einer allgemeinen Produktionslaufzeit erweitert.

## 7. Woche 9–10: Abschluss, Entscheidung und Rückbau

Die letzte Pilotwelle ist keine neue Toolinstallation. Sie konsolidiert Evidenz und trifft eine reversible Entscheidung.

| Ergebnisartefakt | Inhalt | Owner |
|---|---|---|
| `pilot_results.md` | Aufgaben, Metriken, Vorfälle, qualitative Beobachtungen, Grenzen | DevEx + Pilot Owner |
| `decision-log.md` | Übernehmen / verwerfen / erneut prüfen inklusive Begründung | Pilot Owner |
| ADR je übernommener Komponente | Kontext, Entscheidung, Sicherheitsgrenzen, Betriebsowner, Rückrollweg | Tech Lead + Security |
| Rückbauplan | Konfigurationspfade, Dienste, Indizes und Daten, die bei Abbruch entfernt werden | DevEx |
| Betriebscheck | Updates, Lizenz/SBOM, Egress, Backup, Retention, Supportmodell | DevEx + Security |

Die Übernahme einer Spezialkomponente verlangt immer: einen technischen Owner, eine klar dokumentierte Datenklasse, einen Patch-/Updateweg, einen Rückrollweg und ein Betriebsbudget. Fehlt einer dieser Punkte, bleibt die Komponente im Pilot oder wird entfernt.

## 8. Die nächsten fünf Arbeitstage

| Tag | Konkreter nächster Schritt | Fertiges Ergebnis am Tagesende |
|---:|---|---|
| 1 | Pilot Owner benennen, Zielrepository und Zeitraum festlegen, Charter anlegen | Abgenommener Pilotauftrag und Rollenzuordnung |
| 2 | Zehn bis zwanzig echte Aufgaben auswählen, Geheimnisse/Personendaten prüfen, Baselinefelder definieren | Bereinigter Aufgabenpool mit Definition of Done |
| 3 | Baseline auf mindestens zwei repräsentativen Aufgaben erfassen; Tests, Dauer, Nacharbeit und Kosten protokollieren | Erstes Baselineprotokoll |
| 4 | `AGENTS.md`, Host-Brücke, Qualitätsbefehle, ADR-Template und Tool-Policy als Pull Request anlegen | Reviewbarer Fundament-PR |
| 5 | Drei Kern-Skills sowie lokale Messung einrichten; gemeinsamen Review auf Regeln und Datenflüsse durchführen | Pilotumgebung bereit für Woche 2 |

## 9. Definition of Done für den Gesamtpilot

Der Pilot ist abgeschlossen, wenn eine überprüfbare Entscheidung für jede getestete Komponentengruppe vorliegt, die Baseline und Messdaten erhalten sind, sämtliche Übernahmen in ADRs dokumentiert sind und verworfene Komponenten vollständig zurückgebaut wurden. Eine „erfolgreiche Installation“ ohne messbaren Nutzen, Sicherheitsbewertung und Rückrollweg erfüllt diese Definition ausdrücklich nicht.

## Quellen

[1]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "Model Context Protocol: Tools"
[2]: https://github.com/ccusage/ccusage "ccusage/ccusage"
[3]: https://github.com/colbymchenry/codegraph "colbymchenry/codegraph"
[4]: https://github.com/zilliztech/claude-context "zilliztech/claude-context"
[5]: https://github.com/claudioemmanuel/squeez "claudioemmanuel/squeez"
[6]: https://github.com/open-compress/claw-compactor "open-compress/claw-compactor"
