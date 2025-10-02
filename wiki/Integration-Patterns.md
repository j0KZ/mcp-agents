# Integration Patterns

Learn how to chain multiple MCP tools together for powerful automated workflows.

## 🎯 Overview

MCP Agents can work together through the `@mcp-tools/shared` package, enabling:

- **Sequential Pipelines**: Chain tools with dependencies
- **Parallel Execution**: Run multiple tools concurrently
- **Event-Driven**: React to changes in real-time
- **Conditional Workflows**: Execute based on results

## 📚 Core Concepts

### 1. MCPPipeline

Sequential orchestration with step dependencies.

```typescript
import { MCPPipeline } from '@mcp-tools/shared';

const pipeline = new MCPPipeline();

pipeline
  .addStep({
    name: 'analyze',
    tool: 'architecture-analyzer',
    execute: async (input) => {
      // Analyze project architecture
      return await analyzeArchitecture(input.projectPath);
    }
  })
  .addStep({
    name: 'review',
    tool: 'smart-reviewer',
    dependsOn: ['analyze'], // Wait for analyze
    execute: async (input) => {
      const archResults = input[0]; // Results from 'analyze'
      return await reviewCode(archResults.data.problematicFiles);
    }
  });

const result = await pipeline.execute();
```

### 2. MCPIntegration

Tool registration and parallel/sequence execution.

```typescript
import { MCPIntegration } from '@mcp-tools/shared';

const integration = new MCPIntegration();

// Register tools
integration.registerTool('reviewer', new SmartReviewer());
integration.registerTool('tester', new TestGenerator());

// Run in parallel
await integration.parallel([
  { tool: 'reviewer', method: 'review', args: [file1] },
  { tool: 'tester', method: 'generate', args: [file2] }
]);

// Run in sequence
await integration.sequence([
  { tool: 'reviewer', method: 'review', args: [file] },
  { tool: 'tester', method: 'generate', args: [file] }
]);
```

### 3. MCPWorkflow

Conditional workflows with branching logic.

```typescript
import { MCPWorkflow } from '@mcp-tools/shared';

const workflow = new MCPWorkflow('security-workflow');

workflow
  .step('scan', 'security-scanner', 'scan')
  .step('test', 'test-generator', 'generate', {}, (results) => {
    // Only generate tests if vulnerabilities found
    return results['scan'].data.vulnerabilities.length > 0;
  })
  .step('document', 'doc-generator', 'generateReport');

await workflow.run(integration, { projectPath: './src' });
```

### 4. MCPEventBus

Event-driven communication between tools.

```typescript
import { MCPEventBus, EVENT_TYPE } from '@mcp-tools/shared';

const eventBus = new MCPEventBus();

// Producer: File watcher
eventBus.on(EVENT_TYPE.FILE_CHANGED, async (data) => {
  const result = await analyzer.analyze(data.filePath);
  eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, { result });
});

// Consumer: Test generator
eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, async (data) => {
  if (data.result.issues.length > 0) {
    await testGen.generateTests(data.result.file);
  }
});
```

## 🔄 Common Workflows

### Workflow 1: Code Quality Pipeline

**Goal**: Analyze → Review → Refactor → Test

```typescript
import { MCPPipeline } from '@mcp-tools/shared';

const qualityPipeline = new MCPPipeline();

qualityPipeline
  // Step 1: Architecture analysis
  .addStep({
    name: 'architecture',
    execute: async (input) => {
      return await architectureAnalyzer.analyze(input.projectPath);
    }
  })
  // Step 2: Code review (depends on architecture)
  .addStep({
    name: 'review',
    dependsOn: ['architecture'],
    execute: async (input) => {
      const archResults = input[0];
      const files = archResults.data.files.filter(f =>
        f.complexity > 20 || f.issues.length > 0
      );
      return await smartReviewer.batchReview(files);
    }
  })
  // Step 3: Refactoring suggestions
  .addStep({
    name: 'refactor',
    dependsOn: ['review'],
    execute: async (input) => {
      const reviewResults = input[0];
      const highPriorityIssues = reviewResults.data.filter(r =>
        r.severity === 'error' || r.severity === 'warning'
      );
      return await refactorAssistant.suggestFixes(highPriorityIssues);
    }
  })
  // Step 4: Generate tests
  .addStep({
    name: 'test',
    dependsOn: ['refactor'],
    execute: async (input) => {
      const refactorResults = input[0];
      return await testGenerator.generate(refactorResults.data.modifiedFiles);
    }
  });

// Execute the full pipeline
const result = await qualityPipeline.execute();

console.log(`
  Architecture Issues: ${result.steps[0].result.data.issues.length}
  Code Review Issues: ${result.steps[1].result.data.totalIssues}
  Refactoring Suggestions: ${result.steps[2].result.data.suggestions.length}
  Tests Generated: ${result.steps[3].result.data.testCount}
`);
```

### Workflow 2: Security Audit

**Goal**: Scan → Generate Tests → Document → Fix

```typescript
import { MCPWorkflow, MCPIntegration } from '@mcp-tools/shared';

const integration = new MCPIntegration();
integration.registerTool('security', new SecurityScanner());
integration.registerTool('test-gen', new TestGenerator());
integration.registerTool('doc-gen', new DocGenerator());
integration.registerTool('refactor', new RefactorAssistant());

const securityWorkflow = new MCPWorkflow('security-audit');

securityWorkflow
  // Step 1: Security scan
  .step('scan', 'security', 'scanProject', {
    minSeverity: 'high',
    scanSecrets: true,
    scanDependencies: true
  })
  // Step 2: Generate security tests (conditional)
  .step('test', 'test-gen', 'generateSecurityTests', {
    framework: 'jest'
  }, (results) => {
    return results['scan'].data.vulnerabilities.length > 0;
  })
  // Step 3: Generate security report
  .step('document', 'doc-gen', 'generateSecurityReport')
  // Step 4: Suggest fixes (conditional)
  .step('fix', 'refactor', 'suggestSecurityFixes', {}, (results) => {
    const criticalVulns = results['scan'].data.vulnerabilities.filter(
      v => v.severity === 'critical'
    );
    return criticalVulns.length > 0;
  });

const result = await securityWorkflow.run(integration, {
  projectPath: './src'
});
```

### Workflow 3: API Development

**Goal**: Design API → Generate Schema → Create Docs → Generate Tests

```typescript
const apiWorkflow = new MCPPipeline();

apiWorkflow
  // Design API
  .addStep({
    name: 'design',
    execute: async (input) => {
      return await apiDesigner.generateOpenAPI({
        name: 'User API',
        resources: ['users', 'posts', 'comments'],
        style: 'REST'
      });
    }
  })
  // Generate database schema
  .addStep({
    name: 'schema',
    dependsOn: ['design'],
    execute: async (input) => {
      const apiSpec = input[0].data;
      return await dbSchemaDesigner.fromOpenAPI(apiSpec);
    }
  })
  // Generate API documentation
  .addStep({
    name: 'docs',
    dependsOn: ['design'],
    execute: async (input) => {
      const apiSpec = input[0].data;
      return await docGenerator.generateAPIDocs(apiSpec);
    }
  })
  // Generate API tests
  .addStep({
    name: 'tests',
    dependsOn: ['design'],
    execute: async (input) => {
      const apiSpec = input[0].data;
      return await testGenerator.generateAPITests(apiSpec);
    }
  })
  // Generate mock server
  .addStep({
    name: 'mock',
    dependsOn: ['design'],
    execute: async (input) => {
      const apiSpec = input[0].data;
      return await apiDesigner.generateMockServer(apiSpec, {
        framework: 'express',
        port: 3000
      });
    }
  });

const result = await apiWorkflow.execute();
```

### Workflow 4: Real-Time Code Quality

**Goal**: Watch files → Analyze → Review → Notify

```typescript
import { MCPEventBus, FileWatcher, EVENT_TYPE } from '@mcp-tools/shared';

const eventBus = new MCPEventBus();
const watcher = new FileWatcher(500); // 500ms debounce

// Watch for file changes
watcher.watch('./src', (event, filename) => {
  if (event === 'change' && /\.(ts|js)$/.test(filename)) {
    eventBus.emit(EVENT_TYPE.FILE_CHANGED, {
      filePath: filename,
      timestamp: new Date().toISOString()
    });
  }
}, { recursive: true });

// Architecture analysis on file change
eventBus.on(EVENT_TYPE.FILE_CHANGED, async (data) => {
  console.log(`🔍 Analyzing ${data.filePath}...`);

  const archResult = await architectureAnalyzer.analyzeFile(data.filePath);

  eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, {
    tool: 'architecture-analyzer',
    filePath: data.filePath,
    result: archResult
  });
});

// Code review after architecture analysis
eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, async (data) => {
  if (data.tool === 'architecture-analyzer') {
    console.log(`📝 Reviewing ${data.filePath}...`);

    const reviewResult = await smartReviewer.reviewFile(data.filePath);

    eventBus.emit(EVENT_TYPE.ANALYSIS_COMPLETED, {
      tool: 'smart-reviewer',
      filePath: data.filePath,
      result: reviewResult
    });
  }
});

// Notification after review
eventBus.on(EVENT_TYPE.ANALYSIS_COMPLETED, (data) => {
  if (data.tool === 'smart-reviewer') {
    const issues = data.result.issues.filter(i =>
      i.severity === 'error' || i.severity === 'warning'
    );

    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues in ${data.filePath}`);
      // Could send notification, create GitHub issue, etc.
    } else {
      console.log(`✅ ${data.filePath} looks good!`);
    }
  }
});

console.log('👀 Watching ./src for changes...');
```

## 🎨 Advanced Patterns

### Pattern 1: Parallel + Sequential Hybrid

```typescript
const integration = new MCPIntegration();

// Register all tools
integration.registerTool('arch', new ArchitectureAnalyzer());
integration.registerTool('security', new SecurityScanner());
integration.registerTool('reviewer', new SmartReviewer());
integration.registerTool('tester', new TestGenerator());

// Run architecture and security in parallel (independent)
const [archResult, securityResult] = await integration.parallel([
  { tool: 'arch', method: 'analyze', args: ['./src'] },
  { tool: 'security', method: 'scan', args: ['./src'] }
]);

// Then run review and tests in sequence (dependent)
const reviewResult = await integration.getTool('reviewer').review(
  archResult.data.problematicFiles
);

const testResult = await integration.getTool('tester').generate(
  reviewResult.data.criticalFiles
);
```

### Pattern 2: Chain with Transformation

```typescript
const result = await integration.chain(
  { projectPath: './src' },
  [
    {
      tool: 'arch',
      method: 'analyze',
      transform: (data) => data.files // Extract files
    },
    {
      tool: 'reviewer',
      method: 'batchReview',
      transform: (data) => data.filter(r => r.score < 70) // Low scores
    },
    {
      tool: 'refactor',
      method: 'suggestFixes',
      transform: (data) => data.map(d => d.file) // Extract file paths
    },
    {
      tool: 'tester',
      method: 'generate'
      // Final result
    }
  ]
);
```

### Pattern 3: Retry with Circuit Breaker

```typescript
import { retry, CircuitBreaker } from '@mcp-tools/shared';

const breaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 60000
});

async function resilientAnalysis(filePath: string) {
  return await breaker.execute(async () => {
    return await retry(
      async () => {
        return await analyzer.analyze(filePath);
      },
      3, // max retries
      1000 // delay
    );
  });
}
```

### Pattern 4: Cached Pipeline

```typescript
import { AnalysisCache, generateHash } from '@mcp-tools/shared';

const cache = new AnalysisCache(100, 1800000); // 100 results, 30min TTL

async function cachedPipeline(projectPath: string) {
  const cacheKey = generateHash(projectPath);

  // Check cache
  const cached = cache.get(projectPath, 'full-pipeline', cacheKey);
  if (cached) {
    console.log('Using cached results');
    return cached;
  }

  // Run pipeline
  const result = await qualityPipeline.execute({ projectPath });

  // Cache result
  cache.set(projectPath, 'full-pipeline', cacheKey, result);

  return result;
}
```

## 📊 Performance Considerations

### Parallel vs Sequential

**Use Parallel When**:
- Operations are independent
- No data dependencies
- Maximum speed needed

```typescript
// Good: Independent operations
await integration.parallel([
  { tool: 'security', method: 'scan', args: [file1] },
  { tool: 'arch', method: 'analyze', args: [file2] }
]);
```

**Use Sequential When**:
- Operations depend on previous results
- Order matters
- Resource constraints

```typescript
// Good: Dependent operations
await integration.sequence([
  { tool: 'arch', method: 'analyze' },
  { tool: 'reviewer', method: 'review' } // Uses arch results
]);
```

### Caching Strategies

**File-Level Cache**:
```typescript
const fsManager = new FileSystemManager(500);
const content = await fsManager.readFile(path, true); // Cached
```

**Analysis-Level Cache**:
```typescript
const cache = new AnalysisCache();
const fileHash = generateHash(content);
const result = cache.get(path, 'review', fileHash);
```

**Pipeline-Level Cache**:
```typescript
const pipelineCache = new Map();
const cacheKey = `${input.projectPath}-${Date.now()}`;
```

## 🛠️ Usage in AI Editors

### Claude Code Example

User: "Run a full quality audit on this project"

AI (using integration):
```typescript
// The AI automatically constructs and runs:
const pipeline = new MCPPipeline()
  .addStep({ name: 'arch', execute: () => analyzeArchitecture('./') })
  .addStep({ name: 'review', dependsOn: ['arch'], execute: () => reviewCode() })
  .addStep({ name: 'test', dependsOn: ['review'], execute: () => generateTests() });

const result = await pipeline.execute();
```

AI Response:
```
✅ Quality Audit Complete

Architecture Analysis:
- 12 circular dependencies found
- 5 layer violations
- Modularity score: 65/100

Code Review:
- 45 issues found (8 errors, 23 warnings, 14 info)
- Average complexity: 18
- Average maintainability: 68

Tests Generated:
- 127 test cases created
- Coverage increased to 87%

Recommendations:
1. Fix circular dependencies in auth module
2. Refactor 3 high-complexity functions
3. Review and run generated tests
```

## 📚 Best Practices

1. **Start Simple**: Begin with sequential pipelines, add complexity later
2. **Cache Aggressively**: Use caching at every level
3. **Handle Errors**: Use try/catch and retry logic
4. **Monitor Performance**: Track execution time
5. **Log Progress**: Provide user feedback
6. **Test Integrations**: Verify workflows work correctly

## 🆘 Troubleshooting

### Issue: Pipeline Hangs

**Problem**: Pipeline never completes

**Solution**:
- Check for circular dependencies
- Ensure all dependencies exist
- Add timeout to steps

```typescript
pipeline.addStep({
  name: 'step',
  timeout: 30000, // 30s timeout
  execute: async () => { /* ... */ }
});
```

### Issue: Results Not Passed

**Problem**: Step doesn't receive previous results

**Solution**:
- Verify `dependsOn` array
- Check result format
- Use transform function if needed

```typescript
.addStep({
  name: 'review',
  dependsOn: ['analyze'],
  execute: async (input) => {
    const archResults = input[0]; // First dependency
    console.log(archResults); // Debug
    return review(archResults.data);
  }
});
```

## 📖 See Also

- [Shared Utilities](Shared-Utilities) - Core integration package
- [Performance Optimization](Performance-Optimization) - Speed improvements
- [Custom Workflows](Custom-Workflows) - Build your own
- [Examples](Examples) - Working code examples

---

**[← Back to Home](Home)** | **[Performance Optimization →](Performance-Optimization)**
