/**
 * SmartAnalyzer: Intelligent code analysis that knows what to look for
 * Integrates with all MCP tools and makes smart decisions
 */

import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);

export class SmartAnalyzer {
  private toolsAvailable: Map<string, string> = new Map();
  private lastAnalysis: Map<string, any> = new Map();

  constructor() {
    this.initializeTools();
  }

  /**
   * Initialize available MCP tools
   */
  private initializeTools() {
    // Map of MCP tools we can use
    this.toolsAvailable.set('smart-reviewer', '@j0kz/smart-reviewer');
    this.toolsAvailable.set('security-scanner', '@j0kz/security-scanner');
    this.toolsAvailable.set('test-generator', '@j0kz/test-generator');
    this.toolsAvailable.set('architecture-analyzer', '@j0kz/architecture-analyzer');
    this.toolsAvailable.set('refactor-assistant', '@j0kz/refactor-assistant');
    this.toolsAvailable.set('code-historian', '@j0kz/code-historian');
  }

  /**
   * Run full scan on entire project
   */
  async fullScan(): Promise<any> {
    console.log('🔍 Running comprehensive analysis...');

    const results = {
      issues: [] as any[],
      metrics: {} as any,
      suggestions: [] as string[],
      critical: false,
    };

    try {
      // Run smart-reviewer on all files
      const reviewResult = await this.runTool('smart-reviewer', 'batch-review', {
        pattern: '**/*.{js,ts,jsx,tsx}',
        severity: 'moderate',
      });

      if (reviewResult.issues) {
        results.issues.push(...reviewResult.issues);
        results.critical = reviewResult.issues.some((i: any) => i.severity === 'critical');
      }

      // Run security scan
      const securityResult = await this.runTool('security-scanner', 'scan', {
        path: process.cwd(),
      });

      if (securityResult.vulnerabilities?.length > 0) {
        results.issues.push(
          ...securityResult.vulnerabilities.map((v: any) => ({
            type: 'security',
            severity: v.severity,
            message: v.message,
            file: v.file,
          }))
        );
        results.critical = true;
      }

      // Get architecture metrics
      const archResult = await this.runTool('architecture-analyzer', 'analyze', {
        checkCircular: true,
      });

      results.metrics = archResult.metrics || {};

      if (archResult.circularDependencies?.length > 0) {
        results.issues.push({
          type: 'architecture',
          severity: 'warning',
          message: `Found ${archResult.circularDependencies.length} circular dependencies`,
        });
      }
    } catch (error) {
      console.log('⚠️ Some analysis tools not available, using fallback analysis');
      // Fallback to basic analysis if tools not installed
      results.issues = await this.basicAnalysis();
    }

    this.lastAnalysis.set('full', results);
    return results;
  }

  /**
   * Smart analysis of a single file
   */
  async analyzeFile(filePath: string): Promise<any> {
    const content = await readFile(filePath, 'utf-8');

    const analysis = {
      complexity: this.calculateComplexity(content),
      hasTests: await this.checkTestCoverage(filePath),
      security: this.quickSecurityCheck(content),
      quality: this.quickQualityCheck(content),
      suggestions: [] as string[],
    };

    // Smart suggestions based on analysis
    if (analysis.complexity > 20) {
      analysis.suggestions.push('Consider refactoring - high complexity detected');
    }

    if (!analysis.hasTests) {
      analysis.suggestions.push('No tests found - consider adding test coverage');
    }

    if (analysis.security.issues.length > 0) {
      analysis.suggestions.push('Security issues detected - review immediately');
    }

    return analysis;
  }

  /**
   * Check test coverage for a file
   */
  async checkTestCoverage(filePath: string): Promise<boolean> {
    const testFiles = [
      filePath.replace(/\.(ts|js)$/, '.test.$1'),
      filePath.replace(/\.(ts|js)$/, '.spec.$1'),
      filePath.replace(/src/, 'tests').replace(/\.(ts|js)$/, '.test.$1'),
    ];

    for (const testFile of testFiles) {
      try {
        await readFile(testFile);
        return true;
      } catch {
        // Test file doesn't exist
      }
    }

    return false;
  }

  /**
   * Run coverage analysis
   */
  async checkCoverage(): Promise<any> {
    try {
      const { stdout } = await execAsync('npm test -- --coverage --silent', {
        cwd: process.cwd(),
      });

      // Parse coverage output
      const coverageMatch = stdout.match(/All files\s+\|\s+([\d.]+)/);
      const coverage = coverageMatch ? parseFloat(coverageMatch[1]) : 0;

      return {
        percentage: coverage,
        passing: coverage >= 75, // High standard for auto-pilot
        message:
          coverage < 75 ? 'Coverage below 75% - generating tests needed' : 'Coverage looks good',
      };
    } catch {
      return { percentage: 0, passing: false, message: 'No coverage data available' };
    }
  }

  /**
   * Detect code duplicates
   */
  async detectDuplicates(): Promise<any> {
    try {
      const result = await this.runTool('refactor-assistant', 'find-duplicates', {
        minLines: 5,
        similarity: 0.8,
      });

      return result.duplicates || [];
    } catch {
      // Fallback duplicate detection
      return this.simpleDuplicateDetection();
    }
  }

  /**
   * Find complexity hotspots
   */
  async findComplexity(): Promise<any[]> {
    const complexFiles: any[] = [];

    // This would scan all files and identify complex ones
    // For now, return placeholder
    return complexFiles;
  }

  /**
   * Suggest refactoring for a file
   */
  async suggestRefactoring(filePath: string): Promise<void> {
    console.log(`💡 Analyzing ${filePath} for refactoring opportunities...`);

    try {
      const result = await this.runTool('refactor-assistant', 'analyze', {
        file: filePath,
        suggest: true,
      });

      if (result.suggestions?.length > 0) {
        console.log('Refactoring suggestions:');
        result.suggestions.forEach((s: any) => console.log(`  • ${s}`));
      }
    } catch {
      // Basic refactoring suggestions
      const content = await readFile(filePath, 'utf-8');
      if (content.length > 500) {
        console.log('  • Consider breaking this into smaller functions');
      }
    }
  }

  /**
   * Security scan for a file
   */
  async scanSecurity(filePath: string): Promise<void> {
    console.log(`🔒 Security scanning ${filePath}...`);

    const content = await readFile(filePath, 'utf-8');
    const issues = this.quickSecurityCheck(content);

    if (issues.issues.length > 0) {
      console.log('⚠️ Security issues found:');
      issues.issues.forEach(issue => console.log(`  • ${issue}`));
    } else {
      console.log('✅ No security issues found');
    }
  }

  /**
   * Run an MCP tool
   * Uses execFile to avoid shell command injection (CWE-78)
   */
  private async runTool(tool: string, command: string, args: any): Promise<any> {
    const toolPackage = this.toolsAvailable.get(tool);
    if (!toolPackage) {
      throw new Error(`Tool ${tool} not available`);
    }

    // Validate toolPackage against allowed list to prevent injection
    const allowedPackages = Array.from(this.toolsAvailable.values());
    if (!allowedPackages.includes(toolPackage)) {
      throw new Error(`Invalid tool package: ${toolPackage}`);
    }

    try {
      // Use execFile instead of exec to avoid shell interpretation
      // Arguments are passed as array, not interpolated into shell command
      const { stdout } = await execFileAsync('npx', [toolPackage, command, JSON.stringify(args)], {
        cwd: process.cwd(),
      });
      return JSON.parse(stdout);
    } catch (error) {
      // Tool might not be installed or failed
      throw error;
    }
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   */
  private calculateComplexity(content: string): number {
    const patterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g, // ternary
    ];

    let complexity = 1; // Base complexity
    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  /**
   * Quick security check
   */
  private quickSecurityCheck(content: string): { issues: string[] } {
    const issues: string[] = [];

    const risks = [
      { pattern: /eval\s*\(/, message: 'eval() usage detected - potential code injection' },
      { pattern: /innerHTML\s*=/, message: 'innerHTML usage - potential XSS risk' },
      { pattern: /password\s*=\s*["']/, message: 'Hardcoded password detected' },
      { pattern: /api[_-]?key\s*=\s*["']/, message: 'Hardcoded API key detected' },
      { pattern: /require\s*\(\s*[`$]/, message: 'Dynamic require - potential security risk' },
    ];

    risks.forEach(risk => {
      if (risk.pattern.test(content)) {
        issues.push(risk.message);
      }
    });

    return { issues };
  }

  /**
   * Quick quality check
   */
  private quickQualityCheck(content: string): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // Check for common quality issues
    if (/console\.(log|debug)/.test(content)) {
      issues.push('Console statements found');
      score -= 5;
    }

    if (/TODO|FIXME|HACK/i.test(content)) {
      issues.push('Unresolved TODOs found');
      score -= 10;
    }

    if (/any\s*[:;]/.test(content)) {
      issues.push('TypeScript "any" type usage');
      score -= 15;
    }

    if (!/\/\*\*|\*\s+\*|\/\//.test(content)) {
      issues.push('No comments or documentation');
      score -= 20;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Basic analysis fallback
   */
  private async basicAnalysis(): Promise<any[]> {
    const issues: any[] = [];

    // Would implement basic static analysis here
    // For now return empty

    return issues;
  }

  /**
   * Simple duplicate detection fallback
   */
  private async simpleDuplicateDetection(): Promise<any[]> {
    // Would implement simple duplicate detection
    return [];
  }
}
