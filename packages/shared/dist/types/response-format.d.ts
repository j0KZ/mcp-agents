/**
 * Response Format Types - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Implements response format optimization to reduce token consumption by ~40%.
 * Users can request minimal, concise, or detailed responses based on their needs.
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
/**
 * Available response format levels
 */
export type ResponseFormat = 'minimal' | 'concise' | 'detailed';
/**
 * Configuration for response formatting
 */
export interface ResponseFormatConfig {
    /** Output verbosity level */
    format: ResponseFormat;
    /** Include metadata like execution time, version, etc. */
    includeMetadata?: boolean;
    /** Maximum items to return in arrays (for concise/minimal modes) */
    maxItems?: number;
    /** Include success/error status in response */
    includeStatus?: boolean;
}
/**
 * Response format specifications with token estimates
 */
export declare const RESPONSE_FORMAT_SPECS: Record<ResponseFormat, {
    description: string;
    maxTokens: number;
    includeDetails: boolean;
    maxArrayItems: number;
}>;
/**
 * Base interface for formatted responses
 */
export interface FormattedResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    _meta?: ResponseMetadata;
}
/**
 * Metadata included when includeMetadata is true
 */
export interface ResponseMetadata {
    format: ResponseFormat;
    duration?: number;
    version?: string;
    truncated?: boolean;
}
/**
 * Options for the formatResponse helper
 */
export interface FormatOptions {
    format: ResponseFormat;
    includeMetadata?: boolean;
    duration?: number;
    version?: string;
}
/**
 * Schema property for response_format parameter
 * Add this to inputSchema.properties in tool definitions
 */
export declare const RESPONSE_FORMAT_SCHEMA: {
    type: "string";
    enum: readonly ["minimal", "concise", "detailed"];
    default: string;
    description: string;
};
/**
 * Validate response format value
 */
export declare function isValidResponseFormat(value: unknown): value is ResponseFormat;
/**
 * Get response format with default fallback
 */
export declare function getResponseFormat(value: unknown, defaultFormat?: ResponseFormat): ResponseFormat;
//# sourceMappingURL=response-format.d.ts.map