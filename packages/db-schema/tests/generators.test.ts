/**
 * Tests for generator modules
 */

import { describe, it, expect } from 'vitest';
import {
  generateSQLUpMigration,
  generateSQLDownMigration,
  generateMongoUpMigration,
  generateMongoDownMigration,
  topologicalSort,
} from '../src/generators/migration-generator.js';
import {
  generateSQLRecords,
  generateMongoRecords,
  generateMockValue,
} from '../src/generators/seed-generator.js';
import {
  generateMermaidDiagram,
  generateDBMLDiagram,
  generatePlantUMLDiagram,
} from '../src/generators/diagram-generator.js';
import { DatabaseSchema, SQLTable, MongoCollection } from '../src/types.js';

describe('Migration Generator', () => {
  describe('generateSQLUpMigration', () => {
    it('should generate CREATE TABLE statements', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
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

      const sql = generateSQLUpMigration(schema);
      expect(sql).toContain('CREATE TABLE users');
      expect(sql).toContain('id');
      expect(sql).toContain('name');
    });

    it('should include indexes in migration', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [{ name: 'id', type: 'INTEGER' }],
            indexes: [{ name: 'idx_users_id', columns: ['id'], unique: true }],
          },
        ],
      };

      const sql = generateSQLUpMigration(schema);
      expect(sql).toContain('idx_users_id');
    });

    it('should handle empty tables array', () => {
      const schema: DatabaseSchema = {
        name: 'empty_db',
        database: 'postgres',
        tables: [],
      };

      const sql = generateSQLUpMigration(schema);
      expect(sql).toContain('empty_db');
    });

    it('should handle undefined tables', () => {
      const schema: DatabaseSchema = {
        name: 'no_tables',
        database: 'postgres',
      };

      const sql = generateSQLUpMigration(schema);
      expect(sql).toBeDefined();
    });
  });

  describe('generateSQLDownMigration', () => {
    it('should generate DROP TABLE statements in reverse order', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
        database: 'postgres',
        tables: [
          { name: 'users', columns: [] },
          { name: 'orders', columns: [] },
        ],
      };

      const sql = generateSQLDownMigration(schema);
      expect(sql).toContain('DROP TABLE IF EXISTS orders');
      expect(sql).toContain('DROP TABLE IF EXISTS users');
      // orders should come before users (reverse order)
      expect(sql.indexOf('orders')).toBeLessThan(sql.indexOf('users'));
    });

    it('should handle empty tables', () => {
      const schema: DatabaseSchema = {
        name: 'empty',
        database: 'postgres',
        tables: [],
      };

      const sql = generateSQLDownMigration(schema);
      expect(sql).toContain('Rollback');
    });
  });

  describe('generateMongoUpMigration', () => {
    it('should generate createCollection commands', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [{ name: '_id', type: 'ObjectId' }],
          },
        ],
      };

      const commands = generateMongoUpMigration(schema);
      expect(commands).toContain("db.createCollection('users')");
    });

    it('should include index creation', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
        database: 'mongodb',
        collections: [
          {
            name: 'users',
            fields: [{ name: 'email', type: 'String' }],
            indexes: [{ name: 'idx_email', columns: ['email'] }],
          },
        ],
      };

      const commands = generateMongoUpMigration(schema);
      expect(commands).toContain('createIndex');
      expect(commands).toContain('idx_email');
    });

    it('should handle empty collections', () => {
      const schema: DatabaseSchema = {
        name: 'empty',
        database: 'mongodb',
        collections: [],
      };

      const commands = generateMongoUpMigration(schema);
      expect(commands).toContain('Migration');
    });
  });

  describe('generateMongoDownMigration', () => {
    it('should generate drop commands', () => {
      const schema: DatabaseSchema = {
        name: 'test_db',
        database: 'mongodb',
        collections: [{ name: 'users', fields: [] }],
      };

      const commands = generateMongoDownMigration(schema);
      expect(commands).toContain('db.users.drop()');
    });

    it('should handle empty collections', () => {
      const schema: DatabaseSchema = {
        name: 'empty',
        database: 'mongodb',
        collections: [],
      };

      const commands = generateMongoDownMigration(schema);
      expect(commands).toContain('Rollback');
    });
  });

  describe('topologicalSort', () => {
    it('should sort tables respecting foreign key dependencies', () => {
      const tables: SQLTable[] = [
        {
          name: 'orders',
          columns: [{ name: 'user_id', type: 'INTEGER' }],
          foreignKeys: [{ column: 'user_id', referencedTable: 'users', referencedColumn: 'id' }],
        },
        {
          name: 'users',
          columns: [{ name: 'id', type: 'INTEGER' }],
        },
      ];

      const sorted = topologicalSort(tables);
      const userIndex = sorted.findIndex(t => t.name === 'users');
      const orderIndex = sorted.findIndex(t => t.name === 'orders');
      expect(userIndex).toBeLessThan(orderIndex);
    });

    it('should handle circular dependencies gracefully', () => {
      const tables: SQLTable[] = [
        {
          name: 'a',
          columns: [],
          foreignKeys: [{ column: 'b_id', referencedTable: 'b', referencedColumn: 'id' }],
        },
        {
          name: 'b',
          columns: [],
          foreignKeys: [{ column: 'a_id', referencedTable: 'a', referencedColumn: 'id' }],
        },
      ];

      // Should not throw
      const sorted = topologicalSort(tables);
      expect(sorted.length).toBe(2);
    });

    it('should handle tables without foreign keys', () => {
      const tables: SQLTable[] = [
        { name: 'users', columns: [] },
        { name: 'products', columns: [] },
      ];

      const sorted = topologicalSort(tables);
      expect(sorted.length).toBe(2);
    });

    it('should handle empty array', () => {
      const sorted = topologicalSort([]);
      expect(sorted).toEqual([]);
    });
  });
});

describe('Seed Generator', () => {
  describe('generateSQLRecords', () => {
    it('should generate specified number of records', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', autoIncrement: true },
          { name: 'name', type: 'VARCHAR' },
        ],
      };

      const records = generateSQLRecords(table, 5);
      expect(records.length).toBe(5);
    });

    it('should skip auto-increment columns', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', autoIncrement: true },
          { name: 'name', type: 'VARCHAR' },
        ],
      };

      const records = generateSQLRecords(table, 1);
      expect(records[0]).not.toHaveProperty('id');
      expect(records[0]).toHaveProperty('name');
    });

    it('should skip uuid default columns', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'id', type: 'UUID', defaultValue: 'gen_random_uuid()' },
          { name: 'name', type: 'VARCHAR' },
        ],
      };

      const records = generateSQLRecords(table, 1);
      expect(records[0]).not.toHaveProperty('id');
    });

    it('should skip timestamp default columns', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP' },
          { name: 'name', type: 'VARCHAR' },
        ],
      };

      const records = generateSQLRecords(table, 1);
      expect(records[0]).not.toHaveProperty('created_at');
    });
  });

  describe('generateMongoRecords', () => {
    it('should generate specified number of records', () => {
      const collection: MongoCollection = {
        name: 'users',
        fields: [
          { name: '_id', type: 'ObjectId' },
          { name: 'name', type: 'String' },
        ],
      };

      const records = generateMongoRecords(collection, 3);
      expect(records.length).toBe(3);
    });

    it('should skip _id field', () => {
      const collection: MongoCollection = {
        name: 'users',
        fields: [
          { name: '_id', type: 'ObjectId' },
          { name: 'name', type: 'String' },
        ],
      };

      const records = generateMongoRecords(collection, 1);
      expect(records[0]).not.toHaveProperty('_id');
    });

    it('should skip Date.now default fields', () => {
      const collection: MongoCollection = {
        name: 'users',
        fields: [
          { name: 'createdAt', type: 'Date', default: 'Date.now' },
          { name: 'name', type: 'String' },
        ],
      };

      const records = generateMongoRecords(collection, 1);
      expect(records[0]).not.toHaveProperty('createdAt');
    });
  });

  describe('generateMockValue', () => {
    it('should generate email for email fields', () => {
      const value = generateMockValue('email', 'VARCHAR', 0);
      expect(value).toContain('@example.com');
    });

    it('should generate name for name fields', () => {
      const value = generateMockValue('first_name', 'VARCHAR', 0);
      expect(value).toContain('name');
    });

    it('should generate hashed password for password fields', () => {
      const value = generateMockValue('password', 'VARCHAR', 0);
      expect(value).toContain('$2b$10$hashedpassword');
    });

    it('should generate price for price fields', () => {
      const value = generateMockValue('price', 'DECIMAL', 0);
      expect(parseFloat(value)).toBeGreaterThanOrEqual(0);
    });

    it('should generate quantity for stock fields', () => {
      const value = generateMockValue('stock_count', 'INTEGER', 0);
      expect(typeof value).toBe('number');
    });

    it('should generate description for description fields', () => {
      const value = generateMockValue('description', 'TEXT', 5);
      expect(value).toContain('description');
      expect(value).toContain('5');
    });

    it('should generate integers for INT types', () => {
      const value = generateMockValue('count', 'INTEGER', 5);
      expect(typeof value).toBe('number');
    });

    it('should generate booleans for BOOL types', () => {
      const value = generateMockValue('active', 'BOOLEAN', 0);
      expect(typeof value).toBe('boolean');
    });

    it('should generate strings for VARCHAR types', () => {
      const value = generateMockValue('field', 'VARCHAR', 0);
      expect(typeof value).toBe('string');
    });

    it('should generate decimals for DECIMAL types', () => {
      const value = generateMockValue('amount', 'DECIMAL', 5);
      expect(value).toContain('.');
    });

    it('should generate default mock value for unknown types', () => {
      const value = generateMockValue('unknown', 'CUSTOM', 3);
      expect(value).toBe('mock_3');
    });
  });
});

describe('Diagram Generator', () => {
  describe('generateMermaidDiagram', () => {
    it('should generate erDiagram header', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [{ name: 'users', columns: [] }],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: false,
        includeRelationships: false,
      });
      expect(diagram).toContain('erDiagram');
    });

    it('should include entity definitions', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [{ name: 'users', columns: [{ name: 'id', type: 'INTEGER' }] }],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: true,
        includeRelationships: false,
      });
      expect(diagram).toContain('users');
      expect(diagram).toContain('INTEGER id');
    });

    it('should include relationships when requested', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          { name: 'users', columns: [] },
          { name: 'orders', columns: [] },
        ],
        relationships: [
          {
            name: 'user_orders',
            type: 'ONE_TO_MANY',
            from: { table: 'users', column: 'id' },
            to: { table: 'orders', column: 'user_id' },
          },
        ],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: false,
        includeRelationships: true,
      });
      expect(diagram).toContain('users');
      expect(diagram).toContain('orders');
      expect(diagram).toContain('user_orders');
    });

    it('should handle MongoDB collections', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'mongodb',
        collections: [{ name: 'users', fields: [{ name: 'email', type: 'String' }] }],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: true,
        includeRelationships: false,
      });
      expect(diagram).toContain('users');
    });

    it('should handle ONE_TO_ONE relationship cardinality', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          { name: 'users', columns: [] },
          { name: 'profiles', columns: [] },
        ],
        relationships: [
          {
            name: 'user_profile',
            type: 'ONE_TO_ONE',
            from: { table: 'users', column: 'id' },
            to: { table: 'profiles', column: 'user_id' },
          },
        ],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: false,
        includeRelationships: true,
      });
      expect(diagram).toContain('||--||');
    });

    it('should handle MANY_TO_MANY relationship cardinality', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          { name: 'users', columns: [] },
          { name: 'roles', columns: [] },
        ],
        relationships: [
          {
            name: 'user_roles',
            type: 'MANY_TO_MANY',
            from: { table: 'users', column: 'id' },
            to: { table: 'roles', column: 'id' },
          },
        ],
      };

      const diagram = generateMermaidDiagram(schema, {
        format: 'mermaid',
        includeColumns: false,
        includeRelationships: true,
      });
      expect(diagram).toContain('}o--o{');
    });
  });

  describe('generateDBMLDiagram', () => {
    it('should generate Table definitions', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          {
            name: 'users',
            columns: [
              { name: 'id', type: 'INTEGER', primaryKey: true },
              { name: 'email', type: 'VARCHAR', unique: true },
              { name: 'name', type: 'VARCHAR', nullable: false },
            ],
          },
        ],
      };

      const dbml = generateDBMLDiagram(schema, { format: 'dbml' });
      expect(dbml).toContain('Table users');
      expect(dbml).toContain('[pk]');
      expect(dbml).toContain('[unique]');
      expect(dbml).toContain('[not null]');
    });

    it('should include foreign key references', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          {
            name: 'orders',
            columns: [{ name: 'user_id', type: 'INTEGER' }],
            foreignKeys: [{ column: 'user_id', referencedTable: 'users', referencedColumn: 'id' }],
          },
        ],
      };

      const dbml = generateDBMLDiagram(schema, { format: 'dbml' });
      expect(dbml).toContain('Ref: orders.user_id > users.id');
    });

    it('should handle empty tables', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [],
      };

      const dbml = generateDBMLDiagram(schema, { format: 'dbml' });
      expect(dbml).toBe('');
    });
  });

  describe('generatePlantUMLDiagram', () => {
    it('should generate proper PlantUML structure', () => {
      const schema: DatabaseSchema = {
        name: 'test',
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

      const uml = generatePlantUMLDiagram(schema, { format: 'plantuml' });
      expect(uml).toContain('@startuml');
      expect(uml).toContain('@enduml');
      expect(uml).toContain('entity users');
      expect(uml).toContain('<<PK>>');
    });

    it('should include relationships', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'postgres',
        tables: [
          { name: 'users', columns: [] },
          { name: 'orders', columns: [] },
        ],
        relationships: [
          {
            name: 'user_orders',
            type: 'ONE_TO_MANY',
            from: { table: 'users', column: 'id' },
            to: { table: 'orders', column: 'user_id' },
          },
        ],
      };

      const uml = generatePlantUMLDiagram(schema, { format: 'plantuml' });
      expect(uml).toContain('users');
      expect(uml).toContain('orders');
    });

    it('should handle MongoDB collections', () => {
      const schema: DatabaseSchema = {
        name: 'test',
        database: 'mongodb',
        collections: [{ name: 'users', fields: [{ name: 'email', type: 'String' }] }],
      };

      const uml = generatePlantUMLDiagram(schema, { format: 'plantuml' });
      expect(uml).toContain('entity users');
    });
  });
});
