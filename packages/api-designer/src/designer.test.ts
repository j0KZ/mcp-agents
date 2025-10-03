import { describe, it, expect } from 'vitest';
import { designRESTEndpoints, generateOpenAPI, createGraphQLSchema } from './designer.js';

describe('API Designer', () => {
  it('should design REST API', () => {
    const result = designRESTEndpoints(['users', 'posts'], {
      name: 'Test API',
      version: '1.0.0',
      style: 'REST'
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    if (Array.isArray(result.data)) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('should generate OpenAPI spec', () => {
    const result = generateOpenAPI({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      resources: ['users']
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    if (result.data && typeof result.data === 'object' && 'openapi' in result.data) {
      expect(result.data.openapi).toBe('3.0.3');
    }
  });

  it('should create GraphQL schema', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User']
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    if (result.data && typeof result.data === 'object' && 'sdl' in result.data) {
      expect(result.data.sdl).toContain('type User');
    }
  });
});
