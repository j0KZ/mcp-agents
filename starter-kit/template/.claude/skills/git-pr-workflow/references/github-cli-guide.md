# GitHub CLI (gh) Complete Guide

Complete reference for using GitHub CLI (`gh`) to manage pull requests, issues, and workflows.

---

## Installation & Setup

### Installation

**Windows:**
```bash
winget install --id GitHub.cli
```

**macOS:**
```bash
brew install gh
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Authentication

```bash
# Interactive login (recommended)
gh auth login

# Choose options:
# 1. GitHub.com (or GitHub Enterprise)
# 2. HTTPS (recommended)
# 3. Login with web browser (easiest)

# Verify authentication
gh auth status

# Output:
# ✓ Logged in to github.com as username
```

### Configure Defaults

```bash
# Set default editor
gh config set editor "code --wait"  # VS Code
gh config set editor "vim"          # Vim

# Set default protocol
gh config set git_protocol https

# View all config
gh config list
```

---

## Creating Pull Requests

### Basic PR Creation

```bash
# Must be on feature branch with commits pushed
gh pr create \
  --title "feat: Add new feature" \
  --body "Description of changes"
```

**Interactive mode (recommended for beginners):**
```bash
gh pr create

# Prompts:
# - Title: feat: Add new feature
# - Body: Opens editor for description
# - Base branch: main (default)
# - Publish? Yes
```

### PR with Full Template

```bash
gh pr create \
  --title "feat(orchestrator): Add ambiguity detection and bilingual support" \
  --body "$(cat <<'EOF'
## Summary

Implemented smart ambiguity detection and bilingual support (English/Spanish).

## Changes
- New files: workflow-selector.ts, response-builder.ts, messages.ts
- Modified: mcp-server.ts, 15 test files

## Test Results
- ✅ 388 passing tests (+22 tests)
- ✅ 100% pass rate
- ✅ Build successful

## Breaking Changes
None - fully backward compatible.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### PR with Assignees and Labels

```bash
gh pr create \
  --title "fix: Resolve test generator import bug" \
  --body "Fixes absolute path imports in generated tests" \
  --assignee @me \
  --reviewer username1,username2 \
  --label bug,high-priority \
  --milestone v1.0.37
```

### Draft PR (for early feedback)

```bash
gh pr create \
  --draft \
  --title "WIP: Refactor security scanner" \
  --body "Early version for feedback - not ready to merge"
```

### PR from File Template

```bash
# Create template file
cat > pr-template.md <<'EOF'
## Summary
[Description]

## Changes
[List changes]

## Test Results
[Test results]
EOF

# Use template
gh pr create --title "feat: New feature" --body-file pr-template.md
```

---

## Managing Pull Requests

### Viewing PRs

```bash
# List all open PRs
gh pr list

# List with filters
gh pr list --state all              # All PRs (open, closed, merged)
gh pr list --author username        # By author
gh pr list --label bug              # By label
gh pr list --assignee @me           # Assigned to you

# View specific PR
gh pr view 123                      # By number
gh pr view --web                    # Open in browser

# View PR diff
gh pr diff 123

# View PR checks
gh pr checks
gh pr checks 123
```

### Updating PRs

```bash
# Edit PR details
gh pr edit 123 --title "New title"
gh pr edit 123 --body "New description"
gh pr edit 123 --add-label security
gh pr edit 123 --remove-label wip

# Mark as ready (convert from draft)
gh pr ready 123

# Convert to draft
gh pr edit 123 --draft
```

### Reviewing PRs

```bash
# Review interactively
gh pr review 123

# Approve
gh pr review 123 --approve

# Request changes
gh pr review 123 --request-changes --body "Please fix X"

# Comment without approval
gh pr review 123 --comment --body "Looks good, minor suggestions"

# Review with file comments
gh pr review 123 \
  --comment \
  --body-file review-comments.md
```

### Merging PRs

```bash
# Squash and merge (recommended)
gh pr merge 123 --squash --delete-branch

# With custom message
gh pr merge 123 --squash --delete-branch --body "Merged feature X"

# Rebase and merge
gh pr merge 123 --rebase --delete-branch

# Regular merge commit
gh pr merge 123 --merge --delete-branch

# Auto-merge when checks pass
gh pr merge 123 --auto --squash
```

### Closing/Reopening PRs

```bash
# Close without merging
gh pr close 123
gh pr close 123 --comment "Closing due to X"

# Reopen closed PR
gh pr reopen 123
```

---

## Common Workflows

### Feature Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes, commit
git add .
git commit -m "feat: add new feature"

# 3. Push to GitHub
git push -u origin feature/new-feature

# 4. Create PR
gh pr create \
  --title "feat: Add new feature" \
  --body "Description of changes"

# 5. Monitor checks
gh pr checks

# 6. If checks fail, fix and push
git add .
git commit -m "fix: address CI failures"
git push

# 7. Request review
gh pr edit --add-reviewer username

# 8. After approval, merge
gh pr merge --squash --delete-branch
```

### Bug Fix Workflow

```bash
# 1. Create fix branch
git checkout -b fix/broken-imports

# 2. Fix bug, add test
# ... edit code ...
git add .
git commit -m "fix: resolve import path bug

**Problem**: Absolute paths in generated imports
**Solution**: Use relative path calculation
**Result**: Correct relative imports"

# 3. Push and create PR
git push -u origin fix/broken-imports

gh pr create \
  --title "fix: Resolve import path bug" \
  --body "Fixes #123" \
  --label bug

# 4. Self-review (if allowed)
gh pr review --approve

# 5. Merge
gh pr merge --squash --delete-branch
```

### Emergency Hotfix Workflow

```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b fix/critical-security-patch

# 2. Make minimal fix
# ... edit code ...
git commit -m "fix: patch critical security vulnerability

🔒 SECURITY PATCH
Fixes path traversal vulnerability in file validation"

# 3. Push and create URGENT PR
git push -u origin fix/critical-security-patch

gh pr create \
  --title "🔒 URGENT: Security patch" \
  --body "Critical security fix - immediate merge required" \
  --label security,urgent \
  --reviewer @maintainer

# 4. Request immediate review
# (Wait for approval)

# 5. Merge immediately after approval
gh pr merge --squash --delete-branch
```

---

## Advanced Features

### PR Comments

```bash
# Add comment to PR
gh pr comment 123 --body "Please update the tests"

# Add comment with file
gh pr comment 123 --body-file comments.md

# View PR comments
gh pr view 123
```

### PR Status Checks

```bash
# View all checks
gh pr checks 123

# Wait for checks to complete
gh pr checks 123 --watch

# Example output:
# ✓ Build (Node 18)     3m 42s
# ✓ Build (Node 20)     3m 38s
# ✓ Lint               1m 15s
# ✓ Type Check         0m 52s
```

### Checkout PR Locally

```bash
# Checkout PR by number
gh pr checkout 123

# Checkout PR by URL
gh pr checkout https://github.com/j0kz/mcp-agents/pull/123

# View changes
git log main..HEAD
git diff main
```

### CI/CD Integration

```bash
# View workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch

# Re-run failed jobs
gh run rerun <run-id>

# Cancel run
gh run cancel <run-id>
```

---

## Issues Management

### Creating Issues

```bash
# Interactive
gh issue create

# With parameters
gh issue create \
  --title "Bug: Import paths broken" \
  --body "Description of bug" \
  --label bug,high-priority \
  --assignee @me
```

### Listing Issues

```bash
# All open issues
gh issue list

# With filters
gh issue list --label bug
gh issue list --assignee @me
gh issue list --state all
```

### Viewing Issues

```bash
# View issue
gh issue view 123

# View in browser
gh issue view 123 --web
```

### Closing Issues

```bash
# Close issue
gh issue close 123

# Close with comment
gh issue close 123 --comment "Fixed in PR #456"
```

---

## Repository Information

### Viewing Repo

```bash
# View repo info
gh repo view

# View in browser
gh repo view --web

# Clone repo
gh repo clone j0kz/mcp-agents
```

### Repository Settings

```bash
# View topics
gh repo view j0kz/mcp-agents --json topics

# View default branch
gh repo view j0kz/mcp-agents --json defaultBranchRef

# View languages
gh repo view j0kz/mcp-agents --json languages
```

---

## Aliases and Shortcuts

### Create Aliases

```bash
# Create shortcut for common commands
gh alias set prc 'pr create --title "$1" --body "$2"'
gh alias set prv 'pr view --web'
gh alias set prm 'pr merge --squash --delete-branch'

# Use alias
gh prc "feat: New feature" "Description"
gh prv
gh prm
```

### Useful Aliases

```bash
# View my PRs
gh alias set my-prs 'pr list --author @me'

# View my issues
gh alias set my-issues 'issue list --assignee @me'

# Quick review
gh alias set approve 'pr review --approve'

# View checks
gh alias set ci 'pr checks'
```

---

## Troubleshooting

### gh not found

```bash
# Verify installation
which gh  # Mac/Linux
where gh  # Windows

# If not found, reinstall (see Installation section)
```

### Authentication failed

```bash
# Re-authenticate
gh auth logout
gh auth login

# Verify
gh auth status
```

### Permission denied

```bash
# Check token scopes
gh auth status

# Token needs:
# - repo (full control)
# - workflow
# - read:org

# Re-login with correct scopes
gh auth login --scopes repo,workflow,read:org
```

### PR creation failed

```bash
# Verify you're on correct branch
git branch --show-current

# Verify commits pushed
git status

# Verify not already exists
gh pr list --head $(git branch --show-current)
```

---

## Quick Reference

### Essential Commands

```bash
# PRs
gh pr create                    # Create PR
gh pr list                      # List PRs
gh pr view 123                  # View PR
gh pr checks                    # Check status
gh pr merge --squash            # Merge PR

# Issues
gh issue create                 # Create issue
gh issue list                   # List issues
gh issue close 123              # Close issue

# Workflows
gh run list                     # List runs
gh run view <id>                # View run
gh run watch                    # Watch run

# Repo
gh repo view                    # View repo
gh repo clone owner/repo        # Clone repo
```

### Flags Reference

```bash
# Common flags
--title "..."           # Set title
--body "..."            # Set body
--body-file FILE        # Body from file
--assignee USER         # Assign user
--reviewer USER         # Request review
--label LABEL           # Add label
--milestone NAME        # Set milestone
--draft                 # Create as draft
--web                   # Open in browser
```

---

## Related

- See `pr-review-checklist.md` for PR quality checklist
- See `conventional-commits-guide.md` for commit message format
- See `conflict-resolution-guide.md` for merge conflicts

---

**Reference:** GitHub CLI documentation
**Version:** gh v2.40+
**Project:** @j0kz/mcp-agents
