import { getErrorMessage } from '../utils/error-helpers.js';
import { CODE_LIMITS, INDEX_CONSTANTS } from '../constants/refactoring-limits.js';

/**
 * Extract Function Refactoring
 *
 * Extracts a code block into a separate function with automatic parameter detection.
 */

import { RefactoringResult, RefactoringChange, ExtractFunctionOptions } from '../types.js';

/**
 * Analyze a code block to determine parameters and return value
 */
function analyzeCodeBlock(code: string): { parameters: string[]; returnValue: string | null } {
  const variables = new Set<string>();
  const declarations = new Set<string>();

  // Find variable usages
  const usagePattern = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
  let match;
  while ((match = usagePattern.exec(code)) !== null) {
    const varName = match[1];
    if (!['if', 'else', 'for', 'while', 'return', 'const', 'let', 'var'].includes(varName)) {
      variables.add(varName);
    }
  }

  // Find variable declarations
  const declPattern = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = declPattern.exec(code)) !== null) {
    declarations.add(match[1]);
  }

  // Parameters are variables used but not declared
  const parameters = Array.from(variables).filter(v => !declarations.has(v));

  // Check for return value
  const returnMatch = code.match(/return\s+([^;]+);?/);
  const returnValue = returnMatch ? returnMatch[1].trim() : null;

  return { parameters, returnValue };
}

/**
 * Get the indentation of a line
 */
function getIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Extract a code block into a separate function
 *
 * @param code - Source code containing the block to extract
 * @param options - Extraction options including function name and line range
 * @returns Refactoring result with extracted function
 *
 * @example
 * ```typescript
 * const result = extractFunction(sourceCode, {
 *   functionName: 'calculateTotal',
 *   startLine: 10,
 *   endLine: 15
 * });
 * ```
 */
export function extractFunction(code: string, options: ExtractFunctionOptions): RefactoringResult {
  try {
    // Validate inputs
    if (!code || typeof code !== 'string') {
      return {
        code: '',
        changes: [],
        success: false,
        error: 'REFACTOR_001: Invalid code input. Code must be a non-empty string.',
      };
    }

    if (code.length > CODE_LIMITS.MAX_CODE_SIZE) {
      return {
        code,
        changes: [],
        success: false,
        error: `REFACTOR_002: Code too large (${(code.length / CODE_LIMITS.BYTES_TO_KB).toFixed(2)} KB). Maximum size is 100 KB.`,
      };
    }

    const { functionName, startLine, endLine, async = false, arrow = false } = options;

    // Validate function name
    if (!functionName || typeof functionName !== 'string') {
      return {
        code,
        changes: [],
        success: false,
        error: 'REFACTOR_003: Invalid function name. Please provide a valid function name.',
      };
    }

    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(functionName)) {
      return {
        code,
        changes: [],
        success: false,
        error: `REFACTOR_004: Invalid function name '${functionName}'. Function names must start with a letter, underscore, or $ and contain only alphanumeric characters.`,
      };
    }

    const lines = code.split('\n');

    // Validate line range
    if (!startLine || !endLine || typeof startLine !== 'number' || typeof endLine !== 'number') {
      return {
        code,
        changes: [],
        success: false,
        error: 'REFACTOR_005: Invalid line range. startLine and endLine must be numbers.',
      };
    }

    if (
      startLine < INDEX_CONSTANTS.FIRST_LINE_NUMBER ||
      endLine > lines.length ||
      startLine > endLine
    ) {
      return {
        code,
        changes: [],
        success: false,
        error: `REFACTOR_006: Invalid line range (${startLine}-${endLine}). Valid range is ${INDEX_CONSTANTS.FIRST_LINE_NUMBER}-${lines.length}, and startLine must be <= endLine.`,
      };
    }

    // Extract the code block (convert to 0-indexed)
    const extractedLines = lines.slice(startLine - INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET, endLine);
    const extractedCode = extractedLines.join('\n');

    // Analyze variables used in the extracted code
    const { parameters, returnValue } = analyzeCodeBlock(extractedCode);

    // Generate function signature
    const asyncKeyword = async ? 'async ' : '';
    const functionDeclaration = arrow
      ? `const ${functionName} = ${asyncKeyword}(${parameters.join(', ')}) => {`
      : `${asyncKeyword}function ${functionName}(${parameters.join(', ')}) {`;

    // Build the extracted function
    const indentation = getIndentation(lines[startLine - INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET]);
    const functionBody = extractedLines.map(line => indentation + line).join('\n');
    const returnStatement = returnValue ? `\n${indentation}  return ${returnValue};` : '';
    const extractedFunction = `${indentation}${functionDeclaration}\n${functionBody}${returnStatement}\n${indentation}}`;

    // Generate function call
    const functionCall = returnValue
      ? `${indentation}const result = ${async ? 'await ' : ''}${functionName}(${parameters.join(', ')});`
      : `${indentation}${async ? 'await ' : ''}${functionName}(${parameters.join(', ')});`;

    // Replace original code with function call
    const newLines = [
      ...lines.slice(
        INDEX_CONSTANTS.FIRST_ARRAY_INDEX,
        startLine - INDEX_CONSTANTS.LINE_TO_ARRAY_OFFSET
      ),
      functionCall,
      ...lines.slice(endLine),
      '',
      extractedFunction,
    ];

    const changes: RefactoringChange[] = [
      {
        type: 'extract-function',
        description: `Extracted function '${functionName}' from lines ${startLine}-${endLine}`,
        lineRange: { start: startLine, end: endLine },
        before: extractedCode,
        after: extractedFunction,
      },
    ];

    return {
      code: newLines.join('\n'),
      changes,
      success: true,
    };
  } catch (error) {
    return {
      code,
      changes: [],
      success: false,
      error: getErrorMessage(error, 'Unknown error during function extraction'),
    };
  }
}
