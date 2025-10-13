/**
 * Enhanced Error System
 * Provides actionable error messages with solutions and debugging context
 */

import { MCPError, ErrorCode, ERROR_CODES } from './error-codes.js';
import { EnvironmentDetector } from '../runtime/environment-detector.js';

export interface ErrorSolution {
  description: string;
  steps: string[];
  documentation?: string;
  automated?: boolean;
}

export interface EnhancedErrorResponse {
  success: false;
  error: string;
  code: ErrorCode;
  userMessage: string;
  solutions: ErrorSolution[];
  debugInfo?: Record<string, unknown>;
  timestamp: string;
}

export class EnhancedError {
  /**
   * Create user-friendly error response from MCPError
   */
  static fromMCPError(error: MCPError, context?: Record<string, unknown>): EnhancedErrorResponse {
    const solutions = this.getSolutions(error.code, context);
    const userMessage = this.getUserMessage(error.code, context);

    return {
      success: false,
      error: error.message,
      code: error.code,
      userMessage,
      solutions,
      debugInfo: context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user-friendly message for error code
   */
  private static getUserMessage(code: ErrorCode, context?: Record<string, unknown>): string {
    const messages: Record<ErrorCode, string> = {
      // Test Generator
      TEST_001: `The file path "${context?.filePath || 'unknown'}" is invalid.`,
      TEST_002: `The test framework "${context?.framework || 'unknown'}" is not supported.`,
      TEST_003: `Cannot find file: ${context?.filePath || 'unknown'}`,
      TEST_004: `Permission denied accessing: ${context?.filePath || 'unknown'}`,
      TEST_005: `Failed to read file: ${context?.filePath || 'unknown'}`,
      TEST_006: `The file is empty: ${context?.filePath || 'unknown'}`,
      TEST_007: `File is too large to process: ${context?.filePath || 'unknown'}`,
      TEST_008: `No testable code found in: ${context?.filePath || 'unknown'}`,

      // Smart Reviewer
      REV_001: 'Please provide at least one file to review.',
      REV_002: `Unknown tool requested: ${context?.tool || 'unknown'}`,
      REV_003: `The file is empty: ${context?.filePath || 'unknown'}`,
      REV_004: `Code analysis failed for: ${context?.filePath || 'unknown'}`,
      REV_005: `Invalid severity level: ${context?.severity || 'unknown'}`,

      // Security Scanner
      SEC_001: `Invalid file path: ${context?.filePath || 'unknown'}`,
      SEC_002: `Security scan failed for: ${context?.target || 'unknown'}`,
      SEC_003: `Invalid scan configuration provided.`,
      SEC_004: `Unknown security scan tool: ${context?.tool || 'unknown'}`,

      // Refactor Assistant
      REF_001: 'Invalid or empty code input provided.',
      REF_002: `Code is too large to refactor (>${context?.maxSize || '100'}KB).`,
      REF_003: `Unknown refactoring pattern: ${context?.pattern || 'unknown'}`,
      REF_004: `Refactoring failed: ${context?.reason || 'unknown error'}`,
      REF_005: `Invalid line range: ${context?.start}-${context?.end}`,
      REF_006: `Invalid variable name: ${context?.name || 'unknown'}`,

      // Architecture Analyzer
      ARCH_001: `Invalid project path: ${context?.path || 'unknown'}`,
      ARCH_002: `Module not found: ${context?.module || 'unknown'}`,
      ARCH_003: `Unknown analysis tool: ${context?.tool || 'unknown'}`,
      ARCH_004: 'Circular dependency detected in project.',

      // API Designer
      API_001: 'Invalid API configuration provided.',
      API_002: 'API specification validation failed.',
      API_003: 'Failed to generate API specification.',
      API_004: `Unsupported API style: ${context?.style || 'unknown'}`,
      API_005: 'Mock server generation failed.',
      API_006: `Unknown API designer tool: ${context?.tool || 'unknown'}`,

      // DB Schema
      DB_001: 'Missing required parameters: requirements and options.database',
      DB_002: 'Missing required parameters: schema and description',
      DB_003: 'Missing required parameter: schema',
      DB_004: `Unsupported database type: ${context?.database || 'unknown'}`,
      DB_005: 'Database migration generation failed.',
      DB_006: 'ER diagram generation failed.',
      DB_007: 'Index optimization failed.',
      DB_008: 'Schema normalization failed.',
      DB_009: `Unknown database tool: ${context?.tool || 'unknown'}`,

      // Doc Generator
      DOC_001: `Invalid project path: ${context?.path || 'unknown'}`,
      DOC_002: 'Documentation generation failed.',
      DOC_003: 'No documentation generated.',
      DOC_004: `Failed to write file: ${context?.file || 'unknown'}`,
      DOC_005: `Unknown documentation tool: ${context?.tool || 'unknown'}`,

      // Orchestrator
      ORCH_001: 'Missing required workflow argument.',
      ORCH_002: `Unknown workflow name: ${context?.workflow || 'unknown'}`,
      ORCH_003: `Unknown tool in sequence: ${context?.tool || 'unknown'}`,
      ORCH_004: 'MCP communication failed.',
      ORCH_005: 'Workflow execution timeout.',
      ORCH_006: 'Circuit breaker is open - MCP unavailable.',
      ORCH_007: 'Invalid workflow configuration.',
      ORCH_008: 'Step dependency cycle detected.',

      // Validation
      VAL_001: 'Invalid input provided.',
      VAL_002: `Path traversal detected: ${context?.path || 'unknown'}`,
      VAL_003: `File too large: ${context?.size || 'unknown'}`,
      VAL_004: `Invalid identifier: ${context?.id || 'unknown'}`,
      VAL_005: `Invalid line range: ${context?.range || 'unknown'}`,
    };

    return messages[code] || ERROR_CODES[code];
  }

  /**
   * Get actionable solutions for error code
   */
  private static getSolutions(
    code: ErrorCode,
    _context?: Record<string, unknown>
  ): ErrorSolution[] {
    const env = EnvironmentDetector.detect();
    const solutions: Partial<Record<ErrorCode, ErrorSolution[]>> = {
      TEST_003: [
        {
          description: 'Verify the file path is correct',
          steps: [
            'Check if the file path is spelled correctly',
            'Use an absolute path instead of relative',
            `Try: ${env.projectRoot ? path.join(env.projectRoot, '<your-file>') : '<absolute-path>'}`,
          ],
        },
        {
          description: 'Check file permissions',
          steps: [
            'Ensure you have read permissions for the file',
            env.platform !== 'win32'
              ? 'Try: chmod +r <file-path>'
              : 'Check file properties in Windows Explorer',
          ],
        },
      ],

      TEST_004: [
        {
          description: 'Fix file permissions',
          steps: [
            env.platform !== 'win32'
              ? 'Run: chmod +r <file-path>'
              : 'Right-click file → Properties → Security → Grant read permissions',
          ],
        },
      ],

      REV_001: [
        {
          description: 'Provide files to review',
          steps: [
            'Add at least one file path to the filePaths array',
            'Example: { "filePaths": ["src/auth.js", "src/utils.js"] }',
          ],
        },
      ],

      SEC_001: [
        {
          description: 'Use a valid file path',
          steps: [
            'Ensure the path does not contain ".." (parent directory traversal)',
            'Use absolute paths when possible',
            'Check for typos in the file path',
          ],
        },
      ],

      ARCH_001: [
        {
          description: 'Provide a valid project directory',
          steps: [
            'Ensure the path points to a directory, not a file',
            'Check that the directory exists',
            `Current working directory: ${env.workingDir}`,
            `Project root detected: ${env.projectRoot || 'None'}`,
          ],
        },
      ],

      ORCH_006: [
        {
          description: 'MCP server is temporarily unavailable',
          steps: [
            'Wait a moment and try again',
            'Check if the MCP server is running',
            'Restart your IDE to refresh MCP connections',
            'Run: npx @j0kz/mcp-agents@latest diagnose',
          ],
        },
      ],
    };

    // Default solution if no specific ones exist
    const defaultSolution: ErrorSolution = {
      description: 'Get more help',
      steps: [
        'Run diagnostic tool: npx @j0kz/mcp-agents@latest diagnose',
        'Check documentation: https://github.com/j0KZ/mcp-agents/wiki',
        'Report issue: https://github.com/j0KZ/mcp-agents/issues',
      ],
      documentation: 'https://github.com/j0KZ/mcp-agents/wiki',
    };

    return solutions[code] || [defaultSolution];
  }

  /**
   * Format error for JSON response
   */
  static toJSON(error: MCPError, context?: Record<string, unknown>, includeDebug = true): string {
    const enhanced = this.fromMCPError(error, context);

    if (!includeDebug) {
      delete enhanced.debugInfo;
    }

    return JSON.stringify(enhanced, null, 2);
  }

  /**
   * Format error for console output
   */
  static toConsole(error: MCPError, context?: Record<string, unknown>): string {
    const enhanced = this.fromMCPError(error, context);
    const lines: string[] = [];

    lines.push(`\n❌ Error: ${enhanced.userMessage}`);
    lines.push(`   Code: ${enhanced.code}`);

    if (enhanced.solutions.length > 0) {
      lines.push('\n💡 Solutions:');
      enhanced.solutions.forEach((solution, idx) => {
        lines.push(`\n   ${idx + 1}. ${solution.description}`);
        solution.steps.forEach(step => {
          lines.push(`      • ${step}`);
        });
      });
    }

    return lines.join('\n');
  }
}

// Helper for path module
import * as path from 'path';
