# MCP Tool Discovery & Optimization Guide

**Universal guide for using MCP tools efficiently in any project**

---

## Tool Discovery

If your project uses MCP (Model Context Protocol) tools, use these commands to discover and load them efficiently.

### Finding Tools

```javascript
search_tools({ query: "security" })      // Find security-related tools
search_tools({ query: "test" })          // Find testing tools
search_tools({ query: "refactor" })      // Find refactoring tools
```

### Loading Tools

```javascript
load_tool({ toolName: "tool_name" })     // Load a specific tool
list_capabilities({})                     // List all available tools
```

---

## Response Format Optimization

**All MCP tools support the `response_format` parameter to reduce context token usage.**

### Format Levels

| Format | Tokens | Use Case | Details Included |
|--------|--------|----------|------------------|
| **minimal** | ~100 | Batch operations, CI/CD, quick checks | Success/fail + key metric only |
| **concise** | ~500 | Daily development, PR reviews | Summary without full details |
| **detailed** | ~5000 | Deep investigation, learning | Complete analysis with all data |

### When to Use Each Format

#### Use `minimal` for:
- Pre-commit hooks (fast checks)
- Batch processing multiple files
- CI/CD pipelines (pass/fail only)
- Quick health checks
- Automated validations

**Example:**
```javascript
review_file({
  filePath: "src/index.ts",
  config: { response_format: "minimal" }
})
// Output: { score: 8.5, issueCount: 3 }
```

#### Use `concise` for:
- Daily development workflow
- PR reviews (focus on critical issues)
- Quick code audits
- Team code reviews
- Regular development checks

**Example:**
```javascript
review_file({
  filePath: "src/index.ts",
  config: { response_format: "concise" }
})
// Output: { score: 8.5, issueCount: 3, criticalIssues: [...], metrics: {...} }
```

#### Use `detailed` for:
- Deep investigation of specific issues
- Learning unfamiliar codebases
- Architectural analysis
- Security audits
- Full documentation generation

---

## Token Savings

| Operation | Default (detailed) | With concise | With minimal | Savings |
|-----------|-------------------|--------------|--------------|---------|
| Single file review | ~5000 tokens | ~500 tokens | ~100 tokens | **90-98%** |
| 3-file workflow | ~15,000 tokens | ~1,500 tokens | ~300 tokens | **90-98%** |
| Full project audit | ~50,000 tokens | ~5,000 tokens | ~1,000 tokens | **90-98%** |

---

## Workflow Automation

Instead of calling individual tools, use pre-built workflows for common tasks.

### Available Workflows

See `.claude/workflows/` for workflow presets with optimized defaults:

- **pre-commit.json** - Quick checks with minimal output
- **pre-merge.json** - Comprehensive validation with concise output
- **deep-audit.json** - Full analysis with detailed output

**Usage:**
```javascript
run_workflow({ workflow: "pre-commit" })   // Uses minimal by default
run_workflow({ workflow: "pre-merge" })    // Uses concise by default
```

---

## Performance Best Practices

### 1. Default to Concise Mode
```javascript
// ✅ GOOD: 90% token savings
tool_name({ ..., config: { response_format: "concise" } })

// ❌ BAD: Wastes 4500 tokens
tool_name({ ... })
```

### 2. Use Workflows for Multiple Operations
```javascript
// ✅ GOOD: Bundled execution
run_workflow({ workflow: "pre-merge", response_format: "concise" })

// ❌ BAD: Multiple separate tool calls
review_file(...)
scan_file(...)
analyze_architecture(...)
```

### 3. Use Minimal for Batch Operations
```javascript
// ✅ GOOD: Minimal output for 20 files
files.forEach(f => review_file({
  filePath: f,
  config: { response_format: "minimal" }
}))
```

---

## Project-Specific Configuration

For project-specific MCP tool configurations, see [project-specifics.md](./project-specifics.md)
