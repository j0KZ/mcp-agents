/**
 * Code Metrics Calculator
 *
 * Calculates complexity, maintainability, and other code quality metrics.
 */
import { CodeMetrics } from '../types.js';
/**
 * Calculate nesting depth at a specific line index
 */
export declare function getNestingDepth(lines: string[], index: number): number;
/**
 * Find duplicate code blocks (optimized O(n) detection using hashing)
 */
export declare function findDuplicateBlocks(code: string): Array<{
    line1: number;
    line2: number;
}>;
/**
 * Calculate code metrics for quality analysis
 *
 * @param code - Source code to analyze
 * @returns Code metrics object
 */
export declare function calculateMetrics(code: string): CodeMetrics;
//# sourceMappingURL=metrics-calculator.d.ts.map