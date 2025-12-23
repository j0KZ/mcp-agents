# Test Generation Guide

## Configuration Options

### Framework Selection
```javascript
{
  "framework": "vitest",  // Used across @j0kz/mcp-agents
  // Other options: "jest", "mocha", "ava"
}
```

### Coverage Targets
```javascript
{
  "coverage": 80,           // Target percentage
  "includeEdgeCases": true,  // Boundary conditions
  "includeErrorCases": true, // Error handling paths
}
```

## Generate vs Write Workflow

### Step 1: Preview Tests
```javascript
Tool: generate_tests
Input: {
  "sourceFile": "src/module.ts",
  "config": {
    "framework": "vitest",
    "includeEdgeCases": true,
    "includeErrorCases": true,
    "coverage": 80
  }
}
// Returns test code for review
```

### Step 2: Write to File
```javascript
Tool: write_test_file
Input: {
  "sourceFile": "src/module.ts",
  "testFile": "tests/module.test.ts",  // Auto-generated if omitted
  "config": {
    "framework": "vitest",
    "coverage": 80
  }
}
```

### Step 3: Batch Generation
```javascript
Tool: batch_generate
Input: {
  "sourceFiles": [
    "src/module1.ts",
    "src/module2.ts",
    "src/module3.ts"
  ],
  "config": {
    "framework": "vitest"
  }
}
```

## Test Categories Generated

### Unit Tests
**Basic Functionality**
- Happy path scenarios
- Expected inputs/outputs
- Return value validation
- State changes
- Side effects

**Example:**
```typescript
describe('calculateTotal', () => {
  it('should return sum of prices', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });
});
```

### Edge Cases
**Boundary Conditions**
- Empty inputs ([], "", null)
- Single element arrays
- Maximum values
- Minimum values
- Type boundaries

**Example:**
```typescript
it('should handle empty array', () => {
  expect(calculateTotal([])).toBe(0);
});

it('should handle null input', () => {
  expect(() => calculateTotal(null)).toThrow();
});
```

### Error Cases
**Exception Handling**
- Invalid inputs
- Type mismatches
- Missing required params
- Network failures
- Timeout scenarios

**Example:**
```typescript
it('should throw on invalid price', () => {
  const items = [{ price: -10 }];
  expect(() => calculateTotal(items)).toThrow('Invalid price');
});
```

## Vitest-Specific Patterns

### Test Structure
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myFunction } from './module';

describe('Module Name', () => {
  describe('myFunction', () => {
    beforeEach(() => {
      // Setup
    });

    it('should do something', () => {
      // Test
    });
  });
});
```

### Mocking
```typescript
// Mock external dependencies
vi.mock('./external-module', () => ({
  externalFunction: vi.fn()
}));

// Mock timers
vi.useFakeTimers();

// Mock console
vi.spyOn(console, 'log').mockImplementation(() => {});
```

### Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});

it('should handle promise rejection', async () => {
  await expect(failingAsyncFunction()).rejects.toThrow('Error');
});
```

## Coverage Analysis

### Running Coverage
```bash
# Single package
npm run test:coverage -w packages/smart-reviewer

# All packages
npm run test:coverage

# With dashboard
npm run coverage:dashboard
```

### Coverage Report Structure
```
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   85.24 |    78.43 |   82.11 |   85.24 |
 src/              |   87.65 |    81.25 |   85.71 |   87.65 |
  module.ts        |   92.31 |    88.89 |   90.00 |   92.31 |
  utils.ts         |   78.95 |    70.00 |   75.00 |   78.95 |
```

### Improving Coverage

**Low Branch Coverage:**
- Add tests for if/else branches
- Test switch cases
- Cover ternary operators
- Test early returns

**Low Function Coverage:**
- Test utility functions
- Cover error handlers
- Test callbacks
- Cover class methods

**Low Line Coverage:**
- Test error paths
- Cover catch blocks
- Test default values
- Cover guard clauses

## Common Test Patterns

### Pattern 1: Table-Driven Tests
```typescript
it.each([
  [1, 1, 2],
  [2, 3, 5],
  [10, 20, 30],
])('add(%i, %i) should return %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected);
});
```

### Pattern 2: Snapshot Testing
```typescript
it('should match snapshot', () => {
  const result = complexTransformation(input);
  expect(result).toMatchSnapshot();
});
```

### Pattern 3: Property-Based Testing
```typescript
import { fc } from '@fast-check/vitest';

it.prop([fc.integer(), fc.integer()])(
  'should be commutative',
  (a, b) => {
    expect(add(a, b)).toBe(add(b, a));
  }
);
```

## Handling Generated Test Failures

### Test Found Actual Bug ✅
**Action:** Fix the bug in source code
```typescript
// Test reveals null handling issue
it('should handle null gracefully', () => {
  expect(process(null)).toBe(defaultValue);
  // Fails because process() throws
});

// Fix: Add null check in process()
```

### Mock Setup Needed
**Action:** Add proper mocks
```typescript
// Generated test needs mock
import { externalAPI } from './external';

// Add mock
vi.mock('./external', () => ({
  externalAPI: vi.fn().mockResolvedValue({ data: 'mocked' })
}));
```

### Edge Case Too Strict
**Action:** Adjust test expectations
```typescript
// Too strict
expect(result).toBe(3.14159265359);

// Better
expect(result).toBeCloseTo(3.14159, 5);
```

## Integration with CI/CD

### Pre-commit Hook
```bash
#!/bin/sh
# Run tests for changed files
files=$(git diff --cached --name-only --diff-filter=ACM | grep "\.ts$")
for file in $files; do
  testFile="${file%.ts}.test.ts"
  if [ -f "$testFile" ]; then
    npm test "$testFile"
  fi
done
```

### GitHub Actions
```yaml
- name: Generate missing tests
  run: |
    files=$(git diff --name-only ${{ github.base_ref }})
    npx test-generator batch $files

- name: Run tests with coverage
  run: npm run test:coverage

- name: Check coverage threshold
  run: |
    if [ $(coverage) -lt 75 ]; then
      echo "Coverage below 75%"
      exit 1
    fi
```

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Testing implementation
it('should call calculateTax()', () => {
  const spy = vi.spyOn(module, 'calculateTax');
  checkout();
  expect(spy).toHaveBeenCalled();
});

// ✅ Testing behavior
it('should include tax in total', () => {
  const result = checkout({ price: 100 });
  expect(result.total).toBe(110); // 10% tax
});
```

### 2. Descriptive Test Names
```typescript
// ❌ Vague
it('should work', () => {});

// ✅ Descriptive
it('should return user data when valid ID provided', () => {});
```

### 3. Arrange-Act-Assert
```typescript
it('should update user', () => {
  // Arrange
  const user = createUser({ name: 'John' });
  const newName = 'Jane';

  // Act
  const updated = updateUser(user, { name: newName });

  // Assert
  expect(updated.name).toBe(newName);
});
```