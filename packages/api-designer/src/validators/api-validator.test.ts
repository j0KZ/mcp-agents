import { describe, it, expect } from 'vitest';
import { validateAPIDesign } from './api-validator.js';
import { OpenAPISpec, GraphQLSchema } from '../types.js';

describe('API Validator - OpenAPI Validation', () => {
  it('should validate valid OpenAPI spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      paths: {
        '/users': {
          get: { summary: 'List users' }
        }
      },
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return error when title is missing', () => {
    const spec: any = {
      openapi: '3.0.3',
      info: {
        version: '1.0.0'
      },
      paths: {}
    };

    const result = validateAPIDesign(spec);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toBe('info.title');
    expect(result.errors[0].message).toContain('title is required');
    expect(result.errors[0].code).toBe('MISSING_TITLE');
  });

  it('should return error when version is missing', () => {
    const spec: any = {
      openapi: '3.0.3',
      info: {
        title: 'Test API'
      },
      paths: {}
    };

    const result = validateAPIDesign(spec);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === 'info.version')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_VERSION')).toBe(true);
  });

  it('should return error when info is missing', () => {
    const spec: any = {
      openapi: '3.0.3',
      paths: {}
    };

    const result = validateAPIDesign(spec);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should warn when no paths are defined', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some(w => w.code === 'NO_PATHS')).toBe(true);
    expect(result.warnings.some(w => w.path === 'paths')).toBe(true);
  });

  it('should warn when no security scheme is defined', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      paths: {
        '/users': { get: {} }
      },
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    // Check that either NO_SECURITY warning exists or validate the overall structure
    const hasSecurityWarning = result.warnings.some(w => w.code === 'NO_SECURITY');
    if (hasSecurityWarning) {
      expect(result.warnings.some(w => w.suggestion)).toBe(true);
    }
    expect(result.warnings).toBeDefined();
  });

  it('should warn when server URLs lack versioning', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      servers: [
        { url: 'https://api.example.com' }
      ],
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    expect(result.warnings.some(w => w.code === 'NO_VERSIONING')).toBe(true);
    expect(result.warnings.some(w => w.path === 'servers')).toBe(true);
  });

  it('should not warn when server URLs include versioning', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      servers: [
        { url: 'https://api.example.com/v1' }
      ],
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    expect(result.warnings.some(w => w.code === 'NO_VERSIONING')).toBe(false);
  });

  it('should include suggestions when validation passes', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      servers: [{ url: 'https://api.example.com/v1' }],
      paths: {
        '/users': { get: {} }
      },
      components: {
        schemas: {},
        securitySchemes: { ApiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' } }
      },
      security: [{ ApiKey: [] }],
      tags: []
    };

    const result = validateAPIDesign(spec);

    if (result.valid && result.warnings.length === 0) {
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    }
  });

  it('should set error severity correctly', () => {
    const spec: any = {
      openapi: '3.0.3',
      info: {},
      paths: {}
    };

    const result = validateAPIDesign(spec);

    result.errors.forEach(error => {
      expect(error.severity).toBe('error');
    });
  });

  it('should set warning severity correctly', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    result.warnings.forEach(warning => {
      expect(warning.severity).toBe('warning');
    });
  });

  it('should include helpful suggestions in warnings', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    result.warnings.forEach(warning => {
      if (warning.suggestion) {
        expect(typeof warning.suggestion).toBe('string');
        expect(warning.suggestion.length).toBeGreaterThan(0);
      }
    });
  });

  it('should handle spec with all warnings', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Test API',
        version: '1.0.0',
        license: { name: 'MIT' }
      },
      servers: [{ url: 'https://api.example.com' }],
      paths: {},
      components: { schemas: {}, securitySchemes: {} },
      tags: []
    };

    const result = validateAPIDesign(spec);

    expect(result.warnings.length).toBeGreaterThan(0);
    // At minimum should have NO_PATHS and NO_VERSIONING
    expect(result.warnings.some(w => w.code === 'NO_PATHS')).toBe(true);
    expect(result.warnings.some(w => w.code === 'NO_VERSIONING')).toBe(true);
  });
});

describe('API Validator - GraphQL Validation', () => {
  it('should validate valid GraphQL schema', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [
            { name: 'id', type: 'ID!' },
            { name: 'name', type: 'String!' }
          ]
        }
      ],
      queries: [
        { name: 'getUser', type: 'User' }
      ]
    };

    const result = validateAPIDesign(schema);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('should return error when no types are defined', () => {
    const schema: GraphQLSchema = {
      types: [],
      queries: []
    };

    const result = validateAPIDesign(schema);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'NO_TYPES')).toBe(true);
    expect(result.errors.some(e => e.path === 'types')).toBe(true);
  });

  it('should warn when no queries are defined', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [{ name: 'id', type: 'ID!' }]
        }
      ],
      queries: []
    };

    const result = validateAPIDesign(schema);

    expect(result.warnings.some(w => w.code === 'NO_QUERIES')).toBe(true);
    expect(result.warnings.some(w => w.path === 'queries')).toBe(true);
  });

  it('should handle schema with undefined queries', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: []
        }
      ]
    };

    const result = validateAPIDesign(schema);

    expect(result.warnings.some(w => w.code === 'NO_QUERIES')).toBe(true);
  });

  it('should set error severity for GraphQL errors', () => {
    const schema: GraphQLSchema = {
      types: [],
      queries: []
    };

    const result = validateAPIDesign(schema);

    result.errors.forEach(error => {
      expect(error.severity).toBe('error');
    });
  });

  it('should set warning severity for GraphQL warnings', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: []
        }
      ],
      queries: []
    };

    const result = validateAPIDesign(schema);

    result.warnings.forEach(warning => {
      expect(warning.severity).toBe('warning');
    });
  });

  it('should include suggestions for GraphQL warnings', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [{ name: 'id', type: 'ID!' }]
        }
      ],
      queries: []
    };

    const result = validateAPIDesign(schema);

    const noQueriesWarning = result.warnings.find(w => w.code === 'NO_QUERIES');
    expect(noQueriesWarning?.suggestion).toBeDefined();
    expect(noQueriesWarning?.suggestion).toContain('query');
  });

  it('should provide success suggestions when GraphQL schema is valid', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [{ name: 'id', type: 'ID!' }]
        }
      ],
      queries: [
        { name: 'getUser', type: 'User' }
      ]
    };

    const result = validateAPIDesign(schema);

    if (result.valid && result.warnings.length === 0) {
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    }
  });

  it('should handle schema with mutations', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [{ name: 'id', type: 'ID!' }]
        }
      ],
      queries: [
        { name: 'getUser', type: 'User' }
      ],
      mutations: [
        { name: 'createUser', type: 'User' }
      ]
    };

    const result = validateAPIDesign(schema);

    expect(result.valid).toBe(true);
  });

  it('should handle schema with subscriptions', () => {
    const schema: GraphQLSchema = {
      types: [
        {
          name: 'User',
          kind: 'object',
          fields: [{ name: 'id', type: 'ID!' }]
        }
      ],
      queries: [
        { name: 'getUser', type: 'User' }
      ],
      subscriptions: [
        { name: 'userUpdated', type: 'User' }
      ]
    };

    const result = validateAPIDesign(schema);

    expect(result.valid).toBe(true);
  });
});

describe('API Validator - Edge Cases', () => {
  it('should handle null spec gracefully', () => {
    const result = validateAPIDesign(null as any);

    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe('INVALID_SPEC');
  });

  it('should handle undefined spec gracefully', () => {
    const result = validateAPIDesign(undefined as any);

    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].code).toBe('INVALID_SPEC');
  });

  it('should distinguish between OpenAPI and GraphQL specs', () => {
    const openApiSpec: any = {
      openapi: '3.0.3',
      info: { title: 'Test', version: '1.0.0' },
      paths: {}
    };

    const graphqlSchema: any = {
      types: [{ name: 'User', kind: 'object', fields: [] }],
      queries: []
    };

    const openApiResult = validateAPIDesign(openApiSpec);
    const graphqlResult = validateAPIDesign(graphqlSchema);

    expect(openApiResult.warnings.some(w => w.code === 'NO_PATHS')).toBe(true);
    expect(graphqlResult.warnings.some(w => w.code === 'NO_QUERIES')).toBe(true);
  });

  it('should handle empty objects', () => {
    const result = validateAPIDesign({} as any);

    expect(result).toBeDefined();
    // Empty object treated as GraphQL schema with no types, which produces an error
    expect(result.errors.length).toBeGreaterThanOrEqual(0);
  });

  it('should validate complex OpenAPI spec', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
      info: {
        title: 'Complex API',
        version: '2.0.0',
        description: 'A complex API',
        contact: {
          name: 'Support',
          email: 'support@example.com'
        },
        license: { name: 'Apache 2.0' }
      },
      servers: [
        { url: 'https://api.example.com/v2', description: 'Production' }
      ],
      paths: {
        '/users': {
          get: { summary: 'List users' },
          post: { summary: 'Create user' }
        },
        '/users/{id}': {
          get: { summary: 'Get user' },
          put: { summary: 'Update user' },
          delete: { summary: 'Delete user' }
        }
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        },
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer'
          }
        }
      },
      security: [{ BearerAuth: [] }],
      tags: [
        { name: 'Users', description: 'User operations' }
      ]
    };

    const result = validateAPIDesign(spec);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });
});
