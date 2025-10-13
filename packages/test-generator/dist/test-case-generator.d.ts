/**
 * Test case generation logic extracted from generator.ts
 * Handles happy path, edge cases, and error cases for functions and classes
 */
import { FunctionInfo, ClassInfo, TestCase } from './types.js';
export declare class TestCaseGenerator {
    /**
     * Generate happy path test for a function
     */
    generateHappyPathTest(func: FunctionInfo): string;
    /**
     * Generate smart assertion based on function name and characteristics
     */
    private generateSmartAssertion;
    /**
     * Generate edge case tests for a function
     */
    generateEdgeCaseTests(func: FunctionInfo): TestCase[];
    /**
     * Infer parameter type from parameter name
     */
    private inferParameterType;
    /**
     * Generate error case tests for a function
     */
    generateErrorCaseTests(func: FunctionInfo): TestCase[];
    /**
     * Generate constructor test for a class
     */
    generateConstructorTest(cls: ClassInfo): string;
    /**
     * Generate test for a class method
     */
    generateMethodTest(cls: ClassInfo, method: FunctionInfo): string;
    /**
     * Generate edge case tests for a class method
     */
    generateMethodEdgeCases(cls: ClassInfo, method: FunctionInfo): TestCase[];
    /**
     * Generate mock value for a parameter
     */
    generateMockValue(param: string): string;
}
//# sourceMappingURL=test-case-generator.d.ts.map