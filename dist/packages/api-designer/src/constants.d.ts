/**
 * API Designer Constants
 * Central location for all magic numbers and constant values
 */
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const DEFAULTS: {
    readonly OPENAPI_VERSION: "3.0.3";
    readonly API_VERSION: "1.0.0";
    readonly MOCK_SERVER_PORT: 3000;
    readonly REQUEST_TIMEOUT: 30000;
    readonly MAX_PAGE_SIZE: 100;
    readonly DEFAULT_PAGE_SIZE: 20;
};
export declare const PARAM_LOCATION: {
    readonly QUERY: "query";
    readonly PATH: "path";
    readonly HEADER: "header";
    readonly COOKIE: "cookie";
};
export declare const CONTENT_TYPE: {
    readonly JSON: "application/json";
    readonly XML: "application/xml";
    readonly FORM: "application/x-www-form-urlencoded";
    readonly MULTIPART: "multipart/form-data";
};
export declare const PAGINATION_STYLE: {
    readonly OFFSET: "offset";
    readonly CURSOR: "cursor";
    readonly PAGE: "page";
};
export declare const NAMING_CASE: {
    readonly CAMEL: "camelCase";
    readonly SNAKE: "snake_case";
    readonly KEBAB: "kebab-case";
    readonly PASCAL: "PascalCase";
};
export declare const VERSIONING_STRATEGY: {
    readonly URL: "url";
    readonly HEADER: "header";
    readonly QUERY: "query";
};
export declare const AUTH_TYPE: {
    readonly NONE: "none";
    readonly API_KEY: "apiKey";
    readonly BEARER: "bearer";
    readonly OAUTH2: "oauth2";
    readonly BASIC: "basic";
};
export declare const HTTP_METHOD: {
    readonly GET: "get";
    readonly POST: "post";
    readonly PUT: "put";
    readonly PATCH: "patch";
    readonly DELETE: "delete";
    readonly HEAD: "head";
    readonly OPTIONS: "options";
};
export declare const GRAPHQL_SCALAR_TYPES: readonly ["String", "Int", "Float", "Boolean", "ID"];
export declare const SCHEMA_TYPE: {
    readonly STRING: "string";
    readonly NUMBER: "number";
    readonly INTEGER: "integer";
    readonly BOOLEAN: "boolean";
    readonly ARRAY: "array";
    readonly OBJECT: "object";
};
export declare const VALIDATION_ERROR: {
    readonly MISSING_ENDPOINT: "MISSING_ENDPOINT";
    readonly MISSING_SCHEMA: "MISSING_SCHEMA";
    readonly INVALID_METHOD: "INVALID_METHOD";
    readonly MISSING_AUTH: "MISSING_AUTH";
    readonly MISSING_VERSION: "MISSING_VERSION";
    readonly MISSING_ERROR_RESPONSE: "MISSING_ERROR_RESPONSE";
};
export declare const STRING_FORMAT: {
    readonly DATE: "date";
    readonly DATE_TIME: "date-time";
    readonly EMAIL: "email";
    readonly UUID: "uuid";
    readonly URI: "uri";
    readonly HOSTNAME: "hostname";
    readonly IPV4: "ipv4";
    readonly IPV6: "ipv6";
};
export declare const CLIENT_LANGUAGE: {
    readonly TYPESCRIPT: "typescript";
    readonly JAVASCRIPT: "javascript";
    readonly PYTHON: "python";
    readonly JAVA: "java";
    readonly CSHARP: "csharp";
    readonly GO: "go";
    readonly RUBY: "ruby";
    readonly PHP: "php";
};
export declare const HTTP_CLIENT: {
    readonly AXIOS: "axios";
    readonly FETCH: "fetch";
    readonly SDK: "sdk";
};
export declare const MOCK_FRAMEWORK: {
    readonly EXPRESS: "express";
    readonly FASTIFY: "fastify";
    readonly KOA: "koa";
    readonly HAPI: "hapi";
};
export declare const DATA_GENERATION: {
    readonly FAKER: "faker";
    readonly CUSTOM: "custom";
    readonly EXAMPLES: "examples";
};
//# sourceMappingURL=constants.d.ts.map