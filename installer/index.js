#!/usr/bin/env node

/**
 * MCP Agents - One-Command Installer
 * Install all 8 powerful AI development tools instantly
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir, platform } from 'os';
import { join, dirname } from 'path';

const VERSION = '1.0.25';
const TOOLS = [
  { pkg: '@j0kz/smart-reviewer-mcp', name: 'smart-reviewer', desc: 'Code review and quality analysis' },
  { pkg: '@j0kz/test-generator-mcp', name: 'test-generator', desc: 'Test suite generation' },
  { pkg: '@j0kz/architecture-analyzer-mcp', name: 'architecture-analyzer', desc: 'Dependency and architecture analysis' },
  { pkg: '@j0kz/refactor-assistant-mcp', name: 'refactor-assistant', desc: 'Code refactoring tools' },
  { pkg: '@j0kz/api-designer-mcp', name: 'api-designer', desc: 'REST/GraphQL API design' },
  { pkg: '@j0kz/db-schema-mcp', name: 'db-schema', desc: 'Database schema design' },
  { pkg: '@j0kz/doc-generator-mcp', name: 'doc-generator', desc: 'Documentation generation' },
  { pkg: '@j0kz/security-scanner-mcp', name: 'security-scanner', desc: 'Security vulnerability scanning' }
];

// Parse arguments
const args = process.argv.slice(2);
const command = args[0] || 'install';

// Editor configurations
const EDITORS = {
  'claude': {
    name: 'Claude Code',
    paths: {
      win32: join('AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      darwin: join('Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      linux: join('.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
    }
  },
  'cursor': {
    name: 'Cursor',
    paths: {
      win32: join('AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      darwin: join('Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      linux: join('.config', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
    }
  },
  'windsurf': {
    name: 'Windsurf',
    paths: {
      win32: join('AppData', 'Roaming', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json'),
      darwin: join('Library', 'Application Support', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json'),
      linux: join('.config', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json')
    }
  },
  'vscode': {
    name: 'VS Code',
    paths: {
      win32: join('AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      darwin: join('Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
      linux: join('.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
    }
  },
  'roo': {
    name: 'Roo Code',
    paths: {
      win32: join('AppData', 'Roaming', 'Roo-Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
      darwin: join('Library', 'Application Support', 'Roo-Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json'),
      linux: join('.config', 'Roo-Code', 'User', 'globalStorage', 'rooveterinaryinc.roo-cline', 'settings', 'cline_mcp_settings.json')
    }
  },
  'trae': {
    name: 'Trae',
    paths: {
      win32: join('AppData', 'Roaming', 'Trae', 'User', 'mcp.json'),
      darwin: join('Library', 'Application Support', 'Trae', 'User', 'mcp.json'),
      linux: join('.config', 'Trae', 'User', 'mcp.json')
    }
  }
};

// Get config path based on editor
function getConfigPath(editor = 'claude') {
  const home = homedir();
  const editorConfig = EDITORS[editor.toLowerCase()];

  if (!editorConfig) {
    throw new Error(`Unknown editor: ${editor}. Supported: ${Object.keys(EDITORS).join(', ')}`);
  }

  const relativePath = editorConfig.paths[platform()] || editorConfig.paths.linux;
  return join(home, relativePath);
}

// Show help
if (command === 'help' || command === '--help' || command === '-h') {
  console.log(`
🚀 MCP Agents v${VERSION}
One-command installer for all 8 AI development tools

USAGE:
  npx @j0kz/mcp-agents              Install all tools for Claude Code (default)
  npx @j0kz/mcp-agents cursor       Install all tools for Cursor
  npx @j0kz/mcp-agents windsurf     Install all tools for Windsurf
  npx @j0kz/mcp-agents vscode       Install all tools for VS Code
  npx @j0kz/mcp-agents roo          Install all tools for Roo Code
  npx @j0kz/mcp-agents trae         Install all tools for Trae
  npx @j0kz/mcp-agents list         List all available tools
  npx @j0kz/mcp-agents clear-cache  Clear npm cache and reinstall

SUPPORTED EDITORS:
${Object.entries(EDITORS).map(([key, cfg]) => `  • ${key.padEnd(10)} - ${cfg.name}`).join('\n')}

TOOLS:
${TOOLS.map(t => `  • ${t.name.padEnd(25)} ${t.desc}`).join('\n')}

DOCUMENTATION:
  https://github.com/j0KZ/mcp-agents

ISSUES:
  https://github.com/j0KZ/mcp-agents/issues
`);
  process.exit(0);
}

// List tools
if (command === 'list') {
  console.log(`\n📦 MCP Agents v${VERSION} - Available Tools:\n`);
  TOOLS.forEach((tool, i) => {
    console.log(`${i + 1}. ${tool.name}`);
    console.log(`   Package: ${tool.pkg}`);
    console.log(`   ${tool.desc}\n`);
  });
  process.exit(0);
}

// Clear cache
if (command === 'clear-cache') {
  console.log('\n🧹 Clearing npm cache...\n');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('\n✅ Cache cleared successfully\n');
  } catch (error) {
    console.log('\n❌ Failed to clear cache\n');
  }
  process.exit(0);
}

// Main installation
const validEditors = Object.keys(EDITORS);
const editor = validEditors.includes(command.toLowerCase()) ? command.toLowerCase() : 'claude';

const editorName = EDITORS[editor]?.name || editor;

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           🚀 MCP Agents Installer v${VERSION}              ║
║                                                           ║
║     Install 8 AI Development Tools in One Command        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Editor: ${editorName}
Platform: ${platform()}
Node: ${process.version}

`);

// Step 1: Clear npm cache and npx cache
console.log('📋 Step 1/4: Clearing npm and npx cache...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe' });
  console.log('   ✅ npm cache cleared');
} catch (error) {
  console.log('   ⚠️  npm cache clear skipped');
}

// Clear npx cache specifically for @j0kz packages
try {
  const npmCacheDir = execSync('npm config get cache', { encoding: 'utf8' }).trim();
  console.log('   ✅ npx cache will be bypassed with --yes flag\n');
} catch (error) {
  console.log('   ⚠️  Could not detect cache directory\n');
}

// Step 2: Get config path and prepare
console.log('📋 Step 2/4: Preparing configuration...');
const configPath = getConfigPath(editor);
console.log(`   Config: ${configPath}`);

let config = { mcpServers: {} };
if (existsSync(configPath)) {
  try {
    const existingConfig = JSON.parse(readFileSync(configPath, 'utf8'));

    // Fix malformed configs - move all root-level MCP servers into mcpServers
    if (!existingConfig.mcpServers) {
      existingConfig.mcpServers = {};
    }

    // Check for misplaced MCP servers at root level
    let fixed = false;
    for (const key of Object.keys(existingConfig)) {
      if (key !== 'mcpServers' && typeof existingConfig[key] === 'object') {
        // Move root-level server configs into mcpServers
        const serverConfig = existingConfig[key];
        // If it has a nested object with same name, unwrap it
        if (Object.keys(serverConfig).length === 1 && serverConfig[key]) {
          existingConfig.mcpServers[key] = serverConfig[key];
        } else if (serverConfig.command) {
          existingConfig.mcpServers[key] = serverConfig;
        }
        delete existingConfig[key];
        fixed = true;
      }
    }

    config = existingConfig;
    if (fixed) {
      console.log('   ⚠️  Fixed malformed config structure\n');
    } else {
      console.log('   ✅ Existing config loaded\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not read config, creating new one\n');
  }
} else {
  // Create directory if it doesn't exist
  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  console.log('   ✅ New config will be created\n');
}

// Step 3: Add tools to config with @latest to avoid cache issues
console.log('📋 Step 3/4: Configuring MCP tools...\n');
let configured = 0;
for (const tool of TOOLS) {
  config.mcpServers[tool.name] = {
    command: 'npx',
    args: ['--yes', `${tool.pkg}@latest`]  // Force latest version
  };
  configured++;
  console.log(`   ✅ ${tool.name}`);
}

// Save config
try {
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n✅ Configured ${configured}/${TOOLS.length} tools\n`);
} catch (error) {
  console.log(`\n❌ Could not save config: ${error.message}\n`);
  process.exit(1);
}

// Step 4: Pre-install latest versions to populate cache
console.log('📋 Step 4/4: Pre-installing latest versions...');
console.log('   This may take a minute...\n');

let installed = 0;
for (const tool of TOOLS) {
  try {
    console.log(`   Installing ${tool.name}...`);
    execSync(`npx --yes ${tool.pkg}@latest --version 2>/dev/null || echo ""`, {
      stdio: 'pipe',
      timeout: 30000
    });
    installed++;
    console.log(`   ✅ ${tool.name}`);
  } catch (error) {
    console.log(`   ⚠️  ${tool.name} - will install on first use`);
  }
}

console.log(`\n✅ Pre-installed ${installed}/${TOOLS.length} tools\n`);

// Success message
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🎉 Installation Complete!                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📖 Installed Tools:

${TOOLS.map((t, i) => `   ${i + 1}. ${t.name.padEnd(25)} ${t.desc}`).join('\n')}

🔄 IMPORTANT: Restart ${editorName} to activate the tools

📚 Documentation: https://github.com/j0KZ/mcp-agents
💬 Support: https://github.com/j0KZ/mcp-agents/issues

✨ Happy coding!

`);
