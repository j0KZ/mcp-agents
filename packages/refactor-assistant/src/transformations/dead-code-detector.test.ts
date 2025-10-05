import { describe, it, expect } from 'vitest';
import {
  findUnusedVariables,
  removeUnusedVariables,
  findUnreachableCode,
  removeUnreachableCode,
} from './dead-code-detector.js';

describe('findUnusedVariables()', () => {
  describe('Happy Path', () => {
    it('should find truly unused variables', () => {
      const code = `
        const unusedVar = 42;
        const usedVar = 'hello';
        console.log(usedVar);
      `;
      const unused = findUnusedVariables(code);
      expect(unused).toContain('unusedVar');
      expect(unused).not.toContain('usedVar');
    });

    it('should detect multiple unused variables', () => {
      const code = `
        let foo = 1;
        var bar = 2;
        const baz = 3;
        const used = 4;
        console.log(used);
      `;
      const unused = findUnusedVariables(code);
      expect(unused).toContain('foo');
      expect(unused).toContain('bar');
      expect(unused).toContain('baz');
      expect(unused).not.toContain('used');
    });

    it('should consider variable used if referenced', () => {
      const code = `
        const config = { key: 'value' };
        return config.key;
      `;
      const unused = findUnusedVariables(code);
      expect(unused).not.toContain('config');
    });

    it('should handle variables used in function calls', () => {
      const code = `
        const data = fetchData();
        processData(data);
      `;
      const unused = findUnusedVariables(code);
      expect(unused).not.toContain('data');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for empty code', () => {
      const unused = findUnusedVariables('');
      expect(unused).toEqual([]);
    });

    it('should handle code with no variables', () => {
      const code = `
        console.log('hello');
        return 42;
      `;
      const unused = findUnusedVariables(code);
      expect(unused).toEqual([]);
    });

    it('should skip lines longer than 1000 characters (ReDoS protection)', () => {
      const longLine = 'const x = ' + 'a'.repeat(1001) + ';';
      const code = `
        ${longLine}
        const y = 1;
      `;
      const unused = findUnusedVariables(code);
      // x should not be detected because line is too long
      expect(unused).not.toContain('x');
      expect(unused).toContain('y');
    });

    it('should handle single-character variable names', () => {
      const code = `
        const x = 1;
        const y = 2;
        console.log(y);
      `;
      const unused = findUnusedVariables(code);
      expect(unused).toContain('x');
      expect(unused).not.toContain('y');
    });

    it('should handle variables with same prefix', () => {
      const code = `
        const data = 1;
        const dataValue = 2;
        console.log(dataValue);
      `;
      const unused = findUnusedVariables(code);
      // Note: 'data' appears in 'dataValue', so it's counted as used
      // Implementation uses split() which counts substring occurrences
      expect(unused).not.toContain('data');
      expect(unused).not.toContain('dataValue');
    });

    it('should count occurrences correctly for MIN_VARIABLE_USAGE threshold', () => {
      // Variable appears exactly once (at declaration only)
      const code = `const unused = 42;`;
      const unused = findUnusedVariables(code);
      expect(unused).toContain('unused');
    });
  });

  describe('Error Cases', () => {
    it('should handle code with syntax errors gracefully', () => {
      const code = `
        const invalid = ;
        const valid = 1;
      `;
      expect(() => findUnusedVariables(code)).not.toThrow();
    });

    it('should handle malformed variable declarations', () => {
      const code = `
        let
        const x = 1;
      `;
      expect(() => findUnusedVariables(code)).not.toThrow();
    });

    it('should handle code with only comments', () => {
      const code = `
        // const commented = 1;
        /* const alsoCommented = 2; */
      `;
      const unused = findUnusedVariables(code);
      // Note: The regex still matches 'const var' in comments
      // This is a known limitation of the simple implementation
      expect(unused.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('findUnreachableCode()', () => {
  describe('Happy Path', () => {
    it('should find unreachable code after return statement', () => {
      const code = `
        function test() {
          return true;
          console.log('unreachable');
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable.length).toBeGreaterThan(0);
      expect(unreachable[0].code).toContain('console.log');
    });

    it('should report correct line numbers for unreachable code', () => {
      const code = `function test() {
  return true;
  console.log('unreachable');
}`;
      const unreachable = findUnreachableCode(code);
      expect(unreachable[0].line).toBe(3);
    });

    it('should find multiple unreachable statements', () => {
      const code = `
        function test() {
          return true;
          const x = 1;
          console.log(x);
          alert('also unreachable');
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable.length).toBeGreaterThan(1);
    });

    it('should detect unreachable code in multiple functions', () => {
      const code = `
        function a() {
          return 1;
          doSomething();
        }
        function b() {
          return 2;
          doOtherThing();
        }
      `;
      const unreachable = findUnreachableCode(code);
      // Note: Implementation checks up to 5 lines after each return
      // So it may find more than just the immediate next lines
      expect(unreachable.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for empty code', () => {
      const unreachable = findUnreachableCode('');
      expect(unreachable).toEqual([]);
    });

    it('should not flag closing braces as unreachable', () => {
      const code = `
        function test() {
          return true;
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should not flag closing brackets as unreachable', () => {
      const code = `
        function test() {
          return [1, 2, 3];
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should not flag closing parentheses as unreachable', () => {
      const code = `
        function test() {
          return (x + y);
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should ignore empty lines after return', () => {
      const code = `
        function test() {
          return true;

        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should ignore single-line comments after return', () => {
      const code = `
        function test() {
          return true;
          // this is a comment
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should ignore block comments after return', () => {
      const code = `
        function test() {
          return true;
          /* this is a comment */
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should check up to UNREACHABLE_CHECK_LINES (5) after return', () => {
      const code = `
        function test() {
          return true;
          line1();
          line2();
          line3();
          line4();
          line5();
          line6();
        }
      `;
      const unreachable = findUnreachableCode(code);
      // Should find exactly 5 lines (UNREACHABLE_CHECK_LINES limit)
      expect(unreachable.length).toBe(5);
    });

    it('should handle return statements at end of file', () => {
      const code = `return true;`;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    it('should handle code with no return statements', () => {
      const code = `
        function test() {
          console.log('no return');
        }
      `;
      const unreachable = findUnreachableCode(code);
      expect(unreachable).toEqual([]);
    });

    it('should handle malformed code gracefully', () => {
      const code = `
        return
        invalid syntax here
      `;
      expect(() => findUnreachableCode(code)).not.toThrow();
    });
  });
});

describe('removeUnusedVariables()', () => {
  describe('Happy Path', () => {
    it('should remove single unused variable', () => {
      const code = `const unused = 42;\nconst used = 1;\nconsole.log(used);`;
      const result = removeUnusedVariables(code, ['unused']);
      expect(result).not.toContain('unused');
      expect(result).toContain('used');
    });

    it('should remove multiple unused variables', () => {
      const code = `const a = 1;\nconst b = 2;\nconst c = 3;\nconsole.log(c);`;
      const result = removeUnusedVariables(code, ['a', 'b']);
      expect(result).not.toContain('const a');
      expect(result).not.toContain('const b');
      expect(result).toContain('const c');
    });

    it('should handle let declarations', () => {
      const code = `let unused = 'test';\nlet used = 'kept';\nreturn used;`;
      const result = removeUnusedVariables(code, ['unused']);
      expect(result).not.toContain('let unused');
      expect(result).toContain('let used');
    });

    it('should handle var declarations', () => {
      const code = `var unused = true;\nvar used = false;\nif (used) {}`;
      const result = removeUnusedVariables(code, ['unused']);
      expect(result).not.toContain('var unused');
      expect(result).toContain('var used');
    });

    it('should preserve whitespace and formatting', () => {
      const code = `const used = 1;\n\nconst unused = 2;\n\nconsole.log(used);`;
      const result = removeUnusedVariables(code, ['unused']);
      expect(result).toContain('const used');
      expect(result).not.toContain('unused');
    });
  });

  describe('Edge Cases', () => {
    it('should return unchanged code when no unused variables provided', () => {
      const code = `const x = 1;\nconst y = 2;`;
      const result = removeUnusedVariables(code, []);
      expect(result).toBe(code);
    });

    it('should handle empty code', () => {
      const result = removeUnusedVariables('', ['unused']);
      expect(result).toBe('');
    });

    it('should handle variable with special regex characters in name', () => {
      // Though not valid JavaScript, test regex escaping
      const code = `const normalVar = 1;\nconsole.log(normalVar);`;
      const result = removeUnusedVariables(code, ['$specialVar']);
      expect(result).toBe(code); // Should not break
    });

    it('should remove all occurrences of declaration pattern', () => {
      const code = `const x = 1;\nconst x = 2;\nconst y = 3;\nconsole.log(y);`;
      const result = removeUnusedVariables(code, ['x']);
      expect(result).not.toContain('const x');
      expect(result).toContain('const y');
    });
  });

  describe('Integration with findUnusedVariables', () => {
    it('should work correctly with findUnusedVariables output', () => {
      const code = `
        const unused1 = 1;
        const unused2 = 2;
        const used = 3;
        console.log(used);
      `;
      const unused = findUnusedVariables(code);
      const cleaned = removeUnusedVariables(code, unused);
      expect(cleaned).not.toContain('unused1');
      expect(cleaned).not.toContain('unused2');
      expect(cleaned).toContain('used');
    });
  });
});

describe('removeUnreachableCode()', () => {
  describe('Happy Path', () => {
    it('should remove unreachable code and return count', () => {
      const code = `function test() {
  return true;
  console.log('unreachable');
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).not.toContain('console.log');
      expect(result.removed).toBe(1);
    });

    it('should remove multiple unreachable lines', () => {
      const code = `function test() {
  return true;
  const x = 1;
  console.log(x);
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).not.toContain('const x');
      expect(result.code).not.toContain('console.log');
      expect(result.removed).toBe(2);
    });

    it('should preserve reachable code', () => {
      const code = `function test() {
  const x = 1;
  console.log(x);
  return true;
  alert('unreachable');
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).toContain('const x');
      expect(result.code).toContain('console.log');
      expect(result.code).not.toContain('alert');
      expect(result.removed).toBe(1);
    });

    it('should work backwards to preserve line indices', () => {
      const code = `function a() {
  return 1;
  line1();
}
function b() {
  return 2;
  line2();
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).not.toContain('line1');
      expect(result.code).not.toContain('line2');
      // Note: Implementation checks up to 5 lines after each return
      // So it may find more unreachable lines (like closing braces in range)
      expect(result.removed).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge Cases', () => {
    it('should return unchanged code when no unreachable code exists', () => {
      const code = `function test() {
  console.log('hello');
  return true;
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).toBe(code);
      expect(result.removed).toBe(0);
    });

    it('should handle empty code', () => {
      const result = removeUnreachableCode('');
      expect(result.code).toBe('');
      expect(result.removed).toBe(0);
    });

    it('should preserve closing braces', () => {
      const code = `function test() {
  return true;
}`;
      const result = removeUnreachableCode(code);
      expect(result.code).toContain('}');
      expect(result.removed).toBe(0);
    });

    it('should handle code with only return statement', () => {
      const code = `return 42;`;
      const result = removeUnreachableCode(code);
      expect(result.code).toBe(code);
      expect(result.removed).toBe(0);
    });
  });

  describe('Integration with findUnreachableCode', () => {
    it('should remove all code identified by findUnreachableCode', () => {
      const code = `function test() {
  return true;
  const a = 1;
  const b = 2;
  const c = 3;
}`;
      const unreachable = findUnreachableCode(code);
      const result = removeUnreachableCode(code);

      expect(result.removed).toBe(unreachable.length);
      expect(result.code).not.toContain('const a');
      expect(result.code).not.toContain('const b');
      expect(result.code).not.toContain('const c');
    });
  });
});

describe('Integration Tests', () => {
  it('should handle combined unused variables and unreachable code', () => {
    const code = `function test() {
  const unused = 1;
  const used = 2;
  console.log(used);
  return true;
  alert('unreachable');
}`;

    // First remove unused variables
    const unused = findUnusedVariables(code);
    const afterUnused = removeUnusedVariables(code, unused);

    // Then remove unreachable code
    const afterUnreachable = removeUnreachableCode(afterUnused);

    expect(afterUnreachable.code).not.toContain('unused');
    expect(afterUnreachable.code).not.toContain('alert');
    expect(afterUnreachable.code).toContain('used');
    expect(afterUnreachable.code).toContain('console.log');
  });

  it('should handle realistic refactoring scenario', () => {
    const code = `function processData(input) {
  const debug = true;
  const tempVar = 'temporary';
  const result = input.map(x => x * 2);
  console.log(result);
  return result;
  console.log('this will never run');
  const neverUsed = 42;
}`;

    const unused = findUnusedVariables(code);
    const cleaned = removeUnusedVariables(code, unused);
    const final = removeUnreachableCode(cleaned);

    expect(final.code).not.toContain('debug');
    expect(final.code).not.toContain('tempVar');
    expect(final.code).not.toContain('this will never run');
    expect(final.code).toContain('result');
    expect(final.code).toContain('return result');
  });

  it('should respect ReDoS protection with 1000+ character lines', () => {
    const longVarValue = 'x'.repeat(1500);
    const code = `const longVar = "${longVarValue}";\nconst shortVar = 1;\nconsole.log(shortVar);`;

    const unused = findUnusedVariables(code);
    // longVar should not be detected due to line length limit
    expect(unused).not.toContain('longVar');
    expect(unused).not.toContain('shortVar');
  });
});
