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

import {
  extractFunction,
  convertToAsync,
  simplifyConditionals,
  removeDeadCode,
  applyDesignPattern,
  renameVariable,
  suggestRefactorings,
  calculateMetrics,
} from './refactorer.js';

import {
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
} from '@j0kz/shared';

import type {
  ExtractFunctionOptions,
  ConvertToAsyncOptions,
  SimplifyConditionalsOptions,
  RemoveDeadCodeOptions,
  ApplyPatternOptions,
  RenameVariableOptions,
  DesignPattern,
} from './types.js';

/**
 * MCP Tool definitions - imported from constants for maintainability
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
export const TOOLS = REFACTOR_ASSISTANT_TOOLS;

/**
 * Create and configure MCP server
 */
const server = new Server(
  {
    name: 'refactor-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle list tools request
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: ExtractFunctionOptions = {
          functionName: args.functionName as string,
          startLine: args.startLine as number,
          endLine: args.endLine as number,
          async: args.async as boolean | undefined,
          arrow: args.arrow as boolean | undefined,
        };

        const result = extractFunction(args.code as string, options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
              warnings: r.warnings,
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: ConvertToAsyncOptions = {
          code: args.code as string,
          useTryCatch: args.useTryCatch as boolean | undefined,
        };

        const result = convertToAsync(options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: SimplifyConditionalsOptions = {
          code: args.code as string,
          useGuardClauses: args.useGuardClauses as boolean | undefined,
          useTernary: args.useTernary as boolean | undefined,
        };

        const result = simplifyConditionals(options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: RemoveDeadCodeOptions = {
          code: args.code as string,
          removeUnusedImports: args.removeUnusedImports as boolean | undefined,
          removeUnreachable: args.removeUnreachable as boolean | undefined,
        };

        const result = removeDeadCode(options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: ApplyPatternOptions = {
          code: args.code as string,
          pattern: args.pattern as DesignPattern,
          patternOptions: args.patternOptions as Record<string, unknown> | undefined,
        };

        const result = applyDesignPattern(options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const options: RenameVariableOptions = {
          code: args.code as string,
          oldName: args.oldName as string,
          newName: args.newName as string,
          includeComments: args.includeComments as boolean | undefined,
        };

        const result = renameVariable(options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({ success: r.success, changesCount: r.changes?.length || 0 }),
            concise: (r: any) => ({
              success: r.success,
              changes: truncateArray(r.changes || [], 'concise'),
            }),
            detailed: (r: any) => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const suggestions = suggestRefactorings(
          args.code as string,
          args.filePath as string | undefined
        );

        const formatted = formatResponse(
          { suggestions },
          { format: response_format },
          {
            minimal: r => ({ count: r.suggestions.length }),
            concise: r => ({
              count: r.suggestions.length,
              suggestions: truncateArray(
                r.suggestions.map((s: any) => ({ type: s.type, description: s.description })),
                'concise'
              ),
            }),
            detailed: r => r,
          }
        );

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
        const response_format = (args.response_format as ResponseFormat) || 'detailed';
        const metrics = calculateMetrics(args.code as string) as any;

        const formatted = formatResponse(
          { metrics },
          { format: response_format },
          {
            minimal: (r: any) => ({
              complexity: r.metrics?.complexity,
              lines: r.metrics?.linesOfCode,
            }),
            concise: (r: any) => ({
              complexity: r.metrics?.complexity,
              lines: r.metrics?.linesOfCode,
              functions: r.metrics?.functionCount,
              maintainability: r.metrics?.maintainabilityIndex,
            }),
            detailed: (r: any) => r,
          }
        );

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
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const errorCode = error instanceof MCPError ? error.code : 'UNKNOWN';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
              code: errorCode,
              ...(error instanceof MCPError && error.details ? { details: error.details } : {}),
            },
            null,
            2
          ),
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
