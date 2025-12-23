# Coverage Guide for Vitest

Complete guide to achieving and maintaining 75% code coverage with smart testing strategies.

---

## Coverage Targets

**Project Standards:**
- **Statements:** 75% (enforced)
- **Branches:** 50% minimum
- **Functions:** 60% minimum
- **Lines:** 75% (enforced)

**Configuration** (vitest.config.ts):
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 75,
      branches: 50,
      functions: 60,
      lines: 75,
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/mcp-server.ts',
        '**/types.ts',
        '**/index.ts',
        '**/constants/**'
      ]
    }
  }
});
```

---

## Running Coverage

### Basic Coverage

```bash
# Run tests with coverage
npm run test:coverage

# Output:
# -------------------------|---------|----------|---------|---------|
# File                     | % Stmts | % Branch | % Funcs | % Lines |
# -------------------------|---------|----------|---------|---------|
# All files               |   75.23 |    52.15 |   68.42 |   75.23 |
#   analyzer.ts           |   85.71 |    62.50 |   80.00 |   85.71 |
#   formatter.ts          |   92.30 |    75.00 |   90.00 |   92.30 |
#   utils.ts              |   68.42 |    45.00 |   55.55 |   68.42 |
# -------------------------|---------|----------|---------|---------|
```

### Check Coverage Thresholds

```bash
# Fail if below thresholds
npm run test:coverage:check

# Output:
# ✓ All coverage thresholds met
# or
# ✗ Coverage for statements (72%) below threshold (75%)
```

### View HTML Coverage Report

```bash
# Generate and open HTML report
npm run test:coverage
open coverage/index.html  # Mac
start coverage/index.html  # Windows
xdg-open coverage/index.html  # Linux
```

**HTML report shows:**
- File-by-file coverage
- Uncovered lines highlighted
- Branch coverage visualization
- Function coverage details

---

## Coverage Strategies

### High-Value Coverage (Test First)

**Priority 1: Public API methods (100% coverage)**
```typescript
export class CodeAnalyzer {
  // ✅ MUST test - public API
  public analyze(file: string): Promise<Result> {}

  // ✅ MUST test - public API
  public batchAnalyze(files: string[]): Promise<Result[]> {}

  // ⚠️ Can skip - private helper
  private parseAST(code: string): AST {}
}
```

**Priority 2: Error paths (catch blocks, validation)**
```typescript
it('should handle file read errors', async () => {
  vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

  await expect(analyzer.analyze('/fake.ts')).rejects.toThrow('ENOENT');
});

it('should validate input', () => {
  expect(() => analyzer.analyze('')).toThrow('FILE_001');
  expect(() => analyzer.analyze(null as any)).toThrow('FILE_001');
});
```

**Priority 3: Edge cases (empty, null, boundary values)**
```typescript
it('should handle empty file', async () => {
  vi.mocked(readFile).mockResolvedValue('');
  const result = await analyzer.analyze('/empty.ts');
  expect(result.issues).toEqual([]);
});

it('should handle very large file', async () => {
  const huge = 'x'.repeat(100000);
  vi.mocked(readFile).mockResolvedValue(huge);
  const result = await analyzer.analyze('/huge.ts');
  expect(result).toBeDefined();
});
```

**Priority 4: Integration flows (multi-step operations)**
```typescript
it('should complete full analysis workflow', async () => {
  const result = await orchestrator.runWorkflow('pre-merge');

  expect(result.steps).toHaveLength(4);
  expect(result.steps[0].success).toBe(true);
  expect(result.steps[1].success).toBe(true);
  expect(result.overallSuccess).toBe(true);
});
```

---

## What to Skip (Acceptable Exclusions)

### Configuration Exclusions

**Already excluded in vitest.config.ts:**
```typescript
exclude: [
  'node_modules/**',      // External dependencies
  'dist/**',              // Build output
  '**/*.test.ts',         // Test files themselves
  '**/mcp-server.ts',     // Thin orchestration layer
  '**/types.ts',          // Type definitions
  '**/index.ts',          // Re-exports
  '**/constants/**',      // Constants
  'installer/**'          // Standalone package
]
```

**Why these are excluded:**
- **mcp-server.ts** - Thin orchestration, delegates to core logic
- **types.ts** - TypeScript interfaces, no runtime code
- **index.ts** - Simple re-exports: `export * from './main.js'`
- **constants/** - Static values, no logic to test

### Low-Value Code (OK to skip)

**Simple getters/setters:**
```typescript
class Config {
  private _timeout = 30000;

  // Low value to test
  get timeout() { return this._timeout; }
  set timeout(value: number) { this._timeout = value; }
}
```

**Simple re-exports:**
```typescript
// index.ts
export * from './analyzer.js';
export * from './formatter.js';
// No logic, no test needed
```

**Defensive checks that can't be reached:**
```typescript
function process(data: Data) {
  // TypeScript ensures this never happens
  if (!data) throw new Error('Impossible');

  // Actual logic here
}
```

---

## Improving Coverage

### Finding Uncovered Code

**View coverage report:**
```bash
npm run test:coverage
open coverage/index.html
```

**Look for:**
- Red lines (uncovered)
- Yellow lines (partial branch coverage)
- Functions with 0% coverage

**Example from HTML report:**
```
analyzer.ts
  45 |   if (file.endsWith('.ts')) {
  46 |     return analyzeTSFile(file);
  47 |   } else if (file.endsWith('.js')) {
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (not covered)
  48 |     return analyzeJSFile(file);
  49 |   }
```

**Add test for uncovered branch:**
```typescript
it('should analyze JavaScript files', async () => {
  const result = await analyze('/test.js');
  expect(result).toBeDefined();
});
```

---

### Branch Coverage Strategies

**Conditional logic:**
```typescript
// Function to test
function calculateScore(metrics: Metrics): number {
  if (metrics.errors > 0) return 0;
  if (metrics.warnings > 10) return 50;
  return 100;
}

// Test all branches
it('should return 0 for errors', () => {
  expect(calculateScore({ errors: 1, warnings: 0 })).toBe(0);
});

it('should return 50 for many warnings', () => {
  expect(calculateScore({ errors: 0, warnings: 15 })).toBe(50);
});

it('should return 100 for clean code', () => {
  expect(calculateScore({ errors: 0, warnings: 5 })).toBe(100);
});
// 100% branch coverage ✓
```

**Switch statements:**
```typescript
// Function
function getToolName(type: ToolType): string {
  switch (type) {
    case 'review': return 'smart-reviewer';
    case 'test': return 'test-generator';
    case 'security': return 'security-scanner';
    default: throw new Error('Unknown type');
  }
}

// Test all cases
it.each([
  ['review', 'smart-reviewer'],
  ['test', 'test-generator'],
  ['security', 'security-scanner']
])('should return %s for %s', (type, expected) => {
  expect(getToolName(type as ToolType)).toBe(expected);
});

it('should throw for unknown type', () => {
  expect(() => getToolName('invalid' as any)).toThrow('Unknown type');
});
```

---

### Function Coverage Strategies

**Exported functions:**
```typescript
// All exported functions MUST have tests
export function publicAPI(): Result {
  // Test required
}

// Internal helpers can be skipped if tested indirectly
function internalHelper(): void {
  // Covered by testing publicAPI
}
```

**Async functions:**
```typescript
export async function analyze(file: string): Promise<Result> {
  const content = await readFile(file);
  return processContent(content);
}

// Test covers async function
it('should analyze file', async () => {
  const result = await analyze('/test.ts');
  expect(result).toBeDefined();
});
```

---

## Coverage Anti-Patterns

### ❌ Testing for Coverage Only

```typescript
// BAD: Shallow test just for coverage
it('should call function', () => {
  const result = analyze(file);
  expect(result).toBeDefined();  // Doesn't verify behavior!
});

// GOOD: Meaningful assertions
it('should return analysis with issues', async () => {
  const result = await analyze(file);
  expect(result.issues).toBeInstanceOf(Array);
  expect(result.metrics.linesOfCode).toBeGreaterThan(0);
  expect(result.overallScore).toBeGreaterThanOrEqual(0);
});
```

### ❌ 100% Coverage Goal

```typescript
// BAD: Obsessing over 100% coverage
// Testing every getter/setter, constant, type definition

// GOOD: Focus on valuable coverage
// Test business logic, error paths, edge cases
// Skip trivial code
```

### ❌ Testing Implementation Details

```typescript
// BAD: Testing private methods directly
it('should call parseAST', () => {
  const spy = vi.spyOn(analyzer, 'parseAST' as any);
  analyzer.analyze(file);
  expect(spy).toHaveBeenCalled();
});

// GOOD: Test behavior through public API
it('should analyze file successfully', async () => {
  const result = await analyzer.analyze(file);
  expect(result.ast).toBeDefined();
});
```

---

## Coverage Maintenance

### Monitor Coverage Trends

```bash
# Check coverage regularly
npm run test:coverage

# Add to CI/CD pipeline
npm run test:coverage:check
```

**CI integration** (.github/workflows/ci.yml):
```yaml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Coverage Badges

**Update in README.md:**
```markdown
[![Coverage](https://img.shields.io/badge/coverage-75%25-green.svg)](link)
```

**Automated update** (scripts/update-coverage-badge.js):
```javascript
const coverage = getCoveragePercentage();
const color = coverage >= 70 ? 'green' : coverage >= 50 ? 'yellow' : 'red';
updateBadge(`coverage-${coverage}%25-${color}.svg`);
```

### Pre-Push Hook

```bash
#!/bin/bash
# .husky/pre-push

npm run test:coverage:check || {
  echo "❌ Coverage below threshold!"
  exit 1
}
```

---

## Coverage Reports

### Text Report

```bash
npm run test:coverage

# Output:
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files            |   75.23 |    52.15 |   68.42 |   75.23 |
 analyzer.ts         |   85.71 |    62.50 |   80.00 |   85.71 |
 formatter.ts        |   92.30 |    75.00 |   90.00 |   92.30 |
----------------------|---------|----------|---------|---------|
```

### HTML Report

**Best for:**
- Visual coverage inspection
- Finding uncovered lines
- Understanding branch coverage

**Location:** `coverage/index.html`

### LCOV Report

**Best for:**
- CI/CD integration
- Codecov/Coveralls upload
- Trend analysis

**Location:** `coverage/lcov.info`

### JSON Report

**Best for:**
- Programmatic access
- Custom reporting
- Automated badge generation

**Location:** `coverage/coverage-final.json`

---

## Best Practices

### ✅ DO

1. **Focus on valuable coverage**
   - Test business logic thoroughly
   - Cover all error paths
   - Test edge cases

2. **Use coverage to find gaps**
   ```bash
   npm run test:coverage
   open coverage/index.html
   # Look for red lines
   ```

3. **Maintain thresholds**
   ```bash
   # Run before commit
   npm run test:coverage:check
   ```

4. **Write meaningful tests**
   - Verify behavior, not just coverage
   - Test happy path AND error paths
   - Include edge cases

### ❌ DON'T

1. **Don't chase 100% coverage**
   - 75% is sufficient
   - Focus on quality over quantity
   - Skip trivial code

2. **Don't test for coverage alone**
   ```typescript
   // BAD
   it('covers line 42', () => {
     doThing();  // Just for coverage
   });
   ```

3. **Don't ignore coverage drops**
   ```bash
   # If coverage drops:
   # 1. Find what changed
   # 2. Add missing tests
   # 3. Don't lower thresholds
   ```

4. **Don't exclude too much**
   ```typescript
   // Only exclude:
   // - Types
   // - Constants
   // - Re-exports
   // - Thin orchestration
   ```

---

## Quick Reference

### Commands
```bash
npm run test:coverage            # Run with coverage
npm run test:coverage:check      # Verify thresholds
npm test -- --coverage           # Same as above
npm test -- --coverage --watch   # Watch mode with coverage
```

### Configuration
```typescript
// vitest.config.ts
coverage: {
  statements: 75,
  branches: 50,
  functions: 60,
  lines: 75
}
```

### Viewing Reports
```bash
# HTML (best for inspection)
open coverage/index.html

# Text (quick overview)
cat coverage/coverage-summary.txt

# JSON (programmatic)
cat coverage/coverage-final.json
```

---

## Related

- See `assertion-patterns-guide.md` for effective assertions
- See `mocking-guide.md` for mocking strategies
- See main SKILL.md for complete testing patterns

---

**Reference:** 388 tests with 75% coverage across @j0kz/mcp-agents
**Framework:** Vitest with v8 coverage provider
**Project:** @j0kz/mcp-agents
