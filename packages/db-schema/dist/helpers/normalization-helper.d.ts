/**
 * Normalization Helper Functions
 * Functions for detecting normalization violations
 */
import { SQLTable, NormalizationSuggestion, Relationship } from '../types.js';
/**
 * Check for repeating groups (1NF violation)
 */
export declare function detectRepeatingGroups(table: SQLTable): NormalizationSuggestion[];
/**
 * Check for partial dependencies (2NF violation)
 */
export declare function detectPartialDependencies(table: SQLTable): NormalizationSuggestion[];
/**
 * Check for transitive dependencies (3NF violation)
 */
export declare function detectTransitiveDependencies(table: SQLTable): NormalizationSuggestion[];
/**
 * Check for redundant data in JSON columns
 */
export declare function detectRedundantData(table: SQLTable): NormalizationSuggestion[];
/**
 * Check for missing junction tables in many-to-many relationships
 */
export declare function detectMissingJunctionTables(relationships: Relationship[]): NormalizationSuggestion[];
//# sourceMappingURL=normalization-helper.d.ts.map