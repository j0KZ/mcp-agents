/**
 * Extract Function Refactoring
 *
 * Extracts a code block into a separate function with automatic parameter detection.
 */
import { RefactoringResult, ExtractFunctionOptions } from '../types.js';
/**
 * Extract a code block into a separate function
 *
 * @param code - Source code containing the block to extract
 * @param options - Extraction options including function name and line range
 * @returns Refactoring result with extracted function
 *
 * @example
 * ```typescript
 * const result = extractFunction(sourceCode, {
 *   functionName: 'calculateTotal',
 *   startLine: 10,
 *   endLine: 15
 * });
 * ```
 */
export declare function extractFunction(code: string, options: ExtractFunctionOptions): RefactoringResult;
//# sourceMappingURL=extract-function.d.ts.map