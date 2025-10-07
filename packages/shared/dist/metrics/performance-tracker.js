/**
 * Performance Tracker - Phase 1.2 of Evolution Plan
 * Tracks all MCP tool performance for learning and improvement
 */
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
export class PerformanceTracker extends EventEmitter {
    metrics = [];
    dataPath;
    flushInterval;
    aggregations = new Map();
    constructor(dataPath = './metrics-data') {
        super();
        this.dataPath = dataPath;
        // Flush metrics to disk every minute
        this.flushInterval = setInterval(() => this.flush(), 60000);
        // Load existing metrics on startup
        this.loadMetrics();
    }
    /**
     * Track a tool operation
     */
    async track(metric) {
        this.metrics.push(metric);
        // Update aggregations
        this.updateAggregations(metric);
        // Emit for real-time monitoring
        this.emit('metric', metric);
        // Check for patterns
        if (this.metrics.length % 100 === 0) {
            const patterns = this.detectPatterns();
            if (patterns.length > 0) {
                this.emit('patterns', patterns);
            }
        }
    }
    /**
     * Record human feedback on a tool's output
     */
    async recordFeedback(toolId, operationId, feedback) {
        const metric = this.metrics.find(m => m.toolId === toolId && m.timestamp.toISOString() === operationId);
        if (metric) {
            metric.humanFeedback = feedback;
            this.emit('feedback', { toolId, feedback });
            // Learn from feedback
            await this.learnFromFeedback(metric);
        }
    }
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolId, period) {
        let metrics = this.metrics.filter(m => m.toolId === toolId);
        if (period) {
            metrics = metrics.filter(m => m.timestamp >= period.start && m.timestamp <= period.end);
        }
        return metrics;
    }
    /**
     * Get aggregated metrics for a tool
     */
    getAggregatedMetrics(toolId) {
        return this.aggregations.get(toolId);
    }
    /**
     * Calculate tool performance score
     */
    calculatePerformanceScore(toolId) {
        const metrics = this.getToolMetrics(toolId);
        if (metrics.length === 0)
            return 0;
        const successRate = metrics.filter(m => m.success).length / metrics.length;
        const avgConfidence = metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length;
        const acceptanceRate = metrics.filter(m => m.humanFeedback?.accepted).length /
            metrics.filter(m => m.humanFeedback).length || 0;
        // Weighted score
        return successRate * 0.4 + avgConfidence * 0.3 + acceptanceRate * 0.3;
    }
    /**
     * Detect patterns in tool usage
     */
    detectPatterns() {
        const patterns = [];
        // Pattern: Tools failing on similar inputs
        const failurePatterns = new Map();
        this.metrics
            .filter(m => !m.success)
            .forEach(m => {
            const key = `${m.input.type}-${m.error?.substring(0, 50)}`;
            if (!failurePatterns.has(key)) {
                failurePatterns.set(key, []);
            }
            failurePatterns.get(key).push(m.toolId);
        });
        failurePatterns.forEach((tools, pattern) => {
            if (tools.length >= 3) {
                patterns.push({
                    pattern: `Common failure: ${pattern}`,
                    frequency: tools.length,
                    tools: [...new Set(tools)],
                    recommendation: 'Investigate shared failure cause',
                });
            }
        });
        // Pattern: Sequential tool usage
        for (let i = 0; i < this.metrics.length - 1; i++) {
            const current = this.metrics[i];
            const next = this.metrics[i + 1];
            if (current.toolId !== next.toolId &&
                next.timestamp.getTime() - current.timestamp.getTime() < 5000) {
                patterns.push({
                    pattern: `Sequential usage: ${current.toolId} → ${next.toolId}`,
                    frequency: 1,
                    tools: [current.toolId, next.toolId],
                    recommendation: 'Consider creating combined tool',
                });
            }
        }
        // Pattern: Low confidence operations
        const lowConfidence = this.metrics.filter(m => m.confidence < 0.5);
        if (lowConfidence.length > 10) {
            const toolsWithLowConfidence = [...new Set(lowConfidence.map(m => m.toolId))];
            patterns.push({
                pattern: 'Low confidence operations',
                frequency: lowConfidence.length,
                tools: toolsWithLowConfidence,
                recommendation: 'Improve training or add validation',
            });
        }
        return patterns;
    }
    /**
     * Update aggregated metrics
     */
    updateAggregations(metric) {
        const key = metric.toolId;
        if (!this.aggregations.has(key)) {
            this.aggregations.set(key, {
                toolId: metric.toolId,
                period: 'current',
                totalOperations: 0,
                successRate: 0,
                averageDuration: 0,
                averageConfidence: 0,
                acceptanceRate: 0,
                patterns: new Map(),
                improvements: 0,
            });
        }
        const agg = this.aggregations.get(key);
        const prevMetrics = this.getToolMetrics(metric.toolId);
        agg.totalOperations = prevMetrics.length;
        agg.successRate = prevMetrics.filter(m => m.success).length / prevMetrics.length;
        agg.averageDuration = prevMetrics.reduce((sum, m) => sum + m.duration, 0) / prevMetrics.length;
        agg.averageConfidence =
            prevMetrics.reduce((sum, m) => sum + m.confidence, 0) / prevMetrics.length;
        const withFeedback = prevMetrics.filter(m => m.humanFeedback);
        if (withFeedback.length > 0) {
            agg.acceptanceRate =
                withFeedback.filter(m => m.humanFeedback.accepted).length / withFeedback.length;
        }
        // Track operation patterns
        const operationKey = `${metric.operation}-${metric.input.type}`;
        agg.patterns.set(operationKey, (agg.patterns.get(operationKey) || 0) + 1);
    }
    /**
     * Learn from human feedback
     */
    async learnFromFeedback(metric) {
        if (!metric.humanFeedback)
            return;
        // Store feedback for ML training
        const feedbackData = {
            toolId: metric.toolId,
            operation: metric.operation,
            input: metric.input,
            output: metric.output,
            accepted: metric.humanFeedback.accepted,
            rating: metric.humanFeedback.rating,
            timestamp: metric.timestamp,
        };
        // Save to training data
        const trainingFile = path.join(this.dataPath, 'training', `${metric.toolId}.jsonl`);
        await fs.mkdir(path.dirname(trainingFile), { recursive: true });
        await fs.appendFile(trainingFile, JSON.stringify(feedbackData) + '\n');
        // Emit learning event
        this.emit('learning', {
            toolId: metric.toolId,
            feedback: metric.humanFeedback,
            context: feedbackData,
        });
    }
    /**
     * Save metrics to disk
     */
    async flush() {
        if (this.metrics.length === 0)
            return;
        const fileName = `metrics-${Date.now()}.json`;
        const filePath = path.join(this.dataPath, 'raw', fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(this.metrics, null, 2));
        // Keep only last 1000 metrics in memory
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
        this.emit('flush', { fileName, count: this.metrics.length });
    }
    /**
     * Load existing metrics
     */
    async loadMetrics() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
            const rawPath = path.join(this.dataPath, 'raw');
            await fs.mkdir(rawPath, { recursive: true });
            const files = await fs.readdir(rawPath);
            // Load only recent metrics (last 24 hours)
            const recentFiles = files
                .filter(f => f.startsWith('metrics-'))
                .filter(f => {
                const timestamp = parseInt(f.replace('metrics-', '').replace('.json', ''));
                return Date.now() - timestamp < 86400000; // 24 hours
            })
                .sort();
            for (const file of recentFiles.slice(-5)) {
                // Load last 5 files
                const content = await fs.readFile(path.join(rawPath, file), 'utf-8');
                const metrics = JSON.parse(content);
                this.metrics.push(...metrics);
            }
            this.emit('loaded', { count: this.metrics.length });
        }
        catch (error) {
            this.emit('error', error);
        }
    }
    /**
     * Generate performance report
     */
    generateReport() {
        const summary = {};
        const recommendations = [];
        const trends = {};
        // Calculate summary for each tool
        this.aggregations.forEach((agg, toolId) => {
            summary[toolId] = {
                operations: agg.totalOperations,
                successRate: `${(agg.successRate * 100).toFixed(1)}%`,
                avgDuration: `${agg.averageDuration.toFixed(0)}ms`,
                confidence: `${(agg.averageConfidence * 100).toFixed(1)}%`,
                acceptance: `${(agg.acceptanceRate * 100).toFixed(1)}%`,
            };
            // Generate recommendations
            if (agg.successRate < 0.8) {
                recommendations.push(`Improve ${toolId} - success rate only ${(agg.successRate * 100).toFixed(1)}%`);
            }
            if (agg.averageConfidence < 0.7) {
                recommendations.push(`${toolId} has low confidence - needs better training`);
            }
            if (agg.acceptanceRate < 0.6) {
                recommendations.push(`Users rejecting ${toolId} output - investigate why`);
            }
        });
        // Calculate trends
        const recentMetrics = this.metrics.filter(m => Date.now() - m.timestamp.getTime() < 3600000 // Last hour
        );
        const olderMetrics = this.metrics.filter(m => Date.now() - m.timestamp.getTime() >= 3600000 &&
            Date.now() - m.timestamp.getTime() < 7200000 // Previous hour
        );
        if (recentMetrics.length > 0 && olderMetrics.length > 0) {
            const recentSuccess = recentMetrics.filter(m => m.success).length / recentMetrics.length;
            const olderSuccess = olderMetrics.filter(m => m.success).length / olderMetrics.length;
            trends.successRateTrend = ((recentSuccess - olderSuccess) * 100).toFixed(1) + '%';
            trends.direction = recentSuccess > olderSuccess ? 'improving' : 'declining';
        }
        return { summary, recommendations, trends };
    }
    /**
     * Cleanup
     */
    destroy() {
        clearInterval(this.flushInterval);
        this.flush();
    }
}
// Singleton instance
let tracker = null;
export function getPerformanceTracker() {
    if (!tracker) {
        tracker = new PerformanceTracker();
    }
    return tracker;
}
//# sourceMappingURL=performance-tracker.js.map