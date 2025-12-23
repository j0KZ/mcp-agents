## Custom Workflow Patterns

### Pattern 1: Progressive Quality Gate

**Use Case:** Incremental validation with early exits

```typescript
const pipeline = new MCPPipeline();

// Gate 1: Fast checks (fail-fast)
pipeline.addStep({
  name: 'quick-lint',
  tool: 'smart-reviewer',
  config: {
    action: 'batch_review',
    params: { filePaths: files, config: { severity: 'lenient' } }
  }
});

// Gate 2: Medium checks (only if Gate 1 passed)
pipeline.addStep({
  name: 'security-scan',
  tool: 'security-scanner',
  config: { /* ... */ },
  dependsOn: ['quick-lint']
});

// Gate 3: Slow checks (only if Gate 2 passed)
pipeline.addStep({
  name: 'comprehensive-review',
  tool: 'smart-reviewer',
  config: {
    action: 'batch_review',
    params: { filePaths: files, config: { severity: 'strict' } }
  },
  dependsOn: ['security-scan']
});
```

**Benefit:** Fast feedback - fails early on basic issues, avoids slow checks

### Pattern 2: Fan-Out, Fan-In

**Use Case:** Parallel analysis, then aggregate results

```typescript
// Fan-out: Run multiple analyses in parallel
pipeline.addStep({ name: 'review', tool: 'smart-reviewer', /* ... */ });
pipeline.addStep({ name: 'security', tool: 'security-scanner', /* ... */ });
pipeline.addStep({ name: 'architecture', tool: 'architecture-analyzer', /* ... */ });

// Fan-in: Aggregate results
pipeline.addStep({
  name: 'generate-report',
  tool: 'doc-generator',
  config: {
    action: 'aggregate_reports',
    params: { /* ... */ }
  },
  dependsOn: ['review', 'security', 'architecture']  // Wait for all
});
```

**Benefit:** Maximum parallelism, single comprehensive report

### Pattern 3: Conditional Execution

**Use Case:** Different paths based on file types

```typescript
const tsFiles = files.filter(f => f.endsWith('.ts'));
const configFiles = files.filter(f => f.includes('package.json'));

if (tsFiles.length > 0) {
  pipeline.addStep({
    name: 'review-typescript',
    tool: 'smart-reviewer',
    config: { params: { filePaths: tsFiles } }
  });
}

if (configFiles.length > 0) {
  pipeline.addStep({
    name: 'validate-config',
    tool: 'security-scanner',
    config: { params: { filePaths: configFiles } }
  });
}
```

**Benefit:** Only run relevant checks, save time

### Pattern 4: Retry with Backoff

**Use Case:** Handle flaky external services

```typescript
pipeline.addStep({
  name: 'external-api-check',
  tool: 'api-designer',
  config: { /* ... */ },
  retry: {
    maxAttempts: 3,
    backoffMs: 1000  // 1s, 2s, 4s
  }
});
```

**Benefit:** Resilient to transient failures

