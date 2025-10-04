/**
 * Utilities for converting callback/promise code to async/await
 */

import { PATTERN_CONSTANTS } from '../constants/refactoring-limits.js';
import { REGEX_LIMITS } from '../constants/transformation-limits.js';

/**
 * Convert callback-based code to async/await
 */
export function convertCallbackToAsync(code: string, useTryCatch: boolean): {
  code: string;
  changed: boolean;
} {
  const callbackPattern = /(\w+)\s?\(\s?\(err,\s?(\w+)\)\s?=>\s?\{/g;

  if (!callbackPattern.test(code)) {
    return { code, changed: false };
  }

  let result = code;

  // Make functions async
  result = result.replace(/function\s+(\w+)\s*\(/g, 'async function $1(');

  // Reset regex index after test
  callbackPattern.lastIndex = PATTERN_CONSTANTS.REGEX_RESET_INDEX;

  // Convert callback pattern to await
  result = result.replace(
    callbackPattern,
    (_match, fn, dataVar) => {
      return useTryCatch
        ? `try {\n  const ${dataVar} = await ${fn}();\n`
        : `const ${dataVar} = await ${fn}();\n`;
    }
  );

  // Add catch block if requested
  if (useTryCatch) {
    result = result.replace(/}\s*\);?\s*$/, '} catch (err) {\n  // Handle error\n  throw err;\n}');
  }

  return { code: result, changed: true };
}

/**
 * Convert Promise.then chains to async/await
 */
export function convertPromiseChainToAsync(code: string): {
  code: string;
  changed: boolean;
} {
  const promisePattern = new RegExp(
    `\\.then\\s?\\(\\s?\\((\\w+)\\)\\s?=>\\s?\\{([^}]{1,${REGEX_LIMITS.MAX_PROMISE_CALLBACK_LENGTH}})\\}\\s?\\)`,
    'g'
  );

  if (!promisePattern.test(code)) {
    return { code, changed: false };
  }

  let result = code;

  // Reset regex index after test
  promisePattern.lastIndex = PATTERN_CONSTANTS.REGEX_RESET_INDEX;

  // Make functions async
  result = result.replace(/function\s+(\w+)\s*\(/g, 'async function $1(');

  // Convert .then() to await
  result = result.replace(
    promisePattern,
    ';\n  const $1 = await promise;\n  $2'
  );

  return { code: result, changed: true };
}

/**
 * Wrap code in try/catch block
 */
export function wrapInTryCatch(code: string, errorHandler?: string): string {
  const defaultHandler = errorHandler || '// Handle error\n  throw err;';
  return `try {\n${code}\n} catch (err) {\n  ${defaultHandler}\n}`;
}
