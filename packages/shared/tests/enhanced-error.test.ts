/**
 * Tests for Enhanced Error System
 * Ensures proper error formatting and actionable solutions
 */

import { describe, it, expect } from 'vitest';
import { EnhancedError } from '../src/errors/enhanced-error.js';
import { MCPError } from '../src/errors/error-codes.js';

describe('enhanced-error', () => {
  describe('fromMCPError', () => {
    it('should create enhanced error response from MCPError', () => {
      const mcpError = new MCPError('REV_001', 'filePaths must be a non-empty array', { filePaths: [] });
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.success).toBe(false);
      expect(enhanced.error).toBe('filePaths must be a non-empty array');
      expect(enhanced.code).toBe('REV_001');
      expect(enhanced.userMessage).toContain('provide at least one file');
      expect(enhanced.solutions).toBeDefined();
      expect(enhanced.timestamp).toBeDefined();
    });

    it('should include context in debugInfo', () => {
      const mcpError = new MCPError('TEST_003', 'File not found');
      const context = { filePath: '/test/file.ts', userId: '123' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.debugInfo).toEqual(context);
    });

    it('should format timestamp as ISO string', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(() => new Date(enhanced.timestamp)).not.toThrow();
      expect(enhanced.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return solutions array', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(Array.isArray(enhanced.solutions)).toBe(true);
      expect(enhanced.solutions.length).toBeGreaterThan(0);
    });

    it('should have proper error response structure', () => {
      const mcpError = new MCPError('TEST_001', 'Invalid path');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced).toHaveProperty('success');
      expect(enhanced).toHaveProperty('error');
      expect(enhanced).toHaveProperty('code');
      expect(enhanced).toHaveProperty('userMessage');
      expect(enhanced).toHaveProperty('solutions');
      expect(enhanced).toHaveProperty('timestamp');
    });
  });

  describe('getUserMessage', () => {
    it('should return specific message for TEST_003 (file not found)', () => {
      const mcpError = new MCPError('TEST_003', 'Error');
      const context = { filePath: '/test/missing.ts' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('Cannot find file');
      expect(enhanced.userMessage).toContain('/test/missing.ts');
    });

    it('should return specific message for REV_001 (no files)', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.userMessage).toContain('provide at least one file');
    });

    it('should return specific message for SEC_001 (invalid path)', () => {
      const mcpError = new MCPError('SEC_001', 'Error');
      const context = { filePath: '../../../etc/passwd' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('Invalid file path');
      expect(enhanced.userMessage).toContain('../../../etc/passwd');
    });

    it('should handle missing context gracefully', () => {
      const mcpError = new MCPError('TEST_001', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.userMessage).toContain('unknown');
    });

    it('should return fallback for unknown error codes', () => {
      const mcpError = new MCPError('TEST_001', 'Custom error message');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.userMessage).toBeTruthy();
    });
  });

  describe('getSolutions', () => {
    it('should return specific solutions for TEST_003', () => {
      const mcpError = new MCPError('TEST_003', 'File not found');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.solutions.length).toBeGreaterThan(0);
      expect(enhanced.solutions[0].description).toBeTruthy();
      expect(enhanced.solutions[0].steps).toBeDefined();
      expect(enhanced.solutions[0].steps.length).toBeGreaterThan(0);
    });

    it('should return default solution for unsupported error codes', () => {
      const mcpError = new MCPError('VAL_001', 'Invalid input');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.solutions.length).toBeGreaterThan(0);
      expect(enhanced.solutions[0].description).toContain('help');
      expect(enhanced.solutions[0].steps).toBeDefined();
    });

    it('should include platform-specific solutions when relevant', () => {
      const mcpError = new MCPError('TEST_004', 'Permission denied');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      // Should include either chmod or Windows instructions
      const allSteps = enhanced.solutions.flatMap(s => s.steps).join(' ');
      const hasPermissionFix = allSteps.includes('chmod') || allSteps.includes('Properties');
      expect(hasPermissionFix).toBe(true);
    });

    it('should include documentation links when available', () => {
      const mcpError = new MCPError('VAL_001', 'Invalid input');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      const hasDocLink = enhanced.solutions.some(s => {
        if (!s.documentation) return false;
        try {
          const url = new URL(s.documentation);
          return url.hostname === 'github.com';
        } catch {
          return false;
        }
      });
      expect(hasDocLink).toBe(true);
    });

    it('should return solutions with proper structure', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      enhanced.solutions.forEach(solution => {
        expect(solution).toHaveProperty('description');
        expect(solution).toHaveProperty('steps');
        expect(Array.isArray(solution.steps)).toBe(true);
        expect(solution.steps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('toJSON', () => {
    it('should return valid JSON string', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const json = EnhancedError.toJSON(mcpError);

      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include debugInfo by default', () => {
      const mcpError = new MCPError('TEST_001', 'Error');
      const context = { filePath: '/test.ts' };
      const json = EnhancedError.toJSON(mcpError, context);
      const parsed = JSON.parse(json);

      expect(parsed.debugInfo).toEqual(context);
    });

    it('should exclude debugInfo when includeDebug is false', () => {
      const mcpError = new MCPError('TEST_001', 'Error');
      const context = { filePath: '/test.ts' };
      const json = EnhancedError.toJSON(mcpError, context, false);
      const parsed = JSON.parse(json);

      expect(parsed.debugInfo).toBeUndefined();
    });

    it('should format JSON with indentation', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const json = EnhancedError.toJSON(mcpError);

      expect(json).toContain('\n');
      expect(json).toContain('  '); // 2-space indent
    });

    it('should include all required fields', () => {
      const mcpError = new MCPError('TEST_001', 'Error');
      const json = EnhancedError.toJSON(mcpError);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('success');
      expect(parsed).toHaveProperty('error');
      expect(parsed).toHaveProperty('code');
      expect(parsed).toHaveProperty('userMessage');
      expect(parsed).toHaveProperty('solutions');
      expect(parsed).toHaveProperty('timestamp');
    });
  });

  describe('toConsole', () => {
    it('should format error for console output', () => {
      const mcpError = new MCPError('REV_001', 'No files provided');
      const console = EnhancedError.toConsole(mcpError);

      expect(console).toContain('❌ Error');
      expect(console).toContain('Code: REV_001');
    });

    it('should include user message', () => {
      const mcpError = new MCPError('TEST_003', 'File not found');
      const context = { filePath: '/test.ts' };
      const console = EnhancedError.toConsole(mcpError, context);

      expect(console).toContain('Cannot find file');
      expect(console).toContain('/test.ts');
    });

    it('should include solutions section', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const console = EnhancedError.toConsole(mcpError);

      expect(console).toContain('💡 Solutions');
    });

    it('should list solution steps with bullets', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const console = EnhancedError.toConsole(mcpError);

      expect(console).toContain('•');
    });

    it('should number solutions', () => {
      const mcpError = new MCPError('TEST_003', 'File not found');
      const console = EnhancedError.toConsole(mcpError);

      expect(console).toMatch(/\d\./); // Contains numbered list
    });

    it('should be multi-line formatted', () => {
      const mcpError = new MCPError('REV_001', 'Error');
      const console = EnhancedError.toConsole(mcpError);

      const lines = console.split('\n');
      expect(lines.length).toBeGreaterThan(3);
    });
  });

  describe('Error codes coverage', () => {
    const errorCodes = [
      'TEST_001', 'TEST_002', 'TEST_003', 'TEST_004', 'TEST_005', 'TEST_006', 'TEST_007', 'TEST_008',
      'REV_001', 'REV_002', 'REV_003', 'REV_004', 'REV_005',
      'SEC_001', 'SEC_002', 'SEC_003', 'SEC_004',
      'REF_001', 'REF_002', 'REF_003', 'REF_004', 'REF_005', 'REF_006',
      'ARCH_001', 'ARCH_002', 'ARCH_003', 'ARCH_004',
      'API_001', 'API_002', 'API_003', 'API_004', 'API_005', 'API_006',
      'DB_001', 'DB_002', 'DB_003', 'DB_004', 'DB_005', 'DB_006', 'DB_007', 'DB_008', 'DB_009',
      'DOC_001', 'DOC_002', 'DOC_003', 'DOC_004', 'DOC_005',
      'ORCH_001', 'ORCH_002', 'ORCH_003', 'ORCH_004', 'ORCH_005', 'ORCH_006', 'ORCH_007', 'ORCH_008',
      'VAL_001', 'VAL_002', 'VAL_003', 'VAL_004', 'VAL_005',
    ];

    it('should handle all defined error codes', () => {
      errorCodes.forEach(code => {
        const mcpError = new MCPError(code as any, 'Test error');
        const enhanced = EnhancedError.fromMCPError(mcpError);

        expect(enhanced.code).toBe(code);
        expect(enhanced.userMessage).toBeTruthy();
        expect(enhanced.solutions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Context interpolation', () => {
    it('should interpolate file paths in messages', () => {
      const mcpError = new MCPError('TEST_003', 'Error');
      const context = { filePath: '/my/custom/path.ts' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('/my/custom/path.ts');
    });

    it('should interpolate framework names', () => {
      const mcpError = new MCPError('TEST_002', 'Error');
      const context = { framework: 'mocha' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('mocha');
    });

    it('should interpolate severity levels', () => {
      const mcpError = new MCPError('REV_005', 'Error');
      const context = { severity: 'critical' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('critical');
    });

    it('should interpolate workflow names', () => {
      const mcpError = new MCPError('ORCH_002', 'Error');
      const context = { workflow: 'pre-commit' };
      const enhanced = EnhancedError.fromMCPError(mcpError, context);

      expect(enhanced.userMessage).toContain('pre-commit');
    });

    it('should use "unknown" when context is missing', () => {
      const mcpError = new MCPError('TEST_002', 'Error');
      const enhanced = EnhancedError.fromMCPError(mcpError);

      expect(enhanced.userMessage).toContain('unknown');
    });
  });
});
