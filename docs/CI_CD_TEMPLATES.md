# CI/CD Integration Guide

This guide shows how to integrate @j0kz MCP tools into your CI/CD pipelines for automated code quality checks.

## 🎯 Why Use MCP in CI/CD?

**Benefits:**
- ✅ **Automated Quality Gates** - Catch issues before merge
- ✅ **Consistent Standards** - Same checks for everyone
- ✅ **Early Detection** - Find bugs, security issues, and code smells early
- ✅ **Developer Productivity** - Reduce manual review time
- ✅ **Documentation** - Automatic reports and metrics

---

## 📦 Available Templates

| Template | Platform | Use Case | Strictness |
|----------|----------|----------|------------|
| **mcp-basic.yml** | GitHub Actions | Getting started, small projects | Lenient |
| **mcp-quality-gate.yml** | GitHub Actions | Production apps, comprehensive checks | Moderate |
| **mcp-pre-merge.yml** | GitHub Actions | Enforce quality before merge | Strict |
| **hooks-generator.js** | Pre-commit (Husky) | Local checks before commit | Configurable |
| **mcp-quality-gate.gitlab-ci.yml** | GitLab CI | GitLab projects | Moderate |

---

## 🚀 Quick Start

### 1. GitHub Actions - Basic Setup

**Step 1:** Add the workflow
```bash
mkdir -p .github/workflows
curl -o .github/workflows/mcp-basic.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-basic.yml
```

**Step 2:** Commit and push
```bash
git add .github/workflows/mcp-basic.yml
git commit -m "ci: add MCP quality checks"
git push
```

**Step 3:** Create a PR and see it work!

---

### 2. Pre-commit Hooks

**Step 1:** Generate hooks
```bash
npx @j0kz/mcp-hooks-generator basic
```

**Step 2:** Commit changes
```bash
git add .husky/
git commit -m "chore: add pre-commit hooks"
```

**Step 3:** Test it
```bash
# Make a change
echo "console.log('test')" >> test.js
git add test.js
git commit -m "test"
# Hooks will run automatically!
```

---

## 📋 Template Details

### GitHub Actions: Basic (`mcp-basic.yml`)

**What it checks:**
- Code quality with Smart Reviewer
- Security vulnerabilities

**When it runs:**
- On pull requests

**How to use:**
```yaml
# Automatically downloaded from template
# Customizable in .github/workflows/mcp-basic.yml
```

**Example output:**
```
✅ Code review completed
✅ Security scan completed
💬 Comment posted on PR
```

---

### GitHub Actions: Quality Gate (`mcp-quality-gate.yml`)

**What it checks:**
- Code review with metrics
- Test coverage
- Security scan (fails on CRITICAL)
- Architecture analysis
- Refactoring suggestions

**When it runs:**
- Pull requests and pushes to main/develop

**Jobs:**
1. `smart-reviewer` - Reviews changed files
2. `test-generator` - Checks test coverage
3. `security-scanner` - Scans for vulnerabilities
4. `architecture-analyzer` - Detects circular dependencies
5. `refactor-suggestions` - Suggests improvements
6. `quality-summary` - Generates report

**How to use:**
```bash
curl -o .github/workflows/mcp-quality-gate.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-quality-gate.yml
```

---

### GitHub Actions: Pre-Merge (`mcp-pre-merge.yml`)

**What it checks:**
- Build must pass
- Tests must pass
- No critical security issues
- No circular dependencies

**When it runs:**
- Pull requests to `main` branch (non-drafts only)

**Failure conditions:**
- ❌ Critical security vulnerabilities
- ❌ Circular dependencies
- ❌ Build failures
- ❌ Test failures

**How to use:**
```bash
curl -o .github/workflows/mcp-pre-merge.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-pre-merge.yml
```

---

### Pre-commit Hooks (Husky)

**Hook types:**

#### Basic (Default)
```bash
npx @j0kz/mcp-hooks-generator basic
```
- Quick code review
- Secret scanning
- **Does not block commits**

#### Strict
```bash
npx @j0kz/mcp-hooks-generator strict
```
- Comprehensive checks
- **Blocks commits** on critical issues
- Test coverage validation
- Architecture checks

#### Minimal
```bash
npx @j0kz/mcp-hooks-generator minimal
```
- Only scans for secrets
- Fastest option

#### Custom
```bash
npx @j0kz/mcp-hooks-generator custom
```
- Template with all checks commented
- Customize to your needs

---

### GitLab CI/CD

**How to use:**

**Option 1: Direct include**
```yaml
# .gitlab-ci.yml
include:
  - remote: 'https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml'
```

**Option 2: Download and customize**
```bash
curl -o .gitlab-ci.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml
```

**Jobs included:**
- `code-review` - Smart Reviewer
- `test-coverage` - Coverage reports
- `security-scan` - Vulnerability scanning
- `architecture-check` - Dependency analysis
- `refactor-suggestions` - Improvements (MRs only)
- `quality-report` - Summary

---

## 🔧 Customization

### Change Severity Levels

**GitHub Actions:**
```yaml
# In workflow file
- name: Security Scan
  run: |
    npx @j0kz/security-scanner-mcp@latest scan_project . \
      --min-severity high  # Options: low, medium, high, critical
```

**Pre-commit Hooks:**
```bash
# Edit .husky/pre-commit
npx @j0kz/smart-reviewer-mcp@latest batch_review . \
  --severity strict  # Options: lenient, moderate, strict
```

### Exclude Files

```yaml
npx @j0kz/security-scanner-mcp@latest scan_project . \
  --exclude-patterns "node_modules,dist,*.test.ts"
```

### Run Only Specific Tools

**Comment out unwanted jobs:**
```yaml
# architecture-analyzer:  # Disabled
#   name: Architecture Check
#   steps: ...
```

---

## 💡 Best Practices

### Recommended Setup by Project Type

#### Personal/Open Source Projects
```
✅ mcp-basic.yml (GitHub Actions)
✅ basic pre-commit hooks
✅ Security scan only
```

#### Small Teams
```
✅ mcp-quality-gate.yml (GitHub Actions)
✅ strict pre-commit hooks
✅ Security + code review
```

#### Production Applications
```
✅ mcp-quality-gate.yml (comprehensive)
✅ mcp-pre-merge.yml (strict enforcement)
✅ strict pre-commit hooks
✅ All checks enabled
```

#### Enterprise
```
✅ All three GitHub Actions workflows
✅ strict pre-commit hooks
✅ Custom quality reports
✅ Integration with existing tools
```

---

## 🎓 Advanced Usage

### Combine Local and CI Checks

**Strategy:** Fast feedback locally, comprehensive checks in CI

**Local (Pre-commit):**
```bash
npx @j0kz/mcp-hooks-generator basic
```
- Quick checks (< 10 seconds)
- Catch obvious issues
- Don't block commits

**CI (GitHub Actions):**
```bash
curl -o .github/workflows/mcp-quality-gate.yml ...
```
- Comprehensive analysis
- Run all tools
- Block merge on issues

### Progressive Enhancement

**Week 1:** Start with basic checks
```bash
curl -o .github/workflows/mcp-basic.yml ...
```

**Week 2:** Add pre-commit hooks
```bash
npx @j0kz/mcp-hooks-generator basic
```

**Week 3:** Upgrade to quality gate
```bash
curl -o .github/workflows/mcp-quality-gate.yml ...
```

**Week 4:** Add strict pre-merge enforcement
```bash
curl -o .github/workflows/mcp-pre-merge.yml ...
```

### Quality Metrics Dashboard

**Collect metrics over time:**
```yaml
- name: Upload metrics
  run: |
    npx @j0kz/smart-reviewer-mcp@latest batch_review . \
      --output metrics.json

- name: Store metrics
  uses: actions/upload-artifact@v3
  with:
    name: quality-metrics
    path: metrics.json
```

---

## 📊 Monitoring Results

### GitHub Actions

**View results:**
1. Go to PR → "Checks" tab
2. Click on workflow run
3. View job logs
4. Download artifacts (reports)

**PR Comments:**
Workflows automatically comment on PRs with results:
```
✅ MCP Quality Gate

All checks passed! Ready to merge.
- Code Review: 0 issues
- Security Scan: No vulnerabilities
- Architecture: No circular dependencies
```

### Pre-commit Hooks

**Output on commit:**
```bash
git commit -m "feat: new feature"

🔍 Running MCP code quality checks...
📝 Reviewing changed files...
  ✅ src/feature.ts - No issues
🔒 Scanning for security issues...
  ✅ No secrets detected
✅ Pre-commit checks complete!

[main abc1234] feat: new feature
```

---

## 🐛 Troubleshooting

### Workflow not triggering

**Check:**
- Workflow file is in `.github/workflows/`
- GitHub Actions is enabled in repo settings
- Branch name matches `on:` triggers

**Fix:**
```bash
# Verify file location
ls -la .github/workflows/

# Check syntax
cat .github/workflows/mcp-basic.yml
```

### Hooks not running

**Check:**
- Husky is installed
- Hooks are executable

**Fix:**
```bash
# Reinstall Husky
npm install husky --save-dev
npx husky init

# Make executable
chmod +x .husky/pre-commit
```

### "Command not found: npx"

**Fix:**
```bash
# Install Node.js 18+
# Download from https://nodejs.org

# Verify installation
node --version
npm --version
```

---

## 📚 Related Documentation

- [Templates README](../templates/README.md)
- [MCP Tools Overview](../README.md)
- [Security Scanner Docs](https://www.npmjs.com/package/@j0kz/security-scanner-mcp)
- [Smart Reviewer Docs](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)

---

## 🤝 Contributing

Have improvements? PRs welcome!

```bash
# Fork the repo
# Add your template
# Update documentation
# Submit PR
```

---

## 📄 License

MIT © [j0KZ](https://github.com/j0KZ)
