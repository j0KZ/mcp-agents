import { describe, it, expect } from 'vitest';
import {
  designSchema,
  generateMigration,
  validateSchema,
  createERDiagram,
  generateSeedData,
  optimizeIndexes,
  analyzeSchema,
} from './designer.js';

describe('DB Schema Designer', () => {
  describe('Schema Design', () => {
    it('should design SQL schema', () => {
      const result = designSchema('Users have many orders', {
        database: 'postgres',
      });
      expect(result.database).toBe('postgres');
      expect(result.tables.length).toBeGreaterThan(0);
    });

    it('should design MongoDB schema', () => {
      const result = designSchema('Users have posts', {
        database: 'mongodb',
      });
      expect(result.database).toBe('mongodb');
      expect(result.collections.length).toBeGreaterThan(0);
    });

    it('should handle complex relationships', () => {
      const result = designSchema(
        'Users have many posts. Posts belong to categories. Categories have many posts.',
        {
          database: 'postgres',
        }
      );
      expect(result.tables.length).toBeGreaterThan(0);
      expect(result.tables.some((t: any) => t.name.includes('user'))).toBe(true);
    });

    it('should include timestamps when requested', () => {
      const result = designSchema('Products table', {
        database: 'postgres',
        includeTimestamps: true,
      });
      const table = result.tables[0];
      expect(table.columns.some((c: any) => c.name === 'created_at')).toBe(true);
      expect(table.columns.some((c: any) => c.name === 'updated_at')).toBe(true);
    });
  });

  describe('Migration Generation', () => {
    it('should generate migration', () => {
      const schema = designSchema('Products table', { database: 'postgres' });
      const migration = generateMigration(schema, 'Initial schema');
      expect(migration.up).toContain('CREATE TABLE');
      expect(migration.down).toContain('DROP TABLE');
    });

    it('should generate migration with foreign keys', () => {
      const schema = designSchema('Orders belong to users', { database: 'postgres' });
      const migration = generateMigration(schema, 'Add orders');
      expect(migration.up).toContain('CREATE TABLE');
    });

    it('should generate MongoDB migration', () => {
      const schema = designSchema('Users collection', { database: 'mongodb' });
      const migration = generateMigration(schema, 'Initial schema');
      expect(migration.up).toContain('createCollection');
    });
  });

  describe('ER Diagram Generation', () => {
    it('should generate Mermaid diagram', () => {
      const schema = designSchema('Users have orders', { database: 'postgres' });
      const diagram = createERDiagram(schema, { format: 'mermaid' });
      expect(diagram).toContain('erDiagram');
      expect(diagram.length).toBeGreaterThan(10);
    });

    it('should generate DBML diagram', () => {
      const schema = designSchema('Products table', { database: 'postgres' });
      const diagram = createERDiagram(schema, { format: 'dbml' });
      expect(diagram).toContain('Table');
    });
  });

  describe('Seed Data Generation', () => {
    it('should generate seed data', () => {
      const schema = designSchema('Users table', { database: 'postgres' });
      const seeds = generateSeedData(schema, 5);
      expect(seeds).toHaveLength(1); // 1 table
      expect(seeds[0].records).toHaveLength(5);
    });

    it('should respect foreign key constraints', () => {
      const schema = designSchema('Orders belong to users', { database: 'postgres' });
      const seeds = generateSeedData(schema, 3);
      expect(seeds.length).toBeGreaterThan(0);
    });
  });

  describe('Schema Validation', () => {
    it('should validate schema', () => {
      const schema = designSchema('Users table', { database: 'postgres' });
      const validation = validateSchema(schema);
      expect(validation.valid).toBe(true);
    });

    it('should detect missing primary keys', () => {
      const invalidSchema: any = {
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [{ name: 'name', type: 'VARCHAR(255)' }],
          },
        ],
      };
      const validation = validateSchema(invalidSchema);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Index Optimization', () => {
    it('should return index suggestions', () => {
      const schema = designSchema('Users have many orders', { database: 'postgres' });
      const suggestions = optimizeIndexes(schema);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('Schema Analysis', () => {
    it('should analyze schema complexity', () => {
      const schema = designSchema('Users have orders and posts', { database: 'postgres' });
      const analysis = analyzeSchema(schema);
      expect(analysis.tableCount).toBeGreaterThan(0);
    });
  });
});
