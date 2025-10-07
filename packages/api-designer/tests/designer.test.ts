import { describe, it, expect } from 'vitest';
import * as target from '../src/designer.js';

describe('generateOpenAPI()', () => {
  it('should generate OpenAPI spec with valid config', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const result = target.generateOpenAPI(config);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should generate OpenAPI spec with resources', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const, resources: ['users', 'posts'] };
    const result = target.generateOpenAPI(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.openapi).toBe('3.0.3');
      expect(result.data.info.title).toBe('Test API');
      expect(result.data.info.version).toBe('1.0.0');
    }
  });

  it('should include authentication schemes when configured', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const, auth: { type: 'bearer' as const } };
    const result = target.generateOpenAPI(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.components?.securitySchemes).toBeDefined();
      expect(result.data.security).toBeDefined();
    }
  });

  it('should include baseUrl in servers when provided', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const, baseUrl: 'https://api.example.com/v1' };
    const result = target.generateOpenAPI(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.servers).toBeDefined();
      expect(result.data.servers?.[0]?.url).toBe('https://api.example.com/v1');
    }
  });

  it('should include description when provided', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const, description: 'Test description' };
    const result = target.generateOpenAPI(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.info.description).toBe('Test description');
    }
  });

  it('should handle custom endpoints', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const endpoints = [{
      path: '/test',
      method: 'GET' as const,
      summary: 'Test endpoint',
      description: 'A test endpoint',
      operationId: 'getTest',
      tags: ['test'],
      responses: {
        '200': {
          statusCode: 200,
          description: 'Success',
        }
      }
    }];
    const result = target.generateOpenAPI(config, endpoints);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.paths['/test']).toBeDefined();
    }
  });
});

describe('designRESTEndpoints()', () => {
  it('should design REST endpoints with valid inputs', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const result = target.designRESTEndpoints(['users', 'posts'], config);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should generate CRUD endpoints for each resource', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const result = target.designRESTEndpoints(['users'], config);
    expect(result.success).toBe(true);
    if (result.success && Array.isArray(result.data)) {
      expect(result.data.length).toBe(5); // List, Create, Get, Update, Delete
      const methods = result.data.map((e: any) => e.method);
      expect(methods).toContain('GET');
      expect(methods).toContain('POST');
      expect(methods).toContain('PUT');
      expect(methods).toContain('DELETE');
    }
  });

  it('should include pagination parameters in list endpoints', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const result = target.designRESTEndpoints(['users'], config);
    expect(result.success).toBe(true);
    if (result.success && Array.isArray(result.data)) {
      const listEndpoint = result.data.find((e: any) => e.method === 'GET' && e.path === '/users');
      expect(listEndpoint).toBeDefined();
      expect(listEndpoint?.parameters).toBeDefined();
      const paramNames = listEndpoint?.parameters?.map((p: any) => p.name);
      expect(paramNames).toContain('page');
      expect(paramNames).toContain('limit');
    }
  });

  it('should handle multiple resources', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'REST' as const };
    const result = target.designRESTEndpoints(['users', 'posts', 'comments'], config);
    expect(result.success).toBe(true);
    if (result.success && Array.isArray(result.data)) {
      expect(result.data.length).toBe(15); // 5 endpoints per resource
    }
  });
});

describe('createGraphQLSchema()', () => {
  it('should create GraphQL schema with valid config', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'GraphQL' as const, resources: ['User'] };
    const result = target.createGraphQLSchema(config);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should generate types and queries', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'GraphQL' as const, resources: ['User', 'Post'] };
    const result = target.createGraphQLSchema(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.types).toBeDefined();
      expect(result.data.queries).toBeDefined();
      expect(result.data.types.length).toBe(2);
    }
  });

  it('should generate SDL string', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'GraphQL' as const, resources: ['User'] };
    const result = target.createGraphQLSchema(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sdl).toBeDefined();
      expect(typeof result.data.sdl).toBe('string');
      expect(result.data.sdl).toContain('type User');
      expect(result.data.sdl).toContain('type Query');
    }
  });

  it('should create getX and listX queries for each type', () => {
    const config = { name: 'Test API', version: '1.0.0', style: 'GraphQL' as const, resources: ['User'] };
    const result = target.createGraphQLSchema(config);
    expect(result.success).toBe(true);
    if (result.success) {
      const queryNames = result.data.queries.map((q: any) => q.name);
      expect(queryNames).toContain('getUser');
      expect(queryNames).toContain('listUsers');
    }
  });

  it('should accept custom GraphQL types array', () => {
    const types = [{
      name: 'CustomType',
      kind: 'object' as const,
      fields: [
        { name: 'id', type: 'ID!' },
        { name: 'customField', type: 'String!' }
      ]
    }];
    const result = target.createGraphQLSchema(types);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.types.length).toBe(1);
      expect(result.data.types[0].name).toBe('CustomType');
    }
  });
});

describe('generateAPIClient()', () => {
  it('should generate API client with valid spec', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const options = { language: 'typescript' as const };
    const result = target.generateAPIClient(spec, options);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should generate TypeScript REST client', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const options = { language: 'typescript' as const };
    const result = target.generateAPIClient(spec, options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBeDefined();
      expect(typeof result.data.code).toBe('string');
      expect(result.data.language).toBe('typescript');
    }
  });

  it('should generate TypeScript GraphQL client', () => {
    const schema = { types: [], queries: [], mutations: [] };
    const options = { language: 'typescript' as const };
    const result = target.generateAPIClient(schema, options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBeDefined();
    }
  });

  it('should generate Python REST client', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const options = { language: 'python' as const };
    const result = target.generateAPIClient(spec, options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBeDefined();
      expect(result.data.language).toBe('python');
    }
  });

  it('should reject unsupported language', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const options = { language: 'java' as any };
    const result = target.generateAPIClient(spec, options);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should include metadata in result', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const options = { language: 'typescript' as const };
    const result = target.generateAPIClient(spec, options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.metadata).toBeDefined();
      expect(result.metadata.generatedAt).toBeDefined();
    }
  });
});

describe('validateAPIDesign()', () => {
  it('should validate API design with valid spec', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const result = target.validateAPIDesign(spec);
    expect(result).toBeDefined();
  });

  it('should validate OpenAPI spec', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const result = target.validateAPIDesign(spec);
    expect(result.valid).toBeDefined();
  });

  it('should validate GraphQL schema', () => {
    const schema = { types: [], queries: [], mutations: [] };
    const result = target.validateAPIDesign(schema);
    expect(result.valid).toBeDefined();
  });
});

describe('generateMockServer()', () => {
  it('should generate mock server with valid spec', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const config = { framework: 'express' as const };
    const result = target.generateMockServer(spec, config);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should generate Express mock server code', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const config = { framework: 'express' as const };
    const result = target.generateMockServer(spec, config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBeDefined();
      expect(result.data.framework).toBe('express');
    }
  });

  it('should include port in result', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const config = { framework: 'express' as const, port: 4000 };
    const result = target.generateMockServer(spec, config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.port).toBe(4000);
    }
  });

  it('should default to port 3000 when not specified', () => {
    const spec = { openapi: '3.0.0', info: { title: 'Test', version: '1.0.0' }, paths: {} };
    const config = { framework: 'express' as const };
    const result = target.generateMockServer(spec, config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.port).toBe(3000);
    }
  });
});

describe('GraphQLClient class', () => {
  it('should create instance with valid URL', () => {
    const instance = new target.GraphQLClient('https://api.example.com/graphql');
    expect(instance).toBeInstanceOf(target.GraphQLClient);
  });

  it('should have query method', () => {
    const instance = new target.GraphQLClient('https://api.example.com/graphql');
    expect(instance.query).toBeDefined();
    expect(typeof instance.query).toBe('function');
  });
});
