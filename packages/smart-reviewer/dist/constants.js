/**
 * Smart Reviewer Constants
 * Central location for all magic numbers and constant values
 */
// Code Quality Thresholds
export const QUALITY_THRESHOLD = {
    EXCELLENT_SCORE: 90,
    GOOD_SCORE: 70,
    FAIR_SCORE: 50,
    POOR_SCORE: 30,
};
// Code Metrics Thresholds
export const METRICS_THRESHOLD = {
    MAX_FUNCTION_LENGTH: 50,
    MAX_LINE_LENGTH: 120,
    MAX_NESTING_DEPTH: 4,
    MAX_PARAMETERS: 5,
    MAX_COMPLEXITY: 10,
    MIN_COMMENT_DENSITY: 10,
    GOOD_COMMENT_DENSITY: 20,
};
// Issue Severity Levels
export const SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};
// Rule Categories
export const RULE_CATEGORY = {
    STYLE: 'style',
    BEST_PRACTICES: 'best-practices',
    BUGS: 'bugs',
    SECURITY: 'security',
    PERFORMANCE: 'performance',
};
// Common Patterns to Detect
export const PATTERN = {
    VAR_KEYWORD: /\bvar\s+/g,
    CONSOLE_LOG: /console\.log/g,
    TODO_COMMENT: /\b(TODO|FIXME|XXX|HACK)\b/g,
    MAGIC_NUMBER: /\b\d+\b/g,
    LONG_LINE: 120,
    EMPTY_CATCH: /catch\s*\([^)]*\)\s*\{\s*\}/g,
};
// Review Configuration Defaults
export const DEFAULTS = {
    SEVERITY: 'moderate',
    AUTO_FIX: false,
    INCLUDE_METRICS: true,
    MAX_ISSUES: 100,
};
// Complexity Calculation Constants
export const COMPLEXITY = {
    BASE: 1,
    IF_STATEMENT: 1,
    LOOP: 1,
    CASE: 1,
    LOGICAL_OPERATOR: 1,
    CATCH: 1,
    TERNARY: 1,
};
// Maintainability Index Constants
export const MAINTAINABILITY = {
    VOLUME_WEIGHT: 0.23,
    COMPLEXITY_WEIGHT: 0.16,
    LOC_WEIGHT: 2.46,
    MAX_SCORE: 171,
    SCALE_FACTOR: 100,
};
//# sourceMappingURL=constants.js.map