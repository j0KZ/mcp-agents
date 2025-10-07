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
import { ExecutionResult, Learning } from './execution-sandbox.js';
import { FrameworkKnowledge, Pattern, Pitfall } from './domain-knowledge.js';

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

export class ExplanationEngine extends EventEmitter {
  private messageBus: MessageBus;
  private templates: Map<string, ExplanationTemplate> = new Map();
  private explanationHistory: Map<string, Explanation[]> = new Map();

  constructor(messageBus: MessageBus) {
    super();
    this.messageBus = messageBus;
    this.initializeTemplates();
  }

  /**
   * Initialize explanation templates for different scenarios
   */
  private initializeTemplates(): void {
    // Code Analysis Template
    this.templates.set('code-analysis', {
      sections: ['what', 'why', 'how', 'impact', 'alternatives'],
      tone: 'technical',
      includeEvidence: true,
      includeVisualizations: true,
    });

    // Test Generation Template
    this.templates.set('test-generation', {
      sections: ['coverage', 'scenarios', 'assertions', 'mocks', 'edge-cases'],
      tone: 'educational',
      includeEvidence: true,
      includeVisualizations: false,
    });

    // Refactoring Template
    this.templates.set('refactoring', {
      sections: ['current-state', 'issues', 'proposed-changes', 'benefits', 'risks'],
      tone: 'balanced',
      includeEvidence: true,
      includeVisualizations: true,
    });

    // Security Template
    this.templates.set('security', {
      sections: ['vulnerabilities', 'severity', 'attack-vectors', 'mitigations', 'verification'],
      tone: 'serious',
      includeEvidence: true,
      includeVisualizations: false,
    });
  }

  /**
   * Generate explanation for a semantic analysis
   */
  explainSemanticAnalysis(intent: CodeIntent, code: string): Explanation {
    const explanation: Explanation = {
      summary: this.generateSemanticSummary(intent),
      reasoning: [],
      evidence: [],
      confidence: intent.confidence,
      educationalNotes: [],
    };

    // Explain purpose detection
    explanation.reasoning.push(
      `Identified this code's primary purpose as "${intent.purpose}" based on:`,
      `- Function names and variable patterns`,
      `- Data flow analysis showing ${intent.inputs.length} inputs and ${intent.outputs.length} outputs`,
      `- ${intent.sideEffects.length} side effects detected`
    );

    // Add evidence
    if (intent.patterns.length > 0) {
      explanation.evidence.push({
        type: 'pattern',
        description: `Found ${intent.patterns.length} design patterns`,
        data: intent.patterns,
        importance: 'high',
      });
    }

    if (intent.antiPatterns.length > 0) {
      explanation.evidence.push({
        type: 'pattern',
        description: `Detected ${intent.antiPatterns.length} anti-patterns`,
        data: intent.antiPatterns,
        importance: 'high',
      });

      explanation.reasoning.push(
        `⚠️ Anti-patterns detected that may impact code quality:`,
        ...intent.antiPatterns.map(p => `  - ${p}`)
      );
    }

    // Complexity explanation
    explanation.reasoning.push(
      `Complexity Analysis:`,
      `- Cognitive Complexity: ${intent.complexity.cognitive} (${this.interpretComplexity(intent.complexity.cognitive)})`,
      `- Cyclomatic Complexity: ${intent.complexity.cyclomatic} (${this.interpretComplexity(intent.complexity.cyclomatic)})`,
      `- Nesting Depth: ${intent.complexity.depth}`
    );

    // Educational notes
    if (intent.antiPatterns.includes('God Object')) {
      explanation.educationalNotes?.push(
        '📚 God Object: A class that knows too much or does too much. Consider splitting responsibilities using Single Responsibility Principle (SRP).'
      );
    }

    if (intent.antiPatterns.includes('Callback Hell')) {
      explanation.educationalNotes?.push(
        '📚 Callback Hell: Deeply nested callbacks make code hard to read. Consider using async/await or Promises for better readability.'
      );
    }

    // Add visualization if complex
    if (intent.complexity.cyclomatic > 10) {
      explanation.visualizations = [this.generateComplexityDiagram(intent.complexity)];
    }

    return explanation;
  }

  /**
   * Generate semantic summary
   */
  private generateSemanticSummary(intent: CodeIntent): string {
    const parts: string[] = [];

    // Main purpose
    parts.push(`This code ${intent.purpose}`);

    // Category
    parts.push(`(${intent.category} logic)`);

    // Key characteristics
    if (intent.sideEffects.length === 0) {
      parts.push('with no side effects');
    } else if (intent.sideEffects.length > 3) {
      parts.push(`with ${intent.sideEffects.length} significant side effects`);
    }

    // Quality assessment
    if (intent.antiPatterns.length === 0 && intent.complexity.cyclomatic < 10) {
      parts.push('following good practices');
    } else if (intent.antiPatterns.length > 2) {
      parts.push('but has several quality issues');
    }

    return parts.join(' ') + '.';
  }

  /**
   * Interpret complexity score
   */
  private interpretComplexity(score: number): string {
    if (score <= 5) return 'Simple - Easy to understand';
    if (score <= 10) return 'Moderate - Reasonable complexity';
    if (score <= 20) return 'Complex - Consider refactoring';
    if (score <= 50) return 'Very Complex - Should be refactored';
    return 'Extremely Complex - Critical refactoring needed';
  }

  /**
   * Generate complexity visualization
   */
  private generateComplexityDiagram(complexity: any): Visualization {
    const mermaidCode = `
graph TD
    A[Code Complexity] --> B[Cognitive: ${complexity.cognitive}]
    A --> C[Cyclomatic: ${complexity.cyclomatic}]
    A --> D[Nesting: ${complexity.nestingDepth}]
    A --> E[Coupling: ${complexity.coupling}]
    A --> F[Cohesion: ${complexity.cohesion}]

    B --> B1[${this.interpretComplexity(complexity.cognitive)}]
    C --> C1[${this.interpretComplexity(complexity.cyclomatic)}]

    style A fill:#f9f,stroke:#333,stroke-width:4px
    style B1 fill:#${complexity.cognitive > 20 ? 'f99' : '9f9'}
    style C1 fill:#${complexity.cyclomatic > 20 ? 'f99' : '9f9'}
`;

    return {
      type: 'diagram',
      title: 'Complexity Breakdown',
      data: complexity,
      mermaidCode,
    };
  }

  /**
   * Explain execution results
   */
  explainExecutionResults(results: ExecutionResult, code: string, testCases: any[]): Explanation {
    const explanation: Explanation = {
      summary: this.generateExecutionSummary(results),
      reasoning: [],
      evidence: [],
      confidence: 0.9,
      educationalNotes: [],
    };

    // Performance explanation
    explanation.reasoning.push(
      `Execution Performance:`,
      `- Completed in ${results.metrics.executionTime.toFixed(2)}ms`,
      `- Memory usage: ${(results.metrics.memoryUsed / 1024).toFixed(2)}KB`,
      `- CPU utilization: ${results.metrics.cpuUsage.toFixed(1)}%`
    );

    // Behavior analysis
    if (results.behavior.sideEffects.length > 0) {
      explanation.reasoning.push(
        `Observed Behaviors:`,
        `- ${results.behavior.sideEffects.length} side effects`,
        `- ${results.behavior.asyncOperations} async operations`,
        ...results.behavior.sideEffects.map(e => `  • ${e.type}: ${e.operation} (risk: ${e.risk})`)
      );
    }

    // Learning insights
    if (results.learnings.length > 0) {
      explanation.reasoning.push(`Key Learnings:`, ...results.learnings.map(l => `- ${l.insight}`));

      // Add recommendations
      const recommendations = results.learnings
        .filter(l => l.recommendation)
        .map(l => l.recommendation!);

      if (recommendations.length > 0) {
        explanation.reasoning.push(`Recommendations:`, ...recommendations.map(r => `✓ ${r}`));
      }
    }

    // Error explanation
    if (!results.success && results.error) {
      explanation.reasoning.push(
        `❌ Execution Failed:`,
        `- Error Type: ${results.error.type}`,
        `- Message: ${results.error.message}`,
        `- This typically indicates: ${this.explainError(results.error)}`
      );

      explanation.educationalNotes?.push(
        `💡 To debug ${results.error.type} errors: Check for null/undefined values, ensure proper initialization, and validate input data.`
      );
    }

    // Coverage explanation
    if (results.coverage) {
      explanation.evidence.push({
        type: 'metric',
        description: 'Code Coverage',
        data: results.coverage,
        importance: 'medium',
      });

      explanation.reasoning.push(
        `Coverage Analysis:`,
        `- Statements: ${results.coverage.statements.toFixed(1)}%`,
        `- Branches: ${results.coverage.branches.toFixed(1)}%`,
        `- Functions: ${results.coverage.functions.toFixed(1)}%`
      );
    }

    return explanation;
  }

  /**
   * Generate execution summary
   */
  private generateExecutionSummary(results: ExecutionResult): string {
    if (results.success) {
      return `Code executed successfully in ${results.metrics.executionTime.toFixed(0)}ms with ${results.behavior.sideEffects.length} side effects.`;
    } else {
      return `Execution failed with ${results.error?.type || 'unknown error'} after ${results.metrics.executionTime.toFixed(0)}ms.`;
    }
  }

  /**
   * Explain error type
   */
  private explainError(error: { type: string; message: string }): string {
    const explanations: Record<string, string> = {
      TypeError: 'incorrect data type or null/undefined access',
      ReferenceError: 'variable or function not defined',
      SyntaxError: 'invalid JavaScript/TypeScript syntax',
      RangeError: 'value outside allowed range or stack overflow',
      Error: 'general error condition',
    };

    return explanations[error.type] || 'unexpected condition';
  }

  /**
   * Explain framework-specific insights
   */
  explainFrameworkInsights(
    framework: string,
    insights: {
      patterns: Pattern[];
      pitfalls: Pitfall[];
      suggestions: string[];
    }
  ): Explanation {
    const explanation: Explanation = {
      summary: `Analysis based on ${framework} best practices and patterns.`,
      reasoning: [],
      evidence: [],
      confidence: 0.85,
      educationalNotes: [],
      alternativeApproaches: [],
    };

    // Explain patterns
    if (insights.patterns.length > 0) {
      explanation.reasoning.push(
        `Applicable ${framework} Patterns:`,
        ...insights.patterns.map(p => `- ${p.name}: ${p.description}`)
      );

      // Add pattern examples
      for (const pattern of insights.patterns) {
        if (pattern.example) {
          explanation.educationalNotes?.push(`📘 ${pattern.name} Example: ${pattern.example}`);
        }

        if (pattern.antiPattern) {
          explanation.educationalNotes?.push(`⚠️ Avoid: ${pattern.antiPattern}`);
        }
      }
    }

    // Explain pitfalls
    if (insights.pitfalls.length > 0) {
      explanation.reasoning.push(
        `⚠️ Potential Issues Detected:`,
        ...insights.pitfalls.map(p => `- ${p.issue} (${p.severity} severity)`)
      );

      // Add solutions
      for (const pitfall of insights.pitfalls) {
        explanation.reasoning.push(`  Solution: ${pitfall.solution}`);

        explanation.evidence.push({
          type: 'knowledge',
          description: pitfall.issue,
          data: {
            symptoms: pitfall.symptoms,
            solution: pitfall.solution,
          },
          importance: pitfall.severity === 'critical' ? 'high' : 'medium',
        });
      }
    }

    // Add alternative approaches for patterns
    for (const pattern of insights.patterns) {
      explanation.alternativeApproaches?.push({
        approach: pattern.name,
        prosAndCons: {
          pros: [
            'Well-established pattern',
            'Clear separation of concerns',
            'Easier testing and maintenance',
          ],
          cons: ['May add initial complexity', 'Requires team familiarity'],
        },
        whenToUse: pattern.when,
      });
    }

    return explanation;
  }

  /**
   * Explain test generation decisions
   */
  explainTestGeneration(
    tests: any[],
    coverage: number,
    strategy: {
      edgeCases: boolean;
      mocking: boolean;
      asyncTesting: boolean;
    }
  ): Explanation {
    const explanation: Explanation = {
      summary: `Generated ${tests.length} tests achieving ${coverage.toFixed(1)}% coverage.`,
      reasoning: [],
      evidence: [],
      confidence: 0.8,
    };

    // Test strategy explanation
    explanation.reasoning.push(
      `Test Strategy:`,
      `- Generated ${tests.filter(t => t.type === 'happy-path').length} happy path tests`,
      `- Generated ${tests.filter(t => t.type === 'edge-case').length} edge case tests`,
      `- Generated ${tests.filter(t => t.type === 'error').length} error handling tests`
    );

    if (strategy.edgeCases) {
      explanation.reasoning.push(
        `Edge Cases Covered:`,
        `- Null/undefined inputs`,
        `- Empty arrays/objects`,
        `- Boundary values`,
        `- Type mismatches`
      );
    }

    if (strategy.mocking) {
      explanation.reasoning.push(
        `Mocking Strategy:`,
        `- External dependencies mocked`,
        `- Database calls stubbed`,
        `- Network requests intercepted`
      );
    }

    if (strategy.asyncTesting) {
      explanation.reasoning.push(
        `Async Testing:`,
        `- Promise resolution/rejection`,
        `- Timeout scenarios`,
        `- Race conditions`
      );
    }

    // Educational notes about testing
    explanation.educationalNotes = [
      '🎯 Good tests are: Fast, Independent, Repeatable, Self-validating, and Timely (FIRST)',
      '📊 Aim for 80%+ code coverage, but remember: coverage ≠ quality',
      '🔄 Test behavior, not implementation details',
    ];

    return explanation;
  }

  /**
   * Explain refactoring decisions
   */
  explainRefactoring(
    original: string,
    refactored: string,
    changes: {
      type: string;
      description: string;
      impact: string;
    }[]
  ): Explanation {
    const explanation: Explanation = {
      summary: `Applied ${changes.length} refactoring transformations to improve code quality.`,
      reasoning: [],
      evidence: [],
      confidence: 0.85,
      alternativeApproaches: [],
    };

    // Explain each change
    for (const change of changes) {
      explanation.reasoning.push(
        `${change.type}:`,
        `- What: ${change.description}`,
        `- Why: ${change.impact}`
      );

      explanation.evidence.push({
        type: 'code',
        description: change.type,
        data: { before: original.substring(0, 100), after: refactored.substring(0, 100) },
        importance: 'medium',
      });
    }

    // Metrics comparison
    const originalLines = original.split('\n').length;
    const refactoredLines = refactored.split('\n').length;
    const reduction = (((originalLines - refactoredLines) / originalLines) * 100).toFixed(1);

    if (refactoredLines < originalLines) {
      explanation.reasoning.push(
        `📉 Code Reduction: ${reduction}% fewer lines (${originalLines} → ${refactoredLines})`
      );
    }

    // Alternative approaches
    explanation.alternativeApproaches = [
      {
        approach: 'Minimal Refactoring',
        prosAndCons: {
          pros: ['Less risky', 'Faster to implement', 'Easier review'],
          cons: ['May not address all issues', 'Technical debt remains'],
        },
        whenToUse: 'When time is limited or code is in production',
      },
      {
        approach: 'Complete Rewrite',
        prosAndCons: {
          pros: ['Clean slate', 'Modern patterns', 'Optimal design'],
          cons: ['High risk', 'Time consuming', 'May introduce new bugs'],
        },
        whenToUse: 'When code is unmaintainable and well-tested',
      },
    ];

    return explanation;
  }

  /**
   * Explain security findings
   */
  explainSecurityFindings(
    vulnerabilities: {
      type: string;
      severity: string;
      description: string;
      fix: string;
    }[]
  ): Explanation {
    const criticalCount = vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = vulnerabilities.filter(v => v.severity === 'high').length;

    const explanation: Explanation = {
      summary: `Found ${vulnerabilities.length} security issues (${criticalCount} critical, ${highCount} high).`,
      reasoning: [],
      evidence: [],
      confidence: 0.95,
    };

    // Group by severity
    const grouped = vulnerabilities.reduce(
      (acc, vuln) => {
        if (!acc[vuln.severity]) acc[vuln.severity] = [];
        acc[vuln.severity].push(vuln);
        return acc;
      },
      {} as Record<string, typeof vulnerabilities>
    );

    // Explain each severity level
    for (const [severity, vulns] of Object.entries(grouped)) {
      explanation.reasoning.push(
        `${severity.toUpperCase()} Severity Issues:`,
        ...vulns.map(v => `- ${v.type}: ${v.description}`)
      );

      // Add fixes
      for (const vuln of vulns) {
        explanation.reasoning.push(`  ✓ Fix: ${vuln.fix}`);

        explanation.evidence.push({
          type: 'pattern',
          description: vuln.type,
          data: vuln,
          importance: severity === 'critical' ? 'high' : 'medium',
        });
      }
    }

    // Security best practices
    explanation.educationalNotes = [
      '🔒 Security Principle: Defense in Depth - multiple layers of security',
      '🛡️ Never trust user input - always validate and sanitize',
      '🔑 Principle of Least Privilege - minimize access rights',
      '📝 Log security events for audit trails',
    ];

    return explanation;
  }

  /**
   * Generate comparative explanation
   */
  explainComparison(
    options: {
      name: string;
      score: number;
      pros: string[];
      cons: string[];
    }[]
  ): Explanation {
    const best = options.reduce((a, b) => (a.score > b.score ? a : b));

    const explanation: Explanation = {
      summary: `Comparing ${options.length} approaches. Recommendation: ${best.name} (score: ${best.score}/100).`,
      reasoning: [],
      evidence: [],
      confidence: 0.8,
      alternativeApproaches: [],
    };

    // Compare each option
    for (const option of options) {
      explanation.reasoning.push(
        `${option.name} (Score: ${option.score}/100):`,
        `  Pros: ${option.pros.join(', ')}`,
        `  Cons: ${option.cons.join(', ')}`
      );

      explanation.alternativeApproaches?.push({
        approach: option.name,
        prosAndCons: {
          pros: option.pros,
          cons: option.cons,
        },
        whenToUse:
          option.score === best.score
            ? 'Recommended approach for this scenario'
            : `Consider when: ${option.pros[0]?.toLowerCase()}`,
      });
    }

    // Visual comparison
    explanation.visualizations = [this.generateComparisonChart(options)];

    return explanation;
  }

  /**
   * Generate comparison chart
   */
  private generateComparisonChart(options: any[]): Visualization {
    const mermaidCode = `
graph LR
    ${options.map((o, i) => `O${i}[${o.name}<br/>Score: ${o.score}]`).join('\n    ')}

    ${options.map((o, i) => `O${i} --> S[Selection]`).join('\n    ')}

    style S fill:#f9f,stroke:#333,stroke-width:2px
    ${options
      .map((o, i) => `style O${i} fill:#${o.score > 80 ? '9f9' : o.score > 60 ? 'ff9' : 'f99'}`)
      .join('\n    ')}
`;

    return {
      type: 'graph',
      title: 'Approach Comparison',
      data: options,
      mermaidCode,
    };
  }

  /**
   * Create unified explanation from multiple tools
   */
  async createUnifiedExplanation(toolExplanations: Map<string, Explanation>): Promise<Explanation> {
    const unified: Explanation = {
      summary: 'Combined analysis from multiple MCP tools.',
      reasoning: [],
      evidence: [],
      confidence: 0,
      educationalNotes: [],
      visualizations: [],
    };

    // Combine summaries
    unified.summary = Array.from(toolExplanations.entries())
      .map(([tool, exp]) => `${tool}: ${exp.summary}`)
      .join(' ');

    // Merge reasoning with tool attribution
    for (const [tool, exp] of toolExplanations.entries()) {
      unified.reasoning.push(`\n[${tool}]`, ...exp.reasoning);
      unified.evidence.push(
        ...exp.evidence.map(e => ({
          ...e,
          description: `[${tool}] ${e.description}`,
        }))
      );
    }

    // Calculate average confidence
    const confidences = Array.from(toolExplanations.values()).map(e => e.confidence);
    unified.confidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

    // Combine educational notes
    for (const exp of toolExplanations.values()) {
      if (exp.educationalNotes) {
        unified.educationalNotes?.push(...exp.educationalNotes);
      }
      if (exp.visualizations) {
        unified.visualizations?.push(...exp.visualizations);
      }
    }

    // Remove duplicates
    unified.educationalNotes = [...new Set(unified.educationalNotes)];

    // Share unified explanation
    await this.messageBus.shareInsight('explanation-engine', {
      type: 'unified-explanation',
      data: unified,
      confidence: unified.confidence,
      affects: ['all'],
    });

    return unified;
  }

  /**
   * Generate explanation in different formats
   */
  formatExplanation(
    explanation: Explanation,
    format: 'markdown' | 'plain' | 'json' | 'html'
  ): string {
    switch (format) {
      case 'markdown':
        return this.toMarkdown(explanation);
      case 'plain':
        return this.toPlainText(explanation);
      case 'json':
        return JSON.stringify(explanation, null, 2);
      case 'html':
        return this.toHTML(explanation);
      default:
        return explanation.summary;
    }
  }

  /**
   * Convert explanation to Markdown
   */
  private toMarkdown(explanation: Explanation): string {
    const sections: string[] = [];

    sections.push(`# ${explanation.summary}`);
    sections.push(`\n*Confidence: ${(explanation.confidence * 100).toFixed(0)}%*\n`);

    if (explanation.reasoning.length > 0) {
      sections.push('## Analysis\n');
      sections.push(explanation.reasoning.join('\n'));
    }

    if (explanation.evidence.length > 0) {
      sections.push('\n## Evidence\n');
      for (const evidence of explanation.evidence) {
        sections.push(`- **${evidence.description}** (${evidence.importance} importance)`);
      }
    }

    if (explanation.alternativeApproaches?.length) {
      sections.push('\n## Alternative Approaches\n');
      for (const alt of explanation.alternativeApproaches) {
        sections.push(`### ${alt.approach}`);
        sections.push(`**When to use:** ${alt.whenToUse}\n`);
        sections.push('**Pros:**');
        sections.push(...alt.prosAndCons.pros.map(p => `- ${p}`));
        sections.push('\n**Cons:**');
        sections.push(...alt.prosAndCons.cons.map(c => `- ${c}`));
      }
    }

    if (explanation.educationalNotes?.length) {
      sections.push('\n## Learning Notes\n');
      sections.push(...explanation.educationalNotes);
    }

    if (explanation.visualizations?.length) {
      sections.push('\n## Visualizations\n');
      for (const viz of explanation.visualizations) {
        sections.push(`### ${viz.title}\n`);
        if (viz.mermaidCode) {
          sections.push('```mermaid');
          sections.push(viz.mermaidCode);
          sections.push('```');
        }
      }
    }

    return sections.join('\n');
  }

  /**
   * Convert to plain text
   */
  private toPlainText(explanation: Explanation): string {
    const lines: string[] = [];

    lines.push(explanation.summary);
    lines.push(`Confidence: ${(explanation.confidence * 100).toFixed(0)}%`);
    lines.push('');

    if (explanation.reasoning.length > 0) {
      lines.push('ANALYSIS:');
      lines.push(...explanation.reasoning);
    }

    if (explanation.educationalNotes?.length) {
      lines.push('');
      lines.push('NOTES:');
      lines.push(...explanation.educationalNotes);
    }

    return lines.join('\n');
  }

  /**
   * Convert to HTML
   */
  private toHTML(explanation: Explanation): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>MCP Explanation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .confidence { color: #666; }
    .evidence { background: #f0f0f0; padding: 10px; margin: 10px 0; }
    .educational { background: #e3f2fd; padding: 10px; margin: 10px 0; }
    .high { color: #d32f2f; }
    .medium { color: #f57c00; }
    .low { color: #388e3c; }
  </style>
</head>
<body>
  <h1>${explanation.summary}</h1>
  <p class="confidence">Confidence: ${(explanation.confidence * 100).toFixed(0)}%</p>

  <h2>Analysis</h2>
  ${explanation.reasoning.map(r => `<p>${r}</p>`).join('')}

  ${
    explanation.evidence.length > 0
      ? `
  <h2>Evidence</h2>
  ${explanation.evidence
    .map(
      e => `
    <div class="evidence ${e.importance}">
      <strong>${e.description}</strong> (${e.importance} importance)
    </div>
  `
    )
    .join('')}
  `
      : ''
  }

  ${
    explanation.educationalNotes?.length
      ? `
  <h2>Learning Notes</h2>
  <div class="educational">
    ${explanation.educationalNotes.map(n => `<p>${n}</p>`).join('')}
  </div>
  `
      : ''
  }
</body>
</html>`;
  }
}

interface ExplanationTemplate {
  sections: string[];
  tone: 'technical' | 'educational' | 'balanced' | 'serious';
  includeEvidence: boolean;
  includeVisualizations: boolean;
}

// Export for use in other modules
export default ExplanationEngine;
