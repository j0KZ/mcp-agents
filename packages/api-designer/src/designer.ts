/**
 * Core API Designer implementation (Refactored for reduced complexity)
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
  GraphQLType,
  APISchema,
} from './types.js';
import { generateOpenAPISpec, generateRESTEndpointsFromResources } from './generators/openapi-generator.js';
import {
  generateTypeScriptRestClient,
  generateTypeScriptGraphQLClient,
  generatePythonRestClient
} from './generators/client-generator.js';
import { validateAPIDesign as validateAPI } from './validators/api-validator.js';
import { generateMockServerCode, createMockServer as createMockServerInstance } from './generators/mock-server-generator.js';

/**
 * Generate OpenAPI 3.0 specification from configuration
 */
export function generateOpenAPI(
  config: APIDesignConfig,
  endpoints?: RESTEndpoint[]
): APIDesignResult {
  return generateOpenAPISpec(config, endpoints);
}

/**
 * Design REST API endpoints with best practices
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
      metadata: { generatedAt: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Create GraphQL schema with types, queries, and mutations
 */
export function createGraphQLSchema(
  configOrTypes: APIDesignConfig | GraphQLType[],
  optionalConfig?: Partial<APIDesignConfig>
): APIDesignResult {
  try {
    let types: GraphQLType[];
    let config: Partial<APIDesignConfig> | undefined;

    // Handle both old and new signatures
    if (Array.isArray(configOrTypes)) {
      types = configOrTypes;
      config = optionalConfig;
    } else {
      // Old signature: config with resources
      config = configOrTypes;
      types = (config.resources || []).map(resource => ({
        name: resource,
        kind: 'object' as const,
        fields: [
          { name: 'id', type: 'ID!' },
          { name: 'name', type: 'String!' },
        ],
      }));
    }

    const queries: any[] = [];
    const mutations: any[] = [];

    // Generate basic queries for each type
    for (const type of types) {
      if (type.kind === 'object') {
        queries.push({
          name: `get${type.name}`,
          type: type.name,
          args: [{ name: 'id', type: 'ID!', description: `${type.name} identifier` }],
          description: `Fetch a single ${type.name}`,
        });

        queries.push({
          name: `list${type.name}s`,
          type: `[${type.name}]`,
          description: `List all ${type.name}s`,
        });
      }
    }

    const schema: GraphQLSchema = {
      types,
      queries,
      mutations,
    };

    // Generate SDL
    const sdl = generateGraphQLSDL(schema);

    return {
      success: true,
      data: { ...schema, sdl },
      metadata: { generatedAt: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * Generate GraphQL SDL from schema
 */
function generateGraphQLSDL(schema: GraphQLSchema): string {
  const lines: string[] = [];

  // Add custom types
  for (const type of schema.types) {
    const sdlKind = type.kind === 'object' ? 'type' : type.kind;
    lines.push(`${sdlKind} ${type.name} {`);
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
 */
export function generateAPIClient(
  spec: OpenAPISpec | GraphQLSchema,
  options: ClientGenerationOptions
): APIDesignResult {
  try {
    let code = '';

    if (options.language === 'typescript') {
      code = 'openapi' in spec
        ? generateTypeScriptRestClient(spec, options)
        : generateTypeScriptGraphQLClient(spec, options);
    } else if (options.language === 'python' && 'openapi' in spec) {
      code = generatePythonRestClient(spec, options);
    } else {
      return {
        success: false,
        errors: [`Language '${options.language}' not yet supported`],
      };
    }

    return {
      success: true,
      data: { code, language: options.language, format: options.outputFormat },
      metadata: { generatedAt: new Date().toISOString() },
    };
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}

/**
 * GraphQL client wrapper (re-export for backward compatibility)
 */
export class GraphQLClient {
  constructor(private endpoint: string) {}

  async query(query: string, variables?: any): Promise<any> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    return response.json();
  }
}

/**
 * Validate API design against best practices
 */
export function validateAPIDesign(spec: OpenAPISpec | GraphQLSchema): ValidationResult {
  return validateAPI(spec);
}

/**
 * Generate mock server code or instance
 */
export function generateMockServer(
  spec: OpenAPISpec,
  config: MockServerConfig
): APIDesignResult | any {
  try {
    if (config.framework) {
      const code = generateMockServerCode(spec, config);
      return {
        success: true,
        data: { code, framework: config.framework, port: config.port || 3000 },
        metadata: { generatedAt: new Date().toISOString() },
      };
    } else {
      const server = createMockServerInstance(spec, config);
      return server;
    }
  } catch (error) {
    return {
      success: false,
      errors: [(error as Error).message],
    };
  }
}
