import { GeneratedTest, TestConfig } from './types.js';
export declare class TestGenerator {
    private parser;
    constructor();
    /**
     * Generate comprehensive tests for a source file
     */
    generateTests(filePath: string, config?: TestConfig): Promise<GeneratedTest>;
    /**
     * Generate test suite for a function
     */
    private generateFunctionTestSuite;
    /**
     * Generate test suite for a class
     */
    private generateClassTestSuite;
    /**
     * Generate happy path test
     */
    private generateHappyPathTest;
    /**
     * Generate edge case tests
     */
    private generateEdgeCaseTests;
    /**
     * Generate error case tests
     */
    private generateErrorCaseTests;
    /**
     * Generate constructor test
     */
    private generateConstructorTest;
    /**
     * Generate method test
     */
    private generateMethodTest;
    /**
     * Generate method edge cases
     */
    private generateMethodEdgeCases;
    /**
     * Generate complete test file
     */
    private generateTestFile;
    /**
     * Generate import statements
     */
    private generateImports;
    /**
     * Generate suite code
     */
    private generateSuiteCode;
    /**
     * Generate individual test code
     */
    private generateTestCode;
    /**
     * Get test file path
     */
    private getTestFilePath;
    /**
     * Estimate test coverage
     */
    private estimateCoverage;
    /**
     * Generate mock value based on parameter name
     */
    private generateMockValue;
}
//# sourceMappingURL=generator.d.ts.map