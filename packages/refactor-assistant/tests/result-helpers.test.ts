/**
 * Tests for result-helpers utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createSuccessResult,
  createErrorResult,
  createValidationError,
  validateCodeSize,
  createSingleChangeResult,
} from '../src/utils/result-helpers.js';
import type { RefactoringChange } from '../src/types.js';

describe('createSuccessResult', () => {
  it('should create success result with changes', () => {
    const code = 'const x = 1;';
    const changes: RefactoringChange[] = [
      {
        type: 'variable',
        description: 'Renamed variable',
        before: 'const x = 1;',
        after: 'const y = 1;',
      },
    ];

    const result = createSuccessResult(code, changes);

    expect(result.success).toBe(true);
    expect(result.code).toBe(code);
    expect(result.changes).toEqual(changes);
    expect(result.warnings).toBeUndefined();
  });

  it('should add warning when no changes and warning message provided', () => {
    const code = 'const x = 1;';
    const changes: RefactoringChange[] = [];
    const warning = 'No changes were made';

    const result = createSuccessResult(code, changes, warning);

    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(['No changes were made']);
  });

  it('should not add warning when changes exist even if warning provided', () => {
    const code = 'const x = 1;';
    const changes: RefactoringChange[] = [
      { type: 'variable', description: 'Changed', before: 'a', after: 'b' },
    ];
    const warning = 'This should not appear';

    const result = createSuccessResult(code, changes, warning);

    expect(result.warnings).toBeUndefined();
  });

  it('should not add warning when no changes but no warning message', () => {
    const code = 'const x = 1;';
    const changes: RefactoringChange[] = [];

    const result = createSuccessResult(code, changes);

    expect(result.warnings).toBeUndefined();
  });

  it('should handle empty code string', () => {
    const result = createSuccessResult('', []);

    expect(result.code).toBe('');
    expect(result.success).toBe(true);
  });
});

describe('createErrorResult', () => {
  it('should create error result from Error object', () => {
    const code = 'const x = 1;';
    const error = new Error('Something went wrong');

    const result = createErrorResult(code, error, 'Default error');

    expect(result.success).toBe(false);
    expect(result.code).toBe(code);
    expect(result.changes).toEqual([]);
    expect(result.error).toBe('Something went wrong');
  });

  it('should use default message when error is not an Error instance', () => {
    const code = 'const x = 1;';
    const error = 'string error';

    const result = createErrorResult(code, error, 'Default error message');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Default error message');
  });

  it('should preserve original code', () => {
    const code = `function test() {
  return true;
}`;
    const result = createErrorResult(code, null, 'Error');

    expect(result.code).toBe(code);
  });

  it('should handle null error', () => {
    const result = createErrorResult('code', null, 'Null error occurred');

    expect(result.error).toBe('Null error occurred');
  });

  it('should handle undefined error', () => {
    const result = createErrorResult('code', undefined, 'Undefined error');

    expect(result.error).toBe('Undefined error');
  });
});

describe('createValidationError', () => {
  it('should create validation error result', () => {
    const code = 'const x = 1;';
    const errorMessage = 'Invalid code structure';

    const result = createValidationError(code, errorMessage);

    expect(result.success).toBe(false);
    expect(result.code).toBe(code);
    expect(result.changes).toEqual([]);
    expect(result.error).toBe(errorMessage);
  });

  it('should handle empty error message', () => {
    const result = createValidationError('code', '');

    expect(result.error).toBe('');
    expect(result.success).toBe(false);
  });

  it('should preserve original code exactly', () => {
    const code = '  const   x   =   1  ;  ';
    const result = createValidationError(code, 'Error');

    expect(result.code).toBe(code);
  });
});

describe('validateCodeSize', () => {
  it('should return null when code is within limit', () => {
    const code = 'const x = 1;';
    const maxSize = 1000;

    const result = validateCodeSize(code, maxSize);

    expect(result).toBeNull();
  });

  it('should return error result when code exceeds limit', () => {
    const code = 'a'.repeat(1001);
    const maxSize = 1000;

    const result = validateCodeSize(code, maxSize);

    expect(result).not.toBeNull();
    expect(result?.success).toBe(false);
    expect(result?.error).toContain('too large');
  });

  it('should return null when code is exactly at limit', () => {
    const code = 'a'.repeat(1000);
    const maxSize = 1000;

    const result = validateCodeSize(code, maxSize);

    expect(result).toBeNull();
  });

  it('should handle empty code', () => {
    const result = validateCodeSize('', 100);

    expect(result).toBeNull();
  });

  it('should handle zero maxSize', () => {
    const result = validateCodeSize('a', 0);

    expect(result).not.toBeNull();
    expect(result?.success).toBe(false);
  });
});

describe('createSingleChangeResult', () => {
  it('should create result with single change', () => {
    const original = 'const x = 1;';
    const refactored = 'const y = 1;';

    const result = createSingleChangeResult(original, refactored, 'variable', 'Renamed x to y');

    expect(result.success).toBe(true);
    expect(result.code).toBe(refactored);
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toEqual({
      type: 'variable',
      description: 'Renamed x to y',
      before: original,
      after: refactored,
    });
  });

  it('should handle different change types', () => {
    const types: RefactoringChange['type'][] = ['function', 'variable', 'import', 'class', 'other'];

    types.forEach(type => {
      const result = createSingleChangeResult('before', 'after', type, 'description');
      expect(result.changes[0].type).toBe(type);
    });
  });

  it('should preserve before and after code', () => {
    const before = `function test() {
  return 1;
}`;
    const after = `const test = () => 1;`;

    const result = createSingleChangeResult(before, after, 'function', 'Converted to arrow');

    expect(result.changes[0].before).toBe(before);
    expect(result.changes[0].after).toBe(after);
  });

  it('should handle empty strings', () => {
    const result = createSingleChangeResult('', '', 'other', 'Empty change');

    expect(result.code).toBe('');
    expect(result.changes[0].before).toBe('');
    expect(result.changes[0].after).toBe('');
  });

  it('should set success to true', () => {
    const result = createSingleChangeResult('a', 'b', 'variable', 'test');

    expect(result.success).toBe(true);
  });
});
