# Version Management Guide

## Complete Release Workflow

### Step-by-Step Version Release

```bash
# 1. Edit version.json ONLY
echo '{"version": "1.1.0"}' > version.json

# 2. Sync all package versions
npm run version:sync

# Output shows:
# ✅ Root package.json → 1.1.0
# ✅ packages/smart-reviewer → 1.1.0
# ✅ packages/test-generator → 1.1.0
# ... (all 11 packages)
# ✅ installer/index.js VERSION → 1.1.0

# 3. Verify shared package version matches
npm run version:check-shared
# Output: ✅ All packages use shared@^1.1.0

# 4. Update CHANGELOG.md manually
# Add new version section with changes

# 5. Run tests
npm test

# 6. Update test count if tests changed
npm run update:test-count

# 7. Build all packages
npm run build

# 8. Publish to npm
npm run publish-all

# 9. Publish installer separately
cd installer
npm publish
cd ..

# 10. Create git tag and push
git add .
git commit -m "release: v1.1.0"
git tag v1.1.0
git push origin main
git push --tags

# 11. Update GitHub wiki
powershell.exe -File publish-wiki.ps1
```

## Version Sync Script Details

**scripts/sync-versions.js Updates:**
- Root `package.json` version
- All 9 tool package versions
- Shared package version
- Installer package version
- `installer/index.js` VERSION constant

**What it prints:**
```
🔄 Syncing all packages to version 1.1.0...

✅ Root package.json → 1.1.0
✅ packages/smart-reviewer → 1.1.0
[... all packages ...]
✅ installer/index.js VERSION → 1.1.0

✨ 13 file(s) updated to version 1.1.0

📝 Remember to:
   1. Update CHANGELOG.md
   2. Update README.md badges
   3. npm run build
   4. npm run publish-all
```

## Shared Package Version Checking

**Command:** `npm run version:check-shared`

**What it validates:**
- All packages depend on `@j0kz/shared` with correct version
- Version matches global version.json
- No version drift between packages

**If drift detected:**
```
❌ Version mismatch detected!

packages/smart-reviewer: @j0kz/shared@^1.0.35
packages/test-generator: @j0kz/shared@^1.1.0

Run: npm run version:sync
```

## Common Version Management Mistakes

### Manually Edited Package Version
**Fix:**
```bash
# Reset to version.json
npm run version:sync
# Verify
npm run version:check-shared
```

### Forgot to Sync After version.json Change
**Correct workflow:**
```bash
# 1. Edit version.json
echo '{"version": "1.1.0"}' > version.json

# 2. SYNC FIRST (don't skip!)
npm run version:sync

# 3. Then build
npm run build
```

## Pre-Release Validation Checklist

Before committing version changes:
- [ ] Edited `version.json` only
- [ ] Ran `npm run version:sync`
- [ ] Ran `npm run version:check-shared`
- [ ] Updated `CHANGELOG.md` manually
- [ ] Ran `npm test` (all tests pass)
- [ ] Updated test count: `npm run update:test-count`
- [ ] Ran `npm run build` successfully

Before publishing:
- [ ] All packages built (`dist/` directories exist)
- [ ] All tests passing
- [ ] Documentation updated (README, CHANGELOG)
- [ ] Wiki synchronized
- [ ] Git commit created
- [ ] Git tag created (`v1.1.0`)

After publishing:
- [ ] Verify on npm: `npm view @j0kz/mcp-agents version`
- [ ] Test installation: `npx @j0kz/mcp-agents@latest`
- [ ] Push git tags: `git push --tags`
- [ ] Update GitHub release (optional)