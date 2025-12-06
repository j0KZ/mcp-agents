/**
 * Response Formatter Helper - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Formats tool responses based on the requested verbosity level.
 * Reduces token consumption by ~40% when using concise/minimal modes.
 */
import { RESPONSE_FORMAT_SPECS, } from '../types/response-format.js';
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
export function formatResponse(result, options, formatters) {
    const { format, includeMetadata, duration, version } = options;
    const spec = RESPONSE_FORMAT_SPECS[format];
    let data;
    switch (format) {
        case 'minimal':
            data = formatters.minimal(result);
            break;
        case 'concise':
            data = formatters.concise(result);
            break;
        case 'detailed':
        default:
            data = formatters.detailed ? formatters.detailed(result) : result;
            break;
    }
    const response = {
        success: true,
        data,
    };
    if (includeMetadata) {
        response._meta = {
            format,
            ...(duration !== undefined && { duration }),
            ...(version && { version }),
            truncated: format !== 'detailed',
        };
    }
    return response;
}
/**
 * Format an error response
 */
export function formatErrorResponse(error, options) {
    const response = {
        success: false,
        error,
    };
    if (options.includeMetadata) {
        response._meta = {
            format: options.format,
            ...(options.duration !== undefined && { duration: options.duration }),
        };
    }
    return response;
}
/**
 * Truncate array based on format level
 */
export function truncateArray(arr, format) {
    const spec = RESPONSE_FORMAT_SPECS[format];
    return arr.slice(0, spec.maxArrayItems);
}
/**
 * Filter to only critical/high severity items for concise mode
 */
export function filterBySeverity(items, format) {
    if (format === 'detailed') {
        return items;
    }
    const highPriority = ['critical', 'error', 'high'];
    const filtered = items.filter(item => highPriority.includes(item.severity || ''));
    // If filtering removes everything, return top items
    if (filtered.length === 0 && items.length > 0) {
        return truncateArray(items, format);
    }
    return truncateArray(filtered, format);
}
/**
 * Create summary from detailed results
 */
export function createSummary(data, format) {
    if (format === 'minimal') {
        return {
            score: data.score,
            issueCount: data.issues?.length ?? 0,
        };
    }
    const criticalCount = data.issues?.filter(i => ['critical', 'error', 'high'].includes(i.severity || '')).length ?? 0;
    return {
        score: data.score,
        issueCount: data.issues?.length ?? 0,
        criticalCount,
        summary: criticalCount > 0
            ? `${criticalCount} critical issue(s) found`
            : data.issues?.length
                ? `${data.issues.length} issue(s) found`
                : 'No issues found',
    };
}
/**
 * Standard formatters for common result types
 */
export const StandardFormatters = {
    /**
     * Format review/analysis results
     */
    review: (result) => ({
        minimal: () => ({
            score: result.overallScore ?? result.score,
            issueCount: result.issues?.length ?? 0,
        }),
        concise: () => {
            const base = {
                score: result.overallScore ?? result.score,
                issueCount: result.issues?.length ?? 0,
                topIssues: truncateArray(result.issues ?? [], 'concise'),
            };
            if (result.metrics) {
                return { ...base, metrics: result.metrics };
            }
            return base;
        },
        detailed: () => result,
    }),
    /**
     * Format batch operation results
     */
    batch: (result) => ({
        minimal: () => ({
            success: result.success ?? true,
            processed: result.results?.length ?? 0,
            errors: result.errors?.length ?? 0,
        }),
        concise: () => ({
            success: result.success ?? true,
            processed: result.results?.length ?? 0,
            results: truncateArray(result.results ?? [], 'concise'),
            errors: truncateArray(result.errors ?? [], 'concise'),
        }),
        detailed: () => result,
    }),
    /**
     * Format generation results
     */
    generation: (result) => ({
        minimal: () => ({
            success: true,
            generated: result.files?.length ?? (result.content ? 1 : 0),
        }),
        concise: () => ({
            success: true,
            files: result.files ? truncateArray(result.files, 'concise') : undefined,
            preview: result.content?.slice(0, 500),
        }),
        detailed: () => result,
    }),
};
//# sourceMappingURL=response-formatter.js.map