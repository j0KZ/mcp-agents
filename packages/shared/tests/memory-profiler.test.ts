/**
 * Tests for memory-profiler.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  MemoryProfiler,
  globalProfiler,
  profileMemory,
} from '../src/performance/memory-profiler.js';

describe('MemoryProfiler', () => {
  let profiler: MemoryProfiler;

  beforeEach(() => {
    profiler = new MemoryProfiler();
  });

  describe('startProfiling', () => {
    it('should start profiling with default label', () => {
      const emitSpy = vi.spyOn(profiler, 'emit');

      profiler.startProfiling();

      expect(emitSpy).toHaveBeenCalledWith('profile:start', expect.any(Object));
    });

    it('should start profiling with custom label', () => {
      const emitSpy = vi.spyOn(profiler, 'emit');

      profiler.startProfiling('custom-label');

      expect(emitSpy).toHaveBeenCalledWith('profile:start', {
        label: 'custom-label',
        baseline: expect.any(Object),
      });
    });

    it('should create baseline snapshot', () => {
      profiler.startProfiling();

      // Can create checkpoint after starting
      const delta = profiler.checkpoint('test');
      expect(delta.label).toBe('test');
    });
  });

  describe('checkpoint', () => {
    it('should throw error if profiling not started', () => {
      expect(() => profiler.checkpoint('test')).toThrow('Profiling not started');
    });

    it('should return memory delta', () => {
      profiler.startProfiling();

      const delta = profiler.checkpoint('test-checkpoint');

      expect(delta.label).toBe('test-checkpoint');
      expect(typeof delta.heapDelta).toBe('number');
      expect(typeof delta.rssDelta).toBe('number');
      expect(typeof delta.percentChange).toBe('number');
      expect(typeof delta.duration).toBe('number');
    });

    it('should emit checkpoint event', () => {
      profiler.startProfiling();
      const emitSpy = vi.spyOn(profiler, 'emit');

      profiler.checkpoint('test');

      expect(emitSpy).toHaveBeenCalledWith('checkpoint', expect.any(Object));
    });

    it('should store multiple checkpoints', () => {
      profiler.startProfiling();

      profiler.checkpoint('first');
      profiler.checkpoint('second');
      profiler.checkpoint('third');

      const report = profiler.endProfiling();
      expect(report.checkpoints.size).toBe(3);
    });
  });

  describe('endProfiling', () => {
    it('should throw error if profiling not started', () => {
      expect(() => profiler.endProfiling()).toThrow('Profiling not started');
    });

    it('should return complete report', () => {
      profiler.startProfiling();
      profiler.checkpoint('mid');

      const report = profiler.endProfiling();

      expect(report.totalDelta).toBeDefined();
      expect(report.totalDelta.label).toBe('total');
      expect(report.checkpoints).toBeInstanceOf(Map);
      expect(report.leakReport).toBeDefined();
    });

    it('should emit profile:end event', () => {
      profiler.startProfiling();
      const emitSpy = vi.spyOn(profiler, 'emit');

      profiler.endProfiling();

      expect(emitSpy).toHaveBeenCalledWith('profile:end', expect.any(Object));
    });

    it('should reset state after ending', () => {
      profiler.startProfiling();
      profiler.endProfiling();

      // Should throw because state was reset
      expect(() => profiler.checkpoint('test')).toThrow('Profiling not started');
    });
  });

  describe('detectMemoryLeak', () => {
    it('should return no leak for insufficient samples', () => {
      profiler.startProfiling();

      const report = profiler.detectMemoryLeak();

      expect(report.suspected).toBe(false);
      expect(report.recommendation).toContain('Not enough samples');
    });

    it('should analyze memory growth patterns', () => {
      profiler.startProfiling();

      // Create multiple checkpoints
      for (let i = 0; i < 5; i++) {
        profiler.checkpoint(`checkpoint-${i}`);
      }

      const report = profiler.detectMemoryLeak();

      expect(typeof report.suspected).toBe('boolean');
      expect(typeof report.growthRate).toBe('number');
      expect(Array.isArray(report.samples)).toBe(true);
      expect(typeof report.recommendation).toBe('string');
    });
  });

  describe('forceGC', () => {
    it('should emit gc:unavailable when gc not available', () => {
      const emitSpy = vi.spyOn(profiler, 'emit');

      profiler.forceGC();

      // In test environment, gc is not exposed
      expect(emitSpy).toHaveBeenCalledWith('gc:unavailable', expect.any(Object));
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      profiler.startProfiling();
      profiler.checkpoint('test');

      profiler.reset();

      expect(() => profiler.checkpoint('after-reset')).toThrow('Profiling not started');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(MemoryProfiler.formatBytes(0)).toBe('0.00 B');
      expect(MemoryProfiler.formatBytes(512)).toBe('512.00 B');
      expect(MemoryProfiler.formatBytes(1024)).toBe('1.00 KB');
      expect(MemoryProfiler.formatBytes(1536)).toBe('1.50 KB');
      expect(MemoryProfiler.formatBytes(1048576)).toBe('1.00 MB');
      expect(MemoryProfiler.formatBytes(1073741824)).toBe('1.00 GB');
    });

    it('should handle negative values', () => {
      expect(MemoryProfiler.formatBytes(-1024)).toBe('-1.00 KB');
      expect(MemoryProfiler.formatBytes(-1048576)).toBe('-1.00 MB');
    });
  });
});

describe('globalProfiler', () => {
  it('should be a MemoryProfiler instance', () => {
    expect(globalProfiler).toBeInstanceOf(MemoryProfiler);
  });
});

describe('profileMemory decorator', () => {
  it('should create a decorator function', () => {
    const decorator = profileMemory('test-label');
    expect(typeof decorator).toBe('function');
  });

  it('should wrap method with memory profiling', async () => {
    // Create a class and manually apply the decorator
    class TestClass {
      async testMethod() {
        return 'result';
      }
    }

    // Manually apply decorator
    const descriptor: PropertyDescriptor = {
      value: TestClass.prototype.testMethod,
      writable: true,
      enumerable: false,
      configurable: true,
    };

    const decorator = profileMemory('test-method');
    const decorated = decorator(TestClass.prototype, 'testMethod', descriptor);

    // Replace the method
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TestClass.prototype.testMethod = decorated!.value;

    const instance = new TestClass();
    const result = await instance.testMethod();

    expect(result).toBe('result');
  });

  it('should use default label when not provided', async () => {
    class TestClass {
      async anotherMethod() {
        return 42;
      }
    }

    // Manually apply decorator
    const descriptor: PropertyDescriptor = {
      value: TestClass.prototype.anotherMethod,
      writable: true,
      enumerable: false,
      configurable: true,
    };

    const decorator = profileMemory();
    const decorated = decorator(TestClass.prototype, 'anotherMethod', descriptor);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TestClass.prototype.anotherMethod = decorated!.value;

    const instance = new TestClass();
    const result = await instance.anotherMethod();

    expect(result).toBe(42);
  });

  it('should rethrow errors from wrapped method', async () => {
    class TestClass {
      async errorMethod() {
        throw new Error('Test error');
      }
    }

    // Manually apply decorator
    const descriptor: PropertyDescriptor = {
      value: TestClass.prototype.errorMethod,
      writable: true,
      enumerable: false,
      configurable: true,
    };

    const decorator = profileMemory('error-method');
    const decorated = decorator(TestClass.prototype, 'errorMethod', descriptor);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    TestClass.prototype.errorMethod = decorated!.value;

    const instance = new TestClass();
    await expect(instance.errorMethod()).rejects.toThrow('Test error');
  });
});
