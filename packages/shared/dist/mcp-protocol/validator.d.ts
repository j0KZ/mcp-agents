/**
 * MCP Protocol Validation Layer
 * Ensures all MCP tools comply with protocol specifications
 */
import { z } from 'zod';
/**
 * MCP Tool Schema definition based on Model Context Protocol spec
 */
export declare const MCPToolSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    inputSchema: z.ZodObject<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
        required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        additionalProperties: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
        additionalProperties?: boolean | undefined;
    }, {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
        additionalProperties?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
        additionalProperties?: boolean | undefined;
    };
}, {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
        additionalProperties?: boolean | undefined;
    };
}>;
/**
 * MCP Request Schema
 */
export declare const MCPRequestSchema: z.ZodObject<{
    jsonrpc: z.ZodLiteral<"2.0">;
    method: z.ZodString;
    params: z.ZodObject<{
        name: z.ZodString;
        arguments: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        arguments?: Record<string, any> | undefined;
    }, {
        name: string;
        arguments?: Record<string, any> | undefined;
    }>;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
}, "strip", z.ZodTypeAny, {
    params: {
        name: string;
        arguments?: Record<string, any> | undefined;
    };
    jsonrpc: "2.0";
    method: string;
    id: string | number;
}, {
    params: {
        name: string;
        arguments?: Record<string, any> | undefined;
    };
    jsonrpc: "2.0";
    method: string;
    id: string | number;
}>;
/**
 * MCP Response Schema
 */
export declare const MCPResponseSchema: z.ZodObject<{
    jsonrpc: z.ZodLiteral<"2.0">;
    result: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodObject<{
        code: z.ZodNumber;
        message: z.ZodString;
        data: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        code: number;
        message: string;
        data?: any;
    }, {
        code: number;
        message: string;
        data?: any;
    }>>;
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
}, "strip", z.ZodTypeAny, {
    jsonrpc: "2.0";
    id: string | number;
    error?: {
        code: number;
        message: string;
        data?: any;
    } | undefined;
    result?: any;
}, {
    jsonrpc: "2.0";
    id: string | number;
    error?: {
        code: number;
        message: string;
        data?: any;
    } | undefined;
    result?: any;
}>;
export interface MCPValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
}
export interface MCPToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
        additionalProperties?: boolean;
    };
}
export interface MCPProtocolRequest {
    jsonrpc: '2.0';
    method: string;
    params: {
        name: string;
        arguments?: Record<string, any>;
    };
    id: string | number;
}
export interface MCPProtocolResponse {
    jsonrpc: '2.0';
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: string | number;
}
/**
 * MCP Protocol Validator
 * Validates tools, requests, and responses against MCP specification
 */
export declare class MCPProtocolValidator {
    private knownTools;
    /**
     * Register a tool for validation
     */
    registerTool(tool: MCPToolDefinition): MCPValidationResult;
    /**
     * Validate a tool definition against MCP schema
     */
    validateToolSchema(tool: unknown): MCPValidationResult;
    /**
     * Validate an MCP request
     */
    validateRequest(request: unknown): MCPValidationResult;
    /**
     * Validate arguments against a tool's input schema
     */
    private validateArguments;
    /**
     * Validate a value against a type schema
     */
    private validateType;
    /**
     * Validate an MCP response
     */
    validateResponse(response: unknown, requestId?: string | number): MCPValidationResult;
    /**
     * Get all registered tools
     */
    getRegisteredTools(): MCPToolDefinition[];
    /**
     * Clear all registered tools
     */
    clearTools(): void;
}
//# sourceMappingURL=validator.d.ts.map