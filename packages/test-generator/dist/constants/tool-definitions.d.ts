/**
 * Test Generator - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
import { ToolExample } from '@j0kz/shared';
export declare const GENERATE_TESTS_EXAMPLES: ToolExample[];
export declare const GENERATE_TESTS_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceFile: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
                properties: {
                    framework: {
                        type: "string";
                        enum: string[];
                        description: string;
                    };
                    coverage: {
                        type: "number";
                        description: string;
                    };
                    includeEdgeCases: {
                        type: "boolean";
                        description: string;
                    };
                    includeErrorCases: {
                        type: "boolean";
                        description: string;
                    };
                };
            };
            response_format: any;
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const WRITE_TEST_FILE_EXAMPLES: ToolExample[];
export declare const WRITE_TEST_FILE_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceFile: {
                type: "string";
                description: string;
            };
            testFile: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
            };
            response_format: any;
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const BATCH_GENERATE_EXAMPLES: ToolExample[];
export declare const BATCH_GENERATE_DEFINITION: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceFiles: {
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
            response_format: any;
        };
        required: string[];
    };
    examples: ToolExample[];
};
export declare const TEST_GENERATOR_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            sourceFile: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
                properties: {
                    framework: {
                        type: "string";
                        enum: string[];
                        description: string;
                    };
                    coverage: {
                        type: "number";
                        description: string;
                    };
                    includeEdgeCases: {
                        type: "boolean";
                        description: string;
                    };
                    includeErrorCases: {
                        type: "boolean";
                        description: string;
                    };
                };
            };
            response_format: any;
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
            sourceFile: {
                type: "string";
                description: string;
            };
            testFile: {
                type: "string";
                description: string;
            };
            config: {
                type: "object";
                description: string;
            };
            response_format: any;
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
            sourceFiles: {
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
            response_format: any;
        };
        required: string[];
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map