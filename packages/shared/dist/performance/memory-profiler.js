/**
 * Memory Profiling Infrastructure
 *
 * Provides tools for tracking memory usage, detecting leaks,
 * and optimizing memory consumption across MCP tools.
 */
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
/**
 * Memory Profiler for tracking memory usage patterns
 */
export class MemoryProfiler extends EventEmitter {
    maxSnapshots;
    baseline = null;
    snapshots = new Map();
    checkpoints = new Map();
    startTime = 0;
    // private leakThreshold = 50 * 1024 * 1024; // 50MB growth threshold - unused for now
    constructor(maxSnapshots = 100) {
        super();
        this.maxSnapshots = maxSnapshots;
    }
    /**
     * Start profiling with optional label
     */
    startProfiling(label = 'default') {
        this.startTime = performance.now();
        this.baseline = this.takeSnapshot();
        if (!this.snapshots.has(label)) {
            this.snapshots.set(label, []);
        }
        this.snapshots.get(label).push(this.baseline);
        this.emit('profile:start', { label, baseline: this.baseline });
    }
    /**
     * Create a checkpoint for delta calculation
     */
    checkpoint(label) {
        if (!this.baseline) {
            throw new Error('Profiling not started. Call startProfiling() first.');
        }
        const current = this.takeSnapshot();
        this.checkpoints.set(label, current);
        const delta = {
            heapDelta: current.heapUsed - this.baseline.heapUsed,
            rssDelta: current.rss - this.baseline.rss,
            percentChange: ((current.heapUsed - this.baseline.heapUsed) / this.baseline.heapUsed) * 100,
            label,
            duration: performance.now() - this.startTime,
        };
        this.emit('checkpoint', delta);
        // Store snapshot for leak detection
        const snapshots = this.snapshots.get('default') || [];
        snapshots.push(current);
        // Keep only last N snapshots to avoid memory issues
        if (snapshots.length > this.maxSnapshots) {
            snapshots.shift();
        }
        return delta;
    }
    /**
     * End profiling and get final report
     */
    endProfiling() {
        if (!this.baseline) {
            throw new Error('Profiling not started');
        }
        const final = this.takeSnapshot();
        const duration = performance.now() - this.startTime;
        const totalDelta = {
            heapDelta: final.heapUsed - this.baseline.heapUsed,
            rssDelta: final.rss - this.baseline.rss,
            percentChange: ((final.heapUsed - this.baseline.heapUsed) / this.baseline.heapUsed) * 100,
            label: 'total',
            duration,
        };
        // Calculate deltas for all checkpoints
        const checkpointDeltas = new Map();
        for (const [label, snapshot] of this.checkpoints.entries()) {
            checkpointDeltas.set(label, {
                heapDelta: snapshot.heapUsed - this.baseline.heapUsed,
                rssDelta: snapshot.rss - this.baseline.rss,
                percentChange: ((snapshot.heapUsed - this.baseline.heapUsed) / this.baseline.heapUsed) * 100,
                label,
                duration: snapshot.timestamp - this.baseline.timestamp,
            });
        }
        // Detect potential memory leaks
        const leakReport = this.detectMemoryLeak();
        this.emit('profile:end', {
            totalDelta,
            checkpoints: checkpointDeltas,
            leakReport,
        });
        // Clean up
        this.reset();
        return {
            totalDelta,
            checkpoints: checkpointDeltas,
            leakReport,
        };
    }
    /**
     * Detect potential memory leaks based on growth patterns
     */
    detectMemoryLeak(label = 'default') {
        const snapshots = this.snapshots.get(label) || [];
        if (snapshots.length < 3) {
            return {
                suspected: false,
                growthRate: 0,
                samples: snapshots,
                recommendation: 'Not enough samples for leak detection',
            };
        }
        // Calculate linear regression for heap growth
        const { slope, r2 } = this.calculateLinearRegression(snapshots);
        // Determine if there's a leak based on growth rate and correlation
        const suspected = slope > 1024 && r2 > 0.7; // Growing by >1KB/ms with strong correlation
        let recommendation = 'No memory leak detected';
        if (suspected) {
            if (slope > 10240) {
                recommendation = 'CRITICAL: Rapid memory growth detected. Investigate immediately.';
            }
            else if (slope > 5120) {
                recommendation = 'WARNING: Significant memory growth. Monitor closely.';
            }
            else {
                recommendation = 'NOTICE: Gradual memory growth detected. Consider optimization.';
            }
        }
        return {
            suspected,
            growthRate: slope * 1000, // Convert to bytes/second
            samples: snapshots.slice(-10), // Last 10 samples
            recommendation,
        };
    }
    /**
     * Force garbage collection if available (requires --expose-gc flag)
     */
    forceGC() {
        if (global.gc) {
            global.gc();
            this.emit('gc:forced');
        }
        else {
            this.emit('gc:unavailable', {
                message: 'Garbage collection not available. Run with --expose-gc flag.',
            });
        }
    }
    /**
     * Take a memory snapshot
     */
    takeSnapshot() {
        const mem = process.memoryUsage();
        return {
            timestamp: Date.now(),
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            rss: mem.rss,
            external: mem.external,
            arrayBuffers: mem.arrayBuffers,
        };
    }
    /**
     * Calculate linear regression for leak detection
     */
    calculateLinearRegression(snapshots) {
        const n = snapshots.length;
        if (n < 2)
            return { slope: 0, r2: 0 };
        const x = snapshots.map((_s, i) => i);
        const y = snapshots.map(s => s.heapUsed);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        // Calculate R-squared
        const yMean = sumY / n;
        const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        const ssResidual = y.reduce((sum, yi, i) => {
            const predicted = slope * x[i] + intercept;
            return sum + Math.pow(yi - predicted, 2);
        }, 0);
        const r2 = 1 - ssResidual / ssTotal;
        return { slope, r2 };
    }
    /**
     * Reset profiler state
     */
    reset() {
        this.baseline = null;
        this.snapshots.clear();
        this.checkpoints.clear();
        this.startTime = 0;
    }
    /**
     * Get formatted memory string
     */
    static formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = Math.abs(bytes);
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        const sign = bytes < 0 ? '-' : '';
        return `${sign}${value.toFixed(2)} ${units[unitIndex]}`;
    }
}
/**
 * Global memory profiler instance
 */
export const globalProfiler = new MemoryProfiler();
/**
 * Decorator for automatic memory profiling
 */
export function profileMemory(label) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const profiler = new MemoryProfiler();
            const profileLabel = label || `${target.constructor.name}.${propertyKey}`;
            profiler.startProfiling(profileLabel);
            try {
                const result = await originalMethod.apply(this, args);
                const report = profiler.endProfiling();
                if (report.leakReport.suspected) {
                    console.warn(`[Memory Leak Warning] ${profileLabel}: ${report.leakReport.recommendation}`);
                }
                return result;
            }
            catch (error) {
                profiler.endProfiling();
                throw error;
            }
        };
        return descriptor;
    };
}
//# sourceMappingURL=memory-profiler.js.map