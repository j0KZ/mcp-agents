/**
 * Tests for GitHooks class
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHooks } from '../src/git-hooks.js';
import * as fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock console.log to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('GitHooks', () => {
  let hooks: GitHooks;
  let tempDir: string;

  beforeEach(async () => {
    // Create a temp directory for tests
    tempDir = path.join(os.tmpdir(), `git-hooks-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.git', 'hooks'), { recursive: true });

    // Change to temp directory for hooks
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);

    hooks = new GitHooks();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('should initialize with hooks path', () => {
      expect(hooks).toBeDefined();
    });
  });

  describe('install', () => {
    it('should install pre-commit hook', async () => {
      await hooks.install('pre-commit', async () => {});

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('Auto-Pilot Pre-Commit Hook');
      expect(content).toContain('#!/bin/sh');
    });

    it('should install pre-push hook', async () => {
      await hooks.install('pre-push', async () => {});

      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-push');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('Auto-Pilot Pre-Push Hook');
      expect(content).toContain('npm test');
    });

    it('should install commit-msg hook', async () => {
      await hooks.install('commit-msg', async () => {});

      const hookPath = path.join(tempDir, '.git', 'hooks', 'commit-msg');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('Commit Message Hook');
      expect(content).toContain('conventional commit');
    });

    it('should throw error for unknown hook', async () => {
      await expect(hooks.install('unknown-hook', async () => {})).rejects.toThrow(
        'Unknown hook: unknown-hook'
      );
    });
  });

  describe('installAll', () => {
    it('should install all hooks', async () => {
      await hooks.installAll();

      // Check all three hooks exist
      const preCommit = await fs.readFile(
        path.join(tempDir, '.git', 'hooks', 'pre-commit'),
        'utf-8'
      );
      const prePush = await fs.readFile(path.join(tempDir, '.git', 'hooks', 'pre-push'), 'utf-8');
      const commitMsg = await fs.readFile(
        path.join(tempDir, '.git', 'hooks', 'commit-msg'),
        'utf-8'
      );

      expect(preCommit).toContain('Pre-Commit');
      expect(prePush).toContain('Pre-Push');
      expect(commitMsg).toContain('Commit Message');
    });
  });

  describe('getStagedFiles', () => {
    it('should return array (empty if not in git repo)', async () => {
      const files = await hooks.getStagedFiles();
      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('areHooksInstalled', () => {
    it('should return false when hooks not installed', async () => {
      const installed = await hooks.areHooksInstalled();
      expect(installed).toBe(false);
    });

    it('should return true when pre-commit hook is installed', async () => {
      await hooks.install('pre-commit', async () => {});
      const installed = await hooks.areHooksInstalled();
      expect(installed).toBe(true);
    });
  });

  describe('setupLintStaged', () => {
    it('should create lint-staged config file', async () => {
      await hooks.setupLintStaged();

      const configPath = path.join(tempDir, '.lintstagedrc.json');
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config['*.{js,jsx,ts,tsx}']).toBeDefined();
      expect(config['*.{json,md,yml,yaml}']).toBeDefined();
    });
  });

  describe('setupHusky', () => {
    it('should attempt to setup husky (may fail without npm)', async () => {
      // This will likely fail in test env but should not throw
      await hooks.setupHusky();
    });
  });

  describe('hook script content', () => {
    it('pre-commit hook should check for staged files', async () => {
      await hooks.install('pre-commit', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('STAGED_FILES');
      expect(content).toContain('git diff --cached');
    });

    it('pre-commit hook should run prettier and eslint', async () => {
      await hooks.install('pre-commit', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('prettier');
      expect(content).toContain('eslint');
    });

    it('pre-push hook should run test suite', async () => {
      await hooks.install('pre-push', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-push');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('npm test');
      expect(content).toContain('npm run build');
    });

    it('commit-msg hook should validate conventional commits', async () => {
      await hooks.install('commit-msg', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'commit-msg');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('feat|fix|docs|style|refactor|test|chore');
    });
  });

  describe('hook script validation', () => {
    it('pre-commit hook should be a valid shell script', async () => {
      await hooks.install('pre-commit', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Valid shell script checks
      expect(content.startsWith('#!/bin/sh')).toBe(true);
      expect(content).toContain('exit 0');
      expect(content).toContain('exit 1');
    });

    it('pre-commit hook should filter JS/TS files', async () => {
      await hooks.install('pre-commit', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Should filter for JS/TS files
      expect(content).toMatch(/\.js|\.jsx|\.ts|\.tsx/);
    });

    it('pre-commit hook should re-add files after fixes', async () => {
      await hooks.install('pre-commit', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-commit');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Should re-add files after fixes
      expect(content).toContain('git add');
    });

    it('pre-push hook should check coverage threshold', async () => {
      await hooks.install('pre-push', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-push');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Should check coverage
      expect(content).toContain('coverage');
      expect(content).toContain('55'); // 55% threshold
    });

    it('pre-push hook should run security audit', async () => {
      await hooks.install('pre-push', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'pre-push');
      const content = await fs.readFile(hookPath, 'utf-8');

      expect(content).toContain('npm audit');
    });

    it('commit-msg hook should auto-fix common patterns', async () => {
      await hooks.install('commit-msg', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'commit-msg');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Should auto-fix "add" to "feat:"
      expect(content).toContain('add');
      expect(content).toContain('feat:');
      // Should auto-fix "fix" or "bug" patterns
      expect(content).toContain('fix');
    });

    it('commit-msg hook should check message length', async () => {
      await hooks.install('commit-msg', async () => {});
      const hookPath = path.join(tempDir, '.git', 'hooks', 'commit-msg');
      const content = await fs.readFile(hookPath, 'utf-8');

      // Should warn about long messages (72 char limit)
      expect(content).toContain('72');
    });
  });

  describe('lint-staged config', () => {
    it('should configure JS/TS files for linting', async () => {
      await hooks.setupLintStaged();
      const configPath = path.join(tempDir, '.lintstagedrc.json');
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config['*.{js,jsx,ts,tsx}']).toContain('prettier --write');
      expect(config['*.{js,jsx,ts,tsx}']).toContain('eslint --fix');
    });

    it('should configure JSON/MD/YAML files', async () => {
      await hooks.setupLintStaged();
      const configPath = path.join(tempDir, '.lintstagedrc.json');
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config['*.{json,md,yml,yaml}']).toBeDefined();
      expect(config['*.{json,md,yml,yaml}']).toContain('prettier --write');
    });
  });
});
