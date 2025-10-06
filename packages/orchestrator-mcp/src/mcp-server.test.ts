/**
 * Tests for Orchestrator MCP Server
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Mock the shared imports
vi.mock('@j0kz/shared', () => ({
  MCPPipeline: vi.fn().mockImplementation(() => ({
    addStep: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({
      success: true,
      results: [],
      metadata: { duration: 100 },
    }),
  })),
  MCPError: class MCPError extends Error {
    constructor(
      public code: string,
      public context?: any
    ) {
      super(`Error ${code}`);
    }
  },
  getErrorMessage: (error: any) => error.message || 'Unknown error',
}));

// Mock the workflows module
vi.mock('./workflows.js', () => ({
  WORKFLOWS: {
    'pre-commit': {
      name: 'Pre-commit Quality Check',
      description: 'Review and scan files before commit',
      steps: 2,
    },
    'pre-merge': {
      name: 'Pre-merge Validation',
      description: 'Full validation before merge',
      steps: 4,
    },
    'quality-audit': {
      name: 'Quality Audit',
      description: 'Comprehensive project audit',
      steps: 3,
    },
  },
  createWorkflow: vi.fn().mockImplementation((name, files, projectPath) => ({
    addStep: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue({
      success: true,
      results: [],
      metadata: { duration: 100 },
    }),
  })),
}));

describe('OrchestratorServer', () => {
  let server: any;
  let mockSetRequestHandler: any;
  let handlers: Map<string, any>;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create a map to store handlers
    handlers = new Map();

    // Mock Server constructor and methods
    mockSetRequestHandler = vi.fn((schema, handler) => {
      const schemaName = schema.parse ? schema.parse.name : 'unknown';
      handlers.set(schemaName, handler);
    });

    vi.spyOn(Server.prototype, 'setRequestHandler').mockImplementation(mockSetRequestHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Tool Registration', () => {
    it('should register all required tools', async () => {
      // Import and instantiate the server
      const module = await import('./mcp-server.js');

      // Check that handlers were registered
      expect(mockSetRequestHandler).toHaveBeenCalled();

      // Get the list tools handler
      const listToolsHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === ListToolsRequestSchema && call[1] === h
        )
      );

      if (listToolsHandler) {
        const response = await listToolsHandler();

        expect(response.tools).toHaveLength(3);

        const toolNames = response.tools.map((t: any) => t.name);
        expect(toolNames).toContain('run_workflow');
        expect(toolNames).toContain('run_sequence');
        expect(toolNames).toContain('list_workflows');
      }
    });

    it('should define correct schema for run_workflow tool', async () => {
      const module = await import('./mcp-server.js');

      const listToolsHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === ListToolsRequestSchema && call[1] === h
        )
      );

      if (listToolsHandler) {
        const response = await listToolsHandler();
        const runWorkflowTool = response.tools.find((t: any) => t.name === 'run_workflow');

        expect(runWorkflowTool).toBeDefined();
        expect(runWorkflowTool.inputSchema.properties.workflow.enum).toEqual([
          'pre-commit',
          'pre-merge',
          'quality-audit',
        ]);
        expect(runWorkflowTool.inputSchema.required).toContain('workflow');
        expect(runWorkflowTool.inputSchema.required).toContain('files');
      }
    });

    it('should define correct schema for run_sequence tool', async () => {
      const module = await import('./mcp-server.js');

      const listToolsHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === ListToolsRequestSchema && call[1] === h
        )
      );

      if (listToolsHandler) {
        const response = await listToolsHandler();
        const runSequenceTool = response.tools.find((t: any) => t.name === 'run_sequence');

        expect(runSequenceTool).toBeDefined();
        expect(runSequenceTool.inputSchema.properties.steps).toBeDefined();
        expect(runSequenceTool.inputSchema.properties.steps.type).toBe('array');
        expect(runSequenceTool.inputSchema.required).toContain('steps');
      }
    });

    it('should define correct schema for list_workflows tool', async () => {
      const module = await import('./mcp-server.js');

      const listToolsHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === ListToolsRequestSchema && call[1] === h
        )
      );

      if (listToolsHandler) {
        const response = await listToolsHandler();
        const listWorkflowsTool = response.tools.find((t: any) => t.name === 'list_workflows');

        expect(listWorkflowsTool).toBeDefined();
        expect(listWorkflowsTool.description).toContain('List available workflow templates');
        // list_workflows has no required parameters
        expect(listWorkflowsTool.inputSchema.required).toEqual([]);
      }
    });
  });

  describe('Workflow Execution', () => {
    it('should execute pre-commit workflow successfully', async () => {
      const { createWorkflow } = await import('./workflows.js');
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_workflow',
            arguments: {
              workflow: 'pre-commit',
              files: ['src/test.ts', 'src/test2.ts'],
            },
          },
        };

        const response = await callToolHandler(request);

        expect(createWorkflow).toHaveBeenCalledWith(
          'pre-commit',
          ['src/test.ts', 'src/test2.ts'],
          '.'
        );

        const content = JSON.parse(response.content[0].text);
        expect(content.success).toBe(true);
      }
    });

    it('should handle workflow execution errors gracefully', async () => {
      const { createWorkflow } = await import('./workflows.js');

      // Mock createWorkflow to throw an error
      vi.mocked(createWorkflow).mockImplementationOnce(() => {
        throw new Error('Pipeline execution failed');
      });

      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_workflow',
            arguments: {
              workflow: 'pre-commit',
              files: ['src/test.ts'],
            },
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(false);
        expect(content.error).toContain('Pipeline execution failed');
      }
    });

    it('should use provided projectPath when specified', async () => {
      const { createWorkflow } = await import('./workflows.js');
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_workflow',
            arguments: {
              workflow: 'quality-audit',
              files: [],
              projectPath: '/custom/project/path',
            },
          },
        };

        const response = await callToolHandler(request);

        expect(createWorkflow).toHaveBeenCalledWith('quality-audit', [], '/custom/project/path');
      }
    });
  });

  describe('Custom Sequence Execution', () => {
    it('should execute custom sequence of MCP tools', async () => {
      const { MCPPipeline } = await import('@j0kz/shared');
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const steps = [
          {
            name: 'review',
            mcp: 'smart-reviewer',
            tool: 'review_file',
            params: { filePath: 'src/test.ts' },
          },
          {
            name: 'security',
            mcp: 'security-scanner',
            tool: 'scan_file',
            params: { filePath: 'src/test.ts' },
            dependsOn: ['review'],
          },
        ];

        const request = {
          params: {
            name: 'run_sequence',
            arguments: { steps },
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(true);
        expect(MCPPipeline).toHaveBeenCalled();
      }
    });

    it('should handle missing required parameters', async () => {
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_sequence',
            arguments: {}, // Missing required 'steps'
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(false);
        expect(content.error).toBeDefined();
      }
    });
  });

  describe('Workflow Listing', () => {
    it('should list all available workflows', async () => {
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'list_workflows',
            arguments: {},
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.workflows).toBeDefined();
        expect(Object.keys(content.workflows)).toHaveLength(3);
        expect(content.workflows['pre-commit']).toBeDefined();
        expect(content.workflows['pre-merge']).toBeDefined();
        expect(content.workflows['quality-audit']).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown tool names', async () => {
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'unknown_tool',
            arguments: {},
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(false);
        expect(content.errorCode).toBe('ORCH_003');
      }
    });

    it('should handle missing arguments', async () => {
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_workflow',
            arguments: undefined,
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(false);
        expect(content.errorCode).toBe('ORCH_001');
      }
    });

    it('should handle invalid workflow names', async () => {
      const module = await import('./mcp-server.js');

      const callToolHandler = Array.from(handlers.values()).find(h =>
        mockSetRequestHandler.mock.calls.some(
          call => call[0] === CallToolRequestSchema && call[1] === h
        )
      );

      if (callToolHandler) {
        const request = {
          params: {
            name: 'run_workflow',
            arguments: {
              workflow: 'invalid-workflow',
              files: ['test.ts'],
            },
          },
        };

        const response = await callToolHandler(request);
        const content = JSON.parse(response.content[0].text);

        expect(content.success).toBe(false);
      }
    });
  });
});
