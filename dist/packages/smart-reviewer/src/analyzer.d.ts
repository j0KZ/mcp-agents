import { CodeIssue, ReviewResult } from './types.js';
export declare class CodeAnalyzer {
    private fsManager;
    private analysisCache;
    private performanceMonitor;
    constructor();
    /**
     * Analyze code file and return review results
     */
    analyzeFile(filePath: string): Promise<ReviewResult>;
    /**
     * Detect code issues and anti-patterns
     */
    private detectIssues;
    /**
     * Calculate code metrics
     */
    private calculateMetrics;
    /**
     * Generate improvement suggestions
     */
    private generateSuggestions;
    /**
     * Calculate overall code quality score
     */
    private calculateScore;
    /**
     * Analyze multiple files in batch with parallel processing
     */
    analyzeFiles(filePaths: string[], concurrency?: number): Promise<Map<string, ReviewResult>>;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        fileCache: any;
        analysisCache: any;
    };
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Invalidate cache for specific file
     */
    invalidateCache(filePath: string): void;
    /**
     * Apply automatic fixes to code
     */
    applyFixes(content: string, issues: CodeIssue[]): Promise<string>;
}
//# sourceMappingURL=analyzer.d.ts.map