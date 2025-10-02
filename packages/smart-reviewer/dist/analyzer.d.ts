import { CodeIssue, ReviewResult } from './types.js';
export declare class CodeAnalyzer {
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
     * Apply automatic fixes to code
     */
    applyFixes(content: string, issues: CodeIssue[]): Promise<string>;
}
//# sourceMappingURL=analyzer.d.ts.map