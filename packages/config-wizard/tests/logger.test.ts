/**
 * Tests for logger utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../src/utils/logger.js';

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    bold: {
      cyan: vi.fn((str: string) => `[bold.cyan]${str}`),
    },
    gray: vi.fn((str: string) => `[gray]${str}`),
    green: vi.fn((str: string) => `[green]${str}`),
    blue: vi.fn((str: string) => `[blue]${str}`),
    yellow: vi.fn((str: string) => `[yellow]${str}`),
    red: vi.fn((str: string) => `[red]${str}`),
    dim: vi.fn((str: string) => `[dim]${str}`),
  },
}));

describe('logger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('header', () => {
    it('should log header with bold cyan formatting', () => {
      logger.header('Test Header');

      expect(consoleSpy).toHaveBeenCalledWith('[bold.cyan]\nTest Header');
    });

    it('should prepend newline to message', () => {
      logger.header('Message');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('\n'));
    });

    it('should handle empty string', () => {
      logger.header('');

      expect(consoleSpy).toHaveBeenCalledWith('[bold.cyan]\n');
    });
  });

  describe('divider', () => {
    it('should log gray divider line', () => {
      logger.divider();

      expect(consoleSpy).toHaveBeenCalled();
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('[gray]');
      expect(call).toContain('─');
    });

    it('should create 40-character divider', () => {
      logger.divider();

      const call = consoleSpy.mock.calls[0][0];
      // Count the ─ characters (excluding the [gray] prefix)
      const dividerContent = call.replace('[gray]', '');
      expect(dividerContent.length).toBe(40);
    });
  });

  describe('success', () => {
    it('should log success message in green', () => {
      logger.success('Operation completed');

      expect(consoleSpy).toHaveBeenCalledWith('[green]Operation completed');
    });

    it('should handle empty string', () => {
      logger.success('');

      expect(consoleSpy).toHaveBeenCalledWith('[green]');
    });
  });

  describe('info', () => {
    it('should log info message in blue', () => {
      logger.info('Information message');

      expect(consoleSpy).toHaveBeenCalledWith('[blue]Information message');
    });

    it('should handle empty string', () => {
      logger.info('');

      expect(consoleSpy).toHaveBeenCalledWith('[blue]');
    });
  });

  describe('warn', () => {
    it('should log warning message in yellow', () => {
      logger.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalledWith('[yellow]Warning message');
    });

    it('should handle empty string', () => {
      logger.warn('');

      expect(consoleSpy).toHaveBeenCalledWith('[yellow]');
    });
  });

  describe('error', () => {
    it('should log error message in red', () => {
      logger.error('Error occurred');

      expect(consoleSpy).toHaveBeenCalledWith('[red]Error occurred');
    });

    it('should handle empty string', () => {
      logger.error('');

      expect(consoleSpy).toHaveBeenCalledWith('[red]');
    });
  });

  describe('dim', () => {
    it('should log dim message', () => {
      logger.dim('Dimmed text');

      expect(consoleSpy).toHaveBeenCalledWith('[dim]Dimmed text');
    });

    it('should handle empty string', () => {
      logger.dim('');

      expect(consoleSpy).toHaveBeenCalledWith('[dim]');
    });
  });

  describe('logger object structure', () => {
    it('should have all expected methods', () => {
      expect(typeof logger.header).toBe('function');
      expect(typeof logger.divider).toBe('function');
      expect(typeof logger.success).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.dim).toBe('function');
    });

    it('should log different message types correctly', () => {
      logger.header('Header');
      logger.success('Success');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');
      logger.dim('Dim');

      expect(consoleSpy).toHaveBeenCalledTimes(6);
    });
  });
});
