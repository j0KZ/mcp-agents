/**
 * Utilities for detecting and removing dead code
 */

import { DEAD_CODE_LIMITS } from '../constants/transformation-limits.js';
import { INDEX_CONSTANTS } from '../constants/refactoring-limits.js';

/**
 * Find unused variables in code
 */
export function findUnusedVariables(code: string): string[] {
  const lines = code.split('\n');
  const declaredVars = new Set<string>();
  const usedVars = new Set<string>();

  for (const line of lines) {
    // Skip long lines (ReDoS protection)
    if (line.length > 1000) continue;

    // Find variable declarations
    const declMatch = line.match(/(?:const|let|var)\s+(\w+)/);
    if (declMatch) {
      declaredVars.add(declMatch[1]);
    }

    // Find variable usages
    const words = line.match(/\b\w+\b/g) || [];
    words.forEach(word => usedVars.add(word));
  }

  // Find declared but never used (should appear only once: at declaration)
  return Array.from(declaredVars).filter(varName => {
    const occurrences = code.split(varName).length - 1;
    return occurrences <= DEAD_CODE_LIMITS.MIN_VARIABLE_USAGE;
  });
}

/**
 * Find unreachable code after return statements
 */
export function findUnreachableCode(code: string): Array<{ line: number; code: string }> {
  const lines = code.split('\n');
  const unreachable: Array<{ line: number; code: string }> = [];

  for (let i = INDEX_CONSTANTS.FIRST_ARRAY_INDEX; i < lines.length; i++) {
    const line = lines[i].trim();

    // Found a return statement
    if (line.startsWith('return ')) {
      // Check next N lines for code (not just closing braces)
      for (let j = 1; j <= DEAD_CODE_LIMITS.UNREACHABLE_CHECK_LINES && i + j < lines.length; j++) {
        const nextLine = lines[i + j].trim();

        // Ignore closing braces, empty lines, comments
        if (
          nextLine &&
          !nextLine.match(/^[}\])]/) &&
          !nextLine.startsWith('//') &&
          !nextLine.startsWith('/*')
        ) {
          unreachable.push({ line: i + j + 1, code: nextLine });
        }
      }
    }
  }

  return unreachable;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Remove unused variable declarations
 */
export function removeUnusedVariables(code: string, unusedVars: string[]): string {
  let result = code;

  for (const varName of unusedVars) {
    // Escape the variable name to prevent regex injection
    const escapedName = escapeRegExp(varName);
    // Remove declaration lines
    const declPattern = new RegExp(
      `\\s*(?:const|let|var)\\s+${escapedName}\\b\\s*=.*?;\\s*\\n`,
      'g'
    );
    result = result.replace(declPattern, '');
  }

  return result;
}

/**
 * Remove unreachable code after return statements
 */
export function removeUnreachableCode(code: string): { code: string; removed: number } {
  const unreachable = findUnreachableCode(code);
  if (unreachable.length === 0) {
    return { code, removed: 0 };
  }

  const lines = code.split('\n');

  // Remove unreachable lines (work backwards to preserve indices)
  for (let i = unreachable.length - 1; i >= INDEX_CONSTANTS.FIRST_ARRAY_INDEX; i--) {
    const { line } = unreachable[i];
    lines.splice(line - 1, 1);
  }

  return { code: lines.join('\n'), removed: unreachable.length };
}
