/**
 * Tests for editor detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectEditor,
  detectInstalledEditors,
  getEditorConfigPath,
} from '../src/detectors/editor.js';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

vi.mock('fs-extra');
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

describe('editor detection', () => {
  const originalPlatform = process.platform;
  const originalEnv = { ...process.env };
  const mockHomedir = '/home/testuser';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(os, 'homedir').mockReturnValue(mockHomedir);
    // Reset to non-win32 by default
    Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
    process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
    process.env.LOCALAPPDATA = 'C:\\Users\\Test\\AppData\\Local';
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform, writable: true });
    process.env = originalEnv;
  });

  describe('detectEditor', () => {
    it('should return null if no editor is detected', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBeNull();
    });

    it('should detect claude-code from config directory', async () => {
      // The code checks path.dirname(configPath) which is the directory containing mcp_settings.json
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        // Match .config/claude-code directory (without the file)
        return pathStr === path.join(mockHomedir, '.config', 'claude-code');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('claude-code');
    });

    it('should detect claude-code from .claude-code directory', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join(mockHomedir, '.claude-code');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('claude-code');
    });

    it('should detect claude-code from CLI command', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'claude') {
          return { stdout: 'claude 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectEditor();

      expect(result).toBe('claude-code');
    });

    it('should detect cursor from config directory on non-win32', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join(mockHomedir, '.cursor');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('cursor');
    });

    it('should detect cursor from config directory on win32', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        // path.dirname of C:\Users\Test\AppData\Roaming\Cursor\User\mcp_config.json
        return pathStr === path.join('C:\\Users\\Test\\AppData\\Roaming', 'Cursor', 'User');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('cursor');
    });

    it('should detect cursor from CLI command', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'cursor') {
          return { stdout: 'cursor 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectEditor();

      expect(result).toBe('cursor');
    });

    it('should detect windsurf from config directory on non-win32', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join(mockHomedir, '.windsurf');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('windsurf');
    });

    it('should detect windsurf from config directory on win32', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join('C:\\Users\\Test\\AppData\\Roaming', 'Windsurf', 'User');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('windsurf');
    });

    it('should detect vscode with Continue extension from settings file', async () => {
      // VSCode detection checks fs.pathExists on the config file itself (not dirname)
      const configPath = path.join(mockHomedir, '.config', 'Code', 'User', 'settings.json');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockResolvedValue({ mcp: true });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('vscode');
    });

    it('should detect vscode with continue.enableMCP setting', async () => {
      const configPath = path.join(mockHomedir, '.config', 'Code', 'User', 'settings.json');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockResolvedValue({ 'continue.enableMCP': true });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('vscode');
    });

    it('should detect vscode from CLI command', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'code') {
          return { stdout: 'code 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectEditor();

      expect(result).toBe('vscode');
    });

    it('should not detect vscode if settings missing MCP config', async () => {
      const configPath = path.join(mockHomedir, '.config', 'Code', 'User', 'settings.json');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockResolvedValue({});
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBeNull();
    });

    it('should detect roo from CLI command', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'roo') {
          return { stdout: 'roo 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectEditor();

      expect(result).toBe('roo');
    });

    it('should detect qoder from config directory on linux', async () => {
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join(mockHomedir, '.qoder');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });

    it('should detect qoder from config directory on darwin', async () => {
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join(mockHomedir, 'Library', 'Application Support', 'Qoder');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });

    it('should detect qoder from config directory on win32', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return pathStr === path.join('C:\\Users\\Test\\AppData\\Roaming', 'Qoder');
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });

    it('should detect qoder from CLI command', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'qoder') {
          return { stdout: 'qoder 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });

    it('should return first detected editor (prioritizes claude-code)', async () => {
      // Mock both claude-code and cursor as installed - claude-code should be detected first
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return (
          pathStr === path.join(mockHomedir, '.config', 'claude-code') ||
          pathStr === path.join(mockHomedir, '.cursor')
        );
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('claude-code');
    });
  });

  describe('detectInstalledEditors', () => {
    it('should return empty array if no editors installed', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectInstalledEditors();

      expect(result).toEqual([]);
    });

    it('should return all installed editors', async () => {
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        const pathStr = String(p);
        return (
          pathStr === path.join(mockHomedir, '.config', 'claude-code') ||
          pathStr === path.join(mockHomedir, '.cursor')
        );
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectInstalledEditors();

      expect(result).toContain('claude-code');
      expect(result).toContain('cursor');
    });

    it('should include editors detected by CLI', async () => {
      vi.mocked(fs.pathExists).mockResolvedValue(false);
      const { execa } = await import('execa');
      vi.mocked(execa).mockImplementation(async (cmd: string) => {
        if (cmd === 'roo') {
          return { stdout: 'roo 1.0.0', stderr: '', exitCode: 0 } as unknown as ReturnType<
            typeof execa
          >;
        }
        throw new Error('not found');
      });

      const result = await detectInstalledEditors();

      expect(result).toContain('roo');
    });
  });

  describe('getEditorConfigPath', () => {
    it('should return null for null editor', () => {
      const result = getEditorConfigPath(null);
      expect(result).toBeNull();
    });

    it('should return correct path for claude-code', () => {
      const result = getEditorConfigPath('claude-code');
      expect(result).toBe(path.join(mockHomedir, '.config', 'claude-code', 'mcp_settings.json'));
    });

    it('should return correct path for cursor on non-win32', () => {
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      const result = getEditorConfigPath('cursor');
      expect(result).toBe(path.join(mockHomedir, '.cursor', 'mcp_config.json'));
    });

    it('should return correct path for cursor on win32', () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      const result = getEditorConfigPath('cursor');
      expect(result).toBe(
        path.join('C:\\Users\\Test\\AppData\\Roaming', 'Cursor', 'User', 'mcp_config.json')
      );
    });

    it('should return correct path for windsurf on non-win32', () => {
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      const result = getEditorConfigPath('windsurf');
      expect(result).toBe(path.join(mockHomedir, '.windsurf', 'mcp_config.json'));
    });

    it('should return correct path for windsurf on win32', () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      const result = getEditorConfigPath('windsurf');
      expect(result).toBe(
        path.join('C:\\Users\\Test\\AppData\\Roaming', 'Windsurf', 'User', 'mcp_config.json')
      );
    });

    it('should return correct path for vscode', () => {
      const result = getEditorConfigPath('vscode');
      expect(result).toBe(path.join(mockHomedir, '.continue', 'config.json'));
    });

    it('should return correct path for roo', () => {
      const result = getEditorConfigPath('roo');
      expect(result).toBe(path.join(mockHomedir, '.roo', 'mcp_config.json'));
    });

    it('should return correct path for qoder on linux', () => {
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      const result = getEditorConfigPath('qoder');
      expect(result).toBe(path.join(mockHomedir, '.qoder', 'mcp-config.json'));
    });

    it('should return correct path for qoder on darwin', () => {
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      const result = getEditorConfigPath('qoder');
      expect(result).toBe(
        path.join(mockHomedir, 'Library', 'Application Support', 'Qoder', 'mcp-config.json')
      );
    });

    it('should return correct path for qoder on win32', () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      const result = getEditorConfigPath('qoder');
      expect(result).toBe(
        path.join('C:\\Users\\Test\\AppData\\Roaming', 'Qoder', 'mcp-config.json')
      );
    });

    it('should return null for unknown editor', () => {
      // @ts-expect-error - testing invalid input
      const result = getEditorConfigPath('unknown-editor');
      expect(result).toBeNull();
    });
  });

  describe('vscode detection edge cases', () => {
    it('should handle readJSON error gracefully', async () => {
      const configPath = path.join(mockHomedir, '.config', 'Code', 'User', 'settings.json');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockRejectedValue(new Error('file read error'));
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      // Should not throw and should continue checking other methods
      expect(result).toBeNull();
    });

    it('should detect vscode on win32 from APPDATA path', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      const configPath = path.join(
        'C:\\Users\\Test\\AppData\\Roaming',
        'Code',
        'User',
        'settings.json'
      );
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockResolvedValue({ mcp: true });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('vscode');
    });

    it('should detect vscode on darwin from Library path', async () => {
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      const configPath = path.join(
        mockHomedir,
        'Library',
        'Application Support',
        'Code',
        'User',
        'settings.json'
      );
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configPath;
      });
      vi.mocked(fs.readJSON).mockResolvedValue({ mcp: true });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('vscode');
    });
  });

  describe('cursor detection edge cases', () => {
    it('should detect cursor on darwin from Library path', async () => {
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      // On darwin (non-win32), cursor looks at .cursor and Library paths, checking dirname
      const libraryDir = path.join(mockHomedir, 'Library', 'Application Support', 'Cursor', 'User');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === libraryDir;
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('cursor');
    });
  });

  describe('windsurf detection edge cases', () => {
    it('should detect windsurf on darwin from Library path', async () => {
      Object.defineProperty(process, 'platform', { value: 'darwin', writable: true });
      const libraryDir = path.join(
        mockHomedir,
        'Library',
        'Application Support',
        'Windsurf',
        'User'
      );
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === libraryDir;
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('windsurf');
    });
  });

  describe('qoder detection edge cases', () => {
    it('should check LOCALAPPDATA path on win32', async () => {
      Object.defineProperty(process, 'platform', { value: 'win32', writable: true });
      // The qoder detection on win32 checks dirname of both APPDATA and LOCALAPPDATA paths
      const localDir = path.join('C:\\Users\\Test\\AppData\\Local', 'Qoder');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === localDir;
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });

    it('should check .config/qoder path on linux', async () => {
      Object.defineProperty(process, 'platform', { value: 'linux', writable: true });
      const configDir = path.join(mockHomedir, '.config', 'qoder');
      vi.mocked(fs.pathExists).mockImplementation(async p => {
        return p === configDir;
      });
      const { execa } = await import('execa');
      vi.mocked(execa).mockRejectedValue(new Error('not found'));

      const result = await detectEditor();

      expect(result).toBe('qoder');
    });
  });
});
