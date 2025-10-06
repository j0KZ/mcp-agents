import { describe, it, expect } from 'vitest';
import { applyPattern, isValidPattern, getSupportedPatterns } from './pattern-factory.js';
import { DesignPattern } from '../types.js';

describe('pattern-factory', () => {
  describe('applyPattern()', () => {
    // Happy path tests for each pattern
    describe('singleton pattern', () => {
      it('should apply singleton pattern to a class', () => {
        const code = `class Database {
  connect() {
    return 'Connected';
  }
}`;
        const result = applyPattern('singleton', code, {});

        expect(result).toContain('private static instance: Database');
        expect(result).toContain('private constructor()');
        expect(result).toContain('public static getInstance()');
        expect(result).toContain('connect()');
      });

      it('should extract class name from code', () => {
        const code = 'class MyService {}';
        const result = applyPattern('singleton', code, {});

        expect(result).toContain('class MyService');
        expect(result).toContain('MyService.instance');
      });

      it('should use default name if no class found', () => {
        const code = 'const obj = {};';
        const result = applyPattern('singleton', code, {});

        expect(result).toContain('class Singleton');
      });
    });

    describe('factory pattern', () => {
      it('should apply factory pattern with custom class name', () => {
        const code = '// Original code';
        const result = applyPattern('factory', code, { className: 'Widget' });

        expect(result).toContain('interface Widget');
        expect(result).toContain('class ConcreteWidgetA');
        expect(result).toContain('class ConcreteWidgetB');
        expect(result).toContain('class WidgetFactory');
        expect(result).toContain('// Original code');
      });

      it('should use default Product name when className not provided', () => {
        const code = '';
        const result = applyPattern('factory', code, {});

        expect(result).toContain('interface Product');
        expect(result).toContain('class ProductFactory');
      });
    });

    describe('observer pattern', () => {
      it('should apply observer pattern', () => {
        const code = '// Custom observer implementations';
        const result = applyPattern('observer', code, {});

        expect(result).toContain('interface Observer');
        expect(result).toContain('class Subject');
        expect(result).toContain('attach(observer: Observer)');
        expect(result).toContain('detach(observer: Observer)');
        expect(result).toContain('notify(data: any)');
        expect(result).toContain('// Custom observer implementations');
      });
    });

    describe('strategy pattern', () => {
      it('should apply strategy pattern', () => {
        const code = 'class ConcreteStrategyA implements Strategy {}';
        const result = applyPattern('strategy', code, {});

        expect(result).toContain('interface Strategy');
        expect(result).toContain('class Context');
        expect(result).toContain('setStrategy(strategy: Strategy)');
        expect(result).toContain('executeStrategy(data: any)');
        expect(result).toContain('ConcreteStrategyA');
      });
    });

    describe('decorator pattern', () => {
      it('should apply decorator pattern', () => {
        const code = 'class ConcreteDecorator extends Decorator {}';
        const result = applyPattern('decorator', code, {});

        expect(result).toContain('interface Component');
        expect(result).toContain('class ConcreteComponent');
        expect(result).toContain('abstract class Decorator');
        expect(result).toContain('ConcreteDecorator');
      });
    });

    describe('adapter pattern', () => {
      it('should apply adapter pattern', () => {
        const code = '// Adapter implementations';
        const result = applyPattern('adapter', code, {});

        expect(result).toContain('interface Target');
        expect(result).toContain('class Adaptee');
        expect(result).toContain('class Adapter implements Target');
        expect(result).toContain('specificRequest()');
        expect(result).toContain('// Adapter implementations');
      });
    });

    describe('facade pattern', () => {
      it('should apply facade pattern', () => {
        const code = '// Additional subsystems';
        const result = applyPattern('facade', code, {});

        expect(result).toContain('class SubsystemA');
        expect(result).toContain('class SubsystemB');
        expect(result).toContain('class Facade');
        expect(result).toContain('operationA()');
        expect(result).toContain('operationB()');
        expect(result).toContain('// Additional subsystems');
      });
    });

    describe('proxy pattern', () => {
      it('should apply proxy pattern', () => {
        const code = '// Proxy extensions';
        const result = applyPattern('proxy', code, {});

        expect(result).toContain('interface Subject');
        expect(result).toContain('class RealSubject');
        expect(result).toContain('class Proxy implements Subject');
        expect(result).toContain('preRequest()');
        expect(result).toContain('postRequest()');
        expect(result).toContain('// Proxy extensions');
      });
    });

    describe('command pattern', () => {
      it('should apply command pattern', () => {
        const code = '// Command implementations';
        const result = applyPattern('command', code, {});

        expect(result).toContain('interface Command');
        expect(result).toContain('class ConcreteCommand');
        expect(result).toContain('class Receiver');
        expect(result).toContain('class Invoker');
        expect(result).toContain('executeCommand()');
        expect(result).toContain('// Command implementations');
      });
    });

    describe('chain-of-responsibility pattern', () => {
      it('should apply chain of responsibility pattern', () => {
        const code = '// Chain handlers';
        const result = applyPattern('chain-of-responsibility', code, {});

        expect(result).toContain('abstract class Handler');
        expect(result).toContain('class ConcreteHandler1');
        expect(result).toContain('class ConcreteHandler2');
        expect(result).toContain('setNext(handler: Handler)');
        expect(result).toContain('handle(request: any)');
        expect(result).toContain('// Chain handlers');
      });
    });

    // Edge cases
    describe('edge cases', () => {
      it('should handle empty code string', () => {
        const result = applyPattern('observer', '', {});

        expect(result).toContain('interface Observer');
        expect(result).toBeDefined();
      });

      it('should handle empty options object', () => {
        const result = applyPattern('factory', 'const x = 1;', {});

        expect(result).toContain('interface Product');
      });

      it('should preserve multiline code in singleton pattern', () => {
        const code = `class Service {
  method1() {}
  method2() {}
  method3() {}
}`;
        const result = applyPattern('singleton', code, {});

        expect(result).toContain('method1()');
        expect(result).toContain('method2()');
        expect(result).toContain('method3()');
      });

      it('should handle special characters in code', () => {
        const code = 'const special = `template ${string}`;';
        const result = applyPattern('facade', code, {});

        expect(result).toContain('const special');
      });
    });

    // Error cases
    describe('error handling', () => {
      it('should throw error for unknown pattern', () => {
        expect(() => {
          applyPattern('unknown-pattern' as DesignPattern, 'code', {});
        }).toThrow('Unknown pattern: unknown-pattern');
      });

      it('should throw error for invalid pattern type', () => {
        expect(() => {
          applyPattern('invalid' as DesignPattern, 'code', {});
        }).toThrow('Unknown pattern: invalid');
      });

      it('should throw error for undefined pattern', () => {
        expect(() => {
          applyPattern(undefined as any, 'code', {});
        }).toThrow();
      });

      it('should throw error for null pattern', () => {
        expect(() => {
          applyPattern(null as any, 'code', {});
        }).toThrow();
      });

      it('should throw error for empty string pattern', () => {
        expect(() => {
          applyPattern('' as any, 'code', {});
        }).toThrow('Unknown pattern: ');
      });
    });

    // Integration tests
    describe('integration tests', () => {
      it('should apply pattern and return valid TypeScript code', () => {
        const code = 'class MyClass {}';
        const result = applyPattern('singleton', code, {});

        // Check for valid TypeScript syntax
        expect(result).toMatch(/class \w+/);
        expect(result).toMatch(/private static instance/);
        expect(result).toMatch(/public static getInstance\(\)/);
      });

      it('should preserve original code in appropriate patterns', () => {
        const original = 'const value = 42;';

        // Factory pattern appends code
        const factoryResult = applyPattern('factory', original, {});
        expect(factoryResult).toContain(original);

        // Observer pattern appends code
        const observerResult = applyPattern('observer', original, {});
        expect(observerResult).toContain(original);
      });

      it('should handle all patterns with same input code', () => {
        const code = 'const data = "test";';
        const patterns: DesignPattern[] = [
          'singleton',
          'factory',
          'observer',
          'strategy',
          'decorator',
          'adapter',
          'facade',
          'proxy',
          'command',
          'chain-of-responsibility',
        ];

        patterns.forEach(pattern => {
          const result = applyPattern(pattern, code, {});
          expect(result).toBeDefined();
          expect(result.length).toBeGreaterThan(code.length);
        });
      });
    });
  });

  describe('isValidPattern()', () => {
    describe('valid patterns', () => {
      it('should return true for singleton', () => {
        expect(isValidPattern('singleton')).toBe(true);
      });

      it('should return true for factory', () => {
        expect(isValidPattern('factory')).toBe(true);
      });

      it('should return true for observer', () => {
        expect(isValidPattern('observer')).toBe(true);
      });

      it('should return true for strategy', () => {
        expect(isValidPattern('strategy')).toBe(true);
      });

      it('should return true for decorator', () => {
        expect(isValidPattern('decorator')).toBe(true);
      });

      it('should return true for adapter', () => {
        expect(isValidPattern('adapter')).toBe(true);
      });

      it('should return true for facade', () => {
        expect(isValidPattern('facade')).toBe(true);
      });

      it('should return true for proxy', () => {
        expect(isValidPattern('proxy')).toBe(true);
      });

      it('should return true for command', () => {
        expect(isValidPattern('command')).toBe(true);
      });

      it('should return true for chain-of-responsibility', () => {
        expect(isValidPattern('chain-of-responsibility')).toBe(true);
      });
    });

    describe('invalid patterns', () => {
      it('should return false for unknown pattern', () => {
        expect(isValidPattern('unknown')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isValidPattern('')).toBe(false);
      });

      it('should return false for case-sensitive mismatch', () => {
        expect(isValidPattern('SINGLETON')).toBe(false);
        expect(isValidPattern('Singleton')).toBe(false);
      });

      it('should return false for partial pattern names', () => {
        expect(isValidPattern('single')).toBe(false);
        expect(isValidPattern('fact')).toBe(false);
      });

      it('should return false for pattern with typo', () => {
        expect(isValidPattern('singletom')).toBe(false);
        expect(isValidPattern('factroy')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle undefined input', () => {
        expect(isValidPattern(undefined as any)).toBe(false);
      });

      it('should handle null input', () => {
        expect(isValidPattern(null as any)).toBe(false);
      });

      it('should be case-sensitive', () => {
        expect(isValidPattern('Facade')).toBe(false);
        expect(isValidPattern('facade')).toBe(true);
      });
    });

    describe('type guard behavior', () => {
      it('should narrow type to DesignPattern when true', () => {
        const pattern: string = 'singleton';

        if (isValidPattern(pattern)) {
          // TypeScript should know pattern is DesignPattern here
          const result = applyPattern(pattern, 'code', {});
          expect(result).toBeDefined();
        }
      });

      it('should work in filter operations', () => {
        const patterns = ['singleton', 'invalid', 'factory', 'unknown'];
        const validPatterns = patterns.filter(isValidPattern);

        expect(validPatterns).toEqual(['singleton', 'factory']);
        expect(validPatterns).toHaveLength(2);
      });
    });
  });

  describe('getSupportedPatterns()', () => {
    it('should return array of all supported patterns', () => {
      const patterns = getSupportedPatterns();

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns).toHaveLength(10);
    });

    it('should include all design patterns', () => {
      const patterns = getSupportedPatterns();

      expect(patterns).toContain('singleton');
      expect(patterns).toContain('factory');
      expect(patterns).toContain('observer');
      expect(patterns).toContain('strategy');
      expect(patterns).toContain('decorator');
      expect(patterns).toContain('adapter');
      expect(patterns).toContain('facade');
      expect(patterns).toContain('proxy');
      expect(patterns).toContain('command');
      expect(patterns).toContain('chain-of-responsibility');
    });

    it('should return patterns that all pass isValidPattern check', () => {
      const patterns = getSupportedPatterns();

      patterns.forEach(pattern => {
        expect(isValidPattern(pattern)).toBe(true);
      });
    });

    it('should return same patterns on multiple calls', () => {
      const first = getSupportedPatterns();
      const second = getSupportedPatterns();

      expect(first).toEqual(second);
    });

    it('should return patterns usable with applyPattern', () => {
      const patterns = getSupportedPatterns();
      const code = 'const test = true;';

      patterns.forEach(pattern => {
        expect(() => applyPattern(pattern, code, {})).not.toThrow();
      });
    });

    describe('pattern list completeness', () => {
      it('should have exactly 10 patterns', () => {
        const patterns = getSupportedPatterns();
        expect(patterns).toHaveLength(10);
      });

      it('should have no duplicate patterns', () => {
        const patterns = getSupportedPatterns();
        const uniquePatterns = [...new Set(patterns)];

        expect(patterns).toHaveLength(uniquePatterns.length);
      });
    });
  });

  describe('pattern consistency', () => {
    it('should have all patterns from getSupportedPatterns work in applyPattern', () => {
      const patterns = getSupportedPatterns();
      const testCode = 'class Test {}';

      patterns.forEach(pattern => {
        const result = applyPattern(pattern, testCode, {});
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should validate all getSupportedPatterns with isValidPattern', () => {
      const patterns = getSupportedPatterns();

      patterns.forEach(pattern => {
        expect(isValidPattern(pattern)).toBe(true);
      });
    });

    it('should reject patterns not in getSupportedPatterns', () => {
      const invalidPatterns = ['builder', 'prototype', 'memento', 'visitor'];

      invalidPatterns.forEach(pattern => {
        expect(isValidPattern(pattern)).toBe(false);
        expect(() => applyPattern(pattern as DesignPattern, 'code', {})).toThrow(/Unknown pattern/);
      });
    });
  });
});
