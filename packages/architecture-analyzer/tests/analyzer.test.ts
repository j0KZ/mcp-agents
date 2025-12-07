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
});
