#!/usr/bin/env node
// Paket-Uebernahme (claude-token-stack-paket): ehemals hooks/bash-dump-guard.mjs
// des Ist-Zustands (PreToolUse-Deny-Gate, 73/73 Tests auf der Ursprungsmaschine).
// Umbenannt in bash-dump-gate.mjs, um Verwechslung mit dem PostToolUse-Kompressor
// bash-dump-guard.mjs (v3.1) zu vermeiden — zwei verschiedene Bausteine:
// dieses Gate verhindert Dumps VOR der Ausfuehrung, der Kompressor reduziert
// Ausgaben NACH der Ausfuehrung. Pro Session genau einen davon als Bash-Owner
// waehlen (Gesetz I); die Kombination ist der A/B-Gegenstand des Rollouts.
//
// PreToolUse Bash gate. Two independent rules, merged from ~/.claude2/hooks/
// bash-ban-raw-tools (name-based, was never active here) and this file's original
// size-based rule:
//
//   RULE A — raw TOOLS by name (cat/head/tail/find/grep/rg/wc). Native Read/Grep/
//     Glob equivalents exist and cost far fewer tokens.
//   RULE B — raw SIZE regardless of tool. Catches interpreter one-liners
//     (`python3 -c`, `node -e`) that name matching cannot see; those were the
//     single largest self-inflicted context cost measured on this machine.
//
// Two deliberate fixes over the original name-based gate:
//   1. It read only the first token of line 1, so `cd X && grep …` slipped
//      through — the head is `cd`. This checks the head of every STATEMENT
//      (split on && || ;), still on line 1 only.
//   2. Pipe stages are NOT statement heads. `git log | head -20` is a bounded
//      pipeline and stays allowed; `cat x | head` is already caught at `cat`.
//      That is the rule the original arrived at the hard way, kept intact.
//
// `ls` is deliberately NOT banned: most frequent call by far, Glob is clumsier
// for it, and the context win is small. Add it to BANNED if that trade changes.
//
// Escape hatch: touch /tmp/bash-dump-unlock (10min TTL), or per-session
//   /tmp/bash-dump-unlock-<session_id>.
// Runs as the last link of the Bash chain: protect-tests -> protect-secrets ->
//   rtk -> dump-guard.
//
// Fail-open by design: any parse error, missing field, or unexpected shape exits
// 0 WITHOUT a decision object. A guard that blocks on malformed stdin is worse
// than no guard. Note that exit 0 alone never blocks — a block is only ever the
// `permissionDecision: "deny"` payload written to stdout at the end.
//
// Known false-positive class (found while testing this file): a command whose
// TEXT quotes a blocked pattern is blocked even though nothing executes it —
// e.g. echoing a JSON fixture that contains a large `.read(...)`. Unavoidable for
// a text-matching gate. Put such meta-work in a script file and run the file, or
// use the unlock. Self-check: scratchpad/test-dump-guard.mjs, 31 cases.

import { existsSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const BYTE_LIMIT = 3000; // raw bytes per read call
const LINE_LIMIT = 300; // lines for head/tail
const UNLOCK = "/tmp/bash-dump-unlock";

// The ctx tools are DEFERRED: their names are in context, their schemas are not.
// A direct call fails with InputValidationError, so every pointer to them must
// carry the loading step or it sends the reader into a dead end. Measured on
// session 7221ee3f: 4 blocks naming ctx, 0 ctx calls, 0 ToolSearch calls.
const CTX = "mcp__plugin_context-mode_context-mode__ctx_batch_execute";
const CTX_HINT =
  `Large or noisy output? Load the schema once with\n` +
  `  ToolSearch({query: "select:${CTX}"})\n` +
  `then run it — the sandbox keeps the full output and returns only the derived result.`;

const PIPE = /\|(?!\|)/;

// tokless' rtk-hook rewrites these to the token-optimised `rtk <tool>` form and
// is the better answer where it applies — blocking them here would stop the very
// optimisation it is installed for. Measured against the shipped hook:
//   cat -> rtk read · head -N -> rtk read --max-lines N · tail -> --tail-lines
//   grep/rg/find/wc/ls/jq -> rtk <same> · `cd X && cat f` is handled too
// It backs off as soon as a pipe is present (`cat a | sort` stays untouched),
// so Rule A keeps jurisdiction exactly there.
// WHY THIS ASKS settings.json AND NOT THE FILESYSTEM (fixed 2026-08-10)
// This used to be `existsSync("/Users/rob/.local/bin/tokless")`. That is a proxy
// for the wrong thing: the binary is tokless, the rewriting is done by its
// rtk-hook, and dropping rtk from tokless' tool selection leaves the binary in
// place. Rule A then kept waving `cat`/`grep` through while nothing rewrote them
// any more — a silent hole in a guard whose whole job is to not have one.
// Asked directly instead: is an rtk-hook registered as PreToolUse?
// Fail-safe, not fail-open: an unreadable settings.json means Rule A applies.
// Being wrong in that direction costs a redirect to the Read tool; being wrong
// in the other direction costs an unbounded byte dump.
const SETTINGS = join(homedir(), ".claude", "settings.json");
const RTK_HANDLES = new Set(["cat", "head", "tail", "grep", "rg", "find", "wc", "ls", "jq"]);

function rtkHookRegistered() {
  try {
    const pre = JSON.parse(readFileSync(SETTINGS, "utf-8"))?.hooks?.PreToolUse ?? [];
    return pre.some((m) =>
      (m?.hooks ?? []).some((h) => /\brtk-hook\b/.test(String(h?.command ?? "")))
    );
  } catch {
    return false;
  }
}

// Each entry names a native tool AND a fallback that always exists. Not every
// session exposes Grep/Glob — this one answers "Grep is not available in this
// session" — and a reason that points at a missing tool is a dead end. `rtk` is
// installed alongside this hook, so it is the safe second name.
const NATIVE = {
  cat: "Read tool (absolute path, optional offset/limit)",
  head: "Read tool (absolute path, optional offset/limit)",
  tail: "Read tool (absolute path, optional offset/limit)",
  find: "Glob tool (pattern='**/…'), or `rtk find` if Glob is unavailable",
  grep: "Grep tool (pattern, glob, output_mode), or `rtk grep` if Grep is unavailable",
  rg: "Grep tool (pattern, glob, output_mode), or `rtk rg` if Grep is unavailable",
  wc: "Read tool, or `rtk wc`, or ctx_execute to count in the sandbox",
};
const BANNED = new Set(Object.keys(NATIVE));

// A `|`, `;` or `&&` INSIDE quotes is data, not shell syntax: `grep -nE "A|B" f`
// has no pipe, `echo "x; cat y"` runs no cat. Blank the quoted spans (keeping the
// delimiters so token boundaries survive) before any structural split. Measured
// false positives before this: 4 of 6 probe cases, including a real `grep -nE`
// call. context-mode solves the same class the same way — routing.mjs strips
// quoted content before its curl/wget match (its Issue #63).
function stripQuoted(s) {
  return s.replace(/'[^']*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
}

// Heads of every statement on line 1. Only line 1, because multi-line heredoc
// bodies legitimately mention these names as prose — the false-positive class the
// original gate documented. Pipe stages are excluded on purpose (see header).
function statementHeads(cmd) {
  return stripQuoted(cmd.split("\n", 1)[0])
    .split(/&&|\|\||;/)
    .map((s) => s.trim().split(/\s+/)[0] || "")
    .filter(Boolean);
}

function allow() {
  process.exit(0);
}

// Unlock expires after 10 min so an override cannot become a silent permanent
// bypass. Negative age (future mtime from clock skew or a forged touch) counts
// as expired.
function checkUnlock(file) {
  try {
    if (!existsSync(file)) return false;
    const age = Date.now() - statSync(file).mtimeMs;
    if (age >= 0 && age < 600_000) return true;
    try {
      unlinkSync(file);
    } catch {}
  } catch {}
  return false;
}

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", allow);
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return allow();
  }

  if (input?.tool_name !== "Bash") return allow();

  const cmd = input?.tool_input?.command;
  if (typeof cmd !== "string" || cmd === "") return allow();

  const sid = input?.session_id || `ppid-${process.ppid}`;
  if (checkUnlock(UNLOCK) || checkUnlock(`${UNLOCK}-${sid}`)) return allow();

  // ─── Rule A: raw tools by name ───
  const firstLine = stripQuoted(cmd.split("\n", 1)[0]);
  const rtkWins = rtkHookRegistered() && !PIPE.test(firstLine);
  const nameHits = [
    ...new Set(
      statementHeads(cmd).filter(
        (h) => BANNED.has(h) && !(rtkWins && RTK_HANDLES.has(h))
      )
    ),
  ];

  // ─── Rule B: raw size ───
  // Scanned over the WHOLE command, unlike rule A. Rule A matches command names,
  // which appear as prose inside heredocs. Rule B matches size literals next to
  // read verbs; inside a heredoc that is not a false positive but precisely the
  // case worth blocking — the dump sits on line 4 of a `python3 -c` block.
  const hits = [];
  let m;

  const reRead = /\.read\(\s*(\d+)/g;
  while ((m = reRead.exec(cmd))) {
    if (Number(m[1]) > BYTE_LIMIT) hits.push(`.read(${m[1]})`);
  }

  const reBytes = /\b(?:head|tail)\s+-c\s*(\d+)/g;
  while ((m = reBytes.exec(cmd))) {
    if (Number(m[1]) > BYTE_LIMIT) hits.push(`-c ${m[1]}`);
  }

  const reLines = /\b(?:head|tail)\s+-n\s*(\d+)/g;
  while ((m = reLines.exec(cmd))) {
    if (Number(m[1]) > LINE_LIMIT) hits.push(`-n ${m[1]}`);
  }

  const reDd = /\bdd\b[^\n]*\bbs=(\d+)/g;
  while ((m = reDd.exec(cmd))) {
    if (Number(m[1]) > BYTE_LIMIT) hits.push(`dd bs=${m[1]}`);
  }

  // No Rule C. A pre-emptive nudge has to PREDICT waste, but output size is
  // unknowable before execution — so it landed on trivial pipelines (twice
  // observed, both times the correct answer was "re-run as is") and missed
  // `git diff` / `npm test` / `docker logs` entirely. The measurement moved to
  // bash-size-feedback.mjs (PostToolUse), which reacts to the real number.
  if (nameHits.length === 0 && hits.length === 0) return allow();

  const lines = [];
  for (const tool of nameHits) {
    lines.push(`BLOCKED Bash '${tool}'. Use the ${NATIVE[tool]}.`);
  }
  if (hits.length > 0) {
    lines.push(`BLOCKED Bash: ${hits.join(", ")} pushes raw bytes into context.`);
  }
  lines.push(CTX_HINT);
  lines.push(`Override (rare): touch ${UNLOCK}`);

  // `permissionDecision: "deny"` statt `exit 2`. Der alte Weg loest
  // anthropics/claude-code#24327 aus: Claude wertet einen exit-2-Block wie eine
  // Nutzer-Ablehnung und geht idle, statt die Begruendung zu lesen und den
  // genannten Ausweg zu nehmen. Mit deny kommt der Grund als
  // permissionDecisionReason an und die Umleitung wird tatsaechlich befolgt.
  // Exit 0 ist hier korrekt — die Entscheidung steckt im JSON, nicht im Code.
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: lines.join("\n"),
    },
  }));
  process.exit(0);
});
