# Standardization Guide

This document outlines standardized patterns to reduce manual updates across the codebase.

## ✅ Already Standardized

### 1. Version Management (EXCELLENT ✨)

**Single Source of Truth:** `version.json`

```json
{
  "version": "1.0.35",
  "description": "Global version for all MCP packages"
}
```

**Auto-sync script:** `npm run version:sync`
- Automatically updates all package.json files
- No manual version editing needed
- Prevents version mismatches

**Usage in documentation:**
```bash
# When releasing new version:
1. Edit version.json only
2. Run: npm run version:sync
3. Update CHANGELOG.md
4. Commit and publish
```

### 2. Package Installation (EXCELLENT ✨)

**Standardized to `@latest`:**
```bash
npx @j0kz/mcp-agents@latest        # Installer
npx @j0kz/smart-reviewer-mcp@latest  # Individual tools
```

**Benefits:**
- No version updates needed in documentation
- Users always get latest stable version
- Installation commands never become outdated

## 🔧 Should Be Standardized

### 3. Test Count (NEEDS AUTOMATION ⚠️)

**Current Problem:**
- Hardcoded in 4+ places: README.md, wiki pages, CHANGELOG.md
- Must be manually updated after adding/removing tests
- Easy to forget and becomes outdated

**Solution: Dynamic Test Count Script**

Create `scripts/update-test-count.js`:

```javascript
#!/usr/bin/env node
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// Run tests and extract count
const output = execSync('npm test 2>&1', { encoding: 'utf8' });
const matches = output.match(/(\d+) passed/g);
const total = matches.reduce((sum, m) => sum + parseInt(m.match(/\d+/)[0]), 0);

// Update files
const filesToUpdate = [
  'README.md',
  'wiki/Home.md'
];

filesToUpdate.forEach(file => {
  let content = readFileSync(file, 'utf8');
  // Update badge
  content = content.replace(
    /tests-\d+_passing/g,
    `tests-${total}_passing`
  );
  // Update table
  content = content.replace(
    /\| \*\*Tests\*\* \| \d+ passing/g,
    `| **Tests** | ${total} passing`
  );
  writeFileSync(file, content);
});

console.log(`✅ Updated test count to ${total} in all files`);
```

**Add to package.json:**
```json
{
  "scripts": {
    "update:test-count": "node scripts/update-test-count.js"
  }
}
```

**Usage:**
```bash
npm run update:test-count  # Auto-updates test count everywhere
```

### 4. Code Coverage (NEEDS AUTOMATION ⚠️)

**Current Problem:**
- "53.91%" is hardcoded
- Codecov badge doesn't auto-update in wiki
- Coverage changes but docs don't reflect it

**Solution: Use Codecov Dynamic Badge**

**In wiki/Home.md and README.md:**
```markdown
<!-- Instead of hardcoded percentage -->
[![Coverage](https://codecov.io/gh/j0KZ/mcp-agents/branch/main/graph/badge.svg)](https://codecov.io/gh/j0KZ/mcp-agents)
```

This badge auto-updates when CI runs! ✨

### 5. Package Count (STATIC, DOCUMENT IT 📝)

**Current State:**
- "9 MCP tools" mentioned in ~20 places
- If we add a 10th tool, need to update everywhere

**Solution A: Use Variable in Scripts**

Create `scripts/get-package-count.js`:
```javascript
import { readdirSync } from 'fs';

const packages = readdirSync('packages')
  .filter(p => p !== 'shared' && p !== 'config-wizard');

console.log(packages.length); // Output: 9
```

**Solution B: Document the Pattern**

Create a replacement guide:
```bash
# When adding new MCP tool:
grep -r "9 MCP tools" . --include="*.md" -l | xargs sed -i 's/9 MCP tools/10 MCP tools/g'
```

### 6. Repository URLs (STANDARDIZE FORMAT 📝)

**Current Issue:**
- Some use `j0KZ`, some use `j0kz` (case sensitivity)
- GitHub username: `j0KZ` (capital K, Z)
- npm scope: `j0kz` (lowercase)

**Standardization Rule:**

```markdown
✅ GitHub URLs:     https://github.com/j0KZ/mcp-agents  (capital K, Z)
✅ npm packages:    @j0kz/package-name                   (lowercase)
✅ Wiki links:      [text](Wiki-Page-Name)              (PascalCase)
```

**Add to .editorconfig:**
```ini
[*.md]
# Enforce consistent casing in URLs
# GitHub: j0KZ (capital)
# npm: j0kz (lowercase)
```

### 7. Installation Commands (STANDARDIZE TEMPLATE 📝)

**Create Template File:** `templates/INSTALLATION_SNIPPET.md`

```markdown
## Installation

### Quick Install (Recommended)
\`\`\`bash
npx @j0kz/mcp-agents@latest
\`\`\`

### Manual Configuration

**Claude Code:**
\`\`\`json
{
  "mcpServers": {
    "TOOL_NAME": {
      "command": "npx",
      "args": ["-y", "@j0kz/PACKAGE_NAME@latest"]
    }
  }
}
\`\`\`

**Cursor/Windsurf:**
Add the same configuration to \`.cursorrules\` or \`.windsurfrules\`
```

**Usage:**
When creating a new tool README, copy this template and replace:
- `TOOL_NAME` → actual tool name
- `PACKAGE_NAME` → actual npm package name

### 8. Badges (STANDARDIZE TEMPLATE 📝)

**Create Template File:** `templates/BADGE_TEMPLATE.md`

```markdown
[![npm version](https://img.shields.io/npm/v/@j0kz/PACKAGE_NAME)](https://www.npmjs.com/package/@j0kz/PACKAGE_NAME)
[![Version](https://img.shields.io/badge/version-VERSION_FROM_JSON-blue.svg)](https://github.com/j0KZ/mcp-agents/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
```

**Auto-generate with script:**

Create `scripts/generate-badges.js`:
```javascript
import { readFileSync } from 'fs';

const version = JSON.parse(readFileSync('version.json', 'utf8')).version;
const packageName = process.argv[2]; // e.g., "smart-reviewer-mcp"

console.log(`[![npm version](https://img.shields.io/npm/v/@j0kz/${packageName})](https://www.npmjs.com/package/@j0kz/${packageName})
[![Version](https://img.shields.io/badge/version-${version}-blue.svg)](https://github.com/j0KZ/mcp-agents/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)`);
```

**Usage:**
```bash
node scripts/generate-badges.js smart-reviewer-mcp
```

### 9. Tool Lists (STANDARDIZE DATA SOURCE 📝)

**Create Single Source:** `tools.json`

```json
{
  "tools": [
    {
      "name": "Smart Reviewer",
      "package": "@j0kz/smart-reviewer-mcp",
      "description": "Code review with auto-fixes",
      "category": "analysis"
    },
    {
      "name": "Test Generator",
      "package": "@j0kz/test-generator-mcp",
      "description": "Generate comprehensive test suites",
      "category": "generation"
    }
    // ... all 9 tools
  ]
}
```

**Generate documentation from tools.json:**

```javascript
// scripts/generate-tool-list.js
import { readFileSync } from 'fs';

const tools = JSON.parse(readFileSync('tools.json', 'utf8')).tools;

// Generate markdown table
console.log('| Tool | Description |');
console.log('|------|-------------|');
tools.forEach(t => {
  console.log(`| **[${t.name}](${t.package})** | ${t.description} |`);
});
```

## 📋 Implementation Plan

### Phase 1: Immediate (Do Now)

1. ✅ **Use `@latest` everywhere** (DONE)
2. ✅ **Use `version.json`** (DONE)
3. **Create `scripts/update-test-count.js`**
4. **Update Codecov badge to dynamic version**
5. **Document URL casing rules in CONTRIBUTING.md**

### Phase 2: Short-term (Next Release)

6. **Create `tools.json` with all tool metadata**
7. **Create badge generation script**
8. **Create installation snippet template**
9. **Add pre-commit hook to validate URLs**

### Phase 3: Long-term (Future Enhancement)

10. **Auto-generate wiki pages from templates + tools.json**
11. **CI job to auto-update test counts**
12. **Dynamic README generation from metadata**

## 🎯 Benefits of Standardization

| Before | After | Benefit |
|--------|-------|---------|
| Update version in 11 package.json files | Update version.json only | **90% less work** |
| Update test count in 4 files manually | Run `npm run update:test-count` | **Automated** |
| Hardcode coverage "53.91%" | Use dynamic Codecov badge | **Always accurate** |
| Copy-paste installation code | Use template snippets | **Consistent** |
| Remember correct URL casing | Documented standard + linter | **No mistakes** |

## 📝 Standardization Checklist

When adding new features or tools:

- [ ] Use `@latest` in all installation commands
- [ ] Read version from `version.json`
- [ ] Use dynamic badges (npm, codecov)
- [ ] Copy installation snippet from template
- [ ] Add tool to `tools.json` (when created)
- [ ] Run `npm run update:test-count` after adding tests
- [ ] Use correct casing: `j0KZ` (GitHub), `j0kz` (npm)

## 🔗 Related Files

- `version.json` - Single source of truth for versions
- `scripts/version-sync.js` - Auto-sync versions to packages
- `CONTRIBUTING.md` - Developer guidelines
- `CLAUDE.md` - Project structure and patterns

---

**Last Updated:** 2025-10-07
**Maintained By:** Project maintainers
