# MCP Tool Discovery & Optimization Guide

This guide provides detailed information about the 50 MCP tools across 9 servers in this monorepo.

---

## Tool Categories

### Available Tool Categories

| Category          | Tools | Examples                                  |
| ----------------- | ----- | ----------------------------------------- |
| **analysis**      | 14    | `review_file`, `analyze_architecture`     |
| **generation**    | 11    | `generate_tests`, `generate_docs`         |
| **security**      | 5     | `scan_file`, `scan_secrets`, `scan_owasp` |
| **refactoring**   | 8     | `extract_function`, `remove_dead_code`    |
| **design**        | 14    | `design_api`, `design_schema`             |
| **orchestration** | 6     | `run_workflow`, `search_tools`            |

---

## Tool Loading Strategy

### High-Frequency Tools (Always Loaded)

These tools are immediately available without loading:
- `review_file` (smart-reviewer)
- `generate_tests` (test-generator)
- `analyze_architecture` (architecture-analyzer)
- `run_workflow` (orchestrator-mcp)

### Low-Frequency Tools (Load on Demand)

Use `load_tool` to activate these when needed:
- All design tools (api-designer, db-schema)
- Refactor-assistant tools
- Documentation generation tools
- Advanced security scanning

---

## Tool Discovery Commands

### Finding Tools by Keyword

```javascript
search_tools({ query: "security vulnerability" })
// Returns: scan_file, scan_secrets, scan_owasp

search_tools({ query: "refactor" })
// Returns: extract_function, simplify_conditionals, remove_dead_code

search_tools({ query: "test" })
// Returns: generate_tests, write_test_file, batch_generate
```

### Loading Deferred Tools

```javascript
// Load a specific tool when needed
load_tool({ toolName: "design_api", server: "api-designer" })

// Load database schema designer
load_tool({ toolName: "design_schema", server: "db-schema" })
```

### Listing All Capabilities

```javascript
// Get complete overview of all available tools
list_capabilities({})

// Filter by server
list_capabilities({ server: "smart-reviewer" })
```

---

## Response Format Optimization

All tools support the `response_format` parameter to dramatically reduce token usage.

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

**Example:**
```javascript
review_file({
  filePath: "src/index.ts",
  config: { response_format: "detailed" }
})
// Output: Full analysis with all issues, suggestions, code snippets, metrics
```

### Token Savings

| Operation | Default (detailed) | With concise | With minimal | Savings |
|-----------|-------------------|--------------|--------------|---------|
| Single file review | ~5000 tokens | ~500 tokens | ~100 tokens | **90-98%** |
| 3-file workflow | ~15,000 tokens | ~1,500 tokens | ~300 tokens | **90-98%** |
| Full project audit | ~50,000 tokens | ~5,000 tokens | ~1,000 tokens | **90-98%** |

---

## Workflow Automation

Instead of calling individual tools, use pre-built workflows for common tasks.

### Available Workflows

#### pre-commit
**Purpose:** Quick checks before committing code
**Time:** ~30-45 seconds
**Tools:** Review + Security scan
**Response Format:** `minimal` (default)

```javascript
run_workflow({
  workflow: "pre-commit",
  files: ["src/changed-file.ts"]
})
// Fast pass/fail checks
```

#### pre-merge
**Purpose:** Comprehensive PR validation
**Time:** ~2-4 minutes
**Tools:** Review + Architecture + Tests
**Response Format:** `concise` (default)

```javascript
run_workflow({
  workflow: "pre-merge",
  files: ["src/**/*.ts"]
})
// Thorough validation with summary
```

#### quality-audit
**Purpose:** Full project quality analysis
**Time:** ~5-10 minutes
**Tools:** Security report + Architecture + Documentation
**Response Format:** `detailed` (default)

```javascript
run_workflow({
  workflow: "quality-audit",
  projectPath: "."
})
// Complete analysis with reports
```

### Custom Workflows

See `.claude/workflows/` for workflow presets with optimized defaults.

---

## Performance Best Practices

### 1. Default to Concise Mode
```javascript
// ✅ GOOD: 90% token savings
review_file({ filePath: "...", config: { response_format: "concise" } })

// ❌ BAD: Wastes 4500 tokens
review_file({ filePath: "..." })
```

### 2. Use Workflows for Multiple Operations
```javascript
// ✅ GOOD: Bundled execution
run_workflow({ workflow: "pre-merge", response_format: "concise" })

// ❌ BAD: 3 separate tool calls
review_file(...)
scan_file(...)
analyze_architecture(...)
```

### 3. Load Tools Only When Needed
```javascript
// ✅ GOOD: Deferred loading
search_tools({ query: "api design" })
load_tool({ toolName: "design_api" })

// ❌ BAD: Loading all 50 tools upfront
```

### 4. Use Minimal for Batch Operations
```javascript
// ✅ GOOD: Minimal output for 20 files
files.forEach(f => review_file({
  filePath: f,
  config: { response_format: "minimal" }
}))

// ❌ BAD: 100,000 tokens for 20 files
files.forEach(f => review_file({ filePath: f }))
```

---

## Tool-Specific Guidelines

### smart-reviewer
**High-frequency tools:** `review_file`, `batch_review`
**Best format:** `concise` for daily use, `detailed` for investigations
**Tip:** Use `batch_review` with `minimal` for large codebases

### test-generator
**High-frequency tool:** `generate_tests`
**Best format:** `concise` (shows test count + coverage estimate)
**Tip:** Use `write_test_file` after reviewing generated tests

### architecture-analyzer
**High-frequency tool:** `analyze_architecture`
**Best format:** `concise` for quick checks, `detailed` for refactoring
**Tip:** Run before major refactoring work

### security-scanner
**Tools:** `scan_file`, `scan_secrets`, `scan_owasp`
**Best format:** `minimal` for CI/CD, `concise` for PR reviews
**Tip:** Always run before merging to main

### orchestrator-mcp
**High-frequency tools:** `run_workflow`, `search_tools`
**Best format:** Inherits from workflow defaults
**Tip:** Create custom workflows in `.claude/workflows/`

---

## Troubleshooting

### Tool Not Found
```
Error: Tool 'design_api' not found
```
**Solution:** Load the tool first with `load_tool({ toolName: "design_api" })`

### Too Much Output
```
Response is 10,000 tokens (too large for context)
```
**Solution:** Use `response_format: "concise"` or `"minimal"`

### Missing Details
```
Concise mode doesn't show enough information
```
**Solution:** Override with `response_format: "detailed"` for specific investigations

---

## Quick Reference

**Find a tool:**
```javascript
search_tools({ query: "keyword" })
```

**Load a tool:**
```javascript
load_tool({ toolName: "tool_name" })
```

**Use a workflow:**
```javascript
run_workflow({ workflow: "pre-commit", response_format: "minimal" })
```

**Optimize output:**
```javascript
tool_name({ ..., config: { response_format: "concise" } })
```

---

**See also:**
- [Project Specifics](.claude/references/project-specifics.md) - Package structure & commands
- [Architecture Patterns](.claude/references/architecture-patterns.md) - Monorepo design patterns
- [Development Workflow](.claude/references/dev-workflow-guide.md) - Best practices & process
