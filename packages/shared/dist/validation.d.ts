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
export declare function validateFilePathInput(filePath: unknown, toolPrefix: string): ValidationResult;
/**
 * Validate file content
 */
export declare function validateFileContent(content: string, filePath: string, maxSizeKB?: number): ValidationResult;
/**
 * Validate identifier (variable, function name, etc.)
 */
export declare function validateIdentifier(name: unknown): ValidationResult;
/**
 * Validate line range
 */
export declare function validateLineRange(startLine: number, endLine: number, totalLines: number): ValidationResult;
/**
 * Validate enum value
 */
export declare function validateEnum<T extends string>(value: unknown, validValues: T[], fieldName: string): ValidationResult;
/**
 * Validate percentage (0-100)
 */
export declare function validatePercentage(value: unknown, fieldName?: string): ValidationResult;
/**
 * Check if string contains valid code (basic syntax check)
 */
export declare function looksLikeCode(content: string): boolean;
/**
 * Sanitize error messages to prevent information leakage
 */
export declare function sanitizeErrorMessage(error: Error, includeStack?: boolean): string;
/**
 * Create user-friendly error with code and suggestion
 */
export interface FriendlyError {
    code: string;
    message: string;
    suggestion?: string;
    details?: Record<string, unknown>;
}
export declare function createError(code: string, message: string, suggestion?: string, details?: Record<string, unknown>): FriendlyError;
/**
 * Validate project path (similar to file path but used for directories)
 */
export declare function validateProjectPath(projectPath: unknown): ValidationResult;
/**
 * Validate framework/tool name against a list of valid options
 */
export declare function validateFramework(framework: unknown, validFrameworks: string[]): ValidationResult;
//# sourceMappingURL=validation.d.ts.map