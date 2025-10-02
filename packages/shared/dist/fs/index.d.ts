/**
 * Optimized file system operations for MCP tools
 * Provides caching, batching, and parallel operations
 */
import { FileInfo } from '../types/index.js';
import type { Stats } from 'node:fs';
/**
 * File system manager with caching and optimizations
 */
export declare class FileSystemManager {
    private fileCache;
    private statsCache;
    private statsCacheTTL;
    constructor(cacheSize?: number);
    /**
     * Read file with caching
     */
    readFile(filePath: string, useCache?: boolean): Promise<string>;
    /**
     * Read multiple files in parallel
     */
    readFiles(filePaths: string[], options?: {
        useCache?: boolean;
        concurrency?: number;
    }): Promise<Map<string, string>>;
    /**
     * Get file statistics with caching
     */
    getStats(filePath: string, useCache?: boolean): Promise<Stats>;
    /**
     * Get file information
     */
    getFileInfo(filePath: string): Promise<FileInfo>;
    /**
     * Find files matching patterns
     */
    findFiles(patterns: string | string[], options?: {
        cwd?: string;
        ignore?: string[];
        absolute?: boolean;
        onlyFiles?: boolean;
    }): Promise<string[]>;
    /**
     * Watch files for changes
     */
    watchFiles(patterns: string | string[], options?: {
        cwd?: string;
        ignore?: string[];
    }): AsyncGenerator<{
        event: string;
        path: string;
    }>;
    /**
     * Get file hash
     */
    private getFileHash;
    /**
     * Check if file exists
     */
    exists(filePath: string): Promise<boolean>;
    /**
     * Ensure directory exists
     */
    ensureDir(dirPath: string): Promise<void>;
    /**
     * Write file safely
     */
    writeFile(filePath: string, content: string, baseDir?: string): Promise<void>;
    /**
     * Copy file
     */
    copyFile(src: string, dest: string): Promise<void>;
    /**
     * Delete file
     */
    deleteFile(filePath: string): Promise<void>;
    /**
     * Get directory contents
     */
    readDir(dirPath: string, recursive?: boolean): Promise<string[]>;
    /**
     * Clear all caches
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        fileCache: {
            hits: number;
            misses: number;
            hitRate: number;
            size: number;
            maxSize: number;
        };
        statsCache: {
            size: number;
        };
    };
}
/**
 * File watcher with debouncing
 */
export declare class FileWatcher {
    private watchers;
    private listeners;
    private debounceTimers;
    private debounceDelay;
    constructor(debounceDelay?: number);
    /**
     * Watch a file or directory
     */
    watch(filePath: string, callback: (event: string, filename: string) => void, options?: {
        recursive?: boolean;
    }): () => void;
    /**
     * Handle file system event with debouncing
     */
    private handleEvent;
    /**
     * Stop watching a file
     */
    unwatch(filePath: string, callback?: (event: string, filename: string) => void): void;
    /**
     * Close watcher for file
     */
    private closeWatcher;
    /**
     * Stop watching all files
     */
    unwatchAll(): void;
    /**
     * Get watched files
     */
    getWatchedFiles(): string[];
}
/**
 * Batch file operations
 */
export declare class BatchFileOperations {
    private fsManager;
    constructor(fsManager?: FileSystemManager);
    /**
     * Read multiple files in parallel
     */
    readMultiple(filePaths: string[], options?: {
        concurrency?: number;
    }): Promise<Map<string, string>>;
    /**
     * Write multiple files in parallel
     */
    writeMultiple(files: Array<{
        path: string;
        content: string;
    }>, options?: {
        concurrency?: number;
    }): Promise<void>;
    /**
     * Copy multiple files in parallel
     */
    copyMultiple(operations: Array<{
        src: string;
        dest: string;
    }>, options?: {
        concurrency?: number;
    }): Promise<void>;
    /**
     * Delete multiple files in parallel
     */
    deleteMultiple(filePaths: string[], options?: {
        concurrency?: number;
    }): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map