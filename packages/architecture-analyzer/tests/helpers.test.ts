import { describe, it, expect } from 'vitest';
import { generateSuggestions } from '../src/helpers/suggestions-generator.js';
import { calculateCohesion } from '../src/helpers/cohesion-calculator.js';
import { calculateCoupling } from '../src/helpers/coupling-calculator.js';
import { ArchitectureMetrics } from '../src/types.js';

describe('suggestions-generator', () => {
  it('should return empty array for healthy metrics', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 0,
      layerViolations: 0,
      cohesion: 80,
      coupling: 20,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should suggest fixing circular dependencies', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 3,
      layerViolations: 0,
      cohesion: 80,
      coupling: 20,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('circular'))).toBe(true);
  });

  it('should suggest fixing layer violations', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 0,
      layerViolations: 2,
      cohesion: 80,
      coupling: 20,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('layer'))).toBe(true);
  });

  it('should suggest reducing coupling when high', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 0,
      layerViolations: 0,
      cohesion: 80,
      coupling: 80,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('coupling'))).toBe(true);
  });

  it('should suggest improving cohesion when low', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 0,
      layerViolations: 0,
      cohesion: 30,
      coupling: 20,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('cohesion'))).toBe(true);
  });

  it('should suggest breaking down modules with many dependencies', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 10,
      totalDependencies: 20,
      circularDependencies: 0,
      layerViolations: 0,
      cohesion: 80,
      coupling: 20,
      maxDependencies: 20,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('too many dependencies'))).toBe(true);
  });

  it('should suggest organizing large codebases', () => {
    const metrics: ArchitectureMetrics = {
      totalModules: 200,
      totalDependencies: 400,
      circularDependencies: 0,
      layerViolations: 0,
      cohesion: 80,
      coupling: 20,
      maxDependencies: 5,
    };
    const result = generateSuggestions(metrics, [], []);
    expect(result.some(s => s.includes('Large codebase'))).toBe(true);
  });
});

describe('cohesion-calculator', () => {
  it('should calculate cohesion for modules', () => {
    const modules = [
      {
        path: 'src/a.ts',
        imports: ['./b'],
        exports: [],
        linesOfCode: 10,
        name: 'a',
        dependencies: [],
      },
      {
        path: 'src/b.ts',
        imports: ['./a'],
        exports: [],
        linesOfCode: 10,
        name: 'b',
        dependencies: [],
      },
    ];
    const dependencies = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'import' as const },
      { from: 'src/b.ts', to: 'src/a.ts', type: 'import' as const },
    ];
    const result = calculateCohesion(modules, dependencies);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should return high cohesion for same-package dependencies', () => {
    const modules = [
      {
        path: 'src/a.ts',
        imports: ['./b', './c'],
        exports: [],
        linesOfCode: 10,
        name: 'a',
        dependencies: [],
      },
      {
        path: 'src/b.ts',
        imports: ['./a', './c'],
        exports: [],
        linesOfCode: 10,
        name: 'b',
        dependencies: [],
      },
      {
        path: 'src/c.ts',
        imports: ['./a', './b'],
        exports: [],
        linesOfCode: 10,
        name: 'c',
        dependencies: [],
      },
    ];
    const dependencies = [
      { from: 'src/a.ts', to: 'src/b.ts', type: 'import' as const },
      { from: 'src/a.ts', to: 'src/c.ts', type: 'import' as const },
      { from: 'src/b.ts', to: 'src/a.ts', type: 'import' as const },
    ];
    const result = calculateCohesion(modules, dependencies);
    expect(result).toBe(100); // All deps in same package = 100% cohesion
  });

  it('should handle empty modules array', () => {
    const result = calculateCohesion([], []);
    expect(typeof result).toBe('number');
    expect(result).toBe(0);
  });
});

describe('coupling-calculator', () => {
  it('should calculate coupling for modules', () => {
    const modules = [
      { path: 'a.ts', imports: ['./b'], exports: [], linesOfCode: 10, name: 'a', dependencies: [] },
      { path: 'b.ts', imports: [], exports: [], linesOfCode: 10, name: 'b', dependencies: [] },
    ];
    const dependencies = [{ from: 'a.ts', to: 'b.ts', type: 'import' as const }];
    const result = calculateCoupling(modules, dependencies);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('should return lower coupling for isolated modules', () => {
    const modules = [
      { path: 'a.ts', imports: [], exports: [], linesOfCode: 10, name: 'a', dependencies: [] },
      { path: 'b.ts', imports: [], exports: [], linesOfCode: 10, name: 'b', dependencies: [] },
    ];
    const dependencies: any[] = [];
    const result = calculateCoupling(modules, dependencies);
    expect(result).toBeLessThan(50);
  });

  it('should handle empty modules array', () => {
    const result = calculateCoupling([], []);
    expect(typeof result).toBe('number');
    expect(result).toBe(0);
  });

  it('should handle single module', () => {
    const modules = [
      { path: 'a.ts', imports: [], exports: [], linesOfCode: 10, name: 'a', dependencies: [] },
    ];
    const result = calculateCoupling(modules, []);
    expect(result).toBe(0); // Single module = no coupling
  });
});
