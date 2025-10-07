/**
 * Intelligent Orchestrator
 * Phase 3.1 of Master Evolution Plan
 *
 * This is not just a task runner - it's an intelligent system that:
 * - Analyzes tasks to determine optimal tool combinations
 * - Manages parallel and sequential execution intelligently
 * - Learns from outcomes to improve future orchestrations
 * - Handles failures gracefully with automatic retries and fallbacks
 */
import { EventEmitter } from 'events';
export interface OrchestrationTask {
    id: string;
    type: 'analysis' | 'generation' | 'refactoring' | 'security' | 'testing';
    input: any;
    requirements: {
        quality?: number;
        speed?: 'fast' | 'balanced' | 'thorough';
        depth?: 'surface' | 'standard' | 'deep';
        confidence?: number;
    };
    context?: {
        project?: string;
        framework?: string;
        domain?: string;
        previousResults?: any[];
    };
}
export interface ToolCapability {
    tool: string;
    strengths: string[];
    weaknesses: string[];
    performance: {
        averageTime: number;
        successRate: number;
        qualityScore: number;
    };
    specializations: string[];
    dependencies?: string[];
}
export interface OrchestrationPlan {
    id: string;
    task: OrchestrationTask;
    stages: ExecutionStage[];
    estimatedTime: number;
    confidence: number;
    reasoning: string[];
    alternatives?: AlternativePlan[];
}
export interface ExecutionStage {
    id: string;
    tools: string[];
    execution: 'parallel' | 'sequential' | 'consensus';
    inputs: any;
    expectedOutputs: string[];
    timeout?: number;
    retryStrategy?: {
        maxAttempts: number;
        backoff: 'linear' | 'exponential';
        fallbackTool?: string;
    };
}
export interface AlternativePlan {
    reason: string;
    stages: ExecutionStage[];
    tradeoffs: {
        pros: string[];
        cons: string[];
    };
}
export interface OrchestrationResult {
    success: boolean;
    planId: string;
    results: Map<string, any>;
    consensus?: ConsensusResult;
    performance: {
        totalTime: number;
        stageTimings: Map<string, number>;
        toolTimings: Map<string, number>;
    };
    learnings: OrchestrationLearning[];
    explanation: any;
}
export interface ConsensusResult {
    agreement: number;
    conflicts: Conflict[];
    resolution: any;
    confidence: number;
}
export interface Conflict {
    aspect: string;
    toolOpinions: Map<string, any>;
    resolution: 'majority' | 'weighted' | 'expert' | 'combined';
}
export interface OrchestrationLearning {
    pattern: string;
    observation: string;
    impact: 'positive' | 'negative' | 'neutral';
    recommendation?: string;
}
export declare class IntelligentOrchestrator extends EventEmitter {
    private messageBus;
    private performanceTracker;
    private semanticAnalyzer;
    private domainKnowledge;
    private explanationEngine;
    private toolCapabilities;
    private orchestrationHistory;
    private successPatterns;
    private activeOrchestrations;
    constructor();
    /**
     * Initialize tool capabilities registry
     */
    private initializeToolCapabilities;
    /**
     * Setup message handlers for inter-tool communication
     */
    private setupMessageHandlers;
    /**
     * Create an intelligent orchestration plan
     */
    createPlan(task: OrchestrationTask): Promise<OrchestrationPlan>;
    /**
     * Analyze task to understand requirements
     */
    private analyzeTask;
    /**
     * Assess task complexity
     */
    private assessComplexity;
    /**
     * Select optimal tools based on analysis
     */
    private selectTools;
    /**
     * Create execution stages with intelligent grouping
     */
    private createExecutionStages;
    /**
     * Group tools by dependency relationships
     */
    private groupToolsByDependency;
    /**
     * Check if tools can run in parallel
     */
    private canRunInParallel;
    /**
     * Determine expected outputs from tools
     */
    private determineExpectedOutputs;
    /**
     * Calculate timeout based on tools and speed requirements
     */
    private calculateTimeout;
    /**
     * Select fallback tool for retry strategy
     */
    private selectFallbackTool;
    /**
     * Estimate performance of the plan
     */
    private estimatePerformance;
    /**
     * Generate alternative plans
     */
    private generateAlternatives;
    /**
     * Explain plan reasoning
     */
    private explainPlanReasoning;
    /**
     * Execute orchestration plan with intelligent coordination
     */
    execute(plan: OrchestrationPlan): Promise<OrchestrationResult>;
    /**
     * Execute a single stage with retry logic
     */
    private executeStage;
    /**
     * Execute a single tool with retry logic
     */
    private executeTool;
    /**
     * Apply consensus mechanism when tools disagree
     */
    private applyConsensus;
    /**
     * Extract aspects from results for comparison
     */
    private extractAspects;
    /**
     * Resolve conflict between tool opinions
     */
    private resolveConflict;
    /**
     * Find expert tool for specific aspect
     */
    private findExpertForAspect;
    /**
     * Calculate consensus confidence
     */
    private calculateConsensusConfidence;
    /**
     * Analyze stage execution for learning
     */
    private analyzeStageExecution;
    /**
     * Determine overall success based on requirements
     */
    private determineSuccess;
    /**
     * Generate comprehensive explanation for orchestration
     */
    private generateOrchestrationExplanation;
    /**
     * Attempt recovery from orchestration failure
     */
    private attemptRecovery;
    /**
     * Store orchestration result for learning
     */
    private storeOrchestrationResult;
    /**
     * Find similar tasks from history
     */
    private findSimilarTasks;
    /**
     * Extract successful patterns from history
     */
    private extractSuccessfulPatterns;
    /**
     * Process insights from tools for learning
     */
    private processInsight;
    /**
     * Handle tool failures intelligently
     */
    private handleToolFailure;
    /**
     * Coordinate consensus when requested
     */
    private coordinateConsensus;
}
export default IntelligentOrchestrator;
//# sourceMappingURL=intelligent-orchestrator.d.ts.map