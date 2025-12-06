/**
 * Architecture Analyzer - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
import { ToolExample } from '@j0kz/shared';
export declare const ANALYZE_ARCHITECTURE_EXAMPLES: ToolExample[];
export declare const ANALYZE_ARCHITECTURE_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
                properties: {
                    maxDepth: {
                        type: "number";
                        description: string;
                    };
                    excludePatterns: {
                        type: "array";
                        items: {
                            type: "string";
                        };
                        description: string;
                    };
                    detectCircular: {
                        type: "boolean";
                        description: string;
                    };
                    generateGraph: {
                        type: "boolean";
                        description: string;
                    };
                    layerRules: {
                        type: "object";
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
export declare const GET_MODULE_INFO_EXAMPLES: ToolExample[];
export declare const GET_MODULE_INFO_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
                type: "string";
                description: string;
            };
            modulePath: {
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
export declare const FIND_CIRCULAR_DEPS_EXAMPLES: ToolExample[];
export declare const FIND_CIRCULAR_DEPS_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
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
export declare const ARCHITECTURE_ANALYZER_TOOLS: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            projectPath: {
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
}[];
//# sourceMappingURL=tool-definitions.d.ts.map