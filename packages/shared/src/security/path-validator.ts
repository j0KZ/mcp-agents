/**
 * Path validation and sanitization utilities
 * Prevents path traversal and other file system attacks
 */

import * as path from 'path';
import * as fs from 'fs';

/**
 * Error thrown when path validation fails
 */
export class PathValidationError extends Error {
  constructor(message: string, public readonly attemptedPath: string) {
    super(message);
    this.name = 'PathValidationError';
  }
}

/**
 * Validates that a path doesn't contain path traversal sequences
 * @param inputPath - The path to validate
 * @throws PathValidationError if path contains traversal sequences
 */
export function validateNoTraversal(inputPath: string): void {
  // Normalize the path to resolve any . or .. segments
  const normalized = path.normalize(inputPath);

  // Check for path traversal patterns
  if (normalized.includes('..')) {
    throw new PathValidationError(
      'Path traversal detected: path contains ".." sequence',
      inputPath
    );
  }

  // Check for absolute path attempts on Unix (starting with /)
  // and on Windows (starting with drive letter)
  const isAbsoluteUnix = normalized.startsWith('/');
  const isAbsoluteWindows = /^[a-zA-Z]:/.test(normalized);

  // Allow absolute paths but ensure they're properly formed
  if (isAbsoluteUnix || isAbsoluteWindows) {
    // Absolute paths are okay, just ensure no traversal
    const parts = normalized.split(path.sep);
    if (parts.some(part => part === '..')) {
      throw new PathValidationError(
        'Path traversal detected in absolute path',
        inputPath
      );
    }
  }
}

/**
 * Validates that a path exists and is within an allowed directory
 * @param inputPath - The path to validate
 * @param allowedRoot - Optional root directory that the path must be within
 * @returns The absolute, normalized path
 * @throws PathValidationError if validation fails
 */
export function validatePath(inputPath: string, allowedRoot?: string): string {
  // First check for traversal
  validateNoTraversal(inputPath);

  // Resolve to absolute path
  const absolutePath = path.resolve(inputPath);

  // If allowedRoot is specified, ensure the path is within it
  if (allowedRoot) {
    const absoluteRoot = path.resolve(allowedRoot);
    const relativePath = path.relative(absoluteRoot, absolutePath);

    // If relative path starts with .., it's outside the allowed root
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      throw new PathValidationError(
        `Path is outside allowed directory: ${allowedRoot}`,
        inputPath
      );
    }
  }

  return absolutePath;
}

/**
 * Validates a file path and ensures it exists
 * @param filePath - The file path to validate
 * @param allowedRoot - Optional root directory
 * @returns The validated absolute path
 * @throws PathValidationError if validation fails or file doesn't exist
 */
export function validateFilePath(filePath: string, allowedRoot?: string): string {
  const validated = validatePath(filePath, allowedRoot);

  if (!fs.existsSync(validated)) {
    throw new PathValidationError(
      'File does not exist',
      filePath
    );
  }

  if (!fs.statSync(validated).isFile()) {
    throw new PathValidationError(
      'Path is not a file',
      filePath
    );
  }

  return validated;
}

/**
 * Validates a directory path and ensures it exists
 * @param dirPath - The directory path to validate
 * @param allowedRoot - Optional root directory
 * @returns The validated absolute path
 * @throws PathValidationError if validation fails or directory doesn't exist
 */
export function validateDirectoryPath(dirPath: string, allowedRoot?: string): string {
  const validated = validatePath(dirPath, allowedRoot);

  if (!fs.existsSync(validated)) {
    throw new PathValidationError(
      'Directory does not exist',
      dirPath
    );
  }

  if (!fs.statSync(validated).isDirectory()) {
    throw new PathValidationError(
      'Path is not a directory',
      dirPath
    );
  }

  return validated;
}

/**
 * Sanitizes a filename by removing potentially dangerous characters
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  return filename
    .replace(/[/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/\.\./g, '')
    // Limit to alphanumeric, dots, dashes, underscores
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255); // Limit length
}
