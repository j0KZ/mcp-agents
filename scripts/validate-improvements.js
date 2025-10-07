#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validation script to ensure MCP self-improvements are not biased
 * Tracks objective metrics before/after improvements
 */

class ImprovementValidator {
  constructor() {
    this.metricsFile = path.join(__dirname, '..', 'metrics-baseline.json');
    this.packages = [
      'test-generator',
      'smart-reviewer',
      'security-scanner',
      'architecture-analyzer',
      'refactor-assistant',
      'api-designer',
      'db-schema',
      'doc-generator',
      'orchestrator-mcp',
      'config-wizard'
    ];
  }

  /**
   * Capture baseline metrics before any improvements
   */
  async captureBaseline() {
    console.log('📊 Capturing baseline metrics...\n');

    const metrics = {
      timestamp: new Date().toISOString(),
      packages: {}
    };

    for (const pkg of this.packages) {
      console.log(`Analyzing ${pkg}...`);
      const pkgPath = path.join(__dirname, '..', 'packages', pkg);

      metrics.packages[pkg] = {
        // Test Coverage (if exists)
        coverage: this.getCoverage(pkgPath),

        // Code Complexity
        complexity: this.getComplexity(pkgPath),

        // Lines of Code
        loc: this.getLinesOfCode(pkgPath),

        // TypeScript Errors
        tsErrors: this.getTypeScriptErrors(pkgPath),

        // ESLint Issues
        eslintIssues: this.getESLintIssues(pkgPath),

        // Test Count
        testCount: this.getTestCount(pkgPath),

        // Package Size
        bundleSize: this.getBundleSize(pkgPath)
      };
    }

    // Save baseline
    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
    console.log(`\n✅ Baseline saved to ${this.metricsFile}`);

    return metrics;
  }

  /**
   * Compare current metrics with baseline
   */
  async validateImprovements() {
    console.log('🔍 Validating improvements...\n');

    if (!fs.existsSync(this.metricsFile)) {
      console.error('❌ No baseline found. Run --baseline first.');
      process.exit(1);
    }

    const baseline = JSON.parse(fs.readFileSync(this.metricsFile, 'utf-8'));
    const current = await this.captureBaseline();

    console.log('\n📈 Improvement Report:\n');
    console.log('Package'.padEnd(20) + 'Metric'.padEnd(15) + 'Before'.padEnd(10) + 'After'.padEnd(10) + 'Change');
    console.log('-'.repeat(65));

    let improvements = 0;
    let regressions = 0;

    for (const pkg of this.packages) {
      const before = baseline.packages[pkg];
      const after = current.packages[pkg];

      // Coverage should increase
      if (before.coverage && after.coverage) {
        const change = after.coverage.percent - before.coverage.percent;
        this.reportChange(pkg, 'Coverage', before.coverage.percent, after.coverage.percent, change, true);
        if (change > 0) improvements++;
        else if (change < 0) regressions++;
      }

      // Complexity should decrease
      if (before.complexity && after.complexity) {
        const change = after.complexity - before.complexity;
        this.reportChange(pkg, 'Complexity', before.complexity, after.complexity, -change, false);
        if (change < 0) improvements++;
        else if (change > 0) regressions++;
      }

      // ESLint issues should decrease
      if (before.eslintIssues !== undefined && after.eslintIssues !== undefined) {
        const change = after.eslintIssues - before.eslintIssues;
        this.reportChange(pkg, 'ESLint Issues', before.eslintIssues, after.eslintIssues, -change, false);
        if (change < 0) improvements++;
        else if (change > 0) regressions++;
      }

      // Test count should increase
      if (before.testCount !== undefined && after.testCount !== undefined) {
        const change = after.testCount - before.testCount;
        this.reportChange(pkg, 'Test Count', before.testCount, after.testCount, change, true);
        if (change > 0) improvements++;
        else if (change < 0) regressions++;
      }
    }

    console.log('\n' + '='.repeat(65));
    console.log(`Summary: ${improvements} improvements, ${regressions} regressions`);

    // Cross-validation with external tools
    await this.crossValidate();

    return { improvements, regressions };
  }

  /**
   * Cross-validate with external tools
   */
  async crossValidate() {
    console.log('\n🔄 Cross-validation with external tools:\n');

    // Run ESLint
    try {
      execSync('npx eslint packages --format json > eslint-report.json', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
    } catch (e) {
      // ESLint exits with 1 if there are any issues
    }

    if (fs.existsSync('eslint-report.json')) {
      const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf-8'));
      const totalIssues = report.reduce((sum, file) => sum + file.messages.length, 0);
      console.log(`ESLint: ${totalIssues} total issues found`);
    }

    // Check TypeScript
    try {
      const tsOutput = execSync('npx tsc --noEmit --pretty false 2>&1', {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf-8'
      });
      const tsErrors = (tsOutput.match(/error TS/g) || []).length;
      console.log(`TypeScript: ${tsErrors} compilation errors`);
    } catch (e) {
      const tsErrors = (e.stdout?.match(/error TS/g) || []).length;
      console.log(`TypeScript: ${tsErrors} compilation errors`);
    }

    console.log('\nNote: External tools provide unbiased validation of improvements');
  }

  // Helper methods for metrics collection
  getCoverage(pkgPath) {
    const coverageFile = path.join(pkgPath, 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coverageFile)) {
      const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
      return {
        percent: coverage.total.statements.pct,
        statements: coverage.total.statements.pct,
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct
      };
    }
    return null;
  }

  getComplexity(pkgPath) {
    // Simple complexity calculation (can be enhanced)
    const srcPath = path.join(pkgPath, 'src');
    if (!fs.existsSync(srcPath)) return 0;

    let complexity = 0;
    const files = this.getAllFiles(srcPath, '.ts');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      // Count if/for/while/switch/catch as complexity points
      complexity += (content.match(/\b(if|for|while|switch|catch)\b/g) || []).length;
    }

    return complexity;
  }

  getLinesOfCode(pkgPath) {
    const srcPath = path.join(pkgPath, 'src');
    if (!fs.existsSync(srcPath)) return 0;

    let loc = 0;
    const files = this.getAllFiles(srcPath, '.ts');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      loc += content.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).length;
    }

    return loc;
  }

  getTypeScriptErrors(pkgPath) {
    try {
      execSync(`npx tsc --noEmit`, { cwd: pkgPath, stdio: 'pipe' });
      return 0;
    } catch (e) {
      const errors = (e.stdout?.toString() || '').match(/error TS/g);
      return errors ? errors.length : 0;
    }
  }

  getESLintIssues(pkgPath) {
    try {
      const output = execSync(`npx eslint src --format json`, {
        cwd: pkgPath,
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      const report = JSON.parse(output);
      return report.reduce((sum, file) => sum + file.messages.length, 0);
    } catch (e) {
      // Parse error output if ESLint fails
      try {
        const report = JSON.parse(e.stdout?.toString() || '[]');
        return report.reduce((sum, file) => sum + file.messages.length, 0);
      } catch {
        return 0;
      }
    }
  }

  getTestCount(pkgPath) {
    const testFiles = [
      ...this.getAllFiles(path.join(pkgPath, 'src'), '.test.ts'),
      ...this.getAllFiles(path.join(pkgPath, 'tests'), '.test.ts')
    ];

    let count = 0;
    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      count += (content.match(/\bit\(/g) || []).length;
    }

    return count;
  }

  getBundleSize(pkgPath) {
    const distPath = path.join(pkgPath, 'dist');
    if (!fs.existsSync(distPath)) return 0;

    let size = 0;
    const files = this.getAllFiles(distPath, '.js');

    for (const file of files) {
      size += fs.statSync(file).size;
    }

    return Math.round(size / 1024); // KB
  }

  getAllFiles(dir, ext) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.includes('node_modules')) {
        files.push(...this.getAllFiles(fullPath, ext));
      } else if (item.endsWith(ext)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  reportChange(pkg, metric, before, after, change, higherIsBetter) {
    const sign = change > 0 ? '+' : '';
    const emoji = (higherIsBetter ? change > 0 : change < 0) ? '✅' :
                   change === 0 ? '➖' : '⚠️';

    console.log(
      pkg.padEnd(20) +
      metric.padEnd(15) +
      String(before).padEnd(10) +
      String(after).padEnd(10) +
      `${sign}${change.toFixed(1)} ${emoji}`
    );
  }
}

// CLI
const validator = new ImprovementValidator();
const command = process.argv[2];

switch (command) {
  case '--baseline':
    validator.captureBaseline();
    break;

  case '--validate':
    validator.validateImprovements();
    break;

  default:
    console.log('Usage:');
    console.log('  node validate-improvements.js --baseline  # Capture baseline metrics');
    console.log('  node validate-improvements.js --validate  # Compare with baseline');
}