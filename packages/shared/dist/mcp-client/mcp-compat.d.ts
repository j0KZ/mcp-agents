/**
 * MCP Compatibility Layer
 *
 * Provides automatic transport selection between:
 * 1. Docker MCP Gateway (optimal - 95% token savings)
 * 2. Stdio transport (fallback - standard MCP)
 *
 * Usage:
 * ```typescript
 * import { createMCPConnection } from '@j0kz/shared';
 *
 * const connection = await createMCPConnection();
 * const result = await connection.invoke('smart-reviewer', 'review_file', { filePath: 'src/index.ts' });
 * ```
 */
/**
 * Connection configuration
 */
export interface MCPConnectionConfig {
    /** Gateway endpoint (default: http://localhost:8811) */
    gatewayEndpoint?: string;
    /** Prefer Docker gateway when available */
    preferGateway?: boolean;
    /** Request timeout in milliseconds */
    timeout?: number;
}
/**
 * Transport type
 */
export type TransportType = 'docker-gateway' | 'stdio';
/**
 * Abstract MCP connection interface
 */
export interface MCPConnection {
    /** Transport type being used */
    readonly transport: TransportType;
    /** Invoke an MCP tool */
    invoke(mcpName: string, toolName: string, params: unknown): Promise<unknown>;
    /** Check if a specific MCP is available */
    isAvailable(mcpName: string): Promise<boolean>;
    /** Get connection metrics */
    getMetrics(): ConnectionMetrics;
}
/**
 * Connection metrics
 */
export interface ConnectionMetrics {
    transport: TransportType;
    callCount: number;
    totalDuration: number;
    estimatedTokensSaved: number;
}
/**
 * Check if Docker is available on the system
 */
export declare function isDockerAvailable(): Promise<boolean>;
/**
 * Check if MCP Gateway is running
 */
export declare function isGatewayRunning(endpoint?: string): Promise<boolean>;
/**
 * Create MCP connection with automatic transport selection
 *
 * Selection priority:
 * 1. Docker MCP Gateway (if running)
 * 2. Stdio transport (fallback)
 *
 * @param config - Connection configuration
 * @returns MCP connection instance
 */
export declare function createMCPConnection(config?: Partial<MCPConnectionConfig>): Promise<MCPConnection>;
/**
 * Get recommended transport based on environment
 */
export declare function getRecommendedTransport(): Promise<{
    transport: TransportType;
    reason: string;
}>;
//# sourceMappingURL=mcp-compat.d.ts.map