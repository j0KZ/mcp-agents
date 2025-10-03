/**
 * Core refactoring logic and transformations
 */
import { RefactoringResult, RefactoringSuggestion, ConvertToAsyncOptions, SimplifyConditionalsOptions, RemoveDeadCodeOptions, ApplyPatternOptions, RenameVariableOptions } from './types.js';
export { extractFunction } from './core/extract-function.js';
export { calculateMetrics, findDuplicateBlocks } from './analysis/metrics-calculator.js';
/**
 * Convert callback-based code to async/await
 */
export declare function convertToAsync(options: ConvertToAsyncOptions): RefactoringResult;
/**
 * Simplify nested conditionals and complex if/else chains
 */
export declare function simplifyConditionals(options: SimplifyConditionalsOptions): RefactoringResult;
/**
 * Remove dead code including unused variables, unreachable code, and unused imports
 */
export declare function removeDeadCode(options: RemoveDeadCodeOptions): RefactoringResult;
/**
 * Apply design patterns to code
 */
export declare function applyDesignPattern(options: ApplyPatternOptions): RefactoringResult;
/**
 * Rename a variable consistently throughout code
 */
export declare function renameVariable(options: RenameVariableOptions): RefactoringResult;
/**
 * Suggest refactorings based on code analysis
 */
export declare function suggestRefactorings(code: string, _filePath?: string): RefactoringSuggestion[];
//# sourceMappingURL=refactorer.d.ts.map