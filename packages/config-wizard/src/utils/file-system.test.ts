/**
 * Tests for file-system utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { writeConfigFile, backupConfigFile } from './file-system.js';

vi.mock('fs-extra');
vi.mock('../detectors/editor.js', () => ({
  getEditorConfigPath: vi.fn((editor: string) => {
    if (editor === 'vscode') return '/home/user/.config/Code/User/globalStorage/claude-mcp.json';
    if (editor === 'cursor') return '/home/user/.cursor/mcp.json';
    return null;
  })
}));

describe('writeConfigFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write config file to detected editor path', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: { 'smart-reviewer': { command: 'npx', args: ['@j0kz/smart-reviewer-mcp'] } } };
    const result = await writeConfigFile(config, 'vscode');

    expect(result).toContain('claude-mcp.json');
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('claude-mcp.json'),
      config,
      { spaces: 2 }
    );
  });

  it('should write config file to custom path', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const customPath = '/custom/path/mcp.json';
    const result = await writeConfigFile(config, 'vscode', customPath);

    expect(result).toBe(customPath);
    expect(fs.writeJSON).toHaveBeenCalledWith(customPath, config, { spaces: 2 });
  });

  it('should throw error if file exists and force is false', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);

    const config = { mcpServers: {} };

    await expect(writeConfigFile(config, 'vscode', undefined, false))
      .rejects.toThrow('Config file already exists');
  });

  it('should overwrite file if force is true', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'vscode', undefined, true);

    expect(result).toContain('claude-mcp.json');
    expect(fs.writeJSON).toHaveBeenCalled();
  });

  it('should throw error if editor config path cannot be determined', async () => {
    const config = { mcpServers: {} };

    await expect(writeConfigFile(config, 'unknown-editor'))
      .rejects.toThrow('Cannot determine config path for editor: unknown-editor');
  });

  it('should ensure directory exists before writing', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    await writeConfigFile(config, 'vscode');

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.any(String));
  });
});

describe('backupConfigFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create backup file with timestamp', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.copy).mockResolvedValue(undefined);

    const configPath = '/home/user/.config/mcp.json';
    const result = await backupConfigFile(configPath);

    expect(result).toMatch(/\/home\/user\/\.config\/mcp\.json\.backup\.\d+/);
    expect(fs.copy).toHaveBeenCalledWith(
      configPath,
      expect.stringMatching(/mcp\.json\.backup\.\d+/)
    );
  });

  it('should return null if file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const result = await backupConfigFile('/nonexistent.json');

    expect(result).toBeNull();
    expect(fs.copy).not.toHaveBeenCalled();
  });
});
