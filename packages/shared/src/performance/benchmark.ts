/**
 * Performance benchmarking utilities for MCP packages
 */

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

export interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
  name?: string;
}

/**
 * Run a performance benchmark
 */
export async function benchmark(
  fn: () => void | Promise<void>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const { iterations = 100, warmup = 10, name = 'Benchmark' } = options;

  // Warmup runs
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  const times: number[] = [];
  let totalTime = 0;

  // Actual benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    times.push(duration);
    totalTime += duration;
  }

  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const opsPerSecond = 1000 / averageTime;

  return {
    name,
    iterations,
    totalTime,
    averageTime,
    minTime,
    maxTime,
    opsPerSecond,
  };
}

/**
 * Compare two benchmark results
 */
export function compareBenchmarks(
  baseline: BenchmarkResult,
  optimized: BenchmarkResult
): {
  speedup: number;
  percentFaster: number;
  timeSaved: number;
  verdict: string;
} {
  const speedup = baseline.averageTime / optimized.averageTime;
  const percentFaster = ((speedup - 1) * 100);
  const timeSaved = baseline.averageTime - optimized.averageTime;

  let verdict = '';
  if (speedup >= 2) {
    verdict = '🚀 Major improvement';
  } else if (speedup >= 1.5) {
    verdict = '✨ Significant improvement';
  } else if (speedup >= 1.1) {
    verdict = '✅ Noticeable improvement';
  } else if (speedup >= 0.95) {
    verdict = '≈ Negligible difference';
  } else {
    verdict = '⚠️  Performance regression';
  }

  return {
    speedup,
    percentFaster,
    timeSaved,
    verdict,
  };
}

/**
 * Format benchmark result for display
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  return `
${result.name}
${'='.repeat(60)}
Iterations:     ${result.iterations}
Total time:     ${result.totalTime.toFixed(2)}ms
Average time:   ${result.averageTime.toFixed(3)}ms
Min time:       ${result.minTime.toFixed(3)}ms
Max time:       ${result.maxTime.toFixed(3)}ms
Ops/second:     ${result.opsPerSecond.toFixed(0)}
  `.trim();
}

/**
 * Run multiple benchmarks and compare
 */
export async function benchmarkSuite(
  benchmarks: Array<{
    name: string;
    fn: () => void | Promise<void>;
    options?: BenchmarkOptions;
  }>
): Promise<BenchmarkResult[]> {
  console.log('Running benchmark suite...\n');

  const results: BenchmarkResult[] = [];

  for (const bench of benchmarks) {
    const result = await benchmark(bench.fn, {
      ...bench.options,
      name: bench.name,
    });
    results.push(result);
    console.log(formatBenchmarkResult(result));
    console.log('');
  }

  return results;
}
