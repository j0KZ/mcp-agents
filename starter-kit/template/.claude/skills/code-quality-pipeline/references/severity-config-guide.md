# Severity Configuration Guide

## Severity Levels Explained

### strict - Production & Security-Critical Code
**Use for:**
- Production code going to main branch
- Public APIs and interfaces
- Security-critical modules
- Payment/financial code
- User authentication/authorization
- Code about to be released

**What it flags:**
- ALL security vulnerabilities
- Type safety violations
- Resource leaks
- Potential null/undefined errors
- Missing error handling
- Complex code (>50 complexity)
- Missing documentation for public APIs
- Console.log statements
- Hardcoded secrets/credentials

### moderate - Standard Development
**Use for:**
- Internal tools and utilities
- Development utilities
- Most monorepo packages
- Standard PR reviews
- Feature branches
- Team collaboration code

**What it flags:**
- Critical security issues
- Major type violations
- High complexity (>70)
- Obvious performance issues
- Missing core documentation
- Duplicate code blocks
- Basic error handling gaps

### lenient - Prototypes & Experiments
**Use for:**
- Prototypes and POCs
- Experimental code
- Quick iterations
- Learning/tutorial code
- Test implementations
- Temporary solutions

**What it flags:**
- Only severe security issues
- Breaking type errors
- Infinite loops
- Resource exhaustion
- Critical logic errors

## Interpreting Review Results

### Output Structure
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "filePath": "src/module.ts",
        "issues": [
          {
            "severity": "critical",
            "type": "security",
            "message": "Potential SQL injection",
            "line": 42,
            "suggestion": "Use parameterized queries"
          }
        ],
        "metrics": {
          "complexity": 67,
          "maintainability": 72,
          "linesOfCode": 456,
          "testCoverage": 65
        }
      }
    ],
    "summary": {
      "totalIssues": 15,
      "critical": 3,
      "moderate": 7,
      "minor": 5
    }
  }
}
```

## Issue Categories & Priority

### Critical Issues (Fix Before Merging)
**Security:**
- SQL injection vulnerabilities
- XSS vulnerabilities
- Exposed secrets/credentials
- Insecure random generation
- Path traversal risks

**Reliability:**
- Type safety violations
- Resource leaks (memory, file handles)
- Infinite loops
- Null/undefined access
- Unhandled promise rejections

### Moderate Issues (Fix If Time Permits)
**Code Quality:**
- High complexity (>70)
- Missing core documentation
- Inconsistent error handling
- Performance bottlenecks
- Large duplicate blocks

**Maintainability:**
- Deep nesting (>4 levels)
- Long functions (>100 lines)
- Too many parameters (>5)
- Circular dependencies
- Mixed responsibilities

### Minor Issues (Future Cleanup)
**Style & Convention:**
- Naming inconsistencies
- Comment improvements
- Micro-optimizations
- Import organization
- Whitespace/formatting

## Configuration Examples

### Pre-PR Review
```javascript
{
  "config": {
    "severity": "strict",
    "includeMetrics": true,
    "autoFix": false  // Preview only
  }
}
```

### Daily Development
```javascript
{
  "config": {
    "severity": "moderate",
    "includeMetrics": false,
    "autoFix": true  // Apply safe fixes
  }
}
```

### Quick Prototype Check
```javascript
{
  "config": {
    "severity": "lenient",
    "includeMetrics": false,
    "autoFix": false
  }
}
```

## Adjusting Thresholds

### Complexity Thresholds by Severity
| Severity | Max Complexity | Max LOC | Max Nesting |
|----------|---------------|---------|-------------|
| strict   | 50            | 200     | 3           |
| moderate | 70            | 300     | 4           |
| lenient  | 100           | 500     | 5           |

### Coverage Requirements
| Severity | Min Coverage | Critical Path Coverage |
|----------|-------------|------------------------|
| strict   | 80%         | 95%                    |
| moderate | 70%         | 85%                    |
| lenient  | 50%         | 70%                    |

## Common Patterns

### Pattern: Gradual Strictness
Start lenient, increase severity as code matures:
1. **Prototype phase:** lenient
2. **Feature complete:** moderate
3. **Pre-release:** strict

### Pattern: Layer-Based Severity
Different severity for different layers:
- **API layer:** strict (public-facing)
- **Business logic:** strict (core functionality)
- **Utilities:** moderate (internal helpers)
- **Tests:** lenient (test code)

### Pattern: Risk-Based Configuration
High-risk areas get stricter review:
- **Payment processing:** strict + security focus
- **User data handling:** strict + privacy focus
- **Public APIs:** strict + documentation focus
- **Internal tools:** moderate + maintainability focus