# Dependency Security Best Practices

## Overview

Security-focused practices for managing npm dependencies, preventing supply chain attacks, and maintaining secure codebases.

## Supply Chain Security

### Package Verification

```bash
# Verify package integrity
npm install --ignore-scripts  # Then review scripts
npm pack package-name --dry-run  # Preview contents

# Check package provenance
npm audit signatures
```

### Lock File Security

```bash
# Always use lock files
npm ci  # Install from lock file exactly

# Verify lock file integrity
npm install --package-lock-only
git diff package-lock.json
```

### Namespace Protection

```json
{
  "name": "@yourorg/package",
  "publishConfig": {
    "access": "restricted"
  }
}
```

## Vulnerability Management

### Severity Levels

| Level | CVSS Score | Response Time |
|-------|------------|---------------|
| Critical | 9.0-10.0 | Immediate (hours) |
| High | 7.0-8.9 | 24-48 hours |
| Medium | 4.0-6.9 | 1-2 weeks |
| Low | 0.1-3.9 | Next release |

### Remediation Workflow

```bash
# 1. Identify vulnerabilities
npm audit

# 2. Review details
npm audit --json | jq '.vulnerabilities'

# 3. Update if safe
npm audit fix

# 4. For breaking changes, evaluate
npm audit fix --dry-run --force

# 5. If no fix available, consider alternatives
npm ls vulnerable-package
# Find and evaluate alternatives
```

### Override Vulnerabilities

When update not possible:

```json
{
  "overrides": {
    "vulnerable-package": {
      ".": "safe-version"
    }
  }
}
```

## Secure Configuration

### .npmrc Security

```ini
# .npmrc
# Prevent arbitrary script execution
ignore-scripts=true

# Use exact versions
save-exact=true

# Audit on install
audit=true

# Strict SSL
strict-ssl=true

# Registry verification
registry=https://registry.npmjs.org/
```

### Package.json Security

```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "preinstall": "npm audit --audit-level=high",
    "prepare": "npm audit"
  }
}
```

## Dependency Policies

### Allowed Licenses

```javascript
// license-policy.js
const ALLOWED_LICENSES = [
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'CC0-1.0',
  'Unlicense'
];

const FORBIDDEN_LICENSES = [
  'GPL-2.0',
  'GPL-3.0',
  'AGPL-3.0',
  'LGPL-2.1',
  'LGPL-3.0'
];
```

### Package Allowlist

```json
{
  "allowedPackages": {
    "crypto": "@noble/hashes",
    "http": "undici",
    "validation": "zod"
  },
  "blockedPackages": [
    "event-stream",
    "flatmap-stream",
    "ua-parser-js@<1.0.0"
  ]
}
```

## CI/CD Security

### GitHub Actions

```yaml
name: Security Audit

on:
  push:
  schedule:
    - cron: '0 0 * * *'

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=high

      - name: License check
        run: npx license-checker --onlyAllow "MIT;ISC;Apache-2.0"
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "Security vulnerabilities found. Fix before committing."
  exit 1
fi
```

## Monitoring and Alerts

### Dependabot Alerts

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "daily"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "security"
      - "dependencies"
```

### Snyk Integration

```yaml
# .snyk
version: v1.0.0
ignore:
  'npm:package:vulnerability-id':
    - '*':
        reason: 'No fix available, mitigated by X'
        expires: '2024-12-31'
```

## Incident Response

### When Vulnerability Discovered

1. **Assess Impact**
   - Is vulnerable code path used?
   - Is it reachable from user input?
   - What data could be compromised?

2. **Immediate Actions**
   - Check if exploit exists in the wild
   - Determine if update available
   - Evaluate workarounds

3. **Remediation**
   ```bash
   # Update to fixed version
   npm install package@fixed-version

   # If no fix, consider alternatives
   npm uninstall vulnerable-package
   npm install alternative-package
   ```

4. **Documentation**
   - Record CVE and response
   - Update security procedures
   - Notify stakeholders if needed

## Checklist

### Setup
- [ ] Configure .npmrc with security settings
- [ ] Set up automated security scanning
- [ ] Define license policy
- [ ] Configure Dependabot/Renovate

### Ongoing
- [ ] Review npm audit weekly
- [ ] Update dependencies monthly
- [ ] Audit new dependencies before adding
- [ ] Monitor security advisories

### Per-dependency
- [ ] Check package popularity and maintenance
- [ ] Review package source code for simple deps
- [ ] Verify no unnecessary permissions
- [ ] Check for typosquatting
