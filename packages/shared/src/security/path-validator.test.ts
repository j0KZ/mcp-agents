/**
 * Tests for path validation utilities
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  PathValidationError,
  validateNoTraversal,
  validatePath,
  validateFilePath,
  validateDirectoryPath,
  sanitizeFilename,
} from './path-validator.js';

describe('PathValidationError', () => {
  it('should create error with attempted path', () => {
    const error = new PathValidationError('Test error', '/bad/path');
    expect(error.message).toBe('Test error');
    expect(error.attemptedPath).toBe('/bad/path');
    expect(error.name).toBe('PathValidationError');
  });
});

describe('validateNoTraversal', () => {
  it('should allow safe relative paths', () => {
    expect(() => validateNoTraversal('foo/bar')).not.toThrow();
    expect(() => validateNoTraversal('foo/bar/baz.txt')).not.toThrow();
  });

  it('should allow safe absolute paths', () => {
    expect(() => validateNoTraversal('/usr/local/bin')).not.toThrow();
    expect(() => validateNoTraversal('C:\\Windows\\System32')).not.toThrow();
  });

  it('should reject path traversal with ..', () => {
    expect(() => validateNoTraversal('../etc/passwd')).toThrow(PathValidationError);
    expect(() => validateNoTraversal('foo/../../etc')).toThrow('Path traversal detected');
  });

  it('should reject normalized paths that still contain ..', () => {
    expect(() => validateNoTraversal('./foo/../../../etc')).toThrow(PathValidationError);
  });

  it('should allow normalized absolute paths', () => {
    // After normalization, /var/../../../etc/passwd becomes /etc/passwd (valid)
    // The function allows absolute paths as long as they don't contain .. after normalization
    expect(() => validateNoTraversal('/var/../../../etc/passwd')).not.toThrow();
  });
});

describe('validatePath', () => {
  it('should return absolute path for valid input', () => {
    const result = validatePath('.');
    expect(path.isAbsolute(result)).toBe(true);
  });

  it('should throw for traversal attempts', () => {
    expect(() => validatePath('../../../etc/passwd')).toThrow(PathValidationError);
  });

  it('should validate path is within allowed root', () => {
    const root = '/home/user';
    expect(() => validatePath('/home/user/documents', root)).not.toThrow();
  });

  it('should reject paths outside allowed root', () => {
    const root = '/home/user';
    expect(() => validatePath('/etc/passwd', root)).toThrow('Path is outside allowed directory');
  });

  it('should handle Windows paths', () => {
    if (process.platform === 'win32') {
      const result = validatePath('C:\\Users\\test');
      expect(result).toContain('C:');
    }
  });
});

describe('validateFilePath', () => {
  let tempDir: string;
  let tempFile: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'path-validator-test-'));
    tempFile = path.join(tempDir, 'test-file.txt');
    fs.writeFileSync(tempFile, 'test content');
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should validate existing file', () => {
    const result = validateFilePath(tempFile);
    expect(result).toBe(path.resolve(tempFile));
  });

  it('should throw for non-existent file', () => {
    const nonExistent = path.join(tempDir, 'does-not-exist.txt');
    expect(() => validateFilePath(nonExistent)).toThrow('File does not exist');
  });

  it('should throw when path is directory not file', () => {
    expect(() => validateFilePath(tempDir)).toThrow('Path is not a file');
  });

  it('should validate file within allowed root', () => {
    const result = validateFilePath(tempFile, tempDir);
    expect(result).toBe(path.resolve(tempFile));
  });

  it('should reject file outside allowed root', () => {
    const otherDir = path.join(os.tmpdir(), 'other-dir');
    expect(() => validateFilePath(tempFile, otherDir)).toThrow('Path is outside allowed directory');
  });
});

describe('validateDirectoryPath', () => {
  let tempDir: string;
  let tempFile: string;

  beforeAll(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'path-validator-test-'));
    tempFile = path.join(tempDir, 'test-file.txt');
    fs.writeFileSync(tempFile, 'test content');
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should validate existing directory', () => {
    const result = validateDirectoryPath(tempDir);
    expect(result).toBe(path.resolve(tempDir));
  });

  it('should throw for non-existent directory', () => {
    const nonExistent = path.join(tempDir, 'does-not-exist');
    expect(() => validateDirectoryPath(nonExistent)).toThrow('Directory does not exist');
  });

  it('should throw when path is file not directory', () => {
    expect(() => validateDirectoryPath(tempFile)).toThrow('Path is not a directory');
  });

  it('should validate directory within allowed root', () => {
    const subdir = path.join(tempDir, 'subdir');
    fs.mkdirSync(subdir);

    const result = validateDirectoryPath(subdir, tempDir);
    expect(result).toBe(path.resolve(subdir));

    fs.rmdirSync(subdir);
  });
});

describe('sanitizeFilename', () => {
  it('should remove path separators', () => {
    expect(sanitizeFilename('foo/bar')).toBe('foobar');
    expect(sanitizeFilename('foo\\bar')).toBe('foobar');
  });

  it('should remove null bytes', () => {
    // Null bytes are removed, not replaced with underscore
    expect(sanitizeFilename('foo\0bar')).toBe('foobar');
  });

  it('should remove path traversal sequences', () => {
    expect(sanitizeFilename('../etc/passwd')).toBe('etcpasswd');
    expect(sanitizeFilename('foo/../bar')).toBe('foobar');
  });

  it('should replace special characters with underscores', () => {
    expect(sanitizeFilename('foo@bar#baz')).toBe('foo_bar_baz');
    expect(sanitizeFilename('foo bar')).toBe('foo_bar');
  });

  it('should preserve safe characters', () => {
    expect(sanitizeFilename('foo-bar_baz.txt')).toBe('foo-bar_baz.txt');
    expect(sanitizeFilename('file123.json')).toBe('file123.json');
  });

  it('should limit filename length to 255 characters', () => {
    const longName = 'a'.repeat(300);
    const result = sanitizeFilename(longName);
    expect(result.length).toBe(255);
  });

  it('should handle empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });

  it('should handle complex attack patterns', () => {
    // Null bytes are removed (not replaced), slashes and .. are removed
    expect(sanitizeFilename('../../../../etc/passwd\0.txt')).toBe('etcpasswd.txt');
    expect(sanitizeFilename('..\\..\\Windows\\System32\\config')).toBe('WindowsSystem32config');
  });
});
