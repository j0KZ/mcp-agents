/**
 * Enhanced Error System
 * Provides actionable error messages with solutions and debugging context
 */
import { MCPError, ErrorCode } from './error-codes.js';
export interface ErrorSolution {
    description: string;
    steps: string[];
    documentation?: string;
    automated?: boolean;
}
export interface EnhancedErrorResponse {
    success: false;
    error: string;
    code: ErrorCode;
    userMessage: string;
    solutions: ErrorSolution[];
    debugInfo?: Record<string, unknown>;
    timestamp: string;
}
export declare class EnhancedError {
    /**
     * Create user-friendly error response from MCPError
     */
    static fromMCPError(error: MCPError, context?: Record<string, unknown>): EnhancedErrorResponse;
    /**
     * Get user-friendly message for error code
     */
    private static getUserMessage;
    /**
     * Get actionable solutions for error code
     */
    private static getSolutions;
    /**
     * Format error for JSON response
     */
    static toJSON(error: MCPError, context?: Record<string, unknown>, includeDebug?: boolean): string;
    /**
     * Format error for console output
     */
    static toConsole(error: MCPError, context?: Record<string, unknown>): string;
}
//# sourceMappingURL=enhanced-error.d.ts.map