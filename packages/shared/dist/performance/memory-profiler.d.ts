/**
 * Memory Profiling Infrastructure
 *
 * Provides tools for tracking memory usage, detecting leaks,
 * and optimizing memory consumption across MCP tools.
 */
import { EventEmitter } from 'events';
export interface MemorySnapshot {
    timestamp: number;
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    arrayBuffers: number;
}
export interface MemoryDelta {
    heapDelta: number;
    rssDelta: number;
    percentChange: number;
    label: string;
    duration: number;
}
export interface MemoryLeakReport {
    suspected: boolean;
    growthRate: number;
    samples: MemorySnapshot[];
    recommendation: string;
}
/**
 * Memory Profiler for tracking memory usage patterns
 */
export declare class MemoryProfiler extends EventEmitter {
    private maxSnapshots;
    private baseline;
    private snapshots;
    private checkpoints;
    private startTime;
    private leakThreshold;
    constructor(maxSnapshots?: number);
    /**
     * Start profiling with optional label
     */
    startProfiling(label?: string): void;
    /**
     * Create a checkpoint for delta calculation
     */
    checkpoint(label: string): MemoryDelta;
    /**
     * End profiling and get final report
     */
    endProfiling(): {
        totalDelta: MemoryDelta;
        checkpoints: Map<string, MemoryDelta>;
        leakReport: MemoryLeakReport;
    };
    /**
     * Detect potential memory leaks based on growth patterns
     */
    detectMemoryLeak(label?: string): MemoryLeakReport;
    /**
     * Force garbage collection if available (requires --expose-gc flag)
     */
    forceGC(): void;
    /**
     * Take a memory snapshot
     */
    private takeSnapshot;
    /**
     * Calculate linear regression for leak detection
     */
    private calculateLinearRegression;
    /**
     * Reset profiler state
     */
    reset(): void;
    /**
     * Get formatted memory string
     */
    static formatBytes(bytes: number): string;
}
/**
 * Global memory profiler instance
 */
export declare const globalProfiler: MemoryProfiler;
/**
 * Decorator for automatic memory profiling
 */
export declare function profileMemory(label?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=memory-profiler.d.ts.map