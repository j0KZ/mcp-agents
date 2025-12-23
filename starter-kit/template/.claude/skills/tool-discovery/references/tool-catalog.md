# Complete Tool Catalog

## Overview

Full catalog of all 50+ MCP tools in the @j0kz/mcp-agents ecosystem, organized by server and category.

## Tools by Server

### smart-reviewer (Analysis)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `review_file` | high | Review a single file for code quality issues |
| `batch_review` | high | Review multiple files at once |
| `apply_fixes` | medium | Apply auto-fixes from review results |
| `generate_auto_fixes` | medium | Preview fixes using Pareto principle |
| `apply_auto_fixes` | medium | Apply generated fixes with backup |

### test-generator (Generation)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `generate_tests` | high | Generate test suite for a source file |
| `write_test_file` | medium | Generate and write tests to file |
| `batch_generate` | medium | Generate tests for multiple files |

### architecture-analyzer (Analysis)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `analyze_architecture` | high | Analyze project architecture and dependencies |
| `get_module_info` | medium | Get detailed info about a specific module |
| `find_circular_deps` | medium | Find all circular dependencies |

### security-scanner (Security)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `scan_file` | medium | Scan a single file for vulnerabilities |
| `scan_project` | medium | Scan entire project for security issues |
| `scan_secrets` | medium | Detect hardcoded secrets and credentials |
| `scan_vulnerabilities` | medium | Check for known CVEs in dependencies |
| `scan_owasp` | medium | Check for OWASP Top 10 vulnerabilities |

### doc-generator (Documentation)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `generate_jsdoc` | medium | Generate JSDoc comments for functions |
| `generate_readme` | medium | Generate or update README.md |
| `generate_changelog` | medium | Generate CHANGELOG from git history |
| `generate_api_docs` | low | Generate API documentation |
| `generate_wiki` | low | Generate wiki pages |

### refactor-assistant (Refactoring)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `extract_function` | low | Extract code block into function |
| `extract_variable` | low | Extract expression into variable |
| `inline_variable` | low | Inline a variable usage |
| `rename_symbol` | low | Rename across codebase |
| `remove_dead_code` | low | Remove unused code |
| `simplify_conditionals` | low | Simplify complex conditionals |
| `convert_to_async` | low | Convert callbacks to async/await |
| `extract_interface` | low | Extract interface from class |

### api-designer (Design)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `design_rest_api` | low | Design RESTful API endpoints |
| `design_graphql` | low | Design GraphQL schema |
| `generate_openapi` | low | Generate OpenAPI specification |
| `validate_api` | low | Validate API against best practices |

### db-schema (Design)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `design_schema` | low | Design database schema |
| `generate_migration` | low | Generate migration files |
| `analyze_schema` | low | Analyze existing schema |
| `optimize_queries` | low | Suggest query optimizations |

### orchestrator-mcp (Orchestration)

| Tool | Frequency | Description |
|------|-----------|-------------|
| `run_workflow` | high | Run a pre-built workflow |
| `list_workflows` | high | List available workflows |
| `search_tools` | high | Search for tools by keyword/category |
| `list_capabilities` | high | List all capabilities |
| `load_tool` | high | Load a deferred tool |
| `create_workflow` | low | Create custom workflow |

---

## Tools by Category

### Analysis (14 tools)

Core analysis and review capabilities.

```
smart-reviewer:
  - review_file ⭐
  - batch_review ⭐
  - apply_fixes
  - generate_auto_fixes
  - apply_auto_fixes

architecture-analyzer:
  - analyze_architecture ⭐
  - get_module_info
  - find_circular_deps

(⭐ = high frequency, always loaded)
```

### Generation (11 tools)

Code and documentation generation.

```
test-generator:
  - generate_tests ⭐
  - write_test_file
  - batch_generate

doc-generator:
  - generate_jsdoc
  - generate_readme
  - generate_changelog
  - generate_api_docs
  - generate_wiki
```

### Security (5 tools)

Security scanning and vulnerability detection.

```
security-scanner:
  - scan_file
  - scan_project
  - scan_secrets
  - scan_vulnerabilities
  - scan_owasp
```

### Refactoring (8 tools)

Code transformation and cleanup.

```
refactor-assistant:
  - extract_function
  - extract_variable
  - inline_variable
  - rename_symbol
  - remove_dead_code
  - simplify_conditionals
  - convert_to_async
  - extract_interface
```

### Design (8 tools)

API and database design.

```
api-designer:
  - design_rest_api
  - design_graphql
  - generate_openapi
  - validate_api

db-schema:
  - design_schema
  - generate_migration
  - analyze_schema
  - optimize_queries
```

### Orchestration (6 tools)

Workflow and tool coordination.

```
orchestrator-mcp:
  - run_workflow ⭐
  - list_workflows ⭐
  - search_tools ⭐
  - list_capabilities ⭐
  - load_tool ⭐
  - create_workflow
```

---

## Tools by Frequency

### High Frequency (Always Loaded)

These 8 tools are always available:

| Tool | Server | Category |
|------|--------|----------|
| `review_file` | smart-reviewer | analysis |
| `batch_review` | smart-reviewer | analysis |
| `generate_tests` | test-generator | generation |
| `analyze_architecture` | architecture-analyzer | analysis |
| `run_workflow` | orchestrator-mcp | orchestration |
| `list_workflows` | orchestrator-mcp | orchestration |
| `search_tools` | orchestrator-mcp | orchestration |
| `list_capabilities` | orchestrator-mcp | orchestration |
| `load_tool` | orchestrator-mcp | orchestration |

### Medium Frequency (Auto-Loaded)

Loaded automatically when needed:

- All security-scanner tools
- `apply_fixes`, `generate_auto_fixes`, `apply_auto_fixes`
- `write_test_file`, `batch_generate`
- `get_module_info`, `find_circular_deps`
- `generate_jsdoc`, `generate_readme`, `generate_changelog`

### Low Frequency (Manual Load)

Require explicit `load_tool` call:

- All refactor-assistant tools
- All api-designer tools
- All db-schema tools
- `generate_api_docs`, `generate_wiki`
- `create_workflow`

---

## Pre-Built Workflows

Available through `run_workflow`:

| Workflow | Tools Used | Duration |
|----------|------------|----------|
| `pre-commit` | review_file, scan_secrets | ~30s |
| `pre-merge` | batch_review, analyze_architecture, generate_tests | ~2min |
| `quality-audit` | batch_review, analyze_architecture, scan_project | ~3min |
| `security-audit` | scan_project, scan_secrets, scan_vulnerabilities | ~1min |
| `full-audit` | All analysis + security + architecture | ~5min |

---

## Tool Parameters Quick Reference

### Common Parameters

Most tools accept these optional parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `response_format` | enum | `minimal`, `concise`, `detailed` |
| `config` | object | Tool-specific configuration |

### File-Based Tools

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Single file path |
| `filePaths` | string[] | Multiple file paths |
| `projectPath` | string | Project root directory |

### Output Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `outputPath` | string | Where to write output |
| `format` | string | Output format (json, markdown, etc.) |

---

## Version Compatibility

| Server | Version | Status |
|--------|---------|--------|
| smart-reviewer | 1.1.x | Stable |
| test-generator | 1.1.x | Stable |
| architecture-analyzer | 1.1.x | Stable |
| security-scanner | 1.1.x | Stable |
| doc-generator | 1.1.x | Stable |
| refactor-assistant | 1.1.x | Stable |
| api-designer | 1.1.x | Stable |
| db-schema | 1.1.x | Stable |
| orchestrator-mcp | 1.1.x | Stable |
