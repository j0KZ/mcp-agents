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
  reliability: number; // 0-1, based on historical accuracy
  confidence: number; // 0-1, self-reported confidence
  specialization: Map<string, number>; // Domain -> expertise level
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
    minimumAgreement?: number; // 0-1
    timeLimit?: number; // milliseconds
    evidenceRequired?: boolean;
    expertiseWeight?: number; // 0-1, how much to weight expertise
  };
}

export interface ConsensusResult {
  topic: string;
  finalValue: any;
  agreementLevel: number; // 0-1
  confidence: number; // 0-1
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

export type ConsensusMethod =
  | 'unanimous'
  | 'weighted-majority'
  | 'expert-led'
  | 'evidence-based'
  | 'byzantine-fault-tolerant'
  | 'delphi-method'
  | 'hybrid';

export interface ConsensusStrategy {
  method: ConsensusMethod;
  apply(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult;
}

export class ConsensusEngine extends EventEmitter {
  private participants: Map<string, ConsensusParticipant> = new Map();
  private strategies: Map<ConsensusMethod, ConsensusStrategy> = new Map();
  private consensusHistory: ConsensusResult[] = [];
  private trustScores: Map<string, number> = new Map(); // Dynamic trust scoring

  constructor() {
    super();
    this.initializeStrategies();
    this.initializeParticipants();
  }

  /**
   * Initialize consensus strategies
   */
  private initializeStrategies(): void {
    // Unanimous consensus - all must agree
    this.strategies.set('unanimous', {
      method: 'unanimous',
      apply: (request, participants) => this.unanimousConsensus(request, participants),
    });

    // Weighted majority - weight by expertise and reliability
    this.strategies.set('weighted-majority', {
      method: 'weighted-majority',
      apply: (request, participants) => this.weightedMajorityConsensus(request, participants),
    });

    // Expert-led - defer to domain experts
    this.strategies.set('expert-led', {
      method: 'expert-led',
      apply: (request, participants) => this.expertLedConsensus(request, participants),
    });

    // Evidence-based - strongest evidence wins
    this.strategies.set('evidence-based', {
      method: 'evidence-based',
      apply: (request, participants) => this.evidenceBasedConsensus(request, participants),
    });

    // Byzantine fault tolerant - resistant to malicious actors
    this.strategies.set('byzantine-fault-tolerant', {
      method: 'byzantine-fault-tolerant',
      apply: (request, participants) => this.byzantineConsensus(request, participants),
    });

    // Delphi method - iterative refinement
    this.strategies.set('delphi-method', {
      method: 'delphi-method',
      apply: (request, participants) => this.delphiMethodConsensus(request, participants),
    });

    // Hybrid - combines multiple strategies
    this.strategies.set('hybrid', {
      method: 'hybrid',
      apply: (request, participants) => this.hybridConsensus(request, participants),
    });
  }

  /**
   * Initialize tool participants
   */
  private initializeParticipants(): void {
    // Smart Reviewer
    this.participants.set('smart-reviewer', {
      id: 'smart-reviewer',
      expertise: ['code-quality', 'patterns', 'metrics', 'best-practices'],
      reliability: 0.92,
      confidence: 0.85,
      specialization: new Map([
        ['code-quality', 0.95],
        ['patterns', 0.9],
        ['security', 0.6],
        ['testing', 0.7],
      ]),
    });

    // Security Scanner
    this.participants.set('security-scanner', {
      id: 'security-scanner',
      expertise: ['security', 'vulnerabilities', 'compliance', 'owasp'],
      reliability: 0.94,
      confidence: 0.9,
      specialization: new Map([
        ['security', 0.98],
        ['compliance', 0.92],
        ['code-quality', 0.65],
        ['patterns', 0.6],
      ]),
    });

    // Test Generator
    this.participants.set('test-generator', {
      id: 'test-generator',
      expertise: ['testing', 'coverage', 'edge-cases', 'mocking'],
      reliability: 0.88,
      confidence: 0.8,
      specialization: new Map([
        ['testing', 0.95],
        ['coverage', 0.9],
        ['code-quality', 0.7],
        ['patterns', 0.65],
      ]),
    });

    // Architecture Analyzer
    this.participants.set('architecture-analyzer', {
      id: 'architecture-analyzer',
      expertise: ['architecture', 'dependencies', 'modularity', 'coupling'],
      reliability: 0.91,
      confidence: 0.87,
      specialization: new Map([
        ['architecture', 0.96],
        ['patterns', 0.85],
        ['code-quality', 0.75],
        ['testing', 0.5],
      ]),
    });

    // Refactor Assistant
    this.participants.set('refactor-assistant', {
      id: 'refactor-assistant',
      expertise: ['refactoring', 'patterns', 'clean-code', 'optimization'],
      reliability: 0.89,
      confidence: 0.82,
      specialization: new Map([
        ['refactoring', 0.94],
        ['patterns', 0.88],
        ['code-quality', 0.85],
        ['architecture', 0.7],
      ]),
    });
  }

  /**
   * Reach consensus using appropriate strategy
   */
  async reachConsensus(request: ConsensusRequest): Promise<ConsensusResult> {
    const startTime = Date.now();

    // Select strategy based on context
    const strategy = this.selectStrategy(request);

    // Get relevant participants
    const relevantParticipants = this.selectParticipants(request);

    // Apply strategy
    const result = strategy.apply(request, relevantParticipants);

    // Update trust scores based on outcome
    await this.updateTrustScores(result);

    // Store for learning
    this.consensusHistory.push(result);

    // Emit consensus event
    this.emit('consensus:reached', {
      topic: request.topic,
      method: result.method,
      agreement: result.agreementLevel,
      duration: Date.now() - startTime,
    });

    return result;
  }

  /**
   * Select optimal consensus strategy
   */
  private selectStrategy(request: ConsensusRequest): ConsensusStrategy {
    // High agreement requirement -> unanimous or BFT
    if (request.requirements.minimumAgreement && request.requirements.minimumAgreement > 0.95) {
      return this.strategies.get('unanimous')!;
    }

    // Evidence required -> evidence-based
    if (request.requirements.evidenceRequired) {
      return this.strategies.get('evidence-based')!;
    }

    // Domain-specific -> expert-led
    if (request.domain && this.hasDomainExperts(request.domain)) {
      return this.strategies.get('expert-led')!;
    }

    // Time constraint -> weighted majority (fastest)
    if (request.requirements.timeLimit && request.requirements.timeLimit < 1000) {
      return this.strategies.get('weighted-majority')!;
    }

    // Complex topic -> hybrid approach
    if (request.opinions.length > 5) {
      return this.strategies.get('hybrid')!;
    }

    // Default to weighted majority
    return this.strategies.get('weighted-majority')!;
  }

  /**
   * Select relevant participants for consensus
   */
  private selectParticipants(request: ConsensusRequest): Map<string, ConsensusParticipant> {
    const relevant = new Map<string, ConsensusParticipant>();

    // Get participants who provided opinions
    const opinionProviders = new Set(request.opinions.map(o => o.participant));

    for (const [id, participant] of this.participants.entries()) {
      if (opinionProviders.has(id)) {
        relevant.set(id, participant);
      } else if (request.domain) {
        // Add domain experts even if they didn't provide initial opinion
        const domainExpertise = participant.specialization.get(request.domain) || 0;
        if (domainExpertise > 0.8) {
          relevant.set(id, participant);
        }
      }
    }

    return relevant;
  }

  /**
   * Check if we have domain experts
   */
  private hasDomainExperts(domain: string): boolean {
    for (const participant of this.participants.values()) {
      const expertise = participant.specialization.get(domain) || 0;
      if (expertise > 0.8) {
        return true;
      }
    }
    return false;
  }

  /**
   * Unanimous consensus strategy
   */
  private unanimousConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    const values = new Map<string, number>();

    // Count occurrences
    for (const opinion of request.opinions) {
      const key = JSON.stringify(opinion.value);
      values.set(key, (values.get(key) || 0) + 1);
    }

    // Check for unanimity
    if (values.size === 1) {
      const [unanimousValue] = values.keys();
      return {
        topic: request.topic,
        finalValue: JSON.parse(unanimousValue),
        agreementLevel: 1.0,
        confidence: this.calculateAverageConfidence(request.opinions),
        method: 'unanimous',
        participants: request.opinions.map(o => o.participant),
        dissenting: [],
        explanation: ['All participants agreed on the same value'],
        evidence: this.aggregateEvidence(request.opinions),
      };
    }

    // No unanimity - fall back to weighted majority
    return this.weightedMajorityConsensus(request, participants);
  }

  /**
   * Weighted majority consensus
   */
  private weightedMajorityConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    const weightedVotes = new Map<string, number>();
    const opinionMap = new Map<string, Opinion[]>();

    // Calculate weighted votes
    for (const opinion of request.opinions) {
      const participant = participants.get(opinion.participant);
      if (!participant) continue;

      // Calculate weight
      const weight = this.calculateWeight(participant, opinion, request);
      const key = JSON.stringify(opinion.value);

      weightedVotes.set(key, (weightedVotes.get(key) || 0) + weight);

      if (!opinionMap.has(key)) {
        opinionMap.set(key, []);
      }
      opinionMap.get(key)!.push(opinion);
    }

    // Find winner
    let maxWeight = 0;
    let winner: string | null = null;

    for (const [value, weight] of weightedVotes.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight;
        winner = value;
      }
    }

    if (!winner) {
      throw new Error('No consensus could be reached');
    }

    // Calculate agreement level
    const totalWeight = Array.from(weightedVotes.values()).reduce((a, b) => a + b, 0);
    const agreementLevel = maxWeight / totalWeight;

    // Identify dissenting opinions
    const dissenting: DissentingOpinion[] = [];
    for (const [value, weight] of weightedVotes.entries()) {
      if (value !== winner) {
        const opinions = opinionMap.get(value) || [];
        for (const opinion of opinions) {
          dissenting.push({
            participant: opinion.participant,
            value: JSON.parse(value),
            reasoning: opinion.reasoning.join(' '),
            weight: weight / totalWeight,
          });
        }
      }
    }

    return {
      topic: request.topic,
      finalValue: JSON.parse(winner),
      agreementLevel,
      confidence: this.calculateWeightedConfidence(request.opinions, participants),
      method: 'weighted-majority',
      participants: request.opinions.map(o => o.participant),
      dissenting,
      explanation: [
        `Weighted majority consensus reached with ${(agreementLevel * 100).toFixed(1)}% agreement`,
        `Winning opinion had weight of ${maxWeight.toFixed(2)}`,
        dissenting.length > 0
          ? `${dissenting.length} dissenting opinions recorded`
          : 'No dissenting opinions',
      ],
      evidence: this.aggregateEvidence(opinionMap.get(winner) || []),
    };
  }

  /**
   * Calculate participant weight
   */
  private calculateWeight(
    participant: ConsensusParticipant,
    opinion: Opinion,
    request: ConsensusRequest
  ): number {
    let weight = 1.0;

    // Factor 1: Reliability (historical accuracy)
    weight *= participant.reliability;

    // Factor 2: Confidence (self-reported)
    weight *= opinion.confidence;

    // Factor 3: Domain expertise
    if (request.domain) {
      const domainExpertise = participant.specialization.get(request.domain) || 0.5;
      weight *= domainExpertise;
    }

    // Factor 4: Evidence quality
    const evidenceScore = this.scoreEvidence(opinion.evidence);
    weight *= evidenceScore;

    // Factor 5: Trust score (dynamic)
    const trustScore = this.trustScores.get(participant.id) || 1.0;
    weight *= trustScore;

    // Apply expertise weight if specified
    if (request.requirements.expertiseWeight !== undefined) {
      const expertiseBonus = participant.expertise.length / 10; // Max 1.0 for 10 expertise areas
      weight =
        weight * (1 - request.requirements.expertiseWeight) +
        weight * expertiseBonus * request.requirements.expertiseWeight;
    }

    return weight;
  }

  /**
   * Score evidence quality
   */
  private scoreEvidence(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0.5;

    let totalScore = 0;
    for (const e of evidence) {
      let score = 0.5;

      // Type scoring
      switch (e.type) {
        case 'empirical':
          score = 1.0;
          break;
        case 'experiential':
          score = 0.8;
          break;
        case 'referenced':
          score = 0.7;
          break;
        case 'theoretical':
          score = 0.6;
          break;
      }

      // Strength modifier
      switch (e.strength) {
        case 'strong':
          score *= 1.0;
          break;
        case 'moderate':
          score *= 0.8;
          break;
        case 'weak':
          score *= 0.6;
          break;
      }

      totalScore += score;
    }

    return Math.min(totalScore / evidence.length, 1.0);
  }

  /**
   * Expert-led consensus
   */
  private expertLedConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    if (!request.domain) {
      return this.weightedMajorityConsensus(request, participants);
    }

    // Find top experts in domain
    const experts: { id: string; expertise: number }[] = [];

    for (const [id, participant] of participants.entries()) {
      const expertise = participant.specialization.get(request.domain) || 0;
      if (expertise > 0.7) {
        experts.push({ id, expertise });
      }
    }

    // Sort by expertise
    experts.sort((a, b) => b.expertise - a.expertise);

    if (experts.length === 0) {
      return this.weightedMajorityConsensus(request, participants);
    }

    // Get expert opinions
    const expertOpinions = request.opinions.filter(o => experts.some(e => e.id === o.participant));

    if (expertOpinions.length === 0) {
      return this.weightedMajorityConsensus(request, participants);
    }

    // Weight expert opinions more heavily
    const expertWeight = 2.0;
    const weightedOpinions = request.opinions.map(o => ({
      ...o,
      confidence: experts.some(e => e.id === o.participant)
        ? o.confidence * expertWeight
        : o.confidence,
    }));

    // Use weighted consensus with expert bias
    const modifiedRequest = { ...request, opinions: weightedOpinions };
    const result = this.weightedMajorityConsensus(modifiedRequest, participants);

    return {
      ...result,
      method: 'expert-led',
      explanation: [
        `Expert-led consensus in domain: ${request.domain}`,
        `${experts.length} experts identified with expertise > 0.7`,
        `Top expert: ${experts[0].id} (expertise: ${experts[0].expertise.toFixed(2)})`,
        ...result.explanation,
      ],
    };
  }

  /**
   * Evidence-based consensus
   */
  private evidenceBasedConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    // Score each opinion by evidence quality
    const scoredOpinions = request.opinions.map(opinion => ({
      opinion,
      score: this.scoreEvidence(opinion.evidence) * opinion.confidence,
    }));

    // Sort by score
    scoredOpinions.sort((a, b) => b.score - a.score);

    if (scoredOpinions.length === 0 || scoredOpinions[0].score === 0) {
      return this.weightedMajorityConsensus(request, participants);
    }

    // Winner is highest evidence score
    const winner = scoredOpinions[0];

    // Calculate agreement based on evidence similarity
    const agreementLevel = this.calculateEvidenceAgreement(scoredOpinions);

    // Find dissenting opinions
    const dissenting: DissentingOpinion[] = scoredOpinions
      .slice(1)
      .filter(s => JSON.stringify(s.opinion.value) !== JSON.stringify(winner.opinion.value))
      .map(s => ({
        participant: s.opinion.participant,
        value: s.opinion.value,
        reasoning: `Evidence score: ${s.score.toFixed(2)}`,
        weight: s.score / winner.score,
      }));

    return {
      topic: request.topic,
      finalValue: winner.opinion.value,
      agreementLevel,
      confidence: winner.score,
      method: 'evidence-based',
      participants: request.opinions.map(o => o.participant),
      dissenting,
      explanation: [
        `Evidence-based consensus selected opinion with strongest evidence`,
        `Winner evidence score: ${winner.score.toFixed(2)}`,
        `Evidence types: ${winner.opinion.evidence.map(e => e.type).join(', ')}`,
        `Agreement level: ${(agreementLevel * 100).toFixed(1)}%`,
      ],
      evidence: winner.opinion.evidence,
    };
  }

  /**
   * Calculate agreement based on evidence similarity
   */
  private calculateEvidenceAgreement(scoredOpinions: any[]): number {
    if (scoredOpinions.length <= 1) return 1.0;

    const topScore = scoredOpinions[0].score;
    const secondScore = scoredOpinions[1]?.score || 0;

    // Higher difference = higher agreement
    const scoreDifference = topScore - secondScore;
    const maxDifference = topScore;

    return maxDifference > 0 ? scoreDifference / maxDifference : 0.5;
  }

  /**
   * Byzantine fault-tolerant consensus (resistant to bad actors)
   */
  private byzantineConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    // Assuming up to 1/3 of participants could be faulty
    const f = Math.floor(request.opinions.length / 3);
    const requiredAgreement = request.opinions.length - f;

    // Group opinions by value
    const groups = new Map<string, Opinion[]>();
    for (const opinion of request.opinions) {
      const key = JSON.stringify(opinion.value);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(opinion);
    }

    // Find value with enough agreement
    for (const [value, opinions] of groups.entries()) {
      if (opinions.length >= requiredAgreement) {
        return {
          topic: request.topic,
          finalValue: JSON.parse(value),
          agreementLevel: opinions.length / request.opinions.length,
          confidence: this.calculateAverageConfidence(opinions),
          method: 'byzantine-fault-tolerant',
          participants: request.opinions.map(o => o.participant),
          dissenting: this.findDissenting(request.opinions, JSON.parse(value)),
          explanation: [
            `Byzantine consensus reached with ${opinions.length}/${request.opinions.length} agreement`,
            `Tolerance: up to ${f} faulty participants`,
            `Required agreement: ${requiredAgreement} participants`,
          ],
          evidence: this.aggregateEvidence(opinions),
        };
      }
    }

    // No Byzantine agreement - fall back
    return this.weightedMajorityConsensus(request, participants);
  }

  /**
   * Delphi method - iterative consensus
   */
  private delphiMethodConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    // This would normally involve multiple rounds
    // For now, simulate with weighted analysis

    // Round 1: Initial opinions
    let currentOpinions = [...request.opinions];
    let rounds = 1;
    const maxRounds = 3;

    while (rounds < maxRounds) {
      // Calculate current consensus
      const interim = this.weightedMajorityConsensus(
        { ...request, opinions: currentOpinions },
        participants
      );

      // Check if agreement is sufficient
      if (interim.agreementLevel > 0.8) {
        return {
          ...interim,
          method: 'delphi-method',
          explanation: [
            `Delphi method consensus after ${rounds} rounds`,
            `Final agreement: ${(interim.agreementLevel * 100).toFixed(1)}%`,
            ...interim.explanation,
          ],
        };
      }

      // Simulate opinion refinement
      currentOpinions = this.refineOpinions(currentOpinions, interim);
      rounds++;
    }

    // Final round
    const finalResult = this.weightedMajorityConsensus(
      { ...request, opinions: currentOpinions },
      participants
    );

    return {
      ...finalResult,
      method: 'delphi-method',
      explanation: [`Delphi method consensus after ${rounds} rounds`, ...finalResult.explanation],
    };
  }

  /**
   * Refine opinions based on interim consensus (Delphi simulation)
   */
  private refineOpinions(opinions: Opinion[], interim: ConsensusResult): Opinion[] {
    return opinions.map(opinion => {
      // Participants adjust confidence based on consensus
      const agreesWithConsensus =
        JSON.stringify(opinion.value) === JSON.stringify(interim.finalValue);

      const adjustedConfidence = agreesWithConsensus
        ? Math.min(opinion.confidence * 1.1, 1.0) // Increase if agrees
        : opinion.confidence * 0.95; // Slightly decrease if disagrees

      return {
        ...opinion,
        confidence: adjustedConfidence,
        reasoning: [
          ...opinion.reasoning,
          `Adjusted after round (agreement: ${interim.agreementLevel.toFixed(2)})`,
        ],
      };
    });
  }

  /**
   * Hybrid consensus - combines multiple methods
   */
  private hybridConsensus(
    request: ConsensusRequest,
    participants: Map<string, ConsensusParticipant>
  ): ConsensusResult {
    const results: ConsensusResult[] = [];

    // Try multiple methods
    const methods: ConsensusMethod[] = ['weighted-majority', 'expert-led', 'evidence-based'];

    for (const method of methods) {
      const strategy = this.strategies.get(method);
      if (strategy) {
        results.push(strategy.apply(request, participants));
      }
    }

    // Combine results
    const valueFrequency = new Map<string, number>();
    let totalConfidence = 0;
    let totalAgreement = 0;

    for (const result of results) {
      const key = JSON.stringify(result.finalValue);
      valueFrequency.set(key, (valueFrequency.get(key) || 0) + result.confidence);
      totalConfidence += result.confidence;
      totalAgreement += result.agreementLevel;
    }

    // Find most confident value
    let bestValue: string | null = null;
    let bestScore = 0;

    for (const [value, score] of valueFrequency.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestValue = value;
      }
    }

    if (!bestValue) {
      return results[0]; // Fallback to first result
    }

    return {
      topic: request.topic,
      finalValue: JSON.parse(bestValue),
      agreementLevel: totalAgreement / results.length,
      confidence: totalConfidence / results.length,
      method: 'hybrid',
      participants: request.opinions.map(o => o.participant),
      dissenting: this.findDissenting(request.opinions, JSON.parse(bestValue)),
      explanation: [
        `Hybrid consensus using ${methods.join(', ')}`,
        `${results.length} methods agreed on final value`,
        `Average confidence: ${((totalConfidence / results.length) * 100).toFixed(1)}%`,
        `Average agreement: ${((totalAgreement / results.length) * 100).toFixed(1)}%`,
      ],
      evidence: this.aggregateEvidence(
        request.opinions.filter(o => JSON.stringify(o.value) === bestValue)
      ),
    };
  }

  /**
   * Calculate average confidence
   */
  private calculateAverageConfidence(opinions: Opinion[]): number {
    if (opinions.length === 0) return 0;
    const sum = opinions.reduce((total, op) => total + op.confidence, 0);
    return sum / opinions.length;
  }

  /**
   * Calculate weighted confidence
   */
  private calculateWeightedConfidence(
    opinions: Opinion[],
    participants: Map<string, ConsensusParticipant>
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const opinion of opinions) {
      const participant = participants.get(opinion.participant);
      if (participant) {
        const weight = participant.reliability;
        weightedSum += opinion.confidence * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Aggregate evidence from multiple opinions
   */
  private aggregateEvidence(opinions: Opinion[]): Evidence[] {
    const evidenceMap = new Map<string, Evidence>();

    for (const opinion of opinions) {
      for (const evidence of opinion.evidence) {
        const key = `${evidence.type}-${evidence.source}`;
        if (!evidenceMap.has(key)) {
          evidenceMap.set(key, evidence);
        } else {
          // Keep stronger evidence
          const existing = evidenceMap.get(key)!;
          if (this.compareEvidenceStrength(evidence.strength, existing.strength) > 0) {
            evidenceMap.set(key, evidence);
          }
        }
      }
    }

    return Array.from(evidenceMap.values());
  }

  /**
   * Compare evidence strength
   */
  private compareEvidenceStrength(a: string, b: string): number {
    const strengthOrder = { weak: 0, moderate: 1, strong: 2 };
    return (
      (strengthOrder[a as keyof typeof strengthOrder] || 0) -
      (strengthOrder[b as keyof typeof strengthOrder] || 0)
    );
  }

  /**
   * Find dissenting opinions
   */
  private findDissenting(opinions: Opinion[], finalValue: any): DissentingOpinion[] {
    return opinions
      .filter(o => JSON.stringify(o.value) !== JSON.stringify(finalValue))
      .map(o => ({
        participant: o.participant,
        value: o.value,
        reasoning: o.reasoning.join(' '),
        weight: o.confidence,
      }));
  }

  /**
   * Update trust scores based on consensus outcome
   */
  private async updateTrustScores(result: ConsensusResult): Promise<void> {
    // Increase trust for participants who agreed with consensus
    for (const participant of result.participants) {
      const currentScore = this.trustScores.get(participant) || 1.0;

      // Check if participant agreed with final value
      const agreed = !result.dissenting.some(d => d.participant === participant);

      if (agreed) {
        // Increase trust slightly
        this.trustScores.set(participant, Math.min(currentScore * 1.02, 1.5));
      } else {
        // Decrease trust slightly
        this.trustScores.set(participant, Math.max(currentScore * 0.98, 0.5));
      }
    }
  }

  /**
   * Get consensus metrics for analysis
   */
  getConsensusMetrics(): {
    totalConsensusReached: number;
    averageAgreement: number;
    methodDistribution: Map<ConsensusMethod, number>;
    participantPerformance: Map<string, number>;
  } {
    const methodCounts = new Map<ConsensusMethod, number>();
    let totalAgreement = 0;

    for (const result of this.consensusHistory) {
      methodCounts.set(result.method, (methodCounts.get(result.method) || 0) + 1);
      totalAgreement += result.agreementLevel;
    }

    // Calculate participant performance
    const participantPerformance = new Map<string, number>();
    for (const [id, score] of this.trustScores.entries()) {
      const participant = this.participants.get(id);
      if (participant) {
        participantPerformance.set(id, score * participant.reliability);
      }
    }

    return {
      totalConsensusReached: this.consensusHistory.length,
      averageAgreement:
        this.consensusHistory.length > 0 ? totalAgreement / this.consensusHistory.length : 0,
      methodDistribution: methodCounts,
      participantPerformance,
    };
  }
}

// Export for use
export default ConsensusEngine;
