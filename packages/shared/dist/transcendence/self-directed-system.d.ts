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
interface OrganizationalGoals {
    primary: Goal[];
    secondary: Goal[];
    constraints: Constraint[];
    timeline: Timeline;
}
interface Goal {
    id: string;
    type: GoalType;
    description: string;
    metric: string;
    target: number;
    current: number;
    priority: number;
    deadline?: Date;
}
type GoalType = 'quality' | 'performance' | 'security' | 'maintainability' | 'velocity' | 'reliability' | 'cost' | 'innovation';
interface Constraint {
    type: 'budget' | 'time' | 'resources' | 'compatibility';
    description: string;
    limit: number;
}
interface Timeline {
    start: Date;
    milestones: Milestone[];
    end: Date;
}
interface Milestone {
    name: string;
    date: Date;
    criteria: string;
}
interface Opportunity {
    id: string;
    type: OpportunityType;
    description: string;
    impact: Impact;
    effort: number;
    roi: number;
    relatedGoals: string[];
    discovered: Date;
}
type OpportunityType = 'quick-win' | 'strategic' | 'preventive' | 'optimization' | 'innovation' | 'debt-reduction';
interface Impact {
    category: GoalType;
    magnitude: number;
    confidence: number;
    timeToValue: number;
}
interface Objective {
    id: string;
    goal: string;
    description: string;
    successCriteria: SuccessCriteria[];
    deadline: Date;
    priority: number;
    status: 'planned' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    blockers?: string[];
}
interface SuccessCriteria {
    metric: string;
    target: number;
    measurable: boolean;
}
interface ActionPlan {
    id: string;
    objective: string;
    actions: Action[];
    currentAction: number;
    estimatedCompletion: Date;
    progress: number;
}
interface Action {
    id: string;
    type: ActionType;
    description: string;
    details: string;
    prerequisites: string[];
    validation: ValidationCriteria;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    result?: ActionResult;
}
type ActionType = 'analyze' | 'suggest' | 'refactor' | 'test' | 'document' | 'monitor' | 'learn' | 'notify';
interface ValidationCriteria {
    type: 'metrics' | 'tests' | 'review' | 'manual';
    threshold?: number;
    description: string;
}
interface ActionResult {
    success: boolean;
    metrics: Map<string, number>;
    findings: Finding[];
    duration: number;
    timestamp: Date;
}
interface Finding {
    id: string;
    significance: number;
    category: string;
    description: string;
    impact: string;
    recommendation: string;
    evidence: string[];
}
export declare class SelfDirectedSystem extends EventEmitter {
    private orgGoals;
    private opportunities;
    private objectives;
    private plans;
    private findings;
    private running;
    private readonly CYCLE_INTERVAL;
    private readonly SIGNIFICANCE_THRESHOLD;
    constructor();
    /**
     * Become autonomous - set own goals and work independently
     * Exactly as specified in MASTER_EVOLUTION_PLAN.md Phase 5.4
     */
    becomeAutonomous(): Promise<void>;
    /**
     * Stop autonomous operation
     */
    stopAutonomousMode(): void;
    /**
     * Get current status
     */
    getStatus(): {
        running: boolean;
        objectives: number;
        completedActions: number;
        significantFindings: number;
        currentPlan?: string;
    };
    private analyzeOrganizationGoals;
    private findOpportunities;
    private findOpportunitiesForGoal;
    private setObjectives;
    private groupOpportunities;
    private calculateObjectivePriority;
    private createActionPlan;
    private createNewPlan;
    private getNextAction;
    private adjustPlan;
    private execute;
    private executeAnalyze;
    private executeSuggest;
    private executeRefactor;
    private executeTest;
    private executeDocument;
    private executeMonitor;
    private executeLearn;
    private executeNotify;
    private learn;
    private notifyHumans;
    private sleep;
}
export type { OrganizationalGoals, Goal, Opportunity, Objective, ActionPlan, Action, Finding };
//# sourceMappingURL=self-directed-system.d.ts.map