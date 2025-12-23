# Complete Workflow Examples

## Example 1: Pre-PR Quality Gate

**Scenario:** Preparing to create pull request after feature development

### Step-by-Step Process

```bash
# 1. Identify changed files
git diff --name-only main...HEAD | grep -E '\.(ts|js)$'
# Output: 5 files changed
```

```javascript
// 2. Batch review with strict severity
Tool: batch_review
Input: {
  "filePaths": [
    "src/auth/login.ts",
    "src/auth/validate.ts",
    "src/utils/crypto.ts",
    "src/api/users.ts",
    "src/models/user.ts"
  ],
  "config": {
    "severity": "strict",
    "includeMetrics": true
  }
}
```

**Review Results:**
- 3 critical issues (security)
- 7 moderate issues (complexity)
- 12 minor issues (style)

```javascript
// 3. Preview auto-fixes
Tool: generate_auto_fixes
Input: {
  "filePath": "src/auth/login.ts",
  "safeOnly": false
}
// Repeat for each file
```

```javascript
// 4. Apply safe fixes to all
for (const file of files) {
  Tool: apply_auto_fixes
  Input: {
    "filePath": file,
    "safeOnly": true
  }
}
```

**After Auto-Fix:**
- 0 critical issues (3 required manual fix)
- 2 moderate issues (down from 7)
- 1 minor issue (down from 12)

```javascript
// 5. Generate tests for new code
Tool: write_test_file
Input: {
  "sourceFile": "src/auth/validate.ts",
  "config": {
    "framework": "vitest",
    "includeEdgeCases": true,
    "includeErrorCases": true,
    "coverage": 80
  }
}
```

```bash
# 6. Run all tests
npm test
# ✅ 156 tests passing

# 7. Check coverage
npm run test:coverage
# Coverage: 82% (up from 71%)
```

```javascript
// 8. Final review
Tool: batch_review
Input: {
  "filePaths": [...],
  "config": { "severity": "strict" }
}
```

**Final Status:**
```
✓ 0 critical issues
✓ 2 moderate issues (acceptable)
✓ Coverage: 82%
✓ All tests passing
✓ Ready for PR
```

### Time Investment
- Total time: 15 minutes
- Manual fixes: 5 minutes
- Automated: 10 minutes
- Issues resolved: 95%

---

## Example 2: Legacy Code Improvement

**Scenario:** Refactoring 456-line monolithic module with complexity 89

### Initial Assessment

```javascript
// 1. Review current state
Tool: review_file
Input: {
  "filePath": "src/legacy/order-processor.ts",
  "config": {
    "severity": "moderate",
    "includeMetrics": true
  }
}
```

**Results:**
```json
{
  "issues": {
    "critical": 12,
    "moderate": 23,
    "minor": 45
  },
  "metrics": {
    "complexity": 89,
    "maintainability": 42,
    "linesOfCode": 456,
    "coverage": 35
  }
}
```

### Improvement Process

```javascript
// 2. Generate comprehensive fix preview
Tool: generate_auto_fixes
Input: {
  "filePath": "src/legacy/order-processor.ts",
  "safeOnly": false
}
```

**Fix Analysis:**
- Safe fixes: 68 issues (85%)
- Manual fixes: 12 issues (15%)
- Complexity reduction: None (requires refactor)

```javascript
// 3. Apply safe fixes
Tool: apply_auto_fixes
Input: {
  "filePath": "src/legacy/order-processor.ts",
  "safeOnly": true
}
```

```bash
# 4. Verify no breakage
npm test -w packages/legacy
# ✅ Existing tests still pass
```

### Manual Fixes (Priority Order)

```typescript
// 5. Fix critical security issues
// Issue: SQL injection risk
// Before:
db.query(`SELECT * FROM orders WHERE id = ${orderId}`);

// After:
db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
```

```typescript
// 6. Fix null safety issues
// Before:
const user = getUser(id);
return user.email; // Can crash

// After:
const user = getUser(id);
return user?.email ?? '';
```

### Test Generation

```javascript
// 7. Generate comprehensive test suite
Tool: write_test_file
Input: {
  "sourceFile": "src/legacy/order-processor.ts",
  "config": {
    "framework": "vitest",
    "coverage": 70,  // Realistic for legacy
    "includeEdgeCases": true
  }
}
```

```bash
# 8. Run new tests
npm test src/legacy/order-processor.test.ts
# Result: 15/18 pass, 3 fail (found bugs!)

# 9. Fix the bugs found by tests
# ... make fixes ...

# 10. All tests pass
npm test src/legacy/order-processor.test.ts
# ✅ 18/18 pass
```

### Final Review

```javascript
// 11. Re-review after all fixes
Tool: review_file
Input: {
  "filePath": "src/legacy/order-processor.ts",
  "config": { "severity": "moderate" }
}
```

**Improvement Summary:**
```
Before → After
Critical: 12 → 0 ✓
Moderate: 23 → 8 ✓
Complexity: 89 → 58 ✓
Coverage: 35% → 72% ✓
Maintainability: 42 → 78 ✓
```

### Next Steps
```
Since complexity still >50:
→ Apply modular-refactoring-pattern
→ Split into 3 modules (~150 LOC each)
→ Further reduce complexity to <30
```

---

## Example 3: New Feature Development

**Scenario:** Building new MCP tool from scratch with quality-first approach

### Development Workflow

```typescript
// 1. Start with core implementation
// file: packages/new-tool/src/analyzer.ts

export class CodeAnalyzer {
  analyze(code: string): AnalysisResult {
    // Initial implementation
  }
}
```

```javascript
// 2. Review during development (early feedback)
Tool: review_file
Input: {
  "filePath": "packages/new-tool/src/analyzer.ts",
  "config": {
    "severity": "moderate"
  }
}
```

**Early Issues Found:**
- Missing error handling
- No input validation
- Complex nested logic

```typescript
// 3. Fix issues as you code
export class CodeAnalyzer {
  analyze(code: string): AnalysisResult {
    // Add validation
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid input');
    }

    try {
      // Implementation with error handling
    } catch (error) {
      // Proper error handling
    }
  }
}
```

### Test-Driven Refinement

```javascript
// 4. Generate comprehensive tests
Tool: write_test_file
Input: {
  "sourceFile": "packages/new-tool/src/analyzer.ts",
  "config": {
    "framework": "vitest",
    "includeEdgeCases": true,
    "includeErrorCases": true,
    "coverage": 85
  }
}
```

```bash
# 5. Run tests - find edge cases
npm test
# 12/15 pass, 3 edge cases fail
```

```typescript
// 6. Fix edge cases discovered by tests
// Example: Handle empty string differently than null
analyze(code: string): AnalysisResult {
  if (code === '') {
    return { empty: true, results: [] };
  }
  if (code == null) {
    throw new Error('Code cannot be null');
  }
  // ...
}
```

### Polish Phase

```javascript
// 7. Apply auto-fixes for cleanup
Tool: apply_auto_fixes
Input: {
  "filePath": "packages/new-tool/src/analyzer.ts",
  "safeOnly": true
}
```

```javascript
// 8. Final strict review
Tool: review_file
Input: {
  "filePath": "packages/new-tool/src/analyzer.ts",
  "config": {
    "severity": "strict"  // Production-ready standard
  }
}
```

### Documentation Generation

```javascript
// 9. Ensure comprehensive docs
Tool: doc-generator (if available)
// Or add manually based on review suggestions
```

### Final Quality Metrics

```bash
# 10. Final validation
npm run test:coverage -w packages/new-tool
```

**Results:**
```
✓ Coverage: 87%
✓ Complexity: 28
✓ Maintainability: 85
✓ 0 critical issues
✓ 0 moderate issues
✓ Tests: 15/15 passing
✓ Production ready
```

---

## Example 4: Codebase-Wide Audit

**Scenario:** Quarterly quality improvement sprint

### Discovery Phase

```bash
# 1. Find all source files
find packages -name "*.ts" -not -path "*/node_modules/*" -not -name "*.test.ts" | head -20
# Found: 127 source files
```

```javascript
// 2. Sample review to gauge quality
Tool: batch_review
Input: {
  "filePaths": [
    // 10 representative files from different packages
  ],
  "config": {
    "severity": "moderate",
    "includeMetrics": true
  }
}
```

### Prioritization

**High Priority Files (Fix First):**
```javascript
// Files with critical issues
const criticalFiles = results
  .filter(r => r.criticalIssues > 0)
  .sort((a, b) => b.criticalIssues - a.criticalIssues);
// Found: 8 files with 23 critical issues
```

**Complexity Hotspots (Refactor):**
```javascript
// Files with high complexity
const complexFiles = results
  .filter(r => r.metrics.complexity > 70)
  .sort((a, b) => b.metrics.complexity - a.metrics.complexity);
// Found: 12 files need refactoring
```

### Systematic Improvement

```javascript
// 3. Batch auto-fix for all safe issues
Tool: batch_review + apply_auto_fixes
for (const file of allFiles) {
  // Apply safe fixes
  apply_auto_fixes({ filePath: file, safeOnly: true });
}
```

**Results After Auto-Fix:**
- 450 issues auto-fixed
- 15 minutes for 127 files
- Zero breaking changes

### Critical Issues Resolution

```javascript
// 4. Address critical issues manually
for (const file of criticalFiles) {
  // Review specific issues
  // Fix security vulnerabilities
  // Fix type safety issues
  // Add error handling
}
```

### Test Coverage Improvement

```javascript
// 5. Generate tests for low-coverage files
const lowCoverageFiles = packages.filter(p => p.coverage < 60);

Tool: batch_generate
Input: {
  "sourceFiles": lowCoverageFiles,
  "config": {
    "framework": "vitest",
    "coverage": 70
  }
}
```

### Final Metrics

```bash
# 6. Update documentation with new metrics
npm run update:test-count
```

**Improvement Summary:**
```
Metric           | Before | After | Change
-----------------|--------|-------|--------
Critical Issues  | 23     | 0     | -100%
Total Issues     | 567    | 89    | -84%
Avg Complexity   | 52     | 38    | -27%
Coverage         | 68%    | 79%   | +16%
Test Count       | 578    | 632   | +9%
```

---

## Integration with CI/CD

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Get staged files
files=$(git diff --cached --name-only --diff-filter=ACM | grep "\.ts$")

# Run quality check
for file in $files; do
  npx smart-reviewer review "$file" --severity=moderate
  if [ $? -ne 0 ]; then
    echo "Quality check failed for $file"
    exit 1
  fi
done

# Apply safe fixes
for file in $files; do
  npx smart-reviewer auto-fix "$file" --safe-only
  git add "$file"
done
```

### GitHub Actions Workflow
```yaml
name: Code Quality Pipeline

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Review Changed Files
        run: |
          files=$(git diff --name-only origin/main...HEAD)
          npx smart-reviewer batch-review $files --severity=strict

      - name: Check Test Coverage
        run: |
          npm run test:coverage
          if [ $(coverage) -lt 75 ]; then
            exit 1
          fi
```

## Time Estimates

| Workflow | Files | Time | Automation |
|----------|-------|------|------------|
| Pre-commit | 1-5 | 1-2 min | 90% |
| Pre-PR | 5-20 | 5-15 min | 80% |
| Legacy Refactor | 1 | 30-60 min | 60% |
| New Feature | 1-3 | Ongoing | 70% |
| Codebase Audit | 100+ | 2-4 hours | 75% |