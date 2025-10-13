/**
 * Test generation configuration constants
 * Extracted to prevent magic numbers and improve maintainability
 */
/**
 * Default test framework
 */
export const DEFAULT_FRAMEWORK = 'jest';
/**
 * Valid test frameworks
 */
export const VALID_FRAMEWORKS = ['jest', 'vitest', 'mocha', 'ava'];
/**
 * Coverage estimation constants
 */
export const COVERAGE = {
    /**
     * Maximum coverage percentage
     */
    MAX_PERCENTAGE: 100,
    /**
     * Zero coverage baseline
     */
    ZERO_COVERAGE: 0,
};
/**
 * Test suite defaults
 */
export const TEST_DEFAULTS = {
    /**
     * Include edge cases by default
     */
    INCLUDE_EDGE_CASES: true,
    /**
     * Include error cases by default
     */
    INCLUDE_ERROR_CASES: true,
};
/**
 * File extension patterns
 */
export const FILE_EXTENSIONS = {
    /**
     * Source file extensions regex pattern
     */
    SOURCE_FILE_PATTERN: /\.(ts|js)$/,
    /**
     * Test file suffix
     */
    TEST_SUFFIX: '.test.',
};
//# sourceMappingURL=test-config.js.map