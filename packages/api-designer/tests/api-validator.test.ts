/**
 * Tests for API validator
 */

import { describe, it, expect } from 'vitest';
import { validateAPIDesign } from '../src/validators/api-validator.js';

describe('API Validator', () => {
  describe('validateAPIDesign', () => {
    describe('Invalid input handling', () => {
      it('should return error for null spec', () => {
        const result = validateAPIDesign(null as any);

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].code).toBe('INVALID_SPEC');
      });

      it('should return error for undefined spec', () => {
        const result = validateAPIDesign(undefined as any);

        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('must be an object');
      });

      it('should return error for non-object spec', () => {
        const result = validateAPIDesign('string' as any);

        expect(result.valid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_SPEC');
      });
    });

    describe('OpenAPI validation', () => {
      it('should validate valid OpenAPI spec', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: {
            '/users': {
              get: { summary: 'Get users' },
            },
          },
          security: [{ bearerAuth: [] }],
          servers: [{ url: 'https://api.example.com/v1' }],
        };

        const result = validateAPIDesign(spec);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return error for missing title', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            version: '1.0.0',
          },
          paths: {},
        };

        const result = validateAPIDesign(spec as any);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e: any) => e.code === 'MISSING_TITLE')).toBe(true);
      });

      it('should return error for missing version', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
          },
          paths: {},
        };

        const result = validateAPIDesign(spec as any);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e: any) => e.code === 'MISSING_VERSION')).toBe(true);
      });

      it('should return error for missing info object', () => {
        const spec = {
          openapi: '3.0.0',
          paths: {},
        };

        const result = validateAPIDesign(spec as any);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e: any) => e.code === 'MISSING_TITLE')).toBe(true);
        expect(result.errors.some((e: any) => e.code === 'MISSING_VERSION')).toBe(true);
      });

      it('should warn for empty paths', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: {},
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_PATHS')).toBe(true);
      });

      it('should warn for undefined paths', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
        };

        const result = validateAPIDesign(spec as any);

        expect(result.warnings.some((w: any) => w.code === 'NO_PATHS')).toBe(true);
      });

      it('should warn for missing security scheme', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_SECURITY')).toBe(true);
      });

      it('should not warn if security is defined', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
          security: [{ apiKey: [] }],
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_SECURITY')).toBe(false);
      });

      it('should not warn if components.securitySchemes is defined', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
          components: {
            securitySchemes: {
              bearerAuth: { type: 'http', scheme: 'bearer' },
            },
          },
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_SECURITY')).toBe(false);
      });

      it('should warn for server URLs without versioning', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
          servers: [{ url: 'https://api.example.com' }],
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_VERSIONING')).toBe(true);
      });

      it('should not warn if server URL has versioning', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
          servers: [{ url: 'https://api.example.com/v1' }],
        };

        const result = validateAPIDesign(spec);

        expect(result.warnings.some((w: any) => w.code === 'NO_VERSIONING')).toBe(false);
      });

      it('should return suggestions for valid spec', () => {
        const spec = {
          openapi: '3.0.0',
          info: {
            title: 'Test API',
            version: '1.0.0',
          },
          paths: { '/test': {} },
          security: [{ apiKey: [] }],
          servers: [{ url: 'https://api.example.com/v1' }],
        };

        const result = validateAPIDesign(spec);

        expect(result.suggestions.length).toBeGreaterThan(0);
        expect(result.suggestions[0]).toContain('looks good');
      });
    });

    describe('GraphQL validation', () => {
      it('should validate valid GraphQL schema', () => {
        const spec = {
          types: [{ name: 'User', fields: [{ name: 'id', type: 'ID!' }] }],
          queries: [{ name: 'getUser', type: 'User', args: [] }],
        };

        const result = validateAPIDesign(spec);

        expect(result.valid).toBe(true);
      });

      it('should return error for missing types', () => {
        const spec = {
          types: [],
          queries: [{ name: 'getUser' }],
        };

        const result = validateAPIDesign(spec as any);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e: any) => e.code === 'NO_TYPES')).toBe(true);
      });

      it('should return error for undefined types', () => {
        const spec = {
          queries: [{ name: 'getUser' }],
        };

        const result = validateAPIDesign(spec as any);

        expect(result.valid).toBe(false);
        expect(result.errors.some((e: any) => e.code === 'NO_TYPES')).toBe(true);
      });

      it('should warn for missing queries', () => {
        const spec = {
          types: [{ name: 'User', fields: [] }],
          queries: [],
        };

        const result = validateAPIDesign(spec as any);

        expect(result.warnings.some((w: any) => w.code === 'NO_QUERIES')).toBe(true);
      });

      it('should warn for undefined queries', () => {
        const spec = {
          types: [{ name: 'User', fields: [] }],
        };

        const result = validateAPIDesign(spec as any);

        expect(result.warnings.some((w: any) => w.code === 'NO_QUERIES')).toBe(true);
      });
    });
  });
});
