/**
 * Tool Registry - Complete catalog of all MCP tools
 * Part of Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture
 */

import type { ToolMetadata } from './types.js';

/**
 * Complete registry of all tools across the @j0kz MCP ecosystem
 * Organized by frequency for optimal loading strategies
 */
export const TOOL_REGISTRY: ToolMetadata[] = [
  // ============================================
  // HIGH FREQUENCY - Always loaded (core tools)
  // ============================================

  // Smart Reviewer
  {
    name: 'review_file',
    server: 'smart-reviewer',
    frequency: 'high',
    category: 'analysis',
    keywords: ['review', 'code', 'quality', 'issues', 'lint', 'analyze'],
    description: 'Review a code file for issues, complexity, and quality metrics',
  },
  {
    name: 'batch_review',
    server: 'smart-reviewer',
    frequency: 'high',
    category: 'analysis',
    keywords: ['review', 'batch', 'multiple', 'files', 'quality'],
    description: 'Review multiple files at once',
  },

  // Test Generator
  {
    name: 'generate_tests',
    server: 'test-generator',
    frequency: 'high',
    category: 'generation',
    keywords: ['test', 'unit', 'coverage', 'jest', 'vitest', 'generate'],
    description: 'Generate comprehensive test suite for a source file',
  },

  // Architecture Analyzer
  {
    name: 'analyze_architecture',
    server: 'architecture-analyzer',
    frequency: 'high',
    category: 'analysis',
    keywords: ['architecture', 'dependencies', 'circular', 'layers', 'graph'],
    description: 'Analyze project architecture, detect circular dependencies',
  },

  // Orchestrator
  {
    name: 'run_workflow',
    server: 'orchestrator',
    frequency: 'high',
    category: 'orchestration',
    keywords: ['workflow', 'pipeline', 'pre-commit', 'pre-merge', 'audit'],
    description: 'Run a predefined workflow with multiple tools',
  },

  // ============================================
  // MEDIUM FREQUENCY - Load on-demand (common)
  // ============================================

  // Smart Reviewer (additional tools)
  {
    name: 'generate_auto_fixes',
    server: 'smart-reviewer',
    frequency: 'medium',
    category: 'refactoring',
    keywords: ['fix', 'auto', 'pareto', 'issues', 'improve'],
    description: 'Generate Pareto-based auto-fixes (20% fixes solve 80% issues)',
  },
  {
    name: 'apply_auto_fixes',
    server: 'smart-reviewer',
    frequency: 'medium',
    category: 'refactoring',
    keywords: ['fix', 'apply', 'auto', 'safe'],
    description: 'Apply generated auto-fixes to a file',
  },
  {
    name: 'apply_fixes',
    server: 'smart-reviewer',
    frequency: 'medium',
    category: 'refactoring',
    keywords: ['fix', 'apply', 'issues'],
    description: 'Apply automatic fixes to a reviewed file',
  },
  {
    name: '__health',
    server: 'smart-reviewer',
    frequency: 'low',
    category: 'orchestration',
    keywords: ['health', 'diagnostics', 'status'],
    description: 'Check MCP server health and diagnostics',
  },

  // Test Generator (additional tools)
  {
    name: 'write_test_file',
    server: 'test-generator',
    frequency: 'medium',
    category: 'generation',
    keywords: ['test', 'write', 'file', 'create'],
    description: 'Generate tests and write directly to a file',
  },
  {
    name: 'batch_generate',
    server: 'test-generator',
    frequency: 'medium',
    category: 'generation',
    keywords: ['test', 'batch', 'multiple', 'generate'],
    description: 'Generate tests for multiple files at once',
  },

  // Architecture Analyzer (additional tools)
  {
    name: 'get_module_info',
    server: 'architecture-analyzer',
    frequency: 'medium',
    category: 'analysis',
    keywords: ['module', 'info', 'details', 'dependencies'],
    description: 'Get detailed information about a specific module',
  },
  {
    name: 'find_circular_deps',
    server: 'architecture-analyzer',
    frequency: 'medium',
    category: 'analysis',
    keywords: ['circular', 'dependencies', 'cycle', 'find'],
    description: 'Find all circular dependencies in the project',
  },

  // Security Scanner
  {
    name: 'scan_file',
    server: 'security-scanner',
    frequency: 'medium',
    category: 'security',
    keywords: ['security', 'scan', 'file', 'vulnerability'],
    description: 'Scan a single file for security vulnerabilities',
  },
  {
    name: 'scan_project',
    server: 'security-scanner',
    frequency: 'medium',
    category: 'security',
    keywords: ['security', 'scan', 'project', 'owasp', 'vulnerability'],
    description: 'Scan entire project for security issues',
  },
  {
    name: 'scan_secrets',
    server: 'security-scanner',
    frequency: 'medium',
    category: 'security',
    keywords: ['secrets', 'api', 'keys', 'credentials', 'leak'],
    description: 'Scan for exposed secrets and API keys',
  },
  {
    name: 'scan_vulnerabilities',
    server: 'security-scanner',
    frequency: 'medium',
    category: 'security',
    keywords: ['vulnerability', 'xss', 'sql', 'injection', 'owasp'],
    description: 'Scan for specific vulnerability types',
  },
  {
    name: 'generate_security_report',
    server: 'security-scanner',
    frequency: 'medium',
    category: 'security',
    keywords: ['report', 'security', 'markdown', 'audit'],
    description: 'Generate comprehensive security report',
  },

  // Doc Generator
  {
    name: 'generate_jsdoc',
    server: 'doc-generator',
    frequency: 'medium',
    category: 'documentation',
    keywords: ['jsdoc', 'comments', 'documentation', 'typescript'],
    description: 'Generate JSDoc comments for a file',
  },
  {
    name: 'generate_readme',
    server: 'doc-generator',
    frequency: 'medium',
    category: 'documentation',
    keywords: ['readme', 'documentation', 'markdown', 'project'],
    description: 'Generate project README from source code',
  },
  {
    name: 'generate_api_docs',
    server: 'doc-generator',
    frequency: 'medium',
    category: 'documentation',
    keywords: ['api', 'documentation', 'reference', 'classes'],
    description: 'Generate API documentation from source',
  },
  {
    name: 'generate_changelog',
    server: 'doc-generator',
    frequency: 'medium',
    category: 'documentation',
    keywords: ['changelog', 'git', 'commits', 'releases'],
    description: 'Generate changelog from git history',
  },
  {
    name: 'generate_full_docs',
    server: 'doc-generator',
    frequency: 'medium',
    category: 'documentation',
    keywords: ['full', 'complete', 'documentation', 'all'],
    description: 'Generate complete documentation suite',
  },

  // Orchestrator (additional tools)
  {
    name: 'run_sequence',
    server: 'orchestrator',
    frequency: 'medium',
    category: 'orchestration',
    keywords: ['sequence', 'custom', 'pipeline', 'steps'],
    description: 'Run a custom sequence of MCP tools',
  },
  {
    name: 'list_workflows',
    server: 'orchestrator',
    frequency: 'medium',
    category: 'orchestration',
    keywords: ['list', 'workflows', 'available'],
    description: 'List all available workflows',
  },
  // Phase 3: Deferred Loading meta-tools
  {
    name: 'search_tools',
    server: 'orchestrator',
    frequency: 'high',
    category: 'orchestration',
    keywords: ['search', 'find', 'discover', 'tools', 'query'],
    description: 'Search available tools by keyword, category, or frequency',
  },
  {
    name: 'load_tool',
    server: 'orchestrator',
    frequency: 'high',
    category: 'orchestration',
    keywords: ['load', 'activate', 'enable', 'tool'],
    description: 'Load a deferred tool into context for use',
  },
  // Phase 4: Progressive Disclosure meta-tool
  {
    name: 'list_capabilities',
    server: 'orchestrator',
    frequency: 'high',
    category: 'orchestration',
    keywords: ['capabilities', 'categories', 'list', 'discover', 'overview'],
    description: 'List all available tool categories with descriptions and counts',
  },

  // ============================================
  // LOW FREQUENCY - Load only when requested
  // These tools have defer_loading: true (Anthropic Nov 2025 best practice)
  // ============================================

  // Refactor Assistant
  {
    name: 'extract_function',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['extract', 'function', 'refactor', 'method'],
    description: 'Extract code into a new function',
    defer_loading: true,
  },
  {
    name: 'convert_to_async',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['async', 'await', 'promise', 'convert'],
    description: 'Convert callback-based code to async/await',
    defer_loading: true,
  },
  {
    name: 'simplify_conditionals',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['simplify', 'if', 'conditionals', 'guard', 'ternary'],
    description: 'Simplify complex conditional statements',
    defer_loading: true,
  },
  {
    name: 'remove_dead_code',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['dead', 'code', 'unused', 'remove', 'clean'],
    description: 'Remove unused code and imports',
    defer_loading: true,
  },
  {
    name: 'apply_pattern',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['pattern', 'design', 'singleton', 'factory', 'observer'],
    description: 'Apply design pattern to code',
    defer_loading: true,
  },
  {
    name: 'rename_variable',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['rename', 'variable', 'refactor', 'name'],
    description: 'Rename a variable across the codebase',
    defer_loading: true,
  },
  {
    name: 'suggest_refactorings',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['suggest', 'refactoring', 'recommendations'],
    description: 'Suggest potential refactorings for code',
    defer_loading: true,
  },
  {
    name: 'calculate_metrics',
    server: 'refactor-assistant',
    frequency: 'low',
    category: 'analysis',
    keywords: ['metrics', 'complexity', 'maintainability', 'cyclomatic'],
    description: 'Calculate code metrics and complexity',
    defer_loading: true,
  },

  // API Designer
  {
    name: 'generate_openapi',
    server: 'api-designer',
    frequency: 'low',
    category: 'design',
    keywords: ['openapi', 'swagger', 'api', 'spec', 'rest'],
    description: 'Generate OpenAPI specification',
    defer_loading: true,
  },
  {
    name: 'design_rest_api',
    server: 'api-designer',
    frequency: 'low',
    category: 'design',
    keywords: ['rest', 'api', 'endpoints', 'crud', 'design'],
    description: 'Design REST API endpoints for resources',
    defer_loading: true,
  },
  {
    name: 'create_graphql_schema',
    server: 'api-designer',
    frequency: 'low',
    category: 'design',
    keywords: ['graphql', 'schema', 'types', 'queries', 'mutations'],
    description: 'Create GraphQL schema with types and resolvers',
    defer_loading: true,
  },
  {
    name: 'generate_client',
    server: 'api-designer',
    frequency: 'low',
    category: 'generation',
    keywords: ['client', 'sdk', 'typescript', 'api', 'generate'],
    description: 'Generate API client code from spec',
    defer_loading: true,
  },
  {
    name: 'validate_api',
    server: 'api-designer',
    frequency: 'low',
    category: 'analysis',
    keywords: ['validate', 'api', 'spec', 'check', 'lint'],
    description: 'Validate API design for best practices',
    defer_loading: true,
  },
  {
    name: 'generate_mock_server',
    server: 'api-designer',
    frequency: 'low',
    category: 'generation',
    keywords: ['mock', 'server', 'api', 'testing', 'stub'],
    description: 'Generate mock server from API spec',
    defer_loading: true,
  },

  // DB Schema
  {
    name: 'design_schema',
    server: 'db-schema',
    frequency: 'low',
    category: 'design',
    keywords: ['database', 'schema', 'design', 'tables', 'sql'],
    description: 'Design database schema from requirements',
    defer_loading: true,
  },
  {
    name: 'generate_migration',
    server: 'db-schema',
    frequency: 'low',
    category: 'generation',
    keywords: ['migration', 'sql', 'database', 'alter', 'create'],
    description: 'Generate database migration files',
    defer_loading: true,
  },
  {
    name: 'create_er_diagram',
    server: 'db-schema',
    frequency: 'low',
    category: 'documentation',
    keywords: ['er', 'diagram', 'mermaid', 'plantuml', 'visual'],
    description: 'Create ER diagram from schema',
    defer_loading: true,
  },
  {
    name: 'optimize_indexes',
    server: 'db-schema',
    frequency: 'low',
    category: 'analysis',
    keywords: ['index', 'optimize', 'performance', 'database'],
    description: 'Suggest index optimizations',
    defer_loading: true,
  },
  {
    name: 'normalize_schema',
    server: 'db-schema',
    frequency: 'low',
    category: 'refactoring',
    keywords: ['normalize', 'schema', 'nf', 'database', 'redundancy'],
    description: 'Analyze and suggest normalization improvements',
    defer_loading: true,
  },
  {
    name: 'generate_seed_data',
    server: 'db-schema',
    frequency: 'low',
    category: 'generation',
    keywords: ['seed', 'data', 'test', 'fake', 'generate'],
    description: 'Generate seed data for testing',
    defer_loading: true,
  },
  {
    name: 'validate_schema',
    server: 'db-schema',
    frequency: 'low',
    category: 'analysis',
    keywords: ['validate', 'schema', 'check', 'constraints'],
    description: 'Validate database schema design',
    defer_loading: true,
  },
  {
    name: 'analyze_schema',
    server: 'db-schema',
    frequency: 'low',
    category: 'analysis',
    keywords: ['analyze', 'schema', 'metrics', 'complexity'],
    description: 'Analyze schema complexity and characteristics',
    defer_loading: true,
  },
];

/**
 * Get tools filtered by frequency
 */
export function getToolsByFrequency(frequency: 'high' | 'medium' | 'low'): ToolMetadata[] {
  return TOOL_REGISTRY.filter(t => t.frequency === frequency);
}

/**
 * Get tools filtered by server
 */
export function getToolsByServer(server: string): ToolMetadata[] {
  return TOOL_REGISTRY.filter(t => t.server === server);
}

/**
 * Get tools filtered by category
 */
export function getToolsByCategory(category: string): ToolMetadata[] {
  return TOOL_REGISTRY.filter(t => t.category === category);
}

/**
 * Get immediate (high-frequency) tools that should always be loaded
 */
export function getImmediateTools(): ToolMetadata[] {
  return getToolsByFrequency('high');
}

/**
 * Get deferred (medium + low frequency) tools
 */
export function getDeferredTools(): ToolMetadata[] {
  return TOOL_REGISTRY.filter(t => t.frequency !== 'high');
}

/**
 * Get tools with explicit defer_loading flag
 * These tools should only be loaded when explicitly requested via load_tool
 * Anthropic Advanced Tool Use best practice (Nov 2025)
 */
export function getExplicitlyDeferredTools(): ToolMetadata[] {
  return TOOL_REGISTRY.filter(t => t.defer_loading === true);
}

/**
 * Find a tool by name
 */
export function findToolByName(name: string): ToolMetadata | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

/**
 * Get total count of tools in registry
 */
export function getToolCount(): number {
  return TOOL_REGISTRY.length;
}

/**
 * Category information for progressive disclosure
 */
export interface CategoryInfo {
  name: string;
  description: string;
  toolCount: number;
  examples: string[];
}

/**
 * Category descriptions for the Progressive Disclosure feature
 */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  analysis: 'Code quality, architecture, security analysis',
  generation: 'Generate tests, docs, boilerplate',
  security: 'Vulnerability scanning, secret detection',
  refactoring: 'Code transformation and cleanup',
  design: 'API and database schema design',
  documentation: 'Documentation generation',
  orchestration: 'Workflow and tool coordination',
};

/**
 * Get category statistics for progressive disclosure
 * Phase 4: Progressive Disclosure - Category Index
 */
export function getCategoryStats(): CategoryInfo[] {
  const categoryMap = new Map<string, ToolMetadata[]>();

  // Group tools by category
  for (const tool of TOOL_REGISTRY) {
    const existing = categoryMap.get(tool.category) || [];
    existing.push(tool);
    categoryMap.set(tool.category, existing);
  }

  // Convert to CategoryInfo array
  return Array.from(categoryMap.entries()).map(([name, tools]) => ({
    name,
    description: CATEGORY_DESCRIPTIONS[name] || `${name} tools`,
    toolCount: tools.length,
    examples: tools.slice(0, 2).map(t => t.name),
  }));
}

/**
 * Get tools for a specific MCP server with frequency info
 */
export function getServerTools(
  server: string
): Array<{ name: string; frequency: string; description: string }> {
  return TOOL_REGISTRY.filter(t => t.server === server).map(t => ({
    name: t.name,
    frequency: t.frequency,
    description: t.description,
  }));
}

/**
 * Get list of all MCP server names
 */
export function getServerNames(): string[] {
  return [...new Set(TOOL_REGISTRY.map(t => t.server))];
}
