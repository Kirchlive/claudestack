import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  auditDenyGateBoundary,
  capabilityFilePath,
  evaluateCanary,
  handleHook,
  inspectSettings,
  loadConfig,
  processHookInput,
  recoverArtifact,
  renderSettingsFragment,
} from '../src/stack.mjs';

const baseConfig = {
  schemaVersion: 1,
  mode: 'enforce',
  bash: {
    enabled: true,
    minInputBytes: 1_000,
    targetOutputBytes: 700,
    minSavingsBytes: 200,
    minSavingsRatio: 0.15,
    headLines: 8,
    tailLines: 8,
  },
  read: {
    enabled: true,
    maxWholeFileBytes: 1_000,
    denyOnceSeconds: 180,
    hashMaxBytes: 1_000_000,
  },
  retention: { days: 7, maxArtifactBytes: 2_000_000 },
};

const NOW = 1_800_000_000_000;
const DAY = 86_400_000;

function captureStderr() {
  const lines = [];
  return { lines, text: () => lines.join(''), write: (value) => { lines.push(String(value)); return true; } };
}

function writeCapability(file, overrides = {}) {
  fs.writeFileSync(file, `${JSON.stringify({
    schemaVersion: 1,
    testedAt: new Date(NOW - DAY).toISOString(),
    expiresAt: new Date(NOW + 29 * DAY).toISOString(),
    capabilities: { postToolUseUpdatedToolOutput: 'pass' },
    ...overrides,
  }, null, 2)}\n`);
  return file;
}

// A fixture represents a properly canary-verified installation: without a passed probe
// ADR-005 downgrades enforce to shadow, so every enforce test needs a valid record.
// settingsFiles stays empty so no test ever reads the real user settings.json.
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-token-stack-test-'));
  const stateDir = path.join(root, 'state');
  const capabilityFile = writeCapability(path.join(root, 'capabilities.json'));
  const config = structuredClone(baseConfig);
  config.canary = { capabilityFile, maxAgeDays: 30 };
  const stderr = captureStderr();
  return {
    root,
    stateDir,
    capabilityFile,
    stderr,
    options: { config, stateDir, cwd: root, now: () => NOW, settingsFiles: [], stderr, env: {} },
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

function bashEvent(stdout, overrides = {}) {
  return {
    session_id: 'session/test/../unsafe',
    tool_use_id: 'bash-1',
    hook_event_name: 'PostToolUse',
    tool_name: 'Bash',
    cwd: '/tmp',
    tool_input: { command: 'npm test -- --verbose' },
    tool_response: {
      stdout,
      stderr: '',
      interrupted: false,
      isImage: false,
      exitCode: 0,
      ...overrides,
    },
  };
}

test('malformed stdin fails open with empty stdout', async () => {
  const f = fixture();
  try {
    assert.equal(await processHookInput('{broken', f.options), '');
  } finally {
    f.cleanup();
  }
});

test('small Bash output passes through without hook result', async () => {
  const f = fixture();
  try {
    assert.equal(await handleHook(bashEvent('12 tests passed'), f.options), null);
    assert.equal(fs.existsSync(f.stateDir), false);
  } finally {
    f.cleanup();
  }
});

test('large Bash output is shape-preserving and recoverable', async () => {
  const f = fixture();
  try {
    const raw = Array.from({ length: 250 }, (_, i) => `case ${i}: ${'noise '.repeat(8)}`).join('\n');
    const result = await handleHook(bashEvent(raw), f.options);
    const updated = result.hookSpecificOutput.updatedToolOutput;
    assert.equal(result.hookSpecificOutput.hookEventName, 'PostToolUse');
    assert.equal(updated.stderr, '');
    assert.equal(updated.exitCode, 0);
    assert.ok(updated.stdout.length < raw.length * 0.85);
    assert.doesNotMatch(JSON.stringify(result), /permissionDecision/);

    const id = updated.stdout.match(/raw:([a-f0-9]{24})/)?.[1];
    assert.ok(id, 'raw artifact id missing');
    const recovered = await recoverArtifact(id, f.options);
    assert.equal(recovered.toolResponse.stdout, raw);

    const artifact = path.join(f.stateDir, 'artifacts', `${id}.json`);
    assert.equal(fs.statSync(f.stateDir).mode & 0o777, 0o700);
    assert.equal(fs.statSync(artifact).mode & 0o777, 0o600);
    assert.equal(path.relative(f.stateDir, artifact).startsWith('..'), false);
  } finally {
    f.cleanup();
  }
});

test('recovery rejects a tampered raw artifact', async () => {
  const f = fixture();
  try {
    const raw = Array.from({ length: 250 }, (_, i) => `case ${i}: ${'noise '.repeat(8)}`).join('\n');
    const result = await handleHook(bashEvent(raw), f.options);
    const id = result.hookSpecificOutput.updatedToolOutput.stdout.match(/raw:([a-f0-9]{24})/)?.[1];
    const artifact = path.join(f.stateDir, 'artifacts', `${id}.json`);
    const value = JSON.parse(fs.readFileSync(artifact, 'utf8'));
    value.toolResponse.stdout = 'tampered';
    fs.writeFileSync(artifact, `${JSON.stringify(value)}\n`);
    await assert.rejects(() => recoverArtifact(id, f.options), /integrity/i);
  } finally {
    f.cleanup();
  }
});

test('native spill markers and exact-output commands are not recompressed', async () => {
  const f = fixture();
  try {
    const native = '... [10000 characters truncated] ...\nFull output saved to /tmp/tool-results/a.log';
    assert.equal(await handleHook(bashEvent(native), f.options), null);
    const patch = bashEvent('diff --git a/a b/a\n' + '+x\n'.repeat(1_000));
    patch.tool_input.command = 'git diff HEAD~1';
    assert.equal(await handleHook(patch, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('secrets are redacted even when failure output otherwise passes exactly', async () => {
  const f = fixture();
  try {
    const event = bashEvent('ANTHROPIC_API_KEY=sk-ant-api03-abcdefghijklmnopqrstuv');
    event.tool_response.exitCode = 1;
    event.tool_response.stderr = 'request failed';
    const result = await handleHook(event, f.options);
    const updated = result.hookSpecificOutput.updatedToolOutput;
    assert.doesNotMatch(updated.stdout, /sk-ant-api03/);
    assert.match(updated.stdout, /\[REDACTED\]/);
    assert.equal(updated.stderr, 'request failed');
  } finally {
    f.cleanup();
  }
});

test('shadow mode records no raw artifact and emits no mutation', async () => {
  const f = fixture();
  f.options.config.mode = 'shadow';
  try {
    const raw = 'log line\n'.repeat(1_000);
    assert.equal(await handleHook(bashEvent(raw), f.options), null);
    assert.equal(fs.existsSync(path.join(f.stateDir, 'artifacts')), false);
  } finally {
    f.cleanup();
  }
});

test('off mode is a complete Bash bypass, including apparent secrets', async () => {
  const f = fixture();
  f.options.config.mode = 'off';
  try {
    const raw = `ANTHROPIC_API_KEY=sk-ant-${'x'.repeat(32)}\n${'payload\n'.repeat(800)}`;
    assert.equal(await handleHook(bashEvent(raw), f.options), null);
    assert.equal(fs.existsSync(f.stateDir), false);
  } finally {
    f.cleanup();
  }
});

test('shadow and off modes never deny Read', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'large.txt');
    fs.writeFileSync(file, 'x'.repeat(5_000));
    for (const mode of ['shadow', 'off']) {
      f.options.config.mode = mode;
      const event = {
        session_id: `read-${mode}`, hook_event_name: 'PreToolUse', tool_name: 'Read',
        tool_input: { file_path: file }, cwd: f.root,
      };
      assert.equal(await handleHook(event, f.options), null, `${mode} must not deny`);
    }
  } finally {
    f.cleanup();
  }
});

test('large whole-file Read is denied once, then allowed as an escape valve', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'large.ts');
    fs.writeFileSync(file, 'export const value = 1;\n'.repeat(200));
    const event = {
      session_id: 'read-session', hook_event_name: 'PreToolUse', tool_name: 'Read',
      tool_input: { file_path: file }, cwd: f.root,
    };
    const first = await handleHook(event, f.options);
    assert.equal(first.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(first.hookSpecificOutput.permissionDecisionReason, /offset.*limit/i);
    assert.equal(await handleHook(event, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('unchanged reread is denied once after a successful Read', async () => {
  const f = fixture();
  try {
    const file = path.join(f.root, 'small.ts');
    fs.writeFileSync(file, 'export const value = 1;\n');
    const common = { session_id: 'reread', tool_name: 'Read', tool_input: { file_path: file }, cwd: f.root };
    await handleHook({ ...common, hook_event_name: 'PostToolUse', tool_response: { content: 'x' } }, f.options);
    const first = await handleHook({ ...common, hook_event_name: 'PreToolUse' }, f.options);
    assert.equal(first.hookSpecificOutput.permissionDecision, 'deny');
    assert.match(first.hookSpecificOutput.permissionDecisionReason, /unchanged/i);
    assert.equal(await handleHook({ ...common, hook_event_name: 'PreToolUse' }, f.options), null);
  } finally {
    f.cleanup();
  }
});

test('doctor detects current RTK + Squeez input-owner collision', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS' && f.severity === 'error'));
});

test('doctor evaluates regex Bash matchers when finding owner collisions', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '^(Bash|Read)$', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Bash.*', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.equal(report.summary.preToolBash, 2);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS'));
});

test('doctor treats wildcard and comma-separated hook matchers like Claude Code', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '*', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Read, Bash', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.equal(report.summary.preToolBash, 2);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_INPUT_OWNERS'));
});

test('doctor ignores regex matchers that do not match Bash', () => {
  const settings = {
    hooks: {
      PreToolUse: [
        { matcher: '^(Read|Grep)$', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
        { matcher: 'Read', hooks: [{ type: 'command', command: 'bash ~/.claude/squeez/hooks/pretooluse.sh' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, true);
  assert.equal(report.summary.preToolBash, 0);
});

test('doctor reports malformed hook matchers without crashing', () => {
  const settings = {
    hooks: {
      PreToolUse: [{
        matcher: '^(Bash',
        hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }],
      }],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) =>
    f.code === 'INVALID_HOOK_MATCHER' && f.severity === 'error'));
});

test('doctor audits legacy and absolute paths on non-Bash hook matchers', () => {
  const settings = {
    hooks: {
      PreToolUse: [{
        matcher: 'mcp__squeez__retrieve',
        hooks: [{ type: 'command', command: 'node /Users/example/hooks/ladder-retrieve-gate.mjs' }],
      }],
    },
  };
  const report = inspectSettings(settings);
  assert.ok(report.findings.some((f) => f.code === 'LEGACY_LADDER_HOOK'));
  assert.ok(report.findings.some((f) => f.code === 'ABSOLUTE_MACHINE_PATH'));
});

test('doctor recognizes the disambiguated GPT55 output-reducer identity', () => {
  const settings = {
    hooks: {
      PostToolUse: [
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'node hooks/claudestack.mjs' }] },
        { matcher: 'Bash', hooks: [{ type: 'command', command: 'node refs/gpt55-posttooluse-output-reducer-v3.mjs' }] },
      ],
    },
  };
  const report = inspectSettings(settings);
  assert.equal(report.ok, false);
  assert.ok(report.findings.some((f) => f.code === 'MULTIPLE_BASH_OUTPUT_OWNERS'));
});

test('missing capability file downgrades enforce to shadow with a stderr finding', async () => {
  const f = fixture();
  try {
    fs.rmSync(f.capabilityFile);
    const raw = 'log line\n'.repeat(1_000);
    assert.equal(await handleHook(bashEvent(raw), f.options), null, 'must behave like shadow');
    assert.equal(fs.existsSync(path.join(f.stateDir, 'artifacts')), false, 'no artifact in shadow');
    assert.match(f.stderr.text(), /enforce downgraded to shadow/);
    assert.match(f.stderr.text(), /capability file missing/);
  } finally {
    f.cleanup();
  }
});

test('expired or unpassed capability record downgrades enforce to shadow', async () => {
  for (const [label, overrides, pattern] of [
    ['expired', { expiresAt: new Date(NOW - DAY).toISOString() }, /expired at/],
    ['stale testedAt', { expiresAt: null, testedAt: new Date(NOW - 31 * DAY).toISOString() }, /older than 30 days/],
    ['not passed', { capabilities: { postToolUseUpdatedToolOutput: 'fail' } }, /expected "pass"/],
  ]) {
    const f = fixture();
    try {
      writeCapability(f.capabilityFile, overrides);
      assert.equal(await handleHook(bashEvent('log line\n'.repeat(1_000)), f.options), null, `${label} must not enforce`);
      assert.match(f.stderr.text(), /enforce downgraded to shadow/, label);
      assert.match(f.stderr.text(), pattern, label);
    } finally {
      f.cleanup();
    }
  }
});

test('a valid capability record keeps enforce and the env override wins over config', async () => {
  const f = fixture();
  try {
    assert.equal(evaluateCanary(f.options.config, f.options).ok, true);
    const elsewhere = writeCapability(path.join(f.root, 'elsewhere.json'));
    const options = { ...f.options, env: { CLAUDESTACK_CAPABILITY_FILE: elsewhere } };
    assert.equal(capabilityFilePath(f.options.config, options), elsewhere);

    // The default must follow CLAUDE_CONFIG_DIR instead of reaching into the real home directory.
    assert.equal(
      capabilityFilePath(undefined, { env: { CLAUDE_CONFIG_DIR: f.root } }),
      path.join(f.root, 'token-stack', 'capabilities.json'),
    );
    const result = await handleHook(bashEvent('case\n'.repeat(1_000)), options);
    assert.ok(result?.hookSpecificOutput?.updatedToolOutput, 'enforce stays active with a valid record');
    assert.equal(f.stderr.lines.length, 0, 'a valid record produces no notice');
  } finally {
    f.cleanup();
  }
});

test('a foreign PreToolUse:Bash mutator is reported without ever blocking', async () => {
  const f = fixture();
  try {
    const settings = path.join(f.root, 'settings.json');
    fs.writeFileSync(settings, JSON.stringify({
      hooks: {
        PreToolUse: [
          { matcher: 'Bash|Read', hooks: [{ type: 'command', command: 'tokless rtk-hook claude' }] },
          { matcher: 'Bash', hooks: [{ type: 'command', command: 'node /opt/claude-code-token-stack/hooks/claudestack.mjs' }] },
        ],
      },
    }));
    const options = { ...f.options, settingsFiles: [settings] };
    const result = await handleHook(bashEvent('case\n'.repeat(1_000)), options);

    assert.match(f.stderr.text(), /PreToolUse:Bash carries 1 known foreign mutator/);
    assert.match(f.stderr.text(), /rtk-hook/);
    assert.doesNotMatch(f.stderr.text(), /claudestack\.mjs/, 'own dispatcher is not a foreign owner');
    assert.ok(result?.hookSpecificOutput?.updatedToolOutput, 'the finding must not stop enforcement');
    assert.doesNotMatch(JSON.stringify(result), /permissionDecision/, 'the dispatcher never blocks Bash');

    const report = auditDenyGateBoundary(JSON.parse(fs.readFileSync(settings, 'utf8')));
    assert.deepEqual(report.knownMutators, ['tokless rtk-hook claude']);
    assert.equal(report.handlers.length, 1);
  } finally {
    f.cleanup();
  }
});

test('a string tool_response is normalized into object shape instead of discarded', async () => {
  const f = fixture();
  try {
    const raw = Array.from({ length: 250 }, (_, i) => `case ${i}: ${'noise '.repeat(8)}`).join('\n');
    const event = { ...bashEvent(''), tool_response: raw };
    const result = await handleHook(event, f.options);
    const updated = result.hookSpecificOutput.updatedToolOutput;

    assert.equal(typeof updated, 'object', 'string input must come back as the object shape');
    assert.deepEqual(
      { stderr: updated.stderr, interrupted: updated.interrupted, isImage: updated.isImage, exitCode: updated.exitCode },
      { stderr: '', interrupted: false, isImage: false, exitCode: 0 },
    );
    assert.ok(updated.stdout.length < raw.length * 0.85);

    const id = updated.stdout.match(/raw:([a-f0-9]{24})/)?.[1];
    assert.ok(id, 'recovery path must survive normalization');
    assert.equal((await recoverArtifact(id, f.options)).toolResponse.stdout, raw);
  } finally {
    f.cleanup();
  }
});

test('generated fragment contains one dispatcher command and no third-party mutator', () => {
  const fragment = renderSettingsFragment('/opt/claude-token-stack');
  const commands = Object.values(fragment.hooks).flatMap((groups) =>
    groups.flatMap((group) => group.hooks.map((hook) => hook.command)),
  );
  assert.ok(commands.length >= 2);
  assert.ok(commands.every((command) => command === 'node "/opt/claude-token-stack/hooks/claudestack.mjs"'));
  assert.doesNotMatch(JSON.stringify(fragment), /rtk-hook|squeez|omni|tokf/i);
});

// --- Config search order: bundled operating directory takes precedence over the carrier convention

function withConfigDirs() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-token-stack-config-'));
  const configDir = path.join(root, 'config');
  const cwd = path.join(root, 'project');
  fs.mkdirSync(path.join(configDir, 'token-stack'), { recursive: true });
  fs.mkdirSync(path.join(cwd, '.claude'), { recursive: true });
  const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value));
  return {
    cwd,
    env: { CLAUDE_CONFIG_DIR: configDir },
    bundled: path.join(configDir, 'token-stack', 'token-stack.json'),
    legacy: path.join(configDir, 'token-stack.json'),
    project: path.join(cwd, '.claude', 'token-stack.json'),
    external: path.join(root, 'external.json'),
    write,
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  };
}

test('bundled config under <configDir>/token-stack/ is found', () => {
  const f = withConfigDirs();
  try {
    f.write(f.bundled, { mode: 'shadow' });
    assert.equal(loadConfig({ cwd: f.cwd, env: f.env }).mode, 'shadow');
  } finally {
    f.cleanup();
  }
});

test('bundled config wins over the deprecated carrier path', () => {
  const f = withConfigDirs();
  try {
    f.write(f.legacy, { mode: 'enforce' });
    f.write(f.bundled, { mode: 'shadow' });
    assert.equal(loadConfig({ cwd: f.cwd, env: f.env }).mode, 'shadow');
  } finally {
    f.cleanup();
  }
});

test('deprecated carrier path still applies when no bundled config exists', () => {
  const f = withConfigDirs();
  try {
    f.write(f.legacy, { mode: 'shadow' });
    assert.equal(loadConfig({ cwd: f.cwd, env: f.env }).mode, 'shadow');
  } finally {
    f.cleanup();
  }
});

test('project-local config and env override the bundled config', () => {
  const f = withConfigDirs();
  try {
    f.write(f.bundled, { mode: 'shadow' });
    f.write(f.project, { mode: 'enforce' });
    assert.equal(loadConfig({ cwd: f.cwd, env: f.env }).mode, 'enforce');

    f.write(f.external, { mode: 'off' });
    assert.equal(
      loadConfig({ cwd: f.cwd, env: { ...f.env, CLAUDE_TOKEN_STACK_CONFIG: f.external } }).mode,
      'off',
    );
  } finally {
    f.cleanup();
  }
});
