/**
 * Calculate code metrics including complexity, maintainability, and duplicates
 *
 * @param content - Source code content to analyze
 * @param performanceMonitor - Optional performance monitor for tracking
 * @returns Code metrics object
 */
export function calculateMetrics(content, performanceMonitor) {
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
    if (performanceMonitor) {
        performanceMonitor.mark('complexity-calculated');
    }
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
 * Generate improvement suggestions based on metrics and issues
 *
 * @param content - Source code content
 * @param issues - Detected code issues
 * @param metrics - Calculated code metrics
 * @returns Array of improvement suggestions
 */
export function generateSuggestions(content, issues, metrics) {
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
 *
 * @param issues - Detected code issues
 * @param metrics - Calculated code metrics
 * @returns Quality score from 0-100
 */
export function calculateScore(issues, metrics) {
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
//# sourceMappingURL=metrics.js.map