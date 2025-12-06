/**
 * Orchestrator MCP - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * Phase 3: Deferred Loading Architecture - Meta-tools for tool discovery
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

export const RUN_WORKFLOW_EXAMPLES: ToolExample[] = [
  {
    name: 'Run pre-commit workflow',
    description: 'Execute pre-commit checks on staged files',
    input: {
      workflow: 'pre-commit',
      files: ['src/utils/validator.ts', 'src/api/users.ts'],
    },
    output: {
      success: true,
      workflow: 'pre-commit',
      duration: 3450,
      steps: [
        { name: 'review', success: true, duration: 1200 },
        { name: 'security', success: true, duration: 800 },
        { name: 'test', success: true, duration: 1450 },
      ],
    },
  },
  {
    name: 'Security-focused review',
    description: 'Quick security scan using focus parameter',
    input: {
      focus: 'security',
      projectPath: './src',
    },
    output: {
      success: true,
      workflow: 'security-scan',
      focus: 'security',
      duration: 1500,
      findings: { critical: 0, high: 1, medium: 3 },
    },
  },
  {
    name: 'Get clarification options',
    description: 'Call without parameters to get focus options',
    input: {},
    output: {
      needsClarification: true,
      message: 'What would you like me to focus on?',
      options: [
        { focus: 'security', description: 'Fast security scan' },
        { focus: 'quality', description: 'Code quality review with tests' },
        { focus: 'performance', description: 'Architecture and performance analysis' },
        { focus: 'comprehensive', description: 'Complete multi-dimensional analysis' },
      ],
    },
  },
];

export const RUN_SEQUENCE_EXAMPLES: ToolExample[] = [
  {
    name: 'Custom analysis sequence',
    description: 'Run custom sequence of MCP tools',
    input: {
      steps: [
        {
          name: 'review',
          mcp: 'smart-reviewer',
          tool: 'review_file',
          params: { filePath: 'src/index.ts' },
        },
        {
          name: 'security',
          mcp: 'security-scanner',
          tool: 'scan_file',
          params: { filePath: 'src/index.ts' },
        },
        {
          name: 'tests',
          mcp: 'test-generator',
          tool: 'generate_tests',
          params: { sourceFile: 'src/index.ts' },
          dependsOn: ['review'],
        },
      ],
    },
    output: {
      success: true,
      duration: 4500,
      steps: [
        { name: 'review', success: true, duration: 1500 },
        { name: 'security', success: true, duration: 1200 },
        { name: 'tests', success: true, duration: 1800 },
      ],
    },
  },
];

export const LIST_WORKFLOWS_EXAMPLES: ToolExample[] = [
  {
    name: 'List available workflows',
    description: 'Get all pre-built workflow definitions',
    input: {},
    output: {
      workflows: [
        {
          id: 'pre-commit',
          name: 'Pre-Commit',
          description: 'Review, lint, and test staged changes',
          steps: 3,
        },
        {
          id: 'pre-merge',
          name: 'Pre-Merge',
          description: 'Comprehensive PR validation',
          steps: 5,
        },
        {
          id: 'quality-audit',
          name: 'Quality Audit',
          description: 'Deep code quality analysis with reports',
          steps: 7,
        },
      ],
    },
  },
];

// Phase 3: Deferred Loading Meta-tools

export const SEARCH_TOOLS_EXAMPLES: ToolExample[] = [
  {
    name: 'Search by keyword',
    description: 'Find tools related to security',
    input: { query: 'security vulnerability' },
    output: {
      tools: [
        { name: 'scan_project', server: 'security-scanner', relevance: 0.95, category: 'security' },
        { name: 'scan_file', server: 'security-scanner', relevance: 0.88, category: 'security' },
        { name: 'scan_secrets', server: 'security-scanner', relevance: 0.82, category: 'security' },
      ],
      totalAvailable: 47,
    },
  },
  {
    name: 'Search by category',
    description: 'Find all refactoring tools',
    input: { category: 'refactoring', limit: 5 },
    output: {
      tools: [
        { name: 'extract_function', server: 'refactor-assistant', category: 'refactoring' },
        { name: 'simplify_conditionals', server: 'refactor-assistant', category: 'refactoring' },
        { name: 'remove_dead_code', server: 'refactor-assistant', category: 'refactoring' },
      ],
      totalAvailable: 47,
    },
  },
  {
    name: 'Search high-frequency tools',
    description: 'Find always-available core tools',
    input: { frequency: 'high' },
    output: {
      tools: [
        { name: 'review_file', server: 'smart-reviewer', frequency: 'high' },
        { name: 'generate_tests', server: 'test-generator', frequency: 'high' },
        { name: 'analyze_architecture', server: 'architecture-analyzer', frequency: 'high' },
        { name: 'run_workflow', server: 'orchestrator', frequency: 'high' },
      ],
      totalAvailable: 47,
    },
  },
];

export const LOAD_TOOL_EXAMPLES: ToolExample[] = [
  {
    name: 'Load a low-frequency tool',
    description: 'Load API designer tool into context',
    input: { toolName: 'generate_openapi', server: 'api-designer' },
    output: {
      success: true,
      toolName: 'generate_openapi',
      server: 'api-designer',
      message: 'Tool loaded successfully. You can now use generate_openapi.',
    },
  },
  {
    name: 'Load database schema tool',
    description: 'Load schema design tool',
    input: { toolName: 'design_schema' },
    output: {
      success: true,
      toolName: 'design_schema',
      server: 'db-schema',
      message: 'Tool loaded successfully. You can now use design_schema.',
    },
  },
];

// Phase 4: Progressive Disclosure - Category Index

export const LIST_CAPABILITIES_EXAMPLES: ToolExample[] = [
  {
    name: 'List all capabilities',
    description: 'Get overview of all tool categories',
    input: {},
    output: {
      categories: [
        {
          name: 'analysis',
          description: 'Code quality, architecture, security analysis',
          toolCount: 14,
          examples: ['review_file', 'analyze_architecture'],
        },
        {
          name: 'generation',
          description: 'Generate tests, docs, boilerplate',
          toolCount: 11,
          examples: ['generate_tests', 'generate_jsdoc'],
        },
        {
          name: 'security',
          description: 'Vulnerability scanning, secret detection',
          toolCount: 5,
          examples: ['scan_project', 'scan_secrets'],
        },
        {
          name: 'refactoring',
          description: 'Code transformation and cleanup',
          toolCount: 8,
          examples: ['extract_function', 'remove_dead_code'],
        },
        {
          name: 'design',
          description: 'API and database schema design',
          toolCount: 6,
          examples: ['design_rest_api', 'design_schema'],
        },
        {
          name: 'documentation',
          description: 'Documentation generation',
          toolCount: 5,
          examples: ['generate_readme', 'generate_changelog'],
        },
        {
          name: 'orchestration',
          description: 'Workflow and tool coordination',
          toolCount: 5,
          examples: ['run_workflow', 'search_tools'],
        },
      ],
      totalTools: 47,
      hint: 'Use search_tools({ category: "name" }) to explore a category',
    },
  },
  {
    name: 'Filter by server',
    description: 'Get capabilities for a specific MCP server',
    input: { server: 'smart-reviewer' },
    output: {
      server: 'smart-reviewer',
      tools: [
        { name: 'review_file', frequency: 'high', description: 'Review a code file for issues' },
        { name: 'batch_review', frequency: 'high', description: 'Review multiple files at once' },
        {
          name: 'generate_auto_fixes',
          frequency: 'medium',
          description: 'Generate Pareto auto-fixes',
        },
        { name: 'apply_auto_fixes', frequency: 'medium', description: 'Apply generated fixes' },
      ],
      totalTools: 4,
    },
  },
];

export const ORCHESTRATOR_TOOLS = [
  {
    name: 'run_workflow',
    description: `Execute intelligent workflow with optional focus detection.

IMPORTANT: Always call this tool when user asks to "review my code", "check my code", or "analyze this".

**Smart Focus Detection:**
- Ambiguous request → Call WITHOUT workflow parameter to get clarification
- Specific request → Call WITH workflow or focus parameter

**Focus Areas (Auto-selects appropriate workflow):**
- security: Fast security scan
- quality: Code quality review with tests
- performance: Architecture and performance analysis
- comprehensive: Complete multi-dimensional analysis

**Direct Workflows (Bypass focus selection):**
- pre-commit: Git pre-commit checks
- pre-merge: PR validation
- quality-audit: Deep audit with reports

Keywords: workflow, review, analyze, check, pre-commit, pre-merge, audit.
Use when: code review, PR validation, quality checks, security scans.

Returns: Object containing:
- success (boolean): Whether workflow completed successfully
- workflow (string): Workflow name that was executed
- focus (string): Focus area used (if any)
- duration (number): Total execution time in ms
- steps (array): List of {name, success, duration, data?}
- errors (array): Any errors encountered`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        workflow: {
          type: 'string' as const,
          enum: ['pre-commit', 'pre-merge', 'quality-audit'],
          description: 'Explicit workflow name (optional)',
        },
        focus: {
          type: 'string' as const,
          enum: ['security', 'quality', 'performance', 'comprehensive'],
          description: 'Focus area for smart workflow selection (optional)',
        },
        files: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Files to process (optional for project-level)',
        },
        projectPath: {
          type: 'string' as const,
          description: 'Project root (optional, defaults to cwd)',
        },
        language: {
          type: 'string' as const,
          enum: ['en', 'es'],
          description: 'Response language (optional, auto-detects)',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: [],
    },
    examples: RUN_WORKFLOW_EXAMPLES,
  },
  {
    name: 'run_sequence',
    description: `Execute a custom sequence of MCP tools with full control over steps and dependencies.
Keywords: sequence, custom, pipeline, chain, steps, dependencies.
Use when: custom workflows, complex multi-tool operations, conditional execution.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        steps: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              name: { type: 'string' as const, description: 'Step name for reference' },
              mcp: { type: 'string' as const, description: 'MCP to invoke (e.g., smart-reviewer)' },
              tool: { type: 'string' as const, description: 'Tool to call (e.g., review_file)' },
              params: { type: 'object' as const, description: 'Tool parameters' },
              dependsOn: {
                type: 'array' as const,
                items: { type: 'string' as const },
                description: 'Step dependencies (optional)',
              },
            },
            required: ['name', 'mcp', 'tool'],
          },
          description: 'Sequence of MCP tool calls',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['steps'],
    },
    examples: RUN_SEQUENCE_EXAMPLES,
  },
  {
    name: 'list_workflows',
    description: `List all available pre-built workflows with descriptions.
Keywords: list, workflows, available, options.
Use when: discovering workflows, getting help, workflow selection.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
    },
    examples: LIST_WORKFLOWS_EXAMPLES,
  },
  // Phase 3: Deferred Loading Meta-tools
  {
    name: 'search_tools',
    description: `Search available tools by keyword, category, or frequency.
Use this to discover tools before calling them. Essential for finding the right tool for a task.

**Search Options:**
- query: Free-text search (matches tool names, descriptions, keywords)
- category: Filter by category (analysis, generation, refactoring, design, security, orchestration, documentation)
- frequency: Filter by loading frequency (high = always loaded, medium = on-demand, low = rare use)
- server: Filter by MCP server name
- limit: Max results (default 10)

Keywords: search, find, discover, tools, available, list.
Use when: discovering tools, finding the right tool, exploring capabilities.

Returns: Object containing:
- tools (array): List of {name, server, description, category, frequency, relevance, matchedKeywords, loaded}
- totalAvailable (number): Total tools in ecosystem
- query (string): Search query used
- filters (object): Applied filters {category?, frequency?, server?}`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string' as const,
          description: 'Search query (keywords, tool name, or description)',
        },
        category: {
          type: 'string' as const,
          enum: [
            'analysis',
            'generation',
            'refactoring',
            'design',
            'security',
            'orchestration',
            'documentation',
          ],
          description: 'Filter by tool category',
        },
        frequency: {
          type: 'string' as const,
          enum: ['high', 'medium', 'low'],
          description: 'Filter by usage frequency (high = always loaded)',
        },
        server: {
          type: 'string' as const,
          description: 'Filter by MCP server name',
        },
        limit: {
          type: 'number' as const,
          description: 'Maximum number of results (default 10)',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
    },
    examples: SEARCH_TOOLS_EXAMPLES,
  },
  {
    name: 'load_tool',
    description: `Load a deferred tool into context for use.
Required before using low-frequency tools. High-frequency tools are always available.

The tool will be loaded from its MCP server and made available for the current session.

Keywords: load, activate, enable, tool.
Use when: need to use a low/medium frequency tool that isn't loaded yet.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        toolName: {
          type: 'string' as const,
          description: 'Name of the tool to load',
        },
        server: {
          type: 'string' as const,
          description: 'MCP server that provides the tool (optional, auto-detected)',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['toolName'],
    },
    examples: LOAD_TOOL_EXAMPLES,
  },
  // Phase 4: Progressive Disclosure - Category Index
  {
    name: 'list_capabilities',
    description: `List all available tool categories with descriptions and counts.
Use this as a starting point to discover what the @j0kz MCP ecosystem can do.

**Overview Mode (no parameters):**
Returns all categories with tool counts and example tools.
Perfect for initial exploration of available capabilities.

**Server Mode (server parameter):**
Returns tools available from a specific MCP server with frequency info.
Use this to understand what a specific server offers.

Keywords: capabilities, categories, list, discover, overview, servers.
Use when: initial exploration, discovering capabilities, learning available tools.

Returns: Object containing:
- categories (array): List of {name, description, toolCount, examples}
- totalTools (number): Total tools in ecosystem
- hint (string): Suggestion for next action`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        server: {
          type: 'string' as const,
          description: 'Filter by specific MCP server (optional)',
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
    },
    examples: LIST_CAPABILITIES_EXAMPLES,
  },
];
