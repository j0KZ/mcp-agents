/**
 * Constants for test generation limits and thresholds
 */
export declare const FILE_LIMITS: {
    /** Maximum file size in bytes (1MB) */
    readonly MAX_FILE_SIZE: 1000000;
    /** Maximum line length for regex matching */
    readonly MAX_LINE_LENGTH: 1000;
    /** Maximum parameter string length in regex */
    readonly MAX_PARAM_LENGTH: 500;
};
export declare const TEST_DEFAULTS: {
    /** Number of test iterations for benchmarks */
    readonly BENCHMARK_ITERATIONS: 10;
    /** Repeat count for large string edge cases */
    readonly LARGE_STRING_REPEAT: 1000;
    /** Default array length for rest parameters */
    readonly DEFAULT_ARRAY_LENGTH: 3;
    /** Default numeric value */
    readonly DEFAULT_NUMBER: 1;
};
export declare const COVERAGE_BONUSES: {
    /** Coverage bonus for edge case tests */
    readonly EDGE_CASES_BONUS: 10;
    /** Coverage bonus for error case tests */
    readonly ERROR_CASES_BONUS: 10;
    /** Maximum coverage percentage */
    readonly MAX_COVERAGE: 100;
};
export declare const SAMPLE_VALUES: {
    /** Default ID value */
    readonly DEFAULT_ID: "1";
    /** Default age value for test data */
    readonly DEFAULT_AGE: "25";
    /** Default count value */
    readonly DEFAULT_COUNT: "10";
};
export declare const FORMATTING: {
    /** JSON indent spaces */
    readonly JSON_INDENT: 2;
    /** Separator line length */
    readonly SEPARATOR_LENGTH: 60;
    /** Decimal places for timing */
    readonly TIMING_DECIMALS: 2;
    /** Decimal places for percentages */
    readonly PERCENTAGE_DECIMALS: 1;
};
//# sourceMappingURL=limits.d.ts.map