#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ArchitectureAnalyzer } from './analyzer.js';
import { AnalysisConfig } from './types.js';
import {
  validateDirectoryPath,
  validatePath,
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
} from '@j0kz/shared';
import { ARCHITECTURE_ANALYZER_TOOLS } from './constants/tool-definitions.js';

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
    // List available tools (with examples for improved accuracy - Anthropic Nov 2025)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: ARCHITECTURE_ANALYZER_TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_architecture': {
            const {
              projectPath,
              config,
              response_format = 'detailed',
            } = args as {
              projectPath: string;
              config?: AnalysisConfig;
              response_format?: ResponseFormat;
            };
            const validatedPath = validateDirectoryPath(projectPath);
            const result = await this.analyzer.analyzeArchitecture(validatedPath, config);

            const formatted = formatResponse(
              result,
              { format: response_format },
              {
                minimal: r => ({
                  totalModules: r.metrics.totalModules,
                  circularDependencies: r.metrics.circularDependencies,
                  layerViolations: r.metrics.layerViolations,
                }),
                concise: r => ({
                  summary: {
                    totalModules: r.metrics.totalModules,
                    totalDependencies: r.metrics.totalDependencies,
                    circularDependencies: r.metrics.circularDependencies,
                    layerViolations: r.metrics.layerViolations,
                    cohesion: `${r.metrics.cohesion}%`,
                    coupling: `${r.metrics.coupling}%`,
                  },
                  modules: truncateArray(r.modules, 'concise'),
                  circularDependencies: r.circularDependencies,
                }),
                detailed: r => ({
                  summary: {
                    totalModules: r.metrics.totalModules,
                    totalDependencies: r.metrics.totalDependencies,
                    circularDependencies: r.metrics.circularDependencies,
                    layerViolations: r.metrics.layerViolations,
                    cohesion: `${r.metrics.cohesion}%`,
                    coupling: `${r.metrics.coupling}%`,
                  },
                  ...r,
                }),
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

          case 'get_module_info': {
            const {
              projectPath,
              modulePath,
              response_format = 'detailed',
            } = args as {
              projectPath: string;
              modulePath: string;
              response_format?: ResponseFormat;
            };
            const validatedProjectPath = validateDirectoryPath(projectPath);
            const validatedModulePath = validatePath(modulePath);
            const result = await this.analyzer.analyzeArchitecture(validatedProjectPath);
            const module = result.modules.find(m => m.path === validatedModulePath);

            if (!module) {
              throw new MCPError('ARCH_002', { module: validatedModulePath });
            }

            const dependencies = result.dependencies.filter(d => d.from === validatedModulePath);
            const dependents = result.dependencies.filter(d => d.to === validatedModulePath);

            const moduleResult = {
              module,
              dependencies,
              dependents,
              stats: {
                dependencyCount: dependencies.length,
                dependentCount: dependents.length,
                linesOfCode: module.linesOfCode,
              },
            };

            const formatted = formatResponse(
              moduleResult,
              { format: response_format },
              {
                minimal: r => ({
                  path: r.module.path,
                  dependencyCount: r.stats.dependencyCount,
                  dependentCount: r.stats.dependentCount,
                }),
                concise: r => ({
                  module: { path: r.module.path, linesOfCode: r.module.linesOfCode },
                  stats: r.stats,
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

          case 'find_circular_deps': {
            const { projectPath, response_format = 'detailed' } = args as {
              projectPath: string;
              response_format?: ResponseFormat;
            };
            const validatedPath = validateDirectoryPath(projectPath);
            const result = await this.analyzer.analyzeArchitecture(validatedPath, {
              detectCircular: true,
              generateGraph: false,
            });

            const circularResult = {
              circularDependencies: result.circularDependencies,
              count: result.circularDependencies.length,
            };

            const formatted = formatResponse(
              circularResult,
              { format: response_format },
              {
                minimal: r => ({ count: r.count }),
                concise: r => ({
                  count: r.count,
                  circularDependencies: truncateArray(r.circularDependencies, 'concise'),
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

          default:
            throw new MCPError('ARCH_003', { tool: name });
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
    console.error('Architecture Analyzer MCP Server running on stdio');
  }
}

const server = new ArchitectureAnalyzerServer();
server.run().catch(console.error);
