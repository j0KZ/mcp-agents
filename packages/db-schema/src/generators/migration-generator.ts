/**
 * Migration Generator Module
 * Generates SQL and MongoDB migration scripts
 */

import { DatabaseSchema, SQLTable } from '../types.js';
import { buildColumnDefinition, buildCreateIndexStatement } from '../helpers/sql-builder.js';

export function generateSQLUpMigration(schema: DatabaseSchema): string {
  let sql = `-- Migration: Create ${schema.name} schema\n\n`;

  for (const table of schema.tables || []) {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs = table.columns.map(col => buildColumnDefinition(col, schema.database));

    sql += columnDefs.join(',\n');
    sql += '\n);\n\n';

    // Create indexes
    for (const index of table.indexes || []) {
      sql += buildCreateIndexStatement(index.name, table.name, index.columns, index.unique) + '\n';
    }

    sql += '\n';
  }

  return sql;
}

export function generateSQLDownMigration(schema: DatabaseSchema): string {
  let sql = `-- Rollback: Drop ${schema.name} schema\n\n`;

  // Drop tables in reverse order
  const tables = [...(schema.tables || [])].reverse();
  for (const table of tables) {
    sql += `DROP TABLE IF EXISTS ${table.name};\n`;
  }

  return sql;
}

export function generateMongoUpMigration(schema: DatabaseSchema): string {
  let commands = `// Migration: Create ${schema.name} collections\n\n`;

  for (const collection of schema.collections || []) {
    commands += `db.createCollection('${collection.name}');\n`;

    // Create indexes
    for (const index of collection.indexes || []) {
      const keys = index.columns.reduce(
        (obj, col) => {
          obj[col] = 1;
          return obj;
        },
        {} as Record<string, number>
      );

      commands += `db.${collection.name}.createIndex(${JSON.stringify(keys)}, { name: '${index.name}' });\n`;
    }

    commands += '\n';
  }

  return commands;
}

export function generateMongoDownMigration(schema: DatabaseSchema): string {
  let commands = `// Rollback: Drop ${schema.name} collections\n\n`;

  for (const collection of schema.collections || []) {
    commands += `db.${collection.name}.drop();\n`;
  }

  return commands;
}

export function topologicalSort(tables: SQLTable[]): SQLTable[] {
  const sorted: SQLTable[] = [];
  const visited = new Set<string>();
  const temp = new Set<string>();

  function visit(table: SQLTable) {
    if (temp.has(table.name)) {
      // Circular dependency - just return
      return;
    }
    if (visited.has(table.name)) {
      return;
    }

    temp.add(table.name);

    // Visit all dependencies (tables referenced by foreign keys)
    for (const fk of table.foreignKeys || []) {
      const refTable = tables.find(t => t.name === fk.referencedTable);
      if (refTable) {
        visit(refTable);
      }
    }

    temp.delete(table.name);
    visited.add(table.name);
    sorted.push(table);
  }

  for (const table of tables) {
    if (!visited.has(table.name)) {
      visit(table);
    }
  }

  return sorted;
}
