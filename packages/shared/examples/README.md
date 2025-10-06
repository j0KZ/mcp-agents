# Shared Package Examples

This directory contains practical examples demonstrating how to use the `@mcp-tools/shared` package to build modular, high-performance MCP tool integrations.

## Examples Overview

### 01. Pipeline Example

**File**: `01-pipeline-example.ts`

Demonstrates using `MCPPipeline` to chain multiple MCP tools in sequence:

- Architecture Analyzer → Smart Reviewer → Refactor Assistant
- Shows dependency management between steps
- Demonstrates accessing step results
- Includes performance monitoring

**Key concepts**:

- Sequential processing with dependencies
- Error handling in pipelines
- Performance metrics collection

```bash
npm run example:pipeline
```

### 02. Workflow Example

**File**: `02-workflow-example.ts`

Shows `MCPWorkflow` with conditional execution:

- Security Scanner → Test Generator → Documentation Generator
- Conditional step execution based on previous results
- Tool registration and integration
- Result caching

**Key concepts**:

- Conditional workflow steps
- Tool registration pattern
- MCPIntegration usage

```bash
npm run example:workflow
```

### 03. Caching Example

**File**: `03-caching-example.ts`

Demonstrates caching strategies for performance optimization:

- FileCache for file content caching
- AnalysisCache for expensive computation results
- Batch operations with caching
- Cache statistics and monitoring

**Key concepts**:

- LRU cache with TTL
- Hash-based cache invalidation
- Performance improvements (typically 90%+ on cache hits)
- Batch file operations

```bash
npm run example:caching
```

### 04. Event Bus Example

**File**: `04-event-bus-example.ts`

Shows real-time communication between MCPs using events:

- Loosely coupled tool communication
- File watcher integration with event bus
- Cascading analysis pipeline triggered by file changes
- One-time and persistent listeners

**Key concepts**:

- Event-driven architecture
- Pub/sub pattern
- Real-time file watching
- Debounced event handling

```bash
npm run example:events
```

## Running Examples

### Prerequisites

```bash
# Install dependencies
npm install

# Build the shared package
npm run build
```

### Run Individual Examples

```bash
# Pipeline example
npx tsx examples/01-pipeline-example.ts

# Workflow example
npx tsx examples/02-workflow-example.ts

# Caching example
npx tsx examples/03-caching-example.ts

# Event bus example
npx tsx examples/04-event-bus-example.ts
```

### Run All Examples

```bash
npm run examples
```

## Integration Patterns

### Pattern 1: Sequential Processing Pipeline

```typescript
import { MCPPipeline } from '@mcp-tools/shared';

const pipeline = new MCPPipeline();

pipeline
  .addStep({
    name: 'step1',
    tool: 'tool1',
    execute: async () => {
      /*...*/
    },
  })
  .addStep({
    name: 'step2',
    tool: 'tool2',
    dependsOn: ['step1'],
    execute: async () => {
      /*...*/
    },
  });

const result = await pipeline.execute();
```

### Pattern 2: Parallel Tool Execution

```typescript
import { MCPIntegration } from '@mcp-tools/shared';

const integration = new MCPIntegration();
integration.registerTool('tool1', tool1Instance);
integration.registerTool('tool2', tool2Instance);

const results = await integration.parallel([
  { tool: 'tool1', method: 'analyze', args: [file1] },
  { tool: 'tool2', method: 'analyze', args: [file2] },
]);
```

### Pattern 3: Caching Analysis Results

```typescript
import { AnalysisCache, generateHash } from '@mcp-tools/shared';

const cache = new AnalysisCache();
const fileHash = generateHash(fileContent);

// Try cache first
let result = cache.get(filePath, 'complexity', fileHash);

if (!result) {
  result = await expensiveAnalysis(fileContent);
  cache.set(filePath, 'complexity', fileHash, result);
}
```

### Pattern 4: Event-Driven Architecture

```typescript
import { MCPEventBus, EVENT_TYPE } from '@mcp-tools/shared';

const eventBus = new MCPEventBus();

// Tool 1: Emits events
eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, { data });

// Tool 2: Listens for events
eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, data => {
  // React to analysis completion
});
```

## Performance Tips

1. **Use Caching Aggressively**
   - FileCache for file content (60s default TTL)
   - AnalysisCache for expensive computations (30min default TTL)
   - Cache hit rates typically >80% in production

2. **Batch Operations**
   - Use `batchProcess` for processing multiple items
   - Set appropriate concurrency limits (default: 5)
   - Monitor memory usage with large batches

3. **Parallel Processing**
   - Use `parallelProcess` for independent operations
   - MCPIntegration.parallel() for multiple tools
   - Be mindful of rate limits and resource constraints

4. **Resource Pooling**
   - Reuse expensive objects (parsers, analyzers)
   - Use ResourcePool for connection management
   - Limit pool size based on available memory

## Common Patterns

### Chaining Tool Outputs

```typescript
const result = await integration.chain(initialInput, [
  { tool: 'architecture-analyzer', method: 'analyze' },
  {
    tool: 'smart-reviewer',
    method: 'review',
    transform: data => data.files, // Transform output before next step
  },
  { tool: 'refactor-assistant', method: 'suggest' },
]);
```

### Error Handling in Pipelines

```typescript
const result = await pipeline.execute();

if (!result.success) {
  console.error('Pipeline failed:', result.errors);

  // Access partial results
  result.steps.forEach(step => {
    if (step.result.success) {
      console.log(`${step.name} completed successfully`);
    }
  });
}
```

### Cache Invalidation

```typescript
// Invalidate specific file
cache.invalidate(filePath);

// Clear all cache
cache.clear();

// Monitor cache performance
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

## Advanced Usage

### Custom Performance Monitoring

```typescript
import { PerformanceMonitor } from '@mcp-tools/shared';

const monitor = new PerformanceMonitor();
monitor.start();

// Mark checkpoints
monitor.mark('step-1-complete');
monitor.mark('step-2-complete');

const metrics = monitor.stop();
console.log(`Total: ${metrics.duration}ms`);
console.log(`Step metrics:`, monitor.getAllMetrics());
```

### File System Optimization

```typescript
import { FileSystemManager } from '@mcp-tools/shared';

const fsManager = new FileSystemManager(500); // 500-file cache

// Read with caching
const content = await fsManager.readFile(path, true);

// Batch read
const contents = await fsManager.readFiles(paths, {
  useCache: true,
  concurrency: 10,
});

// Find files with fast-glob
const files = await fsManager.findFiles('**/*.ts', {
  ignore: ['node_modules/**'],
});
```

## Best Practices

1. **Always use caching for repeated operations**
2. **Set appropriate TTL values** (shorter for frequently changing data)
3. **Monitor cache hit rates** and adjust cache sizes
4. **Use event bus for loosely coupled tools**
5. **Implement proper error handling in pipelines**
6. **Batch operations when processing multiple files**
7. **Use parallel processing for independent tasks**
8. **Clean up resources** (unwatch files, clear caches)

## Contributing

Have a useful integration pattern? Submit a PR with a new example!

## License

MIT
