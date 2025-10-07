import { CodeMetrics, CodeIssue } from '../types.js';
import { PerformanceMonitor } from '@j0kz/shared';
/**
 * Calculate code metrics including complexity, maintainability, and duplicates
 *
 * @param content - Source code content to analyze
 * @param performanceMonitor - Optional performance monitor for tracking
 * @returns Code metrics object
 */
export declare function calculateMetrics(content: string, performanceMonitor?: PerformanceMonitor): CodeMetrics;
/**
 * Generate improvement suggestions based on metrics and issues
 *
 * @param content - Source code content
 * @param issues - Detected code issues
 * @param metrics - Calculated code metrics
 * @returns Array of improvement suggestions
 */
export declare function generateSuggestions(_content: string, issues: CodeIssue[], metrics: CodeMetrics): string[];
/**
 * Calculate overall code quality score (context-aware)
 *
 * @param issues - Detected code issues
 * @param metrics - Calculated code metrics
 * @returns Quality score from 0-100
 */
export declare function calculateScore(issues: CodeIssue[], metrics: CodeMetrics): number;
//# sourceMappingURL=metrics.d.ts.map