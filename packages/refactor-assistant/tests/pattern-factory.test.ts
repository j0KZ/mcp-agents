/**
 * Tests for pattern-factory
 */

import { describe, it, expect } from 'vitest';
import {
  applyPattern,
  isValidPattern,
  getSupportedPatterns,
} from '../src/patterns/pattern-factory.js';

describe('applyPattern', () => {
  it('should apply singleton pattern', () => {
    const code = 'class Service {}';
    const result = applyPattern('singleton', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply factory pattern', () => {
    const code = 'class Product {}';
    const result = applyPattern('factory', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply observer pattern', () => {
    const code = 'class Subject {}';
    const result = applyPattern('observer', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply strategy pattern', () => {
    const code = 'class Algorithm {}';
    const result = applyPattern('strategy', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply decorator pattern', () => {
    const code = 'class Component {}';
    const result = applyPattern('decorator', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply adapter pattern', () => {
    const code = 'class Adaptee {}';
    const result = applyPattern('adapter', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply facade pattern', () => {
    const code = 'class SubsystemA {}\nclass SubsystemB {}';
    const result = applyPattern('facade', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply proxy pattern', () => {
    const code = 'class RealSubject {}';
    const result = applyPattern('proxy', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply command pattern', () => {
    const code = 'class Receiver {}';
    const result = applyPattern('command', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should apply chain-of-responsibility pattern', () => {
    const code = 'class Handler {}';
    const result = applyPattern('chain-of-responsibility', code, {});

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  it('should throw error for unknown pattern', () => {
    const code = 'class Test {}';

    expect(() => applyPattern('unknown-pattern' as any, code, {})).toThrow(
      'Unknown pattern: unknown-pattern'
    );
  });

  it('should pass options to pattern applier', () => {
    const code = 'class Test {}';
    const options = { className: 'CustomName' };

    const result = applyPattern('singleton', code, options);

    expect(result).toBeDefined();
  });
});

describe('isValidPattern', () => {
  it('should return true for valid patterns', () => {
    expect(isValidPattern('singleton')).toBe(true);
    expect(isValidPattern('factory')).toBe(true);
    expect(isValidPattern('observer')).toBe(true);
    expect(isValidPattern('strategy')).toBe(true);
    expect(isValidPattern('decorator')).toBe(true);
    expect(isValidPattern('adapter')).toBe(true);
    expect(isValidPattern('facade')).toBe(true);
    expect(isValidPattern('proxy')).toBe(true);
    expect(isValidPattern('command')).toBe(true);
    expect(isValidPattern('chain-of-responsibility')).toBe(true);
  });

  it('should return false for invalid patterns', () => {
    expect(isValidPattern('unknown')).toBe(false);
    expect(isValidPattern('invalid')).toBe(false);
    expect(isValidPattern('')).toBe(false);
    expect(isValidPattern('SINGLETON')).toBe(false); // case sensitive
  });
});

describe('getSupportedPatterns', () => {
  it('should return array of supported patterns', () => {
    const patterns = getSupportedPatterns();

    expect(Array.isArray(patterns)).toBe(true);
    expect(patterns.length).toBe(10);
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

  it('should return new array each time', () => {
    const patterns1 = getSupportedPatterns();
    const patterns2 = getSupportedPatterns();

    expect(patterns1).not.toBe(patterns2);
    expect(patterns1).toEqual(patterns2);
  });
});
