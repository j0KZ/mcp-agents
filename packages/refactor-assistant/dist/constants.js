/**
 * Constants for refactoring operations
 */
export const REFACTORING_LIMITS = {
    MAX_CODE_SIZE: 100000, // 100KB max input
    MAX_PATTERN_LENGTH: 200, // Max length for regex pattern matching
    MAX_BODY_LENGTH: 500, // Max length for function/block bodies in patterns
    MAX_LINE_LENGTH: 1000, // Max line length to prevent ReDoS
    MIN_FUNCTION_LENGTH: 15, // Minimum function length to suggest extraction
    MAX_FUNCTION_LENGTH: 50, // Maximum function length threshold
    MIN_DUPLICATE_LINES: 5, // Minimum lines for duplicate detection
    MAX_COMPLEXITY_THRESHOLD: 10, // Complexity threshold for suggestions
    MIN_VARIABLE_NAME_LENGTH: 3, // Minimum variable name length
};
export const REFACTORING_MESSAGES = {
    CODE_TOO_LARGE: 'Code too large for refactoring (max 100KB)',
    INVALID_PATTERN: 'Invalid design pattern specified',
    NO_CHANGES: 'No refactoring changes were applied',
    VARIABLE_NOT_FOUND: 'Variable not found in code',
    INVALID_VARIABLE_NAME: 'New variable name is invalid',
};
//# sourceMappingURL=constants.js.map