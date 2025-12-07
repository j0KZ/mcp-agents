/**
 * Tests for benchmark.ts - Performance benchmarking utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  benchmark,
  compareBenchmarks,
  formatBenchmarkResult,
  benchmarkSuite,
  BenchmarkResult,
} from '../src/performance/benchmark.js';

describe('benchmark', () => {
  it('should run benchmark with default options', async () => {
    let count = 0;
    const result = await benchmark(
      () => {
        count++;
      },
      { iterations: 10, warmup: 2 }
    );

    expect(result.name).toBe('Benchmark');
    expect(result.iterations).toBe(10);
    expect(result.totalTime).toBeGreaterThanOrEqual(0);
    expect(result.averageTime).toBeGreaterThanOrEqual(0);
    expect(result.minTime).toBeGreaterThanOrEqual(0);
    expect(result.maxTime).toBeGreaterThanOrEqual(result.minTime);
    expect(result.opsPerSecond).toBeGreaterThan(0);
    expect(count).toBe(12); // 10 iterations + 2 warmup
  });

  it('should use custom name', async () => {
    const result = await benchmark(() => {}, { iterations: 5, warmup: 1, name: 'CustomTest' });
    expect(result.name).toBe('CustomTest');
  });

  it('should handle async functions', async () => {
    const result = await benchmark(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
      },
      { iterations: 3, warmup: 1 }
    );

    expect(result.iterations).toBe(3);
    expect(result.averageTime).toBeGreaterThanOrEqual(1); // At least 1ms (timer resolution varies)
  });
});

describe('compareBenchmarks', () => {
  const baseline: BenchmarkResult = {
    name: 'Baseline',
    iterations: 100,
    totalTime: 1000,
    averageTime: 10, // 10ms per op
    minTime: 8,
    maxTime: 12,
    opsPerSecond: 100,
  };

  it('should detect major improvement (2x+)', () => {
    const optimized: BenchmarkResult = {
      ...baseline,
      name: 'Optimized',
      averageTime: 4, // 4ms = 2.5x faster
    };

    const comparison = compareBenchmarks(baseline, optimized);
    expect(comparison.speedup).toBe(2.5);
    expect(comparison.percentFaster).toBe(150);
    expect(comparison.verdict).toContain('Major improvement');
  });

  it('should detect significant improvement (1.5x-2x)', () => {
    const optimized: BenchmarkResult = {
      ...baseline,
      name: 'Optimized',
      averageTime: 6, // ~1.67x faster
    };

    const comparison = compareBenchmarks(baseline, optimized);
    expect(comparison.speedup).toBeCloseTo(1.67, 1);
    expect(comparison.verdict).toContain('Significant improvement');
  });

  it('should detect noticeable improvement (1.1x-1.5x)', () => {
    const optimized: BenchmarkResult = {
      ...baseline,
      name: 'Optimized',
      averageTime: 8, // 1.25x faster
    };

    const comparison = compareBenchmarks(baseline, optimized);
    expect(comparison.speedup).toBe(1.25);
    expect(comparison.verdict).toContain('Noticeable improvement');
  });

  it('should detect negligible difference (0.95x-1.1x)', () => {
    const optimized: BenchmarkResult = {
      ...baseline,
      name: 'Optimized',
      averageTime: 9.5, // ~1.05x
    };

    const comparison = compareBenchmarks(baseline, optimized);
    expect(comparison.verdict).toContain('Negligible');
  });

  it('should detect performance regression (<0.95x)', () => {
    const slower: BenchmarkResult = {
      ...baseline,
      name: 'Slower',
      averageTime: 12, // 0.83x (slower)
    };

    const comparison = compareBenchmarks(baseline, slower);
    expect(comparison.speedup).toBeCloseTo(0.83, 1);
    expect(comparison.verdict).toContain('regression');
  });

  it('should calculate time saved', () => {
    const optimized: BenchmarkResult = {
      ...baseline,
      name: 'Optimized',
      averageTime: 5,
    };

    const comparison = compareBenchmarks(baseline, optimized);
    expect(comparison.timeSaved).toBe(5); // 10ms - 5ms
  });
});

describe('formatBenchmarkResult', () => {
  it('should format benchmark result as string', () => {
    const result: BenchmarkResult = {
      name: 'TestBenchmark',
      iterations: 1000,
      totalTime: 500.5,
      averageTime: 0.5005,
      minTime: 0.3,
      maxTime: 0.8,
      opsPerSecond: 1998,
    };

    const formatted = formatBenchmarkResult(result);

    expect(formatted).toContain('TestBenchmark');
    expect(formatted).toContain('1000');
    expect(formatted).toContain('500.50ms');
    expect(formatted).toContain('0.500ms'); // averageTime formatted (3 decimal places)
    expect(formatted).toContain('0.300ms'); // minTime formatted
    expect(formatted).toContain('0.800ms'); // maxTime formatted
    expect(formatted).toContain('1998'); // opsPerSecond
  });
});

describe('benchmarkSuite', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should run multiple benchmarks', async () => {
    let bench1Count = 0;
    let bench2Count = 0;

    const results = await benchmarkSuite([
      {
        name: 'Benchmark 1',
        fn: () => {
          bench1Count++;
        },
        options: { iterations: 5, warmup: 1 },
      },
      {
        name: 'Benchmark 2',
        fn: () => {
          bench2Count++;
        },
        options: { iterations: 3, warmup: 1 },
      },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Benchmark 1');
    expect(results[0].iterations).toBe(5);
    expect(results[1].name).toBe('Benchmark 2');
    expect(results[1].iterations).toBe(3);
    expect(bench1Count).toBe(6); // 5 + 1 warmup
    expect(bench2Count).toBe(4); // 3 + 1 warmup
  });

  it('should log benchmark suite progress', async () => {
    await benchmarkSuite([{ name: 'Test', fn: () => {}, options: { iterations: 2, warmup: 0 } }]);

    expect(consoleSpy).toHaveBeenCalledWith('Running benchmark suite...\n');
  });
});
