import { CodeIssue, ReviewResult } from './types.js';
/**
 * CodeAnalyzer performs static code analysis and quality checks
 *
 * Features:
 * - File-level caching for performance optimization
 * - Analysis result caching with 30-minute TTL
 * - Performance monitoring and metrics
 * - Issue detection with auto-fix suggestions
 *
 * @example
 * ```typescript
 * const analyzer = new CodeAnalyzer();
 * const result = await analyzer.analyzeFile('src/index.ts');
 * console.log(result.overallScore); // 85
 * ```
 */
export declare class CodeAnalyzer {
    private fsManager;
    private analysisCache;
    private performanceMonitor;
    /**
     * Creates a new CodeAnalyzer instance
     *
     * Initializes caching and monitoring systems:
     * - File cache: 500 files
     * - Analysis cache: 200 results with 30-minute TTL
     */
    constructor();
    /**
     * Analyzes a code file and returns comprehensive review results
     *
     * This method performs multiple checks:
     * - Code quality issues (var usage, console.log, etc.)
     * - Complexity metrics (cyclomatic complexity, LOC)
     * - Best practice suggestions
     * - Performance analysis
     *
     * Results are cached based on file hash to improve performance
     * on subsequent analyses of unchanged files.
     *
     * @param filePath - Absolute path to the file to analyze
     * @returns Promise resolving to complete review results
     * @throws Error if file cannot be read or is too large
     *
     * @example
     * ```typescript
     * const result = await analyzer.analyzeFile('/path/to/file.ts');
     * console.log(`Found ${result.issues.length} issues`);
     * console.log(`Overall score: ${result.overallScore}/100`);
     * ```
     */
    analyzeFile(filePath: string): Promise<ReviewResult>;
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