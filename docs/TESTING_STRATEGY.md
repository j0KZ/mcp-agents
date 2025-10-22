# Testing Strategy & Best Practices

## Current State (v1.0.34)

**Test Coverage:**

- 244 passing tests across all test files
- Statement coverage: 14.09% (target: 55%)
- Branch coverage: 66.25% (target: 65%) ✅
- Function coverage: 65.56% (target: 72%)

**Quality Assessment:**

- Most tests are **smoke tests** (6/10 quality)
- Tests verify structure but not business logic
- Missing edge cases and error scenarios
- Need integration tests and snapshot testing

---

## The Problem: Current Tests Are Too Shallow

### Example of WEAK Test (Don't Do This)

```typescript
// ❌ BAD - Only checks if something is returned
it('should generate README', async () => {
  const result = await generateReadme('.', {});
  expect(result).toBeDefined();
  expect(result.content).toBeDefined();
});
```

**Why it's weak:**

- Doesn't verify the README content is correct
- Doesn't check if required sections exist
- Won't catch logic errors
- Just checks "did it crash?"

### Example of STRONG Test (Do This)

```typescript
// ✅ GOOD - Verifies actual behavior
it('should generate README with installation section when configured', async () => {
  const result = await generateReadme('.', {
    includeInstallation: true,
    projectName: 'my-project',
  });

  expect(result.success).toBe(true);
  expect(result.content).toContain('# my-project');
  expect(result.content).toContain('## Installation');
  expect(result.content).toContain('npm install');
  expect(result.content.split('\n').length).toBeGreaterThan(10);
});
```

**Why it's strong:**

- Tests specific configuration option
- Verifies expected content exists
- Checks actual output format
- Would catch if installation section is missing

---

## Testing Strategy by Package

### 1. **API Designer** - Use Snapshot Testing

**Problem:** Current tests just check `result.data` exists
**Solution:** Snapshot test the entire OpenAPI spec

```typescript
describe('generateOpenAPI()', () => {
  it('should generate valid OpenAPI 3.0.3 spec', () => {
    const config = {
      name: 'User API',
      version: '1.0.0',
      style: 'REST' as const,
      resources: ['users'],
      auth: { type: 'bearer' as const },
    };

    const result = target.generateOpenAPI(config);

    // Verify structure
    expect(result.success).toBe(true);
    expect(result.data.openapi).toBe('3.0.3');

    // Snapshot the entire spec
    expect(result.data).toMatchSnapshot();

    // Verify critical paths exist
    expect(result.data.paths['/users']).toBeDefined();
    expect(result.data.paths['/users/{id}']).toBeDefined();

    // Verify security is configured
    expect(result.data.components?.securitySchemes?.BearerAuth).toBeDefined();
    expect(result.data.security).toEqual([{ BearerAuth: [] }]);
  });
});
```

### 2. **Test Generator** - Use Fixture Files

**Problem:** Tests use inline code strings
**Solution:** Create fixture files with real code to test against

```typescript
// tests/fixtures/sample-code.ts
export function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
}

export class Calculator {
  add(x: number, y: number): number {
    return x + y;
  }
  subtract(x: number, y: number): number {
    return x - y;
  }
}

// tests/generator.test.ts
it('should generate edge case tests for error-throwing functions', async () => {
  const fixturePath = path.join(__dirname, 'fixtures/sample-code.ts');

  const result = await generator.generateTests(fixturePath, {
    includeEdgeCases: true,
    includeErrorCases: true,
  });

  expect(result.success).toBe(true);

  // Verify error case for division by zero is generated
  expect(result.code).toContain('expect(() => divide(10, 0)).toThrow');
  expect(result.code).toContain('Division by zero');

  // Verify tests for Calculator class
  expect(result.code).toContain("describe('Calculator'");
  expect(result.suite?.tests.length).toBeGreaterThanOrEqual(6); // 2 functions + 2 class methods + edge cases
});
```

### 3. **Security Scanner** - Use Vulnerability Fixtures

**Problem:** Tests don't actually verify vulnerabilities are detected
**Solution:** Create files with known vulnerabilities and verify detection

```typescript
// tests/fixtures/vulnerable-code.ts
const vulnerableCode = {
  sqlInjection: `
    const query = "SELECT * FROM users WHERE id = " + userId;
    db.execute(query);
  `,
  xss: `
    document.getElementById('output').innerHTML = userInput;
    eval(dangerousCode);
  `,
  secrets: `
    const AWS_KEY = "AKIA" + "IOSFODNN7EXAMPLE";
    const STRIPE_KEY = "sk_test_" + "XXXXXXXXXXXXXXXXXXXX";
  `,
};

describe('Security Scanner - Real Vulnerability Detection', () => {
  it('should detect SQL injection with line numbers', async () => {
    const result = await scanForSQLInjection({
      content: vulnerableCode.sqlInjection,
      filePath: 'test.js',
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({
      type: 'sql_injection',
      severity: 'high',
      message: expect.stringContaining('String concatenation in SQL query'),
      line: expect.any(Number),
    });
  });

  it('should detect multiple XSS vulnerabilities', async () => {
    const result = await scanForXSS({
      content: vulnerableCode.xss,
      filePath: 'test.js',
    });

    expect(result.length).toBe(2); // innerHTML + eval

    const innerHTMLIssue = result.find(r => r.message.includes('innerHTML'));
    const evalIssue = result.find(r => r.message.includes('eval'));

    expect(innerHTMLIssue).toBeDefined();
    expect(evalIssue).toBeDefined();
    expect(innerHTMLIssue?.severity).toBe('high');
  });

  it('should detect and categorize different secret types', async () => {
    const result = await scanForSecrets({
      content: vulnerableCode.secrets,
      filePath: 'config.js',
    });

    expect(result.length).toBe(2);

    const awsKey = result.find(r => r.message.includes('AWS'));
    const stripeKey = result.find(r => r.message.includes('Stripe'));

    expect(awsKey?.severity).toBe('critical');
    expect(stripeKey?.severity).toBe('critical');
  });
});
```

### 4. **Smart Reviewer** - Test Metrics Accuracy

**Problem:** Tests don't verify metrics are calculated correctly
**Solution:** Use known code samples with expected metrics

```typescript
describe('Code Metrics Calculation', () => {
  it('should calculate complexity correctly for nested conditions', async () => {
    const code = `
      function complex(a, b, c) {
        if (a > 0) {
          if (b > 0) {
            if (c > 0) {
              return true;
            }
          }
        }
        return false;
      }
    `;

    const result = await analyzer.analyzeFile(createTempFile(code));

    // Cyclomatic complexity should be 4 (3 if statements + 1 base)
    expect(result.metrics.complexity).toBe(4);
    expect(result.metrics.linesOfCode).toBe(11);
  });

  it('should detect code smells and provide fixes', async () => {
    const code = `
      var x = 10; // var usage
      console.log(x); // console.log in production
    `;

    const result = await analyzer.analyzeFile(createTempFile(code));

    expect(result.issues.length).toBe(2);

    const varIssue = result.issues.find(i => i.message.includes('var'));
    const consoleIssue = result.issues.find(i => i.message.includes('console'));

    expect(varIssue?.autoFix).toBeDefined();
    expect(consoleIssue?.severity).toBe('warning');
  });
});
```

### 5. **Doc Generator** - Verify Output Structure

**Problem:** Tests don't check if generated docs are actually useful
**Solution:** Verify required sections and markdown structure

````typescript
describe('README Generation - Content Verification', () => {
  it('should generate complete README with all sections', async () => {
    const result = await generateReadme('.', {
      includeInstallation: true,
      includeUsage: true,
      includeTOC: true,
      includeBadges: true,
      includeAPI: true,
    });

    expect(result.success).toBe(true);

    const content = result.content;

    // Verify structure
    expect(content).toMatch(/^# /); // Title
    expect(content).toContain('## Table of Contents');
    expect(content).toContain('## Installation');
    expect(content).toContain('## Usage');
    expect(content).toContain('## API');

    // Verify badges
    expect(content).toContain('![npm version]');
    expect(content).toContain('![license]');

    // Verify links work
    const tocLinks = content.match(/\[.*?\]\(#.*?\)/g);
    expect(tocLinks?.length).toBeGreaterThan(3);
  });

  it('should generate valid markdown without broken links', async () => {
    const result = await generateReadme('.', {});

    // Check for common markdown issues
    expect(result.content).not.toMatch(/\]\(\s*\)/); // Empty links
    expect(result.content).not.toMatch(/##\s*$/m); // Empty headers

    // Verify code blocks are properly closed
    const codeBlockCount = (result.content.match(/```/g) || []).length;
    expect(codeBlockCount % 2).toBe(0); // Must be even
  });
});
````

### 6. **Architecture Analyzer** - Test with Real Projects

**Problem:** Tests use minimal test data
**Solution:** Test against actual package structure

```typescript
describe('Architecture Analysis - Real Package', () => {
  it('should detect circular dependencies in complex project', async () => {
    const analyzer = new ArchitectureAnalyzer();

    // Use api-designer package which has generators/ subfolder
    const result = await analyzer.analyzeArchitecture(path.join(__dirname, '../../api-designer'), {
      detectCircular: true,
    });

    expect(result.modules.length).toBeGreaterThan(5);
    expect(result.dependencies).toBeDefined();

    // Verify it found the actual modules
    const moduleNames = result.modules.map(m => path.basename(m.path));
    expect(moduleNames).toContain('designer.ts');
    expect(moduleNames).toContain('types.ts');

    // Should not have circular dependencies
    if (result.circularDependencies) {
      expect(result.circularDependencies.length).toBe(0);
    }
  });

  it('should generate dependency graph in mermaid format', async () => {
    const analyzer = new ArchitectureAnalyzer();

    const result = await analyzer.analyzeArchitecture(path.join(__dirname, '../../api-designer'), {
      generateGraph: true,
    });

    expect(result.graph).toBeDefined();
    expect(result.graph).toContain('graph TD');
    expect(result.graph).toContain('-->');
  });
});
```

---

## Testing Anti-Patterns to Avoid

### ❌ Don't Just Check "toBeDefined"

```typescript
// BAD
it('should work', async () => {
  const result = await doSomething();
  expect(result).toBeDefined(); // Useless
});
```

### ❌ Don't Test Implementation Details

```typescript
// BAD - Tests internal variable names
it('should create cache', () => {
  const analyzer = new CodeAnalyzer();
  expect(analyzer['cache']).toBeDefined(); // Accessing private member
});
```

### ❌ Don't Have Tests That Can't Fail

```typescript
// BAD - This will never fail
it('should return array', async () => {
  const result = await scanFile('test.js');
  expect(Array.isArray(result)).toBe(true); // Always passes even if result is undefined
});
```

### ❌ Don't Skip Negative Test Cases

```typescript
// BAD - Only tests happy path
it('should parse code', () => {
  const result = parseCode('valid code');
  expect(result).toBeDefined();
});

// GOOD - Also test error cases
it('should throw on invalid syntax', () => {
  expect(() => parseCode('invalid {')).toThrow('Syntax error');
});
```

---

## Test Quality Checklist

For each test, ask:

- [ ] **Does it test behavior, not implementation?**
- [ ] **Would it fail if the code is broken?**
- [ ] **Does it verify the actual output, not just types?**
- [ ] **Does it test edge cases and errors?**
- [ ] **Is it readable and maintainable?**
- [ ] **Does it run fast (<100ms)?**
- [ ] **Is it isolated (no dependencies on other tests)?**

---

## Recommended Test Structure

```typescript
describe('FeatureName', () => {
  // Setup
  let subject: YourClass;

  beforeEach(() => {
    subject = new YourClass();
  });

  describe('when given valid input', () => {
    it('should return expected result', () => {
      const result = subject.method('valid');
      expect(result).toEqual(expectedValue);
    });
  });

  describe('when given invalid input', () => {
    it('should throw descriptive error', () => {
      expect(() => subject.method('')).toThrow('Expected non-empty string');
    });
  });

  describe('when configured with options', () => {
    it('should respect configuration', () => {
      const result = subject.method('input', { option: true });
      expect(result).toHaveProperty('optionApplied', true);
    });
  });

  describe('edge cases', () => {
    it('should handle null', () => {
      expect(() => subject.method(null)).not.toThrow();
    });

    it('should handle very large input', () => {
      const largeInput = 'x'.repeat(10000);
      const result = subject.method(largeInput);
      expect(result).toBeDefined();
    });
  });
});
```

---

## Action Plan: Reaching 55% Coverage

### Phase 1: Fix Existing Tests (Week 1)

- [ ] Rewrite security-scanner tests with real vulnerability fixtures
- [ ] Add snapshot testing to api-designer
- [ ] Add fixture files to test-generator tests
- [ ] Verify smart-reviewer metrics calculations

### Phase 2: Add Integration Tests (Week 2)

- [ ] Create end-to-end workflow tests for orchestrator
- [ ] Test MCP server responses
- [ ] Test cross-package integration

### Phase 3: Add Property-Based Tests (Week 3)

- [ ] Use fast-check for generators (OpenAPI, GraphQL)
- [ ] Test refactoring operations preserve behavior
- [ ] Test security scanner with random inputs

### Phase 4: Performance Tests (Week 4)

- [ ] Benchmark large file analysis
- [ ] Test caching effectiveness
- [ ] Memory leak detection

---

## Tools & Resources

**Testing Frameworks:**

- Vitest (current) - Fast, ESM-first
- fast-check - Property-based testing
- msw - API mocking

**Coverage Tools:**

- c8/v8 (current) - Native coverage
- istanbul - Alternative coverage

**Best Practices:**

- [Kent C. Dodds - Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Martin Fowler - Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

---

## Quick Reference: Test Recipes

### Recipe 1: Testing File Operations

```typescript
import { writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function createTempFile(content: string): string {
  const dir = join(tmpdir(), 'test-' + Date.now());
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'test.ts');
  writeFileSync(file, content);
  return file;
}
```

### Recipe 2: Testing Async Operations

```typescript
it('should complete within timeout', async () => {
  const promise = longRunningOperation();
  const result = await Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
  ]);
  expect(result).toBeDefined();
});
```

### Recipe 3: Testing Error Messages

```typescript
it('should provide helpful error message', async () => {
  try {
    await riskyOperation();
    fail('Should have thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('expected cause');
    expect(error.message).toContain('how to fix');
  }
});
```

---

**Last Updated:** 2025-01-06
**Version:** 1.0.34
**Status:** Draft - Needs implementation
