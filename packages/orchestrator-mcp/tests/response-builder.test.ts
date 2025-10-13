/**
 * Tests for response-builder helper functions
 * Ensures proper MCP response formatting
 */

import { describe, it, expect } from 'vitest';
import {
  buildClarificationResponse,
  buildInvalidFocusResponse,
  buildSuccessResponse,
} from '../src/helpers/response-builder.js';

describe('response-builder', () => {
  describe('buildClarificationResponse', () => {
    it('should build English clarification response by default', () => {
      const response = buildClarificationResponse();

      expect(response.content).toBeDefined();
      expect(response.content[0].type).toBe('text');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.message).toContain('focused analysis');
      expect(parsed.question).toContain('What would you like');
      expect(parsed.options).toHaveLength(4);
    });

    it('should build English clarification response explicitly', () => {
      const response = buildClarificationResponse('en');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.message).toContain('focused analysis');
      expect(parsed.question).toContain('What would you like');
    });

    it('should build Spanish clarification response', () => {
      const response = buildClarificationResponse('es');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.message).toContain('análisis enfocado');
      expect(parsed.question).toContain('En qué te gustaría');
    });

    it('should include 4 focus options', () => {
      const response = buildClarificationResponse('en');
      const parsed = JSON.parse(response.content[0].text);

      expect(parsed.options).toHaveLength(4);
      expect(parsed.options[0].value).toBe('security');
      expect(parsed.options[1].value).toBe('quality');
      expect(parsed.options[2].value).toBe('performance');
      expect(parsed.options[3].value).toBe('comprehensive');
    });

    it('should have proper MCP response structure', () => {
      const response = buildClarificationResponse();

      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0]).toHaveProperty('type');
      expect(response.content[0]).toHaveProperty('text');
    });

    it('should return valid JSON string', () => {
      const response = buildClarificationResponse();

      expect(() => {
        JSON.parse(response.content[0].text);
      }).not.toThrow();
    });

    it('should format JSON with indentation', () => {
      const response = buildClarificationResponse();

      // Should contain newlines (formatted JSON)
      expect(response.content[0].text).toContain('\n');
      expect(response.content[0].text).toContain('  '); // 2-space indent
    });

    it('should include all required option fields', () => {
      const response = buildClarificationResponse('en');
      const parsed = JSON.parse(response.content[0].text);

      parsed.options.forEach((option: any) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('description');
        expect(option.label).toBeTruthy();
        expect(option.description).toBeTruthy();
      });
    });
  });

  describe('buildInvalidFocusResponse', () => {
    it('should build English invalid focus response by default', () => {
      const response = buildInvalidFocusResponse('invalid');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.message).toContain('Invalid focus "invalid"');
      expect(parsed.question).toContain('What would you like');
    });

    it('should build Spanish invalid focus response', () => {
      const response = buildInvalidFocusResponse('invalido', 'es');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('needs_clarification');
      expect(parsed.message).toContain('Enfoque inválido "invalido"');
      expect(parsed.question).toContain('En qué te gustaría');
    });

    it('should include the invalid focus value in message', () => {
      const response = buildInvalidFocusResponse('wrong_value', 'en');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.message).toContain('wrong_value');
    });

    it('should include clarification options', () => {
      const response = buildInvalidFocusResponse('bad', 'en');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.options).toHaveLength(4);
    });

    it('should have proper MCP response structure', () => {
      const response = buildInvalidFocusResponse('test');

      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0].type).toBe('text');
    });

    it('should handle special characters in focus value', () => {
      const response = buildInvalidFocusResponse('test@#$%');

      expect(() => {
        JSON.parse(response.content[0].text);
      }).not.toThrow();
    });

    it('should handle empty focus value', () => {
      const response = buildInvalidFocusResponse('');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.message).toContain('Invalid focus ""');
    });

    it('should handle unicode characters in focus value', () => {
      const response = buildInvalidFocusResponse('日本語', 'en');

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.message).toContain('日本語');
    });
  });

  describe('buildSuccessResponse', () => {
    const mockResult = {
      success: true,
      totalDuration: 1500,
      steps: [
        {
          name: 'review',
          result: {
            success: true,
            data: { issues: [] },
            error: null,
          },
          duration: 500,
        },
        {
          name: 'security-scan',
          result: {
            success: true,
            data: { vulnerabilities: [] },
            error: null,
          },
          duration: 1000,
        },
      ],
      errors: [],
    };

    it('should build success response with workflow results', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.status).toBe('success');
      expect(parsed.workflow).toBe('pre-commit');
      expect(parsed.focus).toBe('security');
      expect(parsed.success).toBe(true);
    });

    it('should include duration from result', () => {
      const response = buildSuccessResponse('pre-commit', undefined, mockResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.duration).toBe(1500);
    });

    it('should map steps correctly', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.steps).toHaveLength(2);
      expect(parsed.steps[0].name).toBe('review');
      expect(parsed.steps[0].success).toBe(true);
      expect(parsed.steps[0].duration).toBe(500);
      expect(parsed.steps[0].data).toEqual({ issues: [] });
    });

    it('should use "N/A" when focus is undefined', () => {
      const response = buildSuccessResponse('pre-commit', undefined, mockResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.focus).toBe('N/A');
    });

    it('should include errors array', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.errors).toEqual([]);
    });

    it('should handle failed workflow', () => {
      const failedResult = {
        success: false,
        totalDuration: 500,
        steps: [
          {
            name: 'review',
            result: {
              success: false,
              data: null,
              error: 'Review failed',
            },
            duration: 500,
          },
        ],
        errors: ['Review failed'],
      };

      const response = buildSuccessResponse('pre-commit', 'quality', failedResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.success).toBe(false);
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.steps[0].success).toBe(false);
      expect(parsed.steps[0].error).toBe('Review failed');
    });

    it('should have proper MCP response structure', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      expect(response).toHaveProperty('content');
      expect(Array.isArray(response.content)).toBe(true);
      expect(response.content[0].type).toBe('text');
    });

    it('should return valid JSON string', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      expect(() => {
        JSON.parse(response.content[0].text);
      }).not.toThrow();
    });

    it('should format JSON with indentation', () => {
      const response = buildSuccessResponse('pre-commit', 'security', mockResult);

      expect(response.content[0].text).toContain('\n');
      expect(response.content[0].text).toContain('  ');
    });

    it('should handle empty steps array', () => {
      const emptyStepsResult = {
        success: true,
        totalDuration: 0,
        steps: [],
        errors: [],
      };

      const response = buildSuccessResponse('quality-audit', 'comprehensive', emptyStepsResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.steps).toEqual([]);
    });

    it('should handle steps with null data', () => {
      const nullDataResult = {
        success: true,
        totalDuration: 1000,
        steps: [
          {
            name: 'test',
            result: {
              success: true,
              data: null,
              error: null,
            },
            duration: 1000,
          },
        ],
        errors: [],
      };

      const response = buildSuccessResponse('pre-merge', 'quality', nullDataResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.steps[0].data).toBeNull();
    });

    it('should handle complex nested data structures', () => {
      const complexResult = {
        success: true,
        totalDuration: 2000,
        steps: [
          {
            name: 'architecture',
            result: {
              success: true,
              data: {
                modules: [
                  { name: 'module1', dependencies: ['dep1', 'dep2'] },
                  { name: 'module2', dependencies: [] },
                ],
                metrics: { complexity: 45, coupling: 0.3 },
              },
              error: null,
            },
            duration: 2000,
          },
        ],
        errors: [],
      };

      const response = buildSuccessResponse('quality-audit', 'performance', complexResult);

      const parsed = JSON.parse(response.content[0].text);
      expect(parsed.steps[0].data.modules).toHaveLength(2);
      expect(parsed.steps[0].data.metrics.complexity).toBe(45);
    });
  });

  describe('Response format consistency', () => {
    it('should use same content structure for all response types', () => {
      const clarification = buildClarificationResponse();
      const invalidFocus = buildInvalidFocusResponse('test');
      const success = buildSuccessResponse('pre-commit', 'security', {
        success: true,
        totalDuration: 1000,
        steps: [],
        errors: [],
      });

      [clarification, invalidFocus, success].forEach(response => {
        expect(response).toHaveProperty('content');
        expect(Array.isArray(response.content)).toBe(true);
        expect(response.content[0].type).toBe('text');
        expect(typeof response.content[0].text).toBe('string');
      });
    });

    it('should return parseable JSON for all response types', () => {
      const responses = [
        buildClarificationResponse(),
        buildInvalidFocusResponse('test'),
        buildSuccessResponse('pre-commit', 'security', {
          success: true,
          totalDuration: 1000,
          steps: [],
          errors: [],
        }),
      ];

      responses.forEach(response => {
        expect(() => {
          JSON.parse(response.content[0].text);
        }).not.toThrow();
      });
    });
  });
});
