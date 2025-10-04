import { describe, it, expect } from 'vitest';
import { getErrorMessage, createFailedResult } from './error-helpers.js';

describe('Error Helpers', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error object', () => {
      const error = new Error('Test error message');
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Test error message');
    });

    it('should return default message for string error', () => {
      const error = 'string error';
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Default message');
    });

    it('should return default message for number error', () => {
      const error = 42;
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Default message');
    });

    it('should return default message for null', () => {
      const error = null;
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Default message');
    });

    it('should return default message for undefined', () => {
      const error = undefined;
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Default message');
    });

    it('should return default message for object without message', () => {
      const error = { foo: 'bar' };
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Default message');
    });

    it('should handle TypeError instances', () => {
      const error = new TypeError('Type error occurred');
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Type error occurred');
    });

    it('should handle ReferenceError instances', () => {
      const error = new ReferenceError('Reference error occurred');
      const result = getErrorMessage(error, 'Default message');

      expect(result).toBe('Reference error occurred');
    });
  });

  describe('createFailedResult', () => {
    it('should create failed result with string error', () => {
      const code = 'const x = 1;';
      const error = 'Something went wrong';
      const result = createFailedResult(code, error);

      expect(result.success).toBe(false);
      expect(result.code).toBe(code);
      expect(result.error).toBe(error);
      expect(result.changes).toEqual([]);
    });

    it('should create failed result with Error object', () => {
      const code = 'const x = 1;';
      const error = new Error('Error object message');
      const result = createFailedResult(code, error);

      expect(result.success).toBe(false);
      expect(result.code).toBe(code);
      expect(result.error).toBe('Error object message');
      expect(result.changes).toEqual([]);
    });

    it('should preserve original code', () => {
      const code = 'const x = 1;\nconst y = 2;';
      const result = createFailedResult(code, 'Error');

      expect(result.code).toBe(code);
    });

    it('should always have empty changes array', () => {
      const result1 = createFailedResult('code', 'error');
      const result2 = createFailedResult('other code', new Error('error'));

      expect(result1.changes).toEqual([]);
      expect(result2.changes).toEqual([]);
      expect(result1.changes.length).toBe(0);
      expect(result2.changes.length).toBe(0);
    });

    it('should handle TypeError as Error object', () => {
      const code = 'const x = 1;';
      const error = new TypeError('Type mismatch');
      const result = createFailedResult(code, error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Type mismatch');
    });

    it('should handle empty error message', () => {
      const code = 'const x = 1;';
      const error = '';
      const result = createFailedResult(code, error);

      expect(result.success).toBe(false);
      expect(result.error).toBe('');
    });

    it('should handle multiline code', () => {
      const code = `function test() {
  console.log('test');
  return true;
}`;
      const result = createFailedResult(code, 'Parse error');

      expect(result.code).toBe(code);
      expect(result.error).toBe('Parse error');
    });
  });

  describe('Integration', () => {
    it('should work together in error handling flow', () => {
      const originalCode = 'const x = 1;';

      try {
        throw new Error('Refactoring failed');
      } catch (error) {
        const message = getErrorMessage(error, 'Unknown error');
        const result = createFailedResult(originalCode, message);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Refactoring failed');
        expect(result.code).toBe(originalCode);
      }
    });

    it('should handle unknown error types in flow', () => {
      const originalCode = 'const x = 1;';

      try {
        throw 'string error';
      } catch (error) {
        const message = getErrorMessage(error, 'Unknown error occurred');
        const result = createFailedResult(originalCode, message);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Unknown error occurred');
        expect(result.code).toBe(originalCode);
      }
    });
  });
});
