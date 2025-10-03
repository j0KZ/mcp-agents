import { OpenAPISpec, GraphQLSchema, ValidationResult } from '../types.js';

/**
 * Validate API design against best practices
 *
 * @param spec - OpenAPI specification or GraphQL schema
 * @returns Validation result with errors and warnings
 */
export function validateAPIDesign(spec: OpenAPISpec | GraphQLSchema): ValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  if ('openapi' in spec) {
    validateOpenAPISpec(spec, errors, warnings);
  } else {
    validateGraphQLSchema(spec, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions: errors.length === 0 && warnings.length === 0
      ? ['API design looks good! Consider adding documentation and examples.']
      : [],
  };
}

/**
 * Validate OpenAPI specification
 */
function validateOpenAPISpec(spec: OpenAPISpec, errors: any[], warnings: any[]): void {
  // Required fields
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

  // Check for paths
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
}

/**
 * Validate GraphQL schema
 */
function validateGraphQLSchema(spec: GraphQLSchema, errors: any[], warnings: any[]): void {
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
