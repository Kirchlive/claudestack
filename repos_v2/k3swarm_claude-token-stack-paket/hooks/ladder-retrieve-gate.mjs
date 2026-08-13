#!/usr/bin/env node
// Herkunft: Squeez-RTK-Ladder/ladder-retrieve-gate.mjs — als REFERENZ ins claude-token-stack-paket
// uebernommen. Gemessen nicht gewinnbringend (Gate +9,6 %, Filter ungemessen);
// rung2Mode bleibt "off", NICHT in config/settings.json registriert.

// PreToolUse on squeez_retrieve: insert a mid-fidelity rung before the verbatim
// original.
//
// THE LADDER
//   R1  squeez-compressed output          49-314 tok   (automatic, already happens)
//   R2  rtk re-run of the same command   1391-5976 tok (this hook suggests it)
//   R3  verbatim via squeez_retrieve     3897-10211 tok (what was requested)
//
// WHY IT PAYS. R1 is so cheap it works as a free preview. Measured break-even
// against running rtk on every bash call instead: the ladder only becomes more
// expensive once the model escalates in 93-99% of cases (per-scenario: cat 99%,
// git log 93%, grep 99%, ls 96%). Below that it wins, and it never loses the
// answer because R3 stays reachable.
//
// WHY IT IS ALLOWLIST-ONLY. R2 RE-RUNS the command; it does not read the stash.
// For non-deterministic output the re-run returns fresh data while the model
// believes it received the original - a correctness failure that no token saving
// justifies. See deterministicHeads / workingTreeSensitive in ladder-config.json.
//
// COVERAGE - READ THIS BEFORE DEBUGGING "WHY DIDN'T IT FIRE"
// In this stack most bytes never reach a stash at all, so the gate is quiet by
// design:
//   - bash-dump-guard.mjs Rule A routes cat/head/tail/find/grep/rg/wc to the
//     native Read/Grep/Glob tools. Those bypass the Bash path entirely.
//   - context-mode's ctx_* sandbox tools return only derived results; the raw
//     bytes never enter context, so there is nothing to stash and nothing to
//     escalate. When ctx is the active route this hook stands down completely.
//   - codegraph answers structural questions without a file read at all.
//   - tokless' rtk hook already rewrote many bash calls before squeez saw them.
// An independent paired A/B (JetBrains, 425 trials) measured that a Bash-only
// hook can reach roughly 20% of tool-result characters and about 3% of input
// tokens. Expect single-digit fire counts per session. That is the correct
// behaviour, not a bug.
//
// LOOP SAFETY. If the model escalates to R2 and still needs more, it calls
// squeez_retrieve again with the same key. The second call for a key is always
// allowed through - the gate never blocks the same key twice.
//
// Fail-open by design: any parse error, missing ledger, unknown key, or
// unexpected shape exits 0 WITHOUT a decision object. Exit 0 alone never blocks;
// a block is only the permissionDecision payload written to stdout.
//
// Uses permissionDecision:"deny" rather than exit 2, for the same reason
// bash-dump-guard.mjs does: anthropics/claude-code#24327 makes an exit-2 block
// read as a user refusal, so the model goes idle instead of following the
// redirect. With deny the reason arrives as permissionDecisionReason.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(HERE, "ladder-config.json");
const UNLOCK = "/tmp/ladder-unlock";

const DEFAULTS = {
  enabled: true,
  minChars: 1000,
  tokensPerKilochar: 318,
  maxRedirectsPerSession: 3,
  noSqueezPrefix: "--no-squeez ",
  deterministicHeads: ["cat", "git", "ls", "find", "grep", "rg", "wc", "du"],
  workingTreeSensitive: ["git status", "git diff", "git stash list"],
  rung2: {},
};

function allow() {
  process.exit(0);
}

function loadConfig() {
  try {
    const j = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return { ...DEFAULTS, ...j };
  } catch {
    return DEFAULTS; // a missing or malformed config must not break the session
  }
}

function loadLedger(p) {
  try {
    const j = JSON.parse(readFileSync(p, "utf-8"));
    return { keys: j.keys ?? {}, writes: Number(j.writes) || 0, redirected: j.redirected ?? {} };
  } catch {
    return null;
  }
}

// Same quote-blanking as bash-dump-guard.mjs: a `;` or `&&` inside quotes is
// data, not shell syntax. Kept byte-compatible with that file on purpose - if
// one is fixed, fix both.
function stripQuoted(s) {
  return s.replace(/'[^']*'/g, "''").replace(/"(?:\\.|[^"\\])*"/g, '""');
}

function head(cmd) {
  return stripQuoted(String(cmd).split("\n", 1)[0]).trim().split(/\s+/)[0] || "";
}

// A single leading `cd <dir> &&` is not a compound command in any meaningful
// sense - it sets the working directory and nothing else. Claude Code emits that
// shape constantly, and treating it as compound meant the recorded head was `cd`,
// which is in no allowlist, so an entire class of real commands could never
// escalate (observed live 2026-08-09 on `cd <repo> && git log -25 --stat`).
// Split it off, judge the command behind it, and carry the `cd` into the
// suggestion so rung 2 re-runs in the same directory.
// Only ONE leading cd, and only with an unquoted single-word path: anything more
// elaborate stays refused.
const RE_CD = /^cd\s+([^\s&|;<>'"`$()]+)\s+&&\s+(.+)$/;

function splitCd(cmd) {
  const m = String(cmd).trim().match(RE_CD);
  return m ? { lead: `cd ${m[1]} && `, rest: m[2].trim() } : { lead: "", rest: String(cmd).trim() };
}

// Rewrite the recorded command into its rtk form. Only the FIRST statement of
// the first line is rewritten; anything with a pipe, redirect, heredoc or a
// second statement is refused outright - rtk backs off on those anyway, and a
// half-rewritten compound command is worse than no suggestion.
function toRung2(cmd, map) {
  const line = String(cmd).split("\n", 1)[0].trim();
  if (line !== String(cmd).trim()) return null;             // multi-line
  const bare = stripQuoted(line);
  if (/[|<>]|&&|\|\||;|\$\(|`/.test(bare)) return null;      // compound / piped
  const h = head(line);
  const repl = map[h];
  if (!repl) return null;
  return repl + line.slice(h.length);
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

  const tool = String(input?.tool_name ?? "");
  if (!/squeez_retrieve$/.test(tool)) return allow();

  const cfg = loadConfig();
  if (!cfg.enabled) return allow();
  // The two rung-2 implementations are mutually exclusive by construction: this
  // one denies the call, so no tool result exists and PostToolUse - where
  // ladder-retrieve-filter.mjs lives - never runs. Discovered the hard way on
  // 2026-08-09: an arm-B series produced 3 gate redirects and 0 filter swaps.
  // LADDER_MODE lets the test suite exercise either rung without editing config.
  const mode = process.env.LADDER_MODE || cfg.rung2Mode || "gate";
  if (mode !== "gate") return allow();
  if (existsSync(UNLOCK)) return allow();

  const sid = input?.session_id || `ppid-${process.ppid}`;

  // context-mode is the active route in this session -> stand down. Adding a
  // competing redirect on top of ctx routing is exactly the over-instruction
  // that measured 0 of 92 ctx calls in session 7221ee3f. Marker written by
  // ctx-used-marker.mjs.
  if (existsSync(`/tmp/ctx-used-${sid}`)) return allow();

  const ledgerPath = `/tmp/ladder-${sid}.json`;
  const ledger = loadLedger(ledgerPath);
  if (!ledger) return allow(); // no ledger -> nothing known -> never guess

  const args = input?.tool_input ?? {};
  const key = String(args.key ?? args.arguments?.key ?? "").toLowerCase();
  if (!key) return allow();

  const entry = ledger.keys?.[key];
  if (!entry) return allow(); // key we never saw stashed

  // Loop safety: never block the same key twice.
  if (ledger.redirected?.[key]) return allow();

  // Budget.
  const used = Object.keys(ledger.redirected ?? {}).length;
  if (used >= cfg.maxRedirectsPerSession) return allow();

  // Idee 1 - size floor. Below this the middle rung cannot repay its own
  // re-execution, so the verbatim original is simply the right answer.
  const chars = Number(entry.chars) || 0;
  if (chars < cfg.minChars) return allow();

  // Determinism allowlist. Judged on the command behind an optional leading `cd`.
  const { lead, rest } = splitCd(entry.cmd);
  const h = head(rest);
  if (!cfg.deterministicHeads.includes(h)) return allow();

  // Working-tree-sensitive commands stop being re-runnable the moment anything
  // was written after the stash was taken.
  const norm = stripQuoted(rest).trim().replace(/\s+/g, " ");
  const sensitive = (cfg.workingTreeSensitive ?? []).some((s) => norm.startsWith(s));
  if (sensitive && ledger.writes > (entry.writesAt ?? 0)) return allow();

  const rewritten = toRung2(rest, cfg.rung2 ?? {});
  if (!rewritten) return allow();
  // The no-squeez prefix is consumed by squeez' own PreToolUse hook, so it has to
  // lead the WHOLE command - it cannot sit behind the `cd`.
  const suggestion = (cfg.noSqueezPrefix ?? "") + lead + rewritten;

  // Record BEFORE denying, so a crash after this point cannot produce a loop.
  try {
    ledger.redirected[key] = { ts: Date.now(), cmd: entry.cmd };
    writeFileSync(ledgerPath, JSON.stringify(ledger));
  } catch {
    return allow(); // cannot guarantee loop safety -> do not block
  }

  const approxTok = Math.round((chars / 1000) * cfg.tokensPerKilochar);
  const lines = [
    `HOLD squeez_retrieve. That stash is ~${entry.lines ?? "?"} lines (~${approxTok} tokens verbatim).`,
    `There is a cheaper middle step that keeps the structure and usually the answer:`,
    ``,
    `  ${suggestion}`,
    ``,
    `Measured on this class of output, the rtk form returns roughly 40-65% of the`,
    `verbatim tokens with most identifiers, paths and line numbers intact.`,
    `If it still does not answer your question, call squeez_retrieve with the same`,
    `key again - the second call goes through untouched.`,
    `For a source file you only need the shape of, 'rtk read -l aggressive <path>'`,
    `keeps function signatures and drops bodies (~3% of verbatim).`,
    `Override: touch ${UNLOCK}`,
  ];

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: lines.join("\n"),
    },
  }));
  process.exit(0);
});
