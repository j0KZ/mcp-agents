# 🎯 Ultra-Strategic Plan: Week 1-3 Test Coverage & Optimization

## Executive Strategy

**Goal:** Transform codebase from 59% → 80% coverage while fixing critical issues and optimizing performance.

**Key Insight:** Not all coverage is equal. Focus on:

1. **Critical paths** (security, data processing)
2. **High-usage functions** (called by multiple packages)
3. **Error handling** (currently least tested)
4. **Integration points** (MCP communication)

---

## 📅 Week 1: Foundation & Critical Fixes (59% → 75%)

### Day 1-2: Coverage Analysis & Config-Wizard Fixes

#### Morning: Deep Coverage Analysis

```bash
# 1. Generate detailed coverage report per package
for pkg in packages/*; do
  if [ -d "$pkg/src" ]; then
    echo "=== $(basename $pkg) ==="
    cd "$pkg"
    npx vitest run --coverage --reporter=json > coverage.json
    # Extract uncovered files
    grep -E '"pct":|"uncovered"' coverage.json
    cd ../..
  fi
done
```

#### Identify Coverage Gaps by Priority:

1. **Security-critical** (path-validator, sanitizers)
2. **Data transformation** (parsers, generators)
3. **Error handling** (try-catch blocks)
4. **Edge cases** (null, undefined, empty arrays)

#### Afternoon: Fix Config-Wizard Tests

```typescript
// Fix the 18 failing tests in config-wizard
// Primary issues to address:
1. Mock dependency injection issues
2. Async timing problems in wizard.test.ts
3. File system mock inconsistencies
4. Import path resolution

// Solution pattern:
vi.mock('./detectors/editor.js', async () => {
  const actual = await vi.importActual('./detectors/editor.js');
  return {
    ...actual,
    detectEditor: vi.fn().mockResolvedValue('vscode')
  };
});
```

### Day 3: Memory Profiling Infrastructure

#### Create Memory Profiler Module

```typescript
// packages/shared/src/profiling/memory-profiler.ts
export class MemoryProfiler {
  private baseline: NodeJS.MemoryUsage;
  private snapshots: Map<string, MemorySnapshot>;
  private leakDetector: WeakMap<object, number>;

  startProfiling(label: string): void {
    this.baseline = process.memoryUsage();
    this.snapshots.set(label, {
      timestamp: Date.now(),
      heap: this.baseline.heapUsed,
      external: this.baseline.external,
      arrayBuffers: this.baseline.arrayBuffers,
    });
  }

  checkpoint(label: string): MemoryDelta {
    const current = process.memoryUsage();
    const delta = {
      heapDelta: current.heapUsed - this.baseline.heapUsed,
      externalDelta: current.external - this.baseline.external,
      gcCount: global.gc ? this.getGCCount() : 0,
    };

    // Detect potential leaks
    if (delta.heapDelta > 50 * 1024 * 1024) {
      // 50MB
      this.flagPotentialLeak(label);
    }

    return delta;
  }

  detectLeaks(): LeakReport {
    // Analyze snapshot patterns
    // Identify growing memory over time
    // Report suspicious allocations
  }

  generateReport(): MemoryReport {
    // Comprehensive memory analysis
    // Identify bottlenecks
    // Suggest optimizations
  }
}
```

#### Integrate with MCP Tools

```typescript
// Add to each MCP server
const profiler = new MemoryProfiler();

server.setRequestHandler(CallToolRequestSchema, async request => {
  profiler.startProfiling(request.params.name);

  try {
    const result = await processRequest(request);
    const memory = profiler.checkpoint('complete');

    return {
      ...result,
      _debug: { memory }, // Include in dev mode
    };
  } finally {
    profiler.cleanup();
  }
});
```

### Day 4-5: Strategic Test Addition (Focus Areas)

#### Priority 1: Orchestrator-MCP (40% → 75%)

```typescript
// Missing test areas:
1. Pipeline error propagation
2. Timeout handling
3. Retry logic
4. Parallel execution
5. Data transformation between steps

// High-impact test example:
describe('Pipeline Error Recovery', () => {
  it('should retry failed steps with exponential backoff', async () => {
    const pipeline = new MCPPipeline({ maxRetries: 3 });
    let attempts = 0;

    pipeline.addStep({
      name: 'flaky',
      execute: async () => {
        attempts++;
        if (attempts < 3) throw new Error('Transient');
        return { success: true };
      }
    });

    const result = await pipeline.execute();
    expect(attempts).toBe(3);
    expect(result.success).toBe(true);
  });
});
```

#### Priority 2: Config-Wizard (45% → 75%)

```typescript
// Missing test areas:
1. Editor detection logic
2. Project type inference
3. MCP selection algorithms
4. Configuration validation
5. File writing with conflicts

// Critical path test:
describe('Configuration Generation', () => {
  it('should generate correct config for each editor', async () => {
    const editors = ['vscode', 'cursor', 'windsurf', 'claude'];

    for (const editor of editors) {
      const config = await generateConfig({
        editor,
        mcps: ['smart-reviewer', 'test-generator'],
        preferences: { reviewSeverity: 'strict' }
      });

      expect(config).toHaveProperty(`${editor}Settings`);
      expect(config.mcpServers).toHaveProperty('smart-reviewer');
    }
  });
});
```

#### Priority 3: Security-Scanner (75% → 85%)

```typescript
// Missing test areas:
1. OWASP pattern detection
2. Secret detection edge cases
3. Dependency vulnerability scanning
4. Report generation
5. Auto-fix validation

// Edge case test:
describe('Secret Detection Edge Cases', () => {
  it('should detect obfuscated secrets', async () => {
    const obfuscatedSecrets = [
      'aws_' + 'secret_' + 'key', // Split strings
      Buffer.from('token').toString('base64'), // Encoded
      'sk_live_' + '4242'.repeat(8), // Constructed
    ];

    for (const secret of obfuscatedSecrets) {
      const result = await scanForSecrets(secret);
      expect(result.hasSecrets).toBe(true);
    }
  });
});
```

---

## 📅 Week 2: Coverage Push & Duplication Removal (75% → 80%)

### Day 6-7: Extract Remaining Duplicates

#### Duplicate Pattern Analysis

```javascript
// Identify patterns using AST analysis
const duplicatePatterns = {
  errorHandling: 39 /* blocks */,
  responseBuilding: 27,
  fileOperations: 22,
  validation: 18,
  logging: 15
};

// Extract to shared:
1. Error wrapper pattern
2. Response builder pattern
3. File operation pattern
4. Validation helpers
5. Structured logging
```

#### Create Shared Patterns

```typescript
// packages/shared/src/patterns/error-pattern.ts
export function withErrorContext<T>(
  operation: () => Promise<T>,
  context: ErrorContext
): Promise<Result<T>> {
  return withErrorHandling(async () => {
    try {
      return await operation();
    } catch (error) {
      logger.error('Operation failed', { ...context, error });
      throw new MCPError(context.code, { ...context, error });
    }
  });
}

// packages/shared/src/patterns/response-pattern.ts
export class ResponseBuilder {
  private response: MCPResponse;

  static success(data: any): ResponseBuilder {
    return new ResponseBuilder().withSuccess(data);
  }

  static error(error: Error, code?: string): ResponseBuilder {
    return new ResponseBuilder().withError(error, code);
  }

  withMetadata(metadata: Record<string, any>): this {
    this.response.metadata = { ...this.response.metadata, ...metadata };
    return this;
  }

  build(): MCPResponse {
    return this.response;
  }
}
```

### Day 8-9: Smart Test Generation

#### Use Test Generator on Itself

```bash
# Generate tests for uncovered files
for file in $(find packages -name "*.ts" -not -name "*.test.ts" -not -name "*.d.ts"); do
  coverage=$(get_file_coverage "$file")
  if [ "$coverage" -lt 60 ]; then
    npx @j0kz/test-generator-mcp generate_tests \
      --sourceFile "$file" \
      --coverage 80 \
      --includeEdgeCases \
      --includeErrorCases
  fi
done
```

#### AI-Assisted Test Creation

```typescript
// Focus on high-value test scenarios:
1. Boundary conditions
2. Error recovery
3. Race conditions
4. Memory leaks
5. Security vulnerabilities

// Template for high-value tests:
describe('High-Value Scenarios', () => {
  it('should handle concurrent requests without memory leak', async () => {
    const profiler = new MemoryProfiler();
    profiler.startProfiling('concurrent');

    const promises = Array.from({ length: 100 }, (_, i) =>
      processRequest({ id: i })
    );

    await Promise.all(promises);

    const memory = profiler.checkpoint('after');
    expect(memory.heapDelta).toBeLessThan(10 * 1024 * 1024); // <10MB
  });
});
```

### Day 10: Performance Optimization Phase 1

#### Identify Bottlenecks

```typescript
// Add performance markers
export function measurePerformance(label: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      const memBefore = process.memoryUsage();

      try {
        const result = await originalMethod.apply(this, args);

        const duration = performance.now() - start;
        const memDelta = process.memoryUsage().heapUsed - memBefore.heapUsed;

        if (duration > 1000) {
          // Slow operation
          logger.warn(`Slow operation: ${label}`, { duration, memDelta });
        }

        return result;
      } catch (error) {
        logger.error(`Failed operation: ${label}`, { error });
        throw error;
      }
    };
  };
}
```

#### Quick Wins

```typescript
// 1. Cache compiled regexes
const regexCache = new Map<string, RegExp>();
export function getCachedRegex(pattern: string, flags?: string): RegExp {
  const key = `${pattern}:${flags || ''}`;
  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(pattern, flags));
  }
  return regexCache.get(key)!;
}

// 2. Batch file operations
export async function batchReadFiles(paths: string[]): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  await Promise.all(
    paths.map(async path => {
      try {
        const content = await fs.readFile(path, 'utf-8');
        results.set(path, content);
      } catch (error) {
        results.set(path, ''); // Handle gracefully
      }
    })
  );

  return results;
}

// 3. Lazy loading for heavy modules
let heavyModule: HeavyModule | null = null;
export function getHeavyModule(): HeavyModule {
  if (!heavyModule) {
    heavyModule = require('./heavy-module');
  }
  return heavyModule;
}
```

---

## 📅 Week 3: Polish & Optimization (80% → Excellence)

### Day 11-12: Advanced Memory Optimization

#### Memory Leak Detection

```typescript
// Automated leak detection
export class LeakDetector {
  private checkpoints: MemoryCheckpoint[] = [];
  private threshold = 100 * 1024 * 1024; // 100MB

  async runLeakTest(operation: () => Promise<void>, iterations: number = 100): Promise<LeakReport> {
    global.gc && global.gc(); // Force GC if available
    const baseline = process.memoryUsage();

    for (let i = 0; i < iterations; i++) {
      await operation();

      if (i % 10 === 0) {
        global.gc && global.gc();
        const current = process.memoryUsage();
        this.checkpoints.push({
          iteration: i,
          heapUsed: current.heapUsed,
          delta: current.heapUsed - baseline.heapUsed,
        });
      }
    }

    return this.analyzeGrowth();
  }

  private analyzeGrowth(): LeakReport {
    // Linear regression to detect growing memory
    const trend = this.calculateTrend(this.checkpoints);

    return {
      hasLeak: trend.slope > 1000, // Growing >1KB per iteration
      severity: this.calculateSeverity(trend),
      recommendation: this.getRecommendation(trend),
    };
  }
}
```

#### Object Pool Implementation

```typescript
// Reuse expensive objects
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (obj: T) => void, maxSize = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }
}

// Usage for AST parser
const parserPool = new ObjectPool(
  () => new ASTParser(),
  parser => parser.reset(),
  50
);
```

### Day 13: Integration Test Suite Completion

#### End-to-End Workflow Tests

```typescript
describe('Complete Workflow Integration', () => {
  it('should handle full pre-commit workflow', async () => {
    // Create real test files
    const files = await createTestProject({
      files: 10,
      issues: ['unused-var', 'no-types', 'security-risk'],
    });

    // Run full workflow
    const orchestrator = new Orchestrator();
    const result = await orchestrator.runWorkflow('pre-commit', { files });

    // Verify all steps completed
    expect(result.steps.review.success).toBe(true);
    expect(result.steps.security.success).toBe(true);
    expect(result.issues).toHaveLength(3);

    // Verify fixes were suggested
    expect(result.suggestions).toContainEqual(expect.objectContaining({ type: 'auto-fix' }));
  });
});
```

### Day 14: Performance Benchmarking & Optimization

#### Comprehensive Benchmark Suite

```javascript
// benchmarks/comprehensive.js
const scenarios = [
  {
    name: 'Startup Time',
    measure: async () => {
      const start = Date.now();
      await import('@j0kz/smart-reviewer-mcp');
      return Date.now() - start;
    },
    target: 500, // ms
  },
  {
    name: 'First Request',
    measure: async () => {
      const client = new MCPClient('smart-reviewer');
      const start = Date.now();
      await client.invoke('review_file', { filePath: 'test.ts' });
      return Date.now() - start;
    },
    target: 1000, // ms
  },
  {
    name: 'Concurrent Requests',
    measure: async () => {
      const client = new MCPClient('smart-reviewer');
      const start = Date.now();
      await Promise.all(
        Array.from({ length: 10 }, () => client.invoke('review_file', { filePath: 'test.ts' }))
      );
      return (Date.now() - start) / 10; // Average
    },
    target: 200, // ms per request
  },
];
```

### Day 15: Final Polish & Documentation

#### Automated Coverage Monitoring

```yaml
# .github/workflows/coverage-monitor.yml
name: Coverage Monitor
on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run Coverage
        run: npm run test:coverage

      - name: Check Thresholds
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 75" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 75% threshold"
            exit 1
          fi

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const coverage = require('./coverage/coverage-summary.json');
            const comment = `
            ## Coverage Report
            - Statements: ${coverage.total.statements.pct}%
            - Branches: ${coverage.total.branches.pct}%
            - Functions: ${coverage.total.functions.pct}%
            - Lines: ${coverage.total.lines.pct}%
            `;
            github.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 📊 Success Metrics & Validation

### Week 1 Targets ✓

- [ ] Coverage: 59% → 75%
- [ ] Config-wizard: All tests passing
- [ ] Memory profiling: Integrated
- [ ] Critical paths: 100% covered

### Week 2 Targets ✓

- [ ] Coverage: 75% → 80%
- [ ] Duplicates: <10 blocks
- [ ] Performance: 30% faster
- [ ] Memory: 20% less usage

### Week 3 Targets ✓

- [ ] Coverage: 80%+
- [ ] All integration tests
- [ ] Zero memory leaks
- [ ] Benchmarks passing

---

## 🚀 Implementation Order (Prioritized)

1. **Day 1 Morning:** Fix config-wizard tests (unblocks everything)
2. **Day 1 Afternoon:** Coverage analysis (guides all decisions)
3. **Day 2:** Memory profiling (catches issues early)
4. **Day 3-5:** Strategic test addition (biggest coverage gains)
5. **Day 6-7:** Extract duplicates (improves maintainability)
6. **Day 8-9:** Smart test generation (automated coverage)
7. **Day 10-12:** Performance optimization (user experience)
8. **Day 13-15:** Polish and monitoring (sustainability)

---

## 🎯 Key Success Factors

1. **Measure First, Optimize Second** - Profile before optimizing
2. **High-Impact Tests** - One integration test > 10 unit tests
3. **Automate Everything** - Coverage monitoring, leak detection
4. **Quick Wins First** - Fix obvious issues for momentum
5. **Document Patterns** - Prevent future duplicates

This plan achieves 80% coverage while significantly improving performance and maintainability.
