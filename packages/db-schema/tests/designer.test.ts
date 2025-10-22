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
  it('should analyze schema complexity', () => {
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
    expect(result.complexity).toBeDefined();
  });
});
