#!/usr/bin/env node
/**
 * Coverage dashboard - shows coverage for all packages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packages = [
  'api-designer',
  'architecture-analyzer',
  'db-schema',
  'doc-generator',
  'refactor-assistant',
  'security-scanner',
  'smart-reviewer',
  'test-generator',
];

console.log('\n📊 **Coverage Dashboard**\n');
console.log('| Package | Statements | Branches | Functions | Lines | Status |');
console.log('|---------|------------|----------|-----------|-------|--------|');

let totalStatements = 0;
let totalBranches = 0;
let totalFunctions = 0;
let totalLines = 0;
let packagesWithCoverage = 0;

for (const pkg of packages) {
  const coverageFile = path.join(__dirname, '..', 'packages', pkg, 'coverage', 'coverage-summary.json');

  if (!fs.existsSync(coverageFile)) {
    console.log(`| ${pkg.padEnd(25)} | N/A | N/A | N/A | N/A | ⚠️ No tests |`);
    continue;
  }

  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const total = coverage.total;

  const statements = total.statements.pct;
  const branches = total.branches.pct;
  const functions = total.functions.pct;
  const lines = total.lines.pct;

  totalStatements += statements;
  totalBranches += branches;
  totalFunctions += functions;
  totalLines += lines;
  packagesWithCoverage++;

  const status = statements >= 60 ? '✅ Pass' : (statements >= 40 ? '⚠️ Low' : '❌ Fail');

  console.log(
    `| ${pkg.padEnd(25)} | ${statements.toFixed(1).padStart(6)}% | ${branches.toFixed(1).padStart(6)}% | ${functions.toFixed(1).padStart(7)}% | ${lines.toFixed(1).padStart(5)}% | ${status} |`
  );
}

console.log('|---------|------------|----------|-----------|-------|--------|');

if (packagesWithCoverage > 0) {
  const avgStatements = totalStatements / packagesWithCoverage;
  const avgBranches = totalBranches / packagesWithCoverage;
  const avgFunctions = totalFunctions / packagesWithCoverage;
  const avgLines = totalLines / packagesWithCoverage;

  const avgStatus = avgStatements >= 60 ? '✅ Pass' : (avgStatements >= 40 ? '⚠️ Low' : '❌ Fail');

  console.log(
    `| ${'**AVERAGE**'.padEnd(25)} | ${avgStatements.toFixed(1).padStart(6)}% | ${avgBranches.toFixed(1).padStart(6)}% | ${avgFunctions.toFixed(1).padStart(7)}% | ${avgLines.toFixed(1).padStart(5)}% | ${avgStatus} |`
  );
}

console.log('\n');
console.log('**Legend:**');
console.log('  ✅ Pass   - Coverage ≥ 60%');
console.log('  ⚠️  Low    - Coverage 40-59%');
console.log('  ❌ Fail   - Coverage < 40%');
console.log('\n');
