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
export const RESPONSE_FORMAT_SPECS: Record<
  ResponseFormat,
  {
    description: string;
    maxTokens: number;
    includeDetails: boolean;
    maxArrayItems: number;
  }
> = {
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
export const RESPONSE_FORMAT_SCHEMA = {
  type: 'string' as const,
  enum: ['minimal', 'concise', 'detailed'] as const,
  default: 'detailed',
  description:
    'Output verbosity: minimal (key metrics only), concise (summary), detailed (full analysis)',
};

/**
 * Validate response format value
 */
export function isValidResponseFormat(value: unknown): value is ResponseFormat {
  return typeof value === 'string' && ['minimal', 'concise', 'detailed'].includes(value);
}

/**
 * Get response format with default fallback
 */
export function getResponseFormat(
  value: unknown,
  defaultFormat: ResponseFormat = 'detailed'
): ResponseFormat {
  return isValidResponseFormat(value) ? value : defaultFormat;
}
