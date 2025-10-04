# MCP CI/CD Templates

Ready-to-use CI/CD templates for integrating @j0kz MCP tools into your development workflow.

## 🚀 Quick Start

### GitHub Actions

**Option 1: Basic Quality Check (Recommended for most projects)**
```bash
curl -o .github/workflows/mcp-basic.yml https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-basic.yml
```

**Option 2: Comprehensive Quality Gate (For production apps)**
```bash
curl -o .github/workflows/mcp-quality-gate.yml https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-quality-gate.yml
```

**Option 3: Pre-Merge Enforcement (Strict quality standards)**
```bash
curl -o .github/workflows/mcp-pre-merge.yml https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-pre-merge.yml
```

### Pre-commit Hooks

**Install the hooks generator:**
```bash
npx @j0kz/mcp-hooks-generator
```

**Or download the script:**
```bash
curl -o hooks-generator.js https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/pre-commit/hooks-generator.js
chmod +x hooks-generator.js
node hooks-generator.js basic
```

### GitLab CI/CD

**Add to your `.gitlab-ci.yml`:**
```bash
curl -o .gitlab-ci.yml https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml
```

Or include as a template:
```yaml
include:
  - remote: 'https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml'
```

---

## 📁 Template Overview

### GitHub Actions Templates

#### 1. `mcp-basic.yml` - Basic Quality Check
**Best for:** Small to medium projects, open source, getting started

**What it does:**
- ✅ Code review on PRs
- ✅ Security scanning
- ✅ PR comments with results

**When it runs:**
- Pull requests (opened, updated)

**Configuration:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

---

#### 2. `mcp-quality-gate.yml` - Comprehensive Check
**Best for:** Production applications, enterprise projects

**What it does:**
- ✅ Smart code review with metrics
- ✅ Test coverage analysis
- ✅ Security vulnerability scan (fails on CRITICAL)
- ✅ Architecture analysis (circular dependencies)
- ✅ Refactoring suggestions
- ✅ Comprehensive quality report

**When it runs:**
- Pull requests and pushes to main/develop

**Jobs:**
1. `smart-reviewer` - Code quality analysis
2. `test-generator` - Coverage checks
3. `security-scanner` - Vulnerability scanning
4. `architecture-analyzer` - Dependency analysis
5. `refactor-suggestions` - Improvement recommendations
6. `quality-summary` - Aggregate report

---

#### 3. `mcp-pre-merge.yml` - Strict Enforcement
**Best for:** Teams with strict quality standards

**What it does:**
- ✅ Build + tests must pass
- ❌ Fails on critical security issues
- ❌ Fails on circular dependencies
- ✅ Quality warnings on high-severity issues
- ✅ PR status comments

**When it runs:**
- Pull requests to `main` (when ready for review, not drafts)

**Failure conditions:**
- Critical security vulnerabilities
- Circular dependencies
- Build or test failures

---

### Pre-commit Hooks

#### Hook Types

**1. Basic** (Default)
```bash
node hooks-generator.js basic
```
- Code review of staged files
- Secret scanning

**2. Strict**
```bash
node hooks-generator.js strict
```
- Code review (strict mode, blocks commit on issues)
- Security scan (all checks)
- Test coverage validation
- Architecture validation
- Refactor suggestions

**3. Minimal**
```bash
node hooks-generator.js minimal
```
- Only scans for secrets (fastest)

**4. Custom**
```bash
node hooks-generator.js custom
```
- Template with all checks commented out
- Customize to your needs

#### How It Works

1. **Installs Husky** (if not already installed)
2. **Generates `.husky/pre-commit`** with selected checks
3. **Runs automatically** on `git commit`
4. **Blocks commit** if critical issues found (strict mode)

---

### GitLab CI Template

#### `mcp-quality-gate.gitlab-ci.yml`

**Stages:**
1. **Quality** - Code review, test coverage, architecture
2. **Security** - Vulnerability scanning
3. **Report** - Summary generation

**Jobs:**
- `code-review` - Smart Reviewer analysis
- `test-coverage` - Coverage reporting
- `security-scan` - Security vulnerabilities (fails pipeline on issues)
- `architecture-check` - Dependency analysis
- `refactor-suggestions` - Improvement recommendations (MRs only)
- `quality-report` - Aggregate summary

**Artifacts:**
- Code review reports (1 week retention)
- Security reports (1 week retention)
- Architecture graphs (1 week retention)
- Quality summary (1 month retention)

---

## 🎯 Usage Examples

### Example 1: Add Basic Check to Existing Repo

```bash
# 1. Download template
curl -o .github/workflows/mcp-basic.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-basic.yml

# 2. Commit and push
git add .github/workflows/mcp-basic.yml
git commit -m "ci: add MCP quality checks"
git push

# 3. Create a PR to see it in action!
```

### Example 2: Add Pre-commit Hooks

```bash
# 1. Generate hooks
npx @j0kz/mcp-hooks-generator strict

# 2. Test it
git add .
git commit -m "test: pre-commit hooks"
# Hooks will run automatically!

# 3. Customize if needed
nano .husky/pre-commit
```

### Example 3: Combine Workflows

Use **pre-commit hooks** for fast feedback + **GitHub Actions** for comprehensive checks:

```bash
# Local: Fast checks before commit
node hooks-generator.js basic

# CI: Comprehensive checks on PR
curl -o .github/workflows/mcp-quality-gate.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-quality-gate.yml
```

---

## ⚙️ Customization

### Adjust Severity Levels

**In GitHub Actions:**
```yaml
- name: Run Security Scanner
  run: |
    npx @j0kz/security-scanner-mcp@latest scan_project . \
      --min-severity high  # Change to: low, medium, high, critical
```

**In Pre-commit Hooks:**
```bash
# Edit .husky/pre-commit
npx @j0kz/smart-reviewer-mcp@latest batch_review . \
  --severity lenient  # Change to: lenient, moderate, strict
```

### Add/Remove Checks

**GitHub Actions:**
Comment out unwanted jobs in the workflow file:

```yaml
# architecture-analyzer:  # Disabled
#   name: Architecture Quality Check
#   steps: ...
```

**Pre-commit Hooks:**
Edit `.husky/pre-commit` and comment out checks:

```bash
# echo "🏗️ Validating architecture..."
# npx @j0kz/architecture-analyzer-mcp@latest find_circular_deps .
```

### Exclude Files/Directories

**Security Scanner:**
```yaml
npx @j0kz/security-scanner-mcp@latest scan_project . \
  --exclude-patterns "node_modules,dist,build,*.test.ts"
```

**Smart Reviewer:**
```yaml
# Only review specific directories
npx @j0kz/smart-reviewer-mcp@latest batch_review src/ lib/
```

---

## 🔧 Troubleshooting

### "Command not found: npx"
**Solution:** Install Node.js 18+ ([nodejs.org](https://nodejs.org))

### Hooks not running
**Solution:**
```bash
# Ensure hooks are executable
chmod +x .husky/pre-commit

# Reinstall Husky
npm install husky --save-dev
npx husky init
```

### Workflows not triggering
**Solution:**
- Ensure workflow file is in `.github/workflows/`
- Check GitHub Actions is enabled in repo settings
- Verify `on:` triggers match your events (PR, push, etc.)

### "Permission denied" errors
**Solution:**
```bash
# Make scripts executable
chmod +x .github/workflows/*.yml
chmod +x .husky/*
```

---

## 📊 Expected Results

### Pre-commit Hooks Output
```
🔍 Running MCP code quality checks...
📝 Reviewing changed files...
  ✅ src/auth.ts - No issues found
  ⚠️ src/api.ts - 2 warnings
🔒 Scanning for security issues...
  ✅ No secrets detected
✅ Pre-commit checks complete!
```

### GitHub Actions Summary
```
📊 MCP Quality Gate Summary

## Checks Completed
- ✅ Smart Reviewer: Code quality analysis
- ✅ Test Generator: Coverage check
- ✅ Security Scanner: Vulnerability scan
- ✅ Architecture Analyzer: Dependency analysis
- ✅ Refactor Assistant: Improvement suggestions

📁 Detailed reports available in workflow artifacts
```

---

## 🎯 Best Practices

### For Small Teams/Personal Projects
- Use **mcp-basic.yml** for CI
- Use **basic** pre-commit hooks
- Focus on security and critical issues

### For Production Applications
- Use **mcp-quality-gate.yml** for comprehensive checks
- Use **strict** pre-commit hooks
- Enable **mcp-pre-merge.yml** for main branch protection

### For Enterprise/Large Teams
- Use **all three** GitHub Actions workflows
- Use **strict** pre-commit hooks
- Customize severity levels per project
- Generate quality reports for stakeholders

---

## 📚 Learn More

- [MCP Tools Documentation](https://github.com/j0KZ/mcp-agents)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)

---

## 🤝 Contributing

Have improvements or new templates? PRs welcome!

1. Fork the repository
2. Add your template to `templates/`
3. Update this README
4. Submit a pull request

---

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)

---

**Made with ❤️ for better code quality**
