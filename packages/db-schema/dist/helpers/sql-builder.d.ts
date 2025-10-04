/**
 * SQL Builder Helpers
 * Helper functions for building SQL DDL statements
 */
import { SQLColumn } from '../types.js';
/**
 * Build SQL column definition string
 * @param col - Column specification
 * @param database - Database type (for dialect-specific syntax)
 * @returns SQL column definition
 */
export declare function buildColumnDefinition(col: SQLColumn, database: string): string;
/**
 * Build CREATE INDEX statement
 * @param indexName - Name of the index
 * @param tableName - Name of the table
 * @param columns - Columns to index
 * @param unique - Whether index is unique
 * @returns SQL CREATE INDEX statement
 */
export declare function buildCreateIndexStatement(indexName: string, tableName: string, columns: string[], unique?: boolean): string;
//# sourceMappingURL=sql-builder.d.ts.map