/**
 * Tests for configuration validator
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import { validateConfig } from './validator.js';
import type { WizardSelections } from './wizard.js';

vi.mock('fs-extra');
vi.mock('./detectors/editor.js', () => ({
  getEditorConfigPath: vi.fn((editor: string) => {
    if (editor === 'vscode') return '/home/user/.config/Code/User/globalStorage/claude-mcp.json';
    if (editor === 'cursor') return '/home/user/.cursor/mcp.json';
    return null;
  }),
}));

describe('validateConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return no issues for valid configuration', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const selections: WizardSelections = {
      editor: 'vscode',
      mcps: ['smart-reviewer', 'test-generator'],
      preferences: {
        reviewSeverity: 'moderate',
        testFramework: 'vitest',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toHaveLength(0);
  });

  it('should detect when no MCPs are selected', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const selections: WizardSelections = {
      editor: 'vscode',
      mcps: [],
      preferences: {
        reviewSeverity: 'moderate',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toContain('No MCP tools selected');
  });

  it('should detect unknown editor', async () => {
    const selections: WizardSelections = {
      editor: 'unknown-editor',
      mcps: ['smart-reviewer'],
      preferences: {
        reviewSeverity: 'moderate',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toContain('Unknown editor: unknown-editor');
  });

  it('should detect existing config file', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(true);

    const selections: WizardSelections = {
      editor: 'vscode',
      mcps: ['smart-reviewer'],
      preferences: {
        reviewSeverity: 'moderate',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toContainEqual(expect.stringContaining('Config file already exists'));
    expect(issues).toContainEqual(expect.stringContaining('--force'));
  });

  it('should detect config directory creation failure', async () => {
    vi.mocked(fs.ensureDir).mockRejectedValue(new Error('Permission denied'));
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const selections: WizardSelections = {
      editor: 'vscode',
      mcps: ['smart-reviewer'],
      preferences: {
        reviewSeverity: 'moderate',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toContainEqual(expect.stringContaining('Cannot create config directory'));
  });

  it('should work with cursor editor', async () => {
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const selections: WizardSelections = {
      editor: 'cursor',
      mcps: ['test-generator'],
      preferences: {
        reviewSeverity: 'strict',
        installGlobally: true,
      },
    };

    const issues = await validateConfig(selections, {});

    expect(issues).toHaveLength(0);
  });
});
