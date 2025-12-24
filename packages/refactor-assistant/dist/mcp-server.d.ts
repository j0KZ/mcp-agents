#!/usr/bin/env node
/**
 * MCP Server for Refactoring Assistant
 *
 * Provides tools for intelligent code refactoring through the Model Context Protocol
 */
/**
 * MCP Tool definitions - imported from constants for maintainability
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
export declare const TOOLS: ({
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
//# sourceMappingURL=mcp-server.d.ts.map