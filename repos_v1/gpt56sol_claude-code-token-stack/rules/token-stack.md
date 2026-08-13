---
id: CTS-RULE-TOKEN-001
schema: claudestack.rule/v1
rule_type: token_stack_operation
version: 1
status: production_guidance
language: de
paths:
  - "**/*"
---

# Token-Stack-Betriebsregel

1. Native Suche, enge Commands und Read-Slices vor zusätzlichem Tooling.
2. Pro Aufgabe genau eine Retrieval-Strategie aktiv wählen: native oder ein
   zusätzlicher Index. Nicht parallel explorieren.
3. Keine mutierenden Hooks, Reducer, Memory-Systeme oder API-Proxies stapeln.
   Aktiver Owner je Surface ist exklusiv.
4. Default hat keinen Bash-Input-Mutator. Lokaler Dispatcher ist alleiniger
   Bash-Output- und Read-Owner.
5. Fehler, stderr, Diffs, Security-, Migration-, IaC- und Krypto-Ausgabe exakt
   behandeln. Verlustbehaftete Elision nur mit recoverbarem privatem Artefakt.
6. Raw-Pointer bei Diagnosebedarf über `claudestack recover <id>` auflösen; Raw
   nicht in Prompt, Commit oder Ticket kopieren, wenn ein enger Slice reicht.
7. Rollout nur Shadow → begrenzter Enforce-Canary → Enforce. Bei Verlust,
   Qualitäts-/Securityregression oder Owner-Konflikt sofort Shadow/Off.
8. ccusage und native Usage sind Observer. Keine Sparwirkung zuschreiben.
9. TASK-STATE nur für lange Tasks, `/clear`, Crash oder Handoff; kurz, bestätigt,
   secretfrei, genau ein nächster Schritt.
10. Keine feste Ersparnis behaupten. Lokale Bytes, sichtbare Tokens, Cache,
    Kosten, Zeit und Qualität getrennt messen.
