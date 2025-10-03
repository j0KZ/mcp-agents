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
      let braceCount = 0;
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

        if (started && braceCount === 0) {
          functions.push({ name, startLine: i + 1, lineCount });
          break;
        }
      }
    }
  }

  return functions;
}
