# Release Troubleshooting Guide

Common issues during releases and how to solve them.

---

## Issue 1: "Version Already Published"

### Symptoms
```bash
npm publish
npm ERR! 403 You cannot publish over the previously published versions
```

### Root Cause
- Trying to publish version number that already exists on npm
- Can't reuse version numbers (npm policy)

### Solution

**Option 1: Increment version (RECOMMENDED)**
```bash
# Update version.json
# 1.0.37 → 1.0.38

npm run version:sync
npm run publish-all
```

**Option 2: Check if you meant to update**
```bash
# Maybe you already published?
npm view @j0kz/smart-reviewer-mcp version
# If shows 1.0.37, you're done!
```

### Prevention
```bash
# ALWAYS check before releasing
npm view @j0kz/smart-reviewer-mcp versions
# Look for your intended version in list
```

---

## Issue 2: npm Authentication Failed

### Symptoms
```bash
npm publish
npm ERR! need auth
npm ERR! This command requires you to be logged in
```

### Root Cause
- Not logged into npm
- npm token expired
- Wrong npm account

### Solution

**Step 1: Login**
```bash
npm login
# Enter username: j0kz
# Enter password: ***
# Enter email: ***
# Enter OTP (if 2FA enabled): ***
```

**Step 2: Verify**
```bash
npm whoami
# Expected: j0kz (or your username)
```

**Step 3: Retry publish**
```bash
npm run publish-all
```

### If Still Failing

```bash
# Check npm config
npm config list

# Check registry
npm config get registry
# Expected: https://registry.npmjs.org/

# Try logout and re-login
npm logout
npm login
```

---

## Issue 3: Tests Passing Locally But Failing in CI

### Symptoms
- `npm test` passes on your machine
- GitHub Actions shows test failures
- CI reports different test count

### Root Cause
- Environment differences (Node version, OS)
- Missing dependencies in CI
- Cached test results locally
- Timezone/locale differences

### Solution

**Step 1: Check Node version**
```bash
# Locally
node --version
# Expected: v18.x or v20.x

# Check CI config
cat .github/workflows/ci.yml | grep node-version
# Should match your local version
```

**Step 2: Clear local cache and retest**
```bash
rm -rf node_modules packages/*/node_modules
rm -rf packages/*/dist
npm install
npm test
```

**Step 3: Test in Docker (simulates CI)**
```bash
docker run -it node:20 bash
# Inside container:
git clone <your-repo>
cd mcp-agents
npm install
npm test
```

**Step 4: Check for OS-specific issues**
```bash
# Windows → Linux path differences
# Check for hard-coded paths like:
# "C:\Users\..." should be: path.join(__dirname, '...')
```

### Prevention
```bash
# Run CI locally before pushing
npm run test:ci
```

---

## Issue 4: Git Push Rejected

### Symptoms
```bash
git push origin main
! [rejected] main -> main (fetch first)
error: failed to push some refs
```

### Root Cause
- Someone else pushed to main while you were working
- Your local main is behind remote

### Solution

**Step 1: Pull latest changes**
```bash
git pull --rebase origin main
```

**Step 2: Resolve conflicts (if any)**
```bash
# If conflicts, fix them
git status
# Edit conflicted files
git add .
git rebase --continue
```

**Step 3: Push again**
```bash
git push origin main
git push --tags
```

### ⚠️ NEVER Force Push to Main
```bash
git push --force origin main  # ❌ DON'T DO THIS
```

**Why:** Breaks other developers, rewrites history

---

## Issue 5: Some Packages Published, Others Failed

### Symptoms
```bash
npm run publish-all
+ @j0kz/smart-reviewer-mcp@1.0.37
+ @j0kz/test-generator-mcp@1.0.37
npm ERR! Failed to publish @j0kz/orchestrator-mcp
```

### Root Cause
- Network interruption
- One package has error in package.json
- Size limit exceeded
- Missing files

### Solution

**Step 1: Identify failed packages**
```bash
# Check which packages are on npm
npm view @j0kz/smart-reviewer-mcp version  # 1.0.37 ✅
npm view @j0kz/orchestrator-mcp version     # 1.0.36 ❌
```

**Step 2: Publish failed packages individually**
```bash
npm publish -w packages/orchestrator-mcp
```

**Step 3: Verify all packages published**
```bash
npm view @j0kz/smart-reviewer-mcp version   # 1.0.37 ✅
npm view @j0kz/test-generator-mcp version   # 1.0.37 ✅
npm view @j0kz/orchestrator-mcp version     # 1.0.37 ✅
# ... check all 11 packages
```

---

## Issue 6: CHANGELOG.md Merge Conflicts

### Symptoms
```bash
git pull --rebase origin main
CONFLICT (content): Merge conflict in CHANGELOG.md
```

### Root Cause
- Someone else released while you were preparing
- Both added entries at top of CHANGELOG

### Solution

**Step 1: Open CHANGELOG.md**
```markdown
<<<<<<< HEAD
## [1.0.38] - 2025-10-17
Your release notes
=======
## [1.0.37] - 2025-10-16
Their release notes
>>>>>>> origin/main
```

**Step 2: Keep BOTH entries (newest first)**
```markdown
## [1.0.38] - 2025-10-17
Your release notes

## [1.0.37] - 2025-10-16
Their release notes
```

**Step 3: Resolve conflict**
```bash
git add CHANGELOG.md
git rebase --continue
```

**Prevention:** Always pull latest before starting release

---

## Issue 7: Forgot to Update CHANGELOG.md

### Symptoms
- Released v1.0.37 to npm ✅
- Pushed to GitHub ✅
- CHANGELOG still shows v1.0.36 ❌

### Solution

**Option 1: Add entry and amend tag (if just released)**
```bash
# Edit CHANGELOG.md (add missing entry)

# Create new commit
git add CHANGELOG.md
git commit -m "docs: add CHANGELOG entry for v1.0.37"

# Update tag to point to new commit
git tag -f -a v1.0.37 -m "Release 1.0.37"

# Push
git push origin main
git push --force origin v1.0.37
```

**Option 2: Include in next release (if discovered later)**
```markdown
## [1.0.38] - 2025-10-18
New changes...

## [1.0.37] - 2025-10-17 (retroactive entry)
Previous changes...
```

---

## Issue 8: Build Fails Locally

### Symptoms
```bash
npm run build
npm ERR! Build failed with 14 errors
```

### Root Cause
- TypeScript errors
- Missing dependencies
- Outdated node_modules

### Solution

**Step 1: Clean install**
```bash
rm -rf node_modules packages/*/node_modules
npm install
```

**Step 2: Clear dist folders**
```bash
rm -rf packages/*/dist
```

**Step 3: Build individual packages to isolate**
```bash
npm run build -w packages/smart-reviewer
# If fails, check errors in that package

npm run build -w packages/test-generator
# Repeat for each package
```

**Step 4: Check TypeScript errors**
```bash
npx tsc --noEmit
# Shows all TypeScript errors
```

**Fix errors, then:**
```bash
npm run build
```

---

## Issue 9: Installer Not Publishing

### Symptoms
```bash
npm run publish-all  # ✅ Publishes 10 packages
cd installer && npm publish  # ❌ Fails
```

### Root Cause
- Installer has different package.json
- Version not synced
- Missing files

### Solution

**Step 1: Check installer version**
```bash
cat installer/package.json | grep version
# Should be: "version": "1.0.37"
```

**Step 2: Sync installer manually if needed**
```bash
cd installer
# Edit package.json, update version to 1.0.37
npm publish
cd ..
```

**Step 3: Verify published**
```bash
npm view @j0kz/mcp-agents version
# Expected: 1.0.37
```

---

## Issue 10: GitHub Release Creation Failed

### Symptoms
```bash
gh release create v1.0.37
gh: command not found
```

### Root Cause
- GitHub CLI (`gh`) not installed
- Not authenticated with gh
- Tag doesn't exist yet

### Solution

**Option 1: Install gh CLI**
```bash
# Windows
winget install --id GitHub.cli

# macOS
brew install gh

# Linux
# See: https://github.com/cli/cli#installation
```

**Option 2: Authenticate**
```bash
gh auth login
# Follow prompts
```

**Option 3: Create via web UI instead**
1. Go to: https://github.com/j0KZ/mcp-agents/releases
2. Click "Draft a new release"
3. Select tag: v1.0.37
4. Add title and description
5. Click "Publish release"

---

## Issue 11: Tag Already Exists

### Symptoms
```bash
git tag -a v1.0.37 -m "Release 1.0.37"
fatal: tag 'v1.0.37' already exists
```

### Root Cause
- Created tag before, attempting to recreate
- Tag exists locally or remotely

### Solution

**Check where tag exists:**
```bash
# Local tags
git tag -l "v1.0.37"

# Remote tags
git ls-remote --tags origin | grep v1.0.37
```

**If tag is wrong, delete and recreate:**
```bash
# Delete local tag
git tag -d v1.0.37

# Delete remote tag (if pushed)
git push origin :refs/tags/v1.0.37

# Recreate
git tag -a v1.0.37 -m "Release 1.0.37"

# Push
git push --tags
```

---

## Issue 12: Package Size Too Large

### Symptoms
```bash
npm publish
npm ERR! Package size exceeds 10MB limit
```

### Root Cause
- Including unnecessary files (tests, source maps, etc.)
- Missing .npmignore
- Large dependencies bundled

### Solution

**Step 1: Check package size**
```bash
npm pack --dry-run
# Shows what will be included
```

**Step 2: Add .npmignore**
```
# .npmignore
tests/
*.test.ts
*.spec.ts
src/
tsconfig.json
.github/
docs/
coverage/
```

**Step 3: Verify reduced size**
```bash
npm pack --dry-run
# Should be much smaller
```

**Step 4: Publish**
```bash
npm publish
```

---

## Quick Diagnosis Flowchart

```
Problem during release?
│
├─ npm publish fails
│  ├─ "Version already published" → Increment version
│  ├─ "Need auth" → npm login
│  └─ "Package too large" → Add .npmignore
│
├─ git push fails
│  ├─ "fetch first" → git pull --rebase
│  └─ "rejected" → Resolve conflicts
│
├─ Tests fail
│  ├─ "Locally OK, CI fails" → Check Node version
│  └─ "Locally fails" → npm install, clear cache
│
└─ Build fails
   ├─ TypeScript errors → Fix errors, rebuild
   └─ Missing deps → npm install
```

---

## Prevention Checklist

**Before every release:**
- [ ] Pull latest main
- [ ] Clear caches
- [ ] Full clean build
- [ ] Run all tests
- [ ] Check CI passing
- [ ] Use dry-run mode
- [ ] Verify version.json

**90% of issues prevented by these steps!**
