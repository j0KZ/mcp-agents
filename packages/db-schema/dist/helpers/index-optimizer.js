/**
 * Index Optimization Helpers
 * Functions for suggesting index optimizations
 */
import { INDEX_PRIORITY, INDEX_IMPACT } from '../constants/schema-limits.js';
/**
 * Check for foreign keys without indexes
 */
export function suggestForeignKeyIndexes(table, indexedColumns) {
    const suggestions = [];
    const foreignKeys = table.foreignKeys || [];
    for (const fk of foreignKeys) {
        if (!indexedColumns.has(fk.column)) {
            suggestions.push({
                table: table.name,
                columns: [fk.column],
                type: 'BTREE',
                reason: `Foreign key column '${fk.column}' should be indexed to improve JOIN performance`,
                estimatedImpact: INDEX_IMPACT.HIGH,
                priority: INDEX_PRIORITY.HIGH,
            });
        }
    }
    return suggestions;
}
/**
 * Check for commonly filtered columns
 */
export function suggestFilterColumnIndexes(table, indexedColumns) {
    const suggestions = [];
    for (const column of table.columns) {
        if ((column.name.includes('status') ||
            column.name.includes('type') ||
            column.name.includes('category')) &&
            !indexedColumns.has(column.name)) {
            suggestions.push({
                table: table.name,
                columns: [column.name],
                type: 'BTREE',
                reason: `Commonly filtered column '${column.name}' should be indexed`,
                estimatedImpact: INDEX_IMPACT.MEDIUM,
                priority: INDEX_PRIORITY.MEDIUM,
            });
        }
    }
    return suggestions;
}
/**
 * Suggest JSONB GIN indexes
 */
export function suggestJsonbIndexes(table, indexedColumns) {
    const suggestions = [];
    for (const column of table.columns) {
        if (column.type === 'JSONB' && !indexedColumns.has(column.name)) {
            suggestions.push({
                table: table.name,
                columns: [column.name],
                type: 'GIN',
                reason: `JSONB column '${column.name}' should have a GIN index for efficient queries`,
                estimatedImpact: INDEX_IMPACT.HIGH,
                priority: INDEX_PRIORITY.HIGH,
            });
        }
    }
    return suggestions;
}
/**
 * Suggest text search indexes
 */
export function suggestTextSearchIndexes(table, indexedColumns) {
    const suggestions = [];
    for (const column of table.columns) {
        if (column.type === 'TEXT' && column.name.includes('description')) {
            suggestions.push({
                table: table.name,
                columns: [column.name],
                type: 'GIN',
                reason: `Text column '${column.name}' may benefit from full-text search index`,
                estimatedImpact: INDEX_IMPACT.MEDIUM,
                priority: INDEX_PRIORITY.LOW,
            });
        }
    }
    return suggestions;
}
/**
 * Suggest compound indexes for common query patterns
 */
export function suggestCompoundIndexes(table, existingIndexes) {
    const suggestions = [];
    const timestampColumns = table.columns.filter(c => c.name === 'created_at' || c.name === 'updated_at');
    const statusColumn = table.columns.find(c => c.name === 'status');
    if (statusColumn && timestampColumns.length > 0) {
        const compoundCols = [statusColumn.name, timestampColumns[0].name];
        const hasCompoundIndex = existingIndexes.some(idx => idx.columns.length > 1 && idx.columns.includes(statusColumn.name));
        if (!hasCompoundIndex) {
            suggestions.push({
                table: table.name,
                columns: compoundCols,
                type: 'BTREE',
                reason: `Compound index on status and timestamp for efficient filtering and sorting`,
                estimatedImpact: INDEX_IMPACT.HIGH,
                priority: INDEX_PRIORITY.HIGH,
            });
        }
    }
    return suggestions;
}
//# sourceMappingURL=index-optimizer.js.map