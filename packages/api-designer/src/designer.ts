/**
 * Core API Designer implementation
 * Provides comprehensive API design, generation, and validation tools
 */

import {
  APIDesignConfig,
  OpenAPISpec,
  RESTEndpoint,
  GraphQLSchema,
  ClientGenerationOptions,
  MockServerConfig,
  ValidationResult,
  APIDesignResult,
  APISchema,
  HTTPMethod,
  GraphQLType,
  GraphQLField,
} from './types.js';

/**
 * Generate OpenAPI 3.0 specification from configuration
 *
 * @param config - API design configuration
 * @param endpoints - Optional REST endpoints to include
 * @returns OpenAPI specification
 *
 * @example
 * ```typescript
 * const spec = generateOpenAPI({
 *   name: 'User API',
 *   version: '1.0.0',
 *   style: 'REST',
 *   resources: ['users', 'posts']
 * });
 * ```
 */
export function generateOpenAPI(
  config: APIDesignConfig,
  endpoints?: RESTEndpoint[]
): APIDesignResult {
  try {
    const spec: OpenAPISpec = {
      openapi: '3.0.3',
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
      servers: [
        {
          url: config.baseUrl || 'https://api.example.com/v1',
          description: 'Production server',
        },
        {
          url: 'https://staging-api.example.com/v1',
          description: 'Staging server',
        },
      ],
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
      },
      tags: [],
    };

    // Add security schemes
    if (config.auth) {
      switch (config.auth.type) {
        case 'bearer':
          spec.components!.securitySchemes!.BearerAuth = {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          };
          spec.security = [{ BearerAuth: [] }];
          break;
        case 'apiKey':
          spec.components!.securitySchemes!.ApiKeyAuth = {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          };
          spec.security = [{ ApiKeyAuth: [] }];
          break;
        case 'oauth2':
          spec.components!.securitySchemes!.OAuth2 = {
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

    // Generate endpoints from resources if not provided
    if (!endpoints && config.resources) {
      endpoints = generateRESTEndpointsFromResources(config.resources, config);
    }

    // Add endpoints to paths
    if (endpoints) {
      for (const endpoint of endpoints) {
        if (!spec.paths[endpoint.path]) {
          spec.paths[endpoint.path] = {};
        }

        const method = endpoint.method.toLowerCase();
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
        if (endpoint.tags) {
          for (const tag of endpoint.tags) {
            if (!spec.tags!.find(t => t.name === tag)) {
              spec.tags!.push({
                name: tag,
                description: `Operations related to ${tag}`,
              });
            }
          }
        }
      }
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
      errors: [(error as Error).message],
    };
  }
}

/**
 * Design REST API endpoints with best practices
 *
 * @param resources - Resource names to generate endpoints for
 * @param config - API design configuration
 * @returns Array of REST endpoints
 *
 * @example
 * ```typescript
 * const endpoints = designRESTEndpoints(['users', 'posts'], {
 *   name: 'Blog API',
 *   version: '1.0.0',
 *   style: 'REST'
 * });
 * ```
 */
export function designRESTEndpoints(
  resources: string[],
  config: APIDesignConfig
): APIDesignResult {
  try {
    const endpoints = generateRESTEndpointsFromResources(resources, config);

    return {
      success: true,
      data: endpoints,
      metadata: {
        endpointCount: endpoints.length,
        resourceCount: resources.length,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Generate REST endpoints from resource names
 * @private
 */
function generateRESTEndpointsFromResources(
  resources: string[],
  config: APIDesignConfig
): RESTEndpoint[] {
  const endpoints: RESTEndpoint[] = [];
  const namingCase = config.conventions?.namingCase || 'camelCase';

  for (const resource of resources) {
    const resourcePath = `/${resource}`;
    const resourceItemPath = `/${resource}/{id}`;
    const resourceName = capitalizeFirst(resource);
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
          default: 20,
          minimum: 1,
          maximum: 100,
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
          statusCode: 200,
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
          statusCode: 400,
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
          statusCode: 201,
          description: 'Resource created successfully',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '400': {
          statusCode: 400,
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
          statusCode: 200,
          description: 'Successful response',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '404': {
          statusCode: 404,
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
          statusCode: 200,
          description: 'Resource updated successfully',
          schema: { type: 'object', $ref: `#/components/schemas/${resourceName}` },
        },
        '404': {
          statusCode: 404,
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
          statusCode: 204,
          description: 'Resource deleted successfully',
        },
        '404': {
          statusCode: 404,
          description: 'Resource not found',
          schema: { type: 'object', $ref: '#/components/schemas/Error' },
        },
      },
    });
  }

  return endpoints;
}

/**
 * Create GraphQL schema from configuration
 *
 * @param config - API design configuration
 * @param customTypes - Optional custom type definitions
 * @returns GraphQL schema definition
 *
 * @example
 * ```typescript
 * const schema = createGraphQLSchema({
 *   name: 'Blog API',
 *   version: '1.0.0',
 *   style: 'GraphQL',
 *   resources: ['User', 'Post']
 * });
 * ```
 */
export function createGraphQLSchema(
  config: APIDesignConfig,
  customTypes?: GraphQLType[]
): APIDesignResult {
  try {
    const schema: GraphQLSchema = {
      types: customTypes || [],
      queries: [],
      mutations: [],
      subscriptions: [],
    };

    // Generate types from resources
    if (config.resources) {
      for (const resource of config.resources) {
        const typeName = capitalizeFirst(resource.endsWith('s') ? resource.slice(0, -1) : resource);

        // Add object type
        schema.types.push({
          name: typeName,
          kind: 'object',
          description: `${typeName} resource`,
          fields: [
            {
              name: 'id',
              type: 'ID!',
              description: 'Unique identifier',
            },
            {
              name: 'createdAt',
              type: 'DateTime!',
              description: 'Creation timestamp',
            },
            {
              name: 'updatedAt',
              type: 'DateTime!',
              description: 'Last update timestamp',
            },
          ],
        });

        // Add input type
        schema.types.push({
          name: `${typeName}Input`,
          kind: 'input',
          description: `Input for creating/updating ${typeName}`,
          fields: [],
        });

        // Add queries
        schema.queries!.push({
          name: resource,
          type: `[${typeName}!]!`,
          description: `List all ${resource}`,
          args: [
            {
              name: 'limit',
              type: 'Int',
              defaultValue: 20,
              description: 'Maximum number of items to return',
            },
            {
              name: 'offset',
              type: 'Int',
              defaultValue: 0,
              description: 'Number of items to skip',
            },
          ],
        });

        schema.queries!.push({
          name: resource.slice(0, -1),
          type: typeName,
          description: `Get a single ${typeName} by ID`,
          args: [
            {
              name: 'id',
              type: 'ID!',
              description: `${typeName} identifier`,
            },
          ],
        });

        // Add mutations
        schema.mutations!.push({
          name: `create${typeName}`,
          type: `${typeName}!`,
          description: `Create a new ${typeName}`,
          args: [
            {
              name: 'input',
              type: `${typeName}Input!`,
              description: `${typeName} data`,
            },
          ],
        });

        schema.mutations!.push({
          name: `update${typeName}`,
          type: `${typeName}!`,
          description: `Update an existing ${typeName}`,
          args: [
            {
              name: 'id',
              type: 'ID!',
              description: `${typeName} identifier`,
            },
            {
              name: 'input',
              type: `${typeName}Input!`,
              description: 'Updated data',
            },
          ],
        });

        schema.mutations!.push({
          name: `delete${typeName}`,
          type: 'Boolean!',
          description: `Delete a ${typeName}`,
          args: [
            {
              name: 'id',
              type: 'ID!',
              description: `${typeName} identifier`,
            },
          ],
        });
      }
    }

    // Add scalar types
    schema.types.push({
      name: 'DateTime',
      kind: 'scalar',
      description: 'ISO 8601 date-time string',
    });

    // Convert to SDL string
    const sdl = convertSchemaToSDL(schema);

    return {
      success: true,
      data: { schema, sdl },
      metadata: {
        schemaCount: schema.types.length,
        resourceCount: config.resources?.length || 0,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Convert GraphQL schema to SDL string
 * @private
 */
function convertSchemaToSDL(schema: GraphQLSchema): string {
  const lines: string[] = [];

  // Add types
  for (const type of schema.types) {
    if (type.kind === 'scalar') {
      lines.push(`scalar ${type.name}`);
      lines.push('');
      continue;
    }

    lines.push(`${type.kind} ${type.name} {`);
    if (type.fields) {
      for (const field of type.fields) {
        const args = field.args
          ? `(${field.args.map(a => `${a.name}: ${a.type}`).join(', ')})`
          : '';
        lines.push(`  ${field.name}${args}: ${field.type}`);
      }
    }
    lines.push('}');
    lines.push('');
  }

  // Add root types
  if (schema.queries && schema.queries.length > 0) {
    lines.push('type Query {');
    for (const query of schema.queries) {
      const args = query.args
        ? `(${query.args.map(a => `${a.name}: ${a.type}`).join(', ')})`
        : '';
      lines.push(`  ${query.name}${args}: ${query.type}`);
    }
    lines.push('}');
    lines.push('');
  }

  if (schema.mutations && schema.mutations.length > 0) {
    lines.push('type Mutation {');
    for (const mutation of schema.mutations) {
      const args = mutation.args
        ? `(${mutation.args.map(a => `${a.name}: ${a.type}`).join(', ')})`
        : '';
      lines.push(`  ${mutation.name}${args}: ${mutation.type}`);
    }
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate API client code
 *
 * @param spec - OpenAPI specification or GraphQL schema
 * @param options - Client generation options
 * @returns Generated client code
 *
 * @example
 * ```typescript
 * const client = generateAPIClient(openApiSpec, {
 *   language: 'typescript',
 *   outputFormat: 'axios',
 *   includeTypes: true
 * });
 * ```
 */
export function generateAPIClient(
  spec: OpenAPISpec | GraphQLSchema,
  options: ClientGenerationOptions
): APIDesignResult {
  try {
    let code = '';

    if (options.language === 'typescript') {
      if ('openapi' in spec) {
        code = generateTypeScriptRestClient(spec, options);
      } else {
        code = generateTypeScriptGraphQLClient(spec, options);
      }
    } else {
      return {
        success: false,
        errors: [`Language '${options.language}' not yet supported. Currently supports: typescript`],
      };
    }

    return {
      success: true,
      data: { code, language: options.language, format: options.outputFormat },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Generate TypeScript REST client
 * @private
 */
function generateTypeScriptRestClient(spec: OpenAPISpec, options: ClientGenerationOptions): string {
  const lines: string[] = [];

  // Add imports
  if (options.outputFormat === 'axios') {
    lines.push("import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';");
  } else {
    lines.push("// Using native fetch API");
  }
  lines.push('');

  // Add types if requested
  if (options.includeTypes && spec.components?.schemas) {
    lines.push('// Type definitions');
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      lines.push(`export interface ${name} {`);
      if (schema.properties) {
        for (const [propName, propSchema] of Object.entries(schema.properties)) {
          const required = schema.required?.includes(propName) ? '' : '?';
          const type = mapSchemaToTSType(propSchema);
          lines.push(`  ${propName}${required}: ${type};`);
        }
      }
      lines.push('}');
      lines.push('');
    }
  }

  // Add client class
  lines.push(`export class ${spec.info.title.replace(/\s+/g, '')}Client {`);
  lines.push('  private baseURL: string;');
  if (options.outputFormat === 'axios') {
    lines.push('  private client: AxiosInstance;');
  }
  lines.push('');
  lines.push('  constructor(baseURL: string, config?: any) {');
  lines.push('    this.baseURL = baseURL;');
  if (options.outputFormat === 'axios') {
    lines.push('    this.client = axios.create({ baseURL, ...config });');
  }
  lines.push('  }');
  lines.push('');

  // Add methods for each endpoint
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object' && operation.operationId) {
        lines.push(`  async ${operation.operationId}(params?: any): Promise<any> {`);
        if (options.outputFormat === 'axios') {
          lines.push(`    return this.client.${method}('${path}', params);`);
        } else {
          lines.push(`    const response = await fetch(\`\${this.baseURL}${path}\`, {`);
          lines.push(`      method: '${method.toUpperCase()}',`);
          lines.push(`      headers: { 'Content-Type': 'application/json' },`);
          lines.push(`      body: JSON.stringify(params)`);
          lines.push(`    });`);
          lines.push(`    return response.json();`);
        }
        lines.push('  }');
        lines.push('');
      }
    }
  }

  lines.push('}');

  return lines.join('\n');
}

/**
 * Generate TypeScript GraphQL client
 * @private
 */
function generateTypeScriptGraphQLClient(schema: GraphQLSchema, options: ClientGenerationOptions): string {
  const lines: string[] = [];

  lines.push("// GraphQL client");
  lines.push("export class GraphQLClient {");
  lines.push("  constructor(private endpoint: string) {}");
  lines.push("");
  lines.push("  async query(query: string, variables?: any): Promise<any> {");
  lines.push("    const response = await fetch(this.endpoint, {");
  lines.push("      method: 'POST',");
  lines.push("      headers: { 'Content-Type': 'application/json' },");
  lines.push("      body: JSON.stringify({ query, variables })");
  lines.push("    });");
  lines.push("    const { data, errors } = await response.json();");
  lines.push("    if (errors) throw new Error(errors[0].message);");
  lines.push("    return data;");
  lines.push("  }");
  lines.push("}");

  return lines.join('\n');
}

/**
 * Map JSON Schema type to TypeScript type
 * @private
 */
function mapSchemaToTSType(schema: APISchema): string {
  if (schema.$ref) {
    return schema.$ref.split('/').pop() || 'any';
  }

  switch (schema.type) {
    case 'string':
      return schema.enum ? schema.enum.map(v => `'${v}'`).join(' | ') : 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return schema.items ? `${mapSchemaToTSType(schema.items)}[]` : 'any[]';
    case 'object':
      return 'object';
    default:
      return 'any';
  }
}

/**
 * Validate API design against best practices
 *
 * @param spec - OpenAPI specification or GraphQL schema
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateAPIDesign(openApiSpec);
 * // result.valid, result.errors, result.warnings
 * ```
 */
export function validateAPIDesign(spec: OpenAPISpec | GraphQLSchema): ValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  if ('openapi' in spec) {
    // Validate OpenAPI spec
    if (!spec.info || !spec.info.title) {
      errors.push({
        path: 'info.title',
        message: 'API title is required',
        severity: 'error' as const,
        code: 'MISSING_TITLE',
      });
    }

    if (!spec.info || !spec.info.version) {
      errors.push({
        path: 'info.version',
        message: 'API version is required',
        severity: 'error' as const,
        code: 'MISSING_VERSION',
      });
    }

    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      warnings.push({
        path: 'paths',
        message: 'No API paths defined',
        severity: 'warning' as const,
        code: 'NO_PATHS',
        suggestion: 'Add at least one endpoint to your API',
      });
    }

    // Check for security
    if (!spec.security && !spec.components?.securitySchemes) {
      warnings.push({
        path: 'security',
        message: 'No security scheme defined',
        severity: 'warning' as const,
        code: 'NO_SECURITY',
        suggestion: 'Consider adding authentication to protect your API',
      });
    }

    // Check for versioning in server URLs
    if (spec.servers) {
      const hasVersioning = spec.servers.some(s => /v\d+/.test(s.url));
      if (!hasVersioning) {
        warnings.push({
          path: 'servers',
          message: 'Server URLs do not include version numbers',
          severity: 'warning' as const,
          code: 'NO_VERSIONING',
          suggestion: 'Include version in URL (e.g., /v1/) for better API evolution',
        });
      }
    }
  } else {
    // Validate GraphQL schema
    if (!spec.types || spec.types.length === 0) {
      errors.push({
        path: 'types',
        message: 'No types defined in schema',
        severity: 'error' as const,
        code: 'NO_TYPES',
      });
    }

    if (!spec.queries || spec.queries.length === 0) {
      warnings.push({
        path: 'queries',
        message: 'No queries defined',
        severity: 'warning' as const,
        code: 'NO_QUERIES',
        suggestion: 'Add at least one query to your schema',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions: errors.length === 0 && warnings.length === 0
      ? ['API design looks good! Consider adding documentation and examples.']
      : undefined,
  };
}

/**
 * Generate mock server code
 *
 * @param spec - OpenAPI specification
 * @param config - Mock server configuration
 * @returns Generated mock server code
 *
 * @example
 * ```typescript
 * const mockServer = generateMockServer(openApiSpec, {
 *   framework: 'express',
 *   port: 3000,
 *   includeCORS: true
 * });
 * ```
 */
export function generateMockServer(spec: OpenAPISpec, config: MockServerConfig): APIDesignResult {
  try {
    const framework = config.framework || 'express';
    let code = '';

    if (framework === 'express') {
      code = generateExpressMockServer(spec, config);
    } else {
      return {
        success: false,
        errors: [`Framework '${framework}' not yet supported. Currently supports: express`],
      };
    }

    return {
      success: true,
      data: { code, framework, port: config.port || 3000 },
      metadata: {
        endpointCount: Object.keys(spec.paths).length,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Generate Express mock server
 * @private
 */
function generateExpressMockServer(spec: OpenAPISpec, config: MockServerConfig): string {
  const lines: string[] = [];
  const port = config.port || 3000;

  // Add imports
  lines.push("import express from 'express';");
  if (config.includeCORS) {
    lines.push("import cors from 'cors';");
  }
  lines.push('');

  // Initialize app
  lines.push('const app = express();');
  lines.push('app.use(express.json());');
  if (config.includeCORS) {
    lines.push('app.use(cors());');
  }
  lines.push('');

  // Add logging middleware
  if (config.includeLogging) {
    lines.push('// Logging middleware');
    lines.push('// TODO: Replace with proper logger (e.g., winston, pino)');
    lines.push('app.use((req, res, next) => {');
    lines.push('  // Log request: `${req.method} ${req.path}`');
    lines.push('  next();');
    lines.push('});');
    lines.push('');
  }

  // Add delay middleware
  if (config.responseDelay) {
    lines.push('app.use((req, res, next) => {');
    lines.push(`  setTimeout(next, ${config.responseDelay});`);
    lines.push('});');
    lines.push('');
  }

  // Add routes
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation === 'object') {
        const expressPath = path.replace(/{([^}]+)}/g, ':$1');
        const successResponse = Object.entries(operation.responses || {}).find(
          ([code]) => code.startsWith('2')
        );

        lines.push(`app.${method}('${expressPath}', (req, res) => {`);
        if (successResponse) {
          const [statusCode, response] = successResponse;
          lines.push(`  // ${operation.summary || 'Mock endpoint'}`);
          lines.push(`  res.status(${statusCode}).json({`);
          lines.push(`    message: 'Mock response for ${operation.operationId || path}',`);
          lines.push(`    data: {}`);
          lines.push('  });');
        } else {
          lines.push(`  res.status(200).json({ message: 'OK' });`);
        }
        lines.push('});');
        lines.push('');
      }
    }
  }

  // Start server
  lines.push(`app.listen(${port}, () => {`);
  lines.push(`  // TODO: Replace with proper logger (e.g., winston, pino)`);
  lines.push(`  // Server running on port ${port}`);
  lines.push('});');

  return lines.join('\n');
}

/**
 * Capitalize first letter of string
 * @private
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
