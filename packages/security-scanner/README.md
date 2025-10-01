# Security Scanner MCP

Production-ready security vulnerability scanner with Model Context Protocol (MCP) server integration. Detect secrets, SQL injection, XSS, and OWASP Top 10 vulnerabilities in your codebase.

## Features

- **Secret Detection**: Find hardcoded API keys, passwords, tokens, and credentials
- **SQL Injection Scanning**: Detect SQL injection vulnerabilities in database queries
- **XSS Detection**: Identify Cross-Site Scripting (XSS) vulnerabilities
- **OWASP Top 10 Checks**: Comprehensive security checks based on OWASP guidelines
- **Dependency Scanning**: Check for vulnerable dependencies in package.json
- **MCP Integration**: Full Model Context Protocol server for AI assistant integration
- **Detailed Reports**: Generate comprehensive security reports in markdown format
- **TypeScript Support**: Full TypeScript type definitions included

## Installation

```bash
npm install @my-claude-agents/security-scanner
```

## Usage

### As a Library

```typescript
import { scanFile, scanProject, ScanConfig } from '@my-claude-agents/security-scanner';

// Scan a single file
const findings = await scanFile('/path/to/file.js');
console.log(`Found ${findings.length} vulnerabilities`);

// Scan entire project
const config: ScanConfig = {
  scanSecrets: true,
  scanSQLInjection: true,
  scanXSS: true,
  scanOWASP: true,
  scanDependencies: true,
  minSeverity: 'medium',
  excludePatterns: ['node_modules', '.git', 'dist']
};

const results = await scanProject('/path/to/project', config);
console.log(`Security Score: ${results.securityScore}/100`);
console.log(`Found ${results.totalFindings} issues`);
```

### As an MCP Server

Add to your Claude desktop configuration:

```json
{
  "mcpServers": {
    "security-scanner": {
      "command": "npx",
      "args": ["-y", "@my-claude-agents/security-scanner"]
    }
  }
}
```

Or run directly:

```bash
npx @my-claude-agents/security-scanner
```

## MCP Tools

### scan_file

Scan a single file for security vulnerabilities.

```typescript
{
  "filePath": "/absolute/path/to/file.js",
  "config": {
    "scanSecrets": true,
    "scanSQLInjection": true,
    "scanXSS": true,
    "minSeverity": "medium"
  }
}
```

### scan_project

Recursively scan an entire project directory.

```typescript
{
  "projectPath": "/absolute/path/to/project",
  "config": {
    "scanSecrets": true,
    "scanSQLInjection": true,
    "scanXSS": true,
    "scanOWASP": true,
    "scanDependencies": true,
    "excludePatterns": ["node_modules", ".git"],
    "maxFileSize": 1048576,
    "minSeverity": "low",
    "verbose": false
  }
}
```

### scan_secrets

Specifically scan for hardcoded secrets and credentials.

```typescript
{
  "targetPath": "/path/to/scan",
  "customPatterns": [
    {
      "name": "Custom API Key",
      "pattern": "CUSTOM_KEY_[A-Z0-9]{32}",
      "severity": "critical",
      "description": "Custom API key pattern"
    }
  ]
}
```

### scan_vulnerabilities

Scan for specific vulnerability types.

```typescript
{
  "targetPath": "/path/to/scan",
  "vulnerabilityTypes": ["sql_injection", "xss", "weak_crypto"]
}
```

### generate_security_report

Generate a comprehensive security report in markdown format.

```typescript
{
  "projectPath": "/path/to/project",
  "outputPath": "/path/to/security-report.md",
  "config": {
    "scanSecrets": true,
    "scanSQLInjection": true,
    "scanXSS": true,
    "scanOWASP": true,
    "scanDependencies": true
  }
}
```

## Detected Vulnerabilities

### Secrets & Credentials

- AWS Access Keys & Secret Keys
- GitHub Personal Access Tokens
- Generic API Keys
- Private Cryptographic Keys (RSA, DSA, EC, OpenSSH)
- Hardcoded Passwords
- JWT Tokens
- Slack Tokens
- Database Connection Strings
- Custom secret patterns via configuration

### Code Vulnerabilities

- **SQL Injection**: String interpolation/concatenation in SQL queries
- **XSS**: innerHTML assignments, document.write, eval(), dangerouslySetInnerHTML
- **Weak Cryptography**: MD5, SHA1, DES, RC4 usage
- **Insecure Deserialization**: pickle.loads, yaml.load, unserialize
- **Path Traversal**: Unsafe file path operations
- **Command Injection**: Unsafe command execution
- **CSRF**: Missing CSRF protection
- **SSRF**: Server-Side Request Forgery vulnerabilities

### Dependencies

- Vulnerable npm packages
- CVE-listed vulnerabilities
- Outdated dependencies with security patches

## Security Best Practices

### 1. Secret Management

**Never hardcode secrets in source code.**

```javascript
// const apiKey = "sk_live_abc123xyz789";
const dbPassword = "mypassword123";

// ✅ GOOD
const apiKey = process.env.API_KEY;
const dbPassword = process.env.DB_PASSWORD;
```

**Use secret management services:**
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

### 2. SQL Injection Prevention

**Always use parameterized queries.**

```javascript
// const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// ✅ GOOD
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// ✅ GOOD (with ORM)
await User.findByPk(userId);
```

### 3. XSS Prevention

**Sanitize user input and use safe DOM APIs.**

```javascript
// element.innerHTML = userInput;
document.write(userInput);

// ✅ GOOD
element.textContent = userInput;
element.innerText = userInput;

// ✅ GOOD (with sanitization)
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 4. Cryptography

**Use strong, modern cryptographic algorithms.**

```javascript
// const hash = crypto.createHash('md5').update(password).digest('hex');
const cipher = crypto.createCipher('des', key);

// ✅ GOOD
const hash = await bcrypt.hash(password, 10);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
```

### 5. Dependency Management

**Keep dependencies updated and scan regularly.**

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Use automated tools
npm install -g npm-check-updates
ncu -u
npm install
```

### 6. CI/CD Integration

**Automate security scanning in your pipeline.**

```yaml
# GitHub Actions example
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Scan
        run: npx @my-claude-agents/security-scanner scan-project .
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.md
```

## Configuration Options

```typescript
interface ScanConfig {
  // Enable/disable specific scans
  scanSecrets?: boolean;          // Default: true
  scanSQLInjection?: boolean;     // Default: true
  scanXSS?: boolean;              // Default: true
  scanOWASP?: boolean;            // Default: true
  scanDependencies?: boolean;     // Default: true

  // Custom secret patterns
  customPatterns?: SecretPattern[];

  // Exclusion patterns
  excludePatterns?: string[];     // Default: ['node_modules', '.git', ...]

  // File size limit
  maxFileSize?: number;           // In bytes

  // Minimum severity to report
  minSeverity?: 'critical' | 'high' | 'medium' | 'low' | 'info';

  // Enable verbose logging
  verbose?: boolean;              // Default: false
}
```

## Severity Levels

- **CRITICAL**: Immediate action required (e.g., exposed AWS keys)
- **HIGH**: Should be fixed in next sprint (e.g., SQL injection)
- **MEDIUM**: Should be addressed (e.g., weak crypto)
- **LOW**: Nice to fix (e.g., minor security improvements)
- **INFO**: Informational findings

## Security Score

The security score (0-100) is calculated based on findings:

- Critical findings: -10 points each
- High findings: -5 points each
- Medium findings: -2 points each
- Low findings: -1 point each

A score of 90+ is excellent, 70-89 is good, 50-69 needs improvement, below 50 requires immediate attention.

## OWASP Top 10 Coverage

This scanner covers the OWASP Top 10 2021:

1. **A01:2021 – Broken Access Control**: Path traversal detection
2. **A02:2021 – Cryptographic Failures**: Weak crypto, secret exposure
3. **A03:2021 – Injection**: SQL injection, XSS, command injection
4. **A04:2021 – Insecure Design**: Design pattern analysis
5. **A05:2021 – Security Misconfiguration**: Configuration checks
6. **A06:2021 – Vulnerable Components**: Dependency scanning
7. **A07:2021 – Authentication Failures**: Auth pattern analysis
8. **A08:2021 – Data Integrity Failures**: Deserialization issues
9. **A09:2021 – Logging Failures**: Logging pattern checks
10. **A10:2021 – SSRF**: Server-side request forgery detection

## API Reference

### Functions

#### scanFile(filePath: string, config?: ScanConfig): Promise<SecurityFinding[]>

Scan a single file for vulnerabilities.

#### scanProject(projectPath: string, config?: ScanConfig): Promise<ScanResult>

Recursively scan a project directory.

#### scanForSecrets(context: FileScanContext, customPatterns?: SecretPattern[]): Promise<SecurityFinding[]>

Scan specifically for hardcoded secrets.

#### scanForSQLInjection(context: FileScanContext): Promise<SecurityFinding[]>

Scan for SQL injection vulnerabilities.

#### scanForXSS(context: FileScanContext): Promise<SecurityFinding[]>

Scan for XSS vulnerabilities.

#### scanOWASP(context: FileScanContext): Promise<SecurityFinding[]>

Perform OWASP Top 10 security checks.

#### scanDependencies(projectPath: string): Promise<DependencyVulnerability[]>

Scan package.json for vulnerable dependencies.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on the GitHub repository.

## Security Disclosure

If you discover a security vulnerability in this scanner, please email security@example.com. Do not open a public issue.

---

**Remember**: Security scanning is just one layer of defense. Always follow secure coding practices, conduct code reviews, and keep dependencies updated.
