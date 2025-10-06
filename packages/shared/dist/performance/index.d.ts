/**
 * Performance optimization utilities for MCP tools
 */
import { PerformanceMetrics } from '../types/index.js';
/**
 * Performance monitor for tracking execution metrics
 */
export declare class PerformanceMonitor {
    private startTime;
    private startMemory;
    private metrics;
    /**
     * Start monitoring performance
     */
    start(): void;
    /**
     * Stop monitoring and return metrics
     */
    stop(): PerformanceMetrics;
    /**
     * Mark a performance checkpoint
     */
    mark(name: string): void;
    /**
     * Get metrics for a specific checkpoint
     */
    getMetrics(name: string): {
        avg: number;
        min: number;
        max: number;
        count: number;
    } | null;
    /**
     * Get all metrics
     */
    getAllMetrics(): Record<string, any>;
    /**
     * Reset all metrics
     */
    reset(): void;
}
/**
 * Measure execution time of a function
 */
export declare function measure<T>(fn: () => Promise<T>, label?: string): Promise<{
    result: T;
    duration: number;
}>;
/**
 * Batch process items with concurrency limit
 */
export declare function batchProcess<T, R>(items: T[], processor: (item: T) => Promise<R>, options?: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
}): Promise<R[]>;
/**
 * Throttle function execution
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Memoize function results
 */
export declare function memoize<T extends (...args: any[]) => any>(fn: T, keyGenerator?: (...args: Parameters<T>) => string): T;
/**
 * Process items in parallel with worker pool
 */
export declare function parallelProcess<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, maxConcurrency?: number): Promise<R[]>;
/**
 * Lazy load resource
 */
export declare function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T>;
/**
 * Resource pool for reusing expensive objects
 */
export declare class ResourcePool<T> {
    private available;
    private inUse;
    private factory;
    private maxSize;
    constructor(factory: () => T, maxSize?: number);
    /**
     * Acquire resource from pool
     */
    acquire(): T;
    /**
     * Release resource back to pool
     */
    release(resource: T): void;
    /**
     * Get pool statistics
     */
    getStats(): {
        available: number;
        inUse: number;
        total: number;
    };
}
export { benchmark, benchmarkSuite, compareBenchmarks, formatBenchmarkResult, type BenchmarkResult, type BenchmarkOptions, } from './benchmark.js';
//# sourceMappingURL=index.d.ts.map