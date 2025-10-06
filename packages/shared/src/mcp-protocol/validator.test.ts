/**
 * Tests for MCP Protocol Validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MCPProtocolValidator,
  type MCPToolDefinition,
  type MCPProtocolRequest,
  type MCPProtocolResponse,
} from './validator.js';

describe('MCPProtocolValidator', () => {
  let validator: MCPProtocolValidator;

  beforeEach(() => {
    validator = new MCPProtocolValidator();
  });

  describe('Tool Schema Validation', () => {
    it('should validate a correct tool schema', () => {
      const tool: MCPToolDefinition = {
        name: 'test_tool',
        description: 'This is a test tool for validation',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Input parameter' },
          },
          required: ['input'],
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid tool name format', () => {
      const tool = {
        name: 'Test-Tool', // Invalid: contains uppercase and hyphen
        description: 'A test tool',
        inputSchema: { type: 'object', properties: {} },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name: Invalid');
    });

    it('should warn about short descriptions', () => {
      const tool: MCPToolDefinition = {
        name: 'test_tool',
        description: 'Short desc',
        inputSchema: { type: 'object', properties: {} },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        'Tool description should be more detailed (20+ characters)'
      );
    });

    it('should warn about missing parameter descriptions', () => {
      const tool: MCPToolDefinition = {
        name: 'test_tool',
        description: 'A tool for testing parameter validation',
        inputSchema: {
          type: 'object',
          properties: {
            param1: { type: 'string' }, // Missing description
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain("Parameter 'param1' lacks a description");
    });

    it('should warn about non-camelCase parameter names', () => {
      const tool: MCPToolDefinition = {
        name: 'test_tool',
        description: 'A tool for testing naming conventions',
        inputSchema: {
          type: 'object',
          properties: {
            'my-param': { type: 'string', description: 'A parameter' },
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain("Parameter 'my-param' should use camelCase naming");
    });
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      // Register a test tool
      const tool: MCPToolDefinition = {
        name: 'test_tool',
        description: 'A test tool for request validation',
        inputSchema: {
          type: 'object',
          properties: {
            requiredField: { type: 'string', description: 'Required field' },
            optionalField: { type: 'number', description: 'Optional field' },
          },
          required: ['requiredField'],
        },
      };
      validator.registerTool(tool);
    });

    it('should validate a correct request', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: {
            requiredField: 'test value',
            optionalField: 42,
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(true);
    });

    it('should reject request for unknown tool', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'unknown_tool',
          arguments: {},
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unknown tool: unknown_tool');
    });

    it('should reject request missing required fields', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: {
            optionalField: 42, // Missing requiredField
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required field 'requiredField' is missing");
    });

    it('should reject request with wrong argument types', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: {
            requiredField: 123, // Should be string
            optionalField: 'not a number', // Should be number
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'requiredField' must be a string, got number");
    });

    it('should handle requests with no arguments gracefully', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          // No arguments provided
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Required field 'requiredField' is missing");
    });
  });

  describe('Response Validation', () => {
    it('should validate a successful response', () => {
      const response: MCPProtocolResponse = {
        jsonrpc: '2.0',
        result: { success: true, data: 'test' },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(true);
    });

    it('should validate an error response', () => {
      const response: MCPProtocolResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(true);
    });

    it('should reject response with both result and error', () => {
      const response = {
        jsonrpc: '2.0',
        result: 'some result',
        error: { code: -1, message: 'error' },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response cannot have both result and error');
    });

    it('should reject response with neither result nor error', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response must have either result or error');
    });

    it('should validate response ID matches request', () => {
      const response: MCPProtocolResponse = {
        jsonrpc: '2.0',
        result: 'test',
        id: 2,
      };

      const result = validator.validateResponse(response, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Response ID 2 does not match request ID 1');
    });
  });

  describe('Type Validation', () => {
    beforeEach(() => {
      // Register a tool with various types
      const tool: MCPToolDefinition = {
        name: 'type_test',
        description: 'Tool for testing type validation',
        inputSchema: {
          type: 'object',
          properties: {
            stringField: {
              type: 'string',
              minLength: 3,
              maxLength: 10,
              pattern: '^[a-z]+$',
            },
            numberField: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            integerField: {
              type: 'integer',
            },
            booleanField: {
              type: 'boolean',
            },
            arrayField: {
              type: 'array',
              minItems: 1,
              maxItems: 5,
            },
            objectField: {
              type: 'object',
            },
          },
          additionalProperties: false,
        },
      };
      validator.registerTool(tool);
    });

    it('should validate string constraints', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            stringField: 'ab', // Too short
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'stringField' must be at least 3 characters");
    });

    it('should validate pattern constraints', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            stringField: 'ABC123', // Doesn't match pattern
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'stringField' does not match pattern ^[a-z]+$");
    });

    it('should validate number constraints', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            numberField: 150, // Exceeds maximum
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'numberField' must be at most 100");
    });

    it('should validate integer type', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            integerField: 3.14, // Not an integer
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'integerField' must be an integer");
    });

    it('should validate array constraints', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            arrayField: [], // Too few items
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Field 'arrayField' must have at least 1 items");
    });

    it('should reject unknown fields when additionalProperties is false', () => {
      const request: MCPProtocolRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'type_test',
          arguments: {
            unknownField: 'value',
          },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unknown field 'unknownField' not allowed");
    });
  });

  describe('Tool Registration', () => {
    it('should register valid tools', () => {
      const tool: MCPToolDefinition = {
        name: 'valid_tool',
        description: 'A valid tool for registration testing',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      const result = validator.registerTool(tool);
      expect(result.valid).toBe(true);

      const tools = validator.getRegisteredTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('valid_tool');
    });

    it('should not register invalid tools', () => {
      const tool = {
        name: 'Invalid-Tool',
        description: 'Invalid tool',
        inputSchema: { type: 'object' },
      };

      const result = validator.registerTool(tool as any);
      expect(result.valid).toBe(false);

      const tools = validator.getRegisteredTools();
      expect(tools).toHaveLength(0);
    });

    it('should clear all registered tools', () => {
      const tool: MCPToolDefinition = {
        name: 'tool1',
        description: 'First tool for clearing test',
        inputSchema: { type: 'object', properties: {} },
      };

      validator.registerTool(tool);
      expect(validator.getRegisteredTools()).toHaveLength(1);

      validator.clearTools();
      expect(validator.getRegisteredTools()).toHaveLength(0);
    });
  });
});
