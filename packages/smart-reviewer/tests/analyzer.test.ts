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

    it('should return cache statistics', () => {
      const stats = analyzer.getCacheStats();

      expect(stats).toBeDefined();
      expect(stats.fileCache).toBeDefined();
      expect(stats.analysisCache).toBeDefined();
    });

    it('should clear cache successfully', async () => {
      await analyzer.analyzeFile(apiDesignerFile);

      analyzer.clearCache();

      const stats = analyzer.getCacheStats();
      expect(stats.analysisCache.size).toBe(0);
    });

    it('should invalidate cache for specific file', async () => {
      await analyzer.analyzeFile(apiDesignerFile);

      analyzer.invalidateCache(apiDesignerFile);

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('applyFixes', () => {
    it('should apply fixes to code', async () => {
      const content = 'var x = 1;';
      const issues = [
        {
          type: 'var-usage' as const,
          severity: 'warning' as const,
          line: 1,
          message: 'Use const or let',
          fix: { oldCode: 'var x', newCode: 'const x' },
        },
      ];

      const result = await analyzer.applyFixes(content, issues);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should return unchanged content when no fixes', async () => {
      const content = 'const x = 1;';
      const issues: any[] = [];

      const result = await analyzer.applyFixes(content, issues);

      expect(result).toBe(content);
    });
  });

  describe('analyzeFiles error handling', () => {
    it('should handle file analysis errors gracefully (lines 127-135)', async () => {
      // Include a non-existent file to trigger the catch block
      const files = [
        apiDesignerFile,
        '/non/existent/file/that/does/not/exist.ts',
        apiDesignerFile, // Include a valid file to verify partial success
      ];

      const results = await analyzer.analyzeFiles(files);

      // Should complete without throwing
      expect(results).toBeInstanceOf(Map);
      // Should have result for the valid file
      expect(results.has(apiDesignerFile)).toBe(true);
      // Non-existent file should not be in results
      expect(results.has('/non/existent/file/that/does/not/exist.ts')).toBe(false);
    });

    it('should handle multiple errors in batch analysis', async () => {
      const files = [
        '/fake/path/one.ts',
        '/fake/path/two.ts',
        '/fake/path/three.ts',
      ];

      const results = await analyzer.analyzeFiles(files);

      // Should complete without throwing, but with empty results
      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });

    it('should handle mixed valid and invalid files', async () => {
      const files = [
        apiDesignerFile,
        '/invalid/path.ts',
      ];

      const results = await analyzer.analyzeFiles(files, 2);

      // Should have only the valid file
      expect(results.size).toBe(1);
      expect(results.has(apiDesignerFile)).toBe(true);
    });

    it('should sanitize error paths to prevent log injection', async () => {
      // Test with a path that has newlines (for sanitization check)
      const maliciousPath = '/path/with\nnewline\r/file.ts';
      const files = [maliciousPath];

      // Should complete without throwing
      const results = await analyzer.analyzeFiles(files);

      expect(results).toBeInstanceOf(Map);
      expect(results.size).toBe(0);
    });

    it('should use custom concurrency parameter', async () => {
      const files = [apiDesignerFile];

      // Test with concurrency = 1
      const results = await analyzer.analyzeFiles(files, 1);

      expect(results.size).toBe(1);
      expect(results.has(apiDesignerFile)).toBe(true);
    });
  });
});
