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
  DesignPattern,
} from './types.js';

import {
  REFACTORING_LIMITS,
  REFACTORING_MESSAGES,
  PATTERN_CONSTANTS,
  INDEX_CONSTANTS,
} from './constants/refactoring-limits.js';

// Re-export from modular components
export { extractFunction } from './core/extract-function.js';
export { calculateMetrics, findDuplicateBlocks } from './analysis/metrics-calculator.js';

// Import for internal use
import { findDuplicateBlocks, getNestingDepth } from './analysis/metrics-calculator.js';
import {
  applySingletonPattern,
  applyFactoryPattern,
  applyObserverPattern,
  applyStrategyPattern,
  applyDecoratorPattern,
  applyAdapterPattern,
  applyFacadePattern,
  applyProxyPattern,
  applyCommandPattern,
  applyChainOfResponsibilityPattern,
} from './patterns/index.js';

import { applyGuardClauses, combineNestedConditions } from './transformations/conditional-helpers.js';
import { removeUnusedImportsFromCode, escapeRegExp } from './transformations/import-helpers.js';
import { analyzeFunctionLengths } from './transformations/analysis-helpers.js';
import { getErrorMessage } from './utils/error-helpers.js';

/**
 * Convert callback-based code to async/await
 */
export function convertToAsync(options: ConvertToAsyncOptions): RefactoringResult {
  try {
    const { code, useTryCatch = true } = options;

    if (code.length > REFACTORING_LIMITS.MAX_CODE_SIZE) {
      return {
        code,
        changes: [],
        success: false,
        error: REFACTORING_MESSAGES.CODE_TOO_LARGE,
      };
    }

    let refactoredCode = code;
    const changes: RefactoringChange[] = [];

    const callbackPattern = /(\w+)\s?\(\s?\(err,\s?(\w+)\)\s?=>\s?\{/g;

    if (callbackPattern.test(code)) {
      refactoredCode = refactoredCode.replace(/function\s+(\w+)\s*\(/g, 'async function $1(');
      callbackPattern.lastIndex = PATTERN_CONSTANTS.REGEX_RESET_INDEX;

      refactoredCode = refactoredCode.replace(
        callbackPattern,
        (_match, fn, dataVar) => {
          return useTryCatch
            ? `try {\n  const ${dataVar} = await ${fn}();\n`
            : `const ${dataVar} = await ${fn}();\n`;
        }
      );

      if (useTryCatch) {
        refactoredCode = refactoredCode.replace(/}\s*\);?\s*$/, '} catch (err) {\n  // Handle error\n  throw err;\n}');
      }

      changes.push({
        type: 'convert-to-async',
        description: 'Converted callback-based code to async/await',
        before: code,
        after: refactoredCode,
      });
    }

    // Convert Promise.then chains
    const promisePattern = /\.then\s?\(\s?\((\w+)\)\s?=>\s?\{([^}]{1,500})\}\s?\)/g;
    if (promisePattern.test(refactoredCode)) {
      promisePattern.lastIndex = PATTERN_CONSTANTS.REGEX_RESET_INDEX;
      refactoredCode = refactoredCode.replace(/function\s+(\w+)\s*\(/g, 'async function $1(');

      refactoredCode = refactoredCode.replace(
        promisePattern,
        ';\n  const $1 = await promise;\n  $2'
      );

      changes.push({
        type: 'convert-to-async',
        description: 'Converted Promise.then() to async/await',
      });
    }

    return {
      code: refactoredCode,
      changes,
      success: true,
      warnings: changes.length === PATTERN_CONSTANTS.NO_OCCURRENCES ? [REFACTORING_MESSAGES.NO_CALLBACKS_FOUND] : undefined,
    };
  } catch (error) {
    return {
      code: options.code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during async conversion'),
    };
  }
}

/**
 * Simplify nested conditionals and complex if/else chains
 */
export function simplifyConditionals(options: SimplifyConditionalsOptions): RefactoringResult {
  try {
    const { code, useGuardClauses = true, useTernary = true } = options;

    if (code.length > REFACTORING_LIMITS.MAX_CODE_SIZE) {
      return {
        code,
        changes: [],
        success: false,
        error: REFACTORING_MESSAGES.CODE_TOO_LARGE,
      };
    }

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
      const ternaryPattern = /if\s?\(([^)]{1,200})\)\s?\{\s?return\s+([^;]{1,200});\s?\}\s?else\s?\{\s?return\s+([^;]{1,200});\s?\}/g;
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

    return {
      code: refactoredCode,
      changes,
      success: true,
      warnings: changes.length === PATTERN_CONSTANTS.NO_OCCURRENCES ? [REFACTORING_MESSAGES.NO_CONDITIONALS_FOUND] : undefined,
    };
  } catch (error) {
    return {
      code: options.code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during conditional simplification'),
    };
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

    if (removeUnreachable) {
      const lines = refactoredCode.split('\n');
      const cleanedLines: string[] = [];
      let skipUntilBrace = false;

      for (let i = INDEX_CONSTANTS.FIRST_ARRAY_INDEX; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (skipUntilBrace) {
          if (trimmed.startsWith('}')) {
            skipUntilBrace = false;
            cleanedLines.push(line);
          }
          continue;
        }

        cleanedLines.push(line);

        if (trimmed.startsWith('return ') || trimmed === 'return;') {
          let hasCodeAfterReturn = false;
          for (let j = i + INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (nextLine.startsWith('}')) break;
            if (nextLine && !nextLine.startsWith('//')) {
              hasCodeAfterReturn = true;
              break;
            }
          }
          if (hasCodeAfterReturn) {
            skipUntilBrace = true;
            changes.push({
              type: 'remove-dead-code',
              description: 'Removed unreachable code after return statement',
              lineRange: { start: i + INDEX_CONSTANTS.DEAD_CODE_LINE_OFFSET, end: i + INDEX_CONSTANTS.DEAD_CODE_LINE_OFFSET },
            });
          }
        }
      }

      refactoredCode = cleanedLines.join('\n');
    }

    if (removeUnusedImports) {
      const importResult = removeUnusedImportsFromCode(refactoredCode);
      if (importResult.removed.length > PATTERN_CONSTANTS.NO_OCCURRENCES) {
        refactoredCode = importResult.code;
        changes.push({
          type: 'remove-dead-code',
          description: `Removed ${importResult.removed.length} unused import(s): ${importResult.removed.join(', ')}`,
        });
      }
    }

    return {
      code: refactoredCode,
      changes,
      success: true,
      warnings: changes.length === PATTERN_CONSTANTS.NO_OCCURRENCES ? [REFACTORING_MESSAGES.NO_DEAD_CODE_FOUND] : undefined,
    };
  } catch (error) {
    return {
      code: options.code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during dead code removal'),
    };
  }
}

/**
 * Apply design patterns to code
 */
export function applyDesignPattern(options: ApplyPatternOptions): RefactoringResult {
  try {
    const { code, pattern, patternOptions = {} } = options;

    const patternMap: Record<DesignPattern, (code: string, options: any) => string> = {
      singleton: applySingletonPattern,
      factory: applyFactoryPattern,
      observer: applyObserverPattern,
      strategy: applyStrategyPattern,
      decorator: applyDecoratorPattern,
      adapter: applyAdapterPattern,
      facade: applyFacadePattern,
      proxy: applyProxyPattern,
      command: applyCommandPattern,
      'chain-of-responsibility': applyChainOfResponsibilityPattern,
    };

    const applyFunction = patternMap[pattern];
    if (!applyFunction) {
      return {
        code,
        changes: [],
        success: false,
        error: REFACTORING_MESSAGES.INVALID_PATTERN,
      };
    }

    const refactoredCode = applyFunction(code, patternOptions);

    return {
      code: refactoredCode,
      changes: [{
        type: 'apply-pattern',
        description: `Applied ${pattern} pattern`,
        before: code,
        after: refactoredCode,
      }],
      success: true,
    };
  } catch (error) {
    return {
      code: options.code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during pattern application'),
    };
  }
}

/**
 * Rename a variable consistently throughout code
 */
export function renameVariable(options: RenameVariableOptions): RefactoringResult {
  try {
    const { code, oldName, newName, includeComments = false } = options;

    if (!oldName || !newName) {
      return {
        code,
        changes: [],
        success: false,
        error: 'Old name and new name are required',
      };
    }

    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(newName)) {
      return {
        code,
        changes: [],
        success: false,
        error: REFACTORING_MESSAGES.INVALID_VARIABLE_NAME,
      };
    }

    const wordBoundary = `\\b${escapeRegExp(oldName)}\\b`;
    const pattern = new RegExp(wordBoundary, 'g');

    let refactoredCode = code;
    const matches = (code.match(pattern) || []).length;

    if (matches === PATTERN_CONSTANTS.NO_OCCURRENCES) {
      return {
        code,
        changes: [],
        success: false,
        error: REFACTORING_MESSAGES.VARIABLE_NOT_FOUND,
      };
    }

    refactoredCode = refactoredCode.replace(pattern, newName);

    if (includeComments) {
      const commentPattern = new RegExp(`(//.*?|/\\*[\\s\\S]*?\\*/)`, 'g');
      refactoredCode = refactoredCode.replace(commentPattern, (match) => {
        return match.replace(new RegExp(oldName, 'g'), newName);
      });
    }

    return {
      code: refactoredCode,
      changes: [{
        type: 'rename-variable',
        description: `Renamed '${oldName}' to '${newName}' (${matches} occurrence${matches > PATTERN_CONSTANTS.SINGLE_OCCURRENCE ? 's' : ''})`,
        before: code,
        after: refactoredCode,
      }],
      success: true,
    };
  } catch (error) {
    return {
      code: options.code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during variable renaming'),
    };
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
        rationale: 'Long functions are harder to understand and maintain. Consider extracting smaller functions.',
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
        rationale: 'Deep nesting reduces readability. Consider using guard clauses or extracting functions.',
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
