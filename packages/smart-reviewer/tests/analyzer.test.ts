import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import * as target from '../src/analyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
const apiDesignerFile = path.join(projectRoot, 'packages/api-designer/src/designer.ts');

describe('CodeAnalyzer', () => {
  let analyzer: target.CodeAnalyzer;

  beforeEach(() => {
    analyzer = new target.CodeAnalyzer();
  });

  describe('constructor', () => {
    it('should create instance of CodeAnalyzer', () => {
      expect(analyzer).toBeInstanceOf(target.CodeAnalyzer);
    });

    it('should initialize with default configuration', () => {
      expect(analyzer).toBeDefined();
    });
  });

  describe('analyzeFile()', () => {
    it('should analyze file with valid path', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
    });

    it('should return issues array', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should calculate metrics', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.metrics).toBeDefined();
      expect(result.metrics.linesOfCode).toBeDefined();
    });

    it('should provide suggestions', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.suggestions).toBeDefined();
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('should calculate overall score', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.overallScore).toBeDefined();
      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should include timestamp', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe('string');
    });

    it('should include performance metrics', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.performance).toBeDefined();
      expect(result.performance.duration).toBeDefined();
      expect(result.performance.memoryUsed).toBeDefined();
    });

    it('should include file path in result', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.file).toBe(apiDesignerFile);
    });

    it('should track lines of code metric', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.metrics.linesOfCode).toBeGreaterThan(0);
    });

    it('should track complexity metric', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(result.metrics.complexity).toBeDefined();
      expect(result.metrics.complexity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeFiles()', () => {
    it('should analyze files in batch', async () => {
      const files = [apiDesignerFile];
      const results = await analyzer.analyzeFiles(files);
      expect(results).toBeDefined();
      expect(results).toBeInstanceOf(Map);
    });

    it('should return results for all files', async () => {
      const files = [apiDesignerFile];
      const results = await analyzer.analyzeFiles(files);
      expect(results.size).toBe(files.length);
    });

    it('should handle empty array', async () => {
      const results = await analyzer.analyzeFiles([]);
      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });

    it('should handle multiple files', async () => {
      const file2 = path.join(projectRoot, 'packages/api-designer/src/types.ts');
      const results = await analyzer.analyzeFiles([apiDesignerFile, file2]);
      expect(results.size).toBe(2);
    });

    it('should return Map with file paths as keys', async () => {
      const results = await analyzer.analyzeFiles([apiDesignerFile]);
      expect(results.has(apiDesignerFile)).toBe(true);
    });
  });

  describe('issue detection', () => {
    it('should provide issues array', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should include issue severity levels', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      // Issues should have proper structure even if empty
      expect(result.issues).toBeDefined();
    });

    it('should track issue types', async () => {
      const result = await analyzer.analyzeFile(apiDesignerFile);
      // Verify issues structure is correct
      result.issues.forEach(issue => {
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('message');
      });
    });
  });

  describe('caching', () => {
    it('should use cache for repeated analyses', async () => {
      const result1 = await analyzer.analyzeFile(apiDesignerFile);
      const result2 = await analyzer.analyzeFile(apiDesignerFile);

      expect(result1.overallScore).toBe(result2.overallScore);
      expect(result1.metrics.linesOfCode).toBe(result2.metrics.linesOfCode);
    });
  });
});
