# Conflict Resolution & Rebasing Guide

Complete guide to handling merge conflicts, rebasing, and resolving git issues.

---

## Understanding Conflicts

### What Causes Conflicts?

Conflicts occur when:
1. **Same line edited** - Two branches modify the same line differently
2. **File deleted vs modified** - One branch deletes a file another edits
3. **Diverged histories** - Branches have incompatible changes

**Example conflict:**
```
<<<<<<< HEAD (your changes)
const version = '1.0.36';
=======
const version = '1.0.35';
>>>>>>> main (incoming changes)
```

---

## Conflict Resolution Strategies

### Strategy 1: Rebase onto main (RECOMMENDED)

**When to use:** Keep linear history, prefer latest changes

**Steps:**
```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Switch to feature branch
git checkout feature/your-branch

# 3. Rebase onto main
git rebase main

# If conflicts occur, you'll see:
# CONFLICT (content): Merge conflict in file.ts
# Resolve conflict, then: git add <file> && git rebase --continue
```

**Resolving conflicts during rebase:**
```bash
# 1. Open conflicted files in editor
# Look for conflict markers:
# <<<<<<< HEAD
# Your changes
# =======
# Incoming changes
# >>>>>>>

# 2. Edit file to desired state (remove markers)
# Example resolution:
const version = '1.0.36';  # Keep newer version

# 3. Stage resolved files
git add file.ts

# 4. Continue rebase
git rebase --continue

# 5. If more conflicts, repeat steps 1-4
# If stuck, abort: git rebase --abort
```

**After successful rebase:**
```bash
# Force push (with safety)
git push --force-with-lease

# ⚠️ NEVER force push to main/master!
```

---

### Strategy 2: Merge main into feature

**When to use:** Preserve all history, safer for shared branches

**Steps:**
```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Switch to feature branch
git checkout feature/your-branch

# 3. Merge main into feature
git merge main

# If conflicts, you'll see:
# CONFLICT (content): Merge conflict in file.ts
# Resolve conflict, then: git add <file> && git commit
```

**Resolving conflicts during merge:**
```bash
# 1. Edit conflicted files (same as rebase)
# Remove markers, keep desired changes

# 2. Stage resolved files
git add file.ts

# 3. Complete merge with commit
git commit -m "merge: resolve conflicts with main"

# 4. Push to GitHub
git push
```

---

## Common Conflict Scenarios

### Scenario 1: CHANGELOG Conflicts

**Problem:** Both branches add new release entries

**File looks like:**
```markdown
# Changelog

<<<<<<< HEAD
## [1.0.36] - 2025-10-13
Your new release
=======
## [1.0.35] - 2025-10-07
Someone else's release
>>>>>>> main
```

**Resolution:** Keep BOTH entries, newest first

```markdown
# Changelog

## [1.0.36] - 2025-10-13
Your new release

## [1.0.35] - 2025-10-07
Someone else's release
```

**Always:** Place newer version at top, keep both

---

### Scenario 2: Package.json Version Conflicts

**Problem:** Version bumped in both branches

**File:**
```json
{
<<<<<<< HEAD
  "version": "1.0.36",
=======
  "version": "1.0.35",
>>>>>>> main
}
```

**Resolution:** Use HIGHER version

```json
{
  "version": "1.0.36",
}
```

**Note:** May need manual version coordination for major releases

---

### Scenario 3: Import Statement Conflicts

**Problem:** Both branches import different things

**File:**
```typescript
<<<<<<< HEAD
import { foo, bar, baz } from './utils.js';
=======
import { foo, qux } from './utils.js';
>>>>>>> main
```

**Resolution:** Merge imports (include all needed)

```typescript
import { foo, bar, baz, qux } from './utils.js';
```

**Verify:** Remove duplicates, ensure all are actually used

---

### Scenario 4: Function Signature Conflicts

**Problem:** Function changed differently in both branches

**File:**
```typescript
<<<<<<< HEAD
function analyze(file: string, options?: AnalyzeOptions): Promise<Result> {
  // Your implementation
=======
function analyze(filePath: string): Promise<AnalysisResult> {
  // Their implementation
>>>>>>> main
```

**Resolution:** This is a **breaking change** - coordinate with team

**Options:**
1. Accept one version (may break other code)
2. Combine both changes carefully
3. Create new function name

**Best practice:** Discuss in PR comments before resolving

---

## Advanced Rebase Scenarios

### Interactive Rebase

**Use for:** Clean up commit history before merging

```bash
# Rebase last 3 commits
git rebase -i HEAD~3

# Editor opens with:
pick abc1234 feat: add feature
pick def5678 fix: typo
pick ghi9012 fix: another typo

# Change to:
pick abc1234 feat: add feature
squash def5678 fix: typo
squash ghi9012 fix: another typo
# Saves as single commit with combined message
```

**Actions available:**
- `pick` - Use commit as-is
- `squash` - Merge with previous commit
- `reword` - Edit commit message
- `edit` - Amend commit
- `drop` - Remove commit

**Example cleanup:**
```bash
# Before (messy history)
fix: typo
feat: add feature
fix: another typo
fix: forgot to add file

# After (clean history)
feat: add feature
# All fixes squashed into main commit
```

---

### Rebase with Conflicts

**If conflicts occur during interactive rebase:**

```bash
# 1. Resolve conflict in file
# 2. Stage resolved file
git add file.ts

# 3. Continue rebase
git rebase --continue

# If you get stuck:
git rebase --abort  # Start over
```

---

## Handling Diverged Histories

**Symptom:** `git push` fails with:

```
! [rejected]        feature/branch -> feature/branch (non-fast-forward)
```

**Diagnosis:**

```bash
# Check divergence
git log origin/feature/branch..HEAD  # Your commits
git log HEAD..origin/feature/branch  # Their commits
```

**Solution 1: Rebase (if you haven't shared branch)**

```bash
git pull --rebase origin feature/branch
git push
```

**Solution 2: Merge (if branch is shared)**

```bash
git pull origin feature/branch
git push
```

**Solution 3: Force push (DANGEROUS - only if you're sure)**

```bash
# ⚠️ Only use if:
# - Branch is yours alone
# - You know what you're doing
# - NEVER on main/master

git push --force-with-lease
```

---

## Undo Strategies

### Undo Last Commit (not pushed)

```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes entirely
git reset --hard HEAD~1
```

### Undo Last Commit (already pushed)

```bash
# Create new commit that reverses changes
git revert HEAD
git push
```

### Undo Merge

```bash
# If merge not yet committed
git merge --abort

# If merge committed but not pushed
git reset --hard HEAD~1

# If merge pushed
git revert -m 1 HEAD
git push
```

### Undo Rebase

```bash
# Abort in-progress rebase
git rebase --abort

# Undo completed rebase (use reflog)
git reflog  # Find SHA before rebase
git reset --hard <sha-before-rebase>
```

---

## Conflict Prevention

### 1. Sync Often

```bash
# Update main frequently
git checkout main
git pull origin main

# Rebase feature branch regularly
git checkout feature/branch
git rebase main
```

**Frequency:** Daily for active branches

### 2. Small, Focused PRs

**✅ Good PR:**
- 1-3 files modified
- Single feature/fix
- <300 LOC changed

**❌ Bad PR:**
- 20+ files modified
- Multiple unrelated changes
- 1000+ LOC changed

### 3. Coordinate on Shared Files

**High-conflict files:**
- CHANGELOG.md
- package.json
- version.json
- tools.json

**Strategy:** Communicate in team chat before editing

### 4. Use Feature Flags

**For large features:**
```typescript
// Enable feature gradually
if (featureFlags.newAnalyzer) {
  return newAnalyze(file);
}
return legacyAnalyze(file);
```

**Benefit:** Multiple people can work without conflicts

---

## Tools for Conflict Resolution

### VS Code

**Built-in merge editor:**
1. Open conflicted file
2. See highlighted conflicts
3. Click "Accept Current Change" / "Accept Incoming" / "Accept Both"

**Extension:** GitLens (recommended)

### Command Line

```bash
# Use merge tool (configured in .gitconfig)
git mergetool

# Example tools:
# - vimdiff
# - meld
# - kdiff3
# - VS Code (code --wait --merge)
```

### Configure Merge Tool

```bash
# Set VS Code as merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'

# Set vimdiff (terminal)
git config --global merge.tool vimdiff
```

---

## Emergency Procedures

### Stuck in Rebase Hell

```bash
# 1. Abort everything
git rebase --abort

# 2. Return to safe state
git checkout main
git pull origin main

# 3. Recreate branch from latest main
git checkout -b feature/branch-v2

# 4. Cherry-pick your commits
git cherry-pick <sha1> <sha2> <sha3>

# 5. Force push (if branch already existed)
git push --force-with-lease origin feature/branch-v2
```

### Lost Work After Bad Rebase

```bash
# 1. Find lost commits in reflog
git reflog

# Output:
# abc1234 HEAD@{0}: rebase: aborting
# def5678 HEAD@{1}: commit: feat: add feature  <-- Lost commit!

# 2. Recover commit
git cherry-pick def5678

# Or reset to before disaster
git reset --hard def5678
```

### Accidentally Force Pushed to main

```bash
# ⚠️ EMERGENCY - Contact team immediately

# 1. Find previous main state in reflog
git reflog origin/main

# 2. Reset main to previous state
git push origin <previous-sha>:main --force

# 3. Inform team to re-sync
```

---

## Best Practices

### ✅ DO

1. **Rebase feature branches regularly**
   ```bash
   git checkout feature/branch
   git fetch origin
   git rebase origin/main
   ```

2. **Use `--force-with-lease` (never plain `--force`)**
   ```bash
   git push --force-with-lease
   # Safer - fails if someone else pushed
   ```

3. **Communicate before force pushing shared branches**

4. **Test after resolving conflicts**
   ```bash
   npm test
   npm run build
   ```

5. **Use descriptive merge commit messages**
   ```bash
   git commit -m "merge: resolve conflicts with main

   - Kept both CHANGELOG entries
   - Updated package.json to v1.0.36
   - Merged import statements"
   ```

### ❌ DON'T

1. **Never force push to main/master**
   ```bash
   # ⚠️ NEVER DO THIS
   git push --force origin main
   ```

2. **Don't resolve conflicts without understanding them**
   - Always know what code does
   - Ask team if unsure

3. **Don't merge without testing**
   - Run tests after conflict resolution
   - Verify build succeeds

4. **Don't use `git reset --hard` without backing up**
   ```bash
   # Safer: Create backup branch first
   git branch backup-branch
   git reset --hard HEAD~1
   ```

---

## Quick Reference

### Conflict Resolution Commands

```bash
# During merge
git merge main           # Start merge
git status              # See conflicts
# ... resolve conflicts ...
git add <files>         # Stage resolved files
git commit              # Complete merge

# During rebase
git rebase main         # Start rebase
git status              # See conflicts
# ... resolve conflicts ...
git add <files>         # Stage resolved files
git rebase --continue   # Continue rebase

# Abort operations
git merge --abort       # Abort merge
git rebase --abort      # Abort rebase

# Recovery
git reflog              # View history
git cherry-pick <sha>   # Recover commit
```

### Safe Force Push

```bash
# ✅ SAFE (checks remote state first)
git push --force-with-lease

# ❌ DANGEROUS (ignores remote state)
git push --force
```

---

## Related

- See `pr-review-checklist.md` for PR merge strategies
- See `github-cli-guide.md` for `gh pr` commands
- See `conventional-commits-guide.md` for commit message format

---

**Reference:** Git documentation and best practices
**Project:** @j0kz/mcp-agents
