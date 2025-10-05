/**
 * Tests for MCP package installer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { installMCPs } from './installer.js';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' })
}));

// Mock spinner
vi.mock('./utils/spinner.js', () => ({
  spinner: vi.fn(() => ({
    text: '',
    succeed: vi.fn(),
    fail: vi.fn()
  }))
}));

// Mock logger
vi.mock('./utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('installMCPs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should install valid MCP packages', async () => {
    const { execa } = await import('execa');

    await installMCPs(['smart-reviewer', 'test-generator']);

    expect(execa).toHaveBeenCalledTimes(2);
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-g', '@j0kz/smart-reviewer-mcp@^1.0.0'],
      { stdio: 'pipe' }
    );
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-g', '@j0kz/test-generator-mcp@^1.0.0'],
      { stdio: 'pipe' }
    );
  });

  it('should skip unknown MCPs and log warning', async () => {
    const { logger } = await import('./utils/logger.js');
    const { execa } = await import('execa');

    await installMCPs(['smart-reviewer', 'unknown-mcp']);

    expect(logger.warn).toHaveBeenCalledWith('Unknown MCP: unknown-mcp');
    expect(execa).toHaveBeenCalledTimes(1); // Only smart-reviewer
  });

  it('should handle installation errors', async () => {
    const { execa } = await import('execa');
    const error = new Error('npm install failed');
    vi.mocked(execa).mockRejectedValueOnce(error);

    await expect(installMCPs(['smart-reviewer'])).rejects.toThrow('npm install failed');
  });

  it('should use verbose output when requested', async () => {
    const { execa } = await import('execa');

    await installMCPs(['smart-reviewer'], true);

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-g', '@j0kz/smart-reviewer-mcp@^1.0.0'],
      { stdio: 'inherit' }
    );
  });

  it('should install multiple packages in sequence', async () => {
    const { execa } = await import('execa');
    const mockExeca = vi.mocked(execa);

    const calls: string[] = [];
    mockExeca.mockImplementation(async (cmd, args) => {
      calls.push(args[2]); // Package name
      return { stdout: '', stderr: '' } as any;
    });

    await installMCPs(['smart-reviewer', 'test-generator', 'security-scanner']);

    expect(calls).toEqual([
      '@j0kz/smart-reviewer-mcp@^1.0.0',
      '@j0kz/test-generator-mcp@^1.0.0',
      '@j0kz/security-scanner-mcp@^1.0.0'
    ]);
  });

  it('should handle empty MCP list', async () => {
    const { execa } = await import('execa');

    await installMCPs([]);

    expect(execa).not.toHaveBeenCalled();
  });
});
