/**
 * Tests for MCP installer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock execa before importing the module
vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
}));

// Mock spinner
vi.mock('../src/utils/spinner.js', () => ({
  spinner: vi.fn(() => ({
    text: '',
    succeed: vi.fn(),
    fail: vi.fn(),
  })),
}));

// Mock logger
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

import { installMCPs } from '../src/installer.js';
import { execa } from 'execa';
import { spinner } from '../src/utils/spinner.js';
import { logger } from '../src/utils/logger.js';

describe('MCP Installer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('installMCPs', () => {
    it('should install valid MCP packages', async () => {
      const mcps = ['smart-reviewer', 'security-scanner'];

      await installMCPs(mcps);

      expect(execa).toHaveBeenCalledTimes(2);
      expect(execa).toHaveBeenCalledWith(
        'npm',
        ['install', '-g', '@j0kz/smart-reviewer-mcp@^1.0.0'],
        expect.any(Object)
      );
      expect(execa).toHaveBeenCalledWith(
        'npm',
        ['install', '-g', '@j0kz/security-scanner-mcp@^1.0.0'],
        expect.any(Object)
      );
    });

    it('should warn for unknown MCP packages', async () => {
      const mcps = ['unknown-mcp'];

      await installMCPs(mcps);

      expect(logger.warn).toHaveBeenCalledWith('Unknown MCP: unknown-mcp');
      expect(execa).not.toHaveBeenCalled();
    });

    it('should handle mixed valid and invalid MCPs', async () => {
      const mcps = ['smart-reviewer', 'unknown-mcp', 'test-generator'];

      await installMCPs(mcps);

      expect(logger.warn).toHaveBeenCalledWith('Unknown MCP: unknown-mcp');
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it('should pass verbose flag to execa', async () => {
      const mcps = ['smart-reviewer'];

      await installMCPs(mcps, true);

      expect(execa).toHaveBeenCalledWith(
        'npm',
        expect.any(Array),
        expect.objectContaining({ stdio: 'inherit' })
      );
    });

    it('should use pipe for non-verbose mode', async () => {
      const mcps = ['smart-reviewer'];

      await installMCPs(mcps, false);

      expect(execa).toHaveBeenCalledWith(
        'npm',
        expect.any(Array),
        expect.objectContaining({ stdio: 'pipe' })
      );
    });

    it('should update spinner text during installation', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
        fail: vi.fn(),
      };
      vi.mocked(spinner).mockReturnValue(mockSpinner as any);

      const mcps = ['smart-reviewer'];
      await installMCPs(mcps);

      expect(spinner).toHaveBeenCalledWith('Installing MCP packages...');
    });

    it('should call spinner.succeed on successful installation', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
        fail: vi.fn(),
      };
      vi.mocked(spinner).mockReturnValue(mockSpinner as any);

      const mcps = ['smart-reviewer', 'test-generator'];
      await installMCPs(mcps);

      expect(mockSpinner.succeed).toHaveBeenCalledWith('Installed 2 MCP packages');
    });

    it('should call spinner.fail and throw on installation error', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
        fail: vi.fn(),
      };
      vi.mocked(spinner).mockReturnValue(mockSpinner as any);
      vi.mocked(execa).mockRejectedValueOnce(new Error('npm install failed'));

      const mcps = ['smart-reviewer'];

      await expect(installMCPs(mcps)).rejects.toThrow('npm install failed');
      expect(mockSpinner.fail).toHaveBeenCalledWith('Installation failed');
    });

    it('should install all supported MCP packages', async () => {
      const allMcps = [
        'smart-reviewer',
        'test-generator',
        'architecture-analyzer',
        'doc-generator',
        'security-scanner',
        'refactor-assistant',
        'api-designer',
        'db-schema',
      ];

      await installMCPs(allMcps);

      expect(execa).toHaveBeenCalledTimes(8);
    });

    it('should handle empty MCP array', async () => {
      const mockSpinner = {
        text: '',
        succeed: vi.fn(),
        fail: vi.fn(),
      };
      vi.mocked(spinner).mockReturnValue(mockSpinner as any);

      await installMCPs([]);

      expect(execa).not.toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Installed 0 MCP packages');
    });
  });
});
