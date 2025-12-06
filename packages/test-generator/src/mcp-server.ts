#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TestGenerator } from './generator.js';
import { TestConfig } from './types.js';
import { writeFile } from 'fs/promises';
import {
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
} from '@j0kz/shared';
import { TEST_GENERATOR_TOOLS } from './constants/tool-definitions.js';

class TestGeneratorServer {
  private server: Server;
  private generator: TestGenerator;

  constructor() {
    this.generator = new TestGenerator();

    this.server = new Server(
      {
        name: 'test-generator',
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
    // List available tools (with examples for improved accuracy - Anthropic Nov 2025)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TEST_GENERATOR_TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_tests': {
            const {
              sourceFile,
              config,
              response_format = 'detailed',
            } = args as {
              sourceFile: string;
              config?: TestConfig;
              response_format?: ResponseFormat;
            };
            const result = await this.generator.generateTests(sourceFile, config);

            const formatted = formatResponse(
              {
                ...result,
                summary: {
                  totalTests: result.totalTests,
                  estimatedCoverage: `${result.estimatedCoverage}%`,
                  testFile: result.testFile,
                  framework: result.framework,
                },
              },
              { format: response_format },
              {
                minimal: r => ({
                  totalTests: r.totalTests,
                  estimatedCoverage: `${r.estimatedCoverage}%`,
                }),
                concise: r => ({
                  totalTests: r.totalTests,
                  estimatedCoverage: `${r.estimatedCoverage}%`,
                  testFile: r.testFile,
                  framework: r.framework,
                }),
                detailed: r => r,
              }
            );

            return {
              content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
            };
          }

          case 'write_test_file': {
            const {
              sourceFile,
              testFile,
              config,
              response_format = 'detailed',
            } = args as {
              sourceFile: string;
              testFile?: string;
              config?: TestConfig;
              response_format?: ResponseFormat;
            };

            const result = await this.generator.generateTests(sourceFile, config);
            const outputPath = testFile || result.testFile;

            await writeFile(outputPath, result.fullTestCode, 'utf-8');

            const writeResult = {
              success: true,
              testFile: outputPath,
              totalTests: result.totalTests,
              estimatedCoverage: `${result.estimatedCoverage}%`,
            };

            const formatted = formatResponse(
              writeResult,
              { format: response_format },
              {
                minimal: r => ({ success: r.success, totalTests: r.totalTests }),
                concise: r => r,
                detailed: r => r,
              }
            );

            return {
              content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
            };
          }

          case 'batch_generate': {
            const {
              sourceFiles,
              config,
              response_format = 'detailed',
            } = args as {
              sourceFiles: string[];
              config?: TestConfig;
              response_format?: ResponseFormat;
            };

            const results = await Promise.all(
              sourceFiles.map(file => this.generator.generateTests(file, config))
            );

            // Write all test files
            await Promise.all(
              results.map(result => writeFile(result.testFile, result.fullTestCode, 'utf-8'))
            );

            const summary = {
              totalFiles: results.length,
              totalTests: results.reduce((sum, r) => sum + r.totalTests, 0),
              averageCoverage: Math.round(
                results.reduce((sum, r) => sum + r.estimatedCoverage, 0) / results.length
              ),
              results: results.map(r => ({
                sourceFile: r.sourceFile,
                testFile: r.testFile,
                tests: r.totalTests,
                coverage: `${r.estimatedCoverage}%`,
              })),
            };

            const formatted = formatResponse(
              summary,
              { format: response_format },
              {
                minimal: s => ({
                  totalFiles: s.totalFiles,
                  totalTests: s.totalTests,
                  averageCoverage: s.averageCoverage,
                }),
                concise: s => ({ ...s, results: truncateArray(s.results, 'concise') }),
                detailed: s => s,
              }
            );

            return {
              content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
            };
          }

          default:
            throw new MCPError('TEST_004', { tool: name });
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
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Test Generator MCP Server running on stdio');
  }
}

const server = new TestGeneratorServer();
server.run().catch(console.error);
