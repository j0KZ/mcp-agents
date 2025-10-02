/**
 * Type definitions for refactoring operations
 */
/**
 * Refactoring severity levels
 */
export type RefactoringSeverity = 'info' | 'warning' | 'critical';
/**
 * Design patterns that can be applied
 */
export type DesignPattern = 'singleton' | 'factory' | 'observer' | 'strategy' | 'decorator' | 'adapter' | 'facade' | 'proxy' | 'command' | 'chain-of-responsibility';
/**
 * Refactoring operation types
 */
export type RefactoringType = 'extract-function' | 'convert-to-async' | 'simplify-conditionals' | 'remove-dead-code' | 'apply-pattern' | 'rename-variable' | 'extract-interface' | 'inline-function';
/**
 * Configuration for refactoring operations
 */
export interface RefactoringConfig {
    /**
     * Enable automatic formatting after refactoring
     */
    autoFormat?: boolean;
    /**
     * Preserve original comments
     */
    preserveComments?: boolean;
    /**
     * Add descriptive comments for refactored code
     */
    addComments?: boolean;
    /**
     * Use TypeScript strict mode rules
     */
    strictMode?: boolean;
    /**
     * Maximum function length before suggesting extraction
     */
    maxFunctionLength?: number;
    /**
     * Maximum complexity before suggesting simplification
     */
    maxComplexity?: number;
}
/**
 * Result of a refactoring operation
 */
export interface RefactoringResult {
    /**
     * Refactored source code
     */
    code: string;
    /**
     * Changes that were applied
     */
    changes: RefactoringChange[];
    /**
     * Warnings or issues encountered
     */
    warnings?: string[];
    /**
     * Whether the refactoring was successful
     */
    success: boolean;
    /**
     * Error message if refactoring failed
     */
    error?: string;
}
/**
 * Details about a specific refactoring change
 */
export interface RefactoringChange {
    /**
     * Type of refactoring applied
     */
    type: RefactoringType;
    /**
     * Description of the change
     */
    description: string;
    /**
     * Line range affected (1-indexed)
     */
    lineRange?: {
        start: number;
        end: number;
    };
    /**
     * Original code snippet
     */
    before?: string;
    /**
     * Refactored code snippet
     */
    after?: string;
}
/**
 * Suggestion for potential refactoring
 */
export interface RefactoringSuggestion {
    /**
     * Type of refactoring suggested
     */
    type: RefactoringType;
    /**
     * Severity of the suggestion
     */
    severity: RefactoringSeverity;
    /**
     * Human-readable description
     */
    message: string;
    /**
     * Location in the code
     */
    location: {
        line: number;
        column?: number;
        endLine?: number;
        endColumn?: number;
    };
    /**
     * Code snippet to highlight
     */
    snippet?: string;
    /**
     * Suggested fix
     */
    suggestion?: string;
    /**
     * Rationale for the suggestion
     */
    rationale?: string;
}
/**
 * Options for extracting a function
 */
export interface ExtractFunctionOptions {
    /**
     * Name for the extracted function
     */
    functionName: string;
    /**
     * Line range to extract (1-indexed, inclusive)
     */
    startLine: number;
    endLine: number;
    /**
     * Whether to make it async
     */
    async?: boolean;
    /**
     * Whether to make it an arrow function
     */
    arrow?: boolean;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Options for converting to async/await
 */
export interface ConvertToAsyncOptions {
    /**
     * Source code to convert
     */
    code: string;
    /**
     * Whether to use try/catch for error handling
     */
    useTryCatch?: boolean;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Options for simplifying conditionals
 */
export interface SimplifyConditionalsOptions {
    /**
     * Source code to simplify
     */
    code: string;
    /**
     * Use guard clauses
     */
    useGuardClauses?: boolean;
    /**
     * Convert to ternary operators where appropriate
     */
    useTernary?: boolean;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Options for removing dead code
 */
export interface RemoveDeadCodeOptions {
    /**
     * Source code to analyze
     */
    code: string;
    /**
     * Remove unused imports
     */
    removeUnusedImports?: boolean;
    /**
     * Remove unreachable code
     */
    removeUnreachable?: boolean;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Options for applying design patterns
 */
export interface ApplyPatternOptions {
    /**
     * Source code to refactor
     */
    code: string;
    /**
     * Design pattern to apply
     */
    pattern: DesignPattern;
    /**
     * Context-specific options
     */
    patternOptions?: Record<string, unknown>;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Options for renaming variables
 */
export interface RenameVariableOptions {
    /**
     * Source code containing the variable
     */
    code: string;
    /**
     * Current variable name
     */
    oldName: string;
    /**
     * New variable name
     */
    newName: string;
    /**
     * Whether to rename in comments too
     */
    includeComments?: boolean;
    /**
     * Additional configuration
     */
    config?: RefactoringConfig;
}
/**
 * Code metrics for analysis
 */
export interface CodeMetrics {
    /**
     * Cyclomatic complexity
     */
    complexity: number;
    /**
     * Lines of code
     */
    linesOfCode: number;
    /**
     * Number of functions
     */
    functionCount: number;
    /**
     * Maximum nesting depth
     */
    maxNestingDepth: number;
    /**
     * Number of parameters (for functions)
     */
    parameterCount?: number;
    /**
     * Maintainability index (0-100)
     */
    maintainabilityIndex?: number;
}
//# sourceMappingURL=types.d.ts.map