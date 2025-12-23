# Badge Management Guide

Complete guide to managing badges (version, tests, coverage) across README files and package metadata.

---

## Badge Types

### Version Badge

**Format:**
```markdown
[![Version](https://img.shields.io/badge/version-1.0.36-blue.svg)](https://github.com/j0kz/mcp-agents)
```

**Update locations:**
- Root README.md
- All 9 package READMEs (`packages/*/README.md`)
- tools.json metadata

**Update frequency:** Every release

**Example update:**
```bash
# Find all version badges
grep -r "version-1.0.35" . --include="README.md"

# Replace with new version
sed -i 's/version-1.0.35/version-1.0.36/g' README.md
sed -i 's/version-1.0.35/version-1.0.36/g' packages/*/README.md
```

---

### NPM Version Badge

**Format:**
```markdown
[![npm version](https://img.shields.io/npm/v/@j0kz/package-name-mcp)](https://www.npmjs.com/package/@j0kz/package-name-mcp)
```

**Auto-updates:** Pulls from npm registry (no manual update needed)

**Verify link:**
```bash
# Should link to correct npm package
https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp
```

---

### Test Count Badge

**Format:**
```markdown
[![Tests](https://img.shields.io/badge/tests-388_passing-brightgreen.svg)](https://github.com/j0kz/mcp-agents)
```

**Automated update:**
```bash
npm run update:test-count
```

**What it does:**
1. Runs `npm test` and captures output
2. Parses vitest output for test count:
   ```
   Test Files  25 passed (25)
        Tests  388 passed (388)  <-- Extracts this
   ```
3. Updates all README files
4. Updates tools.json metadata

**Manual update pattern:**
```bash
# Find current count
grep -r "tests-.*_passing" . --include="README.md"

# Replace
sed -i 's/tests-366_passing/tests-388_passing/g' README.md
sed -i 's/tests-366_passing/tests-388_passing/g' packages/*/README.md
```

**Script location:** `scripts/update-test-count.js`

**Important:** Use underscores (`_`) not spaces in badge URL

---

### Coverage Badge

**Format:**
```markdown
[![Coverage](https://img.shields.io/badge/coverage-75%25-green.svg)](https://github.com/j0kz/mcp-agents)
```

**Color thresholds:**
- ✅ **Green** (≥70%): `coverage-75%25-green.svg`
- ⚠️ **Yellow** (50-69%): `coverage-65%25-yellow.svg`
- ❌ **Red** (<50%): `coverage-45%25-red.svg`

**URL encoding:**
- Use `%25` for `%` character
- ✅ Correct: `75%25`
- ❌ Wrong: `75%`

**Update after coverage changes:**
```bash
# Run coverage
npm run test:coverage

# Check percentage
# Coverage summary: 75.23%

# Update badge
sed -i 's/coverage-74%25/coverage-75%25/g' README.md
```

**Automated script** (optional):
```javascript
// scripts/update-coverage-badge.js
const coverage = getCoveragePercentage();  // 75.23 → 75
const color = coverage >= 70 ? 'green' : coverage >= 50 ? 'yellow' : 'red';
const badge = `coverage-${coverage}%25-${color}.svg`;
updateBadgeInREADME(badge);
```

---

### License Badge

**Format:**
```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/j0kz/mcp-agents/blob/main/LICENSE)
```

**Update:** Never (unless license changes)

**Link:** Should point to LICENSE file in repo

---

## Badge Placement

### Standard Order (all READMEs)

```markdown
# Package Name

> One-line description

[![npm version](https://img.shields.io/npm/v/@j0kz/package-mcp)](...)
[![Version](https://img.shields.io/badge/version-1.0.36-blue.svg)](...)
[![Tests](https://img.shields.io/badge/tests-388_passing-brightgreen.svg)](...)
[![Coverage](https://img.shields.io/badge/coverage-75%25-green.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](...)
```

**Alignment:** Left-aligned, one line

---

## Automation Scripts

### Update Test Count Script

**Location:** `scripts/update-test-count.js`

**Usage:**
```bash
npm run update:test-count
```

**What it does:**
```javascript
// 1. Run tests and capture output
const output = execSync('npm test').toString();

// 2. Parse test count (handle ANSI codes)
const match = output.match(/Tests\s+(\d+)\s+passed/);
const testCount = match[1];  // "388"

// 3. Update README.md
updateBadge('README.md', `tests-${testCount}_passing`);

// 4. Update all package READMEs
updateBadge('packages/*/README.md', `tests-${testCount}_passing`);

// 5. Update tools.json
updateToolsJson({ testCount });
```

**Important:** Strip ANSI color codes before parsing

---

### Version Sync Script

**Location:** `scripts/version-sync.js`

**Usage:**
```bash
npm run version:sync
```

**What it does:**
```javascript
// 1. Read version from version.json
const version = readVersionJson();  // "1.0.36"

// 2. Update all package.json files
updatePackageJsons(version);

// 3. Update all README badges
updateVersionBadges(version);

// 4. Update tools.json
updateToolsJson({ version });
```

---

## Badge Validation

### Check All Badges

```bash
# Find all badge lines
grep -r "!\[.*\]" . --include="README.md"

# Check for inconsistencies
grep -r "version-1.0" . --include="README.md" | sort | uniq

# Should all match current version
```

### Validate Badge URLs

```bash
# Check for broken links
grep -r "https://img.shields.io" . --include="README.md" | \
  while read line; do
    curl -I "$url" | grep "200 OK"
  done
```

---

## Common Badge Issues

### Issue: Test count badge wrong

**Symptom:** Badge shows 366 but actual count is 388

**Solution:**
```bash
# Re-run update script
npm run update:test-count

# Verify
grep "tests-" README.md
# Should show: tests-388_passing
```

---

### Issue: Coverage badge color wrong

**Symptom:** Coverage is 75% but badge is yellow

**Fix:**
```bash
# Update color
sed -i 's/coverage-75%25-yellow/coverage-75%25-green/g' README.md
```

**Remember:**
- 70%+ = green
- 50-69% = yellow
- <50% = red

---

### Issue: Version badge outdated

**Symptom:** Badge shows 1.0.35 but released 1.0.36

**Fix:**
```bash
# Use version sync script
npm run version:sync

# Or manual
sed -i 's/version-1.0.35/version-1.0.36/g' README.md packages/*/README.md
```

---

### Issue: Badge URL encoding wrong

**Symptom:** Badge shows as broken image

**Common mistakes:**
```markdown
<!-- ❌ Wrong: % not encoded -->
[![Coverage](https://img.shields.io/badge/coverage-75%-green.svg)]

<!-- ✅ Correct: %25 for % -->
[![Coverage](https://img.shields.io/badge/coverage-75%25-green.svg)]

<!-- ❌ Wrong: Space in badge -->
[![Tests](https://img.shields.io/badge/tests-388 passing-green.svg)]

<!-- ✅ Correct: Underscore instead of space -->
[![Tests](https://img.shields.io/badge/tests-388_passing-green.svg)]
```

---

## Badge Best Practices

### ✅ DO

1. **Update badges with every release**
   ```bash
   npm run version:sync
   npm run update:test-count
   # Update coverage badge manually
   ```

2. **Use automation scripts**
   ```bash
   npm run update:test-count  # Don't manually count tests
   ```

3. **Keep badge order consistent**
   ```markdown
   npm version → Version → Tests → Coverage → License
   ```

4. **Link badges to relevant pages**
   ```markdown
   [![Tests](...)](https://github.com/j0kz/mcp-agents)  # Link to repo
   [![npm](...)](https://npmjs.com/package/...)         # Link to npm
   ```

### ❌ DON'T

1. **Don't forget URL encoding**
   ```markdown
   ❌ coverage-75%
   ✅ coverage-75%25
   ```

2. **Don't use spaces in badge text**
   ```markdown
   ❌ tests-388 passing
   ✅ tests-388_passing
   ```

3. **Don't update badges inconsistently**
   - Update ALL README files (root + packages)
   - Update tools.json metadata
   - Keep in sync

4. **Don't hardcode values that can be automated**
   - Use scripts for test count
   - Use scripts for version sync

---

## Badge URLs Reference

### shields.io Format

```
https://img.shields.io/badge/{LABEL}-{MESSAGE}-{COLOR}.svg
```

**Parameters:**
- `LABEL`: Left side text (e.g., "tests")
- `MESSAGE`: Right side text (e.g., "388_passing")
- `COLOR`: Badge color (e.g., "green", "blue", "red")

**Examples:**
```markdown
https://img.shields.io/badge/version-1.0.36-blue.svg
https://img.shields.io/badge/tests-388_passing-brightgreen.svg
https://img.shields.io/badge/coverage-75%25-green.svg
https://img.shields.io/badge/License-MIT-yellow.svg
```

### npm Badge (dynamic)

```
https://img.shields.io/npm/v/{PACKAGE_NAME}
```

**Example:**
```markdown
https://img.shields.io/npm/v/@j0kz/smart-reviewer-mcp
```

**Benefits:**
- Auto-updates when package published
- Always shows latest npm version
- No manual maintenance

---

## Quick Reference

### Update Commands

```bash
# Update test count badge
npm run update:test-count

# Update version badges
npm run version:sync

# Update coverage (manual)
sed -i 's/coverage-74%25/coverage-75%25/g' README.md packages/*/README.md
```

### Badge Templates

```markdown
<!-- Version -->
[![Version](https://img.shields.io/badge/version-{VERSION}-blue.svg)](https://github.com/j0kz/mcp-agents)

<!-- Tests -->
[![Tests](https://img.shields.io/badge/tests-{COUNT}_passing-brightgreen.svg)](https://github.com/j0kz/mcp-agents)

<!-- Coverage -->
[![Coverage](https://img.shields.io/badge/coverage-{PCT}%25-{COLOR}.svg)](https://github.com/j0kz/mcp-agents)

<!-- License -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<!-- npm -->
[![npm version](https://img.shields.io/npm/v/{PACKAGE})]({NPM_URL})
```

---

## Related

- See `documentation-templates.md` for full README structure
- See `wiki-sync-guide.md` for wiki badge updates
- See main SKILL.md for documentation patterns

---

**Reference:** Badge automation in @j0kz/mcp-agents
**Scripts:** scripts/update-test-count.js, scripts/version-sync.js
**Project:** @j0kz/mcp-agents
