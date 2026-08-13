#!/usr/bin/env node
// PostToolUse: mark that a context-mode sandbox tool was used in this session.
// Paired with bash-dump-guard.mjs, whose one-time nudge stays silent once this
// marker exists. Session-keyed via session_id from hook stdin — PPID is not
// stable across hook spawns in Claude Code.
// Pattern borrowed from ~/.claude2/hooks/cbm-mcp-marker.

import { closeSync, openSync } from "node:fs";

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", () => process.exit(0));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    const tool = input?.tool_name ?? "";
    if (/^mcp__(plugin_)?context-mode/.test(tool)) {
      // /tmp, not os.tmpdir(): on macOS tmpdir() is a per-process private path,
      // so two hook spawns would not see each other's marker.
      const sid = input?.session_id || `ppid-${process.ppid}`;
      closeSync(openSync(`/tmp/ctx-used-${sid}`, "w"));
    }
  } catch {}
  process.exit(0);
});
