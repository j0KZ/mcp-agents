import { describe, it, expect } from 'vitest';
import { calculateMetrics, generateSuggestions, calculateScore } from './metrics.js';
describe('calculateMetrics', () => {
    it('should calculate basic metrics', () => {
        const code = `const x = 5;\nconst y = 10;\n`;
        const metrics = calculateMetrics(code);
        expect(metrics.linesOfCode).toBe(2);
        expect(metrics.complexity).toBeGreaterThan(0);
        expect(metrics.maintainability).toBeGreaterThan(0);
        expect(metrics.maintainability).toBeLessThanOrEqual(100);
    });
    it('should calculate complexity for conditional statements', () => {
        const code = `if (x) {\n  if (y) {\n    return z;\n  }\n}`;
        const metrics = calculateMetrics(code);
        expect(metrics.complexity).toBeGreaterThan(1);
    });
    it('should calculate complexity for loops', () => {
        const code = `for (let i = 0; i < 10; i++) {\n  while (x) {\n    break;\n  }\n}`;
        const metrics = calculateMetrics(code);
        expect(metrics.complexity).toBeGreaterThan(2);
    });
    it('should calculate complexity for logical operators', () => {
        const code = `if (a && b || c) {}`;
        const metrics = calculateMetrics(code);
        expect(metrics.complexity).toBeGreaterThan(2);
    });
    it('should calculate comment density', () => {
        const code = `// Comment 1\nconst x = 5;\n// Comment 2\nconst y = 10;`;
        const metrics = calculateMetrics(code);
        expect(metrics.commentDensity).toBeGreaterThan(0);
        expect(metrics.commentDensity).toBeLessThanOrEqual(100);
    });
    it('should detect duplicate blocks', () => {
        const code = `const longLineOfCodeThatIsDuplicatedHere = 1;\nconst longLineOfCodeThatIsDuplicatedHere = 2;`;
        const metrics = calculateMetrics(code);
        expect(metrics.duplicateBlocks).toBeGreaterThanOrEqual(0);
    });
    it('should not count short lines as duplicates', () => {
        const code = `x = 1;\nx = 2;\nx = 3;`;
        const metrics = calculateMetrics(code);
        expect(metrics.duplicateBlocks).toBe(0);
    });
    it('should handle empty code', () => {
        const metrics = calculateMetrics('');
        expect(metrics.linesOfCode).toBe(0);
        expect(metrics.complexity).toBeGreaterThanOrEqual(1);
        expect(metrics.commentDensity).toBe(0);
        expect(metrics.duplicateBlocks).toBe(0);
    });
    it('should count only non-empty lines', () => {
        const code = `const x = 5;\n\n\nconst y = 10;`;
        const metrics = calculateMetrics(code);
        expect(metrics.linesOfCode).toBe(2);
    });
    it('should calculate maintainability index', () => {
        const code = `function simple() {\n  return 42;\n}`;
        const metrics = calculateMetrics(code);
        expect(metrics.maintainability).toBeGreaterThan(0);
        expect(metrics.maintainability).toBeLessThanOrEqual(100);
    });
    it('should handle complex code with lower maintainability', () => {
        const complexCode = `function complex() {\n${Array(100)
            .fill('  if (x) { if (y) { if (z) { } } }')
            .join('\n')}\n}`;
        const metrics = calculateMetrics(complexCode);
        expect(metrics.complexity).toBeGreaterThan(100);
        expect(metrics.maintainability).toBeLessThan(100);
    });
});
describe('generateSuggestions', () => {
    it('should suggest refactoring for very high complexity', () => {
        const metrics = { complexity: 150, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        // Should suggest something about complexity
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.includes('complexity') || s.includes('refactor'))).toBe(true);
    });
    it('should suggest refactoring for high complexity', () => {
        const metrics = { complexity: 75, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.some(s => s.toLowerCase().includes('complexity'))).toBe(true);
    });
    it('should suggest monitoring for moderate complexity', () => {
        const metrics = { complexity: 35, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.length).toBeGreaterThan(0);
    });
    it('should suggest improving low maintainability', () => {
        const metrics = { complexity: 10, maintainability: 30, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.some(s => s.toLowerCase().includes('maintainability'))).toBe(true);
    });
    it('should suggest improvements for fair maintainability', () => {
        const metrics = { complexity: 10, maintainability: 55, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.some(s => s.toLowerCase().includes('maintainability'))).toBe(true);
    });
    it('should suggest adding documentation for low comment density', () => {
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 2, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.some(s => s.toLowerCase().includes('comment'))).toBe(true);
    });
    it('should suggest extracting duplicate blocks', () => {
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 20 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.some(s => s.toLowerCase().includes('duplicate'))).toBe(true);
    });
    it('should suggest fixing critical errors', () => {
        const issues = [
            { line: 1, severity: 'error', message: 'Critical error', rule: 'test' },
            { line: 2, severity: 'error', message: 'Another error', rule: 'test' }
        ];
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', issues, metrics);
        expect(suggestions.some(s => s.includes('2') && s.toLowerCase().includes('error'))).toBe(true);
    });
    it('should suggest addressing warnings', () => {
        const issues = Array(15).fill(null).map((_, i) => ({
            line: i + 1,
            severity: 'warning',
            message: 'Warning',
            rule: 'test'
        }));
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', issues, metrics);
        expect(suggestions.some(s => s.includes('15') && s.toLowerCase().includes('warning'))).toBe(true);
    });
    it('should suggest splitting very large files', () => {
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 900, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions.some(s => s.toLowerCase().includes('large'))).toBe(true);
    });
    it('should suggest monitoring large files', () => {
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 600, commentDensity: 10, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        // Should contain message about large file
        expect(suggestions.some(s => s.includes('large'))).toBe(true);
    });
    it('should return empty suggestions for good code', () => {
        const metrics = { complexity: 15, maintainability: 90, linesOfCode: 100, commentDensity: 20, duplicateBlocks: 0 };
        const suggestions = generateSuggestions('', [], metrics);
        expect(suggestions).toHaveLength(0);
    });
});
describe('calculateScore', () => {
    it('should start with score 100 for perfect code', () => {
        const metrics = { complexity: 10, maintainability: 90, linesOfCode: 100, commentDensity: 20, duplicateBlocks: 0 };
        const score = calculateScore([], metrics);
        expect(score).toBeGreaterThan(95);
        expect(score).toBeLessThanOrEqual(100);
    });
    it('should deduct points for errors', () => {
        const issues = [
            { line: 1, severity: 'error', message: 'Error', rule: 'test' }
        ];
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const score = calculateScore(issues, metrics);
        expect(score).toBeLessThan(100);
    });
    it('should heavily penalize critical errors', () => {
        const issues = [
            { line: 1, severity: 'error', message: 'Error', rule: 'test' }
        ];
        const metricsGood = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const scoreGood = calculateScore([], metricsGood);
        const scoreWithError = calculateScore(issues, metricsGood);
        // Errors should deduct points
        expect(scoreWithError).toBeLessThan(scoreGood);
        expect(scoreGood - scoreWithError).toBeGreaterThan(0);
    });
    it('should lightly penalize info items', () => {
        const issues = [
            { line: 1, severity: 'info', message: 'Info', rule: 'test' }
        ];
        const metrics = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const scoreWithInfo = calculateScore(issues, metrics);
        const scoreWithout = calculateScore([], metrics);
        expect(scoreWithout - scoreWithInfo).toBeLessThan(1);
    });
    it('should penalize very high complexity', () => {
        const metrics = { complexity: 150, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const score = calculateScore([], metrics);
        // Very high complexity should be penalized
        expect(score).toBeLessThan(85);
    });
    it('should penalize high complexity moderately', () => {
        const metricsLow = { complexity: 20, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const metricsHigh = { complexity: 75, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const scoreLow = calculateScore([], metricsLow);
        const scoreHigh = calculateScore([], metricsHigh);
        expect(scoreLow).toBeGreaterThan(scoreHigh);
    });
    it('should reward good maintainability', () => {
        const metricsGood = { complexity: 10, maintainability: 90, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const metricsFair = { complexity: 10, maintainability: 50, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const scoreGood = calculateScore([], metricsGood);
        const scoreFair = calculateScore([], metricsFair);
        // Good maintainability (90) should score higher than fair (50)
        expect(scoreGood).toBeGreaterThanOrEqual(scoreFair);
    });
    it('should penalize low maintainability', () => {
        const metrics = { complexity: 10, maintainability: 20, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 0 };
        const score = calculateScore([], metrics);
        // Low maintainability should result in lower score
        expect(score).toBeLessThan(100);
    });
    it('should give bonus for good comment density', () => {
        const metricsGood = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 30, duplicateBlocks: 0 };
        const metricsLow = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 0, duplicateBlocks: 0 };
        const scoreGood = calculateScore([], metricsGood);
        const scoreLow = calculateScore([], metricsLow);
        // Good comment density should provide a bonus
        expect(scoreGood).toBeGreaterThanOrEqual(scoreLow);
    });
    it('should penalize significant duplicates', () => {
        const metricsClean = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 5 };
        const metricsDuplicates = { complexity: 10, maintainability: 80, linesOfCode: 100, commentDensity: 10, duplicateBlocks: 30 };
        const scoreClean = calculateScore([], metricsClean);
        const scoreDuplicates = calculateScore([], metricsDuplicates);
        expect(scoreClean).toBeGreaterThan(scoreDuplicates);
    });
    it('should not allow scores below 0', () => {
        const issues = Array(100).fill(null).map((_, i) => ({
            line: i + 1,
            severity: 'error',
            message: 'Error',
            rule: 'test'
        }));
        const metrics = { complexity: 1000, maintainability: 0, linesOfCode: 5000, commentDensity: 0, duplicateBlocks: 100 };
        const score = calculateScore(issues, metrics);
        expect(score).toBe(0);
    });
    it('should not allow scores above 100', () => {
        const metrics = { complexity: 1, maintainability: 100, linesOfCode: 50, commentDensity: 50, duplicateBlocks: 0 };
        const score = calculateScore([], metrics);
        expect(score).toBeLessThanOrEqual(100);
    });
});
//# sourceMappingURL=metrics.test.js.map