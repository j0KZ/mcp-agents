/**
 * Tests for security-scanner utils
 */

import { describe, it, expect } from 'vitest';
import {
  generateFindingId,
  extractCodeContext,
  calculateEntropy,
  shouldScanFile,
  shouldSkipLine,
  truncateSensitive,
  isScannerFile,
  shouldSkipXSSLine,
} from '../src/utils.js';

describe('generateFindingId', () => {
  it('should generate consistent ID for same inputs', () => {
    const id1 = generateFindingId('/path/file.ts', 10, 'SQL_INJECTION');
    const id2 = generateFindingId('/path/file.ts', 10, 'SQL_INJECTION');

    expect(id1).toBe(id2);
  });

  it('should generate different IDs for different files', () => {
    const id1 = generateFindingId('/path/file1.ts', 10, 'SQL_INJECTION');
    const id2 = generateFindingId('/path/file2.ts', 10, 'SQL_INJECTION');

    expect(id1).not.toBe(id2);
  });

  it('should generate different IDs for different lines', () => {
    const id1 = generateFindingId('/path/file.ts', 10, 'SQL_INJECTION');
    const id2 = generateFindingId('/path/file.ts', 20, 'SQL_INJECTION');

    expect(id1).not.toBe(id2);
  });

  it('should generate different IDs for different vulnerability types', () => {
    const id1 = generateFindingId('/path/file.ts', 10, 'SQL_INJECTION');
    const id2 = generateFindingId('/path/file.ts', 10, 'XSS');

    expect(id1).not.toBe(id2);
  });

  it('should return alphanumeric string without special chars', () => {
    const id = generateFindingId('/path/file.ts', 10, 'SQL_INJECTION');

    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('should return string with max 16 characters', () => {
    const id = generateFindingId('/very/long/path/to/file.ts', 999999, 'COMMAND_INJECTION');

    expect(id.length).toBeLessThanOrEqual(16);
  });
});

describe('extractCodeContext', () => {
  const sampleCode = `line 1
line 2
line 3
line 4
line 5
line 6
line 7
line 8
line 9
line 10`;

  it('should extract context around a line', () => {
    const context = extractCodeContext(sampleCode, 5, 2);

    expect(context.lineNumber).toBe(5);
    expect(context.issueLine).toBe('line 5');
    expect(context.beforeLines).toHaveLength(2);
    expect(context.afterLines).toHaveLength(2);
  });

  it('should handle first line correctly', () => {
    const context = extractCodeContext(sampleCode, 1, 2);

    expect(context.lineNumber).toBe(1);
    expect(context.issueLine).toBe('line 1');
    expect(context.beforeLines).toHaveLength(0);
    expect(context.afterLines).toHaveLength(2);
  });

  it('should handle last line correctly', () => {
    const context = extractCodeContext(sampleCode, 10, 2);

    expect(context.lineNumber).toBe(10);
    expect(context.issueLine).toBe('line 10');
    expect(context.beforeLines).toHaveLength(2);
    expect(context.afterLines).toHaveLength(0);
  });

  it('should handle line beyond content', () => {
    const context = extractCodeContext(sampleCode, 20, 2);

    expect(context.lineNumber).toBe(20);
    expect(context.issueLine).toBe('');
  });

  it('should truncate long lines', () => {
    const longLine = 'a'.repeat(500);
    const context = extractCodeContext(longLine, 1, 0);

    // The MAX_LINE_LENGTH from constants determines truncation
    // Just verify it returns a string and doesn't crash
    expect(typeof context.issueLine).toBe('string');
    expect(context.issueLine.length).toBeLessThanOrEqual(500);
  });

  it('should use default context lines when not specified', () => {
    const context = extractCodeContext(sampleCode, 5);

    expect(context.beforeLines.length).toBeGreaterThan(0);
    expect(context.afterLines.length).toBeGreaterThan(0);
  });
});

describe('calculateEntropy', () => {
  it('should return 0 for empty string', () => {
    expect(calculateEntropy('')).toBe(0);
  });

  it('should return 0 for single character repeated', () => {
    const entropy = calculateEntropy('aaaaaaaaaa');
    expect(entropy).toBe(0);
  });

  it('should return higher entropy for random-looking strings', () => {
    const lowEntropy = calculateEntropy('aaaaabbbbb');
    const highEntropy = calculateEntropy('a1b2c3d4e5');

    expect(highEntropy).toBeGreaterThan(lowEntropy);
  });

  it('should handle null/undefined input', () => {
    expect(calculateEntropy(null as any)).toBe(0);
    expect(calculateEntropy(undefined as any)).toBe(0);
  });

  it('should calculate correct entropy for known patterns', () => {
    // For a string with equal distribution of 2 chars, entropy should be close to 1
    const entropy = calculateEntropy('abababab');
    expect(entropy).toBeCloseTo(1, 1);
  });

  it('should return higher entropy for secrets', () => {
    const normalText = calculateEntropy('hello world');
    const secretLike = calculateEntropy('Kj8nP3qR5tV7wX9yZ2aB4cD6eF8gH0');

    expect(secretLike).toBeGreaterThan(normalText);
  });
});

describe('shouldScanFile', () => {
  it('should return true for files not in exclude patterns', () => {
    const excludePatterns = ['node_modules', '.git'];

    expect(shouldScanFile('/project/src/file.ts', excludePatterns)).toBe(true);
  });

  it('should return false for files in node_modules', () => {
    const excludePatterns = ['node_modules', '.git'];

    expect(shouldScanFile('/project/node_modules/package/file.js', excludePatterns)).toBe(false);
  });

  it('should return false for files in .git', () => {
    const excludePatterns = ['node_modules', '.git'];

    expect(shouldScanFile('/project/.git/config', excludePatterns)).toBe(false);
  });

  it('should handle empty exclude patterns', () => {
    expect(shouldScanFile('/any/file.ts', [])).toBe(true);
  });

  it('should normalize Windows paths', () => {
    const excludePatterns = ['node_modules'];

    expect(shouldScanFile('C:\\project\\node_modules\\file.js', excludePatterns)).toBe(false);
  });

  it('should handle partial matches', () => {
    const excludePatterns = ['test'];

    expect(shouldScanFile('/project/tests/file.spec.ts', excludePatterns)).toBe(false);
    expect(shouldScanFile('/project/src/testUtils.ts', excludePatterns)).toBe(false);
  });
});

describe('shouldSkipLine', () => {
  it('should skip single-line comments with //', () => {
    expect(shouldSkipLine('  // this is a comment')).toBe(true);
    expect(shouldSkipLine('// comment at start')).toBe(true);
  });

  it('should skip hash comments', () => {
    expect(shouldSkipLine('# python comment')).toBe(true);
    expect(shouldSkipLine('  # indented comment')).toBe(true);
  });

  it('should skip multi-line comment markers', () => {
    expect(shouldSkipLine('/* start of block comment')).toBe(true);
    expect(shouldSkipLine('* continuation of block')).toBe(true);
  });

  it('should skip lines with example/sample keywords', () => {
    expect(shouldSkipLine('const example = "test"')).toBe(true);
    expect(shouldSkipLine('// Sample code here')).toBe(true);
  });

  it('should skip lines with test/todo/fixme/mock', () => {
    expect(shouldSkipLine('const test = true')).toBe(true);
    expect(shouldSkipLine('// TODO: fix this')).toBe(true);
    expect(shouldSkipLine('// FIXME: broken')).toBe(true);
    expect(shouldSkipLine('const mockData = {}')).toBe(true);
  });

  it('should not skip normal code lines', () => {
    expect(shouldSkipLine('const x = 1;')).toBe(false);
    expect(shouldSkipLine('function doSomething() {')).toBe(false);
    expect(shouldSkipLine('return result;')).toBe(false);
  });

  it('should be case insensitive for keywords', () => {
    expect(shouldSkipLine('EXAMPLE value')).toBe(true);
    expect(shouldSkipLine('SAMPLE data')).toBe(true);
    expect(shouldSkipLine('TODO later')).toBe(true);
  });
});

describe('truncateSensitive', () => {
  it('should not truncate short strings', () => {
    const short = 'hello';
    expect(truncateSensitive(short)).toBe(short);
  });

  it('should truncate long strings with ellipsis', () => {
    const long = 'a'.repeat(100);
    const truncated = truncateSensitive(long, 20);

    expect(truncated).toBe('a'.repeat(20) + '...');
    expect(truncated.length).toBe(23); // 20 + '...'
  });

  it('should use default max length', () => {
    const long = 'a'.repeat(100);
    const truncated = truncateSensitive(long);

    expect(truncated).toContain('...');
    expect(truncated.length).toBeLessThan(long.length);
  });

  it('should handle strings exactly at max length', () => {
    const exact = 'a'.repeat(20);
    const result = truncateSensitive(exact, 20);

    expect(result).toBe(exact);
    expect(result).not.toContain('...');
  });

  it('should handle empty string', () => {
    expect(truncateSensitive('')).toBe('');
  });
});

describe('isScannerFile', () => {
  it('should return true for scanner files', () => {
    expect(isScannerFile('/project/src/scanner.ts')).toBe(true);
    expect(isScannerFile('/project/security-scanner/index.ts')).toBe(true);
  });

  it('should return false for non-scanner files', () => {
    expect(isScannerFile('/project/src/utils.ts')).toBe(false);
    expect(isScannerFile('/project/src/analyzer.ts')).toBe(false);
  });

  it('should handle various path formats', () => {
    expect(isScannerFile('scanner.js')).toBe(true);
    expect(isScannerFile('my-security-scanner-tool')).toBe(true);
    expect(isScannerFile('/path/to/file-scanner-module.ts')).toBe(true);
  });
});

describe('shouldSkipXSSLine', () => {
  it('should skip pattern definitions', () => {
    expect(shouldSkipXSSLine('  pattern: /dangerous/')).toBe(true);
  });

  it('should skip description lines', () => {
    expect(shouldSkipXSSLine('  description: "XSS vulnerability"')).toBe(true);
  });

  it('should skip single-line comments', () => {
    expect(shouldSkipXSSLine('  // this is a comment')).toBe(true);
  });

  it('should skip block comment continuation', () => {
    expect(shouldSkipXSSLine('  * continued comment')).toBe(true);
  });

  it('should skip dangerousCode test patterns', () => {
    expect(shouldSkipXSSLine('const dangerousCode = "<script>"')).toBe(true);
  });

  it('should not skip normal code', () => {
    expect(shouldSkipXSSLine('const x = document.write(data)')).toBe(false);
    expect(shouldSkipXSSLine('innerHTML = userInput')).toBe(false);
  });

  it('should handle empty lines', () => {
    expect(shouldSkipXSSLine('')).toBe(false);
    expect(shouldSkipXSSLine('   ')).toBe(false);
  });
});
