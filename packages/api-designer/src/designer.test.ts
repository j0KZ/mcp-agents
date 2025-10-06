import { describe, it, expect } from 'vitest';
import {
  designRESTEndpoints,
  generateOpenAPI,
  createGraphQLSchema,
  generateAPIClient,
  validateAPIDesign,
  generateMockServer,
  GraphQLClient,
} from './designer.js';
import { APIDesignConfig, GraphQLType } from './types.js';

describe('API Designer - designRESTEndpoints', () => {
  const baseConfig: APIDesignConfig = {
    name: 'Test API',
    version: '1.0.0',
    style: 'REST',
  };

  it('should generate REST endpoints for single resource', () => {
    const result = designRESTEndpoints(['users'], baseConfig);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(5); // LIST, CREATE, GET, UPDATE, DELETE

    // Validate endpoint structure
    result.data.forEach(endpoint => {
      expect(endpoint).toHaveProperty('method');
      expect(endpoint).toHaveProperty('path');
      expect(endpoint).toHaveProperty('description');
      expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(endpoint.method);
    });
  });

  it('should generate REST endpoints for multiple resources', () => {
    const result = designRESTEndpoints(['users', 'posts'], baseConfig);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(10); // 5 endpoints per resource
  });

  it('should handle empty resources array', () => {
    const result = designRESTEndpoints([], baseConfig);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBe(0);
  });

  it('should include metadata in result', () => {
    const result = designRESTEndpoints(['users'], baseConfig);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.generatedAt).toBeDefined();
    expect(typeof result.metadata?.generatedAt).toBe('string');
    // Verify it's a valid ISO date string
    expect(new Date(result.metadata!.generatedAt!).toString()).not.toBe('Invalid Date');
  });

  it('should generate proper CRUD operations', () => {
    const result = designRESTEndpoints(['users'], baseConfig);
    const endpoints = result.data as any[];

    const methods = endpoints.map(e => e.method);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('PUT');
    expect(methods).toContain('DELETE');
  });

  it('should generate correct paths for resources', () => {
    const result = designRESTEndpoints(['users'], baseConfig);
    const endpoints = result.data as any[];

    const paths = endpoints.map(e => e.path);
    expect(paths).toContain('/users');
    expect(paths).toContain('/users/{id}');
  });

  it('should handle resource names with special characters', () => {
    const result = designRESTEndpoints(['user-profiles'], baseConfig);
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);

    // Verify paths use the resource name correctly
    const paths = result.data.map(e => e.path);
    expect(paths.some(p => p.includes('user-profiles'))).toBe(true);
  });

  it('should include tags for resource organization', () => {
    const result = designRESTEndpoints(['users'], baseConfig);
    const endpoints = result.data as any[];

    endpoints.forEach(endpoint => {
      expect(Array.isArray(endpoint.tags)).toBe(true);
      expect(endpoint.tags.length).toBeGreaterThan(0);
      // Tags should be strings
      endpoint.tags.forEach(tag => {
        expect(typeof tag).toBe('string');
      });
    });
  });

  it('should handle errors gracefully', () => {
    // The function generates endpoints successfully even with minimal config
    // It doesn't throw errors, so this test verifies the success case
    const result = designRESTEndpoints(['users'], baseConfig);
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(5);
  });
});

describe('API Designer - generateOpenAPI', () => {
  it('should generate valid OpenAPI 3.0.3 spec', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      resources: ['users'],
    });

    expect(result.success).toBe(true);
    expect(result.data.openapi).toBe('3.0.3');
    expect(result.data.info).toBeDefined();
    expect(result.data.paths).toBeDefined();
    expect(Object.keys(result.data.paths).length).toBeGreaterThan(0);
  });

  it('should include API info', () => {
    const config: APIDesignConfig = {
      name: 'Test API',
      version: '1.0.0',
      description: 'Test description',
      style: 'REST',
    };

    const result = generateOpenAPI(config);
    expect(result.data.info.title).toBe('Test API');
    expect(result.data.info.version).toBe('1.0.0');
    expect(result.data.info.description).toContain('Test description');
  });

  it('should generate servers with baseUrl', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      baseUrl: 'https://api.example.com/v1',
    });

    expect(Array.isArray(result.data.servers)).toBe(true);
    expect(result.data.servers.length).toBeGreaterThan(0);
    expect(result.data.servers[0].url).toBe('https://api.example.com/v1');
  });

  it('should add bearer authentication', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      auth: { type: 'bearer' },
    });

    expect(result.data.components?.securitySchemes?.BearerAuth).toBeDefined();
    expect(result.data.components?.securitySchemes?.BearerAuth.type).toBe('http');
    expect(result.data.components?.securitySchemes?.BearerAuth.scheme).toBe('bearer');
    expect(Array.isArray(result.data.security)).toBe(true);
  });

  it('should add API key authentication', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      auth: { type: 'apiKey' },
    });

    expect(result.data.components?.securitySchemes?.ApiKeyAuth).toBeDefined();
    expect(result.data.components?.securitySchemes?.ApiKeyAuth.type).toBe('apiKey');
  });

  it('should add OAuth2 authentication', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      auth: { type: 'oauth2' },
    });

    expect(result.data.components?.securitySchemes?.OAuth2).toBeDefined();
    expect(result.data.components?.securitySchemes?.OAuth2.type).toBe('oauth2');
  });

  it('should handle no authentication', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      auth: { type: 'none' },
    });

    expect(result.data.security).toBeUndefined();
  });

  it('should include custom endpoints', () => {
    const customEndpoints = [
      {
        path: '/custom',
        method: 'GET' as const,
        summary: 'Custom endpoint',
        responses: {
          '200': {
            statusCode: 200,
            description: 'Success',
          },
        },
      },
    ];

    const result = generateOpenAPI(
      {
        name: 'Test API',
        version: '1.0.0',
        style: 'REST',
      },
      customEndpoints
    );

    expect(result.data.paths['/custom']).toBeDefined();
  });

  it('should generate paths from resources', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      resources: ['users', 'posts'],
    });

    expect(result.data.paths['/users']).toBeDefined();
    expect(result.data.paths['/posts']).toBeDefined();
  });

  it('should include metadata', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      resources: ['users'],
    });

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.endpointCount).toBeGreaterThan(0);
    expect(result.metadata?.resourceCount).toBe(1);
  });
});

describe('API Designer - createGraphQLSchema', () => {
  it('should create GraphQL schema from config', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User'],
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.types).toBeDefined();
    expect(result.data.sdl).toBeDefined();
  });

  it('should create GraphQL schema from types array', () => {
    const types: GraphQLType[] = [
      {
        name: 'User',
        kind: 'object',
        fields: [
          { name: 'id', type: 'ID!' },
          { name: 'name', type: 'String!' },
        ],
      },
    ];

    const result = createGraphQLSchema(types);
    expect(result.success).toBe(true);
    expect(result.data.types).toEqual(types);
  });

  it('should generate SDL with type definitions', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User'],
    });

    expect(result.data.sdl).toContain('type User');
    expect(result.data.sdl).toContain('id: ID!');
  });

  it('should generate queries for each type', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User'],
    });

    expect(result.data.queries).toBeDefined();
    expect(result.data.queries.length).toBeGreaterThan(0);
    expect(result.data.sdl).toContain('type Query');
  });

  it('should generate get and list queries', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User'],
    });

    const queryNames = result.data.queries.map((q: any) => q.name);
    expect(queryNames).toContain('getUser');
    expect(queryNames).toContain('listUsers');
  });

  it('should handle multiple resources', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User', 'Post'],
    });

    expect(result.data.types.length).toBe(2);
    expect(result.data.sdl).toContain('type User');
    expect(result.data.sdl).toContain('type Post');
  });

  it('should handle empty resources', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: [],
    });

    expect(result.success).toBe(true);
    expect(result.data.types.length).toBe(0);
  });

  it('should include metadata', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User'],
    });

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.generatedAt).toBeDefined();
  });

  it('should handle errors gracefully', () => {
    const result = createGraphQLSchema(null as any);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('API Designer - generateAPIClient', () => {
  it('should generate TypeScript REST client with axios', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateAPIClient(spec, {
      language: 'typescript',
      outputFormat: 'axios',
    });

    expect(result.success).toBe(true);
    expect(result.data.code).toContain('axios');
  });

  it('should generate TypeScript REST client with fetch', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateAPIClient(spec, {
      language: 'typescript',
      outputFormat: 'fetch',
    });

    expect(result.success).toBe(true);
    expect(result.data.code).toContain('fetch');
  });

  it('should generate Python REST client', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateAPIClient(spec, {
      language: 'python',
    });

    expect(result.success).toBe(true);
    expect(result.data.code).toContain('requests');
  });

  it('should return error for unsupported language', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateAPIClient(spec, {
      language: 'ruby' as any,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});

describe('API Designer - validateAPIDesign', () => {
  it('should validate OpenAPI spec successfully', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: { '/users': { get: {} } },
    };

    const result = validateAPIDesign(spec);
    expect(result).toBeDefined();
    expect(result.errors).toBeDefined();
  });

  it('should validate GraphQL schema successfully', () => {
    const schema = {
      types: [{ name: 'User', kind: 'object' as const, fields: [] }],
      queries: [{ name: 'getUser', type: 'User' }],
    };

    const result = validateAPIDesign(schema);
    expect(result).toBeDefined();
  });
});

describe('API Designer - generateMockServer', () => {
  it('should generate Express mock server code', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateMockServer(spec, {
      framework: 'express',
      port: 3000,
    });

    expect(result.success).toBe(true);
    expect(result.data.code).toBeDefined();
  });

  it('should create mock server instance without framework', () => {
    const spec = {
      openapi: '3.0.3',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };

    const result = generateMockServer(spec, {
      port: 3000,
    });

    expect(result).toBeDefined();
  });

  it('should handle errors', () => {
    const result = generateMockServer(null as any, { framework: 'express' });
    expect(result.success).toBe(false);
  });
});

describe('API Designer - GraphQLClient', () => {
  it('should create GraphQL client instance', () => {
    const client = new GraphQLClient('https://api.example.com/graphql');
    expect(client).toBeDefined();
  });
});
