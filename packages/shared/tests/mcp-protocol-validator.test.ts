/**
 * Tests for MCP Protocol Validator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MCPProtocolValidator,
  MCPToolSchema,
  MCPRequestSchema,
  MCPResponseSchema,
} from '../src/mcp-protocol/validator.js';

describe('MCP Protocol Validator', () => {
  let validator: MCPProtocolValidator;

  beforeEach(() => {
    validator = new MCPProtocolValidator();
  });

  describe('MCPToolSchema', () => {
    it('should validate a valid tool definition', () => {
      const validTool = {
        name: 'test_tool',
        description: 'A test tool for validation',
        inputSchema: {
          type: 'object' as const,
          properties: {
            filePath: { type: 'string', description: 'Path to file' },
          },
        },
      };

      expect(() => MCPToolSchema.parse(validTool)).not.toThrow();
    });

    it('should reject tool with invalid name', () => {
      const invalidTool = {
        name: 'TestTool', // Must start with lowercase and only use a-z, 0-9, _
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      expect(() => MCPToolSchema.parse(invalidTool)).toThrow();
    });

    it('should reject tool with empty name', () => {
      const invalidTool = {
        name: '',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      expect(() => MCPToolSchema.parse(invalidTool)).toThrow();
    });
  });

  describe('MCPRequestSchema', () => {
    it('should validate a valid request', () => {
      const validRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: { filePath: '/path/to/file' },
        },
        id: 1,
      };

      expect(() => MCPRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should accept request with string id', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'test_tool' },
        id: 'abc-123',
      };

      expect(() => MCPRequestSchema.parse(request)).not.toThrow();
    });

    it('should reject request without required fields', () => {
      const invalidRequest = {
        jsonrpc: '2.0',
        method: 'tools/call',
      };

      expect(() => MCPRequestSchema.parse(invalidRequest)).toThrow();
    });
  });

  describe('MCPResponseSchema', () => {
    it('should validate a valid success response', () => {
      const validResponse = {
        jsonrpc: '2.0',
        result: { data: 'test' },
        id: 1,
      };

      expect(() => MCPResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should validate a valid error response', () => {
      const validResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid request',
        },
        id: 1,
      };

      expect(() => MCPResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should accept response with error data', () => {
      const response = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid request',
          data: { details: 'More info' },
        },
        id: 1,
      };

      expect(() => MCPResponseSchema.parse(response)).not.toThrow();
    });
  });

  describe('registerTool', () => {
    it('should register a valid tool', () => {
      const tool = {
        name: 'test_tool',
        description: 'A comprehensive test tool for validation purposes',
        inputSchema: {
          type: 'object' as const,
          properties: {
            filePath: { type: 'string', description: 'Path to file' },
          },
        },
      };

      const result = validator.registerTool(tool);
      expect(result.valid).toBe(true);
      expect(validator.getRegisteredTools()).toContainEqual(tool);
    });

    it('should not register an invalid tool', () => {
      const invalidTool = {
        name: 'InvalidTool',
        description: 'Test',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
      };

      const result = validator.registerTool(invalidTool);
      expect(result.valid).toBe(false);
      expect(validator.getRegisteredTools()).toHaveLength(0);
    });
  });

  describe('validateToolSchema', () => {
    it('should return valid for correct tool definition', () => {
      const tool = {
        name: 'test_tool',
        description: 'A comprehensive test tool for validation purposes',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Path to file' },
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
    });

    it('should warn for short description', () => {
      const tool = {
        name: 'test_tool',
        description: 'Short desc',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Path' },
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain(
        'Tool description should be more detailed (20+ characters)'
      );
    });

    it('should warn for empty properties', () => {
      const tool = {
        name: 'test_tool',
        description: 'A comprehensive test tool for validation',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Tool has no input parameters defined');
    });

    it('should warn for non-camelCase parameter names', () => {
      const tool = {
        name: 'test_tool',
        description: 'A comprehensive test tool for validation',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: { type: 'string', description: 'Path' },
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("'file_path' should use camelCase")
      );
    });

    it('should warn for parameters without description', () => {
      const tool = {
        name: 'test_tool',
        description: 'A comprehensive test tool for validation',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string' }, // Missing description
          },
        },
      };

      const result = validator.validateToolSchema(tool);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.stringContaining("'filePath' lacks a description")
      );
    });

    it('should return errors for completely invalid input', () => {
      const result = validator.validateToolSchema(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle unknown errors gracefully', () => {
      // Test by passing something that will cause a non-Zod error
      const result = validator.validateToolSchema(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateRequest', () => {
    beforeEach(() => {
      // Register a tool for request validation
      validator.registerTool({
        name: 'test_tool',
        description: 'A comprehensive test tool for validation',
        inputSchema: {
          type: 'object' as const,
          properties: {
            filePath: { type: 'string', description: 'Path' },
            count: { type: 'number', description: 'Count' },
          },
          required: ['filePath'],
          additionalProperties: false,
        },
      });
    });

    it('should validate a valid tools/call request', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: { filePath: '/path/to/file' },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(true);
    });

    it('should reject request for unknown tool', () => {
      const request = {
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
      expect(result.errors).toContainEqual(expect.stringContaining('Unknown tool'));
    });

    it('should validate request for non tools/call method', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'other/method',
        params: {
          name: 'anything',
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(true);
    });

    it('should reject request missing required arguments', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: { count: 5 }, // Missing required filePath
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('filePath'));
    });

    it('should reject request with unknown fields when additionalProperties is false', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
          arguments: { filePath: '/path', unknownField: 'value' },
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('unknownField'));
    });

    it('should handle request without arguments', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'test_tool',
        },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false); // Should fail because filePath is required
    });

    it('should return errors for invalid request structure', () => {
      const result = validator.validateRequest({ invalid: 'request' });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle non-Zod errors', () => {
      const result = validator.validateRequest(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateArguments (via validateRequest)', () => {
    beforeEach(() => {
      validator.registerTool({
        name: 'typed_tool',
        description: 'A tool with all types for validation testing',
        inputSchema: {
          type: 'object' as const,
          properties: {
            stringField: {
              type: 'string',
              minLength: 2,
              maxLength: 10,
              pattern: '^[a-z]+$',
              description: 'String',
            },
            numberField: { type: 'number', minimum: 0, maximum: 100, description: 'Number' },
            integerField: { type: 'integer', description: 'Integer' },
            booleanField: { type: 'boolean', description: 'Boolean' },
            arrayField: { type: 'array', minItems: 1, maxItems: 5, description: 'Array' },
            objectField: { type: 'object', description: 'Object' },
          },
        },
      });
    });

    it('should validate string type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { stringField: 123 } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be a string'));
    });

    it('should validate string minLength', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { stringField: 'a' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at least 2 characters'));
    });

    it('should validate string maxLength', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { stringField: 'abcdefghijklmnop' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at most 10 characters'));
    });

    it('should validate string pattern', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { stringField: 'ABC123' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('does not match pattern'));
    });

    it('should validate number type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { numberField: 'not a number' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be a number'));
    });

    it('should validate number minimum', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { numberField: -5 } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at least 0'));
    });

    it('should validate number maximum', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { numberField: 150 } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at most 100'));
    });

    it('should validate integer type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { integerField: 5.5 } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be an integer'));
    });

    it('should validate boolean type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { booleanField: 'true' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be a boolean'));
    });

    it('should validate array type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { arrayField: 'not an array' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be an array'));
    });

    it('should validate array minItems', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { arrayField: [] } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at least 1 items'));
    });

    it('should validate array maxItems', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { arrayField: [1, 2, 3, 4, 5, 6, 7] } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('at most 5 items'));
    });

    it('should validate object type', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { objectField: 'not an object' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be an object'));
    });

    it('should reject null as object', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { objectField: null } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be an object'));
    });

    it('should reject array as object', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'typed_tool', arguments: { objectField: [1, 2, 3] } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('must be an object'));
    });

    it('should pass validation for field without type', () => {
      validator.registerTool({
        name: 'no_type_tool',
        description: 'A tool with untyped field for testing',
        inputSchema: {
          type: 'object' as const,
          properties: {
            untypedField: { description: 'No type specified' },
          },
        },
      });

      const request = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'no_type_tool', arguments: { untypedField: 'anything' } },
        id: 1,
      };

      const result = validator.validateRequest(request);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateResponse', () => {
    it('should validate a valid success response', () => {
      const response = {
        jsonrpc: '2.0',
        result: { data: 'test' },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(true);
    });

    it('should validate a valid error response', () => {
      const response = {
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid request' },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(true);
    });

    it('should reject response with both result and error', () => {
      const response = {
        jsonrpc: '2.0',
        result: { data: 'test' },
        error: { code: -32600, message: 'Invalid request' },
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('both result and error'));
    });

    it('should reject response with neither result nor error', () => {
      const response = {
        jsonrpc: '2.0',
        id: 1,
      };

      const result = validator.validateResponse(response);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('either result or error'));
    });

    it('should validate response ID matches request', () => {
      const response = {
        jsonrpc: '2.0',
        result: { data: 'test' },
        id: 2,
      };

      const result = validator.validateResponse(response, 1);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.stringContaining('does not match'));
    });

    it('should pass when response ID matches request ID', () => {
      const response = {
        jsonrpc: '2.0',
        result: { data: 'test' },
        id: 'abc-123',
      };

      const result = validator.validateResponse(response, 'abc-123');
      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid response structure', () => {
      const result = validator.validateResponse({ invalid: 'response' });
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle non-Zod errors', () => {
      const result = validator.validateResponse(null);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('getRegisteredTools', () => {
    it('should return empty array initially', () => {
      const tools = validator.getRegisteredTools();
      expect(tools).toEqual([]);
    });

    it('should return all registered tools', () => {
      const tool1 = {
        name: 'tool_one',
        description: 'First comprehensive test tool for validation',
        inputSchema: { type: 'object' as const, properties: {} },
      };
      const tool2 = {
        name: 'tool_two',
        description: 'Second comprehensive test tool for validation',
        inputSchema: { type: 'object' as const, properties: {} },
      };

      validator.registerTool(tool1);
      validator.registerTool(tool2);

      const tools = validator.getRegisteredTools();
      expect(tools).toHaveLength(2);
      expect(tools).toContainEqual(tool1);
      expect(tools).toContainEqual(tool2);
    });
  });

  describe('clearTools', () => {
    it('should clear all registered tools', () => {
      validator.registerTool({
        name: 'test_tool',
        description: 'A comprehensive test tool for validation',
        inputSchema: { type: 'object' as const, properties: {} },
      });

      expect(validator.getRegisteredTools()).toHaveLength(1);

      validator.clearTools();

      expect(validator.getRegisteredTools()).toHaveLength(0);
    });
  });
});
