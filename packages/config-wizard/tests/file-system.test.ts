/**
 * Tests for file-system utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeConfigFile, backupConfigFile } from '../src/utils/file-system.js';
import fs from 'fs-extra';

vi.mock('fs-extra');

describe('writeConfigFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write config file to default path for claude-code', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'claude-code');

    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('mcp_settings.json'),
      config,
      { spaces: 2 }
    );
    expect(result).toContain('mcp_settings.json');
  });

  it('should write config file to custom path', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const customPath = '/custom/path/config.json';
    const result = await writeConfigFile(config, 'claude-code', customPath);

    expect(fs.ensureDir).toHaveBeenCalledWith('/custom/path');
    expect(fs.writeJSON).toHaveBeenCalledWith(customPath, config, { spaces: 2 });
    expect(result).toBe(customPath);
  });

  it('should throw error if file exists and force is false', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);

    const config = { mcpServers: {} };

    await expect(writeConfigFile(config, 'claude-code')).rejects.toThrow(
      /Config file already exists.*Use --force to overwrite/
    );
  });

  it('should overwrite file when force is true', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'claude-code', undefined, true);

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('mcp_settings.json');
  });

  it('should throw error for unknown editor without custom path', async () => {
    await expect(writeConfigFile({}, 'unknown-editor')).rejects.toThrow(
      /Cannot determine config path for editor/
    );
  });

  it('should write config for cursor editor', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'cursor');

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('mcp_config.json');
  });

  it('should write config for windsurf editor', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'windsurf');

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('mcp_config.json');
  });

  it('should write config for vscode editor', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'vscode');

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('config.json');
  });

  it('should write config for roo editor', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'roo');

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('mcp_config.json');
  });

  it('should write config for qoder editor', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.writeJSON).mockResolvedValue(undefined);

    const config = { mcpServers: {} };
    const result = await writeConfigFile(config, 'qoder');

    expect(fs.writeJSON).toHaveBeenCalled();
    expect(result).toContain('mcp-config.json');
  });
});

describe('backupConfigFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if file does not exist', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const result = await backupConfigFile('/path/to/config.json');

    expect(result).toBeNull();
    expect(fs.copy).not.toHaveBeenCalled();
  });

  it('should create backup with timestamp', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.copy).mockResolvedValue(undefined);

    const configPath = '/path/to/config.json';
    const result = await backupConfigFile(configPath);

    expect(fs.copy).toHaveBeenCalledWith(
      configPath,
      expect.stringMatching(/config\.json\.backup\.\d+/)
    );
    expect(result).toMatch(/config\.json\.backup\.\d+/);
  });

  it('should include original path in backup path', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    vi.mocked(fs.copy).mockResolvedValue(undefined);

    const configPath = '/custom/path/settings.json';
    const result = await backupConfigFile(configPath);

    expect(result).toContain('/custom/path/settings.json.backup.');
  });
});
