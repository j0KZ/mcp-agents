/**
 * Constants for test generation limits and thresholds
 */

export const FILE_LIMITS = {
  /** Maximum file size in bytes (1MB) */
  MAX_FILE_SIZE: 1_000_000,
  /** Maximum line length for regex matching */
  MAX_LINE_LENGTH: 1000,
  /** Maximum parameter string length in regex */
  MAX_PARAM_LENGTH: 500,
} as const;

export const TEST_DEFAULTS = {
  /** Number of test iterations for benchmarks */
  BENCHMARK_ITERATIONS: 10,
  /** Repeat count for large string edge cases */
  LARGE_STRING_REPEAT: 1000,
  /** Default array length for rest parameters */
  DEFAULT_ARRAY_LENGTH: 3,
  /** Default numeric value */
  DEFAULT_NUMBER: 1,
} as const;

export const COVERAGE_BONUSES = {
  /** Coverage bonus for edge case tests */
  EDGE_CASES_BONUS: 10,
  /** Coverage bonus for error case tests */
  ERROR_CASES_BONUS: 10,
  /** Maximum coverage percentage */
  MAX_COVERAGE: 100,
} as const;

export const SAMPLE_VALUES = {
  /** Default ID value */
  DEFAULT_ID: '1',
  /** Default age value for test data */
  DEFAULT_AGE: '25',
  /** Default count value */
  DEFAULT_COUNT: '10',
} as const;

export const FORMATTING = {
  /** JSON indent spaces */
  JSON_INDENT: 2,
  /** Separator line length */
  SEPARATOR_LENGTH: 60,
  /** Decimal places for timing */
  TIMING_DECIMALS: 2,
  /** Decimal places for percentages */
  PERCENTAGE_DECIMALS: 1,
} as const;
