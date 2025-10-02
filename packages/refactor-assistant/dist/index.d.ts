/**
 * Refactoring Assistant - MCP Server for Code Refactoring
 *
 * A powerful MCP server that provides intelligent code refactoring capabilities
 * including function extraction, async/await conversion, conditional simplification,
 * dead code removal, design pattern application, and more.
 *
 * @module refactor-assistant
 */
export { extractFunction, convertToAsync, simplifyConditionals, removeDeadCode, applyDesignPattern, renameVariable, suggestRefactorings, calculateMetrics, } from './refactorer.js';
export type { RefactoringResult, RefactoringChange, RefactoringSuggestion, RefactoringConfig, RefactoringType, RefactoringSeverity, DesignPattern, ExtractFunctionOptions, ConvertToAsyncOptions, SimplifyConditionalsOptions, RemoveDeadCodeOptions, ApplyPatternOptions, RenameVariableOptions, CodeMetrics, } from './types.js';
export declare const VERSION = "1.0.0";
export declare const NAME = "@my-claude-agents/refactor-assistant";
export declare const DESCRIPTION = "Intelligent code refactoring assistant with design pattern support";
//# sourceMappingURL=index.d.ts.map