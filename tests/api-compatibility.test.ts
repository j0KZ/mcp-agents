/**
 * API Compatibility Tests
 *
 * These tests ensure that refactoring doesn't break the public API.
 * All exports and function signatures must remain compatible.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('API Compatibility - Refactor Assistant', () => {
  it('should export all required functions', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');

    // Verify all public API functions exist
    expect(module.extractFunction).toBeDefined();
    expect(module.convertToAsync).toBeDefined();
    expect(module.simplifyConditionals).toBeDefined();
    expect(module.removeDeadCode).toBeDefined();
    expect(module.applyDesignPattern).toBeDefined();
    expect(module.renameVariable).toBeDefined();
    expect(module.suggestRefactorings).toBeDefined();
    expect(module.calculateMetrics).toBeDefined();

    // Verify they are functions
    expect(typeof module.extractFunction).toBe('function');
    expect(typeof module.convertToAsync).toBe('function');
    expect(typeof module.simplifyConditionals).toBe('function');
    expect(typeof module.removeDeadCode).toBe('function');
    expect(typeof module.applyDesignPattern).toBe('function');
    expect(typeof module.renameVariable).toBe('function');
    expect(typeof module.suggestRefactorings).toBe('function');
    expect(typeof module.calculateMetrics).toBe('function');
  });

  it('should maintain extractFunction signature', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');
    const testCode = 'const x = 1;\nconst y = 2;\nconst z = x + y;';

    const result = module.extractFunction({
      code: testCode,
      functionName: 'testFn',
      startLine: 1,
      endLine: 3,
    });

    // Verify return structure
    expect(result).toHaveProperty('code');
    expect(result).toHaveProperty('changes');
    expect(result).toHaveProperty('success');
    expect(typeof result.code).toBe('string');
    expect(Array.isArray(result.changes)).toBe(true);
    expect(typeof result.success).toBe('boolean');
  });

  it('should maintain calculateMetrics signature', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');
    const testCode = 'function test() { return 1; }';

    const result = module.calculateMetrics(testCode);

    // Verify return structure
    expect(result).toHaveProperty('complexity');
    expect(result).toHaveProperty('linesOfCode');
    expect(result).toHaveProperty('functionCount');
    expect(result).toHaveProperty('maxNestingDepth');
    expect(result).toHaveProperty('maintainabilityIndex');
    expect(typeof result.complexity).toBe('number');
    expect(typeof result.linesOfCode).toBe('number');
  });

  it('should maintain suggestRefactorings signature', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');
    const testCode = 'if (x) { if (y) { return z; } }';

    const result = module.suggestRefactorings(testCode);

    // Verify return structure
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('description');
      expect(result[0]).toHaveProperty('severity');
    }
  });
});

describe('API Compatibility - Smart Reviewer', () => {
  it('should export CodeAnalyzer class', async () => {
    const module = await import('../packages/smart-reviewer/src/analyzer.js');

    expect(module.CodeAnalyzer).toBeDefined();
    expect(typeof module.CodeAnalyzer).toBe('function'); // Class is a function in JS
  });

  it('should maintain CodeAnalyzer.analyzeFile signature', async () => {
    const module = await import('../packages/smart-reviewer/src/analyzer.js');
    const analyzer = new module.CodeAnalyzer();

    // Create a temp test file
    const tempFile = path.join(process.cwd(), 'temp-test.ts');
    fs.writeFileSync(tempFile, 'const test = 1;');

    try {
      const result = await analyzer.analyzeFile(tempFile);

      // Verify return structure
      expect(result).toHaveProperty('file');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('timestamp');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.overallScore).toBe('number');
    } finally {
      fs.unlinkSync(tempFile);
    }
  });

  it('should maintain metrics structure', async () => {
    const module = await import('../packages/smart-reviewer/src/analyzer.js');
    const analyzer = new module.CodeAnalyzer();
    const tempFile = path.join(process.cwd(), 'temp-test2.ts');
    fs.writeFileSync(tempFile, 'function test() { return 1; }');

    try {
      const result = await analyzer.analyzeFile(tempFile);

      expect(result.metrics).toHaveProperty('complexity');
      expect(result.metrics).toHaveProperty('maintainability');
      expect(result.metrics).toHaveProperty('linesOfCode');
      expect(result.metrics).toHaveProperty('commentDensity');
    } finally {
      fs.unlinkSync(tempFile);
    }
  });
});

describe('API Compatibility - Security Scanner', () => {
  it('should export all required functions', async () => {
    const module = await import('../packages/security-scanner/src/scanner.js');

    expect(module.scanFile).toBeDefined();
    expect(module.scanProject).toBeDefined();
    expect(typeof module.scanFile).toBe('function');
    expect(typeof module.scanProject).toBe('function');
  });

  it('should maintain scanFile signature', async () => {
    const module = await import('../packages/security-scanner/src/scanner.js');
    const tempFile = path.join(process.cwd(), 'temp-test3.ts');
    fs.writeFileSync(tempFile, 'const test = 1;');

    try {
      const result = await module.scanFile(tempFile, {});

      // Verify result is an array (scanFile returns findings array)
      expect(Array.isArray(result)).toBe(true);
      // Findings should have expected structure
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('type');
        expect(result[0]).toHaveProperty('severity');
      }
    } finally {
      fs.unlinkSync(tempFile);
    }
  });
});

describe('Backward Compatibility - Return Types', () => {
  it('should maintain RefactoringResult structure', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');
    const result = module.extractFunction({
      code: 'const x = 1;',
      functionName: 'test',
      startLine: 1,
      endLine: 1,
    });

    // All results should have these fields
    expect('code' in result).toBe(true);
    expect('changes' in result).toBe(true);
    expect('success' in result).toBe(true);

    // Optional fields should be allowed
    if (result.error) {
      expect(typeof result.error).toBe('string');
    }
    if (result.warnings) {
      expect(Array.isArray(result.warnings)).toBe(true);
    }
  });

  it('should maintain CodeMetrics structure', async () => {
    const module = await import('../packages/refactor-assistant/src/refactorer.js');
    const result = module.calculateMetrics('function test() {}');

    // Required fields
    expect(typeof result.complexity).toBe('number');
    expect(typeof result.linesOfCode).toBe('number');
    expect(typeof result.functionCount).toBe('number');
    expect(typeof result.maxNestingDepth).toBe('number');
    expect(typeof result.maintainabilityIndex).toBe('number');
  });
});
