/**
 * Helper functions for building RefactoringResult objects
 * Reduces code duplication across refactorer.ts
 */
import { REFACTORING_MESSAGES, PATTERN_CONSTANTS } from '../constants/refactoring-limits.js';
import { getErrorMessage } from './error-helpers.js';
/**
 * Create a success result with warnings if no changes were made
 */
export function createSuccessResult(code, changes, noChangesWarning) {
    const hasNoChanges = changes.length === PATTERN_CONSTANTS.NO_OCCURRENCES;
    return {
        code,
        changes,
        success: true,
        warnings: hasNoChanges && noChangesWarning ? [noChangesWarning] : undefined,
    };
}
/**
 * Create an error result from an exception
 */
export function createErrorResult(originalCode, error, defaultMessage) {
    return {
        code: originalCode,
        changes: [],
        success: false,
        error: getErrorMessage(error, defaultMessage),
    };
}
/**
 * Create a validation error result
 */
export function createValidationError(code, errorMessage) {
    return {
        code,
        changes: [],
        success: false,
        error: errorMessage,
    };
}
/**
 * Check if code size exceeds limit
 */
export function validateCodeSize(code, maxSize) {
    if (code.length > maxSize) {
        return createValidationError(code, REFACTORING_MESSAGES.CODE_TOO_LARGE);
    }
    return null;
}
/**
 * Create a simple success result with a single change
 */
export function createSingleChangeResult(originalCode, refactoredCode, changeType, description) {
    return {
        code: refactoredCode,
        changes: [
            {
                type: changeType,
                description,
                before: originalCode,
                after: refactoredCode,
            },
        ],
        success: true,
    };
}
//# sourceMappingURL=result-helpers.js.map