#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mutation testing to validate generated test quality
 * Good tests should catch mutations (code changes)
 */

class MutationTester {
  constructor() {
    this.mutations = [
      {
        name: 'Boolean Flip',
        pattern: /return true/g,
        replacement: 'return false',
      },
      {
        name: 'Conditional Flip',
        pattern: /if \((.*?) === (.*?)\)/g,
        replacement: 'if ($1 !== $2)',
      },
      {
        name: 'Arithmetic Change',
        pattern: /\+/g,
        replacement: '-',
      },
      {
        name: 'Boundary Change',
        pattern: /<=/g,
        replacement: '<',
      },
      {
        name: 'Return Early',
        pattern: /return (.*?);(\s+\w)/g,
        replacement: 'return $1; return null;$2',
      },
    ];
  }

  /**
   * Test mutation detection capability
   */
  async testPackage(packageName) {
    console.log(`\n🧬 Mutation Testing: ${packageName}\n`);

    const pkgPath = path.join(__dirname, '..', 'packages', packageName);
    const srcPath = path.join(pkgPath, 'src');

    if (!fs.existsSync(srcPath)) {
      console.log(`Package ${packageName} not found`);
      return null;
    }

    const results = {
      package: packageName,
      totalMutations: 0,
      killedMutations: 0,
      survivedMutations: 0,
      mutationScore: 0,
      details: [],
    };

    // Get all source files
    const sourceFiles = this.getAllSourceFiles(srcPath);

    for (const file of sourceFiles) {
      console.log(`Mutating ${path.basename(file)}...`);
      const fileResults = await this.mutateFile(file, pkgPath);

      results.totalMutations += fileResults.total;
      results.killedMutations += fileResults.killed;
      results.survivedMutations += fileResults.survived;
      results.details.push(fileResults);
    }

    // Calculate mutation score
    if (results.totalMutations > 0) {
      results.mutationScore = (results.killedMutations / results.totalMutations) * 100;
    }

    this.printResults(results);
    return results;
  }

  /**
   * Apply mutations to a file and test
   */
  async mutateFile(filePath, pkgPath) {
    const originalContent = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    const results = {
      file: fileName,
      total: 0,
      killed: 0,
      survived: 0,
      mutations: [],
    };

    for (const mutation of this.mutations) {
      const matches = originalContent.match(mutation.pattern);
      if (!matches) continue;

      for (let i = 0; i < Math.min(matches.length, 3); i++) {
        // Test up to 3 mutations per type
        results.total++;

        // Apply mutation
        const mutatedContent = originalContent.replace(
          new RegExp(mutation.pattern.source),
          mutation.replacement
        );

        fs.writeFileSync(filePath, mutatedContent);

        // Run tests
        const testsPassed = this.runTests(pkgPath);

        if (testsPassed) {
          // Mutation survived (bad - tests didn't catch it)
          results.survived++;
          results.mutations.push({
            type: mutation.name,
            status: 'SURVIVED',
            location: matches[i],
          });
        } else {
          // Mutation killed (good - tests caught it)
          results.killed++;
          results.mutations.push({
            type: mutation.name,
            status: 'KILLED',
            location: matches[i],
          });
        }

        // Restore original
        fs.writeFileSync(filePath, originalContent);
      }
    }

    return results;
  }

  /**
   * Run tests for a package
   */
  runTests(pkgPath) {
    try {
      execSync('npm test', {
        cwd: pkgPath,
        stdio: 'pipe',
        timeout: 30000,
      });
      return true; // Tests passed
    } catch (e) {
      return false; // Tests failed
    }
  }

  /**
   * Get all TypeScript source files
   */
  getAllSourceFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAllSourceFiles(fullPath));
      } else if (item.endsWith('.ts') && !item.includes('.test.') && !item.includes('.spec.')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Print mutation test results
   */
  printResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('MUTATION TEST RESULTS');
    console.log('='.repeat(60));

    console.log(`\nPackage: ${results.package}`);
    console.log(`Total Mutations: ${results.totalMutations}`);
    console.log(`Killed: ${results.killedMutations} ✅`);
    console.log(`Survived: ${results.survivedMutations} ⚠️`);
    console.log(`Mutation Score: ${results.mutationScore.toFixed(1)}%`);

    if (results.mutationScore >= 80) {
      console.log('\n🎉 Excellent! Tests are catching most mutations.');
    } else if (results.mutationScore >= 60) {
      console.log('\n👍 Good, but tests could be more thorough.');
    } else {
      console.log('\n⚠️ Tests need improvement - many mutations survived.');
    }

    // Show survived mutations for improvement
    if (results.survivedMutations > 0) {
      console.log("\n❌ Survived Mutations (tests didn't catch these):");
      for (const file of results.details) {
        const survived = file.mutations.filter(m => m.status === 'SURVIVED');
        if (survived.length > 0) {
          console.log(`  ${file.file}:`);
          for (const mutation of survived) {
            console.log(`    - ${mutation.type}: "${mutation.location}"`);
          }
        }
      }
    }
  }

  /**
   * Compare generated tests vs manual tests
   */
  async compareTestQuality(packageName) {
    console.log(`\n📊 Comparing Test Quality: ${packageName}\n`);

    const pkgPath = path.join(__dirname, '..', 'packages', packageName);

    // Backup current tests
    const testsPath = path.join(pkgPath, 'tests');
    const testsBackupPath = path.join(pkgPath, 'tests.backup');
    if (fs.existsSync(testsPath)) {
      // Use Node.js fs methods instead of shell commands for security
      fs.cpSync(testsPath, testsBackupPath, { recursive: true });
    }

    // Test with generated tests
    console.log('Testing with generated tests...');
    const generatedResults = await this.testPackage(packageName);

    // TODO: Test with manual tests (if they exist)
    // This would require having some manual test examples

    // Restore backup
    if (fs.existsSync(testsBackupPath)) {
      const testsPath = path.join(pkgPath, 'tests');
      // Remove current tests directory safely
      if (fs.existsSync(testsPath)) {
        fs.rmSync(testsPath, { recursive: true, force: true });
      }
      // Restore from backup
      fs.renameSync(testsBackupPath, testsPath);
    }

    return generatedResults;
  }
}

// CLI
const tester = new MutationTester();
const packageName = process.argv[2];

if (!packageName) {
  console.log('Usage: node mutation-test.js <package-name>');
  console.log('Example: node mutation-test.js test-generator');
  process.exit(1);
}

tester.testPackage(packageName).catch(console.error);
