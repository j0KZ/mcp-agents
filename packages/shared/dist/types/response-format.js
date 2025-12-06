/**
 * Response Format Types - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Implements response format optimization to reduce token consumption by ~40%.
 * Users can request minimal, concise, or detailed responses based on their needs.
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
/**
 * Response format specifications with token estimates
 */
export const RESPONSE_FORMAT_SPECS = {
    minimal: {
        description: 'Essential result only (success/fail + key metric)',
        maxTokens: 100,
        includeDetails: false,
        maxArrayItems: 3,
    },
    concise: {
        description: 'Executive summary without full details',
        maxTokens: 500,
        includeDetails: false,
        maxArrayItems: 5,
    },
    detailed: {
        description: 'Complete analysis with all data',
        maxTokens: 5000,
        includeDetails: true,
        maxArrayItems: 100,
    },
};
/**
 * Schema property for response_format parameter
 * Add this to inputSchema.properties in tool definitions
 */
export const RESPONSE_FORMAT_SCHEMA = {
    type: 'string',
    enum: ['minimal', 'concise', 'detailed'],
    default: 'detailed',
    description: 'Output verbosity: minimal (key metrics only), concise (summary), detailed (full analysis)',
};
/**
 * Validate response format value
 */
export function isValidResponseFormat(value) {
    return typeof value === 'string' && ['minimal', 'concise', 'detailed'].includes(value);
}
/**
 * Get response format with default fallback
 */
export function getResponseFormat(value, defaultFormat = 'detailed') {
    return isValidResponseFormat(value) ? value : defaultFormat;
}
//# sourceMappingURL=response-format.js.map