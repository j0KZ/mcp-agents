#!/usr/bin/env node

/**
 * Database Schema Designer MCP Server
 * Provides comprehensive database schema design, migration, and optimization tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import {
  MCPError,
  getErrorMessage,
  ResponseFormat,
  formatResponse,
  truncateArray,
} from '@j0kz/shared';
import { DB_SCHEMA_TOOLS } from './constants/tool-definitions.js';

import {
  designSchema,
  generateMigration,
  createERDiagram,
  optimizeIndexes,
  normalizeSchema,
  generateSeedData,
  validateSchema,
  analyzeSchema,
} from './designer.js';

import type { DatabaseSchema, SchemaDesignOptions, ERDiagramOptions } from './types.js';

/**
 * MCP Server for Database Schema Designer
 */
class DatabaseSchemaServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'db-schema-designer',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup tool request handlers
   */
  private setupToolHandlers(): void {
    // List available tools - using enhanced definitions with examples
    // Following Anthropic Advanced Tool Use best practices (Nov 2025)
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: DB_SCHEMA_TOOLS,
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
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

  /**
   * Handle design_schema tool
   */
  private async handleDesignSchema(args: any) {
    const {
      requirements,
      options,
      response_format = 'detailed',
    } = args as {
      requirements: string;
      options: SchemaDesignOptions;
      response_format?: ResponseFormat;
    };

    if (!requirements || !options?.database) {
      throw new MCPError('DB_001');
    }

    const schema = designSchema(requirements, options);

    const formatted = formatResponse(
      schema,
      { format: response_format },
      {
        minimal: r => ({
          database: r.database,
          tablesCount: r.tables?.length || 0,
        }),
        concise: r => ({
          database: r.database,
          tables: truncateArray(
            (r.tables || []).map((t: any) => ({
              name: t.name,
              columnsCount: t.columns?.length || 0,
            })),
            'concise'
          ),
          relationshipsCount: r.relationships?.length || 0,
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

  /**
   * Handle generate_migration tool
   */
  private async handleGenerateMigration(args: any) {
    const {
      schema,
      description,
      response_format = 'detailed',
    } = args as {
      schema: DatabaseSchema;
      description: string;
      response_format?: ResponseFormat;
    };

    if (!schema || !description) {
      throw new MCPError('DB_002');
    }

    const migration = generateMigration(schema, description) as any;

    const formatted = formatResponse(
      migration,
      { format: response_format },
      {
        minimal: (r: any) => ({
          version: r.version,
          hasUp: !!r.up,
          hasDown: !!r.down,
        }),
        concise: (r: any) => ({
          version: r.version,
          description: r.description,
          upPreview: r.up?.substring(0, 200) + (r.up?.length > 200 ? '...' : ''),
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

  /**
   * Handle create_er_diagram tool
   */
  private async handleCreateERDiagram(args: any) {
    const {
      schema,
      options = { format: 'mermaid', includeColumns: true, includeRelationships: true },
      response_format = 'detailed',
    } = args as {
      schema: DatabaseSchema;
      options?: ERDiagramOptions;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const diagram = createERDiagram(schema, options);

    // For diagrams, minimal/concise return metadata, detailed returns full diagram
    const formatted = formatResponse(
      { diagram, format: options.format || 'mermaid', tables: schema.tables?.length || 0 },
      { format: response_format },
      {
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
      }
    );

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
  private async handleOptimizeIndexes(args: any) {
    const { schema, response_format = 'detailed' } = args as {
      schema: DatabaseSchema;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const suggestions = optimizeIndexes(schema) as any;

    const formatted = formatResponse(
      { suggestions },
      { format: response_format },
      {
        minimal: (r: any) => ({
          suggestionsCount: r.suggestions?.length || 0,
        }),
        concise: (r: any) => ({
          suggestions: truncateArray(
            (r.suggestions || []).map((s: any) => ({
              table: s.table,
              columns: s.columns,
              type: s.type,
            })),
            'concise'
          ),
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

  /**
   * Handle normalize_schema tool
   */
  private async handleNormalizeSchema(args: any) {
    const { schema, response_format = 'detailed' } = args as {
      schema: DatabaseSchema;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const suggestions = normalizeSchema(schema) as any;

    const formatted = formatResponse(
      { suggestions },
      { format: response_format },
      {
        minimal: (r: any) => ({
          suggestionsCount: r.suggestions?.length || 0,
        }),
        concise: (r: any) => ({
          suggestions: truncateArray(
            (r.suggestions || []).map((s: any) => ({ type: s.type, description: s.description })),
            'concise'
          ),
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

  /**
   * Handle generate_seed_data tool
   */
  private async handleGenerateSeedData(args: any) {
    const {
      schema,
      recordsPerTable = 10,
      response_format = 'detailed',
    } = args as {
      schema: DatabaseSchema;
      recordsPerTable?: number;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const seedData = generateSeedData(schema, recordsPerTable) as any;

    const formatted = formatResponse(
      { seedData },
      { format: response_format },
      {
        minimal: (r: any) => ({
          tablesCount: r.seedData?.length || 0,
        }),
        concise: (r: any) => ({
          tables: (r.seedData || []).map((s: any) => ({
            table: s.table,
            recordsCount: s.records?.length || 0,
          })),
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

  /**
   * Handle validate_schema tool
   */
  private async handleValidateSchema(args: any) {
    const { schema, response_format = 'detailed' } = args as {
      schema: DatabaseSchema;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const validation = validateSchema(schema) as any;

    const formatted = formatResponse(
      validation,
      { format: response_format },
      {
        minimal: (r: any) => ({
          valid: r.valid,
          errorsCount: r.errors?.length || 0,
          warningsCount: r.warnings?.length || 0,
        }),
        concise: (r: any) => ({
          valid: r.valid,
          errors: truncateArray(
            (r.errors || []).map((e: any) => ({ type: e.type, message: e.message })),
            'concise'
          ),
          warnings: truncateArray(
            (r.warnings || []).map((w: any) => ({ type: w.type, message: w.message })),
            'concise'
          ),
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

  /**
   * Handle analyze_schema tool
   */
  private async handleAnalyzeSchema(args: any) {
    const { schema, response_format = 'detailed' } = args as {
      schema: DatabaseSchema;
      response_format?: ResponseFormat;
    };

    if (!schema) {
      throw new MCPError('DB_003');
    }

    const analysis = analyzeSchema(schema) as any;

    const formatted = formatResponse(
      analysis,
      { format: response_format },
      {
        minimal: (r: any) => ({
          tableCount: r.tableCount,
          normalForm: r.normalForm,
        }),
        concise: (r: any) => ({
          tableCount: r.tableCount,
          columnCount: r.columnCount,
          indexCount: r.indexCount,
          relationshipCount: r.relationshipCount,
          normalForm: r.normalForm,
          complexity: r.complexity,
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

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
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
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Database Schema Designer MCP server running on stdio');
  }
}

// Start the server
const server = new DatabaseSchemaServer();
server.run().catch(console.error);
