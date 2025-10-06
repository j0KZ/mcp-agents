# v1.0.31 Release Checklist

## ✅ Pre-Release (Complete)

- [x] **Version Management**
  - [x] Updated `version.json` to 1.0.31
  - [x] Ran `npm run version:sync` (14 files updated)
  - [x] Verified all packages on 1.0.31

- [x] **Documentation**
  - [x] Updated CHANGELOG.md with Phase 2 & 3 changes
  - [x] Updated README.md with new features and badges
  - [x] Created PHASE3_SUMMARY.md
  - [x] Created RELEASE_NOTES_v1.0.31.md
  - [x] Updated ROADMAP.md (Phase 3 complete)

- [x] **Code Quality**
  - [x] All builds successful (11 packages)
  - [x] All tests passing (853/853, 100%)
  - [x] .gitignore updated with new patterns
  - [x] No linting errors

---

## 📦 Release Steps

### 1. Build All Packages

```bash
npm run build
```

**Expected:** All 11 packages build successfully (api-designer, architecture-analyzer, config-wizard, db-schema, doc-generator, orchestrator-mcp, refactor-assistant, security-scanner, shared, smart-reviewer, test-generator)

### 2. Run Full Test Suite

```bash
npm test
```

**Expected:** 853 tests passing across 42 test files

### 3. Verify Package Versions

```bash
# Check all packages are on 1.0.31
grep -r '"version": "1.0.31"' packages/*/package.json | wc -l
# Should output: 10

# Check installer
grep '"version": "1.0.31"' installer/package.json
```

### 4. Publish to NPM

```bash
# Dry run first (recommended)
npm run publish-all --dry-run

# Actual publish (requires npm auth)
npm run publish-all
```

**Packages to Publish:**
1. @j0kz/shared@1.0.31
2. @j0kz/smart-reviewer-mcp@1.0.31
3. @j0kz/test-generator-mcp@1.0.31
4. @j0kz/architecture-analyzer-mcp@1.0.31
5. @j0kz/refactor-assistant-mcp@1.0.31
6. @j0kz/api-designer-mcp@1.0.31
7. @j0kz/db-schema-mcp@1.0.31
8. @j0kz/doc-generator-mcp@1.0.31
9. @j0kz/security-scanner-mcp@1.0.31
10. @j0kz/orchestrator-mcp@1.0.31

### 5. Publish Installer

```bash
cd installer
npm publish
cd ..
```

**Package:** @j0kz/mcp-config-wizard@1.0.31

### 6. Git Commit and Tag

```bash
# Add all changes
git add .

# Commit with release message
git commit -m "release: v1.0.31 - Performance & Optimization

🚀 Phase 3: Performance & Optimization (COMPLETE)
- ⚡ 2.18x speedup with intelligent caching (99.9% hit rate)
- 🔥 AST parsing 73% faster with content-based cache invalidation
- 📊 Hash generation: 673K ops/sec throughput
- ✅ Zero breaking changes - fully backwards compatible

📈 Phase 2: Quality & Test Coverage (COMPLETE)
- ✅ Added 225 new tests (625 → 850)
- ✅ Smart-reviewer analyzers: 0% → 100% coverage
- ✅ Strengthened api-designer assertions

Performance Metrics:
- Analysis Cache: 2.18x speedup (99.9% hit rate)
- AST Parsing: 73% faster with cache
- Hash Generation: 673K ops/sec
- Tests: 853 total (+228 from v1.0.30)
- Pass Rate: 100% (853/853)

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Create and push tag
git tag -a v1.0.31 -m "Release v1.0.31 - Performance & Optimization

Major performance improvements with intelligent caching:
- 2.18x average speedup (99.9% hit rate)
- AST parsing 73% faster
- 673K ops/sec hash generation
- +228 tests (853 total, 100% pass rate)
- Zero breaking changes"

# Push to remote
git push origin main
git push origin v1.0.31
```

### 7. Create GitHub Release

1. Go to: https://github.com/j0KZ/mcp-agents/releases/new
2. Tag: `v1.0.31`
3. Title: `v1.0.31 - Performance & Optimization 🚀`
4. Copy content from `RELEASE_NOTES_v1.0.31.md`
5. Mark as latest release
6. Publish release

---

## ✅ Post-Release Verification

### NPM Verification

```bash
# Check published versions
npm view @j0kz/shared version
npm view @j0kz/smart-reviewer-mcp version
npm view @j0kz/test-generator-mcp version
npm view @j0kz/mcp-config-wizard version
# ... etc

# All should show: 1.0.31
```

### Installation Test

```bash
# Test global install
npm install -g @j0kz/mcp-config-wizard@1.0.31

# Test wizard
npx @j0kz/mcp-config-wizard

# Verify installed version
npm list -g @j0kz/mcp-config-wizard
```

### GitHub Verification

- [ ] Release appears on https://github.com/j0KZ/mcp-agents/releases
- [ ] Tag v1.0.31 is visible
- [ ] Release notes are formatted correctly
- [ ] Latest release badge shows v1.0.31

---

## 📊 Release Metrics

**Version:** 1.0.31
**Release Date:** October 5, 2025

**Performance:**
- 2.18x speedup with caching
- 99.9% cache hit rate
- 73% faster AST parsing
- 673K ops/sec hash generation

**Quality:**
- 853 tests (100% pass rate)
- 42 test files
- Zero breaking changes
- 11 packages published

**Documentation:**
- CHANGELOG.md updated
- README.md updated
- PHASE3_SUMMARY.md created
- RELEASE_NOTES_v1.0.31.md created
- ROADMAP.md updated

---

## 🐛 Known Issues

None identified for this release.

---

## 📝 Notes

**npm Credentials Required:**
- Must be logged in to npm (`npm login`)
- Must have publish access to `@j0kz` scope
- 2FA may be required for publishing

**Git Credentials Required:**
- Must have push access to main branch
- Must have permission to create tags

**Important:**
- Always run `npm run build` before publishing
- Always run `npm test` to verify
- Use `--dry-run` for first publish attempt
- Verify each package publishes successfully

---

## 🔄 Rollback Procedure (If Needed)

If issues are discovered post-release:

```bash
# Unpublish problematic package (within 72 hours)
npm unpublish @j0kz/package-name@1.0.31

# Or deprecate (after 72 hours)
npm deprecate @j0kz/package-name@1.0.31 "Use version 1.0.32 instead"

# Revert git tag
git tag -d v1.0.31
git push origin :refs/tags/v1.0.31

# Revert commit
git revert HEAD
git push origin main
```

---

## ✅ Final Checklist

Before publishing:
- [ ] All builds successful
- [ ] All tests passing (853/853)
- [ ] Documentation updated
- [ ] Version synced (1.0.31)
- [ ] Git status clean
- [ ] npm credentials ready
- [ ] Ready to publish!

**Ready for release! 🚀**
