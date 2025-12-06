/**
 * Orchestrator MCP - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture - Meta-tools for tool discovery
 */
import { ToolExample } from '@j0kz/shared';
export declare const RUN_WORKFLOW_EXAMPLES: ToolExample[];
export declare const RUN_SEQUENCE_EXAMPLES: ToolExample[];
export declare const LIST_WORKFLOWS_EXAMPLES: ToolExample[];
export declare const SEARCH_TOOLS_EXAMPLES: ToolExample[];
export declare const LOAD_TOOL_EXAMPLES: ToolExample[];
export declare const LIST_CAPABILITIES_EXAMPLES: ToolExample[];
export declare const ORCHESTRATOR_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            workflow: {
                type: "string";
                enum: string[];
                description: string;
            };
            focus: {
                type: "string";
                enum: string[];
                description: string;
            };
            files: {
                type: "array";
                items: {
                    type: "string";
                };
                description: string;
            };
            projectPath: {
                type: "string";
                description: string;
            };
            language: {
                type: "string";
                enum: string[];
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            steps?: undefined;
            query?: undefined;
            category?: undefined;
            frequency?: undefined;
            server?: undefined;
            limit?: undefined;
            toolName?: undefined;
        };
        required: never[];
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            steps: {
                type: "array";
                items: {
                    type: "object";
                    properties: {
                        name: {
                            type: "string";
                            description: string;
                        };
                        mcp: {
                            type: "string";
                            description: string;
                        };
                        tool: {
                            type: "string";
                            description: string;
                        };
                        params: {
                            type: "object";
                            description: string;
                        };
                        dependsOn: {
                            type: "array";
                            items: {
                                type: "string";
                            };
                            description: string;
                        };
                    };
                    required: string[];
                };
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            workflow?: undefined;
            focus?: undefined;
            files?: undefined;
            projectPath?: undefined;
            language?: undefined;
            query?: undefined;
            category?: undefined;
            frequency?: undefined;
            server?: undefined;
            limit?: undefined;
            toolName?: undefined;
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
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            workflow?: undefined;
            focus?: undefined;
            files?: undefined;
            projectPath?: undefined;
            language?: undefined;
            steps?: undefined;
            query?: undefined;
            category?: undefined;
            frequency?: undefined;
            server?: undefined;
            limit?: undefined;
            toolName?: undefined;
        };
        required?: undefined;
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: "string";
                description: string;
            };
            category: {
                type: "string";
                enum: string[];
                description: string;
            };
            frequency: {
                type: "string";
                enum: string[];
                description: string;
            };
            server: {
                type: "string";
                description: string;
            };
            limit: {
                type: "number";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            workflow?: undefined;
            focus?: undefined;
            files?: undefined;
            projectPath?: undefined;
            language?: undefined;
            steps?: undefined;
            toolName?: undefined;
        };
        required?: undefined;
    };
    examples: ToolExample[];
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            toolName: {
                type: "string";
                description: string;
            };
            server: {
                type: "string";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            workflow?: undefined;
            focus?: undefined;
            files?: undefined;
            projectPath?: undefined;
            language?: undefined;
            steps?: undefined;
            query?: undefined;
            category?: undefined;
            frequency?: undefined;
            limit?: undefined;
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
            server: {
                type: "string";
                description: string;
            };
            response_format: {
                type: "string";
                enum: readonly ["minimal", "concise", "detailed"];
                default: string;
                description: string;
            };
            workflow?: undefined;
            focus?: undefined;
            files?: undefined;
            projectPath?: undefined;
            language?: undefined;
            steps?: undefined;
            query?: undefined;
            category?: undefined;
            frequency?: undefined;
            limit?: undefined;
            toolName?: undefined;
        };
        required?: undefined;
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map