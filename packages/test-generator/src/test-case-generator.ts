/**
 * Test case generation logic extracted from generator.ts
 * Handles happy path, edge cases, and error cases for functions and classes
 */

import { FunctionInfo, ClassInfo, TestCase } from './types.js';

export class TestCaseGenerator {
  /**
   * Generate happy path test for a function
   */
  generateHappyPathTest(func: FunctionInfo): string {
    const params = func.params.map(p => this.generateMockValue(p)).join(', ');
    const assertion = this.generateSmartAssertion(func);
    const expectation = func.async
      ? `await expect(${func.name}(${params})).resolves${assertion}`
      : `expect(${func.name}(${params}))${assertion}`;

    return expectation;
  }

  /**
   * Generate smart assertion based on function name and characteristics
   */
  private generateSmartAssertion(func: FunctionInfo): string {
    const name = func.name.toLowerCase();

    // Boolean-returning functions
    if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can')) {
      // Check for negative indicators
      if (name.includes('not') || name.includes('no')) {
        return '.toBe(false)';
      }
      return '.toBe(true)';
    }

    // Validation functions
    if (name.startsWith('validate') || name.startsWith('check') || name.startsWith('verify')) {
      return '.toBe(true)';
    }

    // Count/calculate functions (numeric returns)
    if (
      name.startsWith('count') ||
      name.startsWith('calculate') ||
      name.startsWith('compute') ||
      name.includes('total') ||
      name.includes('sum')
    ) {
      return '.toBeGreaterThanOrEqual(0)';
    }

    // Get/find/fetch functions (might return null)
    if (
      name.startsWith('get') ||
      name.startsWith('find') ||
      name.startsWith('fetch') ||
      name.startsWith('load') ||
      name.startsWith('read')
    ) {
      return '.toBeDefined()';
    }

    // List/filter functions (array returns)
    if (
      name.startsWith('list') ||
      name.startsWith('filter') ||
      name.startsWith('map') ||
      name.startsWith('select') ||
      name.endsWith('s') // Plurals often return arrays
    ) {
      return '.toBeDefined()';
    }

    // Create/generate/build functions
    if (
      name.startsWith('create') ||
      name.startsWith('generate') ||
      name.startsWith('build') ||
      name.startsWith('make')
    ) {
      return '.toBeDefined()';
    }

    // Format/transform functions
    if (
      name.startsWith('format') ||
      name.startsWith('transform') ||
      name.startsWith('convert') ||
      name.startsWith('parse')
    ) {
      return '.toBeDefined()';
    }

    // Default: just check it's defined
    return '.toBeDefined()';
  }

  /**
   * Generate edge case tests for a function
   */
  generateEdgeCaseTests(func: FunctionInfo): TestCase[] {
    const tests: TestCase[] = [];

    if (func.params.length === 0) {
      return tests; // No edge cases for parameterless functions
    }

    const firstParam = func.params[0];
    const paramType = this.inferParameterType(firstParam);

    // String edge cases
    if (paramType === 'string') {
      tests.push({
        name: `should handle empty string`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}('')).resolves.toBeDefined()`
          : `expect(${func.name}('')).toBeDefined()`,
        description: `Test ${func.name} with empty string`,
      });

      tests.push({
        name: `should handle very long string`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}('${'x'.repeat(1000)}')).resolves.toBeDefined()`
          : `expect(${func.name}('${'x'.repeat(1000)}')).toBeDefined()`,
        description: `Test ${func.name} with very long string`,
      });

      tests.push({
        name: `should handle special characters`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}('!@#$%^&*()')).resolves.toBeDefined()`
          : `expect(${func.name}('!@#$%^&*()')).toBeDefined()`,
        description: `Test ${func.name} with special characters`,
      });
    }

    // Number edge cases
    if (paramType === 'number') {
      tests.push({
        name: `should handle zero`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}(0)).resolves.toBeDefined()`
          : `expect(${func.name}(0)).toBeDefined()`,
        description: `Test ${func.name} with zero`,
      });

      tests.push({
        name: `should handle negative numbers`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}(-1)).resolves.toBeDefined()`
          : `expect(${func.name}(-1)).toBeDefined()`,
        description: `Test ${func.name} with negative number`,
      });

      tests.push({
        name: `should handle large numbers`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}(Number.MAX_SAFE_INTEGER)).resolves.toBeDefined()`
          : `expect(${func.name}(Number.MAX_SAFE_INTEGER)).toBeDefined()`,
        description: `Test ${func.name} with large number`,
      });
    }

    // Array edge cases
    if (paramType === 'array') {
      tests.push({
        name: `should handle empty array`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}([])).resolves.toBeDefined()`
          : `expect(${func.name}([])).toBeDefined()`,
        description: `Test ${func.name} with empty array`,
      });

      tests.push({
        name: `should handle large array`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}(new Array(1000).fill(0))).resolves.toBeDefined()`
          : `expect(${func.name}(new Array(1000).fill(0))).toBeDefined()`,
        description: `Test ${func.name} with large array`,
      });
    }

    // Object edge cases
    if (paramType === 'object') {
      tests.push({
        name: `should handle empty object`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}({})).resolves.toBeDefined()`
          : `expect(${func.name}({})).toBeDefined()`,
        description: `Test ${func.name} with empty object`,
      });
    }

    // Generic null/undefined edge case
    tests.push({
      name: `should handle null/undefined`,
      type: 'edge-case',
      code: func.async
        ? `await expect(${func.name}(null as any)).resolves.toBeDefined()`
        : `expect(${func.name}(null as any)).toBeDefined()`,
      description: `Test ${func.name} with null input`,
    });

    return tests;
  }

  /**
   * Infer parameter type from parameter name
   */
  private inferParameterType(param: string): 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function' | 'unknown' {
    const lower = param.toLowerCase();

    // String indicators
    if (
      lower.includes('str') ||
      lower.includes('text') ||
      lower.includes('name') ||
      lower.includes('message') ||
      lower.includes('title') ||
      lower.includes('path') ||
      lower.includes('url')
    ) {
      return 'string';
    }

    // Number indicators
    if (
      lower.includes('num') ||
      lower.includes('count') ||
      lower.includes('id') ||
      lower.includes('age') ||
      lower.includes('index') ||
      lower.includes('size') ||
      lower.includes('length')
    ) {
      return 'number';
    }

    // Boolean indicators
    if (
      lower.includes('is') ||
      lower.includes('has') ||
      lower.includes('should') ||
      lower.includes('enabled') ||
      lower.includes('flag')
    ) {
      return 'boolean';
    }

    // Array indicators
    if (
      lower.includes('array') ||
      lower.includes('list') ||
      lower.includes('items') ||
      lower.endsWith('s')
    ) {
      return 'array';
    }

    // Function indicators
    if (
      lower.includes('callback') ||
      lower.includes('handler') ||
      lower.includes('fn') ||
      lower === 'f'
    ) {
      return 'function';
    }

    // Object indicators
    if (
      lower.includes('obj') ||
      lower.includes('config') ||
      lower.includes('options') ||
      lower.includes('data') ||
      lower.includes('params')
    ) {
      return 'object';
    }

    return 'unknown';
  }

  /**
   * Generate error case tests for a function
   */
  generateErrorCaseTests(func: FunctionInfo): TestCase[] {
    const tests: TestCase[] = [];

    // Invalid type
    if (func.params.length > 0) {
      tests.push({
        name: `should throw on invalid input type`,
        type: 'error-case',
        code: func.async
          ? `await expect(${func.name}(undefined)).rejects.toThrow()`
          : `expect(() => ${func.name}(undefined)).toThrow()`,
        description: `Test ${func.name} error handling with invalid type`,
      });
    }

    return tests;
  }

  /**
   * Generate constructor test for a class
   */
  generateConstructorTest(cls: ClassInfo): string {
    const params = cls.constructor?.params.map(p => this.generateMockValue(p)).join(', ') || '';
    return `const instance = new ${cls.name}(${params});\nexpect(instance).toBeInstanceOf(${cls.name});`;
  }

  /**
   * Generate test for a class method
   */
  generateMethodTest(cls: ClassInfo, method: FunctionInfo): string {
    const params = method.params.map(p => this.generateMockValue(p)).join(', ');
    const constructorParams =
      cls.constructor?.params.map(p => this.generateMockValue(p)).join(', ') || '';

    return method.async
      ? `const instance = new ${cls.name}(${constructorParams});\nawait expect(instance.${method.name}(${params})).resolves.toBeDefined();`
      : `const instance = new ${cls.name}(${constructorParams});\nexpect(instance.${method.name}(${params})).toBeDefined();`;
  }

  /**
   * Generate edge case tests for a class method
   */
  generateMethodEdgeCases(cls: ClassInfo, method: FunctionInfo): TestCase[] {
    return [
      {
        name: `should handle edge cases in ${method.name}`,
        type: 'edge-case',
        code: `const instance = new ${cls.name}();\nexpect(() => instance.${method.name}()).not.toThrow();`,
        description: `Test ${method.name} edge cases`,
      },
    ];
  }

  /**
   * Generate mock value for a parameter
   */
  generateMockValue(param: string): string {
    // Handle destructured params
    if (param === '{}') return '{}';

    // Handle rest params
    if (param.startsWith('...')) return '[1, 2, 3]';

    // Basic type inference from param names
    const lower = param.toLowerCase();

    if (lower.includes('id') || lower.includes('count') || lower.includes('age')) {
      return '1';
    }

    if (
      lower.includes('name') ||
      lower.includes('title') ||
      lower.includes('text') ||
      lower.includes('message')
    ) {
      return "'test'";
    }

    if (
      lower.includes('is') ||
      lower.includes('has') ||
      lower.includes('should') ||
      lower.includes('enabled')
    ) {
      return 'true';
    }

    if (
      lower.includes('callback') ||
      lower.includes('handler') ||
      lower.includes('fn') ||
      lower === 'f'
    ) {
      return '() => {}';
    }

    if (lower.includes('array') || lower.includes('list') || lower.includes('items')) {
      return '[]';
    }

    if (
      lower.includes('obj') ||
      lower.includes('config') ||
      lower.includes('options') ||
      lower.includes('data')
    ) {
      return '{}';
    }

    // Default to empty string for unknown types
    return "''";
  }
}
