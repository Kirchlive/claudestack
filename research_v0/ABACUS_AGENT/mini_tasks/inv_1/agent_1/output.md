# Agent 1 Output — Smart Context Selection & Code Analysis Repos

## Aufgabe
Recherche von 15 GitHub-Repos für Claude-Code-Tokenminimierung. Alle 15 Repos (COVERAGE BOUND) wurden per scrape_url_content auf ihren GitHub-README-Seiten analysiert.

## Ergebnisdatei
- **Hauptdatei:** `/home/ubuntu/research_worker2.md` (vollständige strukturierte Ausgabe, auf Deutsch)
- **Deliverable:** `/home/ubuntu/mini_tasks/inv_1/agent_1/output.md` (diese Datei)

## Abgedeckte Repos (15/15)
1. yamadashy/repomix — Repo-Packing, Tree-sitter-Kompression, CLI/Library/MCP — **Score 5**
2. mufeedvh/code2prompt — Context-Engineering, Rust-CLI/MCP — **Score 4**
3. simonw/files-to-prompt — Datei-Konkatenation, CLI — **Score 3**
4. bodo-run/yek — Repo-Serialisierung, Token-Budget-Capping, Rust-CLI — **Score 4**
5. coderamp-labs/gitingest — Repo-Ingestion, CLI/Web/Python — **Score 4**
6. mksglu/context-mode — MCP-Sandbox + Session-Continuity, 98% Reduktion — **Score 5**
7. colbymchenry/codegraph — Code-Graph, chirurgische Context-Auswahl, 41-84% weniger Tokens — **Score 5**
8. jia-gao/leanctx — Drop-in-Prompt-Kompression, Library — **Score 4**
9. manojmallick/sigmap — Signatur-Map, 96.8% Token-Reduktion, CLI/MCP — **Score 5**
10. sriinnu/clipforge-PAKT — Token-Kompression strukturierter Daten, Library/CLI/MCP — **Score 4**
11. rixinhahaha/snip — Visual Mode, keine direkte Tokenminimierung — **Score 2**
12. edouard-claude/snip — Shell-Output-Filter, 60-90% Reduktion, Hook — **Score 5**
13. zilliztech/claude-context — Semantische Code-Suche via Vector-DB, MCP — **Score 4**
14. 0xranx/OpenContext — Persistenter Context-Store, CLI/MCP — **Score 3**
15. teamchong/pxpipe — Context-als-Bild-Kompression, Proxy — **Score 4**

## Top-Empfehlungen
1. **edouard-claude/snip** — filtert Shell-Output direkt im Claude-Code-Hook
2. **mksglu/context-mode** — MCP-Sandbox + Session-Continuity
3. **colbymchenry/codegraph** — chirurgische Context-Auswahl via Code-Graph
4. **yamadashy/repomix** — Repo-Packing mit Tree-sitter-Kompression
5. **manojmallick/sigmap** — deterministische Signatur-Map

## Hinweise
- Alle Repos existieren und sind öffentlich (keine privaten/nicht existierenden gefunden).
- Stars nur dort notiert, wo auf der GitHub-Seite sichtbar (repomix hoch, files-to-prompt 2.8k, yek 2.5k, gitingest 15.3k, codegraph 66.1k).
- Keine weiteren Seiten/Pagination nötig — COVERAGE BOUND erreicht.
