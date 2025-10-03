/**
 * Code Metrics Calculator
 *
 * Calculates complexity, maintainability, and other code quality metrics.
 */

import { CodeMetrics } from '../types.js';

/**
 * Calculate nesting depth at a specific line index
 */
export function getNestingDepth(lines: string[], index: number): number {
  let depth = 0;
  for (let i = 0; i <= index; i++) {
    const line = lines[i];
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
  }
  return Math.max(0, depth);
}

/**
 * Find duplicate code blocks (simplified detection)
 */
export function findDuplicateBlocks(code: string): Array<{ line1: number; line2: number }> {
  const lines = code.split('\n');
  const duplicates: Array<{ line1: number; line2: number }> = [];
  const minBlockSize = 3;

  for (let i = 0; i < lines.length - minBlockSize; i++) {
    const block1 = lines.slice(i, i + minBlockSize).join('\n').trim();
    if (!block1) continue;

    for (let j = i + minBlockSize; j < lines.length - minBlockSize; j++) {
      const block2 = lines.slice(j, j + minBlockSize).join('\n').trim();
      if (block1 === block2) {
        duplicates.push({ line1: i + 1, line2: j + 1 });
      }
    }
  }

  return duplicates;
}

/**
 * Calculate cyclomatic complexity
 */
function calculateCyclomaticComplexity(code: string): number {
  const decisionPoints = [
    /\bif\b/g,
    /\belse\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcase\b/g,
    /\bcatch\b/g,
    /\b&&\b/g,
    /\b\|\|\b/g,
    /\?/g,
  ];

  let complexity = 1; // Base complexity
  decisionPoints.forEach(pattern => {
    const matches = code.match(pattern);
    complexity += matches ? matches.length : 0;
  });

  return complexity;
}

/**
 * Calculate maintainability index
 */
function calculateMaintainabilityIndex(loc: number, complexity: number, functionCount: number): number {
  // Simplified maintainability index calculation
  // Real formula: 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
  const volume = loc * Math.log2(functionCount || 1);
  const index = Math.max(0, Math.min(100, 171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(loc)));
  return Math.round(index);
}

/**
 * Calculate code metrics for quality analysis
 *
 * @param code - Source code to analyze
 * @returns Code metrics object
 */
export function calculateMetrics(code: string): CodeMetrics {
  const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
  const functionCount = (code.match(/function\s+\w+/g) || []).length +
                        (code.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;

  const complexity = calculateCyclomaticComplexity(code);
  const maxNestingDepth = Math.max(...lines.map((_, idx) => getNestingDepth(lines, idx)));

  return {
    complexity,
    linesOfCode: lines.length,
    functionCount,
    maxNestingDepth,
    maintainabilityIndex: calculateMaintainabilityIndex(lines.length, complexity, functionCount),
  };
}
