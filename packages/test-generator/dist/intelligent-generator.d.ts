/**
 * Intelligent Test Generator - Phase 1 of Evolution Plan
 * This will replace the current broken generator with context-aware generation
 */
import { TestSuite, TestFramework } from './types.js';
export declare class IntelligentTestGenerator {
    private metrics;
    /**
     * Generate tests with understanding of code purpose
     */
    generateSmartTests(filePath: string, content: string, framework?: TestFramework): Promise<{
        code: string;
        suite: TestSuite;
        confidence: number;
        explanation: string;
    }>;
    /**
     * Extract function with context understanding
     */
    private extractFunctionContext;
    /**
     * Generate intelligent tests for a function
     */
    private generateFunctionTests;
    /**
     * Generate validation-specific tests
     */
    private generateValidationTests;
    /**
     * Generate calculation-specific tests
     */
    private generateCalculationTests;
    /**
     * Generate async-specific tests
     */
    private generateAsyncTests;
    /**
     * Generate intelligent mock values based on parameter names and types
     */
    private generateSmartMock;
    /**
     * Generate the test file with proper imports
     */
    private generateTestFile;
    /**
     * Generate framework-specific imports
     */
    private generateImports;
    /**
     * Helper methods
     */
    private detectFunctionPurpose;
    private detectAsyncPattern;
    private inferReturnType;
    private calculateComplexity;
    private extractParam;
    private generateValidInput;
    private generateInvalidInput;
    private generateMockParams;
    private generateSetup;
    private generateEdgeCases;
    private generateErrorCases;
    private generateGenericTests;
    private generateCrudTests;
    private extractClassContext;
    private generateClassTests;
    private generateSuiteCode;
    private calculateConfidence;
    private explainGeneration;
    /**
     * Get metrics for performance tracking
     */
    getMetrics(): {
        successRate: number;
        generated: number;
        successful: number;
        failed: number;
        patterns: Map<string, number>;
    };
}
//# sourceMappingURL=intelligent-generator.d.ts.map