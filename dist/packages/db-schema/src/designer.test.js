import { describe, it, expect } from 'vitest';
import { designSchema, generateMigration, validateSchema } from './designer.js';
describe('DB Schema Designer', () => {
    it('should design SQL schema', () => {
        const result = designSchema('Users have many orders', {
            database: 'postgres'
        });
        expect(result.database).toBe('postgres');
        expect(result.tables.length).toBeGreaterThan(0);
    });
    it('should design MongoDB schema', () => {
        const result = designSchema('Users have posts', {
            database: 'mongodb'
        });
        expect(result.database).toBe('mongodb');
        expect(result.collections.length).toBeGreaterThan(0);
    });
    it('should generate migration', () => {
        const schema = designSchema('Products table', { database: 'postgres' });
        const migration = generateMigration(schema, 'Initial schema');
        expect(migration.up).toContain('CREATE TABLE');
        expect(migration.down).toContain('DROP TABLE');
    });
    it('should validate schema', () => {
        const schema = designSchema('Users table', { database: 'postgres' });
        const validation = validateSchema(schema);
        expect(validation.valid).toBe(true);
    });
});
//# sourceMappingURL=designer.test.js.map