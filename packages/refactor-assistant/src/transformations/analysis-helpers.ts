import { INDEX_CONSTANTS } from '../constants/refactoring-limits.js';

/**
 * Code analysis helpers
 */

export function analyzeFunctionLengths(code: string): Array<{ name: string; startLine: number; lineCount: number }> {
  const functions: Array<{ name: string; startLine: number; lineCount: number }> = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const functionMatch = lines[i].match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/);
    if (functionMatch) {
      const name = functionMatch[1] || functionMatch[2];
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
