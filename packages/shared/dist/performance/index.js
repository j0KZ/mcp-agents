/**
 * Performance optimization utilities for MCP tools
 */
/**
 * Performance monitor for tracking execution metrics
 */
export class PerformanceMonitor {
    startTime = 0;
    startMemory = 0;
    metrics = new Map();
    /**
     * Start monitoring performance
     */
    start() {
        this.startTime = Date.now();
        this.startMemory = process.memoryUsage().heapUsed;
    }
    /**
     * Stop monitoring and return metrics
     */
    stop() {
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        return {
            startTime: this.startTime,
            endTime,
            duration: endTime - this.startTime,
            memoryUsed: endMemory - this.startMemory,
        };
    }
    /**
     * Mark a performance checkpoint
     */
    mark(name) {
        const now = Date.now();
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push(now - this.startTime);
    }
    /**
     * Get metrics for a specific checkpoint
     */
    getMetrics(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0)
            return null;
        return {
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
        };
    }
    /**
     * Get all metrics
     */
    getAllMetrics() {
        const result = {};
        for (const [name, _values] of this.metrics) {
            result[name] = this.getMetrics(name);
        }
        return result;
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.clear();
        this.start();
    }
}
/**
 * Measure execution time of a function
 */
export async function measure(fn, label) {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    // Performance tracking - consumers can log if needed
    // if (label) {
    //   console.log(`[Performance] ${label}: ${duration}ms`);
    // }
    return { result, duration };
}
/**
 * Batch process items with concurrency limit
 */
export async function batchProcess(items, processor, options = {}) {
    const { concurrency = 5, onProgress } = options;
    const results = [];
    let completed = 0;
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(processor));
        results.push(...batchResults);
        completed += batch.length;
        if (onProgress) {
            onProgress(completed, items.length);
        }
    }
    return results;
}
/**
 * Throttle function execution
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Memoize function results
 */
export function memoize(fn, keyGenerator) {
    const cache = new Map();
    return ((...args) => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * Process items in parallel with worker pool
 */
export async function parallelProcess(items, processor, maxConcurrency = 10) {
    const results = new Array(items.length);
    const executing = [];
    for (let i = 0; i < items.length; i++) {
        const promise = processor(items[i], i).then(result => {
            results[i] = result;
        });
        executing.push(promise);
        if (executing.length >= maxConcurrency) {
            await Promise.race(executing);
            executing.splice(executing.findIndex(p => p === promise), 1);
        }
    }
    await Promise.all(executing);
    return results;
}
/**
 * Lazy load resource
 */
export function lazyLoad(loader) {
    let cached = null;
    let loading = null;
    return async () => {
        if (cached)
            return cached;
        if (loading)
            return loading;
        loading = loader();
        cached = await loading;
        loading = null;
        return cached;
    };
}
/**
 * Resource pool for reusing expensive objects
 */
export class ResourcePool {
    available = [];
    inUse = new Set();
    factory;
    maxSize;
    constructor(factory, maxSize = 10) {
        this.factory = factory;
        this.maxSize = maxSize;
    }
    /**
     * Acquire resource from pool
     */
    acquire() {
        let resource;
        if (this.available.length > 0) {
            resource = this.available.pop();
        }
        else if (this.inUse.size < this.maxSize) {
            resource = this.factory();
        }
        else {
            throw new Error('Resource pool exhausted');
        }
        this.inUse.add(resource);
        return resource;
    }
    /**
     * Release resource back to pool
     */
    release(resource) {
        if (this.inUse.has(resource)) {
            this.inUse.delete(resource);
            this.available.push(resource);
        }
    }
    /**
     * Get pool statistics
     */
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size,
        };
    }
}
//# sourceMappingURL=index.js.map