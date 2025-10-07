/**
 * Execution Sandbox for Safe Code Running
 * Phase 2.2 of Master Evolution Plan
 *
 * This module provides a secure environment to execute code and observe
 * its behavior, learning from actual runtime characteristics rather than
 * just static analysis.
 */

// @ts-ignore - vm2 types not available
import { VM } from 'vm2';
import { Worker } from 'worker_threads';
import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { PerformanceTracker } from '../metrics/performance-tracker.js';
import { MessageBus } from '../communication/message-bus.js';

export interface ExecutionResult {
  success: boolean;
  result?: any;
  error?: {
    type: string;
    message: string;
    stack?: string;
  };
  metrics: {
    executionTime: number;
    memoryUsed: number;
    cpuUsage: number;
  };
  behavior: {
    functionsCalld: string[];
    variablesMutated: string[];
    asyncOperations: number;
    exceptions: any[];
    sideEffects: SideEffect[];
  };
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
  };
  learnings: Learning[];
}

export interface SideEffect {
  type: 'console' | 'file' | 'network' | 'database' | 'global' | 'timer';
  operation: string;
  data?: any;
  timestamp: number;
  risk: 'low' | 'medium' | 'high';
}

export interface Learning {
  type: 'performance' | 'behavior' | 'error' | 'pattern' | 'optimization';
  insight: string;
  confidence: number;
  recommendation?: string;
}

export interface TestCase {
  inputs: any[];
  expectedOutput?: any;
  expectedBehavior?: {
    shouldThrow?: boolean;
    sideEffects?: string[];
    performance?: {
      maxTime?: number;
      maxMemory?: number;
    };
  };
}

export class ExecutionSandbox extends EventEmitter {
  private performanceTracker: PerformanceTracker;
  private messageBus: MessageBus;
  private executionHistory: Map<string, ExecutionResult[]> = new Map();
  private learningDatabase: Map<string, Learning[]> = new Map();

  constructor(performanceTracker: PerformanceTracker, messageBus: MessageBus) {
    super();
    this.performanceTracker = performanceTracker;
    this.messageBus = messageBus;
  }

  /**
   * Execute code in a secure sandbox and analyze its behavior
   */
  async execute(
    code: string,
    testCases: TestCase[] = [],
    options: {
      timeout?: number;
      memoryLimit?: number;
      instrumentCode?: boolean;
      captureConsole?: boolean;
      mockModules?: Record<string, any>;
    } = {}
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const results: ExecutionResult[] = [];

    // Default options
    const opts = {
      timeout: options.timeout || 5000,
      memoryLimit: options.memoryLimit || 128 * 1024 * 1024, // 128MB
      instrumentCode: options.instrumentCode ?? true,
      captureConsole: options.captureConsole ?? true,
      mockModules: options.mockModules || {},
    };

    // Instrument code if requested
    let instrumentedCode = code;
    let coverage: any = null;
    if (opts.instrumentCode) {
      const instrumentation = await this.instrumentCode(code);
      instrumentedCode = instrumentation.code;
      coverage = instrumentation.coverage;
    }

    // Run test cases
    for (const testCase of testCases.length > 0 ? testCases : [{ inputs: [] }]) {
      try {
        const result = await this.runInSandbox(instrumentedCode, testCase, opts, coverage);
        results.push(result);

        // Learn from execution
        const learnings = await this.analyzeExecution(result, code, testCase);
        result.learnings = learnings;

        // Store learnings
        this.storeLearning(code, learnings);

        // Share insights with other tools
        if (learnings.length > 0) {
          await this.messageBus.shareInsight('execution-sandbox', {
            type: 'execution-learnings',
            data: { learnings, code: code.substring(0, 200) },
            confidence: Math.max(...learnings.map(l => l.confidence)),
            affects: ['test-generator', 'smart-reviewer', 'refactor-assistant'],
          });
        }
      } catch (error: any) {
        results.push({
          success: false,
          error: {
            type: error.constructor.name,
            message: error.message,
            stack: error.stack,
          },
          metrics: {
            executionTime: performance.now() - startTime,
            memoryUsed: 0,
            cpuUsage: 0,
          },
          behavior: {
            functionsCalld: [],
            variablesMutated: [],
            asyncOperations: 0,
            exceptions: [error],
            sideEffects: [],
          },
          learnings: [],
        });
      }
    }

    // Aggregate results
    const aggregated = this.aggregateResults(results);

    // Track performance
    await this.performanceTracker.track({
      toolId: 'execution-sandbox',
      operation: 'execute',
      timestamp: new Date(),
      duration: performance.now() - startTime,
      success: aggregated.success,
      confidence:
        aggregated.learnings.length > 0
          ? Math.max(...aggregated.learnings.map(l => l.confidence))
          : 0,
      input: {
        type: 'code',
        size: code.length,
        complexity: 0,
      },
      output: {
        type: 'execution-result',
        size: aggregated.learnings.length,
        quality: aggregated.success ? 100 : 0,
      },
    });

    return aggregated;
  }

  /**
   * Run code in isolated VM
   */
  private async runInSandbox(
    code: string,
    testCase: TestCase,
    options: any,
    coverage: any
  ): Promise<ExecutionResult> {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const behavior: ExecutionResult['behavior'] = {
      functionsCalld: [],
      variablesMutated: [],
      asyncOperations: 0,
      exceptions: [],
      sideEffects: [],
    };

    // Create VM with restrictions
    const vm = new VM({
      timeout: options.timeout,
      sandbox: {
        // Provide controlled environment
        console: options.captureConsole ? this.createConsoleProxy(behavior) : console,
        setTimeout: this.createTimerProxy('setTimeout', behavior),
        setInterval: this.createTimerProxy('setInterval', behavior),
        fetch: this.createNetworkProxy('fetch', behavior),
        require: (module: string) => {
          if (options.mockModules[module]) {
            behavior.functionsCalld.push(`require('${module}')`);
            return options.mockModules[module];
          }
          throw new Error(`Module '${module}' not allowed in sandbox`);
        },
        // Test case inputs
        ...this.prepareInputs(testCase.inputs),
        // Coverage tracking
        __coverage__: coverage,
      },
    });

    try {
      // Execute code
      const result = vm.run(code);

      // Handle async results
      let finalResult = result;
      if (result && typeof result.then === 'function') {
        behavior.asyncOperations++;
        finalResult = await Promise.race([
          result,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Async timeout')), options.timeout)
          ),
        ]);
      }

      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;

      return {
        success: true,
        result: finalResult,
        metrics: {
          executionTime: endTime - startTime,
          memoryUsed: endMemory - startMemory,
          cpuUsage: this.calculateCPUUsage(startTime, endTime),
        },
        behavior,
        coverage: coverage ? this.extractCoverage(coverage) : undefined,
        learnings: [],
      };
    } catch (error: any) {
      behavior.exceptions.push({
        type: error.constructor.name,
        message: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        error: {
          type: error.constructor.name,
          message: error.message,
          stack: error.stack,
        },
        metrics: {
          executionTime: performance.now() - startTime,
          memoryUsed: process.memoryUsage().heapUsed - startMemory,
          cpuUsage: 0,
        },
        behavior,
        learnings: [],
      };
    }
  }

  /**
   * Instrument code for coverage and behavior tracking
   */
  private async instrumentCode(code: string): Promise<{
    code: string;
    coverage: any;
  }> {
    // Use istanbul-lib-instrument for coverage
    // For now, return a simplified version
    const coverage = {
      statements: {},
      branches: {},
      functions: {},
    };

    // Add basic instrumentation
    const instrumented = code.replace(/function\s+(\w+)/g, (match, name) => {
      (coverage.functions as any)[name] = 0;
      return `function ${name}`;
    });

    return { code: instrumented, coverage };
  }

  /**
   * Create proxy for console to capture output
   */
  private createConsoleProxy(behavior: ExecutionResult['behavior']) {
    const handler =
      (level: string) =>
      (...args: any[]) => {
        behavior.sideEffects.push({
          type: 'console',
          operation: level,
          data: args,
          timestamp: Date.now(),
          risk: 'low',
        });
      };

    return {
      log: handler('log'),
      error: handler('error'),
      warn: handler('warn'),
      info: handler('info'),
      debug: handler('debug'),
    };
  }

  /**
   * Create proxy for timers to track async operations
   */
  private createTimerProxy(name: string, behavior: ExecutionResult['behavior']) {
    return (callback: Function, delay: number, ...args: any[]) => {
      behavior.asyncOperations++;
      behavior.sideEffects.push({
        type: 'timer',
        operation: name,
        data: { delay },
        timestamp: Date.now(),
        risk: 'low',
      });

      // Don't actually set timers in sandbox
      return null;
    };
  }

  /**
   * Create proxy for network operations
   */
  private createNetworkProxy(name: string, behavior: ExecutionResult['behavior']) {
    return (url: string, options?: any) => {
      behavior.sideEffects.push({
        type: 'network',
        operation: name,
        data: { url, options },
        timestamp: Date.now(),
        risk: 'high',
      });

      // Return mock response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      });
    };
  }

  /**
   * Prepare test case inputs for sandbox
   */
  private prepareInputs(inputs: any[]): Record<string, any> {
    const prepared: Record<string, any> = {};

    inputs.forEach((input, index) => {
      prepared[`arg${index}`] = input;
      prepared[`input${index}`] = input;
    });

    // Common test data patterns
    if (inputs.length > 0) {
      prepared.input = inputs[0];
      prepared.data = inputs[0];
      prepared.value = inputs[0];
    }

    return prepared;
  }

  /**
   * Extract coverage data
   */
  private extractCoverage(coverage: any): ExecutionResult['coverage'] {
    const statements = Object.values(coverage.statements).filter(Boolean).length;
    const branches = Object.values(coverage.branches).filter(Boolean).length;
    const functions = Object.values(coverage.functions).filter(Boolean).length;

    const total =
      Object.keys(coverage.statements).length +
      Object.keys(coverage.branches).length +
      Object.keys(coverage.functions).length;

    return {
      statements: total > 0 ? (statements / Object.keys(coverage.statements).length) * 100 : 0,
      branches: total > 0 ? (branches / Object.keys(coverage.branches).length) * 100 : 0,
      functions: total > 0 ? (functions / Object.keys(coverage.functions).length) * 100 : 0,
    };
  }

  /**
   * Calculate CPU usage
   */
  private calculateCPUUsage(startTime: number, endTime: number): number {
    // Simplified CPU usage calculation
    const duration = endTime - startTime;
    const maxDuration = 1000; // 1 second baseline
    return Math.min((duration / maxDuration) * 100, 100);
  }

  /**
   * Analyze execution results and extract learnings
   */
  private async analyzeExecution(
    result: ExecutionResult,
    code: string,
    testCase: TestCase
  ): Promise<Learning[]> {
    const learnings: Learning[] = [];

    // Performance analysis
    if (result.metrics.executionTime > 100) {
      learnings.push({
        type: 'performance',
        insight: `Code takes ${result.metrics.executionTime.toFixed(2)}ms to execute`,
        confidence: 0.95,
        recommendation:
          result.metrics.executionTime > 1000
            ? 'Consider optimizing for better performance'
            : undefined,
      });
    }

    // Memory analysis
    if (result.metrics.memoryUsed > 10 * 1024 * 1024) {
      // 10MB
      learnings.push({
        type: 'performance',
        insight: `High memory usage: ${(result.metrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`,
        confidence: 0.9,
        recommendation: 'Consider memory optimization',
      });
    }

    // Behavior patterns
    if (result.behavior.asyncOperations > 0) {
      learnings.push({
        type: 'behavior',
        insight: `Code performs ${result.behavior.asyncOperations} async operations`,
        confidence: 1.0,
      });
    }

    // Error patterns
    if (!result.success && result.error) {
      const errorPattern = this.identifyErrorPattern(result.error);
      if (errorPattern) {
        learnings.push({
          type: 'error',
          insight: errorPattern.insight,
          confidence: errorPattern.confidence,
          recommendation: errorPattern.fix,
        });
      }
    }

    // Side effect analysis
    const highRiskEffects = result.behavior.sideEffects.filter(e => e.risk === 'high');
    if (highRiskEffects.length > 0) {
      learnings.push({
        type: 'behavior',
        insight: `Code has ${highRiskEffects.length} high-risk side effects`,
        confidence: 0.95,
        recommendation: 'Review side effects for security implications',
      });
    }

    // Pattern detection
    if (result.success && result.result !== undefined) {
      const pattern = this.detectExecutionPattern(code, result.result, testCase);
      if (pattern) {
        learnings.push({
          type: 'pattern',
          insight: pattern.insight,
          confidence: pattern.confidence,
          recommendation: pattern.recommendation,
        });
      }
    }

    return learnings;
  }

  /**
   * Identify common error patterns
   */
  private identifyErrorPattern(error: { type: string; message: string }): {
    insight: string;
    confidence: number;
    fix?: string;
  } | null {
    const patterns = [
      {
        match: /TypeError.*undefined/i,
        insight: 'Null/undefined reference error',
        confidence: 0.95,
        fix: 'Add null checks before accessing properties',
      },
      {
        match: /RangeError.*Maximum call stack/i,
        insight: 'Stack overflow from infinite recursion',
        confidence: 1.0,
        fix: 'Add base case to recursive function',
      },
      {
        match: /SyntaxError/i,
        insight: 'Code has syntax errors',
        confidence: 1.0,
        fix: 'Fix syntax before execution',
      },
      {
        match: /ReferenceError.*not defined/i,
        insight: 'Variable or function not defined',
        confidence: 0.95,
        fix: 'Ensure all variables are declared',
      },
    ];

    for (const pattern of patterns) {
      if (pattern.match.test(`${error.type} ${error.message}`)) {
        return {
          insight: pattern.insight,
          confidence: pattern.confidence,
          fix: pattern.fix,
        };
      }
    }

    return null;
  }

  /**
   * Detect execution patterns
   */
  private detectExecutionPattern(
    code: string,
    result: any,
    testCase: TestCase
  ): { insight: string; confidence: number; recommendation?: string } | null {
    // Pure function detection
    if (testCase.inputs.length > 0 && !code.includes('this.') && !code.includes('global')) {
      return {
        insight: 'Function appears to be pure (no side effects)',
        confidence: 0.85,
        recommendation: 'Good practice! Pure functions are easier to test',
      };
    }

    // Validation function detection
    if (typeof result === 'boolean' && /validate|check|is[A-Z]/i.test(code)) {
      return {
        insight: 'Function performs validation',
        confidence: 0.9,
        recommendation: 'Ensure all edge cases are handled',
      };
    }

    // Transformation function detection
    if (typeof result === 'object' && testCase.inputs.length > 0) {
      return {
        insight: 'Function transforms data',
        confidence: 0.75,
      };
    }

    return null;
  }

  /**
   * Aggregate multiple execution results
   */
  private aggregateResults(results: ExecutionResult[]): ExecutionResult {
    if (results.length === 0) {
      throw new Error('No results to aggregate');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Aggregate metrics
    const avgMetrics = {
      executionTime: results.reduce((sum, r) => sum + r.metrics.executionTime, 0) / results.length,
      memoryUsed: results.reduce((sum, r) => sum + r.metrics.memoryUsed, 0) / results.length,
      cpuUsage: results.reduce((sum, r) => sum + r.metrics.cpuUsage, 0) / results.length,
    };

    // Aggregate behavior
    const allSideEffects: SideEffect[] = [];
    const allExceptions: any[] = [];
    let totalAsync = 0;

    for (const result of results) {
      allSideEffects.push(...result.behavior.sideEffects);
      allExceptions.push(...result.behavior.exceptions);
      totalAsync += result.behavior.asyncOperations;
    }

    // Aggregate learnings
    const allLearnings: Learning[] = [];
    for (const result of results) {
      allLearnings.push(...result.learnings);
    }

    // Success if majority succeed
    const successCount = results.filter(r => r.success).length;
    const success = successCount > results.length / 2;

    return {
      success,
      metrics: avgMetrics,
      behavior: {
        functionsCalld: [...new Set(results.flatMap(r => r.behavior.functionsCalld))],
        variablesMutated: [...new Set(results.flatMap(r => r.behavior.variablesMutated))],
        asyncOperations: totalAsync,
        exceptions: allExceptions,
        sideEffects: allSideEffects,
      },
      learnings: this.consolidateLearnings(allLearnings),
    };
  }

  /**
   * Consolidate and deduplicate learnings
   */
  private consolidateLearnings(learnings: Learning[]): Learning[] {
    const consolidated = new Map<string, Learning>();

    for (const learning of learnings) {
      const key = `${learning.type}-${learning.insight}`;
      const existing = consolidated.get(key);

      if (!existing || existing.confidence < learning.confidence) {
        consolidated.set(key, learning);
      }
    }

    return Array.from(consolidated.values());
  }

  /**
   * Store learnings for future reference
   */
  private storeLearning(code: string, learnings: Learning[]): void {
    const codeHash = this.hashCode(code);
    const existing = this.learningDatabase.get(codeHash) || [];
    this.learningDatabase.set(codeHash, [...existing, ...learnings]);

    // Store execution history
    const history = this.executionHistory.get(codeHash) || [];
    this.executionHistory.set(codeHash, history);
  }

  /**
   * Simple hash function for code
   */
  private hashCode(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get learnings for similar code
   */
  async getSimilarLearnings(code: string): Promise<Learning[]> {
    const codeHash = this.hashCode(code);
    return this.learningDatabase.get(codeHash) || [];
  }

  /**
   * Execute with learning - uses past learnings to optimize
   */
  async executeWithLearning(code: string, testCases: TestCase[] = []): Promise<ExecutionResult> {
    // Get past learnings
    const pastLearnings = await this.getSimilarLearnings(code);

    // Optimize based on learnings
    const options: any = {};

    // Adjust timeout based on past performance
    const perfLearning = pastLearnings.find(l => l.type === 'performance');
    if (perfLearning && perfLearning.insight.includes('ms to execute')) {
      const time = parseFloat(perfLearning.insight.match(/(\d+\.?\d*)ms/)![1]);
      options.timeout = Math.max(time * 2, 5000);
    }

    // Adjust memory based on past usage
    const memLearning = pastLearnings.find(
      l => l.type === 'performance' && l.insight.includes('memory usage')
    );
    if (memLearning) {
      const mem = parseFloat(memLearning.insight.match(/(\d+\.?\d*)MB/)![1]);
      options.memoryLimit = Math.max(mem * 2, 128) * 1024 * 1024;
    }

    // Execute with optimized settings
    const result = await this.execute(code, testCases, options);

    // Add past learnings to result
    result.learnings = [
      ...result.learnings,
      ...pastLearnings.map(l => ({
        ...l,
        confidence: l.confidence * 0.8, // Reduce confidence for past learnings
      })),
    ];

    return result;
  }
}

// Export for use in other modules
export default ExecutionSandbox;
