#!/usr/bin/env node
/**
 * API Designer MCP Server
 * Provides MCP tools for comprehensive API design, generation, and validation
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { generateOpenAPI, designRESTEndpoints, createGraphQLSchema, generateAPIClient, validateAPIDesign, generateMockServer, } from './designer.js';
/**
 * MCP Tools definition
 */
const TOOLS = [
    {
        name: 'generate_openapi',
        description: 'Generate OpenAPI 3.0 specification from API configuration. Creates comprehensive API documentation with endpoints, schemas, security, and more.',
        inputSchema: {
            type: 'object',
            properties: {
                config: {
                    type: 'object',
                    description: 'API design configuration',
                    properties: {
                        name: { type: 'string', description: 'API name' },
                        version: { type: 'string', description: 'API version (e.g., "1.0.0")' },
                        description: { type: 'string', description: 'API description' },
                        baseUrl: { type: 'string', description: 'Base URL (e.g., "https://api.example.com/v1")' },
                        style: {
                            type: 'string',
                            enum: ['REST', 'GraphQL', 'gRPC', 'WebSocket'],
                            description: 'API style',
                        },
                        auth: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['none', 'apiKey', 'bearer', 'oauth2', 'basic'],
                                    description: 'Authentication type',
                                },
                                config: { type: 'object', description: 'Auth configuration' },
                            },
                        },
                        resources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Resource names (e.g., ["users", "posts"])',
                        },
                        conventions: {
                            type: 'object',
                            properties: {
                                namingCase: {
                                    type: 'string',
                                    enum: ['camelCase', 'snake_case', 'kebab-case', 'PascalCase'],
                                },
                                versioning: {
                                    type: 'string',
                                    enum: ['url', 'header', 'query'],
                                },
                                pagination: {
                                    type: 'string',
                                    enum: ['offset', 'cursor', 'page'],
                                },
                            },
                        },
                    },
                    required: ['name', 'version', 'style'],
                },
                endpoints: {
                    type: 'array',
                    description: 'Optional custom REST endpoints',
                    items: { type: 'object' },
                },
            },
            required: ['config'],
        },
    },
    {
        name: 'design_rest_api',
        description: 'Design RESTful API endpoints following best practices. Automatically generates CRUD operations for resources with proper HTTP methods, status codes, and pagination.',
        inputSchema: {
            type: 'object',
            properties: {
                resources: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Resource names to generate endpoints for (e.g., ["users", "posts", "comments"])',
                },
                config: {
                    type: 'object',
                    description: 'API design configuration',
                    properties: {
                        name: { type: 'string', description: 'API name' },
                        version: { type: 'string', description: 'API version' },
                        style: { type: 'string', enum: ['REST'], description: 'Must be "REST"' },
                        conventions: {
                            type: 'object',
                            properties: {
                                namingCase: {
                                    type: 'string',
                                    enum: ['camelCase', 'snake_case', 'kebab-case', 'PascalCase'],
                                },
                            },
                        },
                    },
                    required: ['name', 'version', 'style'],
                },
            },
            required: ['resources', 'config'],
        },
    },
    {
        name: 'create_graphql_schema',
        description: 'Create GraphQL schema with types, queries, mutations, and subscriptions. Generates complete SDL with proper type definitions and resolvers.',
        inputSchema: {
            type: 'object',
            properties: {
                config: {
                    type: 'object',
                    description: 'API design configuration',
                    properties: {
                        name: { type: 'string', description: 'API name' },
                        version: { type: 'string', description: 'API version' },
                        style: { type: 'string', enum: ['GraphQL'], description: 'Must be "GraphQL"' },
                        resources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Resource names (e.g., ["User", "Post"])',
                        },
                    },
                    required: ['name', 'version', 'style'],
                },
                customTypes: {
                    type: 'array',
                    description: 'Optional custom GraphQL type definitions',
                    items: { type: 'object' },
                },
            },
            required: ['config'],
        },
    },
    {
        name: 'generate_client',
        description: 'Generate API client code in various languages (TypeScript, Python, etc.). Supports multiple HTTP libraries and includes type definitions.',
        inputSchema: {
            type: 'object',
            properties: {
                spec: {
                    type: 'object',
                    description: 'OpenAPI specification or GraphQL schema',
                },
                options: {
                    type: 'object',
                    description: 'Client generation options',
                    properties: {
                        language: {
                            type: 'string',
                            enum: ['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'ruby', 'php'],
                            description: 'Target language',
                        },
                        outputFormat: {
                            type: 'string',
                            enum: ['axios', 'fetch', 'sdk', 'openapi-generator'],
                            description: 'HTTP client library',
                        },
                        includeTypes: {
                            type: 'boolean',
                            description: 'Include TypeScript type definitions',
                        },
                        includeTests: {
                            type: 'boolean',
                            description: 'Generate test files',
                        },
                        asyncStyle: {
                            type: 'string',
                            enum: ['promise', 'async-await', 'callback'],
                            description: 'Async programming style',
                        },
                    },
                    required: ['language'],
                },
            },
            required: ['spec', 'options'],
        },
    },
    {
        name: 'validate_api',
        description: 'Validate API design against best practices and standards. Checks for security, versioning, documentation, and common pitfalls.',
        inputSchema: {
            type: 'object',
            properties: {
                spec: {
                    type: 'object',
                    description: 'OpenAPI specification or GraphQL schema to validate',
                },
            },
            required: ['spec'],
        },
    },
    {
        name: 'generate_mock_server',
        description: 'Generate mock server code for testing and development. Creates a runnable server with mock responses based on API specification.',
        inputSchema: {
            type: 'object',
            properties: {
                spec: {
                    type: 'object',
                    description: 'OpenAPI specification',
                },
                config: {
                    type: 'object',
                    description: 'Mock server configuration',
                    properties: {
                        port: {
                            type: 'number',
                            description: 'Server port (default: 3000)',
                        },
                        framework: {
                            type: 'string',
                            enum: ['express', 'fastify', 'koa', 'hapi'],
                            description: 'Web framework to use',
                        },
                        responseDelay: {
                            type: 'number',
                            description: 'Artificial delay in milliseconds',
                        },
                        includeCORS: {
                            type: 'boolean',
                            description: 'Enable CORS middleware',
                        },
                        includeLogging: {
                            type: 'boolean',
                            description: 'Enable request logging',
                        },
                        dataGeneration: {
                            type: 'string',
                            enum: ['faker', 'custom', 'examples'],
                            description: 'How to generate mock data',
                        },
                    },
                },
            },
            required: ['spec'],
        },
    },
];
/**
 * Create and configure the MCP server
 */
const server = new Server({
    name: 'api-designer',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * Handle tool list requests
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
/**
 * Handle tool execution requests
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'generate_openapi': {
                const { config, endpoints } = args;
                const result = generateOpenAPI(config, endpoints);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'design_rest_api': {
                const { resources, config } = args;
                const result = designRESTEndpoints(resources, config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'create_graphql_schema': {
                const { config, customTypes } = args;
                const result = createGraphQLSchema(config, customTypes);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_client': {
                const { spec, options } = args;
                const result = generateAPIClient(spec, options);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'validate_api': {
                const { spec } = args;
                const result = validateAPIDesign(spec);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_mock_server': {
                const { spec, config } = args;
                const result = generateMockServer(spec, config || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        errors: [errorMessage],
                    }, null, 2),
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
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map