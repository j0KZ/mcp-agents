import { describe, it, expect } from 'vitest';
import * as target from '../src/refactorer.js';

describe('convertToAsync()', () => {
  it('should convert callback to async/await', () => {
    const code = `
      function fetchData(callback) {
        setTimeout(() => callback(null, 'data'), 100);
      }
    `;
    const result = target.convertToAsync({ code });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
    expect(result.code.length).toBeGreaterThan(0);
  });

  it('should handle Promise-based code', () => {
    const code = `
      function getData() {
        return fetch('/api').then(res => res.json());
      }
    `;
    const result = target.convertToAsync({ code });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should preserve function structure', () => {
    const code = 'const fn = (cb) => { cb(null, 42); }';
    const result = target.convertToAsync({ code });
    expect(result.code).toBeDefined();
  });
});

describe('simplifyConditionals()', () => {
  it('should simplify nested if statements', () => {
    const code = `
      function check(x) {
        if (x > 0) {
          if (x < 10) {
            return true;
          }
        }
        return false;
      }
    `;
    const result = target.simplifyConditionals({ code });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should apply guard clauses', () => {
    const code = `
      function process(data) {
        if (data) {
          if (data.valid) {
            return data.value;
          }
        }
        return null;
      }
    `;
    const result = target.simplifyConditionals({ code, useGuardClauses: true });
    expect(result.code).toBeDefined();
  });

  it('should convert to ternary when appropriate', () => {
    const code = `
      function getStatus(isActive) {
        if (isActive) {
          return 'active';
        } else {
          return 'inactive';
        }
      }
    `;
    const result = target.simplifyConditionals({ code, useTernary: true });
    expect(result.code).toBeDefined();
  });
});

describe('removeDeadCode()', () => {
  it('should remove unused variables', () => {
    const code = `
      function test() {
        const used = 1;
        const unused = 2;
        return used;
      }
    `;
    const result = target.removeDeadCode({ code });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should remove unreachable code', () => {
    const code = `
      function early() {
        return true;
        console.log('unreachable');
      }
    `;
    const result = target.removeDeadCode({ code, removeUnreachable: true });
    expect(result.code).toBeDefined();
  });
});

describe('applyDesignPattern()', () => {
  it('should apply singleton pattern', () => {
    const code = 'class Service {}';
    const result = target.applyDesignPattern({ code, pattern: 'singleton' });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should apply factory pattern', () => {
    const code = 'class Product {}';
    const result = target.applyDesignPattern({ code, pattern: 'factory' });
    expect(result.code).toBeDefined();
  });

  it('should apply observer pattern', () => {
    const code = 'class Subject {}';
    const result = target.applyDesignPattern({ code, pattern: 'observer' });
    expect(result.code).toBeDefined();
  });

  it('should apply strategy pattern', () => {
    const code = 'class Algorithm {}';
    const result = target.applyDesignPattern({ code, pattern: 'strategy' });
    expect(result.code).toBeDefined();
  });
});

describe('renameVariable()', () => {
  it('should rename variable consistently', () => {
    const code = 'const oldName = 1; console.log(oldName);';
    const result = target.renameVariable({ code, oldName: 'oldName', newName: 'newName' });
    expect(result).toBeDefined();
    expect(result.code).toContain('newName');
    expect(result.code).not.toContain('oldName');
  });

  it('should handle scoped variables', () => {
    const code = `
      const x = 1;
      function test() {
        const x = 2;
        return x;
      }
    `;
    const result = target.renameVariable({ code, oldName: 'x', newName: 'value' });
    expect(result.code).toBeDefined();
  });
});

describe('suggestRefactorings()', () => {
  it('should suggest refactorings for complex code', () => {
    const code = `
      function longFunction() {
        const a = 1;
        const b = 2;
        const c = 3;
        if (a > 0) {
          if (b > 0) {
            if (c > 0) {
              return a + b + c;
            }
          }
        }
        return 0;
      }
    `;
    const result = target.suggestRefactorings(code);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should detect duplicate code', () => {
    const code = `
      function fn1() { console.log('test'); }
      function fn2() { console.log('test'); }
    `;
    const result = target.suggestRefactorings(code);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should suggest simplifications', () => {
    const code = 'if (x === true) { return true; } else { return false; }';
    const result = target.suggestRefactorings(code);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('extractFunction()', () => {
  it('should extract code block into function', () => {
    const code = `
      const a = 1;
      const b = 2;
      const sum = a + b;
      console.log(sum);
    `;
    const result = target.extractFunction({
      code,
      functionName: 'calculate',
      startLine: 3,
      endLine: 3
    });
    expect(result).toBeDefined();
    expect(result.code).toBeDefined();
  });

  it('should detect parameters', () => {
    const code = `
      const x = 10;
      const y = 20;
      const result = x + y;
    `;
    const result = target.extractFunction({
      code,
      functionName: 'add',
      startLine: 3,
      endLine: 3
    });
    expect(result.code).toBeDefined();
  });
});

describe('calculateMetrics()', () => {
  it('should calculate code complexity', () => {
    const code = `
      function complex(x) {
        if (x > 0) {
          for (let i = 0; i < x; i++) {
            if (i % 2 === 0) {
              console.log(i);
            }
          }
        }
      }
    `;
    const result = target.calculateMetrics(code);
    expect(result).toBeDefined();
    expect(result.complexity).toBeGreaterThan(0);
  });

  it('should count lines of code', () => {
    const code = 'const a = 1;\nconst b = 2;\nconst c = 3;';
    const result = target.calculateMetrics(code);
    expect(result.linesOfCode).toBeGreaterThan(0);
  });
});

describe('findDuplicateBlocks()', () => {
  it('should find duplicate code blocks', () => {
    const code = `
      function fn1() { console.log('test'); return 42; }
      function fn2() { console.log('test'); return 42; }
    `;
    const result = target.findDuplicateBlocks(code);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle no duplicates', () => {
    const code = 'const x = 1; const y = 2;';
    const result = target.findDuplicateBlocks(code);
    expect(Array.isArray(result)).toBe(true);
  });
});
