# @j0kz/orchestrator-mcp

> **MCP Workflow Orchestrator** - Chain multiple MCP tools into powerful automated workflows

[![npm](https://img.shields.io/badge/npm-%40j0kz-red)](https://www.npmjs.com/package/@j0kz/orchestrator-mcp)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

Orchestrate code quality, security, testing, and architecture analysis tools into automated workflows that run on git hooks or in your AI editor.

**⚡ Performance**: Saves **25-55 seconds per commit** and **2.5-5 minutes per PR** compared to running MCPs separately. [See benchmark results](../../benchmarks/BENCHMARK_RESULTS.md)

---

## 🚀 Quick Start

### Installation

```bash
npm install -g @j0kz/orchestrator-mcp
```

### Configuration (Claude Code)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "orchestrator-mcp"
    }
  }
}
```

For other editors, see [Configuration](#configuration).

---

## 🎯 What It Does

The Orchestrator MCP enables you to:

- **Run pre-built workflows** - pre-commit, pre-merge, quality-audit
- **Chain multiple MCPs** - smart-reviewer → security-scanner → test-generator
- **Automate code quality** - Trigger from git hooks or AI editor
- **Custom sequences** - Build your own multi-tool workflows

### Example: Pre-commit Workflow

```
User in Claude Code: "Run pre-commit checks on my staged files"

Orchestrator executes:
  1. smart-reviewer (code review)
  2. security-scanner (vulnerability scan)

Returns:
  ✅ Code review: 87/100
  ✅ Security scan: No issues found
```

---

## 📋 Pre-Built Workflows

### 1. `pre-commit` - Fast Local Checks

**When to use:** Before every commit
**Duration:** ~2-5 seconds
**Steps:**
- Code review (moderate severity)
- Security scan

```javascript
// Usage in Claude Code
"Run pre-commit workflow on auth.ts"

// Result
{
  "workflow": "pre-commit",
  "success": true,
  "duration": 3247,
  "steps": [
    { "name": "code-review", "success": true, "score": 85 },
    { "name": "security-scan", "success": true, "issues": 0 }
  ]
}
```

---

### 2. `pre-merge` - Comprehensive PR Validation

**When to use:** Before merging pull requests
**Duration:** ~10-30 seconds
**Steps:**
- Batch code review (strict)
- Architecture analysis (circular dependency detection)
- Security audit (project-wide)
- Test coverage check (70% target)

```javascript
// Usage in Claude Code
"Run pre-merge workflow for this PR"

// Result
{
  "workflow": "pre-merge",
  "success": true,
  "duration": 18234,
  "steps": [
    { "name": "batch-review", "success": true, "avgScore": 91 },
    { "name": "architecture-analysis", "success": true, "circular": 0 },
    { "name": "security-audit", "success": true, "findings": 0 },
    { "name": "test-coverage", "success": true, "coverage": 78 }
  ]
}
```

---

### 3. `quality-audit` - Deep Analysis & Reporting

**When to use:** Weekly/monthly quality reviews
**Duration:** ~30-60 seconds
**Steps:**
- Security report generation (saved to `reports/security.md`)
- Architecture analysis with dependency graph
- Documentation generation

```javascript
// Usage in Claude Code
"Run quality audit on the entire project"

// Result
{
  "workflow": "quality-audit",
  "success": true,
  "duration": 42891,
  "steps": [
    { "name": "security-report", "success": true, "generated": "reports/security.md" },
    { "name": "architecture-analysis", "success": true, "modules": 47 },
    { "name": "generate-docs", "success": true, "files": ["README.md", "API.md"] }
  ]
}
```

---

## 🔧 Custom Workflows

Build your own workflows with `run_sequence`:

```javascript
// Custom workflow: Review → Refactor → Test → Document
{
  "tool": "run_sequence",
  "arguments": {
    "steps": [
      {
        "name": "review",
        "mcp": "smart-reviewer",
        "tool": "review_file",
        "params": { "filePath": "src/auth.ts", "config": { "severity": "strict" } }
      },
      {
        "name": "refactor",
        "mcp": "refactor-assistant",
        "tool": "suggest_refactorings",
        "params": { "code": "..." },
        "dependsOn": ["review"]
      },
      {
        "name": "generate-tests",
        "mcp": "test-generator",
        "tool": "generate_tests",
        "params": { "sourceFile": "src/auth.ts" },
        "dependsOn": ["refactor"]
      },
      {
        "name": "generate-docs",
        "mcp": "doc-generator",
        "tool": "generate_jsdoc",
        "params": { "filePath": "src/auth.ts" }
      }
    ]
  }
}
```

---

## 🛠️ Configuration

### Claude Code

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "orchestrator-mcp"
    }
  }
}
```

**Config location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

```json
{
  "mcpServers": {
    "orchestrator": {
      "command": "orchestrator-mcp"
    }
  }
}
```

**Config location:** Cursor Settings → MCP → Edit Configuration

### Windsurf / VS Code / Other

Follow your editor's MCP configuration guide. The command is always:

```
orchestrator-mcp
```

---

## 📦 Available MCPs

The orchestrator can coordinate these MCP tools:

| MCP | Tool Examples | Purpose |
|-----|---------------|---------|
| `smart-reviewer` | `review_file`, `batch_review` | Code quality analysis |
| `security-scanner` | `scan_file`, `scan_project`, `generate_security_report` | Vulnerability detection |
| `test-generator` | `generate_tests`, `batch_generate` | Test suite generation |
| `architecture-analyzer` | `analyze_architecture` | Dependency & architecture analysis |
| `refactor-assistant` | `suggest_refactorings`, `extract_function` | Code refactoring |
| `doc-generator` | `generate_jsdoc`, `generate_full_docs` | Documentation generation |
| `api-designer` | `generate_openapi`, `design_rest_api` | API design |
| `db-schema` | `design_schema`, `generate_migration` | Database schema design |

**Install MCPs:**
```bash
npm install -g @j0kz/smart-reviewer-mcp
npm install -g @j0kz/security-scanner-mcp
npm install -g @j0kz/test-generator-mcp
# ... or install all at once:
npx @j0kz/mcp-agents@latest
```

---

## 🎮 Usage Examples

### In Claude Code (Natural Language)

```
You: "Review my changes and check for security issues"
Claude: [Calls orchestrator with pre-commit workflow]
Claude: "✅ Code review passed (Score: 87/100). ✅ No security vulnerabilities found."

You: "Prepare this PR for merge"
Claude: [Calls orchestrator with pre-merge workflow]
Claude: "All checks passed! Architecture is clean, tests at 78% coverage, zero security issues."

You: "Analyze my entire project quality"
Claude: [Calls orchestrator with quality-audit workflow]
Claude: "Quality audit complete. Security report saved. Architecture graph generated. Docs updated."
```

### Via JSON-RPC (Programmatic)

```bash
# List available workflows
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"list_workflows","arguments":{}}}' | orchestrator-mcp

# Run pre-commit workflow
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"run_workflow","arguments":{"workflow":"pre-commit","files":["src/auth.ts"]}}}' | orchestrator-mcp
```

---

## 🔗 Git Hook Integration

### Pre-commit Hook (Husky)

```bash
# Install Husky
npm install --save-dev husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npx orchestrator-cli pre-commit"
```

**`.husky/pre-commit`:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

# Run orchestrator (you'll need to build a simple CLI wrapper)
echo "$STAGED_FILES" | npx run-orchestrator-workflow pre-commit
```

---

## 🧪 Testing

The orchestrator is thoroughly tested:

```bash
npm test
```

**Test coverage:**
- MCP-to-MCP communication
- Workflow execution
- Dependency resolution
- Error handling

---

## 📚 API Reference

### Tool: `run_workflow`

Execute a pre-built workflow.

**Parameters:**
- `workflow` (required): `'pre-commit' | 'pre-merge' | 'quality-audit'`
- `files` (required): Array of file paths
- `projectPath` (optional): Project root path (defaults to `'.'`)

**Returns:**
```typescript
{
  workflow: string;
  success: boolean;
  duration: number;
  steps: Array<{
    name: string;
    success: boolean;
    duration: number;
    data?: any;
    error?: string;
  }>;
  errors: string[];
}
```

---

### Tool: `run_sequence`

Execute a custom sequence of MCP tools.

**Parameters:**
- `steps` (required): Array of workflow steps

**Step schema:**
```typescript
{
  name: string;          // Step identifier
  mcp: string;           // MCP name (e.g., 'smart-reviewer')
  tool: string;          // Tool name (e.g., 'review_file')
  params?: any;          // Tool parameters
  dependsOn?: string[];  // Array of step names this depends on
}
```

**Returns:** Same as `run_workflow`

---

### Tool: `list_workflows`

List all available workflows with metadata.

**Parameters:** None

**Returns:**
```typescript
{
  workflows: Array<{
    id: string;
    name: string;
    description: string;
    steps: number;
  }>;
}
```

---

## 🐛 Troubleshooting

### "MCP not installed" error

Install the required MCPs:
```bash
npx @j0kz/mcp-agents@latest
```

### "Workflow timeout" error

Increase timeout in your MCP configuration (if supported by your editor).

### "Circular dependency detected"

Check your `dependsOn` fields in custom workflows. Steps cannot depend on each other circularly.

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](../../CONTRIBUTING.md).

---

## 📄 License

MIT © [j0kz](https://www.npmjs.com/~j0kz)

---

## 🔗 Related Packages

- [@j0kz/smart-reviewer-mcp](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp) - Code quality analysis
- [@j0kz/security-scanner-mcp](https://www.npmjs.com/package/@j0kz/security-scanner-mcp) - Security scanning
- [@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp) - Test generation
- [All MCP Tools](https://github.com/j0KZ/mcp-agents)

---

**Made with ❤️ for AI-powered development**
