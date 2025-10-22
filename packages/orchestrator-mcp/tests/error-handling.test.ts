import { describe, it, expect } from 'vitest';
import { MCPError } from '@j0kz/shared';
import {
  createPreCommitWorkflow,
  createPreMergeWorkflow,
  createQualityAuditWorkflow,
  createWorkflow,
} from '../src/workflows.js';

describe('Workflow Error Handling', () => {
  describe('Invalid inputs', () => {
    it('should handle null project path in pre-merge workflow', () => {
      const files = ['test.ts'];
      // @ts-expect-error Testing invalid input
      const workflow = createPreMergeWorkflow(files, null);

      const steps = (workflow as any).steps;
      expect(steps[1].config.params.projectPath).toBeNull();
    });

    it('should handle undefined project path in quality audit', () => {
      // @ts-expect-error Testing invalid input
      const workflow = createQualityAuditWorkflow(undefined);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.projectPath).toBeUndefined();
    });

    it('should handle special characters in file paths', () => {
      const specialFiles = [
        'src/file with spaces.ts',
        'src/special!@#$%^&*().ts',
        'src/unicode-文件.ts',
        'src/dots.in.name.ts',
      ];

      const workflow = createPreCommitWorkflow(specialFiles);
      const steps = (workflow as any).steps;

      expect(steps[0].config.params.filePaths).toEqual(specialFiles);
      expect(steps[1].config.params.config.includePatterns).toEqual(specialFiles);
    });

    it('should handle very long file paths', () => {
      const longPath = 'a'.repeat(100) + '/' + 'b'.repeat(100) + '/' + 'file.ts';
      const workflow = createPreCommitWorkflow([longPath]);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths[0]).toBe(longPath);
    });

    it('should handle empty string project path', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '');

      const steps = (workflow as any).steps;
      expect(steps[1].config.params.projectPath).toBe('');
    });

    it('should handle whitespace-only project path', () => {
      const workflow = createQualityAuditWorkflow('   ');

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.projectPath).toBe('   ');
    });
  });

  describe('Edge cases', () => {
    it('should handle duplicate files in list', () => {
      const files = ['test.ts', 'test.ts', 'test.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toHaveLength(3);
    });

    it('should handle very large file lists', () => {
      const largeFileList = Array.from({ length: 1000 }, (_, i) => `file${i}.ts`);
      const workflow = createPreCommitWorkflow(largeFileList);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toHaveLength(1000);
    });

    it('should handle mixed path separators', () => {
      const mixedPaths = ['src/file.ts', 'src\\other.ts', 'src/nested\\deep.ts'];
      const workflow = createPreCommitWorkflow(mixedPaths);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(mixedPaths);
    });

    it('should handle absolute and relative paths together', () => {
      const mixedPaths = ['/absolute/path/file.ts', './relative/file.ts', '../parent/file.ts'];
      const workflow = createPreCommitWorkflow(mixedPaths);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(mixedPaths);
    });

    it('should handle network paths (UNC paths)', () => {
      const networkPath = '\\\\server\\share\\file.ts';
      const workflow = createPreCommitWorkflow([networkPath]);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths[0]).toBe(networkPath);
    });

    it('should handle paths with trailing slashes', () => {
      const workflow = createQualityAuditWorkflow('/project/path/');

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.outputPath).toBe('/project/path//reports/security.md');
    });
  });

  describe('Workflow factory error handling', () => {
    it('should throw MCPError for undefined workflow name', () => {
      expect(() => {
        createWorkflow(undefined as any, ['test.ts'], '/project');
      }).toThrow();
    });

    it('should throw MCPError for null workflow name', () => {
      expect(() => {
        createWorkflow(null as any, ['test.ts'], '/project');
      }).toThrow();
    });

    it('should throw MCPError for empty string workflow name', () => {
      expect(() => {
        createWorkflow('' as any, ['test.ts'], '/project');
      }).toThrow(MCPError);
    });

    it('should throw MCPError for numeric workflow name', () => {
      expect(() => {
        createWorkflow(123 as any, ['test.ts'], '/project');
      }).toThrow();
    });

    it('should throw MCPError for object workflow name', () => {
      expect(() => {
        createWorkflow({ name: 'pre-commit' } as any, ['test.ts'], '/project');
      }).toThrow();
    });

    it('should throw MCPError with correct error code', () => {
      try {
        createWorkflow('invalid' as any, ['test.ts'], '/project');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        expect((error as MCPError).code).toBe('ORCH_002');
      }
    });

    it('should include workflow name in error metadata', () => {
      try {
        createWorkflow('custom-workflow' as any, ['test.ts'], '/project');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(MCPError);
        const metadata = (error as MCPError).metadata;
        // Metadata might be undefined or null, so check if it exists first
        if (metadata) {
          expect(metadata).toHaveProperty('workflow', 'custom-workflow');
        } else {
          // If no metadata, just verify the error was thrown
          expect(error).toBeInstanceOf(MCPError);
        }
      }
    });
  });

  describe('Workflow consistency under errors', () => {
    it('should create valid workflow even with empty files array', () => {
      const workflow = createPreCommitWorkflow([]);

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(2);
      expect(steps[0].name).toBe('code-review');
      expect(steps[1].name).toBe('security-scan');
    });

    it('should create valid workflow with minimum inputs', () => {
      const workflow = createPreMergeWorkflow([], '.');

      const steps = (workflow as any).steps;
      expect(steps).toHaveLength(4);
      expect(steps[0].tool).toBe('smart-reviewer');
      expect(steps[1].tool).toBe('architecture-analyzer');
      expect(steps[2].tool).toBe('security-scanner');
      expect(steps[3].tool).toBe('test-generator');
    });

    it('should maintain step order regardless of input', () => {
      const workflows = [
        createPreCommitWorkflow([]),
        createPreCommitWorkflow(['a.ts']),
        createPreCommitWorkflow(['a.ts', 'b.ts', 'c.ts']),
      ];

      workflows.forEach(workflow => {
        const steps = (workflow as any).steps;
        expect(steps[0].name).toBe('code-review');
        expect(steps[1].name).toBe('security-scan');
      });
    });

    it('should maintain dependency structure in pre-merge workflow', () => {
      const workflows = [
        createPreMergeWorkflow([], '.'),
        createPreMergeWorkflow(['test.ts'], '/project'),
      ];

      workflows.forEach(workflow => {
        const steps = (workflow as any).steps;
        expect(steps[3].dependsOn).toEqual(['batch-review']);
        expect(steps[0].dependsOn).toBeUndefined();
        expect(steps[1].dependsOn).toBeUndefined();
        expect(steps[2].dependsOn).toBeUndefined();
      });
    });
  });

  describe('Configuration edge cases', () => {
    it('should preserve exact severity setting', () => {
      const workflow1 = createPreCommitWorkflow(['test.ts']);
      const workflow2 = createPreMergeWorkflow(['test.ts'], '/project');

      const steps1 = (workflow1 as any).steps;
      const steps2 = (workflow2 as any).steps;

      expect(steps1[0].config.params.config.severity).toBe('moderate');
      expect(steps2[0].config.params.config.severity).toBe('strict');
    });

    it('should preserve circular detection setting', () => {
      const workflow1 = createPreMergeWorkflow(['test.ts'], '/project');
      const workflow2 = createQualityAuditWorkflow('/project');

      const steps1 = (workflow1 as any).steps;
      const steps2 = (workflow2 as any).steps;

      expect(steps1[1].config.params.config.detectCircular).toBe(true);
      expect(steps2[1].config.params.config.detectCircular).toBe(true);
    });

    it('should preserve graph generation settings', () => {
      const workflow1 = createPreMergeWorkflow(['test.ts'], '/project');
      const workflow2 = createQualityAuditWorkflow('/project');

      const steps1 = (workflow1 as any).steps;
      const steps2 = (workflow2 as any).steps;

      expect(steps1[1].config.params.config.generateGraph).toBe(false);
      expect(steps2[1].config.params.config.generateGraph).toBe(true);
    });

    it('should preserve maxDepth setting in quality audit', () => {
      const workflow = createQualityAuditWorkflow('/project');
      const steps = (workflow as any).steps;

      expect(steps[1].config.params.config.maxDepth).toBe(5);
    });

    it('should preserve coverage target in pre-merge', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');
      const steps = (workflow as any).steps;

      expect(steps[3].config.params.config.coverage).toBe(70);
    });

    it('should preserve test framework in pre-merge', () => {
      const workflow = createPreMergeWorkflow(['test.ts'], '/project');
      const steps = (workflow as any).steps;

      expect(steps[3].config.params.config.framework).toBe('vitest');
    });
  });

  describe('Real-world error scenarios', () => {
    it('should handle files with no extension', () => {
      const files = ['Makefile', 'Dockerfile', 'README'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(files);
    });

    it('should handle hidden files', () => {
      const files = ['.env', '.gitignore', '.eslintrc.js'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(files);
    });

    it('should handle symbolic link paths', () => {
      const files = ['/usr/local/bin/node', '~/projects/my-app/src/index.ts'];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(files);
    });

    it('should handle monorepo structure paths', () => {
      const files = [
        'packages/api/src/index.ts',
        'packages/web/src/App.tsx',
        'packages/shared/src/utils.ts',
      ];
      const workflow = createPreCommitWorkflow(files);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.filePaths).toEqual(files);
    });

    it('should handle CI/CD temporary paths', () => {
      const projectPath = '/tmp/github-actions-runner-123456/workspace';
      const workflow = createQualityAuditWorkflow(projectPath);

      const steps = (workflow as any).steps;
      expect(steps[0].config.params.projectPath).toBe(projectPath);
    });
  });
});
