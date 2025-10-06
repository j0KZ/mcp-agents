# Test Intelligence Generator Agent

Automated test generation agent that creates comprehensive test suites with edge cases, error handling, and high coverage estimation.

## Features

- 🧪 **Comprehensive Tests**: Generates happy path, edge cases, and error tests
- 📊 **Coverage Estimation**: Predicts test coverage before running
- 🎯 **Framework Agnostic**: Supports Jest, Vitest, Mocha, AVA
- 🔍 **Smart Parsing**: Extracts functions and classes from source code
- 💡 **Edge Case Detection**: Automatically identifies boundary conditions

## Tools Available

### `generate_tests`

Generate comprehensive test suite for a source file.

**Parameters:**

- `sourceFile` (string, required): Path to the source file
- `config` (object, optional): Test generation configuration
  - `framework`: 'jest' | 'mocha' | 'vitest' | 'ava'
  - `coverage`: number (target coverage percentage)
  - `includeEdgeCases`: boolean
  - `includeErrorCases`: boolean

**Example:**

```bash
claude code "Generate tests for src/utils.js with test-generator"
```

**Response includes:**

- Generated test code
- Test suites and individual test cases
- Estimated coverage percentage
- Total number of tests generated

### `write_test_file`

Generate tests and write directly to a test file.

**Parameters:**

- `sourceFile` (string, required): Path to the source file
- `testFile` (string, optional): Custom test file path
- `config` (object, optional): Test generation configuration

**Example:**

```bash
claude code "Generate and write tests for src/auth.js"
```

### `batch_generate`

Generate tests for multiple files at once.

**Parameters:**

- `sourceFiles` (array, required): Array of source file paths
- `config` (object, optional): Test generation configuration

**Example:**

```bash
claude code "Generate tests for all files in src/utils/"
```

## Test Types Generated

### Happy Path Tests

Standard functionality tests with typical valid inputs.

```javascript
it('should calculate sum with valid numbers', () => {
  expect(sum(2, 3)).toBe(5);
});
```

### Edge Case Tests

Boundary conditions and unusual inputs.

```javascript
it('should handle empty/null parameters', () => {
  expect(() => sum(null)).not.toThrow();
});

it('should handle large inputs', () => {
  expect(sum(Number.MAX_VALUE, 1)).toBeDefined();
});
```

### Error Case Tests

Invalid inputs and error conditions.

```javascript
it('should throw on invalid input type', () => {
  expect(() => sum(undefined)).toThrow();
});
```

### Integration Tests

Tests for class interactions and method flows.

```javascript
it('should create instance and call methods', () => {
  const instance = new Calculator();
  expect(instance.add(2, 3)).toBe(5);
});
```

## Supported Frameworks

### Jest (Default)

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals';
import * as target from './module';

describe('moduleName', () => {
  it('should work', () => {
    expect(target.func()).toBeDefined();
  });
});
```

### Vitest

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import * as target from './module';
```

### Mocha + Chai

```javascript
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import * as target from './module';
```

### AVA

```javascript
import test from 'ava';
import * as target from './module';

test('should work', async t => {
  t.truthy(target.func());
});
```

## Example Output

```json
{
  "sourceFile": "src/calculator.js",
  "testFile": "src/calculator.test.js",
  "framework": "jest",
  "suites": [
    {
      "describe": "Calculator class",
      "tests": [
        {
          "name": "should create instance of Calculator",
          "type": "happy-path",
          "code": "const instance = new Calculator();\nexpect(instance).toBeInstanceOf(Calculator);",
          "description": "Test Calculator instantiation"
        },
        {
          "name": "should add",
          "type": "happy-path",
          "code": "expect(instance.add(2, 3)).toBe(5);",
          "description": "Test Calculator.add()"
        }
      ]
    }
  ],
  "fullTestCode": "// Generated test code...",
  "estimatedCoverage": 85,
  "totalTests": 12
}
```

## Integration with Claude Code

### TDD Workflow

```bash
# Generate tests FIRST
claude code "Generate tests for new feature in src/feature.js"

# Implement code to pass tests
claude code "Implement src/feature.js to pass the generated tests"
```

### SPARC Integration

```bash
# Automatic test generation in SPARC TDD workflow
npx claude-flow sparc tdd "New authentication feature"

# Uses test-generator automatically to create tests
```

### Pre-commit Testing

```bash
# Generate tests for modified files
claude code "Generate tests for all modified files"

# Run tests before commit
npm test
```

## Configuration

Create `~/.config/claude-code/agents.config.json`:

```json
{
  "test-generator": {
    "framework": "jest",
    "coverage": 90,
    "includeEdgeCases": true,
    "includeErrorCases": true,
    "mockExternal": true
  }
}
```

## Mock Value Generation

The generator intelligently creates mock values based on parameter names:

| Parameter Pattern       | Generated Value      |
| ----------------------- | -------------------- |
| `*id*`                  | `1`                  |
| `*name*`                | `"test"`             |
| `*email*`               | `"test@example.com"` |
| `*age*`                 | `25`                 |
| `*count*`               | `10`                 |
| `*array*`, `*list*`     | `[]`                 |
| `*object*`, `*data*`    | `{}`                 |
| `*bool*`, `is*`, `has*` | `true`               |

## Best Practices

1. **Generate Early**: Write tests before implementation (TDD)
2. **Review Generated Tests**: Ensure they match requirements
3. **Customize Mocks**: Adjust generated mock values for your domain
4. **Run and Iterate**: Execute tests and refine as needed
5. **Maintain Coverage**: Aim for 80-90% coverage minimum

## Coverage Estimation

The agent estimates coverage based on:

- Number of functions/methods tested
- Edge case coverage
- Error case coverage
- Integration test presence

Base coverage + edge cases (+10%) + error cases (+10%) = Total estimated coverage

## Limitations

- **Static Analysis**: Cannot detect all runtime behaviors
- **Mock Accuracy**: Generated mocks may need adjustment
- **Complex Logic**: Integration tests may need manual refinement
- **External Dependencies**: Mocking external APIs requires review

## Roadmap

- [ ] Type-aware mock generation (TypeScript)
- [ ] Snapshot testing support
- [ ] Visual regression test generation
- [ ] Performance/benchmark test generation
- [ ] Integration with test runners for real coverage
- [ ] AI-powered test case suggestion
- [ ] Historical failure analysis
