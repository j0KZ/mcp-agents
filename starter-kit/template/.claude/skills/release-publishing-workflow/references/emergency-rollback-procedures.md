# Emergency Rollback Procedures

Complete guide for rolling back problematic releases.

---

## When to Rollback

**Rollback if:**
- Critical bug discovered after npm publish
- Security vulnerability in published version
- Breaking changes accidentally shipped
- Tests pass locally but fail in production
- Major functionality broken

**Don't rollback for:**
- Minor bugs (patch instead)
- Documentation errors (update docs)
- Non-critical issues (fix in next release)

---

## Option 1: Unpublish (Within 72 Hours)

### When to Use

- **ONLY if:** Published < 72 hours ago AND minimal downloads
- **Last resort only** - breaks existing users

### Process

```bash
# Check package stats first
npm view @j0kz/smart-reviewer-mcp

# Unpublish specific version
npm unpublish @j0kz/smart-reviewer-mcp@1.0.37

# Or unpublish from all packages
npm unpublish @j0kz/test-generator-mcp@1.0.37
npm unpublish @j0kz/architecture-analyzer-mcp@1.0.37
# ... repeat for all 11 packages
```

### ⚠️ WARNING

**Consequences:**
- ❌ Breaks anyone who installed this version
- ❌ npm registry shows gap in versions
- ❌ Can't republish same version number
- ❌ Trust impact (users see version disappear)

**Use ONLY for:**
- Security vulnerabilities
- Data loss bugs
- Complete breakage

---

## Option 2: Deprecate + Quick Patch (RECOMMENDED)

### When to Use

- **Default choice** for most issues
- Works at any time (no 72-hour limit)
- Doesn't break existing users

### Process

**Step 1: Deprecate broken version**

```bash
# Deprecate with clear message
npm deprecate @j0kz/smart-reviewer-mcp@1.0.37 \
  "Critical bug in auto-fix - use 1.0.38+ instead"

# Deprecate all packages if monorepo-wide issue
npm deprecate @j0kz/test-generator-mcp@1.0.37 "Use 1.0.38+"
npm deprecate @j0kz/architecture-analyzer-mcp@1.0.37 "Use 1.0.38+"
# ... repeat for all affected packages
```

**Step 2: Immediately release patch**

```bash
# Update version.json
# 1.0.37 → 1.0.38

# Follow full release process
node scripts/release.js
# Select "patch" release
# Add fix in CHANGELOG
```

**Step 3: Announce**

```markdown
# In CHANGELOG.md
## [1.0.38] - 2025-10-17

### 🔒 Critical Fix

**DO NOT USE v1.0.37** - Critical bug in auto-fix feature

**Problem**: Auto-fix corrupted imports in certain edge cases
**Solution**: Fixed path resolution logic
**Impact**: All auto-fix operations now safe

**Migration**: Upgrade immediately from 1.0.37 → 1.0.38
```

### Benefits

- ✅ Existing users still work (no breakage)
- ✅ New users get warning + correct version
- ✅ Can be done any time
- ✅ Maintains version history
- ✅ Users trust you fixed it quickly

---

## Option 3: Git Rollback (Not Yet Pushed)

### When to Use

- **ONLY if:** Committed but NOT yet pushed to GitHub
- **ONLY if:** NOT yet published to npm

### Process

```bash
# Check if pushed
git status
git log origin/main..HEAD
# If shows commits → not pushed yet ✅

# Delete local tag
git tag -d v1.0.37

# Rollback commit
git reset --hard HEAD~1

# Verify
git log --oneline -5
git tag -l "v1.0.*"
```

### ⚠️ NEVER Use If Already Pushed

**Don't use if:**
- ❌ Already pushed to GitHub
- ❌ Already published to npm
- ❌ Other developers pulled your changes

**Why:**
- Force push rewrites history (dangerous)
- Other developers have conflicting state
- npm publish is permanent

---

## Option 4: Forward Fix (Minor Issues)

### When to Use

- Non-critical bugs
- Documentation errors
- Minor UX issues

### Process

```bash
# Just fix and release next version
# No rollback needed

# Fix the issue
# ... edit code ...

# Release patch
node scripts/release.js
# Version: 1.0.37 → 1.0.38
```

**When appropriate:**
- Bug affects < 10% of users
- Workaround exists
- No data loss/security risk
- Can wait for normal release

---

## Decision Matrix

| Scenario | Recommended Option | Why |
|----------|-------------------|-----|
| Security vulnerability | Option 2 (Deprecate + Patch) | Fast, safe, transparent |
| Data loss bug | Option 2 or Option 1 | Prevent more damage |
| Complete breakage | Option 2 (Deprecate + Patch) | Fix ASAP, don't break existing |
| Published < 1 hour, 0 downloads | Option 1 (Unpublish) | No impact yet |
| Minor bug | Option 4 (Forward Fix) | Not urgent |
| Not yet pushed | Option 3 (Git Rollback) | Clean history |

---

## Post-Rollback Checklist

**After any rollback:**

- [ ] Notify users (GitHub Discussions, npm description)
- [ ] Update README with warning (if severe)
- [ ] Document what went wrong (postmortem)
- [ ] Add test to prevent recurrence
- [ ] Review release process (what was missed?)
- [ ] Monitor for users still on broken version

---

## Real-World Examples

### Example 1: Import Bug (v1.0.36)

**Problem:** Test generator created broken imports
**Discovered:** 2 hours after publish
**Downloads:** ~50
**Action:** Option 2 (Deprecate + Patch)

```bash
# Deprecated v1.0.36
npm deprecate @j0kz/test-generator-mcp@1.0.36 \
  "Import bug - use 1.0.37+"

# Released v1.0.37 same day with fix
```

**Outcome:** ✅ Users warned, fix shipped fast, no breakage

---

### Example 2: Wrong Version Published

**Problem:** Accidentally published 2.0.0 instead of 1.0.37
**Discovered:** Immediately (before push)
**Action:** Option 3 (Git Rollback)

```bash
git tag -d v2.0.0
git reset --hard HEAD~1
npm unpublish @j0kz/package@2.0.0
# Re-release correctly as 1.0.37
```

**Outcome:** ✅ Caught before impact, clean fix

---

## Prevention Tips

**To avoid needing rollback:**

1. ✅ ALWAYS use dry-run first (`node scripts/release.js`)
2. ✅ Test installation locally before pushing
3. ✅ Check version.json matches intended version
4. ✅ Review CHANGELOG entry carefully
5. ✅ Run full test suite locally
6. ✅ Verify CI passes before release
7. ✅ Start with small releases (learn gradually)

---

## Common Rollback Mistakes

### ❌ Don't Do This

**Mistake 1: Force push to main**
```bash
git push --force origin main  # ❌ NEVER!
```
**Why:** Breaks other developers, dangerous

**Mistake 2: Unpublish after 1000+ downloads**
```bash
npm unpublish @j0kz/package@1.0.37  # ❌ Bad idea
```
**Why:** Breaks hundreds of users

**Mistake 3: Skip announcing rollback**
```bash
# Fix silently and hope nobody notices  # ❌ Don't hide it
```
**Why:** Users lose trust, same bugs hit multiple people

### ✅ Do This Instead

**Do 1: Deprecate + communicate**
```bash
npm deprecate @j0kz/package@1.0.37 "Critical bug - use 1.0.38"
# Post in GitHub Discussions
# Update README
```

**Do 2: Fast forward fix**
```bash
# Fix → Test → Release 1.0.38 within hours
# Show you respond quickly to issues
```

**Do 3: Transparent postmortem**
```markdown
# In CHANGELOG or GitHub Discussion
## What Happened
- Bug X in v1.0.37
- Caught Y hours after release
- Fixed in v1.0.38
- Added test to prevent recurrence
```

---

## Emergency Contact Info

**If catastrophic issue:**

1. Deprecate immediately
2. Post urgent warning in GitHub repo
3. Release fix ASAP (skip normal review if critical)
4. Notify via npm description update
5. Document thoroughly after resolution

---

**Remember:** Option 2 (Deprecate + Patch) is almost always the right choice.
Unpublish is extreme, git rollback only works if not pushed, forward fix is for minor issues.
