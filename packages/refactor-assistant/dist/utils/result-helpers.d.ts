/**
 * Helper functions for building RefactoringResult objects
 * Reduces code duplication across refactorer.ts
 */
import { RefactoringResult, RefactoringChange } from '../types.js';
/**
 * Create a success result with warnings if no changes were made
 */
export declare function createSuccessResult(code: string, changes: RefactoringChange[], noChangesWarning?: string): RefactoringResult;
/**
 * Create an error result from an exception
 */
export declare function createErrorResult(originalCode: string, error: unknown, defaultMessage: string): RefactoringResult;
/**
 * Create a validation error result
 */
export declare function createValidationError(code: string, errorMessage: string): RefactoringResult;
/**
 * Check if code size exceeds limit
 */
export declare function validateCodeSize(code: string, maxSize: number): RefactoringResult | null;
/**
 * Create a simple success result with a single change
 */
export declare function createSingleChangeResult(originalCode: string, refactoredCode: string, changeType: RefactoringChange['type'], description: string): RefactoringResult;
//# sourceMappingURL=result-helpers.d.ts.map