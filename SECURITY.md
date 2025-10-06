# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow these steps:

1. **DO NOT** open a public issue
2. Email the details to the maintainer (see npm profile: https://www.npmjs.com/~j0kz)
3. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Steps to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability

## Security Measures

This project implements several security measures:

### Input Validation
- All file paths are validated to prevent directory traversal attacks
- Input size limits are enforced (100KB max for code inputs)
- Regex patterns use bounded quantifiers to prevent ReDoS attacks

### Secret Detection
- The security-scanner package actively detects hardcoded secrets
- 20+ patterns for common API keys and tokens
- Safe pattern generation for testing (using repeated characters)

### Dependencies
- Regular dependency updates
- Security audits via `npm audit`
- Minimal production dependencies

### Code Quality
- TypeScript for type safety
- Comprehensive test coverage (68%+ statements)
- ESLint for code quality enforcement

## Security Best Practices for Users

When using these MCP tools:

1. **Never commit sensitive data**
   - Use environment variables for secrets
   - Add `.env` to `.gitignore`
   - Use secret management services

2. **Review generated code**
   - Always review AI-generated code before committing
   - Check for hardcoded credentials
   - Verify security implications

3. **File permissions**
   - Ensure proper file permissions on configuration files
   - Restrict access to MCP configuration

4. **API Security**
   - Use secure authentication methods
   - Implement rate limiting
   - Validate all inputs

## Vulnerability Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 1-3**: Initial assessment and acknowledgment
- **Day 4-14**: Fix development and testing
- **Day 15-30**: Patch release and notification
- **Day 31+**: Public disclosure (if applicable)

## Security Tools Included

This monorepo includes a comprehensive security scanner (`@j0kz/security-scanner-mcp`) that can:
- Detect hardcoded secrets and API keys
- Find SQL injection vulnerabilities
- Identify XSS vulnerabilities
- Check for OWASP Top 10 issues
- Scan dependencies for known vulnerabilities

## Contact

For security concerns, please contact the maintainer through:
- npm: https://www.npmjs.com/~j0kz
- GitHub Issues (for non-sensitive matters only)

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who:
- Follow responsible disclosure practices
- Provide clear reproduction steps
- Allow reasonable time for fixes

Thank you for helping keep this project secure!