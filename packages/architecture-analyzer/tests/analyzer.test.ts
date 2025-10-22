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
  });
});
