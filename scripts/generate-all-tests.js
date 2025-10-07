#!/usr/bin/env node

import { TestGenerator } from '../packages/test-generator/dist/generator.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTestsForPackage(packageName) {
  console.log(`\n📦 Generating tests for ${packageName}...`);

  const generator = new TestGenerator();
  const packagePath = path.join(__dirname, '..', 'packages', packageName);
  const srcPath = path.join(packagePath, 'src');
  const testsPath = path.join(packagePath, 'tests');

  // Ensure tests directory exists
  await fs.mkdir(testsPath, { recursive: true });

  // Find main source files to test
  const filesToTest = [
    'analyzer.ts',
    'generator.ts',
    'scanner.ts',
    'designer.ts',
    'refactorer.ts',
    'wizard.ts',
    'orchestrator.ts'
  ];

  let successCount = 0;
  let failCount = 0;
  const results = [];

  for (const file of filesToTest) {
    const srcFile = path.join(srcPath, file);

    try {
      // Check if file exists
      await fs.access(srcFile);

      console.log(`  Generating tests for ${file}...`);
      const result = await generator.generateTests(srcFile, {
        framework: 'vitest',
        includeEdgeCases: true,
        includeErrorCases: true,
        coverage: 80
      });

      if (result.success && result.code) {
        // Write test file
        const testFile = path.join(testsPath, file.replace('.ts', '.test.ts'));
        await fs.writeFile(testFile, result.code);
        console.log(`    ✅ Generated ${result.totalTests} tests`);
        successCount++;
        results.push({
          package: packageName,
          file,
          tests: result.totalTests,
          coverage: result.estimatedCoverage
        });
      } else {
        console.log(`    ⚠️ No tests generated`);
        failCount++;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.log(`    ❌ Error: ${error.message?.substring(0, 100)}`);
      }
      // File doesn't exist, skip silently
    }
  }

  return { successCount, failCount, results };
}

async function main() {
  console.log('🚀 Auto-generating tests for all MCP packages\n');
  console.log('Using the fixed test-generator to create real tests...');

  const packages = [
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

  const allResults = [];
  let totalSuccess = 0;
  let totalFail = 0;

  for (const pkg of packages) {
    const { successCount, failCount, results } = await generateTestsForPackage(pkg);
    totalSuccess += successCount;
    totalFail += failCount;
    allResults.push(...results);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${totalSuccess + totalFail}`);
  console.log(`✅ Successfully generated: ${totalSuccess}`);
  console.log(`❌ Failed: ${totalFail}`);

  if (allResults.length > 0) {
    console.log('\nGenerated tests by package:');
    for (const result of allResults) {
      console.log(`  ${result.package}/${result.file}: ${result.tests} tests (${result.coverage}% coverage)`);
    }
  }

  console.log('\nNext steps:');
  console.log('1. Run: npm test to verify all tests pass');
  console.log('2. Run: npm run mutation:test to check test quality');
  console.log('3. Run: npm run validate:check to compare metrics');
}

main().catch(console.error);