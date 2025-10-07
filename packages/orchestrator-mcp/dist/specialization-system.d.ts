/**
 * Tool Specialization System
 * Phase 3.3 of Master Evolution Plan
 *
 * This system allows tools to develop specialized expertise through experience,
 * evolve their capabilities based on success patterns, and dynamically adjust
 * their focus areas based on performance metrics.
 */
import { EventEmitter } from 'events';
export interface Specialization {
    id: string;
    name: string;
    domain: string;
    level: number;
    experience: number;
    successRate: number;
    recentPerformance: number[];
    skills: Skill[];
    certifications: Certification[];
    trainingPath: TrainingPath;
}
export interface Skill {
    name: string;
    proficiency: number;
    lastUsed: Date;
    improvementRate: number;
    dependencies: string[];
}
export interface Certification {
    name: string;
    domain: string;
    achievedAt: Date;
    requirements: Requirement[];
    expiresAt?: Date;
}
export interface Requirement {
    type: 'tasks' | 'success-rate' | 'skill-level' | 'peer-review';
    target: number;
    description: string;
    skill?: string;
    current?: number;
    met?: boolean;
}
export interface TrainingPath {
    currentLevel: string;
    nextLevel: string;
    progress: number;
    requirements: Requirement[];
    estimatedTime: number;
}
export interface ToolProfile {
    toolId: string;
    specializations: Map<string, Specialization>;
    primaryFocus: string;
    secondaryFocus: string[];
    learningStyle: LearningStyle;
    performanceHistory: PerformanceRecord[];
    evolutionPath: Evolution[];
}
export interface LearningStyle {
    type: 'fast-learner' | 'steady-improver' | 'specialist' | 'generalist';
    preferredDomains: string[];
    strengthAreas: string[];
    improvementAreas: string[];
    adaptabilityScore: number;
}
export interface PerformanceRecord {
    timestamp: Date;
    task: string;
    domain: string;
    success: boolean;
    score: number;
    feedback?: string;
    learnings: string[];
}
export interface Evolution {
    timestamp: Date;
    type: 'skill-gained' | 'level-up' | 'certification' | 'specialization-change';
    description: string;
    impact: 'minor' | 'moderate' | 'major';
}
export interface TaskAssignment {
    taskId: string;
    taskType: string;
    requirements: TaskRequirements;
    candidates: ToolCandidate[];
    selected: string;
    reasoning: string[];
}
export interface TaskRequirements {
    domain: string;
    skillsRequired: string[];
    minimumLevel?: number;
    preferredSpecializations?: string[];
    complexity: 'simple' | 'moderate' | 'complex' | 'expert';
}
export interface ToolCandidate {
    toolId: string;
    matchScore: number;
    specializations: string[];
    availability: number;
    recentPerformance: number;
    estimatedSuccess: number;
}
export declare class SpecializationSystem extends EventEmitter {
    private toolProfiles;
    private domainExperts;
    private skillTree;
    private certificationPrograms;
    private performanceTracker;
    private messageBus;
    private readonly LEARNING_RATE;
    private readonly DECAY_RATE;
    private readonly SPECIALIZATION_THRESHOLD;
    private readonly EXPERT_THRESHOLD;
    constructor();
    /**
     * Initialize skill tree with dependencies
     */
    private initializeSkillTree;
    /**
     * Add skill node to tree
     */
    private addSkillNode;
    /**
     * Initialize certification programs
     */
    private initializeCertifications;
    /**
     * Initialize tool profiles with starting specializations
     */
    private initializeToolProfiles;
    /**
     * Create tool profile
     */
    private createToolProfile;
    /**
     * Create specialization
     */
    private createSpecialization;
    /**
     * Get skills for specialization
     */
    private getSkillsForSpecialization;
    /**
     * Create training path
     */
    private createTrainingPath;
    /**
     * Get next level milestone
     */
    private getNextLevel;
    /**
     * Get level name
     */
    private getLevelName;
    /**
     * Add domain expert
     */
    private addDomainExpert;
    /**
     * Assign task to most suitable tool
     */
    assignTask(requirements: TaskRequirements): Promise<TaskAssignment>;
    /**
     * Find candidate tools for task
     */
    private findCandidates;
    /**
     * Calculate match score for tool and requirements
     */
    private calculateMatchScore;
    /**
     * Get complexity handling score
     */
    private getComplexityScore;
    /**
     * Get average specialization level
     */
    private getAverageSpecializationLevel;
    /**
     * Calculate tool availability
     */
    private calculateAvailability;
    /**
     * Calculate recent performance
     */
    private calculateRecentPerformance;
    /**
     * Estimate success probability
     */
    private estimateSuccess;
    /**
     * Get specialization bonus for domain
     */
    private getSpecializationBonus;
    /**
     * Select best candidate
     */
    private selectBestCandidate;
    /**
     * Score candidate for final selection
     */
    private scoreCandidateForSelection;
    /**
     * Explain selection reasoning
     */
    private explainSelection;
    /**
     * Record task outcome and update specializations
     */
    recordOutcome(toolId: string, task: {
        domain: string;
        complexity: string;
        success: boolean;
        score: number;
        feedback?: string;
        learnings?: string[];
    }): Promise<void>;
    /**
     * Update specializations based on task outcome
     */
    private updateSpecializations;
    /**
     * Calculate level change based on performance
     */
    private calculateLevelChange;
    /**
     * Update skills based on task
     */
    private updateSkills;
    /**
     * Check for new certifications
     */
    private checkCertifications;
    /**
     * Check certification requirements
     */
    private checkCertificationRequirements;
    /**
     * Award certification to tool
     */
    private awardCertification;
    /**
     * Check for evolution events
     */
    private checkEvolution;
    /**
     * Check if tool should change specialization
     */
    private shouldChangeSpecialization;
    /**
     * Suggest specialization change
     */
    private suggestSpecializationChange;
    /**
     * Update domain experts list
     */
    private updateDomainExperts;
    /**
     * Get domain experts
     */
    getDomainExperts(domain: string): string[];
    /**
     * Get tool capabilities summary
     */
    getToolCapabilities(toolId: string): {
        specializations: Specialization[];
        certifications: Certification[];
        topSkills: Skill[];
        performance: number;
        evolution: Evolution[];
    } | null;
    /**
     * Generate specialization report
     */
    generateReport(): {
        toolProfiles: Map<string, any>;
        domainCoverage: Map<string, number>;
        certificationStats: Map<string, number>;
        topPerformers: {
            toolId: string;
            score: number;
        }[];
    };
}
export default SpecializationSystem;
//# sourceMappingURL=specialization-system.d.ts.map