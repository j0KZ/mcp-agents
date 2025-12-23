# Meta-Tools Quick Reference

## Overview

Quick reference for the three meta-tools that enable tool discovery in the @j0kz/mcp-agents ecosystem.

## list_capabilities

**Purpose:** Get an overview of all available tool categories and capabilities.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `server` | string | No | Filter to specific server |
| `response_format` | enum | No | `minimal`, `concise`, `detailed` |

### Examples

```javascript
// Full ecosystem overview
list_capabilities({})

// Single server tools
list_capabilities({ server: "security-scanner" })

// Minimal response (just counts)
list_capabilities({ response_format: "minimal" })
```

### Response Structure

```javascript
{
  categories: [
    {
      name: "analysis",
      toolCount: 14,
      description: "Code quality and architecture analysis",
      examples: ["review_file", "analyze_architecture"]
    },
    // ... more categories
  ],
  totalTools: 50,
  hint: "Use search_tools to explore specific categories"
}
```

---

## search_tools

**Purpose:** Find tools by keyword, category, frequency, or server.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Keyword search across tool names/descriptions |
| `category` | string | No | Filter by category name |
| `frequency` | enum | No | `high`, `medium`, `low` |
| `server` | string | No | Filter by server name |
| `limit` | number | No | Max results (default: 10) |
| `response_format` | enum | No | `minimal`, `concise`, `detailed` |

### Search Modes

#### Keyword Search
```javascript
search_tools({ query: "security vulnerability" })
// Returns tools matching the keywords with relevance scores
```

#### Category Browse
```javascript
search_tools({ category: "security" })
// Returns all tools in the security category
```

#### Frequency Filter
```javascript
search_tools({ frequency: "high" })
// Returns always-loaded core tools
```

#### Combined Filters
```javascript
search_tools({
  category: "analysis",
  frequency: "medium",
  limit: 5
})
```

### Response Structure

```javascript
{
  tools: [
    {
      name: "review_file",
      server: "smart-reviewer",
      category: "analysis",
      frequency: "high",
      description: "Review code quality...",
      relevance: 0.95  // Only in keyword search
    }
  ],
  totalMatched: 5,
  totalAvailable: 50
}
```

---

## load_tool

**Purpose:** Load a deferred (low-frequency) tool into the current context.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `toolName` | string | Yes | Name of the tool to load |
| `server` | string | No | Server name (auto-detected if omitted) |

### Examples

```javascript
// Load by name (auto-detect server)
load_tool({ toolName: "design_schema" })

// Load with explicit server
load_tool({
  toolName: "extract_function",
  server: "refactor-assistant"
})
```

### Response Structure

```javascript
{
  success: true,
  toolName: "design_schema",
  server: "db-schema",
  message: "Tool loaded successfully",
  usage: {
    parameters: [...],
    example: "design_schema({ tableName: 'users' })"
  }
}
```

### When to Use

- Tool is marked as `frequency: "low"`
- Search results indicate tool is "deferred"
- You get "tool not found" for a known tool

---

## Comparison Chart

| Aspect | list_capabilities | search_tools | load_tool |
|--------|-------------------|--------------|-----------|
| **Use for** | Overview | Finding | Activating |
| **Input** | Optional filters | Keywords/filters | Tool name |
| **Output** | Categories | Tool list | Load status |
| **When** | Starting out | Looking for tool | Before using deferred |

## Common Patterns

### Pattern 1: First-Time Discovery
```javascript
// 1. See what's available
list_capabilities({})

// 2. Explore interesting category
search_tools({ category: "security" })

// 3. Use a tool
scan_project({ path: "." })
```

### Pattern 2: Task-Based Search
```javascript
// 1. Search by task
search_tools({ query: "generate tests" })

// 2. Pick best match and use
generate_tests({ sourceFile: "src/utils.ts" })
```

### Pattern 3: Load and Use
```javascript
// 1. Find the tool
search_tools({ query: "database schema" })
// → Shows design_schema (deferred)

// 2. Load it
load_tool({ toolName: "design_schema" })

// 3. Use it
design_schema({ tableName: "users" })
```

## Error Handling

### Tool Not Found
```javascript
load_tool({ toolName: "nonexistent" })
// → { success: false, error: "Tool not found", suggestions: [...] }
```

### Invalid Category
```javascript
search_tools({ category: "invalid" })
// → { tools: [], hint: "Valid categories: analysis, security, ..." }
```

## Tips

1. **Use `response_format: "minimal"`** for quick checks
2. **Combine filters** to narrow results: `{ category: "x", frequency: "high" }`
3. **Check frequency** before calling - high frequency tools are always available
4. **Use relevance scores** when keyword searching - higher is better match
