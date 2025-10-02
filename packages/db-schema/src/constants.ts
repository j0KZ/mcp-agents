/**
 * Database Schema Designer Constants
 * Central location for all magic numbers and constant values
 */

// Database Types
export const DATABASE_TYPE = {
  POSTGRES: 'postgres',
  MYSQL: 'mysql',
  MONGODB: 'mongodb',
  SQLITE: 'sqlite',
} as const;

// SQL Data Types
export const SQL_DATA_TYPE = {
  // Numeric
  INTEGER: 'INTEGER',
  BIGINT: 'BIGINT',
  SMALLINT: 'SMALLINT',
  DECIMAL: 'DECIMAL',
  NUMERIC: 'NUMERIC',
  REAL: 'REAL',
  DOUBLE: 'DOUBLE PRECISION',
  SERIAL: 'SERIAL',
  BIGSERIAL: 'BIGSERIAL',

  // String
  VARCHAR: 'VARCHAR',
  TEXT: 'TEXT',
  CHAR: 'CHAR',

  // Boolean
  BOOLEAN: 'BOOLEAN',

  // Date/Time
  DATE: 'DATE',
  TIME: 'TIME',
  TIMESTAMP: 'TIMESTAMP',
  TIMESTAMPTZ: 'TIMESTAMPTZ',

  // JSON
  JSON: 'JSON',
  JSONB: 'JSONB',

  // UUID
  UUID: 'UUID',

  // Binary
  BYTEA: 'BYTEA',
} as const;

// MongoDB Field Types
export const MONGO_FIELD_TYPE = {
  STRING: 'String',
  NUMBER: 'Number',
  BOOLEAN: 'Boolean',
  DATE: 'Date',
  OBJECT_ID: 'ObjectId',
  ARRAY: 'Array',
  OBJECT: 'Object',
  BUFFER: 'Buffer',
  MIXED: 'Mixed',
} as const;

// Normal Forms
export const NORMAL_FORM = {
  FIRST: '1NF',
  SECOND: '2NF',
  THIRD: '3NF',
  BCNF: 'BCNF',
  DENORMALIZED: 'DENORMALIZED',
} as const;

// Default Values
export const DEFAULTS = {
  // String lengths
  VARCHAR_DEFAULT_LENGTH: 255,
  VARCHAR_SHORT_LENGTH: 50,
  VARCHAR_MEDIUM_LENGTH: 100,
  VARCHAR_LONG_LENGTH: 1000,

  // Numeric constraints
  MIN_PORT: 1024,
  MAX_PORT: 65535,
  MIN_AGE: 0,
  MAX_AGE: 150,

  // Seed data
  DEFAULT_RECORDS_PER_TABLE: 10,
  MIN_SEED_RECORDS: 1,
  MAX_SEED_RECORDS: 1000,

  // Index naming
  INDEX_PREFIX: 'idx_',
  FK_PREFIX: 'fk_',
  PK_PREFIX: 'pk_',
  UK_PREFIX: 'uk_',

  // Timestamps
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  DELETED_AT: 'deleted_at',
} as const;

// Relationship Types
export const RELATIONSHIP_TYPE = {
  ONE_TO_ONE: 'one-to-one',
  ONE_TO_MANY: 'one-to-many',
  MANY_TO_ONE: 'many-to-one',
  MANY_TO_MANY: 'many-to-many',
} as const;

// Relationship Keywords
export const RELATIONSHIP_KEYWORDS = {
  HAS_MANY: ['has many', 'have many', 'contains', 'includes'],
  HAS_ONE: ['has one', 'has a', 'owns'],
  BELONGS_TO: ['belongs to', 'is owned by', 'is part of'],
  MANY_TO_MANY: ['many-to-many', 'associated with', 'connected to'],
} as const;

// ER Diagram Formats
export const DIAGRAM_FORMAT = {
  MERMAID: 'mermaid',
  PLANTUML: 'plantuml',
  DBML: 'dbml',
} as const;

// Diagram Themes
export const DIAGRAM_THEME = {
  DEFAULT: 'default',
  DARK: 'dark',
  NEUTRAL: 'neutral',
  FOREST: 'forest',
} as const;

// Index Types
export const INDEX_TYPE = {
  BTREE: 'BTREE',
  HASH: 'HASH',
  GIN: 'GIN',
  GIST: 'GIST',
  BRIN: 'BRIN',
} as const;

// Referential Actions
export const REFERENTIAL_ACTION = {
  CASCADE: 'CASCADE',
  SET_NULL: 'SET NULL',
  SET_DEFAULT: 'SET DEFAULT',
  RESTRICT: 'RESTRICT',
  NO_ACTION: 'NO ACTION',
} as const;

// Validation Severity
export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

// Common Field Patterns
export const FIELD_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  IP_ADDRESS: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
} as const;

// Mock Data Ranges
export const MOCK_DATA_RANGE = {
  MIN_STRING_LENGTH: 5,
  MAX_STRING_LENGTH: 50,
  MIN_INT: 1,
  MAX_INT: 1000,
  MIN_PRICE: 1,
  MAX_PRICE: 10000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
} as const;

// Schema Analysis Thresholds
export const ANALYSIS_THRESHOLD = {
  MAX_COLUMNS_PER_TABLE: 50,
  MAX_INDEXES_PER_TABLE: 10,
  MAX_FK_PER_TABLE: 20,
  LARGE_TABLE_COLUMN_COUNT: 30,
  COMPLEX_SCHEMA_TABLE_COUNT: 20,
} as const;

// Validation Error Codes
export const VALIDATION_ERROR = {
  MISSING_PRIMARY_KEY: 'MISSING_PRIMARY_KEY',
  INVALID_FOREIGN_KEY: 'INVALID_FOREIGN_KEY',
  MISSING_NOT_NULL: 'MISSING_NOT_NULL',
  INVALID_DATA_TYPE: 'INVALID_DATA_TYPE',
  NAMING_CONVENTION: 'NAMING_CONVENTION',
  MISSING_INDEX: 'MISSING_INDEX',
  REDUNDANT_INDEX: 'REDUNDANT_INDEX',
} as const;

// Normalization Issues
export const NORMALIZATION_ISSUE = {
  REPEATING_GROUPS: 'REPEATING_GROUPS',
  PARTIAL_DEPENDENCY: 'PARTIAL_DEPENDENCY',
  TRANSITIVE_DEPENDENCY: 'TRANSITIVE_DEPENDENCY',
  MULTIVALUED_DEPENDENCY: 'MULTIVALUED_DEPENDENCY',
} as const;
