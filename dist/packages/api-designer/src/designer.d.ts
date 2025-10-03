/**
 * Core API Designer implementation
 * Provides comprehensive API design, generation, and validation tools
 */
import { APIDesignConfig, OpenAPISpec, RESTEndpoint, GraphQLSchema, ClientGenerationOptions, MockServerConfig, ValidationResult, APIDesignResult, GraphQLType } from './types.js';
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
export declare function generateOpenAPI(config: APIDesignConfig, endpoints?: RESTEndpoint[]): APIDesignResult;
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
export declare function designRESTEndpoints(resources: string[], config: APIDesignConfig): APIDesignResult;
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
export declare function createGraphQLSchema(config: APIDesignConfig, customTypes?: GraphQLType[]): APIDesignResult;
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
export declare function generateAPIClient(spec: OpenAPISpec | GraphQLSchema, options: ClientGenerationOptions): APIDesignResult;
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
export declare function validateAPIDesign(spec: OpenAPISpec | GraphQLSchema): ValidationResult;
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
export declare function generateMockServer(spec: OpenAPISpec, config: MockServerConfig): APIDesignResult;
//# sourceMappingURL=designer.d.ts.map