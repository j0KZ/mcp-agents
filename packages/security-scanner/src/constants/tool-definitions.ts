/**
 * Security Scanner - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */

import { ToolExample, RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';

export const SCAN_FILE_EXAMPLES: ToolExample[] = [
  {
    name: 'Basic file scan',
    description: 'Scan a single file for vulnerabilities',
    input: { filePath: 'src/api/users.ts' },
    output: {
      success: true,
      filePath: 'src/api/users.ts',
      findingsCount: 2,
      findings: [
        {
          type: 'sql_injection',
          severity: 'high',
          line: 45,
          message: 'Unsanitized query parameter',
        },
      ],
    },
  },
  {
    name: 'Scan with config',
    description: 'Scan file with specific vulnerability types',
    input: {
      filePath: 'src/auth/login.ts',
      config: { scanSecrets: true, scanSQLInjection: true, minSeverity: 'medium' },
    },
    output: {
      success: true,
      findingsCount: 3,
      findings: [{ type: 'hardcoded_secret', severity: 'critical', line: 12 }],
    },
  },
];

export const SCAN_PROJECT_EXAMPLES: ToolExample[] = [
  {
    name: 'Full project scan',
    description: 'Scan entire project for all vulnerability types',
    input: { projectPath: './src' },
    output: {
      success: true,
      filesScanned: 45,
      scanDuration: 2340,
      securityScore: 72,
      findings: [],
      findingsBySeverity: { critical: 0, high: 2, medium: 5, low: 8, info: 3 },
    },
  },
];

export const SCAN_SECRETS_EXAMPLES: ToolExample[] = [
  {
    name: 'Scan for secrets',
    description: 'Find hardcoded API keys, passwords, tokens',
    input: { targetPath: './src' },
    output: {
      success: true,
      secretsFound: 3,
      findings: [{ type: 'api_key', severity: 'critical', line: 5, pattern: 'AWS Access Key' }],
    },
  },
];

export const SCAN_VULNERABILITIES_EXAMPLES: ToolExample[] = [
  {
    name: 'Scan specific vulnerabilities',
    description: 'Scan for SQL injection and XSS only',
    input: {
      targetPath: './src/api',
      vulnerabilityTypes: ['sql_injection', 'xss'],
    },
    output: {
      success: true,
      vulnerabilityTypes: ['sql_injection', 'xss'],
      findingsCount: 4,
      findings: [],
    },
  },
];

export const GENERATE_SECURITY_REPORT_EXAMPLES: ToolExample[] = [
  {
    name: 'Generate markdown report',
    description: 'Generate comprehensive security report',
    input: { projectPath: './src', outputPath: './security-report.md' },
    output: {
      title: 'Security Vulnerability Assessment Report',
      summary: 'Scanned 45 files in 2340ms. Found 5 vulnerabilities. Security Score: 72/100',
    },
  },
];

export const SECURITY_SCANNER_TOOLS = [
  {
    name: 'scan_file',
    description: `Scan a single file for security vulnerabilities including secrets, SQL injection, XSS, and OWASP Top 10 issues.
Keywords: scan, security, vulnerability, file, secrets, injection, xss, owasp.
Use when: checking individual files, quick security check before commit.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        filePath: { type: 'string' as const, description: 'Absolute path to the file to scan' },
        config: {
          type: 'object' as const,
          description: 'Optional scan configuration',
          properties: {
            scanSecrets: { type: 'boolean' as const },
            scanSQLInjection: { type: 'boolean' as const },
            scanXSS: { type: 'boolean' as const },
            scanOWASP: { type: 'boolean' as const },
            minSeverity: {
              type: 'string' as const,
              enum: ['critical', 'high', 'medium', 'low', 'info'],
            },
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['filePath'],
    },
    examples: SCAN_FILE_EXAMPLES,
  },
  {
    name: 'scan_project',
    description: `Recursively scan an entire project directory for security vulnerabilities.
Keywords: scan, project, directory, recursive, security, audit.
Use when: full security audit, CI/CD pipeline, pre-release check.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: {
          type: 'string' as const,
          description: 'Absolute path to the project directory',
        },
        config: { type: 'object' as const, description: 'Optional scan configuration' },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: SCAN_PROJECT_EXAMPLES,
  },
  {
    name: 'scan_secrets',
    description: `Specifically scan for hardcoded secrets, API keys, passwords, and credentials.
Keywords: secrets, api key, password, credentials, token, hardcoded.
Use when: checking for leaked credentials, pre-commit validation.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        targetPath: { type: 'string' as const, description: 'Path to file or directory to scan' },
        customPatterns: { type: 'array' as const, description: 'Optional custom secret patterns' },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['targetPath'],
    },
    examples: SCAN_SECRETS_EXAMPLES,
  },
  {
    name: 'scan_vulnerabilities',
    description: `Scan for specific vulnerability types (SQL injection, XSS, path traversal, etc.).
Keywords: vulnerability, sql injection, xss, path traversal, command injection.
Use when: targeted security scan, fixing specific vulnerability type.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        targetPath: { type: 'string' as const },
        vulnerabilityTypes: {
          type: 'array' as const,
          items: {
            type: 'string' as const,
            enum: [
              'sql_injection',
              'xss',
              'path_traversal',
              'command_injection',
              'weak_crypto',
              'insecure_deserialization',
            ],
          },
        },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['targetPath', 'vulnerabilityTypes'],
    },
    examples: SCAN_VULNERABILITIES_EXAMPLES,
  },
  {
    name: 'generate_security_report',
    description: `Generate a comprehensive security report in markdown format from scan results.
Keywords: report, markdown, security, audit, documentation.
Use when: creating security documentation, sharing with team, compliance.`,
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: { type: 'string' as const },
        outputPath: { type: 'string' as const },
        config: { type: 'object' as const },
        response_format: RESPONSE_FORMAT_SCHEMA,
      },
      required: ['projectPath'],
    },
    examples: GENERATE_SECURITY_REPORT_EXAMPLES,
  },
];
