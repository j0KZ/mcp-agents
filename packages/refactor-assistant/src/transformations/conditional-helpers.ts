/**
 * Conditional transformation helpers
 */

export function applyGuardClauses(code: string): { code: string; changed: boolean } {
  let changed = false;

  // Pattern: if (condition) { ... } else { return; } (safe with limits)
  // Added length limit to return value to prevent ReDoS
  const guardPattern =
    /if\s?\(([^)]{1,200})\)\s?\{([^}]{1,500})\}\s?else\s?\{\s?return\s?([^;]{0,100});\s?\}/g;

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
    /if\s?\(([^)]{1,200})\)\s?\{\s?if\s?\(([^)]{1,200})\)\s?\{([^}]{1,500})\}\s?\}/g;

  const result = code.replace(nestedPattern, (_match, cond1, cond2, body) => {
    changed = true;
    return `if (${cond1} && ${cond2}) {${body}}`;
  });

  return { code: result, changed };
}
