#!/usr/bin/env node
/**
 * claude-hook-capability-canary.mjs
 *
 * Live end-to-end probe for Claude Code hook mutation support.
 * It isolates settings to a temporary project and tests:
 *   1. PreToolUse hookSpecificOutput.updatedInput
 *   2. PostToolUse hookSpecificOutput.updatedToolOutput
 *
 * The probe does not modify ~/.claude/settings.json. It writes a capability
 * record that bash-dump-guard can consume in hookActivation=auto mode.
 *
 * Node.js >= 18. Requires a working `claude` CLI login. The probe makes two
 * very small Claude requests, so normal provider/subscription accounting applies.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const DEFAULT_OUTPUT = path.join(os.homedir(), '.claude', 'bash-dump-guard-capabilities.json');

function parseArgs(argv) {
  const out = {
    claude: process.env.CLAUDE_BIN || 'claude',
    output: process.env.BASH_DUMP_GUARD_CAPABILITY_FILE || DEFAULT_OUTPUT,
    model: process.env.BASH_DUMP_GUARD_CANARY_MODEL || '',
    timeoutMs: Number(process.env.BASH_DUMP_GUARD_CANARY_TIMEOUT_MS || 180_000),
    keep: false,
    verbose: false,
    dryRun: false,
    selfTest: false
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--claude') out.claude = argv[++i];
    else if (arg === '--output') out.output = argv[++i];
    else if (arg === '--model') out.model = argv[++i];
    else if (arg === '--timeout-ms') out.timeoutMs = Number(argv[++i]);
    else if (arg === '--keep') out.keep = true;
    else if (arg === '--verbose') out.verbose = true;
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--self-test') out.selfTest = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

function help() {
  console.log(`Usage: node claude-hook-capability-canary.mjs [options]\n\nOptions:\n  --claude PATH       Claude CLI executable (default: claude)\n  --output FILE       Capability record path\n  --model MODEL       Optional low-cost model alias/id for both probes\n  --timeout-ms N      Timeout per probe (default: 180000)\n  --keep              Keep temporary probe directory\n  --verbose           Print Claude stdout/stderr\n  --dry-run           Create and inspect probe files without calling Claude\n`);
}

function commandPath(command) {
  const resolver = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(resolver, [command], { encoding: 'utf8' });
  if (result.status === 0 && result.stdout.trim()) return result.stdout.trim().split(/\r?\n/)[0];
  if (path.isAbsolute(command) && fs.existsSync(command)) return command;
  return command;
}

function executableFingerprint(command) {
  const resolved = commandPath(command);
  let realpath = resolved;
  let stat = null;
  try {
    realpath = fs.realpathSync(resolved);
    stat = fs.statSync(realpath);
  } catch {
    // Keep path/version evidence even when the launcher is a shell function or shim.
  }
  const versionResult = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 30_000 });
  const version = `${versionResult.stdout || ''}${versionResult.stderr || ''}`.trim() || null;
  return {
    command,
    resolvedPath: resolved,
    realpath,
    size: stat?.size ?? null,
    mtimeMs: stat?.mtimeMs ?? null,
    version,
    versionExitCode: versionResult.status
  };
}

function marker(label) {
  return `BDG_${label}_${crypto.randomBytes(10).toString('hex').toUpperCase()}`;
}

function writeExecutable(file, content) {
  fs.writeFileSync(file, content, { encoding: 'utf8', mode: 0o700 });
  try { fs.chmodSync(file, 0o700); } catch { /* Windows */ }
}

function settingsFor(event, hookCommand) {
  return {
    hooks: {
      [event]: [
        {
          matcher: 'Bash',
          hooks: [
            {
              type: 'command',
              command: `node ${JSON.stringify(hookCommand)}`,
              timeout: 10
            }
          ]
        }
      ]
    }
  };
}

function makeProbe(root, kind, original, replacement) {
  const dir = path.join(root, kind);
  const claudeDir = path.join(dir, '.claude');
  fs.mkdirSync(claudeDir, { recursive: true });
  const hookPath = path.join(dir, 'hook.mjs');

  if (kind === 'pre') {
    writeExecutable(hookPath, `#!/usr/bin/env node\nlet raw=''; for await (const c of process.stdin) raw += c;\nconst input=JSON.parse(raw);\nconst next={...(input.tool_input||{}),command:${JSON.stringify(`printf '%s\\n' '${replacement}'`)}};\nprocess.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PreToolUse',permissionDecision:'allow',permissionDecisionReason:'bash-dump-guard capability probe',updatedInput:next}}));\n`);
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(settingsFor('PreToolUse', hookPath), null, 2));
  } else {
    writeExecutable(hookPath, `#!/usr/bin/env node\nlet raw=''; for await (const c of process.stdin) raw += c;\nconst input=JSON.parse(raw);\nconst response=input.tool_response;\nlet updated=response;\nif (response && typeof response==='object') updated={...response,stdout:${JSON.stringify(replacement)}};\nelse updated=${JSON.stringify(replacement)};\nprocess.stdout.write(JSON.stringify({hookSpecificOutput:{hookEventName:'PostToolUse',updatedToolOutput:updated}}));\n`);
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(settingsFor('PostToolUse', hookPath), null, 2));
  }

  const prompt = [
    `Use the Bash tool exactly once to run this command: printf '%s\\n' '${original}'`,
    'After the command finishes, reply with only the exact single line that Bash displayed.',
    'Do not explain, infer, quote, or add punctuation.'
  ].join('\n');

  return { dir, hookPath, prompt };
}

function runProbe(options, probe, replacement, original) {
  const args = [
    '-p', probe.prompt,
    '--setting-sources', 'project',
    '--tools', 'Bash',
    '--dangerously-skip-permissions',
    '--output-format', 'json'
  ];
  if (options.model) args.push('--model', options.model);

  if (options.dryRun) {
    return {
      status: 'unknown',
      reason: 'dry-run',
      exitCode: null,
      stdout: '',
      stderr: '',
      args
    };
  }

  const result = spawnSync(options.claude, args, {
    cwd: probe.dir,
    encoding: 'utf8',
    timeout: options.timeoutMs,
    env: {
      ...process.env,
      CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: process.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC || '1'
    },
    maxBuffer: 16 * 1024 * 1024
  });
  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const sawReplacement = stdout.includes(replacement);
  const sawOriginal = stdout.includes(original);
  let status = 'fail';
  let reason = 'replacement marker not observed';
  if (result.error?.code === 'ETIMEDOUT' || result.signal === 'SIGTERM') {
    status = 'unknown';
    reason = 'probe timed out';
  } else if (result.status !== 0) {
    status = 'unknown';
    reason = `claude exited ${result.status}`;
  } else if (sawReplacement) {
    status = 'pass';
    reason = 'replacement marker observed in Claude result';
  } else if (sawOriginal) {
    status = 'fail';
    reason = 'original marker observed; hook mutation was not applied end-to-end';
  }

  if (options.verbose) {
    console.error(`\n[probe ${path.basename(probe.dir)}] claude ${args.join(' ')}`);
    console.error('stdout:', stdout);
    console.error('stderr:', stderr);
  }

  return {
    status,
    reason,
    exitCode: result.status,
    signal: result.signal || null,
    stdoutSha256: crypto.createHash('sha256').update(stdout).digest('hex'),
    stderrSha256: crypto.createHash('sha256').update(stderr).digest('hex'),
    sawReplacement,
    sawOriginal,
    args
  };
}

function writePrivateJson(file, value) {
  const target = path.resolve(file.replace(/^~(?=$|[\\/])/, os.homedir()));
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temp = `${target}.tmp-${process.pid}`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temp, target);
  try { fs.chmodSync(target, 0o600); } catch { /* Windows */ }
  return target;
}


function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bdg-canary-self-test-'));
  const mock = path.join(root, 'mock-claude.mjs');
  const output = path.join(root, 'capabilities.json');
  writeExecutable(mock, `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
if (process.argv.includes('--version')) { console.log('mock-claude 1.0'); process.exit(0); }
const hook = fs.readFileSync(path.join(process.cwd(), 'hook.mjs'), 'utf8');
const match = hook.match(/BDG_(?:PRE_REWRITTEN|POST_REPLACED)_[A-F0-9]+/);
if (!match) { console.error('marker missing'); process.exit(2); }
console.log(JSON.stringify({type:'result',result:match[0]}));
`);
  try {
    const child = spawnSync(process.execPath, [process.argv[1], '--claude', mock, '--output', output, '--timeout-ms', '30000'], {
      encoding: 'utf8',
      timeout: 60_000
    });
    if (child.status !== 0) throw new Error(`mock probe exited ${child.status}: ${child.stderr || child.stdout}`);
    const record = JSON.parse(fs.readFileSync(output, 'utf8'));
    if (record.capabilities?.preToolUseUpdatedInput !== 'pass') throw new Error('PreTool self-test did not pass');
    if (record.capabilities?.postToolUseUpdatedToolOutput !== 'pass') throw new Error('PostTool self-test did not pass');
    if (record.recommendation !== 'posttool-replace-supported') throw new Error('Unexpected self-test recommendation');
    console.log('claude-hook-capability-canary self-test: OK');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return help();
  if (options.selfTest) return selfTest();
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 10_000) throw new Error('--timeout-ms must be >= 10000');

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bdg-capability-'));
  const probeId = crypto.randomUUID();
  const preOriginal = marker('PRE_ORIGINAL');
  const preReplacement = marker('PRE_REWRITTEN');
  const postOriginal = marker('POST_ORIGINAL');
  const postReplacement = marker('POST_REPLACED');

  try {
    const pre = makeProbe(root, 'pre', preOriginal, preReplacement);
    const post = makeProbe(root, 'post', postOriginal, postReplacement);
    const executable = executableFingerprint(options.claude);
    const preResult = runProbe(options, pre, preReplacement, preOriginal);
    const postResult = runProbe(options, post, postReplacement, postOriginal);

    const record = {
      schemaVersion: 1,
      probeId,
      testedAt: new Date().toISOString(),
      host: {
        platform: process.platform,
        arch: process.arch,
        node: process.version
      },
      claude: executable,
      settingsIsolation: {
        settingSources: ['project'],
        globalSettingsModified: false,
        tempDirectory: options.keep ? root : null
      },
      capabilities: {
        preToolUseUpdatedInput: preResult.status,
        postToolUseUpdatedToolOutput: postResult.status
      },
      probes: {
        preToolUseUpdatedInput: preResult,
        postToolUseUpdatedToolOutput: postResult
      },
      recommendation: postResult.status === 'pass'
        ? 'posttool-replace-supported'
        : preResult.status === 'pass'
          ? 'pretool-wrapper-only'
          : preResult.status === 'fail' && postResult.status === 'fail'
            ? 'explicit-filter-or-mcp-only'
            : 'capability-unknown'
    };

    const outputPath = writePrivateJson(options.output, record);
    console.log(`Claude hook capability probe: ${record.recommendation}`);
    console.log(`  Claude: ${executable.version || executable.resolvedPath}`);
    console.log(`  PreToolUse.updatedInput: ${preResult.status} (${preResult.reason})`);
    console.log(`  PostToolUse.updatedToolOutput: ${postResult.status} (${postResult.reason})`);
    console.log(`  Record: ${outputPath}`);
    if (options.keep) console.log(`  Temp: ${root}`);

    // Unknown is operationally safer than pass. Exit 2 only when both are known failures;
    // callers can still inspect the written capability record.
    if (preResult.status === 'fail' && postResult.status === 'fail') process.exitCode = 2;
    else if (preResult.status === 'unknown' || postResult.status === 'unknown') process.exitCode = 3;
  } finally {
    if (!options.keep) fs.rmSync(root, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error) {
  console.error(`Capability probe failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
