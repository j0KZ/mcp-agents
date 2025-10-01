#!/usr/bin/env node

/**
 * Install all @j0kz MCP agents at once
 * Works with Claude Code, Cursor, Windsurf, Roo Code, and other MCP-compatible editors
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

console.log('🚀 @j0kz MCP Agents - Universal Installer\n');
console.log('Compatible with: Claude Code, Cursor, Windsurf, Roo Code, Continue, and more!\n');

const packages = [
  {
    name: 'smart-reviewer',
    npm: '@j0kz/smart-reviewer-mcp',
    description: 'AI-powered code review'
  },
  {
    name: 'test-generator',
    npm: '@j0kz/test-generator-mcp',
    description: 'Automated test generation'
  },
  {
    name: 'architecture-analyzer',
    npm: '@j0kz/architecture-analyzer-mcp',
    description: 'Architecture analysis and dependency graphs'
  }
];

// Detect available editors and install
const editors = [];

// Check for Claude Code
try {
  execSync('claude --version', { stdio: 'pipe' });
  editors.push('claude-code');
  console.log('✅ Detected: Claude Code\n');
} catch {
  console.log('⚠️  Claude Code not found (optional)\n');
}

// Check for Cursor
const cursorConfig = join(homedir(), '.cursor', 'mcp_config.json');
if (existsSync(cursorConfig)) {
  editors.push('cursor');
  console.log('✅ Detected: Cursor\n');
}

// Check for Windsurf
const windsurfConfig = join(homedir(), '.windsurf', 'settings.json');
if (existsSync(windsurfConfig)) {
  editors.push('windsurf');
  console.log('✅ Detected: Windsurf\n');
}

// Install for Claude Code
if (editors.includes('claude-code')) {
  console.log('📦 Installing for Claude Code...\n');

  for (const pkg of packages) {
    try {
      console.log(`  Installing ${pkg.name}...`);
      execSync(`claude mcp add ${pkg.name} "npx ${pkg.npm}" --scope user`, {
        stdio: 'inherit'
      });
      console.log(`  ✅ ${pkg.name} installed\n`);
    } catch (error) {
      console.log(`  ⚠️  ${pkg.name} already exists or failed\n`);
    }
  }

  console.log('📊 Verifying Claude Code installation...\n');
  try {
    execSync('claude mcp list', { stdio: 'inherit' });
  } catch {}
}

// Install for Cursor
if (editors.includes('cursor')) {
  console.log('\n📦 Installing for Cursor...\n');

  let config = { mcpServers: {} };
  if (existsSync(cursorConfig)) {
    try {
      config = JSON.parse(readFileSync(cursorConfig, 'utf-8'));
    } catch {}
  }

  for (const pkg of packages) {
    config.mcpServers[pkg.name] = {
      command: 'npx',
      args: [pkg.npm]
    };
    console.log(`  ✅ ${pkg.name} configured`);
  }

  writeFileSync(cursorConfig, JSON.stringify(config, null, 2));
  console.log('\n✅ Cursor configuration updated\n');
}

// Install for Windsurf
if (editors.includes('windsurf')) {
  console.log('\n📦 Installing for Windsurf...\n');

  let config = {};
  if (existsSync(windsurfConfig)) {
    try {
      config = JSON.parse(readFileSync(windsurfConfig, 'utf-8'));
    } catch {}
  }

  if (!config.mcp) config.mcp = { servers: {} };

  for (const pkg of packages) {
    config.mcp.servers[pkg.name] = {
      command: `npx ${pkg.npm}`
    };
    console.log(`  ✅ ${pkg.name} configured`);
  }

  writeFileSync(windsurfConfig, JSON.stringify(config, null, 2));
  console.log('\n✅ Windsurf configuration updated\n');
}

// Manual instructions for other editors
if (editors.length === 0) {
  console.log('⚠️  No supported editors detected automatically.\n');
  console.log('📖 Manual installation for your editor:\n');
  console.log('Add this to your editor\'s MCP configuration:\n');
  console.log(JSON.stringify({
    mcpServers: packages.reduce((acc, pkg) => {
      acc[pkg.name] = {
        command: 'npx',
        args: [pkg.npm]
      };
      return acc;
    }, {})
  }, null, 2));
  console.log('\n');
}

// Summary
console.log('\n✨ Installation Complete!\n');
console.log('📦 Installed MCPs:');
packages.forEach(pkg => {
  console.log(`  • ${pkg.name} - ${pkg.description}`);
});

if (editors.length > 0) {
  console.log(`\n🎯 Configured for: ${editors.join(', ')}`);
}

console.log('\n📚 Usage Examples:');
console.log('  "Review this file for code quality issues"');
console.log('  "Generate tests for src/utils.js"');
console.log('  "Analyze project architecture"');

console.log('\n🔗 Documentation: https://github.com/j0kz/mcp-agents');
console.log('📦 NPM: https://www.npmjs.com/~j0kz\n');
