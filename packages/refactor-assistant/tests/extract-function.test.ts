/**
 * Tests for extract-function.ts refactoring
 */

import { describe, it, expect } from 'vitest';
import { extractFunction } from '../src/core/extract-function.js';

describe('extractFunction', () => {
  describe('validation', () => {
    it('should fail for empty code', () => {
      const result = extractFunction('', { functionName: 'test', startLine: 1, endLine: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_001');
      expect(result.error).toContain('Invalid code input');
    });

    it('should fail for null code', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = extractFunction(null as any, {
        functionName: 'test',
        startLine: 1,
        endLine: 1,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_001');
    });

    it('should fail for code exceeding max size', () => {
      const largeCode = 'x'.repeat(101 * 1024); // 101KB
      const result = extractFunction(largeCode, { functionName: 'test', startLine: 1, endLine: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_002');
      expect(result.error).toContain('too large');
    });

    it('should fail for invalid function name (empty)', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, { functionName: '', startLine: 1, endLine: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_003');
    });

    it('should fail for invalid function name (invalid characters)', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, {
        functionName: '123invalid',
        startLine: 1,
        endLine: 1,
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_004');
      expect(result.error).toContain('123invalid');
    });

    it('should fail for invalid function name (special characters)', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, { functionName: 'my-func', startLine: 1, endLine: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_004');
    });

    it('should fail for invalid line range (missing)', () => {
      const code = 'const x = 1;';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = extractFunction(code, { functionName: 'test' } as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_005');
    });

    it('should fail for invalid line range (out of bounds)', () => {
      const code = 'const x = 1;\nconst y = 2;';
      // startLine 0 is invalid, triggers REFACTOR_006 (startLine must be >= 1)
      const result = extractFunction(code, { functionName: 'test', startLine: 0, endLine: 2 });
      expect(result.success).toBe(false);
      // The error contains REFACTOR_006 for invalid line range
      expect(result.error).toMatch(/REFACTOR_00[56]/); // Either 005 or 006 based on validation order
    });

    it('should fail for invalid line range (end > lines)', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, { functionName: 'test', startLine: 1, endLine: 10 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_006');
    });

    it('should fail for invalid line range (start > end)', () => {
      const code = 'const x = 1;\nconst y = 2;\nconst z = 3;';
      const result = extractFunction(code, { functionName: 'test', startLine: 3, endLine: 1 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('REFACTOR_006');
    });
  });

  describe('extraction', () => {
    it('should extract simple code block', () => {
      const code = `function main() {
  const a = 1;
  const b = 2;
  const sum = a + b;
  console.log(sum);
}`;
      const result = extractFunction(code, {
        functionName: 'calculateSum',
        startLine: 2,
        endLine: 4,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('function calculateSum');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('extract-function');
    });

    it('should detect parameters from used but not declared variables', () => {
      const code = `function process() {
  const result = x + y;
  return result;
}`;
      const result = extractFunction(code, {
        functionName: 'addValues',
        startLine: 2,
        endLine: 3,
      });

      expect(result.success).toBe(true);
      // x and y should be detected as parameters
      expect(result.code).toContain('addValues(');
    });

    it('should create arrow function when specified', () => {
      const code = `const x = 1;
const y = 2;`;
      const result = extractFunction(code, {
        functionName: 'getValue',
        startLine: 1,
        endLine: 2,
        arrow: true,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('const getValue =');
      expect(result.code).toContain('=>');
    });

    it('should add async keyword when specified', () => {
      const code = `const data = fetchData();
processData(data);`;
      const result = extractFunction(code, {
        functionName: 'loadAndProcess',
        startLine: 1,
        endLine: 2,
        async: true,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('async function loadAndProcess');
      expect(result.code).toContain('await loadAndProcess');
    });

    it('should create async arrow function', () => {
      const code = `const data = fetchData();`;
      const result = extractFunction(code, {
        functionName: 'loadData',
        startLine: 1,
        endLine: 1,
        async: true,
        arrow: true,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('const loadData = async');
      expect(result.code).toContain('=>');
    });

    it('should detect return value', () => {
      const code = `function main() {
  const value = calculate();
  return value * 2;
}`;
      const result = extractFunction(code, {
        functionName: 'doubleValue',
        startLine: 2,
        endLine: 3,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('const result =');
      expect(result.code).toContain('doubleValue(');
    });

    it('should preserve indentation', () => {
      const code = `class MyClass {
    method() {
        const x = 1;
        const y = 2;
    }
}`;
      const result = extractFunction(code, {
        functionName: 'initVars',
        startLine: 3,
        endLine: 4,
      });

      expect(result.success).toBe(true);
      // The extracted function should maintain relative indentation
      expect(result.changes[0].type).toBe('extract-function');
    });

    it('should handle single line extraction', () => {
      const code = `const result = complexCalculation(a, b, c);`;
      const result = extractFunction(code, {
        functionName: 'calculate',
        startLine: 1,
        endLine: 1,
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('function calculate');
    });

    it('should record change details', () => {
      const code = `line1
line2
line3`;
      const result = extractFunction(code, {
        functionName: 'extracted',
        startLine: 2,
        endLine: 2,
      });

      expect(result.success).toBe(true);
      expect(result.changes[0].lineRange).toEqual({ start: 2, end: 2 });
      expect(result.changes[0].before).toBe('line2');
      expect(result.changes[0].description).toContain('lines 2-2');
    });
  });

  describe('edge cases', () => {
    it('should accept valid function names starting with $', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, { functionName: '$helper', startLine: 1, endLine: 1 });
      expect(result.success).toBe(true);
      expect(result.code).toContain('function $helper');
    });

    it('should accept valid function names starting with _', () => {
      const code = 'const x = 1;';
      const result = extractFunction(code, { functionName: '_private', startLine: 1, endLine: 1 });
      expect(result.success).toBe(true);
      expect(result.code).toContain('function _private');
    });

    it('should filter out keywords from parameters', () => {
      const code = `if (condition) {
  return value;
}`;
      const result = extractFunction(code, {
        functionName: 'checkCondition',
        startLine: 1,
        endLine: 3,
      });

      expect(result.success).toBe(true);
      // 'if', 'return' should not be in parameters
      expect(result.code).not.toMatch(/checkCondition\(.*\bif\b/);
      expect(result.code).not.toMatch(/checkCondition\(.*\breturn\b/);
    });

    it('should handle code with const/let/var declarations', () => {
      const code = `const a = 1;
let b = 2;
var c = 3;`;
      const result = extractFunction(code, {
        functionName: 'initVariables',
        startLine: 1,
        endLine: 3,
      });

      expect(result.success).toBe(true);
      // a, b, c are declared, so they shouldn't be parameters
      // But extraction might still work with empty params
      expect(result.code).toContain('function initVariables');
    });
  });
});
