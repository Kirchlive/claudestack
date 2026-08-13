---
id: CTS-TPL-CLAUDE-001
schema: claudestack.template/v1
template_type: claude_instructions
version: 1
status: release_candidate
language: de
---

# Token-Stack-Regel

- Native Suche und exakte Read-Slices zuerst; keine Repo-/Log-Dumps.
- Pro Aufgabe höchstens einen zusätzlichen Retrieval-Owner nutzen.
- Bash-Ausgabe nicht manuell durch zweite Hook-/Reducer-Kette leiten.
- Bei `[claude-token-stack raw:<id> ...]` vollständige redigierte Response mit
  `node bin/claudestack.mjs recover <id>` holen, wenn exakte Details nötig sind.
- Vor `/clear`, Crash-Risiko oder Handoff optional `TASK-STATE.md` aktualisieren:
  bestätigte Fakten, Entscheidungen, Verifikation, ein nächster Schritt; keine
  Secrets oder Rohlogs.
- Einsparung nur aus lokalem A/B je akzeptierter Aufgabe behaupten; Bytes,
  Tokens, Cache und Kosten getrennt nennen.
