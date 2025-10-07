/**
 * Caching system for MCP tools
 * Improves performance by caching expensive operations
 */

import { LRUCache } from 'lru-cache';
import { CacheEntry } from '../types/index.js';
import { generateHash } from '../utils/index.js';
import crypto from 'crypto';

// Cache configuration constants
const DEFAULT_MAX_CACHE_SIZE = 1000;
const DEFAULT_TTL_MS = 3600000; // 1 hour
const DEFAULT_FILE_CACHE_SIZE = 500;
const DEFAULT_ANALYSIS_CACHE_SIZE = 200;
const DEFAULT_ANALYSIS_TTL_MS = 1800000; // 30 minutes
const PERCENTAGE_MULTIPLIER = 100;

/**
 * Generic cache interface
 */
export interface ICache<T = any> {
  get(key: string): T | undefined;
  set(key: string, value: T, ttl?: number): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
}

/**
 * Memory cache with LRU eviction
 */
export class MemoryCache<T = any> implements ICache<T> {
  private cache: LRUCache<string, CacheEntry<T>>;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: { max?: number; ttl?: number } = {}) {
    const maxSize = options.max ?? DEFAULT_MAX_CACHE_SIZE;
    const ttl = options.ttl ?? DEFAULT_TTL_MS;

    this.cache = new LRUCache<string, CacheEntry<T>>({
      max: maxSize,
      ttl: ttl,
      updateAgeOnGet: true,
    });
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (entry) {
      this.hits++;
      entry.hits++;
      return entry.value;
    }

    this.misses++;
    return undefined;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || DEFAULT_TTL_MS,
      hits: 0,
    };

    this.cache.set(key, entry, { ttl: entry.ttl });
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    maxSize: number;
  } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? (this.hits / total) * PERCENTAGE_MULTIPLIER : 0,
      size: this.cache.size,
      maxSize: this.cache.max,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get all entries
   */
  entries(): Array<[string, T]> {
    return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
  }
}

/**
 * File content cache with hash-based keys
 */
export class FileCache {
  private cache: MemoryCache<{ content: string; hash: string }>;

  constructor(maxSize: number = DEFAULT_FILE_CACHE_SIZE) {
    this.cache = new MemoryCache({ max: maxSize });
  }

  /**
   * Get cached file content
   */
  get(filePath: string, currentHash: string): string | undefined {
    const cached = this.cache.get(filePath);

    if (cached && cached.hash === currentHash) {
      return cached.content;
    }

    // Hash mismatch or not cached
    if (cached) {
      this.cache.delete(filePath);
    }

    return undefined;
  }

  /**
   * Cache file content
   */
  set(filePath: string, content: string): void {
    const hash = generateHash(content);
    this.cache.set(filePath, { content, hash });
  }

  /**
   * Check if file is cached with matching hash
   */
  has(filePath: string, currentHash: string): boolean {
    const cached = this.cache.get(filePath);
    return !!cached && cached.hash === currentHash;
  }

  /**
   * Invalidate cache for file
   */
  invalidate(filePath: string): boolean {
    return this.cache.delete(filePath);
  }

  /**
   * Clear all file cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

/**
 * Analysis result cache
 */
export class AnalysisCache {
  private cache: MemoryCache<any>;

  constructor(
    maxSize: number = DEFAULT_ANALYSIS_CACHE_SIZE,
    ttl: number = DEFAULT_ANALYSIS_TTL_MS
  ) {
    this.cache = new MemoryCache({ max: maxSize, ttl });
  }

  /**
   * Generate cache key for analysis
   */
  private generateKey(
    filePath: string,
    analysisType: string,
    fileHash: string,
    config?: any
  ): string {
    const configHash = config ? generateHash(JSON.stringify(config)) : '';
    return `${analysisType}:${filePath}:${fileHash}:${configHash}`;
  }

  /**
   * Get cached analysis result
   */
  get(filePath: string, analysisType: string, fileHash: string, config?: any): any | undefined {
    const key = this.generateKey(filePath, analysisType, fileHash, config);
    return this.cache.get(key);
  }

  /**
   * Cache analysis result
   */
  set(filePath: string, analysisType: string, fileHash: string, result: any, config?: any): void {
    const key = this.generateKey(filePath, analysisType, fileHash, config);
    this.cache.set(key, result);
  }

  /**
   * Check if analysis is cached
   */
  has(filePath: string, analysisType: string, fileHash: string, config?: any): boolean {
    const key = this.generateKey(filePath, analysisType, fileHash, config);
    return this.cache.has(key);
  }

  /**
   * Invalidate cache for file
   */
  invalidate(filePath: string): void {
    // Remove all entries for this file
    for (const key of this.cache.keys()) {
      if (key.includes(filePath)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all analysis cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats();
  }
}

/**
 * Global cache manager
 */
export class CacheManager {
  private caches: Map<string, ICache> = new Map();

  /**
   * Register a cache
   */
  register<T>(name: string, cache: ICache<T>): void {
    this.caches.set(name, cache);
  }

  /**
   * Get a cache by name
   */
  get<T>(name: string): ICache<T> | undefined {
    return this.caches.get(name) as ICache<T> | undefined;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  /**
   * Get statistics for all caches
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [name, cache] of this.caches.entries()) {
      stats[name] = {
        size: cache.size(),
        ...(cache instanceof MemoryCache ? cache.getStats() : {}),
      };
    }

    return stats;
  }

  /**
   * Remove a cache
   */
  remove(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return this.caches.delete(name);
    }
    return false;
  }
}

/**
 * Decorator for caching function results
 */
export function cached(options: { ttl?: number; keyGenerator?: (...args: any[]) => string } = {}) {
  const cache = new MemoryCache({ ttl: options.ttl });

  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let key: string;
      if (options.keyGenerator) {
        key = options.keyGenerator(...args);
      } else {
        key = crypto.createHash('sha256').update(JSON.stringify(args)).digest('hex');
      }

      const cached = cache.get(key);
      if (cached !== undefined) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(key, result);

      return result;
    };

    return descriptor;
  };
}
