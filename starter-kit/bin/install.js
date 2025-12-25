#!/usr/bin/env node
/* eslint-disable no-undef, no-unused-vars, no-empty */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawnSync } = require('child_process');

const CYAN = '\x1b[36m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  RED = '\x1b[31m';
const RESET = '\x1b[0m',
  BOLD = '\x1b[1m',
  DIM = '\x1b[2m';

function log(msg, color = RESET) {
  console.log(color + msg + RESET);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// Component definitions
const COMPONENTS = {
  claude_md: { name: 'CLAUDE.md Template', desc: 'Starter template', def: true },
  skills: { name: 'Universal Skills', desc: '29 developer skills', def: true },
  commands: { name: 'Slash Commands', desc: '5 productivity commands (/setup, /optimize, etc.)', def: true },
  hooks: { name: 'Automation Hooks', desc: 'Security monitor, auto-format, test runner', def: true },
  mcp: { name: 'MCP Tools', desc: '@j0kz MCP tools', def: false },
  mcp_configs: { name: 'MCP Configs', desc: 'Docker gateway + essential servers (95% token savings)', def: true },
  agents: { name: 'hcom-agents', desc: 'Agent coordination + token efficiency', def: false },
  dashboard: { name: 'Dashboard', desc: 'claude-comms live events', def: false },
  references: { name: 'References', desc: 'Work logs, patterns guides', def: true },
};

const MCP_TOOLS = [
  'smart-reviewer',
  'test-generator',
  'architecture-analyzer',
  'security-scanner',
  'refactor-assistant',
  'doc-generator',
  'orchestrator-mcp',
  'api-designer',
  'db-schema',
];

// Detect Python package installer (prefer uv over pip)
function getPythonInstaller() {
  try {
    if (spawnSync('uv', ['--version'], { stdio: 'pipe' }).status === 0) {
      return { cmd: 'uv', args: ['pip', 'install'], name: 'uv (fast)' };
    }
  } catch (e) {}
  try {
    if (spawnSync('pip', ['--version'], { stdio: 'pipe' }).status === 0) {
      return { cmd: 'pip', args: ['install'], name: 'pip' };
    }
  } catch (e) {}
  return null;
}

async function prompt(q) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r =>
    rl.question(q, a => {
      rl.close();
      r(a.trim());
    })
  );
}

async function confirm(q, defYes = true) {
  const a = await prompt(q + (defYes ? ' [Y/n] ' : ' [y/N] '));
  return a === '' ? defYes : a.toLowerCase().startsWith('y');
}

async function selectComponents(interactive) {
  const sel = {};
  if (!interactive) {
    const all = process.argv.includes('--all');
    for (const [k, c] of Object.entries(COMPONENTS)) sel[k] = all || c.def;
    return sel;
  }
  log('\n  Select components to install:\n', BOLD);
  for (const [k, c] of Object.entries(COMPONENTS)) {
    log('  ' + c.name + (c.def ? ' (recommended)' : ''), CYAN);
    log('  ' + DIM + c.desc + RESET);
    sel[k] = await confirm('  Install?', c.def);
    console.log();
  }
  return sel;
}

async function selectMcpTools(interactive) {
  if (!interactive) return MCP_TOOLS;
  log('\n  MCP tools: [a] All, [e] Essential, [c] Custom\n', BOLD);
  const ch = await prompt('  Choice [a/e/c]: ');
  if (ch === 'a' || ch === '') return MCP_TOOLS;
  if (ch === 'e') return ['smart-reviewer', 'test-generator', 'security-scanner'];
  const sel = [];
  for (const t of MCP_TOOLS) if (await confirm('  Include ' + t + '?', true)) sel.push(t);
  return sel;
}

function installSkills(targetDir, templateDir) {
  const src = path.join(templateDir, '.claude', 'skills');
  if (!fs.existsSync(src)) return 0;
  copyDir(src, path.join(targetDir, '.claude', 'skills'));
  const cnt = fs.readdirSync(src).filter(f => fs.statSync(path.join(src, f)).isDirectory()).length;
  log('  + ' + cnt + ' skills installed', GREEN);
  return cnt;
}

function installReferences(targetDir, templateDir) {
  const src = path.join(templateDir, '.claude', 'references');
  if (!fs.existsSync(src)) {
    log('  ! References not found', YELLOW);
    return 0;
  }
  copyDir(src, path.join(targetDir, '.claude', 'references'));
  const cnt = fs.readdirSync(src).filter(f => f.endsWith('.md')).length;
  log('  + ' + cnt + ' reference files installed', GREEN);
  return cnt;
}

function installCommands(targetDir, templateDir) {
  const src = path.join(templateDir, '.claude', 'commands');
  if (!fs.existsSync(src)) {
    log('  ! Commands not found', YELLOW);
    return 0;
  }
  copyDir(src, path.join(targetDir, '.claude', 'commands'));
  const cnt = fs.readdirSync(src).filter(f => f.endsWith('.md')).length;
  log('  + ' + cnt + ' slash commands installed', GREEN);
  return cnt;
}

function installHooks(targetDir, templateDir) {
  const src = path.join(templateDir, '.claude', 'hooks');
  if (!fs.existsSync(src)) {
    log('  ! Hooks not found', YELLOW);
    return 0;
  }
  copyDir(src, path.join(targetDir, '.claude', 'hooks'));
  const cnt = fs.readdirSync(src).filter(f => f.endsWith('.json')).length;
  log('  + ' + cnt + ' automation hooks installed', GREEN);
  return cnt;
}

function installMcpConfigs(targetDir, templateDir) {
  const src = path.join(templateDir, '.claude', 'mcp-configs');
  if (!fs.existsSync(src)) {
    log('  ! MCP configs not found', YELLOW);
    return 0;
  }
  copyDir(src, path.join(targetDir, '.claude', 'mcp-configs'));
  const cnt = fs.readdirSync(src).filter(f => f.endsWith('.json')).length;
  log('  + ' + cnt + ' MCP config files installed', GREEN);
  return cnt;
}

function installClaudeMd(targetDir, templateDir, force) {
  const dest = path.join(targetDir, 'CLAUDE.md');
  if (fs.existsSync(dest) && !force) {
    log('  ! CLAUDE.md exists (--force to overwrite)', YELLOW);
    return false;
  }
  if (fs.existsSync(dest)) fs.copyFileSync(dest, dest + '.backup');
  fs.copyFileSync(path.join(templateDir, 'CLAUDE.md'), dest);
  log('  + CLAUDE.md installed', GREEN);
  return true;
}

function installMcpConfig(targetDir, tools) {
  const settingsDir = path.join(targetDir, '.claude');
  const settingsFile = path.join(settingsDir, 'settings.json');
  if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'));
  } catch (e) {}
  settings.mcpServers = settings.mcpServers || {};
  for (const t of tools)
    settings.mcpServers[t] = { command: 'npx', args: ['@j0kz/' + t + '@latest'] };
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  log('  + ' + tools.length + ' MCP tools configured', GREEN);
  return tools;
}

function installHcomAgents(installer) {
  if (!installer) {
    log('  ! No Python pkg manager (install uv or pip)', YELLOW);
    return false;
  }
  return installPythonPackage('hcom-agents', installer);
}

function installPythonPackage(packageName, installer) {
  log('  Installing ' + packageName + ' via ' + installer.name + '...', CYAN);
  try {
    const result = spawnSync(installer.cmd, [...installer.args, packageName], { stdio: 'inherit' });
    if (result.status !== 0) {
      log('  ! Install failed', YELLOW);
      return false;
    }
    log('  + ' + packageName + ' installed', GREEN);
    return true;
  } catch (e) {
    log('  ! Install error: ' + e.message, YELLOW);
    return false;
  }
}

function installDashboard(installer) {
  if (!installer) {
    log('  ! No Python pkg manager (install uv or pip)', YELLOW);
    return false;
  }
  return installPythonPackage('claude-comms', installer);
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');
  const interactive = !args.includes('--yes') && !args.includes('-y') && !args.includes('--all');
  const targetDir = process.cwd();
  const templateDir = path.join(__dirname, '..', 'template');

  log('\n  Claude Code Starter Kit', BOLD + CYAN);
  log('  Universal setup for any project\n', CYAN);

  const pyInstaller = getPythonInstaller();
  if (pyInstaller) log('  Python installer: ' + pyInstaller.name, DIM);

  const sel = await selectComponents(interactive);
  let mcpTools = sel.mcp ? await selectMcpTools(interactive) : [];

  log('\n  Installation Plan:', BOLD);
  if (sel.claude_md) log('  - CLAUDE.md template', GREEN);
  if (sel.skills) log('  - 29 Universal skills', GREEN);
  if (sel.commands) log('  - 5 Slash commands', GREEN);
  if (sel.hooks) log('  - 3 Automation hooks', GREEN);
  if (sel.mcp_configs) log('  - MCP configs (Docker gateway)', GREEN);
  if (sel.mcp) log('  - ' + mcpTools.length + ' MCP tools', GREEN);
  if (sel.references) log('  - Reference guides', GREEN);
  if (sel.agents) log('  - hcom-agents', GREEN);
  if (sel.dashboard) log('  - claude-comms dashboard', GREEN);

  if (interactive && !(await confirm('\n  Proceed?', true))) {
    log('\n  Cancelled.\n', YELLOW);
    return;
  }

  log('\n  Installing...\n', BOLD);
  const inst = {
    claudeMd: false,
    skills: 0,
    commands: 0,
    hooks: 0,
    mcpConfigs: 0,
    references: 0,
    mcp: [],
    agents: false,
    dashboard: false,
  };
  if (sel.claude_md) inst.claudeMd = installClaudeMd(targetDir, templateDir, force);
  if (sel.skills) inst.skills = installSkills(targetDir, templateDir);
  if (sel.commands) inst.commands = installCommands(targetDir, templateDir);
  if (sel.hooks) inst.hooks = installHooks(targetDir, templateDir);
  if (sel.mcp_configs) inst.mcpConfigs = installMcpConfigs(targetDir, templateDir);
  if (sel.references) inst.references = installReferences(targetDir, templateDir);
  if (sel.mcp && mcpTools.length) inst.mcp = installMcpConfig(targetDir, mcpTools);
  if (sel.agents) inst.agents = installHcomAgents(pyInstaller);
  if (sel.dashboard) inst.dashboard = installDashboard(pyInstaller);

  log('\n  Installation Complete!\n', BOLD + GREEN);
  log('  Installed:', BOLD);
  if (inst.claudeMd) log('    + CLAUDE.md', GREEN);
  if (inst.skills) log('    + ' + inst.skills + ' skills', GREEN);
  if (inst.commands) log('    + ' + inst.commands + ' slash commands', GREEN);
  if (inst.hooks) log('    + ' + inst.hooks + ' automation hooks', GREEN);
  if (inst.mcpConfigs) log('    + ' + inst.mcpConfigs + ' MCP configs', GREEN);
  if (inst.references) log('    + ' + inst.references + ' references', GREEN);
  if (inst.mcp.length) log('    + ' + inst.mcp.length + ' MCP tools', GREEN);
  if (inst.agents) log('    + hcom-agents', GREEN);
  if (inst.dashboard) log('    + claude-comms dashboard', GREEN);

  log('\n  Next steps:', BOLD);
  log('    1. Edit CLAUDE.md with your project details');
  if (inst.commands) log('    2. Try: /setup or /optimize');
  if (inst.skills) log('    3. Tell Claude: "Use debug-detective"');
  if (inst.mcp.length) log('    4. Restart Claude Code to load MCP tools');
  if (inst.dashboard) log('    5. Run: claude-comms start');
  console.log();
}

main().catch(e => {
  log('\n  Error: ' + e.message + '\n', RED);
  process.exit(1);
});
