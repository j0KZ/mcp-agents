/**
 * Baseline Performance Benchmarks for Complexity Reduction
 *
 * This file captures the current performance of high-complexity modules
 * before refactoring. Run this to establish baseline metrics.
 *
 * Usage: node benchmarks/complexity-baseline.js
 */

import Benchmark from 'benchmark';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import modules to benchmark
const testDataPath = join(__dirname, 'test-data', 'small.js');
const testCode = fs.readFileSync(testDataPath, 'utf-8');

// Lazy load modules to avoid import errors
let refactorer, analyzer, scanner;

async function loadModules() {
  const refactorModule = await import('../packages/refactor-assistant/dist/refactorer.js');
  const analyzerModule = await import('../packages/smart-reviewer/dist/analyzer.js');
  const scannerModule = await import('../packages/security-scanner/dist/scanner.js');

  refactorer = refactorModule;
  analyzer = new analyzerModule.CodeAnalyzer();
  scanner = scannerModule;
}

const suite = new Benchmark.Suite('Complexity Baseline');

// Benchmark 1: Refactor Assistant - suggestRefactorings (Complexity: 194)
suite.add('refactorer.suggestRefactorings', {
  defer: true,
  fn: function(deferred) {
    try {
      refactorer.suggestRefactorings(testCode);
      deferred.resolve();
    } catch (err) {
      deferred.resolve();
    }
  }
});

// Benchmark 2: Refactor Assistant - calculateMetrics
suite.add('refactorer.calculateMetrics', {
  defer: true,
  fn: function(deferred) {
    try {
      refactorer.calculateMetrics(testCode);
      deferred.resolve();
    } catch (err) {
      deferred.resolve();
    }
  }
});

// Benchmark 3: Refactor Assistant - extractFunction
suite.add('refactorer.extractFunction', {
  defer: true,
  fn: function(deferred) {
    try {
      refactorer.extractFunction({
        code: testCode,
        functionName: 'extracted',
        startLine: 1,
        endLine: 5
      });
      deferred.resolve();
    } catch (err) {
      deferred.resolve();
    }
  }
});

// Benchmark 4: Smart Reviewer - analyzeFile (Complexity: 100)
suite.add('analyzer.analyzeFile', {
  defer: true,
  fn: function(deferred) {
    analyzer.analyzeFile(testDataPath)
      .then(() => deferred.resolve())
      .catch(() => deferred.resolve());
  }
});

// Benchmark 5: Security Scanner - scanFile (Complexity: 70)
suite.add('scanner.scanFile', {
  defer: true,
  fn: function(deferred) {
    scanner.scanFile(testDataPath, {})
      .then(() => deferred.resolve())
      .catch(() => deferred.resolve());
  }
});

suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('\n📊 Baseline Performance Summary:');
    console.log('='.repeat(60));

    const results = [];
    this.forEach((bench) => {
      results.push({
        name: bench.name,
        hz: bench.hz.toFixed(2),
        mean: (bench.stats.mean * 1000).toFixed(3) + ' ms',
        rme: bench.stats.rme.toFixed(2) + '%',
        samples: bench.stats.sample.length
      });
    });

    console.table(results);

    // Save baseline to file
    const baseline = {
      timestamp: new Date().toISOString(),
      branch: 'refactor/complexity-reduction',
      phase: 'BEFORE refactoring',
      results: results
    };

    fs.writeFileSync(
      join(__dirname, 'baseline-results.json'),
      JSON.stringify(baseline, null, 2)
    );

    console.log('\n✅ Baseline saved to benchmarks/baseline-results.json');
    console.log('Run this again after refactoring to compare performance!');
  });

// Run benchmarks
console.log('🚀 Running Performance Baselines (Before Refactoring)...\n');
console.log('This establishes performance metrics for:');
console.log('  - refactorer.ts (complexity: 194, LOC: 1009)');
console.log('  - analyzer.ts (complexity: 100, LOC: 412)');
console.log('  - scanner.ts (complexity: 70, LOC: 481)\n');

loadModules().then(() => {
  suite.run({ async: true });
}).catch(err => {
  console.error('Failed to load modules:', err);
  process.exit(1);
});
