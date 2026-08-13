# Plan: Claude-Code-Token-Minimierung — erweiterte Repo-Recherche & Stack-Konzept

## Auftrag (aus Upload-Datei, Deutsch)
1. Erweiterte Recherche: möglichst ALLE Repos finden, die auf irgendeine Weise Token bei Claude Code minimieren.
2. Überblick über alle vorhandenen Repos (bekannte Liste + Lesezeichenordner als Orientierung).
3. Die wichtigsten/interessantesten Repos gezielt per README vertiefen.
4. Darauf aufbauend eine umfassende Stack-Empfehlung als Konzept: welches Repo wo genutzt werden sollte,
   welche Anpassungen/Regelungen (z. B. in Form von bash-dump-guard.mjs oder „Ladder"-Stufenregelung)
   vorgenommen werden sollten. Der gewachsene Ist-Stack ist nicht maßgebend — Ziel ist der
   bestmögliche kombinierte Tool-Stack.
5. Referenzierter Skill: content-research-writer (Research + Zitate + strukturiertes Schreiben).

## Stage 1 — Deep Research (Skill: deep-research-swarm, Route A: Wide Search)
Parallele Research-Subagents:
- 1A Verifikation: alle ~30 Repos der bekannten Liste deduplizieren, Existenz/Fokus/Aktivität/Reife prüfen.
- 1B Lesezeichen-Screening: ~110 Links kategorisieren, Token-Relevanz bewerten, Kurzprofil je relevantem Repo.
- 1C Wide Search Claude-Code-Ökosystem: GitHub-Topics, awesome-Listen, Hooks, Context-/Compact-Tools, Skills.
- 1D Wide Search allgemeine LLM-Context-Minimierung: Prompt-Kompression (LLMLingua & Co.), Routing,
  semantisches Caching, TOON/Format-Optimierung, Repo-Packaging, Code-Intelligence (reduziert Lesetoken).
Output: konsolidierte, deduplizierte Repo-Matrix mit Kategorien + Reifegrad + Token-Hebel.

## Stage 2 — Deep Dive (README-Analyse, Stage-Gate nach Stage 1)
- Top ~20–25 Repos, gruppiert nach Kategorie, je ein Analyse-Subagent pro Kategorie.
- Je Repo: Funktionsweise, Installation, Konfiguration, Claude-Code-Integration (Hook/MCP/CLI/Skill),
  Einsparmechanismus, Reife (Stars, Commits, Releases), Risiken/Konflikte, Kombinierbarkeit.
Output: Detailprofile als research-notes.md

## Stage 3 — Konzept & Report (Skills: report-writing + content-research-writer)
- Schichten-Architektur des empfohlenen Stacks (Messung → Prompt-Hygiene → Output-Filter/Hooks →
  Kompression → Format → Routing → Memory/Session → Code-Intelligence → Monitoring).
- Konkrete Stack-Empfehlung: welches Repo welche Rolle übernimmt, Begründung, Alternativen.
- Regelwerk: Hook-Design inkl. bash-dump-guard.mjs-Referenzkonzept + „Ladder"-Stufenregelung
  (gestufte Eskalation der Kontext-Reduktion), CLAUDE.md-/Settings-Empfehlungen.
- Sprache: Deutsch. Output: finaler Report .md

## Stage 4 — Formatierung (Skill: docx)
- Umwandlung des finalen Markdown nach .docx, Auslieferung von .md + .docx.
