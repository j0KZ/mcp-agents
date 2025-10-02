/**
 * Shared constants for all MCP tools
 */
/**
 * Common file extensions
 */
export declare const FILE_EXTENSIONS: {
    readonly TYPESCRIPT: readonly [".ts", ".tsx"];
    readonly JAVASCRIPT: readonly [".js", ".jsx", ".mjs", ".cjs"];
    readonly JSON: readonly [".json", ".jsonc"];
    readonly MARKDOWN: readonly [".md", ".mdx"];
    readonly YAML: readonly [".yml", ".yaml"];
    readonly CONFIG: readonly [".config.js", ".config.ts", ".rc", ".json"];
    readonly TEST: readonly [".test.ts", ".test.js", ".spec.ts", ".spec.js"];
    readonly ALL_CODE: readonly [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
};
/**
 * Common ignore patterns
 */
export declare const IGNORE_PATTERNS: readonly ["node_modules/**", ".git/**", "dist/**", "build/**", "coverage/**", ".next/**", ".nuxt/**", "out/**", "target/**", "**/*.min.js", "**/*.bundle.js", "**/vendor/**", "**/.DS_Store", "**/Thumbs.db"];
/**
 * Performance limits
 */
export declare const PERFORMANCE: {
    readonly MAX_FILE_SIZE: number;
    readonly MAX_CONCURRENT_FILES: 10;
    readonly DEFAULT_CONCURRENCY: 5;
    readonly CACHE_TTL: 3600000;
    readonly DEBOUNCE_DELAY: 100;
    readonly BATCH_SIZE: 50;
};
/**
 * Code quality thresholds (shared across tools)
 */
export declare const QUALITY_THRESHOLDS: {
    readonly EXCELLENT: 90;
    readonly GOOD: 70;
    readonly FAIR: 50;
    readonly POOR: 30;
    readonly MAX_COMPLEXITY: 10;
    readonly MAX_LINE_LENGTH: 120;
    readonly MAX_FUNCTION_LENGTH: 50;
    readonly MAX_FILE_SIZE_LINES: 400;
    readonly MIN_TEST_COVERAGE: 80;
    readonly MIN_COMMENT_DENSITY: 10;
};
/**
 * Severity levels (standardized)
 */
export declare const SEVERITY: {
    readonly CRITICAL: "critical";
    readonly ERROR: "error";
    readonly HIGH: "high";
    readonly WARNING: "warning";
    readonly MEDIUM: "medium";
    readonly INFO: "info";
    readonly LOW: "low";
};
/**
 * Output formats
 */
export declare const OUTPUT_FORMAT: {
    readonly JSON: "json";
    readonly TEXT: "text";
    readonly MARKDOWN: "markdown";
    readonly HTML: "html";
    readonly XML: "xml";
};
/**
 * Cache types
 */
export declare const CACHE_TYPE: {
    readonly FILE: "file";
    readonly ANALYSIS: "analysis";
    readonly TEST: "test";
    readonly SECURITY: "security";
    readonly METRICS: "metrics";
};
/**
 * Event types for MCP communication
 */
export declare const EVENT_TYPE: {
    readonly FILE_CHANGED: "file:changed";
    readonly FILE_CREATED: "file:created";
    readonly FILE_DELETED: "file:deleted";
    readonly ANALYSIS_STARTED: "analysis:started";
    readonly ANALYSIS_COMPLETED: "analysis:completed";
    readonly ANALYSIS_FAILED: "analysis:failed";
    readonly CACHE_HIT: "cache:hit";
    readonly CACHE_MISS: "cache:miss";
    readonly PIPELINE_STARTED: "pipeline:started";
    readonly PIPELINE_COMPLETED: "pipeline:completed";
    readonly PIPELINE_FAILED: "pipeline:failed";
};
/**
 * MCP tool names (for integration)
 */
export declare const MCP_TOOLS: {
    readonly ARCHITECTURE_ANALYZER: "architecture-analyzer";
    readonly SMART_REVIEWER: "smart-reviewer";
    readonly TEST_GENERATOR: "test-generator";
    readonly SECURITY_SCANNER: "security-scanner";
    readonly API_DESIGNER: "api-designer";
    readonly DB_SCHEMA: "db-schema";
    readonly DOC_GENERATOR: "doc-generator";
    readonly REFACTOR_ASSISTANT: "refactor-assistant";
};
/**
 * Default configurations
 */
export declare const DEFAULT_CONFIG: {
    readonly verbose: false;
    readonly dryRun: false;
    readonly outputFormat: "json";
    readonly cache: true;
    readonly parallel: true;
    readonly maxConcurrency: 5;
};
/**
 * Error codes
 */
export declare const ERROR_CODE: {
    readonly FILE_NOT_FOUND: "ERR_FILE_NOT_FOUND";
    readonly PERMISSION_DENIED: "ERR_PERMISSION_DENIED";
    readonly INVALID_INPUT: "ERR_INVALID_INPUT";
    readonly PARSE_ERROR: "ERR_PARSE_ERROR";
    readonly ANALYSIS_FAILED: "ERR_ANALYSIS_FAILED";
    readonly CACHE_ERROR: "ERR_CACHE_ERROR";
    readonly TIMEOUT: "ERR_TIMEOUT";
    readonly UNKNOWN: "ERR_UNKNOWN";
};
/**
 * Regular expressions (shared patterns)
 */
export declare const REGEX: {
    readonly FUNCTION_DECLARATION: RegExp;
    readonly CLASS_DECLARATION: RegExp;
    readonly IMPORT_STATEMENT: RegExp;
    readonly EXPORT_STATEMENT: RegExp;
    readonly FILE_PATH: RegExp;
    readonly RELATIVE_PATH: RegExp;
    readonly SEMVER: RegExp;
    readonly TODO_COMMENT: RegExp;
    readonly CONSOLE_LOG: RegExp;
    readonly DEBUGGER: RegExp;
};
/**
 * Test frameworks
 */
export declare const TEST_FRAMEWORK: {
    readonly JEST: "jest";
    readonly MOCHA: "mocha";
    readonly VITEST: "vitest";
    readonly AVA: "ava";
    readonly JASMINE: "jasmine";
    readonly TAPE: "tape";
};
/**
 * Language-specific settings
 */
export declare const LANGUAGE: {
    readonly TYPESCRIPT: {
        readonly extensions: readonly [".ts", ".tsx"];
        readonly configFiles: readonly ["tsconfig.json", "tsconfig.*.json"];
        readonly parser: "typescript";
    };
    readonly JAVASCRIPT: {
        readonly extensions: readonly [".js", ".jsx", ".mjs", ".cjs"];
        readonly configFiles: readonly [".eslintrc.js", ".eslintrc.json", "package.json"];
        readonly parser: "babel";
    };
};
/**
 * Memory limits
 */
export declare const MEMORY_LIMIT: {
    readonly LOW: number;
    readonly MEDIUM: number;
    readonly HIGH: number;
};
/**
 * Timeout limits (in milliseconds)
 */
export declare const TIMEOUT: {
    readonly SHORT: 5000;
    readonly MEDIUM: 30000;
    readonly LONG: 120000;
    readonly VERY_LONG: 300000;
};
//# sourceMappingURL=index.d.ts.map