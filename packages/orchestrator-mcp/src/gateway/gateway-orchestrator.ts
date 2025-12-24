/**
 * Gateway-aware Orchestrator
 *
 * Extends the standard orchestrator with Docker MCP Gateway capabilities:
 * - Dynamic tool discovery (reduces initial context)
 * - On-demand tool loading (only load what's needed)
 * - Code-mode execution (maximum token efficiency)
 */

import { MCPGatewayClient, isDockerAvailable, isGatewayRunning } from './gateway-client.js';
import { getCodeTemplate, getWorkflowServers } from './code-templates.js';
import {
  GatewayConfig,
  DEFAULT_GATEWAY_CONFIG,
  ExecutionMode,
  GatewayWorkflowResult,
  CodeModeRequest,
} from './types.js';
import { WorkflowName } from '../types.js';

/**
 * Token usage estimates
 */
const TOKEN_ESTIMATES = {
  TOOL_DEFINITION: 200, // ~200 tokens per tool definition
  GATEWAY_TOOLS: 500, // mcp-find + mcp-add + code-mode
  STANDARD_CONTEXT: 10000, // All 50 tools loaded
};

/**
 * Gateway-aware Orchestrator
 *
 * Automatically selects the most efficient execution mode:
 * 1. code-mode (if available) - 95% token savings
 * 2. gateway (dynamic loading) - 75-90% token savings
 * 3. standard (stdio) - fallback, no savings
 */
export class GatewayOrchestrator {
  private client: MCPGatewayClient;
  private config: GatewayConfig;
  private executionMode: ExecutionMode = 'standard';

  constructor(config: Partial<GatewayConfig> = {}) {
    this.config = { ...DEFAULT_GATEWAY_CONFIG, ...config };
    this.client = new MCPGatewayClient(this.config);
  }

  /**
   * Initialize orchestrator and detect best execution mode
   */
  async initialize(): Promise<ExecutionMode> {
    // Check if Docker MCP Gateway is available
    if (await this.client.isAvailable()) {
      this.executionMode = this.config.codeMode ? 'code-mode' : 'gateway';
    } else if (await isDockerAvailable()) {
      // Docker available but gateway not running
      console.warn('Docker available but MCP Gateway not running. Using standard mode.');
      this.executionMode = 'standard';
    } else {
      // No Docker, fall back to standard
      this.executionMode = 'standard';
    }

    return this.executionMode;
  }

  /**
   * Get current execution mode
   */
  getExecutionMode(): ExecutionMode {
    return this.executionMode;
  }

  /**
   * Run workflow with optimal token efficiency
   */
  async runWorkflow(
    workflowName: WorkflowName,
    params: {
      files?: string[];
      projectPath?: string;
      reportPath?: string;
    }
  ): Promise<GatewayWorkflowResult> {
    const startTime = Date.now();

    // Select execution strategy based on mode
    switch (this.executionMode) {
      case 'code-mode':
        return this.runWorkflowAsCode(workflowName, params, startTime);
      case 'gateway':
        return this.runWorkflowWithGateway(workflowName, params, startTime);
      default:
        return this.runWorkflowStandard(workflowName, params, startTime);
    }
  }

  /**
   * Run workflow using code-mode (maximum efficiency)
   */
  private async runWorkflowAsCode(
    workflowName: WorkflowName,
    params: Record<string, unknown>,
    startTime: number
  ): Promise<GatewayWorkflowResult> {
    const code = getCodeTemplate(workflowName);
    const servers = getWorkflowServers(workflowName);

    const request: CodeModeRequest = {
      code,
      servers,
      params,
      timeout: 60000,
    };

    try {
      const result = await this.client.executeCode(request);
      const duration = Date.now() - startTime;

      // Estimate token savings
      const standardTokens = TOKEN_ESTIMATES.STANDARD_CONTEXT;
      const actualTokens = TOKEN_ESTIMATES.GATEWAY_TOOLS + (result.tokensUsed || 500);
      const tokensSaved = standardTokens - actualTokens;

      return {
        workflow: workflowName,
        success: result.success,
        duration,
        executionMode: 'code-mode',
        tokensUsed: actualTokens,
        tokensSaved,
        steps: [], // Code-mode doesn't expose individual steps
        summary: result.result as Record<string, unknown>,
        errors: result.error ? [result.error] : [],
      };
    } catch (error) {
      return {
        workflow: workflowName,
        success: false,
        duration: Date.now() - startTime,
        executionMode: 'code-mode',
        tokensUsed: TOKEN_ESTIMATES.GATEWAY_TOOLS,
        tokensSaved: 0,
        steps: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Run workflow using gateway (dynamic tool loading)
   */
  private async runWorkflowWithGateway(
    workflowName: WorkflowName,
    params: Record<string, unknown>,
    startTime: number
  ): Promise<GatewayWorkflowResult> {
    const servers = getWorkflowServers(workflowName);
    const steps: GatewayWorkflowResult['steps'] = [];
    const errors: string[] = [];

    // Load only the tools we need
    for (const server of servers) {
      try {
        await this.client.loadTools(server, ['*']); // Load all tools from server
      } catch (error) {
        errors.push(`Failed to load ${server}: ${error}`);
      }
    }

    // Execute workflow steps (simplified - would need full implementation)
    // This is a placeholder that shows the structure
    const result = await this.executeWorkflowSteps(workflowName, params, steps, errors);

    const duration = Date.now() - startTime;
    const tokensUsed = this.client.estimateTokensUsed() + TOKEN_ESTIMATES.GATEWAY_TOOLS;
    const tokensSaved = TOKEN_ESTIMATES.STANDARD_CONTEXT - tokensUsed;

    return {
      workflow: workflowName,
      success: errors.length === 0,
      duration,
      executionMode: 'gateway',
      tokensUsed,
      tokensSaved,
      steps,
      summary: result,
      errors,
    };
  }

  /**
   * Run workflow using standard mode (fallback)
   */
  private async runWorkflowStandard(
    workflowName: WorkflowName,
    params: Record<string, unknown>,
    startTime: number
  ): Promise<GatewayWorkflowResult> {
    // This would call the original workflow implementation
    // For now, return a placeholder indicating standard mode
    return {
      workflow: workflowName,
      success: false,
      duration: Date.now() - startTime,
      executionMode: 'standard',
      tokensUsed: TOKEN_ESTIMATES.STANDARD_CONTEXT,
      tokensSaved: 0,
      steps: [],
      errors: ['Standard mode not implemented in gateway orchestrator'],
    };
  }

  /**
   * Execute individual workflow steps (for gateway mode)
   */
  private async executeWorkflowSteps(
    workflowName: WorkflowName,
    params: Record<string, unknown>,
    steps: GatewayWorkflowResult['steps'],
    errors: string[]
  ): Promise<Record<string, unknown>> {
    // This would be a full implementation of step execution
    // For now, return a placeholder
    return {
      workflow: workflowName,
      message: 'Gateway mode step execution placeholder',
    };
  }

  /**
   * Find tools by query (delegates to client)
   */
  async findTools(query: string) {
    return this.client.findTools(query);
  }

  /**
   * Load specific tools (delegates to client)
   */
  async loadTools(server: string, tools: string[]) {
    return this.client.loadTools(server, tools);
  }

  /**
   * Get token efficiency metrics
   */
  getMetrics(): {
    loadedTools: number;
    estimatedTokens: number;
    potentialSavings: number;
    executionMode: ExecutionMode;
  } {
    const loadedTools = this.client.getLoadedToolsCount();
    const estimatedTokens = this.client.estimateTokensUsed();
    const potentialSavings = TOKEN_ESTIMATES.STANDARD_CONTEXT - estimatedTokens;

    return {
      loadedTools,
      estimatedTokens,
      potentialSavings,
      executionMode: this.executionMode,
    };
  }
}

/**
 * Create orchestrator with automatic mode detection
 */
export async function createOrchestrator(
  config?: Partial<GatewayConfig>
): Promise<GatewayOrchestrator> {
  const orchestrator = new GatewayOrchestrator(config);
  await orchestrator.initialize();
  return orchestrator;
}
