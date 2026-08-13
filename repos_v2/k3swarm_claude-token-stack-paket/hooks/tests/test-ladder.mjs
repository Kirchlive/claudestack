#!/usr/bin/env node
// Self-check for ladder-ledger.mjs + ladder-retrieve-gate.mjs.
// Run: node hooks/test-ladder.mjs
//
// Every case asserts on the DECISION, not on wording, so reason-text edits do
// not break the suite. Fail-open cases assert empty stdout - that is the
// property that matters most: a broken gate must never block a session.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// Paket-Uebernahme: Komponenten liegen eine Ebene hoeher in hooks/, die Config
// im Paket unter config/ladder-config.json (einzige Quelle). Gate/Filter
// erwarten die Config neben sich — die Suite legt sie deshalb temporaer als
// hooks/ladder-config.json ab und raeumt sie am Ende wieder weg.
const HOOKS = join(HERE, "..");
const GATE = join(HOOKS, "ladder-retrieve-gate.mjs");
const LEDGER = join(HOOKS, "ladder-ledger.mjs");
const SID = "test-ladder-session";
const LPATH = `/tmp/ladder-${SID}.json`;
const CTX = `/tmp/ctx-used-${SID}`;
const UNLOCK = "/tmp/ladder-unlock";

const PKG_CONFIG = join(HERE, "..", "..", "config", "ladder-config.json");
const RUNTIME_CONFIG = join(HOOKS, "ladder-config.json");
let stagedConfig = false;
if (!existsSync(RUNTIME_CONFIG) && existsSync(PKG_CONFIG)) {
  writeFileSync(RUNTIME_CONFIG, readFileSync(PKG_CONFIG, "utf-8"));
  stagedConfig = true;
}
process.on("exit", () => { if (stagedConfig) { try { rmSync(RUNTIME_CONFIG, { force: true }); } catch {} } });

// `ladder-ab.mjs arm A` sets enabled:false in the config the gate reads, so every
// case that expects a redirect turns red - 20 passed, 5 failed, all five of them
// the deny cases. That looks like a broken gate and is not one. Refuse to report
// a misleading result.
{
  const cfgPath = RUNTIME_CONFIG;
  let enabled = true;
  try { enabled = JSON.parse(readFileSync(cfgPath, "utf-8")).enabled !== false; } catch {}
  if (!enabled) {
    console.log(
      `\nladder-config.json has "enabled": false - the gate is switched off.\n` +
      `Since the 02-1 decision (2026-08-09) that is the normal state; it is also\n` +
      `what 'ladder-ab.mjs arm A' sets. The 5 redirect cases cannot pass either\n` +
      `way. To exercise them: set "enabled": true, or run 'ladder-ab.mjs arm B'.\n`
    );
    process.exit(0);
  }
}

let pass = 0, fail = 0;

function run(script, payload) {
  try {
    // LADDER_MODE picks the rung under test; the two are mutually exclusive in
    // production but both must be verifiable here.
    const mode = script.endsWith("ladder-retrieve-filter.mjs") ? "filter" : "gate";
    return execFileSync("node", [script], {
      input: JSON.stringify(payload), encoding: "utf-8",
      env: { ...process.env, LADDER_MODE: mode },
    });
  } catch (e) {
    return `THREW:${e.message}`;
  }
}

function decision(out) {
  if (!out || !out.trim()) return "allow";
  try {
    return JSON.parse(out)?.hookSpecificOutput?.permissionDecision ?? "allow";
  } catch {
    return `BADJSON:${out.slice(0, 60)}`;
  }
}

function check(name, got, want) {
  if (got === want) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} -> got '${got}', want '${want}'`); }
}

function reset(ledger) {
  for (const f of [LPATH, CTX, UNLOCK]) { try { rmSync(f, { force: true }); } catch {} }
  if (ledger) writeFileSync(LPATH, JSON.stringify(ledger));
}

const STASH_TEXT =
  '[squeez: full 804-line output stored - call squeez_retrieve with ' +
  'key="23f110bf146fedfc" to expand, or squeez_stash_search to find it later]';

const retrieveCall = (key) => ({
  session_id: SID,
  tool_name: "mcp__squeez__squeez_retrieve",
  tool_input: { key },
});

console.log("\n-- ladder-ledger.mjs --");
reset(null);
run(LEDGER, {
  session_id: SID, tool_name: "Bash",
  tool_input: { command: "git log -50" },
  tool_response: STASH_TEXT,
});
{
  const l = JSON.parse(readFileSync(LPATH, "utf-8"));
  const e = l.keys["23f110bf146fedfc"];
  check("records the stash key", e ? "yes" : "no", "yes");
  check("records the command", e?.cmd, "git log -50");
  check("records the line count", String(e?.lines), "804");
  check("estimates chars from lines", String(e?.chars), String(804 * 43));
}
run(LEDGER, { session_id: SID, tool_name: "Edit", tool_input: { file_path: "/x" }, tool_response: "ok" });
check("write bumps the write counter",
  String(JSON.parse(readFileSync(LPATH, "utf-8")).writes), "1");
run(LEDGER, { session_id: SID, tool_name: "Bash", tool_input: { command: "echo hi" }, tool_response: "hi" });
check("ignores output with no marker",
  String(Object.keys(JSON.parse(readFileSync(LPATH, "utf-8")).keys).length), "1");

// Rung-2 nudge. Asserts only WHETHER the ledger speaks, never the wording —
// the wording carries a measured percentage that will change with the next
// series, the firing condition should not.
console.log("\n-- ladder-ledger.mjs: rung-2 nudge --");
{
  const bigStash = (key) =>
    `[squeez: full 853-line output stored — call squeez_retrieve with key="${key}" to expand]`;
  const smallStash = (key) =>
    `[squeez: full 20-line output stored — call squeez_retrieve with key="${key}" to expand]`;

  // Every case gets its own session id: the nudge fires once per key, and the
  // per-session cap would otherwise leak between cases.
  const speaks = (sid, command, response) => {
    const hintFile = `/tmp/ladder-hint-${sid}`;
    rmSync(`/tmp/ladder-${sid}.json`, { force: true });
    rmSync(hintFile, { force: true });
    const out = run(LEDGER, { session_id: sid, tool_name: "Bash",
      tool_input: { command }, tool_response: response });
    rmSync(`/tmp/ladder-${sid}.json`, { force: true });
    rmSync(hintFile, { force: true });
    return String(out).trim().length > 0 ? "speaks" : "silent";
  };

  check("source file, large stash", speaks("nudge-rs", "sed -n p /x/src/a.rs", bigStash("a1a1a1a1")), "speaks");
  check("typescript counts as source", speaks("nudge-ts", "sed -n p /x/app.ts", bigStash("a2a2a2a2")), "speaks");
  // rtk read finds no filter for command output and returns it unchanged, so a
  // nudge there would buy a process spawn and nothing else. Measured, PLAN-v5 §5.
  check("git output stays silent", speaks("nudge-git", "git log -90 --stat", bigStash("b1b1b1b1")), "silent");
  check("directory listing stays silent", speaks("nudge-ls", "ls -laR /x /y", bigStash("b2b2b2b2")), "silent");
  check("markdown stays silent", speaks("nudge-md", "sed -n p /x/README.md", bigStash("b3b3b3b3")), "silent");
  check("small stash stays silent", speaks("nudge-small", "sed -n p /x/t.rs", smallStash("c1c1c1c1")), "silent");

  // Cap: a run touching many files must not turn the nudge into noise.
  const sid = "nudge-cap";
  rmSync(`/tmp/ladder-${sid}.json`, { force: true });
  rmSync(`/tmp/ladder-hint-${sid}`, { force: true });
  let spoke = 0;
  for (let i = 1; i <= 6; i++) {
    const out = run(LEDGER, { session_id: sid, tool_name: "Bash",
      tool_input: { command: `sed -n p /x/src/f${i}.rs` },
      tool_response: bigStash(`d${i}d${i}d${i}d${i}`) });
    if (String(out).trim()) spoke++;
  }
  rmSync(`/tmp/ladder-${sid}.json`, { force: true });
  rmSync(`/tmp/ladder-hint-${sid}`, { force: true });
  check("caps at five nudges per session", String(spoke), "5");

  // A key is content-addressed: seeing it twice is not a new stash.
  const sid2 = "nudge-repeat";
  rmSync(`/tmp/ladder-${sid2}.json`, { force: true });
  rmSync(`/tmp/ladder-hint-${sid2}`, { force: true });
  const p = { session_id: sid2, tool_name: "Bash",
    tool_input: { command: "sed -n p /x/src/a.rs" }, tool_response: bigStash("e1e1e1e1") };
  run(LEDGER, p);
  const second = String(run(LEDGER, p)).trim().length > 0 ? "speaks" : "silent";
  rmSync(`/tmp/ladder-${sid2}.json`, { force: true });
  rmSync(`/tmp/ladder-hint-${sid2}`, { force: true });
  check("same key twice stays silent", second, "silent");
}

console.log("\n-- ladder-retrieve-gate.mjs: fail-open --");
reset(null);
check("no ledger at all", decision(run(GATE, retrieveCall("deadbeef"))), "allow");
check("malformed stdin", decision(run(GATE, "not-json")), "allow");
check("unrelated tool", decision(run(GATE, {
  session_id: SID, tool_name: "Bash", tool_input: { command: "ls" } })), "allow");

const big = { keys: { aaa: { cmd: "git log -50", lines: 804, chars: 31356, writesAt: 0 } },
              writes: 0, redirected: {} };

console.log("\n-- gate: the happy path --");
reset(big);
check("large deterministic stash is redirected", decision(run(GATE, retrieveCall("aaa"))), "deny");
check("same key a second time goes through", decision(run(GATE, retrieveCall("aaa"))), "allow");

console.log("\n-- gate: Idee 1, the size floor --");
reset({ keys: { small: { cmd: "git log -3", lines: 12, chars: 468, writesAt: 0 } }, writes: 0, redirected: {} });
check("below minChars -> no redirect", decision(run(GATE, retrieveCall("small"))), "allow");

console.log("\n-- gate: determinism --");
reset({ keys: { ps: { cmd: "ps aux", lines: 300, chars: 26730, writesAt: 0 } }, writes: 0, redirected: {} });
check("ps aux is not re-runnable", decision(run(GATE, retrieveCall("ps"))), "allow");
reset({ keys: { dl: { cmd: "docker logs app", lines: 900, chars: 35100, writesAt: 0 } }, writes: 0, redirected: {} });
check("docker logs is not re-runnable", decision(run(GATE, retrieveCall("dl"))), "allow");
reset({ keys: { gs: { cmd: "git status", lines: 60, chars: 2340, writesAt: 0 } }, writes: 2, redirected: {} });
check("git status after a write is stale", decision(run(GATE, retrieveCall("gs"))), "allow");
reset({ keys: { gs: { cmd: "git status", lines: 60, chars: 2340, writesAt: 2 } }, writes: 2, redirected: {} });
check("git status with no write since is fine", decision(run(GATE, retrieveCall("gs"))), "deny");

console.log("\n-- gate: compound commands are refused --");
reset({ keys: { p: { cmd: "git log -50 | head -20", lines: 804, chars: 31356, writesAt: 0 } }, writes: 0, redirected: {} });
check("piped command -> no rewrite", decision(run(GATE, retrieveCall("p"))), "allow");
reset({ keys: { c: { cmd: "cd lib && cat response.js && ls", lines: 1050, chars: 40950, writesAt: 0 } }, writes: 0, redirected: {} });
check("compound command -> no rewrite", decision(run(GATE, retrieveCall("c"))), "allow");

console.log("\n-- gate: a single leading cd is not a compound command --");
reset({ keys: { cd1: { cmd: "cd /repo && git log -25 --stat", lines: 312, chars: 12168, writesAt: 0 } }, writes: 0, redirected: {} });
{
  const out = run(GATE, retrieveCall("cd1"));
  check("cd + deterministic head -> redirect", decision(out), "deny");
  const reason = (() => { try { return JSON.parse(out).hookSpecificOutput.permissionDecisionReason; } catch { return ""; } })();
  check("suggestion keeps the cd and leads with the prefix",
    reason.includes("--no-squeez cd /repo && rtk git log -25 --stat") ? "yes" : `no: ${reason}`, "yes");
}
reset({ keys: { cd2: { cmd: "cd /repo && ps aux", lines: 300, chars: 26730, writesAt: 0 } }, writes: 0, redirected: {} });
check("cd + non-deterministic head -> allow", decision(run(GATE, retrieveCall("cd2"))), "allow");
reset({ keys: { q: { cmd: 'grep -nE "a;b" lib/', lines: 300, chars: 18000, writesAt: 0 } }, writes: 0, redirected: {} });
check("quoted ; is data, still rewritten", decision(run(GATE, retrieveCall("q"))), "deny");

console.log("\n-- gate: context-mode stand-down --");
reset(big);
writeFileSync(CTX, "");
check("ctx used -> gate is silent", decision(run(GATE, retrieveCall("aaa"))), "allow");

console.log("\n-- gate: budget and unlock --");
reset({ keys: { a: { cmd: "git log -50", lines: 804, chars: 31356, writesAt: 0 },
                b: { cmd: "git log -60", lines: 804, chars: 31356, writesAt: 0 } },
        writes: 0, redirected: { x: {}, y: {}, z: {} } });
check("budget exhausted -> allow", decision(run(GATE, retrieveCall("a"))), "allow");
reset(big);
writeFileSync(UNLOCK, "");
check("unlock -> allow", decision(run(GATE, retrieveCall("aaa"))), "allow");

// ── ladder-retrieve-filter.mjs — rung 2 on the way back ──
// These assert the DECISION (did the output get swapped) rather than the text,
// and they use real rtk, because the whole question is what rtk does to a blob.
console.log("\n-- ladder-retrieve-filter.mjs --");
{
  const FILTER = join(HOOKS, "ladder-retrieve-filter.mjs");
  const swapped = (out) => {
    if (!out || !out.trim()) return "passthrough";
    try {
      return JSON.parse(out)?.hookSpecificOutput?.updatedToolOutput ? "filtered" : "passthrough";
    } catch { return `BADJSON:${out.slice(0, 60)}`; }
  };
  const call = (key, response) => ({
    session_id: SID,
    tool_name: "mcp__squeez__squeez_retrieve",
    tool_input: { key },
    tool_response: response,
  });
  // A source blob rtk understands. Built here so the suite needs no fixture.
  // A REAL source file, not a synthetic one. rtk's aggressive filter is a
  // heuristic over real code shapes: generated look-alikes slip past it (400
  // one-line functions land at 0.74, a loop-generated Rust file at 0.91) while
  // every real source in this directory compresses to ~0.18. Testing against a
  // synthetic blob would measure the generator, not the filter.
  const src = readFileSync(GATE, "utf-8");
  const plain = Array.from({ length: 400 }, (_, i) =>
    ` some/path/file_${i}.txt                       |   ${i} +`).join("\n");

  reset({ keys: { rs: { cmd: "cat ladder-retrieve-gate.mjs", lines: 2000, chars: src.length, writesAt: 0 },
                  txt: { cmd: "git log -25 --stat", lines: 400, chars: plain.length, writesAt: 0 } },
          writes: 0, redirected: {}, filtered: {} });
  check("source blob is swapped for the rtk view", swapped(run(FILTER, call("rs", src))), "filtered");
  check("same key a second time stays verbatim", swapped(run(FILTER, call("rs", src))), "passthrough");
  check("plain command output is left alone", swapped(run(FILTER, call("txt", plain))), "passthrough");

  reset({ keys: { rs: { cmd: "cat ladder-retrieve-gate.mjs", lines: 5, chars: 200, writesAt: 0 } },
          writes: 0, redirected: {}, filtered: {} });
  check("below minChars stays verbatim", swapped(run(FILTER, call("rs", "fn a(){}\n"))), "passthrough");

  reset({ keys: { rs: { cmd: "cat ladder-retrieve-gate.mjs", lines: 2000, chars: src.length, writesAt: 0 } },
          writes: 0, redirected: {}, filtered: {} });
  writeFileSync(UNLOCK, "");
  check("unlock -> verbatim", swapped(run(FILTER, call("rs", src))), "passthrough");
}

for (const f of [LPATH, CTX, UNLOCK]) { try { rmSync(f, { force: true }); } catch {} }
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
