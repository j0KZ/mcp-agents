#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { CodeAnalyzer } from './analyzer.js';
import { validateFilePath, MCPError, getErrorMessage, EnvironmentDetector, SmartPathResolver, EnhancedError, HealthChecker, VERSION as SHARED_VERSION, formatResponse, truncateArray, filterBySeverity, } from '@j0kz/shared';
import { AutoFixer } from './auto-fixer.js';
import { SMART_REVIEWER_TOOLS } from './constants/tool-definitions.js';
const VERSION = '1.0.35';
class SmartReviewerServer {
    server;
    analyzer;
    autoFixer;
    healthChecker;
    environment;
    constructor() {
        this.analyzer = new CodeAnalyzer();
        this.autoFixer = new AutoFixer();
        this.healthChecker = new HealthChecker('smart-reviewer', VERSION);
        // Detect runtime environment
        this.environment = EnvironmentDetector.detect();
        // Log startup info to stderr (won't interfere with MCP protocol)
        console.error('='.repeat(60));
        console.error(`Smart Reviewer MCP Server v${VERSION}`);
        console.error(`Shared Library: v${SHARED_VERSION}`);
        console.error(`IDE: ${this.environment.ide}${this.environment.ideVersion ? ' v' + this.environment.ideVersion : ''}`);
        console.error(`Locale: ${this.environment.locale}`);
        console.error(`Transport: ${this.environment.transport}`);
        console.error(`Project Root: ${this.environment.projectRoot || 'Not detected'}`);
        console.error('='.repeat(60));
        this.server = new Server({
            name: 'smart-reviewer',
            version: VERSION,
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools (with examples for improved accuracy - Anthropic Nov 2025)
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: SMART_REVIEWER_TOOLS,
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Log incoming request
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                event: 'tool_call',
                tool: name,
                ide: this.environment.ide,
            }));
            try {
                switch (name) {
                    case '__health': {
                        const { verbose = false } = args;
                        const health = await this.healthChecker.check(verbose);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: HealthChecker.format(health),
                                },
                            ],
                        };
                    }
                    case 'review_file': {
                        const { filePath, config: _config, response_format = 'detailed', } = args;
                        // Use smart path resolution
                        let resolvedPath;
                        try {
                            const resolution = await SmartPathResolver.resolvePath(filePath, {
                                projectRoot: this.environment.projectRoot || undefined,
                                workingDir: this.environment.workingDir,
                            });
                            resolvedPath = resolution.resolved;
                            console.error(JSON.stringify({
                                event: 'path_resolved',
                                requested: filePath,
                                resolved: resolvedPath,
                                strategy: resolution.strategy,
                            }));
                        }
                        catch {
                            // Fallback to old validation
                            resolvedPath = validateFilePath(filePath);
                        }
                        const result = await this.analyzer.analyzeFile(resolvedPath);
                        // Format response based on verbosity (Anthropic Advanced Tool Use - Nov 2025)
                        const formatted = formatResponse(result, { format: response_format }, {
                            minimal: r => ({
                                score: r.overallScore,
                                issueCount: r.issues.length,
                            }),
                            concise: r => ({
                                score: r.overallScore,
                                issueCount: r.issues.length,
                                criticalIssues: filterBySeverity(r.issues, 'concise'),
                                metrics: r.metrics,
                            }),
                            detailed: r => r,
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(formatted, null, 2),
                                },
                            ],
                        };
                    }
                    case 'batch_review': {
                        const { filePaths, config: _config, response_format = 'detailed', } = args;
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
                        // Format response based on verbosity (Anthropic Advanced Tool Use - Nov 2025)
                        const formatted = formatResponse(summary, { format: response_format }, {
                            minimal: s => ({
                                totalFiles: s.totalFiles,
                                averageScore: s.averageScore,
                                totalIssues: s.totalIssues,
                            }),
                            concise: s => ({
                                totalFiles: s.totalFiles,
                                averageScore: s.averageScore,
                                totalIssues: s.totalIssues,
                                results: truncateArray(s.results.map(r => ({
                                    file: r.file,
                                    score: r.overallScore,
                                    issueCount: r.issues.length,
                                })), 'concise'),
                            }),
                            detailed: s => s,
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(formatted, null, 2),
                                },
                            ],
                        };
                    }
                    case 'apply_fixes': {
                        const { filePath, response_format = 'detailed' } = args;
                        // Validate file path to prevent path traversal
                        const validatedPath = validateFilePath(filePath);
                        const { readFile, writeFile } = await import('fs/promises');
                        const content = await readFile(validatedPath, 'utf-8');
                        const result = await this.analyzer.analyzeFile(validatedPath);
                        const fixedContent = await this.analyzer.applyFixes(content, result.issues);
                        await writeFile(validatedPath, fixedContent, 'utf-8');
                        const fixResult = {
                            success: true,
                            file: filePath,
                            fixesApplied: result.issues.filter(i => i.fix).length,
                        };
                        // Format response based on verbosity
                        const formatted = formatResponse(fixResult, { format: response_format }, {
                            minimal: r => ({ success: r.success, fixesApplied: r.fixesApplied }),
                            concise: r => r,
                            detailed: r => r,
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(formatted, null, 2),
                                },
                            ],
                        };
                    }
                    case 'generate_auto_fixes': {
                        const { filePath, safeOnly = false, response_format = 'detailed', } = args;
                        // Validate file path
                        const validatedPath = validateFilePath(filePath);
                        const { readFile } = await import('fs/promises');
                        const content = await readFile(validatedPath, 'utf-8');
                        const fixResult = await this.autoFixer.generateFixes(content, validatedPath);
                        // Filter by safety if requested
                        const fixes = safeOnly ? fixResult.fixes.filter(f => f.safe) : fixResult.fixes;
                        const diff = this.autoFixer.generateDiff(fixes);
                        const result = {
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
                        };
                        // Format response based on verbosity
                        const formatted = formatResponse(result, { format: response_format }, {
                            minimal: r => ({
                                success: r.success,
                                total: r.summary.total,
                                safe: r.summary.safe,
                            }),
                            concise: r => ({
                                success: r.success,
                                file: r.file,
                                summary: r.summary,
                                fixes: truncateArray(r.fixes, 'concise'),
                            }),
                            detailed: r => r,
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(formatted, null, 2),
                                },
                            ],
                        };
                    }
                    case 'apply_auto_fixes': {
                        const { filePath, safeOnly = true, response_format = 'detailed', } = args;
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
                                const noFixResult = {
                                    success: true,
                                    message: 'No fixes to apply',
                                    file: filePath,
                                };
                                const formatted = formatResponse(noFixResult, { format: response_format }, {
                                    minimal: r => ({ success: r.success }),
                                    concise: r => r,
                                    detailed: r => r,
                                });
                                return {
                                    content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
                                };
                            }
                            // Apply fixes
                            await writeFile(validatedPath, fixResult.fixedCode, 'utf-8');
                            const result = {
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
                            };
                            // Format response based on verbosity
                            const formatted = formatResponse(result, { format: response_format }, {
                                minimal: r => ({ success: r.success, fixesApplied: r.fixesApplied }),
                                concise: r => ({
                                    success: r.success,
                                    file: r.file,
                                    fixesApplied: r.fixesApplied,
                                    summary: r.summary,
                                }),
                                detailed: r => r,
                            });
                            return {
                                content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }],
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
                // Log error
                console.error(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    event: 'error',
                    tool: name,
                    error: error instanceof Error ? error.message : String(error),
                }));
                // Enhanced error handling
                if (error instanceof MCPError) {
                    const enhanced = EnhancedError.fromMCPError(error, {
                        tool: name,
                        args: args,
                        environment: {
                            ide: this.environment.ide,
                            locale: this.environment.locale,
                        },
                    });
                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(enhanced, null, 2),
                            },
                        ],
                        isError: true,
                    };
                }
                // Fallback for non-MCP errors
                const errorMessage = getErrorMessage(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                                code: 'UNKNOWN',
                                timestamp: new Date().toISOString(),
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