# API Designer MCP

> Comprehensive API design, generation, and validation toolkit for Model Context Protocol

Design, document, and generate production-ready APIs with OpenAPI, GraphQL, REST best practices, client code generation, and mock servers.

## Features

- **OpenAPI 3.0 Generation**: Generate complete OpenAPI specifications with schemas, security, and documentation
- **REST API Design**: Automatically design RESTful endpoints following best practices
- **GraphQL Schema Creation**: Create GraphQL schemas with types, queries, mutations, and subscriptions
- **Client Code Generation**: Generate API clients in TypeScript, Python, and more
- **API Validation**: Validate designs against industry best practices and standards
- **Mock Server Generation**: Create runnable mock servers for testing and development

## Installation

```bash
npm install @my-claude-agents/api-designer
```

Or use directly with npx:

```bash
npx @my-claude-agents/api-designer
```

## MCP Configuration

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "api-designer": {
      "command": "npx",
      "args": ["@my-claude-agents/api-designer"]
    }
  }
}
```

## Available MCP Tools

### 1. generate_openapi

Generate OpenAPI 3.0 specification from configuration.

**Input:**
```typescript
{
  config: {
    name: "User Management API",
    version: "1.0.0",
    description: "API for managing users and authentication",
    baseUrl: "https://api.example.com/v1",
    style: "REST",
    auth: {
      type: "bearer"
    },
    resources: ["users", "roles", "permissions"],
    conventions: {
      namingCase: "camelCase",
      versioning: "url",
      pagination: "offset"
    }
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "openapi": "3.0.3",
    "info": {
      "title": "User Management API",
      "version": "1.0.0"
    },
    "paths": {
      "/users": { ... },
      "/users/{id}": { ... }
    },
    "components": {
      "schemas": { ... },
      "securitySchemes": { ... }
    }
  },
  "metadata": {
    "endpointCount": 15,
    "resourceCount": 3
  }
}
```

### 2. design_rest_api

Design RESTful API endpoints with CRUD operations.

**Input:**
```typescript
{
  resources: ["products", "categories", "orders"],
  config: {
    name: "E-commerce API",
    version: "2.0.0",
    style: "REST",
    conventions: {
      namingCase: "snake_case",
      pagination: "cursor"
    }
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": [
    {
      "path": "/products",
      "method": "GET",
      "summary": "List all products",
      "parameters": [...],
      "responses": { ... }
    },
    {
      "path": "/products/{id}",
      "method": "GET",
      "summary": "Get product by ID",
      "parameters": [...],
      "responses": { ... }
    }
  ],
  "metadata": {
    "endpointCount": 15,
    "resourceCount": 3
  }
}
```

### 3. create_graphql_schema

Create GraphQL schema with types and operations.

**Input:**
```typescript
{
  config: {
    name: "Blog GraphQL API",
    version: "1.0.0",
    style: "GraphQL",
    resources: ["User", "Post", "Comment"]
  },
  customTypes: [
    {
      name: "Post",
      kind: "object",
      fields: [
        { name: "id", type: "ID!" },
        { name: "title", type: "String!" },
        { name: "content", type: "String!" },
        { name: "author", type: "User!" }
      ]
    }
  ]
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "schema": {
      "types": [...],
      "queries": [...],
      "mutations": [...]
    },
    "sdl": "type User { ... }\ntype Post { ... }\ntype Query { ... }"
  },
  "metadata": {
    "schemaCount": 8,
    "resourceCount": 3
  }
}
```

### 4. generate_client

Generate API client code in various languages.

**Input:**
```typescript
{
  spec: { /* OpenAPI spec */ },
  options: {
    language: "typescript",
    outputFormat: "axios",
    includeTypes: true,
    includeTests: false,
    asyncStyle: "async-await"
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "code": "import axios from 'axios';\n\nexport interface User { ... }\n\nexport class UserManagementAPIClient { ... }",
    "language": "typescript",
    "format": "axios"
  }
}
```

### 5. validate_api

Validate API design against best practices.

**Input:**
```typescript
{
  spec: { /* OpenAPI or GraphQL schema */ }
}
```

**Output:**
```json
{
  "valid": false,
  "errors": [
    {
      "path": "security",
      "message": "No security scheme defined",
      "severity": "error",
      "code": "NO_SECURITY",
      "suggestion": "Add authentication to protect your API"
    }
  ],
  "warnings": [
    {
      "path": "servers",
      "message": "Server URLs do not include version numbers",
      "severity": "warning",
      "code": "NO_VERSIONING",
      "suggestion": "Include version in URL (e.g., /v1/)"
    }
  ]
}
```

### 6. generate_mock_server

Generate mock server code for testing.

**Input:**
```typescript
{
  spec: { /* OpenAPI spec */ },
  config: {
    port: 3000,
    framework: "express",
    responseDelay: 100,
    includeCORS: true,
    includeLogging: true,
    dataGeneration: "faker"
  }
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "code": "import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\n...",
    "framework": "express",
    "port": 3000
  },
  "metadata": {
    "endpointCount": 15
  }
}
```

## Programmatic Usage

```typescript
import {
  generateOpenAPI,
  designRESTEndpoints,
  createGraphQLSchema,
  generateAPIClient,
  validateAPIDesign,
  generateMockServer
} from '@my-claude-agents/api-designer';

// Generate OpenAPI spec
const openApiResult = generateOpenAPI({
  name: 'My API',
  version: '1.0.0',
  style: 'REST',
  resources: ['users', 'posts'],
  auth: { type: 'bearer' }
});

console.log(openApiResult.data); // OpenAPI spec

// Design REST endpoints
const endpointsResult = designRESTEndpoints(['products', 'orders'], {
  name: 'Shop API',
  version: '1.0.0',
  style: 'REST'
});

console.log(endpointsResult.data); // Array of endpoints

// Create GraphQL schema
const graphqlResult = createGraphQLSchema({
  name: 'Blog API',
  version: '1.0.0',
  style: 'GraphQL',
  resources: ['User', 'Post', 'Comment']
});

console.log(graphqlResult.data.sdl); // GraphQL SDL

// Generate client
const clientResult = generateAPIClient(openApiResult.data, {
  language: 'typescript',
  outputFormat: 'axios',
  includeTypes: true
});

console.log(clientResult.data.code); // TypeScript client code

// Validate API
const validationResult = validateAPIDesign(openApiResult.data);
console.log(validationResult.valid, validationResult.errors);

// Generate mock server
const mockResult = generateMockServer(openApiResult.data, {
  framework: 'express',
  port: 3000,
  includeCORS: true
});

console.log(mockResult.data.code); // Express server code
```

## Use Cases

### 1. Design a New API

```typescript
// Start by designing REST endpoints
const endpoints = designRESTEndpoints(['users', 'products', 'orders'], {
  name: 'E-commerce API',
  version: '1.0.0',
  style: 'REST',
  auth: { type: 'bearer' },
  conventions: {
    namingCase: 'camelCase',
    versioning: 'url',
    pagination: 'cursor'
  }
});

// Generate OpenAPI spec
const spec = generateOpenAPI({
  name: 'E-commerce API',
  version: '1.0.0',
  style: 'REST',
  resources: ['users', 'products', 'orders'],
  auth: { type: 'bearer' }
}, endpoints.data);

// Validate the design
const validation = validateAPIDesign(spec.data);
if (!validation.valid) {
  console.error('API design issues:', validation.errors);
}
```

### 2. Generate Client SDK

```typescript
// Generate TypeScript client
const client = generateAPIClient(spec.data, {
  language: 'typescript',
  outputFormat: 'axios',
  includeTypes: true,
  asyncStyle: 'async-await'
});

// Save to file
import fs from 'fs/promises';
await fs.writeFile('src/api-client.ts', client.data.code);
```

### 3. Create Mock Server for Testing

```typescript
// Generate mock server
const mockServer = generateMockServer(spec.data, {
  framework: 'express',
  port: 3001,
  includeCORS: true,
  includeLogging: true,
  responseDelay: 200
});

// Save and run
await fs.writeFile('mock-server.js', mockServer.data.code);
// Run: node mock-server.js
```

### 4. Design GraphQL API

```typescript
// Create GraphQL schema
const schema = createGraphQLSchema({
  name: 'Social Media API',
  version: '1.0.0',
  style: 'GraphQL',
  resources: ['User', 'Post', 'Comment', 'Like']
}, [
  {
    name: 'Post',
    kind: 'object',
    fields: [
      { name: 'id', type: 'ID!' },
      { name: 'title', type: 'String!' },
      { name: 'content', type: 'String!' },
      { name: 'author', type: 'User!' },
      { name: 'comments', type: '[Comment!]!' },
      { name: 'likes', type: '[Like!]!' }
    ]
  }
]);

console.log(schema.data.sdl); // GraphQL schema definition
```

## Best Practices

### API Design Principles

1. **Versioning**: Always include version in URLs (`/v1/`, `/v2/`)
2. **Authentication**: Use bearer tokens or OAuth2 for secure APIs
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Error Handling**: Return consistent error formats (RFC 7807)
5. **Documentation**: Generate comprehensive OpenAPI specs
6. **Naming Conventions**: Be consistent (camelCase vs snake_case)

### REST API Guidelines

- Use plural nouns for resources (`/users`, `/products`)
- Use HTTP methods correctly (GET, POST, PUT, DELETE)
- Return appropriate status codes (200, 201, 400, 404, etc.)
- Implement HATEOAS for discoverability
- Support filtering, sorting, and searching

### GraphQL Guidelines

- Use meaningful type names (PascalCase)
- Implement proper error handling
- Use input types for mutations
- Support pagination with connections
- Add descriptions to all fields

## TypeScript Types

```typescript
import {
  APIDesignConfig,
  OpenAPISpec,
  RESTEndpoint,
  GraphQLSchema,
  ClientGenerationOptions,
  MockServerConfig,
  ValidationResult
} from '@my-claude-agents/api-designer';
```

## Error Handling

All functions return a consistent result format:

```typescript
interface APIDesignResult {
  success: boolean;
  data?: any;
  errors?: string[];
  warnings?: string[];
  metadata?: {
    endpointCount?: number;
    resourceCount?: number;
    schemaCount?: number;
    generatedAt?: string;
  };
}
```

## Examples

See the [examples](./examples) directory for complete examples:

- REST API design
- GraphQL schema creation
- Client generation
- Mock server setup
- API validation

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT © j0kz

## Support

- Issues: [GitHub Issues](https://github.com/your-username/my-claude-agents/issues)
- Documentation: [Full API Docs](https://your-docs-url.com)

---

Built with ❤️ for the MCP ecosystem
