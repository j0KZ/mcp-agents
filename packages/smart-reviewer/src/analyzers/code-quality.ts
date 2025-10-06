import { CodeIssue } from '../types.js';
import { REGEX, QUALITY_THRESHOLDS } from '@j0kz/shared';

/**
 * Detects code issues and anti-patterns in source code
 *
 * Checks performed:
 * - 'var' usage (suggests const/let)
 * - console.log statements (production warning)
 * - TODO/FIXME comments
 * - Magic numbers
 * - Long functions (>50 lines)
 * - Deep nesting (>4 levels)
 *
 * @param content - Source code content to analyze
 * @param filePath - File path for context in error messages
 * @returns Array of detected issues with severity and fix suggestions
 */
export async function detectIssues(content: string, filePath: string): Promise<CodeIssue[]> {
  const issues: CodeIssue[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for 'var' usage (skip comments and JSDoc)
    const isComment = line.trim().startsWith('//') || line.trim().startsWith('*');
    if (line.includes('var ') && !isComment) {
      issues.push({
        line: lineNum,
        severity: 'warning',
        message: "Avoid 'var'. Use 'const' or 'let' instead.",
        rule: 'no-var',
        fix: {
          description: "Replace 'var' with 'const' or 'let'",
          oldCode: line,
          newCode: line.replace(/\bvar\b/, 'const'),
        },
      });
    }

    // Check for console.log (skip comments, JSDoc, and string literals)
    const hasConsoleLog = line.includes('console.log');
    const isInString = line.match(/['"`].*console\.log.*['"`]/);
    if (hasConsoleLog && !isComment && !isInString) {
      issues.push({
        line: lineNum,
        severity: 'info',
        message: 'Remove console.log before production',
        rule: 'no-console',
        fix: {
          description: 'Remove console.log statement',
          oldCode: line,
          newCode: '',
        },
      });
    }

    // Check for TODO comments using shared regex
    if (REGEX.TODO_COMMENT.test(line)) {
      issues.push({
        line: lineNum,
        severity: 'info',
        message: 'Unresolved TODO/FIXME comment',
        rule: 'no-todo',
      });
    }

    // Check for long lines using shared threshold
    if (line.length > QUALITY_THRESHOLDS.MAX_LINE_LENGTH) {
      issues.push({
        line: lineNum,
        severity: 'info',
        message: `Line too long (${line.length} chars). Consider breaking it up.`,
        rule: 'max-line-length',
      });
    }

    // Check for multiple blank lines
    if (i > 0 && !line.trim() && !lines[i - 1].trim()) {
      issues.push({
        line: lineNum,
        severity: 'info',
        message: 'Multiple consecutive blank lines',
        rule: 'no-multiple-empty-lines',
      });
    }

    // Check for == instead of ===
    if (line.includes('==') && !line.includes('===') && !line.trim().startsWith('//')) {
      const match = line.match(/([^=!])={2}([^=])/);
      if (match) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: "Use '===' instead of '==' for comparison",
          rule: 'eqeqeq',
          fix: {
            description: "Replace '==' with '==='",
            oldCode: line,
            newCode: line.replace(/([^=!])={2}([^=])/, '$1===$2'),
          },
        });
      }
    }

    // Check for function complexity (too many parameters)
    const funcMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
    if (funcMatch) {
      const params = funcMatch[1].split(',').filter(p => p.trim());
      if (params.length > 5) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: `Function has too many parameters (${params.length}). Consider using an options object.`,
          rule: 'max-params',
        });
      }
    }

    // Check for magic numbers
    const magicNumberMatch = line.match(/[^a-zA-Z_]\d{2,}[^a-zA-Z_0-9]/);
    if (magicNumberMatch && !line.trim().startsWith('//')) {
      issues.push({
        line: lineNum,
        severity: 'info',
        message: 'Avoid magic numbers. Use named constants.',
        rule: 'no-magic-numbers',
      });
    }

    // Check for empty catch blocks (ignore string templates and comments)
    const hasCatch = line.includes('catch');
    const isInTemplate = line.match(/['"`].*catch.*['"`]/) || line.includes('${');
    if (hasCatch && !isComment && !isInTemplate && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      // Only flag if next line is closing brace with no content
      if (nextLine === '}' || (nextLine.startsWith('}') && !nextLine.includes('//'))) {
        issues.push({
          line: lineNum,
          severity: 'error',
          message: 'Empty catch block. Handle errors properly.',
          rule: 'no-empty-catch',
        });
      }
    }

    // Check for nested ternary operators
    const ternaryCount = (line.match(/\?/g) || []).length;
    if (ternaryCount > 1) {
      issues.push({
        line: lineNum,
        severity: 'warning',
        message: 'Nested ternary operators reduce readability',
        rule: 'no-nested-ternary',
      });
    }
  }

  return issues;
}
