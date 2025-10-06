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

    // Verify it has 4 steps
    const steps = (pipeline as any).steps || [];
    expect(steps.length).toBe(4);
  });

  it('should handle multiple files and project path', () => {
    const files = ['src/a.ts', 'src/b.ts'];
    const projectPath = '/home/user/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    expect(pipeline).toBeDefined();

    // Verify batch review uses all files
    const steps = (pipeline as any).steps || [];
    const batchReview = steps.find((s: any) => s.name === 'batch-review');
    expect(batchReview.config.params.filePaths).toEqual(files);
  });

  it('should use strict severity for pre-merge', () => {
    const files = ['src/critical.ts'];
    const projectPath = '/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    const steps = (pipeline as any).steps || [];
    const batchReview = steps.find((s: any) => s.name === 'batch-review');

    expect(batchReview.config.params.config.severity).toBe('strict');
  });

  it('should include architecture analysis step', () => {
    const files = ['src/test.ts'];
    const projectPath = '/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    const steps = (pipeline as any).steps || [];
    const archStep = steps.find((s: any) => s.name === 'architecture-analysis');

    expect(archStep).toBeDefined();
    expect(archStep.tool).toBe('architecture-analyzer');
    expect(archStep.config.params.projectPath).toBe(projectPath);
  });

  it('should have test-coverage step depend on batch-review', () => {
    const files = ['src/test.ts'];
    const projectPath = '/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    const steps = (pipeline as any).steps || [];
    const testCoverage = steps.find((s: any) => s.name === 'test-coverage');

    expect(testCoverage).toBeDefined();
    expect(testCoverage.dependsOn).toEqual(['batch-review']);
  });
});

describe('createQualityAuditWorkflow', () => {
  it('should create pipeline with 3 steps', () => {
    const projectPath = '/project/root';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
    expect(typeof pipeline.addStep).toBe('function');

    // Verify it has 3 steps
    const steps = (pipeline as any).steps || [];
    expect(steps.length).toBe(3);
  });

  it('should work with different project paths', () => {
    const projectPath = '/different/path';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();

    // Verify all steps use the correct projectPath
    const steps = (pipeline as any).steps || [];
    steps.forEach((step: any) => {
      if (step.config?.params?.projectPath) {
        expect(step.config.params.projectPath).toBe(projectPath);
      }
    });
  });

  it('should work with Windows paths', () => {
    const projectPath = 'C:\\Users\\test\\project';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
  });

  it('should include security report generation', () => {
    const projectPath = '/project';
    const pipeline = createQualityAuditWorkflow(projectPath);

    const steps = (pipeline as any).steps || [];
    const securityReport = steps.find((s: any) => s.name === 'security-report');

    expect(securityReport).toBeDefined();
    expect(securityReport.tool).toBe('security-scanner');
    expect(securityReport.config.action).toBe('generate_security_report');
  });

  it('should include architecture analysis', () => {
    const projectPath = '/project';
    const pipeline = createQualityAuditWorkflow(projectPath);

    const steps = (pipeline as any).steps || [];
    const archAnalysis = steps.find((s: any) => s.name === 'architecture-analysis');

    expect(archAnalysis).toBeDefined();
    expect(archAnalysis.tool).toBe('architecture-analyzer');
    expect(archAnalysis.config.params.config.generateGraph).toBe(true);
  });

  it('should include documentation generation', () => {
    const projectPath = '/project';
    const pipeline = createQualityAuditWorkflow(projectPath);

    const steps = (pipeline as any).steps || [];
    const docGen = steps.find((s: any) => s.name === 'generate-docs');

    expect(docGen).toBeDefined();
    expect(docGen.tool).toBe('doc-generator');
    expect(docGen.config.action).toBe('generate_full_docs');
  });
});

describe('Edge Cases', () => {
  it('should handle empty file arrays in pre-commit', () => {
    const files: string[] = [];
    const pipeline = createPreCommitWorkflow(files);

    expect(pipeline).toBeDefined();
    const steps = (pipeline as any).steps || [];
    expect(steps.length).toBe(2);
  });

  it('should handle empty file arrays in pre-merge', () => {
    const files: string[] = [];
    const projectPath = '/project';
    const pipeline = createPreMergeWorkflow(files, projectPath);

    expect(pipeline).toBeDefined();
    const steps = (pipeline as any).steps || [];
    expect(steps.length).toBe(4);
  });

  it('should handle relative project paths', () => {
    const projectPath = './relative/path';
    const pipeline = createQualityAuditWorkflow(projectPath);

    expect(pipeline).toBeDefined();
  });

  it('should handle very long file lists', () => {
    const files = Array(1000)
      .fill(null)
      .map((_, i) => `src/file${i}.ts`);
    const pipeline = createPreCommitWorkflow(files);

    const steps = (pipeline as any).steps || [];
    const reviewStep = steps.find((s: any) => s.name === 'code-review');
    expect(reviewStep.config.params.filePaths.length).toBe(1000);
  });
});
