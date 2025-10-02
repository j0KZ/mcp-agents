import { readFile } from 'fs/promises';
import { CodeParser } from './parser.js';
export class TestGenerator {
    parser;
    constructor() {
        this.parser = new CodeParser();
    }
    /**
     * Generate comprehensive tests for a source file
     */
    async generateTests(filePath, config = {}) {
        const framework = config.framework || 'jest';
        const content = await readFile(filePath, 'utf-8');
        const { functions, classes } = this.parser.parseCode(content);
        const suites = [];
        // Generate tests for functions
        for (const func of functions) {
            const suite = this.generateFunctionTestSuite(func, config);
            suites.push(suite);
        }
        // Generate tests for classes
        for (const cls of classes) {
            const suite = this.generateClassTestSuite(cls, config);
            suites.push(suite);
        }
        const fullTestCode = this.generateTestFile(filePath, suites, framework);
        const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
        const estimatedCoverage = this.estimateCoverage(functions, classes, suites);
        return {
            sourceFile: filePath,
            testFile: this.getTestFilePath(filePath, framework),
            framework,
            suites,
            fullTestCode,
            estimatedCoverage,
            totalTests,
        };
    }
    /**
     * Generate test suite for a function
     */
    generateFunctionTestSuite(func, config) {
        const tests = [];
        // Happy path test
        tests.push({
            name: `should ${func.name} with valid inputs`,
            type: 'happy-path',
            code: this.generateHappyPathTest(func),
            description: `Test ${func.name} with typical valid inputs`,
        });
        // Edge cases
        if (config.includeEdgeCases !== false) {
            tests.push(...this.generateEdgeCaseTests(func));
        }
        // Error cases
        if (config.includeErrorCases !== false) {
            tests.push(...this.generateErrorCaseTests(func));
        }
        return {
            describe: `${func.name}()`,
            tests,
        };
    }
    /**
     * Generate test suite for a class
     */
    generateClassTestSuite(cls, config) {
        const tests = [];
        // Constructor test
        if (cls.constructor) {
            tests.push({
                name: `should create instance of ${cls.name}`,
                type: 'happy-path',
                code: this.generateConstructorTest(cls),
                description: `Test ${cls.name} instantiation`,
            });
        }
        // Method tests
        for (const method of cls.methods) {
            tests.push({
                name: `should ${method.name}`,
                type: 'happy-path',
                code: this.generateMethodTest(cls, method),
                description: `Test ${cls.name}.${method.name}()`,
            });
            // Edge cases for methods
            if (config.includeEdgeCases !== false) {
                tests.push(...this.generateMethodEdgeCases(cls, method));
            }
        }
        return {
            describe: `${cls.name} class`,
            tests,
            setup: `let instance: ${cls.name};`,
        };
    }
    /**
     * Generate happy path test
     */
    generateHappyPathTest(func) {
        const params = func.params.map(p => this.generateMockValue(p)).join(', ');
        const expectation = func.async
            ? `await expect(${func.name}(${params})).resolves.toBeDefined()`
            : `expect(${func.name}(${params})).toBeDefined()`;
        return expectation;
    }
    /**
     * Generate edge case tests
     */
    generateEdgeCaseTests(func) {
        const tests = [];
        // Empty/null parameters
        if (func.params.length > 0) {
            tests.push({
                name: `should handle empty/null parameters`,
                type: 'edge-case',
                code: func.async
                    ? `await expect(${func.name}(null)).resolves.not.toThrow()`
                    : `expect(() => ${func.name}(null)).not.toThrow()`,
                description: `Test ${func.name} with null input`,
            });
        }
        // Large inputs
        tests.push({
            name: `should handle large inputs`,
            type: 'edge-case',
            code: func.async
                ? `await expect(${func.name}(${'x'.repeat(1000)})).resolves.toBeDefined()`
                : `expect(${func.name}(${'x'.repeat(1000)})).toBeDefined()`,
            description: `Test ${func.name} with large input`,
        });
        return tests;
    }
    /**
     * Generate error case tests
     */
    generateErrorCaseTests(func) {
        const tests = [];
        // Invalid type
        if (func.params.length > 0) {
            tests.push({
                name: `should throw on invalid input type`,
                type: 'error-case',
                code: func.async
                    ? `await expect(${func.name}(undefined)).rejects.toThrow()`
                    : `expect(() => ${func.name}(undefined)).toThrow()`,
                description: `Test ${func.name} error handling with invalid type`,
            });
        }
        return tests;
    }
    /**
     * Generate constructor test
     */
    generateConstructorTest(cls) {
        const params = cls.constructor?.params.map(p => this.generateMockValue(p)).join(', ') || '';
        return `const instance = new ${cls.name}(${params});\nexpect(instance).toBeInstanceOf(${cls.name});`;
    }
    /**
     * Generate method test
     */
    generateMethodTest(cls, method) {
        const params = method.params.map(p => this.generateMockValue(p)).join(', ');
        const constructorParams = cls.constructor?.params.map(p => this.generateMockValue(p)).join(', ') || '';
        return method.async
            ? `const instance = new ${cls.name}(${constructorParams});\nawait expect(instance.${method.name}(${params})).resolves.toBeDefined();`
            : `const instance = new ${cls.name}(${constructorParams});\nexpect(instance.${method.name}(${params})).toBeDefined();`;
    }
    /**
     * Generate method edge cases
     */
    generateMethodEdgeCases(cls, method) {
        return [{
                name: `should handle edge cases in ${method.name}`,
                type: 'edge-case',
                code: `const instance = new ${cls.name}();\nexpect(() => instance.${method.name}()).not.toThrow();`,
                description: `Test ${method.name} edge cases`,
            }];
    }
    /**
     * Generate complete test file
     */
    generateTestFile(sourceFile, suites, framework) {
        const importPath = sourceFile.replace(/\.(ts|js)$/, '');
        const imports = this.generateImports(framework, importPath);
        const suitesCode = suites.map(s => this.generateSuiteCode(s, framework)).join('\n\n');
        return `${imports}\n\n${suitesCode}`;
    }
    /**
     * Generate import statements
     */
    generateImports(framework, importPath) {
        const imports = {
            jest: `import { describe, it, expect, beforeEach } from '@jest/globals';\nimport * as target from './${importPath}';`,
            vitest: `import { describe, it, expect, beforeEach } from 'vitest';\nimport * as target from './${importPath}';`,
            mocha: `import { describe, it, before } from 'mocha';\nimport { expect } from 'chai';\nimport * as target from './${importPath}';`,
            ava: `import test from 'ava';\nimport * as target from './${importPath}';`,
        };
        return imports[framework];
    }
    /**
     * Generate suite code
     */
    generateSuiteCode(suite, framework) {
        const setup = suite.setup ? `\n  beforeEach(() => {\n    ${suite.setup}\n  });\n` : '';
        const tests = suite.tests.map(t => this.generateTestCode(t, framework)).join('\n\n');
        if (framework === 'ava') {
            return tests; // AVA doesn't use describe blocks
        }
        return `describe('${suite.describe}', () => {${setup}\n${tests}\n});`;
    }
    /**
     * Generate individual test code
     */
    generateTestCode(test, framework) {
        if (framework === 'ava') {
            return `test('${test.name}', async (t) => {\n  ${test.code}\n});`;
        }
        const itFn = test.code.includes('await') ? 'it' : 'it';
        return `  ${itFn}('${test.name}', async () => {\n    ${test.code}\n  });`;
    }
    /**
     * Get test file path
     */
    getTestFilePath(sourceFile, framework) {
        return sourceFile.replace(/\.(ts|js)$/, '.test.$1');
    }
    /**
     * Estimate test coverage
     */
    estimateCoverage(functions, classes, suites) {
        const totalItems = functions.length + classes.reduce((sum, c) => sum + c.methods.length + 1, 0);
        const testedItems = suites.length;
        if (totalItems === 0)
            return 0;
        const baseCoverage = (testedItems / totalItems) * 100;
        // Boost for edge cases and error cases
        const hasEdgeCases = suites.some(s => s.tests.some(t => t.type === 'edge-case'));
        const hasErrorCases = suites.some(s => s.tests.some(t => t.type === 'error-case'));
        let coverage = baseCoverage;
        if (hasEdgeCases)
            coverage += 10;
        if (hasErrorCases)
            coverage += 10;
        return Math.min(100, Math.round(coverage));
    }
    /**
     * Generate mock value based on parameter name
     */
    generateMockValue(param) {
        const lower = param.toLowerCase();
        if (lower.includes('id'))
            return '1';
        if (lower.includes('name'))
            return '"test"';
        if (lower.includes('email'))
            return '"test@example.com"';
        if (lower.includes('age'))
            return '25';
        if (lower.includes('count'))
            return '10';
        if (lower.includes('array') || lower.includes('list'))
            return '[]';
        if (lower.includes('object') || lower.includes('data'))
            return '{}';
        if (lower.includes('bool') || lower.includes('is') || lower.includes('has'))
            return 'true';
        return '"mockValue"';
    }
}
//# sourceMappingURL=generator.js.map