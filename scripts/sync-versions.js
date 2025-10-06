#!/usr/bin/env node

/**
 * Sync all package versions with the global version.json
 *
 * This ensures all packages in the monorepo share the same version number.
 *
 * Usage:
 *   node scripts/sync-versions.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read global version
const globalVersion = JSON.parse(readFileSync(join(rootDir, 'version.json'), 'utf8')).version;

console.log(`\n🔄 Syncing all packages to version ${globalVersion}...\n`);

let updated = 0;

// Update root package.json
const rootPackage = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
if (rootPackage.version !== globalVersion) {
  rootPackage.version = globalVersion;
  writeFileSync(join(rootDir, 'package.json'), JSON.stringify(rootPackage, null, 2) + '\n');
  console.log(`✅ Root package.json → ${globalVersion}`);
  updated++;
}

// Update all packages in packages/
const packagesDir = join(rootDir, 'packages');
const packages = readdirSync(packagesDir);

for (const pkg of packages) {
  const packageJsonPath = join(packagesDir, pkg, 'package.json');
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.version !== globalVersion) {
      packageJson.version = globalVersion;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ packages/${pkg} → ${globalVersion}`);
      updated++;
    }
  } catch (err) {
    console.log(`⚠️  Skipping packages/${pkg} (no package.json)`);
  }
}

// Update installer
const installerPackagePath = join(rootDir, 'installer', 'package.json');
const installerPackage = JSON.parse(readFileSync(installerPackagePath, 'utf8'));
if (installerPackage.version !== globalVersion) {
  installerPackage.version = globalVersion;
  writeFileSync(installerPackagePath, JSON.stringify(installerPackage, null, 2) + '\n');
  console.log(`✅ installer/package.json → ${globalVersion}`);
  updated++;
}

// Update installer/index.js VERSION constant
const installerIndexPath = join(rootDir, 'installer', 'index.js');
let installerIndex = readFileSync(installerIndexPath, 'utf8');
const versionRegex = /const VERSION = '[^']*'/;
if (!installerIndex.match(`const VERSION = '${globalVersion}'`)) {
  installerIndex = installerIndex.replace(versionRegex, `const VERSION = '${globalVersion}'`);
  writeFileSync(installerIndexPath, installerIndex);
  console.log(`✅ installer/index.js VERSION → ${globalVersion}`);
  updated++;
}

console.log(
  `\n${updated > 0 ? '✨' : 'ℹ️'}  ${updated} file(s) updated to version ${globalVersion}\n`
);

if (updated === 0) {
  console.log('All packages already at the latest version! 🎉\n');
} else {
  console.log('📝 Remember to:');
  console.log('   1. Update CHANGELOG.md');
  console.log('   2. Update README.md badges');
  console.log('   3. npm run build');
  console.log('   4. npm run publish-all');
  console.log('   5. cd installer && npm publish\n');
}
