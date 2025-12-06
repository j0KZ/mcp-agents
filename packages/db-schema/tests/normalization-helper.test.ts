/**
 * Tests for normalization-helper.ts
 */

import { describe, it, expect } from 'vitest';
import {
  detectRepeatingGroups,
  detectPartialDependencies,
  detectTransitiveDependencies,
  detectRedundantData,
  detectMissingJunctionTables,
} from '../src/helpers/normalization-helper.js';
import { SQLTable, Relationship } from '../src/types.js';

describe('detectRepeatingGroups (1NF)', () => {
  it('should detect ARRAY type columns', () => {
    const table: SQLTable = {
      name: 'products',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'tags', type: 'ARRAY' },
      ],
    };

    const suggestions = detectRepeatingGroups(table);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe('EXTRACT_TABLE');
    expect(suggestions[0].normalForm).toBe('1NF');
    expect(suggestions[0].description).toContain('tags');
  });

  it('should detect _list columns', () => {
    const table: SQLTable = {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'phone_list', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectRepeatingGroups(table);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].description).toContain('phone_list');
  });

  it('should return empty array for normalized tables', () => {
    const table: SQLTable = {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'name', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectRepeatingGroups(table);
    expect(suggestions).toEqual([]);
  });

  it('should detect multiple repeating groups', () => {
    const table: SQLTable = {
      name: 'orders',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'items', type: 'ARRAY' },
        { name: 'address_list', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectRepeatingGroups(table);
    expect(suggestions.length).toBe(2);
  });
});

describe('detectPartialDependencies (2NF)', () => {
  it('should detect composite primary key with non-key columns', () => {
    const table: SQLTable = {
      name: 'order_items',
      columns: [
        { name: 'order_id', type: 'INTEGER' },
        { name: 'product_id', type: 'INTEGER' },
        { name: 'quantity', type: 'INTEGER' },
        { name: 'price', type: 'DECIMAL' },
        { name: 'discount', type: 'DECIMAL' },
      ],
      primaryKey: ['order_id', 'product_id'],
    };

    const suggestions = detectPartialDependencies(table);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe('EXTRACT_TABLE');
    expect(suggestions[0].normalForm).toBe('2NF');
  });

  it('should not flag tables with single primary key', () => {
    const table: SQLTable = {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'name', type: 'VARCHAR' },
        { name: 'email', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectPartialDependencies(table);
    expect(suggestions).toEqual([]);
  });

  it('should not flag composite key with few non-key columns', () => {
    const table: SQLTable = {
      name: 'user_roles',
      columns: [
        { name: 'user_id', type: 'INTEGER' },
        { name: 'role_id', type: 'INTEGER' },
      ],
      primaryKey: ['user_id', 'role_id'],
    };

    const suggestions = detectPartialDependencies(table);
    expect(suggestions).toEqual([]);
  });

  it('should handle undefined primaryKey', () => {
    const table: SQLTable = {
      name: 'test',
      columns: [{ name: 'col', type: 'VARCHAR' }],
    };

    const suggestions = detectPartialDependencies(table);
    expect(suggestions).toEqual([]);
  });
});

describe('detectTransitiveDependencies (3NF)', () => {
  it('should detect address columns pattern', () => {
    const table: SQLTable = {
      name: 'customers',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'city', type: 'VARCHAR' },
        { name: 'state', type: 'VARCHAR' },
        { name: 'country', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectTransitiveDependencies(table);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe('EXTRACT_TABLE');
    expect(suggestions[0].normalForm).toBe('3NF');
    expect(suggestions[0].proposedChanges).toContain('addresses');
  });

  it('should not flag tables without address columns', () => {
    const table: SQLTable = {
      name: 'products',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'name', type: 'VARCHAR' },
        { name: 'price', type: 'DECIMAL' },
      ],
    };

    const suggestions = detectTransitiveDependencies(table);
    expect(suggestions).toEqual([]);
  });

  it('should only flag when minimum address columns exist', () => {
    const table: SQLTable = {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'city', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectTransitiveDependencies(table);
    expect(suggestions).toEqual([]);
  });
});

describe('detectRedundantData', () => {
  it('should detect JSON columns', () => {
    const table: SQLTable = {
      name: 'products',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'metadata', type: 'JSON' },
      ],
    };

    const suggestions = detectRedundantData(table);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe('REMOVE_REDUNDANCY');
    expect(suggestions[0].normalForm).toBe('3NF');
  });

  it('should detect JSONB columns', () => {
    const table: SQLTable = {
      name: 'products',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'settings', type: 'JSONB' },
      ],
    };

    const suggestions = detectRedundantData(table);
    expect(suggestions.length).toBe(1);
  });

  it('should not flag tables without JSON columns', () => {
    const table: SQLTable = {
      name: 'users',
      columns: [
        { name: 'id', type: 'INTEGER', primaryKey: true },
        { name: 'name', type: 'VARCHAR' },
      ],
    };

    const suggestions = detectRedundantData(table);
    expect(suggestions).toEqual([]);
  });
});

describe('detectMissingJunctionTables', () => {
  it('should detect many-to-many without junction table', () => {
    const relationships: Relationship[] = [
      {
        name: 'users_roles',
        type: 'MANY_TO_MANY',
        from: { table: 'users', column: 'id' },
        to: { table: 'roles', column: 'id' },
      },
    ];

    const suggestions = detectMissingJunctionTables(relationships);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].type).toBe('ADD_JUNCTION');
    expect(suggestions[0].affectedTables).toContain('users');
    expect(suggestions[0].affectedTables).toContain('roles');
    expect(suggestions[0].proposedChanges).toContain('users_roles');
  });

  it('should not flag many-to-many with junction table', () => {
    const relationships: Relationship[] = [
      {
        name: 'users_roles',
        type: 'MANY_TO_MANY',
        from: { table: 'users', column: 'id' },
        to: { table: 'roles', column: 'id' },
        junctionTable: 'user_roles',
      },
    ];

    const suggestions = detectMissingJunctionTables(relationships);
    expect(suggestions).toEqual([]);
  });

  it('should ignore other relationship types', () => {
    const relationships: Relationship[] = [
      {
        name: 'user_profile',
        type: 'ONE_TO_ONE',
        from: { table: 'users', column: 'id' },
        to: { table: 'profiles', column: 'user_id' },
      },
      {
        name: 'user_orders',
        type: 'ONE_TO_MANY',
        from: { table: 'users', column: 'id' },
        to: { table: 'orders', column: 'user_id' },
      },
    ];

    const suggestions = detectMissingJunctionTables(relationships);
    expect(suggestions).toEqual([]);
  });

  it('should handle empty relationships array', () => {
    const suggestions = detectMissingJunctionTables([]);
    expect(suggestions).toEqual([]);
  });

  it('should detect multiple missing junction tables', () => {
    const relationships: Relationship[] = [
      {
        name: 'users_roles',
        type: 'MANY_TO_MANY',
        from: { table: 'users', column: 'id' },
        to: { table: 'roles', column: 'id' },
      },
      {
        name: 'products_categories',
        type: 'MANY_TO_MANY',
        from: { table: 'products', column: 'id' },
        to: { table: 'categories', column: 'id' },
      },
    ];

    const suggestions = detectMissingJunctionTables(relationships);
    expect(suggestions.length).toBe(2);
  });
});
