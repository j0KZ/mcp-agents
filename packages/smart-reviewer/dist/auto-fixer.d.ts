/**
 * Auto-fixer implements the Pareto principle:
 * 20% of fixes solve 80% of common issues
 *
 * Core fixes (safe, high-confidence):
 * 1. Remove unused imports (PARETO_COVERAGE.UNUSED_IMPORTS% of issues)
 * 2. Remove console.log statements (PARETO_COVERAGE.CONSOLE_LOGS% of issues)
 * 3. Fix formatting issues (PARETO_COVERAGE.FORMATTING% of issues)
 * 4. Add null checks (PARETO_COVERAGE.NULL_CHECKS% of issues) - suggest only
 * 5. Fix type assertions (PARETO_COVERAGE.TYPE_ASSERTIONS% of issues) - suggest only
 */
export interface AutoFix {
    type: 'unused-import' | 'console-log' | 'null-check' | 'formatting' | 'type-assertion';
    description: string;
    line: number;
    column?: number;
    oldCode: string;
    newCode: string;
    confidence: number;
    safe: boolean;
    impact: 'high' | 'medium' | 'low';
}
export interface FixResult {
    fixes: AutoFix[];
    fixedCode: string;
    summary: {
        total: number;
        safe: number;
        requiresReview: number;
    };
}
/**
 * Core auto-fixer class - implements Pareto 80/20 fixes
 * Orchestrates specialized fixers for modularity
 */
export declare class AutoFixer {
    private readonly fixers;
    /**
     * Create fix context from code (single split operation)
     */
    private createContext;
    /**
     * Analyze code and generate auto-fixes
     * Uses specialized fixers for modularity
     */
    generateFixes(code: string, filePath: string): Promise<FixResult>;
    /**
     * Apply safe fixes to code
     */
    private applyFixes;
    /**
     * Preview fixes as a diff
     */
    generateDiff(fixes: AutoFix[]): string;
}
//# sourceMappingURL=auto-fixer.d.ts.map