/**
 * Utilities for detecting and removing dead code
 */
/**
 * Find unused variables in code
 */
export declare function findUnusedVariables(code: string): string[];
/**
 * Find unreachable code after return statements
 */
export declare function findUnreachableCode(code: string): Array<{
    line: number;
    code: string;
}>;
/**
 * Remove unused variable declarations
 */
export declare function removeUnusedVariables(code: string, unusedVars: string[]): string;
/**
 * Remove unreachable code after return statements
 */
export declare function removeUnreachableCode(code: string): {
    code: string;
    removed: number;
};
//# sourceMappingURL=dead-code-detector.d.ts.map