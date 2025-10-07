/**
 * Self-Improving System
 * Phase 4.4 of Master Evolution Plan
 *
 * Implements autonomous improvement exactly as specified in the plan.
 * Analyzes own performance, identifies weaknesses, generates hypotheses,
 * tests them, and applies improvements without human intervention.
 */
import { EventEmitter } from 'events';
import { LearningEngine } from './learning-engine.js';
import { ProductionMonitor } from './production-monitor.js';
import { PredictiveAnalyzer } from './predictive-analyzer.js';
export interface PerformanceAnalysis {
    timestamp: Date;
    overallScore: number;
    weaknesses: Weakness[];
    strengths: Strength[];
    opportunities: Opportunity[];
}
export interface Weakness {
    area: string;
    score: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    examples: string[];
}
export interface Strength {
    area: string;
    score: number;
    description: string;
}
export interface Opportunity {
    description: string;
    potentialImprovement: number;
    effort: 'low' | 'medium' | 'high';
    priority: number;
}
export interface ImprovementHypothesis {
    id: string;
    targetWeakness: string;
    hypothesis: string;
    proposedChange: ProposedChange;
    expectedImprovement: number;
    risk: 'low' | 'medium' | 'high';
    confidence: number;
}
export interface ProposedChange {
    type: 'parameter-tuning' | 'algorithm-change' | 'feature-addition' | 'strategy-adjustment';
    description: string;
    implementation: any;
    reversible: boolean;
}
export interface HypothesisTestResult {
    hypothesisId: string;
    improved: boolean;
    actualImprovement: number;
    metrics: TestMetrics;
    recommendation: 'apply' | 'reject' | 'refine';
}
export interface TestMetrics {
    accuracy: number;
    performance: number;
    reliability: number;
    userSatisfaction: number;
}
export interface AppliedImprovement {
    id: string;
    hypothesis: ImprovementHypothesis;
    appliedAt: Date;
    results: HypothesisTestResult;
    rollback?: Date;
}
export declare class SelfImprovingSystem extends EventEmitter {
    private learningEngine;
    private productionMonitor;
    private predictiveAnalyzer;
    private performanceHistory;
    private hypothesisQueue;
    private appliedImprovements;
    private isRunning;
    private readonly LEARNING_INTERVAL;
    private readonly MIN_IMPROVEMENT_THRESHOLD;
    private readonly MAX_CONCURRENT_TESTS;
    private readonly ROLLBACK_THRESHOLD;
    constructor(learningEngine: LearningEngine, productionMonitor: ProductionMonitor, predictiveAnalyzer: PredictiveAnalyzer);
    /**
     * Start autonomous improvement loop
     * This implements the core self-improvement loop from the plan
     */
    autonomousImprovement(): Promise<void>;
    /**
     * Stop autonomous improvement
     */
    stop(): void;
    /**
     * Analyze own performance across all dimensions
     */
    private analyzeSelfPerformance;
    /**
     * Find the biggest weakness to address
     */
    private findBiggestWeakness;
    /**
     * Generate hypothesis to address weakness
     */
    private generateHypothesis;
    /**
     * Test hypothesis in controlled environment
     */
    private testHypothesis;
    /**
     * Get current performance metrics
     */
    private getCurrentMetrics;
    /**
     * Temporarily apply change for testing
     */
    private temporarilyApply;
    /**
     * Revert temporary change
     */
    private revertTemporaryChange;
    /**
     * Calculate improvement percentage
     */
    private calculateImprovement;
    /**
     * Apply improvement permanently
     */
    private applyImprovement;
    /**
     * Check if improvement caused degradation
     */
    private checkForDegradation;
    /**
     * Rollback an improvement
     */
    private rollbackImprovement;
    /**
     * Broadcast learning to other tools
     */
    private broadcastLearning;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Get improvement statistics
     */
    getStatistics(): {
        totalImprovements: number;
        successRate: number;
        avgImprovement: number;
        rollbackRate: number;
        performanceTrend: 'improving' | 'stable' | 'degrading';
    };
    /**
     * Generate improvement report
     */
    generateReport(): {
        currentPerformance: PerformanceAnalysis | null;
        improvements: AppliedImprovement[];
        hypotheses: ImprovementHypothesis[];
        statistics: ReturnType<SelfImprovingSystem['getStatistics']>;
    };
}
export default SelfImprovingSystem;
//# sourceMappingURL=self-improving-system.d.ts.map