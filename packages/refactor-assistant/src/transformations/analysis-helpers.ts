import { INDEX_CONSTANTS } from '../constants/refactoring-limits.js';

/**
 * Code analysis helpers
 */

export function analyzeFunctionLengths(code: string): Array<{ name: string; startLine: number; lineCount: number }> {
  const functions: Array<{ name: string; startLine: number; lineCount: number }> = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    // Use two separate, simpler regexes to avoid ReDoS vulnerability
    const regularFunctionMatch = lines[i].match(/function\s+(\w+)/);
    const arrowFunctionMatch = !regularFunctionMatch && lines[i].match(/const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]{0,200}\)|[a-zA-Z_$][\w$]*)\s*=>/);
    const functionMatch = regularFunctionMatch || arrowFunctionMatch;

    if (functionMatch) {
      const name = functionMatch[1];
      let braceCount = INDEX_CONSTANTS.FIRST_ARRAY_INDEX;
      let started = false;
      let lineCount = 0;

      for (let j = i; j < lines.length; j++) {
        const line = lines[j];
        if (line.includes('{')) {
          braceCount += (line.match(/\{/g) || []).length;
          started = true;
        }
        if (line.includes('}')) {
          braceCount -= (line.match(/\}/g) || []).length;
        }

        if (started) lineCount++;

        if (started && braceCount === INDEX_CONSTANTS.FIRST_ARRAY_INDEX) {
          functions.push({ name, startLine: i + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET, lineCount });
          break;
        }
      }
    }
  }

  return functions;
}
