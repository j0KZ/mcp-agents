#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CodeAnalyzer } from './analyzer.js';
import { validateFilePath, MCPError, getErrorMessage } from '@j0kz/shared';
import { AutoFixer } from './auto-fixer.js';
class SmartReviewerServer {
    server;
    analyzer;
    autoFixer;
    constructor() {
        this.analyzer = new CodeAnalyzer();
        this.autoFixer = new AutoFixer();
        this.server = new Server({
            name: 'smart-reviewer',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
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
                {
                    name: 'generate_auto_fixes',
                    description: 'Generate automatic fixes using Pareto principle (20% fixes solve 80% issues). Returns preview without applying changes.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'Path to the file to analyze for auto-fixes',
                            },
                            safeOnly: {
                                type: 'boolean',
                                description: 'Only return safe fixes that can be auto-applied (default: false)',
                            },
                        },
                        required: ['filePath'],
                    },
                },
                {
                    name: 'apply_auto_fixes',
                    description: 'Apply generated auto-fixes to a file. SAFE: Creates backup before applying.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filePath: {
                                type: 'string',
                                description: 'Path to the file to fix',
                            },
                            safeOnly: {
                                type: 'boolean',
                                description: 'Only apply safe fixes (default: true)',
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
                        const { filePath, config: _config } = args;
                        // Validate file path to prevent path traversal
                        const validatedPath = validateFilePath(filePath);
                        const result = await this.analyzer.analyzeFile(validatedPath);
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
                        const { filePaths, config: _config } = args;
                        // Validate input
                        if (!Array.isArray(filePaths) || filePaths.length === 0) {
                            throw new MCPError('REV_001', { tool: 'batch_review' });
                        }
                        // Validate all file paths
                        const validatedPaths = filePaths.map(fp => validateFilePath(fp));
                        const results = await Promise.all(validatedPaths.map(fp => this.analyzer.analyzeFile(fp)));
                        const summary = {
                            totalFiles: results.length,
                            averageScore: Math.round(results.reduce((sum, r) => sum + r.overallScore, 0) / results.length),
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
                        const { filePath } = args;
                        // Validate file path to prevent path traversal
                        const validatedPath = validateFilePath(filePath);
                        const { readFile, writeFile } = await import('fs/promises');
                        const content = await readFile(validatedPath, 'utf-8');
                        const result = await this.analyzer.analyzeFile(validatedPath);
                        const fixedContent = await this.analyzer.applyFixes(content, result.issues);
                        await writeFile(validatedPath, fixedContent, 'utf-8');
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
                    case 'generate_auto_fixes': {
                        const { filePath, safeOnly = false } = args;
                        // Validate file path
                        const validatedPath = validateFilePath(filePath);
                        const { readFile } = await import('fs/promises');
                        const content = await readFile(validatedPath, 'utf-8');
                        const fixResult = await this.autoFixer.generateFixes(content, validatedPath);
                        // Filter by safety if requested
                        const fixes = safeOnly ? fixResult.fixes.filter(f => f.safe) : fixResult.fixes;
                        const diff = this.autoFixer.generateDiff(fixes);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        file: filePath,
                                        summary: {
                                            total: fixes.length,
                                            safe: fixes.filter(f => f.safe).length,
                                            requiresReview: fixes.filter(f => !f.safe).length,
                                        },
                                        fixes: fixes.map(f => ({
                                            type: f.type,
                                            line: f.line,
                                            description: f.description,
                                            confidence: f.confidence,
                                            safe: f.safe,
                                            impact: f.impact,
                                        })),
                                        preview: diff,
                                    }, null, 2),
                                },
                            ],
                        };
                    }
                    case 'apply_auto_fixes': {
                        const { filePath, safeOnly = true } = args;
                        // Validate file path
                        const validatedPath = validateFilePath(filePath);
                        const { readFile, writeFile, copyFile } = await import('fs/promises');
                        const content = await readFile(validatedPath, 'utf-8');
                        // Create backup
                        const backupPath = `${validatedPath}.backup`;
                        await copyFile(validatedPath, backupPath);
                        try {
                            const fixResult = await this.autoFixer.generateFixes(content, validatedPath);
                            // Only apply safe fixes by default
                            const fixesToApply = safeOnly ? fixResult.fixes.filter(f => f.safe) : fixResult.fixes;
                            if (fixesToApply.length === 0) {
                                return {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify({
                                                success: true,
                                                message: 'No fixes to apply',
                                                file: filePath,
                                            }, null, 2),
                                        },
                                    ],
                                };
                            }
                            // Apply fixes
                            await writeFile(validatedPath, fixResult.fixedCode, 'utf-8');
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            file: filePath,
                                            backup: backupPath,
                                            fixesApplied: fixesToApply.length,
                                            summary: fixResult.summary,
                                            fixes: fixesToApply.map(f => ({
                                                type: f.type,
                                                line: f.line,
                                                description: f.description,
                                            })),
                                        }, null, 2),
                                    },
                                ],
                            };
                        }
                        catch (error) {
                            // Restore from backup on error
                            await copyFile(backupPath, validatedPath);
                            throw error;
                        }
                    }
                    default:
                        throw new MCPError('REV_002', { tool: name });
                }
            }
            catch (error) {
                const errorMessage = getErrorMessage(error);
                const errorCode = error instanceof MCPError ? error.code : 'UNKNOWN';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                                code: errorCode,
                                ...(error instanceof MCPError && error.details ? { details: error.details } : {}),
                            }, null, 2),
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
//# sourceMappingURL=mcp-server.js.map