import { describe, it, expect } from 'vitest';
import { extractFunction, convertToAsync, simplifyConditionals, renameVariable } from './refactorer.js';
describe('Refactor Assistant', () => {
    it('should extract function', () => {
        const code = `
      const a = 1;
      const b = 2;
      const c = a + b;
    `;
        const result = extractFunction(code, {
            functionName: 'add',
            startLine: 3,
            endLine: 3
        });
        expect(result.success).toBe(true);
        expect(result.code).toContain('function add');
    });
    it('should convert to async', () => {
        const code = `
      function fetchData(callback) {
        getData((err, result) => {
          callback(result);
        });
      }
    `;
        const result = convertToAsync(code);
        expect(result.success).toBe(true);
        expect(result.code).toContain('async');
    });
    it('should simplify conditionals', () => {
        const code = `
      if (x > 0) {
        if (y > 0) {
          return true;
        }
      }
      return false;
    `;
        const result = simplifyConditionals(code);
        expect(result.success).toBe(true);
    });
    it('should rename variable', () => {
        const code = 'const oldName = 5; console.log(oldName);';
        const result = renameVariable(code, { oldName: 'oldName', newName: 'newName' });
        expect(result.success).toBe(true);
        expect(result.code).toContain('newName');
        expect(result.code).not.toContain('oldName');
    });
});
//# sourceMappingURL=refactorer.test.js.map