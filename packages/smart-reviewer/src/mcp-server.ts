#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CodeAnalyzer } from './analyzer.js';
import { ReviewConfig } from './types.js';

class SmartReviewerServer {
  private server: Server;
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();

    this.server = new Server(
      {
        name: 'smart-reviewer',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'review_file',
          description: 'Review a code file and provide detailed analysis with issues, metrics, and suggestions',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file to review',
              },
              config: {
                type: 'object',
                description: 'Optional review configuration',
                properties: {
                  severity: {
                    type: 'string',
                    enum: ['strict', 'moderate', 'lenient'],
                    description: 'Review severity level',
                  },
                  autoFix: {
                    type: 'boolean',
                    description: 'Automatically apply fixes when possible',
                  },
                  includeMetrics: {
                    type: 'boolean',
                    description: 'Include code metrics in the result',
                  },
                },
              },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'batch_review',
          description: 'Review multiple files at once',
          inputSchema: {
            type: 'object',
            properties: {
              filePaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of file paths to review',
              },
              config: {
                type: 'object',
                description: 'Optional review configuration',
              },
            },
            required: ['filePaths'],
          },
        },
        {
          name: 'apply_fixes',
          description: 'Apply automatic fixes to a file',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: {
                type: 'string',
                description: 'Path to the file to fix',
              },
            },
            required: ['filePath'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'review_file': {
            const { filePath, config } = args as { filePath: string; config?: ReviewConfig };
            const result = await this.analyzer.analyzeFile(filePath);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'batch_review': {
            const { filePaths, config } = args as { filePaths: string[]; config?: ReviewConfig };
            const results = await Promise.all(
              filePaths.map(fp => this.analyzer.analyzeFile(fp))
            );

            const summary = {
              totalFiles: results.length,
              averageScore: Math.round(
                results.reduce((sum, r) => sum + r.overallScore, 0) / results.length
              ),
              totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
              results,
            };

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(summary, null, 2),
                },
              ],
            };
          }

          case 'apply_fixes': {
            const { filePath } = args as { filePath: string };
            const { readFile, writeFile } = await import('fs/promises');

            const content = await readFile(filePath, 'utf-8');
            const result = await this.analyzer.analyzeFile(filePath);
            const fixedContent = await this.analyzer.applyFixes(content, result.issues);

            await writeFile(filePath, fixedContent, 'utf-8');

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    file: filePath,
                    fixesApplied: result.issues.filter(i => i.fix).length,
                  }, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Smart Reviewer MCP Server running on stdio');
  }
}

const server = new SmartReviewerServer();
server.run().catch(console.error);
