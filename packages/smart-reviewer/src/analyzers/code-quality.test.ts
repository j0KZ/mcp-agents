import { describe, it, expect } from 'vitest';
import { detectIssues } from './code-quality.js';

describe('detectIssues', () => {
  describe('var detection', () => {
    it('should detect var usage', async () => {
      const code = `var x = 5;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('warning');
      expect(issues[0].message).toContain('var');
      expect(issues[0].rule).toBe('no-var');
      expect(issues[0].fix?.newCode).toContain('const');
    });

    it('should not flag var in comments', async () => {
      const code = `// var is deprecated`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-var')).toHaveLength(0);
    });

    it('should not flag var in JSDoc', async () => {
      const code = `* @param var - some variable`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-var')).toHaveLength(0);
    });

    it('should provide fix suggestion for var', async () => {
      const code = `var count = 10;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues[0].fix).toBeDefined();
      expect(issues[0].fix?.description).toContain('const');
      expect(issues[0].fix?.oldCode).toBe(code);
    });
  });

  describe('console.log detection', () => {
    it('should detect console.log statements', async () => {
      const code = `console.log('debug');`;
      const issues = await detectIssues(code, 'test.ts');

      const consoleIssue = issues.find(i => i.rule === 'no-console');
      expect(consoleIssue).toBeDefined();
      expect(consoleIssue?.severity).toBe('info');
      expect(consoleIssue?.message).toContain('production');
    });

    it('should not flag console.log in string literals', async () => {
      const code = `const msg = "console.log('test')";`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-console')).toHaveLength(0);
    });

    it('should not flag console.log in comments', async () => {
      const code = `// console.log for debugging`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-console')).toHaveLength(0);
    });

    it('should provide fix suggestion for console.log', async () => {
      const code = `console.log('test');`;
      const issues = await detectIssues(code, 'test.ts');

      const consoleIssue = issues.find(i => i.rule === 'no-console');
      expect(consoleIssue?.fix).toBeDefined();
      expect(consoleIssue?.fix?.newCode).toBe('');
    });
  });

  describe('TODO/FIXME detection', () => {
    it('should detect TODO comments', async () => {
      const code = `// TODO implement feature`;
      const issues = await detectIssues(code, 'test.ts');

      const todoIssue = issues.find(i => i.rule === 'no-todo');
      expect(todoIssue).toBeDefined();
      expect(todoIssue?.severity).toBe('info');
    });
  });

  describe('line length detection', () => {
    it('should detect long lines', async () => {
      const code = `const veryLongVariableName = ${'x'.repeat(150)};`;
      const issues = await detectIssues(code, 'test.ts');

      const longLineIssue = issues.find(i => i.rule === 'max-line-length');
      expect(longLineIssue).toBeDefined();
      expect(longLineIssue?.severity).toBe('info');
      expect(longLineIssue?.message).toContain('too long');
    });

    it('should not flag short lines', async () => {
      const code = `const x = 5;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'max-line-length')).toHaveLength(0);
    });
  });

  describe('multiple blank lines detection', () => {
    it('should detect multiple consecutive blank lines', async () => {
      const code = `const x = 1;\n\n\nconst y = 2;`;
      const issues = await detectIssues(code, 'test.ts');

      const blankLineIssue = issues.find(i => i.rule === 'no-multiple-empty-lines');
      expect(blankLineIssue).toBeDefined();
      expect(blankLineIssue?.severity).toBe('info');
    });

    it('should not flag single blank lines', async () => {
      const code = `const x = 1;\n\nconst y = 2;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-multiple-empty-lines')).toHaveLength(0);
    });
  });

  describe('equality operator detection', () => {
    it('should detect == instead of ===', async () => {
      const code = `if (x == y) {}`;
      const issues = await detectIssues(code, 'test.ts');

      const eqIssue = issues.find(i => i.rule === 'eqeqeq');
      expect(eqIssue).toBeDefined();
      expect(eqIssue?.severity).toBe('warning');
      expect(eqIssue?.fix?.newCode).toContain('===');
    });

    it('should not flag === comparisons', async () => {
      const code = `if (x === y) {}`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'eqeqeq')).toHaveLength(0);
    });

    it('should not flag != comparisons', async () => {
      const code = `if (x != y) {}`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'eqeqeq')).toHaveLength(0);
    });
  });

  describe('function parameter detection', () => {
    it('should detect functions with too many parameters', async () => {
      const code = `function test(a, b, c, d, e, f) {}`;
      const issues = await detectIssues(code, 'test.ts');

      const paramIssue = issues.find(i => i.rule === 'max-params');
      expect(paramIssue).toBeDefined();
      expect(paramIssue?.severity).toBe('warning');
      expect(paramIssue?.message).toContain('6');
    });

    it('should not flag functions with 5 or fewer parameters', async () => {
      const code = `function test(a, b, c, d, e) {}`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'max-params')).toHaveLength(0);
    });

    it('should suggest using options object', async () => {
      const code = `function test(a, b, c, d, e, f, g) {}`;
      const issues = await detectIssues(code, 'test.ts');

      const paramIssue = issues.find(i => i.rule === 'max-params');
      expect(paramIssue?.message).toContain('options object');
    });
  });

  describe('magic number detection', () => {
    it('should detect magic numbers', async () => {
      const code = `const timeout = 5000;`;
      const issues = await detectIssues(code, 'test.ts');

      const magicIssue = issues.find(i => i.rule === 'no-magic-numbers');
      expect(magicIssue).toBeDefined();
      expect(magicIssue?.severity).toBe('info');
      expect(magicIssue?.message).toContain('constant');
    });

    it('should not flag single-digit numbers', async () => {
      const code = `const count = 5;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-magic-numbers')).toHaveLength(0);
    });

    it('should not flag numbers in comments', async () => {
      const code = `// timeout is 5000ms`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-magic-numbers')).toHaveLength(0);
    });
  });

  describe('empty catch block detection', () => {
    it('should detect empty catch blocks', async () => {
      const code = `try { } catch(e) {\n}`;
      const issues = await detectIssues(code, 'test.ts');

      const catchIssue = issues.find(i => i.rule === 'no-empty-catch');
      expect(catchIssue).toBeDefined();
      expect(catchIssue?.severity).toBe('error');
      expect(catchIssue?.message).toContain('Handle errors');
    });

    it('should not flag non-empty catch blocks', async () => {
      const code = `try { } catch(e) {\n  console.error(e);\n}`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-empty-catch')).toHaveLength(0);
    });

    it('should not flag catch in string templates', async () => {
      const code = 'const msg = `catch error`;';
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-empty-catch')).toHaveLength(0);
    });
  });

  describe('nested ternary detection', () => {
    it('should detect nested ternary operators', async () => {
      const code = `const x = a ? b : c ? d : e;`;
      const issues = await detectIssues(code, 'test.ts');

      const ternaryIssue = issues.find(i => i.rule === 'no-nested-ternary');
      expect(ternaryIssue).toBeDefined();
      expect(ternaryIssue?.severity).toBe('warning');
      expect(ternaryIssue?.message).toContain('readability');
    });

    it('should not flag simple ternary operators', async () => {
      const code = `const x = a ? b : c;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.filter(i => i.rule === 'no-nested-ternary')).toHaveLength(0);
    });
  });

  describe('multiple issues', () => {
    it('should detect multiple issues in the same code', async () => {
      const code = `var x = 10;\nvar y == x;`;
      const issues = await detectIssues(code, 'test.ts');

      expect(issues.length).toBeGreaterThan(1);
      expect(issues.some(i => i.rule === 'no-var')).toBe(true);
      expect(issues.some(i => i.rule === 'eqeqeq')).toBe(true);
    });

    it('should provide line numbers for all issues', async () => {
      const code = `var x = 10;\nconsole.log(x);`;
      const issues = await detectIssues(code, 'test.ts');

      issues.forEach(issue => {
        expect(issue.line).toBeGreaterThan(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty code', async () => {
      const issues = await detectIssues('', 'test.ts');
      expect(issues).toEqual([]);
    });

    it('should handle single line code', async () => {
      const code = `const x = 5;`;
      const issues = await detectIssues(code, 'test.ts');
      expect(issues).toEqual([]);
    });

    it('should handle code with only comments', async () => {
      const code = `// This is a comment\n/* Another comment */`;
      const issues = await detectIssues(code, 'test.ts');
      // Should only have no issues or just info level
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors).toHaveLength(0);
    });
  });
});
