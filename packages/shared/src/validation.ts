/**
 * Shared validation utilities for MCP tools
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * Validate file path input
 */
export function validateFilePathInput(filePath: unknown, toolPrefix: string): ValidationResult {
  if (!filePath || typeof filePath !== 'string') {
    return {
      valid: false,
      errorCode: `${toolPrefix}_001`,
      error: 'Invalid file path. Please provide a valid string path.',
    };
  }

  // Check for empty path after trimming
  if (filePath.trim().length === 0) {
    return {
      valid: false,
      errorCode: `${toolPrefix}_001`, // Use 001 for invalid/empty input
      error: 'File path cannot be empty.',
    };
  }

  // Check for path traversal attempts (both Unix / and Windows \)
  if (filePath.includes('..') && (filePath.includes('/') || filePath.includes('\\'))) {
    return {
      valid: false,
      errorCode: `${toolPrefix}_003`,
      error: 'Invalid file path. Path traversal detected.',
    };
  }

  return { valid: true };
}

/**
 * Validate file content
 */
export function validateFileContent(
  content: string,
  filePath: string,
  maxSizeKB: number = 1000
): ValidationResult {
  if (typeof content !== 'string') {
    return {
      valid: false,
      error: `Invalid file content from ${filePath}.`,
    };
  }

  if (content.length === 0 || content.trim().length === 0) {
    return {
      valid: false,
      error: `File is empty: ${filePath}. Cannot process empty file.`,
    };
  }

  const sizeKB = content.length / 1024;
  if (sizeKB > maxSizeKB) {
    return {
      valid: false,
      error: `File too large: ${filePath} (${sizeKB.toFixed(2)} KB). Maximum size is ${maxSizeKB} KB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate identifier (variable, function name, etc.)
 */
export function validateIdentifier(name: unknown): ValidationResult {
  if (!name || typeof name !== 'string') {
    return {
      valid: false,
      error: 'Identifier must be a non-empty string.',
    };
  }

  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    return {
      valid: false,
      error: `Invalid identifier '${name}'. Must start with a letter, underscore, or $ and contain only alphanumeric characters.`,
    };
  }

  // Check against reserved keywords
  const reserved = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
  ];

  if (reserved.includes(name)) {
    return {
      valid: false,
      error: `Invalid identifier '${name}'. Cannot use reserved keyword.`,
    };
  }

  return { valid: true };
}

/**
 * Validate line range
 */
export function validateLineRange(
  startLine: number,
  endLine: number,
  totalLines: number
): ValidationResult {
  if (typeof startLine !== 'number' || typeof endLine !== 'number') {
    return {
      valid: false,
      error: 'Line numbers must be integers.',
    };
  }

  if (startLine < 1 || endLine < 1) {
    return {
      valid: false,
      error: 'Line numbers must be positive (starting from 1).',
    };
  }

  if (startLine > endLine) {
    return {
      valid: false,
      error: `Invalid range: startLine (${startLine}) must be <= endLine (${endLine}).`,
    };
  }

  if (endLine > totalLines) {
    return {
      valid: false,
      error: `Line ${endLine} exceeds file length (${totalLines} lines).`,
    };
  }

  return { valid: true };
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  validValues: T[],
  fieldName: string
): ValidationResult {
  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string.`,
    };
  }

  if (!validValues.includes(value as T)) {
    return {
      valid: false,
      error: `Invalid ${fieldName}: '${value}'. Valid options: ${validValues.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate percentage (0-100)
 */
export function validatePercentage(value: unknown, fieldName: string = 'value'): ValidationResult {
  if (typeof value !== 'number') {
    return {
      valid: false,
      error: `${fieldName} must be a number.`,
    };
  }

  if (value < 0 || value > 100) {
    return {
      valid: false,
      error: `${fieldName} must be between 0 and 100 (got ${value}).`,
    };
  }

  return { valid: true };
}

/**
 * Check if string contains valid code (basic syntax check)
 */
export function looksLikeCode(content: string): boolean {
  // Basic heuristics to detect if content looks like code
  const codePatterns = [
    /function\s+\w+/,
    /class\s+\w+/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /import\s+.*from/,
    /export\s+(default|const|function|class)/,
    /=>\s*{/,
    /\(\s*\)\s*=>/,
  ];

  return codePatterns.some(pattern => pattern.test(content));
}

/**
 * Sanitize error messages to prevent information leakage
 */
export function sanitizeErrorMessage(error: Error, includeStack: boolean = false): string {
  let message = error.message;

  // Remove absolute paths
  message = message.replace(/[A-Z]:\\[\w\\]+/g, '[path]');
  message = message.replace(/\/[\w/]+/g, '[path]');

  if (includeStack && error.stack) {
    let stack = error.stack;
    stack = stack.replace(/[A-Z]:\\[\w\\]+/g, '[path]');
    stack = stack.replace(/\/[\w/]+/g, '[path]');
    return `${message}\n\nStack trace:\n${stack}`;
  }

  return message;
}

/**
 * Create user-friendly error with code and suggestion
 */
export interface FriendlyError {
  code: string;
  message: string;
  suggestion?: string;
  details?: Record<string, unknown>;
}

export function createError(
  code: string,
  message: string,
  suggestion?: string,
  details?: Record<string, unknown>
): FriendlyError {
  return {
    code,
    message,
    suggestion,
    details,
  };
}

/**
 * Validate project path (similar to file path but used for directories)
 */
export function validateProjectPath(projectPath: unknown): ValidationResult {
  if (!projectPath || typeof projectPath !== 'string') {
    return {
      valid: false,
      error: 'Invalid project path. Please provide a valid string path.',
    };
  }

  if (projectPath.trim().length === 0) {
    return {
      valid: false,
      error: 'Project path cannot be empty.',
    };
  }

  // Check for path traversal attempts (both Unix / and Windows \)
  if (projectPath.includes('..') && (projectPath.includes('/') || projectPath.includes('\\'))) {
    return {
      valid: false,
      error: 'Invalid project path. Path traversal detected.',
    };
  }

  return { valid: true };
}

/**
 * Validate framework/tool name against a list of valid options
 */
export function validateFramework(framework: unknown, validFrameworks: string[]): ValidationResult {
  if (!framework || typeof framework !== 'string') {
    return {
      valid: false,
      error: 'Framework must be a string.',
    };
  }

  if (!validFrameworks.includes(framework)) {
    return {
      valid: false,
      error: `Unsupported framework '${framework}'. Valid options: ${validFrameworks.join(', ')}`,
    };
  }

  return { valid: true };
}
