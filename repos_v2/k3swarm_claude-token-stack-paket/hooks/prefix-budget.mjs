#!/usr/bin/env node
/**
 * prefix-budget.mjs
 *
 * SessionStart observer and offline audit for Claude Code prefix pressure.
 * It measures what can be established locally (instruction bytes, skill metadata,
 * enabled-plugin declarations, MCP server declarations) and labels estimates as
 * estimates. It does not claim that every discovered file is loaded.
 *
 * Default hook behavior: emit one short factual advisory only when a configured
 * budget is exceeded. It never blocks, edits settings, enables/disables plugins,
 * or rewrites CLAUDE.md. SessionStart-Gating: the hook emits only for the
 * SessionStart event; --report/--json work offline.
 *
 * Paket-Uebernahme (claude-token-stack-paket, Merge GPT-Basis + OPUS-Features):
 * - Hook-Flaechen-Kollisionserkennung (Gesetz I): mehrere mutierende Hooks auf
 *   derselben event:matcher-Flaeche erzeugen einen Befund (aus OPUS5_MAX portiert).
 * - Skill-Namenskollisions-Erkennung: gleichnamige aktive Skills/Commands aus
 *   verschiedenen Quellen erzeugen einen Befund (aus OPUS5_MAX portiert).
 * - stdin ist ueber lib/token-stack-shared.mjs auf 8 MiB hart begrenzt (B4).
 *
 * Node.js >= 18, no third-party dependencies.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import {
  appendPrivateJsonl,
  approxTokensFromChars,
  cwdFrom,
  eventName,
  findRepoRoot,
  mergeObjects,
  oneLine,
  parseFrontmatter,
  readJson,
  readStdinJson,
  resolveConfiguredPath,
  sha256,
  statSnapshot,
  walkFiles,
  writePrivateJson
} from './lib/token-stack-shared.mjs';

const VERSION = 1;
const DEFAULTS = Object.freeze({
  enabled: true,
  mode: 'advisory', // off | report | advisory
  assumedContextWindowTokens: 200_000,
  fallbackSkillMetadataBudgetChars: 8_000,
  maxSkillDescriptionChars: 1_536,
  maxClaudeMdEstimatedTokens: 2_500,
  maxPotentialRulesEstimatedTokens: 4_000,
  maxEnabledPlugins: 20,
  maxDeclaredMcpServers: 8,
  maxKnownMarketplaces: 12,
  scanPluginCache: true,
  maxScannedFiles: 8_000,
  includeGlobal: true,
  includeProject: true,
  reportFile: '~/.claude/token-stack/prefix-latest.json',
  metricsFile: '~/.claude/token-stack/prefix-snapshots.jsonl',
  metricsMaxBytes: 5_242_880,
  configFile: '~/.claude/prefix-budget.config.json',
  advisoryMaxChars: 900,
  storePaths: false
});

function settingsPaths(cwd, configDir) {
  return [
    path.join(configDir, 'settings.json'),
    path.join(cwd, '.claude', 'settings.json'),
    path.join(cwd, '.claude', 'settings.local.json')
  ];
}

function loadSettings(cwd, configDir) {
  return mergeObjects(...settingsPaths(cwd, configDir).map((file) => readJson(file, {})));
}

function loadConfig(cwd) {
  const configDir = resolveConfiguredPath(process.env.CLAUDE_CONFIG_DIR || '~/.claude');
  const settings = loadSettings(cwd, configDir);
  const configuredPath = resolveConfiguredPath(process.env.PREFIX_BUDGET_CONFIG || DEFAULTS.configFile, cwd);
  const projectConfig = path.join(cwd, '.claude', 'prefix-budget.config.json');
  const config = mergeObjects(DEFAULTS, readJson(configuredPath, {}), readJson(projectConfig, {}));
  config.configDir = configDir;
  config.settings = settings;
  config.configPath = configuredPath;
  config.reportFile = resolveConfiguredPath(process.env.PREFIX_BUDGET_REPORT || config.reportFile, cwd);
  config.metricsFile = resolveConfiguredPath(process.env.PREFIX_BUDGET_METRICS || config.metricsFile, cwd);
  return config;
}

function enabledPluginIds(settings) {
  const value = settings?.enabledPlugins;
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === 'object') return Object.entries(value).filter(([, enabled]) => enabled !== false).map(([id]) => id);
  return [];
}

function knownMarketplaces(settings) {
  const value = settings?.extraKnownMarketplaces;
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === 'object') return Object.keys(value);
  return [];
}

function skillOverrideMode(settings, candidates) {
  const overrides = settings?.skillOverrides;
  if (!overrides || typeof overrides !== 'object') return null;
  for (const name of candidates) {
    const value = overrides[name];
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.mode || value.visibility || null;
  }
  return null;
}

function skillMetadata(file, origin, settings, maxChars) {
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const { data, body } = parseFrontmatter(text);
  const inferredName = path.basename(path.dirname(file)) || path.basename(file, path.extname(file));
  const name = String(data.name || inferredName);
  const description = String(data.description || '');
  const whenToUse = String(data.when_to_use || data.whenToUse || '');
  const names = [name, `${origin}:${name}`, path.basename(file, path.extname(file))];
  const override = skillOverrideMode(settings, names);
  const disabled = ['disabled', 'off', 'false'].includes(String(override).toLowerCase());
  const nameOnly = String(override).toLowerCase() === 'name-only';
  const rawMetadata = nameOnly ? name : [name, description, whenToUse].filter(Boolean).join('\n');
  const metadataChars = Math.min(rawMetadata.length, maxChars);
  return {
    file,
    origin,
    name,
    override,
    active: !disabled,
    nameOnly,
    metadataChars,
    bodyChars: body.length,
    totalChars: text.length
  };
}

function commandMetadata(file, origin, settings, maxChars) {
  let text = '';
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const { data, body } = parseFrontmatter(text);
  const name = String(data.name || path.basename(file, path.extname(file)));
  const description = String(data.description || body.split(/\r?\n/).find((line) => line.trim() && !line.trim().startsWith('#')) || '');
  const override = skillOverrideMode(settings, [name, `${origin}:${name}`]);
  const disabled = ['disabled', 'off', 'false'].includes(String(override).toLowerCase());
  const nameOnly = String(override).toLowerCase() === 'name-only';
  const rawMetadata = nameOnly ? name : [name, description].filter(Boolean).join('\n');
  return { file, origin, name, override, active: !disabled, nameOnly, metadataChars: Math.min(rawMetadata.length, maxChars), bodyChars: body.length, totalChars: text.length };
}

function pluginPathLooksEnabled(file, ids) {
  if (!ids.length) return false;
  const normalized = file.replace(/\\/g, '/').toLowerCase();
  return ids.some((id) => {
    const [plugin, marketplace] = String(id).toLowerCase().split('@');
    return normalized.includes(`/${plugin}/`) && (!marketplace || normalized.includes(`/${marketplace}/`));
  });
}

function collectSkills(cwd, config) {
  const settings = config.settings;
  const maxChars = Number(settings?.maxSkillDescriptionChars || config.maxSkillDescriptionChars || 1536);
  const items = [];
  const addSkills = (root, origin) => {
    for (const file of walkFiles(root, { maxFiles: config.maxScannedFiles, match: (_full, name) => name === 'SKILL.md' })) {
      const item = skillMetadata(file, origin, settings, maxChars);
      if (item) items.push(item);
    }
  };
  const addCommands = (root, origin) => {
    for (const file of walkFiles(root, { maxFiles: config.maxScannedFiles, maxDepth: 2, match: (_full, name) => name.endsWith('.md') })) {
      const item = commandMetadata(file, origin, settings, maxChars);
      if (item) items.push(item);
    }
  };

  if (config.includeGlobal) {
    addSkills(path.join(config.configDir, 'skills'), 'user');
    addCommands(path.join(config.configDir, 'commands'), 'user-command');
  }
  if (config.includeProject) {
    addSkills(path.join(cwd, '.claude', 'skills'), 'project');
    addCommands(path.join(cwd, '.claude', 'commands'), 'project-command');
  }

  const pluginIds = enabledPluginIds(settings);
  const pluginCache = path.join(config.configDir, 'plugins', 'cache');
  let cachedPluginSkillCount = 0;
  if (config.scanPluginCache && fs.existsSync(pluginCache)) {
    for (const file of walkFiles(pluginCache, { maxFiles: config.maxScannedFiles, match: (_full, name) => name === 'SKILL.md' })) {
      cachedPluginSkillCount += 1;
      if (!pluginPathLooksEnabled(file, pluginIds)) continue;
      const item = skillMetadata(file, 'enabled-plugin', settings, maxChars);
      if (item) items.push(item);
    }
  }

  const active = items.filter((item) => item.active);
  // OPUS-Port: Skill-Namenskollisionen ueber Quellgrenzen hinweg erkennen.
  const seenNames = new Map();
  const duplicateNames = [];
  for (const item of active) {
    if (seenNames.has(item.name)) duplicateNames.push(item.name);
    else seenNames.set(item.name, item.origin);
  }
  return {
    items,
    active,
    duplicateNames: [...new Set(duplicateNames)],
    counts: {
      discovered: items.length,
      active: active.length,
      nameOnly: active.filter((item) => item.nameOnly).length,
      cachedPluginSkills: cachedPluginSkillCount,
      enabledPluginSkills: active.filter((item) => item.origin === 'enabled-plugin').length
    },
    metadataChars: active.reduce((sum, item) => sum + item.metadataChars, 0),
    bodyChars: active.reduce((sum, item) => sum + item.bodyChars, 0)
  };
}

function collectMarkdownBudget(cwd, config) {
  const claudeFiles = [];
  const ruleFiles = [];
  const pushIf = (file, bucket, scope) => {
    const stat = statSnapshot(file);
    if (stat) bucket.push({ file, bytes: stat.size, scope });
  };
  if (config.includeGlobal) {
    pushIf(path.join(config.configDir, 'CLAUDE.md'), claudeFiles, 'user');
    for (const file of walkFiles(path.join(config.configDir, 'rules'), { maxFiles: config.maxScannedFiles, match: (_f, name) => name.endsWith('.md') })) pushIf(file, ruleFiles, 'user-rule');
  }
  if (config.includeProject) {
    for (const name of ['CLAUDE.md', 'CLAUDE.local.md']) pushIf(path.join(cwd, name), claudeFiles, 'project');
    pushIf(path.join(cwd, '.claude', 'CLAUDE.md'), claudeFiles, 'project');
    for (const file of walkFiles(path.join(cwd, '.claude', 'rules'), { maxFiles: config.maxScannedFiles, match: (_f, name) => name.endsWith('.md') })) pushIf(file, ruleFiles, 'project-rule');
  }
  return {
    claudeFiles,
    ruleFiles,
    claudeBytes: claudeFiles.reduce((sum, item) => sum + item.bytes, 0),
    ruleBytes: ruleFiles.reduce((sum, item) => sum + item.bytes, 0)
  };
}

function collectMcp(cwd, config) {
  const declarations = new Map();
  const inspect = (file, scope) => {
    const value = readJson(file, null);
    const servers = value?.mcpServers || value?.mcp?.servers || null;
    if (!servers || typeof servers !== 'object') return;
    for (const name of Object.keys(servers)) declarations.set(`${scope}:${name}`, { name, scope, file });
  };
  if (config.includeGlobal) {
    inspect(path.join(os.homedir(), '.claude.json'), 'user');
    inspect(path.join(config.configDir, '.mcp.json'), 'user');
  }
  if (config.includeProject) inspect(path.join(cwd, '.mcp.json'), 'project');
  return [...declarations.values()];
}

// OPUS-Port (Gesetz I): registrierte Hooks aus den gemergten Settings lesen.
// Nur gezaehlt/gruppiert — der Waechter mutiert nie.
function collectHooks(settings) {
  const registered = [];
  const cfg = settings?.hooks || {};
  for (const [event, groups] of Object.entries(cfg)) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      const matcher = String(group?.matcher || '*');
      for (const hook of group?.hooks || []) {
        registered.push({ event, matcher, command: String(hook?.command || '').slice(0, 160) });
      }
    }
  }
  return registered;
}

function skillBudgetChars(config) {
  const settings = config.settings;
  const envFromSettings = settings?.env?.SLASH_COMMAND_TOOL_CHAR_BUDGET;
  const fixed = Number(process.env.SLASH_COMMAND_TOOL_CHAR_BUDGET || envFromSettings || 0);
  if (Number.isFinite(fixed) && fixed > 0) return { chars: fixed, source: 'SLASH_COMMAND_TOOL_CHAR_BUDGET' };
  const fraction = Number(settings?.skillListingBudgetFraction || 0.01);
  const contextTokens = Number(process.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS || settings?.env?.CLAUDE_CODE_MAX_CONTEXT_TOKENS || config.assumedContextWindowTokens);
  if (Number.isFinite(fraction) && fraction > 0 && Number.isFinite(contextTokens) && contextTokens > 0) {
    return { chars: Math.round(fraction * contextTokens * 4), source: `skillListingBudgetFraction≈${fraction}; context≈${contextTokens}` };
  }
  return { chars: config.fallbackSkillMetadataBudgetChars, source: 'fallback' };
}

function buildFindings(snapshot, config) {
  const findings = [];
  const add = (severity, code, message, evidence) => findings.push({ severity, code, message, evidence });
  if (snapshot.skills.metadataChars > snapshot.skillBudget.chars) add('high', 'skill-metadata-over-budget', `Active skill metadata is ${snapshot.skills.metadataChars} chars versus an estimated ${snapshot.skillBudget.chars}-char budget.`, 'measured-local + documented-budget-model');
  if (snapshot.markdown.claudeEstimatedTokens > config.maxClaudeMdEstimatedTokens) add('high', 'claude-md-large', `Candidate CLAUDE.md files total ~${snapshot.markdown.claudeEstimatedTokens} estimated tokens.`, 'measured-local; actual loading depends on scope');
  if (snapshot.markdown.ruleEstimatedTokens > config.maxPotentialRulesEstimatedTokens) add('medium', 'rules-large', `Rule files total ~${snapshot.markdown.ruleEstimatedTokens} estimated tokens before path scoping.`, 'measured-local; path-scoped rules are conditional');
  if (snapshot.plugins.enabled > config.maxEnabledPlugins) add('medium', 'many-enabled-plugins', `${snapshot.plugins.enabled} enabled plugins exceed the review threshold ${config.maxEnabledPlugins}.`, 'settings declaration');
  if (snapshot.mcp.declared > config.maxDeclaredMcpServers) add('medium', 'many-mcp-servers', `${snapshot.mcp.declared} declared MCP servers exceed the review threshold ${config.maxDeclaredMcpServers}.`, 'config declaration; tool-schema cost not measured');
  if (snapshot.plugins.marketplaces > config.maxKnownMarketplaces) add('low', 'many-marketplaces', `${snapshot.plugins.marketplaces} known marketplaces exceed the review threshold ${config.maxKnownMarketplaces}.`, 'settings declaration');
  // OPUS-Port: Hook-Flaechen-Kollision (Gesetz I — genau ein mutierender
  // Eigentuemer pro Fläche; passende Hooks laufen parallel und sind nicht komponierbar).
  const surfaces = new Map();
  for (const hook of snapshot.hooks.registered) {
    if (!/^(PreToolUse|PostToolUse)$/.test(hook.event)) continue;
    const key = `${hook.event}:${hook.matcher}`;
    surfaces.set(key, (surfaces.get(key) || 0) + 1);
  }
  for (const [key, count] of surfaces) {
    if (count > 1) add('high', 'hook-surface-collision', `${count} hooks registered on ${key} run concurrently; mutation results are not composable (Gesetz I: exactly one mutating owner per surface).`, 'settings declaration');
  }
  // OPUS-Port: Skill-Namenskollisionen.
  if (snapshot.skills.duplicateNames.length) add('medium', 'skill-name-collision', `${snapshot.skills.duplicateNames.length} skill name collision(s): ${snapshot.skills.duplicateNames.slice(0, 5).join(', ')}.`, 'frontmatter scan across user/project/plugin origins');
  return findings;
}

function buildSnapshot(cwd, config) {
  const repoRoot = findRepoRoot(cwd);
  const skills = collectSkills(repoRoot, config);
  const markdown = collectMarkdownBudget(repoRoot, config);
  const mcp = collectMcp(repoRoot, config);
  const pluginIds = enabledPluginIds(config.settings);
  const marketplaces = knownMarketplaces(config.settings);
  const budget = skillBudgetChars(config);
  const hooks = collectHooks(config.settings);
  const snapshot = {
    schemaVersion: VERSION,
    at: new Date().toISOString(),
    cwd,
    repoRoot,
    assumptions: {
      skillBodiesLoadedOnlyWhenInvoked: true,
      discoveredFilesAreNotNecessarilyLoaded: true,
      tokenCountsAreEstimates: true,
      mcpToolSchemasNotMeasuredByThisScript: true
    },
    skillBudget: budget,
    skills: {
      ...skills.counts,
      metadataChars: skills.metadataChars,
      estimatedMetadataTokens: approxTokensFromChars(skills.metadataChars),
      bodyCharsNotInStandingListing: skills.bodyChars,
      duplicateNames: skills.duplicateNames,
      entries: config.storePaths ? skills.active : skills.active.map(({ file: _file, ...item }) => item)
    },
    hooks: {
      registered: hooks,
      count: hooks.length
    },
    markdown: {
      candidateClaudeMdFiles: markdown.claudeFiles.length,
      claudeBytes: markdown.claudeBytes,
      claudeEstimatedTokens: approxTokensFromChars(markdown.claudeBytes),
      potentialRuleFiles: markdown.ruleFiles.length,
      ruleBytes: markdown.ruleBytes,
      ruleEstimatedTokens: approxTokensFromChars(markdown.ruleBytes),
      ...(config.storePaths ? { claudeFiles: markdown.claudeFiles, ruleFiles: markdown.ruleFiles } : {})
    },
    plugins: {
      enabled: pluginIds.length,
      marketplaces: marketplaces.length,
      ids: config.storePaths ? pluginIds : pluginIds.map((id) => `sha256:${sha256(id).slice(0, 12)}`)
    },
    mcp: {
      declared: mcp.length,
      servers: config.storePaths ? mcp : mcp.map(({ name, scope }) => ({ name, scope }))
    }
  };
  snapshot.findings = buildFindings(snapshot, config);
  return snapshot;
}

function rotateMetricsIfNeeded(config) {
  try {
    if (!fs.existsSync(config.metricsFile) || fs.statSync(config.metricsFile).size < Number(config.metricsMaxBytes)) return;
    const backup = `${config.metricsFile}.1`;
    try { fs.unlinkSync(backup); } catch { /* absent */ }
    fs.renameSync(config.metricsFile, backup);
  } catch { /* observer stays fail-open */ }
}

function advisory(snapshot, config) {
  if (!snapshot.findings.length) return '';
  const top = snapshot.findings.slice(0, 3).map((item) => item.message).join(' ');
  return oneLine(`[prefix-budget] Prefix review recommended. ${top} This is a local inventory, not a bill estimate. Full report: ${config.reportFile}`, config.advisoryMaxChars);
}

function printText(snapshot) {
  console.log(`# Prefix Budget Snapshot\n`);
  console.log(`- Repository: ${snapshot.repoRoot}`);
  console.log(`- Skill metadata: ${snapshot.skills.metadataChars} chars (~${snapshot.skills.estimatedMetadataTokens} est. tokens), budget ${snapshot.skillBudget.chars} chars (${snapshot.skillBudget.source})`);
  console.log(`- Active/discovered skills and commands: ${snapshot.skills.active}/${snapshot.skills.discovered}; name-only: ${snapshot.skills.nameOnly}`);
  console.log(`- Candidate CLAUDE.md: ${snapshot.markdown.candidateClaudeMdFiles} file(s), ${snapshot.markdown.claudeBytes} B (~${snapshot.markdown.claudeEstimatedTokens} est. tokens)`);
  console.log(`- Potential rules: ${snapshot.markdown.potentialRuleFiles} file(s), ${snapshot.markdown.ruleBytes} B (~${snapshot.markdown.ruleEstimatedTokens} est. tokens before path scoping)`);
  console.log(`- Enabled plugins: ${snapshot.plugins.enabled}; marketplaces: ${snapshot.plugins.marketplaces}`);
  console.log(`- Declared MCP servers: ${snapshot.mcp.declared} (schemas not measured)`);
  console.log(`- Registered hooks: ${snapshot.hooks.count}; skill name collisions: ${snapshot.skills.duplicateNames.length}`);
  console.log(`\n## Findings`);
  if (!snapshot.findings.length) console.log(`\nNo configured budget exceeded.`);
  for (const item of snapshot.findings) console.log(`\n- **${item.severity.toUpperCase()} ${item.code}:** ${item.message} _${item.evidence}_`);
}

function selfTest() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prefix-budget-test-'));
  const oldHome = process.env.HOME;
  try {
    const fakeHome = path.join(root, 'home');
    const repo = path.join(root, 'repo');
    fs.mkdirSync(path.join(fakeHome, '.claude', 'skills', 'big'), { recursive: true });
    fs.mkdirSync(path.join(repo, '.claude', 'skills', 'project'), { recursive: true });
    fs.writeFileSync(path.join(fakeHome, '.claude', 'skills', 'big', 'SKILL.md'), `---\nname: big\ndescription: ${'x'.repeat(500)}\n---\nbody`);
    fs.writeFileSync(path.join(repo, '.claude', 'skills', 'project', 'SKILL.md'), `---\nname: project\ndescription: ${'y'.repeat(500)}\n---\nbody`);
    // OPUS-Feature-Test: gleichnamiger Skill in zweiter Quelle (Namenskollision).
    fs.mkdirSync(path.join(repo, '.claude', 'skills', 'big-copy'), { recursive: true });
    fs.writeFileSync(path.join(repo, '.claude', 'skills', 'big-copy', 'SKILL.md'), `---\nname: big\ndescription: dup\n---\nbody`);
    fs.writeFileSync(path.join(repo, 'CLAUDE.md'), 'z'.repeat(5000));
    // OPUS-Feature-Test: zwei mutierende Hooks auf derselben Fläche (Gesetz I).
    fs.writeFileSync(path.join(fakeHome, '.claude', 'settings.json'), JSON.stringify({
      enabledPlugins: { 'one@test': true },
      env: { SLASH_COMMAND_TOOL_CHAR_BUDGET: '600' },
      hooks: { PostToolUse: [{ matcher: 'Bash', hooks: [{ command: 'a.mjs' }, { command: 'b.mjs' }] }] }
    }));
    process.env.HOME = fakeHome;
    process.env.CLAUDE_CONFIG_DIR = path.join(fakeHome, '.claude');
    const config = loadConfig(repo);
    config.reportFile = path.join(root, 'report.json');
    config.metricsFile = path.join(root, 'metrics.jsonl');
    const snapshot = buildSnapshot(repo, config);
    if (snapshot.skills.metadataChars <= 600) throw new Error('Skill metadata test did not exceed budget');
    if (!snapshot.findings.some((item) => item.code === 'skill-metadata-over-budget')) throw new Error('Missing skill budget finding');
    if (!snapshot.findings.some((item) => item.code === 'hook-surface-collision')) throw new Error('Missing hook surface collision finding (OPUS port)');
    if (!snapshot.findings.some((item) => item.code === 'skill-name-collision')) throw new Error('Missing skill name collision finding (OPUS port)');
    if (!snapshot.skills.duplicateNames.includes('big')) throw new Error('Duplicate skill name not recorded');
    writePrivateJson(config.reportFile, snapshot);
    if (!fs.existsSync(config.reportFile)) throw new Error('Report not written');
    console.log('prefix-budget self-test: OK (inkl. OPUS-Kollisionserkennung)');
  } finally {
    if (oldHome === undefined) delete process.env.HOME; else process.env.HOME = oldHome;
    delete process.env.CLAUDE_CONFIG_DIR;
    fs.rmSync(root, { recursive: true, force: true });
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  if (args.has('--self-test')) return selfTest();
  const input = args.has('--report') || args.has('--json') ? null : await readStdinJson();
  const cwd = input ? cwdFrom(input) : process.cwd();
  const config = loadConfig(cwd);
  if (!config.enabled || config.mode === 'off') return;
  const snapshot = buildSnapshot(cwd, config);
  writePrivateJson(config.reportFile, snapshot);
  rotateMetricsIfNeeded(config);
  appendPrivateJsonl(config.metricsFile, {
    at: snapshot.at,
    repoRoot: snapshot.repoRoot,
    skillMetadataChars: snapshot.skills.metadataChars,
    skillBudgetChars: snapshot.skillBudget.chars,
    claudeBytes: snapshot.markdown.claudeBytes,
    ruleBytes: snapshot.markdown.ruleBytes,
    enabledPlugins: snapshot.plugins.enabled,
    declaredMcpServers: snapshot.mcp.declared,
    findingCodes: snapshot.findings.map((item) => item.code)
  });

  if (args.has('--json')) return console.log(JSON.stringify(snapshot, null, 2));
  if (args.has('--report')) return printText(snapshot);
  if (!input || eventName(input) !== 'SessionStart' || config.mode === 'report') return;
  const text = advisory(snapshot, config);
  if (!text) return;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: text } }));
}

main().catch((error) => {
  console.error(`[prefix-budget] fail-open: ${error instanceof Error ? error.message : String(error)}`);
});
