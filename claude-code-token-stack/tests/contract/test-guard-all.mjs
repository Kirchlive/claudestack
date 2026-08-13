#!/usr/bin/env node
// Kontrakt-Suite der beobachtenden Hooks: ctx-used-marker.mjs · bash-size-feedback.mjs
//
// Herkunft und Zuschnitt (AP-4.5)
// -------------------------------
// Im Quellpaket pruefte diese Suite zusaetzlich hooks/bash-dump-gate.mjs, das
// PreToolUse-Deny-Gate. Dieser Hook ist NICHT uebernommen (verworfen laut
// Datei-Arbeitsliste; die Deny-Gate-Frage bleibt eine getrennte Policy-
// Entscheidung im Quellrepo). Alle daran haengenden Faelle — Regel A/B,
// Pipeline-Erkennung, Unlock, Begruendungstexte, rtk-Erkennung — sind hier
// ersatzlos entfallen und nicht etwa stillgelegt.
//
// Der Grund fuer die Neufassung ist ein Defekt der D2-Klasse: die alte
// Hilfsfunktion t() wertete ausschliesslich das stdout-JSON aus und pruefte den
// Spawn-Status nie. Da bash-dump-gate.mjs im Zielpaket fehlt, lieferte jeder
// Aufruf Exitcode 1 und leeres stdout — was die Suite als "durch" las. 31 von
// 40 PASS-Zeilen bezogen sich damit auf einen Hook, den es nicht gibt.
// Konsequenz hier: JEDER Spawn wird auf Startfehler und Exitcode geprueft
// (runHook), und fehlende Pruefgegenstaende brechen die Suite vorab ab (L-6).
//
// Als Datei ausfuehren, damit das aufrufende Bash-Kommando keine Trigger-Muster
// enthaelt. Pfade sind relativ zu dieser Datei und per Env ueberschreibbar
// (MARKER_PATH/SIZE_PATH).

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { markerFile } from "../../hooks/optional/lib/nudge-budget.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const HOOKS = resolve(HERE, "..", "..", "hooks", "optional");
const MARKER = process.env.MARKER_PATH || join(HOOKS, "ctx-used-marker.mjs");
const SIZE = process.env.SIZE_PATH || join(HOOKS, "bash-size-feedback.mjs");

// Fail-loud: fehlende Pruefgegenstaende werden benannt und beenden die Suite.
// Genau das fehlte vorher — ein abwesender Hook zaehlte als bestanden.
const REQUIRED = [["ctx-used-marker.mjs", MARKER], ["bash-size-feedback.mjs", SIZE]];
const missing = REQUIRED.filter(([, file]) => !existsSync(file));
if (missing.length) {
  console.error(`FEHLENDE PRUEFGEGENSTAENDE: ${missing.map(([name]) => name).join(", ")}`);
  console.error(`erwartet unter: ${HOOKS}`);
  process.exit(1);
}

// Eigenes HOME und eigenes Nudge-Budget je Lauf: die Suite darf weder die
// Konfiguration der Maschine lesen noch das Budget echter Sitzungen verbrauchen.
const SANDBOX = mkdtempSync(join(tmpdir(), "guard-suite-"));
const BUDGET_DIR = join(SANDBOX, "nudge-budget");
const ENV = { ...process.env, HOME: SANDBOX, CLAUDE_CONFIG_DIR: join(SANDBOX, ".claude"), NUDGE_BUDGET_DIR: BUDGET_DIR };

let fail = 0;
const chk = (name, cond) => { if (!cond) fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); };

/**
 * Startet einen Hook und prueft dabei, dass er ueberhaupt lief. Ein Startfehler
 * oder ein Exitcode != 0 ist ein Befund, kein stilles "kein Ergebnis".
 */
function runHook(file, payload, extraEnv = {}) {
  const result = spawnSync(process.execPath, [file], {
    input: typeof payload === "string" ? payload : JSON.stringify(payload),
    encoding: "utf-8",
    env: { ...ENV, ...extraEnv }
  });
  if (result.error) return { ok: false, why: `Start fehlgeschlagen: ${result.error.message}`, stdout: "" };
  if (result.status !== 0) return { ok: false, why: `Exit ${result.status}: ${(result.stderr || "").trim()}`, stdout: "" };
  return { ok: true, why: "", stdout: result.stdout || "" };
}

const mark = (tool, sid, env) => runHook(MARKER, { tool_name: tool, session_id: sid }, env);
const post = (cmd, out, sid, env) => runHook(SIZE, {
  tool_name: "Bash", session_id: sid, tool_input: { command: cmd }, tool_response: { stdout: out }
}, env);

/** Hinweis erkannt = Hook lief sauber UND hat Kontext injiziert.
 *  Geprueft wird der Hook-Vertrag (additionalContext), nicht der Wortlaut: die
 *  Vorgaengerfassung suchte nach "ToolSearch" und damit nach der Empfehlung eines
 *  konkreten MCP-Werkzeugs. Seit der Sandbox-Verweis konfigurierbar ist (L-8,
 *  Abnahmebefund M-8), erscheint der nur mit gesetztem CLAUDESTACK_SANDBOX_TOOL —
 *  der Test haette also die Lizenzbereinigung als Defekt gemeldet. */
const hinted = (r) => { if (!r.ok) { console.log(`      ↳ ${r.why}`); return false; } return r.stdout.includes("additionalContext"); };

/* Pfad ueber dieselbe Funktion wie der Hook, nicht als Literal dupliziert: sonst prueft
 * die Suite ihre eigene Kopie des Pfades statt den Vertrag und geht beim naechsten
 * Umzug gruen durch, waehrend Schreiber und Leser auseinanderlaufen. */
const markerPath = (sid) => markerFile(sid, "ctx-used", { configDir: ENV.CLAUDE_CONFIG_DIR });
const cleanMarker = (sid) => { try { unlinkSync(markerPath(sid)); } catch { /* nie angelegt */ } };
const freshBudget = () => rmSync(BUDGET_DIR, { recursive: true, force: true });

const small = "x".repeat(500);
const big = "y".repeat(12000);

try {
  console.log("— Marker —");
  for (const [name, tool, sid, want] of [
    ["Marker bei plugin-ctx", "mcp__plugin_context-mode_context-mode__ctx_execute", "m1", true],
    ["Marker bei tokless-ctx", "mcp__context-mode__ctx_search", "m2", true],
    ["kein Marker bei Bash", "Bash", "m3", false]
  ]) {
    cleanMarker(sid);
    const r = mark(tool, sid);
    chk(`${name} (Hook lief)`, r.ok);
    chk(name, existsSync(markerPath(sid)) === want);
    cleanMarker(sid);
  }

  console.log("\n— PostToolUse: Groessen-Feedback —");
  freshBudget(); cleanMarker("f1");
  const s1 = post("ls /tmp", small, "f1", { NUDGE_BUDGET_MAX: "5" });
  chk("kleine Ausgabe: Hook lief", s1.ok);
  chk("kleine Ausgabe: still", s1.stdout === "");

  freshBudget(); cleanMarker("f2");
  const h1 = post("ls -R /", big, "f2", { NUDGE_BUDGET_MAX: "5" });
  chk("grosse Ausgabe: Hinweis", hinted(h1));
  chk("Hinweis nennt die Zeichenzahl", h1.stdout.includes("12000"));
  // L-8: ohne konfiguriertes Sandbox-Werkzeug wirbt der Hinweis fuer nichts.
  chk("Hinweis nennt ohne Konfiguration kein MCP-Werkzeug",
      !h1.stdout.includes("ToolSearch") && !h1.stdout.includes("context-mode"));
  chk("Hinweis nennt die Tokenschaetzung", h1.stdout.includes("4000"));
  chk("2. grosse Ausgabe: noch ein Hinweis", hinted(post("ls -R /", big, "f2", { NUDGE_BUDGET_MAX: "5" })));
  chk("3. grosse Ausgabe: still (eigener Deckel MAX_HINTS=2)", !hinted(post("ls -R /", big, "f2", { NUDGE_BUDGET_MAX: "5" })));

  // Gegenprobe zur Lizenzbereinigung: mit konfiguriertem Werkzeug erscheint der Verweis wieder.
  // Eigene Session und eigenes Budget, damit die Zaehlung oben unberuehrt bleibt.
  freshBudget(); cleanMarker("f1b");
  const hCfg = post("ls -R /", big, "f1b", { NUDGE_BUDGET_MAX: "5", CLAUDESTACK_SANDBOX_TOOL: "mcp__demo__run" });
  chk("mit CLAUDESTACK_SANDBOX_TOOL: Werkzeug wird genannt",
      hCfg.stdout.includes("ToolSearch") && hCfg.stdout.includes("mcp__demo__run"));

  freshBudget(); cleanMarker("f3");
  mark("mcp__plugin_context-mode_context-mode__ctx_execute", "f3");
  chk("ctx benutzt: nie ein Hinweis", !hinted(post("ls -R /", big, "f3", { NUDGE_BUDGET_MAX: "5" })));
  cleanMarker("f3");

  freshBudget(); cleanMarker("f4");
  chk("git push: kein Hinweis trotz Groesse", !hinted(post("git push origin main", big, "f4", { NUDGE_BUDGET_MAX: "5" })));
  chk("npm install: kein Hinweis", !hinted(post("npm install", big, "f4", { NUDGE_BUDGET_MAX: "5" })));

  freshBudget(); cleanMarker("f5");
  chk("git diff: Hinweis (der blinde Fleck)", hinted(post("git diff HEAD~5", big, "f5", { NUDGE_BUDGET_MAX: "5" })));
  freshBudget(); cleanMarker("f6");
  chk("docker logs: Hinweis", hinted(post("docker logs api", big, "f6", { NUDGE_BUDGET_MAX: "5" })));

  console.log("\n— Gemeinsames Nudge-Budget (AP-4.5) —");
  freshBudget(); cleanMarker("n1");
  chk("Budget 1: erster Hinweis wird gewaehrt", hinted(post("ls -R /", big, "n1", { NUDGE_BUDGET_MAX: "1" })));
  chk("Budget 1: zweiter Hinweis faellt aus, obwohl eigener Deckel reichte",
    !hinted(post("docker logs api", big, "n1", { NUDGE_BUDGET_MAX: "1" })));
  freshBudget(); cleanMarker("n2");
  chk("Budget 0: gar kein Hinweis", !hinted(post("ls -R /", big, "n2", { NUDGE_BUDGET_MAX: "0" })));

  console.log("\n— Fail-open —");
  const brokenSize = runHook(SIZE, "nope");
  chk("Feedback: kaputtes JSON laeuft sauber durch", brokenSize.ok);
  chk("Feedback: kaputtes JSON still", brokenSize.stdout === "");
  const brokenMarker = runHook(MARKER, "nope");
  chk("Marker: kaputtes JSON laeuft sauber durch", brokenMarker.ok);
  const foreign = post("ls /tmp", big, "x1", { NUDGE_BUDGET_MAX: "5" });
  chk("fremdes Tool: Hook lief", foreign.ok);

  console.log("\n— Beobachterstatus (L-1/R8) —");
  const anyOutput = post("ls -R /", big, "o1", { NUDGE_BUDGET_MAX: "5" }).stdout;
  chk("kein permissionDecision", !anyOutput.includes("permissionDecision"));
  chk("kein updatedToolOutput", !anyOutput.includes("updatedToolOutput"));
  chk("kein updatedInput", !anyOutput.includes("updatedInput"));
} finally {
  for (const sid of ["m1", "m2", "m3", "f1", "f2", "f3", "f4", "f5", "f6", "n1", "n2", "x1", "o1"]) cleanMarker(sid);
  rmSync(SANDBOX, { recursive: true, force: true });
}

console.log(fail ? `\n${fail} FEHLGESCHLAGEN` : `\nALLE PRUEFUNGEN BESTANDEN`);
process.exit(fail ? 1 : 0);
