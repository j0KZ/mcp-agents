/**
 * Extended tests for suggestRefactorings to improve coverage
 * Covers: long function detection (lines 304-312) and deep nesting (lines 319-328)
 */

import { describe, it, expect } from 'vitest';
import { suggestRefactorings } from '../src/refactorer.js';

describe('suggestRefactorings - Long Functions', () => {
  it('should detect very long functions (>50 lines)', () => {
    // Generate a function with over 50 lines
    const longFunctionBody = Array.from({ length: 55 }, (_, i) => `    const var${i} = ${i};`).join(
      '\n'
    );

    const code = `
function veryLongFunction() {
${longFunctionBody}
  return var0;
}
    `;

    const result = suggestRefactorings(code);
    expect(Array.isArray(result)).toBe(true);

    // Should have a suggestion for extract-function
    const extractSuggestion = result.find(s => s.type === 'extract-function');
    expect(extractSuggestion).toBeDefined();
    expect(extractSuggestion?.severity).toBe('warning');
    expect(extractSuggestion?.message).toContain('veryLongFunction');
    expect(extractSuggestion?.message).toContain('lines long');
    expect(extractSuggestion?.rationale).toContain('harder to understand');
  });

  it('should detect multiple long functions', () => {
    const body1 = Array.from({ length: 55 }, (_, i) => `    const a${i} = ${i};`).join('\n');
    const body2 = Array.from({ length: 60 }, (_, i) => `    const b${i} = ${i};`).join('\n');

    const code = `
function firstLongFunction() {
${body1}
  return a0;
}

function secondLongFunction() {
${body2}
  return b0;
}
    `;

    const result = suggestRefactorings(code);

    // Should find two extract-function suggestions
    const extractSuggestions = result.filter(s => s.type === 'extract-function');
    expect(extractSuggestions.length).toBeGreaterThanOrEqual(2);
  });

  it('should not flag functions under 50 lines', () => {
    const shortBody = Array.from({ length: 10 }, (_, i) => `    const x${i} = ${i};`).join('\n');

    const code = `
function shortFunction() {
${shortBody}
  return x0;
}
    `;

    const result = suggestRefactorings(code);
    const extractSuggestions = result.filter(
      s => s.type === 'extract-function' && s.message.includes('shortFunction')
    );
    expect(extractSuggestions.length).toBe(0);
  });
});

describe('suggestRefactorings - Deep Nesting', () => {
  it('should detect very deeply nested code (>10 levels)', () => {
    // Generate code with 12 levels of nesting
    const openBraces = Array.from({ length: 12 }, (_, i) => '    '.repeat(i) + `if (x${i}) {`).join(
      '\n'
    );
    const closeBraces = Array.from({ length: 12 }, (_, i) => '    '.repeat(11 - i) + '}').join(
      '\n'
    );

    const code = `
function deeplyNested(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11) {
${openBraces}
${'    '.repeat(12)}return true;
${closeBraces}
  return false;
}
    `;

    const result = suggestRefactorings(code);
    expect(Array.isArray(result)).toBe(true);

    // Should have a suggestion for simplify-conditionals
    const simplifySuggestion = result.find(s => s.type === 'simplify-conditionals');
    expect(simplifySuggestion).toBeDefined();
    expect(simplifySuggestion?.severity).toBe('warning');
    expect(simplifySuggestion?.message).toContain('Deep nesting');
    expect(simplifySuggestion?.message).toContain('depth');
    expect(simplifySuggestion?.rationale).toContain('readability');
  });

  it('should not flag shallow nesting', () => {
    const code = `
function shallowNesting(a, b, c) {
  if (a) {
    if (b) {
      if (c) {
        return true;
      }
    }
  }
  return false;
}
    `;

    const result = suggestRefactorings(code);

    // Should NOT have simplify-conditionals for shallow nesting (3 levels < 10)
    const simplifySuggestions = result.filter(s => s.type === 'simplify-conditionals');
    // The threshold is 10, so 3 levels shouldn't trigger it
    expect(simplifySuggestions.length).toBe(0);
  });

  it('should detect multiple locations with deep nesting', () => {
    // Two separate deeply nested sections
    const nest1 = Array.from({ length: 11 }, (_, i) => '    '.repeat(i + 1) + `if (a${i}) {`).join(
      '\n'
    );
    const close1 = Array.from({ length: 11 }, (_, i) => '    '.repeat(10 - i + 1) + '}').join('\n');

    const nest2 = Array.from({ length: 11 }, (_, i) => '    '.repeat(i + 1) + `if (b${i}) {`).join(
      '\n'
    );
    const close2 = Array.from({ length: 11 }, (_, i) => '    '.repeat(10 - i + 1) + '}').join('\n');

    const code = `
function multiDeep() {
${nest1}
${'    '.repeat(12)}console.log('first');
${close1}

${nest2}
${'    '.repeat(12)}console.log('second');
${close2}
}
    `;

    const result = suggestRefactorings(code);
    const simplifySuggestions = result.filter(s => s.type === 'simplify-conditionals');
    expect(simplifySuggestions.length).toBeGreaterThanOrEqual(1);
  });
});

describe('suggestRefactorings - Combined Issues', () => {
  it('should detect both long function and deep nesting', () => {
    // Create a function that is both long AND has deep nesting
    const longLines = Array.from({ length: 40 }, (_, i) => `  const v${i} = ${i};`).join('\n');
    const deepNest = Array.from(
      { length: 12 },
      (_, i) => '    '.repeat(i + 1) + `if (x${i}) {`
    ).join('\n');
    const closeNest = Array.from({ length: 12 }, (_, i) => '    '.repeat(11 - i + 1) + '}').join(
      '\n'
    );

    const code = `
function complexFunction(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11) {
${longLines}
${deepNest}
${'    '.repeat(13)}return true;
${closeNest}
  return false;
}
    `;

    const result = suggestRefactorings(code);

    // Should have suggestions for both issues
    const extractSuggestion = result.find(s => s.type === 'extract-function');
    const simplifySuggestion = result.find(s => s.type === 'simplify-conditionals');

    expect(extractSuggestion).toBeDefined();
    expect(simplifySuggestion).toBeDefined();
  });
});
