/**
 * Universal MCP Request Handler
 * Adds environment detection, logging, language support, and health checks
 * to any MCP server with minimal code
 */
import { EnvironmentDetector } from '../runtime/environment-detector.js';
import { HealthChecker } from '../health/health-checker.js';
import { EnhancedError } from '../errors/enhanced-error.js';
import { MCPError } from '../errors/error-codes.js';
import { matchToolName } from '../i18n/tool-matcher.js';
/**
 * Universal MCP Handler
 * Wraps tool handlers with logging, language support, and health checks
 */
export class UniversalMCPHandler {
    environment;
    healthChecker;
    config;
    toolHandlers = new Map();
    constructor(config) {
        this.config = {
            logRequests: true,
            supportLanguages: true,
            ...config,
        };
        this.environment = EnvironmentDetector.detect();
        this.healthChecker = new HealthChecker(config.serverName, config.version);
        // Log startup info
        this.logStartup();
    }
    /**
     * Log startup information
     */
    logStartup() {
        console.error('='.repeat(60));
        console.error(`${this.config.serverName} v${this.config.version}`);
        console.error(`IDE: ${this.environment.ide}${this.environment.ideVersion ? ' v' + this.environment.ideVersion : ''}`);
        console.error(`Locale: ${this.environment.locale}`);
        console.error(`Transport: ${this.environment.transport}`);
        console.error(`Project Root: ${this.environment.projectRoot || 'Not detected'}`);
        console.error('='.repeat(60));
    }
    /**
     * Register a tool handler
     */
    registerTool(canonicalName, handler) {
        this.toolHandlers.set(canonicalName, handler);
    }
    /**
     * Handle incoming tool request
     */
    async handleRequest(request) {
        const { name: requestedName, arguments: args } = request.params;
        // Log incoming request
        if (this.config.logRequests) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                event: 'tool_call',
                tool: requestedName,
                ide: this.environment.ide,
            }));
        }
        try {
            // Handle health check
            if (requestedName === '__health') {
                const health = await this.healthChecker.check(args?.verbose || false);
                return {
                    content: [
                        {
                            type: 'text',
                            text: HealthChecker.format(health),
                        },
                    ],
                };
            }
            // Match tool name (supports Spanish/English)
            let canonicalName = requestedName;
            if (this.config.supportLanguages) {
                const matched = matchToolName(requestedName);
                if (matched) {
                    canonicalName = matched;
                    if (canonicalName !== requestedName) {
                        console.error(JSON.stringify({
                            event: 'tool_name_translated',
                            from: requestedName,
                            to: canonicalName,
                        }));
                    }
                }
            }
            // Find handler
            const handler = this.toolHandlers.get(canonicalName);
            if (!handler) {
                throw new MCPError('REV_002', { tool: requestedName });
            }
            // Execute handler
            const context = {
                toolName: canonicalName,
                originalToolName: requestedName,
                args,
                environment: this.environment,
            };
            const result = await handler(args, context);
            return result;
        }
        catch (error) {
            // Log error
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                event: 'error',
                tool: requestedName,
                error: error instanceof Error ? error.message : String(error),
            }));
            // Enhanced error handling
            if (error instanceof MCPError) {
                const enhanced = EnhancedError.fromMCPError(error, {
                    tool: requestedName,
                    args: args,
                    environment: {
                        ide: this.environment.ide,
                        locale: this.environment.locale,
                    },
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(enhanced, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
            // Fallback error handling
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                            code: 'UNKNOWN',
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * Get environment info
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * Get health checker
     */
    getHealthChecker() {
        return this.healthChecker;
    }
}
//# sourceMappingURL=universal-handler.js.map