/**
 * Docker MCP Gateway Client
 *
 * Provides communication with Docker MCP Gateway for:
 * - Dynamic tool discovery (mcp-find)
 * - On-demand tool loading (mcp-add)
 * - Code-mode sandbox execution
 */
import { DEFAULT_GATEWAY_CONFIG, } from './types.js';
/**
 * MCP Gateway Client for Docker MCP integration
 */
export class MCPGatewayClient {
    config;
    loadedTools = new Set();
    serverCache = new Map();
    constructor(config = {}) {
        this.config = { ...DEFAULT_GATEWAY_CONFIG, ...config };
    }
    /**
     * Check if gateway is available
     */
    async isAvailable() {
        try {
            const response = await fetch(`${this.config.endpoint}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Find tools by query (mcp-find)
     * Does NOT load tools into context - just searches
     */
    async findTools(query) {
        const response = await this.callGateway('mcp-find', { query });
        if (!response.success) {
            throw new Error(`Tool search failed: ${response.error}`);
        }
        return response.result;
    }
    /**
     * Load specific tools into context (mcp-add)
     * Only loads tools that haven't been loaded yet
     */
    async loadTools(server, tools) {
        const toolsToLoad = tools.filter((tool) => !this.loadedTools.has(`${server}:${tool}`));
        if (toolsToLoad.length === 0) {
            return; // All tools already loaded
        }
        const response = await this.callGateway('mcp-add', {
            server,
            tools: toolsToLoad,
        });
        if (!response.success) {
            throw new Error(`Failed to load tools: ${response.error}`);
        }
        // Mark tools as loaded
        for (const tool of toolsToLoad) {
            this.loadedTools.add(`${server}:${tool}`);
        }
    }
    /**
     * Execute code in sandbox (code-mode)
     * Maximum token efficiency - only results return to context
     */
    async executeCode(request) {
        const response = await this.callGateway('code-mode', {
            code: request.code,
            servers: request.servers,
            params: request.params || {},
            timeout: request.timeout || 30000,
            sandbox: true,
        });
        return {
            success: response.success,
            result: response.result,
            error: response.error,
            executionTime: 0, // Gateway should return this
            tokensUsed: 0, // Gateway should return this
        };
    }
    /**
     * Call a tool directly through gateway
     */
    async callTool(call) {
        // Ensure tool is loaded
        await this.loadTools(call.server, [call.tool]);
        return this.callGateway(`${call.server}/${call.tool}`, call.params);
    }
    /**
     * List all available servers
     */
    async listServers() {
        const response = await this.callGateway('mcp-list-servers', {});
        if (!response.success) {
            throw new Error(`Failed to list servers: ${response.error}`);
        }
        const servers = response.result;
        // Cache server metadata
        for (const server of servers) {
            this.serverCache.set(server.name, server);
        }
        return servers;
    }
    /**
     * Get loaded tools count (for token estimation)
     */
    getLoadedToolsCount() {
        return this.loadedTools.size;
    }
    /**
     * Estimate tokens used by loaded tools
     * ~200 tokens per tool definition
     */
    estimateTokensUsed() {
        return this.loadedTools.size * 200;
    }
    /**
     * Clear loaded tools (reset context)
     */
    clearLoadedTools() {
        this.loadedTools.clear();
    }
    /**
     * Internal: Call gateway endpoint
     */
    async callGateway(endpoint, params) {
        try {
            const response = await fetch(`${this.config.endpoint}/call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tool: endpoint,
                    params,
                }),
                signal: AbortSignal.timeout(60000),
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `Gateway returned ${response.status}: ${response.statusText}`,
                };
            }
            const result = await response.json();
            return {
                success: true,
                result,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
/**
 * Check if Docker is available on the system
 */
export async function isDockerAvailable() {
    try {
        const { execSync } = await import('child_process');
        execSync('docker --version', { stdio: 'ignore' });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Check if MCP Gateway is running
 */
export async function isGatewayRunning(endpoint = 'http://localhost:8811') {
    const client = new MCPGatewayClient({ endpoint });
    return client.isAvailable();
}
//# sourceMappingURL=gateway-client.js.map