---
id: CTS-RULE-TOKEN-001
schema: claudestack.rule/v2
rule_type: token_stack_operation
version: 2
status: production_guidance
language: de
paths:
  - "**/*"
---

# Token-Stack-Betriebsregel

## Gesetze

1. Genau ein mutierender Owner je Kontextfläche. Observer laufen daneben; wer
   `additionalContext` injiziert, fällt unter das Nudge-Budget.
2. Nativ zuerst: native Suche, enge Commands, Read-Slices und native Deckel vor
   jedem zusätzlichen Werkzeug.
3. Messung vor Installation. Keine feste Ersparnis behaupten.

## Reihenfolge

Native Deckel → Prefix kürzen → Sitzungsgrenze → erst dann Werkzeuge.

## Prefix

- Root-`CLAUDE.md` **≤ 4 KB hart**. Wird bei dateiberührenden Tool-Calls neu
  injiziert; jede Änderung invalidiert alles danach.
- `.claude/rules` nur mit hartem Path-Scoping, 3–5 Dateien à unter 30 Zeilen.
- MCP-Server projektweise, nie global. Plugin-Toggles nur zwischen Sessions.
- `ENABLE_TOOL_SEARCH` nicht pauschal setzen: ungesetzt = `auto`. Nie `false`.

## Retrieval

Pro Aufgabe genau eine Strategie: nativ **oder** ein Index. Nie zwei Indizes
parallel. Index abfragen und danach trotzdem alles lesen vernichtet den Gewinn.

## Lesen

Ganze Datei nur bis N Zeilen, darüber `offset`/`limit`. Zweitlesung derselben
unveränderten Datei (mtime + Hash) → auf den Stash verweisen; eine Einmal-
Wiederholung als Escape-Valve.

## Ausgabe

- Exakt bleiben bei Fehlern, nicht-leerem stderr, Diffs, Migrationen, Security-,
  IaC- und Krypto-Ausgabe sowie null-delimited Daten.
- Verlustbehaftete Elision nur mit recoverbarem Artefakt. Raw-Pointer über
  `claudestack recover <id>` auflösen, nicht in Prompt, Commit oder Ticket kopieren.
- Nichts emittieren, wenn die Ersparnis nach Footer-Overhead unter Byte- **und**
  Ratio-Schwelle liegt.
- `updatedToolOutput` bei Built-in-Bash ist ein Objekt, kein String.
- Niemals `permissionDecision: "allow"`. Fail-open bei Fehlern, fail-loud bei
  fehlendem Prüfgegenstand.

## Sitzung

- Reihenfolge: TASK-STATE schreiben → `/clear` → Subagent für Bulk.
- Subagenten isolieren das Fenster und vervielfachen das Volumen (~Faktor 7).
  Nur mit hart begrenztem Auftrag; pauschales Fan-out ist ein Kostenvervielfacher.
- `/rewind` verkürzt den Verlauf ohne den Cache-Key zu ändern — erster Griff bei
  Fehlversuchen.
- TASK-STATE nur für lange Tasks, `/clear`, Crash oder Handoff: kurz, bestätigt,
  secretfrei, genau ein nächster Schritt.

## Hinweis-Budget

Alle Nudge-gebenden Hooks teilen sich **ein** Budget über `tryConsumeNudge()`.
Jede Injektion kostet Tail-Tokens pro Runde, ist also nicht kostenlos.

## Rollout

`off` → `shadow` → Canary → `enforce`, nur nach Net-Win-Gate. Bei Verlust,
Qualitäts- oder Security-Regression sofort zurück auf `shadow`/`off`.

## Messen

Lokale Bytes, sichtbare Tokens, Cache, Kosten, Zeit und Qualität getrennt messen.
`ccusage` und native Usage sind Observer — ihnen keine Sparwirkung zuschreiben.

> Begründungen: `docs/ARCHITECTURE.md` · Flächen: `config/context-surface-owners.json`
