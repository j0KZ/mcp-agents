import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { execa } from 'execa';
import { detectProject, getRecommendedMCPs, type ProjectInfo } from '../src/detectors/project.js';
import {
  detectEditor,
  detectInstalledEditors,
  getEditorConfigPath,
  type SupportedEditor,
} from '../src/detectors/editor.js';

// Mock fs-extra and execa
vi.mock('fs-extra');
vi.mock('execa');

describe('Project Detection (Real Scenarios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectProject', () => {
    it('should detect TypeScript project with package.json', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('package.json') || pathStr.endsWith('tsconfig.json');
      });

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { react: '18.0.0' },
        devDependencies: { typescript: '5.0.0' },
      });

      const info = await detectProject();

      expect(info.language).toBe('typescript');
      expect(info.framework).toBe('react');
    });

    it('should detect JavaScript project without tsconfig', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('package.json') && !pathStr.endsWith('tsconfig.json');
      });

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { express: '4.18.0' },
      });

      const info = await detectProject();

      expect(info.language).toBe('javascript');
      expect(info.framework).toBe('express');
    });

    it('should detect Next.js project over plain React', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: {
          react: '18.0.0',
          next: '14.0.0',
        },
      });

      const info = await detectProject();

      expect(info.framework).toBe('next');
    });

    it('should detect Vue project', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { vue: '3.0.0' },
      });

      const info = await detectProject();

      expect(info.framework).toBe('vue');
    });

    it('should detect Angular project', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { '@angular/core': '17.0.0' },
      });

      const info = await detectProject();

      expect(info.framework).toBe('angular');
    });

    it('should detect Svelte project', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { svelte: '4.0.0' },
      });

      const info = await detectProject();

      expect(info.framework).toBe('svelte');
    });

    it('should detect Fastify project', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { fastify: '4.0.0' },
      });

      const info = await detectProject();

      expect(info.framework).toBe('fastify');
    });

    it('should detect NestJS project', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().includes('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: { '@nestjs/core': '10.0.0' },
      });

      const info = await detectProject();

      expect(info.framework).toBe('nest');
    });

    it('should detect Python project with requirements.txt', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('requirements.txt') && !pathStr.endsWith('package.json');
      });

      const info = await detectProject();

      expect(info.language).toBe('python');
    });

    it('should detect pnpm package manager', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('package.json') || pathStr.endsWith('pnpm-lock.yaml');
      });

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: {},
      });

      const info = await detectProject();

      expect(info.packageManager).toBe('pnpm');
    });

    it('should detect yarn package manager', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('package.json') || pathStr.endsWith('yarn.lock');
      });

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: {},
      });

      const info = await detectProject();

      expect(info.packageManager).toBe('yarn');
    });

    it('should detect bun package manager', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) => {
        const pathStr = p.toString();
        return pathStr.endsWith('package.json') || pathStr.endsWith('bun.lockb');
      });

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: {},
      });

      const info = await detectProject();

      expect(info.packageManager).toBe('bun');
    });

    it('should default to npm when no lock file found', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().endsWith('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        dependencies: {},
      });

      const info = await detectProject();

      expect(info.packageManager).toBe('npm');
    });

    it('should detect tests from package.json scripts', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().endsWith('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        scripts: {
          test: 'vitest',
        },
        dependencies: {},
      });

      const info = await detectProject();

      expect(info.hasTests).toBe(true);
    });

    it('should detect tests from vitest dependency', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().endsWith('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        devDependencies: {
          vitest: '1.0.0',
        },
      });

      const info = await detectProject();

      expect(info.hasTests).toBe(true);
    });

    it('should detect tests from jest dependency', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().endsWith('package.json')
      );

      vi.mocked(fs.readJSON).mockResolvedValue({
        devDependencies: {
          jest: '29.0.0',
        },
      });

      const info = await detectProject();

      expect(info.hasTests).toBe(true);
    });

    it('should return unknown language when no package.json', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const info = await detectProject();

      expect(info.language).toBe('unknown');
      expect(info.hasTests).toBe(false);
    });

    it('should handle missing package.json gracefully', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);

      const info = await detectProject();

      expect(info).toHaveProperty('language');
      expect(info).toHaveProperty('packageManager');
      expect(info).toHaveProperty('hasTests');
    });

    it('should handle malformed package.json', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async (p: any) =>
        p.toString().endsWith('package.json')
      );

      vi.mocked(fs.readJSON).mockRejectedValue(new Error('Invalid JSON'));

      await expect(detectProject()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('getRecommendedMCPs', () => {
    it('should always recommend smart-reviewer and security-scanner', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('smart-reviewer');
      expect(mcps).toContain('security-scanner');
    });

    it('should always recommend architecture-analyzer', () => {
      const project: ProjectInfo = {
        language: 'javascript',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('architecture-analyzer');
    });

    it('should recommend test-generator for React projects', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        framework: 'react',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('test-generator');
    });

    it('should recommend test-generator for Next.js projects', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        framework: 'next',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('test-generator');
    });

    it('should recommend api-designer and db-schema for Express projects', () => {
      const project: ProjectInfo = {
        language: 'javascript',
        framework: 'express',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('api-designer');
      expect(mcps).toContain('db-schema');
    });

    it('should recommend api-designer and db-schema for Fastify projects', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        framework: 'fastify',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('api-designer');
      expect(mcps).toContain('db-schema');
    });

    it('should recommend api-designer and db-schema for NestJS projects', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        framework: 'nest',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('api-designer');
      expect(mcps).toContain('db-schema');
    });

    it('should recommend test-generator when hasTests is true', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        packageManager: 'npm',
        hasTests: true,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps).toContain('test-generator');
    });

    it('should not duplicate test-generator recommendation', () => {
      const project: ProjectInfo = {
        language: 'typescript',
        framework: 'react',
        packageManager: 'npm',
        hasTests: true,
      };

      const mcps = getRecommendedMCPs(project);

      const testGenCount = mcps.filter(m => m === 'test-generator').length;
      expect(testGenCount).toBe(1);
    });

    it('should return minimum 3 MCPs for any project', () => {
      const project: ProjectInfo = {
        language: 'unknown',
        packageManager: 'npm',
        hasTests: false,
      };

      const mcps = getRecommendedMCPs(project);

      expect(mcps.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Editor Detection', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('detectEditor', () => {
      it('should detect Claude Code when config directory exists', async () => {
        vi.mocked(fs.pathExists).mockResolvedValue(true);

        const editor = await detectEditor();

        expect(editor).toBe('claude-code');
      });

      it('should return null when no editor detected', async () => {
        vi.mocked(fs.pathExists).mockResolvedValue(false);
        vi.mocked(execa).mockRejectedValue(new Error('Command not found'));

        const editor = await detectEditor();

        expect(editor).toBeNull();
      });
    });

    describe('getEditorConfigPath', () => {
      it('should return correct path for Claude Code', () => {
        const configPath = getEditorConfigPath('claude-code');

        expect(configPath).toContain('.config');
        expect(configPath).toContain('claude-code');
        expect(configPath).toContain('mcp_settings.json');
      });

      it('should return correct path for Cursor', () => {
        const configPath = getEditorConfigPath('cursor');

        if (process.platform === 'win32') {
          expect(configPath).toContain('Cursor');
        } else {
          expect(configPath).toContain('.cursor');
        }
        expect(configPath).toContain('mcp_config.json');
      });

      it('should return correct path for VSCode', () => {
        const configPath = getEditorConfigPath('vscode');

        expect(configPath).toContain('.continue');
        expect(configPath).toContain('config.json');
      });

      it('should return null for invalid editor', () => {
        const configPath = getEditorConfigPath(null);

        expect(configPath).toBeNull();
      });

      it('should return null for unsupported editor', () => {
        const configPath = getEditorConfigPath('invalid' as any);

        expect(configPath).toBeNull();
      });
    });
  });
});
