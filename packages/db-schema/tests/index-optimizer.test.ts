/**
 * Tests for Index Optimization Helpers
 */

import { describe, it, expect } from 'vitest';
import {
  suggestForeignKeyIndexes,
  suggestFilterColumnIndexes,
  suggestJsonbIndexes,
  suggestTextSearchIndexes,
  suggestCompoundIndexes,
} from '../src/helpers/index-optimizer.js';
import { SQLTable } from '../src/types.js';

describe('Index Optimization Helpers', () => {
  describe('suggestForeignKeyIndexes', () => {
    it('should suggest index for unindexed foreign key columns', () => {
      const table: SQLTable = {
        name: 'posts',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'user_id', type: 'INTEGER' },
        ],
        foreignKeys: [{ column: 'user_id', references: { table: 'users', column: 'id' } }],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestForeignKeyIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('user_id');
      expect(suggestions[0].reason).toContain('Foreign key');
    });

    it('should not suggest index for already indexed foreign key', () => {
      const table: SQLTable = {
        name: 'posts',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'user_id', type: 'INTEGER' },
        ],
        foreignKeys: [{ column: 'user_id', references: { table: 'users', column: 'id' } }],
      };
      const indexedColumns = new Set<string>(['user_id']);

      const suggestions = suggestForeignKeyIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });

    it('should handle tables without foreign keys', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [{ name: 'id', type: 'INTEGER', primaryKey: true }],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestForeignKeyIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('suggestFilterColumnIndexes', () => {
    it('should suggest index for status columns', () => {
      const table: SQLTable = {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'order_status', type: 'VARCHAR' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestFilterColumnIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('order_status');
    });

    it('should suggest index for type columns', () => {
      const table: SQLTable = {
        name: 'items',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'item_type', type: 'VARCHAR' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestFilterColumnIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('item_type');
    });

    it('should suggest index for category columns', () => {
      const table: SQLTable = {
        name: 'products',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'category_id', type: 'INTEGER' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestFilterColumnIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('category_id');
    });

    it('should not suggest for already indexed columns', () => {
      const table: SQLTable = {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'order_status', type: 'VARCHAR' },
        ],
      };
      const indexedColumns = new Set<string>(['order_status']);

      const suggestions = suggestFilterColumnIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest for unrelated columns', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'email', type: 'VARCHAR' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestFilterColumnIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('suggestJsonbIndexes', () => {
    it('should suggest GIN index for JSONB columns', () => {
      const table: SQLTable = {
        name: 'events',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'metadata', type: 'JSONB' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestJsonbIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('metadata');
      expect(suggestions[0].type).toBe('GIN');
    });

    it('should not suggest for already indexed JSONB columns', () => {
      const table: SQLTable = {
        name: 'events',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'metadata', type: 'JSONB' },
        ],
      };
      const indexedColumns = new Set<string>(['metadata']);

      const suggestions = suggestJsonbIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest for non-JSONB columns', () => {
      const table: SQLTable = {
        name: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'data', type: 'JSON' }, // JSON, not JSONB
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestJsonbIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('suggestTextSearchIndexes', () => {
    it('should suggest GIN index for description TEXT columns', () => {
      const table: SQLTable = {
        name: 'products',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'description', type: 'TEXT' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestTextSearchIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('description');
      expect(suggestions[0].type).toBe('GIN');
    });

    it('should not suggest for already indexed text columns', () => {
      const table: SQLTable = {
        name: 'products',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'description', type: 'TEXT' },
        ],
      };
      const indexedColumns = new Set<string>(['description']);

      const suggestions = suggestTextSearchIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest for non-description TEXT columns', () => {
      const table: SQLTable = {
        name: 'comments',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'content', type: 'TEXT' },
        ],
      };
      const indexedColumns = new Set<string>();

      const suggestions = suggestTextSearchIndexes(table, indexedColumns);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe('suggestCompoundIndexes', () => {
    it('should suggest compound index on status and timestamp', () => {
      const table: SQLTable = {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'status', type: 'VARCHAR' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      };
      const existingIndexes: any[] = [];

      const suggestions = suggestCompoundIndexes(table, existingIndexes);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('status');
      expect(suggestions[0].columns).toContain('created_at');
    });

    it('should not suggest if compound index already exists', () => {
      const table: SQLTable = {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'status', type: 'VARCHAR' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      };
      const existingIndexes = [{ columns: ['status', 'created_at'] }];

      const suggestions = suggestCompoundIndexes(table, existingIndexes);

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest if no status column', () => {
      const table: SQLTable = {
        name: 'logs',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      };
      const existingIndexes: any[] = [];

      const suggestions = suggestCompoundIndexes(table, existingIndexes);

      expect(suggestions).toHaveLength(0);
    });

    it('should not suggest if no timestamp columns', () => {
      const table: SQLTable = {
        name: 'categories',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'status', type: 'VARCHAR' },
        ],
      };
      const existingIndexes: any[] = [];

      const suggestions = suggestCompoundIndexes(table, existingIndexes);

      expect(suggestions).toHaveLength(0);
    });

    it('should use updated_at if no created_at', () => {
      const table: SQLTable = {
        name: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primaryKey: true },
          { name: 'status', type: 'VARCHAR' },
          { name: 'updated_at', type: 'TIMESTAMP' },
        ],
      };
      const existingIndexes: any[] = [];

      const suggestions = suggestCompoundIndexes(table, existingIndexes);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].columns).toContain('updated_at');
    });
  });
});
