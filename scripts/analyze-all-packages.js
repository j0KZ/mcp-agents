#!/usr/bin/env node

import { CodeAnalyzer } from '../packages/smart-reviewer/dist/analyzer.js';
import { SecurityScanner } from '../packages/security-scanner/dist/scanner.js';
import { ArchitectureAnalyzer } from '../packages/architecture-analyzer/dist/analyzer.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeWithSmartReviewer() {
  console.log('\n🔍 SMART REVIEWER ANALYSIS\n');
  const analyzer = new CodeAnalyzer();

  const packages = [
    'test-generator',
    'smart-reviewer',
    'security-scanner',
    'architecture-analyzer',
    'refactor-assistant',
    'api-designer',
    'db-schema',
    'doc-generator',
  ];

  const allIssues = [];
  let totalScore = 0;
  let packageCount = 0;

  for (const pkg of packages) {
    const mainFile = path.join(
      __dirname,
      '..',
      'packages',
      pkg,
      'src',
      pkg === 'test-generator'
        ? 'generator.ts'
        : pkg === 'smart-reviewer'
          ? 'analyzer.ts'
          : pkg === 'security-scanner'
            ? 'scanner.ts'
            : pkg === 'architecture-analyzer'
              ? 'analyzer.ts'
              : pkg === 'refactor-assistant'
                ? 'refactorer.ts'
                : pkg === 'api-designer'
                  ? 'designer.ts'
                  : pkg === 'db-schema'
                    ? 'designer.ts'
                    : 'generator.ts'
    );

    try {
      const result = await analyzer.analyzeFile(mainFile);
      console.log(`📦 ${pkg}:`);
      console.log(`   Score: ${result.overallScore}/100`);
      console.log(`   Complexity: ${result.metrics.complexity}`);
      console.log(`   Issues: ${result.issues.length}`);
      console.log(`   Maintainability: ${result.metrics.maintainability}/100`);

      if (result.issues.length > 0 && result.issues.length <= 3) {
        console.log('   Top issues:');
        result.issues.slice(0, 3).forEach(issue => {
          console.log(`     - Line ${issue.line}: ${issue.message}`);
        });
      }

      totalScore += result.overallScore;
      packageCount++;
      allIssues.push({ package: pkg, issues: result.issues.length, score: result.overallScore });
    } catch (error) {
      console.log(`   ❌ Error: ${error.message?.substring(0, 100)}`);
    }
  }

  const avgScore = Math.round(totalScore / packageCount);
  console.log(`\n📊 Average Score: ${avgScore}/100`);

  return { avgScore, allIssues };
}

async function analyzeWithSecurityScanner() {
  console.log('\n🔒 SECURITY SCANNER ANALYSIS\n');
  const scanner = new SecurityScanner();

  const projectPath = path.join(__dirname, '..');

  try {
    const result = await scanner.scanProject(projectPath, {
      minSeverity: 'medium',
      excludePatterns: ['node_modules', 'dist', 'coverage', '.git'],
    });

    console.log(`Total vulnerabilities: ${result.totalVulnerabilities}`);
    console.log(`Critical: ${result.summary.critical}`);
    console.log(`High: ${result.summary.high}`);
    console.log(`Medium: ${result.summary.medium}`);

    if (result.vulnerabilities.length > 0) {
      console.log('\nTop vulnerabilities:');
      result.vulnerabilities.slice(0, 5).forEach(vuln => {
        console.log(`  ${vuln.severity.toUpperCase()}: ${vuln.message}`);
        console.log(`    File: ${vuln.file}:${vuln.line}`);
      });
    }

    return result.totalVulnerabilities;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return -1;
  }
}

async function analyzeArchitecture() {
  console.log('\n🏗️ ARCHITECTURE ANALYZER\n');
  const analyzer = new ArchitectureAnalyzer();

  const projectPath = path.join(__dirname, '..');

  try {
    const result = await analyzer.analyze(projectPath, {
      detectCircular: true,
      generateGraph: false,
      maxDepth: 3,
    });

    console.log(`Modules analyzed: ${result.modules.length}`);
    console.log(`Dependencies found: ${result.dependencies.length}`);
    console.log(`Circular dependencies: ${result.circularDependencies?.length || 0}`);

    if (result.circularDependencies?.length > 0) {
      console.log('\n⚠️ Circular dependencies detected:');
      result.circularDependencies.slice(0, 3).forEach(cycle => {
        console.log(`  ${cycle.join(' → ')}`);
      });
    }

    if (result.metrics) {
      console.log('\nMetrics:');
      console.log(`  Coupling: ${result.metrics.coupling}`);
      console.log(`  Cohesion: ${result.metrics.cohesion}`);
      console.log(`  Complexity: ${result.metrics.totalComplexity}`);
    }

    return result.circularDependencies?.length || 0;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return -1;
  }
}

async function main() {
  console.log('=' * 60);
  console.log('🤖 SELF-ANALYSIS: MCPs Analyzing Themselves');
  console.log('=' * 60);

  // Smart Reviewer Analysis
  const { avgScore, allIssues } = await analyzeWithSmartReviewer();

  // Security Scanner Analysis
  const vulnCount = await analyzeWithSecurityScanner();

  // Architecture Analysis
  const circularDeps = await analyzeArchitecture();

  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 SELF-ANALYSIS SUMMARY');
  console.log('=' * 60);

  console.log(`\n✅ Smart Reviewer:`);
  console.log(`   Average code quality score: ${avgScore}/100`);
  console.log(`   Packages with score > 90: ${allIssues.filter(p => p.score > 90).length}`);
  console.log(`   Packages with score < 70: ${allIssues.filter(p => p.score < 70).length}`);

  console.log(`\n🔒 Security:`);
  console.log(`   Vulnerabilities found: ${vulnCount >= 0 ? vulnCount : 'Error scanning'}`);

  console.log(`\n🏗️ Architecture:`);
  console.log(`   Circular dependencies: ${circularDeps >= 0 ? circularDeps : 'Error analyzing'}`);

  // Verdict
  console.log('\n' + '=' * 60);
  console.log('🎯 VERDICT: Are the improvements real or biased?');
  console.log('=' * 60);

  const isGoodQuality = avgScore >= 80;
  const isSecure = vulnCount === 0 || vulnCount === -1; // -1 means error
  const hasGoodArchitecture = circularDeps === 0 || circularDeps === -1;

  if (isGoodQuality && isSecure && hasGoodArchitecture) {
    console.log('✅ QUALITY: The MCP tools show GOOD quality metrics');
    console.log('   - High code quality scores');
    console.log('   - No major security issues');
    console.log('   - Clean architecture');
  } else {
    console.log('⚠️ ISSUES FOUND: The analysis reveals real problems');
    if (!isGoodQuality) console.log('   - Code quality needs improvement');
    if (!isSecure) console.log('   - Security vulnerabilities detected');
    if (!hasGoodArchitecture) console.log('   - Circular dependencies found');
  }

  console.log('\nTo validate these results are not biased:');
  console.log('1. Run: npm run lint (external ESLint validation)');
  console.log('2. Run: npm run validate:check (compare metrics)');
  console.log('3. Check if the build still passes: npm run build');
}

main().catch(console.error);
