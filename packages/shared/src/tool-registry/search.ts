/**
 * Tool Search - Semantic search for tools in registry
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */

import type { ToolMetadata, ToolSearchOptions, ToolSearchResult } from './types.js';
import { TOOL_REGISTRY } from './registry.js';

/**
 * Calculate relevance score between query and tool
 * Uses keyword matching and name/description similarity
 */
function calculateRelevance(
  query: string,
  tool: ToolMetadata
): { score: number; matchedKeywords: string[] } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  const matchedKeywords: string[] = [];
  let score = 0;

  // Exact name match (highest weight)
  if (tool.name.toLowerCase() === queryLower) {
    score += 1.0;
  } else if (tool.name.toLowerCase().includes(queryLower)) {
    score += 0.8;
  }

  // Keyword matches
  for (const word of queryWords) {
    for (const keyword of tool.keywords) {
      if (keyword.includes(word) || word.includes(keyword)) {
        matchedKeywords.push(keyword);
        score += 0.3;
      }
    }
  }

  // Description match
  const descLower = tool.description.toLowerCase();
  for (const word of queryWords) {
    if (descLower.includes(word)) {
      score += 0.1;
    }
  }

  // Category match
  if (tool.category.toLowerCase().includes(queryLower)) {
    score += 0.2;
  }

  // Server match
  if (tool.server.toLowerCase().includes(queryLower)) {
    score += 0.15;
  }

  // Normalize score to 0-1 range
  const normalizedScore = Math.min(score, 1.0);

  return {
    score: normalizedScore,
    matchedKeywords: [...new Set(matchedKeywords)], // Remove duplicates
  };
}

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
export function searchTools(options: ToolSearchOptions = {}): ToolSearchResult[] {
  const { query, category, frequency, server, limit = 10, loadedOnly = false } = options;

  let results: ToolSearchResult[] = [];

  for (const tool of TOOL_REGISTRY) {
    // Apply filters
    if (category && tool.category !== category) continue;
    if (frequency && tool.frequency !== frequency) continue;
    if (server && tool.server !== server) continue;
    if (loadedOnly && !tool.loaded) continue;

    let relevance = 0;
    let matchedKeywords: string[] = [];

    if (query) {
      const result = calculateRelevance(query, tool);
      relevance = result.score;
      matchedKeywords = result.matchedKeywords;

      // Skip if no relevance to query
      if (relevance === 0) continue;
    } else {
      // No query, all matching filters get base score
      relevance = 0.5;
    }

    results.push({
      tool,
      relevance,
      matchedKeywords,
    });
  }

  // Sort by relevance (descending)
  results.sort((a, b) => b.relevance - a.relevance);

  // Apply limit
  if (limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

/**
 * Get suggested tools based on context
 * Useful for proactive tool discovery
 *
 * @param context - Context to analyze (e.g., file content, task description)
 * @returns Suggested tools ranked by relevance
 */
export function suggestTools(context: string): ToolSearchResult[] {
  // Extract keywords from context
  const contextLower = context.toLowerCase();

  // Detect patterns and suggest relevant tools
  const suggestions: ToolSearchResult[] = [];

  // Security-related patterns
  if (
    contextLower.includes('security') ||
    contextLower.includes('vulnerability') ||
    contextLower.includes('owasp') ||
    contextLower.includes('xss') ||
    contextLower.includes('sql injection')
  ) {
    suggestions.push(...searchTools({ category: 'security', limit: 3 }));
  }

  // Testing patterns
  if (
    contextLower.includes('test') ||
    contextLower.includes('coverage') ||
    contextLower.includes('unit test') ||
    contextLower.includes('jest') ||
    contextLower.includes('vitest')
  ) {
    suggestions.push(...searchTools({ query: 'test generate', limit: 2 }));
  }

  // Refactoring patterns
  if (
    contextLower.includes('refactor') ||
    contextLower.includes('clean code') ||
    contextLower.includes('dead code') ||
    contextLower.includes('complexity')
  ) {
    suggestions.push(...searchTools({ category: 'refactoring', limit: 3 }));
  }

  // API design patterns
  if (
    contextLower.includes('api') ||
    contextLower.includes('rest') ||
    contextLower.includes('graphql') ||
    contextLower.includes('openapi')
  ) {
    suggestions.push(...searchTools({ query: 'api design', limit: 3 }));
  }

  // Database patterns
  if (
    contextLower.includes('database') ||
    contextLower.includes('schema') ||
    contextLower.includes('migration') ||
    contextLower.includes('sql')
  ) {
    suggestions.push(...searchTools({ server: 'db-schema', limit: 3 }));
  }

  // Documentation patterns
  if (
    contextLower.includes('documentation') ||
    contextLower.includes('readme') ||
    contextLower.includes('jsdoc') ||
    contextLower.includes('changelog')
  ) {
    suggestions.push(...searchTools({ category: 'documentation', limit: 3 }));
  }

  // Remove duplicates and sort by relevance
  const seen = new Set<string>();
  const unique = suggestions.filter(s => {
    if (seen.has(s.tool.name)) return false;
    seen.add(s.tool.name);
    return true;
  });

  return unique.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
}
