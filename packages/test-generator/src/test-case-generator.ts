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
    const expectation = func.async
      ? `await expect(${func.name}(${params})).resolves.toBeDefined()`
      : `expect(${func.name}(${params})).toBeDefined()`;

    return expectation;
  }

  /**
   * Generate edge case tests for a function
   */
  generateEdgeCaseTests(func: FunctionInfo): TestCase[] {
    const tests: TestCase[] = [];

    // Empty/null parameters
    if (func.params.length > 0) {
      tests.push({
        name: `should handle empty/null parameters`,
        type: 'edge-case',
        code: func.async
          ? `await expect(${func.name}(null)).resolves.not.toThrow()`
          : `expect(() => ${func.name}(null)).not.toThrow()`,
        description: `Test ${func.name} with null input`,
      });
    }

    // Large inputs
    tests.push({
      name: `should handle large inputs`,
      type: 'edge-case',
      code: func.async
        ? `await expect(${func.name}('${'x'.repeat(1000)}')).resolves.toBeDefined()`
        : `expect(${func.name}('${'x'.repeat(1000)}')).toBeDefined()`,
      description: `Test ${func.name} with large input`,
    });

    return tests;
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
