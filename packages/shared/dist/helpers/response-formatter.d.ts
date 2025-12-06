/**
 * Response Formatter Helper - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Formats tool responses based on the requested verbosity level.
 * Reduces token consumption by ~40% when using concise/minimal modes.
 */
import { ResponseFormat, FormatOptions, FormattedResponse } from '../types/response-format.js';
/**
 * Generic response formatter for MCP tool results
 *
 * @param result - The full result object from the tool
 * @param options - Formatting options including format level
 * @param formatters - Custom formatters for each level
 * @returns Formatted response based on requested verbosity
 *
 * @example
 * ```typescript
 * const result = await analyzeFile(path);
 * const formatted = formatResponse(result, { format: 'concise' }, {
 *   minimal: (r) => ({ score: r.overallScore, issueCount: r.issues.length }),
 *   concise: (r) => ({ score: r.overallScore, summary: r.summary, topIssues: r.issues.slice(0, 3) }),
 *   detailed: (r) => r
 * });
 * ```
 */
export declare function formatResponse<T, TMinimal, TConcise, TDetailed = T>(result: T, options: FormatOptions, formatters: {
    minimal: (result: T) => TMinimal;
    concise: (result: T) => TConcise;
    detailed?: (result: T) => TDetailed;
}): FormattedResponse<TMinimal | TConcise | TDetailed>;
/**
 * Format an error response
 */
export declare function formatErrorResponse(error: string, options: FormatOptions): FormattedResponse<never>;
/**
 * Truncate array based on format level
 */
export declare function truncateArray<T>(arr: T[], format: ResponseFormat): T[];
/**
 * Filter to only critical/high severity items for concise mode
 */
export declare function filterBySeverity<T extends {
    severity?: string;
}>(items: T[], format: ResponseFormat): T[];
/**
 * Create summary from detailed results
 */
export declare function createSummary(data: {
    issues?: Array<{
        severity?: string;
    }>;
    score?: number;
    metrics?: Record<string, number>;
}, format: ResponseFormat): {
    score?: number;
    issueCount?: number;
    criticalCount?: number;
    summary?: string;
};
/**
 * Standard formatters for common result types
 */
export declare const StandardFormatters: {
    /**
     * Format review/analysis results
     */
    review: <T extends {
        overallScore?: number;
        score?: number;
        issues?: unknown[];
        metrics?: Record<string, unknown>;
    }>(result: T) => {
        minimal: () => {
            score: number;
            issueCount: number;
        };
        concise: () => {
            score: number;
            issueCount: number;
            topIssues: unknown[];
        } | {
            metrics: Record<string, unknown>;
            score: number;
            issueCount: number;
            topIssues: unknown[];
        };
        detailed: () => T;
    };
    /**
     * Format batch operation results
     */
    batch: <T extends {
        results?: unknown[];
        success?: boolean;
        errors?: unknown[];
    }>(result: T) => {
        minimal: () => {
            success: boolean;
            processed: number;
            errors: number;
        };
        concise: () => {
            success: boolean;
            processed: number;
            results: unknown[];
            errors: unknown[];
        };
        detailed: () => T;
    };
    /**
     * Format generation results
     */
    generation: <T extends {
        content?: string;
        files?: unknown[];
    }>(result: T) => {
        minimal: () => {
            success: boolean;
            generated: number;
        };
        concise: () => {
            success: boolean;
            files: unknown[];
            preview: string;
        };
        detailed: () => T;
    };
};
//# sourceMappingURL=response-formatter.d.ts.map