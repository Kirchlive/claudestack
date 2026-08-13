#!/usr/bin/env node
// PostToolUse Bash: react to the size a command ACTUALLY returned.
//
// Why here and not in a PreToolUse gate: output size is unknowable before
// execution. A pre-emptive nudge therefore fires on trivial pipelines and misses
// the expensive ones — `git diff`, `npm test`, `docker logs`, `kubectl get -o yaml`
// have no pipe, no banned tool, no size literal, and can still return 20k chars.
// This hook waits for the real number and only then says anything.
//
// Budget: silent while everything is cheap. At most MAX_HINTS messages per
// session, each ~60 tokens, and none at all once ctx has been used (marker from
// ctx-used-marker.mjs). The measured failure mode is over-instruction — 3.5k
// tokens of SessionStart guidance produced 0 of 92 ctx calls in session 7221ee3f
// — so this stays quiet unless it has an actual number to show.
//
// Fail-open: any parse error or unexpected shape exits 0 without output.

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const THRESHOLD = 2500;  // Zeichen; darunter lohnt der Hinweis nicht
const MAX_HINTS = 2;     // pro Session
const CTX = "mcp__plugin_context-mode_context-mode__ctx_execute";

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
    if (existsSync(`/tmp/ctx-used-${sid}`)) return process.exit(0);

    const counter = `/tmp/ctx-size-hint-${sid}`;
    let seen = 0;
    try { seen = Number(readFileSync(counter, "utf-8")) || 0; } catch {}
    if (seen >= MAX_HINTS) return process.exit(0);
    try { writeFileSync(counter, String(seen + 1)); } catch {}

    const tokens = Math.round(text.length / 3);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          `That Bash call returned ${text.length} characters (~${tokens} tokens) into context. ` +
          `If you needed to filter, count, parse or aggregate that output, the same work in the ` +
          `sandbox returns only the result and leaves the raw bytes out: ` +
          `ToolSearch({query: "select:${CTX}"}), then call it. ` +
          `If you genuinely needed the full text, ignore this.`,
      },
    }));
  } catch {}
  process.exit(0);
});
