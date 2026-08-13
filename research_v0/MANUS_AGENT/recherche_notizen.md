# Recherche-Notizen

## open-compress/claw-compactor

Quelle: <https://github.com/open-compress/claw-compactor> (abgerufen am 13. August 2026).

- Beschreibt sich als quelloffene Token-Komprimierungsengine mit 14-stufiger Pipeline und MIT-Lizenz.
- Relevante Bausteine sind typbasierte Erkennung, AST-bewusste Codekomprimierung per tree-sitter, Deduplication, spezialisierte Verarbeitung für JSON, Logs, Suchtreffer und Diffs sowie reversible Retrieval-Marker.
- Die Seite nennt für die interne Benchmark-Spanne 15–82 % Komprimierung und weist für SWE-bench 12–19 % aus. Diese herstellereigenen Werte sind nicht ohne unabhängige Reproduktion als Entscheidungsnachweis zu werten.
- Für ein Zielsystem eignet sich das Projekt höchstens als **optionaler Adapter hinter einer Qualitäts- und Rollback-Schranke**, nicht als zentraler, unüberwachter Kontextlayer. Unveränderte Originale und zitatfähige Verweise müssen erhalten bleiben.

## Architekturprinzipien aus unabhängigen Fachquellen

Die belastbare Referenzarchitektur folgt nicht dem Muster „möglichst viel Kontext in ein Modellfenster laden“. Anthropic beschreibt Kontext als begrenzte Ressource und empfiehlt den kleinsten Satz hochsignaler Informationen; für große Codebasen soll ein Agent stattdessen leichte Referenzen halten und Informationen schrittweise, bedarfsgesteuert über Werkzeuge abrufen. Für Langläufer sind Kompaktierung, persistente strukturierte Notizen und getrennte Unteraufgaben komplementäre Optionen. Quelle: <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>.

LangChain fasst die wiederkehrenden Steuerungsmaßnahmen als **Schreiben, Selektieren, Komprimieren und Isolieren** zusammen. Besonders wichtig für diese Untersuchung ist die Unterscheidung zwischen verlustarmer, regelbasierter Kürzung von Toolausgaben und modellbasierter Zusammenfassung: Letztere darf nur nach überprüfbarer Evaluation eingesetzt werden. Quelle: <https://www.langchain.com/blog/context-engineering-for-agents>.

Für Coding Agents betont Martin Fowler die klare Trennung von globaler Orientierung, bedarfsabhängigen Skills, deterministischen Hooks und eigenständigen Subagenten. Eine große, unkuratierte Sammlung von Regeln und Werkzeugen ist kontraproduktiv; Konfigurationen sollen schrittweise wachsen und nachvollziehbar bleiben. Quelle: <https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html>.

## claudioemmanuel/squeez

Quelle: <https://github.com/claudioemmanuel/squeez> (abgerufen am 13. August 2026). Das Projekt ist ein aktiv gepflegter, Hook-basierter Optimierer für mehrere CLI-Hosts, darunter Claude Code, Copilot CLI, OpenCode, Gemini CLI und Codex CLI. Es verarbeitet vor allem Toolausgaben: Shell-Ausgaben, Logs und wiederholte Ergebnisse können vor der Aufnahme in den Modellkontext gefiltert, verdichtet oder dedupliziert werden. Ein kontextadressierter Blob-Speicher mit Abrufmöglichkeit und Integritätsprüfung reduziert das Risiko, dass verloren geglaubte Details nicht mehr reproduzierbar sind.

Die sinnvolle Rolle im Ziel-Stack ist eine **opt-in Laufzeit-Optimierung hinter einem transparenten Mess- und Rollback-Mechanismus**. Squeez ist stärker als ein allgemeiner Textkompressor, weil es Host-Hooks, relevanzorientierte Kürzung, Id-Factsheets, Deduplication und eine Wiederherstellungsroute integriert. Zugleich bleibt es ein Drittanbieter-Interceptor auf dem kritischen Pfad: Es darf keine einzige Quelle der Wahrheit für Aufgabenstand, Codewissen oder Auditdaten sein. Herstellerbenchmarks und Aussagen wie „bis zu 95 %“ werden nur als Hypothesen für einen kontrollierten Pilot bewertet, nicht als Zielwert übernommen.

## toon-format/toon

Quelle: <https://github.com/toon-format/toon> (abgerufen am 13. August 2026). TOON ist eine verlustfreie, für LLM-Eingaben lesbare Serialisierung des JSON-Datenmodells. Es ist nach eigener Dokumentation besonders effizient bei homogenen Objektlisten und nutzt für verschachtelte Strukturen Einrückung sowie für gleichförmige Daten tabellarische Formen. Für tief geschachtelte oder stark heterogene Objekte kann JSON günstiger sein; die Spezifikation bezeichnet sich ausdrücklich als stabil, aber weiterentwickelbar.

Die Empfehlung lautet deshalb **kein globales JSON→TOON-Rewrite**, sondern ein messbarer Serializer im Tool-Gateway: bei Listen von Prüfresultaten, Suchtreffern, Testfällen und Telemetrie wird TOON als eine von mehreren Darstellungen evaluiert; ansonsten bleiben JSON oder gezielt generierte Kurzformate erhalten. Die Nutzlast muss über ein Schema gegen die ursprüngliche JSON-Struktur validierbar bleiben.

## yamadashy/repomix

Quelle: <https://github.com/yamadashy/repomix> (abgerufen am 13. August 2026). Repomix erzeugt einen nachvollziehbaren, KI-freundlichen Snapshot einer Codebasis und kann eine Referenz über Commit oder Branch festschreiben. Positiv ist die dokumentierte Vorsichtsmaßnahme, Konfigurationen entfernter Repositories standardmäßig nicht zu laden; das bleibt aber nur ein Baustein der Supply-Chain-Sicherung und kein Freifahrtschein für fremden Code.

Im Ziel-Stack dient Repomix **nicht als Standardkontext jeder Aufgabe**, weil ein Komplettdump die Aufmerksamkeitsökonomie unterläuft. Es ist ein deterministisches Diagnose- und Übergabeartefakt für Initialanalysen, Code-Reviews, externe Agenten oder schwer reproduzierbare Bugs. Der Export soll immer mit Commit-ID, Include/Exclude-Manifest, Sensitivitätsprüfung und Tokenbudget abgelegt werden. Für den Arbeitsalltag gewinnt progressive Suche und gezieltes Nachladen.

## colbymchenry/codegraph

Quelle: <https://github.com/colbymchenry/codegraph> (abgerufen am 13. August 2026). CodeGraph indexiert Code lokal als vorab berechneten Beziehungsgraphen und aktualisiert ihn nach Änderungen inkrementell. Das Projekt dokumentiert mehrere Sprachen, einen nativen Parserkern mit Fallback sowie einen absichtlich auf einen „Explore“-Einstieg reduzierten Werkzeugzugriff. Damit adressiert es das zentrale Problem, für eine Änderung nicht nur semantisch ähnliche Textausschnitte, sondern Abhängigkeiten, Aufrufer und Symbole nachzuladen.

CodeGraph ist der bevorzugte **Primärindex für große, langlebige und polyglotte Repositories**, wenn ein lokaler Index akzeptabel ist. Seine Ergebnisse müssen immer Pfade, Symbole, Commit/Working-Tree-Stand und Zeilenbereiche ausweisen; der Agent liest die Originaldateien erst danach gezielt nach. Für kleine oder kurzlebige Projekte ist ein Index unnötige Latenz und Betriebsfläche, sodass Datei- und Textsuche der Default bleibt. Herstellerangaben zu Skalierung und Geschwindigkeit werden im Pilot mit dem eigenen Repositoryprofil gemessen.

## thedotmack/claude-mem

Quelle: <https://github.com/thedotmack/claude-mem> (abgerufen am 13. August 2026). Claude-Mem sammelt Toolbeobachtungen über Lifecycle-Hooks, erzeugt Zusammenfassungen und stellt sie in späteren Sitzungen über lokale Dienste, SQLite sowie hybride semantische und Stichwortsuche wieder bereit. Die breite Hostabdeckung und der aktive Entwicklungsstand sind für einen Pilot attraktiv; gleichzeitig erweitert die Lösung den Vertrauensbereich erheblich, weil sie Aktivitäten, Arbeitsartefakte und abgeleitete Zusammenfassungen persistent speichert.

Daher ist Claude-Mem **keine voraussetzungslose Standardempfehlung**. Als optionaler Pilot kann es für Einzelentwickler oder nicht regulierte Projekte sinnvoll sein, wenn Speicherort, Verschlüsselung, Ausschlüsse, Retention, Löschroutinen, Zugang zu LLM-basierten Zusammenfassungen und Telemetrie transparent kontrolliert werden. Für Teams oder sensible Repositories ist zuerst ein schlankes, versioniertes Projektgedächtnis auf Basis von Markdown-Entscheidungen, Aufgabenstand und ADRs einzuführen; automatisiertes Langzeitgedächtnis wird erst danach anhand von Recall-Qualität und Datenschutz geprüft.

## ccusage/ccusage

Quelle: <https://github.com/ccusage/ccusage> (abgerufen am 13. August 2026). CCUsage wertet lokale Verlaufsdaten von Coding-Agent-CLIs aus und aggregiert Token- und Kosteninformationen nach Zeit, Sitzung und unterstütztem Agent. Die Dokumentation und Entwicklung zeigen, dass Kostenberechnung bei Caches, Modelltarifen, Service-Tiers und wiederholten Transkriptzeilen fehleranfällig ist; die gemeldeten Summen sind deshalb Steuerungsindikatoren, keine buchhalterische Wahrheit.

CCUsage wird als **kostenloser Basissensor** in den Stack aufgenommen. Seine Reports sollen ausschließlich lokal erfasst, projektbezogen pseudonymisiert und mit Erfolgssignalen wie Teststatus, Review-Nacharbeit und Durchlaufzeit verbunden werden. So wird nicht bloß „weniger Tokens“ optimiert, sondern Kosten je erfolgreich abgeschlossener, überprüfter Änderung. Für verteilte Teams ergänzt eine standardisierte OTEL- oder Trace-Schnittstelle die lokale Sicht; Rohprompts und Quellcode bleiben standardmäßig außerhalb zentraler Telemetrie.

## github/spec-kit

Quelle: <https://github.com/github/spec-kit> (abgerufen am 13. August 2026). Spec Kit ist ein Toolkit für spezifikationsgetriebene Entwicklung. Es bietet eine klare Artefaktfolge aus Verfassung/Leitplanken, Spezifikation, Recherche, Umsetzungsplan, Datenmodell und abhängigen Aufgaben. Dabei werden Vorlagen zur Laufzeit aus einer Prioritätskette aufgelöst: projektspezifische Überschreibungen vor Presets, Erweiterungen und Kernvorlagen. Die Software legt Wert auf reproduzierbare Artefakte, Versionsangaben sowie Integrations- und Konfliktprüfungen.

Für den Ziel-Stack wird Spec Kit **nicht als globale Pflichtschicht**, sondern als optionales, repository-lokales Delivery-Protokoll empfohlen: Es eignet sich vor allem für neue Features, architekturwirksame Änderungen und regulierte Teams. Eine schlankere Alternative bleibt ein handgeschriebenes `AGENTS.md` plus kompakte Vorlagen für `spec.md`, `plan.md` und `tasks.md`. Unabhängig vom Werkzeug gilt: langlebige Entscheidungen und Regeln gehören versioniert in das Repository; flüchtige Dialogverläufe nicht.


## Herstellerneutrale Steuerungs- und Kontextschicht

Quellen: Anthropic, *How Claude remembers your project* (<https://code.claude.com/docs/en/memory>); OpenAI, *Codex Prompting Guide* (<https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide>); AGENTS.md (<https://agents.md/>); jeweils abgerufen am 13. August 2026.

Die Primärquellen stimmen in drei wesentlichen Punkten überein: Erstens muss dauerhaftes Projektwissen **kurz, versioniert, hierarchisch und projektlokal** sein. Zweitens sollen detaillierte, nur situationsbezogene Vorgehensweisen als bei Bedarf geladene Skills oder pfadspezifische Regeln vorliegen, nicht im permanenten Startkontext. Drittens ist eine explizite, maschinenlesbare Arbeitsfolge mit Exploration, Umsetzung, Prüfung und Abschluss wirksamer als ein großer, monolithischer Systemprompt.

Als portable Basis empfiehlt das Konzept deshalb `AGENTS.md` am Repository-Stamm mit verschachtelten Dateien für Teilbereiche. Für Claude Code importiert eine schmale `CLAUDE.md` diese Quelle und ergänzt ausschließlich Laufzeit-spezifische Einstellungen; andere Agents lesen `AGENTS.md` direkt. Das verhindert doppelte, auseinanderlaufende Anweisungen. Ein Dokument soll im Regelfall unter etwa 200 Zeilen bleiben; Regeln für bestimmte Pfade werden separat gehalten.

Native Kontextkompaktierung und hosteigene Auto-Memory-Funktionen werden als **flüchtige Assistenz**, nicht als alleinige Wissensquelle behandelt. Langfristig gültige Architekturentscheidungen, Sicherheitsvorgaben, Qualitätsgates und überprüfte Betriebswissen gehören stattdessen in versionierte Dokumente (z. B. `docs/adr/`, `AGENTS.md`, `docs/runbooks/`).


## Werkzeugzugriff, MCP und Token-Budgets

Quellen: MCP-Spezifikation, *Tools* (<https://modelcontextprotocol.io/specification/2025-06-18/server/tools>); Anthropic, *Code execution with MCP* (<https://www.anthropic.com/engineering/code-execution-with-mcp>) und *Introducing advanced tool use* (<https://www.anthropic.com/engineering/advanced-tool-use>); abgerufen am 13. August 2026.

MCP wird als offener **Adapterstandard**, nicht als unkontrollierter Werkzeugkatalog eingesetzt. Der Client muss Tool-Eingaben und Ergebnisse validieren, Timeouts und Rate Limits anwenden, kritische Aktionen sichtbar machen und bestätigungspflichtig halten sowie Aufrufe revisionsfähig protokollieren. Tool-Anmerkungen von nichtvertrauenswürdigen Servern sind keine ausreichende Sicherheitsgrundlage.

Die Integrationsschicht folgt einer progressiven Offenlegung: Drei bis fünf häufige, risikoarme Werkzeuge dürfen direkt verfügbar sein. Der Rest wird über Suche/Capabilities-Katalog mit kompakten Namen, Beschreibungen und Schemas erst bei Bedarf geladen. Bei mehrstufigen Abläufen oder großen Datenmengen orchestriert ein eingeschränkter Code-Sandbox-Worker Werkzeuge, filtert und aggregiert Ergebnisse vor der Rückgabe an das Modell. Dies reduziert Kontextverschmutzung, Latenz und Datenabfluss. Direkte Tool-Aufrufe bleiben für kleine, interaktive und reviewbedürftige Aktionen sinnvoll.

TOON oder ein vergleichbar spaltenorientiertes Format ist höchstens ein **optionales Transportformat** für kleine, homogene Tabellenantworten. Es ersetzt weder JSON-Schema-validierte Tool-Ausgaben noch eine Versionierungs- und Fehlersemantik. Die primäre Schnittstelle bleibt strukturiertes JSON mit strenger Eingabe-/Ausgabevalidierung; Text dient nur als lesbare, gekürzte Darstellung.


## ColeMurray/claude-code-otel

Quelle: <https://github.com/ColeMurray/claude-code-otel> (abgerufen am 13. August 2026). Das Repository liefert eine praxisnahe OpenTelemetry-Referenz für Claude-Code-Nutzung mit Collector, Prometheus, Loki und Grafana. Es verdeutlicht sinnvolle Sichten auf Latenz, Fehlerraten, Tool-Nutzung und Kosten; zugleich ist das Projekt klein und die Konfiguration bietet ausdrücklich optionale Prompt-Protokollierung.

Empfehlung: **OTEL-Semantik und Sicherheitsprinzipien übernehmen, nicht den Stack ungeprüft übernehmen.** In der Standardkonfiguration werden keine vollständigen Prompts, Quellcode-Diffs, personenbezogenen Identifikatoren oder Secrets exportiert. Zentral erfasst werden aggregierte Metriken je Repository, Modellklasse, Arbeitsschritt und Ergebnisstatus; Sitzungs-IDs werden gehasht/rotiert. Für lokale Einzelentwicklung reicht CCUsage, während OTEL nur bei Team-, Audit- oder Optimierungsbedarf aktiviert wird.


## OthmanAdi/planning-with-files

Quelle: <https://github.com/OthmanAdi/planning-with-files> (abgerufen am 13. August 2026). Das Projekt hält den aktiven Arbeitszustand als `task_plan.md`, `findings.md` und `progress.md` außerhalb des Kontextfensters vor und kann ihn nach Kontextkompaktierung oder Sitzungswechsel wieder laden. Es unterstützt mehrere Agentenoberflächen und adressiert typische Mehrprojekt-/Monorepo-Probleme durch explizite Plan-Wurzeln und Fail-Closed-Verhalten bei unklarer Zuordnung.

Für die Zielarchitektur ist die **Trennung von aktivem Arbeitszustand und Wissensspeicher** wertvoll: Laufende, mehrstufige Aufgaben erhalten eine kleine, lokal versionierbare Planablage mit Ziel, Akzeptanzkriterien, Entscheidungen, Belegen und Status. Der Mechanismus darf jedoch nicht pauschal bei jeder Kleinänderung eingeschaltet werden: regelmäßige Re-Injektion verbraucht Kontext und Hook-Installationen erhöhen Wartungs- und Vertrauensaufwand. Daher gilt ein Schwellwert: dateibasierte Planung für Aufgaben mit mehreren Phasen, Unterbrechungsrisiko, Änderungen über mehrere Module oder delegierte Teilaufgaben; sonst wird der native Planmechanismus des Hosts verwendet.


## Agent Skills als wiederverwendbare Fähigkeitsschicht

Quellen: Agent Skills Specification (<https://agentskills.io/specification>); Anthropic, *Agent Skills* (<https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview>) und *Equipping agents for the real world with Agent Skills* (<https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills>); abgerufen am 13. August 2026.

Skills sind der richtige Container für domänenspezifische Prozeduren, nicht für allgemeine Projektregeln. Ein Skill umfasst mindestens `SKILL.md` mit portierbarem Frontmatter (`name`, präzise auslösende `description`) sowie optionale Skripte, Referenzen und Assets. Die empfohlene Struktur nutzt progressive Offenlegung: nur Metadaten beim Start, eine kompakte Kernanleitung bei Aktivierung und Detailmaterial bzw. deterministische Skripte ausschließlich bei Bedarf.

Für den Ziel-Stack wird ein kleines, im Repository versioniertes Skill-Set vorgeschlagen: `repo-onboarding`, `implementation`, `testing-and-review`, `release`, `incident-triage` und bei Bedarf domänenspezifische Skills. Jede Ergänzung beginnt mit einem reproduzierbaren Fehlermuster und einer kleinen Evaluierung, nicht mit einem Skill-Katalog. Externe Skills werden wie Drittcode behandelt: Commit pinnen, alle enthaltenen Dateien und Abhängigkeiten prüfen, Netzwerkzugriffe explizit begrenzen und eine Freigabe dokumentieren.


## ruvnet/ruflo

Quelle: <https://github.com/ruvnet/ruflo> (abgerufen am 13. August 2026). Ruflo ist ein umfangreicher Meta-Harness für Claude Code, Codex und weitere Hosts. Das Projekt vereint Multi-Agenten-Schwärme, viele spezialisierte Agenten, persistente/vektorbasierte Erinnerungen, RAG- und Graphfunktionen, 27 Hooks, MCP-Integration, mehr als 300 MCP-Tools nach eigener Darstellung sowie Föderation über Maschinen hinweg. Die Dokumentation beschreibt vielfältige Sicherheitsmechanismen, aber auch einen großen, dynamisch wachsenden Plugin-, Hook-, Memory- und Kommunikationsumfang.

Entscheidung: **kein Teil des Basistacks** für kleine bis mittlere Engineering-Teams. Ruflo kann als abgegrenzte Orchestrierungsplattform für dedizierte, isolierte Mehragenten-Programme sinnvoll sein, sofern ein Plattformteam Ownership, Sicherheitsreview, Versions-Pinning, separate Worktrees, Kostenbudgets und Egress-Policies übernimmt. Für die empfohlene Best-of-Architecture ist sein Funktionsüberschuss ein Nachteil: Die zentrale Idee des Zielstacks — eine primäre Komponente je Problemklasse und progressive Offenlegung — würde durch mehrere überlappende Memory-, Graph-, Hook-, MCP- und Swarm-Schichten verwässert. Die wertvolle übertragbare Erkenntnis lautet dennoch: Rollen, isolierte Worktrees, explizite Übergabeartefakte und überprüfbare Qualitätsgates sind geeigneter als mehrere unkontrolliert parallel schreibende Agenten.

## revfactory/harness

Quelle: <https://github.com/revfactory/harness> (abgerufen am 13. August 2026). Harness bezeichnet sich als Meta-Skill beziehungsweise Team-Architecture-Factory: Aus einer Domänenbeschreibung generiert es Agententeams, Skills und Teamprotokolle anhand mehrerer Muster wie Pipeline, Fan-out/Fan-in, Expert Pool oder Supervisor. Das Projekt hat eigene Validierungs- und Vergleichsschritte, ist aber bewusst auf die Planung und Erzeugung von Teamarchitekturen ausgerichtet, nicht auf eine minimale Laufzeitintegration.

Entscheidung: **kein Basiskandidat und keine leichtere Ruflo-Alternative.** Beide liegen oberhalb der für den Zielstack nötigen Ein-Agent-/kleines-Team-Arbeit. Harness ist als Lernquelle und als späterer, abgegrenzter Beschleuniger für wiederkehrende Agententeams denkbar. Sein Mehrwert setzt jedoch voraus, dass die Organisation bereits evaluiert hat, dass koordinierte Mehragenten-Architekturen die deterministische Einzelagentenarbeit übertreffen. Die Basisschicht bleibt: klarer Hauptagent, explizite Arbeitspakete, getrennte Worktrees, eine Reviewinstanz sowie versionierte Übergabeartefakte.

## zilliztech/memsearch

Quelle: <https://github.com/zilliztech/memsearch> (abgerufen am 13. August 2026). MemSearch ist ein agentübergreifender Memory-Layer für unter anderem Claude Code und Codex, der Markdown als menschlich prüfbare Darstellung mit Milvus für semantisches Retrieval verbindet. Das Repository zeigt aktive Pflege, Plugins für unterschiedliche Hosts, Konfigurationsmöglichkeiten, Indexausschlüsse und eine technische Absicherung gegen das direkte Persistieren roher Transkripte bei fehlgeschlagener Zusammenfassung.

Entscheidung: **stärkster Kandidat für einen späteren, kontrollierten Langzeit-Memory-Pilot**; er ist für teamweite, hostübergreifende Wiederverwendung besser geeignet als ein reines transkriptbasiertes Session-Memory. Trotzdem nicht Teil des Minimal-Stacks: Milvus, Embeddings, Zusammenfassungslogik, Hooks und ein zusätzlicher Speicherindex schaffen Datenhaltungs-, Evaluation- und Betriebsaufwand. Voraussetzung sind projektweise Speicherorte, konfigurierbare Ausschlüsse, Verschlüsselung/Backups, Retention und Löschung, Separierung von personenbezogenen Kundendaten sowie ein Recall-Benchmark. Versionierte ADRs, Runbooks und Projektregeln bleiben auch dann die normative Wahrheit.

## Compresr-ai/Context-Gateway

Quelle: <https://github.com/Compresr-ai/Context-Gateway> (abgerufen am 13. August 2026). Context Gateway ist ein proxybasierter Ansatz zwischen Agent und Modell-API. Es bündelt Verlaufs- und Tool-Komprimierung, Kontextwiederherstellung, Tool-Discovery, Session-/Kostenauswertung, ein Dashboard und mehrere Provideradapter. Das Repository weist aktuelle Releases, Docker-Betrieb und einzelne harte Schutzmaßnahmen auf, etwa lokale Beschränkung bestimmter Verwaltungsendpunkte sowie Dateirechte.

Entscheidung: **kein Default, aber potentieller Plattform-Pilot**. Ein API-Proxy kann in einer kontrollierten, zentralen Modell-Gateway-Architektur sinnvoll sein, weil Policies, Messung und Rückholfunktionen an einem Ort durchsetzbar sind. Für ein kleines bis mittleres Team erweitert er jedoch den kritischsten Vertrauensbereich: Er sieht Authentifizierung, Prompt- und Tool-Flüsse, kann Ergebnisse umschreiben und führt einen Netzwerkdienst mit Dashboard und Zustandsdaten ein. Vorrang haben deshalb native Host-Funktionen plus Squeez als lokaler, messbarer Output-Pilot. Context Gateway wird erst bei bewusst eingeführtem zentralem Modellzugang mit mTLS, Secret-Isolation, minimaler Telemetrie, Redaction, Hochverfügbarkeit, Change-Management und einer unabhängigen Semantik-Evaluation geprüft.

## f/agentlytics

Quelle: <https://github.com/f/agentlytics> (abgerufen am 13. August 2026). Agentlytics bietet ein lokales Analytics-Dashboard für mehrere Coding-Agent- und Editor-Formate, analysiert Nutzungsdaten und enthält optionale Relay-/MCP-Funktionen für gemeinsame Kontext- oder Teamansichten. Die breite Adapterabdeckung ist der zentrale Vorteil gegenüber einem Claude-Code-spezifischen Kostenwerkzeug; gleichzeitig beruht die Integration auf der Auswertung verschiedener lokaler Verlaufs- und Ereignisformate, die sich mit Hosts weiterentwickeln können.

Entscheidung: **ergänzende, opt-in lokale Team-Ansicht; kein primärer Telemetrie-Sink.** Für einen einzelnen Host bleibt CCUsage die schmalere Basismessung. Agentlytics ist interessant, falls ein Team mehrere Agenten/Editoren nutzt und eine lokale, vergleichbare Ansicht benötigt. Vor Rollout sind Datenschema, Inhaltszugriff, Relay-/MCP-Freigaben, lokale Verschlüsselung, Retention und Adapterrobustheit gegen Hostupdates zu prüfen. Keine automatische Team-Kontextfreigabe und keine zentrale Telemetrie ohne explizite Datenschutz- und Zugriffskontrolle.

## oomol-lab/open-connector

Quelle: <https://github.com/oomol-lab/open-connector> (abgerufen am 13. August 2026). Open Connector ist ein quelloffenes Authentifizierungs- und Connector-Gateway für Agenten mit SDK-, CLI-, MCP-, HTTP- und OpenAPI-Zugang. Es abstrahiert viele SaaS-Anbieter und Aktionen, verwaltet OAuth-Verbindungen beziehungsweise Aliasse und hält Provider-Credentials hinter einer Laufzeitgrenze. Die jüngsten Änderungen demonstrieren Scope-Prüfungen, lokales beziehungsweise selbst gehostetes Deployment und verstärkte Fail-Closed-Behandlung bei Authentifizierung, DNS und Provider-Egress.

Entscheidung: **Enterprise-/Produktoption, kein Standardbaustein für ein Entwicklungsteam.** Der Ansatz ist wertvoll, wenn ein Agentenprodukt langlebigen, mandantenfähigen Zugang zu vielen SaaS-Diensten benötigt und Secrets vom Agentenprozess fernhalten muss. Für eine interne Coding-Agent-Architektur sind ein kleiner, geprüfter MCP-Katalog, Service-Konten mit minimalen Berechtigungen und klare Bestätigungen günstiger und auditierbarer. Wenn Open Connector eingesetzt wird, gehört es als dedizierte Auth- und Policy-Boundary hinter ein zentrales Gateway, mit erlaubten Providern/Aktionen, tenantgetrennten Verbindungen, Scope-Review, Ereignisprotokoll und robustem Write-Approval.

## zilliztech/claude-context

Quelle: <https://github.com/zilliztech/claude-context> (abgerufen am 13. August 2026). Claude Context stellt Code-Suche als MCP für Coding-Agents bereit und zielt darauf, große Codebasen über semantisches Retrieval statt durch vollständige Prompt-Einbettung zugänglich zu machen. Das Projekt hat eine aktive Entwicklung, Evaluierungsartefakte und mehrere Embedding-Optionen. Gegenüber einem reinen Code-Graphen liegt der Fokus auf semantischer Suche; damit kommen Embedding-Provider, Vektorindex und ein MCP-Prozess hinzu.

Entscheidung: **zweiter Kandidat für den Code-Retrieval-Pilot, aber nicht zusätzlich zu CodeGraph installieren.** CodeGraph bleibt im Architekturvorschlag bevorzugt, wenn präzise Symbol- und Abhängigkeitsbeziehungen entscheidend sind. Claude Context ist die sinnvollere Alternative, falls Freitext-Fragen über Dokumentation, Cross-Language-Beschreibungen und semantisch ähnliche Implementierungen wichtiger sind als Call-Graph-Präzision. Der Pilot vergleicht beide auf einem echten Task-Korpus anhand Trefferqualität, Zeit bis zur richtigen Datei, Indexfrische, Egress und zusätzlicher Betriebsfläche. Der Verlierer wird entfernt; die Standard-Dateisuche bleibt immer verfügbar.

## xingkongliang/skills-manager

Quelle: <https://github.com/xingkongliang/skills-manager> (abgerufen am 13. August 2026). Skills Manager ist eine Desktop-Anwendung zur Inventarisierung, Installation, Synchronisation und Git-gestützten Sicherung von Skills über zahlreiche Agentenoberflächen hinweg. Stärken sind projekt- und agentenspezifische Sichtbarkeit, Quellvorschau, Update-Tracking, Skill-zugewandte Mergebehandlung, Snapshots und Pfadvalidierung bei der Übernahme von Git-Quellen.

Entscheidung: **optionales Enablement-Werkzeug, nicht die autoritative Governance-Schicht.** Für Teams mit mehreren Agenten und Entwicklungsgeräten kann es die operative Verteilung und Transparenz stark verbessern. Das verbindliche Projektset bleibt jedoch als geprüfter, commit-gebundener Bestandteil des Repositorys unter `.agents/skills/` oder der hostkonformen Projektstruktur. Ein zentraler Desktop-Katalog kann individuelle globale Skills, Backups oder Update-Informationen verwalten, darf aber weder eine nicht überprüfte neue Skillversion stillschweigend in Projekte schreiben noch teamweite Freigaben ersetzen. Projekt- und globale Skills müssen in der Governance klar getrennt bleiben.

## Visualisierung der gewichteten Vergleichsmatrix

Die geprüfte Balkengrafik `assets/gewichtete_repo_bewertung.png` bildet die explizit gewichtete Architekturentscheidung für ein kleines bis mittleres Team ab. Höchste Priorität haben die schlanken, versionierten und standardnahen Bausteine: `AGENTS.md` plus Host-Brücke (100), kuratierter MCP-Katalog/Policy (95), Datei-/Textsuche (95), Agent Skills (92) und native Kompaktierung mit Originalartefakten (90). CodeGraph (79), Squeez (73) und MemSearch (72) sind absichtlich als nachgelagerte Piloten markiert, nicht als unbedingter Standard.

Die Grafik ist keine unabhängige Leistungsstudie. Sie visualisiert die in `vergleichsmatrix_repositories.md` dokumentierte, transparente Expertengewichtung; sie darf nicht als Benchmark oder Herstellervergleich interpretiert werden.

## Öffentliche Such- und Fachquellen: Kontext-Engineering für Coding Agents

Quellen: Martin Fowler / Thoughtworks, *Context Engineering for Coding Agents* (<https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html>); Sourcegraph, *Context Engineering: A Practical Guide for AI Agents* (<https://sourcegraph.com/blog/context-engineering>); LangChain, *Context Engineering* (<https://www.langchain.com/blog/context-engineering-for-agents>); abgerufen am 13. August 2026.

Die öffentliche Fachlandschaft beschreibt kein einzelnes dominantes „Context Tool“, sondern eine Architekturaufgabe über Anweisungen, Retrieval, Memory und Tools. Martin Fowler betont den schrittweisen Aufbau von Regeln und Kontextinterfaces; zu viele gleichzeitig verfügbare Tools und Regeldateien erhöhen statt senken die Unsicherheit. Sourcegraph und LangChain ergänzen die Unterscheidung zwischen strukturellem Code-Retrieval, semantischer Suche, Speicher, Verdichtung und isolierter Toolausführung.

Konsequenz für den Vergleichsbericht: Er hebt sich von einem generischen „Top Tools“-Artikel ab, indem er die Kandidaten nicht nach Funktionsfülle oder Popularität, sondern nach Zuständigkeit, Vertrauensbereich, operativer Belastung, Rückholbarkeit und überprüfbaren Pilotkriterien bewertet. Die vergleichende Entscheidung „CodeGraph **oder** Claude Context“ und „Squeez **oder** Claw Compactor“ ist deshalb bewusster als ein Add-on-Katalog. Multi-Agenten-Harnesses bleiben ein eigenständiges, späteres Architekturprogramm und keine Standardantwort auf Kontextprobleme.

