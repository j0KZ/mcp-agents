/**
 * Limits and thresholds for code transformations
 * Extracted to prevent magic numbers and improve maintainability
 */
export declare const REGEX_LIMITS: {
    readonly MAX_PROMISE_CALLBACK_LENGTH: 500;
    readonly MAX_LINE_LENGTH: 1000;
    readonly MAX_NESTING_DEPTH: 3;
    readonly MAX_CONDITION_LENGTH: 200;
    readonly MAX_RETURN_VALUE_LENGTH: 200;
};
export declare const CONDITIONAL_LIMITS: {
    readonly MAX_TERNARY_DEPTH: 2;
    readonly MIN_GUARD_CLAUSE_BLOCK: 3;
    readonly MAX_IF_ELSE_CHAIN: 4;
};
export declare const DEAD_CODE_LIMITS: {
    readonly UNREACHABLE_CHECK_LINES: 5;
    readonly MIN_VARIABLE_USAGE: 1;
};
export declare const RENAME_LIMITS: {
    readonly MAX_RENAME_OCCURRENCES: 1000;
    readonly MIN_VARIABLE_NAME_LENGTH: 1;
    readonly MAX_VARIABLE_NAME_LENGTH: 50;
};
export declare const SUGGESTION_LIMITS: {
    readonly MIN_FUNCTION_LENGTH_FOR_EXTRACTION: 20;
    readonly MIN_COMPLEXITY_FOR_SUGGESTION: 10;
    readonly MAX_SUGGESTIONS: 10;
    readonly MIN_NESTING_FOR_SUGGESTION: 3;
};
export declare const EXTRACTION_LIMITS: {
    readonly MAX_FUNCTION_PARAMETERS: 5;
    readonly MAX_EXTRACTED_FUNCTION_LENGTH: 100;
};
//# sourceMappingURL=transformation-limits.d.ts.map