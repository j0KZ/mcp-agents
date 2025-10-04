/**
 * Tests for detector modules
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { detectProject, getRecommendedMCPs } from '../src/detectors/project.js';
import { detectTestFramework } from '../src/detectors/test-framework.js';
import type { ProjectInfo } from '../src/detectors/project.js';

describe('Project Detector', () => {
  it('should detect TypeScript projects', async () => {
    // This test will depend on the actual project we're in
    const project = await detectProject();
    expect(project).toBeDefined();
    expect(project.language).toBeDefined();
  });

  it('should detect package manager', async () => {
    const project = await detectProject();
    expect(project.packageManager).toMatch(/npm|yarn|pnpm|bun/);
  });

  it('should recommend MCPs for React projects', () => {
    const project: ProjectInfo = {
      language: 'typescript',
      framework: 'react',
      packageManager: 'npm',
      hasTests: true
    };

    const recommendations = getRecommendedMCPs(project);
    expect(recommendations).toContain('smart-reviewer');
    expect(recommendations).toContain('test-generator');
  });

  it('should recommend MCPs for API projects', () => {
    const project: ProjectInfo = {
      language: 'typescript',
      framework: 'express',
      packageManager: 'npm',
      hasTests: false
    };

    const recommendations = getRecommendedMCPs(project);
    expect(recommendations).toContain('api-designer');
    expect(recommendations).toContain('db-schema');
  });

  it('should always recommend smart-reviewer and security-scanner', () => {
    const project: ProjectInfo = {
      language: 'javascript',
      packageManager: 'npm',
      hasTests: false
    };

    const recommendations = getRecommendedMCPs(project);
    expect(recommendations).toContain('smart-reviewer');
    expect(recommendations).toContain('security-scanner');
  });
});

describe('Test Framework Detector', () => {
  it('should detect test framework or return null', async () => {
    const framework = await detectTestFramework();

    if (framework) {
      expect(['jest', 'vitest', 'mocha', 'ava']).toContain(framework);
    } else {
      expect(framework).toBeNull();
    }
  });
});
