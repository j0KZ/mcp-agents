/**
 * Core refactoring logic and transformations
 */
import { RefactoringResult, RefactoringSuggestion, ExtractFunctionOptions, ConvertToAsyncOptions, SimplifyConditionalsOptions, RemoveDeadCodeOptions, ApplyPatternOptions, RenameVariableOptions, CodeMetrics } from './types.js';
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
/**
 * Convert callback-based code to async/await
 *
 * @param options - Conversion options including source code
 * @returns Refactoring result with async/await syntax
 *
 * @example
 * ```typescript
 * const result = convertToAsync({
 *   code: 'fs.readFile("file.txt", (err, data) => { ... })',
 *   useTryCatch: true
 * });
 * ```
 */
export declare function convertToAsync(options: ConvertToAsyncOptions): RefactoringResult;
/**
 * Simplify nested conditionals and complex if/else chains
 *
 * @param options - Simplification options
 * @returns Refactoring result with simplified conditionals
 *
 * @example
 * ```typescript
 * const result = simplifyConditionals({
 *   code: 'if (x) { if (y) { return z; } }',
 *   useGuardClauses: true
 * });
 * ```
 */
export declare function simplifyConditionals(options: SimplifyConditionalsOptions): RefactoringResult;
/**
 * Remove dead code including unused variables, unreachable code, and unused imports
 *
 * @param options - Dead code removal options
 * @returns Refactoring result with dead code removed
 *
 * @example
 * ```typescript
 * const result = removeDeadCode({
 *   code: sourceCode,
 *   removeUnusedImports: true
 * });
 * ```
 */
export declare function removeDeadCode(options: RemoveDeadCodeOptions): RefactoringResult;
/**
 * Apply a design pattern to existing code
 *
 * @param options - Pattern application options
 * @returns Refactoring result with design pattern applied
 *
 * @example
 * ```typescript
 * const result = applyDesignPattern({
 *   code: classCode,
 *   pattern: 'singleton'
 * });
 * ```
 */
export declare function applyDesignPattern(options: ApplyPatternOptions): RefactoringResult;
/**
 * Rename a variable consistently throughout the code
 *
 * @param options - Rename options including old and new names
 * @returns Refactoring result with renamed variable
 *
 * @example
 * ```typescript
 * const result = renameVariable({
 *   code: sourceCode,
 *   oldName: 'temp',
 *   newName: 'userTemperature'
 * });
 * ```
 */
export declare function renameVariable(options: RenameVariableOptions): RefactoringResult;
/**
 * Analyze code and suggest refactorings
 *
 * @param code - Source code to analyze
 * @param filePath - Optional file path for context
 * @returns Array of refactoring suggestions
 *
 * @example
 * ```typescript
 * const suggestions = suggestRefactorings(sourceCode, 'src/utils.ts');
 * ```
 */
export declare function suggestRefactorings(code: string, _filePath?: string): RefactoringSuggestion[];
/**
 * Calculate code metrics for quality analysis
 *
 * @param code - Source code to analyze
 * @returns Code metrics object
 */
export declare function calculateMetrics(code: string): CodeMetrics;
//# sourceMappingURL=refactorer.d.ts.map