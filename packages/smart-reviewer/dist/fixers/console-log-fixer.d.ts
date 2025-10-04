import { BaseFixer, type FixContext } from './base-fixer.js';
import type { AutoFix } from '../auto-fixer.js';
/**
 * Finds and removes console.log statements
 * Coverage: 15% of common issues
 */
export declare class ConsoleLogFixer extends BaseFixer {
    getName(): string;
    getCoverage(): number;
    findFixes(context: FixContext): AutoFix[];
}
//# sourceMappingURL=console-log-fixer.d.ts.map