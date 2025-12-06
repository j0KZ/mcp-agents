/**
 * Smart Reviewer - Tool Definitions with Examples
 *
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 * Examples improve parameter accuracy from 72% to 90%
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

// ============================================================================
// REVIEW_FILE
// ============================================================================

export const REVIEW_FILE_EXAMPLES: ToolExample[] = [
  {
    name: 'Basic review',
    description: 'Review a TypeScript file with default settings',
    input: {
      filePath: 'src/utils/parser.ts',
    },
    output: {
      overallScore: 85,
      issues: [
        {
          type: 'complexity',
          severity: 'warning',
          line: 42,
          message: 'Function has cyclomatic complexity of 15',
        },
      ],
      metrics: {
        loc: 150,
        complexity: 12,
        maintainability: 78,
      },
    },
  },
  {
    name: 'Strict review with metrics',
    description: 'Comprehensive review with strict severity and full metrics',
    input: {
      filePath: 'src/core/engine.ts',
      config: {
        severity: 'strict',
        includeMetrics: true,
      },
    },
    output: {
      overallScore: 72,
      issues: [
        {
          type: 'security',
          severity: 'error',
          line: 15,
          message: 'Potential command injection vulnerability',
        },
        {
          type: 'complexity',
          severity: 'warning',
          line: 89,
          message: 'Nested conditionals exceed recommended depth',
        },
      ],
      metrics: {
        loc: 320,
        complexity: 28,
        maintainability: 65,
        commentDensity: 0.12,
      },
    },
  },
];

export const REVIEW_FILE_DEFINITION = {
  name: 'review_file',
  description: `Review a code file and provide detailed analysis with issues, metrics, and suggestions.
Keywords: review, analyze, lint, quality, issues, bugs, code smell, complexity, maintainability.
Use when: checking code quality, finding bugs, before commit, PR review.

Returns: Object containing:
- overallScore (number): Quality score 0-100
- issues (array): List of {type, severity, line, message}
- metrics (object): {loc, complexity, maintainability, commentDensity?}
- suggestions (array): Improvement recommendations`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      filePath: {
        type: 'string' as const,
        description: 'Path to the file to review',
      },
      config: {
        type: 'object' as const,
        description: 'Optional review configuration',
        properties: {
          severity: {
            type: 'string' as const,
            enum: ['strict', 'moderate', 'lenient'],
            description: 'Review severity level',
          },
          autoFix: {
            type: 'boolean' as const,
            description: 'Automatically apply fixes when possible',
          },
          includeMetrics: {
            type: 'boolean' as const,
            description: 'Include code metrics in the result',
          },
        },
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['filePath'],
  },
  examples: REVIEW_FILE_EXAMPLES,
};

// ============================================================================
// BATCH_REVIEW
// ============================================================================

export const BATCH_REVIEW_EXAMPLES: ToolExample[] = [
  {
    name: 'Review multiple files',
    description: 'Review all files in a directory',
    input: {
      filePaths: ['src/utils/parser.ts', 'src/utils/validator.ts', 'src/core/index.ts'],
    },
    output: {
      totalFiles: 3,
      averageScore: 82,
      totalIssues: 7,
      results: [
        { file: 'src/utils/parser.ts', score: 85, issues: 2 },
        { file: 'src/utils/validator.ts', score: 78, issues: 3 },
        { file: 'src/core/index.ts', score: 83, issues: 2 },
      ],
    },
  },
  {
    name: 'Strict batch review',
    description: 'Review files with strict configuration',
    input: {
      filePaths: ['src/api/routes.ts', 'src/api/middleware.ts'],
      config: {
        severity: 'strict',
        includeMetrics: true,
      },
    },
    output: {
      totalFiles: 2,
      averageScore: 68,
      totalIssues: 12,
      results: [
        {
          file: 'src/api/routes.ts',
          score: 65,
          issues: 8,
          metrics: { complexity: 35 },
        },
        {
          file: 'src/api/middleware.ts',
          score: 71,
          issues: 4,
          metrics: { complexity: 18 },
        },
      ],
    },
  },
];

export const BATCH_REVIEW_DEFINITION = {
  name: 'batch_review',
  description: `Review multiple files at once and get aggregated results.
Keywords: batch, multiple, bulk, review, analyze.
Use when: reviewing PR changes, scanning directories, analyzing module.

Returns: Object containing:
- totalFiles (number): Number of files reviewed
- averageScore (number): Average quality score 0-100
- totalIssues (number): Sum of all issues found
- results (array): Per-file {file, score, issues, metrics?}`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      filePaths: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description: 'Array of file paths to review',
      },
      config: {
        type: 'object' as const,
        description: 'Optional review configuration',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['filePaths'],
  },
  examples: BATCH_REVIEW_EXAMPLES,
};

// ============================================================================
// GENERATE_AUTO_FIXES
// ============================================================================

export const GENERATE_AUTO_FIXES_EXAMPLES: ToolExample[] = [
  {
    name: 'Preview all fixes',
    description: 'Generate fixes preview without applying',
    input: {
      filePath: 'src/services/user.ts',
    },
    output: {
      success: true,
      file: 'src/services/user.ts',
      summary: {
        total: 5,
        safe: 4,
        requiresReview: 1,
      },
      fixes: [
        {
          type: 'remove-console',
          line: 23,
          description: 'Remove console.log statement',
          confidence: 0.95,
          safe: true,
        },
        {
          type: 'add-null-check',
          line: 45,
          description: 'Add null check before property access',
          confidence: 0.88,
          safe: true,
        },
      ],
      preview:
        '--- a/src/services/user.ts\n+++ b/src/services/user.ts\n@@ -23 +23 @@\n-console.log(user);',
    },
  },
  {
    name: 'Safe fixes only',
    description: 'Generate only safe, auto-applicable fixes',
    input: {
      filePath: 'src/utils/helper.ts',
      safeOnly: true,
    },
    output: {
      success: true,
      file: 'src/utils/helper.ts',
      summary: {
        total: 3,
        safe: 3,
        requiresReview: 0,
      },
      fixes: [
        {
          type: 'remove-unused-import',
          line: 2,
          description: 'Remove unused import: lodash',
          confidence: 1.0,
          safe: true,
        },
      ],
    },
  },
];

export const GENERATE_AUTO_FIXES_DEFINITION = {
  name: 'generate_auto_fixes',
  description: `Generate automatic fixes using Pareto principle (20% fixes solve 80% issues). Returns preview without applying changes.
Keywords: fix, auto-fix, pareto, preview, suggestions, improvements.
Use when: previewing fixes before applying, reviewing suggested changes.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      filePath: {
        type: 'string' as const,
        description: 'Path to the file to analyze for auto-fixes',
      },
      safeOnly: {
        type: 'boolean' as const,
        description: 'Only return safe fixes that can be auto-applied (default: false)',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['filePath'],
  },
  examples: GENERATE_AUTO_FIXES_EXAMPLES,
};

// ============================================================================
// APPLY_AUTO_FIXES
// ============================================================================

export const APPLY_AUTO_FIXES_EXAMPLES: ToolExample[] = [
  {
    name: 'Apply safe fixes',
    description: 'Apply only safe fixes with backup',
    input: {
      filePath: 'src/components/Button.tsx',
      safeOnly: true,
    },
    output: {
      success: true,
      file: 'src/components/Button.tsx',
      backup: 'src/components/Button.tsx.backup',
      fixesApplied: 3,
      summary: {
        consoleLogs: 2,
        unusedImports: 1,
      },
      fixes: [
        { type: 'remove-console', line: 15, description: 'Removed console.log' },
        { type: 'remove-console', line: 28, description: 'Removed console.warn' },
        { type: 'remove-unused-import', line: 3, description: 'Removed unused: moment' },
      ],
    },
  },
  {
    name: 'Apply all fixes',
    description: 'Apply all fixes including those requiring review',
    input: {
      filePath: 'src/utils/legacy.ts',
      safeOnly: false,
    },
    output: {
      success: true,
      file: 'src/utils/legacy.ts',
      backup: 'src/utils/legacy.ts.backup',
      fixesApplied: 7,
      summary: {
        consoleLogs: 3,
        nullChecks: 2,
        typeAnnotations: 2,
      },
    },
  },
];

export const APPLY_AUTO_FIXES_DEFINITION = {
  name: 'apply_auto_fixes',
  description: `Apply generated auto-fixes to a file. SAFE: Creates backup before applying.
Keywords: apply, fix, auto-fix, modify, update, refactor.
Use when: applying suggested fixes, cleaning up code, removing console logs.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      filePath: {
        type: 'string' as const,
        description: 'Path to the file to fix',
      },
      safeOnly: {
        type: 'boolean' as const,
        description: 'Only apply safe fixes (default: true)',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['filePath'],
  },
  examples: APPLY_AUTO_FIXES_EXAMPLES,
};

// ============================================================================
// APPLY_FIXES (legacy)
// ============================================================================

export const APPLY_FIXES_EXAMPLES: ToolExample[] = [
  {
    name: 'Apply fixes from review',
    description: 'Apply automatic fixes based on review results',
    input: {
      filePath: 'src/handlers/api.ts',
    },
    output: {
      success: true,
      file: 'src/handlers/api.ts',
      fixesApplied: 4,
    },
  },
];

export const APPLY_FIXES_DEFINITION = {
  name: 'apply_fixes',
  description: `Apply automatic fixes to a file based on review results.
Keywords: apply, fix, automatic.
Use when: applying fixes after review.`,
  inputSchema: {
    type: 'object' as const,
    properties: {
      filePath: {
        type: 'string' as const,
        description: 'Path to the file to fix',
      },
      response_format: RESPONSE_FORMAT_SCHEMA,
    },
    required: ['filePath'],
  },
  examples: APPLY_FIXES_EXAMPLES,
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const HEALTH_EXAMPLES: ToolExample[] = [
  {
    name: 'Quick health check',
    description: 'Check if server is running',
    input: {},
    output: {
      status: 'healthy',
      version: '1.0.35',
      uptime: 3600,
    },
  },
  {
    name: 'Verbose diagnostics',
    description: 'Get detailed diagnostic information',
    input: {
      verbose: true,
    },
    output: {
      status: 'healthy',
      version: '1.0.35',
      sharedVersion: '1.0.33',
      uptime: 3600,
      memory: { used: 45, total: 512 },
      environment: {
        ide: 'vscode',
        transport: 'stdio',
      },
    },
  },
];

export const HEALTH_DEFINITION = {
  name: '__health',
  description: 'Check MCP server health and diagnostics (internal tool)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      verbose: {
        type: 'boolean' as const,
        description: 'Include detailed diagnostic information',
      },
    },
  },
  examples: HEALTH_EXAMPLES,
};

// ============================================================================
// ALL TOOL DEFINITIONS
// ============================================================================

export const SMART_REVIEWER_TOOLS = [
  HEALTH_DEFINITION,
  REVIEW_FILE_DEFINITION,
  BATCH_REVIEW_DEFINITION,
  APPLY_FIXES_DEFINITION,
  GENERATE_AUTO_FIXES_DEFINITION,
  APPLY_AUTO_FIXES_DEFINITION,
];
