/**
 * Inter-MCP integration and communication layer
 * Enables MCPs to work together seamlessly
 */
import { PerformanceMonitor } from '../performance/index.js';
/**
 * MCP Pipeline - orchestrates multiple MCP tools
 */
export class MCPPipeline {
    steps = [];
    results = new Map();
    performance = new PerformanceMonitor();
    /**
     * Add a step to the pipeline
     */
    addStep(step) {
        this.steps.push(step);
        return this;
    }
    /**
     * Execute the pipeline
     */
    async execute() {
        this.performance.start();
        const stepResults = [];
        const errors = [];
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
            }
            catch (error) {
                errors.push(`Step "${step.name}" failed: ${error.message}`);
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
     * Execute a single step
     */
    async executeStep(step) {
        // Get input from previous steps
        let input = step.input;
        if (step.dependsOn && step.dependsOn.length > 0) {
            input = step.dependsOn.map(dep => this.results.get(dep)?.data);
        }
        // Execute the tool (this would call the actual MCP tool)
        // For now, return a mock result
        return {
            success: true,
            data: { step: step.name, tool: step.tool, input },
            timestamp: new Date().toISOString(),
        };
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