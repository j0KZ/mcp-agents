/**
 * Tool Usage Tracker - Telemetry for MCP tool usage
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 5.4: Metrics and Telemetry
 */
/**
 * Tool Usage Tracker for collecting telemetry data
 *
 * @example
 * ```typescript
 * const tracker = new ToolUsageTracker();
 *
 * // Track a tool call
 * const startTime = Date.now();
 * try {
 *   const result = await mcp.call('review_file', args);
 *   tracker.track('review_file', Date.now() - startTime, true);
 * } catch (error) {
 *   tracker.track('review_file', Date.now() - startTime, false);
 * }
 *
 * // Get usage metrics
 * const metrics = tracker.getMetrics('review_file');
 *
 * // Get frequency report for deferred loading optimization
 * const report = tracker.getFrequencyReport();
 * ```
 */
export class ToolUsageTracker {
    usage = new Map();
    sessionStart;
    toolFrequencies = new Map();
    toolServers = new Map();
    constructor() {
        this.sessionStart = new Date();
    }
    /**
     * Register a tool with its frequency and server for better reporting
     */
    registerTool(toolName, frequency, server) {
        this.toolFrequencies.set(toolName, frequency);
        this.toolServers.set(toolName, server);
    }
    /**
     * Track a tool call
     * @param toolName - Name of the tool called
     * @param duration - Execution time in milliseconds
     * @param success - Whether the call succeeded
     */
    track(toolName, duration, success) {
        const stats = this.usage.get(toolName) || {
            calls: 0,
            totalTime: 0,
            errors: 0,
            lastCalled: new Date(),
        };
        stats.calls++;
        stats.totalTime += duration;
        if (!success)
            stats.errors++;
        stats.lastCalled = new Date();
        this.usage.set(toolName, stats);
    }
    /**
     * Get metrics for a specific tool
     */
    getMetrics(toolName) {
        const stats = this.usage.get(toolName);
        if (!stats)
            return undefined;
        return {
            toolName,
            callCount: stats.calls,
            avgExecutionTime: stats.calls > 0 ? stats.totalTime / stats.calls : 0,
            lastCalled: stats.lastCalled,
            successRate: stats.calls > 0 ? (stats.calls - stats.errors) / stats.calls : 1,
        };
    }
    /**
     * Get all tracked metrics
     */
    getAllMetrics() {
        return Array.from(this.usage.keys()).map(toolName => this.getMetrics(toolName));
    }
    /**
     * Get frequency report for analyzing tool usage patterns
     * Useful for adjusting deferred loading settings
     */
    getFrequencyReport(registeredTools) {
        const metrics = this.getAllMetrics();
        const HIGH_THRESHOLD = 10;
        const MEDIUM_THRESHOLD = 3;
        const highFrequency = metrics.filter(m => m.callCount >= HIGH_THRESHOLD);
        const mediumFrequency = metrics.filter(m => m.callCount >= MEDIUM_THRESHOLD && m.callCount < HIGH_THRESHOLD);
        const lowFrequency = metrics.filter(m => m.callCount < MEDIUM_THRESHOLD && m.callCount > 0);
        // Find unused tools from registered tools
        const usedTools = new Set(metrics.map(m => m.toolName));
        const unused = registeredTools ? registeredTools.filter(t => !usedTools.has(t)) : [];
        // Generate recommendations
        const recommendations = this.generateRecommendations(metrics);
        return {
            highFrequency,
            mediumFrequency,
            lowFrequency,
            unused,
            recommendations,
        };
    }
    /**
     * Generate frequency adjustment recommendations
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        for (const metric of metrics) {
            const currentFreq = this.toolFrequencies.get(metric.toolName);
            if (!currentFreq)
                continue;
            let suggestedFreq;
            let reason = '';
            // High usage but not marked as high frequency
            if (metric.callCount >= 10 && currentFreq !== 'high') {
                suggestedFreq = 'high';
                reason = `Tool has ${metric.callCount} calls, should be immediately available`;
            }
            // Low usage but marked as high frequency
            else if (metric.callCount < 3 && currentFreq === 'high') {
                suggestedFreq = 'medium';
                reason = `Tool has only ${metric.callCount} calls, consider deferring`;
            }
            // Medium usage adjustments
            else if (metric.callCount >= 3 && metric.callCount < 10 && currentFreq === 'low') {
                suggestedFreq = 'medium';
                reason = `Tool has moderate usage (${metric.callCount} calls), adjust frequency`;
            }
            if (suggestedFreq) {
                recommendations.push({
                    toolName: metric.toolName,
                    currentFrequency: currentFreq,
                    suggestedFrequency: suggestedFreq,
                    reason,
                    callCount: metric.callCount,
                });
            }
        }
        return recommendations;
    }
    /**
     * Get server usage summary
     */
    getServerUsage() {
        const serverStats = new Map();
        for (const [toolName, stats] of this.usage) {
            const server = this.toolServers.get(toolName);
            if (!server)
                continue;
            const current = serverStats.get(server) || {
                calls: 0,
                time: 0,
                errors: 0,
                tools: new Map(),
            };
            current.calls += stats.calls;
            current.time += stats.totalTime;
            current.errors += stats.errors;
            current.tools.set(toolName, stats.calls);
            serverStats.set(server, current);
        }
        return Array.from(serverStats.entries()).map(([server, stats]) => {
            const toolEntries = Array.from(stats.tools.entries());
            const sortedTools = toolEntries.sort((a, b) => b[1] - a[1]);
            return {
                server,
                totalCalls: stats.calls,
                avgExecutionTime: stats.calls > 0 ? stats.time / stats.calls : 0,
                errorRate: stats.calls > 0 ? stats.errors / stats.calls : 0,
                mostUsedTool: sortedTools[0]?.[0] || 'none',
                leastUsedTool: sortedTools[sortedTools.length - 1]?.[0] || 'none',
            };
        });
    }
    /**
     * Get session summary
     */
    getSessionSummary() {
        const metrics = this.getAllMetrics();
        const serverUsage = this.getServerUsage();
        const totalCalls = metrics.reduce((sum, m) => sum + m.callCount, 0);
        const totalTime = metrics.reduce((sum, m) => sum + m.avgExecutionTime * m.callCount, 0);
        const totalErrors = metrics.reduce((sum, m) => sum + m.callCount * (1 - m.successRate), 0);
        return {
            sessionStart: this.sessionStart,
            sessionEnd: new Date(),
            totalToolCalls: totalCalls,
            uniqueToolsUsed: metrics.length,
            totalExecutionTime: totalTime,
            overallSuccessRate: totalCalls > 0 ? (totalCalls - totalErrors) / totalCalls : 1,
            topTools: metrics.sort((a, b) => b.callCount - a.callCount).slice(0, 5),
            serverUsage,
        };
    }
    /**
     * Reset all tracking data (start new session)
     */
    reset() {
        this.usage.clear();
        this.sessionStart = new Date();
    }
    /**
     * Export data for external analysis
     */
    export() {
        return {
            sessionStart: this.sessionStart,
            metrics: this.getAllMetrics(),
            serverUsage: this.getServerUsage(),
        };
    }
}
/**
 * Create a pre-configured tracker with tool registry
 */
export function createTrackerWithRegistry(toolRegistry) {
    const tracker = new ToolUsageTracker();
    for (const tool of toolRegistry) {
        tracker.registerTool(tool.name, tool.frequency, tool.server);
    }
    return tracker;
}
//# sourceMappingURL=tool-usage.js.map