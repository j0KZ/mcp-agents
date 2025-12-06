#!/usr/bin/env node

/**
 * API Designer MCP Server
 * Provides MCP tools for comprehensive API design, generation, and validation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
} from '@j0kz/shared';
import { API_DESIGNER_TOOLS } from './constants/tool-definitions.js';
import {
  generateOpenAPI,
  designRESTEndpoints,
  createGraphQLSchema,
  generateAPIClient,
  validateAPIDesign,
  generateMockServer,
} from './designer.js';
import {
  APIDesignConfig,
  OpenAPISpec,
  ClientGenerationOptions,
  MockServerConfig,
  RESTEndpoint,
  GraphQLType,
  GraphQLSchema,
} from './types.js';

/**
 * MCP Tools definition - imported from constants for maintainability
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
const TOOLS = API_DESIGNER_TOOLS;

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'api-designer',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle tool list requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_openapi': {
        const {
          config,
          endpoints,
          response_format = 'detailed',
        } = args as {
          config: APIDesignConfig;
          endpoints?: RESTEndpoint[];
          response_format?: ResponseFormat;
        };
        const result = generateOpenAPI(config, endpoints) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              success: r.success,
              endpointCount: r.metadata?.endpointCount || 0,
            }),
            concise: (r: any) => ({
              success: r.success,
              metadata: r.metadata,
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

      case 'design_rest_api': {
        const {
          resources,
          config,
          response_format = 'detailed',
        } = args as {
          resources: string[];
          config: APIDesignConfig;
          response_format?: ResponseFormat;
        };
        const result = designRESTEndpoints(resources, config) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              success: r.success,
              endpointCount: r.metadata?.endpointCount || 0,
            }),
            concise: (r: any) => ({
              success: r.success,
              metadata: r.metadata,
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

      case 'create_graphql_schema': {
        const {
          config,
          customTypes,
          response_format = 'detailed',
        } = args as {
          config: APIDesignConfig;
          customTypes?: GraphQLType[];
          response_format?: ResponseFormat;
        };
        const result = createGraphQLSchema(customTypes || [], config) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              success: r.success,
              schemaCount: r.metadata?.schemaCount || 0,
            }),
            concise: (r: any) => ({
              success: r.success,
              metadata: r.metadata,
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

      case 'generate_client': {
        const {
          spec,
          options,
          response_format = 'detailed',
        } = args as {
          spec: OpenAPISpec | GraphQLSchema;
          options: ClientGenerationOptions;
          response_format?: ResponseFormat;
        };
        const result = generateAPIClient(spec, options) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              success: r.success,
            }),
            concise: (r: any) => ({
              success: r.success,
              metadata: r.metadata,
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

      case 'validate_api': {
        const { spec, response_format = 'detailed' } = args as {
          spec: OpenAPISpec | GraphQLSchema;
          response_format?: ResponseFormat;
        };
        const result = validateAPIDesign(spec) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              valid: r.valid,
              errorsCount: r.errors?.length || 0,
              warningsCount: r.warnings?.length || 0,
            }),
            concise: (r: any) => ({
              valid: r.valid,
              errors: truncateArray(r.errors || [], 'concise'),
              warnings: truncateArray(r.warnings || [], 'concise'),
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

      case 'generate_mock_server': {
        const {
          spec,
          config,
          response_format = 'detailed',
        } = args as {
          spec: OpenAPISpec;
          config?: MockServerConfig;
          response_format?: ResponseFormat;
        };
        const result = generateMockServer(spec, config || {}) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              success: r.success,
            }),
            concise: (r: any) => ({
              success: r.success,
              metadata: r.metadata,
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
        throw new MCPError('API_006', { tool: name });
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
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('API Designer MCP Server running on stdio');
}

main().catch(error => {
  console.error('Server error:', error);
  process.exit(1);
});
