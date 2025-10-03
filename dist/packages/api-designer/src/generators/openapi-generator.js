/**
 * OpenAPI Specification Generator
 */
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
export function generateOpenAPISpec(config, endpoints) {
    try {
        const spec = {
            openapi: OPENAPI_VERSION,
            info: {
                title: config.name,
                version: config.version,
                description: config.description || `API specification for ${config.name}`,
                contact: {
                    name: 'API Support',
                    email: 'api@example.com'
                }
            },
            servers: config.baseUrl
                ? [{ url: config.baseUrl, description: 'API Server' }]
                : [{ url: 'https://api.example.com/v1', description: 'Default Server' }],
            paths: {},
            components: {
                schemas: {},
                securitySchemes: {}
            }
        };
        // Add authentication if configured
        if (config.auth && config.auth.type !== 'none') {
            addAuthenticationScheme(spec, config);
        }
        // Generate paths from resources or custom endpoints
        if (endpoints && endpoints.length > 0) {
            addCustomEndpoints(spec, endpoints);
        }
        else if (config.resources) {
            generateResourceEndpoints(spec, config);
        }
        return {
            success: true,
            data: spec
        };
    }
    catch (error) {
        return {
            success: false,
            errors: [error instanceof Error ? error.message : 'Unknown error']
        };
    }
}
function addAuthenticationScheme(spec, config) {
    if (!config.auth || !spec.components)
        return;
    switch (config.auth.type) {
        case 'apiKey':
            spec.components.securitySchemes = {
                ApiKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key'
                }
            };
            break;
        case 'bearer':
            spec.components.securitySchemes = {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            };
            break;
        case 'oauth2':
            spec.components.securitySchemes = {
                OAuth2: {
                    type: 'oauth2',
                    flows: {
                        authorizationCode: {
                            authorizationUrl: 'https://example.com/oauth/authorize',
                            tokenUrl: 'https://example.com/oauth/token',
                            scopes: {
                                'read': 'Read access',
                                'write': 'Write access'
                            }
                        }
                    }
                }
            };
            break;
    }
}
function addCustomEndpoints(spec, endpoints) {
    for (const endpoint of endpoints) {
        if (!spec.paths[endpoint.path]) {
            spec.paths[endpoint.path] = {};
        }
        spec.paths[endpoint.path][endpoint.method] = {
            summary: endpoint.summary,
            description: endpoint.description,
            parameters: endpoint.parameters,
            requestBody: endpoint.requestBody,
            responses: endpoint.responses
        };
    }
}
function generateResourceEndpoints(spec, config) {
    if (!config.resources)
        return;
    for (const resource of config.resources) {
        const resourcePath = `/${resource}`;
        const resourceIdPath = `/${resource}/{id}`;
        // List endpoint
        spec.paths[resourcePath] = {
            get: {
                summary: `List all ${resource}`,
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', default: 1 }
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', default: DEFAULT_PAGE_SIZE, maximum: MAX_PAGE_SIZE }
                    }
                ],
                responses: {
                    [HTTP_STATUS_OK]: {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'array', items: { $ref: `#/components/schemas/${capitalize(resource)}` } },
                                        page: { type: 'integer' },
                                        limit: { type: 'integer' },
                                        total: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: `Create a new ${resource}`,
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${capitalize(resource)}` }
                        }
                    }
                },
                responses: {
                    [HTTP_STATUS_CREATED]: {
                        description: 'Created',
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${capitalize(resource)}` }
                            }
                        }
                    },
                    [HTTP_STATUS_BAD_REQUEST]: { description: 'Bad Request' }
                }
            }
        };
        // Individual resource endpoints
        spec.paths[resourceIdPath] = {
            get: {
                summary: `Get ${resource} by ID`,
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    [HTTP_STATUS_OK]: {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${capitalize(resource)}` }
                            }
                        }
                    },
                    [HTTP_STATUS_NOT_FOUND]: { description: 'Not Found' }
                }
            },
            put: {
                summary: `Update ${resource} by ID`,
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: `#/components/schemas/${capitalize(resource)}` }
                        }
                    }
                },
                responses: {
                    [HTTP_STATUS_OK]: {
                        description: 'Success',
                        content: {
                            'application/json': {
                                schema: { $ref: `#/components/schemas/${capitalize(resource)}` }
                            }
                        }
                    },
                    [HTTP_STATUS_NOT_FOUND]: { description: 'Not Found' }
                }
            },
            delete: {
                summary: `Delete ${resource} by ID`,
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    [HTTP_STATUS_NO_CONTENT]: { description: 'No Content' },
                    [HTTP_STATUS_NOT_FOUND]: { description: 'Not Found' }
                }
            }
        };
        // Add schema
        if (spec.components && spec.components.schemas) {
            spec.components.schemas[capitalize(resource)] = {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                },
                required: ['id']
            };
        }
    }
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//# sourceMappingURL=openapi-generator.js.map