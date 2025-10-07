/**
 * Documentation generation limits and thresholds
 */
/**
 * Git commit limits
 */
export declare const GIT_LIMITS: {
    /** Default maximum number of commits to include in changelog */
    readonly DEFAULT_COMMIT_LIMIT: 100;
    /** Maximum buffer size for git command output (10MB) */
    readonly MAX_GIT_BUFFER: number;
};
/**
 * File and directory exclusion patterns
 */
export declare const EXCLUSION_PATTERNS: {
    /** Hidden directories (starting with .) */
    readonly HIDDEN_DIRS: RegExp;
    /** Node modules directory */
    readonly NODE_MODULES: "node_modules";
    /** Build output directory */
    readonly DIST: "dist";
    /** Test file patterns */
    readonly TEST_FILES: RegExp;
};
/**
 * File type patterns
 */
export declare const FILE_PATTERNS: {
    /** Source file extensions */
    readonly SOURCE_FILES: RegExp;
};
//# sourceMappingURL=doc-limits.d.ts.map