/**
 * API Designer Constants
 * Central location for all magic numbers and constant values
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Default Configuration Values
export const DEFAULTS = {
  OPENAPI_VERSION: '3.0.3',
  API_VERSION: '1.0.0',
  MOCK_SERVER_PORT: 3000,
  REQUEST_TIMEOUT: 30000,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// Parameter Locations
export const PARAM_LOCATION = {
  QUERY: 'query',
  PATH: 'path',
  HEADER: 'header',
  COOKIE: 'cookie',
} as const;

// Content Types
export const CONTENT_TYPE = {
  JSON: 'application/json',
  XML: 'application/xml',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
} as const;

// Pagination Styles
export const PAGINATION_STYLE = {
  OFFSET: 'offset',
  CURSOR: 'cursor',
  PAGE: 'page',
} as const;

// Naming Conventions
export const NAMING_CASE = {
  CAMEL: 'camelCase',
  SNAKE: 'snake_case',
  KEBAB: 'kebab-case',
  PASCAL: 'PascalCase',
} as const;

// API Versioning Strategies
export const VERSIONING_STRATEGY = {
  URL: 'url',
  HEADER: 'header',
  QUERY: 'query',
} as const;

// Authentication Types
export const AUTH_TYPE = {
  NONE: 'none',
  API_KEY: 'apiKey',
  BEARER: 'bearer',
  OAUTH2: 'oauth2',
  BASIC: 'basic',
} as const;

// HTTP Methods
export const HTTP_METHOD = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  HEAD: 'head',
  OPTIONS: 'options',
} as const;

// GraphQL Types
export const GRAPHQL_SCALAR_TYPES = ['String', 'Int', 'Float', 'Boolean', 'ID'] as const;

// OpenAPI Schema Types
export const SCHEMA_TYPE = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
} as const;

// Validation Error Codes
export const VALIDATION_ERROR = {
  MISSING_ENDPOINT: 'MISSING_ENDPOINT',
  MISSING_SCHEMA: 'MISSING_SCHEMA',
  INVALID_METHOD: 'INVALID_METHOD',
  MISSING_AUTH: 'MISSING_AUTH',
  MISSING_VERSION: 'MISSING_VERSION',
  MISSING_ERROR_RESPONSE: 'MISSING_ERROR_RESPONSE',
} as const;

// String Format Types
export const STRING_FORMAT = {
  DATE: 'date',
  DATE_TIME: 'date-time',
  EMAIL: 'email',
  UUID: 'uuid',
  URI: 'uri',
  HOSTNAME: 'hostname',
  IPV4: 'ipv4',
  IPV6: 'ipv6',
} as const;

// Client Generation Languages
export const CLIENT_LANGUAGE = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript',
  PYTHON: 'python',
  JAVA: 'java',
  CSHARP: 'csharp',
  GO: 'go',
  RUBY: 'ruby',
  PHP: 'php',
} as const;

// HTTP Client Libraries
export const HTTP_CLIENT = {
  AXIOS: 'axios',
  FETCH: 'fetch',
  SDK: 'sdk',
} as const;

// Mock Server Frameworks
export const MOCK_FRAMEWORK = {
  EXPRESS: 'express',
  FASTIFY: 'fastify',
  KOA: 'koa',
  HAPI: 'hapi',
} as const;

// Data Generation Strategies
export const DATA_GENERATION = {
  FAKER: 'faker',
  CUSTOM: 'custom',
  EXAMPLES: 'examples',
} as const;
