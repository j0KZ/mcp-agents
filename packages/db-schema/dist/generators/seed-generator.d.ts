/**
 * Seed Data Generator Module
 * Generates realistic mock data for testing
 */
import { SQLTable, MongoCollection } from '../types.js';
export declare function generateSQLRecords(table: SQLTable, count: number): Record<string, any>[];
export declare function generateMongoRecords(collection: MongoCollection, count: number): Record<string, any>[];
export declare function generateMockValue(name: string, type: string, index: number): any;
//# sourceMappingURL=seed-generator.d.ts.map