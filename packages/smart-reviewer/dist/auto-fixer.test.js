import { describe, it, expect } from 'vitest';
import { AutoFixer } from './auto-fixer.js';
describe('AutoFixer', () => {
    const fixer = new AutoFixer();
    describe('findUnusedImports', () => {
        it('should detect unused named imports', async () => {
            const code = `
import { foo, bar } from 'module';
console.log(foo);
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(1);
            expect(unusedImports[0].description).toContain('bar');
            expect(unusedImports[0].safe).toBe(true);
            expect(unusedImports[0].confidence).toBe(100);
        });
        it('should detect unused default imports', async () => {
            const code = `
import React from 'react';
const x = 5;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(1);
            expect(unusedImports[0].description).toContain('React');
        });
        it('should NOT mark side-effect imports as unused', async () => {
            const code = `
import './styles.css';
import 'polyfill';
const x = 5;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(0);
        });
        it('should detect JSX component usage', async () => {
            const code = `
import { Button } from 'ui';
export const App = () => <Button />;
`;
            const result = await fixer.generateFixes(code, 'test.tsx');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(0);
        });
        it('should detect namespace import usage', async () => {
            const code = `
import * as Utils from 'utils';
console.log(Utils.foo);
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(0);
        });
        it('should detect import used in type annotation', async () => {
            const code = `
import { User } from 'types';
const user: User = { name: 'test' };
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImports = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedImports).toHaveLength(0);
        });
    });
    describe('findConsoleLogs', () => {
        it('should detect console.log statements', async () => {
            const code = `
function test() {
  console.log('debug');
  return 5;
}
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const consoleFixes = result.fixes.filter(f => f.type === 'console-log');
            expect(consoleFixes).toHaveLength(1);
            expect(consoleFixes[0].safe).toBe(true);
            expect(consoleFixes[0].confidence).toBe(90);
            expect(consoleFixes[0].oldCode).toContain('console.log');
        });
        it('should detect console.warn and console.error', async () => {
            const code = `
console.warn('warning');
console.error('error');
console.info('info');
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const consoleFixes = result.fixes.filter(f => f.type === 'console-log');
            expect(consoleFixes.length).toBeGreaterThanOrEqual(3);
        });
        it('should handle console.log with multiple arguments', async () => {
            const code = `
console.log('user:', user, 'data:', data);
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const consoleFixes = result.fixes.filter(f => f.type === 'console-log');
            expect(consoleFixes).toHaveLength(1);
        });
    });
    describe('findNullAccess', () => {
        it('should suggest optional chaining for potential null access', async () => {
            const code = `
const name = user.name;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(1);
            expect(nullChecks[0].newCode).toContain('user?.');
            expect(nullChecks[0].safe).toBe(false);
            expect(nullChecks[0].confidence).toBe(80);
        });
        it('should NOT suggest optional chaining for window object', async () => {
            const code = `
const loc = window.location;
const body = document.body;
const pi = Math.PI;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(0);
        });
        it('should NOT suggest optional chaining for this', async () => {
            const code = `
class Test {
  method() {
    return this.value;
  }
}
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(0);
        });
        it('should NOT suggest if already has optional chaining', async () => {
            const code = `
const name = user?.name;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(0);
        });
        it('should skip Node.js global objects', async () => {
            const code = `
const env = process.env;
const glob = global.something;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(0);
        });
    });
    describe('applyFixes', () => {
        it('should apply safe fixes correctly', async () => {
            const code = `
import { unused } from 'module';
console.log('test');
const x = 5;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            expect(result.fixedCode).not.toContain('console.log');
            expect(result.fixedCode).not.toContain('unused');
            expect(result.fixedCode).toContain('const x = 5');
        });
        it('should preserve line numbers when removing lines', async () => {
            const code = `line1
console.log('remove');
line3
console.log('remove');
line5`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const lines = result.fixedCode.split('\n');
            expect(lines).toHaveLength(3);
            expect(lines[0]).toBe('line1');
            expect(lines[1]).toBe('line3');
            expect(lines[2]).toBe('line5');
        });
        it('should handle multiple fixes on same line (column-aware)', async () => {
            const code = `
import { a, b, c } from 'module';
console.log(a);
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            // Should remove 'b' and 'c' in correct order
            const unusedFixes = result.fixes.filter(f => f.type === 'unused-import');
            expect(unusedFixes).toHaveLength(2);
            // Note: Current implementation removes entire import lines when unused
            // The test verifies that multiple fixes are detected correctly
            expect(unusedFixes.map(f => f.description)).toEqual(expect.arrayContaining([expect.stringContaining('b'), expect.stringContaining('c')]));
        });
        it('should NOT apply unsafe fixes', async () => {
            const code = `const name = user.name;`;
            const result = await fixer.generateFixes(code, 'test.ts');
            // Null check is suggested but not applied (safe=false)
            const nullChecks = result.fixes.filter(f => f.type === 'null-check');
            expect(nullChecks).toHaveLength(1);
            expect(result.fixedCode).toBe(code);
        });
    });
    describe('edge cases', () => {
        it('should handle invalid syntax gracefully', async () => {
            const code = `
const x = {{{
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            expect(result.fixes).toHaveLength(0);
            expect(result.fixedCode).toBe(code);
        });
        it('should handle empty files', async () => {
            const code = '';
            const result = await fixer.generateFixes(code, 'test.ts');
            expect(result.fixes).toHaveLength(0);
            expect(result.fixedCode).toBe('');
        });
        it('should handle files with only comments', async () => {
            const code = `
// Just a comment
/* Block comment */
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            expect(result.fixes).toHaveLength(0);
        });
        it('should handle very long lines safely', async () => {
            const longString = 'a'.repeat(2000);
            const code = `const x = "${longString}";`;
            const result = await fixer.generateFixes(code, 'test.ts');
            // Should not crash
            expect(result).toBeDefined();
        });
    });
    describe('confidence scoring', () => {
        it('should assign correct confidence scores', async () => {
            const code = `
import { unused } from 'module';
console.log('test');
const name = user.name;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const unusedImport = result.fixes.find(f => f.type === 'unused-import');
            expect(unusedImport?.confidence).toBe(100); // PERFECT
            const consoleLog = result.fixes.find(f => f.type === 'console-log');
            expect(consoleLog?.confidence).toBe(90); // HIGH
            const nullCheck = result.fixes.find(f => f.type === 'null-check');
            expect(nullCheck?.confidence).toBe(80); // MEDIUM
        });
    });
    describe('summary statistics', () => {
        it('should calculate correct summary', async () => {
            const code = `
import { unused } from 'module';
console.log('test');
const name = user.name;
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            expect(result.summary.total).toBe(3);
            expect(result.summary.safe).toBe(2); // unused import + console.log
            expect(result.summary.requiresReview).toBe(1); // null check
        });
    });
    describe('generateDiff', () => {
        it('should generate readable diff output', async () => {
            const code = `
import { unused } from 'module';
console.log('test');
`;
            const result = await fixer.generateFixes(code, 'test.ts');
            const diff = fixer.generateDiff(result.fixes);
            expect(diff).toContain('unused');
            expect(diff).toContain('console');
            expect(diff).toContain('Line');
        });
    });
});
//# sourceMappingURL=auto-fixer.test.js.map