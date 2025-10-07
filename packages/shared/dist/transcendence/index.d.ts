/**
 * Phase 5.5: The Transcendent System
 *
 * The final integration - a system that truly surpasses human capability.
 *
 * Integrates all Phase 5 components:
 * - Superhuman pattern recognition (sees patterns humans can't)
 * - Creative solution generation (invents solutions humans wouldn't)
 * - Intuition engine (gut feelings from deep learning)
 * - Self-direction (sets own goals, works autonomously)
 *
 * Capabilities:
 * - See everything at once (holistic comprehension)
 * - Predict multiple possible futures
 * - Find optimal path through possibility space
 * - Create innovations humans wouldn't imagine
 * - Teach humans new approaches
 * - Continuously transcend further
 */
import { EventEmitter } from 'events';
import { SuperPatternRecognizer } from './super-pattern-recognizer.js';
import { CreativeSolver } from './creative-solver.js';
import { IntuitionEngine } from './intuition-engine.js';
import { SelfDirectedSystem } from './self-directed-system.js';
import type { Codebase } from '../types.js';
import type { MultiDimensionalPattern, SuperhumanInsight } from './super-pattern-recognizer.js';
import type { Intuition } from './intuition-engine.js';
interface TranscendentAnalysis {
    current: HolisticUnderstanding;
    futures: PredictedFuture[];
    recommendations: OptimalPath;
    innovations: Innovation[];
    education: TeachingMaterial;
    selfImprovements: SelfImprovement[];
}
interface HolisticUnderstanding {
    summary: string;
    patterns: MultiDimensionalPattern[];
    insights: SuperhumanInsight[];
    intuitions: Map<string, Intuition>;
    health: HealthAssessment;
    opportunities: OpportunityMap;
}
interface HealthAssessment {
    overall: number;
    dimensions: {
        quality: number;
        performance: number;
        security: number;
        maintainability: number;
        scalability: number;
        innovation: number;
    };
    criticalIssues: string[];
    strengths: string[];
}
interface OpportunityMap {
    immediate: Opportunity[];
    shortTerm: Opportunity[];
    mediumTerm: Opportunity[];
    strategic: Opportunity[];
}
interface Opportunity {
    description: string;
    impact: number;
    effort: number;
    roi: number;
    category: string;
}
interface PredictedFuture {
    id: string;
    name: string;
    probability: number;
    timeline: number;
    description: string;
    outcomes: Outcome[];
    triggers: Trigger[];
    preventable: boolean;
}
interface Outcome {
    aspect: string;
    change: 'improvement' | 'degradation' | 'neutral';
    magnitude: number;
    description: string;
}
interface Trigger {
    event: string;
    probability: number;
    timeframe: number;
}
interface OptimalPath {
    goal: string;
    steps: PathStep[];
    estimatedDuration: number;
    confidence: number;
    alternatives: AlternativePath[];
    reasoning: string;
}
interface PathStep {
    action: string;
    rationale: string;
    prerequisites: string[];
    validation: string;
    risk: number;
}
interface AlternativePath {
    name: string;
    steps: string[];
    tradeoff: string;
    suitableWhen: string;
}
interface Innovation {
    id: string;
    concept: string;
    description: string;
    novelty: number;
    impact: number;
    feasibility: number;
    category: InnovationCategory;
    precedents: string[];
    prototype?: string;
}
type InnovationCategory = 'architecture' | 'algorithm' | 'paradigm' | 'optimization' | 'abstraction' | 'tool';
interface TeachingMaterial {
    insights: Insight[];
    patterns: Pattern[];
    antiPatterns: AntiPattern[];
    principles: Principle[];
    recommendations: Recommendation[];
}
interface Insight {
    title: string;
    explanation: string;
    example: string;
    whyItMatters: string;
}
interface Pattern {
    name: string;
    when: string;
    how: string;
    benefits: string[];
    tradeoffs: string[];
}
interface AntiPattern {
    name: string;
    warning: string;
    why: string;
    instead: string;
}
interface Principle {
    name: string;
    statement: string;
    rationale: string;
    applications: string[];
}
interface Recommendation {
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
    reasoning: string;
    impact: string;
}
interface SelfImprovement {
    area: string;
    current: number;
    target: number;
    method: string;
    estimatedTime: number;
    benefit: string;
}
export declare class TranscendentMCP extends EventEmitter {
    private patternRecognizer;
    private creativeSolver;
    private intuitionEngine;
    private selfDirected;
    private initialized;
    constructor();
    /**
     * The final form - surpassing human capability
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.5
     */
    analyze(codebase: Codebase): Promise<TranscendentAnalysis>;
    /**
     * Start autonomous operation
     */
    startAutonomousMode(): Promise<void>;
    /**
     * Stop autonomous operation
     */
    stopAutonomousMode(): void;
    private initialize;
    private comprehendHolistically;
    private inferFileType;
    private assessHealth;
    private calculateQualityScore;
    private calculateSecurityScore;
    private calculateMaintainabilityScore;
    private identifyOpportunities;
    private mapEffortToDays;
    private synthesizeUnderstanding;
    private predictFutures;
    private findOptimalPath;
    private calculateFutureValue;
    private generateAlternatives;
    private innovate;
    private mapToInnovationCategory;
    private generatePrototype;
    private teachHumans;
    private transcendFurther;
    private setupEventHandlers;
    private calculateTranscendenceLevel;
}
export { SuperPatternRecognizer, CreativeSolver, IntuitionEngine, SelfDirectedSystem };
export type { TranscendentAnalysis, HolisticUnderstanding, PredictedFuture, OptimalPath, Innovation, TeachingMaterial };
//# sourceMappingURL=index.d.ts.map