/**
 * MCP Protocol Validation Layer
 * Ensures all MCP tools comply with protocol specifications
 */

import { z } from 'zod';

/**
 * MCP Tool Schema definition based on Model Context Protocol spec
 */
export const MCPToolSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/),
  description: z.string().min(1),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(z.string(), z.any()),
    required: z.array(z.string()).optional(),
    additionalProperties: z.boolean().optional(),
  }),
});

/**
 * MCP Request Schema
 */
export const MCPRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.object({
    name: z.string(),
    arguments: z.record(z.string(), z.any()).optional(),
  }),
  id: z.union([z.string(), z.number()]),
});

/**
 * MCP Response Schema
 */
export const MCPResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  result: z.any().optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      data: z.any().optional(),
    })
    .optional(),
  id: z.union([z.string(), z.number()]),
});

export interface MCPValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

export interface MCPProtocolRequest {
  jsonrpc: '2.0';
  method: string;
  params: {
    name: string;
    arguments?: Record<string, any>;
  };
  id: string | number;
}

export interface MCPProtocolResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

/**
 * MCP Protocol Validator
 * Validates tools, requests, and responses against MCP specification
 */
export class MCPProtocolValidator {
  private knownTools = new Map<string, MCPToolDefinition>();

  /**
   * Register a tool for validation
   */
  registerTool(tool: MCPToolDefinition): MCPValidationResult {
    const result = this.validateToolSchema(tool);
    if (result.valid) {
      this.knownTools.set(tool.name, tool);
    }
    return result;
  }

  /**
   * Validate a tool definition against MCP schema
   */
  validateToolSchema(tool: unknown): MCPValidationResult {
    try {
      const parsed = MCPToolSchema.parse(tool);

      const warnings: string[] = [];

      // Check for best practices
      if (parsed.description.length < 20) {
        warnings.push('Tool description should be more detailed (20+ characters)');
      }

      if (
        !parsed.inputSchema.properties ||
        Object.keys(parsed.inputSchema.properties).length === 0
      ) {
        warnings.push('Tool has no input parameters defined');
      }

      // Validate parameter naming conventions
      for (const [paramName, paramSchema] of Object.entries(parsed.inputSchema.properties || {})) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(paramName)) {
          warnings.push(`Parameter '${paramName}' should use camelCase naming`);
        }

        // Check for parameter descriptions
        if (typeof paramSchema === 'object' && paramSchema !== null && !('description' in paramSchema)) {
          warnings.push(`Parameter '${paramName}' lacks a description`);
        }
      }

      return {
        valid: true,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: [`Unknown validation error: ${error}`],
      };
    }
  }

  /**
   * Validate an MCP request
   */
  validateRequest(request: unknown): MCPValidationResult {
    try {
      const parsed = MCPRequestSchema.parse(request);

      // Check if tool exists
      if (parsed.method === 'tools/call') {
        if (!this.knownTools.has(parsed.params.name)) {
          return {
            valid: false,
            errors: [`Unknown tool: ${parsed.params.name}`],
          };
        }

        // Validate arguments against tool schema
        const tool = this.knownTools.get(parsed.params.name)!;
        const result = this.validateArguments(parsed.params.arguments || {}, tool.inputSchema);

        if (!result.valid) {
          return result;
        }
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: [`Unknown validation error: ${error}`],
      };
    }
  }

  /**
   * Validate arguments against a tool's input schema
   */
  private validateArguments(
    args: Record<string, any>,
    schema: MCPToolDefinition['inputSchema']
  ): MCPValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in args)) {
          errors.push(`Required field '${field}' is missing`);
        }
      }
    }

    // Check for unknown fields
    if (schema.additionalProperties === false) {
      for (const field of Object.keys(args)) {
        if (!schema.properties[field]) {
          errors.push(`Unknown field '${field}' not allowed`);
        }
      }
    }

    // Type validation for each field
    for (const [field, value] of Object.entries(args)) {
      const fieldSchema = schema.properties[field];
      if (fieldSchema) {
        const typeError = this.validateType(value, fieldSchema, field);
        if (typeError) {
          errors.push(typeError);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validate a value against a type schema
   */
  private validateType(value: any, schema: any, fieldName: string): string | null {
    if (!schema.type) return null;

    const actualType = Array.isArray(value) ? 'array' : typeof value;

    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          return `Field '${fieldName}' must be a string, got ${actualType}`;
        }
        if (schema.minLength && value.length < schema.minLength) {
          return `Field '${fieldName}' must be at least ${schema.minLength} characters`;
        }
        if (schema.maxLength && value.length > schema.maxLength) {
          return `Field '${fieldName}' must be at most ${schema.maxLength} characters`;
        }
        if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
          return `Field '${fieldName}' does not match pattern ${schema.pattern}`;
        }
        break;

      case 'number':
      case 'integer':
        if (typeof value !== 'number') {
          return `Field '${fieldName}' must be a number, got ${actualType}`;
        }
        if (schema.type === 'integer' && !Number.isInteger(value)) {
          return `Field '${fieldName}' must be an integer`;
        }
        if (schema.minimum !== undefined && value < schema.minimum) {
          return `Field '${fieldName}' must be at least ${schema.minimum}`;
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
          return `Field '${fieldName}' must be at most ${schema.maximum}`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return `Field '${fieldName}' must be a boolean, got ${actualType}`;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return `Field '${fieldName}' must be an array, got ${actualType}`;
        }
        if (schema.minItems && value.length < schema.minItems) {
          return `Field '${fieldName}' must have at least ${schema.minItems} items`;
        }
        if (schema.maxItems && value.length > schema.maxItems) {
          return `Field '${fieldName}' must have at most ${schema.maxItems} items`;
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return `Field '${fieldName}' must be an object, got ${actualType}`;
        }
        break;
    }

    return null;
  }

  /**
   * Validate an MCP response
   */
  validateResponse(response: unknown, requestId?: string | number): MCPValidationResult {
    try {
      const parsed = MCPResponseSchema.parse(response);

      // Check that either result or error is present, not both
      if (parsed.result !== undefined && parsed.error !== undefined) {
        return {
          valid: false,
          errors: ['Response cannot have both result and error'],
        };
      }

      if (parsed.result === undefined && parsed.error === undefined) {
        return {
          valid: false,
          errors: ['Response must have either result or error'],
        };
      }

      // Validate ID matches request
      if (requestId !== undefined && parsed.id !== requestId) {
        return {
          valid: false,
          errors: [`Response ID ${parsed.id} does not match request ID ${requestId}`],
        };
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`),
        };
      }
      return {
        valid: false,
        errors: [`Unknown validation error: ${error}`],
      };
    }
  }

  /**
   * Get all registered tools
   */
  getRegisteredTools(): MCPToolDefinition[] {
    return Array.from(this.knownTools.values());
  }

  /**
   * Clear all registered tools
   */
  clearTools(): void {
    this.knownTools.clear();
  }
}
