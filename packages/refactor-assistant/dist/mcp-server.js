#!/usr/bin/env node
/**
 * MCP Server for Refactoring Assistant
 *
 * Provides tools for intelligent code refactoring through the Model Context Protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { extractFunction, convertToAsync, simplifyConditionals, removeDeadCode, applyDesignPattern, renameVariable, suggestRefactorings, calculateMetrics, } from './refactorer.js';
/**
 * MCP Tool definitions
 */
export const TOOLS = [
    {
        name: 'extract_function',
        description: 'Extract a code block into a separate function with automatic parameter detection',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code containing the block to extract',
                },
                functionName: {
                    type: 'string',
                    description: 'Name for the extracted function',
                },
                startLine: {
                    type: 'number',
                    description: 'Start line of the code block to extract (1-indexed)',
                },
                endLine: {
                    type: 'number',
                    description: 'End line of the code block to extract (1-indexed, inclusive)',
                },
                async: {
                    type: 'boolean',
                    description: 'Whether to make the extracted function async',
                    default: false,
                },
                arrow: {
                    type: 'boolean',
                    description: 'Whether to use arrow function syntax',
                    default: false,
                },
            },
            required: ['code', 'functionName', 'startLine', 'endLine'],
        },
    },
    {
        name: 'convert_to_async',
        description: 'Convert callback-based code to async/await syntax with proper error handling',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code with callbacks to convert',
                },
                useTryCatch: {
                    type: 'boolean',
                    description: 'Wrap async code in try/catch blocks',
                    default: true,
                },
            },
            required: ['code'],
        },
    },
    {
        name: 'simplify_conditionals',
        description: 'Simplify nested conditionals using guard clauses, ternary operators, and combined conditions',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code with conditionals to simplify',
                },
                useGuardClauses: {
                    type: 'boolean',
                    description: 'Apply guard clauses for early returns',
                    default: true,
                },
                useTernary: {
                    type: 'boolean',
                    description: 'Convert simple if/else to ternary operators',
                    default: true,
                },
            },
            required: ['code'],
        },
    },
    {
        name: 'remove_dead_code',
        description: 'Remove dead code including unused variables, unreachable code, and unused imports',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code to analyze and clean',
                },
                removeUnusedImports: {
                    type: 'boolean',
                    description: 'Remove unused import statements',
                    default: true,
                },
                removeUnreachable: {
                    type: 'boolean',
                    description: 'Remove unreachable code after return statements',
                    default: true,
                },
            },
            required: ['code'],
        },
    },
    {
        name: 'apply_pattern',
        description: 'Apply a design pattern to existing code (singleton, factory, observer, strategy, decorator, adapter, facade, proxy, command, chain-of-responsibility)',
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
                patternOptions: {
                    type: 'object',
                    description: 'Pattern-specific options (e.g., className for factory)',
                },
            },
            required: ['code', 'pattern'],
        },
    },
    {
        name: 'rename_variable',
        description: 'Rename a variable consistently throughout the code with word boundary detection',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code containing the variable',
                },
                oldName: {
                    type: 'string',
                    description: 'Current variable name',
                },
                newName: {
                    type: 'string',
                    description: 'New variable name (must be valid identifier)',
                },
                includeComments: {
                    type: 'boolean',
                    description: 'Also rename variable in comments',
                    default: false,
                },
            },
            required: ['code', 'oldName', 'newName'],
        },
    },
    {
        name: 'suggest_refactorings',
        description: 'Analyze code and provide intelligent refactoring suggestions based on best practices',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code to analyze',
                },
                filePath: {
                    type: 'string',
                    description: 'Optional file path for context',
                },
            },
            required: ['code'],
        },
    },
    {
        name: 'calculate_metrics',
        description: 'Calculate code quality metrics including complexity, LOC, and maintainability index',
        inputSchema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    description: 'Source code to analyze',
                },
            },
            required: ['code'],
        },
    },
];
/**
 * Create and configure MCP server
 */
const server = new Server({
    name: 'refactor-assistant',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * Handle list tools request
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (!args) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'Missing arguments' }),
                },
            ],
            isError: true,
        };
    }
    try {
        switch (name) {
            case 'extract_function': {
                const options = {
                    functionName: args.functionName,
                    startLine: args.startLine,
                    endLine: args.endLine,
                    async: args.async,
                    arrow: args.arrow,
                };
                const result = extractFunction(args.code, options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'convert_to_async': {
                const options = {
                    code: args.code,
                    useTryCatch: args.useTryCatch,
                };
                const result = convertToAsync(options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'simplify_conditionals': {
                const options = {
                    code: args.code,
                    useGuardClauses: args.useGuardClauses,
                    useTernary: args.useTernary,
                };
                const result = simplifyConditionals(options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'remove_dead_code': {
                const options = {
                    code: args.code,
                    removeUnusedImports: args.removeUnusedImports,
                    removeUnreachable: args.removeUnreachable,
                };
                const result = removeDeadCode(options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'apply_pattern': {
                const options = {
                    code: args.code,
                    pattern: args.pattern,
                    patternOptions: args.patternOptions,
                };
                const result = applyDesignPattern(options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'rename_variable': {
                const options = {
                    code: args.code,
                    oldName: args.oldName,
                    newName: args.newName,
                    includeComments: args.includeComments,
                };
                const result = renameVariable(options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'suggest_refactorings': {
                const suggestions = suggestRefactorings(args.code, args.filePath);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ suggestions }, null, 2),
                        },
                    ],
                };
            }
            case 'calculate_metrics': {
                const metrics = calculateMetrics(args.code);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ metrics }, null, 2),
                        },
                    ],
                };
            }
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
                        },
                    ],
                    isError: true,
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: error instanceof Error ? error.message : 'Unknown error occurred',
                        stack: error instanceof Error ? error.stack : undefined,
                    }),
                },
            ],
            isError: true,
        };
    }
});
/**
 * Start the MCP server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Refactoring Assistant MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map