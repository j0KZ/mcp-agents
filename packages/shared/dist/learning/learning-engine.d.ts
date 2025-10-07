/**
 * Learning Engine
 * Phase 4.1 of Master Evolution Plan
 *
 * Implements machine learning from outcomes exactly as specified in the plan.
 * Learns from every decision, retrains periodically, identifies patterns,
 * and updates strategies autonomously.
 */
import { EventEmitter } from 'events';
export interface Decision {
    id: string;
    toolId: string;
    operation: string;
    input: any;
    output: any;
    context: DecisionContext;
    timestamp: Date;
    features: FeatureVector;
}
export interface DecisionContext {
    codeType?: string;
    framework?: string;
    complexity?: number;
    domain?: string;
    previousDecisions?: string[];
}
export interface Outcome {
    decisionId: string;
    success: boolean;
    metrics: OutcomeMetrics;
    feedback?: HumanFeedback;
    timestamp: Date;
}
export interface OutcomeMetrics {
    accuracy: number;
    performance: number;
    quality: number;
    userSatisfaction?: number;
}
export interface HumanFeedback {
    accepted: boolean;
    rating?: number;
    comment?: string;
    corrections?: any;
}
export interface FeatureVector {
    [key: string]: number;
}
export interface Pattern {
    name: string;
    description: string;
    conditions: Condition[];
    action: string;
    significance: number;
    confidence: number;
    examples: number;
}
export interface Condition {
    feature: string;
    operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
    value: any;
}
export interface Prediction {
    action: string;
    confidence: number;
    expectedOutcome: ExpectedOutcome;
    explanation: string[];
    alternatives: Alternative[];
}
export interface ExpectedOutcome {
    success: number;
    quality: number;
    performance: number;
}
export interface Alternative {
    action: string;
    confidence: number;
    tradeoff: string;
}
export declare class LearningEngine extends EventEmitter {
    private history;
    private patterns;
    private model;
    private strategyWeights;
    private readonly RETRAIN_INTERVAL;
    private readonly PATTERN_SIGNIFICANCE_THRESHOLD;
    private readonly LEARNING_RATE;
    private readonly MOMENTUM;
    private dataPath;
    constructor(dataPath?: string);
    /**
     * Initialize strategy weights
     */
    private initializeStrategies;
    /**
     * Learn from a decision and its outcome
     * This is the core learning loop from the plan
     */
    learn(decision: Decision, outcome: Outcome): Promise<void>;
    /**
     * Persist experience to disk
     */
    private persistExperience;
    /**
     * Retrain model on accumulated experiences
     */
    private retrain;
    /**
     * Convert outcome to vector for training
     */
    private outcomeToVector;
    /**
     * Convert feature vector to array
     */
    private vectorToArray;
    /**
     * Shuffle array using Fisher-Yates
     */
    private shuffle;
    /**
     * Identify patterns in decision history
     */
    private identifyPatterns;
    /**
     * Find features that appear frequently
     */
    private findCommonFeatures;
    /**
     * Get rate of feature value in decisions
     */
    private getFeatureRate;
    /**
     * Check if features match condition
     */
    private matchesCondition;
    /**
     * Update strategies based on patterns
     */
    private updateStrategies;
    /**
     * Score how well pattern-matching would have done
     */
    private scorePatternMatching;
    /**
     * Score how well similarity-search would have done
     */
    private scoreSimilaritySearch;
    /**
     * Score how well heuristic-rules would have done
     */
    private scoreHeuristicRules;
    /**
     * Score how well neural-network would have done
     */
    private scoreNeuralNetwork;
    /**
     * Predict best action for a situation using learned model
     */
    predict(situation: Situation): Promise<Prediction>;
    /**
     * Extract features from situation
     */
    private extractFeatures;
    /**
     * Predict using pattern matching
     */
    private predictByPatterns;
    /**
     * Predict using similarity to past decisions
     */
    private predictBySimilarity;
    /**
     * Calculate similarity between feature vectors
     */
    private calculateSimilarity;
    /**
     * Ensemble voting from multiple predictions
     */
    private ensembleVote;
    /**
     * Explain prediction
     */
    private explainPrediction;
    /**
     * Get learning statistics
     */
    getStatistics(): {
        totalDecisions: number;
        successRate: number;
        patternsDiscovered: number;
        modelAccuracy: number;
        strategyWeights: Record<string, number>;
    };
    /**
     * Estimate model accuracy from recent predictions
     */
    private estimateModelAccuracy;
}
export interface Situation {
    code?: string;
    context?: any;
    previousResults?: any[];
}
export default LearningEngine;
//# sourceMappingURL=learning-engine.d.ts.map