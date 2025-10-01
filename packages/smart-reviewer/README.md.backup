# @j0kz/smart-reviewer-mcp

**AI-powered code review with learning capabilities for any MCP-compatible editor.**

[![NPM Version](https://img.shields.io/npm/v/@j0kz/smart-reviewer-mcp)](https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

Part of the [@j0kz MCP Agents](https://github.com/j0kz/mcp-agents) collection.

---

## ✨ Features

- 🔍 **Intelligent Code Review** - Detects anti-patterns, code smells, and potential bugs
- 🎯 **Auto-Fix Suggestions** - Provides detailed fix recommendations with diffs
- 📊 **Code Quality Metrics** - Tracks complexity, maintainability, and readability
- 🧠 **Learning Capabilities** - Adapts to your team's coding style over time
- ⚡ **Fast Analysis** - Reviews files in seconds
- 🎨 **Multi-Language Support** - JavaScript, TypeScript, Python, Go, and more

---

## 🚀 Quick Start

### Claude Code

```bash
# Install globally (recommended)
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user

# Verify installation
claude mcp list
```

### Cursor

Add to `~/.cursor/mcp_config.json`:

```json
{
  "mcpServers": {
    "smart-reviewer": {
      "command": "npx",
      "args": ["@j0kz/smart-reviewer-mcp"]
    }
  }
}
```

### Windsurf

Add to Windsurf settings:

```json
{
  "mcp": {
    "servers": {
      "smart-reviewer": {
        "command": "npx @j0kz/smart-reviewer-mcp"
      }
    }
  }
}
```

### Roo Code / Continue / Other MCP Editors

See [full compatibility guide](https://github.com/j0kz/mcp-agents/blob/main/EDITOR_COMPATIBILITY.md).

---

## 🎯 Usage

Once installed, use through your AI editor's chat:

### Review a File
```
"Review this file for code quality issues"
"Check src/utils.js for anti-patterns"
"Analyze this code and suggest improvements"
```

### Get Specific Feedback
```
"Review this function for performance issues"
"Check for security vulnerabilities"
"Suggest better variable names"
```

### Batch Review
```
"Review all files in src/ directory"
"Check my recent changes for issues"
"Review all TypeScript files"
```

---

## 🛠️ Available MCP Tools

### `mcp__smart-reviewer__review_file`

Review a single file with comprehensive analysis.

**Parameters:**
- `filePath` (required): Path to file to review
- `config` (optional): Review configuration
  - `severity`: "strict" | "moderate" | "lenient" (default: "moderate")
  - `autoFix`: boolean (default: false)
  - `includeMetrics`: boolean (default: true)

**Example:**
```typescript
{
  "filePath": "src/app.js",
  "config": {
    "severity": "strict",
    "includeMetrics": true
  }
}
```

### `mcp__smart-reviewer__batch_review`

Review multiple files at once.

**Parameters:**
- `filePaths` (required): Array of file paths
- `config` (optional): Same as review_file

**Example:**
```typescript
{
  "filePaths": ["src/app.js", "src/utils.js", "src/api.js"],
  "config": {
    "severity": "moderate"
  }
}
```

### `mcp__smart-reviewer__apply_fixes`

Automatically apply suggested fixes to a file.

**Parameters:**
- `filePath` (required): Path to file to fix

**Example:**
```typescript
{
  "filePath": "src/app.js"
}
```

---

## ⚙️ Configuration

### Review Severity Levels

**Strict:**
- Reports all issues including minor style problems
- Best for: Production code, libraries, critical systems

**Moderate (default):**
- Reports medium to high severity issues
- Best for: General development, most projects

**Lenient:**
- Reports only critical issues
- Best for: Prototypes, experiments, learning projects

### Custom Rules

Create a `.smart-reviewer.json` in your project root:

```json
{
  "severity": "strict",
  "autoFix": false,
  "rules": {
    "no-console": "error",
    "complexity": {
      "max": 10
    },
    "naming": {
      "style": "camelCase"
    }
  },
  "ignore": [
    "**/*.test.js",
    "dist/**",
    "node_modules/**"
  ]
}
```

---

## 📊 What Gets Analyzed

### Code Quality
- Cyclomatic complexity
- Cognitive complexity
- Code duplication
- Dead code detection

### Best Practices
- Naming conventions
- Function length
- Parameter count
- Nesting depth

### Potential Issues
- Unused variables
- Type errors
- Security vulnerabilities
- Performance bottlenecks

### Style & Maintainability
- Consistent formatting
- Clear logic flow
- Proper error handling
- Documentation completeness

---

## 🔧 Troubleshooting

### MCP Not Connecting

```bash
# Verify package is installed
npx @j0kz/smart-reviewer-mcp --version

# Check Node.js version (18+ required)
node --version

# Test MCP server directly
npx @modelcontextprotocol/inspector npx @j0kz/smart-reviewer-mcp
```

### No Issues Detected

- Try increasing severity: set `severity: "strict"`
- Check file path is correct
- Ensure file has actual code (not empty)

### Performance Issues

- Use batch review for multiple files instead of individual reviews
- Enable caching in configuration
- Limit analysis to specific directories

---

## 📦 Related Packages

Part of the @j0kz MCP Agents suite:

- **[@j0kz/test-generator-mcp](https://www.npmjs.com/package/@j0kz/test-generator-mcp)** - Automated test generation
- **[@j0kz/architecture-analyzer-mcp](https://www.npmjs.com/package/@j0kz/architecture-analyzer-mcp)** - Architecture analysis

Install all at once:
```bash
claude mcp add smart-reviewer "npx @j0kz/smart-reviewer-mcp" --scope user
claude mcp add test-generator "npx @j0kz/test-generator-mcp" --scope user
claude mcp add architecture-analyzer "npx @j0kz/architecture-analyzer-mcp" --scope user
```

---

## 🤝 Contributing

Contributions welcome! Please visit the [main repository](https://github.com/j0kz/mcp-agents).

---

## 📝 License

MIT © [j0kz](https://www.npmjs.com/~j0kz)

---

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/@j0kz/smart-reviewer-mcp
- **GitHub**: https://github.com/j0kz/mcp-agents
- **Issues**: https://github.com/j0kz/mcp-agents/issues
- **All Packages**: https://www.npmjs.com/~j0kz
- **MCP Specification**: https://modelcontextprotocol.io/
