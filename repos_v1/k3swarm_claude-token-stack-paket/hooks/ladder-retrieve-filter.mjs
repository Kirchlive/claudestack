#!/usr/bin/env node
// Herkunft: Squeez-RTK-Ladder/ladder-retrieve-filter.mjs — als REFERENZ ins claude-token-stack-paket
// uebernommen. Gemessen nicht gewinnbringend (Gate +9,6 %, Filter ungemessen);
// rung2Mode bleibt "off", NICHT in config/settings.json registriert.

// PostToolUse on squeez_retrieve: rung 2 as it was actually designed.
//
// THE CONCEPT, VERBATIM FROM THE DESIGN CONVERSATION
//   cat lib/response.js = 40k tokens
//   squeez compress -> 4k -> claude -> enough -> done
//   squeez compress -> 4k -> claude -> not enough -> squeez_retrieve
//                                   -> rtk compress to 24k -> claude
//
// The point is that the RETRIEVED CONTENT gets compressed on its way back. One
// tool call, no detour.
//
// WHAT ladder-retrieve-gate.mjs DOES INSTEAD, AND WHY IT COST MORE
// The gate denies the retrieve and asks the model to re-run the command through
// rtk itself. Three costs follow, all of them measured on 2026-08-09:
//   - an extra turn: deny -> model reads the reason -> issues a new Bash call
//   - a re-execution, which returns FRESH data for anything non-deterministic;
//     hence the allowlist, which excludes most commands outright
//   - the verbatim original was fetched anyway - both A/B arms issued exactly
//     six squeez_retrieve calls, so the detour saved nothing
// Paired result: +9.6% fresh input with the gate on. That is what re-execution
// costs, not what the ladder is worth.
//
// WHY THE GATE WAS BUILT THAT WAY - a real rtk constraint, not an oversight.
// rtk's intelligence lives in command handlers (`rtk git`, `rtk ls`, `rtk du`)
// and those RUN the command; they cannot filter text. Only two entry points take
// content: `rtk read <FILES>` and `rtk log [FILE]` (stdin when omitted).
// Measured on this machine:
//   source file, rtk read -l aggressive : 35326 -> 1769 chars  (-95%)
//   git log --stat dump, rtk read       : 17120 -> 17119       (no-op)
//   same dump, rtk log (stdin)          : 17120 ->   413       (log dedup, wrong tool)
// So this hook writes the retrieved blob to a temp file, keeps the original
// extension so rtk's language filters engage, and runs `rtk read` over it. No
// re-execution, no staleness, no allowlist - and where rtk has nothing to offer
// the size guard below simply passes the original through untouched.
//
// LOOP SAFETY. The second retrieve of the same key is never filtered, so the
// verbatim original always stays one call away.
//
// Fail-open: any error, unknown shape, or missing rtk exits 0 without output,
// and the untouched original reaches the model.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(HERE, "ladder-config.json");
const UNLOCK = "/tmp/ladder-unlock";

const DEFAULTS = {
  enabled: true,
  rung2Filter: {
    enabled: true,
    minChars: 4000,   // below this the rtk hop cannot repay its own process spawn
    // The guard only has to exclude rtk no-ops, and those come back at ~0.9999.
    // Real source lands at 0.05, a dense signature-heavy file at 0.74 - a 0.6
    // cutoff would have discarded the latter for no reason.
    maxRatio: 0.85,
    maxPerSession: 5,
    level: "aggressive",
  },
};

function pass() {
  process.exit(0);
}

function loadConfig() {
  try {
    const j = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    return { ...DEFAULTS, ...j, rung2Filter: { ...DEFAULTS.rung2Filter, ...(j.rung2Filter ?? {}) } };
  } catch {
    return DEFAULTS;
  }
}

// Same shapes squeez' own posttooluse.sh handles - kept in sync deliberately.
function responseText(r) {
  if (r == null) return "";
  if (typeof r === "string") return r;
  if (Array.isArray(r)) return r.map((b) => (b && typeof b.text === "string" ? b.text : "")).join("");
  if (typeof r === "object") {
    if ("content" in r) return responseText(r.content);
    if (r.file && typeof r.file === "object") return responseText(r.file.content);
    if (typeof r.text === "string") return r.text;
    if (typeof r.stdout === "string") return r.stdout;
  }
  return "";
}

// rtk picks its filter by file extension, so a blob from `cat lib/response.js`
// has to land in a .js temp file or the language filters never engage. Only the
// extension travels - never the path, because the file may have moved on.
function extensionOf(cmd) {
  const m = String(cmd || "").match(/[\w./-]+\.([A-Za-z0-9]{1,8})(?:\s|$)/g);
  if (!m || !m.length) return "";
  const last = m[m.length - 1].trim();
  const dot = last.lastIndexOf(".");
  return dot > 0 ? last.slice(dot) : "";
}

let raw = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("error", pass);
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return pass();
  }

  if (!/squeez_retrieve$/.test(String(input?.tool_name ?? ""))) return pass();

  const cfg = loadConfig();
  const rc = cfg.rung2Filter ?? {};
  // `enabled` is the same master switch ladder-ab.mjs flips, so arm A turns this
  // rung off along with the gate.
  if (!cfg.enabled || !rc.enabled) return pass();
  // Mutually exclusive with ladder-retrieve-gate.mjs - see the note there.
  const mode = process.env.LADDER_MODE || cfg.rung2Mode || "gate";
  if (mode !== "filter") return pass();
  if (existsSync(UNLOCK)) return pass();

  const sid = input?.session_id || `ppid-${process.ppid}`;
  const ledgerPath = `/tmp/ladder-${sid}.json`;

  let ledger = null;
  try {
    ledger = JSON.parse(readFileSync(ledgerPath, "utf-8"));
  } catch {
    ledger = { keys: {}, writes: 0, redirected: {}, filtered: {} };
  }
  ledger.filtered = ledger.filtered ?? {};

  const args = input?.tool_input ?? {};
  const key = String(args.key ?? args.arguments?.key ?? "").toLowerCase();
  if (!key) return pass();

  // Loop safety: the second retrieve of a key always returns verbatim.
  if (ledger.filtered[key]) return pass();
  if (Object.keys(ledger.filtered).length >= (rc.maxPerSession ?? 5)) return pass();

  const text = responseText(input?.tool_response);
  if (text.length < (rc.minChars ?? 4000)) return pass();

  const ext = extensionOf(ledger.keys?.[key]?.cmd);
  let filtered = "";
  try {
    const dir = mkdtempSync("/tmp/ladder-r2-");
    const tmp = join(dir, `blob${ext}`);
    writeFileSync(tmp, text);
    filtered = execFileSync("rtk", ["read", "-l", String(rc.level ?? "aggressive"), tmp], {
      encoding: "utf-8",
      maxBuffer: 64 * 1024 * 1024,
      timeout: 20_000,
      env: { ...process.env, NO_COLOR: "1", TERM: "dumb" },
    });
  } catch {
    return pass(); // rtk missing, slow, or unhappy -> the original is the answer
  }

  // rtk is a no-op on content it has no filter for (plain command output). Only
  // swap when the win is real.
  if (!filtered || filtered.length > text.length * (rc.maxRatio ?? 0.6)) return pass();

  try {
    ledger.filtered[key] = { ts: Date.now(), from: text.length, to: filtered.length };
    writeFileSync(ledgerPath, JSON.stringify(ledger));
  } catch {
    return pass(); // cannot guarantee loop safety -> do not swap
  }

  const note =
    `\n\n[ladder: rung 2 - this is the rtk '${rc.level}' view of the stash, ` +
    `${text.length} -> ${filtered.length} chars. Call squeez_retrieve with key="${key}" ` +
    `again for the verbatim original; the second call is never filtered.]`;

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      updatedToolOutput: filtered + note,
    },
  }));
  process.exit(0);
});
