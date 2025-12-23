# Wiki Synchronization Guide

Complete guide to maintaining and publishing GitHub wiki documentation.

---

## When to Update Wiki

**Update wiki for:**
- ✅ New features (user-facing)
- ✅ API changes
- ✅ Major releases
- ✅ Installation instructions
- ✅ Breaking changes

**Skip wiki for:**
- ❌ Internal refactoring
- ❌ Minor bug fixes
- ❌ Documentation typos (unless significant)

---

## Automated Wiki Publishing

### Using publish-wiki.ps1 Script

**Location:** `./publish-wiki.ps1` (root directory)

**Usage:**
```powershell
./publish-wiki.ps1
```

**What it does:**
1. Clones wiki repository to `wiki-temp/`
2. Copies all files from `wiki/` to `wiki-temp/`
3. Commits changes with conventional format
4. Pushes to GitHub wiki
5. Cleans up temp directory

**Prerequisites:**
- Git installed and configured
- Write access to wiki repository
- PowerShell (Windows) or pwsh (Mac/Linux)

**Expected output:**
```
Cloning wiki repository...
Copying updated files...
Committing changes...
Pushing to GitHub...
Cleanup complete.
Wiki published successfully!
```

---

## Manual Wiki Update

### Step-by-Step Process

**1. Clone wiki repository**
```bash
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-temp
cd wiki-temp
```

**2. Copy updated files**
```bash
# From project root
cp wiki/*.md wiki-temp/

# Or specific files
cp wiki/Home.md wiki-temp/
cp wiki/Orchestrator.md wiki-temp/
```

**3. Review changes**
```bash
cd wiki-temp
git status
git diff
```

**4. Commit changes**
```bash
git add .
git commit -m "docs: update wiki with new features

Updated:
- Home.md: Added test count badge (366 → 388)
- Orchestrator.md: Documented ambiguity detection
- Installation.md: Added troubleshooting section

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**5. Push to GitHub**
```bash
git push origin master
```

**6. Cleanup**
```bash
cd ..
rm -rf wiki-temp
```

**7. Verify**
- Visit: https://github.com/j0kz/mcp-agents/wiki
- Check updated pages

---

## Wiki Structure

### Standard Files

```
wiki/
├── Home.md                    # Main README (copy from root README.md)
├── Getting-Started.md         # Installation guide
├── Orchestrator.md            # Orchestrator tool docs
├── Smart-Reviewer.md          # Smart reviewer docs
├── Test-Generator.md          # Test generator docs
├── Architecture-Analyzer.md   # Architecture analyzer docs
├── Security-Scanner.md        # Security scanner docs
├── API-Designer.md            # API designer docs
├── DB-Schema.md               # DB schema docs
├── Doc-Generator.md           # Doc generator docs
├── Refactor-Assistant.md      # Refactor assistant docs
└── Troubleshooting.md         # Common issues
```

### File Naming Convention

**Use hyphens (not underscores):**
- ✅ `Getting-Started.md`
- ❌ `Getting_Started.md`

**Title case:**
- ✅ `API-Designer.md`
- ❌ `api-designer.md`

---

## Home.md (Main Page)

**Content:** Copy from root README.md

**Customizations:**
- Remove local development sections
- Keep user-facing documentation
- Add wiki navigation links

**Example navigation:**
```markdown
## Documentation

- [Getting Started](Getting-Started)
- [Orchestrator](Orchestrator)
- [Smart Reviewer](Smart-Reviewer)
- [Troubleshooting](Troubleshooting)
```

**Note:** Wiki links don't need `.md` extension

---

## Tool Documentation Pages

### Template Structure

```markdown
# Tool Name

> Brief description

## Overview

[What it does, why it's useful]

## Installation

[Installation instructions - can link to Getting-Started]

## Usage

### Basic Usage

[Simple examples]

### Advanced Usage

[Complex examples]

## Configuration

[Optional parameters, settings]

## Examples

### Example 1: [Use Case]

[Detailed example with code]

### Example 2: [Use Case]

[Another example]

## Troubleshooting

[Common issues specific to this tool]

## API Reference

[If applicable - tool parameters, return types]
```

---

## Commit Message Format

**Use conventional commits:**

```bash
docs: update wiki with [changes]

[Details]:
- [File]: [Change description]
- [File]: [Change description]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Examples:**

```bash
# New features
docs: update wiki with bilingual support

Updated Orchestrator.md with:
- Ambiguity detection documentation
- Spanish language support examples
- Focus area parameter documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
# New tool
docs: add refactor-assistant wiki page

Created Refactor-Assistant.md with:
- Installation instructions
- Usage examples
- Modular architecture pattern guide

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

```bash
# Updates
docs: update Home.md with latest test count

- Updated test count badge: 366 → 388
- Added v1.0.36 release notes
- Fixed installation script URLs

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Wiki Workflow

### After Merging PR with User-Facing Changes

```bash
# 1. Update wiki/ files in local repo
vim wiki/Orchestrator.md
# ... make changes ...

# 2. Commit to main repo
git add wiki/
git commit -m "docs: prepare wiki updates for v1.0.36"
git push

# 3. Publish wiki
./publish-wiki.ps1

# 4. Verify
# Visit wiki page in browser
```

### After Release

```bash
# 1. Update Home.md with release notes
cp README.md wiki/Home.md

# 2. Update version numbers in all wiki pages
sed -i 's/1.0.35/1.0.36/g' wiki/*.md

# 3. Publish
./publish-wiki.ps1
```

---

## Troubleshooting

### Issue: publish-wiki.ps1 fails

**Symptom:** "Permission denied" or "Authentication failed"

**Solution:**
```bash
# Check git credentials
git config --global user.name
git config --global user.email

# Re-authenticate
gh auth login

# Try manual push
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-temp
cd wiki-temp
# ... make changes ...
git push origin master
```

---

### Issue: Wiki shows old content

**Symptom:** Updated files but wiki still shows old version

**Solution:**
```bash
# 1. Check if changes actually pushed
cd wiki-temp
git log -1
# Should show your commit

# 2. Force refresh browser (Ctrl+F5)

# 3. Check GitHub cache
# May take 1-2 minutes to update

# 4. Verify correct branch
git branch
# Should be on master
```

---

### Issue: Wiki page not found

**Symptom:** Link returns 404

**Causes:**
1. **File name wrong:** Check exact spelling and case
2. **Link syntax wrong:** Don't use `.md` extension in wiki links
3. **File not pushed:** Verify file exists in wiki repo

**Fix:**
```markdown
<!-- ❌ Wrong -->
[Getting Started](Getting-Started.md)

<!-- ✅ Correct -->
[Getting Started](Getting-Started)
```

---

### Issue: Images not showing

**Symptom:** `![image](path.png)` shows broken

**Solution:**
1. **Upload images to wiki** (GitHub wiki supports image uploads)
2. **Or use absolute URLs**:
   ```markdown
   ![image](https://raw.githubusercontent.com/j0kz/mcp-agents/main/docs/images/diagram.png)
   ```

---

## Best Practices

### ✅ DO

1. **Update wiki with major changes**
   - New features
   - API changes
   - Installation updates

2. **Keep wiki in sync with README**
   ```bash
   cp README.md wiki/Home.md
   ./publish-wiki.ps1
   ```

3. **Use conventional commit format**
   ```bash
   docs: update wiki with [description]
   ```

4. **Test links before publishing**
   - Preview markdown locally
   - Check all internal wiki links

5. **Include examples in tool pages**
   - Real use cases
   - Copy-pasteable code
   - Expected outputs

### ❌ DON'T

1. **Don't edit wiki directly on GitHub**
   - Changes will be overwritten
   - Use `wiki/` folder in main repo

2. **Don't forget to publish**
   ```bash
   # After updating wiki/ files:
   ./publish-wiki.ps1
   ```

3. **Don't use `.md` extension in wiki links**
   ```markdown
   ❌ [Link](Page.md)
   ✅ [Link](Page)
   ```

4. **Don't include development details**
   - Wiki is for users
   - Keep technical internals in code comments

---

## Quick Reference

### Publish Wiki
```bash
./publish-wiki.ps1
```

### Manual Update
```bash
git clone https://github.com/j0kz/mcp-agents.wiki.git wiki-temp
cp wiki/*.md wiki-temp/
cd wiki-temp
git add .
git commit -m "docs: update wiki"
git push origin master
cd .. && rm -rf wiki-temp
```

### Verify Wiki
```
https://github.com/j0kz/mcp-agents/wiki
```

---

## Related

- See `documentation-templates.md` for page structure
- See `badge-management-guide.md` for badge updates
- See main SKILL.md for documentation workflow

---

**Reference:** Wiki publishing workflow in @j0kz/mcp-agents
**Script:** publish-wiki.ps1
**Wiki URL:** https://github.com/j0kz/mcp-agents/wiki
**Project:** @j0kz/mcp-agents
