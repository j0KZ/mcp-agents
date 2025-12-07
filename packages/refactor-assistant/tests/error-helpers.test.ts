/**
 * Tests for error-helpers utilities
 */

import { describe, it, expect } from 'vitest';
import { getErrorMessage, createFailedResult } from '../src/utils/error-helpers.js';

describe('getErrorMessage', () => {
  it('should return error message when error is an Error instance', () => {
    const error = new Error('Something went wrong');
    const result = getErrorMessage(error, 'Default message');

    expect(result).toBe('Something went wrong');
  });

  it('should return default message when error is not an Error instance', () => {
    const error = 'string error';
    const result = getErrorMessage(error, 'Default message');

    expect(result).toBe('Default message');
  });

  it('should return default message when error is null', () => {
    const result = getErrorMessage(null, 'Default message');

    expect(result).toBe('Default message');
  });

  it('should return default message when error is undefined', () => {
    const result = getErrorMessage(undefined, 'Default message');

    expect(result).toBe('Default message');
  });

  it('should return default message when error is a number', () => {
    const result = getErrorMessage(42, 'Default message');

    expect(result).toBe('Default message');
  });

  it('should return default message when error is an object (not Error)', () => {
    const result = getErrorMessage({ code: 500 }, 'Default message');

    expect(result).toBe('Default message');
  });

  it('should handle Error subclasses', () => {
    const error = new TypeError('Type error occurred');
    const result = getErrorMessage(error, 'Default message');

    expect(result).toBe('Type error occurred');
  });

  it('should handle Error with empty message', () => {
    const error = new Error('');
    const result = getErrorMessage(error, 'Default message');

    expect(result).toBe('');
  });
});

describe('createFailedResult', () => {
  it('should create failed result with string error', () => {
    const code = 'const x = 1;';
    const error = 'Parsing failed';

    const result = createFailedResult(code, error);

    expect(result).toEqual({
      code: 'const x = 1;',
      changes: [],
      success: false,
      error: 'Parsing failed',
    });
  });

  it('should create failed result with Error object', () => {
    const code = 'const x = 1;';
    const error = new Error('Something went wrong');

    const result = createFailedResult(code, error);

    expect(result).toEqual({
      code: 'const x = 1;',
      changes: [],
      success: false,
      error: 'Something went wrong',
    });
  });

  it('should preserve original code in result', () => {
    const code = `function test() {
  return true;
}`;
    const result = createFailedResult(code, 'Error');

    expect(result.code).toBe(code);
  });

  it('should always return empty changes array', () => {
    const result = createFailedResult('code', 'error');

    expect(result.changes).toEqual([]);
    expect(Array.isArray(result.changes)).toBe(true);
    expect(result.changes.length).toBe(0);
  });

  it('should always set success to false', () => {
    const result = createFailedResult('code', 'error');

    expect(result.success).toBe(false);
  });

  it('should handle empty code string', () => {
    const result = createFailedResult('', 'Empty code error');

    expect(result.code).toBe('');
    expect(result.error).toBe('Empty code error');
  });

  it('should handle Error subclass', () => {
    const error = new TypeError('Invalid type');
    const result = createFailedResult('code', error);

    expect(result.error).toBe('Invalid type');
  });

  it('should handle Error with empty message', () => {
    const error = new Error('');
    const result = createFailedResult('code', error);

    expect(result.error).toBe('');
  });

  it('should return correct type structure', () => {
    const result = createFailedResult('code', 'error');

    // Verify the structure matches the return type
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('changes');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('error');
    expect(typeof result.code).toBe('string');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.error).toBe('string');
  });
});
