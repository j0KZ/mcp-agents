import { CODE_LIMITS } from '../constants/refactoring-limits.js';

/**
 * Import statement helpers
 */

export function removeUnusedImportsFromCode(code: string): { code: string; removed: string[] } {
  const removed: string[] = [];
  const lines = code.split('\n');
  const importLines: { line: string; index: number; imports: string[] }[] = [];

  // Find all import statements
  lines.forEach((line, index) => {
    // Skip lines that are too long to prevent ReDoS
    if (line.length > CODE_LIMITS.MAX_LINE_LENGTH) return;

    const importMatch = line.match(/import\s+\{([^}]{1,500})\}\s+from\s+['"]([^'"]{1,200})['"]/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(i => i.trim());
      importLines.push({ line, index, imports });
    }
  });

  // Check which imports are actually used
  const codeWithoutImports = lines
    .filter((_, idx) => !importLines.some(il => il.index === idx))
    .join('\n');

  const filteredLines = lines.filter((_line, idx) => {
    const importLine = importLines.find(il => il.index === idx);
    if (!importLine) return true;

    const usedImports = importLine.imports.filter(imp => {
      const pattern = new RegExp(`\\b${escapeRegExp(imp)}\\b`);
      return pattern.test(codeWithoutImports);
    });

    if (usedImports.length === 0) {
      removed.push(...importLine.imports);
      return false;
    }

    if (usedImports.length < importLine.imports.length) {
      const unusedImports = importLine.imports.filter(i => !usedImports.includes(i));
      removed.push(...unusedImports);
    }

    return true;
  });

  return { code: filteredLines.join('\n'), removed };
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
