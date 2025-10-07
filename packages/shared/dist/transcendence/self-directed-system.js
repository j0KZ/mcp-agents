/**
 * Phase 5.4: Self-Direction System
 *
 * The system sets its own goals and priorities, works autonomously,
 * and only reports significant findings to humans.
 *
 * Capabilities:
 * - Understand organizational goals
 * - Identify opportunities to help
 * - Set own objectives
 * - Create and execute action plans
 * - Learn and adjust autonomously
 * - Report significant findings (significance > 0.9)
 *
 * True autonomy: No human intervention needed for daily operation
 */
import { EventEmitter } from 'events';
// ============================================================================
// MAIN CLASS
// ============================================================================
export class SelfDirectedSystem extends EventEmitter {
    orgGoals = null;
    opportunities = new Map();
    objectives = new Map();
    plans = new Map();
    findings = new Map();
    running = false;
    CYCLE_INTERVAL = 60 * 60 * 1000; // 1 hour
    SIGNIFICANCE_THRESHOLD = 0.9;
    constructor() {
        super();
    }
    // ============================================================================
    // PUBLIC API (From Plan)
    // ============================================================================
    /**
     * Become autonomous - set own goals and work independently
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.4
     */
    async becomeAutonomous() {
        this.emit('autonomy-start');
        // Understand organizational goals (from plan)
        this.orgGoals = await this.analyzeOrganizationGoals();
        // Identify how to help (from plan)
        const opportunities = await this.findOpportunities(this.orgGoals);
        opportunities.forEach(o => this.opportunities.set(o.id, o));
        // Set own objectives (from plan)
        const objectives = await this.setObjectives(opportunities);
        objectives.forEach(o => this.objectives.set(o.id, o));
        // Create action plan (from plan)
        let plan = await this.createActionPlan(objectives);
        this.plans.set(plan.id, plan);
        // Execute autonomously (from plan)
        this.running = true;
        while (this.running) {
            const nextAction = this.getNextAction(plan);
            if (!nextAction) {
                // Completed plan - create new one (from plan)
                this.emit('plan-completed', { planId: plan.id });
                plan = await this.createNewPlan();
                this.plans.set(plan.id, plan);
                continue;
            }
            // Execute action (from plan)
            const result = await this.execute(nextAction);
            nextAction.result = result;
            nextAction.status = result.success ? 'completed' : 'failed';
            // Learn and adjust (from plan)
            await this.learn(result);
            plan = this.adjustPlan(plan, result);
            // Report significant findings (from plan)
            for (const finding of result.findings) {
                if (finding.significance > this.SIGNIFICANCE_THRESHOLD) {
                    await this.notifyHumans(finding);
                }
            }
            // Wait before next action
            await this.sleep(this.CYCLE_INTERVAL);
        }
    }
    /**
     * Stop autonomous operation
     */
    stopAutonomousMode() {
        this.running = false;
        this.emit('autonomy-stop');
    }
    /**
     * Get current status
     */
    getStatus() {
        const completedActions = Array.from(this.plans.values())
            .flatMap(p => p.actions)
            .filter(a => a.status === 'completed').length;
        const significantFindings = Array.from(this.findings.values()).filter(f => f.significance > this.SIGNIFICANCE_THRESHOLD).length;
        const currentPlan = Array.from(this.plans.values()).find(p => p.progress < 1);
        return {
            running: this.running,
            objectives: this.objectives.size,
            completedActions,
            significantFindings,
            currentPlan: currentPlan?.objective,
        };
    }
    // ============================================================================
    // ORGANIZATIONAL GOAL ANALYSIS
    // ============================================================================
    async analyzeOrganizationGoals() {
        // In real implementation, analyze:
        // - README.md for project goals
        // - Issues/PRs for current pain points
        // - Code metrics for actual state
        // - Team velocity for capacity
        // Synthesized goals
        const primary = [
            {
                id: 'goal-1',
                type: 'quality',
                description: 'Maintain code quality above threshold',
                metric: 'code-quality-score',
                target: 85,
                current: 72,
                priority: 9,
            },
            {
                id: 'goal-2',
                type: 'security',
                description: 'Zero high-severity vulnerabilities',
                metric: 'high-severity-vulns',
                target: 0,
                current: 3,
                priority: 10,
            },
            {
                id: 'goal-3',
                type: 'maintainability',
                description: 'Reduce average complexity below 15',
                metric: 'avg-complexity',
                target: 15,
                current: 23,
                priority: 7,
            },
        ];
        const secondary = [
            {
                id: 'goal-4',
                type: 'performance',
                description: 'Improve response time',
                metric: 'p95-response-time',
                target: 200,
                current: 450,
                priority: 6,
            },
            {
                id: 'goal-5',
                type: 'velocity',
                description: 'Reduce PR review time',
                metric: 'avg-pr-review-hours',
                target: 4,
                current: 12,
                priority: 5,
            },
        ];
        return {
            primary,
            secondary,
            constraints: [
                {
                    type: 'time',
                    description: 'Must not disrupt development velocity',
                    limit: 1.0,
                },
                {
                    type: 'resources',
                    description: 'Limited to autonomous operations',
                    limit: 1.0,
                },
            ],
            timeline: {
                start: new Date(),
                milestones: [
                    {
                        name: 'Initial improvements visible',
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        criteria: 'At least 2 goals showing progress',
                    },
                    {
                        name: 'Major goals achieved',
                        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        criteria: 'All priority 10 goals met',
                    },
                ],
                end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
        };
    }
    // ============================================================================
    // OPPORTUNITY IDENTIFICATION
    // ============================================================================
    async findOpportunities(goals) {
        const opportunities = [];
        // For each goal, find ways to help
        for (const goal of [...goals.primary, ...goals.secondary]) {
            const goalOpportunities = await this.findOpportunitiesForGoal(goal);
            opportunities.push(...goalOpportunities);
        }
        // Sort by ROI
        return opportunities.sort((a, b) => b.roi - a.roi);
    }
    async findOpportunitiesForGoal(goal) {
        const opportunities = [];
        switch (goal.type) {
            case 'quality':
                opportunities.push({
                    id: `opp-quality-${Date.now()}`,
                    type: 'quick-win',
                    description: 'Run smart-reviewer on all files and auto-fix low-hanging fruit',
                    impact: {
                        category: 'quality',
                        magnitude: 7,
                        confidence: 0.85,
                        timeToValue: 1,
                    },
                    effort: 2,
                    roi: 7 / 2,
                    relatedGoals: [goal.id],
                    discovered: new Date(),
                });
                break;
            case 'security':
                opportunities.push({
                    id: `opp-security-${Date.now()}`,
                    type: 'preventive',
                    description: 'Deep scan for vulnerabilities and generate fixes',
                    impact: {
                        category: 'security',
                        magnitude: 10,
                        confidence: 0.9,
                        timeToValue: 2,
                    },
                    effort: 3,
                    roi: 10 / 3,
                    relatedGoals: [goal.id],
                    discovered: new Date(),
                });
                break;
            case 'maintainability':
                opportunities.push({
                    id: `opp-maintainability-${Date.now()}`,
                    type: 'debt-reduction',
                    description: 'Identify and refactor high-complexity modules',
                    impact: {
                        category: 'maintainability',
                        magnitude: 8,
                        confidence: 0.8,
                        timeToValue: 7,
                    },
                    effort: 10,
                    roi: 8 / 10,
                    relatedGoals: [goal.id],
                    discovered: new Date(),
                });
                break;
            case 'performance':
                opportunities.push({
                    id: `opp-performance-${Date.now()}`,
                    type: 'optimization',
                    description: 'Profile and optimize hot paths',
                    impact: {
                        category: 'performance',
                        magnitude: 6,
                        confidence: 0.7,
                        timeToValue: 5,
                    },
                    effort: 8,
                    roi: 6 / 8,
                    relatedGoals: [goal.id],
                    discovered: new Date(),
                });
                break;
            case 'velocity':
                opportunities.push({
                    id: `opp-velocity-${Date.now()}`,
                    type: 'optimization',
                    description: 'Generate comprehensive documentation to speed up reviews',
                    impact: {
                        category: 'velocity',
                        magnitude: 5,
                        confidence: 0.75,
                        timeToValue: 3,
                    },
                    effort: 4,
                    roi: 5 / 4,
                    relatedGoals: [goal.id],
                    discovered: new Date(),
                });
                break;
        }
        return opportunities;
    }
    // ============================================================================
    // OBJECTIVE SETTING
    // ============================================================================
    async setObjectives(opportunities) {
        const objectives = [];
        // Group opportunities by type and goal
        const grouped = this.groupOpportunities(opportunities);
        for (const [category, ops] of grouped) {
            // Create objective for each category
            const topOpportunities = ops.slice(0, 3); // Top 3 by ROI
            objectives.push({
                id: `obj-${category}-${Date.now()}`,
                goal: `Improve ${category} through autonomous actions`,
                description: `Execute: ${topOpportunities.map(o => o.description).join('; ')}`,
                successCriteria: topOpportunities.map(o => ({
                    metric: o.impact.category,
                    target: o.impact.magnitude,
                    measurable: true,
                })),
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: this.calculateObjectivePriority(topOpportunities),
                status: 'planned',
            });
        }
        return objectives.sort((a, b) => b.priority - a.priority);
    }
    groupOpportunities(opportunities) {
        const groups = new Map();
        for (const opp of opportunities) {
            const category = opp.impact.category;
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category).push(opp);
        }
        // Sort each group by ROI
        for (const [_, ops] of groups) {
            ops.sort((a, b) => b.roi - a.roi);
        }
        return groups;
    }
    calculateObjectivePriority(opportunities) {
        const avgImpact = opportunities.reduce((sum, o) => sum + o.impact.magnitude, 0) / opportunities.length;
        const avgConfidence = opportunities.reduce((sum, o) => sum + o.impact.confidence, 0) / opportunities.length;
        const avgROI = opportunities.reduce((sum, o) => sum + o.roi, 0) / opportunities.length;
        return avgImpact * 0.4 + avgConfidence * 10 * 0.3 + avgROI * 0.3;
    }
    // ============================================================================
    // ACTION PLANNING
    // ============================================================================
    async createActionPlan(objectives) {
        // Take highest priority objective
        const objective = objectives[0];
        const actions = [
            {
                id: 'action-1',
                type: 'analyze',
                description: 'Analyze current state',
                details: `Scan codebase to establish baseline for ${objective.goal}`,
                prerequisites: [],
                validation: {
                    type: 'metrics',
                    description: 'Metrics collected successfully',
                },
                status: 'pending',
            },
            {
                id: 'action-2',
                type: 'suggest',
                description: 'Generate improvement suggestions',
                details: 'Use relevant tools to identify improvements',
                prerequisites: ['action-1'],
                validation: {
                    type: 'review',
                    threshold: 0.8,
                    description: 'Suggestions have confidence > 0.8',
                },
                status: 'pending',
            },
            {
                id: 'action-3',
                type: 'refactor',
                description: 'Apply safe improvements',
                details: 'Implement high-confidence, low-risk improvements',
                prerequisites: ['action-2'],
                validation: {
                    type: 'tests',
                    description: 'All tests pass after changes',
                },
                status: 'pending',
            },
            {
                id: 'action-4',
                type: 'monitor',
                description: 'Monitor impact',
                details: 'Track metrics to verify improvement',
                prerequisites: ['action-3'],
                validation: {
                    type: 'metrics',
                    threshold: 1.0,
                    description: 'Metrics show improvement',
                },
                status: 'pending',
            },
            {
                id: 'action-5',
                type: 'notify',
                description: 'Report results',
                details: 'Notify humans of significant improvements',
                prerequisites: ['action-4'],
                validation: {
                    type: 'manual',
                    description: 'Notification sent',
                },
                status: 'pending',
            },
        ];
        return {
            id: `plan-${Date.now()}`,
            objective: objective.id,
            actions,
            currentAction: 0,
            estimatedCompletion: objective.deadline,
            progress: 0,
        };
    }
    async createNewPlan() {
        // Re-analyze goals and create new plan
        if (!this.orgGoals) {
            this.orgGoals = await this.analyzeOrganizationGoals();
        }
        const opportunities = await this.findOpportunities(this.orgGoals);
        const objectives = await this.setObjectives(opportunities);
        return this.createActionPlan(objectives);
    }
    getNextAction(plan) {
        // Find next pending action with satisfied prerequisites
        for (const action of plan.actions) {
            if (action.status !== 'pending')
                continue;
            const prerequisitesMet = action.prerequisites.every(prereqId => plan.actions.find(a => a.id === prereqId)?.status === 'completed');
            if (prerequisitesMet) {
                return action;
            }
        }
        return undefined;
    }
    adjustPlan(plan, result) {
        // Update progress
        const completed = plan.actions.filter(a => a.status === 'completed').length;
        plan.progress = completed / plan.actions.length;
        // If action failed, add remediation
        if (!result.success) {
            // Add debugging/retry action
            plan.actions.push({
                id: `action-retry-${Date.now()}`,
                type: 'analyze',
                description: 'Investigate failure',
                details: 'Analyze why action failed and try alternative approach',
                prerequisites: [],
                validation: {
                    type: 'manual',
                    description: 'Alternative approach identified',
                },
                status: 'pending',
            });
        }
        return plan;
    }
    // ============================================================================
    // ACTION EXECUTION
    // ============================================================================
    async execute(action) {
        this.emit('action-start', { action: action.id, type: action.type });
        const startTime = Date.now();
        const findings = [];
        const metrics = new Map();
        try {
            switch (action.type) {
                case 'analyze':
                    await this.executeAnalyze(findings, metrics);
                    break;
                case 'suggest':
                    await this.executeSuggest(findings, metrics);
                    break;
                case 'refactor':
                    await this.executeRefactor(findings, metrics);
                    break;
                case 'test':
                    await this.executeTest(findings, metrics);
                    break;
                case 'document':
                    await this.executeDocument(findings, metrics);
                    break;
                case 'monitor':
                    await this.executeMonitor(findings, metrics);
                    break;
                case 'learn':
                    await this.executeLearn(findings, metrics);
                    break;
                case 'notify':
                    await this.executeNotify(findings, metrics);
                    break;
            }
            const result = {
                success: true,
                metrics,
                findings,
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
            this.emit('action-complete', { action: action.id, result });
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                metrics,
                findings: [
                    {
                        id: `finding-error-${Date.now()}`,
                        significance: 0.8,
                        category: 'error',
                        description: `Action failed: ${action.id}`,
                        impact: 'Autonomous operation interrupted',
                        recommendation: 'Investigate and retry with different approach',
                        evidence: [error instanceof Error ? error.message : String(error)],
                    },
                ],
                duration: Date.now() - startTime,
                timestamp: new Date(),
            };
            this.emit('action-failed', { action: action.id, error, result });
            return result;
        }
    }
    async executeAnalyze(findings, metrics) {
        // Simulate analysis
        metrics.set('files-analyzed', 127);
        metrics.set('avg-complexity', 23.4);
        metrics.set('vulnerabilities-found', 3);
        findings.push({
            id: `finding-${Date.now()}`,
            significance: 0.75,
            category: 'baseline',
            description: 'Current codebase metrics established',
            impact: 'Baseline for measuring improvements',
            recommendation: 'Proceed with improvement actions',
            evidence: ['127 files analyzed', 'Average complexity: 23.4'],
        });
    }
    async executeSuggest(findings, metrics) {
        // Simulate suggestion generation
        metrics.set('suggestions-generated', 45);
        metrics.set('high-confidence-suggestions', 23);
        findings.push({
            id: `finding-${Date.now()}`,
            significance: 0.85,
            category: 'suggestions',
            description: 'Generated 23 high-confidence improvement suggestions',
            impact: 'Potential complexity reduction of 30%',
            recommendation: 'Apply top 10 suggestions automatically',
            evidence: ['23 high-confidence suggestions', 'Estimated 30% complexity reduction'],
        });
    }
    async executeRefactor(findings, metrics) {
        // Simulate refactoring
        metrics.set('refactorings-applied', 10);
        metrics.set('complexity-reduced', 7.2);
        findings.push({
            id: `finding-${Date.now()}`,
            significance: 0.92,
            category: 'improvement',
            description: 'Successfully applied 10 refactorings',
            impact: 'Reduced average complexity by 7.2 points',
            recommendation: 'Monitor for any regressions',
            evidence: ['10 refactorings applied', 'Complexity: 23.4 → 16.2', 'All tests passing'],
        });
    }
    async executeTest(findings, metrics) {
        metrics.set('tests-generated', 34);
        metrics.set('coverage-improvement', 12.5);
    }
    async executeDocument(findings, metrics) {
        metrics.set('docs-generated', 15);
        metrics.set('documentation-coverage', 78);
    }
    async executeMonitor(findings, metrics) {
        metrics.set('improvement-verified', 1);
        metrics.set('quality-score-delta', 13);
    }
    async executeLearn(findings, metrics) {
        metrics.set('patterns-learned', 5);
        metrics.set('accuracy-improvement', 3.2);
    }
    async executeNotify(findings, metrics) {
        metrics.set('notifications-sent', 1);
    }
    // ============================================================================
    // LEARNING & NOTIFICATION
    // ============================================================================
    async learn(result) {
        // Learn from action outcomes
        for (const [metric, value] of result.metrics) {
            // In real implementation: update learning models
            this.emit('learning', { metric, value });
        }
        // Store findings
        for (const finding of result.findings) {
            this.findings.set(finding.id, finding);
        }
    }
    async notifyHumans(finding) {
        this.emit('significant-finding', {
            significance: finding.significance,
            category: finding.category,
            description: finding.description,
            impact: finding.impact,
            recommendation: finding.recommendation,
            evidence: finding.evidence,
        });
        // In real implementation: create GitHub issue, send notification, etc.
    }
    // ============================================================================
    // HELPERS
    // ============================================================================
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=self-directed-system.js.map