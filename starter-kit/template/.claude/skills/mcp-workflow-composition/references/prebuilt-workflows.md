## Pre-Built Workflows (orchestrator-mcp)

Use `orchestrator-mcp` for ready-made workflows.

### Pre-Commit Workflow (Fast)

**Purpose:** Quick local checks before commit (30-60 seconds)

**Tools Used:**
1. smart-reviewer (batch_review, moderate severity)
2. security-scanner (scan_project, medium+ severity)

**When to Use:**
- Every local commit
- Git pre-commit hook
- Fast validation loop

**Usage:**
```
Tool: run_workflow
Input:
{
  "workflow": "pre-commit",
  "params": {
    "files": ["src/file1.ts", "src/file2.ts"]
  }
}
```

**What It Does:**
```typescript
// From workflows.ts
export function createPreCommitWorkflow(files: string[]): MCPPipeline {
  const pipeline = new MCPPipeline();

  // Step 1: Batch code review
  pipeline.addStep({
    name: 'code-review',
    tool: 'smart-reviewer',
    config: {
      action: 'batch_review',
      params: {
        filePaths: files,
        config: { severity: 'moderate' }
      }
    }
  });

  // Step 2: Security scan
  pipeline.addStep({
    name: 'security-scan',
    tool: 'security-scanner',
    config: {
      action: 'scan_project',
      params: {
        projectPath: '.',
        config: {
          includePatterns: files,
          minSeverity: 'medium'
        }
      }
    }
  });

  return pipeline;
}
```

**Expected Output:**
```json
{
  "success": true,
  "results": [
    {
      "step": "code-review",
      "success": true,
      "data": {
        "totalIssues": 3,
        "criticalIssues": 0
      }
    },
    {
      "step": "security-scan",
      "success": true,
      "data": {
        "vulnerabilities": [],
        "secrets": []
      }
    }
  ]
}
```

### Pre-Merge Workflow (Comprehensive)

**Purpose:** Thorough validation before merging PR (5-15 minutes)

**Tools Used:**
1. smart-reviewer (batch_review, strict severity)
2. architecture-analyzer (detect circular dependencies)
3. security-scanner (full audit)
4. test-generator (coverage check, depends on review)

**When to Use:**
- Before creating pull request
- CI/CD pipeline validation
- Release candidate checks

**Usage:**
```
Tool: run_workflow
Input:
{
  "workflow": "pre-merge",
  "params": {
    "files": ["src/file1.ts", "src/file2.ts"],
    "projectPath": "."
  }
}
```

**What It Does:**
```typescript
export function createPreMergeWorkflow(files: string[], projectPath: string): MCPPipeline {
  const pipeline = new MCPPipeline();

  // Step 1: Strict code review
  pipeline.addStep({
    name: 'batch-review',
    tool: 'smart-reviewer',
    config: {
      action: 'batch_review',
      params: {
        filePaths: files,
        config: { severity: 'strict' }
      }
    }
  });

  // Step 2: Architecture analysis
  pipeline.addStep({
    name: 'architecture-analysis',
    tool: 'architecture-analyzer',
    config: {
      action: 'analyze_architecture',
      params: {
        projectPath,
        config: {
          detectCircular: true,
          generateGraph: false
        }
      }
    }
  });

  // Step 3: Security audit
  pipeline.addStep({
    name: 'security-audit',
    tool: 'security-scanner',
    config: {
      action: 'scan_project',
      params: {
        projectPath,
        config: { minSeverity: 'medium' }
      }
    }
  });

  // Step 4: Test coverage (depends on review)
  pipeline.addStep({
    name: 'test-coverage',
    tool: 'test-generator',
    config: {
      action: 'batch_generate',
      params: {
        sourceFiles: files,
        config: {
          coverage: 70,
          framework: 'vitest'
        }
      }
    },
    dependsOn: ['batch-review']  // Only if review passes
  });

  return pipeline;
}
```

### Quality Audit Workflow (Deep Analysis)

**Purpose:** Comprehensive codebase analysis with reports (15-30 minutes)

**Tools Used:**
1. security-scanner (generate_security_report)
2. architecture-analyzer (full analysis + Mermaid graph)
3. doc-generator (generate full documentation)

**When to Use:**
- Monthly/quarterly quality reviews
- Before major releases
- Technical debt assessment
- Onboarding documentation

**Usage:**
```
Tool: run_workflow
Input:
{
  "workflow": "quality-audit",
  "params": {
    "projectPath": "."
  }
}
```

**What It Generates:**
- `reports/security.md` - Security vulnerability report
- Mermaid dependency graph
- Full API documentation
- Architecture metrics

