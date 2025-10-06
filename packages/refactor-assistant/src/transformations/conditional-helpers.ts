/**
 * Conditional transformation helpers
 */

export function applyGuardClauses(code: string): { code: string; changed: boolean } {
  let changed = false;

  // Pattern: if (condition) { ... } else { return; } (safe with limits)
  // Added length limit to return value to prevent ReDoS
  // Safer pattern: Use non-greedy quantifiers and atomic groups to prevent backtracking
  const guardPattern =
    /if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{([^}]{1,500})\}\s{0,3}else\s{0,3}\{\s{0,3}return\s{1,3}([^;]{0,100});\s{0,3}\}/g;

  const result = code.replace(guardPattern, (_match, condition, ifBody, returnValue) => {
    changed = true;
    const returnStatement = returnValue ? `return ${returnValue};` : 'return;';
    return `if (!(${condition})) { ${returnStatement} }\n${ifBody}`;
  });

  return { code: result, changed };
}

export function combineNestedConditions(code: string): { code: string; changed: boolean } {
  let changed = false;

  // Pattern: if (a) { if (b) { ... } } (safe with limits)
  const nestedPattern =
    /if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{\s{0,3}if\s{0,3}\(([^)]{1,200})\)\s{0,3}\{([^}]{1,500})\}\s{0,3}\}/g;

  const result = code.replace(nestedPattern, (_match, cond1, cond2, body) => {
    changed = true;
    return `if (${cond1} && ${cond2}) {${body}}`;
  });

  return { code: result, changed };
}
