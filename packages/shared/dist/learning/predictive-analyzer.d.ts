/**
 * Predictive Analyzer
 * Phase 4.3 of Master Evolution Plan
 *
 * Predicts future issues before they happen by analyzing history,
 * detecting patterns, and analyzing trends exactly as specified in the plan.
 * Provides immediate, short-term, and long-term recommendations.
 */
import { EventEmitter } from 'events';
import { LearningEngine } from './learning-engine.js';
export interface Codebase {
    id: string;
    name: string;
    files: CodeFile[];
    history: HistoryEntry[];
    metrics: CodebaseMetrics;
}
export interface CodeFile {
    path: string;
    content: string;
    lastModified: Date;
    changeFrequency: number;
    contributors: number;
}
export interface HistoryEntry {
    timestamp: Date;
    type: 'commit' | 'bug' | 'performance-issue' | 'security-issue' | 'refactoring';
    description: string;
    affectedFiles: string[];
    severity?: 'low' | 'medium' | 'high' | 'critical';
}
export interface CodebaseMetrics {
    complexity: number;
    testCoverage: number;
    bugDensity: number;
    technicalDebt: number;
    securityScore: number;
}
export interface PredictionResult {
    likelyBugs: BugPrediction[];
    performanceIssues: PerformancePrediction[];
    securityRisks: SecurityPrediction[];
    technicalDebt: TechnicalDebtPrediction;
    recommendations: Recommendations;
    confidence: number;
}
export interface BugPrediction {
    file: string;
    probability: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    suggestedAction: string;
    timeframe: 'days' | 'weeks' | 'months';
}
export interface PerformancePrediction {
    component: string;
    issue: string;
    probability: number;
    expectedImpact: string;
    trend: 'improving' | 'stable' | 'degrading';
    suggestedAction: string;
}
export interface SecurityPrediction {
    type: string;
    probability: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location?: string;
    suggestedAction: string;
}
export interface TechnicalDebtPrediction {
    currentDebt: number;
    growthRate: number;
    projectedDebt: {
        oneWeek: number;
        oneMonth: number;
        threeMonths: number;
    };
    criticalAreas: string[];
}
export interface Recommendations {
    immediate: string[];
    thisWeek: string[];
    thisMonth: string[];
    strategic: string[];
}
export interface PatternDetectionResult {
    patterns: DetectedPattern[];
    confidence: number;
}
export interface DetectedPattern {
    name: string;
    description: string;
    occurrences: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    significance: number;
}
export interface TrendAnalysisResult {
    trends: Trend[];
    predictions: any[];
}
export interface Trend {
    metric: string;
    direction: 'up' | 'down' | 'stable';
    rate: number;
    confidence: number;
}
export declare class PredictiveAnalyzer extends EventEmitter {
    private learningEngine;
    private predictionHistory;
    constructor(learningEngine: LearningEngine);
    /**
     * Predict future issues
     * This is the main prediction method from the plan
     */
    predictFuture(codebase: Codebase): Promise<PredictionResult>;
    /**
     * Detect patterns in history
     */
    private detectPatterns;
    /**
     * Analyze trends from patterns
     */
    private analyzeTrends;
    /**
     * Predict bugs
     */
    private predictBugs;
    /**
     * Predict performance bottlenecks
     */
    private predictBottlenecks;
    /**
     * Predict security vulnerabilities
     */
    private predictVulnerabilities;
    /**
     * Predict technical debt growth
     */
    private predictDebt;
    /**
     * Generate actionable recommendations
     */
    private generateRecommendations;
    /**
     * Calculate overall confidence
     */
    private calculateOverallConfidence;
    /**
     * Store prediction for learning
     */
    private storePrediction;
    /**
     * Validate predictions against actual outcomes
     */
    validatePredictions(codebaseId: string, actualOutcomes: ActualOutcome[]): Promise<ValidationResult>;
    /**
     * Get prediction statistics
     */
    getStatistics(): {
        totalPredictions: number;
        avgConfidence: number;
        predictionsByCodebase: number;
    };
}
export interface ActualOutcome {
    type: 'bug' | 'performance-issue' | 'security-issue';
    location: string;
    severity: string;
    timestamp: Date;
}
export interface ValidationResult {
    accuracy: number;
    precision: number;
    recall: number;
    details: string;
}
export default PredictiveAnalyzer;
//# sourceMappingURL=predictive-analyzer.d.ts.map