# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Claude MCP Development Tools seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Open a Public Issue

Please do not disclose security vulnerabilities through public GitHub issues, discussions, or pull requests.

### 2. Report Privately

**Open a private security advisory** on GitHub:
https://github.com/j0KZ/mcp-agents/security/advisories/new

Or email: security@example.com (GitHub issues preferred)

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Varies by severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

### 4. Disclosure Policy

- We follow coordinated disclosure
- Security advisories published after fix is released
- Credit given to reporters (unless anonymity requested)

## Security Best Practices for Users

### Installation

```bash
# Always verify package integrity
npm install --audit

# Or with specific package
npm install @your-org/mcp-tools --audit
```

### Configuration

```bash
# Never commit secrets to version control
echo ".env" >> .gitignore
echo "secrets.json" >> .gitignore

# Use environment variables for sensitive data
export API_KEY="your-key-here"
```

### Updates

```bash
# Regularly update to latest secure version
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

## Security Features

### Built-in Security Scanning

This project includes a security scanner MCP tool that can detect:

- Hardcoded secrets and API keys
- SQL injection vulnerabilities
- Cross-site scripting (XSS) risks
- Command injection vulnerabilities
- Path traversal issues
- Weak cryptographic algorithms
- OWASP Top 10 vulnerabilities

### Running Security Scans

```bash
# Scan entire project
npm run security:scan

# Scan for secrets only
npm run security:secrets

# Check dependencies
npm audit
```

## Known Security Considerations

### Development Tools Only

This project provides **development and build tools** only. It is not intended for production runtime use or handling sensitive user data.

### Local Execution

All MCP tools run locally on your machine. No data is sent to external servers except:

- npm package downloads
- Git repository operations

### No Authentication Required

These tools do not implement authentication or authorization. They are designed for local development use by trusted developers.

### File System Access

MCP tools require file system access to:

- Read source code files
- Generate documentation
- Create test files
- Analyze project structure

Ensure you run these tools only on trusted codebases.

## Dependencies

### Dependency Management

We regularly review and update dependencies to address security vulnerabilities.

Current strategy:

- Automated Dependabot updates
- Monthly security audits
- Immediate critical CVE patches

### Trusted Sources

All dependencies are from:

- npm official registry
- Verified publishers
- Well-maintained packages

## Compliance

### OWASP Top 10

This project follows OWASP Top 10 security guidelines for application security.

### CWE

We scan for Common Weakness Enumeration (CWE) issues including:

- CWE-79 (Cross-site Scripting)
- CWE-89 (SQL Injection)
- CWE-78 (Command Injection)
- CWE-22 (Path Traversal)
- CWE-327 (Weak Cryptography)
- CWE-798 (Hardcoded Credentials)

### Secure Coding Standards

- TypeScript for type safety
- ESLint for code quality
- No eval() or Function() constructors
- Input validation on all external data
- Proper error handling
- Secure file operations

## Security Audit History

| Date       | Version | Findings               | Status    |
| ---------- | ------- | ---------------------- | --------- |
| 2025-10-01 | 1.0.7   | 0 real vulnerabilities | ✅ Passed |

## Security Tools Used

- **Security Scanner MCP** - Custom vulnerability detection
- **npm audit** - Dependency vulnerability checking
- **TypeScript** - Type safety and compile-time checks
- **ESLint** - Static code analysis

## Contact

For security inquiries: **[Your Security Email]**

For general questions: **[Your General Email]**

GitHub Security Advisories: [Security Tab](https://github.com/your-org/mcp-tools/security)

---

**Last Updated:** 2025-10-01
**Next Review:** 2025-11-01
