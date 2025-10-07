/**
 * Production Monitor
 * Phase 4.2 of Master Evolution Plan
 *
 * Tracks what happens after MCP suggestions in production.
 * Learns from real-world usage, measuring impact and improving from
 * acceptance/rejection patterns exactly as specified in the plan.
 */
import { EventEmitter } from 'events';
import { LearningEngine } from './learning-engine.js';
export interface Suggestion {
    id: string;
    toolId: string;
    type: string;
    content: any;
    timestamp: Date;
    context: SuggestionContext;
    confidence: number;
}
export interface SuggestionContext {
    codebase?: string;
    file?: string;
    function?: string;
    issue?: string;
}
export interface SuggestionOutcome {
    suggestionId: string;
    accepted: boolean;
    acceptedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    impact?: ImpactMetrics;
    userFeedback?: UserFeedback;
}
export interface ImpactMetrics {
    codeQuality?: QualityChange;
    performance?: PerformanceChange;
    security?: SecurityChange;
    maintainability?: MaintainabilityChange;
    bugCount?: BugCountChange;
}
export interface QualityChange {
    before: number;
    after: number;
    improvement: number;
    measuredAt: Date;
}
export interface PerformanceChange {
    before: number;
    after: number;
    improvement: number;
    measuredAt: Date;
}
export interface SecurityChange {
    before: number;
    after: number;
    improvement: number;
    measuredAt: Date;
}
export interface MaintainabilityChange {
    before: number;
    after: number;
    improvement: number;
    measuredAt: Date;
}
export interface BugCountChange {
    before: number;
    after: number;
    improvement: number;
    measuredAt: Date;
    timeWindow: number;
}
export interface UserFeedback {
    rating: number;
    helpful: boolean;
    comment?: string;
    wouldUseAgain: boolean;
}
export interface RejectionAnalysis {
    reason: string;
    category: 'incorrect' | 'incomplete' | 'too-complex' | 'not-relevant' | 'style-preference' | 'other';
    confidence: number;
    learnings: string[];
}
export declare class ProductionMonitor extends EventEmitter {
    private learningEngine;
    private suggestions;
    private outcomes;
    private dataPath;
    private readonly OUTCOME_CHECK_INTERVAL;
    private readonly IMPACT_MEASURE_DELAY;
    private readonly LONG_TERM_MEASURE_DELAY;
    private monitoringTimer?;
    constructor(learningEngine: LearningEngine, dataPath?: string);
    /**
     * Start monitoring production usage
     * This implements the core production monitoring loop from the plan
     */
    monitorProduction(): Promise<void>;
    /**
     * Start continuous monitoring
     */
    startContinuousMonitoring(): void;
    /**
     * Stop continuous monitoring
     */
    stopContinuousMonitoring(): void;
    /**
     * Record a suggestion made by an MCP tool
     */
    recordSuggestion(suggestion: Suggestion): Promise<void>;
    /**
     * Record the outcome of a suggestion
     */
    recordOutcome(outcome: SuggestionOutcome): Promise<void>;
    /**
     * Collect outcomes since last check
     */
    private collectOutcomes;
    /**
     * Measure impact of accepted suggestion
     */
    private measureImpact;
    /**
     * Measure code quality change
     */
    private measureQualityChange;
    /**
     * Measure performance change
     */
    private measurePerformanceChange;
    /**
     * Measure security change
     */
    private measureSecurityChange;
    /**
     * Measure maintainability change
     */
    private measureMaintainabilityChange;
    /**
     * Measure bug count change
     */
    private measureBugCountChange;
    /**
     * Learn from successful suggestion
     */
    private learnFromSuccess;
    /**
     * Calculate overall success score from metrics
     */
    private calculateSuccessScore;
    /**
     * Analyze why suggestion was rejected
     */
    private analyzeRejection;
    /**
     * Categorize rejection reason
     */
    private categorizeRejection;
    /**
     * Learn from rejected suggestion
     */
    private learnFromRejection;
    /**
     * Infer domain from context
     */
    private inferDomain;
    /**
     * Extract features from suggestion for learning
     */
    private extractFeaturesFromSuggestion;
    /**
     * Measure and record impact (scheduled after acceptance)
     */
    private measureAndRecordImpact;
    /**
     * Measure long-term impact
     */
    private measureAndRecordLongTermImpact;
    /**
     * Persist suggestion to disk
     */
    private persistSuggestion;
    /**
     * Persist outcome to disk
     */
    private persistOutcome;
    /**
     * Get monitoring statistics
     */
    getStatistics(): {
        totalSuggestions: number;
        acceptanceRate: number;
        avgImprovementByType: Record<string, number>;
        rejectionCategories: Record<string, number>;
        topLearnings: string[];
    };
}
export default ProductionMonitor;
//# sourceMappingURL=production-monitor.d.ts.map