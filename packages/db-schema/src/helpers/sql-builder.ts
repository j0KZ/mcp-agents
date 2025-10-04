/**
 * SQL Builder Helpers
 * Helper functions for building SQL DDL statements with SQL injection prevention
 */

import { SQLColumn } from '../types.js';

/**
 * Escape SQL identifier (table name, column name, etc.)
 * Validates identifier contains only safe characters
 * @param identifier - SQL identifier to escape
 * @returns Validated identifier
 * @throws Error if identifier contains invalid characters
 */
function escapeIdentifier(identifier: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }
  return identifier;
}

/**
 * Escape string literal for SQL
 * Escapes single quotes by doubling them
 * @param value - String value to escape
 * @returns Escaped string value
 */
function escapeStringLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Build SQL column definition string with SQL injection prevention
 * @param col - Column specification
 * @param database - Database type (for dialect-specific syntax)
 * @returns SQL column definition
 * @throws Error if column name, type, or default value contains invalid characters
 */
export function buildColumnDefinition(col: SQLColumn, database: string): string {
  const safeName = escapeIdentifier(col.name);
  const safeType = escapeIdentifier(col.type);

  let def = `  ${safeName} ${safeType}`;

  if (col.length) def += `(${col.length})`;
  if (col.precision) def += `(${col.precision}${col.scale ? `,${col.scale}` : ''})`;
  if (col.primaryKey) def += ' PRIMARY KEY';
  if (col.autoIncrement && database === 'mysql') def += ' AUTO_INCREMENT';
  if (!col.nullable && !col.primaryKey) def += ' NOT NULL';
  if (col.unique && !col.primaryKey) def += ' UNIQUE';

  if (col.defaultValue !== undefined) {
    if (typeof col.defaultValue === 'string') {
      def += ` DEFAULT '${escapeStringLiteral(col.defaultValue)}'`;
    } else if (typeof col.defaultValue === 'number' || typeof col.defaultValue === 'boolean') {
      def += ` DEFAULT ${col.defaultValue}`;
    } else {
      throw new Error(`Invalid default value type: ${typeof col.defaultValue}`);
    }
  }

  return def;
}

/**
 * Build CREATE INDEX statement with SQL injection prevention
 * @param indexName - Name of the index
 * @param tableName - Name of the table
 * @param columns - Columns to index
 * @param unique - Whether index is unique
 * @returns SQL CREATE INDEX statement
 * @throws Error if indexName, tableName, or columns contain invalid characters
 * @throws Error if columns array is empty
 */
export function buildCreateIndexStatement(
  indexName: string,
  tableName: string,
  columns: string[],
  unique: boolean = false
): string {
  if (columns.length === 0) {
    throw new Error('columns array cannot be empty');
  }

  const safeIndexName = escapeIdentifier(indexName);
  const safeTableName = escapeIdentifier(tableName);
  const safeColumns = columns.map(col => escapeIdentifier(col)).join(', ');

  const uniqueKeyword = unique ? 'UNIQUE ' : '';
  return `CREATE ${uniqueKeyword}INDEX ${safeIndexName} ON ${safeTableName}(${safeColumns});`;
}
