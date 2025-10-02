/**
 * Shared constants for all MCP tools
 */
/**
 * Common file extensions
 */
export const FILE_EXTENSIONS = {
    TYPESCRIPT: ['.ts', '.tsx'],
    JAVASCRIPT: ['.js', '.jsx', '.mjs', '.cjs'],
    JSON: ['.json', '.jsonc'],
    MARKDOWN: ['.md', '.mdx'],
    YAML: ['.yml', '.yaml'],
    CONFIG: ['.config.js', '.config.ts', '.rc', '.json'],
    TEST: ['.test.ts', '.test.js', '.spec.ts', '.spec.js'],
    ALL_CODE: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
};
/**
 * Common ignore patterns
 */
export const IGNORE_PATTERNS = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.next/**',
    '.nuxt/**',
    'out/**',
    'target/**',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/vendor/**',
    '**/.DS_Store',
    '**/Thumbs.db',
];
/**
 * Performance limits
 */
export const PERFORMANCE = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_CONCURRENT_FILES: 10,
    DEFAULT_CONCURRENCY: 5,
    CACHE_TTL: 3600000, // 1 hour
    DEBOUNCE_DELAY: 100, // 100ms
    BATCH_SIZE: 50,
};
/**
 * Code quality thresholds (shared across tools)
 */
export const QUALITY_THRESHOLDS = {
    EXCELLENT: 90,
    GOOD: 70,
    FAIR: 50,
    POOR: 30,
    MAX_COMPLEXITY: 10,
    MAX_LINE_LENGTH: 120,
    MAX_FUNCTION_LENGTH: 50,
    MAX_FILE_SIZE_LINES: 400,
    MIN_TEST_COVERAGE: 80,
    MIN_COMMENT_DENSITY: 10,
};
/**
 * Severity levels (standardized)
 */
export const SEVERITY = {
    CRITICAL: 'critical',
    ERROR: 'error',
    HIGH: 'high',
    WARNING: 'warning',
    MEDIUM: 'medium',
    INFO: 'info',
    LOW: 'low',
};
/**
 * Output formats
 */
export const OUTPUT_FORMAT = {
    JSON: 'json',
    TEXT: 'text',
    MARKDOWN: 'markdown',
    HTML: 'html',
    XML: 'xml',
};
/**
 * Cache types
 */
export const CACHE_TYPE = {
    FILE: 'file',
    ANALYSIS: 'analysis',
    TEST: 'test',
    SECURITY: 'security',
    METRICS: 'metrics',
};
/**
 * Event types for MCP communication
 */
export const EVENT_TYPE = {
    FILE_CHANGED: 'file:changed',
    FILE_CREATED: 'file:created',
    FILE_DELETED: 'file:deleted',
    ANALYSIS_STARTED: 'analysis:started',
    ANALYSIS_COMPLETED: 'analysis:completed',
    ANALYSIS_FAILED: 'analysis:failed',
    CACHE_HIT: 'cache:hit',
    CACHE_MISS: 'cache:miss',
    PIPELINE_STARTED: 'pipeline:started',
    PIPELINE_COMPLETED: 'pipeline:completed',
    PIPELINE_FAILED: 'pipeline:failed',
};
/**
 * MCP tool names (for integration)
 */
export const MCP_TOOLS = {
    ARCHITECTURE_ANALYZER: 'architecture-analyzer',
    SMART_REVIEWER: 'smart-reviewer',
    TEST_GENERATOR: 'test-generator',
    SECURITY_SCANNER: 'security-scanner',
    API_DESIGNER: 'api-designer',
    DB_SCHEMA: 'db-schema',
    DOC_GENERATOR: 'doc-generator',
    REFACTOR_ASSISTANT: 'refactor-assistant',
};
/**
 * Default configurations
 */
export const DEFAULT_CONFIG = {
    verbose: false,
    dryRun: false,
    outputFormat: OUTPUT_FORMAT.JSON,
    cache: true,
    parallel: true,
    maxConcurrency: PERFORMANCE.DEFAULT_CONCURRENCY,
};
/**
 * Error codes
 */
export const ERROR_CODE = {
    FILE_NOT_FOUND: 'ERR_FILE_NOT_FOUND',
    PERMISSION_DENIED: 'ERR_PERMISSION_DENIED',
    INVALID_INPUT: 'ERR_INVALID_INPUT',
    PARSE_ERROR: 'ERR_PARSE_ERROR',
    ANALYSIS_FAILED: 'ERR_ANALYSIS_FAILED',
    CACHE_ERROR: 'ERR_CACHE_ERROR',
    TIMEOUT: 'ERR_TIMEOUT',
    UNKNOWN: 'ERR_UNKNOWN',
};
/**
 * Regular expressions (shared patterns)
 */
export const REGEX = {
    // Code patterns
    FUNCTION_DECLARATION: /function\s+(\w+)\s*\(/g,
    CLASS_DECLARATION: /class\s+(\w+)/g,
    IMPORT_STATEMENT: /import\s+.*\s+from\s+['"](.+)['"]/g,
    EXPORT_STATEMENT: /export\s+.*\s+from\s+['"](.+)['"]/g,
    // File patterns
    FILE_PATH: /^[a-zA-Z]:\\|^\//,
    RELATIVE_PATH: /^\.\.?\//,
    // Version patterns
    SEMVER: /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/,
    // Common code issues
    TODO_COMMENT: /\b(TODO|FIXME|XXX|HACK|NOTE)\b/gi,
    CONSOLE_LOG: /console\.(log|warn|error|debug|info)/g,
    DEBUGGER: /\bdebugger\b/g,
};
/**
 * Test frameworks
 */
export const TEST_FRAMEWORK = {
    JEST: 'jest',
    MOCHA: 'mocha',
    VITEST: 'vitest',
    AVA: 'ava',
    JASMINE: 'jasmine',
    TAPE: 'tape',
};
/**
 * Language-specific settings
 */
export const LANGUAGE = {
    TYPESCRIPT: {
        extensions: FILE_EXTENSIONS.TYPESCRIPT,
        configFiles: ['tsconfig.json', 'tsconfig.*.json'],
        parser: 'typescript',
    },
    JAVASCRIPT: {
        extensions: FILE_EXTENSIONS.JAVASCRIPT,
        configFiles: ['.eslintrc.js', '.eslintrc.json', 'package.json'],
        parser: 'babel',
    },
};
/**
 * Memory limits
 */
export const MEMORY_LIMIT = {
    LOW: 512 * 1024 * 1024, // 512MB
    MEDIUM: 1024 * 1024 * 1024, // 1GB
    HIGH: 2048 * 1024 * 1024, // 2GB
};
/**
 * Timeout limits (in milliseconds)
 */
export const TIMEOUT = {
    SHORT: 5000, // 5 seconds
    MEDIUM: 30000, // 30 seconds
    LONG: 120000, // 2 minutes
    VERY_LONG: 300000, // 5 minutes
};
//# sourceMappingURL=index.js.map