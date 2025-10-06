/**
 * Common patterns used across MCP tools
 * Reduces code duplication and enforces consistency
 */
/**
 * Standard result format for MCP operations
 */
export interface MCPOperationResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    errorCode?: string;
    metadata?: Record<string, any>;
}
/**
 * Standard MCP response format
 */
export interface MCPToolResponse {
    content: Array<{
        type: 'text';
        text: string;
    }>;
}
/**
 * Creates a successful MCP result
 */
export declare function successResult<T>(data: T, metadata?: Record<string, any>): MCPOperationResult<T>;
/**
 * Creates an error MCP result
 */
export declare function errorResult(error: unknown, code?: string): MCPOperationResult;
/**
 * Wraps an async operation with standard error handling
 */
export declare function withErrorHandling<T>(operation: () => Promise<T>, errorCode?: string): Promise<MCPOperationResult<T>>;
/**
 * Creates an MCP tool response from a result
 */
export declare function createToolResponse(result: MCPOperationResult): MCPToolResponse;
/**
 * Handles file operations with consistent error handling
 */
export declare function safeFileOperation<T>(operation: () => Promise<T>, filePath: string): Promise<MCPOperationResult<T>>;
/**
 * Validates required parameters for MCP tools
 */
export declare function validateRequiredParams(params: Record<string, any>, required: string[]): MCPOperationResult<void>;
/**
 * Executes steps with dependency management
 */
export declare function executeWithDependencies<T>(steps: Array<{
    name: string;
    execute: () => Promise<T>;
    dependsOn?: string[];
}>): Promise<MCPOperationResult<Map<string, T>>>;
/**
 * Batches operations for better performance
 */
export declare function batchOperation<T, R>(items: T[], operation: (item: T) => Promise<R>, batchSize?: number): Promise<MCPOperationResult<R[]>>;
/**
 * Retries an operation with exponential backoff
 */
export declare function retryOperation<T>(operation: () => Promise<T>, maxRetries?: number, initialDelay?: number): Promise<MCPOperationResult<T>>;
/**
 * Validates file size before processing
 */
export declare function validateFileSize(size: number, maxSize?: number): MCPOperationResult<void>;
/**
 * Merges multiple results into a single result
 */
export declare function mergeResults<T>(results: MCPOperationResult<T>[]): MCPOperationResult<T[]>;
//# sourceMappingURL=common-patterns.d.ts.map