/**
 * Database Schema Designer Types
 * Comprehensive type definitions for multi-database schema design
 */
/**
 * Supported database types
 */
export type DatabaseType = 'postgres' | 'mysql' | 'mongodb';
/**
 * SQL column data types
 */
export type SQLDataType = 'INTEGER' | 'BIGINT' | 'SMALLINT' | 'SERIAL' | 'BIGSERIAL' | 'VARCHAR' | 'TEXT' | 'CHAR' | 'BOOLEAN' | 'DATE' | 'TIMESTAMP' | 'TIMESTAMPTZ' | 'TIME' | 'DECIMAL' | 'NUMERIC' | 'FLOAT' | 'DOUBLE' | 'REAL' | 'JSON' | 'JSONB' | 'UUID' | 'BYTEA' | 'ARRAY' | 'ENUM';
/**
 * MongoDB field types
 */
export type MongoDataType = 'String' | 'Number' | 'Boolean' | 'Date' | 'ObjectId' | 'Array' | 'Object' | 'Mixed' | 'Buffer' | 'Decimal128' | 'Map';
/**
 * Column constraint types
 */
export type ConstraintType = 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'NOT_NULL' | 'CHECK' | 'DEFAULT';
/**
 * Index types
 */
export type IndexType = 'BTREE' | 'HASH' | 'GIN' | 'GIST' | 'BRIN' | 'COMPOUND' | 'TEXT';
/**
 * Relationship types
 */
export type RelationType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
/**
 * Column definition for SQL databases
 */
export interface SQLColumn {
    name: string;
    type: SQLDataType;
    length?: number;
    precision?: number;
    scale?: number;
    nullable?: boolean;
    defaultValue?: string | number | boolean;
    autoIncrement?: boolean;
    unique?: boolean;
    primaryKey?: boolean;
    comment?: string;
    enumValues?: string[];
}
/**
 * Field definition for MongoDB
 */
export interface MongoField {
    name: string;
    type: MongoDataType;
    required?: boolean;
    unique?: boolean;
    default?: any;
    enum?: any[];
    min?: number;
    max?: number;
    minlength?: number;
    maxlength?: number;
    match?: string;
    validate?: string;
    ref?: string;
    index?: boolean;
    sparse?: boolean;
}
/**
 * Foreign key constraint
 */
export interface ForeignKey {
    name: string;
    column: string;
    referencedTable: string;
    referencedColumn: string;
    onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
    onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
}
/**
 * Index definition
 */
export interface Index {
    name: string;
    columns: string[];
    type?: IndexType;
    unique?: boolean;
    where?: string;
    comment?: string;
}
/**
 * Check constraint
 */
export interface CheckConstraint {
    name: string;
    expression: string;
}
/**
 * SQL table definition
 */
export interface SQLTable {
    name: string;
    columns: SQLColumn[];
    primaryKey?: string | string[];
    foreignKeys?: ForeignKey[];
    indexes?: Index[];
    checkConstraints?: CheckConstraint[];
    comment?: string;
}
/**
 * MongoDB collection definition
 */
export interface MongoCollection {
    name: string;
    fields: MongoField[];
    indexes?: Index[];
    validationLevel?: 'strict' | 'moderate' | 'off';
    validationAction?: 'error' | 'warn';
    timeseries?: {
        timeField: string;
        metaField?: string;
        granularity?: 'seconds' | 'minutes' | 'hours';
    };
    capped?: {
        size: number;
        max?: number;
    };
    comment?: string;
}
/**
 * Relationship between tables/collections
 */
export interface Relationship {
    name: string;
    type: RelationType;
    from: {
        table: string;
        column: string;
    };
    to: {
        table: string;
        column: string;
    };
    junctionTable?: string;
}
/**
 * Complete database schema
 */
export interface DatabaseSchema {
    database: DatabaseType;
    name: string;
    version?: string;
    tables?: SQLTable[];
    collections?: MongoCollection[];
    relationships?: Relationship[];
    metadata?: {
        author?: string;
        description?: string;
        createdAt?: string;
        updatedAt?: string;
    };
}
/**
 * Schema design options
 */
export interface SchemaDesignOptions {
    database: DatabaseType;
    normalForm?: '1NF' | '2NF' | '3NF' | 'BCNF';
    includeTimestamps?: boolean;
    includeSoftDeletes?: boolean;
    useUUIDs?: boolean;
    addIndexes?: boolean;
    addComments?: boolean;
}
/**
 * Migration file format
 */
export interface Migration {
    version: string;
    description: string;
    up: string;
    down: string;
    timestamp: string;
}
/**
 * Index optimization suggestion
 */
export interface IndexSuggestion {
    table: string;
    columns: string[];
    type: IndexType;
    reason: string;
    estimatedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
    priority: number;
}
/**
 * Normalization suggestion
 */
export interface NormalizationSuggestion {
    type: 'EXTRACT_TABLE' | 'MERGE_COLUMNS' | 'REMOVE_REDUNDANCY' | 'ADD_JUNCTION';
    description: string;
    affectedTables: string[];
    proposedChanges: string;
    normalForm: '1NF' | '2NF' | '3NF' | 'BCNF';
}
/**
 * Seed data for a table/collection
 */
export interface SeedData {
    table: string;
    records: Record<string, any>[];
    truncateFirst?: boolean;
}
/**
 * Schema validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
/**
 * Validation error
 */
export interface ValidationError {
    type: 'MISSING_PRIMARY_KEY' | 'INVALID_FOREIGN_KEY' | 'DUPLICATE_COLUMN' | 'INVALID_TYPE' | 'NAMING_VIOLATION';
    table: string;
    column?: string;
    message: string;
    severity: 'ERROR' | 'CRITICAL';
}
/**
 * Validation warning
 */
export interface ValidationWarning {
    type: 'NO_INDEX' | 'LONG_VARCHAR' | 'NULLABLE_FOREIGN_KEY' | 'MISSING_TIMESTAMP' | 'DENORMALIZED';
    table: string;
    column?: string;
    message: string;
    suggestion?: string;
}
/**
 * ER diagram options
 */
export interface ERDiagramOptions {
    format: 'mermaid' | 'plantuml' | 'dbml';
    includeColumns?: boolean;
    includeIndexes?: boolean;
    includeRelationships?: boolean;
    theme?: 'default' | 'dark' | 'neutral';
}
/**
 * Schema analysis result
 */
export interface SchemaAnalysis {
    tableCount: number;
    columnCount: number;
    indexCount: number;
    relationshipCount: number;
    normalForm: '1NF' | '2NF' | '3NF' | 'BCNF' | 'DENORMALIZED';
    estimatedSize: {
        rows: number;
        storage: string;
    };
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
}
//# sourceMappingURL=types.d.ts.map