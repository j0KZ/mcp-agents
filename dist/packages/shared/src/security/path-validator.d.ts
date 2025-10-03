/**
 * Path validation and sanitization utilities
 * Prevents path traversal and other file system attacks
 */
/**
 * Error thrown when path validation fails
 */
export declare class PathValidationError extends Error {
    readonly attemptedPath: string;
    constructor(message: string, attemptedPath: string);
}
/**
 * Validates that a path doesn't contain path traversal sequences
 * @param inputPath - The path to validate
 * @throws PathValidationError if path contains traversal sequences
 */
export declare function validateNoTraversal(inputPath: string): void;
/**
 * Validates that a path exists and is within an allowed directory
 * @param inputPath - The path to validate
 * @param allowedRoot - Optional root directory that the path must be within
 * @returns The absolute, normalized path
 * @throws PathValidationError if validation fails
 */
export declare function validatePath(inputPath: string, allowedRoot?: string): string;
/**
 * Validates a file path and ensures it exists
 * @param filePath - The file path to validate
 * @param allowedRoot - Optional root directory
 * @returns The validated absolute path
 * @throws PathValidationError if validation fails or file doesn't exist
 */
export declare function validateFilePath(filePath: string, allowedRoot?: string): string;
/**
 * Validates a directory path and ensures it exists
 * @param dirPath - The directory path to validate
 * @param allowedRoot - Optional root directory
 * @returns The validated absolute path
 * @throws PathValidationError if validation fails or directory doesn't exist
 */
export declare function validateDirectoryPath(dirPath: string, allowedRoot?: string): string;
/**
 * Sanitizes a filename by removing potentially dangerous characters
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
export declare function sanitizeFilename(filename: string): string;
//# sourceMappingURL=path-validator.d.ts.map