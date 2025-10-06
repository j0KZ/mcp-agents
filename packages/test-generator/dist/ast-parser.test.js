import { describe, it, expect } from 'vitest';
import { ASTParser } from './ast-parser.js';
import { AnalysisCache } from '@j0kz/shared';
describe('ASTParser', () => {
    const parser = new ASTParser();
    describe('Function Extraction', () => {
        it('should extract function declarations', () => {
            const code = `
        function add(a, b) {
          return a + b;
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].name).toBe('add');
            expect(result.functions[0].params).toEqual(['a', 'b']);
            expect(result.functions[0].async).toBe(false);
        });
        it('should extract async functions', () => {
            const code = `
        async function fetchData(url) {
          return await fetch(url);
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].name).toBe('fetchData');
            expect(result.functions[0].async).toBe(true);
        });
        it('should extract arrow functions', () => {
            const code = `
        const multiply = (x, y) => x * y;
        const square = n => n * n;
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(2);
            expect(result.functions[0].name).toBe('multiply');
            expect(result.functions[0].params).toEqual(['x', 'y']);
            expect(result.functions[1].name).toBe('square');
            expect(result.functions[1].params).toEqual(['n']);
        });
        it('should extract functions with default parameters', () => {
            const code = `
        function greet(name = 'World', greeting = 'Hello') {
          return greeting + ' ' + name;
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].params).toEqual(['name', 'greeting']);
        });
        it('should extract functions with rest parameters', () => {
            const code = `
        function sum(...numbers) {
          return numbers.reduce((a, b) => a + b, 0);
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1); // sum (inline callbacks not extracted)
            expect(result.functions[0].params).toEqual(['...numbers']);
        });
        it('should extract functions with destructured parameters', () => {
            const code = `
        function processUser({ name, age }) {
          return name + ' is ' + age;
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].params).toEqual(['{}']); // Simplified
        });
    });
    describe('Class Extraction', () => {
        it('should extract class declarations', () => {
            const code = `
        class Calculator {
          constructor() {
            this.result = 0;
          }

          add(n) {
            this.result += n;
            return this;
          }

          subtract(n) {
            this.result -= n;
            return this;
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.classes).toHaveLength(1);
            expect(result.classes[0].name).toBe('Calculator');
            expect(result.classes[0].methods).toHaveLength(2);
            expect(result.classes[0].constructor).toBeDefined();
            expect(result.classes[0].constructor?.name).toBe('constructor');
        });
        it('should extract async methods', () => {
            const code = `
        class API {
          async fetchUser(id) {
            return await fetch('/users/' + id);
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.classes).toHaveLength(1);
            expect(result.classes[0].methods).toHaveLength(1);
            expect(result.classes[0].methods[0].async).toBe(true);
        });
        it('should extract methods with various parameter types', () => {
            const code = `
        class Util {
          process(data, options = {}) {
            return data;
          }

          batch(...items) {
            return items;
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.classes).toHaveLength(1);
            expect(result.classes[0].methods).toHaveLength(2);
            expect(result.classes[0].methods[0].params).toEqual(['data', 'options']);
            expect(result.classes[0].methods[1].params).toEqual(['...items']);
        });
    });
    describe('TypeScript Support', () => {
        it('should parse TypeScript code', () => {
            const code = `
        function add(a: number, b: number): number {
          return a + b;
        }

        class Person {
          constructor(public name: string, private age: number) {}

          getAge(): number {
            return this.age;
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].name).toBe('add');
            expect(result.classes).toHaveLength(1);
            expect(result.classes[0].name).toBe('Person');
        });
        it('should handle interfaces and types', () => {
            const code = `
        interface User {
          name: string;
          age: number;
        }

        type ID = string | number;

        function getUser(id: ID): User {
          return { name: 'John', age: 30 };
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.functions[0].name).toBe('getUser');
        });
        it('should handle generics', () => {
            const code = `
        function identity<T>(value: T): T {
          return value;
        }

        class Container<T> {
          constructor(private value: T) {}

          getValue(): T {
            return this.value;
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(1);
            expect(result.classes).toHaveLength(1);
        });
    });
    describe('Edge Cases', () => {
        it('should handle empty code', () => {
            const result = parser.parseCode('');
            expect(result.functions).toHaveLength(0);
            expect(result.classes).toHaveLength(0);
        });
        it('should handle code with only comments', () => {
            const code = `
        // This is a comment
        /* Multi-line
           comment */
      `;
            const result = parser.parseCode(code);
            expect(result.functions).toHaveLength(0);
            expect(result.classes).toHaveLength(0);
        });
        it('should handle invalid syntax gracefully', () => {
            const code = `
        function broken( {
          // Missing closing brace
      `;
            const result = parser.parseCode(code);
            // Should not throw, returns empty results
            expect(result.functions).toBeDefined();
            expect(result.classes).toBeDefined();
        });
        it('should handle complex nested structures', () => {
            const code = `
        class Outer {
          method() {
            const inner = () => {
              function nested() {
                return 42;
              }
              return nested();
            };
            return inner();
          }
        }
      `;
            const result = parser.parseCode(code);
            expect(result.classes).toHaveLength(1);
            // Should extract nested functions too
            expect(result.functions.length).toBeGreaterThan(0);
        });
    });
    describe('Line Numbers', () => {
        it('should track accurate line numbers', () => {
            const code = `

function first() {}

function second() {}

class Third {}
      `;
            const result = parser.parseCode(code);
            expect(result.functions[0].line).toBe(3);
            expect(result.functions[1].line).toBe(5);
            expect(result.classes[0].line).toBe(7);
        });
    });
    describe('Caching', () => {
        it('should cache parsed results', () => {
            const cache = new AnalysisCache();
            const cachedParser = new ASTParser(cache);
            const code = `
function testFunc(x: number): number {
  return x * 2;
}
      `;
            // First parse - should miss cache
            const result1 = cachedParser.parseCode(code, 'test.ts');
            expect(result1.functions.length).toBe(1);
            expect(result1.functions[0].name).toBe('testFunc');
            // Second parse with same content - should hit cache
            const result2 = cachedParser.parseCode(code, 'test.ts');
            expect(result2).toBe(result1); // Should be the same cached object
            // Verify cache stats show a hit
            const stats = cache.getStats();
            expect(stats.hits).toBeGreaterThan(0);
        });
        it('should invalidate cache when content changes', () => {
            const cache = new AnalysisCache();
            const cachedParser = new ASTParser(cache);
            const code1 = `function foo() { return 1; }`;
            const code2 = `function bar() { return 2; }`;
            const result1 = cachedParser.parseCode(code1, 'test.ts');
            expect(result1.functions[0].name).toBe('foo');
            // Different content should not use cache
            const result2 = cachedParser.parseCode(code2, 'test.ts');
            expect(result2.functions[0].name).toBe('bar');
            expect(result2).not.toBe(result1);
        });
        it('should work without cache', () => {
            const uncachedParser = new ASTParser(); // No cache provided
            const code = `function test() {}`;
            const result = uncachedParser.parseCode(code);
            expect(result.functions.length).toBe(1);
            expect(result.functions[0].name).toBe('test');
        });
    });
});
//# sourceMappingURL=ast-parser.test.js.map