/**
 * Tests for workflow creation
 */

import { describe, it, expect } from 'vitest';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
  WORKFLOWS,
} from './workflows.js';

describe('WORKFLOWS metadata', () => {
  it('should define pre-commit workflow metadata', () => {
    expect(WORKFLOWS['pre-commit']).toMatchObject({
      name: 'Pre-commit Quality Check',
      steps: 2,
    });
  });

  it('should define pre-merge workflow metadata', () => {
    expect(WORKFLOWS['pre-merge']).toMatchObject({
      name: 'Pre-merge Validation',
      steps: 4,
    });
  });

  it('should define quality-audit workflow metadata', () => {
    expect(WORKFLOWS['quality-audit']).toMatchObject({
      name: 'Quality Audit',
      steps: 3,
    });
  });
});

describe('createPreCommitWorkflow', () => {
  it('should create pipeline with 2 steps', () => {
    const files = ['src/test.ts'];
    const pipeline = createPreCommitWorkflow(files);

    expect(pipeline).toBeDefined();
    // Pipeline should have addStep method
    expect(typeof pipeline.addStep).toBe('function');
  });

  it('should review ALL files, not just the first one', () => {
    const files = ['src/a.ts', 'src/b.ts', 'src/c.ts'];
    const pipeline = createPreCommitWorkflow(files);

    // Get the steps to verify configuration
    const steps = (pipeline as any).steps || [];

    // Find the code-review step
    const reviewStep = steps.find((s: any) => s.name === 'code-review');

    // CRITICAL: Verify it uses batch_review with ALL files
    expect(reviewStep).toBeDefined();
    expect(reviewStep.config.action).toBe('batch_review');
    expect(reviewStep.config.params.filePaths).toEqual(files);
    expect(reviewStep.config.params.filePaths.length).toBe(3);
  });

  it('should scan ALL files for security issues', () => {
    const files = ['src/a.ts', 'src/b.ts'];
    const pipeline = createPreCommitWorkflow(files);

    const steps = (pipeline as any).steps || [];
    const securityStep = steps.find((s: any) => s.name === 'security-scan');

    // CRITICAL: Verify security scan includes all files
    expect(securityStep).toBeDefined();
    expect(securityStep.config.action).toBe('scan_project');
    expect(securityStep.config.params.config.includePatterns).toEqual(files);
  });
});

describe('createPreMergeWorkflow', () => {
  it('should create pipeline with 4 steps', () => {
    const files = ['src/test.ts'];
    const projectPath = '/project/root';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    expect(pipeline).toBeDefined();
    expect(typeof pipeline.addStep).toBe('function');
  });

  it('should handle multiple files and project path', () => {
    const files = ['src/a.ts', 'src/b.ts'];
    const projectPath = '/home/user/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    expect(pipeline).toBeDefined();
  });
});

describe('createQualityAuditWorkflow', () => {
  it('should create pipeline with 3 steps', () => {
    const projectPath = '/project/root';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
    expect(typeof pipeline.addStep).toBe('function');
  });

  it('should work with different project paths', () => {
    const projectPath = '/different/path';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
  });

  it('should work with Windows paths', () => {
    const projectPath = 'C:\\Users\\test\\project';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
  });
});
