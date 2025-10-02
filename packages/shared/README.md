# @mcp-tools/shared

Shared utilities, types, and integration layer for building modular, high-performance MCP (Model Context Protocol) tools.

## 🚀 Features

- **🏗️ Modular Architecture**: Build MCPs that work together seamlessly
- **⚡ Performance Optimizations**: Caching, batching, parallel processing
- **🔄 Inter-MCP Communication**: Pipelines, workflows, and event bus
- **📦 File System Optimization**: Smart caching and batch operations
- **📊 Performance Monitoring**: Track metrics and optimize bottlenecks
- **🎯 Type Safety**: Comprehensive TypeScript types for all operations

## 📦 Installation

```bash
npm install @mcp-tools/shared
```

For monorepo development:

```json
{
  "dependencies": {
    "@mcp-tools/shared": "workspace:*"
  }
}
```

## 🎯 Quick Start

### Basic File Operations with Caching

```typescript
import { FileSystemManager, generateHash } from '@mcp-tools/shared';

const fsManager = new FileSystemManager(500); // Cache 500 files

// Read file with automatic caching
const content = await fsManager.readFile('./src/index.ts', true);

// Batch read with parallel processing
const files = await fsManager.findFiles('**/*.ts', {
  ignore: ['node_modules/**'],
});

const contents = await fsManager.readFiles(files, {
  useCache: true,
  concurrency: 10,
});
```

### Analysis Result Caching

```typescript
import { AnalysisCache, generateHash } from '@mcp-tools/shared';

const cache = new AnalysisCache(200, 1800000); // 200 entries, 30min TTL

async function analyzeCode(filePath: string, content: string) {
  const fileHash = generateHash(content);

  // Check cache first
  const cached = cache.get(filePath, 'complexity', fileHash);
  if (cached) {
    return cached;
  }

  // Perform expensive analysis
  const result = await performComplexityAnalysis(content);

  // Cache for future use
  cache.set(filePath, 'complexity', fileHash, result);

  return result;
}
```

### MCP Pipeline Integration

```typescript
import { MCPPipeline } from '@mcp-tools/shared';

const pipeline = new MCPPipeline();

pipeline
  .addStep({
    name: 'analyze',
    tool: 'architecture-analyzer',
    execute: async (input) => {
      // Analyze project architecture
      return { complexity: 45, modularity: 78 };
    },
  })
  .addStep({
    name: 'review',
    tool: 'smart-reviewer',
    dependsOn: ['analyze'],
    execute: async (input) => {
      // Review based on architecture analysis
      const archResults = input[0];
      return { issues: [], score: archResults.data.modularity };
    },
  });

const result = await pipeline.execute();
console.log(`Completed ${result.steps.length} steps in ${result.totalDuration}ms`);
```

## 📚 Core Modules

### 1. File System (`fs`)

Optimized file operations with caching and batch processing.

```typescript
import { FileSystemManager, FileWatcher, BatchFileOperations } from '@mcp-tools/shared';

// File system manager
const fs = new FileSystemManager(500);
const content = await fs.readFile(path, true); // With caching
await fs.writeFile(path, content);

// File watcher with debouncing
const watcher = new FileWatcher(500); // 500ms debounce
watcher.watch('./src', (event, filename) => {
  console.log(`${event}: ${filename}`);
});

// Batch operations
const batch = new BatchFileOperations();
await batch.writeMultiple([
  { path: './file1.ts', content: 'code1' },
  { path: './file2.ts', content: 'code2' },
], { concurrency: 5 });
```

### 2. Caching (`cache`)

High-performance LRU caching for files and analysis results.

```typescript
import { MemoryCache, FileCache, AnalysisCache } from '@mcp-tools/shared';

// Generic memory cache
const cache = new MemoryCache<string>({ max: 1000, ttl: 3600000 });
cache.set('key', 'value', 60000); // 60s TTL
const value = cache.get('key');

// File content cache with hash-based invalidation
const fileCache = new FileCache(500);
fileCache.set(filePath, content);
const cached = fileCache.get(filePath, currentHash);

// Analysis result cache
const analysisCache = new AnalysisCache(200, 1800000);
analysisCache.set(filePath, 'complexity', fileHash, result);
const result = analysisCache.get(filePath, 'complexity', fileHash);

// Cache statistics
const stats = cache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

### 3. Performance (`performance`)

Monitor and optimize execution performance.

```typescript
import {
  PerformanceMonitor,
  measure,
  batchProcess,
  parallelProcess,
} from '@mcp-tools/shared';

// Performance monitoring
const monitor = new PerformanceMonitor();
monitor.start();
monitor.mark('checkpoint-1');
const metrics = monitor.stop();
console.log(`Duration: ${metrics.duration}ms`);

// Measure function execution
const { result, duration } = await measure(
  async () => expensiveOperation(),
  'operation-name'
);

// Batch processing with concurrency limit
const results = await batchProcess(
  items,
  async (item) => processItem(item),
  {
    concurrency: 5,
    onProgress: (completed, total) => console.log(`${completed}/${total}`),
  }
);

// Parallel processing
const results = await parallelProcess(
  items,
  async (item, index) => processItem(item),
  10 // max concurrency
);
```

### 4. Integration (`integration`)

Orchestrate multiple MCP tools working together.

```typescript
import {
  MCPPipeline,
  MCPIntegration,
  MCPWorkflow,
  MCPEventBus,
} from '@mcp-tools/shared';

// Pipeline: Sequential with dependencies
const pipeline = new MCPPipeline();
pipeline.addStep({ name: 'step1', execute: async () => { /*...*/ } });
const result = await pipeline.execute();

// Integration: Register and call tools
const integration = new MCPIntegration();
integration.registerTool('tool-name', toolInstance);

// Run in parallel
await integration.parallel([
  { tool: 'tool1', method: 'analyze', args: [file1] },
  { tool: 'tool2', method: 'analyze', args: [file2] },
]);

// Chain operations
await integration.chain(initialInput, [
  { tool: 'tool1', method: 'process' },
  { tool: 'tool2', method: 'transform', transform: (data) => data.output },
]);

// Workflow: Conditional execution
const workflow = new MCPWorkflow('my-workflow');
workflow
  .step('scan', 'security-scanner', 'scan')
  .step('test', 'test-generator', 'generate', {}, (results) => {
    return results['scan'].data.vulnerabilities.length > 0;
  });

// Event bus: Loosely coupled communication
const eventBus = new MCPEventBus();
eventBus.on('file:changed', (data) => {
  console.log('File changed:', data.filePath);
});
eventBus.emit('file:changed', { filePath: './src/index.ts' });
```

### 5. Utilities (`utils`)

Common utility functions for MCP development.

```typescript
import {
  generateHash,
  normalizePath,
  isPathSafe,
  retry,
  deepMerge,
  formatBytes,
  truncateString,
  safeJsonParse,
} from '@mcp-tools/shared';

// Hash generation
const hash = generateHash(content); // SHA-256

// Path utilities
const normalized = normalizePath('/path/to/file');
const isSafe = isPathSafe(userPath, baseDir); // Prevent path traversal

// Retry with exponential backoff
const result = await retry(
  async () => unstableOperation(),
  3, // max retries
  1000 // initial delay
);

// Deep merge objects
const merged = deepMerge(obj1, obj2, obj3);

// Formatting
formatBytes(1024); // "1.00 KB"
truncateString('long text...', 50);

// Safe JSON parsing
const { data, error } = safeJsonParse<MyType>(jsonString);
```

### 6. Types (`types`)

Standardized TypeScript interfaces for all MCPs.

```typescript
import {
  MCPResult,
  MCPConfig,
  CodeAnalysisResult,
  FileInfo,
  PerformanceMetrics,
  PipelineStep,
  CacheEntry,
} from '@mcp-tools/shared';

// Standard MCP result
const result: MCPResult<MyData> = {
  success: true,
  data: myData,
  warnings: ['warning message'],
  metadata: { version: '1.0.0' },
  timestamp: new Date().toISOString(),
};

// Standard MCP configuration
const config: MCPConfig = {
  verbose: true,
  dryRun: false,
  outputFormat: 'json',
  cache: true,
  parallel: true,
  maxConcurrency: 10,
};
```

### 7. Constants (`constants`)

Shared constants across all MCP tools.

```typescript
import {
  FILE_EXTENSIONS,
  IGNORE_PATTERNS,
  PERFORMANCE,
  QUALITY_THRESHOLDS,
  SEVERITY,
  MCP_TOOLS,
  REGEX,
  ERROR_CODE,
} from '@mcp-tools/shared';

// File extensions
FILE_EXTENSIONS.TYPESCRIPT; // ['.ts', '.tsx']
FILE_EXTENSIONS.ALL_CODE; // ['.ts', '.tsx', '.js', '.jsx', ...]

// Performance limits
PERFORMANCE.MAX_FILE_SIZE; // 10MB
PERFORMANCE.DEFAULT_CONCURRENCY; // 5

// Quality thresholds
QUALITY_THRESHOLDS.MAX_COMPLEXITY; // 10
QUALITY_THRESHOLDS.MAX_LINE_LENGTH; // 120
QUALITY_THRESHOLDS.MIN_TEST_COVERAGE; // 80

// Common regex patterns
REGEX.TODO_COMMENT; // /\b(TODO|FIXME|XXX|HACK|NOTE)\b/gi
REGEX.CONSOLE_LOG; // /console\.(log|warn|error|debug|info)/g

// MCP tool names
MCP_TOOLS.ARCHITECTURE_ANALYZER; // 'architecture-analyzer'
MCP_TOOLS.SMART_REVIEWER; // 'smart-reviewer'
```

## 🎯 Common Patterns

### Pattern 1: MCP Tool with Caching

```typescript
import {
  FileSystemManager,
  AnalysisCache,
  generateHash,
  MCPResult,
} from '@mcp-tools/shared';

export class MyMCPTool {
  private fsManager: FileSystemManager;
  private cache: AnalysisCache;

  constructor() {
    this.fsManager = new FileSystemManager(500);
    this.cache = new AnalysisCache(200, 1800000);
  }

  async analyze(filePath: string): Promise<MCPResult> {
    // Read with caching
    const content = await this.fsManager.readFile(filePath, true);
    const fileHash = generateHash(content);

    // Check cache
    const cached = this.cache.get(filePath, 'my-analysis', fileHash);
    if (cached) {
      return cached;
    }

    // Perform analysis
    const result = await this.performAnalysis(content);

    // Cache result
    this.cache.set(filePath, 'my-analysis', fileHash, result);

    return result;
  }
}
```

### Pattern 2: Batch File Processing

```typescript
import { FileSystemManager, batchProcess } from '@mcp-tools/shared';

async function processProject(projectPath: string) {
  const fsManager = new FileSystemManager();

  // Find all TypeScript files
  const files = await fsManager.findFiles('**/*.ts', {
    cwd: projectPath,
    ignore: ['node_modules/**', 'dist/**'],
  });

  // Process in batches
  const results = await batchProcess(
    files,
    async (file) => {
      const content = await fsManager.readFile(file, true);
      return analyzeFile(content);
    },
    {
      concurrency: 10,
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total}`);
      },
    }
  );

  return results;
}
```

### Pattern 3: Tool Integration Pipeline

```typescript
import { MCPPipeline, MCPIntegration } from '@mcp-tools/shared';

// Create integration manager
const integration = new MCPIntegration();
integration.registerTool('arch-analyzer', new ArchAnalyzer());
integration.registerTool('reviewer', new SmartReviewer());
integration.registerTool('refactorer', new RefactorAssistant());

// Create pipeline
const pipeline = new MCPPipeline();

pipeline
  .addStep({
    name: 'analyze',
    tool: 'arch-analyzer',
    execute: async () => {
      const tool = integration.getTool('arch-analyzer');
      return tool.analyze('./src');
    },
  })
  .addStep({
    name: 'review',
    tool: 'reviewer',
    dependsOn: ['analyze'],
    execute: async (input) => {
      const archResults = input[0];
      const tool = integration.getTool('reviewer');
      return tool.review(archResults.data.problematicFiles);
    },
  })
  .addStep({
    name: 'refactor',
    tool: 'refactorer',
    dependsOn: ['review'],
    execute: async (input) => {
      const reviewResults = input[0];
      const tool = integration.getTool('refactorer');
      return tool.suggestRefactorings(reviewResults.data.issues);
    },
  });

const result = await pipeline.execute();
```

### Pattern 4: Event-Driven Architecture

```typescript
import { MCPEventBus, FileWatcher, EVENT_TYPE } from '@mcp-tools/shared';

const eventBus = new MCPEventBus();
const watcher = new FileWatcher(500);

// Tool 1: Watch for file changes
watcher.watch('./src', (event, filename) => {
  eventBus.emit(EVENT_TYPE.FILE_CHANGED, {
    event,
    filePath: filename,
    timestamp: new Date().toISOString(),
  });
}, { recursive: true });

// Tool 2: Analyze on file change
eventBus.on(EVENT_TYPE.FILE_CHANGED, async (data) => {
  const result = await analyzer.analyze(data.filePath);
  eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, { result });
});

// Tool 3: Generate tests on analysis completion
eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, async (data) => {
  if (data.result.issues.length > 0) {
    await testGenerator.generateTests(data.result);
  }
});
```

## 📊 Performance Benchmarks

Typical performance improvements with shared utilities:

| Operation | Without Cache | With Cache | Improvement |
|-----------|---------------|------------|-------------|
| File Read (single) | 5-10ms | <1ms | **90%+** |
| File Read (batch 100) | 500-1000ms | 50-100ms | **80-90%** |
| Analysis (repeated) | 100-200ms | <5ms | **95%+** |
| Find Files (glob) | 50-100ms | 10-20ms | **70-80%** |

Cache hit rates in production: **80-95%**

## 🔍 Examples

See the [`examples/`](./examples) directory for complete working examples:

- **01-pipeline-example.ts**: Chaining multiple MCPs in sequence
- **02-workflow-example.ts**: Conditional workflows with dependencies
- **03-caching-example.ts**: Performance optimization with caching
- **04-event-bus-example.ts**: Real-time event-driven architecture

## 🛠️ Development

### Building

```bash
npm run build
```

### Running Examples

```bash
# Individual examples
npx tsx examples/01-pipeline-example.ts
npx tsx examples/02-workflow-example.ts

# All examples
npm run examples
```

### Testing

```bash
npm test
```

## 📖 API Documentation

### FileSystemManager

```typescript
class FileSystemManager {
  constructor(cacheSize?: number);
  readFile(filePath: string, useCache?: boolean): Promise<string>;
  readFiles(filePaths: string[], options?: ReadOptions): Promise<Map<string, string>>;
  writeFile(filePath: string, content: string, baseDir?: string): Promise<void>;
  findFiles(patterns: string | string[], options?: FindOptions): Promise<string[]>;
  exists(filePath: string): Promise<boolean>;
  clearCache(): void;
  getCacheStats(): CacheStats;
}
```

### AnalysisCache

```typescript
class AnalysisCache {
  constructor(maxSize?: number, ttl?: number);
  get(filePath: string, analysisType: string, fileHash: string, config?: any): any | undefined;
  set(filePath: string, analysisType: string, fileHash: string, result: any, config?: any): void;
  has(filePath: string, analysisType: string, fileHash: string, config?: any): boolean;
  invalidate(filePath: string): void;
  clear(): void;
  getStats(): CacheStats;
}
```

### MCPPipeline

```typescript
class MCPPipeline {
  addStep(step: PipelineStep): this;
  execute(): Promise<PipelineResult>;
  getResult(stepName: string): MCPResult | undefined;
  getAllResults(): Map<string, MCPResult>;
  clear(): void;
}
```

### MCPIntegration

```typescript
class MCPIntegration {
  registerTool(name: string, tool: any): void;
  getTool(name: string): any;
  sequence(steps: SequenceStep[]): Promise<any[]>;
  parallel(steps: ParallelStep[]): Promise<any[]>;
  chain(initialInput: any, operations: ChainOperation[]): Promise<any>;
}
```

### PerformanceMonitor

```typescript
class PerformanceMonitor {
  start(): void;
  stop(): PerformanceMetrics;
  mark(name: string): void;
  getMetrics(name: string): MetricsSummary | null;
  getAllMetrics(): Record<string, MetricsSummary>;
  reset(): void;
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📝 License

MIT License - see [LICENSE](../../LICENSE) for details

## 🔗 Related Packages

This shared package is used by:

- [@j0kz/architecture-analyzer-mcp](../architecture-analyzer)
- [@j0kz/smart-reviewer-mcp](../smart-reviewer)
- [@j0kz/test-generator-mcp](../test-generator)
- [@j0kz/security-scanner-mcp](../security-scanner)
- [@j0kz/api-designer-mcp](../api-designer)
- [@j0kz/db-schema-mcp](../db-schema)
- [@j0kz/doc-generator-mcp](../doc-generator)
- [@j0kz/refactor-assistant-mcp](../refactor-assistant)

## 📞 Support

- [GitHub Issues](https://github.com/j0KZ/mcp-agents/issues)
- [Documentation](https://github.com/j0KZ/mcp-agents#readme)

---

**Built with ❤️ for the MCP community**
