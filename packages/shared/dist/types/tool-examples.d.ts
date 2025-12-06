/**
 * Tool Use Examples - Anthropic Advanced Tool Use (Nov 2025)
 *
 * Types for implementing Tool Use Examples following Anthropic's best practices.
 * Examples improve parameter accuracy from 72% to 90%.
 *
 * @see https://www.anthropic.com/engineering/advanced-tool-use
 */
/**
 * A single example of tool usage with input and expected output
 */
export interface ToolExample {
    /** Short name for the example (e.g., 'Basic review', 'Strict mode') */
    name: string;
    /** Description of what this example demonstrates */
    description: string;
    /** Example input parameters - should use realistic values, not placeholders */
    input: Record<string, unknown>;
    /** Expected output structure - helps Claude understand return format */
    output: Record<string, unknown>;
}
/**
 * Enhanced tool definition with examples support
 */
export interface EnhancedToolDefinition {
    /** Tool name (snake_case, e.g., 'review_file') */
    name: string;
    /** Clear description with keywords for searchability */
    description: string;
    /** JSON Schema for input parameters */
    inputSchema: ToolInputSchema;
    /** Array of usage examples (recommended: 2-5 per tool) */
    examples?: ToolExample[];
}
/**
 * JSON Schema compatible input schema
 */
export interface ToolInputSchema {
    type: 'object';
    properties: Record<string, ToolPropertySchema>;
    required?: string[];
}
/**
 * Individual property schema
 */
export interface ToolPropertySchema {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    enum?: string[];
    default?: unknown;
    items?: ToolPropertySchema;
    properties?: Record<string, ToolPropertySchema>;
}
/**
 * Tool registry entry with metadata for deferred loading
 */
export interface ToolRegistryEntry {
    /** Tool name */
    name: string;
    /** MCP server that provides this tool */
    server: string;
    /** Usage frequency for deferred loading decisions */
    frequency: 'high' | 'medium' | 'low';
    /** Category for grouping */
    category: 'analysis' | 'generation' | 'refactoring' | 'design' | 'security' | 'orchestration';
    /** Keywords for semantic search */
    keywords: string[];
    /** Brief description */
    description: string;
}
/**
 * Helper to create a tool example with type safety
 */
export declare function createToolExample<TInput, TOutput>(name: string, description: string, input: TInput, output: TOutput): ToolExample;
/**
 * Validate that a tool definition has proper examples
 */
export declare function validateToolExamples(tool: EnhancedToolDefinition): {
    valid: boolean;
    errors: string[];
};
/**
 * Format examples for MCP tool definition
 * Converts examples to the format expected by MCP SDK
 */
export declare function formatExamplesForMCP(examples: ToolExample[]): Array<{
    name: string;
    description: string;
    value: {
        input: Record<string, unknown>;
        output: Record<string, unknown>;
    };
}>;
//# sourceMappingURL=tool-examples.d.ts.map