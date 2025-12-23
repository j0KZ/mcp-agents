# Shared Utilities Guide (@j0kz/shared)

## Available Utilities

The `@j0kz/shared` package provides common functionality across all MCP tools.

## FileSystemManager

Handles all file operations with built-in caching and validation.

### Usage
```typescript
import { FileSystemManager } from '@j0kz/shared';

// Read file with caching
const content = await FileSystemManager.readFile('src/file.ts');

// Write file safely
await FileSystemManager.writeFile('output.ts', content);

// Check if file exists
const exists = await FileSystemManager.fileExists('config.json');

// Get file stats
const stats = await FileSystemManager.getFileStats('large.ts');
if (stats.size > 100_000) {
  throw new Error('File too large');
}
```

### Features
- Automatic caching (5-minute TTL)
- Path validation (prevents traversal attacks)
- Size limit checks
- Encoding handling (UTF-8 default)
- Error recovery

## AnalysisCache

LRU cache for analysis results with automatic expiration.

### Usage
```typescript
import { AnalysisCache } from '@j0kz/shared';

// Check cache first
const cacheKey = `analysis:${filePath}:${version}`;
const cached = await AnalysisCache.get(cacheKey);
if (cached) {
  return cached;
}

// Perform expensive operation
const result = await expensiveAnalysis(filePath);

// Cache result (30-minute default TTL)
await AnalysisCache.set(cacheKey, result);

// Custom TTL (milliseconds)
await AnalysisCache.set(cacheKey, result, 3600000); // 1 hour

// Clear specific key
await AnalysisCache.clear(cacheKey);

// Clear all cache
await AnalysisCache.clearAll();
```

### Features
- LRU eviction (1000 items max)
- Automatic TTL expiration
- Size-based eviction
- Memory-efficient
- Thread-safe

## PerformanceMonitor

Track operation performance and identify bottlenecks.

### Usage
```typescript
import { PerformanceMonitor } from '@j0kz/shared';

// Start monitoring
const monitor = PerformanceMonitor.start('analyze_file');

// Do work
await analyzeFile(content);

// Stop and get duration
monitor.end();
const duration = monitor.getDuration(); // milliseconds

// Log if slow
if (duration > 1000) {
  console.log(`Slow operation: ${duration}ms`);
}

// Get all metrics
const metrics = PerformanceMonitor.getMetrics();
// { analyze_file: { count: 5, total: 2500, avg: 500 } }
```

### Features
- Automatic timing
- Aggregated metrics
- Memory tracking
- Nested monitoring
- Export to JSON

## MCPPipeline

Chain multiple MCP tools together in workflows.

### Usage
```typescript
import { MCPPipeline } from '@j0kz/shared';

// Create pipeline
const pipeline = new MCPPipeline('quality-check');

// Add stages
pipeline
  .addStage('review', {
    tool: 'smart-reviewer',
    action: 'review_file',
    config: { severity: 'strict' }
  })
  .addStage('test', {
    tool: 'test-generator',
    action: 'generate_tests',
    config: { coverage: 80 }
  })
  .addStage('security', {
    tool: 'security-scanner',
    action: 'scan',
    config: { deep: true }
  });

// Execute pipeline
const results = await pipeline.execute({
  filePath: 'src/main.ts'
});

// Access stage results
console.log(results.review.data);
console.log(results.test.data);
console.log(results.security.data);
```

### Features
- Sequential execution
- Parallel stage support
- Error handling per stage
- Result aggregation
- Conditional stages

## MCPIntegration

Communicate with other MCP tools.

### Usage
```typescript
import { MCPIntegration } from '@j0kz/shared';

// Call another MCP tool
const result = await MCPIntegration.callTool(
  'smart-reviewer',
  'review_file',
  {
    filePath: 'src/module.ts',
    config: { severity: 'moderate' }
  }
);

// Check if tool is available
const hasReviewer = await MCPIntegration.isToolAvailable(
  'smart-reviewer'
);

// Get tool metadata
const metadata = await MCPIntegration.getToolInfo(
  'test-generator'
);
```

### Features
- Inter-tool communication
- Tool discovery
- Version checking
- Async execution
- Error propagation

## Input Validation Utilities

### validateFilePath
```typescript
import { validateFilePath } from '@j0kz/shared';

// Prevents path traversal attacks
const safePath = validateFilePath(userInput);
// Throws if path contains ../ or absolute paths
```

### validateInput
```typescript
import { validateInput } from '@j0kz/shared';

// Generic input validation
const validated = validateInput(args, {
  filePath: { type: 'string', required: true },
  config: {
    type: 'object',
    properties: {
      severity: { type: 'string', enum: ['strict', 'moderate'] }
    }
  }
});
```

### sanitizeOutput
```typescript
import { sanitizeOutput } from '@j0kz/shared';

// Remove sensitive data from output
const safe = sanitizeOutput(result, {
  removePaths: true,
  removeSecrets: true,
  removeEmails: true
});
```

## Error Classes

### Custom Error Types
```typescript
import {
  ValidationError,
  FileNotFoundError,
  TimeoutError,
  ConfigurationError
} from '@j0kz/shared';

// Use specific errors for better handling
if (!args.filePath) {
  throw new ValidationError('filePath is required');
}

if (!await fileExists(path)) {
  throw new FileNotFoundError(`File not found: ${path}`);
}

if (duration > timeout) {
  throw new TimeoutError(`Operation timed out after ${timeout}ms`);
}
```

## Configuration Management

### ConfigLoader
```typescript
import { ConfigLoader } from '@j0kz/shared';

// Load and merge configs
const config = await ConfigLoader.load({
  defaults: defaultConfig,
  file: 'config.json',
  env: process.env,
  args: commandLineArgs
});

// Validate config
const valid = ConfigLoader.validate(config, schema);

// Watch for changes
ConfigLoader.watch('config.json', (newConfig) => {
  // Handle config updates
});
```

## Logging Utilities

### Logger
```typescript
import { Logger } from '@j0kz/shared';

const log = new Logger('my-tool');

// Log levels
log.debug('Detailed information');
log.info('General information');
log.warn('Warning message');
log.error('Error occurred', error);

// Structured logging
log.info('Analysis complete', {
  filePath: 'src/main.ts',
  duration: 250,
  issues: 5
});
```

## Best Practices

### 1. Always Use Shared Utilities
```typescript
// ❌ Don't reinvent
const content = fs.readFileSync(path, 'utf-8');

// ✅ Use shared
const content = await FileSystemManager.readFile(path);
```

### 2. Cache Expensive Operations
```typescript
// Always check cache first
const cached = await AnalysisCache.get(key);
if (cached) return cached;

// Perform operation
const result = await expensiveOp();

// Cache result
await AnalysisCache.set(key, result);
```

### 3. Monitor Performance
```typescript
const monitor = PerformanceMonitor.start('operation');
try {
  await doWork();
} finally {
  monitor.end();
}
```

### 4. Validate All Inputs
```typescript
// Never trust user input
const safePath = validateFilePath(userPath);
const validated = validateInput(args, schema);
```

## Version Compatibility

Ensure @j0kz/shared version matches version.json:

```bash
# Check version
npm run version:check-shared

# If mismatch, sync versions
npm run version:sync
```