/**
 * Common patterns used across MCP tools
 * Reduces code duplication and enforces consistency
 */
import { MCPError, getErrorMessage } from '../errors/index.js';
/**
 * Creates a successful MCP result
 */
export function successResult(data, metadata) {
    return {
        success: true,
        data,
        metadata
    };
}
/**
 * Creates an error MCP result
 */
export function errorResult(error, code) {
    const message = getErrorMessage(error);
    const errorCode = error instanceof MCPError ? error.code : code || 'UNKNOWN';
    return {
        success: false,
        error: message,
        errorCode
    };
}
/**
 * Wraps an async operation with standard error handling
 */
export async function withErrorHandling(operation, errorCode) {
    try {
        const result = await operation();
        return successResult(result);
    }
    catch (error) {
        return errorResult(error, errorCode);
    }
}
/**
 * Creates an MCP tool response from a result
 */
export function createToolResponse(result) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(result, null, 2)
            }
        ]
    };
}
/**
 * Handles file operations with consistent error handling
 */
export async function safeFileOperation(operation, filePath) {
    try {
        const result = await operation();
        return successResult(result, { filePath });
    }
    catch (error) {
        const errorCode = error.code === 'ENOENT' ? 'FILE_NOT_FOUND' :
            error.code === 'EACCES' ? 'PERMISSION_DENIED' :
                error.code === 'EISDIR' ? 'IS_DIRECTORY' :
                    'FILE_ERROR';
        return {
            success: false,
            error: `File operation failed for ${filePath}: ${getErrorMessage(error)}`,
            errorCode,
            metadata: { filePath }
        };
    }
}
/**
 * Validates required parameters for MCP tools
 */
export function validateRequiredParams(params, required) {
    const missing = required.filter(param => !params[param]);
    if (missing.length > 0) {
        return {
            success: false,
            error: `Missing required parameters: ${missing.join(', ')}`,
            errorCode: 'MISSING_PARAMS'
        };
    }
    return { success: true };
}
/**
 * Executes steps with dependency management
 */
export async function executeWithDependencies(steps) {
    const results = new Map();
    const completed = new Set();
    for (const step of steps) {
        // Check dependencies
        if (step.dependsOn) {
            const missingDeps = step.dependsOn.filter(dep => !completed.has(dep));
            if (missingDeps.length > 0) {
                return {
                    success: false,
                    error: `Step '${step.name}' has unmet dependencies: ${missingDeps.join(', ')}`,
                    errorCode: 'DEPENDENCY_ERROR'
                };
            }
        }
        // Execute step
        try {
            const result = await step.execute();
            results.set(step.name, result);
            completed.add(step.name);
        }
        catch (error) {
            return {
                success: false,
                error: `Step '${step.name}' failed: ${getErrorMessage(error)}`,
                errorCode: 'STEP_FAILED',
                metadata: { failedStep: step.name }
            };
        }
    }
    return successResult(results);
}
/**
 * Batches operations for better performance
 */
export async function batchOperation(items, operation, batchSize = 10) {
    const results = [];
    const errors = [];
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map(async (item, index) => {
            try {
                return await operation(item);
            }
            catch (error) {
                errors.push({
                    index: i + index,
                    error: getErrorMessage(error)
                });
                return null;
            }
        });
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults.filter((r) => r !== null));
    }
    if (errors.length > 0) {
        return {
            success: false,
            error: `Batch operation had ${errors.length} failures`,
            errorCode: 'BATCH_PARTIAL_FAILURE',
            data: results,
            metadata: { errors }
        };
    }
    return successResult(results);
}
/**
 * Retries an operation with exponential backoff
 */
export async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await operation();
            return successResult(result);
        }
        catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    return {
        success: false,
        error: `Operation failed after ${maxRetries} retries: ${getErrorMessage(lastError)}`,
        errorCode: 'MAX_RETRIES_EXCEEDED'
    };
}
/**
 * Validates file size before processing
 */
export function validateFileSize(size, maxSize = 100 * 1024 * 1024 // 100MB default
) {
    if (size > maxSize) {
        return {
            success: false,
            error: `File size ${size} bytes exceeds maximum of ${maxSize} bytes`,
            errorCode: 'FILE_TOO_LARGE'
        };
    }
    return { success: true };
}
/**
 * Merges multiple results into a single result
 */
export function mergeResults(results) {
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
        return {
            success: false,
            error: `${errors.length} operations failed`,
            errorCode: 'MULTIPLE_FAILURES',
            metadata: {
                errors: errors.map(e => ({ error: e.error, code: e.errorCode }))
            }
        };
    }
    const data = results
        .filter(r => r.success && r.data !== undefined)
        .map(r => r.data);
    return successResult(data);
}
//# sourceMappingURL=common-patterns.js.map