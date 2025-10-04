/**
 * Detect test framework
 */
import fs from 'fs-extra';
import path from 'path';
export async function detectTestFramework() {
    const cwd = process.cwd();
    const pkgPath = path.join(cwd, 'package.json');
    if (!await fs.pathExists(pkgPath)) {
        return null;
    }
    const pkg = await fs.readJSON(pkgPath);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    // Check dependencies
    if (deps.vitest)
        return 'vitest';
    if (deps.jest || deps['@types/jest'])
        return 'jest';
    if (deps.mocha)
        return 'mocha';
    if (deps.ava)
        return 'ava';
    // Check config files
    const configFiles = [
        { file: 'vitest.config.ts', framework: 'vitest' },
        { file: 'vitest.config.js', framework: 'vitest' },
        { file: 'jest.config.js', framework: 'jest' },
        { file: 'jest.config.ts', framework: 'jest' },
        { file: '.mocharc.json', framework: 'mocha' },
        { file: 'ava.config.js', framework: 'ava' }
    ];
    for (const { file, framework } of configFiles) {
        if (await fs.pathExists(path.join(cwd, file))) {
            return framework;
        }
    }
    // Check package.json scripts
    const testScript = pkg.scripts?.test || '';
    if (testScript.includes('vitest'))
        return 'vitest';
    if (testScript.includes('jest'))
        return 'jest';
    if (testScript.includes('mocha'))
        return 'mocha';
    if (testScript.includes('ava'))
        return 'ava';
    return null;
}
//# sourceMappingURL=test-framework.js.map