/**
 * Centralized error code registry for all MCP tools
 * Format: TOOL_NNN where TOOL is 3-4 letter prefix, NNN is sequence number
 */
export declare const ERROR_CODES: {
    readonly ORCH_001: "Missing required workflow argument";
    readonly ORCH_002: "Unknown workflow name";
    readonly ORCH_003: "Unknown tool in sequence";
    readonly ORCH_004: "MCP communication failed";
    readonly ORCH_005: "Workflow execution timeout";
    readonly ORCH_006: "Circuit breaker is open - MCP unavailable";
    readonly ORCH_007: "Invalid workflow configuration";
    readonly ORCH_008: "Step dependency cycle detected";
    readonly TEST_001: "Invalid file path";
    readonly TEST_002: "Unsupported framework";
    readonly TEST_003: "File not found";
    readonly TEST_004: "Permission denied";
    readonly TEST_005: "Failed to read file";
    readonly TEST_006: "File is empty";
    readonly TEST_007: "File too large";
    readonly TEST_008: "No testable code found";
    readonly REV_001: "filePaths must be a non-empty array";
    readonly REV_002: "Unknown tool";
    readonly REV_003: "File is empty";
    readonly REV_004: "Analysis failed";
    readonly REV_005: "Invalid severity level";
    readonly SEC_001: "Invalid file path";
    readonly SEC_002: "Scan failed";
    readonly SEC_003: "Invalid configuration";
    readonly SEC_004: "Unknown tool";
    readonly REF_001: "Invalid code input";
    readonly REF_002: "Code too large";
    readonly REF_003: "Invalid pattern name";
    readonly REF_004: "Refactoring failed";
    readonly REF_005: "Invalid line range";
    readonly REF_006: "Invalid variable name";
    readonly ARCH_001: "Invalid project path";
    readonly ARCH_002: "Module not found";
    readonly ARCH_003: "Unknown tool";
    readonly ARCH_004: "Circular dependency detected";
    readonly API_001: "Invalid API configuration";
    readonly API_002: "Validation failed";
    readonly API_003: "Generation failed";
    readonly API_004: "Unsupported API style";
    readonly API_005: "Mock server generation failed";
    readonly API_006: "Unknown tool";
    readonly DB_001: "Missing required parameters: requirements and options.database";
    readonly DB_002: "Missing required parameters: schema and description";
    readonly DB_003: "Missing required parameter: schema";
    readonly DB_004: "Unsupported database type";
    readonly DB_005: "Migration generation failed";
    readonly DB_006: "ER diagram generation failed";
    readonly DB_007: "Index optimization failed";
    readonly DB_008: "Normalization failed";
    readonly DB_009: "Unknown tool";
    readonly DOC_001: "Invalid project path";
    readonly DOC_002: "Generation failed";
    readonly DOC_003: "No documentation generated";
    readonly DOC_004: "File write failed";
    readonly DOC_005: "Unknown tool";
    readonly VAL_001: "Invalid input";
    readonly VAL_002: "Path traversal detected";
    readonly VAL_003: "File too large";
    readonly VAL_004: "Invalid identifier";
    readonly VAL_005: "Invalid line range";
};
export type ErrorCode = keyof typeof ERROR_CODES;
/**
 * Standard MCP Error with code, message, and optional details
 */
export declare class MCPError extends Error {
    readonly code: ErrorCode;
    readonly details?: Record<string, unknown> | undefined;
    constructor(code: ErrorCode, details?: Record<string, unknown> | undefined);
    /**
     * Convert to JSON for MCP protocol responses
     */
    toJSON(): {
        code: "ORCH_001" | "ORCH_002" | "ORCH_003" | "ORCH_004" | "ORCH_005" | "ORCH_006" | "ORCH_007" | "ORCH_008" | "TEST_001" | "TEST_002" | "TEST_003" | "TEST_004" | "TEST_005" | "TEST_006" | "TEST_007" | "TEST_008" | "REV_001" | "REV_002" | "REV_003" | "REV_004" | "REV_005" | "SEC_001" | "SEC_002" | "SEC_003" | "SEC_004" | "REF_001" | "REF_002" | "REF_003" | "REF_004" | "REF_005" | "REF_006" | "ARCH_001" | "ARCH_002" | "ARCH_003" | "ARCH_004" | "API_001" | "API_002" | "API_003" | "API_004" | "API_005" | "API_006" | "DB_001" | "DB_002" | "DB_003" | "DB_004" | "DB_005" | "DB_006" | "DB_007" | "DB_008" | "DB_009" | "DOC_001" | "DOC_002" | "DOC_003" | "DOC_004" | "DOC_005" | "VAL_001" | "VAL_002" | "VAL_003" | "VAL_004" | "VAL_005";
        message: string;
        details: Record<string, unknown> | undefined;
        name: string;
    };
    /**
     * User-friendly string representation
     */
    toString(): string;
    /**
     * Check if error is of specific code
     */
    is(code: ErrorCode): boolean;
    /**
     * Create from generic Error
     */
    static from(error: unknown, defaultCode: ErrorCode, details?: Record<string, unknown>): MCPError;
}
/**
 * Type guard to check if error is MCPError
 */
export declare function isMCPError(error: unknown): error is MCPError;
/**
 * Extract error message safely from any error
 */
export declare function getErrorMessage(error: unknown, fallback?: string): string;
//# sourceMappingURL=error-codes.d.ts.map