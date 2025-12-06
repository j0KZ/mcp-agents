/**
 * Tests for Tool Usage Tracker (Phase 5.4: Metrics and Telemetry)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ToolUsageTracker,
  createTrackerWithRegistry,
} from '../src/telemetry/index.js';

describe('ToolUsageTracker', () => {
  let tracker: ToolUsageTracker;

  beforeEach(() => {
    tracker = new ToolUsageTracker();
  });

  describe('track()', () => {
    it('should track a successful tool call', () => {
      tracker.track('review_file', 100, true);

      const metrics = tracker.getMetrics('review_file');
      expect(metrics).toBeDefined();
      expect(metrics?.callCount).toBe(1);
      expect(metrics?.avgExecutionTime).toBe(100);
      expect(metrics?.successRate).toBe(1);
    });

    it('should track a failed tool call', () => {
      tracker.track('review_file', 50, false);

      const metrics = tracker.getMetrics('review_file');
      expect(metrics).toBeDefined();
      expect(metrics?.callCount).toBe(1);
      expect(metrics?.successRate).toBe(0);
    });

    it('should accumulate multiple calls', () => {
      tracker.track('review_file', 100, true);
      tracker.track('review_file', 200, true);
      tracker.track('review_file', 150, false);

      const metrics = tracker.getMetrics('review_file');
      expect(metrics?.callCount).toBe(3);
      expect(metrics?.avgExecutionTime).toBe(150); // (100+200+150)/3
      expect(metrics?.successRate).toBeCloseTo(0.667, 2); // 2/3
    });

    it('should track multiple tools independently', () => {
      tracker.track('review_file', 100, true);
      tracker.track('generate_tests', 200, true);

      const reviewMetrics = tracker.getMetrics('review_file');
      const testMetrics = tracker.getMetrics('generate_tests');

      expect(reviewMetrics?.callCount).toBe(1);
      expect(testMetrics?.callCount).toBe(1);
      expect(reviewMetrics?.avgExecutionTime).toBe(100);
      expect(testMetrics?.avgExecutionTime).toBe(200);
    });

    it('should update lastCalled timestamp', () => {
      const before = new Date();
      tracker.track('review_file', 100, true);
      const after = new Date();

      const metrics = tracker.getMetrics('review_file');
      expect(metrics?.lastCalled).toBeDefined();
      expect(metrics?.lastCalled!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(metrics?.lastCalled!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getMetrics()', () => {
    it('should return undefined for untracked tool', () => {
      const metrics = tracker.getMetrics('unknown_tool');
      expect(metrics).toBeUndefined();
    });

    it('should return correct metrics structure', () => {
      tracker.track('review_file', 100, true);

      const metrics = tracker.getMetrics('review_file');
      expect(metrics).toHaveProperty('toolName');
      expect(metrics).toHaveProperty('callCount');
      expect(metrics).toHaveProperty('avgExecutionTime');
      expect(metrics).toHaveProperty('lastCalled');
      expect(metrics).toHaveProperty('successRate');
    });
  });

  describe('getAllMetrics()', () => {
    it('should return empty array when no tools tracked', () => {
      const metrics = tracker.getAllMetrics();
      expect(metrics).toEqual([]);
    });

    it('should return all tracked tools', () => {
      tracker.track('review_file', 100, true);
      tracker.track('generate_tests', 200, true);
      tracker.track('scan_security', 150, true);

      const metrics = tracker.getAllMetrics();
      expect(metrics.length).toBe(3);

      const toolNames = metrics.map((m) => m.toolName);
      expect(toolNames).toContain('review_file');
      expect(toolNames).toContain('generate_tests');
      expect(toolNames).toContain('scan_security');
    });
  });

  describe('getFrequencyReport()', () => {
    it('should categorize tools by call frequency', () => {
      // High frequency (10+ calls)
      for (let i = 0; i < 15; i++) {
        tracker.track('review_file', 100, true);
      }

      // Medium frequency (3-9 calls)
      for (let i = 0; i < 5; i++) {
        tracker.track('generate_tests', 100, true);
      }

      // Low frequency (1-2 calls)
      tracker.track('design_api', 100, true);

      const report = tracker.getFrequencyReport();

      expect(report.highFrequency.length).toBe(1);
      expect(report.highFrequency[0].toolName).toBe('review_file');

      expect(report.mediumFrequency.length).toBe(1);
      expect(report.mediumFrequency[0].toolName).toBe('generate_tests');

      expect(report.lowFrequency.length).toBe(1);
      expect(report.lowFrequency[0].toolName).toBe('design_api');
    });

    it('should identify unused tools from registered list', () => {
      tracker.track('review_file', 100, true);

      const report = tracker.getFrequencyReport([
        'review_file',
        'generate_tests',
        'scan_security',
      ]);

      expect(report.unused).toContain('generate_tests');
      expect(report.unused).toContain('scan_security');
      expect(report.unused).not.toContain('review_file');
    });

    it('should generate recommendations for frequency mismatches', () => {
      tracker.registerTool('review_file', 'low', 'smart-reviewer');

      // Simulate high usage of a low-frequency tool
      for (let i = 0; i < 15; i++) {
        tracker.track('review_file', 100, true);
      }

      const report = tracker.getFrequencyReport();

      expect(report.recommendations.length).toBeGreaterThan(0);
      const rec = report.recommendations.find((r) => r.toolName === 'review_file');
      expect(rec).toBeDefined();
      expect(rec?.suggestedFrequency).toBe('high');
    });
  });

  describe('registerTool()', () => {
    it('should register tool frequency and server', () => {
      tracker.registerTool('review_file', 'high', 'smart-reviewer');
      tracker.track('review_file', 100, true);

      const serverUsage = tracker.getServerUsage();
      expect(serverUsage.length).toBe(1);
      expect(serverUsage[0].server).toBe('smart-reviewer');
    });
  });

  describe('getServerUsage()', () => {
    it('should return empty array when no tools registered', () => {
      tracker.track('review_file', 100, true);
      const usage = tracker.getServerUsage();
      expect(usage).toEqual([]);
    });

    it('should aggregate usage by server', () => {
      tracker.registerTool('review_file', 'high', 'smart-reviewer');
      tracker.registerTool('batch_review', 'high', 'smart-reviewer');
      tracker.registerTool('generate_tests', 'high', 'test-generator');

      tracker.track('review_file', 100, true);
      tracker.track('review_file', 150, true);
      tracker.track('batch_review', 200, true);
      tracker.track('generate_tests', 300, true);

      const usage = tracker.getServerUsage();

      const reviewerUsage = usage.find((u) => u.server === 'smart-reviewer');
      expect(reviewerUsage).toBeDefined();
      expect(reviewerUsage?.totalCalls).toBe(3);
      expect(reviewerUsage?.mostUsedTool).toBe('review_file');

      const testGenUsage = usage.find((u) => u.server === 'test-generator');
      expect(testGenUsage).toBeDefined();
      expect(testGenUsage?.totalCalls).toBe(1);
    });

    it('should calculate error rate correctly', () => {
      tracker.registerTool('review_file', 'high', 'smart-reviewer');

      tracker.track('review_file', 100, true);
      tracker.track('review_file', 100, false);

      const usage = tracker.getServerUsage();
      expect(usage[0].errorRate).toBe(0.5);
    });
  });

  describe('getSessionSummary()', () => {
    it('should return session summary', () => {
      tracker.registerTool('review_file', 'high', 'smart-reviewer');
      tracker.track('review_file', 100, true);
      tracker.track('review_file', 200, true);

      const summary = tracker.getSessionSummary();

      expect(summary.totalToolCalls).toBe(2);
      expect(summary.uniqueToolsUsed).toBe(1);
      expect(summary.totalExecutionTime).toBe(300);
      expect(summary.overallSuccessRate).toBe(1);
      expect(summary.topTools.length).toBe(1);
    });

    it('should include session start and end times', () => {
      const summary = tracker.getSessionSummary();

      expect(summary.sessionStart).toBeInstanceOf(Date);
      expect(summary.sessionEnd).toBeInstanceOf(Date);
      expect(summary.sessionEnd.getTime()).toBeGreaterThanOrEqual(
        summary.sessionStart.getTime()
      );
    });

    it('should return top 5 tools sorted by call count', () => {
      for (let i = 0; i < 6; i++) {
        tracker.track(`tool_${i}`, 100, true);
        // Add extra calls to some tools
        for (let j = 0; j < i; j++) {
          tracker.track(`tool_${i}`, 100, true);
        }
      }

      const summary = tracker.getSessionSummary();

      expect(summary.topTools.length).toBe(5);
      // Most called tool should be first
      expect(summary.topTools[0].toolName).toBe('tool_5');
    });
  });

  describe('reset()', () => {
    it('should clear all tracking data', () => {
      tracker.track('review_file', 100, true);
      tracker.reset();

      const metrics = tracker.getAllMetrics();
      expect(metrics).toEqual([]);
    });

    it('should reset session start time', () => {
      const oldSummary = tracker.getSessionSummary();
      tracker.reset();
      const newSummary = tracker.getSessionSummary();

      expect(newSummary.sessionStart.getTime()).toBeGreaterThanOrEqual(
        oldSummary.sessionStart.getTime()
      );
    });
  });

  describe('export()', () => {
    it('should export session data', () => {
      tracker.registerTool('review_file', 'high', 'smart-reviewer');
      tracker.track('review_file', 100, true);

      const exported = tracker.export();

      expect(exported).toHaveProperty('sessionStart');
      expect(exported).toHaveProperty('metrics');
      expect(exported).toHaveProperty('serverUsage');
      expect(exported.metrics.length).toBe(1);
    });
  });
});

describe('createTrackerWithRegistry()', () => {
  it('should create tracker with pre-registered tools', () => {
    const registry = [
      { name: 'review_file', frequency: 'high' as const, server: 'smart-reviewer' as const },
      { name: 'generate_tests', frequency: 'high' as const, server: 'test-generator' as const },
    ];

    const tracker = createTrackerWithRegistry(registry);

    tracker.track('review_file', 100, true);
    tracker.track('generate_tests', 200, true);

    const serverUsage = tracker.getServerUsage();
    expect(serverUsage.length).toBe(2);
  });
});
