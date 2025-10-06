/**
 * Caching system for MCP tools
 * Improves performance by caching expensive operations
 */
import { LRUCache } from 'lru-cache';
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
 * Memory cache with LRU eviction
 */
export class MemoryCache {
    cache;
    hits = 0;
    misses = 0;
    constructor(options = {}) {
        const maxSize = options.max ?? DEFAULT_MAX_CACHE_SIZE;
        const ttl = options.ttl ?? DEFAULT_TTL_MS;
        this.cache = new LRUCache({
            max: maxSize,
            ttl: ttl,
            updateAgeOnGet: true,
        });
    }
    /**
     * Get value from cache
     */
    get(key) {
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
    set(key, value, ttl) {
        const entry = {
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
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Delete value from cache
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
    /**
     * Get cache statistics
     */
    getStats() {
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
    keys() {
        return Array.from(this.cache.keys());
    }
    /**
     * Get all entries
     */
    entries() {
        return Array.from(this.cache.entries()).map(([key, entry]) => [key, entry.value]);
    }
}
/**
 * File content cache with hash-based keys
 */
export class FileCache {
    cache;
    constructor(maxSize = DEFAULT_FILE_CACHE_SIZE) {
        this.cache = new MemoryCache({ max: maxSize });
    }
    /**
     * Get cached file content
     */
    get(filePath, currentHash) {
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
    set(filePath, content) {
        const hash = generateHash(content);
        this.cache.set(filePath, { content, hash });
    }
    /**
     * Check if file is cached with matching hash
     */
    has(filePath, currentHash) {
        const cached = this.cache.get(filePath);
        return !!cached && cached.hash === currentHash;
    }
    /**
     * Invalidate cache for file
     */
    invalidate(filePath) {
        return this.cache.delete(filePath);
    }
    /**
     * Clear all file cache
     */
    clear() {
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
    cache;
    constructor(maxSize = DEFAULT_ANALYSIS_CACHE_SIZE, ttl = DEFAULT_ANALYSIS_TTL_MS) {
        this.cache = new MemoryCache({ max: maxSize, ttl });
    }
    /**
     * Generate cache key for analysis
     */
    generateKey(filePath, analysisType, fileHash, config) {
        const configHash = config ? generateHash(JSON.stringify(config)) : '';
        return `${analysisType}:${filePath}:${fileHash}:${configHash}`;
    }
    /**
     * Get cached analysis result
     */
    get(filePath, analysisType, fileHash, config) {
        const key = this.generateKey(filePath, analysisType, fileHash, config);
        return this.cache.get(key);
    }
    /**
     * Cache analysis result
     */
    set(filePath, analysisType, fileHash, result, config) {
        const key = this.generateKey(filePath, analysisType, fileHash, config);
        this.cache.set(key, result);
    }
    /**
     * Check if analysis is cached
     */
    has(filePath, analysisType, fileHash, config) {
        const key = this.generateKey(filePath, analysisType, fileHash, config);
        return this.cache.has(key);
    }
    /**
     * Invalidate cache for file
     */
    invalidate(filePath) {
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
    clear() {
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
    caches = new Map();
    /**
     * Register a cache
     */
    register(name, cache) {
        this.caches.set(name, cache);
    }
    /**
     * Get a cache by name
     */
    get(name) {
        return this.caches.get(name);
    }
    /**
     * Clear all caches
     */
    clearAll() {
        for (const cache of this.caches.values()) {
            cache.clear();
        }
    }
    /**
     * Get statistics for all caches
     */
    getAllStats() {
        const stats = {};
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
    remove(name) {
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
export function cached(options = {}) {
    const cache = new MemoryCache({ ttl: options.ttl });
    return function (_target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            let key;
            if (options.keyGenerator) {
                key = options.keyGenerator(...args);
            }
            else {
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
//# sourceMappingURL=index.js.map