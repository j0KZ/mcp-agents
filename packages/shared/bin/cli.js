#!/usr/bin/env node

/**
 * MCP Agents Installer
 * One-command installation for all 8 MCP tools
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const VERSION = '1.0.20';
const TOOLS = [
  '@j0kz/smart-reviewer-mcp',
  '@j0kz/test-generator-mcp',
  '@j0kz/architecture-analyzer-mcp',
  '@j0kz/refactor-assistant-mcp',
  '@j0kz/api-designer-mcp',
  '@j0kz/db-schema-mcp',
  '@j0kz/doc-generator-mcp',
  '@j0kz/security-scanner-mcp',
];

const TOOL_NAMES = {
  '@j0kz/smart-reviewer-mcp': 'smart-reviewer',
  '@j0kz/test-generator-mcp': 'test-generator',
  '@j0kz/architecture-analyzer-mcp': 'architecture-analyzer',
  '@j0kz/refactor-assistant-mcp': 'refactor-assistant',
  '@j0kz/api-designer-mcp': 'api-designer',
  '@j0kz/db-schema-mcp': 'db-schema',
  '@j0kz/doc-generator-mcp': 'doc-generator',
  '@j0kz/security-scanner-mcp': 'security-scanner',
};

console.log(`\n🚀 MCP Agents Installer v${VERSION}\n`);
console.log('📦 Installing 8 powerful AI development tools...\n');

// Detect editor
const args = process.argv.slice(2);
const editor = args[0] || 'claude'; // Default to Claude Code

let configPath;
if (process.platform === 'win32') {
  configPath = join(
    homedir(),
    'AppData',
    'Roaming',
    'Code',
    'User',
    'globalStorage',
    'saoudrizwan.claude-dev',
    'settings',
    'cline_mcp_settings.json'
  );
} else {
  configPath = join(
    homedir(),
    'Library',
    'Application Support',
    'Code',
    'User',
    'globalStorage',
    'saoudrizwan.claude-dev',
    'settings',
    'cline_mcp_settings.json'
  );
}

// Step 1: Clear cache
console.log('🧹 Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'pipe' });
  console.log('✅ Cache cleared\n');
} catch (error) {
  console.log('⚠️  Cache clear failed (non-critical)\n');
}

// Step 2: Install latest versions
console.log('📥 Installing packages...\n');
let installed = 0;
for (const tool of TOOLS) {
  try {
    console.log(`   Installing ${tool}@latest...`);
    execSync(`npm install -g ${tool}@latest`, { stdio: 'pipe' });
    installed++;
    console.log(`   ✅ ${tool}`);
  } catch (error) {
    console.log(`   ❌ Failed to install ${tool}`);
  }
}

console.log(`\n✅ Installed ${installed}/${TOOLS.length} packages\n`);

// Step 3: Configure MCP settings
console.log('⚙️  Configuring MCP settings...');

if (existsSync(configPath)) {
  try {
    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    // Add each tool to mcpServers
    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    for (const tool of TOOLS) {
      const name = TOOL_NAMES[tool];
      config.mcpServers[name] = {
        command: 'npx',
        args: [tool],
      };
    }

    writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✅ MCP settings updated\n');
  } catch (error) {
    console.log('⚠️  Could not update MCP settings automatically\n');
  }
} else {
  console.log('⚠️  MCP config file not found. Please configure manually.\n');
}

// Step 4: Success message
console.log('🎉 Installation complete!\n');
console.log('📖 Available tools:');
console.log('   • smart-reviewer - Code review and quality analysis');
console.log('   • test-generator - Test suite generation');
console.log('   • architecture-analyzer - Dependency and architecture analysis');
console.log('   • refactor-assistant - Code refactoring tools');
console.log('   • api-designer - REST/GraphQL API design');
console.log('   • db-schema - Database schema design');
console.log('   • doc-generator - Documentation generation');
console.log('   • security-scanner - Security vulnerability scanning\n');
console.log('🔄 Please restart your editor to use the tools.\n');
console.log('📚 Documentation: https://github.com/j0KZ/mcp-agents\n');
