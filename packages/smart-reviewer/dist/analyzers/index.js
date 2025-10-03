/**
 * Analyzers module - contains extracted analysis functions
 *
 * This module provides specialized analyzers for code quality, metrics, and patterns.
 * Each analyzer focuses on a specific aspect of code analysis to reduce complexity.
 */
export { detectIssues } from './code-quality.js';
export { calculateMetrics, generateSuggestions, calculateScore } from './metrics.js';
export { applyFixes } from './patterns.js';
//# sourceMappingURL=index.js.map