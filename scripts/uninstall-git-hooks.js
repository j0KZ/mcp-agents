#!/usr/bin/env node
/**
 * Uninstall git hooks for @j0kz/mcp-agents
 * Removes hooks from .git/hooks/ and restores backups if available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const HOOKS_TARGET_DIR = path.join(ROOT_DIR, '.git', 'hooks');
const HOOKS = ['pre-commit', 'commit-msg', 'pre-push'];

console.log('🗑️  Uninstalling git hooks...\n');

// Check if .git directory exists
if (!fs.existsSync(path.join(ROOT_DIR, '.git'))) {
  console.error('❌ Error: .git directory not found.');
  console.error('Make sure you are in a git repository.\n');
  process.exit(1);
}

let removedCount = 0;
let restoredCount = 0;

for (const hook of HOOKS) {
  const hookPath = path.join(HOOKS_TARGET_DIR, hook);
  const backupPath = `${hookPath}.backup`;

  // Remove hook if it exists
  if (fs.existsSync(hookPath)) {
    fs.unlinkSync(hookPath);
    console.log(`✓ ${hook}: Removed`);
    removedCount++;

    // Restore backup if available
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, hookPath);
      console.log(`  └─ Restored backup`);
      restoredCount++;
    }
  } else {
    console.log(`⚠️  ${hook}: Not found (already uninstalled)`);
  }
}

console.log('');
console.log('─'.repeat(50));
console.log(`✅ Removed ${removedCount} hook(s)`);
if (restoredCount > 0) {
  console.log(`📦 Restored ${restoredCount} backup(s)`);
}
console.log('─'.repeat(50));
console.log('');
console.log('✅ Git hooks uninstalled successfully.');
console.log('');
console.log('💡 To reinstall:');
console.log('    npm run hooks:install');
console.log('');
