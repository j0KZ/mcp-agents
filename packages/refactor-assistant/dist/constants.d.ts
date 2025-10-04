/**
 * Constants for refactoring operations
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
export declare const REFACTORING_MESSAGES: {
    readonly CODE_TOO_LARGE: "Code too large for refactoring (max 100KB)";
    readonly INVALID_PATTERN: "Invalid design pattern specified";
    readonly NO_CHANGES: "No refactoring changes were applied";
    readonly VARIABLE_NOT_FOUND: "Variable not found in code";
    readonly INVALID_VARIABLE_NAME: "New variable name is invalid";
};
//# sourceMappingURL=constants.d.ts.map