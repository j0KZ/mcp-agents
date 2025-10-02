#!/usr/bin/env node
/**
 * MCP Server for Documentation Generator
 * Provides tools for automated documentation generation
 *
 * @module mcp-server
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { generateJSDoc, generateReadme, generateApiDocs, generateChangelog, } from './generator.js';
import { DocError, } from './types.js';
import * as fs from 'fs';
/**
 * MCP Server instance
 */
const server = new Server({
    name: 'doc-generator',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * Available MCP tools for documentation generation
 */
const TOOLS = [
    {
        name: 'generate_jsdoc',
        description: 'Generate JSDoc comments for a TypeScript/JavaScript file. Analyzes functions, classes, and interfaces to produce comprehensive JSDoc documentation with parameter types, return values, and suggestions for missing documentation.',
        inputSchema: {
            type: 'object',
            properties: {
                filePath: {
                    type: 'string',
                    description: 'Path to the source file to generate JSDoc for',
                },
                config: {
                    type: 'object',
                    description: 'JSDoc generation configuration',
                    properties: {
                        style: {
                            type: 'string',
                            enum: ['standard', 'google', 'typescript'],
                            description: 'JSDoc style preference',
                        },
                        addTodoTags: {
                            type: 'boolean',
                            description: 'Add @todo tags for missing documentation',
                        },
                        inferTypes: {
                            type: 'boolean',
                            description: 'Infer types from TypeScript',
                        },
                        includePrivate: {
                            type: 'boolean',
                            description: 'Include private members',
                        },
                    },
                },
            },
            required: ['filePath'],
        },
    },
    {
        name: 'generate_readme',
        description: 'Generate a comprehensive README.md file from project source code and package.json. Creates sections for installation, usage, API reference, badges, table of contents, and more.',
        inputSchema: {
            type: 'object',
            properties: {
                projectPath: {
                    type: 'string',
                    description: 'Path to the project root directory',
                },
                config: {
                    type: 'object',
                    description: 'README generation configuration',
                    properties: {
                        projectName: {
                            type: 'string',
                            description: 'Project name for documentation header',
                        },
                        version: {
                            type: 'string',
                            description: 'Project version',
                        },
                        author: {
                            type: 'string',
                            description: 'Author information',
                        },
                        license: {
                            type: 'string',
                            description: 'License type',
                        },
                        includeInstallation: {
                            type: 'boolean',
                            description: 'Include installation section',
                        },
                        includeUsage: {
                            type: 'boolean',
                            description: 'Include usage examples',
                        },
                        includeAPI: {
                            type: 'boolean',
                            description: 'Include API reference',
                        },
                        includeContributing: {
                            type: 'boolean',
                            description: 'Include contributing guidelines',
                        },
                        includeBadges: {
                            type: 'boolean',
                            description: 'Include badges',
                        },
                        includeTOC: {
                            type: 'boolean',
                            description: 'Include table of contents',
                        },
                    },
                },
            },
            required: ['projectPath'],
        },
    },
    {
        name: 'generate_api_docs',
        description: 'Generate comprehensive API documentation from TypeScript/JavaScript source files. Extracts classes, interfaces, functions, parameters, and return types to create detailed API reference documentation.',
        inputSchema: {
            type: 'object',
            properties: {
                projectPath: {
                    type: 'string',
                    description: 'Path to the project source directory (will recursively scan for .ts, .js, .tsx, .jsx files)',
                },
                config: {
                    type: 'object',
                    description: 'API documentation configuration',
                    properties: {
                        groupByCategory: {
                            type: 'boolean',
                            description: 'Group documentation by category',
                        },
                        includeTypes: {
                            type: 'boolean',
                            description: 'Include type definitions',
                        },
                        includeInterfaces: {
                            type: 'boolean',
                            description: 'Include interfaces',
                        },
                        includeEnums: {
                            type: 'boolean',
                            description: 'Include enums',
                        },
                        sortAlphabetically: {
                            type: 'boolean',
                            description: 'Sort members alphabetically',
                        },
                        includeTOC: {
                            type: 'boolean',
                            description: 'Include table of contents',
                        },
                        includeSourceLinks: {
                            type: 'boolean',
                            description: 'Include source code links',
                        },
                        repositoryUrl: {
                            type: 'string',
                            description: 'Repository URL for source links',
                        },
                    },
                },
            },
            required: ['projectPath'],
        },
    },
    {
        name: 'generate_changelog',
        description: 'Generate a changelog from git commit history using conventional commit format. Groups commits by type (features, fixes, docs, etc.) and optionally includes breaking changes, authors, and commit links.',
        inputSchema: {
            type: 'object',
            properties: {
                projectPath: {
                    type: 'string',
                    description: 'Path to the git repository',
                },
                config: {
                    type: 'object',
                    description: 'Changelog generation configuration',
                    properties: {
                        commitLimit: {
                            type: 'number',
                            description: 'Number of commits to include (default: 100)',
                        },
                        fromTag: {
                            type: 'string',
                            description: 'Starting version tag',
                        },
                        toTag: {
                            type: 'string',
                            description: 'Ending version tag',
                        },
                        groupByType: {
                            type: 'boolean',
                            description: 'Group changes by type (feat, fix, etc.)',
                        },
                        includeMerges: {
                            type: 'boolean',
                            description: 'Include merge commits',
                        },
                        conventionalCommits: {
                            type: 'boolean',
                            description: 'Parse conventional commit format',
                        },
                        includeAuthors: {
                            type: 'boolean',
                            description: 'Include commit authors',
                        },
                        linkCommits: {
                            type: 'boolean',
                            description: 'Link to commit URLs',
                        },
                    },
                },
            },
            required: ['projectPath'],
        },
    },
    {
        name: 'generate_full_docs',
        description: 'Generate complete documentation suite including JSDoc, README, API documentation, and changelog all at once. This is a convenience tool that runs all documentation generators and saves the results to appropriate files.',
        inputSchema: {
            type: 'object',
            properties: {
                projectPath: {
                    type: 'string',
                    description: 'Path to the project root directory',
                },
                sourceFiles: {
                    type: 'array',
                    description: 'Array of source files to generate JSDoc for',
                    items: {
                        type: 'string',
                    },
                },
                config: {
                    type: 'object',
                    description: 'Combined configuration for all documentation types',
                    properties: {
                        projectName: {
                            type: 'string',
                            description: 'Project name',
                        },
                        version: {
                            type: 'string',
                            description: 'Project version',
                        },
                        author: {
                            type: 'string',
                            description: 'Author information',
                        },
                        license: {
                            type: 'string',
                            description: 'License type',
                        },
                        writeFiles: {
                            type: 'boolean',
                            description: 'Write generated documentation to files (default: true)',
                        },
                    },
                },
            },
            required: ['projectPath'],
        },
    },
];
/**
 * Register list_tools handler
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
/**
 * Register call_tool handler
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'generate_jsdoc': {
                const { filePath, config } = args;
                const result = await generateJSDoc(filePath, config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_readme': {
                const { projectPath, config } = args;
                const result = await generateReadme(projectPath, config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_api_docs': {
                const { projectPath, config } = args;
                const result = await generateApiDocs(projectPath, config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_changelog': {
                const { projectPath, config } = args;
                const result = await generateChangelog(projectPath, config);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            case 'generate_full_docs': {
                const { projectPath, sourceFiles, config } = args;
                const results = {};
                // Generate README
                const readmeResult = await generateReadme(projectPath, {
                    projectName: config?.projectName,
                    version: config?.version,
                    author: config?.author,
                    license: config?.license,
                });
                results.readme = readmeResult;
                // Generate API docs
                const apiDocsResult = await generateApiDocs(projectPath);
                results.apiDocs = apiDocsResult;
                // Generate changelog
                try {
                    const changelogResult = await generateChangelog(projectPath);
                    results.changelog = changelogResult;
                }
                catch (error) {
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
                        }
                        catch (error) {
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
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                message: 'Full documentation suite generated successfully',
                                results,
                                filesWritten: config?.writeFiles !== false,
                            }, null, 2),
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        if (error instanceof DocError) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            error: error.message,
                            code: error.code,
                            details: error.details,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        error: 'Documentation generation failed',
                        message: String(error),
                    }, null, 2),
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
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map