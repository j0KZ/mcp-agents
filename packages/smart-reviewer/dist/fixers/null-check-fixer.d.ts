import { BaseFixer, type FixContext } from './base-fixer.js';
import type { AutoFix } from '../auto-fixer.js';
/**
 * Suggests optional chaining for null/undefined access
 * Coverage: 25% of common issues
 */
export declare class NullCheckFixer extends BaseFixer {
    private readonly NEVER_NULL_OBJECTS;
    getName(): string;
    getCoverage(): number;
    findFixes(context: FixContext): AutoFix[];
}
//# sourceMappingURL=null-check-fixer.d.ts.map