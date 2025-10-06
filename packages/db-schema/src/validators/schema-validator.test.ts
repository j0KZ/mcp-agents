import { describe, it, expect } from 'vitest';
import { validateSQLSchema, validateMongoSchema, estimateNormalForm } from './schema-validator.js';
import { DatabaseSchema, ValidationError, ValidationWarning } from '../types.js';

describe('Schema Validator', () => {
  describe('validateSQLSchema()', () => {
    it('should detect missing primary key', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };

      validateSQLSchema(schema, errors, warnings);

      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('MISSING_PRIMARY_KEY');
      expect(errors[0].table).toBe('users');
    });

    it('should accept table with primary key column', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

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

      validateSQLSchema(schema, errors, warnings);

      expect(errors.filter(e => e.type === 'MISSING_PRIMARY_KEY')).toHaveLength(0);
    });

    it('should detect duplicate columns', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'email', type: 'VARCHAR', length: 100 },
              { name: 'email', type: 'VARCHAR', length: 100 }, // Duplicate
            ],
          },
        ],
      };

      validateSQLSchema(schema, errors, warnings);

      expect(errors.some(e => e.type === 'DUPLICATE_COLUMN')).toBe(true);
      expect(errors.find(e => e.type === 'DUPLICATE_COLUMN')?.column).toBe('email');
    });

    it('should warn about missing timestamps', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'MISSING_TIMESTAMP')).toBe(true);
    });

    it('should accept table with timestamp columns', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'created_at', type: 'TIMESTAMP' },
              { name: 'updated_at', type: 'TIMESTAMP' },
            ],
          },
        ],
      };

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.filter(w => w.type === 'MISSING_TIMESTAMP')).toHaveLength(0);
    });

    it('should warn about long VARCHAR columns', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'bio', type: 'VARCHAR', length: 5000 }, // Too long
            ],
          },
        ],
      };

      validateSQLSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'LONG_VARCHAR')).toBe(true);
      expect(warnings.find(w => w.type === 'LONG_VARCHAR')?.column).toBe('bio');
    });
  });

  describe('validateMongoSchema()', () => {
    it('should warn about missing _id field', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [
              { name: 'name', type: 'String' },
              { name: 'email', type: 'String' },
            ],
          },
        ],
      };

      validateMongoSchema(schema, errors, warnings);

      expect(warnings.some(w => w.type === 'MISSING_TIMESTAMP')).toBe(true);
    });

    it('should accept collection with _id field', () => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const schema: DatabaseSchema = {
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [
              { name: '_id', type: 'ObjectId' },
              { name: 'name', type: 'String' },
            ],
          },
        ],
      };

      validateMongoSchema(schema, errors, warnings);

      expect(warnings.filter(w => w.type === 'MISSING_TIMESTAMP')).toHaveLength(0);
    });
  });

  describe('estimateNormalForm()', () => {
    it('should detect 1NF violation with ARRAY columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'emails', type: 'ARRAY' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('1NF');
    });

    it('should detect denormalized schema with JSON columns', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'metadata', type: 'JSON' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('DENORMALIZED');
    });

    it('should detect 2NF with composite primary keys', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'order_items',
            primaryKey: ['order_id', 'product_id'],
            columns: [
              { name: 'order_id', type: 'INTEGER' },
              { name: 'product_id', type: 'INTEGER' },
              { name: 'quantity', type: 'INTEGER' },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('2NF');
    });

    it('should estimate 3NF for well-normalized schemas', () => {
      const schema: DatabaseSchema = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            primaryKey: ['id'],
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'name', type: 'VARCHAR', length: 100 },
            ],
          },
        ],
      };

      const result = estimateNormalForm(schema);
      expect(result).toBe('3NF');
    });
  });
});
