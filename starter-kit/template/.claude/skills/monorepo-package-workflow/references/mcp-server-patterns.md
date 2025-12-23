# MCP Server Implementation Patterns

## Thin Orchestration Layer Principle

The MCP server should ONLY handle:
1. MCP protocol communication
2. Tool registration
3. Request routing
4. Delegating to core logic

**Target:** <150 LOC for mcp-server.ts

## Complete MCP Server Template

```typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Import main logic handlers
import {
  handleAnalysis,
  handleGeneration,
  handleValidation
} from './main-logic.js';

// Import tool definitions
import { TOOL_DEFINITIONS } from './constants/tools.js';

const server = new Server(
  {
    name: '@j0kz/your-tool-mcp',
    version: '1.1.0',  // From version.json
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS
}));

// Handle tool calls - pure delegation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze':
        return await handleAnalysis(args);
      case 'generate':
        return await handleGeneration(args);
      case 'validate':
        return await handleValidation(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          errors: [error.message]
        })
      }]
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Your Tool MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
```

## Tool Definition Pattern

Extract tool schemas to constants:

**constants/tools.ts**
```typescript
export const TOOL_DEFINITIONS = [
  {
    name: 'analyze',
    description: 'Analyze code for quality issues',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to file to analyze'
        },
        config: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['strict', 'moderate', 'lenient'],
              description: 'Analysis severity level'
            },
            includeMetrics: {
              type: 'boolean',
              description: 'Include code metrics'
            }
          }
        }
      },
      required: ['filePath']
    }
  },
  // Additional tools...
];
```

## Main Logic Delegation

**main-logic.ts** handles all business logic:

```typescript
import { FileSystemManager, PerformanceMonitor } from '@j0kz/shared';
import { analyzeCode } from './helpers/analyzer.js';
import { validateInput } from './helpers/validator.js';

export async function handleAnalysis(args: any) {
  const monitor = PerformanceMonitor.start('analyze');

  try {
    // Input validation
    const validatedArgs = validateInput(args);

    // File operations
    const content = await FileSystemManager.readFile(
      validatedArgs.filePath
    );

    // Core logic (delegated to helpers)
    const result = await analyzeCode(content, validatedArgs.config);

    monitor.end();

    // Return MCP response format
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: result,
          metadata: {
            performanceMs: monitor.getDuration()
          }
        })
      }]
    };
  } catch (error) {
    monitor.end();
    throw error;
  }
}
```

## Response Format Pattern

### Success Response
```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      success: true,
      data: {
        // Tool-specific results
        results: [...],
        metrics: {...}
      },
      metadata: {
        filePath: args.filePath,
        performanceMs: 125,
        cached: false
      }
    })
  }]
};
```

### Error Response
```typescript
return {
  content: [{
    type: 'text',
    text: JSON.stringify({
      success: false,
      errors: [
        'File not found',
        'Invalid configuration'
      ],
      metadata: {
        filePath: args.filePath
      }
    })
  }]
};
```

## Multi-Tool Pattern

For tools with multiple actions:

```typescript
// Handle multiple related tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Group related actions
  if (name.startsWith('review_')) {
    return await handleReview(name, args);
  }

  if (name.startsWith('generate_')) {
    return await handleGeneration(name, args);
  }

  // Individual tools
  switch (name) {
    case 'analyze':
      return await handleAnalysis(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

## Error Handling Pattern

Consistent error handling across all tools:

```typescript
// In main-logic.ts
export async function handleToolAction(args: any) {
  try {
    // Validate inputs first
    if (!args.filePath) {
      throw new ValidationError('filePath is required');
    }

    // Size limits
    const stats = await fs.stat(args.filePath);
    if (stats.size > 1_000_000) {
      throw new ValidationError('File too large (>1MB)');
    }

    // Process
    const result = await process(args);

    return formatSuccess(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return formatError(error.message, 'validation');
    }
    if (error instanceof FileNotFoundError) {
      return formatError(error.message, 'not_found');
    }
    // Generic error
    return formatError('Internal error', 'internal');
  }
}
```

## Testing MCP Server

### Local Testing
```bash
# Test server starts correctly
node dist/mcp-server.js

# Test with sample input (in another terminal)
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/mcp-server.js
```

### Integration Testing
```typescript
// tests/mcp-server.test.ts
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('MCP Server', () => {
  it('should list tools', async () => {
    const server = spawn('node', ['dist/mcp-server.js']);

    // Send list tools request
    server.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    }));

    // Check response
    const response = await getResponse(server);
    expect(response.result.tools).toHaveLength(3);
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ Fat MCP Server
```typescript
// BAD: Business logic in MCP server
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 200+ lines of analysis logic directly here
  const ast = parseTypeScript(content);
  const metrics = calculateComplexity(ast);
  // ... etc
});
```

### ✅ Thin MCP Server
```typescript
// GOOD: Delegate to main-logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await handleAnalysis(request.params.arguments);
});
```

### ❌ Scattered Tool Definitions
```typescript
// BAD: Inline tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'analyze',
      // 50 lines of schema definition
    }
  ]
}));
```

### ✅ Extracted Tool Definitions
```typescript
// GOOD: Import from constants
import { TOOL_DEFINITIONS } from './constants/tools.js';

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS
}));
```

## Real Examples from Codebase

### orchestrator-mcp (144 LOC)
- Pure routing to workflow handlers
- Tool definitions in separate file
- All logic in workflows/ directory

### smart-reviewer (145 LOC)
- Delegates to reviewer.ts
- Tool schemas extracted
- Error handling centralized

### security-scanner (120 LOC)
- Thinnest implementation
- Maximum delegation
- Best modular example