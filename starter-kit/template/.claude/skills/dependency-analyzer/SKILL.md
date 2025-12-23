---
name: dependency-analyzer
description: "Analyze and optimize project dependencies. Use when auditing npm packages, checking for vulnerabilities, finding outdated dependencies, analyzing bundle size, or detecting circular imports."
---

# Dependency Analyzer

> Comprehensive dependency analysis and optimization for JavaScript/TypeScript projects

## Quick Commands

```bash
# Analyze all dependencies
npm run analyze:deps

# Find outdated packages
npm outdated --long

# Check for vulnerabilities
npm audit --audit-level=moderate

# Analyze bundle size impact
npx bundle-phobia-cli package-name
```

## Core Functionality

### Key Features

1. **Dependency Audit**: Security vulnerabilities and outdated packages
2. **Bundle Analysis**: Size impact and tree-shaking effectiveness
3. **Circular Detection**: Find and resolve circular dependencies
4. **License Compliance**: Verify license compatibility
5. **Update Strategy**: Safe update recommendations

## Detailed Information

For comprehensive details, see:

```bash
cat .claude/skills/dependency-analyzer/references/audit-guide.md
```

```bash
cat .claude/skills/dependency-analyzer/references/optimization-strategies.md
```

```bash
cat .claude/skills/dependency-analyzer/references/security-best-practices.md
```

## Usage Examples

### Example 1: Full Dependency Audit

```javascript
import { DependencyAnalyzer } from '@j0kz/dependency-analyzer';

const analyzer = new DependencyAnalyzer();
const report = await analyzer.audit({
  checkVulnerabilities: true,
  checkOutdated: true,
  checkLicenses: true,
  checkBundleSize: true
});

console.log(report.summary);
```

### Example 2: Find Circular Dependencies

```javascript
const circles = await analyzer.findCircularDependencies();
if (circles.length > 0) {
  console.log('Circular dependencies found:', circles);
}
```

## Configuration

```json
{
  "dependency-analyzer": {
    "autoFix": false,
    "severity": "moderate",
    "ignoreDev": false,
    "maxBundleSize": "500kb",
    "allowedLicenses": ["MIT", "Apache-2.0", "BSD-3-Clause"]
  }
}
```

## Integration with CI/CD

```yaml
# GitHub Actions example
- name: Dependency Audit
  run: |
    npm audit --audit-level=moderate
    npx @j0kz/dependency-analyzer audit --fail-on-high
```

## Notes

- Integrates with npm, yarn, and pnpm
- Caches results for faster subsequent runs
- Supports monorepo structures
- Can generate SBOM (Software Bill of Materials)