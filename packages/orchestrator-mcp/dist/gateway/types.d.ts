/**
 * Type definitions for Docker MCP Gateway integration
 */
/**
 * Gateway configuration options
 */
export interface GatewayConfig {
    /** Gateway endpoint URL (default: http://localhost:8811) */
    endpoint: string;
    /** Enable dynamic tool discovery */
    dynamicDiscovery: boolean;
    /** Enable code-mode for sandbox execution */
    codeMode: boolean;
    /** Default response format for tools */
    defaultResponseFormat: 'minimal' | 'concise' | 'detailed';
}
/**
 * Default gateway configuration
 */
export declare const DEFAULT_GATEWAY_CONFIG: GatewayConfig;
/**
 * Tool metadata from gateway discovery
 */
export interface ToolMetadata {
    name: string;
    server: string;
    description?: string;
    categories: string[];
    inputSchema?: Record<string, unknown>;
}
/**
 * Server metadata from gateway
 */
export interface ServerMetadata {
    name: string;
    transport: 'docker' | 'stdio' | 'sse';
    container?: string;
    autoLoad: boolean;
    categories: string[];
    tools: string[];
}
/**
 * Code-mode execution request
 */
export interface CodeModeRequest {
    /** JavaScript code to execute in sandbox */
    code: string;
    /** Servers to make available in sandbox */
    servers: string[];
    /** Parameters to pass to code */
    params?: Record<string, unknown>;
    /** Timeout in milliseconds */
    timeout?: number;
}
/**
 * Code-mode execution result
 */
export interface CodeModeResult {
    success: boolean;
    result?: unknown;
    error?: string;
    executionTime: number;
    tokensUsed?: number;
}
/**
 * Gateway tool call request
 */
export interface GatewayToolCall {
    server: string;
    tool: string;
    params: Record<string, unknown>;
}
/**
 * Gateway tool call response
 */
export interface GatewayToolResponse {
    success: boolean;
    result?: unknown;
    error?: string;
}
/**
 * Workflow execution mode
 */
export type ExecutionMode = 'standard' | 'gateway' | 'code-mode';
/**
 * Gateway-aware workflow result
 */
export interface GatewayWorkflowResult {
    workflow: string;
    success: boolean;
    duration: number;
    executionMode: ExecutionMode;
    tokensUsed: number;
    tokensSaved: number;
    steps: GatewayStepResult[];
    summary?: Record<string, unknown>;
    errors: string[];
}
/**
 * Gateway-aware step result
 */
export interface GatewayStepResult {
    name: string;
    server: string;
    tool: string;
    success: boolean;
    duration: number;
    tokensUsed?: number;
    data?: unknown;
    error?: string;
}
//# sourceMappingURL=types.d.ts.map