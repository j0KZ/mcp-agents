/**
 * SQL Builder Helpers
 * Helper functions for building SQL DDL statements with SQL injection prevention
 */
import { SQLColumn } from '../types.js';
/**
 * Build SQL column definition string with SQL injection prevention
 * @param col - Column specification
 * @param database - Database type (for dialect-specific syntax)
 * @returns SQL column definition
 * @throws Error if column name, type, or default value contains invalid characters
 */
export declare function buildColumnDefinition(col: SQLColumn, database: string): string;
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
export declare function buildCreateIndexStatement(indexName: string, tableName: string, columns: string[], unique?: boolean): string;
//# sourceMappingURL=sql-builder.d.ts.map