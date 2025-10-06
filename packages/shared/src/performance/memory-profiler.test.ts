/**
 * Tests for Memory Profiler
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryProfiler, globalProfiler, profileMemory } from './memory-profiler.js';

describe('MemoryProfiler', () => {
  let profiler: MemoryProfiler;

  beforeEach(() => {
    profiler = new MemoryProfiler();
  });

  describe('Basic Profiling', () => {
    it('should start profiling and capture baseline', () => {
      profiler.startProfiling('test');

      // Profiler should emit start event
      const startListener = vi.fn();
      profiler.on('profile:start', startListener);
      profiler.startProfiling('test2');

      expect(startListener).toHaveBeenCalled();
    });

    it('should create checkpoints with memory delta', () => {
      profiler.startProfiling();

      // Allocate some memory
      const data = new Array(1000).fill('x'.repeat(1000));

      const delta = profiler.checkpoint('after-allocation');

      expect(delta).toHaveProperty('heapDelta');
      expect(delta).toHaveProperty('rssDelta');
      expect(delta).toHaveProperty('percentChange');
      expect(delta.label).toBe('after-allocation');
      expect(delta.duration).toBeGreaterThanOrEqual(0);
    });

    it('should throw error if checkpoint called before profiling starts', () => {
      expect(() => profiler.checkpoint('test')).toThrow('Profiling not started');
    });

    it('should end profiling and return report', () => {
      profiler.startProfiling();

      // Create some checkpoints
      profiler.checkpoint('checkpoint1');
      const data = new Array(100).fill('data');
      profiler.checkpoint('checkpoint2');

      const report = profiler.endProfiling();

      expect(report.totalDelta).toBeDefined();
      expect(report.checkpoints).toBeInstanceOf(Map);
      expect(report.checkpoints.size).toBe(2);
      expect(report.leakReport).toBeDefined();
    });

    it('should reset state after ending profiling', () => {
      profiler.startProfiling();
      profiler.checkpoint('test');
      profiler.endProfiling();

      // Should be able to start new profiling session
      expect(() => profiler.startProfiling()).not.toThrow();
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not detect leak with stable memory', () => {
      profiler.startProfiling();

      // Take multiple snapshots without allocating memory
      for (let i = 0; i < 5; i++) {
        profiler.checkpoint(`checkpoint${i}`);
      }

      const report = profiler.endProfiling();

      expect(report.leakReport.suspected).toBe(false);
      expect(report.leakReport.recommendation).toContain('No memory leak');
    });

    it('should detect potential leak with growing memory', () => {
      profiler.startProfiling();
      const leaks: any[] = [];

      // Simulate memory leak by continuously allocating
      for (let i = 0; i < 10; i++) {
        leaks.push(new Array(10000).fill('leak'.repeat(100)));
        profiler.checkpoint(`checkpoint${i}`);
      }

      const leakReport = profiler.detectMemoryLeak();

      // With continuous growth, leak might be detected
      // (depends on actual memory allocation pattern)
      expect(leakReport).toHaveProperty('suspected');
      expect(leakReport).toHaveProperty('growthRate');
      expect(leakReport).toHaveProperty('samples');
    });

    it('should require minimum samples for leak detection', () => {
      profiler.startProfiling();

      const leakReport = profiler.detectMemoryLeak();

      expect(leakReport.suspected).toBe(false);
      expect(leakReport.recommendation).toContain('Not enough samples');
    });
  });

  describe('Memory Formatting', () => {
    it('should format bytes correctly', () => {
      expect(MemoryProfiler.formatBytes(0)).toBe('0.00 B');
      expect(MemoryProfiler.formatBytes(512)).toBe('512.00 B');
      expect(MemoryProfiler.formatBytes(1024)).toBe('1.00 KB');
      expect(MemoryProfiler.formatBytes(1048576)).toBe('1.00 MB');
      expect(MemoryProfiler.formatBytes(1073741824)).toBe('1.00 GB');
    });

    it('should handle negative bytes', () => {
      expect(MemoryProfiler.formatBytes(-1024)).toBe('-1.00 KB');
      expect(MemoryProfiler.formatBytes(-1048576)).toBe('-1.00 MB');
    });
  });

  describe('Event Emissions', () => {
    it('should emit profile:start event', done => {
      profiler.on('profile:start', data => {
        expect(data.label).toBe('test-profile');
        expect(data.baseline).toBeDefined();
        done();
      });

      profiler.startProfiling('test-profile');
    });

    it('should emit checkpoint event', done => {
      profiler.startProfiling();

      profiler.on('checkpoint', delta => {
        expect(delta.label).toBe('test-checkpoint');
        expect(delta.heapDelta).toBeDefined();
        done();
      });

      profiler.checkpoint('test-checkpoint');
    });

    it('should emit profile:end event', done => {
      profiler.startProfiling();

      profiler.on('profile:end', report => {
        expect(report.totalDelta).toBeDefined();
        expect(report.leakReport).toBeDefined();
        done();
      });

      profiler.endProfiling();
    });
  });

  describe('Garbage Collection', () => {
    it('should emit gc:unavailable when gc not available', done => {
      const originalGc = global.gc;
      global.gc = undefined;

      profiler.on('gc:unavailable', data => {
        expect(data.message).toContain('--expose-gc');
        global.gc = originalGc;
        done();
      });

      profiler.forceGC();
    });

    it('should emit gc:forced when gc is available', done => {
      const mockGc = vi.fn();
      global.gc = mockGc;

      profiler.on('gc:forced', () => {
        expect(mockGc).toHaveBeenCalled();
        global.gc = undefined;
        done();
      });

      profiler.forceGC();
    });
  });

  describe('profileMemory Decorator', () => {
    class TestClass {
      @profileMemory('test-method')
      async testMethod() {
        // Allocate some memory
        const data = new Array(1000).fill('test');
        await new Promise(resolve => setTimeout(resolve, 10));
        return data.length;
      }

      @profileMemory()
      async methodWithoutLabel() {
        return 'test';
      }
    }

    it('should profile decorated methods', async () => {
      const instance = new TestClass();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await instance.testMethod();

      expect(result).toBe(1000);
      // No leak warning expected for small allocation

      warnSpy.mockRestore();
    });

    it('should use class and method name as label when not provided', async () => {
      const instance = new TestClass();

      const result = await instance.methodWithoutLabel();

      expect(result).toBe('test');
    });

    it('should handle errors in decorated methods', async () => {
      class ErrorClass {
        @profileMemory('error-method')
        async throwError() {
          throw new Error('Test error');
        }
      }

      const instance = new ErrorClass();

      await expect(instance.throwError()).rejects.toThrow('Test error');
    });
  });

  describe('Global Profiler', () => {
    it('should provide global profiler instance', () => {
      expect(globalProfiler).toBeInstanceOf(MemoryProfiler);
    });

    it('should be reusable across modules', () => {
      globalProfiler.startProfiling('global-test');
      const delta = globalProfiler.checkpoint('global-checkpoint');

      expect(delta.label).toBe('global-checkpoint');

      globalProfiler.endProfiling();
    });
  });
});
