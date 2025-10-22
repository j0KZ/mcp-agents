#!/usr/bin/env node
/**
 * Enforce shared package version alignment across monorepo
 * Ensures all packages use the same @j0kz/shared version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Read global version from version.json
const versionFile = path.join(rootDir, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
const SHARED_VERSION = versionData.version;

console.log(`📦 Enforcing @j0kz/shared version: ${SHARED_VERSION}`);

// Find all package.json files except shared package itself
const packageFiles = globSync('packages/*/package.json', {
  cwd: rootDir,
  ignore: ['**/node_modules/**', 'packages/shared/package.json'],
  absolute: true,
});

let errors = [];
let fixes = [];

for (const pkgFile of packageFiles) {
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
  const pkgName = pkg.name || path.basename(path.dirname(pkgFile));

  // Check dependencies
  if (pkg.dependencies?.['@j0kz/shared']) {
    const currentVersion = pkg.dependencies['@j0kz/shared'];
    const expected = `^${SHARED_VERSION}`;

    if (currentVersion !== expected) {
      errors.push(`${pkgName}: has ${currentVersion}, expected ${expected}`);

      // Auto-fix
      pkg.dependencies['@j0kz/shared'] = expected;
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
      fixes.push(`✅ Fixed ${pkgName}: ${currentVersion} → ${expected}`);
    }
  }

  // Check devDependencies too
  if (pkg.devDependencies?.['@j0kz/shared']) {
    const currentVersion = pkg.devDependencies['@j0kz/shared'];
    const expected = `^${SHARED_VERSION}`;

    if (currentVersion !== expected) {
      errors.push(`${pkgName} (dev): has ${currentVersion}, expected ${expected}`);

      // Auto-fix
      pkg.devDependencies['@j0kz/shared'] = expected;
      fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
      fixes.push(`✅ Fixed ${pkgName} (dev): ${currentVersion} → ${expected}`);
    }
  }
}

// Report results
if (errors.length > 0) {
  console.error('\n❌ Shared version mismatches found:');
  errors.forEach(e => console.error(`  - ${e}`));

  if (fixes.length > 0) {
    console.log('\n🔧 Auto-fixed the following:');
    fixes.forEach(f => console.log(`  ${f}`));
  }

  console.log('\n💡 Run `npm install` to update lock files\n');
  process.exit(1);
} else {
  console.log(`\n✅ All packages use correct @j0kz/shared version (^${SHARED_VERSION})\n`);
  process.exit(0);
}
