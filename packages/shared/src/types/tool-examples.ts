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
export function createToolExample<TInput, TOutput>(
  name: string,
  description: string,
  input: TInput,
  output: TOutput
): ToolExample {
  return {
    name,
    description,
    input: input as Record<string, unknown>,
    output: output as Record<string, unknown>,
  };
}

/**
 * Validate that a tool definition has proper examples
 */
export function validateToolExamples(tool: EnhancedToolDefinition): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!tool.examples || tool.examples.length === 0) {
    errors.push(`Tool "${tool.name}" has no examples`);
    return { valid: false, errors };
  }

  // Recommendation: 2+ examples, but 1 is acceptable minimum
  if (tool.examples.length < 1) {
    errors.push(`Tool "${tool.name}" should have at least 1 example`);
  }

  for (const example of tool.examples) {
    if (!example.name || example.name.length < 3) {
      errors.push(`Example in "${tool.name}" has invalid name`);
    }
    if (!example.description || example.description.length < 10) {
      errors.push(`Example "${example.name}" in "${tool.name}" has insufficient description`);
    }
    // Allow empty input only if no required fields
    const hasRequiredFields = tool.inputSchema.required && tool.inputSchema.required.length > 0;
    if (hasRequiredFields && (!example.input || Object.keys(example.input).length === 0)) {
      errors.push(
        `Example "${example.name}" in "${tool.name}" has empty input but tool requires fields`
      );
    }
    if (!example.output || Object.keys(example.output).length === 0) {
      errors.push(`Example "${example.name}" in "${tool.name}" has empty output`);
    }

    // Validate required fields are in example input
    if (tool.inputSchema.required) {
      for (const required of tool.inputSchema.required) {
        if (!(required in example.input)) {
          errors.push(
            `Example "${example.name}" in "${tool.name}" missing required field: ${required}`
          );
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Format examples for MCP tool definition
 * Converts examples to the format expected by MCP SDK
 */
export function formatExamplesForMCP(examples: ToolExample[]): Array<{
  name: string;
  description: string;
  value: { input: Record<string, unknown>; output: Record<string, unknown> };
}> {
  return examples.map(ex => ({
    name: ex.name,
    description: ex.description,
    value: {
      input: ex.input,
      output: ex.output,
    },
  }));
}
