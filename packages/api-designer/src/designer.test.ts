import { describe, it, expect } from 'vitest';
import { designRESTAPI, generateOpenAPISpec, createGraphQLSchema } from './designer.js';

describe('API Designer', () => {
  it('should design REST API', () => {
    const result = designRESTAPI(['users', 'posts'], {
      name: 'Test API',
      version: '1.0.0',
      style: 'REST'
    });
    expect(result.success).toBe(true);
    expect(result.endpoints.length).toBeGreaterThan(0);
  });

  it('should generate OpenAPI spec', () => {
    const result = generateOpenAPISpec({
      name: 'Test API',
      version: '1.0.0',
      style: 'REST',
      resources: ['users']
    });
    expect(result.success).toBe(true);
    expect(result.spec.openapi).toBe('3.0.3');
  });

  it('should create GraphQL schema', () => {
    const result = createGraphQLSchema({
      name: 'Test API',
      version: '1.0.0',
      style: 'GraphQL',
      resources: ['User']
    });
    expect(result.success).toBe(true);
    expect(result.schema).toContain('type User');
  });
});
