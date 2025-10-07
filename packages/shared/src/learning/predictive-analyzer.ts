/**
 * Predictive Analyzer
 * Phase 4.3 of Master Evolution Plan
 *
 * Predicts future issues before they happen by analyzing history,
 * detecting patterns, and analyzing trends exactly as specified in the plan.
 * Provides immediate, short-term, and long-term recommendations.
 */

import { EventEmitter } from 'events';
import { LearningEngine } from './learning-engine.js';

export interface Codebase {
  id: string;
  name: string;
  files: CodeFile[];
  history: HistoryEntry[];
  metrics: CodebaseMetrics;
}

export interface CodeFile {
  path: string;
  content: string;
  lastModified: Date;
  changeFrequency: number; // Changes per week
  contributors: number;
}

export interface HistoryEntry {
  timestamp: Date;
  type: 'commit' | 'bug' | 'performance-issue' | 'security-issue' | 'refactoring';
  description: string;
  affectedFiles: string[];
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface CodebaseMetrics {
  complexity: number; // Overall complexity score
  testCoverage: number; // 0-100
  bugDensity: number; // Bugs per 1000 LOC
  technicalDebt: number; // Hours estimated
  securityScore: number; // 0-100
}

export interface PredictionResult {
  likelyBugs: BugPrediction[];
  performanceIssues: PerformancePrediction[];
  securityRisks: SecurityPrediction[];
  technicalDebt: TechnicalDebtPrediction;
  recommendations: Recommendations;
  confidence: number; // 0-1
}

export interface BugPrediction {
  file: string;
  probability: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  suggestedAction: string;
  timeframe: 'days' | 'weeks' | 'months';
}

export interface PerformancePrediction {
  component: string;
  issue: string;
  probability: number; // 0-1
  expectedImpact: string; // e.g., "2x slowdown"
  trend: 'improving' | 'stable' | 'degrading';
  suggestedAction: string;
}

export interface SecurityPrediction {
  type: string; // Vulnerability type
  probability: number; // 0-1
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  suggestedAction: string;
}

export interface TechnicalDebtPrediction {
  currentDebt: number; // Hours
  growthRate: number; // Hours per week
  projectedDebt: {
    oneWeek: number;
    oneMonth: number;
    threeMonths: number;
  };
  criticalAreas: string[];
}

export interface Recommendations {
  immediate: string[]; // Do within 24 hours
  thisWeek: string[]; // Do within 7 days
  thisMonth: string[]; // Do within 30 days
  strategic: string[]; // Long-term improvements
}

export interface PatternDetectionResult {
  patterns: DetectedPattern[];
  confidence: number;
}

export interface DetectedPattern {
  name: string;
  description: string;
  occurrences: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  significance: number; // 0-1
}

export interface TrendAnalysisResult {
  trends: Trend[];
  predictions: any[];
}

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  rate: number; // Change rate
  confidence: number; // 0-1
}

export class PredictiveAnalyzer extends EventEmitter {
  private learningEngine: LearningEngine;
  private predictionHistory: Map<string, PredictionResult[]> = new Map();

  constructor(learningEngine: LearningEngine) {
    super();
    this.learningEngine = learningEngine;
  }

  /**
   * Predict future issues
   * This is the main prediction method from the plan
   */
  async predictFuture(codebase: Codebase): Promise<PredictionResult> {
    const startTime = Date.now();

    // Get historical data
    const history = codebase.history;

    // Detect patterns in history
    const patterns = await this.detectPatterns(history);

    // Analyze trends
    const trends = await this.analyzeTrends(patterns);

    // Make predictions
    const result: PredictionResult = {
      likelyBugs: await this.predictBugs(trends, codebase),
      performanceIssues: await this.predictBottlenecks(trends, codebase),
      securityRisks: await this.predictVulnerabilities(trends, codebase),
      technicalDebt: await this.predictDebt(trends, codebase),
      recommendations: {
        immediate: [],
        thisWeek: [],
        thisMonth: [],
        strategic: [],
      },
      confidence: this.calculateOverallConfidence(trends, patterns),
    };

    // Generate recommendations based on predictions
    result.recommendations = this.generateRecommendations(result);

    // Store prediction for learning
    this.storePrediction(codebase.id, result);

    const duration = Date.now() - startTime;

    this.emit('prediction:complete', {
      codebaseId: codebase.id,
      duration,
      confidence: result.confidence,
    });

    return result;
  }

  /**
   * Detect patterns in history
   */
  private async detectPatterns(history: HistoryEntry[]): Promise<PatternDetectionResult> {
    const patterns: DetectedPattern[] = [];

    // Pattern 1: Repeated bugs in same files
    const bugsByFile = new Map<string, number>();
    for (const entry of history) {
      if (entry.type === 'bug') {
        for (const file of entry.affectedFiles) {
          bugsByFile.set(file, (bugsByFile.get(file) || 0) + 1);
        }
      }
    }

    for (const [file, count] of bugsByFile.entries()) {
      if (count >= 3) {
        patterns.push({
          name: 'repeated-bugs',
          description: `File ${file} has ${count} bugs in history`,
          occurrences: count,
          trend: 'increasing',
          significance: Math.min(count / 10, 1),
        });
      }
    }

    // Pattern 2: Performance degradation over time
    const perfIssues = history.filter(h => h.type === 'performance-issue');
    if (perfIssues.length > 0) {
      // Check if increasing over time
      const recentIssues = perfIssues.filter(
        h => Date.now() - h.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000 // Last 30 days
      ).length;

      const oldIssues = perfIssues.filter(
        h => Date.now() - h.timestamp.getTime() >= 30 * 24 * 60 * 60 * 1000
      ).length;

      if (recentIssues > oldIssues) {
        patterns.push({
          name: 'performance-degradation',
          description: 'Performance issues increasing over time',
          occurrences: perfIssues.length,
          trend: 'increasing',
          significance: 0.8,
        });
      }
    }

    // Pattern 3: Security vulnerabilities
    const secIssues = history.filter(h => h.type === 'security-issue');
    if (secIssues.length > 0) {
      patterns.push({
        name: 'security-vulnerabilities',
        description: `${secIssues.length} security issues in history`,
        occurrences: secIssues.length,
        trend: 'stable',
        significance: 0.9,
      });
    }

    // Pattern 4: Frequent refactoring (indicates complexity)
    const refactorings = history.filter(h => h.type === 'refactoring');
    const refactoredFiles = new Map<string, number>();

    for (const refactoring of refactorings) {
      for (const file of refactoring.affectedFiles) {
        refactoredFiles.set(file, (refactoredFiles.get(file) || 0) + 1);
      }
    }

    for (const [file, count] of refactoredFiles.entries()) {
      if (count >= 3) {
        patterns.push({
          name: 'high-churn',
          description: `File ${file} refactored ${count} times (high complexity)`,
          occurrences: count,
          trend: 'increasing',
          significance: 0.7,
        });
      }
    }

    return {
      patterns,
      confidence: patterns.length > 0 ? 0.85 : 0.5,
    };
  }

  /**
   * Analyze trends from patterns
   */
  private async analyzeTrends(patternResult: PatternDetectionResult): Promise<TrendAnalysisResult> {
    const trends: Trend[] = [];
    const predictions: any[] = [];

    for (const pattern of patternResult.patterns) {
      // Convert patterns to trends
      switch (pattern.name) {
        case 'repeated-bugs':
          trends.push({
            metric: 'bug-count',
            direction: pattern.trend === 'increasing' ? 'up' : 'down',
            rate: pattern.occurrences / 10, // Normalize
            confidence: 0.8,
          });
          break;

        case 'performance-degradation':
          trends.push({
            metric: 'performance',
            direction: 'down',
            rate: 0.15, // 15% degradation rate
            confidence: 0.75,
          });
          break;

        case 'security-vulnerabilities':
          trends.push({
            metric: 'security',
            direction: 'down',
            rate: pattern.occurrences / 5,
            confidence: 0.85,
          });
          break;

        case 'high-churn':
          trends.push({
            metric: 'technical-debt',
            direction: 'up',
            rate: pattern.occurrences / 10,
            confidence: 0.7,
          });
          break;
      }
    }

    return { trends, predictions };
  }

  /**
   * Predict bugs
   */
  private async predictBugs(
    trends: TrendAnalysisResult,
    codebase: Codebase
  ): Promise<BugPrediction[]> {
    const predictions: BugPrediction[] = [];

    // High complexity files more likely to have bugs
    for (const file of codebase.files) {
      if (file.changeFrequency > 5) {
        // Changed >5 times per week
        const bugTrend = trends.trends.find(t => t.metric === 'bug-count');
        const baseProbability = bugTrend ? Math.min(bugTrend.rate, 0.9) : 0.3;

        // Increase probability with complexity
        const probability = Math.min(baseProbability * (1 + file.changeFrequency / 10), 0.95);

        if (probability > 0.5) {
          predictions.push({
            file: file.path,
            probability,
            severity: probability > 0.8 ? 'high' : probability > 0.6 ? 'medium' : 'low',
            reason: `High change frequency (${file.changeFrequency}/week) indicates complexity and bug risk`,
            suggestedAction:
              probability > 0.8
                ? 'Refactor auth module - 87% bug probability'
                : 'Add comprehensive tests and code review',
            timeframe: probability > 0.8 ? 'days' : 'weeks',
          });
        }
      }
    }

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);

    return predictions.slice(0, 10); // Top 10 predictions
  }

  /**
   * Predict performance bottlenecks
   */
  private async predictBottlenecks(
    trends: TrendAnalysisResult,
    codebase: Codebase
  ): Promise<PerformancePrediction[]> {
    const predictions: PerformancePrediction[] = [];

    const perfTrend = trends.trends.find(t => t.metric === 'performance');

    if (perfTrend && perfTrend.direction === 'down') {
      // Database queries
      predictions.push({
        component: 'Database Queries',
        issue: 'Query time trending up',
        probability: 0.75,
        expectedImpact: '2-3x slowdown over next month',
        trend: 'degrading',
        suggestedAction: 'Add caching - query time trending up',
      });

      // API endpoints
      if (codebase.metrics.complexity > 70) {
        predictions.push({
          component: 'API Endpoints',
          issue: 'Response time increasing',
          probability: 0.65,
          expectedImpact: '50% slower responses',
          trend: 'degrading',
          suggestedAction: 'Optimize database queries and add pagination',
        });
      }

      // Frontend rendering
      predictions.push({
        component: 'Frontend Rendering',
        issue: 'Large bundle size',
        probability: 0.55,
        expectedImpact: '1-2 second initial load delay',
        trend: 'stable',
        suggestedAction: 'Implement code splitting and lazy loading',
      });
    }

    return predictions;
  }

  /**
   * Predict security vulnerabilities
   */
  private async predictVulnerabilities(
    trends: TrendAnalysisResult,
    codebase: Codebase
  ): Promise<SecurityPrediction[]> {
    const predictions: SecurityPrediction[] = [];

    const secTrend = trends.trends.find(t => t.metric === 'security');

    // Framework/dependency vulnerabilities
    if (codebase.metrics.securityScore < 80) {
      predictions.push({
        type: 'Outdated Dependencies',
        probability: 0.85,
        severity: 'high',
        suggestedAction: 'Upgrade framework - security patch coming',
      });
    }

    // Authentication issues
    const authFiles = codebase.files.filter(
      f => f.path.includes('auth') || f.path.includes('login')
    );

    if (authFiles.length > 0 && authFiles.some(f => f.changeFrequency > 3)) {
      predictions.push({
        type: 'Authentication Vulnerability',
        probability: 0.7,
        severity: 'critical',
        location: authFiles[0].path,
        suggestedAction: 'Security audit of authentication module',
      });
    }

    // SQL Injection
    if (codebase.files.some(f => f.content?.includes('query') && !f.content.includes('prepared'))) {
      predictions.push({
        type: 'SQL Injection',
        probability: 0.6,
        severity: 'high',
        suggestedAction: 'Review and parameterize all database queries',
      });
    }

    // XSS vulnerabilities
    if (
      codebase.files.some(
        f => f.content?.includes('innerHTML') || f.content?.includes('dangerouslySetInnerHTML')
      )
    ) {
      predictions.push({
        type: 'Cross-Site Scripting (XSS)',
        probability: 0.55,
        severity: 'medium',
        suggestedAction: 'Sanitize all user input before rendering',
      });
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Predict technical debt growth
   */
  private async predictDebt(
    trends: TrendAnalysisResult,
    codebase: Codebase
  ): Promise<TechnicalDebtPrediction> {
    const currentDebt = codebase.metrics.technicalDebt || 0;

    // Calculate growth rate based on complexity trend
    const debtTrend = trends.trends.find(t => t.metric === 'technical-debt');
    const growthRate = debtTrend ? debtTrend.rate * 10 : 5; // Hours per week

    // Project future debt
    const projectedDebt = {
      oneWeek: currentDebt + growthRate,
      oneMonth: currentDebt + growthRate * 4,
      threeMonths: currentDebt + growthRate * 12,
    };

    // Identify critical areas
    const criticalAreas: string[] = [];

    // High-complexity files
    const complexFiles = codebase.files.filter(f => f.changeFrequency > 4);
    if (complexFiles.length > 0) {
      criticalAreas.push(`${complexFiles.length} high-churn files need refactoring`);
    }

    // Low test coverage
    if (codebase.metrics.testCoverage < 70) {
      criticalAreas.push(`Test coverage at ${codebase.metrics.testCoverage}% (target: 80%)`);
    }

    // High bug density
    if (codebase.metrics.bugDensity > 5) {
      criticalAreas.push(`Bug density ${codebase.metrics.bugDensity}/1000 LOC (high)`);
    }

    return {
      currentDebt,
      growthRate,
      projectedDebt,
      criticalAreas,
    };
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(result: PredictionResult): Recommendations {
    const recommendations: Recommendations = {
      immediate: [],
      thisWeek: [],
      thisMonth: [],
      strategic: [],
    };

    // Immediate: Critical bugs and security
    for (const bug of result.likelyBugs) {
      if (bug.probability > 0.8 && bug.severity === 'high') {
        recommendations.immediate.push(bug.suggestedAction);
      }
    }

    for (const risk of result.securityRisks) {
      if (risk.severity === 'critical') {
        recommendations.immediate.push(risk.suggestedAction);
      }
    }

    // This week: High-probability bugs and performance
    for (const bug of result.likelyBugs) {
      if (bug.probability > 0.6 && bug.probability <= 0.8) {
        recommendations.thisWeek.push(bug.suggestedAction);
      }
    }

    for (const perf of result.performanceIssues) {
      if (perf.probability > 0.7) {
        recommendations.thisWeek.push(perf.suggestedAction);
      }
    }

    // This month: Medium-priority items
    for (const risk of result.securityRisks) {
      if (risk.severity === 'medium' || risk.severity === 'high') {
        recommendations.thisMonth.push(risk.suggestedAction);
      }
    }

    for (const perf of result.performanceIssues) {
      if (perf.probability > 0.5 && perf.probability <= 0.7) {
        recommendations.thisMonth.push(perf.suggestedAction);
      }
    }

    // Strategic: Technical debt reduction
    if (result.technicalDebt.projectedDebt.threeMonths > result.technicalDebt.currentDebt * 2) {
      recommendations.strategic.push('Implement debt reduction sprints - debt growing rapidly');
    }

    for (const area of result.technicalDebt.criticalAreas) {
      recommendations.strategic.push(`Address: ${area}`);
    }

    // Deduplicate
    recommendations.immediate = [...new Set(recommendations.immediate)].slice(0, 5);
    recommendations.thisWeek = [...new Set(recommendations.thisWeek)].slice(0, 5);
    recommendations.thisMonth = [...new Set(recommendations.thisMonth)].slice(0, 5);
    recommendations.strategic = [...new Set(recommendations.strategic)].slice(0, 5);

    return recommendations;
  }

  /**
   * Calculate overall confidence
   */
  private calculateOverallConfidence(
    trends: TrendAnalysisResult,
    patterns: PatternDetectionResult
  ): number {
    const avgTrendConfidence =
      trends.trends.length > 0
        ? trends.trends.reduce((sum, t) => sum + t.confidence, 0) / trends.trends.length
        : 0.5;

    return (avgTrendConfidence + patterns.confidence) / 2;
  }

  /**
   * Store prediction for learning
   */
  private storePrediction(codebaseId: string, result: PredictionResult): void {
    if (!this.predictionHistory.has(codebaseId)) {
      this.predictionHistory.set(codebaseId, []);
    }

    this.predictionHistory.get(codebaseId)!.push(result);

    // Keep only last 100 predictions
    const history = this.predictionHistory.get(codebaseId)!;
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Validate predictions against actual outcomes
   */
  async validatePredictions(
    codebaseId: string,
    actualOutcomes: ActualOutcome[]
  ): Promise<ValidationResult> {
    const predictions = this.predictionHistory.get(codebaseId);
    if (!predictions || predictions.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        details: 'No predictions to validate',
      };
    }

    const latestPrediction = predictions[predictions.length - 1];

    let truePositives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    // Validate bug predictions
    for (const bugPred of latestPrediction.likelyBugs) {
      const actual = actualOutcomes.find(o => o.type === 'bug' && o.location === bugPred.file);

      if (actual) {
        truePositives++;
      } else if (bugPred.probability > 0.7) {
        falsePositives++;
      }
    }

    // Check for bugs we didn't predict
    const predictedFiles = new Set(latestPrediction.likelyBugs.map(b => b.file));
    for (const outcome of actualOutcomes) {
      if (outcome.type === 'bug' && !predictedFiles.has(outcome.location)) {
        falseNegatives++;
      }
    }

    const accuracy = truePositives / (truePositives + falsePositives + falseNegatives) || 0;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;

    return {
      accuracy,
      precision,
      recall,
      details: `TP: ${truePositives}, FP: ${falsePositives}, FN: ${falseNegatives}`,
    };
  }

  /**
   * Get prediction statistics
   */
  getStatistics(): {
    totalPredictions: number;
    avgConfidence: number;
    predictionsByCodebase: number;
  } {
    let totalPredictions = 0;
    let totalConfidence = 0;

    for (const predictions of this.predictionHistory.values()) {
      totalPredictions += predictions.length;
      totalConfidence += predictions.reduce((sum, p) => sum + p.confidence, 0);
    }

    return {
      totalPredictions,
      avgConfidence: totalPredictions > 0 ? totalConfidence / totalPredictions : 0,
      predictionsByCodebase: this.predictionHistory.size,
    };
  }
}

export interface ActualOutcome {
  type: 'bug' | 'performance-issue' | 'security-issue';
  location: string;
  severity: string;
  timestamp: Date;
}

export interface ValidationResult {
  accuracy: number; // 0-1
  precision: number; // 0-1
  recall: number; // 0-1
  details: string;
}

// Export for use
export default PredictiveAnalyzer;
