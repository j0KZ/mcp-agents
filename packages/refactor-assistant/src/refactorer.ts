/**
 * Core refactoring logic and transformations
 */

import {
  RefactoringResult,
  RefactoringChange,
  RefactoringSuggestion,
  ConvertToAsyncOptions,
  SimplifyConditionalsOptions,
  RemoveDeadCodeOptions,
  ApplyPatternOptions,
  RenameVariableOptions,
} from './types.js';

import {
  REFACTORING_LIMITS,
  REFACTORING_MESSAGES,
  PATTERN_CONSTANTS,
  INDEX_CONSTANTS,
} from './constants/refactoring-limits.js';

import { REGEX_LIMITS } from './constants/transformation-limits.js';

// Re-export from modular components
export { extractFunction } from './core/extract-function.js';
export { calculateMetrics, findDuplicateBlocks } from './analysis/metrics-calculator.js';

// Import for internal use
import { findDuplicateBlocks, getNestingDepth } from './analysis/metrics-calculator.js';

import {
  applyGuardClauses,
  combineNestedConditions,
} from './transformations/conditional-helpers.js';
import { removeUnusedImportsFromCode, escapeRegExp } from './transformations/import-helpers.js';
import { analyzeFunctionLengths } from './transformations/analysis-helpers.js';
import {
  createSuccessResult,
  createErrorResult,
  createValidationError,
  createSingleChangeResult,
  validateCodeSize,
} from './utils/result-helpers.js';
import {
  convertCallbackToAsync,
  convertPromiseChainToAsync,
} from './transformations/async-converter.js';
import {
  findUnusedVariables,
  removeUnusedVariables,
  removeUnreachableCode,
} from './transformations/dead-code-detector.js';
import { applyPattern, isValidPattern } from './patterns/pattern-factory.js';

/**
 * Convert callback-based code to async/await
 */
export function convertToAsync(options: ConvertToAsyncOptions): RefactoringResult {
  try {
    const { code, useTryCatch = true } = options;

    // Validate code size
    const sizeError = validateCodeSize(code, REFACTORING_LIMITS.MAX_CODE_SIZE);
    if (sizeError) return sizeError;

    let refactoredCode = code;
    const changes: RefactoringChange[] = [];

    // Convert callbacks to async/await
    const callbackResult = convertCallbackToAsync(refactoredCode, useTryCatch);
    if (callbackResult.changed) {
      changes.push({
        type: 'convert-to-async',
        description: 'Converted callback-based code to async/await',
        before: refactoredCode,
        after: callbackResult.code,
      });
      refactoredCode = callbackResult.code;
    }

    // Convert Promise.then chains to async/await
    const promiseResult = convertPromiseChainToAsync(refactoredCode);
    if (promiseResult.changed) {
      changes.push({
        type: 'convert-to-async',
        description: 'Converted Promise.then() to async/await',
        before: refactoredCode,
        after: promiseResult.code,
      });
      refactoredCode = promiseResult.code;
    }

    return createSuccessResult(refactoredCode, changes, REFACTORING_MESSAGES.NO_CALLBACKS_FOUND);
  } catch (error) {
    return createErrorResult(options.code, error, 'Unknown error during async conversion');
  }
}

/**
 * Simplify nested conditionals and complex if/else chains
 */
export function simplifyConditionals(options: SimplifyConditionalsOptions): RefactoringResult {
  try {
    const { code, useGuardClauses = true, useTernary = true } = options;

    // Validate code size
    const sizeError = validateCodeSize(code, REFACTORING_LIMITS.MAX_CODE_SIZE);
    if (sizeError) return sizeError;

    let refactoredCode = code;
    const changes: RefactoringChange[] = [];

    if (useGuardClauses) {
      const guardClauseResult = applyGuardClauses(refactoredCode);
      if (guardClauseResult.changed) {
        refactoredCode = guardClauseResult.code;
        changes.push({
          type: 'simplify-conditionals',
          description: 'Applied guard clauses for early returns',
        });
      }
    }

    if (useTernary) {
      // Build ternary pattern with line breaks for readability
      const conditionLimit = REGEX_LIMITS.MAX_CONDITION_LENGTH;
      const returnLimit = REGEX_LIMITS.MAX_RETURN_VALUE_LENGTH;
      const ternaryPattern = new RegExp(
        `if\\s?\\(([^)]{1,${conditionLimit}})\\)\\s?\\{\\s?` +
          `return\\s+([^;]{1,${returnLimit}});\\s?\\}\\s?` +
          `else\\s?\\{\\s?return\\s+([^;]{1,${returnLimit}});\\s?\\}`,
        'g'
      );

      const originalCode = refactoredCode;
      refactoredCode = refactoredCode.replace(ternaryPattern, 'return $1 ? $2 : $3;');

      if (refactoredCode !== originalCode) {
        changes.push({
          type: 'simplify-conditionals',
          description: 'Converted if/else to ternary operator',
        });
      }
    }

    const combinedResult = combineNestedConditions(refactoredCode);
    if (combinedResult.changed) {
      refactoredCode = combinedResult.code;
      changes.push({
        type: 'simplify-conditionals',
        description: 'Combined nested conditions',
      });
    }

    return createSuccessResult(refactoredCode, changes, REFACTORING_MESSAGES.NO_CONDITIONALS_FOUND);
  } catch (error) {
    return createErrorResult(
      options.code,
      error,
      'Unknown error during conditional simplification'
    );
  }
}

/**
 * Remove dead code including unused variables, unreachable code, and unused imports
 */
export function removeDeadCode(options: RemoveDeadCodeOptions): RefactoringResult {
  try {
    const { code, removeUnusedImports = true, removeUnreachable = true } = options;
    let refactoredCode = code;
    const changes: RefactoringChange[] = [];

    // Remove unused variables
    const unusedVars = findUnusedVariables(refactoredCode);
    if (unusedVars.length > 0) {
      const after = removeUnusedVariables(refactoredCode, unusedVars);
      const varList = unusedVars.join(', ');
      changes.push({
        type: 'remove-dead-code',
        description: `Removed ${unusedVars.length} unused variable(s): ${varList}`,
        before: refactoredCode,
        after,
      });
      refactoredCode = after;
    }

    // Remove unreachable code
    if (removeUnreachable) {
      const unreachableResult = removeUnreachableCode(refactoredCode);
      if (unreachableResult.removed > 0) {
        const count = unreachableResult.removed;
        changes.push({
          type: 'remove-dead-code',
          description: `Removed ${count} unreachable line(s) after return statements`,
          before: refactoredCode,
          after: unreachableResult.code,
        });
        refactoredCode = unreachableResult.code;
      }
    }

    // Remove unused imports
    if (removeUnusedImports) {
      const importResult = removeUnusedImportsFromCode(refactoredCode);
      const hasRemovedImports = importResult.removed.length > PATTERN_CONSTANTS.NO_OCCURRENCES;

      if (hasRemovedImports) {
        refactoredCode = importResult.code;
        const importList = importResult.removed.join(', ');
        changes.push({
          type: 'remove-dead-code',
          description: `Removed ${importResult.removed.length} unused import(s): ${importList}`,
        });
      }
    }

    return createSuccessResult(refactoredCode, changes, REFACTORING_MESSAGES.NO_DEAD_CODE_FOUND);
  } catch (error) {
    return createErrorResult(options.code, error, 'Unknown error during dead code removal');
  }
}

/**
 * Apply design patterns to code
 */
export function applyDesignPattern(options: ApplyPatternOptions): RefactoringResult {
  try {
    const { code, pattern, patternOptions = {} } = options;

    if (!isValidPattern(pattern)) {
      return createValidationError(code, REFACTORING_MESSAGES.INVALID_PATTERN);
    }

    const refactoredCode = applyPattern(pattern, code, patternOptions);

    return createSingleChangeResult(
      code,
      refactoredCode,
      'apply-pattern',
      `Applied ${pattern} pattern`
    );
  } catch (error) {
    return createErrorResult(options.code, error, 'Unknown error during pattern application');
  }
}

/**
 * Rename a variable consistently throughout code
 */
export function renameVariable(options: RenameVariableOptions): RefactoringResult {
  try {
    const { code, oldName, newName, includeComments = false } = options;

    if (!oldName || !newName) {
      return createValidationError(code, 'Old name and new name are required');
    }

    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(newName)) {
      return createValidationError(code, REFACTORING_MESSAGES.INVALID_VARIABLE_NAME);
    }

    const wordBoundary = `\\b${escapeRegExp(oldName)}\\b`;
    const pattern = new RegExp(wordBoundary, 'g');

    let refactoredCode = code;
    const matches = (code.match(pattern) || []).length;

    if (matches === PATTERN_CONSTANTS.NO_OCCURRENCES) {
      return createValidationError(code, REFACTORING_MESSAGES.VARIABLE_NOT_FOUND);
    }

    refactoredCode = refactoredCode.replace(pattern, newName);

    if (includeComments) {
      const commentPattern = new RegExp(`(//.*?|/\\*[\\s\\S]*?\\*/)`, 'g');
      refactoredCode = refactoredCode.replace(commentPattern, match => {
        return match.replace(new RegExp(oldName, 'g'), newName);
      });
    }

    // Build description with proper pluralization
    const occurrenceSuffix = matches > PATTERN_CONSTANTS.SINGLE_OCCURRENCE ? 's' : '';
    const description = `Renamed '${oldName}' to '${newName}' (${matches} occurrence${occurrenceSuffix})`;

    return createSingleChangeResult(code, refactoredCode, 'rename-variable', description);
  } catch (error) {
    return createErrorResult(options.code, error, 'Unknown error during variable renaming');
  }
}

/**
 * Suggest refactorings based on code analysis
 */
export function suggestRefactorings(code: string, _filePath?: string): RefactoringSuggestion[] {
  const suggestions: RefactoringSuggestion[] = [];
  const lines = code.split('\n');

  // Check for long functions
  const functionMetrics = analyzeFunctionLengths(code);
  functionMetrics.forEach(metric => {
    if (metric.lineCount > REFACTORING_LIMITS.MAX_FUNCTION_LENGTH) {
      suggestions.push({
        type: 'extract-function',
        severity: 'warning',
        message: `Function '${metric.name}' is ${metric.lineCount} lines long`,
        location: { line: metric.startLine },
        rationale:
          'Long functions are harder to understand and maintain. Consider extracting smaller functions.',
      });
    }
  });

  // Check for nested conditionals
  lines.forEach((line, index) => {
    const nestingDepth = getNestingDepth(lines, index);
    if (nestingDepth > REFACTORING_LIMITS.MAX_COMPLEXITY_THRESHOLD) {
      suggestions.push({
        type: 'simplify-conditionals',
        severity: 'warning',
        message: `Deep nesting detected (depth: ${nestingDepth})`,
        location: { line: index + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET },
        snippet: line.trim(),
        rationale:
          'Deep nesting reduces readability. Consider using guard clauses or extracting functions.',
      });
    }
  });

  // Check for callback patterns
  if (code.includes('(err,') || code.includes('callback(')) {
    const callbackLines = lines
      .map((line, idx) => ({ line, idx }))
      .filter(({ line }) => line.includes('(err,') || line.includes('callback('));

    callbackLines.forEach(({ line, idx }) => {
      suggestions.push({
        type: 'convert-to-async',
        severity: 'info',
        message: 'Callback detected - consider converting to async/await',
        location: { line: idx + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET },
        snippet: line.trim(),
        rationale: 'Async/await provides better error handling and readability than callbacks.',
      });
    });
  }

  // Check for duplicate code blocks
  const duplicates = findDuplicateBlocks(code);
  duplicates.forEach(dup => {
    suggestions.push({
      type: 'extract-function',
      severity: 'warning',
      message: 'Duplicate code block detected',
      location: { line: dup.line1, endLine: dup.line2 },
      rationale: 'Duplicate code violates DRY principle. Consider extracting to a shared function.',
    });
  });

  return suggestions;
}
