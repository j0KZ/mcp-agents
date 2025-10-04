/**
 * SQL Builder Helpers
 * Helper functions for building SQL DDL statements
 */
/**
 * Build SQL column definition string
 * @param col - Column specification
 * @param database - Database type (for dialect-specific syntax)
 * @returns SQL column definition
 */
export function buildColumnDefinition(col, database) {
    let def = `  ${col.name} ${col.type}`;
    if (col.length)
        def += `(${col.length})`;
    if (col.precision)
        def += `(${col.precision}${col.scale ? `,${col.scale}` : ''})`;
    if (col.primaryKey)
        def += ' PRIMARY KEY';
    if (col.autoIncrement && database === 'mysql')
        def += ' AUTO_INCREMENT';
    if (!col.nullable && !col.primaryKey)
        def += ' NOT NULL';
    if (col.unique && !col.primaryKey)
        def += ' UNIQUE';
    if (col.defaultValue !== undefined) {
        def += ` DEFAULT ${typeof col.defaultValue === 'string' ? `'${col.defaultValue}'` : col.defaultValue}`;
    }
    return def;
}
/**
 * Build CREATE INDEX statement
 * @param indexName - Name of the index
 * @param tableName - Name of the table
 * @param columns - Columns to index
 * @param unique - Whether index is unique
 * @returns SQL CREATE INDEX statement
 */
export function buildCreateIndexStatement(indexName, tableName, columns, unique = false) {
    const uniqueKeyword = unique ? 'UNIQUE ' : '';
    return `CREATE ${uniqueKeyword}INDEX ${indexName} ON ${tableName}(${columns.join(', ')});`;
}
//# sourceMappingURL=sql-builder.js.map