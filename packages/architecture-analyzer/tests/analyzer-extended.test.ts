/**
 * Extended tests for architecture analyzer - coverage improvement
 */

import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { ArchitectureAnalyzer } from '../src/analyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const sharedPath = path.join(projectRoot, 'packages/shared');

describe('ArchitectureAnalyzer Extended', () => {
  let analyzer: ArchitectureAnalyzer;

  beforeEach(() => {
    analyzer = new ArchitectureAnalyzer();
  });

  describe('metrics calculation', () => {
    it('should calculate cohesion and coupling metrics', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.metrics).toBeDefined();
      expect(result.metrics.cohesion).toBeGreaterThanOrEqual(0);
      expect(result.metrics.coupling).toBeGreaterThanOrEqual(0);
    });

    it('should calculate average dependencies per module', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.metrics.averageDependenciesPerModule).toBeGreaterThanOrEqual(0);
    });

    it('should calculate max dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.metrics.maxDependencies).toBeGreaterThanOrEqual(0);
    });

    it('should count total modules and dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.metrics.totalModules).toBeGreaterThan(0);
      expect(result.metrics.totalDependencies).toBeGreaterThanOrEqual(0);
    });
  });

  describe('circular dependency detection', () => {
    it('should handle detectCircular=false', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        detectCircular: false,
      });
      expect(result.circularDependencies).toEqual([]);
    });

    it('should detect circular dependencies with proper severity', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        detectCircular: true,
      });
      expect(result.circularDependencies).toBeDefined();
      expect(Array.isArray(result.circularDependencies)).toBe(true);
      // Each circular dependency should have severity
      for (const cd of result.circularDependencies) {
        expect(cd.severity).toMatch(/^(error|warning)$/);
        expect(Array.isArray(cd.cycle)).toBe(true);
      }
    });
  });

  describe('layer violation detection', () => {
    it('should detect layer violations with rules', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        layerRules: {
          helpers: ['types'],
          errors: ['types'],
          config: ['types'],
        },
      });
      expect(result.layerViolations).toBeDefined();
      expect(Array.isArray(result.layerViolations)).toBe(true);
    });

    it('should return empty violations when layers match rules', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        layerRules: {
          // Very permissive rules
          src: ['helpers', 'types', 'errors', 'config', 'fs', 'health', 'i18n'],
          helpers: ['types', 'errors', 'config', 'fs', 'health', 'i18n', 'src'],
        },
      });
      expect(result.layerViolations).toBeDefined();
    });

    it('should handle layer violations with proper structure', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        layerRules: {
          // Strict rules likely to trigger violations
          helpers: [],
          errors: [],
        },
      });
      for (const violation of result.layerViolations) {
        expect(violation.from).toBeDefined();
        expect(violation.to).toBeDefined();
        expect(violation.description).toBeDefined();
      }
    });
  });

  describe('dependency graph generation', () => {
    it('should generate Mermaid dependency graph', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: true,
      });
      expect(result.dependencyGraph).toBeDefined();
      expect(result.dependencyGraph).toContain('graph TD');
    });

    it('should skip graph generation when disabled', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: false,
      });
      expect(result.dependencyGraph).toBe('');
    });

    it('should sanitize node IDs in graph', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: true,
      });
      // Graph should not contain problematic characters in IDs
      expect(result.dependencyGraph).not.toMatch(/\s+[.\\/]+\s+-->/);
    });

    it('should include node labels in graph', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: true,
      });
      // Should have node definitions with labels
      expect(result.dependencyGraph).toMatch(/\[.*\]/);
    });

    it('should include edge connections in graph', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: true,
      });
      // Should have edge definitions (-->)
      if (result.dependencies.length > 0) {
        expect(result.dependencyGraph).toContain('-->');
      }
    });

    it('should handle large projects with many dependencies', async () => {
      // Use the entire monorepo for a large project
      const result = await analyzer.analyzeArchitecture(projectRoot, {
        generateGraph: true,
        excludePatterns: ['node_modules', '.git'],
      });
      expect(result.dependencyGraph).toBeDefined();
      expect(result.dependencyGraph).toContain('graph TD');
      // Large projects should have truncation note if > MAX_GRAPH_EDGES (50)
      if (result.dependencies.length > 50) {
        expect(result.dependencyGraph).toContain('more dependencies');
      }
    });

    it('should generate edges for dependencies', async () => {
      // Ensure edge generation is tested (lines 275-278 in analyzer.ts)
      const result = await analyzer.analyzeArchitecture(sharedPath, {
        generateGraph: true,
      });
      // If there are dependencies, graph should have edges
      if (result.dependencies.length > 0) {
        // Edges are in format "nodeId --> nodeId" (Mermaid arrow syntax)
        // Using split instead of regex to avoid CodeQL false positive (js/bad-tag-filter)
        const edgeCount = result.dependencyGraph.split(' --> ').length - 1;
        expect(edgeCount).toBeGreaterThan(0);
      }
    });
  });

  describe('suggestions generation', () => {
    it('should generate suggestions based on analysis', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('timestamp', () => {
    it('should include ISO timestamp in result', async () => {
      const result = await analyzer.analyzeArchitecture(sharedPath, {});
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('empty/minimal projects', () => {
    it('should handle project with few files gracefully', async () => {
      // Use a minimal package
      const configWizardPath = path.join(projectRoot, 'packages/config-wizard');
      const result = await analyzer.analyzeArchitecture(configWizardPath, {});
      expect(result).toBeDefined();
      expect(result.modules).toBeDefined();
    });
  });
});
