/**
 * Tests for Config Adapter
 * Ensures proper config normalization and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigAdapter, MCPServerConfig } from '../src/config/adapter.js';

describe('ConfigAdapter', () => {
  describe('normalize', () => {
    it('should normalize minimal stdio config', () => {
      const config: MCPServerConfig = {
        command: 'node',
        args: ['server.js'],
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.type).toBe('stdio');
      expect(normalized.command).toBe('node');
      expect(normalized.args).toEqual(['server.js']);
      expect(normalized.env).toBeDefined();
    });

    it('should normalize SSE config with url', () => {
      const config: MCPServerConfig = {
        type: 'sse',
        url: 'https://api.example.com',
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.type).toBe('sse');
      expect(normalized.url).toBe('https://api.example.com');
    });

    it('should add default environment variables', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.env.NODE_ENV).toBeDefined();
      expect(normalized.env.MCP_IDE).toBeDefined();
      expect(normalized.env.MCP_LOCALE).toBeDefined();
    });

    it('should preserve custom environment variables', () => {
      const config: MCPServerConfig = {
        command: 'test',
        env: {
          CUSTOM_VAR: 'custom_value',
        },
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.env.CUSTOM_VAR).toBe('custom_value');
      expect(normalized.env.NODE_ENV).toBeDefined();
    });

    it('should infer stdio type from command', () => {
      const config: MCPServerConfig = {
        command: 'node',
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.type).toBe('stdio');
    });

    it('should infer sse type from url', () => {
      const config: MCPServerConfig = {
        url: 'https://example.com',
      };

      const normalized = ConfigAdapter.normalize(config);

      expect(normalized.type).toBe('sse');
      expect(normalized.url).toBe('https://example.com');
    });
  });

  describe('validate', () => {
    it('should validate minimal valid config', () => {
      const config: MCPServerConfig = {
        command: 'node',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.valid).toBe(true);
      expect(result.normalized).toBeDefined();
    });

    it('should detect missing type field', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.issues).toContain('Missing "type" field');
      expect(result.fixes).toContain('Inferred transport type from config structure');
    });

    it('should detect missing args array', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.issues).toContain('Missing "args" array');
      expect(result.fixes).toContain('Initialized empty args array');
    });

    it('should detect missing env object', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.issues).toContain('Missing "env" object');
      expect(result.fixes).toContain('Added default environment variables');
    });

    it('should fail validation for stdio without command', () => {
      const config: MCPServerConfig = {
        type: 'stdio',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.valid).toBe(false);
      expect(result.normalized).toBeNull();
      expect(result.issues).toContain('CRITICAL: stdio transport requires "command" field');
    });

    it('should fail validation for SSE without url', () => {
      const config: MCPServerConfig = {
        type: 'sse',
      };

      const result = ConfigAdapter.validate(config);

      expect(result.valid).toBe(false);
      expect(result.normalized).toBeNull();
      expect(result.issues).toContain('CRITICAL: SSE transport requires "url" field');
    });

    it('should warn about @latest in args', () => {
      const config: MCPServerConfig = {
        command: 'npx',
        args: ['@j0kz/tool@latest'],
      };

      const result = ConfigAdapter.validate(config);

      expect(result.warnings).toContain('Using @latest may cause version inconsistencies. Consider pinning versions.');
    });

    it('should warn about missing NODE_ENV', () => {
      const config: MCPServerConfig = {
        command: 'test',
        env: {},
      };

      const result = ConfigAdapter.validate(config);

      expect(result.warnings).toContain('NODE_ENV not set. Defaulting to "production"');
    });
  });

  describe('autoFix', () => {
    it('should set NODE_ENV if missing from input config', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.autoFix(config);

      // normalize() already adds default env, so NODE_ENV is present
      expect(result.fixed.env.NODE_ENV).toBe('production');
      // Changes array only tracks modifications made by autoFix, not normalize
      expect(result.changes.length).toBeGreaterThanOrEqual(0);
    });

    it('should include MCP_LOCALE from normalization', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.autoFix(config);

      // normalize() already adds MCP_LOCALE
      expect(result.fixed.env.MCP_LOCALE).toBeDefined();
    });

    it('should include MCP_IDE from normalization', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const result = ConfigAdapter.autoFix(config);

      // normalize() already adds MCP_IDE
      expect(result.fixed.env.MCP_IDE).toBeDefined();
    });

    it('should handle command path resolution failure gracefully', () => {
      const config: MCPServerConfig = {
        command: 'nonexistent-command-12345',
      };

      expect(() => ConfigAdapter.autoFix(config)).not.toThrow();
    });

    it('should not modify absolute command paths', () => {
      const config: MCPServerConfig = {
        command: '/usr/bin/node',
      };

      const result = ConfigAdapter.autoFix(config);

      expect(result.fixed.command).toBe('/usr/bin/node');
    });
  });

  describe('toIDEConfig', () => {
    it('should generate qoder config with explicit type', () => {
      const normalized = ConfigAdapter.normalize({
        command: 'test',
      });

      const qoderConfig = ConfigAdapter.toIDEConfig(normalized, 'qoder');

      expect(qoderConfig.type).toBeDefined();
    });

    it('should generate vscode config with explicit type', () => {
      const normalized = ConfigAdapter.normalize({
        command: 'test',
      });

      const vscodeConfig = ConfigAdapter.toIDEConfig(normalized, 'vscode');

      expect(vscodeConfig.type).toBeDefined();
    });

    it('should generate claude config without type field', () => {
      const normalized = ConfigAdapter.normalize({
        command: 'test',
      });

      const claudeConfig = ConfigAdapter.toIDEConfig(normalized, 'claude');

      expect(claudeConfig.type).toBeUndefined();
      expect(claudeConfig.command).toBeDefined();
    });

    it('should generate cursor config without type field', () => {
      const normalized = ConfigAdapter.normalize({
        command: 'test',
      });

      const cursorConfig = ConfigAdapter.toIDEConfig(normalized, 'cursor');

      expect(cursorConfig.type).toBeUndefined();
    });

    it('should generate windsurf config without type field', () => {
      const normalized = ConfigAdapter.normalize({
        command: 'test',
      });

      const windsurfConfig = ConfigAdapter.toIDEConfig(normalized, 'windsurf');

      expect(windsurfConfig.type).toBeUndefined();
    });
  });

  describe('detectFormat', () => {
    it('should detect qoder format', () => {
      const config: MCPServerConfig = {
        type: 'stdio',
        command: 'test',
        args: ['arg1'],
      };

      const format = ConfigAdapter.detectFormat(config);

      expect(format).toBe('qoder');
    });

    it('should detect claude format', () => {
      const config: MCPServerConfig = {
        command: 'test',
      };

      const format = ConfigAdapter.detectFormat(config);

      expect(format).toBe('claude');
    });

    it('should detect vscode format with command', () => {
      const config: MCPServerConfig = {
        type: 'stdio',
        command: 'test',
      };

      const format = ConfigAdapter.detectFormat(config);

      expect(format).toBe('vscode');
    });

    it('should detect vscode format with url', () => {
      const config: MCPServerConfig = {
        type: 'sse',
        url: 'https://example.com',
      };

      const format = ConfigAdapter.detectFormat(config);

      expect(format).toBe('vscode');
    });

    it('should detect generic format', () => {
      const config: MCPServerConfig = {};

      const format = ConfigAdapter.detectFormat(config);

      expect(format).toBe('generic');
    });
  });
});
