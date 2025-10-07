/**
 * Phase 5.1: Superhuman Pattern Recognition
 *
 * Analyzes code across multiple dimensions that humans don't typically consider:
 * - Temporal: How code evolves over time
 * - Spatial: Architectural relationships and dependencies
 * - Semantic: Meaningful connections beyond syntax
 * - Statistical: Probabilistic correlations
 * - Quantum: Multiple valid states and superpositions
 *
 * Finds non-obvious patterns with significance > 0.8 and human obviousness < 0.3
 */
import { EventEmitter } from 'events';
import type { Codebase } from '../types.js';
interface MultiDimensionalPattern {
    id: string;
    type: PatternType;
    dimensions: {
        temporal?: TemporalPattern;
        spatial?: SpatialPattern;
        semantic?: SemanticPattern;
        statistical?: StatisticalPattern;
        quantum?: QuantumPattern;
    };
    significance: number;
    humanObvious: number;
    confidence: number;
    discovered: Date;
    instances: PatternInstance[];
}
type PatternType = 'evolution-convergence' | 'hidden-coupling' | 'emergent-architecture' | 'statistical-anomaly' | 'semantic-drift' | 'quantum-superposition' | 'cross-domain-similarity' | 'predictive-correlation';
interface TemporalPattern {
    type: 'evolution' | 'oscillation' | 'acceleration' | 'decay';
    timeframe: {
        start: Date;
        end: Date;
    };
    velocity: number;
    direction: 'converging' | 'diverging' | 'stable' | 'chaotic';
    cyclePeriod?: number;
    halfLife?: number;
    predictions: TemporalPrediction[];
}
interface TemporalPrediction {
    when: Date;
    what: string;
    probability: number;
    reasoning: string;
}
interface SpatialPattern {
    type: 'cluster' | 'hub-spoke' | 'chain' | 'mesh' | 'isolated';
    nodes: string[];
    edges: Array<{
        from: string;
        to: string;
        strength: number;
    }>;
    centrality: Map<string, number>;
    communities: string[][];
    anomalies: string[];
}
interface SemanticPattern {
    type: 'concept-drift' | 'naming-inconsistency' | 'abstraction-leak' | 'hidden-intent';
    concepts: Map<string, ConceptEvolution>;
    similarityGraph: Map<string, Array<{
        to: string;
        similarity: number;
    }>>;
    abstractionLevels: Map<string, number>;
    intentMismatch: Array<{
        code: string;
        intent: string;
        mismatch: number;
    }>;
}
interface ConceptEvolution {
    name: string;
    meanings: Array<{
        meaning: string;
        confidence: number;
        firstSeen: Date;
    }>;
    drift: number;
}
interface StatisticalPattern {
    type: 'outlier' | 'correlation' | 'distribution-shift' | 'unexpected-frequency';
    metrics: Map<string, number[]>;
    outliers: Array<{
        entity: string;
        metric: string;
        value: number;
        zScore: number;
    }>;
    correlations: Array<{
        a: string;
        b: string;
        coefficient: number;
        pValue: number;
    }>;
    distributions: Map<string, Distribution>;
}
interface Distribution {
    mean: number;
    median: number;
    stdDev: number;
    skewness: number;
    kurtosis: number;
    percentiles: Map<number, number>;
}
interface QuantumPattern {
    type: 'superposition' | 'entanglement' | 'uncertainty';
    states: QuantumState[];
    superpositions: Array<{
        entity: string;
        states: string[];
        weights: number[];
    }>;
    entanglements: Array<{
        entities: string[];
        correlation: number;
    }>;
    uncertainties: Array<{
        entity: string;
        possibleStates: string[];
        entropy: number;
    }>;
}
interface QuantumState {
    id: string;
    description: string;
    probability: number;
    compatible: string[];
    exclusive: string[];
}
interface PatternInstance {
    location: string;
    context: string;
    evidence: string[];
    timestamp: Date;
}
interface SuperhumanInsight {
    id: string;
    pattern: MultiDimensionalPattern;
    description: string;
    whyNotObvious: string;
    businessImpact: BusinessImpact;
    actionable: ActionableRecommendation[];
    visualization: Visualization;
}
interface BusinessImpact {
    category: 'performance' | 'security' | 'maintainability' | 'scalability' | 'cost';
    magnitude: number;
    timeframe: 'immediate' | 'week' | 'month' | 'quarter';
    description: string;
    estimatedValue?: number;
}
interface ActionableRecommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    rationale: string;
    effort: 'trivial' | 'small' | 'medium' | 'large';
    roi: number;
}
interface Visualization {
    type: 'graph' | 'heatmap' | 'timeline' | 'tree' | '3d-space' | 'force-directed';
    data: any;
    mermaid?: string;
    d3?: any;
}
export declare class SuperPatternRecognizer extends EventEmitter {
    private patterns;
    private insights;
    private readonly SIGNIFICANCE_THRESHOLD;
    private readonly HUMAN_OBVIOUS_THRESHOLD;
    private readonly MIN_INSTANCES;
    private readonly TEMPORAL_WINDOW_DAYS;
    private readonly CORRELATION_THRESHOLD;
    private readonly Z_SCORE_THRESHOLD;
    constructor();
    /**
     * Find patterns humans can't see
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.1
     */
    findInvisiblePatterns(codebase: Codebase): Promise<{
        insights: SuperhumanInsight[];
        visualization: Visualization;
        impact: BusinessImpact[];
    }>;
    /**
     * Analyze how code evolves over time
     * Detects: convergence, divergence, oscillations, acceleration
     */
    private codeEvolutionOverTime;
    /**
     * Detect convergence: multiple files evolving toward same pattern
     * Superhuman: Humans rarely track evolution across multiple files simultaneously
     */
    private detectConvergence;
    private calculateEvolutionVector;
    private calculateTrend;
    private findConvergentVectors;
    private cosineSimilarity;
    private detectOscillations;
    private hashState;
    private detectCycles;
    private calculateRegularity;
    private detectAcceleration;
    private detectDecay;
    private predictConvergenceOutcome;
    /**
     * Analyze architectural relationships
     * Detects: hidden coupling, hub-spoke patterns, isolated modules
     */
    private architecturalRelationships;
    private buildDependencyGraph;
    private detectHiddenCoupling;
    private detectHubs;
    private detectIsolated;
    /**
     * Analyze meaningful connections beyond syntax
     * Detects: concept drift, naming inconsistencies, abstraction leaks
     */
    private meaningfulConnections;
    private detectConceptDrift;
    private inferMeaning;
    private detectNamingInconsistencies;
    private extractAllFunctions;
    private calculateSemanticSimilarity;
    private jaccardSimilarity;
    private similarNames;
    /**
     * Analyze probabilistic correlations
     * Detects: outliers, unexpected correlations, distribution shifts
     */
    private probabilisticCorrelations;
    private collectMetrics;
    private detectOutliers;
    private detectCorrelations;
    private pearsonCorrelation;
    private calculatePValue;
    private normalCDF;
    private erf;
    /**
     * Analyze superposition states - code with multiple valid interpretations
     * Superhuman: Humans struggle to hold multiple contradictory interpretations
     */
    private superpositionStates;
    private findSuperpositions;
    private analyzeQuantumStates;
    private normalize;
    private extractStates;
    private findEntanglements;
    /**
     * Combine patterns from all dimensions
     */
    private analyzeMultidimensional;
    private mapTemporalToPatternType;
    private mapSpatialToPatternType;
    private mapSemanticToPatternType;
    private calculateSignificance;
    private calculateHumanObviousness;
    private createInsight;
    private describePattern;
    private explainNonObviousness;
    private assessBusinessImpact;
    private generateRecommendations;
    private visualizePattern;
    private createGraphVisualization;
    private createTimelineVisualization;
    private generateMultiDimensionalView;
    private calculateBusinessImpact;
    private getCodeHistory;
}
export type { MultiDimensionalPattern, PatternType, TemporalPattern, SpatialPattern, SemanticPattern, StatisticalPattern, QuantumPattern, SuperhumanInsight, BusinessImpact, ActionableRecommendation, Visualization };
//# sourceMappingURL=super-pattern-recognizer.d.ts.map