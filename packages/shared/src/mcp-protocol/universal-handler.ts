/**
 * Universal MCP Request Handler
 * Adds environment detection, logging, language support, and health checks
 * to any MCP server with minimal code
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { EnvironmentDetector, RuntimeEnvironment } from '../runtime/environment-detector.js';
import { HealthChecker, HealthCheckResult } from '../health/health-checker.js';
import { EnhancedError } from '../errors/enhanced-error.js';
import { MCPError } from '../errors/error-codes.js';
import { matchToolName } from '../i18n/tool-matcher.js';

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
export class UniversalMCPHandler {
  private environment: RuntimeEnvironment;
  private healthChecker: HealthChecker;
  private config: UniversalHandlerConfig;
  private toolHandlers: Map<string, ToolHandler> = new Map();

  constructor(config: UniversalHandlerConfig) {
    this.config = {
      logRequests: true,
      supportLanguages: true,
      ...config
    };

    this.environment = EnvironmentDetector.detect();
    this.healthChecker = new HealthChecker(config.serverName, config.version);

    // Log startup info
    this.logStartup();
  }

  /**
   * Log startup information
   */
  private logStartup(): void {
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
  registerTool(canonicalName: string, handler: ToolHandler): void {
    this.toolHandlers.set(canonicalName, handler);
  }

  /**
   * Handle incoming tool request
   */
  async handleRequest(request: any): Promise<any> {
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
          content: [{
            type: 'text',
            text: HealthChecker.format(health),
          }],
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
      const context: RequestContext = {
        toolName: canonicalName,
        originalToolName: requestedName,
        args,
        environment: this.environment,
      };

      const result = await handler(args, context);
      return result;

    } catch (error) {
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
          content: [{
            type: 'text',
            text: JSON.stringify(enhanced, null, 2),
          }],
          isError: true,
        };
      }

      // Fallback error handling
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error),
            code: 'UNKNOWN',
            timestamp: new Date().toISOString(),
          }, null, 2),
        }],
        isError: true,
      };
    }
  }

  /**
   * Get environment info
   */
  getEnvironment(): RuntimeEnvironment {
    return this.environment;
  }

  /**
   * Get health checker
   */
  getHealthChecker(): HealthChecker {
    return this.healthChecker;
  }
}
