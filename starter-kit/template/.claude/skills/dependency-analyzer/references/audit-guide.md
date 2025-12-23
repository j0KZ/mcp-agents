# Dependency Audit Guide

## Overview

Systematic approach to auditing project dependencies for security vulnerabilities, outdated packages, and optimization opportunities.

## Audit Process

### 1. Security Vulnerability Scan

```bash
# npm audit with detailed output
npm audit --json > audit-report.json

# Check for critical/high vulnerabilities
npm audit --audit-level=high

# Auto-fix where possible
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

### 2. Outdated Dependencies Check

```bash
# List all outdated packages
npm outdated

# Check specific package
npm outdated package-name

# Update to latest within semver
npm update

# Update to absolute latest
npm install package@latest
```

### 3. License Compliance

```bash
# Using license-checker
npx license-checker --summary
npx license-checker --onlyAllow "MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause"

# Export license report
npx license-checker --csv > licenses.csv
```

## Audit Checklist

### Critical Checks

- [ ] No known vulnerabilities (npm audit)
- [ ] No deprecated packages
- [ ] All licenses compatible with project
- [ ] No abandoned packages (check last update)
- [ ] No duplicate dependencies

### Performance Checks

- [ ] Bundle size within budget
- [ ] No unnecessary polyfills
- [ ] Tree-shaking enabled
- [ ] No heavy alternatives for simple tasks

### Maintenance Checks

- [ ] Direct dependencies up-to-date
- [ ] Lock file committed
- [ ] No floating versions in production
- [ ] Dependencies documented

## Risk Assessment Matrix

| Risk Level | Criteria | Action |
|------------|----------|--------|
| Critical | CVE with exploit, >10k downloads | Immediate update |
| High | CVE without exploit, deprecated | Update within 24h |
| Medium | Outdated >6 months, minor CVE | Plan update sprint |
| Low | Outdated <6 months, no CVE | Regular maintenance |

## Automated Audit Setup

### GitHub Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"
```

### Pre-commit Hook

```bash
# In package.json
{
  "scripts": {
    "preinstall": "npm audit --audit-level=high"
  }
}
```

## Common Issues and Solutions

### Nested Vulnerability

When vulnerability is in a transitive dependency:

```bash
# Find dependency path
npm ls vulnerable-package

# Override in package.json
{
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}
```

### Conflicting Versions

```bash
# Deduplicate dependencies
npm dedupe

# Check for duplicate packages
npx npm-check-duplicates
```

## Reporting Template

```markdown
# Dependency Audit Report - [Date]

## Summary
- Total dependencies: X
- Direct: Y
- Dev: Z

## Security
- Critical: 0
- High: 0
- Medium: X
- Low: Y

## Outdated
- Major updates available: X
- Minor updates available: Y
- Patch updates available: Z

## Actions Required
1. [Action item]
2. [Action item]

## Recommendations
- [Recommendation]
```
