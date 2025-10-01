/**
 * API Designer - Comprehensive API design, generation, and validation toolkit
 *
 * @packageDocumentation
 */

export * from './types.js';
export * from './designer.js';

// Re-export main functions for convenience
export {
  generateOpenAPI,
  designRESTEndpoints,
  createGraphQLSchema,
  generateAPIClient,
  validateAPIDesign,
  generateMockServer,
} from './designer.js';

// Version
export const VERSION = '1.0.0';
