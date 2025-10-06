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
        includeErrorCases: true
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

      const frameworks: Array<'jest' | 'vitest' | 'mocha' | 'ava'> = ['jest', 'vitest', 'mocha', 'ava'];

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
        includeErrorCases: true
      });

      expect(result.code).toContain('zero');
      expect(result.code).toContain('Error');
      expect(result.code).toContain('throw');
    });

    it('should calculate coverage score correctly', async () => {
      const code = `
        export function fn1() { return 1; }
        export function fn2() { return 2; }
        export function fn3() { return 3; }
      `;

      vi.mocked(readFile).mockResolvedValue(code);

      const result = await generator.generateTests('/multi.ts', {
        coverage: 100
      });

      expect(result.coverage).toBeDefined();
      expect(result.coverage?.percentage).toBeGreaterThan(0);
      expect(result.suite?.tests.length).toBeGreaterThanOrEqual(3);
    });
  });

});