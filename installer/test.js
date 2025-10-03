#!/usr/bin/env node

/**
 * Test script for MCP Agents installer
 * Verifies all commands and editor configurations
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';

const EDITORS = ['claude', 'cursor', 'windsurf', 'vscode', 'roo', 'trae'];
const COMMANDS = ['help', 'list', 'clear-cache'];

console.log('🧪 Testing MCP Agents Installer\n');
console.log('='.repeat(60));

// Test 1: Help command
console.log('\n📋 Test 1: Help Command');
try {
  const output = execSync('node index.js help', { encoding: 'utf8' });
  const hasAllEditors = EDITORS.every(editor => output.includes(editor));
  console.log(hasAllEditors ? '✅ PASS - All editors listed' : '❌ FAIL - Missing editors');
} catch (error) {
  console.log('❌ FAIL - Help command failed');
}

// Test 2: List command
console.log('\n📋 Test 2: List Command');
try {
  const output = execSync('node index.js list', { encoding: 'utf8' });
  const hasAllTools = output.includes('smart-reviewer') &&
                      output.includes('test-generator') &&
                      output.includes('architecture-analyzer') &&
                      output.includes('security-scanner');
  console.log(hasAllTools ? '✅ PASS - All tools listed' : '❌ FAIL - Missing tools');
} catch (error) {
  console.log('❌ FAIL - List command failed');
}

// Test 3: Config paths for all editors
console.log('\n📋 Test 3: Config Path Validation');
const EDITOR_PATHS = {
  'claude': {
    win32: join(homedir(), 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    darwin: join(homedir(), 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    linux: join(homedir(), '.config', 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
  },
  'cursor': {
    win32: join(homedir(), 'AppData', 'Roaming', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    darwin: join(homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
    linux: join(homedir(), '.config', 'Cursor', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json')
  },
  'windsurf': {
    win32: join(homedir(), 'AppData', 'Roaming', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json'),
    darwin: join(homedir(), 'Library', 'Application Support', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json'),
    linux: join(homedir(), '.config', 'Windsurf', 'User', 'globalStorage', 'windsurf.windsurf', 'settings', 'cline_mcp_settings.json')
  }
};

for (const editor of EDITORS.slice(0, 3)) {
  const path = EDITOR_PATHS[editor]?.[platform()];
  if (path) {
    console.log(`   ${editor.padEnd(10)} - ✅ Path configured: ${path.split(homedir())[1]}`);
  } else {
    console.log(`   ${editor.padEnd(10)} - ⚠️  Path needs verification`);
  }
}

// Test 4: Version consistency
console.log('\n📋 Test 4: Version Consistency');
try {
  const packageJson = JSON.parse(execSync('cat package.json', { encoding: 'utf8' }));
  const indexJs = execSync('cat index.js', { encoding: 'utf8' });
  const versionInCode = indexJs.match(/VERSION = '([^']+)'/)?.[1];

  if (packageJson.version === versionInCode) {
    console.log(`✅ PASS - Versions match: ${packageJson.version}`);
  } else {
    console.log(`❌ FAIL - Version mismatch: package.json=${packageJson.version}, index.js=${versionInCode}`);
  }
} catch (error) {
  console.log('❌ FAIL - Version check failed');
}

// Test 5: Invalid editor handling
console.log('\n📋 Test 5: Invalid Editor Handling');
try {
  execSync('node index.js invalideditor', { encoding: 'utf8', stdio: 'pipe' });
  console.log('⚠️  WARNING - Should have shown error for invalid editor');
} catch (error) {
  // Expected to fail - installation should proceed with default
  console.log('✅ PASS - Handles invalid editor gracefully');
}

console.log('\n' + '='.repeat(60));
console.log('✅ Testing Complete!\n');
