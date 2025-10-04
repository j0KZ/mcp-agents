/**
 * Factory for applying design patterns
 */
import { DesignPattern } from '../types.js';
/**
 * Apply a design pattern to code
 */
export declare function applyPattern(pattern: DesignPattern, code: string, options: any): string;
/**
 * Check if a pattern name is valid
 */
export declare function isValidPattern(pattern: string): pattern is DesignPattern;
/**
 * Get list of all supported patterns
 */
export declare function getSupportedPatterns(): DesignPattern[];
//# sourceMappingURL=pattern-factory.d.ts.map