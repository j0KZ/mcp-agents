/**
 * Schema Validator Module
 * Validates database schemas and estimates normalization levels
 */
import { DatabaseSchema, ValidationError, ValidationWarning } from '../types.js';
export declare function validateSQLSchema(schema: DatabaseSchema, errors: ValidationError[], warnings: ValidationWarning[]): void;
export declare function validateMongoSchema(schema: DatabaseSchema, _errors: ValidationError[], warnings: ValidationWarning[]): void;
export declare function estimateNormalForm(schema: DatabaseSchema): '1NF' | '2NF' | '3NF' | 'BCNF' | 'DENORMALIZED';
//# sourceMappingURL=schema-validator.d.ts.map