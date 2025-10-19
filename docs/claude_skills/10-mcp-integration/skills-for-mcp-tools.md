# Creating Skills for MCP Tools

**How to build Claude Skills that teach effective usage of the @j0kz/mcp-agents tools.**

---

## Why Skills for MCP Tools?

### The Problem

Your MCP tools provide powerful capabilities:
- `@j0kz/smart-reviewer` - Code review and quality analysis
- `@j0kz/test-generator` - Comprehensive test generation
- `@j0kz/architecture-analyzer` - Dependency and architecture analysis
- `@j0kz/mcp-agents` - Multi-agent orchestration
- ... and 5 more tools

**But users might not know:**
- When to use each tool
- How to combine tools effectively
- What parameters produce best results
- How to interpret outputs
- Best practices for workflows

### The Solution: MCP Usage Skills

Create skills that teach Claude:
- ✅ **Which tool** to use for each scenario
- ✅ **How to configure** tools effectively
- ✅ **How to interpret** results
- ✅ **How to combine** tools in workflows
- ✅ **Best practices** from real usage

---

## Pattern: Agent-Centric MCP Skills

### ❌ Don't: Tool Documentation Wrapper

```markdown
---
name: smart-reviewer-docs
description: Documentation for smart-reviewer MCP tool
---

# Smart Reviewer Documentation

## review_file Tool
- **Input**: filePath (string)
- **Output**: { issues: [...], metrics: {...} }

## batch_review Tool
- **Input**: filePaths (string[])
- **Output**: { results: [...] }
```

**Problem:** This is just API documentation, not agent guidance.

### ✅ Do: Workflow-Oriented Skill

```markdown
---
name: code-quality-workflow
description: Guides systematic code quality improvement using smart-reviewer and test-generator MCP tools. Use when improving code quality, preparing for PR review, or auditing codebase.
---

# Code Quality Workflow

Systematic approach to improving code quality using MCP tools.

## When to Use This Workflow

- Before creating a pull request
- After significant refactoring
- During codebase audits
- When quality metrics are failing

## Complete Workflow

### 1. Initial Assessment

Identify files needing review:
```bash
# For new/changed files
git diff --name-only main...HEAD

# For entire directory
find src/ -name "*.ts" -o -name "*.js"
```

### 2. Run Smart Review

Use `review_file` MCP tool on each file:

**Configuration:**
- **severity: "strict"** - For production code
- **severity: "moderate"** - For internal tools
- **severity: "lenient"** - For prototypes

**Workflow:**
```
For each file:
  1. Run review_file with appropriate severity
  2. Categorize issues: critical, moderate, minor
  3. Focus on critical issues first
  4. Document patterns if issues repeat
```

### 3. Generate Auto-Fixes

Use `generate_auto_fixes` MCP tool:

**Pareto Principle:** Tool identifies 20% of changes that fix 80% of issues.

**Safe Fixes (Auto-Apply):**
- Formatting corrections
- Import organization
- Simple type fixes
- Consistent naming

**Manual Fixes (Review Required):**
- Logic changes
- Refactoring suggestions
- Architectural improvements

**Workflow:**
```
1. Run generate_auto_fixes with safeOnly: true
2. Review suggested changes
3. Apply safe fixes with apply_auto_fixes
4. Manually implement complex improvements
```

### 4. Generate Missing Tests

Use `generate_tests` MCP tool from test-generator:

**Configuration:**
```json
{
  "sourceFile": "path/to/reviewed-file.ts",
  "config": {
    "framework": "vitest",
    "includeEdgeCases": true,
    "includeErrorCases": true,
    "coverage": 80
  }
}
```

**Workflow:**
```
For each fixed file:
  1. Identify functions lacking tests
  2. Generate comprehensive test suite
  3. Write to {filename}.test.ts
  4. Run tests to validate
  5. Adjust coverage threshold if needed
```

### 5. Verify Improvements

**Re-run review_file** to confirm issues resolved:

```
Expected outcome:
  ✓ Critical issues: 0
  ✓ Code complexity: Reduced
  ✓ Test coverage: Increased
  ✓ Maintainability: Improved
```

**Metrics to track:**
- Issue count reduction
- Complexity score change
- Coverage percentage increase

## Tool Combination Patterns

### Pattern 1: Pre-PR Quality Gate

```
1. smart-reviewer.review_file (all changed files)
2. smart-reviewer.apply_auto_fixes (safe fixes only)
3. test-generator.generate_tests (uncovered code)
4. smart-reviewer.review_file (verify improvements)
```

### Pattern 2: Codebase Audit

```
1. architecture-analyzer.analyze_architecture (detect circular deps)
2. smart-reviewer.batch_review (all source files)
3. Prioritize by: circular deps > critical issues > moderate issues
4. Fix in order, re-analyze after each change
```

### Pattern 3: Refactoring Safety

```
1. test-generator.generate_tests (establish baseline)
2. Run tests (green? proceed : fix tests first)
3. Perform refactoring
4. smart-reviewer.review_file (check complexity)
5. Run tests again (still green? success : rollback)
```

## Interpreting Results

### Smart Reviewer Output

**Critical Issues:** Always fix before merging
- Security vulnerabilities
- Type safety violations
- Resource leaks

**Moderate Issues:** Fix if time permits
- Code complexity warnings
- Missing documentation
- Inconsistent patterns

**Minor Issues:** Consider for future cleanup
- Style preferences
- Micro-optimizations

### Test Generator Output

**High-Value Tests:**
- Edge cases (boundary conditions)
- Error handling (exceptions, invalid input)
- Integration points (API calls, database)

**Lower Priority:**
- Simple getters/setters (if well-typed)
- Pure utility functions (if thoroughly tested elsewhere)

## Best Practices

### 1. Start Small
Don't review entire codebase at once. Pick:
- Recent changes (git diff)
- High-traffic files (most imports)
- Complex modules (high cyclomatic complexity)

### 2. Fix Progressively
Address issues in order:
1. Security vulnerabilities
2. Type safety issues
3. Critical logic bugs
4. Complexity reduction
5. Style and formatting

### 3. Validate Continuously
After each fix:
- Re-run review
- Run test suite
- Check git diff (ensure changes are intentional)

### 4. Document Patterns
If same issue appears repeatedly:
- Document the pattern
- Create linting rule
- Add to team coding standards

## Common Workflows

### New Feature Development

```
Phase 1: Implementation
  → Write feature code

Phase 2: Quality Check
  → smart-reviewer.review_file (feature files)
  → Fix critical issues

Phase 3: Test Coverage
  → test-generator.generate_tests (new code)
  → Achieve 80%+ coverage

Phase 4: Final Review
  → smart-reviewer.review_file (verify clean)
  → Ready for PR
```

### Bug Fix Validation

```
Phase 1: Reproduce
  → Write failing test

Phase 2: Fix
  → Implement bug fix

Phase 3: Review
  → smart-reviewer.review_file (changed files)
  → Ensure no new issues introduced

Phase 4: Test
  → Run full test suite
  → Confirm bug fixed, no regressions
```

### Legacy Code Improvement

```
Phase 1: Baseline
  → architecture-analyzer.analyze_architecture
  → Identify circular dependencies

Phase 2: Prioritize
  → smart-reviewer.batch_review (all files)
  → Sort by issue severity

Phase 3: Incremental Fixes
  → Fix one module at a time
  → Re-analyze after each fix
  → Validate no circular deps reintroduced

Phase 4: Test Harness
  → test-generator.generate_tests
  → Build comprehensive test suite
  → Prevent future regressions
```

## Troubleshooting

### "Too many issues to fix"

**Focus on Pareto principle:**
1. Run `generate_auto_fixes`
2. Apply safe fixes (20% effort, 80% resolution)
3. Manually address remaining critical issues

### "Tool results seem inconsistent"

**Check severity configuration:**
```json
{
  "severity": "strict"  // May flag more than needed
}
```

Try "moderate" for internal tools, "strict" for public APIs.

### "Generated tests are failing"

**Common causes:**
1. Edge case tests expose actual bugs (good!)
2. Mock setup needs adjustment
3. Test framework configuration issue

**Resolution:**
- Review test logic
- Fix actual bugs if discovered
- Adjust mocks for external dependencies

## Next Steps

- **Explore composition:** [Multi-Skill Composition](../07-advanced-topics/multi-skill-composition.md)
- **Build custom skills:** [Development Workflow](../06-development-workflow/creation-process.md)
- **Learn best practices:** [Writing Style](../04-best-practices/writing-style.md)

---

**Related Documentation:**
- [Project-Specific Patterns](project-specific-patterns.md)
- [Automation Opportunities](automation-opportunities.md)
- [Skills vs Tools](../01-overview/skills-vs-tools.md)
