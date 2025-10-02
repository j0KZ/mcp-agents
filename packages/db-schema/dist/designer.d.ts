/**
 * Database Schema Designer - Core Logic
 * Provides comprehensive schema design, migration, and optimization capabilities
 */
import { DatabaseSchema, SchemaDesignOptions, Migration, IndexSuggestion, NormalizationSuggestion, SeedData, ValidationResult, ERDiagramOptions, SchemaAnalysis } from './types.js';
/**
 * Design a database schema from requirements
 * @param requirements - Plain text description of data requirements
 * @param options - Schema design options
 * @returns Complete database schema
 */
export declare function designSchema(requirements: string, options: SchemaDesignOptions): DatabaseSchema;
/**
 * Generate migration files for schema changes
 * @param schema - Database schema
 * @param description - Migration description
 * @returns Migration object with up/down SQL
 */
export declare function generateMigration(schema: DatabaseSchema, description: string): Migration;
/**
 * Create ER diagram in Mermaid format
 * @param schema - Database schema
 * @param options - Diagram options
 * @returns Mermaid diagram string
 */
export declare function createERDiagram(schema: DatabaseSchema, options?: ERDiagramOptions): string;
/**
 * Suggest index optimizations
 * @param schema - Database schema
 * @returns Array of index suggestions
 */
export declare function optimizeIndexes(schema: DatabaseSchema): IndexSuggestion[];
/**
 * Suggest schema normalizations
 * @param schema - Database schema
 * @returns Array of normalization suggestions
 */
export declare function normalizeSchema(schema: DatabaseSchema): NormalizationSuggestion[];
/**
 * Generate seed data for testing
 * @param schema - Database schema
 * @param recordsPerTable - Number of records to generate per table
 * @returns Array of seed data
 */
export declare function generateSeedData(schema: DatabaseSchema, recordsPerTable?: number): SeedData[];
/**
 * Validate schema for errors and best practices
 * @param schema - Database schema to validate
 * @returns Validation result with errors and warnings
 */
export declare function validateSchema(schema: DatabaseSchema): ValidationResult;
/**
 * Analyze schema complexity and characteristics
 * @param schema - Database schema
 * @returns Schema analysis
 */
export declare function analyzeSchema(schema: DatabaseSchema): SchemaAnalysis;
//# sourceMappingURL=designer.d.ts.map