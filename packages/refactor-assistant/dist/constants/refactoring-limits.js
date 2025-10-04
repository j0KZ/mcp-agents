/**
 * Constants for refactoring operations
 * Extracted to prevent magic numbers and improve maintainability
 */
/**
 * Code size and pattern matching limits
 */
export const CODE_LIMITS = {
    /** Maximum input code size in bytes (100KB) */
    MAX_CODE_SIZE: 100000,
    /** Maximum length for regex pattern matching to prevent ReDoS */
    MAX_PATTERN_LENGTH: 200,
    /** Maximum length for function/block bodies in regex patterns */
    MAX_BODY_LENGTH: 500,
    /** Maximum line length to process (prevents ReDoS attacks) */
    MAX_LINE_LENGTH: 1000,
    /** Conversion factor from bytes to kilobytes */
    BYTES_TO_KB: 1024,
};
/**
 * Function analysis thresholds
 */
export const FUNCTION_LIMITS = {
    /** Minimum function length in lines to suggest extraction */
    MIN_FUNCTION_LENGTH: 15,
    /** Maximum function length in lines before suggesting refactoring */
    MAX_FUNCTION_LENGTH: 50,
    /** Minimum variable name length */
    MIN_VARIABLE_NAME_LENGTH: 3,
};
/**
 * Code quality and complexity thresholds
 */
export const COMPLEXITY_LIMITS = {
    /** Base cyclomatic complexity for any code */
    BASE_COMPLEXITY: 1,
    /** Maximum nesting depth before suggesting simplification */
    MAX_NESTING_DEPTH: 10,
    /** Minimum code block size for duplicate detection */
    MIN_DUPLICATE_BLOCK_SIZE: 3,
    /** Minimum lines for duplicate code detection */
    MIN_DUPLICATE_LINES: 5,
};
/**
 * Maintainability index calculation constants
 * Based on standard maintainability index formula
 */
export const MAINTAINABILITY_CONSTANTS = {
    /** Base value for maintainability index calculation */
    BASE_VALUE: 171,
    /** Coefficient for Halstead volume */
    HALSTEAD_COEFFICIENT: 5.2,
    /** Coefficient for cyclomatic complexity */
    COMPLEXITY_COEFFICIENT: 0.23,
    /** Coefficient for lines of code */
    LOC_COEFFICIENT: 16.2,
    /** Minimum maintainability index score */
    MIN_SCORE: 0,
    /** Maximum maintainability index score */
    MAX_SCORE: 100,
};
/**
 * Line number and array index constants
 */
export const INDEX_CONSTANTS = {
    /** Offset to convert from 1-indexed lines to 0-indexed arrays */
    LINE_TO_ARRAY_OFFSET: 1,
    /** First valid line number (1-indexed) */
    FIRST_LINE_NUMBER: 1,
    /** Array index for element not found */
    NOT_FOUND_INDEX: -1,
    /** First element in array (0-indexed) */
    FIRST_ARRAY_INDEX: 0,
    /** Single line offset for dead code removal */
    DEAD_CODE_LINE_OFFSET: 2,
};
/**
 * Pattern matching constants
 */
export const PATTERN_CONSTANTS = {
    /** Reset regex lastIndex to start */
    REGEX_RESET_INDEX: 0,
    /** No occurrences found */
    NO_OCCURRENCES: 0,
    /** Single occurrence */
    SINGLE_OCCURRENCE: 1,
};
/**
 * Combined refactoring limits (backward compatibility)
 */
export const REFACTORING_LIMITS = {
    MAX_CODE_SIZE: CODE_LIMITS.MAX_CODE_SIZE,
    MAX_PATTERN_LENGTH: CODE_LIMITS.MAX_PATTERN_LENGTH,
    MAX_BODY_LENGTH: CODE_LIMITS.MAX_BODY_LENGTH,
    MAX_LINE_LENGTH: CODE_LIMITS.MAX_LINE_LENGTH,
    MIN_FUNCTION_LENGTH: FUNCTION_LIMITS.MIN_FUNCTION_LENGTH,
    MAX_FUNCTION_LENGTH: FUNCTION_LIMITS.MAX_FUNCTION_LENGTH,
    MIN_DUPLICATE_LINES: COMPLEXITY_LIMITS.MIN_DUPLICATE_LINES,
    MAX_COMPLEXITY_THRESHOLD: COMPLEXITY_LIMITS.MAX_NESTING_DEPTH,
    MIN_VARIABLE_NAME_LENGTH: FUNCTION_LIMITS.MIN_VARIABLE_NAME_LENGTH,
};
/**
 * Error and status messages
 */
export const REFACTORING_MESSAGES = {
    CODE_TOO_LARGE: `Code too large for refactoring (max ${CODE_LIMITS.MAX_CODE_SIZE / CODE_LIMITS.BYTES_TO_KB}KB)`,
    INVALID_PATTERN: 'Invalid design pattern specified',
    NO_CHANGES: 'No refactoring changes were applied',
    VARIABLE_NOT_FOUND: 'Variable not found in code',
    INVALID_VARIABLE_NAME: 'New variable name is invalid',
    NO_CALLBACKS_FOUND: 'No callbacks found to convert',
    NO_CONDITIONALS_FOUND: 'No conditionals found to simplify',
    NO_DEAD_CODE_FOUND: 'No dead code found',
};
//# sourceMappingURL=refactoring-limits.js.map