/**
 * Tests for AutoFixer class
 */

import { describe, it, expect, vi } from 'vitest';
import { AutoFixer } from '../src/auto-fixer.js';

describe('AutoFixer', () => {
  describe('generateFixes', () => {
    it('should return empty result for empty code', async () => {
      const fixer = new AutoFixer();
      const result = await fixer.generateFixes('', 'test.ts');

      expect(result.fixes).toHaveLength(0);
      expect(result.fixedCode).toBe('');
      expect(result.summary.total).toBe(0);
    });

    it('should return empty result for whitespace-only code', async () => {
      const fixer = new AutoFixer();
      const result = await fixer.generateFixes('   \n  \n   ', 'test.ts');

      expect(result.fixes).toHaveLength(0);
      expect(result.summary.total).toBe(0);
    });

    it('should handle valid TypeScript code', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { foo } from 'bar';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      expect(result).toBeDefined();
      expect(result.fixedCode).toBeDefined();
    });

    it('should detect unused imports', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { unused } from 'some-module';

        export function test() {
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      expect(result.fixes.some(f => f.type === 'unused-import')).toBe(true);
    });

    it('should detect console.log statements', async () => {
      const fixer = new AutoFixer();
      const code = `
        export function test() {
          console.log('debug');
          return 'hello';
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      expect(result.fixes.some(f => f.type === 'console-log')).toBe(true);
    });

    it('should handle syntax errors gracefully', async () => {
      const fixer = new AutoFixer();
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const code = `
        function broken( {
          return
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      expect(result.fixes).toHaveLength(0);
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('should count safe and review-required fixes', async () => {
      const fixer = new AutoFixer();
      const code = `
        import { unused } from 'foo';
        console.log('test');

        export function test() {
          const x = obj.property;
          return x;
        }
      `;
      const result = await fixer.generateFixes(code, 'test.ts');

      expect(result.summary.total).toBe(result.summary.safe + result.summary.requiresReview);
    });
  });

  describe('generateDiff', () => {
    it('should generate diff string for fixes', () => {
      const fixer = new AutoFixer();
      const fixes = [
        {
          type: 'console-log' as const,
          description: 'Remove console.log',
          line: 5,
          oldCode: "console.log('test');",
          newCode: '',
          confidence: 100,
          safe: true,
          impact: 'low' as const,
        },
      ];

      const diff = fixer.generateDiff(fixes);

      expect(diff).toContain('Line 5');
      expect(diff).toContain('Remove console.log');
      expect(diff).toContain("- console.log('test');");
    });

    it('should include replacement in diff when newCode is not empty', () => {
      const fixer = new AutoFixer();
      const fixes = [
        {
          type: 'null-check' as const,
          description: 'Add optional chaining',
          line: 10,
          oldCode: 'obj.prop',
          newCode: 'obj?.prop',
          confidence: 80,
          safe: false,
          impact: 'medium' as const,
        },
      ];

      const diff = fixer.generateDiff(fixes);

      expect(diff).toContain('- obj.prop');
      expect(diff).toContain('+ obj?.prop');
    });

    it('should handle empty fixes array', () => {
      const fixer = new AutoFixer();
      const diff = fixer.generateDiff([]);

      expect(diff).toBe('');
    });

    it('should format multiple fixes', () => {
      const fixer = new AutoFixer();
      const fixes = [
        {
          type: 'console-log' as const,
          description: 'Remove console.log 1',
          line: 5,
          oldCode: "console.log('a');",
          newCode: '',
          confidence: 100,
          safe: true,
          impact: 'low' as const,
        },
        {
          type: 'console-log' as const,
          description: 'Remove console.log 2',
          line: 10,
          oldCode: "console.log('b');",
          newCode: '',
          confidence: 100,
          safe: true,
          impact: 'low' as const,
        },
      ];

      const diff = fixer.generateDiff(fixes);

      expect(diff).toContain('Line 5');
      expect(diff).toContain('Line 10');
    });
  });
});
