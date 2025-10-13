/**
 * Test generation configuration constants
 * Extracted to prevent magic numbers and improve maintainability
 */
/**
 * Default test framework
 */
export declare const DEFAULT_FRAMEWORK = "jest";
/**
 * Valid test frameworks
 */
export declare const VALID_FRAMEWORKS: readonly ["jest", "vitest", "mocha", "ava"];
/**
 * Coverage estimation constants
 */
export declare const COVERAGE: {
    /**
     * Maximum coverage percentage
     */
    readonly MAX_PERCENTAGE: 100;
    /**
     * Zero coverage baseline
     */
    readonly ZERO_COVERAGE: 0;
};
/**
 * Test suite defaults
 */
export declare const TEST_DEFAULTS: {
    /**
     * Include edge cases by default
     */
    readonly INCLUDE_EDGE_CASES: true;
    /**
     * Include error cases by default
     */
    readonly INCLUDE_ERROR_CASES: true;
};
/**
 * File extension patterns
 */
export declare const FILE_EXTENSIONS: {
    /**
     * Source file extensions regex pattern
     */
    readonly SOURCE_FILE_PATTERN: RegExp;
    /**
     * Test file suffix
     */
    readonly TEST_SUFFIX: ".test.";
};
//# sourceMappingURL=test-config.d.ts.map