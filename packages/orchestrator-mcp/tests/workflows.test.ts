import { describe, it, expect } from 'vitest';
import { MCPError } from '@j0kz/shared';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
  createWorkflow,
  WORKFLOWS,
} from '../src/workflows.js';

describe('Workflows', () => {
  describe('WORKFLOWS metadata', () => {
    it('should have correct metadata for pre-commit workflow', () => {
      expect(WORKFLOWS['pre-commit']).toEqual({
        name: 'Pre-commit Quality Check',
        description:
          'Fast quality checks for local commits - batch review and security scan of ALL changed files',
        steps: 2,
      });
    });

    it('should have correct metadata for pre-merge workflow', () => {
      expect(WORKFLOWS['pre-merge']).toEqual({
        name: 'Pre-merge Validation',
        description:
          'Comprehensive checks before merging PR - review, architecture, security, and tests',
        steps: 4,
      });
    });

    it('should have correct metadata for quality-audit workflow', () => {
      expect(WORKFLOWS['quality-audit']).toEqual({
        name: 'Quality Audit',
        description:
          'Deep analysis and reporting - security report, architecture analysis, and documentation',
        steps: 3,
      });
    });
  });

  describe('createPreCommitWorkflow', () => {
    it('should create workflow with correct steps', () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);

      // Verify code review step
      expect(steps[0].name).toBe('code-review');
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[0].config.action).toBe('batch_review');
      expect(steps[0].config.params.filePaths).toEqual(files);
      expect(steps[0].config.params.config.severity).toBe('moderate');

      // Verify security scan step
      expect(steps[1].name).toBe('security-scan');
      expect(steps[1].tool).toBe('security-scanner');
      expect(steps[1].config.action).toBe('scan_project');
      expect(steps[1].config.params.projectPath).toBe('.');
      expect(steps[1].config.params.config.includePatterns).toEqual(files);
      expect(steps[1].config.params.config.minSeverity).toBe('medium');
    });

    it('should handle single file', () => {
      const files = ['src/index.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(files);
      expect(steps[1].config.params.config.includePatterns).toEqual(files);
    });

    it('should handle multiple files', () => {
      const files = ['a.ts', 'b.ts', 'c.ts', 'd.ts', 'e.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toHaveLength(5);
      expect(steps[1].config.params.config.includePatterns).toHaveLength(5);
    });

    it('should handle empty file list', () => {
      const files: string[] = [];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual([]);
      expect(steps[1].config.params.config.includePatterns).toEqual([]);
    });

    it('should use moderate severity for reviews', () => {
      const workflow = createPreCommitWorkflow(['test.ts']);
      const steps = (workflow as any).steps;
      expect(steps[0].config.params.config.severity).toBe('moderate');
    });

    it('should scan project root directory', () => {
      const workflow = createPreCommitWorkflow(['test.ts']);
      const steps = (workflow as any).steps;
      expect(steps[1].config.params.projectPath).toBe('.');
    });
  });

  describe('createPreMergeWorkflow', () => {
    const files = ['src/feature.ts', 'src/utils.ts'];
    const projectPath = '/home/user/project';

    it('should create workflow with 4 steps', () => {
      const workflow = createPreMergeWorkflow(files, projectPath);
      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
    });

    it('should configure batch review with strict severity', () => {
      const workflow = createPreMergeWorkflow(files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps[0].name).toBe('batch-review');
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[0].config.action).toBe('batch_review');
      expect(steps[0].config.params.filePaths).toEqual(files);
      expect(steps[0].config.params.config.severity).toBe('strict');
      expect(steps[0].dependsOn).toBeUndefined();
    });

    it('should configure architecture analysis with circular detection', () => {
      const workflow = createPreMergeWorkflow(files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[1].tool).toBe('architecture-analyzer');
      expect(steps[1].config.action).toBe('analyze_architecture');
      expect(steps[1].config.params.projectPath).toBe(projectPath);
      expect(steps[1].config.params.config.detectCircular).toBe(true);
      expect(steps[1].config.params.config.generateGraph).toBe(false);
      expect(steps[1].dependsOn).toBeUndefined();
    });

    it('should configure security audit', () => {
      const workflow = createPreMergeWorkflow(files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps[2].name).toBe('security-audit');
      expect(steps[2].tool).toBe('security-scanner');
      expect(steps[2].config.action).toBe('scan_project');
      expect(steps[2].config.params.projectPath).toBe(projectPath);
      expect(steps[2].config.params.config.minSeverity).toBe('medium');
      expect(steps[2].dependsOn).toBeUndefined();
    });

    it('should configure test coverage generation depending on review', () => {
      const workflow = createPreMergeWorkflow(files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps[3].name).toBe('test-coverage');
      expect(steps[3].tool).toBe('test-generator');
      expect(steps[3].config.action).toBe('batch_generate');
      expect(steps[3].config.params.sourceFiles).toEqual(files);
      expect(steps[3].config.params.config.coverage).toBe(70);
      expect(steps[3].config.params.config.framework).toBe('vitest');
      expect(steps[3].dependsOn).toEqual(['batch-review']);
    });

    it('should handle different project paths', () => {
      const paths = ['/var/www', 'C:\\Users\\dev\\project', './relative/path'];

      paths.forEach(path => {
        const workflow = createPreMergeWorkflow(files, path);
        const steps = (workflow as any).steps;

        expect(steps[1].config.params.projectPath).toBe(path);
        expect(steps[2].config.params.projectPath).toBe(path);
      });
    });

    it('should handle Windows paths', () => {
      const windowsPath = 'C:\\Users\\dev\\project';
      const workflow = createPreMergeWorkflow(files, windowsPath);
      const steps = (workflow as any).steps;

      expect(steps[1].config.params.projectPath).toBe(windowsPath);
      expect(steps[2].config.params.projectPath).toBe(windowsPath);
    });

    it('should handle Unix paths', () => {
      const unixPath = '/home/user/project';
      const workflow = createPreMergeWorkflow(files, unixPath);
      const steps = (workflow as any).steps;

      expect(steps[1].config.params.projectPath).toBe(unixPath);
      expect(steps[2].config.params.projectPath).toBe(unixPath);
    });
  });

  describe('createQualityAuditWorkflow', () => {
    const projectPath = '/home/user/project';

    it('should create workflow with 3 steps', () => {
      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
    });

    it('should configure security report generation', () => {
      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;

      expect(steps[0].name).toBe('security-report');
      expect(steps[0].tool).toBe('security-scanner');
      expect(steps[0].config.action).toBe('generate_security_report');
      expect(steps[0].config.params.projectPath).toBe(projectPath);
      expect(steps[0].config.params.outputPath).toBe(`${projectPath}/reports/security.md`);
    });

    it('should configure architecture analysis with graph generation', () => {
      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;

      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[1].tool).toBe('architecture-analyzer');
      expect(steps[1].config.action).toBe('analyze_architecture');
      expect(steps[1].config.params.projectPath).toBe(projectPath);
      expect(steps[1].config.params.config.detectCircular).toBe(true);
      expect(steps[1].config.params.config.generateGraph).toBe(true);
      expect(steps[1].config.params.config.maxDepth).toBe(5);
    });

    it('should configure documentation generation', () => {
      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;

      expect(steps[2].name).toBe('generate-docs');
      expect(steps[2].tool).toBe('doc-generator');
      expect(steps[2].config.action).toBe('generate_full_docs');
      expect(steps[2].config.params.projectPath).toBe(projectPath);
    });

    it('should create correct output path for security report', () => {
      const paths = ['/home/user/project', 'C:\\Users\\dev\\project', './relative'];

      paths.forEach(path => {
        const workflow = createQualityAuditWorkflow(path);
        const steps = (workflow as any).steps;

        expect(steps[0].config.params.outputPath).toBe(`${path}/reports/security.md`);
      });
    });

    it('should enable deep analysis with maxDepth 5', () => {
      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;

      expect(steps[1].config.params.config.maxDepth).toBe(5);
    });
  });

  describe('createWorkflow', () => {
    const files = ['test.ts'];
    const projectPath = '/project';

    it('should create pre-commit workflow by name', () => {
      const workflow = createWorkflow('pre-commit', files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
    });

    it('should create pre-merge workflow by name', () => {
      const workflow = createWorkflow('pre-merge', files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe('batch-review');
    });

    it('should create quality-audit workflow by name', () => {
      const workflow = createWorkflow('quality-audit', files, projectPath);
      const steps = (workflow as any).steps;

      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('security-report');
    });

    it('should throw MCPError for invalid workflow name', () => {
      expect(() => {
        createWorkflow('invalid-workflow' as any, files, projectPath);
      }).toThrow(MCPError);
    });

    it('should throw MCPError with workflow name in error', () => {
      try {
        createWorkflow('bad-name' as any, files, projectPath);
        expect.fail('Should have thrown MCPError');
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        expect((error as MCPError).code).toBe('ORCH_002');
      }
    });

    it('should handle all valid workflow names', () => {
      const validNames: Array<'pre-commit' | 'pre-merge' | 'quality-audit'> = [
        'pre-commit',
        'pre-merge',
        'quality-audit',
      ];

      validNames.forEach(name => {
        expect(() => createWorkflow(name, files, projectPath)).not.toThrow();
      });
    });
  });

  describe('Workflow integration scenarios', () => {
    it('should create consistent pre-commit workflows for same files', () => {
      const files = ['a.ts', 'b.ts'];
      const workflow1 = createPreCommitWorkflow(files);
      const workflow2 = createPreCommitWorkflow(files);

      const steps1 = (workflow1 as any).steps;
      const steps2 = (workflow2 as any).steps;

      expect(steps1).toHaveLength(steps2.length);
      expect(steps1[0].config).toEqual(steps2[0].config);
      expect(steps1[1].config).toEqual(steps2[1].config);
    });

    it('should create different workflows for different file lists', () => {
      const files1 = ['a.ts'];
      const files2 = ['a.ts', 'b.ts'];

      const workflow1 = createPreCommitWorkflow(files1);
      const workflow2 = createPreCommitWorkflow(files2);

      const steps1 = (workflow1 as any).steps;
      const steps2 = (workflow2 as any).steps;

      expect(steps1[0].config.params.filePaths).not.toEqual(steps2[0].config.params.filePaths);
    });

    it('should support chaining workflows via factory function', () => {
      const files = ['src/index.ts'];
      const projectPath = '/project';

      const preCommit = createWorkflow('pre-commit', files, projectPath);
      const preMerge = createWorkflow('pre-merge', files, projectPath);
      const audit = createWorkflow('quality-audit', files, projectPath);

      expect((preCommit as any).steps).toHaveLength(2);
      expect((preMerge as any).steps).toHaveLength(4);
      expect((audit as any).steps).toHaveLength(3);
    });
  });
});
