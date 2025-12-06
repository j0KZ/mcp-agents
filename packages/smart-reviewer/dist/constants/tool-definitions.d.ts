/**
 * Smart Reviewer - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * Examples improve parameter accuracy from 72% to 90%
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
import { ToolExample } from '@j0kz/shared';
export declare const REVIEW_FILE_EXAMPLES: ToolExample[];
export declare const REVIEW_FILE_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
                properties: {
                    severity: {
                        type: "string";
                        enum: string[];
                        description: string;
                    };
                    autoFix: {
                        type: "boolean";
                        description: string;
                    };
                    includeMetrics: {
                        type: "boolean";
                        description: string;
                    };
                };
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const BATCH_REVIEW_EXAMPLES: ToolExample[];
export declare const BATCH_REVIEW_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePaths: {
                type: "array";
                items: {
                    type: "string";
                };
                description: string;
            };
            config: {
                type: "object";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const GENERATE_AUTO_FIXES_EXAMPLES: ToolExample[];
export declare const GENERATE_AUTO_FIXES_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePath: {
                type: "string";
                description: string;
            };
            safeOnly: {
                type: "boolean";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const APPLY_AUTO_FIXES_EXAMPLES: ToolExample[];
export declare const APPLY_AUTO_FIXES_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePath: {
                type: "string";
                description: string;
            };
            safeOnly: {
                type: "boolean";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const APPLY_FIXES_EXAMPLES: ToolExample[];
export declare const APPLY_FIXES_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePath: {
                type: "string";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const HEALTH_EXAMPLES: ToolExample[];
export declare const HEALTH_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            verbose: {
                type: "boolean";
                description: string;
            };
        };
    };
    examples: ToolExample[];
};
export declare const SMART_REVIEWER_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filePaths: {
                type: "array";
                items: {
                    type: "string";
                };
                description: string;
            };
            config: {
                type: "object";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
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
            filePath: {
                type: "string";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
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
            verbose: {
                type: "boolean";
                description: string;
            };
        };
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map