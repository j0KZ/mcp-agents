/**
 * Tests for AST-based code parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ASTParser } from '../src/ast-parser.js';
import { AnalysisCache } from '@j0kz/shared';

describe('ASTParser', () => {
  let parser: ASTParser;

  beforeEach(() => {
    parser = new ASTParser();
  });

  describe('constructor', () => {
    it('should create parser without cache', () => {
      const p = new ASTParser();
      expect(p).toBeDefined();
    });

    it('should create parser with cache', () => {
      const cache = new AnalysisCache(100, 60000);
      const p = new ASTParser(cache);
      expect(p).toBeDefined();
    });
  });

  describe('parseCode', () => {
    it('should parse function declarations', () => {
      const code = `
        function add(a, b) {
          return a + b;
        }
      `;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('add');
      expect(result.functions[0].params).toContain('a');
      expect(result.functions[0].params).toContain('b');
    });

    it('should parse async function declarations', () => {
      const code = `
        async function fetchData(url) {
          return await fetch(url);
        }
      `;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('fetchData');
      expect(result.functions[0].async).toBe(true);
    });

    it('should parse arrow functions assigned to variables', () => {
      const code = `const add = (a, b) => a + b;`;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('add');
    });

    it('should parse function expressions assigned to variables', () => {
      const code = `const multiply = function(x, y) { return x * y; };`;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('multiply');
    });

    it('should parse class declarations', () => {
      const code = `
        class UserService {
          getUser(id) {
            return { id };
          }
        }
      `;
      const result = parser.parseCode(code);

      expect(result.classes.length).toBe(1);
      expect(result.classes[0].name).toBe('UserService');
      expect(result.classes[0].methods.length).toBe(1);
    });

    it('should extract constructor from class', () => {
      const code = `
        class MyClass {
          constructor(name) {
            this.name = name;
          }
          getName() {
            return this.name;
          }
        }
      `;
      const result = parser.parseCode(code);

      expect(result.classes[0].constructor).toBeDefined();
      expect(result.classes[0].constructor?.name).toBe('constructor');
      expect(result.classes[0].constructor?.params).toContain('name');
    });

    it('should parse async methods in class', () => {
      const code = `
        class DataService {
          async fetchData(url) {
            return await fetch(url);
          }
        }
      `;
      const result = parser.parseCode(code);

      const method = result.classes[0].methods.find(m => m.name === 'fetchData');
      expect(method?.async).toBe(true);
    });

    it('should handle empty code', () => {
      const result = parser.parseCode('');

      expect(result.functions).toEqual([]);
      expect(result.classes).toEqual([]);
    });

    it('should handle code with only comments', () => {
      const code = `
        // This is a comment
        /* Multi-line comment */
      `;
      const result = parser.parseCode(code);

      expect(result.functions).toEqual([]);
      expect(result.classes).toEqual([]);
    });

    it('should track line numbers', () => {
      const code = `function first() {}

function second() {}`;
      const result = parser.parseCode(code);

      expect(result.functions[0].line).toBe(1);
      expect(result.functions[1].line).toBe(3);
    });

    it('should handle TypeScript code', () => {
      const code = `
        function greet(name: string): string {
          return \`Hello, \${name}\`;
        }
      `;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('greet');
    });

    it('should handle JSX code', () => {
      const code = `
        function App() {
          return <div>Hello</div>;
        }
      `;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(1);
      expect(result.functions[0].name).toBe('App');
    });

    it('should return cached results when cache is provided', () => {
      const cache = new AnalysisCache(100, 60000);
      const parserWithCache = new ASTParser(cache);

      const code = `function test() {}`;
      const result1 = parserWithCache.parseCode(code, 'test.ts');
      const result2 = parserWithCache.parseCode(code, 'test.ts');

      expect(result1.functions.length).toBe(1);
      expect(result2.functions.length).toBe(1);
    });
  });

  describe('function parameter types', () => {
    it('should handle AssignmentPattern parameters (default values)', () => {
      const code = `function greet(name = 'World') { return name; }`;
      const result = parser.parseCode(code);

      expect(result.functions[0].params).toContain('name');
    });

    it('should handle RestElement parameters', () => {
      const code = `function sum(...numbers) { return numbers.reduce((a, b) => a + b, 0); }`;
      const result = parser.parseCode(code);

      expect(result.functions[0].params).toContain('...numbers');
    });

    it('should handle ObjectPattern parameters (destructuring)', () => {
      const code = `function process({ name, age }) { return name; }`;
      const result = parser.parseCode(code);

      expect(result.functions[0].params).toContain('{}');
    });

    it('should handle ArrayPattern parameters', () => {
      const code = `function first([a, b]) { return a; }`;
      const result = parser.parseCode(code);

      expect(result.functions[0].params).toContain('{}');
    });
  });

  describe('method parameter types', () => {
    it('should handle AssignmentPattern in method params', () => {
      const code = `class Test { greet(name = 'World') { return name; } }`;
      const result = parser.parseCode(code);

      expect(result.classes[0].methods[0].params).toContain('name');
    });

    it('should handle RestElement in method params', () => {
      const code = `class Test { sum(...nums) { return nums; } }`;
      const result = parser.parseCode(code);

      expect(result.classes[0].methods[0].params).toContain('...nums');
    });

    it('should handle ObjectPattern in method params', () => {
      const code = `class Test { process({ x, y }) { return x + y; } }`;
      const result = parser.parseCode(code);

      expect(result.classes[0].methods[0].params).toContain('{}');
    });

    it('should handle ArrayPattern in method params', () => {
      const code = `class Test { first([a]) { return a; } }`;
      const result = parser.parseCode(code);

      expect(result.classes[0].methods[0].params).toContain('{}');
    });
  });

  describe('error handling', () => {
    it('should handle invalid syntax gracefully', () => {
      const code = `function { broken syntax`;
      const result = parser.parseCode(code);

      // Should return empty results instead of throwing
      expect(result).toBeDefined();
      expect(result.functions).toBeDefined();
      expect(result.classes).toBeDefined();
    });

    it('should handle syntax that triggers parse errors', () => {
      // Severely malformed code
      const code = `{{{{{`;
      const result = parser.parseCode(code);

      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle function without id (anonymous)', () => {
      // FunctionDeclaration without id is rare but possible in AST
      const code = `export default function() {}`;
      const result = parser.parseCode(code);

      // Should not include anonymous functions without names
      expect(result.functions.length).toBe(0);
    });

    it('should handle class without id', () => {
      const code = `export default class {}`;
      const result = parser.parseCode(code);

      // Should not include anonymous class
      expect(result.classes.length).toBe(0);
    });

    it('should handle class with non-identifier method key', () => {
      // Computed property names
      const code = `
        class Test {
          ['computed']() {}
        }
      `;
      const result = parser.parseCode(code);

      // Computed method should not be included (non-Identifier key)
      expect(result.classes[0].methods.length).toBe(0);
    });

    it('should handle multiple classes and functions', () => {
      const code = `
        function a() {}
        class B { method() {} }
        function c() {}
        class D {}
      `;
      const result = parser.parseCode(code);

      expect(result.functions.length).toBe(2);
      expect(result.classes.length).toBe(2);
    });

    it('should handle decorators', () => {
      const code = `
        @Injectable()
        class Service {
          @Log
          process() {}
        }
      `;
      const result = parser.parseCode(code);

      expect(result.classes.length).toBe(1);
      expect(result.classes[0].name).toBe('Service');
    });

    it('should handle this parameter in TypeScript methods', () => {
      // TypeScript 'this' parameter is parsed as an Identifier by Babel
      const code = `
        class Test {
          method(this: Test) {}
        }
      `;
      const result = parser.parseCode(code);

      // 'this' parameter is parsed as an Identifier with name 'this'
      expect(result.classes[0].methods[0].params).toContain('this');
    });

    it('should provide file path to cache', () => {
      const cache = new AnalysisCache(100, 60000);
      const parserWithCache = new ASTParser(cache);

      const code = `function test() {}`;
      parserWithCache.parseCode(code, 'custom/path.ts');

      // Verify cache was used with the path
      const stats = cache.getStats();
      expect(stats.misses).toBeGreaterThan(0);
    });
  });
});
