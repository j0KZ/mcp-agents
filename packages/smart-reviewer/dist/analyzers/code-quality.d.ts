import { CodeIssue } from '../types.js';
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
export declare function detectIssues(content: string, filePath: string): Promise<CodeIssue[]>;
//# sourceMappingURL=code-quality.d.ts.map