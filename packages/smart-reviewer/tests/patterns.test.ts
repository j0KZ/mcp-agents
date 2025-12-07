/**
 * Tests for patterns.ts - Auto-fix utilities
 */

import { describe, it, expect } from 'vitest';
import { applyFixes } from '../src/analyzers/patterns.js';
import { CodeIssue } from '../src/types.js';

describe('applyFixes', () => {
  it('should return unchanged content when no issues provided', async () => {
    const content = 'line1\nline2\nline3';
    const result = await applyFixes(content, []);
    expect(result).toBe(content);
  });

  it('should replace line content when fix is provided', async () => {
    const content = 'const x = 1;\nconsole.log(x);\nconst y = 2;';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Remove console.log',
        line: 2,
        column: 1,
        severity: 'warning',
        fix: {
          description: 'Remove console.log',
          newCode: '// console.log removed',
        },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe('const x = 1;\n// console.log removed\nconst y = 2;');
  });

  it('should delete line when fix newCode is empty', async () => {
    const content = 'line1\nline2\nline3';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Delete line',
        line: 2,
        column: 1,
        severity: 'warning',
        fix: {
          description: 'Delete line',
          newCode: '',
        },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe('line1\nline3');
  });

  it('should handle multiple fixes on different lines', async () => {
    const content = 'line1\nline2\nline3\nline4';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Fix line 1',
        line: 1,
        column: 1,
        severity: 'warning',
        fix: { description: 'Fix', newCode: 'fixed1' },
      },
      {
        type: 'warning',
        message: 'Fix line 3',
        line: 3,
        column: 1,
        severity: 'warning',
        fix: { description: 'Fix', newCode: 'fixed3' },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe('fixed1\nline2\nfixed3\nline4');
  });

  it('should ignore issues without fix property', async () => {
    const content = 'line1\nline2';
    const issues: CodeIssue[] = [
      {
        type: 'error',
        message: 'Error without fix',
        line: 1,
        column: 1,
        severity: 'error',
        // No fix property
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe(content);
  });

  it('should ignore issues with line 0', async () => {
    const content = 'line1\nline2';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Invalid line',
        line: 0,
        column: 1,
        severity: 'warning',
        fix: { description: 'Fix', newCode: 'changed' },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe(content);
  });

  it('should ignore issues with line beyond content', async () => {
    const content = 'line1\nline2';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Line out of range',
        line: 10,
        column: 1,
        severity: 'warning',
        fix: { description: 'Fix', newCode: 'changed' },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe(content);
  });

  it('should handle deletion of multiple lines', async () => {
    const content = 'line1\ndelete1\nkeep\ndelete2\nline5';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Delete',
        line: 2,
        column: 1,
        severity: 'warning',
        fix: { description: 'Delete', newCode: '' },
      },
      {
        type: 'warning',
        message: 'Delete',
        line: 4,
        column: 1,
        severity: 'warning',
        fix: { description: 'Delete', newCode: '' },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe('line1\nkeep\nline5');
  });

  it('should handle empty content', async () => {
    const result = await applyFixes('', []);
    expect(result).toBe('');
  });

  it('should handle single line content', async () => {
    const content = 'single line';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'Fix',
        line: 1,
        column: 1,
        severity: 'warning',
        fix: { description: 'Fix', newCode: 'fixed line' },
      },
    ];

    const result = await applyFixes(content, issues);
    expect(result).toBe('fixed line');
  });

  it('should overwrite when same line has multiple fixes (last wins)', async () => {
    const content = 'line1\nline2';
    const issues: CodeIssue[] = [
      {
        type: 'warning',
        message: 'First fix',
        line: 1,
        column: 1,
        severity: 'warning',
        fix: { description: 'First', newCode: 'first' },
      },
      {
        type: 'warning',
        message: 'Second fix',
        line: 1,
        column: 1,
        severity: 'warning',
        fix: { description: 'Second', newCode: 'second' },
      },
    ];

    const result = await applyFixes(content, issues);
    // Last fix for the same line should win
    expect(result).toBe('second\nline2');
  });
});
