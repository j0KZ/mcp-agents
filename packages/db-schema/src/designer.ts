/**
 * Database Schema Designer - Core Logic
 * Provides comprehensive schema design, migration, and optimization capabilities
 */

import {
  DatabaseSchema,
  SchemaDesignOptions,
  Migration,
  IndexSuggestion,
  NormalizationSuggestion,
  SeedData,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ERDiagramOptions,
  SchemaAnalysis,
  SQLTable,
  MongoCollection,
} from './types.js';

// Import extracted modules
import {
  buildSQLSchema,
  buildMongoSchema,
  extractEntities,
  extractRelationships,
} from './builders/schema-builder.js';

import {
  generateSQLUpMigration,
  generateSQLDownMigration,
  generateMongoUpMigration,
  generateMongoDownMigration,
  topologicalSort,
} from './generators/migration-generator.js';

import {
  generateMermaidDiagram,
  generateDBMLDiagram,
  generatePlantUMLDiagram,
} from './generators/diagram-generator.js';

import {
  generateSQLRecords,
  generateMongoRecords,
} from './generators/seed-generator.js';

import {
  validateSQLSchema,
  validateMongoSchema,
  estimateNormalForm,
} from './validators/schema-validator.js';

/**
 * Design a database schema from requirements
 * @param requirements - Plain text description of data requirements
 * @param options - Schema design options
 * @returns Complete database schema
 */
export function designSchema(
  requirements: string,
  options: SchemaDesignOptions
): DatabaseSchema {
  const { database } = options;

  // Parse requirements and extract entities
  const entities = extractEntities(requirements);
  const relationships = extractRelationships(requirements, entities);

  // Build schema based on database type
  if (database === 'mongodb') {
    return buildMongoSchema(entities, relationships, options);
  } else {
    return buildSQLSchema(entities, relationships, options);
  }
}

/**
 * Generate migration files for schema changes
 * @param schema - Database schema
 * @param description - Migration description
 * @returns Migration object with up/down SQL
 */
export function generateMigration(
  schema: DatabaseSchema,
  description: string
): Migration {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const version = `V${timestamp}`;

  let upSQL = '';
  let downSQL = '';

  if (schema.database === 'mongodb') {
    // MongoDB migrations (using mongosh commands)
    upSQL = generateMongoUpMigration(schema);
    downSQL = generateMongoDownMigration(schema);
  } else {
    // SQL migrations
    upSQL = generateSQLUpMigration(schema);
    downSQL = generateSQLDownMigration(schema);
  }

  return {
    version,
    description,
    up: upSQL,
    down: downSQL,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create ER diagram in Mermaid format
 * @param schema - Database schema
 * @param options - Diagram options
 * @returns Mermaid diagram string
 */
export function createERDiagram(
  schema: DatabaseSchema,
  options: ERDiagramOptions = { format: 'mermaid', includeColumns: true, includeRelationships: true }
): string {
  if (options.format === 'mermaid') {
    return generateMermaidDiagram(schema, options);
  } else if (options.format === 'dbml') {
    return generateDBMLDiagram(schema, options);
  } else {
    return generatePlantUMLDiagram(schema, options);
  }
}

/**
 * Suggest index optimizations
 * @param schema - Database schema
 * @returns Array of index suggestions
 */
export function optimizeIndexes(schema: DatabaseSchema): IndexSuggestion[] {
  const suggestions: IndexSuggestion[] = [];
  const tables = schema.tables || [];

  for (const table of tables) {
    // Check for foreign keys without indexes
    const foreignKeys = table.foreignKeys || [];
    const existingIndexes = table.indexes || [];
    const indexedColumns = new Set(existingIndexes.flatMap(idx => idx.columns));

    for (const fk of foreignKeys) {
      if (!indexedColumns.has(fk.column)) {
        suggestions.push({
          table: table.name,
          columns: [fk.column],
          type: 'BTREE',
          reason: `Foreign key column '${fk.column}' should be indexed to improve JOIN performance`,
          estimatedImpact: 'HIGH',
          priority: 1,
        });
      }
    }

    // Check for commonly filtered columns
    for (const column of table.columns) {
      if (
        (column.name.includes('status') ||
         column.name.includes('type') ||
         column.name.includes('category')) &&
        !indexedColumns.has(column.name)
      ) {
        suggestions.push({
          table: table.name,
          columns: [column.name],
          type: 'BTREE',
          reason: `Commonly filtered column '${column.name}' should be indexed`,
          estimatedImpact: 'MEDIUM',
          priority: 2,
        });
      }

      // Suggest JSONB GIN indexes
      if (column.type === 'JSONB' && !indexedColumns.has(column.name)) {
        suggestions.push({
          table: table.name,
          columns: [column.name],
          type: 'GIN',
          reason: `JSONB column '${column.name}' should have a GIN index for efficient queries`,
          estimatedImpact: 'HIGH',
          priority: 1,
        });
      }

      // Suggest text search indexes
      if (column.type === 'TEXT' && column.name.includes('description')) {
        suggestions.push({
          table: table.name,
          columns: [column.name],
          type: 'GIN',
          reason: `Text column '${column.name}' may benefit from full-text search index`,
          estimatedImpact: 'MEDIUM',
          priority: 3,
        });
      }
    }

    // Suggest compound indexes for common query patterns
    const timestampColumns = table.columns.filter(c => c.name === 'created_at' || c.name === 'updated_at');
    const statusColumn = table.columns.find(c => c.name === 'status');

    if (statusColumn && timestampColumns.length > 0) {
      const compoundCols = [statusColumn.name, timestampColumns[0].name];
      const hasCompoundIndex = existingIndexes.some(idx =>
        idx.columns.length > 1 && idx.columns.includes(statusColumn.name)
      );

      if (!hasCompoundIndex) {
        suggestions.push({
          table: table.name,
          columns: compoundCols,
          type: 'BTREE',
          reason: `Compound index on status and timestamp for efficient filtering and sorting`,
          estimatedImpact: 'HIGH',
          priority: 1,
        });
      }
    }
  }

  return suggestions.sort((a, b) => a.priority - b.priority);
}

/**
 * Suggest schema normalizations
 * @param schema - Database schema
 * @returns Array of normalization suggestions
 */
export function normalizeSchema(schema: DatabaseSchema): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];
  const tables = schema.tables || [];

  for (const table of tables) {
    // Check for repeating groups (1NF violation)
    const arrayColumns = table.columns.filter(c => c.type === 'ARRAY' || c.name.includes('_list'));
    for (const col of arrayColumns) {
      suggestions.push({
        type: 'EXTRACT_TABLE',
        description: `Column '${col.name}' in '${table.name}' contains repeating groups`,
        affectedTables: [table.name],
        proposedChanges: `Extract '${col.name}' into a separate table with a foreign key back to '${table.name}'`,
        normalForm: '1NF',
      });
    }

    // Check for partial dependencies (2NF violation)
    const compositePK = Array.isArray(table.primaryKey) && table.primaryKey.length > 1;
    if (compositePK) {
      const nonKeyColumns = table.columns.filter(c =>
        !table.primaryKey!.includes(c.name)
      );

      if (nonKeyColumns.length > 2) {
        suggestions.push({
          type: 'EXTRACT_TABLE',
          description: `Table '${table.name}' has composite primary key with potential partial dependencies`,
          affectedTables: [table.name],
          proposedChanges: `Consider extracting columns that depend on only part of the composite key`,
          normalForm: '2NF',
        });
      }
    }

    // Check for transitive dependencies (3NF violation)
    const addressColumns = table.columns.filter(c =>
      c.name.includes('city') || c.name.includes('state') || c.name.includes('country')
    );
    if (addressColumns.length >= 2) {
      suggestions.push({
        type: 'EXTRACT_TABLE',
        description: `Table '${table.name}' has potential transitive dependencies in address columns`,
        affectedTables: [table.name],
        proposedChanges: `Extract address fields into a separate 'addresses' table`,
        normalForm: '3NF',
      });
    }

    // Check for redundant data
    const jsonColumns = table.columns.filter(c => c.type === 'JSON' || c.type === 'JSONB');
    if (jsonColumns.length > 0) {
      suggestions.push({
        type: 'REMOVE_REDUNDANCY',
        description: `Table '${table.name}' uses JSON columns which may contain redundant data`,
        affectedTables: [table.name],
        proposedChanges: `Consider normalizing JSON data into separate tables for better querying and integrity`,
        normalForm: '3NF',
      });
    }
  }

  // Check for missing junction tables in many-to-many relationships
  const manyToManyRels = (schema.relationships || []).filter(r => r.type === 'MANY_TO_MANY');
  for (const rel of manyToManyRels) {
    if (!rel.junctionTable) {
      suggestions.push({
        type: 'ADD_JUNCTION',
        description: `Many-to-many relationship '${rel.name}' needs a junction table`,
        affectedTables: [rel.from.table, rel.to.table],
        proposedChanges: `Create junction table '${rel.from.table}_${rel.to.table}' to properly model the relationship`,
        normalForm: '3NF',
      });
    }
  }

  return suggestions;
}

/**
 * Generate seed data for testing
 * @param schema - Database schema
 * @param recordsPerTable - Number of records to generate per table
 * @returns Array of seed data
 */
export function generateSeedData(
  schema: DatabaseSchema,
  recordsPerTable: number = 10
): SeedData[] {
  const seedData: SeedData[] = [];

  if (schema.database === 'mongodb') {
    const collections = schema.collections || [];
    for (const collection of collections) {
      seedData.push({
        table: collection.name,
        records: generateMongoRecords(collection, recordsPerTable),
        truncateFirst: true,
      });
    }
  } else {
    const tables = schema.tables || [];
    // Sort tables by dependencies (tables with no FKs first)
    const sortedTables = topologicalSort(tables);

    for (const table of sortedTables) {
      seedData.push({
        table: table.name,
        records: generateSQLRecords(table, recordsPerTable),
        truncateFirst: true,
      });
    }
  }

  return seedData;
}

/**
 * Validate schema for errors and best practices
 * @param schema - Database schema to validate
 * @returns Validation result with errors and warnings
 */
export function validateSchema(schema: DatabaseSchema): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (schema.database === 'mongodb') {
    validateMongoSchema(schema, errors, warnings);
  } else {
    validateSQLSchema(schema, errors, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Analyze schema complexity and characteristics
 * @param schema - Database schema
 * @returns Schema analysis
 */
export function analyzeSchema(schema: DatabaseSchema): SchemaAnalysis {
  const tables = schema.tables || schema.collections || [];
  const relationships = schema.relationships || [];

  const columnCount = tables.reduce((sum, t) => {
    return sum + ((t as SQLTable).columns?.length || (t as MongoCollection).fields?.length || 0);
  }, 0);

  const indexCount = tables.reduce((sum, t) => {
    return sum + (t.indexes?.length || 0);
  }, 0);

  // Estimate normal form
  const normalForm = estimateNormalForm(schema);

  // Estimate complexity
  const complexity =
    tables.length > 20 || relationships.length > 30 ? 'HIGH' :
    tables.length > 10 || relationships.length > 15 ? 'MEDIUM' : 'LOW';

  return {
    tableCount: tables.length,
    columnCount,
    indexCount,
    relationshipCount: relationships.length,
    normalForm,
    estimatedSize: {
      rows: tables.length * 1000, // Rough estimate
      storage: `${Math.ceil(tables.length * 0.5)}MB`,
    },
    complexity,
  };
}
