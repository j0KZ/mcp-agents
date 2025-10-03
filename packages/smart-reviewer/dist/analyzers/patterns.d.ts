import { CodeIssue } from '../types.js';
/**
 * Apply automatic fixes to code based on detected issues
 *
 * @param content - Source code content to fix
 * @param issues - Array of issues with fix suggestions
 * @returns Fixed code content
 */
export declare function applyFixes(content: string, issues: CodeIssue[]): Promise<string>;
//# sourceMappingURL=patterns.d.ts.map