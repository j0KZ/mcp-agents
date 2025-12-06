"use strict";
/**
 * Response Formatter Helper - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Formats tool responses based on the requested verbosity level.
 * Reduces token consumption by ~40% when using concise/minimal modes.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardFormatters = void 0;
exports.formatResponse = formatResponse;
exports.formatErrorResponse = formatErrorResponse;
exports.truncateArray = truncateArray;
exports.filterBySeverity = filterBySeverity;
exports.createSummary = createSummary;
var response_format_js_1 = require("../types/response-format.js");
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
function formatResponse(result, options, formatters) {
    var format = options.format, includeMetadata = options.includeMetadata, duration = options.duration, version = options.version;
    var data;
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
    var response = {
        success: true,
        data: data,
    };
    if (includeMetadata) {
        response._meta = __assign(__assign(__assign({ format: format }, (duration !== undefined && { duration: duration })), (version && { version: version })), { truncated: format !== 'detailed' });
    }
    return response;
}
/**
 * Format an error response
 */
function formatErrorResponse(error, options) {
    var response = {
        success: false,
        error: error,
    };
    if (options.includeMetadata) {
        response._meta = __assign({ format: options.format }, (options.duration !== undefined && { duration: options.duration }));
    }
    return response;
}
/**
 * Truncate array based on format level
 */
function truncateArray(arr, format) {
    var spec = response_format_js_1.RESPONSE_FORMAT_SPECS[format];
    return arr.slice(0, spec.maxArrayItems);
}
/**
 * Filter to only critical/high severity items for concise mode
 */
function filterBySeverity(items, format) {
    if (format === 'detailed') {
        return items;
    }
    var highPriority = ['critical', 'error', 'high'];
    var filtered = items.filter(function (item) { return highPriority.includes(item.severity || ''); });
    // If filtering removes everything, return top items
    if (filtered.length === 0 && items.length > 0) {
        return truncateArray(items, format);
    }
    return truncateArray(filtered, format);
}
/**
 * Create summary from detailed results
 */
function createSummary(data, format) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (format === 'minimal') {
        return {
            score: data.score,
            issueCount: (_b = (_a = data.issues) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0,
        };
    }
    var criticalCount = (_d = (_c = data.issues) === null || _c === void 0 ? void 0 : _c.filter(function (i) { return ['critical', 'error', 'high'].includes(i.severity || ''); }).length) !== null && _d !== void 0 ? _d : 0;
    return {
        score: data.score,
        issueCount: (_f = (_e = data.issues) === null || _e === void 0 ? void 0 : _e.length) !== null && _f !== void 0 ? _f : 0,
        criticalCount: criticalCount,
        summary: criticalCount > 0
            ? "".concat(criticalCount, " critical issue(s) found")
            : ((_g = data.issues) === null || _g === void 0 ? void 0 : _g.length)
                ? "".concat(data.issues.length, " issue(s) found")
                : 'No issues found',
    };
}
/**
 * Standard formatters for common result types
 */
exports.StandardFormatters = {
    /**
     * Format review/analysis results
     */
    review: function (result) { return ({
        minimal: function () {
            var _a, _b, _c;
            return ({
                score: (_a = result.overallScore) !== null && _a !== void 0 ? _a : result.score,
                issueCount: (_c = (_b = result.issues) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
            });
        },
        concise: function () {
            var _a, _b, _c, _d;
            var base = {
                score: (_a = result.overallScore) !== null && _a !== void 0 ? _a : result.score,
                issueCount: (_c = (_b = result.issues) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
                topIssues: truncateArray((_d = result.issues) !== null && _d !== void 0 ? _d : [], 'concise'),
            };
            if (result.metrics) {
                return __assign(__assign({}, base), { metrics: result.metrics });
            }
            return base;
        },
        detailed: function () { return result; },
    }); },
    /**
     * Format batch operation results
     */
    batch: function (result) { return ({
        minimal: function () {
            var _a, _b, _c, _d, _e;
            return ({
                success: (_a = result.success) !== null && _a !== void 0 ? _a : true,
                processed: (_c = (_b = result.results) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
                errors: (_e = (_d = result.errors) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0,
            });
        },
        concise: function () {
            var _a, _b, _c, _d, _e;
            return ({
                success: (_a = result.success) !== null && _a !== void 0 ? _a : true,
                processed: (_c = (_b = result.results) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
                results: truncateArray((_d = result.results) !== null && _d !== void 0 ? _d : [], 'concise'),
                errors: truncateArray((_e = result.errors) !== null && _e !== void 0 ? _e : [], 'concise'),
            });
        },
        detailed: function () { return result; },
    }); },
    /**
     * Format generation results
     */
    generation: function (result) { return ({
        minimal: function () {
            var _a, _b;
            return ({
                success: true,
                generated: (_b = (_a = result.files) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : (result.content ? 1 : 0),
            });
        },
        concise: function () {
            var _a;
            return ({
                success: true,
                files: result.files ? truncateArray(result.files, 'concise') : undefined,
                preview: (_a = result.content) === null || _a === void 0 ? void 0 : _a.slice(0, 500),
            });
        },
        detailed: function () { return result; },
    }); },
};
