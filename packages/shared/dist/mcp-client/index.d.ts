/**
 * MCP Client - Invoke other MCP tools via stdio
 * Enables MCP-to-MCP communication for workflow orchestration
 */
export interface MCPRequest {
    jsonrpc: '2.0';
    id?: number | string;
    method: string;
    params: {
        name: string;
        arguments: any;
    };
}
export interface MCPResponse {
    jsonrpc: '2.0';
    id?: number | string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}
/**
 * Client for invoking MCP tools via stdio
 */
export declare class MCPClient {
    private requestId;
    private defaultTimeout;
    /**
     * Invoke an MCP tool
     *
     * @param mcpName - Name of MCP (e.g., 'smart-reviewer')
     * @param toolName - Tool to call (e.g., 'review_file')
     * @param params - Tool parameters
     * @param timeout - Optional timeout in milliseconds
     * @returns Tool result
     */
    invoke(mcpName: string, toolName: string, params: any, timeout?: number): Promise<any>;
    /**
     * Resolve MCP binary path from package name
     */
    private resolveMCPBinary;
    /**
     * Read MCP response from stdout (with timeout)
     */
    private readResponse;
    /**
     * Check if an MCP is installed and available
     */
    isInstalled(mcpName: string): boolean;
    /**
     * Get list of available (installed) MCPs
     */
    getAvailableMCPs(): string[];
}
//# sourceMappingURL=index.d.ts.map