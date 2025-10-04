import { parse } from '@babel/parser';
import { INDEX } from './constants/auto-fixer.js';
import { UnusedImportFixer, ConsoleLogFixer, NullCheckFixer } from './fixers/index.js';
/**
 * Core auto-fixer class - implements Pareto 80/20 fixes
 * Orchestrates specialized fixers for modularity
 */
export class AutoFixer {
    // Specialized fixers - modular architecture
    fixers = [
        new UnusedImportFixer(),
        new ConsoleLogFixer(),
        new NullCheckFixer(),
    ];
    /**
     * Create fix context from code (single split operation)
     */
    createContext(code, ast) {
        return {
            code,
            lines: code.split('\n'),
            ast,
        };
    }
    /**
     * Analyze code and generate auto-fixes
     * Uses specialized fixers for modularity
     */
    async generateFixes(code, filePath) {
        // Validate input
        if (!code || code.trim().length === 0) {
            return {
                fixes: [],
                fixedCode: code,
                summary: { total: 0, safe: 0, requiresReview: 0 }
            };
        }
        const fixes = [];
        let context;
        try {
            // Parse with TypeScript/JSX support
            const ast = parse(code, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx'],
            });
            // Create context once (single split operation)
            context = this.createContext(code, ast);
            // Run all specialized fixers
            for (const fixer of this.fixers) {
                const fixerFixes = fixer.findFixes(context);
                fixes.push(...fixerFixes);
            }
        }
        catch (error) {
            // Invalid syntax - skip auto-fix
            console.error(`Cannot parse ${filePath} for auto-fixing:`, error);
        }
        // Apply safe fixes - reuse context.lines to avoid duplicate split
        const fixedCode = this.applyFixes(code, fixes.filter(f => f.safe), context);
        const summary = {
            total: fixes.length,
            safe: fixes.filter(f => f.safe).length,
            requiresReview: fixes.filter(f => !f.safe).length,
        };
        return { fixes, fixedCode, summary };
    }
    /**
     * Apply safe fixes to code
     */
    applyFixes(code, fixes, context) {
        if (fixes.length === 0)
            return code;
        // Reuse context.lines if available to avoid duplicate split
        const lines = context?.lines ? [...context.lines] : code.split('\n');
        const fixesByLine = new Map();
        // Group fixes by line
        fixes.forEach(fix => {
            if (!fixesByLine.has(fix.line)) {
                fixesByLine.set(fix.line, []);
            }
            fixesByLine.get(fix.line).push(fix);
        });
        // Apply fixes (from bottom to top to preserve line numbers)
        const sortedLines = Array.from(fixesByLine.keys()).sort((a, b) => b - a);
        for (const lineNum of sortedLines) {
            const lineFixes = fixesByLine.get(lineNum);
            // Sort by column (descending) to apply right-to-left
            // This prevents column offsets when multiple fixes exist on same line
            const sortedFixes = lineFixes.sort((a, b) => (b.column || INDEX.ZERO_BASED) - (a.column || INDEX.ZERO_BASED));
            for (const fix of sortedFixes) {
                if (fix.newCode === '') {
                    // Remove the line
                    lines.splice(lineNum - INDEX.ONE_BASED, INDEX.ONE_BASED);
                }
                else {
                    // Replace the line
                    lines[lineNum - INDEX.ONE_BASED] = fix.newCode;
                }
            }
        }
        return lines.join('\n');
    }
    /**
     * Preview fixes as a diff
     */
    generateDiff(fixes) {
        const diff = [];
        fixes.forEach(fix => {
            diff.push(`Line ${fix.line}: ${fix.description}`);
            diff.push(`- ${fix.oldCode}`);
            if (fix.newCode) {
                diff.push(`+ ${fix.newCode}`);
            }
            diff.push('');
        });
        return diff.join('\n');
    }
}
//# sourceMappingURL=auto-fixer.js.map