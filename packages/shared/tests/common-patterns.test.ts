/**
 * Tests for common-patterns.ts - MCP operation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  successResult,
  errorResult,
  withErrorHandling,
  createToolResponse,
  safeFileOperation,
  validateRequiredParams,
  executeWithDependencies,
  batchOperation,
  retryOperation,
  validateFileSize,
  mergeResults,
} from '../src/patterns/common-patterns.js';
import { MCPError } from '../src/errors/index.js';

describe('successResult', () => {
  it('should create a successful result with data', () => {
    const result = successResult({ value: 42 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ value: 42 });
    expect(result.error).toBeUndefined();
  });

  it('should include metadata when provided', () => {
    const result = successResult('data', { timestamp: '2024-01-01' });
    expect(result.success).toBe(true);
    expect(result.data).toBe('data');
    expect(result.metadata).toEqual({ timestamp: '2024-01-01' });
  });
});

describe('errorResult', () => {
  it('should create an error result from string error', () => {
    const result = errorResult('Something went wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
    expect(result.errorCode).toBe('UNKNOWN');
  });

  it('should create an error result from Error object', () => {
    const result = errorResult(new Error('Test error'), 'TEST_CODE');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
    expect(result.errorCode).toBe('TEST_CODE');
  });

  it('should extract code from MCPError', () => {
    // MCPError takes an ErrorCode from ERROR_CODES enum, not a custom message
    const mcpError = new MCPError('ORCH_001'); // 'Missing required workflow argument'
    const result = errorResult(mcpError);
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('ORCH_001');
  });
});

describe('withErrorHandling', () => {
  it('should return success result for successful operation', async () => {
    const result = await withErrorHandling(async () => 'success');
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
  });

  it('should return error result when operation throws', async () => {
    const result = await withErrorHandling(async () => {
      throw new Error('Operation failed');
    }, 'OP_FAILED');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Operation failed');
    expect(result.errorCode).toBe('OP_FAILED');
  });
});

describe('createToolResponse', () => {
  it('should format result as MCP tool response', () => {
    const result = { success: true, data: 'test' };
    const response = createToolResponse(result);

    expect(response.content).toHaveLength(1);
    expect(response.content[0].type).toBe('text');
    expect(response.content[0].text).toBe(JSON.stringify(result, null, 2));
  });
});

describe('safeFileOperation', () => {
  it('should return success for successful file operation', async () => {
    const result = await safeFileOperation(async () => 'file content', '/path/to/file.txt');
    expect(result.success).toBe(true);
    expect(result.data).toBe('file content');
    expect(result.metadata?.filePath).toBe('/path/to/file.txt');
  });

  it('should handle ENOENT error', async () => {
    const error = new Error('File not found') as NodeJS.ErrnoException;
    error.code = 'ENOENT';

    const result = await safeFileOperation(async () => {
      throw error;
    }, '/missing/file.txt');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('FILE_NOT_FOUND');
    expect(result.metadata?.filePath).toBe('/missing/file.txt');
  });

  it('should handle EACCES error', async () => {
    const error = new Error('Permission denied') as NodeJS.ErrnoException;
    error.code = 'EACCES';

    const result = await safeFileOperation(async () => {
      throw error;
    }, '/protected/file.txt');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('PERMISSION_DENIED');
  });

  it('should handle EISDIR error', async () => {
    const error = new Error('Is a directory') as NodeJS.ErrnoException;
    error.code = 'EISDIR';

    const result = await safeFileOperation(async () => {
      throw error;
    }, '/some/directory');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('IS_DIRECTORY');
  });

  it('should handle unknown file errors', async () => {
    const result = await safeFileOperation(async () => {
      throw new Error('Unknown error');
    }, '/some/file.txt');

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('FILE_ERROR');
  });
});

describe('validateRequiredParams', () => {
  it('should pass when all required params present', () => {
    const result = validateRequiredParams({ name: 'test', value: 42 }, ['name', 'value']);
    expect(result.success).toBe(true);
  });

  it('should fail when params are missing', () => {
    const result = validateRequiredParams({ name: 'test' }, ['name', 'value', 'extra']);
    expect(result.success).toBe(false);
    expect(result.error).toContain('value');
    expect(result.error).toContain('extra');
    expect(result.errorCode).toBe('MISSING_PARAMS');
  });
});

describe('executeWithDependencies', () => {
  it('should execute steps in order', async () => {
    const executionOrder: string[] = [];

    const result = await executeWithDependencies([
      {
        name: 'step1',
        execute: async () => {
          executionOrder.push('step1');
          return 'result1';
        },
      },
      {
        name: 'step2',
        execute: async () => {
          executionOrder.push('step2');
          return 'result2';
        },
      },
    ]);

    expect(result.success).toBe(true);
    expect(executionOrder).toEqual(['step1', 'step2']);
    expect(result.data?.get('step1')).toBe('result1');
    expect(result.data?.get('step2')).toBe('result2');
  });

  it('should fail when dependency is not met', async () => {
    const result = await executeWithDependencies([
      { name: 'step2', dependsOn: ['step1'], execute: async () => 'result' },
    ]);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DEPENDENCY_ERROR');
    expect(result.error).toContain('step1');
  });

  it('should fail when step throws', async () => {
    const result = await executeWithDependencies([
      {
        name: 'step1',
        execute: async () => {
          throw new Error('Step failed');
        },
      },
    ]);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('STEP_FAILED');
    expect(result.metadata?.failedStep).toBe('step1');
  });
});

describe('batchOperation', () => {
  it('should process all items successfully', async () => {
    const items = [1, 2, 3, 4, 5];
    const result = await batchOperation(items, async item => item * 2, 2);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([2, 4, 6, 8, 10]);
  });

  it('should handle partial failures', async () => {
    const items = [1, 2, 3, 4, 5];
    const result = await batchOperation(
      items,
      async item => {
        if (item === 3) throw new Error('Item 3 failed');
        return item * 2;
      },
      10
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('BATCH_PARTIAL_FAILURE');
    expect(result.data).toEqual([2, 4, 8, 10]); // Missing 6
    expect(result.metadata?.errors).toHaveLength(1);
  });
});

describe('retryOperation', () => {
  it('should succeed on first attempt', async () => {
    const result = await retryOperation(async () => 'success', 3, 10);
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
  });

  it('should retry on failure and succeed', async () => {
    let attempts = 0;
    const result = await retryOperation(
      async () => {
        attempts++;
        if (attempts < 2) throw new Error('Temporary failure');
        return 'success';
      },
      3,
      10
    );

    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(attempts).toBe(2);
  });

  it('should fail after max retries', async () => {
    const result = await retryOperation(
      async () => {
        throw new Error('Persistent failure');
      },
      2,
      10
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('MAX_RETRIES_EXCEEDED');
    expect(result.error).toContain('2 retries');
  });
});

describe('validateFileSize', () => {
  it('should pass for small files', () => {
    const result = validateFileSize(1024); // 1KB
    expect(result.success).toBe(true);
  });

  it('should fail for large files', () => {
    const result = validateFileSize(200 * 1024 * 1024, 100 * 1024 * 1024); // 200MB vs 100MB limit
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('FILE_TOO_LARGE');
  });
});

describe('mergeResults', () => {
  it('should merge successful results', () => {
    const results = [successResult('a'), successResult('b'), successResult('c')];
    const merged = mergeResults(results);

    expect(merged.success).toBe(true);
    expect(merged.data).toEqual(['a', 'b', 'c']);
  });

  it('should report failures in merge', () => {
    const results = [
      successResult('a'),
      { success: false, error: 'failed1', errorCode: 'ERR1' },
      { success: false, error: 'failed2', errorCode: 'ERR2' },
    ];
    const merged = mergeResults(results);

    expect(merged.success).toBe(false);
    expect(merged.errorCode).toBe('MULTIPLE_FAILURES');
    expect(merged.error).toContain('2 operations failed');
  });
});
