# Claude Desktop Skills - Creation Guide

## Overview

This document describes how to create custom skills compatible with Claude Desktop, based on Anthropic's official specifications and lessons learned during implementation.

## Official Anthropic Skill Format

### YAML Frontmatter (Required)

Claude Desktop only accepts these fields in the YAML frontmatter:

```yaml
---
name: skill-name
description: "What this skill does and when Claude should use it"
dependencies: "optional-software-requirements"
---
```

| Field | Required | Max Length | Notes |
|-------|----------|------------|-------|
| `name` | ✅ Yes | 64 chars | Lowercase, hyphens only (e.g., `quick-pr-review`) |
| `description` | ✅ Yes | 200 chars | Clear explanation of skill purpose |
| `dependencies` | ❌ No | - | Software requirements (e.g., `python>=3.8`) |

### Invalid Fields (Will Cause Errors)

These fields are **NOT valid** for Claude Desktop and will cause upload failures:

- ❌ `version`
- ❌ `category`
- ❌ `tags`
- ❌ `mcp-tools`
- ❌ `author`
- ❌ `type`
- ❌ `compatibility`
- ❌ `language`
- ❌ `chains-to`

## ZIP File Structure

### Correct Structure

```
skill-name.zip
└── skill-name/           # Folder MUST match skill name
    ├── SKILL.md          # Required - main skill file
    └── references/       # Optional - supporting docs
        ├── guide.md
        └── examples.md
```

### Critical Requirements

1. **Folder wrapper**: ZIP must contain a folder, not loose files
2. **Folder name**: Must exactly match the `name` field in YAML
3. **Path separators**: Must use forward slashes (`/`), NOT backslashes (`\`)
4. **SKILL.md location**: Must be at root of the skill folder

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `malformed YAML frontmatter` | Invalid fields in YAML | Only use `name`, `description`, `dependencies` |
| `path with invalid characters` | Windows backslashes in ZIP | Use archiver/7zip with Unix paths |
| `skill name mismatch` | Folder name ≠ YAML name | Ensure both match exactly |

## Creating ZIPs on Windows

### Problem

Windows tools (PowerShell `Compress-Archive`) create ZIPs with backslash paths:
```
skill-name\SKILL.md  ❌ Wrong
```

Claude Desktop requires forward slash paths:
```
skill-name/SKILL.md  ✅ Correct
```

### Solution: Node.js + Archiver

```javascript
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

function createSkillZip(skillName, skillPath, outputPath) {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);

  // Add files with Unix-style paths
  const files = getAllFiles(skillPath);
  for (const file of files) {
    const relativePath = path.relative(skillPath, file);
    // Convert to Unix paths
    const unixPath = `${skillName}/${relativePath.replace(/\\/g, '/')}`;
    archive.file(file, { name: unixPath });
  }

  archive.finalize();
}
```

### Alternative: 7-Zip

```bash
# 7-Zip creates proper Unix paths
7z a -tzip skill-name.zip ./skill-name/
```

## Skill Content Best Practices

### Token Limits

- **Main SKILL.md**: Keep under 5,000 tokens
- **Reference files**: Use for extensive documentation
- **Total skill**: Aim for under 10,000 tokens

### Recommended Structure

```markdown
---
name: my-skill
description: "Brief description under 200 chars"
---

# Skill Title

## When to Use
[Clear triggers for skill activation]

## Quick Start
[Immediate actionable steps]

## Detailed Guide
[Full instructions]

## Examples
[Real-world usage examples]
```

## Installation

### Claude Desktop (Web)

1. Go to **Settings** → **Capabilities**
2. Click **Upload Skill**
3. Select `.zip` file
4. Toggle skill on/off as needed

### Location of Installed Skills

Skills are stored in your Claude account, not locally.

## Scripts Created

### `scripts/fix-skill-yaml.cjs`

Fixes YAML frontmatter to only include valid Claude Desktop fields.

```bash
node scripts/fix-skill-yaml.cjs
```

### `scripts/create-skill-zips.mjs`

Creates properly formatted ZIP files with Unix paths.

```bash
node scripts/create-skill-zips.mjs
```

## Lessons Learned

1. **YAML is strict**: Only documented fields are allowed
2. **Paths matter**: Forward slashes required in ZIP files
3. **PowerShell fails**: Don't use `Compress-Archive` for Claude Desktop
4. **Test one first**: Upload a simple skill before batch processing
5. **Name consistency**: Folder name must match YAML `name` exactly

## References

- [How to create custom Skills - Anthropic Help](https://support.anthropic.com/en/articles/12512198-how-to-create-custom-skills)
- [Using Skills in Claude - Anthropic Help](https://support.anthropic.com/en/articles/12512180-using-skills-in-claude)
- [GitHub - anthropics/skills](https://github.com/anthropics/skills)

---

**Created**: 2025-12-23
**Skills Count**: 29
**Output**: `starter-kit/claude-desktop-skills/`
