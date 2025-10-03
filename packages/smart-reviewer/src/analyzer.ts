import { CodeIssue, CodeMetrics, ReviewResult } from './types.js';
import {
  FileSystemManager,
  AnalysisCache,
  PerformanceMonitor,
  generateHash,
} from '@mcp-tools/shared';
import { DEFAULTS } from './constants.js';
import {
  detectIssues,
  calculateMetrics,
  generateSuggestions,
  calculateScore,
  applyFixes,
} from './analyzers/index.js';

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
export class CodeAnalyzer {
  private fsManager: FileSystemManager;
  private analysisCache: AnalysisCache;
  private performanceMonitor: PerformanceMonitor;

  /**
   * Creates a new CodeAnalyzer instance
   *
   * Initializes caching and monitoring systems:
   * - File cache: 500 files
   * - Analysis cache: 200 results with 30-minute TTL
   */
  constructor() {
    this.fsManager = new FileSystemManager(DEFAULTS.FILE_CACHE_SIZE);
    this.analysisCache = new AnalysisCache(DEFAULTS.ANALYSIS_CACHE_SIZE, DEFAULTS.CACHE_TTL_MS);
    this.performanceMonitor = new PerformanceMonitor();
  }

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
  async analyzeFile(filePath: string): Promise<ReviewResult> {
    this.performanceMonitor.start();

    // Read file with caching
    const content = await this.fsManager.readFile(filePath, true);
    const fileHash = generateHash(content);

    // Check cache
    const cached = this.analysisCache.get(filePath, 'code-review', fileHash);
    if (cached) {
      return cached;
    }

    const issues = await detectIssues(content, filePath);
    const metrics = calculateMetrics(content, this.performanceMonitor);
    const suggestions = generateSuggestions(content, issues, metrics);
    const overallScore = calculateScore(issues, metrics);

    const performanceMetrics = this.performanceMonitor.stop();

    const result: ReviewResult = {
      file: filePath,
      issues,
      metrics,
      suggestions,
      overallScore,
      timestamp: new Date().toISOString(),
      performance: {
        duration: performanceMetrics.duration,
        memoryUsed: performanceMetrics.memoryUsed,
      },
    };

    // Cache the result
    this.analysisCache.set(filePath, 'code-review', fileHash, result);

    return result;
  }


  /**
   * Analyze multiple files in batch with parallel processing
   */
  async analyzeFiles(filePaths: string[], concurrency: number = 5): Promise<Map<string, ReviewResult>> {
    const results = new Map<string, ReviewResult>();

    // Use shared batch processing utility
    const { batchProcess } = await import('@mcp-tools/shared');

    const reviews = await batchProcess(
      filePaths,
      async (filePath) => {
        try {
          return await this.analyzeFile(filePath);
        } catch (error) {
          // Sanitize path to prevent log injection
          const safePath = String(filePath).replace(/[\r\n]/g, '').substring(0, 500);
          console.error(`Failed to analyze ${safePath}:`, error instanceof Error ? error.message : String(error));
          return null;
        }
      },
      {
        concurrency,
        onProgress: (completed, total) => {
          // Progress callback - can be used by consumers for logging
          // console.log(`Progress: ${completed}/${total} files analyzed`);
        },
      }
    );

    filePaths.forEach((filePath, index) => {
      if (reviews[index]) {
        results.set(filePath, reviews[index]!);
      }
    });

    return results;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      fileCache: this.fsManager.getCacheStats(),
      analysisCache: this.analysisCache.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.fsManager.clearCache();
    this.analysisCache.clear();
  }

  /**
   * Invalidate cache for specific file
   */
  invalidateCache(filePath: string): void {
    this.analysisCache.invalidate(filePath);
  }

  /**
   * Apply automatic fixes to code
   */
  async applyFixes(content: string, issues: CodeIssue[]): Promise<string> {
    return applyFixes(content, issues);
  }
}
