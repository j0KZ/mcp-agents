/**
 * Explanation Engine
 * Phase 2.4 of Master Evolution Plan
 *
 * This module generates human-readable explanations for all MCP decisions,
 * making the tools' reasoning transparent and educational.
 */
import { EventEmitter } from 'events';
import { MessageBus } from '../communication/message-bus.js';
import { CodeIntent } from './semantic-analyzer.js';
import { ExecutionResult } from './execution-sandbox.js';
import { Pattern, Pitfall } from './domain-knowledge.js';
export interface Explanation {
    summary: string;
    reasoning: string[];
    evidence: Evidence[];
    confidence: number;
    alternativeApproaches?: AlternativeApproach[];
    educationalNotes?: string[];
    visualizations?: Visualization[];
}
export interface Evidence {
    type: 'code' | 'pattern' | 'metric' | 'execution' | 'knowledge';
    description: string;
    data: any;
    importance: 'low' | 'medium' | 'high';
}
export interface AlternativeApproach {
    approach: string;
    prosAndCons: {
        pros: string[];
        cons: string[];
    };
    whenToUse: string;
}
export interface Visualization {
    type: 'flowchart' | 'diagram' | 'table' | 'graph';
    title: string;
    data: any;
    mermaidCode?: string;
}
export interface ExplanationContext {
    toolName: string;
    operation: string;
    input: any;
    output: any;
    metadata?: Record<string, any>;
}
export declare class ExplanationEngine extends EventEmitter {
    private messageBus;
    private templates;
    private explanationHistory;
    constructor(messageBus: MessageBus);
    /**
     * Initialize explanation templates for different scenarios
     */
    private initializeTemplates;
    /**
     * Generate explanation for a semantic analysis
     */
    explainSemanticAnalysis(intent: CodeIntent, code: string): Explanation;
    /**
     * Generate semantic summary
     */
    private generateSemanticSummary;
    /**
     * Interpret complexity score
     */
    private interpretComplexity;
    /**
     * Generate complexity visualization
     */
    private generateComplexityDiagram;
    /**
     * Explain execution results
     */
    explainExecutionResults(results: ExecutionResult, code: string, testCases: any[]): Explanation;
    /**
     * Generate execution summary
     */
    private generateExecutionSummary;
    /**
     * Explain error type
     */
    private explainError;
    /**
     * Explain framework-specific insights
     */
    explainFrameworkInsights(framework: string, insights: {
        patterns: Pattern[];
        pitfalls: Pitfall[];
        suggestions: string[];
    }): Explanation;
    /**
     * Explain test generation decisions
     */
    explainTestGeneration(tests: any[], coverage: number, strategy: {
        edgeCases: boolean;
        mocking: boolean;
        asyncTesting: boolean;
    }): Explanation;
    /**
     * Explain refactoring decisions
     */
    explainRefactoring(original: string, refactored: string, changes: {
        type: string;
        description: string;
        impact: string;
    }[]): Explanation;
    /**
     * Explain security findings
     */
    explainSecurityFindings(vulnerabilities: {
        type: string;
        severity: string;
        description: string;
        fix: string;
    }[]): Explanation;
    /**
     * Generate comparative explanation
     */
    explainComparison(options: {
        name: string;
        score: number;
        pros: string[];
        cons: string[];
    }[]): Explanation;
    /**
     * Generate comparison chart
     */
    private generateComparisonChart;
    /**
     * Create unified explanation from multiple tools
     */
    createUnifiedExplanation(toolExplanations: Map<string, Explanation>): Promise<Explanation>;
    /**
     * Generate explanation in different formats
     */
    formatExplanation(explanation: Explanation, format: 'markdown' | 'plain' | 'json' | 'html'): string;
    /**
     * Convert explanation to Markdown
     */
    private toMarkdown;
    /**
     * Convert to plain text
     */
    private toPlainText;
    /**
     * Convert to HTML
     */
    private toHTML;
}
export default ExplanationEngine;
//# sourceMappingURL=explanation-engine.d.ts.map