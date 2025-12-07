/**
 * Tests for client-generator.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateTypeScriptRestClient,
  generateTypeScriptGraphQLClient,
  generatePythonRestClient,
} from '../src/generators/client-generator.js';
import { OpenAPISpec, GraphQLSchema, ClientGenerationOptions } from '../src/types.js';

describe('generateTypeScriptRestClient', () => {
  const baseSpec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: { operationId: 'getUsers', responses: {} },
        post: { operationId: 'createUser', responses: {} },
      },
      '/users/{id}': {
        get: { operationId: 'getUser', responses: {} },
      },
    },
  };

  it('should generate axios client by default', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    expect(result).toContain('import axios');
    expect(result).toContain('AxiosInstance');
    expect(result).toContain('class TestAPIClient');
    expect(result).toContain('this.client = axios.create');
  });

  it('should generate fetch client when specified', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'fetch',
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    expect(result).toContain('native fetch API');
    expect(result).not.toContain('axios');
    expect(result).toContain('await fetch');
  });

  it('should generate methods for each endpoint', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    expect(result).toContain('async getUsers');
    expect(result).toContain('async createUser');
    expect(result).toContain('async getUser');
  });

  it('should use correct HTTP methods for axios', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    expect(result).toContain('this.client.get');
    expect(result).toContain('this.client.post');
  });

  it('should use correct HTTP methods for fetch', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'fetch',
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    expect(result).toContain("method: 'GET'");
    expect(result).toContain("method: 'POST'");
  });

  it('should include types when includeTypes is true', () => {
    const specWithSchemas: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
      includeTypes: true,
    };

    const result = generateTypeScriptRestClient(specWithSchemas, options);

    expect(result).toContain('export interface User');
    expect(result).toContain('id: number');
    expect(result).toContain('name: string');
    expect(result).toContain('email?: string'); // Optional since not in required
  });

  it('should map schema types correctly', () => {
    const specWithTypes: OpenAPISpec = {
      ...baseSpec,
      components: {
        schemas: {
          TypeTest: {
            type: 'object',
            properties: {
              stringField: { type: 'string' },
              numberField: { type: 'number' },
              intField: { type: 'integer' },
              boolField: { type: 'boolean' },
              arrayField: { type: 'array', items: { type: 'string' } },
              enumField: { type: 'string', enum: ['A', 'B', 'C'] },
              objectField: { type: 'object', additionalProperties: true },
              refField: { $ref: '#/components/schemas/Other' },
            },
          },
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
      includeTypes: true,
    };

    const result = generateTypeScriptRestClient(specWithTypes, options);

    expect(result).toContain('stringField?: string');
    expect(result).toContain('numberField?: number');
    expect(result).toContain('intField?: number');
    expect(result).toContain('boolField?: boolean');
    expect(result).toContain('arrayField?: string[]');
    expect(result).toContain("'A' | 'B' | 'C'");
    expect(result).toContain('Record<string, any>');
    expect(result).toContain('refField?: Other');
  });

  it('should handle spec without components', () => {
    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
      includeTypes: true,
    };

    const result = generateTypeScriptRestClient(baseSpec, options);

    // Should still generate client without types section
    expect(result).toContain('class TestAPIClient');
    expect(result).not.toContain('export interface');
  });

  it('should handle API title with spaces', () => {
    const specWithSpaces: OpenAPISpec = {
      ...baseSpec,
      info: { title: 'My Cool API', version: '1.0.0' },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const result = generateTypeScriptRestClient(specWithSpaces, options);

    expect(result).toContain('class MyCoolAPIClient');
  });

  it('should skip operations without operationId', () => {
    const specNoId: OpenAPISpec = {
      ...baseSpec,
      paths: {
        '/items': {
          get: { responses: {} }, // No operationId
        },
      },
    };

    const options: ClientGenerationOptions = {
      language: 'typescript',
      outputFormat: 'axios',
    };

    const result = generateTypeScriptRestClient(specNoId, options);

    // Should not have any async methods for endpoints without operationId
    expect(result).not.toMatch(/async \w+\(params/);
  });
});

describe('generateTypeScriptGraphQLClient', () => {
  const baseSchema: GraphQLSchema = {
    types: [{ name: 'User', fields: [] }],
    queries: [],
    mutations: [],
    subscriptions: [],
    sdl: 'type User { id: ID! }',
  };

  const options: ClientGenerationOptions = {
    language: 'typescript',
    outputFormat: 'fetch',
  };

  it('should generate GraphQL client class', () => {
    const result = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(result).toContain('class GraphQLClient');
    expect(result).toContain('constructor(private endpoint: string)');
  });

  it('should include query method', () => {
    const result = generateTypeScriptGraphQLClient(baseSchema, options);

    expect(result).toContain('async query(query: string, variables?: any)');
    expect(result).toContain('fetch(this.endpoint');
    expect(result).toContain("method: 'POST'");
    expect(result).toContain('JSON.stringify({ query, variables })');
  });
});

describe('generatePythonRestClient', () => {
  const baseSpec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: { operationId: 'get_users', responses: {} },
        post: { operationId: 'create_user', responses: {} },
      },
    },
  };

  const options: ClientGenerationOptions = {
    language: 'python',
    outputFormat: 'requests',
  };

  it('should generate Python client class', () => {
    const result = generatePythonRestClient(baseSpec, options);

    expect(result).toContain('import requests');
    expect(result).toContain('from typing import Optional, Dict, Any');
    expect(result).toContain('class TestAPIClient:');
  });

  it('should include constructor with base_url', () => {
    const result = generatePythonRestClient(baseSpec, options);

    expect(result).toContain('def __init__(self, base_url: str):');
    expect(result).toContain('self.base_url = base_url');
  });

  it('should generate methods for each endpoint', () => {
    const result = generatePythonRestClient(baseSpec, options);

    expect(result).toContain('def get_users(self');
    expect(result).toContain('def create_user(self');
  });

  it('should use requests library methods', () => {
    const result = generatePythonRestClient(baseSpec, options);

    expect(result).toContain('requests.get');
    expect(result).toContain('requests.post');
  });

  it('should include path in requests', () => {
    const result = generatePythonRestClient(baseSpec, options);

    expect(result).toContain('/users');
    expect(result).toContain('{self.base_url}');
  });

  it('should handle API title with spaces', () => {
    const specWithSpaces: OpenAPISpec = {
      ...baseSpec,
      info: { title: 'My Python API', version: '1.0.0' },
    };

    const result = generatePythonRestClient(specWithSpaces, options);

    expect(result).toContain('class MyPythonAPIClient:');
  });
});
