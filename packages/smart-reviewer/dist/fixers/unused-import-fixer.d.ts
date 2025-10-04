import { BaseFixer, type FixContext } from './base-fixer.js';
import type { AutoFix } from '../auto-fixer.js';
/**
 * Finds and removes unused imports
 * Coverage: 35% of common issues
 */
export declare class UnusedImportFixer extends BaseFixer {
    getName(): string;
    getCoverage(): number;
    findFixes(context: FixContext): AutoFix[];
}
//# sourceMappingURL=unused-import-fixer.d.ts.map