import { describe, it, expect } from 'vitest';
import { benchmark, compareBenchmarks, benchmarkSuite } from './benchmark.js';

describe('Performance Benchmark', () => {
  describe('benchmark()', () => {
    it('should run basic benchmark', async () => {
      const result = await benchmark(
        () => {
          // Simple operation
          Math.sqrt(16);
        },
        { iterations: 10, warmup: 2 }
      );

      expect(result).toMatchObject({
        name: 'Benchmark',
        iterations: 10,
      });
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.averageTime).toBeGreaterThan(0);
      expect(result.opsPerSecond).toBeGreaterThan(0);
    });

    it('should support custom names', async () => {
      const result = await benchmark(() => {}, {
        name: 'Custom Test',
        iterations: 5,
      });

      expect(result.name).toBe('Custom Test');
    });

    it('should calculate min/max times correctly', async () => {
      const result = await benchmark(
        () => {
          const delay = Math.random() * 2;
          for (let i = 0; i < delay * 1000; i++) {
            // Variable workload
          }
        },
        { iterations: 10 }
      );

      expect(result.minTime).toBeLessThanOrEqual(result.averageTime);
      expect(result.maxTime).toBeGreaterThanOrEqual(result.averageTime);
    });

    it('should handle async functions', async () => {
      const result = await benchmark(
        async () => {
          await Promise.resolve();
        },
        { iterations: 5 }
      );

      expect(result.iterations).toBe(5);
      expect(result.totalTime).toBeGreaterThan(0);
    });

    it('should calculate ops/second correctly', async () => {
      const result = await benchmark(() => {}, { iterations: 100 });

      // ops/second should be 1000 / averageTime
      const expectedOps = 1000 / result.averageTime;
      expect(result.opsPerSecond).toBeCloseTo(expectedOps, 1);
    });

    it('should handle zero iterations edge case', async () => {
      const result = await benchmark(() => {}, { iterations: 0, warmup: 0 });

      expect(result.iterations).toBe(0);
      expect(result.totalTime).toBe(0);
    });
  });

  describe('compareBenchmarks()', () => {
    it('should compare two benchmark results', async () => {
      const result1 = await benchmark(
        () => {
          // eslint-disable-next-line no-empty
          for (let i = 0; i < 100; i++) {}
        },
        { iterations: 10, name: 'Fast' }
      );

      const result2 = await benchmark(
        () => {
          // eslint-disable-next-line no-empty
          for (let i = 0; i < 1000; i++) {}
        },
        { iterations: 10, name: 'Slow' }
      );

      const comparison = compareBenchmarks(result1, result2);

      expect(comparison).toHaveProperty('speedup');
      expect(comparison).toHaveProperty('percentFaster');
      expect(comparison).toHaveProperty('timeSaved');
      expect(comparison).toHaveProperty('verdict');
    });
  });

  describe('benchmarkSuite()', () => {
    it('should run multiple benchmarks', async () => {
      const results = await benchmarkSuite([
        {
          name: 'Test 1',
          fn: () => Math.sqrt(4),
          options: { iterations: 5 },
        },
        {
          name: 'Test 2',
          fn: () => Math.pow(2, 10),
          options: { iterations: 5 },
        },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Test 1');
      expect(results[1].name).toBe('Test 2');
    });
  });
});
