/**
 * Detect test framework
 */

import fs from 'fs-extra';
import path from 'path';

export type TestFramework = 'jest' | 'vitest' | 'mocha' | 'ava' | null;

export async function detectTestFramework(): Promise<TestFramework> {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, 'package.json');

  if (!await fs.pathExists(pkgPath)) {
    return null;
  }

  const pkg = await fs.readJSON(pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  // Check dependencies
  if (deps.vitest) return 'vitest';
  if (deps.jest || deps['@types/jest']) return 'jest';
  if (deps.mocha) return 'mocha';
  if (deps.ava) return 'ava';

  // Check config files
  const configFiles = [
    { file: 'vitest.config.ts', framework: 'vitest' as TestFramework },
    { file: 'vitest.config.js', framework: 'vitest' as TestFramework },
    { file: 'jest.config.js', framework: 'jest' as TestFramework },
    { file: 'jest.config.ts', framework: 'jest' as TestFramework },
    { file: '.mocharc.json', framework: 'mocha' as TestFramework },
    { file: 'ava.config.js', framework: 'ava' as TestFramework }
  ];

  for (const { file, framework } of configFiles) {
    if (await fs.pathExists(path.join(cwd, file))) {
      return framework;
    }
  }

  // Check package.json scripts
  const testScript = pkg.scripts?.test || '';
  if (testScript.includes('vitest')) return 'vitest';
  if (testScript.includes('jest')) return 'jest';
  if (testScript.includes('mocha')) return 'mocha';
  if (testScript.includes('ava')) return 'ava';

  return null;
}
