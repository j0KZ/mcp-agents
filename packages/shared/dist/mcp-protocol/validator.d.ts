/**
 * MCP Protocol Validation Layer
 * Ensures all MCP tools comply with protocol specifications
 */
/**
 * MCP Tool Schema definition based on Model Context Protocol spec
 */
export declare const MCPToolSchema: any;
/**
 * MCP Request Schema
 */
export declare const MCPRequestSchema: any;
/**
 * MCP Response Schema
 */
export declare const MCPResponseSchema: any;
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