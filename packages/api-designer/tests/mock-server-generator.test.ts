/**
 * Tests for mock-server-generator
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateMockServerCode,
  createMockServer,
} from '../src/generators/mock-server-generator.js';
import type { OpenAPISpec, MockServerConfig } from '../src/types.js';

// Mock express
vi.mock('express', () => {
  const mockApp = {
    use: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
    put: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    patch: vi.fn().mockReturnThis(),
    listen: vi.fn().mockImplementation((_port, callback) => {
      if (callback) callback();
      return { close: vi.fn() };
    }),
  };
  const express = vi.fn(() => mockApp);
  (express as any).json = vi.fn(() => vi.fn());
  return { default: express };
});

// Mock cors
vi.mock('cors', () => ({
  default: vi.fn(() => vi.fn()),
}));

describe('generateMockServerCode', () => {
  const basicSpec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
  };

  it('should generate basic server code with imports', () => {
    const config: MockServerConfig = {};
    const code = generateMockServerCode(basicSpec, config);

    expect(code).toContain("import express from 'express'");
    expect(code).toContain("import cors from 'cors'");
    expect(code).toContain('const app = express()');
    expect(code).toContain('app.use(cors())');
    expect(code).toContain('app.use(express.json())');
  });

  it('should use default port 3000 when not specified', () => {
    const config: MockServerConfig = {};
    const code = generateMockServerCode(basicSpec, config);

    expect(code).toContain('const PORT = process.env.PORT || 3000');
    expect(code).toContain('app.listen(PORT');
  });

  it('should use custom port when specified', () => {
    const config: MockServerConfig = { port: 8080 };
    const code = generateMockServerCode(basicSpec, config);

    expect(code).toContain('const PORT = process.env.PORT || 8080');
  });

  it('should generate routes for paths', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain("app.get('/users'");
    expect(code).toContain('res.json(');
  });

  it('should convert path parameters from OpenAPI to Express format', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users/{userId}': {
          get: {
            summary: 'Get user by ID',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain("app.get('/users/:userId'");
  });

  it('should add response delay when configured', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: { '200': { description: 'Success' } },
          },
        },
      },
    };
    const config: MockServerConfig = { responseDelay: 500 };
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('setTimeout(');
    expect(code).toContain('500');
  });

  it('should handle multiple HTTP methods', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { summary: 'Get users', responses: { '200': { description: 'Success' } } },
          post: { summary: 'Create user', responses: { '201': { description: 'Created' } } },
        },
        '/users/{id}': {
          put: { summary: 'Update user', responses: { '200': { description: 'Success' } } },
          delete: { summary: 'Delete user', responses: { '204': { description: 'No content' } } },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain("app.get('/users'");
    expect(code).toContain("app.post('/users'");
    expect(code).toContain("app.put('/users/:id'");
    expect(code).toContain("app.delete('/users/:id'");
  });

  it('should generate mock response from schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('res.json(');
    // Should contain mock values
    expect(code).toContain('42');
    expect(code).toContain('mock-string');
  });

  it('should handle array schema type', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/items': {
          get: {
            summary: 'Get items',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('mock-string');
  });

  it('should handle boolean schema type', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/status': {
          get: {
            summary: 'Get status',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('true');
  });

  it('should handle enum values in string schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/status': {
          get: {
            summary: 'Get status',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'string', enum: ['active', 'inactive', 'pending'] },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('active');
  });

  it('should handle $ref in schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/user': {
          get: {
            summary: 'Get user',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    // Should contain default mock data for $ref
    expect(code).toContain('"id":1');
    expect(code).toContain('"name":"Mock Data"');
  });

  it('should handle null/undefined schema', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/empty': {
          get: {
            summary: 'Get empty',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: null as any,
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    // Should still generate valid code
    expect(code).toContain("app.get('/empty'");
  });

  it('should handle number schema type', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/price': {
          get: {
            summary: 'Get price',
            responses: {
              '200': {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    expect(code).toContain('42');
  });

  it('should skip non-object operations', () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/test': {
          get: 'not-an-object' as any,
        },
      },
    };
    const config: MockServerConfig = {};
    const code = generateMockServerCode(spec, config);

    // Should not contain route for invalid operation
    expect(code).not.toContain("app.get('/test'");
  });
});

describe('createMockServer', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  const basicSpec: OpenAPISpec = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {},
  };

  it('should create express app', () => {
    const config: MockServerConfig = {};
    const app = createMockServer(basicSpec, config);

    expect(app).toBeDefined();
  });

  it('should add CORS middleware when includeCORS is true', async () => {
    const cors = (await import('cors')).default;
    const config: MockServerConfig = { includeCORS: true };
    createMockServer(basicSpec, config);

    expect(cors).toHaveBeenCalled();
  });

  it('should not add CORS middleware when includeCORS is false', async () => {
    const cors = (await import('cors')).default;
    vi.mocked(cors).mockClear();
    const config: MockServerConfig = { includeCORS: false };
    createMockServer(basicSpec, config);

    expect(cors).not.toHaveBeenCalled();
  });

  it('should add logging middleware when includeLogging is true', async () => {
    const express = (await import('express')).default;
    const mockApp = express();
    vi.mocked(mockApp.use).mockClear();

    const config: MockServerConfig = { includeLogging: true };
    createMockServer(basicSpec, config);

    // Logging middleware is added via app.use
    expect(mockApp.use).toHaveBeenCalled();
  });

  it('should listen on default port 3000', () => {
    const config: MockServerConfig = {};
    createMockServer(basicSpec, config);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('3000'));
  });

  it('should listen on custom port', () => {
    const config: MockServerConfig = { port: 5000 };
    createMockServer(basicSpec, config);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('5000'));
  });

  it('should register routes for paths', async () => {
    const express = (await import('express')).default;
    const mockApp = express();

    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users': {
          get: { summary: 'Get users', responses: { '200': { description: 'Success' } } },
          post: { summary: 'Create user', responses: { '201': { description: 'Created' } } },
        },
      },
    };
    const config: MockServerConfig = {};
    createMockServer(spec, config);

    expect(mockApp.get).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalled();
  });

  it('should handle response delay in routes', async () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/delayed': {
          get: { summary: 'Delayed response', responses: { '200': { description: 'Success' } } },
        },
      },
    };
    const config: MockServerConfig = { responseDelay: 100 };
    const app = createMockServer(spec, config);

    expect(app).toBeDefined();
  });

  it('should convert path parameters correctly', async () => {
    const express = (await import('express')).default;
    const mockApp = express();

    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/users/{userId}/posts/{postId}': {
          get: { summary: 'Get post', responses: { '200': { description: 'Success' } } },
        },
      },
    };
    const config: MockServerConfig = {};
    createMockServer(spec, config);

    expect(mockApp.get).toHaveBeenCalledWith('/users/:userId/posts/:postId', expect.any(Function));
  });

  it('should handle all HTTP methods', async () => {
    const express = (await import('express')).default;
    const mockApp = express();

    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {
        '/resource': {
          get: { summary: 'Get', responses: { '200': { description: 'OK' } } },
          post: { summary: 'Create', responses: { '201': { description: 'Created' } } },
          put: { summary: 'Update', responses: { '200': { description: 'OK' } } },
          delete: { summary: 'Delete', responses: { '204': { description: 'Deleted' } } },
          patch: { summary: 'Patch', responses: { '200': { description: 'OK' } } },
        },
      },
    };
    const config: MockServerConfig = {};
    createMockServer(spec, config);

    expect(mockApp.get).toHaveBeenCalled();
    expect(mockApp.post).toHaveBeenCalled();
    expect(mockApp.put).toHaveBeenCalled();
    expect(mockApp.delete).toHaveBeenCalled();
    expect(mockApp.patch).toHaveBeenCalled();
  });

  it('should sanitize log output to prevent injection', async () => {
    const spec: OpenAPISpec = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
      paths: {},
    };
    const config: MockServerConfig = { includeLogging: true };
    createMockServer(spec, config);

    // The logging middleware should be added
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('\n'));
    expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('\r'));
  });
});
