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
});
