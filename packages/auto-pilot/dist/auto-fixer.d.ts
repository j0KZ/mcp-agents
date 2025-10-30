/**
 * AutoFixer: Automatically fixes common issues without user intervention
 * Smart enough to know what's safe to fix and what needs human review
 */
export declare class AutoFixer {
    private fixHistory;
    private safeFixPatterns;
    constructor();
    /**
     * Initialize patterns that are ALWAYS safe to fix automatically
     */
    private initializeSafeFixPatterns;
    /**
     * Automatically fix all issues in a file
     */
    autoFix(filePath: string): Promise<void>;
    /**
     * Fix everything in the project
     */
    fixEverything(): Promise<void>;
    /**
     * Remove console.log statements from a file
     */
    removeConsoleLogs(filePath: string): Promise<void>;
    /**
     * Add JSDoc documentation
     */
    addDocumentation(filePath: string): Promise<void>;
    /**
     * Fix TypeScript specific issues
     */
    private fixTypeScriptIssues;
    /**
     * Run smart-reviewer auto-fix
     */
    private runSmartReviewerFix;
    /**
     * Record fixes for history
     */
    private recordFix;
    /**
     * Generate test for a file automatically
     */
    generateTestsFor(filePath: string): Promise<void>;
    /**
     * Generate basic test file
     */
    private generateBasicTest;
    /**
     * Check if file looks good after fixes
     */
    verify(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=auto-fixer.d.ts.map