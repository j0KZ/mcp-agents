/**
 * Type definitions for API Designer MCP
 * Comprehensive types for REST, GraphQL, and OpenAPI design
 */
/**
 * HTTP methods supported by REST APIs
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
/**
 * Authentication types supported
 */
export type AuthType = 'none' | 'apiKey' | 'bearer' | 'oauth2' | 'basic';
/**
 * API design styles
 */
export type APIStyle = 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket';
/**
 * Data types for API parameters and responses
 */
export type DataType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'file';
/**
 * Parameter location in HTTP request
 */
export type ParameterLocation = 'query' | 'path' | 'header' | 'cookie' | 'body';
/**
 * Response content types
 */
export type ContentType = 'application/json' | 'application/xml' | 'text/plain' | 'multipart/form-data' | 'application/octet-stream';
/**
 * API parameter definition
 */
export interface APIParameter {
    name: string;
    type: DataType;
    required?: boolean;
    description?: string;
    default?: any;
    example?: any;
    enum?: any[];
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
}
/**
 * API response definition
 */
export interface APIResponse {
    statusCode: number;
    description: string;
    contentType?: ContentType;
    schema?: APISchema;
    examples?: Record<string, any>;
    headers?: Record<string, APIParameter>;
}
/**
 * API schema definition (JSON Schema compatible)
 */
export interface APISchema {
    type: DataType;
    properties?: Record<string, APISchema>;
    items?: APISchema;
    required?: string[];
    description?: string;
    example?: any;
    enum?: any[];
    format?: string;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    additionalProperties?: boolean | APISchema;
    allOf?: APISchema[];
    anyOf?: APISchema[];
    oneOf?: APISchema[];
    not?: APISchema;
    $ref?: string;
}
/**
 * REST API endpoint definition
 */
export interface RESTEndpoint {
    path: string;
    method: HTTPMethod;
    summary: string;
    description?: string;
    operationId?: string;
    tags?: string[];
    parameters?: Array<APIParameter & {
        in: ParameterLocation;
    }>;
    requestBody?: {
        required?: boolean;
        description?: string;
        content: Partial<Record<ContentType, {
            schema: APISchema;
            examples?: Record<string, any>;
        }>>;
    };
    responses: Record<string, APIResponse>;
    security?: Array<Record<string, string[]>>;
    deprecated?: boolean;
}
/**
 * GraphQL field definition
 */
export interface GraphQLField {
    name: string;
    type: string;
    description?: string;
    args?: GraphQLArgument[];
    resolve?: string;
    deprecated?: boolean;
    deprecationReason?: string;
}
/**
 * GraphQL argument definition
 */
export interface GraphQLArgument {
    name: string;
    type: string;
    description?: string;
    defaultValue?: any;
}
/**
 * GraphQL type definition
 */
export interface GraphQLType {
    name: string;
    kind: 'object' | 'input' | 'interface' | 'union' | 'enum' | 'scalar';
    description?: string;
    fields?: GraphQLField[];
    interfaces?: string[];
    possibleTypes?: string[];
    enumValues?: Array<{
        name: string;
        description?: string;
        deprecated?: boolean;
    }>;
}
/**
 * GraphQL schema definition
 */
export interface GraphQLSchema {
    types: GraphQLType[];
    queries?: GraphQLField[];
    mutations?: GraphQLField[];
    subscriptions?: GraphQLField[];
    directives?: Array<{
        name: string;
        description?: string;
        locations: string[];
        args?: GraphQLArgument[];
    }>;
}
/**
 * OpenAPI 3.0 specification
 */
export interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
        contact?: {
            name?: string;
            email?: string;
            url?: string;
        };
        license?: {
            name: string;
            url?: string;
        };
    };
    servers?: Array<{
        url: string;
        description?: string;
        variables?: Record<string, {
            default: string;
            enum?: string[];
            description?: string;
        }>;
    }>;
    paths: Record<string, Record<string, any>>;
    components?: {
        schemas?: Record<string, APISchema>;
        responses?: Record<string, APIResponse>;
        parameters?: Record<string, APIParameter>;
        securitySchemes?: Record<string, any>;
        requestBodies?: Record<string, any>;
        headers?: Record<string, any>;
        examples?: Record<string, any>;
    };
    security?: Array<Record<string, string[]>>;
    tags?: Array<{
        name: string;
        description?: string;
        externalDocs?: {
            url: string;
            description?: string;
        };
    }>;
    externalDocs?: {
        url: string;
        description?: string;
    };
}
/**
 * API design configuration
 */
export interface APIDesignConfig {
    name: string;
    version: string;
    description?: string;
    baseUrl?: string;
    style: APIStyle;
    auth?: {
        type: AuthType;
        config?: Record<string, any>;
    };
    resources?: string[];
    features?: string[];
    conventions?: {
        namingCase?: 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase';
        versioning?: 'url' | 'header' | 'query';
        pagination?: 'offset' | 'cursor' | 'page';
        errorFormat?: 'rfc7807' | 'custom';
    };
}
/**
 * API client generation options
 */
export interface ClientGenerationOptions {
    language: 'typescript' | 'javascript' | 'python' | 'java' | 'csharp' | 'go' | 'ruby' | 'php';
    outputFormat?: 'axios' | 'fetch' | 'sdk' | 'openapi-generator';
    includeTypes?: boolean;
    includeTests?: boolean;
    asyncStyle?: 'promise' | 'async-await' | 'callback';
    errorHandling?: 'throw' | 'return' | 'callback';
}
/**
 * Mock server configuration
 */
export interface MockServerConfig {
    port?: number;
    framework?: 'express' | 'fastify' | 'koa' | 'hapi';
    middleware?: string[];
    responseDelay?: number;
    includeCORS?: boolean;
    includeLogging?: boolean;
    dataGeneration?: 'faker' | 'custom' | 'examples';
}
/**
 * API validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions?: string[];
}
/**
 * Validation error
 */
export interface ValidationError {
    path: string;
    message: string;
    severity: 'error';
    code?: string;
    suggestion?: string;
}
/**
 * Validation warning
 */
export interface ValidationWarning {
    path: string;
    message: string;
    severity: 'warning';
    code?: string;
    suggestion?: string;
}
/**
 * API design result
 */
export interface APIDesignResult {
    success: boolean;
    data?: any;
    errors?: string[];
    warnings?: string[];
    metadata?: {
        endpointCount?: number;
        resourceCount?: number;
        schemaCount?: number;
        generatedAt?: string;
        version?: string;
    };
}
//# sourceMappingURL=types.d.ts.map