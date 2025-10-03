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
    // Adjusted complexity thresholds (more realistic for production code)
    // 1-20: Simple, 21-50: Moderate, 51-100: Complex, 100+: Very Complex
    if (metrics.complexity > 100) {
        suggestions.push(`Very high complexity (${metrics.complexity}). Urgently refactor into smaller functions.`);
    }
    else if (metrics.complexity > 50) {
        suggestions.push(`High complexity (${metrics.complexity}). Consider breaking down into smaller functions.`);
    }
    else if (metrics.complexity > 20) {
        suggestions.push(`Moderate complexity (${metrics.complexity}). Monitor for future refactoring opportunities.`);
    }
    // Adjusted maintainability thresholds
    // 85-100: Excellent, 65-84: Good, 40-64: Fair, 0-39: Poor
    if (metrics.maintainability < 40) {
        suggestions.push(`Low maintainability score (${metrics.maintainability}/100). Refactor for better readability.`);
    }
    else if (metrics.maintainability < 65) {
        suggestions.push(`Fair maintainability score (${metrics.maintainability}/100). Consider minor improvements.`);
    }
    // Comment density suggestions (adjusted for JSDoc/TypeScript)
    if (metrics.commentDensity < 5) {
        suggestions.push('Low comment density. Add more documentation for complex logic.');
    }
    // Duplicate code suggestions (higher threshold)
    if (metrics.duplicateBlocks > 15) {
        suggestions.push(`Found ${metrics.duplicateBlocks} duplicate code blocks. Consider extracting to functions.`);
    }
    // Issue-based suggestions
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    if (errorCount > 0) {
        suggestions.push(`Fix ${errorCount} critical error${errorCount > 1 ? 's' : ''} immediately.`);
    }
    if (warningCount > 10) {
        suggestions.push(`Address ${warningCount} warnings to improve code quality.`);
    }
    // File size suggestion (adjusted threshold)
    if (metrics.linesOfCode > 800) {
        suggestions.push(`File is very large (${metrics.linesOfCode} LOC). Consider splitting into modules.`);
    }
    else if (metrics.linesOfCode > 500) {
        suggestions.push(`File is large (${metrics.linesOfCode} LOC). Monitor size for future refactoring.`);
    }
    return suggestions;
}
/**
 * Calculate overall code quality score (context-aware)
 *
 * @param issues - Detected code issues
 * @param metrics - Calculated code metrics
 * @returns Quality score from 0-100
 */
export function calculateScore(issues, metrics) {
    let score = 100;
    // Deduct for issues (adjusted weights)
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    score -= errors * 15; // Critical errors heavily penalized
    score -= warnings * 2; // Warnings moderately penalized
    score -= infos * 0.5; // Info items lightly penalized
    // Factor in metrics (adjusted thresholds and weights)
    // Complexity: penalize above 50 (not 10)
    if (metrics.complexity > 100) {
        score -= (metrics.complexity - 100) * 0.5;
    }
    else if (metrics.complexity > 50) {
        score -= (metrics.complexity - 50) * 0.3;
    }
    // Maintainability: reward good maintainability
    if (metrics.maintainability >= 65) {
        score += (metrics.maintainability - 65) / 5;
    }
    else if (metrics.maintainability < 40) {
        score -= (40 - metrics.maintainability) / 3;
    }
    // Comment density: slight bonus for documentation
    score += Math.min(5, metrics.commentDensity / 3);
    // Duplicates: penalize only if significant
    if (metrics.duplicateBlocks > 15) {
        score -= (metrics.duplicateBlocks - 15) * 0.5;
    }
    return Math.max(0, Math.min(100, Math.round(score)));
}
//# sourceMappingURL=metrics.js.map