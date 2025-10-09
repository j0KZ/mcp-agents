/**
 * Universal MCP Request Handler
 * Adds environment detection, logging, language support, and health checks
 * to any MCP server with minimal code
 */
import { RuntimeEnvironment } from '../runtime/environment-detector.js';
import { HealthChecker } from '../health/health-checker.js';
export interface UniversalHandlerConfig {
    serverName: string;
    version: string;
    logRequests?: boolean;
    supportLanguages?: boolean;
}
export interface ToolHandler {
    (args: any, context: RequestContext): Promise<any>;
}
export interface RequestContext {
    toolName: string;
    originalToolName: string;
    args: any;
    environment: RuntimeEnvironment;
}
/**
 * Universal MCP Handler
 * Wraps tool handlers with logging, language support, and health checks
 */
export declare class UniversalMCPHandler {
    private environment;
    private healthChecker;
    private config;
    private toolHandlers;
    constructor(config: UniversalHandlerConfig);
    /**
     * Log startup information
     */
    private logStartup;
    /**
     * Register a tool handler
     */
    registerTool(canonicalName: string, handler: ToolHandler): void;
    /**
     * Handle incoming tool request
     */
    handleRequest(request: any): Promise<any>;
    /**
     * Get environment info
     */
    getEnvironment(): RuntimeEnvironment;
    /**
     * Get health checker
     */
    getHealthChecker(): HealthChecker;
}
//# sourceMappingURL=universal-handler.d.ts.map