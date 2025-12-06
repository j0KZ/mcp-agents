/**
 * Tests for schema-builder.ts
 */

import { describe, it, expect } from 'vitest';
import {
  buildSQLSchema,
  buildMongoSchema,
  extractEntities,
  extractRelationships,
} from '../src/builders/schema-builder.js';
import { Relationship } from '../src/types.js';

describe('buildSQLSchema', () => {
  const defaultOptions = {
    database: 'postgres' as const,
    useUUIDs: false,
    includeTimestamps: false,
    includeSoftDeletes: false,
    addIndexes: false,
  };

  it('should build schema with serial primary key', () => {
    const schema = buildSQLSchema(['user'], [], defaultOptions);
    expect(schema.tables).toHaveLength(1);
    expect(schema.tables![0].name).toBe('users');

    const idCol = schema.tables![0].columns.find(c => c.name === 'id');
    expect(idCol?.type).toBe('SERIAL');
    expect(idCol?.primaryKey).toBe(true);
    expect(idCol?.autoIncrement).toBe(true);
  });

  it('should build schema with UUID primary key', () => {
    const schema = buildSQLSchema(['user'], [], { ...defaultOptions, useUUIDs: true });

    const idCol = schema.tables![0].columns.find(c => c.name === 'id');
    expect(idCol?.type).toBe('UUID');
    expect(idCol?.defaultValue).toBe('gen_random_uuid()');
  });

  it('should use INTEGER for MySQL auto-increment', () => {
    const schema = buildSQLSchema(['user'], [], { ...defaultOptions, database: 'mysql' });

    const idCol = schema.tables![0].columns.find(c => c.name === 'id');
    expect(idCol?.type).toBe('INTEGER');
  });

  it('should add user-specific columns for user entities', () => {
    const schema = buildSQLSchema(['user'], [], defaultOptions);
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'email')).toBeDefined();
    expect(columns.find(c => c.name === 'name')).toBeDefined();
    expect(columns.find(c => c.name === 'password_hash')).toBeDefined();
  });

  it('should add customer-specific columns for customer entities', () => {
    const schema = buildSQLSchema(['customer'], [], defaultOptions);
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'email')).toBeDefined();
    expect(columns.find(c => c.name === 'password_hash')).toBeDefined();
  });

  it('should add product-specific columns for product entities', () => {
    const schema = buildSQLSchema(['product'], [], defaultOptions);
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'name')).toBeDefined();
    expect(columns.find(c => c.name === 'description')).toBeDefined();
    expect(columns.find(c => c.name === 'price')).toBeDefined();
    expect(columns.find(c => c.name === 'stock')).toBeDefined();
  });

  it('should add generic columns for other entities', () => {
    const schema = buildSQLSchema(['order'], [], defaultOptions);
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'name')).toBeDefined();
    expect(columns.length).toBeGreaterThanOrEqual(2); // id + name
  });

  it('should include timestamps when enabled', () => {
    const schema = buildSQLSchema(['user'], [], { ...defaultOptions, includeTimestamps: true });
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'created_at')).toBeDefined();
    expect(columns.find(c => c.name === 'updated_at')).toBeDefined();
  });

  it('should include soft deletes when enabled', () => {
    const schema = buildSQLSchema(['user'], [], { ...defaultOptions, includeSoftDeletes: true });
    const columns = schema.tables![0].columns;

    expect(columns.find(c => c.name === 'deleted_at')).toBeDefined();
  });

  it('should add indexes when enabled', () => {
    const schema = buildSQLSchema(['user'], [], { ...defaultOptions, addIndexes: true });

    expect(schema.tables![0].indexes).toBeDefined();
    expect(schema.tables![0].indexes!.length).toBeGreaterThan(0);
  });

  it('should include relationships in schema', () => {
    const relationships: Relationship[] = [
      {
        name: 'user_orders',
        type: 'ONE_TO_MANY',
        from: { table: 'users', column: 'id' },
        to: { table: 'orders', column: 'user_id' },
      },
    ];

    const schema = buildSQLSchema(['user', 'order'], relationships, defaultOptions);
    expect(schema.relationships).toEqual(relationships);
  });

  it('should include metadata in schema', () => {
    const schema = buildSQLSchema(['user'], [], defaultOptions);

    expect(schema.metadata).toBeDefined();
    expect(schema.metadata!.createdAt).toBeDefined();
    expect(schema.metadata!.description).toBeDefined();
    expect(schema.version).toBe('1.0.0');
  });
});

describe('buildMongoSchema', () => {
  const defaultOptions = {
    database: 'mongodb' as const,
    useUUIDs: false,
    includeTimestamps: false,
    includeSoftDeletes: false,
    addIndexes: false,
  };

  it('should build schema with ObjectId', () => {
    const schema = buildMongoSchema(['user'], [], defaultOptions);
    expect(schema.collections).toHaveLength(1);
    expect(schema.collections![0].name).toBe('users');

    const idField = schema.collections![0].fields.find(f => f.name === '_id');
    expect(idField?.type).toBe('ObjectId');
  });

  it('should add user-specific fields for user entities', () => {
    const schema = buildMongoSchema(['user'], [], defaultOptions);
    const fields = schema.collections![0].fields;

    expect(fields.find(f => f.name === 'email')).toBeDefined();
    expect(fields.find(f => f.name === 'name')).toBeDefined();
    expect(fields.find(f => f.name === 'passwordHash')).toBeDefined();
  });

  it('should add customer-specific fields for customer entities', () => {
    const schema = buildMongoSchema(['customer'], [], defaultOptions);
    const fields = schema.collections![0].fields;

    expect(fields.find(f => f.name === 'email')).toBeDefined();
  });

  it('should add product-specific fields for product entities', () => {
    const schema = buildMongoSchema(['product'], [], defaultOptions);
    const fields = schema.collections![0].fields;

    expect(fields.find(f => f.name === 'name')).toBeDefined();
    expect(fields.find(f => f.name === 'description')).toBeDefined();
    expect(fields.find(f => f.name === 'price')).toBeDefined();
    expect(fields.find(f => f.name === 'stock')).toBeDefined();
  });

  it('should add generic fields for other entities', () => {
    const schema = buildMongoSchema(['category'], [], defaultOptions);
    const fields = schema.collections![0].fields;

    expect(fields.find(f => f.name === 'name')).toBeDefined();
  });

  it('should include timestamps when enabled', () => {
    const schema = buildMongoSchema(['user'], [], { ...defaultOptions, includeTimestamps: true });
    const fields = schema.collections![0].fields;

    expect(fields.find(f => f.name === 'createdAt')).toBeDefined();
    expect(fields.find(f => f.name === 'updatedAt')).toBeDefined();
  });

  it('should add indexes when enabled', () => {
    const schema = buildMongoSchema(['user'], [], { ...defaultOptions, addIndexes: true });

    expect(schema.collections![0].indexes).toBeDefined();
    expect(schema.collections![0].indexes!.length).toBeGreaterThan(0);
  });
});

describe('extractEntities', () => {
  it('should extract entities from "X have Y" patterns', () => {
    const entities = extractEntities('Users have orders. Products have reviews.');
    expect(entities).toContain('user');
    expect(entities).toContain('product');
  });

  it('should extract entities from "X has Y" patterns', () => {
    const entities = extractEntities('A user has a profile.');
    expect(entities).toContain('user');
  });

  it('should extract entities from "X contain Y" patterns', () => {
    const entities = extractEntities('Orders contain items.');
    expect(entities).toContain('order');
  });

  it('should extract entities from "X include Y" patterns', () => {
    const entities = extractEntities('Products include categories.');
    expect(entities).toContain('product');
  });

  it('should extract entities from "X store Y" patterns', () => {
    const entities = extractEntities('Warehouses store products.');
    expect(entities).toContain('warehouse');
  });

  it('should extract entities from "X and Y" patterns', () => {
    const entities = extractEntities('Users and orders are connected.');
    expect(entities).toContain('user');
    expect(entities).toContain('order');
  });

  it('should return default entity if no matches', () => {
    const entities = extractEntities('Nothing to extract here.');
    expect(entities).toContain('entity');
  });

  it('should skip very long lines', () => {
    const longLine = 'a'.repeat(2000) + ' have many things.';
    const entities = extractEntities(longLine);
    expect(entities).toContain('entity');
  });

  it('should not duplicate entities', () => {
    const entities = extractEntities('Users have orders. Users have profiles.');
    const userCount = entities.filter(e => e === 'user').length;
    expect(userCount).toBe(1);
  });
});

describe('extractRelationships', () => {
  it('should extract "have many" relationships', () => {
    const relationships = extractRelationships('Users have many orders.', ['user', 'order']);
    expect(relationships.length).toBe(1);
    expect(relationships[0].type).toBe('ONE_TO_MANY');
    expect(relationships[0].from.table).toBe('users');
    expect(relationships[0].to.table).toBe('orders');
  });

  it('should extract "belong to" relationships', () => {
    const relationships = extractRelationships('Orders belong to users.', ['user', 'order']);
    expect(relationships.length).toBe(1);
    expect(relationships[0].type).toBe('ONE_TO_MANY');
    expect(relationships[0].from.table).toBe('users');
  });

  it('should skip very long lines', () => {
    const longLine = 'a'.repeat(2000) + ' have many orders.';
    const relationships = extractRelationships(longLine, ['user', 'order']);
    expect(relationships.length).toBe(0);
  });

  it('should handle multiple relationships', () => {
    const requirements = 'Users have many orders. Users have many reviews.';
    const relationships = extractRelationships(requirements, ['user', 'order', 'review']);
    expect(relationships.length).toBe(2);
  });

  it('should return empty array if no matches', () => {
    const relationships = extractRelationships('No relationships here.', ['user', 'order']);
    expect(relationships).toEqual([]);
  });
});
