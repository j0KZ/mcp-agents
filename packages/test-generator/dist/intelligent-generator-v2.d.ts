/**
 * Intelligent Test Generator V2
 * Uses Phase 2 Intelligence Components from Master Evolution Plan
 *
 * This enhanced version leverages semantic understanding, execution sandbox,
 * domain knowledge, and explanation engine to generate superior tests.
 */
export interface IntelligentTestResult {
    tests: string;
    coverage: number;
    quality: {
        edgeCaseCoverage: number;
        assertionQuality: number;
        mockingStrategy: number;
        overall: number;
    };
    explanation: any;
    learnings: string[];
}
export declare class IntelligentTestGeneratorV2 {
    private semanticAnalyzer;
    private executionSandbox;
    private domainKnowledge;
    private explanationEngine;
    private performanceTracker;
    private messageBus;
    constructor();
    /**
     * Generate intelligent tests using all Phase 2 components
     */
    generateIntelligentTests(code: string, context?: {
        fileName?: string;
        framework?: string;
        projectType?: string;
    }): Promise<IntelligentTestResult>;
    /**
     * Generate test cases based on semantic understanding
     */
    private generateTestCases;
    /**
     * Generate happy path inputs based on intent
     */
    private generateHappyPathInputs;
    /**
     * Generate tests from all insights
     */
    private generateTestsFromInsights;
    /**
     * Calculate coverage percentage
     */
    private calculateCoverage;
    /**
     * Calculate test quality metrics
     */
    private calculateQuality;
    /**
     * Generate comprehensive explanation
     */
    private generateExplanation;
    /**
     * Learn from user feedback
     */
    learnFromFeedback(tests: string, feedback: {
        accepted: boolean;
        rating?: number;
        issues?: string[];
    }): Promise<void>;
}
export default IntelligentTestGeneratorV2;
//# sourceMappingURL=intelligent-generator-v2.d.ts.map