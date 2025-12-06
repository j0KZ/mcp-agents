/**
 * Tool Search - Semantic search for tools in registry
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */
import type { ToolSearchOptions, ToolSearchResult } from './types.js';
/**
 * Search the tool registry with various filters
 *
 * @param options - Search options
 * @returns Array of matching tools with relevance scores
 *
 * @example
 * // Search by query
 * searchTools({ query: 'security vulnerability' })
 *
 * @example
 * // Filter by category
 * searchTools({ category: 'security', limit: 5 })
 *
 * @example
 * // Combine filters
 * searchTools({ query: 'test', category: 'generation', frequency: 'high' })
 */
export declare function searchTools(options?: ToolSearchOptions): ToolSearchResult[];
/**
 * Get suggested tools based on context
 * Useful for proactive tool discovery
 *
 * @param context - Context to analyze (e.g., file content, task description)
 * @returns Suggested tools ranked by relevance
 */
export declare function suggestTools(context: string): ToolSearchResult[];
//# sourceMappingURL=search.d.ts.map