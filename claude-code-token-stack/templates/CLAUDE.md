---
id: CTS-TPL-CLAUDE-001
schema: claudestack.template/v2
template_type: claude_instructions
version: 2
status: release_candidate
language: de
byte_budget: 4096
---

# Token-Stack-Regel

- Native Suche und exakte Read-Slices zuerst; keine Repo-/Log-Dumps.
- Pro Aufgabe höchstens einen zusätzlichen Retrieval-Owner nutzen.
- Bash-Ausgabe nicht manuell durch eine zweite Hook-/Reducer-Kette leiten.
- Bei `[claude-token-stack raw:<id> ...]` die vollständige redigierte Response mit
  `node bin/claudestack.mjs recover <id>` holen, wenn exakte Details nötig sind.
- Vor `/clear`, Crash-Risiko oder Handoff `TASK-STATE.md` aktualisieren:
  bestätigte Fakten, Entscheidungen, Verifikation, ein nächster Schritt; keine
  Secrets oder Rohlogs.
- Einsparung nur aus lokalem A/B je akzeptierter Aufgabe behaupten; Bytes,
  Tokens, Cache und Kosten getrennt nennen.

## Implementation Ladder

Vor jedem neuen Code und jeder neuen Dependency der Reihe nach fragen: muss das
existieren? · gibt es das im Repo? · in der stdlib? · nativ? · als Dependency? ·
deklarativ? → kleinste korrekte Fassung. Sie setzt nie aus bei Security,
Datenintegrität, Accessibility, Rückwärtskompatibilität, Migrationen und
Abnahmekriterien.

Nicht zu verwechseln mit `docs/LADDER.md`: die begrenzt Session-Wachstum, diese
hier begrenzt Ausgabe-Umfang.

## Nach Compact oder Clear

1. Zuerst `.claude/TASK-STATE.md` lesen — dort stehen Ziel, bestätigte Fakten,
   Entscheidungen, offene Arbeit und der nächste ausführbare Schritt.
2. Keine erneute Orientierungs-Exploration für Fakten, die dort als bestätigt
   markiert sind. Nur „needs recheck"-Fakten neu prüfen.
3. Mechanische Checkpoints sind Recovery-Evidenz, keine Wahrheit — bei Konflikt
   gilt der TASK-STATE.
4. Den nächsten Schritt ausführen, statt die Session neu zu verhandeln.

## Harte Regeln

- Keine Secrets oder `.env`-Dateien lesen oder ausgeben.
- Keine destruktiven Kommandos ohne expliziten Auftrag (`rm -rf`,
  `git reset --hard`, Force-Push auf geteilte Branches).
- Keine parallelen Token-Werkzeuge: ein zweiter Bash-Kompressor, zweiter
  Codeindex, zweiter History-Proxy oder ein globaler Memory-MCP verstoßen gegen
  Gesetz I — auch „nur kurz zum Testen" nicht in derselben Session.

<!-- Byte-Deckel 4 KB, geprüft in scripts/verify-package.mjs. Verhaltensregeln
     (ponytail, caveman), Retrieval- und Kontext-Werkzeuge gehören NICHT hierher,
     sondern in Plugins oder path-scoped Rules — dieser Text wird bei jedem
     dateiberührenden Tool-Call neu injiziert. -->
