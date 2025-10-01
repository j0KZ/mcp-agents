# Complete Workflow Examples

Real-world examples of using all three agents together.

## Example 1: Building a REST API

### Scenario
You need to build a new REST API endpoint for user management.

### Step-by-Step

#### 1. Generate Tests First (TDD)
```bash
claude code "Generate tests for user API endpoint in src/api/users.js with test-generator"
```

**Agent generates:**
```javascript
// src/api/users.test.js
describe('User API', () => {
  it('should get all users', async () => {
    await expect(getUsers()).resolves.toBeDefined();
  });

  it('should get user by id', async () => {
    await expect(getUserById(1)).resolves.toBeDefined();
  });

  it('should handle invalid user id', async () => {
    await expect(getUserById(-1)).rejects.toThrow();
  });

  // ... more tests
});
```

#### 2. Implement the API
```bash
claude code "Implement src/api/users.js to pass the generated tests"
```

#### 3. Review Implementation
```bash
claude code "Review src/api/users.js with smart-reviewer"
```

**Agent reports:**
```json
{
  "overallScore": 82,
  "issues": [
    {
      "line": 15,
      "severity": "warning",
      "message": "Function has too many parameters (6). Consider using an options object.",
      "rule": "max-params"
    }
  ],
  "suggestions": [
    "High complexity (12). Consider breaking down into smaller functions."
  ]
}
```

#### 4. Refactor Based on Review
```bash
claude code "Refactor src/api/users.js to reduce complexity and use options object"
```

#### 5. Verify Architecture
```bash
claude code "Analyze architecture and verify users API follows layer rules"
```

**Agent confirms:**
```json
{
  "layerViolations": 0,
  "suggestions": [
    "Architecture is well-organized with good cohesion."
  ]
}
```

#### 6. Final Check
```bash
# Run tests
npm test

# Commit
git add .
git commit -m "feat: add user management API with tests"
```

---

## Example 2: Refactoring Legacy Code

### Scenario
You have a large, complex legacy file that needs refactoring.

### Step-by-Step

#### 1. Initial Analysis
```bash
claude code "Analyze src/legacy/old-processor.js with all three agents"
```

**Smart Reviewer reports:**
```
- Complexity: 45 (very high!)
- Maintainability: 32 (low)
- 23 issues found
- Score: 34/100
```

**Architecture Analyzer reports:**
```
- Part of 3 circular dependencies
- 15 modules depend on this file
- Coupling: 85 (very high)
```

#### 2. Generate Tests for Current Behavior
```bash
claude code "Generate comprehensive tests for src/legacy/old-processor.js to lock in current behavior"
```

This ensures refactoring doesn't break functionality.

#### 3. Break Circular Dependencies
```bash
claude code "Identify and suggest fixes for circular dependencies involving old-processor.js"
```

**Agent suggests:**
```
1. Extract interface to src/interfaces/processor.js
2. Use dependency injection for circular deps
3. Move shared utilities to src/utils/
```

#### 4. Implement Suggestions
```bash
claude code "Refactor old-processor.js following the suggested changes"
```

#### 5. Verify Improvements
```bash
# Review refactored code
claude code "Review refactored code with smart-reviewer"

# Check architecture
claude code "Verify circular dependencies are resolved"

# Run tests
npm test
```

**New metrics:**
```
Smart Reviewer:
- Complexity: 12 (good)
- Maintainability: 78 (good)
- Score: 85/100

Architecture Analyzer:
- Circular dependencies: 0
- Coupling: 45 (moderate)
```

#### 6. Update Documentation
```bash
claude code "Generate documentation for the refactored modules"
```

---

## Example 3: Onboarding New Developer

### Scenario
New developer joins the team and needs to understand the codebase.

### Step-by-Step

#### 1. Architecture Overview
```bash
claude code "Generate complete architecture analysis with dependency graph"
```

**Share the generated Mermaid diagram and metrics with the new developer.**

#### 2. Identify Entry Points
```bash
claude code "Find modules with highest dependency count (likely entry points)"
```

#### 3. Code Quality Assessment
```bash
claude code "Batch review all main modules and identify areas needing improvement"
```

#### 4. Generate Missing Tests
```bash
claude code "Identify modules with no tests and generate test suites"
```

#### 5. Create Onboarding Tasks
Based on agent outputs, create tasks:
- "Fix circular dependency in auth module"
- "Improve code quality in data/repository.js"
- "Add tests for utils/validator.js"

---

## Example 4: Pre-Release Quality Check

### Scenario
About to release v2.0 and need comprehensive quality check.

### Step-by-Step

#### 1. Full Codebase Review
```bash
# Review all source files
claude code "Batch review all files in src/ with strict severity"
```

#### 2. Test Coverage Check
```bash
# Generate tests for untested code
claude code "Find all files without tests and generate test suites"

# Run coverage
npm run test:coverage
```

#### 3. Architecture Validation
```bash
# Full architecture analysis
claude code "Complete architecture analysis including circular deps, layer violations, and metrics"
```

#### 4. Generate Quality Report
```bash
claude code "Create comprehensive quality report combining all agent findings"
```

**Report includes:**
- Code quality score by module
- Test coverage statistics
- Architecture health metrics
- Critical issues to fix
- Nice-to-have improvements

#### 5. Fix Critical Issues
```bash
# Address each critical issue
claude code "Fix all critical errors found in quality report"

# Verify fixes
claude code "Re-run all agents on fixed files"
```

#### 6. Update Changelog
```bash
claude code "Generate changelog from git history and quality improvements"
```

---

## Example 5: CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/quality-check.yml
name: Quality Check

on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm ci

      - name: Setup Claude Agents
        run: |
          git clone https://github.com/your-repo/my-claude-agents.git ~/agents
          cd ~/agents
          npm install
          npm run build
          npm run install-global

      - name: Code Review
        run: |
          claude code "Review all modified files with smart-reviewer severity=strict"

      - name: Generate Tests
        run: |
          claude code "Generate tests for files without tests"

      - name: Architecture Check
        run: |
          claude code "Verify no new circular dependencies or layer violations"

      - name: Run Tests
        run: npm test

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            // Post results as PR comment
```

---

## Example 6: Daily Maintenance Task

### Automated Script

```bash
#!/bin/bash
# daily-quality-check.sh

echo "🔍 Daily Quality Check $(date)"

# 1. Review recent changes
echo "\n📝 Reviewing recent changes..."
claude code "Review files modified in last 24 hours"

# 2. Check architecture drift
echo "\n🏗️ Checking architecture..."
claude code "Analyze architecture and compare metrics with baseline"

# 3. Generate missing tests
echo "\n🧪 Checking test coverage..."
claude code "Find files without tests and generate test suites"

# 4. Run all tests
echo "\n✅ Running tests..."
npm test

# 5. Generate report
echo "\n📊 Generating report..."
claude code "Create daily quality report with all findings"

echo "\n✨ Daily check complete!"
```

### Cron Job
```bash
# Run daily at 9 AM
0 9 * * * /path/to/daily-quality-check.sh >> /var/log/quality-check.log 2>&1
```

---

## Best Practices

### 1. **Always Start with Tests**
Generate tests before implementing features (TDD).

### 2. **Review Before Commit**
Use smart-reviewer on all changes before committing.

### 3. **Monitor Architecture**
Check architecture regularly to prevent drift.

### 4. **Automate in CI/CD**
Integrate agents into your pipeline for continuous quality.

### 5. **Track Metrics Over Time**
Save agent outputs to track quality trends.

### 6. **Customize for Your Team**
Adjust agent configurations to match your standards.

---

## Common Patterns

### Pattern: "Generate → Implement → Review → Verify"
1. Generate tests
2. Implement feature
3. Review code
4. Verify architecture

### Pattern: "Analyze → Refactor → Verify"
1. Analyze current state
2. Refactor based on findings
3. Verify improvements

### Pattern: "Batch Operations"
1. Batch review multiple files
2. Batch generate tests
3. Run all tests together

---

## Tips for Maximum Productivity

1. **Use Batch Operations**: More efficient than one-by-one
2. **Chain Commands**: Combine multiple agent tasks
3. **Save Common Commands**: Create shell aliases
4. **Integrate with Git Hooks**: Automate on commit/push
5. **Document Patterns**: Share successful workflows with team
6. **Customize Configs**: Tailor agents to your project needs

---

## Next Steps

- Explore [Advanced Configuration](./ADVANCED_CONFIG.md)
- Set up [Git Hooks](./GIT_INTEGRATION.md)
- Configure [CI/CD](./CICD_INTEGRATION.md)
- Read [Best Practices](./BEST_PRACTICES.md)
