/**
 * Centralized error code registry for all MCP tools
 * Format: TOOL_NNN where TOOL is 3-4 letter prefix, NNN is sequence number
 */
export const ERROR_CODES = {
    // Orchestrator (ORCH_xxx)
    ORCH_001: 'Missing required workflow argument',
    ORCH_002: 'Unknown workflow name',
    ORCH_003: 'Unknown tool in sequence',
    ORCH_004: 'MCP communication failed',
    ORCH_005: 'Workflow execution timeout',
    ORCH_006: 'Circuit breaker is open - MCP unavailable',
    ORCH_007: 'Invalid workflow configuration',
    ORCH_008: 'Step dependency cycle detected',
    // Test Generator (TEST_xxx)
    TEST_001: 'Invalid file path',
    TEST_002: 'Unsupported framework',
    TEST_003: 'File not found',
    TEST_004: 'Permission denied',
    TEST_005: 'Failed to read file',
    TEST_006: 'File is empty',
    TEST_007: 'File too large',
    TEST_008: 'No testable code found',
    // Smart Reviewer (REV_xxx)
    REV_001: 'filePaths must be a non-empty array',
    REV_002: 'Unknown tool',
    REV_003: 'File is empty',
    REV_004: 'Analysis failed',
    REV_005: 'Invalid severity level',
    // Security Scanner (SEC_xxx)
    SEC_001: 'Invalid file path',
    SEC_002: 'Scan failed',
    SEC_003: 'Invalid configuration',
    SEC_004: 'Unknown tool',
    // Refactor Assistant (REF_xxx)
    REF_001: 'Invalid code input',
    REF_002: 'Code too large',
    REF_003: 'Invalid pattern name',
    REF_004: 'Refactoring failed',
    REF_005: 'Invalid line range',
    REF_006: 'Invalid variable name',
    // Architecture Analyzer (ARCH_xxx)
    ARCH_001: 'Invalid project path',
    ARCH_002: 'Module not found',
    ARCH_003: 'Unknown tool',
    ARCH_004: 'Circular dependency detected',
    // API Designer (API_xxx)
    API_001: 'Invalid API configuration',
    API_002: 'Validation failed',
    API_003: 'Generation failed',
    API_004: 'Unsupported API style',
    API_005: 'Mock server generation failed',
    API_006: 'Unknown tool',
    // DB Schema (DB_xxx)
    DB_001: 'Missing required parameters: requirements and options.database',
    DB_002: 'Missing required parameters: schema and description',
    DB_003: 'Missing required parameter: schema',
    DB_004: 'Unsupported database type',
    DB_005: 'Migration generation failed',
    DB_006: 'ER diagram generation failed',
    DB_007: 'Index optimization failed',
    DB_008: 'Normalization failed',
    DB_009: 'Unknown tool',
    // Doc Generator (DOC_xxx)
    DOC_001: 'Invalid project path',
    DOC_002: 'Generation failed',
    DOC_003: 'No documentation generated',
    DOC_004: 'File write failed',
    DOC_005: 'Unknown tool',
    // Shared/Validation (VAL_xxx)
    VAL_001: 'Invalid input',
    VAL_002: 'Path traversal detected',
    VAL_003: 'File too large',
    VAL_004: 'Invalid identifier',
    VAL_005: 'Invalid line range',
};
/**
 * Standard MCP Error with code, message, and optional details
 */
export class MCPError extends Error {
    code;
    details;
    constructor(code, details) {
        super(ERROR_CODES[code]);
        this.code = code;
        this.details = details;
        this.name = 'MCPError';
        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, MCPError);
        }
    }
    /**
     * Convert to JSON for MCP protocol responses
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            name: this.name,
        };
    }
    /**
     * User-friendly string representation
     */
    toString() {
        const detailsStr = this.details ? `\nDetails: ${JSON.stringify(this.details, null, 2)}` : '';
        return `${this.code}: ${this.message}${detailsStr}`;
    }
    /**
     * Check if error is of specific code
     */
    is(code) {
        return this.code === code;
    }
    /**
     * Create from generic Error
     */
    static from(error, defaultCode, details) {
        if (error instanceof MCPError) {
            return error;
        }
        if (error instanceof Error) {
            return new MCPError(defaultCode, {
                ...details,
                originalMessage: error.message,
                originalStack: error.stack,
            });
        }
        return new MCPError(defaultCode, {
            ...details,
            originalError: String(error),
        });
    }
}
/**
 * Type guard to check if error is MCPError
 */
export function isMCPError(error) {
    return error instanceof MCPError;
}
/**
 * Extract error message safely from any error
 */
export function getErrorMessage(error, fallback = 'Unknown error') {
    if (isMCPError(error)) {
        return error.toString();
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error) || fallback;
}
//# sourceMappingURL=error-codes.js.map