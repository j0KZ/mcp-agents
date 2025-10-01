#!/usr/bin/env node

/**
 * Database Schema Designer MCP Server
 * Provides comprehensive database schema design, migration, and optimization tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

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

import type {
  DatabaseSchema,
  SchemaDesignOptions,
  ERDiagramOptions,
} from './types.js';

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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'design_schema',
          description:
            'Design a database schema from plain text requirements. Supports PostgreSQL, MySQL, and MongoDB. Automatically extracts entities, relationships, and generates complete schema definitions.',
          inputSchema: {
            type: 'object',
            properties: {
              requirements: {
                type: 'string',
                description:
                  'Plain text description of data requirements (e.g., "Users have many orders. Orders contain products. Products belong to categories.")',
              },
              options: {
                type: 'object',
                description: 'Schema design options',
                properties: {
                  database: {
                    type: 'string',
                    enum: ['postgres', 'mysql', 'mongodb'],
                    description: 'Target database type',
                  },
                  normalForm: {
                    type: 'string',
                    enum: ['1NF', '2NF', '3NF', 'BCNF'],
                    description: 'Target normal form (default: 3NF)',
                  },
                  includeTimestamps: {
                    type: 'boolean',
                    description: 'Add created_at/updated_at columns (default: true)',
                  },
                  includeSoftDeletes: {
                    type: 'boolean',
                    description: 'Add deleted_at column (default: false)',
                  },
                  useUUIDs: {
                    type: 'boolean',
                    description: 'Use UUIDs instead of integers for primary keys (default: false)',
                  },
                  addIndexes: {
                    type: 'boolean',
                    description: 'Automatically add common indexes (default: true)',
                  },
                  addComments: {
                    type: 'boolean',
                    description: 'Add comments to tables and columns (default: true)',
                  },
                },
                required: ['database'],
              },
            },
            required: ['requirements', 'options'],
          },
        },
        {
          name: 'generate_migration',
          description:
            'Generate database migration files (up/down) from a schema definition. Supports SQL migrations for PostgreSQL/MySQL and mongosh commands for MongoDB.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
              description: {
                type: 'string',
                description: 'Migration description (e.g., "create initial schema")',
              },
            },
            required: ['schema', 'description'],
          },
        },
        {
          name: 'create_er_diagram',
          description:
            'Create an Entity-Relationship diagram from a schema. Supports Mermaid, PlantUML, and DBML formats. Perfect for documentation and visualization.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
              options: {
                type: 'object',
                description: 'Diagram generation options',
                properties: {
                  format: {
                    type: 'string',
                    enum: ['mermaid', 'plantuml', 'dbml'],
                    description: 'Output format (default: mermaid)',
                  },
                  includeColumns: {
                    type: 'boolean',
                    description: 'Include column details (default: true)',
                  },
                  includeIndexes: {
                    type: 'boolean',
                    description: 'Include index information (default: false)',
                  },
                  includeRelationships: {
                    type: 'boolean',
                    description: 'Show relationships between tables (default: true)',
                  },
                  theme: {
                    type: 'string',
                    enum: ['default', 'dark', 'neutral'],
                    description: 'Diagram theme (default: default)',
                  },
                },
              },
            },
            required: ['schema'],
          },
        },
        {
          name: 'optimize_indexes',
          description:
            'Analyze schema and suggest index optimizations. Identifies missing indexes on foreign keys, frequently filtered columns, and opportunities for compound indexes.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
            },
            required: ['schema'],
          },
        },
        {
          name: 'normalize_schema',
          description:
            'Suggest schema normalizations to improve data integrity and reduce redundancy. Identifies violations of 1NF, 2NF, 3NF, and BCNF with specific recommendations.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
            },
            required: ['schema'],
          },
        },
        {
          name: 'generate_seed_data',
          description:
            'Generate realistic seed data for testing. Creates mock records that respect foreign key constraints and data types.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
              recordsPerTable: {
                type: 'number',
                description: 'Number of records to generate per table (default: 10)',
              },
            },
            required: ['schema'],
          },
        },
        {
          name: 'validate_schema',
          description:
            'Validate schema for errors and best practice violations. Checks for missing primary keys, naming conventions, proper indexing, and more.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
            },
            required: ['schema'],
          },
        },
        {
          name: 'analyze_schema',
          description:
            'Analyze schema complexity and characteristics. Provides metrics on tables, columns, indexes, relationships, normal form, and estimated size.',
          inputSchema: {
            type: 'object',
            properties: {
              schema: {
                type: 'object',
                description: 'Complete database schema object',
              },
            },
            required: ['schema'],
          },
        },
      ],
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
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${errorMessage}`
        );
      }
    });
  }

  /**
   * Handle design_schema tool
   */
  private async handleDesignSchema(args: any) {
    const { requirements, options } = args as {
      requirements: string;
      options: SchemaDesignOptions;
    };

    if (!requirements || !options?.database) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: requirements and options.database'
      );
    }

    const schema = designSchema(requirements, options);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(schema, null, 2),
        },
      ],
    };
  }

  /**
   * Handle generate_migration tool
   */
  private async handleGenerateMigration(args: any) {
    const { schema, description } = args as {
      schema: DatabaseSchema;
      description: string;
    };

    if (!schema || !description) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameters: schema and description'
      );
    }

    const migration = generateMigration(schema, description);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(migration, null, 2),
        },
      ],
    };
  }

  /**
   * Handle create_er_diagram tool
   */
  private async handleCreateERDiagram(args: any) {
    const { schema, options = { format: 'mermaid', includeColumns: true, includeRelationships: true } } = args as {
      schema: DatabaseSchema;
      options?: ERDiagramOptions;
    };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const diagram = createERDiagram(schema, options);

    return {
      content: [
        {
          type: 'text',
          text: diagram,
        },
      ],
    };
  }

  /**
   * Handle optimize_indexes tool
   */
  private async handleOptimizeIndexes(args: any) {
    const { schema } = args as { schema: DatabaseSchema };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const suggestions = optimizeIndexes(schema);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2),
        },
      ],
    };
  }

  /**
   * Handle normalize_schema tool
   */
  private async handleNormalizeSchema(args: any) {
    const { schema } = args as { schema: DatabaseSchema };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const suggestions = normalizeSchema(schema);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(suggestions, null, 2),
        },
      ],
    };
  }

  /**
   * Handle generate_seed_data tool
   */
  private async handleGenerateSeedData(args: any) {
    const { schema, recordsPerTable = 10 } = args as {
      schema: DatabaseSchema;
      recordsPerTable?: number;
    };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const seedData = generateSeedData(schema, recordsPerTable);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(seedData, null, 2),
        },
      ],
    };
  }

  /**
   * Handle validate_schema tool
   */
  private async handleValidateSchema(args: any) {
    const { schema } = args as { schema: DatabaseSchema };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const validation = validateSchema(schema);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validation, null, 2),
        },
      ],
    };
  }

  /**
   * Handle analyze_schema tool
   */
  private async handleAnalyzeSchema(args: any) {
    const { schema } = args as { schema: DatabaseSchema };

    if (!schema) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Missing required parameter: schema'
      );
    }

    const analysis = analyzeSchema(schema);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
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
