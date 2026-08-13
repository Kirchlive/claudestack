#!/usr/bin/env node
// verify-stack.mjs — Paketprüfung. FAIL-LOUD.
//
// WARUM DIESES SKRIPT SO GEBAUT IST
// Im Korpus ist derselbe Musterfehler zweimal aufgetreten:
//   1. ladder-ab.mjs: CONFIG zeigte auf einen Pfad, den es im flachen Layout nicht gab.
//      Arm A schaltete still gar nichts um — beide Arme wären mit aktiver Leiter gelaufen.
//   2. test-guard-all.mjs: GUARD zeigte auf /Users/rob/.claude/hooks/... Fehlt der Pfad,
//      liefert spawnSync kein stdout, decision() faellt auf "" zurueck und die Suite
//      wertet das als "durch". ZEHN Testfaelle bestanden dadurch aus dem falschen Grund.
//
// Regel für dieses Paket: ein Harness, dessen Prüfgegenstand fehlt, MUSS scheitern.
// Nie "ok", nie "übersprungen" — exit 1 mit benanntem Pfad.
//
//   node verify-stack.mjs            prüft das Paket im aktuellen Verzeichnis
//   node verify-stack.mjs --home DIR prüft zusätzlich eine Installation unter DIR/.claude

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/, "");
let fail = 0, pass = 0, loud = [];
const ok = (n) => { pass++; console.log(`PASS  ${n}`); };
const no = (n, why) => { fail++; console.log(`FAIL  ${n}${why ? ` — ${why}` : ""}`); };
const must = (n, cond, why) => (cond ? ok(n) : no(n, why));

// --------------------------------------------------------- 1. Pflichtdateien
const REQUIRED = [
  "KONZEPT-v5.md", "MASTERPLAN.md", "DEFEKTE.md", "README.md",
  "waves/WAVE-INDEX.md", "waves/WAVE-STATE.md",
  "rules/token-efficiency.rules.md", "rules/context-surface-owners.yaml",
  "hooks/bash-owner-dispatch.mjs", "hooks/prefix-budget.mjs",
  "hooks/bash-owner-dispatch.config.example.json", "hooks/hooks.settings.example.json",
  "scripts/verify-stack.mjs", "scripts/repo-audit.py", "scripts/ab-harness.sh",
  "config/settings.patch.json", "config/plugin-diet.md",
  "TASK-STATE.template.md",
];
console.log("— Pflichtdateien —");
for (const f of REQUIRED) {
  const p = join(ROOT, f);
  if (!existsSync(p)) { no(f, "fehlt"); loud.push(`fehlende Datei: ${f}`); }
  else if (statSync(p).size === 0) { no(f, "leer"); loud.push(`leere Datei: ${f}`); }
  else ok(f);
}

// ------------------------------------------------- 2. Syntax aller .mjs / JSON
console.log("\n— Syntax —");
const walk = (d, acc = []) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p, acc); else acc.push(p);
  }
  return acc;
};
for (const p of walk(ROOT)) {
  if (p.endsWith(".mjs")) {
    const r = spawnSync(process.execPath, ["--check", p], { encoding: "utf-8" });
    must(`node --check ${p.slice(ROOT.length + 1)}`, r.status === 0, (r.stderr || "").split("\n")[0]);
  } else if (p.endsWith(".json")) {
    try { JSON.parse(readFileSync(p, "utf-8")); ok(`JSON ${p.slice(ROOT.length + 1)}`); }
    catch (e) { no(`JSON ${p.slice(ROOT.length + 1)}`, String(e).slice(0, 90)); }
  }
}

// ------------------------------------------------------------- 3. Selbsttests
console.log("\n— Selbsttests —");
for (const h of ["hooks/bash-owner-dispatch.mjs", "hooks/prefix-budget.mjs"]) {
  const p = join(ROOT, h);
  if (!existsSync(p)) { no(`${h} --self-test`, "Prüfgegenstand fehlt"); loud.push(`Selbsttest ohne Gegenstand: ${h}`); continue; }
  const r = spawnSync(process.execPath, [p, "--self-test"], { encoding: "utf-8", timeout: 60_000 });
  must(`${h} --self-test`, r.status === 0, `exit ${r.status}`);
}

// -------------------------------------------- 4. Executable-Bit der Shell-Skripte
// Defekt D3 aus dem Vorgängerpaket: Skripte als Git-Modus 100644 ausgeliefert.
console.log("\n— Dateimodi —");
for (const p of walk(ROOT).filter((x) => x.endsWith(".sh"))) {
  const m = statSync(p).mode & 0o111;
  must(`ausführbar: ${p.slice(ROOT.length + 1)}`, m !== 0, "kein Execute-Bit (chmod +x)");
}

// --------------------------------- 5. Manifest gegen tatsächlichen Dateibestand
// Defekt D3, zweiter Teil: SHA256SUMS erwartete README.md, ausgeliefert war README_gpt.md.
console.log("\n— Manifest —");
const manifestPath = join(ROOT, "MANIFEST.json");
if (!existsSync(manifestPath)) no("MANIFEST.json", "fehlt");
else {
  const man = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const listed = new Set(man.files || []);
  const actual = new Set(walk(ROOT).map((p) => p.slice(ROOT.length + 1)).filter((f) => f !== "MANIFEST.json"));
  const missing = [...listed].filter((f) => !actual.has(f));
  const extra = [...actual].filter((f) => !listed.has(f));
  must("jede gelistete Datei existiert", missing.length === 0, `fehlt: ${missing.join(", ")}`);
  must("keine ungelistete Datei", extra.length === 0, `ungelistet: ${extra.join(", ")}`);
}

// ---------------------------- 6. Optionale Installationsprüfung gegen ein HOME
const homeIdx = process.argv.indexOf("--home");
if (homeIdx > -1 && process.argv[homeIdx + 1]) {
  const home = process.argv[homeIdx + 1];
  console.log(`\n— Installation unter ${home} —`);
  const settings = join(home, ".claude", "settings.json");
  if (!existsSync(settings)) { no("settings.json auffindbar", settings); loud.push(`settings.json fehlt: ${settings}`); }
  else {
    ok("settings.json auffindbar");
    let s = null;
    try { s = JSON.parse(readFileSync(settings, "utf-8")); } catch { no("settings.json parsebar"); }
    if (s) {
      ok("settings.json parsebar");
      const env = s.env || {};
      for (const k of ["MAX_MCP_OUTPUT_TOKENS", "BASH_MAX_OUTPUT_LENGTH", "TASK_MAX_OUTPUT_LENGTH", "CLAUDE_CODE_MAX_OUTPUT_TOKENS", "ENABLE_TOOL_SEARCH"]) {
        must(`env.${k} gesetzt`, k in env, "Stufe 1 unvollständig");
      }
      for (const [k, v] of Object.entries(env)) {
        must(`env.${k} ist String`, typeof v === "string", `ist ${typeof v} — Claude Code erwartet String`);
      }
      // Gesetz I gegen die tatsächliche Registrierung
      const r = spawnSync(process.execPath, [join(ROOT, "hooks", "prefix-budget.mjs"), "--json"], { encoding: "utf-8", env: { ...process.env, HOME: home }, timeout: 30_000 });
      if (r.status === 0) {
        try {
          const j = JSON.parse(r.stdout);
          const findings = j.evaluation?.findings ?? j.findings ?? null;
          if (findings === null) { no("prefix-budget --json enthält findings", "Feld fehlt — Auswertung nicht moeglich"); throw new Error("no findings"); }
          const coll = findings.filter((f) => f.includes("Gesetz I"));
          must("keine Gesetz-I-Kollision", coll.length === 0, coll.join(" | "));
        } catch { no("prefix-budget --json auswertbar"); }
      } else no("prefix-budget --json lief durch", `exit ${r.status}`);
    }
  }
}

// ------------------------------------------------------------------- Ergebnis
console.log(`\n${pass} bestanden, ${fail} fehlgeschlagen`);
if (loud.length) {
  console.log("\nFEHLENDE PRÜFGEGENSTÄNDE — diese Prüfungen sind NICHT bestanden, sondern gar nicht gelaufen:");
  for (const l of loud) console.log(`  ! ${l}`);
}
process.exit(fail ? 1 : 0);
