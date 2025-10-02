/**
 * Inter-MCP integration and communication layer
 * Enables MCPs to work together seamlessly
 */
import { MCPResult, PipelineStep, PipelineResult, MCPConfig } from '../types/index.js';
/**
 * MCP Pipeline - orchestrates multiple MCP tools
 */
export declare class MCPPipeline {
    private steps;
    private results;
    private performance;
    /**
     * Add a step to the pipeline
     */
    addStep(step: PipelineStep): this;
    /**
     * Execute the pipeline
     */
    execute(): Promise<PipelineResult>;
    /**
     * Execute a single step
     */
    private executeStep;
    /**
     * Get result from a specific step
     */
    getResult(stepName: string): MCPResult | undefined;
    /**
     * Get all results
     */
    getAllResults(): Map<string, MCPResult>;
    /**
     * Clear pipeline
     */
    clear(): void;
}
/**
 * MCP Integration Manager - manages MCP tool interactions
 */
export declare class MCPIntegration {
    private tools;
    private cache;
    /**
     * Register an MCP tool
     */
    registerTool(name: string, tool: any): void;
    /**
     * Get registered tool
     */
    getTool(name: string): any;
    /**
     * Execute multiple MCPs in sequence
     */
    sequence(steps: Array<{
        tool: string;
        method: string;
        args: any[];
    }>): Promise<any[]>;
    /**
     * Execute multiple MCPs in parallel
     */
    parallel(steps: Array<{
        tool: string;
        method: string;
        args: any[];
    }>): Promise<any[]>;
    /**
     * Chain MCP operations - output of one becomes input of next
     */
    chain(initialInput: any, operations: Array<{
        tool: string;
        method: string;
        transform?: (result: any) => any;
    }>): Promise<any>;
    /**
     * Cache result from MCP operation
     */
    cacheResult(key: string, value: any, ttl?: number): void;
    /**
     * Get cached result
     */
    getCachedResult(key: string): any | null;
    /**
     * Clear cache
     */
    clearCache(): void;
}
/**
 * Create a workflow that combines multiple MCPs
 */
export declare class MCPWorkflow {
    private name;
    private steps;
    constructor(name: string);
    /**
     * Add a step to the workflow
     */
    step(name: string, tool: string, action: string, config?: MCPConfig, condition?: (results: any) => boolean): this;
    /**
     * Execute the workflow
     */
    run(integration: MCPIntegration, initialData: any): Promise<any>;
    /**
     * Get workflow definition
     */
    getDefinition(): any;
}
/**
 * Event bus for MCP communication
 */
export declare class MCPEventBus {
    private listeners;
    /**
     * Subscribe to an event
     */
    on(event: string, callback: Function): () => void;
    /**
     * Emit an event
     */
    emit(event: string, data: any): void;
    /**
     * Subscribe to event once
     */
    once(event: string, callback: Function): void;
    /**
     * Remove all listeners for an event
     */
    off(event: string): void;
    /**
     * Clear all listeners
     */
    clear(): void;
    /**
     * Get listener count for event
     */
    listenerCount(event: string): number;
}
//# sourceMappingURL=index.d.ts.map