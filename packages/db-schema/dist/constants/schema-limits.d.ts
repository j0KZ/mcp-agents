/**
 * Schema Limits and Thresholds
 * Central location for all numeric limits, thresholds, and configuration values
 */
export declare const STRING_LIMITS: {
    readonly EMAIL_LENGTH: 255;
    readonly NAME_LENGTH: 255;
    readonly PASSWORD_HASH_LENGTH: 255;
    readonly DEFAULT_VARCHAR_LENGTH: 255;
    readonly LONG_VARCHAR_THRESHOLD: 500;
    readonly MAX_LINE_LENGTH: 500;
    readonly MAX_WORD_LENGTH: 50;
};
export declare const NUMERIC_LIMITS: {
    readonly DEFAULT_PRICE_PRECISION: 10;
    readonly DEFAULT_PRICE_SCALE: 2;
    readonly DEFAULT_STOCK_VALUE: 0;
};
export declare const INDEX_PRIORITY: {
    readonly HIGH: 1;
    readonly MEDIUM: 2;
    readonly LOW: 3;
};
export declare const INDEX_IMPACT: {
    readonly HIGH: "HIGH";
    readonly MEDIUM: "MEDIUM";
    readonly LOW: "LOW";
};
export declare const NORMALIZATION_LIMITS: {
    readonly MIN_NONKEY_COLUMNS_FOR_EXTRACTION: 2;
    readonly MIN_ADDRESS_COLUMNS_FOR_EXTRACTION: 2;
};
export declare const COMPLEXITY_THRESHOLDS: {
    readonly HIGH_COMPLEXITY_TABLE_COUNT: 20;
    readonly MEDIUM_COMPLEXITY_TABLE_COUNT: 10;
    readonly HIGH_COMPLEXITY_RELATIONSHIP_COUNT: 30;
    readonly MEDIUM_COMPLEXITY_RELATIONSHIP_COUNT: 15;
};
export declare const ANALYSIS_ESTIMATES: {
    readonly DEFAULT_ROWS_PER_TABLE: 1000;
    readonly STORAGE_MB_PER_TABLE: 0.5;
};
export declare const DIAGRAM_LIMITS: {
    readonly MAX_COLUMNS_IN_DIAGRAM: 10;
};
export declare const MOCK_DATA_RANGES: {
    readonly MAX_RANDOM_PRICE: 1000;
    readonly MAX_RANDOM_QUANTITY: 100;
    readonly SEQUENCE_OFFSET: 1;
    readonly DECIMAL_MULTIPLIER: 10.5;
};
export declare const MIGRATION_FORMAT: {
    readonly VERSION_PREFIX: "V";
    readonly TIMESTAMP_LENGTH: 14;
};
//# sourceMappingURL=schema-limits.d.ts.map