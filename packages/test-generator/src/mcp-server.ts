#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { TestGenerator } from './generator.js';
import { TestConfig } from './types.js';
import { writeFile } from 'fs/promises';

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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_tests',
          description: 'Generate comprehensive test suite for a source file with edge cases and error handling',
          inputSchema: {
            type: 'object',
            properties: {
              sourceFile: {
                type: 'string',
                description: 'Path to the source file to generate tests for',
              },
              config: {
                type: 'object',
                description: 'Test generation configuration',
                properties: {
                  framework: {
                    type: 'string',
                    enum: ['jest', 'mocha', 'vitest', 'ava'],
                    description: 'Test framework to use',
                  },
                  coverage: {
                    type: 'number',
                    description: 'Target coverage percentage',
                  },
                  includeEdgeCases: {
                    type: 'boolean',
                    description: 'Include edge case tests',
                  },
                  includeErrorCases: {
                    type: 'boolean',
                    description: 'Include error handling tests',
                  },
                },
              },
            },
            required: ['sourceFile'],
          },
        },
        {
          name: 'write_test_file',
          description: 'Generate tests and write directly to a test file',
          inputSchema: {
            type: 'object',
            properties: {
              sourceFile: {
                type: 'string',
                description: 'Path to the source file',
              },
              testFile: {
                type: 'string',
                description: 'Path where test file should be written (optional, auto-generated if not provided)',
              },
              config: {
                type: 'object',
                description: 'Test generation configuration',
              },
            },
            required: ['sourceFile'],
          },
        },
        {
          name: 'batch_generate',
          description: 'Generate tests for multiple files at once',
          inputSchema: {
            type: 'object',
            properties: {
              sourceFiles: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of source file paths',
              },
              config: {
                type: 'object',
                description: 'Test generation configuration',
              },
            },
            required: ['sourceFiles'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate_tests': {
            const { sourceFile, config } = args as { sourceFile: string; config?: TestConfig };
            const result = await this.generator.generateTests(sourceFile, config);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    ...result,
                    summary: {
                      totalTests: result.totalTests,
                      estimatedCoverage: `${result.estimatedCoverage}%`,
                      testFile: result.testFile,
                      framework: result.framework,
                    },
                  }, null, 2),
                },
              ],
            };
          }

          case 'write_test_file': {
            const { sourceFile, testFile, config } = args as {
              sourceFile: string;
              testFile?: string;
              config?: TestConfig;
            };

            const result = await this.generator.generateTests(sourceFile, config);
            const outputPath = testFile || result.testFile;

            await writeFile(outputPath, result.fullTestCode, 'utf-8');

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    testFile: outputPath,
                    totalTests: result.totalTests,
                    estimatedCoverage: `${result.estimatedCoverage}%`,
                  }, null, 2),
                },
              ],
            };
          }

          case 'batch_generate': {
            const { sourceFiles, config } = args as {
              sourceFiles: string[];
              config?: TestConfig;
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

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(summary, null, 2),
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
    console.error('Test Generator MCP Server running on stdio');
  }
}

const server = new TestGeneratorServer();
server.run().catch(console.error);
