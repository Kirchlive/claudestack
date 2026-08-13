# Agent 4 — Output: Workflow-/Skills-/Planning- sowie Misc-Repos

## Aufgabe
Recherche von 20 GitHub-Repos für Claude-Code-Tokenminimierung. Für jedes Repo: Was es tut, wie es Tokens spart, Integrationstyp, Relevanzscore 1-5. Speicherziel: `/home/ubuntu/research_worker5.md`.

## Ergebnis
Alle 20 Repos wurden per GitHub-README-Scrape (scrape_url_content) geprüft. Vollständige strukturierte Ausgabe in **`/home/ubuntu/research_worker5.md`** geschrieben.

## Kurzübersicht (Scores)
- **Score 5:** OthmanAdi/planning-with-files, coleam00/Archon
- **Score 4:** ruvnet/ruflo, garrytan/gstack, chachamaru127/claude-code-harness, ayghri/i-have-adhd, multica-ai/andrej-karpathy-skills, coleam00/second-brain-skills, github/spec-kit, opentabs-dev/opentabs
- **Score 3:** revfactory/harness, UditAkhourii/adhd, happycapy-ai/Happycapy-skills, Nimbalyst/nimbalyst, Piebald-AI/claude-code-system-prompts
- **Score 2:** Kuberwastaken/claurst, alexanderop/walkthrough, AndyMik90/Aperant
- **Score 1:** ran-isenberg/propel, earendil-works/pi

## Wichtigste Token-Spar-Mechanismen
1. Progressive Disclosure (Details nur bei Bedarf laden)
2. Persistentes Memory / Disk-basierte Planung (Kontext überleben lassen)
3. Fresh Context in Loops (Archon)
4. Deterministische Nodes ohne AI (Archon)
5. API statt DOM-Scraping (opentabs)
6. Output-Kürzung (i-have-adhd)
7. Spec-Driven Development (spec-kit)
8. Simplicity/Surgical Changes (karpathy-skills)

## Hinweise
- Alle 20 Repos existieren und sind öffentlich (kein privates/nicht existierendes Repo).
- ran-isenberg/propel und earendil-works/pi sind keine Claude-Code-Add-ons (Score 1) — Propel ist eine macOS-Kanban-App, Pi ein eigenständiger Agent-Harness.
- Sichtbare Stars: UditAkhourii/adhd (3.5k), Kuberwastaken/claurst (10.2k), earendil-works/pi (88.6k), opentabs-dev/opentabs (894), coleam00/Archon (23.2k).

## Dateien
- **`/home/ubuntu/research_worker5.md`** — primäre strukturierte Ausgabe (20 Repos, vollständig)
- **`/home/ubuntu/mini_tasks/inv_1/agent_4/output.md`** — dieser Deliverable
