#!/usr/bin/env node

/**
 * Pre-commit hooks generator for @j0kz MCP tools
 * Generates Husky pre-commit hooks with MCP quality checks
 *
 * Usage: npx hooks-generator.js [--strict|--basic|--custom]
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const HOOKS_DIR = '.husky';
const PRE_COMMIT_FILE = join(HOOKS_DIR, 'pre-commit');

const HOOK_TEMPLATES = {
  basic: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running MCP code quality checks..."

# Smart Reviewer - Quick check
echo "📝 Reviewing changed files..."
npx @j0kz/smart-reviewer-mcp@^1.0.0 review_file $(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|js|tsx|jsx)$' | xargs)

# Security Scanner - Critical issues only
echo "🔒 Scanning for security issues..."
npx @j0kz/security-scanner-mcp@^1.0.0 scan_secrets $(git diff --cached --name-only --diff-filter=ACM | xargs)

echo "✅ Pre-commit checks complete!"
`,

  strict: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running strict MCP quality gate..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(ts|js|tsx|jsx)$')

if [ -z "$STAGED_FILES" ]; then
  echo "No relevant files to check"
  exit 0
fi

# Smart Reviewer - Strict mode
echo "📝 Code review (strict mode)..."
npx @j0kz/smart-reviewer-mcp@^1.0.0 batch_review $STAGED_FILES --severity strict || {
  echo "❌ Code review found critical issues!"
  exit 1
}

# Security Scanner - All checks
echo "🔒 Security scan..."
npx @j0kz/security-scanner-mcp@^1.0.0 scan_project . --min-severity medium || {
  echo "❌ Security vulnerabilities detected!"
  exit 1
}

# Test Generator - Check coverage
echo "🧪 Checking test coverage..."
npx @j0kz/test-generator-mcp@^1.0.0 check_coverage $STAGED_FILES || {
  echo "⚠️ Missing test coverage for some files"
}

# Refactor Assistant - Suggest improvements
echo "🔧 Checking for refactoring opportunities..."
npx @j0kz/refactor-assistant-mcp@^1.0.0 suggest_refactorings $STAGED_FILES

# Architecture Analyzer - Check for issues
echo "🏗️ Validating architecture..."
npx @j0kz/architecture-analyzer-mcp@^1.0.0 find_circular_deps . || {
  echo "❌ Circular dependencies detected!"
  exit 1
}

echo "✅ All quality checks passed!"
`,

  minimal: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Quick MCP check..."

# Just security scan for secrets
npx @j0kz/security-scanner-mcp@^1.0.0 scan_secrets $(git diff --cached --name-only --diff-filter=ACM | xargs)

echo "✅ Done!"
`,

  custom: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running custom MCP checks..."

# Customize these checks based on your needs:

# 1. Code Review (moderate severity)
# npx @j0kz/smart-reviewer-mcp@^1.0.0 review_file <files>

# 2. Security Scan (high/critical only)
# npx @j0kz/security-scanner-mcp@^1.0.0 scan_project . --min-severity high

# 3. Test Coverage
# npx @j0kz/test-generator-mcp@^1.0.0 check_coverage <files>

# 4. Architecture Validation
# npx @j0kz/architecture-analyzer-mcp@^1.0.0 analyze_architecture .

# 5. API Design Validation
# npx @j0kz/api-designer-mcp@^1.0.0 validate_api <spec-file>

# 6. Database Schema Validation
# npx @j0kz/db-schema-mcp@^1.0.0 validate_schema <schema-file>

echo "✅ Custom checks complete!"
`,
};

function installHusky() {
  console.log('📦 Installing Husky...');
  try {
    execSync('npm install --save-dev husky', { stdio: 'inherit' });
    execSync('npx husky init', { stdio: 'inherit' });
    console.log('✅ Husky installed successfully');
  } catch (error) {
    console.error('❌ Failed to install Husky:', error.message);
    process.exit(1);
  }
}

function generateHook(type = 'basic') {
  if (!HOOK_TEMPLATES[type]) {
    console.error(`❌ Unknown hook type: ${type}`);
    console.log('Available types: basic, strict, minimal, custom');
    process.exit(1);
  }

  // Check if Husky is installed
  if (!existsSync(HOOKS_DIR)) {
    console.log('Husky not found. Installing...');
    installHusky();
  }

  // Generate pre-commit hook
  console.log(`📝 Generating ${type} pre-commit hook...`);
  writeFileSync(PRE_COMMIT_FILE, HOOK_TEMPLATES[type], { mode: 0o755 });

  console.log(`✅ Pre-commit hook created: ${PRE_COMMIT_FILE}`);
  console.log('\n🎯 Next steps:');
  console.log('1. Commit your changes to activate the hook');
  console.log('2. The hook will run automatically on git commit');
  console.log(`3. Edit ${PRE_COMMIT_FILE} to customize checks`);
}

function showHelp() {
  console.log(`
📚 MCP Pre-commit Hooks Generator

Usage:
  npx hooks-generator.js [type]

Types:
  basic    - Quick code review and security scan (default)
  strict   - Comprehensive checks (review, security, tests, architecture)
  minimal  - Just scan for secrets (fastest)
  custom   - Template with all tools commented out (customize yourself)

Examples:
  npx hooks-generator.js              # Generate basic hook
  npx hooks-generator.js strict       # Generate strict hook
  npx hooks-generator.js custom       # Generate customizable template

After generation:
  - Hook is automatically executable
  - Runs on every git commit
  - Edit .husky/pre-commit to customize
  `);
}

// Main
const args = process.argv.slice(2);
const command = args[0] || 'basic';

if (command === '--help' || command === '-h') {
  showHelp();
} else {
  generateHook(command);
}
