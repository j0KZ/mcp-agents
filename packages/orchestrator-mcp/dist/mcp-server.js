#!/usr/bin/env node
/**
 * Orchestrator MCP Server
 * Coordinates multiple MCP tools into powerful workflows
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MCPPipeline, MCPError, getErrorMessage } from '@j0kz/shared';
import { WORKFLOWS, createWorkflow } from './workflows.js';
import { selectWorkflowByFocus, isValidFocus } from './helpers/workflow-selector.js';
import { buildClarificationResponse, buildInvalidFocusResponse, buildSuccessResponse, } from './helpers/response-builder.js';
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
                    description: `Execute intelligent workflow with optional focus detection.

IMPORTANT: Always call this tool when user asks to "review my code", "check my code", or "analyze this".

**Smart Focus Detection:**
- Ambiguous request → Call WITHOUT workflow parameter to get clarification
- Specific request → Call WITH workflow or focus parameter

**Focus Areas (Auto-selects appropriate workflow):**
- security: Fast security scan
- quality: Code quality review with tests
- performance: Architecture and performance analysis
- comprehensive: Complete multi-dimensional analysis

**Direct Workflows (Bypass focus selection):**
- pre-commit: Git pre-commit checks
- pre-merge: PR validation
- quality-audit: Deep audit with reports

**Examples:**
- "review my code" → omit workflow (get clarification)
- "check security" → workflow='security' OR focus='security'
- "run pre-commit" → workflow='pre-commit'`,
                    inputSchema: {
                        type: 'object',
                        properties: {
                            workflow: {
                                type: 'string',
                                enum: ['pre-commit', 'pre-merge', 'quality-audit'],
                                description: 'Explicit workflow name (optional)',
                            },
                            focus: {
                                type: 'string',
                                enum: ['security', 'quality', 'performance', 'comprehensive'],
                                description: 'Focus area for smart workflow selection (optional)',
                            },
                            files: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Files to process (optional for project-level)',
                            },
                            projectPath: {
                                type: 'string',
                                description: 'Project root (optional, defaults to cwd)',
                            },
                            language: {
                                type: 'string',
                                enum: ['en', 'es'],
                                description: 'Response language (optional, auto-detects from user input)',
                            },
                        },
                        required: [],
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
                    throw new MCPError('ORCH_001', { tool: name });
                }
                if (name === 'run_workflow') {
                    return await this.runWorkflow(args.workflow, args.focus, args.files, args.projectPath || '.', args.language);
                }
                if (name === 'run_sequence') {
                    return await this.runSequence(args.steps);
                }
                if (name === 'list_workflows') {
                    return this.listWorkflows();
                }
                throw new MCPError('ORCH_003', { tool: name });
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
    /**
     * Run workflow with smart focus detection
     * BILINGUAL: Supports English and Spanish responses
     *
     * @param workflowName - Explicit workflow to run (optional)
     * @param focus - Focus area for smart workflow selection (optional)
     * @param files - Files to process (optional)
     * @param projectPath - Project root directory (optional)
     * @param language - Response language: 'en' or 'es' (optional, defaults to 'en')
     * @returns MCP response with workflow results or clarification request
     */
    async runWorkflow(workflowName, focus, files, projectPath, language) {
        // Language validation and default
        const validLanguages = ['en', 'es'];
        const userLanguage = language && validLanguages.includes(language) ? language : 'en';
        // STEP 1: Ambiguity detection - return clarification if BOTH missing
        if (!workflowName && !focus) {
            return buildClarificationResponse(userLanguage);
        }
        // STEP 2: Validate focus if provided
        if (focus && !isValidFocus(focus)) {
            return buildInvalidFocusResponse(focus, userLanguage);
        }
        // STEP 3: Select workflow (explicit workflow OR smart selection)
        const selectedWorkflow = workflowName || selectWorkflowByFocus(focus);
        // STEP 4: Execute pipeline (existing logic)
        const pipeline = createWorkflow(selectedWorkflow, files || [], projectPath || '.');
        const result = await pipeline.execute();
        return buildSuccessResponse(selectedWorkflow, focus, result);
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
                        steps: result.steps.map(s => ({
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