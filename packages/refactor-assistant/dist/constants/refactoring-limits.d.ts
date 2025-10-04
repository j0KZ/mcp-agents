/**
 * Constants for refactoring operations
 * Extracted to prevent magic numbers and improve maintainability
 */
/**
 * Code size and pattern matching limits
 */
export declare const CODE_LIMITS: {
    /** Maximum input code size in bytes (100KB) */
    readonly MAX_CODE_SIZE: 100000;
    /** Maximum length for regex pattern matching to prevent ReDoS */
    readonly MAX_PATTERN_LENGTH: 200;
    /** Maximum length for function/block bodies in regex patterns */
    readonly MAX_BODY_LENGTH: 500;
    /** Maximum line length to process (prevents ReDoS attacks) */
    readonly MAX_LINE_LENGTH: 1000;
    /** Conversion factor from bytes to kilobytes */
    readonly BYTES_TO_KB: 1024;
};
/**
 * Function analysis thresholds
 */
export declare const FUNCTION_LIMITS: {
    /** Minimum function length in lines to suggest extraction */
    readonly MIN_FUNCTION_LENGTH: 15;
    /** Maximum function length in lines before suggesting refactoring */
    readonly MAX_FUNCTION_LENGTH: 50;
    /** Minimum variable name length */
    readonly MIN_VARIABLE_NAME_LENGTH: 3;
};
/**
 * Code quality and complexity thresholds
 */
export declare const COMPLEXITY_LIMITS: {
    /** Base cyclomatic complexity for any code */
    readonly BASE_COMPLEXITY: 1;
    /** Maximum nesting depth before suggesting simplification */
    readonly MAX_NESTING_DEPTH: 10;
    /** Minimum code block size for duplicate detection */
    readonly MIN_DUPLICATE_BLOCK_SIZE: 3;
    /** Minimum lines for duplicate code detection */
    readonly MIN_DUPLICATE_LINES: 5;
};
/**
 * Maintainability index calculation constants
 * Based on standard maintainability index formula
 */
export declare const MAINTAINABILITY_CONSTANTS: {
    /** Base value for maintainability index calculation */
    readonly BASE_VALUE: 171;
    /** Coefficient for Halstead volume */
    readonly HALSTEAD_COEFFICIENT: 5.2;
    /** Coefficient for cyclomatic complexity */
    readonly COMPLEXITY_COEFFICIENT: 0.23;
    /** Coefficient for lines of code */
    readonly LOC_COEFFICIENT: 16.2;
    /** Minimum maintainability index score */
    readonly MIN_SCORE: 0;
    /** Maximum maintainability index score */
    readonly MAX_SCORE: 100;
};
/**
 * Line number and array index constants
 */
export declare const INDEX_CONSTANTS: {
    /** Offset to convert from 1-indexed lines to 0-indexed arrays */
    readonly LINE_TO_ARRAY_OFFSET: 1;
    /** First valid line number (1-indexed) */
    readonly FIRST_LINE_NUMBER: 1;
    /** Array index for element not found */
    readonly NOT_FOUND_INDEX: -1;
    /** First element in array (0-indexed) */
    readonly FIRST_ARRAY_INDEX: 0;
    /** Single line offset for dead code removal */
    readonly DEAD_CODE_LINE_OFFSET: 2;
};
/**
 * Pattern matching constants
 */
export declare const PATTERN_CONSTANTS: {
    /** Reset regex lastIndex to start */
    readonly REGEX_RESET_INDEX: 0;
    /** No occurrences found */
    readonly NO_OCCURRENCES: 0;
    /** Single occurrence */
    readonly SINGLE_OCCURRENCE: 1;
};
/**
 * Combined refactoring limits (backward compatibility)
 */
export declare const REFACTORING_LIMITS: {
    readonly MAX_CODE_SIZE: 100000;
    readonly MAX_PATTERN_LENGTH: 200;
    readonly MAX_BODY_LENGTH: 500;
    readonly MAX_LINE_LENGTH: 1000;
    readonly MIN_FUNCTION_LENGTH: 15;
    readonly MAX_FUNCTION_LENGTH: 50;
    readonly MIN_DUPLICATE_LINES: 5;
    readonly MAX_COMPLEXITY_THRESHOLD: 10;
    readonly MIN_VARIABLE_NAME_LENGTH: 3;
};
/**
 * Error and status messages
 */
export declare const REFACTORING_MESSAGES: {
    readonly CODE_TOO_LARGE: `Code too large for refactoring (max ${number}KB)`;
    readonly INVALID_PATTERN: "Invalid design pattern specified";
    readonly NO_CHANGES: "No refactoring changes were applied";
    readonly VARIABLE_NOT_FOUND: "Variable not found in code";
    readonly INVALID_VARIABLE_NAME: "New variable name is invalid";
    readonly NO_CALLBACKS_FOUND: "No callbacks found to convert";
    readonly NO_CONDITIONALS_FOUND: "No conditionals found to simplify";
    readonly NO_DEAD_CODE_FOUND: "No dead code found";
};
//# sourceMappingURL=refactoring-limits.d.ts.map