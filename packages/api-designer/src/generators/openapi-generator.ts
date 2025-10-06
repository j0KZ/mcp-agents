/**
 * OpenAPI Specification Generator
 */

import { APIDesignConfig, OpenAPISpec, RESTEndpoint, APIDesignResult } from '../types.js';

const OPENAPI_VERSION = '3.0.3';
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_NO_CONTENT = 204;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_NOT_FOUND = 404;

/**
 * Generate OpenAPI 3.0 specification from configuration
 */
export function generateOpenAPISpec(
  config: APIDesignConfig,
  endpoints?: RESTEndpoint[]
): APIDesignResult {
  try {
    const spec: OpenAPISpec = {
      openapi: OPENAPI_VERSION,
      info: {
        title: config.name,
        version: config.version,
        description: config.description || `API specification for ${config.name}`,
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: config.baseUrl
        ? [
            { url: config.baseUrl, description: 'Production server' },
            { url: 'https://staging-api.example.com/v1', description: 'Staging server' },
          ]
        : [
            { url: 'https://api.example.com/v1', description: 'Production server' },
            { url: 'https://staging-api.example.com/v1', description: 'Staging server' },
          ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
      },
      tags: [],
    };

    // Add authentication if configured
    if (config.auth && config.auth.type !== 'none') {
      addAuthenticationScheme(spec, config);
    }

    // Generate endpoints from resources if not provided
    if (!endpoints && config.resources) {
      endpoints = generateRESTEndpointsFromResources(config.resources, config);
    }

    // Add endpoints to paths
    if (endpoints && endpoints.length > 0) {
      addCustomEndpointsWithTags(spec, endpoints);
    }

    return {
      success: true,
      data: spec,
      metadata: {
        endpointCount: endpoints?.length || 0,
        resourceCount: config.resources?.length || 0,
        generatedAt: new Date().toISOString(),
        version: config.version,
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

function addAuthenticationScheme(spec: OpenAPISpec, config: APIDesignConfig): void {
  if (!config.auth || !spec.components) return;

  switch (config.auth.type) {
    case 'bearer':
      spec.components.securitySchemes!.BearerAuth = {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      };
      spec.security = [{ BearerAuth: [] }];
      break;
    case 'apiKey':
      spec.components.securitySchemes!.ApiKeyAuth = {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
      };
      spec.security = [{ ApiKeyAuth: [] }];
      break;
    case 'oauth2':
      spec.components.securitySchemes!.OAuth2 = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: 'https://api.example.com/oauth/authorize',
            tokenUrl: 'https://api.example.com/oauth/token',
            scopes: {
              'read:users': 'Read user data',
              'write:users': 'Modify user data',
            },
          },
        },
      };
      spec.security = [{ OAuth2: ['read:users', 'write:users'] }];
      break;
  }
}

function addCustomEndpointsWithTags(spec: OpenAPISpec, endpoints: RESTEndpoint[]): void {
  for (const endpoint of endpoints) {
    // Prevent prototype pollution: reject dangerous keys
    if (
      endpoint.path === '__proto__' ||
      endpoint.path === 'constructor' ||
      endpoint.path === 'prototype'
    ) {
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(spec.paths, endpoint.path)) {
      spec.paths[endpoint.path] = {};
    }

    const method = endpoint.method.toLowerCase();
    // Additional safety check for method
    if (method === '__proto__' || method === 'constructor' || method === 'prototype') {
      continue;
    }

    spec.paths[endpoint.path][method] = {
      summary: endpoint.summary,
      description: endpoint.description,
      operationId: endpoint.operationId,
      tags: endpoint.tags,
      parameters: endpoint.parameters,
      requestBody: endpoint.requestBody,
      responses: endpoint.responses,
      security: endpoint.security,
      deprecated: endpoint.deprecated,
    };

    // Add tags
    if (endpoint.tags && spec.tags) {
      for (const tag of endpoint.tags) {
        if (!spec.tags.find(t => t.name === tag)) {
          spec.tags.push({
            name: tag,
            description: `Operations related to ${tag}`,
          });
        }
      }
    }
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate REST endpoints from resource names
 * Creates full CRUD operations for each resource
 */
export function generateRESTEndpointsFromResources(
  resources: string[],
  _config: APIDesignConfig
): RESTEndpoint[] {
  const endpoints: RESTEndpoint[] = [];

  for (const resource of resources) {
    const resourcePath = `/${resource}`;
    const resourceItemPath = `/${resource}/{id}`;
    const resourceName = capitalize(resource);
    const singularName = resource.endsWith('s') ? resource.slice(0, -1) : resource;

    // List operation
    endpoints.push({
      path: resourcePath,
      method: 'GET',
      summary: `List all ${resource}`,
      description: `Retrieve a paginated list of ${resource}`,
      operationId: `list${resourceName}`,
      tags: [resourceName],
      parameters: [
        {
          name: 'page',
          type: 'integer',
          required: false,
          description: 'Page number for pagination',
          in: 'query',
          default: 1,
          minimum: 1,
        },
        {
          name: 'limit',
          type: 'integer',
          required: false,
          description: 'Number of items per page',
          in: 'query',
          default: DEFAULT_PAGE_SIZE,
          minimum: 1,
          maximum: MAX_PAGE_SIZE,
        },
        {
          name: 'sort',
          type: 'string',
          required: false,
          description: 'Sort field and order (e.g., "createdAt:desc")',
          in: 'query',
        },
      ],
      responses: {
        '200': {
          statusCode: HTTP_STATUS_OK,
          description: 'Successful response',
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
        '400': {
          statusCode: HTTP_STATUS_BAD_REQUEST,
          description: 'Bad request',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });

    // Create operation
    endpoints.push({
      path: resourcePath,
      method: 'POST',
      summary: `Create a new ${singularName}`,
      description: `Create a new ${singularName} resource`,
      operationId: `create${resourceName}`,
      tags: [resourceName],
      requestBody: {
        required: true,
        description: `${resourceName} object to create`,
        content: {
          'application/json': {
            schema: { type: 'object', $ref: `#/components/schemas/${resourceName}Input` },
          },
        },
      },
      responses: {
        '201': {
          statusCode: HTTP_STATUS_CREATED,
          description: 'Resource created successfully',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '400': {
          statusCode: HTTP_STATUS_BAD_REQUEST,
          description: 'Invalid input',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });

    // Get by ID operation
    endpoints.push({
      path: resourceItemPath,
      method: 'GET',
      summary: `Get ${singularName} by ID`,
      description: `Retrieve a specific ${singularName} by its ID`,
      operationId: `get${resourceName}ById`,
      tags: [resourceName],
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: `${resourceName} identifier`,
          in: 'path',
        },
      ],
      responses: {
        '200': {
          statusCode: HTTP_STATUS_OK,
          description: 'Successful response',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '404': {
          statusCode: HTTP_STATUS_NOT_FOUND,
          description: 'Resource not found',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });

    // Update operation
    endpoints.push({
      path: resourceItemPath,
      method: 'PUT',
      summary: `Update ${singularName}`,
      description: `Update an existing ${singularName} resource`,
      operationId: `update${resourceName}`,
      tags: [resourceName],
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: `${resourceName} identifier`,
          in: 'path',
        },
      ],
      requestBody: {
        required: true,
        description: `Updated ${singularName} data`,
        content: {
          'application/json': {
            schema: { type: 'object', $ref: `#/components/schemas/${resourceName}Input` },
          },
        },
      },
      responses: {
        '200': {
          statusCode: HTTP_STATUS_OK,
          description: 'Resource updated successfully',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '404': {
          statusCode: HTTP_STATUS_NOT_FOUND,
          description: 'Resource not found',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });

    // Delete operation
    endpoints.push({
      path: resourceItemPath,
      method: 'DELETE',
      summary: `Delete ${singularName}`,
      description: `Delete a ${singularName} resource`,
      operationId: `delete${resourceName}`,
      tags: [resourceName],
      parameters: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: `${resourceName} identifier`,
          in: 'path',
        },
      ],
      responses: {
        '204': {
          statusCode: HTTP_STATUS_NO_CONTENT,
          description: 'Resource deleted successfully',
        },
        '404': {
          statusCode: HTTP_STATUS_NOT_FOUND,
          description: 'Resource not found',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });
  }

  return endpoints;
}
