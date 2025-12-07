/**
 * Tests for environment-detector.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvironmentDetector } from '../src/runtime/environment-detector.js';

describe('EnvironmentDetector', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('detect', () => {
    it('should return complete runtime environment', () => {
      const env = EnvironmentDetector.detect();

      expect(env).toHaveProperty('ide');
      expect(env).toHaveProperty('ideVersion');
      expect(env).toHaveProperty('transport');
      expect(env).toHaveProperty('locale');
      expect(env).toHaveProperty('platform');
      expect(env).toHaveProperty('arch');
      expect(env).toHaveProperty('nodeVersion');
      expect(env).toHaveProperty('workingDir');
      expect(env).toHaveProperty('homeDir');
      expect(env).toHaveProperty('projectRoot');
      expect(env).toHaveProperty('caseSensitiveFS');
      expect(env).toHaveProperty('pathSeparator');
    });

    it('should detect node version', () => {
      const env = EnvironmentDetector.detect();
      expect(env.nodeVersion).toBe(process.version);
    });

    it('should detect platform', () => {
      const env = EnvironmentDetector.detect();
      expect(env.platform).toBe(process.platform);
    });

    it('should detect arch', () => {
      const env = EnvironmentDetector.detect();
      expect(env.arch).toBe(process.arch);
    });
  });

  describe('IDE detection', () => {
    it('should detect claude-code from environment', () => {
      process.env.CLAUDE_CODE_VERSION = '1.0.0';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('claude-code');
    });

    it('should detect cursor from environment', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      process.env.CURSOR_VERSION = '0.1.0';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('cursor');
    });

    it('should detect windsurf from environment', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      process.env.WINDSURF_VERSION = '1.0.0';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('windsurf');
    });

    it('should detect qoder from environment', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      process.env.QODER_VERSION = '1.0.0';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('qoder');
    });

    it('should detect roo-code from environment', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      delete process.env.QODER_VERSION;
      process.env.ROO_CODE_VERSION = '1.0.0';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('roo-code');
    });

    it('should detect vscode from VSCODE_PID', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      delete process.env.QODER_VERSION;
      delete process.env.ROO_CODE_VERSION;
      process.env.VSCODE_PID = '12345';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('vscode');
    });

    it('should use MCP_IDE override', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      delete process.env.QODER_VERSION;
      delete process.env.ROO_CODE_VERSION;
      delete process.env.VSCODE_PID;
      process.env.MCP_IDE = 'custom-ide';

      const env = EnvironmentDetector.detect();
      expect(env.ide).toBe('custom-ide');
    });
  });

  describe('IDE version detection', () => {
    it('should return version for claude-code', () => {
      process.env.CLAUDE_CODE_VERSION = '1.2.3';

      const env = EnvironmentDetector.detect();
      expect(env.ideVersion).toBe('1.2.3');
    });

    it('should return null when no version available', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      delete process.env.QODER_VERSION;

      const env = EnvironmentDetector.detect();
      expect(env.ideVersion).toBeNull();
    });
  });

  describe('transport detection', () => {
    it('should detect stdio from explicit environment variable', () => {
      process.env.MCP_TRANSPORT = 'stdio';

      const env = EnvironmentDetector.detect();
      expect(env.transport).toBe('stdio');
    });

    it('should detect sse from explicit environment variable', () => {
      process.env.MCP_TRANSPORT = 'sse';

      const env = EnvironmentDetector.detect();
      expect(env.transport).toBe('sse');
    });

    it('should detect websocket from explicit environment variable', () => {
      process.env.MCP_TRANSPORT = 'websocket';

      const env = EnvironmentDetector.detect();
      expect(env.transport).toBe('websocket');
    });

    it('should detect sse from PORT environment variable', () => {
      delete process.env.MCP_TRANSPORT;
      process.env.PORT = '3000';

      const env = EnvironmentDetector.detect();
      expect(env.transport).toBe('sse');
    });

    it('should detect sse from HTTP_SERVER environment variable', () => {
      delete process.env.MCP_TRANSPORT;
      delete process.env.PORT;
      process.env.HTTP_SERVER = 'true';

      const env = EnvironmentDetector.detect();
      expect(env.transport).toBe('sse');
    });
  });

  describe('locale detection', () => {
    it('should use MCP_LOCALE override', () => {
      process.env.MCP_LOCALE = 'de_DE';

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('de_DE');
    });

    it('should detect from LANG', () => {
      delete process.env.MCP_LOCALE;
      process.env.LANG = 'fr_FR.UTF-8';

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('fr_FR');
    });

    it('should detect from LANGUAGE', () => {
      delete process.env.MCP_LOCALE;
      delete process.env.LANG;
      process.env.LANGUAGE = 'es_ES:en_US';

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('es_ES');
    });

    it('should detect from LC_ALL', () => {
      delete process.env.MCP_LOCALE;
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      process.env.LC_ALL = 'it_IT.UTF-8';

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('it_IT');
    });

    it('should detect from LC_MESSAGES', () => {
      delete process.env.MCP_LOCALE;
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_ALL;
      process.env.LC_MESSAGES = 'pt_BR.UTF-8';

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('pt_BR');
    });

    it('should default to en_US', () => {
      delete process.env.MCP_LOCALE;
      delete process.env.LANG;
      delete process.env.LANGUAGE;
      delete process.env.LC_ALL;
      delete process.env.LC_MESSAGES;

      const env = EnvironmentDetector.detect();
      expect(env.locale).toBe('en_US');
    });
  });

  describe('project root detection', () => {
    it('should use MCP_PROJECT_ROOT override', () => {
      process.env.MCP_PROJECT_ROOT = '/custom/project';

      const env = EnvironmentDetector.detect();
      expect(env.projectRoot).toBe('/custom/project');
    });

    it('should detect project root from current directory', () => {
      delete process.env.MCP_PROJECT_ROOT;

      const env = EnvironmentDetector.detect();
      // Should find package.json in monorepo
      expect(env.projectRoot).not.toBeNull();
    });
  });

  describe('filesystem case sensitivity', () => {
    it('should correctly identify case sensitivity based on platform', () => {
      const env = EnvironmentDetector.detect();

      // Windows and macOS are case-insensitive
      if (process.platform === 'win32' || process.platform === 'darwin') {
        expect(env.caseSensitiveFS).toBe(false);
      } else {
        // Linux and others are case-sensitive
        expect(env.caseSensitiveFS).toBe(true);
      }
    });
  });

  describe('getDebugInfo', () => {
    it('should return detailed debug information', () => {
      const debugInfo = EnvironmentDetector.getDebugInfo();

      expect(debugInfo).toHaveProperty('timestamp');
      expect(debugInfo).toHaveProperty('processId');
      expect(debugInfo).toHaveProperty('parentProcessId');
      expect(debugInfo).toHaveProperty('uptime');
      expect(debugInfo).toHaveProperty('memoryUsage');
      expect(debugInfo).toHaveProperty('environmentVariables');
      expect(debugInfo).toHaveProperty('ide');
      expect(debugInfo).toHaveProperty('locale');
    });

    it('should include MCP environment variables', () => {
      process.env.MCP_IDE = 'test-ide';
      process.env.MCP_LOCALE = 'test-locale';

      const debugInfo = EnvironmentDetector.getDebugInfo();
      const envVars = debugInfo.environmentVariables as Record<string, unknown>;

      expect(envVars.MCP_IDE).toBe('test-ide');
      expect(envVars.MCP_LOCALE).toBe('test-locale');
    });
  });

  describe('isIDE', () => {
    it('should return true for matching IDE', () => {
      process.env.CLAUDE_CODE_VERSION = '1.0.0';

      expect(EnvironmentDetector.isIDE('claude-code')).toBe(true);
      expect(EnvironmentDetector.isIDE('CLAUDE-CODE')).toBe(true); // Case insensitive
    });

    it('should return false for non-matching IDE', () => {
      process.env.CLAUDE_CODE_VERSION = '1.0.0';

      expect(EnvironmentDetector.isIDE('cursor')).toBe(false);
      expect(EnvironmentDetector.isIDE('vscode')).toBe(false);
    });
  });

  describe('isKnownIDE', () => {
    it('should return true for known IDEs', () => {
      process.env.CLAUDE_CODE_VERSION = '1.0.0';
      expect(EnvironmentDetector.isKnownIDE()).toBe(true);
    });

    it('should return true for vscode', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      process.env.VSCODE_PID = '12345';
      expect(EnvironmentDetector.isKnownIDE()).toBe(true);
    });

    it('should return false for unknown IDEs', () => {
      delete process.env.CLAUDE_CODE_VERSION;
      delete process.env.CURSOR_VERSION;
      delete process.env.WINDSURF_VERSION;
      delete process.env.QODER_VERSION;
      delete process.env.ROO_CODE_VERSION;
      delete process.env.VSCODE_PID;
      delete process.env.MCP_IDE;

      expect(EnvironmentDetector.isKnownIDE()).toBe(false);
    });
  });
});
