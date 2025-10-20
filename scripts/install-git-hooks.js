#!/usr/bin/env node
/**
 * Install git hooks for @j0kz/mcp-agents
 * Copies hooks from .git-hooks/ to .git/hooks/ and makes them executable
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const HOOKS_SOURCE_DIR = path.join(ROOT_DIR, '.git-hooks');
const HOOKS_TARGET_DIR = path.join(ROOT_DIR, '.git', 'hooks');

const HOOKS = ['pre-commit', 'commit-msg', 'pre-push'];

console.log('🔧 Installing git hooks...\n');

// Check if .git directory exists
if (!fs.existsSync(path.join(ROOT_DIR, '.git'))) {
  console.error('❌ Error: .git directory not found.');
  console.error('Make sure you are in a git repository.\n');
  process.exit(1);
}

// Create .git/hooks if it doesn't exist
if (!fs.existsSync(HOOKS_TARGET_DIR)) {
  fs.mkdirSync(HOOKS_TARGET_DIR, { recursive: true });
  console.log('✓ Created .git/hooks directory\n');
}

// Install each hook
let installedCount = 0;
let skippedCount = 0;

for (const hook of HOOKS) {
  const sourcePath = path.join(HOOKS_SOURCE_DIR, hook);
  const targetPath = path.join(HOOKS_TARGET_DIR, hook);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  ${hook}: Source not found, skipping`);
    skippedCount++;
    continue;
  }

  // Backup existing hook if present
  if (fs.existsSync(targetPath)) {
    const backupPath = `${targetPath}.backup`;
    fs.copyFileSync(targetPath, backupPath);
    console.log(`📦 ${hook}: Backed up existing hook to ${path.basename(backupPath)}`);
  }

  // Copy hook
  fs.copyFileSync(sourcePath, targetPath);

  // Make executable (Unix-style chmod 755)
  try {
    if (process.platform !== 'win32') {
      execSync(`chmod +x "${targetPath}"`);
    } else {
      // On Windows, git bash handles hook execution
      console.log(`   (Windows detected - git bash will handle execution)`);
    }
  } catch (error) {
    console.warn(`⚠️  ${hook}: Could not make executable (${error.message})`);
  }

  console.log(`✓ ${hook}: Installed successfully`);
  installedCount++;
}

console.log('');
console.log('─'.repeat(50));
console.log(`✅ Installed ${installedCount} hook(s)`);
if (skippedCount > 0) {
  console.log(`⚠️  Skipped ${skippedCount} hook(s)`);
}
console.log('─'.repeat(50));
console.log('');

// Show what each hook does
console.log('📋 Hook Summary:');
console.log('');
console.log('  pre-commit   - Fast checks on staged files (~30s)');
console.log('                 ESLint, Prettier, TypeScript, Code review');
console.log('');
console.log('  commit-msg   - Validate conventional commits (~1s)');
console.log('                 Format: type(scope): description');
console.log('');
console.log('  pre-push     - Comprehensive validation (~2-5min)');
console.log('                 Tests, coverage, build, security');
console.log('');
console.log('─'.repeat(50));
console.log('');
console.log('💡 Tips:');
console.log('');
console.log('  Skip hooks for one commit:');
console.log('    git commit --no-verify');
console.log('');
console.log('  Skip hooks for one push:');
console.log('    git push --no-verify');
console.log('');
console.log('  Uninstall hooks:');
console.log('    npm run hooks:uninstall');
console.log('');
console.log('  See documentation:');
console.log('    cat .git-hooks/README.md');
console.log('');
console.log('✅ Git hooks ready! They will run automatically on commit/push.');
console.log('');
