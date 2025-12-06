/**
 * Tests for SQL Builder Helpers
 */

import { describe, it, expect } from 'vitest';
import { buildColumnDefinition, buildCreateIndexStatement } from '../src/helpers/sql-builder.js';

describe('SQL Builder Helpers', () => {
  describe('buildColumnDefinition', () => {
    it('should build basic column definition', () => {
      const col = { name: 'id', type: 'INTEGER' };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('id INTEGER');
    });

    it('should include length for VARCHAR columns', () => {
      const col = { name: 'name', type: 'VARCHAR', length: 100 };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('VARCHAR(100)');
    });

    it('should include precision for DECIMAL columns', () => {
      const col = { name: 'price', type: 'DECIMAL', precision: 10, scale: 2 };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('DECIMAL(10,2)');
    });

    it('should include precision without scale', () => {
      const col = { name: 'value', type: 'DECIMAL', precision: 10 };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('DECIMAL(10)');
    });

    it('should add PRIMARY KEY constraint', () => {
      const col = { name: 'id', type: 'INTEGER', primaryKey: true };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('PRIMARY KEY');
    });

    it('should add AUTO_INCREMENT for MySQL', () => {
      const col = { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true };
      const result = buildColumnDefinition(col, 'mysql');
      expect(result).toContain('AUTO_INCREMENT');
    });

    it('should not add AUTO_INCREMENT for non-MySQL databases', () => {
      const col = { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).not.toContain('AUTO_INCREMENT');
    });

    it('should add NOT NULL constraint', () => {
      const col = { name: 'name', type: 'VARCHAR', nullable: false };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('NOT NULL');
    });

    it('should not add NOT NULL for primary key columns', () => {
      const col = { name: 'id', type: 'INTEGER', primaryKey: true, nullable: false };
      const result = buildColumnDefinition(col, 'postgres');
      // PRIMARY KEY implies NOT NULL
      expect(result).toContain('PRIMARY KEY');
      // Should not have redundant NOT NULL when PK is set
      const parts = result.split(' ');
      const notNullCount = parts.filter((p, i) => p === 'NOT' && parts[i + 1] === 'NULL').length;
      expect(notNullCount).toBe(0);
    });

    it('should add UNIQUE constraint', () => {
      const col = { name: 'email', type: 'VARCHAR', unique: true };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('UNIQUE');
    });

    it('should not add UNIQUE for primary key columns', () => {
      const col = { name: 'id', type: 'INTEGER', primaryKey: true, unique: true };
      const result = buildColumnDefinition(col, 'postgres');
      // PRIMARY KEY implies UNIQUE
      const uniqueMatches = result.match(/UNIQUE/g);
      expect(uniqueMatches).toBeNull();
    });

    it('should add string default value', () => {
      const col = { name: 'status', type: 'VARCHAR', defaultValue: 'active' };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain("DEFAULT 'active'");
    });

    it('should escape single quotes in string default value', () => {
      const col = { name: 'description', type: 'VARCHAR', defaultValue: "it's" };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain("DEFAULT 'it''s'");
    });

    it('should add boolean default value (true)', () => {
      const col = { name: 'is_active', type: 'BOOLEAN', defaultValue: true };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('DEFAULT 1');
    });

    it('should add boolean default value (false)', () => {
      const col = { name: 'is_active', type: 'BOOLEAN', defaultValue: false };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('DEFAULT 0');
    });

    it('should add number default value', () => {
      const col = { name: 'count', type: 'INTEGER', defaultValue: 0 };
      const result = buildColumnDefinition(col, 'postgres');
      expect(result).toContain('DEFAULT 0');
    });

    it('should throw error for invalid default value type', () => {
      const col = { name: 'data', type: 'JSON', defaultValue: {} as any };
      expect(() => buildColumnDefinition(col, 'postgres')).toThrow('Invalid default value type');
    });

    it('should throw error for invalid column name', () => {
      const col = { name: 'invalid-name', type: 'INTEGER' };
      expect(() => buildColumnDefinition(col, 'postgres')).toThrow('Invalid SQL identifier');
    });

    it('should throw error for SQL injection attempt in column name', () => {
      const col = { name: 'name; DROP TABLE users;--', type: 'INTEGER' };
      expect(() => buildColumnDefinition(col, 'postgres')).toThrow('Invalid SQL identifier');
    });

    it('should throw error for invalid column type', () => {
      const col = { name: 'data', type: 'INVALID-TYPE' };
      expect(() => buildColumnDefinition(col, 'postgres')).toThrow('Invalid SQL identifier');
    });
  });

  describe('buildCreateIndexStatement', () => {
    it('should build basic index statement', () => {
      const result = buildCreateIndexStatement('idx_users_email', 'users', ['email']);
      expect(result).toBe('CREATE INDEX idx_users_email ON users(email);');
    });

    it('should build unique index statement', () => {
      const result = buildCreateIndexStatement('idx_users_email', 'users', ['email'], true);
      expect(result).toBe('CREATE UNIQUE INDEX idx_users_email ON users(email);');
    });

    it('should build composite index statement', () => {
      const result = buildCreateIndexStatement('idx_users_name', 'users', [
        'first_name',
        'last_name',
      ]);
      expect(result).toBe('CREATE INDEX idx_users_name ON users(first_name, last_name);');
    });

    it('should throw error for empty columns array', () => {
      expect(() => buildCreateIndexStatement('idx_test', 'test', [])).toThrow(
        'columns array cannot be empty'
      );
    });

    it('should throw error for invalid index name', () => {
      expect(() => buildCreateIndexStatement('invalid-index', 'users', ['email'])).toThrow(
        'Invalid SQL identifier'
      );
    });

    it('should throw error for invalid table name', () => {
      expect(() => buildCreateIndexStatement('idx_test', 'invalid-table', ['email'])).toThrow(
        'Invalid SQL identifier'
      );
    });

    it('should throw error for invalid column name', () => {
      expect(() => buildCreateIndexStatement('idx_test', 'users', ['invalid-column'])).toThrow(
        'Invalid SQL identifier'
      );
    });

    it('should throw error for SQL injection in index name', () => {
      expect(() =>
        buildCreateIndexStatement('idx; DROP TABLE users;--', 'users', ['email'])
      ).toThrow('Invalid SQL identifier');
    });

    it('should throw error for SQL injection in table name', () => {
      expect(() =>
        buildCreateIndexStatement('idx_test', 'users; DROP TABLE users;--', ['email'])
      ).toThrow('Invalid SQL identifier');
    });

    it('should throw error for SQL injection in column name', () => {
      expect(() =>
        buildCreateIndexStatement('idx_test', 'users', ['email; DROP TABLE users;--'])
      ).toThrow('Invalid SQL identifier');
    });
  });
});
