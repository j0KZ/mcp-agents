/**
 * DB Schema Designer - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
import { ToolExample } from '@j0kz/shared';
export declare const DESIGN_SCHEMA_EXAMPLES: ToolExample[];
export declare const GENERATE_MIGRATION_EXAMPLES: ToolExample[];
export declare const CREATE_ER_DIAGRAM_EXAMPLES: ToolExample[];
export declare const OPTIMIZE_INDEXES_EXAMPLES: ToolExample[];
export declare const NORMALIZE_SCHEMA_EXAMPLES: ToolExample[];
export declare const GENERATE_SEED_DATA_EXAMPLES: ToolExample[];
export declare const VALIDATE_SCHEMA_EXAMPLES: ToolExample[];
export declare const ANALYZE_SCHEMA_EXAMPLES: ToolExample[];
export declare const DB_SCHEMA_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            requirements: {
                type: "string";
                description: string;
            };
            options: {
                type: "object";
                properties: {
                    database: {
                        type: "string";
                        enum: string[];
                    };
                    normalForm: {
                        type: "string";
                        enum: string[];
                    };
                    includeTimestamps: {
                        type: "boolean";
                    };
                    useUUIDs: {
                        type: "boolean";
                    };
                    format?: undefined;
                    includeColumns?: undefined;
                    includeRelationships?: undefined;
                };
                required: string[];
            };
            response_format: any;
            schema?: undefined;
            description?: undefined;
            recordsPerTable?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            schema: {
                type: "object";
                description: string;
            };
            description: {
                type: "string";
                description: string;
            };
            response_format: any;
            requirements?: undefined;
            options?: undefined;
            recordsPerTable?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            schema: {
                type: "object";
                description: string;
            };
            options: {
                type: "object";
                properties: {
                    format: {
                        type: "string";
                        enum: string[];
                    };
                    includeColumns: {
                        type: "boolean";
                    };
                    includeRelationships: {
                        type: "boolean";
                    };
                    database?: undefined;
                    normalForm?: undefined;
                    includeTimestamps?: undefined;
                    useUUIDs?: undefined;
                };
                required?: undefined;
            };
            response_format: any;
            requirements?: undefined;
            description?: undefined;
            recordsPerTable?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            schema: {
                type: "object";
                description: string;
            };
            response_format: any;
            requirements?: undefined;
            options?: undefined;
            description?: undefined;
            recordsPerTable?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            schema: {
                type: "object";
                description: string;
            };
            recordsPerTable: {
                type: "number";
                description: string;
            };
            response_format: any;
            requirements?: undefined;
            options?: undefined;
            description?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map