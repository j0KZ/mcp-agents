# Tool Discovery Recipes

## Overview

Ready-to-use recipes for common tool discovery scenarios.

## Recipe 1: New Project Setup

**Goal:** Find all tools needed to set up quality checks for a new project.

```javascript
// Step 1: Get high-frequency essentials
search_tools({ frequency: "high" })
// → review_file, generate_tests, analyze_architecture, run_workflow

// Step 2: Find CI/CD related tools
search_tools({ query: "pre-commit workflow" })
// → run_workflow with pre-commit, pre-merge options

// Step 3: Set up quality workflow
run_workflow({
  workflow: "pre-commit",
  targetPath: "."
})
```

**Result:** Project configured with review, tests, and architecture checks.

---

## Recipe 2: Security Audit

**Goal:** Find and run all security-related tools.

```javascript
// Step 1: List security tools
search_tools({ category: "security" })
// → scan_file, scan_project, scan_secrets, scan_vulnerabilities, generate_security_report

// Step 2: Run comprehensive scan
scan_project({
  projectPath: ".",
  config: {
    includeSecrets: true,
    includeOwasp: true
  }
})

// Step 3: Generate report
generate_security_report({
  projectPath: ".",
  format: "markdown"
})
```

---

## Recipe 3: Code Quality Deep Dive

**Goal:** Analyze code quality across multiple dimensions.

```javascript
// Step 1: Find analysis tools
search_tools({ category: "analysis" })

// Step 2: Run in parallel
Promise.all([
  review_file({ filePath: "src/main.ts" }),
  analyze_architecture({ projectPath: "." }),
  find_circular_deps({ projectPath: "." })
])

// Step 3: Get metrics
batch_review({
  filePaths: ["src/**/*.ts"],
  config: { includeMetrics: true }
})
```

---

## Recipe 4: Test Coverage Improvement

**Goal:** Find untested code and generate tests.

```javascript
// Step 1: Find testing tools
search_tools({ query: "test generate coverage" })
// → generate_tests, write_test_file, batch_generate

// Step 2: Generate tests for a file
generate_tests({
  sourceFile: "src/utils.ts",
  config: {
    framework: "vitest",
    coverage: 80,
    includeEdgeCases: true
  }
})

// Step 3: Batch generate for multiple files
batch_generate({
  sourceFiles: [
    "src/helpers.ts",
    "src/validators.ts"
  ]
})
```

---

## Recipe 5: API Design

**Goal:** Design and document a new REST API.

```javascript
// Step 1: Find design tools (likely deferred)
search_tools({ query: "API design REST" })
// → design_rest_api (frequency: low)

// Step 2: Load the tool
load_tool({ toolName: "design_rest_api" })

// Step 3: Design the API
design_rest_api({
  resourceName: "users",
  operations: ["create", "read", "update", "delete", "list"],
  authentication: "jwt"
})

// Step 4: Generate OpenAPI spec
generate_openapi({
  sourceDir: "src/routes",
  outputPath: "docs/api.yaml"
})
```

---

## Recipe 6: Refactoring Session

**Goal:** Clean up and refactor a large file.

```javascript
// Step 1: Find refactoring tools
search_tools({ category: "refactoring" })
// → extract_function, remove_dead_code, rename_symbol, etc.

// Step 2: Load needed tools
load_tool({ toolName: "extract_function" })
load_tool({ toolName: "remove_dead_code" })

// Step 3: Analyze first
review_file({
  filePath: "src/legacy.ts",
  config: { severity: "strict" }
})

// Step 4: Apply refactorings
remove_dead_code({ filePath: "src/legacy.ts" })
extract_function({
  filePath: "src/legacy.ts",
  startLine: 50,
  endLine: 100,
  functionName: "processData"
})
```

---

## Recipe 7: Documentation Sprint

**Goal:** Generate comprehensive documentation.

```javascript
// Step 1: Find documentation tools
search_tools({ category: "documentation" })
// → generate_readme, generate_changelog, generate_api_docs, etc.

// Step 2: Generate all docs
generate_readme({
  projectPath: ".",
  sections: ["installation", "usage", "api", "contributing"]
})

generate_changelog({
  fromTag: "v1.0.0",
  toTag: "HEAD"
})

generate_api_docs({
  sourceDir: "src",
  outputDir: "docs/api"
})
```

---

## Recipe 8: Explore Unknown Codebase

**Goal:** Understand a new codebase quickly.

```javascript
// Step 1: Architecture overview
analyze_architecture({
  projectPath: ".",
  config: {
    generateGraph: true,
    detectCircular: true
  }
})

// Step 2: Find entry points
search_tools({ query: "module dependencies" })
// Use get_module_info for key files

// Step 3: Review critical files
batch_review({
  filePaths: [
    "src/index.ts",
    "src/app.ts",
    "src/server.ts"
  ],
  config: { response_format: "concise" }
})
```

---

## Recipe 9: Pre-Release Checklist

**Goal:** Comprehensive check before releasing.

```javascript
// Step 1: Run full audit workflow
run_workflow({
  workflow: "pre-merge",
  targetPath: "."
})

// Step 2: Security scan
scan_project({
  projectPath: ".",
  config: { includeSecrets: true }
})

// Step 3: Generate release notes
generate_changelog({
  fromTag: "v1.0.0",
  format: "release-notes"
})
```

---

## Recipe 10: Performance Investigation

**Goal:** Find performance issues in code.

```javascript
// Step 1: Find analysis tools
search_tools({ query: "performance complexity" })

// Step 2: Analyze architecture for issues
analyze_architecture({
  projectPath: ".",
  config: {
    detectCircular: true  // Circular deps hurt perf
  }
})

// Step 3: Review hot paths
review_file({
  filePath: "src/hotpath.ts",
  config: {
    severity: "strict",
    includeMetrics: true  // Check complexity
  }
})
```

---

## Quick Reference: Tools by Task

| Task | Primary Tool | Supporting Tools |
|------|--------------|------------------|
| Code review | `review_file` | `batch_review` |
| Testing | `generate_tests` | `write_test_file`, `batch_generate` |
| Security | `scan_project` | `scan_secrets`, `scan_vulnerabilities` |
| Architecture | `analyze_architecture` | `find_circular_deps`, `get_module_info` |
| Refactoring | `extract_function` | `remove_dead_code`, `rename_symbol` |
| Documentation | `generate_readme` | `generate_changelog`, `generate_api_docs` |
| API Design | `design_rest_api` | `generate_openapi` |
| Database | `design_schema` | `generate_migration` |
| Workflows | `run_workflow` | `list_workflows` |
