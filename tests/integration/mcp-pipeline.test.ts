/**
 * Integration tests for MCP Pipeline
 * Tests inter-MCP communication and workflow execution
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MCPPipeline, MCPClient } from '@j0kz/shared';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe.skip('MCP Pipeline Integration', () => {
  let tempDir: string;
  let testFile: string;

  beforeAll(async () => {
    // Create temp directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-integration-'));

    // Create a test TypeScript file
    testFile = path.join(tempDir, 'test.ts');
    await fs.writeFile(
      testFile,
      `
      export class Calculator {
        add(a: number, b: number): number {
          return a + b;
        }

        subtract(a: number, b: number): number {
          return a - b;
        }

        multiply(a: number, b: number): number {
          return a * b;
        }

        divide(a: number, b: number): number {
          if (b === 0) {
            throw new Error('Division by zero');
          }
          return a / b;
        }
      }
    `
    );
  });

  afterAll(async () => {
    // Cleanup
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('Sequential Pipeline Execution', () => {
    it('should execute tools in sequence', async () => {
      const pipeline = new MCPPipeline();

      // Step 1: Review code
      pipeline.addStep({
        name: 'review',
        mcp: 'smart-reviewer',
        action: 'review_file',
        params: {
          filePath: testFile,
          config: { severity: 'moderate' },
        },
      });

      // Step 2: Generate tests (depends on review)
      pipeline.addStep({
        name: 'test-gen',
        mcp: 'test-generator',
        action: 'generate_tests',
        params: {
          sourceFile: testFile,
          config: { framework: 'vitest' },
        },
        dependsOn: ['review'],
      });

      // Step 3: Security scan (depends on review)
      pipeline.addStep({
        name: 'security',
        mcp: 'security-scanner',
        action: 'scan_file',
        params: {
          filePath: testFile,
        },
        dependsOn: ['review'],
      });

      const result = await pipeline.execute();

      expect(result.success).toBe(true);
      expect(result.results).toBeDefined();
      expect(result.results).toHaveLength(3);
      expect(result.metadata.executionOrder).toEqual(['review', 'test-gen', 'security']);
    });

    it('should handle step failures gracefully', async () => {
      const pipeline = new MCPPipeline();

      // Add a step that will fail
      pipeline.addStep({
        name: 'failing-step',
        mcp: 'smart-reviewer',
        action: 'review_file',
        params: {
          filePath: '/nonexistent/file.ts',
        },
      });

      // Add dependent step
      pipeline.addStep({
        name: 'dependent',
        mcp: 'test-generator',
        action: 'generate_tests',
        params: {
          sourceFile: testFile,
        },
        dependsOn: ['failing-step'],
      });

      const result = await pipeline.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('failing-step');
      expect(result.metadata.failedStep).toBe('failing-step');
    });

    it('should respect dependency order', async () => {
      const pipeline = new MCPPipeline();
      const executionOrder: string[] = [];

      // Override execute to track order
      const originalExecute = pipeline.execute.bind(pipeline);
      pipeline.execute = async function () {
        // Track execution order through step callbacks
        this.steps.forEach(step => {
          const originalAction = step.action;
          step.action = async function () {
            executionOrder.push(step.name);
            return { success: true };
          };
        });
        return originalExecute();
      };

      pipeline.addStep({
        name: 'step-c',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['step-a', 'step-b'],
      });

      pipeline.addStep({
        name: 'step-a',
        mcp: 'tool',
        action: 'action',
        params: {},
      });

      pipeline.addStep({
        name: 'step-b',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['step-a'],
      });

      await pipeline.execute();

      expect(executionOrder).toEqual(['step-a', 'step-b', 'step-c']);
    });
  });

  describe('Parallel Pipeline Execution', () => {
    it('should execute independent steps in parallel', async () => {
      const pipeline = new MCPPipeline({ parallel: true });

      const startTimes: Record<string, number> = {};
      const endTimes: Record<string, number> = {};

      // Add independent steps
      ['review', 'security', 'architecture'].forEach(name => {
        pipeline.addStep({
          name,
          mcp: `${name}-tool`,
          action: 'analyze',
          params: { filePath: testFile },
          execute: async () => {
            startTimes[name] = Date.now();
            await new Promise(resolve => setTimeout(resolve, 100));
            endTimes[name] = Date.now();
            return { success: true };
          },
        });
      });

      await pipeline.execute();

      // Check that steps ran in parallel (overlapping execution times)
      const names = Object.keys(startTimes);
      const maxStart = Math.max(...names.map(n => startTimes[n]));
      const minEnd = Math.min(...names.map(n => endTimes[n]));

      expect(maxStart).toBeLessThan(minEnd); // Indicates overlap
    });

    it('should handle mixed parallel and sequential execution', async () => {
      const pipeline = new MCPPipeline({ parallel: true });

      const executionLog: string[] = [];

      // Group 1: Parallel
      pipeline.addStep({
        name: 'parallel-1',
        mcp: 'tool',
        action: 'action',
        params: {},
        execute: async () => {
          executionLog.push('parallel-1-start');
          await new Promise(resolve => setTimeout(resolve, 50));
          executionLog.push('parallel-1-end');
          return { success: true };
        },
      });

      pipeline.addStep({
        name: 'parallel-2',
        mcp: 'tool',
        action: 'action',
        params: {},
        execute: async () => {
          executionLog.push('parallel-2-start');
          await new Promise(resolve => setTimeout(resolve, 50));
          executionLog.push('parallel-2-end');
          return { success: true };
        },
      });

      // Sequential step depending on parallel steps
      pipeline.addStep({
        name: 'sequential',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['parallel-1', 'parallel-2'],
        execute: async () => {
          executionLog.push('sequential');
          return { success: true };
        },
      });

      await pipeline.execute();

      // Verify parallel execution
      expect(executionLog.indexOf('parallel-2-start')).toBeLessThan(
        executionLog.indexOf('parallel-1-end')
      );

      // Verify sequential waits for both
      expect(executionLog.indexOf('sequential')).toBeGreaterThan(
        Math.max(executionLog.indexOf('parallel-1-end'), executionLog.indexOf('parallel-2-end'))
      );
    });
  });

  describe('Data Passing Between Steps', () => {
    it('should pass data between steps', async () => {
      const pipeline = new MCPPipeline();

      pipeline.addStep({
        name: 'producer',
        mcp: 'tool',
        action: 'produce',
        params: {},
        execute: async () => ({
          success: true,
          data: { value: 42, message: 'test' },
        }),
      });

      pipeline.addStep({
        name: 'consumer',
        mcp: 'tool',
        action: 'consume',
        params: {},
        dependsOn: ['producer'],
        transform: previousResults => ({
          value: previousResults.producer.data.value * 2,
        }),
        execute: async function () {
          expect(this.params.value).toBe(84);
          return { success: true };
        },
      });

      const result = await pipeline.execute();
      expect(result.success).toBe(true);
    });

    it('should aggregate results from multiple steps', async () => {
      const pipeline = new MCPPipeline();

      // Multiple analysis steps
      ['analysis-1', 'analysis-2', 'analysis-3'].forEach((name, index) => {
        pipeline.addStep({
          name,
          mcp: 'analyzer',
          action: 'analyze',
          params: {},
          execute: async () => ({
            success: true,
            data: { score: (index + 1) * 10 },
          }),
        });
      });

      // Aggregator step
      pipeline.addStep({
        name: 'aggregator',
        mcp: 'tool',
        action: 'aggregate',
        params: {},
        dependsOn: ['analysis-1', 'analysis-2', 'analysis-3'],
        transform: previousResults => {
          const scores = Object.values(previousResults).map(r => r.data.score);
          return {
            totalScore: scores.reduce((sum, s) => sum + s, 0),
            averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
          };
        },
        execute: async function () {
          expect(this.params.totalScore).toBe(60);
          expect(this.params.averageScore).toBe(20);
          return { success: true };
        },
      });

      await pipeline.execute();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should retry failed steps', async () => {
      const pipeline = new MCPPipeline({ maxRetries: 3 });
      let attempts = 0;

      pipeline.addStep({
        name: 'flaky-step',
        mcp: 'tool',
        action: 'action',
        params: {},
        execute: async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
          return { success: true };
        },
      });

      const result = await pipeline.execute();

      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should handle timeout', async () => {
      const pipeline = new MCPPipeline({ timeout: 100 });

      pipeline.addStep({
        name: 'slow-step',
        mcp: 'tool',
        action: 'action',
        params: {},
        execute: async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          return { success: true };
        },
      });

      const result = await pipeline.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should provide detailed error information', async () => {
      const pipeline = new MCPPipeline();

      pipeline.addStep({
        name: 'error-step',
        mcp: 'tool',
        action: 'action',
        params: { testParam: 'value' },
        execute: async () => {
          throw new Error('Detailed error message');
        },
      });

      const result = await pipeline.execute();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Detailed error message');
      expect(result.metadata.failedStep).toBe('error-step');
      expect(result.metadata.failedParams).toEqual({ testParam: 'value' });
    });
  });

  describe('Pipeline Composition', () => {
    it('should support nested pipelines', async () => {
      // Create sub-pipeline
      const subPipeline = new MCPPipeline();
      subPipeline.addStep({
        name: 'sub-step-1',
        mcp: 'tool',
        action: 'action',
        params: {},
      });
      subPipeline.addStep({
        name: 'sub-step-2',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['sub-step-1'],
      });

      // Create main pipeline
      const mainPipeline = new MCPPipeline();
      mainPipeline.addStep({
        name: 'main-step-1',
        mcp: 'tool',
        action: 'action',
        params: {},
      });
      mainPipeline.addSubPipeline('sub-pipeline', subPipeline, {
        dependsOn: ['main-step-1'],
      });
      mainPipeline.addStep({
        name: 'main-step-2',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['sub-pipeline'],
      });

      const result = await mainPipeline.execute();

      expect(result.success).toBe(true);
      expect(result.metadata.executionOrder).toEqual([
        'main-step-1',
        'sub-step-1',
        'sub-step-2',
        'main-step-2',
      ]);
    });

    it('should support conditional execution', async () => {
      const pipeline = new MCPPipeline();
      const executedSteps: string[] = [];

      pipeline.addStep({
        name: 'condition-check',
        mcp: 'tool',
        action: 'check',
        params: {},
        execute: async () => {
          executedSteps.push('condition-check');
          return { success: true, data: { shouldContinue: false } };
        },
      });

      pipeline.addStep({
        name: 'conditional-step',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['condition-check'],
        condition: previousResults => previousResults['condition-check'].data.shouldContinue,
        execute: async () => {
          executedSteps.push('conditional-step');
          return { success: true };
        },
      });

      pipeline.addStep({
        name: 'always-run',
        mcp: 'tool',
        action: 'action',
        params: {},
        dependsOn: ['condition-check'],
        execute: async () => {
          executedSteps.push('always-run');
          return { success: true };
        },
      });

      await pipeline.execute();

      expect(executedSteps).toEqual(['condition-check', 'always-run']);
      expect(executedSteps).not.toContain('conditional-step');
    });
  });
});
