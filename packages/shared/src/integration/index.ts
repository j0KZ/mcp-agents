/**
 * Inter-MCP integration and communication layer
 * Enables MCPs to work together seamlessly
 */

import { MCPResult, PipelineStep, PipelineResult, MCPConfig } from '../types/index.js';
import { PerformanceMonitor } from '../performance/index.js';
import { MCPClient } from '../mcp-client/index.js';

/**
 * MCP Pipeline - orchestrates multiple MCP tools
 */
export class MCPPipeline {
  private steps: PipelineStep[] = [];
  private results: Map<string, MCPResult> = new Map();
  private performance: PerformanceMonitor = new PerformanceMonitor();
  private mcpClient: MCPClient = new MCPClient();

  /**
   * Add a step to the pipeline
   */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Execute the pipeline
   */
  async execute(): Promise<PipelineResult> {
    this.performance.start();
    const stepResults: PipelineResult['steps'] = [];
    const errors: string[] = [];

    for (const step of this.steps) {
      // Check dependencies
      if (step.dependsOn) {
        const missingDeps = step.dependsOn.filter(dep => !this.results.has(dep));
        if (missingDeps.length > 0) {
          const error = `Step "${step.name}" missing dependencies: ${missingDeps.join(', ')}`;
          errors.push(error);
          continue;
        }
      }

      // Execute step
      const stepStart = Date.now();
      this.performance.mark(`step-${step.name}-start`);

      try {
        const result = await this.executeStep(step);
        this.results.set(step.name, result);

        stepResults.push({
          name: step.name,
          tool: step.tool,
          result,
          duration: Date.now() - stepStart,
        });

        this.performance.mark(`step-${step.name}-end`);
      } catch (error) {
        errors.push(`Step "${step.name}" failed: ${(error as Error).message}`);
      }
    }

    const metrics = this.performance.stop();

    return {
      steps: stepResults,
      totalDuration: metrics.duration,
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * Execute a single step - NOW CALLS REAL MCPs
   */
  private async executeStep(step: PipelineStep): Promise<MCPResult> {
    // Get input from previous steps
    let input = step.input;
    if (step.dependsOn && step.dependsOn.length > 0) {
      input = step.dependsOn.map(dep => this.results.get(dep)?.data);
    }

    try {
      // Invoke actual MCP via stdio
      const action = step.config.action || 'execute';
      const params = input || step.config.params || {};

      const data = await this.mcpClient.invoke(step.tool, action, params);

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get result from a specific step
   */
  getResult(stepName: string): MCPResult | undefined {
    return this.results.get(stepName);
  }

  /**
   * Get all results
   */
  getAllResults(): Map<string, MCPResult> {
    return this.results;
  }

  /**
   * Clear pipeline
   */
  clear(): void {
    this.steps = [];
    this.results.clear();
    this.performance.reset();
  }
}

/**
 * MCP Integration Manager - manages MCP tool interactions
 */
export class MCPIntegration {
  private tools: Map<string, any> = new Map();
  private cache: Map<string, any> = new Map();

  /**
   * Register an MCP tool
   */
  registerTool(name: string, tool: any): void {
    this.tools.set(name, tool);
  }

  /**
   * Get registered tool
   */
  getTool(name: string): any {
    return this.tools.get(name);
  }

  /**
   * Execute multiple MCPs in sequence
   */
  async sequence(steps: Array<{ tool: string; method: string; args: any[] }>): Promise<any[]> {
    const results: any[] = [];

    for (const step of steps) {
      const tool = this.getTool(step.tool);
      if (!tool) {
        throw new Error(`Tool "${step.tool}" not registered`);
      }

      const result = await tool[step.method](...step.args);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute multiple MCPs in parallel
   */
  async parallel(steps: Array<{ tool: string; method: string; args: any[] }>): Promise<any[]> {
    const promises = steps.map(async step => {
      const tool = this.getTool(step.tool);
      if (!tool) {
        throw new Error(`Tool "${step.tool}" not registered`);
      }
      return tool[step.method](...step.args);
    });

    return Promise.all(promises);
  }

  /**
   * Chain MCP operations - output of one becomes input of next
   */
  async chain(
    initialInput: any,
    operations: Array<{ tool: string; method: string; transform?: (result: any) => any }>
  ): Promise<any> {
    let result = initialInput;

    for (const op of operations) {
      const tool = this.getTool(op.tool);
      if (!tool) {
        throw new Error(`Tool "${op.tool}" not registered`);
      }

      result = await tool[op.method](result);

      if (op.transform) {
        result = op.transform(result);
      }
    }

    return result;
  }

  /**
   * Cache result from MCP operation
   */
  cacheResult(key: string, value: any, ttl: number = 3600000): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get cached result
   */
  getCachedResult(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const age = Date.now() - cached.timestamp;
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a workflow that combines multiple MCPs
 */
export class MCPWorkflow {
  private name: string;
  private steps: Array<{
    name: string;
    tool: string;
    action: string;
    config?: MCPConfig;
    condition?: (results: any) => boolean;
  }> = [];

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Add a step to the workflow
   */
  step(
    name: string,
    tool: string,
    action: string,
    config?: MCPConfig,
    condition?: (results: any) => boolean
  ): this {
    this.steps.push({ name, tool, action, config, condition });
    return this;
  }

  /**
   * Execute the workflow
   */
  async run(integration: MCPIntegration, initialData: any): Promise<any> {
    const results: any = { initialData };
    const performance = new PerformanceMonitor();
    performance.start();

    for (const step of this.steps) {
      // Check condition
      if (step.condition && !step.condition(results)) {
        // Step skipped - condition not met
        continue;
      }

      // Executing workflow step

      const tool = integration.getTool(step.tool);
      if (!tool) {
        throw new Error(`Tool "${step.tool}" not found`);
      }

      const stepStart = Date.now();
      const result = await tool[step.action](results, step.config);
      const stepDuration = Date.now() - stepStart;

      results[step.name] = {
        data: result,
        duration: stepDuration,
      };

      performance.mark(`step-${step.name}`);
    }

    const metrics = performance.stop();

    return {
      workflow: this.name,
      results,
      performance: metrics,
    };
  }

  /**
   * Get workflow definition
   */
  getDefinition(): any {
    return {
      name: this.name,
      steps: this.steps.map(s => ({
        name: s.name,
        tool: s.tool,
        action: s.action,
      })),
    };
  }
}

/**
 * Event bus for MCP communication
 */
export class MCPEventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event
   */
  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Subscribe to event once
   */
  once(event: string, callback: Function): void {
    const unsubscribe = this.on(event, (data: any) => {
      callback(data);
      unsubscribe();
    });
  }

  /**
   * Remove all listeners for an event
   */
  off(event: string): void {
    this.listeners.delete(event);
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for event
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}
