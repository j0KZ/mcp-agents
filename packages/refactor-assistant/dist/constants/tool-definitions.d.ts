/**
 * Refactor Assistant - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
import { ToolExample } from '@j0kz/shared';
export declare const EXTRACT_FUNCTION_EXAMPLES: ToolExample[];
export declare const CONVERT_TO_ASYNC_EXAMPLES: ToolExample[];
export declare const SIMPLIFY_CONDITIONALS_EXAMPLES: ToolExample[];
export declare const REMOVE_DEAD_CODE_EXAMPLES: ToolExample[];
export declare const APPLY_PATTERN_EXAMPLES: ToolExample[];
export declare const RENAME_VARIABLE_EXAMPLES: ToolExample[];
export declare const SUGGEST_REFACTORINGS_EXAMPLES: ToolExample[];
export declare const CALCULATE_METRICS_EXAMPLES: ToolExample[];
export declare const REFACTOR_ASSISTANT_TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            code: {
                type: "string";
                description: string;
            };
            functionName: {
                type: "string";
                description: string;
            };
            startLine: {
                type: "number";
                description: string;
            };
            endLine: {
                type: "number";
                description: string;
            };
            async: {
                type: "boolean";
                description: string;
            };
            arrow: {
                type: "boolean";
                description: string;
            };
            response_format: any;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            useTryCatch: {
                type: "boolean";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            useGuardClauses: {
                type: "boolean";
                description: string;
            };
            useTernary: {
                type: "boolean";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            removeUnusedImports: {
                type: "boolean";
                description: string;
            };
            removeUnreachable: {
                type: "boolean";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            pattern: {
                type: "string";
                enum: string[];
                description: string;
            };
            patternOptions: {
                type: "object";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            oldName: {
                type: "string";
                description: string;
            };
            newName: {
                type: "string";
                description: string;
            };
            includeComments: {
                type: "boolean";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            filePath?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            filePath: {
                type: "string";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
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
            code: {
                type: "string";
                description: string;
            };
            response_format: any;
            functionName?: undefined;
            startLine?: undefined;
            endLine?: undefined;
            async?: undefined;
            arrow?: undefined;
            useTryCatch?: undefined;
            useGuardClauses?: undefined;
            useTernary?: undefined;
            removeUnusedImports?: undefined;
            removeUnreachable?: undefined;
            pattern?: undefined;
            patternOptions?: undefined;
            oldName?: undefined;
            newName?: undefined;
            includeComments?: undefined;
            filePath?: undefined;
        };
        required: string[];
    };
    examples: ToolExample[];
})[];
//# sourceMappingURL=tool-definitions.d.ts.map