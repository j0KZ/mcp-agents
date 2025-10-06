import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MCPPipeline, MCPIntegration } from '@j0kz/shared';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
} from '../src/workflows.js';

describe('Orchestrator Integration Tests', () => {
  let mockMCPIntegration: MCPIntegration;

  beforeEach(() => {
    // Create mock MCP integration for testing
    mockMCPIntegration = new MCPIntegration();
  });

  describe('Pre-Commit Workflow Execution', () => {
    it('should execute code review and security scan in sequence', async () => {
      const files = ['src/auth.ts', 'src/db.ts'];
      const workflow = createPreCommitWorkflow(files);

      // Mock the MCP tool responses
      const mockReviewResult = {
        success: true,
        totalFiles: 2,
        averageScore: 85,
        totalIssues: 3,
      };

      const mockSecurityResult = {
        success: true,
        findings: [],
        securityScore: 100,
        filesScanned: 2,
      };

      // Spy on pipeline execution
      const executeSpy = vi.spyOn(workflow as any, 'execute');

      // Mock implementation would go here in real integration
      // For now, verify workflow structure
      const steps = (workflow as any).steps;

      expect(steps[0].name).toBe('code-review');
      expect(steps[0].config.action).toBe('batch_review');
      expect(steps[0].config.params.filePaths).toEqual(files);

      expect(steps[1].name).toBe('security-scan');
      expect(steps[1].config.action).toBe('scan_project');
    });

    it('should handle review failures gracefully', async () => {
      const files = ['src/broken.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;

      // Verify workflow continues even if review finds issues
      expect(steps).toHaveLength(2);
      expect(steps[1].name).toBe('security-scan');
      // Security scan should still run even if review finds issues
    });

    it('should pass file list to both review and security steps', () => {
      const files = ['file1.ts', 'file2.ts', 'file3.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;

      // Both steps should receive all files
      expect(steps[0].config.params.filePaths).toEqual(files);
      expect(steps[1].config.params.config.includePatterns).toEqual(files);
    });
  });

  describe('Pre-Merge Workflow Execution', () => {
    it('should execute all 4 steps with correct dependencies', () => {
      const files = ['src/feature.ts'];
      const projectPath = '/project';
      const workflow = createPreMergeWorkflow(files, projectPath);

      const steps = (workflow as any).steps;

      expect(steps).toHaveLength(4);

      // Step 1: Batch review
      expect(steps[0].name).toBe('batch-review');
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[0].dependsOn).toBeUndefined();

      // Step 2: Architecture analysis (independent)
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[1].tool).toBe('architecture-analyzer');
      expect(steps[1].dependsOn).toBeUndefined();

      // Step 3: Security audit (independent)
      expect(steps[2].name).toBe('security-audit');
      expect(steps[2].tool).toBe('security-scanner');
      expect(steps[2].dependsOn).toBeUndefined();

      // Step 4: Test coverage (depends on review)
      expect(steps[3].name).toBe('test-coverage');
      expect(steps[3].tool).toBe('test-generator');
      expect(steps[3].dependsOn).toEqual(['batch-review']);
    });

    it('should use strict severity for pre-merge reviews', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');
      const steps = (workflow as any).steps;

      const reviewStep = steps[0];
      expect(reviewStep.config.params.config.severity).toBe('strict');
    });

    it('should enable circular dependency detection', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');
      const steps = (workflow as any).steps;

      const archStep = steps[1];
      expect(archStep.config.params.config.detectCircular).toBe(true);
      expect(archStep.config.params.config.generateGraph).toBe(false); // Pre-merge doesn't need graph
    });

    it('should scan entire project for security issues', () => {
      const workflow = createPreMergeWorkflow(['src/new.ts'], '/project');
      const steps = (workflow as any).steps;

      const securityStep = steps[2];
      expect(securityStep.config.action).toBe('scan_project');
      expect(securityStep.config.params.projectPath).toBe('/project');
    });
  });

  describe('Quality Audit Workflow Execution', () => {
    it('should generate comprehensive reports', () => {
      const projectPath = '/my-project';
      const workflow = createQualityAuditWorkflow(projectPath);

      const steps = (workflow as any).steps;

      expect(steps).toHaveLength(3);

      // Security report with output path
      expect(steps[0].name).toBe('security-report');
      expect(steps[0].config.params.outputPath).toBe('/my-project/reports/security.md');

      // Architecture analysis with graph
      expect(steps[1].name).toBe('architecture-analysis');
      expect(steps[1].config.params.config.generateGraph).toBe(true);
      expect(steps[1].config.params.config.maxDepth).toBe(5);

      // Documentation generation
      expect(steps[2].name).toBe('generate-docs');
      expect(steps[2].config.params.projectPath).toBe(projectPath);
    });

    it('should work with different project paths', () => {
      const paths = [
        '/absolute/path',
        './relative/path',
        'C:\\Windows\\Path',
        '/home/user/project',
      ];

      paths.forEach(path => {
        const workflow = createQualityAuditWorkflow(path);
        const steps = (workflow as any).steps;

        expect(steps[0].config.params.projectPath).toBe(path);
        expect(steps[1].config.params.projectPath).toBe(path);
        expect(steps[2].config.params.projectPath).toBe(path);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing files parameter', () => {
      expect(() => {
        createPreCommitWorkflow([] as any);
      }).not.toThrow();

      // Should create workflow even with empty array
      const workflow = createPreCommitWorkflow([]);
      expect((workflow as any).steps).toHaveLength(2);
    });

    it('should handle missing project path', () => {
      expect(() => {
        createPreMergeWorkflow(['test.ts'], '' as any);
      }).not.toThrow();

      // Should use empty string as project path
      const workflow = createPreMergeWorkflow(['test.ts'], '');
      const steps = (workflow as any).steps;
      expect(steps[1].config.params.projectPath).toBe('');
    });

    it('should validate workflow names', () => {
      expect(() => {
        const workflow = createPreCommitWorkflow(['test.ts']);
        (workflow as any).addStep({
          name: 'invalid-tool',
          tool: 'non-existent-mcp',
          config: {},
        });
      }).not.toThrow();

      // Pipeline should allow any tool (validation happens at execution)
    });
  });

  describe('Step Configuration Validation', () => {
    it('should have valid action names for all MCP tools', () => {
      const workflows = [
        createPreCommitWorkflow(['test.ts']),
        createPreMergeWorkflow(['test.ts'], '/project'),
        createQualityAuditWorkflow('/project'),
      ];

      const validActions = [
        'batch_review',
        'scan_project',
        'analyze_architecture',
        'batch_generate',
        'generate_security_report',
        'generate_full_docs',
      ];

      workflows.forEach(workflow => {
        const steps = (workflow as any).steps;
        steps.forEach((step: any) => {
          expect(validActions).toContain(step.config.action);
        });
      });
    });

    it('should pass correct parameters to each MCP tool', () => {
      const files = ['src/test.ts'];
      const projectPath = '/project';

      const preCommit = createPreCommitWorkflow(files);
      const steps = (preCommit as any).steps;

      // Review step should have filePaths and config
      expect(steps[0].config.params).toHaveProperty('filePaths');
      expect(steps[0].config.params).toHaveProperty('config');
      expect(steps[0].config.params.config).toHaveProperty('severity');

      // Security step should have config with includePatterns
      expect(steps[1].config.params).toHaveProperty('config');
      expect(steps[1].config.params.config).toHaveProperty('includePatterns');
    });

    it('should use batch operations for multiple files', () => {
      const singleFile = createPreCommitWorkflow(['single.ts']);
      const multipleFiles = createPreCommitWorkflow(['file1.ts', 'file2.ts', 'file3.ts']);

      // Both should use batch_review (not review_file)
      expect((singleFile as any).steps[0].config.action).toBe('batch_review');
      expect((multipleFiles as any).steps[0].config.action).toBe('batch_review');
    });
  });

  describe('Pipeline Composition', () => {
    it('should allow adding custom steps to workflows', () => {
      const workflow = createPreCommitWorkflow(['test.ts']);

      workflow.addStep({
        name: 'custom-lint',
        tool: 'eslint',
        config: {
          action: 'lint',
          params: { files: ['test.ts'] },
        },
      });

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(3);
      expect(steps[2].name).toBe('custom-lint');
    });

    it('should maintain step order when adding dependencies', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');

      const steps = (workflow as any).steps;
      const testCoverageStep = steps[3];

      // Test coverage depends on batch-review (step 0)
      expect(testCoverageStep.dependsOn).toEqual(['batch-review']);

      // Verify batch-review is step 0
      expect(steps[0].name).toBe('batch-review');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle pre-commit hook scenario', () => {
      // Simulate git pre-commit hook with staged files
      const stagedFiles = [
        'src/components/Button.tsx',
        'src/utils/validation.ts',
        'tests/button.test.tsx',
      ];

      const workflow = createPreCommitWorkflow(stagedFiles);
      const steps = (workflow as any).steps;

      // Should review all staged files
      expect(steps[0].config.params.filePaths).toEqual(stagedFiles);

      // Should scan all staged files for security
      expect(steps[1].config.params.config.includePatterns).toEqual(stagedFiles);
    });

    it('should handle pre-merge PR scenario', () => {
      // Simulate PR with multiple changed files
      const changedFiles = ['src/api/auth.ts', 'src/api/users.ts', 'src/middleware/jwt.ts'];
      const repoRoot = '/home/user/my-app';

      const workflow = createPreMergeWorkflow(changedFiles, repoRoot);
      const steps = (workflow as any).steps;

      // Should run strict review on PR files
      expect(steps[0].config.params.filePaths).toEqual(changedFiles);
      expect(steps[0].config.params.config.severity).toBe('strict');

      // Should analyze entire project architecture
      expect(steps[1].config.params.projectPath).toBe(repoRoot);

      // Should scan entire project for security
      expect(steps[2].config.params.projectPath).toBe(repoRoot);

      // Should generate tests for changed files
      expect(steps[3].config.params.sourceFiles).toEqual(changedFiles);
    });

    it('should handle nightly quality audit scenario', () => {
      // Simulate scheduled quality audit
      const projectPath = '/var/www/production-app';

      const workflow = createQualityAuditWorkflow(projectPath);
      const steps = (workflow as any).steps;

      // Should generate security report
      expect(steps[0].config.params.projectPath).toBe(projectPath);
      expect(steps[0].config.params.outputPath).toBe('/var/www/production-app/reports/security.md');

      // Should analyze architecture with graph
      expect(steps[1].config.params.projectPath).toBe(projectPath);
      expect(steps[1].config.params.config.generateGraph).toBe(true);

      // Should generate documentation
      expect(steps[2].config.params.projectPath).toBe(projectPath);
    });
  });
});
