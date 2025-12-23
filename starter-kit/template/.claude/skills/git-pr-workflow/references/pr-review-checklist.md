# Pull Request Review Checklist

Complete checklist and best practices for creating, reviewing, and merging pull requests.

---

## Before Requesting Review

### Code Quality Checks

- [ ] All tests passing locally (`npm test`)
- [ ] Build successful (`npm run build`)
- [ ] Conventional commits used throughout
- [ ] PR description complete (all required sections)
- [ ] Documentation updated (README, CHANGELOG if applicable)
- [ ] No debugging code left (console.log, commented code)
- [ ] Test count updated if tests added/removed
- [ ] Wiki updated if user-facing changes

### Quality Gate Commands

```bash
# Run comprehensive pre-push checks
npm test
npm run build
npm run version:check-shared
npm run lint  # If applicable
npm run update:test-count  # If tests modified
```

**Expected results:**
- ✅ All tests passing (388/388)
- ✅ Build successful across all packages
- ✅ No version mismatches
- ✅ No breaking lint errors

---

## PR Description Template

### Required Sections

#### 1. Summary
**What and why in 2-3 sentences**

Example:
```markdown
## Summary

Implemented smart ambiguity detection and bilingual support (English/Spanish) for orchestrator workflows.

This solves the problem of users providing vague requests like "review my code" without specifying focus areas, and enables Spanish-speaking users to interact naturally in their language.
```

#### 2. Changes
**Files modified, lines added/removed**

Example:
```markdown
## Changes

**New Files:**
- `packages/orchestrator-mcp/src/helpers/workflow-selector.ts` (77 LOC)
- `packages/orchestrator-mcp/src/helpers/response-builder.ts` (88 LOC)
- `packages/shared/src/i18n/messages.ts` (261 LOC)

**Modified:**
- `packages/orchestrator-mcp/src/mcp-server.ts` - Added focus/language parameters
- 15 test files - Added bilingual tests

**Total:** +426 LOC added, -50 LOC removed
```

#### 3. Test Results
**Test count, pass rate, coverage**

Example:
```markdown
## Test Results

- ✅ 388 passing tests (366 → 388, +22 tests)
- ✅ 15 new bilingual workflow tests
- ✅ 7 ambiguity detection tests
- ✅ 100% pass rate maintained
- ✅ Build successful across all packages
- ✅ Coverage: 75% (no regression)
```

#### 4. Documentation
**What docs were updated**

Example:
```markdown
## Documentation

- Updated `packages/orchestrator-mcp/README.md` with new features
- Updated CHANGELOG.md with comprehensive release notes
- Wiki pages ready for publication (will sync after merge)
- Added JSDoc comments to all new functions
```

#### 5. Breaking Changes
**If any (or "None")**

Example:
```markdown
## Breaking Changes

None - fully backward compatible.

New parameters (`focus`, `language`) are optional and default to previous behavior.
```

#### 6. Migration Guide (if breaking changes)
**How to update existing code**

Example:
```markdown
## Migration Guide

**Old API:**
\`\`\`typescript
await orchestrator.runWorkflow('pre-merge');
\`\`\`

**New API:**
\`\`\`typescript
await orchestrator.runWorkflow('pre-merge', {
  focus: 'security',  // Optional: 'security' | 'quality' | 'performance' | 'all'
  language: 'es'      // Optional: 'en' | 'es'
});
\`\`\`

**No changes required** - old API still works with default values.
```

---

## Full PR Template Example

```markdown
# feat(orchestrator): Add ambiguity detection and bilingual support

## Summary

Implemented smart ambiguity detection and bilingual support (English/Spanish) for orchestrator workflows.

**Key Features:**
- ✅ Two-iteration clarification pattern for vague requests
- ✅ Focus areas: Security, Quality, Performance, Comprehensive
- ✅ Bilingual messages with natural translations
- ✅ 3x faster execution with targeted workflows
- ✅ Zero breaking changes (backward compatible)

## Changes

**New Files:**
- `packages/orchestrator-mcp/src/helpers/workflow-selector.ts` (77 LOC)
- `packages/orchestrator-mcp/src/helpers/response-builder.ts` (88 LOC)
- `packages/shared/src/i18n/messages.ts` (261 LOC)

**Modified:**
- `packages/orchestrator-mcp/src/mcp-server.ts` - Added focus/language parameters
- 15 test files - Added bilingual tests

## Test Results

- ✅ 388 passing tests (366 → 388, +22 tests)
- ✅ 15 new bilingual workflow tests
- ✅ 7 ambiguity detection tests
- ✅ 100% pass rate maintained
- ✅ Build successful across all packages

## Documentation

- Updated `packages/orchestrator-mcp/README.md` with new features
- Updated CHANGELOG.md with comprehensive release notes
- Wiki pages ready for publication

## Breaking Changes

None - fully backward compatible.

## Migration Guide

No migration needed. New parameters (`focus`, `language`) are optional.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Code Review Best Practices

### What to Look For

**Code Quality:**
- [ ] Follows project conventions (modular architecture, <300 LOC files)
- [ ] Clear variable/function names
- [ ] No code duplication
- [ ] Edge cases handled
- [ ] Error handling present

**Testing:**
- [ ] New features have tests
- [ ] Edge cases covered
- [ ] Assertions are specific (not just `.toBeDefined()`)
- [ ] Tests follow naming conventions
- [ ] Coverage doesn't decrease

**Documentation:**
- [ ] README updated for user-facing changes
- [ ] CHANGELOG updated with release notes
- [ ] Code comments for complex logic
- [ ] JSDoc for public APIs

**Performance:**
- [ ] No obvious performance regressions
- [ ] Expensive operations cached where appropriate
- [ ] No memory leaks (event listeners cleaned up)

**Security:**
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Safe file path handling
- [ ] Dependencies up to date

### How to Give Feedback

**✅ Good Feedback:**
```markdown
**Suggestion:** Consider extracting this 50-line function into smaller helpers

**Rationale:** Would improve readability and testability

**Example:**
\`\`\`typescript
// Instead of one 50-line function
function processData(data) {
  // Extract to:
  const validated = validateData(data);
  const transformed = transformData(validated);
  return formatOutput(transformed);
}
\`\`\`
```

**❌ Bad Feedback:**
```markdown
This code is messy, rewrite it.
```

---

## Merge Strategies

### 1. Squash and Merge (RECOMMENDED)

**When to use:** Most feature branches

**Benefits:**
- Clean, linear history
- Single commit per feature
- Easy to revert if needed

**Command:**
```bash
gh pr merge --squash --delete-branch
```

**Result:**
```
main: A---B---C---D (single squashed commit)
              ^
              feature work
```

### 2. Rebase and Merge

**When to use:** Clean commit history already exists

**Benefits:**
- Preserves individual commits
- Linear history
- No merge commits

**Command:**
```bash
gh pr merge --rebase --delete-branch
```

**Result:**
```
main: A---B---C1---C2---C3 (individual commits preserved)
```

### 3. Merge Commit

**When to use:** Want to preserve branch context

**Benefits:**
- Shows branch history
- Clear feature boundaries
- Easier to track related commits

**Command:**
```bash
gh pr merge --merge --delete-branch
```

**Result:**
```
main: A---B-------M (merge commit)
           \     /
            C1--C2 (feature branch)
```

---

## After Merge

### Cleanup

```bash
# Update local main
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/branch-name

# Verify changes
git log --oneline -5
```

### Verify CI/CD

```bash
# Check deployment status
gh run list --limit 5

# Watch latest run
gh run watch

# View run details
gh run view <run-id>
```

### Wiki Sync (if needed)

```powershell
# Publish updated wiki
./publish-wiki.ps1
```

---

## Common Review Issues

### Issue: Outdated with main

**Symptom:** PR shows conflicts or "behind main"

**Solution:**
```bash
# Option 1: Rebase (cleaner)
git checkout feature/branch
git fetch origin
git rebase origin/main
git push --force-with-lease

# Option 2: Merge (safer)
git checkout feature/branch
git merge origin/main
git push
```

### Issue: CI failing

**Symptom:** Red X on PR checks

**Solution:**
1. Check error messages in GitHub Actions
2. Reproduce locally (`npm test`, `npm run build`)
3. Fix issues
4. Commit fixes
5. Push to update PR

### Issue: Large PR (>500 LOC)

**Symptom:** Difficult to review, long turnaround

**Solution:**
1. Split into smaller PRs if possible
2. Add detailed documentation
3. Include screenshots/examples
4. Request focused review (e.g., "focus on architecture")

---

## Emergency Rollback

**If merged PR breaks production:**

```bash
# Option 1: Revert the merge commit
git revert <merge-commit-sha>
git push origin main

# Option 2: Create hotfix PR
git checkout -b fix/rollback-feature
git revert <merge-commit-sha>
git push -u origin fix/rollback-feature
gh pr create --title "fix: Rollback feature X" --body "Reverting due to production issue"
```

---

## Related

- See `conventional-commits-guide.md` for commit message format
- See `github-cli-guide.md` for full gh CLI reference
- See `conflict-resolution-guide.md` for merge conflict handling

---

**Reference:** Used in 25+ releases with PR history in CHANGELOG.md
**Standard:** GitHub pull request best practices
**Project:** @j0kz/mcp-agents
