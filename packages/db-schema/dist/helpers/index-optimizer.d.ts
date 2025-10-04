/**
 * Index Optimization Helpers
 * Functions for suggesting index optimizations
 */
import { SQLTable, IndexSuggestion } from '../types.js';
/**
 * Check for foreign keys without indexes
 */
export declare function suggestForeignKeyIndexes(table: SQLTable, indexedColumns: Set<string>): IndexSuggestion[];
/**
 * Check for commonly filtered columns
 */
export declare function suggestFilterColumnIndexes(table: SQLTable, indexedColumns: Set<string>): IndexSuggestion[];
/**
 * Suggest JSONB GIN indexes
 */
export declare function suggestJsonbIndexes(table: SQLTable, indexedColumns: Set<string>): IndexSuggestion[];
/**
 * Suggest text search indexes
 */
export declare function suggestTextSearchIndexes(table: SQLTable, indexedColumns: Set<string>): IndexSuggestion[];
/**
 * Suggest compound indexes for common query patterns
 */
export declare function suggestCompoundIndexes(table: SQLTable, existingIndexes: any[]): IndexSuggestion[];
//# sourceMappingURL=index-optimizer.d.ts.map