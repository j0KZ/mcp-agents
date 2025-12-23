---
name: documentation-generation
description: "Documentation generation and maintenance patterns including README structure, CHANGELOG management, API documentation, wiki synchronization, and badge updates. Use when creating package docs, updat..."
---

# Documentation Patterns for @j0kz/mcp-agents

Complete guide to documentation generation and maintenance across the monorepo.

## When to Use This Skill

- Creating README.md for new packages
- Updating CHANGELOG.md with release notes
- Maintaining API documentation
- Synchronizing GitHub wiki
- Updating badges (version, tests, coverage)
- Writing installation instructions

## Evidence Base

**Current State:**
- 9 package READMEs (150-323 lines each)
- Consistent structure: badges, installation, features, examples
- CHANGELOG.md (1000+ lines) with 25+ releases
- docs/ folder with organized documentation
- Wiki synchronization workflow (publish-wiki.ps1)

---

## Quick Commands

### Generate Documentation

```bash
# Generate README for package
npx @j0kz/doc-generator@latest generate readme --package=smart-reviewer-mcp

# Generate API docs from TypeScript
npx @j0kz/doc-generator@latest generate api --input=src --output=docs/api

# Update CHANGELOG
npx @j0kz/doc-generator@latest generate changelog --version=1.0.36
```

### Update Badges

```bash
# Update test count badge (automated)
npm run update:test-count

# Manual badge update in README
[![Tests](https://img.shields.io/badge/tests-632_passing-success.svg)]
[![Version](https://img.shields.io/npm/v/@j0kz/mcp-agents.svg)]
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]
```

---

## Documentation Templates

For comprehensive templates and examples:

```bash
cat .claude/skills/documentation-generation/references/documentation-templates.md
```

### Quick README Template

```markdown
# Package Name

Brief description of what this package does.

## Installation

\`\`\`bash
npm install @j0kz/package-name
\`\`\`

## Usage

\`\`\`typescript
import { Tool } from '@j0kz/package-name';

const tool = new Tool();
const result = await tool.execute();
\`\`\`

## Features

- ✅ Feature 1
- ✅ Feature 2
- ✅ Feature 3

## API Reference

See [API Documentation](./docs/api.md)

## License

MIT
```

---

## CHANGELOG Management

### Conventional Format

```markdown
## [1.0.36] - 2025-10-30

### Added
- New feature description
- Another new capability

### Changed
- Updated existing feature
- Modified behavior

### Fixed
- Bug fix description
- Another fix

### Performance
- Optimization description
```

### Release Notes Automation

```bash
# Generate release notes from commits
git log --pretty=format:"- %s" v1.0.35..HEAD | grep -E "^- (feat|fix|perf):"

# Update version in CHANGELOG
sed -i "s/## \[Unreleased\]/## [1.0.36] - $(date +%Y-%m-%d)/" CHANGELOG.md
```

---

## Badge Management

For complete badge reference and management:

```bash
cat .claude/skills/documentation-generation/references/badge-management-guide.md
```

### Standard Badge Set

```markdown
[![npm version](https://img.shields.io/npm/v/@j0kz/mcp-agents.svg)](https://www.npmjs.com/package/@j0kz/mcp-agents)
[![Tests](https://img.shields.io/badge/tests-632_passing-success.svg)](https://github.com/j0KZ/mcp-agents/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/@j0kz/mcp-agents.svg)](https://npmjs.com/package/@j0kz/mcp-agents)
```

---

## Wiki Synchronization

For detailed wiki sync guide:

```bash
cat .claude/skills/documentation-generation/references/wiki-sync-guide.md
```

### Quick Sync

```bash
# Run from PowerShell on Windows
powershell.exe -File publish-wiki.ps1

# Manual sync
cd wiki
git add .
git commit -m "docs: sync wiki with main updates"
git push
```

---

## API Documentation

### Generate from TypeScript

```bash
# Using TypeDoc
npx typedoc --out docs/api src/index.ts

# Using doc-generator tool
npx @j0kz/doc-generator@latest generate api \
  --input=src \
  --output=docs/api \
  --format=markdown
```

### API Doc Structure

```markdown
# API Reference

## Classes

### ClassName

Description of the class.

#### Constructor

\`\`\`typescript
new ClassName(options?: Options)
\`\`\`

#### Methods

##### methodName(param: Type): ReturnType

Description of what the method does.

**Parameters:**
- `param` (Type): Description

**Returns:** Description of return value

**Example:**
\`\`\`typescript
const result = instance.methodName('value');
\`\`\`
```

---

## Documentation Standards

### Writing Style

1. **Clear and concise** - Avoid jargon
2. **Example-driven** - Show, don't just tell
3. **Consistent formatting** - Use templates
4. **Version-specific** - Note breaking changes
5. **Searchable** - Use descriptive headings

### Required Sections

Every package README must have:
- Installation instructions
- Usage examples
- Feature list
- API reference or link
- License information

### Code Examples

```typescript
// ✅ GOOD: Complete, runnable example
import { SmartReviewer } from '@j0kz/smart-reviewer-mcp';

const reviewer = new SmartReviewer();
const result = await reviewer.reviewFile('src/index.ts');
console.log(result.issues);

// ❌ BAD: Incomplete, won't run
reviewer.review(); // Missing imports, incomplete
```

---

## Automated Documentation

### CI/CD Integration

```yaml
# .github/workflows/docs.yml
name: Documentation

on:
  push:
    branches: [main]

jobs:
  update-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Update test count
        run: npm run update:test-count

      - name: Generate API docs
        run: npx typedoc

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "docs: auto-update documentation" || true
          git push
```

---

## Best Practices

1. **Keep README under 500 lines** - Link to detailed docs
2. **Update CHANGELOG immediately** - Don't wait for release
3. **Test all code examples** - They should actually work
4. **Use semantic versioning** - Major.Minor.Patch
5. **Include screenshots** - For UI features
6. **Document breaking changes** - In CHANGELOG and README
7. **Maintain consistent structure** - Use templates
8. **Cross-reference docs** - Link between related pages
9. **Version your docs** - Tag documentation with releases
10. **Automate where possible** - Badges, test counts, API docs

---

## Complete Example Workflow

```bash
# 1. Update version
npm run version:sync

# 2. Update CHANGELOG
echo "## [1.0.36] - $(date +%Y-%m-%d)" >> CHANGELOG.md
echo "### Added" >> CHANGELOG.md
echo "- New feature X" >> CHANGELOG.md

# 3. Update test count
npm run update:test-count

# 4. Generate API docs
npx typedoc --out docs/api src/index.ts

# 5. Sync to wiki
powershell.exe -File publish-wiki.ps1

# 6. Commit everything
git add -A
git commit -m "docs: update for v1.0.36 release"
git push
```

---

**Verification:** Check README.md shows 632+ tests and version 1.0.36!