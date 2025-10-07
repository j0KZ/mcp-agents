/**
 * Inter-MCP integration and communication layer
 * Enables MCPs to work together seamlessly
 */
import { PerformanceMonitor } from '../performance/index.js';
import { MCPClient } from '../mcp-client/index.js';
/**
 * MCP Pipeline - orchestrates multiple MCP tools
 */
export class MCPPipeline {
    steps = [];
    results = new Map();
    performance = new PerformanceMonitor();
    mcpClient = new MCPClient();
    subPipelines = new Map();
    executionOrder = [];
    retryAttempts = new Map();
    /**
     * Add a step to the pipeline
     */
    addStep(step) {
        this.steps.push(step);
        return this;
    }
    /**
     * Add a sub-pipeline
     */
    addSubPipeline(name, pipeline) {
        this.subPipelines.set(name, pipeline);
        return this;
    }
    /**
     * Add conditional step
     */
    addConditionalStep(step) {
        if (!step.condition || step.condition()) {
            this.addStep(step);
        }
        return this;
    }
    /**
     * Execute the pipeline
     */
    async execute() {
        this.performance.start();
        const stepResults = [];
        const errors = [];
        // Sort steps by dependencies
        const sortedSteps = this.topologicalSort(this.steps);
        for (const step of sortedSteps) {
            this.executionOrder.push(step.name);
            // Check dependencies
            if (step.dependsOn) {
                const missingDeps = step.dependsOn.filter(dep => !this.results.has(dep));
                if (missingDeps.length > 0) {
                    const error = `Step "${step.name}" missing dependencies: ${missingDeps.join(', ')}`;
                    errors.push(error);
                    continue;
                }
            }
            // Execute step with retries
            const stepStart = Date.now();
            this.performance.mark(`step-${step.name}-start`);
            let attempts = 0;
            const maxRetries = step.retryCount || 0;
            while (attempts <= maxRetries) {
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
                    break;
                }
                catch (error) {
                    attempts++;
                    this.retryAttempts.set(step.name, attempts);
                    if (attempts > maxRetries) {
                        if (step.continueOnError) {
                            stepResults.push({
                                name: step.name,
                                tool: step.tool,
                                result: {
                                    success: false,
                                    error: error.message,
                                    timestamp: new Date().toISOString(),
                                },
                                duration: Date.now() - stepStart,
                            });
                        }
                        else {
                            errors.push(`Step "${step.name}" failed: ${error.message}`);
                        }
                        break;
                    }
                }
            }
        }
        const metrics = this.performance.stop();
        return {
            steps: stepResults,
            totalDuration: metrics.duration,
            success: errors.length === 0,
            errors,
            results: stepResults.length > 0 ? stepResults.map(s => s.result) : undefined,
            metadata: {
                duration: metrics.duration,
                executionOrder: this.executionOrder,
                failedStep: errors.length > 0 ? this.executionOrder[this.executionOrder.length - 1] : undefined,
                retryAttempts: Object.fromEntries(this.retryAttempts),
            },
        };
    }
    /**
     * Execute a single step - NOW CALLS REAL MCPs
     */
    async executeStep(step) {
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
        }
        catch (error) {
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
    getResult(stepName) {
        return this.results.get(stepName);
    }
    /**
     * Get all results
     */
    getAllResults() {
        return this.results;
    }
    /**
     * Clear pipeline
     */
    clear() {
        this.steps = [];
        this.results.clear();
        this.performance.reset();
        this.executionOrder = [];
        this.retryAttempts.clear();
    }
    /**
     * Topological sort for dependency resolution
     */
    topologicalSort(steps) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (stepName) => {
            if (visited.has(stepName))
                return;
            if (visiting.has(stepName)) {
                throw new Error(`Circular dependency detected: ${stepName}`);
            }
            visiting.add(stepName);
            const step = steps.find(s => s.name === stepName);
            if (step?.dependsOn) {
                for (const dep of step.dependsOn) {
                    visit(dep);
                }
            }
            visiting.delete(stepName);
            visited.add(stepName);
            if (step) {
                sorted.push(step);
            }
        };
        for (const step of steps) {
            visit(step.name);
        }
        return sorted;
    }
}
/**
 * MCP Integration Manager - manages MCP tool interactions
 */
export class MCPIntegration {
    tools = new Map();
    cache = new Map();
    /**
     * Register an MCP tool
     */
    registerTool(name, tool) {
        this.tools.set(name, tool);
    }
    /**
     * Get registered tool
     */
    getTool(name) {
        return this.tools.get(name);
    }
    /**
     * Execute multiple MCPs in sequence
     */
    async sequence(steps) {
        const results = [];
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
    async parallel(steps) {
        const promises = steps.map(async (step) => {
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
    async chain(initialInput, operations) {
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
    cacheResult(key, value, ttl = 3600000) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
        });
    }
    /**
     * Get cached result
     */
    getCachedResult(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
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
    clearCache() {
        this.cache.clear();
    }
}
/**
 * Create a workflow that combines multiple MCPs
 */
export class MCPWorkflow {
    name;
    steps = [];
    constructor(name) {
        this.name = name;
    }
    /**
     * Add a step to the workflow
     */
    step(name, tool, action, config, condition) {
        this.steps.push({ name, tool, action, config, condition });
        return this;
    }
    /**
     * Execute the workflow
     */
    async run(integration, initialData) {
        const results = { initialData };
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
    getDefinition() {
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
    listeners = new Map();
    /**
     * Subscribe to an event
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        // Return unsubscribe function
        return () => {
            this.listeners.get(event)?.delete(callback);
        };
    }
    /**
     * Emit an event
     */
    emit(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
    /**
     * Subscribe to event once
     */
    once(event, callback) {
        const unsubscribe = this.on(event, (data) => {
            callback(data);
            unsubscribe();
        });
    }
    /**
     * Remove all listeners for an event
     */
    off(event) {
        this.listeners.delete(event);
    }
    /**
     * Clear all listeners
     */
    clear() {
        this.listeners.clear();
    }
    /**
     * Get listener count for event
     */
    listenerCount(event) {
        return this.listeners.get(event)?.size || 0;
    }
}
//# sourceMappingURL=index.js.map