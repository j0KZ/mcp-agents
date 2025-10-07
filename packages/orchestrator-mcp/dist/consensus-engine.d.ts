/**
 * Consensus Engine
 * Phase 3.2 of Master Evolution Plan
 *
 * Advanced consensus mechanism that goes beyond simple voting to achieve
 * intelligent agreement between tools, considering expertise, confidence,
 * and evidence quality.
 */
import { EventEmitter } from 'events';
export interface ConsensusParticipant {
    id: string;
    expertise: string[];
    reliability: number;
    confidence: number;
    specialization: Map<string, number>;
}
export interface Opinion {
    participant: string;
    value: any;
    confidence: number;
    evidence: Evidence[];
    reasoning: string[];
    timestamp: Date;
}
export interface Evidence {
    type: 'empirical' | 'theoretical' | 'experiential' | 'referenced';
    source: string;
    strength: 'weak' | 'moderate' | 'strong';
    data: any;
}
export interface ConsensusRequest {
    topic: string;
    domain?: string;
    opinions: Opinion[];
    requirements: {
        minimumAgreement?: number;
        timeLimit?: number;
        evidenceRequired?: boolean;
        expertiseWeight?: number;
    };
}
export interface ConsensusResult {
    topic: string;
    finalValue: any;
    agreementLevel: number;
    confidence: number;
    method: ConsensusMethod;
    participants: string[];
    dissenting: DissentingOpinion[];
    explanation: string[];
    evidence: Evidence[];
}
export interface DissentingOpinion {
    participant: string;
    value: any;
    reasoning: string;
    weight: number;
}
export type ConsensusMethod = 'unanimous' | 'weighted-majority' | 'expert-led' | 'evidence-based' | 'byzantine-fault-tolerant' | 'delphi-method' | 'hybrid';
export interface ConsensusStrategy {
    method: ConsensusMethod;
    apply(request: ConsensusRequest, participants: Map<string, ConsensusParticipant>): ConsensusResult;
}
export declare class ConsensusEngine extends EventEmitter {
    private participants;
    private strategies;
    private consensusHistory;
    private trustScores;
    constructor();
    /**
     * Initialize consensus strategies
     */
    private initializeStrategies;
    /**
     * Initialize tool participants
     */
    private initializeParticipants;
    /**
     * Reach consensus using appropriate strategy
     */
    reachConsensus(request: ConsensusRequest): Promise<ConsensusResult>;
    /**
     * Select optimal consensus strategy
     */
    private selectStrategy;
    /**
     * Select relevant participants for consensus
     */
    private selectParticipants;
    /**
     * Check if we have domain experts
     */
    private hasDomainExperts;
    /**
     * Unanimous consensus strategy
     */
    private unanimousConsensus;
    /**
     * Weighted majority consensus
     */
    private weightedMajorityConsensus;
    /**
     * Calculate participant weight
     */
    private calculateWeight;
    /**
     * Score evidence quality
     */
    private scoreEvidence;
    /**
     * Expert-led consensus
     */
    private expertLedConsensus;
    /**
     * Evidence-based consensus
     */
    private evidenceBasedConsensus;
    /**
     * Calculate agreement based on evidence similarity
     */
    private calculateEvidenceAgreement;
    /**
     * Byzantine fault-tolerant consensus (resistant to bad actors)
     */
    private byzantineConsensus;
    /**
     * Delphi method - iterative consensus
     */
    private delphiMethodConsensus;
    /**
     * Refine opinions based on interim consensus (Delphi simulation)
     */
    private refineOpinions;
    /**
     * Hybrid consensus - combines multiple methods
     */
    private hybridConsensus;
    /**
     * Calculate average confidence
     */
    private calculateAverageConfidence;
    /**
     * Calculate weighted confidence
     */
    private calculateWeightedConfidence;
    /**
     * Aggregate evidence from multiple opinions
     */
    private aggregateEvidence;
    /**
     * Compare evidence strength
     */
    private compareEvidenceStrength;
    /**
     * Find dissenting opinions
     */
    private findDissenting;
    /**
     * Update trust scores based on consensus outcome
     */
    private updateTrustScores;
    /**
     * Get consensus metrics for analysis
     */
    getConsensusMetrics(): {
        totalConsensusReached: number;
        averageAgreement: number;
        methodDistribution: Map<ConsensusMethod, number>;
        participantPerformance: Map<string, number>;
    };
}
export default ConsensusEngine;
//# sourceMappingURL=consensus-engine.d.ts.map