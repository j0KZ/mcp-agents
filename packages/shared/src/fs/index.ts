/**
 * Optimized file system operations for MCP tools
 * Provides caching, batching, and parallel operations
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'fast-glob';
import { FileInfo } from '../types/index.js';
import { FileCache } from '../cache/index.js';
import { generateHash, normalizePath, isPathSafe } from '../utils/index.js';
import { batchProcess } from '../performance/index.js';
import type { Stats } from 'node:fs';

/**
 * File system manager with caching and optimizations
 */
export class FileSystemManager {
  private fileCache: FileCache;
  private statsCache: Map<string, { stats: Stats; timestamp: number }> = new Map();
  private statsCacheTTL: number = 60000; // 1 minute

  constructor(cacheSize: number = 500) {
    this.fileCache = new FileCache(cacheSize);
  }

  /**
   * Read file with caching
   */
  async readFile(filePath: string, useCache: boolean = true): Promise<string> {
    const normalizedPath = normalizePath(filePath);

    if (useCache) {
      const hash = await this.getFileHash(normalizedPath);
      const cached = this.fileCache.get(normalizedPath, hash);

      if (cached) {
        return cached;
      }
    }

    const content = await fs.readFile(normalizedPath, 'utf-8');

    if (useCache) {
      this.fileCache.set(normalizedPath, content);
    }

    return content;
  }

  /**
   * Read multiple files in parallel
   */
  async readFiles(
    filePaths: string[],
    options: { useCache?: boolean; concurrency?: number } = {}
  ): Promise<Map<string, string>> {
    const { useCache = true, concurrency = 10 } = options;
    const results = new Map<string, string>();

    const contents = await batchProcess(
      filePaths,
      async filePath => {
        try {
          return await this.readFile(filePath, useCache);
        } catch (error) {
          return null;
        }
      },
      { concurrency }
    );

    filePaths.forEach((filePath, index) => {
      if (contents[index]) {
        results.set(filePath, contents[index]!);
      }
    });

    return results;
  }

  /**
   * Get file statistics with caching
   */
  async getStats(filePath: string, useCache: boolean = true): Promise<Stats> {
    const normalizedPath = normalizePath(filePath);

    if (useCache) {
      const cached = this.statsCache.get(normalizedPath);
      if (cached && Date.now() - cached.timestamp < this.statsCacheTTL) {
        return cached.stats;
      }
    }

    const stats = await fs.stat(normalizedPath);

    if (useCache) {
      this.statsCache.set(normalizedPath, { stats, timestamp: Date.now() });
    }

    return stats;
  }

  /**
   * Get file information
   */
  async getFileInfo(filePath: string): Promise<FileInfo> {
    const normalizedPath = normalizePath(filePath);
    const stats = await this.getStats(normalizedPath);
    const content = await this.readFile(normalizedPath);

    return {
      path: normalizedPath,
      name: path.basename(normalizedPath),
      extension: path.extname(normalizedPath),
      size: stats.size,
      mtime: stats.mtime,
      content,
      hash: generateHash(content),
    };
  }

  /**
   * Find files matching patterns
   */
  async findFiles(
    patterns: string | string[],
    options: {
      cwd?: string;
      ignore?: string[];
      absolute?: boolean;
      onlyFiles?: boolean;
    } = {}
  ): Promise<string[]> {
    const files = await glob(patterns, {
      cwd: options.cwd || process.cwd(),
      ignore: options.ignore || ['node_modules/**', '.git/**'],
      absolute: options.absolute !== false,
      onlyFiles: options.onlyFiles !== false,
    });

    return files.map(normalizePath);
  }

  /**
   * Watch files for changes
   */
  async *watchFiles(
    patterns: string | string[],
    options: {
      cwd?: string;
      ignore?: string[];
    } = {}
  ): AsyncGenerator<{ event: string; path: string }> {
    const files = await this.findFiles(patterns, options);
    const watchers = new Map<string, any>();

    try {
      for (const file of files) {
        const watcher = fs.watch(file);
        watchers.set(file, watcher as any);

        (async () => {
          for await (const _event of watcher) {
            // Invalidate caches
            this.fileCache.invalidate(file);
            this.statsCache.delete(file);

            // Yield event
            // Note: This is a simplified implementation
          }
        })();
      }

      // This is a placeholder - actual implementation would be more complex
      yield { event: 'change', path: files[0] };
    } finally {
      for (const watcher of watchers.values()) {
        watcher.close();
      }
    }
  }

  /**
   * Get file hash
   */
  private async getFileHash(filePath: string): Promise<string> {
    const stats = await this.getStats(filePath);
    return `${stats.mtime.getTime()}-${stats.size}`;
  }

  /**
   * Check if file exists
   */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists
   */
  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /**
   * Write file safely
   */
  async writeFile(filePath: string, content: string, baseDir?: string): Promise<void> {
    const normalizedPath = normalizePath(filePath);

    // Security check
    if (baseDir && !isPathSafe(normalizedPath, baseDir)) {
      throw new Error('Path traversal detected');
    }

    // Ensure directory exists
    await this.ensureDir(path.dirname(normalizedPath));

    // Write file
    await fs.writeFile(normalizedPath, content, 'utf-8');

    // Update cache
    this.fileCache.set(normalizedPath, content);
  }

  /**
   * Copy file
   */
  async copyFile(src: string, dest: string): Promise<void> {
    await this.ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);

    // Invalidate caches
    this.fileCache.invalidate(filePath);
    this.statsCache.delete(filePath);
  }

  /**
   * Get directory contents
   */
  async readDir(dirPath: string, recursive: boolean = false): Promise<string[]> {
    if (recursive) {
      return this.findFiles('**/*', { cwd: dirPath });
    }

    const entries = await fs.readdir(dirPath);
    return entries.map(entry => path.join(dirPath, entry));
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.fileCache.clear();
    this.statsCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      fileCache: this.fileCache.getStats(),
      statsCache: {
        size: this.statsCache.size,
      },
    };
  }
}

/**
 * File watcher with debouncing
 */
export class FileWatcher {
  private watchers: Map<string, any> = new Map();
  private listeners: Map<string, Set<(event: string, filename: string) => void>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private debounceDelay: number;

  constructor(debounceDelay: number = 100) {
    this.debounceDelay = debounceDelay;
  }

  /**
   * Watch a file or directory
   */
  watch(
    filePath: string,
    callback: (event: string, filename: string) => void,
    options?: { recursive?: boolean }
  ): () => void {
    const normalizedPath = normalizePath(filePath);

    if (!this.watchers.has(normalizedPath)) {
      const watcher = fs.watch(normalizedPath, options || {});
      this.watchers.set(normalizedPath, watcher as any);

      (async () => {
        for await (const event of watcher) {
          this.handleEvent(normalizedPath, event.eventType, event.filename || normalizedPath);
        }
      })();
    }

    if (!this.listeners.has(normalizedPath)) {
      this.listeners.set(normalizedPath, new Set());
    }

    this.listeners.get(normalizedPath)!.add(callback);

    // Return unwatch function
    return () => {
      this.unwatch(normalizedPath, callback);
    };
  }

  /**
   * Handle file system event with debouncing
   */
  private handleEvent(filePath: string, event: string, filename: string): void {
    const key = `${filePath}:${event}:${filename}`;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      const listeners = this.listeners.get(filePath);
      if (listeners) {
        listeners.forEach(callback => callback(event, filename));
      }
      this.debounceTimers.delete(key);
    }, this.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Stop watching a file
   */
  unwatch(filePath: string, callback?: (event: string, filename: string) => void): void {
    const normalizedPath = normalizePath(filePath);
    const listeners = this.listeners.get(normalizedPath);

    if (callback && listeners) {
      listeners.delete(callback);

      if (listeners.size === 0) {
        this.listeners.delete(normalizedPath);
        this.closeWatcher(normalizedPath);
      }
    } else {
      this.listeners.delete(normalizedPath);
      this.closeWatcher(normalizedPath);
    }
  }

  /**
   * Close watcher for file
   */
  private closeWatcher(filePath: string): void {
    const watcher = this.watchers.get(filePath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(filePath);
    }
  }

  /**
   * Stop watching all files
   */
  unwatchAll(): void {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }

    this.watchers.clear();
    this.listeners.clear();

    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }

    this.debounceTimers.clear();
  }

  /**
   * Get watched files
   */
  getWatchedFiles(): string[] {
    return Array.from(this.watchers.keys());
  }
}

/**
 * Batch file operations
 */
export class BatchFileOperations {
  private fsManager: FileSystemManager;

  constructor(fsManager?: FileSystemManager) {
    this.fsManager = fsManager || new FileSystemManager();
  }

  /**
   * Read multiple files in parallel
   */
  async readMultiple(
    filePaths: string[],
    options: { concurrency?: number } = {}
  ): Promise<Map<string, string>> {
    return this.fsManager.readFiles(filePaths, options);
  }

  /**
   * Write multiple files in parallel
   */
  async writeMultiple(
    files: Array<{ path: string; content: string }>,
    options: { concurrency?: number } = {}
  ): Promise<void> {
    await batchProcess(
      files,
      async file => {
        await this.fsManager.writeFile(file.path, file.content);
      },
      { concurrency: options.concurrency || 10 }
    );
  }

  /**
   * Copy multiple files in parallel
   */
  async copyMultiple(
    operations: Array<{ src: string; dest: string }>,
    options: { concurrency?: number } = {}
  ): Promise<void> {
    await batchProcess(
      operations,
      async op => {
        await this.fsManager.copyFile(op.src, op.dest);
      },
      { concurrency: options.concurrency || 10 }
    );
  }

  /**
   * Delete multiple files in parallel
   */
  async deleteMultiple(filePaths: string[], options: { concurrency?: number } = {}): Promise<void> {
    await batchProcess(
      filePaths,
      async filePath => {
        await this.fsManager.deleteFile(filePath);
      },
      { concurrency: options.concurrency || 10 }
    );
  }
}
