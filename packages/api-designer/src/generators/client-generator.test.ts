import { describe, it, expect } from 'vitest';
import {
  generateTypeScriptRestClient,
  generateTypeScriptGraphQLClient,
  generatePythonRestClient,
} from './client-generator.js';
import { OpenAPISpec, GraphQLSchema, ClientGenerationOptions } from '../types.js';

describe('Client Generator - generateTypeScriptRestClient', () => {
  const baseSpec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API description',
      license: { name: 'MIT' },
    },
    paths: {},
    components: {
      schemas: {},
      securitySchemes: {},
    },
    tags: [],
  };

  it('should generate TypeScript client with axios', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('import axios');
    expect(code).toContain('AxiosInstance');
  });

  it('should generate TypeScript client with fetch', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'fetch',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('fetch');
    expect(code).not.toContain('axios');
  });

  it('should generate client class with correct name', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('class TestAPIClient');
  });

  it('should include baseURL property', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('private baseURL: string');
  });

  it('should include axios client property when using axios', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('private client: AxiosInstance');
  });

  it('should generate constructor with config parameter', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(baseSpec, options);

    expect(code).toContain('constructor(baseURL: string, config?: any)');
  });

  it('should generate methods for each endpoint', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: {
            operationId: 'listUsers',
            summary: 'List users',
          },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('async listUsers');
  });

  it('should generate axios method calls', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: {
            operationId: 'getUsers',
            summary: 'Get users',
          },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('this.client.get');
  });

  it('should generate fetch method calls', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          post: {
            operationId: 'createUser',
            summary: 'Create user',
          },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'fetch',
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('await fetch');
    expect(code).toContain('POST');
  });

  it('should include type definitions when requested', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
            required: ['id'],
          },
        },
        securitySchemes: {},
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
      includeTypes: true,
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('export interface User');
    expect(code).toContain('id: string');
    expect(code).toContain('name?: string');
  });

  it('should handle required and optional properties', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          Product: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
            },
            required: ['id', 'name'],
          },
        },
        securitySchemes: {},
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
      includeTypes: true,
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('id: string');
    expect(code).toContain('name: string');
    expect(code).toContain('price?: number');
  });

  it('should map schema types to TypeScript types correctly', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          Types: {
            type: 'object',
            properties: {
              str: { type: 'string' },
              num: { type: 'number' },
              int: { type: 'integer' },
              bool: { type: 'boolean' },
              arr: { type: 'array', items: { type: 'string' } },
              obj: { type: 'object', additionalProperties: true },
            },
          },
        },
        securitySchemes: {},
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      includeTypes: true,
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('str?: string');
    expect(code).toContain('num?: number');
    expect(code).toContain('int?: number');
    expect(code).toContain('bool?: boolean');
    expect(code).toContain('arr?: string[]');
    expect(code).toContain('obj?: Record<string, any>');
  });

  it('should handle enum types', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          Status: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['active', 'inactive', 'pending'],
              },
            },
          },
        },
        securitySchemes: {},
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      includeTypes: true,
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain("'active' | 'inactive' | 'pending'");
  });

  it('should handle schema references', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              profile: { $ref: '#/components/schemas/Profile' },
            },
          },
          Profile: {
            type: 'object',
            properties: {
              bio: { type: 'string' },
            },
          },
        },
        securitySchemes: {},
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      includeTypes: true,
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('profile?: Profile');
  });

  it('should handle multiple HTTP methods', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'listUsers', summary: 'List' },
          post: { operationId: 'createUser', summary: 'Create' },
        },
        '/users/{id}': {
          get: { operationId: 'getUser', summary: 'Get' },
          put: { operationId: 'updateUser', summary: 'Update' },
          delete: { operationId: 'deleteUser', summary: 'Delete' },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'fetch',
    };

    const code = generateTypeScriptRestClient(spec, options);

    expect(code).toContain('async listUsers');
    expect(code).toContain('async createUser');
    expect(code).toContain('async getUser');
    expect(code).toContain('async updateUser');
    expect(code).toContain('async deleteUser');
  });
});

describe('Client Generator - generateTypeScriptGraphQLClient', () => {
  const baseSchema: GraphQLSchema = {
    types: [
      {
        name: 'User',
        kind: 'object',
        fields: [
          { name: 'id', type: 'ID!' },
          { name: 'name', type: 'String!' },
        ],
      },
    ],
    queries: [{ name: 'getUser', type: 'User' }],
  };

  const options: ClientGenerationOptions = {
    language: 'typescript',
  };

  it('should generate GraphQL client class', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('class GraphQLClient');
  });

  it('should include endpoint property', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('private endpoint: string');
  });

  it('should include constructor', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('constructor(private endpoint: string)');
  });

  it('should include query method', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('async query(query: string, variables?: any)');
  });

  it('should use fetch for GraphQL requests', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('await fetch(this.endpoint');
    expect(code).toContain("method: 'POST'");
  });

  it('should include proper headers', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain("'Content-Type': 'application/json'");
  });

  it('should send query and variables in body', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('JSON.stringify({ query, variables })');
  });

  it('should return JSON response', () => {
    const code = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(code).toContain('return response.json()');
  });
});

describe('Client Generator - generatePythonRestClient', () => {
  const baseSpec: OpenAPISpec = {
    openapi: '3.0.3',
    info: {
      title: 'Test API',
      version: '1.0.0',
      license: { name: 'MIT' },
    },
    paths: {},
    components: { schemas: {}, securitySchemes: {} },
    tags: [],
  };

  const options: ClientGenerationOptions = {
    language: 'python',
  };

  it('should import requests library', () => {
    const code = generatePythonRestClient(baseSpec, options);

    expect(code).toContain('import requests');
  });

  it('should import typing modules', () => {
    const code = generatePythonRestClient(baseSpec, options);

    expect(code).toContain('from typing import Optional, Dict, Any');
  });

  it('should generate client class', () => {
    const code = generatePythonRestClient(baseSpec, options);

    expect(code).toContain('class TestAPIClient:');
  });

  it('should include __init__ method', () => {
    const code = generatePythonRestClient(baseSpec, options);

    expect(code).toContain('def __init__(self, base_url: str):');
    expect(code).toContain('self.base_url = base_url');
  });

  it('should generate methods for endpoints', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'listUsers', summary: 'List users' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('def listUsers(self');
  });

  it('should use requests with correct HTTP method', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'getUsers', summary: 'Get' },
          post: { operationId: 'createUser', summary: 'Create' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('requests.get');
    expect(code).toContain('requests.post');
  });

  it('should use f-strings for URL construction', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'getUsers', summary: 'Get' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    // Python code uses f-string format with curly braces doubled for escaping
    expect(code).toContain('f"{{self.base_url}}/users"');
  });

  it('should include params parameter', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'listUsers', summary: 'List' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('params: Optional[Dict[str, Any]] = None');
    expect(code).toContain('json=params');
  });

  it('should return JSON response', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'getUsers', summary: 'Get' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('.json()');
  });

  it('should handle multiple paths', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users': {
          get: { operationId: 'listUsers', summary: 'List' },
        },
        '/posts': {
          get: { operationId: 'listPosts', summary: 'List' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('def listUsers');
    expect(code).toContain('def listPosts');
  });

  it('should handle PUT and DELETE methods', () => {
    const spec: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/users/{id}': {
          put: { operationId: 'updateUser', summary: 'Update' },
          delete: { operationId: 'deleteUser', summary: 'Delete' },
        },
      },
    };

    const code = generatePythonRestClient(spec, options);

    expect(code).toContain('requests.put');
    expect(code).toContain('requests.delete');
  });
});
