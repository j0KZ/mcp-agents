/**
 * Shared utility functions for all MCP tools
 */
import crypto from 'crypto';
import path from 'path';
/**
 * Generate a unique hash for content
 */
export function generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}
/**
 * Normalize file path for cross-platform compatibility
 */
export function normalizePath(filePath) {
    return path.normalize(filePath).replace(/\\/g, '/');
}
/**
 * Check if path is within base directory (prevent path traversal)
 */
export function isPathSafe(filePath, baseDir) {
    const resolved = path.resolve(baseDir, filePath);
    const normalized = path.normalize(resolved);
    return normalized.startsWith(path.resolve(baseDir));
}
/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
/**
 * Format duration to human-readable time
 */
export function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(2)}s`;
    if (ms < 3600000)
        return `${(ms / 60000).toFixed(2)}m`;
    return `${(ms / 3600000).toFixed(2)}h`;
}
/**
 * Chunk array into smaller arrays
 */
export function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}
/**
 * Debounce function execution
 */
export function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }
    throw lastError;
}
/**
 * Deep merge objects
 */
export function deepMerge(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return deepMerge(target, ...sources);
}
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
/**
 * Calculate percentage
 */
export function percentage(value, total) {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
}
/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Generate unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}
/**
 * Check if string is valid JSON
 */
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Safe JSON parse with default value
 */
export function safeJSONParse(str, defaultValue) {
    try {
        return JSON.parse(str);
    }
    catch {
        return defaultValue;
    }
}
/**
 * Truncate string with ellipsis
 */
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.substring(0, maxLength - 3) + '...';
}
/**
 * Remove ANSI color codes from string
 */
export function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}
/**
 * Pluralize word based on count
 */
export function pluralize(word, count) {
    return count === 1 ? word : `${word}s`;
}
//# sourceMappingURL=index.js.map