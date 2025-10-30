import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextDetector } from '../src/context-detector.js';
import * as fs from 'fs/promises';
import path from 'path';

vi.mock('fs/promises');

describe('ContextDetector', () => {
  let detector: ContextDetector;

  beforeEach(() => {
    detector = new ContextDetector();
    vi.clearAllMocks();
  });

  describe('detect', () => {
    it('should detect TypeScript project', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        'src/index.ts',
        'src/utils.ts',
        'package.json',
        'tsconfig.json'
      ] as any);

      vi.mocked(fs.stat).mockImplementation((filePath) => {
        if (filePath.toString().includes('tsconfig.json')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
        dependencies: { 'express': '^4.0.0' },
        devDependencies: { 'typescript': '^5.0.0', 'vitest': '^1.0.0' }
      }));

      const context = await detector.detect();

      expect(context.language).toBe('typescript');
      expect(context.testRunner).toBe('vitest');
    });

    it('should detect package manager from lock files', async () => {
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        if (filePath.toString().includes('pnpm-lock.yaml')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.packageManager).toBe('pnpm');
    });

    it('should detect React framework', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
        dependencies: {
          'react': '^18.0.0',
          'react-dom': '^18.0.0'
        }
      }));

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.framework).toBe('React');
    });

    it('should detect monorepo structure', async () => {
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        if (filePath.toString().includes('lerna.json')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.structure).toBe('monorepo');
    });

    it('should detect git repository', async () => {
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        if (filePath.toString().includes('.git')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.hasGit).toBe(true);
    });

    it('should detect CI/CD setup', async () => {
      vi.mocked(fs.stat).mockImplementation((filePath) => {
        const pathStr = filePath.toString().replace(/\\/g, '/');
        if (pathStr.includes('.github/workflows')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.hasCI).toBe(true);
    });

    it('should detect MCP tools', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
        devDependencies: {
          '@j0kz/smart-reviewer': '^1.0.0',
          '@j0kz/test-generator': '^1.0.0'
        }
      }));

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.mcpTools).toContain('@j0kz/smart-reviewer');
      expect(context.mcpTools).toContain('@j0kz/test-generator');
    });

    it('should cache detection results', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context1 = await detector.detect();

      // Clear the mock call count
      vi.mocked(fs.readdir).mockClear();

      const context2 = await detector.detect();

      expect(context1).toBe(context2); // Same reference
      expect(fs.readdir).not.toHaveBeenCalled(); // Should not be called again due to caching
    });
  });

  describe('getFileType', () => {
    it('should detect TypeScript files', async () => {
      expect(await detector.getFileType('test.ts')).toBe('typescript');
      expect(await detector.getFileType('test.tsx')).toBe('typescript-react');
    });

    it('should detect JavaScript files', async () => {
      expect(await detector.getFileType('test.js')).toBe('javascript');
      expect(await detector.getFileType('test.jsx')).toBe('javascript-react');
    });

    it('should detect other file types', async () => {
      expect(await detector.getFileType('test.json')).toBe('json');
      expect(await detector.getFileType('test.md')).toBe('markdown');
      expect(await detector.getFileType('test.css')).toBe('css');
    });

    it('should return unknown for unrecognized extensions', async () => {
      expect(await detector.getFileType('test.xyz')).toBe('unknown');
    });
  });
});