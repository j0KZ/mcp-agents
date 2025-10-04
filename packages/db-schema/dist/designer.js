/**
 * Database Schema Designer - Core Logic
 * Provides comprehensive schema design, migration, and optimization capabilities
 */
// Import extracted modules
import { buildSQLSchema, buildMongoSchema, extractEntities, extractRelationships, } from './builders/schema-builder.js';
import { generateSQLUpMigration, generateSQLDownMigration, generateMongoUpMigration, generateMongoDownMigration, topologicalSort, } from './generators/migration-generator.js';
import { generateMermaidDiagram, generateDBMLDiagram, generatePlantUMLDiagram, } from './generators/diagram-generator.js';
import { COMPLEXITY_THRESHOLDS, ANALYSIS_ESTIMATES, } from './constants/schema-limits.js';
import { suggestForeignKeyIndexes, suggestFilterColumnIndexes, suggestJsonbIndexes, suggestTextSearchIndexes, suggestCompoundIndexes, } from './helpers/index-optimizer.js';
import { detectRepeatingGroups, detectPartialDependencies, detectTransitiveDependencies, detectRedundantData, detectMissingJunctionTables, } from './helpers/normalization-helper.js';
import { generateSQLRecords, generateMongoRecords, } from './generators/seed-generator.js';
import { validateSQLSchema, validateMongoSchema, estimateNormalForm, } from './validators/schema-validator.js';
/**
 * Design a database schema from requirements
 * @param requirements - Plain text description of data requirements
 * @param options - Schema design options
 * @returns Complete database schema
 */
export function designSchema(requirements, options) {
    const { database } = options;
    // Parse requirements and extract entities
    const entities = extractEntities(requirements);
    const relationships = extractRelationships(requirements, entities);
    // Build schema based on database type
    if (database === 'mongodb') {
        return buildMongoSchema(entities, relationships, options);
    }
    else {
        return buildSQLSchema(entities, relationships, options);
    }
}
/**
 * Generate migration files for schema changes
 * @param schema - Database schema
 * @param description - Migration description
 * @returns Migration object with up/down SQL
 */
export function generateMigration(schema, description) {
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const version = `V${timestamp}`;
    let upSQL = '';
    let downSQL = '';
    if (schema.database === 'mongodb') {
        // MongoDB migrations (using mongosh commands)
        upSQL = generateMongoUpMigration(schema);
        downSQL = generateMongoDownMigration(schema);
    }
    else {
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
export function createERDiagram(schema, options = { format: 'mermaid', includeColumns: true, includeRelationships: true }) {
    if (options.format === 'mermaid') {
        return generateMermaidDiagram(schema, options);
    }
    else if (options.format === 'dbml') {
        return generateDBMLDiagram(schema, options);
    }
    else {
        return generatePlantUMLDiagram(schema, options);
    }
}
/**
 * Suggest index optimizations
 * @param schema - Database schema
 * @returns Array of index suggestions
 */
export function optimizeIndexes(schema) {
    const suggestions = [];
    const tables = schema.tables || [];
    for (const table of tables) {
        const existingIndexes = table.indexes || [];
        const indexedColumns = new Set(existingIndexes.flatMap(idx => idx.columns));
        // Collect suggestions from all helper functions
        suggestions.push(...suggestForeignKeyIndexes(table, indexedColumns));
        suggestions.push(...suggestFilterColumnIndexes(table, indexedColumns));
        suggestions.push(...suggestJsonbIndexes(table, indexedColumns));
        suggestions.push(...suggestTextSearchIndexes(table, indexedColumns));
        suggestions.push(...suggestCompoundIndexes(table, existingIndexes));
    }
    return suggestions.sort((a, b) => a.priority - b.priority);
}
/**
 * Suggest schema normalizations
 * @param schema - Database schema
 * @returns Array of normalization suggestions
 */
export function normalizeSchema(schema) {
    const suggestions = [];
    const tables = schema.tables || [];
    for (const table of tables) {
        // Collect suggestions from all helper functions
        suggestions.push(...detectRepeatingGroups(table));
        suggestions.push(...detectPartialDependencies(table));
        suggestions.push(...detectTransitiveDependencies(table));
        suggestions.push(...detectRedundantData(table));
    }
    // Check for missing junction tables
    suggestions.push(...detectMissingJunctionTables(schema.relationships || []));
    return suggestions;
}
/**
 * Generate seed data for testing
 * @param schema - Database schema
 * @param recordsPerTable - Number of records to generate per table
 * @returns Array of seed data
 */
export function generateSeedData(schema, recordsPerTable = 10) {
    const seedData = [];
    if (schema.database === 'mongodb') {
        const collections = schema.collections || [];
        for (const collection of collections) {
            seedData.push({
                table: collection.name,
                records: generateMongoRecords(collection, recordsPerTable),
                truncateFirst: true,
            });
        }
    }
    else {
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
export function validateSchema(schema) {
    const errors = [];
    const warnings = [];
    if (schema.database === 'mongodb') {
        validateMongoSchema(schema, errors, warnings);
    }
    else {
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
export function analyzeSchema(schema) {
    const tables = schema.tables || schema.collections || [];
    const relationships = schema.relationships || [];
    const columnCount = tables.reduce((sum, t) => {
        return sum + (t.columns?.length || t.fields?.length || 0);
    }, 0);
    const indexCount = tables.reduce((sum, t) => {
        return sum + (t.indexes?.length || 0);
    }, 0);
    // Estimate normal form
    const normalForm = estimateNormalForm(schema);
    // Estimate complexity
    const complexity = tables.length > COMPLEXITY_THRESHOLDS.HIGH_COMPLEXITY_TABLE_COUNT ||
        relationships.length > COMPLEXITY_THRESHOLDS.HIGH_COMPLEXITY_RELATIONSHIP_COUNT ? 'HIGH' :
        tables.length > COMPLEXITY_THRESHOLDS.MEDIUM_COMPLEXITY_TABLE_COUNT ||
            relationships.length > COMPLEXITY_THRESHOLDS.MEDIUM_COMPLEXITY_RELATIONSHIP_COUNT ? 'MEDIUM' : 'LOW';
    return {
        tableCount: tables.length,
        columnCount,
        indexCount,
        relationshipCount: relationships.length,
        normalForm,
        estimatedSize: {
            rows: tables.length * ANALYSIS_ESTIMATES.DEFAULT_ROWS_PER_TABLE,
            storage: `${Math.ceil(tables.length * ANALYSIS_ESTIMATES.STORAGE_MB_PER_TABLE)}MB`,
        },
        complexity,
    };
}
//# sourceMappingURL=designer.js.map