#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'claude-code');
const MCP_CONFIG_FILE = join(CONFIG_DIR, 'mcp_config.json');

console.log('🔍 Verifying My Claude Agents setup...\n');

// Check if config file exists
if (!existsSync(MCP_CONFIG_FILE)) {
  console.log('❌ MCP config file not found');
  console.log(`   Expected at: ${MCP_CONFIG_FILE}`);
  console.log('\n💡 Run "npm run install-global" to set up the agents\n');
  process.exit(1);
}

// Read and parse config
let mcpConfig;
try {
  const content = readFileSync(MCP_CONFIG_FILE, 'utf-8');
  mcpConfig = JSON.parse(content);
  console.log('✅ MCP config file found and valid\n');
} catch (error) {
  console.error('❌ Failed to parse MCP config file');
  process.exit(1);
}

// Check for our agents
const requiredAgents = ['smart-reviewer', 'test-generator', 'architecture-analyzer'];
const foundAgents = [];
const missingAgents = [];

for (const agentName of requiredAgents) {
  if (mcpConfig.mcpServers && mcpConfig.mcpServers[agentName]) {
    foundAgents.push(agentName);
  } else {
    missingAgents.push(agentName);
  }
}

console.log('📊 Agent Status:');
for (const agentName of requiredAgents) {
  const status = foundAgents.includes(agentName) ? '✅' : '❌';
  console.log(`  ${status} ${agentName}`);
}

console.log('\n');

// Check if agent files exist
const projectRoot = process.cwd();
console.log('📂 Checking agent files...');

const agentPaths = {
  'smart-reviewer': join(projectRoot, 'packages', 'smart-reviewer', 'dist', 'mcp-server.js'),
  'test-generator': join(projectRoot, 'packages', 'test-generator', 'dist', 'mcp-server.js'),
  'architecture-analyzer': join(
    projectRoot,
    'packages',
    'architecture-analyzer',
    'dist',
    'mcp-server.js'
  ),
};

for (const [name, path] of Object.entries(agentPaths)) {
  const exists = existsSync(path);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${name}: ${exists ? 'Built' : 'Not built'}`);
}

console.log('\n');

// Summary
if (missingAgents.length === 0 && Object.values(agentPaths).every(existsSync)) {
  console.log('✨ All agents are properly configured and built!\n');
  console.log('📚 Usage examples:');
  console.log('  claude code "Review src/app.js with smart-reviewer"');
  console.log('  claude code "Generate tests for src/utils.js"');
  console.log('  claude code "Analyze project architecture"\n');
  process.exit(0);
} else {
  console.log('⚠️  Setup incomplete:\n');

  if (missingAgents.length > 0) {
    console.log('Missing from MCP config:');
    missingAgents.forEach(name => console.log(`  • ${name}`));
  }

  const notBuilt = Object.entries(agentPaths).filter(([_, path]) => !existsSync(path));
  if (notBuilt.length > 0) {
    console.log('\nNot built:');
    notBuilt.forEach(([name]) => console.log(`  • ${name}`));
  }

  console.log('\n💡 Run "npm run build && npm run install-global" to complete setup\n');
  process.exit(1);
}
