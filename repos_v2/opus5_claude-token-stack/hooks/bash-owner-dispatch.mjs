#!/usr/bin/env node
// bash-owner-dispatch.mjs — R2: genau EIN registrierter Handler je Fläche.
//
// PROBLEM, das dieses Skript löst (gemessen am Ist-Zustand 13.08.2026):
//   PreToolUse:Bash  trägt drei mutierende Handler gleichzeitig
//     1. tokless rtk-hook        (schreibt cat/grep/find/wc zu `rtk <tool>` um)
//     2. bash-dump-guard.mjs     (permissionDecision: deny)
//     3. squeez pretooluse.sh    (schreibt zu `squeez wrap '<original>'` um)
//   PostToolUse trägt zwei mutierende plus zwei injizierende Handler.
//
//   Claude Code führt ALLE passenden Hooks PARALLEL aus [DOKU: code.claude.com/docs/en/hooks].
//   Es gibt keine Reihenfolge. Zwei Rewriter sehen denselben Ursprungsaufruf und liefern
//   konkurrierende updatedInput-Objekte. Belegter Schaden: squeez' Umschreibung auf
//   `squeez wrap '<original>'` hat dem Ladder-Gate den Kommandokopf verdeckt, worauf das
//   Gate JEDEN Retrieve durchliess und Stufe 2 nie feuerte (ABSCHLUSSBERICHT §6).
//
// LÖSUNG: dieses Skript ist der einzige registrierte Handler. Es ruft die Stufen
//   deterministisch NACHEINANDER auf, reicht das Ergebnis der einen als Eingabe der
//   nächsten weiter und gibt genau EIN Hook-Resultat zurück.
//
// INVARIANTEN
//   - fail-open: jeder Fehler endet mit exit 0 ohne Entscheidungsobjekt.
//   - fail-loud: eine konfigurierte, aber nicht auffindbare Stufe wird auf stderr
//     gemeldet und in den Metriken vermerkt. Sie wird NIE still übersprungen.
//     (Genau dieser Fehler ist im Korpus zweimal aufgetreten: ladder-ab.mjs CONFIG-Pfad
//     und test-guard-all.mjs GUARD-Pfad — beide liefen still weiter und lieferten
//     Zahlen, die wie Ergebnisse aussahen.)
//   - deny gewinnt immer und beendet die Kette sofort (restriktivste Entscheidung).
//   - Der Dispatcher entscheidet NIE `allow`. Ein Output-Owner hat keinen Grund,
//     Berechtigungen zu vergeben. (rtk#260 ist geschlossen — die Regel bleibt, weil
//     `allow` unnötig ist, nicht weil es gefährlich wäre.)
//   - PostToolUse liefert updatedToolOutput IMMER als OBJEKT
//     ({stdout, stderr, interrupted, isImage, exitCode}), nie als String.
//     Eine String-Ersetzung wird von Claude Code ignoriert.
//
// AUFRUF
//   node bash-owner-dispatch.mjs               als Hook (stdin = Event-JSON)
//   node bash-owner-dispatch.mjs --self-test   9 Prüfungen, exit 1 bei Fehlschlag
//   node bash-owner-dispatch.mjs --status      wirksame Konfiguration + Stufenprüfung
//
// KONFIGURATION  ~/.claude/bash-owner-dispatch.config.json
//   { "preStages":  [ {"name":"...", "command":"...", "args":[...], "enabled":true} ],
//     "postStages": [ ... ],
//     "timeoutMs": 5000, "metricsFile": "~/.claude/bash-owner-dispatch.metrics.jsonl" }

import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_PATH = join(homedir(), ".claude", "bash-owner-dispatch.config.json");

const DEFAULTS = {
  preStages: [],
  postStages: [],
  timeoutMs: 5000,
  metricsEnabled: true,
  metricsFile: join(homedir(), ".claude", "bash-owner-dispatch.metrics.jsonl"),
  failLoud: true,
};

const expand = (p) => (typeof p === "string" && p.startsWith("~/") ? join(homedir(), p.slice(2)) : p);

function loadConfig() {
  let cfg = { ...DEFAULTS };
  try {
    if (existsSync(CONFIG_PATH)) {
      const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
      cfg = { ...cfg, ...raw };
    }
  } catch {
    /* fail-open: Standardkonfiguration */
  }
  cfg.metricsFile = expand(cfg.metricsFile);
  for (const key of ["preStages", "postStages"]) {
    cfg[key] = (Array.isArray(cfg[key]) ? cfg[key] : [])
      .filter((s) => s && s.enabled !== false)
      .map((s) => ({ ...s, command: expand(s.command), args: Array.isArray(s.args) ? s.args.map(expand) : [] }));
  }
  return cfg;
}

function metric(cfg, rec) {
  if (!cfg.metricsEnabled) return;
  try {
    appendFileSync(cfg.metricsFile, JSON.stringify({ ts: new Date().toISOString(), ...rec }) + "\n");
  } catch {
    /* Metriken sind nie kritisch */
  }
}

// Eine Stufe ausführen. Rückgabe: {json|null, missing, failed}
function runStage(stage, payload, cfg) {
  const exists = stage.command && (existsSync(stage.command) || !stage.command.includes("/"));
  if (!exists) {
    // fail-loud: melden, nicht still überspringen
    if (cfg.failLoud) process.stderr.write(`bash-owner-dispatch: Stufe "${stage.name}" nicht auffindbar: ${stage.command}\n`);
    return { json: null, missing: true, failed: false };
  }
  let res;
  try {
    res = spawnSync(stage.command, stage.args ?? [], {
      input: JSON.stringify(payload),
      encoding: "utf-8",
      timeout: cfg.timeoutMs,
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    return { json: null, missing: false, failed: true };
  }
  if (res.error || res.status === null) return { json: null, missing: false, failed: true };
  // Exit 2 einer Stufe = blockierender Fehler dieser Stufe
  const out = (res.stdout || "").trim();
  if (!out) return { json: null, missing: false, failed: false, exit: res.status, stderr: res.stderr };
  try {
    return { json: JSON.parse(out), missing: false, failed: false, exit: res.status };
  } catch {
    return { json: null, missing: false, failed: true, exit: res.status };
  }
}

// ------------------------------------------------------------------ PreToolUse
function dispatchPre(ev, cfg) {
  let input = ev.tool_input ?? {};
  let rewritten = false;
  const trace = [];
  for (const stage of cfg.preStages) {
    const payload = { ...ev, tool_input: input };
    const r = runStage(stage, payload, cfg);
    trace.push({ stage: stage.name, missing: r.missing, failed: r.failed, exit: r.exit ?? null });
    if (r.missing || r.failed || !r.json) continue;

    const hso = r.json.hookSpecificOutput ?? {};
    const decision = hso.permissionDecision;

    // deny gewinnt sofort — restriktivste Entscheidung, Kette endet
    if (decision === "deny" || decision === "ask") {
      return {
        result: {
          hookSpecificOutput: {
            hookEventName: "PreToolUse",
            permissionDecision: decision,
            permissionDecisionReason: hso.permissionDecisionReason ?? `blockiert durch Stufe ${stage.name}`,
          },
        },
        trace,
        rewritten,
      };
    }
    // allow wird bewusst VERWORFEN — der Dispatcher vergibt keine Berechtigungen
    if (hso.updatedInput && typeof hso.updatedInput === "object") {
      input = { ...input, ...hso.updatedInput };
      rewritten = true;
    }
  }
  if (!rewritten) return { result: null, trace, rewritten };
  return {
    result: { hookSpecificOutput: { hookEventName: "PreToolUse", updatedInput: input } },
    trace,
    rewritten,
  };
}

// ----------------------------------------------------------------- PostToolUse
// Die Bash-Ausgabeform ist ein OBJEKT. Nicht geänderte Felder bleiben erhalten.
function normalizeOutput(resp) {
  if (resp && typeof resp === "object") {
    return {
      stdout: typeof resp.stdout === "string" ? resp.stdout : "",
      stderr: typeof resp.stderr === "string" ? resp.stderr : "",
      interrupted: Boolean(resp.interrupted),
      isImage: Boolean(resp.isImage),
      ...(typeof resp.exitCode === "number" ? { exitCode: resp.exitCode } : {}),
    };
  }
  return { stdout: typeof resp === "string" ? resp : "", stderr: "", interrupted: false, isImage: false };
}

function dispatchPost(ev, cfg) {
  let output = normalizeOutput(ev.tool_response);
  const before = output.stdout.length;
  let changed = false;
  const trace = [];
  for (const stage of cfg.postStages) {
    const payload = { ...ev, tool_response: output };
    const r = runStage(stage, payload, cfg);
    trace.push({ stage: stage.name, missing: r.missing, failed: r.failed, exit: r.exit ?? null });
    if (r.missing || r.failed || !r.json) continue;
    const upd = r.json.hookSpecificOutput?.updatedToolOutput;
    if (upd === undefined || upd === null) continue;
    if (typeof upd === "string") {
      // Eine Stufe liefert die falsche Form. Übernehmen, aber als Objekt normalisieren,
      // sonst würde Claude Code die Ersetzung verwerfen.
      output = { ...output, stdout: upd };
      changed = true;
      continue;
    }
    output = { ...output, ...normalizeOutput(upd) };
    changed = true;
  }
  if (!changed) return { result: null, trace, savedBytes: 0 };
  const savedBytes = before - output.stdout.length;
  return {
    result: { hookSpecificOutput: { hookEventName: "PostToolUse", updatedToolOutput: output } },
    trace,
    savedBytes,
  };
}

// -------------------------------------------------------------------- Laufzeit
function processEvent(ev, cfg) {
  if (ev?.hook_event_name === "PreToolUse") return dispatchPre(ev, cfg);
  if (ev?.hook_event_name === "PostToolUse") return dispatchPost(ev, cfg);
  return { result: null, trace: [], note: "Event nicht zuständig" };
}

async function readStdin() {
  return new Promise((res) => {
    let d = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => res(d));
    setTimeout(() => res(d), 10_000).unref?.();
  });
}

// ------------------------------------------------------------------ Selbsttest
function selfTest() {
  const results = [];
  const chk = (name, cond) => results.push([name, Boolean(cond)]);
  const cfg = { ...DEFAULTS, metricsEnabled: false, failLoud: false };

  // 1. Kein Stage konfiguriert -> keine Entscheidung
  chk("ohne Stufen keine Entscheidung", processEvent({ hook_event_name: "PreToolUse", tool_input: { command: "ls" } }, cfg).result === null);

  // 2. Fehlende Stufe wird als missing markiert, nicht still verschluckt
  const miss = processEvent(
    { hook_event_name: "PreToolUse", tool_input: { command: "ls" } },
    { ...cfg, preStages: [{ name: "geist", command: "/definitiv/nicht/da.mjs", args: [] }] }
  );
  chk("fehlende Stufe wird als missing gemeldet", miss.trace[0]?.missing === true);
  chk("fehlende Stufe blockiert nicht", miss.result === null);

  // 3. Ausgabeform ist immer ein Objekt
  const norm = normalizeOutput("nur ein string");
  chk("String wird zu Bash-Objektform normalisiert", norm.stdout === "nur ein string" && norm.interrupted === false && "isImage" in norm);

  // 4. Felder bleiben erhalten
  const keep = normalizeOutput({ stdout: "a", stderr: "warn", interrupted: true, isImage: false, exitCode: 3 });
  chk("stderr/interrupted/exitCode bleiben erhalten", keep.stderr === "warn" && keep.interrupted === true && keep.exitCode === 3);

  // 5. Echte Stufen über node -e: deny beendet die Kette
  const denyStage = { name: "deny", command: process.execPath, args: ["-e", `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"nein"}}))`] };
  const rewriteStage = { name: "rewrite", command: process.execPath, args: ["-e", `let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const e=JSON.parse(d);process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PreToolUse",updatedInput:{command:"rtk "+e.tool_input.command}}}))})`] };
  const allowStage = { name: "allow", command: process.execPath, args: ["-e", `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"allow"}}))`] };

  const d1 = processEvent({ hook_event_name: "PreToolUse", tool_input: { command: "cat x" } }, { ...cfg, preStages: [rewriteStage, denyStage] });
  chk("deny beendet die Kette", d1.result?.hookSpecificOutput?.permissionDecision === "deny");

  const d2 = processEvent({ hook_event_name: "PreToolUse", tool_input: { command: "cat x" } }, { ...cfg, preStages: [rewriteStage] });
  chk("updatedInput wird weitergereicht", d2.result?.hookSpecificOutput?.updatedInput?.command === "rtk cat x");

  const d3 = processEvent({ hook_event_name: "PreToolUse", tool_input: { command: "cat x" } }, { ...cfg, preStages: [allowStage] });
  chk("allow wird verworfen", d3.result === null);

  // 6. PostToolUse: Objektform am Ausgang, auch wenn die Stufe einen String liefert
  const strStage = { name: "str", command: process.execPath, args: ["-e", `process.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:"PostToolUse",updatedToolOutput:"kurz"}}))`] };
  const p1 = processEvent({ hook_event_name: "PostToolUse", tool_response: { stdout: "sehr lange ausgabe", stderr: "", interrupted: false, isImage: false } }, { ...cfg, postStages: [strStage] });
  const u = p1.result?.hookSpecificOutput?.updatedToolOutput;
  chk("PostToolUse liefert Objektform", u && typeof u === "object" && u.stdout === "kurz" && "stderr" in u && "interrupted" in u);

  const pass = results.filter(([, ok]) => ok).length;
  for (const [n, ok] of results) console.log(`${ok ? "PASS" : "FAIL"}  ${n}`);
  console.log(`\n${pass}/${results.length} bestanden`);
  return pass === results.length;
}

function status(cfg) {
  const check = (list) =>
    list.map((s) => ({ name: s.name, command: s.command, gefunden: Boolean(s.command && (existsSync(s.command) || !s.command.includes("/"))) }));
  console.log(JSON.stringify({ configPath: CONFIG_PATH, konfiguriert: existsSync(CONFIG_PATH), preStages: check(cfg.preStages), postStages: check(cfg.postStages), timeoutMs: cfg.timeoutMs, metricsFile: cfg.metricsFile }, null, 2));
}

const argv = process.argv.slice(2);
const cfg = loadConfig();
if (argv.includes("--self-test")) process.exit(selfTest() ? 0 : 1);
if (argv.includes("--status")) {
  status(cfg);
  process.exit(0);
}

const raw = await readStdin();
let ev = null;
try {
  ev = JSON.parse(raw);
} catch {
  process.exit(0); // fail-open
}
let out = { result: null, trace: [] };
try {
  out = processEvent(ev, cfg);
} catch (e) {
  process.stderr.write(`bash-owner-dispatch: ${String(e).slice(0, 200)}\n`);
  process.exit(0); // fail-open
}
metric(cfg, {
  event: ev?.hook_event_name,
  tool: ev?.tool_name,
  session: ev?.session_id,
  emitted: Boolean(out.result),
  savedBytes: out.savedBytes ?? null,
  trace: out.trace,
});
if (out.result) process.stdout.write(JSON.stringify(out.result));
process.exit(0);
