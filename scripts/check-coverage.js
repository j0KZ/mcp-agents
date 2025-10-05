#!/usr/bin/env node
/**
 * Coverage enforcement script
 * Fails CI if coverage is below thresholds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try both v8 and istanbul coverage formats
const v8CoverageFile = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
const istanbulCoverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

let coverage, total;

if (fs.existsSync(istanbulCoverageFile)) {
  // Istanbul format (coverage-summary.json)
  coverage = JSON.parse(fs.readFileSync(istanbulCoverageFile, 'utf8'));
  total = coverage.total;
} else if (fs.existsSync(v8CoverageFile)) {
  // V8 format (coverage-final.json) - need to aggregate
  const v8Data = JSON.parse(fs.readFileSync(v8CoverageFile, 'utf8'));

  // Aggregate all file coverage into totals
  let statements = { covered: 0, total: 0 };
  let branches = { covered: 0, total: 0 };
  let functions = { covered: 0, total: 0 };
  let lines = { covered: 0, total: 0 };

  // Normalize paths and deduplicate (Windows can have d: vs D: duplicates)
  // When there are duplicates, prefer the one with more coverage
  const normalizedFiles = new Map();
  for (const [filePath, fileCoverage] of Object.entries(v8Data)) {
    const normalized = filePath.toLowerCase().replace(/\\/g, '/');

    if (normalizedFiles.has(normalized)) {
      const existing = normalizedFiles.get(normalized);
      const existingCovered = existing.s ? Object.values(existing.s).filter(v => v > 0).length : 0;
      const newCovered = fileCoverage.s ? Object.values(fileCoverage.s).filter(v => v > 0).length : 0;

      if (newCovered > existingCovered) {
        normalizedFiles.set(normalized, fileCoverage);
      }
    } else {
      normalizedFiles.set(normalized, fileCoverage);
    }
  }

  for (const [filePath, fileCoverage] of normalizedFiles.entries()) {
    // Skip .test.ts, .spec.ts, mcp-server.ts, node_modules, dist
    if (filePath.includes('.test.') ||
        filePath.includes('.spec.') ||
        filePath.includes('mcp-server.ts') ||
        filePath.includes('node_modules') ||
        filePath.includes('dist')) {
      continue;
    }

    if (fileCoverage.s) {
      statements.total += Object.keys(fileCoverage.s).length;
      statements.covered += Object.values(fileCoverage.s).filter(v => v > 0).length;
    }
    if (fileCoverage.b) {
      for (const branch of Object.values(fileCoverage.b)) {
        branches.total += branch.length;
        branches.covered += branch.filter(v => v > 0).length;
      }
    }
    if (fileCoverage.f) {
      functions.total += Object.keys(fileCoverage.f).length;
      functions.covered += Object.values(fileCoverage.f).filter(v => v > 0).length;
    }
  }

  // Build total object in istanbul format
  total = {
    statements: {
      total: statements.total,
      covered: statements.covered,
      pct: statements.total > 0 ? (statements.covered / statements.total) * 100 : 0
    },
    branches: {
      total: branches.total,
      covered: branches.covered,
      pct: branches.total > 0 ? (branches.covered / branches.total) * 100 : 0
    },
    functions: {
      total: functions.total,
      covered: functions.covered,
      pct: functions.total > 0 ? (functions.covered / functions.total) * 100 : 0
    },
    lines: {
      total: statements.total,
      covered: statements.covered,
      pct: statements.total > 0 ? (statements.covered / statements.total) * 100 : 0
    },
  };
} else {
  console.error('❌ Coverage file not found. Run npx vitest run --coverage first.');
  process.exit(1);
}

const thresholds = {
  statements: 60,
  branches: 50,
  functions: 60,
  lines: 60,
};

console.log('\n📊 Coverage Report:\n');

let failed = false;

for (const [metric, threshold] of Object.entries(thresholds)) {
  const actual = total[metric].pct;
  const status = actual >= threshold ? '✅' : '❌';
  const trend = actual >= threshold ? '' : ` (need +${(threshold - actual).toFixed(2)}%)`;

  console.log(`${status} ${metric.padEnd(12)}: ${actual.toFixed(2)}% (threshold: ${threshold}%)${trend}`);

  if (actual < threshold) {
    failed = true;
  }
}

console.log('\n');

if (failed) {
  console.log('❌ Coverage below thresholds. Add more tests!\n');
  console.log('📝 To improve coverage:');
  console.log('   1. Run: npm run coverage:dashboard  (see which packages need work)');
  console.log('   2. Generate tests: npx @j0kz/test-generator <file>');
  console.log('   3. Write manual tests for complex cases\n');
  process.exit(1);
} else {
  console.log('✅ All coverage thresholds met!\n');
  process.exit(0);
}
