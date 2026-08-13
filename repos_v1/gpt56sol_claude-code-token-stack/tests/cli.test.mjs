import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const cli = path.join(packageRoot, 'bin', 'claudestack.mjs');
const hook = path.join(packageRoot, 'hooks', 'claudestack.mjs');

const defaultConfig = {
  schemaVersion: 1,
  mode: 'shadow',
  bash: {
    enabled: true,
    minInputBytes: 4_096,
    targetOutputBytes: 6_000,
    minSavingsBytes: 512,
    minSavingsRatio: 0.15,
    headLines: 24,
    tailLines: 24,
  },
  read: {
    enabled: true,
    maxWholeFileBytes: 80_000,
    denyOnceSeconds: 180,
    hashMaxBytes: 2_000_000,
  },
  retention: { days: 7, maxArtifactBytes: 20_000_000 },
};

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claudestack-cli-test-'));
  const configDir = path.join(root, 'config');
  fs.mkdirSync(configDir, { recursive: true });
  const env = { ...process.env, CLAUDE_CONFIG_DIR: configDir };
  delete env.CLAUDE_TOKEN_STACK_CONFIG;
  return { root, configDir, env, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function run(file, args = [], options = {}) {
  return spawnSync(process.execPath, [file, ...args], {
    cwd: options.cwd || packageRoot,
    env: options.env || process.env,
    input: options.input || '',
    encoding: 'utf8',
  });
}

function json(value) {
  assert.notEqual(value.trim(), '', 'expected JSON output');
  return JSON.parse(value);
}

test('invalid CLI usage returns JSON error and exit 2', () => {
  for (const args of [[], ['unknown'], ['fragment', 'extra'], ['recover']]) {
    const result = run(cli, args);
    assert.equal(result.status, 2, args.join(' '));
    assert.equal(result.stdout, '');
    assert.equal(json(result.stderr).error.code, 'USAGE');
  }
});

test('fragment prints local dispatcher settings as JSON', () => {
  const result = run(cli, ['fragment']);
  assert.equal(result.status, 0);
  assert.equal(result.stderr, '');
  const fragment = json(result.stdout);
  assert.deepEqual(Object.keys(fragment.hooks), ['PreToolUse', 'PostToolUse', 'PreCompact', 'SessionEnd']);
  const commands = Object.values(fragment.hooks).flatMap((groups) =>
    groups.flatMap((group) => group.hooks.map((entry) => entry.command)),
  );
  assert.ok(commands.length > 0);
  assert.ok(commands.every((command) => command === `node "${hook}"`));
});

test('doctor reads default settings path and exits 0 for a valid ownership graph', () => {
  const f = fixture();
  try {
    fs.writeFileSync(path.join(f.configDir, 'settings.json'), JSON.stringify({
      hooks: {
        PostToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'node hooks/claudestack.mjs' }] }],
      },
    }));
    const result = run(cli, ['doctor'], { env: f.env });
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
    const report = json(result.stdout);
    assert.equal(report.ok, true);
    assert.equal(report.summary.postToolBash, 1);
  } finally {
    f.cleanup();
  }
});

test('doctor emits its report and exits 1 for conflicting Bash owners', () => {
  const f = fixture();
  try {
    const settings = path.join(f.root, 'settings.json');
    fs.writeFileSync(settings, JSON.stringify({
      hooks: {
        PostToolUse: [
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'node hooks/claudestack.mjs' }] },
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'bash-dump-guard' }] },
        ],
      },
    }));
    const result = run(cli, ['doctor', settings], { env: f.env });
    assert.equal(result.status, 1);
    assert.equal(result.stderr, '');
    const report = json(result.stdout);
    assert.equal(report.ok, false);
    assert.ok(report.findings.some((finding) => finding.code === 'MULTIPLE_BASH_OUTPUT_OWNERS'));
  } finally {
    f.cleanup();
  }
});

test('recover prints an artifact selected by its bounded id', () => {
  const f = fixture();
  try {
    const payload = {
      schemaVersion: 1,
      createdAt: '2026-08-13T00:00:00.000Z',
      command: 'npm test',
      toolResponse: { stdout: 'raw' },
    };
    const sha256 = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const id = sha256.slice(0, 24);
    const artifact = { id, sha256, ...payload };
    const directory = path.join(f.configDir, 'token-stack', 'state', 'artifacts');
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${id}.json`), JSON.stringify(artifact));
    const result = run(cli, ['recover', id], { env: f.env });
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
    assert.deepEqual(json(result.stdout), artifact);
  } finally {
    f.cleanup();
  }
});

test('prune loads config and reports only expired artifact removals', () => {
  const f = fixture();
  try {
    const directory = path.join(f.configDir, 'token-stack', 'state', 'artifacts');
    fs.mkdirSync(directory, { recursive: true });
    const oldFile = path.join(directory, 'old.json');
    const freshFile = path.join(directory, 'fresh.json');
    fs.writeFileSync(oldFile, '{}');
    fs.writeFileSync(freshFile, '{}');
    const old = new Date(Date.now() - 8 * 86_400_000);
    fs.utimesSync(oldFile, old, old);

    const result = run(cli, ['prune'], { env: f.env });
    assert.equal(result.status, 0);
    assert.equal(result.stderr, '');
    assert.deepEqual(json(result.stdout), { schemaVersion: 1, ok: true, removed: 1 });
    assert.equal(fs.existsSync(oldFile), false);
    assert.equal(fs.existsSync(freshFile), true);
  } finally {
    f.cleanup();
  }
});

test('CLI hook command and hook wrapper delegate the same stdin protocol', () => {
  const f = fixture();
  try {
    fs.writeFileSync(path.join(f.configDir, 'token-stack.json'), JSON.stringify({ mode: 'enforce' }));
    const input = JSON.stringify({
      session_id: 'cli-hook',
      hook_event_name: 'PostToolUse',
      tool_name: 'Bash',
      tool_input: { command: 'printf secret' },
      tool_response: {
        stdout: `ANTHROPIC_API_KEY=sk-ant-${'x'.repeat(32)}`,
        stderr: '',
        interrupted: false,
        isImage: false,
        exitCode: 0,
      },
    });
    const viaCli = run(cli, ['hook'], { env: f.env, input });
    const viaWrapper = run(hook, [], { env: f.env, input });
    assert.equal(viaCli.status, 0);
    assert.equal(viaWrapper.status, 0);
    assert.equal(viaCli.stderr, '');
    assert.equal(viaWrapper.stderr, '');
    assert.deepEqual(json(viaCli.stdout), json(viaWrapper.stdout));
    assert.match(viaCli.stdout, /\[REDACTED\]/);
    assert.doesNotMatch(viaCli.stdout, /sk-ant-/);
  } finally {
    f.cleanup();
  }
});

test('operational errors are JSON on stderr with exit 1', () => {
  const f = fixture();
  try {
    const result = run(cli, ['doctor', path.join(f.root, 'missing.json')], { env: f.env });
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    const error = json(result.stderr);
    assert.equal(error.ok, false);
    assert.equal(error.error.code, 'OPERATION_FAILED');
  } finally {
    f.cleanup();
  }
});

test('package metadata and JSON configuration artifacts are dependency-free', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.bin.claudestack, './bin/claudestack.mjs');
  assert.equal(manifest.scripts.test, 'node --test');
  assert.equal(manifest.scripts['test:cli'], 'node --test tests/cli.test.mjs');
  assert.deepEqual(manifest.dependencies || {}, {});
  assert.deepEqual(manifest.devDependencies || {}, {});

  const storedDefault = JSON.parse(fs.readFileSync(path.join(packageRoot, 'config', 'token-stack.default.json'), 'utf8'));
  const schema = JSON.parse(fs.readFileSync(path.join(packageRoot, 'config', 'token-stack.schema.json'), 'utf8'));
  assert.deepEqual(storedDefault, defaultConfig);
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(schema.properties.mode.enum, ['off', 'shadow', 'enforce']);
  assert.deepEqual(schema.required || [], [], 'partial override files must remain valid');
  for (const section of ['bash', 'read', 'retention']) {
    assert.equal(schema.properties[section].additionalProperties, false);
    assert.deepEqual(schema.properties[section].required || [], [], 'partial sections must remain valid');
    assert.deepEqual(Object.keys(schema.properties[section].properties).sort(), Object.keys(defaultConfig[section]).sort());
  }
});
