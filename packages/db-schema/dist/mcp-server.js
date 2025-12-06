#!/usr/bin/env node
/**
 * Database Schema Designer MCP Server
 * Provides comprehensive database schema design, migration, and optimization tools
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { MCPError, getErrorMessage, formatResponse, truncateArray, } from '@j0kz/shared';
import { DB_SCHEMA_TOOLS } from './constants/tool-definitions.js';
import { designSchema, generateMigration, createERDiagram, optimizeIndexes, normalizeSchema, generateSeedData, validateSchema, analyzeSchema, } from './designer.js';
/**
 * MCP Server for Database Schema Designer
 */
class DatabaseSchemaServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'db-schema-designer',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.setupErrorHandling();
    }
    /**
     * Setup tool request handlers
     */
    setupToolHandlers() {
        // List available tools - using enhanced definitions with examples
        // Following Anthropic Advanced Tool Use best practices (Nov 2025)
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: DB_SCHEMA_TOOLS,
        }));
        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args } = request.params;
                switch (name) {
                    case 'design_schema':
                        return await this.handleDesignSchema(args);
                    case 'generate_migration':
                        return await this.handleGenerateMigration(args);
                    case 'create_er_diagram':
                        return await this.handleCreateERDiagram(args);
                    case 'optimize_indexes':
                        return await this.handleOptimizeIndexes(args);
                    case 'normalize_schema':
                        return await this.handleNormalizeSchema(args);
                    case 'generate_seed_data':
                        return await this.handleGenerateSeedData(args);
                    case 'validate_schema':
                        return await this.handleValidateSchema(args);
                    case 'analyze_schema':
                        return await this.handleAnalyzeSchema(args);
                    default:
                        throw new MCPError('DB_009', { tool: name });
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
    /**
     * Handle design_schema tool
     */
    async handleDesignSchema(args) {
        const { requirements, options, response_format = 'detailed', } = args;
        if (!requirements || !options?.database) {
            throw new MCPError('DB_001');
        }
        const schema = designSchema(requirements, options);
        const formatted = formatResponse(schema, { format: response_format }, {
            minimal: r => ({
                database: r.database,
                tablesCount: r.tables?.length || 0,
            }),
            concise: r => ({
                database: r.database,
                tables: truncateArray((r.tables || []).map((t) => ({
                    name: t.name,
                    columnsCount: t.columns?.length || 0,
                })), 'concise'),
                relationshipsCount: r.relationships?.length || 0,
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
     * Handle generate_migration tool
     */
    async handleGenerateMigration(args) {
        const { schema, description, response_format = 'detailed', } = args;
        if (!schema || !description) {
            throw new MCPError('DB_002');
        }
        const migration = generateMigration(schema, description);
        const formatted = formatResponse(migration, { format: response_format }, {
            minimal: (r) => ({
                version: r.version,
                hasUp: !!r.up,
                hasDown: !!r.down,
            }),
            concise: (r) => ({
                version: r.version,
                description: r.description,
                upPreview: r.up?.substring(0, 200) + (r.up?.length > 200 ? '...' : ''),
            }),
            detailed: (r) => r,
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
     * Handle create_er_diagram tool
     */
    async handleCreateERDiagram(args) {
        const { schema, options = { format: 'mermaid', includeColumns: true, includeRelationships: true }, response_format = 'detailed', } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const diagram = createERDiagram(schema, options);
        // For diagrams, minimal/concise return metadata, detailed returns full diagram
        const formatted = formatResponse({ diagram, format: options.format || 'mermaid', tables: schema.tables?.length || 0 }, { format: response_format }, {
            minimal: r => ({
                format: r.format,
                tables: r.tables,
                length: r.diagram.length,
            }),
            concise: r => ({
                format: r.format,
                tables: r.tables,
                preview: r.diagram.substring(0, 500) + (r.diagram.length > 500 ? '...' : ''),
            }),
            detailed: r => r.diagram,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: typeof formatted === 'string' ? formatted : JSON.stringify(formatted, null, 2),
                },
            ],
        };
    }
    /**
     * Handle optimize_indexes tool
     */
    async handleOptimizeIndexes(args) {
        const { schema, response_format = 'detailed' } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const suggestions = optimizeIndexes(schema);
        const formatted = formatResponse({ suggestions }, { format: response_format }, {
            minimal: (r) => ({
                suggestionsCount: r.suggestions?.length || 0,
            }),
            concise: (r) => ({
                suggestions: truncateArray((r.suggestions || []).map((s) => ({
                    table: s.table,
                    columns: s.columns,
                    type: s.type,
                })), 'concise'),
            }),
            detailed: (r) => r,
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
     * Handle normalize_schema tool
     */
    async handleNormalizeSchema(args) {
        const { schema, response_format = 'detailed' } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const suggestions = normalizeSchema(schema);
        const formatted = formatResponse({ suggestions }, { format: response_format }, {
            minimal: (r) => ({
                suggestionsCount: r.suggestions?.length || 0,
            }),
            concise: (r) => ({
                suggestions: truncateArray((r.suggestions || []).map((s) => ({ type: s.type, description: s.description })), 'concise'),
            }),
            detailed: (r) => r,
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
     * Handle generate_seed_data tool
     */
    async handleGenerateSeedData(args) {
        const { schema, recordsPerTable = 10, response_format = 'detailed', } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const seedData = generateSeedData(schema, recordsPerTable);
        const formatted = formatResponse({ seedData }, { format: response_format }, {
            minimal: (r) => ({
                tablesCount: r.seedData?.length || 0,
            }),
            concise: (r) => ({
                tables: (r.seedData || []).map((s) => ({
                    table: s.table,
                    recordsCount: s.records?.length || 0,
                })),
            }),
            detailed: (r) => r,
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
     * Handle validate_schema tool
     */
    async handleValidateSchema(args) {
        const { schema, response_format = 'detailed' } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const validation = validateSchema(schema);
        const formatted = formatResponse(validation, { format: response_format }, {
            minimal: (r) => ({
                valid: r.valid,
                errorsCount: r.errors?.length || 0,
                warningsCount: r.warnings?.length || 0,
            }),
            concise: (r) => ({
                valid: r.valid,
                errors: truncateArray((r.errors || []).map((e) => ({ type: e.type, message: e.message })), 'concise'),
                warnings: truncateArray((r.warnings || []).map((w) => ({ type: w.type, message: w.message })), 'concise'),
            }),
            detailed: (r) => r,
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
     * Handle analyze_schema tool
     */
    async handleAnalyzeSchema(args) {
        const { schema, response_format = 'detailed' } = args;
        if (!schema) {
            throw new MCPError('DB_003');
        }
        const analysis = analyzeSchema(schema);
        const formatted = formatResponse(analysis, { format: response_format }, {
            minimal: (r) => ({
                tableCount: r.tableCount,
                normalForm: r.normalForm,
            }),
            concise: (r) => ({
                tableCount: r.tableCount,
                columnCount: r.columnCount,
                indexCount: r.indexCount,
                relationshipCount: r.relationshipCount,
                normalForm: r.normalForm,
                complexity: r.complexity,
            }),
            detailed: (r) => r,
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
     * Setup error handling
     */
    setupErrorHandling() {
        this.server.onerror = error => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    /**
     * Start the MCP server
     */
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Database Schema Designer MCP server running on stdio');
    }
}
// Start the server
const server = new DatabaseSchemaServer();
server.run().catch(console.error);
//# sourceMappingURL=mcp-server.js.map