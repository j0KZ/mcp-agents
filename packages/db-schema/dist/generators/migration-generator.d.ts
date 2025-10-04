/**
 * Migration Generator Module
 * Generates SQL and MongoDB migration scripts
 */
import { DatabaseSchema, SQLTable } from '../types.js';
export declare function generateSQLUpMigration(schema: DatabaseSchema): string;
export declare function generateSQLDownMigration(schema: DatabaseSchema): string;
export declare function generateMongoUpMigration(schema: DatabaseSchema): string;
export declare function generateMongoDownMigration(schema: DatabaseSchema): string;
export declare function topologicalSort(tables: SQLTable[]): SQLTable[];
//# sourceMappingURL=migration-generator.d.ts.map