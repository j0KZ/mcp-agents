import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPClient } from './index.js';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

// Mock child_process
vi.mock('child_process');

describe('MCPClient', () => {
  let client: MCPClient;
  let mockChild: any;

  beforeEach(() => {
    client = new MCPClient();

    // Create mock child process
    mockChild = new EventEmitter();
    mockChild.stdin = {
      write: vi.fn(),
      end: vi.fn(),
    };
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();
    mockChild.kill = vi.fn();
    mockChild.killed = false;

    vi.mocked(spawn).mockReturnValue(mockChild as any);
  });

  describe('invoke', () => {
    it('should successfully invoke an MCP tool', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {
        filePath: 'test.ts',
      });

      // Simulate MCP response
      setTimeout(() => {
        mockChild.stdout.emit(
          'data',
          JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            result: { success: true, score: 85 },
          }) + '\n'
        );
        mockChild.emit('close', 0);
      }, 10);

      const result = await invokePromise;

      expect(result).toEqual({ success: true, score: 85 });
      expect(spawn).toHaveBeenCalledWith(
        'node',
        expect.arrayContaining([expect.stringContaining('smart-reviewer')]),
        expect.objectContaining({
          stdio: ['pipe', 'pipe', 'pipe'],
        })
      );
    });

    it('should send correct JSON-RPC request', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {
        filePath: 'test.ts',
      });

      setTimeout(() => {
        mockChild.stdout.emit(
          'data',
          JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            result: {},
          }) + '\n'
        );
        mockChild.emit('close', 0);
      }, 10);

      await invokePromise;

      expect(mockChild.stdin.write).toHaveBeenCalledWith(
        expect.stringContaining('"method":"tools/call"')
      );
      expect(mockChild.stdin.write).toHaveBeenCalledWith(
        expect.stringContaining('"name":"review_file"')
      );
    });

    it('should handle MCP errors', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {});

      setTimeout(() => {
        mockChild.stdout.emit(
          'data',
          JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            error: {
              code: -32600,
              message: 'Invalid request',
            },
          }) + '\n'
        );
        mockChild.emit('close', 0);
      }, 10);

      await expect(invokePromise).rejects.toThrow('MCP error: Invalid request');
    });

    it('should handle process exit with error code', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {});

      setTimeout(() => {
        mockChild.stderr.emit('data', 'Error: Something went wrong');
        mockChild.emit('close', 1);
      }, 10);

      await expect(invokePromise).rejects.toThrow('MCP exited with code 1');
    });

    it('should handle timeout', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {}, 100); // 100ms timeout

      // Don't emit any response - let it timeout

      await expect(invokePromise).rejects.toThrow('MCP invocation timeout (100ms)');
      expect(mockChild.kill).toHaveBeenCalled();
    }, 200);

    it('should handle invalid JSON response', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {});

      setTimeout(() => {
        mockChild.stdout.emit('data', 'invalid json\n');
        mockChild.emit('close', 0);
      }, 10);

      await expect(invokePromise).rejects.toThrow('Invalid MCP response');
    });

    it('should cleanup process after successful invocation', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {});

      setTimeout(() => {
        mockChild.stdout.emit('data', JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }) + '\n');
        mockChild.emit('close', 0);
      }, 10);

      await invokePromise;

      expect(mockChild.stdin.end).toHaveBeenCalled();
    });

    it('should handle multiple JSON objects in output', async () => {
      const invokePromise = client.invoke('smart-reviewer', 'review_file', {});

      setTimeout(() => {
        // Simulate MCP server logging + response
        mockChild.stdout.emit('data', '{"log":"Starting analysis"}\n');
        mockChild.stdout.emit(
          'data',
          JSON.stringify({ jsonrpc: '2.0', id: 1, result: { final: true } }) + '\n'
        );
        mockChild.emit('close', 0);
      }, 10);

      const result = await invokePromise;

      // Should take the last JSON object
      expect(result).toEqual({ final: true });
    });
  });

  describe('resolveMCPBinary', () => {
    it('should throw error for unknown MCP', () => {
      expect(() => {
        // @ts-expect-error - accessing private method for testing
        client.resolveMCPBinary('unknown-mcp');
      }).toThrow('Unknown MCP: unknown-mcp');
    });
  });

  describe('isInstalled', () => {
    it('should return false for unknown MCP', () => {
      const result = client.isInstalled('unknown-mcp');
      expect(result).toBe(false);
    });
  });

  describe('getAvailableMCPs', () => {
    it('should return array of MCP names', () => {
      const mcps = client.getAvailableMCPs();
      expect(Array.isArray(mcps)).toBe(true);
    });
  });

  describe('request ID increment', () => {
    it('should increment request ID for each invocation', async () => {
      const invocation1 = client.invoke('smart-reviewer', 'review_file', {});
      setTimeout(() => {
        mockChild.stdout.emit('data', JSON.stringify({ jsonrpc: '2.0', id: 1, result: {} }) + '\n');
        mockChild.emit('close', 0);
      }, 10);
      await invocation1;

      // Reset mock
      mockChild = new EventEmitter();
      mockChild.stdin = { write: vi.fn(), end: vi.fn() };
      mockChild.stdout = new EventEmitter();
      mockChild.stderr = new EventEmitter();
      mockChild.kill = vi.fn();
      mockChild.killed = false;
      vi.mocked(spawn).mockReturnValue(mockChild as any);

      const invocation2 = client.invoke('smart-reviewer', 'review_file', {});
      setTimeout(() => {
        mockChild.stdout.emit('data', JSON.stringify({ jsonrpc: '2.0', id: 2, result: {} }) + '\n');
        mockChild.emit('close', 0);
      }, 10);

      await invocation2;

      // Check that second request has ID 2
      const secondCall = vi.mocked(mockChild.stdin.write).mock.calls[0][0];
      expect(secondCall).toContain('"id":2');
    });
  });
});
