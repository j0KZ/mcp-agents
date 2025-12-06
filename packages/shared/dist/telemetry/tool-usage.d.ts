/**
 * Tool Usage Tracker - Telemetry for MCP tool usage
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 5.4: Metrics and Telemetry
 */
import type { ToolUsageMetrics, ToolFrequency, MCPServerName } from '../tool-registry/types.js';
/**
 * Frequency report for analyzing tool usage patterns
 */
export interface FrequencyReport {
    /** Tools that should be high frequency (>10 calls/session) */
    highFrequency: ToolUsageMetrics[];
    /** Tools that should be medium frequency (3-10 calls/session) */
    mediumFrequency: ToolUsageMetrics[];
    /** Tools that should be low frequency (<3 calls/session) */
    lowFrequency: ToolUsageMetrics[];
    /** Tools that were never called */
    unused: string[];
    /** Recommendations for frequency adjustments */
    recommendations: FrequencyRecommendation[];
}
/**
 * Recommendation for adjusting tool frequency
 */
export interface FrequencyRecommendation {
    toolName: string;
    currentFrequency: ToolFrequency;
    suggestedFrequency: ToolFrequency;
    reason: string;
    callCount: number;
}
/**
 * Server usage summary
 */
export interface ServerUsageSummary {
    server: MCPServerName;
    totalCalls: number;
    avgExecutionTime: number;
    errorRate: number;
    mostUsedTool: string;
    leastUsedTool: string;
}
/**
 * Session summary for telemetry
 */
export interface SessionSummary {
    sessionStart: Date;
    sessionEnd: Date;
    totalToolCalls: number;
    uniqueToolsUsed: number;
    totalExecutionTime: number;
    overallSuccessRate: number;
    topTools: ToolUsageMetrics[];
    serverUsage: ServerUsageSummary[];
}
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
export declare class ToolUsageTracker {
    private usage;
    private sessionStart;
    private toolFrequencies;
    private toolServers;
    constructor();
    /**
     * Register a tool with its frequency and server for better reporting
     */
    registerTool(toolName: string, frequency: ToolFrequency, server: MCPServerName): void;
    /**
     * Track a tool call
     * @param toolName - Name of the tool called
     * @param duration - Execution time in milliseconds
     * @param success - Whether the call succeeded
     */
    track(toolName: string, duration: number, success: boolean): void;
    /**
     * Get metrics for a specific tool
     */
    getMetrics(toolName: string): ToolUsageMetrics | undefined;
    /**
     * Get all tracked metrics
     */
    getAllMetrics(): ToolUsageMetrics[];
    /**
     * Get frequency report for analyzing tool usage patterns
     * Useful for adjusting deferred loading settings
     */
    getFrequencyReport(registeredTools?: string[]): FrequencyReport;
    /**
     * Generate frequency adjustment recommendations
     */
    private generateRecommendations;
    /**
     * Get server usage summary
     */
    getServerUsage(): ServerUsageSummary[];
    /**
     * Get session summary
     */
    getSessionSummary(): SessionSummary;
    /**
     * Reset all tracking data (start new session)
     */
    reset(): void;
    /**
     * Export data for external analysis
     */
    export(): {
        sessionStart: Date;
        metrics: ToolUsageMetrics[];
        serverUsage: ServerUsageSummary[];
    };
}
/**
 * Create a pre-configured tracker with tool registry
 */
export declare function createTrackerWithRegistry(toolRegistry: Array<{
    name: string;
    frequency: ToolFrequency;
    server: MCPServerName;
}>): ToolUsageTracker;
//# sourceMappingURL=tool-usage.d.ts.map