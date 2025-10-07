/**
 * Intelligent Test Generator - Phase 1 of Evolution Plan
 * This will replace the current broken generator with context-aware generation
 */
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import path from 'path';
const traverse = _traverse.default || _traverse;
/**
 * Pattern recognition for function purposes
 */
const FUNCTION_PATTERNS = {
    // Data operations
    validation: /^(validate|check|verify|is|has|can)/i,
    transformation: /^(transform|convert|parse|format|serialize|map)/i,
    calculation: /^(calculate|compute|sum|average|total)/i,
    // CRUD operations
    creation: /^(create|add|insert|new|init|generate)/i,
    reading: /^(get|fetch|find|load|read|query|search)/i,
    update: /^(update|modify|edit|patch|set|change)/i,
    deletion: /^(delete|remove|destroy|clear|reset)/i,
    // Control flow
    async: /^(fetch|load|save|call|request|send)/i,
    event: /^(on|handle|emit|trigger|dispatch)/i,
    // Utilities
    helper: /^(helper|util|format|build|make)/i,
    comparison: /^(compare|equals|matches|diff)/i,
};
/**
 * Type patterns for intelligent mocking
 */
const TYPE_PATTERNS = {
    id: /id$/i,
    email: /email/i,
    url: /url/i,
    date: /date|time/i,
    phone: /phone/i,
    password: /password/i,
    token: /token|key|secret/i,
    count: /count|number|amount|total/i,
    flag: /^is|^has|^can|enabled|active/i,
    array: /list|items|array/i,
    object: /data|config|options|settings/i,
};
export class IntelligentTestGenerator {
    metrics = {
        generated: 0,
        successful: 0,
        failed: 0,
        patterns: new Map(),
    };
    /**
     * Generate tests with understanding of code purpose
     */
    async generateSmartTests(filePath, content, framework = 'vitest') {
        // Parse code to understand structure
        const ast = parse(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
            errorRecovery: true,
        });
        const functions = [];
        const classes = [];
        // Extract functions and classes with context
        traverse(ast, {
            FunctionDeclaration: (nodePath) => {
                const func = this.extractFunctionContext(nodePath.node);
                if (func)
                    functions.push(func);
            },
            ClassDeclaration: (nodePath) => {
                const cls = this.extractClassContext(nodePath.node);
                if (cls)
                    classes.push(cls);
            },
            VariableDeclarator: (nodePath) => {
                const { id, init } = nodePath.node;
                if (init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression') {
                    const func = this.extractFunctionContext(init, id.name);
                    if (func)
                        functions.push(func);
                }
            },
        });
        // Generate intelligent test suites
        const suites = [];
        for (const func of functions) {
            const suite = await this.generateFunctionTests(func, filePath);
            suites.push(suite);
            this.metrics.generated += suite.tests.length;
        }
        for (const cls of classes) {
            const suite = await this.generateClassTests(cls, filePath);
            suites.push(suite);
            this.metrics.generated += suite.tests.length;
        }
        // Generate the test file content
        const testCode = this.generateTestFile(filePath, suites, framework);
        // Calculate confidence based on pattern recognition
        const confidence = this.calculateConfidence(functions, classes);
        return {
            code: testCode,
            suite: suites[0] || { describe: 'Empty', tests: [] },
            confidence,
            explanation: this.explainGeneration(functions, classes, suites),
        };
    }
    /**
     * Extract function with context understanding
     */
    extractFunctionContext(node, name) {
        const funcName = name || node.id?.name || 'anonymous';
        const params = node.params.map((p) => this.extractParam(p));
        // Understand function purpose from name
        const purpose = this.detectFunctionPurpose(funcName);
        // Check if async
        const isAsync = node.async || this.detectAsyncPattern(funcName);
        // Detect return type from body
        const returnType = this.inferReturnType(node);
        return {
            name: funcName,
            params,
            returnType,
            async: isAsync,
            line: node.loc?.start.line || 0,
            purpose, // Added context
            complexity: this.calculateComplexity(node), // Added metric
        };
    }
    /**
     * Generate intelligent tests for a function
     */
    async generateFunctionTests(func, filePath) {
        const tests = [];
        const purpose = func.purpose || 'general';
        // Generate based on function purpose
        switch (purpose) {
            case 'validation':
                tests.push(...this.generateValidationTests(func));
                break;
            case 'calculation':
                tests.push(...this.generateCalculationTests(func));
                break;
            case 'async':
                tests.push(...this.generateAsyncTests(func));
                break;
            case 'crud':
                tests.push(...this.generateCrudTests(func));
                break;
            default:
                tests.push(...this.generateGenericTests(func));
        }
        // Add edge cases based on parameters
        tests.push(...this.generateEdgeCases(func));
        // Add error cases
        if (purpose !== 'validation') {
            tests.push(...this.generateErrorCases(func));
        }
        return {
            describe: `${func.name}()`,
            tests,
            setup: this.generateSetup(func),
        };
    }
    /**
     * Generate validation-specific tests
     */
    generateValidationTests(func) {
        const tests = [];
        const funcName = func.name;
        tests.push({
            name: 'should return true for valid input',
            type: 'happy-path',
            code: `
    const validInput = ${this.generateValidInput(func)};
    expect(${funcName}(validInput)).toBe(true);`,
            description: 'Test valid case',
        });
        tests.push({
            name: 'should return false for invalid input',
            type: 'edge-case',
            code: `
    const invalidInput = ${this.generateInvalidInput(func)};
    expect(${funcName}(invalidInput)).toBe(false);`,
            description: 'Test invalid case',
        });
        tests.push({
            name: 'should handle null/undefined',
            type: 'edge-case',
            code: `
    expect(${funcName}(null)).toBe(false);
    expect(${funcName}(undefined)).toBe(false);`,
            description: 'Test null safety',
        });
        return tests;
    }
    /**
     * Generate calculation-specific tests
     */
    generateCalculationTests(func) {
        const tests = [];
        const funcName = func.name;
        tests.push({
            name: 'should calculate correct result',
            type: 'happy-path',
            code: `
    const result = ${funcName}(10, 20);
    expect(result).toBe(30);`,
            description: 'Test basic calculation',
        });
        tests.push({
            name: 'should handle negative numbers',
            type: 'edge-case',
            code: `
    const result = ${funcName}(-10, 20);
    expect(result).toBe(10);`,
            description: 'Test with negatives',
        });
        tests.push({
            name: 'should handle decimal precision',
            type: 'edge-case',
            code: `
    const result = ${funcName}(0.1, 0.2);
    expect(result).toBeCloseTo(0.3, 10);`,
            description: 'Test floating point',
        });
        return tests;
    }
    /**
     * Generate async-specific tests
     */
    generateAsyncTests(func) {
        const tests = [];
        const funcName = func.name;
        tests.push({
            name: 'should resolve with correct data',
            type: 'happy-path',
            code: `
    const result = await ${funcName}(${this.generateMockParams(func)});
    expect(result).toBeDefined();
    expect(result).toHaveProperty('success');`,
            description: 'Test async resolution',
        });
        tests.push({
            name: 'should handle errors gracefully',
            type: 'error-case',
            code: `
    await expect(${funcName}(null)).rejects.toThrow();`,
            description: 'Test error handling',
        });
        tests.push({
            name: 'should timeout appropriately',
            type: 'edge-case',
            code: `
    const promise = ${funcName}(${this.generateMockParams(func)});
    await expect(Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => resolve('timeout'), 5000))
    ])).resolves.not.toBe('timeout');`,
            description: 'Test timeout behavior',
        });
        return tests;
    }
    /**
     * Generate intelligent mock values based on parameter names and types
     */
    generateSmartMock(paramName, paramType) {
        const name = paramName.toLowerCase();
        // Check type patterns
        for (const [pattern, regex] of Object.entries(TYPE_PATTERNS)) {
            if (regex.test(name)) {
                switch (pattern) {
                    case 'id':
                        return '1';
                    case 'email':
                        return '"test@example.com"';
                    case 'url':
                        return '"https://example.com"';
                    case 'date':
                        return 'new Date("2024-01-01")';
                    case 'phone':
                        return '"+1234567890"';
                    case 'password':
                        return '"SecurePass123!"';
                    case 'token':
                        return '"mock-token-123"';
                    case 'count':
                        return '42';
                    case 'flag':
                        return 'true';
                    case 'array':
                        return '[]';
                    case 'object':
                        return '{}';
                }
            }
        }
        // Default based on type hint
        if (paramType) {
            if (paramType.includes('number'))
                return '1';
            if (paramType.includes('string'))
                return '"test"';
            if (paramType.includes('boolean'))
                return 'true';
            if (paramType.includes('[]'))
                return '[]';
        }
        return '"mock-value"';
    }
    /**
     * Generate the test file with proper imports
     */
    generateTestFile(sourceFile, suites, framework) {
        // Fix the import path
        const fileName = path.basename(sourceFile, path.extname(sourceFile));
        const importPath = `../src/${fileName}.js`;
        // Generate framework-specific imports
        const imports = this.generateImports(framework, importPath);
        // Generate test suites
        const suitesCode = suites.map(suite => this.generateSuiteCode(suite, framework)).join('\n\n');
        return `${imports}\n\n${suitesCode}`;
    }
    /**
     * Generate framework-specific imports
     */
    generateImports(framework, importPath) {
        const imports = {
            jest: `import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as target from '${importPath}';`,
            vitest: `import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as target from '${importPath}';`,
            mocha: `import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import * as target from '${importPath}';`,
            ava: `import test from 'ava';
import * as target from '${importPath}';`,
        };
        return imports[framework];
    }
    /**
     * Helper methods
     */
    detectFunctionPurpose(name) {
        for (const [purpose, pattern] of Object.entries(FUNCTION_PATTERNS)) {
            if (pattern.test(name)) {
                return purpose;
            }
        }
        return 'general';
    }
    detectAsyncPattern(name) {
        return FUNCTION_PATTERNS.async.test(name);
    }
    inferReturnType(node) {
        // Simple inference - can be enhanced
        if (node.returnType) {
            return node.returnType.typeAnnotation.type;
        }
        return 'unknown';
    }
    calculateComplexity(node) {
        let complexity = 1;
        traverse(node, {
            IfStatement: () => complexity++,
            ForStatement: () => complexity++,
            WhileStatement: () => complexity++,
            SwitchCase: () => complexity++,
            CatchClause: () => complexity++,
            ConditionalExpression: () => complexity++,
            LogicalExpression: () => complexity++,
        });
        return complexity;
    }
    extractParam(param) {
        if (param.type === 'Identifier') {
            return param.name;
        }
        if (param.type === 'RestElement') {
            return `...${param.argument.name}`;
        }
        if (param.type === 'ObjectPattern') {
            return '{ destructured }';
        }
        return 'param';
    }
    generateValidInput(func) {
        if (func.params.length === 0)
            return '';
        return func.params.map(p => this.generateSmartMock(p)).join(', ');
    }
    generateInvalidInput(func) {
        if (func.params.length === 0)
            return 'null';
        return 'null';
    }
    generateMockParams(func) {
        return func.params.map(p => this.generateSmartMock(p)).join(', ');
    }
    generateSetup(func) {
        if (func.params.some(p => p.includes('mock'))) {
            return `const mockData = { id: 1, name: 'test' };`;
        }
        return undefined;
    }
    generateEdgeCases(func) {
        const tests = [];
        if (func.params.length > 0) {
            tests.push({
                name: 'should handle empty parameters',
                type: 'edge-case',
                code: `expect(() => ${func.name}()).not.toThrow();`,
                description: 'Test missing params',
            });
        }
        return tests;
    }
    generateErrorCases(func) {
        const tests = [];
        tests.push({
            name: 'should handle invalid input types',
            type: 'error-case',
            code: `expect(() => ${func.name}(Symbol('test'))).toThrow();`,
            description: 'Test type safety',
        });
        return tests;
    }
    generateGenericTests(func) {
        return [
            {
                name: `should execute ${func.name} successfully`,
                type: 'happy-path',
                code: `
    const result = ${func.async ? 'await ' : ''}${func.name}(${this.generateMockParams(func)});
    expect(result).toBeDefined();`,
                description: 'Basic execution test',
            },
        ];
    }
    generateCrudTests(func) {
        const purpose = this.detectFunctionPurpose(func.name);
        const tests = [];
        if (purpose === 'creation') {
            tests.push({
                name: 'should create and return new item',
                type: 'happy-path',
                code: `
    const result = await ${func.name}({ name: 'test' });
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('test');`,
                description: 'Test creation',
            });
        }
        if (purpose === 'reading') {
            tests.push({
                name: 'should retrieve existing item',
                type: 'happy-path',
                code: `
    const result = await ${func.name}(1);
    expect(result).toBeDefined();
    expect(result.id).toBe(1);`,
                description: 'Test retrieval',
            });
        }
        return tests;
    }
    extractClassContext(node) {
        const className = node.id?.name || 'AnonymousClass';
        const methods = [];
        for (const member of node.body.body) {
            if (member.type === 'MethodDefinition') {
                const method = this.extractFunctionContext(member.value, member.key.name);
                methods.push(method);
            }
        }
        return {
            name: className,
            methods,
            constructor: undefined,
            line: node.loc?.start.line || 0,
        };
    }
    generateClassTests(cls, filePath) {
        const tests = [];
        // Constructor test
        tests.push({
            name: `should create instance of ${cls.name}`,
            type: 'happy-path',
            code: `
    const instance = new target.${cls.name}();
    expect(instance).toBeInstanceOf(target.${cls.name});`,
            description: 'Test instantiation',
        });
        // Method tests
        for (const method of cls.methods) {
            tests.push({
                name: `should execute ${method.name} method`,
                type: 'happy-path',
                code: `
    const instance = new target.${cls.name}();
    const result = ${method.async ? 'await ' : ''}instance.${method.name}(${this.generateMockParams(method)});
    expect(result).toBeDefined();`,
                description: `Test ${method.name} method`,
            });
        }
        return {
            describe: `${cls.name} class`,
            tests,
            setup: `let instance;

  beforeEach(() => {
    instance = new target.${cls.name}();
  });`,
        };
    }
    generateSuiteCode(suite, framework) {
        if (framework === 'ava') {
            return suite.tests
                .map(test => `test('${test.name}', async t => {${test.code}
});`)
                .join('\n\n');
        }
        const setup = suite.setup ? `\n  ${suite.setup}\n` : '';
        const tests = suite.tests
            .map(test => `  it('${test.name}', async () => {${test.code}
  });`)
            .join('\n\n');
        return `describe('${suite.describe}', () => {${setup}
${tests}
});`;
    }
    calculateConfidence(functions, classes) {
        let confidence = 0.5; // Base confidence
        // Increase confidence for recognized patterns
        for (const func of functions) {
            const purpose = this.detectFunctionPurpose(func.name);
            if (purpose !== 'general') {
                confidence += 0.05;
            }
        }
        // Increase confidence for typed parameters
        for (const func of functions) {
            if (func.returnType && func.returnType !== 'unknown') {
                confidence += 0.05;
            }
        }
        // Cap at 0.95
        return Math.min(confidence, 0.95);
    }
    explainGeneration(functions, classes, suites) {
        const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
        const purposes = functions.map(f => this.detectFunctionPurpose(f.name));
        const uniquePurposes = [...new Set(purposes)];
        return `Generated ${totalTests} tests for ${functions.length} functions and ${classes.length} classes.
Detected patterns: ${uniquePurposes.join(', ')}.
Applied intelligent mocking based on parameter names.
Added edge cases and error handling tests.`;
    }
    /**
     * Get metrics for performance tracking
     */
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.generated > 0 ? this.metrics.successful / this.metrics.generated : 0,
        };
    }
}
//# sourceMappingURL=intelligent-generator.js.map