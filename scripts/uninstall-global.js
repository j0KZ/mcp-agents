#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_DIR = join(homedir(), '.config', 'claude-code');
const MCP_CONFIG_FILE = join(CONFIG_DIR, 'mcp_config.json');

console.log('🗑️  Uninstalling My Claude Agents...\n');

// Check if config file exists
if (!existsSync(MCP_CONFIG_FILE)) {
  console.log('⚠️  MCP config file not found. Nothing to uninstall.');
  process.exit(0);
}

// Read existing MCP config
let mcpConfig;
try {
  const content = readFileSync(MCP_CONFIG_FILE, 'utf-8');
  mcpConfig = JSON.parse(content);
} catch (error) {
  console.error('❌ Failed to read MCP config file');
  process.exit(1);
}

// Remove our servers
const agentsToRemove = ['smart-reviewer', 'test-generator', 'architecture-analyzer'];
let removedCount = 0;

for (const agentName of agentsToRemove) {
  if (mcpConfig.mcpServers && mcpConfig.mcpServers[agentName]) {
    delete mcpConfig.mcpServers[agentName];
    console.log(`  ✅ Removed ${agentName}`);
    removedCount++;
  }
}

if (removedCount === 0) {
  console.log('⚠️  No agents found in configuration. Nothing to uninstall.');
  process.exit(0);
}

// Write updated config
try {
  writeFileSync(MCP_CONFIG_FILE, JSON.stringify(mcpConfig, null, 2), 'utf-8');
  console.log(`\n✅ Configuration updated: ${MCP_CONFIG_FILE}\n`);
} catch (error) {
  console.error('❌ Failed to write config file');
  process.exit(1);
}

console.log(`✨ Successfully uninstalled ${removedCount} agent(s)!\n`);
