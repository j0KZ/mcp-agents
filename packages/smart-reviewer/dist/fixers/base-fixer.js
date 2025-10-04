/**
 * Abstract base class for fixers with common utilities
 */
export class BaseFixer {
    /**
     * Get line content safely
     */
    getLineContent(context, line) {
        return context.lines[line - 1] || '';
    }
    /**
     * Create a fix object with common fields
     */
    createFix(type, description, line, column, oldCode, newCode, confidence, safe, impact) {
        return {
            type,
            description,
            line,
            column,
            oldCode: oldCode.trim(),
            newCode: newCode.trim(),
            confidence,
            safe,
            impact,
        };
    }
}
//# sourceMappingURL=base-fixer.js.map