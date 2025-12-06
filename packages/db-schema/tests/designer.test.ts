import { describe, it, expect } from 'vitest';
import * as target from '../src/designer.js';

describe('designSchema()', () => {
  it('should design schema from requirements', () => {
    const requirements = 'Users have many posts. Posts belong to users.';
    const options = { database: 'postgres' as const };
    const result = target.designSchema(requirements, options);
    expect(result).toBeDefined();
    expect(result.tables).toBeDefined();
  });

  it('should support MySQL database', () => {
    const requirements = 'Products have categories';
    const result = target.designSchema(requirements, { database: 'mysql' });
    expect(result.tables).toBeDefined();
  });

  it('should support MongoDB', () => {
    const requirements = 'Users have profiles';
    const result = target.designSchema(requirements, { database: 'mongodb' });
    expect(result.collections).toBeDefined();
  });
});

describe('generateMigration()', () => {
  it('should generate migration from schema', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [{ name: 'id', type: 'integer', primaryKey: true }],
        },
      ],
    };
    const result = target.generateMigration(schema, 'create initial schema');
    expect(result).toBeDefined();
    expect(result.up).toBeDefined();
    expect(result.down).toBeDefined();
  });
});

describe('createERDiagram()', () => {
  it('should create ER diagram', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [{ name: 'id', type: 'integer', primaryKey: true }],
        },
      ],
    };
    const result = target.createERDiagram(schema, {});
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should support different formats', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [{ name: 'test', columns: [] }],
    };
    const mermaid = target.createERDiagram(schema, { format: 'mermaid' });
    expect(typeof mermaid).toBe('string');
    expect(mermaid.length).toBeGreaterThan(0);
  });
});

describe('optimizeIndexes()', () => {
  it('should suggest index optimizations', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', primaryKey: true },
            { name: 'email', type: 'varchar' },
          ],
        },
      ],
    };
    const result = target.optimizeIndexes(schema);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('normalizeSchema()', () => {
  it('should suggest normalization improvements', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', primaryKey: true },
            { name: 'full_name', type: 'varchar' },
          ],
        },
      ],
    };
    const result = target.normalizeSchema(schema);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('generateSeedData()', () => {
  it('should generate seed data', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', primaryKey: true },
            { name: 'name', type: 'varchar' },
          ],
        },
      ],
    };
    const result = target.generateSeedData(schema, 5);
    expect(result).toBeDefined();
  });
});

describe('validateSchema()', () => {
  it('should validate schema', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [{ name: 'id', type: 'integer', primaryKey: true }],
        },
      ],
    };
    const result = target.validateSchema(schema);
    expect(result).toBeDefined();
    expect(result.valid).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.warnings).toBeDefined();
  });
});

describe('analyzeSchema()', () => {
  it('should analyze schema complexity as LOW for small schemas', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [{ name: 'id', type: 'integer', primaryKey: true }],
        },
      ],
    };
    const result = target.analyzeSchema(schema);
    expect(result).toBeDefined();
    expect(result.tableCount).toBeDefined();
    expect(result.columnCount).toBeDefined();
    expect(result.complexity).toBe('LOW');
  });

  it('should analyze schema complexity as HIGH for large schemas', () => {
    // Create schema with >20 tables to trigger HIGH complexity
    const tables = Array.from({ length: 25 }, (_, i) => ({
      name: `table_${i}`,
      columns: [{ name: 'id', type: 'integer', primaryKey: true }],
    }));

    const schema = {
      database: 'postgres' as const,
      tables,
      relationships: [],
    };

    const result = target.analyzeSchema(schema);
    expect(result.complexity).toBe('HIGH');
  });

  it('should analyze schema complexity as HIGH for many relationships', () => {
    const tables = [
      { name: 'users', columns: [{ name: 'id', type: 'integer' }] },
      { name: 'orders', columns: [{ name: 'id', type: 'integer' }] },
    ];

    // Create >30 relationships to trigger HIGH complexity
    const relationships = Array.from({ length: 35 }, (_, i) => ({
      name: `rel_${i}`,
      type: 'ONE_TO_MANY' as const,
      from: { table: 'users', column: 'id' },
      to: { table: 'orders', column: 'user_id' },
    }));

    const schema = {
      database: 'postgres' as const,
      tables,
      relationships,
    };

    const result = target.analyzeSchema(schema);
    expect(result.complexity).toBe('HIGH');
  });

  it('should analyze schema complexity as MEDIUM for medium schemas', () => {
    // Create schema with 10-20 tables to trigger MEDIUM complexity
    const tables = Array.from({ length: 12 }, (_, i) => ({
      name: `table_${i}`,
      columns: [{ name: 'id', type: 'integer', primaryKey: true }],
    }));

    const schema = {
      database: 'postgres' as const,
      tables,
      relationships: [],
    };

    const result = target.analyzeSchema(schema);
    expect(result.complexity).toBe('MEDIUM');
  });

  it('should analyze schema complexity as MEDIUM for medium relationships', () => {
    const tables = [{ name: 'users', columns: [{ name: 'id', type: 'integer' }] }];

    // Create 16-30 relationships to trigger MEDIUM complexity (>15 but <=30)
    const relationships = Array.from({ length: 20 }, (_, i) => ({
      name: `rel_${i}`,
      type: 'ONE_TO_MANY' as const,
      from: { table: 'users', column: 'id' },
      to: { table: 'orders', column: 'user_id' },
    }));

    const schema = {
      database: 'postgres' as const,
      tables,
      relationships,
    };

    const result = target.analyzeSchema(schema);
    expect(result.complexity).toBe('MEDIUM');
  });

  it('should include all analysis fields', () => {
    const schema = {
      database: 'postgres' as const,
      tables: [
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'integer', primaryKey: true },
            { name: 'name', type: 'varchar' },
          ],
          indexes: [{ name: 'idx_name', columns: ['name'] }],
        },
      ],
      relationships: [
        {
          name: 'user_orders',
          type: 'ONE_TO_MANY' as const,
          from: { table: 'users', column: 'id' },
          to: { table: 'orders', column: 'user_id' },
        },
      ],
    };

    const result = target.analyzeSchema(schema);
    expect(result.tableCount).toBe(1);
    expect(result.columnCount).toBe(2);
    expect(result.indexCount).toBe(1);
    expect(result.relationshipCount).toBe(1);
    expect(result.normalForm).toBeDefined();
    expect(result.estimatedSize).toBeDefined();
    expect(result.estimatedSize.rows).toBeDefined();
    expect(result.estimatedSize.storage).toBeDefined();
  });
});
