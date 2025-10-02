/**
 * Database Schema Designer Constants
 * Central location for all magic numbers and constant values
 */
export declare const DATABASE_TYPE: {
    readonly POSTGRES: "postgres";
    readonly MYSQL: "mysql";
    readonly MONGODB: "mongodb";
    readonly SQLITE: "sqlite";
};
export declare const SQL_DATA_TYPE: {
    readonly INTEGER: "INTEGER";
    readonly BIGINT: "BIGINT";
    readonly SMALLINT: "SMALLINT";
    readonly DECIMAL: "DECIMAL";
    readonly NUMERIC: "NUMERIC";
    readonly REAL: "REAL";
    readonly DOUBLE: "DOUBLE PRECISION";
    readonly SERIAL: "SERIAL";
    readonly BIGSERIAL: "BIGSERIAL";
    readonly VARCHAR: "VARCHAR";
    readonly TEXT: "TEXT";
    readonly CHAR: "CHAR";
    readonly BOOLEAN: "BOOLEAN";
    readonly DATE: "DATE";
    readonly TIME: "TIME";
    readonly TIMESTAMP: "TIMESTAMP";
    readonly TIMESTAMPTZ: "TIMESTAMPTZ";
    readonly JSON: "JSON";
    readonly JSONB: "JSONB";
    readonly UUID: "UUID";
    readonly BYTEA: "BYTEA";
};
export declare const MONGO_FIELD_TYPE: {
    readonly STRING: "String";
    readonly NUMBER: "Number";
    readonly BOOLEAN: "Boolean";
    readonly DATE: "Date";
    readonly OBJECT_ID: "ObjectId";
    readonly ARRAY: "Array";
    readonly OBJECT: "Object";
    readonly BUFFER: "Buffer";
    readonly MIXED: "Mixed";
};
export declare const NORMAL_FORM: {
    readonly FIRST: "1NF";
    readonly SECOND: "2NF";
    readonly THIRD: "3NF";
    readonly BCNF: "BCNF";
    readonly DENORMALIZED: "DENORMALIZED";
};
export declare const DEFAULTS: {
    readonly VARCHAR_DEFAULT_LENGTH: 255;
    readonly VARCHAR_SHORT_LENGTH: 50;
    readonly VARCHAR_MEDIUM_LENGTH: 100;
    readonly VARCHAR_LONG_LENGTH: 1000;
    readonly MIN_PORT: 1024;
    readonly MAX_PORT: 65535;
    readonly MIN_AGE: 0;
    readonly MAX_AGE: 150;
    readonly DEFAULT_RECORDS_PER_TABLE: 10;
    readonly MIN_SEED_RECORDS: 1;
    readonly MAX_SEED_RECORDS: 1000;
    readonly INDEX_PREFIX: "idx_";
    readonly FK_PREFIX: "fk_";
    readonly PK_PREFIX: "pk_";
    readonly UK_PREFIX: "uk_";
    readonly CREATED_AT: "created_at";
    readonly UPDATED_AT: "updated_at";
    readonly DELETED_AT: "deleted_at";
};
export declare const RELATIONSHIP_TYPE: {
    readonly ONE_TO_ONE: "one-to-one";
    readonly ONE_TO_MANY: "one-to-many";
    readonly MANY_TO_ONE: "many-to-one";
    readonly MANY_TO_MANY: "many-to-many";
};
export declare const RELATIONSHIP_KEYWORDS: {
    readonly HAS_MANY: readonly ["has many", "have many", "contains", "includes"];
    readonly HAS_ONE: readonly ["has one", "has a", "owns"];
    readonly BELONGS_TO: readonly ["belongs to", "is owned by", "is part of"];
    readonly MANY_TO_MANY: readonly ["many-to-many", "associated with", "connected to"];
};
export declare const DIAGRAM_FORMAT: {
    readonly MERMAID: "mermaid";
    readonly PLANTUML: "plantuml";
    readonly DBML: "dbml";
};
export declare const DIAGRAM_THEME: {
    readonly DEFAULT: "default";
    readonly DARK: "dark";
    readonly NEUTRAL: "neutral";
    readonly FOREST: "forest";
};
export declare const INDEX_TYPE: {
    readonly BTREE: "BTREE";
    readonly HASH: "HASH";
    readonly GIN: "GIN";
    readonly GIST: "GIST";
    readonly BRIN: "BRIN";
};
export declare const REFERENTIAL_ACTION: {
    readonly CASCADE: "CASCADE";
    readonly SET_NULL: "SET NULL";
    readonly SET_DEFAULT: "SET DEFAULT";
    readonly RESTRICT: "RESTRICT";
    readonly NO_ACTION: "NO ACTION";
};
export declare const VALIDATION_SEVERITY: {
    readonly ERROR: "error";
    readonly WARNING: "warning";
    readonly INFO: "info";
};
export declare const FIELD_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly URL: RegExp;
    readonly UUID: RegExp;
    readonly PHONE: RegExp;
    readonly IP_ADDRESS: RegExp;
};
export declare const MOCK_DATA_RANGE: {
    readonly MIN_STRING_LENGTH: 5;
    readonly MAX_STRING_LENGTH: 50;
    readonly MIN_INT: 1;
    readonly MAX_INT: 1000;
    readonly MIN_PRICE: 1;
    readonly MAX_PRICE: 10000;
    readonly MIN_QUANTITY: 1;
    readonly MAX_QUANTITY: 100;
};
export declare const ANALYSIS_THRESHOLD: {
    readonly MAX_COLUMNS_PER_TABLE: 50;
    readonly MAX_INDEXES_PER_TABLE: 10;
    readonly MAX_FK_PER_TABLE: 20;
    readonly LARGE_TABLE_COLUMN_COUNT: 30;
    readonly COMPLEX_SCHEMA_TABLE_COUNT: 20;
};
export declare const VALIDATION_ERROR: {
    readonly MISSING_PRIMARY_KEY: "MISSING_PRIMARY_KEY";
    readonly INVALID_FOREIGN_KEY: "INVALID_FOREIGN_KEY";
    readonly MISSING_NOT_NULL: "MISSING_NOT_NULL";
    readonly INVALID_DATA_TYPE: "INVALID_DATA_TYPE";
    readonly NAMING_CONVENTION: "NAMING_CONVENTION";
    readonly MISSING_INDEX: "MISSING_INDEX";
    readonly REDUNDANT_INDEX: "REDUNDANT_INDEX";
};
export declare const NORMALIZATION_ISSUE: {
    readonly REPEATING_GROUPS: "REPEATING_GROUPS";
    readonly PARTIAL_DEPENDENCY: "PARTIAL_DEPENDENCY";
    readonly TRANSITIVE_DEPENDENCY: "TRANSITIVE_DEPENDENCY";
    readonly MULTIVALUED_DEPENDENCY: "MULTIVALUED_DEPENDENCY";
};
//# sourceMappingURL=constants.d.ts.map