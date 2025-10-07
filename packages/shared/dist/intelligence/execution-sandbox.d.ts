/**
 * Execution Sandbox for Safe Code Running
 * Phase 2.2 of Master Evolution Plan
 *
 * This module provides a secure environment to execute code and observe
 * its behavior, learning from actual runtime characteristics rather than
 * just static analysis.
 */
import { EventEmitter } from 'events';
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
export declare class ExecutionSandbox extends EventEmitter {
    private performanceTracker;
    private messageBus;
    private executionHistory;
    private learningDatabase;
    constructor(performanceTracker: PerformanceTracker, messageBus: MessageBus);
    /**
     * Execute code in a secure sandbox and analyze its behavior
     */
    execute(code: string, testCases?: TestCase[], options?: {
        timeout?: number;
        memoryLimit?: number;
        instrumentCode?: boolean;
        captureConsole?: boolean;
        mockModules?: Record<string, any>;
    }): Promise<ExecutionResult>;
    /**
     * Run code in isolated VM
     */
    private runInSandbox;
    /**
     * Instrument code for coverage and behavior tracking
     */
    private instrumentCode;
    /**
     * Create proxy for console to capture output
     */
    private createConsoleProxy;
    /**
     * Create proxy for timers to track async operations
     */
    private createTimerProxy;
    /**
     * Create proxy for network operations
     */
    private createNetworkProxy;
    /**
     * Prepare test case inputs for sandbox
     */
    private prepareInputs;
    /**
     * Extract coverage data
     */
    private extractCoverage;
    /**
     * Calculate CPU usage
     */
    private calculateCPUUsage;
    /**
     * Analyze execution results and extract learnings
     */
    private analyzeExecution;
    /**
     * Identify common error patterns
     */
    private identifyErrorPattern;
    /**
     * Detect execution patterns
     */
    private detectExecutionPattern;
    /**
     * Aggregate multiple execution results
     */
    private aggregateResults;
    /**
     * Consolidate and deduplicate learnings
     */
    private consolidateLearnings;
    /**
     * Store learnings for future reference
     */
    private storeLearning;
    /**
     * Simple hash function for code
     */
    private hashCode;
    /**
     * Get learnings for similar code
     */
    getSimilarLearnings(code: string): Promise<Learning[]>;
    /**
     * Execute with learning - uses past learnings to optimize
     */
    executeWithLearning(code: string, testCases?: TestCase[]): Promise<ExecutionResult>;
}
export default ExecutionSandbox;
//# sourceMappingURL=execution-sandbox.d.ts.map