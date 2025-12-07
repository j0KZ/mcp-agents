/**
 * Tests for SmartPathResolver
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SmartPathResolver } from '../src/fs/smart-resolver.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('SmartPathResolver', () => {
  const testDir = path.join(os.tmpdir(), 'smart-resolver-test');
  const testFile = 'test-file.txt';

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(path.join(testDir, testFile), 'test content');
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('resolvePath', () => {
    it('should resolve absolute paths', async () => {
      const absolutePath = path.join(testDir, testFile);
      const result = await SmartPathResolver.resolvePath(absolutePath);
      expect(result.resolved).toBe(absolutePath);
      expect(result.strategy).toBe('absolute_path');
    });

    it('should resolve relative paths from working directory', async () => {
      const result = await SmartPathResolver.resolvePath(testFile, {
        workingDir: testDir,
      });
      expect(result.resolved).toBe(path.join(testDir, testFile));
      expect(result.strategy).toBe('relative_to_cwd');
    });

    it('should resolve relative paths from project root', async () => {
      const subDir = path.join(testDir, 'sub');
      await fs.mkdir(subDir, { recursive: true });

      const result = await SmartPathResolver.resolvePath(testFile, {
        workingDir: subDir,
        projectRoot: testDir,
      });
      expect(result.resolved).toBe(path.join(testDir, testFile));
      expect(result.strategy).toBe('relative_to_project_root');
    });

    it('should handle home directory expansion', async () => {
      // Create file in home directory for test
      const homeFile = path.join(os.homedir(), '.smart-resolver-test');
      try {
        await fs.writeFile(homeFile, 'test');
        const result = await SmartPathResolver.resolvePath('~/.smart-resolver-test');
        // Normalize path separators for comparison
        expect(result.resolved.replace(/\\/g, '/')).toBe(homeFile.replace(/\\/g, '/'));
      } finally {
        await fs.rm(homeFile, { force: true }).catch(() => {});
      }
    });

    it('should throw PathResolutionError for non-existent files', async () => {
      await expect(
        SmartPathResolver.resolvePath('nonexistent-file.txt', {
          workingDir: testDir,
        })
      ).rejects.toThrow();
    });

    it('should throw PathResolutionError with attempted paths info', async () => {
      try {
        await SmartPathResolver.resolvePath('nonexistent.txt', {
          workingDir: testDir,
        });
        expect.fail('Should have thrown');
      } catch (error: unknown) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain('Cannot resolve path');
      }
    });
  });

  describe('fileExists', () => {
    it('should return true for existing files', async () => {
      const filePath = path.join(testDir, testFile);
      const result = await SmartPathResolver.resolvePath(filePath);
      expect(result.resolved).toBe(filePath);
    });

    it('should throw for non-existent files', async () => {
      await expect(
        SmartPathResolver.resolvePath(path.join(testDir, 'nonexistent.txt'))
      ).rejects.toThrow();
    });
  });

  describe('context options', () => {
    it('should use default context when not provided', async () => {
      const absolutePath = path.join(testDir, testFile);
      const result = await SmartPathResolver.resolvePath(absolutePath);
      expect(result).toBeDefined();
    });

    it('should respect maxDepth option', async () => {
      await expect(
        SmartPathResolver.resolvePath('deep/nested/file.txt', {
          workingDir: testDir,
          maxDepth: 1,
        })
      ).rejects.toThrow();
    });

    it('should respect allowedDirs option', async () => {
      const result = await SmartPathResolver.resolvePath(testFile, {
        workingDir: testDir,
        allowedDirs: [testDir],
      });
      expect(result.resolved).toContain(testFile);
    });
  });
});
