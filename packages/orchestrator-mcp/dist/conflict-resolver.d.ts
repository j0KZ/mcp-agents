/**
 * Conflict Resolution Engine
 * Phase 3.4 of Master Evolution Plan
 *
 * Advanced conflict resolution system that handles disagreements between tools
 * using multiple strategies: mediation, arbitration, synthesis, and voting.
 */
import { EventEmitter } from 'events';
import { ExplanationEngine } from '@j0kz/shared';
export interface Conflict {
    id: string;
    topic: string;
    domain: string;
    participants: string[];
    positions: Position[];
    severity: 'minor' | 'moderate' | 'major' | 'critical';
    type: ConflictType;
    context: ConflictContext;
    timestamp: Date;
}
export interface Position {
    participant: string;
    stance: any;
    confidence: number;
    rationale: string[];
    evidence: Evidence[];
    flexibility: number;
}
export interface Evidence {
    type: 'empirical' | 'logical' | 'authoritative' | 'experiential';
    description: string;
    strength: number;
    verifiable: boolean;
    source?: string;
}
export type ConflictType = 'value-disagreement' | 'interpretation' | 'methodology' | 'priority' | 'scope' | 'definition' | 'prediction';
export interface ConflictContext {
    importance: number;
    timeConstraint?: number;
    stakeholders: string[];
    previousConflicts?: string[];
    requirements?: {
        mustResolve: boolean;
        minimumAgreement?: number;
        canDefer?: boolean;
    };
}
export interface Resolution {
    conflictId: string;
    method: ResolutionMethod;
    outcome: any;
    explanation: string[];
    agreementLevel: number;
    dissent: Dissent[];
    compromises: Compromise[];
    duration: number;
    confidence: number;
    followUp?: FollowUpAction[];
}
export type ResolutionMethod = 'mediation' | 'arbitration' | 'synthesis' | 'voting' | 'deferral' | 'escalation' | 'evidence-evaluation' | 'compromise' | 'partition';
export interface Dissent {
    participant: string;
    reason: string;
    severity: 'accepts' | 'reservations' | 'strongly-opposes';
    conditions?: string[];
}
export interface Compromise {
    aspect: string;
    original: any;
    compromised: any;
    participants: string[];
}
export interface FollowUpAction {
    action: string;
    assignedTo: string;
    deadline?: Date;
    reason: string;
}
export declare class ConflictResolver extends EventEmitter {
    private activeConflicts;
    private resolutionHistory;
    private mediationStrategies;
    private explanationEngine;
    private readonly MAX_MEDIATION_ROUNDS;
    private readonly AGREEMENT_THRESHOLD;
    private readonly EVIDENCE_WEIGHT;
    private readonly EXPERTISE_WEIGHT;
    private readonly CONSENSUS_WEIGHT;
    constructor(explanationEngine: ExplanationEngine);
    /**
     * Initialize mediation strategies for different conflict types
     */
    private initializeMediationStrategies;
    /**
     * Resolve conflict between tools
     */
    resolveConflict(conflict: Conflict): Promise<Resolution>;
    /**
     * Select appropriate resolution method
     */
    private selectResolutionMethod;
    /**
     * Mediation - facilitate agreement through structured dialogue
     */
    private mediate;
    /**
     * Execute mediation step
     */
    private executeMediationStep;
    /**
     * Calculate agreement level between positions
     */
    private calculateAgreement;
    /**
     * Score evidence quality
     */
    private scoreEvidence;
    /**
     * Find common ground between positions
     */
    private findCommonGround;
    /**
     * Find middle ground between positions
     */
    private findMiddleGround;
    /**
     * Adjust position toward middle ground
     */
    private adjustTowardMiddle;
    /**
     * Adjust positions for next mediation round
     */
    private adjustPositions;
    /**
     * Synthesize outcome from positions
     */
    private synthesizeOutcome;
    /**
     * Identify dissenting positions
     */
    private identifyDissent;
    /**
     * Arbitration - have expert or system decide
     */
    private arbitrate;
    /**
     * Synthesis - combine positions into new solution
     */
    private synthesize;
    /**
     * Voting - democratic decision
     */
    private conductVoting;
    /**
     * Evidence evaluation - best evidence wins
     */
    private evaluateEvidence;
    /**
     * Compromise - find middle ground
     */
    private findCompromise;
    /**
     * Partition - split decision into sub-decisions
     */
    private partition;
    /**
     * Defer - postpone decision
     */
    private defer;
    /**
     * Escalate - human decision needed
     */
    private escalate;
    /**
     * Get resolution statistics
     */
    getStatistics(): {
        totalResolutions: number;
        methodDistribution: Map<ResolutionMethod, number>;
        averageAgreement: number;
        averageDuration: number;
        escalationRate: number;
    };
}
export default ConflictResolver;
//# sourceMappingURL=conflict-resolver.d.ts.map