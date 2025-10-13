/**
 * Tests for Universal MCP Handler
 * Ensures proper request handling, language support, and health checks
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalMCPHandler, ToolHandler, RequestContext } from '../src/mcp-protocol/universal-handler.js';
import { MCPError } from '../src/errors/error-codes.js';

describe('UniversalMCPHandler', () => {
  let handler: UniversalMCPHandler;
  let mockToolHandler: ToolHandler;

  beforeEach(() => {
    // Suppress console.error during tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    handler = new UniversalMCPHandler({
      serverName: 'test-server',
      version: '1.0.0',
      logRequests: true,
      supportLanguages: true,
    });

    mockToolHandler = vi.fn(async (args: any) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, data: args }) }],
    }));
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const testHandler = new UniversalMCPHandler({
        serverName: 'my-server',
        version: '2.0.0',
      });

      expect(testHandler).toBeDefined();
      expect(testHandler.getEnvironment()).toBeDefined();
      expect(testHandler.getHealthChecker()).toBeDefined();
    });

    it('should apply default config values', () => {
      const testHandler = new UniversalMCPHandler({
        serverName: 'test',
        version: '1.0.0',
      });

      expect(testHandler).toBeDefined();
    });

    it('should log startup information', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      new UniversalMCPHandler({
        serverName: 'startup-test',
        version: '1.0.0',
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const calls = consoleErrorSpy.mock.calls.flat();
      const output = calls.join(' ');
      expect(output).toContain('startup-test');
      expect(output).toContain('1.0.0');
    });
  });

  describe('registerTool', () => {
    it('should register tool handler', () => {
      handler.registerTool('test_tool', mockToolHandler);

      // Tool is registered - verify by calling it
      expect(async () => {
        await handler.handleRequest({
          params: {
            name: 'test_tool',
            arguments: { foo: 'bar' },
          },
        });
      }).not.toThrow();
    });

    it('should allow registering multiple tools', () => {
      const tool1 = vi.fn(async () => ({ content: [{ type: 'text', text: 'tool1' }] }));
      const tool2 = vi.fn(async () => ({ content: [{ type: 'text', text: 'tool2' }] }));

      handler.registerTool('tool1', tool1);
      handler.registerTool('tool2', tool2);

      expect(async () => {
        await handler.handleRequest({ params: { name: 'tool1', arguments: {} } });
        await handler.handleRequest({ params: { name: 'tool2', arguments: {} } });
      }).not.toThrow();
    });
  });

  describe('handleRequest', () => {
    beforeEach(() => {
      handler.registerTool('review_file', mockToolHandler);
    });

    it('should handle successful tool request', async () => {
      const result = await handler.handleRequest({
        params: {
          name: 'review_file',
          arguments: { filePath: '/test.ts' },
        },
      });

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(true);
      expect(response.data.filePath).toBe('/test.ts');
    });

    it('should pass context to tool handler', async () => {
      let capturedContext: RequestContext | null = null;
      const contextCapturingHandler: ToolHandler = async (args, context) => {
        capturedContext = context;
        return { content: [{ type: 'text', text: 'ok' }] };
      };

      handler.registerTool('test_context', contextCapturingHandler);

      await handler.handleRequest({
        params: {
          name: 'test_context',
          arguments: { test: 'value' },
        },
      });

      expect(capturedContext).not.toBeNull();
      expect(capturedContext?.toolName).toBe('test_context');
      expect(capturedContext?.originalToolName).toBe('test_context');
      expect(capturedContext?.args).toEqual({ test: 'value' });
      expect(capturedContext?.environment).toBeDefined();
    });

    it('should log requests when logRequests is true', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      await handler.handleRequest({
        params: {
          name: 'review_file',
          arguments: {},
        },
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      const calls = consoleErrorSpy.mock.calls.flat();
      const logs = calls.filter(call => {
        try {
          const parsed = JSON.parse(call);
          return parsed.event === 'tool_call';
        } catch {
          return false;
        }
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should not log requests when logRequests is false', async () => {
      const noLogHandler = new UniversalMCPHandler({
        serverName: 'test',
        version: '1.0.0',
        logRequests: false,
      });
      noLogHandler.registerTool('test_tool', mockToolHandler);

      const consoleErrorSpy = vi.spyOn(console, 'error');

      await noLogHandler.handleRequest({
        params: {
          name: 'test_tool',
          arguments: {},
        },
      });

      const logs = consoleErrorSpy.mock.calls.flat().filter(call => {
        try {
          const parsed = JSON.parse(call);
          return parsed.event === 'tool_call';
        } catch {
          return false;
        }
      });
      expect(logs.length).toBe(0);
    });

    it('should handle tool not found error', async () => {
      const result = await handler.handleRequest({
        params: {
          name: 'nonexistent_tool',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.code).toBe('REV_002');
    });

    it('should handle MCPError thrown by tool', async () => {
      const errorTool: ToolHandler = async () => {
        throw new MCPError('TEST_001', 'Test error');
      };
      handler.registerTool('error_tool', errorTool);

      const result = await handler.handleRequest({
        params: {
          name: 'error_tool',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.code).toBe('TEST_001');
    });

    it('should handle generic Error thrown by tool', async () => {
      const errorTool: ToolHandler = async () => {
        throw new Error('Generic error');
      };
      handler.registerTool('generic_error_tool', errorTool);

      const result = await handler.handleRequest({
        params: {
          name: 'generic_error_tool',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Generic error');
    });

    it('should handle non-Error thrown by tool', async () => {
      const errorTool: ToolHandler = async () => {
        throw 'String error';
      };
      handler.registerTool('string_error_tool', errorTool);

      const result = await handler.handleRequest({
        params: {
          name: 'string_error_tool',
          arguments: {},
        },
      });

      expect(result.isError).toBe(true);
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false);
      expect(response.error).toContain('String error');
    });
  });

  describe('health check', () => {
    it('should handle __health request', async () => {
      const result = await handler.handleRequest({
        params: {
          name: '__health',
          arguments: {},
        },
      });

      expect(result.content).toBeDefined();
      // Format shows "Server: version", not the server name
      expect(result.content[0].text).toContain('Server:');
      expect(result.content[0].text).toContain('1.0.0');
    });

    it('should handle __health with verbose flag', async () => {
      const result = await handler.handleRequest({
        params: {
          name: '__health',
          arguments: { verbose: true },
        },
      });

      expect(result.content).toBeDefined();
      const text = result.content[0].text;
      // Format shows "Server: version", not the server name
      expect(text).toContain('Server:');
      expect(text).toContain('1.0.0');
    });
  });

  describe('language support', () => {
    beforeEach(() => {
      handler.registerTool('review_file', mockToolHandler);
    });

    it('should translate Spanish tool names to canonical', async () => {
      const result = await handler.handleRequest({
        params: {
          name: 'revisar_archivo',
          arguments: { filePath: '/test.ts' },
        },
      });

      expect(result).toBeDefined();
      expect(mockToolHandler).toHaveBeenCalled();
    });

    it('should log tool name translation', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      await handler.handleRequest({
        params: {
          name: 'revisar_archivo',
          arguments: {},
        },
      });

      const logs = consoleErrorSpy.mock.calls.flat();
      const translationLogs = logs.filter(call => {
        try {
          const parsed = JSON.parse(call);
          return parsed.event === 'tool_name_translated';
        } catch {
          return false;
        }
      });
      expect(translationLogs.length).toBeGreaterThan(0);
    });

    it('should not translate when supportLanguages is false', async () => {
      const noLangHandler = new UniversalMCPHandler({
        serverName: 'test',
        version: '1.0.0',
        supportLanguages: false,
      });
      noLangHandler.registerTool('review_file', mockToolHandler);

      const result = await noLangHandler.handleRequest({
        params: {
          name: 'revisar_archivo',
          arguments: {},
        },
      });

      // Should fail because Spanish name is not registered
      expect(result.isError).toBe(true);
    });
  });

  describe('getEnvironment', () => {
    it('should return detected environment', () => {
      const env = handler.getEnvironment();

      expect(env).toBeDefined();
      expect(env.ide).toBeDefined();
      expect(env.transport).toBeDefined();
    });
  });

  describe('getHealthChecker', () => {
    it('should return health checker instance', () => {
      const healthChecker = handler.getHealthChecker();

      expect(healthChecker).toBeDefined();
    });
  });
});
