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

import { MCPClient } from './index.js';

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
 * Default configuration
 */
const DEFAULT_CONFIG: MCPConnectionConfig = {
  gatewayEndpoint: 'http://localhost:8811',
  preferGateway: true,
  timeout: 30000,
};

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
 * Docker Gateway Connection
 * Uses HTTP to communicate with Docker MCP Gateway
 */
class DockerGatewayConnection implements MCPConnection {
  readonly transport: TransportType = 'docker-gateway';
  private endpoint: string;
  private timeout: number;
  private callCount = 0;
  private totalDuration = 0;

  constructor(config: MCPConnectionConfig) {
    this.endpoint = config.gatewayEndpoint || DEFAULT_CONFIG.gatewayEndpoint!;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout!;
  }

  async invoke(mcpName: string, toolName: string, params: unknown): Promise<unknown> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.endpoint}/call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: `${mcpName}/${toolName}`,
          params,
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`Gateway error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      this.callCount++;
      this.totalDuration += Date.now() - startTime;

      return result;
    } catch (error) {
      throw new Error(
        `Gateway call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async isAvailable(mcpName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/servers/${mcpName}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getMetrics(): ConnectionMetrics {
    return {
      transport: this.transport,
      callCount: this.callCount,
      totalDuration: this.totalDuration,
      // Gateway saves ~200 tokens per tool definition not loaded
      estimatedTokensSaved: this.callCount * 180, // Conservative estimate
    };
  }
}

/**
 * Stdio Connection
 * Uses child process stdio to communicate with MCP servers
 */
class StdioConnection implements MCPConnection {
  readonly transport: TransportType = 'stdio';
  private client: MCPClient;
  private callCount = 0;
  private totalDuration = 0;

  constructor() {
    this.client = new MCPClient();
  }

  async invoke(mcpName: string, toolName: string, params: unknown): Promise<unknown> {
    const startTime = Date.now();
    const result = await this.client.invoke(mcpName, toolName, params);
    this.callCount++;
    this.totalDuration += Date.now() - startTime;
    return result;
  }

  async isAvailable(mcpName: string): Promise<boolean> {
    return this.client.isInstalled(mcpName);
  }

  getMetrics(): ConnectionMetrics {
    return {
      transport: this.transport,
      callCount: this.callCount,
      totalDuration: this.totalDuration,
      estimatedTokensSaved: 0, // No savings with stdio
    };
  }
}

/**
 * Check if Docker is available on the system
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if MCP Gateway is running
 */
export async function isGatewayRunning(
  endpoint = 'http://localhost:8811'
): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

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
export async function createMCPConnection(
  config: Partial<MCPConnectionConfig> = {}
): Promise<MCPConnection> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Try Docker Gateway first (if preferred)
  if (fullConfig.preferGateway) {
    const gatewayAvailable = await isGatewayRunning(fullConfig.gatewayEndpoint);

    if (gatewayAvailable) {
      console.info('Using Docker MCP Gateway (optimal token efficiency)');
      return new DockerGatewayConnection(fullConfig);
    }

    // Check if Docker is available but gateway not running
    const dockerAvailable = await isDockerAvailable();
    if (dockerAvailable) {
      console.warn(
        'Docker available but MCP Gateway not running. ' +
        'Start with: docker compose -f docker-compose.mcp.yml up -d'
      );
    }
  }

  // Fallback to stdio
  console.info('Using stdio transport (standard MCP)');
  return new StdioConnection();
}

/**
 * Get recommended transport based on environment
 */
export async function getRecommendedTransport(): Promise<{
  transport: TransportType;
  reason: string;
}> {
  const gatewayRunning = await isGatewayRunning();
  if (gatewayRunning) {
    return {
      transport: 'docker-gateway',
      reason: 'MCP Gateway running - optimal token efficiency',
    };
  }

  const dockerAvailable = await isDockerAvailable();
  if (dockerAvailable) {
    return {
      transport: 'stdio',
      reason: 'Docker available but gateway not running. Consider starting: docker compose -f docker-compose.mcp.yml up -d',
    };
  }

  return {
    transport: 'stdio',
    reason: 'Docker not available - using standard stdio transport',
  };
}
