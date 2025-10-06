/**
 * Schema Builder Module
 * Builds SQL and MongoDB schemas from entities and relationships
 */
import { STRING_LIMITS, NUMERIC_LIMITS } from '../constants/schema-limits.js';
export function buildSQLSchema(entities, relationships, options) {
    const tables = [];
    for (const entity of entities) {
        const columns = [];
        // Primary key
        if (options.useUUIDs) {
            columns.push({
                name: 'id',
                type: 'UUID',
                primaryKey: true,
                defaultValue: 'gen_random_uuid()',
            });
        }
        else {
            columns.push({
                name: 'id',
                type: options.database === 'postgres' ? 'SERIAL' : 'INTEGER',
                primaryKey: true,
                autoIncrement: true,
            });
        }
        // Common fields based on entity type
        if (entity.includes('user') || entity.includes('customer')) {
            columns.push({
                name: 'email',
                type: 'VARCHAR',
                length: STRING_LIMITS.EMAIL_LENGTH,
                unique: true,
                nullable: false,
            }, { name: 'name', type: 'VARCHAR', length: STRING_LIMITS.NAME_LENGTH, nullable: false }, {
                name: 'password_hash',
                type: 'VARCHAR',
                length: STRING_LIMITS.PASSWORD_HASH_LENGTH,
                nullable: false,
            });
        }
        else if (entity.includes('product')) {
            columns.push({ name: 'name', type: 'VARCHAR', length: STRING_LIMITS.NAME_LENGTH, nullable: false }, { name: 'description', type: 'TEXT' }, {
                name: 'price',
                type: 'DECIMAL',
                precision: NUMERIC_LIMITS.DEFAULT_PRICE_PRECISION,
                scale: NUMERIC_LIMITS.DEFAULT_PRICE_SCALE,
                nullable: false,
            }, { name: 'stock', type: 'INTEGER', defaultValue: NUMERIC_LIMITS.DEFAULT_STOCK_VALUE });
        }
        else {
            columns.push({
                name: 'name',
                type: 'VARCHAR',
                length: STRING_LIMITS.NAME_LENGTH,
                nullable: false,
            });
        }
        // Timestamps
        if (options.includeTimestamps) {
            columns.push({
                name: 'created_at',
                type: 'TIMESTAMP',
                defaultValue: 'CURRENT_TIMESTAMP',
                nullable: false,
            }, {
                name: 'updated_at',
                type: 'TIMESTAMP',
                defaultValue: 'CURRENT_TIMESTAMP',
                nullable: false,
            });
        }
        // Soft deletes
        if (options.includeSoftDeletes) {
            columns.push({ name: 'deleted_at', type: 'TIMESTAMP' });
        }
        tables.push({
            name: entity + 's',
            columns,
            primaryKey: 'id',
            indexes: options.addIndexes
                ? [{ name: `idx_${entity}s_created_at`, columns: ['created_at'] }]
                : [],
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
export function buildMongoSchema(entities, relationships, options) {
    const collections = [];
    for (const entity of entities) {
        const fields = [];
        // MongoDB uses _id by default
        fields.push({
            name: '_id',
            type: 'ObjectId',
            required: true,
        });
        // Common fields
        if (entity.includes('user') || entity.includes('customer')) {
            fields.push({ name: 'email', type: 'String', required: true, unique: true }, { name: 'name', type: 'String', required: true }, { name: 'passwordHash', type: 'String', required: true });
        }
        else if (entity.includes('product')) {
            fields.push({ name: 'name', type: 'String', required: true }, { name: 'description', type: 'String' }, { name: 'price', type: 'Number', required: true }, { name: 'stock', type: 'Number', default: 0 });
        }
        else {
            fields.push({ name: 'name', type: 'String', required: true });
        }
        // Timestamps
        if (options.includeTimestamps) {
            fields.push({ name: 'createdAt', type: 'Date', default: 'Date.now' }, { name: 'updatedAt', type: 'Date', default: 'Date.now' });
        }
        collections.push({
            name: entity + 's',
            fields,
            indexes: options.addIndexes
                ? [{ name: `idx_${entity}s_created`, columns: ['createdAt'] }]
                : [],
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
export function extractEntities(requirements) {
    const entities = [];
    const lines = requirements.toLowerCase().split('.');
    for (const line of lines) {
        // Skip very long lines to prevent ReDoS
        if (line.length > STRING_LIMITS.MAX_LINE_LENGTH)
            continue;
        // Match patterns like "users have", "products contain", etc.
        // Limit word length to prevent polynomial regex
        const entityMatch = line.match(new RegExp(`(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})\\s+(have|has|contain|include|store)`));
        if (entityMatch) {
            const entity = entityMatch[1].replace(/s$/, ''); // Singular
            if (!entities.includes(entity)) {
                entities.push(entity);
            }
        }
        // Match "X and Y" patterns
        const multiMatch = line.match(new RegExp(`(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})\\s+and\\s+(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})`));
        if (multiMatch) {
            const entity1 = multiMatch[1].replace(/s$/, '');
            const entity2 = multiMatch[2].replace(/s$/, '');
            if (!entities.includes(entity1))
                entities.push(entity1);
            if (!entities.includes(entity2))
                entities.push(entity2);
        }
    }
    return entities.length > 0 ? entities : ['entity'];
}
export function extractRelationships(requirements, _entities) {
    const relationships = [];
    const lines = requirements.toLowerCase().split('.');
    for (const line of lines) {
        // Skip very long lines to prevent ReDoS
        if (line.length > STRING_LIMITS.MAX_LINE_LENGTH)
            continue;
        // Pattern: "users have many orders"
        // Limit word length to prevent polynomial regex
        const manyMatch = line.match(new RegExp(`(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})\\s+have\\s+many\\s+(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})`));
        if (manyMatch) {
            relationships.push({
                name: `${manyMatch[1]}_${manyMatch[2]}`,
                type: 'ONE_TO_MANY',
                from: { table: manyMatch[1], column: 'id' },
                to: { table: manyMatch[2], column: `${manyMatch[1].replace(/s$/, '')}_id` },
            });
        }
        // Pattern: "orders belong to users"
        const belongsMatch = line.match(new RegExp(`(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})\\s+belong\\s+to\\s+(\\w{1,${STRING_LIMITS.MAX_WORD_LENGTH}})`));
        if (belongsMatch) {
            relationships.push({
                name: `${belongsMatch[2]}_${belongsMatch[1]}`,
                type: 'ONE_TO_MANY',
                from: { table: belongsMatch[2], column: 'id' },
                to: { table: belongsMatch[1], column: `${belongsMatch[2].replace(/s$/, '')}_id` },
            });
        }
    }
    return relationships;
}
//# sourceMappingURL=schema-builder.js.map