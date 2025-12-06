/**
 * Tests for validation.ts
 */

import { describe, it, expect } from 'vitest';
import {
  validateFilePathInput,
  validateFileContent,
  validateIdentifier,
  validateLineRange,
  validateEnum,
  validatePercentage,
  looksLikeCode,
  sanitizeErrorMessage,
  createError,
  validateProjectPath,
  validateFramework,
} from '../src/validation.js';

describe('validateFilePathInput', () => {
  it('should return valid for normal file paths', () => {
    const result = validateFilePathInput('/path/to/file.ts', 'TST');
    expect(result.valid).toBe(true);
  });

  it('should reject null/undefined paths', () => {
    const result = validateFilePathInput(null, 'TST');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('TST_001');
    expect(result.error).toContain('Invalid file path');
  });

  it('should reject non-string paths', () => {
    const result = validateFilePathInput(123, 'TST');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('TST_001');
  });

  it('should reject empty string paths', () => {
    const result = validateFilePathInput('', 'TST');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file path');
  });

  it('should reject whitespace-only paths', () => {
    const result = validateFilePathInput('   ', 'TST');
    expect(result.valid).toBe(false);
  });

  it('should reject path traversal with Unix paths', () => {
    const result = validateFilePathInput('../../../etc/passwd', 'TST');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('TST_003');
    expect(result.error).toContain('traversal');
  });

  it('should reject path traversal with Windows paths', () => {
    const result = validateFilePathInput('..\\..\\windows\\system32', 'TST');
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('TST_003');
  });

  it('should allow double dots in filenames without path separators', () => {
    const result = validateFilePathInput('file..name.ts', 'TST');
    expect(result.valid).toBe(true);
  });
});

describe('validateFileContent', () => {
  it('should return valid for normal content', () => {
    const result = validateFileContent('function test() {}', 'test.js');
    expect(result.valid).toBe(true);
  });

  it('should reject non-string content', () => {
    // @ts-expect-error - testing invalid input
    const result = validateFileContent(123, 'test.js');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file content');
  });

  it('should reject empty content', () => {
    const result = validateFileContent('', 'test.js');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject whitespace-only content', () => {
    const result = validateFileContent('   \n\t  ', 'test.js');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('should reject content exceeding max size', () => {
    const largeContent = 'x'.repeat(2000 * 1024); // 2000 KB
    const result = validateFileContent(largeContent, 'large.js', 1000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
    expect(result.error).toContain('Maximum size is 1000 KB');
  });

  it('should accept content within max size', () => {
    const content = 'x'.repeat(500 * 1024);
    const result = validateFileContent(content, 'medium.js', 1000);
    expect(result.valid).toBe(true);
  });
});

describe('validateIdentifier', () => {
  it('should accept valid identifiers', () => {
    expect(validateIdentifier('myVariable').valid).toBe(true);
    expect(validateIdentifier('_private').valid).toBe(true);
    expect(validateIdentifier('$jquery').valid).toBe(true);
    expect(validateIdentifier('camelCase123').valid).toBe(true);
  });

  it('should reject null/undefined', () => {
    expect(validateIdentifier(null).valid).toBe(false);
    expect(validateIdentifier(undefined).valid).toBe(false);
    expect(validateIdentifier(null).error).toContain('non-empty string');
  });

  it('should reject empty string', () => {
    expect(validateIdentifier('').valid).toBe(false);
  });

  it('should reject identifiers starting with numbers', () => {
    const result = validateIdentifier('123invalid');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Must start with a letter');
  });

  it('should reject reserved keywords', () => {
    const result = validateIdentifier('const');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reserved keyword');
  });

  it('should reject all major reserved keywords', () => {
    const keywords = ['function', 'class', 'if', 'else', 'return', 'const', 'let', 'var'];
    for (const keyword of keywords) {
      expect(validateIdentifier(keyword).valid).toBe(false);
    }
  });

  it('should reject identifiers with special characters', () => {
    expect(validateIdentifier('my-var').valid).toBe(false);
    expect(validateIdentifier('my.var').valid).toBe(false);
    expect(validateIdentifier('my var').valid).toBe(false);
  });
});

describe('validateLineRange', () => {
  it('should accept valid line ranges', () => {
    const result = validateLineRange(1, 10, 100);
    expect(result.valid).toBe(true);
  });

  it('should reject non-number inputs', () => {
    // @ts-expect-error - testing invalid input
    const result = validateLineRange('1', 10, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be integers');
  });

  it('should reject zero line numbers', () => {
    const result = validateLineRange(0, 10, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be positive');
  });

  it('should reject negative line numbers', () => {
    const result = validateLineRange(-1, 10, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be positive');
  });

  it('should reject start > end', () => {
    const result = validateLineRange(10, 5, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be <=');
  });

  it('should reject endLine exceeding total', () => {
    const result = validateLineRange(1, 150, 100);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds file length');
  });
});

describe('validateEnum', () => {
  it('should accept valid enum values', () => {
    const result = validateEnum('high', ['low', 'medium', 'high'], 'priority');
    expect(result.valid).toBe(true);
  });

  it('should reject non-string values', () => {
    // @ts-expect-error - testing invalid input
    const result = validateEnum(123, ['low', 'medium', 'high'], 'priority');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a string');
  });

  it('should reject invalid enum values', () => {
    const result = validateEnum('critical', ['low', 'medium', 'high'], 'priority');
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid priority: 'critical'");
    expect(result.error).toContain('Valid options: low, medium, high');
  });
});

describe('validatePercentage', () => {
  it('should accept valid percentages', () => {
    expect(validatePercentage(0, 'coverage').valid).toBe(true);
    expect(validatePercentage(50, 'coverage').valid).toBe(true);
    expect(validatePercentage(100, 'coverage').valid).toBe(true);
  });

  it('should reject non-number values', () => {
    const result = validatePercentage('50', 'coverage');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be a number');
  });

  it('should reject values below 0', () => {
    const result = validatePercentage(-1, 'coverage');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be between 0 and 100');
  });

  it('should reject values above 100', () => {
    const result = validatePercentage(101, 'coverage');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be between 0 and 100');
  });

  it('should use default field name', () => {
    const result = validatePercentage('50');
    expect(result.error).toContain('value must be a number');
  });
});

describe('looksLikeCode', () => {
  it('should detect function declarations', () => {
    expect(looksLikeCode('function test() {}')).toBe(true);
  });

  it('should detect class declarations', () => {
    expect(looksLikeCode('class MyClass {}')).toBe(true);
  });

  it('should detect const assignments', () => {
    expect(looksLikeCode('const x = 1;')).toBe(true);
  });

  it('should detect let assignments', () => {
    expect(looksLikeCode('let y = 2;')).toBe(true);
  });

  it('should detect var assignments', () => {
    expect(looksLikeCode('var z = 3;')).toBe(true);
  });

  it('should detect import statements', () => {
    expect(looksLikeCode("import { foo } from 'bar';")).toBe(true);
  });

  it('should detect export statements', () => {
    expect(looksLikeCode('export default function() {}')).toBe(true);
    expect(looksLikeCode('export const x = 1;')).toBe(true);
    expect(looksLikeCode('export function test() {}')).toBe(true);
    expect(looksLikeCode('export class Test {}')).toBe(true);
  });

  it('should detect arrow functions', () => {
    expect(looksLikeCode('const fn = () => {}')).toBe(true);
    expect(looksLikeCode('() => {}')).toBe(true);
  });

  it('should return false for plain text', () => {
    expect(looksLikeCode('This is just some text')).toBe(false);
    expect(looksLikeCode('Hello world')).toBe(false);
  });
});

describe('sanitizeErrorMessage', () => {
  it('should remove Unix absolute paths', () => {
    const error = new Error('Cannot find file /Users/test/code/file.ts');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[path]');
    expect(sanitized).not.toContain('/Users/test');
  });

  it('should remove Windows absolute paths', () => {
    const error = new Error('Cannot find file C:\\Users\\test\\code\\file.ts');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).toContain('[path]');
    expect(sanitized).not.toContain('C:\\Users');
  });

  it('should include sanitized stack trace when requested', () => {
    const error = new Error('Test error at /Users/test/code/file.ts');
    const sanitized = sanitizeErrorMessage(error, true);
    expect(sanitized).toContain('Stack trace');
    expect(sanitized).not.toContain('/Users/test');
  });

  it('should not include stack trace by default', () => {
    const error = new Error('Test error');
    const sanitized = sanitizeErrorMessage(error);
    expect(sanitized).not.toContain('Stack trace');
  });
});

describe('createError', () => {
  it('should create error with all fields', () => {
    const error = createError('ERR_001', 'Something went wrong', 'Try again', { foo: 'bar' });
    expect(error.code).toBe('ERR_001');
    expect(error.message).toBe('Something went wrong');
    expect(error.suggestion).toBe('Try again');
    expect(error.details).toEqual({ foo: 'bar' });
  });

  it('should create error with required fields only', () => {
    const error = createError('ERR_002', 'Error message');
    expect(error.code).toBe('ERR_002');
    expect(error.message).toBe('Error message');
    expect(error.suggestion).toBeUndefined();
    expect(error.details).toBeUndefined();
  });
});

describe('validateProjectPath', () => {
  it('should accept valid project paths', () => {
    const result = validateProjectPath('/path/to/project');
    expect(result.valid).toBe(true);
  });

  it('should reject null/undefined paths', () => {
    expect(validateProjectPath(null).valid).toBe(false);
    expect(validateProjectPath(undefined).valid).toBe(false);
    expect(validateProjectPath(null).error).toContain('Invalid project path');
  });

  it('should reject non-string paths', () => {
    expect(validateProjectPath(123).valid).toBe(false);
  });

  it('should reject empty paths', () => {
    const result = validateProjectPath('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid project path');
  });

  it('should reject whitespace-only paths', () => {
    const result = validateProjectPath('   ');
    expect(result.valid).toBe(false);
  });

  it('should reject path traversal attempts', () => {
    const result = validateProjectPath('../../../');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('traversal');
  });
});

describe('validateFramework', () => {
  const validFrameworks = ['jest', 'mocha', 'vitest', 'ava'];

  it('should accept valid frameworks', () => {
    const result = validateFramework('vitest', validFrameworks);
    expect(result.valid).toBe(true);
  });

  it('should reject null/undefined', () => {
    expect(validateFramework(null, validFrameworks).valid).toBe(false);
    expect(validateFramework(undefined, validFrameworks).valid).toBe(false);
    expect(validateFramework(null, validFrameworks).error).toContain('must be a string');
  });

  it('should reject empty string', () => {
    const result = validateFramework('', validFrameworks);
    expect(result.valid).toBe(false);
  });

  it('should reject unsupported frameworks', () => {
    const result = validateFramework('jasmine', validFrameworks);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unsupported framework 'jasmine'");
    expect(result.error).toContain('Valid options: jest, mocha, vitest, ava');
  });
});
