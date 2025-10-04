/**
 * Error handling utilities for refactoring operations
 */
/**
 * Extract error message from Error object or unknown error
 * @param error - Error object or unknown error
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error message string
 */
export declare function getErrorMessage(error: unknown, defaultMessage: string): string;
/**
 * Create a failed refactoring result
 * @param code - Original code
 * @param error - Error message or Error object
 * @returns Failed refactoring result
 */
export declare function createFailedResult(code: string, error: string | Error): {
    code: string;
    changes: never[];
    success: false;
    error: string;
};
//# sourceMappingURL=error-helpers.d.ts.map