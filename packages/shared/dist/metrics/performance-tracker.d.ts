/**
 * Performance Tracker - Phase 1.2 of Evolution Plan
 * Tracks all MCP tool performance for learning and improvement
 */
import { EventEmitter } from 'events';
export interface ToolMetric {
    toolId: string;
    operation: string;
    timestamp: Date;
    duration: number;
    success: boolean;
    input: {
        type: string;
        size: number;
        complexity?: number;
    };
    output: {
        type: string;
        size: number;
        quality?: number;
    };
    confidence: number;
    humanFeedback?: {
        accepted: boolean;
        rating?: number;
        comment?: string;
    };
    error?: string;
}
export interface AggregatedMetrics {
    toolId: string;
    period: string;
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    averageConfidence: number;
    acceptanceRate: number;
    patterns: Map<string, number>;
    improvements: number;
}
export declare class PerformanceTracker extends EventEmitter {
    private metrics;
    private dataPath;
    private flushInterval;
    private aggregations;
    constructor(dataPath?: string);
    /**
     * Track a tool operation
     */
    track(metric: ToolMetric): Promise<void>;
    /**
     * Record human feedback on a tool's output
     */
    recordFeedback(toolId: string, operationId: string, feedback: {
        accepted: boolean;
        rating?: number;
        comment?: string;
    }): Promise<void>;
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolId: string, period?: {
        start: Date;
        end: Date;
    }): ToolMetric[];
    /**
     * Get aggregated metrics for a tool
     */
    getAggregatedMetrics(toolId: string): AggregatedMetrics | undefined;
    /**
     * Calculate tool performance score
     */
    calculatePerformanceScore(toolId: string): number;
    /**
     * Detect patterns in tool usage
     */
    private detectPatterns;
    /**
     * Update aggregated metrics
     */
    private updateAggregations;
    /**
     * Learn from human feedback
     */
    private learnFromFeedback;
    /**
     * Save metrics to disk
     */
    private flush;
    /**
     * Load existing metrics
     */
    private loadMetrics;
    /**
     * Generate performance report
     */
    generateReport(): {
        summary: Record<string, any>;
        recommendations: string[];
        trends: Record<string, any>;
    };
    /**
     * Cleanup
     */
    destroy(): void;
}
export declare function getPerformanceTracker(): PerformanceTracker;
//# sourceMappingURL=performance-tracker.d.ts.map