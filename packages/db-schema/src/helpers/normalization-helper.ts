/**
 * Normalization Helper Functions
 * Functions for detecting normalization violations
 */

import { SQLTable, NormalizationSuggestion, Relationship } from '../types.js';
import { NORMALIZATION_LIMITS } from '../constants/schema-limits.js';

/**
 * Check for repeating groups (1NF violation)
 */
export function detectRepeatingGroups(table: SQLTable): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];
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

  return suggestions;
}

/**
 * Check for partial dependencies (2NF violation)
 */
export function detectPartialDependencies(table: SQLTable): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];
  const compositePK = Array.isArray(table.primaryKey) && table.primaryKey.length > 1;

  if (compositePK) {
    const nonKeyColumns = table.columns.filter(c =>
      !table.primaryKey!.includes(c.name)
    );

    if (nonKeyColumns.length > NORMALIZATION_LIMITS.MIN_NONKEY_COLUMNS_FOR_EXTRACTION) {
      suggestions.push({
        type: 'EXTRACT_TABLE',
        description: `Table '${table.name}' has composite primary key with potential partial dependencies`,
        affectedTables: [table.name],
        proposedChanges: `Consider extracting columns that depend on only part of the composite key`,
        normalForm: '2NF',
      });
    }
  }

  return suggestions;
}

/**
 * Check for transitive dependencies (3NF violation)
 */
export function detectTransitiveDependencies(table: SQLTable): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];

  // Check for address columns that suggest transitive dependencies
  const addressColumns = table.columns.filter(c =>
    c.name.includes('city') || c.name.includes('state') || c.name.includes('country')
  );

  if (addressColumns.length >= NORMALIZATION_LIMITS.MIN_ADDRESS_COLUMNS_FOR_EXTRACTION) {
    suggestions.push({
      type: 'EXTRACT_TABLE',
      description: `Table '${table.name}' has potential transitive dependencies in address columns`,
      affectedTables: [table.name],
      proposedChanges: `Extract address fields into a separate 'addresses' table`,
      normalForm: '3NF',
    });
  }

  return suggestions;
}

/**
 * Check for redundant data in JSON columns
 */
export function detectRedundantData(table: SQLTable): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];
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

  return suggestions;
}

/**
 * Check for missing junction tables in many-to-many relationships
 */
export function detectMissingJunctionTables(relationships: Relationship[]): NormalizationSuggestion[] {
  const suggestions: NormalizationSuggestion[] = [];
  const manyToManyRels = relationships.filter(r => r.type === 'MANY_TO_MANY');

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
