/**
 * SmartAnalyzer: Intelligent code analysis that knows what to look for
 * Integrates with all MCP tools and makes smart decisions
 */
export declare class SmartAnalyzer {
    private toolsAvailable;
    private lastAnalysis;
    constructor();
    /**
     * Initialize available MCP tools
     */
    private initializeTools;
    /**
     * Run full scan on entire project
     */
    fullScan(): Promise<any>;
    /**
     * Smart analysis of a single file
     */
    analyzeFile(filePath: string): Promise<any>;
    /**
     * Check test coverage for a file
     */
    checkTestCoverage(filePath: string): Promise<boolean>;
    /**
     * Run coverage analysis
     */
    checkCoverage(): Promise<any>;
    /**
     * Detect code duplicates
     */
    detectDuplicates(): Promise<any>;
    /**
     * Find complexity hotspots
     */
    findComplexity(): Promise<any[]>;
    /**
     * Suggest refactoring for a file
     */
    suggestRefactoring(filePath: string): Promise<void>;
    /**
     * Security scan for a file
     */
    scanSecurity(filePath: string): Promise<void>;
    /**
     * Run an MCP tool
     * Uses execFile to avoid shell command injection (CWE-78)
     */
    private runTool;
    /**
     * Calculate cyclomatic complexity (simplified)
     */
    private calculateComplexity;
    /**
     * Quick security check
     */
    private quickSecurityCheck;
    /**
     * Quick quality check
     */
    private quickQualityCheck;
    /**
     * Basic analysis fallback
     */
    private basicAnalysis;
    /**
     * Simple duplicate detection fallback
     */
    private simpleDuplicateDetection;
}
//# sourceMappingURL=smart-analyzer.d.ts.map