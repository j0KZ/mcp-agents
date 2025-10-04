import { COMPLEXITY_LIMITS, MAINTAINABILITY_CONSTANTS, INDEX_CONSTANTS } from '../constants/refactoring-limits.js';
/**
 * Calculate nesting depth at a specific line index
 */
export function getNestingDepth(lines, index) {
    let depth = INDEX_CONSTANTS.FIRST_ARRAY_INDEX;
    for (let i = 0; i <= index; i++) {
        const line = lines[i];
        depth += (line.match(/\{/g) || []).length;
        depth -= (line.match(/\}/g) || []).length;
    }
    return Math.max(INDEX_CONSTANTS.FIRST_ARRAY_INDEX, depth);
}
/**
 * Find duplicate code blocks (simplified detection)
 */
export function findDuplicateBlocks(code) {
    const lines = code.split('\n');
    const duplicates = [];
    const minBlockSize = COMPLEXITY_LIMITS.MIN_DUPLICATE_BLOCK_SIZE;
    for (let i = 0; i < lines.length - minBlockSize; i++) {
        const block1 = lines.slice(i, i + minBlockSize).join('\n').trim();
        if (!block1)
            continue;
        for (let j = i + minBlockSize; j < lines.length - minBlockSize; j++) {
            const block2 = lines.slice(j, j + minBlockSize).join('\n').trim();
            if (block1 === block2) {
                duplicates.push({ line1: i + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET, line2: j + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET });
            }
        }
    }
    return duplicates;
}
/**
 * Calculate cyclomatic complexity
 */
function calculateCyclomaticComplexity(code) {
    const decisionPoints = [
        /\bif\b/g,
        /\belse\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /\b&&\b/g,
        /\b\|\|\b/g,
        /\?/g,
    ];
    let complexity = COMPLEXITY_LIMITS.BASE_COMPLEXITY; // Base complexity
    decisionPoints.forEach(pattern => {
        const matches = code.match(pattern);
        complexity += matches ? matches.length : 0;
    });
    return complexity;
}
/**
 * Calculate maintainability index
 */
function calculateMaintainabilityIndex(loc, complexity, functionCount) {
    // Simplified maintainability index calculation
    // Real formula: 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
    const volume = loc * Math.log2(functionCount || 1);
    const index = Math.max(MAINTAINABILITY_CONSTANTS.MIN_SCORE, Math.min(MAINTAINABILITY_CONSTANTS.MAX_SCORE, MAINTAINABILITY_CONSTANTS.BASE_VALUE -
        MAINTAINABILITY_CONSTANTS.HALSTEAD_COEFFICIENT * Math.log(volume) -
        MAINTAINABILITY_CONSTANTS.COMPLEXITY_COEFFICIENT * complexity -
        MAINTAINABILITY_CONSTANTS.LOC_COEFFICIENT * Math.log(loc)));
    return Math.round(index);
}
/**
 * Calculate code metrics for quality analysis
 *
 * @param code - Source code to analyze
 * @returns Code metrics object
 */
export function calculateMetrics(code) {
    const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    const functionCount = (code.match(/function\s+\w+/g) || []).length +
        (code.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;
    const complexity = calculateCyclomaticComplexity(code);
    const maxNestingDepth = Math.max(...lines.map((_, idx) => getNestingDepth(lines, idx)));
    return {
        complexity,
        linesOfCode: lines.length,
        functionCount,
        maxNestingDepth,
        maintainabilityIndex: calculateMaintainabilityIndex(lines.length, complexity, functionCount),
    };
}
//# sourceMappingURL=metrics-calculator.js.map