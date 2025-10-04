/**
 * Schema Builder Module
 * Builds SQL and MongoDB schemas from entities and relationships
 */
import { DatabaseSchema, SchemaDesignOptions, Relationship } from '../types.js';
export declare function buildSQLSchema(entities: string[], relationships: Relationship[], options: SchemaDesignOptions): DatabaseSchema;
export declare function buildMongoSchema(entities: string[], relationships: Relationship[], options: SchemaDesignOptions): DatabaseSchema;
export declare function extractEntities(requirements: string): string[];
export declare function extractRelationships(requirements: string, _entities: string[]): Relationship[];
//# sourceMappingURL=schema-builder.d.ts.map