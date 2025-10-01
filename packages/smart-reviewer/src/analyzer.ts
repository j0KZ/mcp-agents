import { readFile } from 'fs/promises';
import { CodeIssue, CodeMetrics, ReviewResult } from './types.js';

export class CodeAnalyzer {
  /**
   * Analyze code file and return review results
   */
  async analyzeFile(filePath: string): Promise<ReviewResult> {
    const content = await readFile(filePath, 'utf-8');

    const issues = await this.detectIssues(content, filePath);
    const metrics = this.calculateMetrics(content);
    const suggestions = this.generateSuggestions(content, issues, metrics);
    const overallScore = this.calculateScore(issues, metrics);

    return {
      file: filePath,
      issues,
      metrics,
      suggestions,
      overallScore,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Detect code issues and anti-patterns
   */
  private async detectIssues(content: string, filePath: string): Promise<CodeIssue[]> {
    const issues: CodeIssue[] = [];
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

      // Check for TODO comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          line: lineNum,
          severity: 'info',
          message: 'Unresolved TODO/FIXME comment',
          rule: 'no-todo'
        });
      }

      // Check for long lines
      if (line.length > 120) {
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
  private calculateMetrics(content: string): CodeMetrics {
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

    // Maintainability index (simplified formula)
    const volume = nonEmptyLines.length * Math.log2(nonEmptyLines.length || 1);
    const maintainability = Math.max(0, Math.min(100,
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(nonEmptyLines.length || 1)
    ));

    // Detect duplicate blocks (simplified)
    const lineHashes = new Map<string, number>();
    let duplicates = 0;
    for (const line of nonEmptyLines) {
      const hash = line.trim();
      if (hash.length > 20) { // Only consider substantial lines
        lineHashes.set(hash, (lineHashes.get(hash) || 0) + 1);
      }
    }
    for (const count of lineHashes.values()) {
      if (count > 1) duplicates += count - 1;
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
  private generateSuggestions(content: string, issues: CodeIssue[], metrics: CodeMetrics): string[] {
    const suggestions: string[] = [];

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
  private calculateScore(issues: CodeIssue[], metrics: CodeMetrics): number {
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
   * Apply automatic fixes to code
   */
  async applyFixes(content: string, issues: CodeIssue[]): Promise<string> {
    let fixedContent = content;
    const lines = fixedContent.split('\n');

    // Sort issues by line number in reverse to preserve line numbers during fixes
    const fixableIssues = issues
      .filter(issue => issue.fix)
      .sort((a, b) => b.line - a.line);

    for (const issue of fixableIssues) {
      if (issue.fix && issue.line > 0 && issue.line <= lines.length) {
        const lineIndex = issue.line - 1;
        if (issue.fix.newCode === '') {
          // Remove line
          lines.splice(lineIndex, 1);
        } else {
          // Replace line
          lines[lineIndex] = issue.fix.newCode;
        }
      }
    }

    return lines.join('\n');
  }
}
