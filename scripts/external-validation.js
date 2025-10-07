#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

class ExternalValidator {
  constructor() {
    this.results = {
      eslint: null,
      prettier: null,
      typescript: null,
      npmAudit: null,
      coverage: null,
      bundleSize: null,
      dependencies: null
    };
  }

  /**
   * Run all external validation tools
   */
  async runAll() {
    console.log('🔍 EXTERNAL VALIDATION SUITE');
    console.log('=' .repeat(60));
    console.log('Running independent third-party tools to validate code quality\n');

    await this.runESLintValidation();
    await this.runPrettierCheck();
    await this.runTypeScriptStrict();
    await this.runNpmAudit();
    await this.runCoverageAnalysis();
    await this.checkBundleSizes();
    await this.analyzeDependencies();

    this.printSummary();
  }

  /**
   * 1. ESLint with multiple plugin rules
   */
  async runESLintValidation() {
    console.log('\n📝 ESLint Analysis (with plugins)...');

    try {
      // Count total issues
      const eslintOutput = execSync('npx eslint packages/*/src --format json', {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const report = JSON.parse(eslintOutput);
      let errors = 0;
      let warnings = 0;

      report.forEach(file => {
        file.messages.forEach(msg => {
          if (msg.severity === 2) errors++;
          else if (msg.severity === 1) warnings++;
        });
      });

      this.results.eslint = {
        errors,
        warnings,
        total: errors + warnings,
        files: report.length
      };

      console.log(`  ❌ Errors: ${errors}`);
      console.log(`  ⚠️  Warnings: ${warnings}`);
      console.log(`  📁 Files analyzed: ${report.length}`);
    } catch (e) {
      // ESLint exits with error if issues found
      const output = e.stdout?.toString() || '[]';
      try {
        const report = JSON.parse(output);
        let errors = 0;
        let warnings = 0;

        report.forEach(file => {
          file.messages.forEach(msg => {
            if (msg.severity === 2) errors++;
            else if (msg.severity === 1) warnings++;
          });
        });

        this.results.eslint = {
          errors,
          warnings,
          total: errors + warnings,
          files: report.length
        };

        console.log(`  ❌ Errors: ${errors}`);
        console.log(`  ⚠️  Warnings: ${warnings}`);
        console.log(`  📁 Files analyzed: ${report.length}`);
      } catch {
        console.log('  ❌ ESLint failed to run');
      }
    }
  }

  /**
   * 2. Prettier formatting check
   */
  async runPrettierCheck() {
    console.log('\n🎨 Prettier Formatting Check...');

    try {
      execSync('npx prettier --check packages/*/src/**/*.ts', {
        cwd: rootDir,
        stdio: 'pipe'
      });
      console.log('  ✅ All files formatted correctly');
      this.results.prettier = { formatted: true, issues: 0 };
    } catch (e) {
      const output = e.stdout?.toString() || '';
      const unformatted = output.split('\n').filter(line => line.includes('[warn]')).length;
      console.log(`  ❌ ${unformatted} files need formatting`);
      this.results.prettier = { formatted: false, issues: unformatted };
    }
  }

  /**
   * 3. TypeScript with strict mode
   */
  async runTypeScriptStrict() {
    console.log('\n📘 TypeScript Strict Mode Check...');

    try {
      // Create a temporary strict tsconfig
      const strictConfig = {
        extends: './tsconfig.json',
        compilerOptions: {
          strict: true,
          noImplicitAny: true,
          strictNullChecks: true,
          strictFunctionTypes: true,
          strictBindCallApply: true,
          strictPropertyInitialization: true,
          noImplicitThis: true,
          alwaysStrict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true
        }
      };

      fs.writeFileSync(
        path.join(rootDir, 'tsconfig.strict.json'),
        JSON.stringify(strictConfig, null, 2)
      );

      const output = execSync('npx tsc --noEmit -p tsconfig.strict.json 2>&1', {
        cwd: rootDir,
        encoding: 'utf-8'
      });

      const errors = (output.match(/error TS/g) || []).length;
      console.log(`  ✅ Strict mode: ${errors} errors`);
      this.results.typescript = { strictErrors: errors };

      // Cleanup
      fs.unlinkSync(path.join(rootDir, 'tsconfig.strict.json'));
    } catch (e) {
      const output = e.stdout?.toString() || e.toString();
      const errors = (output.match(/error TS/g) || []).length;
      console.log(`  ❌ Strict mode errors: ${errors}`);
      this.results.typescript = { strictErrors: errors };

      // Cleanup
      try {
        fs.unlinkSync(path.join(rootDir, 'tsconfig.strict.json'));
      } catch {}
    }
  }

  /**
   * 4. npm audit for security
   */
  async runNpmAudit() {
    console.log('\n🔒 npm audit (Security Vulnerabilities)...');

    try {
      const output = execSync('npm audit --json', {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const audit = JSON.parse(output);
      const vulns = audit.metadata.vulnerabilities;

      console.log(`  🔴 Critical: ${vulns.critical || 0}`);
      console.log(`  🟠 High: ${vulns.high || 0}`);
      console.log(`  🟡 Moderate: ${vulns.moderate || 0}`);
      console.log(`  ⚪ Low: ${vulns.low || 0}`);

      this.results.npmAudit = vulns;
    } catch (e) {
      const output = e.stdout?.toString() || '{}';
      try {
        const audit = JSON.parse(output);
        const vulns = audit.metadata?.vulnerabilities || {};

        console.log(`  🔴 Critical: ${vulns.critical || 0}`);
        console.log(`  🟠 High: ${vulns.high || 0}`);
        console.log(`  🟡 Moderate: ${vulns.moderate || 0}`);
        console.log(`  ⚪ Low: ${vulns.low || 0}`);

        this.results.npmAudit = vulns;
      } catch {
        console.log('  ❌ Failed to run npm audit');
      }
    }
  }

  /**
   * 5. Test Coverage with Vitest
   */
  async runCoverageAnalysis() {
    console.log('\n📊 Test Coverage Analysis (Vitest native)...');

    const packages = ['test-generator', 'smart-reviewer', 'security-scanner'];
    const coverageResults = [];

    for (const pkg of packages) {
      try {
        console.log(`  Testing ${pkg}...`);

        // Run vitest with coverage
        execSync('npx vitest run --coverage --reporter=json', {
          cwd: path.join(rootDir, 'packages', pkg),
          stdio: 'pipe'
        });

        // Read coverage summary if it exists
        const coverageFile = path.join(rootDir, 'packages', pkg, 'coverage', 'coverage-summary.json');
        if (fs.existsSync(coverageFile)) {
          const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
          const total = coverage.total;

          coverageResults.push({
            package: pkg,
            statements: total.statements.pct,
            branches: total.branches.pct,
            functions: total.functions.pct,
            lines: total.lines.pct
          });

          console.log(`    Coverage: ${total.lines.pct.toFixed(1)}% lines, ${total.statements.pct.toFixed(1)}% statements`);
        }
      } catch (e) {
        console.log(`    ⚠️ Coverage failed for ${pkg}`);
      }
    }

    this.results.coverage = coverageResults;
  }

  /**
   * 6. Bundle size analysis
   */
  async checkBundleSizes() {
    console.log('\n📦 Bundle Size Analysis...');

    const packages = fs.readdirSync(path.join(rootDir, 'packages'));
    const sizes = [];

    for (const pkg of packages) {
      const distPath = path.join(rootDir, 'packages', pkg, 'dist');
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        let totalSize = 0;

        files.forEach(file => {
          if (file.endsWith('.js')) {
            const stats = fs.statSync(path.join(distPath, file));
            totalSize += stats.size;
          }
        });

        if (totalSize > 0) {
          sizes.push({
            package: pkg,
            size: totalSize,
            sizeKB: (totalSize / 1024).toFixed(2)
          });
        }
      }
    }

    // Sort by size
    sizes.sort((a, b) => b.size - a.size);

    console.log('  Largest bundles:');
    sizes.slice(0, 5).forEach(pkg => {
      const emoji = pkg.size > 100000 ? '❌' : pkg.size > 50000 ? '⚠️' : '✅';
      console.log(`    ${emoji} ${pkg.package}: ${pkg.sizeKB} KB`);
    });

    this.results.bundleSize = sizes;
  }

  /**
   * 7. Dependency analysis
   */
  async analyzeDependencies() {
    console.log('\n📚 Dependency Analysis...');

    try {
      // Check for outdated dependencies
      const outdated = execSync('npm outdated --json', {
        cwd: rootDir,
        encoding: 'utf-8'
      }).trim();

      const deps = outdated ? JSON.parse(outdated) : {};
      const outdatedCount = Object.keys(deps).length;

      console.log(`  📦 Outdated dependencies: ${outdatedCount}`);

      // Check for unused dependencies (would need depcheck)
      try {
        execSync('npx depcheck --version', { stdio: 'pipe' });
        const depcheckOutput = execSync('npx depcheck --json', {
          cwd: rootDir,
          encoding: 'utf-8'
        });

        const depcheck = JSON.parse(depcheckOutput);
        console.log(`  🗑️  Unused dependencies: ${depcheck.dependencies?.length || 0}`);
        console.log(`  🗑️  Unused devDependencies: ${depcheck.devDependencies?.length || 0}`);

        this.results.dependencies = {
          outdated: outdatedCount,
          unused: (depcheck.dependencies?.length || 0) + (depcheck.devDependencies?.length || 0)
        };
      } catch {
        this.results.dependencies = { outdated: outdatedCount };
      }
    } catch {
      console.log('  ⚠️ Could not analyze dependencies');
    }
  }

  /**
   * Print summary and verdict
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📈 EXTERNAL VALIDATION SUMMARY');
    console.log('='.repeat(60));

    let score = 100;
    const issues = [];

    // ESLint scoring
    if (this.results.eslint) {
      score -= Math.min(30, this.results.eslint.errors * 0.5);
      if (this.results.eslint.errors > 0) {
        issues.push(`${this.results.eslint.errors} ESLint errors`);
      }
    }

    // Prettier scoring
    if (this.results.prettier && !this.results.prettier.formatted) {
      score -= 10;
      issues.push(`${this.results.prettier.issues} formatting issues`);
    }

    // TypeScript strict scoring
    if (this.results.typescript && this.results.typescript.strictErrors > 0) {
      score -= Math.min(20, this.results.typescript.strictErrors * 0.2);
      issues.push(`${this.results.typescript.strictErrors} TypeScript strict errors`);
    }

    // Security scoring
    if (this.results.npmAudit) {
      score -= (this.results.npmAudit.critical || 0) * 10;
      score -= (this.results.npmAudit.high || 0) * 5;
      const totalVulns = (this.results.npmAudit.critical || 0) + (this.results.npmAudit.high || 0);
      if (totalVulns > 0) {
        issues.push(`${totalVulns} security vulnerabilities`);
      }
    }

    // Bundle size scoring
    if (this.results.bundleSize) {
      const largeBundles = this.results.bundleSize.filter(b => b.size > 100000).length;
      if (largeBundles > 0) {
        score -= largeBundles * 2;
        issues.push(`${largeBundles} large bundles (>100KB)`);
      }
    }

    score = Math.max(0, score);

    console.log(`\n🎯 External Validation Score: ${score}/100`);

    if (score >= 80) {
      console.log('✅ GOOD: External tools validate good code quality');
    } else if (score >= 60) {
      console.log('⚠️ FAIR: Some issues found by external tools');
    } else {
      console.log('❌ POOR: Significant issues found by external tools');
    }

    if (issues.length > 0) {
      console.log('\nMain issues:');
      issues.forEach(issue => console.log(`  - ${issue}`));
    }

    console.log('\n📊 Raw Metrics:');
    console.log(JSON.stringify(this.results, null, 2));

    return { score, issues, results: this.results };
  }
}

// Run validation
const validator = new ExternalValidator();
validator.runAll().catch(console.error);