/**
 * Tool Registry - Central hub for tool metadata and search
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */

// Types
export type {
  ToolFrequency,
  ToolCategory,
  MCPServerName,
  ToolMetadata,
  ToolSearchResult,
  ToolSearchOptions,
  ToolLoadResult,
  ToolUsageMetrics,
} from './types.js';

// Registry
export {
  TOOL_REGISTRY,
  getToolsByFrequency,
  getToolsByServer,
  getToolsByCategory,
  getImmediateTools,
  getDeferredTools,
  getExplicitlyDeferredTools,
  findToolByName,
  getToolCount,
  // Phase 5: Progressive Disclosure
  getCategoryStats,
  getServerTools,
  getServerNames,
  type CategoryInfo,
} from './registry.js';

// Search
export { searchTools, suggestTools } from './search.js';
