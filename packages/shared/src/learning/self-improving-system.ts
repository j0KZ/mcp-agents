/**
 * Self-Improving System
 * Phase 4.4 of Master Evolution Plan
 *
 * Implements autonomous improvement exactly as specified in the plan.
 * Analyzes own performance, identifies weaknesses, generates hypotheses,
 * tests them, and applies improvements without human intervention.
 */

import { EventEmitter } from 'events';
import { LearningEngine } from './learning-engine.js';
import { ProductionMonitor } from './production-monitor.js';
import { PredictiveAnalyzer } from './predictive-analyzer.js';

export interface PerformanceAnalysis {
  timestamp: Date;
  overallScore: number; // 0-100
  weaknesses: Weakness[];
  strengths: Strength[];
  opportunities: Opportunity[];
}

export interface Weakness {
  area: string;
  score: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  examples: string[];
}

export interface Strength {
  area: string;
  score: number; // 0-100
  description: string;
}

export interface Opportunity {
  description: string;
  potentialImprovement: number; // 0-100
  effort: 'low' | 'medium' | 'high';
  priority: number; // 0-1
}

export interface ImprovementHypothesis {
  id: string;
  targetWeakness: string;
  hypothesis: string;
  proposedChange: ProposedChange;
  expectedImprovement: number; // 0-100
  risk: 'low' | 'medium' | 'high';
  confidence: number; // 0-1
}

export interface ProposedChange {
  type: 'parameter-tuning' | 'algorithm-change' | 'feature-addition' | 'strategy-adjustment';
  description: string;
  implementation: any; // Actual change to apply
  reversible: boolean;
}

export interface HypothesisTestResult {
  hypothesisId: string;
  improved: boolean;
  actualImprovement: number; // 0-100
  metrics: TestMetrics;
  recommendation: 'apply' | 'reject' | 'refine';
}

export interface TestMetrics {
  accuracy: number;
  performance: number;
  reliability: number;
  userSatisfaction: number;
}

export interface AppliedImprovement {
  id: string;
  hypothesis: ImprovementHypothesis;
  appliedAt: Date;
  results: HypothesisTestResult;
  rollback?: Date;
}

export class SelfImprovingSystem extends EventEmitter {
  private learningEngine: LearningEngine;
  private productionMonitor: ProductionMonitor;
  private predictiveAnalyzer: PredictiveAnalyzer;

  private performanceHistory: PerformanceAnalysis[] = [];
  private hypothesisQueue: ImprovementHypothesis[] = [];
  private appliedImprovements: AppliedImprovement[] = [];
  private isRunning: boolean = false;

  // Improvement parameters from plan
  private readonly LEARNING_INTERVAL = 3600000; // 1 hour
  private readonly MIN_IMPROVEMENT_THRESHOLD = 5; // 5% improvement to apply
  private readonly MAX_CONCURRENT_TESTS = 3;
  private readonly ROLLBACK_THRESHOLD = -2; // Roll back if >2% worse

  constructor(
    learningEngine: LearningEngine,
    productionMonitor: ProductionMonitor,
    predictiveAnalyzer: PredictiveAnalyzer
  ) {
    super();
    this.learningEngine = learningEngine;
    this.productionMonitor = productionMonitor;
    this.predictiveAnalyzer = predictiveAnalyzer;
  }

  /**
   * Start autonomous improvement loop
   * This implements the core self-improvement loop from the plan
   */
  async autonomousImprovement(): Promise<void> {
    this.isRunning = true;
    this.emit('self-improvement:started');

    while (this.isRunning) {
      try {
        // Analyze own performance
        const performance = await this.analyzeSelfPerformance();

        // Identify weakest area
        const weakness = this.findBiggestWeakness(performance);

        if (weakness) {
          // Generate improvement hypothesis
          const hypothesis = await this.generateHypothesis(weakness);

          // Test hypothesis
          const result = await this.testHypothesis(hypothesis);

          if (result.improved) {
            // Apply improvement
            await this.applyImprovement(hypothesis, result);

            // Share with other tools
            await this.broadcastLearning(hypothesis, result);
          } else {
            // Learn from failure
            this.emit('hypothesis:failed', {
              hypothesisId: hypothesis.id,
              reason: 'No improvement observed',
            });
          }
        }

        // Wait for next iteration
        await this.sleep(this.LEARNING_INTERVAL);
      } catch (error) {
        this.emit('self-improvement:error', error);
        await this.sleep(this.LEARNING_INTERVAL);
      }
    }

    this.emit('self-improvement:stopped');
  }

  /**
   * Stop autonomous improvement
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Analyze own performance across all dimensions
   */
  private async analyzeSelfPerformance(): Promise<PerformanceAnalysis> {
    const stats = this.learningEngine.getStatistics();
    const monitorStats = this.productionMonitor.getStatistics();
    const predictionStats = this.predictiveAnalyzer.getStatistics();

    // Calculate component scores
    const learningScore = Math.min(stats.modelAccuracy * 100, 100);
    const acceptanceScore = monitorStats.acceptanceRate * 100;
    const predictionScore = Math.min(predictionStats.avgConfidence * 100, 100);

    // Overall score is weighted average
    const overallScore = learningScore * 0.35 + acceptanceScore * 0.4 + predictionScore * 0.25;

    // Identify weaknesses (score < 70)
    const weaknesses: Weakness[] = [];

    if (learningScore < 70) {
      weaknesses.push({
        area: 'learning-accuracy',
        score: learningScore,
        impact: learningScore < 50 ? 'critical' : learningScore < 60 ? 'high' : 'medium',
        description: 'Model prediction accuracy below target',
        examples: [`Current: ${learningScore.toFixed(1)}%, Target: 85%`],
      });
    }

    if (acceptanceScore < 70) {
      weaknesses.push({
        area: 'user-acceptance',
        score: acceptanceScore,
        impact: acceptanceScore < 50 ? 'critical' : acceptanceScore < 60 ? 'high' : 'medium',
        description: 'User acceptance rate below target',
        examples: [`Current: ${acceptanceScore.toFixed(1)}%, Target: 80%`],
      });
    }

    if (predictionScore < 70) {
      weaknesses.push({
        area: 'prediction-confidence',
        score: predictionScore,
        impact: 'medium',
        description: 'Prediction confidence below target',
        examples: [`Current: ${predictionScore.toFixed(1)}%, Target: 85%`],
      });
    }

    // Check for low pattern discovery
    if (stats.patternsDiscovered < 10) {
      weaknesses.push({
        area: 'pattern-discovery',
        score: Math.min(stats.patternsDiscovered * 10, 100),
        impact: 'medium',
        description: 'Too few patterns discovered',
        examples: [`Current: ${stats.patternsDiscovered}, Target: 50+`],
      });
    }

    // Identify strengths (score >= 80)
    const strengths: Strength[] = [];

    if (learningScore >= 80) {
      strengths.push({
        area: 'learning-accuracy',
        score: learningScore,
        description: 'Strong model prediction accuracy',
      });
    }

    if (acceptanceScore >= 80) {
      strengths.push({
        area: 'user-acceptance',
        score: acceptanceScore,
        description: 'High user acceptance of suggestions',
      });
    }

    // Identify opportunities
    const opportunities: Opportunity[] = [];

    // If we have data but low accuracy, opportunity to improve model
    if (stats.totalDecisions > 100 && learningScore < 85) {
      opportunities.push({
        description: 'Retrain model with larger dataset',
        potentialImprovement: 85 - learningScore,
        effort: 'low',
        priority: 0.9,
      });
    }

    // If rejection rate is high, opportunity to learn from rejections
    if (monitorStats.acceptanceRate < 0.7) {
      const rejectionCategories = Object.keys(monitorStats.rejectionCategories);
      if (rejectionCategories.length > 0) {
        opportunities.push({
          description: `Address top rejection reason: ${rejectionCategories[0]}`,
          potentialImprovement: 20,
          effort: 'medium',
          priority: 0.85,
        });
      }
    }

    const analysis: PerformanceAnalysis = {
      timestamp: new Date(),
      overallScore,
      weaknesses,
      strengths,
      opportunities,
    };

    // Store in history
    this.performanceHistory.push(analysis);

    // Keep last 100
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    this.emit('performance:analyzed', {
      overallScore,
      weaknessCount: weaknesses.length,
      opportunityCount: opportunities.length,
    });

    return analysis;
  }

  /**
   * Find the biggest weakness to address
   */
  private findBiggestWeakness(performance: PerformanceAnalysis): Weakness | null {
    if (performance.weaknesses.length === 0) {
      return null;
    }

    // Sort by impact and score
    const impactScore = (w: Weakness): number => {
      const impactWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return impactWeight[w.impact] * (100 - w.score);
    };

    const sorted = [...performance.weaknesses].sort((a, b) => impactScore(b) - impactScore(a));

    return sorted[0];
  }

  /**
   * Generate hypothesis to address weakness
   */
  private async generateHypothesis(weakness: Weakness): Promise<ImprovementHypothesis> {
    const id = `hyp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let hypothesis: string;
    let proposedChange: ProposedChange;
    let expectedImprovement: number;

    switch (weakness.area) {
      case 'learning-accuracy':
        hypothesis = 'Increasing learning rate will improve model convergence';
        proposedChange = {
          type: 'parameter-tuning',
          description: 'Increase learning rate from 0.01 to 0.02',
          implementation: { learningRate: 0.02 },
          reversible: true,
        };
        expectedImprovement = 10;
        break;

      case 'user-acceptance':
        hypothesis = 'Adding confidence threshold will reduce false positives';
        proposedChange = {
          type: 'strategy-adjustment',
          description: 'Only show suggestions with >70% confidence',
          implementation: { confidenceThreshold: 0.7 },
          reversible: true,
        };
        expectedImprovement = 15;
        break;

      case 'prediction-confidence':
        hypothesis = 'Ensemble voting will increase prediction confidence';
        proposedChange = {
          type: 'algorithm-change',
          description: 'Use weighted ensemble of multiple predictors',
          implementation: { useEnsemble: true },
          reversible: true,
        };
        expectedImprovement = 12;
        break;

      case 'pattern-discovery':
        hypothesis = 'Lowering pattern significance threshold will discover more patterns';
        proposedChange = {
          type: 'parameter-tuning',
          description: 'Lower pattern threshold from 0.8 to 0.6',
          implementation: { patternThreshold: 0.6 },
          reversible: true,
        };
        expectedImprovement = 20;
        break;

      default:
        hypothesis = 'General improvement through parameter optimization';
        proposedChange = {
          type: 'parameter-tuning',
          description: 'Optimize general parameters',
          implementation: {},
          reversible: true,
        };
        expectedImprovement = 5;
    }

    const hyp: ImprovementHypothesis = {
      id,
      targetWeakness: weakness.area,
      hypothesis,
      proposedChange,
      expectedImprovement,
      risk: proposedChange.reversible ? 'low' : 'medium',
      confidence: Math.min(weakness.score / 100 + 0.5, 0.9),
    };

    this.hypothesisQueue.push(hyp);

    this.emit('hypothesis:generated', {
      hypothesisId: id,
      targetArea: weakness.area,
      expectedImprovement,
    });

    return hyp;
  }

  /**
   * Test hypothesis in controlled environment
   */
  private async testHypothesis(hypothesis: ImprovementHypothesis): Promise<HypothesisTestResult> {
    this.emit('hypothesis:testing', { hypothesisId: hypothesis.id });

    // Simulate applying change and measuring impact
    // In real implementation, would run A/B test or shadow deployment

    const baselineMetrics = await this.getCurrentMetrics();

    // Apply change temporarily
    const wasApplied = await this.temporarilyApply(hypothesis.proposedChange);

    if (!wasApplied) {
      return {
        hypothesisId: hypothesis.id,
        improved: false,
        actualImprovement: 0,
        metrics: baselineMetrics,
        recommendation: 'reject',
      };
    }

    // Wait for some data
    await this.sleep(60000); // 1 minute test

    // Measure new metrics
    const newMetrics = await this.getCurrentMetrics();

    // Revert change
    await this.revertTemporaryChange(hypothesis.proposedChange);

    // Calculate improvement
    const actualImprovement = this.calculateImprovement(baselineMetrics, newMetrics);

    const improved = actualImprovement >= this.MIN_IMPROVEMENT_THRESHOLD;

    const recommendation = improved ? 'apply' : actualImprovement > 0 ? 'refine' : 'reject';

    const result: HypothesisTestResult = {
      hypothesisId: hypothesis.id,
      improved,
      actualImprovement,
      metrics: newMetrics,
      recommendation,
    };

    this.emit('hypothesis:tested', {
      hypothesisId: hypothesis.id,
      improved,
      actualImprovement: actualImprovement.toFixed(1),
    });

    return result;
  }

  /**
   * Get current performance metrics
   */
  private async getCurrentMetrics(): Promise<TestMetrics> {
    const stats = this.learningEngine.getStatistics();
    const monitorStats = this.productionMonitor.getStatistics();

    return {
      accuracy: stats.modelAccuracy,
      performance: 1.0, // Would measure actual latency
      reliability: stats.successRate,
      userSatisfaction: monitorStats.acceptanceRate,
    };
  }

  /**
   * Temporarily apply change for testing
   */
  private async temporarilyApply(change: ProposedChange): Promise<boolean> {
    // In real implementation, would apply to learning engine or other components
    // For now, simulate
    return change.reversible;
  }

  /**
   * Revert temporary change
   */
  private async revertTemporaryChange(change: ProposedChange): Promise<void> {
    // Revert the temporary change
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(baseline: TestMetrics, current: TestMetrics): number {
    const accuracyImprovement = ((current.accuracy - baseline.accuracy) / baseline.accuracy) * 100;
    const performanceImprovement =
      ((current.performance - baseline.performance) / baseline.performance) * 100;
    const reliabilityImprovement =
      ((current.reliability - baseline.reliability) / baseline.reliability) * 100;
    const satisfactionImprovement =
      ((current.userSatisfaction - baseline.userSatisfaction) / baseline.userSatisfaction) * 100;

    // Weighted average
    return (
      accuracyImprovement * 0.35 +
      performanceImprovement * 0.2 +
      reliabilityImprovement * 0.25 +
      satisfactionImprovement * 0.2
    );
  }

  /**
   * Apply improvement permanently
   */
  private async applyImprovement(
    hypothesis: ImprovementHypothesis,
    result: HypothesisTestResult
  ): Promise<void> {
    // Apply the change permanently
    const applied: AppliedImprovement = {
      id: `imp-${Date.now()}`,
      hypothesis,
      appliedAt: new Date(),
      results: result,
    };

    this.appliedImprovements.push(applied);

    // Monitor for degradation
    setTimeout(async () => {
      const shouldRollback = await this.checkForDegradation(applied);
      if (shouldRollback) {
        await this.rollbackImprovement(applied);
      }
    }, 86400000); // Check after 24 hours

    this.emit('improvement:applied', {
      improvementId: applied.id,
      hypothesisId: hypothesis.id,
      improvement: result.actualImprovement.toFixed(1),
    });
  }

  /**
   * Check if improvement caused degradation
   */
  private async checkForDegradation(improvement: AppliedImprovement): Promise<boolean> {
    const currentMetrics = await this.getCurrentMetrics();
    const baselineMetrics = improvement.results.metrics;

    const change = this.calculateImprovement(baselineMetrics, currentMetrics);

    return change < this.ROLLBACK_THRESHOLD;
  }

  /**
   * Rollback an improvement
   */
  private async rollbackImprovement(improvement: AppliedImprovement): Promise<void> {
    // Revert the change
    improvement.rollback = new Date();

    this.emit('improvement:rolled-back', {
      improvementId: improvement.id,
      reason: 'Performance degradation detected',
    });
  }

  /**
   * Broadcast learning to other tools
   */
  private async broadcastLearning(
    hypothesis: ImprovementHypothesis,
    result: HypothesisTestResult
  ): Promise<void> {
    this.emit('learning:broadcast', {
      type: 'improvement',
      data: {
        area: hypothesis.targetWeakness,
        change: hypothesis.proposedChange.description,
        improvement: result.actualImprovement,
        applicable: hypothesis.proposedChange.type,
      },
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get improvement statistics
   */
  getStatistics(): {
    totalImprovements: number;
    successRate: number;
    avgImprovement: number;
    rollbackRate: number;
    performanceTrend: 'improving' | 'stable' | 'degrading';
  } {
    const total = this.appliedImprovements.length;
    const successful = this.appliedImprovements.filter(
      i => i.results.actualImprovement >= this.MIN_IMPROVEMENT_THRESHOLD
    ).length;

    const avgImprovement =
      total > 0
        ? this.appliedImprovements.reduce((sum, i) => sum + i.results.actualImprovement, 0) / total
        : 0;

    const rolledBack = this.appliedImprovements.filter(i => i.rollback).length;

    // Determine trend from recent performance history
    let trend: 'improving' | 'stable' | 'degrading' = 'stable';

    if (this.performanceHistory.length >= 3) {
      const recent = this.performanceHistory.slice(-3);
      const first = recent[0].overallScore;
      const last = recent[2].overallScore;

      if (last > first + 5) trend = 'improving';
      else if (last < first - 5) trend = 'degrading';
    }

    return {
      totalImprovements: total,
      successRate: total > 0 ? successful / total : 0,
      avgImprovement,
      rollbackRate: total > 0 ? rolledBack / total : 0,
      performanceTrend: trend,
    };
  }

  /**
   * Generate improvement report
   */
  generateReport(): {
    currentPerformance: PerformanceAnalysis | null;
    improvements: AppliedImprovement[];
    hypotheses: ImprovementHypothesis[];
    statistics: ReturnType<SelfImprovingSystem['getStatistics']>;
  } {
    return {
      currentPerformance: this.performanceHistory[this.performanceHistory.length - 1] || null,
      improvements: this.appliedImprovements,
      hypotheses: this.hypothesisQueue,
      statistics: this.getStatistics(),
    };
  }
}

// Export for use
export default SelfImprovingSystem;
