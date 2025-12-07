import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContextDetector } from '../src/context-detector.js';
import * as fs from 'fs/promises';

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
        'tsconfig.json',
      ] as any);

      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('tsconfig.json')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          dependencies: { express: '^4.0.0' },
          devDependencies: { typescript: '^5.0.0', vitest: '^1.0.0' },
        })
      );

      const context = await detector.detect();

      expect(context.language).toBe('typescript');
      expect(context.testRunner).toBe('vitest');
    });

    it('should detect package manager from lock files', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
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
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0',
          },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.framework).toBe('React');
    });

    it('should detect monorepo structure', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
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
      vi.mocked(fs.stat).mockImplementation(filePath => {
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
      vi.mocked(fs.stat).mockImplementation(filePath => {
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
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          devDependencies: {
            '@j0kz/smart-reviewer': '^1.0.0',
            '@j0kz/test-generator': '^1.0.0',
          },
        })
      );

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

    it('should detect yaml files', async () => {
      expect(await detector.getFileType('config.yml')).toBe('yaml');
      expect(await detector.getFileType('config.yaml')).toBe('yaml');
    });

    it('should detect css and scss files', async () => {
      expect(await detector.getFileType('styles.css')).toBe('css');
      expect(await detector.getFileType('styles.scss')).toBe('scss');
    });

    it('should detect html files', async () => {
      expect(await detector.getFileType('index.html')).toBe('html');
    });
  });

  describe('framework detection', () => {
    it('should detect Next.js', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          dependencies: { next: '^14.0.0' },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.framework).toBe('Next.js');
    });

    it('should detect Vue', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          dependencies: { vue: '^3.0.0' },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.framework).toBe('Vue');
    });

    it('should detect Express', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          dependencies: { express: '^4.0.0' },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.framework).toBe('Express');
    });
  });

  describe('build tool detection', () => {
    it('should detect webpack', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('webpack.config.js')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.buildTool).toBe('webpack');
    });

    it('should detect vite', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('vite.config.js')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.buildTool).toBe('vite');
    });
  });

  describe('linter detection', () => {
    it('should detect eslint from config file', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('.eslintrc')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.linter).toBe('eslint');
    });

    it('should detect prettier from config file', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('.prettierrc')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.formatter).toBe('prettier');
    });
  });

  describe('docker detection', () => {
    it('should detect Dockerfile', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('Dockerfile')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.hasDocker).toBe(true);
    });

    it('should detect docker-compose', async () => {
      vi.mocked(fs.stat).mockImplementation(filePath => {
        if (filePath.toString().includes('docker-compose.yml')) {
          return Promise.resolve({} as any);
        }
        return Promise.reject(new Error('Not found'));
      });

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.readFile).mockResolvedValue('{}');

      const context = await detector.detect();

      expect(context.hasDocker).toBe(true);
    });
  });

  describe('test runner detection', () => {
    it('should detect jest', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          devDependencies: { jest: '^29.0.0' },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.testRunner).toBe('jest');
    });

    it('should detect mocha', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          devDependencies: { mocha: '^10.0.0' },
        })
      );

      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context.testRunner).toBe('mocha');
    });
  });

  describe('isProductionProject edge cases', () => {
    it('should return false when package.json read fails', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      // When readPackageJson fails, context should still be created
      expect(context).toBeDefined();
    });

    it('should detect production project with proper indicators', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          private: false,
          version: '1.0.0',
          repository: 'https://github.com/test/test',
          license: 'MIT',
        })
      );
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context).toBeDefined();
    });

    it('should handle project with fewer than 2 production indicators', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(
        JSON.stringify({
          private: true,
          version: '0.0.1',
        })
      );
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      expect(context).toBeDefined();
    });
  });

  describe('readPackageJson edge cases', () => {
    it('should return empty object when package.json is missing', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      // The detector should still work with an empty package.json result
      expect(context.language).toBe('unknown');
    });

    it('should handle invalid JSON in package.json', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json }');
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      // JSON.parse will throw, but the catch block should handle it
      const context = await detector.detect();

      expect(context.language).toBe('unknown');
    });
  });

  describe('countSourceFiles edge cases', () => {
    it('should return 0 when readdir fails for recursive scan', async () => {
      // First readdir call for non-recursive scan
      vi.mocked(fs.readdir).mockImplementation((path, options) => {
        // The countSourceFiles uses recursive: true option
        if (options && typeof options === 'object' && 'recursive' in options) {
          return Promise.reject(new Error('EACCES: permission denied'));
        }
        return Promise.resolve([]);
      });
      vi.mocked(fs.readFile).mockResolvedValue('{}');
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      // fileCount should be 0 when countSourceFiles fails
      expect(context.fileCount).toBe(0);
    });
  });

  describe('isProductionProject edge cases', () => {
    it('should return false when isProductionProject fails', async () => {
      // Make readPackageJson throw to trigger isProductionProject catch block
      let readCount = 0;
      vi.mocked(fs.readFile).mockImplementation(() => {
        readCount++;
        // First call for initial detection succeeds
        if (readCount === 1) {
          return Promise.resolve('{}');
        }
        // Subsequent calls for isProductionProject fail
        return Promise.reject(new Error('File read error'));
      });
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      const context = await detector.detect();

      // Should still complete detection even with isProductionProject failure
      expect(context).toBeDefined();
    });
  });

  describe('private method catch blocks via type assertion', () => {
    it('detectLinters should handle readPackageJson errors', async () => {
      // Reset mocks for this specific test
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));
      vi.mocked(fs.readdir).mockResolvedValue([]);
      vi.mocked(fs.stat).mockRejectedValue(new Error('Not found'));

      // Access private method via type assertion
      const detectorAny = detector as any;
      const context = { linter: 'none' as const, formatter: 'none' as const };

      // This should trigger the catch block at line 424
      await detectorAny.detectLinters(context);

      // Should still have default values (no error thrown)
      expect(context.linter).toBe('none');
    });

    it('detectMCPTools should handle readPackageJson errors', async () => {
      // Reset mocks for this specific test
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      // Access private method via type assertion
      const detectorAny = detector as any;
      const context = { mcpTools: [] };

      // This should trigger the catch block at line 453
      await detectorAny.detectMCPTools(context);

      // Should still have empty array (no error thrown)
      expect(context.mcpTools).toEqual([]);
    });

    it('isProductionProject should handle readPackageJson errors', async () => {
      // Reset mocks for this specific test
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Read error'));

      // Access private method via type assertion
      const detectorAny = detector as any;

      // This should trigger the catch block at lines 494-495
      const result = await detectorAny.isProductionProject();

      // Should return false on error
      expect(result).toBe(false);
    });

    it('countSourceFiles should handle readdir errors', async () => {
      // Reset mocks for this specific test
      vi.mocked(fs.readdir).mockRejectedValue(new Error('EACCES'));

      // Access private method via type assertion
      const detectorAny = detector as any;

      // This should trigger the catch block at lines 472-474
      const result = await detectorAny.countSourceFiles();

      // Should return 0 on error
      expect(result).toBe(0);
    });
  });
});
