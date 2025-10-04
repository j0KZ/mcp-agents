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

const coverageFile = path.join(__dirname, '..', 'coverage', 'coverage-summary.json');

if (!fs.existsSync(coverageFile)) {
  console.error('❌ Coverage file not found. Run npm run test:coverage first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
const total = coverage.total;

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
