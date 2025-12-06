/**
 * Tests for path-validator.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  PathValidationError,
  validateNoTraversal,
  validatePath,
  validateFilePath,
  validateDirectoryPath,
  sanitizeFilename,
} from '../src/security/path-validator.js';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  statSync: vi.fn(),
}));

describe('PathValidationError', () => {
  it('should create error with message and attempted path', () => {
    const error = new PathValidationError('Test error', '/test/path');
    expect(error.message).toBe('Test error');
    expect(error.attemptedPath).toBe('/test/path');
    expect(error.name).toBe('PathValidationError');
  });

  it('should be instance of Error', () => {
    const error = new PathValidationError('Test', '/path');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('validateNoTraversal', () => {
  it('should accept valid paths', () => {
    expect(() => validateNoTraversal('/path/to/file.ts')).not.toThrow();
    expect(() => validateNoTraversal('relative/path/file.ts')).not.toThrow();
    expect(() => validateNoTraversal('file.ts')).not.toThrow();
  });

  it('should reject paths with double dots', () => {
    expect(() => validateNoTraversal('../file.ts')).toThrow(PathValidationError);
    expect(() => validateNoTraversal('/path/../file.ts')).toThrow(PathValidationError);
    expect(() => validateNoTraversal('path/../../file.ts')).toThrow(PathValidationError);
  });

  it('should provide descriptive error messages', () => {
    try {
      validateNoTraversal('../etc/passwd');
      expect.fail('Should have thrown');
    } catch (e) {
      const error = e as PathValidationError;
      expect(error.message).toContain('Path traversal detected');
      expect(error.attemptedPath).toBe('../etc/passwd');
    }
  });

  it('should handle absolute Unix paths', () => {
    expect(() => validateNoTraversal('/usr/local/bin')).not.toThrow();
  });

  it('should handle absolute Windows paths', () => {
    expect(() => validateNoTraversal('C:\\Users\\test')).not.toThrow();
  });
});

describe('validatePath', () => {
  it('should return absolute path for valid input', () => {
    const result = validatePath('relative/path');
    expect(path.isAbsolute(result)).toBe(true);
  });

  it('should reject traversal attempts', () => {
    expect(() => validatePath('../outside')).toThrow(PathValidationError);
  });

  it('should validate against allowed root', () => {
    const root = process.cwd();
    const validPath = path.join(root, 'subdir', 'file.ts');

    // This should not throw since it's within root
    expect(() => validatePath(validPath, root)).not.toThrow();
  });

  it('should reject paths outside allowed root', () => {
    const root = path.join(process.cwd(), 'subdir');
    const outsidePath = path.join(process.cwd(), 'other', 'file.ts');

    expect(() => validatePath(outsidePath, root)).toThrow(PathValidationError);
  });
});

describe('validateFilePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate existing file', () => {
    const testPath = path.join(process.cwd(), 'test.ts');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as fs.Stats);

    const result = validateFilePath(testPath);
    expect(result).toBe(testPath);
  });

  it('should reject non-existent file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(() => validateFilePath('nonexistent.ts')).toThrow(PathValidationError);
  });

  it('should reject directory when expecting file', () => {
    const testPath = path.join(process.cwd(), 'testdir');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isFile: () => false } as fs.Stats);

    expect(() => validateFilePath(testPath)).toThrow(PathValidationError);
  });

  it('should validate with allowed root', () => {
    const root = process.cwd();
    const testPath = path.join(root, 'file.ts');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as fs.Stats);

    const result = validateFilePath(testPath, root);
    expect(result).toBe(testPath);
  });
});

describe('validateDirectoryPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should validate existing directory', () => {
    const testPath = path.join(process.cwd(), 'testdir');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = validateDirectoryPath(testPath);
    expect(result).toBe(testPath);
  });

  it('should reject non-existent directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(() => validateDirectoryPath('nonexistent')).toThrow(PathValidationError);
  });

  it('should reject file when expecting directory', () => {
    const testPath = path.join(process.cwd(), 'file.ts');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as fs.Stats);

    expect(() => validateDirectoryPath(testPath)).toThrow(PathValidationError);
  });

  it('should validate with allowed root', () => {
    const root = process.cwd();
    const testPath = path.join(root, 'subdir');
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = validateDirectoryPath(testPath, root);
    expect(result).toBe(testPath);
  });
});

describe('sanitizeFilename', () => {
  it('should remove path separators', () => {
    expect(sanitizeFilename('path/to/file.ts')).not.toContain('/');
    expect(sanitizeFilename('path\\to\\file.ts')).not.toContain('\\');
  });

  it('should remove null bytes', () => {
    expect(sanitizeFilename('file\0name.ts')).not.toContain('\0');
  });

  it('should remove traversal sequences', () => {
    expect(sanitizeFilename('../../../etc/passwd')).not.toContain('..');
  });

  it('should keep alphanumeric, dots, dashes, underscores', () => {
    const result = sanitizeFilename('valid-file_name.test.ts');
    expect(result).toBe('valid-file_name.test.ts');
  });

  it('should replace special characters with underscores', () => {
    const result = sanitizeFilename('file@name#with$special');
    expect(result).toContain('_');
    expect(result).not.toContain('@');
    expect(result).not.toContain('#');
    expect(result).not.toContain('$');
  });

  it('should limit filename length to 255 characters', () => {
    const longName = 'a'.repeat(300);
    const result = sanitizeFilename(longName);
    expect(result.length).toBeLessThanOrEqual(255);
  });

  it('should handle empty string', () => {
    const result = sanitizeFilename('');
    expect(result).toBe('');
  });

  it('should handle filename with only special characters', () => {
    const result = sanitizeFilename('@#$%^&*');
    expect(result).toMatch(/^_+$/);
  });
});
