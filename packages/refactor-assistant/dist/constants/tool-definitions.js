/**
 * Refactor Assistant - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
import { RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';
export const EXTRACT_FUNCTION_EXAMPLES = [
    {
        name: 'Extract to named function',
        description: 'Extract lines 10-15 into a new function',
        input: {
            code: 'function process() {\n  const data = fetch();\n  // lines 10-15: validation logic\n  if (!data) return null;\n  if (data.error) throw new Error(data.error);\n  return data.result;\n}',
            functionName: 'validateData',
            startLine: 3,
            endLine: 5,
        },
        output: {
            success: true,
            extractedFunction: 'function validateData(data) {\n  if (!data) return null;\n  if (data.error) throw new Error(data.error);\n  return data.result;\n}',
            modifiedCode: 'function process() {\n  const data = fetch();\n  return validateData(data);\n}',
            parameters: ['data'],
        },
    },
    {
        name: 'Extract to arrow function',
        description: 'Extract code to async arrow function',
        input: {
            code: 'async function loadUser() {\n  const response = await fetch("/api/user");\n  const json = await response.json();\n  return json;\n}',
            functionName: 'fetchJson',
            startLine: 2,
            endLine: 3,
            async: true,
            arrow: true,
        },
        output: {
            success: true,
            extractedFunction: 'const fetchJson = async (url) => {\n  const response = await fetch(url);\n  return await response.json();\n};',
        },
    },
];
export const CONVERT_TO_ASYNC_EXAMPLES = [
    {
        name: 'Convert callbacks to async/await',
        description: 'Transform callback-based code',
        input: {
            code: 'function getData(callback) {\n  fetch(url, (err, data) => {\n    if (err) callback(err);\n    else callback(null, data);\n  });\n}',
            useTryCatch: true,
        },
        output: {
            success: true,
            convertedCode: 'async function getData() {\n  try {\n    const data = await fetch(url);\n    return data;\n  } catch (err) {\n    throw err;\n  }\n}',
            conversions: 1,
        },
    },
];
export const SIMPLIFY_CONDITIONALS_EXAMPLES = [
    {
        name: 'Apply guard clauses',
        description: 'Convert nested if/else to guard clauses',
        input: {
            code: 'function process(user) {\n  if (user) {\n    if (user.isActive) {\n      if (user.hasPermission) {\n        return doWork(user);\n      }\n    }\n  }\n  return null;\n}',
            useGuardClauses: true,
        },
        output: {
            success: true,
            simplifiedCode: 'function process(user) {\n  if (!user) return null;\n  if (!user.isActive) return null;\n  if (!user.hasPermission) return null;\n  return doWork(user);\n}',
            simplifications: 3,
        },
    },
];
export const REMOVE_DEAD_CODE_EXAMPLES = [
    {
        name: 'Remove unused code',
        description: 'Clean up unused imports and unreachable code',
        input: {
            code: 'import { unused } from "lib";\nimport { used } from "lib";\n\nfunction fn() {\n  return 42;\n  console.log("unreachable");\n}',
            removeUnusedImports: true,
            removeUnreachable: true,
        },
        output: {
            success: true,
            cleanedCode: 'import { used } from "lib";\n\nfunction fn() {\n  return 42;\n}',
            removed: { imports: 1, unreachable: 1 },
        },
    },
];
export const APPLY_PATTERN_EXAMPLES = [
    {
        name: 'Apply Singleton pattern',
        description: 'Convert class to Singleton',
        input: {
            code: 'class DatabaseConnection {\n  connect() { /* ... */ }\n}',
            pattern: 'singleton',
        },
        output: {
            success: true,
            patternApplied: 'singleton',
            refactoredCode: 'class DatabaseConnection {\n  private static instance: DatabaseConnection;\n  private constructor() {}\n  static getInstance() {\n    if (!this.instance) this.instance = new DatabaseConnection();\n    return this.instance;\n  }\n  connect() { /* ... */ }\n}',
        },
    },
    {
        name: 'Apply Factory pattern',
        description: 'Create factory for object creation',
        input: {
            code: 'class User { constructor(name, role) { this.name = name; this.role = role; } }',
            pattern: 'factory',
        },
        output: {
            success: true,
            patternApplied: 'factory',
            refactoredCode: 'class UserFactory {\n  static create(name, role) {\n    return new User(name, role);\n  }\n}',
        },
    },
];
export const RENAME_VARIABLE_EXAMPLES = [
    {
        name: 'Rename variable globally',
        description: 'Rename variable across entire code',
        input: {
            code: 'const usr = getUser();\nconsole.log(usr.name);\nreturn usr;',
            oldName: 'usr',
            newName: 'user',
        },
        output: {
            success: true,
            renamedCode: 'const user = getUser();\nconsole.log(user.name);\nreturn user;',
            occurrences: 3,
        },
    },
];
export const SUGGEST_REFACTORINGS_EXAMPLES = [
    {
        name: 'Get refactoring suggestions',
        description: 'Analyze code for improvement opportunities',
        input: {
            code: 'function processData(data) {\n  if (data) {\n    if (data.items) {\n      for (let i = 0; i < data.items.length; i++) {\n        console.log(data.items[i]);\n      }\n    }\n  }\n}',
        },
        output: {
            suggestions: [
                { type: 'guard-clause', description: 'Convert nested if to guard clause', line: 2 },
                { type: 'modern-loop', description: 'Replace for loop with for...of', line: 4 },
                { type: 'remove-console', description: 'Remove console.log statement', line: 5 },
            ],
        },
    },
];
export const CALCULATE_METRICS_EXAMPLES = [
    {
        name: 'Calculate code metrics',
        description: 'Get complexity and maintainability metrics',
        input: {
            code: 'function complex(a, b, c) {\n  if (a) {\n    if (b) {\n      if (c) return 1;\n      return 2;\n    }\n    return 3;\n  }\n  return 4;\n}',
        },
        output: {
            metrics: {
                linesOfCode: 10,
                cyclomaticComplexity: 4,
                maintainabilityIndex: 62,
                halsteadDifficulty: 8.5,
            },
        },
    },
];
export const REFACTOR_ASSISTANT_TOOLS = [
    {
        name: 'extract_function',
        description: `Extract a code block into a separate function with automatic parameter detection.
Keywords: extract, function, refactor, split, modularize.
Use when: reducing function size, improving reusability, DRY principle.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code containing the block to extract',
                },
                functionName: { type: 'string', description: 'Name for the extracted function' },
                startLine: {
                    type: 'number',
                    description: 'Start line of the code block (1-indexed)',
                },
                endLine: {
                    type: 'number',
                    description: 'End line of the code block (1-indexed, inclusive)',
                },
                async: {
                    type: 'boolean',
                    description: 'Whether to make the extracted function async',
                },
                arrow: { type: 'boolean', description: 'Whether to use arrow function syntax' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code', 'functionName', 'startLine', 'endLine'],
        },
        examples: EXTRACT_FUNCTION_EXAMPLES,
    },
    {
        name: 'convert_to_async',
        description: `Convert callback-based code to async/await syntax with proper error handling.
Keywords: async, await, callback, promise, modernize.
Use when: updating legacy code, improving readability, promise conversion.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code with callbacks to convert' },
                useTryCatch: {
                    type: 'boolean',
                    description: 'Wrap async code in try/catch blocks',
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code'],
        },
        examples: CONVERT_TO_ASYNC_EXAMPLES,
    },
    {
        name: 'simplify_conditionals',
        description: `Simplify nested conditionals using guard clauses, ternary operators, and combined conditions.
Keywords: conditional, if, else, guard, simplify, flatten.
Use when: reducing nesting, improving readability, early returns.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code with conditionals to simplify' },
                useGuardClauses: {
                    type: 'boolean',
                    description: 'Apply guard clauses for early returns',
                },
                useTernary: {
                    type: 'boolean',
                    description: 'Convert simple if/else to ternary operators',
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code'],
        },
        examples: SIMPLIFY_CONDITIONALS_EXAMPLES,
    },
    {
        name: 'remove_dead_code',
        description: `Remove dead code including unused variables, unreachable code, and unused imports.
Keywords: dead code, unused, unreachable, cleanup, imports.
Use when: cleaning up codebase, reducing bundle size, maintenance.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code to analyze and clean' },
                removeUnusedImports: {
                    type: 'boolean',
                    description: 'Remove unused import statements',
                },
                removeUnreachable: {
                    type: 'boolean',
                    description: 'Remove unreachable code after return statements',
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code'],
        },
        examples: REMOVE_DEAD_CODE_EXAMPLES,
    },
    {
        name: 'apply_pattern',
        description: `Apply a design pattern to existing code (singleton, factory, observer, strategy, decorator, adapter, facade, proxy, command, chain-of-responsibility).
Keywords: design pattern, singleton, factory, observer, strategy, architecture.
Use when: improving code structure, applying OOP principles, scalability.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code to refactor with design pattern',
                },
                pattern: {
                    type: 'string',
                    enum: [
                        'singleton',
                        'factory',
                        'observer',
                        'strategy',
                        'decorator',
                        'adapter',
                        'facade',
                        'proxy',
                        'command',
                        'chain-of-responsibility',
                    ],
                    description: 'Design pattern to apply',
                },
                patternOptions: { type: 'object', description: 'Pattern-specific options' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code', 'pattern'],
        },
        examples: APPLY_PATTERN_EXAMPLES,
    },
    {
        name: 'rename_variable',
        description: `Rename a variable consistently throughout the code with word boundary detection.
Keywords: rename, variable, refactor, naming, identifier.
Use when: improving naming, fixing typos, clarifying intent.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code containing the variable' },
                oldName: { type: 'string', description: 'Current variable name' },
                newName: {
                    type: 'string',
                    description: 'New variable name (must be valid identifier)',
                },
                includeComments: {
                    type: 'boolean',
                    description: 'Also rename variable in comments',
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code', 'oldName', 'newName'],
        },
        examples: RENAME_VARIABLE_EXAMPLES,
    },
    {
        name: 'suggest_refactorings',
        description: `Analyze code and provide intelligent refactoring suggestions based on best practices.
Keywords: suggest, analyze, improvements, recommendations, best practices.
Use when: code review, improving quality, learning opportunities.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code to analyze' },
                filePath: { type: 'string', description: 'Optional file path for context' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code'],
        },
        examples: SUGGEST_REFACTORINGS_EXAMPLES,
    },
    {
        name: 'calculate_metrics',
        description: `Calculate code quality metrics including complexity, LOC, and maintainability index.
Keywords: metrics, complexity, maintainability, LOC, halstead.
Use when: measuring code quality, setting thresholds, tracking improvements.`,
        inputSchema: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Source code to analyze' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['code'],
        },
        examples: CALCULATE_METRICS_EXAMPLES,
    },
];
//# sourceMappingURL=tool-definitions.js.map