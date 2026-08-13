#!/usr/bin/env node
// PostToolUse: mark that a context-mode sandbox tool was used in this session.
// Session-keyed via session_id from hook stdin — PPID is not stable across hook
// spawns in Claude Code.
//
// STATUS (Abnahmebefund M-8): Dieser Hook hat nur dann einen Zweck, wenn die Flaeche
// "externe Massendaten" besetzt ist. Sie ist es nicht: der einzige Bewerber
// (mksglu/context-mode) steht unter Elastic License 2.0 und ist nach L-8 fuer
// dienstliche Nutzung gesperrt; config/context-surface-owners.json fuehrt die Flaeche
// als GESPERRT. Der Hook bleibt deshalb unregistriert (ADR-016) und liegt hier als
// fertige Vorlage fuer den Fall, dass die Flaeche je besetzt wird.
//
// Das Gegenstueck war urspruenglich bash-dump-guard.mjs — der ist als zweiter
// Bash-Output-Owner nicht uebernommen (Gesetz I, ADR-015). Der heutige Konsument
// waere bash-size-feedback.mjs, dessen Sandbox-Empfehlung ueber
// CLAUDESTACK_SANDBOX_TOOL konfiguriert wird.

import { closeSync, mkdirSync, openSync } from "node:fs";
import { markerFile } from "./lib/nudge-budget.mjs";
import path from "node:path";

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", () => process.exit(0));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    const tool = input?.tool_name ?? "";
    if (/^mcp__(plugin_)?context-mode/.test(tool)) {
      // Nicht os.tmpdir(): auf macOS ist das ein prozessprivater Pfad, zwei Hook-Spawns
      // saehen den Marker des jeweils anderen nicht. Nicht mehr /tmp: alle Token-Stack-
      // Dateien liegen gebuendelt unter <configDir>/token-stack/ und wandern mit
      // CLAUDE_CONFIG_DIR mit. Das Verzeichnis ist prozessuebergreifend stabil und
      // erfuellt denselben Zweck wie /tmp.
      const sid = input?.session_id || `ppid-${process.ppid}`;
      const file = markerFile(sid, "ctx-used");
      mkdirSync(path.dirname(file), { recursive: true });
      closeSync(openSync(file, "w"));
    }
  } catch {}
  process.exit(0);
});
