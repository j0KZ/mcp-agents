# Test Generator Examples

This example shows how to use the Test Generator MCP to automatically generate comprehensive tests.

## Example 1: Basic Test Generation

**Source File**: `calculator.js`

### Using with Claude Code

```
Generate tests for examples/test-generator/calculator.js with vitest framework
```

The Test Generator will:

- ✅ Parse the Calculator class
- ✅ Detect all methods (add, subtract, multiply, divide, percentage)
- ✅ Generate tests with edge cases
- ✅ Include error handling tests (e.g., division by zero)
- ✅ Add boundary value tests

### Expected Output

```javascript
import { describe, it, expect } from 'vitest';
import { Calculator } from './calculator.js';

describe('Calculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(calculator.add(0, 5)).toBe(5);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
    });
  });

  // ... more tests
});
```

## Example 2: Custom Configuration

```
Generate tests for examples/test-generator/calculator.js with:
- Framework: jest
- Coverage target: 95%
- Include edge cases: true
- Include error cases: true
```

## Example 3: Batch Generation

```
Generate tests for all files in src/ directory using vitest
```

## Tips

- **Edge Cases**: The generator automatically includes tests for:
  - Zero values
  - Negative numbers
  - Boundary values
  - Null/undefined

- **Error Cases**: Detects `throw` statements and generates error tests

- **Coverage**: Aims for high coverage by testing all code paths

## MCP Tool Reference

```json
{
  "tool": "generate_tests",
  "arguments": {
    "sourceFile": "examples/test-generator/calculator.js",
    "config": {
      "framework": "vitest",
      "coverage": 90,
      "includeEdgeCases": true,
      "includeErrorCases": true
    }
  }
}
```
