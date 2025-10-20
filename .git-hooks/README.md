# Git Hooks for @j0kz/mcp-agents

Automated quality gates using MCP tools at git lifecycle points.

---

## Hooks Overview

| Hook | When | What It Does | Time | Can Skip |
|------|------|--------------|------|----------|
| **pre-commit** | Before commit | Quick checks on staged files | ~30s | Yes (--no-verify) |
| **commit-msg** | After commit message | Validate conventional commits | ~1s | Yes (--no-verify) |
| **pre-push** | Before push | Comprehensive validation | ~2-5min | Yes (--no-verify) |

---

## Installation

```bash
# One-time setup
npm run hooks:install

# Manual installation (if needed)
chmod +x .git-hooks/*
cp .git-hooks/pre-commit .git/hooks/pre-commit
cp .git-hooks/commit-msg .git/hooks/commit-msg
cp .git-hooks/pre-push .git/hooks/pre-push
```

---

## Hook Details

### pre-commit (Fast ~30s)

**Runs:**
1. ESLint on staged files
2. Prettier format check
3. TypeScript compilation check
4. Smart-reviewer quick scan (moderate severity)

**Skips if:**
- No staged .ts/.js files
- User adds `--no-verify` flag

**Example:**
```bash
git commit -m "fix: parser bug"
# → Runs pre-commit checks automatically

git commit -m "fix: parser bug" --no-verify
# → Skips all hooks (use sparingly!)
```

---

### commit-msg (Ultra-fast ~1s)

**Validates:**
- Conventional commit format
- Message length
- Required components

**Format:**
```
type(scope): description

[optional body]

[optional footer]
```

**Valid types:** feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

**Example valid:**
```
feat(smart-reviewer): add auto-fix suggestions
fix: handle null pointer in parser
docs: update README with examples
```

**Example invalid:**
```
Updated stuff          ❌ (no type)
feature: added thing   ❌ (wrong type, use 'feat')
fix short msg          ❌ (description too short)
```

---

### pre-push (Comprehensive ~2-5min)

**Runs:**
1. All tests (npm test)
2. Test coverage check (target: 75%)
3. Build verification
4. Security scan (medium+ severity)
5. Architecture check (circular deps)

**Skips if:**
- Pushing to personal branch (not main/release/pr)
- User adds `--no-verify` flag

**Example:**
```bash
git push origin feature/new-parser
# → Runs pre-push checks

git push origin feature/new-parser --no-verify
# → Skips checks (use for WIP)
```

---

## Configuration

**File:** `.git-hooks/config.json`

```json
{
  "pre-commit": {
    "enabled": true,
    "skipPatterns": ["*.test.ts", "*.spec.ts"],
    "severity": "moderate"
  },
  "commit-msg": {
    "enabled": true,
    "minLength": 10,
    "maxLength": 100
  },
  "pre-push": {
    "enabled": true,
    "skipBranches": ["wip/*", "experimental/*"],
    "requireTests": true,
    "requireCoverage": true,
    "coverageThreshold": 75
  }
}
```

---

## Bypassing Hooks

**When to skip:**
- ✅ WIP commits on personal branch
- ✅ Emergency hotfix (but run manually after!)
- ✅ Known failing test (but fix ASAP!)

**When NOT to skip:**
- ❌ Main/release branch commits
- ❌ PR branches
- ❌ Public branches

**How to skip:**
```bash
# Skip specific commit
git commit --no-verify

# Skip specific push
git push --no-verify

# Disable hook temporarily
chmod -x .git/hooks/pre-commit

# Re-enable
chmod +x .git/hooks/pre-commit
```

---

## Troubleshooting

### Hook not running

**Check:**
```bash
# Verify hooks are executable
ls -la .git/hooks/

# Should see -rwxr-xr-x (executable)
```

**Fix:**
```bash
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
chmod +x .git/hooks/pre-push
```

### Hook failing incorrectly

**Debug:**
```bash
# Run hook manually
.git/hooks/pre-commit

# Check exit code
echo $?
# 0 = success, non-zero = failure
```

### Hook too slow

**Options:**
1. Skip heavy checks on feature branches
2. Run only on changed files
3. Use `--no-verify` for WIP commits
4. Configure in `.git-hooks/config.json`

---

## MCP Integration

**Hooks use your MCP tools automatically!**

**pre-commit:**
- Uses: `smart-reviewer` (batch_review)
- Config: moderate severity, staged files only

**pre-push:**
- Uses: `smart-reviewer` (strict), `security-scanner`, `architecture-analyzer`
- Config: comprehensive checks

**Leverages:** `.claude/mcp-enhancers.md` shortcuts when possible

---

## Maintenance

**Update hooks:**
```bash
# Pull latest from repo
git pull

# Reinstall hooks
npm run hooks:install
```

**Add custom checks:**
1. Edit `.git-hooks/pre-commit` (or other hook)
2. Add your check before `exit 0`
3. Reinstall: `npm run hooks:install`

---

## CI/CD Integration

**Hooks run locally** - CI/CD still runs independently!

**Local (hooks):** Fast feedback (~30s-5min)
**CI/CD (GitHub Actions):** Complete validation (~10-20min)

Both are important:
- Hooks = Catch issues early
- CI/CD = Authoritative gate

---

**See:** Individual hook files for implementation details
