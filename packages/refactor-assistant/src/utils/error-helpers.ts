/**
 * Error handling utilities for refactoring operations
 */

/**
 * Extract error message from Error object or unknown error
 * @param error - Error object or unknown error
 * @param defaultMessage - Default message if error is not an Error instance
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

/**
 * Create a failed refactoring result
 * @param code - Original code
 * @param error - Error message or Error object
 * @returns Failed refactoring result
 */
export function createFailedResult(
  code: string,
  error: string | Error
): {
  code: string;
  changes: never[];
  success: false;
  error: string;
} {
  return {
    code,
    changes: [],
    success: false,
    error: typeof error === 'string' ? error : error.message,
  };
}
