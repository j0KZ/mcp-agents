/**
 * Tests for Schema Validators
 */

import { describe, it, expect } from 'vitest';
import {
  validateSQLSchema,
  validateMongoSchema,
  estimateNormalForm,
} from '../src/validators/schema-validator.js';
import { DatabaseSchema, ValidationError, ValidationWarning } from '../src/types.js';

describe('Schema Validators', () => {
  describe('validateSQLSchema', () => {
    it('should detect missing primary key', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [{ name: 'name', type: 'VARCHAR', length: 100 }],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors.some(e => e.type === 'MISSING_PRIMARY_KEY')).toBe(true);
      expect(errors[0].table).toBe('users');
    });

    it('should not report error when primary key exists as column flag', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors.some(e => e.type === 'MISSING_PRIMARY_KEY')).toBe(false);
    });

    it('should not report error when primaryKey defined at table level', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
            primaryKey: ['id'],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors.some(e => e.type === 'MISSING_PRIMARY_KEY')).toBe(false);
    });

    it('should detect duplicate columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'name', type: 'VARCHAR', length: 100 },
              { name: 'name', type: 'TEXT' }, // Duplicate
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors.some(e => e.type === 'DUPLICATE_COLUMN')).toBe(true);
      expect(errors.find(e => e.type === 'DUPLICATE_COLUMN')?.column).toBe('name');
    });

    it('should warn for missing timestamps', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'MISSING_TIMESTAMP')).toBe(true);
    });

    it('should not warn if timestamps exist', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'MISSING_TIMESTAMP')).toBe(false);
    });

    it('should warn for long VARCHAR columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'description', type: 'VARCHAR', length: 600 }, // > 500 threshold
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'LONG_VARCHAR')).toBe(true);
      expect(warnings.find(w => w.type === 'LONG_VARCHAR')?.column).toBe('description');
    });

    it('should not warn for normal VARCHAR columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'LONG_VARCHAR')).toBe(false);
    });

    it('should handle schema with no tables', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });

    it('should handle schema with undefined tables', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateSQLSchema(schema, errors, warnings);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('validateMongoSchema', () => {
    it('should warn when _id is not explicitly defined', () => {
      const schema: DatabaseSchema = {
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [{ name: 'name', type: 'string' }],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateMongoSchema(schema, errors, warnings);

      expect(warnings.some(w => w.message.includes('_id'))).toBe(true);
    });

    it('should not warn when _id is explicitly defined', () => {
      const schema: DatabaseSchema = {
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [
              { name: '_id', type: 'ObjectId' },
              { name: 'name', type: 'string' },
            ],
          },
        ],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateMongoSchema(schema, errors, warnings);

      expect(warnings.some(w => w.message.includes('_id'))).toBe(false);
    });

    it('should handle schema with no collections', () => {
      const schema: DatabaseSchema = {
        database: 'mongodb',
        collections: [],
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateMongoSchema(schema, errors, warnings);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });

    it('should handle schema with undefined collections', () => {
      const schema: DatabaseSchema = {
        database: 'mongodb',
      };
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      validateMongoSchema(schema, errors, warnings);

      expect(errors).toHaveLength(0);
      expect(warnings).toHaveLength(0);
    });
  });

  describe('estimateNormalForm', () => {
    it('should return 1NF for schema with ARRAY columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'tags', type: 'ARRAY' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('1NF');
    });

    it('should return DENORMALIZED for schema with JSON columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'metadata', type: 'JSON' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('DENORMALIZED');
    });

    it('should return DENORMALIZED for schema with JSONB columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'metadata', type: 'JSONB' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('DENORMALIZED');
    });

    it('should return 2NF for schema with composite primary keys', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'user_roles',
            columns: [
              { name: 'user_id', type: 'INTEGER' },
              { name: 'role_id', type: 'INTEGER' },
            ],
            primaryKey: ['user_id', 'role_id'],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('2NF');
    });

    it('should return 3NF for normalized schema', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'name', type: 'VARCHAR' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('3NF');
    });

    it('should handle schema with empty tables', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('3NF');
    });

    it('should handle schema with undefined tables', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('3NF');
    });
  });
});
