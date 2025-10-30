import {
  COMPLEXITY_LIMITS,
  MAINTAINABILITY_CONSTANTS,
  INDEX_CONSTANTS,
} from '../constants/refactoring-limits.js';

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
  let depth = INDEX_CONSTANTS.FIRST_ARRAY_INDEX;
  for (let i = 0; i <= index; i++) {
    const line = lines[i];
    depth += (line.match(/\{/g) || []).length;
    depth -= (line.match(/\}/g) || []).length;
  }
  return Math.max(INDEX_CONSTANTS.FIRST_ARRAY_INDEX, depth);
}

/**
 * Find duplicate code blocks (optimized O(n) detection using hashing)
 */
export function findDuplicateBlocks(code: string): Array<{ line1: number; line2: number }> {
  const lines = code.split('\n');
  const duplicates: Array<{ line1: number; line2: number }> = [];
  const minBlockSize = COMPLEXITY_LIMITS.MIN_DUPLICATE_BLOCK_SIZE;

  // Performance optimization: Use Map for O(1) lookups instead of O(n²) comparisons
  const blockMap = new Map<string, number[]>();

  // First pass: Build hash map of all blocks
  for (let i = 0; i <= lines.length - minBlockSize; i++) {
    const block = lines
      .slice(i, i + minBlockSize)
      .join('\n')
      .trim();

    if (!block) continue;

    // Store all occurrences of this block
    if (!blockMap.has(block)) {
      blockMap.set(block, []);
    }
    const occurrences = blockMap.get(block);
    if (occurrences) {
      occurrences.push(i);
    }
  }

  // Second pass: Find duplicates from the map
  for (const [, occurrences] of blockMap) {
    if (occurrences.length > 1) {
      // Create pairs for all duplicate occurrences
      for (let i = 0; i < occurrences.length - 1; i++) {
        for (let j = i + 1; j < occurrences.length; j++) {
          duplicates.push({
            line1: occurrences[i] + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET,
            line2: occurrences[j] + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET,
          });
        }
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

  let complexity = COMPLEXITY_LIMITS.BASE_COMPLEXITY; // Base complexity
  decisionPoints.forEach(pattern => {
    const matches = code.match(pattern);
    complexity += matches ? matches.length : 0;
  });

  return complexity;
}

/**
 * Calculate maintainability index
 */
function calculateMaintainabilityIndex(
  loc: number,
  complexity: number,
  functionCount: number
): number {
  // Simplified maintainability index calculation
  // Real formula: 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
  const volume = loc * Math.log2(functionCount || 1);
  const index = Math.max(
    MAINTAINABILITY_CONSTANTS.MIN_SCORE,
    Math.min(
      MAINTAINABILITY_CONSTANTS.MAX_SCORE,
      MAINTAINABILITY_CONSTANTS.BASE_VALUE -
        MAINTAINABILITY_CONSTANTS.HALSTEAD_COEFFICIENT * Math.log(volume) -
        MAINTAINABILITY_CONSTANTS.COMPLEXITY_COEFFICIENT * complexity -
        MAINTAINABILITY_CONSTANTS.LOC_COEFFICIENT * Math.log(loc)
    )
  );
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
  // Use bounded quantifier to prevent ReDoS on malicious inputs
  const functionCount =
    (code.match(/function\s+\w+/g) || []).length +
    (code.match(/const\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]{0,200}\)|[a-zA-Z_$][\w$]*)\s*=>/g) || [])
      .length;

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
