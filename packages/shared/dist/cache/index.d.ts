/**
 * Caching system for MCP tools
 * Improves performance by caching expensive operations
 */
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
export declare class MemoryCache<T = any> implements ICache<T> {
    private cache;
    private hits;
    private misses;
    constructor(options?: {
        max?: number;
        ttl?: number;
    });
    /**
     * Get value from cache
     */
    get(key: string): T | undefined;
    /**
     * Set value in cache
     */
    set(key: string, value: T, ttl?: number): void;
    /**
     * Check if key exists in cache
     */
    has(key: string): boolean;
    /**
     * Delete value from cache
     */
    delete(key: string): boolean;
    /**
     * Clear all cache
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
    /**
     * Get cache statistics
     */
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
        maxSize: number;
    };
    /**
     * Get all keys
     */
    keys(): string[];
    /**
     * Get all entries
     */
    entries(): Array<[string, T]>;
}
/**
 * File content cache with hash-based keys
 */
export declare class FileCache {
    private cache;
    constructor(maxSize?: number);
    /**
     * Get cached file content
     */
    get(filePath: string, currentHash: string): string | undefined;
    /**
     * Cache file content
     */
    set(filePath: string, content: string): void;
    /**
     * Check if file is cached with matching hash
     */
    has(filePath: string, currentHash: string): boolean;
    /**
     * Invalidate cache for file
     */
    invalidate(filePath: string): boolean;
    /**
     * Clear all file cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
        maxSize: number;
    };
}
/**
 * Analysis result cache
 */
export declare class AnalysisCache {
    private cache;
    constructor(maxSize?: number, ttl?: number);
    /**
     * Generate cache key for analysis
     */
    private generateKey;
    /**
     * Get cached analysis result
     */
    get(filePath: string, analysisType: string, fileHash: string, config?: Record<string, unknown>): unknown | undefined;
    /**
     * Cache analysis result
     */
    set(filePath: string, analysisType: string, fileHash: string, result: unknown, config?: Record<string, unknown>): void;
    /**
     * Check if analysis is cached
     */
    has(filePath: string, analysisType: string, fileHash: string, config?: Record<string, unknown>): boolean;
    /**
     * Invalidate cache for file
     */
    invalidate(filePath: string): void;
    /**
     * Clear all analysis cache
     */
    clear(): void;
    /**
     * Get cache statistics
     */
    getStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        size: number;
        maxSize: number;
    };
}
/**
 * Global cache manager
 */
export declare class CacheManager {
    private caches;
    /**
     * Register a cache
     */
    register<T>(name: string, cache: ICache<T>): void;
    /**
     * Get a cache by name
     */
    get<T>(name: string): ICache<T> | undefined;
    /**
     * Clear all caches
     */
    clearAll(): void;
    /**
     * Get statistics for all caches
     */
    getAllStats(): Record<string, any>;
    /**
     * Remove a cache
     */
    remove(name: string): boolean;
}
/**
 * Decorator for caching function results
 */
export declare function cached(options?: {
    ttl?: number;
    keyGenerator?: (...args: any[]) => string;
}): (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=index.d.ts.map