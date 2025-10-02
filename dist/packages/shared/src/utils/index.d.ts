/**
 * Shared utility functions for all MCP tools
 */
/**
 * Generate a unique hash for content
 */
export declare function generateHash(content: string): string;
/**
 * Normalize file path for cross-platform compatibility
 */
export declare function normalizePath(filePath: string): string;
/**
 * Check if path is within base directory (prevent path traversal)
 */
export declare function isPathSafe(filePath: string, baseDir: string): boolean;
/**
 * Format bytes to human-readable size
 */
export declare function formatBytes(bytes: number): string;
/**
 * Format duration to human-readable time
 */
export declare function formatDuration(ms: number): string;
/**
 * Chunk array into smaller arrays
 */
export declare function chunk<T>(array: T[], size: number): T[][];
/**
 * Debounce function execution
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
/**
 * Deep merge objects
 */
export declare function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
/**
 * Calculate percentage
 */
export declare function percentage(value: number, total: number): number;
/**
 * Clamp value between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Generate unique ID
 */
export declare function generateId(prefix?: string): string;
/**
 * Check if string is valid JSON
 */
export declare function isValidJSON(str: string): boolean;
/**
 * Safe JSON parse with default value
 */
export declare function safeJSONParse<T>(str: string, defaultValue: T): T;
/**
 * Truncate string with ellipsis
 */
export declare function truncate(str: string, maxLength: number): string;
/**
 * Remove ANSI color codes from string
 */
export declare function stripAnsi(str: string): string;
/**
 * Pluralize word based on count
 */
export declare function pluralize(word: string, count: number): string;
//# sourceMappingURL=index.d.ts.map