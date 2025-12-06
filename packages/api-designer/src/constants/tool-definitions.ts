/**
 * API Designer - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

export const GENERATE_OPENAPI_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate REST API spec',
    description: 'Create OpenAPI 3.0 specification for user management API',
    input: {
      config: {
        name: 'User Management API',
        version: '1.0.0',
        description: 'API for managing users and authentication',
        baseUrl: 'https://api.example.com/v1',
        style: 'REST',
        auth: { type: 'bearer' },
        resources: ['users', 'roles', 'permissions'],
      },
    },
    output: {
      openapi: '3.0.0',
      info: { title: 'User Management API', version: '1.0.0' },
      paths: {
        '/users': { get: {}, post: {} },
        '/users/{id}': { get: {}, put: {}, delete: {} },
      },
      components: { schemas: { User: {}, Role: {} } },
    },
  },
];

export const DESIGN_REST_API_EXAMPLES: ToolExample[] = [
  {
    name: 'Design CRUD endpoints',
    description: 'Generate RESTful endpoints for resources',
    input: {
      resources: ['products', 'categories', 'orders'],
      config: {
        name: 'E-commerce API',
        version: '1.0.0',
        style: 'REST',
        conventions: { namingCase: 'camelCase' },
      },
    },
    output: {
      endpoints: [
        { method: 'GET', path: '/products', description: 'List all products' },
        { method: 'POST', path: '/products', description: 'Create a product' },
        { method: 'GET', path: '/products/{id}', description: 'Get product by ID' },
        { method: 'PUT', path: '/products/{id}', description: 'Update product' },
        { method: 'DELETE', path: '/products/{id}', description: 'Delete product' },
      ],
    },
  },
];

export const CREATE_GRAPHQL_SCHEMA_EXAMPLES: ToolExample[] = [
  {
    name: 'Create GraphQL schema',
    description: 'Generate GraphQL SDL from resources',
    input: {
      config: {
        name: 'Blog API',
        version: '1.0.0',
        style: 'GraphQL',
        resources: ['Post', 'Author', 'Comment'],
      },
    },
    output: {
      sdl: 'type Post {\n  id: ID!\n  title: String!\n  author: Author!\n  comments: [Comment!]!\n}\n\ntype Query {\n  posts: [Post!]!\n  post(id: ID!): Post\n}\n\ntype Mutation {\n  createPost(title: String!, authorId: ID!): Post!\n}',
      types: ['Post', 'Author', 'Comment'],
      queries: ['posts', 'post'],
      mutations: ['createPost', 'updatePost', 'deletePost'],
    },
  },
];

export const GENERATE_CLIENT_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate TypeScript client',
    description: 'Create typed API client from OpenAPI spec',
    input: {
      spec: { openapi: '3.0.0', paths: { '/users': {} } },
      options: {
        language: 'typescript',
        outputFormat: 'axios',
        includeTypes: true,
        asyncStyle: 'async-await',
      },
    },
    output: {
      files: [
        { name: 'client.ts', content: 'export class ApiClient { async getUsers() { ... } }' },
        { name: 'types.ts', content: 'export interface User { id: string; name: string; }' },
      ],
      language: 'typescript',
    },
  },
];

export const VALIDATE_API_EXAMPLES: ToolExample[] = [
  {
    name: 'Validate API design',
    description: 'Check API against best practices',
    input: {
      spec: { openapi: '3.0.0', paths: { '/getUsers': {} } },
    },
    output: {
      valid: false,
      issues: [
        { severity: 'warning', message: 'Avoid verbs in path names', path: '/getUsers' },
        { severity: 'error', message: 'Missing security definition', path: 'securitySchemes' },
      ],
      score: 65,
    },
  },
];

export const GENERATE_MOCK_SERVER_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate Express mock server',
    description: 'Create mock server for testing',
    input: {
      spec: { openapi: '3.0.0', paths: { '/users': { get: {} } } },
      config: { port: 3000, framework: 'express', includeCORS: true },
    },
    output: {
      files: [
        { name: 'server.js', content: 'const express = require("express"); ...' },
        { name: 'routes/users.js', content: 'router.get("/", (req, res) => { ... });' },
      ],
      runCommand: 'node server.js',
      port: 3000,
    },
  },
];

export const API_DESIGNER_TOOLS = [
  {
    name: 'generate_openapi',
    description: `Generate OpenAPI 3.0 specification from API configuration. Creates comprehensive API documentation with endpoints, schemas, security, and more.
Keywords: openapi, swagger, specification, api docs, rest, schema.
Use when: designing new APIs, documenting existing APIs, creating contracts.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        config: {
          type: 'object' as const,
          description: 'API design configuration',
          properties: {
            name: { type: 'string' as const },
            version: { type: 'string' as const },
            description: { type: 'string' as const },
            baseUrl: { type: 'string' as const },
            style: { type: 'string' as const, enum: ['REST', 'GraphQL', 'gRPC', 'WebSocket'] },
            auth: { type: 'object' as const },
            resources: { type: 'array' as const, items: { type: 'string' as const } },
          },
          required: ['name', 'version', 'style'],
        },
        endpoints: { type: 'array' as const, description: 'Optional custom REST endpoints' },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['config'],
    },
    examples: GENERATE_OPENAPI_EXAMPLES,
  },
  {
    name: 'design_rest_api',
    description: `Design RESTful API endpoints following best practices. Automatically generates CRUD operations for resources with proper HTTP methods, status codes, and pagination.
Keywords: rest, endpoints, crud, http, routes, resources.
Use when: starting new REST API, standardizing endpoints, resource-based design.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        resources: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Resource names',
        },
        config: { type: 'object' as const, description: 'API design configuration' },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['resources', 'config'],
    },
    examples: DESIGN_REST_API_EXAMPLES,
  },
  {
    name: 'create_graphql_schema',
    description: `Create GraphQL schema with types, queries, mutations, and subscriptions. Generates complete SDL with proper type definitions and resolvers.
Keywords: graphql, schema, types, queries, mutations, sdl.
Use when: designing GraphQL API, creating type definitions, generating resolvers.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        config: { type: 'object' as const, description: 'API design configuration' },
        customTypes: {
          type: 'array' as const,
          description: 'Optional custom GraphQL type definitions',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['config'],
    },
    examples: CREATE_GRAPHQL_SCHEMA_EXAMPLES,
  },
  {
    name: 'generate_client',
    description: `Generate API client code in various languages (TypeScript, Python, etc.). Supports multiple HTTP libraries and includes type definitions.
Keywords: client, sdk, typescript, python, axios, fetch, codegen.
Use when: creating API clients, generating SDKs, type-safe API calls.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        spec: { type: 'object' as const, description: 'OpenAPI specification or GraphQL schema' },
        options: {
          type: 'object' as const,
          properties: {
            language: {
              type: 'string' as const,
              enum: ['typescript', 'javascript', 'python', 'java', 'csharp', 'go', 'ruby', 'php'],
            },
            outputFormat: {
              type: 'string' as const,
              enum: ['axios', 'fetch', 'sdk', 'openapi-generator'],
            },
            includeTypes: { type: 'boolean' as const },
            includeTests: { type: 'boolean' as const },
          },
          required: ['language'],
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['spec', 'options'],
    },
    examples: GENERATE_CLIENT_EXAMPLES,
  },
  {
    name: 'validate_api',
    description: `Validate API design against best practices and standards. Checks for security, versioning, documentation, and common pitfalls.
Keywords: validate, lint, best practices, security, standards.
Use when: reviewing API design, ensuring quality, pre-release checks.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        spec: {
          type: 'object' as const,
          description: 'OpenAPI specification or GraphQL schema to validate',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['spec'],
    },
    examples: VALIDATE_API_EXAMPLES,
  },
  {
    name: 'generate_mock_server',
    description: `Generate mock server code for testing and development. Creates a runnable server with mock responses based on API specification.
Keywords: mock, server, testing, development, express, fastify.
Use when: frontend development, API testing, prototyping, CI/CD.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        spec: { type: 'object' as const, description: 'OpenAPI specification' },
        config: {
          type: 'object' as const,
          properties: {
            port: { type: 'number' as const },
            framework: { type: 'string' as const, enum: ['express', 'fastify', 'koa', 'hapi'] },
            includeCORS: { type: 'boolean' as const },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['spec'],
    },
    examples: GENERATE_MOCK_SERVER_EXAMPLES,
  },
];
