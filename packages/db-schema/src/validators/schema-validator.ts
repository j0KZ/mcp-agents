/**
 * Schema Validator Module
 * Validates database schemas and estimates normalization levels
 */

import { DatabaseSchema, ValidationError, ValidationWarning } from '../types.js';
import { STRING_LIMITS } from '../constants/schema-limits.js';

export function validateSQLSchema(
  schema: DatabaseSchema,
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  for (const table of schema.tables || []) {
    // Check for primary key
    const hasPK = table.primaryKey || table.columns.some(c => c.primaryKey);
    if (!hasPK) {
      errors.push({
        type: 'MISSING_PRIMARY_KEY',
        table: table.name,
        message: `Table '${table.name}' does not have a primary key`,
        severity: 'ERROR',
      });
    }

    // Check for duplicate columns
    const columnNames = new Set<string>();
    for (const col of table.columns) {
      if (columnNames.has(col.name)) {
        errors.push({
          type: 'DUPLICATE_COLUMN',
          table: table.name,
          column: col.name,
          message: `Duplicate column '${col.name}' in table '${table.name}'`,
          severity: 'ERROR',
        });
      }
      columnNames.add(col.name);
    }

    // Check for missing timestamps
    const hasTimestamps = table.columns.some(
      c => c.name === 'created_at' || c.name === 'updated_at'
    );
    if (!hasTimestamps) {
      warnings.push({
        type: 'MISSING_TIMESTAMP',
        table: table.name,
        message: `Table '${table.name}' does not have timestamp columns`,
        suggestion: 'Add created_at and updated_at columns for audit trail',
      });
    }

    // Check for long VARCHAR without index
    for (const col of table.columns) {
      if (col.type === 'VARCHAR' && (col.length || 0) > STRING_LIMITS.LONG_VARCHAR_THRESHOLD) {
        warnings.push({
          type: 'LONG_VARCHAR',
          table: table.name,
          column: col.name,
          message: `Column '${col.name}' has VARCHAR length > ${STRING_LIMITS.LONG_VARCHAR_THRESHOLD}`,
          suggestion: 'Consider using TEXT type instead',
        });
      }
    }
  }
}

export function validateMongoSchema(
  schema: DatabaseSchema,
  _errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  for (const collection of schema.collections || []) {
    const hasId = collection.fields.some(f => f.name === '_id');
    if (!hasId) {
      warnings.push({
        type: 'MISSING_TIMESTAMP',
        table: collection.name,
        message: `Collection '${collection.name}' does not explicitly define _id`,
        suggestion: 'MongoDB auto-generates _id, but explicit definition is recommended',
      });
    }
  }
}

export function estimateNormalForm(
  schema: DatabaseSchema
): '1NF' | '2NF' | '3NF' | 'BCNF' | 'DENORMALIZED' {
  const tables = schema.tables || [];

  // Simple heuristic
  const hasArrays = tables.some(t => t.columns.some(c => c.type === 'ARRAY'));
  if (hasArrays) return '1NF'; // Array columns violate 1NF

  const hasJsonColumns = tables.some(t =>
    t.columns.some(c => c.type === 'JSON' || c.type === 'JSONB')
  );
  if (hasJsonColumns) return 'DENORMALIZED';

  const hasCompositePKs = tables.some(t => Array.isArray(t.primaryKey) && t.primaryKey.length > 1);
  if (hasCompositePKs) return '2NF';

  // If all tables have single-column PKs and relationships, assume at least 3NF
  return '3NF';
}
