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
  confidence: number; // 0-1
  rationale: string[];
  evidence: Evidence[];
  flexibility: number; // 0-1, willingness to compromise
}

export interface Evidence {
  type: 'empirical' | 'logical' | 'authoritative' | 'experiential';
  description: string;
  strength: number; // 0-1
  verifiable: boolean;
  source?: string;
}

export type ConflictType =
  | 'value-disagreement' // Different values for same thing
  | 'interpretation' // Different interpretations of data
  | 'methodology' // Different approaches to solve problem
  | 'priority' // Different priorities/importance
  | 'scope' // Different understanding of scope
  | 'definition' // Different definitions of terms
  | 'prediction'; // Different predictions of outcomes

export interface ConflictContext {
  importance: number; // 0-1
  timeConstraint?: number; // ms available to resolve
  stakeholders: string[];
  previousConflicts?: string[]; // Related past conflicts
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
  agreementLevel: number; // 0-1
  dissent: Dissent[];
  compromises: Compromise[];
  duration: number; // ms taken
  confidence: number; // 0-1
  followUp?: FollowUpAction[];
}

export type ResolutionMethod =
  | 'mediation' // Facilitate agreement
  | 'arbitration' // Third party decides
  | 'synthesis' // Combine positions
  | 'voting' // Democratic decision
  | 'deferral' // Postpone decision
  | 'escalation' // Human decides
  | 'evidence-evaluation' // Best evidence wins
  | 'compromise' // Find middle ground
  | 'partition'; // Split into sub-decisions

export interface Dissent {
  participant: string;
  reason: string;
  severity: 'accepts' | 'reservations' | 'strongly-opposes';
  conditions?: string[]; // Under what conditions they'd accept
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

export class ConflictResolver extends EventEmitter {
  private activeConflicts: Map<string, Conflict> = new Map();
  private resolutionHistory: Resolution[] = [];
  private mediationStrategies: Map<ConflictType, MediationStrategy> = new Map();
  private explanationEngine: ExplanationEngine;

  // Resolution parameters
  private readonly MAX_MEDIATION_ROUNDS = 5;
  private readonly AGREEMENT_THRESHOLD = 0.7;
  private readonly EVIDENCE_WEIGHT = 0.4;
  private readonly EXPERTISE_WEIGHT = 0.3;
  private readonly CONSENSUS_WEIGHT = 0.3;

  constructor(explanationEngine: ExplanationEngine) {
    super();
    this.explanationEngine = explanationEngine;
    this.initializeMediationStrategies();
  }

  /**
   * Initialize mediation strategies for different conflict types
   */
  private initializeMediationStrategies(): void {
    // Value disagreement - use evidence and expertise
    this.mediationStrategies.set('value-disagreement', {
      type: 'value-disagreement',
      steps: ['clarify-values', 'evaluate-evidence', 'weight-by-expertise', 'seek-compromise'],
      preferredMethod: 'evidence-evaluation',
    });

    // Interpretation - facilitate understanding
    this.mediationStrategies.set('interpretation', {
      type: 'interpretation',
      steps: [
        'clarify-interpretations',
        'identify-common-ground',
        'synthesize-perspectives',
        'validate-synthesis',
      ],
      preferredMethod: 'synthesis',
    });

    // Methodology - respect different valid approaches
    this.mediationStrategies.set('methodology', {
      type: 'methodology',
      steps: [
        'document-approaches',
        'evaluate-trade-offs',
        'consider-context',
        'select-or-combine',
      ],
      preferredMethod: 'compromise',
    });

    // Priority - balance importance
    this.mediationStrategies.set('priority', {
      type: 'priority',
      steps: ['list-priorities', 'weight-by-impact', 'consider-constraints', 'rank-consensus'],
      preferredMethod: 'voting',
    });

    // Scope - define boundaries
    this.mediationStrategies.set('scope', {
      type: 'scope',
      steps: [
        'define-boundaries',
        'identify-overlaps',
        'partition-responsibilities',
        'document-agreement',
      ],
      preferredMethod: 'partition',
    });

    // Definition - standardize terms
    this.mediationStrategies.set('definition', {
      type: 'definition',
      steps: [
        'gather-definitions',
        'identify-differences',
        'consult-authority',
        'establish-standard',
      ],
      preferredMethod: 'arbitration',
    });

    // Prediction - evaluate forecasts
    this.mediationStrategies.set('prediction', {
      type: 'prediction',
      steps: [
        'state-predictions',
        'examine-assumptions',
        'weight-by-track-record',
        'aggregate-forecast',
      ],
      preferredMethod: 'evidence-evaluation',
    });
  }

  /**
   * Resolve conflict between tools
   */
  async resolveConflict(conflict: Conflict): Promise<Resolution> {
    const startTime = Date.now();

    this.activeConflicts.set(conflict.id, conflict);
    this.emit('conflict:started', { conflictId: conflict.id, type: conflict.type });

    // Select resolution method
    const method = this.selectResolutionMethod(conflict);

    // Apply resolution strategy
    let resolution: Resolution;

    try {
      switch (method) {
        case 'mediation':
          resolution = await this.mediate(conflict);
          break;
        case 'arbitration':
          resolution = await this.arbitrate(conflict);
          break;
        case 'synthesis':
          resolution = await this.synthesize(conflict);
          break;
        case 'voting':
          resolution = await this.conductVoting(conflict);
          break;
        case 'evidence-evaluation':
          resolution = await this.evaluateEvidence(conflict);
          break;
        case 'compromise':
          resolution = await this.findCompromise(conflict);
          break;
        case 'partition':
          resolution = await this.partition(conflict);
          break;
        case 'deferral':
          resolution = await this.defer(conflict);
          break;
        case 'escalation':
          resolution = await this.escalate(conflict);
          break;
        default:
          resolution = await this.mediate(conflict);
      }

      resolution.duration = Date.now() - startTime;

      // Store resolution
      this.resolutionHistory.push(resolution);
      this.activeConflicts.delete(conflict.id);

      this.emit('conflict:resolved', {
        conflictId: conflict.id,
        method: resolution.method,
        agreement: resolution.agreementLevel,
      });

      return resolution;
    } catch {
      // Resolution failed - escalate
      return await this.escalate(conflict);
    }
  }

  /**
   * Select appropriate resolution method
   */
  private selectResolutionMethod(conflict: Conflict): ResolutionMethod {
    // Critical conflicts need immediate resolution
    if (conflict.severity === 'critical') {
      return 'arbitration';
    }

    // Time-constrained conflicts
    if (conflict.context.timeConstraint && conflict.context.timeConstraint < 5000) {
      return 'voting'; // Fastest method
    }

    // Use strategy preference based on conflict type
    const strategy = this.mediationStrategies.get(conflict.type);
    if (strategy) {
      return strategy.preferredMethod;
    }

    // Check if deferral is allowed and conflict is minor
    if (conflict.severity === 'minor' && conflict.context.requirements?.canDefer) {
      return 'deferral';
    }

    // Default to mediation
    return 'mediation';
  }

  /**
   * Mediation - facilitate agreement through structured dialogue
   */
  private async mediate(conflict: Conflict): Promise<Resolution> {
    const strategy = this.mediationStrategies.get(conflict.type);
    if (!strategy) {
      throw new Error(`No mediation strategy for ${conflict.type}`);
    }

    const explanation: string[] = [`Mediation process for ${conflict.type} conflict`];
    const compromises: Compromise[] = [];
    let currentPositions = [...conflict.positions];
    let round = 0;

    // Mediation rounds
    while (round < this.MAX_MEDIATION_ROUNDS) {
      round++;
      explanation.push(`\nRound ${round}:`);

      // Execute mediation steps
      for (const step of strategy.steps) {
        const result = await this.executeMediationStep(step, currentPositions, conflict);
        explanation.push(`- ${step}: ${result.description}`);

        if (result.positions) {
          currentPositions = result.positions;
        }

        if (result.compromise) {
          compromises.push(result.compromise);
        }

        // Check if agreement reached
        const agreementLevel = this.calculateAgreement(currentPositions);
        if (agreementLevel >= this.AGREEMENT_THRESHOLD) {
          explanation.push(`✓ Agreement reached at ${(agreementLevel * 100).toFixed(0)}%`);

          return {
            conflictId: conflict.id,
            method: 'mediation',
            outcome: this.synthesizeOutcome(currentPositions),
            explanation,
            agreementLevel,
            dissent: this.identifyDissent(currentPositions),
            compromises,
            duration: 0,
            confidence: agreementLevel,
          };
        }
      }

      // Adjust positions for next round
      currentPositions = this.adjustPositions(currentPositions);
    }

    // Mediation didn't reach threshold - return best result
    const agreementLevel = this.calculateAgreement(currentPositions);
    explanation.push(
      `\nMediation ended after ${round} rounds with ${(agreementLevel * 100).toFixed(0)}% agreement`
    );

    return {
      conflictId: conflict.id,
      method: 'mediation',
      outcome: this.synthesizeOutcome(currentPositions),
      explanation,
      agreementLevel,
      dissent: this.identifyDissent(currentPositions),
      compromises,
      duration: 0,
      confidence: agreementLevel,
    };
  }

  /**
   * Execute mediation step
   */
  private async executeMediationStep(
    step: string,
    positions: Position[],
    _conflict: Conflict
  ): Promise<{
    description: string;
    positions?: Position[];
    compromise?: Compromise;
  }> {
    switch (step) {
      case 'clarify-values':
      case 'clarify-interpretations':
        return {
          description: 'Clarified positions and underlying assumptions',
          positions: positions.map(p => ({
            ...p,
            rationale: [...p.rationale, 'Clarified in mediation'],
          })),
        };

      case 'evaluate-evidence':
        const evidenceScores = positions.map(p => ({
          participant: p.participant,
          score: this.scoreEvidence(p.evidence),
        }));
        return {
          description: `Evaluated evidence quality: ${evidenceScores.map(s => `${s.participant}=${s.score.toFixed(2)}`).join(', ')}`,
        };

      case 'identify-common-ground':
        const common = this.findCommonGround(positions);
        return {
          description: `Found ${common.length} areas of agreement`,
          compromise:
            common.length > 0
              ? {
                  aspect: 'common-ground',
                  original: positions.map(p => p.stance),
                  compromised: common,
                  participants: positions.map(p => p.participant),
                }
              : undefined,
        };

      case 'seek-compromise':
      case 'find-middle-ground':
        const middle = this.findMiddleGround(positions);
        return {
          description: 'Proposed compromise position',
          positions: positions.map(p => ({
            ...p,
            stance: this.adjustTowardMiddle(p.stance, middle, p.flexibility),
          })),
          compromise: {
            aspect: 'compromise',
            original: positions.map(p => p.stance),
            compromised: middle,
            participants: positions.map(p => p.participant),
          },
        };

      default:
        return { description: `Executed ${step}` };
    }
  }

  /**
   * Calculate agreement level between positions
   */
  private calculateAgreement(positions: Position[]): number {
    if (positions.length <= 1) return 1.0;

    // Calculate variance in positions
    const stances = positions.map(p => JSON.stringify(p.stance));
    const unique = new Set(stances);

    // Perfect agreement
    if (unique.size === 1) return 1.0;

    // Weighted agreement by confidence
    const totalWeight = positions.reduce((sum, p) => sum + p.confidence, 0);
    const groupWeights = new Map<string, number>();

    for (const position of positions) {
      const key = JSON.stringify(position.stance);
      groupWeights.set(key, (groupWeights.get(key) || 0) + position.confidence);
    }

    // Largest group's weight
    const maxWeight = Math.max(...Array.from(groupWeights.values()));

    return maxWeight / totalWeight;
  }

  /**
   * Score evidence quality
   */
  private scoreEvidence(evidence: Evidence[]): number {
    if (evidence.length === 0) return 0;

    let totalScore = 0;
    for (const e of evidence) {
      let score = e.strength;

      // Type weighting
      switch (e.type) {
        case 'empirical':
          score *= 1.2;
          break;
        case 'logical':
          score *= 1.0;
          break;
        case 'authoritative':
          score *= 0.9;
          break;
        case 'experiential':
          score *= 0.8;
          break;
      }

      // Verifiability bonus
      if (e.verifiable) score *= 1.1;

      totalScore += score;
    }

    return totalScore / evidence.length;
  }

  /**
   * Find common ground between positions
   */
  private findCommonGround(positions: Position[]): any[] {
    const common: any[] = [];

    // Find aspects where all agree
    if (positions.length < 2) return common;

    // Extract all aspects from stances
    const aspects = new Map<string, any[]>();

    for (const position of positions) {
      if (typeof position.stance === 'object' && position.stance !== null) {
        for (const [key, value] of Object.entries(position.stance)) {
          if (!aspects.has(key)) {
            aspects.set(key, []);
          }
          aspects.get(key)!.push(value);
        }
      }
    }

    // Check which aspects have unanimous agreement
    for (const [aspect, values] of aspects.entries()) {
      if (values.length === positions.length) {
        const first = JSON.stringify(values[0]);
        if (values.every(v => JSON.stringify(v) === first)) {
          common.push({ [aspect]: values[0] });
        }
      }
    }

    return common;
  }

  /**
   * Find middle ground between positions
   */
  private findMiddleGround(positions: Position[]): any {
    // For numeric values, calculate weighted average
    // For categorical values, use most common
    // For objects, merge compatible properties

    const stances = positions.map(p => p.stance);

    // Check if all stances are numbers
    if (stances.every(s => typeof s === 'number')) {
      const totalWeight = positions.reduce((sum, p) => sum + p.confidence, 0);
      const weightedSum = positions.reduce(
        (sum, p) => sum + (p.stance as number) * p.confidence,
        0
      );
      return weightedSum / totalWeight;
    }

    // For objects, merge
    if (stances.every(s => typeof s === 'object' && s !== null)) {
      const merged: any = {};
      const allKeys = new Set<string>();

      for (const stance of stances) {
        Object.keys(stance).forEach(k => allKeys.add(k));
      }

      for (const key of allKeys) {
        const values = stances.map(s => s[key]).filter(v => v !== undefined);
        if (values.length > 0) {
          // Use most common value
          const counts = new Map<string, number>();
          for (const value of values) {
            const k = JSON.stringify(value);
            counts.set(k, (counts.get(k) || 0) + 1);
          }
          const [mostCommon] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
          merged[key] = JSON.parse(mostCommon);
        }
      }

      return merged;
    }

    // For categorical, use most common
    const counts = new Map<string, number>();
    for (const stance of stances) {
      const key = JSON.stringify(stance);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const [mostCommon] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    return JSON.parse(mostCommon);
  }

  /**
   * Adjust position toward middle ground
   */
  private adjustTowardMiddle(stance: any, middle: any, flexibility: number): any {
    // If flexible, move toward middle
    if (flexibility < 0.3) return stance; // Too inflexible

    if (typeof stance === 'number' && typeof middle === 'number') {
      return stance + (middle - stance) * flexibility;
    }

    // For objects, selectively adopt middle values
    if (
      typeof stance === 'object' &&
      typeof middle === 'object' &&
      stance !== null &&
      middle !== null
    ) {
      const adjusted = { ...stance };
      for (const key of Object.keys(middle)) {
        if (Math.random() < flexibility) {
          adjusted[key] = middle[key];
        }
      }
      return adjusted;
    }

    // For categorical, adopt middle if flexible enough
    if (flexibility > 0.7) {
      return middle;
    }

    return stance;
  }

  /**
   * Adjust positions for next mediation round
   */
  private adjustPositions(positions: Position[]): Position[] {
    return positions.map(p => ({
      ...p,
      flexibility: Math.min(1, p.flexibility * 1.1), // Increase flexibility each round
      confidence: p.confidence * 0.95, // Slightly reduce confidence
    }));
  }

  /**
   * Synthesize outcome from positions
   */
  private synthesizeOutcome(positions: Position[]): any {
    // Weight by confidence and flexibility
    const weights = positions.map(p => p.confidence * (1 + p.flexibility));

    // Find highest weighted position
    let bestIndex = 0;
    let bestWeight = weights[0];

    for (let i = 1; i < weights.length; i++) {
      if (weights[i] > bestWeight) {
        bestWeight = weights[i];
        bestIndex = i;
      }
    }

    return positions[bestIndex].stance;
  }

  /**
   * Identify dissenting positions
   */
  private identifyDissent(positions: Position[]): Dissent[] {
    const consensus = this.synthesizeOutcome(positions);
    const consensusStr = JSON.stringify(consensus);

    return positions
      .filter(p => JSON.stringify(p.stance) !== consensusStr)
      .map(p => {
        let severity: 'accepts' | 'reservations' | 'strongly-opposes';

        if (p.flexibility > 0.7) {
          severity = 'accepts';
        } else if (p.flexibility > 0.4) {
          severity = 'reservations';
        } else {
          severity = 'strongly-opposes';
        }

        return {
          participant: p.participant,
          reason: p.rationale.join('; '),
          severity,
        };
      });
  }

  /**
   * Arbitration - have expert or system decide
   */
  private async arbitrate(conflict: Conflict): Promise<Resolution> {
    const explanation: string[] = ['Arbitration process initiated'];

    // Find most authoritative participant
    let bestPosition: Position | null = null;
    let bestScore = 0;

    for (const position of conflict.positions) {
      const evidenceScore = this.scoreEvidence(position.evidence);
      const score = position.confidence * 0.5 + evidenceScore * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestPosition = position;
      }
    }

    if (!bestPosition) {
      throw new Error('No valid position for arbitration');
    }

    explanation.push(`Selected ${bestPosition.participant}'s position based on evidence quality`);
    explanation.push(`Evidence score: ${this.scoreEvidence(bestPosition.evidence).toFixed(2)}`);

    return {
      conflictId: conflict.id,
      method: 'arbitration',
      outcome: bestPosition.stance,
      explanation,
      agreementLevel: bestPosition.confidence,
      dissent: conflict.positions
        .filter(p => p.participant !== bestPosition!.participant)
        .map(p => ({
          participant: p.participant,
          reason: 'Overruled by arbitration',
          severity: 'accepts' as const,
        })),
      compromises: [],
      duration: 0,
      confidence: bestScore,
    };
  }

  /**
   * Synthesis - combine positions into new solution
   */
  private async synthesize(conflict: Conflict): Promise<Resolution> {
    const explanation: string[] = ['Synthesizing positions'];

    // Extract all unique aspects from positions
    const synthesis: any = {};

    for (const position of conflict.positions) {
      if (typeof position.stance === 'object' && position.stance !== null) {
        for (const [key, value] of Object.entries(position.stance)) {
          if (!synthesis[key]) {
            synthesis[key] = [];
          }
          synthesis[key].push({
            value,
            confidence: position.confidence,
            participant: position.participant,
          });
        }
      }
    }

    // For each aspect, select best value
    const result: any = {};
    for (const [key, options] of Object.entries(synthesis) as [string, any[]][]) {
      // Select highest confidence option
      options.sort((a, b) => b.confidence - a.confidence);
      result[key] = options[0].value;
      explanation.push(
        `${key}: Selected from ${options[0].participant} (confidence: ${options[0].confidence.toFixed(2)})`
      );
    }

    return {
      conflictId: conflict.id,
      method: 'synthesis',
      outcome: result,
      explanation,
      agreementLevel: 0.8, // Synthesis typically gets good agreement
      dissent: [],
      compromises: [
        {
          aspect: 'full-synthesis',
          original: conflict.positions.map(p => p.stance),
          compromised: result,
          participants: conflict.positions.map(p => p.participant),
        },
      ],
      duration: 0,
      confidence: 0.75,
    };
  }

  /**
   * Voting - democratic decision
   */
  private async conductVoting(conflict: Conflict): Promise<Resolution> {
    const votes = new Map<string, number>();

    // Weight votes by confidence
    for (const position of conflict.positions) {
      const key = JSON.stringify(position.stance);
      votes.set(key, (votes.get(key) || 0) + position.confidence);
    }

    // Find winner
    const [winningStance, voteCount] = Array.from(votes.entries()).sort((a, b) => b[1] - a[1])[0];

    const totalVotes = Array.from(votes.values()).reduce((sum, v) => sum + v, 0);
    const agreementLevel = voteCount / totalVotes;

    return {
      conflictId: conflict.id,
      method: 'voting',
      outcome: JSON.parse(winningStance),
      explanation: [
        `Voting completed`,
        `Winner received ${voteCount.toFixed(2)} weighted votes out of ${totalVotes.toFixed(2)}`,
        `Agreement level: ${(agreementLevel * 100).toFixed(1)}%`,
      ],
      agreementLevel,
      dissent: conflict.positions
        .filter(p => JSON.stringify(p.stance) !== winningStance)
        .map(p => ({
          participant: p.participant,
          reason: 'Minority position',
          severity: 'accepts' as const,
        })),
      compromises: [],
      duration: 0,
      confidence: agreementLevel,
    };
  }

  /**
   * Evidence evaluation - best evidence wins
   */
  private async evaluateEvidence(conflict: Conflict): Promise<Resolution> {
    const scores = conflict.positions.map(position => ({
      position,
      evidenceScore: this.scoreEvidence(position.evidence),
      totalScore: this.scoreEvidence(position.evidence) * position.confidence,
    }));

    scores.sort((a, b) => b.totalScore - a.totalScore);
    const winner = scores[0];

    return {
      conflictId: conflict.id,
      method: 'evidence-evaluation',
      outcome: winner.position.stance,
      explanation: [
        'Evidence evaluation completed',
        `Winner: ${winner.position.participant}`,
        `Evidence score: ${winner.evidenceScore.toFixed(2)}`,
        `Total score: ${winner.totalScore.toFixed(2)}`,
        `Evidence types: ${winner.position.evidence.map(e => e.type).join(', ')}`,
      ],
      agreementLevel: winner.totalScore / scores[0].totalScore,
      dissent: scores.slice(1).map(s => ({
        participant: s.position.participant,
        reason: `Lower evidence score: ${s.evidenceScore.toFixed(2)}`,
        severity: 'accepts' as const,
      })),
      compromises: [],
      duration: 0,
      confidence: winner.totalScore,
    };
  }

  /**
   * Compromise - find middle ground
   */
  private async findCompromise(conflict: Conflict): Promise<Resolution> {
    const middle = this.findMiddleGround(conflict.positions);
    const compromises: Compromise[] = [];

    // Record each participant's compromise
    for (const position of conflict.positions) {
      if (JSON.stringify(position.stance) !== JSON.stringify(middle)) {
        compromises.push({
          aspect: conflict.topic,
          original: position.stance,
          compromised: middle,
          participants: [position.participant],
        });
      }
    }

    return {
      conflictId: conflict.id,
      method: 'compromise',
      outcome: middle,
      explanation: [
        'Compromise position found',
        `${compromises.length} participants compromised`,
        'Solution balances all positions',
      ],
      agreementLevel: 0.7,
      dissent: [],
      compromises,
      duration: 0,
      confidence: 0.7,
    };
  }

  /**
   * Partition - split decision into sub-decisions
   */
  private async partition(conflict: Conflict): Promise<Resolution> {
    const partitions: any = {};

    // Assign each participant to handle specific aspect
    let index = 0;
    for (const position of conflict.positions) {
      const partitionKey = `partition_${index++}`;
      partitions[partitionKey] = {
        assignedTo: position.participant,
        decision: position.stance,
      };
    }

    return {
      conflictId: conflict.id,
      method: 'partition',
      outcome: partitions,
      explanation: [
        'Decision partitioned among participants',
        `${conflict.positions.length} partitions created`,
        'Each participant handles their domain',
      ],
      agreementLevel: 1.0, // No conflict since partitioned
      dissent: [],
      compromises: [],
      duration: 0,
      confidence: 0.8,
    };
  }

  /**
   * Defer - postpone decision
   */
  private async defer(conflict: Conflict): Promise<Resolution> {
    return {
      conflictId: conflict.id,
      method: 'deferral',
      outcome: null,
      explanation: [
        'Decision deferred',
        'Conflict severity does not require immediate resolution',
        'Will revisit when more information available',
      ],
      agreementLevel: 0,
      dissent: [],
      compromises: [],
      duration: 0,
      confidence: 0,
      followUp: [
        {
          action: 'revisit-conflict',
          assignedTo: 'orchestrator',
          reason: 'Gather more information or wait for context change',
        },
      ],
    };
  }

  /**
   * Escalate - human decision needed
   */
  private async escalate(conflict: Conflict): Promise<Resolution> {
    return {
      conflictId: conflict.id,
      method: 'escalation',
      outcome: {
        status: 'escalated',
        reason:
          conflict.severity === 'critical'
            ? 'Critical decision requires human judgment'
            : 'Automated resolution failed',
      },
      explanation: [
        'Conflict escalated to human decision-maker',
        `Severity: ${conflict.severity}`,
        `Participants: ${conflict.participants.join(', ')}`,
        'Automated resolution methods exhausted',
      ],
      agreementLevel: 0,
      dissent: conflict.positions.map(p => ({
        participant: p.participant,
        reason: 'Awaiting human decision',
        severity: 'accepts' as const,
      })),
      compromises: [],
      duration: 0,
      confidence: 0,
      followUp: [
        {
          action: 'await-human-decision',
          assignedTo: 'human',
          reason: 'Conflict requires human judgment',
        },
      ],
    };
  }

  /**
   * Get resolution statistics
   */
  getStatistics(): {
    totalResolutions: number;
    methodDistribution: Map<ResolutionMethod, number>;
    averageAgreement: number;
    averageDuration: number;
    escalationRate: number;
  } {
    const methodCounts = new Map<ResolutionMethod, number>();
    let totalAgreement = 0;
    let totalDuration = 0;
    let escalations = 0;

    for (const resolution of this.resolutionHistory) {
      methodCounts.set(resolution.method, (methodCounts.get(resolution.method) || 0) + 1);
      totalAgreement += resolution.agreementLevel;
      totalDuration += resolution.duration;
      if (resolution.method === 'escalation') escalations++;
    }

    const count = this.resolutionHistory.length || 1;

    return {
      totalResolutions: this.resolutionHistory.length,
      methodDistribution: methodCounts,
      averageAgreement: totalAgreement / count,
      averageDuration: totalDuration / count,
      escalationRate: escalations / count,
    };
  }
}

interface MediationStrategy {
  type: ConflictType;
  steps: string[];
  preferredMethod: ResolutionMethod;
}

// Export for use
export default ConflictResolver;
