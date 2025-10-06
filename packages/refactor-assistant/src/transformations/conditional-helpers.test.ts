import { describe, it, expect } from 'vitest';
import { applyGuardClauses, combineNestedConditions } from './conditional-helpers.js';

describe('Conditional Helpers', () => {
  describe('applyGuardClauses', () => {
    it('should convert if-else to guard clause', () => {
      const code = `if (user) { doSomething(); } else { return; }`;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (!(user))');
      expect(result.code).toContain('return;');
      expect(result.code).toContain('doSomething()');
    });

    it('should convert if-else with return value to guard clause', () => {
      const code = `if (isValid) { processData(); } else { return null; }`;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (!(isValid))');
      expect(result.code).toContain('return null;');
      expect(result.code).toContain('processData()');
    });

    it('should handle guard clause with complex return value', () => {
      const code = `if (data) { process(); } else { return { error: 'missing' }; }`;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain("return { error: 'missing' };");
    });

    it('should not change code without matching pattern', () => {
      const code = `if (x) { console.log('test'); }`;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(false);
      expect(result.code).toBe(code);
    });

    it('should handle multiple guard clause opportunities', () => {
      const code = `
if (a) { doA(); } else { return; }
if (b) { doB(); } else { return; }
      `;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (!(a))');
      expect(result.code).toContain('if (!(b))');
    });

    it('should handle code with no else clause', () => {
      const code = `if (condition) { execute(); }`;
      const result = applyGuardClauses(code);

      expect(result.changed).toBe(false);
      expect(result.code).toBe(code);
    });
  });

  describe('combineNestedConditions', () => {
    it('should combine nested if statements', () => {
      const code = `if (a) { if (b) { execute(); } }`;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (a && b)');
      expect(result.code).toContain('execute()');
    });

    it('should handle multiple nested conditions', () => {
      const code = `
if (x) { if (y) { doXY(); } }
if (a) { if (b) { doAB(); } }
      `;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (x && y)');
      expect(result.code).toContain('if (a && b)');
    });

    it('should handle nested conditions with complex bodies', () => {
      const code = `if (isValid) { if (hasPermission) { processRequest(); updateLog(); } }`;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('if (isValid && hasPermission)');
      expect(result.code).toContain('processRequest()');
      expect(result.code).toContain('updateLog()');
    });

    it('should not change code without nested conditions', () => {
      const code = `if (condition) { execute(); }`;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(false);
      expect(result.code).toBe(code);
    });

    it('should handle empty result when no pattern matches', () => {
      const code = `const x = 1; const y = 2;`;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(false);
      expect(result.code).toBe(code);
    });

    it('should preserve spacing in combined conditions', () => {
      const code = `if (user.isActive) { if (user.hasAccess) { grantPermission(); } }`;
      const result = combineNestedConditions(code);

      expect(result.changed).toBe(true);
      expect(result.code).toContain('user.isActive && user.hasAccess');
    });
  });

  describe('Integration', () => {
    it('should work together on complex code', () => {
      const code = `if (user) { if (user.active) { process(); } }`;

      // Combine nested conditions first
      const result = combineNestedConditions(code);
      expect(result.changed).toBe(true);
      expect(result.code).toContain('user && user.active');

      // Result should be defined and valid
      expect(result.code).toBeDefined();
    });
  });
});
