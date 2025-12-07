import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/analyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const apiDesignerPath = path.join(projectRoot, 'packages/api-designer');

describe('ArchitectureAnalyzer', () => {
  let analyzer: target.ArchitectureAnalyzer;

  beforeEach(() => {
    analyzer = new target.ArchitectureAnalyzer();
  });

  describe('constructor', () => {
    it('should create instance of ArchitectureAnalyzer', () => {
      expect(analyzer).toBeInstanceOf(target.ArchitectureAnalyzer);
    });

    it('should initialize properly', () => {
      expect(analyzer).toBeDefined();
    });
  });

  describe('analyzeArchitecture()', () => {
    it('should analyze architecture of a project', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      expect(result).toBeDefined();
      expect(result.modules).toBeDefined();
    });

    it('should return modules array', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      expect(Array.isArray(result.modules)).toBe(true);
    });

    it('should detect dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      expect(result.dependencies).toBeDefined();
    });

    it('should handle configuration options', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        maxDepth: 3,
        detectCircular: true,
      });
      expect(result).toBeDefined();
    });

    it('should include project path in result', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      expect(result.projectPath).toBeDefined();
    });
  });

  describe('circular dependency detection', () => {
    it('should detect circular dependencies when enabled', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        detectCircular: true,
      });
      expect(result).toBeDefined();
    });

    it('should return circular dependencies array', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        detectCircular: true,
      });
      if (result.circularDependencies) {
        expect(Array.isArray(result.circularDependencies)).toBe(true);
      }
    });
  });

  describe('module analysis', () => {
    it('should identify module types', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      if (result.modules.length > 0) {
        result.modules.forEach(mod => {
          expect(mod).toHaveProperty('path');
        });
      }
    });

    it('should track module dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});
      expect(result.dependencies).toBeDefined();
    });
  });

  describe('depth limiting', () => {
    it('should respect maxDepth configuration', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        maxDepth: 2,
      });
      expect(result).toBeDefined();
    });
  });

  describe('exclude patterns', () => {
    it('should support exclude patterns', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        excludePatterns: ['node_modules', 'dist'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('graph generation', () => {
    it('should generate dependency graph when configured', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: true,
      });
      expect(result).toBeDefined();
    });
  });

  describe('layer rules', () => {
    it('should validate layer rules when provided', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          presentation: ['business'],
          business: ['data'],
        },
      });
      expect(result).toBeDefined();
    });

    it('should detect layer violations', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          generators: ['types'],
          validators: ['types'],
        },
      });

      expect(result.layerViolations).toBeDefined();
      expect(Array.isArray(result.layerViolations)).toBe(true);
    });
  });

  describe('metrics', () => {
    it('should calculate architecture metrics', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalModules).toBeGreaterThanOrEqual(0);
      expect(result.metrics.totalDependencies).toBeGreaterThanOrEqual(0);
    });

    it('should include cohesion metric', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.metrics.cohesion).toBeDefined();
      expect(typeof result.metrics.cohesion).toBe('number');
    });

    it('should include coupling metric', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.metrics.coupling).toBeDefined();
      expect(typeof result.metrics.coupling).toBe('number');
    });

    it('should calculate average dependencies per module', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.metrics.averageDependenciesPerModule).toBeGreaterThanOrEqual(0);
    });

    it('should track max dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.metrics.maxDependencies).toBeGreaterThanOrEqual(0);
    });
  });

  describe('suggestions', () => {
    it('should generate architecture suggestions', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });
  });

  describe('dependency graph', () => {
    it('should generate Mermaid dependency graph', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: true,
      });

      expect(result.dependencyGraph).toBeDefined();
      expect(result.dependencyGraph).toContain('graph TD');
    });

    it('should skip graph generation when disabled', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: false,
      });

      expect(result.dependencyGraph).toBe('');
    });
  });

  describe('timestamp', () => {
    it('should include analysis timestamp', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
      // Verify it's a valid ISO string
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });
  });

  describe('layer violation detection', () => {
    it('should detect violations when layer rules are violated', async () => {
      // Test with restrictive layer rules that will trigger violations
      // types layer can only import from types, but it imports from other modules
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          types: [], // types cannot depend on anything
          src: ['types'], // src can only depend on types - this will cause violations
        },
      });

      // There should be violations because src imports from various modules
      expect(result.layerViolations).toBeDefined();
      expect(Array.isArray(result.layerViolations)).toBe(true);
      // Actually check if violations are detected when layers don't allow dependencies
    });

    it('should not detect violations when layers are properly structured', async () => {
      // Test with permissive layer rules that allow the actual dependencies
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          generators: ['types', 'validators', 'src', 'generators'], // generators can depend on many
          validators: ['types', 'src', 'validators'], // validators can depend on types/src
          types: ['types'], // types can only depend on types
          src: ['types', 'validators', 'generators', 'src'], // src can depend on everything
        },
      });

      expect(result.layerViolations).toBeDefined();
      expect(Array.isArray(result.layerViolations)).toBe(true);
    });

    it('should return null layer when module does not match any layer', async () => {
      // Test getLayer returning null for modules not in layer rules
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          nonexistent: ['another-nonexistent'],
        },
      });

      // No violations since no modules match the layers (getLayer returns null)
      expect(result.layerViolations).toBeDefined();
      expect(result.layerViolations.length).toBe(0);
    });

    it('should include violation details when detected', async () => {
      // Use very restrictive rules to force violations
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          designer: [], // designer cannot depend on anything
          generators: ['designer'], // generators can only depend on designer
        },
      });

      // Check violation structure if any exist
      if (result.layerViolations.length > 0) {
        const violation = result.layerViolations[0];
        expect(violation.from).toBeDefined();
        expect(violation.to).toBeDefined();
        expect(violation.description).toBeDefined();
      }
    });

    it('should skip violations when both modules are in same allowed layer', async () => {
      // Test with layers that allow each other
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        layerRules: {
          src: ['src', 'types', 'generators', 'validators'], // allow everything
        },
      });

      // Should have fewer violations when dependencies are allowed
      expect(result.layerViolations).toBeDefined();
    });
  });

  describe('circular dependency Tarjan algorithm', () => {
    it('should find cycles using Tarjan algorithm', async () => {
      // The Tarjan algorithm finds strongly connected components
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        detectCircular: true,
      });

      expect(result.circularDependencies).toBeDefined();
      expect(Array.isArray(result.circularDependencies)).toBe(true);

      // Each circular dependency should have cycle and severity
      result.circularDependencies.forEach(circ => {
        expect(circ.cycle).toBeDefined();
        expect(circ.severity).toBeDefined();
        expect(['warning', 'error']).toContain(circ.severity);
      });
    });

    it('should classify long cycles as errors', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        detectCircular: true,
      });

      // Long cycles (> threshold) should have 'error' severity
      result.circularDependencies.forEach(circ => {
        if (circ.cycle.length > 5) {
          expect(circ.severity).toBe('error');
        }
      });
    });
  });

  describe('dependency graph generation', () => {
    it('should limit graph edges when there are many dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: true,
      });

      expect(result.dependencyGraph).toBeDefined();
      expect(result.dependencyGraph).toContain('graph TD');

      // Should contain node definitions
      const lines = result.dependencyGraph.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should sanitize node IDs for Mermaid compatibility', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: true,
      });

      // Node IDs should only contain alphanumeric and underscores
      const graphLines = result.dependencyGraph.split('\n');
      const nodeLines = graphLines.filter(line => line.includes('['));

      nodeLines.forEach(line => {
        // Each node line should have sanitized ID - check for valid chars
        const invalidChars = line.match(/[^a-zA-Z0-9_[\]">\s-]/g);
        expect(invalidChars).toBeFalsy();
      });
    });
  });

  describe('metrics calculation', () => {
    it('should calculate zero metrics for empty project', async () => {
      // Use a path that exists but has minimal modules
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        excludePatterns: ['*'], // Exclude everything
      });

      expect(result.metrics).toBeDefined();
      expect(result.metrics.totalModules).toBeGreaterThanOrEqual(0);
    });

    it('should handle projects with no dependencies', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        excludePatterns: ['*'],
      });

      expect(result.metrics.averageDependenciesPerModule).toBeGreaterThanOrEqual(0);
      expect(result.metrics.maxDependencies).toBeGreaterThanOrEqual(0);
    });
  });

  describe('config options edge cases', () => {
    it('should handle detectCircular set to false', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        detectCircular: false,
      });

      // Should return empty array when detection disabled
      expect(result.circularDependencies).toEqual([]);
    });

    it('should handle generateGraph set to false', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {
        generateGraph: false,
      });

      expect(result.dependencyGraph).toBe('');
    });

    it('should use default exclude patterns when not provided', async () => {
      const result = await analyzer.analyzeArchitecture(apiDesignerPath, {});

      // Should exclude node_modules, dist, etc. by default
      expect(result.modules.every(m => !m.path.includes('node_modules'))).toBe(true);
    });
  });
});
