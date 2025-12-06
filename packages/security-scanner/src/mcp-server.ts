#!/usr/bin/env node

/**
 * Security Scanner MCP Server
 * Model Context Protocol server for security vulnerability scanning
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  scanFile,
  scanProject,
  ScanConfig,
  ScanResult,
  SecurityFinding,
  SeverityLevel,
  SecurityReport,
} from './index.js';
import * as fs from 'fs';
import {
  validateFilePath,
  validateDirectoryPath,
  validatePath,
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
  filterBySeverity,
} from '@j0kz/shared';

/**
 * Generate security report in markdown format
 */
function generateSecurityReport(results: ScanResult): SecurityReport {
  const { findings, dependencyVulnerabilities, filesScanned, scanDuration, securityScore } =
    results;

  let summary = `Scanned ${filesScanned} files in ${scanDuration}ms. `;
  summary += `Found ${findings.length} code vulnerabilities and ${dependencyVulnerabilities.length} dependency vulnerabilities. `;
  summary += `Security Score: ${securityScore}/100`;

  const recommendations: string[] = [];

  // Generate recommendations based on findings
  if (results.findingsBySeverity[SeverityLevel.CRITICAL] > 0) {
    recommendations.push('🚨 CRITICAL: Address all critical severity findings immediately');
  }

  if (results.findingsBySeverity[SeverityLevel.HIGH] > 0) {
    recommendations.push('⚠️  HIGH: Prioritize high severity findings in next sprint');
  }

  if (dependencyVulnerabilities.length > 0) {
    recommendations.push('📦 Update vulnerable dependencies to latest secure versions');
  }

  recommendations.push('✅ Implement automated security scanning in CI/CD pipeline');
  recommendations.push('📚 Conduct security training for development team');
  recommendations.push('🔒 Implement security code review checklist');

  return {
    title: 'Security Vulnerability Assessment Report',
    summary,
    results,
    recommendations,
    generatedAt: new Date(),
    version: '1.0.0',
  };
}

/**
 * Format security report as markdown
 */
function formatReportAsMarkdown(report: SecurityReport): string {
  const { title, summary, results, recommendations, generatedAt } = report;
  const { findings, dependencyVulnerabilities, findingsBySeverity } = results;

  let markdown = `# ${title}\n\n`;
  markdown += `**Generated:** ${generatedAt.toISOString()}\n\n`;
  markdown += `## Executive Summary\n\n${summary}\n\n`;

  // Severity breakdown
  markdown += `## Findings by Severity\n\n`;
  markdown += `| Severity | Count |\n`;
  markdown += `|----------|-------|\n`;
  markdown += `| 🔴 Critical | ${findingsBySeverity[SeverityLevel.CRITICAL]} |\n`;
  markdown += `| 🟠 High | ${findingsBySeverity[SeverityLevel.HIGH]} |\n`;
  markdown += `| 🟡 Medium | ${findingsBySeverity[SeverityLevel.MEDIUM]} |\n`;
  markdown += `| 🟢 Low | ${findingsBySeverity[SeverityLevel.LOW]} |\n`;
  markdown += `| ℹ️  Info | ${findingsBySeverity[SeverityLevel.INFO]} |\n\n`;

  // Detailed findings
  if (findings.length > 0) {
    markdown += `## Detailed Findings\n\n`;

    // Group by severity
    const severityGroups = [
      SeverityLevel.CRITICAL,
      SeverityLevel.HIGH,
      SeverityLevel.MEDIUM,
      SeverityLevel.LOW,
      SeverityLevel.INFO,
    ];

    for (const severity of severityGroups) {
      const severityFindings = findings.filter(f => f.severity === severity);

      if (severityFindings.length > 0) {
        markdown += `### ${severity.toUpperCase()} Severity\n\n`;

        for (const finding of severityFindings) {
          markdown += `#### ${finding.title}\n\n`;
          markdown += `- **File:** \`${finding.filePath}\`\n`;
          markdown += `- **Line:** ${finding.line}\n`;
          markdown += `- **Type:** ${finding.type}\n`;

          if (finding.owaspCategory) {
            markdown += `- **OWASP:** ${finding.owaspCategory}\n`;
          }

          if (finding.cweId) {
            markdown += `- **CWE:** ${finding.cweId}\n`;
          }

          if (finding.cvssScore) {
            markdown += `- **CVSS Score:** ${finding.cvssScore}\n`;
          }

          markdown += `\n**Description:** ${finding.description}\n\n`;
          markdown += `**Code:**\n\`\`\`\n${finding.codeSnippet}\n\`\`\`\n\n`;
          markdown += `**Recommendation:** ${finding.recommendation}\n\n`;
          markdown += `---\n\n`;
        }
      }
    }
  }

  // Dependency vulnerabilities
  if (dependencyVulnerabilities.length > 0) {
    markdown += `## Dependency Vulnerabilities\n\n`;
    markdown += `| Package | Version | Vulnerability | Severity | Patched Version |\n`;
    markdown += `|---------|---------|---------------|----------|----------------|\n`;

    for (const vuln of dependencyVulnerabilities) {
      markdown += `| ${vuln.package} | ${vuln.version} | ${vuln.vulnerabilityId} | ${vuln.severity} | ${vuln.patchedVersion || 'N/A'} |\n`;
    }

    markdown += `\n`;
  }

  // Recommendations
  markdown += `## Recommendations\n\n`;
  for (const rec of recommendations) {
    markdown += `- ${rec}\n`;
  }

  return markdown;
}

import { SECURITY_SCANNER_TOOLS } from './constants/tool-definitions.js';

/**
 * MCP Tools (with examples for improved accuracy - Anthropic Nov 2025)
 */
const TOOLS: Tool[] = SECURITY_SCANNER_TOOLS as Tool[];

/**
 * Legacy tools definition (kept for reference)
 */
const _LEGACY_TOOLS: Tool[] = [
  {
    name: 'scan_file',
    description:
      'Scan a single file for security vulnerabilities including secrets, SQL injection, XSS, and OWASP Top 10 issues',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to the file to scan',
        },
        config: {
          type: 'object',
          description: 'Optional scan configuration',
          properties: {
            scanSecrets: {
              type: 'boolean',
              description: 'Include secret scanning (default: true)',
            },
            scanSQLInjection: {
              type: 'boolean',
              description: 'Include SQL injection scanning (default: true)',
            },
            scanXSS: { type: 'boolean', description: 'Include XSS scanning (default: true)' },
            scanOWASP: {
              type: 'boolean',
              description: 'Include OWASP Top 10 checks (default: true)',
            },
            minSeverity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low', 'info'],
              description: 'Minimum severity to report',
            },
          },
        },
      },
      required: ['filePath'],
    },
  },
  {
    name: 'scan_project',
    description: 'Recursively scan an entire project directory for security vulnerabilities',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project directory',
        },
        config: {
          type: 'object',
          description: 'Optional scan configuration',
          properties: {
            scanSecrets: { type: 'boolean' },
            scanSQLInjection: { type: 'boolean' },
            scanXSS: { type: 'boolean' },
            scanOWASP: { type: 'boolean' },
            scanDependencies: {
              type: 'boolean',
              description: 'Scan package.json for vulnerable dependencies',
            },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Patterns to exclude (e.g., ["node_modules", ".git"])',
            },
            maxFileSize: { type: 'number', description: 'Maximum file size to scan in bytes' },
            minSeverity: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low', 'info'],
            },
            verbose: { type: 'boolean', description: 'Enable verbose logging' },
          },
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'scan_secrets',
    description: 'Specifically scan for hardcoded secrets, API keys, passwords, and credentials',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Path to file or directory to scan',
        },
        customPatterns: {
          type: 'array',
          description: 'Optional custom secret patterns',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              pattern: { type: 'string', description: 'Regex pattern as string' },
              severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
              description: { type: 'string' },
            },
          },
        },
      },
      required: ['targetPath'],
    },
  },
  {
    name: 'scan_vulnerabilities',
    description: 'Scan for specific vulnerability types (SQL injection, XSS, path traversal, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        targetPath: {
          type: 'string',
          description: 'Path to file or directory to scan',
        },
        vulnerabilityTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'sql_injection',
              'xss',
              'path_traversal',
              'command_injection',
              'weak_crypto',
              'insecure_deserialization',
            ],
          },
          description: 'Specific vulnerability types to scan for',
        },
      },
      required: ['targetPath', 'vulnerabilityTypes'],
    },
  },
  {
    name: 'generate_security_report',
    description: 'Generate a comprehensive security report in markdown format from scan results',
    inputSchema: {
      type: 'object',
      properties: {
        projectPath: {
          type: 'string',
          description: 'Path to the project to scan and generate report for',
        },
        outputPath: {
          type: 'string',
          description: 'Optional path to save the report markdown file',
        },
        config: {
          type: 'object',
          description: 'Scan configuration (same as scan_project)',
        },
      },
      required: ['projectPath'],
    },
  },
];

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'security-scanner',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'scan_file': {
        const {
          filePath,
          config,
          response_format = 'detailed',
        } = args as {
          filePath: string;
          config?: ScanConfig;
          response_format?: ResponseFormat;
        };
        const validatedPath = validateFilePath(filePath);
        const findings = await scanFile(validatedPath, config);

        const result = {
          success: true,
          filePath,
          findingsCount: findings.length,
          findings,
        };

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: r => ({ success: r.success, findingsCount: r.findingsCount }),
            concise: r => ({
              success: r.success,
              filePath: r.filePath,
              findingsCount: r.findingsCount,
              findings: filterBySeverity(r.findings, 'concise'),
            }),
            detailed: r => r,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      case 'scan_project': {
        const {
          projectPath,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          config?: ScanConfig;
          response_format?: ResponseFormat;
        };
        const validatedPath = validateDirectoryPath(projectPath);
        const results = await scanProject(validatedPath, config);

        const formatted = formatResponse(
          { success: true, ...results },
          { format: response_format },
          {
            minimal: r => ({
              success: r.success,
              securityScore: r.securityScore,
              findingsCount: r.findings.length,
              findingsBySeverity: r.findingsBySeverity,
            }),
            concise: r => ({
              success: r.success,
              securityScore: r.securityScore,
              filesScanned: r.filesScanned,
              scanDuration: r.scanDuration,
              findingsBySeverity: r.findingsBySeverity,
              findings: filterBySeverity(r.findings, 'concise'),
              dependencyVulnerabilities: truncateArray(r.dependencyVulnerabilities, 'concise'),
            }),
            detailed: r => r,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      case 'scan_secrets': {
        const {
          targetPath,
          customPatterns,
          response_format = 'detailed',
        } = args as {
          targetPath: string;
          customPatterns?: any[];
          response_format?: ResponseFormat;
        };

        const validatedPath = validatePath(targetPath);
        const stats = fs.statSync(validatedPath);
        let findings: SecurityFinding[] = [];

        if (stats.isFile()) {
          const config: ScanConfig = {
            scanSecrets: true,
            scanSQLInjection: false,
            scanXSS: false,
            scanOWASP: false,
            scanDependencies: false,
          };
          findings = await scanFile(validatedPath, config);
        } else {
          const config: ScanConfig = {
            scanSecrets: true,
            scanSQLInjection: false,
            scanXSS: false,
            scanOWASP: false,
            scanDependencies: false,
            customPatterns,
          };
          const results = await scanProject(validatedPath, config);
          findings = results.findings;
        }

        const result = {
          success: true,
          secretsFound: findings.length,
          findings,
        };

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: r => ({ success: r.success, secretsFound: r.secretsFound }),
            concise: r => ({
              success: r.success,
              secretsFound: r.secretsFound,
              findings: filterBySeverity(r.findings, 'concise'),
            }),
            detailed: r => r,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      case 'scan_vulnerabilities': {
        const {
          targetPath,
          vulnerabilityTypes,
          response_format = 'detailed',
        } = args as {
          targetPath: string;
          vulnerabilityTypes: string[];
          response_format?: ResponseFormat;
        };

        const validatedPath = validatePath(targetPath);

        const config: ScanConfig = {
          scanSecrets: false,
          scanSQLInjection: vulnerabilityTypes.includes('sql_injection'),
          scanXSS: vulnerabilityTypes.includes('xss'),
          scanOWASP:
            vulnerabilityTypes.includes('weak_crypto') ||
            vulnerabilityTypes.includes('insecure_deserialization') ||
            vulnerabilityTypes.includes('path_traversal'),
          scanDependencies: false,
        };

        const stats = fs.statSync(validatedPath);
        let findings: SecurityFinding[] = [];

        if (stats.isFile()) {
          findings = await scanFile(validatedPath, config);
        } else {
          const results = await scanProject(validatedPath, config);
          findings = results.findings;
        }

        // Filter findings by requested types
        findings = findings.filter(f => vulnerabilityTypes.includes(f.type));

        const result = {
          success: true,
          vulnerabilityTypes,
          findingsCount: findings.length,
          findings,
        };

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: r => ({ success: r.success, findingsCount: r.findingsCount }),
            concise: r => ({
              success: r.success,
              vulnerabilityTypes: r.vulnerabilityTypes,
              findingsCount: r.findingsCount,
              findings: filterBySeverity(r.findings, 'concise'),
            }),
            detailed: r => r,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      case 'generate_security_report': {
        const {
          projectPath,
          outputPath,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          outputPath?: string;
          config?: ScanConfig;
          response_format?: ResponseFormat;
        };

        const validatedProjectPath = validateDirectoryPath(projectPath);
        const results = await scanProject(validatedProjectPath, config);
        const report = generateSecurityReport(results);
        const markdown = formatReportAsMarkdown(report);

        // Save to file if output path provided
        if (outputPath) {
          const validatedOutputPath = validatePath(outputPath);
          fs.writeFileSync(validatedOutputPath, markdown, 'utf-8');
        }

        // For reports, minimal/concise return summary, detailed returns full markdown
        const formatted = formatResponse(
          { report, markdown },
          { format: response_format },
          {
            minimal: r => ({
              securityScore: r.report.results.securityScore,
              findingsCount: r.report.results.findings.length,
              findingsBySeverity: r.report.results.findingsBySeverity,
            }),
            concise: r => ({
              title: r.report.title,
              summary: r.report.summary,
              securityScore: r.report.results.securityScore,
              findingsBySeverity: r.report.results.findingsBySeverity,
              recommendations: r.report.recommendations,
            }),
            detailed: r => r.markdown,
          }
        );

        return {
          content: [
            {
              type: 'text',
              text: typeof formatted === 'string' ? formatted : JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }

      default:
        throw new MCPError('SEC_004', { tool: name });
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const errorCode = error instanceof MCPError ? error.code : 'UNKNOWN';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMessage,
              code: errorCode,
              ...(error instanceof MCPError && error.details ? { details: error.details } : {}),
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Security Scanner MCP server running on stdio');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
