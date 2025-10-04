/**
 * Limits and thresholds for code transformations
 * Extracted to prevent magic numbers and improve maintainability
 */
// Regex pattern limits (ReDoS protection)
export const REGEX_LIMITS = {
    // Maximum length for .then() callback body (line 95)
    MAX_PROMISE_CALLBACK_LENGTH: 500,
    // Maximum character limit for processing long lines
    MAX_LINE_LENGTH: 1000,
    // Maximum nesting depth before suggesting extraction
    MAX_NESTING_DEPTH: 3,
    // Maximum condition length for ternary conversion (line 158)
    MAX_CONDITION_LENGTH: 200,
    // Maximum return value length for ternary conversion (line 158)
    MAX_RETURN_VALUE_LENGTH: 200,
};
// Conditional simplification thresholds
export const CONDITIONAL_LIMITS = {
    // Maximum ternary nesting before warning
    MAX_TERNARY_DEPTH: 2,
    // Minimum block size for guard clause extraction
    MIN_GUARD_CLAUSE_BLOCK: 3,
    // Maximum if-else chain before suggesting switch
    MAX_IF_ELSE_CHAIN: 4,
};
// Dead code detection limits
export const DEAD_CODE_LIMITS = {
    // Lines after return to check for unreachable code
    UNREACHABLE_CHECK_LINES: 5,
    // Minimum variable usage count to keep (declaration counts as 1)
    MIN_VARIABLE_USAGE: 1,
};
// Variable renaming limits
export const RENAME_LIMITS = {
    // Maximum occurrences to rename (safety limit)
    MAX_RENAME_OCCURRENCES: 1000,
    // Minimum variable name length
    MIN_VARIABLE_NAME_LENGTH: 1,
    // Maximum variable name length
    MAX_VARIABLE_NAME_LENGTH: 50,
};
// Suggestion generation
export const SUGGESTION_LIMITS = {
    // Minimum function length to suggest extraction
    MIN_FUNCTION_LENGTH_FOR_EXTRACTION: 20,
    // Minimum complexity score to suggest simplification
    MIN_COMPLEXITY_FOR_SUGGESTION: 10,
    // Maximum suggestions to return
    MAX_SUGGESTIONS: 10,
    // Minimum nesting depth to suggest refactoring
    MIN_NESTING_FOR_SUGGESTION: 3,
};
// Function extraction limits
export const EXTRACTION_LIMITS = {
    // Maximum parameters before suggesting object parameter
    MAX_FUNCTION_PARAMETERS: 5,
    // Maximum extracted function length
    MAX_EXTRACTED_FUNCTION_LENGTH: 100,
};
//# sourceMappingURL=transformation-limits.js.map