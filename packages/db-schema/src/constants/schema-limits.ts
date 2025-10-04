/**
 * Schema Limits and Thresholds
 * Central location for all numeric limits, thresholds, and configuration values
 */

// String Length Limits
export const STRING_LIMITS = {
  // VARCHAR lengths for common fields
  EMAIL_LENGTH: 255,
  NAME_LENGTH: 255,
  PASSWORD_HASH_LENGTH: 255,
  DEFAULT_VARCHAR_LENGTH: 255,

  // VARCHAR threshold for TEXT recommendation
  LONG_VARCHAR_THRESHOLD: 500,

  // Input validation
  MAX_LINE_LENGTH: 500,
  MAX_WORD_LENGTH: 50,
} as const;

// Numeric Data Limits
export const NUMERIC_LIMITS = {
  // DECIMAL precision/scale
  DEFAULT_PRICE_PRECISION: 10,
  DEFAULT_PRICE_SCALE: 2,

  // Default values
  DEFAULT_STOCK_VALUE: 0,
} as const;

// Index Optimization Priorities
export const INDEX_PRIORITY = {
  HIGH: 1,      // Foreign keys, JSONB columns
  MEDIUM: 2,    // Status, type, category columns
  LOW: 3,       // Text search indexes
} as const;

// Index Impact Levels
export const INDEX_IMPACT = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;

// Normalization Thresholds
export const NORMALIZATION_LIMITS = {
  // Minimum non-key columns to suggest extraction
  MIN_NONKEY_COLUMNS_FOR_EXTRACTION: 2,

  // Minimum address columns to suggest extraction
  MIN_ADDRESS_COLUMNS_FOR_EXTRACTION: 2,
} as const;

// Schema Complexity Thresholds
export const COMPLEXITY_THRESHOLDS = {
  // Table count thresholds
  HIGH_COMPLEXITY_TABLE_COUNT: 20,
  MEDIUM_COMPLEXITY_TABLE_COUNT: 10,

  // Relationship count thresholds
  HIGH_COMPLEXITY_RELATIONSHIP_COUNT: 30,
  MEDIUM_COMPLEXITY_RELATIONSHIP_COUNT: 15,
} as const;

// Schema Analysis Estimates
export const ANALYSIS_ESTIMATES = {
  // Estimated rows per table
  DEFAULT_ROWS_PER_TABLE: 1000,

  // Storage estimation (MB per table)
  STORAGE_MB_PER_TABLE: 0.5,
} as const;

// Diagram Generation Limits
export const DIAGRAM_LIMITS = {
  // Maximum columns to show in ER diagram
  MAX_COLUMNS_IN_DIAGRAM: 10,
} as const;

// Mock Data Generation Ranges
export const MOCK_DATA_RANGES = {
  // Price/amount ranges
  MAX_RANDOM_PRICE: 1000,

  // Stock/quantity ranges
  MAX_RANDOM_QUANTITY: 100,

  // Numeric sequence offsets
  SEQUENCE_OFFSET: 1,

  // Decimal multipliers
  DECIMAL_MULTIPLIER: 10.5,
} as const;

// Migration Version Format
export const MIGRATION_FORMAT = {
  // Timestamp format for version numbers
  VERSION_PREFIX: 'V',

  // Number of timestamp digits (YYYYMMDDHHmmss = 14)
  TIMESTAMP_LENGTH: 14,
} as const;
