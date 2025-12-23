---
name: tool-discovery
description: "Guide for discovering and using @j0kz MCP tools efficiently through search, filtering, and progressive exploration. Use when exploring available capabilities, finding the right tool for a task, or ..."
---

# Tool Discovery for @j0kz/mcp-agents

Efficient discovery and exploration of 50 MCP tools across 7 categories using the orchestrator's meta-tools.

## When to Use This Skill

- **First time using @j0kz tools** - Get oriented with capabilities
- **Need a specific capability** - Find the right tool by keyword
- **Exploring a domain** - Browse tools by category
- **Before complex workflows** - Discover available building blocks
- **Training new users** - Introduce the ecosystem systematically

## Quick Start

### 1. Get Overview of All Capabilities

```javascript
Tool: list_capabilities
Input: {}
Output: {
  categories: [
    { name: "analysis", toolCount: 14, examples: ["review_file", "analyze_architecture"] },
    { name: "generation", toolCount: 11, examples: ["generate_tests", "generate_jsdoc"] },
    { name: "security", toolCount: 5, examples: ["scan_project", "scan_secrets"] },
    { name: "refactoring", toolCount: 9, examples: ["extract_function", "remove_dead_code"] },
    { name: "design", toolCount: 6, examples: ["design_rest_api", "design_schema"] },
    { name: "documentation", toolCount: 5, examples: ["generate_readme", "generate_changelog"] },
    { name: "orchestration", toolCount: 7, examples: ["run_workflow", "search_tools"] }
  ],
  totalTools: 50,
  hint: "Use search_tools({ category: \"name\" }) to explore a category"
}
```

### 2. Explore a Category

```javascript
Tool: search_tools
Input: { category: "security" }
Output: {
  tools: [
    { name: "scan_file", server: "security-scanner", frequency: "medium" },
    { name: "scan_project", server: "security-scanner", frequency: "medium" },
    { name: "scan_secrets", server: "security-scanner", frequency: "medium" },
    { name: "scan_vulnerabilities", server: "security-scanner", frequency: "medium" },
    { name: "generate_security_report", server: "security-scanner", frequency: "medium" }
  ],
  totalAvailable: 50
}
```

### 3. Search by Keyword

```javascript
Tool: search_tools
Input: { query: "test coverage" }
Output: {
  tools: [
    { name: "generate_tests", relevance: 0.95 },
    { name: "write_test_file", relevance: 0.88 },
    { name: "batch_generate", relevance: 0.75 }
  ]
}
```

### 4. Load a Deferred Tool

```javascript
Tool: load_tool
Input: { toolName: "design_schema" }
Output: {
  success: true,
  toolName: "design_schema",
  server: "db-schema",
  message: "Tool loaded successfully. You can now use design_schema."
}
```

## Tool Categories

| Category | Description | Example Tools | Count |
|----------|-------------|---------------|-------|
| **analysis** | Code quality, architecture, metrics | review_file, analyze_architecture | 14 |
| **generation** | Create tests, docs, boilerplate | generate_tests, generate_jsdoc | 11 |
| **security** | Vulnerability scanning, secrets | scan_project, scan_secrets | 5 |
| **refactoring** | Code transformation, cleanup | extract_function, remove_dead_code | 9 |
| **design** | API and database schemas | design_rest_api, design_schema | 6 |
| **documentation** | README, CHANGELOG, API docs | generate_readme, generate_changelog | 5 |
| **orchestration** | Workflows, tool coordination | run_workflow, search_tools | 7 |

## Tool Frequency Levels

The ecosystem uses frequency-based loading for efficiency:

| Frequency | Description | Examples | Loading |
|-----------|-------------|----------|---------|
| **high** | Core tools, always needed | review_file, generate_tests | Always loaded |
| **medium** | Common tools, often used | scan_project, generate_readme | Auto-loaded on demand |
| **low** | Specialized tools, rare use | design_schema, extract_function | Manual load via `load_tool` |

### High-Frequency Tools (Always Available)

```javascript
Tool: search_tools
Input: { frequency: "high" }
Output: {
  tools: [
    { name: "review_file", server: "smart-reviewer" },
    { name: "batch_review", server: "smart-reviewer" },
    { name: "generate_tests", server: "test-generator" },
    { name: "analyze_architecture", server: "architecture-analyzer" },
    { name: "run_workflow", server: "orchestrator" },
    { name: "search_tools", server: "orchestrator" },
    { name: "load_tool", server: "orchestrator" },
    { name: "list_capabilities", server: "orchestrator" }
  ]
}
```

## Discovery Patterns

### Pattern 1: Domain-First Exploration

**Use when:** You know the problem domain but not the specific tool

```
1. list_capabilities() → See all categories
2. search_tools({ category: "domain" }) → Browse tools in category
3. [optional] load_tool({ toolName: "..." }) → Load if needed
4. Use the tool
```

**Example:** "I need to check for security issues"
```javascript
// Step 1: Browse security category
search_tools({ category: "security" })
// → Shows: scan_file, scan_project, scan_secrets, etc.

// Step 2: Use appropriate tool
scan_project({ projectPath: "." })
```

### Pattern 2: Keyword Search

**Use when:** You have a specific task or keyword in mind

```
1. search_tools({ query: "your task" }) → Find relevant tools
2. Review relevance scores
3. Select best match
4. Use the tool
```

**Example:** "I want to generate API documentation"
```javascript
// Search for documentation tools
search_tools({ query: "API documentation" })
// → Shows: generate_api_docs, generate_openapi, design_rest_api

// Use the most relevant
generate_api_docs({ sourceDir: "./src" })
```

### Pattern 3: Server-Focused Exploration

**Use when:** You know which server you need but not the specific tool

```javascript
// List all tools from a server
list_capabilities({ server: "security-scanner" })
// → Shows all 5 security-scanner tools with descriptions
```

### Pattern 4: Find High-Impact Tools First

**Use when:** Starting a new project or workflow

```javascript
// Get the essential high-frequency tools
search_tools({ frequency: "high" })
// These are the core tools you'll use most often
```

## Response Format Options

All discovery tools support response format optimization:

```javascript
// Minimal - just counts
list_capabilities({ response_format: "minimal" })
// → { categoryCount: 7, totalTools: 50 }

// Concise - summary without full details
search_tools({ category: "security", response_format: "concise" })
// → { tools: [...names only], totalAvailable: 50 }

// Detailed - full information (default)
list_capabilities({ response_format: "detailed" })
// → Complete categories with descriptions, examples, hints
```

## Common Workflows

### Workflow 1: New User Onboarding

```
1. list_capabilities() → Get ecosystem overview
2. search_tools({ frequency: "high" }) → Learn core tools
3. run_workflow({ focus: "quality" }) → Try a pre-built workflow
```

### Workflow 2: Find Tool for Task

```
1. search_tools({ query: "your task" }) → Search by keyword
2. Review results and relevance
3. load_tool() if needed → Load low-frequency tool
4. Use the tool
```

### Workflow 3: Explore Domain

```
1. list_capabilities() → See categories
2. search_tools({ category: "chosen" }) → Explore category
3. Read tool descriptions
4. Select and use appropriate tools
```

## Meta-Tools Reference

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| **list_capabilities** | Get category overview or server tools | `server?`, `response_format?` |
| **search_tools** | Find tools by keyword/category/frequency | `query?`, `category?`, `frequency?`, `server?`, `limit?` |
| **load_tool** | Load a deferred tool into context | `toolName`, `server?` |

## Tips for Efficient Discovery

1. **Start broad, then narrow** - Use `list_capabilities` first, then `search_tools`
2. **Use relevance scores** - Higher scores mean better keyword matches
3. **Check frequency** - High-frequency tools are always available
4. **Combine filters** - `{ category: "security", frequency: "medium" }`
5. **Use response_format** - "minimal" for quick checks, "detailed" for exploration

## Integration with Workflows

Discovery tools work seamlessly with workflows:

```javascript
// Find workflow-related tools
search_tools({ category: "orchestration" })

// List available workflows
list_workflows()

// Run a workflow
run_workflow({ workflow: "pre-commit" })
```

## See Also

- **Code Quality Pipeline** - For systematic quality improvement
- **MCP Workflow Composition** - For combining tools into workflows
- **MCP Troubleshooting** - When tools aren't working as expected
