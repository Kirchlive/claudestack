# Kontextengineering für KI-Coding-Agents: erweiterte Repository- und Architekturentscheidung

**Stand:** 13. August 2026  
**Autor:** Manus AI  
**Entscheidungskontext:** Kleines bis mittleres Engineering-Team; **Sicherheit und Kontextqualität vor maximaler Autonomie**.  
**Datengrundlage:** Normalisiertes Inventar mit 104 eindeutigen Repository-Verweisen, vertiefte Prüfung priorisierter Kandidaten, offizielle Standards und öffentliche Fachquellen.

> **Kurzurteil:** Die sinnvollste Architektur kombiniert **keine** Vielzahl ähnlicher Plugins. Sie standardisiert eine kleine Kernschicht aus `AGENTS.md`, bedarfsgeladenen Agent Skills, Datei-/Textsuche, einem kuratierten MCP-Katalog, nativer Kompaktierung mit Originalartefakten, Qualitätsgates und lokaler Messung. Spezialisierte Repositories werden als **gegenseitige Pilotalternativen** eingesetzt: **CodeGraph oder Claude Context**, **Squeez oder Claw Compactor**. MemSearch, Context Gateway, Open Connector, Ruflo und Harness sind nur für klar abgegrenzte, später reifende Einsatzfälle geeignet.

## Einordnung und methodischer Rahmen

Das normalisierte Inventar umfasst **104 eindeutige Repository-Verweise**. Es verteilt sich auf Arbeitsablauf/Skills/Orchestrierung, Bedienoberflächen, Beobachtbarkeit, Kontext- und Tokenoptimierung, persistentes Gedächtnis, Integration sowie Codebasiserschließung. Diese Breite ist hilfreich zur Orientierung, aber sie ist kein Grund, alle Komponenten zu installieren. Viele der gefundenen Projekte lösen überlappende Teilprobleme; kombiniert man sie unkritisch, entstehen konkurrierende Hooks, redundante Memories, mehr Tooldefinitionen und ein größerer Vertrauensbereich.

Die öffentliche Fachliteratur beschreibt Kontextengineering entsprechend nicht als einzelnes Produkt, sondern als Gestaltung der gesamten Informationszufuhr an das Modell. Relevante Dimensionen sind **Anweisungen**, **Retrieval**, **Memory**, **Tools**, **Verdichtung** und **Kontextisolation**.[1] [2] Für Coding-Agents betont die aktuelle Praxis besonders, Regeln und Kontextinterfaces schrittweise aufzubauen und nicht alle Informationen oder Werkzeuge dauerhaft zu laden.[3] Dies ist der Maßstab der vorliegenden Entscheidung.

### Öffentliche Suchlandschaft und Berichtsausrichtung

Die öffentliche Recherche zum Thema „AI coding agent context engineering tools“ zeigt vor allem ausführliche technische Leitfäden. Sie behandeln Kontextengineering als Architektur- und Evaluierungsaufgabe, nicht als bloße Liste von Erweiterungen.[1] [2] [3] Der Bericht folgt daher einer **objektiven, entscheidungsorientierten** Form: Er vergleicht Kandidaten nach Funktionsfit, Sicherheit, Portabilität, Betrieb, Governance und Integrationsreife. Ein klassischer Preisvergleich wäre irreführend, weil die meisten Kandidaten quelloffen installiert werden; die wesentlichen Kosten entstehen durch Modelle, Storage, Betrieb, Netzwerkzugriff und Wartung.

| Entscheidungsdimension | Gewicht | Leitfrage |
|---|---:|---|
| Kontextqualität | 25 % | Liefert der Baustein relevante, nachvollziehbare Information zur richtigen Zeit? |
| Sicherheit und Datenschutz | 25 % | Bleibt der Vertrauensbereich klein, kontrollierbar und mit Least Privilege vereinbar? |
| Portabilität | 15 % | Ist das Muster zwischen Agents/Hosts oder als Standard nutzbar? |
| Betrieb und Wartung | 15 % | Bleibt die Komponente für ein kleines bis mittleres Team beherrschbar? |
| Nachweisbarkeit und Governance | 10 % | Unterstützt sie Review, Versionierung, Audit und klare Verantwortlichkeit? |
| Integrationsreife | 10 % | Gibt es einen realistischen, kontrollierbaren Einführungsweg? |

Die Punktewerte von 1 bis 5 bilden eine transparente Architekturgewichtung; sie sind **keine unabhängige Leistungsbenchmark** und dürfen nicht als Herstellervergleich gelesen werden. Die vollständige Berechnung und Gewichtung ist in der beigefügten Vergleichsmatrix nachvollziehbar.

## Empfohlene Zielarchitektur

![Vertikale Zielarchitektur mit Repository-Steuerung, Kontextschicht, Toolzugriff und Messung](assets/zielarchitektur.png)

*Abbildung 1: Zielarchitektur für einen kontextbewussten Coding-Agent. Türkise Bausteine gehören zur Kernschicht; gelbe Bausteine sind bedarfsgesteuerte, evaluierungspflichtige Ergänzungen; rosafarbene Bausteine markieren eine besondere Vertrauens- und Freigabegrenze.*

Die Architektur setzt auf eine eindeutige Zuständigkeit pro Artefakt. Dauerhafte Regeln und Entscheidungen werden im Repository versioniert. Aktive Langläufer erhalten einen kleinen Plan außerhalb des Kontextfensters. Codewissen wird progressiv erschlossen; Komprimierung darf nie die alleinige Quelle der Wahrheit sein. Tools werden als kontrollierte Schnittstelle betrieben, und Qualität wird durch Tests und Review belegt statt durch den Abschlussbericht eines Agenten.

| Ebene | Gewählter Standard | Zweck | Kontrollregel |
|---|---|---|---|
| Steuerung | `AGENTS.md` plus schlanke Host-Brücke, z. B. `CLAUDE.md` | Portierbare Regeln, Befehle und Architekturkarte | Eine kanonische Regelbasis; keine Duplikate |
| Fähigkeiten | Repositorylokale Agent Skills | Wiederkehrende Verfahren bei bedarfsgesteuertem Laden | Commit-gebunden, geprüft, klein und klar auslösbar |
| Aktiver Zustand | Native Planung; bei Langläufern planning-with-files | Ziel, Akzeptanzkriterien, Fortschritt und Nachweise | Nicht mit Langzeitwissen oder Chatverlauf verwechseln |
| Dauerwissen | ADRs, Runbooks, Tests und Projektregeln | Geprüfte, langlebige Entscheidungen | Reviewbar und versioniert; normativ vor Auto-Memory |
| Codekontext | Datei-/Textsuche und Originaldateien | Kleine, präzise Ausgangsmenge | Index oder Snapshot verweist auf Originale |
| Kontextökonomie | Native Kompaktierung und Originalartefakte | Alte Verläufe und große Toolausgaben steuern | Kürzung nur mit Rückholpfad und Qualitätsmessung |
| Toolzugriff | MCP-Katalog, Schema, Policy und Bestätigung | Externe Daten und Aktionen | Least Privilege, Timeouts, Audit, Freigabe für Writes |
| Beweis und Messung | CI-Gates plus CCUsage | Test-/Reviewnachweis sowie Kostensteuerung | Kein Prompt- oder Diff-Export im Standard |

## Schnellvergleich: die Kandidaten, die tatsächlich die Architekturentscheidung beeinflussen

| Kategorie | Primäre Wahl | Beste Alternative oder Ergänzung | Nutzen | Lizenz-/Kostenbild* | Klare Grenze |
|---|---|---|---|---|---|
| Projektsteuerung | `AGENTS.md` + Host-Brücke | keine | Portierbare, reviewbare Regeln | Offenes Format; Betriebsaufwand sehr gering | Nicht zu einem großen Always-on-Prompt ausbauen |
| Skills | SKILL.md-basierte Agent Skills | Skills Manager nur für operative Verteilung | Progressive Offenlegung von Verfahren und Ressourcen | Offener Standard; Desktop-Verteilung erzeugt Zusatzbetrieb | Projekt-Skills bleiben im Repository autoritativ |
| Langläufer | planning-with-files | Spec Kit bei größeren/regulierten Vorhaben | Aktiver Status außerhalb des Fensters | OSS-Tools; Kosten sind Prozess- und Pflegeaufwand | Nicht für kleine Änderungen einsetzen |
| Codeverständnis | Suche + Originaldateien | **CodeGraph oder Claude Context** | Struktur- oder semantikbasiertes Nachladen | OSS; ggf. lokale Index-/Embedding-Kosten | Nicht beide dauerhaft parallel betreiben |
| Übergabe | Repomix | — | Commitgebundener, gefilterter Snapshot | OSS; geringer Betrieb | Kein Live-Kontextdump |
| Ausgabenverdichtung | Native Kompaktierung | **Squeez oder Claw Compactor** | Logs, Diffs und Toolantworten begrenzen | OSS; Einsparung ist zu messen, nicht anzunehmen | Keine irreversible Kürzung ohne Retrieval |
| Langzeit-Memory | ADRs/Runbooks/Tests | MemSearch als kontrollierter Pilot | Geprüftes Wissen; optional semantisches Wiederfinden | OSS; Storage/Embedding/Betrieb beachten | Keine transkriptbasierte Automatik als Wahrheit |
| Tool-Policy | Kuratierter MCP-Katalog | Open Connector nur im Produkt-/Enterprise-Fall | Standardisierte, freigabefähige Aktionen | MCP offen; SaaS-Connectoren erhöhen Betrieb | Keine mutierenden Tools ohne Freigabe |
| Messung | CCUsage lokal | Agentlytics für lokale Mehrhost-Sicht, OTEL für Teams | Kosten, Latenz und Nutzen sichtbar machen | OSS; zentrale Telemetrie hat Betriebs- und Datenschutzkosten | Keine Inhaltsprotokollierung als Default |
| Orchestrierung | Hauptagent, getrennte Worktrees, Review | Harness/Ruflo nur als dediziertes Programm | Verantwortlichkeiten isolieren | OSS; sehr hoher Integrations- und Betriebsaufwand | Keine autonome Mehragentenarbeit im gemeinsamen Worktree |

\* **Kostenhinweis:** Es wurde keine Paid-Plan- oder Preislistenbewertung vorgenommen. Die „Kosten“ eines Architekturbausteins bestehen hier vor allem aus Modellaufrufen, Indizes, Speicher, Betrieb, Sicherheitsreview und Wartung. Vor Produktion sind Lizenz und Lieferkette für den gepinnten Release zu prüfen.

## Was gewinnt für den Basiseinsatz?

Die gewichtete Auswertung bevorzugt bewusst die schlanken, standardnahen Grundlagen. `AGENTS.md`, Skills, Suche, ein kleiner MCP-Katalog und die native Kompaktierung haben hohe Werte, weil sie den relevanten Kontext verbessern, ohne gleichzeitig einen zusätzlichen Proxy, Speicher- oder Multi-Agentenbetrieb vorauszusetzen.

![Balkendiagramm der gewichteten Eignung priorisierter Architekturbausteine](assets/gewichtete_repo_bewertung.png)

*Abbildung 2: Gewichtete Eignung ausgewählter Architekturbausteine. Werte ab 80 bilden Kern- oder frühe Pilotkandidaten. Die Grafik visualisiert die dokumentierte Expertengewichtung und keine gemessene Produktleistung.*

| Rangbereich | Bedeutung | Bausteine |
|---|---|---|
| 90–100: Kern | Niedriger Vertrauens- und Betriebsaufwand bei hohem Kontextnutzen | `AGENTS.md` + Host-Brücke, MCP-Policy, Datei-/Textsuche, Agent Skills, native Kompaktierung |
| 80–89: Früher Pilot oder gezielte Ergänzung | Klarer Nutzen, aber nur unter einem konkreten Auslöser | Repomix, planning-with-files, CCUsage, Sandbox-Code-Modus, TOON, Spec Kit |
| 70–79: Bedingter Spezialist | Eignung hängt von Codebasis, Datenpolitik oder Aufwand ab | CodeGraph, Squeez, MemSearch, Claude Context, Open Connector |
| Unter 70: Späterer Programm-/Plattformfall | Funktionsfülle oder Vertrauensbereich rechtfertigt keinen Standardrollout | Context Gateway, Agentlytics, Ruflo, Harness, umfassende OTEL-Stacks |

## Vergleich nach Architekturrolle

### 1. Regeln und Skills: kanonisch vor komfortabel

`AGENTS.md` ist als projektübergreifende Agentenanweisung gedacht und kann hierarchisch im Repository organisiert werden.[4] Eine schmale Hostdatei wie `CLAUDE.md` kann die portable Quelle importieren und nur hostbezogene Details ergänzen. Dies verhindert, dass Regeln für verschiedene Coding-Agents auseinanderlaufen.

Agent Skills lösen ein anderes Problem als Regeln: Sie bündeln Instructions, Skripte, Referenzen und Assets und laden erst bei Relevanz. Der offene Standard empfiehlt genau diese progressive Offenlegung: Metadaten beim Start, Kernanleitung bei Aktivierung, weitere Materialien ausschließlich bei Bedarf.[5] Das macht Skills zur bevorzugten Form für `repo-onboarding`, `implementation`, `testing-and-review`, `release` und gegebenenfalls Domänenverfahren.

| Kandidat | Gewinnt, wenn … | Verliert, wenn … | Entscheidung |
|---|---|---|---|
| Repositorylokale Agent Skills | Wiederkehrende Abläufe erklär- und testbar sind | Ein großes, undeutliches Skill-Archiv ohne Trigger entsteht | **Sofort einsetzen, aber klein beginnen** |
| `xingkongliang/skills-manager` | Mehrere Hosts/Geräte Skills sichtbar verteilen müssen | Ein Desktopkatalog unkontrolliert Projektdateien überschreibt | Operatives Hilfsmittel, nicht Governancequelle |
| `github/spec-kit` | Neues Feature, Architekturänderung oder Compliance eine explizite Artefaktkette verlangt | Routinefixes unnötig formalisiert werden | Für größere Vorhaben | 
| `OthmanAdi/planning-with-files` | Aufgaben Phasen, Unterbrechungen, Übergaben oder Subtasks haben | Bei kleinen Änderungen ein Hook- und Re-Injektionsoverhead entsteht | Für Langläufer, sonst native Planung |

Spec Kit liefert einen spezikationsgetriebenen Delivery-Ablauf mit Vorlagen und prüfbaren Artefakten.[6] planning-with-files bewahrt hingegen den aktiven Plan, Erkenntnisse und Fortschritt außerhalb des Kontextfensters und kann ihn nach Unterbrechungen wiederherstellen.[7] Beide sind komplementär; sie sind **kein** Ersatz für dauerhaftes Projektwissen.

### 2. Retrieval: Struktur oder Semantik, nicht beides unkontrolliert

Datei- und Textsuche plus gezieltes Lesen von Originaldateien bleibt der Default. Sie ist transparent, günstig und ohne Indexfrischeproblem. Erst wenn eine Codebasis groß, polyglott oder stark vernetzt ist, lohnt sich ein zusätzlicher Retrievaldienst.

| Kandidat | Besonderer Vorteil | Wichtigste Belastung | Wer sollte ihn wählen? |
|---|---|---|---|
| `colbymchenry/codegraph` | Beziehungen zwischen Symbolen, Aufrufern und Abhängigkeiten | Lokaler Index, sprachspezifische Abdeckung, Cache-Frische | Teams mit strukturellen Änderungs-, Refactoring- und Regressionsfragen |
| `zilliztech/claude-context` | Semantische MCP-Code- und Wissenssuche über größere Inhalte | Embeddings, Vektorindex und zusätzlicher MCP-Prozess | Teams mit Freitext-, Dokumentations- und Cross-Language-Suchbedarf |
| `yamadashy/repomix` | Reproduzierbarer Snapshot für Analyse und Übergabe | Gefahr des zu großen Kontextdumps | Reviews, externe Agenten, Incident-Übergabe und Initialanalyse |

CodeGraph baut einen lokalen Beziehungsgraphen für mehrere Sprachen auf und ist daher für symbol- und abhängigkeitssensitive Änderungen geeignet.[8] Claude Context richtet sich als MCP-gestützte Code-Suche auf semantisches Retrieval und Embedding-basierte Erschließung aus.[9] Die Fachliteratur unterstützt diese Trennung: Bei Code ergänzen sich Datei-/Textsuche, strukturierte Graphdaten und semantisches Retrieval; ein Volltext- oder Vektorindex allein ist nicht universell ausreichend.[1] [2]

> **Entscheidung:** Pilotieren Sie CodeGraph und Claude Context gegen dieselben zehn bis zwanzig realistischen Aufgaben. Messen Sie Zeit bis zur richtigen Datei, Recall relevanter Dateien, Indexfrische, zusätzliche Latenz, Datenegress und erforderliche Nacharbeit. Behalten Sie **einen** Kandidaten; die Standard-Suche bleibt der Fallback.

### 3. Kompression: Toolausgabe zuerst, Originale immer

Kontextoptimierung ist sinnvoll, sobald Logs, Suchresultate, Diffs oder Wiederholungen einen wesentlichen Teil des Fensters einnehmen. Der Fehler wäre, gesamte Arbeitsverläufe unkontrolliert zu verdichten und die Verdichtung dann als einzige Realität zu behandeln.

| Kandidat | Eignung | Stärke | Risiko | Empfehlung |
|---|---|---|---|---|
| Host-native Kompaktierung | Kern | Keine neue Systemkomponente | Qualität vom Host abhängig | **Immer zuerst nutzen** |
| `claudioemmanuel/squeez` | Erster Pilot | Hostnahe Aufbereitung von Toolausgaben, Hooks und Retrievalroute | Drittinterceptor im kritischen Pfad | Gegen Baseline testen |
| `open-compress/claw-compactor` | Alternative | Typ- und AST-bewusste Komprimierung, strukturierte Datenverarbeitung | Herstellereigene Benchmarks nicht ausreichend, Pipelinekomplexität | Nur als Squeez-Alternative testen |
| `toon-format/toon` | punktuell | Verlustfreie, kompakte Ansicht homogener Objektlisten | Falsche globale Anwendung verschlechtert komplexe/nichttabellarische Daten | Nur als Gateway-Serializer |
| `Compresr-ai/Context-Gateway` | Plattformfall | Zentraler Proxy mit Optimierung, Monitoring und Tool-Discovery | Prompt-/Auth-/Tool-Flüsse durchlaufen einen zusätzlichen Dienst | Erst mit zentralem Modellgateway prüfen |

Squeez konzentriert sich auf verdichtbare Toolausgaben wie Shellresultate, Logs und Diffs.[10] Claw Compactor bietet umfangreichere struktur- und AST-bewusste Verarbeitung.[11] TOON ist eine verlustfreie Serialisierung für geeignete JSON-Strukturen, insbesondere homogene Listen, und deshalb kein genereller Ersatz für JSON-Schemata.[12] Context Gateway verlagert Komprimierung, Toolsuche und Historie in einen Agentenproxy; diese Zentralisierung kann auf Plattformebene überzeugend sein, ist aber für ein einzelnes Entwicklungsteam ein deutlich größerer Vertrauens- und Betriebsumfang.[13]

Die verbindliche Datenregel lautet: **Exit-Code, Quelle, Zeit, Pfad, Testname, Exception, Commit/Session und Originalreferenz bleiben erhalten.** Jede Kompressionsstufe braucht einen Retrieval- oder Rollbackpfad. Deaktivieren Sie sie sofort, wenn Fehlerdiagnose, Testqualität oder menschliche Reviewnacharbeit messbar schlechter wird.

### 4. Memory: normative Dokumente vor automatischer Erinnerung

Langzeitmemory ist verlockend, weil es Übergaben und wiederkehrende Fragen beschleunigen kann. Doch es erweitert Datenhaltung und Fehlermodi: Stale Einträge, unpassende Retrievals, Geheimnisse, unklare Retention und schwer sichtbare Modellzusammenfassungen.

![Heatmap der Pilotkandidaten entlang Kontext, Sicherheit, Portabilität, Betrieb, Governance und Integration](assets/kandidaten_heatmap.png)

*Abbildung 3: Dimensionssicht auf die Pilotkandidaten. Helle Zellen zeigen explizite Zielkonflikte; etwa erhöht ein umfangreicher Proxy oder Multi-Agenten-Harness die Portabilität, aber senkt bei den getroffenen Annahmen die Beherrschbarkeit und den Sicherheitswert.*

| Kandidat | Was er gut kann | Warum er nicht normativ ist | Entscheidung |
|---|---|---|---|
| ADRs, Runbooks, Tests, `AGENTS.md` | Geprüfte, reviewbare und versionierte Projektwahrheit | Kein semantischer Automatismus | **Immer die primäre Wissensquelle** |
| `zilliztech/memsearch` | Hostübergreifende Memory-Schicht mit Markdown und Milvus | Embeddings, Index, Hooks und Speicherung müssen betrieben und kontrolliert werden | Bester kontrollierter Memory-Pilot |
| `thedotmack/claude-mem` | Sessionübergreifende Beobachtungen und Suchzugriff | Größerer Vertrauensbereich durch persistente Aktivitäts- und Zusammenfassungsdaten | Nur persönlicher, nichtregulierter Versuch |
| Ruflo-Memory | Teil einer umfangreichen Orchestrierungsplattform | Nicht sinnvoll isoliert von Ruflos übriger Komplexität zu bewerten | Nur innerhalb eines dedizierten Ruflo-Programms |

MemSearch kombiniert Markdown als prüfbares Artefakt mit Milvus als Suchschicht und bietet Plugins für mehrere Agenten.[14] Das ist gegenüber rein transkriptbasierter Erinnerung architektonisch attraktiver, hebt jedoch nicht die Notwendigkeit von Ausschlüssen, Verschlüsselung, Retention, Löschung, Backup und Recall-Evaluation auf. Die Speicherstrategie bleibt daher zweistufig: menschlich prüfbares Repositorywissen als Wahrheit, Memory als abrufbare **Assistenz**.

### 5. Tools, Authentifizierung und Beobachtbarkeit: Grenze statt Katalog

MCP ist der geeignete Adapterstandard für Toolzugriff, aber eine wachsende Zahl unkuratierter Tools verschlechtert Kontext und Sicherheit. Die Spezifikation fordert unter anderem Eingabevalidierung, Zugriffskontrolle, Rate Limits, Ausgabesanitisierung, Timeouts, Logging und Nutzerkontrolle für kritische Aktionen.[15] Toolmetadaten eines untrusted Servers sind keine ausreichende Sicherheitsgrundlage.[15]

| Kandidat / Muster | Entscheidung | Warum |
|---|---|---|
| Kuratierter MCP-Katalog mit Toolsuche, Schemata und Policy | **Standard** | Kleines Always-on-Set; Rest nach Bedarf laden; Mutationen bestätigen |
| Sandbox-Code-Modus | Früher Pilot | Orchestriert große Datenmengen und Toolketten außerhalb des Modellfensters; nur begrenzte Rückgaben kehren in den Kontext zurück |
| `oomol-lab/open-connector` | Enterprise-/Produktoption | Hält SaaS-Credentials hinter einer OAuth- und Connector-Grenze, eignet sich aber erst bei mandantenfähiger, dauerhafter SaaS-Integration [16] |
| `ccusage/ccusage` | Lokaler Standard | Macht Kosten- und Nutzungsindikatoren sichtbar, ohne eine zentrale Inhaltsplattform zu errichten [17] |
| `f/agentlytics` | Teamoption | Vereinheitlicht lokale Analytics über mehrere Hosts, braucht aber Daten- und Relay-Governance [18] |
| `ColeMurray/claude-code-otel` | Referenz | Zeigt OTEL-/Prometheus-/Loki-/Grafana-Architektur, sollte nicht als ungeprüfter Standardstack übernommen werden [19] |

Das Tool-Interface folgt progressiver Offenlegung: Drei bis fünf häufige, risikoarme Tools dürfen sichtbar sein. Wenn die Bibliothek wächst, sucht der Agent im Capability-Katalog anhand knapper Beschreibungen und Schemas. Anthropic beschreibt, dass Toolsuche sowie Codeausführung mit eingeschränkten Werkzeugrechten die Kontextbelastung bei großen Toolflächen reduzieren können.[20] [21] Ein Sandbox-Worker muss Ressourcenlimits, klaren Netzwerkegress, kurzlebige Secrets, Datenklassifizierung und eine maximale Rückgabegröße erzwingen.

### 6. Orchestrierung: explizite Rollen statt Auto-Schwarm

Ruflo und Harness sind funktional beeindruckend, aber sie lösen ein anderes Problem als der Basiseinsatz. Ruflo integriert eine breite Swarm-, Memory-, MCP-, Hook- und Föderationsschicht mit zahlreichen Agenten und Plugins.[22] Harness erzeugt Agententeams und ihre Skills anhand mehrerer Teamarchitekturmuster.[23] Beide erhöhen die Architekturfläche erheblich.

| Ansatz | Geeignet für | Nicht geeignet für | Empfohlene Leitplanke |
|---|---|---|---|
| Hauptagent + getrennte Worktrees + Reviewagent | Regelmäßige Produktentwicklung, gezielte Reviews, überschaubare Delegation | Breite, parallele Explorationsprogramme | Branch-/Worktree-Isolation; nur ein Writer je Pfad |
| Subagent mit kleinem Kontext | Unabhängige Recherche, Testlauf, Review, begrenzter Analyseauftrag | Unklare gemeinsame Zuständigkeit oder Write-Races | Enges Ziel, begrenzte Tools, strukturiertes Ergebnis |
| Harness | Wiederkehrendes Teamdesign mit bekannten Mustern und formaler Evaluation | Ad-hoc-Features im Standardalltag | Explizite Teamarchitektur als Designartefakt |
| Ruflo | Plattformprogramm mit Ownership, Budget, Sicherheits- und Egress-Policy | Kleines/mittleres Team ohne Betriebskapazität | Separates Pilotprojekt, dedizierte Umgebung, nachvollziehbare Kosten |

Die Einschätzung deckt sich mit der Fachliteratur: Kontextisolation über Subagents kann sinnvoll sein, verursacht aber Koordinations- und Tokenkosten und erfordert bewusstes Arbeitspaketdesign.[2] Es ist kein Ersatz für klare Zuständigkeiten, Tests, Worktree-Grenzen und menschliches Review.

## Die Best-of-Architecture: konkrete Kombination

| Architekturrolle | Jetzt einführen | Erst bei Bedarf | Nicht kombinieren |
|---|---|---|---|
| Coding-Agent-Host | Ein Hauptagent pro Worktree | Hostwechsel je Aufgabenprofil | Mehrere gleichzeitig schreibende Agents im selben Worktree |
| Regeln | `AGENTS.md`, dünne Host-Brücke, verschachtelte Teilregeln | Weitere pfadspezifische Regeln | Doppelte `CLAUDE.md`-/`AGENTS.md`-Inhalte |
| Skills | 3–5 lokale, geprüfte Skills | Skills Manager für Mehrhost-Verteilung | Externe Skill-Sammlungen ohne Pinning/Review |
| Plan | Native Planung | planning-with-files, danach Spec Kit | Memory oder Chat als Aufgabenstatus |
| Code-Retrieval | Suche und Originaldateien | CodeGraph **oder** Claude Context | Zwei dauerhafte Indexer ohne Entscheidungsgrund |
| Übergabe | Repomix mit Commit-ID und Include/Exclude-Manifest | — | Snapshot als permanente Promptgrundlage |
| Kompression | Native Hostfunktion | Squeez **oder** Claw Compactor; TOON für Tabellen | Mehrere Interceptor-Pipelines oder globales JSON→TOON |
| Memory | ADRs, Runbooks, Tests | MemSearch | Ungeprüfte Auto-Memory-Tools als Projektwahrheit |
| Tooling | Kuratierter MCP-Katalog | Sandbox-Code-Modus, Open Connector im Produktfall | Freie Write-Rechte oder vollständiges Toolinventar im Startkontext |
| Telemetrie | CCUsage lokal | Agentlytics, danach OTEL bei Team-/Auditbedarf | Prompt-/Diff-Inhaltslogging als Default |
| Orchestrierung | Hauptagent, Worktrees, Review | Explizit begrenzte Subagents | Ruflo/Harness als unkontrollierte Standardinstallation |

## Umsetzungs- und Evaluierungsplan

| Welle | Zeitraum | Ergebnis | Messung und Abbruchkriterium |
|---|---|---|---|
| 1. Fundament | Woche 1–2 | `AGENTS.md`, Host-Brücke, Qualitätsbefehle, ADR-Template, CCUsage | Onboarding-Aufgabe ohne Rückfragen möglich; keine neue Laufzeitkomponente |
| 2. Wiederholbarkeit | Woche 3–4 | Kleine Skills für Onboarding, Implementierung, Review/Test und Release | Jeder Skill löst ein reales Problem und bleibt klein genug für gezieltes Laden |
| 3. Retrieval | Woche 5–6 | CodeGraph- oder Claude-Context-Pilot auf echtem Aufgabenpool | Richtige Datei/Abhängigkeit schneller; Verlierer entfernen |
| 4. Output-Kontext | Woche 7–8 | Squeez-Pilot gegen Baseline, bei Bedarf Claw-Alternative | Keine Verschlechterung bei Diagnosezeit, Tests und Reviewnacharbeit |
| 5. Koordination | Woche 9–10 | Dateiplan/Spec Kit bei Langläufern, Sandbox für Toolketten | Bessere Übergabe und weniger Kontextverlust; keine Policyverletzung |
| 6. Langfristige Erweiterung | ab Woche 11 | MemSearch, Agentlytics/OTEL oder Open Connector nur mit Bedarfssignal | Datenschutz-, Retention-, Recall- und Betriebsreview bestanden |

Ein angemessenes Benchmark-Korpus enthält zehn bis zwanzig anonymisierte, aber echte Aufgaben: Bugfix, Refactoring, neue API-Funktion, Fehlertest, Code-Review, Incident-Analyse und Releasevorbereitung. Für jede Aufgabe sind Ausgangszustand, Akzeptanzkriterien, geänderte Dateien, Tests, Durchlaufzeit, Toolkosten und menschliche Nacharbeit festzuhalten. Das verhindert, dass eine Tokenersparnis fälschlich als Engineering-Erfolg gilt.

| Kennzahl | Bedeutung | Übernahmeregel |
|---|---|---|
| Erfolgsrate | Anteil akzeptierter und getesteter Aufgaben | Darf nicht praktisch relevant sinken |
| Zeit bis zur richtigen Datei/Ursache | Retrieval- und Diagnosequalität | Muss mindestens stabil bleiben |
| Test- und Reviewnacharbeit | Korrektheit und Wartbarkeit | Soll sinken oder stabil bleiben |
| Kosten je akzeptierter Änderung | Gesamtaufwand, nicht nur Tokens | Darf nur bei erhaltener Qualität optimiert werden |
| Kontext-/Toolvolumen | Zeichen für unnötige Belastung | Muss bei Retrieval-/Kompressionspiloten begrenzt bleiben |
| Sicherheitsereignisse | Fehlaufrufe, Datenegress, Policyverletzung | Keine kritischen Vorfälle; jeder Vorfall löst Policyreview aus |
| Betriebslast | Updates, Hooks, Services und Support | Darf den gemessenen Nutzen nicht übersteigen |

## Häufige Fehlentscheidungen

| Fehlmuster | Warum es scheitert | Architekturantwort |
|---|---|---|
| „Alle guten Repos installieren“ | Überschneidende Hooks, Memories und Toolflächen machen Verhalten unklar | Eine Hauptkomponente pro Problemklasse, Alternativen nur im Pilot |
| Codebasis in jeden Prompt dumpen | Höhere Kosten, Latenz und Kontextablenkung | Suche, Originaldateien, dann genau ein passender Index oder Snapshot |
| Memory als Dokumentation behandeln | Zusammenfassungen können veralten oder falsch abgerufen werden | ADRs/Runbooks/Tests bleiben normativ |
| Tokenreduktion isoliert optimieren | Fehlersignale und Randbedingungen können verschwinden | Erfolg, Diagnosezeit und Testqualität gegen Kosten messen |
| MCP als Freigabeersatz behandeln | Tools können schreiben, sensible Daten sehen oder externe Effekte erzeugen | Policy, Schema, Least Privilege, Timeout, Audit und Bestätigung |
| Multi-Agenten-Autonomie voreilig ausrollen | Mehr Koordination, Kosten, Zustandskonflikte und Egress | Erst kleine, isolierte Subtasks; Swarms nur als eigenes Programm |

## Schlussentscheidung: Was sollte das Team tun?

**Sofort:** `AGENTS.md` als kanonische Regelbasis, schlanke Host-Brücke, drei bis fünf lokale Skills, versionierte ADRs/Runbooks, Datei-/Textsuche, native Kompaktierung, kuratierter MCP-Katalog mit Write-Confirmation, CI-Gates und CCUsage.

**In der nächsten Iteration:** Repomix für Übergaben, planning-with-files bei Langläufern und ein A/B-Pilot von CodeGraph gegen Claude Context. Ergänzend wird Squeez gegen die vorhandene Toolausgaben-Baseline geprüft.

**Später und nur nach nachgewiesenem Nutzen:** MemSearch für Langzeitmemory, Sandbox-Code-Modus für größere Toolketten, Agentlytics/OTEL für Teamtelemetrie und Open Connector für ein echtes SaaS-/Produktintegrationsproblem. Context Gateway, Ruflo und Harness bleiben Plattformoptionen, nicht Teamdefaults.

> **Finale Empfehlung:** Bauen Sie zuerst eine **kleine, überprüfbare Kontextpipeline** und behalten Sie Alternativen gegeneinander testbar. Der Kontext wird dadurch besser, dass Informationen nach Dauer, Risiko und Aufgabe getrennt werden — nicht dadurch, dass möglichst viele Repositories gleichzeitig in den Agentenprozess geladen werden.

## Quellen

[1]: https://sourcegraph.com/blog/context-engineering "Sourcegraph: Context Engineering – A Practical Guide for AI Agents (2026)"
[2]: https://www.langchain.com/blog/context-engineering-for-agents "LangChain: Context Engineering"
[3]: https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html "Martin Fowler / Thoughtworks: Context Engineering for Coding Agents"
[4]: https://agents.md/ "AGENTS.md"
[5]: https://agentskills.io/specification "Agent Skills Specification"
[6]: https://github.com/github/spec-kit "github/spec-kit"
[7]: https://github.com/OthmanAdi/planning-with-files "OthmanAdi/planning-with-files"
[8]: https://github.com/colbymchenry/codegraph "colbymchenry/codegraph"
[9]: https://github.com/zilliztech/claude-context "zilliztech/claude-context"
[10]: https://github.com/claudioemmanuel/squeez "claudioemmanuel/squeez"
[11]: https://github.com/open-compress/claw-compactor "open-compress/claw-compactor"
[12]: https://github.com/toon-format/toon "toon-format/toon"
[13]: https://github.com/Compresr-ai/Context-Gateway "Compresr-ai/Context-Gateway"
[14]: https://github.com/zilliztech/memsearch "zilliztech/memsearch"
[15]: https://modelcontextprotocol.io/specification/2025-06-18/server/tools "Model Context Protocol: Tools"
[16]: https://github.com/oomol-lab/open-connector "oomol-lab/open-connector"
[17]: https://github.com/ccusage/ccusage "ccusage/ccusage"
[18]: https://github.com/f/agentlytics "f/agentlytics"
[19]: https://github.com/ColeMurray/claude-code-otel "ColeMurray/claude-code-otel"
[20]: https://www.anthropic.com/engineering/advanced-tool-use "Anthropic: Introducing advanced tool use"
[21]: https://www.anthropic.com/engineering/code-execution-with-mcp "Anthropic: Code execution with MCP"
[22]: https://github.com/ruvnet/ruflo "ruvnet/ruflo"
[23]: https://github.com/revfactory/harness "revfactory/harness"

---

### Begleitdateien

Die vollständige gewichtete Matrix befindet sich in `vergleichsmatrix_repositories.md`; die Eingabewerte und die reproduzierbare Berechnung in `vergleichsscores.csv` beziehungsweise `vergleichsscores_berechnet.csv`. Das vollständige normalisierte Repository-Inventar bleibt in `repo_inventar.md` erhalten.
