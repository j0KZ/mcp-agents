/**
 * Smart Path Resolution System
 * Intelligently resolves file paths using multiple fallback strategies
 * Handles relative paths, home directory expansion, and fuzzy matching
 */
export interface PathResolutionResult {
    resolved: string;
    strategy: string;
    attempted: Array<{
        path: string;
        reason: string;
    }>;
    suggestions?: string[];
}
export interface PathResolutionContext {
    workingDir?: string;
    projectRoot?: string;
    allowedDirs?: string[];
    maxDepth?: number;
}
export declare class SmartPathResolver {
    /**
     * Resolve file path using multiple fallback strategies
     */
    static resolvePath(inputPath: string, context?: PathResolutionContext): Promise<PathResolutionResult>;
    /**
     * Check if file exists and is accessible
     */
    private static fileExists;
    /**
     * Search for file in parent directories (up to maxDepth levels)
     */
    private static searchParentDirectories;
    /**
     * Fuzzy file search (find similar filenames)
     */
    private static fuzzyFindFile;
    /**
     * Recursively read directory up to maxDepth
     */
    private static recursiveReadDir;
    /**
     * Calculate Levenshtein distance between two strings
     */
    private static levenshteinDistance;
    /**
     * Get relative path from project root (for display purposes)
     */
    static getRelativePath(absolutePath: string): string;
}
/**
 * Custom error for path resolution failures
 */
export declare class PathResolutionError extends Error {
    readonly requestedPath: string;
    readonly attempted: Array<{
        path: string;
        reason: string;
    }>;
    constructor(requestedPath: string, attempted: Array<{
        path: string;
        reason: string;
    }>);
    toJSON(): {
        error: string;
        requestedPath: string;
        attempted: {
            path: string;
            reason: string;
        }[];
        suggestion: string;
    };
}
//# sourceMappingURL=smart-resolver.d.ts.map