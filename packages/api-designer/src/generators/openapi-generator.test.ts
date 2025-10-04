import { describe, it, expect } from 'vitest';
import { generateOpenAPISpec, generateRESTEndpointsFromResources } from './openapi-generator.js';
import { APIDesignConfig, RESTEndpoint } from '../types.js';

describe('OpenAPI Generator - generateOpenAPISpec', () => {
  const baseConfig: APIDesignConfig = {
    name: 'Test API',
    version: '1.0.0',
    style: 'REST'
  };

  it('should generate valid OpenAPI 3.0.3 specification', () => {
    const result = generateOpenAPISpec(baseConfig);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.openapi).toBe('3.0.3');
  });

  it('should include correct API info', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      description: 'My Test API'
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.info.title).toBe('Test API');
    expect(result.data.info.version).toBe('1.0.0');
    expect(result.data.info.description).toContain('My Test API');
  });

  it('should add default description when not provided', () => {
    const result = generateOpenAPISpec(baseConfig);

    expect(result.data.info.description).toContain('Test API');
  });

  it('should include contact information', () => {
    const result = generateOpenAPISpec(baseConfig);

    expect(result.data.info.contact).toBeDefined();
    expect(result.data.info.contact?.name).toBe('API Support');
    expect(result.data.info.contact?.email).toBe('support@example.com');
  });

  it('should include MIT license', () => {
    const result = generateOpenAPISpec(baseConfig);

    expect(result.data.info.license).toBeDefined();
    expect(result.data.info.license?.name).toBe('MIT');
    expect(result.data.info.license?.url).toContain('opensource.org');
  });

  it('should use provided baseUrl for servers', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      baseUrl: 'https://api.mycompany.com/v2'
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.servers).toBeDefined();
    expect(result.data.servers![0].url).toBe('https://api.mycompany.com/v2');
    expect(result.data.servers![0].description).toBe('Production server');
  });

  it('should include staging server', () => {
    const result = generateOpenAPISpec(baseConfig);

    expect(result.data.servers!.length).toBeGreaterThanOrEqual(2);
    expect(result.data.servers![1].description).toContain('Staging');
  });

  it('should add bearer authentication scheme', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      auth: { type: 'bearer' }
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.components?.securitySchemes?.BearerAuth).toBeDefined();
    expect(result.data.components?.securitySchemes?.BearerAuth.type).toBe('http');
    expect(result.data.components?.securitySchemes?.BearerAuth.scheme).toBe('bearer');
    expect(result.data.components?.securitySchemes?.BearerAuth.bearerFormat).toBe('JWT');
    expect(result.data.security).toEqual([{ BearerAuth: [] }]);
  });

  it('should add API key authentication scheme', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      auth: { type: 'apiKey' }
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.components?.securitySchemes?.ApiKeyAuth).toBeDefined();
    expect(result.data.components?.securitySchemes?.ApiKeyAuth.type).toBe('apiKey');
    expect(result.data.components?.securitySchemes?.ApiKeyAuth.in).toBe('header');
    expect(result.data.components?.securitySchemes?.ApiKeyAuth.name).toBe('X-API-Key');
    expect(result.data.security).toEqual([{ ApiKeyAuth: [] }]);
  });

  it('should add OAuth2 authentication scheme', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      auth: { type: 'oauth2' }
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.components?.securitySchemes?.OAuth2).toBeDefined();
    expect(result.data.components?.securitySchemes?.OAuth2.type).toBe('oauth2');
    expect(result.data.components?.securitySchemes?.OAuth2.flows).toBeDefined();
    expect(result.data.components?.securitySchemes?.OAuth2.flows.authorizationCode).toBeDefined();
    expect(result.data.security).toEqual([{ OAuth2: ['read:users', 'write:users'] }]);
  });

  it('should not add security when auth type is none', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      auth: { type: 'none' }
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.security).toBeUndefined();
  });

  it('should generate endpoints from resources', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      resources: ['users', 'posts']
    };

    const result = generateOpenAPISpec(config);

    expect(result.data.paths).toBeDefined();
    expect(Object.keys(result.data.paths).length).toBeGreaterThan(0);
    expect(result.data.paths['/users']).toBeDefined();
    expect(result.data.paths['/posts']).toBeDefined();
  });

  it('should add custom endpoints to paths', () => {
    const customEndpoints: RESTEndpoint[] = [{
      path: '/custom/endpoint',
      method: 'GET',
      summary: 'Custom endpoint',
      operationId: 'getCustom',
      responses: {
        '200': {
          statusCode: 200,
          description: 'Success'
        }
      }
    }];

    const result = generateOpenAPISpec(baseConfig, customEndpoints);

    expect(result.data.paths['/custom/endpoint']).toBeDefined();
    expect(result.data.paths['/custom/endpoint'].get).toBeDefined();
  });

  it('should add tags from endpoints', () => {
    const customEndpoints: RESTEndpoint[] = [{
      path: '/test',
      method: 'GET',
      summary: 'Test',
      tags: ['Testing', 'Custom'],
      responses: { '200': { statusCode: 200, description: 'OK' } }
    }];

    const result = generateOpenAPISpec(baseConfig, customEndpoints);

    expect(result.data.tags).toBeDefined();
    expect(result.data.tags!.some(t => t.name === 'Testing')).toBe(true);
    expect(result.data.tags!.some(t => t.name === 'Custom')).toBe(true);
  });

  it('should include metadata with endpoint count', () => {
    const config: APIDesignConfig = {
      ...baseConfig,
      resources: ['users']
    };

    const result = generateOpenAPISpec(config);

    expect(result.metadata).toBeDefined();
    expect(result.metadata?.endpointCount).toBeGreaterThan(0);
    expect(result.metadata?.resourceCount).toBe(1);
    expect(result.metadata?.generatedAt).toBeDefined();
    expect(result.metadata?.version).toBe('1.0.0');
  });

  it('should handle error when config is invalid', () => {
    const result = generateOpenAPISpec(null as any);

    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('should prevent prototype pollution in paths', () => {
    const maliciousEndpoints: RESTEndpoint[] = [{
      path: '__proto__',
      method: 'GET',
      summary: 'Malicious',
      responses: { '200': { statusCode: 200, description: 'OK' } }
    }];

    const result = generateOpenAPISpec(baseConfig, maliciousEndpoints);

    // The code filters out dangerous paths, so it should create an empty paths object
    // or skip the dangerous endpoint
    expect(Object.keys(result.data.paths).includes('__proto__')).toBe(false);
  });

  it('should prevent prototype pollution in methods', () => {
    const maliciousEndpoints: any = [{
      path: '/test',
      method: '__proto__',
      summary: 'Malicious',
      responses: { '200': { statusCode: 200, description: 'OK' } }
    }];

    const result = generateOpenAPISpec(baseConfig, maliciousEndpoints);

    // The code filters out dangerous methods
    if (result.data.paths['/test']) {
      expect(Object.keys(result.data.paths['/test']).includes('__proto__')).toBe(false);
    }
  });
});

describe('OpenAPI Generator - generateRESTEndpointsFromResources', () => {
  const baseConfig: APIDesignConfig = {
    name: 'Test API',
    version: '1.0.0',
    style: 'REST'
  };

  it('should generate 5 CRUD endpoints per resource', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);

    expect(endpoints.length).toBe(5);
  });

  it('should generate LIST endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    expect(listEndpoint).toBeDefined();
    expect(listEndpoint?.summary).toContain('List');
    expect(listEndpoint?.operationId).toBe('listUsers');
  });

  it('should generate CREATE endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const createEndpoint = endpoints.find(e => e.method === 'POST' && e.path === '/users');

    expect(createEndpoint).toBeDefined();
    expect(createEndpoint?.summary).toContain('Create');
    expect(createEndpoint?.operationId).toBe('createUsers');
  });

  it('should generate GET BY ID endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const getEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users/{id}');

    expect(getEndpoint).toBeDefined();
    expect(getEndpoint?.summary).toContain('Get');
    expect(getEndpoint?.operationId).toBe('getUsersById');
  });

  it('should generate UPDATE endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const updateEndpoint = endpoints.find(e => e.method === 'PUT');

    expect(updateEndpoint).toBeDefined();
    expect(updateEndpoint?.summary).toContain('Update');
    expect(updateEndpoint?.operationId).toBe('updateUsers');
  });

  it('should generate DELETE endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const deleteEndpoint = endpoints.find(e => e.method === 'DELETE');

    expect(deleteEndpoint).toBeDefined();
    expect(deleteEndpoint?.summary).toContain('Delete');
    expect(deleteEndpoint?.operationId).toBe('deleteUsers');
  });

  it('should add pagination parameters to LIST endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    expect(listEndpoint?.parameters).toBeDefined();
    expect(listEndpoint?.parameters?.some(p => p.name === 'page')).toBe(true);
    expect(listEndpoint?.parameters?.some(p => p.name === 'limit')).toBe(true);
    expect(listEndpoint?.parameters?.some(p => p.name === 'sort')).toBe(true);
  });

  it('should set correct default values for pagination', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    const pageParam = listEndpoint?.parameters?.find(p => p.name === 'page');
    const limitParam = listEndpoint?.parameters?.find(p => p.name === 'limit');

    expect(pageParam?.default).toBe(1);
    expect(limitParam?.default).toBe(20);
    expect(limitParam?.maximum).toBe(100);
  });

  it('should add ID parameter to item endpoints', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const getEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users/{id}');

    expect(getEndpoint?.parameters).toBeDefined();
    const idParam = getEndpoint?.parameters?.find(p => p.name === 'id');
    expect(idParam).toBeDefined();
    expect(idParam?.required).toBe(true);
    expect(idParam?.in).toBe('path');
  });

  it('should add request body to CREATE endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const createEndpoint = endpoints.find(e => e.method === 'POST');

    expect(createEndpoint?.requestBody).toBeDefined();
    expect(createEndpoint?.requestBody?.required).toBe(true);
    expect(createEndpoint?.requestBody?.content['application/json']).toBeDefined();
  });

  it('should add request body to UPDATE endpoint', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const updateEndpoint = endpoints.find(e => e.method === 'PUT');

    expect(updateEndpoint?.requestBody).toBeDefined();
    expect(updateEndpoint?.requestBody?.required).toBe(true);
  });

  it('should include proper response codes', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);

    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');
    expect(listEndpoint?.responses['200']).toBeDefined();
    expect(listEndpoint?.responses['400']).toBeDefined();

    const createEndpoint = endpoints.find(e => e.method === 'POST');
    expect(createEndpoint?.responses['201']).toBeDefined();

    const deleteEndpoint = endpoints.find(e => e.method === 'DELETE');
    expect(deleteEndpoint?.responses['204']).toBeDefined();
    expect(deleteEndpoint?.responses['404']).toBeDefined();
  });

  it('should add tags to all endpoints', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);

    endpoints.forEach(endpoint => {
      expect(endpoint.tags).toBeDefined();
      expect(endpoint.tags?.includes('Users')).toBe(true);
    });
  });

  it('should handle multiple resources', () => {
    const endpoints = generateRESTEndpointsFromResources(['users', 'posts', 'comments'], baseConfig);

    expect(endpoints.length).toBe(15); // 5 endpoints × 3 resources
  });

  it('should handle empty resources array', () => {
    const endpoints = generateRESTEndpointsFromResources([], baseConfig);

    expect(endpoints).toBeDefined();
    expect(endpoints.length).toBe(0);
  });

  it('should capitalize resource names correctly', () => {
    const endpoints = generateRESTEndpointsFromResources(['products'], baseConfig);

    expect(endpoints[0].tags?.includes('Products')).toBe(true);
  });

  it('should handle singular resource names', () => {
    const endpoints = generateRESTEndpointsFromResources(['product'], baseConfig);
    const createEndpoint = endpoints.find(e => e.method === 'POST');

    expect(createEndpoint?.summary).toContain('product');
  });

  it('should handle plural resource names ending with "s"', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const createEndpoint = endpoints.find(e => e.method === 'POST');

    expect(createEndpoint?.summary).toContain('user');
  });

  it('should include schema references', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    expect(listEndpoint?.responses['200'].schema).toBeDefined();
    expect(JSON.stringify(listEndpoint?.responses['200'].schema)).toContain('#/components/schemas/Users');
  });

  it('should include pagination in response schema', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    const schema = listEndpoint?.responses['200'].schema;
    expect(schema?.properties?.pagination).toBeDefined();
    expect(schema?.properties?.pagination?.properties?.page).toBeDefined();
    expect(schema?.properties?.pagination?.properties?.total).toBeDefined();
  });

  it('should set correct status codes', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);

    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');
    expect(listEndpoint?.responses['200'].statusCode).toBe(200);

    const createEndpoint = endpoints.find(e => e.method === 'POST');
    expect(createEndpoint?.responses['201'].statusCode).toBe(201);

    const deleteEndpoint = endpoints.find(e => e.method === 'DELETE');
    expect(deleteEndpoint?.responses['204'].statusCode).toBe(204);
  });

  it('should include error schemas', () => {
    const endpoints = generateRESTEndpointsFromResources(['users'], baseConfig);
    const listEndpoint = endpoints.find(e => e.method === 'GET' && e.path === '/users');

    expect(listEndpoint?.responses['400'].schema?.$ref).toContain('Error');
  });
});
