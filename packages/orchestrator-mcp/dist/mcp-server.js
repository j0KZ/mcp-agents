#!/usr/bin/env node
/**
 * Orchestrator MCP Server
 * Coordinates multiple MCP tools into powerful workflows
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { MCPPipeline } from '@j0kz/shared';
import { WORKFLOWS, createWorkflow } from './workflows.js';
class OrchestratorServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'orchestrator',
            version: '1.0.30',
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
                    name: 'run_workflow',
                    description: 'Execute a pre-built multi-tool workflow (pre-commit, pre-merge, or quality-audit)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            workflow: {
                                type: 'string',
                                enum: ['pre-commit', 'pre-merge', 'quality-audit'],
                                description: 'Pre-built workflow to execute',
                            },
                            files: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Files to process',
                            },
                            projectPath: {
                                type: 'string',
                                description: 'Project root path (optional, defaults to current directory)',
                            },
                        },
                        required: ['workflow', 'files'],
                    },
                },
                {
                    name: 'run_sequence',
                    description: 'Execute a custom sequence of MCP tools with full control over steps and dependencies',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            steps: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                            description: 'Step name for reference',
                                        },
                                        mcp: {
                                            type: 'string',
                                            description: 'MCP to invoke (e.g., smart-reviewer)',
                                        },
                                        tool: {
                                            type: 'string',
                                            description: 'Tool to call (e.g., review_file)',
                                        },
                                        params: {
                                            type: 'object',
                                            description: 'Tool parameters',
                                        },
                                        dependsOn: {
                                            type: 'array',
                                            items: { type: 'string' },
                                            description: 'Step dependencies (optional)',
                                        },
                                    },
                                    required: ['name', 'mcp', 'tool'],
                                },
                                description: 'Sequence of MCP tool calls',
                            },
                        },
                        required: ['steps'],
                    },
                },
                {
                    name: 'list_workflows',
                    description: 'List all available pre-built workflows with descriptions',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
            ],
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                if (!args) {
                    throw new Error('Missing arguments');
                }
                if (name === 'run_workflow') {
                    return await this.runWorkflow(args.workflow, args.files, args.projectPath || '.');
                }
                if (name === 'run_sequence') {
                    return await this.runSequence(args.steps);
                }
                if (name === 'list_workflows') {
                    return this.listWorkflows();
                }
                throw new Error(`Unknown tool: ${name}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    /**
     * Run a pre-built workflow
     */
    async runWorkflow(workflowName, files, projectPath) {
        const pipeline = createWorkflow(workflowName, files, projectPath);
        const result = await pipeline.execute();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        workflow: workflowName,
                        success: result.success,
                        duration: result.totalDuration,
                        steps: result.steps.map((s) => ({
                            name: s.name,
                            success: s.result.success,
                            duration: s.duration,
                            data: s.result.data,
                            error: s.result.error,
                        })),
                        errors: result.errors,
                    }, null, 2),
                },
            ],
        };
    }
    /**
     * Run a custom sequence of MCP tools
     */
    async runSequence(steps) {
        const pipeline = new MCPPipeline();
        for (const step of steps) {
            pipeline.addStep({
                name: step.name,
                tool: step.mcp,
                config: {
                    action: step.tool,
                    params: step.params || {},
                },
                dependsOn: step.dependsOn,
            });
        }
        const result = await pipeline.execute();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: result.success,
                        duration: result.totalDuration,
                        steps: result.steps.map((s) => ({
                            name: s.name,
                            success: s.result.success,
                            duration: s.duration,
                            data: s.result.data,
                            error: s.result.error,
                        })),
                        errors: result.errors,
                    }, null, 2),
                },
            ],
        };
    }
    /**
     * List all available workflows
     */
    listWorkflows() {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        workflows: Object.entries(WORKFLOWS).map(([id, meta]) => ({
                            id,
                            ...meta,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Orchestrator MCP Server running on stdio');
    }
}
const server = new OrchestratorServer();
server.run().catch(console.error);
//# sourceMappingURL=mcp-server.js.map