# Recherche: Workflow-/Skills-/Planning- sowie Misc-Repos für Claude Code Tokenminimierung

Recherchiert am 13.08.2026. Alle 20 Repos wurden per GitHub-README-Scrape geprüft. Fokus: Wie das Tool Tokenverbrauch in Claude Code reduziert.

---

## 1. OthmanAdi/planning-with-files
- **URL:** https://github.com/OthmanAdi/planning-with-files
- **Kategorie:** Planning / Skill (Agent Skills Standard + Claude Code Plugin)
- **Was es tut:** Persistente, dateibasierte Planung für AI-Coding-Agenten. Hält `task_plan.md`, `findings.md` und `progress.md` auf der Festplatte und injiziert sie per `UserPromptSubmit`-Hook jeden Turn neu. Überlebt `/clear`, Crashes und Context-Compaction. Funktioniert auf 60+ Agenten.
- **Wie es Tokens spart:** Verhindert Context-Rot und Goal-Drift. Statt den gesamten Kontext im Fenster zu halten, wird nur der Plan (Ziel, nächster Schritt, aktuelle Phase, letzte 3 Entscheidungen) injiziert — "Context Window = RAM, Filesystem = Disk". Vermeidet Wiederholungsarbeit nach Context-Reset (Benchmark: 5.0 Turns vs. 13.3 ohne Skill). Reduziert unnötige Wiederholung von Tool-Calls und Re-Reads.
- **Integrationstyp:** Skill + Hooks (UserPromptSubmit) + Slash-Commands + Plugin
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 5 (direkt auf Token-/Context-Effizienz ausgelegt)

## 2. ruvnet/ruflo
- **URL:** https://github.com/ruvnet/ruflo
- **Kategorie:** Meta-Harness / Agent-Orchestrierung
- **Was es tut:** Agent-Meta-Harness für Claude Code und Codex. Fügt 100+ spezialisierte Agents, Swarm-Koordination, selbstlernendes Memory (HNSW-Vektor-DB), federated Kommunikation und Security-Guardrails hinzu. Installierbar als Claude-Code-Plugin oder CLI.
- **Wie es Tokens spart:** Selbstlernendes Memory (AgentDB + HNSW) und RAG-Memory (ruflo-rag-memory) erlauben gezielten Abruf statt Kontext-Stuffing. Task-Routing (89% Genauigkeit) leitet Aufgaben an spezialisierte Agents weiter, sodass nur relevante Tools/Kontext geladen werden. Progressive Disclosure über Skills.
- **Integrationstyp:** CLI + MCP-Server + Hooks + Plugin-Marketplace
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (Memory/RAG spart Kontext, aber schwergewichtig)

## 3. garrytan/gstack
- **URL:** https://github.com/garrytan/gstack
- **Kategorie:** Skills-Sammlung / "Software Factory" (Workflow)
- **Was es tut:** Verwandelt Claude Code in ein virtuelles Engineering-Team: 23 Spezialisten (CEO, Eng Manager, Designer, Reviewer, QA, Security, Release Engineer) und 8 Power-Tools als Slash-Commands. Von YC-CEO Garry Tan. Enthält GBrain (persistentes Knowledge-Base-Memory).
- **Wie es Tokens spart:** Strukturierte Rollen statt Blank-Prompt reduzieren Fehlversuche und Nacharbeit. GBrain (persistentes Memory via Supabase/PGLite) hält Wissen zwischen Sessions, sodass nicht jedes Mal neu gelesen wird. `/autoplan` bündelt Reviews. `/freeze`/`/careful` verhindern destruktive Fehler.
- **Integrationstyp:** Skills + Slash-Commands (Claude Code), OpenClaw-kompatibel
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (Memory + strukturierte Prozesse sparen Nacharbeit)

## 4. ran-isenberg/propel
- **URL:** https://github.com/ran-isenberg/propel
- **Kategorie:** Misc (macOS Kanban-App, KEIN Claude-Code-Tool)
- **Was es tut:** Native macOS Kanban-Board-App (SwiftUI) für persönliches Task-Management, fokussiert auf Content-Creation-Workflows (Blog, Talks, Videos). Lokale JSON-Speicherung, keine AI-Integration.
- **Wie es Tokens spart:** Keine direkte Token-Ersparnis. Indirekt könnte externe Task-Organisation helfen, Kontext im Agenten zu reduzieren, aber es ist keine Claude-Code-Integration.
- **Integrationstyp:** Standalone macOS-App (kein CLI/MCP/Hook)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 1 (kein Claude-Code-Token-Bezug)

## 5. chachamaru127/claude-code-harness
- **URL:** https://github.com/chachamaru127/claude-code-harness
- **Kategorie:** Harness / Workflow (Plan-Work-Review-Ship)
- **Was es tut:** Disziplinierter Delivery-Loop für Claude Code, Codex CLI, Cursor, Grok: spec → implement → verify → review → release. 5 Verb-Skills (`/harness-plan`, `/harness-work`, `/harness-review`, `/harness-sync`, `/harness-release`). Go-basierte Guardrail-Engine adjudiziert jeden Tool-Call vor der Ausführung.
- **Wie es Tokens spart:** Verhindert Drift und Wiederholungsarbeit durch strukturierte Phasen. `spec.md` + `Plans.md` auf Disk statt im Chat. `harness-mem` (projektbezogenes Memory) reduziert Re-Reads über Sessions. Review getrennt von Implementierung verhindert fehlerhafte Merges.
- **Integrationstyp:** Plugin + Slash-Commands + Go-Guardrail-Engine
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (strukturierte Prozesse + Memory sparen Nacharbeit)

## 6. revfactory/harness
- **URL:** https://github.com/revfactory/harness
- **Kategorie:** Meta-Factory / Team-Architecture-Factory (L3)
- **Was es tut:** Generiert aus einer Domänenbeschreibung ein Agent-Team + Skills für Claude Code. 6 Architektur-Patterns (Pipeline, Fan-out/Fan-in, Expert Pool, Producer-Reviewer, Supervisor, Hierarchical Delegation). Erzeugt `.claude/agents/` und `.claude/skills/`.
- **Wie es Tokens spart:** Skill-Generierung mit "Progressive Disclosure" für effizientes Context-Management. Spezialisierte Agents laden nur relevanten Kontext. A/B-Test: +60% Qualität, -32% Varianz (weniger Fehlversuche = weniger Tokens).
- **Integrationstyp:** Plugin + Skill-Generator
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 3 (indirekt über Progressive Disclosure und Qualitätsverbesserung)

## 7. UditAkhourii/adhd
- **URL:** https://github.com/UditAkhourii/adhd
- **Kategorie:** Skill / Reasoning (Tree-of-Thought mit Pruning)
- **Was es tut:** Skill für Coding-Agents. Spawnt N isolierte Reasoning-Prozesse unter verzerrten kognitiven Frames (kein geteilter Kontext während Divergenz), dann ein separater Critic-Pass, der Ideen scored, clustert, Traps pruned und Survivors vertieft. 3.5k Stars.
- **Wie es Tokens spart:** Pruning eliminiert schlechte Ideen früh, bevor sie in Implementierung investiert werden. Verhindert "premature convergence" und damit teure Fehlversuche. Für Design-Entscheidungen, Debugging, Naming, Strategie.
- **Integrationstyp:** Skill (npx skills add), Library (adhd-agent npm)
- **Stars:** 3.5k
- **Relevanzscore:** 3 (spart Tokens durch bessere Entscheidungen, aber selbst tokenintensiv durch parallele Frames)

## 8. ayghri/i-have-adhd
- **URL:** https://github.com/ayghri/i-have-adhd
- **Kategorie:** Skill / Output-Formatierung
- **Was es tut:** Skill, der die Antworten des Coding-Assistenten umformt: Action first, nummerierte Schritte, keine Preamble, keine "Hope this helps!"-Floskeln. 10 Regeln (z.B. "Cap lists at 5 items", "No preamble. No recap. No closers.").
- **Wie es Tokens spart:** Direkt: eliminiert unnötige Floskeln, Preamble, Recap und Closers aus Output. Kürzere, präzisere Antworten = weniger Output-Tokens. Konkrete nächste Schritte reduzieren Rückfragen.
- **Integrationstyp:** Skill / Plugin (Claude Code)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (direkte Output-Token-Reduktion)

## 9. Kuberwastaken/claurst
- **URL:** https://github.com/Kuberwastaken/claurst
- **Kategorie:** Misc (eigener Coding-Agent, Rust)
- **Was es tut:** Open-Source, Multi-Provider Terminal-Coding-Agent in Rust — Clean-Room-Reimplementation von Claude Code. TUI, Plugin-System, Chat-Forking, Memory-Consolidation, `/goal`, `ultracode` (plan→delegate→integrate→verify mit Subagents/Swarms). 10.2k Stars.
- **Wie es Tokens spart:** Memory-Consolidation reduziert Kontext über Sessions. `ultracode`-Workflow nutzt Subagents/Swarms für fokussierte Kontexte. Als Alternative zu Claude Code kann es günstigere Provider routen (Multi-Provider).
- **Integrationstyp:** Standalone CLI (ACP-kompatibel), kein Claude-Code-Plugin
- **Stars:** 10.2k
- **Relevanzscore:** 2 (eigener Agent, kein Claude-Code-Add-on; Memory-Consolidation relevant)

## 10. multica-ai/andrej-karpathy-skills
- **URL:** https://github.com/multica-ai/andrej-karpathy-skills
- **Kategorie:** Skills / Guidelines (CLAUDE.md)
- **Was es tut:** Einzelne `CLAUDE.md`-Datei mit Karpathy-inspirierten Prinzipien: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. Adressiert LLM-Pitfalls wie Overengineering und unnötige Edits.
- **Wie es Tokens spart:** "Simplicity First" verhindert überkomplexen Code (weniger Tokens für Implementierung). "Surgical Changes" verhindert unnötige Edits (weniger Diff-Tokens). "Goal-Driven Execution" mit Tests-first reduziert Fehlversuche und Rückfragen.
- **Integrationstyp:** CLAUDE.md / Plugin / Cursor-Regel
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (verhindert Token-Verschwendung durch Overengineering)

## 11. happycapy-ai/Happycapy-skills
- **URL:** https://github.com/happycapy-ai/Happycapy-skills
- **Kategorie:** Skills-Sammlung (kuratiert)
- **Was es tut:** Kuratierte Sammlung von 55 Drop-in-Claude-Code-Skills über 7 Kollektionen (Agent Systems, App/Web Dev, Design/Docs, Media, Social, Happycapy-Integrationen, PPTX-Styles). Jeder Skill ist ein selbstständiger Ordner mit SKILL.md.
- **Wie es Tokens spart:** Progressive Disclosure — Skills laden nur bei Bedarf detaillierte Anweisungen. `find-skills` und `skill-creator` helfen, passende Skills zu finden statt Kontext zu verschwenden. `claude-code-templates` bündelt Konfiguration.
- **Integrationstyp:** Skills (drop-in in `~/.claude/skills`)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 3 (Progressive Disclosure, aber generische Sammlung)

## 12. coleam00/second-brain-skills
- **URL:** https://github.com/coleam00/second-brain-skills
- **Kategorie:** Skills-Sammlung (Second Brain / Knowledge Work)
- **Was es tut:** Skills, die Claude Code in ein Second Brain verwandeln: MCP-Client, PPTX-Generator, SOP-Creator, Skill-Creator, Remotion-Video-Creator, Brand & Voice Generator. Fokus auf Progressive Disclosure.
- **Wie es Tokens spart:** MCP-Client lädt Tool-Schemas on-demand statt den Kontext mit tausenden Tokens an Tool-Definitionen zu blähen. Progressive Disclosure: Claude lädt detaillierte Anweisungen nur bei Bedarf. Brand-System einmal definieren, überall wiederverwenden.
- **Integrationstyp:** Skills (`.claude/skills/`)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (MCP-Client mit on-demand Tool-Schemas spart direkt Kontext)

## 13. Nimbalyst/nimbalyst
- **URL:** https://github.com/Nimbalyst/nimbalyst
- **Kategorie:** Misc (visueller Workspace / Session-Manager)
- **Was es tut:** Open-Source, lokaler, interaktiver visueller Editor & Session-/Task-Manager für Codex und Claude Code. WYSIWYG-Editoren (Markdown, Mermaid, Excalidraw, CSV, Code), parallele Session-Verwaltung in Kanban, Task-Tracking, Git-Management, Mobile-App.
- **Wie es Tokens spart:** Session-Management und Resume reduzieren Kontext-Neuaufbau. Visuelle Diff-Approval (red/green) verhindert unnötige Iterationen. Task-Tracking hält Agenten fokussiert (weniger Drift). Parallele Sessions isolieren Kontexte.
- **Integrationstyp:** Standalone Desktop-App (Electron) + Mobile, steuert Claude Code/Codex
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 3 (Session-Resume und Fokus sparen Kontext, aber externes Tool)

## 14. alexanderop/walkthrough
- **URL:** https://github.com/alexanderop/walkthrough
- **Kategorie:** Skill / Dokumentation (Codebase-Erklärung)
- **Was es tut:** Skill, der interaktive HTML-Walkthroughs mit klickbaren Mermaid-Diagrammen generiert, um Codebase-Features, Flows, Architektur und DB-Schemas zu erklären. Nutzt parallele Subagents zur Exploration.
- **Wie es Tokens spart:** Erzeugt persistente, wiederverwendbare Erklärungen (HTML-Datei) statt dass der Agent jedes Mal den Code neu lesen muss. Onboarding in <2 Minuten reduziert wiederholte Code-Exploration.
- **Integrationstyp:** Skill (npx skills add)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 2 (indirekt: reduziert wiederholte Code-Exploration)

## 15. github/spec-kit
- **URL:** https://github.com/github/spec-kit
- **Kategorie:** Workflow / Spec-Driven Development
- **Was es tut:** Open-Source-Toolkit für Spec-Driven Development mit jedem AI-Coding-Agenten. `specify` CLI + Slash-Commands (`/speckit.constitution`, `.specify`, `.plan`, `.tasks`, `.implement`, `.converge`). Funktioniert mit 30+ Agenten.
- **Wie es Tokens spart:** Spec-Driven Development reduziert Fehlversuche durch klare Anforderungen vor der Implementierung. `/speckit.converge` bewertet Codebase und hängt nur verbleibende Arbeit an (kein Re-Read). Strukturierte Tasks verhindern Drift und Nacharbeit.
- **Integrationstyp:** CLI (specify) + Slash-Commands + Skills
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 4 (reduziert Fehlversuche und Nacharbeit durch Specs)

## 16. earendil-works/pi
- **URL:** https://github.com/earendil-works/pi
- **Kategorie:** Misc (eigener Agent-Harness / Coding-Agent)
- **Was es tut:** AI-Agent-Toolkit: Unified LLM-API, Agent-Loop, TUI, Coding-Agent-CLI. Selbst-erweiterbarer Coding-Agent. 88.6k Stars, 11k Forks. Pakete: pi-coding-agent, pi-agent-core, pi-ai, pi-tui.
- **Wie es Tokens spart:** Als eigenständiger Agent kein Claude-Code-Add-on. Unified Multi-Provider-API erlaubt Routing zu günstigeren Modellen. Agent-Loop mit State-Management. Kein direkter Claude-Code-Token-Bezug.
- **Integrationstyp:** Standalone CLI / Library (npm)
- **Stars:** 88.6k
- **Relevanzscore:** 1 (eigener Agent, kein Claude-Code-Token-Add-on)

## 17. AndyMik90/Aperant
- **URL:** https://github.com/AndyMik90/Aperant
- **Kategorie:** Misc (autonomer Multi-Agent-Framework, Desktop-App)
- **Was es tut:** Autonomes Multi-Agent-Coding-Framework (früher Auto Claude), das Software plant, baut und validiert. Electron-Desktop-App, Kanban-Board, bis zu 12 parallele Agent-Terminals, isolierte Git-Worktrees, Self-Validating QA, Memory-Layer. Aperant 3.0 in Entwicklung.
- **Wie es Tokens spart:** Memory-Layer hält Insights über Sessions. Isolierte Worktrees + Self-Validating QA reduzieren Fehlversuche. Parallele Agenten isolieren Kontexte. Aber: eigenständige App, kein Claude-Code-Plugin.
- **Integrationstyp:** Standalone Desktop-App (Electron), nutzt Claude Code CLI
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 2 (Memory-Layer relevant, aber eigenständige App)

## 18. Piebald-AI/claude-code-system-prompts
- **URL:** https://github.com/Piebald-AI/claude-code-system-prompts
- **Kategorie:** Misc / Referenz (System-Prompts + Token-Counts)
- **Was es tut:** Aktuelle Liste aller Claude-Code-System-Prompts mit Token-Counts (Stand v2.1.229, 12.08.2026). 515 Prompts, CHANGELOG über 255 Versionen. Extrahiert direkt aus dem kompilierten Claude-Code-Source.
- **Wie es Tokens spart:** Kein direktes Tool, aber Referenz: zeigt Token-Counts jedes System-Prompts, sodass man versteht, wo Tokens verbraucht werden. Verweist auf `tweakcc` zum Anpassen einzelner Prompt-Teile (z.B. unnötige Teile entfernen). Ermöglicht gezielte Token-Optimierung.
- **Integrationstyp:** Referenz/Repository (kein Tool)
- **Stars:** nicht sichtbar im Scrape
- **Relevanzscore:** 3 (Referenz für Token-Optimierung, kein direktes Tool)

## 19. opentabs-dev/opentabs
- **URL:** https://github.com/opentabs-dev/opentabs
- **Kategorie:** Misc / MCP (Browser-API-Bridge)
- **Was es tut:** AI ruft echte Web-APIs über die Browser-Session auf — keine Screenshots, kein DOM-Scraping. Chrome-Extension + lokaler Server + MCP. 100+ Plugins, ~2000 Tools (Slack, Discord, GitHub, Jira, Notion, Figma, AWS, Stripe). 894 Stars.
- **Wie es Tokens spart:** Statt DOM-Scraping/Screenshots (tokenintensiv) werden echte APIs direkt aufgerufen — deutlich weniger Kontext. `include_body=false` Default auf List-Tools "to cut token bloat". On-demand Tool-Loading statt alle Schemas im Kontext.
- **Integrationstyp:** MCP-Server + CLI + Chrome-Extension
- **Stars:** 894
- **Relevanzscore:** 4 (API statt DOM-Scraping spart massiv Kontext)

## 20. coleam00/Archon
- **URL:** https://github.com/coleam00/Archon
- **Kategorie:** Workflow-Engine / Harness-Builder
- **Was es tut:** Erster Open-Source-Harness-Builder für AI-Coding. Definiert Entwicklungsprozesse als YAML-Workflows (planning, implementation, validation, review, PR). Deterministisch und wiederholbar. 23.2k Stars, 3.5k Forks. Web-UI, CLI, Slack/Telegram/Discord/GitHub-Integrationen.
- **Wie es Tokens spart:** `fresh_context: true` in Loops startet frische Sessions pro Iteration (verhindert Kontext-Aufblähung). Deterministische Nodes (bash, tests) laufen ohne AI = keine Tokens. Isolierte Worktrees verhindern Konflikt-Nacharbeit. AI läuft nur wo sie Wert schafft.
- **Integrationstyp:** CLI + Web-UI + Skill + Plattform-Adapter
- **Stars:** 23.2k
- **Relevanzscore:** 5 (fresh_context + deterministische Nodes sparen direkt Tokens)

---

## Zusammenfassung / Ranking nach Relevanzscore

| Score | Repos |
|---|---|
| 5 | OthmanAdi/planning-with-files, coleam00/Archon |
| 4 | ruvnet/ruflo, garrytan/gstack, chachamaru127/claude-code-harness, ayghri/i-have-adhd, multica-ai/andrej-karpathy-skills, coleam00/second-brain-skills, github/spec-kit, opentabs-dev/opentabs |
| 3 | revfactory/harness, UditAkhourii/adhd, happycapy-ai/Happycapy-skills, Nimbalyst/nimbalyst, Piebald-AI/claude-code-system-prompts |
| 2 | Kuberwastaken/claurst, alexanderop/walkthrough, AndyMik90/Aperant |
| 1 | ran-isenberg/propel, earendil-works/pi |

## Wichtigste Token-Spar-Mechanismen (übergreifend)
1. **Progressive Disclosure** (ruflo, second-brain-skills, Happycapy, revfactory/harness): Details nur bei Bedarf laden.
2. **Persistentes Memory / Disk-basierte Planung** (planning-with-files, gstack/GBrain, ruflo, harness-mem): Kontext überleben lassen statt neu aufbauen.
3. **Fresh Context in Loops** (Archon): frische Sessions pro Iteration verhindern Kontext-Aufblähung.
4. **Deterministische Nodes ohne AI** (Archon): bash/tests laufen ohne Token-Verbrauch.
5. **API statt DOM-Scraping** (opentabs): echte APIs sparen massiv Kontext.
6. **Output-Kürzung** (i-have-adhd): Floskeln/Preamble eliminieren.
7. **Spec-Driven Development** (spec-kit): Fehlversuche und Nacharbeit reduzieren.
8. **Simplicity/Surgical Changes** (karpathy-skills): Overengineering und unnötige Edits verhindern.
