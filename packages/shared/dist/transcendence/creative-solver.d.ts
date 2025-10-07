/**
 * Phase 5.2: Creative Solution Generation
 *
 * Generates novel solutions by:
 * - Combining existing solutions in new ways
 * - Applying cross-domain knowledge
 * - Creating completely new approaches
 * - Evaluating solutions for novelty and effectiveness
 *
 * Returns solutions with score > 0.9 OR novelty > 0.8
 * True innovation: solutions humans wouldn't think of
 */
import { EventEmitter } from 'events';
interface Problem {
    id: string;
    type: ProblemType;
    description: string;
    context: ProblemContext;
    constraints: Constraint[];
    goals: Goal[];
    existingSolutions?: Solution[];
}
type ProblemType = 'performance' | 'architecture' | 'maintainability' | 'security' | 'scalability' | 'complexity' | 'technical-debt';
interface ProblemContext {
    codebase: string;
    domain: string;
    scale: 'small' | 'medium' | 'large' | 'enterprise';
    technology: string[];
    teamSize: number;
    timeline: 'urgent' | 'normal' | 'flexible';
}
interface Constraint {
    type: 'technical' | 'business' | 'resource' | 'regulatory';
    description: string;
    severity: 'hard' | 'soft';
    impact: number;
}
interface Goal {
    metric: string;
    target: number;
    weight: number;
}
interface Solution {
    id: string;
    approach: string;
    description: string;
    implementation: ImplementationPlan;
    score: number;
    novelty: number;
    feasibility: number;
    risk: number;
    effort: Effort;
    benefits: Benefit[];
    tradeoffs: Tradeoff[];
    alternatives: string[];
    inspirations: string[];
}
interface ImplementationPlan {
    phases: Phase[];
    estimatedTime: number;
    requiredSkills: string[];
    dependencies: string[];
    risks: Risk[];
}
interface Phase {
    name: string;
    steps: Step[];
    duration: number;
    deliverable: string;
}
interface Step {
    action: string;
    details: string;
    prerequisites: string[];
    validation: string;
}
interface Risk {
    description: string;
    probability: number;
    impact: number;
    mitigation: string;
}
interface Effort {
    category: 'trivial' | 'small' | 'medium' | 'large' | 'xl';
    personDays: number;
    complexity: number;
}
interface Benefit {
    type: 'performance' | 'maintainability' | 'security' | 'scalability' | 'cost';
    description: string;
    magnitude: number;
    measurable: boolean;
    metric?: string;
}
interface Tradeoff {
    gives: string;
    takes: string;
    worthIt: boolean;
    reasoning: string;
}
interface KnownSolution {
    name: string;
    domain: string;
    approach: string;
    effectiveness: number;
    applicability: number;
}
interface CrossDomainInsight {
    fromDomain: string;
    toDomain: string;
    concept: string;
    adaptation: string;
    novelty: number;
}
interface NovelApproach {
    concept: string;
    description: string;
    reasoning: string;
    precedents: string[];
    newness: number;
}
export declare class CreativeSolver extends EventEmitter {
    private knowledgeBase;
    private crossDomainMappings;
    private readonly SCORE_THRESHOLD;
    private readonly NOVELTY_THRESHOLD;
    private readonly COMBINATION_DEPTH;
    private readonly MIN_NOVELTY;
    private readonly CROSS_DOMAIN_BONUS;
    constructor();
    /**
     * Generate novel solutions
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.2
     */
    createNovelSolution(problem: Problem): Promise<Solution[]>;
    private findKnownSolutions;
    private calculateApplicability;
    private generateCombinations;
    private combineSolutions;
    private synthesizeCombination;
    private identifyStrength;
    private estimateFeasibility;
    private estimateRisk;
    private estimateEffort;
    private identifyBenefits;
    private identifyTradeoffs;
    private applyCrossDomainKnowledge;
    private findCrossDomainInsights;
    private adaptCrossDomainInsight;
    private generateNovelApproaches;
    /**
     * Reverse thinking: What if we did the opposite?
     */
    private reverseThinking;
    /**
     * Analogical reasoning: Apply concepts from nature, physics, biology
     */
    private analogicalReasoning;
    /**
     * First principles: Break down to fundamentals and rebuild
     */
    private firstPrinciples;
    /**
     * Constraint relaxation: What if key constraints didn't exist?
     */
    private constraintRelaxation;
    /**
     * Random combination: Force unrelated concepts together
     */
    private randomCombination;
    private novelApproachToSolution;
    private evaluateSolutions;
    private evaluateScore;
    private evaluateFeasibility;
    private evaluateRisk;
    private createImplementationPlan;
    private identifyRequiredSkills;
    private initializeKnowledgeBase;
    private initializeCrossDomainMappings;
}
export type { Problem, ProblemType, ProblemContext, Solution, ImplementationPlan, KnownSolution, CrossDomainInsight, NovelApproach };
//# sourceMappingURL=creative-solver.d.ts.map