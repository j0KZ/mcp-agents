/**
 * Gateway-aware Orchestrator
 *
 * Extends the standard orchestrator with Docker MCP Gateway capabilities:
 * - Dynamic tool discovery (reduces initial context)
 * - On-demand tool loading (only load what's needed)
 * - Code-mode execution (maximum token efficiency)
 */
import { GatewayConfig, ExecutionMode, GatewayWorkflowResult } from './types.js';
import { WorkflowName } from '../types.js';
/**
 * Gateway-aware Orchestrator
 *
 * Automatically selects the most efficient execution mode:
 * 1. code-mode (if available) - 95% token savings
 * 2. gateway (dynamic loading) - 75-90% token savings
 * 3. standard (stdio) - fallback, no savings
 */
export declare class GatewayOrchestrator {
    private client;
    private config;
    private executionMode;
    constructor(config?: Partial<GatewayConfig>);
    /**
     * Initialize orchestrator and detect best execution mode
     */
    initialize(): Promise<ExecutionMode>;
    /**
     * Get current execution mode
     */
    getExecutionMode(): ExecutionMode;
    /**
     * Run workflow with optimal token efficiency
     */
    runWorkflow(workflowName: WorkflowName, params: {
        files?: string[];
        projectPath?: string;
        reportPath?: string;
    }): Promise<GatewayWorkflowResult>;
    /**
     * Run workflow using code-mode (maximum efficiency)
     */
    private runWorkflowAsCode;
    /**
     * Run workflow using gateway (dynamic tool loading)
     */
    private runWorkflowWithGateway;
    /**
     * Run workflow using standard mode (fallback)
     */
    private runWorkflowStandard;
    /**
     * Execute individual workflow steps (for gateway mode)
     */
    private executeWorkflowSteps;
    /**
     * Find tools by query (delegates to client)
     */
    findTools(query: string): Promise<import("./types.js").ToolMetadata[]>;
    /**
     * Load specific tools (delegates to client)
     */
    loadTools(server: string, tools: string[]): Promise<void>;
    /**
     * Get token efficiency metrics
     */
    getMetrics(): {
        loadedTools: number;
        estimatedTokens: number;
        potentialSavings: number;
        executionMode: ExecutionMode;
    };
}
/**
 * Create orchestrator with automatic mode detection
 */
export declare function createOrchestrator(config?: Partial<GatewayConfig>): Promise<GatewayOrchestrator>;
//# sourceMappingURL=gateway-orchestrator.d.ts.map