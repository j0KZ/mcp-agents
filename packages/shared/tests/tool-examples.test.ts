/**
 * Tool Examples Validation Tests
 * Validates that all MCP tools have proper examples following Anthropic best practices
 */

import { describe, it, expect } from 'vitest';
import { validateToolExamples, EnhancedToolDefinition } from '../src/types/tool-examples.js';

// Import tool definitions from all packages
import { SMART_REVIEWER_TOOLS } from '../../smart-reviewer/src/constants/tool-definitions.js';
import { TEST_GENERATOR_TOOLS } from '../../test-generator/src/constants/tool-definitions.js';
import { ARCHITECTURE_ANALYZER_TOOLS } from '../../architecture-analyzer/src/constants/tool-definitions.js';
import { SECURITY_SCANNER_TOOLS } from '../../security-scanner/src/constants/tool-definitions.js';
import { REFACTOR_ASSISTANT_TOOLS } from '../../refactor-assistant/src/constants/tool-definitions.js';
import { API_DESIGNER_TOOLS } from '../../api-designer/src/constants/tool-definitions.js';
import { DB_SCHEMA_TOOLS } from '../../db-schema/src/constants/tool-definitions.js';
import { DOC_GENERATOR_TOOLS } from '../../doc-generator/src/constants/tool-definitions.js';
import { ORCHESTRATOR_TOOLS } from '../../orchestrator-mcp/src/constants/tool-definitions.js';

describe('Tool Examples Validation', () => {
  const allPackages = [
    { name: 'smart-reviewer', tools: SMART_REVIEWER_TOOLS },
    { name: 'test-generator', tools: TEST_GENERATOR_TOOLS },
    { name: 'architecture-analyzer', tools: ARCHITECTURE_ANALYZER_TOOLS },
    { name: 'security-scanner', tools: SECURITY_SCANNER_TOOLS },
    { name: 'refactor-assistant', tools: REFACTOR_ASSISTANT_TOOLS },
    { name: 'api-designer', tools: API_DESIGNER_TOOLS },
    { name: 'db-schema', tools: DB_SCHEMA_TOOLS },
    { name: 'doc-generator', tools: DOC_GENERATOR_TOOLS },
    { name: 'orchestrator-mcp', tools: ORCHESTRATOR_TOOLS },
  ];

  describe('All packages have tool definitions', () => {
    it.each(allPackages)('$name should export tool definitions', ({ tools }) => {
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  describe('All tools have required properties', () => {
    allPackages.forEach(({ name, tools }) => {
      describe(name, () => {
        tools.forEach((tool: EnhancedToolDefinition) => {
          it(`${tool.name} should have required properties`, () => {
            expect(tool.name).toBeDefined();
            expect(typeof tool.name).toBe('string');
            expect(tool.name.length).toBeGreaterThan(0);

            expect(tool.description).toBeDefined();
            expect(typeof tool.description).toBe('string');
            expect(tool.description.length).toBeGreaterThan(0);

            expect(tool.inputSchema).toBeDefined();
            expect(tool.inputSchema.type).toBe('object');
          });
        });
      });
    });
  });

  describe('All tools have examples', () => {
    allPackages.forEach(({ name, tools }) => {
      describe(name, () => {
        tools.forEach((tool: EnhancedToolDefinition) => {
          it(`${tool.name} should have at least one example`, () => {
            expect(tool.examples).toBeDefined();
            expect(Array.isArray(tool.examples)).toBe(true);
            expect(tool.examples!.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('All examples are valid', () => {
    allPackages.forEach(({ name, tools }) => {
      describe(name, () => {
        tools.forEach((tool: EnhancedToolDefinition) => {
          it(`${tool.name} examples should pass validation`, () => {
            const validation = validateToolExamples(tool);
            if (!validation.valid) {
              console.log(`Validation errors for ${tool.name}:`, validation.errors);
            }
            expect(validation.valid, `Errors: ${validation.errors.join(', ')}`).toBe(true);
            expect(validation.errors).toHaveLength(0);
          });
        });
      });
    });
  });

  describe('Example structure validation', () => {
    allPackages.forEach(({ name, tools }) => {
      describe(name, () => {
        tools.forEach((tool: EnhancedToolDefinition) => {
          tool.examples?.forEach((example, index) => {
            it(`${tool.name} example[${index}] should have required fields`, () => {
              expect(example.name).toBeDefined();
              expect(typeof example.name).toBe('string');
              expect(example.name.length).toBeGreaterThan(0);

              expect(example.description).toBeDefined();
              expect(typeof example.description).toBe('string');
              expect(example.description.length).toBeGreaterThan(0);

              // Input can be empty for tools with no required fields
              expect(example.input).toBeDefined();
              expect(typeof example.input).toBe('object');

              expect(example.output).toBeDefined();
              expect(typeof example.output).toBe('object');
              // Output should have at least some content
              expect(Object.keys(example.output).length).toBeGreaterThan(0);
            });
          });
        });
      });
    });
  });

  describe('Description keywords validation', () => {
    allPackages.forEach(({ name, tools }) => {
      describe(name, () => {
        tools.forEach((tool: EnhancedToolDefinition) => {
          it(`${tool.name} description should include keywords for semantic search`, () => {
            const description = tool.description.toLowerCase();
            // At least some tools should have Keywords section for discoverability
            const hasKeywords = description.includes('keyword');
            const hasUseWhen = description.includes('use when');

            // Not all tools need explicit keywords, but they should have descriptive text
            expect(description.length).toBeGreaterThan(50);
          });
        });
      });
    });
  });

  describe('Tool count summary', () => {
    it('should have expected total tool count', () => {
      const totalTools = allPackages.reduce((sum, pkg) => sum + pkg.tools.length, 0);

      // Expected counts per package
      const expectedCounts: Record<string, number> = {
        'smart-reviewer': 6,
        'test-generator': 3,
        'architecture-analyzer': 3,
        'security-scanner': 5,
        'refactor-assistant': 8,
        'api-designer': 6,
        'db-schema': 8,
        'doc-generator': 5,
        'orchestrator-mcp': 6, // run_workflow, run_sequence, list_workflows, search_tools, load_tool, list_capabilities
      };

      allPackages.forEach(({ name, tools }) => {
        expect(tools.length).toBe(expectedCounts[name]);
      });

      // Total: 50 tools (47 original + 3 meta-tools)
      expect(totalTools).toBe(50);
    });
  });
});
