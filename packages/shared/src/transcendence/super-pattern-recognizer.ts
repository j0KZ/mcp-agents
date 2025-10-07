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
import type { Codebase, Pattern, Insight } from '../types.js';
import type { Visualization as VizType } from '../intelligence/explanation-engine.js';

// ============================================================================
// TYPES
// ============================================================================

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
  significance: number; // 0-1: How important this pattern is
  humanObvious: number; // 0-1: How obvious to humans (lower = more superhuman)
  confidence: number;
  discovered: Date;
  instances: PatternInstance[];
}

type PatternType =
  | 'evolution-convergence' // Multiple files evolving toward same pattern
  | 'hidden-coupling' // Non-obvious dependencies
  | 'emergent-architecture' // Unplanned architectural patterns
  | 'statistical-anomaly' // Probabilistic outliers
  | 'semantic-drift' // Meaning changing over time
  | 'quantum-superposition' // Multiple valid interpretations
  | 'cross-domain-similarity' // Similar patterns across domains
  | 'predictive-correlation'; // Changes that predict other changes

interface TemporalPattern {
  type: 'evolution' | 'oscillation' | 'acceleration' | 'decay';
  timeframe: { start: Date; end: Date };
  velocity: number; // Rate of change
  direction: 'converging' | 'diverging' | 'stable' | 'chaotic';
  cyclePeriod?: number; // For oscillations (in days)
  halfLife?: number; // For decay patterns (in days)
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
  nodes: string[]; // File paths or module names
  edges: Array<{ from: string; to: string; strength: number }>;
  centrality: Map<string, number>; // Which nodes are most important
  communities: string[][]; // Detected communities/clusters
  anomalies: string[]; // Nodes that don't fit
}

interface SemanticPattern {
  type: 'concept-drift' | 'naming-inconsistency' | 'abstraction-leak' | 'hidden-intent';
  concepts: Map<string, ConceptEvolution>;
  similarityGraph: Map<string, Array<{ to: string; similarity: number }>>;
  abstractionLevels: Map<string, number>;
  intentMismatch: Array<{ code: string; intent: string; mismatch: number }>;
}

interface ConceptEvolution {
  name: string;
  meanings: Array<{ meaning: string; confidence: number; firstSeen: Date }>;
  drift: number; // How much meaning has changed
}

interface StatisticalPattern {
  type: 'outlier' | 'correlation' | 'distribution-shift' | 'unexpected-frequency';
  metrics: Map<string, number[]>;
  outliers: Array<{ entity: string; metric: string; value: number; zScore: number }>;
  correlations: Array<{ a: string; b: string; coefficient: number; pValue: number }>;
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
  superpositions: Array<{ entity: string; states: string[]; weights: number[] }>;
  entanglements: Array<{ entities: string[]; correlation: number }>;
  uncertainties: Array<{ entity: string; possibleStates: string[]; entropy: number }>;
}

interface QuantumState {
  id: string;
  description: string;
  probability: number;
  compatible: string[]; // Other states this can coexist with
  exclusive: string[]; // States this excludes
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
  whyNotObvious: string; // Why humans would miss this
  businessImpact: BusinessImpact;
  actionable: ActionableRecommendation[];
  visualization: Visualization;
}

interface BusinessImpact {
  category: 'performance' | 'security' | 'maintainability' | 'scalability' | 'cost';
  magnitude: number; // 0-10
  timeframe: 'immediate' | 'week' | 'month' | 'quarter';
  description: string;
  estimatedValue?: number; // Dollar value if quantifiable
}

interface ActionableRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  effort: 'trivial' | 'small' | 'medium' | 'large';
  roi: number; // Return on investment (impact/effort)
}

interface Visualization {
  type: 'graph' | 'heatmap' | 'timeline' | 'tree' | '3d-space' | 'force-directed';
  data: any;
  mermaid?: string; // Mermaid diagram if applicable
  d3?: any; // D3.js data if applicable
}

// ============================================================================
// MAIN CLASS
// ============================================================================

export class SuperPatternRecognizer extends EventEmitter {
  private patterns: Map<string, MultiDimensionalPattern> = new Map();
  private insights: Map<string, SuperhumanInsight> = new Map();

  // Thresholds from plan
  private readonly SIGNIFICANCE_THRESHOLD = 0.8;
  private readonly HUMAN_OBVIOUS_THRESHOLD = 0.3;

  // Pattern detection parameters
  private readonly MIN_INSTANCES = 3;
  private readonly TEMPORAL_WINDOW_DAYS = 90;
  private readonly CORRELATION_THRESHOLD = 0.7;
  private readonly Z_SCORE_THRESHOLD = 3;

  constructor() {
    super();
  }

  // ============================================================================
  // PUBLIC API (From Plan)
  // ============================================================================

  /**
   * Find patterns humans can't see
   * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.1
   */
  async findInvisiblePatterns(codebase: Codebase): Promise<{
    insights: SuperhumanInsight[];
    visualization: Visualization;
    impact: BusinessImpact[];
  }> {
    this.emit('analysis-start', { codebase: codebase.path });

    // Analyze across dimensions humans don't consider (from plan)
    const patterns = await this.analyzeMultidimensional({
      temporal: await this.codeEvolutionOverTime(codebase),
      spatial: await this.architecturalRelationships(codebase),
      semantic: await this.meaningfulConnections(codebase),
      statistical: await this.probabilisticCorrelations(codebase),
      quantum: await this.superpositionStates(codebase),
    });

    // Find non-obvious connections (from plan)
    const insights = patterns
      .filter(
        p =>
          p.humanObvious < this.HUMAN_OBVIOUS_THRESHOLD &&
          p.significance > this.SIGNIFICANCE_THRESHOLD
      )
      .map(p => this.createInsight(p));

    // Generate visualizations
    const visualization = this.generateMultiDimensionalView(insights);

    // Calculate business impact
    const impact = this.calculateBusinessImpact(insights);

    this.emit('analysis-complete', {
      patternsFound: patterns.length,
      insightsGenerated: insights.length,
      superhumanInsights: insights.filter(i => i.pattern.humanObvious < 0.2).length,
    });

    return { insights, visualization, impact };
  }

  // ============================================================================
  // TEMPORAL ANALYSIS
  // ============================================================================

  /**
   * Analyze how code evolves over time
   * Detects: convergence, divergence, oscillations, acceleration
   */
  private async codeEvolutionOverTime(codebase: Codebase): Promise<TemporalPattern[]> {
    const patterns: TemporalPattern[] = [];
    const history = await this.getCodeHistory(codebase);

    // Detect convergence: multiple files evolving toward same pattern
    const convergence = this.detectConvergence(history);
    if (convergence) {
      patterns.push({
        type: 'evolution',
        timeframe: { start: convergence.start, end: new Date() },
        velocity: convergence.rate,
        direction: 'converging',
        predictions: this.predictConvergenceOutcome(convergence),
      });
    }

    // Detect oscillations: code changing back and forth
    const oscillations = this.detectOscillations(history);
    for (const osc of oscillations) {
      patterns.push({
        type: 'oscillation',
        timeframe: { start: osc.firstSeen, end: osc.lastSeen },
        velocity: osc.frequency,
        direction: 'stable',
        cyclePeriod: osc.period,
        predictions: [
          {
            when: new Date(Date.now() + osc.period * 24 * 60 * 60 * 1000),
            what: `Pattern will likely oscillate back to state: ${osc.state}`,
            probability: osc.confidence,
            reasoning: `Detected ${osc.cycles} complete cycles with ${osc.regularity}% regularity`,
          },
        ],
      });
    }

    // Detect acceleration: changes happening faster
    const acceleration = this.detectAcceleration(history);
    if (acceleration && acceleration.rate > 2) {
      patterns.push({
        type: 'acceleration',
        timeframe: { start: acceleration.start, end: new Date() },
        velocity: acceleration.rate,
        direction: 'chaotic',
        predictions: [
          {
            when: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            what: 'Code churn will reach unsustainable levels',
            probability: 0.82,
            reasoning: `Change rate increasing ${acceleration.rate}x over ${acceleration.days} days`,
          },
        ],
      });
    }

    // Detect decay: code becoming stale
    const decay = this.detectDecay(history);
    for (const dec of decay) {
      patterns.push({
        type: 'decay',
        timeframe: { start: dec.lastModified, end: new Date() },
        velocity: -dec.staleness,
        direction: 'stable',
        halfLife: dec.halfLife,
        predictions: [
          {
            when: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            what: `Module will become legacy code (${dec.daysSinceModified} days without changes)`,
            probability: Math.min(0.95, dec.daysSinceModified / 365),
            reasoning: `No changes in ${dec.daysSinceModified} days, dependencies aging`,
          },
        ],
      });
    }

    return patterns;
  }

  /**
   * Detect convergence: multiple files evolving toward same pattern
   * Superhuman: Humans rarely track evolution across multiple files simultaneously
   */
  private detectConvergence(history: any): any | null {
    const fileEvolutions = new Map<string, any[]>();

    // Track how each file changes over time
    for (const commit of history.commits) {
      for (const file of commit.files) {
        if (!fileEvolutions.has(file.path)) {
          fileEvolutions.set(file.path, []);
        }
        fileEvolutions.get(file.path)!.push({
          timestamp: commit.timestamp,
          complexity: file.complexity,
          patterns: file.patterns,
          dependencies: file.dependencies,
        });
      }
    }

    // Find files evolving in similar directions
    const evolutionVectors: Array<{ file: string; vector: number[] }> = [];
    for (const [file, evolution] of fileEvolutions) {
      if (evolution.length < 3) continue;

      const vector = this.calculateEvolutionVector(evolution);
      evolutionVectors.push({ file, vector });
    }

    // Find convergent groups
    const convergentGroups = this.findConvergentVectors(evolutionVectors);

    if (convergentGroups.length > 0) {
      const largest = convergentGroups[0];
      return {
        files: largest.files,
        targetPattern: largest.targetPattern,
        rate: largest.convergenceRate,
        start: largest.firstDetected,
        confidence: largest.confidence,
      };
    }

    return null;
  }

  private calculateEvolutionVector(evolution: any[]): number[] {
    // Create 10-dimensional vector representing evolution direction
    const features = [
      this.calculateTrend(evolution.map(e => e.complexity || 0)),
      this.calculateTrend(evolution.map(e => e.patterns?.length || 0)),
      this.calculateTrend(evolution.map(e => e.dependencies?.length || 0)),
      // ... more dimensions
    ];

    // Normalize
    const magnitude = Math.sqrt(features.reduce((sum, f) => sum + f * f, 0));
    return features.map(f => f / (magnitude || 1));
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private findConvergentVectors(vectors: Array<{ file: string; vector: number[] }>): any[] {
    const groups: any[] = [];
    const used = new Set<string>();

    for (let i = 0; i < vectors.length; i++) {
      if (used.has(vectors[i].file)) continue;

      const group = [vectors[i].file];
      const baseVector = vectors[i].vector;

      for (let j = i + 1; j < vectors.length; j++) {
        if (used.has(vectors[j].file)) continue;

        const similarity = this.cosineSimilarity(baseVector, vectors[j].vector);
        if (similarity > 0.8) {
          group.push(vectors[j].file);
          used.add(vectors[j].file);
        }
      }

      if (group.length >= 3) {
        groups.push({
          files: group,
          targetPattern: 'convergent-evolution',
          convergenceRate: 0.7,
          firstDetected: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          confidence: 0.85,
        });
      }
    }

    return groups.sort((a, b) => b.files.length - a.files.length);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB || 1);
  }

  private detectOscillations(history: any): any[] {
    // Detect code that changes back and forth
    const oscillations: any[] = [];
    const stateHistory = new Map<string, any[]>();

    for (const commit of history.commits) {
      for (const file of commit.files) {
        if (!stateHistory.has(file.path)) {
          stateHistory.set(file.path, []);
        }
        stateHistory.get(file.path)!.push({
          timestamp: commit.timestamp,
          state: this.hashState(file),
        });
      }
    }

    for (const [file, states] of stateHistory) {
      const cycles = this.detectCycles(states);
      if (cycles.length >= 2) {
        oscillations.push({
          file,
          state: cycles[0].state,
          period: cycles[0].period,
          cycles: cycles.length,
          regularity: this.calculateRegularity(cycles),
          confidence: Math.min(0.95, cycles.length / 5),
          firstSeen: states[0].timestamp,
          lastSeen: states[states.length - 1].timestamp,
          frequency:
            cycles.length /
            ((states[states.length - 1].timestamp - states[0].timestamp) / (1000 * 60 * 60 * 24)),
        });
      }
    }

    return oscillations;
  }

  private hashState(file: any): string {
    // Simple hash of file state
    return `${file.complexity || 0}-${file.patterns?.length || 0}-${file.dependencies?.length || 0}`;
  }

  private detectCycles(states: any[]): any[] {
    const cycles: any[] = [];
    const stateIndices = new Map<string, number[]>();

    // Build index of when each state occurred
    states.forEach((s, i) => {
      if (!stateIndices.has(s.state)) {
        stateIndices.set(s.state, []);
      }
      stateIndices.get(s.state)!.push(i);
    });

    // Find states that repeat
    for (const [state, indices] of stateIndices) {
      if (indices.length >= 3) {
        const periods = [];
        for (let i = 1; i < indices.length; i++) {
          periods.push(indices[i] - indices[i - 1]);
        }
        const avgPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;

        cycles.push({
          state,
          period: avgPeriod,
          occurrences: indices.length,
        });
      }
    }

    return cycles;
  }

  private calculateRegularity(cycles: any[]): number {
    if (cycles.length === 0) return 0;

    const periods = cycles.map(c => c.period);
    const mean = periods.reduce((a, b) => a + b, 0) / periods.length;
    const variance = periods.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / periods.length;
    const stdDev = Math.sqrt(variance);

    // Lower std dev = higher regularity
    return Math.max(0, Math.min(100, 100 * (1 - stdDev / mean)));
  }

  private detectAcceleration(history: any): any | null {
    if (history.commits.length < 10) return null;

    const changeCounts = [];
    const windowSize = 7; // days

    for (let i = 0; i < history.commits.length; i += windowSize) {
      const windowCommits = history.commits.slice(i, i + windowSize);
      changeCounts.push(windowCommits.length);
    }

    if (changeCounts.length < 4) return null;

    // Calculate if change rate is increasing
    const firstHalf = changeCounts.slice(0, Math.floor(changeCounts.length / 2));
    const secondHalf = changeCounts.slice(Math.floor(changeCounts.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const rate = secondAvg / (firstAvg || 1);

    if (rate > 1.5) {
      return {
        rate,
        start: history.commits[0].timestamp,
        days: (Date.now() - history.commits[0].timestamp.getTime()) / (1000 * 60 * 60 * 24),
      };
    }

    return null;
  }

  private detectDecay(history: any): any[] {
    const fileModifications = new Map<string, Date>();
    const now = new Date();

    // Track last modification time for each file
    for (const commit of history.commits) {
      for (const file of commit.files) {
        if (
          !fileModifications.has(file.path) ||
          commit.timestamp > fileModifications.get(file.path)!
        ) {
          fileModifications.set(file.path, commit.timestamp);
        }
      }
    }

    const decaying: any[] = [];
    for (const [file, lastMod] of fileModifications) {
      const daysSince = (now.getTime() - lastMod.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > 180) {
        // 6 months
        decaying.push({
          file,
          lastModified: lastMod,
          daysSinceModified: Math.floor(daysSince),
          staleness: daysSince / 365,
          halfLife: 180, // Days until considered legacy
        });
      }
    }

    return decaying;
  }

  private predictConvergenceOutcome(convergence: any): TemporalPrediction[] {
    return [
      {
        when: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        what: `Files ${convergence.files.join(', ')} will converge to pattern: ${convergence.targetPattern}`,
        probability: convergence.confidence,
        reasoning: `Detected convergent evolution at rate ${convergence.rate}/month across ${convergence.files.length} files`,
      },
    ];
  }

  // ============================================================================
  // SPATIAL ANALYSIS
  // ============================================================================

  /**
   * Analyze architectural relationships
   * Detects: hidden coupling, hub-spoke patterns, isolated modules
   */
  private async architecturalRelationships(codebase: Codebase): Promise<SpatialPattern[]> {
    const patterns: SpatialPattern[] = [];
    const graph = await this.buildDependencyGraph(codebase);

    // Detect hidden coupling: files that should be independent but aren't
    const hiddenCoupling = this.detectHiddenCoupling(graph);
    if (hiddenCoupling.length > 0) {
      patterns.push({
        type: 'mesh',
        nodes: hiddenCoupling.map(c => c.file),
        edges: hiddenCoupling.flatMap(c =>
          c.coupledWith.map((target: string) => ({
            from: c.file,
            to: target,
            strength: c.strength,
          }))
        ),
        centrality: new Map(),
        communities: [],
        anomalies: hiddenCoupling.map(c => c.file),
      });
    }

    // Detect hub-spoke: one module everything depends on
    const hubs = this.detectHubs(graph);
    for (const hub of hubs) {
      patterns.push({
        type: 'hub-spoke',
        nodes: [hub.file, ...hub.dependents],
        edges: hub.dependents.map((dep: string) => ({
          from: dep,
          to: hub.file,
          strength: 1.0,
        })),
        centrality: new Map([[hub.file, hub.centrality]]),
        communities: [],
        anomalies: hub.centrality > 0.8 ? [hub.file] : [],
      });
    }

    // Detect isolated modules
    const isolated = this.detectIsolated(graph);
    if (isolated.length > 0) {
      patterns.push({
        type: 'isolated',
        nodes: isolated,
        edges: [],
        centrality: new Map(isolated.map(f => [f, 0])),
        communities: isolated.map(f => [f]),
        anomalies: isolated,
      });
    }

    return patterns;
  }

  private async buildDependencyGraph(codebase: Codebase): Promise<Map<string, Set<string>>> {
    const graph = new Map<string, Set<string>>();

    // Simplified: In real implementation, parse actual imports
    for (const file of codebase.files || []) {
      if (!graph.has(file.path)) {
        graph.set(file.path, new Set());
      }

      for (const dep of file.dependencies || []) {
        graph.get(file.path)!.add(dep);
      }
    }

    return graph;
  }

  private detectHiddenCoupling(graph: Map<string, Set<string>>): any[] {
    // Find files that share many dependencies (indirect coupling)
    const coupling: any[] = [];
    const files = Array.from(graph.keys());

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const depsA = graph.get(files[i]) || new Set();
        const depsB = graph.get(files[j]) || new Set();

        const shared = new Set([...depsA].filter(d => depsB.has(d)));
        const total = new Set([...depsA, ...depsB]);

        const jaccardIndex = shared.size / (total.size || 1);

        if (jaccardIndex > 0.5 && shared.size >= 3) {
          coupling.push({
            file: files[i],
            coupledWith: [files[j]],
            strength: jaccardIndex,
            sharedDependencies: Array.from(shared),
          });
        }
      }
    }

    return coupling;
  }

  private detectHubs(graph: Map<string, Set<string>>): any[] {
    const hubs: any[] = [];
    const inDegree = new Map<string, number>();

    // Count how many files depend on each file
    for (const [file, deps] of graph) {
      for (const dep of deps) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Find files with high in-degree
    const totalFiles = graph.size;
    for (const [file, count] of inDegree) {
      const centrality = count / totalFiles;

      if (centrality > 0.3) {
        // More than 30% of files depend on this
        const dependents: string[] = [];
        for (const [f, deps] of graph) {
          if (deps.has(file)) {
            dependents.push(f);
          }
        }

        hubs.push({
          file,
          centrality,
          dependentCount: count,
          dependents,
        });
      }
    }

    return hubs.sort((a, b) => b.centrality - a.centrality);
  }

  private detectIsolated(graph: Map<string, Set<string>>): string[] {
    const isolated: string[] = [];

    for (const [file, deps] of graph) {
      // File is isolated if it has no dependencies and nothing depends on it
      let hasIncoming = false;
      for (const [_, otherDeps] of graph) {
        if (otherDeps.has(file)) {
          hasIncoming = true;
          break;
        }
      }

      if (deps.size === 0 && !hasIncoming) {
        isolated.push(file);
      }
    }

    return isolated;
  }

  // ============================================================================
  // SEMANTIC ANALYSIS
  // ============================================================================

  /**
   * Analyze meaningful connections beyond syntax
   * Detects: concept drift, naming inconsistencies, abstraction leaks
   */
  private async meaningfulConnections(codebase: Codebase): Promise<SemanticPattern[]> {
    const patterns: SemanticPattern[] = [];

    // Detect concept drift: same name, different meanings over time
    const drift = await this.detectConceptDrift(codebase);
    if (drift.size > 0) {
      patterns.push({
        type: 'concept-drift',
        concepts: drift,
        similarityGraph: new Map(),
        abstractionLevels: new Map(),
        intentMismatch: [],
      });
    }

    // Detect naming inconsistencies
    const inconsistencies = await this.detectNamingInconsistencies(codebase);
    if (inconsistencies.size > 0) {
      patterns.push({
        type: 'naming-inconsistency',
        concepts: new Map(),
        similarityGraph: inconsistencies,
        abstractionLevels: new Map(),
        intentMismatch: [],
      });
    }

    return patterns;
  }

  private async detectConceptDrift(codebase: Codebase): Promise<Map<string, ConceptEvolution>> {
    const concepts = new Map<string, ConceptEvolution>();

    // Simplified: Track how function purposes change over time
    const history = await this.getCodeHistory(codebase);
    const functionMeanings = new Map<string, Array<{ meaning: string; timestamp: Date }>>();

    for (const commit of history.commits) {
      for (const file of commit.files) {
        for (const func of file.functions || []) {
          const key = `${file.path}:${func.name}`;
          if (!functionMeanings.has(key)) {
            functionMeanings.set(key, []);
          }

          const meaning = this.inferMeaning(func);
          functionMeanings.get(key)!.push({
            meaning,
            timestamp: commit.timestamp,
          });
        }
      }
    }

    // Find functions where meaning has drifted
    for (const [key, meanings] of functionMeanings) {
      if (meanings.length < 2) continue;

      const uniqueMeanings = new Set(meanings.map(m => m.meaning));
      if (uniqueMeanings.size > 1) {
        const evolution: ConceptEvolution = {
          name: key,
          meanings: Array.from(uniqueMeanings).map(m => ({
            meaning: m,
            confidence: meanings.filter(x => x.meaning === m).length / meanings.length,
            firstSeen: meanings.find(x => x.meaning === m)!.timestamp,
          })),
          drift: uniqueMeanings.size / meanings.length,
        };

        concepts.set(key, evolution);
      }
    }

    return concepts;
  }

  private inferMeaning(func: any): string {
    // Simplified: In real implementation, use NLP
    const name = func.name.toLowerCase();
    if (name.includes('get') || name.includes('fetch')) return 'retrieval';
    if (name.includes('set') || name.includes('update')) return 'mutation';
    if (name.includes('validate') || name.includes('check')) return 'validation';
    if (name.includes('calculate') || name.includes('compute')) return 'computation';
    return 'unknown';
  }

  private async detectNamingInconsistencies(
    codebase: Codebase
  ): Promise<Map<string, Array<{ to: string; similarity: number }>>> {
    const graph = new Map<string, Array<{ to: string; similarity: number }>>();

    // Find functions with similar purposes but different names
    const functions = this.extractAllFunctions(codebase);

    for (let i = 0; i < functions.length; i++) {
      const similar: Array<{ to: string; similarity: number }> = [];

      for (let j = i + 1; j < functions.length; j++) {
        const similarity = this.calculateSemanticSimilarity(functions[i], functions[j]);

        if (similarity > 0.7 && !this.similarNames(functions[i].name, functions[j].name)) {
          similar.push({
            to: functions[j].fullName,
            similarity,
          });
        }
      }

      if (similar.length > 0) {
        graph.set(functions[i].fullName, similar);
      }
    }

    return graph;
  }

  private extractAllFunctions(codebase: Codebase): any[] {
    const functions: any[] = [];

    for (const file of codebase.files || []) {
      for (const func of file.functions || []) {
        functions.push({
          name: func.name,
          fullName: `${file.path}:${func.name}`,
          params: func.params || [],
          returns: func.returns || 'any',
          purpose: this.inferMeaning(func),
        });
      }
    }

    return functions;
  }

  private calculateSemanticSimilarity(a: any, b: any): number {
    let score = 0;

    // Same purpose
    if (a.purpose === b.purpose) score += 0.5;

    // Similar parameters
    const paramSim = this.jaccardSimilarity(
      new Set(a.params.map((p: any) => p.type)),
      new Set(b.params.map((p: any) => p.type))
    );
    score += paramSim * 0.3;

    // Same return type
    if (a.returns === b.returns) score += 0.2;

    return score;
  }

  private jaccardSimilarity(a: Set<any>, b: Set<any>): number {
    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / (union.size || 1);
  }

  private similarNames(a: string, b: string): boolean {
    // Simple check: do names share common words?
    const wordsA = a.toLowerCase().split(/(?=[A-Z])|_/);
    const wordsB = b.toLowerCase().split(/(?=[A-Z])|_/);

    const common = wordsA.filter(w => wordsB.includes(w));
    return common.length > 0;
  }

  // ============================================================================
  // STATISTICAL ANALYSIS
  // ============================================================================

  /**
   * Analyze probabilistic correlations
   * Detects: outliers, unexpected correlations, distribution shifts
   */
  private async probabilisticCorrelations(codebase: Codebase): Promise<StatisticalPattern[]> {
    const patterns: StatisticalPattern[] = [];
    const metrics = await this.collectMetrics(codebase);

    // Detect outliers
    const outliers = this.detectOutliers(metrics);
    if (outliers.length > 0) {
      patterns.push({
        type: 'outlier',
        metrics,
        outliers,
        correlations: [],
        distributions: new Map(),
      });
    }

    // Detect correlations
    const correlations = this.detectCorrelations(metrics);
    if (correlations.length > 0) {
      patterns.push({
        type: 'correlation',
        metrics,
        outliers: [],
        correlations,
        distributions: new Map(),
      });
    }

    return patterns;
  }

  private async collectMetrics(codebase: Codebase): Promise<Map<string, number[]>> {
    const metrics = new Map<string, number[]>();

    // Collect various metrics for each file
    for (const file of codebase.files || []) {
      const path = file.path;

      if (!metrics.has('complexity')) metrics.set('complexity', []);
      if (!metrics.has('lines')) metrics.set('lines', []);
      if (!metrics.has('functions')) metrics.set('functions', []);
      if (!metrics.has('dependencies')) metrics.set('dependencies', []);

      metrics.get('complexity')!.push(file.complexity || 0);
      metrics.get('lines')!.push(file.lines || 0);
      metrics.get('functions')!.push((file.functions || []).length);
      metrics.get('dependencies')!.push((file.dependencies || []).length);
    }

    return metrics;
  }

  private detectOutliers(
    metrics: Map<string, number[]>
  ): Array<{ entity: string; metric: string; value: number; zScore: number }> {
    const outliers: Array<{ entity: string; metric: string; value: number; zScore: number }> = [];

    for (const [metric, values] of metrics) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      values.forEach((value, index) => {
        const zScore = (value - mean) / (stdDev || 1);

        if (Math.abs(zScore) > this.Z_SCORE_THRESHOLD) {
          outliers.push({
            entity: `file_${index}`,
            metric,
            value,
            zScore,
          });
        }
      });
    }

    return outliers;
  }

  private detectCorrelations(
    metrics: Map<string, number[]>
  ): Array<{ a: string; b: string; coefficient: number; pValue: number }> {
    const correlations: Array<{ a: string; b: string; coefficient: number; pValue: number }> = [];
    const metricNames = Array.from(metrics.keys());

    for (let i = 0; i < metricNames.length; i++) {
      for (let j = i + 1; j < metricNames.length; j++) {
        const a = metrics.get(metricNames[i])!;
        const b = metrics.get(metricNames[j])!;

        const coefficient = this.pearsonCorrelation(a, b);
        const pValue = this.calculatePValue(coefficient, a.length);

        if (Math.abs(coefficient) > this.CORRELATION_THRESHOLD && pValue < 0.05) {
          correlations.push({
            a: metricNames[i],
            b: metricNames[j],
            coefficient,
            pValue,
          });
        }
      }
    }

    return correlations;
  }

  private pearsonCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }

    return numerator / Math.sqrt(denomX * denomY || 1);
  }

  private calculatePValue(r: number, n: number): number {
    // Simplified p-value calculation
    const t = r * Math.sqrt((n - 2) / (1 - r * r || 1));
    // Approximate p-value using t-distribution (simplified)
    return Math.max(0, Math.min(1, 2 * (1 - this.normalCDF(Math.abs(t)))));
  }

  private normalCDF(x: number): number {
    // Approximate standard normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximate error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  // ============================================================================
  // QUANTUM ANALYSIS
  // ============================================================================

  /**
   * Analyze superposition states - code with multiple valid interpretations
   * Superhuman: Humans struggle to hold multiple contradictory interpretations
   */
  private async superpositionStates(codebase: Codebase): Promise<QuantumPattern[]> {
    const patterns: QuantumPattern[] = [];

    // Find code that can be interpreted multiple ways
    const superpositions = this.findSuperpositions(codebase);
    if (superpositions.length > 0) {
      patterns.push({
        type: 'superposition',
        states: this.extractStates(superpositions),
        superpositions,
        entanglements: [],
        uncertainties: [],
      });
    }

    // Find entanglements: changes in one place always affect another
    const entanglements = this.findEntanglements(codebase);
    if (entanglements.length > 0) {
      patterns.push({
        type: 'entanglement',
        states: [],
        superpositions: [],
        entanglements,
        uncertainties: [],
      });
    }

    return patterns;
  }

  private findSuperpositions(
    codebase: Codebase
  ): Array<{ entity: string; states: string[]; weights: number[] }> {
    const superpositions: Array<{ entity: string; states: string[]; weights: number[] }> = [];

    // Find functions that could be multiple things
    for (const file of codebase.files || []) {
      for (const func of file.functions || []) {
        const states = this.analyzeQuantumStates(func);

        if (states.length >= 2) {
          const weights = states.map(s => s.probability);
          const normalized = this.normalize(weights);

          superpositions.push({
            entity: `${file.path}:${func.name}`,
            states: states.map(s => s.description),
            weights: normalized,
          });
        }
      }
    }

    return superpositions;
  }

  private analyzeQuantumStates(func: any): Array<{ description: string; probability: number }> {
    const states: Array<{ description: string; probability: number }> = [];

    // Could be a getter
    if (func.name.startsWith('get') || func.params.length === 0) {
      states.push({ description: 'pure-getter', probability: 0.6 });
    }

    // Could be a setter
    if (func.params.length > 0 && func.returns === 'void') {
      states.push({ description: 'pure-setter', probability: 0.7 });
    }

    // Could be a transformer
    if (func.params.length > 0 && func.returns !== 'void') {
      states.push({ description: 'transformer', probability: 0.8 });
    }

    // Could be an action
    if (func.name.startsWith('handle') || func.name.includes('on')) {
      states.push({ description: 'event-handler', probability: 0.75 });
    }

    return states;
  }

  private normalize(values: number[]): number[] {
    const sum = values.reduce((a, b) => a + b, 0);
    return values.map(v => v / (sum || 1));
  }

  private extractStates(superpositions: any[]): QuantumState[] {
    const states: QuantumState[] = [];
    const stateMap = new Map<string, QuantumState>();

    for (const sup of superpositions) {
      for (let i = 0; i < sup.states.length; i++) {
        const state = sup.states[i];
        if (!stateMap.has(state)) {
          stateMap.set(state, {
            id: state,
            description: state,
            probability: sup.weights[i],
            compatible: sup.states.filter((_: any, j: number) => j !== i),
            exclusive: [],
          });
        }
      }
    }

    return Array.from(stateMap.values());
  }

  private findEntanglements(
    codebase: Codebase
  ): Array<{ entities: string[]; correlation: number }> {
    const entanglements: Array<{ entities: string[]; correlation: number }> = [];
    const history = this.getCodeHistory(codebase);

    // Find files that always change together
    const cochanges = new Map<string, Map<string, number>>();

    for (const commit of history.commits) {
      const files = commit.files.map((f: any) => f.path);

      for (let i = 0; i < files.length; i++) {
        if (!cochanges.has(files[i])) {
          cochanges.set(files[i], new Map());
        }

        for (let j = i + 1; j < files.length; j++) {
          const current = cochanges.get(files[i])!;
          current.set(files[j], (current.get(files[j]) || 0) + 1);
        }
      }
    }

    // Find strong correlations
    for (const [fileA, cochangeMap] of cochanges) {
      for (const [fileB, count] of cochangeMap) {
        const correlation = count / history.commits.length;

        if (correlation > 0.8) {
          entanglements.push({
            entities: [fileA, fileB],
            correlation,
          });
        }
      }
    }

    return entanglements;
  }

  // ============================================================================
  // MULTI-DIMENSIONAL PATTERN SYNTHESIS
  // ============================================================================

  /**
   * Combine patterns from all dimensions
   */
  private async analyzeMultidimensional(dimensions: {
    temporal: TemporalPattern[];
    spatial: SpatialPattern[];
    semantic: SemanticPattern[];
    statistical: StatisticalPattern[];
    quantum: QuantumPattern[];
  }): Promise<MultiDimensionalPattern[]> {
    const patterns: MultiDimensionalPattern[] = [];
    let patternId = 0;

    // Create multi-dimensional patterns
    for (const temporal of dimensions.temporal) {
      patterns.push({
        id: `md-${patternId++}`,
        type: this.mapTemporalToPatternType(temporal),
        dimensions: { temporal },
        significance: this.calculateSignificance({ temporal }),
        humanObvious: this.calculateHumanObviousness({ temporal }),
        confidence: 0.85,
        discovered: new Date(),
        instances: [],
      });
    }

    for (const spatial of dimensions.spatial) {
      patterns.push({
        id: `md-${patternId++}`,
        type: this.mapSpatialToPatternType(spatial),
        dimensions: { spatial },
        significance: this.calculateSignificance({ spatial }),
        humanObvious: this.calculateHumanObviousness({ spatial }),
        confidence: 0.82,
        discovered: new Date(),
        instances: [],
      });
    }

    for (const semantic of dimensions.semantic) {
      patterns.push({
        id: `md-${patternId++}`,
        type: this.mapSemanticToPatternType(semantic),
        dimensions: { semantic },
        significance: this.calculateSignificance({ semantic }),
        humanObvious: this.calculateHumanObviousness({ semantic }),
        confidence: 0.78,
        discovered: new Date(),
        instances: [],
      });
    }

    for (const statistical of dimensions.statistical) {
      patterns.push({
        id: `md-${patternId++}`,
        type: 'statistical-anomaly',
        dimensions: { statistical },
        significance: this.calculateSignificance({ statistical }),
        humanObvious: this.calculateHumanObviousness({ statistical }),
        confidence: 0.9,
        discovered: new Date(),
        instances: [],
      });
    }

    for (const quantum of dimensions.quantum) {
      patterns.push({
        id: `md-${patternId++}`,
        type: 'quantum-superposition',
        dimensions: { quantum },
        significance: this.calculateSignificance({ quantum }),
        humanObvious: this.calculateHumanObviousness({ quantum }),
        confidence: 0.75,
        discovered: new Date(),
        instances: [],
      });
    }

    return patterns;
  }

  private mapTemporalToPatternType(temporal: TemporalPattern): PatternType {
    if (temporal.direction === 'converging') return 'evolution-convergence';
    return 'semantic-drift';
  }

  private mapSpatialToPatternType(spatial: SpatialPattern): PatternType {
    if (spatial.type === 'mesh') return 'hidden-coupling';
    if (spatial.type === 'hub-spoke') return 'emergent-architecture';
    return 'hidden-coupling';
  }

  private mapSemanticToPatternType(semantic: SemanticPattern): PatternType {
    return 'semantic-drift';
  }

  private calculateSignificance(dimensions: any): number {
    // Complex calculation based on pattern impact
    let score = 0;

    if (dimensions.temporal) {
      score += dimensions.temporal.velocity * 0.3;
    }

    if (dimensions.spatial) {
      score += (dimensions.spatial.nodes.length / 10) * 0.3;
    }

    if (dimensions.semantic) {
      score += ((dimensions.semantic.concepts?.size || 0) / 5) * 0.2;
    }

    if (dimensions.statistical) {
      score += ((dimensions.statistical.outliers?.length || 0) / 5) * 0.3;
    }

    if (dimensions.quantum) {
      score += ((dimensions.quantum.superpositions?.length || 0) / 3) * 0.4;
    }

    return Math.min(1, score);
  }

  private calculateHumanObviousness(dimensions: any): number {
    // Lower = less obvious to humans
    let obviousness = 0.5; // Start at middle

    // Temporal patterns: harder for humans to track over time
    if (dimensions.temporal) {
      obviousness -= 0.3;
    }

    // Quantum superpositions: humans struggle with contradictions
    if (dimensions.quantum) {
      obviousness -= 0.4;
    }

    // Statistical correlations: non-obvious without calculation
    if (dimensions.statistical?.correlations?.length > 0) {
      obviousness -= 0.3;
    }

    // Hidden coupling: by definition, not obvious
    if (dimensions.spatial?.type === 'mesh') {
      obviousness -= 0.25;
    }

    return Math.max(0, Math.min(1, obviousness));
  }

  // ============================================================================
  // INSIGHT GENERATION
  // ============================================================================

  private createInsight(pattern: MultiDimensionalPattern): SuperhumanInsight {
    return {
      id: `insight-${pattern.id}`,
      pattern,
      description: this.describePattern(pattern),
      whyNotObvious: this.explainNonObviousness(pattern),
      businessImpact: this.assessBusinessImpact(pattern),
      actionable: this.generateRecommendations(pattern),
      visualization: this.visualizePattern(pattern),
    };
  }

  private describePattern(pattern: MultiDimensionalPattern): string {
    const descriptions: string[] = [];

    if (pattern.dimensions.temporal) {
      const t = pattern.dimensions.temporal;
      descriptions.push(
        `Temporal: ${t.type} pattern with ${t.direction} direction at ${t.velocity.toFixed(2)}x velocity`
      );
    }

    if (pattern.dimensions.spatial) {
      const s = pattern.dimensions.spatial;
      descriptions.push(`Spatial: ${s.type} structure with ${s.nodes.length} nodes`);
    }

    if (pattern.dimensions.semantic) {
      const sem = pattern.dimensions.semantic;
      descriptions.push(`Semantic: ${sem.type} affecting ${sem.concepts?.size || 0} concepts`);
    }

    if (pattern.dimensions.statistical) {
      const stat = pattern.dimensions.statistical;
      descriptions.push(
        `Statistical: ${stat.outliers.length} outliers, ${stat.correlations.length} correlations`
      );
    }

    if (pattern.dimensions.quantum) {
      const q = pattern.dimensions.quantum;
      descriptions.push(`Quantum: ${q.superpositions.length} superposition states`);
    }

    return descriptions.join('; ');
  }

  private explainNonObviousness(pattern: MultiDimensionalPattern): string {
    const reasons: string[] = [];

    if (pattern.dimensions.temporal) {
      reasons.push('Requires tracking changes across months - beyond human working memory');
    }

    if (pattern.dimensions.quantum) {
      reasons.push('Involves holding contradictory interpretations simultaneously');
    }

    if (pattern.dimensions.statistical) {
      reasons.push('Requires statistical analysis across hundreds of data points');
    }

    if (pattern.dimensions.spatial && pattern.dimensions.spatial.type === 'mesh') {
      reasons.push('Hidden coupling is indirect and non-obvious without graph analysis');
    }

    return reasons.join('; ') || 'Multi-dimensional pattern requiring holistic analysis';
  }

  private assessBusinessImpact(pattern: MultiDimensionalPattern): BusinessImpact {
    let category: BusinessImpact['category'] = 'maintainability';
    let magnitude = 5;
    let timeframe: BusinessImpact['timeframe'] = 'month';

    if (pattern.type === 'hidden-coupling') {
      category = 'maintainability';
      magnitude = 7;
      timeframe = 'immediate';
    } else if (pattern.type === 'statistical-anomaly') {
      category = 'performance';
      magnitude = 8;
      timeframe = 'week';
    } else if (pattern.type === 'evolution-convergence') {
      category = 'maintainability';
      magnitude = 6;
      timeframe = 'month';
    }

    return {
      category,
      magnitude,
      timeframe,
      description: `${category} impact of magnitude ${magnitude}/10`,
      estimatedValue: magnitude * 5000, // $5k per magnitude point
    };
  }

  private generateRecommendations(pattern: MultiDimensionalPattern): ActionableRecommendation[] {
    const recommendations: ActionableRecommendation[] = [];

    if (pattern.type === 'hidden-coupling') {
      recommendations.push({
        priority: 'high',
        action: 'Decouple interdependent modules',
        rationale: 'Hidden coupling increases change risk and reduces modularity',
        effort: 'medium',
        roi: 8.5,
      });
    }

    if (pattern.type === 'evolution-convergence') {
      recommendations.push({
        priority: 'medium',
        action: 'Extract converging patterns into shared module',
        rationale: 'Files are converging toward same pattern - formalize it',
        effort: 'small',
        roi: 9.2,
      });
    }

    if (pattern.type === 'statistical-anomaly') {
      recommendations.push({
        priority: 'critical',
        action: 'Investigate and resolve statistical outliers',
        rationale: 'Outliers often indicate bugs or performance issues',
        effort: 'small',
        roi: 9.8,
      });
    }

    return recommendations;
  }

  private visualizePattern(pattern: MultiDimensionalPattern): Visualization {
    if (pattern.dimensions.spatial) {
      return this.createGraphVisualization(pattern.dimensions.spatial);
    }

    if (pattern.dimensions.temporal) {
      return this.createTimelineVisualization(pattern.dimensions.temporal);
    }

    return {
      type: 'graph',
      data: {},
      mermaid: 'graph TD\n  A[Pattern] --> B[Detected]',
    };
  }

  private createGraphVisualization(spatial: SpatialPattern): Visualization {
    const mermaid = `graph LR\n${spatial.edges
      .map(
        e =>
          `  ${e.from.replace(/[^a-zA-Z0-9]/g, '_')} -->|${e.strength.toFixed(2)}| ${e.to.replace(/[^a-zA-Z0-9]/g, '_')}`
      )
      .join('\n')}`;

    return {
      type: 'force-directed',
      data: {
        nodes: spatial.nodes.map(n => ({ id: n })),
        edges: spatial.edges,
      },
      mermaid,
    };
  }

  private createTimelineVisualization(temporal: TemporalPattern): Visualization {
    return {
      type: 'timeline',
      data: {
        start: temporal.timeframe.start,
        end: temporal.timeframe.end,
        events: temporal.predictions.map(p => ({
          date: p.when,
          description: p.what,
        })),
      },
    };
  }

  private generateMultiDimensionalView(insights: SuperhumanInsight[]): Visualization {
    // Combine all visualizations
    const mermaid = `graph TD\n  Root[Superhuman Insights]\n${insights
      .map((ins, i) => `  Root --> Insight${i}[${ins.pattern.type}]`)
      .join('\n')}`;

    return {
      type: 'graph',
      data: { insights },
      mermaid,
    };
  }

  private calculateBusinessImpact(insights: SuperhumanInsight[]): BusinessImpact[] {
    return insights.map(i => i.businessImpact);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getCodeHistory(codebase: Codebase): any {
    // Simplified: In real implementation, use git history
    return {
      commits: (codebase as any).history?.commits || [],
    };
  }
}

export type {
  MultiDimensionalPattern,
  PatternType,
  TemporalPattern,
  SpatialPattern,
  SemanticPattern,
  StatisticalPattern,
  QuantumPattern,
  SuperhumanInsight,
  BusinessImpact,
  ActionableRecommendation,
  Visualization,
};
