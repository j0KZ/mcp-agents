# Test Count Automation Guide

## After Adding/Removing Tests

```bash
# Run automation script
npm run update:test-count
```

## How the Script Works

**scripts/update-test-count.js Process:**

1. Runs `npm test` and captures output
2. Strips ANSI color codes
3. Extracts test counts: `Tests  31 passed (31)`
4. Sums across all packages
5. Updates files with new count

**Files it updates:**
- `README.md` - Badge: `tests-NUMBER_passing`
- `wiki/Home.md` - Badge and table
- `CHANGELOG.md` - Metrics section

## Example Output

```
🧪 Counting tests...

✅ Found 632 passing tests across 9 packages

✅ Updated README.md
✅ Updated wiki/Home.md
✅ Updated CHANGELOG.md

🎉 Successfully updated test count to 632 in 3 file(s)!

💡 Next steps:
   1. Review the changes: git diff
   2. Commit: git add -u && git commit -m "docs: update test count to 632"
   3. Republish wiki: powershell.exe -File publish-wiki.ps1
```

## Pattern Matching in Files

### Badge Pattern
```markdown
[![Tests](https://img.shields.io/badge/tests-632_passing-success.svg)]
```

### Table Pattern
```markdown
| **Tests** | 632 passing |
```

### CHANGELOG Pattern
```markdown
- Tests: 632 passing
- Test Suite Expansion: 632 total tests
```

## Testing Scripts Reference

### Build Scripts
```bash
# Build all packages
npm run build

# Build specific package
npm run build:reviewer
npm run build:test-gen
npm run build:arch

# Watch mode for development
npm run dev
npm run dev -w packages/smart-reviewer
```

### Testing Scripts
```bash
# Run all tests
npm test

# Run specific package tests
npm test -w packages/smart-reviewer

# CI mode (no watch)
npm run test:ci

# Coverage
npm run test:coverage

# Coverage dashboard
npm run coverage:dashboard
```

## Common Issues and Fixes

### Issue: Test Count Not Updating

**Cause:** ANSI color codes interfering with parsing

**Fix:** Script automatically strips ANSI codes, but verify:
```bash
npm test 2>&1 | sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2};?)?)?[mGK]//g"
```

### Issue: Wrong Count in Badge

**Cause:** Manual edit instead of automation

**Fix:**
```bash
# Always use automation
npm run update:test-count
# Never manually edit badge numbers
```

### Issue: Tests Pass Locally but Count Wrong

**Cause:** Not all packages tested

**Fix:**
```bash
# Ensure all packages are tested
npm test --workspaces
# Then update count
npm run update:test-count
```

## Badge Management

### Dynamic Badges (Auto-Update)
```markdown
[![npm](https://img.shields.io/npm/v/@j0kz/mcp-agents.svg)]
[![codecov](https://codecov.io/gh/j0KZ/mcp-agents/branch/main/graph/badge.svg)]
```

### Manual Badges (Use Automation)
```markdown
[![Tests](https://img.shields.io/badge/tests-632_passing-success.svg)]
```

**Never:**
- Hardcode version numbers in badges
- Manually edit test count badges
- Use @latest in version badge URLs