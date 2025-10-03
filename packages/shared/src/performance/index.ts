/**
 * Performance optimization utilities for MCP tools
 */

import { PerformanceMetrics } from '../types/index.js';

/**
 * Performance monitor for tracking execution metrics
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private startMemory: number = 0;
  private metrics: Map<string, number[]> = new Map();

  /**
   * Start monitoring performance
   */
  start(): void {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage().heapUsed;
  }

  /**
   * Stop monitoring and return metrics
   */
  stop(): PerformanceMetrics {
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
  mark(name: string): void {
    const now = Date.now();
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(now - this.startTime);
  }

  /**
   * Get metrics for a specific checkpoint
   */
  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

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
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name, _values] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics.clear();
    this.start();
  }
}

/**
 * Measure execution time of a function
 */
export async function measure<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  if (label) {
    console.log(`[Performance] ${label}: ${duration}ms`);
  }

  return { result, duration };
}

/**
 * Batch process items with concurrency limit
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 5, onProgress } = options;
  const results: R[] = [];
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
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
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
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Process items in parallel with worker pool
 */
export async function parallelProcess<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  maxConcurrency: number = 10
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  const executing: Promise<void>[] = [];

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
export function lazyLoad<T>(loader: () => Promise<T>): () => Promise<T> {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async () => {
    if (cached) return cached;
    if (loading) return loading;

    loading = loader();
    cached = await loading;
    loading = null;

    return cached;
  };
}

/**
 * Resource pool for reusing expensive objects
 */
export class ResourcePool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private maxSize: number;

  constructor(factory: () => T, maxSize: number = 10) {
    this.factory = factory;
    this.maxSize = maxSize;
  }

  /**
   * Acquire resource from pool
   */
  acquire(): T {
    let resource: T;

    if (this.available.length > 0) {
      resource = this.available.pop()!;
    } else if (this.inUse.size < this.maxSize) {
      resource = this.factory();
    } else {
      throw new Error('Resource pool exhausted');
    }

    this.inUse.add(resource);
    return resource;
  }

  /**
   * Release resource back to pool
   */
  release(resource: T): void {
    if (this.inUse.has(resource)) {
      this.inUse.delete(resource);
      this.available.push(resource);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}
