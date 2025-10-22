#!/usr/bin/env node
/**
 * Auto-update test count across all documentation
 *
 * This script:
 * 1. Runs the test suite
 * 2. Extracts total test count
 * 3. Updates badges and metrics in README and wiki
 *
 * Usage: npm run update:test-count
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🧪 Counting tests...\n');

try {
  // Run tests and capture output
  const output = execSync('npm test 2>&1', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
  });

  // Strip ANSI color codes (ESC [ ... m)
  const cleanOutput = output.replace(/\u001b\[[0-9;]*m/g, '');

  // Extract test counts from vitest output
  // Format: "Tests  31 passed (31)"
  const matches = cleanOutput.match(/Tests\s+(\d+)\s+passed/g);

  if (!matches || matches.length === 0) {
    console.error('❌ Could not extract test count from output');
    process.exit(1);
  }

  // Sum all test counts across packages
  const total = matches.reduce((sum, match) => {
    const count = parseInt(match.match(/(\d+)\s+passed/)[1]);
    return sum + count;
  }, 0);

  console.log(`✅ Found ${total} passing tests across ${matches.length} packages\n`);

  // Files to update
  const filesToUpdate = ['README.md', 'wiki/Home.md', 'CHANGELOG.md'];

  let updatedCount = 0;

  filesToUpdate.forEach(file => {
    if (!existsSync(file)) {
      console.log(`⚠️  Skipping ${file} (not found)`);
      return;
    }

    let content = readFileSync(file, 'utf8');
    let modified = false;

    // Update badge: tests-NUMBER_passing
    const badgePattern = /tests-\d+_passing/g;
    if (badgePattern.test(content)) {
      content = content.replace(badgePattern, `tests-${total}_passing`);
      modified = true;
    }

    // Update table: | **Tests** | NUMBER passing |
    const tablePattern = /\|\s*\*\*Tests\*\*\s*\|\s*\d+\s+passing/g;
    if (tablePattern.test(content)) {
      content = content.replace(tablePattern, `| **Tests** | ${total} passing`);
      modified = true;
    }

    // Update CHANGELOG: - Tests: NUMBER passing
    const changelogPattern = /-\s*Tests:\s*\d+\s+passing/g;
    if (changelogPattern.test(content)) {
      content = content.replace(changelogPattern, `- Tests: ${total} passing`);
      modified = true;
    }

    // Update CHANGELOG: Test Suite Expansion: NUMBER total tests
    const expansionPattern = /Test Suite Expansion:\s*\d+\s+total tests/g;
    if (expansionPattern.test(content)) {
      content = content.replace(expansionPattern, `Test Suite Expansion: ${total} total tests`);
      modified = true;
    }

    if (modified) {
      writeFileSync(file, content);
      console.log(`✅ Updated ${file}`);
      updatedCount++;
    } else {
      console.log(`ℹ️  No changes needed in ${file}`);
    }
  });

  console.log(`\n🎉 Successfully updated test count to ${total} in ${updatedCount} file(s)!`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review the changes: git diff');
  console.log('   2. Commit: git add -u && git commit -m "docs: update test count to ${total}"');
  console.log('   3. Republish wiki: powershell.exe -File publish-wiki.ps1');
} catch (error) {
  console.error('❌ Error running tests or updating files:');
  console.error(error.message);
  process.exit(1);
}
