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
  SQLColumn,
  MongoField,
  Relationship,
} from './types.js';

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
  const { database, normalForm: _normalForm = '3NF', includeTimestamps: _includeTimestamps = true, includeSoftDeletes: _includeSoftDeletes = false, useUUIDs: _useUUIDs = false } = options;

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

// Helper functions

function extractEntities(requirements: string): string[] {
  // Simple entity extraction - look for capitalized nouns
  const entities = new Set<string>();

  // Common entity patterns
  const entityPatterns = [
    /\b(User|Customer|Order|Product|Category|Payment|Invoice|Item|Address|Review)s?\b/gi,
  ];

  for (const pattern of entityPatterns) {
    const matches = requirements.match(pattern);
    if (matches) {
      matches.forEach(m => entities.add(m.toLowerCase().replace(/s$/, '')));
    }
  }

  return Array.from(entities);
}

function extractRelationships(requirements: string, _entities: string[]): Relationship[] {
  const relationships: Relationship[] = [];

  // Simple relationship extraction
  const relationshipPatterns = [
    { pattern: /(\w+)\s+has\s+many\s+(\w+)/gi, type: 'ONE_TO_MANY' as const },
    { pattern: /(\w+)\s+belongs\s+to\s+(\w+)/gi, type: 'ONE_TO_ONE' as const },
  ];

  for (const { pattern, type } of relationshipPatterns) {
    let match;
    while ((match = pattern.exec(requirements)) !== null) {
      relationships.push({
        name: `${match[1]}_${match[2]}`,
        type,
        from: { table: match[1].toLowerCase(), column: 'id' },
        to: { table: match[2].toLowerCase(), column: `${match[1].toLowerCase()}_id` },
      });
    }
  }

  return relationships;
}

function buildSQLSchema(
  entities: string[],
  relationships: Relationship[],
  options: SchemaDesignOptions
): DatabaseSchema {
  const tables: SQLTable[] = [];

  for (const entity of entities) {
    const columns: SQLColumn[] = [];

    // Primary key
    if (options.useUUIDs) {
      columns.push({
        name: 'id',
        type: 'UUID',
        primaryKey: true,
        defaultValue: 'gen_random_uuid()',
      });
    } else {
      columns.push({
        name: 'id',
        type: options.database === 'postgres' ? 'SERIAL' : 'INTEGER',
        primaryKey: true,
        autoIncrement: true,
      });
    }

    // Common fields based on entity type
    if (entity.includes('user') || entity.includes('customer')) {
      columns.push(
        { name: 'email', type: 'VARCHAR', length: 255, unique: true, nullable: false },
        { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
        { name: 'password_hash', type: 'VARCHAR', length: 255, nullable: false }
      );
    } else if (entity.includes('product')) {
      columns.push(
        { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
        { name: 'description', type: 'TEXT' },
        { name: 'price', type: 'DECIMAL', precision: 10, scale: 2, nullable: false },
        { name: 'stock', type: 'INTEGER', defaultValue: 0 }
      );
    } else {
      columns.push(
        { name: 'name', type: 'VARCHAR', length: 255, nullable: false }
      );
    }

    // Timestamps
    if (options.includeTimestamps) {
      columns.push(
        { name: 'created_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', nullable: false },
        { name: 'updated_at', type: 'TIMESTAMP', defaultValue: 'CURRENT_TIMESTAMP', nullable: false }
      );
    }

    // Soft deletes
    if (options.includeSoftDeletes) {
      columns.push({ name: 'deleted_at', type: 'TIMESTAMP' });
    }

    tables.push({
      name: entity + 's',
      columns,
      primaryKey: 'id',
      indexes: options.addIndexes ? [
        { name: `idx_${entity}s_created_at`, columns: ['created_at'] }
      ] : [],
    });
  }

  return {
    database: options.database,
    name: 'generated_schema',
    version: '1.0.0',
    tables,
    relationships,
    metadata: {
      createdAt: new Date().toISOString(),
      description: 'Auto-generated database schema',
    },
  };
}

function buildMongoSchema(
  entities: string[],
  relationships: Relationship[],
  options: SchemaDesignOptions
): DatabaseSchema {
  const collections: MongoCollection[] = [];

  for (const entity of entities) {
    const fields: MongoField[] = [];

    // MongoDB uses _id by default
    fields.push({
      name: '_id',
      type: 'ObjectId',
      required: true,
    });

    // Common fields
    if (entity.includes('user') || entity.includes('customer')) {
      fields.push(
        { name: 'email', type: 'String', required: true, unique: true },
        { name: 'name', type: 'String', required: true },
        { name: 'passwordHash', type: 'String', required: true }
      );
    } else if (entity.includes('product')) {
      fields.push(
        { name: 'name', type: 'String', required: true },
        { name: 'description', type: 'String' },
        { name: 'price', type: 'Number', required: true },
        { name: 'stock', type: 'Number', default: 0 }
      );
    } else {
      fields.push({ name: 'name', type: 'String', required: true });
    }

    // Timestamps
    if (options.includeTimestamps) {
      fields.push(
        { name: 'createdAt', type: 'Date', default: 'Date.now' },
        { name: 'updatedAt', type: 'Date', default: 'Date.now' }
      );
    }

    collections.push({
      name: entity + 's',
      fields,
      indexes: options.addIndexes ? [
        { name: `idx_${entity}s_created`, columns: ['createdAt'] }
      ] : [],
    });
  }

  return {
    database: 'mongodb',
    name: 'generated_schema',
    version: '1.0.0',
    collections,
    relationships,
    metadata: {
      createdAt: new Date().toISOString(),
      description: 'Auto-generated MongoDB schema',
    },
  };
}

function generateSQLUpMigration(schema: DatabaseSchema): string {
  let sql = `-- Migration: Create ${schema.name} schema\n\n`;

  for (const table of schema.tables || []) {
    sql += `CREATE TABLE ${table.name} (\n`;

    const columnDefs = table.columns.map(col => {
      let def = `  ${col.name} ${col.type}`;

      if (col.length) def += `(${col.length})`;
      if (col.precision) def += `(${col.precision}${col.scale ? `,${col.scale}` : ''})`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.autoIncrement && schema.database === 'mysql') def += ' AUTO_INCREMENT';
      if (!col.nullable && !col.primaryKey) def += ' NOT NULL';
      if (col.unique && !col.primaryKey) def += ' UNIQUE';
      if (col.defaultValue !== undefined) {
        def += ` DEFAULT ${typeof col.defaultValue === 'string' ? `'${col.defaultValue}'` : col.defaultValue}`;
      }

      return def;
    });

    sql += columnDefs.join(',\n');
    sql += '\n);\n\n';

    // Create indexes
    for (const index of table.indexes || []) {
      const unique = index.unique ? 'UNIQUE ' : '';
      sql += `CREATE ${unique}INDEX ${index.name} ON ${table.name}(${index.columns.join(', ')});\n`;
    }

    sql += '\n';
  }

  return sql;
}

function generateSQLDownMigration(schema: DatabaseSchema): string {
  let sql = `-- Rollback: Drop ${schema.name} schema\n\n`;

  // Drop tables in reverse order
  const tables = [...(schema.tables || [])].reverse();
  for (const table of tables) {
    sql += `DROP TABLE IF EXISTS ${table.name};\n`;
  }

  return sql;
}

function generateMongoUpMigration(schema: DatabaseSchema): string {
  let commands = `// Migration: Create ${schema.name} collections\n\n`;

  for (const collection of schema.collections || []) {
    commands += `db.createCollection('${collection.name}');\n`;

    // Create indexes
    for (const index of collection.indexes || []) {
      const keys = index.columns.reduce((obj, col) => {
        obj[col] = 1;
        return obj;
      }, {} as Record<string, number>);

      commands += `db.${collection.name}.createIndex(${JSON.stringify(keys)}, { name: '${index.name}' });\n`;
    }

    commands += '\n';
  }

  return commands;
}

function generateMongoDownMigration(schema: DatabaseSchema): string {
  let commands = `// Rollback: Drop ${schema.name} collections\n\n`;

  for (const collection of schema.collections || []) {
    commands += `db.${collection.name}.drop();\n`;
  }

  return commands;
}

function generateMermaidDiagram(schema: DatabaseSchema, options: ERDiagramOptions): string {
  let diagram = 'erDiagram\n';

  const tables = schema.tables || schema.collections || [];

  // Define entities
  for (const table of tables) {
    const tableName = table.name;
    diagram += `  ${tableName} {\n`;

    if (options.includeColumns) {
      const columns = (table as SQLTable).columns || (table as MongoCollection).fields || [];
      for (const col of columns.slice(0, 10)) { // Limit to 10 columns
        const colName = col.name;
        const colType = 'type' in col ? col.type : '';
        diagram += `    ${colType} ${colName}\n`;
      }
    }

    diagram += `  }\n`;
  }

  // Add relationships
  if (options.includeRelationships) {
    for (const rel of schema.relationships || []) {
      const cardinality = rel.type === 'ONE_TO_ONE' ? '||--||' :
                         rel.type === 'ONE_TO_MANY' ? '||--o{' :
                         '}o--o{';
      diagram += `  ${rel.from.table} ${cardinality} ${rel.to.table} : "${rel.name}"\n`;
    }
  }

  return diagram;
}

function generateDBMLDiagram(schema: DatabaseSchema, _options: ERDiagramOptions): string {
  let dbml = '';

  for (const table of schema.tables || []) {
    dbml += `Table ${table.name} {\n`;

    for (const col of table.columns) {
      let line = `  ${col.name} ${col.type.toLowerCase()}`;
      if (col.primaryKey) line += ' [pk]';
      if (col.unique) line += ' [unique]';
      if (!col.nullable) line += ' [not null]';
      dbml += line + '\n';
    }

    dbml += '}\n\n';
  }

  // Add references
  for (const table of schema.tables || []) {
    for (const fk of table.foreignKeys || []) {
      dbml += `Ref: ${table.name}.${fk.column} > ${fk.referencedTable}.${fk.referencedColumn}\n`;
    }
  }

  return dbml;
}

function generatePlantUMLDiagram(schema: DatabaseSchema, _options: ERDiagramOptions): string {
  let uml = '@startuml\n';

  for (const table of schema.tables || schema.collections || []) {
    uml += `entity ${table.name} {\n`;

    const columns = (table as SQLTable).columns || (table as MongoCollection).fields || [];
    for (const col of columns) {
      const pk = 'primaryKey' in col && col.primaryKey ? ' <<PK>>' : '';
      const colType = 'type' in col ? col.type : '';
      uml += `  ${col.name} : ${colType}${pk}\n`;
    }

    uml += '}\n\n';
  }

  // Add relationships
  for (const rel of schema.relationships || []) {
    uml += `${rel.from.table} ${rel.type === 'ONE_TO_MANY' ? '||--o{' : '||--||'} ${rel.to.table}\n`;
  }

  uml += '@enduml\n';
  return uml;
}

function generateSQLRecords(table: SQLTable, count: number): Record<string, any>[] {
  const records: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, any> = {};

    for (const col of table.columns) {
      if (col.autoIncrement || col.defaultValue === 'gen_random_uuid()' || col.defaultValue === 'CURRENT_TIMESTAMP') {
        continue; // Skip auto-generated fields
      }

      record[col.name] = generateMockValue(col.name, col.type, i);
    }

    records.push(record);
  }

  return records;
}

function generateMongoRecords(collection: MongoCollection, count: number): Record<string, any>[] {
  const records: Record<string, any>[] = [];

  for (let i = 0; i < count; i++) {
    const record: Record<string, any> = {};

    for (const field of collection.fields) {
      if (field.name === '_id' || field.default === 'Date.now') {
        continue; // Skip auto-generated fields
      }

      record[field.name] = generateMockValue(field.name, field.type, i);
    }

    records.push(record);
  }

  return records;
}

function generateMockValue(name: string, type: string, index: number): any {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('email')) {
    return `user${index}@example.com`;
  }
  if (lowerName.includes('name')) {
    return `Test ${name} ${index}`;
  }
  if (lowerName.includes('password')) {
    return '$2b$10$hashedpassword' + index;
  }
  if (lowerName.includes('price') || lowerName.includes('amount')) {
    return (Math.random() * 1000).toFixed(2);
  }
  if (lowerName.includes('stock') || lowerName.includes('quantity')) {
    return Math.floor(Math.random() * 100);
  }
  if (lowerName.includes('description')) {
    return `This is a sample description for item ${index}`;
  }

  // Type-based defaults
  if (type.includes('INT') || type === 'Number') {
    return index + 1;
  }
  if (type.includes('BOOL') || type === 'Boolean') {
    return index % 2 === 0;
  }
  if (type.includes('CHAR') || type === 'String') {
    return `value_${index}`;
  }
  if (type === 'DECIMAL' || type === 'NUMERIC') {
    return (index * 10.5).toFixed(2);
  }

  return `mock_${index}`;
}

function topologicalSort(tables: SQLTable[]): SQLTable[] {
  const sorted: SQLTable[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(table: SQLTable) {
    if (visited.has(table.name)) return;
    if (visiting.has(table.name)) return; // Circular dependency

    visiting.add(table.name);

    // Visit dependencies first
    for (const fk of table.foreignKeys || []) {
      const depTable = tables.find(t => t.name === fk.referencedTable);
      if (depTable && depTable.name !== table.name) {
        visit(depTable);
      }
    }

    visiting.delete(table.name);
    visited.add(table.name);
    sorted.push(table);
  }

  for (const table of tables) {
    visit(table);
  }

  return sorted;
}

function validateSQLSchema(schema: DatabaseSchema, errors: ValidationError[], warnings: ValidationWarning[]) {
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
    const hasTimestamps = table.columns.some(c => c.name === 'created_at' || c.name === 'updated_at');
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
      if (col.type === 'VARCHAR' && (col.length || 0) > 500) {
        warnings.push({
          type: 'LONG_VARCHAR',
          table: table.name,
          column: col.name,
          message: `Column '${col.name}' has VARCHAR length > 500`,
          suggestion: 'Consider using TEXT type instead',
        });
      }
    }
  }
}

function validateMongoSchema(schema: DatabaseSchema, _errors: ValidationError[], warnings: ValidationWarning[]) {
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

function estimateNormalForm(schema: DatabaseSchema): '1NF' | '2NF' | '3NF' | 'BCNF' | 'DENORMALIZED' {
  const tables = schema.tables || [];

  // Simple heuristic
  const hasArrays = tables.some(t => t.columns.some(c => c.type === 'ARRAY'));
  if (hasArrays) return '1NF'; // Array columns violate 1NF

  const hasJsonColumns = tables.some(t => t.columns.some(c => c.type === 'JSON' || c.type === 'JSONB'));
  if (hasJsonColumns) return 'DENORMALIZED';

  const hasCompositePKs = tables.some(t => Array.isArray(t.primaryKey) && t.primaryKey.length > 1);
  if (hasCompositePKs) return '2NF';

  return '3NF'; // Default assumption
}
