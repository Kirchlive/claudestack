// Gesamtsuite: bash-dump-gate.mjs (PreToolUse-Gate) · ctx-used-marker.mjs · bash-size-feedback.mjs
// Als Datei ausfuehren, damit das aufrufende Bash-Kommando keine Trigger-Muster enthaelt.
//
// Paket-Uebernahme: Pfade sind relativ zu dieser Datei (../<hook>) und per
// Env ueberschreibbar (GUARD_PATH/MARKER_PATH/SIZE_PATH) — keine hartcodierten
// Nutzerpfade mehr. Hinweis: Das Paket enthaelt zwei verschiedene Guards unter
// aehnlichem Namen — diese Suite prueft das PreToolUse-Gate (bash-dump-gate.mjs),
// NICHT den PostToolUse-Kompressor (bash-dump-guard.mjs, eigener Self-Test).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, unlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GUARD = process.env.GUARD_PATH || join(HERE, "..", "bash-dump-gate.mjs");
const MARKER = process.env.MARKER_PATH || join(HERE, "..", "ctx-used-marker.mjs");
const SIZE = process.env.SIZE_PATH || join(HERE, "..", "bash-size-feedback.mjs");
const BIG = 9000;
const READ = ".read(" + BIG + ")"; // zusammengesetzt, sonst blockt der Guard diese Datei
const UNLOCK = "/tmp/bash-dump-unlock";

// Fixture-HOME mit registriertem rtk-Hook: Regel A laesst cat/grep/... nur dann
// durch, wenn ein rtk-hook als PreToolUse registriert ist (fail-safe sonst).
// Die Original-Suite las die echte settings.json der Maschine mit; das Paket ist
// portabel und baut die Erwartung als Fixture nach. Der Block "rtk-Erkennung"
// am Ende nutzt weiterhin sein eigenes HOME und prueft beide Richtungen.
const FIXTURE_HOME = mkdtempSync(join(tmpdir(), "guard-fixture-home-"));
mkdirSync(join(FIXTURE_HOME, ".claude"), { recursive: true });
writeFileSync(join(FIXTURE_HOME, ".claude", "settings.json"), JSON.stringify({
  hooks: { PreToolUse: [{ hooks: [{ command: "/x/tokless rtk-hook claude" }] }] }
}));
const ENV = { ...process.env, HOME: FIXTURE_HOME };

let n = 0, fail = 0;
const clean = (sid) => {
  for (const p of ["ctx-used", "ctx-nudged", "ctx-size-hint"]) {
    try { unlinkSync(`/tmp/${p}-${sid}`); } catch {}
  }
};
const call = (cmd, sid) => spawnSync("node", [GUARD], {
  input: JSON.stringify({ tool_name: "Bash", session_id: sid, tool_input: { command: cmd } }), encoding: "utf-8", env: ENV });
const mark = (tool, sid) => spawnSync("node", [MARKER], {
  input: JSON.stringify({ tool_name: tool, session_id: sid }), encoding: "utf-8", env: ENV });
const post = (cmd, out, sid) => spawnSync("node", [SIZE], {
  input: JSON.stringify({ tool_name: "Bash", session_id: sid,
    tool_input: { command: cmd }, tool_response: { stdout: out } }), encoding: "utf-8", env: ENV });

// Seit der Umstellung auf permissionDecision steckt die Entscheidung im
// stdout-JSON, nicht mehr im Exitcode — der ist jetzt immer 0.
const decision = (r) => {
  try { return JSON.parse(r.stdout || "{}").hookSpecificOutput?.permissionDecision || ""; }
  catch { return ""; }
};
const reason = (r) => {
  try { return JSON.parse(r.stdout || "{}").hookSpecificOutput?.permissionDecisionReason || ""; }
  catch { return ""; }
};

function t(cmd, want) {
  const sid = "t" + ++n; clean(sid);
  const r = call(cmd, sid);
  const got = decision(r) === "deny" ? "BLOCK" : "durch";
  const ok = got === want;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${got.padEnd(5)} (soll ${want.padEnd(5)})  ${cmd.slice(0, 56)}`);
  clean(sid);
}
const chk = (name, cond) => { if (!cond) fail++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}`); };
const hinted = (r) => r.status === 0 && (r.stdout || "").includes("ToolSearch");

console.log("— Regel A: rtk hat Vortritt, solange keine Pipe im Spiel ist —");
for (const c of ["cat f.txt", "head -20 f.txt", "tail -50 f.txt", "grep -rn x src/",
                 "rg x src/", "find . -name '*.ts'", "wc -l f.txt",
                 "cd /tmp && cat f.txt", "true; cat f.txt", "head -c 1400 f.txt"]) t(c, "durch");

console.log("\n— Regel A: mit Pipe weicht rtk zurueck, der Guard uebernimmt —");
for (const c of ["cat a.txt | sort", "grep -rn x src/ | uniq", "find . -name x | wc -l",
                 "cat app.log | awk '{print $1}' | sort"]) t(c, "BLOCK");

console.log("\n— Shell-Syntax in Anfuehrungszeichen ist Nutzlast, keine Struktur —");
for (const c of ['grep -nE "A|B" /tmp/f.txt', "grep -n 'x|y' /tmp/f.txt",
                 'find . -name "*.a|b"', 'cat "a|b.txt"',
                 'echo "x; cat y"', "grep -rn 'a&&b' src/"]) t(c, "durch");
t('grep -nE "A|B" /tmp/f.txt | sort', "BLOCK"); // Pipe ausserhalb zaehlt weiter

console.log("\n— Regel B: Groesse blockt unbedingt —");
t("head -c " + BIG + " bin", "BLOCK");
t("head -n 2000 app.log", "BLOCK");
t("dd if=bin bs=" + BIG + " count=1", "BLOCK");
t("python3 -c \"\\nf=open('x')\\nprint(f" + READ + ")\\n\"", "BLOCK");
t("node -e \"x" + READ + "\"", "BLOCK");
t("head -n 40 app.log", "durch");

console.log("\n— kein Vorab-Nudge mehr: Pipelines laufen durch —");
for (const c of ["ps aux | grep node", "du -sh /tmp | sort -h", "ls /tmp | wc -l",
                 "journalctl | awk '{print $1}'", "git log --oneline | sort",
                 "ls -la /tmp", "git status --short", "git push", "pwd",
                 "node -e 'console.log(1)'", "rtk ls /tmp", "rtk grep foo | sort"]) t(c, "durch");

console.log("\n— Heredoc-Prosa loest nichts aus —");
t("python3 - <<'EOF'\\n# grep and cat are mentioned\\nprint(1)\\nEOF", "durch");

console.log("\n— Fail-open —");
chk("Guard: kaputtes JSON durch", spawnSync("node", [GUARD], { input: "nope", encoding: "utf-8" }).status === 0);
chk("Guard: fremdes Tool durch", spawnSync("node", [GUARD], {
  input: JSON.stringify({ tool_name: "Read", tool_input: { file_path: "/x" } }), encoding: "utf-8" }).status === 0);
chk("Feedback: kaputtes JSON still", spawnSync("node", [SIZE], { input: "nope", encoding: "utf-8" }).stdout === "");
t("", "durch");

console.log("\n— Marker —");
clean("m1"); mark("mcp__plugin_context-mode_context-mode__ctx_execute", "m1");
chk("Marker bei plugin-ctx", existsSync("/tmp/ctx-used-m1"));
clean("m2"); mark("mcp__context-mode__ctx_search", "m2");
chk("Marker bei tokless-ctx", existsSync("/tmp/ctx-used-m2"));
clean("m3"); mark("Bash", "m3");
chk("kein Marker bei Bash", !existsSync("/tmp/ctx-used-m3"));

console.log("\n— PostToolUse: Groessen-Feedback —");
const small = "x".repeat(500), big = "y".repeat(12000);
clean("f1");
chk("kleine Ausgabe: still", post("ls /tmp", small, "f1").stdout === "");
clean("f2");
const h1 = post("ls -R /", big, "f2");
chk("grosse Ausgabe: Hinweis", hinted(h1));
chk("Hinweis nennt die Zeichenzahl", (h1.stdout || "").includes("12000"));
chk("Hinweis nennt die Tokenschaetzung", (h1.stdout || "").includes("4000"));
chk("2. grosse Ausgabe: noch ein Hinweis", hinted(post("ls -R /", big, "f2")));
chk("3. grosse Ausgabe: still", !hinted(post("ls -R /", big, "f2")));
clean("f3"); mark("mcp__plugin_context-mode_context-mode__ctx_execute", "f3");
chk("ctx benutzt: nie ein Hinweis", !hinted(post("ls -R /", big, "f3")));
clean("f4");
chk("git push: kein Hinweis trotz Groesse", !hinted(post("git push origin main", big, "f4")));
chk("npm install: kein Hinweis", !hinted(post("npm install", big, "f4")));
clean("f5");
chk("git diff: Hinweis (der blinde Fleck)", hinted(post("git diff HEAD~5", big, "f5")));
clean("f6");
chk("docker logs: Hinweis", hinted(post("docker logs api", big, "f6")));

console.log("\n— Unlock —");
clean("u1"); writeFileSync(UNLOCK, "");
chk("Unlock unterdrueckt harte Regel", decision(call("cat a.txt | sort", "u1")) === "");
const alt = new Date("2026-01-01T00:00:00Z"); utimesSync(UNLOCK, alt, alt);
clean("u2");
chk("abgelaufener Unlock blockt wieder", decision(call("cat a.txt | sort", "u2")) === "deny");
chk("abgelaufener Unlock wurde geloescht", !existsSync(UNLOCK));

console.log("\n— Entscheidungsform —");
chk("Block ist deny, nicht exit 2", (() => { const r = call("cat a.txt | sort", "d1");
  return r.status === 0 && decision(r) === "deny"; })());
chk("Durchlass ohne Entscheidungsobjekt", (() => { const r = call("git status --short", "d2");
  return r.status === 0 && (r.stdout || "") === ""; })());

console.log("\n— Begruendungen —");
const g = reason(call("grep -rn x src/ | uniq", "b1"));
chk("grep nennt Grep tool", g.includes("Grep tool"));
chk("jede Begruendung nennt ToolSearch", g.includes('ToolSearch({query: "select:'));
chk("jede Begruendung nennt Override", g.includes(UNLOCK));
chk("grep nennt rtk als Ausweichweg", g.includes("rtk grep"));
const f = reason(call("find . -name x | wc -l", "b2"));
chk("find nennt Glob tool", f.includes("Glob tool"));
chk("find nennt rtk als Ausweichweg", f.includes("rtk find"));
const k = reason(call("cat a.txt | sort && node -e \"y" + READ + "\"", "b3"));
chk("Kombitreffer meldet Name UND Groesse", k.includes("'cat'") && k.includes("raw bytes"));

// ─── Regel A haengt am rtk-Hook, nicht am tokless-Binary ───
// Bis 2026-08-10 prüfte der Guard `existsSync(tokless)`. Nimmt man rtk aus der
// tokless-Toolauswahl, bleibt das Binary liegen — Regel A liess `cat`/`grep`
// weiter durch, obwohl sie niemand mehr umschrieb. Diese drei Faelle sind der
// Beleg, dass die Freigabe jetzt an der Hook-Registrierung haengt.
console.log("\n-- Regel A: rtk-Erkennung --");
const fakeHome = mkdtempSync(join(tmpdir(), "guard-home-"));
mkdirSync(join(fakeHome, ".claude"), { recursive: true });
const settingsAt = (obj) =>
  writeFileSync(join(fakeHome, ".claude", "settings.json"), JSON.stringify(obj));
const callWithHome = (cmd) => spawnSync("node", [GUARD], {
  input: JSON.stringify({ tool_name: "Bash", session_id: "rtk1", tool_input: { command: cmd } }),
  encoding: "utf-8", env: { ...process.env, HOME: fakeHome } });

settingsAt({ hooks: { PreToolUse: [{ hooks: [{ command: "/x/tokless rtk-hook claude" }] }] } });
chk("rtk-Hook registriert -> cat geht durch",
  decision(callWithHome("cat /tmp/x.txt")) !== "deny");

settingsAt({ hooks: { PreToolUse: [{ hooks: [{ command: "/x/other-hook.mjs" }] }] } });
chk("rtk-Hook fehlt -> cat wird geblockt",
  decision(callWithHome("cat /tmp/x.txt")) === "deny");

rmSync(join(fakeHome, ".claude", "settings.json"));
chk("settings.json unlesbar -> fail-safe, cat wird geblockt",
  decision(callWithHome("cat /tmp/x.txt")) === "deny");
rmSync(fakeHome, { recursive: true, force: true });
clean("rtk1");

for (const s of ["m1","m2","m3","f1","f2","f3","f4","f5","f6","u1","u2","b1","b2","b3"]) clean(s);
try { unlinkSync(UNLOCK); } catch {}
rmSync(FIXTURE_HOME, { recursive: true, force: true });
console.log(fail ? `\n${fail} FEHLGESCHLAGEN` : `\nALLE PRUEFUNGEN BESTANDEN`);
process.exit(fail ? 1 : 0);
