import { describe, it, expect } from 'vitest';
import { applyFixes } from './patterns.js';
describe('applyFixes', () => {
    describe('line replacement', () => {
        it('should replace a single line', async () => {
            const code = `var x = 5;\nconst y = 10;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var with const',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\nconst y = 10;');
        });
        it('should replace multiple lines', async () => {
            const code = `var x = 5;\nvar y = 10;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var with const',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                },
                {
                    line: 2,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var with const',
                        oldCode: 'var y = 10;',
                        newCode: 'const y = 10;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\nconst y = 10;');
        });
        it('should preserve indentation when replacing', async () => {
            const code = `  var x = 5;\n  const y = 10;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var with const',
                        oldCode: '  var x = 5;',
                        newCode: '  const x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('  const x = 5;\n  const y = 10;');
        });
    });
    describe('line deletion', () => {
        it('should delete a line when newCode is empty string', async () => {
            const code = `const x = 5;\nconsole.log(x);\nconst y = 10;`;
            const issues = [
                {
                    line: 2,
                    severity: 'info',
                    message: 'Remove console.log',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove console.log',
                        oldCode: 'console.log(x);',
                        newCode: ''
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\nconst y = 10;');
        });
        it('should delete multiple lines', async () => {
            const code = `const x = 5;\nconsole.log(x);\nconsole.log('test');\nconst y = 10;`;
            const issues = [
                {
                    line: 2,
                    severity: 'info',
                    message: 'Remove console.log',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove console.log',
                        oldCode: 'console.log(x);',
                        newCode: ''
                    }
                },
                {
                    line: 3,
                    severity: 'info',
                    message: 'Remove console.log',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove console.log',
                        oldCode: "console.log('test');",
                        newCode: ''
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\nconst y = 10;');
        });
    });
    describe('mixed operations', () => {
        it('should handle both replacements and deletions', async () => {
            const code = `var x = 5;\nconsole.log(x);\nvar y = 10;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                },
                {
                    line: 2,
                    severity: 'info',
                    message: 'Remove console.log',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove console.log',
                        oldCode: 'console.log(x);',
                        newCode: ''
                    }
                },
                {
                    line: 3,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: 'var y = 10;',
                        newCode: 'const y = 10;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\nconst y = 10;');
        });
    });
    describe('edge cases', () => {
        it('should handle empty code', async () => {
            const fixed = await applyFixes('', []);
            expect(fixed).toBe('');
        });
        it('should handle empty issues array', async () => {
            const code = `const x = 5;`;
            const fixed = await applyFixes(code, []);
            expect(fixed).toBe(code);
        });
        it('should ignore issues without fixes', async () => {
            const code = `const x = 5;`;
            const issues = [
                {
                    line: 1,
                    severity: 'info',
                    message: 'Some info',
                    rule: 'test'
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe(code);
        });
        it('should ignore fixes for invalid line numbers (line 0)', async () => {
            const code = `const x = 5;`;
            const issues = [
                {
                    line: 0,
                    severity: 'warning',
                    message: 'Invalid',
                    rule: 'test',
                    fix: {
                        description: 'Fix',
                        oldCode: 'const x = 5;',
                        newCode: 'let x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe(code);
        });
        it('should ignore fixes for line numbers beyond file length', async () => {
            const code = `const x = 5;`;
            const issues = [
                {
                    line: 100,
                    severity: 'warning',
                    message: 'Invalid',
                    rule: 'test',
                    fix: {
                        description: 'Fix',
                        oldCode: 'something',
                        newCode: 'something else'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe(code);
        });
        it('should handle single-line code', async () => {
            const code = `var x = 5;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;');
        });
        it('should handle deleting all lines', async () => {
            const code = `console.log('a');\nconsole.log('b');`;
            const issues = [
                {
                    line: 1,
                    severity: 'info',
                    message: 'Remove',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove',
                        oldCode: "console.log('a');",
                        newCode: ''
                    }
                },
                {
                    line: 2,
                    severity: 'info',
                    message: 'Remove',
                    rule: 'no-console',
                    fix: {
                        description: 'Remove',
                        oldCode: "console.log('b');",
                        newCode: ''
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('');
        });
        it('should handle multiple fixes on the same line (last wins)', async () => {
            const code = `var x = 5;`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Fix 1',
                    rule: 'test1',
                    fix: {
                        description: 'Fix 1',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                },
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Fix 2',
                    rule: 'test2',
                    fix: {
                        description: 'Fix 2',
                        oldCode: 'var x = 5;',
                        newCode: 'let x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            // Last fix wins due to Map.set() overwriting
            expect(fixed).toBe('let x = 5;');
        });
        it('should preserve blank lines that are not being fixed', async () => {
            const code = `const x = 5;\n\nconst y = 10;`;
            const fixed = await applyFixes(code, []);
            expect(fixed).toBe(code);
        });
        it('should handle code with trailing newline', async () => {
            const code = `var x = 5;\n`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: 'var x = 5;',
                        newCode: 'const x = 5;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe('const x = 5;\n');
        });
    });
    describe('real-world scenarios', () => {
        it('should fix var declarations in a function', async () => {
            const code = `function test() {\n  var x = 5;\n  var y = 10;\n  return x + y;\n}`;
            const issues = [
                {
                    line: 2,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: '  var x = 5;',
                        newCode: '  const x = 5;'
                    }
                },
                {
                    line: 3,
                    severity: 'warning',
                    message: 'Use const',
                    rule: 'no-var',
                    fix: {
                        description: 'Replace var',
                        oldCode: '  var y = 10;',
                        newCode: '  const y = 10;'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe(`function test() {\n  const x = 5;\n  const y = 10;\n  return x + y;\n}`);
        });
        it('should fix equality operators', async () => {
            const code = `if (x == 5) {\n  return true;\n}`;
            const issues = [
                {
                    line: 1,
                    severity: 'warning',
                    message: 'Use ===',
                    rule: 'eqeqeq',
                    fix: {
                        description: 'Replace ==',
                        oldCode: 'if (x == 5) {',
                        newCode: 'if (x === 5) {'
                    }
                }
            ];
            const fixed = await applyFixes(code, issues);
            expect(fixed).toBe(`if (x === 5) {\n  return true;\n}`);
        });
    });
});
//# sourceMappingURL=patterns.test.js.map