---
name: security-scanner
description: "Comprehensive security vulnerability scanning. Use when checking for OWASP vulnerabilities, scanning for secrets/API keys, auditing dependencies for CVEs, or running pre-commit security checks."
---

# Security Scanner

> Advanced security vulnerability detection and remediation for codebases

## Quick Commands

```bash
# Quick security scan
npx @j0kz/security-scanner scan

# Check for secrets
npx secretlint "**/*"

# OWASP dependency check
npm audit fix

# Static analysis
npx eslint-plugin-security
```

## Core Functionality

### Key Features

1. **OWASP Top 10 Detection**: SQL injection, XSS, CSRF, etc.
2. **Secret Scanning**: API keys, passwords, tokens
3. **Dependency Vulnerabilities**: Known CVEs in dependencies
4. **Code Patterns**: Insecure coding practices
5. **Compliance Checking**: GDPR, PCI-DSS, HIPAA patterns

## Detailed Information

For comprehensive details, see:

```bash
cat .claude/skills/security-scanner/references/owasp-patterns.md
```

```bash
cat .claude/skills/security-scanner/references/secret-detection.md
```

```bash
cat .claude/skills/security-scanner/references/remediation-guide.md
```

## Usage Examples

### Example 1: Full Security Audit

```javascript
import { SecurityScanner } from '@j0kz/security-scanner';

const scanner = new SecurityScanner({
  severity: 'high',
  includeDevDependencies: false
});

const results = await scanner.scan('./src');
console.log(`Found ${results.vulnerabilities.length} vulnerabilities`);
```

### Example 2: Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

npx @j0kz/security-scanner scan --staged --fail-on-high
```

## Security Patterns Detected

- SQL Injection risks
- Cross-Site Scripting (XSS)
- Command Injection
- Path Traversal
- Sensitive Data Exposure
- XML External Entity (XXE)
- Broken Authentication
- Security Misconfiguration
- Using Components with Known Vulnerabilities
- Insufficient Logging

## Configuration

```json
{
  "security-scanner": {
    "rules": {
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-hardcoded-secrets": "error",
      "sql-injection": "error"
    },
    "exclude": ["test/**", "*.test.js"],
    "secretPatterns": [
      "api[_-]?key",
      "secret",
      "password",
      "token"
    ]
  }
}
```

## Notes

- Integrates with GitHub Security Advisories
- Supports custom rule definitions
- Can generate security reports in SARIF format
- Zero false positives mode available