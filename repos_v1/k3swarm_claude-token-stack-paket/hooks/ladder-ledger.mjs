#!/usr/bin/env node
// Herkunft: Squeez-RTK-Ladder/ladder-ledger.mjs — unveraendert uebernommen in
// das claude-token-stack-paket. Einzige aktiv gewinnbringende Komponente des
// Ladder-Projekts (v5: -27,2 % fresh input auf Quelltext, gepaart, 3 Replikate).
// PostToolUse auf allen Tools: Stash-Buch (Key -> Kommando/Groesse), enger
// Rung-2-Nudge (nur Quelltext > 4.000 Zeichen, max. 5/Session), Usage-Journal
// ~/.claude/ladder-usage.jsonl. Fail-open, blockiert nie.
//
// PostToolUse (all tools): record every squeez stash marker this session emits.
//
// WHY A LEDGER AT ALL
// The retrieve gate has to answer three questions about a stash key before it
// can decide anything: how big was the original, which command produced it, and
// has the working tree moved since. A PreToolUse hook cannot call MCP, so it
// cannot ask squeez_recent_calls. Rather than parse squeez's private session
// state (undocumented, version-coupled), we capture the one thing squeez already
// states in plain text inside the tool result the model just received.
//
// MARKER FORMATS observed on squeez 1.45.0 (verbatim, note the em dash):
//   [squeez: full 1050-line output stored - call squeez_retrieve with
//    key="4fdbcb5b12221107" to expand, or squeez_stash_search to find it later]
//   [squeez: identical to 1aea8667 at bash#9 - output omitted]
//   # squeez [cat] 12584->16 tokens (-100%) 50ms [adaptive: Full]
// The regexes below are deliberately loose about the punctuation between
// "stored" and "key=" because that dash is the most likely thing to change
// between releases. Only key= and the line count are load-bearing.
//
// The header's own token figure is NOT trusted: for lib/response.js it reported
// 12584 where tiktoken o200k_base counts 6574 - roughly chars/2, a ~1.9x
// overestimate. We record CHARACTERS and convert with the measured ratio.
//
// Also stamps a write counter: any Write/Edit/NotebookEdit bumps it, so the gate
// can tell that a working-tree-sensitive command is no longer safe to re-run.
//
// Fail-open: any parse error or unexpected shape exits 0 without output. This
// hook never blocks.
//
// IT DOES SPEAK, IN EXACTLY ONE CASE (added 2026-08-09 after series v5)
// v5 measured the command ladder on source files: 6 runs, paired -27.2% fresh
// input at unchanged quality, spread 3%/7%. The win only materialises if the
// model actually runs `ladder <key>` instead of re-reading verbatim, and nothing
// told it to. This hook already holds the command, the key and the size, so the
// nudge lives here rather than in a second hook that would duplicate the same
// stdin parse and the same marker regex.
//
// Deliberately narrow, because a nudge that fires where it cannot pay is pure
// context cost:
//   - source extensions only. For git/ls/du output `rtk read` finds no filter,
//     produces empty output and returns the input unchanged, so rung 2 there is
//     R3 under another name (measured, PLAN-v5 §5).
//   - above LADDER_HINT_MIN_CHARS. Below that the whole stash is cheaper than
//     the round trip.
//   - MAX_HINTS per session, so a run touching twenty files cannot turn the
//     nudge into the noise it is meant to remove.

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const LEDGER_DIR = "/tmp";
const MAX_ENTRIES = 200; // bounded: oldest keys evicted, a session cannot grow unbounded

// Usage journal — the one number the whole squeez question hangs on.
//
// The benchmark says squeez loses its edge over rtk once the agent retrieves 47%
// of what was compressed away. That rate was never measured, in any of the five
// A/B series. Without it, every further decision about squeez is a guess.
//
// One line per stash created, one per escalation (written by `ladder`).
// `ladder stats` divides them. NOT under /tmp: a restart wiped it mid-series
// once already and took half the measurements with it.
const JOURNAL = join(homedir(), ".claude", "ladder-usage.jsonl");

function journal(event) {
  try {
    appendFileSync(JOURNAL, JSON.stringify({ ts: Date.now(), ...event }) + "\n");
  } catch {}
}

// squeez states the stashed original's LINE count but not its character count,
// so the gate's size test needs a conversion. Reference corpus (express +
// requests, 15 outputs): median 39.0, mean 44.0, range 23.9 (du, find, dense
// source) to 89.1 (ps aux). RE-MEASURED on this machine 2026-08-09:
// ladder-calibrate.mjs reported a median of 43.2, and two live stashes came in
// at 31.6 (git log --numstat) and 54.9 (git log --stat) chars/line - so 43 sits
// between them. The median is used because the distribution is right-skewed; a
// low estimate is the safe error here - it under-reports size and therefore lets
// retrieve through unredirected.
const CHARS_PER_LINE = 43;

// squeez' own PreToolUse hook rewrites the Bash command before it runs, so what
// PostToolUse reports is `<path>/squeez wrap '<original>'` and not the original.
// Measured on the live install 2026-08-09: the recorded head was the squeez
// binary path, which is in no allowlist, so the gate allowed every retrieve and
// rung 2 could never fire. Unwrap it back to what the model actually asked for.
const RE_WRAP = /(?:^|\/)squeez\s+wrap\s+(['"])([\s\S]*)\1\s*$/;

function unwrapSqueez(cmd) {
  const m = String(cmd).match(RE_WRAP);
  if (!m) return cmd;
  const q = m[1];
  // Shell single-quote escaping is '\'' ; double quotes keep \" .
  return q === "'" ? m[2].replace(/'\\''/g, "'") : m[2].replace(/\\"/g, '"');
}

const RE_KEY = /squeez_retrieve\s+with\s+key="([0-9a-fA-F]+)"/g;
const RE_LINES = /full\s+(\d+)-line\s+output\s+stored/;
const WRITE_TOOLS = /^(Write|Edit|MultiEdit|NotebookEdit)$/;

// Languages rtk read has a structure filter for. The extension is not what rtk
// keys off - it detects the language from the content, measured 2026-08-09 -
// but it is the only signal available here, and it keeps the nudge off command
// output, where rung 2 cannot pay.
const RE_SOURCE = /\.(rs|ts|tsx|js|jsx|mjs|cjs|py|go|java|kt|swift|c|h|cc|cpp|hpp|rb|php|cs|scala)(\s|$)/;
const LADDER_HINT_MIN_CHARS = 4000; // entspricht rung2Filter.minChars
const MAX_HINTS = 5;                // pro Session

function ledgerPath(sid) {
  return `${LEDGER_DIR}/ladder-${sid}.json`;
}

function load(p) {
  try {
    const j = JSON.parse(readFileSync(p, "utf-8"));
    if (j && typeof j === "object") {
      return { keys: j.keys ?? {}, writes: Number(j.writes) || 0, redirected: j.redirected ?? {} };
    }
  } catch {}
  return { keys: {}, writes: 0, redirected: {} };
}

function save(p, data) {
  try {
    const keys = Object.entries(data.keys);
    if (keys.length > MAX_ENTRIES) {
      keys.sort((a, b) => (b[1].ts ?? 0) - (a[1].ts ?? 0));
      data.keys = Object.fromEntries(keys.slice(0, MAX_ENTRIES));
    }
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(data));
  } catch {}
}

// tool_response shape varies by Claude Code version - measure whatever carries
// text. Same defensive read as bash-size-feedback.mjs, kept in sync deliberately.
function responseText(r) {
  if (typeof r === "string") return r;
  if (r && typeof r.stdout === "string") {
    return r.stdout + (typeof r.stderr === "string" ? r.stderr : "");
  }
  if (r != null) {
    try { return JSON.stringify(r); } catch { return ""; }
  }
  return "";
}

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", () => process.exit(0));
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    const sid = input?.session_id || `ppid-${process.ppid}`;
    const p = ledgerPath(sid);
    const tool = String(input?.tool_name ?? "");

    // Working-tree movement invalidates re-running `git status` / `git diff`.
    if (WRITE_TOOLS.test(tool)) {
      const d = load(p);
      d.writes += 1;
      save(p, d);
      return process.exit(0);
    }

    const text = responseText(input?.tool_response);
    if (!text || !text.includes("squeez_retrieve")) return process.exit(0);

    const cmd = unwrapSqueez(
      String(input?.tool_input?.command ?? input?.tool_input?.file_path ?? "")
    );
    const d = load(p);
    const lineMatch = text.match(RE_LINES);

    const fresh = [];
    let m;
    RE_KEY.lastIndex = 0;
    while ((m = RE_KEY.exec(text))) {
      const key = m[1].toLowerCase();
      if (d.keys[key]) continue; // first sighting wins; a key is content-addressed
      fresh.push(key);
      d.keys[key] = {
        cmd,
        tool,
        // Characters of the ORIGINAL, not of what the model received. squeez
        // does not print the original char count, so we reconstruct from the
        // line count when present and fall back to the compressed length. Both
        // are estimates; the gate only needs them to clear a threshold.
        lines: lineMatch ? Number(lineMatch[1]) : null,
        chars: lineMatch ? Number(lineMatch[1]) * CHARS_PER_LINE : text.length,
        charsEstimated: true,
        writesAt: d.writes,
        ts: Date.now(),
      };
    }
    save(p, d);

    // One journal line per new stash. `source` is what decides whether the
    // ladder could ever pay here, so it is recorded rather than inferred later.
    for (const k of fresh) {
      journal({ event: "stash", key: k, chars: d.keys[k].chars,
                source: RE_SOURCE.test(cmd) ? "source" : "other",
                head: cmd.split(/\s+/, 1)[0] });
    }

    // Rung 2 nudge - see the header for why it is this narrow.
    const worth = fresh.filter((k) => d.keys[k].chars >= LADDER_HINT_MIN_CHARS);
    if (!worth.length || !RE_SOURCE.test(cmd)) return process.exit(0);

    const counter = `/tmp/ladder-hint-${sid}`;
    let seen = 0;
    try { seen = Number(readFileSync(counter, "utf-8")) || 0; } catch {}
    if (seen >= MAX_HINTS) return process.exit(0);
    try { writeFileSync(counter, String(seen + 1)); } catch {}

    const list = worth.map((k) => `ladder ${k}`).join(" ; ");
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          `squeez stashed source output. For structural questions - signatures, ` +
          `types, which functions exist - run \`${list}\`: rtk keeps the ` +
          `signatures and drops the bodies, measured 27% cheaper over the run ` +
          `than reading it verbatim. Append \`--raw\` only if you need the ` +
          `bodies themselves.`,
      },
    }));
  } catch {}
  process.exit(0);
});
