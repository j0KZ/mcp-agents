import { readFile } from 'fs/promises';
import { ASTParser } from './ast-parser.js';
import { TestCaseGenerator } from './test-case-generator.js';
import { AnalysisCache } from '@j0kz/shared';
import {
  TestFramework,
  TestCase,
  TestSuite,
  GeneratedTest,
  TestConfig,
  FunctionInfo,
  ClassInfo,
} from './types.js';
import { FILE_LIMITS } from './constants/limits.js';

export class TestGenerator {
  private parser: ASTParser;
  private testCaseGenerator: TestCaseGenerator;
  private cache: AnalysisCache;

  constructor() {
    this.cache = new AnalysisCache();
    this.parser = new ASTParser(this.cache);
    this.testCaseGenerator = new TestCaseGenerator();
  }

  /**
   * Generate comprehensive tests for a source file
   */
  async generateTests(filePath: string, config: TestConfig = {}): Promise<GeneratedTest> {
    // Validate file path
    if (!filePath || typeof filePath !== 'string') {
      throw new Error(
        'TEST_GEN_001: Invalid file path. Please provide a valid string path to the source file.'
      );
    }

    // Validate framework
    const framework = config.framework || 'jest';
    const validFrameworks = ['jest', 'vitest', 'mocha', 'ava'];
    if (!validFrameworks.includes(framework)) {
      throw new Error(
        `TEST_GEN_002: Unsupported framework '${framework}'. Supported frameworks: ${validFrameworks.join(', ')}`
      );
    }

    // Read file with better error handling
    let content: string;
    try {
      content = await readFile(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `TEST_GEN_003: File not found: ${filePath}\nPlease check the file path and try again.`
        );
      }
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(
          `TEST_GEN_004: Permission denied: ${filePath}\nPlease check file permissions.`
        );
      }
      throw new Error(
        `TEST_GEN_005: Failed to read file: ${filePath}\nReason: ${(error as Error).message}`
      );
    }

    // Validate file content
    if (!content || content.trim().length === 0) {
      throw new Error(
        `TEST_GEN_006: File is empty: ${filePath}\nCannot generate tests for an empty file.`
      );
    }

    // Check file size
    if (content.length > FILE_LIMITS.MAX_FILE_SIZE) {
      const sizeKB = (content.length / 1024).toFixed(2);
      const limitKB = (FILE_LIMITS.MAX_FILE_SIZE / 1024).toFixed(0);
      throw new Error(
        `TEST_GEN_007: File too large: ${filePath} (${sizeKB} KB)\nMaximum supported file size is ${limitKB} KB.`
      );
    }

    const { functions, classes } = this.parser.parseCode(content, filePath);

    // Validate that we found something to test
    if (functions.length === 0 && classes.length === 0) {
      throw new Error(
        `TEST_GEN_008: No testable code found in ${filePath}\nThe file must contain at least one function or class to generate tests.`
      );
    }

    const suites: TestSuite[] = [];

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

    // Return in the format expected by tests and MCP
    return {
      success: true,
      sourceFile: filePath,
      testFile: this.getTestFilePath(filePath, framework),
      framework,
      code: fullTestCode,  // Add this for compatibility
      suite: suites[0],    // Add first suite for compatibility
      suites,
      fullTestCode,
      estimatedCoverage,
      totalTests,
      coverage: {
        percentage: estimatedCoverage,
        functions: functions.length,
        classes: classes.length,
        tests: totalTests
      }
    } as any;
  }

  /**
   * Generate test suite for a function
   */
  private generateFunctionTestSuite(func: FunctionInfo, config: TestConfig): TestSuite {
    const tests: TestCase[] = [];

    // Happy path test
    tests.push({
      name: `should ${func.name} with valid inputs`,
      type: 'happy-path',
      code: this.testCaseGenerator.generateHappyPathTest(func),
      description: `Test ${func.name} with typical valid inputs`,
    });

    // Edge cases
    if (config.includeEdgeCases !== false) {
      tests.push(...this.testCaseGenerator.generateEdgeCaseTests(func));
    }

    // Error cases
    if (config.includeErrorCases !== false) {
      tests.push(...this.testCaseGenerator.generateErrorCaseTests(func));
    }

    return {
      describe: `${func.name}()`,
      tests,
    };
  }

  /**
   * Generate test suite for a class
   */
  private generateClassTestSuite(cls: ClassInfo, config: TestConfig): TestSuite {
    const tests: TestCase[] = [];

    // Constructor test
    if (cls.constructor) {
      tests.push({
        name: `should create instance of ${cls.name}`,
        type: 'happy-path',
        code: this.testCaseGenerator.generateConstructorTest(cls),
        description: `Test ${cls.name} instantiation`,
      });
    }

    // Method tests
    for (const method of cls.methods) {
      tests.push({
        name: `should ${method.name}`,
        type: 'happy-path',
        code: this.testCaseGenerator.generateMethodTest(cls, method),
        description: `Test ${cls.name}.${method.name}()`,
      });

      // Edge cases for methods
      if (config.includeEdgeCases !== false) {
        tests.push(...this.testCaseGenerator.generateMethodEdgeCases(cls, method));
      }
    }

    return {
      describe: `${cls.name} class`,
      tests,
      setup: `let instance: ${cls.name};`,
    };
  }

  /**
   * Generate complete test file
   */
  private generateTestFile(
    sourceFile: string,
    suites: TestSuite[],
    framework: TestFramework
  ): string {
    const importPath = sourceFile.replace(/\.(ts|js)$/, '');
    const imports = this.generateImports(framework, importPath);
    const suitesCode = suites.map(s => this.generateSuiteCode(s, framework)).join('\n\n');

    return `${imports}\n\n${suitesCode}`;
  }

  /**
   * Generate import statements
   */
  private generateImports(framework: TestFramework, importPath: string): string {
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
  private generateSuiteCode(suite: TestSuite, framework: TestFramework): string {
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
  private generateTestCode(test: TestCase, framework: TestFramework): string {
    if (framework === 'ava') {
      return `test('${test.name}', async (t) => {\n  ${test.code}\n});`;
    }

    const itFn = test.code.includes('await') ? 'it' : 'it';
    return `  ${itFn}('${test.name}', async () => {\n    ${test.code}\n  });`;
  }

  /**
   * Get test file path
   */
  private getTestFilePath(sourceFile: string, _framework: TestFramework): string {
    return sourceFile.replace(/\.(ts|js)$/, '.test.$1');
  }

  /**
   * Estimate test coverage based on generated tests
   */
  private estimateCoverage(functions: FunctionInfo[], classes: ClassInfo[], suites: TestSuite[]): number {
    const totalItems = functions.length + classes.reduce((sum, c) => sum + c.methods.length + 1, 0);
    const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);

    if (totalItems === 0) return 100;

    // Basic estimation: assume each test covers one item
    const coverage = Math.min(100, (totalTests / totalItems) * 100);
    return Math.round(coverage);
  }


  // Unused method - commented out to fix TypeScript strict mode
  // private generateMockValue(param: string): string {
  //   const lower = param.toLowerCase();
  //   if (lower.includes('name')) return '"test"';
  //   if (lower.includes('email')) return '"test@example.com"';
  //   if (lower.includes('array') || lower.includes('list')) return '[]';
  //   if (lower.includes('object') || lower.includes('data')) return '{}';
  //   if (lower.includes('bool') || lower.includes('is') || lower.includes('has')) return 'true';
  //   return '"mockValue"';
  // }
}
