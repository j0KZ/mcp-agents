/**
 * Test Generator - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
import { RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';
// ============================================================================
// GENERATE_TESTS
// ============================================================================
export const GENERATE_TESTS_EXAMPLES = [
    {
        name: 'Basic test generation',
        description: 'Generate tests for a TypeScript utility file',
        input: {
            sourceFile: 'src/utils/validator.ts',
        },
        output: {
            sourceFile: 'src/utils/validator.ts',
            testFile: 'src/utils/validator.test.ts',
            framework: 'vitest',
            totalTests: 12,
            estimatedCoverage: 85,
            tests: [
                { name: 'should validate email correctly', type: 'unit' },
                { name: 'should reject invalid email', type: 'unit' },
                { name: 'should handle null input', type: 'edge-case' },
            ],
        },
    },
    {
        name: 'Jest with edge cases',
        description: 'Generate comprehensive Jest tests with edge cases',
        input: {
            sourceFile: 'src/services/auth.ts',
            config: {
                framework: 'jest',
                coverage: 90,
                includeEdgeCases: true,
                includeErrorCases: true,
            },
        },
        output: {
            sourceFile: 'src/services/auth.ts',
            testFile: 'src/services/auth.test.ts',
            framework: 'jest',
            totalTests: 24,
            estimatedCoverage: 92,
            tests: [
                { name: 'should authenticate valid user', type: 'unit' },
                { name: 'should reject expired token', type: 'error' },
                { name: 'should handle empty credentials', type: 'edge-case' },
                { name: 'should handle SQL injection attempt', type: 'security' },
            ],
        },
    },
];
export const GENERATE_TESTS_DEFINITION = {
    name: 'generate_tests',
    description: `Generate comprehensive test suite for a source file with edge cases and error handling.
Keywords: test, generate, unit, coverage, jest, vitest, mocha, ava, mock.
Use when: adding tests to untested code, improving coverage, TDD setup.

Returns: Object containing:
- sourceFile (string): Path to analyzed source file
- testFile (string): Generated test file path
- framework (string): Test framework used
- totalTests (number): Number of tests generated
- estimatedCoverage (number): Estimated coverage percentage
- tests (array): List of {name, type} for each test`,
    inputSchema: {
        type: 'object',
        properties: {
            sourceFile: {
                type: 'string',
                description: 'Path to the source file to generate tests for',
            },
            config: {
                type: 'object',
                description: 'Test generation configuration',
                properties: {
                    framework: {
                        type: 'string',
                        enum: ['jest', 'mocha', 'vitest', 'ava'],
                        description: 'Test framework to use',
                    },
                    coverage: {
                        type: 'number',
                        description: 'Target coverage percentage',
                    },
                    includeEdgeCases: {
                        type: 'boolean',
                        description: 'Include edge case tests',
                    },
                    includeErrorCases: {
                        type: 'boolean',
                        description: 'Include error handling tests',
                    },
                },
            },
            response_format: RESPONSE_FORMAT_SCHEMA,
        },
        required: ['sourceFile'],
    },
    examples: GENERATE_TESTS_EXAMPLES,
};
// ============================================================================
// WRITE_TEST_FILE
// ============================================================================
export const WRITE_TEST_FILE_EXAMPLES = [
    {
        name: 'Auto-generate test path',
        description: 'Generate and write tests with automatic path detection',
        input: {
            sourceFile: 'src/components/Button.tsx',
        },
        output: {
            success: true,
            testFile: 'src/components/Button.test.tsx',
            totalTests: 8,
            estimatedCoverage: '78%',
        },
    },
    {
        name: 'Custom test path',
        description: 'Write tests to a specific location',
        input: {
            sourceFile: 'src/api/users.ts',
            testFile: 'tests/api/users.spec.ts',
            config: {
                framework: 'jest',
                includeEdgeCases: true,
            },
        },
        output: {
            success: true,
            testFile: 'tests/api/users.spec.ts',
            totalTests: 15,
            estimatedCoverage: '88%',
        },
    },
];
export const WRITE_TEST_FILE_DEFINITION = {
    name: 'write_test_file',
    description: `Generate tests and write directly to a test file.
Keywords: write, create, test, file, save.
Use when: creating new test files, writing generated tests to disk.`,
    inputSchema: {
        type: 'object',
        properties: {
            sourceFile: {
                type: 'string',
                description: 'Path to the source file',
            },
            testFile: {
                type: 'string',
                description: 'Path where test file should be written (optional, auto-generated if not provided)',
            },
            config: {
                type: 'object',
                description: 'Test generation configuration',
            },
            response_format: RESPONSE_FORMAT_SCHEMA,
        },
        required: ['sourceFile'],
    },
    examples: WRITE_TEST_FILE_EXAMPLES,
};
// ============================================================================
// BATCH_GENERATE
// ============================================================================
export const BATCH_GENERATE_EXAMPLES = [
    {
        name: 'Generate tests for module',
        description: 'Generate tests for all files in a module',
        input: {
            sourceFiles: ['src/utils/string.ts', 'src/utils/array.ts', 'src/utils/object.ts'],
        },
        output: {
            totalFiles: 3,
            totalTests: 36,
            averageCoverage: 82,
            results: [
                {
                    sourceFile: 'src/utils/string.ts',
                    testFile: 'src/utils/string.test.ts',
                    tests: 14,
                    coverage: '85%',
                },
                {
                    sourceFile: 'src/utils/array.ts',
                    testFile: 'src/utils/array.test.ts',
                    tests: 12,
                    coverage: '80%',
                },
                {
                    sourceFile: 'src/utils/object.ts',
                    testFile: 'src/utils/object.test.ts',
                    tests: 10,
                    coverage: '81%',
                },
            ],
        },
    },
    {
        name: 'Batch with Vitest config',
        description: 'Generate Vitest tests for multiple components',
        input: {
            sourceFiles: ['src/components/Header.tsx', 'src/components/Footer.tsx'],
            config: {
                framework: 'vitest',
                coverage: 80,
                includeEdgeCases: true,
            },
        },
        output: {
            totalFiles: 2,
            totalTests: 18,
            averageCoverage: 83,
            results: [
                {
                    sourceFile: 'src/components/Header.tsx',
                    testFile: 'src/components/Header.test.tsx',
                    tests: 10,
                },
                {
                    sourceFile: 'src/components/Footer.tsx',
                    testFile: 'src/components/Footer.test.tsx',
                    tests: 8,
                },
            ],
        },
    },
];
export const BATCH_GENERATE_DEFINITION = {
    name: 'batch_generate',
    description: `Generate tests for multiple files at once.
Keywords: batch, multiple, bulk, generate, parallel.
Use when: adding tests to entire directories, improving coverage across module.`,
    inputSchema: {
        type: 'object',
        properties: {
            sourceFiles: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of source file paths',
            },
            config: {
                type: 'object',
                description: 'Test generation configuration',
            },
            response_format: RESPONSE_FORMAT_SCHEMA,
        },
        required: ['sourceFiles'],
    },
    examples: BATCH_GENERATE_EXAMPLES,
};
// ============================================================================
// ALL TOOL DEFINITIONS
// ============================================================================
export const TEST_GENERATOR_TOOLS = [
    GENERATE_TESTS_DEFINITION,
    WRITE_TEST_FILE_DEFINITION,
    BATCH_GENERATE_DEFINITION,
];
//# sourceMappingURL=tool-definitions.js.map