import { CodeIssue } from '../types.js';

/**
 * Apply automatic fixes to code based on detected issues
 *
 * @param content - Source code content to fix
 * @param issues - Array of issues with fix suggestions
 * @returns Fixed code content
 */
export async function applyFixes(content: string, issues: CodeIssue[]): Promise<string> {
  const lines = content.split('\n');

  // Build a map of line number -> new content to avoid line number shifting
  const lineChanges = new Map<number, string | null>();

  for (const issue of issues) {
    if (issue.fix && issue.line > 0 && issue.line <= lines.length) {
      // null means delete the line, empty string or content means replace
      lineChanges.set(issue.line, issue.fix.newCode === '' ? null : issue.fix.newCode);
    }
  }

  // Apply all changes at once
  const result = lines
    .map((line, idx) => {
      const lineNum = idx + 1;
      if (lineChanges.has(lineNum)) {
        return lineChanges.get(lineNum); // Returns null for deletions, new content for replacements
      }
      return line;
    })
    .filter(line => line !== null); // Remove deleted lines

  return result.join('\n');
}
