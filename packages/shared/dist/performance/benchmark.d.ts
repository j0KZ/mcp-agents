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
export declare function benchmark(fn: () => void | Promise<void>, options?: BenchmarkOptions): Promise<BenchmarkResult>;
/**
 * Compare two benchmark results
 */
export declare function compareBenchmarks(baseline: BenchmarkResult, optimized: BenchmarkResult): {
    speedup: number;
    percentFaster: number;
    timeSaved: number;
    verdict: string;
};
/**
 * Format benchmark result for display
 */
export declare function formatBenchmarkResult(result: BenchmarkResult): string;
/**
 * Run multiple benchmarks and compare
 */
export declare function benchmarkSuite(benchmarks: Array<{
    name: string;
    fn: () => void | Promise<void>;
    options?: BenchmarkOptions;
}>): Promise<BenchmarkResult[]>;
//# sourceMappingURL=benchmark.d.ts.map