/**
 * Domain Knowledge Base
 * Phase 2.3 of Master Evolution Plan
 *
 * This module contains deep knowledge about common frameworks, patterns,
 * best practices, and domain-specific conventions that MCPs can leverage
 * to make expert-level decisions.
 */
import { EventEmitter } from 'events';
import { MessageBus } from '../communication/message-bus.js';
export interface FrameworkKnowledge {
    name: string;
    category: 'frontend' | 'backend' | 'fullstack' | 'testing' | 'build' | 'database';
    patterns: Pattern[];
    conventions: Convention[];
    pitfalls: Pitfall[];
    bestPractices: BestPractice[];
    performance: PerformanceTip[];
    security: SecurityConsideration[];
}
export interface Pattern {
    name: string;
    description: string;
    when: string;
    implementation: string;
    example?: string;
    antiPattern?: string;
}
export interface Convention {
    aspect: string;
    standard: string;
    reasoning: string;
    example?: string;
}
export interface Pitfall {
    issue: string;
    symptoms: string[];
    solution: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface BestPractice {
    category: string;
    practice: string;
    reasoning: string;
    implementation: string;
    impact: 'performance' | 'security' | 'maintainability' | 'scalability';
}
export interface PerformanceTip {
    operation: string;
    optimization: string;
    improvement: string;
    tradeoff?: string;
}
export interface SecurityConsideration {
    threat: string;
    vulnerability: string;
    mitigation: string;
    owaspCategory?: string;
}
export interface DomainConcept {
    domain: string;
    concepts: {
        name: string;
        definition: string;
        importance: 'low' | 'medium' | 'high' | 'critical';
        relatedConcepts: string[];
    }[];
}
export declare class DomainKnowledgeBase extends EventEmitter {
    private frameworks;
    private domains;
    private patterns;
    private messageBus;
    constructor(messageBus: MessageBus);
    /**
     * Initialize with comprehensive framework and domain knowledge
     */
    private initializeKnowledge;
    /**
     * Initialize domain-specific concepts
     */
    private initializeDomainConcepts;
    /**
     * Get framework knowledge
     */
    getFrameworkKnowledge(framework: string): FrameworkKnowledge | null;
    /**
     * Get domain concepts
     */
    getDomainKnowledge(domain: string): DomainConcept | null;
    /**
     * Analyze code and provide framework-specific insights
     */
    analyzeWithKnowledge(code: string, context: {
        framework?: string;
        domain?: string;
        fileType?: string;
    }): Promise<{
        insights: string[];
        warnings: string[];
        suggestions: string[];
        patterns: Pattern[];
        pitfalls: Pitfall[];
    }>;
    /**
     * Detect framework from code
     */
    private detectFramework;
    /**
     * Check if code has a specific pitfall
     */
    private checkForPitfall;
    /**
     * Check if pattern is applicable to code
     */
    private isPatternApplicable;
    /**
     * Check if code follows best practice
     */
    private followsBestPractice;
    /**
     * Check if code needs optimization
     */
    private needsOptimization;
    /**
     * Check for security issues
     */
    private hasSecurityIssue;
    /**
     * Check if code involves domain concept
     */
    private involvesconcept;
    /**
     * Check if code includes related concept
     */
    private includesRelatedConcept;
    /**
     * Get recommendations for specific operation
     */
    getRecommendations(operation: string, context: {
        framework?: string;
        currentImplementation?: string;
    }): string[];
    /**
     * Learn new pattern from successful code
     */
    learnPattern(code: string, metadata: {
        framework: string;
        patternName: string;
        description: string;
        performance?: number;
        userRating?: number;
    }): Promise<void>;
}
export default DomainKnowledgeBase;
//# sourceMappingURL=domain-knowledge.d.ts.map