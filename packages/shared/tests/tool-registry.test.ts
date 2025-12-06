/**
 * Tests for Tool Registry (Phase 3: Deferred Loading Architecture)
 */
import { describe, it, expect } from 'vitest';
import {
  TOOL_REGISTRY,
  searchTools,
  suggestTools,
  findToolByName,
  getToolCount,
  getImmediateTools,
  getDeferredTools,
  getExplicitlyDeferredTools,
  getToolsByFrequency,
  getToolsByServer,
  getToolsByCategory,
} from '../src/tool-registry/index.js';

describe('Tool Registry', () => {
  describe('TOOL_REGISTRY', () => {
    it('should contain all 50 tools', () => {
      // 47 original tools + 3 meta-tools (search_tools, load_tool, list_capabilities)
      expect(TOOL_REGISTRY.length).toBe(50);
    });

    it('should have required fields for each tool', () => {
      for (const tool of TOOL_REGISTRY) {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('server');
        expect(tool).toHaveProperty('frequency');
        expect(tool).toHaveProperty('category');
        expect(tool).toHaveProperty('keywords');
        expect(tool).toHaveProperty('description');
      }
    });

    it('should have valid frequency values', () => {
      const validFrequencies = ['high', 'medium', 'low'];
      for (const tool of TOOL_REGISTRY) {
        expect(validFrequencies).toContain(tool.frequency);
      }
    });

    it('should have valid category values', () => {
      const validCategories = [
        'analysis',
        'generation',
        'refactoring',
        'design',
        'security',
        'orchestration',
        'documentation',
      ];
      for (const tool of TOOL_REGISTRY) {
        expect(validCategories).toContain(tool.category);
      }
    });
  });

  describe('getToolCount()', () => {
    it('should return total number of tools', () => {
      // 47 original + 3 meta-tools = 50
      expect(getToolCount()).toBe(50);
    });
  });

  describe('getImmediateTools()', () => {
    it('should return only high-frequency tools', () => {
      const tools = getImmediateTools();
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.frequency).toBe('high');
      }
    });

    it('should include core tools like review_file and run_workflow', () => {
      const tools = getImmediateTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('review_file');
      expect(toolNames).toContain('run_workflow');
      expect(toolNames).toContain('generate_tests');
    });
  });

  describe('getDeferredTools()', () => {
    it('should return medium and low frequency tools', () => {
      const tools = getDeferredTools();
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(['medium', 'low']).toContain(tool.frequency);
      }
    });
  });

  describe('getExplicitlyDeferredTools()', () => {
    it('should return only tools with defer_loading: true', () => {
      const tools = getExplicitlyDeferredTools();
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.defer_loading).toBe(true);
      }
    });

    it('should return low-frequency tools', () => {
      const tools = getExplicitlyDeferredTools();
      // All explicitly deferred tools should be low frequency
      for (const tool of tools) {
        expect(tool.frequency).toBe('low');
      }
    });

    it('should include refactor-assistant, api-designer, and db-schema tools', () => {
      const tools = getExplicitlyDeferredTools();
      const servers = [...new Set(tools.map(t => t.server))];
      expect(servers).toContain('refactor-assistant');
      expect(servers).toContain('api-designer');
      expect(servers).toContain('db-schema');
    });
  });

  describe('getToolsByFrequency()', () => {
    it('should filter by high frequency', () => {
      const tools = getToolsByFrequency('high');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.frequency).toBe('high');
      }
    });

    it('should filter by low frequency', () => {
      const tools = getToolsByFrequency('low');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.frequency).toBe('low');
      }
    });
  });

  describe('getToolsByServer()', () => {
    it('should return tools for smart-reviewer server', () => {
      const tools = getToolsByServer('smart-reviewer');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.server).toBe('smart-reviewer');
      }
    });

    it('should return tools for security-scanner server', () => {
      const tools = getToolsByServer('security-scanner');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.server).toBe('security-scanner');
      }
    });
  });

  describe('getToolsByCategory()', () => {
    it('should return tools for security category', () => {
      const tools = getToolsByCategory('security');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.category).toBe('security');
      }
    });

    it('should return tools for refactoring category', () => {
      const tools = getToolsByCategory('refactoring');
      expect(tools.length).toBeGreaterThan(0);
      for (const tool of tools) {
        expect(tool.category).toBe('refactoring');
      }
    });
  });

  describe('findToolByName()', () => {
    it('should find existing tool', () => {
      const tool = findToolByName('review_file');
      expect(tool).toBeDefined();
      expect(tool?.name).toBe('review_file');
      expect(tool?.server).toBe('smart-reviewer');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = findToolByName('non_existent_tool');
      expect(tool).toBeUndefined();
    });
  });

  describe('searchTools()', () => {
    it('should search by query', () => {
      const results = searchTools({ query: 'security' });
      expect(results.length).toBeGreaterThan(0);
      // All results should have relevance > 0
      for (const result of results) {
        expect(result.relevance).toBeGreaterThan(0);
      }
    });

    it('should filter by category', () => {
      const results = searchTools({ category: 'security' });
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.tool.category).toBe('security');
      }
    });

    it('should filter by frequency', () => {
      const results = searchTools({ frequency: 'high' });
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.tool.frequency).toBe('high');
      }
    });

    it('should filter by server', () => {
      const results = searchTools({ server: 'db-schema' });
      expect(results.length).toBeGreaterThan(0);
      for (const result of results) {
        expect(result.tool.server).toBe('db-schema');
      }
    });

    it('should respect limit parameter', () => {
      const results = searchTools({ limit: 3 });
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should combine filters', () => {
      const results = searchTools({
        query: 'test',
        category: 'generation',
        limit: 5,
      });
      for (const result of results) {
        expect(result.tool.category).toBe('generation');
      }
    });

    it('should return tools sorted by relevance', () => {
      const results = searchTools({ query: 'security scan' });
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevance).toBeGreaterThanOrEqual(results[i].relevance);
      }
    });

    it('should include matched keywords', () => {
      const results = searchTools({ query: 'vulnerability' });
      expect(results.length).toBeGreaterThan(0);
      // Some results should have matched keywords
      const hasMatchedKeywords = results.some(r => r.matchedKeywords.length > 0);
      expect(hasMatchedKeywords).toBe(true);
    });
  });

  describe('suggestTools()', () => {
    it('should suggest security tools for security context', () => {
      const results = suggestTools('I need to check for vulnerabilities and OWASP issues');
      expect(results.length).toBeGreaterThan(0);
      const hasSecurityTool = results.some(r => r.tool.category === 'security');
      expect(hasSecurityTool).toBe(true);
    });

    it('should suggest test tools for testing context', () => {
      const results = suggestTools('I want to generate unit tests with vitest');
      expect(results.length).toBeGreaterThan(0);
      const hasTestTool = results.some(
        r => r.tool.name.includes('test') || r.tool.keywords.includes('test')
      );
      expect(hasTestTool).toBe(true);
    });

    it('should suggest refactoring tools for refactoring context', () => {
      const results = suggestTools('I need to refactor this code and remove dead code');
      expect(results.length).toBeGreaterThan(0);
      const hasRefactorTool = results.some(r => r.tool.category === 'refactoring');
      expect(hasRefactorTool).toBe(true);
    });

    it('should suggest database tools for database context', () => {
      const results = suggestTools('I need to design a database schema and migrations');
      expect(results.length).toBeGreaterThan(0);
      const hasDbTool = results.some(r => r.tool.server === 'db-schema');
      expect(hasDbTool).toBe(true);
    });

    it('should return max 5 suggestions', () => {
      const results = suggestTools('security vulnerability test database api documentation');
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should not return duplicates', () => {
      const results = suggestTools('security security vulnerability vulnerability');
      const toolNames = results.map(r => r.tool.name);
      const uniqueNames = [...new Set(toolNames)];
      expect(toolNames.length).toBe(uniqueNames.length);
    });
  });
});
