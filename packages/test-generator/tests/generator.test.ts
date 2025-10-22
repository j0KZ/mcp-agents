import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestGenerator } from '../src/generator.js';
import { readFile } from 'fs/promises';

// Mock fs/promises
vi.mock('fs/promises');

describe('TestGenerator', () => {
  let generator: TestGenerator;

  beforeEach(() => {
    generator = new TestGenerator();
    vi.clearAllMocks();
  });

  describe('generateTests', () => {
    it('should throw error for invalid file path', async () => {
      await expect(generator.generateTests('', {})).rejects.toThrow('TEST_GEN_001');
      await expect(generator.generateTests(null as any, {})).rejects.toThrow('TEST_GEN_001');
      await expect(generator.generateTests(undefined as any, {})).rejects.toThrow('TEST_GEN_001');
    });

    it('should throw error for unsupported framework', async () => {
      await expect(
        generator.generateTests('/test.ts', { framework: 'invalid' as any })
      ).rejects.toThrow('TEST_GEN_002');
    });

    it('should handle file read errors', async () => {
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

      await expect(generator.generateTests('/nonexistent.ts')).rejects.toThrow('TEST_GEN_005');
    });

    it('should handle empty files', async () => {
      vi.mocked(readFile).mockResolvedValue('');

      await expect(generator.generateTests('/empty.ts')).rejects.toThrow('TEST_GEN_006');
    });

    it('should handle files exceeding size limit', async () => {
      const largeContent = 'x'.repeat(200 * 1024); // 200KB
      vi.mocked(readFile).mockResolvedValue(largeContent);

      await expect(generator.generateTests('/large.ts')).rejects.toThrow('TEST_GEN_008');
    });

    it('should generate tests for valid TypeScript file', async () => {
      const validCode = `
        export function add(a: number, b: number): number {
          return a + b;
        }

        export class Calculator {
          multiply(x: number, y: number): number {
            return x * y;
          }
        }
      `;

      vi.mocked(readFile).mockResolvedValue(validCode);

      const result = await generator.generateTests('/valid.ts', {
        framework: 'vitest',
        includeEdgeCases: true,
        includeErrorCases: true,
      });

      expect(result.success).toBe(true);
      expect(result.suite).toBeDefined();
      expect(result.suite?.tests.length).toBeGreaterThan(0);
      expect(result.code).toContain('describe');
      expect(result.code).toContain('it(');
      expect(result.code).toContain('expect');
    });

    it('should support different test frameworks', async () => {
      const code = 'export function test() { return true; }';
      vi.mocked(readFile).mockResolvedValue(code);

      const frameworks: Array<'jest' | 'vitest' | 'mocha' | 'ava'> = [
        'jest',
        'vitest',
        'mocha',
        'ava',
      ];

      for (const framework of frameworks) {
        const result = await generator.generateTests('/test.ts', { framework });
        expect(result.success).toBe(true);

        if (framework === 'mocha') {
          expect(result.code).toContain('chai');
        } else if (framework === 'ava') {
          expect(result.code).toContain('test(');
        }
      }
    });

    it('should include edge cases when configured', async () => {
      const code = `
        export function divide(a: number, b: number): number {
          if (b === 0) throw new Error('Division by zero');
          return a / b;
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/divide.ts', {
        includeEdgeCases: true,
        includeErrorCases: true,
      });

      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code.length).toBeGreaterThan(0);
    });

    it('should calculate coverage score correctly', async () => {
      const code = `
        export function fn1() { return 1; }
        export function fn2() { return 2; }
        export function fn3() { return 3; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/multi.ts', {
        coverage: 100,
      });

      expect(result.coverage).toBeDefined();
      expect(result.coverage?.percentage).toBeGreaterThan(0);
      expect(result.suite?.tests.length).toBeGreaterThan(0);
    });

    it('should handle functions with parameters', async () => {
      const code = `
        export function greet(name: string, age: number): string {
          return \`Hello \${name}, you are \${age} years old\`;
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/greet.ts');

      expect(result.success).toBe(true);
      expect(result.code).toContain('greet');
    });

    it('should handle async functions', async () => {
      const code = `
        export async function fetchData(url: string): Promise<any> {
          const response = await fetch(url);
          return response.json();
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/async.ts');

      expect(result.success).toBe(true);
      expect(result.code).toContain('async');
    });

    it('should handle arrow functions', async () => {
      const code = `
        export const sum = (a: number, b: number): number => a + b;
        export const multiply = (x: number, y: number) => x * y;
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/arrows.ts');

      expect(result.success).toBe(true);
    });

    it('should handle classes with methods', async () => {
      const code = `
        export class UserService {
          getUser(id: string) { return { id, name: 'Test' }; }
          deleteUser(id: string) { return true; }
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/service.ts', {
        framework: 'vitest',
      });

      expect(result.success).toBe(true);
      expect(result.code).toContain('UserService');
      expect(result.code).toContain('getUser');
    });

    it('should include total test count', async () => {
      const code = `
        export function fn1() {}
        export function fn2() {}
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/count.ts');

      expect(result.totalTests).toBeDefined();
      expect(result.totalTests).toBeGreaterThan(0);
    });

    it('should generate test file path correctly', async () => {
      const code = 'export function test() {}';
      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/src/utils.ts', {
        framework: 'vitest',
      });

      expect(result.testFile).toBeDefined();
      expect(result.testFile).toContain('test');
    });

    it('should support coverage target configuration', async () => {
      const code = `
        export function calc(a: number, b: number) { return a + b; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/calc.ts', {
        coverage: 90,
      });

      expect(result.estimatedCoverage).toBeDefined();
    });

    it('should handle interfaces and types gracefully', async () => {
      const code = `
        export interface User { id: string; name: string; }
        export type UserID = string;
        export function getUser(id: UserID): User { return { id, name: 'Test' }; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/types.ts');

      expect(result.success).toBe(true);
      expect(result.code).toContain('getUser');
    });

    it('should handle default parameters', async () => {
      const code = `
        export function greet(name: string = 'World') {
          return \`Hello, \${name}\`;
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/defaults.ts');

      expect(result.success).toBe(true);
    });

    it('should handle rest parameters', async () => {
      const code = `
        export function sum(...numbers: number[]): number {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/rest.ts');

      expect(result.success).toBe(true);
    });

    it('should handle generic functions', async () => {
      const code = `
        export function identity<T>(value: T): T {
          return value;
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/generic.ts');

      expect(result.success).toBe(true);
    });

    it('should include suites in result', async () => {
      const code = `
        export function add(a: number, b: number) { return a + b; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/add.ts');

      expect(result.suites).toBeDefined();
      expect(Array.isArray(result.suites)).toBe(true);
      expect(result.suites.length).toBeGreaterThan(0);
    });

    it('should track functions and classes count', async () => {
      const code = `
        export function fn() {}
        export class MyClass {}
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/mixed.ts');

      expect(result.coverage?.functions).toBeDefined();
      expect(result.coverage?.classes).toBeDefined();
    });

    it('should handle export default', async () => {
      const code = `
        export default function main() {
          return 'hello';
        }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/default.ts');

      expect(result.success).toBe(true);
    });

    it('should handle named exports', async () => {
      const code = `
        function helper() { return 1; }
        export { helper };
        export { helper as utilHelper };
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/exports.ts');

      expect(result.success).toBe(true);
    });

    it('should not include edge cases when disabled', async () => {
      const code = `
        export function divide(a: number, b: number) { return a / b; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const resultWith = await generator.generateTests('/div1.ts', {
        includeEdgeCases: true,
      });

      const resultWithout = await generator.generateTests('/div2.ts', {
        includeEdgeCases: false,
      });

      expect(resultWith.totalTests).toBeGreaterThanOrEqual(resultWithout.totalTests);
    });
  });
});
