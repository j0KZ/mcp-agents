#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'claude-code');
const MCP_CONFIG_FILE = join(CONFIG_DIR, 'mcp_config.json');

console.log('🚀 Installing My Claude Agents globally...\n');

// Ensure config directory exists
if (!existsSync(CONFIG_DIR)) {
  console.log('📁 Creating config directory...');
  mkdirSync(CONFIG_DIR, { recursive: true });
}

// Get absolute path to project
const projectRoot = process.cwd();
console.log(`📂 Project root: ${projectRoot}\n`);

// Build all packages
console.log('🔨 Building all agents...');
try {
  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });
  console.log('✅ Build completed\n');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// MCP server configurations
const mcpServers = {
  'smart-reviewer': {
    command: 'node',
    args: [join(projectRoot, 'packages', 'smart-reviewer', 'dist', 'mcp-server.js')],
    description: 'Smart Code Reviewer - Intelligent code review with learning capabilities',
  },
  'test-generator': {
    command: 'node',
    args: [join(projectRoot, 'packages', 'test-generator', 'dist', 'mcp-server.js')],
    description: 'Test Intelligence Generator - Automated test generation with edge cases',
  },
  'architecture-analyzer': {
    command: 'node',
    args: [join(projectRoot, 'packages', 'architecture-analyzer', 'dist', 'mcp-server.js')],
    description: 'Architecture Analyzer - Architecture analysis and visualization',
  },
};

// Read existing MCP config or create new one
let mcpConfig = { mcpServers: {} };

if (existsSync(MCP_CONFIG_FILE)) {
  console.log('📖 Reading existing MCP configuration...');
  try {
    const content = readFileSync(MCP_CONFIG_FILE, 'utf-8');
    mcpConfig = JSON.parse(content);
  } catch (error) {
    console.log('⚠️  Could not parse existing config, creating new one');
  }
}

// Add/update our servers
console.log('📝 Registering MCP servers...');
for (const [name, config] of Object.entries(mcpServers)) {
  mcpConfig.mcpServers[name] = config;
  console.log(`  ✅ ${name}`);
}

// Write updated config
try {
  writeFileSync(MCP_CONFIG_FILE, JSON.stringify(mcpConfig, null, 2), 'utf-8');
  console.log(`\n✅ Configuration saved to: ${MCP_CONFIG_FILE}\n`);
} catch (error) {
  console.error('❌ Failed to write config file');
  process.exit(1);
}

// Verify installation
console.log('🔍 Verifying installation...');
console.log('\nRegistered MCP Servers:');
for (const name of Object.keys(mcpServers)) {
  console.log(`  • ${name}`);
}

console.log('\n✨ Installation complete!\n');
console.log('📚 Usage:');
console.log('  claude code "Review this file with smart-reviewer"');
console.log('  claude code "Generate tests with test-generator"');
console.log('  claude code "Analyze architecture with architecture-analyzer"\n');
console.log('💡 Tip: Agents are now available in ALL your projects when using Claude Code!\n');
