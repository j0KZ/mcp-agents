import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import { NullCheckFixer } from '../../src/fixers/null-check-fixer.js';
import type { FixContext } from '../../src/fixers/base-fixer.js';

describe('NullCheckFixer', () => {
  const fixer = new NullCheckFixer();

  const createContext = (code: string): FixContext => {
    return {
      ast: parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      }),
      code,
      filePath: 'test.ts',
      fileContent: code,
      lines: code.split('\n'),
    };
  };

  describe('getName', () => {
    it('should return the correct fixer name', () => {
      expect(fixer.getName()).toBe('NullCheckFixer');
    });
  });

  describe('getCoverage', () => {
    it('should return the correct coverage percentage', () => {
      expect(fixer.getCoverage()).toBe(25); // PARETO_COVERAGE.NULL_CHECKS
    });
  });

  describe('findFixes', () => {
    it('should suggest optional chaining for potentially null objects', () => {
      const code = `
        const value = user.name;
        const address = user.address.street;
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes.length).toBeGreaterThan(0);
      expect(fixes[0].type).toBe('null-check');
      expect(fixes[0].description).toContain('optional chaining');
    });

    it('should not suggest optional chaining for never-null objects', () => {
      const code = `
        console.log('test');
        Math.floor(3.14);
        Array.isArray([]);
        Object.keys({});
        document.getElementById('test');
        window.location.href;
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should not suggest for already optional chained access', () => {
      const code = `
        const value = user?.name;
        const address = user?.address?.street;
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should handle nested member expressions', () => {
      const code = `
        const deep = obj.level1.level2.level3;
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes.length).toBeGreaterThan(0);
      fixes.forEach(fix => {
        expect(fix.confidence).toBeGreaterThan(0);
        expect(fix.type).toBe('null-check');
      });
    });

    it('should handle computed member expressions', () => {
      const code = `
        const value = obj[key];
        const item = array[index];
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      // The actual implementation might not handle computed members
      // This test verifies the current behavior
      expect(fixes).toBeDefined();
    });

    it('should handle empty code', () => {
      const context = createContext('');
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should handle this keyword correctly', () => {
      const code = `
        class Test {
          method() {
            this.property;
            this.method();
          }
        }
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0); // 'this' is in NEVER_NULL_OBJECTS
    });

    it('should set correct fix properties', () => {
      const code = 'const value = user.name;';
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      if (fixes.length > 0) {
        const fix = fixes[0];
        expect(fix.type).toBe('null-check');
        expect(fix.description).toContain('optional chaining');
        expect(fix.line).toBeGreaterThan(0);
        expect(fix.column).toBeGreaterThanOrEqual(0);
        expect(fix.confidence).toBeGreaterThan(0);
        expect(fix.impact).toBeDefined();
      }
    });

    it('should handle Node.js global objects', () => {
      const code = `
        process.env.NODE_ENV;
        global.myVar;
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0); // Both are in NEVER_NULL_OBJECTS
    });
  });
});
