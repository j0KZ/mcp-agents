import { describe, it, expect } from 'vitest';
import * as parser from '@babel/parser';
import { ConsoleLogFixer } from '../../src/fixers/console-log-fixer.js';
import type { FixContext } from '../../src/fixers/base-fixer.js';

describe('ConsoleLogFixer', () => {
  const fixer = new ConsoleLogFixer();

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
      expect(fixer.getName()).toBe('ConsoleLogFixer');
    });
  });

  describe('getCoverage', () => {
    it('should return the correct coverage percentage', () => {
      expect(fixer.getCoverage()).toBe(15); // PARETO_COVERAGE.CONSOLE_LOGS
    });
  });

  describe('findFixes', () => {
    it('should find console.log statements', () => {
      const code = `
        console.log('test');
        const x = 1;
        console.error('error');
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(2);
      expect(fixes[0].type).toBe('console-log');
      expect(fixes[0].description).toBe('Remove console statement');
      expect(fixes[0].confidence).toBe(90); // HIGH confidence
    });

    it('should find console statements with various methods', () => {
      const code = `
        console.log('log');
        console.warn('warning');
        console.error('error');
        console.debug('debug');
        console.info('info');
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(5);
      fixes.forEach(fix => {
        expect(fix.type).toBe('console-log');
        expect(fix.newCode).toBe('');
        expect(fix.safe).toBe(true);
      });
    });

    it('should not find non-console calls', () => {
      const code = `
        myLogger.log('test');
        customConsole.log('test');
        log('test');
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should handle console statements in different contexts', () => {
      const code = `
        function test() {
          console.log('inside function');
        }

        if (true) {
          console.warn('inside if');
        }

        try {
          console.error('inside try');
        } catch {
          console.debug('inside catch');
        }
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(4);
      expect(fixes[0].line).toBe(3); // inside function
      expect(fixes[1].line).toBe(7); // inside if
      expect(fixes[2].line).toBe(11); // inside try
      expect(fixes[3].line).toBe(13); // inside catch
    });

    it('should handle empty code', () => {
      const context = createContext('');
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should handle code without console statements', () => {
      const code = `
        const x = 1;
        const y = 2;
        function add(a, b) {
          return a + b;
        }
      `;
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(0);
    });

    it('should set correct fix properties', () => {
      const code = 'console.log("test");';
      const context = createContext(code);
      const fixes = fixer.findFixes(context);

      expect(fixes).toHaveLength(1);
      const fix = fixes[0];
      expect(fix.type).toBe('console-log');
      expect(fix.description).toBe('Remove console statement');
      expect(fix.line).toBe(1);
      expect(fix.column).toBe(0);
      expect(fix.oldCode).toBe('console.log("test");');
      expect(fix.newCode).toBe('');
      expect(fix.confidence).toBe(90);
      expect(fix.safe).toBe(true);
      expect(fix.impact).toBe('medium');
    });
  });
});
