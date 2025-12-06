#!/usr/bin/env node
/**
 * MCP Server for Refactoring Assistant
 *
 * Provides tools for intelligent code refactoring through the Model Context Protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { REFACTOR_ASSISTANT_TOOLS } from './constants/tool-definitions.js';
import { extractFunction, convertToAsync, simplifyConditionals, removeDeadCode, applyDesignPattern, renameVariable, suggestRefactorings, calculateMetrics, } from './refactorer.js';
import { MCPError, getErrorMessage, formatResponse, truncateArray, } from '@j0kz/shared';
/**
 * MCP Tool definitions - imported from constants for maintainability
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
export const TOOLS = REFACTOR_ASSISTANT_TOOLS;
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
                const response_format = args.response_format || 'detailed';
                const options = {
                    functionName: args.functionName,
                    startLine: args.startLine,
                    endLine: args.endLine,
                    async: args.async,
                    arrow: args.arrow,
                };
                const result = extractFunction(args.code, options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                        warnings: r.warnings,
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'convert_to_async': {
                const response_format = args.response_format || 'detailed';
                const options = {
                    code: args.code,
                    useTryCatch: args.useTryCatch,
                };
                const result = convertToAsync(options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'simplify_conditionals': {
                const response_format = args.response_format || 'detailed';
                const options = {
                    code: args.code,
                    useGuardClauses: args.useGuardClauses,
                    useTernary: args.useTernary,
                };
                const result = simplifyConditionals(options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'remove_dead_code': {
                const response_format = args.response_format || 'detailed';
                const options = {
                    code: args.code,
                    removeUnusedImports: args.removeUnusedImports,
                    removeUnreachable: args.removeUnreachable,
                };
                const result = removeDeadCode(options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'apply_pattern': {
                const response_format = args.response_format || 'detailed';
                const options = {
                    code: args.code,
                    pattern: args.pattern,
                    patternOptions: args.patternOptions,
                };
                const result = applyDesignPattern(options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'rename_variable': {
                const response_format = args.response_format || 'detailed';
                const options = {
                    code: args.code,
                    oldName: args.oldName,
                    newName: args.newName,
                    includeComments: args.includeComments,
                };
                const result = renameVariable(options);
                const formatted = formatResponse(result, { format: response_format }, {
                    minimal: (r) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
                    concise: (r) => ({
                        success: r.success,
                        changes: truncateArray(r.changes || [], 'concise'),
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'suggest_refactorings': {
                const response_format = args.response_format || 'detailed';
                const suggestions = suggestRefactorings(args.code, args.filePath);
                const formatted = formatResponse({ suggestions }, { format: response_format }, {
                    minimal: r => ({ count: r.suggestions.length }),
                    concise: r => ({
                        count: r.suggestions.length,
                        suggestions: truncateArray(r.suggestions.map((s) => ({ type: s.type, description: s.description })), 'concise'),
                    }),
                    detailed: r => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
                        },
                    ],
                };
            }
            case 'calculate_metrics': {
                const response_format = args.response_format || 'detailed';
                const metrics = calculateMetrics(args.code);
                const formatted = formatResponse({ metrics }, { format: response_format }, {
                    minimal: (r) => ({
                        complexity: r.metrics?.complexity,
                        lines: r.metrics?.linesOfCode,
                    }),
                    concise: (r) => ({
                        complexity: r.metrics?.complexity,
                        lines: r.metrics?.linesOfCode,
                        functions: r.metrics?.functionCount,
                        maintainability: r.metrics?.maintainabilityIndex,
                    }),
                    detailed: (r) => r,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(formatted, null, 2),
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
        const errorMessage = getErrorMessage(error);
        const errorCode = error instanceof MCPError ? error.code : 'UNKNOWN';
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                        code: errorCode,
                        ...(error instanceof MCPError && error.details ? { details: error.details } : {}),
                    }, null, 2),
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
main().catch(error => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map