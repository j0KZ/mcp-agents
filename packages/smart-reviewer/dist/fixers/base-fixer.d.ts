import type { File } from '@babel/types';
import type { AutoFix } from '../auto-fixer.js';
/**
 * Context for fix generation - shared across all fixers
 */
export interface FixContext {
    code: string;
    lines: string[];
    ast: File;
}
/**
 * Base interface for all specialized fixers
 */
export interface IFixer {
    /**
     * Find fixes in the given context
     */
    findFixes(context: FixContext): AutoFix[];
    /**
     * Get fixer name for logging/debugging
     */
    getName(): string;
    /**
     * Get coverage percentage (Pareto principle)
     */
    getCoverage(): number;
}
/**
 * Abstract base class for fixers with common utilities
 */
export declare abstract class BaseFixer implements IFixer {
    abstract findFixes(context: FixContext): AutoFix[];
    abstract getName(): string;
    abstract getCoverage(): number;
    /**
     * Get line content safely
     */
    protected getLineContent(context: FixContext, line: number): string;
    /**
     * Create a fix object with common fields
     */
    protected createFix(type: AutoFix['type'], description: string, line: number, column: number, oldCode: string, newCode: string, confidence: number, safe: boolean, impact: AutoFix['impact']): AutoFix;
}
//# sourceMappingURL=base-fixer.d.ts.map