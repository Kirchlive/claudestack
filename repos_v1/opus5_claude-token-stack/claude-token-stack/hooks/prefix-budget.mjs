#!/usr/bin/env node
/**
 * prefix-budget.mjs — Regel R1 aus dem Token-Stack-Konzept v3.
 *
 * Misst beim Sessionstart, was dauerhaft im Prefix liegt: Skills, Plugins,
 * MCP-Server und Instruktionsdateien. Haengt genau eine Zeile an, wenn ein
 * Budget ueberschritten ist. Sonst schweigt es.
 *
 * Eigenschaften:
 *   - read-only: liest nur, schreibt nichts, mutiert nichts
 *   - cache-neutral: SessionStart-additionalContext wird angehaengt, nie im Prefix ersetzt
 *   - stdlib-only, keine Dependencies
 *   - exit 0 auf jedem Pfad; ein Fehler darf nie eine Session blockieren
 *
 * Verwendung:
 *   node prefix-budget.mjs              # Hook-Modus (JSON auf stdout oder nichts)
 *   node prefix-budget.mjs --report     # menschenlesbarer Bericht
 *   node prefix-budget.mjs --json       # vollstaendige Rohdaten
 *   node prefix-budget.mjs --self-test  # Selbsttest gegen ein temporaeres Verzeichnis
 *
 * WICHTIG: Die Tokenzahlen sind Schaetzungen (Zeichen/4 fuer Prosa, plus ein
 * Pauschalwert je Skill-Listing-Eintrag). Sie sind zum Vergleichen gedacht,
 * nicht zum Abrechnen. Der belastbare Wert kommt aus `/context`.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// --------------------------------------------------------------- Konfiguration
const DEFAULTS = {
  // Pauschale je Skill im Listing. Diese Zahl ist eine Sekundaerquellen-Angabe
  // und ausdruecklich die erste, die gegen /context kalibriert werden muss.
  tokensPerSkillListing: 100,
  tokensPerMcpServerGuess: 400, // nur wenn Tool Search nicht greift
  budgets: { skills: 40, plugins: 12, mcpServers: 4, instructionChars: 12000, totalTokens: 12000 },
  maxDepth: 8,
  maxEntries: 20000,
};

function loadConfig(claudeDir) {
  const file = path.join(claudeDir, "prefix-budget.config.json");
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ...DEFAULTS, ...raw, budgets: { ...DEFAULTS.budgets, ...(raw.budgets || {}) } };
  } catch {
    return DEFAULTS;
  }
}

// -------------------------------------------------------------------- Helfer
const estTokens = (chars) => Math.round(chars / 4);

function safeStat(p) { try { return fs.statSync(p); } catch { return null; } }
function safeRead(p) { try { return fs.readFileSync(p, "utf8"); } catch { return null; } }
function safeJson(p) { const t = safeRead(p); if (!t) return null; try { return JSON.parse(t); } catch { return null; } }

/** Sucht Dateien mit gegebenem Basisnamen unter root, tiefen- und mengenbegrenzt. */
function findFiles(root, basename, cfg) {
  const out = [];
  const st = safeStat(root);
  if (!st || !st.isDirectory()) return out;
  const stack = [[root, 0]];
  let seen = 0;
  while (stack.length) {
    const [dir, depth] = stack.pop();
    if (depth > cfg.maxDepth || seen > cfg.maxEntries) break;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      seen++;
      if (seen > cfg.maxEntries) break;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name === ".git" || e.name.startsWith(".venv")) continue;
        stack.push([full, depth + 1]);
      } else if (e.isFile() && e.name === basename) {
        out.push(full);
      }
    }
  }
  return out;
}

/** Liest den `name:`-Wert aus dem YAML-Frontmatter einer SKILL.md. */
function skillName(file) {
  const text = safeRead(file);
  if (text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (m) {
      const n = m[1].match(/^name:\s*(.+)$/m);
      if (n) return n[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return path.basename(path.dirname(file));
}

// ------------------------------------------------------------------ Erhebung
function collect(claudeDir, projectDir, cfg) {
  const r = {
    claudeDir, projectDir,
    skills: [], duplicateSkills: [], plugins: [], marketplaces: [],
    mcpServers: [], instructions: [], hooks: [],
    notes: [],
  };

  // --- Skills
  const skillRoots = [
    path.join(claudeDir, "skills"),
    path.join(claudeDir, "plugins"),
    projectDir ? path.join(projectDir, ".claude", "skills") : null,
  ].filter(Boolean);
  const byName = new Map();
  for (const root of skillRoots) {
    for (const f of findFiles(root, "SKILL.md", cfg)) {
      const n = skillName(f);
      r.skills.push({ name: n, file: f });
      if (byName.has(n)) r.duplicateSkills.push(n); else byName.set(n, f);
    }
  }
  r.uniqueSkillCount = byName.size;

  // --- Plugins / Marketplaces
  const settings = safeJson(path.join(claudeDir, "settings.json")) || {};
  const enabled = settings.enabledPlugins || {};
  for (const [k, v] of Object.entries(enabled)) {
    if (v === false) continue;
    r.plugins.push(k);
    const at = k.lastIndexOf("@");
    if (at > 0) r.marketplaces.push(k.slice(at + 1));
  }
  r.marketplaces = [...new Set(r.marketplaces)];

  // --- MCP-Server (global und projektlokal)
  const mcpSources = [
    ["settings.json", settings.mcpServers],
    [".mcp.json (global)", (safeJson(path.join(claudeDir, ".mcp.json")) || {}).mcpServers],
    projectDir ? [".mcp.json (Projekt)", (safeJson(path.join(projectDir, ".mcp.json")) || {}).mcpServers] : null,
  ].filter(Boolean);
  for (const [src, obj] of mcpSources) {
    for (const name of Object.keys(obj || {})) r.mcpServers.push({ name, source: src });
  }

  // --- Instruktionsdateien
  for (const p of [
    path.join(claudeDir, "CLAUDE.md"),
    projectDir ? path.join(projectDir, "CLAUDE.md") : null,
    projectDir ? path.join(projectDir, ".claude", "CLAUDE.md") : null,
  ].filter(Boolean)) {
    const st = safeStat(p);
    if (st && st.isFile()) r.instructions.push({ file: p, chars: st.size });
  }

  // --- Hooks: nur zaehlen, wer auf welcher Flaeche registriert ist (Gesetz I)
  const hookCfg = settings.hooks || {};
  for (const [event, arr] of Object.entries(hookCfg)) {
    if (!Array.isArray(arr)) continue;
    for (const group of arr) {
      const matcher = group?.matcher || "*";
      for (const h of group?.hooks || []) {
        r.hooks.push({ event, matcher, command: String(h?.command || "").slice(0, 160) });
      }
    }
  }

  return r;
}

// ------------------------------------------------------------------ Bewertung
function evaluate(r, cfg) {
  const instrChars = r.instructions.reduce((a, x) => a + x.chars, 0);
  const skillTokens = r.uniqueSkillCount * cfg.tokensPerSkillListing;
  const instrTokens = estTokens(instrChars);
  const mcpTokens = r.mcpServers.length * cfg.tokensPerMcpServerGuess;
  const total = skillTokens + instrTokens + mcpTokens;

  const findings = [];
  const b = cfg.budgets;
  if (r.uniqueSkillCount > b.skills)
    findings.push(`${r.uniqueSkillCount} Skills im Listing (Budget ${b.skills}, geschätzt ~${skillTokens} Token pro Runde)`);
  if (r.plugins.length > b.plugins)
    findings.push(`${r.plugins.length} aktive Plugins aus ${r.marketplaces.length} Marketplaces (Budget ${b.plugins})`);
  if (r.mcpServers.length > b.mcpServers)
    findings.push(`${r.mcpServers.length} MCP-Server registriert (Budget ${b.mcpServers}) — global registrierte Server invalidieren bei Reconnect den Prefix`);
  if (instrChars > b.instructionChars)
    findings.push(`Instruktionsdateien ${instrChars} Zeichen (Budget ${b.instructionChars}, geschätzt ~${instrTokens} Token)`);
  if (r.duplicateSkills.length)
    findings.push(`${new Set(r.duplicateSkills).size} Skill-Namenskollision(en): ${[...new Set(r.duplicateSkills)].slice(0, 5).join(", ")}`);

  // Gesetz I: mehrere mutierende Hooks auf derselben Flaeche
  //
  // FIX D1 (2026-08-13): die Vorfassung gruppierte auf dem ROHEN Matcher-String.
  // Damit galten "Bash" und "Bash|Read|Grep|Glob|Agent|Task" als zwei verschiedene
  // Flaechen, obwohl beide auf Bash feuern. Auf der real vorliegenden Konfiguration
  // meldete das Werkzeug 2 statt 3 Handler auf PreToolUse:Bash — genau die Kollision,
  // die es finden soll, wurde unterzaehlt.
  //
  // Jetzt wird der Matcher in die Menge der Tools aufgeloest, auf die er tatsaechlich
  // feuert, und je Tool gezaehlt. Regeln nach Doku:
  //   "*" | "" | fehlend             -> alle Tools
  //   nur [A-Za-z0-9_\- ,|]           -> exakte Liste, getrennt durch | oder ,
  //   alles andere                    -> JavaScript-Regex, unverankert
  const KNOWN_TOOLS = ["Bash", "Read", "Edit", "Write", "MultiEdit", "Glob", "Grep",
                       "Task", "Agent", "WebFetch", "WebSearch", "NotebookEdit", "Skill", "TodoWrite"];
  function matcherToTools(m) {
    const raw = (m ?? "").trim();
    if (raw === "" || raw === "*") return ["*"];
    if (/^[A-Za-z0-9_\-, |]+$/.test(raw)) {
      return raw.split(/[|,]/).map((s) => s.trim()).filter(Boolean);
    }
    let re;
    try { re = new RegExp(raw); } catch { return [raw]; }
    const hits = KNOWN_TOOLS.filter((t) => re.test(t));
    return hits.length ? hits : [raw];
  }
  const surfaces = new Map();      // "Event:Tool" -> [command, ...]
  for (const h of r.hooks) {
    if (!/^(PreToolUse|PostToolUse)$/.test(h.event)) continue;
    for (const tool of matcherToTools(h.matcher)) {
      const key = `${h.event}:${tool}`;
      if (!surfaces.has(key)) surfaces.set(key, []);
      surfaces.get(key).push(h.command);
    }
  }
  // Wildcard-Handler zaehlen auf jede konkrete Flaeche mit
  const wildcards = new Map();
  for (const [key, cmds] of surfaces) {
    const [event, tool] = key.split(":");
    if (tool === "*") wildcards.set(event, cmds);
  }
  for (const [key, cmds] of surfaces) {
    const [event, tool] = key.split(":");
    if (tool === "*") continue;
    const all = [...new Set([...cmds, ...(wildcards.get(event) || [])])];
    if (all.length > 1)
      findings.push(`${all.length} Hooks auf ${event}:${tool} — parallele Ausführung, Ergebnis nicht komponierbar (Gesetz I)`);
  }
  for (const [event, cmds] of wildcards) {
    const uniq = [...new Set(cmds)];
    if (uniq.length > 1) findings.push(`${uniq.length} Wildcard-Hooks auf ${event}:* (Gesetz I)`);
  }

  return { skillTokens, instrTokens, instrChars, mcpTokens, total, findings, overBudget: total > b.totalTokens || findings.length > 0 };
}

// -------------------------------------------------------------------- Ausgabe
function emitHook(ev) {
  if (!ev.overBudget) return;
  const msg =
    "Prefix-Budget überschritten (~" + ev.total + " geschätzte Token pro Runde): " +
    ev.findings.join(" · ") +
    ". Prüfe mit /context, bevor du Werkzeuge hinzufügst.";
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: msg },
  }));
}

function report(r, ev) {
  const L = [];
  L.push("Prefix-Budget");
  L.push("=".repeat(60));
  L.push(`Skills (eindeutig)      ${r.uniqueSkillCount}   (~${ev.skillTokens} Token geschätzt)`);
  L.push(`Skill-Dateien gesamt    ${r.skills.length}`);
  L.push(`Aktive Plugins          ${r.plugins.length} aus ${r.marketplaces.length} Marketplaces`);
  L.push(`MCP-Server              ${r.mcpServers.length}   (~${ev.mcpTokens} Token geschätzt, sofern Tool Search nicht greift)`);
  L.push(`Instruktionsdateien     ${ev.instrChars} Zeichen (~${ev.instrTokens} Token)`);
  L.push(`Registrierte Hooks      ${r.hooks.length}`);
  L.push("-".repeat(60));
  L.push(`Geschätzt gesamt        ~${ev.total} Token pro Runde`);
  L.push("");
  if (ev.findings.length) {
    L.push("Befunde:");
    for (const f of ev.findings) L.push("  - " + f);
  } else {
    L.push("Keine Budgetüberschreitung.");
  }
  L.push("");
  L.push("Schätzung. Der belastbare Wert kommt aus /context — vorher und nachher, gleiche Aufgabe.");
  return L.join("\n");
}

// ------------------------------------------------------------------ Selbsttest
function selfTest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prefix-budget-"));
  const claude = path.join(tmp, ".claude");
  fs.mkdirSync(path.join(claude, "skills", "alpha"), { recursive: true });
  fs.mkdirSync(path.join(claude, "skills", "beta"), { recursive: true });
  fs.writeFileSync(path.join(claude, "skills", "alpha", "SKILL.md"), "---\nname: alpha\n---\nx");
  fs.writeFileSync(path.join(claude, "skills", "beta", "SKILL.md"), "---\nname: beta\n---\nx");
  fs.writeFileSync(path.join(claude, "CLAUDE.md"), "y".repeat(500));
  fs.writeFileSync(path.join(claude, "settings.json"), JSON.stringify({
    enabledPlugins: { "p1@m1": true, "p2@m1": false },
    mcpServers: { s1: {}, s2: {} },
    hooks: {
      PostToolUse: [{ matcher: "Bash", hooks: [{ command: "a.mjs" }, { command: "b.mjs" }] }],
    },
  }));

  const cfg = { ...DEFAULTS, budgets: { skills: 1, plugins: 99, mcpServers: 99, instructionChars: 999999, totalTokens: 999999 } };
  const r = collect(claude, null, cfg);
  const ev = evaluate(r, cfg);

  const checks = [
    ["zwei Skills gefunden", r.uniqueSkillCount === 2],
    ["nur aktivierte Plugins gezählt", r.plugins.length === 1],
    ["MCP-Server gefunden", r.mcpServers.length === 2],
    ["CLAUDE.md vermessen", ev.instrChars === 500],
    ["Skill-Budget schlägt an", ev.findings.some((f) => f.includes("Skills im Listing"))],
    ["Gesetz-I-Kollision erkannt", ev.findings.some((f) => f.includes("PostToolUse:Bash"))],
    ["overBudget gesetzt", ev.overBudget === true],
  ];
  let ok = true;
  for (const [name, pass] of checks) {
    if (!pass) ok = false;
    console.log(`${pass ? "PASS" : "FAIL"}  ${name}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(ok ? "\nSelbsttest bestanden." : "\nSelbsttest fehlgeschlagen.");
  return ok ? 0 : 1;
}

// ---------------------------------------------------------------------- main
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--self-test")) return selfTest();

  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const cfg = loadConfig(claudeDir);
  const r = collect(claudeDir, projectDir, cfg);
  const ev = evaluate(r, cfg);

  if (argv.includes("--json")) { console.log(JSON.stringify({ ...r, evaluation: ev }, null, 1)); return 0; }
  if (argv.includes("--report")) { console.log(report(r, ev)); return 0; }
  emitHook(ev);
  return 0;
}

try {
  process.exitCode = main();
} catch (err) {
  // Ein Waechter darf niemals eine Session blockieren.
  if (process.argv.includes("--report") || process.argv.includes("--self-test")) {
    console.error("prefix-budget: " + (err && err.message));
  }
  process.exitCode = 0;
}
