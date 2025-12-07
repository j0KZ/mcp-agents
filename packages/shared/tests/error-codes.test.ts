/**
 * Tests for error-codes module
 */

import { describe, it, expect } from 'vitest';
import { ERROR_CODES, MCPError, isMCPError, getErrorMessage } from '../src/errors/error-codes.js';

describe('ERROR_CODES', () => {
  it('should have orchestrator error codes', () => {
    expect(ERROR_CODES.ORCH_001).toBe('Missing required workflow argument');
    expect(ERROR_CODES.ORCH_002).toBe('Unknown workflow name');
    expect(ERROR_CODES.ORCH_003).toBe('Unknown tool in sequence');
    expect(ERROR_CODES.ORCH_004).toBe('MCP communication failed');
    expect(ERROR_CODES.ORCH_005).toBe('Workflow execution timeout');
    expect(ERROR_CODES.ORCH_006).toBe('Circuit breaker is open - MCP unavailable');
  });

  it('should have test generator error codes', () => {
    expect(ERROR_CODES.TEST_001).toBe('Invalid file path');
    expect(ERROR_CODES.TEST_002).toBe('Unsupported framework');
    expect(ERROR_CODES.TEST_003).toBe('File not found');
    expect(ERROR_CODES.TEST_004).toBe('Permission denied');
    expect(ERROR_CODES.TEST_005).toBe('Failed to read file');
    expect(ERROR_CODES.TEST_006).toBe('File is empty');
    expect(ERROR_CODES.TEST_007).toBe('File too large');
    expect(ERROR_CODES.TEST_008).toBe('No testable code found');
  });

  it('should have smart reviewer error codes', () => {
    expect(ERROR_CODES.REV_001).toBe('filePaths must be a non-empty array');
    expect(ERROR_CODES.REV_002).toBe('Unknown tool');
    expect(ERROR_CODES.REV_003).toBe('File is empty');
    expect(ERROR_CODES.REV_004).toBe('Analysis failed');
    expect(ERROR_CODES.REV_005).toBe('Invalid severity level');
  });

  it('should have security scanner error codes', () => {
    expect(ERROR_CODES.SEC_001).toBe('Invalid file path');
    expect(ERROR_CODES.SEC_002).toBe('Scan failed');
    expect(ERROR_CODES.SEC_003).toBe('Invalid configuration');
    expect(ERROR_CODES.SEC_004).toBe('Unknown tool');
  });

  it('should have refactor assistant error codes', () => {
    expect(ERROR_CODES.REF_001).toBe('Invalid code input');
    expect(ERROR_CODES.REF_002).toBe('Code too large');
    expect(ERROR_CODES.REF_003).toBe('Invalid pattern name');
    expect(ERROR_CODES.REF_004).toBe('Refactoring failed');
    expect(ERROR_CODES.REF_005).toBe('Invalid line range');
    expect(ERROR_CODES.REF_006).toBe('Invalid variable name');
  });

  it('should have architecture analyzer error codes', () => {
    expect(ERROR_CODES.ARCH_001).toBe('Invalid project path');
    expect(ERROR_CODES.ARCH_002).toBe('Module not found');
    expect(ERROR_CODES.ARCH_003).toBe('Unknown tool');
    expect(ERROR_CODES.ARCH_004).toBe('Circular dependency detected');
  });

  it('should have API designer error codes', () => {
    expect(ERROR_CODES.API_001).toBe('Invalid API configuration');
    expect(ERROR_CODES.API_002).toBe('Validation failed');
    expect(ERROR_CODES.API_003).toBe('Generation failed');
    expect(ERROR_CODES.API_004).toBe('Unsupported API style');
    expect(ERROR_CODES.API_005).toBe('Mock server generation failed');
    expect(ERROR_CODES.API_006).toBe('Unknown tool');
  });

  it('should have DB schema error codes', () => {
    expect(ERROR_CODES.DB_001).toBeDefined();
    expect(ERROR_CODES.DB_002).toBeDefined();
    expect(ERROR_CODES.DB_003).toBeDefined();
    expect(ERROR_CODES.DB_004).toBe('Unsupported database type');
  });

  it('should have doc generator error codes', () => {
    expect(ERROR_CODES.DOC_001).toBe('Invalid project path');
    expect(ERROR_CODES.DOC_002).toBe('Generation failed');
    expect(ERROR_CODES.DOC_003).toBe('No documentation generated');
    expect(ERROR_CODES.DOC_004).toBe('File write failed');
    expect(ERROR_CODES.DOC_005).toBe('Unknown tool');
  });

  it('should have validation error codes', () => {
    expect(ERROR_CODES.VAL_001).toBe('Invalid input');
    expect(ERROR_CODES.VAL_002).toBe('Path traversal detected');
    expect(ERROR_CODES.VAL_003).toBe('File too large');
    expect(ERROR_CODES.VAL_004).toBe('Invalid identifier');
    expect(ERROR_CODES.VAL_005).toBe('Invalid line range');
  });

  it('should be an object with error codes', () => {
    expect(typeof ERROR_CODES).toBe('object');
    expect(Object.keys(ERROR_CODES).length).toBeGreaterThan(0);
  });
});

describe('MCPError', () => {
  describe('constructor', () => {
    it('should create error with code', () => {
      const error = new MCPError('TEST_001');

      expect(error.code).toBe('TEST_001');
      expect(error.message).toBe('Invalid file path');
      expect(error.name).toBe('MCPError');
    });

    it('should create error with code and details', () => {
      const error = new MCPError('TEST_001', { filePath: '/test/file.ts' });

      expect(error.code).toBe('TEST_001');
      expect(error.details).toEqual({ filePath: '/test/file.ts' });
    });

    it('should extend Error', () => {
      const error = new MCPError('TEST_001');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MCPError);
    });

    it('should have proper stack trace', () => {
      const error = new MCPError('TEST_001');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('MCPError');
    });
  });

  describe('toJSON', () => {
    it('should convert to JSON format', () => {
      const error = new MCPError('TEST_002', { framework: 'unknown' });

      const json = error.toJSON();

      expect(json).toEqual({
        code: 'TEST_002',
        message: 'Unsupported framework',
        details: { framework: 'unknown' },
        name: 'MCPError',
      });
    });

    it('should handle error without details', () => {
      const error = new MCPError('TEST_003');

      const json = error.toJSON();

      expect(json).toEqual({
        code: 'TEST_003',
        message: 'File not found',
        details: undefined,
        name: 'MCPError',
      });
    });
  });

  describe('toString', () => {
    it('should format error as string', () => {
      const error = new MCPError('TEST_001');

      expect(error.toString()).toBe('TEST_001: Invalid file path');
    });

    it('should include details in string format', () => {
      const error = new MCPError('TEST_001', { path: '/test' });

      const str = error.toString();

      expect(str).toContain('TEST_001: Invalid file path');
      expect(str).toContain('Details:');
      expect(str).toContain('/test');
    });
  });

  describe('is', () => {
    it('should return true for matching code', () => {
      const error = new MCPError('TEST_001');

      expect(error.is('TEST_001')).toBe(true);
    });

    it('should return false for non-matching code', () => {
      const error = new MCPError('TEST_001');

      expect(error.is('TEST_002')).toBe(false);
    });
  });

  describe('from', () => {
    it('should return same MCPError if already MCPError', () => {
      const original = new MCPError('TEST_001', { key: 'value' });
      const result = MCPError.from(original, 'TEST_002');

      expect(result).toBe(original);
      expect(result.code).toBe('TEST_001');
    });

    it('should wrap generic Error', () => {
      const original = new Error('Something went wrong');
      const result = MCPError.from(original, 'TEST_004');

      expect(result).toBeInstanceOf(MCPError);
      expect(result.code).toBe('TEST_004');
      expect(result.details?.originalMessage).toBe('Something went wrong');
      expect(result.details?.originalStack).toBeDefined();
    });

    it('should wrap unknown error type', () => {
      const result = MCPError.from('string error', 'TEST_005');

      expect(result).toBeInstanceOf(MCPError);
      expect(result.code).toBe('TEST_005');
      expect(result.details?.originalError).toBe('string error');
    });

    it('should merge additional details', () => {
      const original = new Error('Test error');
      const result = MCPError.from(original, 'TEST_006', { extra: 'info' });

      expect(result.details?.originalMessage).toBe('Test error');
      expect(result.details?.extra).toBe('info');
    });

    it('should handle null error', () => {
      const result = MCPError.from(null, 'TEST_007');

      expect(result.code).toBe('TEST_007');
      expect(result.details?.originalError).toBe('null');
    });

    it('should handle undefined error', () => {
      const result = MCPError.from(undefined, 'TEST_008');

      expect(result.code).toBe('TEST_008');
      expect(result.details?.originalError).toBe('undefined');
    });
  });
});

describe('isMCPError', () => {
  it('should return true for MCPError', () => {
    const error = new MCPError('TEST_001');

    expect(isMCPError(error)).toBe(true);
  });

  it('should return false for generic Error', () => {
    const error = new Error('Test');

    expect(isMCPError(error)).toBe(false);
  });

  it('should return false for string', () => {
    expect(isMCPError('error')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isMCPError(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isMCPError(undefined)).toBe(false);
  });

  it('should return false for object that looks like MCPError', () => {
    const fake = { code: 'TEST_001', message: 'test', name: 'MCPError' };

    expect(isMCPError(fake)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('should return MCPError string representation', () => {
    const error = new MCPError('TEST_001');
    const message = getErrorMessage(error);

    expect(message).toBe('TEST_001: Invalid file path');
  });

  it('should return Error message', () => {
    const error = new Error('Test message');
    const message = getErrorMessage(error);

    expect(message).toBe('Test message');
  });

  it('should return string error as-is', () => {
    const message = getErrorMessage('string error');

    expect(message).toBe('string error');
  });

  it('should return fallback for empty string', () => {
    const message = getErrorMessage('', 'Fallback');

    expect(message).toBe('Fallback');
  });

  it('should use default fallback message', () => {
    const message = getErrorMessage('');

    expect(message).toBe('Unknown error');
  });

  it('should handle null', () => {
    const message = getErrorMessage(null);

    expect(message).toBe('null');
  });

  it('should handle undefined', () => {
    const message = getErrorMessage(undefined, 'Fallback');

    // String(undefined) returns 'undefined', so that's what we get
    expect(message).toBe('undefined');
  });

  it('should convert number to string', () => {
    const message = getErrorMessage(42);

    expect(message).toBe('42');
  });

  it('should include MCPError details', () => {
    const error = new MCPError('TEST_001', { file: 'test.ts' });
    const message = getErrorMessage(error);

    expect(message).toContain('TEST_001');
    expect(message).toContain('Details:');
    expect(message).toContain('test.ts');
  });
});
