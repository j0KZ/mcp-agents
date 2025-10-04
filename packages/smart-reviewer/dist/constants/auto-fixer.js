/**
 * Auto-fixer confidence thresholds and constants
 */
// Confidence scores (0-100)
export const CONFIDENCE = {
    PERFECT: 100, // AST-validated, 100% safe
    HIGH: 90, // Very safe, minimal risk
    MEDIUM: 80, // Requires review
    LOW: 60, // Suggest only
    UNSAFE: 0, // Do not apply
};
// Coverage percentages for Pareto principle
export const PARETO_COVERAGE = {
    UNUSED_IMPORTS: 35, // 35% of common issues
    NULL_CHECKS: 25, // 25% of common issues
    CONSOLE_LOGS: 15, // 15% of common issues
    FORMATTING: 15, // 15% of common issues
    TYPE_ASSERTIONS: 10, // 10% of common issues
};
// Index offsets
export const INDEX = {
    ZERO_BASED: 0,
    ONE_BASED: 1,
};
//# sourceMappingURL=auto-fixer.js.map