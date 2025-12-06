#!/usr/bin/env node

/**
 * MCP Server for Documentation Generator
 * Provides tools for automated documentation generation
 *
 * @module mcp-server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DOC_GENERATOR_TOOLS } from './constants/tool-definitions.js';
import { generateJSDoc, generateReadme, generateApiDocs, generateChangelog } from './generator.js';
import { JSDocConfig, ReadmeConfig, ApiDocsConfig, ChangelogConfig, DocError } from './types.js';
import * as fs from 'fs';
import { MCPError, getErrorMessage, ResponseFormat, formatResponse } from '@j0kz/shared';
import { validateFilePath, validateDirectoryPath } from '@j0kz/shared';

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: 'doc-generator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Available MCP tools for documentation generation
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
const TOOLS = DOC_GENERATOR_TOOLS;

/**
 * Register list_tools handler
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/**
 * Register call_tool handler
 */
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_jsdoc': {
        const {
          filePath,
          config,
          response_format = 'detailed',
        } = args as {
          filePath: string;
          config?: JSDocConfig;
          response_format?: ResponseFormat;
        };

        // Validate file path to prevent path traversal
        const validatedPath = validateFilePath(filePath);
        const result = (await generateJSDoc(validatedPath, config)) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              itemsDocumented: r.metadata?.itemsDocumented || 0,
            }),
            concise: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              metadata: r.metadata,
              contentPreview: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : ''),
            }),
            detailed: (r: any) => r,
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

      case 'generate_readme': {
        const {
          projectPath,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          config?: ReadmeConfig;
          response_format?: ResponseFormat;
        };

        // Validate directory path to prevent path traversal
        const validatedPath = validateDirectoryPath(projectPath);
        const result = (await generateReadme(validatedPath, config)) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
            }),
            concise: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              metadata: r.metadata,
              contentPreview: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : ''),
            }),
            detailed: (r: any) => r,
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

      case 'generate_api_docs': {
        const {
          projectPath,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          config?: ApiDocsConfig;
          response_format?: ResponseFormat;
        };

        // Validate directory path to prevent path traversal
        const validatedPath = validateDirectoryPath(projectPath);
        const result = (await generateApiDocs(validatedPath, config)) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              itemsDocumented: r.metadata?.itemsDocumented || 0,
            }),
            concise: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              metadata: r.metadata,
              contentPreview: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : ''),
            }),
            detailed: (r: any) => r,
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

      case 'generate_changelog': {
        const {
          projectPath,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          config?: ChangelogConfig;
          response_format?: ResponseFormat;
        };

        // Validate directory path to prevent path traversal
        const validatedPath = validateDirectoryPath(projectPath);
        const result = (await generateChangelog(validatedPath, config)) as any;

        const formatted = formatResponse(
          result,
          { format: response_format },
          {
            minimal: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
            }),
            concise: (r: any) => ({
              filePath: r.filePath,
              format: r.format,
              metadata: r.metadata,
              contentPreview: r.content?.substring(0, 500) + (r.content?.length > 500 ? '...' : ''),
            }),
            detailed: (r: any) => r,
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

      case 'generate_full_docs': {
        const {
          projectPath,
          sourceFiles,
          config,
          response_format = 'detailed',
        } = args as {
          projectPath: string;
          sourceFiles?: string[];
          config?: {
            projectName?: string;
            version?: string;
            author?: string;
            license?: string;
            writeFiles?: boolean;
          };
          response_format?: ResponseFormat;
        };

        // Validate directory path to prevent path traversal
        const validatedProjectPath = validateDirectoryPath(projectPath);

        // Validate source files if provided (currently unused but validates input)
        if (sourceFiles) {
          sourceFiles.forEach(f => validateFilePath(f));
        }

        const results: Record<string, any> = {};

        // Generate README
        const readmeResult = await generateReadme(validatedProjectPath, {
          projectName: config?.projectName,
          version: config?.version,
          author: config?.author,
          license: config?.license,
        });
        results.readme = readmeResult;

        // Generate API docs
        const apiDocsResult = await generateApiDocs(validatedProjectPath);
        results.apiDocs = apiDocsResult;

        // Generate changelog
        try {
          const changelogResult = await generateChangelog(validatedProjectPath);
          results.changelog = changelogResult;
        } catch {
          results.changelog = {
            error: 'Not a git repository or git history unavailable',
          };
        }

        // Generate JSDoc for specified files
        if (sourceFiles && sourceFiles.length > 0) {
          results.jsdoc = [];
          for (const file of sourceFiles) {
            try {
              const jsdocResult = await generateJSDoc(file);
              results.jsdoc.push({ file, result: jsdocResult });
            } catch (error) {
              results.jsdoc.push({ file, error: String(error) });
            }
          }
        }

        // Write files if requested
        if (config?.writeFiles !== false) {
          if (readmeResult.filePath) {
            fs.writeFileSync(readmeResult.filePath, readmeResult.content);
          }
          if (apiDocsResult.filePath) {
            fs.writeFileSync(apiDocsResult.filePath, apiDocsResult.content);
          }
          if (results.changelog && !results.changelog.error && results.changelog.filePath) {
            fs.writeFileSync(results.changelog.filePath, results.changelog.content);
          }
        }

        const fullDocsResult = {
          success: true,
          message: 'Full documentation suite generated successfully',
          results,
          filesWritten: config?.writeFiles !== false,
        };

        const formatted = formatResponse(
          fullDocsResult,
          { format: response_format },
          {
            minimal: r => ({
              success: r.success,
              filesWritten: r.filesWritten,
              filesGenerated: Object.keys(r.results).length,
            }),
            concise: r => ({
              success: r.success,
              message: r.message,
              filesWritten: r.filesWritten,
              readme: r.results.readme?.filePath,
              apiDocs: r.results.apiDocs?.filePath,
              changelog: r.results.changelog?.filePath || r.results.changelog?.error,
              jsdocFiles: r.results.jsdoc?.length || 0,
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
        throw new MCPError('DOC_005', { tool: name });
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const errorCode =
      error instanceof MCPError ? error.code : error instanceof DocError ? error.code : 'UNKNOWN';

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
              ...(error instanceof DocError && error.details ? { details: error.details } : {}),
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
 * Start the MCP server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Documentation Generator MCP Server running on stdio');
}

main().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
