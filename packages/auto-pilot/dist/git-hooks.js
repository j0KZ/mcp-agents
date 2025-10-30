/**
 * GitHooks: Automated git hooks installation and management
 * Ensures code quality BEFORE it gets committed
 */
import { writeFile, mkdir, chmod, readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
const execAsync = promisify(exec);
export class GitHooks {
    hooksPath;
    constructor() {
        this.hooksPath = path.join(process.cwd(), '.git', 'hooks');
    }
    /**
     * Install a git hook
     */
    async install(hookName, handler) {
        // Create hooks directory if it doesn't exist
        await mkdir(this.hooksPath, { recursive: true });
        let hookScript = '';
        switch (hookName) {
            case 'pre-commit':
                hookScript = this.generatePreCommitHook();
                break;
            case 'pre-push':
                hookScript = this.generatePrePushHook();
                break;
            case 'commit-msg':
                hookScript = this.generateCommitMsgHook();
                break;
            default:
                throw new Error(`Unknown hook: ${hookName}`);
        }
        const hookPath = path.join(this.hooksPath, hookName);
        await writeFile(hookPath, hookScript);
        // Make executable on Unix-like systems
        try {
            await chmod(hookPath, '755');
        }
        catch {
            // Windows doesn't need chmod
        }
        console.log(`✅ Installed ${hookName} hook`);
    }
    /**
     * Generate pre-commit hook script
     */
    generatePreCommitHook() {
        return `#!/bin/sh
# Auto-Pilot Pre-Commit Hook
# Automatically fixes and validates code before commit

echo "🚀 Auto-Pilot Pre-Commit Running..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E "\\.(js|jsx|ts|tsx)$")

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No JavaScript/TypeScript files to check"
  exit 0
fi

# Run auto-fix on each staged file
for FILE in $STAGED_FILES; do
  echo "🔧 Auto-fixing $FILE..."

  # Run prettier
  npx prettier --write "$FILE" 2>/dev/null || true

  # Run ESLint fix
  npx eslint --fix "$FILE" 2>/dev/null || true

  # Run smart-reviewer auto-fix if available
  npx @j0kz/smart-reviewer apply-auto-fixes "$FILE" 2>/dev/null || true

  # Re-add file after fixes
  git add "$FILE"
done

# Run tests if they exist
if [ -f "package.json" ]; then
  echo "🧪 Running tests..."
  npm test --silent 2>/dev/null

  if [ $? -ne 0 ]; then
    echo "❌ Tests failed! Fix tests before committing."
    exit 1
  fi
fi

# Check for security issues
echo "🔒 Security scan..."
npx @j0kz/security-scanner scan --quick 2>/dev/null || true

# Check for console.log statements
if grep -r "console\\.log" $STAGED_FILES 2>/dev/null; then
  echo "⚠️ Warning: console.log statements found"
  echo "Auto-removing console statements..."

  for FILE in $STAGED_FILES; do
    sed -i.bak '/console\\.log/d' "$FILE" 2>/dev/null || sed -i '' '/console\\.log/d' "$FILE" 2>/dev/null || true
    rm -f "$FILE.bak" 2>/dev/null || true
    git add "$FILE"
  done
fi

# Check complexity
echo "📊 Checking code complexity..."
for FILE in $STAGED_FILES; do
  # Simple complexity check
  LINE_COUNT=$(wc -l < "$FILE")
  if [ "$LINE_COUNT" -gt 300 ]; then
    echo "⚠️ Warning: $FILE has $LINE_COUNT lines (>300). Consider splitting."
  fi
done

echo "✅ Pre-commit checks passed!"
exit 0
`;
    }
    /**
     * Generate pre-push hook script
     */
    generatePrePushHook() {
        return `#!/bin/sh
# Auto-Pilot Pre-Push Hook
# Final validation before pushing to remote

echo "🚀 Auto-Pilot Pre-Push Validation..."

# Run full test suite
echo "🧪 Running full test suite..."
npm test 2>/dev/null

if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Cannot push."
  echo "🔧 Attempting auto-fix..."

  # Try to fix and re-run
  npm run lint:fix 2>/dev/null || true
  npm test 2>/dev/null

  if [ $? -ne 0 ]; then
    echo "❌ Still failing after auto-fix. Please fix manually."
    exit 1
  fi
fi

# Check test coverage
echo "📊 Checking test coverage..."
COVERAGE=$(npm test -- --coverage --silent 2>/dev/null | grep "All files" | awk '{print $10}' | sed 's/%//')

if [ ! -z "$COVERAGE" ]; then
  if (( $(echo "$COVERAGE < 55" | bc -l) )); then
    echo "⚠️ Warning: Test coverage is $COVERAGE% (below 55% threshold)"
    echo "Consider adding more tests before pushing."
  fi
fi

# Run security audit
echo "🔒 Security audit..."
npm audit --audit-level=high 2>/dev/null

if [ $? -ne 0 ]; then
  echo "⚠️ High severity vulnerabilities found!"
  echo "Run 'npm audit fix' to resolve."
fi

# Check for outdated dependencies
echo "📦 Checking dependencies..."
OUTDATED=$(npm outdated --json 2>/dev/null | jq -r 'keys | length')

if [ "$OUTDATED" -gt 10 ]; then
  echo "⚠️ Warning: $OUTDATED outdated dependencies"
fi

# Run architecture analysis
echo "🏗️ Architecture check..."
npx @j0kz/architecture-analyzer analyze --quick 2>/dev/null || true

# Final build check
echo "🔨 Build check..."
npm run build 2>/dev/null

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Cannot push."
  exit 1
fi

echo "✅ All pre-push checks passed!"
echo "🚀 Pushing to remote..."
exit 0
`;
    }
    /**
     * Generate commit-msg hook script
     */
    generateCommitMsgHook() {
        return `#!/bin/sh
# Auto-Pilot Commit Message Hook
# Ensures good commit messages

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

echo "🔍 Validating commit message..."

# Check for conventional commit format
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .+"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "📝 Use conventional commit format:"
  echo "  feat: add new feature"
  echo "  fix: fix bug"
  echo "  docs: update documentation"
  echo "  refactor: refactor code"
  echo "  test: add tests"
  echo "  chore: update dependencies"
  echo ""
  echo "🔧 Auto-fixing commit message..."

  # Try to auto-fix common patterns
  if echo "$COMMIT_MSG" | grep -qi "^add"; then
    echo "feat: $COMMIT_MSG" > $COMMIT_MSG_FILE
  elif echo "$COMMIT_MSG" | grep -qi "^fix\\|bug"; then
    echo "fix: $COMMIT_MSG" > $COMMIT_MSG_FILE
  elif echo "$COMMIT_MSG" | grep -qi "^update"; then
    echo "chore: $COMMIT_MSG" > $COMMIT_MSG_FILE
  elif echo "$COMMIT_MSG" | grep -qi "^refactor"; then
    echo "refactor: $COMMIT_MSG" > $COMMIT_MSG_FILE
  else
    echo "chore: $COMMIT_MSG" > $COMMIT_MSG_FILE
  fi

  echo "✅ Commit message auto-fixed!"
fi

# Check message length
MSG_LENGTH=$(echo "$COMMIT_MSG" | head -1 | wc -c)
if [ $MSG_LENGTH -gt 72 ]; then
  echo "⚠️ Warning: Commit message too long ($MSG_LENGTH chars > 72)"
fi

exit 0
`;
    }
    /**
     * Install all recommended hooks
     */
    async installAll() {
        console.log('📦 Installing all Auto-Pilot git hooks...');
        await this.install('pre-commit', async (files) => {
            // Pre-commit handler (called from Node.js if needed)
        });
        await this.install('pre-push', async () => {
            // Pre-push handler
        });
        await this.install('commit-msg', async () => {
            // Commit message handler
        });
        console.log('✅ All git hooks installed!');
    }
    /**
     * Create husky configuration (alternative to git hooks)
     */
    async setupHusky() {
        console.log('🐺 Setting up Husky for better hook management...');
        try {
            // Install husky
            await execAsync('npm install --save-dev husky', { cwd: process.cwd() });
            // Initialize husky
            await execAsync('npx husky init', { cwd: process.cwd() });
            // Create hooks
            const huskyDir = path.join(process.cwd(), '.husky');
            // Pre-commit
            await writeFile(path.join(huskyDir, 'pre-commit'), `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx @j0kz/auto-pilot pre-commit
`);
            // Pre-push
            await writeFile(path.join(huskyDir, 'pre-push'), `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx @j0kz/auto-pilot pre-push
`);
            console.log('✅ Husky configured successfully!');
        }
        catch (error) {
            console.log('⚠️ Could not set up Husky, using native git hooks instead');
        }
    }
    /**
     * Create lint-staged configuration
     */
    async setupLintStaged() {
        const config = {
            '*.{js,jsx,ts,tsx}': [
                'prettier --write',
                'eslint --fix',
                'npx @j0kz/smart-reviewer apply-auto-fixes',
                'git add',
            ],
            '*.{json,md,yml,yaml}': ['prettier --write', 'git add'],
        };
        await writeFile(path.join(process.cwd(), '.lintstagedrc.json'), JSON.stringify(config, null, 2));
        console.log('✅ Lint-staged configuration created');
    }
    /**
     * Get list of staged files
     */
    async getStagedFiles() {
        try {
            const { stdout } = await execAsync('git diff --cached --name-only --diff-filter=ACM');
            return stdout.split('\n').filter(file => file.trim());
        }
        catch {
            return [];
        }
    }
    /**
     * Check if hooks are installed
     */
    async areHooksInstalled() {
        try {
            await readFile(path.join(this.hooksPath, 'pre-commit'));
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=git-hooks.js.map