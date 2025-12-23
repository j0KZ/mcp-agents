# Documentation Templates

Complete templates for README, CHANGELOG, API docs, and other documentation in @j0kz/mcp-agents.

---

## Package README Template

### Complete 9-Section Structure

All 9 packages follow this exact structure:

```markdown
# @j0kz/package-name-mcp

> Brief one-line description of what it does

[![npm version](https://img.shields.io/npm/v/@j0kz/package-name-mcp)](https://www.npmjs.com/package/@j0kz/package-name-mcp)
[![Version](https://img.shields.io/badge/version-1.0.36-blue.svg)](https://github.com/j0kz/mcp-agents)
[![Tests](https://img.shields.io/badge/tests-388_passing-brightgreen.svg)](https://github.com/j0kz/mcp-agents)
[![Coverage](https://img.shields.io/badge/coverage-75%25-green.svg)](https://github.com/j0kz/mcp-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎉 What's New in v1.0.X

- **Feature 1**: Description with benefit
- **Feature 2**: Description with benefit
- **Bug Fix**: What was fixed and impact

## 🚀 Quick Start

### ⭐ Option 1: Install ALL 9 Tools (Recommended)

**Claude Code:**
\`\`\`bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
\`\`\`

### Option 2: Install Only This Tool

**Claude Code:**
\`\`\`bash
claude mcp add package-name "npx @j0kz/package-name-mcp" --scope user
\`\`\`

**Cursor/Windsurf:** Add to \`mcp_config.json\`:
\`\`\`json
{
  "mcpServers": {
    "package-name": {
      "command": "npx",
      "args": ["@j0kz/package-name-mcp"]
    }
  }
}
\`\`\`

### Start Using Immediately

After setup, chat naturally:

\`\`\`
💬 You: "Review the auth.js file"
🤖 AI: *Analyzes code* Found 3 issues...

💬 You: "Generate tests for utils.ts"
🤖 AI: *Generates tests* Created 12 test cases...
\`\`\`

## ✨ Features

🔍 **Feature 1** - Description
📊 **Feature 2** - Description
🤖 **Feature 3** - Description
✅ **Feature 4** - Description
⚡ **Feature 5** - Description

## 📦 Complete @j0kz MCP Suite

Get all 9 professional development tools:

\`\`\`bash
# 🎯 Code Quality Suite
npx @j0kz/smart-reviewer-mcp      # AI code review
npx @j0kz/test-generator-mcp      # Auto-generate tests
npx @j0kz/refactor-assistant-mcp  # Refactoring help

# 🏗️ Architecture & Design
npx @j0kz/architecture-analyzer-mcp  # Architecture analysis
npx @j0kz/api-designer-mcp           # API design
npx @j0kz/db-schema-mcp              # Database schemas

# 📚 Documentation & Security
npx @j0kz/doc-generator-mcp       # Auto-generate docs
npx @j0kz/security-scanner-mcp    # Security scanning
npx @j0kz/orchestrator-mcp        # Workflow orchestration
\`\`\`

**👉 [View complete collection on GitHub](https://github.com/j0KZ/mcp-agents)**

## 🔧 Editor Support

| Editor          | Status          | Notes          |
| --------------- | --------------- | -------------- |
| **Claude Code** | ✅ Full support | Recommended    |
| **Cursor**      | ✅ Full support | Native MCP     |
| **Windsurf**    | ✅ Full support | Built-in MCP   |
| **Roo Code**    | ✅ Full support | MCP compatible |
| **Continue**    | ✅ Full support | MCP plugin     |
| **Zed**         | ✅ Full support | MCP support    |

Any MCP-compatible editor works!

## ❓ Troubleshooting

**MCP not showing up?**
- Restart your editor after installation
- Check: \`claude mcp list\` (Claude Code) to verify connection

**Commands not working?**
- Make sure Node.js is installed (\`node --version\`)
- Try reinstalling: Remove and re-add the MCP

**Still stuck?**
- [Open an issue](https://github.com/j0KZ/mcp-agents/issues)
- [Check full documentation](https://github.com/j0KZ/mcp-agents)

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)

---

**Explore more tools:** [github.com/j0KZ/mcp-agents](https://github.com/j0KZ/mcp-agents) | **npm:** [@j0kz](https://www.npmjs.com/~j0kz)
```

---

## CHANGELOG Entry Template

### Release Entry Format

```markdown
## [VERSION] - YYYY-MM-DD

### 🎉 Major Feature / 🐛 Bug Fix / 📦 Release / 🔒 Security Patch

**Key Changes:**
- Feature/Fix 1: Description
- Feature/Fix 2: Description
- Feature/Fix 3: Description

**Impact:**
- ✅ Benefit 1
- ✅ Benefit 2
- ✅ Benefit 3

**Breaking Changes:** (if major version)
- Changed API X → use Y instead
- Migration guide: [link or inline instructions]

**Test Results:**
- ✅ XXX/XXX tests passing (100% pass rate)
- ✅ Coverage: XX%
- ✅ Build successful

**Files Modified:**
- \`packages/tool/src/file.ts\` - Description of changes
- \`packages/tool/tests/test.ts\` - Description of changes

**Technical Details:**
- Implementation specifics
- Performance improvements
- Architecture changes

---
```

### Example Entries

**Bug Fix (v1.0.36 style):**
```markdown
## [1.0.36] - 2025-10-13

### 🐛 Critical Bug Fixes

**Test Generator: Fixed Absolute Path Import Bug**
- **Problem**: Generated broken imports: \`import * as target from './D:\\Users\\...\\file'\`
- **Solution**: Calculate relative paths using \`path.relative()\` and \`path.basename()\`
- **Result**: Now generates correct relative imports: \`import * as target from './file'\`
- **Impact**: Test Generator now produces working tests out-of-the-box

**Smart Reviewer: Fixed Auto-Fix Import Preservation**
- **Problem**: Removed entire import line, deleting BOTH used and unused imports
- **Solution**: Parse imports, track usage, reconstruct with only used imports
- **Result**: \`import { unused, USED }\` → \`import { USED }\` (preserves used)
- **Impact**: Auto-fix no longer breaks code

**Test Results:**
- ✅ 388/388 tests passing (100% pass rate)
- ✅ Build successful across all packages
- ✅ Zero breaking changes

---
```

**Feature Release (v1.0.35 style):**
```markdown
## [1.0.35] - 2025-10-07

### 🏗️ Phase 4 Refactoring - Architecture & Documentation Cleanup

**Packages Refactored:**
- **architecture-analyzer** (382 → 287 LOC, -25%)
  - Extracted constants: \`constants/complexity-thresholds.ts\`
  - Created helpers: \`helpers/graph-builder.ts\`, \`helpers/cycle-detector.ts\`
  - **Impact**: Estimated +20% maintainability score

- **doc-generator** (363 → 232 LOC, -36%)
  - Extracted constants: \`constants/doc-templates.ts\`
  - Created helpers: \`helpers/markdown-formatter.ts\`
  - **Impact**: Estimated +25% maintainability score

**Overall Impact:**
- Total LOC removed: 226 lines (-31%)
- New modular files: 8 helpers + 2 constants directories
- Tests passing: 365/365 (100%)
- Estimated quality improvement: +22% average

**Breaking Changes:**
None - all changes are internal refactoring

---
```

---

## Installation Instructions Template

### Standard Installation Section

```markdown
## Installation

### Quick Install (All Tools)

**Claude Code:**
\`\`\`bash
# Mac/Linux
curl -fsSL https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.sh | bash

# Windows (PowerShell)
irm https://raw.githubusercontent.com/j0kz/mcp-agents/main/install-all.ps1 | iex
\`\`\`

### Individual Tool Install

**Claude Code:**
\`\`\`bash
claude mcp add [tool-name] "npx @j0kz/[tool-name]-mcp" --scope user
\`\`\`

**Cursor/Windsurf/Other Editors:**

Add to your MCP config file:
\`\`\`json
{
  "mcpServers": {
    "[tool-name]": {
      "command": "npx",
      "args": ["@j0kz/[tool-name]-mcp"]
    }
  }
}
\`\`\`

**Config file locations:**
- **Cursor**: \`~/.cursor/mcp_config.json\`
- **Windsurf**: \`~/.windsurf/mcp_config.json\`
- **Claude Desktop** (Windows): \`%AppData%\\Claude\\claude_desktop_config.json\`
- **Claude Desktop** (Mac): \`~/Library/Application Support/Claude/claude_desktop_config.json\`

### Verification

After installation:
1. Restart your editor
2. Ask: "What MCP tools are available?"
3. You should see \`[tool-name]\` listed
```

---

## Troubleshooting Section Template

```markdown
## Troubleshooting

### Common Issues

**Tools not appearing after installation?**

1. **Restart editor** - Close ALL windows and reopen
2. **Verify config** - Check MCP config file exists and is valid JSON
3. **Clear cache**:
   \`\`\`bash
   npm cache clean --force
   npx @j0kz/mcp-agents@latest
   \`\`\`
4. **Check Node.js** - Need version 18+:
   \`\`\`bash
   node --version
   \`\`\`

**Commands not recognized?**

- ✅ Use natural language: "Review my code"
- ❌ Don't use technical syntax: "Execute review_file()"

**Module not found errors?**

\`\`\`bash
# Clear npm cache
npm cache clean --force

# Reinstall
npx @j0kz/mcp-agents@latest

# Restart editor
\`\`\`

**Still having issues?**

1. Check [full troubleshooting guide](https://github.com/j0kz/mcp-agents#troubleshooting)
2. [Open an issue](https://github.com/j0kz/mcp-agents/issues) with:
   - Operating system
   - Editor name and version
   - Node.js version (\`node --version\`)
   - Error messages
```

---

## API Documentation Template

### Function Documentation

```markdown
### \`functionName(param1, param2)\`

**Purpose:** Brief description of what it does

**Parameters:**
- \`param1\` (string, required) - Description of parameter
- \`param2\` (object, optional) - Description of parameter
  - \`option1\` (boolean) - Description
  - \`option2\` (string) - Description

**Returns:** \`Promise<ReturnType>\` - Description of return value

**Throws:**
- \`ERROR_CODE_001\` - When condition X occurs
- \`ERROR_CODE_002\` - When condition Y occurs

**Example:**
\`\`\`typescript
const result = await functionName('input', {
  option1: true,
  option2: 'value'
});

console.log(result);
// Output: { ... }
\`\`\`

**Notes:**
- Additional information
- Edge cases
- Performance considerations
```

### MCP Tool Documentation

```markdown
## Available Tools

### 1. \`tool_name\`

Brief description of what this tool does.

**Input:**
\`\`\`json
{
  "param1": "value",
  "param2": {
    "option1": true,
    "option2": "value"
  }
}
\`\`\`

**Output:**
\`\`\`json
{
  "success": true,
  "data": {
    "result": "...",
    "metadata": {}
  }
}
\`\`\`

**Example Usage:**

\`\`\`
💬 You: "Review the auth.js file"
🤖 AI: *Uses smart-reviewer tool*

Found 3 issues:
1. Unused import on line 5
2. Missing error handling on line 23
3. Complex function on line 45

Overall score: 85/100
\`\`\`

**Error Codes:**
- \`TOOL_001\` - Invalid input parameter
- \`TOOL_002\` - File not found
- \`TOOL_003\` - Processing failed
```

---

## PR Description Template

```markdown
# [type]([scope]): [Title]

## Summary

[2-3 sentences describing WHAT changed and WHY]

**Key Changes:**
- ✅ Change 1
- ✅ Change 2
- ✅ Change 3

## Changes

**New Files:**
- \`path/to/file1.ts\` (XXX LOC) - Description
- \`path/to/file2.ts\` (XXX LOC) - Description

**Modified:**
- \`path/to/file3.ts\` - Description of changes
- \`path/to/file4.ts\` - Description of changes

**Deleted:**
- \`path/to/old-file.ts\` - Reason for deletion

## Test Results

- ✅ XXX/XXX tests passing (100% pass rate)
- ✅ New tests added: XX tests
- ✅ Coverage: XX% (no regression)
- ✅ Build successful

## Documentation

- Updated \`README.md\` with new features
- Updated \`CHANGELOG.md\` with release notes
- Updated API documentation
- Wiki pages ready for publication

## Breaking Changes

None - fully backward compatible.

OR

**Breaking Change:** [Description]

**Migration Guide:**
\`\`\`typescript
// Old API
oldFunction(param1, param2);

// New API
newFunction({ param1, param2 });
\`\`\`

**Why:** [Justification for breaking change]

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Issue Template

```markdown
## Bug Report / Feature Request

### Description

[Clear description of the bug or feature request]

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happens - for bugs]

### Steps to Reproduce

1. [First step]
2. [Second step]
3. [See error]

### Environment

- **OS:** [Windows/Mac/Linux + version]
- **Editor:** [Claude Code/Cursor/Windsurf + version]
- **Node.js:** [Version from \`node --version\`]
- **Package Version:** [Version from package.json]

### Error Messages

\`\`\`
[Paste error messages here]
\`\`\`

### Additional Context

[Screenshots, logs, related issues]
```

---

## Quick Reference Cards

### Command Reference Card

```markdown
## Quick Command Reference

### Common Commands

\`\`\`bash
# Install all tools
npx @j0kz/mcp-agents@latest

# Clear cache
npm cache clean --force

# Check version
node --version
npm --version

# Verify installation
claude mcp list  # Claude Code only
\`\`\`

### Natural Language Commands

\`\`\`
"Review my code"
"Generate tests for utils.ts"
"Scan for security issues"
"Analyze architecture"
"Design an API for user management"
\`\`\`
```

---

## Best Practices

### ✅ DO

1. **Use consistent structure across all packages**
   - Follow 9-section README template
   - Same badge order
   - Same installation format

2. **Include concrete examples**
   - Real use cases
   - Copy-pasteable code
   - Expected outputs

3. **Update version numbers everywhere**
   - README badges
   - CHANGELOG entries
   - Installation commands

4. **Use emojis strategically**
   - Section headers (🚀, ✨, ❓)
   - Feature bullets (🔍, 📊, 🤖)
   - Results (✅, ❌, ⚠️)

5. **Link to related documentation**
   - GitHub repo
   - npm packages
   - Wiki pages

### ❌ DON'T

1. **Don't skip installation instructions**
   - Every package needs full install guide
   - Include all editor types

2. **Don't use vague descriptions**
   ```markdown
   ❌ "This tool helps with code"
   ✅ "AI-powered code review with auto-fix capabilities"
   ```

3. **Don't forget troubleshooting**
   - Include common issues
   - Link to full guide

4. **Don't use inconsistent formatting**
   - Follow templates exactly
   - Same structure across all docs

---

## Related

- See `badge-management-guide.md` for badge updates
- See `wiki-sync-guide.md` for wiki publishing
- See main SKILL.md for documentation workflow

---

**Reference:** 9 package READMEs + CHANGELOG.md in @j0kz/mcp-agents
**Standard:** Keep a Changelog format
**Project:** @j0kz/mcp-agents
