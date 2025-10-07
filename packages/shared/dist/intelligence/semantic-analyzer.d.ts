/**
 * Semantic Analyzer - Phase 2.1 of Evolution Plan
 * Understands code MEANING, not just structure
 */
export interface CodeIntent {
    purpose: string;
    category: 'business' | 'infrastructure' | 'utility' | 'security' | 'data';
    actions: string[];
    inputs: DataFlow[];
    outputs: DataFlow[];
    sideEffects: SideEffect[];
    dependencies: Dependency[];
    complexity: ComplexityAnalysis;
    patterns: string[];
    antiPatterns: string[];
    suggestions: string[];
    confidence: number;
}
export interface DataFlow {
    name: string;
    type: string;
    source: 'parameter' | 'database' | 'api' | 'file' | 'user' | 'internal';
    validation: string[];
    transformations: string[];
    sensitivity: 'public' | 'private' | 'sensitive' | 'critical';
}
export interface SideEffect {
    type: 'database' | 'file' | 'network' | 'console' | 'global' | 'async';
    action: string;
    target?: string;
    risk: 'low' | 'medium' | 'high';
}
export interface Dependency {
    name: string;
    type: 'internal' | 'external' | 'system';
    purpose: string;
    critical: boolean;
}
export interface ComplexityAnalysis {
    cognitive: number;
    cyclomatic: number;
    depth: number;
    coupling: number;
    cohesion: number;
}
export declare class SemanticAnalyzer {
    private knowledgeBase;
    private patterns;
    private messageBus;
    private tracker;
    constructor();
    /**
     * Analyze code to understand its intent and meaning
     */
    analyzeIntent(code: string, context?: {
        fileName?: string;
        projectType?: string;
        dependencies?: string[];
    }): Promise<CodeIntent>;
    /**
     * Detect the purpose of the code
     */
    private detectPurpose;
    /**
     * Analyze how data flows through the code
     */
    private analyzeDataFlow;
    /**
     * Detect side effects in the code
     */
    private detectSideEffects;
    /**
     * Extract dependencies
     */
    private extractDependencies;
    /**
     * Analyze code complexity
     */
    private analyzeComplexity;
    /**
     * Detect design patterns
     */
    private detectPatterns;
    /**
     * Detect anti-patterns
     */
    private detectAntiPatterns;
    /**
     * Generate intelligent suggestions
     */
    private generateSuggestions;
    /**
     * Helper methods
     */
    private initializePatterns;
    private initializeKnowledge;
    private categorizeCode;
    private inferType;
    private typeToString;
    private detectSensitivity;
    private findValidations;
    private extractActions;
    private calculateConfidence;
    private isAuthCall;
    private isValidationCall;
    private isDatabaseWrite;
    private isFileOperation;
    private isNetworkCall;
    private isConsoleLog;
    private isGlobalAssignment;
    private extractTarget;
    private extractAction;
    private extractUrl;
    private classifyDependency;
    private inferDependencyPurpose;
    private isCriticalDependency;
    private isBuiltIn;
    private functionsAreRelated;
    private detectSingleton;
    private detectFactory;
    private detectObserver;
    private detectRepository;
    private detectDependencyInjection;
    private detectBuilder;
    private detectMiddleware;
    private detectGodObject;
    private detectCallbackHell;
    private detectMagicNumbers;
    private detectDuplication;
    private detectLongParameterList;
    private detectDeepNesting;
    private detectUnusedVariables;
    private describeOperation;
    private getTransformationChain;
}
//# sourceMappingURL=semantic-analyzer.d.ts.map