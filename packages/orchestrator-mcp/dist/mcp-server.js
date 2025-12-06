#!/usr/bin/env node
/**
 * Orchestrator MCP Server
 * Coordinates multiple MCP tools into powerful workflows
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MCPPipeline, MCPError, getErrorMessage, formatResponse, truncateArray, 
// Phase 3: Tool Registry imports
searchTools, findToolByName, getToolCount, 
// Phase 4: Progressive Disclosure imports
getCategoryStats, getServerTools, getServerNames, } from '@j0kz/shared';
import { ORCHESTRATOR_TOOLS } from './constants/tool-definitions.js';
import { WORKFLOWS, createWorkflow } from './workflows.js';
import { selectWorkflowByFocus, isValidFocus } from './helpers/workflow-selector.js';
import { buildClarificationResponse, buildInvalidFocusResponse, buildSuccessResponse, } from './helpers/response-builder.js';
class OrchestratorServer {
    server;
    loadedTools = new Set(); // Track loaded deferred tools
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
        // List available tools - using enhanced definitions with examples
        // Following Anthropic Advanced Tool Use best practices (Nov 2025)
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: ORCHESTRATOR_TOOLS,
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                if (!args) {
                    throw new MCPError('ORCH_001', { tool: name });
                }
                if (name === 'run_workflow') {
                    return await this.runWorkflow(args.workflow, args.focus, args.files, args.projectPath || '.', args.language, args.response_format || 'detailed');
                }
                if (name === 'run_sequence') {
                    return await this.runSequence(args.steps, args.response_format || 'detailed');
                }
                if (name === 'list_workflows') {
                    return this.listWorkflows(args.response_format || 'detailed');
                }
                // Phase 3: Deferred Loading meta-tools
                if (name === 'search_tools') {
                    return this.searchToolsHandler(args);
                }
                if (name === 'load_tool') {
                    return this.loadToolHandler(args.toolName, args.server, args.response_format || 'detailed');
                }
                // Phase 4: Progressive Disclosure - list_capabilities
                if (name === 'list_capabilities') {
                    return this.listCapabilitiesHandler(args.server, args.response_format || 'detailed');
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
     * @param response_format - Response verbosity level (optional, defaults to 'detailed')
     * @returns MCP response with workflow results or clarification request
     */
    async runWorkflow(workflowName, focus, files, projectPath, language, response_format = 'detailed') {
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
        // Note: buildSuccessResponse already has its own formatting, but we can apply additional formatting
        // For now, we return the existing response as it already has good structure
        // The response_format can be used by the caller if needed
        return buildSuccessResponse(selectedWorkflow, focus, result);
    }
    /**
     * Run a custom sequence of MCP tools
     */
    async runSequence(steps, response_format = 'detailed') {
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
        const sequenceResult = {
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
        };
        const formatted = formatResponse(sequenceResult, { format: response_format }, {
            minimal: r => ({
                success: r.success,
                stepsCount: r.steps.length,
                duration: r.duration,
            }),
            concise: r => ({
                success: r.success,
                duration: r.duration,
                steps: truncateArray(r.steps.map(s => ({ name: s.name, success: s.success, duration: s.duration })), 'concise'),
                errorsCount: r.errors?.length || 0,
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
    /**
     * List all available workflows
     */
    listWorkflows(response_format = 'detailed') {
        const workflows = Object.entries(WORKFLOWS).map(([id, meta]) => ({
            id,
            ...meta,
        }));
        const formatted = formatResponse({ workflows }, { format: response_format }, {
            minimal: r => ({
                count: r.workflows.length,
                ids: r.workflows.map((w) => w.id),
            }),
            concise: r => ({
                workflows: truncateArray(r.workflows.map((w) => ({ id: w.id, name: w.name, description: w.description })), 'concise'),
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
    /**
     * Phase 3: Search tools meta-tool handler
     * Enables tool discovery by keyword, category, or frequency
     */
    searchToolsHandler(options) {
        const { response_format = 'detailed', ...searchOptions } = options;
        const results = searchTools(searchOptions);
        const totalAvailable = getToolCount();
        const searchResult = {
            tools: results.map(r => ({
                name: r.tool.name,
                server: r.tool.server,
                description: r.tool.description,
                category: r.tool.category,
                frequency: r.tool.frequency,
                relevance: r.relevance,
                matchedKeywords: r.matchedKeywords,
                loaded: this.loadedTools.has(r.tool.name) || r.tool.frequency === 'high',
            })),
            totalAvailable,
            query: searchOptions.query,
            filters: {
                category: searchOptions.category,
                frequency: searchOptions.frequency,
                server: searchOptions.server,
            },
        };
        const formatted = formatResponse(searchResult, { format: response_format }, {
            minimal: r => ({
                count: r.tools.length,
                totalAvailable: r.totalAvailable,
            }),
            concise: r => ({
                tools: truncateArray(r.tools.map((t) => ({
                    name: t.name,
                    server: t.server,
                    relevance: t.relevance,
                    loaded: t.loaded,
                })), 'concise'),
                totalAvailable: r.totalAvailable,
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
    /**
     * Phase 3: Load tool meta-tool handler
     * Loads a deferred tool into context for use
     */
    loadToolHandler(toolName, server, response_format = 'detailed') {
        // Find the tool in registry
        const tool = findToolByName(toolName);
        if (!tool) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: `Tool not found: ${toolName}`,
                            suggestion: 'Use search_tools to discover available tools',
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
        // Check if server matches (if provided)
        if (server && tool.server !== server) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: false,
                            error: `Tool ${toolName} is not from server ${server}`,
                            actualServer: tool.server,
                        }, null, 2),
                    },
                ],
                isError: true,
            };
        }
        // Check if already loaded (high-frequency or explicitly loaded)
        const alreadyLoaded = tool.frequency === 'high' || this.loadedTools.has(toolName);
        if (!alreadyLoaded) {
            // Mark as loaded
            this.loadedTools.add(toolName);
        }
        const loadResult = {
            success: true,
            toolName: tool.name,
            server: tool.server,
            category: tool.category,
            frequency: tool.frequency,
            alreadyLoaded,
            message: alreadyLoaded
                ? `Tool ${toolName} was already loaded. You can use it now.`
                : `Tool ${toolName} loaded successfully. You can now use it.`,
            description: tool.description,
        };
        const formatted = formatResponse(loadResult, { format: response_format }, {
            minimal: r => ({
                success: r.success,
                toolName: r.toolName,
            }),
            concise: r => ({
                success: r.success,
                toolName: r.toolName,
                server: r.server,
                message: r.message,
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
    /**
     * Phase 4: Progressive Disclosure - list_capabilities handler
     * Returns category index or server-specific tool list
     */
    listCapabilitiesHandler(server, response_format = 'detailed') {
        // Server-specific mode: return tools for that server
        if (server) {
            const serverTools = getServerTools(server);
            const availableServers = getServerNames();
            if (serverTools.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: `Unknown server: ${server}`,
                                availableServers,
                                hint: 'Use list_capabilities() without parameters to see all categories',
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
            const serverResult = {
                server,
                tools: serverTools,
                totalTools: serverTools.length,
            };
            const formatted = formatResponse(serverResult, { format: response_format }, {
                minimal: r => ({
                    server: r.server,
                    totalTools: r.totalTools,
                }),
                concise: r => ({
                    server: r.server,
                    tools: truncateArray(r.tools.map((t) => ({
                        name: t.name,
                        frequency: t.frequency,
                    })), 'concise'),
                    totalTools: r.totalTools,
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
        // Default mode: return category overview
        const categories = getCategoryStats();
        const totalTools = getToolCount();
        const overviewResult = {
            categories,
            totalTools,
            hint: 'Use search_tools({ category: "name" }) to explore a category',
        };
        const formatted = formatResponse(overviewResult, { format: response_format }, {
            minimal: r => ({
                categoryCount: r.categories.length,
                totalTools: r.totalTools,
            }),
            concise: r => ({
                categories: truncateArray(r.categories.map((c) => ({
                    name: c.name,
                    toolCount: c.toolCount,
                })), 'concise'),
                totalTools: r.totalTools,
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
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Orchestrator MCP Server running on stdio');
    }
}
const server = new OrchestratorServer();
server.run().catch(console.error);
//# sourceMappingURL=mcp-server.js.map