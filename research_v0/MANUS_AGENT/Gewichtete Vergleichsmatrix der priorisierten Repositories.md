# Gewichtete Vergleichsmatrix der priorisierten Repositories

**Zielgruppe und Annahmen:** kleines bis mittleres Engineering-Team; **Sicherheit und Kontextqualität haben Vorrang** vor reiner Tokenreduktion und maximaler Autonomie. Die Matrix bewertet nicht Popularität oder GitHub-Stars, sondern die Eignung für die Zielarchitektur.

> **Lesart der Punkte:** 5 = sehr gute Eignung unter den definierten Annahmen; 1 = geringe Eignung oder hoher Zielkonflikt. Die Werte sind eine nachvollziehbare Architekturentscheidung auf Grundlage der jeweiligen Dokumentation und primärer Referenzen, keine reproduzierte Leistungsbenchmark. Ein Gesamtwert legitimiert keine Installation ohne Pilot.

## Bewertungsmodell

| Kriterium | Gewicht | Bewertungsfrage |
|---|---:|---|
| Kontextqualität | 25 % | Erhöht der Baustein die Relevanz, Nachvollziehbarkeit und Wiederauffindbarkeit des Kontexts? |
| Sicherheit & Datenschutz | 25 % | Ist der Vertrauensbereich klein, kontrollierbar und mit Least Privilege vereinbar? |
| Portabilität | 15 % | Ist die Lösung mit mehreren Agenten/Hosts oder als standardnahes Muster nutzbar? |
| Betriebs- und Wartungsaufwand | 15 % | Bleibt die Komponente für ein kleines bis mittleres Team beherrschbar? |
| Nachweisbarkeit & Governance | 10 % | Unterstützt sie Versionierung, Audit, Prüfpfade und explizite Zuständigkeiten? |
| Integrationsreife | 10 % | Bietet sie einen klaren, realistisch wartbaren Einführungsweg? |

Der gewichtete Wert entsteht aus der Summe `Punkt/5 × Gewicht`; er dient ausschließlich zur **Reihenfolge der Pilotierung**.

## A. Steuerung, Skills und Planung

| Repository / Muster | Kontext | Sicherheit | Portabilität | Betrieb | Governance | Integration | Gewichteter Wert | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| `AGENTS.md` + schlanke `CLAUDE.md`-Brücke | 5 | 5 | 5 | 5 | 5 | 5 | **100** | **Sofort standardisieren** |
| Agent Skills nach `SKILL.md`-Standard | 5 | 4 | 5 | 4 | 5 | 5 | **92** | **Sofort standardisieren** |
| `github/spec-kit` | 5 | 4 | 3 | 3 | 5 | 4 | **81** | Für große/regulierte Vorhaben |
| `OthmanAdi/planning-with-files` | 4 | 4 | 5 | 4 | 4 | 4 | **83** | Nur bei Langläufern und Übergaben |
| `xingkongliang/skills-manager` | 3 | 3 | 5 | 3 | 4 | 4 | **70** | Optionales Enablement-Werkzeug |
| `revfactory/harness` | 3 | 3 | 3 | 2 | 4 | 3 | **59** | Späterer Teamdesign-Experimentpfad |
| `ruvnet/ruflo` | 3 | 2 | 4 | 1 | 3 | 3 | **52** | Plattformexperiment, nicht Basis |

Die Steuerungsschicht wird absichtlich nicht von einem Drittprojekt abhängig gemacht. `AGENTS.md` und Agent Skills folgen offenen, dokumentierten Mustern: hierarchische Projektanweisungen und progressive Offenlegung verringern permanenten Kontext, während Regeln und Prozeduren im Repository reviewbar bleiben.[1] [2] Spec Kit und planning-with-files ergänzen dies für unterschiedliche Zeitachsen: Spec Kit strukturiert Delivery-Artefakte, planning-with-files hält den **laufenden** Zustand außerhalb des Fensters.[3] [4]

## B. Code-Kontext und Aufbereitung

| Repository / Muster | Kontext | Sicherheit | Portabilität | Betrieb | Governance | Integration | Gewichteter Wert | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Datei- und Textsuche + Originaldateien | 4 | 5 | 5 | 5 | 5 | 5 | **95** | **Unverzichtbarer Standard** |
| `colbymchenry/codegraph` | 5 | 4 | 3 | 3 | 4 | 4 | **79** | Erster Pilot für Struktur-/Abhängigkeitsfragen |
| `zilliztech/claude-context` | 4 | 3 | 4 | 3 | 3 | 4 | **70** | Alternative bei semantischen Suchfällen |
| `yamadashy/repomix` | 3 | 4 | 5 | 5 | 5 | 5 | **85** | Punktuelles Analyse-/Übergabeartefakt |

CodeGraph und Claude Context lösen verschiedene Retrieval-Probleme und dürfen daher nicht kumulativ als Standard installiert werden. CodeGraph priorisiert Beziehungen, Symbole und Abhängigkeiten; Claude Context ist ein MCP-basierter semantischer Suchpfad mit Embeddings.[5] [6] Repomix bleibt bewusst außerhalb der laufenden Anfrage: Der Snapshot ist für Initialanalyse, externe Übergabe und Forensik geeignet, nicht als Ersatz für progressive Suche.[7]

## C. Kompression und Kontextökonomie

| Repository / Muster | Kontext | Sicherheit | Portabilität | Betrieb | Governance | Integration | Gewichteter Wert | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Host-native Kompaktierung + Originalartefakte | 4 | 5 | 4 | 5 | 4 | 5 | **90** | **Standard** |
| `claudioemmanuel/squeez` | 4 | 3 | 4 | 4 | 3 | 4 | **73** | Erster, isolierter Output-Pilot |
| `open-compress/claw-compactor` | 4 | 3 | 4 | 3 | 3 | 3 | **68** | Alternative im gleichen Pilot, nicht parallel |
| `toon-format/toon` | 3 | 4 | 5 | 5 | 4 | 4 | **81** | Opt-in im Tool-Gateway für homogene Tabellen |
| `Compresr-ai/Context-Gateway` | 4 | 2 | 4 | 2 | 3 | 3 | **60** | Plattform-/Proxy-Pilot, nicht Teamdefault |

Die gewichtete Rangfolge darf nicht missverstanden werden: TOON erzielt einen guten Architekturwert, weil es klein und verlustfrei für enge Datenformen eingesetzt wird; es löst **nicht** das Kontextmanagement insgesamt.[8] Squeez und Claw Compactor greifen in den kritischen Pfad ein, daher sind Qualitätssicherung, Rückholroute und ein Vergleich mit der Baseline wichtiger als Herstellerangaben zu Tokensparen.[9] [10] Context Gateway kann zentralisieren, vergrößert jedoch durch Proxy, Dashboard, Historie und Authentifizierungsfluss den Vertrauensbereich.[11]

## D. Persistentes Wissen und Gedächtnis

| Repository / Muster | Kontext | Sicherheit | Portabilität | Betrieb | Governance | Integration | Gewichteter Wert | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| ADRs, Runbooks, Tests und Projektregeln | 5 | 5 | 5 | 5 | 5 | 5 | **100** | **Normative Wissensquelle** |
| `zilliztech/memsearch` | 4 | 3 | 4 | 3 | 4 | 4 | **72** | Bester kontrollierter Langzeit-Memory-Pilot |
| `thedotmack/claude-mem` | 4 | 2 | 3 | 3 | 2 | 4 | **60** | Persönlicher, nichtregulierter Versuch |
| `ruvnet/ruflo`-Memory | 3 | 2 | 4 | 1 | 3 | 3 | **52** | Nur Teil eines isolierten Ruflo-Programms |

MemSearch verbindet Markdown mit einem Vektorindex und stellt damit einen besser prüfbaren, hostübergreifenden Ansatz als eine ausschließlich transkriptgetriebene Session-Memory-Schicht dar.[12] Es bleibt dennoch ein zusätzlicher Speicher- und Retrievaldienst. Folglich sind Ausschlüsse, Speicherort, Retention, Löschung und ein Recall-Benchmark Voraussetzungen; keine automatische Memory-Zusammenfassung ersetzt ADRs oder Runbooks.[13]

## E. Werkzeugzugriff, Authentifizierung und Beobachtbarkeit

| Repository / Muster | Kontext | Sicherheit | Portabilität | Betrieb | Governance | Integration | Gewichteter Wert | Entscheidung |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Kuratierter MCP-Katalog + Toolsuche + Schema/Policy | 5 | 5 | 5 | 4 | 5 | 4 | **95** | **Standard** |
| Sandbox-Code-Modus für Datenfluss und Orchestrierung | 5 | 4 | 4 | 3 | 4 | 4 | **82** | Ab Datenmengen/mehreren Toolschritten |
| `oomol-lab/open-connector` | 3 | 4 | 5 | 2 | 4 | 3 | **70** | Produkt-/Enterprise-Option |
| `ccusage/ccusage` | 3 | 5 | 3 | 5 | 4 | 5 | **82** | **Lokaler Mess-Standard** |
| `f/agentlytics` | 3 | 3 | 5 | 3 | 3 | 4 | **68** | Optionale lokale Mehrhost-Ansicht |
| `ColeMurray/claude-code-otel` | 3 | 3 | 3 | 2 | 4 | 3 | **59** | Referenz für spätere Teamtelemetrie |

MCP fordert Sicherheitsmaßnahmen wie Eingabevalidierung, Zugriffskontrolle, Rate Limits, Ausgabesanitisierung, Timeouts, Logging und explizite Nutzerkontrolle für kritische Aufrufe.[14] Bei vielen Werkzeugen verschlechtert permanentes Tool-Loading die Kontextökonomie; ein Capability-Katalog und ein eingeschränkter Code-Modus binden Datenflüsse außerhalb des Modellfensters.[15] [16] Open Connector ist eine überzeugende Auth- und Secret-Boundary für agentische Produkte, aber für den normalen Coding-Agent-Alltag zu breit.[17]

## Entscheidungsmatrix: Welches Set wird tatsächlich kombiniert?

| Architekturrolle | Gewählter Standard | Ausweich- oder Pilotkandidat | Harte Ausschlussregel |
|---|---|---|---|
| Projektregeln | `AGENTS.md` + Host-Brücke | keine | Keine doppelte, auseinanderlaufende Regelbasis |
| Wiederholbare Verfahren | Kleines repositorylokales Skill-Set | Skills Manager für operative Verteilung | Kein ungeprüfter globaler Katalog im Projektkontext |
| Aktive Aufgabe | Native Planung, bei Bedarf planning-with-files | Spec Kit für größere Vorhaben | Kein Auto-Memory als Statusquelle |
| Dauerwissen | ADRs, Runbooks, Tests | MemSearch nach Pilot | Keine transkriptbasierte Automatisierung ohne Datenschutz-/Recall-Test |
| Codeverständnis | Suche + Originaldateien | **CodeGraph oder Claude Context**, niemals beide als Default | Keine vollständige Codebasis im Dauerkontext |
| Übergabe/Forensik | Repomix punktuell | — | Kein Snapshot als Live-Kontext |
| Toolausgaben | Originalartefakt + native Kompaktierung | **Squeez oder Claw Compactor**, niemals beide | Kein Verlust ohne Referenz/Retrieval |
| Datenformat | JSON-Schema | TOON für passende Tabellen | Kein globales JSON→TOON-Rewrite |
| Externe Tools | MCP-Katalog mit Policy | Open Connector nur für SaaS-Produktintegration | Keine mutierenden Tools ohne Bestätigung |
| Messung | CCUsage lokal | Agentlytics oder OTEL je Teambedarf | Keine Prompt-/Diff-Inhaltstelemetrie im Standard |
| Orchestrierung | Hauptagent + isolierte Worktrees + Review | Harness/Ruflo für dedizierte Programme | Keine Multiautonomie im gemeinsamen Worktree |

## Pilotreihenfolge

| Priorität | Pilot | Frage | Abbruchregel |
|---:|---|---|---|
| 1 | `AGENTS.md`, Skills, CCUsage | Verbessern klare Regeln und wiederholbare Verfahren Qualität und Durchlaufzeit? | Keine: dies ist die reversible Basisschicht |
| 2 | CodeGraph **gegen** Claude Context | Welcher Retrievalweg findet auf realen Aufgaben schneller die richtige Datei/Abhängigkeit? | Verlierer entfernen; Suche bleibt Fallback |
| 3 | Squeez **gegen** Baseline; bei Bedarf Claw Compactor | Senkt Output-Aufbereitung Kosten ohne Fehlerdiagnose und Testqualität zu verschlechtern? | Bei schlechterer Erfolgs-/Diagnosequalität sofort deaktivieren |
| 4 | planning-with-files bzw. Spec Kit | Erhöht ein explizites Artefaktprotokoll die Übergabequalität bei Langläufern? | Nur für mehrphasige Aufgaben beibehalten |
| 5 | MemSearch | Erhöht semantisches Erinnern die Wiederverwendung ohne riskante Persistenz? | Ohne abgesicherte Retention, Löschung und Recall-Nutzen nicht ausrollen |
| 6 | Toolsuche + Sandbox-Code-Modus | Reduzieren sie Tool-Kontext, Latenz und Fehlaufrufe? | Bei Policyverletzung oder unklarem Egress zurück auf direkte, bestätigte Calls |
| 7 | Agentlytics/OTEL bzw. Open Connector | Besteht ein Mehrhost-, Team- oder Produktbedarf, der den Betrieb rechtfertigt? | Ohne nachgewiesenen Mehrwert nicht zentralisieren |

## Quellen

[1]: https://agents.md/ "AGENTS.md"
[2]: https://agentskills.io/specification "Agent Skills Specification"
[3]: https://github.com/github/spec-kit "github/spec-kit"
[4]: https://github.com/OthmanAdi/planning-with-files "OthmanAdi/planning-with-files"
[5]: https://github.com/colbymchenry/codegraph "colbymchenry/codegraph"
[6]: https://github.com/zilliztech/claude-context "zilliztech/claude-context"
[7]: https://github.com/yamadashy/repomix "yamadashy/repomix"
[8]: https://github.com/toon-format/toon "toon-format/toon"
[9]: https://github.com/claudioemmanuel/squeez "claudioemmanuel/squeez"
[10]: https://github.com/open-compress/claw-compactor "open-compress/claw-compactor"
[11]: https://github.com/Compresr-ai/Context-Gateway "Compresr-ai/Context-Gateway"
[12]: https://github.com/zilliztech/memsearch "zilliztech/memsearch"
[13]: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents "Anthropic: Effective context engineering for AI agents"
[14]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "Model Context Protocol: Tools"
[15]: https://www.anthropic.com/engineering/advanced-tool-use "Anthropic: Introducing advanced tool use"
[16]: https://www.anthropic.com/engineering/code-execution-with-mcp "Anthropic: Code execution with MCP"
[17]: https://github.com/oomol-lab/open-connector "oomol-lab/open-connector"
