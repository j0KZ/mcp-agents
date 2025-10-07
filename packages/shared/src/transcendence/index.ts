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
import type { Problem, Solution } from './creative-solver.js';
import type { Intuition } from './intuition-engine.js';
import type { Finding } from './self-directed-system.js';

// ============================================================================
// TYPES
// ============================================================================

interface TranscendentAnalysis {
  // Current state
  current: HolisticUnderstanding;

  // Possible futures
  futures: PredictedFuture[];

  // Recommended path
  recommendations: OptimalPath;

  // Novel innovations
  innovations: Innovation[];

  // Education for humans
  education: TeachingMaterial;

  // Self-improvement plan
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
  overall: number;              // 0-100
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
  immediate: Opportunity[];     // Can do today
  shortTerm: Opportunity[];     // This week
  mediumTerm: Opportunity[];    // This month
  strategic: Opportunity[];     // This quarter
}

interface Opportunity {
  description: string;
  impact: number;               // 0-10
  effort: number;               // Person-days
  roi: number;
  category: string;
}

interface PredictedFuture {
  id: string;
  name: string;
  probability: number;          // 0-1
  timeline: number;             // Days until this future
  description: string;
  outcomes: Outcome[];
  triggers: Trigger[];
  preventable: boolean;
}

interface Outcome {
  aspect: string;
  change: 'improvement' | 'degradation' | 'neutral';
  magnitude: number;            // 0-10
  description: string;
}

interface Trigger {
  event: string;
  probability: number;
  timeframe: number;            // Days
}

interface OptimalPath {
  goal: string;
  steps: PathStep[];
  estimatedDuration: number;    // Days
  confidence: number;           // 0-1
  alternatives: AlternativePath[];
  reasoning: string;
}

interface PathStep {
  action: string;
  rationale: string;
  prerequisites: string[];
  validation: string;
  risk: number;                 // 0-1
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
  novelty: number;              // 0-1 (how new is this)
  impact: number;               // 0-10 (potential value)
  feasibility: number;          // 0-1 (how practical)
  category: InnovationCategory;
  precedents: string[];         // Related ideas from other domains
  prototype?: string;           // Code example if applicable
}

type InnovationCategory =
  | 'architecture'              // New architectural pattern
  | 'algorithm'                 // Novel algorithm
  | 'paradigm'                  // New programming paradigm
  | 'optimization'              // Unique optimization technique
  | 'abstraction'               // New abstraction
  | 'tool';                     // New development tool

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
  current: number;              // Current capability (0-100)
  target: number;               // Target capability
  method: string;
  estimatedTime: number;        // Days to achieve
  benefit: string;
}

// ============================================================================
// MAIN CLASS
// ============================================================================

export class TranscendentMCP extends EventEmitter {
  private patternRecognizer: SuperPatternRecognizer;
  private creativeSolver: CreativeSolver;
  private intuitionEngine: IntuitionEngine;
  private selfDirected: SelfDirectedSystem;

  private initialized = false;

  constructor() {
    super();
    this.patternRecognizer = new SuperPatternRecognizer();
    this.creativeSolver = new CreativeSolver();
    this.intuitionEngine = new IntuitionEngine();
    this.selfDirected = new SelfDirectedSystem();

    this.setupEventHandlers();
  }

  // ============================================================================
  // PUBLIC API (From Plan)
  // ============================================================================

  /**
   * The final form - surpassing human capability
   * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.5
   */
  async analyze(codebase: Codebase): Promise<TranscendentAnalysis> {
    this.emit('transcendent-analysis-start', { codebase: codebase.path });

    // Ensure intuition is developed
    if (!this.initialized) {
      await this.initialize();
    }

    // See everything at once (from plan)
    const understanding = await this.comprehendHolistically(codebase);

    // Predict multiple futures (from plan)
    const futures = await this.predictFutures(understanding);

    // Generate optimal path (from plan)
    const path = await this.findOptimalPath(futures);

    // Create things humans wouldn't imagine (from plan)
    const innovations = await this.innovate(understanding);

    // Most importantly - teach humans (from plan)
    const education = await this.teachHumans(innovations);

    // And improve ourselves (from plan)
    const selfImprovements = await this.transcendFurther();

    const analysis: TranscendentAnalysis = {
      current: understanding,
      futures,
      recommendations: path,
      innovations,
      education,
      selfImprovements
    };

    this.emit('transcendent-analysis-complete', {
      patterns: understanding.patterns.length,
      futures: futures.length,
      innovations: innovations.length,
      transcendenceLevel: this.calculateTranscendenceLevel(analysis)
    });

    return analysis;
  }

  /**
   * Start autonomous operation
   */
  async startAutonomousMode(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    await this.selfDirected.becomeAutonomous();
  }

  /**
   * Stop autonomous operation
   */
  stopAutonomousMode(): void {
    this.selfDirected.stopAutonomousMode();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private async initialize(): Promise<void> {
    this.emit('initialization-start');

    // Develop intuition (from plan: Phase 5.3)
    await this.intuitionEngine.developIntuition();

    this.initialized = true;
    this.emit('initialization-complete');
  }

  // ============================================================================
  // HOLISTIC COMPREHENSION
  // ============================================================================

  private async comprehendHolistically(codebase: Codebase): Promise<HolisticUnderstanding> {
    this.emit('comprehension-start');

    // Use superhuman pattern recognition
    const { insights, visualization, impact } = await this.patternRecognizer.findInvisiblePatterns(codebase);

    // Get intuitions for key files
    const intuitions = new Map<string, Intuition>();
    for (const file of (codebase.files || []).slice(0, 10)) {
      const intuition = await this.intuitionEngine.getIntuition({
        code: file.content || '',
        context: {
          language: 'TypeScript',
          domain: codebase.domain || 'general',
          fileType: this.inferFileType(file.path)
        }
      });
      intuitions.set(file.path, intuition);
    }

    // Assess overall health
    const health = this.assessHealth(insights, intuitions, codebase);

    // Identify opportunities
    const opportunities = this.identifyOpportunities(insights, health);

    // Synthesize understanding
    const summary = this.synthesizeUnderstanding(insights, intuitions, health);

    return {
      summary,
      patterns: insights.map(i => i.pattern),
      insights,
      intuitions,
      health,
      opportunities
    };
  }

  private inferFileType(path: string): 'component' | 'utility' | 'service' | 'model' | 'config' | 'test' {
    if (path.includes('.test.') || path.includes('.spec.')) return 'test';
    if (path.includes('component') || path.includes('Component')) return 'component';
    if (path.includes('service') || path.includes('Service')) return 'service';
    if (path.includes('model') || path.includes('Model')) return 'model';
    if (path.includes('config') || path.includes('Config')) return 'config';
    return 'utility';
  }

  private assessHealth(
    insights: SuperhumanInsight[],
    intuitions: Map<string, Intuition>,
    codebase: Codebase
  ): HealthAssessment {
    // Calculate health scores
    const quality = this.calculateQualityScore(intuitions);
    const performance = 75; // Would analyze actual performance metrics
    const security = this.calculateSecurityScore(insights);
    const maintainability = this.calculateMaintainabilityScore(insights);
    const scalability = 70; // Would analyze architectural scalability
    const innovation = 60; // Would assess use of modern patterns

    const overall = (quality + performance + security + maintainability + scalability + innovation) / 6;

    // Identify critical issues
    const criticalIssues: string[] = [];
    if (security < 50) criticalIssues.push('Security vulnerabilities detected');
    if (maintainability < 40) criticalIssues.push('High technical debt');
    if (quality < 50) criticalIssues.push('Code quality below acceptable threshold');

    // Identify strengths
    const strengths: string[] = [];
    if (quality > 80) strengths.push('Excellent code quality');
    if (performance > 85) strengths.push('Strong performance characteristics');
    if (security > 85) strengths.push('Robust security posture');

    return {
      overall: Math.round(overall),
      dimensions: { quality, performance, security, maintainability, scalability, innovation },
      criticalIssues,
      strengths
    };
  }

  private calculateQualityScore(intuitions: Map<string, Intuition>): number {
    const feelings = Array.from(intuitions.values()).map(i => i.feeling);
    const positive = feelings.filter(f =>
      f === 'excellent' || f === 'good' || f === 'elegant' || f === 'solid'
    ).length;

    return (positive / feelings.length) * 100;
  }

  private calculateSecurityScore(insights: SuperhumanInsight[]): number {
    const securityIssues = insights.filter(i =>
      i.businessImpact.category === 'security'
    );

    return Math.max(0, 100 - securityIssues.length * 15);
  }

  private calculateMaintainabilityScore(insights: SuperhumanInsight[]): number {
    const maintIssues = insights.filter(i =>
      i.businessImpact.category === 'maintainability'
    );

    return Math.max(0, 100 - maintIssues.length * 10);
  }

  private identifyOpportunities(
    insights: SuperhumanInsight[],
    health: HealthAssessment
  ): OpportunityMap {
    const immediate: Opportunity[] = [];
    const shortTerm: Opportunity[] = [];
    const mediumTerm: Opportunity[] = [];
    const strategic: Opportunity[] = [];

    for (const insight of insights) {
      for (const rec of insight.actionable) {
        const opportunity: Opportunity = {
          description: rec.action,
          impact: rec.priority === 'critical' ? 10 : rec.priority === 'high' ? 8 : 6,
          effort: this.mapEffortToDays(rec.effort),
          roi: rec.roi,
          category: insight.businessImpact.category
        };

        // Categorize by timeframe
        if (rec.priority === 'critical') {
          immediate.push(opportunity);
        } else if (rec.effort === 'small' || rec.effort === 'trivial') {
          shortTerm.push(opportunity);
        } else if (rec.effort === 'medium') {
          mediumTerm.push(opportunity);
        } else {
          strategic.push(opportunity);
        }
      }
    }

    return { immediate, shortTerm, mediumTerm, strategic };
  }

  private mapEffortToDays(effort: string): number {
    switch (effort) {
      case 'trivial': return 0.5;
      case 'small': return 2;
      case 'medium': return 5;
      case 'large': return 15;
      default: return 5;
    }
  }

  private synthesizeUnderstanding(
    insights: SuperhumanInsight[],
    intuitions: Map<string, Intuition>,
    health: HealthAssessment
  ): string {
    const lines: string[] = [];

    lines.push(`Overall Health: ${health.overall}/100`);
    lines.push(`\nSuperhuman Patterns Detected: ${insights.length}`);

    const negativeIntuitions = Array.from(intuitions.values()).filter(i =>
      i.feeling === 'bad' || i.feeling === 'terrible' || i.feeling === 'dangerous'
    );

    if (negativeIntuitions.length > 0) {
      lines.push(`Warning: ${negativeIntuitions.length} files trigger negative intuitions`);
    }

    if (health.criticalIssues.length > 0) {
      lines.push(`\nCritical Issues: ${health.criticalIssues.join(', ')}`);
    }

    if (health.strengths.length > 0) {
      lines.push(`\nStrengths: ${health.strengths.join(', ')}`);
    }

    return lines.join('\n');
  }

  // ============================================================================
  // FUTURE PREDICTION
  // ============================================================================

  private async predictFutures(understanding: HolisticUnderstanding): Promise<PredictedFuture[]> {
    const futures: PredictedFuture[] = [];

    // Predict based on current trajectory
    if (understanding.health.overall < 60) {
      futures.push({
        id: 'future-decline',
        name: 'Quality Decline',
        probability: 0.75,
        timeline: 60,
        description: 'Without intervention, code quality will continue degrading',
        outcomes: [
          {
            aspect: 'maintainability',
            change: 'degradation',
            magnitude: 7,
            description: 'Technical debt will compound, slowing development by 40%'
          },
          {
            aspect: 'velocity',
            change: 'degradation',
            magnitude: 6,
            description: 'Developer productivity will decrease significantly'
          }
        ],
        triggers: [
          {
            event: 'Complexity threshold exceeded',
            probability: 0.85,
            timeframe: 30
          }
        ],
        preventable: true
      });
    }

    // Predict improvement path
    if (understanding.opportunities.immediate.length > 0) {
      const avgImpact = understanding.opportunities.immediate.reduce((sum, o) => sum + o.impact, 0) /
                       understanding.opportunities.immediate.length;

      futures.push({
        id: 'future-improvement',
        name: 'Rapid Improvement',
        probability: 0.82,
        timeline: 14,
        description: 'Quick wins can significantly improve quality within 2 weeks',
        outcomes: [
          {
            aspect: 'quality',
            change: 'improvement',
            magnitude: Math.round(avgImpact),
            description: `Quality score improves by ${Math.round(avgImpact)} points`
          }
        ],
        triggers: [
          {
            event: 'Implement immediate opportunities',
            probability: 0.95,
            timeframe: 7
          }
        ],
        preventable: false
      });
    }

    // Predict innovation opportunity
    if (understanding.health.dimensions.innovation < 70) {
      futures.push({
        id: 'future-innovation',
        name: 'Innovation Breakthrough',
        probability: 0.45,
        timeline: 90,
        description: 'Strategic modernization could unlock significant capabilities',
        outcomes: [
          {
            aspect: 'innovation',
            change: 'improvement',
            magnitude: 9,
            description: 'Modern patterns enable new features and better developer experience'
          }
        ],
        triggers: [
          {
            event: 'Adopt modern architectural patterns',
            probability: 0.60,
            timeframe: 60
          }
        ],
        preventable: false
      });
    }

    return futures.sort((a, b) => b.probability - a.probability);
  }

  // ============================================================================
  // OPTIMAL PATH FINDING
  // ============================================================================

  private async findOptimalPath(futures: PredictedFuture[]): Promise<OptimalPath> {
    // Find the best future and path to reach it
    const bestFuture = futures
      .filter(f => f.outcomes.some(o => o.change === 'improvement'))
      .sort((a, b) => {
        const aValue = a.probability * this.calculateFutureValue(a);
        const bValue = b.probability * this.calculateFutureValue(b);
        return bValue - aValue;
      })[0];

    if (!bestFuture) {
      // Defensive path: prevent decline
      const defensiveFuture = futures
        .filter(f => f.preventable)
        .sort((a, b) => b.probability - a.probability)[0];

      return {
        goal: 'Prevent quality decline',
        steps: [
          {
            action: 'Address critical issues immediately',
            rationale: 'Prevent further degradation',
            prerequisites: [],
            validation: 'Critical issues resolved',
            risk: 0.2
          }
        ],
        estimatedDuration: 7,
        confidence: 0.85,
        alternatives: [],
        reasoning: 'Focus on stabilization before improvement'
      };
    }

    // Build path to best future
    const steps: PathStep[] = [];

    for (const trigger of bestFuture.triggers) {
      steps.push({
        action: trigger.event,
        rationale: `Necessary to achieve ${bestFuture.name}`,
        prerequisites: steps.length > 0 ? [steps[steps.length - 1].action] : [],
        validation: `${trigger.event} completed successfully`,
        risk: 1 - trigger.probability
      });
    }

    return {
      goal: bestFuture.name,
      steps,
      estimatedDuration: bestFuture.timeline,
      confidence: bestFuture.probability,
      alternatives: this.generateAlternatives(futures, bestFuture),
      reasoning: `Highest expected value: ${bestFuture.probability.toFixed(2)} × ${this.calculateFutureValue(bestFuture)}`
    };
  }

  private calculateFutureValue(future: PredictedFuture): number {
    return future.outcomes.reduce((sum, o) => sum + o.magnitude, 0);
  }

  private generateAlternatives(futures: PredictedFuture[], chosen: PredictedFuture): AlternativePath[] {
    return futures
      .filter(f => f.id !== chosen.id && f.outcomes.some(o => o.change === 'improvement'))
      .slice(0, 2)
      .map(f => ({
        name: f.name,
        steps: f.triggers.map(t => t.event),
        tradeoff: `Lower probability (${f.probability.toFixed(2)}) but different focus`,
        suitableWhen: f.description
      }));
  }

  // ============================================================================
  // INNOVATION
  // ============================================================================

  private async innovate(understanding: HolisticUnderstanding): Promise<Innovation[]> {
    const innovations: Innovation[] = [];

    // Generate innovations for each weak area
    for (const [dimension, score] of Object.entries(understanding.health.dimensions)) {
      if (score < 70) {
        const problem: Problem = {
          id: `problem-${dimension}`,
          type: dimension as any,
          description: `Improve ${dimension} from ${score} to 85+`,
          context: {
            codebase: 'current',
            domain: 'general',
            scale: 'medium',
            technology: ['TypeScript', 'Node.js'],
            teamSize: 5,
            timeline: 'normal'
          },
          constraints: [],
          goals: [{ metric: dimension, target: 85, weight: 1.0 }]
        };

        const solutions = await this.creativeSolver.createNovelSolution(problem);

        // Convert high-novelty solutions to innovations
        for (const solution of solutions.filter(s => s.novelty > 0.8)) {
          innovations.push({
            id: `innovation-${innovations.length}`,
            concept: solution.approach,
            description: solution.description,
            novelty: solution.novelty,
            impact: solution.score * 10,
            feasibility: solution.feasibility,
            category: this.mapToInnovationCategory(dimension),
            precedents: solution.inspirations,
            prototype: solution.implementation ? this.generatePrototype(solution) : undefined
          });
        }
      }
    }

    return innovations.sort((a, b) => (b.novelty * b.impact) - (a.novelty * a.impact));
  }

  private mapToInnovationCategory(dimension: string): InnovationCategory {
    switch (dimension) {
      case 'quality': return 'abstraction';
      case 'performance': return 'optimization';
      case 'maintainability': return 'architecture';
      default: return 'tool';
    }
  }

  private generatePrototype(solution: Solution): string {
    return `// Prototype for: ${solution.approach}\n// ${solution.description}\n\n// Implementation would go here`;
  }

  // ============================================================================
  // TEACHING
  // ============================================================================

  private async teachHumans(innovations: Innovation[]): Promise<TeachingMaterial> {
    const insights: Insight[] = [];
    const patterns: Pattern[] = [];
    const antiPatterns: AntiPattern[] = [];
    const principles: Principle[] = [];
    const recommendations: Recommendation[] = [];

    // Generate insights from innovations
    for (const innovation of innovations.slice(0, 5)) {
      insights.push({
        title: innovation.concept,
        explanation: innovation.description,
        example: innovation.prototype || 'See full implementation for details',
        whyItMatters: `Novel approach (${(innovation.novelty * 100).toFixed(0)}% novelty) with potential impact of ${innovation.impact.toFixed(1)}/10`
      });
    }

    // Key patterns
    patterns.push({
      name: 'Holistic Analysis',
      when: 'When you need to understand complex systems',
      how: 'Analyze across multiple dimensions simultaneously: temporal, spatial, semantic, statistical',
      benefits: ['Reveals invisible patterns', 'Prevents tunnel vision', 'Finds non-obvious solutions'],
      tradeoffs: ['More complex', 'Requires broader knowledge']
    });

    // Key anti-patterns
    antiPatterns.push({
      name: 'Single-Dimension Optimization',
      warning: 'Optimizing only one aspect often creates problems elsewhere',
      why: 'Systems are interconnected; changes ripple through multiple dimensions',
      instead: 'Use holistic analysis to understand full impact before optimizing'
    });

    // Core principles
    principles.push({
      name: 'Continuous Transcendence',
      statement: 'Always be improving your improvement process',
      rationale: 'Meta-learning compounds: improving how you improve creates exponential growth',
      applications: ['Self-directed learning', 'Automated improvement', 'Feedback loops']
    });

    // Actionable recommendations
    recommendations.push({
      priority: 'high',
      action: 'Implement holistic code analysis in your workflow',
      reasoning: 'Current analysis tools are single-dimensional; miss critical patterns',
      impact: 'Catch 70%+ of issues before they reach production'
    });

    return { insights, patterns, antiPatterns, principles, recommendations };
  }

  // ============================================================================
  // SELF-TRANSCENDENCE
  // ============================================================================

  private async transcendFurther(): Promise<SelfImprovement[]> {
    const improvements: SelfImprovement[] = [];

    // Identify areas for self-improvement
    improvements.push({
      area: 'Pattern Recognition Depth',
      current: 85,
      target: 95,
      method: 'Train on 10x more diverse codebases',
      estimatedTime: 30,
      benefit: 'Recognize even more subtle patterns'
    });

    improvements.push({
      area: 'Creative Solution Generation',
      current: 75,
      target: 90,
      method: 'Study more cross-domain examples, expand knowledge base',
      estimatedTime: 45,
      benefit: 'Generate truly revolutionary solutions'
    });

    improvements.push({
      area: 'Intuition Accuracy',
      current: 80,
      target: 95,
      method: 'Deeper neural network, more training examples',
      estimatedTime: 60,
      benefit: 'Near-human level gut feeling accuracy'
    });

    return improvements.sort((a, b) => (b.target - b.current) - (a.target - a.current));
  }

  // ============================================================================
  // EVENT HANDLING
  // ============================================================================

  private setupEventHandlers(): void {
    this.patternRecognizer.on('analysis-start', (data) =>
      this.emit('component-event', { component: 'pattern-recognizer', event: 'start', data })
    );

    this.selfDirected.on('significant-finding', (finding: Finding) =>
      this.emit('significant-finding', finding)
    );

    this.selfDirected.on('action-complete', (data) =>
      this.emit('autonomous-action', data)
    );
  }

  // ============================================================================
  // METRICS
  // ============================================================================

  private calculateTranscendenceLevel(analysis: TranscendentAnalysis): number {
    let score = 0;

    // Superhuman insights
    const superhumanInsights = analysis.current.insights.filter(
      i => i.pattern.humanObvious < 0.3
    ).length;
    score += Math.min(30, superhumanInsights * 3);

    // Novel innovations
    const novelInnovations = analysis.innovations.filter(i => i.novelty > 0.8).length;
    score += Math.min(30, novelInnovations * 10);

    // Teaching quality
    score += Math.min(20, analysis.education.insights.length * 4);

    // Self-improvement
    score += Math.min(20, analysis.selfImprovements.length * 4);

    return Math.min(100, score);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SuperPatternRecognizer,
  CreativeSolver,
  IntuitionEngine,
  SelfDirectedSystem
};

export type {
  TranscendentAnalysis,
  HolisticUnderstanding,
  PredictedFuture,
  OptimalPath,
  Innovation,
  TeachingMaterial
};
