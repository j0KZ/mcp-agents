/**
 * DB Schema Designer - Tool Definitions with Examples
 * Following Anthropic Advanced Tool Use best practices (Nov 2025)
 */
import { RESPONSE_FORMAT_SCHEMA } from '@j0kz/shared';
export const DESIGN_SCHEMA_EXAMPLES = [
    {
        name: 'Design e-commerce schema',
        description: 'Create database schema from requirements',
        input: {
            requirements: 'Users have many orders. Orders contain products. Products belong to categories. Track order status and shipping.',
            options: {
                database: 'postgres',
                normalForm: '3NF',
                includeTimestamps: true,
                useUUIDs: true,
            },
        },
        output: {
            database: 'postgres',
            tables: [
                {
                    name: 'users',
                    columns: [
                        { name: 'id', type: 'uuid', primaryKey: true },
                        { name: 'email', type: 'varchar(255)' },
                    ],
                },
                {
                    name: 'orders',
                    columns: [
                        { name: 'id', type: 'uuid' },
                        { name: 'user_id', type: 'uuid', foreignKey: 'users.id' },
                    ],
                },
                {
                    name: 'products',
                    columns: [
                        { name: 'id', type: 'uuid' },
                        { name: 'category_id', type: 'uuid' },
                    ],
                },
            ],
            relationships: [
                { from: 'orders', to: 'users', type: 'many-to-one' },
                { from: 'order_items', to: 'orders', type: 'many-to-one' },
            ],
        },
    },
];
export const GENERATE_MIGRATION_EXAMPLES = [
    {
        name: 'Generate SQL migration',
        description: 'Create up/down migration files',
        input: {
            schema: { database: 'postgres', tables: [{ name: 'users', columns: [] }] },
            description: 'create users table',
        },
        output: {
            filename: '20241124_create_users_table.sql',
            up: 'CREATE TABLE users (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  email VARCHAR(255) NOT NULL UNIQUE,\n  created_at TIMESTAMP DEFAULT NOW()\n);',
            down: 'DROP TABLE IF EXISTS users;',
        },
    },
];
export const CREATE_ER_DIAGRAM_EXAMPLES = [
    {
        name: 'Generate Mermaid ER diagram',
        description: 'Create visual representation of schema',
        input: {
            schema: { database: 'postgres', tables: [{ name: 'users' }, { name: 'orders' }] },
            options: { format: 'mermaid', includeColumns: true, includeRelationships: true },
        },
        output: {
            format: 'mermaid',
            diagram: 'erDiagram\n  users ||--o{ orders : "has"\n  users {\n    uuid id PK\n    string email\n  }\n  orders {\n    uuid id PK\n    uuid user_id FK\n  }',
        },
    },
];
export const OPTIMIZE_INDEXES_EXAMPLES = [
    {
        name: 'Suggest index optimizations',
        description: 'Find missing and redundant indexes',
        input: {
            schema: {
                database: 'postgres',
                tables: [{ name: 'orders', columns: [{ name: 'user_id', foreignKey: true }] }],
            },
        },
        output: {
            suggestions: [
                { table: 'orders', column: 'user_id', type: 'btree', reason: 'Foreign key without index' },
                { table: 'orders', column: 'created_at', type: 'btree', reason: 'Common query filter' },
            ],
            sql: 'CREATE INDEX idx_orders_user_id ON orders(user_id);',
        },
    },
];
export const NORMALIZE_SCHEMA_EXAMPLES = [
    {
        name: 'Suggest normalizations',
        description: 'Identify normalization improvements',
        input: {
            schema: {
                database: 'postgres',
                tables: [
                    { name: 'orders', columns: [{ name: 'customer_name' }, { name: 'customer_email' }] },
                ],
            },
        },
        output: {
            currentForm: '1NF',
            suggestions: [
                {
                    type: '2NF violation',
                    table: 'orders',
                    issue: 'customer_name and customer_email are repeated',
                    solution: 'Extract to customers table',
                },
            ],
        },
    },
];
export const GENERATE_SEED_DATA_EXAMPLES = [
    {
        name: 'Generate test data',
        description: 'Create realistic seed data',
        input: {
            schema: {
                database: 'postgres',
                tables: [{ name: 'users', columns: [{ name: 'email', type: 'varchar' }] }],
            },
            recordsPerTable: 5,
        },
        output: {
            users: [
                { id: '550e8400-e29b-41d4-a716-446655440001', email: 'john@example.com' },
                { id: '550e8400-e29b-41d4-a716-446655440002', email: 'jane@example.com' },
            ],
            sql: "INSERT INTO users (id, email) VALUES ('550e8400...', 'john@example.com');",
        },
    },
];
export const VALIDATE_SCHEMA_EXAMPLES = [
    {
        name: 'Validate schema design',
        description: 'Check for best practice violations',
        input: {
            schema: { database: 'postgres', tables: [{ name: 'UserData', columns: [{ name: 'ID' }] }] },
        },
        output: {
            valid: false,
            issues: [
                { severity: 'warning', message: 'Table name should be snake_case', table: 'UserData' },
                { severity: 'warning', message: 'Column name should be lowercase', column: 'ID' },
                { severity: 'error', message: 'Missing primary key definition', table: 'UserData' },
            ],
        },
    },
];
export const ANALYZE_SCHEMA_EXAMPLES = [
    {
        name: 'Analyze schema complexity',
        description: 'Get schema metrics and characteristics',
        input: {
            schema: { database: 'postgres', tables: [{}, {}, {}] },
        },
        output: {
            metrics: {
                tableCount: 3,
                columnCount: 25,
                relationshipCount: 4,
                indexCount: 8,
                estimatedRows: 50000,
                normalForm: '3NF',
            },
            characteristics: ['Well-normalized', 'Good index coverage', 'Foreign keys properly defined'],
        },
    },
];
export const DB_SCHEMA_TOOLS = [
    {
        name: 'design_schema',
        description: `Design a database schema from plain text requirements. Supports PostgreSQL, MySQL, and MongoDB. Automatically extracts entities, relationships, and generates complete schema definitions.
Keywords: schema, database, design, tables, entities, relationships, postgres, mysql, mongodb.
Use when: starting new database, modeling data, converting requirements to schema.`,
        inputSchema: {
            type: 'object',
            properties: {
                requirements: {
                    type: 'string',
                    description: 'Plain text description of data requirements',
                },
                options: {
                    type: 'object',
                    properties: {
                        database: { type: 'string', enum: ['postgres', 'mysql', 'mongodb'] },
                        normalForm: { type: 'string', enum: ['1NF', '2NF', '3NF', 'BCNF'] },
                        includeTimestamps: { type: 'boolean' },
                        useUUIDs: { type: 'boolean' },
                    },
                    required: ['database'],
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['requirements', 'options'],
        },
        examples: DESIGN_SCHEMA_EXAMPLES,
    },
    {
        name: 'generate_migration',
        description: `Generate database migration files (up/down) from a schema definition. Supports SQL migrations for PostgreSQL/MySQL and mongosh commands for MongoDB.
Keywords: migration, sql, up, down, alter, create table.
Use when: applying schema changes, version control for database.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                description: { type: 'string', description: 'Migration description' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema', 'description'],
        },
        examples: GENERATE_MIGRATION_EXAMPLES,
    },
    {
        name: 'create_er_diagram',
        description: `Create an Entity-Relationship diagram from a schema. Supports Mermaid, PlantUML, and DBML formats. Perfect for documentation and visualization.
Keywords: er diagram, mermaid, visualization, documentation, plantuml, dbml.
Use when: documenting database, visualizing relationships, sharing with team.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                options: {
                    type: 'object',
                    properties: {
                        format: { type: 'string', enum: ['mermaid', 'plantuml', 'dbml'] },
                        includeColumns: { type: 'boolean' },
                        includeRelationships: { type: 'boolean' },
                    },
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: CREATE_ER_DIAGRAM_EXAMPLES,
    },
    {
        name: 'optimize_indexes',
        description: `Analyze schema and suggest index optimizations. Identifies missing indexes on foreign keys, frequently filtered columns, and opportunities for compound indexes.
Keywords: index, optimization, performance, btree, query.
Use when: improving query performance, database tuning.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: OPTIMIZE_INDEXES_EXAMPLES,
    },
    {
        name: 'normalize_schema',
        description: `Suggest schema normalizations to improve data integrity and reduce redundancy. Identifies violations of 1NF, 2NF, 3NF, and BCNF with specific recommendations.
Keywords: normalize, 1nf, 2nf, 3nf, bcnf, redundancy, integrity.
Use when: improving schema design, reducing data duplication.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: NORMALIZE_SCHEMA_EXAMPLES,
    },
    {
        name: 'generate_seed_data',
        description: `Generate realistic seed data for testing. Creates mock records that respect foreign key constraints and data types.
Keywords: seed, mock, test data, faker, sample.
Use when: testing, development, demos, CI/CD.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                recordsPerTable: {
                    type: 'number',
                    description: 'Number of records to generate per table',
                },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: GENERATE_SEED_DATA_EXAMPLES,
    },
    {
        name: 'validate_schema',
        description: `Validate schema for errors and best practice violations. Checks for missing primary keys, naming conventions, proper indexing, and more.
Keywords: validate, lint, best practices, naming, constraints.
Use when: reviewing schema design, pre-deployment checks.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: VALIDATE_SCHEMA_EXAMPLES,
    },
    {
        name: 'analyze_schema',
        description: `Analyze schema complexity and characteristics. Provides metrics on tables, columns, indexes, relationships, normal form, and estimated size.
Keywords: analyze, metrics, complexity, statistics.
Use when: understanding schema, documentation, capacity planning.`,
        inputSchema: {
            type: 'object',
            properties: {
                schema: { type: 'object', description: 'Complete database schema object' },
                response_format: RESPONSE_FORMAT_SCHEMA,
            },
            required: ['schema'],
        },
        examples: ANALYZE_SCHEMA_EXAMPLES,
    },
];
//# sourceMappingURL=tool-definitions.js.map