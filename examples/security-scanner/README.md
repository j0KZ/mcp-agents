# Security Scanner Examples

This example demonstrates how to detect security vulnerabilities in code.

## Example 1: Scan for All Vulnerabilities

**Source**: `vulnerable-app.js`

### Using with Claude Code

```
Scan examples/security-scanner/vulnerable-app.js for security vulnerabilities
```

### Expected Output

```
🔒 Security Scan Results

File: vulnerable-app.js
Found 10 vulnerabilities:

┌──────────────────────────────────────────────────────────────────┐
│ CRITICAL - SQL Injection (Line 4)                                │
├──────────────────────────────────────────────────────────────────┤
│ Type: A03:2021 - Injection                                       │
│ CWE: CWE-89                                                       │
│ CVSS Score: 9.8                                                   │
│                                                                   │
│ Code:                                                             │
│   const query = "SELECT * FROM users WHERE email = '" +          │
│                 email + "'";                                      │
│                                                                   │
│ Issue: User input concatenated directly into SQL query           │
│                                                                   │
│ Recommendation:                                                   │
│   Use parameterized queries or prepared statements:              │
│   const query = "SELECT * FROM users WHERE email = ?";           │
│   db.execute(query, [email]);                                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ HIGH - Cross-Site Scripting (XSS) (Line 9)                       │
├──────────────────────────────────────────────────────────────────┤
│ Type: A03:2021 - Injection                                       │
│ CWE: CWE-79                                                       │
│ CVSS Score: 7.5                                                   │
│                                                                   │
│ Code:                                                             │
│   document.getElementById('comments').innerHTML = comment;        │
│                                                                   │
│ Issue: Untrusted data inserted into DOM using innerHTML          │
│                                                                   │
│ Recommendation:                                                   │
│   Use textContent or sanitize HTML:                              │
│   document.getElementById('comments').textContent = comment;      │
│   // OR                                                           │
│   element.innerHTML = DOMPurify.sanitize(comment);                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ CRITICAL - Hardcoded Secrets (Lines 13-15)                       │
├──────────────────────────────────────────────────────────────────┤
│ Type: A02:2021 - Cryptographic Failures                          │
│ CWE: CWE-798                                                      │
│ CVSS Score: 9.1                                                   │
│                                                                   │
│ Code:                                                             │
│   const API_KEY = "sk_live_1234567890abcdef";                    │
│   const DB_PASSWORD = "MySecretPassword123!";                    │
│                                                                   │
│ Issue: Sensitive credentials hardcoded in source code            │
│                                                                   │
│ Recommendation:                                                   │
│   Use environment variables:                                     │
│   const API_KEY = process.env.API_KEY;                           │
│   Store secrets in .env file (add to .gitignore)                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ HIGH - Command Injection (Line 20)                               │
├──────────────────────────────────────────────────────────────────┤
│ Type: A03:2021 - Injection                                       │
│ CWE: CWE-78                                                       │
│ CVSS Score: 8.6                                                   │
│                                                                   │
│ Code:                                                             │
│   exec('cp ' + filename + ' /backup/', ...);                     │
│                                                                   │
│ Issue: User input concatenated into shell command                │
│                                                                   │
│ Recommendation:                                                   │
│   Use execFile with array arguments:                             │
│   execFile('cp', [filename, '/backup/'], ...);                   │
│   Or validate/sanitize filename input                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ HIGH - Path Traversal (Line 32)                                  │
├──────────────────────────────────────────────────────────────────┤
│ Type: A01:2021 - Broken Access Control                           │
│ CWE: CWE-22                                                       │
│ CVSS Score: 7.5                                                   │
│                                                                   │
│ Code:                                                             │
│   const path = '/uploads/' + filename;                           │
│   return fs.readFileSync(path, 'utf8');                          │
│                                                                   │
│ Issue: Attacker can access files outside intended directory      │
│         (e.g., filename = '../../../etc/passwd')                 │
│                                                                   │
│ Recommendation:                                                   │
│   Validate and sanitize file paths:                              │
│   const safePath = path.join('/uploads',                         │
│                    path.basename(filename));                      │
│   Verify resolved path stays within allowed directory            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ MEDIUM - Weak Cryptography (Line 38)                             │
├──────────────────────────────────────────────────────────────────┤
│ Type: A02:2021 - Cryptographic Failures                          │
│ CWE: CWE-327                                                      │
│ CVSS Score: 5.9                                                   │
│                                                                   │
│ Code:                                                             │
│   return crypto.createHash('md5').update(password)               │
│                  .digest('hex');                                  │
│                                                                   │
│ Issue: MD5 is cryptographically broken, unsuitable for passwords │
│                                                                   │
│ Recommendation:                                                   │
│   Use bcrypt, scrypt, or argon2:                                 │
│   const bcrypt = require('bcrypt');                              │
│   const hash = await bcrypt.hash(password, 10);                  │
└──────────────────────────────────────────────────────────────────┘

Summary:
- Critical: 2
- High: 3
- Medium: 3
- Low: 2

OWASP Top 10 Coverage:
✓ A01:2021 - Broken Access Control (1 issue)
✓ A02:2021 - Cryptographic Failures (2 issues)
✓ A03:2021 - Injection (3 issues)
```

## Example 2: Scan for Specific Vulnerability Type

### SQL Injection Only

```
Scan examples/security-scanner/vulnerable-app.js for SQL injection vulnerabilities only
```

### Hardcoded Secrets Only

```
Find all hardcoded secrets in examples/security-scanner/
```

## Example 3: Generate Security Report

```
Generate a comprehensive security report for examples/security-scanner/vulnerable-app.js in markdown format
```

### Expected Output: `security-report.md`

```markdown
# Security Scan Report

**File**: vulnerable-app.js
**Date**: 2025-10-03
**Scanner**: Security Scanner MCP v1.0.11

## Executive Summary

- **Total Issues**: 10
- **Critical**: 2
- **High**: 3
- **Medium**: 3
- **Low**: 2

## Critical Issues

### 1. SQL Injection (CWE-89)

- **Line**: 4
- **Severity**: Critical
- **CVSS**: 9.8
- **Category**: OWASP A03:2021

User input directly concatenated into SQL query without sanitization...

[Full details]

## Remediation Plan

1. **Immediate** (Critical/High):
   - Fix SQL injection in getUserByEmail()
   - Remove hardcoded secrets, use env vars
   - Fix command injection in backupFile()

2. **Short-term** (Medium):
   - Replace MD5 with bcrypt for passwords
   - Add input validation to createUser()

3. **Long-term** (Low):
   - Implement security testing in CI/CD
   - Add dependency vulnerability scanning
```

## Example 4: Fix Vulnerabilities

### Before Scan Results:

```javascript
// VULNERABLE
function getUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.execute(query);
}
```

### After Applying Fixes:

```javascript
// SECURE
function getUserByEmail(email) {
  // Input validation
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email');
  }

  // Parameterized query prevents SQL injection
  const query = 'SELECT * FROM users WHERE email = ?';
  return db.execute(query, [email]);
}
```

## MCP Tool Reference

### Scan File

```json
{
  "tool": "scan_file",
  "arguments": {
    "filePath": "examples/security-scanner/vulnerable-app.js",
    "options": {
      "includeOWASP": true,
      "severity": "all"
    }
  }
}
```

### Scan for Secrets

```json
{
  "tool": "scan_secrets",
  "arguments": {
    "path": "examples/security-scanner/",
    "options": {
      "recursive": true
    }
  }
}
```

### Generate Report

```json
{
  "tool": "generate_report",
  "arguments": {
    "scanResults": {
      /* scan output */
    },
    "format": "markdown",
    "includeRemediation": true
  }
}
```

## Common Vulnerabilities Detected

1. **SQL Injection** (A03:2021)
   - String concatenation in queries
   - Missing input validation

2. **XSS** (A03:2021)
   - innerHTML with untrusted data
   - Unescaped user input in templates

3. **Hardcoded Secrets** (A02:2021)
   - API keys in source code
   - Passwords in config files
   - Private keys committed to git

4. **Command Injection** (A03:2021)
   - exec() with user input
   - Unsanitized shell commands

5. **Path Traversal** (A01:2021)
   - File operations with user paths
   - Missing path validation

6. **Weak Crypto** (A02:2021)
   - MD5/SHA1 for passwords
   - Weak random number generation

7. **Insecure Deserialization** (A08:2021)
   - Parsing untrusted JSON
   - Loading serialized objects

## Tips

- **CI/CD Integration**: Run security scans in your pipeline
- **Regular Scans**: Scan on every commit or PR
- **Fix Priority**: Critical > High > Medium > Low
- **False Positives**: Review flagged code - not all are exploitable
- **Defense in Depth**: Use multiple security layers (validation, WAF, etc.)
