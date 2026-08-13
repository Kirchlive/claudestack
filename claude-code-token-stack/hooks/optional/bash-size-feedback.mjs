#!/usr/bin/env node
// PostToolUse Bash: react to the size a command ACTUALLY returned.
//
// Why here and not in a PreToolUse gate: output size is unknowable before
// execution. A pre-emptive nudge therefore fires on trivial pipelines and misses
// the expensive ones — `git diff`, `npm test`, `docker logs`, `kubectl get -o yaml`
// have no pipe, no banned tool, no size literal, and can still return 20k chars.
// This hook waits for the real number and only then says anything.
//
// Budget: silent while everything is cheap. Hinweise werden gegen das
// GEMEINSAME Nudge-Budget der optionalen Hooks gebucht (lib/nudge-budget.mjs,
// AP-4.5) — frueher zaehlte dieser Hook allein ueber /tmp/ctx-size-hint-<sid>
// und wusste nichts von den Hinweisen aus session-economy. MAX_HINTS bleibt als
// eigener Deckel bestehen: er begrenzt diesen Hook zusaetzlich, das gemeinsame
// Budget begrenzt die Sitzung insgesamt. Keine Hinweise, sobald ctx benutzt
// wurde (Marker aus ctx-used-marker.mjs). Die gemessene Fehlerform ist
// Ueberinstruktion — 3,5k Token SessionStart-Guidance ergaben 0 von 92 ctx-Calls
// in Sitzung 7221ee3f — deshalb bleibt der Hook still, solange er keine echte
// Zahl vorzeigen kann.
//
// Fail-open: any parse error or unexpected shape exits 0 without output.

import { existsSync } from "node:fs";

import { markerFile, nudgeStatus, tryConsumeNudge } from "./lib/nudge-budget.mjs";

const THRESHOLD = 2500;  // Zeichen; darunter lohnt der Hinweis nicht
const MAX_HINTS = 2;     // pro Session und Hook (das gemeinsame Budget deckelt die Sitzung)
const SOURCE = "bash-size-feedback";

// Das empfohlene Sandbox-Werkzeug ist NICHT fest verdrahtet. Die Vorgaengerfassung nannte
// hier `mcp__plugin_context-mode_context-mode__ctx_execute` — ein Werkzeug unter Elastic
// License 2.0, das L-8 fuer dienstliche Nutzung sperrt und dessen Flaeche in
// config/context-surface-owners.json ausdruecklich unbesetzt bleibt. Ein Nudge, der ein
// gesperrtes Werkzeug bewirbt, widerspricht der eigenen Spezifikation (Abnahmebefund M-8).
// Wer die Lizenzfrage fuer sich geklaert hat, setzt den Werkzeugnamen per Env; ohne ihn
// bleibt der Hinweis werkzeugneutral und damit lizenzfrei.
const CTX = process.env.CLAUDESTACK_SANDBOX_TOOL || "";

// Commands whose output is a side effect, not data to derive from. Pointing at
// the sandbox for `git push` output would be noise.
const MUTATING = /^(git\s+(push|commit|pull|fetch|merge|rebase|tag|clone|add|checkout|switch|reset|stash)|npm\s+(i|install|publish|run\s+build)|pnpm|yarn|cargo\s+(build|publish)|docker\s+(build|push|run)|rm|mv|cp|mkdir|chmod|ln|make)\b/;

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", () => process.exit(0));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    if (input?.tool_name !== "Bash") return process.exit(0);

    const cmd = String(input?.tool_input?.command ?? "");
    if (!cmd || MUTATING.test(cmd.trim())) return process.exit(0);

    // tool_response shape varies by version; measure whatever carries the text.
    const r = input?.tool_response;
    const text =
      typeof r === "string" ? r
      : typeof r?.stdout === "string" ? r.stdout + (typeof r?.stderr === "string" ? r.stderr : "")
      : r != null ? JSON.stringify(r)
      : "";
    if (text.length < THRESHOLD) return process.exit(0);

    const sid = input?.session_id || `ppid-${process.ppid}`;
    // Marker liegt gebuendelt unter <configDir>/token-stack/markers/ (siehe markerFile).
    if (existsSync(markerFile(sid, "ctx-used"))) return process.exit(0);

    // Eigener Deckel zuerst: wie viele Hinweise hat dieser Hook in der Sitzung
    // bereits gebucht? Die Buchungen stehen mit Quelle in der Budgetdatei.
    const own = nudgeStatus(sid).grants.filter((entry) => entry?.source === SOURCE).length;
    if (own >= MAX_HINTS) return process.exit(0);

    // Gemeinsames Budget: nur wer die Buchung erhaelt, gibt auch aus.
    if (!tryConsumeNudge(sid, SOURCE).granted) return process.exit(0);

    const tokens = Math.round(text.length / 3);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          `That Bash call returned ${text.length} characters (~${tokens} tokens) into context. ` +
          `If you needed to filter, count, parse or aggregate that output, doing that work at the ` +
          `source returns only the result and leaves the raw bytes out — pipe through grep/awk/jq, ` +
          `or narrow the command itself.` +
          (CTX ? ` A sandbox tool is configured for this: ToolSearch({query: "select:${CTX}"}), then call it.` : "") +
          ` If you genuinely needed the full text, ignore this.`,
      },
    }));
  } catch {}
  process.exit(0);
});
