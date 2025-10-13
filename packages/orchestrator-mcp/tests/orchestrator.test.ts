import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPPipeline } from '@j0kz/shared';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
  createWorkflow,
} from '../src/workflows.js';

describe('Orchestrator Workflows', () => {
  describe('createPreCommitWorkflow', () => {
    it('should create workflow with correct steps', () => {
      const files = ['test.ts'];
      const workflow = createPreCommitWorkflow(files);

      expect(workflow).toBeInstanceOf(MCPPipeline);

      // Verify steps were added (internal check)
      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[1].name).toBe('security-scan');
      expect(steps[1].tool).toBe('security-scanner');
    });

    it('should configure code-review step correctly', () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      const reviewStep = steps[0];

      // FIXED: Now uses batch_review for ALL files
      expect(reviewStep.config.action).toBe('batch_review');
      expect(reviewStep.config.params.filePaths).toEqual(files);
      expect(reviewStep.config.params.config.severity).toBe('moderate');
    });

    it('should configure security-scan step correctly', () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      const securityStep = steps[1];

      // FIXED: Now uses scan_project with file patterns
      expect(securityStep.config.action).toBe('scan_project');
      expect(securityStep.config.params.config.includePatterns).toEqual(files);
    });
  });

  describe('createPreMergeWorkflow', () => {
    it('should create workflow with 4 steps', () => {
      const files = ['test1.ts', 'test2.ts'];
      const workflow = createPreMergeWorkflow(files, '/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe('batch-review');
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[2].name).toBe('security-audit');
      expect(steps[3].name).toBe('test-coverage');
    });

    it('should configure batch-review with strict severity', () => {
      const files = ['test.ts'];
      const workflow = createPreMergeWorkflow(files, '/project');

      const steps = (workflow as any).steps;
      const reviewStep = steps[0];

      expect(reviewStep.tool).toBe('smart-reviewer');
      expect(reviewStep.config.action).toBe('batch_review');
      expect(reviewStep.config.params.config.severity).toBe('strict');
      expect(reviewStep.config.params.filePaths).toEqual(files);
    });

    it('should configure architecture-analysis with circular detection', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');

      const steps = (workflow as any).steps;
      const archStep = steps[1];

      expect(archStep.tool).toBe('architecture-analyzer');
      expect(archStep.config.params.projectPath).toBe('/project');
      expect(archStep.config.params.config.detectCircular).toBe(true);
    });

    it('should make test-coverage depend on batch-review', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');

      const steps = (workflow as any).steps;
      const testStep = steps[3];

      expect(testStep.name).toBe('test-coverage');
      expect(testStep.dependsOn).toEqual(['batch-review']);
    });
  });

  describe('createQualityAuditWorkflow', () => {
    it('should create workflow with 3 steps', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('security-report');
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[2].name).toBe('generate-docs');
    });

    it('should configure security-report with output path', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      const reportStep = steps[0];

      expect(reportStep.tool).toBe('security-scanner');
      expect(reportStep.config.action).toBe('generate_security_report');
      expect(reportStep.config.params.outputPath).toBe('/project/reports/security.md');
    });

    it('should configure architecture with graph generation', () => {
      const workflow = createQualityAuditWorkflow('/project');

      const steps = (workflow as any).steps;
      const archStep = steps[1];

      expect(archStep.config.params.config.generateGraph).toBe(true);
      expect(archStep.config.params.config.maxDepth).toBe(5);
    });
  });

  describe('createWorkflow', () => {
    it('should create pre-commit workflow', () => {
      const workflow = createWorkflow('pre-commit', ['test.ts'], '.');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
    });

    it('should create pre-merge workflow', () => {
      const workflow = createWorkflow('pre-merge', ['test.ts'], '.');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
      expect(steps[0].name).toBe('batch-review');
    });

    it('should create quality-audit workflow', () => {
      const workflow = createWorkflow('quality-audit', [], '/project');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
      expect(steps[0].name).toBe('security-report');
    });

    it('should throw error for unknown workflow', () => {
      expect(() => {
        createWorkflow('unknown' as any, [], '.');
      }).toThrow('Unknown workflow name'); // MCPError message from ERROR_CODES
    });
  });

  describe('Workflow Integration', () => {
    it('should have correct tool names for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const preMerge = createPreMergeWorkflow(['test.ts'], '.');
      const quality = createQualityAuditWorkflow('.');

      const allSteps = [
        ...(preCommit as any).steps,
        ...(preMerge as any).steps,
        ...(quality as any).steps,
      ];

      const validMCPs = [
        'smart-reviewer',
        'security-scanner',
        'test-generator',
        'architecture-analyzer',
        'doc-generator',
      ];

      allSteps.forEach((step: any) => {
        expect(validMCPs).toContain(step.tool);
      });
    });

    it('should have action field for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const steps = (preCommit as any).steps;

      steps.forEach((step: any) => {
        expect(step.config.action).toBeDefined();
        expect(typeof step.config.action).toBe('string');
      });
    });

    it('should have params for all steps', () => {
      const preCommit = createPreCommitWorkflow(['test.ts']);
      const steps = (preCommit as any).steps;

      steps.forEach((step: any) => {
        expect(step.config.params).toBeDefined();
        expect(typeof step.config.params).toBe('object');
      });
    });
  });

  describe('Ambiguity Detection & Smart Workflow Selection', () => {
    describe('selectWorkflowByFocus', () => {
      it('should select pre-commit for security focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('security', ['file.ts']);
        expect(workflow).toBe('pre-commit');
      });

      it('should select pre-merge for quality focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('quality', ['file.ts']);
        expect(workflow).toBe('pre-merge');
      });

      it('should select quality-audit for performance focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('performance', ['file.ts']);
        expect(workflow).toBe('quality-audit');
      });

      it('should select pre-merge for comprehensive focus', async () => {
        const { selectWorkflowByFocus } = await import('../src/helpers/workflow-selector.js');
        const workflow = selectWorkflowByFocus('comprehensive', ['file.ts']);
        expect(workflow).toBe('pre-merge');
      });
    });

    describe('isValidFocus', () => {
      it('should validate correct focus values', async () => {
        const { isValidFocus } = await import('../src/helpers/workflow-selector.js');
        expect(isValidFocus('security')).toBe(true);
        expect(isValidFocus('quality')).toBe(true);
        expect(isValidFocus('performance')).toBe(true);
        expect(isValidFocus('comprehensive')).toBe(true);
      });

      it('should reject invalid focus values', async () => {
        const { isValidFocus } = await import('../src/helpers/workflow-selector.js');
        expect(isValidFocus('invalid')).toBe(false);
        expect(isValidFocus('sec')).toBe(false);
        expect(isValidFocus('')).toBe(false);
      });
    });

    describe('getClarificationOptions', () => {
      it('should return 4 labeled options', async () => {
        const { getClarificationOptions } = await import('../src/helpers/workflow-selector.js');
        const options = getClarificationOptions();

        expect(options).toHaveLength(4);
        expect(options[0]).toHaveProperty('value', 'security');
        expect(options[0]).toHaveProperty('label', 'a) Security Analysis');
        expect(options[0]).toHaveProperty('description');
        expect(options[1].label).toContain('b)');
        expect(options[2].label).toContain('c)');
        expect(options[3].label).toContain('d)');
      });
    });
  });
});
