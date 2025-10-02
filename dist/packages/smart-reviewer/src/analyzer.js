import { FileSystemManager, AnalysisCache, PerformanceMonitor, generateHash, REGEX, QUALITY_THRESHOLDS, } from '@mcp-tools/shared';
export class CodeAnalyzer {
    fsManager;
    analysisCache;
    performanceMonitor;
    constructor() {
        this.fsManager = new FileSystemManager(500); // Cache up to 500 files
        this.analysisCache = new AnalysisCache(200, 1800000); // 200 analyses, 30min TTL
        this.performanceMonitor = new PerformanceMonitor();
    }
    /**
     * Analyze code file and return review results
     */
    async analyzeFile(filePath) {
        this.performanceMonitor.start();
        // Read file with caching
        const content = await this.fsManager.readFile(filePath, true);
        const fileHash = generateHash(content);
        // Check cache
        const cached = this.analysisCache.get(filePath, 'code-review', fileHash);
        if (cached) {
            return cached;
        }
        const issues = await this.detectIssues(content, filePath);
        const metrics = this.calculateMetrics(content);
        const suggestions = this.generateSuggestions(content, issues, metrics);
        const overallScore = this.calculateScore(issues, metrics);
        const performanceMetrics = this.performanceMonitor.stop();
        const result = {
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
     * Detect code issues and anti-patterns
     */
    async detectIssues(content, filePath) {
        const issues = [];
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNum = i + 1;
            // Check for 'var' usage
            if (line.includes('var ') && !line.trim().startsWith('//')) {
                issues.push({
                    line: lineNum,
                    severity: 'warning',
                    message: "Avoid 'var'. Use 'const' or 'let' instead.",
                    rule: 'no-var',
                    fix: {
                        description: "Replace 'var' with 'const' or 'let'",
                        oldCode: line,
                        newCode: line.replace(/\bvar\b/, 'const')
                    }
                });
            }
            // Check for console.log
            if (line.includes('console.log') && !line.trim().startsWith('//')) {
                issues.push({
                    line: lineNum,
                    severity: 'info',
                    message: 'Remove console.log before production',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove console.log statement',
                        oldCode: line,
                        newCode: ''
                    }
                });
            }
            // Check for TODO comments using shared regex
            if (REGEX.TODO_COMMENT.test(line)) {
                issues.push({
                    line: lineNum,
                    severity: 'info',
                    message: 'Unresolved TODO/FIXME comment',
                    rule: 'no-todo'
                });
            }
            // Check for long lines using shared threshold
            if (line.length > QUALITY_THRESHOLDS.MAX_LINE_LENGTH) {
                issues.push({
                    line: lineNum,
                    severity: 'info',
                    message: `Line too long (${line.length} chars). Consider breaking it up.`,
                    rule: 'max-line-length'
                });
            }
            // Check for multiple blank lines
            if (i > 0 && !line.trim() && !lines[i - 1].trim()) {
                issues.push({
                    line: lineNum,
                    severity: 'info',
                    message: 'Multiple consecutive blank lines',
                    rule: 'no-multiple-empty-lines'
                });
            }
            // Check for == instead of ===
            if (line.includes('==') && !line.includes('===') && !line.trim().startsWith('//')) {
                const match = line.match(/([^=!])={2}([^=])/);
                if (match) {
                    issues.push({
                        line: lineNum,
                        severity: 'warning',
                        message: "Use '===' instead of '==' for comparison",
                        rule: 'eqeqeq',
                        fix: {
                            description: "Replace '==' with '==='",
                            oldCode: line,
                            newCode: line.replace(/([^=!])={2}([^=])/, '$1===$2')
                        }
                    });
                }
            }
            // Check for function complexity (too many parameters)
            const funcMatch = line.match(/function\s+\w+\s*\(([^)]*)\)/);
            if (funcMatch) {
                const params = funcMatch[1].split(',').filter(p => p.trim());
                if (params.length > 5) {
                    issues.push({
                        line: lineNum,
                        severity: 'warning',
                        message: `Function has too many parameters (${params.length}). Consider using an options object.`,
                        rule: 'max-params'
                    });
                }
            }
            // Check for magic numbers
            const magicNumberMatch = line.match(/[^a-zA-Z_]\d{2,}[^a-zA-Z_0-9]/);
            if (magicNumberMatch && !line.trim().startsWith('//')) {
                issues.push({
                    line: lineNum,
                    severity: 'info',
                    message: 'Avoid magic numbers. Use named constants.',
                    rule: 'no-magic-numbers'
                });
            }
            // Check for empty catch blocks
            if (line.includes('catch') && i + 1 < lines.length && lines[i + 1].trim() === '}') {
                issues.push({
                    line: lineNum,
                    severity: 'error',
                    message: 'Empty catch block. Handle errors properly.',
                    rule: 'no-empty-catch'
                });
            }
            // Check for nested ternary operators
            const ternaryCount = (line.match(/\?/g) || []).length;
            if (ternaryCount > 1) {
                issues.push({
                    line: lineNum,
                    severity: 'warning',
                    message: 'Nested ternary operators reduce readability',
                    rule: 'no-nested-ternary'
                });
            }
        }
        return issues;
    }
    /**
     * Calculate code metrics
     */
    calculateMetrics(content) {
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(l => l.trim().length > 0);
        const comments = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*'));
        // Calculate cyclomatic complexity (simplified)
        const complexityKeywords = ['if', 'else', 'for', 'while', 'case', '&&', '||', '?'];
        let complexity = 1; // Base complexity
        for (const line of lines) {
            for (const keyword of complexityKeywords) {
                if (line.includes(keyword)) {
                    complexity++;
                }
            }
        }
        // Mark checkpoint for complexity calculation
        this.performanceMonitor.mark('complexity-calculated');
        // Maintainability index (simplified formula)
        const volume = nonEmptyLines.length * Math.log2(nonEmptyLines.length || 1);
        const maintainability = Math.max(0, Math.min(100, 171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(nonEmptyLines.length || 1)));
        // Detect duplicate blocks (simplified)
        const lineHashes = new Map();
        let duplicates = 0;
        for (const line of nonEmptyLines) {
            const hash = line.trim();
            if (hash.length > 20) { // Only consider substantial lines
                lineHashes.set(hash, (lineHashes.get(hash) || 0) + 1);
            }
        }
        for (const count of lineHashes.values()) {
            if (count > 1)
                duplicates += count - 1;
        }
        return {
            complexity,
            maintainability: Math.round(maintainability),
            linesOfCode: nonEmptyLines.length,
            commentDensity: Math.round((comments.length / nonEmptyLines.length) * 100) || 0,
            duplicateBlocks: duplicates
        };
    }
    /**
     * Generate improvement suggestions
     */
    generateSuggestions(content, issues, metrics) {
        const suggestions = [];
        // Complexity suggestions
        if (metrics.complexity > 15) {
            suggestions.push(`High complexity (${metrics.complexity}). Consider breaking down into smaller functions.`);
        }
        // Maintainability suggestions
        if (metrics.maintainability < 65) {
            suggestions.push(`Low maintainability score (${metrics.maintainability}/100). Refactor for better readability.`);
        }
        // Comment density suggestions
        if (metrics.commentDensity < 10) {
            suggestions.push('Low comment density. Add more documentation for complex logic.');
        }
        // Duplicate code suggestions
        if (metrics.duplicateBlocks > 5) {
            suggestions.push(`Found ${metrics.duplicateBlocks} duplicate code blocks. Consider extracting to functions.`);
        }
        // Issue-based suggestions
        const errorCount = issues.filter(i => i.severity === 'error').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;
        if (errorCount > 0) {
            suggestions.push(`Fix ${errorCount} critical error${errorCount > 1 ? 's' : ''} immediately.`);
        }
        if (warningCount > 5) {
            suggestions.push(`Address ${warningCount} warnings to improve code quality.`);
        }
        // File size suggestion
        if (metrics.linesOfCode > 500) {
            suggestions.push(`File is large (${metrics.linesOfCode} LOC). Consider splitting into modules.`);
        }
        return suggestions;
    }
    /**
     * Calculate overall code quality score
     */
    calculateScore(issues, metrics) {
        let score = 100;
        // Deduct for issues
        const errors = issues.filter(i => i.severity === 'error').length;
        const warnings = issues.filter(i => i.severity === 'warning').length;
        const infos = issues.filter(i => i.severity === 'info').length;
        score -= errors * 10;
        score -= warnings * 3;
        score -= infos * 1;
        // Factor in metrics
        score -= Math.max(0, (metrics.complexity - 10) * 2);
        score += (metrics.maintainability - 50) / 5;
        score += metrics.commentDensity / 5;
        score -= metrics.duplicateBlocks * 2;
        return Math.max(0, Math.min(100, Math.round(score)));
    }
    /**
     * Analyze multiple files in batch with parallel processing
     */
    async analyzeFiles(filePaths, concurrency = 5) {
        const results = new Map();
        // Use shared batch processing utility
        const { batchProcess } = await import('@mcp-tools/shared');
        const reviews = await batchProcess(filePaths, async (filePath) => {
            try {
                return await this.analyzeFile(filePath);
            }
            catch (error) {
                console.error(`Failed to analyze ${filePath}:`, error);
                return null;
            }
        }, {
            concurrency,
            onProgress: (completed, total) => {
                console.log(`Progress: ${completed}/${total} files analyzed`);
            },
        });
        filePaths.forEach((filePath, index) => {
            if (reviews[index]) {
                results.set(filePath, reviews[index]);
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
    clearCache() {
        this.fsManager.clearCache();
        this.analysisCache.clear();
    }
    /**
     * Invalidate cache for specific file
     */
    invalidateCache(filePath) {
        this.analysisCache.invalidate(filePath);
    }
    /**
     * Apply automatic fixes to code
     */
    async applyFixes(content, issues) {
        const lines = content.split('\n');
        // Build a map of line number -> new content to avoid line number shifting
        const lineChanges = new Map();
        for (const issue of issues) {
            if (issue.fix && issue.line > 0 && issue.line <= lines.length) {
                // null means delete the line, empty string or content means replace
                lineChanges.set(issue.line, issue.fix.newCode === '' ? null : issue.fix.newCode);
            }
        }
        // Apply all changes at once
        const result = lines
            .map((line, idx) => {
            const lineNum = idx + 1;
            if (lineChanges.has(lineNum)) {
                return lineChanges.get(lineNum); // Returns null for deletions, new content for replacements
            }
            return line;
        })
            .filter(line => line !== null); // Remove deleted lines
        return result.join('\n');
    }
}
//# sourceMappingURL=analyzer.js.map