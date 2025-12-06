/**
 * Tool Registry Types
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */

/**
 * Tool usage frequency for deferred loading decisions
 * - high: Always loaded (essential tools like review_file, generate_tests)
 * - medium: Loaded on-demand, frequently used
 * - low: Only loaded when explicitly requested
 */
export type ToolFrequency = 'high' | 'medium' | 'low';

/**
 * Tool categories for semantic search and organization
 */
export type ToolCategory =
  | 'analysis'
  | 'generation'
  | 'refactoring'
  | 'design'
  | 'security'
  | 'orchestration'
  | 'documentation';

/**
 * MCP server names in the @j0kz ecosystem
 */
export type MCPServerName =
  | 'smart-reviewer'
  | 'test-generator'
  | 'architecture-analyzer'
  | 'security-scanner'
  | 'refactor-assistant'
  | 'api-designer'
  | 'db-schema'
  | 'doc-generator'
  | 'orchestrator';

/**
 * Metadata for a single tool in the registry
 */
export interface ToolMetadata {
  /** Unique tool name (matches MCP tool name) */
  name: string;

  /** MCP server that provides this tool */
  server: MCPServerName;

  /** Usage frequency for loading decisions */
  frequency: ToolFrequency;

  /** Category for organization and search */
  category: ToolCategory;

  /** Keywords for semantic search */
  keywords: string[];

  /** Brief description for search results */
  description: string;

  /** Whether this tool is currently loaded in context */
  loaded?: boolean;

  /**
   * Explicit flag indicating the tool should be deferred (not loaded immediately).
   * Anthropic Advanced Tool Use best practice (Nov 2025).
   * - true: Tool is only loaded when explicitly requested via load_tool
   * - false/undefined: Tool loading behavior follows frequency setting
   */
  defer_loading?: boolean;
}

/**
 * Search result from tool registry
 */
export interface ToolSearchResult {
  /** Tool metadata */
  tool: ToolMetadata;

  /** Relevance score (0-1) */
  relevance: number;

  /** Matched keywords */
  matchedKeywords: string[];
}

/**
 * Options for searching the tool registry
 */
export interface ToolSearchOptions {
  /** Search query (keywords, tool name, or description) */
  query?: string;

  /** Filter by category */
  category?: ToolCategory;

  /** Filter by frequency */
  frequency?: ToolFrequency;

  /** Filter by server */
  server?: MCPServerName;

  /** Maximum number of results */
  limit?: number;

  /** Include only loaded tools */
  loadedOnly?: boolean;
}

/**
 * Result of loading a tool
 */
export interface ToolLoadResult {
  /** Whether the load was successful */
  success: boolean;

  /** Tool that was loaded */
  toolName: string;

  /** Server that provides the tool */
  server: MCPServerName;

  /** Error message if load failed */
  error?: string;

  /** Full tool definition if loaded */
  definition?: unknown;
}

/**
 * Tool usage metrics for analytics
 */
export interface ToolUsageMetrics {
  /** Tool name */
  toolName: string;

  /** Number of times called */
  callCount: number;

  /** Average execution time in ms */
  avgExecutionTime: number;

  /** Last time the tool was called */
  lastCalled?: Date;

  /** Success rate (0-1) */
  successRate: number;
}
