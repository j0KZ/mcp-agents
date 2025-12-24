/**
 * Docker MCP Gateway Client
 *
 * Provides communication with Docker MCP Gateway for:
 * - Dynamic tool discovery (mcp-find)
 * - On-demand tool loading (mcp-add)
 * - Code-mode sandbox execution
 */
import { GatewayConfig, ToolMetadata, ServerMetadata, CodeModeRequest, CodeModeResult, GatewayToolCall, GatewayToolResponse } from './types.js';
/**
 * MCP Gateway Client for Docker MCP integration
 */
export declare class MCPGatewayClient {
    private config;
    private loadedTools;
    private serverCache;
    constructor(config?: Partial<GatewayConfig>);
    /**
     * Check if gateway is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Find tools by query (mcp-find)
     * Does NOT load tools into context - just searches
     */
    findTools(query: string): Promise<ToolMetadata[]>;
    /**
     * Load specific tools into context (mcp-add)
     * Only loads tools that haven't been loaded yet
     */
    loadTools(server: string, tools: string[]): Promise<void>;
    /**
     * Execute code in sandbox (code-mode)
     * Maximum token efficiency - only results return to context
     */
    executeCode(request: CodeModeRequest): Promise<CodeModeResult>;
    /**
     * Call a tool directly through gateway
     */
    callTool(call: GatewayToolCall): Promise<GatewayToolResponse>;
    /**
     * List all available servers
     */
    listServers(): Promise<ServerMetadata[]>;
    /**
     * Get loaded tools count (for token estimation)
     */
    getLoadedToolsCount(): number;
    /**
     * Estimate tokens used by loaded tools
     * ~200 tokens per tool definition
     */
    estimateTokensUsed(): number;
    /**
     * Clear loaded tools (reset context)
     */
    clearLoadedTools(): void;
    /**
     * Internal: Call gateway endpoint
     */
    private callGateway;
}
/**
 * Check if Docker is available on the system
 */
export declare function isDockerAvailable(): Promise<boolean>;
/**
 * Check if MCP Gateway is running
 */
export declare function isGatewayRunning(endpoint?: string): Promise<boolean>;
//# sourceMappingURL=gateway-client.d.ts.map