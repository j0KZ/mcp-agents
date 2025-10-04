# 🚀 CI/CD Templates Released! Integrate MCP Tools in < 1 Minute

We're excited to announce **CI/CD templates** for the MCP Agents Toolkit! 🎉

## What's New

Add automated code quality checks to your pipeline with **zero configuration**:

### ✅ GitHub Actions (3 Workflows)
- **mcp-basic.yml** - Quick PR checks (code review + security)
- **mcp-quality-gate.yml** - Comprehensive 5-job pipeline
- **mcp-pre-merge.yml** - Strict enforcement before merge to main

### ✅ Pre-commit Hooks
- **Interactive generator** with 4 modes (basic, strict, minimal, custom)
- **Auto-installs Husky** if needed
- **Blocks commits** on critical issues (strict mode)

### ✅ GitLab CI
- **Complete pipeline** with quality, security, and reporting stages
- **Artifact support** for reports and graphs
- **Optimized** to skip test files in refactoring analysis

## Quick Start

### GitHub Actions
```bash
# Copy the basic template
curl -o .github/workflows/mcp-basic.yml \
  https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/github-actions/mcp-basic.yml

# Commit and push
git add .github/workflows/mcp-basic.yml
git commit -m "ci: add MCP quality checks"
git push
```

**That's it!** Open a PR and see MCP tools in action.

### Pre-commit Hooks
```bash
# Generate hooks (interactive)
npx @j0kz/mcp-hooks-generator

# Or specify mode directly
npx @j0kz/mcp-hooks-generator strict
```

Hooks will run automatically on every `git commit`.

### GitLab CI
```yaml
# Add to .gitlab-ci.yml
include:
  - remote: 'https://raw.githubusercontent.com/j0KZ/mcp-agents/main/templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml'
```

## Key Features

✅ **Zero config** - Copy/paste and go
✅ **Version pinned** - Reproducible builds with `@^1.0.0`
✅ **Customizable** - Adjust severity, exclude files, add/remove checks
✅ **Multi-platform** - GitHub, GitLab, and local hooks
✅ **Production-ready** - Battle-tested on this repo

## Example Output

**GitHub Actions:**
```
✅ MCP Quality Gate Summary

## Checks Completed
- ✅ Smart Reviewer: Code quality analysis
- ✅ Test Generator: Coverage check
- ✅ Security Scanner: Vulnerability scan
- ✅ Architecture Analyzer: Dependency analysis
- ✅ Refactor Assistant: Improvement suggestions

📁 Detailed reports available in workflow artifacts
```

**Pre-commit Hooks:**
```
🔍 Running MCP code quality checks...
📝 Reviewing changed files...
  ✅ src/auth.ts - No issues found
  ⚠️ src/api.ts - 2 warnings
🔒 Scanning for security issues...
  ✅ No secrets detected
✅ Pre-commit checks complete!
```

## Templates Included

### GitHub Actions
1. **[mcp-basic.yml](templates/github-actions/mcp-basic.yml)** - Minimal setup for quick adoption
2. **[mcp-quality-gate.yml](templates/github-actions/mcp-quality-gate.yml)** - Comprehensive quality checks
3. **[mcp-pre-merge.yml](templates/github-actions/mcp-pre-merge.yml)** - Strict pre-merge enforcement

### Pre-commit Hooks
- **[hooks-generator.js](templates/pre-commit/hooks-generator.js)** - Interactive CLI generator

### GitLab CI
- **[mcp-quality-gate.gitlab-ci.yml](templates/gitlab-ci/mcp-quality-gate.gitlab-ci.yml)** - Full pipeline

## Documentation

📚 **[Full CI/CD Integration Guide](docs/CI_CD_TEMPLATES.md)**
📁 **[Browse All Templates](templates/)**
📋 **[Development Roadmap](docs/TODO.md)**

## Customization Examples

**Adjust severity levels:**
```yaml
npx @j0kz/smart-reviewer-mcp@^1.0.0 batch_review . \
  --severity strict  # Options: lenient, moderate, strict
```

**Exclude files:**
```yaml
npx @j0kz/security-scanner-mcp@^1.0.0 scan_project . \
  --exclude-patterns "node_modules,dist,*.test.ts"
```

**Run specific checks only:**
```yaml
# Comment out unwanted jobs in workflow file
# architecture-analyzer:  # Disabled
#   steps: ...
```

## Why This Matters

**Before:** Setting up quality checks required complex configuration, custom scripts, and integration expertise.

**Now:** Copy one file, commit, and you're done. Full MCP integration in under 1 minute.

## What's Next

According to our [roadmap](docs/TODO.md), we're working on:

1. **Configuration Wizard** (1 week) - Interactive setup for all editors
2. **Smart Reviewer AI Fixes** (2 weeks) - Auto-fix generation
3. **Performance Profiler MCP** (3 weeks) - Bundle analysis, Lighthouse integration

## Feedback Welcome

Try the templates and let us know:
- What worked well?
- What could be improved?
- What templates are missing?

Comment below or [open an issue](https://github.com/j0KZ/mcp-agents/issues)!

## Contributors

Special thanks to CodeRabbit AI for the excellent review feedback that helped refine these templates!

---

**Install MCP Agents:** `npx @j0kz/mcp-agents@latest`
**GitHub:** https://github.com/j0KZ/mcp-agents
**npm:** https://www.npmjs.com/~j0kz

Happy coding! 🚀
