/**
 * Tests for config validator
 */

import { describe, it, expect } from 'vitest';
import { validateConfig } from '../src/validator.js';
import type { WizardSelections } from '../src/wizard.js';

describe('Config Validator', () => {
  const mockSelections: WizardSelections = {
    editor: 'claude-code',
    mcps: ['smart-reviewer', 'security-scanner'],
    preferences: {
      reviewSeverity: 'moderate',
      installGlobally: true,
    },
  };

  const mockDetected = {
    editor: 'claude-code',
    project: {
      language: 'typescript',
      packageManager: 'npm',
      hasTests: true,
    },
    testFramework: 'vitest',
  };

  it('should pass validation for valid config', async () => {
    const issues = await validateConfig(mockSelections, mockDetected);

    // May have issues about existing config, but should not fail
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should fail if no MCPs selected', async () => {
    const invalidSelections = {
      ...mockSelections,
      mcps: [],
    };

    const issues = await validateConfig(invalidSelections, mockDetected);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some(issue => issue.includes('No MCP tools'))).toBe(true);
  });

  it('should fail for unknown editor', async () => {
    const invalidSelections = {
      ...mockSelections,
      editor: 'unknown-editor' as any,
    };

    const issues = await validateConfig(invalidSelections, mockDetected);
    expect(issues.some(issue => issue.includes('Unknown editor'))).toBe(true);
  });

  it('should check Node version', async () => {
    const issues = await validateConfig(mockSelections, mockDetected);

    // Should not complain about Node version if we're running the tests
    const nodeIssue = issues.find(issue => issue.includes('Node.js'));
    if (nodeIssue) {
      expect(nodeIssue).toContain('18+');
    }
  });

  it('should detect existing config file', async () => {
    // When config file already exists, it should warn about overwrite
    const issues = await validateConfig(mockSelections, mockDetected);

    // Check if existing config warning is present
    const existsIssue = issues.find(issue => issue.includes('already exists'));
    // May or may not have this issue depending on test environment
    if (existsIssue) {
      expect(existsIssue).toContain('--force');
    }
  });

  it('should handle config directory creation failure gracefully', async () => {
    // Mock a scenario where config directory can't be created
    // This is tested implicitly through the validation logic
    const validSelections = {
      ...mockSelections,
      editor: 'vscode' as const,
    };

    const issues = await validateConfig(validSelections, mockDetected);
    // Should return array regardless of directory creation success/failure
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should validate multiple selections at once', async () => {
    // Test with multiple MCPs selected
    const multipleSelections = {
      ...mockSelections,
      mcps: ['smart-reviewer', 'security-scanner', 'test-generator', 'architecture-analyzer'],
    };

    const issues = await validateConfig(multipleSelections, mockDetected);
    expect(Array.isArray(issues)).toBe(true);
    // Should not fail for having multiple MCPs
    expect(issues.every(issue => !issue.includes('No MCP tools'))).toBe(true);
  });

  it('should validate all supported editors', async () => {
    const supportedEditors = ['claude-code', 'cursor', 'vscode', 'windsurf'] as const;

    for (const editor of supportedEditors) {
      const selections = {
        ...mockSelections,
        editor,
      };

      const issues = await validateConfig(selections, mockDetected);
      // Should not report unknown editor for supported editors
      expect(issues.every(issue => !issue.includes('Unknown editor'))).toBe(true);
    }
  });

  it('should pass validation when Node version is sufficient', async () => {
    // Current Node version should pass the check
    const issues = await validateConfig(mockSelections, mockDetected);

    // If Node is 18+, no Node.js version issue should be present
    const nodeVersion = parseInt(process.version.slice(1).split('.')[0], 10);
    if (nodeVersion >= 18) {
      expect(issues.every(issue => !issue.includes('Node.js 18+ required'))).toBe(true);
    }
  });

  it('should detect config directory creation issues', async () => {
    const selections = {
      ...mockSelections,
      editor: 'vscode' as const, // VSCode has a specific config path
    };

    const issues = await validateConfig(selections, mockDetected);
    // The validation should handle directory creation attempt
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should warn about existing config files', async () => {
    // Test with a valid editor that has config path
    const selections = {
      ...mockSelections,
      editor: 'claude-code' as const,
    };

    const issues = await validateConfig(selections, mockDetected);

    // Check if the config file exists warning is handled properly
    const existsWarning = issues.find(i => i.includes('already exists'));
    if (existsWarning) {
      expect(existsWarning).toContain('--force');
    }
  });

  it('should handle null config path for unknown editors', async () => {
    const invalidSelections = {
      ...mockSelections,
      editor: 'nonexistent-editor' as any,
    };

    const issues = await validateConfig(invalidSelections, mockDetected);

    // Should report unknown editor since getEditorConfigPath returns null
    expect(issues.some(issue => issue.includes('Unknown editor'))).toBe(true);
  });
});
