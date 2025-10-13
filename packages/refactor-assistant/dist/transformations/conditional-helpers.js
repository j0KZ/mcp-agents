/**
 * Conditional transformation helpers
 */
import { REGEX_LIMITS } from '../constants/transformation-limits.js';
/**
 * Convert simple if-else return statements to ternary operators
 */
export function convertIfElseToTernary(code) {
    const conditionLimit = REGEX_LIMITS.MAX_CONDITION_LENGTH;
    const returnLimit = REGEX_LIMITS.MAX_RETURN_VALUE_LENGTH;
    // Build regex pattern parts for better readability
    const ifPart = `if\\s{0,3}\\(([^)]{1,${conditionLimit}})\\)\\s{0,3}\\{\\s{0,3}`;
    const returnPart = `return\\s+([^;]{1,${returnLimit}});\\s{0,3}\\}\\s{0,3}`;
    const elsePart = `else\\s{0,3}\\{\\s{0,3}return\\s+([^;]{1,${returnLimit}});\\s{0,3}\\}`;
    const ternaryPattern = new RegExp(`${ifPart}${returnPart}${elsePart}`, 'g');
    const result = code.replace(ternaryPattern, 'return $1 ? $2 : $3;');
    const changed = result !== code;
    return { code: result, changed };
}
export function applyGuardClauses(code) {
    let changed = false;
    // Pattern: if (condition) { ... } else { return; } (safe with limits)
    // Added length limit to return value to prevent ReDoS
    // Safer pattern: Use bounded quantifiers to prevent catastrophic backtracking
    const guardPattern = /if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{([^}]{1,500})\}\s{0,3}else\s{0,3}\{\s{0,3}return\s{0,3}([^;]{0,100});\s{0,3}\}/g;
    const result = code.replace(guardPattern, (_match, condition, ifBody, returnValue) => {
        changed = true;
        const returnStatement = returnValue ? `return ${returnValue};` : 'return;';
        return `if (!(${condition})) { ${returnStatement} }\n${ifBody}`;
    });
    return { code: result, changed };
}
export function combineNestedConditions(code) {
    let changed = false;
    // Pattern: if (a) { if (b) { ... } } (safe with limits)
    const nestedPattern = /if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{\s{0,3}if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{([^}]{1,500})\}\s{0,3}\}/g;
    const result = code.replace(nestedPattern, (_match, cond1, cond2, body) => {
        changed = true;
        return `if (${cond1} && ${cond2}) {${body}}`;
    });
    return { code: result, changed };
}
//# sourceMappingURL=conditional-helpers.js.map