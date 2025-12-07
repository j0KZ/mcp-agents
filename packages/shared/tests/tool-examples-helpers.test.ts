/**
 * Tests for tool-examples.ts helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  createToolExample,
  validateToolExamples,
  formatExamplesForMCP,
  EnhancedToolDefinition,
  ToolExample,
} from '../src/types/tool-examples.js';

describe('createToolExample', () => {
  it('should create a tool example with all fields', () => {
    const example = createToolExample(
      'Basic Example',
      'Demonstrates basic usage',
      { param1: 'value1' },
      { result: 'success' }
    );

    expect(example.name).toBe('Basic Example');
    expect(example.description).toBe('Demonstrates basic usage');
    expect(example.input).toEqual({ param1: 'value1' });
    expect(example.output).toEqual({ result: 'success' });
  });

  it('should handle complex input types', () => {
    const example = createToolExample(
      'Complex Input',
      'Example with nested objects',
      {
        nested: { key: 'value' },
        array: [1, 2, 3],
        boolean: true,
      },
      { processed: true }
    );

    expect(example.input.nested).toEqual({ key: 'value' });
    expect(example.input.array).toEqual([1, 2, 3]);
    expect(example.input.boolean).toBe(true);
  });

  it('should handle empty input', () => {
    const example = createToolExample('Empty Input', 'No required fields', {}, { result: 'ok' });

    expect(example.input).toEqual({});
  });
});

describe('validateToolExamples', () => {
  const validTool: EnhancedToolDefinition = {
    name: 'test_tool',
    description: 'A test tool for validation',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to file' },
      },
      required: ['filePath'],
    },
    examples: [
      {
        name: 'Basic Usage',
        description: 'Shows how to use the tool with basic parameters',
        input: { filePath: '/path/to/file.ts' },
        output: { success: true },
      },
    ],
  };

  it('should validate a tool with proper examples', () => {
    const result = validateToolExamples(validTool);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation when no examples exist', () => {
    const toolWithoutExamples: EnhancedToolDefinition = {
      ...validTool,
      examples: [],
    };

    const result = validateToolExamples(toolWithoutExamples);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('no examples');
  });

  it('should fail validation when examples is undefined', () => {
    const toolWithUndefinedExamples: EnhancedToolDefinition = {
      ...validTool,
      examples: undefined,
    };

    const result = validateToolExamples(toolWithUndefinedExamples);
    expect(result.valid).toBe(false);
  });

  it('should fail validation when example name is too short', () => {
    const toolWithBadName: EnhancedToolDefinition = {
      ...validTool,
      examples: [
        {
          name: 'AB',
          description: 'This is a long enough description',
          input: { filePath: '/path/to/file.ts' },
          output: { success: true },
        },
      ],
    };

    const result = validateToolExamples(toolWithBadName);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid name'))).toBe(true);
  });

  it('should fail validation when example description is too short', () => {
    const toolWithBadDesc: EnhancedToolDefinition = {
      ...validTool,
      examples: [
        {
          name: 'Valid Name',
          description: 'Short',
          input: { filePath: '/path/to/file.ts' },
          output: { success: true },
        },
      ],
    };

    const result = validateToolExamples(toolWithBadDesc);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('insufficient description'))).toBe(true);
  });

  it('should fail validation when required field is missing from input', () => {
    const toolWithMissingRequired: EnhancedToolDefinition = {
      ...validTool,
      examples: [
        {
          name: 'Missing Required',
          description: 'This example is missing the required filePath',
          input: {},
          output: { success: true },
        },
      ],
    };

    const result = validateToolExamples(toolWithMissingRequired);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing required field'))).toBe(true);
  });

  it('should fail validation when output is empty', () => {
    const toolWithEmptyOutput: EnhancedToolDefinition = {
      ...validTool,
      examples: [
        {
          name: 'Empty Output',
          description: 'This example has no output defined properly',
          input: { filePath: '/path/to/file.ts' },
          output: {},
        },
      ],
    };

    const result = validateToolExamples(toolWithEmptyOutput);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('empty output'))).toBe(true);
  });

  it('should pass validation for tool without required fields', () => {
    const toolWithoutRequired: EnhancedToolDefinition = {
      name: 'optional_tool',
      description: 'A tool with no required fields',
      inputSchema: {
        type: 'object',
        properties: {
          optional: { type: 'string', description: 'Optional param' },
        },
      },
      examples: [
        {
          name: 'No Input',
          description: 'Example without any input parameters',
          input: {},
          output: { result: 'default' },
        },
      ],
    };

    const result = validateToolExamples(toolWithoutRequired);
    expect(result.valid).toBe(true);
  });
});

describe('formatExamplesForMCP', () => {
  it('should format examples for MCP SDK', () => {
    const examples: ToolExample[] = [
      {
        name: 'Example 1',
        description: 'First example',
        input: { param: 'value' },
        output: { result: 'success' },
      },
    ];

    const formatted = formatExamplesForMCP(examples);

    expect(formatted).toHaveLength(1);
    expect(formatted[0].name).toBe('Example 1');
    expect(formatted[0].description).toBe('First example');
    expect(formatted[0].value.input).toEqual({ param: 'value' });
    expect(formatted[0].value.output).toEqual({ result: 'success' });
  });

  it('should format multiple examples', () => {
    const examples: ToolExample[] = [
      {
        name: 'Example 1',
        description: 'First',
        input: { a: 1 },
        output: { x: 1 },
      },
      {
        name: 'Example 2',
        description: 'Second',
        input: { b: 2 },
        output: { y: 2 },
      },
    ];

    const formatted = formatExamplesForMCP(examples);

    expect(formatted).toHaveLength(2);
    expect(formatted[0].name).toBe('Example 1');
    expect(formatted[1].name).toBe('Example 2');
  });

  it('should handle empty examples array', () => {
    const formatted = formatExamplesForMCP([]);
    expect(formatted).toEqual([]);
  });

  it('should preserve complex nested structures', () => {
    const examples: ToolExample[] = [
      {
        name: 'Complex',
        description: 'Complex nested structure',
        input: {
          nested: { deep: { value: 123 } },
          array: [{ id: 1 }, { id: 2 }],
        },
        output: {
          results: [{ status: 'ok', data: { processed: true } }],
        },
      },
    ];

    const formatted = formatExamplesForMCP(examples);

    expect(formatted[0].value.input.nested).toEqual({ deep: { value: 123 } });
    expect(formatted[0].value.output.results).toHaveLength(1);
  });
});
