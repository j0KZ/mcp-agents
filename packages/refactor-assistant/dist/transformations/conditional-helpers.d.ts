/**
 * Conditional transformation helpers
 */
/**
 * Convert simple if-else return statements to ternary operators
 */
export declare function convertIfElseToTernary(code: string): {
    code: string;
    changed: boolean;
};
export declare function applyGuardClauses(code: string): {
    code: string;
    changed: boolean;
};
export declare function combineNestedConditions(code: string): {
    code: string;
    changed: boolean;
};
//# sourceMappingURL=conditional-helpers.d.ts.map