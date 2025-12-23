# Complete Release Checklist

Print this checklist and follow step-by-step for every release.

---

## Pre-Release Validation

### Environment Check

- [ ] On `main` branch
  ```bash
  git branch --show-current
  # Expected: main
  ```

- [ ] Working directory clean
  ```bash
  git status --porcelain
  # Expected: (empty output)
  ```

- [ ] Latest main pulled
  ```bash
  git pull origin main
  # Expected: Already up to date
  ```

- [ ] npm authenticated
  ```bash
  npm whoami
  # Expected: j0kz (or your username)
  ```

### Code Quality Check

- [ ] All tests passing
  ```bash
  npm test
  # Expected: 388/388 tests passing
  ```

- [ ] Build successful
  ```bash
  npm run build
  # Expected: No errors, all packages built
  ```

- [ ] Linting clean (if applicable)
  ```bash
  npm run lint
  # Expected: No errors
  ```

- [ ] CI/CD passing on main
  - Check GitHub Actions: https://github.com/j0KZ/mcp-agents/actions
  - All workflows green ✅

---

## Version Planning

### Choose Version Number

- [ ] Determined release type
  - [ ] Patch (X.X.N+1) - Bug fixes
  - [ ] Minor (X.N+1.0) - New features
  - [ ] Major (N+1.0.0) - Breaking changes

- [ ] New version number: `1.0.___`

- [ ] Checked version not already published
  ```bash
  npm view @j0kz/smart-reviewer-mcp versions
  # Verify new version not in list
  ```

### Security Release?

- [ ] Is this a security patch? Yes / No
- [ ] If yes, marked for expedited review
- [ ] If yes, prepared security advisory

---

## Version Update

### Update version.json

- [ ] Opened `version.json` in editor

- [ ] Changed version to: `1.0.___`
  ```json
  {
    "version": "1.0.___",
    "description": "Global version for all MCP packages..."
  }
  ```

- [ ] Saved file

### Sync Versions

- [ ] Ran version sync script
  ```bash
  npm run version:sync
  ```

- [ ] Verified sync successful
  ```bash
  npm run version:check-shared
  # Expected: All versions aligned ✅
  ```

- [ ] Checked root package.json updated
  ```bash
  grep '"version":' package.json
  # Expected: "version": "1.0.___"
  ```

---

## Documentation Update

### CHANGELOG.md

- [ ] Opened `CHANGELOG.md`

- [ ] Added new entry at TOP (after header)

- [ ] Used correct format:
  ```markdown
  ## [1.0.___] - YYYY-MM-DD

  ### 🎉/🐛/📦/🔒 [Release Type]

  **Changes:**
  - [Description of change 1]
  - [Description of change 2]

  **Impact:**
  - ✅ [Benefit 1]
  - ✅ [Benefit 2]
  ```

- [ ] Included:
  - [ ] What changed (features/fixes)
  - [ ] Why it matters (impact)
  - [ ] Breaking changes (if major version)
  - [ ] Migration guide (if needed)

- [ ] Saved CHANGELOG.md

### Test Count (if changed)

- [ ] Ran test count update (if tests added/removed)
  ```bash
  npm run update:test-count
  ```

---

## Build & Test

### Clean Build

- [ ] Removed old build artifacts
  ```bash
  rm -rf packages/*/dist
  ```

- [ ] Built all packages
  ```bash
  npm run build
  ```

- [ ] Verified all packages built
  ```bash
  ls packages/smart-reviewer/dist
  ls packages/test-generator/dist
  # ... check all 9 tools + shared
  ```

### Full Test Suite

- [ ] Ran complete test suite
  ```bash
  npm test
  ```

- [ ] All 388 tests passing ✅

- [ ] No test failures or warnings

### Coverage Check (optional)

- [ ] Ran coverage check
  ```bash
  npm run test:coverage:check
  ```

- [ ] Coverage ≥ 75% ✅

---

## Git Operations

### Create Commit

- [ ] Staged all changes
  ```bash
  git add .
  ```

- [ ] Created release commit
  ```bash
  git commit -m "release: v1.0.___

  Updated version across all 11 packages:
  - version.json: 1.0.__ → 1.0.___
  - CHANGELOG.md: Added release notes
  - All packages synced

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```

- [ ] Verified commit created
  ```bash
  git log -1 --oneline
  ```

### Create Tag

- [ ] Created annotated tag
  ```bash
  git tag -a v1.0.___ -m "Release 1.0.___"
  ```

- [ ] Verified tag created
  ```bash
  git tag -l "v1.0.___"
  # Expected: v1.0.___
  ```

- [ ] Checked tag points to correct commit
  ```bash
  git show v1.0.___
  ```

---

## npm Publish

### Publish Workspace Packages

- [ ] Published all packages
  ```bash
  npm run publish-all
  ```

- [ ] Verified output shows all 10 packages:
  ```
  + @j0kz/smart-reviewer-mcp@1.0.___
  + @j0kz/test-generator-mcp@1.0.___
  + @j0kz/architecture-analyzer-mcp@1.0.___
  + @j0kz/refactor-assistant-mcp@1.0.___
  + @j0kz/api-designer-mcp@1.0.___
  + @j0kz/db-schema-mcp@1.0.___
  + @j0kz/doc-generator-mcp@1.0.___
  + @j0kz/security-scanner-mcp@1.0.___
  + @j0kz/orchestrator-mcp@1.0.___
  + @j0kz/shared@1.0.___
  ```

### Publish Installer

- [ ] Published installer separately
  ```bash
  cd installer
  npm publish
  cd ..
  ```

- [ ] Verified installer published
  ```
  + @j0kz/mcp-agents@1.0.___
  ```

---

## Push to GitHub

### Push Commits

- [ ] Pushed commits to main
  ```bash
  git push origin main
  ```

- [ ] Verified push successful (no errors)

### Push Tags

- [ ] Pushed tags
  ```bash
  git push --tags
  ```

- [ ] Verified tags pushed
  - Check: https://github.com/j0KZ/mcp-agents/tags
  - Should see: v1.0.___

---

## GitHub Release

### Create Release (Option A: gh CLI)

- [ ] Created GitHub release
  ```bash
  gh release create v1.0.___ \
    --title "v1.0.___" \
    --notes "See CHANGELOG.md for details"
  ```

- [ ] Verified release created
  - Check: https://github.com/j0KZ/mcp-agents/releases
  - Should see: v1.0.___

### Create Release (Option B: Web UI)

- [ ] Opened https://github.com/j0KZ/mcp-agents/releases
- [ ] Clicked "Draft a new release"
- [ ] Selected tag: v1.0.___
- [ ] Added title: "Release v1.0.___"
- [ ] Copied CHANGELOG entry to description
- [ ] Clicked "Publish release"

---

## Post-Release Verification

### npm Package Verification

- [ ] Checked smart-reviewer published
  ```bash
  npm view @j0kz/smart-reviewer-mcp version
  # Expected: 1.0.___
  ```

- [ ] Checked test-generator published
  ```bash
  npm view @j0kz/test-generator-mcp version
  # Expected: 1.0.___
  ```

- [ ] Checked shared package published
  ```bash
  npm view @j0kz/shared version
  # Expected: 1.0.___
  ```

- [ ] Checked installer published
  ```bash
  npm view @j0kz/mcp-agents version
  # Expected: 1.0.___
  ```

### Installation Test

- [ ] Tested clean install in temp directory
  ```bash
  mkdir /tmp/test-install-v1.0.___
  cd /tmp/test-install-v1.0.___
  npx @j0kz/mcp-agents@latest
  ```

- [ ] Verified installer shows correct version: 1.0.___

- [ ] Verified installation successful (no errors)

- [ ] Tested individual package
  ```bash
  npx @j0kz/smart-reviewer-mcp@latest --help
  ```

- [ ] Cleaned up test directory
  ```bash
  cd ~
  rm -rf /tmp/test-install-v1.0.___
  ```

### GitHub Verification

- [ ] Checked release appears on GitHub
  - URL: https://github.com/j0KZ/mcp-agents/releases/tag/v1.0.___

- [ ] Verified release notes formatted correctly

- [ ] Checked tag linked to correct commit

- [ ] Verified CI/CD triggered and passed

---

## Monitoring

### Initial Monitoring (First 24 Hours)

- [ ] Hour 1: Check npm stats
  ```bash
  npm view @j0kz/smart-reviewer-mcp
  ```

- [ ] Hour 1: Monitor GitHub issues (any new reports?)

- [ ] Hour 6: Check download count increased

- [ ] Hour 24: Verify no critical bugs reported

### Week 1 Monitoring

- [ ] Day 3: Check for user feedback
- [ ] Day 7: Review download trends
- [ ] Day 7: Check for any issues filed

---

## Optional: Announcement

### If Significant Release

- [ ] Updated "What's New" in root README.md

- [ ] Posted to GitHub Discussions (if available)

- [ ] Tweeted/announced on social media (if applicable)

- [ ] Updated documentation site (if exists)

---

## Troubleshooting (If Issues)

### If Publish Failed

- [ ] Checked error message carefully
- [ ] Verified npm authentication: `npm whoami`
- [ ] Checked version not already published
- [ ] Retry: `npm run publish-all`
- [ ] If partial failure, publish individually:
  ```bash
  npm publish -w packages/failed-package
  ```

### If Tests Failed

- [ ] Don't proceed with release
- [ ] Fix failing tests
- [ ] Re-run: `npm test`
- [ ] Start checklist over from "Build & Test"

### If Git Push Failed

- [ ] Pulled latest: `git pull --rebase origin main`
- [ ] Resolved conflicts (if any)
- [ ] Re-push: `git push origin main`
- [ ] Push tags: `git push --tags`

---

## Final Confirmation

- [ ] All packages published to npm ✅
- [ ] Git commits and tags pushed ✅
- [ ] GitHub release created ✅
- [ ] Installation tested ✅
- [ ] Monitoring started ✅

**Release v1.0.___ COMPLETE!** 🎉

---

## Notes Section

Use this space for release-specific notes:

```
Date: _______________
Time Started: _______________
Time Completed: _______________

Issues Encountered:
_____________________________________
_____________________________________

Resolution:
_____________________________________
_____________________________________

Lessons Learned:
_____________________________________
_____________________________________
```

---

**Next Release:** Update this checklist if any steps changed!
