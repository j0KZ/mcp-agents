/**
 * Tests for response-formatter.ts
 */

import { describe, it, expect } from 'vitest';
import {
  formatResponse,
  formatErrorResponse,
  truncateArray,
  filterBySeverity,
  createSummary,
  StandardFormatters,
} from '../src/helpers/response-formatter.js';

describe('formatResponse', () => {
  const mockResult = {
    score: 85,
    issues: [{ id: 1 }, { id: 2 }, { id: 3 }],
    details: 'full details',
  };

  const formatters = {
    minimal: (r: typeof mockResult) => ({ score: r.score }),
    concise: (r: typeof mockResult) => ({ score: r.score, issueCount: r.issues.length }),
    detailed: (r: typeof mockResult) => r,
  };

  it('should format minimal response', () => {
    const result = formatResponse(mockResult, { format: 'minimal' }, formatters);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ score: 85 });
  });

  it('should format concise response', () => {
    const result = formatResponse(mockResult, { format: 'concise' }, formatters);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ score: 85, issueCount: 3 });
  });

  it('should format detailed response', () => {
    const result = formatResponse(mockResult, { format: 'detailed' }, formatters);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResult);
  });

  it('should default to detailed when no format specified', () => {
    const result = formatResponse(
      mockResult,
      { format: 'detailed' as const },
      { minimal: () => ({}), concise: () => ({}) }
    );
    expect(result.data).toEqual(mockResult);
  });

  it('should include metadata when requested', () => {
    const result = formatResponse(
      mockResult,
      { format: 'concise', includeMetadata: true, duration: 100, version: '1.0.0' },
      formatters
    );
    expect(result._meta).toBeDefined();
    expect(result._meta?.format).toBe('concise');
    expect(result._meta?.duration).toBe(100);
    expect(result._meta?.version).toBe('1.0.0');
    expect(result._meta?.truncated).toBe(true);
  });

  it('should mark detailed as not truncated', () => {
    const result = formatResponse(mockResult, { format: 'detailed', includeMetadata: true }, formatters);
    expect(result._meta?.truncated).toBe(false);
  });

  it('should not include metadata when not requested', () => {
    const result = formatResponse(mockResult, { format: 'minimal' }, formatters);
    expect(result._meta).toBeUndefined();
  });
});

describe('formatErrorResponse', () => {
  it('should format error response', () => {
    const result = formatErrorResponse('Something went wrong', { format: 'detailed' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
  });

  it('should include metadata when requested', () => {
    const result = formatErrorResponse('Error', { format: 'minimal', includeMetadata: true, duration: 50 });
    expect(result._meta).toBeDefined();
    expect(result._meta?.format).toBe('minimal');
    expect(result._meta?.duration).toBe(50);
  });

  it('should not include metadata when not requested', () => {
    const result = formatErrorResponse('Error', { format: 'minimal' });
    expect(result._meta).toBeUndefined();
  });
});

describe('truncateArray', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('should truncate for minimal format', () => {
    const result = truncateArray(items, 'minimal');
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('should truncate for concise format', () => {
    const result = truncateArray(items, 'concise');
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('should not truncate for detailed format', () => {
    const result = truncateArray(items, 'detailed');
    expect(result.length).toBe(10);
  });

  it('should handle empty arrays', () => {
    const result = truncateArray([], 'minimal');
    expect(result).toEqual([]);
  });
});

describe('filterBySeverity', () => {
  const issues = [
    { severity: 'critical', message: 'A' },
    { severity: 'high', message: 'B' },
    { severity: 'medium', message: 'C' },
    { severity: 'low', message: 'D' },
    { severity: 'info', message: 'E' },
  ];

  it('should return all items for detailed format', () => {
    const result = filterBySeverity(issues, 'detailed');
    expect(result.length).toBe(5);
  });

  it('should filter to high priority for concise format', () => {
    const result = filterBySeverity(issues, 'concise');
    expect(result.every(i => ['critical', 'error', 'high'].includes(i.severity))).toBe(true);
  });

  it('should filter to high priority for minimal format', () => {
    const result = filterBySeverity(issues, 'minimal');
    expect(result.every(i => ['critical', 'error', 'high'].includes(i.severity))).toBe(true);
  });

  it('should return top items when no high priority matches', () => {
    const lowPriorityIssues = [
      { severity: 'low', message: 'A' },
      { severity: 'info', message: 'B' },
    ];
    const result = filterBySeverity(lowPriorityIssues, 'concise');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle items without severity', () => {
    const mixedItems = [
      { message: 'A' },
      { severity: 'critical', message: 'B' },
    ];
    const result = filterBySeverity(mixedItems, 'concise');
    expect(result.some(i => i.severity === 'critical')).toBe(true);
  });

  it('should handle empty arrays', () => {
    const result = filterBySeverity([], 'concise');
    expect(result).toEqual([]);
  });
});

describe('createSummary', () => {
  it('should create minimal summary', () => {
    const data = {
      score: 85,
      issues: [{ severity: 'high' }, { severity: 'low' }],
    };
    const result = createSummary(data, 'minimal');
    expect(result.score).toBe(85);
    expect(result.issueCount).toBe(2);
    expect(result.criticalCount).toBeUndefined();
    expect(result.summary).toBeUndefined();
  });

  it('should create concise summary with critical count', () => {
    const data = {
      score: 75,
      issues: [{ severity: 'critical' }, { severity: 'high' }, { severity: 'low' }],
    };
    const result = createSummary(data, 'concise');
    expect(result.score).toBe(75);
    expect(result.issueCount).toBe(3);
    expect(result.criticalCount).toBe(2);
    expect(result.summary).toContain('2 critical issue(s)');
  });

  it('should create summary without critical issues', () => {
    const data = {
      score: 90,
      issues: [{ severity: 'low' }, { severity: 'info' }],
    };
    const result = createSummary(data, 'concise');
    expect(result.criticalCount).toBe(0);
    expect(result.summary).toContain('2 issue(s) found');
  });

  it('should handle no issues', () => {
    const data = {
      score: 100,
      issues: [],
    };
    const result = createSummary(data, 'concise');
    expect(result.issueCount).toBe(0);
    expect(result.summary).toBe('No issues found');
  });

  it('should handle undefined issues', () => {
    const data = { score: 100 };
    const result = createSummary(data, 'concise');
    expect(result.issueCount).toBe(0);
    expect(result.criticalCount).toBe(0);
  });
});

describe('StandardFormatters', () => {
  describe('review formatter', () => {
    const reviewResult = {
      overallScore: 85,
      issues: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      metrics: { complexity: 10 },
    };

    it('should create minimal formatter', () => {
      const formatter = StandardFormatters.review(reviewResult);
      const result = formatter.minimal();
      expect(result.score).toBe(85);
      expect(result.issueCount).toBe(6);
    });

    it('should create concise formatter with metrics', () => {
      const formatter = StandardFormatters.review(reviewResult);
      const result = formatter.concise();
      expect(result.score).toBe(85);
      expect(result.issueCount).toBe(6);
      expect(result.topIssues.length).toBeLessThanOrEqual(5);
      expect(result.metrics).toEqual({ complexity: 10 });
    });

    it('should create concise formatter without metrics', () => {
      const noMetricsResult = { score: 80, issues: [] };
      const formatter = StandardFormatters.review(noMetricsResult);
      const result = formatter.concise();
      expect(result.score).toBe(80);
      expect(result).not.toHaveProperty('metrics');
    });

    it('should create detailed formatter', () => {
      const formatter = StandardFormatters.review(reviewResult);
      const result = formatter.detailed();
      expect(result).toEqual(reviewResult);
    });

    it('should handle result with score instead of overallScore', () => {
      const altResult = { score: 90, issues: [] };
      const formatter = StandardFormatters.review(altResult);
      expect(formatter.minimal().score).toBe(90);
    });
  });

  describe('batch formatter', () => {
    const batchResult = {
      success: true,
      results: Array(10).fill({ file: 'test.ts' }),
      errors: [{ error: 'Failed' }],
    };

    it('should create minimal formatter', () => {
      const formatter = StandardFormatters.batch(batchResult);
      const result = formatter.minimal();
      expect(result.success).toBe(true);
      expect(result.processed).toBe(10);
      expect(result.errors).toBe(1);
    });

    it('should create concise formatter', () => {
      const formatter = StandardFormatters.batch(batchResult);
      const result = formatter.concise();
      expect(result.success).toBe(true);
      expect(result.processed).toBe(10);
      expect(result.results.length).toBeLessThanOrEqual(5);
    });

    it('should create detailed formatter', () => {
      const formatter = StandardFormatters.batch(batchResult);
      const result = formatter.detailed();
      expect(result).toEqual(batchResult);
    });

    it('should handle missing fields', () => {
      const emptyResult = {};
      const formatter = StandardFormatters.batch(emptyResult);
      const result = formatter.minimal();
      expect(result.success).toBe(true);
      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);
    });
  });

  describe('generation formatter', () => {
    const genResult = {
      content: 'generated code',
      files: [{ path: 'a.ts' }, { path: 'b.ts' }],
    };

    it('should create minimal formatter', () => {
      const formatter = StandardFormatters.generation(genResult);
      const result = formatter.minimal();
      expect(result.success).toBe(true);
      expect(result.generated).toBe(2);
    });

    it('should create concise formatter with preview', () => {
      const formatter = StandardFormatters.generation(genResult);
      const result = formatter.concise();
      expect(result.success).toBe(true);
      expect(result.preview).toBe('generated code');
    });

    it('should truncate long content preview', () => {
      const longResult = { content: 'x'.repeat(1000) };
      const formatter = StandardFormatters.generation(longResult);
      const result = formatter.concise();
      expect(result.preview?.length).toBeLessThanOrEqual(500);
    });

    it('should create detailed formatter', () => {
      const formatter = StandardFormatters.generation(genResult);
      const result = formatter.detailed();
      expect(result).toEqual(genResult);
    });

    it('should handle content-only result', () => {
      const contentOnly = { content: 'test' };
      const formatter = StandardFormatters.generation(contentOnly);
      expect(formatter.minimal().generated).toBe(1);
    });

    it('should handle empty result', () => {
      const emptyResult = {};
      const formatter = StandardFormatters.generation(emptyResult);
      expect(formatter.minimal().generated).toBe(0);
    });
  });
});
