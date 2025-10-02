#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ArchitectureAnalyzer } from './analyzer.js';
import { AnalysisConfig } from './types.js';
import { validateDirectoryPath, validatePath } from '@mcp-tools/shared';

class ArchitectureAnalyzerServer {
  private server: Server;
  private analyzer: ArchitectureAnalyzer;

  constructor() {
    this.analyzer = new ArchitectureAnalyzer();

    this.server = new Server(
      {
        name: 'architecture-analyzer',
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
          name: 'analyze_architecture',
          description: 'Analyze project architecture, detect circular dependencies, layer violations, and generate dependency graphs',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to the project root directory',
              },
              config: {
                type: 'object',
                description: 'Analysis configuration',
                properties: {
                  maxDepth: {
                    type: 'number',
                    description: 'Maximum depth for directory traversal',
                  },
                  excludePatterns: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Patterns to exclude from analysis',
                  },
                  detectCircular: {
                    type: 'boolean',
                    description: 'Detect circular dependencies',
                  },
                  generateGraph: {
                    type: 'boolean',
                    description: 'Generate Mermaid dependency graph',
                  },
                  layerRules: {
                    type: 'object',
                    description: 'Layer dependency rules (e.g., {"presentation": ["business"], "business": ["data"]})',
                  },
                },
              },
            },
            required: ['projectPath'],
          },
        },
        {
          name: 'get_module_info',
          description: 'Get detailed information about a specific module',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to the project root',
              },
              modulePath: {
                type: 'string',
                description: 'Relative path to the module',
              },
            },
            required: ['projectPath', 'modulePath'],
          },
        },
        {
          name: 'find_circular_deps',
          description: 'Find all circular dependencies in the project',
          inputSchema: {
            type: 'object',
            properties: {
              projectPath: {
                type: 'string',
                description: 'Path to the project root',
              },
            },
            required: ['projectPath'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_architecture': {
            const { projectPath, config } = args as { projectPath: string; config?: AnalysisConfig };
            const validatedPath = validateDirectoryPath(projectPath);
            const result = await this.analyzer.analyzeArchitecture(validatedPath, config);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    summary: {
                      totalModules: result.metrics.totalModules,
                      totalDependencies: result.metrics.totalDependencies,
                      circularDependencies: result.metrics.circularDependencies,
                      layerViolations: result.metrics.layerViolations,
                      cohesion: `${result.metrics.cohesion}%`,
                      coupling: `${result.metrics.coupling}%`,
                    },
                    ...result,
                  }, null, 2),
                },
              ],
            };
          }

          case 'get_module_info': {
            const { projectPath, modulePath } = args as { projectPath: string; modulePath: string };
            const validatedProjectPath = validateDirectoryPath(projectPath);
            const validatedModulePath = validatePath(modulePath);
            const result = await this.analyzer.analyzeArchitecture(validatedProjectPath);
            const module = result.modules.find(m => m.path === modulePath);

            if (!module) {
              throw new Error(`Module not found: ${modulePath}`);
            }

            const dependencies = result.dependencies.filter(d => d.from === modulePath);
            const dependents = result.dependencies.filter(d => d.to === modulePath);

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    module,
                    dependencies,
                    dependents,
                    stats: {
                      dependencyCount: dependencies.length,
                      dependentCount: dependents.length,
                      linesOfCode: module.linesOfCode,
                    },
                  }, null, 2),
                },
              ],
            };
          }

          case 'find_circular_deps': {
            const { projectPath } = args as { projectPath: string };
            const validatedPath = validateDirectoryPath(projectPath);
            const result = await this.analyzer.analyzeArchitecture(validatedPath, {
              detectCircular: true,
              generateGraph: false,
            });

            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    circularDependencies: result.circularDependencies,
                    count: result.circularDependencies.length,
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
    console.error('Architecture Analyzer MCP Server running on stdio');
  }
}

const server = new ArchitectureAnalyzerServer();
server.run().catch(console.error);
